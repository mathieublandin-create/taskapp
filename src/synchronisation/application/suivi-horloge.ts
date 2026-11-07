import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type {
  EchangeGoogle,
  ObservateurEchangesGoogle,
} from '../../commun/application/ports/observateur-echanges-google';
import type { Planificateur } from '../../commun/application/ports/planificateur';
import type { DepotLocal } from './ports/depot-local';

// ST-US-017 v0.11 §6.8 n° 1 à 5 (rang 11, tranche H3) ; DAT v0.11.3 §6.4 ; RL-LOT-001-A7.

export type DependancesSuiviHorloge = {
  readonly depot: Pick<DepotLocal, 'lire' | 'lireMeta' | 'appliquerSynchronisation'>;
  readonly horloge: Horloge;
  readonly planificateur: Planificateur;
  readonly journal: JournalTechnique;
};

/**
 * Correction d'horloge d'un espace ouvert (une instance par espace, créée et arrêtée par la composition avec le
 * cycle). Implémente `ObservateurEchangesGoogle` : chaque réponse de Google porteuse d'un en-tête `Date` lisible et
 * d'un aller-retour < 3 s donne une mesure, écrite avec la nouvelle correction (médiane) en **une** transaction
 * `appliquerSynchronisation` (n° 2). Détecte les sauts de l'horloge murale chaque minute et à chaque retour au premier
 * plan (n° 3). Les traitements sont exécutés un par un, dans l'ordre d'arrivée (file interne) : jamais deux
 * transactions de correction en parallèle.
 */
export class SuiviHorloge implements ObservateurEchangesGoogle {
  constructor(private readonly dependances: DependancesSuiviHorloge) {}

  /**
   * n° 3, n° 5 : pose le repère (maintenant, monotone) ; arme `periodiquement(PERIODE_CONTROLE_SAUT_HORLOGE,
   * controlerSaut)` ; lit l'état et consigne en « info » `ReculHorlogeOuverture` (champ `ecartMs`) si l'heure physique
   * corrigée (`maintenant + correction`) est inférieure de plus de SEUIL_SAUT_HORLOGE au physique de `dernierHlc`.
   * Idempotent.
   */
  demarrer(): void {
    nonImplemente(`SuiviHorloge.demarrer (${typeof this.dependances})`);
  }

  /** Désarme le contrôle périodique ; les réponses reçues ensuite sont ignorées. Idempotent. */
  arreter(): void {
    nonImplemente('SuiviHorloge.arreter');
  }

  /** n° 1, n° 2 : voir la classe ; sans effet avant `demarrer` ou après `arreter`. Ne lève jamais. */
  surReponse(echange: EchangeGoogle): void {
    nonImplemente(`SuiviHorloge.surReponse (${String(echange.date)})`);
  }

  /**
   * n° 3 : contrôle du saut depuis le repère précédent, puis repère ← courant. RECUL : une transaction
   * (`corrigerRecul` : correction et mesures décalées) et « info » `SautHorloge` (champs `sens: 'RECUL'`, `ecartMs`) ;
   * AVANCE : rien d'écrit, « info » `SautHorloge` (`sens: 'AVANCE'`, `ecartMs`) ; AUCUN : rien. Appelée par la période
   * et par la composition au retour au premier plan (`visibilitychange`). Sans effet avant `demarrer`.
   */
  controlerSaut(): Promise<void> {
    return nonImplemente('SuiviHorloge.controlerSaut');
  }

  /** Banc et tests : résolue quand la file des traitements est vide. */
  traitementsTermines(): Promise<void> {
    return nonImplemente('SuiviHorloge.traitementsTermines');
  }
}
