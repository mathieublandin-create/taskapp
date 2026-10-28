import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import { SeDeconnecter } from '@src/compte/application/cas-usage/se-deconnecter';
import { SessionCourante } from '@src/compte/application/session-courante';
import {
  AvisOngletsEnMemoire,
  DepotAvantSortieSimule,
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  MemoireSessionEnMemoire,
} from '@tests/support/compte/doublures-compte';

const preparer = (enAttente: number, restants: number | undefined) => {
  const depot = new DepotAvantSortieSimule(enAttente, restants);
  const fournisseur = new FournisseurScripte();
  const memoireSession = new MemoireSessionEnMemoire({ identite: IDENTITE_A, accesPerdu: false });
  const espaces = new EspacesEnMemoire([IDENTITE_A.compte]);
  espaces.ouvert = IDENTITE_A.compte;
  const session = new SessionCourante();
  session.ouvrir(IDENTITE_A, 'VALIDE');
  const ordre: Array<string> = [];
  const avis = new AvisOngletsEnMemoire(ordre);
  fournisseur.ordre = ordre;
  memoireSession.ordre = ordre;
  espaces.ordre = ordre;
  const cas = new SeDeconnecter({ depot, fournisseur, memoireSession, espaces, avis, session });
  return { cas, depot, fournisseur, memoireSession, espaces, avis, session, ordre };
};

describe('SeDeconnecter (RG-043, ST-US-022 §6.5)', () => {
  it('UT-US-022-28 evaluer — se déconnecte sans confirmation ni dépôt quand rien n’est en attente (S09b)', async () => {
    const env = preparer(0, 0);

    expect(await env.cas.evaluer()).toEqual(succes({ type: 'SANS_CONFIRMATION' }));
    expect(env.depot.tentatives).toBe(0);
  });

  it('UT-US-022-29 evaluer — tente d’abord un dépôt puis annonce les modifications restantes (S09c, S09d)', async () => {
    const restantes = preparer(2, 2);
    const deposees = preparer(2, 0);

    expect(await restantes.cas.evaluer()).toEqual(
      succes({ type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-DECONNEXION', n: 2 } }),
    );
    expect(restantes.depot.tentatives).toBe(1);
    expect(await deposees.cas.evaluer()).toEqual(succes({ type: 'SANS_CONFIRMATION' }));
  });

  it('UT-US-022-30 executer — oublie le jeton et la session, ferme l’espace sans le supprimer (RG-043, DEC-015)', async () => {
    const env = preparer(1, undefined);

    expect(await env.cas.executer()).toEqual(succes(undefined));

    expect(env.fournisseur.oublis).toBe(1);
    expect(env.memoireSession.session).toBeUndefined();
    expect(env.espaces.ouvert).toBeUndefined();
    expect(await env.espaces.existeUnEspace()).toBe(true);
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
  });

  it('UT-US-022-56 executer — prévient les autres onglets après avoir effacé la session mémorisée, avant de fermer l’espace (DAT v0.11.4 §4.1.6, RL-LOT-001-A1)', async () => {
    const env = preparer(0, 0);

    await env.cas.executer();

    expect(env.ordre).toEqual([
      'fournisseur.oublier',
      'memoireSession.effacer',
      'avis.diffuser:SESSION_FERMEE',
      'espaces.fermer',
    ]);
  });
});
