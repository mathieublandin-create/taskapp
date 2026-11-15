/**
 * Versions de l'application au banc (ST-US-017 v0.11 §12.7 V10, S31 ; Q-ST017-PEP-5) : le fichier du PC, réécrit par une
 * version plus récente de même `schemaVersion`, contient des éléments que le smartphone ne connaît pas.
 */
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { FauxDrive } from '../../doublures/faux-drive';

/** Objet qui porte les éléments inconnus (le smartphone n'en connaît aucun). */
const OBJECTIF_INCONNU = 'objectif-du-fichier-recent';
const ENTREE_INCONNUE = 'evenement-du-fichier-recent';

const comparer = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Ajoute au fichier du PC un registre `OBJECTIF`/`importance` et une entrée `ETIQUETAGE`, inconnus d'une version
 * plus ancienne (comme UT-US-017-87). Le PC prend sa place triée dans la table des appareils.
 */
const ajouterElementsInconnus = (
  objet: Record<string, unknown>,
  pc: IdAppareil,
  physique: string,
): void => {
  const appareils = objet['appareils'] as Array<string>;
  if (!appareils.includes(pc)) appareils.push(pc);
  appareils.sort(comparer);
  const hlc = { physique, compteur: 0, appareil: appareils.indexOf(pc) };
  (objet['registres'] as Array<unknown>).push({
    type: 'OBJECTIF',
    id: OBJECTIF_INCONNU,
    champ: 'importance',
    valeur: 3,
    hlc,
  });
  (objet['journal'] as Array<unknown>).push({
    type: 'ETIQUETAGE',
    id: ENTREE_INCONNUE,
    hlc,
    element: { type: 'OBJECTIF', id: OBJECTIF_INCONNU },
  });
};

/** « Le PC utilise une version plus récente » : son fichier du Drive porte des éléments inconnus. */
export const reecrireFichierDuPcParVersionRecente = async (
  drive: FauxDrive,
  pc: IdAppareil,
  maintenant: Instant,
): Promise<void> => {
  const physique = new Date(maintenant).toISOString();
  await drive.reecrireParVersionRecente(pc, (objet) => {
    ajouterElementsInconnus(objet, pc, physique);
  });
};

/** `schemaVersion` du fichier de `appareil` dans le Drive. */
export const formatDuFichierDe = (drive: FauxDrive, appareil: IdAppareil): number => {
  const fichier = drive.fichierDe(appareil);
  assert.ok(fichier, `Aucun fichier de ${appareil} dans le Drive`);
  const objet = JSON.parse(Buffer.from(gunzipSync(fichier.octets)).toString('utf8')) as {
    readonly schemaVersion?: unknown;
  };
  assert.equal(typeof objet.schemaVersion, 'number', 'schemaVersion illisible');
  return objet.schemaVersion as number;
};
