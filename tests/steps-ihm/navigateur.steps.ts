/**
 * Étapes du navigateur des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 3 à 5 ; ST-US-031 §12.1 n° 2, 4). Fermer la page
 * garde le contexte persistant (IndexedDB, service worker) ; fermer le navigateur ou éteindre l'appareil le recrée sur
 * le même dossier de profil ; effacer les données du navigateur les supprime pour l'origine de l'application.
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { NomAppareil } from '../support/banc/appareil-simule';
import { elementsDeDoneJuan } from './support/ecrans-ihm';
import { PAGE_ERREUR_NAVIGATEUR, type MondeIhm } from './support/monde-ihm';
import { ORIGINE_IHM } from './support/serveur-ihm';

Given(
  "(que )l'application est fermée sur le {appareil}",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.assurerDemarrageInitial();
    await this.fermerPage();
  },
);

When("l'utilisateur ferme l'onglet de l'application", async function (this: MondeIhm) {
  await this.fermerPage();
});

When("l'utilisateur ferme le navigateur", async function (this: MondeIhm) {
  await this.fermerNavigateur();
});

// L'extinction recrée le navigateur ; l'horloge monotone de la page repart d'elle-même avec lui.
When(
  'le {appareil} est éteint puis rallumé',
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.fermerNavigateur();
  },
);

When(
  "l'utilisateur ouvre l'application sur le {appareil} depuis son adresse web",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.assurerDemarrageInitial();
    await this.ouvrirApplication();
  },
);

/** `start_url` du manifeste servi (ST-US-031 §12.1 n° 2 : l'application installée s'ouvre à cette adresse). */
const adresseApplicationInstallee = async (): Promise<string> => {
  const manifeste = (await (await fetch(`${ORIGINE_IHM}/manifest.webmanifest`)).json()) as {
    readonly start_url: string;
  };
  return new URL(manifeste.start_url, `${ORIGINE_IHM}/`).href;
};

When(
  "l'utilisateur ouvre l'application sur le {appareil} depuis l'application installée",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.assurerDemarrageInitial();
    await this.ouvrirApplication(await adresseApplicationInstallee());
  },
);

Given(
  "(que )l'application n'a jamais été ouverte dans le navigateur du {appareil}",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.reinitialiserNavigateur();
    this.demarrageInitial = 'SANS_OBJET';
  },
);

When(
  "l'utilisateur efface les données de son navigateur sur le {appareil}",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.effacerDonneesNavigateur();
    await this.ouvrirApplication();
  },
);

Then(
  "sur le {appareil}, aucun écran de Done Juan n'est affiché",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await expect(elementsDeDoneJuan(await this.pageCourante())).toHaveCount(0);
  },
);

Then(
  'le navigateur du {appareil} affiche son propre message de page inaccessible',
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await expect.poll(() => page.url()).toMatch(PAGE_ERREUR_NAVIGATEUR);
  },
);
