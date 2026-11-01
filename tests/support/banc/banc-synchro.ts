/**
 * Banc de synchronisation (conventions.md §11.11 ; ST-US-017 §12.3). Un temps simulé unique, un planificateur
 * global, Google simulé (`FauxGoogle` : comptes, accès et Drive de chaque compte) et jusqu'à deux appareils, dont
 * les cycles de synchronisation sont attendus quand le temps avance. Le `FauxAgenda` s'ajoute aux rangs suivants.
 */
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { Instant } from '@src/commun/domaine/temps/instant';
import { instant } from '../valeurs';
import { FauxGoogle } from '../../doublures/faux-google';
import { PlanificateurSimule } from '../../doublures/planificateur-simule';
import { AppareilSimule, type NomAppareil } from './appareil-simule';
import { TempsSimule } from './temps-simule';

/** Heure de départ du banc, avant toute étape « nous sommes le … ». */
const DEPART_PAR_DEFAUT = '2026-01-01T00:00:00.000Z';

/** ST-US-017 §12.1 n° 2 : nombre de tours au plus de « les deux appareils échangent leurs modifications ». */
const TOURS_MAX_JUSQU_AU_REPOS = 10;

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

  /** Remplace l'appareil de ce nom par un appareil neuf (nouvelle `IDBFactory`, rien en mémoire technique). */
  remplacerAppareil(nom: NomAppareil): AppareilSimule {
    this.parNom.get(nom)?.fermerApplication();
    this.parNom.delete(nom);
    return this.appareil(nom);
  }

  /** Retire l'appareil du banc après avoir fermé son application : ses données restent dans le Drive du compte. */
  retirerAppareil(nom: NomAppareil): void {
    this.parNom.get(nom)?.fermerApplication();
    this.parNom.delete(nom);
  }

  appareils(): ReadonlyArray<AppareilSimule> {
    return [...this.parNom.values()];
  }

  /**
   * Avance le temps du banc d'échéance en échéance jusqu'à `ecart` : à chaque échéance, les déclenchements échus
   * sont exécutés et les cycles de synchronisation qu'ils lancent sont attendus (ST-US-017 §12.1 n° 8).
   */
  async avancerTemps(ecart: EcartTemps): Promise<void> {
    const cible = Instant.decaler(this.temps.maintenant(), ecart);
    for (
      let prochaine = this.planificateur.prochaineEcheance();
      prochaine !== undefined && prochaine <= cible;
      prochaine = this.planificateur.prochaineEcheance()
    ) {
      if (prochaine > this.temps.maintenant()) this.temps.positionner(prochaine);
      this.planificateur.executerEchus();
      await this.attendreCycles();
    }
    this.temps.positionner(cible);
    this.planificateur.executerEchus();
    await this.attendreCycles();
  }

  /** Attend la fin des cycles de synchronisation en cours sur les appareils ouverts (relances comprises). */
  async attendreCycles(): Promise<void> {
    for (;;) {
      const enCours = this.appareils().flatMap((a) => a.cycleEnCours() ?? []);
      if (enCours.length === 0) return;
      await Promise.allSettled(enCours);
    }
  }

  /**
   * « Les deux appareils échangent leurs modifications » (ST-US-017 §12.1 n° 2) : cycles smartphone, PC,
   * smartphone…, jusqu'à un tour sans fusion ni dépôt (version locale et méta inchangées), 10 tours au plus.
   */
  async synchroniserJusquAuRepos(): Promise<void> {
    await this.attendreCycles();
    for (let tour = 0; tour < TOURS_MAX_JUSQU_AU_REPOS; tour += 1) {
      const avant = await this.signature();
      for (const appareil of this.appareils()) await appareil.echangerAvecLeDrive();
      if ((await this.signature()) === avant) return;
    }
    throw new Error(`Pas de repos après ${String(TOURS_MAX_JUSQU_AU_REPOS)} tours d'échange`);
  }

  private async signature(): Promise<string> {
    const etats = await Promise.all(this.appareils().map((a) => a.signatureSynchronisation()));
    return JSON.stringify(etats);
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
