/** Étapes du Drive simulé (glossaire d'étapes §1, §6 ; ST-US-022 §12.1 n° 15 à 17, 43 ; ST-US-017 §12.1 n° 11 à 14). */
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { connecter } from '../../support/compte/etapes-compte';
import { convertirAppareil, FRAGMENT_APPAREIL, FRAGMENT_DATE } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';
import { creerObjectifEnregistre } from '../../support/synchronisation/echanges';
import {
  etatMetierDuDrive,
  identifiantsDe,
  identifiantsDuCompte,
  objectifsDuDrive,
} from '../../support/synchronisation/drive-banc';

const DOSSIER = 'application/vnd.google-apps.folder';

Given(
  "(que )le Drive du compte {string} ne contient aucune donnée de l'application",
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Given('(que )le Drive est momentanément indisponible', function (this: MondeDoneJuan) {
  this.banc.google.driveMomentanementIndisponible();
});

Given(
  '(que )le Drive est désactivé pour le compte {string}',
  function (this: MondeDoneJuan, nomCompte: string) {
    this.banc.google.drive(nomCompte).desactiverPourLeCompte();
  },
);

Then(
  "aucune donnée n'est créée dans le Drive du compte {string}",
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Then(
  'le Drive du compte {string} contient un dossier visible nommé {string}',
  function (this: MondeDoneJuan, nomCompte: string, nom: string) {
    const dossiers = this.banc.google
      .drive(nomCompte)
      .fichiers()
      .filter((f) => f.nom === nom && f.mimeType === DOSSIER && !f.supprime);
    assert.equal(dossiers.length, 1, `Dossier « ${nom} » absent ou en double`);
    assert.equal(dossiers[0]?.parent, undefined, 'Le dossier doit être à la racine du Drive');
  },
);

// ---------------------------------------------------------------- Contenu du Drive (ST-US-017 §12.1 n° 11 à 14)

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;

/** L'unique objectif non supprimé de cet intitulé dans le Drive du compte. */
const objectifUniqueDuDrive = async (monde: MondeDoneJuan, compte: string, intitule: string) => {
  const trouves = await objectifsDuDrive(monde.banc.google.drive(compte), intitule);
  assert.equal(
    trouves.length,
    1,
    `Drive du compte ${compte} : ${String(trouves.length)} objectif(s) « ${intitule} »`,
  );
  return trouves[0];
};

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient l'objectif ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    await objectifUniqueDuDrive(this, compte, intitule);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient l'objectif ${TEXTE} avec le délai ${DATE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string, delai: string) {
    assert.equal((await objectifUniqueDuDrive(this, compte, intitule))?.delai, delai);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} ne contient pas l'objectif ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    assert.deepEqual(await objectifsDuDrive(this.banc.google.drive(compte), intitule), []);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} ne contient aucune donnée du compte ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, autre: string) {
    const contenu = identifiantsDe(await etatMetierDuDrive(this.banc.google.drive(compte)));
    const autres = await identifiantsDuCompte(this, autre);
    assert.deepEqual(
      [...contenu].filter((id) => autres.has(id)),
      [],
      `Données du compte ${autre} dans le Drive du compte ${compte}`,
    );
  },
);

// Glossaire §12 : le banc n'observe aucune requête sortante hors du service Google simulé (hooks.ts).
Then(
  new RegExp(
    `^aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte ${TEXTE}$`,
  ),
  function (this: MondeDoneJuan, compte: string) {
    assert.deepEqual(this.requetesInterdites, []);
    assert.ok(
      this.banc.google.drive(compte).fichiers().length > 0,
      `Rien n'a été transmis au Drive du compte ${compte}`,
    );
  },
);

Given(
  new RegExp(`^(?:que )?le Drive du compte ${TEXTE} est plein$`),
  function (this: MondeDoneJuan, compte: string) {
    this.banc.google.drive(compte).plein();
  },
);

When(
  new RegExp(`^de l'espace est libéré dans le Drive du compte ${TEXTE}$`),
  function (this: MondeDoneJuan, compte: string) {
    this.banc.google.drive(compte).liberer();
  },
);

// n° 14 : le PC du banc est connecté au compte si besoin, crée l'objectif et le dépose.
Given(
  new RegExp(
    `^(?:que )?le Drive du compte ${TEXTE} contient un objectif ${TEXTE} de délai ${DATE} enregistré par le (${FRAGMENT_APPAREIL})$`,
  ),
  async function (
    this: MondeDoneJuan,
    compte: string,
    intitule: string,
    delai: string,
    nomAppareil: string,
  ) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const application = await appareil.assurerOuverte();
    if (application.espace() === undefined) await connecter(this, appareil, compte);
    await creerObjectifEnregistre(this, appareil, intitule, delai);
  },
);
