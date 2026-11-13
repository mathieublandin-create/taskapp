/**
 * Historique des objectifs (glossaire d'étapes v1.4 §11 ; ST-US-001 §12 n° 27 à 30). L'historique est lu par la requête
 * `ConsulterHistorique` et rendu par `rendreEntree` ; il n'est affiché nulle part dans l'application (CA-11).
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import { VUES_EXPOSEES } from '@src/objectifs-taches';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { valeurDe } from '../../support/environnement';
import { objectifsDe, resoudreObjectif } from '../../support/objectifs';
import { resoudreTache } from '../../support/taches';
import { etapeAssertion, type ContexteEtape } from '../../support/prefixes';
import { rendreEntree, type EntreeRendue } from '../../support/rendu-historique';

type Nature = 'OBJECTIF' | 'TACHE';

const historiqueDe = async (
  { monde, appareil }: ContexteEtape,
  intitule: string,
  nature: Nature = 'OBJECTIF',
): Promise<ReadonlyArray<EntreeRendue>> => {
  const objectifs = await objectifsDe(appareil);
  const element =
    nature === 'OBJECTIF'
      ? ({ type: 'OBJECTIF', id: await resoudreObjectif(monde, appareil, intitule) } as const)
      : ({ type: 'TACHE', id: await resoudreTache(monde, appareil, intitule) } as const);
  const journal = valeurDe(await objectifs.consulterHistorique.executer(element));
  const intitules = (await vueDe(appareil)).intitulesConnus;
  return journal.map((evenement) => rendreEntree(evenement, intitules));
};

const vueDe = async (appareil: AppareilSimule) =>
  construireVueMetier(valeurDe(await appareil.service.lire()));

const attendues = (tableau: unknown): ReadonlyArray<EntreeRendue> =>
  (tableau as DataTable).hashes().map((ligne) => ({
    evenement: ligne['événement'] ?? '',
    journee: ligne['journée'] ?? '',
    avant: ligne['avant'] ?? '',
    apres: ligne['après'] ?? '',
  }));

etapeAssertion(
  /^l'historique contient, pour l'objectif "([^"]*)" :$/,
  async (contexte, intitule, tableau) => {
    assert.deepEqual(await historiqueDe(contexte, String(intitule)), attendues(tableau));
  },
  { tableau: true },
);

etapeAssertion(
  /^l'historique de l'objectif "([^"]*)" se termine par :$/,
  async (contexte, intitule, tableau) => {
    const attendu = attendues(tableau);
    const entrees = await historiqueDe(contexte, String(intitule));
    assert.deepEqual(entrees.slice(entrees.length - attendu.length), attendu);
  },
  { tableau: true },
);

etapeAssertion(
  /^l'historique ne contient aucune entrée "([^"]*)" pour l'objectif "([^"]*)"$/,
  async (contexte, evenement, intitule) => {
    const entrees = await historiqueDe(contexte, String(intitule));
    assert.equal(entrees.filter((e) => e.evenement === evenement).length, 0);
  },
);

etapeAssertion(/^l'historique n'est affiché nulle part dans l'application$/, () => {
  assert.equal(
    VUES_EXPOSEES.filter((vue) => vue.includes('HISTORIQUE')).length,
    0,
    "Une vue d'historique est offerte à l'interface",
  );
});

// ST-US-002 §12 n° 29 : mêmes étapes pour une tâche (ST-US-001 §12 n° 27 à 29).
etapeAssertion(
  /^l'historique contient, pour la tâche "([^"]*)" :$/,
  async (contexte, intitule, tableau) => {
    assert.deepEqual(await historiqueDe(contexte, String(intitule), 'TACHE'), attendues(tableau));
  },
  { tableau: true },
);

etapeAssertion(
  /^l'historique de la tâche "([^"]*)" se termine par :$/,
  async (contexte, intitule, tableau) => {
    const attendu = attendues(tableau);
    const entrees = await historiqueDe(contexte, String(intitule), 'TACHE');
    assert.deepEqual(entrees.slice(entrees.length - attendu.length), attendu);
  },
  { tableau: true },
);

etapeAssertion(
  /^l'historique ne contient aucune entrée "([^"]*)" pour la tâche "([^"]*)"$/,
  async (contexte, evenement, intitule) => {
    const entrees = await historiqueDe(contexte, String(intitule), 'TACHE');
    assert.equal(entrees.filter((e) => e.evenement === evenement).length, 0);
  },
);
