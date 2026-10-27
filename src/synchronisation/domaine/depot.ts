import { nonImplemente } from '@non-implemente';
import type { ContenuFichierAppareil, Generation } from './contenu-fichier';
import type { EtatLocal } from './etat-local';
import type { Hlc } from './hlc';
import type { IndexEnAttente } from './index-en-attente';
import type { MetaSynchronisation } from './meta-synchronisation';

// DAT §4.1.5 bis, §4.3 ; ENF-T-07 (ST-US-017 §6.2).
export const contenuAEnvoyer = (
  _etat: EtatLocal,
  _p: { readonly versionApplication: string; readonly generation: Generation },
): ContenuFichierAppareil => nonImplemente('contenuAEnvoyer');

/** Retire les entrées dont derniereHlc ≤ jusqua. */
export const retirerDeposees = (_index: IndexEnAttente, _jusqua: Hlc): IndexEnAttente =>
  nonImplemente('retirerDeposees');

/** Index non vide, fichier propre absent, fusion non déposée, ou dernierHlc ≠ deposeJusquA. */
export const doitDeposer = (_etat: EtatLocal, _meta: MetaSynchronisation): boolean =>
  nonImplemente('doitDeposer');
