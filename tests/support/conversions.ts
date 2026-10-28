/**
 * Formats et conversions des types de paramètres Cucumber (conventions.md §11.7), sans dépendance à Cucumber pour
 * rester testables en Vitest. Une conversion lit un format, elle n'applique jamais une règle métier : une valeur
 * invalide au sens métier (« 45 min » pour une estimation) doit atteindre le cas d'usage, qui la refuse.
 */
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { NomAppareil } from './banc/appareil-simule';
import type { HeureLocale } from './temps';

// Fragments d'expression régulière, réutilisés par les préfixes (prefixes.ts) : sans groupe capturant.
export const FRAGMENT_APPAREIL = 'smartphone|PC';
export const FRAGMENT_ECART = String.raw`\d+ h(?: \d+ min)?|\d+ minutes?|\d+ min`;
export const FRAGMENT_DUREE = String.raw`\d+ h(?: \d{2})?|\d+ min`;
export const FRAGMENT_DATE = String.raw`\d{4}-\d{2}-\d{2}`;
export const FRAGMENT_HEURE = String.raw`\d{2}:\d{2}`;
export const FRAGMENT_FUSEAU = String.raw`UTC|[A-Z][A-Za-z_]+(?:\/[A-Za-z_]+)+`;

const MS_PAR_MINUTE = 60_000;

/**
 * Idempotente : un groupe capturant d'expression régulière dont le motif est celui de `{appareil}` (préfixes,
 * pluriels « (s) ») est déjà converti par cucumber-js et arrive ici sous la forme `'pc'` ou `'smartphone'`.
 */
export const convertirAppareil = (texte: string): NomAppareil =>
  texte === 'PC' || texte === 'pc' ? 'pc' : 'smartphone';

/** « 2 h 30 », « 1 h », « 0 h » ou « 30 min », en minutes (non validé). */
export const convertirDuree = (texte: string): number => {
  const [, heures, minutes] = /^(\d+) h(?: (\d{2}))?$/.exec(texte) ?? [];
  if (heures !== undefined) return Number(heures) * 60 + Number(minutes ?? 0);
  return Number.parseInt(texte, 10);
};

/** « 24 h 1 min », « 5 min », « 1 minute », « 10 minutes ». */
export const convertirEcart = (texte: string): EcartTemps => {
  const [, heures = '0', minutes = '0'] =
    /^(?:(\d+) h)?(?: ?(\d+) min(?:utes?)?)?$/.exec(texte) ?? [];
  return EcartTemps.depuisMillisecondes((Number(heures) * 60 + Number(minutes)) * MS_PAR_MINUTE);
};

export const convertirHeure = (texte: string): HeureLocale => {
  const [heures = '0', minutes = '0'] = texte.split(':');
  return { heures: Number(heures), minutes: Number(minutes) };
};

/** Fuseau IANA validé par `Intl` : un fuseau inconnu fait échouer l'étape. */
export const convertirFuseau = (texte: string): Fuseau => {
  Intl.DateTimeFormat('fr', { timeZone: texte });
  return texte as Fuseau;
};
