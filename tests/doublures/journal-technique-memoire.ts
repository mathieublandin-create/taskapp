import type {
  EntreeJournalTechnique,
  JournalTechnique,
} from '@src/commun/application/ports/journal-technique';

/**
 * Doublure du port JournalTechnique (conventions.md §11.10) : conserve les entrées en mémoire.
 * Le hook `After` du banc échoue sur toute entrée `erreur` non attendue (`erreursInattendues`).
 */
export class JournalTechniqueMemoire implements JournalTechnique {
  private readonly consignees: Array<EntreeJournalTechnique> = [];
  private readonly attendues = new Set<string>();

  consigner(entree: EntreeJournalTechnique): void {
    this.consignees.push(entree);
  }

  entrees(): ReadonlyArray<EntreeJournalTechnique> {
    return [...this.consignees];
  }

  /** Déclare qu'une entrée `erreur` de cet événement est le comportement attendu du scénario. */
  attendreErreur(evenement: string): void {
    this.attendues.add(evenement);
  }

  erreursInattendues(): ReadonlyArray<EntreeJournalTechnique> {
    return this.consignees.filter((e) => e.niveau === 'erreur' && !this.attendues.has(e.evenement));
  }
}
