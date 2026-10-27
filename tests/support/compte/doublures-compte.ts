/**
 * Doublures simples des ports du contexte compte, pour les tests unitaires des cas d'usage (ST-US-022 §13).
 * Complètes dès E10 (code de test) ; les doublures du banc Cucumber (FauxFournisseurAuth, FauxGoogle) sont
 * spécifiées au §12.3 et réalisées par Benjamin.
 */
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type {
  EntreeJournalTechnique,
  JournalTechnique,
} from '@src/commun/application/ports/journal-technique';
import type { Annulation } from '@src/commun/application/ports/planificateur';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotAvantSortie,
  IssueDepotAvantSortie,
} from '@src/compte/application/ports/depot-avant-sortie';
import type {
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  RetourAccepte,
  RetourGoogle,
} from '@src/compte/application/ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '@src/compte/application/ports/gestion-espaces';
import type {
  DepartMemorise,
  ErreurMemoireTechnique,
  MemoireRedirection,
} from '@src/compte/application/ports/memoire-redirection';
import type { MemoireSession, SessionMemorisee } from '@src/compte/application/ports/memoire-session';
import type {
  ErreurPreparation,
  PreparationStockage,
} from '@src/compte/application/ports/preparation-stockage';
import type { AdresseGoogle, IdCompte, Identite } from '@src/compte/domaine/identite';

export const compte = (sub: string): IdCompte => sub as IdCompte;
export const adresse = (texte: string): AdresseGoogle => texte as AdresseGoogle;
export const IDENTITE_A: Identite = { compte: compte('sub-A'), adresse: adresse('a@exemple.test') };
export const IDENTITE_B: Identite = { compte: compte('sub-B'), adresse: adresse('b@exemple.test') };

export class ReseauFixe implements EtatReseau {
  constructor(public connecte: boolean) {}
  estConnecte(): boolean {
    return this.connecte;
  }
  surChangement(): Annulation {
    return () => undefined;
  }
}

export class JournalEnMemoire implements JournalTechnique {
  readonly entrees: EntreeJournalTechnique[] = [];
  consigner(entree: EntreeJournalTechnique): void {
    this.entrees.push(entree);
  }
}

export class MemoireSessionEnMemoire implements MemoireSession {
  constructor(public session: SessionMemorisee | undefined = undefined) {}
  lire(): Promise<SessionMemorisee | undefined> {
    return Promise.resolve(this.session);
  }
  ecrire(session: SessionMemorisee): Promise<Resultat<undefined, ErreurMemoireTechnique>> {
    this.session = session;
    return Promise.resolve(succes(undefined));
  }
  effacer(): Promise<void> {
    this.session = undefined;
    return Promise.resolve();
  }
}

export class MemoireRedirectionEnMemoire implements MemoireRedirection {
  consommations = 0;
  constructor(public depart: DepartMemorise | undefined = undefined) {}
  memoriser(depart: DepartMemorise): Promise<Resultat<undefined, ErreurMemoireTechnique>> {
    this.depart = depart;
    return Promise.resolve(succes(undefined));
  }
  consommer(): Promise<DepartMemorise | undefined> {
    this.consommations += 1;
    const depart = this.depart;
    this.depart = undefined;
    return Promise.resolve(depart);
  }
}

export class EspacesEnMemoire implements GestionEspaces {
  readonly existants = new Set<string>();
  ouvert: IdCompte | undefined;
  constructor(existants: ReadonlyArray<IdCompte> = []) {
    existants.forEach((c) => this.existants.add(c));
  }
  ouvrir(c: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    this.existants.add(c);
    this.ouvert = c;
    return Promise.resolve(succes(undefined));
  }
  fermer(): Promise<void> {
    this.ouvert = undefined;
    return Promise.resolve();
  }
  existeUnEspace(): Promise<boolean> {
    return Promise.resolve(this.existants.size > 0);
  }
  supprimer(c: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    this.existants.delete(c);
    if (this.ouvert === c) this.ouvert = undefined;
    return Promise.resolve(succes(undefined));
  }
}

/** Dépôt simulé : `restantsApresDepot` modifications restent après une tentative (undefined = pas de dépôt possible). */
export class DepotAvantSortieSimule implements DepotAvantSortie {
  tentatives = 0;
  constructor(
    public enAttente: number,
    private readonly restantsApresDepot: number | undefined,
  ) {}
  compterEnAttente(): Promise<number> {
    return Promise.resolve(this.enAttente);
  }
  deposerSiPossible(): Promise<IssueDepotAvantSortie> {
    if (this.restantsApresDepot === undefined) return Promise.resolve('NON_TENTE');
    this.tentatives += 1;
    this.enAttente = this.restantsApresDepot;
    return Promise.resolve(this.enAttente === 0 ? 'DEPOSE' : 'ECHEC');
  }
}

export class PreparationSimulee implements PreparationStockage {
  appels = 0;
  constructor(private readonly erreur: ErreurPreparation | undefined = undefined) {}
  preparer(): Promise<Resultat<undefined, ErreurPreparation>> {
    this.appels += 1;
    return Promise.resolve(this.erreur === undefined ? succes(undefined) : echec(this.erreur));
  }
}

/** Fournisseur scripté : réponses fixées par le test, demandes observées. */
export class FournisseurScripte implements FournisseurAuth {
  readonly demandes: DemandeJeton[] = [];
  readonly retoursRecus: Array<{ retour: RetourGoogle; depart: DepartMemorise | undefined }> = [];
  oublis = 0;
  reponseDemande: Resultat<IssueDemandeJeton, ErreurAuth> = succes({ type: 'REDIRECTION_LANCEE' });
  reponseRetour: Resultat<RetourAccepte, ErreurAuth> = echec({ type: 'SessionARenouveler', code: 'interaction_required' });
  demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    this.demandes.push(demande);
    return Promise.resolve(this.reponseDemande);
  }
  recevoirRetour(p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    this.retoursRecus.push({ retour: p.retour, depart: p.depart });
    return Promise.resolve(this.reponseRetour);
  }
  oublier(): void {
    this.oublis += 1;
  }
}
