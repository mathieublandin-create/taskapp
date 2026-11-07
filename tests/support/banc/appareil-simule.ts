/**
 * Appareil du banc (conventions.md §11.11 ; ST-socle-ecriture.md §12 ; ST-US-022 §12.3). Horloge propre sur le temps
 * du banc, base `fake-indexeddb` propre (une IDBFactory par appareil), réseau et journal technique simulés,
 * `FauxFournisseurAuth` (Google vu de cet appareil) et une instance de l'application assemblée comme la PWA
 * (`assemblerApplication`), recréée à chaque ouverture : achever une redirection, c'est abandonner l'instance et
 * en créer une nouvelle avec le retour de Google, comme un rechargement de page.
 */
import { IDBFactory } from 'fake-indexeddb';
import type { Planificateur } from '@src/commun/application/ports/planificateur';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { IssueOuverture } from '@src/compte/application/cas-usage/ouvrir-application';
import type { JetonAcces } from '@src/compte/application/ports/coffre-jetons';
import type { RetourGoogle } from '@src/compte/application/ports/fournisseur-auth';
import { BaseTechnique, MemoireRedirectionDexie } from '@src/compte/infrastructure/base-technique';
import { assemblerApplication, type Application } from '@src/composition/application';
import { ControleurInterface, type VueInterface } from '@src/composition/controleur-interface';
import type { Annulation } from '@src/commun/application/ports/planificateur';
import { echec, type Resultat } from '@src/commun/domaine/resultat';
import {
  construireRacine,
  type ModeleVueRacine,
} from '@src/compte/presentation/modeles-de-vue/racine';
import type { ServiceEtatLocal } from '@src/synchronisation/application/service-etat-local';
import type {
  ErreurTransport,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import type {
  CycleSynchronisation,
  IssueCycle,
} from '@src/synchronisation/application/cycle-synchronisation';
import type { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { FauxFournisseurAuth } from '../../doublures/faux-fournisseur-auth';
import type { FauxGoogle } from '../../doublures/faux-google';
import { GenerateurIdentifiantsSequentiel } from '../../doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { JournalTechniqueMemoire } from '../../doublures/journal-technique-memoire';
import { ReseauSimule } from '../../doublures/reseau-simule';
import { SourceAleatoireDeterministe } from '../../doublures/source-aleatoire-deterministe';
import { AvisOngletsEnMemoire } from '../compte/doublures-compte';
import type { TempsSimule } from './temps-simule';

export type NomAppareil = 'smartphone' | 'pc';

/** Environnement des bases du banc : `donejuan-recette-…`. */
export const ENV_BANC = 'recette';

/**
 * Identifiants de référence des appareils (conventions.md §11.11). Depuis le rang 1, l'`appareilId` de l'espace
 * naît avec lui (ST-US-022 §12.3) : il vient du générateur au préfixe de l'appareil (`…-8001-…`, `…-8002-…`), ce qui
 * garde l'ordre smartphone < PC. Ces identifiants servent de vue de l'appareil auprès du Drive avant l'espace.
 */
export const IDENTIFIANTS_APPAREILS: Readonly<Record<NomAppareil, IdAppareil>> = {
  smartphone: '00000000-0000-7000-8000-000000000001' as IdAppareil,
  pc: '00000000-0000-7000-8000-000000000002' as IdAppareil,
};

/** Version de l'application écrite dans les fichiers d'appareil du banc. */
const VERSION_APPLICATION_BANC = '0.1.0';

const PREFIXES_GENERATEUR: Readonly<Record<NomAppareil, string>> = { smartphone: '01', pc: '02' };

/** Durée de vie d'un jeton simulé placé dans le coffre (Google : 1 h). */
const VALIDITE_JETON = EcartTemps.depuisMillisecondes(3_600_000);

/**
 * Observations depuis la dernière ouverture (ST-US-022 §12.1 n° 36, 38) : demandes faites à Google avant
 * l'ouverture, et écran de connexion affiché depuis.
 */
export type DepuisOuverture = { readonly demandesAvant: number; ecranConnexion: boolean };

/** Ce que l'appareil affiche à la fin de l'ouverture, avant toute réponse du Drive (ST-US-017 §12.1 n° 10). */
export type InstantaneOuverture = {
  readonly racine: ModeleVueRacine;
  /** Intitulés des objectifs lus sur les données locales ; absent sans espace ouvert. */
  readonly intitules?: ReadonlyArray<string>;
};

export type DependancesAppareil = {
  readonly planificateur: Planificateur;
  readonly google: FauxGoogle;
};

export class AppareilSimule {
  readonly horloge: HorlogeSimulee;
  readonly reseau = new ReseauSimule();
  readonly journalTechnique = new JournalTechniqueMemoire();
  readonly generateur: GenerateurIdentifiantsSequentiel;
  readonly fabrique = new IDBFactory();
  readonly fournisseur: FauxFournisseurAuth;
  readonly avis = new AvisOngletsEnMemoire();
  /** Vrai : le retour de la prochaine redirection d'ouverture est différé (« la session Google a expiré »). */
  retourDiffere = false;
  /** Fermetures imposées par une autre connexion (versionchange), observées par les scénarios. */
  fermeturesImposees = 0;
  depuisOuverture: DepuisOuverture = { demandesAvant: 0, ecranConnexion: false };
  /** ST-US-017 §12.1 n° 10 : racine et objectifs affichés à la fin de la dernière ouverture. */
  instantaneOuverture: InstantaneOuverture | undefined;
  private instance: Application | undefined;
  /** Contrôleur de l'interface de l'instance ouverte (vue affichée, ANO-001, ST-US-017 §12.4). */
  private controleurInstance: ControleurInterface | undefined;
  private annulerReseau: Annulation | undefined;
  /** Réponses du Drive retenues pendant l'ouverture, jusqu'à l'instantané. */
  private porteDrive: Promise<void> = Promise.resolve();

  constructor(
    readonly nom: NomAppareil,
    temps: TempsSimule,
    private readonly dependances: DependancesAppareil,
  ) {
    this.horloge = new HorlogeSimulee(temps);
    this.generateur = new GenerateurIdentifiantsSequentiel(PREFIXES_GENERATEUR[nom]);
    this.fournisseur = new FauxFournisseurAuth({
      memoireRedirection: new MemoireRedirectionDexie(
        new BaseTechnique({ env: ENV_BANC, fabrique: this.fabrique }),
      ),
      horloge: this.horloge,
    });
  }

  /** L'application ouverte sur cet appareil ; erreur si elle est fermée. */
  get application(): Application {
    if (this.instance === undefined) {
      throw new Error(`L'application n'est pas ouverte sur le ${this.nom}`);
    }
    return this.instance;
  }

  estOuverte(): boolean {
    return this.instance !== undefined;
  }

  /**
   * Nouvelle instance (`OuvrirApplication`), puis, si une redirection d'ouverture part, son retour immédiat
   * (jeton ou erreur), sauf retour différé : l'instance reste alors en attente de Google.
   */
  async ouvrirApplication(): Promise<IssueOuverture> {
    this.depuisOuverture = {
      demandesAvant: this.fournisseur.demandes.length,
      ecranConnexion: false,
    };
    const issue = await this.demarrer({ type: 'AUCUN' });
    if (issue.type !== 'REDIRECTION_LANCEE' || this.retourDiffere) return issue;
    return this.demarrer(this.fournisseur.acheverRedirection());
  }

  /** Livre le retour différé de la redirection en attente (glossaire : « l'accès à Google est renouvelé »). */
  livrerRetourDiffere(): Promise<IssueOuverture> {
    this.retourDiffere = false;
    return this.demarrer(this.fournisseur.acheverRedirection());
  }

  /**
   * Demandes faites à Google depuis l'ouverture, hors redirection silencieuse d'ouverture : connexion, geste ou
   * saisie (ST-US-022 §12.1 n° 36, 38).
   */
  demandesInteractivesDepuisOuverture(): ReadonlyArray<string> {
    return this.fournisseur.demandes
      .slice(this.depuisOuverture.demandesAvant)
      .filter((d) => d.mode !== 'RENOUVELLEMENT_OUVERTURE')
      .map((d) => d.mode);
  }

  /**
   * La session Google a expiré (ST-US-022 §12.1 n° 34) : le jeton est échu (échéance atteinte dans le coffre de
   * l'instance ouverte, jeton oublié par Google simulé) et le retour de la prochaine redirection d'ouverture est
   * différé jusqu'à « l'accès à Google est renouvelé sans saisie ».
   */
  expirerSessionGoogle(): void {
    this.fournisseur.expirerJeton();
    this.instance?.coffre.placer({
      jeton: 'jeton-simule-echu' as JetonAcces,
      echeance: this.horloge.monotone(),
    });
    this.retourDiffere = true;
  }

  /** Place un jeton non échu dans le coffre de l'instance ouverte (refus constaté d'un accès retiré, n° 32). */
  placerJetonNonEchu(): void {
    this.application.coffre.placer({
      jeton: 'jeton-simule-valide' as JetonAcces,
      echeance: EcartTemps.depuisMillisecondes(this.horloge.monotone() + VALIDITE_JETON),
    });
  }

  /** Ouvre l'application si elle ne l'est pas encore. */
  async assurerOuverte(): Promise<Application> {
    if (this.instance === undefined) await this.ouvrirApplication();
    return this.application;
  }

  /** Fermeture de l'application : la mémoire est perdue, les bases restent. */
  fermerApplication(): void {
    this.annulerReseau?.();
    this.annulerReseau = undefined;
    this.controleurInstance = undefined;
    this.instance?.arreter();
    this.instance = undefined;
  }

  /** Contrôleur de l'interface de l'application ouverte ; erreur si elle est fermée. */
  get controleur(): ControleurInterface {
    if (this.controleurInstance === undefined) {
      throw new Error(`L'application n'est pas ouverte sur le ${this.nom}`);
    }
    return this.controleurInstance;
  }

  /**
   * Vue affichée par l'interface (ANO-001, ST-US-017 §12.4) : celle du contrôleur, une fois les cycles et les
   * rafraîchissements en cours terminés. N'appelle jamais `rafraichir()` : seules les notifications la mettent à jour.
   */
  async vueAffichee(): Promise<VueInterface> {
    do {
      await this.attendreCycle();
      await this.controleur.rafraichissementsTermines();
    } while (this.cycleEnCours() !== undefined);
    return this.controleur.vue();
  }

  /** Comme le `visibilitychange` de `web.ts` : page masquée. */
  passerAuSecondPlan(): void {
    this.espaceOuvert().cycle.definirPremierPlan(false);
  }

  /** Comme le `visibilitychange` de `web.ts` : page de nouveau visible (un cycle est lancé). */
  revenirAuPremierPlan(): void {
    this.espaceOuvert().cycle.definirPremierPlan(true);
  }

  /**
   * L'accès Google expire sans que l'application le sache : la session reste ouverte, mais le jeton du coffre est
   * échu et Google ne le reconnaît plus ; le premier appel au Drive reçoit 401, qualifié « à renouveler » (DAT §4.1.6
   * bis : un jeton non échu refusé vaudrait retrait prouvé, donc accès perdu) et signalé par le cycle.
   */
  expirerAccesSansConstat(): void {
    this.fournisseur.expirerJeton();
    this.application.coffre.placer({
      jeton: 'jeton-simule-echu' as JetonAcces,
      echeance: this.horloge.monotone(),
    });
  }

  /** Espace du compte ouvert (dépôt) ; erreur sans session. */
  get depot(): DepotLocalDexie {
    return this.espaceOuvert().depot;
  }

  get service(): ServiceEtatLocal {
    return this.espaceOuvert().service;
  }

  /** `appareilId` de l'espace ouvert (né avec l'espace). */
  get appareilId(): IdAppareil {
    return this.depot.appareil();
  }

  /** Cycle de synchronisation en cours sur l'espace ouvert, s'il y en a un (banc, ST-US-017 §12.3). */
  cycleEnCours(): Promise<IssueCycle> | undefined {
    return this.instance?.espace()?.cycle.cycleEnCours();
  }

  /** Attend la fin du cycle en cours de cet appareil, relances comprises. */
  async attendreCycle(): Promise<void> {
    for (let enCours = this.cycleEnCours(); enCours !== undefined; enCours = this.cycleEnCours()) {
      await enCours.catch(() => undefined);
    }
  }

  /** Cycle de l'espace ouvert ; erreur sans session. */
  get cycle(): CycleSynchronisation {
    return this.espaceOuvert().cycle;
  }

  /** « Le {appareil} échange ses modifications avec le Drive » : un cycle complet, après celui en cours. */
  async echangerAvecLeDrive(): Promise<IssueCycle | undefined> {
    const espace = this.instance?.espace();
    if (espace === undefined) return undefined;
    while (espace.cycle.cycleEnCours() !== undefined) await espace.cycle.cycleEnCours();
    return espace.cycle.synchroniserMaintenant();
  }

  /** Version locale et méta de synchronisation de l'espace ouvert (repos du banc, ST-US-017 §12.1 n° 2). */
  async signatureSynchronisation(): Promise<string> {
    const espace = this.instance?.espace();
    if (espace === undefined) return 'fermé';
    const [etat, meta] = await Promise.all([espace.depot.lire(), espace.depot.lireMeta()]);
    return JSON.stringify([etat.ok ? etat.valeur.version : 'illisible', meta]);
  }

  /** Perte de la mémoire, conservation des bases. */
  arreterBrutalement(): void {
    this.fermerApplication();
  }

  /** Arrêt brutal, puis nouvelle origine de l'horloge monotone. */
  redemarrer(): void {
    this.arreterBrutalement();
    this.horloge.redemarrer();
  }

  private espaceOuvert(): NonNullable<ReturnType<Application['espace']>> {
    const espace = this.application.espace();
    if (espace === undefined) throw new Error(`Aucun espace de compte ouvert sur le ${this.nom}`);
    return espace;
  }

  /**
   * Nouvelle instance ouverte avec ce retour de Google. Les réponses du Drive à cet appareil sont retenues jusqu'à
   * l'instantané d'ouverture (ST-US-017 §12.1 n° 10) ; les cycles lancés par l'ouverture sont ensuite attendus.
   */
  private async demarrer(retour: RetourGoogle): Promise<IssueOuverture> {
    this.fermerApplication();
    let ouvrirPorte = (): void => undefined;
    this.porteDrive = new Promise<void>((resoudre) => {
      ouvrirPorte = resoudre;
    });
    try {
      const instance = this.assembler();
      this.instance = instance;
      const controleur = new ControleurInterface(instance, this.horloge, instance.objectifs);
      this.controleurInstance = controleur;
      this.annulerReseau = this.reseau.surChangement(() => void controleur.rafraichir());
      instance.session.observer((etat) => {
        if (etat.type === 'SANS_SESSION') this.depuisOuverture.ecranConnexion = true;
      });
      const issue = await instance.ouvrirApplication.executer(retour);
      await controleur.apresOuverture(issue);
      this.instantaneOuverture = await this.capturerInstantane(instance);
      return issue;
    } finally {
      ouvrirPorte();
      this.porteDrive = Promise.resolve();
      await this.attendreCycle();
    }
  }

  /** Racine et objectifs affichés, lus sur les seules données locales (aucune réponse du Drive n'est passée). */
  private async capturerInstantane(instance: Application): Promise<InstantaneOuverture> {
    const objectifs = instance.objectifs();
    const lus = objectifs === undefined ? undefined : await objectifs.consulterObjectifs.executer();
    return {
      racine: construireRacine(instance.session.etat()),
      ...(lus?.ok === true ? { intitules: lus.valeur.objectifs.map((o) => o.intitule) } : {}),
    };
  }

  /**
   * Transport vu de cet appareil (ST-US-017 §12.3) : chaque appel s'adresse au FauxDrive du compte du jeton en
   * mémoire, à travers le réseau de l'appareil et l'accès de ce compte ; sans jeton connu : NonAutorise.
   */
  private transportBanc(): TransportSynchro {
    const { google } = this.dependances;
    const vue = (): TransportSynchro | undefined => {
      const identite = this.fournisseur.identiteDuJetonEnMemoire();
      const nom = identite === undefined ? undefined : google.nomDe(identite);
      if (nom === undefined) return undefined;
      return google.drive(nom).transportPour(IDENTIFIANTS_APPAREILS[this.nom], {
        reseau: this.reseau,
        accesAccorde: () => google.accesAccorde(nom),
      });
    };
    /** Appel retenu jusqu'à l'instantané d'ouverture, puis adressé au Drive du compte du jeton. */
    const appeler = async <T>(
      operation: (transport: TransportSynchro) => Promise<Resultat<T, ErreurTransport>>,
    ): Promise<Resultat<T, ErreurTransport>> => {
      await this.porteDrive;
      const transport = vue();
      return transport === undefined ? echec({ type: 'NonAutorise' }) : operation(transport);
    };
    return {
      preparerDossier: () => appeler((t) => t.preparerDossier()),
      listerFichiersAppareils: (d) => appeler((t) => t.listerFichiersAppareils(d)),
      changements: (d, jeton) => appeler((t) => t.changements(d, jeton)),
      lireFichierAppareil: (id) => appeler((t) => t.lireFichierAppareil(id)),
      deposerFichierAppareil: (p) => appeler((t) => t.deposerFichierAppareil(p)),
      lireManifeste: (d) => appeler((t) => t.lireManifeste(d)),
      ecrireManifeste: (p) => appeler((t) => t.ecrireManifeste(p)),
      listerDossiers: () => appeler((t) => t.listerDossiers()),
      inventorierDossier: (d) => appeler((t) => t.inventorierDossier(d)),
      lireContenuManifeste: (id) => appeler((t) => t.lireContenuManifeste(id)),
      supprimerFichier: (id) => appeler((t) => t.supprimerFichier(id)),
    };
  }

  private assembler(): Application {
    const { planificateur } = this.dependances;
    return assemblerApplication({
      env: ENV_BANC,
      fabrique: this.fabrique,
      horloge: this.horloge,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([0]),
      reseau: this.reseau,
      journal: this.journalTechnique,
      generateur: this.generateur,
      avis: this.avis,
      gardeSaisie: { saisieEnCours: () => false },
      fournisseur: () => this.fournisseur,
      transport: () => this.transportBanc(),
      versionApplication: VERSION_APPLICATION_BANC,
      surFermetureImposee: () => {
        this.fermeturesImposees += 1;
      },
      ouvrirOnglet: () => undefined,
    });
  }
}
