/**
 * Étapes du temps (glossaire d'étapes §4 ; ST-socle-ecriture.md §12 n° 1). Les préfixes « {ecart} plus tard, » et
 * « au même instant exact, » sont portés par `etapeAction` (tests/support/prefixes.ts).
 */
import { Given, When } from '@cucumber/cucumber';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
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
