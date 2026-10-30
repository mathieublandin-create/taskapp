import { IonText } from '@ionic/react';
import { useEffect, useRef } from 'react';
import { libelle } from '../../../commun/presentation/messages/libelle';

// ERR-017 (guide v0.2.17, RL-LOT-001-A1) : la suppression est engagée ; « Réessayer » attend de nouveau (5 s au
// plus), « Aller à la connexion » ramène cet onglet à l'écran de connexion. role="alert", focus sur « Réessayer ».
export type ProprietesSuppressionBloquee = {
  readonly enCours: boolean;
  readonly surReessayer: () => void;
  readonly surAllerALaConnexion: () => void;
};

export const SuppressionBloquee = ({
  enCours,
  surReessayer,
  surAllerALaConnexion,
}: ProprietesSuppressionBloquee) => {
  const reessayer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    reessayer.current?.focus();
  }, []);
  return (
    <div role="alert" data-message="ERR-017">
      <h2>{libelle('ERR-017')}</h2>
      <IonText>
        <p>{libelle('ERR-017', {}, 'texte')}</p>
      </IonText>
      <button ref={reessayer} type="button" disabled={enCours} onClick={surReessayer}>
        {libelle('ERR-017', enCours ? { variante: 'en-cours' } : {}, 'action')}
      </button>
      <button type="button" onClick={surAllerALaConnexion}>
        {libelle('ERR-017', {}, 'actionSecondaire')}
      </button>
    </div>
  );
};
