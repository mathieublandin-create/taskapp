import { nonImplemente } from '@non-implemente';
import type { Horloge } from '@src/commun/application/ports/horloge';
import type { Resultat } from '@src/commun/domaine/resultat';
import type {
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  RetourAccepte,
  RetourGoogle,
} from '@src/compte/application/ports/fournisseur-auth';
import type {
  DepartMemorise,
  MemoireRedirection,
} from '@src/compte/application/ports/memoire-redirection';
import type { IdCompte, Identite } from '@src/compte/domaine/identite';

/**
 * Doublure du port FournisseurAuth (ST-US-022 §12.3, conventions.md §11.10). Squelette E11 : réalisée par
 * Benjamin au rang 1. Contrat : tests/contrats/fournisseur-auth.contrat.ts (CT-AUTH-01 à 09).
 * Google simulé pour un compte :
 * - `accorder(identite, portees?)` : l'utilisateur accepte (portées accordées : toutes par défaut) ;
 *   `sessionGoogle(identite)` : session Google active, une redirection silencieuse revient avec un jeton ;
 * - `fermerLaProchaineFenetre()` : la prochaine fenêtre (geste ou connexion) est fermée (popup_closed) ;
 * - `retirerAcces()` : l'accès à l'application est retiré (access_denied au prochain geste) ;
 * - `panneTechniqueGis()` : la prochaine fenêtre GIS échoue pour une cause technique (popup_failed_to_open),
 *   d'où le repli par redirection interactive ;
 * - `acheverRedirection()` : rend le retour que Google placerait dans le fragment pour la dernière redirection
 *   lancée (jeton, ou erreur `interaction_required` sans session Google), avec le `state` mémorisé.
 * Les redirections passent par la `MemoireRedirection` fournie, comme l'adaptateur réel.
 */
export class FauxFournisseurAuth implements FournisseurAuth {
  constructor(
    private readonly dependances: {
      readonly memoireRedirection: MemoireRedirection;
      readonly horloge: Horloge;
    },
  ) {}

  accorder(_identite: Identite, _portees?: ReadonlyArray<string>): void {
    nonImplemente('FauxFournisseurAuth.accorder');
  }

  sessionGoogle(_identite: Identite): void {
    nonImplemente('FauxFournisseurAuth.sessionGoogle');
  }

  fermerLaProchaineFenetre(): void {
    nonImplemente('FauxFournisseurAuth.fermerLaProchaineFenetre');
  }

  retirerAcces(): void {
    nonImplemente('FauxFournisseurAuth.retirerAcces');
  }

  panneTechniqueGis(): void {
    nonImplemente('FauxFournisseurAuth.panneTechniqueGis');
  }

  acheverRedirection(): RetourGoogle {
    return nonImplemente('FauxFournisseurAuth.acheverRedirection');
  }

  demanderJeton(_demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    return nonImplemente('FauxFournisseurAuth.demanderJeton');
  }

  recevoirRetour(_p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    return nonImplemente('FauxFournisseurAuth.recevoirRetour');
  }

  oublier(): void {
    nonImplemente('FauxFournisseurAuth.oublier');
  }
}
