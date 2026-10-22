import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '@src/commun/application/ports/generateur-identifiants';

/**
 * Doublure du port GenerateurIdentifiants (conventions.md §7.5). Squelette E10 : réalisée par Benjamin.
 * Produit des UUID v7 valides et prévisibles : `00000000-0000-7000-80<pp>-<n sur 12 chiffres>`, où
 * `pp` est le préfixe d'appareil (2 chiffres hexadécimaux, `00` par défaut, ST-socle §12) et `n` le
 * compteur décimal, qui commence à 1. Exemple, préfixe par défaut : `00000000-0000-7000-8000-000000000001`, puis `…002`.
 */
export class GenerateurIdentifiantsSequentiel implements GenerateurIdentifiants {
  constructor(private readonly prefixeAppareil = '00') {}

  genererUuidV7(): string {
    return nonImplemente('GenerateurIdentifiantsSequentiel.genererUuidV7');
  }
}
