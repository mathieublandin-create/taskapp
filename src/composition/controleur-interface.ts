import type { Horloge } from '../commun/application/ports/horloge';
import type { Annulation } from '../commun/application/ports/planificateur';
import type { Resultat } from '../commun/domaine/resultat';
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
import type { Application } from './application';

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
};

export class ControleurInterface {
  #vue: VueInterface;
  readonly #etat: Etat = { enCours: false };
  readonly #observateurs = new Set<() => void>();

  constructor(
    private readonly application: ApplicationInterface,
    private readonly horloge: Horloge,
  ) {
    this.#vue = { racine: { ecran: 'CONNEXION' }, connexion: this.#connexion() };
    application.session.observer(() => void this.rafraichir());
  }

  readonly vue = (): VueInterface => this.#vue;

  readonly observer = (rappel: () => void): Annulation => {
    this.#observateurs.add(rappel);
    return () => {
      this.#observateurs.delete(rappel);
    };
  };

  async rafraichir(): Promise<void> {
    const session = this.application.session.etat();
    const etatSynchro = await this.application.consulterEtat();
    const { confirmation, suppressionBloquee, toast } = this.#etat;
    this.#vue = {
      racine: construireRacine(session),
      connexion: this.#connexion(),
      ...(session.type === 'OUVERTE'
        ? { compte: construireSectionCompte({ adresse: session.identite.adresse }) }
        : {}),
      ...(etatSynchro === undefined ? {} : this.#synchronisation(etatSynchro)),
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

  readonly continuerAvecGoogle = async (): Promise<void> => {
    this.#etat.enCours = true;
    delete this.#etat.toast;
    await this.rafraichir();
    const r = await this.application.seConnecter.executer();
    this.#etat.enCours = false;
    delete this.#etat.dernierEchec;
    if (!r.ok && r.erreur.type === 'ConnexionImpossible') this.#etat.dernierEchec = r.erreur.motif;
    this.#signalerEspaceInaccessible(r);
    await this.rafraichir();
  };

  readonly reprendre = async (): Promise<void> => {
    const r = await this.application.reprendreSession.executer(REPRISE_ACCUEIL);
    const toast = r.ok ? construireRetourReprise(r.valeur).toast : undefined;
    if (toast === undefined) delete this.#etat.toast;
    else this.#etat.toast = toast;
    await this.rafraichir();
  };

  readonly actionCompte = async (action: ActionCompte): Promise<void> => {
    delete this.#etat.toast;
    if (action === 'SE_DECONNECTER') await this.#seDeconnecter();
    else await this.#demanderSuppression();
    await this.rafraichir();
  };

  readonly confirmer = async (): Promise<void> => {
    const suite = this.#etat.confirmation?.suite;
    delete this.#etat.confirmation;
    delete this.#etat.toast;
    await suite?.();
    await this.rafraichir();
  };

  readonly annuler = async (): Promise<void> => {
    delete this.#etat.confirmation;
    await this.rafraichir();
  };

  readonly reessayerSuppression = async (): Promise<void> => {
    this.#etat.suppressionBloquee = { enCours: true };
    delete this.#etat.toast;
    await this.rafraichir();
    this.#apresSuppression(await this.application.supprimerDonnees.reessayer());
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

  #connexion(): ModeleVueConnexion {
    const { dernierEchec, enCours } = this.#etat;
    return construireEcranConnexion(
      dernierEchec === undefined ? { enCours } : { dernierEchec, enCours },
    );
  }

  #synchronisation(
    etat: NonNullable<Awaited<ReturnType<ApplicationInterface['consulterEtat']>>>,
  ): Pick<VueInterface, 'indicateur' | 'bandeau'> {
    const bandeau = construireBandeau(etat, this.horloge.maintenant());
    return {
      indicateur: construireIndicateur(etat),
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
