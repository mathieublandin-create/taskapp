import { IonFab, IonFabButton } from '@ionic/react';

/**
 * Action principale d'une vue : « + » flottant en bas à droite, au-dessus de la barre d'onglets (guide §2.2, zone du
 * pouce). Son libellé est écrit à côté, pour que les « + » des vues Tâches et Objectifs ne se confondent pas ; le
 * bouton seul porte le nom accessible.
 */
export const BoutonFlottant = ({
  libelle,
  surClic,
}: {
  readonly libelle: string;
  readonly surClic: () => void;
}) => (
  <IonFab slot="fixed" vertical="bottom" horizontal="end">
    <div className="bouton-flottant">
      <span className="bouton-flottant-etiquette" aria-hidden="true" onClick={surClic}>
        {libelle}
      </span>
      <IonFabButton aria-label={libelle} onClick={surClic}>
        +
      </IonFabButton>
    </div>
  </IonFab>
);
