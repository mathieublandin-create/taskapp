import type { Instant } from '../commun/domaine/temps/instant';
import type { Horloge } from '../commun/application/ports/horloge';
import type { IdValeurEcartee } from '../synchronisation/domaine/valeurs-ecartees';
import type { Annulation } from '../commun/application/ports/planificateur';
import { jourDeReference } from '../commun/domaine/temps/jour-de-reference';
import type { DateCalendaire } from '../commun/domaine/temps/date-calendaire';
import { assertNever } from '../commun/domaine/assert-never';
import type { Resultat } from '../commun/domaine/resultat';
import type { IssueOuverture } from '../compte/application/cas-usage/ouvrir-application';
import type { IssueSuppression } from '../compte/application/cas-usage/supprimer-donnees-appareil';
import type { ConfirmationCompte } from '../compte/application/evaluation';
import type { EtatSession } from '../compte/application/session-courante';
import { REPRISE_ACCUEIL } from '../compte/application/ports/memoire-redirection';
import type { MotifEchecConnexion } from '../compte/domaine/motif-connexion';
import {
  construireConfirmationCompte,
  type ModeleVueConfirmationCompte,
} from '../compte/presentation/modeles-de-vue/confirmations-compte';
import {
  construireEcranConnexion,
  type ModeleVueConnexion,
} from '../compte/presentation/modeles-de-vue/ecran-connexion';
import {
  construireRacine,
  type ModeleVueRacine,
} from '../compte/presentation/modeles-de-vue/racine';
import { construireRetourReprise } from '../compte/presentation/modeles-de-vue/retour-reprise';
import {
  construireSectionCompte,
  type ActionCompte,
  type ModeleVueSectionCompte,
} from '../compte/presentation/modeles-de-vue/section-compte';
import type { IssueMiseAJour } from '../synchronisation/application/ports/mise-a-jour-application';
import {
  construireBandeau,
  type ModeleVueBandeau,
} from '../synchronisation/presentation/modeles-de-vue/bandeau';
import {
  construireChoixRestauration,
  construireConfirmationRepartirDeZero,
  construireTextesChoixRestauration,
  type ConfirmationRepartirDeZero,
  type ModeleVueChoixRestauration,
  type TextesChoixRestauration,
} from '../synchronisation/presentation/modeles-de-vue/choix-restauration';
import {
  construireIndicateur,
  type ModeleVueIndicateur,
} from '../synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import {
  construireModificationsNonRetenues,
  type ModeleVueModificationsNonRetenues,
} from '../synchronisation/presentation/modeles-de-vue/modifications-non-retenues';
import {
  construireFeuilleSynchronisation,
  type ActionCarteFeuille,
  type ModeleVueFeuilleSynchronisation,
} from '../synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { comparerHlc, type Hlc } from '../synchronisation/domaine/hlc';
import type { Application } from './application';
import type { ObjectifsTaches } from './objectifs-taches';

/**
 * Toasts : geste refusé pendant une saisie (guide §6.6.6) ; espace local inaccessible (ST §8 n° 12, ERR-014) ;
 * restauration demandée exécutée par cet appareil (ST-US-017 v0.10 §6.7 n° 9).
 */
export type ToastInterface =
  'TST-SAISIE-A-TERMINER' | 'TST-ERREUR-ENREGISTREMENT' | 'TST-RESTAUREE';

/** Ce que le contrôleur utilise de l'application assemblée. */
export type ApplicationInterface = Pick<
  Application,
  | 'session'
  | 'consulterEtat'
  | 'seConnecter'
  | 'reprendreSession'
  | 'seDeconnecter'
  | 'supprimerDonnees'
  | 'masquage'
  | 'lireElementsEnAttente'
  | 'lireDernierContact'
  | 'lireModificationsNonRetenues'
  | 'marquerCommeLue'
  | 'synchroniserMaintenant'
  | 'observerSynchronisation'
  | 'ouvrirGoogleDrive'
  | 'lireChoixRestauration'
  | 'lireRestaurationFaiteIci'
  | 'demanderRestauration'
  | 'annulerRestauration'
  | 'evaluerRepartirDeZero'
  | 'repartirDeZero'
  | 'lireCorrectionHorloge'
  | 'mettreAJour'
  | 'etatPersistance'
  | 'lireCoordination'
>;

/** État de synchronisation lu sur l'espace ouvert. */
type EtatLu = NonNullable<Awaited<ReturnType<ApplicationInterface['consulterEtat']>>>;

/** Choix d'`ERR-012` : modèle de vue et textes (la mention de la demande dépend du réseau). */
export type ChoixRestaurationAffichable = {
  readonly vue: ModeleVueChoixRestauration;
  readonly textes: TextesChoixRestauration;
};

const estEchecEcritureLocale = (r: Resultat<unknown, { readonly type: string }>): boolean =>
  !r.ok && r.erreur.type === 'EcritureLocaleImpossible';

const estEspaceInaccessible = (r: Resultat<unknown, { readonly type: string }>): boolean =>
  !r.ok && r.erreur.type === 'EspaceInaccessible';

// État d'écran du rang 1 (ECR-010, section « Compte » d'ECR-011, indicateur, bandeau, confirmations, ERR-017),
// recalculé à chaque changement de session ou de réseau, lu par l'interface (useSyncExternalStore).
export type VueInterface = {
  readonly racine: ModeleVueRacine;
  readonly connexion: ModeleVueConnexion;
  readonly compte?: ModeleVueSectionCompte;
  readonly indicateur?: ModeleVueIndicateur;
  /** Section « Synchronisation » d'ECR-011 ; présente avec l'indicateur (espace ouvert). */
  readonly feuille?: ModeleVueFeuilleSynchronisation;
  /** Section « À lire » d'ECR-011, en tête de la feuille ; absente s'il n'y a rien à lire (I2-21). */
  readonly nonRetenues?: ModeleVueModificationsNonRetenues;
  /** Jour de référence des dates de la section « À lire » (année affichée si elle diffère, guide §6.6.1). */
  readonly aujourdhui?: DateCalendaire;
  /** Choix d'`ERR-012` (carte de la feuille et feuille de choix) ; absent sans `DONNEES_ABSENTES`. */
  readonly choixRestauration?: ChoixRestaurationAffichable;
  readonly bandeau?: ModeleVueBandeau;
  /**
   * RG-058 (ST-US-017 v0.11 §6.8 n° 9) : le cycle constate un format plus récent ; la saisie est bloquée. Faux sans
   * espace ouvert.
   */
  readonly consultationSeule: boolean;
  /** Issue de la dernière action « Mettre à jour » (n° 10), effacée au rafraîchissement suivant. */
  readonly miseAJour?: IssueMiseAJour;
  readonly confirmation?: ModeleVueConfirmationCompte;
  readonly suppressionBloquee?: { readonly enCours: boolean };
  readonly toast?: ToastInterface;
};

type Etat = {
  dernierEchec?: MotifEchecConnexion;
  enCours: boolean;
  confirmation?: { readonly vue: ConfirmationCompte; readonly suite: () => Promise<void> };
  suppressionBloquee?: { enCours: boolean };
  toast?: ToastInterface;
  /** Issue de « Mettre à jour », lue une fois par la prochaine vue calculée. */
  miseAJour?: IssueMiseAJour;
  /** Un service worker plus récent attend (`ALR-016`) ; jamais mémorisé : remis à faux par le rechargement. */
  nouvelleVersion: boolean;
  /** « Décider plus tard » choisi pendant cette ouverture d'`ERR-012` (remis à faux quand `ERR-012` disparaît). */
  decisionReportee: boolean;
  /** Présent tant qu'`ERR-012` est affiché : restauration connue faite ici avant le choix (base du toast `TST-RESTAUREE`). */
  choixAffiche?: { readonly restaureeIci: Hlc | undefined };
  /** Geste à rejouer par le bouton « Réessayer » du toast ERR-014 (DT-007). */
  reessai?: () => Promise<void>;
};

export class ControleurInterface {
  #vue: VueInterface;
  readonly #etat: Etat = { enCours: false, decisionReportee: false, nouvelleVersion: false };
  readonly #observateurs = new Set<() => void>();
  readonly #rafraichissements = new Set<Promise<void>>();
  /** Numéro du dernier calcul de vue lancé : seul celui-là publie (ANO-006, ST-US-031 §6.7). */
  #dernierCalcul = 0;

  constructor(
    private readonly application: ApplicationInterface,
    private readonly horloge: Horloge,
    /** Cas d'usage des objectifs de l'espace ouvert ; undefined sans session (ST-US-001 §3 n° 34). */
    readonly objectifs: () => ObjectifsTaches | undefined = () => undefined,
  ) {
    this.#vue = {
      racine: { ecran: 'CONNEXION' },
      connexion: this.#connexion(),
      consultationSeule: false,
    };
    application.session.observer(() => void this.rafraichir());
    application.observerSynchronisation(() => void this.rafraichir());
  }

  readonly vue = (): VueInterface => this.#vue;

  readonly observer = (rappel: () => void): Annulation => {
    this.#observateurs.add(rappel);
    return () => {
      this.#observateurs.delete(rappel);
    };
  };

  /**
   * Pour le banc (ANO-001, ST-US-017 v0.4.3 §6.9, §12.4), comme `CycleSynchronisation.cycleEnCours` : se résout quand
   * aucun rafraîchissement n'est en cours, y compris ceux lancés pendant l'attente.
   */
  readonly rafraichissementsTermines = async (): Promise<void> => {
    while (this.#rafraichissements.size > 0) await Promise.allSettled([...this.#rafraichissements]);
  };

  async rafraichir(): Promise<void> {
    const calcul = this.#calculerVue();
    this.#rafraichissements.add(calcul);
    try {
      await calcul;
    } finally {
      this.#rafraichissements.delete(calcul);
    }
  }

  async #calculerVue(): Promise<void> {
    const numero = ++this.#dernierCalcul;
    const session = this.application.session.etat();
    const etatSynchro = await this.application.consulterEtat();
    if (etatSynchro === undefined) this.#oublierChoixRestauration();
    const synchronisation =
      etatSynchro === undefined ? {} : await this.#synchronisation(etatSynchro);
    if (numero !== this.#dernierCalcul) return;
    const { confirmation, suppressionBloquee, toast } = this.#etat;
    this.#vue = {
      racine: construireRacine(session),
      connexion: this.#connexion(),
      consultationSeule: etatSynchro?.actionRequise === 'FORMAT_PLUS_RECENT',
      ...this.#sectionCompte(session),
      ...this.#retirerMiseAJour(),
      ...synchronisation,
      ...(confirmation === undefined
        ? {}
        : { confirmation: construireConfirmationCompte(confirmation.vue) }),
      ...(suppressionBloquee === undefined
        ? {}
        : { suppressionBloquee: { ...suppressionBloquee } }),
      ...(toast === undefined ? {} : { toast }),
    };
    this.#observateurs.forEach((rappel) => {
      rappel();
    });
  }

  /** Section « Compte » (adresse, ligne « Fuseau » si l'appareil n'est pas à l'heure de Paris, RG-054). */
  #sectionCompte(session: EtatSession): Pick<VueInterface, 'compte'> {
    if (session.type !== 'OUVERTE') return {};
    return {
      compte: construireSectionCompte({
        adresse: session.identite.adresse,
        fuseauAppareil: this.horloge.fuseauAppareil(),
      }),
    };
  }

  /** Issue de « Mettre à jour » : portée par une seule vue, effacée au rafraîchissement suivant (n° 10). */
  #retirerMiseAJour(): Pick<VueInterface, 'miseAJour'> {
    const { miseAJour } = this.#etat;
    delete this.#etat.miseAJour;
    return miseAJour === undefined ? {} : { miseAJour };
  }

  /**
   * Issue de l'ouverture (ST-US-022 v0.3.2 §8 n° 12, RC-US022-10) : sur ESPACE_INACCESSIBLE, toast
   * TST-ERREUR-ENREGISTREMENT (ERR-014), effacé au geste suivant ; pour toute autre issue, aucun toast ; puis rafraichir().
   */
  readonly apresOuverture = async (
    issue: IssueOuverture,
    rouvrir?: () => Promise<IssueOuverture>,
  ): Promise<void> => {
    if (issue.type === 'ESPACE_INACCESSIBLE') {
      this.#etat.toast = 'TST-ERREUR-ENREGISTREMENT';
      if (rouvrir !== undefined) {
        this.#etat.reessai = async () => {
          await this.apresOuverture(await rouvrir(), rouvrir);
        };
      }
    }
    await this.rafraichir();
  };

  /** Bouton « Réessayer » du toast ERR-014 (DT-007) : rejoue le dernier geste échoué ; sans objet sinon. */
  readonly reessayer = async (): Promise<void> => {
    const rejeu = this.#etat.reessai;
    if (rejeu === undefined) return;
    this.#effacerToast();
    await rejeu();
  };

  readonly continuerAvecGoogle = async (): Promise<void> => {
    this.#etat.enCours = true;
    this.#effacerToast();
    await this.rafraichir();
    const r = await this.application.seConnecter.executer();
    this.#etat.enCours = false;
    delete this.#etat.dernierEchec;
    if (!r.ok && r.erreur.type === 'ConnexionImpossible') this.#etat.dernierEchec = r.erreur.motif;
    this.#signalerEspaceInaccessible(r);
    this.#permettreReessai(this.continuerAvecGoogle);
    await this.rafraichir();
  };

  readonly reprendre = async (): Promise<void> => {
    const r = await this.application.reprendreSession.executer(REPRISE_ACCUEIL);
    const toast = r.ok ? construireRetourReprise(r.valeur).toast : undefined;
    if (toast === undefined) this.#effacerToast();
    else this.#etat.toast = toast;
    await this.rafraichir();
  };

  readonly actionCompte = async (action: ActionCompte): Promise<void> => {
    this.#effacerToast();
    if (action === 'SE_DECONNECTER') await this.#seDeconnecter();
    else await this.#demanderSuppression();
    await this.rafraichir();
  };

  readonly confirmer = async (): Promise<void> => {
    const suite = this.#etat.confirmation?.suite;
    delete this.#etat.confirmation;
    this.#effacerToast();
    if (suite !== undefined) await this.#jouerSuite(suite);
    await this.rafraichir();
  };

  readonly annuler = async (): Promise<void> => {
    delete this.#etat.confirmation;
    await this.rafraichir();
  };

  readonly reessayerSuppression = async (): Promise<void> => {
    this.#etat.suppressionBloquee = { enCours: true };
    this.#effacerToast();
    await this.rafraichir();
    this.#apresSuppression(await this.application.supprimerDonnees.reessayer());
    this.#permettreReessai(this.reessayerSuppression);
    await this.rafraichir();
  };

  readonly allerALaConnexion = async (): Promise<void> => {
    delete this.#etat.suppressionBloquee;
    await this.application.supprimerDonnees.fermerApresBlocage();
    await this.rafraichir();
  };

  readonly masquerRappel = async (): Promise<void> => {
    this.application.masquage.masquer();
    await this.rafraichir();
  };

  /** Bouton « Synchroniser maintenant » de la feuille ; la vue suit les notifications du cycle. */
  readonly synchroniser = async (): Promise<void> => {
    await this.application.synchroniserMaintenant();
    await this.rafraichir();
  };

  /**
   * « Compris » sur une ligne, ou sur la carte `ALR-008` (toutes ses lignes). Un échec d'écriture locale n'est jamais
   * silencieux : toast ERR-014, « Réessayer » rejoue le geste.
   */
  readonly marquerCommeLue = async (ids: ReadonlyArray<IdValeurEcartee>): Promise<void> => {
    this.#effacerToast();
    const r = await this.application.marquerCommeLue(ids);
    if (!r.ok) {
      this.#etat.toast = 'TST-ERREUR-ENREGISTREMENT';
      this.#etat.reessai = () => this.marquerCommeLue(ids);
    }
    await this.rafraichir();
  };

  readonly actionCarte = async (action: ActionCarteFeuille): Promise<void> => {
    switch (action) {
      case 'OUVRIR_GOOGLE_DRIVE':
        this.application.ouvrirGoogleDrive();
        return;
      case 'REESSAYER_MAINTENANT':
        await this.synchroniser();
        return;
      case 'METTRE_A_JOUR':
        await this.mettreAJour();
        return;
      default:
        assertNever(action);
    }
  };

  /** Action du bandeau : reconnexion ou reprise passent par `reprendre`, « Mettre à jour » par `mettreAJour`. */
  readonly actionBandeau = async (
    action: NonNullable<ModeleVueBandeau['action']>,
  ): Promise<void> => {
    if (action === 'METTRE_A_JOUR') await this.mettreAJour();
    else await this.reprendre();
  };

  /**
   * ST-US-018 §6.1 n° 5 : une version plus récente attend. Seule l'invite `ALR-016` de la feuille en témoigne : aucun
   * toast, aucun bandeau, aucun rechargement sans le geste « Mettre à jour ».
   */
  readonly signalerNouvelleVersion = (): void => {
    this.#etat.nouvelleVersion = true;
    void this.rafraichir();
  };

  /** « Mettre à jour » (RG-058, n° 10) : l'issue s'affiche sous le bandeau ou la carte ; jamais de toast. */
  readonly mettreAJour = async (): Promise<void> => {
    this.#etat.miseAJour = await this.application.mettreAJour();
    await this.rafraichir();
  };

  /** « Restaurer mes données » : mémorisée, exécutée par le cycle ; un échec d'écriture locale est signalé (ERR-014). */
  readonly demanderRestauration = async (): Promise<void> => {
    this.#effacerToast();
    const r = await this.application.demanderRestauration();
    this.#signalerEcritureLocale(r, this.demanderRestauration);
    await this.rafraichir();
  };

  /** « Annuler la demande » : sans confirmation ni toast (rien n'est perdu). */
  readonly annulerRestauration = async (): Promise<void> => {
    this.#effacerToast();
    const r = await this.application.annulerRestauration();
    this.#signalerEcritureLocale(r, this.annulerRestauration);
    await this.rafraichir();
  };

  /** « Repartir de zéro… » : la confirmation à afficher, ou `undefined` si le choix n'a plus d'objet (vue rafraîchie). */
  readonly evaluerRepartirDeZero = async (): Promise<ConfirmationRepartirDeZero | undefined> => {
    const r = await this.application.evaluerRepartirDeZero();
    if (r.ok) return construireConfirmationRepartirDeZero(r.valeur.n);
    await this.rafraichir();
    return undefined;
  };

  /** « Repartir de zéro » confirmé ; un refus ou un échec laisse `ERR-012` affiché, rien n'est effacé localement. */
  readonly repartirDeZero = async (): Promise<void> => {
    this.#effacerToast();
    const r = await this.application.repartirDeZero();
    this.#signalerEcritureLocale(r, this.repartirDeZero);
    await this.rafraichir();
  };

  /** « Décider plus tard », « Fermer » et Échap sur la feuille de choix : rien n'est écrit. */
  readonly deciderPlusTard = async (): Promise<void> => {
    this.#etat.decisionReportee = true;
    await this.rafraichir();
  };

  #signalerEcritureLocale(
    r: Resultat<unknown, { readonly type: string }>,
    rejeu: () => Promise<void>,
  ): void {
    if (!estEchecEcritureLocale(r)) return;
    this.#etat.toast = 'TST-ERREUR-ENREGISTREMENT';
    this.#etat.reessai = rejeu;
  }

  #connexion(): ModeleVueConnexion {
    const { dernierEchec, enCours } = this.#etat;
    return construireEcranConnexion(
      dernierEchec === undefined ? { enCours } : { dernierEchec, enCours },
    );
  }

  async #synchronisation(
    etat: EtatLu,
  ): Promise<
    Pick<
      VueInterface,
      'indicateur' | 'bandeau' | 'feuille' | 'nonRetenues' | 'aujourdhui' | 'choixRestauration'
    >
  > {
    const maintenant = this.horloge.maintenant();
    const bandeau = construireBandeau(etat, maintenant);
    const feuille = await this.#feuille(etat, maintenant);
    const lu = await this.application.lireModificationsNonRetenues();
    const nonRetenues =
      lu === undefined ? undefined : construireModificationsNonRetenues(lu.valeurs);
    const choixRestauration = await this.#choixRestauration(etat, maintenant);
    return {
      indicateur: construireIndicateur(etat),
      feuille,
      aujourdhui: jourDeReference(maintenant),
      ...(choixRestauration === undefined ? {} : { choixRestauration }),
      ...(nonRetenues === undefined ? {} : { nonRetenues }),
      ...(bandeau === undefined ? {} : { bandeau }),
    };
  }

  /** Section « Synchronisation » d'ECR-011 : dernier échange, éléments en attente, correction d'horloge (`ALR-001`), stockage (`ALR-015`). */
  async #feuille(etat: EtatLu, maintenant: Instant): Promise<ModeleVueFeuilleSynchronisation> {
    const dernierEchange = await this.application.lireDernierContact();
    const correctionHorloge = await this.application.lireCorrectionHorloge();
    // ST-US-031 §6.3 : relue à chaque calcul de la vue (la ligne `SYN-FEUILLE-AUTRE-ONGLET` suit le rôle de l'onglet).
    const coordination = await this.application.lireCoordination();
    return construireFeuilleSynchronisation({
      etat,
      maintenant,
      ...(dernierEchange === undefined ? {} : { dernierEchange }),
      ...(correctionHorloge === undefined ? {} : { correctionHorloge }),
      ...(coordination === undefined ? {} : { coordination }),
      persistance: await this.application.etatPersistance(),
      nouvelleVersion: this.#etat.nouvelleVersion,
      elementsEnAttente: await this.application.lireElementsEnAttente(),
    });
  }

  /** Choix d'`ERR-012` tant que `DONNEES_ABSENTES` ; à sa disparition, `TST-RESTAUREE` si cet appareil a restauré. */
  async #choixRestauration(
    etat: EtatLu,
    maintenant: Instant,
  ): Promise<ChoixRestaurationAffichable | undefined> {
    if (etat.actionRequise !== 'DONNEES_ABSENTES') {
      await this.#cloreChoixRestauration();
      return undefined;
    }
    const lu = await this.application.lireChoixRestauration();
    if (lu === undefined) return undefined;
    this.#etat.choixAffiche ??= { restaureeIci: await this.application.lireRestaurationFaiteIci() };
    const vue = construireChoixRestauration({
      etat,
      ...lu,
      decisionReportee: this.#etat.decisionReportee,
      maintenant,
    });
    return vue === undefined
      ? undefined
      : { vue, textes: construireTextesChoixRestauration(etat.reseau) };
  }

  /** Sans espace ouvert : le choix en cours d'un compte ne se reporte pas sur le suivant. */
  #oublierChoixRestauration(): void {
    this.#etat.decisionReportee = false;
    delete this.#etat.choixAffiche;
  }

  /**
   * `ERR-012` n'est plus affiché : « Décider plus tard » est oublié ; toast `TST-RESTAUREE` si la restauration connue
   * a changé et vient de cet appareil (pas de toast quand l'autre appareil a restauré, ni quand « repartir de zéro »
   * l'emporte : ST-US-017 v0.10 §6.7 n° 9, guide §6.6.6).
   */
  async #cloreChoixRestauration(): Promise<void> {
    const avant = this.#etat.choixAffiche;
    this.#etat.decisionReportee = false;
    if (avant === undefined) return;
    delete this.#etat.choixAffiche;
    const apres = await this.application.lireRestaurationFaiteIci();
    if (apres === undefined) return;
    if (avant.restaureeIci === undefined || comparerHlc(apres, avant.restaureeIci) !== 0) {
      this.#etat.toast = 'TST-RESTAUREE';
    }
  }

  async #seDeconnecter(): Promise<void> {
    const deconnexion = this.application.seDeconnecter;
    const evaluation = await deconnexion.evaluer();
    if (!evaluation.ok) return;
    if (evaluation.valeur.type === 'SANS_CONFIRMATION') {
      await deconnexion.executer();
      return;
    }
    this.#etat.confirmation = {
      vue: evaluation.valeur.confirmation,
      suite: async () => {
        await deconnexion.executer();
      },
    };
  }

  async #demanderSuppression(): Promise<void> {
    const suppression = this.application.supprimerDonnees;
    const evaluation = await suppression.evaluer();
    if (!evaluation.ok || evaluation.valeur.type !== 'CONFIRMATION_REQUISE') return;
    this.#etat.confirmation = {
      vue: evaluation.valeur.confirmation,
      suite: async () => {
        this.#apresSuppression(await suppression.confirmer());
      },
    };
  }

  /** ST §8 n° 12 : jamais d'échec silencieux ; le toast s'affiche sur l'écran courant. */
  #signalerEspaceInaccessible(r: Resultat<unknown, { readonly type: string }>): void {
    if (estEspaceInaccessible(r)) this.#etat.toast = 'TST-ERREUR-ENREGISTREMENT';
  }

  /** Si le geste vient d'échouer sur l'espace local (ERR-014), « Réessayer » le rejoue. */
  #permettreReessai(rejeu: () => Promise<void>): void {
    if (this.#etat.toast === 'TST-ERREUR-ENREGISTREMENT') this.#etat.reessai = rejeu;
  }

  #effacerToast(): void {
    delete this.#etat.toast;
    delete this.#etat.reessai;
  }

  /** Joue la suite d'une confirmation ; si l'espace est inaccessible, « Réessayer » la rejoue. */
  async #jouerSuite(suite: () => Promise<void>): Promise<void> {
    await suite();
    this.#permettreReessai(async () => {
      await this.#jouerSuite(suite);
      await this.rafraichir();
    });
  }

  #apresSuppression(r: Resultat<IssueSuppression, { readonly type: string }>): void {
    delete this.#etat.suppressionBloquee;
    this.#signalerEspaceInaccessible(r);
    if (!r.ok) return;
    if (r.valeur.type === 'SUPPRESSION_BLOQUEE') this.#etat.suppressionBloquee = { enCours: false };
    if (r.valeur.type === 'CONFIRMATION_REQUISE') {
      const suppression = this.application.supprimerDonnees;
      this.#etat.confirmation = {
        vue: r.valeur.confirmation,
        suite: async () => {
          this.#apresSuppression(await suppression.confirmerPerte());
        },
      };
    }
  }
}
