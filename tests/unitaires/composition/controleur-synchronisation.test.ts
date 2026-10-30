/**
 * ANO-001 (ST-US-017 v0.4.3 §6.9) : le contrôleur s'abonne, à sa construction, aux notifications du cycle
 * (`observerSynchronisation`) et recalcule la vue à chacune : l'indicateur et la feuille ECR-011 reflètent l'issue
 * d'un cycle mené sans geste (US-017 CA-3, CA-7). UT-US-017-96 à 99.
 */
import { describe, expect, it } from 'vitest';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { Instant } from '@src/commun/domaine/temps/instant';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import type { ElementEnAttente } from '@src/synchronisation/domaine/elements-en-attente';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { instant } from '../../support/valeurs';

const MAINTENANT = instant('2026-10-21T08:00:00.000Z');
const EN_ATTENTE: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 2,
  aLire: 0,
  rappelMasque: false,
};

/** Application simulée : état et données de la feuille modifiables, rappels de synchronisation retenus. */
const preparer = () => {
  const donnees: {
    etat: EtatSynchronisationLu;
    elements: ReadonlyArray<ElementEnAttente>;
    dernierContact: Instant | undefined;
    /** Lecture retenue : `consulterEtat` attend cette promesse (UT-US-017-99). */
    retenue?: Promise<void>;
  } = {
    etat: EN_ATTENTE,
    elements: [
      { id: 'o1', intitule: 'Publier le guide', instant: instant('2026-10-21T07:55:00.000Z') },
      { id: 'o2', intitule: 'Apprendre le piano', instant: instant('2026-10-21T07:56:00.000Z') },
    ],
    dernierContact: undefined,
  };
  const rappels: Array<() => void> = [];
  const application = {
    session: new SessionCourante(),
    consulterEtat: async () => {
      await donnees.retenue;
      return donnees.etat;
    },
    lireElementsEnAttente: () => Promise.resolve(donnees.elements),
    lireDernierContact: () => Promise.resolve(donnees.dernierContact),
    synchroniserMaintenant: () => Promise.resolve(),
    observerSynchronisation: (rappel: () => void) => {
      rappels.push(rappel);
      return () => undefined;
    },
    ouvrirGoogleDrive: () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const controleur = new ControleurInterface(
    application,
    new HorlogeSimulee(new TempsSimule(MAINTENANT)),
  );
  return { controleur, donnees, rappels };
};

/** Laisse s'achever le rafraîchissement lancé par une notification (promesses déjà résolues). */
const laisserRafraichir = () => new Promise((resoudre) => setTimeout(resoudre, 0));

const notifier = async (rappels: ReadonlyArray<() => void>) => {
  rappels.forEach((rappel) => {
    rappel();
  });
  await laisserRafraichir();
};

describe('ControleurInterface — suivi des cycles sans geste (ANO-001)', () => {
  it('UT-US-017-96 constructeur — un seul abonnement à observerSynchronisation, pris avant toute session', () => {
    const { rappels } = preparer();

    expect(rappels).toHaveLength(1);
  });

  it('UT-US-017-97 fin d’un cycle sans geste (CA-7) — indicateur SYN-ATTENTE → SYN-OK, feuille « rien en attente » et dernier échange, observateurs de la vue avertis', async () => {
    const { controleur, donnees, rappels } = preparer();
    await controleur.rafraichir();
    expect(controleur.vue().indicateur).toMatchObject({ code: 'SYN-ATTENTE', n: 2 });
    expect(controleur.vue().feuille?.attente).toMatchObject({
      code: 'SYN-FEUILLE-EN-ATTENTE',
      n: 2,
    });
    let avertissements = 0;
    controleur.observer(() => {
      avertissements += 1;
    });

    donnees.etat = { ...EN_ATTENTE, enAttente: 0 };
    donnees.elements = [];
    donnees.dernierContact = instant('2026-10-21T07:59:30.000Z');
    await notifier(rappels);

    expect(controleur.vue().indicateur?.code).toBe('SYN-OK');
    expect(controleur.vue().feuille?.attente.code).toBe('SYN-FEUILLE-RIEN-EN-ATTENTE');
    expect(controleur.vue().feuille?.dernierEchange?.code).toBe('SYN-FEUILLE-DERNIER-ECHANGE');
    expect(avertissements).toBeGreaterThanOrEqual(1);
  });

  it('UT-US-017-98 issue d’un cycle sans geste — accès expiré (CA-3) : « Reprendre la synchronisation » ; échec persistant : « Action requise » ; cycle en cours affiché', async () => {
    const { controleur, donnees, rappels } = preparer();
    await controleur.rafraichir();

    donnees.etat = { ...EN_ATTENTE, cycle: 'EN_COURS', enAttente: 0 };
    await notifier(rappels);
    expect(controleur.vue().indicateur?.code).toBe('SYN-EN-COURS');

    donnees.etat = { ...EN_ATTENTE, acces: 'A_RENOUVELER' };
    await notifier(rappels);
    expect(controleur.vue().indicateur).toMatchObject({
      code: 'SYN-SESSION',
      action: 'REPRENDRE_LA_SYNCHRONISATION',
    });

    donnees.etat = { ...EN_ATTENTE, actionRequise: 'ECHEC_PERSISTANT' };
    await notifier(rappels);
    expect(controleur.vue().indicateur).toMatchObject({
      code: 'SYN-ACTION',
      messageFeuille: 'ERR-016',
    });
    expect(controleur.vue().feuille?.cartes.map((c) => c.message)).toEqual(['ERR-016']);
  });

  it('UT-US-017-99 rafraichissementsTermines (banc) — attend les rafraîchissements en cours, y compris ceux lancés pendant l’attente', async () => {
    const { controleur, donnees, rappels } = preparer();
    let liberer = (): void => undefined;
    donnees.retenue = new Promise((resoudre) => {
      liberer = resoudre;
    });
    donnees.etat = { ...EN_ATTENTE, enAttente: 0 };
    rappels.forEach((rappel) => {
      rappel();
    });
    let termine = false;
    const attente = controleur.rafraichissementsTermines().then(() => {
      termine = true;
    });

    await laisserRafraichir();
    expect(termine).toBe(false);
    rappels.forEach((rappel) => {
      rappel();
    });
    liberer();
    await attente;

    expect(controleur.vue().indicateur?.code).toBe('SYN-OK');
    await expect(controleur.rafraichissementsTermines()).resolves.toBeUndefined();
  });
});
