import { libelle } from '../../../commun/presentation/messages/libelle';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';

// Guide §6.6.2, conventions.md §8.5 : une seule fonction de sélection (ordre de gravité).
export type CodeIndicateur =
  | 'SYN-ACTION'
  | 'SYN-SESSION'
  | 'SYN-RETENTATIVE'
  | 'SYN-HORS-LIGNE'
  | 'SYN-EN-COURS'
  | 'SYN-ATTENTE'
  | 'SYN-INFO'
  | 'SYN-OK';

export type MessageFeuille = 'ERR-010' | 'ERR-011' | 'ERR-012' | 'ERR-013' | 'ERR-015' | 'ERR-016';

export type ModeleVueIndicateur = {
  readonly code: CodeIndicateur;
  /** SYN-HORS-LIGNE et SYN-ATTENTE seulement. */
  readonly n?: number;
  /** Absent si 0 (data-a-lire). */
  readonly aLire?: number;
  readonly action?: 'REPRENDRE_LA_SYNCHRONISATION';
  readonly messageFeuille?: MessageFeuille;
};

/** Ordre de gravité (ST-US-022 §6.9) : le premier état qui s'applique l'emporte. */
const REGLES: ReadonlyArray<
  readonly [CodeIndicateur, (e: EtatSynchronisationAffichable) => boolean]
> = [
  ['SYN-ACTION', (e) => e.acces === 'PERDU' || e.actionRequise !== undefined],
  // Q-ST022-STE-3 b) : jamais hors ligne.
  ['SYN-SESSION', (e) => e.acces === 'A_RENOUVELER' && e.reseau === 'CONNECTE'],
  ['SYN-RETENTATIVE', (e) => e.cycle === 'RETENTATIVE'],
  ['SYN-HORS-LIGNE', (e) => e.reseau === 'COUPE'],
  ['SYN-EN-COURS', (e) => e.cycle === 'EN_COURS'],
  ['SYN-ATTENTE', (e) => e.enAttente > 0],
  ['SYN-INFO', (e) => e.aLire > 0],
];

export const selectionnerEtatIndicateur = (e: EtatSynchronisationAffichable): CodeIndicateur =>
  REGLES.find(([, sApplique]) => sApplique(e))?.[0] ?? 'SYN-OK';

const MESSAGES_ACTION: Readonly<
  Record<NonNullable<EtatSynchronisationAffichable['actionRequise']>, MessageFeuille>
> = {
  DRIVE_PLEIN: 'ERR-011',
  DONNEES_ABSENTES: 'ERR-012',
  FORMAT_PLUS_RECENT: 'ERR-013',
  ECHEC_PERSISTANT: 'ERR-016',
};

/** L'accès perdu l'emporte sur une action requise (ERR-010). */
const messageAction = (e: EtatSynchronisationAffichable): MessageFeuille =>
  e.acces === 'PERDU' || e.actionRequise === undefined
    ? 'ERR-010'
    : MESSAGES_ACTION[e.actionRequise];

const complementCode = (
  code: CodeIndicateur,
  e: EtatSynchronisationAffichable,
): Omit<ModeleVueIndicateur, 'code' | 'aLire'> => {
  switch (code) {
    case 'SYN-ACTION':
      return { messageFeuille: messageAction(e) };
    case 'SYN-SESSION':
      return { action: 'REPRENDRE_LA_SYNCHRONISATION', messageFeuille: 'ERR-015' };
    case 'SYN-HORS-LIGNE':
    case 'SYN-ATTENTE':
      return { n: e.enAttente };
    case 'SYN-RETENTATIVE':
    case 'SYN-EN-COURS':
    case 'SYN-INFO':
    case 'SYN-OK':
      return {};
  }
};

export const construireIndicateur = (e: EtatSynchronisationAffichable): ModeleVueIndicateur => {
  const code = selectionnerEtatIndicateur(e);
  return { code, ...complementCode(code, e), ...(e.aLire > 0 ? { aLire: e.aLire } : {}) };
};

/** Libellé visible de l'indicateur (guide §6.6.2) ; SYN-HORS-LIGNE sans attente se réduit à « Hors ligne ». */
const libelleHorsLigne = (n: number): string =>
  n === 0
    ? libelle('SYN-HORS-LIGNE', { n, variante: 'sans-attente' })
    : libelle('SYN-HORS-LIGNE', { n });

export const libelleIndicateur = (vue: ModeleVueIndicateur): string => {
  if (vue.code === 'SYN-INFO') return libelle(vue.code, { n: vue.aLire ?? 0 });
  if (vue.code === 'SYN-ATTENTE') return libelle(vue.code, { n: vue.n ?? 0 });
  if (vue.code === 'SYN-HORS-LIGNE') return libelleHorsLigne(vue.n ?? 0);
  return libelle(vue.code);
};
