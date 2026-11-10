import { IonCard, IonCardContent, IonCardTitle } from '@ionic/react';
import type { ReactElement } from 'react';
import { CarteChoixRestauration, type ProprietesChoixRestauration } from './ChoixRestauration';
import type { IssueMiseAJour } from '../../application/ports/mise-a-jour-application';
import {
  ordreDesCartes,
  type ActionCarteFeuille,
  type CarteErreurFeuille,
  type ModeleVueFeuilleSynchronisation,
} from '../modeles-de-vue/feuille-synchronisation';
import { construireRetourMiseAJour } from '../modeles-de-vue/retour-mise-a-jour';

// SyncSheet, section « Synchronisation » (ECR-011, guide §4.26, §6.6.2 ; ST-US-017 v0.4 §4.5) : data-etat des lignes
// SYN-FEUILLE-…, data-message des cartes ; boutons natifs (aria-disabled focalisable). Textes : modèle de vue.
export type ProprietesFeuilleSynchronisation = {
  readonly vue: ModeleVueFeuilleSynchronisation;
  readonly surSynchroniser: () => void;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
  /** Carte `ERR-012` de la section « Erreurs qui demandent une action » ; présente tant que l'erreur dure. */
  readonly choixRestauration?: ProprietesChoixRestauration;
  /** Issue de la dernière action « Mettre à jour » (`VueInterface.miseAJour`) : texte sous la carte `ERR-013`. */
  readonly miseAJour?: IssueMiseAJour | undefined;
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

const BoutonCarte = ({
  libelle,
  desactive,
  surClic,
}: {
  readonly libelle: string;
  /** `aria-disabled` : le bouton reste focalisable, son activation est sans effet (retour `rechargement`). */
  readonly desactive: boolean;
  readonly surClic: () => void;
}) => (
  <button
    type="button"
    {...(desactive ? { 'aria-disabled': true } : {})}
    onClick={() => {
      if (!desactive) surClic();
    }}
  >
    {libelle}
  </button>
);

/** Retour de « Mettre à jour » (guide §6.6.14 a) : ligne `role="status"` sous le texte de la carte `ERR-013`. */
const retourDeLaCarte = (carte: CarteErreurFeuille, miseAJour: IssueMiseAJour | undefined) =>
  carte.action.type === 'METTRE_A_JOUR' ? construireRetourMiseAJour(miseAJour) : undefined;

const CarteErreur = ({
  carte,
  surActionCarte,
  miseAJour,
}: {
  readonly carte: CarteErreurFeuille;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
  readonly miseAJour?: IssueMiseAJour | undefined;
}) => {
  const retour = retourDeLaCarte(carte, miseAJour);
  const desactive = retour?.actionDesactivee === true;
  return (
    <IonCard data-message={carte.message}>
      <IonCardTitle>{carte.titre}</IonCardTitle>
      <IonCardContent>
        <p>{carte.texte}</p>
        {carte.action.type === 'METTRE_A_JOUR' ? <p role="status">{retour?.texte}</p> : null}
        <BoutonCarte
          libelle={carte.action.libelle}
          desactive={desactive}
          surClic={() => {
            surActionCarte(carte.action.type);
          }}
        />
      </IonCardContent>
    </IonCard>
  );
};

/** `ALR-001` (RG-057 bis) : niveau Attention, ni action, ni fermeture, aucun blocage ; annoncée en `status`. */
const CarteAlerteHorloge = ({
  alerte,
}: {
  readonly alerte: NonNullable<ModeleVueFeuilleSynchronisation['alerteHorloge']>;
}) => (
  <IonCard data-message={alerte.code} data-niveau="attention" role="status">
    <IonCardTitle>{alerte.titre}</IonCardTitle>
    <IonCardContent>
      <p>{alerte.texte}</p>
    </IonCardContent>
  </IonCard>
);

/**
 * `ALR-015` (R15, ST-US-018 §6.3 n° 5) : niveau Attention, annoncée en `status`, aucun bouton, non fermable ; en pied
 * de section (Q-ST018-STE-3, option a).
 */
const CarteAlerteStockage = ({
  alerte,
}: {
  readonly alerte: NonNullable<ModeleVueFeuilleSynchronisation['alerteStockage']>;
}) => (
  <IonCard data-message={alerte.code} data-niveau="attention" role={alerte.role}>
    <IonCardTitle>{alerte.titre}</IonCardTitle>
    <IonCardContent>
      <p>{alerte.texte}</p>
    </IonCardContent>
  </IonCard>
);

/**
 * `ALR-016` (guide v0.2.24 §6.6.15) : niveau Information, annoncée en `status`, non fermable, en tête de la feuille ;
 * l'action « Mettre à jour » et ses retours sont ceux de la carte `ERR-013` (clic ou Entrée, sans confirmation).
 */
const CarteNouvelleVersion = ({
  alerte,
  surActionCarte,
  miseAJour,
}: {
  readonly alerte: NonNullable<ModeleVueFeuilleSynchronisation['alerteVersion']>;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
  readonly miseAJour?: IssueMiseAJour | undefined;
}) => {
  const retour = construireRetourMiseAJour(miseAJour);
  return (
    <IonCard data-message={alerte.code} data-niveau="information" role={alerte.role}>
      <IonCardTitle>{alerte.titre}</IonCardTitle>
      <IonCardContent>
        <p>{alerte.texte}</p>
        <p role="status">{retour?.texte}</p>
        <BoutonCarte
          libelle={alerte.action.libelle}
          desactive={retour?.actionDesactivee === true}
          surClic={() => {
            surActionCarte(alerte.action.type);
          }}
        />
      </IonCardContent>
    </IonCard>
  );
};

/** Section « Erreurs qui demandent une action » (ST-US-017 §6.8 n° 4), dans l'ordre du modèle de vue. */
const CartesDeLaFeuille = ({
  vue,
  surActionCarte,
  miseAJour,
}: Pick<ProprietesFeuilleSynchronisation, 'vue' | 'surActionCarte' | 'miseAJour'>) => {
  const rendre = (carte: CarteErreurFeuille) => (
    <CarteErreur
      key={carte.message}
      carte={carte}
      surActionCarte={surActionCarte}
      miseAJour={miseAJour}
    />
  );
  const { avantAlerte, apresAlerte } = ordreDesCartes(vue);
  return (
    <>
      {avantAlerte.map(rendre)}
      {vue.alerteHorloge === undefined ? null : <CarteAlerteHorloge alerte={vue.alerteHorloge} />}
      {apresAlerte.map(rendre)}
    </>
  );
};

/** Pied de la section (Q-ST018-STE-3 a) : carte `ALR-015` puis ligne « Stockage », dernier élément `data-etat`. */
const PiedDeFeuille = ({ vue }: { readonly vue: ModeleVueFeuilleSynchronisation }) => (
  <>
    {vue.alerteStockage === undefined ? null : <CarteAlerteStockage alerte={vue.alerteStockage} />}
    {vue.stockage === undefined ? null : (
      <p data-etat={vue.stockage.etat}>{vue.stockage.libelle}</p>
    )}
  </>
);

export const FeuilleSynchronisation = ({
  vue,
  surSynchroniser,
  surActionCarte,
  choixRestauration,
  miseAJour,
}: ProprietesFeuilleSynchronisation): ReactElement => (
  <section>
    {vue.alerteVersion === undefined ? null : (
      <CarteNouvelleVersion
        alerte={vue.alerteVersion}
        surActionCarte={surActionCarte}
        miseAJour={miseAJour}
      />
    )}
    {vue.dernierEchange === undefined ? null : (
      <p data-etat={vue.dernierEchange.code}>{vue.dernierEchange.libelle}</p>
    )}
    <ListeAttente vue={vue.attente} />
    {vue.horsLigne === undefined ? null : (
      <p data-etat={vue.horsLigne.code}>{vue.horsLigne.libelle}</p>
    )}
    <BoutonSynchroniser bouton={vue.bouton} surSynchroniser={surSynchroniser} />
    <CartesDeLaFeuille vue={vue} surActionCarte={surActionCarte} miseAJour={miseAJour} />
    {choixRestauration === undefined ? null : <CarteChoixRestauration {...choixRestauration} />}
    <PiedDeFeuille vue={vue} />
  </section>
);
