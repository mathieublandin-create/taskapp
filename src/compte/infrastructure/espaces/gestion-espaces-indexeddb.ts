import type { Planificateur } from '../../../commun/application/ports/planificateur';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { IdCompte } from '../../domaine/identite';
import {
  DELAI_SUPPRESSION_BLOQUEE,
  type ErreurEspace,
  type ErreurSuppressionBloquee,
  type GestionEspaces,
} from '../../application/ports/gestion-espaces';
import { estNomEspace, nomEspace, type NomEnvironnement } from './nom-espace';

/**
 * ST-US-022 §4.4, §5.2, §6.6 ; DAT v0.11.4 §4.1.6 (RL-LOT-001-A1).
 * `surOuverture(nomBase)` : la composition ouvre l'espace (DepotLocalDexie.ouvrirEspace) ;
 * `surFermeture()` : la composition ferme l'espace ouvert (DepotLocalDexie.fermer).
 * `supprimer` : fermeture de l'espace ouvert, puis `deleteDatabase` ; bloquée plus de
 * DELAI_SUPPRESSION_BLOQUEE (Planificateur) → SuppressionBloquee, la demande restant en cours ;
 * un nouvel appel attend la même demande.
 */
export type OptionsGestionEspaces = {
  readonly env: NomEnvironnement;
  readonly fabrique?: IDBFactory;
  readonly planificateur: Planificateur;
  readonly surOuverture: (nomBase: string) => Promise<Resultat<undefined, ErreurEspace>>;
  readonly surFermeture: () => Promise<void>;
};

type IssueSuppression = Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>;

const ESPACE_INACCESSIBLE: ErreurEspace = { type: 'EspaceInaccessible' };

export class GestionEspacesIndexedDb implements GestionEspaces {
  #ouvert = false;
  /** Demandes `deleteDatabase` en cours, par nom de base (IndexedDB ne permet pas de les annuler). */
  readonly #suppressions = new Map<string, Promise<Resultat<undefined, ErreurEspace>>>();

  constructor(private readonly options: OptionsGestionEspaces) {}

  async ouvrir(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    await this.fermer();
    try {
      const resultat = await this.options.surOuverture(await nomEspace(this.options.env, compte));
      this.#ouvert = resultat.ok;
      return resultat;
    } catch {
      return echec(ESPACE_INACCESSIBLE);
    }
  }

  async fermer(): Promise<void> {
    if (!this.#ouvert) return;
    this.#ouvert = false;
    await this.options.surFermeture();
  }

  async existeUnEspace(): Promise<boolean> {
    try {
      const bases = await this.#fabrique().databases();
      return bases.some((b) => b.name !== undefined && estNomEspace(this.options.env, b.name));
    } catch {
      return false;
    }
  }

  async supprimer(compte: IdCompte): Promise<IssueSuppression> {
    const nom = await nomEspace(this.options.env, compte);
    let demande = this.#suppressions.get(nom);
    if (demande === undefined) {
      this.#ouvert = false;
      await this.options.surFermeture();
      demande = this.#demanderSuppression(nom);
    }
    return this.#attendreAuPlus(demande);
  }

  #fabrique(): IDBFactory {
    return this.options.fabrique ?? indexedDB;
  }

  #demanderSuppression(nom: string): Promise<Resultat<undefined, ErreurEspace>> {
    const demande = new Promise<Resultat<undefined, ErreurEspace>>((resoudre) => {
      const requete = this.#fabrique().deleteDatabase(nom);
      requete.onsuccess = () => {
        resoudre(succes(undefined));
      };
      requete.onerror = () => {
        resoudre(echec(ESPACE_INACCESSIBLE));
      };
    }).finally(() => {
      this.#suppressions.delete(nom);
    });
    this.#suppressions.set(nom, demande);
    return demande;
  }

  /** Course entre la demande et DELAI_SUPPRESSION_BLOQUEE ; à l'échéance, la demande reste en cours. */
  #attendreAuPlus(demande: Promise<Resultat<undefined, ErreurEspace>>): Promise<IssueSuppression> {
    return new Promise<IssueSuppression>((resoudre) => {
      const annuler = this.options.planificateur.apres(DELAI_SUPPRESSION_BLOQUEE, () => {
        resoudre(echec({ type: 'SuppressionBloquee' }));
      });
      void demande.then((issue) => {
        annuler();
        resoudre(issue);
      });
    });
  }
}
