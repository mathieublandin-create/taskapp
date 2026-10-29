import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { Annulation, Planificateur } from '../../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../../commun/application/ports/source-aleatoire';
import { succes, type Resultat } from '../../commun/domaine/resultat';
import { delaiAvantTentative, TENTATIVES_AVANT_ABANDON } from '../../infrastructure-google';
import type { Generation } from '../domaine/contenu-fichier';
import { contenuAEnvoyer, doitDeposer, retirerDeposees } from '../domaine/depot';
import type { EtatLocal } from '../domaine/etat-local';
import { planifierFusion } from '../domaine/fusion';
import type { Hlc } from '../domaine/hlc';
import type { IdFichierDrive, MetaSynchronisation } from '../domaine/meta-synchronisation';
import {
  PERIODE_SYNCHRONISATION_PREMIER_PLAN,
  TEMPORISATION_DEPOT,
} from '../domaine/parametres-synchronisation';
import { PLAN_VIDE, type PlanEcriture } from '../domaine/planifier-ecritures';
import { SCHEMA_VERSION } from '../domaine/version-schema';
import type { AccesGoogle, EtatAccesGoogle } from './ports/acces-google';
import type { DepotLocal, ErreurDepotLocal } from './ports/depot-local';
import type { EtatMoteur, SuiviCycle } from './ports/suivi-cycle';
import type {
  Changements,
  ErreurTransport,
  FichierAppareilDistant,
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
  | 'ECHEC_TRANSITOIRE';

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
type Lecture = { readonly etat: EtatLocal; readonly meta: MetaSynchronisation };

/** Incrément 1 : la génération est toujours initiale (« Repartir de zéro » : incrément 3). */
const GENERATION: Generation = { type: 'INITIALE' };

/** Erreurs d'un fichier ou d'un manifeste qui le font ignorer à l'incrément 1 (incréments 3 et 4 : traitement). */
const estIgnorable = (erreur: ErreurCycle): boolean =>
  erreur.type === 'FichierIllisible' ||
  erreur.type === 'FormatPlusRecent' ||
  erreur.type === 'RessourceIntrouvable';

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

const planNonVide = (plan: PlanEcriture): boolean =>
  plan.registresEcrits.length > 0 || plan.evenementsAjoutes.length > 0;

/**
 * Cycle de synchronisation d'un espace (ST-US-017 §6.3) : lecture des fichiers des autres appareils, fusion,
 * manifeste, dépôt du fichier propre. Jamais deux cycles à la fois : une demande pendant un cycle le fait
 * relancer une fois à sa fin. Seul point d'écriture dans le Drive (hors cas d'usage RG-044).
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

  /** Un cycle complet : lecture, fusion, manifeste, dépôt. */
  synchroniserMaintenant(): Promise<IssueCycle> {
    return this.#lancer(() => this.#cycleComplet());
  }

  /** Dépôt seul, sans lecture des autres fichiers ; attend la fin d'un cycle en cours. */
  async deposerMaintenant(): Promise<IssueCycle> {
    while (this.#enCours !== undefined) await this.#enCours;
    return this.#lancer(() => this.#depotSeul());
  }

  etatMoteur(): EtatMoteur {
    return {
      cycle: this.#cycle,
      ...(this.#actionRequise === undefined ? {} : { actionRequise: this.#actionRequise }),
      aLire: 0,
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

  #lancer(executer: () => Etape): Promise<IssueCycle> {
    if (this.#enCours !== undefined) {
      this.#aRefaire = true;
      return Promise.resolve('DEJA_EN_COURS');
    }
    const garde = this.#garde();
    if (garde !== undefined) return Promise.resolve(garde);
    const enCours = this.#executer(executer);
    this.#enCours = enCours;
    return enCours;
  }

  async #executer(executer: () => Etape): Promise<IssueCycle> {
    try {
      const issue = await this.#unCycle(executer);
      const relancer = this.#aRefaire && issue === 'TERMINE' && this.#garde() === undefined;
      return relancer ? await this.#unCycle(() => this.#cycleComplet()) : issue;
    } catch (erreur) {
      this.#cycle = 'REPOS';
      throw erreur;
    } finally {
      this.#enCours = undefined;
      this.#aRefaire = false;
    }
  }

  async #unCycle(executer: () => Etape): Promise<IssueCycle> {
    this.#aRefaire = false;
    this.#reprise?.();
    this.#reprise = undefined;
    this.#cycle = 'EN_COURS';
    const resultat = await executer();
    return resultat.ok ? this.#reussite() : this.#echec(resultat.erreur);
  }

  #reussite(): IssueCycle {
    this.#tentatives = 0;
    this.#actionRequise = undefined;
    this.#cycle = 'REPOS';
    return 'TERMINE';
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

  // ------------------------------------------------------------------ Étapes

  async #cycleComplet(): Etape {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const dossier = await this.#dossier(lu.valeur.meta);
    if (!dossier.ok) return dossier;
    const inventaire = await this.#inventaire(dossier.valeur, lu.valeur.meta.pageToken);
    if (!inventaire.ok) return inventaire;
    const fusion = await this.#fusionner(inventaire.valeur.fichiers, lu.valeur.etat);
    if (!fusion.ok) return fusion;
    const jeton = await this.#memoriser({ pageToken: inventaire.valeur.jeton });
    if (!jeton.ok) return jeton;
    const manifeste = await this.#assurerManifeste(dossier.valeur, lu.valeur.meta);
    if (!manifeste.ok) return manifeste;
    return this.#deposer(dossier.valeur);
  }

  async #depotSeul(): Etape {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const dossier = await this.#dossier(lu.valeur.meta);
    if (!dossier.ok) return dossier;
    const manifeste = await this.#assurerManifeste(dossier.valeur, lu.valeur.meta);
    if (!manifeste.ok) return manifeste;
    return this.#deposer(dossier.valeur);
  }

  async #lire(): Etape<Lecture> {
    const etat = await this.dependances.depot.lire();
    if (!etat.ok) return etat;
    const meta = await this.dependances.depot.lireMeta();
    if (!meta.ok) return meta;
    return succes({ etat: etat.valeur, meta: meta.valeur });
  }

  /** Méta fusionnée clé à clé, sans plan d'écriture. */
  #memoriser(meta: Partial<MetaSynchronisation>): Etape {
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

  /** Changements depuis le jeton ; sans jeton, ou jeton refusé, inventaire complet (DAT v0.11.4 §4.3). */
  async #inventaire(dossier: IdFichierDrive, jeton: string | undefined): Etape<Changements> {
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

  /** Fusionne chaque fichier d'un autre appareil, chacun dans sa propre transaction. */
  async #fusionner(fichiers: ReadonlyArray<FichierAppareilDistant>, etat: EtatLocal): Etape {
    for (const fichier of fichiers.filter((f) => f.appareil !== etat.appareilId)) {
      const contenu = await this.dependances.transport.lireFichierAppareil(fichier.id);
      if (!contenu.ok) {
        if (!estIgnorable(contenu.erreur)) return contenu;
        this.#consigner('FichierAppareilIgnore', contenu.erreur.type);
        continue;
      }
      const recu = contenu.valeur;
      const applique = await this.dependances.depot.appliquerSynchronisation((e) => {
        const plan = planifierFusion(e, recu);
        return { plan, meta: planNonVide(plan) ? { fusionNonDeposee: true } : {} };
      });
      if (!applique.ok) return applique;
    }
    return succes(undefined);
  }

  /** Manifeste mémorisé, relu, ou écrit (avec LISEZ-MOI) s'il est absent (§6.3). */
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
      contenu: { schemaVersion: SCHEMA_VERSION, generation: GENERATION },
    });
    return ecrit.ok ? this.#memoriser({ manifeste: ecrit.valeur }) : ecrit;
  }

  /** Dépôt (§6.2) : `deposeJusquA` n'avance qu'après la confirmation de Drive (ENF-T-07). */
  async #deposer(dossier: IdFichierDrive): Etape {
    const lu = await this.#lire();
    if (!lu.ok) return lu;
    const { etat, meta } = lu.valeur;
    if (!doitDeposer(etat, meta)) return succes(undefined);
    const x = etat.dernierHlc;
    const { transport, versionApplication, horloge, depot } = this.dependances;
    const depose = await transport.deposerFichierAppareil({
      dossier,
      contenu: contenuAEnvoyer(etat, { versionApplication, generation: GENERATION }),
      ...(meta.fichierPropre === undefined ? {} : { fichierExistant: meta.fichierPropre }),
    });
    if (!depose.ok) return depose;
    return depot.appliquerSynchronisation((e) => ({
      plan: planRetrait(e, x),
      meta: {
        fichierPropre: depose.valeur,
        ...(x === undefined ? {} : { deposeJusquA: x }),
        fusionNonDeposee: false,
        dernierContactDrive: horloge.maintenant(),
      },
    }));
  }
}
