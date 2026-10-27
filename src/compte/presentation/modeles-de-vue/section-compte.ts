import { nonImplemente } from '@non-implemente';
import type { AdresseGoogle } from '../../domaine/identite';

// ECR-011, section « Compte » ; US-022 CA-6, CA-10 ; DEC-015 (aucune action combinée).
export type ActionCompte = 'SE_DECONNECTER' | 'SUPPRIMER_DONNEES';

export type ModeleVueSectionCompte = {
  readonly adresse: string;
  readonly actions: ReadonlyArray<ActionCompte>;
  readonly dossier: { readonly code: 'SYN-FEUILLE-DOSSIER'; readonly libelle: string };
};

export const construireSectionCompte = (_c: {
  readonly adresse: AdresseGoogle;
}): ModeleVueSectionCompte => nonImplemente('construireSectionCompte');
