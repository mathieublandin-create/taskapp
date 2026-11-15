import type { ReactNode } from 'react';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { ModeleVueRacine } from '../modeles-de-vue/racine';

// ST-US-022 §4.5 : écran racine (RG-019) ; cadre « Attente » d'ECR-010 (SYN-REDIRECTION, Q-ST022-STE-1).
export type ProprietesRacine = {
  readonly vue: ModeleVueRacine;
  readonly connexion: ReactNode;
  readonly application: ReactNode;
};

export const Racine = ({ vue, connexion, application }: ProprietesRacine) => {
  switch (vue.ecran) {
    case 'OUVERTURE':
      // ANO-004 : cadre neutre, ni texte, ni animation, ni data-* (ce n'est pas un écran d'attente, US-018).
      return <main className="cadre-ouverture" aria-busy="true" />;
    case 'CONNEXION':
      return connexion;
    case 'ATTENTE_GOOGLE':
      return (
        <div role="status" aria-label={vue.nomAccessible} data-etat={vue.etat}>
          <p>Done Juan</p>
          <p>{libelle(vue.etat)}</p>
        </div>
      );
    case 'APPLICATION':
      return application;
  }
};
