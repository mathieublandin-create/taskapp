import type { IssueReprise } from '../../application/cas-usage/reprendre-session';

// ST-US-022 §6.10 ; guide v0.2.14 §6.6.6 (Q-ST022-STE-4 a, RL-LOT-001-S6).
export type ModeleVueRetourReprise = {
  /** TST-SAISIE-A-TERMINER : 4 s, role="status", sans action ; l'indicateur reste SYN-SESSION. */
  readonly toast?: 'TST-SAISIE-A-TERMINER';
};

export const construireRetourReprise = (issue: IssueReprise): ModeleVueRetourReprise =>
  issue.type === 'SAISIE_A_TERMINER' ? { toast: 'TST-SAISIE-A-TERMINER' } : {};
