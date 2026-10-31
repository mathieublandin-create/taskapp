import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Horloge } from '../../../../commun/application/ports/horloge';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import type { CreerTache } from '../../../application/cas-usage/creer-tache';
import type {
  ModifierDelaiTache,
  ModifierEstimationTache,
  RenommerTache,
} from '../../../application/cas-usage/modifier-tache';
import type { DetacherTache, RattacherTache } from '../../../application/cas-usage/rattacher-tache';
import type { SupprimerTache } from '../../../application/cas-usage/supprimer-tache';
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
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { estRefusMetier, issueDe } from './issues';

// Magasin Zustand des tâches (ST-US-002 §4.5) : modèles de vue courants, recalculés après chaque commande. Il ne
// porte que de l'état d'écran (filtres, écran ouvert, confirmation) ; toute règle métier reste dans les cas d'usage.

/** Ce que le magasin utilise des cas d'usage et requêtes assemblés par la composition. */
export type ServicesTaches = {
  readonly horloge: Horloge;
  readonly creerTache: CreerTache;
  readonly renommerTache: RenommerTache;
  readonly modifierDelaiTache: ModifierDelaiTache;
  readonly modifierEstimationTache: ModifierEstimationTache;
  readonly rattacherTache: RattacherTache;
  readonly detacherTache: DetacherTache;
  readonly supprimerTache: SupprimerTache;
  readonly consulterTaches: ConsulterTaches;
  readonly consulterDetailTache: ConsulterDetailTache;
  readonly consulterObjectifs: ConsulterObjectifs;
  /** Changements du dépôt local (DT-009) : le magasin recalcule ses modèles de vue quel que soit l'écrivain. */
  readonly observer?: (rappel: () => void) => () => void;
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

export type EcranTaches =
  { readonly type: 'LISTE' } | { readonly type: 'DETAIL'; readonly id: IdTache };

export type ObjectifProposable = { readonly id: IdObjectif; readonly intitule: string };

export type EtatMagasinTaches = {
  readonly ecran: EcranTaches;
  readonly filtreEtat: FiltreEtat;
  readonly filtreObjectif: FiltreObjectif;
  readonly liste?: ModeleVueListeTaches;
  readonly detail?: ModeleVueDetailTache | undefined;
  /** Tous les objectifs actifs : puces de rattachement de la saisie et filtre de la liste. */
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  /** Confirmation de suppression en attente (CNF-SUPPR-TACHE). */
  readonly confirmation?: ModeleVueConfirmation | undefined;
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
  readonly renommer: (id: IdTache, intitule: string) => Promise<IssueTache>;
  readonly modifierDelai: (id: IdTache, delai: DateCalendaire) => Promise<IssueTache>;
  readonly modifierEstimation: (id: IdTache, minutes: number) => Promise<IssueTache>;
  readonly rattacher: (id: IdTache, objectifId: IdObjectif) => Promise<IssueTache>;
  readonly detacher: (id: IdTache, objectifId: IdObjectif) => Promise<IssueTache>;
  readonly demanderSuppression: (id: IdTache) => Promise<void>;
  readonly confirmerSuppression: () => Promise<void>;
  readonly annulerSuppression: () => void;
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

  readonly #chargerListe = async (): Promise<void> => {
    const lecture = await this.services.consulterTaches.executer();
    if (!lecture.ok) {
      this.ecrire({ erreurEnregistrement: true });
      return;
    }
    const { filtreEtat, filtreObjectif } = this.lire();
    this.ecrire({
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
      this.ecrire({
        detail: construireDetailTache(lecture.valeur, { horloge: this.services.horloge }),
      });
    } else if (estRefusMetier(lecture.erreur)) {
      await this.afficherListe();
    } else {
      this.ecrire({ erreurEnregistrement: true });
    }
  };

  readonly #rafraichir = async (): Promise<void> => {
    await this.chargerObjectifs();
    const { ecran } = this.lire();
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
    this.ecrire({ ecran: { type: 'DETAIL', id }, detail: undefined, erreurEnregistrement: false });
    await this.chargerObjectifs();
    await this.#chargerDetail(id);
  };

  readonly creer = this.#effacee(async (saisie: SaisieTacheUi): Promise<IssueTache> => {
    const creation = await this.services.creerTache.executer(saisie);
    const issue = issueDe(creation);
    await this.#apres(issue);
    return creation.ok ? { type: 'FAITE', id: creation.valeur } : issue;
  });

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
    erreurEnregistrement: false,
    actions: new ActionsTaches(services, set, get),
  }));
