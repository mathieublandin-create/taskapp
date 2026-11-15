/**
 * Choix après ERR-012 (glossaire d'étapes §1, §3, §6 ; ST-US-017 v0.10 §12.6 n° R5, R7 à R10) : les actions sont celles
 * du contrôleur de l'appareil, les assertions lisent la vue qu'il affiche (`vueAffichee`, une fois les cycles terminés).
 */
import assert from 'node:assert/strict';
import { succes } from '@src/commun/domaine/resultat';
import type { ModeleVueChoixRestauration } from '@src/synchronisation/presentation/modeles-de-vue/choix-restauration';
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { etapeAction, etapeAssertion } from '../../support/prefixes';

type ActionChoix = 'restaurer' | 'repartirDeZero' | 'deciderPlusTard';

/** Noms des actions dans les phrases ↦ propriétés du modèle de vue. */
const ACTIONS: Readonly<Record<string, ActionChoix>> = {
  restaurer: 'restaurer',
  'repartir de zéro': 'repartirDeZero',
  'décider plus tard': 'deciderPlusTard',
};

const choixDe = async (appareil: AppareilSimule): Promise<ModeleVueChoixRestauration | undefined> =>
  (await appareil.vueAffichee()).choixRestauration?.vue;

const actionDe = (nom: unknown): ActionChoix => {
  const action = ACTIONS[String(nom)];
  assert.ok(action, `Action inconnue : « ${String(nom)} »`);
  return action;
};

// ---------------------------------------------------------------- Actions (n° R5)

etapeAction(/^l'utilisateur choisit de restaurer ses données$/, async ({ appareil }) => {
  await appareil.controleur.demanderRestauration();
  await appareil.vueAffichee();
});

etapeAction(/^l'utilisateur décide plus tard$/, async ({ appareil }) => {
  await appareil.controleur.deciderPlusTard();
  await appareil.vueAffichee();
});

/** `RepartirDeZero.evaluer` donne la confirmation ; la commande en attente l'exécute à « l'utilisateur confirme ». */
etapeAction(/^l'utilisateur choisit de repartir de zéro$/, async ({ monde, appareil }) => {
  const confirmation = await appareil.controleur.evaluerRepartirDeZero();
  assert.ok(confirmation, `« Repartir de zéro » n'a plus d'objet sur le ${appareil.nom}`);
  monde.commandesEnAttente.set(appareil.nom, {
    description: 'repartir de zéro',
    confirmation: { code: confirmation.code },
    executer: async () => {
      await appareil.controleur.repartirDeZero();
      return succes(undefined);
    },
  });
});

/** Évaluer puis renoncer : aucune commande n'est gardée. */
etapeAction(
  /^l'utilisateur choisit de repartir de zéro et renonce$/,
  async ({ monde, appareil }) => {
    const confirmation = await appareil.controleur.evaluerRepartirDeZero();
    assert.ok(confirmation, `« Repartir de zéro » n'a plus d'objet sur le ${appareil.nom}`);
    monde.commandesEnAttente.delete(appareil.nom);
    await appareil.vueAffichee();
  },
);

// ---------------------------------------------------------------- Assertions (n° R7 à R10)

etapeAssertion(
  /^l'utilisateur se voit proposer "restaurer" et "repartir de zéro"$/,
  async ({ appareil }) => {
    assert.equal(
      (await choixDe(appareil))?.propose,
      true,
      `Aucun choix proposé sur le ${appareil.nom}`,
    );
  },
);

etapeAssertion(
  /^aucun choix entre restaurer et repartir de zéro n'est demandé$/,
  async ({ appareil }) => {
    assert.equal(await choixDe(appareil), undefined, `Un choix est demandé sur le ${appareil.nom}`);
  },
);

/** Sans choix affiché, aucune action n'est disponible. */
const estDisponible = async (appareil: AppareilSimule, nom: unknown): Promise<boolean> =>
  (await choixDe(appareil))?.[actionDe(nom)].disponible === true;

etapeAssertion(
  /^l'action "(restaurer|repartir de zéro|décider plus tard)" (est|n'est pas) disponible$/,
  async ({ appareil }, nom, forme) => {
    assert.equal(
      await estDisponible(appareil, nom),
      forme === 'est',
      `Action « ${String(nom)} » sur le ${appareil.nom}`,
    );
  },
);

etapeAssertion(/^la restauration est en attente du retour du réseau$/, async ({ appareil }) => {
  assert.equal((await choixDe(appareil))?.restaurationEnAttente, true);
});
