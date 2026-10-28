/** Étapes du Drive simulé (glossaire d'étapes §1, §6 ; ST-US-022 §12.1 n° 15 à 17). */
import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import type { MondeDoneJuan } from '../../support/monde';

const DOSSIER = 'application/vnd.google-apps.folder';

Given(
  /^(?:que )?le Drive du compte "([A-Z])" ne contient aucune donnée de l'application$/,
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Given(/^(?:que )?le Drive est momentanément indisponible$/, function (this: MondeDoneJuan) {
  this.banc.google.driveMomentanementIndisponible();
});

Given(
  /^(?:que )?le Drive est désactivé pour le compte "([A-Z])"$/,
  function (this: MondeDoneJuan, nomCompte: string) {
    this.banc.google.drive(nomCompte).desactiverPourLeCompte();
  },
);

Then(
  /^aucune donnée n'est créée dans le Drive du compte "([A-Z])"$/,
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Then(
  /^le Drive du compte "([A-Z])" contient un dossier visible nommé "([^"]+)"$/,
  function (this: MondeDoneJuan, nomCompte: string, nom: string) {
    const dossiers = this.banc.google
      .drive(nomCompte)
      .fichiers()
      .filter((f) => f.nom === nom && f.mimeType === DOSSIER && !f.supprime);
    assert.equal(dossiers.length, 1, `Dossier « ${nom} » absent ou en double`);
    assert.equal(dossiers[0]?.parent, undefined, 'Le dossier doit être à la racine du Drive');
  },
);
