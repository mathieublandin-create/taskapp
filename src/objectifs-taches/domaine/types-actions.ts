// Types des actions, séparés de actions.ts pour que refus.ts ne dépende pas de vue-metier.ts
// (rupture du cycle actions → vue-metier → refus, Q-BEN-E12-3). actions.ts les ré-exporte.
export type ActionObjectif =
  | 'RENOMMER'
  | 'MODIFIER_DESCRIPTION'
  | 'MODIFIER_DELAI'
  | 'RETIRER_DELAI'
  | 'SUPPRIMER'
  | 'PLACER'
  | 'CREER_SOUS_OBJECTIF';

export type ActionTache =
  | 'RENOMMER'
  | 'MODIFIER_DELAI'
  | 'MODIFIER_ESTIMATION'
  | 'RATTACHER'
  | 'DETACHER'
  | 'SUPPRIMER'
  | 'CREER_SOUS_TACHE'
  | 'TERMINER'
  | 'ROUVRIR'
  | 'ABANDONNER'
  | 'REPRENDRE';
