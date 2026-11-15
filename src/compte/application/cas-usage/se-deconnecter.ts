import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurSansSession, EvaluationCompte } from '../evaluation';
import type { AvisOnglets } from '../ports/avis-onglets';
import type { DepotAvantSortie } from '../ports/depot-avant-sortie';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';
import { identiteCourante } from '../session-ouverte';

// ST-US-022 §6.5 (RG-043, CA-6 ; avis aux autres onglets : DAT v0.11.4 §4.1.6).
export type DependancesSeDeconnecter = {
  readonly depot: DepotAvantSortie;
  readonly fournisseur: FournisseurAuth;
  readonly memoireSession: MemoireSession;
  readonly espaces: GestionEspaces;
  readonly avis: AvisOnglets;
  readonly session: SessionCourante;
};

/** Décompte après une tentative de dépôt, seulement s'il reste des modifications (CA-6, CA-10). */
export const compterApresDepot = async (depot: DepotAvantSortie): Promise<number> => {
  const avant = await depot.compterEnAttente();
  if (avant === 0) return 0;
  await depot.deposerSiPossible();
  return depot.compterEnAttente();
};

const SANS_SESSION: ErreurSansSession = { type: 'SansSession' };

export class SeDeconnecter {
  constructor(private readonly dependances: DependancesSeDeconnecter) {}

  /** Tente d'abord un dépôt (écart documenté à conventions §8.6), puis compte. */
  async evaluer(): Promise<Resultat<EvaluationCompte, ErreurSansSession>> {
    if (identiteCourante(this.dependances.session) === undefined) return echec(SANS_SESSION);
    const n = await compterApresDepot(this.dependances.depot);
    return succes(
      n === 0
        ? { type: 'SANS_CONFIRMATION' }
        : { type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-DECONNEXION', n } },
    );
  }

  /** Ordre imposé : oublier → effacer → prévenir les autres onglets → fermer l'espace (UT-US-022-56). */
  async executer(): Promise<Resultat<undefined, ErreurSansSession>> {
    const { fournisseur, memoireSession, avis, espaces, session } = this.dependances;
    if (identiteCourante(session) === undefined) return echec(SANS_SESSION);
    fournisseur.oublier();
    await memoireSession.effacer();
    avis.diffuser('SESSION_FERMEE');
    await espaces.fermer();
    session.fermer();
    return succes(undefined);
  }
}
