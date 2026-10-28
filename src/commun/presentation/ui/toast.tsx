import { IonToast } from '@ionic/react';
import type { CodeCatalogue } from '../messages/codes';
import { aUnePartie, aUneVariante, libelle } from '../messages/libelle';

// Toast (guide §4.10, §6.6.6), en IonToast : role="status" (4 s, 6 s avec action) ; l'échec d'enregistrement
// (ERR-014) est une alerte, persistante, et propose « Réessayer » pour rejouer le geste échoué (DT-007).
// `role` et `data-etat` sont portés par l'élément ion-toast (htmlAttributes) ; le texte et le bouton sont dans
// son DOM fantôme.
export type ProprietesToast = {
  readonly code: CodeCatalogue;
  /** Appelée par le bouton d'action, s'il existe au catalogue. */
  readonly surAction?: () => void;
};

const VARIANTE_AVEC_ACTION = 'avec-action';
const DUREE_SANS_ACTION_MS = 4000;
const DUREE_AVEC_ACTION_MS = 6000;
const PERSISTANT = 0;

export const Toast = ({ code, surAction }: ProprietesToast) => {
  const avecAction = surAction !== undefined && aUnePartie(code, 'action');
  const variables =
    avecAction && aUneVariante(code, VARIANTE_AVEC_ACTION)
      ? { variante: VARIANTE_AVEC_ACTION }
      : {};
  const alerte = code === 'TST-ERREUR-ENREGISTREMENT';
  const duree = avecAction ? DUREE_AVEC_ACTION_MS : DUREE_SANS_ACTION_MS;
  return (
    <IonToast
      isOpen
      message={libelle(code, variables)}
      duration={alerte ? PERSISTANT : duree}
      position="bottom"
      htmlAttributes={{ role: alerte ? 'alert' : 'status', 'data-etat': code }}
      buttons={avecAction ? [{ text: libelle(code, {}, 'action'), handler: surAction }] : []}
    />
  );
};
