/**
 * Banc de synchronisation (conventions.md §11.11). Un temps simulé unique, un planificateur global, Google simulé
 * (`FauxGoogle` : comptes, accès et Drive de chaque compte) et jusqu'à deux appareils. La synchronisation et le
 * `FauxAgenda` s'ajoutent aux rangs suivants.
 */
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Instant } from '@src/commun/domaine/temps/instant';
import { instant } from '../valeurs';
import { FauxGoogle } from '../../doublures/faux-google';
import { PlanificateurSimule } from '../../doublures/planificateur-simule';
import { AppareilSimule, type NomAppareil } from './appareil-simule';
import { TempsSimule } from './temps-simule';

/** Heure de départ du banc, avant toute étape « nous sommes le … ». */
const DEPART_PAR_DEFAUT = '2026-01-01T00:00:00.000Z';

export class BancSynchro {
  readonly temps: TempsSimule;
  readonly planificateur: PlanificateurSimule;
  readonly google: FauxGoogle;
  private readonly parNom = new Map<NomAppareil, AppareilSimule>();

  constructor(depart: Instant = instant(DEPART_PAR_DEFAUT)) {
    this.temps = new TempsSimule(depart);
    this.planificateur = new PlanificateurSimule(this.temps);
    this.google = new FauxGoogle(this.temps);
  }

  /** L'appareil de ce nom ; créé au premier usage. */
  appareil(nom: NomAppareil): AppareilSimule {
    const existant = this.parNom.get(nom);
    if (existant !== undefined) return existant;
    const nouveau = new AppareilSimule(nom, this.temps, {
      planificateur: this.planificateur,
      google: this.google,
    });
    this.parNom.set(nom, nouveau);
    return nouveau;
  }

  appareils(): ReadonlyArray<AppareilSimule> {
    return [...this.parNom.values()];
  }

  /** Avance le temps du banc puis exécute les déclenchements échus. */
  avancerTemps(ecart: EcartTemps): void {
    this.temps.avancer(ecart);
    this.planificateur.executerEchus();
  }

  /** Avance le temps d'échéance en échéance jusqu'au règlement de la promesse (100 itérations au plus). */
  executerEnLaissantPasserLeTemps<T>(promesse: Promise<T>): Promise<T> {
    return this.planificateur.executerJusquAuReglement(promesse);
  }

  /** Fin de scénario : ferme les connexions IndexedDB des appareils. */
  arreter(): void {
    this.parNom.forEach((appareil) => {
      appareil.fermerApplication();
    });
  }
}
