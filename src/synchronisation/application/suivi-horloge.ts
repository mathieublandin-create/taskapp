import type { Horloge } from '../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type {
  EchangeGoogle,
  ObservateurEchangesGoogle,
} from '../../commun/application/ports/observateur-echanges-google';
import type { Annulation, Planificateur } from '../../commun/application/ports/planificateur';
import { lireDateHttp } from '../../commun/domaine/temps/date-http';
import type { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import {
  corrigerRecul,
  medianeCorrection,
  mesurerEcart,
  qualifierSaut,
  retenirMesure,
  type EtatCorrection,
  type RepereHorloge,
} from '../domaine/correction-horloge';
import type { EtatLocal } from '../domaine/etat-local';
import type { MetaSynchronisation, PlanSynchronisation } from '../domaine/meta-synchronisation';
import {
  PERIODE_CONTROLE_SAUT_HORLOGE,
  SEUIL_SAUT_HORLOGE,
} from '../domaine/parametres-synchronisation';
import { PLAN_VIDE } from '../domaine/planifier-ecritures';
import type { DepotLocal } from './ports/depot-local';

// ST-US-017 v0.11 §6.8 n° 1 à 5 (rang 11, tranche H3) ; DAT v0.11.3 §6.4 ; RL-LOT-001-A7.

export type DependancesSuiviHorloge = {
  readonly depot: Pick<DepotLocal, 'lire' | 'lireMeta' | 'appliquerSynchronisation'>;
  readonly horloge: Horloge;
  readonly planificateur: Planificateur;
  readonly journal: JournalTechnique;
};

type CalculCorrection = (etat: EtatLocal, meta: MetaSynchronisation) => EtatCorrection;

/** n° 2, n° 3 : une seule transaction ; le plan n'est non vide que si la correction change (CT-DEPOT-16). */
const planCorrection = (etat: EtatLocal, nouvel: EtatCorrection): PlanSynchronisation => ({
  plan: { ...PLAN_VIDE(etat), etatApres: { ...etat, correctionHorloge: nouvel.correction } },
  meta: { mesuresHorloge: nouvel.mesures },
});

/** n° 2 : la mesure entre dans les NOMBRE_MESURES_HORLOGE dernières ; correction = leur médiane. */
const avecMesure =
  (mesure: EcartTemps): CalculCorrection =>
  (etat, meta) => {
    const mesures = retenirMesure(meta.mesuresHorloge ?? [], mesure);
    return { correction: medianeCorrection(mesures) ?? etat.correctionHorloge, mesures };
  };

/** n° 3 : recul de l'horloge murale corrigé exactement (correction et mesures décalées). */
const apresRecul =
  (recul: EcartTemps): CalculCorrection =>
  (etat, meta) =>
    corrigerRecul(
      { correction: etat.correctionHorloge, mesures: meta.mesuresHorloge ?? [] },
      recul,
    );

/**
 * Correction d'horloge d'un espace ouvert (une instance par espace, créée et arrêtée par la composition avec le
 * cycle). Implémente `ObservateurEchangesGoogle` : chaque réponse de Google porteuse d'un en-tête `Date` lisible et
 * d'un aller-retour < 3 s donne une mesure, écrite avec la nouvelle correction (médiane) en **une** transaction
 * `appliquerSynchronisation` (n° 2). Détecte les sauts de l'horloge murale chaque minute et à chaque retour au premier
 * plan (n° 3). Les traitements sont exécutés un par un, dans l'ordre d'arrivée (file interne) : jamais deux
 * transactions de correction en parallèle.
 */
export class SuiviHorloge implements ObservateurEchangesGoogle {
  /** Repère du dernier contrôle de saut (en mémoire) ; undefined hors de `demarrer` … `arreter`. */
  #repere: RepereHorloge | undefined;
  #periode: Annulation | undefined;
  /** File des traitements (n° 2) : chaque traitement s'enchaîne au précédent ; elle ne rejette jamais. */
  #file: Promise<void> = Promise.resolve();

  constructor(private readonly dependances: DependancesSuiviHorloge) {}

  /**
   * n° 3, n° 5 : pose le repère (maintenant, monotone) ; arme `periodiquement(PERIODE_CONTROLE_SAUT_HORLOGE,
   * controlerSaut)` ; lit l'état et consigne en « info » `ReculHorlogeOuverture` (champ `ecartMs`) si l'heure physique
   * corrigée (`maintenant + correction`) est inférieure de plus de SEUIL_SAUT_HORLOGE au physique de `dernierHlc`.
   * Idempotent.
   */
  demarrer(): void {
    if (this.#repere !== undefined) return;
    this.#repere = this.#repereCourant();
    this.#periode = this.dependances.planificateur.periodiquement(
      PERIODE_CONTROLE_SAUT_HORLOGE,
      () => {
        void this.controlerSaut();
      },
    );
    this.#enfiler(() => this.#controlerOuverture());
  }

  /** Désarme le contrôle périodique ; les réponses reçues ensuite sont ignorées. Idempotent. */
  arreter(): void {
    this.#periode?.();
    this.#periode = undefined;
    this.#repere = undefined;
  }

  /** n° 1, n° 2 : voir la classe ; sans effet avant `demarrer` ou après `arreter`. Ne lève jamais. */
  surReponse(echange: EchangeGoogle): void {
    if (this.#repere === undefined) return;
    const date = lireDateHttp(echange.date);
    const mesure = date === undefined ? undefined : mesurerEcart({ ...echange, date });
    if (mesure === undefined) return;
    this.#enfiler(() => this.#ecrire(avecMesure(mesure)));
  }

  /**
   * n° 3 : contrôle du saut depuis le repère précédent, puis repère ← courant. RECUL : une transaction
   * (`corrigerRecul` : correction et mesures décalées) et « info » `SautHorloge` (champs `sens: 'RECUL'`, `ecartMs`) ;
   * AVANCE : rien d'écrit, « info » `SautHorloge` (`sens: 'AVANCE'`, `ecartMs`) ; AUCUN : rien. Appelée par la période
   * et par la composition au retour au premier plan (`visibilitychange`). Sans effet avant `demarrer`.
   * Le saut est qualifié à l'appel (repère lu de façon synchrone) ; seule l'écriture passe par la file.
   */
  controlerSaut(): Promise<void> {
    const precedent = this.#repere;
    if (precedent === undefined) return this.traitementsTermines();
    const courant = this.#repereCourant();
    this.#repere = courant;
    const saut = qualifierSaut(precedent, courant);
    if (saut.type !== 'AUCUN') {
      this.dependances.journal.consigner({
        niveau: 'info',
        evenement: 'SautHorloge',
        champs: { sens: saut.type, ecartMs: saut.ecart },
      });
    }
    if (saut.type === 'RECUL') this.#enfiler(() => this.#ecrire(apresRecul(saut.ecart)));
    return this.traitementsTermines();
  }

  /** Banc et tests : résolue quand la file des traitements est vide (y compris ceux ajoutés pendant l'attente). */
  async traitementsTermines(): Promise<void> {
    let attendue: Promise<void>;
    do {
      attendue = this.#file;
      await attendue;
    } while (attendue !== this.#file);
  }

  #repereCourant(): RepereHorloge {
    const { horloge } = this.dependances;
    return { murale: horloge.maintenant(), monotone: horloge.monotone() };
  }

  /** Ajoute un traitement à la file ; une exception (dépôt défaillant) est journalisée, jamais propagée. */
  #enfiler(traitement: () => Promise<void>): void {
    this.#file = this.#file.then(traitement).catch((erreur: unknown) => {
      this.#signalerNonEcrite(erreur instanceof Error ? erreur.name : 'inconnue');
    });
  }

  async #ecrire(calcul: CalculCorrection): Promise<void> {
    const ecrit = await this.dependances.depot.appliquerSynchronisation((etat, meta) =>
      planCorrection(etat, calcul(etat, meta)),
    );
    if (!ecrit.ok) this.#signalerNonEcrite(ecrit.erreur.type);
  }

  /** n° 5 : recul de l'horloge à l'ouverture (DAT §6.4 point 3) ; une lecture en échec ne consigne rien. */
  async #controlerOuverture(): Promise<void> {
    const lu = await this.dependances.depot.lire();
    const dernier = lu.ok ? lu.valeur.dernierHlc : undefined;
    if (!lu.ok || dernier === undefined) return;
    const corrigee = this.dependances.horloge.maintenant() + lu.valeur.correctionHorloge;
    const ecartMs = dernier.physique - corrigee;
    if (ecartMs <= SEUIL_SAUT_HORLOGE) return;
    this.dependances.journal.consigner({
      niveau: 'info',
      evenement: 'ReculHorlogeOuverture',
      champs: { ecartMs },
    });
  }

  #signalerNonEcrite(erreur: string): void {
    this.dependances.journal.consigner({
      niveau: 'avertissement',
      evenement: 'CorrectionHorlogeNonEcrite',
      champs: { erreur },
    });
  }
}
