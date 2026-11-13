import type {
  EntreeJournalTechnique,
  JournalTechnique,
} from '../commun/application/ports/journal-technique';
import { EtatReseauNavigateur } from '../commun/infrastructure/etat-reseau-navigateur';
import { GenerateurUuidV7 } from '../commun/infrastructure/generateur-uuid-v7';
import { HorlogeSysteme } from '../commun/infrastructure/horloge-systeme';
import { JournalTechniqueLocal } from '../commun/infrastructure/journal-technique-local';
import {
  PersistanceNavigateur,
  type GestionnaireStockage,
} from '../commun/infrastructure/persistance-navigateur';
import { PlanificateurNavigateur } from '../commun/infrastructure/planificateur-navigateur';
import { SourceAleatoireCrypto } from '../commun/infrastructure/source-aleatoire-crypto';
import { registreSaisie } from '../commun/presentation/saisie/registre-saisie';
import type { IssueOuverture } from '../compte/application/cas-usage/ouvrir-application';
import type { RetourGoogle } from '../compte/application/ports/fournisseur-auth';
import { DELAI_MAX_ATTENTE_REDIRECTION } from '../compte/domaine/ouverture';
import {
  FournisseurAuthWeb,
  NAVIGATION_NAVIGATEUR,
  type DependancesFournisseurAuthWeb,
} from '../compte/infrastructure/auth/fournisseur-auth-web';
import { lireIdentiteUserinfo } from '../compte/infrastructure/auth/lecture-identite';
import { PasserelleGisNavigateur } from '../compte/infrastructure/auth/passerelle-gis-navigateur';
import { AvisOngletsBroadcast } from '../compte/infrastructure/avis-onglets-broadcast';
import type { BaseTechnique } from '../compte/infrastructure/base-technique';
import { lireConfiguration, type Configuration } from '../compte/infrastructure/configuration';
import type { Horloge } from '../commun/application/ports/horloge';
import type { ObservateurEchangesGoogle } from '../commun/application/ports/observateur-echanges-google';
import { ClientGoogle } from '../infrastructure-google';
import {
  MiseAJourServiceWorker,
  type ConteneurServiceWorker,
} from '../synchronisation/infrastructure/mise-a-jour-service-worker';
import { TransportSynchroDrive } from '../synchronisation/infrastructure/drive/transport-synchro-drive';
import { verrouOngletsDuNavigateur } from '../synchronisation/infrastructure/verrou-onglets-web';
import { version as VERSION_APPLICATION } from '../../package.json';
import {
  assemblerApplication,
  RelaisEchangesGoogle,
  type AdaptateursApplication,
  type Application,
} from './application';
import { ControleurInterface } from './controleur-interface';
import { ecouterFinDeSession, quitterApresFinDeSession } from './fin-session-onglets';
import { armerReevaluationRappel } from './reevaluation-rappel';

// Composition de la PWA (ADR-013 ; ST-US-022 §3.2 n° 51, §6.2). Appelée par main.tsx, après la consommation du
// retour de redirection (RED-02). Rien ne s'exécute à l'évaluation de ce module.

export type Navigateur = {
  readonly variables: Readonly<Record<string, unknown>>;
  readonly agent: string;
  readonly pointsTactiles: number;
  /** Rechargement de la page (fin de session dans un autre onglet, fermeture imposée). */
  readonly recharger: () => void;
  /** Interrompt une navigation en cours (`window.stop()`), à l'échéance de l'écran d'attente. */
  readonly arreterNavigation: () => void;
  /** Ouvre `url` dans un nouvel onglet, sans lien avec la page (`noopener,noreferrer`). */
  readonly ouvrirOnglet: (url: string) => void;
  /** `navigator.serviceWorker`, absent d'un navigateur sans service worker (« Mettre à jour », ST-US-017 §6.8 n° 10). */
  readonly conteneurServiceWorker: ConteneurServiceWorker | undefined;
  /** `navigator.storage`, absent d'un navigateur sans l'API (ST-US-018 v0.4 §3 n° 3 : stockage `INDISPONIBLE`). */
  readonly gestionnaireStockage: GestionnaireStockage | undefined;
};

/** Journal technique local : tampon de 7 jours dans la base technique ; `debug` désactivé en production. */
const puitsJournal =
  (configuration: Configuration, horloge: HorlogeSysteme, base: () => BaseTechnique | undefined) =>
  (entree: EntreeJournalTechnique): void => {
    if (configuration.env === 'production' && entree.niveau === 'debug') return;
    void base()?.journaliser(entree, horloge.maintenant());
  };

/** Horloge, journal, réseau et hasard de la page, partagés par l'application et par ses adaptateurs Google. */
export type SocleWeb = Pick<
  DependancesFournisseurAuthWeb,
  'horloge' | 'journal' | 'reseau' | 'aleatoire'
>;

/**
 * Ce qui distingue la composition de production de la composition `test-ihm` (ST-US-018 v0.4 §6.4 n° 5) : les
 * fabriques du fournisseur d'authentification et du transport Drive. Tout le reste est commun (`demarrerAvec`).
 */
export type AdaptateursVariables = {
  readonly fournisseur: (
    configuration: Configuration,
    socle: SocleWeb,
  ) => AdaptateursApplication['fournisseur'];
  readonly transport: (
    socle: SocleWeb,
    echangesGoogle: ObservateurEchangesGoogle,
  ) => AdaptateursApplication['transport'];
};

/** FournisseurAuthWeb (ADR-013) : GIS chargé à la demande, userinfo, navigation pleine page. */
const fournisseurWeb =
  (configuration: Configuration, socle: SocleWeb): AdaptateursApplication['fournisseur'] =>
  ({ memoireRedirection, coffre, session }) =>
    new FournisseurAuthWeb({
      ...socle,
      configuration,
      passerelle: new PasserelleGisNavigateur(),
      lireIdentite: lireIdentiteUserinfo(fetch.bind(globalThis)),
      navigation: NAVIGATION_NAVIGATEUR,
      memoireRedirection,
      coffre,
      compteDeLaSession: () => {
        const etat = session.etat();
        return etat.type === 'SANS_SESSION' ? undefined : etat.identite.compte;
      },
    });

/**
 * Transport Drive v3 (ST-US-017 §4.4) : jeton lu dans le coffre à chaque requête ; chaque réponse est signalée au
 * relais pour la mesure de l'horloge (§6.8 n° 1). La lecture d'identité (userinfo) n'utilise pas `ClientGoogle` : elle n'est pas mesurée.
 */
const transportDrive =
  (horloge: Horloge, observateur: ObservateurEchangesGoogle): AdaptateursApplication['transport'] =>
  (coffre) =>
    new TransportSynchroDrive(
      new ClientGoogle({
        lireJeton: () => coffre.lire()?.jeton,
        fetch: fetch.bind(globalThis),
        horloge,
        observateur,
      }),
    );

/** Horloge, journal local, réseau et hasard de la PWA. */
const socleWeb = (configuration: Configuration, base: () => BaseTechnique | undefined) => {
  const horloge = new HorlogeSysteme();
  return {
    horloge,
    journal: new JournalTechniqueLocal(puitsJournal(configuration, horloge, base)),
    reseau: new EtatReseauNavigateur(),
    aleatoire: new SourceAleatoireCrypto(),
  };
};

/**
 * Adaptateurs liés à la page : service worker, rechargement, onglets et persistance du stockage. `quitter` : fermeture
 * imposée (`versionchange`), coordination arrêtée avant le rechargement (ST-US-031 §6.4, §6.5 n° 9).
 */
const adaptateursNavigateur = (navigateur: Navigateur, quitter: () => void) => ({
  miseAJour: new MiseAJourServiceWorker({
    conteneur: navigateur.conteneurServiceWorker,
    recharger: navigateur.recharger,
  }),
  versionApplication: VERSION_APPLICATION,
  surFermetureImposee: quitter,
  ouvrirOnglet: navigateur.ouvrirOnglet,
  persistance: new PersistanceNavigateur(navigateur.gestionnaireStockage),
});

/** Ce que la page partage avec l'assemblage : canal d'avis et sortie de fin de session (ST-US-031 §6.5 n° 9). */
type LiensPage = { readonly avis: AvisOngletsBroadcast; readonly quitter: () => void };

/**
 * Un seul canal d'avis par onglet : un BroadcastChannel ne reçoit pas ses propres messages, mais une autre
 * instance ouverte dans la même page les reçoit (l'onglet qui se déconnecte se rechargerait lui-même). Un seul
 * lecteur de `navigator.locks` : `verrouOngletsDuNavigateur` (ST-US-031 §6.5 n° 8).
 */
const assembler = (
  variables: AdaptateursVariables,
  configuration: Configuration,
  navigateur: Navigateur,
  { avis, quitter }: LiensPage,
): Application => {
  const reference: { base?: BaseTechnique } = {};
  const socle = socleWeb(configuration, () => reference.base);
  const echangesGoogle = new RelaisEchangesGoogle(socle.journal);
  const application = assemblerApplication({
    ...socle,
    env: configuration.env,
    planificateur: new PlanificateurNavigateur(),
    generateur: new GenerateurUuidV7(),
    avis,
    gardeSaisie: registreSaisie,
    fournisseur: variables.fournisseur(configuration, socle),
    transport: variables.transport(socle, echangesGoogle),
    echangesGoogle,
    verrou: verrouOngletsDuNavigateur(socle.journal),
    ...adaptateursNavigateur(navigateur, quitter),
  });
  reference.base = application.base;
  return application;
};

/**
 * ST-US-017 §6.4 : retour au premier plan (cycle) ; page masquée : pas de cycle toutes les 2 min. Au retour, le saut
 * de l'horloge est contrôlé **avant** le cycle, pour qu'il horodate déjà corrigé (v0.11 §6.8 n° 3). ST-US-018 v0.4
 * §6.2 (RG-057) : au retour, la vue est recalculée (le rappel des 24 h peut apparaître ; le masquage n'est pas remis).
 */
const auChangementDeVisibilite = async (
  application: Application,
  controleur: ControleurInterface,
): Promise<void> => {
  const visible = document.visibilityState === 'visible';
  if (visible) await application.controlerHorloge();
  application.espace()?.cycle.definirPremierPlan(visible);
  if (visible) void controleur.rafraichir();
};

/**
 * Recalculs de la vue : changement de réseau, visibilité de la page et, ST-US-018 v0.4 §6.2 (RG-057), chaque minute.
 * La page vit autant que l'application : aucune annulation.
 */
const ecouterDeclencheurs = (application: Application, controleur: ControleurInterface): void => {
  new EtatReseauNavigateur().surChangement(() => void controleur.rafraichir());
  armerReevaluationRappel(new PlanificateurNavigateur(), () => void controleur.rafraichir());
  document.addEventListener(
    'visibilitychange',
    () => void auChangementDeVisibilite(application, controleur),
  );
};

/** Suite de l'ouverture : persistance, échéance de l'attente de Google, puis vue. */
const apresOuvertureWeb = async (
  application: Application,
  controleur: ControleurInterface,
  navigateur: Navigateur,
  issue: IssueOuverture,
): Promise<void> => {
  // ST-US-018 v0.4 §6.3 n° 3 : demande de persistance au premier lancement, même avant la connexion.
  void application.etatPersistance();
  if (issue.type === 'REDIRECTION_LANCEE') {
    new PlanificateurNavigateur().apres(DELAI_MAX_ATTENTE_REDIRECTION, () => {
      navigateur.arreterNavigation();
      void application.ouvrirApplication.abandonnerAttenteGoogle();
    });
  }
  await controleur.apresOuverture(issue, () =>
    application.ouvrirApplication.executer({ type: 'AUCUN' }),
  );
};

/** Ce que `main.tsx` reçoit de l'ouverture : le contrôleur de l'interface et le journal (enregistrement du service worker). */
export type DemarrageWeb = {
  readonly controleur: ControleurInterface;
  readonly journal: JournalTechnique;
};

/** Adaptateurs Google de production : GIS et redirection (ADR-013), Drive v3 mesuré (ST-US-017 §6.8 n° 1). */
const ADAPTATEURS_GOOGLE: AdaptateursVariables = {
  fournisseur: fournisseurWeb,
  transport: (socle, echangesGoogle) => transportDrive(socle.horloge, echangesGoogle),
};

/**
 * Ouvre l'application (DAT §4.1.7) ; l'écran d'attente de Google dure au plus 10 s (RL-LOT-001-S6, DEC-038).
 * `main.tsx` l'appelle sans `adaptateurs` (Google réel). ST-US-018 v0.4 §6.4 n° 5 : la composition `test-ihm` la
 * réutilise (`demarrerAvec`) en ne changeant que les deux fabriques Google ; le retour reste lu une seule fois, ici
 * (RED-05, UT-COMP-US-022-89).
 */
export const demarrerWeb = (
  retour: RetourGoogle,
  navigateur: Navigateur,
  adaptateurs: AdaptateursVariables = ADAPTATEURS_GOOGLE,
): DemarrageWeb => {
  const configuration = lireConfiguration(navigateur.variables, {
    agent: navigateur.agent,
    pointsTactiles: navigateur.pointsTactiles,
  });
  const avis = new AvisOngletsBroadcast(configuration.env);
  // ST-US-031 §6.4, §6.5 n° 9 : référence tardive (l'application n'existe pas encore quand `quitter` est créée).
  const reference: { application?: Application } = {};
  const quitter = quitterApresFinDeSession({
    arreterCoordination: () => reference.application?.arreterCoordination(),
    recharger: navigateur.recharger,
  });
  const application = assembler(adaptateurs, configuration, navigateur, { avis, quitter });
  reference.application = application;
  const controleur = new ControleurInterface(
    application,
    new HorlogeSysteme(),
    application.objectifs,
  );
  ecouterFinDeSession(avis, quitter);
  ecouterDeclencheurs(application, controleur);
  const ouverture = application.ouvrirApplication.executer(retour);
  void ouverture.then((issue) => apresOuvertureWeb(application, controleur, navigateur, issue));
  return { controleur, journal: application.journal };
};
