/**
 * Valeurs de test (conventions.md §11.9). Les conversions `as` sont admises dans les tests
 * (conventions.md §6.2) : elles évitent qu'un test échoue sur un constructeur non testé.
 */
import type { Duree } from '@src/commun/domaine/duree';
import type {
  IdAppareil,
  IdObjectif,
  IdOperation,
  IdTache,
} from '@src/commun/domaine/identifiants';
import type { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';

export const date = (texte: string): DateCalendaire => texte as DateCalendaire;
export const instant = (iso: string): Instant => new Date(iso).getTime() as Instant;
export const duree = (minutes: number): Duree => minutes as Duree;
export const fuseau = (iana: string): Fuseau => iana as Fuseau;

export const MINUTE = 60_000;
export const HEURE = 60 * MINUTE;
export const ecart = (millisecondes: number): EcartTemps => millisecondes as EcartTemps;

/** UUID v7 valide et prévisible : `00000000-0000-7000-80<pp>-<n sur 12 chiffres>`. */
export const uuid = (n: number, prefixe = '00'): string =>
  `00000000-0000-7000-80${prefixe}-${String(n).padStart(12, '0')}`;

export const idObjectif = (n: number): IdObjectif => uuid(n, 'a0') as IdObjectif;
export const idTache = (n: number): IdTache => uuid(n, 'b0') as IdTache;
export const idOperation = (n: number): IdOperation => uuid(n, 'c0') as IdOperation;
export const idEvenementTest = (operation: IdOperation, rang: number): IdEvenement =>
  `${operation}:${String(rang)}` as IdEvenement;

/** Identifiants fixes des appareils du banc (conventions.md §11.11). */
export const SMARTPHONE = '00000000-0000-7000-8000-000000000001' as IdAppareil;
export const PC = '00000000-0000-7000-8000-000000000002' as IdAppareil;
/** Troisième appareil, pour distinguer l'auteur d'une écriture des deux autres. */
export const TROISIEME = '00000000-0000-7000-8000-000000000003' as IdAppareil;

export const hlc = (iso: string, compteur: number, appareil: IdAppareil): Hlc => ({
  physique: instant(iso),
  compteur,
  appareil,
});

export const PARIS = fuseau('Europe/Paris');
export const NEW_YORK = fuseau('America/New_York');
export const UTC = fuseau('UTC');
