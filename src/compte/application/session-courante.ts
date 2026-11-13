import type { Annulation } from '../../commun/application/ports/planificateur';
import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import type { EtatAcces } from '../domaine/acces';
import type { Identite } from '../domaine/identite';

// ST-US-022 §4.2 : état de la session en mémoire, observable.
export type EtatSession =
  | { readonly type: 'SANS_SESSION' }
  | { readonly type: 'ATTENTE_GOOGLE'; readonly identite: Identite }
  | { readonly type: 'OUVERTE'; readonly identite: Identite; readonly acces: EtatAcces };

export class SessionCourante {
  #etat: EtatSession = { type: 'SANS_SESSION' };
  readonly #observateurs = new Set<(etat: EtatSession) => void>();

  etat(): EtatSession {
    return this.#etat;
  }

  ouvrir(identite: Identite, acces: EtatAcces): void {
    this.#changer({ type: 'OUVERTE', identite, acces });
  }

  attendreGoogle(identite: Identite): void {
    this.#changer({ type: 'ATTENTE_GOOGLE', identite });
  }

  /** ErreurProgrammation si aucune session n'est ouverte. */
  changerAcces(acces: EtatAcces): void {
    const etat = this.#etat;
    if (etat.type !== 'OUVERTE') {
      throw new ErreurProgrammation('changerAcces sans session ouverte');
    }
    if (etat.acces !== acces) this.#changer({ ...etat, acces });
  }

  fermer(): void {
    if (this.#etat.type !== 'SANS_SESSION') this.#changer({ type: 'SANS_SESSION' });
  }

  observer(rappel: (etat: EtatSession) => void): Annulation {
    this.#observateurs.add(rappel);
    return () => {
      this.#observateurs.delete(rappel);
    };
  }

  #changer(etat: EtatSession): void {
    this.#etat = etat;
    [...this.#observateurs].forEach((rappel) => {
      rappel(etat);
    });
  }
}
