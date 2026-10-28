import type { ReactNode } from 'react';
import type { ModeleVueRacine } from '../modeles-de-vue/racine';

// ST-US-022 §4.5 : écran racine (RG-019) ; cadre « Attente » d'ECR-010 (SYN-REDIRECTION, Q-ST022-STE-1).
export type ProprietesRacine = {
  readonly vue: ModeleVueRacine;
  readonly connexion: ReactNode;
  readonly application: ReactNode;
};

export const Racine = ({ vue, connexion, application }: ProprietesRacine) => {
  switch (vue.ecran) {
    case 'CONNEXION':
      return connexion;
    case 'ATTENTE_GOOGLE':
      return (
        <div role="status" aria-label={vue.nomAccessible} data-etat={vue.etat}>
          <p>Done Juan</p>
          <p>Connexion à Google…</p>
        </div>
      );
    case 'APPLICATION':
      return application;
  }
};
