import { IonCard, IonCardContent, IonCardTitle, IonModal } from '@ionic/react';
import { useEffect, useId, useRef, useState, type ReactElement, type RefCallback } from 'react';
import { BoiteConfirmation } from '../../../commun/presentation/ui/boite-confirmation';
import type {
  ConfirmationRepartirDeZero,
  ModeleVueChoixRestauration,
  TextesChoixRestauration,
} from '../modeles-de-vue/choix-restauration';

// ERR-012 et son choix (ST-US-017 v0.10 §6.7 n° 16 ; guide §4.25 OptionCard, §6.6.4 « Choix de restauration » ;
// ECR-011 E). Un seul contenu, deux places : la carte de la section « Erreurs qui demandent une action » (sans
// « Décider plus tard ») et la feuille de choix, ouverte tant que `propose`. Boutons natifs repérés par `data-action`
// (RESTAURER, ANNULER_DEMANDE, REPARTIR_DE_ZERO, DECIDER_PLUS_TARD). Aucun texte ici : modèle de vue et `textes`.
export type ProprietesChoixRestauration = {
  readonly vue: ModeleVueChoixRestauration;
  readonly textes: TextesChoixRestauration;
  /** « Restaurer mes données » : demande mémorisée ; ne rejette pas (l'issue est rendue par le contrôleur). */
  readonly surRestaurer: () => Promise<void>;
  /** « Annuler la demande » : sans confirmation (rien n'est perdu). */
  readonly surAnnulerDemande: () => void;
  /** Évaluation de « Repartir de zéro » : la confirmation à afficher, ou `undefined` (refus déjà rendu ailleurs). */
  readonly evaluerRepartirDeZero: () => Promise<ConfirmationRepartirDeZero | undefined>;
  /** « Repartir de zéro » confirmé ; ne rejette pas. */
  readonly surRepartirDeZero: () => Promise<void>;
  /** « Décider plus tard », « Fermer » et Échap sur la feuille : rien n'est écrit. */
  readonly surDeciderPlusTard: () => void;
};

/** Bouton natif dont le focus peut être déplacé par un geste (sans lire un `ref` au rendu). */
type Bouton = {
  readonly attacher: () => RefCallback<HTMLButtonElement>;
  readonly focaliser: () => void;
};

const useBouton = (): Bouton => {
  const element = useRef<HTMLButtonElement | null>(null);
  return {
    attacher: () => (bouton) => {
      element.current = bouton;
    },
    focaliser: () => {
      element.current?.focus();
    },
  };
};

/** Une action asynchrone à la fois : le bouton reste à sa place, inerte (`enCours`), jusqu'à la fin de la promesse. */
const useActionUnique = (action: () => Promise<void>) => {
  const [enCours, setEnCours] = useState(false);
  const verrou = useRef(false);
  const lancer = async (): Promise<void> => {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    try {
      await action();
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  };
  return { enCours, lancer };
};

/**
 * Focus après « Restaurer » hors ligne (sur « Annuler la demande ») et après « Annuler la demande » (sur « Restaurer
 * mes données ») : le bouton cliqué disparaît, le focus tomberait sur `body` (WCAG 2.4.3). Déplacé seulement après un
 * geste, au changement de la demande.
 */
const useFocusDemande = (enAttente: boolean, restaurer: Bouton, annuler: Bouton) => {
  const prevu = useRef<'RESTAURER' | 'ANNULER' | undefined>(undefined);
  useEffect(() => {
    if (prevu.current !== (enAttente ? 'ANNULER' : 'RESTAURER')) return;
    prevu.current = undefined;
    (enAttente ? annuler : restaurer).focaliser();
  }, [enAttente, annuler, restaurer]);
  return (cible: 'RESTAURER' | 'ANNULER'): void => {
    prevu.current = cible;
  };
};

/** « Repartir de zéro… » : évaluation, puis confirmation (boîte commune, rouge) ; le focus revient sur le bouton. */
const useRepartirDeZero = (
  { evaluerRepartirDeZero, surRepartirDeZero }: ProprietesChoixRestauration,
  bouton: Bouton,
) => {
  const [confirmation, setConfirmation] = useState<ConfirmationRepartirDeZero | undefined>(
    undefined,
  );
  const fermer = (): void => {
    setConfirmation(undefined);
    bouton.focaliser();
  };
  const evaluation = useActionUnique(async () => {
    setConfirmation(await evaluerRepartirDeZero());
  });
  const execution = useActionUnique(async () => {
    await surRepartirDeZero();
    fermer();
  });
  return { confirmation, fermer, demander: evaluation.lancer, confirmer: execution.lancer };
};

type Choix = ReturnType<typeof useChoix>['choix'];

/** Annonce le prochain déplacement de focus (geste de l'utilisateur) ; passée à part du `choix` rendu. */
type PrevoirFocus = (cible: 'RESTAURER' | 'ANNULER') => void;
type AvecFocus = { readonly choix: Choix; readonly prevoirFocus: PrevoirFocus };

const useChoix = (proprietes: ProprietesChoixRestauration) => {
  const repartir = useBouton();
  const restaurer = useBouton();
  const annuler = useBouton();
  const prevoirFocus = useFocusDemande(
    proprietes.vue.restaurationEnAttente === true,
    restaurer,
    annuler,
  );
  const choix = {
    proprietes,
    restaurer,
    annuler,
    restauration: useActionUnique(proprietes.surRestaurer),
    repartir: useRepartirDeZero(proprietes, repartir),
    boutonRepartir: repartir,
  };
  return { choix, prevoirFocus };
};

const BoutonAnnulerDemande = ({ choix, prevoirFocus }: AvecFocus) => (
  <button
    ref={choix.annuler.attacher()}
    type="button"
    data-action="ANNULER_DEMANDE"
    onClick={() => {
      prevoirFocus('RESTAURER');
      choix.proprietes.surAnnulerDemande();
    }}
  >
    {choix.proprietes.textes.annulerDemande}
  </button>
);

const BoutonRestaurer = ({
  choix,
  prevoirFocus,
  idPhrase,
}: AvecFocus & { readonly idPhrase: string }) => {
  const { enCours, lancer } = choix.restauration;
  const { textes, vue } = choix.proprietes;
  return (
    <button
      ref={choix.restaurer.attacher()}
      type="button"
      className="primaire"
      data-action="RESTAURER"
      aria-describedby={idPhrase}
      aria-busy={enCours}
      aria-disabled={enCours}
      onClick={() => {
        prevoirFocus('ANNULER');
        void lancer();
      }}
    >
      {enCours ? textes.restaurationEnCours : vue.restaurer.libelle}
    </button>
  );
};

const OptionRestaurer = ({
  choix,
  prevoirFocus,
  idPhrase,
}: AvecFocus & { readonly idPhrase: string }) => {
  const { vue, textes } = choix.proprietes;
  const enAttente = vue.restaurationEnAttente === true;
  return (
    <section data-option="RESTAURER">
      <p id={idPhrase}>{textes.phraseRestaurer}</p>
      <p role="status">{enAttente ? textes.mentionDemandee : null}</p>
      {enAttente ? (
        <BoutonAnnulerDemande choix={choix} prevoirFocus={prevoirFocus} />
      ) : (
        <BoutonRestaurer choix={choix} prevoirFocus={prevoirFocus} idPhrase={idPhrase} />
      )}
    </section>
  );
};

const BoutonRepartirDeZero = ({
  choix,
  descriptions,
}: {
  readonly choix: Choix;
  readonly descriptions: string;
}) => {
  const { disponible } = choix.proprietes.vue.repartirDeZero;
  return (
    <button
      ref={choix.boutonRepartir.attacher()}
      type="button"
      data-action="REPARTIR_DE_ZERO"
      data-rouge
      aria-disabled={!disponible}
      aria-describedby={descriptions}
      onClick={() => {
        if (disponible) void choix.repartir.demander();
      }}
    >
      {choix.proprietes.textes.repartirDeZero}
    </button>
  );
};

const OptionRepartirDeZero = ({
  choix,
  idPhrase,
  idExplication,
}: {
  readonly choix: Choix;
  readonly idPhrase: string;
  readonly idExplication: string;
}) => {
  const { vue, textes } = choix.proprietes;
  const { disponible } = vue.repartirDeZero;
  return (
    <section data-option="REPARTIR_DE_ZERO">
      <p id={idPhrase}>{textes.phraseRepartirDeZero}</p>
      <BoutonRepartirDeZero
        choix={choix}
        descriptions={disponible ? idPhrase : `${idPhrase} ${idExplication}`}
      />
      {disponible ? null : <p id={idExplication}>{textes.repartirDeZeroIndisponible}</p>}
    </section>
  );
};

const DeciderPlusTard = ({
  choix,
  idPhrase,
}: {
  readonly choix: Choix;
  readonly idPhrase: string;
}) => {
  const { textes, surDeciderPlusTard } = choix.proprietes;
  return (
    <section data-option="DECIDER_PLUS_TARD">
      <button
        type="button"
        data-action="DECIDER_PLUS_TARD"
        aria-describedby={idPhrase}
        onClick={surDeciderPlusTard}
      >
        {textes.deciderPlusTard}
      </button>
      <p id={idPhrase}>{textes.phraseDeciderPlusTard}</p>
    </section>
  );
};

const Confirmation = ({ repartir }: { readonly repartir: Choix['repartir'] }) =>
  repartir.confirmation === undefined ? null : (
    <BoiteConfirmation
      code={repartir.confirmation.code}
      titre={repartir.confirmation.titre}
      texte={repartir.confirmation.texte}
      actionLibelle={repartir.confirmation.actionLibelle}
      rouge
      surConfirmer={() => {
        void repartir.confirmer();
      }}
      surAnnuler={repartir.fermer}
    />
  );

/** Options du choix ; « Décider plus tard » seulement dans la feuille et tant qu'aucune restauration n'est demandée. */
const Options = ({
  choix,
  prevoirFocus,
  avecDeciderPlusTard,
}: AvecFocus & { readonly avecDeciderPlusTard: boolean }) => {
  const identifiant = useId();
  const plusTard = avecDeciderPlusTard && choix.proprietes.vue.restaurationEnAttente !== true;
  return (
    <>
      <OptionRestaurer
        choix={choix}
        prevoirFocus={prevoirFocus}
        idPhrase={`${identifiant}-restaurer`}
      />
      <OptionRepartirDeZero
        choix={choix}
        idPhrase={`${identifiant}-repartir`}
        idExplication={`${identifiant}-indisponible`}
      />
      {plusTard ? <DeciderPlusTard choix={choix} idPhrase={`${identifiant}-plus-tard`} /> : null}
      <Confirmation repartir={choix.repartir} />
    </>
  );
};

/** Carte `ERR-012` de la section « Erreurs qui demandent une action », présente tant que la vue existe. */
export const CarteChoixRestauration = (proprietes: ProprietesChoixRestauration): ReactElement => {
  const { choix, prevoirFocus } = useChoix(proprietes);
  const { vue } = proprietes;
  return (
    <IonCard data-message={vue.code}>
      <IonCardTitle>{vue.titre}</IonCardTitle>
      <IonCardContent>
        <p>{vue.texte}</p>
        <Options choix={choix} prevoirFocus={prevoirFocus} avecDeciderPlusTard={false} />
      </IonCardContent>
    </IonCard>
  );
};

/**
 * Feuille de choix « Action requise », ouverte d'elle-même tant que `propose`. « Fermer » et Échap ont l'effet de
 * « Décider plus tard » ; Échap ne ferme pas la feuille quand la confirmation est ouverte (elle ferme la boîte seule).
 */
export const FeuilleChoixRestauration = (proprietes: ProprietesChoixRestauration): ReactElement => {
  const { choix, prevoirFocus } = useChoix(proprietes);
  const { vue, textes, surDeciderPlusTard } = proprietes;
  return (
    <IonModal
      isOpen={vue.propose}
      keyboardClose={choix.repartir.confirmation === undefined}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      onDidDismiss={() => {
        if (vue.propose) surDeciderPlusTard();
      }}
    >
      <div data-message={vue.code}>
        <header>
          <h2>{textes.titreFeuille}</h2>
          <button type="button" onClick={surDeciderPlusTard}>
            {textes.fermer}
          </button>
        </header>
        <h3>{vue.titre}</h3>
        <p>{vue.texte}</p>
        <Options choix={choix} prevoirFocus={prevoirFocus} avecDeciderPlusTard />
      </div>
    </IonModal>
  );
};
