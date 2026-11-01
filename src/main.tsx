// ADR-014 (M2) : premier import, pour que Zod soit en mode interprété avant la construction de tout schéma.
import './compte/infrastructure/zod-sans-compilation';
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
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
import type { ControleurInterface } from './composition/controleur-interface';
import { demarrerWeb } from './composition/web';
import { appareilDepuisAgent } from './commun/presentation/format/appareil';
import { Toast } from './commun/presentation/ui/toast';
import { FeuilleSynchronisation } from './synchronisation/presentation/ui/FeuilleSynchronisation';
import { Bandeau } from './synchronisation/presentation/ui/Bandeau';
import { ModificationsNonRetenues } from './synchronisation/presentation/ui/ModificationsNonRetenues';
import type { RefElementMetier } from './synchronisation';
import { IndicateurSynchronisation } from './synchronisation/presentation/ui/IndicateurSynchronisation';
import './commun/presentation/ui/styles.css';
import type { ObjectifsTaches } from './composition/objectifs-taches';
import { EspaceObjectifs } from './objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import { EspaceTaches } from './objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from './objectifs-taches/presentation/ui/etat/magasin-taches';
import {
  LIBELLES_OBJECTIFS,
  LIBELLES_TACHES,
} from './objectifs-taches/presentation/ui/libelles-ui';
import { creerMagasinObjectifsTaches } from './objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';

// RED-02 : première instruction, synchrone, avant tout rendu, toute requête et le chargement de GIS : le fragment
// de l'URL de retour de Google est copié, effacé, puis analysé. Les modules importés n'ont aucun effet de bord.
// RED-05 : le retour (qui porte le jeton) n'est lié à aucun nom de module ; il n'existe que le temps de l'appel.
const controleur = demarrerWeb(consommerRetourRedirection(NAVIGATION_RETOUR_NAVIGATEUR), {
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
});

setupIonicReact();

/** Appareil affiché dans les textes (« ce smartphone », « ce PC »), calculé une fois (RC-R2-7). */
const APPAREIL = appareilDepuisAgent(navigator.userAgent, navigator.maxTouchPoints);

type Onglet = 'TACHES' | 'OBJECTIFS';

const ONGLETS: ReadonlyArray<readonly [Onglet, string]> = [
  ['TACHES', LIBELLES_TACHES.titreListe],
  ['OBJECTIFS', LIBELLES_OBJECTIFS.titreListe],
];

/** Navigation entre les deux espaces ; la liste « Tâches » est l'accueil (ECR-002). */
const NavigationEspaces = ({
  onglet,
  surChoisir,
}: {
  readonly onglet: Onglet;
  readonly surChoisir: (onglet: Onglet) => void;
}) => (
  <nav aria-label={LIBELLES_TACHES.navigationEspaces}>
    {ONGLETS.map(([valeur, texte]) => (
      <button
        key={valeur}
        type="button"
        aria-current={valeur === onglet ? 'page' : undefined}
        onClick={() => {
          surChoisir(valeur);
        }}
      >
        {texte}
      </button>
    ))}
  </nav>
);

/** Magasins des tâches et des objectifs de l'espace ouvert, abonnés à son dépôt. */
const useMagasins = (objectifs: ObjectifsTaches) => {
  const magasinObjectifs = useMemo(() => creerMagasinObjectifsTaches(objectifs), [objectifs]);
  const magasinTaches = useMemo(() => creerMagasinTaches(objectifs), [objectifs]);
  useEffect(() => magasinObjectifs.getState().actions.observerDepot(), [magasinObjectifs]);
  useEffect(() => magasinTaches.getState().actions.observerDepot(), [magasinTaches]);
  return { magasinObjectifs, magasinTaches };
};

type Magasins = ReturnType<typeof useMagasins>;

/** Ouvre le détail demandé par « Voir … » de la section « À lire », puis acquitte la demande. */
const useOuvertureDemandee = (
  { magasinObjectifs, magasinTaches }: Magasins,
  demande: RefElementMetier | undefined,
  surOuvert: () => void,
): void => {
  useEffect(() => {
    if (demande === undefined) return;
    if (demande.type === 'TACHE') void magasinTaches.getState().actions.ouvrirDetail(demande.id);
    else void magasinObjectifs.getState().actions.ouvrirDetail(demande.id);
    surOuvert();
  }, [demande, magasinObjectifs, magasinTaches, surOuvert]);
};

type NavigationUi = {
  readonly onglet: Onglet;
  readonly surOnglet: (onglet: Onglet) => void;
  /** Élément demandé par « Voir … » ; `surOuvert` acquitte la demande. */
  readonly demande: RefElementMetier | undefined;
  readonly surOuvert: () => void;
};

/** Écrans des tâches (US-002, rang 5) et des objectifs (US-001, rang 2), sur les magasins de l'espace ouvert. */
const EcransObjectifs = ({
  objectifs,
  navigation,
}: {
  readonly objectifs: ObjectifsTaches;
  readonly navigation: NavigationUi;
}) => {
  const magasins = useMagasins(objectifs);
  const { onglet, surOnglet, demande, surOuvert } = navigation;
  useOuvertureDemandee(magasins, demande, surOuvert);
  return (
    <>
      <NavigationEspaces onglet={onglet} surChoisir={surOnglet} />
      {onglet === 'TACHES' ? (
        <EspaceTaches magasin={magasins.magasinTaches} />
      ) : (
        <EspaceObjectifs
          magasin={magasins.magasinObjectifs}
          taches={{
            magasin: magasins.magasinTaches,
            surOuvrirTache: (id) => {
              surOnglet('TACHES');
              void magasins.magasinTaches.getState().actions.ouvrirDetail(id);
            },
          }}
        />
      )}
    </>
  );
};

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

/** Indicateur et bandeau de synchronisation, présents avec l'état de synchronisation. */
const IndicateurEtBandeau = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      {vue.indicateur === undefined ? null : (
        <IndicateurSynchronisation
          vue={vue.indicateur}
          surReprendre={() => void controleur.reprendre()}
        />
      )}
      {vue.bandeau === undefined ? null : (
        <Bandeau
          vue={vue.bandeau}
          appareil={APPAREIL}
          surAction={() => void controleur.reprendre()}
          surMasquer={() => void controleur.masquerRappel()}
        />
      )}
    </>
  );
};

/** Indicateur, bandeau, section « À lire » et feuille de synchronisation (ECR-011). */
const EtatSynchronisation = ({
  controleur,
  surVoir,
}: {
  readonly controleur: ControleurInterface;
  readonly surVoir: (element: RefElementMetier) => void;
}) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      <IndicateurEtBandeau controleur={controleur} />
      <ALire controleur={controleur} surVoir={surVoir} />
      {vue.feuille === undefined ? null : (
        <FeuilleSynchronisation
          vue={vue.feuille}
          surSynchroniser={() => void controleur.synchroniser()}
          surActionCarte={(a) => void controleur.actionCarte(a)}
        />
      )}
    </>
  );
};

/** Navigation entre espaces, pilotée aussi par « Voir … » de la section « À lire ». */
const useNavigation = (): NavigationUi & {
  readonly voir: (element: RefElementMetier) => void;
} => {
  const [onglet, surOnglet] = useState<Onglet>('TACHES');
  const [demande, setDemande] = useState<RefElementMetier | undefined>(undefined);
  const surOuvert = useCallback(() => {
    setDemande(undefined);
  }, []);
  const voir = useCallback((element: RefElementMetier) => {
    surOnglet(element.type === 'TACHE' ? 'TACHES' : 'OBJECTIFS');
    setDemande(element);
  }, []);
  return { onglet, surOnglet, demande, surOuvert, voir };
};

/** Espace de l'application : indicateur, bandeau, section « Compte », puis les objectifs. */
const EspaceApplication = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  const objectifs = controleur.objectifs();
  const { voir, ...navigation } = useNavigation();
  return (
    <main aria-label="Done Juan">
      <EtatSynchronisation controleur={controleur} surVoir={voir} />
      {vue.toast === undefined ? null : (
        <Toast code={vue.toast} surAction={() => void controleur.reessayer()} />
      )}
      {vue.compte === undefined ? null : (
        <SectionCompte vue={vue.compte} surAction={(a) => void controleur.actionCompte(a)} />
      )}
      {objectifs === undefined ? null : (
        <EcransObjectifs objectifs={objectifs} navigation={navigation} />
      )}
    </main>
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

const Application = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
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
        application={<EspaceApplication controleur={controleur} />}
      />
      <Dialogues controleur={controleur} />
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
