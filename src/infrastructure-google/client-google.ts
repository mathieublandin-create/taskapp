import { nonImplemente } from '@non-implemente';

// DAT §4.4.5 ; ST-US-022 §6.8. Erreurs traduites ; aucune exception de fetch ne sort de l'infrastructure.
export type ErreurGoogle =
  | { readonly type: 'ReseauIndisponible' }
  | { readonly type: 'NonAutorise' }
  | { readonly type: 'EspaceDrivePlein' }
  | { readonly type: 'QuotaDepasse' }
  | { readonly type: 'DriveIndisponible'; readonly raison: string }
  | { readonly type: 'RessourceIntrouvable' }
  | { readonly type: 'ErreurServeurDistant'; readonly statut: number };

/** Traduit une réponse HTTP non réussie ; `corps` est le JSON d'erreur de Google, s'il existe. */
export const traduireReponse = (_statut: number, _corps: unknown): ErreurGoogle =>
  nonImplemente('traduireReponse');
