import { nonImplemente } from '@non-implemente';
import type { Annulation, Planificateur } from '@src/commun/application/ports/planificateur';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { TempsSimule } from '../support/banc/temps-simule';

/**
 * Doublure du port Planificateur (conventions.md §11.10). Squelette E10 (ST-US-022 §12.3) : réalisée par Benjamin.
 * - les échéances sont calculées sur le TempsSimule partagé ; aucune attente réelle ;
 * - `executerEchus()` exécute, dans l'ordre des échéances puis de programmation, les actions échues
 *   (appelé par le banc quand le temps avance) ; une action périodique est reprogrammée ;
 * - `attendre(delai)` renvoie une promesse résolue quand le temps atteint l'échéance ;
 * - `executerJusquAuReglement(promesse)` : tant que la promesse n'est pas réglée, avance le TempsSimule jusqu'à la
 *   prochaine échéance et exécute les actions échues (100 itérations au plus, sinon erreur) ; renvoie sa valeur ;
 * - `attentesDemandees()` : délais (ms) passés à `attendre`, dans l'ordre (API d'observation).
 */
export class PlanificateurSimule implements Planificateur {
  constructor(private readonly temps: TempsSimule) {}

  apres(_delai: EcartTemps, _action: () => void): Annulation {
    return nonImplemente('PlanificateurSimule.apres');
  }

  periodiquement(_periode: EcartTemps, _action: () => void): Annulation {
    return nonImplemente('PlanificateurSimule.periodiquement');
  }

  attendre(_delai: EcartTemps): Promise<void> {
    return nonImplemente('PlanificateurSimule.attendre');
  }

  executerEchus(): void {
    nonImplemente('PlanificateurSimule.executerEchus');
  }

  executerJusquAuReglement<T>(_promesse: Promise<T>): Promise<T> {
    return nonImplemente('PlanificateurSimule.executerJusquAuReglement');
  }

  attentesDemandees(): ReadonlyArray<number> {
    return nonImplemente('PlanificateurSimule.attentesDemandees');
  }
}
