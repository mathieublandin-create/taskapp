import { useState, type RefObject } from 'react';
import { BoiteConfirmation } from '../../../../commun/presentation/ui/boite-confirmation';
import type { ModeleVueConfirmation } from '../../modeles-de-vue/confirmation';
import type { IssueSaisie, IssueTache } from '../etat/magasin-taches';

// Commande dont l'évaluation peut demander une confirmation (conventions.md §8.6) : abandon, reprise, réouverture.
// La boîte (guide §6.6.7) n'est pas rouge ; « Annuler », la touche Échap et la confirmation la ferment seules et rendent
// le focus à l'élément d'origine. L'issue de la commande, faite ou refusée, est toujours rendue à l'écran.
export type Focalisable = { readonly focus: () => void };

type ConfirmationEnAttente = {
  readonly modele: ModeleVueConfirmation;
  readonly confirmer: () => Promise<IssueTache>;
};

export type CommandeConfirmee = {
  readonly enAttente: ConfirmationEnAttente | undefined;
  /** Lance la commande : demande la confirmation, ou rend son issue à `surIssue`. */
  readonly lancer: (commande: () => Promise<IssueSaisie>) => Promise<void>;
  readonly confirmer: (enAttente: ConfirmationEnAttente) => Promise<void>;
  readonly fermer: () => void;
};

export const useCommandeConfirmee = (
  retourFocus: RefObject<Focalisable | null>,
  surIssue: (issue: IssueTache) => void,
): CommandeConfirmee => {
  const [enAttente, setEnAttente] = useState<ConfirmationEnAttente | undefined>(undefined);
  const fermer = (): void => {
    setEnAttente(undefined);
    retourFocus.current?.focus();
  };
  const lancer = async (commande: () => Promise<IssueSaisie>): Promise<void> => {
    const issue = await commande();
    if (issue.type === 'CONFIRMATION_REQUISE') {
      setEnAttente({ modele: issue.confirmation, confirmer: issue.confirmer });
    } else {
      surIssue(issue);
    }
  };
  const confirmer = async (attente: ConfirmationEnAttente): Promise<void> => {
    surIssue(await attente.confirmer());
    fermer();
  };
  return { enAttente, lancer, confirmer, fermer };
};

export const ConfirmationCommande = ({ commande }: { readonly commande: CommandeConfirmee }) => {
  const { enAttente } = commande;
  return enAttente === undefined ? null : (
    <BoiteConfirmation
      code={enAttente.modele.code}
      titre={enAttente.modele.titre}
      {...(enAttente.modele.texte === undefined ? {} : { texte: enAttente.modele.texte })}
      actionLibelle={enAttente.modele.actionLibelle}
      rouge={false}
      surConfirmer={() => {
        void commande.confirmer(enAttente);
      }}
      surAnnuler={commande.fermer}
    />
  );
};
