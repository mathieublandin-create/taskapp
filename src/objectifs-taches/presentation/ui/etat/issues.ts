import type { Resultat } from '../../../../commun/domaine/resultat';
import type { ErreurDepotLocal } from '../../../../synchronisation';
import type { RefusMetier } from '../../../domaine/refus';
import { messagesDeRefus, type MessageRefus } from '../../modeles-de-vue/messages-de-refus';

// Issue d'une commande, commune aux magasins des objectifs et des tâches : faite, refusée avec des messages à
// afficher sous les champs, enregistrement impossible (ERR-014) ou saisie bloquée en consultation seule (RG-058,
// ST-US-017 v0.11 §6.8 n° 9 : toast `TST-CONSULTATION-SEULE` côté écran).
export type IssueCommande =
  | { readonly type: 'FAITE' }
  | { readonly type: 'REFUSEE'; readonly messages: ReadonlyArray<MessageRefus> }
  | { readonly type: 'ENREGISTREMENT_IMPOSSIBLE' }
  | { readonly type: 'CONSULTATION_SEULE' };

const TYPES_ERREUR_DEPOT: ReadonlyArray<ErreurDepotLocal['type']> = [
  'EspaceLocalNonOuvert',
  'EcritureLocaleImpossible',
  'DonneesLocalesIllisibles',
  'ConsultationSeule',
];

export const estRefusMetier = (erreur: RefusMetier | ErreurDepotLocal): erreur is RefusMetier =>
  !(TYPES_ERREUR_DEPOT as ReadonlyArray<string>).includes(erreur.type);

export const issueDe = (r: Resultat<unknown, RefusMetier | ErreurDepotLocal>): IssueCommande => {
  if (r.ok) return { type: 'FAITE' };
  if (estRefusMetier(r.erreur)) return { type: 'REFUSEE', messages: messagesDeRefus(r.erreur) };
  return r.erreur.type === 'ConsultationSeule'
    ? { type: 'CONSULTATION_SEULE' }
    : { type: 'ENREGISTREMENT_IMPOSSIBLE' };
};

/** Messages d'une issue : ceux du refus, aucun pour les autres issues (dont une confirmation demandée). */
export const messagesDeIssue = (
  issue: IssueCommande | { readonly type: 'CONFIRMATION_REQUISE' },
): ReadonlyArray<MessageRefus> => (issue.type === 'REFUSEE' ? issue.messages : []);
