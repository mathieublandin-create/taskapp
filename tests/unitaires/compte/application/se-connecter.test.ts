import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { SeConnecter } from '@src/compte/application/cas-usage/se-connecter';
import { SessionCourante } from '@src/compte/application/session-courante';
import {
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  MemoireSessionEnMemoire,
  PreparationSimulee,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';
import type { ErreurPreparation } from '@src/compte/application/ports/preparation-stockage';

const preparer = (options: { connecte?: boolean; erreurPreparation?: ErreurPreparation } = {}) => {
  const fournisseur = new FournisseurScripte();
  fournisseur.reponseDemande = succes({
    type: 'ACCES_OBTENU',
    acces: {
      porteesAccordees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
      identite: IDENTITE_A,
    },
  });
  const espaces = new EspacesEnMemoire();
  const memoireSession = new MemoireSessionEnMemoire();
  const session = new SessionCourante();
  const preparation = new PreparationSimulee(options.erreurPreparation);
  const cas = new SeConnecter({
    reseau: new ReseauFixe(options.connecte ?? true),
    fournisseur,
    preparation,
    espaces,
    memoireSession,
    session,
  });
  return { cas, fournisseur, espaces, memoireSession, session, preparation };
};

const verifierRienCree = async (env: ReturnType<typeof preparer>) => {
  expect(await env.espaces.existeUnEspace()).toBe(false);
  expect(env.memoireSession.session).toBeUndefined();
  expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
};

describe('SeConnecter (ST-US-022 §6.7)', () => {
  it('UT-US-022-21 SeConnecter — renvoie ERR-001 et ne crée rien quand l’utilisateur ferme la fenêtre de Google (CA-4, S06)', async () => {
    const env = preparer();
    env.fournisseur.reponseDemande = echec({ type: 'ConnexionAnnulee' });

    const resultat = await env.cas.executer();

    expect(resultat).toEqual(echec({ type: 'ConnexionImpossible', motif: 'ERR-001' }));
    expect(env.fournisseur.demandes.map((d) => [d.mode, d.indice])).toEqual([
      ['CONNEXION', undefined],
    ]);
    await verifierRienCree(env);
  });

  it('UT-US-022-22 SeConnecter — renvoie ERR-002 et oublie le jeton quand drive.file est refusée (CA-4)', async () => {
    const env = preparer();
    env.fournisseur.reponseDemande = echec({
      type: 'PorteeInsuffisante',
      manquantes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const resultat = await env.cas.executer();

    expect(resultat).toEqual(echec({ type: 'ConnexionImpossible', motif: 'ERR-002' }));
    expect(env.preparation.appels).toBe(0);
    await verifierRienCree(env);
  });

  it('UT-US-022-23 SeConnecter — renvoie ERR-003 sans demander de jeton quand le réseau manque et qu’aucun espace n’existe (S20a)', async () => {
    const env = preparer({ connecte: false });

    const resultat = await env.cas.executer();

    expect(resultat).toEqual(echec({ type: 'ConnexionImpossible', motif: 'ERR-003' }));
    expect(env.fournisseur.demandes).toEqual([]);
    await verifierRienCree(env);
  });

  it('UT-US-022-24 SeConnecter — renvoie ERR-005, oublie le jeton et n’ouvre aucun espace quand le Drive reste indisponible (S20c)', async () => {
    const env = preparer({ erreurPreparation: { type: 'DriveMomentanementIndisponible' } });

    const resultat = await env.cas.executer();

    expect(resultat).toEqual(echec({ type: 'ConnexionImpossible', motif: 'ERR-005' }));
    expect(env.fournisseur.oublis).toBe(1);
    await verifierRienCree(env);
  });

  it('UT-US-022-24 SeConnecter — ouvre l’espace du compte, mémorise la session et la rend valide quand tout réussit (CA-2)', async () => {
    const env = preparer();

    const resultat = await env.cas.executer();

    expect(resultat).toEqual(succes(IDENTITE_A));
    expect(env.espaces.ouvert).toBe(IDENTITE_A.compte);
    expect(env.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
    expect(env.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'VALIDE' });
  });
});
