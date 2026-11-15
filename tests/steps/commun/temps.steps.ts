/**
 * Étapes du temps (glossaire d'étapes §4 ; ST-socle-ecriture.md §12 n° 1). Les préfixes « {ecart} plus tard, » et
 * « au même instant exact, » sont portés par `etapeAction` (tests/support/prefixes.ts).
 */
import { Given, When } from '@cucumber/cucumber';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import type { MondeDoneJuan } from '../../support/monde';
import { instantDepuisHeureMurale, type HeureLocale } from '../../support/temps';

Given(
  '(que )nous sommes le {date} à {heure} heure de {fuseau}',
  async function (this: MondeDoneJuan, date: string, heure: HeureLocale, fuseau: Fuseau) {
    this.banc.temps.positionner(instantDepuisHeureMurale(date, heure, fuseau));
    // ST-US-018 §12.1 n° 4 : les échéances du planificateur devenues échues sont exécutées, et leurs cycles attendus.
    this.banc.planificateur.executerEchus();
    await this.banc.attendreCycles();
  },
);

// ST-US-017 §12.1 n° 8 : le temps avance d'échéance en échéance, les cycles déclenchés sont attendus.
const avancer = async function (this: MondeDoneJuan, ecart: EcartTemps): Promise<void> {
  await this.banc.avancerTemps(ecart);
};
When("l'horloge avance de {ecart}, sans aucune action de l'utilisateur", avancer);
When("l'horloge avance de {ecart} depuis l'ouverture", avancer);
When("l'horloge avance de {ecart} depuis la reconnexion", avancer);

// ST-US-017 §12.1 n° 8 (S12) : horloge murale propre à l'appareil, en avance sur le temps du banc.
Given(
  "(que )l'horloge du {appareil} est en avance de {ecart}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil, ecart: EcartTemps) {
    this.banc.appareil(nomAppareil).horloge.dereglerDe(ecart);
  },
);

// ST-US-017 v0.11 §12.7 H1 (S12c, S13) : horloge murale propre à l'appareil, en retard ; l'écart est mesuré aux
// échanges suivants avec Google (§6.8 n° 1, 2).
Given(
  "(que )l'horloge du {appareil} est en retard de {ecart}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil, ecart: EcartTemps) {
    this.banc
      .appareil(nomAppareil)
      .horloge.dereglerDe(EcartTemps.depuisMillisecondes(-Number(ecart)));
  },
);

// H2 (S12d) : saut de l'horloge murale seule, sans avancer le temps du banc (aucun contrôle de saut ne passe).
Given(
  "(que )l'heure du {appareil} est changée en retard de {ecart}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil, ecart: EcartTemps) {
    this.banc
      .appareil(nomAppareil)
      .horloge.changerHeureMurale(EcartTemps.depuisMillisecondes(-Number(ecart)));
  },
);
