import { libelle } from '../../../commun/presentation/messages/libelle';
import type { AdresseGoogle } from '../../domaine/identite';

// ECR-011, section « Compte » ; US-022 CA-6, CA-10 ; DEC-015 (aucune action combinée).
export type ActionCompte = 'SE_DECONNECTER' | 'SUPPRIMER_DONNEES';

export type ModeleVueSectionCompte = {
  readonly adresse: string;
  readonly actions: ReadonlyArray<ActionCompte>;
  readonly dossier: { readonly code: 'SYN-FEUILLE-DOSSIER'; readonly libelle: string };
};

const ACTIONS: ReadonlyArray<ActionCompte> = ['SE_DECONNECTER', 'SUPPRIMER_DONNEES'];

/** Libellé du bouton de chaque action de la section « Compte » (ECR-011). */
export const libelleActionCompte = (action: ActionCompte): string =>
  action === 'SE_DECONNECTER'
    ? libelle('CNF-DECONNEXION', {}, 'action')
    : libelle('CNF-SUPPR-DONNEES', { variante: 'section-compte' }, 'action');

export const construireSectionCompte = (c: {
  readonly adresse: AdresseGoogle;
}): ModeleVueSectionCompte => ({
  adresse: c.adresse,
  actions: ACTIONS,
  dossier: { code: 'SYN-FEUILLE-DOSSIER', libelle: libelle('SYN-FEUILLE-DOSSIER') },
});
