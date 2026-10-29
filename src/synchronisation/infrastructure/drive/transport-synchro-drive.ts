import type { IdAppareil } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ClientGoogle, ErreurGoogle, RequeteGoogle } from '../../../infrastructure-google';
import type {
  Changements,
  ErreurTransport,
  FichierAppareilDistant,
  IdFichierDrive,
  ManifesteDistant,
  TransportSynchro,
} from '../../application/ports/transport-synchro';
import type { ContenuFichierAppareil, ContenuManifeste } from '../../domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  decoderManifeste,
  encoderFichierAppareil,
  encoderManifeste,
} from './format-v1';

// ST-US-022 §5.3 (rang 1 : dossier) ; ST-US-017 §4.3, §4.4, §7 (rang 3 : fichiers d'appareil, manifeste, changements).
export const URL_FICHIERS_DRIVE = 'https://www.googleapis.com/drive/v3/files';
export const URL_ENVOI_DRIVE = 'https://www.googleapis.com/upload/drive/v3/files';
export const URL_CHANGEMENTS_DRIVE = 'https://www.googleapis.com/drive/v3/changes';
export const NOM_DOSSIER = 'Done Juan';
export const TYPE_DOSSIER = 'application/vnd.google-apps.folder';
export const REQUETE_DOSSIER =
  "appProperties has { key='donejuan' and value='dossier' } and trashed = false and " +
  `mimeType = '${TYPE_DOSSIER}'`;
export const NOM_MANIFESTE = 'manifeste.json';
export const NOM_LISEZ_MOI = 'LISEZ-MOI.txt';
export const TEXTE_LISEZ_MOI =
  "Ce dossier contient les données de l'application Done Juan. Ne modifiez pas ces fichiers : " +
  "l'application les gère seule.";
const TYPE_GZIP = 'application/gzip';
const TYPE_JSON = 'application/json';
const CHAMPS_FICHIER = 'id,name,appProperties,createdTime,modifiedTime';
const TAILLE_PAGE = '1000';
const SEPARATEUR = 'donejuan-multipart-7f3a9c';

export const traduireErreurGoogle = (erreur: ErreurGoogle): ErreurTransport => {
  switch (erreur.type) {
    case 'QuotaDepasse':
    case 'ErreurServeurDistant':
      return { type: 'ServeurIndisponible' };
    case 'DriveIndisponible':
      return { type: 'DriveIndisponible' };
    case 'ReseauIndisponible':
    case 'NonAutorise':
    case 'EspaceDrivePlein':
    case 'RessourceIntrouvable':
      return { type: erreur.type };
  }
};

/** `changes.list` refuse un jeton inconnu ou périmé par 400 ou 404 (DAT v0.11.4 §4.3). */
const estJetonRefuse = (erreur: ErreurGoogle): boolean =>
  erreur.type === 'RessourceIntrouvable' ||
  (erreur.type === 'ErreurServeurDistant' && erreur.statut === 400);

const champ = (objet: unknown, nom: string): unknown =>
  typeof objet === 'object' && objet !== null ? (objet as Record<string, unknown>)[nom] : undefined;

const texte = (valeur: unknown): string | undefined =>
  typeof valeur === 'string' && valeur !== '' ? valeur : undefined;

/** Identifiant d'un fichier dans un corps de réponse Drive (`{ id }`). */
const lireId = (objet: unknown): IdFichierDrive | undefined =>
  texte(champ(objet, 'id')) as IdFichierDrive | undefined;

const fichiersDe = (corps: unknown): ReadonlyArray<unknown> => {
  const fichiers = champ(corps, 'files');
  return Array.isArray(fichiers) ? fichiers : [];
};

const premierFichier = (corps: unknown): IdFichierDrive | undefined => lireId(fichiersDe(corps)[0]);

/** Fichier d'appareil décrit par Drive (`appProperties.donejuan = appareil`) ; undefined sinon. */
const fichierAppareil = (fichier: unknown): FichierAppareilDistant | undefined => {
  const id = lireId(fichier);
  const proprietes = champ(fichier, 'appProperties');
  const appareil = texte(champ(proprietes, 'appareil'));
  if (id === undefined || appareil === undefined || champ(proprietes, 'donejuan') !== 'appareil') {
    return undefined;
  }
  return { id, appareil: appareil as IdAppareil };
};

const requeteDansDossier = (dossier: IdFichierDrive, condition: string): string =>
  `${condition} and '${dossier}' in parents and trashed = false`;

const requeteAppareils = (dossier: IdFichierDrive, appareil?: IdAppareil): string =>
  requeteDansDossier(
    dossier,
    "appProperties has { key='donejuan' and value='appareil' }" +
      (appareil === undefined
        ? ''
        : ` and appProperties has { key='appareil' and value='${appareil}' }`),
  );

const requeteManifeste = (dossier: IdFichierDrive): string =>
  requeteDansDossier(dossier, "appProperties has { key='donejuan' and value='manifeste' }");

/** Corps `multipart/related` : métadonnées JSON puis contenu (`uploadType=multipart`). */
const corpsMultipart = (
  metadonnees: object,
  typeContenu: string,
  octets: Uint8Array,
): Uint8Array => {
  const encodeur = new TextEncoder();
  const entete = encodeur.encode(
    `--${SEPARATEUR}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadonnees)}\r\n--${SEPARATEUR}\r\nContent-Type: ${typeContenu}\r\n\r\n`,
  );
  const fin = encodeur.encode(`\r\n--${SEPARATEUR}--`);
  const corps = new Uint8Array(entete.length + octets.length + fin.length);
  corps.set(entete, 0);
  corps.set(octets, entete.length);
  corps.set(fin, entete.length + octets.length);
  return corps;
};

type NouveauFichier = {
  readonly nom: string;
  readonly typeContenu: string;
  readonly appProperties: Readonly<Record<string, string>>;
  readonly dossier: IdFichierDrive;
  readonly octets: Uint8Array;
};

/** Adaptateur Drive v3 REST du port TransportSynchro (ST-US-017 §4.4) ; aucune exception ne sort. */
export class TransportSynchroDrive implements TransportSynchro {
  constructor(private readonly client: ClientGoogle) {}

  /** Recherche le dossier de l'application (le plus ancien, DAT §4.2.2 d), le crée à la racine s'il manque. */
  async preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const parametres = new URLSearchParams({
      q: REQUETE_DOSSIER,
      orderBy: 'createdTime',
      fields: 'files(id)',
      pageSize: '1',
    });
    const recherche = await this.#executer({
      methode: 'GET',
      url: `${URL_FICHIERS_DRIVE}?${parametres.toString()}`,
    });
    if (!recherche.ok) return recherche;
    const existant = premierFichier(recherche.valeur);
    return existant === undefined ? this.#creerDossier() : succes(existant);
  }

  /** Jeton de départ obtenu avant l'inventaire (DAT v0.11.4 §4.3, RL-LOT-001-A3). */
  async listerFichiersAppareils(
    dossier: IdFichierDrive,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    const depart = await this.#executer({
      methode: 'GET',
      url: `${URL_CHANGEMENTS_DRIVE}/startPageToken`,
    });
    if (!depart.ok) return depart;
    const jeton = texte(champ(depart.valeur, 'startPageToken'));
    if (jeton === undefined) return echec({ type: 'FichierIllisible', cause: 'SCHEMA' });
    const fichiers = await this.#rechercher(requeteAppareils(dossier));
    if (!fichiers.ok) return fichiers;
    return succes({ fichiers: fichiers.valeur.flatMap((f) => fichierAppareil(f) ?? []), jeton });
  }

  /** `changes.list` depuis `jeton`, toutes les pages ; jeton refusé → JetonChangementsInvalide. */
  async changements(
    dossier: IdFichierDrive,
    jeton: string,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    const fichiers = new Map<string, FichierAppareilDistant>();
    for (let page: string | undefined = jeton; ;) {
      const reponse = await this.client.executer({ methode: 'GET', url: urlChangements(page) });
      if (!reponse.ok) {
        return echec(
          estJetonRefuse(reponse.erreur)
            ? { type: 'JetonChangementsInvalide' }
            : traduireErreurGoogle(reponse.erreur),
        );
      }
      changementsRetenus(reponse.valeur.corps, dossier).forEach((f) => fichiers.set(f.id, f));
      const suivante = texte(champ(reponse.valeur.corps, 'nextPageToken'));
      const nouveau = texte(champ(reponse.valeur.corps, 'newStartPageToken'));
      if (suivante !== undefined) page = suivante;
      else if (nouveau !== undefined)
        return succes({ fichiers: [...fichiers.values()], jeton: nouveau });
      else return echec({ type: 'FichierIllisible', cause: 'SCHEMA' });
    }
  }

  async lireFichierAppareil(
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>> {
    const octets = await this.#lireOctets(id);
    return octets.ok ? decoderFichierAppareil(octets.valeur) : octets;
  }

  /** Sans `fichierExistant`, le fichier de l'appareil est d'abord recherché : jamais de second fichier (CT-TRANS-03). */
  async deposerFichierAppareil(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuFichierAppareil;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const octets = await encoderFichierAppareil(p.contenu);
    const existant = await this.#existant(
      p.fichierExistant,
      requeteAppareils(p.dossier, p.contenu.appareil),
    );
    if (!existant.ok) return existant;
    if (existant.valeur !== undefined) return this.#remplacer(existant.valeur, TYPE_GZIP, octets);
    return this.#creer({
      nom: `${p.contenu.appareil}.etat.json.gz`,
      typeContenu: TYPE_GZIP,
      appProperties: { donejuan: 'appareil', appareil: p.contenu.appareil },
      dossier: p.dossier,
      octets,
    });
  }

  async lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>> {
    const trouves = await this.#rechercher(requeteManifeste(dossier));
    if (!trouves.ok) return trouves;
    const id = lireId(trouves.valeur[0]);
    if (id === undefined) return succes(undefined);
    const octets = await this.#lireOctets(id);
    if (!octets.ok) return octets;
    const contenu = await decoderManifeste(octets.valeur);
    return contenu.ok ? succes({ id, contenu: contenu.valeur }) : contenu;
  }

  /** Crée le manifeste (et LISEZ-MOI.txt, une fois) ou remplace son contenu. */
  async ecrireManifeste(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuManifeste;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const octets = await encoderManifeste(p.contenu);
    const existant = await this.#existant(p.fichierExistant, requeteManifeste(p.dossier));
    if (!existant.ok) return existant;
    if (existant.valeur !== undefined) return this.#remplacer(existant.valeur, TYPE_JSON, octets);
    const manifeste = await this.#creer({
      nom: NOM_MANIFESTE,
      typeContenu: TYPE_JSON,
      appProperties: { donejuan: 'manifeste' },
      dossier: p.dossier,
      octets,
    });
    if (!manifeste.ok) return manifeste;
    const lisezMoi = await this.#creer({
      nom: NOM_LISEZ_MOI,
      typeContenu: 'text/plain',
      appProperties: { donejuan: 'lisezmoi' },
      dossier: p.dossier,
      octets: new TextEncoder().encode(TEXTE_LISEZ_MOI),
    });
    return lisezMoi.ok ? manifeste : lisezMoi;
  }

  // ------------------------------------------------------------------ Requêtes

  async #executer(requete: RequeteGoogle): Promise<Resultat<unknown, ErreurTransport>> {
    const reponse = await this.client.executer(requete);
    return reponse.ok ? succes(reponse.valeur.corps) : echec(traduireErreurGoogle(reponse.erreur));
  }

  /** `files.list`, toutes les pages, par date de création croissante. */
  async #rechercher(q: string): Promise<Resultat<ReadonlyArray<unknown>, ErreurTransport>> {
    const trouves: Array<unknown> = [];
    for (let page: string | undefined; ;) {
      const parametres = new URLSearchParams({
        q,
        orderBy: 'createdTime',
        fields: `nextPageToken,files(${CHAMPS_FICHIER})`,
        pageSize: TAILLE_PAGE,
        ...(page === undefined ? {} : { pageToken: page }),
      });
      const reponse = await this.#executer({
        methode: 'GET',
        url: `${URL_FICHIERS_DRIVE}?${parametres.toString()}`,
      });
      if (!reponse.ok) return reponse;
      trouves.push(...fichiersDe(reponse.valeur));
      page = texte(champ(reponse.valeur, 'nextPageToken'));
      if (page === undefined) return succes(trouves);
    }
  }

  /** Fichier à remplacer : celui fourni, sinon le plus ancien trouvé par la requête ; undefined s'il n'y en a pas. */
  async #existant(
    fourni: IdFichierDrive | undefined,
    q: string,
  ): Promise<Resultat<IdFichierDrive | undefined, ErreurTransport>> {
    if (fourni !== undefined) return succes(fourni);
    const trouves = await this.#rechercher(q);
    return trouves.ok ? succes(lireId(trouves.valeur[0])) : trouves;
  }

  async #lireOctets(id: IdFichierDrive): Promise<Resultat<Uint8Array, ErreurTransport>> {
    const lu = await this.#executer({
      methode: 'GET',
      url: `${URL_FICHIERS_DRIVE}/${encodeURIComponent(id)}?alt=media`,
      reponse: 'OCTETS',
    });
    if (!lu.ok) return lu;
    return lu.valeur instanceof Uint8Array
      ? succes(lu.valeur)
      : echec({ type: 'FichierIllisible', cause: 'DECOMPRESSION' });
  }

  async #creer(f: NouveauFichier): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const cree = await this.#executer({
      methode: 'POST',
      url: `${URL_ENVOI_DRIVE}?uploadType=multipart&fields=id`,
      typeContenu: `multipart/related; boundary=${SEPARATEUR}`,
      octets: corpsMultipart(
        {
          name: f.nom,
          mimeType: f.typeContenu,
          parents: [f.dossier],
          appProperties: f.appProperties,
        },
        f.typeContenu,
        f.octets,
      ),
    });
    return this.#idCree(cree);
  }

  async #remplacer(
    id: IdFichierDrive,
    typeContenu: string,
    octets: Uint8Array,
  ): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const remplace = await this.#executer({
      methode: 'PATCH',
      url: `${URL_ENVOI_DRIVE}/${encodeURIComponent(id)}?uploadType=media&fields=id`,
      typeContenu,
      octets,
    });
    return this.#idCree(remplace);
  }

  #idCree(reponse: Resultat<unknown, ErreurTransport>): Resultat<IdFichierDrive, ErreurTransport> {
    if (!reponse.ok) return reponse;
    const id = lireId(reponse.valeur);
    return id === undefined ? echec({ type: 'FichierIllisible', cause: 'SCHEMA' }) : succes(id);
  }

  async #creerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const creation = await this.#executer({
      methode: 'POST',
      url: `${URL_FICHIERS_DRIVE}?fields=id`,
      typeContenu: 'application/json',
      corps: JSON.stringify({
        name: NOM_DOSSIER,
        mimeType: TYPE_DOSSIER,
        appProperties: { donejuan: 'dossier' },
      }),
    });
    return this.#idCree(creation);
  }
}

const urlChangements = (page: string): string =>
  `${URL_CHANGEMENTS_DRIVE}?${new URLSearchParams({
    pageToken: page,
    pageSize: TAILLE_PAGE,
    fields:
      'nextPageToken,newStartPageToken,changes(fileId,removed,file(id,name,appProperties,parents,trashed))',
  }).toString()}`;

/** Fichiers d'appareil du dossier créés ou modifiés, ni supprimés ni dans la corbeille. */
const changementsRetenus = (
  corps: unknown,
  dossier: IdFichierDrive,
): ReadonlyArray<FichierAppareilDistant> => {
  const changements = champ(corps, 'changes');
  if (!Array.isArray(changements)) return [];
  return changements.flatMap((changement: unknown) => {
    const fichier = champ(changement, 'file');
    const parents = champ(fichier, 'parents');
    const retenu =
      champ(changement, 'removed') !== true &&
      champ(fichier, 'trashed') !== true &&
      Array.isArray(parents) &&
      parents.includes(dossier);
    return retenu ? (fichierAppareil(fichier) ?? []) : [];
  });
};
