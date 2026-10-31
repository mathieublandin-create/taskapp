import type { ContenuFichierAppareil, Generation } from './contenu-fichier';
import type { EtatLocal } from './etat-local';
import { comparerHlc, type Hlc } from './hlc';
import type { IndexEnAttente } from './index-en-attente';
import type { MetaSynchronisation } from './meta-synchronisation';
import { SIGNALEMENTS_VIDES, type Signalements } from './signalements';
import type { IdValeurEcartee } from './valeurs-ecartees';
import { SCHEMA_VERSION } from './version-schema';

/** Ordre des tableaux du fichier d'appareil (ST-US-017 v0.5 §5.2) : identifiant, en unités de code. */
export const trierParIdentifiant = <T extends { readonly id: IdValeurEcartee }>(
  entrees: Iterable<T>,
): ReadonlyArray<T> => [...entrees].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

// DAT §4.1.5 bis, §4.3 ; ENF-T-07 (ST-US-017 §6.2).
export const contenuAEnvoyer = (
  etat: EtatLocal,
  p: {
    readonly versionApplication: string;
    readonly generation: Generation;
    /** ST-US-017 v0.5 §5.2 (incrément 2, tranche B2) : recopiés s'ils sont non vides, triés par identifiant. */
    readonly signalements?: Signalements;
  },
): ContenuFichierAppareil => {
  const { valeursEcartees, lectures } = p.signalements ?? SIGNALEMENTS_VIDES;
  return {
    schemaVersion: SCHEMA_VERSION,
    versionApplication: p.versionApplication,
    generation: p.generation,
    appareil: etat.appareilId,
    registres: [...etat.registres.values()],
    journal: [...etat.journal.values()],
    // Absents s'ils sont vides (§5.2) : un contenu sans signalement est celui de l'incrément 1.
    ...(valeursEcartees.size === 0
      ? {}
      : { valeursEcartees: trierParIdentifiant(valeursEcartees.values()) }),
    ...(lectures.size === 0 ? {} : { lectures: trierParIdentifiant(lectures.values()) }),
  };
};

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
