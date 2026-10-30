/**
 * Outils des étapes d'échange avec le Drive (ST-US-017 §12.1 n° 2 à 4, 14 à 16) : opérations au passé, enregistrées
 * ou non dans le Drive.
 */
import assert from 'node:assert/strict';
import type { AppareilSimule } from '../banc/appareil-simule';
import type { MondeDoneJuan } from '../monde';
import type { ContexteEtape } from '../prefixes';
import { ligneObjectifDe, memoriserObjectif, objectifsDe } from '../objectifs';
import { ligneTacheDe, memoriserTache, resoudreTache } from '../taches';
import { date } from '../valeurs';

/** Crée l'objectif par le cas d'usage de l'appareil et le mémorise sous son intitulé ; échec si refusé. */
export const creerObjectifAuPasse = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
  delai?: string,
): Promise<void> => {
  const resultat = await (
    await objectifsDe(appareil)
  ).creerObjectif.executer({
    intitule,
    ...(delai === undefined ? {} : { delai: date(delai) }),
  });
  assert.ok(resultat.ok, `Création de « ${intitule} » refusée : ${JSON.stringify(resultat)}`);
  memoriserObjectif(monde, intitule, resultat.valeur);
};

/** « … enregistre ses modifications dans le Drive » : dépôt seul (ST-US-017 §12.1 n° 4). */
export const enregistrerDansLeDrive = async (appareil: AppareilSimule): Promise<void> => {
  await appareil.assurerOuverte();
  await appareil.cycle.deposerMaintenant();
};

/** Opération au passé « …, enregistré dans le Drive » : création puis dépôt, qui doit aboutir (n° 15). */
export const creerObjectifEnregistre = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
  delai?: string,
): Promise<void> => {
  await creerObjectifAuPasse(monde, appareil, intitule, delai);
  assert.equal(await appareil.cycle.deposerMaintenant(), 'TERMINE', 'Dépôt dans le Drive refusé');
};

/** « …, pas encore enregistré dans le Drive » : l'objectif porte la mention MEN-ATTENTE (n° 16). */
export const verifierNonEnregistre = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<void> => {
  const ligne = await ligneObjectifDe(monde, appareil, intitule);
  assert.equal(ligne.attente?.code, 'MEN-ATTENTE', `« ${intitule} » est déjà enregistré`);
};

/**
 * État établi d'une précondition (H-5) : avec deux appareils ouverts sur un espace, échange jusqu'au repos ; sinon
 * un cycle de l'appareil (sans effet hors ligne ou sans accès : les modifications restent en attente).
 * Un état n'est pas une chronologie : le temps simulé que l'échange a fait passer est rendu (« nous sommes le … »).
 */
export const etablirDansLeDrive = async ({ monde, appareil }: ContexteEtape): Promise<void> => {
  const depart = monde.banc.temps.maintenant();
  const ouverts = monde.banc
    .appareils()
    .filter((a) => a.estOuverte() && a.application.espace() !== undefined);
  if (ouverts.length > 1) await monde.banc.synchroniserJusquAuRepos();
  else await appareil.echangerAvecLeDrive();
  monde.banc.temps.positionner(depart);
};

/** Renomme la tâche par le cas d'usage de l'appareil et mémorise son nouvel intitulé ; échec si refusé. */
export const renommerTacheAuPasse = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
  nouveau: string,
): Promise<void> => {
  const tacheId = await resoudreTache(monde, appareil, intitule);
  const resultat = await (
    await objectifsDe(appareil)
  ).renommerTache.executer({ tacheId, intitule: nouveau });
  assert.ok(resultat.ok, `Renommage de « ${intitule} » refusé : ${JSON.stringify(resultat)}`);
  memoriserTache(monde, nouveau.trim(), tacheId);
};

/** Modifie le délai de la tâche par le cas d'usage de l'appareil ; échec si refusé. */
export const modifierDelaiTacheAuPasse = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
  delai: string,
): Promise<void> => {
  const tacheId = await resoudreTache(monde, appareil, intitule);
  const resultat = await (
    await objectifsDe(appareil)
  ).modifierDelaiTache.executer({ tacheId, delai: date(delai) });
  assert.ok(resultat.ok, `Modification de « ${intitule} » refusée : ${JSON.stringify(resultat)}`);
};

/** « …, pas encore enregistré dans le Drive » : la tâche porte la mention MEN-ATTENTE. */
export const verifierTacheNonEnregistree = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<void> => {
  const ligne = await ligneTacheDe(monde, appareil, intitule);
  assert.equal(ligne.attente?.code, 'MEN-ATTENTE', `« ${intitule} » est déjà enregistrée`);
};
