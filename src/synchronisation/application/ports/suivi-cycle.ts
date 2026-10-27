// État du moteur de synchronisation lu par la requête de l'indicateur (ST-US-022 §4.3).
export type EtatMoteur = {
  readonly cycle: 'REPOS' | 'EN_COURS' | 'RETENTATIVE';
  readonly actionRequise?:
    'DRIVE_PLEIN' | 'DONNEES_ABSENTES' | 'FORMAT_PLUS_RECENT' | 'ECHEC_PERSISTANT';
  readonly aLire: number;
};

export interface SuiviCycle {
  etatMoteur(): EtatMoteur;
}

/** Utilisé par la composition aux rangs 1 et 2 ; remplacé au rang 3 par CycleSynchronisation. */
export const SUIVI_CYCLE_AU_REPOS: SuiviCycle = {
  etatMoteur: () => ({ cycle: 'REPOS', aLire: 0 }),
};
