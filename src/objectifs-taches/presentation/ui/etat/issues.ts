import type { Resultat } from '../../../../commun/domaine/resultat';
import type { ErreurDepotLocal } from '../../../../synchronisation';
import type { RefusMetier } from '../../../domaine/refus';
import { messagesDeRefus, type MessageRefus } from '../../modeles-de-vue/messages-de-refus';

// Issue d'une commande, commune aux magasins des objectifs et des tâches : faite, refusée avec des messages à
// afficher sous les champs, ou enregistrement impossible (ERR-014).
export type IssueCommande =
  | { readonly type: 'FAITE' }
  | { readonly type: 'REFUSEE'; readonly messages: ReadonlyArray<MessageRefus> }
  | { readonly type: 'ENREGISTREMENT_IMPOSSIBLE' };

const TYPES_ERREUR_DEPOT: ReadonlyArray<ErreurDepotLocal['type']> = [
  'EspaceLocalNonOuvert',
  'EcritureLocaleImpossible',
  'DonneesLocalesIllisibles',
];

export const estRefusMetier = (erreur: RefusMetier | ErreurDepotLocal): erreur is RefusMetier =>
  !(TYPES_ERREUR_DEPOT as ReadonlyArray<string>).includes(erreur.type);

export const issueDe = (r: Resultat<unknown, RefusMetier | ErreurDepotLocal>): IssueCommande => {
  if (r.ok) return { type: 'FAITE' };
  return estRefusMetier(r.erreur)
    ? { type: 'REFUSEE', messages: messagesDeRefus(r.erreur) }
    : { type: 'ENREGISTREMENT_IMPOSSIBLE' };
};

/** Messages d'une issue : ceux du refus, aucun pour les autres issues. */
export const messagesDeIssue = (issue: IssueCommande): ReadonlyArray<MessageRefus> =>
  issue.type === 'REFUSEE' ? issue.messages : [];
