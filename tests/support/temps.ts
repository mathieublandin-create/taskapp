/**
 * Conversion d'une heure murale d'un fuseau en instant (ST-socle-ecriture.md §12 n° 1, conventions.md §7.2).
 * Heure ambiguë (retour à l'heure d'hiver) : première occurrence. Heure inexistante (passage à l'heure d'été) :
 * l'étape échoue. Réservé aux tests : seul `Intl` est utilisé.
 */
import { Instant } from '@src/commun/domaine/temps/instant';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';

export type HeureLocale = { readonly heures: number; readonly minutes: number };

const UN_JOUR_EN_MS = 86_400_000;

/** Écart (heure murale moins heure UTC) du fuseau à cet instant, en millisecondes. */
const ecartMuralEnMs = (millisecondes: number, fuseau: Fuseau): number => {
  const parties = new Intl.DateTimeFormat('en-US', {
    timeZone: fuseau,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(millisecondes));
  const valeur = (type: string): number =>
    Number(parties.find((partie) => partie.type === type)?.value);
  const mural = Date.UTC(
    valeur('year'),
    valeur('month') - 1,
    valeur('day'),
    valeur('hour'),
    valeur('minute'),
    valeur('second'),
  );
  return mural - Math.floor(millisecondes / 1000) * 1000;
};

export const instantDepuisHeureMurale = (
  jour: string,
  heure: HeureLocale,
  fuseau: Fuseau,
): Instant => {
  const [annee = 0, mois = 1, quantieme = 1] = jour.split('-').map(Number);
  const mural = Date.UTC(annee, mois - 1, quantieme, heure.heures, heure.minutes);
  const ecartsPossibles = new Set([
    ecartMuralEnMs(mural - UN_JOUR_EN_MS, fuseau),
    ecartMuralEnMs(mural + UN_JOUR_EN_MS, fuseau),
  ]);
  const candidats = [...ecartsPossibles]
    .map((ecart) => mural - ecart)
    .filter((candidat) => ecartMuralEnMs(candidat, fuseau) === mural - candidat);
  if (candidats.length === 0) {
    throw new Error(
      `Heure inexistante : ${jour} ${String(heure.heures)}:${String(heure.minutes).padStart(2, '0')} heure de ${fuseau}`,
    );
  }
  return Instant.depuisMillisecondes(Math.min(...candidats));
};
