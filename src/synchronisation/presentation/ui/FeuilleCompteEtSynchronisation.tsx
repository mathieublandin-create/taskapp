import { IonContent, IonModal } from '@ionic/react';
import {
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  FeuilleSynchronisation,
  type ProprietesFeuilleSynchronisation,
} from './FeuilleSynchronisation';
import { LIBELLES_FEUILLE } from './libelles-feuille';

// Squelette (ST-CORR-E13B-LOT-001 §5, tranche T5a) : feuille modale « Compte et synchronisation » d'ECR-011 (guide
// v0.2.26 §4.26, §6.6.15, §6.6.16 n° 5 ; ANO-005). Fermée à l'ouverture de l'application, ouverte par `BoutonFeuille`.
// v0.3 : focus et Échap dans l'`IonModal` (guide v0.2.27 §6.6.17), ST §5.1 bis.

/** `id` de la feuille, cible d'`aria-controls` du bouton d'ouverture. */
export const ID_FEUILLE_SYNCHRONISATION = 'feuille-synchronisation';

/** Media query du panneau latéral de 400 px (guide §4.26 : PC, ≥ 1024 px). */
export const MEDIA_PANNEAU_LATERAL = '(min-width: 1024px)';

export type ProprietesFeuilleCompteEtSynchronisation = {
  /** La feuille est présentée tant que `ouverte` est vraie ; elle reste montée pour que Ionic la ferme proprement. */
  readonly ouverte: boolean;
  /** Appelée quand la feuille est refermée : « Fermer », Échap, geste retour, glissement ou fond. */
  readonly surFermee: () => void;
  /** Section « À lire » (`ModificationsNonRetenues`) ; absente s'il n'y a rien à lire. Rendue en premier. */
  readonly aLire?: ReactNode;
  /** Section « Synchronisation » (`ALR-016` en tête, `ALR-015` et « Stockage » en pied) ; absente sans espace. */
  readonly synchronisation?: ProprietesFeuilleSynchronisation;
  /** Section « Compte » (`SectionCompte`) ; rendue en dernier. */
  readonly compte?: ReactNode;
  /** Confirmations et `ERR-017` ouvertes depuis la feuille : rendues **dans** la modale (piège d'ANO-007, focus). */
  readonly dialogues?: ReactNode;
  /**
   * Bouton d'ouverture (`BoutonFeuille`, même référence que son `refElement`) : à la fin de la fermeture, il reçoit le
   * focus s'il ne l'a pas (Safari : un clic ne donne pas le focus, Ionic n'a donc rien à rendre). Guide v0.2.27
   * §6.6.17 ; ST-CORR-E13B-LOT-001 v0.3 §5.1 bis.
   */
  readonly refBoutonOuverture?: RefObject<HTMLButtonElement | null>;
  /** Titre `h2` de la feuille, qui reçoit le focus à la présentation ; sert aussi de cible au focus de fin de « À lire ». */
  readonly refTitre?: RefObject<HTMLHeadingElement | null>;
};

/** Rend le focus au bouton d'ouverture s'il ne l'a pas (Safari : un clic ne le lui donne pas). */
const rendreLeFocus = (bouton: HTMLButtonElement | null | undefined): void => {
  if (bouton != null && document.activeElement !== bouton) bouton.focus();
};

/** Géométrie de la feuille, lue à chaque ouverture (pas d'écoute du redimensionnement : limite acceptée, ST §5.1). */
const usePanneauLateral = (ouverte: boolean): boolean =>
  useMemo(() => {
    // `matchMedia` est absent de jsdom : le type du DOM le déclare toujours présent.
    const fenetre: Partial<Window> = window;
    return ouverte && fenetre.matchMedia?.(MEDIA_PANNEAU_LATERAL).matches === true;
  }, [ouverte]);

type ProprietesFocus = Pick<
  ProprietesFeuilleCompteEtSynchronisation,
  'surFermee' | 'refBoutonOuverture' | 'refTitre'
>;

/** Focus de la feuille (ST §5.1 bis n° 1 et 2) : sur le titre à la présentation, rendu au bouton d'ouverture à la fin. */
const useFocusDeLaFeuille = ({ surFermee, refBoutonOuverture, refTitre }: ProprietesFocus) => {
  const titreInterne = useRef<HTMLHeadingElement>(null);
  const refH2 = refTitre ?? titreInterne;
  // Ionic ne déplace plus le focus s'il est déjà dans la feuille : posé ici, de façon synchrone, il y reste.
  const focaliserLeTitre = (): void => {
    refH2.current?.focus();
  };
  // Le report par micro-tâche est obligatoire : pendant `didDismiss`, le piège de focus d'Ionic reprendrait le focus.
  const surFinDeFermeture = (): void => {
    surFermee();
    queueMicrotask(() => {
      rendreLeFocus(refBoutonOuverture?.current);
    });
  };
  return { refH2, focaliserLeTitre, surFinDeFermeture };
};

type ProprietesEntete = {
  readonly refH2: RefObject<HTMLHeadingElement | null>;
  readonly surFermee: () => void;
};

const EnteteFeuille = ({ refH2, surFermee }: ProprietesEntete): ReactElement => (
  <header className="feuille-entete">
    <h2 tabIndex={-1} ref={refH2}>
      {LIBELLES_FEUILLE.titre}
    </h2>
    <button type="button" className="bouton-natif" data-variante="tertiaire" onClick={surFermee}>
      {LIBELLES_FEUILLE.fermer}
    </button>
  </header>
);

type ProprietesCorps = Pick<
  ProprietesFeuilleCompteEtSynchronisation,
  'aLire' | 'synchronisation' | 'compte'
>;

const CorpsFeuille = ({ aLire, synchronisation, compte }: ProprietesCorps): ReactElement => (
  <IonContent className="feuille-corps">
    {aLire}
    {synchronisation === undefined ? null : <FeuilleSynchronisation {...synchronisation} />}
    {compte}
  </IonContent>
);

export const FeuilleCompteEtSynchronisation = ({
  ouverte,
  dialogues,
  ...autres
}: ProprietesFeuilleCompteEtSynchronisation): ReactElement => {
  const panneau = usePanneauLateral(ouverte);
  const { refH2, focaliserLeTitre, surFinDeFermeture } = useFocusDeLaFeuille(autres);
  return (
    <IonModal
      id={ID_FEUILLE_SYNCHRONISATION}
      className="feuille-synchronisation"
      aria-label={LIBELLES_FEUILLE.titre}
      isOpen={ouverte}
      initialBreakpoint={panneau ? 1 : 0.92}
      breakpoints={panneau ? [0, 1] : [0, 0.92]}
      expandToScroll={false}
      handle={!panneau}
      onDidPresent={focaliserLeTitre}
      onDidDismiss={surFinDeFermeture}
    >
      <div className="feuille-contenu">
        <EnteteFeuille refH2={refH2} surFermee={autres.surFermee} />
        <CorpsFeuille {...autres} />
        {dialogues}
      </div>
    </IonModal>
  );
};

export type ProprietesBoutonFeuille = {
  /** Reflète l'état de la feuille (`aria-expanded`). */
  readonly ouverte: boolean;
  readonly surOuvrir: () => void;
  /** Cible du focus quand la dernière entrée de « À lire » disparaît, feuille fermée (DT-028). */
  readonly refElement?: Ref<HTMLButtonElement>;
};

/** Bouton d'ouverture de la feuille, sur la ligne d'état, juste après l'indicateur (Q-CORR-STE-1, option a). */
export const BoutonFeuille = ({
  ouverte,
  surOuvrir,
  refElement,
}: ProprietesBoutonFeuille): ReactElement => (
  <button
    ref={refElement}
    type="button"
    className="bouton-natif"
    data-variante="tertiaire"
    data-action="OUVRIR_FEUILLE"
    aria-haspopup="dialog"
    aria-expanded={ouverte}
    aria-controls={ID_FEUILLE_SYNCHRONISATION}
    onClick={surOuvrir}
  >
    {LIBELLES_FEUILLE.ouvrir}
  </button>
);
