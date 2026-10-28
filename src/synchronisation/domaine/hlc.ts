import type { IdAppareil } from '../../commun/domaine/identifiants';
import { Instant } from '../../commun/domaine/temps/instant';
import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';

// DAT §6.4, ADR-011 (ST-socle-ecriture.md §6.1).
export type Hlc = {
  readonly physique: Instant; // heure physique corrigée, ms UTC
  readonly compteur: number; // entier, 0 ≤ compteur ≤ COMPTEUR_HLC_MAX
  readonly appareil: IdAppareil; // départage des égalités (DS-11)
};

export const COMPTEUR_HLC_MAX = 65_535;

export type HlcInvalide = { readonly type: 'CompteurHlcInvalide'; readonly compteur: number };

/** Constructeur d'un HLC relu d'un stockage : le compteur doit être un entier de 0 à COMPTEUR_HLC_MAX. */
export const creerHlc = (
  physique: Instant,
  compteur: number,
  appareil: IdAppareil,
): Resultat<Hlc, HlcInvalide> =>
  Number.isInteger(compteur) && compteur >= 0 && compteur <= COMPTEUR_HLC_MAX
    ? succes({ physique, compteur, appareil })
    : echec({ type: 'CompteurHlcInvalide', compteur });

const UNE_MILLISECONDE = EcartTemps.depuisMillisecondes(1);

export const hlcSuivant = (
  dernier: Hlc | undefined,
  physiqueCorrigee: Instant,
  appareil: IdAppareil,
): Hlc => {
  if (dernier === undefined || physiqueCorrigee > dernier.physique) {
    return { physique: physiqueCorrigee, compteur: 0, appareil };
  }
  if (dernier.compteur < COMPTEUR_HLC_MAX) {
    return { physique: dernier.physique, compteur: dernier.compteur + 1, appareil };
  }
  return { physique: Instant.decaler(dernier.physique, UNE_MILLISECONDE), compteur: 0, appareil };
};

const comparerValeurs = <T extends number | string>(a: T, b: T): -1 | 0 | 1 => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

/** Physique, puis compteur, puis appareil (opérateurs < et >, jamais localeCompare). */
export const comparerHlc = (a: Hlc, b: Hlc): -1 | 0 | 1 =>
  comparerValeurs(a.physique, b.physique) ||
  comparerValeurs(a.compteur, b.compteur) ||
  comparerValeurs(a.appareil, b.appareil);

export const maxHlc = (a: Hlc, b: Hlc): Hlc => (comparerHlc(a, b) >= 0 ? a : b);
