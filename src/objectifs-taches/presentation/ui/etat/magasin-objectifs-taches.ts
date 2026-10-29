import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Horloge } from '../../../../commun/application/ports/horloge';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import type { Resultat } from '../../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import type { ErreurDepotLocal } from '../../../../synchronisation';
import type { CreerObjectif } from '../../../application/cas-usage/creer-objectif';
import type {
  ModifierDelaiObjectif,
  ModifierDescriptionObjectif,
  RenommerObjectif,
  RetirerDelaiObjectif,
} from '../../../application/cas-usage/modifier-objectif';
import type { SupprimerObjectif } from '../../../application/cas-usage/supprimer-objectif';
import type { ConsulterDetailObjectif } from '../../../application/requetes/consulter-detail-objectif';
import type { ConsulterObjectifs } from '../../../application/requetes/consulter-objectifs';
import type { RefusMetier } from '../../../domaine/refus';
import {
  construireConfirmation,
  type ModeleVueConfirmation,
} from '../../modeles-de-vue/confirmation';
import {
  construireDetailObjectif,
  type ModeleVueDetailObjectif,
} from '../../modeles-de-vue/detail-objectif';
import {
  construireListeObjectifs,
  type ModeleVueListeObjectifs,
} from '../../modeles-de-vue/liste-objectifs';
import { messagesDeRefus, type MessageRefus } from '../../modeles-de-vue/messages-de-refus';

// Magasin Zustand des objectifs (ST-US-001 §3 n° 32) : modèles de vue courants, recalculés après chaque commande.
// Il ne porte que de l'état d'écran ; toute règle métier reste dans les cas d'usage.

/** Ce que le magasin utilise des cas d'usage et requêtes assemblés par la composition. */
export type ServicesObjectifs = {
  readonly horloge: Horloge;
  readonly creerObjectif: CreerObjectif;
  readonly renommerObjectif: RenommerObjectif;
  readonly modifierDescriptionObjectif: ModifierDescriptionObjectif;
  readonly modifierDelaiObjectif: ModifierDelaiObjectif;
  readonly retirerDelaiObjectif: RetirerDelaiObjectif;
  readonly supprimerObjectif: SupprimerObjectif;
  readonly consulterObjectifs: ConsulterObjectifs;
  readonly consulterDetailObjectif: ConsulterDetailObjectif;
};

/** Issue d'une saisie : faite, refusée avec des messages sous les champs, ou enregistrement impossible (ERR-014). */
export type IssueSaisie =
  | { readonly type: 'FAITE'; readonly id?: IdObjectif }
  | { readonly type: 'REFUSEE'; readonly messages: ReadonlyArray<MessageRefus> }
  | { readonly type: 'ENREGISTREMENT_IMPOSSIBLE' };

export type SaisieObjectif = {
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
};

export type EcranObjectifs =
  { readonly type: 'LISTE' } | { readonly type: 'DETAIL'; readonly id: IdObjectif };

export type EtatMagasinObjectifs = {
  readonly ecran: EcranObjectifs;
  readonly liste?: ModeleVueListeObjectifs;
  readonly detail?: ModeleVueDetailObjectif | undefined;
  /** Confirmation de suppression en attente (CNF-SUPPR-OBJECTIF). */
  readonly confirmation?: ModeleVueConfirmation | undefined;
  /** Vrai après un échec d'écriture ou de lecture locale : toast ERR-014. */
  readonly erreurEnregistrement: boolean;
  readonly actions: ActionsMagasinObjectifs;
};

export type ActionsMagasinObjectifs = {
  readonly afficherListe: () => Promise<void>;
  readonly ouvrirDetail: (id: IdObjectif) => Promise<void>;
  readonly creer: (saisie: SaisieObjectif) => Promise<IssueSaisie>;
  readonly renommer: (id: IdObjectif, intitule: string) => Promise<IssueSaisie>;
  readonly modifierDescription: (id: IdObjectif, description: string) => Promise<IssueSaisie>;
  /** `undefined` retire le délai. */
  readonly modifierDelai: (
    id: IdObjectif,
    delai: DateCalendaire | undefined,
  ) => Promise<IssueSaisie>;
  readonly demanderSuppression: (id: IdObjectif) => Promise<void>;
  readonly confirmerSuppression: () => Promise<void>;
  readonly annulerSuppression: () => void;
};

export type MagasinObjectifs = StoreApi<EtatMagasinObjectifs>;

const TYPES_ERREUR_DEPOT: ReadonlyArray<ErreurDepotLocal['type']> = [
  'EspaceLocalNonOuvert',
  'EcritureLocaleImpossible',
  'DonneesLocalesIllisibles',
];

const estRefusMetier = (erreur: RefusMetier | ErreurDepotLocal): erreur is RefusMetier =>
  !(TYPES_ERREUR_DEPOT as ReadonlyArray<string>).includes(erreur.type);

const ENREGISTREMENT_IMPOSSIBLE: IssueSaisie = { type: 'ENREGISTREMENT_IMPOSSIBLE' };

const issueDe = (r: Resultat<unknown, RefusMetier | ErreurDepotLocal>): IssueSaisie => {
  if (r.ok) return { type: 'FAITE' };
  return estRefusMetier(r.erreur)
    ? { type: 'REFUSEE', messages: messagesDeRefus(r.erreur) }
    : ENREGISTREMENT_IMPOSSIBLE;
};

type Ecrire = MagasinObjectifs['setState'];
type Lire = MagasinObjectifs['getState'];

/** Actions de l'écran : chacune lit ou écrit par les cas d'usage, puis recalcule les modèles de vue. */
class ActionsObjectifs implements ActionsMagasinObjectifs {
  constructor(
    private readonly services: ServicesObjectifs,
    private readonly ecrire: Ecrire,
    private readonly lire: Lire,
  ) {}

  readonly #echecLecture = (): void => {
    this.ecrire({ erreurEnregistrement: true });
  };

  readonly #chargerListe = async (): Promise<void> => {
    const lecture = await this.services.consulterObjectifs.executer();
    if (lecture.ok) {
      this.ecrire({
        liste: construireListeObjectifs(lecture.valeur, { horloge: this.services.horloge }),
      });
    } else {
      this.#echecLecture();
    }
  };

  /** Un objectif devenu introuvable (supprimé ailleurs) ramène à la liste. */
  readonly #chargerDetail = async (id: IdObjectif): Promise<void> => {
    const lecture = await this.services.consulterDetailObjectif.executer(id);
    if (lecture.ok) {
      const detail = construireDetailObjectif(lecture.valeur, { horloge: this.services.horloge });
      this.ecrire({ detail });
    } else if (estRefusMetier(lecture.erreur)) {
      await this.afficherListe();
    } else {
      this.#echecLecture();
    }
  };

  readonly #rafraichir = async (): Promise<void> => {
    const { ecran } = this.lire();
    await (ecran.type === 'LISTE' ? this.#chargerListe() : this.#chargerDetail(ecran.id));
  };

  /** Après une commande réussie, les modèles de vue sont recalculés ; sur échec technique, ERR-014. */
  readonly #apres = async (issue: IssueSaisie): Promise<IssueSaisie> => {
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

  readonly afficherListe = async (): Promise<void> => {
    this.ecrire({ ecran: { type: 'LISTE' }, erreurEnregistrement: false });
    await this.#chargerListe();
  };

  readonly ouvrirDetail = async (id: IdObjectif): Promise<void> => {
    this.ecrire({ ecran: { type: 'DETAIL', id }, detail: undefined, erreurEnregistrement: false });
    await this.#chargerDetail(id);
  };

  readonly creer = this.#effacee(async (saisie: SaisieObjectif): Promise<IssueSaisie> => {
    const creation = await this.services.creerObjectif.executer(saisie);
    if (!creation.ok) return this.#apres(issueDe(creation));
    await this.ouvrirDetail(creation.valeur);
    return { type: 'FAITE', id: creation.valeur };
  });

  readonly renommer = this.#effacee(async (id: IdObjectif, intitule: string) =>
    this.#apres(
      issueDe(await this.services.renommerObjectif.executer({ objectifId: id, intitule })),
    ),
  );

  readonly modifierDescription = this.#effacee(async (id: IdObjectif, description: string) =>
    this.#apres(
      issueDe(
        await this.services.modifierDescriptionObjectif.executer({ objectifId: id, description }),
      ),
    ),
  );

  readonly modifierDelai = this.#effacee(
    async (id: IdObjectif, delai: DateCalendaire | undefined) =>
      this.#apres(
        issueDe(
          delai === undefined
            ? await this.services.retirerDelaiObjectif.executer({ objectifId: id })
            : await this.services.modifierDelaiObjectif.executer({ objectifId: id, delai }),
        ),
      ),
  );

  readonly demanderSuppression = this.#effacee(async (id: IdObjectif): Promise<void> => {
    const evaluation = await this.services.supprimerObjectif.evaluer({ objectifId: id });
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
    const suppression = await this.services.supprimerObjectif.executer({ objectifId: ecran.id });
    if (suppression.ok) await this.afficherListe();
    else await this.#apres(issueDe(suppression));
  });

  readonly annulerSuppression = (): void => {
    this.ecrire({ confirmation: undefined });
  };
}

export const creerMagasinObjectifsTaches = (services: ServicesObjectifs): MagasinObjectifs =>
  createStore<EtatMagasinObjectifs>((set, get) => ({
    ecran: { type: 'LISTE' },
    erreurEnregistrement: false,
    actions: new ActionsObjectifs(services, set, get),
  }));
