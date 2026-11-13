import type { Instant } from '../commun/domaine/temps/instant';
import type {
  EtatPersistance,
  PersistanceStockage,
} from '../commun/application/ports/persistance-stockage';
import type { EcartTemps } from '../commun/domaine/temps/ecart-temps';
import type {
  EchangeGoogle,
  ObservateurEchangesGoogle,
} from '../commun/application/ports/observateur-echanges-google';
import type { EtatReseau } from '../commun/application/ports/etat-reseau';
import type { GenerateurIdentifiants } from '../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../commun/application/ports/horloge';
import type { JournalTechnique } from '../commun/application/ports/journal-technique';
import type { Annulation, Planificateur } from '../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../commun/application/ports/source-aleatoire';
import { ErreurProgrammation } from '../commun/domaine/erreur-programmation';
import { echec, succes, type Resultat } from '../commun/domaine/resultat';
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
  MemoireDemandePersistanceDexie,
  MemoireRedirectionDexie,
  MemoireSessionDexie,
} from '../compte/infrastructure/base-technique';
import { CoffreJetonsMemoire } from '../compte/infrastructure/coffre-jetons-memoire';
import { GestionEspacesIndexedDb } from '../compte/infrastructure/espaces/gestion-espaces-indexeddb';
import type { NomEnvironnement } from '../compte/infrastructure/espaces/nom-espace';
import {
  AnnulerRestauration,
  DemanderRestauration,
  RepartirDeZero,
  type ErreurChoixRestauration,
} from '../synchronisation/application/cas-usage/choisir-restauration';
import { DemanderPersistance } from '../synchronisation/application/cas-usage/demander-persistance';
import { MarquerCommeLue } from '../synchronisation/application/cas-usage/marquer-comme-lue';
import {
  CoordinationOnglets,
  type EtatCoordination,
} from '../synchronisation/application/coordination-onglets';
import { CycleSynchronisation } from '../synchronisation/application/cycle-synchronisation';
import { exclusionParVerrou } from '../synchronisation/application/exclusion-cycle';
import { nomVerrouCycle } from '../synchronisation/application/noms-verrous';
import { DepotAvantSortieSynchro } from '../synchronisation/application/depot-avant-sortie-synchro';
import { MasquageRappel } from '../synchronisation/application/masquage-rappel';
import type {
  AccesGoogle,
  EtatAccesGoogle,
} from '../synchronisation/application/ports/acces-google';
import { SUIVI_CYCLE_AU_REPOS } from '../synchronisation/application/ports/suivi-cycle';
import type { ErreurDepotLocal } from '../synchronisation/application/ports/depot-local';
import type {
  IssueMiseAJour,
  MiseAJourApplication,
} from '../synchronisation/application/ports/mise-a-jour-application';
import type { TransportSynchro } from '../synchronisation/application/ports/transport-synchro';
import type { VerrouOnglets } from '../synchronisation/application/ports/verrou-onglets';
import { PreparationDossierDrive } from '../synchronisation/application/preparation-dossier-drive';
import {
  consulterModificationsNonRetenues,
  type ModificationsNonRetenuesLues,
} from '../synchronisation/application/requetes/consulter-modifications-non-retenues';
import {
  consulterEtatSynchronisation,
  type AttenteLocale,
  type EtatSynchronisationLu,
} from '../synchronisation/application/requetes/consulter-etat-synchronisation';
import type { ServiceEtatLocal } from '../synchronisation/application/service-etat-local';
import { ServiceEtatLocalConsultationSeule } from '../synchronisation/application/service-etat-local-consultation-seule';
import { SuiviHorloge } from '../synchronisation/application/suivi-horloge';
import { ServiceEtatLocalTransactionnel } from '../synchronisation/application/service-etat-local-transactionnel';
import {
  elementsEnAttenteDetailles,
  type ElementEnAttente,
} from '../synchronisation/domaine/elements-en-attente';
import { resumerCopieLocale, type CopieLocale } from '../synchronisation/domaine/copie-locale';
import { enHeureAppareil } from '../synchronisation/domaine/correction-horloge';
import type { Hlc } from '../synchronisation/domaine/hlc';
import { compterALire } from '../synchronisation/domaine/lectures';
import type { IdValeurEcartee } from '../synchronisation/domaine/valeurs-ecartees';
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
  /**
   * Source des échanges avec Google (ST-US-017 v0.11 §6.8 n° 16) : relais de `ClientGoogle` en production, du
   * `FauxDrive` au banc. L'observateur reçoit chaque réponse ; l'annulation le retire.
   */
  readonly echangesGoogle: {
    readonly observer: (observateur: ObservateurEchangesGoogle) => Annulation;
  };
  /** « Mettre à jour » (RG-058, ADR-013) : service worker en production, doublure au banc. */
  readonly miseAJour: MiseAJourApplication;
  /** Version de l'application écrite dans le fichier d'appareil (ST-US-017 §5.2). */
  readonly versionApplication: string;
  /** `versionchange` sur l'espace ou la base technique (RL-LOT-001-A1) : la PWA recharge la page. */
  readonly surFermetureImposee: () => void;
  /** Ouvre `url` dans un nouvel onglet (`noopener,noreferrer`) ; seul `main.tsx` touche à `window.open`. */
  readonly ouvrirOnglet: (url: string) => void;
  /** ST-US-018 v0.4 §3 n° 4 (rang 12) : `PersistanceNavigateur` en production, `PersistanceSimulee` au banc. */
  readonly persistance: PersistanceStockage;
  /**
   * ST-US-031 v0.4 §6.5 n° 1 (rang 13) : verrous entre onglets du profil (`verrouOngletsDuNavigateur` en production,
   * une vue neuve de `VerrouOngletsEnMemoire` par instance au banc). Meneur et exclusion du cycle de chaque espace.
   */
  readonly verrou: VerrouOnglets;
};

/**
 * Relais des échanges avec Google (ST-US-017 v0.11 §6.8 n° 16) : chaque client Google y signale ses réponses, le suivi
 * d'horloge de chaque espace s'y abonne. Un relais par appareil (PWA ou banc).
 */
export class RelaisEchangesGoogle implements ObservateurEchangesGoogle {
  readonly #observateurs = new Set<ObservateurEchangesGoogle>();

  constructor(private readonly journal: JournalTechnique) {}

  observer(observateur: ObservateurEchangesGoogle): Annulation {
    this.#observateurs.add(observateur);
    return () => {
      this.#observateurs.delete(observateur);
    };
  }

  surReponse(echange: EchangeGoogle): void {
    this.#observateurs.forEach((observateur) => {
      this.#avertir(observateur, echange);
    });
  }

  /** Le port promet « ne lève jamais » : un observateur fautif ne doit pas faire sortir d'exception du client Google. */
  #avertir(observateur: ObservateurEchangesGoogle, echange: EchangeGoogle): void {
    try {
      observateur.surReponse(echange);
    } catch (erreur) {
      this.journal.consigner({
        niveau: 'erreur',
        evenement: 'ObservateurEchangesEnEchec',
        champs: { erreur: erreur instanceof Error ? erreur.name : 'inconnue' },
      });
    }
  }
}

/** Ce que le choix RG-044 affiche : demande mémorisée et copie de l'appareil (ST-US-017 v0.10 §6.7 n° 17). */
export type ChoixRestaurationLu = {
  readonly restaurationDemandee: boolean;
  readonly copie: CopieLocale;
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
  /** Éléments en attente d'envoi de l'espace ouvert (feuille ECR-011) ; vide sans espace ou si la lecture échoue. */
  readonly lireElementsEnAttente: () => Promise<ReadonlyArray<ElementEnAttente>>;
  /** `dernierContactDrive` de l'espace ouvert ; undefined sans espace, sans échange ou si la lecture échoue. */
  readonly lireDernierContact: () => Promise<Instant | undefined>;
  /**
   * Section « À lire » d'ECR-011 (ST-US-017 v0.5 §3.4, I2-21) : détail des valeurs non retenues de l'espace ouvert ;
   * undefined sans espace ou si la lecture échoue.
   */
  readonly lireModificationsNonRetenues: () => Promise<ModificationsNonRetenuesLues | undefined>;
  /** « Compris » (RG-056 b) : marque ces valeurs comme lues ; sans effet, et sans erreur, sans espace ouvert. */
  readonly marquerCommeLue: (
    ids: ReadonlyArray<IdValeurEcartee>,
  ) => Promise<Resultat<undefined, ErreurDepotLocal>>;
  /** Cycle immédiat de l'espace ouvert ; sans effet sans espace. */
  readonly synchroniserMaintenant: () => Promise<void>;
  /**
   * ANO-001 (ST-US-017 v0.4.3 §6.9) : relais des notifications du cycle de l'espace ouvert, quel qu'il soit
   * (l'abonnement vaut aussi pour les espaces ouverts après lui).
   */
  readonly observerSynchronisation: (rappel: () => void) => Annulation;
  /** Choix d'`ERR-012` ; undefined sans espace ou si la lecture échoue. */
  readonly lireChoixRestauration: () => Promise<ChoixRestaurationLu | undefined>;
  /** Restauration connue de l'espace si c'est cet appareil qui l'a faite (déclencheur de `TST-RESTAUREE`, n° 9). */
  readonly lireRestaurationFaiteIci: () => Promise<Hlc | undefined>;
  /** « Restaurer mes données » : mémorisée, exécutée par le cycle. Sans espace : `AucuneAlteration`. */
  readonly demanderRestauration: () => Promise<
    Resultat<'EN_ATTENTE_DU_RESEAU' | 'LANCEE', ErreurChoixRestauration>
  >;
  /** « Annuler la demande » ; sans effet, et sans erreur, sans espace. */
  readonly annulerRestauration: () => Promise<Resultat<undefined, ErreurDepotLocal>>;
  /** « Repartir de zéro… » : `n` modifications perdues, ou un refus. Sans espace : `AucuneAlteration`. */
  readonly evaluerRepartirDeZero: () => Promise<
    Resultat<{ readonly n: number }, ErreurChoixRestauration>
  >;
  /** « Repartir de zéro » confirmé. Sans espace : `AucuneAlteration`. */
  readonly repartirDeZero: () => Promise<Resultat<undefined, ErreurChoixRestauration>>;
  /** Ouvre Google Drive dans un nouvel onglet (action de la carte ERR-011). */
  readonly ouvrirGoogleDrive: () => void;
  /** `EtatLocal.correctionHorloge` de l'espace ouvert (alerte `ALR-001`) ; undefined sans espace ou si la lecture échoue. */
  readonly lireCorrectionHorloge: () => Promise<EcartTemps | undefined>;
  /** « Mettre à jour » (n° 10) : appel direct au port, sans espace requis. */
  readonly mettreAJour: () => Promise<IssueMiseAJour>;
  /** Contrôle de saut de l'horloge de l'espace ouvert, avant le cycle du retour au premier plan (n° 3) ; sans effet sans espace. */
  readonly controlerHorloge: () => Promise<void>;
  /**
   * ST-US-018 v0.4 §4.2 (rang 12, tranche B1) : `DemanderPersistance.executer()` d'une instance unique par application
   * (`DemanderPersistance` sur `a.persistance` et `MemoireDemandePersistanceDexie(base)`), sans espace requis.
   */
  readonly etatPersistance: () => Promise<EtatPersistance>;
  /** Journal technique de l'application, pour l'enregistrement du service worker (ST-US-018 v0.4 §4.3, tranche D2). */
  readonly journal: JournalTechnique;
  /** Ferme les connexions de cette instance (fin de page, ou instance abandonnée par le banc). */
  readonly arreter: () => void;
  /** ST-US-031 §4.3 : arrête la coordination de l'espace ouvert (main rendue, cycle arrêté) ; sans effet sans espace. */
  readonly arreterCoordination: () => void;
  /** ST-US-031 §4.3 : `coordination.etat()` de l'espace ouvert ; undefined sans espace. */
  readonly lireCoordination: () => Promise<EtatCoordination | undefined>;
};

export type EspaceOuvert = {
  readonly depot: DepotLocalDexie;
  readonly service: ServiceEtatLocal;
  /** ST-US-017 §6.4 : un cycle par espace ; démarré par la coordination quand l'onglet devient meneur. */
  readonly cycle: CycleSynchronisation;
  /** ST-US-031 §6.1 : rôle de l'onglet pour cet espace, démarrée à l'ouverture, arrêtée à la fermeture. */
  readonly coordination: CoordinationOnglets;
  /** ST-US-017 v0.11 §6.8 n° 16 : correction d'horloge de l'espace, abonnée aux échanges avec Google. */
  readonly suivi: SuiviHorloge;
  /** Désabonnement du suivi des échanges avec Google, à la fermeture de l'espace. */
  readonly desabonnerSuivi: Annulation;
};

/** Cycle et coordination d'un espace (ST-US-031 §6.5 n° 2, 3). */
type Synchronisation = {
  readonly cycle: CycleSynchronisation;
  readonly coordination: CoordinationOnglets;
};

/** Ce qu'il faut au cycle d'un espace, connu une fois la session et l'accès Google assemblés. */
type FabriqueCycle = {
  creer?: (depot: DepotLocalDexie, nomEspace: string) => Synchronisation;
};

const attenteDe = async (espace: EspaceOuvert | undefined): Promise<AttenteLocale> => {
  if (espace === undefined) return { enAttente: 0 };
  const etat = await espace.depot.lire();
  if (!etat.ok) return { enAttente: 0 };
  const plusAncienne = plusAncienneModificationEnAttente(etat.valeur.enAttente);
  const signalements = await espace.depot.lireSignalements();
  return {
    enAttente: decompterModificationsEnAttente(etat.valeur.enAttente),
    // n° 5 : instant corrigé ramené à l'heure de l'appareil avant toute comparaison à `Horloge.maintenant()`.
    ...(plusAncienne === undefined
      ? {}
      : {
          plusAncienneEnAttente: enHeureAppareil(plusAncienne, etat.valeur.correctionHorloge),
        }),
    ...(signalements.ok
      ? { aLire: compterALire(signalements.valeur.valeursEcartees, signalements.valeur.lectures) }
      : {}),
  };
};

const modificationsNonRetenuesDe = async (
  espace: EspaceOuvert | undefined,
): Promise<ModificationsNonRetenuesLues | undefined> => {
  if (espace === undefined) return undefined;
  const lu = await consulterModificationsNonRetenues(espace.depot);
  return lu.ok ? lu.valeur : undefined;
};

const elementsEnAttenteDe = async (
  espace: EspaceOuvert | undefined,
): Promise<ReadonlyArray<ElementEnAttente>> => {
  if (espace === undefined) return [];
  const etat = await espace.depot.lire();
  return etat.ok ? elementsEnAttenteDetailles(etat.valeur) : [];
};

const dernierContactDe = async (espace: EspaceOuvert | undefined): Promise<Instant | undefined> => {
  if (espace === undefined) return undefined;
  const meta = await espace.depot.lireMeta();
  return meta.ok ? meta.valeur.dernierContactDrive : undefined;
};

const correctionHorlogeDe = async (
  espace: EspaceOuvert | undefined,
): Promise<EcartTemps | undefined> => {
  if (espace === undefined) return undefined;
  const etat = await espace.depot.lire();
  return etat.ok ? etat.valeur.correctionHorloge : undefined;
};

const marquerCommeLueDans = async (
  espace: EspaceOuvert | undefined,
  horloge: Horloge,
  ids: ReadonlyArray<IdValeurEcartee>,
): Promise<Resultat<undefined, ErreurDepotLocal>> =>
  espace === undefined
    ? succes(undefined)
    : new MarquerCommeLue({ depot: espace.depot, horloge }).executer(ids);

const SANS_ESPACE = echec<ErreurChoixRestauration>({ type: 'AucuneAlteration' });

const choixRestaurationDe = async (
  espace: EspaceOuvert | undefined,
): Promise<ChoixRestaurationLu | undefined> => {
  if (espace === undefined) return undefined;
  const etat = await espace.depot.lire();
  const meta = await espace.depot.lireMeta();
  if (!etat.ok || !meta.ok) return undefined;
  return {
    restaurationDemandee: meta.valeur.restaurationDemandee === true,
    copie: resumerCopieLocale(etat.valeur),
  };
};

const restaurationFaiteIciDe = async (
  espace: EspaceOuvert | undefined,
): Promise<Hlc | undefined> => {
  if (espace === undefined) return undefined;
  const etat = await espace.depot.lire();
  const meta = await espace.depot.lireMeta();
  if (!etat.ok || !meta.ok) return undefined;
  const connue = meta.valeur.restaurationConnue;
  return connue?.appareil === etat.valeur.appareilId ? connue : undefined;
};

const URL_GOOGLE_DRIVE = 'https://drive.google.com/';

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

/** Arrête le suivi d'horloge et la coordination (main rendue, cycle arrêté) de l'espace, puis ferme sa connexion. */
const fermerEspace = (espace: EspaceOuvert | undefined): void => {
  espace?.suivi.arreter();
  espace?.desabonnerSuivi();
  espace?.coordination.arreter();
  espace?.depot.fermer();
};

/**
 * Ouverture (ST-US-017 §6.4, v0.11 §6.8 n° 3 ; ST-US-031 §6.5 n° 4) : suivi d'horloge, puis candidature au rôle de
 * meneur ; les déclencheurs et le cycle d'ouverture viennent de la coordination, quand cet onglet devient meneur.
 */
const demarrerEspace = ({ coordination, suivi }: EspaceOuvert): void => {
  suivi.demarrer();
  coordination.demarrer();
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
      demarrerEspace(espace);
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
  const creer = fabriqueCycle.creer;
  if (creer === undefined) throw new ErreurProgrammation('Cycle non assemblé');
  const ouvert = await DepotLocalDexie.ouvrirEspace({
    nomBase,
    ...avecFabrique(a),
    generateur: a.generateur,
    surFermetureImposee: a.surFermetureImposee,
  });
  if (!ouvert.ok) return undefined;
  return assemblerEspace(a, ouvert.valeur, creer(ouvert.valeur, nomBase));
};

/**
 * Dépôt, service d'écriture (consultation seule comprise), cycle, coordination et suivi d'horloge d'un espace
 * (ST-US-017 §6.8 n° 9, 16 ; ST-US-031 §6.5 n° 3).
 */
const assemblerEspace = (
  a: AdaptateursApplication,
  depot: DepotLocalDexie,
  { cycle, coordination }: Synchronisation,
): EspaceOuvert => {
  const suivi = new SuiviHorloge({
    depot,
    horloge: a.horloge,
    planificateur: a.planificateur,
    journal: a.journal,
  });
  const transactionnel = new ServiceEtatLocalTransactionnel({
    depot,
    horloge: a.horloge,
    generateur: a.generateur,
  });
  return {
    depot,
    // n° 9 : saisie bloquée tant que le cycle constate un format plus récent (RG-058).
    service: new ServiceEtatLocalConsultationSeule({
      service: transactionnel,
      estConsultationSeule: () => cycle.etatMoteur().actionRequise === 'FORMAT_PLUS_RECENT',
    }),
    cycle,
    coordination,
    suivi,
    desabonnerSuivi: a.echangesGoogle.observer(suivi),
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
  /** Abonnés de `observerSynchronisation`, alimentés par le cycle et le dépôt de chaque espace (ANO-001). */
  readonly relais: Set<() => void>;
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

/** Section « À lire » d'ECR-011 (ST-US-017 v0.5 §3.4, I2-21) : lecture du détail et « Compris ». */
const assemblerNonRetenues = (a: AdaptateursApplication, n: Noyau) => ({
  lireModificationsNonRetenues: () => modificationsNonRetenuesDe(n.espace()),
  marquerCommeLue: (ids: ReadonlyArray<IdValeurEcartee>) =>
    marquerCommeLueDans(n.espace(), a.horloge, ids),
});

/** Geste sur l'espace ouvert ; `sansEspace` est son issue quand aucun espace n'est ouvert. */
const surEspace =
  <T>(n: Noyau, sansEspace: T, geste: (espace: EspaceOuvert) => Promise<T>): (() => Promise<T>) =>
  async () => {
    const espace = n.espace();
    return espace === undefined ? sansEspace : geste(espace);
  };

/** Choix de restauration d'`ERR-012` (ST-US-017 v0.10 §6.7 n° 9, 11, 17) : un cas d'usage par geste, sur l'espace ouvert. */
const assemblerRestauration = (a: AdaptateursApplication, n: Noyau) => {
  const dependances = (espace: EspaceOuvert) => ({
    depot: espace.depot,
    cycle: espace.cycle,
    reseau: a.reseau,
  });
  return {
    lireChoixRestauration: () => choixRestaurationDe(n.espace()),
    lireRestaurationFaiteIci: () => restaurationFaiteIciDe(n.espace()),
    demanderRestauration: surEspace(n, SANS_ESPACE, (e) =>
      new DemanderRestauration(dependances(e)).executer(),
    ),
    annulerRestauration: surEspace(n, succes(undefined), (e) =>
      new AnnulerRestauration(dependances(e)).executer(),
    ),
    evaluerRepartirDeZero: surEspace(n, SANS_ESPACE, (e) =>
      new RepartirDeZero(dependances(e)).evaluer(),
    ),
    repartirDeZero: surEspace(n, SANS_ESPACE, (e) => new RepartirDeZero(dependances(e)).executer()),
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
    lireElementsEnAttente: () => elementsEnAttenteDe(n.espace()),
    lireDernierContact: () => dernierContactDe(n.espace()),
    ...assemblerNonRetenues(a, n),
    ...assemblerRestauration(a, n),
    synchroniserMaintenant: async () => {
      await n.espace()?.cycle.synchroniserMaintenant();
    },
    observerSynchronisation: (rappel: () => void): Annulation => {
      n.relais.add(rappel);
      return () => {
        n.relais.delete(rappel);
      };
    },
    ouvrirGoogleDrive: () => {
      a.ouvrirOnglet(URL_GOOGLE_DRIVE);
    },
  };
};

/** Correction d'horloge et « Mettre à jour » (ST-US-017 v0.11 §6.8 n° 3, 4, 10) sur l'espace ouvert. */
const assemblerHorlogeEtMiseAJour = (a: AdaptateursApplication, n: Noyau) => ({
  lireCorrectionHorloge: () => correctionHorlogeDe(n.espace()),
  mettreAJour: () => a.miseAJour.mettreAJour(),
  controlerHorloge: async (): Promise<void> => {
    await n.espace()?.suivi.controlerSaut();
  },
});

/**
 * ST-US-031 §6.5 n° 2, 3 : cycle sous l'exclusion du verrou « cycle » de l'espace et coordination de l'onglet. ANO-001
 * (ST-US-017 §6.9) : le cycle, la coordination et le dépôt de chaque espace alimentent le relais de
 * `observerSynchronisation`.
 */
const fabriquerSynchronisations =
  (
    a: AdaptateursApplication,
    transport: TransportSynchro,
    acces: AccesGoogle,
    relais: ReadonlySet<() => void>,
  ): NonNullable<FabriqueCycle['creer']> =>
  (depot, nomEspace) => {
    const exclusion = exclusionParVerrou(a.verrou, nomVerrouCycle(nomEspace));
    const cycle = new CycleSynchronisation({ ...a, depot, transport, acces, exclusion });
    const coordination = new CoordinationOnglets({
      verrou: a.verrou,
      cycle,
      acces,
      nomEspace,
      journal: a.journal,
    });
    const notifier = (): void => {
      relais.forEach((rappel) => {
        rappel();
      });
    };
    cycle.observer(notifier);
    coordination.observer(notifier);
    depot.observer(notifier);
    return { cycle, coordination };
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
  const relais = new Set<() => void>();
  fabriqueCycle.creer = fabriquerSynchronisations(a, transport, accesGoogle, relais);
  return {
    ...stockage,
    ...{ session, coffre, fournisseur, transport, signalerRefus, accesGoogle },
    depot: depotAvantSortie(a, stockage.espace, () => accesGoogle),
    relais,
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
      const { generateur, horloge, planificateur } = a;
      memorise = {
        service: ouvert.service,
        objectifs: assemblerObjectifsTaches({
          service: ouvert.service,
          generateur,
          horloge,
          planificateur,
          observer: (rappel) => ouvert.depot.observer(rappel),
        }),
      };
    }
    return memorise.objectifs;
  };
};

/**
 * ST-US-018 v0.4 §4.2 : une seule `DemanderPersistance` par application (appels concurrents partagés), sans espace
 * requis ; le drapeau « déjà demandée » vit dans la base technique, hors espace de compte.
 */
const etatPersistanceDe = (
  a: AdaptateursApplication,
  base: BaseTechnique,
): Application['etatPersistance'] => {
  const demande = new DemanderPersistance({
    persistance: a.persistance,
    memoire: new MemoireDemandePersistanceDexie(base),
  });
  return () => demande.executer();
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
    ...assemblerHorlogeEtMiseAJour(a, noyau),
    etatPersistance: etatPersistanceDe(a, stockage.base),
    journal: a.journal,
    objectifs: objectifsDe(a, stockage.espace),
    arreter: () => {
      fermerEspace(stockage.espace());
      stockage.base.fermer();
    },
    arreterCoordination: () => {
      stockage.espace()?.coordination.arreter();
    },
    lireCoordination: async () => stockage.espace()?.coordination.etat(),
  };
};
