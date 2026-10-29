import type { EtatReseau } from '../commun/application/ports/etat-reseau';
import type { GenerateurIdentifiants } from '../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../commun/application/ports/horloge';
import type { JournalTechnique } from '../commun/application/ports/journal-technique';
import type { Planificateur } from '../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../commun/application/ports/source-aleatoire';
import { ErreurProgrammation } from '../commun/domaine/erreur-programmation';
import { echec, succes } from '../commun/domaine/resultat';
import { OuvrirApplication } from '../compte/application/cas-usage/ouvrir-application';
import { ReprendreSession } from '../compte/application/cas-usage/reprendre-session';
import { SeConnecter } from '../compte/application/cas-usage/se-connecter';
import { SeDeconnecter } from '../compte/application/cas-usage/se-deconnecter';
import { SignalerRefusJeton } from '../compte/application/cas-usage/signaler-refus-jeton';
import { SupprimerDonneesAppareil } from '../compte/application/cas-usage/supprimer-donnees-appareil';
import type { AvisOnglets } from '../compte/application/ports/avis-onglets';
import type { CoffreJetons } from '../compte/application/ports/coffre-jetons';
import type { DepotAvantSortie } from '../compte/application/ports/depot-avant-sortie';
import type { FournisseurAuth } from '../compte/application/ports/fournisseur-auth';
import type { GardeSaisie } from '../compte/application/ports/garde-saisie';
import type { MemoireRedirection } from '../compte/application/ports/memoire-redirection';
import type { MemoireSession } from '../compte/application/ports/memoire-session';
import { SessionCourante } from '../compte/application/session-courante';
import {
  BaseTechnique,
  MemoireRedirectionDexie,
  MemoireSessionDexie,
} from '../compte/infrastructure/base-technique';
import { CoffreJetonsMemoire } from '../compte/infrastructure/coffre-jetons-memoire';
import { GestionEspacesIndexedDb } from '../compte/infrastructure/espaces/gestion-espaces-indexeddb';
import type { NomEnvironnement } from '../compte/infrastructure/espaces/nom-espace';
import { CycleSynchronisation } from '../synchronisation/application/cycle-synchronisation';
import { DepotAvantSortieSynchro } from '../synchronisation/application/depot-avant-sortie-synchro';
import { MasquageRappel } from '../synchronisation/application/masquage-rappel';
import type {
  AccesGoogle,
  EtatAccesGoogle,
} from '../synchronisation/application/ports/acces-google';
import { SUIVI_CYCLE_AU_REPOS } from '../synchronisation/application/ports/suivi-cycle';
import type { TransportSynchro } from '../synchronisation/application/ports/transport-synchro';
import { PreparationDossierDrive } from '../synchronisation/application/preparation-dossier-drive';
import {
  consulterEtatSynchronisation,
  type AttenteLocale,
  type EtatSynchronisationLu,
} from '../synchronisation/application/requetes/consulter-etat-synchronisation';
import type { ServiceEtatLocal } from '../synchronisation/application/service-etat-local';
import { ServiceEtatLocalTransactionnel } from '../synchronisation/application/service-etat-local-transactionnel';
import {
  decompterModificationsEnAttente,
  plusAncienneModificationEnAttente,
} from '../synchronisation/domaine/index-en-attente';
import { DepotLocalDexie } from '../synchronisation/infrastructure/depot-local-dexie';
import { assemblerObjectifsTaches, type ObjectifsTaches } from './objectifs-taches';

// Assemblage de l'application (ST-US-022 §3.2 n° 51) partagé par la PWA (web.ts) et le banc de test, qui n'en
// changent que les adaptateurs du bord : Google (fournisseur, transport), réseau, temps, onglets.

export type AdaptateursApplication = {
  readonly env: NomEnvironnement;
  /** IDBFactory de l'appareil (fake-indexeddb en test) ; absente : celle du navigateur. */
  readonly fabrique?: IDBFactory;
  readonly horloge: Horloge;
  readonly planificateur: Planificateur;
  readonly aleatoire: SourceAleatoire;
  readonly reseau: EtatReseau;
  readonly journal: JournalTechnique;
  readonly generateur: GenerateurIdentifiants;
  readonly avis: AvisOnglets;
  readonly gardeSaisie: GardeSaisie;
  readonly fournisseur: (p: {
    readonly memoireRedirection: MemoireRedirection;
    readonly coffre: CoffreJetons;
    readonly session: SessionCourante;
  }) => FournisseurAuth;
  readonly transport: (coffre: CoffreJetons) => TransportSynchro;
  /** Version de l'application écrite dans le fichier d'appareil (ST-US-017 §5.2). */
  readonly versionApplication: string;
  /** `versionchange` sur l'espace ou la base technique (RL-LOT-001-A1) : la PWA recharge la page. */
  readonly surFermetureImposee: () => void;
};

export type Application = {
  readonly session: SessionCourante;
  readonly coffre: CoffreJetons;
  readonly memoireSession: MemoireSession;
  readonly memoireRedirection: MemoireRedirection;
  readonly fournisseur: FournisseurAuth;
  readonly espaces: GestionEspacesIndexedDb;
  readonly ouvrirApplication: OuvrirApplication;
  readonly seConnecter: SeConnecter;
  readonly reprendreSession: ReprendreSession;
  readonly seDeconnecter: SeDeconnecter;
  readonly supprimerDonnees: SupprimerDonneesAppareil;
  readonly signalerRefus: SignalerRefusJeton;
  readonly accesGoogle: AccesGoogle;
  readonly masquage: MasquageRappel;
  readonly base: BaseTechnique;
  /** Espace du compte ouvert (dépôt, service d'écriture, cycle de synchronisation) ; undefined sans session. */
  readonly espace: () => EspaceOuvert | undefined;
  /** Cas d'usage et requêtes des objectifs sur l'espace ouvert ; undefined sans session (ST-US-001 §3 n° 34). */
  readonly objectifs: () => ObjectifsTaches | undefined;
  readonly consulterEtat: () => Promise<EtatSynchronisationLu | undefined>;
  /** Ferme les connexions de cette instance (fin de page, ou instance abandonnée par le banc). */
  readonly arreter: () => void;
};

export type EspaceOuvert = {
  readonly depot: DepotLocalDexie;
  readonly service: ServiceEtatLocal;
  /** ST-US-017 §6.4 : un cycle par espace, démarré à l'ouverture de l'espace, arrêté à sa fermeture. */
  readonly cycle: CycleSynchronisation;
};

/** Ce qu'il faut au cycle d'un espace, connu une fois la session et l'accès Google assemblés. */
type FabriqueCycle = { creer?: (depot: DepotLocalDexie) => CycleSynchronisation };

const attenteDe = async (espace: EspaceOuvert | undefined): Promise<AttenteLocale> => {
  if (espace === undefined) return { enAttente: 0 };
  const etat = await espace.depot.lire();
  if (!etat.ok) return { enAttente: 0 };
  const plusAncienne = plusAncienneModificationEnAttente(etat.valeur.enAttente);
  return {
    enAttente: decompterModificationsEnAttente(etat.valeur.enAttente),
    ...(plusAncienne === undefined ? {} : { plusAncienneEnAttente: plusAncienne }),
  };
};

/** ST-US-017 §6.5 : dépôt réel par le cycle de l'espace ouvert ; sans espace, rien n'est tenté. */
const depotAvantSortie = (
  a: AdaptateursApplication,
  espace: () => EspaceOuvert | undefined,
  acces: () => AccesGoogle,
): DepotAvantSortie => {
  const synchro = (ouvert: EspaceOuvert) =>
    new DepotAvantSortieSynchro({
      depot: ouvert.depot,
      cycle: ouvert.cycle,
      reseau: a.reseau,
      acces: acces(),
    });
  return {
    compterEnAttente: async () => {
      const ouvert = espace();
      return ouvert === undefined ? 0 : synchro(ouvert).compterEnAttente();
    },
    deposerSiPossible: async () => {
      const ouvert = espace();
      return ouvert === undefined ? 'NON_TENTE' : synchro(ouvert).deposerSiPossible();
    },
  };
};

const accesGoogleDe = (session: SessionCourante, signaler: SignalerRefusJeton): AccesGoogle => {
  const etat = (): EtatAccesGoogle => {
    const courant = session.etat();
    return courant.type === 'OUVERTE' ? courant.acces : 'SANS_SESSION';
  };
  return {
    etat,
    signalerRefus: async () => {
      if (session.etat().type !== 'OUVERTE') return 'SANS_SESSION';
      return signaler.executer();
    },
    observer: (rappel) =>
      session.observer(() => {
        rappel(etat());
      }),
  };
};

type Stockage = {
  readonly base: BaseTechnique;
  readonly memoireSession: MemoireSession;
  readonly memoireRedirection: MemoireRedirection;
  readonly espaces: GestionEspacesIndexedDb;
  readonly espace: () => EspaceOuvert | undefined;
};

const avecFabrique = (a: AdaptateursApplication): { readonly fabrique?: IDBFactory } =>
  a.fabrique === undefined ? {} : { fabrique: a.fabrique };

const baseTechnique = (a: AdaptateursApplication): BaseTechnique =>
  new BaseTechnique({
    env: a.env,
    ...avecFabrique(a),
    surFermetureImposee: a.surFermetureImposee,
    surLigneInvalide: (table) => {
      a.journal.consigner({
        niveau: 'avertissement',
        evenement: 'LigneTechniqueInvalide',
        champs: { table },
      });
    },
  });

/** Arrête le cycle de l'espace, puis ferme sa connexion. */
const fermerEspace = (espace: EspaceOuvert | undefined): void => {
  espace?.cycle.arreter();
  espace?.depot.fermer();
};

/** Ouverture (ST-US-017 §6.4) : déclencheurs installés, puis un cycle si l'accès est déjà valide. */
const demarrerCycle = (a: AdaptateursApplication, cycle: CycleSynchronisation): void => {
  cycle.demarrer();
  cycle.synchroniserMaintenant().catch((erreur: unknown) => {
    a.journal.consigner({
      niveau: 'erreur',
      evenement: 'SynchronisationInterrompue',
      champs: { erreur: erreur instanceof Error ? erreur.name : 'inconnue' },
    });
  });
};

/** Base technique (session, redirection) et espaces de compte, ouverts par DepotLocalDexie. */
const assemblerStockage = (a: AdaptateursApplication, fabriqueCycle: FabriqueCycle): Stockage => {
  const base = baseTechnique(a);
  let ouvert: EspaceOuvert | undefined;
  const espaces = new GestionEspacesIndexedDb({
    env: a.env,
    ...avecFabrique(a),
    planificateur: a.planificateur,
    surOuverture: async (nomBase) => {
      const espace = await ouvrirEspace(a, nomBase, fabriqueCycle);
      if (espace === undefined) return echec({ type: 'EspaceInaccessible' });
      if (ouvert !== espace) fermerEspace(ouvert);
      ouvert = espace;
      demarrerCycle(a, espace.cycle);
      return succes(undefined);
    },
    surFermeture: () => {
      fermerEspace(ouvert);
      ouvert = undefined;
      return Promise.resolve();
    },
  });
  return {
    base,
    memoireSession: new MemoireSessionDexie(base),
    memoireRedirection: new MemoireRedirectionDexie(base),
    espaces,
    espace: () => ouvert,
  };
};

const ouvrirEspace = async (
  a: AdaptateursApplication,
  nomBase: string,
  fabriqueCycle: FabriqueCycle,
): Promise<EspaceOuvert | undefined> => {
  const creerCycle = fabriqueCycle.creer;
  if (creerCycle === undefined) throw new ErreurProgrammation('Cycle non assemblé');
  const ouvert = await DepotLocalDexie.ouvrirEspace({
    nomBase,
    ...avecFabrique(a),
    generateur: a.generateur,
    surFermetureImposee: a.surFermetureImposee,
  });
  if (!ouvert.ok) return undefined;
  const depot = ouvert.valeur;
  return {
    depot,
    service: new ServiceEtatLocalTransactionnel({
      depot,
      horloge: a.horloge,
      generateur: a.generateur,
    }),
    cycle: creerCycle(depot),
  };
};

type Noyau = Stockage & {
  readonly session: SessionCourante;
  readonly coffre: CoffreJetons;
  readonly fournisseur: FournisseurAuth;
  readonly transport: TransportSynchro;
  readonly signalerRefus: SignalerRefusJeton;
  readonly accesGoogle: AccesGoogle;
  readonly depot: DepotAvantSortie;
};

const assemblerConnexion = (a: AdaptateursApplication, n: Noyau) => {
  const { memoireSession, memoireRedirection, fournisseur, espaces, session } = n;
  const preparation = new PreparationDossierDrive({
    transport: n.transport,
    planificateur: a.planificateur,
    aleatoire: a.aleatoire,
  });
  return {
    ouvrirApplication: new OuvrirApplication({
      ...{ memoireSession, memoireRedirection, fournisseur, espaces, session },
      ...{ reseau: a.reseau, horloge: a.horloge, journal: a.journal },
    }),
    seConnecter: new SeConnecter({
      reseau: a.reseau,
      fournisseur,
      preparation,
      espaces,
      memoireSession,
      session,
    }),
    reprendreSession: new ReprendreSession({
      ...{ reseau: a.reseau, gardeSaisie: a.gardeSaisie },
      ...{ fournisseur, memoireSession, session },
    }),
  };
};

const assemblerSortie = (a: AdaptateursApplication, n: Noyau) => {
  const dependances = {
    depot: n.depot,
    fournisseur: n.fournisseur,
    memoireSession: n.memoireSession,
    espaces: n.espaces,
    avis: a.avis,
    session: n.session,
  };
  return {
    seDeconnecter: new SeDeconnecter(dependances),
    supprimerDonnees: new SupprimerDonneesAppareil(dependances),
  };
};

/** ST-US-017 §3.1 n° 16 : l'indicateur lit le cycle de l'espace ouvert. */
const assemblerSynchronisation = (a: AdaptateursApplication, n: Noyau) => {
  const masquage = new MasquageRappel();
  return {
    masquage,
    consulterEtat: () =>
      consulterEtatSynchronisation({
        reseau: a.reseau,
        acces: n.accesGoogle,
        suivi: n.espace()?.cycle ?? SUIVI_CYCLE_AU_REPOS,
        masquage,
        attente: () => attenteDe(n.espace()),
      }),
  };
};

/** Session, coffre, fournisseur, transport et accès Google ; la fabrique de cycle est renseignée ici. */
const assemblerNoyau = (
  a: AdaptateursApplication,
  stockage: Stockage,
  fabriqueCycle: FabriqueCycle,
): Noyau => {
  const session = new SessionCourante();
  const coffre = new CoffreJetonsMemoire();
  const fournisseur = a.fournisseur({
    memoireRedirection: stockage.memoireRedirection,
    coffre,
    session,
  });
  const signalerRefus = new SignalerRefusJeton({
    coffre,
    horloge: a.horloge,
    memoireSession: stockage.memoireSession,
    session,
  });
  const accesGoogle = accesGoogleDe(session, signalerRefus);
  const transport = a.transport(coffre);
  fabriqueCycle.creer = (depot) =>
    new CycleSynchronisation({ ...a, depot, transport, acces: accesGoogle });
  return {
    ...stockage,
    ...{ session, coffre, fournisseur, transport, signalerRefus, accesGoogle },
    depot: depotAvantSortie(a, stockage.espace, () => accesGoogle),
  };
};

/** Un assemblage par espace ouvert : le service d'écriture change avec le compte. */
const objectifsDe = (
  a: AdaptateursApplication,
  espace: () => EspaceOuvert | undefined,
): (() => ObjectifsTaches | undefined) => {
  let memorise:
    { readonly service: ServiceEtatLocal; readonly objectifs: ObjectifsTaches } | undefined;
  return () => {
    const ouvert = espace();
    if (ouvert === undefined) return undefined;
    if (memorise?.service !== ouvert.service) {
      const { generateur, horloge } = a;
      memorise = {
        service: ouvert.service,
        objectifs: assemblerObjectifsTaches({ service: ouvert.service, generateur, horloge }),
      };
    }
    return memorise.objectifs;
  };
};

export const assemblerApplication = (a: AdaptateursApplication): Application => {
  const fabriqueCycle: FabriqueCycle = {};
  const stockage = assemblerStockage(a, fabriqueCycle);
  const noyau = assemblerNoyau(a, stockage, fabriqueCycle);
  return {
    ...noyau,
    ...assemblerConnexion(a, noyau),
    ...assemblerSortie(a, noyau),
    ...assemblerSynchronisation(a, noyau),
    objectifs: objectifsDe(a, stockage.espace),
    arreter: () => {
      fermerEspace(stockage.espace());
      stockage.base.fermer();
    },
  };
};
