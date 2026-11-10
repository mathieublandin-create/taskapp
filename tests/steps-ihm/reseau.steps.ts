/**
 * Étapes du réseau des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 6) : `context.setOffline` coupe le réseau du
 * navigateur (la page voit `navigator.onLine` faux et ses compositions de test n'appellent plus les ponts, H-18-2).
 */
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../support/banc/appareil-simule';
import type { MondeIhm } from './support/monde-ihm';

Given(
  '(que )le {appareil} est sans réseau',
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.assurerDemarrageInitial();
    await this.definirHorsLigne(true);
  },
);

When('le réseau revient sur le {appareil}', async function (this: MondeIhm, appareil: NomAppareil) {
  this.exigerAppareil(appareil);
  await this.definirHorsLigne(false);
  if (this.aUnePage()) await (await this.pageCourante()).waitForFunction(() => navigator.onLine);
  await this.attendreRepos();
});

When(
  'le réseau est coupé sur le {appareil} pendant la saisie',
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    await this.definirHorsLigne(true);
  },
);
