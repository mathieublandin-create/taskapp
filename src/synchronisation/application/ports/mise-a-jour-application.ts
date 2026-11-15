// ST-US-017 v0.11 §4.8, §6.8 n° 10 (rang 11) ; DAT §4.2 (RG-058, « Mettre à jour », Q-US-017-10 a, ADR-013).

/**
 * `RECHARGEMENT_LANCE` : une version plus récente est activée, la page va se recharger (les modifications en attente
 * sont dans IndexedDB) ; `AUCUNE_VERSION` : aucune version plus récente n'est publiée (ou aucun service worker
 * enregistré) ; `ECHEC` : la vérification a échoué (réseau, erreur du navigateur).
 */
export type IssueMiseAJour = 'RECHARGEMENT_LANCE' | 'AUCUNE_VERSION' | 'ECHEC';

export interface MiseAJourApplication {
  /** Ne lève jamais d'exception ; jamais de téléchargement de fichier ni d'ouverture d'une boutique (DEC-034). */
  mettreAJour(): Promise<IssueMiseAJour>;
}
