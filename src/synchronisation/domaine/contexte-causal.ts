import type { IdAppareil } from '../../commun/domaine/identifiants';
import { comparerHlc, maxHlc, type Hlc } from './hlc';

// DAT §4.2.1 (ST-socle-ecriture.md §6.2) : une clé par appareil ; absente = vide.
export type ContexteCausal = Readonly<Record<string, Hlc>>;

export const CONTEXTE_VIDE: ContexteCausal = {};

/** c ⊔ { hlc.appareil : hlc }. */
export const ajouterAuContexte = (c: ContexteCausal, hlc: Hlc): ContexteCausal => {
  const existant = c[hlc.appareil];
  return { ...c, [hlc.appareil]: existant === undefined ? hlc : maxHlc(existant, hlc) };
};

/** Maximum par appareil. */
export const fusionnerContextes = (a: ContexteCausal, b: ContexteCausal): ContexteCausal =>
  Object.values(b).reduce<ContexteCausal>(ajouterAuContexte, a);

export const retirerAppareil = (c: ContexteCausal, appareil: IdAppareil): ContexteCausal =>
  Object.fromEntries(Object.entries(c).filter(([cle]) => cle !== appareil));

/** Partie commune à toute Ecriture<V>. */
export type EcritureDatee = { readonly hlc: Hlc; readonly contexte: ContexteCausal };

export const contexteDeNouvelleEcriture = (
  precedente: EcritureDatee | undefined,
  auteur: IdAppareil,
): ContexteCausal =>
  precedente === undefined
    ? CONTEXTE_VIDE
    : retirerAppareil(ajouterAuContexte(precedente.contexte, precedente.hlc), auteur);

/** Connaissance par le contexte seul (écriture d'un autre appareil). */
const connueParLeContexte = (gagnante: EcritureDatee, autre: EcritureDatee): boolean => {
  const connue = gagnante.contexte[autre.hlc.appareil];
  return connue !== undefined && comparerHlc(connue, autre.hlc) >= 0;
};

/**
 * ST-socle v0.3.2 §6.2, DAT v0.11.9 §4.2.1 (condition J1, UT-SOC-15, 16) : une écriture du même appareil est connue si
 * elle est antérieure ou égale (`autre.hlc ≤ gagnante.hlc`) ; une écriture postérieure (réparation RG-048 écrite après
 * une pierre tombale) ne l'est pas. Une écriture d'un autre appareil est connue par le contexte.
 */
export const estConnue = (gagnante: EcritureDatee, autre: EcritureDatee): boolean =>
  autre.hlc.appareil === gagnante.hlc.appareil
    ? comparerHlc(autre.hlc, gagnante.hlc) <= 0
    : connueParLeContexte(gagnante, autre);

/** Mêmes appareils et, pour chacun, le même HLC (ST-US-017 v0.8 §6.6 n° 3 b). */
export const contextesEgaux = (c1: ContexteCausal, c2: ContexteCausal): boolean => {
  const entrees = Object.entries(c1);
  return (
    entrees.length === Object.keys(c2).length &&
    entrees.every(([appareil, h1]) => {
      const h2 = c2[appareil];
      return h2 !== undefined && comparerHlc(h1, h2) === 0;
    })
  );
};
