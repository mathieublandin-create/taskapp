// conventions.md §9.4 ; DAT §7.3. Journal technique, distinct du journal métier.
export type NiveauJournal = 'erreur' | 'avertissement' | 'info' | 'debug';

export type EntreeJournalTechnique = {
  readonly niveau: NiveauJournal;
  readonly evenement: string;
  readonly champs?: Readonly<Record<string, string | number | boolean>>;
};

export interface JournalTechnique {
  consigner(entree: EntreeJournalTechnique): void;
}
