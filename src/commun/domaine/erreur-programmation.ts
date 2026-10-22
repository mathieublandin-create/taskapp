// conventions.md §8.1 : seule classe d'erreur levée (invariant violé, état impossible).
export class ErreurProgrammation extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurProgrammation';
  }
}
