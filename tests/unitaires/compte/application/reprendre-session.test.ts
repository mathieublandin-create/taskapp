import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { ReprendreSession } from '@src/compte/application/cas-usage/reprendre-session';
import { REPRISE_ACCUEIL } from '@src/compte/application/ports/memoire-redirection';
import { SessionCourante } from '@src/compte/application/session-courante';
import type { EtatAcces } from '@src/compte/domaine/acces';
import {
  FournisseurScripte,
  IDENTITE_A,
  MemoireSessionEnMemoire,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';

const preparer = (options: { acces: EtatAcces; saisieEnCours?: boolean; connecte?: boolean }) => {
  const fournisseur = new FournisseurScripte();
  const memoireSession = new MemoireSessionEnMemoire({
    identite: IDENTITE_A,
    accesPerdu: options.acces === 'PERDU',
  });
  const session = new SessionCourante();
  session.ouvrir(IDENTITE_A, options.acces);
  const cas = new ReprendreSession({
    reseau: new ReseauFixe(options.connecte ?? true),
    fournisseur,
    memoireSession,
    session,
    gardeSaisie: { saisieEnCours: () => options.saisieEnCours ?? false },
  });
  return { cas, fournisseur, memoireSession, session };
};

const ACCES_OBTENU = succes({
  type: 'ACCES_OBTENU' as const,
  acces: {
    porteesAccordees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
    identite: IDENTITE_A,
  },
});

describe('ReprendreSession (ST-US-022 §6.10 ; DAT v0.11.3 §4.1.7)', () => {
  it('UT-US-022-53 ReprendreSession — demande un jeton par geste avec login_hint et rend l’accès valide (RG-017)', async () => {
    const env = preparer({ acces: 'A_RENOUVELER' });
    env.fournisseur.reponseDemande = ACCES_OBTENU;

    expect(await env.cas.executer(REPRISE_ACCUEIL)).toEqual(succes({ type: 'ACCES_RENOUVELE' }));

    expect(env.fournisseur.demandes).toEqual([
      {
        mode: 'RENOUVELLEMENT_GESTE',
        portees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
        indice: IDENTITE_A.adresse,
        reprise: REPRISE_ACCUEIL,
        redirectionPermise: true,
      },
    ]);
    expect(env.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'VALIDE' });
  });

  it('UT-US-022-53 ReprendreSession — après un accès perdu, reconnexion par geste ; jeton obtenu → accesPerdu effacé (RG-035)', async () => {
    const env = preparer({ acces: 'PERDU' });
    env.fournisseur.reponseDemande = ACCES_OBTENU;

    expect(await env.cas.executer(REPRISE_ACCUEIL)).toEqual(succes({ type: 'ACCES_RENOUVELE' }));

    expect(env.fournisseur.demandes.map((d) => d.mode)).toEqual(['RECONNEXION_GESTE']);
    expect(env.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
  });

  it('UT-US-022-54 ReprendreSession — saisie en cours : aucune redirection permise ; repli refusé → SAISIE_A_TERMINER, état inchangé (Q-ST022-STA-1)', async () => {
    const env = preparer({ acces: 'A_RENOUVELER', saisieEnCours: true });
    env.fournisseur.reponseDemande = echec({ type: 'RedirectionNonPermise' });

    expect(await env.cas.executer(REPRISE_ACCUEIL)).toEqual(succes({ type: 'SAISIE_A_TERMINER' }));

    expect(env.fournisseur.demandes.map((d) => d.redirectionPermise)).toEqual([false]);
    expect(env.session.etat()).toEqual({
      type: 'OUVERTE',
      identite: IDENTITE_A,
      acces: 'A_RENOUVELER',
    });
  });

  it('UT-US-022-54 ReprendreSession — access_denied après le geste : accès perdu, mémorisé ; fenêtre fermée : inchangé', async () => {
    const refus = preparer({ acces: 'A_RENOUVELER' });
    refus.fournisseur.reponseDemande = echec({ type: 'AccesGoogleRevoque' });

    expect(await refus.cas.executer(REPRISE_ACCUEIL)).toEqual(succes({ type: 'ACCES_PERDU' }));
    expect(refus.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: true });
    expect(refus.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'PERDU' });

    const annule = preparer({ acces: 'A_RENOUVELER' });
    annule.fournisseur.reponseDemande = echec({ type: 'ConnexionAnnulee' });

    expect(await annule.cas.executer(REPRISE_ACCUEIL)).toEqual(succes({ type: 'INCHANGE' }));
    expect(annule.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
  });

  it('UT-US-022-54 ReprendreSession — hors ligne : HorsLigne, aucune demande de jeton (Q-ST022-STE-3)', async () => {
    const env = preparer({ acces: 'A_RENOUVELER', connecte: false });

    expect(await env.cas.executer(REPRISE_ACCUEIL)).toEqual(echec({ type: 'HorsLigne' }));
    expect(env.fournisseur.demandes).toEqual([]);
  });
});
