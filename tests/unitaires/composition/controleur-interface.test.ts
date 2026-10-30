/**
 * Contrôleur d'interface du rang 1 (RC-US022-3 ; ST-US-022 §8 n° 7 b, 7 d et 12) : connexion, déconnexion,
 * suppression des données de l'appareil (chaîne de confirmations, ERR-017), toasts. Cas d'usage réels, assemblés sur
 * les doublures de `doublures-compte.ts`.
 */
import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import { ReprendreSession } from '@src/compte/application/cas-usage/reprendre-session';
import { SeConnecter } from '@src/compte/application/cas-usage/se-connecter';
import { SeDeconnecter } from '@src/compte/application/cas-usage/se-deconnecter';
import { SupprimerDonneesAppareil } from '@src/compte/application/cas-usage/supprimer-donnees-appareil';
import type {
  ErreurEspace,
  ErreurSuppressionBloquee,
} from '@src/compte/application/ports/gestion-espaces';
import { SessionCourante } from '@src/compte/application/session-courante';
import type { IdCompte } from '@src/compte/domaine/identite';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import {
  AvisOngletsEnMemoire,
  DepotAvantSortieSimule,
  EspacesEnMemoire,
  FournisseurScripte,
  IDENTITE_A,
  MemoireSessionEnMemoire,
  PreparationSimulee,
  ReseauFixe,
} from '../../support/compte/doublures-compte';
import { instant } from '../../support/valeurs';

/** Espaces dont l'ouverture ou la suppression peut échouer (IndexedDB indisponible, quota, corruption). */
class EspacesFaillibles extends EspacesEnMemoire {
  ouvertureImpossible = false;
  suppressionsImpossibles = 0;

  override ouvrir(c: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    if (this.ouvertureImpossible) return Promise.resolve(echec({ type: 'EspaceInaccessible' }));
    return super.ouvrir(c);
  }

  override supprimer(
    c: IdCompte,
  ): Promise<Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>> {
    if (this.suppressionsImpossibles > 0) {
      this.suppressionsImpossibles -= 1;
      return Promise.resolve(echec({ type: 'EspaceInaccessible' }));
    }
    return super.supprimer(c);
  }
}

type Options = { readonly enAttente?: number; readonly connecte?: boolean };

const preparer = ({ enAttente = 0, connecte = true }: Options = {}) => {
  const session = new SessionCourante();
  const reseau = new ReseauFixe(connecte);
  const fournisseur = new FournisseurScripte();
  fournisseur.reponseDemande = succes({
    type: 'ACCES_OBTENU',
    acces: { porteesAccordees: PORTEES_LOT_1, identite: IDENTITE_A },
  });
  const espaces = new EspacesFaillibles();
  const memoireSession = new MemoireSessionEnMemoire();
  const depot = new DepotAvantSortieSimule(enAttente, undefined);
  const sortie = {
    depot,
    fournisseur,
    memoireSession,
    espaces,
    avis: new AvisOngletsEnMemoire(),
    session,
  };
  const application = {
    session,
    consulterEtat: () => Promise.resolve(undefined),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    synchroniserMaintenant: () => Promise.resolve(),
    ouvrirGoogleDrive: () => undefined,
    seConnecter: new SeConnecter({
      ...{ reseau, fournisseur, espaces, memoireSession, session },
      preparation: new PreparationSimulee(),
    }),
    reprendreSession: new ReprendreSession({
      ...{ reseau, fournisseur, memoireSession, session },
      gardeSaisie: { saisieEnCours: () => true },
    }),
    seDeconnecter: new SeDeconnecter(sortie),
    supprimerDonnees: new SupprimerDonneesAppareil(sortie),
    masquage: new MasquageRappel(),
  };
  const horloge = new HorlogeSimulee(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  const controleur = new ControleurInterface(application, horloge);
  return { controleur, session, reseau, fournisseur, espaces, depot };
};

/** Contrôleur connecté avec le compte A. */
const connecte = async (options: Options = {}) => {
  const env = preparer(options);
  await env.controleur.continuerAvecGoogle();
  expect(env.controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
  return env;
};

describe('ControleurInterface — connexion (ECR-010, ST-US-022 §8)', () => {
  it("UT-COMP-US-022-90 continuerAvecGoogle — sans réseau, l'écran de connexion affiche ERR-003 et l'action reste disponible", async () => {
    const { controleur } = preparer({ connecte: false });

    await controleur.continuerAvecGoogle();

    const vue = controleur.vue();
    expect(vue.racine).toEqual({ ecran: 'CONNEXION' });
    expect(vue.connexion.message?.code).toBe('ERR-003');
    expect(vue.connexion.actionActive).toBe(true);
    expect(vue.toast).toBeUndefined();
  });

  it("UT-COMP-US-022-91 continuerAvecGoogle — un succès efface l'échec précédent et ouvre l'application, section « Compte » comprise", async () => {
    const { controleur, reseau } = preparer({ connecte: false });
    await controleur.continuerAvecGoogle();
    reseau.connecte = true;

    await controleur.continuerAvecGoogle();

    const vue = controleur.vue();
    expect(vue.racine).toEqual({ ecran: 'APPLICATION' });
    expect(vue.connexion.message).toBeUndefined();
    expect(vue.compte).toBeDefined();
  });

  it('UT-COMP-US-022-92 continuerAvecGoogle — espace local inaccessible : toast TST-ERREUR-ENREGISTREMENT (ERR-014) sur l’écran de connexion, jamais silencieux (§8 n° 12)', async () => {
    const { controleur, espaces } = preparer();
    espaces.ouvertureImpossible = true;

    await controleur.continuerAvecGoogle();

    const vue = controleur.vue();
    expect(vue.racine).toEqual({ ecran: 'CONNEXION' });
    expect(vue.toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(vue.connexion.message).toBeUndefined();
  });

  it('UT-COMP-US-022-93 continuerAvecGoogle — le toast d’erreur disparaît au geste suivant', async () => {
    const { controleur, espaces } = preparer();
    espaces.ouvertureImpossible = true;
    await controleur.continuerAvecGoogle();
    espaces.ouvertureImpossible = false;

    await controleur.continuerAvecGoogle();

    expect(controleur.vue().toast).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
  });

  it('UT-COMP-US-022-94 observer — chaque rafraîchissement prévient les observateurs, jusqu’à l’annulation', async () => {
    const { controleur } = preparer();
    let appels = 0;
    const annuler = controleur.observer(() => {
      appels += 1;
    });

    await controleur.rafraichir();
    annuler();
    await controleur.rafraichir();

    expect(appels).toBe(1);
  });
});

describe('ControleurInterface — déconnexion (CNF-DECONNEXION)', () => {
  it('UT-COMP-US-022-95 actionCompte SE_DECONNECTER — sans modification en attente, déconnexion directe sans confirmation', async () => {
    const { controleur } = await connecte();

    await controleur.actionCompte('SE_DECONNECTER');

    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(controleur.vue().confirmation).toBeUndefined();
  });

  it('UT-COMP-US-022-96 actionCompte SE_DECONNECTER — avec 2 modifications en attente, CNF-DECONNEXION puis « Se déconnecter » ferme la session', async () => {
    const { controleur } = await connecte({ enAttente: 2 });

    await controleur.actionCompte('SE_DECONNECTER');
    expect(controleur.vue().confirmation?.code).toBe('CNF-DECONNEXION');
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });

    await controleur.confirmer();

    expect(controleur.vue().confirmation).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-COMP-US-022-97 annuler — « Annuler » ferme la confirmation sans rien exécuter', async () => {
    const { controleur } = await connecte({ enAttente: 2 });
    await controleur.actionCompte('SE_DECONNECTER');

    await controleur.annuler();

    expect(controleur.vue().confirmation).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
  });
});

describe('ControleurInterface — suppression des données de l’appareil (CNF-SUPPR-DONNEES, ERR-017)', () => {
  it('UT-COMP-US-022-98 sans modification en attente — CNF-SUPPR-DONNEES puis SUPPRIMEES : retour à la connexion, espace supprimé', async () => {
    const { controleur, espaces } = await connecte();

    await controleur.actionCompte('SUPPRIMER_DONNEES');
    expect(controleur.vue().confirmation?.code).toBe('CNF-SUPPR-DONNEES');
    await controleur.confirmer();

    expect(controleur.vue().confirmation).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(await espaces.existeUnEspace()).toBe(false);
  });

  it('UT-COMP-US-022-99 avec 3 modifications en attente — CNF-SUPPR-DONNEES → CNF-SUPPR-DONNEES-PERTE (n = 3) → SUPPRIMEES', async () => {
    const { controleur, espaces } = await connecte({ enAttente: 3 });

    await controleur.actionCompte('SUPPRIMER_DONNEES');
    await controleur.confirmer();
    const perte = controleur.vue().confirmation;
    expect(perte?.code).toBe('CNF-SUPPR-DONNEES-PERTE');
    expect(perte?.titre).toBe('3 modifications seraient perdues');
    expect(perte?.rouge).toBe(true);
    await controleur.confirmer();

    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(await espaces.existeUnEspace()).toBe(false);
  });

  it('UT-COMP-US-022-100 SUPPRESSION_BLOQUEE — ERR-017 affiché ; « Réessayer » encore bloqué puis « Aller à la connexion »', async () => {
    const { controleur, espaces } = await connecte();
    espaces.suppressionsBloquees = 2;

    await controleur.actionCompte('SUPPRIMER_DONNEES');
    await controleur.confirmer();
    expect(controleur.vue().suppressionBloquee).toEqual({ enCours: false });

    await controleur.reessayerSuppression();
    expect(controleur.vue().suppressionBloquee).toEqual({ enCours: false });

    await controleur.allerALaConnexion();
    expect(controleur.vue().suppressionBloquee).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-COMP-US-022-101 SUPPRESSION_BLOQUEE — « Réessayer » aboutit : SUPPRIMEES, retour à la connexion', async () => {
    const { controleur, espaces } = await connecte();
    espaces.suppressionsBloquees = 1;
    await controleur.actionCompte('SUPPRIMER_DONNEES');
    await controleur.confirmer();

    await controleur.reessayerSuppression();

    expect(controleur.vue().suppressionBloquee).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(await espaces.existeUnEspace()).toBe(false);
  });

  it.each([
    ['confirmer', 0],
    ['confirmerPerte', 3],
  ] as const)(
    'UT-COMP-US-022-102 espace inaccessible à la suppression (%s) — toast TST-ERREUR-ENREGISTREMENT, session conservée (§8 n° 12)',
    async (_etape, enAttente) => {
      const { controleur, espaces } = await connecte({ enAttente });
      espaces.suppressionsImpossibles = 1;

      await controleur.actionCompte('SUPPRIMER_DONNEES');
      await controleur.confirmer();
      if (enAttente > 0) await controleur.confirmer();

      expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');
      expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
      expect(controleur.vue().confirmation).toBeUndefined();
    },
  );

  it('UT-COMP-US-022-103 espace inaccessible à « Réessayer » d’ERR-017 — toast TST-ERREUR-ENREGISTREMENT, ERR-017 refermé', async () => {
    const { controleur, espaces } = await connecte();
    espaces.suppressionsBloquees = 1;
    await controleur.actionCompte('SUPPRIMER_DONNEES');
    await controleur.confirmer();
    espaces.suppressionsImpossibles = 1;

    await controleur.reessayerSuppression();

    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(controleur.vue().suppressionBloquee).toBeUndefined();
  });
});

describe('ControleurInterface — reprise et rappel', () => {
  it('UT-COMP-US-022-104 reprendre — repli nécessaire pendant une saisie : toast TST-SAISIE-A-TERMINER, puis effacé quand la reprise aboutit', async () => {
    const { controleur, session, fournisseur } = await connecte();
    session.changerAcces('A_RENOUVELER');
    fournisseur.reponseDemande = echec({ type: 'RedirectionNonPermise' });

    await controleur.reprendre();
    expect(controleur.vue().toast).toBe('TST-SAISIE-A-TERMINER');

    fournisseur.reponseDemande = succes({
      type: 'ACCES_OBTENU',
      acces: { porteesAccordees: PORTEES_LOT_1, identite: IDENTITE_A },
    });
    await controleur.reprendre();
    expect(controleur.vue().toast).toBeUndefined();
  });

  it('UT-COMP-US-022-105 masquerRappel — masque le rappel et rafraîchit la vue', async () => {
    const { controleur } = await connecte();
    let appels = 0;
    controleur.observer(() => {
      appels += 1;
    });

    await controleur.masquerRappel();

    expect(appels).toBe(1);
  });
});

describe('ControleurInterface — issue de l’ouverture (ST-US-022 §6.2, §8 n° 12 ; Q-BRU-3)', () => {
  it('UT-COMP-US-022-107 apresOuverture — ESPACE_INACCESSIBLE : écran de connexion et toast TST-ERREUR-ENREGISTREMENT (ERR-014)', async () => {
    const { controleur } = preparer();
    let appels = 0;
    controleur.observer(() => {
      appels += 1;
    });

    await controleur.apresOuverture({ type: 'ESPACE_INACCESSIBLE' });

    const vue = controleur.vue();
    expect(vue.racine).toEqual({ ecran: 'CONNEXION' });
    expect(vue.toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(vue.connexion.message).toBeUndefined();
    expect(appels).toBe(1);
  });

  it('UT-COMP-US-022-108 apresOuverture — ECRAN_CONNEXION : aucun toast ; le toast d’ESPACE_INACCESSIBLE disparaît au geste suivant', async () => {
    const sansToast = preparer();
    await sansToast.controleur.apresOuverture({ type: 'ECRAN_CONNEXION' });
    expect(sansToast.controleur.vue().toast).toBeUndefined();
    expect(sansToast.controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });

    const { controleur } = preparer();
    await controleur.apresOuverture({ type: 'ESPACE_INACCESSIBLE' });
    await controleur.continuerAvecGoogle();
    expect(controleur.vue().toast).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
  });
});
