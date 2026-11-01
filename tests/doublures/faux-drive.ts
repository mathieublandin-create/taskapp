import { gunzipSync, gzipSync } from 'node:zlib';
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import { Instant } from '@src/commun/domaine/temps/instant';
import type {
  Changements,
  ElementDrive,
  ErreurTransport,
  FichierAppareilDistant,
  FichierDepose,
  IdFichierDrive,
  InventaireDossier,
  ManifesteDistant,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
} from '@src/synchronisation/domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  decoderManifeste,
  encoderFichierAppareil,
  encoderManifeste,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import type { TempsSimule } from '../support/banc/temps-simule';

type Conditions = { readonly reseau: EtatReseau; readonly accesAccorde: () => boolean };

const TYPE_DOSSIER = 'application/vnd.google-apps.folder';
const TYPE_GZIP = 'application/gzip';
const TYPE_JSON = 'application/json';
const NOM_MANIFESTE = 'manifeste.json';
const NOM_LISEZ_MOI = 'LISEZ-MOI.txt';
const TEXTE_LISEZ_MOI =
  "Ce dossier contient les données de l'application Done Juan. Ne modifiez pas ces fichiers : " +
  "l'application les gère seule.";

/** Fichier du Drive simulé (API d'observation). */
export type FichierFaux = {
  readonly id: string;
  readonly nom: string;
  readonly mimeType: string;
  readonly appProperties: Readonly<Record<string, string>>;
  readonly parent?: string;
  readonly octets: Uint8Array;
  readonly creeA: number;
  readonly modifieA: number;
  readonly supprime: boolean;
  /** Incrément 3 : `version` Drive, augmentée à chaque création ou remplacement (et à la modification à la main). */
  readonly version: string;
};

type NouveauFichier = Pick<FichierFaux, 'nom' | 'mimeType' | 'appProperties' | 'octets'> & {
  readonly parent?: string;
};

/** Dépôt du fichier d'un appareil (paramètre de `deposerFichierAppareil`). */
type Depot = Parameters<TransportSynchro['deposerFichierAppareil']>[0];

/** Traitement d'un dépôt écrit : réponse perdue, ou rappel attendu avant la réponse. */
type ApresDepot =
  { readonly type: 'PERDRE' } | { readonly type: 'RAPPEL'; readonly rappel: () => Promise<void> };

/**
 * Doublure du port TransportSynchro, Drive d'un compte (ST-US-022 §12.3, ST-US-017 §12.3).
 * Contrat : tests/contrats/transport-synchro.contrat.ts.
 * - `transportPour(appareil, conditions)` : vue d'un appareil ; réseau coupé → ReseauIndisponible ;
 *   `accesAccorde()` faux → NonAutorise ; chaque appel réussi ou en erreur métier compte une réponse ;
 * - les fichiers d'appareil et le manifeste sont produits et relus par encoder/decoder du format v1 réel ;
 * - journal des changements : chaque création ou remplacement reçoit un numéro de séquence ; un jeton est
 *   `<époque>:<séquence>` ; `invaliderJetons()` change d'époque ;
 * - pilotage : `plein()` / `liberer()` (dépôt → EspaceDrivePlein) ; `indisponible(n | 'toujours')` (les n appels
 *   suivants → ServeurIndisponible ; `retablir()` arrête) ; `interrompreDepots(n)` (les n dépôts suivants →
 *   ReseauIndisponible, sans rien écrire) ; `perdreReponseDuProchainDepot()` (le dépôt suivant est écrit,
 *   mais l'appel renvoie ReseauIndisponible) ; `avantReponseDuProchainDepot(rappel)` (le dépôt suivant est écrit,
 *   puis le rappel est attendu avant la réponse) ; `desactiverPourLeCompte()` (tout appel → DriveIndisponible) ;
 * - observation : `fichiers()`, `nombreReponses(appareil)`, `ecrituresPar(appareil)` (créations et remplacements).
 * - incrément 3 (ST-US-017 v0.10 §12.6) : `version` par fichier ; `listerDossiers`, `inventorierDossier`,
 *   `lireContenuManifeste`, `supprimerFichier` ; ordre canonique (créé le plus tôt, puis id) pour le dossier et le
 *   manifeste ; altérations `supprimerDonnees()`, `rendreDonneesIllisibles()`, `supprimerDossiers()`,
 *   `modifierDelaiALaMain(id, objectif, delai)` ; doublons `ajouterDossier`, `ajouterManifeste` ; lectures comptées
 *   (`lecturesDe(id, appareil)`), création concurrente d'un manifeste (`avantLaProchaineCreationDeManifeste`) ;
 *   suppressions comptées dans `ecrituresPar`.
 */
export class FauxDrive {
  readonly #fichiers: Array<FichierFaux> = [];
  readonly #reponses = new Map<IdAppareil, number>();
  readonly #ecritures = new Map<IdAppareil, number>();
  /** Fichier modifié par numéro de séquence. */
  readonly #changements: Array<{ readonly sequence: number; readonly id: string }> = [];
  #sequence = 0;
  #epoque = 0;
  #indisponibles: number | 'toujours' = 0;
  #desactive = false;
  #plein = false;
  #depotsInterrompus = 0;
  #apresProchainDepot: ApresDepot | undefined;
  #pendantInventaire: (() => Promise<void>) | undefined;
  #numero = 0;
  #version = 0;
  readonly #lectures = new Map<string, number>();
  #avantCreationManifeste: (() => Promise<void>) | undefined;

  constructor(private readonly temps: TempsSimule) {}

  transportPour(appareil: IdAppareil, conditions: Conditions): TransportSynchro {
    const appeler = <T>(operation: () => Promise<Resultat<T, ErreurTransport>>) =>
      this.#appeler(appareil, conditions, operation);
    return {
      preparerDossier: () => appeler(() => Promise.resolve(this.#preparerDossier(appareil))),
      listerFichiersAppareils: (dossier) => appeler(() => this.#lister(dossier)),
      changements: (dossier, jeton) =>
        appeler(() => Promise.resolve(this.#changementsDepuis(dossier, jeton))),
      lireFichierAppareil: (id) => appeler(() => this.#lireFichierAppareil(appareil, id)),
      deposerFichierAppareil: (p) => this.#deposer(appareil, conditions, p),
      lireManifeste: (dossier) => appeler(() => this.#lireManifeste(appareil, dossier)),
      ecrireManifeste: (p) => appeler(() => this.#ecrireManifeste(appareil, p)),
      listerDossiers: () => appeler(() => Promise.resolve(succes(this.#dossiers().map(element)))),
      inventorierDossier: (dossier) =>
        appeler(() => Promise.resolve(succes(this.#inventaire(dossier)))),
      lireContenuManifeste: (id) => appeler(() => this.#lireContenuManifeste(appareil, id)),
      supprimerFichier: (id) => appeler(() => Promise.resolve(this.#supprimer(appareil, id))),
    };
  }

  // ------------------------------------------------------------------ Pilotage

  plein(): void {
    this.#plein = true;
  }

  liberer(): void {
    this.#plein = false;
  }

  indisponible(fois: number | 'toujours'): void {
    this.#indisponibles = fois;
  }

  retablir(): void {
    this.#indisponibles = 0;
  }

  interrompreDepots(n: number): void {
    this.#depotsInterrompus = n;
  }

  perdreReponseDuProchainDepot(): void {
    this.#apresProchainDepot = { type: 'PERDRE' };
  }

  avantReponseDuProchainDepot(rappel: () => Promise<void>): void {
    this.#apresProchainDepot = { type: 'RAPPEL', rappel };
  }

  /** Change une valeur du JSON du fichier, en gardant un gzip valide et l'ancienne empreinte (V-02, incrément 3). */
  modifierFichierALaMain(id: string): void {
    const fichier = this.#trouver(id);
    if (fichier === undefined) throw new Error(`Fichier simulé inconnu : ${id}`);
    const compresse = fichier.mimeType === TYPE_GZIP;
    const texte = Buffer.from(compresse ? gunzipSync(fichier.octets) : fichier.octets).toString(
      'utf8',
    );
    const objet = JSON.parse(texte) as Record<string, unknown>;
    objet['versionApplication'] = 'modifié à la main';
    const modifie = Buffer.from(JSON.stringify(objet), 'utf8');
    this.#remplacer(fichier, new Uint8Array(compresse ? gzipSync(modifie) : modifie));
  }

  /**
   * US-017 S18 à S22d (« supprimées ») : le manifeste, tous les fichiers d'appareil et LISEZ-MOI de tous les dossiers
   * sont mis à la corbeille ; les dossiers restent.
   */
  supprimerDonnees(): void {
    this.#fichiers
      .filter((f) => !f.supprime && f.mimeType !== TYPE_DOSSIER)
      .forEach((f) => {
        this.#marquerSupprime(f);
      });
  }

  /** US-017 S18 (« rendues illisibles ») : manifeste et fichiers d'appareil remplacés par des octets non gzip, non JSON. */
  rendreDonneesIllisibles(): void {
    this.#fichiers
      .filter(
        (f) =>
          !f.supprime &&
          (f.appProperties['donejuan'] === 'manifeste' ||
            f.appProperties['donejuan'] === 'appareil'),
      )
      .forEach((f) => {
        this.#remplacer(f, new TextEncoder().encode('illisible'));
      });
  }

  /** Dossiers « Done Juan » mis à la corbeille avec tout leur contenu (parcours P-11 : dossier supprimé par erreur). */
  supprimerDossiers(): void {
    this.#dossiers().forEach((d) => {
      this.#marquerSupprime(d);
    });
  }

  /**
   * US-017 S33 : dans le fichier `id`, le délai du registre `delai` de l'objectif `objectif` devient `delai`
   * (AAAA-MM-JJ), gzip valide et ancienne empreinte conservée (fichier lisible, empreinte fausse).
   */
  modifierDelaiALaMain(id: string, objectif: string, delai: string): void {
    const fichier = this.#trouver(id);
    if (fichier === undefined) throw new Error(`Fichier simulé inconnu : ${id}`);
    const objet = JSON.parse(Buffer.from(gunzipSync(fichier.octets)).toString('utf8')) as {
      registres: Array<{ type: string; id: string; champ: string; valeur: unknown }>;
    };
    const registre = objet.registres.find(
      (r) => r.type === 'OBJECTIF' && r.id === objectif && r.champ === 'delai',
    );
    if (registre === undefined) throw new Error(`Délai de l'objectif ${objectif} absent de ${id}`);
    registre.valeur = delai;
    this.#remplacer(fichier, new Uint8Array(gzipSync(Buffer.from(JSON.stringify(objet), 'utf8'))));
  }

  /** Doublon (DAT §4.2.2 d) : dossier « Done Juan » créé par `appareil` à l'instant `creeA` (millisecondes). */
  ajouterDossier(appareil: IdAppareil, creeA: number): IdFichierDrive {
    return this.#creer(
      appareil,
      {
        nom: 'Done Juan',
        mimeType: TYPE_DOSSIER,
        appProperties: { donejuan: 'dossier' },
        octets: new Uint8Array(),
      },
      creeA,
    ).id as IdFichierDrive;
  }

  /** Doublon (DAT §4.2.2 d) : manifeste supplémentaire de `dossier`, créé par `appareil` à l'instant `creeA`. */
  async ajouterManifeste(
    appareil: IdAppareil,
    dossier: IdFichierDrive,
    contenu: ContenuManifeste,
    creeA: number,
  ): Promise<IdFichierDrive> {
    return this.#creer(
      appareil,
      {
        nom: NOM_MANIFESTE,
        mimeType: TYPE_JSON,
        appProperties: { donejuan: 'manifeste' },
        parent: dossier,
        octets: await encoderManifeste(contenu),
      },
      creeA,
    ).id as IdFichierDrive;
  }

  /**
   * v0.10.1, condition C8 (DAT §4.2.2 b) : fichier d'appareil supplémentaire de `appareil` dans `dossier` (création
   * interrompue dont l'identifiant n'a pas été mémorisé), créé à l'instant `creeA` (millisecondes, par défaut
   * maintenant) ; `'ILLISIBLE'` : octets non gzip. Aucun autre fichier de l'appareil n'est remplacé.
   */
  async ajouterFichierAppareil(
    appareil: IdAppareil,
    dossier: IdFichierDrive,
    contenu: ContenuFichierAppareil | 'ILLISIBLE',
    creeA?: number,
  ): Promise<IdFichierDrive> {
    return this.#creer(
      appareil,
      {
        nom: `${appareil}.etat.json.gz`,
        mimeType: TYPE_GZIP,
        appProperties: { donejuan: 'appareil', appareil },
        parent: dossier,
        octets:
          contenu === 'ILLISIBLE'
            ? new TextEncoder().encode('illisible')
            : await encoderFichierAppareil(contenu),
      },
      creeA,
    ).id as IdFichierDrive;
  }

  /**
   * RL-LOT-001-A3 : `rappel` est exécuté une fois, au prochain `listerFichiersAppareils`, après la prise du jeton
   * de départ et avant l'inventaire (simule une écriture d'un autre appareil pendant l'inventaire).
   */
  pendantLeProchainInventaire(rappel: () => Promise<void>): void {
    this.#pendantInventaire = rappel;
  }

  /** RL-LOT-001-A3 : tous les jetons de changements émis jusqu'ici deviennent invalides (JetonChangementsInvalide). */
  invaliderJetons(): void {
    this.#epoque += 1;
  }

  desactiverPourLeCompte(): void {
    this.#desactive = true;
  }

  // ------------------------------------------------------------------ Observation

  fichiers(): ReadonlyArray<FichierFaux> {
    return [...this.#fichiers];
  }

  nombreReponses(appareil: IdAppareil): number {
    return this.#reponses.get(appareil) ?? 0;
  }

  ecrituresPar(appareil: IdAppareil): number {
    return this.#ecritures.get(appareil) ?? 0;
  }

  /** Nombre de lectures du contenu du fichier `id` (fichier d'appareil ou manifeste) par `appareil`. */
  lecturesDe(id: string, appareil: IdAppareil): number {
    return this.#lectures.get(`${appareil}|${id}`) ?? 0;
  }

  /**
   * Exécute `rappel` une fois, juste avant la prochaine création d'un manifeste (simule la création concurrente d'un
   * doublon par un autre appareil, DAT §4.2.2 d).
   */
  avantLaProchaineCreationDeManifeste(rappel: () => Promise<void>): void {
    this.#avantCreationManifeste = rappel;
  }

  /** Fichier d'appareil non supprimé de `appareil` (le premier en ordre canonique), ou undefined. */
  fichierDe(appareil: IdAppareil): FichierFaux | undefined {
    return this.#fichiers
      .filter(
        (f) =>
          !f.supprime &&
          f.appProperties['donejuan'] === 'appareil' &&
          f.appProperties['appareil'] === appareil,
      )
      .sort(canonique)[0];
  }

  /** Dossiers « Done Juan » non supprimés, en ordre canonique. */
  dossiers(): ReadonlyArray<FichierFaux> {
    return this.#dossiers();
  }

  // ------------------------------------------------------------------ Opérations

  async #appeler<T>(
    appareil: IdAppareil,
    conditions: Conditions,
    operation: () => Promise<Resultat<T, ErreurTransport>>,
  ): Promise<Resultat<T, ErreurTransport>> {
    const refus = this.#refus(conditions);
    if (refus?.type === 'ReseauIndisponible') return echec(refus);
    this.#reponses.set(appareil, this.nombreReponses(appareil) + 1);
    if (refus !== undefined) return echec(refus);
    return operation();
  }

  #refus(conditions: Conditions): ErreurTransport | undefined {
    if (!conditions.reseau.estConnecte()) return { type: 'ReseauIndisponible' };
    if (!conditions.accesAccorde()) return { type: 'NonAutorise' };
    if (this.#desactive) return { type: 'DriveIndisponible' };
    if (this.#indisponibles === 'toujours') return { type: 'ServeurIndisponible' };
    if (this.#indisponibles > 0) {
      this.#indisponibles -= 1;
      return { type: 'ServeurIndisponible' };
    }
    return undefined;
  }

  /** Recherche le dossier de l'application (le plus ancien non supprimé), le crée à la racine s'il manque. */
  #preparerDossier(appareil: IdAppareil): Resultat<IdFichierDrive, ErreurTransport> {
    const existant = this.#dossiers()[0];
    const dossier =
      existant ??
      this.#creer(appareil, {
        nom: 'Done Juan',
        mimeType: TYPE_DOSSIER,
        appProperties: { donejuan: 'dossier' },
        octets: new Uint8Array(),
      });
    return succes(dossier.id as IdFichierDrive);
  }

  async #lister(dossier: IdFichierDrive): Promise<Resultat<Changements, ErreurTransport>> {
    const jeton = this.#jeton();
    const rappel = this.#pendantInventaire;
    this.#pendantInventaire = undefined;
    if (rappel !== undefined) await rappel();
    const fichiers = this.#fichiersAppareils(dossier).map(distant);
    return succes({ fichiers, jeton });
  }

  #changementsDepuis(
    dossier: IdFichierDrive,
    jeton: string,
  ): Resultat<Changements, ErreurTransport> {
    const [epoque, sequence] = jeton.split(':').map(Number);
    if (epoque !== this.#epoque || sequence === undefined || !Number.isInteger(sequence)) {
      return echec({ type: 'JetonChangementsInvalide' });
    }
    const modifies = new Set(
      this.#changements.filter((c) => c.sequence > sequence).map((c) => c.id),
    );
    const fichiers = this.#fichiersAppareils(dossier)
      .filter((f) => modifies.has(f.id))
      .map(distant);
    return succes({ fichiers, jeton: this.#jeton() });
  }

  async #lireFichierAppareil(
    appareil: IdAppareil,
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>> {
    const fichier = this.#trouver(id);
    if (fichier === undefined) return echec({ type: 'RessourceIntrouvable' });
    this.#compterLecture(appareil, id);
    return decoderFichierAppareil(fichier.octets);
  }

  async #lireContenuManifeste(
    appareil: IdAppareil,
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuManifeste, ErreurTransport>> {
    const fichier = this.#trouver(id);
    if (fichier === undefined) return echec({ type: 'RessourceIntrouvable' });
    this.#compterLecture(appareil, id);
    return decoderManifeste(fichier.octets);
  }

  #inventaire(dossier: IdFichierDrive): InventaireDossier {
    const enfants = this.#fichiers.filter((f) => !f.supprime && f.parent === dossier);
    return {
      manifestes: enfants
        .filter((f) => f.appProperties['donejuan'] === 'manifeste')
        .sort(canonique)
        .map(element),
      fichiers: enfants
        .filter((f) => f.appProperties['donejuan'] === 'appareil')
        .sort(canonique)
        .map(distant),
    };
  }

  /** Corbeille (un dossier entraîne son contenu) ; déjà absent : succès. Compté dans `ecrituresPar`. */
  #supprimer(appareil: IdAppareil, id: IdFichierDrive): Resultat<undefined, ErreurTransport> {
    const fichier = this.#trouver(id);
    if (fichier === undefined) return succes(undefined);
    this.#compterEcriture(appareil);
    this.#marquerSupprime(fichier);
    return succes(undefined);
  }

  async #deposer(
    appareil: IdAppareil,
    conditions: Conditions,
    p: Depot,
  ): Promise<Resultat<FichierDepose, ErreurTransport>> {
    if (conditions.reseau.estConnecte() && this.#depotsInterrompus > 0) {
      this.#depotsInterrompus -= 1;
      return echec({ type: 'ReseauIndisponible' });
    }
    const ecrit = await this.#appeler(appareil, conditions, () =>
      this.#ecrireFichierAppareil(appareil, p),
    );
    if (!ecrit.ok) return ecrit;
    const apres = this.#apresProchainDepot;
    this.#apresProchainDepot = undefined;
    if (apres?.type === 'PERDRE') return echec({ type: 'ReseauIndisponible' });
    if (apres?.type === 'RAPPEL') await apres.rappel();
    return ecrit;
  }

  async #ecrireFichierAppareil(
    appareil: IdAppareil,
    { dossier, contenu, fichierExistant }: Depot,
  ): Promise<Resultat<FichierDepose, ErreurTransport>> {
    if (this.#plein) return echec({ type: 'EspaceDrivePlein' });
    const octets = await encoderFichierAppareil(contenu);
    const existant =
      fichierExistant === undefined
        ? this.#fichiersAppareils(dossier).find(
            (f) => f.appProperties['appareil'] === contenu.appareil,
          )
        : this.#trouver(fichierExistant);
    if (fichierExistant !== undefined && existant === undefined) {
      return echec({ type: 'RessourceIntrouvable' });
    }
    this.#compterEcriture(appareil);
    const ecrit =
      existant === undefined
        ? this.#creer(appareil, {
            nom: `${contenu.appareil}.etat.json.gz`,
            mimeType: TYPE_GZIP,
            appProperties: { donejuan: 'appareil', appareil: contenu.appareil },
            parent: dossier,
            octets,
          })
        : this.#remplacer(existant, octets);
    return succes({ id: ecrit.id as IdFichierDrive, version: ecrit.version });
  }

  async #lireManifeste(
    appareil: IdAppareil,
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>> {
    const fichier = this.#manifeste(dossier);
    if (fichier === undefined) return succes(undefined);
    this.#compterLecture(appareil, fichier.id);
    const contenu = await decoderManifeste(fichier.octets);
    return contenu.ok
      ? succes({ id: fichier.id as IdFichierDrive, contenu: contenu.valeur })
      : contenu;
  }

  async #ecrireManifeste(
    appareil: IdAppareil,
    p: {
      readonly dossier: IdFichierDrive;
      readonly contenu: ContenuManifeste;
      readonly fichierExistant?: IdFichierDrive;
    },
  ): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    if (this.#plein) return echec({ type: 'EspaceDrivePlein' });
    const octets = await encoderManifeste(p.contenu);
    const existant =
      p.fichierExistant === undefined
        ? this.#manifeste(p.dossier)
        : this.#trouver(p.fichierExistant);
    if (p.fichierExistant !== undefined && existant === undefined) {
      return echec({ type: 'RessourceIntrouvable' });
    }
    if (existant === undefined && this.#avantCreationManifeste !== undefined) {
      const rappel = this.#avantCreationManifeste;
      this.#avantCreationManifeste = undefined;
      await rappel();
    }
    this.#compterEcriture(appareil);
    if (existant !== undefined)
      return succes(this.#remplacer(existant, octets).id as IdFichierDrive);
    const manifeste = this.#creer(appareil, {
      nom: NOM_MANIFESTE,
      mimeType: TYPE_JSON,
      appProperties: { donejuan: 'manifeste' },
      parent: p.dossier,
      octets,
    });
    this.#creer(appareil, {
      nom: NOM_LISEZ_MOI,
      mimeType: 'text/plain',
      appProperties: { donejuan: 'lisezmoi' },
      parent: p.dossier,
      octets: new TextEncoder().encode(TEXTE_LISEZ_MOI),
    });
    return succes(manifeste.id as IdFichierDrive);
  }

  // ------------------------------------------------------------------ Stockage

  #jeton(): string {
    return `${String(this.#epoque)}:${String(this.#sequence)}`;
  }

  #trouver(id: string): FichierFaux | undefined {
    return this.#fichiers.find((f) => f.id === id && !f.supprime);
  }

  #fichiersAppareils(dossier: IdFichierDrive): ReadonlyArray<FichierFaux> {
    return this.#fichiers.filter(
      (f) => !f.supprime && f.parent === dossier && f.appProperties['donejuan'] === 'appareil',
    );
  }

  #manifeste(dossier: IdFichierDrive): FichierFaux | undefined {
    return this.#fichiers
      .filter(
        (f) => !f.supprime && f.parent === dossier && f.appProperties['donejuan'] === 'manifeste',
      )
      .sort(canonique)[0];
  }

  #dossiers(): ReadonlyArray<FichierFaux> {
    return this.#fichiers
      .filter(
        (f) =>
          !f.supprime && f.mimeType === TYPE_DOSSIER && f.appProperties['donejuan'] === 'dossier',
      )
      .sort(canonique);
  }

  #compterLecture(appareil: IdAppareil, id: string): void {
    this.#lectures.set(`${appareil}|${id}`, this.lecturesDe(id, appareil) + 1);
  }

  /** Corbeille d'un fichier et, pour un dossier, de tout son contenu ; noté comme un changement. */
  #marquerSupprime(fichier: FichierFaux): void {
    const index = this.#fichiers.indexOf(fichier);
    this.#fichiers[index] = { ...fichier, supprime: true };
    this.#noterChangement(fichier.id);
    this.#fichiers
      .filter((f) => !f.supprime && f.parent === fichier.id)
      .forEach((f) => {
        this.#marquerSupprime(f);
      });
  }

  #compterEcriture(appareil: IdAppareil): void {
    this.#ecritures.set(appareil, this.ecrituresPar(appareil) + 1);
  }

  #noterChangement(id: string): void {
    this.#sequence += 1;
    this.#changements.push({ sequence: this.#sequence, id });
  }

  #creer(appareil: IdAppareil, nouveau: NouveauFichier, creeA?: number): FichierFaux {
    this.#numero += 1;
    this.#version += 1;
    const maintenant = this.temps.maintenant();
    const fichier: FichierFaux = {
      id: `fichier-${String(this.#numero)}`,
      ...nouveau,
      creeA: creeA ?? maintenant,
      modifieA: maintenant,
      supprime: false,
      version: String(this.#version),
    };
    this.#fichiers.push(fichier);
    if (nouveau.mimeType === TYPE_DOSSIER) this.#compterEcriture(appareil);
    this.#noterChangement(fichier.id);
    return fichier;
  }

  #remplacer(fichier: FichierFaux, octets: Uint8Array): FichierFaux {
    this.#version += 1;
    const remplace: FichierFaux = {
      ...fichier,
      octets,
      modifieA: this.temps.maintenant(),
      version: String(this.#version),
    };
    this.#fichiers[this.#fichiers.indexOf(fichier)] = remplace;
    this.#noterChangement(fichier.id);
    return remplace;
  }
}

const distant = (f: FichierFaux): FichierAppareilDistant => ({
  id: f.id as IdFichierDrive,
  appareil: f.appProperties['appareil'] as IdAppareil,
  version: f.version,
});

const element = (f: FichierFaux): ElementDrive => ({
  id: f.id as IdFichierDrive,
  creeA: Instant.depuisMillisecondes(f.creeA),
});

/** Ordre canonique (DAT §4.2.2 d) : créé le plus tôt, puis identifiant. */
const canonique = (a: FichierFaux, b: FichierFaux): number =>
  a.creeA - b.creeA || Number(a.id > b.id) - Number(a.id < b.id);
