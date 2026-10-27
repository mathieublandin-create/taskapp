import type { SourceAleatoire } from '@src/commun/application/ports/source-aleatoire';

/**
 * Doublure du port SourceAleatoire (conventions.md §7.4, §11.10), complète dès E10 (code de test) :
 * `entierEntre(min, max)` renvoie, borné à [min, max], le prochain nombre de la séquence (cyclique) ;
 * `octets(n)` renvoie n octets 0, 1, 2… (modulo 256), prévisibles.
 */
export class SourceAleatoireDeterministe implements SourceAleatoire {
  private rang = 0;

  constructor(private readonly sequence: ReadonlyArray<number>) {}

  entierEntre(min: number, max: number): number {
    const valeur = this.sequence[this.rang % this.sequence.length] ?? min;
    this.rang += 1;
    return Math.min(max, Math.max(min, valeur));
  }

  octets(n: number): Uint8Array {
    return Uint8Array.from({ length: n }, (_v, i) => i % 256);
  }
}
