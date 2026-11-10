// ST-US-031 v0.4 §4.1 (rang 13) ; DAT v0.11.12 §4.1.6 (Q-ST031-STA-1) ; conventions §2.3 (port interne), §10.2.
// Port interne du contexte `synchronisation` : verrous nommés partagés par les onglets d'un même profil de navigateur.
// Adaptateurs : `VerrouOngletsWeb` (`navigator.locks`, seul lecteur autorisé) ; doublure `VerrouOngletsEnMemoire`
// (tests/doublures). Contrat commun : tests/contrats/verrou-onglets.contrat.ts (CT-VER-01 à 07).

export interface VerrouOnglets {
  /**
   * Exécute `tache` quand aucun onglet ne tient `nom` (mode exclusif ; attente FIFO sinon). Le verrou est rendu quand
   * la promesse de `tache` est réglée, qu'elle réussisse ou échoue ; sa valeur ou son erreur est renvoyée telle quelle.
   */
  executerExclusivement<T>(nom: string, tache: () => Promise<T>): Promise<T>;
  /**
   * Demande la main durable sur `nom`. `quandObtenue` est appelée une seule fois, à l'obtention, et jamais avant le
   * retour de cet appel. Renvoie `rendre` : rend la main si elle est tenue, abandonne la demande sinon (`quandObtenue`
   * n'est alors jamais appelée) ; idempotente.
   */
  demanderLaMain(nom: string, quandObtenue: () => void): () => void;
  /** Vrai si un onglet, celui-ci compris, tient `nom` (main durable ou tâche en cours). */
  estTenu(nom: string): Promise<boolean>;
}
