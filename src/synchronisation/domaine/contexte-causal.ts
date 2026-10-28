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

export const estConnue = (gagnante: EcritureDatee, autre: EcritureDatee): boolean => {
  if (autre.hlc.appareil === gagnante.hlc.appareil) return true;
  const connue = gagnante.contexte[autre.hlc.appareil];
  return connue !== undefined && comparerHlc(connue, autre.hlc) >= 0;
};
