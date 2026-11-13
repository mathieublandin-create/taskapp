import type {
  EtatPersistance,
  PersistanceStockage,
} from '../application/ports/persistance-stockage';

// ST-US-018 v0.4 §4.1, §6.3 n° 1 (rang 12, tranche B1) ; DAT §4.1.6, R15, ADR-013. Seul fichier qui touche à
// `navigator.storage` (règle ESLint `no-restricted-properties`, conventions §14.2).

/** Sous-ensemble de `StorageManager` utilisé (injectable pour les tests). */
export type GestionnaireStockage = {
  persisted(): Promise<boolean>;
  persist(): Promise<boolean>;
};

/** Appel protégé : `true` → `PERSISTANT`, `false` → `NON_PERSISTANT`, rejet ou exception synchrone → `INDISPONIBLE`. */
const etatDepuis = async (appel: () => Promise<boolean>): Promise<EtatPersistance> => {
  try {
    return (await appel()) ? 'PERSISTANT' : 'NON_PERSISTANT';
  } catch {
    // L'API refuse (contexte non sécurisé, navigation privée) : le stockage est traité comme non protégé.
    return 'INDISPONIBLE';
  }
};

/**
 * `gestionnaire` : `navigator.storage`, ou undefined si l'API manque (alors `INDISPONIBLE`). `etat()` n'appelle que
 * `persisted()`, `demander()` que `persist()`. Ne rejette jamais.
 */
export class PersistanceNavigateur implements PersistanceStockage {
  constructor(private readonly gestionnaire: GestionnaireStockage | undefined) {}

  etat(): Promise<EtatPersistance> {
    const gestionnaire = this.gestionnaire;
    if (gestionnaire === undefined) return Promise.resolve('INDISPONIBLE');
    return etatDepuis(() => gestionnaire.persisted());
  }

  demander(): Promise<EtatPersistance> {
    const gestionnaire = this.gestionnaire;
    if (gestionnaire === undefined) return Promise.resolve('INDISPONIBLE');
    return etatDepuis(() => gestionnaire.persist());
  }
}
