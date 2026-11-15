import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { MotifRejetRetour } from '../../application/ports/fournisseur-auth';
import type { DepartMemorise } from '../../application/ports/memoire-redirection';

// RED-03 : comparaison de la chaîne entière ; expiré si maintenant > expireA ; accepté à expireA exactement.
export const verifierRetour = (p: {
  readonly stateRecu: string | undefined;
  readonly depart: DepartMemorise | undefined;
  readonly maintenant: Instant;
}): Resultat<DepartMemorise, MotifRejetRetour> => {
  if (p.depart === undefined) return echec('SANS_DEPART');
  if (p.stateRecu === undefined || p.stateRecu === '') return echec('STATE_ABSENT');
  if (p.stateRecu !== p.depart.state) return echec('STATE_INCONNU');
  if (p.maintenant > p.depart.expireA) return echec('STATE_EXPIRE');
  return succes(p.depart);
};
