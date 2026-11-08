// ST-US-018 v0.4 §4.1 (rang 12) ; ADR-013, DAT §4.1.6, R15, conventions.md §9.3. Aucun appel à `navigator.storage`
// hors de l'adaptateur `PersistanceNavigateur`.

/** `PERSISTANT` : stockage protégé ; `NON_PERSISTANT` : refusé ; `INDISPONIBLE` : API absente ou en échec. */
export type EtatPersistance = 'PERSISTANT' | 'NON_PERSISTANT' | 'INDISPONIBLE';

export interface PersistanceStockage {
  /** `navigator.storage.persisted()` ; ne rejette jamais. */
  etat(): Promise<EtatPersistance>;
  /** `navigator.storage.persist()` ; ne rejette jamais. */
  demander(): Promise<EtatPersistance>;
}

/** Drapeau « persistance déjà demandée » (base technique, table `installation`, clé `persistanceDemandee`). */
export interface MemoireDemandePersistance {
  /** Faux si la ligne est absente, invalide ou illisible ; ne rejette jamais. */
  dejaDemandee(): Promise<boolean>;
  /** Écriture confirmée à `complete` ; un échec est absorbé (la demande sera refaite au lancement suivant). */
  noterDemandee(): Promise<void>;
}
