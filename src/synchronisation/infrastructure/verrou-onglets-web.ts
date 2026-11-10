import { nonImplemente } from '@non-implemente';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { VerrouOnglets } from '../application/ports/verrou-onglets';

// ST-US-031 v0.4 §4.2, §8 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6 ; RL-LOT-001-A6 (hypothèse H-031-1).
// Adaptateur Web Locks du port `VerrouOnglets` : seul fichier autorisé à lire `navigator.locks` (ESLint).

export type DependancesVerrouOngletsWeb = {
  /** `navigator.locks` ; undefined si l'API est absente (exécution sans verrou, entrée `erreur` une fois). */
  readonly gestionnaire: LockManager | undefined;
  readonly journal: JournalTechnique;
};

export class VerrouOngletsWeb implements VerrouOnglets {
  constructor(private readonly dependances: DependancesVerrouOngletsWeb) {}

  executerExclusivement<T>(nom: string, _tache: () => Promise<T>): Promise<T> {
    return nonImplemente(`VerrouOngletsWeb.executerExclusivement(${nom})`);
  }

  demanderLaMain(nom: string, _quandObtenue: () => void): () => void {
    return nonImplemente(`VerrouOngletsWeb.demanderLaMain(${nom})`);
  }

  estTenu(nom: string): Promise<boolean> {
    return nonImplemente(
      `VerrouOngletsWeb.estTenu(${nom}, ${String(this.dependances.gestionnaire !== undefined)})`,
    );
  }
}

/** Verrou du navigateur courant (composition `web.ts`) : `navigator.locks` s'il existe. */
export const verrouOngletsDuNavigateur = (journal: JournalTechnique): VerrouOngletsWeb =>
  nonImplemente(`verrouOngletsDuNavigateur(${typeof journal})`);
