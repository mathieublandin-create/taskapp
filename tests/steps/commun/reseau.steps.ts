/** Étapes du réseau (glossaire d'étapes §1, §3 ; ST-US-022 §12.1 n° 17, 18). */
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  '(que )le {appareil} est sans réseau',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    this.banc.appareil(nomAppareil).reseau.couper();
  },
);

Given(
  '(que )le réseau du {appareil} est coupé pendant la connexion',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    this.banc.appareil(nomAppareil).fournisseur.couperLaProchaineConnexion();
  },
);

// Rang 1 : le réseau est rétabli ; au rang 3, son retour déclenche le cycle de synchronisation (ST-US-017).
When(
  'le réseau revient sur le {appareil}',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    this.banc.appareil(nomAppareil).reseau.retablir();
  },
);
