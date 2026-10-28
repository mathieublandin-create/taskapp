import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes } from '@src/commun/domaine/resultat';
import { OuvrirApplication } from '@src/compte/application/cas-usage/ouvrir-application';
import { ReprendreSession } from '@src/compte/application/cas-usage/reprendre-session';
import { SeConnecter } from '@src/compte/application/cas-usage/se-connecter';
import { SeDeconnecter } from '@src/compte/application/cas-usage/se-deconnecter';
import { SignalerRefusJeton } from '@src/compte/application/cas-usage/signaler-refus-jeton';
import { SupprimerDonneesAppareil } from '@src/compte/application/cas-usage/supprimer-donnees-appareil';
import { issueDeErreurAuth } from '@src/compte/application/issue-erreur-auth';
import type { ErreurPreparation } from '@src/compte/application/ports/preparation-stockage';
import type { DepartMemorise } from '@src/compte/application/ports/memoire-redirection';
import { SessionCourante } from '@src/compte/application/session-courante';
import { CoffreJetonsMemoire } from '@src/compte/infrastructure/coffre-jetons-memoire';
import {
  AvisOngletsEnMemoire,
  DepotAvantSortieSimule,
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  JournalEnMemoire,
  MemoireRedirectionEnMemoire,
  MemoireSessionEnMemoire,
  PreparationSimulee,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';
import { horlogeSur } from '@tests/support/horloge';
import { instant } from '@tests/support/valeurs';

const ACCES = succes({
  type: 'ACCES_OBTENU' as const,
  acces: { porteesAccordees: [], identite: IDENTITE_A },
});
const ECHEC_ESPACE = () => Promise.resolve(echec({ type: 'EspaceInaccessible' as const }));

const seConnecter = (options: { erreurPreparation?: ErreurPreparation } = {}) => {
  const fournisseur = new FournisseurScripte();
  fournisseur.reponseDemande = ACCES;
  const espaces = new EspacesEnMemoire();
  const session = new SessionCourante();
  const cas = new SeConnecter({
    reseau: new ReseauFixe(true),
    fournisseur,
    preparation: new PreparationSimulee(options.erreurPreparation),
    espaces,
    memoireSession: new MemoireSessionEnMemoire(),
    session,
  });
  return { cas, fournisseur, espaces, session };
};

describe('SeConnecter — compléments (ST-US-022 §6.7)', () => {
  it.each<readonly [ErreurPreparation['type'], string]>([
    ['DriveIndisponiblePourLeCompte', 'ERR-006'],
    ['ReseauInterrompu', 'ERR-005'],
  ])(
    'UT-COMP-US-022-60 préparation du Drive en échec %s : %s, jeton oublié',
    async (type, motif) => {
      const env = seConnecter({ erreurPreparation: { type } });

      expect(await env.cas.executer()).toEqual(echec({ type: 'ConnexionImpossible', motif }));
      expect(env.fournisseur.oublis).toBe(1);
    },
  );

  it('UT-COMP-US-022-61 réseau perdu pendant la fenêtre de Google : ERR-005 ; espace inaccessible : EspaceInaccessible ; redirection : erreur de programmation', async () => {
    const reseau = seConnecter();
    reseau.fournisseur.reponseDemande = echec({ type: 'ReseauIndisponible' });
    expect(await reseau.cas.executer()).toEqual(
      echec({ type: 'ConnexionImpossible', motif: 'ERR-005' }),
    );

    const espace = seConnecter();
    espace.espaces.ouvrir = ECHEC_ESPACE;
    expect(await espace.cas.executer()).toEqual(echec({ type: 'EspaceInaccessible' }));
    expect(espace.fournisseur.oublis).toBe(1);
    expect(espace.session.etat()).toEqual({ type: 'SANS_SESSION' });

    const redirection = seConnecter();
    redirection.fournisseur.reponseDemande = succes({ type: 'REDIRECTION_LANCEE' });
    await expect(redirection.cas.executer()).rejects.toBeInstanceOf(ErreurProgrammation);
  });
});

const DEPART: DepartMemorise = {
  state: 's',
  lanceA: instant('2026-10-27T08:00:00.000Z'),
  expireA: instant('2026-10-27T08:10:00.000Z'),
  mode: 'REPLI_GESTE',
  reprise: { ecran: 'accueil', feuilleSynchronisationOuverte: false },
};

const ouvrir = (options: { depart?: DepartMemorise; maintenant?: string } = {}) => {
  const fournisseur = new FournisseurScripte();
  const espaces = new EspacesEnMemoire();
  const journal = new JournalEnMemoire();
  const memoireSession = new MemoireSessionEnMemoire({ identite: IDENTITE_A, accesPerdu: false });
  const session = new SessionCourante();
  const cas = new OuvrirApplication({
    memoireSession,
    memoireRedirection: new MemoireRedirectionEnMemoire(options.depart),
    fournisseur,
    espaces,
    reseau: new ReseauFixe(true),
    horloge: horlogeSur(options.maintenant ?? '2026-10-27T08:00:01.000Z'),
    journal,
    session,
  });
  return { cas, fournisseur, espaces, journal, memoireSession, session };
};

describe('OuvrirApplication — compléments (ST-US-022 §6.2, §8)', () => {
  it('UT-COMP-US-022-62 espace inaccessible : issue ESPACE_INACCESSIBLE (v0.3.2), journal « erreur » ; retour sans session : rejet journalisé', async () => {
    const env = ouvrir();
    env.espaces.ouvrir = ECHEC_ESPACE;

    expect(await env.cas.executer({ type: 'AUCUN' })).toEqual({ type: 'ESPACE_INACCESSIBLE' });
    expect(env.journal.entrees.map((e) => [e.niveau, e.evenement])).toEqual([
      ['erreur', 'EspaceInaccessible'],
    ]);

    const sansSession = ouvrir();
    sansSession.memoireSession.session = undefined;
    await sansSession.cas.executer({ type: 'JETON', jeton: 'j', portees: [], state: 's' });
    expect(sansSession.journal.entrees[0]).toEqual({
      niveau: 'avertissement',
      evenement: 'RetourRedirectionRejete',
      champs: { motif: 'SANS_DEPART' },
    });
  });

  it('UT-COMP-US-022-63 redirection impossible (mémoire technique) : session ouverte sans jeton ; jeton obtenu sans redirection : VALIDE', async () => {
    const impossible = ouvrir();
    impossible.fournisseur.reponseDemande = echec({ type: 'MemoireTechniqueIndisponible' });
    expect(await impossible.cas.executer({ type: 'AUCUN' })).toEqual({
      type: 'SESSION_OUVERTE',
      acces: 'A_RENOUVELER',
    });

    const directe = ouvrir();
    directe.fournisseur.reponseDemande = ACCES;
    expect(await directe.cas.executer({ type: 'AUCUN' })).toEqual({
      type: 'SESSION_OUVERTE',
      acces: 'VALIDE',
    });
  });

  it('UT-COMP-US-022-64 retour d’un repli de geste en access_denied : accès perdu mémorisé ; départ expiré : transmis comme absent', async () => {
    const refus = ouvrir({ depart: DEPART });
    refus.fournisseur.reponseRetour = echec({ type: 'AccesGoogleRevoque' });
    expect(await refus.cas.executer({ type: 'ERREUR', code: 'access_denied', state: 's' })).toEqual(
      { type: 'SESSION_OUVERTE', acces: 'PERDU' },
    );
    expect(refus.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: true });
    expect(refus.journal.entrees.at(-1)?.champs).toEqual({
      categorie: 'AccesGoogleRevoque',
      code: 'access_denied',
      dureeMs: 1000,
    });

    const expire = ouvrir({ depart: DEPART, maintenant: '2026-10-27T08:10:00.001Z' });
    await expire.cas.executer({ type: 'ERREUR', code: 'interaction_required', state: 's' });
    expect(expire.fournisseur.retoursRecus[0]?.depart).toBeUndefined();
  });

  it('UT-COMP-US-022-65 départ encore valide sans retour : journal « RetourAbsent »', async () => {
    const env = ouvrir({ depart: DEPART });

    await env.cas.executer({ type: 'AUCUN' });

    expect(env.journal.entrees.map((e) => e.evenement)).toEqual(['RetourAbsent']);
  });
});

describe('Autres cas d’usage — compléments', () => {
  it('UT-COMP-US-022-66 sans session : SeDeconnecter, SupprimerDonneesAppareil et ReprendreSession rendent SansSession', async () => {
    const session = new SessionCourante();
    const dependances = {
      depot: new DepotAvantSortieSimule(0, 0),
      fournisseur: new FournisseurScripte(),
      memoireSession: new MemoireSessionEnMemoire(),
      espaces: new EspacesEnMemoire(),
      avis: new AvisOngletsEnMemoire(),
      session,
    };
    const deconnexion = new SeDeconnecter(dependances);
    const suppression = new SupprimerDonneesAppareil(dependances);
    const reprise = new ReprendreSession({
      ...dependances,
      reseau: new ReseauFixe(true),
      gardeSaisie: { saisieEnCours: () => false },
    });
    const sansSession = echec({ type: 'SansSession' });

    expect(await deconnexion.evaluer()).toEqual(sansSession);
    expect(await deconnexion.executer()).toEqual(sansSession);
    expect(await suppression.evaluer()).toEqual(sansSession);
    expect(await suppression.confirmer()).toEqual(sansSession);
    expect(await suppression.confirmerPerte()).toEqual(sansSession);
    expect(await suppression.reessayer()).toEqual(sansSession);
    expect(await suppression.fermerApresBlocage()).toEqual(sansSession);
    expect(
      await reprise.executer({ ecran: 'accueil', feuilleSynchronisationOuverte: false }),
    ).toEqual(sansSession);
  });

  it('UT-COMP-US-022-67 suppression : espace inaccessible → session mémorisée rétablie, EspaceInaccessible', async () => {
    const session = new SessionCourante();
    session.ouvrir(IDENTITE_A, 'VALIDE');
    const memoireSession = new MemoireSessionEnMemoire({ identite: IDENTITE_A, accesPerdu: false });
    const espaces = new EspacesEnMemoire([IDENTITE_A.compte]);
    espaces.supprimer = ECHEC_ESPACE;
    const cas = new SupprimerDonneesAppareil({
      depot: new DepotAvantSortieSimule(0, 0),
      fournisseur: new FournisseurScripte(),
      memoireSession,
      espaces,
      avis: new AvisOngletsEnMemoire(),
      session,
    });

    expect(await cas.confirmer()).toEqual(echec({ type: 'EspaceInaccessible' }));
    expect(memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
    expect(session.etat().type).toBe('OUVERTE');
  });

  it('UT-COMP-US-022-68 ReprendreSession — redirection lancée : attente de Google ; erreur technique sur accès perdu : inchangé', async () => {
    const preparer = (acces: 'A_RENOUVELER' | 'PERDU') => {
      const session = new SessionCourante();
      session.ouvrir(IDENTITE_A, acces);
      const fournisseur = new FournisseurScripte();
      const cas = new ReprendreSession({
        reseau: new ReseauFixe(true),
        fournisseur,
        memoireSession: new MemoireSessionEnMemoire({
          identite: IDENTITE_A,
          accesPerdu: acces === 'PERDU',
        }),
        session,
        gardeSaisie: { saisieEnCours: () => false },
      });
      return { cas, fournisseur, session };
    };
    const reprise = { ecran: 'accueil', feuilleSynchronisationOuverte: false };

    const redirection = preparer('A_RENOUVELER');
    expect(await redirection.cas.executer(reprise)).toEqual(succes({ type: 'REDIRECTION_LANCEE' }));
    expect(redirection.session.etat()).toEqual({ type: 'ATTENTE_GOOGLE', identite: IDENTITE_A });

    const perdu = preparer('PERDU');
    perdu.fournisseur.reponseDemande = echec({ type: 'ReseauIndisponible' });
    expect(await perdu.cas.executer(reprise)).toEqual(succes({ type: 'INCHANGE' }));
    expect(perdu.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'PERDU' });
  });

  it('UT-COMP-US-022-69 SignalerRefusJeton — sans jeton ni session ouverte : à renouveler, rien d’autre ; issueDeErreurAuth', async () => {
    const session = new SessionCourante();
    const cas = new SignalerRefusJeton({
      coffre: new CoffreJetonsMemoire(),
      horloge: horlogeSur('2026-10-27T08:00:00.000Z'),
      memoireSession: new MemoireSessionEnMemoire(),
      session,
    });

    expect(await cas.executer()).toBe('A_RENOUVELER');
    expect(session.etat()).toEqual({ type: 'SANS_SESSION' });
    expect(issueDeErreurAuth({ type: 'CompteDifferent' })).toBe('ERREUR_TECHNIQUE');
    expect(issueDeErreurAuth({ type: 'RetourRedirectionRejete', motif: 'STATE_EXPIRE' })).toBe(
      'RETOUR_REJETE',
    );
  });
});
