/** Étapes des modifications en attente et des échanges (glossaire d'étapes §1, §3 ; ST-US-022 §12.1 n° 30 ; ST-US-017 §12.1). */
import assert from 'node:assert/strict';
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { FRAGMENT_DATE } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';
import { creerObjectifsEnAttente } from '../../support/objectifs';
import { etapeAction, etapeContexte } from '../../support/prefixes';
import {
  creerObjectifAuPasse,
  creerObjectifEnregistre,
  enregistrerDansLeDrive,
  verifierNonEnregistre,
} from '../../support/synchronisation/echanges';

Given(
  "(qu')aucune modification n'est en attente sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const application = await this.banc.appareil(nomAppareil).assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, 0);
  },
);

// n objectifs sont créés, sans dépôt dans le Drive : aucun temps ne passe, la temporisation de 5 s n'échoit pas.
// Pluriel « modification(s) » : expression régulière (conventions.md §11.6).
etapeContexte(
  /^(\d+) modifications?(?:\(s\))? (?:ne sont|n'est) pas encore enregistrées?(?:\(s\))? dans le Drive$/,
  async ({ appareil }, n) => {
    await creerObjectifsEnAttente(appareil, Number(n));
    const application = await appareil.assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, Number(n));
  },
);

// ---------------------------------------------------------------- Échanges avec le Drive (ST-US-017 §12.1 n° 2 à 4, 15, 16)

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;

When('les deux appareils échangent leurs modifications', async function (this: MondeDoneJuan) {
  await this.banc.synchroniserJusquAuRepos();
});

// H-5 : un seul cycle complet, joué avant une coupure déclarée du même appareil.
When(
  'le {appareil} échange ses modifications avec le Drive',
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    await appareil.assurerOuverte();
    await appareil.echangerAvecLeDrive();
  },
);

When(
  'le {appareil} enregistre ses modifications dans le Drive',
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    await enregistrerDansLeDrive(this.banc.appareil(nomAppareil));
  },
);

etapeAction(/^l'utilisateur enregistre ses modifications dans le Drive$/, async ({ appareil }) => {
  await enregistrerDansLeDrive(appareil);
});

etapeContexte(
  new RegExp(
    `^l'utilisateur a créé un objectif ${TEXTE} de délai ${DATE}, enregistré dans le Drive$`,
  ),
  async ({ monde, appareil }, intitule, delai) => {
    await creerObjectifEnregistre(monde, appareil, String(intitule), String(delai));
  },
);

etapeContexte(
  new RegExp(
    `^l'utilisateur a créé un objectif ${TEXTE} sans délai(, pas encore enregistré dans le Drive)?$`,
  ),
  async ({ monde, appareil }, intitule, nonEnregistre) => {
    await creerObjectifAuPasse(monde, appareil, String(intitule));
    if (nonEnregistre !== undefined) await verifierNonEnregistre(monde, appareil, String(intitule));
  },
);
