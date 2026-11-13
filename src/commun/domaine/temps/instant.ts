import { ErreurProgrammation } from '../erreur-programmation';
import type { Marque } from '../marque';
import { echec, succes, type Resultat } from '../resultat';
import type { EcartTemps } from './ecart-temps';

// conventions.md §7.1 : millisecondes UTC depuis l'époque ; persisté en ISO 8601 UTC à la milliseconde.
export type Instant = Marque<number, 'Instant'>;

const FORME_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const depuisMillisecondes = (ms: number): Instant => {
  if (!Number.isSafeInteger(ms)) {
    throw new ErreurProgrammation(`Instant invalide : ${String(ms)}`);
  }
  return ms as Instant;
};

export const Instant = {
  /** Lève ErreurProgrammation si la valeur n'est pas un entier fini. */
  depuisMillisecondes,
  /** « 2026-10-21T08:00:00.000Z ». */
  enIso: (i: Instant): string => new Date(i).toISOString(),
  depuisIso: (texte: string): Resultat<Instant, { readonly type: 'InstantInvalide' }> => {
    const ms = FORME_ISO.test(texte) ? new Date(texte).getTime() : Number.NaN;
    return Number.isNaN(ms) ? echec({ type: 'InstantInvalide' }) : succes(ms as Instant);
  },
  decaler: (i: Instant, e: EcartTemps): Instant => depuisMillisecondes(i + e),
} as const;
