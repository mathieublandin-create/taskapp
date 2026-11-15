/**
 * Types de paramètres communs des expressions Cucumber (conventions.md §11.7) : `{appareil}`, `{duree}`, `{ecart}`,
 * `{date}`, `{heure}`, `{fuseau}`, `{intitules}`. Les formats et conversions sont dans `conversions.ts`.
 */
import { defineParameterType } from '@cucumber/cucumber';
import {
  convertirAppareil,
  convertirDuree,
  convertirEcart,
  convertirFuseau,
  convertirHeure,
  convertirIntitules,
  FRAGMENT_APPAREIL,
  FRAGMENT_DATE,
  FRAGMENT_DUREE,
  FRAGMENT_ECART,
  FRAGMENT_FUSEAU,
  FRAGMENT_HEURE,
  FRAGMENT_INTITULES,
} from './conversions';

const definir = (name: string, fragment: string, transformer: (texte: string) => unknown): void => {
  defineParameterType({ name, regexp: new RegExp(fragment), transformer });
};

// Un préfixe facultatif absent d'une étape à expression régulière arrive ici sans valeur : il reste indéfini
// (sans quoi « sans préfixe » désignerait toujours le smartphone, même quand seul le PC est connecté).
definir('appareil', FRAGMENT_APPAREIL, (texte: string | undefined) =>
  typeof texte === 'string' ? convertirAppareil(texte) : undefined,
);
definir('duree', FRAGMENT_DUREE, convertirDuree);
definir('ecart', FRAGMENT_ECART, convertirEcart);
definir('date', FRAGMENT_DATE, (texte) => texte);
definir('heure', FRAGMENT_HEURE, convertirHeure);
definir('fuseau', FRAGMENT_FUSEAU, convertirFuseau);
definir('intitules', FRAGMENT_INTITULES, convertirIntitules);
