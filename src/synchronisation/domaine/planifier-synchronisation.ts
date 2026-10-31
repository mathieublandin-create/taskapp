import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { ContenuFichierAppareil } from './contenu-fichier';
import type { EtatLocal } from './etat-local';
import type { PlanSynchronisation } from './meta-synchronisation';
import type { Signalements } from './signalements';

// ST-US-017 v0.5 §6.6 n° 11 : intégration d'un fichier reçu à l'incrément 2, dans la transaction du cycle.

/**
 * Détection (sur les états avant fusion), fusion (`planifierFusion`), réparation RG-048 de l'état fusionné, union des
 * valeurs écartées et des lectures reçues. `signalements` du plan : seulement les entrées nouvelles ou remplacées.
 * `meta.fusionNonDeposee = true` si le plan ou les signalements sont non vides ; `meta` vide sinon.
 */
export const planifierSynchronisation = (
  etat: EtatLocal,
  signalements: Signalements,
  recu: ContenuFichierAppareil,
  physiqueCorrigee: Instant,
): PlanSynchronisation =>
  nonImplemente(
    `planifierSynchronisation (${String(etat.version)}, ${String(signalements.lectures.size)}, ${recu.appareil}, ${String(physiqueCorrigee)})`,
  );
