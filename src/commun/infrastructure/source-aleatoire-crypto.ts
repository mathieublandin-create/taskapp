import { ErreurProgrammation } from '../domaine/erreur-programmation';
import type { SourceAleatoire } from '../application/ports/source-aleatoire';

const VALEURS_32_BITS = 2 ** 32;

// conventions.md §7.4 : crypto.getRandomValues, seule source de hasard de src/.
export class SourceAleatoireCrypto implements SourceAleatoire {
  octets(n: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(n));
  }

  /** Entier uniforme dans [min, max], par rejet pour éviter le biais du modulo. */
  entierEntre(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
      throw new ErreurProgrammation(`Intervalle invalide : [${String(min)}, ${String(max)}]`);
    }
    const etendue = max - min + 1;
    if (etendue > VALEURS_32_BITS) {
      throw new ErreurProgrammation('Intervalle trop large (32 bits au plus)');
    }
    const limite = VALEURS_32_BITS - (VALEURS_32_BITS % etendue);
    let tirage = this.tirer32Bits();
    while (tirage >= limite) tirage = this.tirer32Bits();
    return min + (tirage % etendue);
  }

  private tirer32Bits(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  }
}
