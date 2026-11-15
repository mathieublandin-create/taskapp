/**
 * Assertions sur le Drive du compte des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 10 ; ST-US-031 §12.2 n° 6) : lecture du `FauxDrive` du
 * processus cucumber par les fonctions du profil `default` (`tests/support/synchronisation/drive-banc.ts`), une fois les
 * appels du pont en cours terminés.
 */
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { objectifsDuDrive, tachesDuDrive } from '../support/synchronisation/drive-banc';
import { DELAI_SYNCHRONISATION_MS, type MondeIhm } from './support/monde-ihm';

type ElementDuDrive = 'tâche' | 'objectif';

const exemplairesDansLeDrive = async (
  monde: MondeIhm,
  element: ElementDuDrive,
  compte: string,
  intitule: string,
): Promise<number> => {
  const drive = monde.banc.google.drive(compte);
  const trouves =
    element === 'tâche'
      ? await tachesDuDrive(drive, intitule)
      : await objectifsDuDrive(drive, intitule);
  return trouves.length;
};

const attendreElement = (
  monde: MondeIhm,
  element: ElementDuDrive,
  compte: string,
  intitule: string,
): Promise<void> =>
  expect
    .poll(() => exemplairesDansLeDrive(monde, element, compte, intitule), {
      timeout: DELAI_SYNCHRONISATION_MS,
      message: `${element} « ${intitule} » absent du Drive du compte ${compte}`,
    })
    .toBeGreaterThan(0);

/** Présent dans le Drive, puis plus rien en cours (une seconde écriture éventuelle a eu lieu) : exactement un exemplaire. */
const exigerExactementUn = async (
  monde: MondeIhm,
  element: ElementDuDrive,
  compte: string,
  intitule: string,
): Promise<void> => {
  await attendreElement(monde, element, compte, intitule);
  await monde.attendreRepos();
  assert.equal(await exemplairesDansLeDrive(monde, element, compte, intitule), 1);
};

Then(
  'le Drive du compte {string} contient la tâche {string}',
  async function (this: MondeIhm, compte: string, intitule: string) {
    await attendreElement(this, 'tâche', compte, intitule);
  },
);

Then(
  'le Drive du compte {string} contient la tâche {string} exactement une fois',
  async function (this: MondeIhm, compte: string, intitule: string) {
    await exigerExactementUn(this, 'tâche', compte, intitule);
  },
);

Then(
  "le Drive du compte {string} contient l'objectif {string} exactement une fois",
  async function (this: MondeIhm, compte: string, intitule: string) {
    await exigerExactementUn(this, 'objectif', compte, intitule);
  },
);
