import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../application/ports/horloge';
import type { EcartTemps } from '../domaine/temps/ecart-temps';
import type { Fuseau } from '../domaine/temps/fuseau';
import { FUSEAU_REFERENCE } from '../domaine/temps/fuseau-reference';
import type { Instant } from '../domaine/temps/instant';

// Seul fichier autorisé à lire l'heure, l'horloge monotone et le fuseau système (conventions.md §7.2).
export class HorlogeSysteme implements Horloge {
  readonly fuseauReference: Fuseau = FUSEAU_REFERENCE;

  maintenant(): Instant {
    return nonImplemente('HorlogeSysteme.maintenant');
  }

  monotone(): EcartTemps {
    return nonImplemente('HorlogeSysteme.monotone');
  }

  fuseauAppareil(): Fuseau {
    return nonImplemente('HorlogeSysteme.fuseauAppareil');
  }
}
