import { DateCalendaire } from '../../domaine/temps/date-calendaire';
import { FUSEAU_REFERENCE } from '../../domaine/temps/fuseau-reference';
import { jourDeReference } from '../../domaine/temps/jour-de-reference';
import type { Instant } from '../../domaine/temps/instant';
import { formaterDate } from './date';

// Guide §6.6.1 : `{heure}` « 10 h 32 » ; ancienneté du « dernier échange » (ST-US-017 v0.4 §3.1 n° 17 c, §4.5).
// Heure de Paris (DEC-012, RG-053). Sans date-fns : dependency-cruiser le réserve à `commun/domaine/temps/`.
const ESPACE_INSECABLE = ' ';
const MS_PAR_MINUTE = 60_000;
const MS_PAR_HEURE = 60 * MS_PAR_MINUTE;
const MS_PAR_JOUR = 24 * MS_PAR_HEURE;

const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_REFERENCE,
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: 'h23',
});

const partie = (instant: Instant, type: 'hour' | 'minute'): string =>
  FORMAT_HEURE.formatToParts(instant).find((p) => p.type === type)?.value ?? '';

/** « 10 h 32 », « 9 h 05 », « 0 h 30 » : heure de Paris, heures sans zéro initial, espaces insécables. */
export const formaterHeure = (instant: Instant): string =>
  `${partie(instant, 'hour')}${ESPACE_INSECABLE}h${ESPACE_INSECABLE}${partie(instant, 'minute')}`;

const ilYA = (nombre: number, unite: 'min' | 'h'): string =>
  `il y a ${String(nombre)}${ESPACE_INSECABLE}${unite}`;

/**
 * Écart `maintenant - instant` : moins d'une minute (ou négatif) « à l’instant » ; moins d'une heure « il y a {n} min » ;
 * moins de 24 h « il y a {n} h » (n tronqué) ; au-delà, « hier à {heure} » si le jour de Paris de l'instant est la
 * veille de celui de `maintenant`, sinon « le {date} à {heure} » (`formaterDate`).
 */
export const formaterAnciennete = (instant: Instant, maintenant: Instant): string => {
  const ecart = maintenant - instant;
  if (ecart < MS_PAR_MINUTE) return 'à l’instant';
  if (ecart < MS_PAR_HEURE) return ilYA(Math.floor(ecart / MS_PAR_MINUTE), 'min');
  if (ecart < MS_PAR_JOUR) return ilYA(Math.floor(ecart / MS_PAR_HEURE), 'h');
  const jour = jourDeReference(instant);
  const aujourdhui = jourDeReference(maintenant);
  const heure = formaterHeure(instant);
  return DateCalendaire.ajouterJours(jour, 1) === aujourdhui
    ? `hier à ${heure}`
    : `le ${formaterDate(jour, aujourdhui)} à ${heure}`;
};
