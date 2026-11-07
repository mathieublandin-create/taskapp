import { nonImplemente } from '@non-implemente';
import type { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import type { Instant } from '../../commun/domaine/temps/instant';

// ST-US-017 v0.11 §6.8 n° 1 à 5 (rang 11) ; DAT v0.11.3 §6.4 (Q-ST017-STA-2). Fonctions pures ; constantes dans
// `parametres-synchronisation.ts`. Convention de signe : correction = heure de Google − heure de l'appareil ;
// heure physique corrigée = heure de l'appareil + correction (`Instant.decaler(maintenant, correction)`).

/** Échange mesuré (EchangeGoogle dont la date est lue). */
export type EchangeMesurable = {
  readonly envoiMonotone: EcartTemps;
  readonly receptionMonotone: EcartTemps;
  readonly envoiMurale: Instant;
  /** Instant de l'en-tête `Date` (lireDateHttp). */
  readonly date: Instant;
};

/**
 * n° 1 : aller-retour `a = receptionMonotone − envoiMonotone` ; mesure retenue si et seulement si
 * `0 ≤ a < ALLER_RETOUR_MAX_MESURE_HORLOGE` (strict ; sinon undefined). Mesure = `date − milieu`, où
 * `milieu = envoiMurale + ⌊a / 2⌋` (le milieu se compte sur l'horloge monotone : un saut de l'horloge murale pendant
 * la requête ne fausse pas la mesure).
 */
export const mesurerEcart = (e: EchangeMesurable): EcartTemps | undefined =>
  nonImplemente(`mesurerEcart (${String(e.date)})`);

/** n° 2 : ajoute la mesure à la fin et garde les NOMBRE_MESURES_HORLOGE dernières (les plus anciennes sortent). */
export const retenirMesure = (
  mesures: ReadonlyArray<EcartTemps>,
  mesure: EcartTemps,
): ReadonlyArray<EcartTemps> => nonImplemente(`retenirMesure (${String(mesures.length + mesure)})`);

/**
 * n° 2 : médiane des mesures (triées par valeur) ; nombre pair : moyenne des deux valeurs centrales arrondie vers
 * −∞ (`Math.floor`) ; aucune mesure : undefined (la correction ne change pas).
 */
export const medianeCorrection = (mesures: ReadonlyArray<EcartTemps>): EcartTemps | undefined =>
  nonImplemente(`medianeCorrection (${String(mesures.length)})`);

/** Point de contrôle du saut : couple lu au même moment (en mémoire seulement : l'horloge monotone repart à zéro). */
export type RepereHorloge = { readonly murale: Instant; readonly monotone: EcartTemps };

export type Saut =
  | { readonly type: 'AUCUN' }
  /** L'horloge murale a reculé de `ecart` (> 0) par rapport à l'horloge monotone. */
  | { readonly type: 'RECUL'; readonly ecart: EcartTemps }
  /** L'horloge murale a avancé de `ecart` (> 0) de plus que l'horloge monotone (veille possible). */
  | { readonly type: 'AVANCE'; readonly ecart: EcartTemps };

/**
 * n° 3 : `d = (courant.murale − precedent.murale) − (courant.monotone − precedent.monotone)` ;
 * `d < −SEUIL_SAUT_HORLOGE` → RECUL de `−d` ; `d > SEUIL_SAUT_HORLOGE` → AVANCE de `d` ; sinon (bornes comprises)
 * AUCUN.
 */
export const qualifierSaut = (precedent: RepereHorloge, courant: RepereHorloge): Saut =>
  nonImplemente(`qualifierSaut (${String(precedent.murale)}, ${String(courant.murale)})`);

export type EtatCorrection = {
  readonly correction: EcartTemps;
  readonly mesures: ReadonlyArray<EcartTemps>;
};

/** n° 3 : recul de `ecart` (> 0) corrigé exactement : correction + ecart, chaque mesure conservée + ecart, ordre gardé. */
export const corrigerRecul = (etat: EtatCorrection, ecart: EcartTemps): EtatCorrection =>
  nonImplemente(`corrigerRecul (${String(etat.correction + ecart)})`);

/** n° 4 (US-017 CA-13, ALR-001) : `|correction| > SEUIL_HORLOGE_DEREGLEE`, strictement. */
export const estHorlogeDereglee = (correction: EcartTemps): boolean =>
  nonImplemente(`estHorlogeDereglee (${String(correction)})`);

/**
 * n° 5 : instant corrigé (HLC, `premiereEcriture`) ramené à l'heure de l'appareil : `instant − correction`. Sert à
 * comparer la plus ancienne modification en attente à `Horloge.maintenant()` (RG-057, bandeau ; ST-US-022 §4.5).
 */
export const enHeureAppareil = (instantCorrige: Instant, correction: EcartTemps): Instant =>
  nonImplemente(`enHeureAppareil (${String(instantCorrige - correction)})`);
