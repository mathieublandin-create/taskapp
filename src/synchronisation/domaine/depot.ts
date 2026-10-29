import type { ContenuFichierAppareil, Generation } from './contenu-fichier';
import type { EtatLocal } from './etat-local';
import { comparerHlc, type Hlc } from './hlc';
import type { IndexEnAttente } from './index-en-attente';
import type { MetaSynchronisation } from './meta-synchronisation';
import { SCHEMA_VERSION } from './version-schema';

// DAT §4.1.5 bis, §4.3 ; ENF-T-07 (ST-US-017 §6.2).
export const contenuAEnvoyer = (
  etat: EtatLocal,
  p: { readonly versionApplication: string; readonly generation: Generation },
): ContenuFichierAppareil => ({
  schemaVersion: SCHEMA_VERSION,
  versionApplication: p.versionApplication,
  generation: p.generation,
  appareil: etat.appareilId,
  registres: [...etat.registres.values()],
  journal: [...etat.journal.values()],
});

/** Retire les entrées dont derniereHlc ≤ jusqua. */
export const retirerDeposees = (index: IndexEnAttente, jusqua: Hlc): IndexEnAttente =>
  new Map([...index].filter(([, { entree }]) => comparerHlc(entree.derniereHlc, jusqua) > 0));

/** Index non vide, fichier propre absent, fusion non déposée, ou dernierHlc ≠ deposeJusquA. */
export const doitDeposer = (etat: EtatLocal, meta: MetaSynchronisation): boolean =>
  etat.enAttente.size > 0 ||
  meta.fichierPropre === undefined ||
  meta.fusionNonDeposee ||
  (etat.dernierHlc !== undefined &&
    (meta.deposeJusquA === undefined || comparerHlc(etat.dernierHlc, meta.deposeJusquA) !== 0));
