import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { OuvrirApplication } from '@src/compte/application/cas-usage/ouvrir-application';
import type { RetourGoogle } from '@src/compte/application/ports/fournisseur-auth';
import type { DepartMemorise } from '@src/compte/application/ports/memoire-redirection';
import { SessionCourante } from '@src/compte/application/session-courante';
import {
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  JournalEnMemoire,
  MemoireRedirectionEnMemoire,
  MemoireSessionEnMemoire,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';
import { horlogeSur } from '@tests/support/horloge';
import { instant } from '@tests/support/valeurs';

const MAINTENANT = '2026-10-27T08:00:01.200Z';
const REPRISE = { ecran: '/objectifs', feuilleSynchronisationOuverte: true };
const DEPART: DepartMemorise = {
  state: 'Zq9xStateUnique',
  lanceA: instant('2026-10-27T08:00:00.000Z'),
  expireA: instant('2026-10-27T08:10:00.000Z'),
  mode: 'RENOUVELLEMENT_OUVERTURE',
  reprise: REPRISE,
};
const RETOUR_ERREUR = (code: string): RetourGoogle => ({
  type: 'ERREUR',
  code,
  state: 'Zq9xStateUnique',
});

const preparer = (options: {
  session?: { accesPerdu: boolean } | undefined;
  connecte?: boolean;
  depart?: DepartMemorise | undefined;
}) => {
  const memoireSession = new MemoireSessionEnMemoire(
    options.session === undefined
      ? undefined
      : { identite: IDENTITE_A, accesPerdu: options.session.accesPerdu },
  );
  const memoireRedirection = new MemoireRedirectionEnMemoire(options.depart);
  const fournisseur = new FournisseurScripte();
  const espaces = new EspacesEnMemoire([IDENTITE_A.compte]);
  const journal = new JournalEnMemoire();
  const session = new SessionCourante();
  const cas = new OuvrirApplication({
    memoireSession,
    memoireRedirection,
    fournisseur,
    espaces,
    reseau: new ReseauFixe(options.connecte ?? true),
    horloge: horlogeSur(MAINTENANT),
    journal,
    session,
  });
  return { cas, memoireSession, memoireRedirection, fournisseur, espaces, journal, session };
};

describe('OuvrirApplication (ST-US-022 §6.2, DAT §4.1.7)', () => {
  it('UT-US-022-33 OuvrirApplication — un retour interaction_required ouvre la session à renouveler, sans nouvelle redirection (S23, RED-08)', async () => {
    const env = preparer({ session: { accesPerdu: false }, depart: DEPART });

    const issue = await env.cas.executer(RETOUR_ERREUR('interaction_required'));

    expect(issue).toEqual({ type: 'SESSION_OUVERTE', acces: 'A_RENOUVELER' });
    expect(env.fournisseur.demandes).toEqual([]);
    expect(env.fournisseur.retoursRecus).toEqual([
      { retour: RETOUR_ERREUR('interaction_required'), depart: DEPART },
    ]);
    expect(env.session.etat()).toEqual({
      type: 'OUVERTE',
      identite: IDENTITE_A,
      acces: 'A_RENOUVELER',
    });
    expect(env.espaces.ouvert).toBe(IDENTITE_A.compte);
  });

  it('UT-US-022-34 OuvrirApplication — une erreur de configuration ouvre la session à renouveler et journalise le seul code en erreur', async () => {
    const env = preparer({ session: { accesPerdu: false }, depart: DEPART });
    env.fournisseur.reponseRetour = echec({
      type: 'ConfigurationOAuthInvalide',
      code: 'redirect_uri_mismatch',
    });

    const issue = await env.cas.executer(RETOUR_ERREUR('redirect_uri_mismatch'));

    expect(issue).toEqual({ type: 'SESSION_OUVERTE', acces: 'A_RENOUVELER' });
    const erreurs = env.journal.entrees.filter((e) => e.niveau === 'erreur');
    expect(erreurs).toHaveLength(1);
    expect(JSON.stringify(erreurs)).toContain('redirect_uri_mismatch');
    expect(JSON.stringify(env.journal.entrees)).not.toContain('Zq9xStateUnique');
    expect(JSON.stringify(env.journal.entrees)).not.toContain('a@exemple.test');
  });

  it('UT-US-022-35 OuvrirApplication — lance une seule redirection silencieuse avec login_hint quand une session est en cache et le réseau présent', async () => {
    const env = preparer({ session: { accesPerdu: false } });

    const issue = await env.cas.executer({ type: 'AUCUN' });

    expect(issue).toEqual({ type: 'REDIRECTION_LANCEE' });
    expect(env.fournisseur.demandes).toEqual([
      {
        mode: 'RENOUVELLEMENT_OUVERTURE',
        portees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
        indice: IDENTITE_A.adresse,
        reprise: { ecran: 'accueil', feuilleSynchronisationOuverte: false },
        redirectionPermise: true,
      },
    ]);
    expect(env.session.etat()).toEqual({ type: 'ATTENTE_GOOGLE', identite: IDENTITE_A });
  });

  it('UT-US-022-36 OuvrirApplication — un jeton valide rend l’accès valide, restitue la reprise et efface l’accès perdu mémorisé (CA-5)', async () => {
    const env = preparer({
      session: { accesPerdu: true },
      depart: { ...DEPART, mode: 'REPLI_GESTE' },
    });
    env.fournisseur.reponseRetour = succes({
      acces: {
        porteesAccordees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
        identite: IDENTITE_A,
      },
      mode: 'REPLI_GESTE',
      reprise: REPRISE,
    });

    const issue = await env.cas.executer({
      type: 'JETON',
      jeton: 'j',
      portees: [],
      state: 'Zq9xStateUnique',
    });

    expect(issue).toEqual({ type: 'SESSION_OUVERTE', acces: 'VALIDE', reprise: REPRISE });
    expect(env.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
  });

  it('UT-US-022-38 OuvrirApplication — sans session mémorisée, affiche l’écran de connexion après avoir consommé tout départ', async () => {
    const env = preparer({ session: undefined, depart: DEPART });

    const issue = await env.cas.executer(RETOUR_ERREUR('interaction_required'));

    expect(issue).toEqual({ type: 'ECRAN_CONNEXION' });
    expect(env.memoireRedirection.consommations).toBe(1);
    expect(env.memoireRedirection.depart).toBeUndefined();
    expect(env.fournisseur.retoursRecus).toEqual([]);
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
  });

  it('UT-US-022-39 OuvrirApplication — hors ligne avec un accès perdu mémorisé, ouvre la session accès perdu sans redirection (RG-035)', async () => {
    const env = preparer({ session: { accesPerdu: true }, connecte: false });

    const issue = await env.cas.executer({ type: 'AUCUN' });

    expect(issue).toEqual({ type: 'SESSION_OUVERTE', acces: 'PERDU' });
    expect(env.fournisseur.demandes).toEqual([]);
  });

  it('UT-US-022-12 OuvrirApplication — un départ sans retour, encore valide, ouvre la session à renouveler sans redirection', async () => {
    const env = preparer({ session: { accesPerdu: false }, depart: DEPART });

    const issue = await env.cas.executer({ type: 'AUCUN' });

    expect(issue).toEqual({ type: 'SESSION_OUVERTE', acces: 'A_RENOUVELER' });
    expect(env.fournisseur.demandes).toEqual([]);
  });

  it('UT-US-022-58 abandonnerAttenteGoogle — sans retour de Google après 10 s : départ consommé, session ouverte sans jeton, aucune nouvelle redirection (guide v0.2.15, RL-LOT-001-S6)', async () => {
    const env = preparer({ session: { accesPerdu: false } });
    expect(await env.cas.executer({ type: 'AUCUN' })).toEqual({ type: 'REDIRECTION_LANCEE' });
    const consommationsAvant = env.memoireRedirection.consommations;

    expect(await env.cas.abandonnerAttenteGoogle()).toEqual({
      type: 'SESSION_OUVERTE',
      acces: 'A_RENOUVELER',
    });

    expect(env.memoireRedirection.consommations).toBe(consommationsAvant + 1);
    expect(env.memoireRedirection.depart).toBeUndefined();
    expect(env.fournisseur.demandes).toHaveLength(1);
    expect(env.session.etat()).toEqual({
      type: 'OUVERTE',
      identite: IDENTITE_A,
      acces: 'A_RENOUVELER',
    });
  });

  it('UT-US-022-58 abandonnerAttenteGoogle — accès perdu mémorisé : PERDU ; hors attente : undefined, rien ne change', async () => {
    const perdu = preparer({ session: { accesPerdu: true } });
    await perdu.cas.executer({ type: 'AUCUN' });
    expect(await perdu.cas.abandonnerAttenteGoogle()).toEqual({
      type: 'SESSION_OUVERTE',
      acces: 'PERDU',
    });

    const horsAttente = preparer({ session: { accesPerdu: false }, connecte: false });
    await horsAttente.cas.executer({ type: 'AUCUN' });
    expect(await horsAttente.cas.abandonnerAttenteGoogle()).toBeUndefined();
    expect(horsAttente.session.etat()).toEqual({
      type: 'OUVERTE',
      identite: IDENTITE_A,
      acces: 'A_RENOUVELER',
    });
  });
  it('UT-US-022-62 OuvrirApplication — espace local inaccessible : issue ESPACE_INACCESSIBLE, session fermée, sans redirection, journal « erreur » (§8 n° 12, Q-BRU-3)', async () => {
    const env = preparer({ session: { accesPerdu: false }, depart: DEPART });
    env.espaces.ouvrir = () => Promise.resolve(echec({ type: 'EspaceInaccessible' }));

    const issue = await env.cas.executer(RETOUR_ERREUR('interaction_required'));

    expect(issue).toEqual({ type: 'ESPACE_INACCESSIBLE' });
    expect(env.session.etat()).toEqual({ type: 'SANS_SESSION' });
    expect(env.fournisseur.demandes).toEqual([]);
    expect(env.fournisseur.retoursRecus).toEqual([]);
    expect(env.journal.entrees).toContainEqual({
      niveau: 'erreur',
      evenement: 'EspaceInaccessible',
    });
  });
});
