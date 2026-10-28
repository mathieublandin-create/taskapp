import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ClientGoogle, ErreurGoogle } from '../../../infrastructure-google';
import type {
  ErreurTransport,
  IdFichierDrive,
  TransportSynchro,
} from '../../application/ports/transport-synchro';

// ST-US-022 §5.3 (rang 1 : dossier seulement) ; les autres méthodes arrivent avec ST-US-017 (rang 3).
export const URL_FICHIERS_DRIVE = 'https://www.googleapis.com/drive/v3/files';
export const NOM_DOSSIER = 'Done Juan';
export const TYPE_DOSSIER = 'application/vnd.google-apps.folder';
export const REQUETE_DOSSIER =
  "appProperties has { key='donejuan' and value='dossier' } and trashed = false and " +
  `mimeType = '${TYPE_DOSSIER}'`;

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

/** Identifiant d'un fichier dans un corps de réponse Drive (`{ id }` ou `{ files: [{ id }] }`). */
const lireId = (objet: unknown): IdFichierDrive | undefined => {
  if (typeof objet !== 'object' || objet === null) return undefined;
  const id = (objet as { readonly id?: unknown }).id;
  return typeof id === 'string' && id !== '' ? (id as IdFichierDrive) : undefined;
};

const premierFichier = (corps: unknown): IdFichierDrive | undefined => {
  if (typeof corps !== 'object' || corps === null) return undefined;
  const fichiers = (corps as { readonly files?: unknown }).files;
  return Array.isArray(fichiers) ? lireId(fichiers[0]) : undefined;
};

export class TransportSynchroDrive implements Pick<TransportSynchro, 'preparerDossier'> {
  constructor(private readonly client: ClientGoogle) {}

  /** Recherche le dossier de l'application (le plus ancien, DAT §4.2.2 d), le crée à la racine s'il manque. */
  async preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const parametres = new URLSearchParams({
      q: REQUETE_DOSSIER,
      orderBy: 'createdTime',
      fields: 'files(id)',
      pageSize: '1',
    });
    const recherche = await this.client.executer({
      methode: 'GET',
      url: `${URL_FICHIERS_DRIVE}?${parametres.toString()}`,
    });
    if (!recherche.ok) return echec(traduireErreurGoogle(recherche.erreur));
    const existant = premierFichier(recherche.valeur.corps);
    return existant === undefined ? this.#creerDossier() : succes(existant);
  }

  async #creerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const creation = await this.client.executer({
      methode: 'POST',
      url: `${URL_FICHIERS_DRIVE}?fields=id`,
      typeContenu: 'application/json',
      corps: JSON.stringify({
        name: NOM_DOSSIER,
        mimeType: TYPE_DOSSIER,
        appProperties: { donejuan: 'dossier' },
      }),
    });
    if (!creation.ok) return echec(traduireErreurGoogle(creation.erreur));
    const id = lireId(creation.valeur.corps);
    return id === undefined ? echec({ type: 'FichierIllisible', cause: 'SCHEMA' }) : succes(id);
  }
}
