import type { Annulation } from '../../../commun/application/ports/planificateur';

// ST-US-022 §6.5, §6.6 ; ST-US-031 §6.4 ; DAT v0.11.4 §4.1.6 (RL-LOT-001-A1).
// Adaptateur : BroadcastChannel `donejuan-<env>-session` (compte/infrastructure/avis-onglets-broadcast.ts).
export type AvisOnglet = 'SESSION_FERMEE';

export interface AvisOnglets {
  /** Jamais reçu par l'onglet émetteur ; aucune donnée personnelle transportée. */
  diffuser(avis: AvisOnglet): void;
  ecouter(rappel: (avis: AvisOnglet) => void): Annulation;
}
