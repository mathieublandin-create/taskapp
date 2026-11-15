/**
 * Étapes du Contexte des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 1, 2). L'appareil qui n'est pas dans le navigateur
 * est un `AppareilSimule` du banc : il se connecte au compte, crée les données par les fonctions de `tests/support/`
 * (les mêmes qu'au profil `default`) et les dépose dans le `FauxDrive`. Le navigateur charge ces données à son
 * premier besoin (`MondeIhm.assurerDemarrageInitial`).
 */
import assert from 'node:assert/strict';
import { Given, type DataTable } from '@cucumber/cucumber';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { AppareilSimule, NomAppareil } from '../support/banc/appareil-simule';
import { connecter } from '../support/compte/etapes-compte';
import { lesTachesSuivantes, lireLignesContexte } from '../support/construction-taches';
import { creerObjectifAuPasse } from '../support/synchronisation/echanges';
import { etablirDansLeDrive } from '../support/synchronisation/echanges';
import { instantDepuisHeureMurale, type HeureLocale } from '../support/temps';
import type { MondeIhm } from './support/monde-ihm';

/** L'appareil du banc : celui des deux qui n'est pas dans le navigateur. */
const appareilDuBanc = (monde: MondeIhm): AppareilSimule =>
  monde.banc.appareil(monde.appareilIhm === 'pc' ? 'smartphone' : 'pc');

Given(
  '(que )nous sommes le {date} à {heure} heure de {fuseau}',
  async function (this: MondeIhm, date: string, heure: HeureLocale, fuseau: Fuseau) {
    const instant = instantDepuisHeureMurale(date, heure, fuseau);
    this.banc.temps.positionner(instant);
    await this.fixerHeure(instant);
  },
);

Given(
  "(que )l'utilisateur utilise le compte {string} sur le {appareil} et sur le {appareil}, tous deux à jour",
  async function (this: MondeIhm, compte: string, premier: NomAppareil, second: NomAppareil) {
    assert.ok(
      [premier, second].includes(this.appareilIhm),
      `Le ${this.appareilIhm} du navigateur n'est pas désigné par « ${premier} et ${second} »`,
    );
    const depart = this.banc.temps.maintenant();
    await connecter(this, appareilDuBanc(this), compte);
    this.pontGoogle.ouvrirSession(compte);
    this.banc.temps.positionner(depart); // un état établi, pas une chronologie (H-5)
  },
);

Given(
  '(que )un objectif {string} de délai {date}',
  async function (this: MondeIhm, intitule: string, delai: string) {
    const appareil = appareilDuBanc(this);
    await creerObjectifAuPasse(this, appareil, intitule, delai);
    await etablirDansLeDrive({ monde: this, appareil });
  },
);

Given('(que )les tâches suivantes :', async function (this: MondeIhm, tableau: DataTable) {
  await lesTachesSuivantes(
    { monde: this, appareil: appareilDuBanc(this) },
    lireLignesContexte(tableau),
  );
});
