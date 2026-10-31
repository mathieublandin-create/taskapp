import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Horloge } from '../../../../commun/application/ports/horloge';
import type { Annulation, Planificateur } from '../../../../commun/application/ports/planificateur';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import type { Resultat } from '../../../../commun/domaine/resultat';
import { EcartTemps } from '../../../../commun/domaine/temps/ecart-temps';
import type { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import type { ErreurDepotLocal } from '../../../../synchronisation';
import type {
  CreerSousTache,
  EntreeCreerSousTache,
} from '../../../application/cas-usage/creer-sous-tache';
import type { CreerTache } from '../../../application/cas-usage/creer-tache';
import type {
  ModifierDelaiTache,
  ModifierEstimationTache,
  RenommerTache,
} from '../../../application/cas-usage/modifier-tache';
import type { DetacherTache, RattacherTache } from '../../../application/cas-usage/rattacher-tache';
import type { RouvrirTache } from '../../../application/cas-usage/rouvrir-tache';
import type { SupprimerTache } from '../../../application/cas-usage/supprimer-tache';
import type { TerminerTache } from '../../../application/cas-usage/terminer-tache';
import type { RefusMetier } from '../../../domaine/refus';
import type { ConsulterDetailTache } from '../../../application/requetes/consulter-detail-tache';
import type { ConsulterObjectifs } from '../../../application/requetes/consulter-objectifs';
import type { ConsulterTaches } from '../../../application/requetes/consulter-taches';
import {
  construireConfirmation,
  type ModeleVueConfirmation,
} from '../../modeles-de-vue/confirmation';
import {
  construireDetailTache,
  type ModeleVueDetailTache,
} from '../../modeles-de-vue/detail-tache';
import {
  construireListeTaches,
  FILTRE_ETAT_PAR_DEFAUT,
  type FiltreEtat,
  type FiltreObjectif,
  type ModeleVueListeTaches,
} from '../../modeles-de-vue/liste-taches';
import {
  construireFormulaireSousTache,
  type ModeleVueFormulaireSousTache,
} from '../../modeles-de-vue/formulaire-sous-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { estRefusMetier, issueDe } from './issues';

// Magasin Zustand des tâches (ST-US-002 §4.5) : modèles de vue courants, recalculés après chaque commande. Il ne
// porte que de l'état d'écran (filtres, écran ouvert, confirmation) ; toute règle métier reste dans les cas d'usage.

/** Ce que le magasin utilise des cas d'usage et requêtes assemblés par la composition. */
export type ServicesTaches = {
  readonly horloge: Horloge;
  readonly creerTache: CreerTache;
  readonly creerSousTache: CreerSousTache;
  readonly renommerTache: RenommerTache;
  readonly modifierDelaiTache: ModifierDelaiTache;
  readonly modifierEstimationTache: ModifierEstimationTache;
  readonly rattacherTache: RattacherTache;
  readonly detacherTache: DetacherTache;
  readonly supprimerTache: SupprimerTache;
  readonly terminerTache: TerminerTache;
  readonly rouvrirTache: RouvrirTache;
  readonly consulterTaches: ConsulterTaches;
  readonly consulterDetailTache: ConsulterDetailTache;
  readonly consulterObjectifs: ConsulterObjectifs;
  /** Changements du dépôt local (DT-009) : le magasin recalcule ses modèles de vue quel que soit l'écrivain. */
  readonly observer?: (rappel: () => void) => () => void;
  /** Maintien de la ligne d'une tâche terminée ; sans lui, elle quitte la liste « À faire » aussitôt. */
  readonly planificateur?: Planificateur;
};

/** Issue d'une saisie : faite, refusée avec des messages sous les champs, ou enregistrement impossible (ERR-014). */
export type IssueTache =
  | { readonly type: 'FAITE'; readonly id?: IdTache }
  | { readonly type: 'REFUSEE'; readonly messages: ReadonlyArray<MessageRefus> }
  | { readonly type: 'ENREGISTREMENT_IMPOSSIBLE' };

export type SaisieTacheUi = {
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly estimationMinutes?: number;
  readonly objectifIds: ReadonlyArray<IdObjectif>;
};

/** Saisie d'une sous-tâche : les objectifs sont ceux de la tâche parente (RG-023). */
export type SaisieSousTacheUi = Omit<SaisieTacheUi, 'objectifIds'>;

/**
 * Issue d'une saisie qui peut demander une confirmation (CNF-AJOUT-SOUS-TACHE-TERMINEE) : `confirmer` exécute alors la
 * commande évaluée, sans que l'écran connaisse la règle.
 */
export type IssueSaisie =
  | IssueTache
  | {
      readonly type: 'CONFIRMATION_REQUISE';
      readonly confirmation: ModeleVueConfirmation;
      readonly confirmer: () => Promise<IssueTache>;
    };

/** Durée pendant laquelle une tâche qui vient d'être terminée reste dans la liste « À faire » (ST-US-003 §4.5). */
const DUREE_LIGNE_TERMINEE = EcartTemps.depuisMillisecondes(3000);

export type EcranTaches =
  { readonly type: 'LISTE' } | { readonly type: 'DETAIL'; readonly id: IdTache };

export type ObjectifProposable = { readonly id: IdObjectif; readonly intitule: string };

export type EtatMagasinTaches = {
  readonly ecran: EcranTaches;
  readonly filtreEtat: FiltreEtat;
  readonly filtreObjectif: FiltreObjectif;
  readonly liste?: ModeleVueListeTaches;
  readonly detail?: ModeleVueDetailTache | undefined;
  /** Saisie d'une sous-tâche de la tâche du détail (ECR-007 I) ; absent si la tâche ne peut pas en recevoir. */
  readonly formulaireSousTache?: ModeleVueFormulaireSousTache | undefined;
  /** Tous les objectifs actifs : puces de rattachement de la saisie et filtre de la liste. */
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  /** Confirmation de suppression en attente (CNF-SUPPR-TACHE). */
  readonly confirmation?: ModeleVueConfirmation | undefined;
  /** Tâches terminées il y a moins de 3 s : leur ligne reste affichée, case cochée, dans le filtre « À faire ». */
  readonly termineesRecentes: ReadonlyArray<IdTache>;
  /** Dernière tâche terminée, que le toast TST-TERMINEE permet de rouvrir (« Annuler »). */
  readonly finAnnulable?: IdTache | undefined;
  /** Vrai après un échec d'écriture ou de lecture locale : toast ERR-014. */
  readonly erreurEnregistrement: boolean;
  readonly actions: ActionsMagasinTaches;
};

export type ActionsMagasinTaches = {
  readonly afficherListe: () => Promise<void>;
  readonly filtrerEtat: (etat: FiltreEtat) => Promise<void>;
  readonly filtrerObjectif: (filtre: FiltreObjectif) => Promise<void>;
  readonly ouvrirDetail: (id: IdTache) => Promise<void>;
  /** Charge les objectifs proposés à la saisie. */
  readonly chargerObjectifs: () => Promise<void>;
  readonly creer: (saisie: SaisieTacheUi) => Promise<IssueTache>;
  readonly creerSousTache: (parenteId: IdTache, saisie: SaisieSousTacheUi) => Promise<IssueSaisie>;
  readonly renommer: (id: IdTache, intitule: string) => Promise<IssueTache>;
  readonly modifierDelai: (id: IdTache, delai: DateCalendaire) => Promise<IssueTache>;
  readonly modifierEstimation: (id: IdTache, minutes: number) => Promise<IssueTache>;
  readonly rattacher: (id: IdTache, objectifId: IdObjectif) => Promise<IssueTache>;
  readonly detacher: (id: IdTache, objectifId: IdObjectif) => Promise<IssueTache>;
  readonly demanderSuppression: (id: IdTache) => Promise<void>;
  readonly confirmerSuppression: () => Promise<void>;
  readonly annulerSuppression: () => void;
  /** Termine la tâche ; un refus (ERR-035) est rendu en issue, l'état reste inchangé. */
  readonly terminer: (id: IdTache) => Promise<IssueTache>;
  /** « Annuler » du toast TST-TERMINEE : rouvre la dernière tâche terminée. */
  readonly annulerFin: () => Promise<IssueTache>;
  /** Le toast TST-TERMINEE est fermé : la fin n'est plus annulable. */
  /** La fermeture d'un toast n'oublie que sa propre fin, pas celle d'une fin plus récente. */
  readonly oublierFin: (id: IdTache) => void;
  /** Rouvre la tâche ; `CONFIRMATION_REQUISE` (CNF-ROUVRIR-SOUS-TACHE) tant que l'utilisateur n'a pas confirmé. */
  readonly rouvrir: (id: IdTache) => Promise<IssueSaisie>;
  /** Commence à observer le dépôt local (DT-009) et rend la fonction qui cesse de l'observer (démontage). */
  readonly observerDepot: () => () => void;
};

export type MagasinTaches = StoreApi<EtatMagasinTaches>;

type Ecrire = MagasinTaches['setState'];
type Lire = MagasinTaches['getState'];

/** Actions de l'écran : chacune lit ou écrit par les cas d'usage, puis recalcule les modèles de vue. */
class ActionsTaches implements ActionsMagasinTaches {
  constructor(
    private readonly services: ServicesTaches,
    private readonly ecrire: Ecrire,
    private readonly lire: Lire,
  ) {}

  #annulerMinuterie: Annulation | undefined;

  readonly #arreterMinuterie = (): void => {
    this.#annulerMinuterie?.();
    this.#annulerMinuterie = undefined;
  };

  readonly #chargerListe = async (): Promise<void> => {
    const lecture = await this.services.consulterTaches.executer();
    if (!lecture.ok) {
      this.ecrire({ erreurEnregistrement: true });
      return;
    }
    const { filtreEtat, filtreObjectif } = this.lire();
    this.#arreterMinuterie();
    this.ecrire({
      termineesRecentes: [],
      liste: construireListeTaches(
        lecture.valeur,
        { etat: filtreEtat, objectif: filtreObjectif },
        { horloge: this.services.horloge },
      ),
    });
  };

  /** Une tâche devenue introuvable (supprimée ailleurs) ramène à la liste. */
  readonly #chargerDetail = async (id: IdTache): Promise<void> => {
    const lecture = await this.services.consulterDetailTache.executer(id);
    if (lecture.ok) {
      const detail = construireDetailTache(lecture.valeur, { horloge: this.services.horloge });
      this.ecrire({
        detail,
        formulaireSousTache: detail.actions.includes('CREER_SOUS_TACHE')
          ? construireFormulaireSousTache(lecture.valeur)
          : undefined,
      });
    } else if (estRefusMetier(lecture.erreur)) {
      await this.afficherListe();
    } else {
      this.ecrire({ erreurEnregistrement: true });
    }
  };

  readonly #rafraichir = async (): Promise<void> => {
    await this.chargerObjectifs();
    const { ecran, termineesRecentes } = this.lire();
    // La ligne d'une tâche tout juste terminée reste 3 s : la minuterie recalcule ensuite la liste.
    if (ecran.type === 'LISTE' && termineesRecentes.length > 0) return;
    await (ecran.type === 'LISTE' ? this.#chargerListe() : this.#chargerDetail(ecran.id));
  };

  /** Après une commande réussie, les modèles de vue sont recalculés ; sur échec technique, ERR-014. */
  readonly #apres = async (issue: IssueTache): Promise<IssueTache> => {
    if (issue.type === 'FAITE') await this.#rafraichir();
    if (issue.type === 'ENREGISTREMENT_IMPOSSIBLE') this.ecrire({ erreurEnregistrement: true });
    return issue;
  };

  /** Le toast ERR-014 s'efface au geste suivant. */
  readonly #effacee =
    <A extends ReadonlyArray<unknown>, R>(commande: (...args: A) => Promise<R>) =>
    (...args: A): Promise<R> => {
      this.ecrire({ erreurEnregistrement: false });
      return commande(...args);
    };

  readonly chargerObjectifs = async (): Promise<void> => {
    const lecture = await this.services.consulterObjectifs.executer();
    if (lecture.ok) {
      this.ecrire({
        objectifs: lecture.valeur.objectifs.map(({ id, intitule }) => ({ id, intitule })),
      });
    }
  };

  readonly afficherListe = async (): Promise<void> => {
    this.ecrire({ ecran: { type: 'LISTE' }, erreurEnregistrement: false });
    await this.chargerObjectifs();
    await this.#chargerListe();
  };

  readonly filtrerEtat = async (etat: FiltreEtat): Promise<void> => {
    this.ecrire({ filtreEtat: etat });
    await this.#chargerListe();
  };

  readonly filtrerObjectif = async (filtre: FiltreObjectif): Promise<void> => {
    this.ecrire({ filtreObjectif: filtre });
    await this.#chargerListe();
  };

  readonly ouvrirDetail = async (id: IdTache): Promise<void> => {
    this.ecrire({
      ecran: { type: 'DETAIL', id },
      detail: undefined,
      formulaireSousTache: undefined,
      erreurEnregistrement: false,
    });
    await this.chargerObjectifs();
    await this.#chargerDetail(id);
  };

  /** Issue d'une création : faite avec l'identifiant créé, ou refusée ; les modèles de vue sont recalculés. */
  readonly #issueDeCreation = async (
    creation: Resultat<IdTache, RefusMetier | ErreurDepotLocal>,
  ): Promise<IssueTache> => {
    const issue = issueDe(creation);
    await this.#apres(issue);
    return creation.ok ? { type: 'FAITE', id: creation.valeur } : issue;
  };

  readonly creer = this.#effacee(async (saisie: SaisieTacheUi): Promise<IssueTache> =>
    this.#issueDeCreation(await this.services.creerTache.executer(saisie)),
  );

  /** `evaluer` d'abord (conventions.md §8.6) : une tâche parente terminée demande confirmation avant l'écriture. */
  readonly creerSousTache = this.#effacee(
    async (parenteId: IdTache, saisie: SaisieSousTacheUi): Promise<IssueSaisie> => {
      const entree: EntreeCreerSousTache = {
        tacheParenteId: parenteId,
        intitule: saisie.intitule,
        ...(saisie.delai === undefined ? {} : { delai: saisie.delai }),
        ...(saisie.estimationMinutes === undefined
          ? {}
          : { estimationMinutes: saisie.estimationMinutes }),
      };
      const evaluation = await this.services.creerSousTache.evaluer(entree);
      if (!evaluation.ok) return this.#apres(issueDe(evaluation));
      const executer = async (): Promise<IssueTache> =>
        this.#issueDeCreation(await this.services.creerSousTache.executer(entree));
      return evaluation.valeur.type === 'CONFIRMATION_REQUISE'
        ? {
            type: 'CONFIRMATION_REQUISE',
            confirmation: construireConfirmation(evaluation.valeur.confirmation),
            confirmer: executer,
          }
        : executer();
    },
  );

  readonly renommer = this.#effacee(async (id: IdTache, intitule: string) =>
    this.#apres(issueDe(await this.services.renommerTache.executer({ tacheId: id, intitule }))),
  );

  readonly modifierDelai = this.#effacee(async (id: IdTache, delai: DateCalendaire) =>
    this.#apres(issueDe(await this.services.modifierDelaiTache.executer({ tacheId: id, delai }))),
  );

  readonly modifierEstimation = this.#effacee(async (id: IdTache, minutes: number) =>
    this.#apres(
      issueDe(
        await this.services.modifierEstimationTache.executer({
          tacheId: id,
          estimationMinutes: minutes,
        }),
      ),
    ),
  );

  readonly rattacher = this.#effacee(async (id: IdTache, objectifId: IdObjectif) =>
    this.#apres(issueDe(await this.services.rattacherTache.executer({ tacheId: id, objectifId }))),
  );

  readonly detacher = this.#effacee(async (id: IdTache, objectifId: IdObjectif) =>
    this.#apres(issueDe(await this.services.detacherTache.executer({ tacheId: id, objectifId }))),
  );

  readonly demanderSuppression = this.#effacee(async (id: IdTache): Promise<void> => {
    const evaluation = await this.services.supprimerTache.evaluer({ tacheId: id });
    if (!evaluation.ok) {
      await this.#apres(issueDe(evaluation));
    } else if (evaluation.valeur.type === 'CONFIRMATION_REQUISE') {
      this.ecrire({ confirmation: construireConfirmation(evaluation.valeur.confirmation) });
    }
  });

  readonly confirmerSuppression = this.#effacee(async (): Promise<void> => {
    const { ecran } = this.lire();
    this.ecrire({ confirmation: undefined });
    if (ecran.type !== 'DETAIL') return;
    const suppression = await this.services.supprimerTache.executer({ tacheId: ecran.id });
    if (suppression.ok) await this.afficherListe();
    else await this.#apres(issueDe(suppression));
  });

  readonly annulerSuppression = (): void => {
    this.ecrire({ confirmation: undefined });
  };

  readonly #relacherLigneTerminee = async (): Promise<void> => {
    this.#arreterMinuterie();
    this.ecrire({ termineesRecentes: [] });
    await this.#rafraichir();
  };

  /** La liste « À faire » garde la ligne 3 s ; sinon (détail, autre filtre) les modèles de vue sont recalculés. */
  readonly #apresFin = async (id: IdTache): Promise<void> => {
    const { ecran, filtreEtat, termineesRecentes } = this.lire();
    this.ecrire({ finAnnulable: id });
    const { planificateur } = this.services;
    if (
      ecran.type !== 'LISTE' ||
      filtreEtat !== FILTRE_ETAT_PAR_DEFAUT ||
      planificateur === undefined
    ) {
      await this.#rafraichir();
      return;
    }
    this.#arreterMinuterie();
    this.ecrire({ termineesRecentes: [...termineesRecentes, id] });
    this.#annulerMinuterie = planificateur.apres(DUREE_LIGNE_TERMINEE, () => {
      void this.#relacherLigneTerminee();
    });
  };

  readonly terminer = this.#effacee(async (id: IdTache): Promise<IssueTache> => {
    const issue = issueDe(await this.services.terminerTache.executer({ tacheId: id }));
    if (issue.type === 'FAITE') await this.#apresFin(id);
    else await this.#apres(issue);
    // Refus sans message : l'action n'était plus proposée (modifiée ailleurs), l'écran se met à jour.
    if (issue.type === 'REFUSEE' && issue.messages.length === 0) await this.#rafraichir();
    return issue;
  });

  readonly annulerFin = this.#effacee(async (): Promise<IssueTache> => {
    const { finAnnulable } = this.lire();
    this.ecrire({ finAnnulable: undefined });
    if (finAnnulable === undefined) return { type: 'FAITE' };
    this.#arreterMinuterie();
    this.ecrire({ termineesRecentes: [] });
    return this.#apres(
      issueDe(await this.services.rouvrirTache.executer({ tacheId: finAnnulable })),
    );
  });

  readonly oublierFin = (id: IdTache): void => {
    if (this.lire().finAnnulable === id) this.ecrire({ finAnnulable: undefined });
  };

  /** `evaluer` d'abord (conventions.md §8.6) : la réouverture d'une sous-tâche sous une tâche terminée se confirme. */
  readonly rouvrir = this.#effacee(async (id: IdTache): Promise<IssueSaisie> => {
    this.ecrire({ finAnnulable: undefined });
    const evaluation = await this.services.rouvrirTache.evaluer({ tacheId: id });
    if (!evaluation.ok) return this.#apres(issueDe(evaluation));
    const executer = async (): Promise<IssueTache> =>
      this.#apres(issueDe(await this.services.rouvrirTache.executer({ tacheId: id })));
    return evaluation.valeur.type === 'CONFIRMATION_REQUISE'
      ? {
          type: 'CONFIRMATION_REQUISE',
          confirmation: construireConfirmation(evaluation.valeur.confirmation),
          confirmer: executer,
        }
      : executer();
  });

  /** DT-009 : une écriture d'un autre écrivain (fusion distante, autre onglet) rafraîchit l'écran courant. */
  readonly observerDepot = (): (() => void) =>
    this.services.observer?.(() => {
      void this.#rafraichir();
    }) ?? (() => undefined);
}

export const creerMagasinTaches = (services: ServicesTaches): MagasinTaches =>
  createStore<EtatMagasinTaches>((set, get) => ({
    ecran: { type: 'LISTE' },
    filtreEtat: FILTRE_ETAT_PAR_DEFAUT,
    filtreObjectif: { type: 'TOUS' },
    objectifs: [],
    termineesRecentes: [],
    erreurEnregistrement: false,
    actions: new ActionsTaches(services, set, get),
  }));
