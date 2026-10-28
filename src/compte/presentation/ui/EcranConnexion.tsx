import { useEffect, useRef } from 'react';
import type { ModeleVueConnexion, PorteeAnnoncee } from '../modeles-de-vue/ecran-connexion';

// ECR-010 (guide v0.2.17 §6.6.8) : invitation, autorisations annoncées, message d'échec en role="alert",
// focus sur le bouton après un échec. Textes : catalogue §6.6 (repris par `libelle()` au rang 2).
const PORTEES: Readonly<Record<PorteeAnnoncee, string>> = {
  IDENTIFICATION_DU_COMPTE: 'Identification de votre compte Google',
  FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE:
    'Accès aux seuls fichiers de l’application dans votre Google Drive',
};

const ACTIONS: Readonly<Record<ModeleVueConnexion['action'], string>> = {
  CONTINUER_AVEC_GOOGLE: 'Continuer avec Google',
  REESSAYER: 'Réessayer',
  CHOISIR_UN_AUTRE_COMPTE: 'Choisir un autre compte',
};

const MessageEchec = ({
  message,
}: {
  readonly message: NonNullable<ModeleVueConnexion['message']>;
}) => (
  <div role="alert" data-message={message.code}>
    <h2>{message.titre}</h2>
    <p>{message.texte}</p>
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
      <p>Connectez-vous avec votre compte Google pour retrouver vos objectifs et vos tâches.</p>
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
        {ACTIONS[vue.action]}
      </button>
    </main>
  );
};
