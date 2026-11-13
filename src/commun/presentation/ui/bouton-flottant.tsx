import { IonFab, IonFabButton } from '@ionic/react';

/**
 * Action principale d'une vue : « + » rond flottant en bas à droite, au-dessus de la barre d'onglets (guide §2.2, zone
 * du pouce). Il n'a pas d'étiquette visible : le libellé de l'action est son nom accessible et son `title`, ce qui
 * distingue les « + » des vues Tâches et Objectifs.
 */
export const BoutonFlottant = ({
  libelle,
  surClic,
}: {
  readonly libelle: string;
  readonly surClic: () => void;
}) => (
  <IonFab slot="fixed" vertical="bottom" horizontal="end">
    <IonFabButton aria-label={libelle} title={libelle} onClick={surClic}>
      +
    </IonFabButton>
  </IonFab>
);
