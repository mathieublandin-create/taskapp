import { nonImplemente } from '@non-implemente';
import type { Annulation } from '../../commun/application/ports/planificateur';
import type { EtatAcces } from '../domaine/acces';
import type { Identite } from '../domaine/identite';

// ST-US-022 §4.2 : état de la session en mémoire, observable.
export type EtatSession =
  | { readonly type: 'SANS_SESSION' }
  | { readonly type: 'ATTENTE_GOOGLE'; readonly identite: Identite }
  | { readonly type: 'OUVERTE'; readonly identite: Identite; readonly acces: EtatAcces };

export class SessionCourante {
  etat(): EtatSession {
    return nonImplemente('SessionCourante.etat');
  }

  ouvrir(_identite: Identite, _acces: EtatAcces): void {
    nonImplemente('SessionCourante.ouvrir');
  }

  attendreGoogle(_identite: Identite): void {
    nonImplemente('SessionCourante.attendreGoogle');
  }

  /** ErreurProgrammation si aucune session n'est ouverte. */
  changerAcces(_acces: EtatAcces): void {
    nonImplemente('SessionCourante.changerAcces');
  }

  fermer(): void {
    nonImplemente('SessionCourante.fermer');
  }

  observer(_rappel: (etat: EtatSession) => void): Annulation {
    return nonImplemente('SessionCourante.observer');
  }
}
