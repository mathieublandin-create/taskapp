/**
 * État de synchronisation affiché (glossaire d'étapes §6 ; ST-US-022 §12.1 n° 39, 40) : indicateur et bandeau,
 * vérifiés par les modèles de vue `construireIndicateur` et `construireBandeau`, construits comme l'interface à
 * partir de `consulterEtatSynchronisation` et de l'horloge de l'appareil.
 */
import assert from 'node:assert/strict';
import {
  construireBandeau,
  type ModeleVueBandeau,
} from '@src/synchronisation/presentation/modeles-de-vue/bandeau';
import {
  construireIndicateur,
  type ModeleVueIndicateur,
} from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { listeObjectifsDe } from '../../support/objectifs';
import { etapeAssertion } from '../../support/prefixes';

/** Libellés des actions (guide §6.6.2, §6.6.3) ↦ codes des modèles de vue. */
const ACTIONS: Readonly<Record<string, string>> = {
  'Reprendre la synchronisation': 'REPRENDRE_LA_SYNCHRONISATION',
  'Se reconnecter': 'SE_RECONNECTER',
  'Mettre à jour': 'METTRE_A_JOUR',
};

const codeAction = (libelle: unknown): string => {
  const code = ACTIONS[String(libelle)];
  if (code === undefined) throw new Error(`Action inconnue : « ${String(libelle)} »`);
  return code;
};

const indicateurDe = async (appareil: AppareilSimule): Promise<ModeleVueIndicateur | undefined> => {
  const etat = await (await appareil.assurerOuverte()).consulterEtat();
  return etat === undefined ? undefined : construireIndicateur(etat);
};

const bandeauDe = async (appareil: AppareilSimule): Promise<ModeleVueBandeau | undefined> => {
  const etat = await (await appareil.assurerOuverte()).consulterEtat();
  return etat === undefined ? undefined : construireBandeau(etat, appareil.horloge.maintenant());
};

// ---------------------------------------------------------------- Indicateur (n° 39)

etapeAssertion(
  /^l'indicateur de synchronisation est "([^"]*)", avec l'action "([^"]*)"$/,
  async ({ appareil }, code, action) => {
    const indicateur = await indicateurDe(appareil);
    assert.deepEqual([indicateur?.code, indicateur?.action], [code, codeAction(action)]);
  },
);

etapeAssertion(
  /^l'indicateur de synchronisation est (?:toujours )?"([^"]*)"$/,
  async ({ appareil }, code) => {
    assert.equal((await indicateurDe(appareil))?.code, code);
  },
);

etapeAssertion(
  /^l'indicateur de synchronisation n'est (?:plus|pas) "([^"]*)"$/,
  async ({ appareil }, code) => {
    assert.notEqual((await indicateurDe(appareil))?.code, code);
  },
);

// ---------------------------------------------------------------- Bandeau (n° 40)

etapeAssertion(
  /^le bandeau "([^"]*)" est affiché, avec l'action "([^"]*)"$/,
  async ({ appareil }, code, action) => {
    const bandeau = await bandeauDe(appareil);
    assert.deepEqual([bandeau?.code, bandeau?.action], [code, codeAction(action)]);
  },
);

etapeAssertion(/^le bandeau "([^"]*)" n'est pas affiché$/, async ({ appareil }, code) => {
  assert.notEqual((await bandeauDe(appareil))?.code, code);
});

etapeAssertion(/^aucun bandeau n'est affiché$/, async ({ appareil }) => {
  assert.equal(await bandeauDe(appareil), undefined);
});

// Le modèle de vue n'en construit jamais plus d'un (DEC-025) : il en faut un.
etapeAssertion(/^un seul bandeau est affiché$/, async ({ appareil }) => {
  assert.notEqual(await bandeauDe(appareil), undefined, 'Aucun bandeau affiché');
});

// ---------------------------------------------------------------- Mention « heure de Paris » (ST-US-017 §12 n° 23)

// RL-LOT-001-P3 : la liste des objectifs porte la puce ; la liste « Tâches » et la ligne « Fuseau » ne sont pas vérifiées ici.
etapeAssertion(
  /^la mention "([^"]*)" (apparaît|n'apparaît pas)$/,
  async ({ appareil }, code, presence) => {
    assert.equal(code, 'MEN-HEURE-PARIS', `Mention non prise en charge : ${String(code)}`);
    const liste = await listeObjectifsDe(appareil);
    assert.equal(liste.mentionHeureParis?.code === 'MEN-HEURE-PARIS', presence === 'apparaît');
  },
);
