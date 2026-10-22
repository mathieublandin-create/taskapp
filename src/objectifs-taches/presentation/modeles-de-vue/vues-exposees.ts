// ST-US-001 §4.5 : liste fermée des vues offertes à l'interface ; l'historique n'y figure pas (CA-11).
export type NomVue =
  | 'LISTE_OBJECTIFS'
  | 'DETAIL_OBJECTIF'
  | 'LISTE_TACHES'
  | 'DETAIL_TACHE'
  | 'FORMULAIRE_TACHE'
  | 'FORMULAIRE_SOUS_TACHE';

/** Squelette E10 : liste à remplir en E12 (UT-US-001-34). */
export const VUES_EXPOSEES: ReadonlyArray<NomVue> = [];
