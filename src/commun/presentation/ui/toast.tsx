import type { CodeCatalogue } from '../messages/codes';
import { aUnePartie, aUneVariante, libelle } from '../messages/libelle';

// Toast (guide §4.10, §6.6.6) : role="status" (4 s, 6 s avec action) ; l'échec d'enregistrement (ERR-014) est une
// alerte et propose « Réessayer » pour rejouer le geste échoué (DT-007).
export type ProprietesToast = {
  readonly code: CodeCatalogue;
  /** Appelée par le bouton d'action, s'il existe au catalogue. */
  readonly surAction?: () => void;
};

const VARIANTE_AVEC_ACTION = 'avec-action';

export const Toast = ({ code, surAction }: ProprietesToast) => {
  const avecAction = surAction !== undefined && aUnePartie(code, 'action');
  const variables =
    avecAction && aUneVariante(code, VARIANTE_AVEC_ACTION)
      ? { variante: VARIANTE_AVEC_ACTION }
      : {};
  return (
    <div
      className="toast"
      role={code === 'TST-ERREUR-ENREGISTREMENT' ? 'alert' : 'status'}
      data-etat={code}
    >
      <p>{libelle(code, variables)}</p>
      {avecAction ? (
        <button type="button" onClick={surAction}>
          {libelle(code, {}, 'action')}
        </button>
      ) : null}
    </div>
  );
};
