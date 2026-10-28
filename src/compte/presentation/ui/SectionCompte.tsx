import type { ActionCompte, ModeleVueSectionCompte } from '../modeles-de-vue/section-compte';

// ECR-011, section « Compte » (US-022 CA-6, CA-10 ; DEC-015 : aucune action combinée).
const LIBELLES: Readonly<Record<ActionCompte, string>> = {
  SE_DECONNECTER: 'Se déconnecter',
  SUPPRIMER_DONNEES: 'Supprimer les données de cet appareil',
};

export type ProprietesSectionCompte = {
  readonly vue: ModeleVueSectionCompte;
  readonly surAction: (action: ActionCompte) => void;
};

export const SectionCompte = ({ vue, surAction }: ProprietesSectionCompte) => (
  <section aria-labelledby="compte-titre">
    <h2 id="compte-titre">Compte</h2>
    <p>{vue.adresse}</p>
    <p data-code={vue.dossier.code}>{vue.dossier.libelle}</p>
    {vue.actions.map((action) => (
      <button
        key={action}
        type="button"
        data-action={action}
        onClick={() => {
          surAction(action);
        }}
      >
        {LIBELLES[action]}
      </button>
    ))}
  </section>
);
