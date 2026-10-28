import { BoiteConfirmation } from '../../../commun/presentation/ui/boite-confirmation';
import type { ModeleVueConfirmationCompte } from '../modeles-de-vue/confirmations-compte';

// conventions.md §8.6 ; guide §6.6.7 : la boîte de confirmation commune (role="alertdialog", « Annuler » focalisé,
// action destructrice en rouge) alimentée par le modèle de vue du compte.
export type ProprietesDialogue = {
  readonly vue: ModeleVueConfirmationCompte;
  readonly surConfirmer: () => void;
  readonly surAnnuler: () => void;
};

export const DialogueConfirmation = ({ vue, surConfirmer, surAnnuler }: ProprietesDialogue) => (
  <BoiteConfirmation
    code={vue.code}
    titre={vue.titre}
    {...(vue.texte === undefined ? {} : { texte: vue.texte })}
    actionLibelle={vue.boutonAction}
    rouge={vue.rouge}
    surConfirmer={surConfirmer}
    surAnnuler={surAnnuler}
  />
);
