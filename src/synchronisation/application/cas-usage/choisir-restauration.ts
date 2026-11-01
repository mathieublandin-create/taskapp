import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { CycleSynchronisation, IssueCycle } from '../cycle-synchronisation';
import type { DepotLocal, ErreurDepotLocal } from '../ports/depot-local';

// ST-US-017 v0.10 §4.7, §6.7 n° 9, n° 11, n° 16 ; RG-044 ; guide §6.6.8 (ERR-012, Q-US-017-11) ; DEC-030.
// « Décider plus tard » n'est pas un cas d'usage : c'est un état de la vue (contrôleur), rien n'est écrit (n° 16).

/** Ce que les choix RG-044 demandent au cycle (ségrégation d'interface). */
export type CycleRestauration = Pick<
  CycleSynchronisation,
  'etatMoteur' | 'synchroniserMaintenant' | 'repartirDeZero'
>;

export type ErreurChoixRestauration =
  /** `ERR-012` n'est pas affiché (`etatMoteur().actionRequise ≠ DONNEES_ABSENTES`) : choix sans objet. */
  | { readonly type: 'AucuneAlteration' }
  /** « Repartir de zéro » sans réseau (S22b) : non mémorisé, indisponible. */
  | { readonly type: 'ReseauIndisponible' }
  /** « Repartir de zéro » confirmé mais non abouti (issue du cycle autre que TERMINE) : rien n'est effacé localement. */
  | { readonly type: 'EchecSynchronisation'; readonly issue: IssueCycle }
  | ErreurDepotLocal;

export type DependancesChoixRestauration = {
  readonly depot: DepotLocal;
  readonly cycle: CycleRestauration;
  readonly reseau: EtatReseau;
};

/**
 * « Restaurer mes données » (n° 9) : refus `AucuneAlteration` ; sinon une transaction `appliquerSynchronisation`
 * (plan vide, `meta = { restaurationDemandee: true }`), puis : réseau coupé → `EN_ATTENTE_DU_RESEAU` (S20b, mention
 * « Restauration demandée ») ; réseau connecté → `await cycle.synchroniserMaintenant()` et `LANCEE` (le cycle exécute
 * la restauration après les contrôles 1 à 3, n° 9). Aucune écriture dans le Drive hors du cycle.
 */
export class DemanderRestauration {
  constructor(private readonly dependances: DependancesChoixRestauration) {}

  executer(): Promise<Resultat<'EN_ATTENTE_DU_RESEAU' | 'LANCEE', ErreurChoixRestauration>> {
    return nonImplemente(
      `DemanderRestauration.executer (${String(this.dependances.reseau.estConnecte())})`,
    );
  }
}

/**
 * « Annuler la demande » (n° 9, guide Q-US-017-11 b) : une transaction `appliquerSynchronisation` (plan vide,
 * `meta = { restaurationDemandee: false }`) ; sans effet sur le Drive ; `ERR-012` reste affiché.
 */
export class AnnulerRestauration {
  constructor(private readonly dependances: Pick<DependancesChoixRestauration, 'depot'>) {}

  executer(): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return nonImplemente(`AnnulerRestauration.executer (${typeof this.dependances.depot})`);
  }
}

/**
 * « Repartir de zéro » (n° 11), en deux temps (`CNF-REPARTIR-ZERO`, guide §6.6.7) :
 * - `evaluer` : refus `AucuneAlteration`, puis `ReseauIndisponible` ; sinon `n` = `decompterModificationsEnAttente`
 *   de l'état lu (modifications perdues annoncées par la confirmation) ;
 * - `executer` (après confirmation) : mêmes refus, puis `cycle.repartirDeZero()` ; `TERMINE` → succès ; autre issue
 *   → `EchecSynchronisation` (l'état local n'est effacé qu'après les écritures dans le Drive, n° 11).
 * Renoncer = ne pas appeler `executer` : rien n'est écrit (S22).
 */
export class RepartirDeZero {
  constructor(private readonly dependances: DependancesChoixRestauration) {}

  evaluer(): Promise<Resultat<{ readonly n: number }, ErreurChoixRestauration>> {
    return nonImplemente(
      `RepartirDeZero.evaluer (${String(this.dependances.reseau.estConnecte())})`,
    );
  }

  executer(): Promise<Resultat<undefined, ErreurChoixRestauration>> {
    return nonImplemente(
      `RepartirDeZero.executer (${String(this.dependances.reseau.estConnecte())})`,
    );
  }
}
