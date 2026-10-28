import { useEffect, useRef } from 'react';

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
      <h2>La suppression n’est pas terminée</h2>
      <p>
        Done Juan est encore ouvert dans une autre fenêtre ou un autre onglet de ce PC. La
        suppression se terminera dès que vous les aurez fermés. Fermez-les, puis appuyez sur «
        Réessayer ». Vos données restent dans votre Google Drive.
      </p>
      <button ref={reessayer} type="button" disabled={enCours} onClick={surReessayer}>
        {enCours ? 'Suppression en cours…' : 'Réessayer'}
      </button>
      <button type="button" onClick={surAllerALaConnexion}>
        Aller à la connexion
      </button>
    </div>
  );
};
