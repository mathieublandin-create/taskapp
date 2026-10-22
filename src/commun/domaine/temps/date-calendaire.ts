import { nonImplemente } from '@non-implemente';
import type { Marque } from '../marque';
import type { Resultat } from '../resultat';

// conventions.md §7.1 : « AAAA-MM-JJ », date réelle du calendrier grégorien.
export type DateCalendaire = Marque<string, 'DateCalendaire'>;
export type DateInvalide = { readonly type: 'DateInvalide'; readonly texte: string };

export const DateCalendaire = {
  depuisTexte: (_texte: string): Resultat<DateCalendaire, DateInvalide> =>
    nonImplemente('DateCalendaire.depuisTexte'),
  /** Ordre lexicographique, valable pour ce format. */
  comparer: (_a: DateCalendaire, _b: DateCalendaire): -1 | 0 | 1 =>
    nonImplemente('DateCalendaire.comparer'),
  ajouterJours: (_d: DateCalendaire, _n: number): DateCalendaire =>
    nonImplemente('DateCalendaire.ajouterJours'),
} as const;
