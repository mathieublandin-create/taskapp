import type { VerrouOnglets } from './ports/verrou-onglets';

// ST-US-031 v0.4 §4.1, §6.2 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6. Décorateur injecté dans `CycleSynchronisation`
// (`DependancesCycle.exclusion`) : le cycle ne connaît pas Web Locks.

export type ExclusionCycle = {
  /** Exécute `tache` hors de tout chevauchement avec une tâche d'un autre onglet sur le même nom. */
  executer<T>(tache: () => Promise<T>): Promise<T>;
};

/** Exécution directe, sans verrou : appelle `tache` immédiatement (comportement des rangs 3 à 12). */
export const SANS_EXCLUSION: ExclusionCycle = {
  executer: <T>(tache: () => Promise<T>): Promise<T> => tache(),
};

/** Exclusion par le verrou `nom` (en pratique `nomVerrouCycle(nomEspace)`). */
export const exclusionParVerrou = (verrou: VerrouOnglets, nom: string): ExclusionCycle => ({
  executer: <T>(tache: () => Promise<T>): Promise<T> => verrou.executerExclusivement(nom, tache),
});
