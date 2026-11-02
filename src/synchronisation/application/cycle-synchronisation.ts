import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { Annulation, Planificateur } from '../../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../../commun/application/ports/source-aleatoire';
import { assertNever } from '../../commun/domaine/assert-never';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import { Instant } from '../../commun/domaine/temps/instant';
import { delaiAvantTentative, TENTATIVES_AVANT_ABANDON } from '../../infrastructure-google';
import type { ContenuFichierAppareil, ContenuManifeste } from '../domaine/contenu-fichier';
import {
  controlerDrive,
  GENERATION_INITIALE,
  hlcPlancherDesChoix,
  restaurationConnueApres,
  situationDe,
  type DecisionControle,
  type GenerationNouvelle,
  type LectureDrive,
  type ObservationDrive,
} from '../domaine/controle-drive';
import { contenuAEnvoyer, doitDeposer, retirerDeposees } from '../domaine/depot';
import { planReinitialisation, valeursDonneesEffacees } from '../domaine/donnees-effacees';
import { ETAT_LOCAL_VIDE, type EtatLocal } from '../domaine/etat-local';
import { comparerHlc, hlcSuivant, type Hlc } from '../domaine/hlc';
import type { IdEvenement } from '../domaine/identifiant-evenement';
import { fusionnerManifestes } from '../domaine/manifeste';
import type { IdFichierDrive, MetaSynchronisation } from '../domaine/meta-synchronisation';
import {
  PERIODE_SYNCHRONISATION_PREMIER_PLAN,
  TEMPORISATION_DEPOT,
} from '../domaine/parametres-synchronisation';
import { PLAN_VIDE, type PlanEcriture } from '../domaine/planifier-ecritures';
import { planifierSynchronisation } from '../domaine/planifier-synchronisation';
import type { Signalements } from '../domaine/signalements';
import { SCHEMA_VERSION } from '../domaine/version-schema';
import { ecrireManifesteMonotone, type ModeEcritureManifeste } from './ecriture-manifeste';
import type { AccesGoogle, EtatAccesGoogle } from './ports/acces-google';
import type { DepotLocal, ErreurDepotLocal } from './ports/depot-local';
import type { EtatMoteur, SuiviCycle } from './ports/suivi-cycle';
import type {
  Changements,
  ErreurTransport,
  FichierAppareilDistant,
  FichierDepose,
  InventaireDossier,
  TransportSynchro,
} from './ports/transport-synchro';

// DAT §4.3 ; ST-US-017 §6.2 à §6.4.
export type IssueCycle =
  | 'TERMINE'
  | 'NON_LANCE_HORS_LIGNE'
  | 'NON_LANCE_SANS_ACCES'
  | 'DEJA_EN_COURS'
  | 'ACCES_REFUSE'
  | 'DRIVE_PLEIN'
  | 'ECHEC_TRANSITOIRE'
  /** Incrément 3 (ST-US-017 v0.10 §6.7 n° 12) : `ERR-012`, rien n'est écrit dans le Drive. */
  | 'DONNEES_ALTEREES'
  /** Contrôle 2 (RG-058) : aucune écriture, aucun effacement (incrément 4 : consultation seule). */
  | 'FORMAT_PLUS_RECENT';

export type DependancesCycle = {
  readonly depot: DepotLocal;
  readonly transport: TransportSynchro;
  readonly acces: AccesGoogle;
  readonly reseau: EtatReseau;
  readonly planificateur: Planificateur;
  readonly aleatoire: SourceAleatoire;
  readonly horloge: Horloge;
  readonly journal: JournalTechnique;
  readonly versionApplication: string;
};

type ErreurCycle = ErreurTransport | ErreurDepotLocal;
type Etape<T = undefined> = Promise<Resultat<T, ErreurCycle>>;
/** Issue d'une exécution menée à son terme sans erreur (ST-US-017 v0.10 §6.7 n° 12). */
type Fin = 'TERMINE' | 'DONNEES_ALTEREES' | 'FORMAT_PLUS_RECENT';
/** Lectures du début d'un cycle ou d'un dépôt ; les signalements sont lus après l'état (§6.2, condition (1)). */
type Lu = {
  readonly etat: EtatLocal;
  readonly meta: MetaSynchronisation;
  readonly signalements: Signalements;
};

/** Ce que le cycle a vu du Drive avant toute écriture (§6.7 n° 2, n° 12). */
type Vue = {
  readonly lu: Lu;
  /** Dossier courant : mémorisé s'il est présent, sinon le canonique (bascule) ; undefined : aucun dossier. */
  readonly dossier: IdFichierDrive | undefined;
  /** Dossier canonique (le plus ancien) ; undefined : aucun dossier. */
  readonly canonique: IdFichierDrive | undefined;
  readonly inventaire: InventaireDossier;
  readonly observation: ObservationDrive;
  /** Version d'inventaire du fichier propre relu (n° 5) ; undefined s'il n'a pas été relu. */
  readonly versionRelue: string | undefined;
  /** Jeton des changements à mémoriser après les fusions ; undefined sans dossier. */
  readonly jeton: string | undefined;
};

type Restaurer = Extract<DecisionControle, { readonly type: 'RESTAURER' }>;
type Synchroniser = Extract<DecisionControle, { readonly type: 'SYNCHRONISER' }>;
type NouvelleGeneration = Extract<DecisionControle, { readonly type: 'NOUVELLE_GENERATION' }>;

const INVENTAIRE_VIDE: InventaireDossier = { manifestes: [], fichiers: [] };

/** Aucun dossier « Done Juan » (n° 2) : rien n'est cherché. */
const OBSERVATION_SANS_DOSSIER: ObservationDrive = {
  dossierPresent: false,
  manifestes: [],
  fichierPropre: { type: 'ABSENT' },
  autres: [],
  autresPresents: false,
  orphelins: [],
};

/** Erreurs d'un manifeste qui le font ignorer par le dépôt seul (`deposerMaintenant`, incrément 1). */
const estIgnorable = (erreur: ErreurCycle): boolean =>
  erreur.type === 'FichierIllisible' ||
  erreur.type === 'FormatPlusRecent' ||
  erreur.type === 'RessourceIntrouvable';

/**
 * Lecture d'un fichier vue par le domaine (n° 2) : `FichierIllisible` → `ILLISIBLE`, `FormatPlusRecent` →
 * `FORMAT_PLUS_RECENT`, `RessourceIntrouvable` → undefined (omis) ; toute autre erreur est une erreur du cycle (§6.3,
 * reprises), jamais une altération (S23).
 */
const lectureDe = <T>(
  lu: Resultat<T, ErreurTransport>,
): Resultat<LectureDrive<T> | undefined, ErreurTransport> => {
  if (lu.ok) return succes({ type: 'LU', contenu: lu.valeur });
  switch (lu.erreur.type) {
    case 'FichierIllisible':
      return succes({ type: 'ILLISIBLE' });
    case 'FormatPlusRecent':
      return succes({ type: 'FORMAT_PLUS_RECENT', schemaVersion: lu.erreur.schemaVersion });
    case 'RessourceIntrouvable':
      return succes(undefined);
    default:
      return echec(lu.erreur);
  }
};

/** Plan du dépôt confirmé : entrées de l'index dont la dernière écriture est déposée (≤ x), retirées. */
const planRetrait = (etat: EtatLocal, x: Hlc | undefined): PlanEcriture => {
  if (x === undefined) return PLAN_VIDE(etat);
  const enAttente = retirerDeposees(etat.enAttente, x);
  return {
    ...PLAN_VIDE(etat),
    etatApres: { ...etat, enAttente },
    enAttenteRetirees: [...etat.enAttente.keys()].filter((cle) => !enAttente.has(cle)),
  };
};

/** Instant physique corrigé de l'écart mesuré avec Google (§6.3, `physique(e)`). */
const physique = (horloge: Horloge, etat: EtatLocal): Instant =>
  Instant.decaler(horloge.maintenant(), etat.correctionHorloge);

/**
 * HLC d'un choix (n° 9, n° 11 c ; condition C3) : `hlcSuivant(max(dernierHlc, plancher), physique, appareil)`, au-dessus
 * du dernier HLC de l'appareil et des HLC de génération et de restauration vus.
 */
const hlcDuChoix = (etat: EtatLocal, plancher: Hlc | undefined, maintenant: Instant): Hlc => {
  const dernier = etat.dernierHlc;
  const base =
    plancher === undefined || (dernier !== undefined && comparerHlc(dernier, plancher) >= 0)
      ? dernier
      : plancher;
  return hlcSuivant(base, maintenant, etat.appareilId);
};

const generationDe = (meta: MetaSynchronisation) => meta.generation ?? GENERATION_INITIALE;

/** Clés de méta présentes seulement si leur valeur est définie (méta fusionnée ou remplacée clé à clé). */
const definies = (meta: {
  readonly [K in keyof MetaSynchronisation]?: MetaSynchronisation[K] | undefined;
}): Partial<MetaSynchronisation> =>
  Object.fromEntries(
    Object.entries(meta).filter(([, valeur]) => valeur !== undefined),
  ) as Partial<MetaSynchronisation>;

/** Version d'un dépôt confirmé à mémoriser (n° 5 : seulement si elle est définie). */
const versionDe = (depose: FichierDepose): Partial<MetaSynchronisation> =>
  depose.version === undefined ? {} : { versionFichierPropre: depose.version };

/**
 * Cycle de synchronisation d'un espace (ST-US-017 §6.3, v0.10.1 §6.7 n° 12) : observation du Drive, contrôles
 * (`controlerDrive`), puis la décision : fusion, manifeste, dépôt du fichier propre, déménagement, orphelins ; ou
 * restauration ; ou adoption d'une génération ; ou rien (altération, format plus récent). Jamais deux cycles à la fois :
 * une demande pendant un cycle le fait relancer une fois à sa fin. Seul point d'écriture dans le Drive.
 */
export class CycleSynchronisation implements SuiviCycle {
  #enCours: Promise<IssueCycle> | undefined;
  #aRefaire = false;
  #cycle: EtatMoteur['cycle'] = 'REPOS';
  #actionRequise: EtatMoteur['actionRequise'];
  #tentatives = 0;
  #reprise: Annulation | undefined;
  #temporisation: Annulation | undefined;
  #periodique: Annulation | undefined;
  #declencheurs: ReadonlyArray<Annulation> | undefined;
  #premierPlan = true;
  readonly #observateurs = new Set<() => void>();

  constructor(private readonly dependances: DependancesCycle) {}

  /** Installe les déclencheurs (§6.4) ; idempotent. */
  demarrer(): void {
    if (this.#declencheurs !== undefined) return;
    const { depot, reseau, acces } = this.dependances;
    let accesPrecedent: EtatAccesGoogle = acces.etat();
    this.#declencheurs = [
      depot.observer(() => {
        this.#armerTemporisation();
      }),
      reseau.surChangement((connecte) => {
        if (connecte) this.#declencher();
      }),
      acces.observer((etat) => {
        const avant = accesPrecedent;
        accesPrecedent = etat;
        if (etat === 'VALIDE' && avant !== 'VALIDE') this.#declencher();
      }),
    ];
    this.#installerPeriodique();
  }

  /** Retire tous les déclencheurs et les échéances programmées (temporisation, reprise, période). */
  arreter(): void {
    this.#declencheurs?.forEach((annuler) => {
      annuler();
    });
    this.#declencheurs = undefined;
    [this.#periodique, this.#temporisation, this.#reprise].forEach((annuler) => annuler?.());
    this.#periodique = undefined;
    this.#temporisation = undefined;
    this.#reprise = undefined;
  }

  /**
   * Page visible ou masquée (composition, `visibilitychange`) : le cycle toutes les 2 min n'a lieu qu'au premier
   * plan (DAT §4.3) ; le retour au premier plan est lui-même un déclencheur.
   */
  definirPremierPlan(visible: boolean): void {
    this.#premierPlan = visible;
    if (!visible) {
      this.#periodique?.();
      this.#periodique = undefined;
      return;
    }
    if (this.#declencheurs === undefined) return;
    this.#installerPeriodique();
    this.#declencher();
  }

  /** Un cycle complet : observation, contrôles, puis la décision (§6.7 n° 12). */
  synchroniserMaintenant(): Promise<IssueCycle> {
    return this.#lancer(() => this.#cycleComplet(false));
  }

  /**
   * Dépôt seul, sans lecture des autres fichiers ; attend la fin d'un cycle en cours. L'exception éventuelle de ce
   * cycle n'est pas propagée (son déclencheur la consigne) : la sortie tente son propre dépôt (RC-R3-7). Refusé sans
   * écriture tant qu'une altération ou un format plus récent est connu (§6.7 n° 12).
   */
  async deposerMaintenant(): Promise<IssueCycle> {
    while (this.#enCours !== undefined) await this.#enCours.catch(() => undefined);
    return this.#lancer(() => this.#depotSeul());
  }

  /**
   * « Repartir de zéro » confirmé (ST-US-017 v0.10.1 §6.7 n° 11 c) : attend la fin d'un cycle en cours, puis s'exécute
   * comme un cycle (mêmes gardes, mêmes notifications) : observation, HLC du choix enregistré avant toute écriture dans
   * le Drive (C3), fichier propre vide de la génération `NOUVELLE(h)` (C7), manifeste (écriture monotone, mode
   * « choix », C6), puis réinitialisation locale sans `ALR-014` et orphelins mis à la corbeille (C8).
   */
  async repartirDeZero(): Promise<IssueCycle> {
    while (this.#enCours !== undefined) await this.#enCours.catch(() => undefined);
    return this.#lancer(() => this.#repartir());
  }

  etatMoteur(): EtatMoteur {
    return {
      cycle: this.#cycle,
      ...(this.#actionRequise === undefined ? {} : { actionRequise: this.#actionRequise }),
      aLire: 0,
    };
  }

  /**
   * ANO-001 (ST-US-017 v0.4.3 §6.9) : `rappel` est appelé deux fois par exécution (`synchroniserMaintenant`,
   * `deposerMaintenant` ou `repartirDeZero` effectivement lancés) : au début (état EN_COURS), puis à la fin, relance
   * comprise, une fois l'état final établi et `cycleEnCours()` revenu à undefined, en succès, en échec ou sur exception.
   */
  observer(rappel: () => void): Annulation {
    this.#observateurs.add(rappel);
    return () => {
      this.#observateurs.delete(rappel);
    };
  }

  /** Promesse du cycle en cours, pour le banc (undefined au repos). */
  cycleEnCours(): Promise<IssueCycle> | undefined {
    return this.#enCours;
  }

  // ------------------------------------------------------------------ Déclencheurs

  #installerPeriodique(): void {
    if (!this.#premierPlan || this.#periodique !== undefined) return;
    this.#periodique = this.dependances.planificateur.periodiquement(
      PERIODE_SYNCHRONISATION_PREMIER_PLAN,
      () => {
        this.#declencher();
      },
    );
  }

  /** Modification locale : le premier changement fixe l'échéance, sans report (DAT §4.3). */
  #armerTemporisation(): void {
    if (this.#temporisation !== undefined) return;
    this.#temporisation = this.dependances.planificateur.apres(TEMPORISATION_DEPOT, () => {
      this.#temporisation = undefined;
      this.#declencher();
    });
  }

  #declencher(): void {
    this.synchroniserMaintenant().catch((erreur: unknown) => {
      this.dependances.journal.consigner({
        niveau: 'erreur',
        evenement: 'SynchronisationInterrompue',
        champs: { erreur: erreur instanceof Error ? erreur.name : 'inconnue' },
      });
    });
  }

  // ------------------------------------------------------------------ Exécution

  #garde(): IssueCycle | undefined {
    if (!this.dependances.reseau.estConnecte()) return 'NON_LANCE_HORS_LIGNE';
    if (this.dependances.acces.etat() !== 'VALIDE') return 'NON_LANCE_SANS_ACCES';
    return undefined;
  }

  #lancer(executer: () => Etape<Fin>): Promise<IssueCycle> {
    if (this.#enCours !== undefined) {
      this.#aRefaire = true;
      return Promise.resolve('DEJA_EN_COURS');
    }
    const garde = this.#garde();
    if (garde !== undefined) return Promise.resolve(garde);
    const enCours = this.#executer(executer);
    this.#enCours = enCours;
    this.#notifier();
    return enCours;
  }

  #notifier(): void {
    this.#observateurs.forEach((rappel) => {
      rappel();
    });
  }

  async #executer(executer: () => Etape<Fin>): Promise<IssueCycle> {
    try {
      const issue = await this.#unCycle(executer);
      const relancer = this.#aRefaire && issue === 'TERMINE' && this.#garde() === undefined;
      return relancer ? await this.#unCycle(() => this.#cycleComplet(false)) : issue;
    } catch (erreur) {
      this.#cycle = 'REPOS';
      throw erreur;
    } finally {
      this.#enCours = undefined;
      this.#aRefaire = false;
      this.#notifier();
    }
  }

  async #unCycle(executer: () => Etape<Fin>): Promise<IssueCycle> {
    this.#aRefaire = false;
    this.#reprise?.();
    this.#reprise = undefined;
    this.#cycle = 'EN_COURS';
    const resultat = await executer();
    if (!resultat.ok) return this.#echec(resultat.erreur);
    switch (resultat.valeur) {
      case 'TERMINE':
        return this.#reussite();
      case 'DONNEES_ALTEREES':
        return this.#arret('DONNEES_ABSENTES', 'DONNEES_ALTEREES');
      case 'FORMAT_PLUS_RECENT':
        return this.#arret('FORMAT_PLUS_RECENT', 'FORMAT_PLUS_RECENT');
      default:
        return assertNever(resultat.valeur);
    }
  }

  #reussite(): IssueCycle {
    this.#tentatives = 0;
    this.#actionRequise = undefined;
    this.#cycle = 'REPOS';
    return 'TERMINE';
  }

  /** Altération ou format plus récent (n° 12) : action requise, rien d'écrit, aucune reprise programmée. */
  #arret(
    action: 'DONNEES_ABSENTES' | 'FORMAT_PLUS_RECENT',
    issue: 'DONNEES_ALTEREES' | 'FORMAT_PLUS_RECENT',
  ): IssueCycle {
    this.#tentatives = 0;
    this.#actionRequise = action;
    this.#cycle = 'REPOS';
    return issue;
  }

  /** Toute décision autre qu'une altération ou un format plus récent efface l'action correspondante (n° 12). */
  #effacerArret(): void {
    if (
      this.#actionRequise === 'DONNEES_ABSENTES' ||
      this.#actionRequise === 'FORMAT_PLUS_RECENT'
    ) {
      this.#actionRequise = undefined;
    }
  }

  /** Erreurs qui demandent une action ou une reprise ; les autres terminent le cycle en échec transitoire. */
  async #echec(erreur: ErreurCycle): Promise<IssueCycle> {
    this.#cycle = 'REPOS';
    if (erreur.type === 'NonAutorise') {
      await this.dependances.acces.signalerRefus();
      return 'ACCES_REFUSE';
    }
    if (erreur.type === 'EspaceDrivePlein') {
      this.#actionRequise = 'DRIVE_PLEIN';
      return 'DRIVE_PLEIN';
    }
    if (erreur.type === 'ServeurIndisponible') return this.#programmerReprise();
    if (erreur.type === 'DriveIndisponible') this.#actionRequise = 'ECHEC_PERSISTANT';
    if (erreur.type !== 'ReseauIndisponible') this.#consigner('SynchronisationEchec', erreur.type);
    return 'ECHEC_TRANSITOIRE';
  }

  /** 5xx, 429 : nouvelle tentative programmée ; action requise à partir de la 3e (DAT §4.3). */
  #programmerReprise(): IssueCycle {
    const { planificateur, aleatoire } = this.dependances;
    this.#tentatives += 1;
    if (this.#tentatives >= TENTATIVES_AVANT_ABANDON) this.#actionRequise = 'ECHEC_PERSISTANT';
    this.#cycle = 'RETENTATIVE';
    const gigue = aleatoire.entierEntre(0, 999) / 1000;
    this.#reprise = planificateur.apres(delaiAvantTentative(this.#tentatives, gigue), () => {
      this.#reprise = undefined;
      this.#declencher();
    });
    return 'ECHEC_TRANSITOIRE';
  }

  #consigner(evenement: string, cause: string): void {
    this.dependances.journal.consigner({ niveau: 'avertissement', evenement, champs: { cause } });
  }

  // ------------------------------------------------------------------ Cycle complet (§6.7 n° 12)

  /** `relance` : exécution relancée après l'adoption d'une génération (n° 11 a, une seule fois). */
  async #cycleComplet(relance: boolean): Etape<Fin> {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const vue = await this.#observer(lu.valeur);
    if (!vue.ok) return vue;
    const decision = controlerDrive(vue.valeur.observation, situationDe(lu.valeur.meta));
    if (decision.type !== 'ALTERATION' && decision.type !== 'FORMAT_PLUS_RECENT') {
      this.#effacerArret();
    }
    switch (decision.type) {
      case 'FORMAT_PLUS_RECENT':
        return succes('FORMAT_PLUS_RECENT');
      case 'ALTERATION':
        // Rien n'est écrit ni dans le Drive ni dans la méta, rien n'est fusionné (n° 12).
        return succes('DONNEES_ALTEREES');
      case 'NOUVELLE_GENERATION':
        return this.#adopter(vue.valeur, decision, relance);
      case 'RESTAURER':
        return this.#restaurer(vue.valeur, decision);
      case 'SYNCHRONISER':
        return this.#synchroniser(vue.valeur, decision);
      default:
        return assertNever(decision);
    }
  }

  /**
   * État, puis méta, puis signalements, dans cet ordre (§6.2, v0.7) : lus avant l'état, une lecture « Compris » écrite
   * entre les deux serait couverte par `deposeJusquA` sans figurer dans le fichier déposé (UT-US-017-110).
   */
  async #lire(): Etape<Lu> {
    const { depot } = this.dependances;
    const etat = await depot.lire();
    if (!etat.ok) return etat;
    const meta = await depot.lireMeta();
    if (!meta.ok) return meta;
    const signalements = await depot.lireSignalements();
    if (!signalements.ok) return signalements;
    return succes({ etat: etat.valeur, meta: meta.valeur, signalements: signalements.valeur });
  }

  /**
   * Observation (n° 2, n° 12), avant toute écriture dans le Drive : dossier mémorisé (première connexion :
   * `preparerDossier`), `listerDossiers` (aucun : `dossierPresent` faux ; mémorisé absent : bascule vers le canonique,
   * inventaire complet), `inventorierDossier`, changements, puis lectures : manifestes, fichier propre (non relu si sa
   * version est celle du dernier dépôt, C4), orphelins (C8), fichiers des autres appareils.
   */
  async #observer(lu: Lu): Etape<Vue> {
    const { transport } = this.dependances;
    const { meta, etat } = lu;
    // Première connexion (§6.3, inchangé) : dossier préparé et mémorisé avant l'observation.
    const prepare = await this.#dossier(meta);
    if (!prepare.ok) return prepare;
    const memorise = prepare.valeur;
    const dossiers = await transport.listerDossiers();
    if (!dossiers.ok) return dossiers;
    const canonique = dossiers.valeur[0]?.id;
    if (canonique === undefined) {
      return succes({
        lu,
        dossier: undefined,
        canonique: undefined,
        inventaire: INVENTAIRE_VIDE,
        observation: OBSERVATION_SANS_DOSSIER,
        versionRelue: undefined,
        jeton: undefined,
      });
    }
    const bascule = !dossiers.valeur.some((d) => d.id === memorise);
    const dossier = bascule ? canonique : memorise;
    const inventaire = await transport.inventorierDossier(dossier);
    if (!inventaire.ok) return inventaire;
    const complet = bascule || meta.inventaireAFaire === true;
    const changements = await this.#changements(dossier, complet ? undefined : meta.pageToken);
    if (!changements.ok) return changements;
    const manifestes = await this.#lireTous(inventaire.valeur.manifestes, (id) =>
      transport.lireContenuManifeste(id),
    );
    if (!manifestes.ok) return manifestes;
    const propre = await this.#lireFichierPropre(inventaire.valeur.fichiers, meta);
    if (!propre.ok) return propre;
    const orphelins = await this.#lireTous(
      inventaire.valeur.fichiers.filter(
        (f) => f.appareil === etat.appareilId && f.id !== meta.fichierPropre,
      ),
      (id) => transport.lireFichierAppareil(id),
    );
    if (!orphelins.ok) return orphelins;
    const autres = await this.#lireTous(
      changements.valeur.fichiers.filter((f) => f.appareil !== etat.appareilId),
      (id) => transport.lireFichierAppareil(id),
      'FichierAppareilIgnore',
    );
    if (!autres.ok) return autres;
    return succes({
      lu,
      dossier,
      canonique,
      inventaire: inventaire.valeur,
      observation: {
        dossierPresent: true,
        manifestes: manifestes.valeur,
        fichierPropre: propre.valeur.lecture,
        autres: autres.valeur,
        autresPresents: inventaire.valeur.fichiers.some((f) => f.appareil !== etat.appareilId),
        orphelins: orphelins.valeur,
      },
      versionRelue: propre.valeur.version,
      jeton: changements.valeur.jeton,
    });
  }

  /** Dossier où écrire : le dossier courant, sinon un dossier préparé (n° 9 (3), n° 11 b et c). */
  async #dossierOuPrepare(vue: Vue): Etape<IdFichierDrive> {
    if (vue.dossier !== undefined) return succes(vue.dossier);
    return this.dependances.transport.preparerDossier();
  }

  /** Changements depuis le jeton ; sans jeton, ou jeton refusé, inventaire complet (DAT v0.11.4 §4.3). */
  async #changements(dossier: IdFichierDrive, jeton: string | undefined): Etape<Changements> {
    const { transport } = this.dependances;
    if (jeton !== undefined) {
      const changements = await transport.changements(dossier, jeton);
      if (changements.ok || changements.erreur.type !== 'JetonChangementsInvalide') {
        return changements;
      }
      this.dependances.journal.consigner({ niveau: 'info', evenement: 'JetonChangementsOublie' });
    }
    return transport.listerFichiersAppareils(dossier);
  }

  /** Lit chaque fichier, dans l'ordre ; un fichier introuvable est omis (et journalisé si `introuvable` est donné). */
  async #lireTous<T>(
    elements: ReadonlyArray<{ readonly id: IdFichierDrive }>,
    lire: (id: IdFichierDrive) => Promise<Resultat<T, ErreurTransport>>,
    introuvable?: string,
  ): Etape<ReadonlyArray<{ readonly id: IdFichierDrive; readonly lecture: LectureDrive<T> }>> {
    const lus: Array<{ readonly id: IdFichierDrive; readonly lecture: LectureDrive<T> }> = [];
    for (const { id } of elements) {
      const lecture = lectureDe(await lire(id));
      if (!lecture.ok) return lecture;
      if (lecture.valeur !== undefined) lus.push({ id, lecture: lecture.valeur });
      else if (introuvable !== undefined) this.#consigner(introuvable, 'RessourceIntrouvable');
    }
    return succes(lus);
  }

  /** Fichier propre (n° 2) : non attendu ou absent → `ABSENT` ; version égale (`===`, C4) → `INCHANGE` ; sinon relu. */
  async #lireFichierPropre(
    fichiers: ReadonlyArray<FichierAppareilDistant>,
    meta: MetaSynchronisation,
  ): Etape<{ readonly lecture: ObservationDrive['fichierPropre']; readonly version?: string }> {
    const present = fichiers.find((f) => f.id === meta.fichierPropre);
    if (present === undefined) return succes({ lecture: { type: 'ABSENT' } });
    if (present.version !== undefined && present.version === meta.versionFichierPropre) {
      return succes({ lecture: { type: 'INCHANGE' } });
    }
    const lu = lectureDe(await this.dependances.transport.lireFichierAppareil(present.id));
    if (!lu.ok) return lu;
    return succes({
      lecture: lu.valeur ?? { type: 'ABSENT' },
      ...(present.version === undefined ? {} : { version: present.version }),
    });
  }

  // ------------------------------------------------------------------ Décisions

  /**
   * `SYNCHRONISER` (n° 5 à 7, n° 12) : fusions, jeton, restauration connue (C1), demande abandonnée, version relue,
   * manifeste (écriture monotone si `manifesteAEcrire`, sinon canonique mémorisé), dépôt (forcé si `depotForce`),
   * déménagement (n° 14), orphelins (C8).
   */
  async #synchroniser(vue: Vue, d: Synchroniser): Etape<Fin> {
    const { meta } = vue.lu;
    const dossier = await this.#dossierOuPrepare(vue);
    if (!dossier.ok) return dossier;
    const fusion = await this.#fusionner(d.fusion, vue);
    if (!fusion.ok) return fusion;
    const releve = definies({
      ...this.#metaObservee(vue, dossier.valeur),
      restaurationConnue: this.#siChange(
        meta.restaurationConnue,
        restaurationConnueApres(meta.restaurationConnue, d.restaurationVue),
      ),
      restaurationDemandee: d.abandonnerDemande ? false : undefined,
      versionFichierPropre:
        vue.observation.fichierPropre.type === 'LU' && !d.depotForce ? vue.versionRelue : undefined,
    });
    const memorise = await this.#memoriser(releve);
    if (!memorise.ok) return memorise;
    const manifeste =
      d.manifesteAEcrire === undefined
        ? succes(vue.inventaire.manifestes[0]?.id)
        : await this.#ecrireManifeste(dossier.valeur, d.manifesteAEcrire, 'ORDINAIRE');
    if (!manifeste.ok) return manifeste;
    const canonique = await this.#memoriser(
      definies({ manifeste: this.#siChange(meta.manifeste, manifeste.valeur) }),
    );
    if (!canonique.ok) return canonique;
    // Sans fusion écrite, la lecture du début suffit au dépôt : une écriture locale faite depuis a un HLC plus
    // grand que `deposeJusquA` et reste en attente (DAT §4.1.5 bis).
    const depose = await this.#deposer(
      dossier.valeur,
      { force: d.depotForce, fichierExistant: meta.fichierPropre },
      fusion.valeur ? undefined : vue.lu,
    );
    if (!depose.ok) return depose;
    if (vue.canonique !== undefined && dossier.valeur !== vue.canonique) {
      const demenage = await this.#demenager(vue, dossier.valeur, vue.canonique);
      if (!demenage.ok) return demenage;
    }
    return this.#supprimerOrphelins(vue);
  }

  /**
   * `RESTAURER` (n° 8, n° 9) : fusions ; si demandée, HLC `h` du choix enregistré avant toute écriture (C3) ; dossier
   * préparé s'il manque ; dépôt du fichier propre, en place s'il est présent (C7), mémorisé dès sa confirmation ; puis
   * manifeste (demandée : écriture monotone, mode « choix », restauration `h`) ; méta ; orphelins.
   */
  async #restaurer(vue: Vue, d: Restaurer): Etape<Fin> {
    const { meta } = vue.lu;
    const fusion = await this.#fusionner(d.fusion, vue);
    if (!fusion.ok) return fusion;
    const h = d.motif === 'DEMANDEE' ? await this.#consommerHlc(vue) : succes(undefined);
    if (!h.ok) return h;
    const dossier = await this.#dossierOuPrepare(vue);
    if (!dossier.ok) return dossier;
    const depose = await this.#deposer(dossier.valeur, {
      force: true,
      fichierExistant: this.#fichierPropreEnPlace(vue, dossier.valeur),
      meta: {
        ...this.#metaObservee(vue, dossier.valeur),
        // Dossier recréé : ses fichiers sont tous nouveaux, le prochain cycle en fait l'inventaire complet.
        ...(vue.dossier === undefined ? { inventaireAFaire: true } : {}),
      },
    });
    if (!depose.ok) return depose;
    const restauration = h.valeur;
    if (restauration === undefined) {
      // Faite ailleurs (n° 8) : le manifeste n'est pas réécrit ; canonique et restauration connue mémorisés (C1).
      const memorise = await this.#memoriser(
        definies({
          manifeste: this.#siChange(meta.manifeste, vue.inventaire.manifestes[0]?.id),
          restaurationConnue: restaurationConnueApres(meta.restaurationConnue, d.restaurationVue),
        }),
      );
      return memorise.ok ? this.#supprimerOrphelins(vue) : memorise;
    }
    const manifeste = await this.#ecrireManifeste(
      dossier.valeur,
      { schemaVersion: SCHEMA_VERSION, generation: generationDe(meta), restauration },
      'CHOIX',
    );
    if (!manifeste.ok) return manifeste;
    const memorise = await this.#memoriser({
      manifeste: manifeste.valeur,
      restaurationDemandee: false,
      restaurationConnue: restauration,
    });
    return memorise.ok ? this.#supprimerOrphelins(vue) : memorise;
  }

  /**
   * `NOUVELLE_GENERATION(G)` (n° 11 a ; C9 : n° 11 b si G est celle de cet appareil, « Repartir de zéro » interrompu,
   * dont le manifeste est d'abord écrit, mode « choix »), puis réinitialisation locale (`ALR-014` des écritures en
   * attente ; C9 : des seules postérieures à G), puis relance immédiate d'un cycle complet (une fois).
   */
  async #adopter(vue: Vue, d: NouvelleGeneration, relance: boolean): Etape<Fin> {
    const { meta, etat } = vue.lu;
    const g = d.generation;
    const propre = g.hlc.appareil === etat.appareilId;
    const ecrit = propre ? await this.#acheverRepartir(vue, g) : succes(undefined);
    if (!ecrit.ok) return ecrit;
    const nouvelle = definies({
      dossier: ecrit.valeur?.dossier ?? vue.dossier,
      manifeste: ecrit.valeur?.manifeste ?? vue.inventaire.manifestes[0]?.id,
      dernierContactDrive: meta.dernierContactDrive,
      generation: g,
      restaurationConnue: d.restaurationVue,
    });
    const reinitialise = await this.dependances.depot.appliquerSynchronisation((e) =>
      planReinitialisation(e, {
        meta: { ...nouvelle, fusionNonDeposee: true },
        valeurs: valeursDonneesEffacees(e, g.hlc, propre ? g.hlc : undefined),
      }),
    );
    if (!reinitialise.ok) return reinitialise;
    return relance ? succes('TERMINE') : this.#cycleComplet(true);
  }

  /** n° 11 b (C9) : dossier préparé s'il manque, manifeste de G écrit (mode « choix ») avant la réinitialisation. */
  async #acheverRepartir(
    vue: Vue,
    g: GenerationNouvelle,
  ): Etape<{ readonly dossier: IdFichierDrive; readonly manifeste: IdFichierDrive }> {
    const dossier = await this.#dossierOuPrepare(vue);
    if (!dossier.ok) return dossier;
    const manifeste = await this.#ecrireManifeste(
      dossier.valeur,
      { schemaVersion: SCHEMA_VERSION, generation: g },
      'CHOIX',
    );
    return manifeste.ok
      ? succes({ dossier: dossier.valeur, manifeste: manifeste.valeur })
      : manifeste;
  }

  /**
   * « Repartir de zéro » (n° 11 c), dans cet ordre : (1) observation ; (2) HLC `h` enregistré (C3), G = NOUVELLE(h) ;
   * (3) dossier ; (4) fichier propre vide de G, en place s'il est présent (C7), non mémorisé ; (5) manifeste (mode
   * « choix », C6) ; (6) réinitialisation sans `ALR-014`, qui mémorise le fichier et G (C2 : restauration connue =
   * celle du manifeste écrit) ; (7) orphelins. Un échec avant (6) laisse l'état local intact, `dernierHlc` excepté ;
   * si le fichier de G a été déposé, le cycle suivant achève le choix (n° 11 b).
   */
  async #repartir(): Etape<Fin> {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const vue = await this.#observer(lu.valeur);
    if (!vue.ok) return vue;
    const h = await this.#consommerHlc(vue.valeur);
    if (!h.ok) return h;
    const g: GenerationNouvelle = { type: 'NOUVELLE', hlc: h.valeur };
    const dossier = await this.#dossierOuPrepare(vue.valeur);
    if (!dossier.ok) return dossier;
    const { transport, versionApplication, horloge } = this.dependances;
    const fichierExistant = this.#fichierPropreEnPlace(vue.valeur, dossier.valeur);
    const depose = await transport.deposerFichierAppareil({
      dossier: dossier.valeur,
      contenu: contenuAEnvoyer(ETAT_LOCAL_VIDE(lu.valeur.etat.appareilId), {
        versionApplication,
        generation: g,
      }),
      ...(fichierExistant === undefined ? {} : { fichierExistant }),
    });
    if (!depose.ok) return depose;
    const manifeste = await ecrireManifesteMonotone(transport, {
      dossier: dossier.valeur,
      apport: { schemaVersion: SCHEMA_VERSION, generation: g },
      mode: 'CHOIX',
    });
    if (!manifeste.ok) return manifeste;
    const meta: Partial<MetaSynchronisation> = {
      ...definies({
        dossier: dossier.valeur,
        manifeste: manifeste.valeur.id,
        generation: g,
        restaurationConnue: manifeste.valeur.contenu.restauration,
        fichierPropre: depose.valeur.id,
        deposeJusquA: h.valeur,
        dernierContactDrive: horloge.maintenant(),
      }),
      ...versionDe(depose.valeur),
      fusionNonDeposee: false,
    };
    const reinitialise = await this.dependances.depot.appliquerSynchronisation((e) =>
      planReinitialisation(e, { meta, valeurs: [], dernierHlc: h.valeur }),
    );
    if (!reinitialise.ok) return reinitialise;
    return this.#supprimerOrphelins(vue.valeur);
  }

  // ------------------------------------------------------------------ Étapes

  /**
   * Méta tirée de l'observation, mémorisée après les fusions : dossier courant (bascule, première connexion), jeton
   * (réécrit s'il a changé), `inventaireAFaire` remis à faux avec lui (n° 12).
   */
  #metaObservee(vue: Vue, dossier: IdFichierDrive): Partial<MetaSynchronisation> {
    const { meta } = vue.lu;
    return definies({
      dossier: this.#siChange(meta.dossier, dossier),
      pageToken: this.#siChange(meta.pageToken, vue.jeton),
      inventaireAFaire:
        meta.inventaireAFaire === true && vue.jeton !== undefined ? false : undefined,
    });
  }

  /** `nouvelle` si elle est définie et diffère de `ancienne` (égalité de chaînes, ou HLC par `comparerHlc`). */
  #siChange<T extends string | Hlc>(
    ancienne: T | undefined,
    nouvelle: T | undefined,
  ): T | undefined {
    if (nouvelle === undefined || ancienne === undefined) return nouvelle;
    if (typeof nouvelle === 'string' || typeof ancienne === 'string') {
      return nouvelle === ancienne ? undefined : nouvelle;
    }
    return comparerHlc(nouvelle, ancienne) === 0 ? undefined : nouvelle;
  }

  /** Fichier propre à réécrire en place (C7) : mémorisé et présent dans l'inventaire du dossier où l'on dépose. */
  #fichierPropreEnPlace(vue: Vue, dossier: IdFichierDrive): IdFichierDrive | undefined {
    const { fichierPropre } = vue.lu.meta;
    return dossier === vue.dossier && vue.inventaire.fichiers.some((f) => f.id === fichierPropre)
      ? fichierPropre
      : undefined;
  }

  /**
   * HLC d'un choix (n° 9 (2), n° 11 c (2), C3), enregistré par une transaction (`dernierHlc = h`, plan vide) avant
   * toute écriture dans le Drive : une écriture locale faite ensuite lui est postérieure (C9).
   */
  async #consommerHlc(vue: Vue): Etape<Hlc> {
    const { depot, horloge } = this.dependances;
    const plancher = hlcPlancherDesChoix(vue.observation, situationDe(vue.lu.meta));
    // Le calcul reste pur : il ne fait que retenir son résultat (rejoué, le dernier calcul fait foi).
    let h = hlcDuChoix(vue.lu.etat, plancher, physique(horloge, vue.lu.etat));
    const consomme = await depot.appliquerSynchronisation((e) => {
      h = hlcDuChoix(e, plancher, physique(horloge, e));
      return { plan: { ...PLAN_VIDE(e), etatApres: { ...e, dernierHlc: h } }, meta: {} };
    });
    return consomme.ok ? succes(h) : consomme;
  }

  /** Fichiers ignorés journalisés (n° 6), puis fusion de chaque fichier retenu ; vrai si une fusion a écrit. */
  async #fusionner(fusion: Synchroniser['fusion'], vue: Vue): Etape<boolean> {
    fusion.ignores.forEach(() => {
      this.#consigner('FichierAppareilIgnore', 'FichierIllisibleOuAutreGeneration');
    });
    let ecrit = false;
    for (const contenu of fusion.aFusionner) {
      const integre = await this.#integrer(contenu, vue.lu);
      if (!integre.ok) return integre;
      ecrit ||= integre.valeur;
    }
    return succes(ecrit);
  }

  /**
   * Intégration d'un fichier reçu dans une transaction (§6.3, §6.6 n° 11) : détection, fusion, réparation, union des
   * signalements (`planifierSynchronisation`). Pré-contrôle sur les lectures du début du cycle : aucune transaction
   * ni journal s'il n'apporte rien (l'état local et les signalements ne font que croître). Après la transaction
   * validée seulement, une entrée « erreur » par réparation sans entrée du déplacement (condition C2, §8 n° 11).
   */
  async #integrer(recu: ContenuFichierAppareil, lu: Lu): Etape<boolean> {
    const { depot, horloge } = this.dependances;
    const pre = planifierSynchronisation(
      lu.etat,
      lu.signalements,
      recu,
      physique(horloge, lu.etat),
    );
    if (pre.meta.fusionNonDeposee !== true) return succes(false);
    // Le calcul reste pur : il ne fait que retenir son résultat (rejoué, le dernier calcul fait foi).
    let ecrit = false;
    let sansEntree: ReadonlyArray<IdEvenement> = [];
    const applique = await depot.appliquerSynchronisation((e, _m, s) => {
      const retenu = planifierSynchronisation(e, s, recu, physique(horloge, e));
      ecrit = retenu.meta.fusionNonDeposee === true;
      sansEntree = retenu.deplacementsSansEntree ?? [];
      return retenu;
    });
    if (!applique.ok) return applique;
    for (const entree of sansEntree) {
      this.dependances.journal.consigner({
        niveau: 'erreur',
        evenement: 'ReparationSansEntreeDeplacement',
        champs: { entree },
      });
    }
    return succes(ecrit);
  }

  /** Écriture monotone du manifeste (n° 13) ; rend l'identifiant du canonique. */
  async #ecrireManifeste(
    dossier: IdFichierDrive,
    apport: ContenuManifeste,
    mode: ModeEcritureManifeste,
  ): Etape<IdFichierDrive> {
    const ecrit = await ecrireManifesteMonotone(this.dependances.transport, {
      dossier,
      apport,
      mode,
    });
    return ecrit.ok ? succes(ecrit.valeur.id) : ecrit;
  }

  /**
   * Dossier en double (n° 14, C5) : dépôt du fichier propre dans le canonique (création), écriture monotone de la
   * jointure des manifestes lus et de la génération, méta du nouveau dossier, ancien fichier propre mis à la corbeille,
   * puis nouvel inventaire du dossier quitté : vide de tout fichier d'appareil, il est mis à la corbeille. Après la
   * méta, un échec est journalisé sans changer l'issue (le dossier quitté n'est plus observé).
   */
  async #demenager(vue: Vue, ancien: IdFichierDrive, canonique: IdFichierDrive): Etape {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const { etat, meta, signalements } = lu.valeur;
    const { transport, versionApplication, horloge, depot } = this.dependances;
    const x = etat.dernierHlc;
    const depose = await transport.deposerFichierAppareil({
      dossier: canonique,
      contenu: contenuAEnvoyer(etat, {
        versionApplication,
        generation: generationDe(meta),
        signalements,
      }),
    });
    if (!depose.ok) return depose;
    const apport = vue.observation.manifestes.reduce<ContenuManifeste>(
      (cible, m) =>
        m.lecture.type === 'LU' ? fusionnerManifestes(cible, m.lecture.contenu) : cible,
      { schemaVersion: SCHEMA_VERSION, generation: generationDe(meta) },
    );
    const manifeste = await this.#ecrireManifeste(canonique, apport, 'ORDINAIRE');
    if (!manifeste.ok) return manifeste;
    const memorise = await depot.appliquerSynchronisation((e) => ({
      plan: planRetrait(e, x),
      meta: {
        ...definies({ deposeJusquA: x }),
        ...versionDe(depose.valeur),
        dossier: canonique,
        fichierPropre: depose.valeur.id,
        manifeste: manifeste.valeur,
        inventaireAFaire: true,
        fusionNonDeposee: false,
        dernierContactDrive: horloge.maintenant(),
      },
    }));
    if (!memorise.ok) return memorise;
    if (meta.fichierPropre !== undefined) await this.#mettreALaCorbeille(meta.fichierPropre);
    const inventaire = await transport.inventorierDossier(ancien);
    if (!inventaire.ok) {
      this.#consigner('DossierQuitteConserve', inventaire.erreur.type);
    } else if (inventaire.valeur.fichiers.length === 0) {
      await this.#mettreALaCorbeille(ancien);
    }
    return succes(undefined);
  }

  /**
   * Orphelins (C8, n° 12) : chaque orphelin observé autre que le fichier propre mémorisé à cet instant est mis à la
   * corbeille par l'appareil ; un échec est journalisé et repris au cycle suivant, sans changer l'issue.
   */
  async #supprimerOrphelins(vue: Vue): Etape<Fin> {
    if (vue.observation.orphelins.length === 0) return succes('TERMINE');
    const meta = await this.dependances.depot.lireMeta();
    if (!meta.ok) return meta;
    for (const { id } of vue.observation.orphelins) {
      if (id !== meta.valeur.fichierPropre) await this.#mettreALaCorbeille(id);
    }
    return succes('TERMINE');
  }

  /** `supprimerFichier` (corbeille) ; un échec est journalisé en « avertissement ». */
  async #mettreALaCorbeille(id: IdFichierDrive): Promise<void> {
    const supprime = await this.dependances.transport.supprimerFichier(id);
    if (!supprime.ok) this.#consigner('MiseALaCorbeilleDifferee', supprime.erreur.type);
  }

  // ------------------------------------------------------------------ Dépôt seul (§6.5)

  async #depotSeul(): Etape<Fin> {
    if (this.#actionRequise === 'DONNEES_ABSENTES') return succes('DONNEES_ALTEREES');
    if (this.#actionRequise === 'FORMAT_PLUS_RECENT') return succes('FORMAT_PLUS_RECENT');
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const dossier = await this.#dossier(lu.valeur.meta);
    if (!dossier.ok) return dossier;
    const manifeste = await this.#assurerManifeste(dossier.valeur, lu.valeur.meta);
    if (!manifeste.ok) return manifeste;
    const depose = await this.#deposer(dossier.valeur, {
      force: false,
      fichierExistant: lu.valeur.meta.fichierPropre,
    });
    return depose.ok ? succes('TERMINE') : depose;
  }

  /** Méta fusionnée clé à clé, sans plan d'écriture ; aucune transaction si elle est vide. */
  #memoriser(meta: Partial<MetaSynchronisation>): Etape {
    if (Object.keys(meta).length === 0) return Promise.resolve(succes(undefined));
    return this.dependances.depot.appliquerSynchronisation((etat) => ({
      plan: PLAN_VIDE(etat),
      meta,
    }));
  }

  async #dossier(meta: MetaSynchronisation): Etape<IdFichierDrive> {
    if (meta.dossier !== undefined) return succes(meta.dossier);
    const prepare = await this.dependances.transport.preparerDossier();
    if (!prepare.ok) return prepare;
    const memorise = await this.#memoriser({ dossier: prepare.valeur });
    return memorise.ok ? prepare : memorise;
  }

  /** Dépôt seul : manifeste mémorisé, relu, ou écrit (avec LISEZ-MOI) s'il est absent (§6.3). */
  async #assurerManifeste(dossier: IdFichierDrive, meta: MetaSynchronisation): Etape {
    if (meta.manifeste !== undefined) return succes(undefined);
    const { transport } = this.dependances;
    const lu = await transport.lireManifeste(dossier);
    if (!lu.ok) {
      if (!estIgnorable(lu.erreur)) return lu;
      this.#consigner('ManifesteIgnore', lu.erreur.type);
      return succes(undefined);
    }
    if (lu.valeur !== undefined) return this.#memoriser({ manifeste: lu.valeur.id });
    const ecrit = await transport.ecrireManifeste({
      dossier,
      contenu: { schemaVersion: SCHEMA_VERSION, generation: generationDe(meta) },
    });
    return ecrit.ok ? this.#memoriser({ manifeste: ecrit.valeur }) : ecrit;
  }

  /**
   * Dépôt (§6.2) : `deposeJusquA` n'avance qu'après la confirmation de Drive (ENF-T-07) ; la même transaction mémorise
   * le fichier, sa version (n° 5) et `options.meta`. `force` : déposé même sans rien de nouveau (n° 5, n° 8).
   * `fichierExistant` absent : le transport cherche le fichier de l'appareil dans le dossier, sinon le crée (C7).
   */
  async #deposer(
    dossier: IdFichierDrive,
    options: {
      readonly force: boolean;
      readonly fichierExistant: IdFichierDrive | undefined;
      readonly meta?: Partial<MetaSynchronisation>;
    },
    lecture?: Lu,
  ): Etape {
    const lu = lecture === undefined ? await this.#lire() : succes(lecture);
    if (!lu.ok) return lu;
    const { etat, meta, signalements } = lu.valeur;
    if (!options.force && !doitDeposer(etat, meta)) return succes(undefined);
    const x = etat.dernierHlc;
    const { transport, versionApplication, horloge, depot } = this.dependances;
    const depose = await transport.deposerFichierAppareil({
      dossier,
      contenu: contenuAEnvoyer(etat, {
        versionApplication,
        generation: generationDe(meta),
        signalements,
      }),
      ...(options.fichierExistant === undefined
        ? {}
        : { fichierExistant: options.fichierExistant }),
    });
    if (!depose.ok) return depose;
    return depot.appliquerSynchronisation((e) => ({
      plan: planRetrait(e, x),
      meta: {
        ...options.meta,
        ...definies({ deposeJusquA: x }),
        ...versionDe(depose.valeur),
        fichierPropre: depose.valeur.id,
        fusionNonDeposee: false,
        dernierContactDrive: horloge.maintenant(),
      },
    }));
  }
}
