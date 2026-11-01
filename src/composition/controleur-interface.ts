import type { Horloge } from '../commun/application/ports/horloge';
import type { IdValeurEcartee } from '../synchronisation/domaine/valeurs-ecartees';
import type { Annulation } from '../commun/application/ports/planificateur';
import { jourDeReference } from '../commun/domaine/temps/jour-de-reference';
import type { DateCalendaire } from '../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../commun/domaine/resultat';
import type { IssueOuverture } from '../compte/application/cas-usage/ouvrir-application';
import type { IssueSuppression } from '../compte/application/cas-usage/supprimer-donnees-appareil';
import type { ConfirmationCompte } from '../compte/application/evaluation';
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
import {
  construireBandeau,
  type ModeleVueBandeau,
} from '../synchronisation/presentation/modeles-de-vue/bandeau';
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
import type { Application } from './application';
import type { ObjectifsTaches } from './objectifs-taches';

/** Toasts du rang 1 : geste refusé pendant une saisie (guide §6.6.6) ; espace local inaccessible (ST §8 n° 12, ERR-014). */
export type ToastInterface = 'TST-SAISIE-A-TERMINER' | 'TST-ERREUR-ENREGISTREMENT';

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
>;

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
  readonly bandeau?: ModeleVueBandeau;
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
  /** Geste à rejouer par le bouton « Réessayer » du toast ERR-014 (DT-007). */
  reessai?: () => Promise<void>;
};

export class ControleurInterface {
  #vue: VueInterface;
  readonly #etat: Etat = { enCours: false };
  readonly #observateurs = new Set<() => void>();
  readonly #rafraichissements = new Set<Promise<void>>();

  constructor(
    private readonly application: ApplicationInterface,
    private readonly horloge: Horloge,
    /** Cas d'usage des objectifs de l'espace ouvert ; undefined sans session (ST-US-001 §3 n° 34). */
    readonly objectifs: () => ObjectifsTaches | undefined = () => undefined,
  ) {
    this.#vue = { racine: { ecran: 'CONNEXION' }, connexion: this.#connexion() };
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
    const session = this.application.session.etat();
    const etatSynchro = await this.application.consulterEtat();
    const { confirmation, suppressionBloquee, toast } = this.#etat;
    this.#vue = {
      racine: construireRacine(session),
      connexion: this.#connexion(),
      ...(session.type === 'OUVERTE'
        ? { compte: construireSectionCompte({ adresse: session.identite.adresse }) }
        : {}),
      ...(etatSynchro === undefined ? {} : await this.#synchronisation(etatSynchro)),
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
  readonly marquerCommeLue = async (ids: ReadonlyArray<string>): Promise<void> => {
    this.#effacerToast();
    // Les identifiants viennent du modèle de vue, qui les élargit en `string` (ils ne sont jamais saisis).
    const r = await this.application.marquerCommeLue(ids as ReadonlyArray<IdValeurEcartee>);
    if (!r.ok) {
      this.#etat.toast = 'TST-ERREUR-ENREGISTREMENT';
      this.#etat.reessai = () => this.marquerCommeLue(ids);
    }
    await this.rafraichir();
  };

  readonly actionCarte = async (action: ActionCarteFeuille): Promise<void> => {
    if (action === 'OUVRIR_GOOGLE_DRIVE') this.application.ouvrirGoogleDrive();
    else await this.synchroniser();
  };

  #connexion(): ModeleVueConnexion {
    const { dernierEchec, enCours } = this.#etat;
    return construireEcranConnexion(
      dernierEchec === undefined ? { enCours } : { dernierEchec, enCours },
    );
  }

  async #synchronisation(
    etat: NonNullable<Awaited<ReturnType<ApplicationInterface['consulterEtat']>>>,
  ): Promise<
    Pick<VueInterface, 'indicateur' | 'bandeau' | 'feuille' | 'nonRetenues' | 'aujourdhui'>
  > {
    const maintenant = this.horloge.maintenant();
    const bandeau = construireBandeau(etat, maintenant);
    const dernierEchange = await this.application.lireDernierContact();
    const feuille = construireFeuilleSynchronisation({
      etat,
      maintenant,
      ...(dernierEchange === undefined ? {} : { dernierEchange }),
      elementsEnAttente: await this.application.lireElementsEnAttente(),
    });
    const lu = await this.application.lireModificationsNonRetenues();
    const nonRetenues =
      lu === undefined ? undefined : construireModificationsNonRetenues(lu.valeurs);
    return {
      indicateur: construireIndicateur(etat),
      feuille,
      aujourdhui: jourDeReference(maintenant),
      ...(nonRetenues === undefined ? {} : { nonRetenues }),
      ...(bandeau === undefined ? {} : { bandeau }),
    };
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
