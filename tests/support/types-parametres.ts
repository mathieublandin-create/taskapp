/**
 * Types de paramètres communs des expressions Cucumber (conventions.md §11.7) : `{appareil}`, `{duree}`, `{ecart}`,
 * `{date}`, `{heure}`, `{fuseau}`. Les formats et conversions sont dans `conversions.ts`.
 */
import { defineParameterType } from '@cucumber/cucumber';
import {
  convertirAppareil,
  convertirDuree,
  convertirEcart,
  convertirFuseau,
  convertirHeure,
  FRAGMENT_APPAREIL,
  FRAGMENT_DATE,
  FRAGMENT_DUREE,
  FRAGMENT_ECART,
  FRAGMENT_FUSEAU,
  FRAGMENT_HEURE,
} from './conversions';

const definir = (name: string, fragment: string, transformer: (texte: string) => unknown): void => {
  defineParameterType({ name, regexp: new RegExp(fragment), transformer });
};

definir('appareil', FRAGMENT_APPAREIL, convertirAppareil);
definir('duree', FRAGMENT_DUREE, convertirDuree);
definir('ecart', FRAGMENT_ECART, convertirEcart);
definir('date', FRAGMENT_DATE, (texte) => texte);
definir('heure', FRAGMENT_HEURE, convertirHeure);
definir('fuseau', FRAGMENT_FUSEAU, convertirFuseau);
