import { IonCard, IonCardContent, IonCardTitle } from '@ionic/react';
import { useState, type ReactElement } from 'react';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { RefElementMetier } from '../../domaine/information';
import {
  libelleModificationsEffacees,
  libelleVoir,
  nomAccessibleCompris,
  nomAccessibleVoir,
  sousTitreLigne,
  texteDonneeEffacee,
  texteDonneesEffacees,
  texteLigne,
  titreDonneeEffacee,
  type ContexteTextes,
  type LigneDonneeEffacee,
  type LigneModificationNonRetenue,
  type ModeleVueModificationsNonRetenues,
} from '../modeles-de-vue/modifications-non-retenues';

// DiscardedItem (guide §4.24, §6.6.9) dans la section « À lire » d'ECR-011, en tête de la feuille (ST-US-017 v0.5 §4.6).
// Boutons natifs ; data-etat, data-message, data-variante (conventions §8.5). Textes : modèle de vue et catalogue.
export type ProprietesModificationsNonRetenues = {
  readonly vue: ModeleVueModificationsNonRetenues;
  /** Appareil courant et jour de référence : `{appareil}` d'`ALR-008`, année des dates des valeurs. */
  readonly contexte: ContexteTextes;
  /** « Compris » : identifiants d'une ligne, ou de toutes les lignes `ALR-014` de la carte `ALR-008`. */
  readonly surCompris: (ids: ReadonlyArray<string>) => void;
  readonly surVoir: (element: RefElementMetier) => void;
};

const ID_TITRE = 'feuille-synchronisation-a-lire';

type ActionsLigneProprietes = Pick<ProprietesModificationsNonRetenues, 'surCompris' | 'surVoir'>;

const BoutonVoir = ({
  ligne,
  voir,
  surVoir,
}: {
  readonly ligne: LigneModificationNonRetenue;
  readonly voir: RefElementMetier;
  readonly surVoir: ActionsLigneProprietes['surVoir'];
}) => (
  <button
    type="button"
    aria-label={nomAccessibleVoir(ligne)}
    onClick={() => {
      surVoir(voir);
    }}
  >
    {libelleVoir(ligne)}
  </button>
);

const ActionsLigne = ({
  ligne,
  surCompris,
  surVoir,
}: ActionsLigneProprietes & { readonly ligne: LigneModificationNonRetenue }) => (
  <>
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
  </>
);

const Ligne = ({
  ligne,
  contexte,
  surCompris,
  surVoir,
}: ActionsLigneProprietes & {
  readonly ligne: LigneModificationNonRetenue;
  readonly contexte: ContexteTextes;
}) => {
  const sousTitre = sousTitreLigne(ligne);
  return (
    <li
      data-message={ligne.code}
      {...(ligne.variante === undefined ? {} : { 'data-variante': ligne.variante })}
    >
      <p>{ligne.titre}</p>
      {sousTitre === undefined ? null : <p>{sousTitre}</p>}
      <p>{texteLigne(ligne, contexte)}</p>
      <ActionsLigne ligne={ligne} surCompris={surCompris} surVoir={surVoir} />
    </li>
  );
};

type DonneesEffacees = NonNullable<ModeleVueModificationsNonRetenues['donneesEffacees']>;

const LigneEffacee = ({
  ligne,
  contexte,
}: {
  readonly ligne: LigneDonneeEffacee;
  readonly contexte: ContexteTextes;
}) => (
  <li data-message="ALR-014">
    <p>{titreDonneeEffacee(ligne)}</p>
    <p>{texteDonneeEffacee(ligne, contexte)}</p>
  </li>
);

/** Lignes `ALR-014`, repliées par défaut ; restent dans le document (`hidden`) pour la technologie d'assistance. */
const LignesEffacees = ({
  lignes,
  contexte,
}: {
  readonly lignes: DonneesEffacees['lignes'];
  readonly contexte: ContexteTextes;
}) => {
  const [deplie, setDeplie] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={deplie}
        data-code="SEC-MODIFS-EFFACEES"
        onClick={() => {
          setDeplie(!deplie);
        }}
      >
        {libelleModificationsEffacees(lignes.length)}
      </button>
      <ul hidden={!deplie}>
        {lignes.map((ligne) => (
          <LigneEffacee key={ligne.id} ligne={ligne} contexte={contexte} />
        ))}
      </ul>
    </>
  );
};

const CarteDonneesEffacees = ({
  donnees,
  contexte,
  surCompris,
}: {
  readonly donnees: DonneesEffacees;
  readonly contexte: ContexteTextes;
  readonly surCompris: ProprietesModificationsNonRetenues['surCompris'];
}) => (
  <IonCard data-message={donnees.code}>
    <IonCardTitle>{libelle(donnees.code)}</IonCardTitle>
    <IonCardContent>
      <p>{texteDonneesEffacees(donnees.lignes.length, contexte)}</p>
      <LignesEffacees lignes={donnees.lignes} contexte={contexte} />
      <button
        type="button"
        aria-label={nomAccessibleCompris(libelle(donnees.code))}
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
  contexte,
  surCompris,
  surVoir,
}: ProprietesModificationsNonRetenues): ReactElement => (
  <section>
    <p id={ID_TITRE} data-etat={vue.code}>
      {vue.libelle}
    </p>
    <ul aria-labelledby={ID_TITRE}>
      {vue.lignes.map((ligne) => (
        <Ligne
          key={ligne.id}
          ligne={ligne}
          contexte={contexte}
          surCompris={surCompris}
          surVoir={surVoir}
        />
      ))}
    </ul>
    {vue.donneesEffacees === undefined ? null : (
      <CarteDonneesEffacees
        donnees={vue.donneesEffacees}
        contexte={contexte}
        surCompris={surCompris}
      />
    )}
  </section>
);
