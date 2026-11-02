import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import { decompterModificationsEnAttente } from '../../domaine/index-en-attente';
import { PLAN_VIDE } from '../../domaine/planifier-ecritures';
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

const AUCUNE_ALTERATION = echec<ErreurChoixRestauration>({ type: 'AucuneAlteration' });
const RESEAU_INDISPONIBLE = echec<ErreurChoixRestauration>({ type: 'ReseauIndisponible' });

/** Un choix n'a d'objet que si `ERR-012` est affiché (§8 n° 16). */
const alterationAffichee = (cycle: CycleRestauration): boolean =>
  cycle.etatMoteur().actionRequise === 'DONNEES_ABSENTES';

/** Demande de restauration mémorisée ou oubliée : une transaction, plan vide (n° 9). */
const memoriserDemande = (depot: DepotLocal, restaurationDemandee: boolean) =>
  depot.appliquerSynchronisation((etat) => ({
    plan: PLAN_VIDE(etat),
    meta: { restaurationDemandee },
  }));

/** Refus communs à « Repartir de zéro » : `AucuneAlteration`, puis `ReseauIndisponible` (S22b, jamais mémorisé). */
const refusRepartir = (
  d: DependancesChoixRestauration,
): Resultat<never, ErreurChoixRestauration> | undefined => {
  if (!alterationAffichee(d.cycle)) return AUCUNE_ALTERATION;
  return d.reseau.estConnecte() ? undefined : RESEAU_INDISPONIBLE;
};

/**
 * « Restaurer mes données » (n° 9) : refus `AucuneAlteration` ; sinon une transaction `appliquerSynchronisation`
 * (plan vide, `meta = { restaurationDemandee: true }`), puis : réseau coupé → `EN_ATTENTE_DU_RESEAU` (S20b, mention
 * « Restauration demandée ») ; réseau connecté → `await cycle.synchroniserMaintenant()` et `LANCEE` (le cycle exécute
 * la restauration après les contrôles 1 à 3, n° 9). Aucune écriture dans le Drive hors du cycle.
 */
export class DemanderRestauration {
  constructor(private readonly dependances: DependancesChoixRestauration) {}

  async executer(): Promise<Resultat<'EN_ATTENTE_DU_RESEAU' | 'LANCEE', ErreurChoixRestauration>> {
    const { depot, cycle, reseau } = this.dependances;
    if (!alterationAffichee(cycle)) return AUCUNE_ALTERATION;
    const memorise = await memoriserDemande(depot, true);
    if (!memorise.ok) return memorise;
    if (!reseau.estConnecte()) return succes('EN_ATTENTE_DU_RESEAU');
    await cycle.synchroniserMaintenant();
    return succes('LANCEE');
  }
}

/**
 * « Annuler la demande » (n° 9, guide Q-US-017-11 b) : une transaction `appliquerSynchronisation` (plan vide,
 * `meta = { restaurationDemandee: false }`) ; sans effet sur le Drive ; `ERR-012` reste affiché.
 */
export class AnnulerRestauration {
  constructor(private readonly dependances: Pick<DependancesChoixRestauration, 'depot'>) {}

  executer(): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return memoriserDemande(this.dependances.depot, false);
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

  async evaluer(): Promise<Resultat<{ readonly n: number }, ErreurChoixRestauration>> {
    const refus = refusRepartir(this.dependances);
    if (refus !== undefined) return refus;
    const etat = await this.dependances.depot.lire();
    if (!etat.ok) return etat;
    return succes({ n: decompterModificationsEnAttente(etat.valeur.enAttente) });
  }

  async executer(): Promise<Resultat<undefined, ErreurChoixRestauration>> {
    const refus = refusRepartir(this.dependances);
    if (refus !== undefined) return refus;
    const issue = await this.dependances.cycle.repartirDeZero();
    return issue === 'TERMINE' ? succes(undefined) : echec({ type: 'EchecSynchronisation', issue });
  }
}
