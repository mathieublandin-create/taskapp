import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import { SupprimerDonneesAppareil } from '@src/compte/application/cas-usage/supprimer-donnees-appareil';
import { SessionCourante } from '@src/compte/application/session-courante';
import {
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
  const cas = new SupprimerDonneesAppareil({ depot, fournisseur, memoireSession, espaces, session });
  return { cas, depot, fournisseur, memoireSession, espaces, session };
};

describe('SupprimerDonneesAppareil (RG-055, ST-US-022 §6.6)', () => {
  it('UT-US-022-31 confirmer — annonce 3 modifications perdues sans rien supprimer quand le dépôt est impossible (S17a, S17b)', async () => {
    const env = preparer(3, undefined);

    expect(await env.cas.evaluer()).toEqual(
      succes({ type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-SUPPR-DONNEES' } }),
    );
    expect(await env.cas.confirmer()).toEqual(
      succes({ type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-SUPPR-DONNEES-PERTE', n: 3 } }),
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
});
