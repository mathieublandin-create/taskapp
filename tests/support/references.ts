/**
 * Résolution des intitulés des scénarios (conventions.md §11.7). Parmi les éléments non supprimés du type
 * demandé, l'unique élément qui porte cet intitulé ; s'il n'y en a aucun, l'élément mémorisé sous cet intitulé
 * à sa création ou à son dernier renommage (pour « n'existe plus ») ; s'il y en a plusieurs, l'étape échoue.
 */
export type Candidat<Id extends string> = {
  readonly id: Id;
  readonly intitule: string;
  readonly supprime: boolean;
};

export class References {
  private readonly memorises = new Map<string, string>();

  /** Mémorise l'identifiant sous l'intitulé qu'il porte à la création ou au dernier renommage. */
  memoriser(nature: string, intitule: string, id: string): void {
    this.memorises.set(this.cle(nature, intitule), id);
  }

  resoudre<Id extends string>(
    nature: string,
    intitule: string,
    candidats: Iterable<Candidat<Id>>,
  ): Id {
    const correspondants = [...candidats].filter((c) => !c.supprime && c.intitule === intitule);
    if (correspondants.length > 1) {
      throw new Error(
        `Intitulé ambigu : ${nature} « ${intitule} » désigne ${String(correspondants.length)} éléments`,
      );
    }
    const unique = correspondants[0];
    if (unique !== undefined) return unique.id;
    const memorise = this.memorises.get(this.cle(nature, intitule));
    if (memorise === undefined) {
      throw new Error(`Intitulé inconnu : ${nature} « ${intitule} »`);
    }
    return memorise as Id;
  }

  private cle(nature: string, intitule: string): string {
    return `${nature}/${intitule}`;
  }
}
