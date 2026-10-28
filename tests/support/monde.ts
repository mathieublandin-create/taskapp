/**
 * Monde des scénarios (conventions.md §11.7) : un monde neuf par scénario, qui porte le banc, le dernier résultat
 * d'action de chaque appareil, ses commandes en attente de confirmation et les références nommées.
 */
import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { Resultat } from '@src/commun/domaine/resultat';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { NomAppareil } from './banc/appareil-simule';
import { BancSynchro } from './banc/banc-synchro';
import type { CommandeEnAttente } from './commandes-en-attente';
import { References } from './references';

export class MondeDoneJuan extends World {
  readonly banc = new BancSynchro();
  readonly resultats = new Map<NomAppareil, Resultat<unknown, unknown>>();
  readonly commandesEnAttente = new Map<NomAppareil, CommandeEnAttente>();
  readonly references = new References();
  /** Instant simulé de la dernière action : « au même instant exact, » y revient (conventions.md §11.7). */
  instantDerniereAction: Instant | undefined;
  /** URL des requêtes `fetch` tentées : aucune n'est admise (ST-US-022 §12.3). */
  readonly requetesInterdites: Array<string> = [];
}

setWorldConstructor(MondeDoneJuan);
