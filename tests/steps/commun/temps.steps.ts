/**
 * Étapes du temps (glossaire d'étapes §4 ; ST-socle-ecriture.md §12 n° 1). Les préfixes « {ecart} plus tard, » et
 * « au même instant exact, » sont portés par `etapeAction` (tests/support/prefixes.ts).
 */
import { Given } from '@cucumber/cucumber';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { MondeDoneJuan } from '../../support/monde';
import { instantDepuisHeureMurale, type HeureLocale } from '../../support/temps';

Given(
  '(que )nous sommes le {date} à {heure} heure de {fuseau}',
  function (this: MondeDoneJuan, date: string, heure: HeureLocale, fuseau: Fuseau) {
    this.banc.temps.positionner(instantDepuisHeureMurale(date, heure, fuseau));
  },
);
