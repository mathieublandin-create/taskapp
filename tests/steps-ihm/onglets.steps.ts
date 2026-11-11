/**
 * Étapes des deux onglets des scénarios `@ihm` d'US-031 (ST-US-031 §12.2 n° 1 à 5 ; S16, S16b, S16c). Les deux onglets
 * sont deux pages du même contexte persistant : ils partagent la base locale et le service worker, chacun a sa propre
 * session en mémoire. Les gestes de l'utilisateur sont ceux de `saisie.steps.ts` (aucune duplication).
 */
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';
import { choisirEspace, creerObjectifSansDelai, renommerTache } from './saisie.steps';
import { etatIndicateur, ligneObjectif, ligneTache } from './support/ecrans-ihm';
import { DELAI_ATTENTE_MS, DELAI_SYNCHRONISATION_MS, type MondeIhm } from './support/monde-ihm';
import type { NomAppareil } from '../support/banc/appareil-simule';

const attendreSynchronisationFaite = async (monde: MondeIhm): Promise<void> => {
  await expect
    .poll(async () => Promise.all(monde.onglets().map((page) => etatIndicateur(page))), {
      timeout: DELAI_SYNCHRONISATION_MS,
    })
    .toEqual(monde.onglets().map(() => 'SYN-OK'));
};

Given(
  "(que )l'application est ouverte dans deux onglets du {appareil}",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.pageCourante();
    await this.ouvrirSecondOnglet();
    await attendreSynchronisationFaite(this);
  },
);

Given(
  "(que )aucune modification n'est en attente sur le {appareil}",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await attendreSynchronisationFaite(this);
  },
);

When(
  "dans le premier onglet, l'utilisateur renomme la tâche {string} en {string}",
  async function (this: MondeIhm, ancien: string, nouveau: string) {
    await renommerTache(await this.pageCourante(), ancien, nouveau);
  },
);

When(
  "dans le second onglet, l'utilisateur crée un objectif {string} sans délai",
  async function (this: MondeIhm, intitule: string) {
    await creerObjectifSansDelai(this.ongletSecond(), intitule);
  },
);

/** Les listes de l'onglet : la tâche dans « Tâches », l'objectif dans « Objectifs » ; l'onglet revient aux tâches. */
const exigerTacheEtObjectif = async (
  page: Page,
  tache: string,
  objectif: string,
): Promise<void> => {
  await choisirEspace(page, 'TACHES');
  await expect(ligneTache(page, tache)).toHaveCount(1, { timeout: DELAI_ATTENTE_MS });
  await choisirEspace(page, 'OBJECTIFS');
  await expect(ligneObjectif(page, objectif)).toHaveCount(1, { timeout: DELAI_ATTENTE_MS });
  await choisirEspace(page, 'TACHES');
};

Then(
  "les deux onglets affichent la tâche {string} et l'objectif {string}",
  async function (this: MondeIhm, tache: string, objectif: string) {
    assert.equal(this.onglets().length, 2, 'Deux onglets doivent être ouverts');
    for (const page of this.onglets()) await exigerTacheEtObjectif(page, tache, objectif);
  },
);
