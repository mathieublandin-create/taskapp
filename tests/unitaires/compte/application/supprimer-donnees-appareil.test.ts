import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import { SupprimerDonneesAppareil } from '@src/compte/application/cas-usage/supprimer-donnees-appareil';
import { SessionCourante } from '@src/compte/application/session-courante';
import {
  AvisOngletsEnMemoire,
  DepotAvantSortieSimule,
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  IDENTITE_B,
  MemoireSessionEnMemoire,
} from '@tests/support/compte/doublures-compte';

const preparer = (enAttente: number, restants: number | undefined) => {
  const depot = new DepotAvantSortieSimule(enAttente, restants);
  const fournisseur = new FournisseurScripte();
  const memoireSession = new MemoireSessionEnMemoire({ identite: IDENTITE_B, accesPerdu: false });
  const espaces = new EspacesEnMemoire([IDENTITE_A.compte, IDENTITE_B.compte]);
  espaces.ouvert = IDENTITE_B.compte;
  const session = new SessionCourante();
  session.ouvrir(IDENTITE_B, 'VALIDE');
  const ordre: Array<string> = [];
  const avis = new AvisOngletsEnMemoire(ordre);
  fournisseur.ordre = ordre;
  memoireSession.ordre = ordre;
  espaces.ordre = ordre;
  const cas = new SupprimerDonneesAppareil({
    depot,
    fournisseur,
    memoireSession,
    espaces,
    avis,
    session,
  });
  return { cas, depot, fournisseur, memoireSession, espaces, avis, session, ordre };
};

describe('SupprimerDonneesAppareil (RG-055, ST-US-022 §6.6)', () => {
  it('UT-US-022-31 confirmer — annonce 3 modifications perdues sans rien supprimer quand le dépôt est impossible (S17a, S17b)', async () => {
    const env = preparer(3, undefined);

    expect(await env.cas.evaluer()).toEqual(
      succes({ type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-SUPPR-DONNEES' } }),
    );
    expect(await env.cas.confirmer()).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: { code: 'CNF-SUPPR-DONNEES-PERTE', n: 3 },
      }),
    );
    expect([...env.espaces.existants]).toEqual([IDENTITE_A.compte, IDENTITE_B.compte]);
    expect(env.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_B, acces: 'VALIDE' });
  });

  it('UT-US-022-32 confirmer et confirmerPerte — suppriment le seul espace du compte connecté et ferment la session (S15, S19)', async () => {
    const deposable = preparer(1, 0);
    const perte = preparer(2, undefined);

    expect(await deposable.cas.confirmer()).toEqual(succes({ type: 'SUPPRIMEES' }));
    await perte.cas.confirmer();
    expect(await perte.cas.confirmerPerte()).toEqual(succes({ type: 'SUPPRIMEES' }));

    [deposable, perte].forEach((env) => {
      expect([...env.espaces.existants]).toEqual([IDENTITE_A.compte]);
      expect(env.memoireSession.session).toBeUndefined();
      expect(env.fournisseur.oublis).toBe(1);
      expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
    });
    expect(deposable.depot.tentatives).toBe(1);
  });

  it('UT-US-022-56 confirmer — efface la session mémorisée, prévient les autres onglets, puis supprime l’espace et oublie le jeton (RL-LOT-001-A1)', async () => {
    const env = preparer(0, 0);

    expect(await env.cas.confirmer()).toEqual(succes({ type: 'SUPPRIMEES' }));

    expect(env.ordre).toEqual([
      'memoireSession.effacer',
      'avis.diffuser:SESSION_FERMEE',
      'espaces.supprimer',
      'fournisseur.oublier',
    ]);
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
  });

  it('UT-US-022-57 confirmer — suppression bloquée par une autre fenêtre : ERR-017, ni jeton oublié ni session fermée ; « Réessayer » aboutit (guide v0.2.15)', async () => {
    const env = preparer(0, 0);
    env.espaces.suppressionsBloquees = 1;

    expect(await env.cas.confirmer()).toEqual(succes({ type: 'SUPPRESSION_BLOQUEE' }));
    expect(env.fournisseur.oublis).toBe(0);
    expect(env.memoireSession.session).toBeUndefined();
    expect(env.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_B, acces: 'VALIDE' });

    expect(await env.cas.reessayer()).toEqual(succes({ type: 'SUPPRIMEES' }));
    expect([...env.espaces.existants]).toEqual([IDENTITE_A.compte]);
    expect(env.fournisseur.oublis).toBe(1);
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
    expect(env.avis.diffusions).toEqual(['SESSION_FERMEE']);
  });

  it('UT-US-022-57 fermerApresBlocage — « Fermer » d’ERR-017 : jeton oublié, session fermée, aucune nouvelle demande de suppression', async () => {
    const env = preparer(0, 0);
    env.espaces.suppressionsBloquees = 1;
    await env.cas.confirmer();

    expect(await env.cas.fermerApresBlocage()).toEqual(succes(undefined));

    expect(env.fournisseur.oublis).toBe(1);
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
    expect(env.ordre.filter((appel) => appel === 'espaces.supprimer')).toHaveLength(1);
  });
});
