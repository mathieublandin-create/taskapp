import { IonActionSheet } from '@ionic/react';
import type { ActionObjectif } from '../../../domaine/types-actions';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import { LIBELLES_OBJECTIFS } from '../libelles-ui';

// Menu « … » de l'objectif (ECR-003 C) : actions peu fréquentes regroupées, suppression isolée en bas et en rouge.
// Seules les actions de l'objectif offertes par le modèle de vue et connues de l'écran sont présentées. « Créer un
// sous-objectif » n'y figure pas : « Ajouter » est dans l'en-tête de la section « Sous-objectifs » (ECR-003 D).
export type ActionMenuObjectif = keyof typeof LIBELLES_OBJECTIFS.menu;

const ORDRE_MENU: ReadonlyArray<ActionMenuObjectif> = [
  'RENOMMER',
  'MODIFIER_DESCRIPTION',
  'MODIFIER_DELAI',
  'RETIRER_DELAI',
  'PLACER',
  'SUPPRIMER',
];

export const actionsDuMenu = (
  actions: ReadonlyArray<ActionObjectif>,
): ReadonlyArray<ActionMenuObjectif> => ORDRE_MENU.filter((action) => actions.includes(action));

export type ProprietesMenuObjectif = {
  readonly ouvert: boolean;
  readonly actions: ReadonlyArray<ActionObjectif>;
  readonly surAction: (action: ActionMenuObjectif) => void;
  readonly surFermer: () => void;
};

export const MenuObjectif = ({ ouvert, actions, surAction, surFermer }: ProprietesMenuObjectif) => (
  <IonActionSheet
    isOpen={ouvert}
    header={LIBELLES_OBJECTIFS.menuActions}
    onDidDismiss={surFermer}
    buttons={[
      ...actionsDuMenu(actions).map((action) => ({
        text: LIBELLES_OBJECTIFS.menu[action],
        ...(action === 'SUPPRIMER' ? { role: 'destructive' } : {}),
        handler: () => {
          surAction(action);
        },
      })),
      { text: LIBELLE_ANNULER, role: 'cancel' },
    ]}
  />
);
