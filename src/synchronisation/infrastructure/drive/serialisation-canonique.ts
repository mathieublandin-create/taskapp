import { nonImplemente } from '@non-implemente';

// conventions.md §10.3 : une seule sérialisation canonique, utilisée à l'écriture et à la lecture.
/** JSON sans espace, clés d'objet triées (ordre des unités de code) à tous les niveaux, tableaux dans l'ordre. */
export const serialiserCanonique = (_valeur: unknown): string =>
  nonImplemente('serialiserCanonique');

/** SHA-256 de l'UTF-8 du texte, en hexadécimal minuscule (crypto.subtle). */
export const empreinteSha256 = (_texte: string): Promise<string> =>
  nonImplemente('empreinteSha256');
