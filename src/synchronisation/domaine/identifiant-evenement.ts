import type { IdOperation } from '../../commun/domaine/identifiants';
import type { Marque } from '../../commun/domaine/marque';

// ST-socle-ecriture.md §6.7, DAT v0.10.2 §6.1 : `${operation}:${rang}`, rang décimal sans zéros de tête ; opaque.
export type IdEvenement = Marque<string, 'IdEvenement'>;

export const idEvenement = (operation: IdOperation, rang: number): IdEvenement =>
  `${operation}:${String(rang)}` as IdEvenement;

const FORME_ID_EVENEMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:(0|[1-9][0-9]*)$/;

/** Relit un identifiant d'événement stocké ; undefined s'il n'a pas la forme `${operation}:${rang}`. */
export const lireIdEvenement = (texte: string): IdEvenement | undefined =>
  FORME_ID_EVENEMENT.test(texte) ? (texte as IdEvenement) : undefined;
