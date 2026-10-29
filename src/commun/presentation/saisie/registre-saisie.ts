// GardeSaisie réel (DAT §4.1.7, ST-US-022 §3.1 n° 10) : les formulaires de l'interface déclarent s'ils sont ouverts et
// modifiés ; une saisie en cours empêche tout geste qui recharge la page (aucune redirection vers Google).
export class RegistreSaisie {
  readonly #formulairesModifies = new Set<string>();

  /** Déclare l'état d'un formulaire ; `identifiant` est propre au formulaire (un seul état par formulaire). */
  readonly declarer = (identifiant: string, modifie: boolean): void => {
    if (modifie) this.#formulairesModifies.add(identifiant);
    else this.#formulairesModifies.delete(identifiant);
  };

  readonly saisieEnCours = (): boolean => this.#formulairesModifies.size > 0;
}

/** Registre unique de la page : lu par la composition (GardeSaisie), alimenté par les formulaires. */
export const registreSaisie = new RegistreSaisie();
