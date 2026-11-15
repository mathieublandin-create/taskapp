/**
 * Cellules du tableau des modifications non retenues (glossaire d'étapes §8, colonnes `information`, `valeur non
 * retenue` et `valeur conservée` ; ST-US-017 §12.5) converties en valeurs structurées du détail
 * (`InformationSignalee`, `ValeurSignalee`), puis comparées à une ligne de la section « À lire ».
 */
import { isDeepStrictEqual } from 'node:util';
import type {
  InformationSignalee,
  ValeurSignalee,
} from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import { convertirDuree } from '../conversions';
import { date, duree } from '../valeurs';

const INFORMATIONS: Readonly<Record<string, InformationSignalee>> = {
  intitulé: 'INTITULE',
  description: 'DESCRIPTION',
  délai: 'DELAI',
  estimation: 'ESTIMATION',
  objectifs: 'OBJECTIFS',
  parent: 'PARENT',
  état: 'ETAT',
  création: 'CREATION',
};

const ETATS: Readonly<Record<string, 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE'>> = {
  'à faire': 'A_FAIRE',
  terminée: 'TERMINEE',
  abandonnée: 'ABANDONNEE',
};

/** Valeurs spéciales du glossaire sans intitulé cité. */
const VALEURS_SPECIALES: Readonly<Record<string, ValeurSignalee>> = {
  'tâche supprimée': { type: 'TACHE_SUPPRIMEE' },
  'objectif supprimé': { type: 'OBJECTIF_SUPPRIME' },
  'placement annulé': { type: 'PLACEMENT_ANNULE' },
  'données effacées (repartir de zéro)': { type: 'DONNEES_EFFACEES' },
};

/** Valeurs spéciales qui citent un intitulé : `sous-tâche de X` avant `sous X`. */
const VALEURS_CITANT: ReadonlyArray<readonly [RegExp, (intitule: string) => ValeurSignalee]> = [
  [/^supprimée avec la tâche (.+)$/, (intitule) => ({ type: 'SUPPRIMEE_AVEC', intitule })],
  [/^sous-tâche de (.+)$/, (intitule) => ({ type: 'SOUS_TACHE_DE', intitule })],
  [/^sous (.+)$/, (intitule) => ({ type: 'SOUS', intitule })],
];

export const convertirInformation = (cellule: string): InformationSignalee => {
  const information = INFORMATIONS[cellule];
  if (information === undefined) throw new Error(`Information inconnue : « ${cellule} »`);
  return information;
};

const valeurOrdinaire = (cellule: string, information: InformationSignalee): ValeurSignalee => {
  switch (information) {
    case 'INTITULE':
    case 'DESCRIPTION':
      return { type: 'TEXTE', texte: cellule };
    case 'DELAI':
      return { type: 'DATE', date: date(cellule) };
    case 'ESTIMATION':
      return { type: 'DUREE', duree: duree(convertirDuree(cellule)) };
    case 'ETAT': {
      const etat = ETATS[cellule];
      if (etat === undefined) throw new Error(`État inconnu : « ${cellule} »`);
      return { type: 'ETAT', etat };
    }
    case 'OBJECTIFS':
      return { type: 'RATTACHEE', intitule: cellule };
    case 'PARENT':
    case 'CREATION':
      throw new Error(`Valeur « ${cellule} » non prévue pour l'information ${information}`);
  }
};

/** Valeur d'une cellule : valeur spéciale, ou valeur ordinaire de l'information de la ligne. */
export const convertirValeur = (
  cellule: string,
  information: InformationSignalee,
): ValeurSignalee => {
  const speciale = VALEURS_SPECIALES[cellule];
  if (speciale !== undefined) return speciale;
  for (const [motif, construire] of VALEURS_CITANT) {
    const intitule = motif.exec(cellule)?.[1];
    if (intitule !== undefined) return construire(intitule);
  }
  return valeurOrdinaire(cellule, information);
};

export type LigneAttendue = {
  readonly element: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
  readonly valeurConservee: ValeurSignalee;
};

/** Ligne du tableau (clés du glossaire §8) convertie. */
export const convertirLigne = (cellules: Readonly<Record<string, string>>): LigneAttendue => {
  const cellule = (colonne: string): string => {
    const valeur = cellules[colonne];
    if (valeur === undefined) throw new Error(`Colonne absente : « ${colonne} »`);
    return valeur;
  };
  const information = convertirInformation(cellule('information'));
  return {
    element: cellule('élément'),
    information,
    valeurNonRetenue: convertirValeur(cellule('valeur non retenue'), information),
    valeurConservee: convertirValeur(cellule('valeur conservée'), information),
  };
};

/** v0.6 : une valeur d'état est comparée au seul `etat` (le glossaire §8 n'écrit pas la date). */
const memeValeur = (attendue: ValeurSignalee, reelle: ValeurSignalee): boolean =>
  attendue.type === 'ETAT' && reelle.type === 'ETAT'
    ? attendue.etat === reelle.etat
    : isDeepStrictEqual(attendue, reelle);

export const correspond = (attendue: LigneAttendue, reelle: LigneAttendue): boolean =>
  attendue.element === reelle.element &&
  attendue.information === reelle.information &&
  memeValeur(attendue.valeurNonRetenue, reelle.valeurNonRetenue) &&
  memeValeur(attendue.valeurConservee, reelle.valeurConservee);
