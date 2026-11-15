import { ErreurProgrammation } from '../erreur-programmation';
import type { Marque } from '../marque';
import { echec, succes, type Resultat } from '../resultat';

// conventions.md §7.1 : « AAAA-MM-JJ », date réelle du calendrier grégorien.
export type DateCalendaire = Marque<string, 'DateCalendaire'>;
export type DateInvalide = { readonly type: 'DateInvalide'; readonly texte: string };

const FORME_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PAR_JOUR = 86_400_000;

/** Millisecondes UTC de minuit de la date civile, ou undefined si ce jour n'existe pas au calendrier. */
const minuitUtc = (texte: string): number | undefined => {
  const correspondance = FORME_DATE.exec(texte);
  if (correspondance === null) return undefined;
  const [, annee = '', mois = '', jour = ''] = correspondance;
  const ms = Date.UTC(Number(annee), Number(mois) - 1, Number(jour));
  return new Date(ms).toISOString().startsWith(texte) ? ms : undefined;
};

export const DateCalendaire = {
  depuisTexte: (texte: string): Resultat<DateCalendaire, DateInvalide> =>
    minuitUtc(texte) === undefined
      ? echec({ type: 'DateInvalide', texte })
      : succes(texte as DateCalendaire),
  /** Ordre lexicographique, valable pour ce format. */
  comparer: (a: DateCalendaire, b: DateCalendaire): -1 | 0 | 1 => {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  },
  ajouterJours: (d: DateCalendaire, n: number): DateCalendaire => {
    const ms = minuitUtc(d);
    if (ms === undefined) throw new ErreurProgrammation(`Date calendaire invalide : ${d}`);
    return new Date(ms + n * MS_PAR_JOUR).toISOString().slice(0, 10) as DateCalendaire;
  },
} as const;
