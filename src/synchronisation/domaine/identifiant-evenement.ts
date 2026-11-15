import type { IdOperation } from '../../commun/domaine/identifiants';
import type { Marque } from '../../commun/domaine/marque';
import { FORME_CONDENSAT_BASE32HEX } from './condensat-sha256';

// ST-socle-ecriture.md §6.7, DAT v0.10.2 §6.1 : `${operation}:${rang}`, rang décimal sans zéros de tête ; opaque.
// ST-US-017 v0.6 §6.6 n° 9 d, DAT v0.11.8 §6.1 : une entrée produite par la fusion (réparation RG-048) porte un
// identifiant déterministe, condensat encodé en base32hex (52 caractères `[0-9a-v]`, sans « : »).
export type IdEvenement = Marque<string, 'IdEvenement'>;

export const idEvenement = (operation: IdOperation, rang: number): IdEvenement =>
  `${operation}:${String(rang)}` as IdEvenement;

const FORME_ID_EVENEMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:(0|[1-9][0-9]*)$/;

/**
 * Forme de l'identifiant d'une entrée de réparation (§6.6 n° 9 d) : jamais confondue avec `${operation}:${rang}`. Par
 * construction (`idValeurEcartee`), celle d'un identifiant de valeur écartée (`FORME_ID_VALEUR_ECARTEE`, CR-22) ; prise
 * dans `condensat-sha256.ts`, car `valeurs-ecartees.ts` dépend déjà de ce module (pas de cycle).
 */
export const FORME_ID_EVENEMENT_REPARATION = FORME_CONDENSAT_BASE32HEX;

/**
 * Relit un identifiant d'événement stocké (base locale et fichier Drive) ; undefined s'il n'a ni la forme
 * `${operation}:${rang}` ni celle d'une entrée de réparation.
 */
export const lireIdEvenement = (texte: string): IdEvenement | undefined =>
  FORME_ID_EVENEMENT.test(texte) || FORME_ID_EVENEMENT_REPARATION.test(texte)
    ? (texte as IdEvenement)
    : undefined;
