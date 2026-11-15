/**
 * ST-CORR-E13B-LOT-001 §7 (tranche T6) : ANO-004, l'écran de connexion n'est publié que quand l'absence de session est
 * établie (guide v0.2.26 §6.2, §6.6.16 n° 4). L'ouverture est établie par `apresOuverture` (toute issue), par un geste
 * de connexion, ou dès qu'une session a été vue. Doublure d'`ApplicationInterface` minimale. Rang 14.
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { HORLOGE_ABSENTE } from '../../support/synchronisation/horloge-absente';
import { IDENTITE_A } from '../../support/compte/doublures-compte';
import { instant } from '../../support/valeurs';

const preparer = () => {
  const session = new SessionCourante();
  const application = {
    session,
    consulterEtat: () => Promise.resolve(undefined),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    ...HORLOGE_ABSENTE,
    lireCoordination: () => Promise.resolve(undefined),
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
    seConnecter: {
      executer: () => Promise.resolve(echec({ type: 'ConnexionImpossible', motif: 'ERR-003' })),
    },
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  return { controleur: new ControleurInterface(application, horloge), session };
};

describe('ControleurInterface — vue initiale OUVERTURE (ANO-004)', () => {
  it('UT-ANO-004-03 vue initiale : OUVERTURE, pas CONNEXION', () => {
    const { controleur } = preparer();
    expect(controleur.vue().racine).toEqual({ ecran: 'OUVERTURE' });
  });

  it('UT-ANO-004-04 un rafraîchissement avant la fin de l’ouverture (réseau, synchronisation) garde OUVERTURE sans session', async () => {
    const { controleur } = preparer();
    await controleur.rafraichir();
    await controleur.rafraichir();
    expect(controleur.vue().racine).toEqual({ ecran: 'OUVERTURE' });
  });

  it('UT-ANO-004-05 apresOuverture établit l’absence de session : CONNEXION pour ECRAN_CONNEXION comme pour ESPACE_INACCESSIBLE ; elle le reste après un rafraîchissement', async () => {
    const premier = preparer();
    await premier.controleur.apresOuverture({ type: 'ECRAN_CONNEXION' });
    expect(premier.controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    await premier.controleur.rafraichir();
    expect(premier.controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });

    const second = preparer();
    await second.controleur.apresOuverture({ type: 'ESPACE_INACCESSIBLE' });
    expect(second.controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-ANO-004-06 une session vue avant apresOuverture : APPLICATION ; sa fermeture mène à CONNEXION, jamais de retour à OUVERTURE', async () => {
    const { controleur, session } = preparer();
    session.ouvrir(IDENTITE_A, 'VALIDE');
    await controleur.rafraichissementsTermines();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });

    session.fermer();
    await controleur.rafraichissementsTermines();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
  });

  it('UT-ANO-004-07 un geste « Continuer avec Google » établit l’ouverture : un échec laisse l’écran de connexion, avec son message', async () => {
    const { controleur } = preparer();
    await controleur.continuerAvecGoogle();
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(controleur.vue().connexion.message?.code).toBe('ERR-003');
  });
});
