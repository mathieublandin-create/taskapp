import type { AdresseGoogle } from '../../domaine/identite';

// ECR-011, section « Compte » ; US-022 CA-6, CA-10 ; DEC-015 (aucune action combinée).
export type ActionCompte = 'SE_DECONNECTER' | 'SUPPRIMER_DONNEES';

export type ModeleVueSectionCompte = {
  readonly adresse: string;
  readonly actions: ReadonlyArray<ActionCompte>;
  readonly dossier: { readonly code: 'SYN-FEUILLE-DOSSIER'; readonly libelle: string };
};

const ACTIONS: ReadonlyArray<ActionCompte> = ['SE_DECONNECTER', 'SUPPRIMER_DONNEES'];

/** Guide v0.2.16 §6.6 ; repris par le catalogue commun (`libelle`) au rang 2. */
const LIBELLE_DOSSIER = 'Dossier « Done Juan » dans votre Google Drive';

export const construireSectionCompte = (c: {
  readonly adresse: AdresseGoogle;
}): ModeleVueSectionCompte => ({
  adresse: c.adresse,
  actions: ACTIONS,
  dossier: { code: 'SYN-FEUILLE-DOSSIER', libelle: LIBELLE_DOSSIER },
});
