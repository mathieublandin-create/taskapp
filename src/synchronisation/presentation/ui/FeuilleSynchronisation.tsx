import { IonCard, IonCardContent, IonCardTitle } from '@ionic/react';
import type { ReactElement } from 'react';
import type {
  ActionCarteFeuille,
  CarteErreurFeuille,
  ModeleVueFeuilleSynchronisation,
} from '../modeles-de-vue/feuille-synchronisation';

// SyncSheet, section « Synchronisation » (ECR-011, guide §4.26, §6.6.2 ; ST-US-017 v0.4 §4.5) : data-etat des lignes
// SYN-FEUILLE-…, data-message des cartes ; boutons natifs (aria-disabled focalisable). Textes : modèle de vue.
export type ProprietesFeuilleSynchronisation = {
  readonly vue: ModeleVueFeuilleSynchronisation;
  readonly surSynchroniser: () => void;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
};

const ID_ATTENTE = 'feuille-synchronisation-attente';
const ID_EXPLICATION = 'feuille-synchronisation-explication';

const ListeAttente = ({ vue }: { readonly vue: ModeleVueFeuilleSynchronisation['attente'] }) =>
  vue.code === 'SYN-FEUILLE-RIEN-EN-ATTENTE' ? (
    <p data-etat={vue.code}>{vue.libelle}</p>
  ) : (
    <>
      <p id={ID_ATTENTE} data-etat={vue.code}>
        {vue.libelle}
      </p>
      <ul aria-labelledby={ID_ATTENTE}>
        {vue.lignes.map((ligne) => (
          <li key={ligne.id}>{ligne.intitule}</li>
        ))}
      </ul>
    </>
  );

const BoutonSynchroniser = ({
  bouton,
  surSynchroniser,
}: {
  readonly bouton: ModeleVueFeuilleSynchronisation['bouton'];
  readonly surSynchroniser: () => void;
}) => (
  <>
    <button
      type="button"
      data-etat={bouton.code}
      aria-disabled={!bouton.disponible}
      {...(bouton.explication === undefined ? {} : { 'aria-describedby': ID_EXPLICATION })}
      onClick={() => {
        if (bouton.disponible) surSynchroniser();
      }}
    >
      {bouton.libelle}
    </button>
    {bouton.explication === undefined ? null : <p id={ID_EXPLICATION}>{bouton.explication}</p>}
  </>
);

const CarteErreur = ({
  carte,
  surActionCarte,
}: {
  readonly carte: CarteErreurFeuille;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
}) => (
  <IonCard data-message={carte.message}>
    <IonCardTitle>{carte.titre}</IonCardTitle>
    <IonCardContent>
      <p>{carte.texte}</p>
      <button
        type="button"
        onClick={() => {
          surActionCarte(carte.action.type);
        }}
      >
        {carte.action.libelle}
      </button>
    </IonCardContent>
  </IonCard>
);

export const FeuilleSynchronisation = ({
  vue,
  surSynchroniser,
  surActionCarte,
}: ProprietesFeuilleSynchronisation): ReactElement => (
  <section>
    {vue.dernierEchange === undefined ? null : (
      <p data-etat={vue.dernierEchange.code}>{vue.dernierEchange.libelle}</p>
    )}
    <ListeAttente vue={vue.attente} />
    {vue.horsLigne === undefined ? null : (
      <p data-etat={vue.horsLigne.code}>{vue.horsLigne.libelle}</p>
    )}
    <BoutonSynchroniser bouton={vue.bouton} surSynchroniser={surSynchroniser} />
    {vue.cartes.map((carte) => (
      <CarteErreur key={carte.message} carte={carte} surActionCarte={surActionCarte} />
    ))}
  </section>
);
