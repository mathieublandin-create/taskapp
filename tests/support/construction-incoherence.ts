/**
 * Construction de « la tâche X, terminée (ou abandonnée), est signalée en incohérence avec sa sous-tâche à faire Y »
 * (glossaire d'étapes §1 ; ST-US-024 §12 n° 16, ST-US-017 §12.5 N10). Aucun cas d'usage ne produit seul cette
 * situation : le PC termine (ou abandonne) la tâche parente pendant que le smartphone, hors ligne, rouvre (ou reprend)
 * la sous-tâche. Une fois l'échange fait, le PC est retiré du banc : l'incohérence s'observe sur le smartphone, qui
 * agit seul ensuite (les étapes sans préfixe visent le smartphone).
 */
import assert from 'node:assert/strict';
import type { AppareilSimule } from './banc/appareil-simule';
import { connecter } from './compte/etapes-compte';
import { creerSousTache, creerTache } from './construction-taches';
import { objectifsDe } from './objectifs';
import type { ContexteEtape } from './prefixes';
import { resoudreTache, resumeTacheDe } from './taches';

export type EtatParentIncoherent = 'terminée' | 'abandonnée';

const DELAI_PARENTE = '2026-11-30';
const DELAI_SOUS_TACHE = '2026-11-20';
const ESTIMATION_MINUTES = 60;

const compteConnecte = ({ monde, appareil }: ContexteEtape): string => {
  const etat = appareil.application.session.etat();
  assert.ok(etat.type === 'OUVERTE', 'Aucun compte connecté sur le smartphone');
  const nom = monde.banc.google.nomDe(etat.identite);
  assert.ok(nom !== undefined, 'Compte connecté inconnu du banc');
  return nom;
};

/** Parente et sous-tâche créées sur le smartphone, la sous-tâche déjà terminée (ou abandonnée). */
const preparerSurLeSmartphone = async (
  contexte: ContexteEtape,
  etat: EtatParentIncoherent,
  parente: string,
  sousTache: string,
): Promise<void> => {
  const { monde, appareil } = contexte;
  const creation = await creerTache(contexte, {
    intitule: parente,
    delai: DELAI_PARENTE,
    estimationMinutes: ESTIMATION_MINUTES,
    objectifs: [],
  });
  assert.ok(creation.ok, `Création de « ${parente} » refusée : ${JSON.stringify(creation)}`);
  const ajout = await creerSousTache(contexte, parente, {
    intitule: sousTache,
    delai: DELAI_SOUS_TACHE,
    estimationMinutes: ESTIMATION_MINUTES,
  });
  assert.ok(ajout.ok, `Création de « ${sousTache} » refusée : ${JSON.stringify(ajout)}`);
  const tacheId = await resoudreTache(monde, appareil, sousTache);
  const objectifs = await objectifsDe(appareil);
  const fin =
    etat === 'terminée'
      ? await objectifs.terminerTache.executer({ tacheId })
      : await objectifs.abandonnerTache.executer({ tacheId });
  assert.ok(fin.ok, `Fin de « ${sousTache} » refusée : ${JSON.stringify(fin)}`);
};

/** Le PC termine (ou abandonne) la parente ; le smartphone, hors ligne, rouvre (ou reprend) la sous-tâche. */
const diverger = async (
  { monde }: ContexteEtape,
  smartphone: AppareilSimule,
  pc: AppareilSimule,
  etat: EtatParentIncoherent,
  parente: string,
  sousTache: string,
): Promise<void> => {
  smartphone.reseau.couper();
  const parenteId = await resoudreTache(monde, pc, parente);
  const sousTacheId = await resoudreTache(monde, smartphone, sousTache);
  const surPc = await objectifsDe(pc);
  const surSmartphone = await objectifsDe(smartphone);
  const decision =
    etat === 'terminée'
      ? await surPc.terminerTache.executer({ tacheId: parenteId })
      : await surPc.abandonnerTache.executer({ tacheId: parenteId });
  assert.ok(decision.ok, `Fin de « ${parente} » refusée sur le PC : ${JSON.stringify(decision)}`);
  const retour =
    etat === 'terminée'
      ? await surSmartphone.rouvrirTache.executer({ tacheId: sousTacheId })
      : await surSmartphone.reprendreTache.executer({ tacheId: sousTacheId });
  assert.ok(retour.ok, `Retour de « ${sousTache} » refusé : ${JSON.stringify(retour)}`);
  smartphone.reseau.retablir();
  await monde.banc.attendreCycles();
  await monde.banc.synchroniserJusquAuRepos();
};

export const tacheEnIncoherence = async (
  contexte: ContexteEtape,
  etat: EtatParentIncoherent,
  parente: string,
  sousTache: string,
): Promise<void> => {
  const { monde, appareil: smartphone } = contexte;
  const depart = monde.banc.temps.maintenant();
  const pc = monde.banc.appareil('pc');
  await preparerSurLeSmartphone(contexte, etat, parente, sousTache);
  await connecter(monde, pc, compteConnecte(contexte));
  await monde.banc.synchroniserJusquAuRepos();
  await diverger(contexte, smartphone, pc, etat, parente, sousTache);
  monde.banc.retirerAppareil('pc');
  monde.banc.temps.positionner(depart); // un état établi, pas une chronologie (H-5)
  const resume = await resumeTacheDe(monde, smartphone, parente);
  assert.equal(
    resume.incoherence?.sousTachesAFaire.length,
    1,
    `« ${parente} » n'est pas incohérente`,
  );
};
