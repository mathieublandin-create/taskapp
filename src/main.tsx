// ADR-014 (M2) : premier import, pour que Zod soit en mode interprété avant la construction de tout schéma.
import './compte/infrastructure/zod-sans-compilation';
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { createRoot } from 'react-dom/client';
import { ErreurProgrammation } from './commun/domaine/erreur-programmation';
import {
  consommerRetourRedirection,
  NAVIGATION_RETOUR_NAVIGATEUR,
} from './compte/infrastructure/auth/retour-redirection';
import { DialogueConfirmation } from './compte/presentation/ui/DialogueConfirmation';
import { EcranConnexion } from './compte/presentation/ui/EcranConnexion';
import { Racine } from './compte/presentation/ui/Racine';
import { SectionCompte } from './compte/presentation/ui/SectionCompte';
import { SuppressionBloquee } from './compte/presentation/ui/SuppressionBloquee';
import {
  EcransObjectifs,
  useNavigation,
  type NavigationUi,
} from './objectifs-taches/presentation/ui/ecrans/espaces';
import type {
  ChoixRestaurationAffichable,
  ControleurInterface,
  VueInterface,
} from './composition/controleur-interface';
import type { ProprietesChoixRestauration } from './synchronisation/presentation/ui/ChoixRestauration';
import { demarrerWeb } from './composition/web';
import { appareilDepuisAgent } from './commun/presentation/format/appareil';
import { Toast } from './commun/presentation/ui/toast';
import type { ProprietesFeuilleSynchronisation } from './synchronisation/presentation/ui/FeuilleSynchronisation';
import {
  BoutonFeuille,
  FeuilleCompteEtSynchronisation,
} from './synchronisation/presentation/ui/FeuilleCompteEtSynchronisation';
import { FeuilleChoixRestauration } from './synchronisation/presentation/ui/ChoixRestauration';
import { useFocusFinALire } from './synchronisation/presentation/ui/focus-fin-a-lire';
import { enregistrerServiceWorker } from './synchronisation/infrastructure/enregistrement-service-worker';
import { Bandeau } from './synchronisation/presentation/ui/Bandeau';
import { ModificationsNonRetenues } from './synchronisation/presentation/ui/ModificationsNonRetenues';
import type { RefElementMetier } from './synchronisation';
import { IndicateurSynchronisation } from './synchronisation/presentation/ui/IndicateurSynchronisation';
import './commun/presentation/ui/styles.css';

// RED-02 : première instruction, synchrone, avant tout rendu, toute requête et le chargement de GIS : le fragment
// de l'URL de retour de Google est copié, effacé, puis analysé. Les modules importés n'ont aucun effet de bord.
// RED-05 : le retour (qui porte le jeton) n'est lié à aucun nom de module ; il n'existe que le temps de l'appel.
const { controleur, journal } = demarrerWeb(
  consommerRetourRedirection(NAVIGATION_RETOUR_NAVIGATEUR),
  {
    variables: import.meta.env,
    agent: navigator.userAgent,
    pointsTactiles: navigator.maxTouchPoints,
    recharger: () => {
      location.reload();
    },
    arreterNavigation: () => {
      window.stop();
    },
    ouvrirOnglet: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    conteneurServiceWorker: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
    gestionnaireStockage: 'storage' in navigator ? navigator.storage : undefined,
  },
);

// RED-02 : le service worker n'est enregistré qu'après la consommation du retour de redirection (ST-US-018 §6.1 n° 4).
void enregistrerServiceWorker({
  conteneur: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
  base: import.meta.env.BASE_URL,
  journal,
  surNouvelleVersion: controleur.signalerNouvelleVersion,
});

setupIonicReact();

/** Appareil affiché dans les textes (« ce smartphone », « ce PC »), calculé une fois (RC-R2-7). */
const APPAREIL = appareilDepuisAgent(navigator.userAgent, navigator.maxTouchPoints);

/** Section « À lire » d'ECR-011, en tête de la feuille de synchronisation (guide §6.6.2). */
const ALire = ({
  controleur,
  surVoir,
}: {
  readonly controleur: ControleurInterface;
  readonly surVoir: (element: RefElementMetier) => void;
}) => {
  const { nonRetenues, aujourdhui } = useSyncExternalStore(controleur.observer, controleur.vue);
  if (nonRetenues === undefined || aujourdhui === undefined) return null;
  return (
    <ModificationsNonRetenues
      vue={nonRetenues}
      contexte={{ appareil: APPAREIL, aujourdhui }}
      surCompris={(ids) => void controleur.marquerCommeLue(ids)}
      surVoir={surVoir}
    />
  );
};

/** Gestes du choix d'`ERR-012` vers le contrôleur ; `surRestaurer` et `surRepartirDeZero` ne rejettent pas. */
const proprietesChoix = (
  controleur: ControleurInterface,
  { vue, textes }: ChoixRestaurationAffichable,
): ProprietesChoixRestauration => ({
  vue,
  textes,
  surRestaurer: controleur.demanderRestauration,
  surAnnulerDemande: () => void controleur.annulerRestauration(),
  evaluerRepartirDeZero: controleur.evaluerRepartirDeZero,
  surRepartirDeZero: controleur.repartirDeZero,
  surDeciderPlusTard: () => void controleur.deciderPlusTard(),
});

type ProprietesEspace = {
  readonly controleur: ControleurInterface;
  readonly feuilleOuverte: boolean;
  readonly surOuvrirFeuille: () => void;
  readonly surFermerFeuille: () => void;
};

/** Props de la section « Synchronisation » de la feuille (ECR-011) ; absentes tant que l'espace n'existe pas. */
const proprietesSynchronisation = (
  controleur: ControleurInterface,
  vue: VueInterface,
  choix: ProprietesChoixRestauration | undefined,
): ProprietesFeuilleSynchronisation | undefined =>
  vue.feuille === undefined
    ? undefined
    : {
        vue: vue.feuille,
        surSynchroniser: () => void controleur.synchroniser(),
        surActionCarte: (a) => void controleur.actionCarte(a),
        miseAJour: vue.miseAJour,
        ...(choix === undefined ? {} : { choixRestauration: choix }),
      };

/** Ligne d'état : l'indicateur, puis le bouton distinct qui ouvre la feuille (Q-CORR-STE-1, ST §5.1 ter). */
const LigneEtat = ({
  controleur,
  vue,
  ouverte,
  surOuvrir,
  refBouton,
}: {
  readonly controleur: ControleurInterface;
  readonly vue: VueInterface;
  readonly ouverte: boolean;
  readonly surOuvrir: () => void;
  readonly refBouton: RefObject<HTMLButtonElement | null>;
}) =>
  vue.indicateur === undefined ? null : (
    <div className="ligne-etat">
      <IndicateurSynchronisation
        vue={vue.indicateur}
        surReprendre={() => void controleur.reprendre()}
      />
      <BoutonFeuille ouverte={ouverte} surOuvrir={surOuvrir} refElement={refBouton} />
    </div>
  );

type ReferencesFocus = {
  readonly refBouton: RefObject<HTMLButtonElement | null>;
  readonly refTitre: RefObject<HTMLHeadingElement | null>;
};

/** Bandeau puis toast, à leur hauteur naturelle sous la ligne d'état. */
const BandeauEtToast = ({
  controleur,
  vue,
}: {
  readonly controleur: ControleurInterface;
  readonly vue: VueInterface;
}) => (
  <>
    {vue.bandeau === undefined ? null : (
      <Bandeau
        vue={vue.bandeau}
        appareil={APPAREIL}
        surAction={(a) => void controleur.actionBandeau(a)}
        surMasquer={() => void controleur.masquerRappel()}
        miseAJour={vue.miseAJour}
      />
    )}
    {vue.toast === undefined ? null : (
      <Toast code={vue.toast} surAction={() => void controleur.reessayer()} />
    )}
  </>
);

const ObjectifsDeLaPage = ({
  controleur,
  vue,
  navigation,
}: {
  readonly controleur: ControleurInterface;
  readonly vue: VueInterface;
  readonly navigation: NavigationUi;
}) => {
  const objectifs = controleur.objectifs();
  return objectifs === undefined ? null : (
    <EcransObjectifs
      objectifs={objectifs}
      navigation={navigation}
      consultationSeule={vue.consultationSeule}
    />
  );
};

/** Page de l'espace : ligne d'état, bandeau, toast, objectifs (hors défilement de la feuille). */
const PageEspace = ({
  controleur,
  vue,
  feuilleOuverte,
  surOuvrirFeuille,
  refBouton,
  navigation,
}: Omit<ProprietesEspace, 'surFermerFeuille'> &
  Pick<ReferencesFocus, 'refBouton'> & {
    readonly vue: VueInterface;
    readonly navigation: NavigationUi;
  }) => {
  return (
    <main className="espace-application" aria-label="Done Juan">
      <LigneEtat
        controleur={controleur}
        vue={vue}
        ouverte={feuilleOuverte}
        surOuvrir={surOuvrirFeuille}
        refBouton={refBouton}
      />
      <BandeauEtToast controleur={controleur} vue={vue} />
      <ObjectifsDeLaPage controleur={controleur} vue={vue} navigation={navigation} />
    </main>
  );
};

const CompteDeLaFeuille = ({
  controleur,
  vue,
}: {
  readonly controleur: ControleurInterface;
  readonly vue: VueInterface;
}) =>
  vue.compte === undefined ? null : (
    <SectionCompte vue={vue.compte} surAction={(a) => void controleur.actionCompte(a)} />
  );

/** Feuille « Compte et synchronisation » : « À lire », « Synchronisation », « Compte » et les confirmations ouvertes. */
const FeuilleDuCompte = ({
  controleur,
  vue,
  feuilleOuverte,
  surFermerFeuille,
  surVoir,
  refs,
}: Omit<ProprietesEspace, 'surOuvrirFeuille'> & {
  readonly refs: ReferencesFocus;
  readonly vue: VueInterface;
  readonly surVoir: (element: RefElementMetier) => void;
}) => {
  const choix = vue.choixRestauration && proprietesChoix(controleur, vue.choixRestauration);
  const synchronisation = proprietesSynchronisation(controleur, vue, choix);
  return (
    <>
      <FeuilleCompteEtSynchronisation
        ouverte={feuilleOuverte}
        surFermee={surFermerFeuille}
        aLire={<ALire controleur={controleur} surVoir={surVoir} />}
        {...(synchronisation === undefined ? {} : { synchronisation })}
        compte={<CompteDeLaFeuille controleur={controleur} vue={vue} />}
        dialogues={feuilleOuverte ? <Dialogues controleur={controleur} /> : undefined}
        refBoutonOuverture={refs.refBouton}
        refTitre={refs.refTitre}
      />
      {choix === undefined ? null : <FeuilleChoixRestauration {...choix} />}
    </>
  );
};

/** Focus de fin de « À lire » : titre de la feuille si elle est ouverte, sinon son bouton d'ouverture (Q-CORR-STE-6). */
const useFocusDeFinALire = (vue: VueInterface, feuilleOuverte: boolean): ReferencesFocus => {
  const refBouton = useRef<HTMLButtonElement>(null);
  const refTitre = useRef<HTMLHeadingElement>(null);
  useFocusFinALire(vue.nonRetenues !== undefined, () =>
    feuilleOuverte ? refTitre.current : refBouton.current,
  );
  return { refBouton, refTitre };
};

/**
 * Espace de l'application : la page, puis la feuille modale qui porte « À lire », « Synchronisation » et « Compte »
 * (ANO-005).
 */
const EspaceApplication = (proprietes: ProprietesEspace) => {
  const { controleur, feuilleOuverte, surFermerFeuille } = proprietes;
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  const { voir, ...navigation } = useNavigation();
  const refs = useFocusDeFinALire(vue, feuilleOuverte);
  return (
    <>
      <PageEspace {...proprietes} vue={vue} refBouton={refs.refBouton} navigation={navigation} />
      <FeuilleDuCompte
        {...proprietes}
        vue={vue}
        refs={refs}
        surVoir={(element) => {
          surFermerFeuille();
          voir(element);
        }}
      />
    </>
  );
};

/** Confirmations du compte et ERR-017, par-dessus l'écran courant. */
const Dialogues = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      {vue.confirmation === undefined ? null : (
        <DialogueConfirmation
          vue={vue.confirmation}
          surConfirmer={() => void controleur.confirmer()}
          surAnnuler={() => void controleur.annuler()}
        />
      )}
      {vue.suppressionBloquee === undefined ? null : (
        <SuppressionBloquee
          enCours={vue.suppressionBloquee.enCours}
          surReessayer={() => void controleur.reessayerSuppression()}
          surAllerALaConnexion={() => void controleur.allerALaConnexion()}
        />
      )}
    </>
  );
};

/** État de la feuille : elle ne survit pas à la fin de session (ST §5.2) ; l'état est ajusté pendant le rendu. */
const useFeuilleOuverte = (enApplication: boolean) => {
  const [ouverte, setOuverte] = useState(false);
  if (!enApplication && ouverte) setOuverte(false);
  const ouvrir = () => {
    setOuverte(true);
  };
  const fermer = () => {
    setOuverte(false);
  };
  return { ouverte: ouverte && enApplication, ouvrir, fermer };
};

const Application = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  const feuille = useFeuilleOuverte(vue.racine.ecran === 'APPLICATION');
  return (
    <>
      <Racine
        vue={vue.racine}
        connexion={
          <EcranConnexion
            vue={vue.connexion}
            surAction={() => void controleur.continuerAvecGoogle()}
          />
        }
        application={
          <EspaceApplication
            controleur={controleur}
            feuilleOuverte={feuille.ouverte}
            surOuvrirFeuille={feuille.ouvrir}
            surFermerFeuille={feuille.fermer}
          />
        }
      />
      {feuille.ouverte ? null : <Dialogues controleur={controleur} />}
    </>
  );
};

const racine = document.getElementById('racine');
if (racine === null) throw new ErreurProgrammation('Élément « racine » absent de index.html');
createRoot(racine).render(
  <StrictMode>
    <IonApp>
      <Application controleur={controleur} />
    </IonApp>
  </StrictMode>,
);
