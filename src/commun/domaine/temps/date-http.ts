import { Instant } from './instant';

// ST-US-017 v0.11 §6.8 n° 1 (rang 11) ; DAT §6.4 : en-tête HTTP `Date` des réponses de Google (RFC 9110 §5.6.7,
// forme IMF-fixdate seulement : « Wed, 21 Oct 2026 08:00:00 GMT »), précis à la seconde.

const JOURS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MOIS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

// RFC 9110 §5.6.7 : IMF-fixdate = day-name "," SP 2DIGIT SP month SP 4DIGIT SP 2DIGIT ":" 2DIGIT ":" 2DIGIT SP "GMT".
const IMF_FIXDATE = new RegExp(
  `^(${JOURS.join('|')}), (\\d{2}) (${MOIS.join('|')}) (\\d{4}) (\\d{2}):(\\d{2}):(\\d{2}) GMT$`,
);

/** Composantes lues ; l'heure est bornée ici, la date civile par aller-retour (`dateCoherente`). */
type Composantes = {
  readonly jour: string;
  readonly quantieme: number;
  readonly mois: number;
  readonly annee: number;
  readonly heure: number;
  readonly minute: number;
  readonly seconde: number;
};

const HEURES_PAR_JOUR = 24;
const MINUTES_PAR_HEURE = 60;
const SECONDES_PAR_MINUTE = 60;

const lireComposantes = (texte: string): Composantes | undefined => {
  const m = IMF_FIXDATE.exec(texte);
  if (m === null) return undefined;
  const [
    ,
    jour = '',
    quantieme = '',
    mois = '',
    annee = '',
    heure = '',
    minute = '',
    seconde = '',
  ] = m;
  return {
    jour,
    quantieme: Number(quantieme),
    mois: MOIS.findIndex((nom) => nom === mois),
    annee: Number(annee),
    heure: Number(heure),
    minute: Number(minute),
    seconde: Number(seconde),
  };
};

// Une seconde intercalaire (« 60 ») est refusée : aucune mesure, sans effet sur la correction.
const heureValide = (c: Composantes): boolean =>
  c.heure < HEURES_PAR_JOUR && c.minute < MINUTES_PAR_HEURE && c.seconde < SECONDES_PAR_MINUTE;

/** Vrai si la date civile existe (aucun report de `Date.UTC`) et si le jour de la semaine lui correspond. */
const dateCoherente = (c: Composantes, d: Date): boolean =>
  d.getUTCFullYear() === c.annee &&
  d.getUTCMonth() === c.mois &&
  d.getUTCDate() === c.quantieme &&
  JOURS[d.getUTCDay()] === c.jour;

/**
 * Instant de l'en-tête `Date` (millisecondes = 0) ; undefined pour toute autre forme (forme obsolète RFC 850 ou
 * asctime, fuseau autre que `GMT`, jour de la semaine incohérent avec la date, date impossible, texte absent ou vide).
 * Fonction pure : aucune lecture de l'heure.
 */
export const lireDateHttp = (texte: string | undefined): Instant | undefined => {
  const c = texte === undefined ? undefined : lireComposantes(texte);
  if (c === undefined || !heureValide(c)) return undefined;
  const ms = Date.UTC(c.annee, c.mois, c.quantieme, c.heure, c.minute, c.seconde);
  return dateCoherente(c, new Date(ms)) ? Instant.depuisMillisecondes(ms) : undefined;
};
