/**
 * Monde des scénarios (conventions.md §11.7) : un monde neuf par scénario, qui porte le banc, le dernier résultat
 * d'action de chaque appareil, ses commandes en attente de confirmation et les références nommées.
 */
import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { Resultat } from '@src/commun/domaine/resultat';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type {
  FiltreEtat,
  ModeleVueDetailObjectif,
  ModeleVueDetailTache,
  ModeleVueFormulaireSousTache,
  ModeleVueFormulaireTache,
  ModeleVueListeObjectifs,
  ModeleVueListeTaches,
} from '@src/objectifs-taches';
import type { FauxDrive } from '../doublures/faux-drive';
import type { NomAppareil } from './banc/appareil-simule';
import { BancSynchro } from './banc/banc-synchro';
import type { CommandeEnAttente } from './commandes-en-attente';
import type { PhotoDrive } from './synchronisation/alteration-drive';
import type { SaisieSousTacheEnCours } from './construction-taches';
import { References } from './references';

export class MondeDoneJuan extends World {
  readonly banc = new BancSynchro();
  /** Dernier résultat d'action de chaque appareil. */
  readonly resultats = new Map<NomAppareil, Resultat<unknown, unknown>>();
  /** Tous les résultats d'action du scénario, par appareil (ST-US-017 v0.11 §12.7 : « toutes ces opérations »). */
  readonly resultatsDuScenario = new Map<NomAppareil, Array<Resultat<unknown, unknown>>>();
  /** Écritures de chaque appareil dans le Drive au moment où il passe en consultation seule (§12.7 V1, V7). */
  readonly ecrituresDepuis = new Map<NomAppareil, number>();
  /** Drive dont les écritures sont repérées : encore joignable après une déconnexion (US-022 S25). */
  driveSuivi: FauxDrive | undefined;
  readonly commandesEnAttente = new Map<NomAppareil, CommandeEnAttente>();
  readonly references = new References();
  /** Modèles de vue consultés, par appareil (ST-US-001 §12). */
  readonly derniereListeObjectifs = new Map<NomAppareil, ModeleVueListeObjectifs>();
  readonly dernierDetailObjectif = new Map<NomAppareil, ModeleVueDetailObjectif>();
  /** ST-US-002 §12 n° 5, 22 à 27 : dernier formulaire de saisie, dernière liste des tâches et son filtre d'état. */
  readonly dernierFormulaireTache = new Map<
    NomAppareil,
    ModeleVueFormulaireTache | ModeleVueFormulaireSousTache
  >();
  /** ST-US-024 §12 n° 3, 4 : dernier formulaire de sous-tâche, et saisie en cours (US-018 S13). */
  readonly dernierFormulaireSousTache = new Map<NomAppareil, ModeleVueFormulaireSousTache>();
  readonly saisieSousTacheEnCours = new Map<NomAppareil, SaisieSousTacheEnCours>();
  readonly derniereListeTaches = new Map<NomAppareil, ModeleVueListeTaches>();
  /** Dernier détail de tâche consulté (ST-US-024 §12 n° 6 à 8). */
  readonly dernierDetailTache = new Map<NomAppareil, ModeleVueDetailTache>();
  readonly filtreEtatTaches = new Map<NomAppareil, FiltreEtat>();
  /** Instant simulé de la dernière action : « au même instant exact, » y revient (conventions.md §11.7). */
  instantDerniereAction: Instant | undefined;
  /** URL des requêtes `fetch` tentées : aucune n'est admise (ST-US-022 §12.3). */
  readonly requetesInterdites: Array<string> = [];
  /** Drive photographié à la dernière altération hors application (ST-US-017 §12.6 n° R1, R2, R13, R14). */
  photoDrive: PhotoDrive | undefined;
  /** Fichier de données de chaque appareil modifié à la main dans le Drive (identifiant du fichier). */
  readonly fichiersAlteres = new Map<NomAppareil, string>();
  /** Vrai sous `@ANO-001` : l'indicateur est lu dans la vue affichée du contrôleur (ST-US-017 §12.4). */
  lectureAffichee = false;
  /** Type (`Context`, `Action`, `Outcome`) de l'étape en cours, lu par le crochet `BeforeStep` (ST-US-017 §12.6 R4). */
  typeEtape: string | undefined;

  /** Mémorise le résultat d'une action : dernier résultat de l'appareil, et suite des résultats du scénario. */
  memoriserResultat(appareil: NomAppareil, resultat: Resultat<unknown, unknown>): void {
    this.resultats.set(appareil, resultat);
    this.resultatsDuScenario.set(appareil, [
      ...(this.resultatsDuScenario.get(appareil) ?? []),
      resultat,
    ]);
  }
}

setWorldConstructor(MondeDoneJuan);
