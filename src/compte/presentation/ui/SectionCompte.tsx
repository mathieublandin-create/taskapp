import { IonText } from '@ionic/react';
import {
  libelleActionCompte,
  type ActionCompte,
  type ModeleVueSectionCompte,
} from '../modeles-de-vue/section-compte';

// ECR-011, section « Compte » (US-022 CA-6, CA-10 ; DEC-015 : aucune action combinée).
export type ProprietesSectionCompte = {
  readonly vue: ModeleVueSectionCompte;
  readonly surAction: (action: ActionCompte) => void;
};

const BoutonActionCompte = ({
  action,
  surAction,
}: {
  readonly action: ActionCompte;
  readonly surAction: (action: ActionCompte) => void;
}) => (
  <button
    type="button"
    className="bouton-natif"
    data-action={action}
    {...(action === 'SUPPRIMER_DONNEES' ? { 'data-variante': 'danger' } : {})}
    onClick={() => {
      surAction(action);
    }}
  >
    {libelleActionCompte(action)}
  </button>
);

export const SectionCompte = ({ vue, surAction }: ProprietesSectionCompte) => (
  <section aria-labelledby="compte-titre">
    <h2 id="compte-titre">Compte</h2>
    <IonText>
      <p>{vue.adresse}</p>
    </IonText>
    <IonText>
      <p data-code={vue.dossier.code}>{vue.dossier.libelle}</p>
    </IonText>
    {vue.fuseau === undefined ? null : (
      <IonText data-etat={vue.fuseau.code}>
        <p>{vue.fuseau.libelle}</p>
        <p>{vue.fuseau.texte}</p>
      </IonText>
    )}
    {vue.actions.map((action) => (
      <BoutonActionCompte key={action} action={action} surAction={surAction} />
    ))}
  </section>
);
