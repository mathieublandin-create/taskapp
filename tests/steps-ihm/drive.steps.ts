/**
 * Assertions sur le Drive du compte des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 10) : lecture du `FauxDrive` du
 * processus cucumber par les fonctions du profil `default` (`tests/support/synchronisation/drive-banc.ts`), une fois les
 * appels du pont en cours terminés.
 */
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { tachesDuDrive } from '../support/synchronisation/drive-banc';
import { DELAI_SYNCHRONISATION_MS, type MondeIhm } from './support/monde-ihm';

const exemplairesDansLeDrive = async (
  monde: MondeIhm,
  compte: string,
  intitule: string,
): Promise<number> => (await tachesDuDrive(monde.banc.google.drive(compte), intitule)).length;

const attendreLaTache = (monde: MondeIhm, compte: string, intitule: string): Promise<void> =>
  expect
    .poll(() => exemplairesDansLeDrive(monde, compte, intitule), {
      timeout: DELAI_SYNCHRONISATION_MS,
      message: `La tâche « ${intitule} » n'est pas dans le Drive du compte ${compte}`,
    })
    .toBeGreaterThan(0);

Then(
  'le Drive du compte {string} contient la tâche {string}',
  async function (this: MondeIhm, compte: string, intitule: string) {
    await attendreLaTache(this, compte, intitule);
  },
);

Then(
  'le Drive du compte {string} contient la tâche {string} exactement une fois',
  async function (this: MondeIhm, compte: string, intitule: string) {
    await attendreLaTache(this, compte, intitule);
    await this.attendreRepos();
    assert.equal(await exemplairesDansLeDrive(this, compte, intitule), 1);
  },
);
