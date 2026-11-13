import type { Horloge } from '../application/ports/horloge';
import { EcartTemps } from '../domaine/temps/ecart-temps';
import type { Fuseau } from '../domaine/temps/fuseau';
import { FUSEAU_REFERENCE } from '../domaine/temps/fuseau-reference';
import { Instant } from '../domaine/temps/instant';

// Seul fichier autorisé à lire l'heure, l'horloge monotone et le fuseau système (conventions.md §7.2).
export class HorlogeSysteme implements Horloge {
  readonly fuseauReference: Fuseau = FUSEAU_REFERENCE;

  maintenant(): Instant {
    return Instant.depuisMillisecondes(Date.now());
  }

  monotone(): EcartTemps {
    return EcartTemps.depuisMillisecondes(Math.floor(performance.now()));
  }

  fuseauAppareil(): Fuseau {
    return Intl.DateTimeFormat().resolvedOptions().timeZone as Fuseau;
  }
}
