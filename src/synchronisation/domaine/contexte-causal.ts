import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { Hlc } from './hlc';

// DAT §4.2.1 (ST-socle-ecriture.md §6.2) : une clé par appareil ; absente = vide.
export type ContexteCausal = Readonly<Record<string, Hlc>>;

export const CONTEXTE_VIDE: ContexteCausal = {};

/** Maximum par appareil. */
export const fusionnerContextes = (_a: ContexteCausal, _b: ContexteCausal): ContexteCausal =>
  nonImplemente('fusionnerContextes');

/** c ⊔ { hlc.appareil : hlc }. */
export const ajouterAuContexte = (_c: ContexteCausal, _hlc: Hlc): ContexteCausal =>
  nonImplemente('ajouterAuContexte');

export const retirerAppareil = (_c: ContexteCausal, _appareil: IdAppareil): ContexteCausal =>
  nonImplemente('retirerAppareil');

/** Partie commune à toute Ecriture<V>. */
export type EcritureDatee = { readonly hlc: Hlc; readonly contexte: ContexteCausal };

export const contexteDeNouvelleEcriture = (
  _precedente: EcritureDatee | undefined,
  _auteur: IdAppareil,
): ContexteCausal => nonImplemente('contexteDeNouvelleEcriture');

export const estConnue = (_gagnante: EcritureDatee, _autre: EcritureDatee): boolean =>
  nonImplemente('estConnue');
