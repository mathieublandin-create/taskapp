/**
 * Assertions d'affichage des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 9) : rôles accessibles, `data-etat`,
 * `data-code`, avec attente (`expect` de Playwright, 5 s au plus) ; jamais d'attente d'une durée fixe.
 */
import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { jourDeReference } from '@src/commun/domaine/temps/jour-de-reference';
import { formaterDate } from '@src/commun/presentation/format/date';
import { date as dateCalendaire } from '../support/valeurs';
import type { NomAppareil } from '../support/banc/appareil-simule';
import { espaceApplication, indicateur, ligneTache } from './support/ecrans-ihm';
import type { MondeIhm } from './support/monde-ihm';

Then(
  "sur le {appareil}, les données présentes sur le {appareil} s'affichent aussitôt",
  function (this: MondeIhm, appareil: NomAppareil, present: NomAppareil) {
    this.exigerAppareil(appareil);
    this.exigerAppareil(present);
    const instantane = this.instantaneOuverture;
    assert.ok(instantane, `Aucune ouverture du ${appareil}`);
    assert.equal(
      instantane.ecran,
      'APPLICATION',
      `Écran à l'ouverture : ${String(instantane.ecran)}`,
    );
    assert.ok(instantane.intitulesTaches.length > 0, `Aucune donnée affichée sur le ${appareil}`);
  },
);

Then(
  'sur le {appareil}, la tâche {string} existe avec le délai {date}',
  async function (this: MondeIhm, appareil: NomAppareil, intitule: string, delai: string) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    const ligne = ligneTache(page, intitule);
    await expect(ligne).toHaveCount(1);
    const attendu = formaterDate(
      dateCalendaire(delai),
      jourDeReference(this.banc.temps.maintenant()),
    );
    await expect(ligne.locator('.ligne-tache-meta > span').first()).toHaveText(attendu);
  },
);

Then(
  "sur le {appareil}, la tâche {string} n'existe pas",
  async function (this: MondeIhm, appareil: NomAppareil, intitule: string) {
    this.exigerAppareil(appareil);
    // Une page qui n'affiche pas l'application ne prouve rien : la liste doit être là, et la synchronisation finie.
    const page = await this.pageCourante();
    await expect(espaceApplication(page)).toBeVisible();
    await this.attendreRepos();
    await expect(ligneTache(page, intitule)).toHaveCount(0);
  },
);

Then(
  'sur le {appareil}, la tâche {string} porte la mention {string}',
  async function (this: MondeIhm, appareil: NomAppareil, intitule: string, code: string) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await expect(ligneTache(page, intitule).locator(`[data-code="${code}"]`)).toHaveCount(1);
  },
);

Then(
  "sur le {appareil}, l'indicateur de synchronisation est {string}, avec l'action {string}",
  async function (this: MondeIhm, appareil: NomAppareil, code: string, action: string) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await expect(indicateur(page)).toHaveAttribute('data-etat', code);
    await expect(indicateur(page).getByRole('button')).toHaveText(action);
  },
);
