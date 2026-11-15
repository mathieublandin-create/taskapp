import type { Instant } from '../../commun/domaine/temps/instant';
import type { ContenuFichierAppareil } from './contenu-fichier';
import type { EtatLocal } from './etat-local';
import { planifierFusion } from './fusion';
import { fusionnerLectures } from './lectures';
import type { PlanSynchronisation } from './meta-synchronisation';
import { cleEnTexte } from './information';
import type { PlanEcriture } from './planifier-ecritures';
import { reparerHierarchie, type ReparationHierarchie } from './reparation-hierarchie';
import type { AjoutsSignalements, Signalements } from './signalements';
import {
  detecterValeursEcartees,
  fusionnerValeursEcartees,
  type ValeurEcartee,
} from './valeurs-ecartees';

// ST-US-017 v0.6 §6.6 n° 11 : intégration d'un fichier reçu à l'incrément 2, dans la transaction du cycle.

/**
 * (d) Registres de la réparation appliqués à l'état fusionné ; ceux de la fusion qu'elle réécrit sont retirés.
 * Entrées de journal de la réparation après celles de la fusion (v0.6) ; ni l'index des écritures en attente ni
 * `dernierHlc` ne dépendent d'elles (condition C4) : seul le HLC des registres de réparation compte.
 */
const appliquerReparation = (fusion: PlanEcriture, rep: ReparationHierarchie): PlanEcriture => {
  const reecrites = new Set(rep.registresEcrits.map((r) => cleEnTexte(r.cle)));
  const registres = new Map(fusion.etatApres.registres);
  for (const r of rep.registresEcrits) registres.set(cleEnTexte(r.cle), r);
  const journal = new Map(fusion.etatApres.journal);
  for (const e of rep.evenementsAjoutes) journal.set(e.id, e);
  return {
    ...fusion,
    etatApres: {
      ...fusion.etatApres,
      registres,
      journal,
      ...(rep.dernierHlc === undefined ? {} : { dernierHlc: rep.dernierHlc }),
    },
    registresEcrits: [
      ...fusion.registresEcrits.filter((r) => !reecrites.has(cleEnTexte(r.cle))),
      ...rep.registresEcrits,
    ],
    evenementsAjoutes: [...fusion.evenementsAjoutes, ...rep.evenementsAjoutes],
  };
};

/** Entrées de l'union nouvelles ou dont la référence a changé (seules à écrire). */
const aEcrire = <K, V>(connues: ReadonlyMap<K, V>, union: ReadonlyMap<K, V>): ReadonlyArray<V> =>
  [...union].flatMap(([cle, valeur]) => (connues.get(cle) === valeur ? [] : [valeur]));

/** (e), (f) : union des valeurs écartées (constatées, reçues, réparation) et des lectures reçues ; à écrire. */
const ajoutsSignalements = (
  signalements: Signalements,
  recu: ContenuFichierAppareil,
  constatees: ReadonlyArray<ValeurEcartee>,
): AjoutsSignalements => {
  const valeurs = fusionnerValeursEcartees(signalements.valeursEcartees, [
    ...constatees,
    ...(recu.valeursEcartees ?? []),
  ]);
  const lectures = fusionnerLectures(signalements.lectures, recu.lectures ?? []);
  return {
    valeursEcartees: aEcrire(signalements.valeursEcartees, valeurs),
    lectures: aEcrire(signalements.lectures, lectures),
  };
};

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
): PlanSynchronisation => {
  const constatees = detecterValeursEcartees(etat, {
    registres: new Map(recu.registres.map((r) => [cleEnTexte(r.cle), r])),
  });
  const fusion = planifierFusion(etat, recu);
  const rep = reparerHierarchie(fusion.etatApres, physiqueCorrigee);
  const plan = appliquerReparation(fusion, rep);
  const ajouts = ajoutsSignalements(signalements, recu, [...constatees, ...rep.valeursEcartees]);
  const signale = ajouts.valeursEcartees.length > 0 || ajouts.lectures.length > 0;
  const apporte = plan.registresEcrits.length > 0 || plan.evenementsAjoutes.length > 0 || signale;
  return {
    plan,
    meta: apporte ? { fusionNonDeposee: true } : {},
    ...(signale ? { signalements: ajouts } : {}),
    ...(rep.deplacementsSansEntree === undefined
      ? {}
      : { deplacementsSansEntree: rep.deplacementsSansEntree }),
  };
};
