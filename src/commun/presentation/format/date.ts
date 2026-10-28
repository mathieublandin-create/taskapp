import type { DateCalendaire } from '../../domaine/temps/date-calendaire';

// Guide §6.6.1 : « 19 oct. » ; année ajoutée si elle diffère de celle d'aujourd'hui.
const MOIS_ABREGES: ReadonlyArray<string> = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** Une date « AAAA-MM-JJ » est déjà valide (type marqué) : le découpage ne peut pas échouer. */
const parties = (d: DateCalendaire): { annee: string; mois: number; jour: number } => {
  const [annee = '', mois = '', jour = ''] = d.split('-');
  return { annee, mois: Number(mois), jour: Number(jour) };
};

export const formaterDate = (d: DateCalendaire, aujourdhui: DateCalendaire): string => {
  const { annee, mois, jour } = parties(d);
  const court = `${String(jour)} ${MOIS_ABREGES[mois - 1] ?? ''}`;
  return annee === parties(aujourdhui).annee ? court : `${court} ${annee}`;
};
