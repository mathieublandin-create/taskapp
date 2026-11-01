/**
 * Feuille ECR-011, section « Synchronisation », vue par le contrôleur (ST-US-017 v0.4.1 §4.5 bis, n° 17 f ;
 * RC-R3-8) : la vue est construite avec l'état, le dernier échange et les éléments en attente de l'application,
 * et les actions sont transmises à l'application.
 */
import { describe, expect, it } from 'vitest';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { ElementEnAttente } from '@src/synchronisation/domaine/elements-en-attente';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { instant } from '../../support/valeurs';

const MAINTENANT = instant('2026-10-21T08:00:00.000Z');
const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 1,
  aLire: 0,
  rappelMasque: false,
};
const ELEMENTS: ReadonlyArray<ElementEnAttente> = [
  { id: 'o1', intitule: 'Publier le guide', instant: instant('2026-10-21T07:55:00.000Z') },
];

const preparer = (etat: EtatSynchronisationLu | undefined) => {
  const appels: Array<string> = [];
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(etat),
    lireElementsEnAttente: () => Promise.resolve(ELEMENTS),
    lireDernierContact: () => Promise.resolve(instant('2026-10-21T07:50:00.000Z')),
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    synchroniserMaintenant: () => {
      appels.push('synchroniserMaintenant');
      return Promise.resolve();
    },
    observerSynchronisation: () => () => undefined,
    ouvrirGoogleDrive: () => {
      appels.push('ouvrirGoogleDrive');
    },
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(MAINTENANT));
  return { controleur: new ControleurInterface(application, horloge), appels };
};

describe('ControleurInterface — feuille de synchronisation (RC-R3-8)', () => {
  it('UT-COMP-US-017-53 vue.feuille — présente avec l’indicateur, construite avec le dernier échange et les éléments en attente', async () => {
    const { controleur } = preparer(ETAT);

    await controleur.rafraichir();

    const feuille = controleur.vue().feuille;
    expect(controleur.vue().indicateur).toBeDefined();
    expect(feuille?.dernierEchange?.code).toBe('SYN-FEUILLE-DERNIER-ECHANGE');
    expect(feuille?.attente).toMatchObject({
      code: 'SYN-FEUILLE-EN-ATTENTE',
      n: 1,
      lignes: [{ id: 'o1', intitule: 'Publier le guide' }],
    });
  });

  it('UT-COMP-US-017-53 vue.feuille — absente sans espace ouvert (pas d’état de synchronisation)', async () => {
    const { controleur } = preparer(undefined);

    await controleur.rafraichir();

    expect(controleur.vue().feuille).toBeUndefined();
  });

  it('UT-COMP-US-017-53 synchroniser et REESSAYER_MAINTENANT appellent synchroniserMaintenant ; OUVRIR_GOOGLE_DRIVE appelle ouvrirGoogleDrive', async () => {
    const { controleur, appels } = preparer(ETAT);

    await controleur.synchroniser();
    await controleur.actionCarte('REESSAYER_MAINTENANT');
    await controleur.actionCarte('OUVRIR_GOOGLE_DRIVE');

    expect(appels).toEqual([
      'synchroniserMaintenant',
      'synchroniserMaintenant',
      'ouvrirGoogleDrive',
    ]);
  });
});
