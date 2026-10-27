import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { MotifRejetRetour } from '../../application/ports/fournisseur-auth';
import type { DepartMemorise } from '../../application/ports/memoire-redirection';

// RED-03 : comparaison de la chaîne entière ; expiré si maintenant > expireA ; accepté à expireA exactement.
export const verifierRetour = (_p: {
  readonly stateRecu: string | undefined;
  readonly depart: DepartMemorise | undefined;
  readonly maintenant: Instant;
}): Resultat<DepartMemorise, MotifRejetRetour> => nonImplemente('verifierRetour');
