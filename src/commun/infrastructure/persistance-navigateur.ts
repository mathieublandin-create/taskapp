import { nonImplemente } from '@non-implemente';
import type {
  EtatPersistance,
  PersistanceStockage,
} from '../application/ports/persistance-stockage';

// ST-US-018 v0.4 §4.1, §6.3 (rang 12, tranche B1). Seul fichier qui touche à `navigator.storage` (règle ESLint).

/** Sous-ensemble de `StorageManager` utilisé (injectable pour les tests). */
export type GestionnaireStockage = {
  persisted(): Promise<boolean>;
  persist(): Promise<boolean>;
};

/**
 * `gestionnaire` : `navigator.storage`, ou undefined si l'API manque (alors `INDISPONIBLE`). `true` → `PERSISTANT`,
 * `false` → `NON_PERSISTANT`, rejet ou exception → `INDISPONIBLE`. Ne rejette jamais.
 */
export class PersistanceNavigateur implements PersistanceStockage {
  constructor(private readonly gestionnaire: GestionnaireStockage | undefined) {}

  etat(): Promise<EtatPersistance> {
    return nonImplemente(`PersistanceNavigateur.etat ${String(this.gestionnaire !== undefined)}`);
  }

  demander(): Promise<EtatPersistance> {
    return nonImplemente('PersistanceNavigateur.demander');
  }
}
