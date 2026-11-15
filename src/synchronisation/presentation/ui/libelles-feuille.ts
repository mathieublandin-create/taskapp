// Libellés de la feuille « Compte et synchronisation » qui n'ont pas de code au catalogue (titre de la feuille, bouton
// d'ouverture, « Fermer »), réunis ici pour qu'aucun texte ne soit codé dans les composants (DT-006). Source : guide
// d'ergonomie §4.26 (nom de la feuille), §4.8 ; ST-CORR-E13B-LOT-001 §5.
export const LIBELLES_FEUILLE = {
  /** Nom accessible de la feuille modale et texte de son titre (guide §4.26). */
  titre: 'Compte et synchronisation',
  /** Texte et nom accessible du bouton qui ouvre la feuille (ST-CORR-E13B-LOT-001 §5.2, Q-CORR-STE-1). */
  ouvrir: 'Compte et synchronisation',
  fermer: 'Fermer',
} as const;
