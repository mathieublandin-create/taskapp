import { IonCard, IonCardContent, IonCardTitle } from '@ionic/react';
import type { ReactElement } from 'react';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { RefElementMetier } from '../../domaine/information';
import {
  libelleVoir,
  nomAccessibleCompris,
  texteDonneesEffacees,
  titreDonneeEffacee,
  type LigneModificationNonRetenue,
  type ModeleVueModificationsNonRetenues,
} from '../modeles-de-vue/modifications-non-retenues';

// DiscardedItem (guide §4.24, §6.6.9) dans la section « À lire » d'ECR-011, en tête de la feuille (ST-US-017 v0.5 §4.6).
// Boutons natifs ; data-etat, data-message, data-variante (conventions §8.5). Textes : modèle de vue et catalogue.
export type ProprietesModificationsNonRetenues = {
  readonly vue: ModeleVueModificationsNonRetenues;
  /** « Compris » : identifiants d'une ligne, ou de toutes les lignes `ALR-014` de la carte `ALR-008`. */
  readonly surCompris: (ids: ReadonlyArray<string>) => void;
  readonly surVoir: (element: RefElementMetier) => void;
};

const ID_TITRE = 'feuille-synchronisation-a-lire';

type ActionsLigne = Pick<ProprietesModificationsNonRetenues, 'surCompris' | 'surVoir'>;

const BoutonVoir = ({
  ligne,
  voir,
  surVoir,
}: {
  readonly ligne: LigneModificationNonRetenue;
  readonly voir: RefElementMetier;
  readonly surVoir: ActionsLigne['surVoir'];
}) => (
  <button
    type="button"
    onClick={() => {
      surVoir(voir);
    }}
  >
    {libelleVoir(ligne)}
  </button>
);

const Ligne = ({
  ligne,
  surCompris,
  surVoir,
}: ActionsLigne & { readonly ligne: LigneModificationNonRetenue }) => (
  <li
    data-message={ligne.code}
    {...(ligne.variante === undefined ? {} : { 'data-variante': ligne.variante })}
  >
    <p>{ligne.titre}</p>
    {ligne.voir === undefined ? null : (
      <BoutonVoir ligne={ligne} voir={ligne.voir} surVoir={surVoir} />
    )}
    <button
      type="button"
      aria-label={nomAccessibleCompris(ligne.titre)}
      onClick={() => {
        surCompris([ligne.id]);
      }}
    >
      {libelle('ALR-009', {}, 'action')}
    </button>
  </li>
);

const CarteDonneesEffacees = ({
  donnees,
  surCompris,
}: {
  readonly donnees: NonNullable<ModeleVueModificationsNonRetenues['donneesEffacees']>;
  readonly surCompris: ProprietesModificationsNonRetenues['surCompris'];
}) => (
  <IonCard data-message={donnees.code}>
    <IonCardTitle>{libelle(donnees.code)}</IonCardTitle>
    <IonCardContent>
      <p>{texteDonneesEffacees(donnees.lignes.length)}</p>
      <ul>
        {donnees.lignes.map((ligne) => (
          <li key={ligne.id} data-message="ALR-014">
            {titreDonneeEffacee(ligne)}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          surCompris(donnees.ids);
        }}
      >
        {libelle(donnees.code, {}, 'action')}
      </button>
    </IonCardContent>
  </IonCard>
);

export const ModificationsNonRetenues = ({
  vue,
  surCompris,
  surVoir,
}: ProprietesModificationsNonRetenues): ReactElement => (
  <section>
    <p id={ID_TITRE} data-etat={vue.code}>
      {vue.libelle}
    </p>
    <ul aria-labelledby={ID_TITRE}>
      {vue.lignes.map((ligne) => (
        <Ligne key={ligne.id} ligne={ligne} surCompris={surCompris} surVoir={surVoir} />
      ))}
    </ul>
    {vue.donneesEffacees === undefined ? null : (
      <CarteDonneesEffacees donnees={vue.donneesEffacees} surCompris={surCompris} />
    )}
  </section>
);
