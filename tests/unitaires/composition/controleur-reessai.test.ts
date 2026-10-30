/**
 * Bouton « Réessayer » du toast TST-ERREUR-ENREGISTREMENT (DT-007 ; ST-US-022 v0.3.2 §16) : tests complémentaires du
 * rang 2 ; le bouton rejoue le dernier geste échoué.
 */
import { describe, expect, it } from 'vitest';
import { echec, type Resultat } from '@src/commun/domaine/resultat';
import { SeConnecter } from '@src/compte/application/cas-usage/se-connecter';
import { SeDeconnecter } from '@src/compte/application/cas-usage/se-deconnecter';
import { SupprimerDonneesAppareil } from '@src/compte/application/cas-usage/supprimer-donnees-appareil';
import { ReprendreSession } from '@src/compte/application/cas-usage/reprendre-session';
import type {
  ErreurEspace,
  ErreurSuppressionBloquee,
} from '@src/compte/application/ports/gestion-espaces';
import { SessionCourante } from '@src/compte/application/session-courante';
import type { IdCompte } from '@src/compte/domaine/identite';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { succes } from '@src/commun/domaine/resultat';
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

class EspacesInstables extends EspacesEnMemoire {
  ouvertureImpossible = true;
  suppressionImpossible = false;
  suppressions = 0;

  override supprimer(
    c: IdCompte,
  ): Promise<Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>> {
    this.suppressions += 1;
    if (this.suppressionImpossible) return Promise.resolve(echec({ type: 'EspaceInaccessible' }));
    return super.supprimer(c);
  }

  override ouvrir(c: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    if (this.ouvertureImpossible) return Promise.resolve(echec({ type: 'EspaceInaccessible' }));
    return super.ouvrir(c);
  }
}

const preparer = () => {
  const session = new SessionCourante();
  const reseau = new ReseauFixe(true);
  const fournisseur = new FournisseurScripte();
  fournisseur.reponseDemande = succes({
    type: 'ACCES_OBTENU',
    acces: { porteesAccordees: PORTEES_LOT_1, identite: IDENTITE_A },
  });
  const espaces = new EspacesInstables();
  const memoireSession = new MemoireSessionEnMemoire();
  const sortie = {
    depot: new DepotAvantSortieSimule(0, undefined),
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
    observerSynchronisation: () => () => undefined,
    ouvrirGoogleDrive: () => undefined,
    seConnecter: new SeConnecter({
      ...{ reseau, fournisseur, espaces, memoireSession, session },
      preparation: new PreparationSimulee(),
    }),
    reprendreSession: new ReprendreSession({
      ...{ reseau, fournisseur, memoireSession, session },
      gardeSaisie: { saisieEnCours: () => false },
    }),
    seDeconnecter: new SeDeconnecter(sortie),
    supprimerDonnees: new SupprimerDonneesAppareil(sortie),
    masquage: new MasquageRappel(),
  };
  const horloge = new HorlogeSimulee(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  return { controleur: new ControleurInterface(application, horloge), espaces };
};

describe('ControleurInterface.reessayer — toast TST-ERREUR-ENREGISTREMENT (DT-007)', () => {
  it('UT-COMP-US-022-201 rejoue la connexion échouée : le toast disparaît et la session s’ouvre', async () => {
    const { controleur, espaces } = preparer();
    await controleur.continuerAvecGoogle();
    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');

    espaces.ouvertureImpossible = false;
    await controleur.reessayer();

    expect(controleur.vue().toast).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
  });

  it('UT-COMP-US-022-202 rejoue la connexion tant que l’espace reste inaccessible : le toast reste affiché', async () => {
    const { controleur } = preparer();
    await controleur.continuerAvecGoogle();

    await controleur.reessayer();

    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-COMP-US-022-203 après l’ouverture : rouvre l’application puis traite la nouvelle issue', async () => {
    const { controleur } = preparer();
    let ouvertures = 0;
    const rouvrir = () => {
      ouvertures += 1;
      return Promise.resolve({ type: 'ECRAN_CONNEXION' } as const);
    };
    await controleur.apresOuverture({ type: 'ESPACE_INACCESSIBLE' }, rouvrir);

    await controleur.reessayer();

    expect(ouvertures).toBe(1);
    expect(controleur.vue().toast).toBeUndefined();
  });

  it('UT-COMP-US-022-204 sans geste échoué, ne fait rien', async () => {
    const { controleur } = preparer();
    let appels = 0;
    controleur.observer(() => {
      appels += 1;
    });

    await controleur.reessayer();

    expect(appels).toBe(0);
  });

  it('UT-COMP-US-022-205 rejoue la suite d’une confirmation : la suppression confirmée échoue (EspaceInaccessible), « Réessayer » la rejoue et elle aboutit', async () => {
    const { controleur, espaces } = preparer();
    espaces.ouvertureImpossible = false;
    await controleur.continuerAvecGoogle();
    await controleur.actionCompte('SUPPRIMER_DONNEES');
    expect(controleur.vue().confirmation?.code).toBe('CNF-SUPPR-DONNEES');

    espaces.suppressionImpossible = true;
    await controleur.confirmer();
    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
    expect(espaces.suppressions).toBe(1);

    espaces.suppressionImpossible = false;
    await controleur.reessayer();

    expect(espaces.suppressions).toBe(2);
    expect(controleur.vue().toast).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-COMP-US-022-206 rejoue « Réessayer » d’ERR-017 : la nouvelle attente de suppression échoue, « Réessayer » du toast rappelle supprimerDonnees.reessayer()', async () => {
    const { controleur, espaces } = preparer();
    espaces.ouvertureImpossible = false;
    await controleur.continuerAvecGoogle();

    espaces.suppressionImpossible = true;
    await controleur.reessayerSuppression();
    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(controleur.vue().suppressionBloquee).toBeUndefined();
    expect(espaces.suppressions).toBe(1);

    espaces.suppressionImpossible = false;
    await controleur.reessayer();

    expect(espaces.suppressions).toBe(2);
    expect(controleur.vue().toast).toBeUndefined();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });
});
