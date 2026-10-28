import type { Annulation, Planificateur } from '@src/commun/application/ports/planificateur';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { Instant } from '@src/commun/domaine/temps/instant';
import type { TempsSimule } from '../support/banc/temps-simule';

type Tache = {
  readonly ordre: number;
  echeance: Instant;
  readonly action: () => void;
  readonly periode?: EcartTemps;
  annulee: boolean;
};

const ITERATIONS_MAX = 100;

/**
 * Doublure du port Planificateur (conventions.md §11.10, ST-US-022 §12.3).
 * - les échéances sont calculées sur le TempsSimule partagé ; aucune attente réelle ;
 * - `executerEchus()` exécute, dans l'ordre des échéances puis de programmation, les actions échues
 *   (appelé par le banc quand le temps avance) ; une action périodique est reprogrammée ;
 * - `attendre(delai)` renvoie une promesse résolue quand le temps atteint l'échéance ;
 * - `executerJusquAuReglement(promesse)` : tant que la promesse n'est pas réglée, avance le TempsSimule jusqu'à la
 *   prochaine échéance et exécute les actions échues (100 itérations au plus, sinon erreur) ; renvoie sa valeur ;
 * - `attentesDemandees()` : délais (ms) passés à `attendre`, dans l'ordre (API d'observation).
 */
export class PlanificateurSimule implements Planificateur {
  private readonly taches: Array<Tache> = [];
  private readonly attentes: Array<number> = [];
  private prochainOrdre = 0;

  constructor(private readonly temps: TempsSimule) {}

  apres(delai: EcartTemps, action: () => void): Annulation {
    return this.programmer(delai, action);
  }

  periodiquement(periode: EcartTemps, action: () => void): Annulation {
    return this.programmer(periode, action, periode);
  }

  attendre(delai: EcartTemps): Promise<void> {
    this.attentes.push(delai);
    return new Promise((resoudre) => {
      this.programmer(delai, resoudre);
    });
  }

  executerEchus(): void {
    for (let tache = this.prochaineEchue(); tache !== undefined; tache = this.prochaineEchue()) {
      if (tache.periode === undefined) tache.annulee = true;
      else tache.echeance = Instant.decaler(tache.echeance, tache.periode);
      tache.action();
    }
  }

  async executerJusquAuReglement<T>(promesse: Promise<T>): Promise<T> {
    const suivi: { issue?: { readonly valeur: T } | { readonly erreur: unknown } } = {};
    promesse.then(
      (valeur) => {
        suivi.issue = { valeur };
      },
      (erreur: unknown) => {
        suivi.issue = { erreur };
      },
    );
    for (let i = 0; i < ITERATIONS_MAX; i += 1) {
      await new Promise((resoudre) => setTimeout(resoudre, 0));
      if (suivi.issue !== undefined) break;
      this.avancerJusquaLaProchaineEcheance();
    }
    const { issue } = suivi;
    if (issue === undefined) {
      throw new Error(`Promesse non réglée après ${String(ITERATIONS_MAX)} itérations`);
    }
    if ('erreur' in issue) throw issue.erreur;
    return issue.valeur;
  }

  attentesDemandees(): ReadonlyArray<number> {
    return [...this.attentes];
  }

  private programmer(delai: EcartTemps, action: () => void, periode?: EcartTemps): Annulation {
    const tache: Tache = {
      ordre: this.prochainOrdre,
      echeance: Instant.decaler(this.temps.maintenant(), delai),
      action,
      annulee: false,
      ...(periode === undefined ? {} : { periode }),
    };
    this.prochainOrdre += 1;
    this.taches.push(tache);
    return () => {
      tache.annulee = true;
    };
  }

  private actives(): ReadonlyArray<Tache> {
    return this.taches
      .filter((t) => !t.annulee)
      .sort((a, b) => a.echeance - b.echeance || a.ordre - b.ordre);
  }

  private prochaineEchue(): Tache | undefined {
    const premiere = this.actives()[0];
    return premiere !== undefined && premiere.echeance <= this.temps.maintenant()
      ? premiere
      : undefined;
  }

  private avancerJusquaLaProchaineEcheance(): void {
    const premiere = this.actives()[0];
    if (premiere === undefined) return;
    if (premiere.echeance > this.temps.maintenant()) this.temps.positionner(premiere.echeance);
    this.executerEchus();
  }
}
