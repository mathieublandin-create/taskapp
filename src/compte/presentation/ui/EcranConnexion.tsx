import { IonText } from '@ionic/react';
import { useEffect, useRef } from 'react';
import {
  libelleActionConnexion,
  type ModeleVueConnexion,
  type PorteeAnnoncee,
} from '../modeles-de-vue/ecran-connexion';

// ECR-010 (guide v0.2.17 §6.6.8) : invitation, autorisations annoncées, message d'échec en role="alert",
// focus sur le bouton après un échec. Le texte d'invitation et les autorisations sont la copie propre de l'écran
// (ECR-010, hors catalogue §6.6) ; les messages et le bouton viennent du catalogue par le modèle de vue.
const PORTEES: Readonly<Record<PorteeAnnoncee, string>> = {
  IDENTIFICATION_DU_COMPTE: 'Identification de votre compte Google',
  FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE:
    'Accès aux seuls fichiers de l’application dans votre Google Drive',
};

const MessageEchec = ({
  message,
}: {
  readonly message: NonNullable<ModeleVueConnexion['message']>;
}) => (
  <div role="alert" data-message={message.code}>
    <h2>{message.titre}</h2>
    <IonText>
      <p>{message.texte}</p>
    </IonText>
  </div>
);

export type ProprietesEcranConnexion = {
  readonly vue: ModeleVueConnexion;
  readonly surAction: () => void;
};

export const EcranConnexion = ({ vue, surAction }: ProprietesEcranConnexion) => {
  const bouton = useRef<HTMLButtonElement>(null);
  const code = vue.message?.code;
  useEffect(() => {
    if (code !== undefined) bouton.current?.focus();
  }, [code]);
  return (
    <main aria-labelledby="connexion-titre">
      <h1 id="connexion-titre">Done Juan</h1>
      <IonText>
        <p>Connectez-vous avec votre compte Google pour retrouver vos objectifs et vos tâches.</p>
      </IonText>
      <ul aria-label="Autorisations demandées">
        {vue.porteesAnnoncees.map((portee) => (
          <li key={portee}>{PORTEES[portee]}</li>
        ))}
      </ul>
      {vue.message === undefined ? null : <MessageEchec message={vue.message} />}
      <button
        ref={bouton}
        type="button"
        data-action={vue.action}
        disabled={!vue.actionActive}
        onClick={surAction}
      >
        {libelleActionConnexion(vue.action)}
      </button>
    </main>
  );
};
