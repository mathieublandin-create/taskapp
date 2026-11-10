/**
 * Étapes du compte des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 7). Google est simulé par le processus cucumber
 * (`PontFauxGoogle`) : l'utilisateur clique sur « Continuer avec Google » ; le geste de reconnexion est le bouton de
 * l'indicateur `SYN-SESSION`.
 */
import { When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { NomAppareil } from '../support/banc/appareil-simule';
import { boutonConnexion, ecranAffiche, espaceApplication, indicateur } from './support/ecrans-ihm';
import type { MondeIhm } from './support/monde-ihm';

When(
  "l'utilisateur se connecte avec le compte {string} sur le {appareil}",
  async function (this: MondeIhm, compte: string, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    this.pontGoogle.ouvrirSession(compte);
    let page = await this.pageCourante();
    if ((await ecranAffiche(page)) !== 'CONNEXION') {
      await this.ouvrirApplication();
      page = await this.pageCourante();
    }
    await boutonConnexion(page).click();
    await expect(espaceApplication(page)).toBeVisible();
  },
);

When(
  "sur le {appareil}, l'utilisateur fait le geste de reconnexion",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await indicateur(page).getByRole('button').click();
  },
);
