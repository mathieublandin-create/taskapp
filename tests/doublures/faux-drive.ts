import { gunzipSync, gzipSync } from 'node:zlib';
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  Changements,
  ErreurTransport,
  FichierAppareilDistant,
  IdFichierDrive,
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

  constructor(private readonly temps: TempsSimule) {}

  transportPour(appareil: IdAppareil, conditions: Conditions): TransportSynchro {
    const appeler = <T>(operation: () => Promise<Resultat<T, ErreurTransport>>) =>
      this.#appeler(appareil, conditions, operation);
    return {
      preparerDossier: () => appeler(() => Promise.resolve(this.#preparerDossier(appareil))),
      listerFichiersAppareils: (dossier) => appeler(() => this.#lister(dossier)),
      changements: (dossier, jeton) =>
        appeler(() => Promise.resolve(this.#changementsDepuis(dossier, jeton))),
      lireFichierAppareil: (id) => appeler(() => this.#lireFichierAppareil(id)),
      deposerFichierAppareil: (p) => this.#deposer(appareil, conditions, p),
      lireManifeste: (dossier) => appeler(() => this.#lireManifeste(dossier)),
      ecrireManifeste: (p) => appeler(() => this.#ecrireManifeste(appareil, p)),
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
    const existant = this.#fichiers.find(
      (f) =>
        !f.supprime && f.mimeType === TYPE_DOSSIER && f.appProperties['donejuan'] === 'dossier',
    );
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
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>> {
    const fichier = this.#trouver(id);
    if (fichier === undefined) return echec({ type: 'RessourceIntrouvable' });
    return decoderFichierAppareil(fichier.octets);
  }

  async #deposer(
    appareil: IdAppareil,
    conditions: Conditions,
    p: Depot,
  ): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
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
  ): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
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
    if (existant !== undefined)
      return succes(this.#remplacer(existant, octets).id as IdFichierDrive);
    const cree = this.#creer(appareil, {
      nom: `${contenu.appareil}.etat.json.gz`,
      mimeType: TYPE_GZIP,
      appProperties: { donejuan: 'appareil', appareil: contenu.appareil },
      parent: dossier,
      octets,
    });
    return succes(cree.id as IdFichierDrive);
  }

  async #lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>> {
    const fichier = this.#manifeste(dossier);
    if (fichier === undefined) return succes(undefined);
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
    return this.#fichiers.find(
      (f) => !f.supprime && f.parent === dossier && f.appProperties['donejuan'] === 'manifeste',
    );
  }

  #compterEcriture(appareil: IdAppareil): void {
    this.#ecritures.set(appareil, this.ecrituresPar(appareil) + 1);
  }

  #noterChangement(id: string): void {
    this.#sequence += 1;
    this.#changements.push({ sequence: this.#sequence, id });
  }

  #creer(appareil: IdAppareil, nouveau: NouveauFichier): FichierFaux {
    this.#numero += 1;
    const maintenant = this.temps.maintenant();
    const fichier: FichierFaux = {
      id: `fichier-${String(this.#numero)}`,
      ...nouveau,
      creeA: maintenant,
      modifieA: maintenant,
      supprime: false,
    };
    this.#fichiers.push(fichier);
    if (nouveau.mimeType === TYPE_DOSSIER) this.#compterEcriture(appareil);
    this.#noterChangement(fichier.id);
    return fichier;
  }

  #remplacer(fichier: FichierFaux, octets: Uint8Array): FichierFaux {
    const remplace: FichierFaux = { ...fichier, octets, modifieA: this.temps.maintenant() };
    this.#fichiers[this.#fichiers.indexOf(fichier)] = remplace;
    this.#noterChangement(fichier.id);
    return remplace;
  }
}

const distant = (f: FichierFaux): FichierAppareilDistant => ({
  id: f.id as IdFichierDrive,
  appareil: f.appProperties['appareil'] as IdAppareil,
});
