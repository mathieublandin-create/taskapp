import { IonCard, IonCardContent, IonCardTitle } from '@ionic/react';
import { useEffect, useRef, useState, type ReactElement, type RefCallback } from 'react';
import type { RefElementMetier } from '../../domaine/information';
import type { IdValeurEcartee } from '../../domaine/valeurs-ecartees';
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
  readonly surCompris: (ids: ReadonlyArray<IdValeurEcartee>) => void;
  readonly surVoir: (element: RefElementMetier) => void;
};

const ID_TITRE = 'feuille-synchronisation-a-lire';

const CLE_CARTE = 'ALR-008';

/** « Compris » d'une entrée de la section : la clé identifie l'entrée (ligne ou carte), pour le focus (WCAG 2.4.3). */
type ComprisFocalisable = {
  readonly surCompris: (cle: string, ids: ReadonlyArray<IdValeurEcartee>) => void;
  readonly ref: (cle: string) => RefCallback<HTMLButtonElement>;
};

type ActionsLigneProprietes = Pick<ProprietesModificationsNonRetenues, 'surVoir'> & {
  readonly compris: ComprisFocalisable;
};

/**
 * Quand une entrée disparaît après « Compris », le focus va sur le « Compris » de l'entrée suivante, sinon de la
 * précédente (guide §10, WCAG 2.4.3). Il n'est déplacé que s'il est tombé sur `body` : une entrée qui reste (échec
 * d'enregistrement) garde le focus où il est.
 */
const useFocusApresCompris = (
  cles: ReadonlyArray<string>,
  surCompris: ProprietesModificationsNonRetenues['surCompris'],
): ComprisFocalisable => {
  const boutons = useRef(new Map<string, HTMLButtonElement>());
  const attente = useRef<{ readonly retiree: string; readonly cible: string } | undefined>(
    undefined,
  );
  useEffect(() => {
    const en = attente.current;
    if (en === undefined || cles.includes(en.retiree)) return;
    attente.current = undefined;
    if (document.activeElement === document.body) boutons.current.get(en.cible)?.focus();
  });
  return {
    surCompris: (cle, ids) => {
      const rang = cles.indexOf(cle);
      const cible = cles[rang + 1] ?? cles[rang - 1];
      attente.current = cible === undefined ? undefined : { retiree: cle, cible };
      surCompris(ids);
    },
    ref: (cle) => (bouton) => {
      if (bouton === null) boutons.current.delete(cle);
      else boutons.current.set(cle, bouton);
    },
  };
};

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
  libelleCompris,
  compris,
  surVoir,
}: ActionsLigneProprietes & {
  readonly ligne: LigneModificationNonRetenue;
  readonly libelleCompris: string;
}) => (
  <>
    {ligne.voir === undefined ? null : (
      <BoutonVoir ligne={ligne} voir={ligne.voir} surVoir={surVoir} />
    )}
    <button
      type="button"
      ref={compris.ref(ligne.id)}
      aria-label={nomAccessibleCompris(ligne.titre)}
      onClick={() => {
        compris.surCompris(ligne.id, [ligne.id]);
      }}
    >
      {libelleCompris}
    </button>
  </>
);

const Ligne = ({
  ligne,
  libelleCompris,
  contexte,
  compris,
  surVoir,
}: ActionsLigneProprietes & {
  readonly ligne: LigneModificationNonRetenue;
  readonly libelleCompris: string;
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
      <ActionsLigne
        ligne={ligne}
        libelleCompris={libelleCompris}
        compris={compris}
        surVoir={surVoir}
      />
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
  compris,
}: {
  readonly donnees: DonneesEffacees;
  readonly contexte: ContexteTextes;
  readonly compris: ComprisFocalisable;
}) => (
  <IonCard data-message={donnees.code}>
    <IonCardTitle>{donnees.titre}</IonCardTitle>
    <IonCardContent>
      <p>{texteDonneesEffacees(donnees.lignes.length, contexte)}</p>
      <LignesEffacees lignes={donnees.lignes} contexte={contexte} />
      <button
        type="button"
        ref={compris.ref(CLE_CARTE)}
        aria-label={donnees.nomAccessibleCompris}
        onClick={() => {
          compris.surCompris(CLE_CARTE, donnees.ids);
        }}
      >
        {donnees.action}
      </button>
    </IonCardContent>
  </IonCard>
);

const ListeLignes = ({
  vue,
  libelleCompris,
  contexte,
  compris,
  surVoir,
}: ActionsLigneProprietes & {
  readonly vue: ModeleVueModificationsNonRetenues;
  readonly libelleCompris: string;
  readonly contexte: ContexteTextes;
}) => (
  <ul aria-labelledby={ID_TITRE}>
    {vue.lignes.map((ligne) => (
      <Ligne
        key={ligne.id}
        ligne={ligne}
        libelleCompris={libelleCompris}
        contexte={contexte}
        compris={compris}
        surVoir={surVoir}
      />
    ))}
  </ul>
);

export const ModificationsNonRetenues = ({
  vue,
  contexte,
  surCompris,
  surVoir,
}: ProprietesModificationsNonRetenues): ReactElement => {
  const cles = [
    ...vue.lignes.map((ligne) => ligne.id),
    ...(vue.donneesEffacees === undefined ? [] : [CLE_CARTE]),
  ];
  const compris = useFocusApresCompris(cles, surCompris);
  return (
    <section>
      <p id={ID_TITRE} data-etat={vue.code}>
        {vue.libelle}
      </p>
      <ListeLignes
        vue={vue}
        libelleCompris={vue.libelleCompris}
        contexte={contexte}
        compris={compris}
        surVoir={surVoir}
      />
      {vue.donneesEffacees === undefined ? null : (
        <CarteDonneesEffacees donnees={vue.donneesEffacees} contexte={contexte} compris={compris} />
      )}
    </section>
  );
};
