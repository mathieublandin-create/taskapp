import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../application/ports/generateur-identifiants';

// DS-08 : fondé sur la fonction v7 du paquet uuid (conventions.md §7.5).
export class GenerateurUuidV7 implements GenerateurIdentifiants {
  genererUuidV7(): string {
    return nonImplemente('GenerateurUuidV7.genererUuidV7');
  }
}
