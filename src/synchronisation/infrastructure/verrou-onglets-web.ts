import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { VerrouOnglets } from '../application/ports/verrou-onglets';

// ST-US-031 v0.4 §4.2, §8 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6 ; RL-LOT-001-A6 (hypothèse H-031-1).
// Adaptateur Web Locks du port `VerrouOnglets` : seul fichier autorisé à lire `navigator.locks` (ESLint).

export type DependancesVerrouOngletsWeb = {
  /** `navigator.locks` ; undefined si l'API est absente (exécution sans verrou, entrée `erreur` une fois). */
  readonly gestionnaire: LockManager | undefined;
  readonly journal: JournalTechnique;
};

const EXCLUSIF = { mode: 'exclusive' } as const;

export class VerrouOngletsWeb implements VerrouOnglets {
  #indisponibiliteSignalee = false;

  constructor(private readonly dependances: DependancesVerrouOngletsWeb) {}

  async executerExclusivement<T>(nom: string, tache: () => Promise<T>): Promise<T> {
    const gestionnaire = this.#gestionnaire();
    if (gestionnaire === undefined) return tache();
    return gestionnaire.request(nom, EXCLUSIF, () => tache());
  }

  demanderLaMain(nom: string, quandObtenue: () => void): () => void {
    const gestionnaire = this.#gestionnaire();
    if (gestionnaire === undefined) return mainSansVerrou(quandObtenue);
    const abandon = new AbortController();
    let rendu = false;
    let tenue = false;
    let liberer: () => void;
    const promesseRendue = new Promise<void>((resoudre) => {
      liberer = resoudre;
    });
    gestionnaire
      .request(nom, { ...EXCLUSIF, signal: abandon.signal }, () => {
        // Garde obligatoire (§4.2) : Web Locks accorde un verrou libre aussitôt et n'appelle ce rappel qu'ensuite ;
        // un `abort()` entre les deux est sans effet. Une demande rendue entre-temps ne prend donc jamais la main.
        if (rendu) return Promise.resolve();
        tenue = true;
        quandObtenue();
        return promesseRendue;
      })
      // Demande abandonnée (`AbortError`) : absorbée, aucun rejet non traité (§8).
      .catch(() => undefined);
    return () => {
      if (rendu) return;
      rendu = true;
      if (tenue) liberer();
      else abandon.abort();
    };
  }

  async estTenu(nom: string): Promise<boolean> {
    const gestionnaire = this.#gestionnaire();
    if (gestionnaire === undefined) return false;
    const { held } = await gestionnaire.query();
    return (held ?? []).some((verrou) => verrou.name === nom);
  }

  /** Le gestionnaire ; s'il manque, une seule entrée `erreur` par instance, au premier appel (§8). */
  #gestionnaire(): LockManager | undefined {
    const { gestionnaire, journal } = this.dependances;
    if (gestionnaire === undefined && !this.#indisponibiliteSignalee) {
      this.#indisponibiliteSignalee = true;
      journal.consigner({ niveau: 'erreur', evenement: 'VerrouOngletsIndisponible' });
    }
    return gestionnaire;
  }
}

/** API absente : onglet meneur d'office, dans une microtâche, sauf si `rendre` a été appelé entre-temps. */
const mainSansVerrou = (quandObtenue: () => void): (() => void) => {
  let rendu = false;
  queueMicrotask(() => {
    if (!rendu) quandObtenue();
  });
  return () => {
    rendu = true;
  };
};

/** Verrou du navigateur courant (composition `web.ts`) : `navigator.locks` s'il existe. */
export const verrouOngletsDuNavigateur = (journal: JournalTechnique): VerrouOngletsWeb =>
  new VerrouOngletsWeb({
    gestionnaire: 'locks' in navigator ? navigator.locks : undefined,
    journal,
  });
