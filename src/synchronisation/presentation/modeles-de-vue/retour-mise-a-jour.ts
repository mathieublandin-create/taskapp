import { libelle } from '../../../commun/presentation/messages/libelle';
import type { IssueMiseAJour } from '../../application/ports/mise-a-jour-application';

// Retour de l'action « Mettre à jour » (ST-US-017 v0.11 §6.8 n° 10 ; guide v0.2.23 §6.6.14 a) : texte seul d'une variante
// d'`ERR-013`, affiché dans une ligne `role="status"` sous le bandeau ou la carte, sans toast. L'action reste présente,
// sauf pendant `rechargement` (désactivée avec `aria-disabled`).
export type RetourMiseAJour = {
  readonly texte: string;
  readonly actionDesactivee: boolean;
};

const VARIANTE_DE_L_ISSUE: Readonly<Record<IssueMiseAJour, string>> = {
  RECHARGEMENT_LANCE: 'rechargement',
  AUCUNE_VERSION: 'aucune-version',
  ECHEC: 'echec',
};

export const construireRetourMiseAJour = (
  issue: IssueMiseAJour | undefined,
): RetourMiseAJour | undefined =>
  issue === undefined
    ? undefined
    : {
        texte: libelle('ERR-013', { variante: VARIANTE_DE_L_ISSUE[issue] }, 'texte'),
        actionDesactivee: issue === 'RECHARGEMENT_LANCE',
      };
