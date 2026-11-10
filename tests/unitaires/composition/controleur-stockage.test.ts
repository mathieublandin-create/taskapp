/**
 * ST-US-018 v0.4 §4.2, §6.3 (rang 12, tranche D1) : la feuille reçoit l'état de la persistance lu à chaque calcul de
 * la vue (`Application.etatPersistance`) ; la carte `ALR-015` disparaît dès que le stockage devient protégé ; ni
 * l'indicateur ni le bandeau n'en dépendent (aucun point, aucun bandeau, jamais de blocage).
 */
import { describe, expect, it } from 'vitest';
import type { EtatPersistance } from '@src/commun/application/ports/persistance-stockage';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { instant } from '../../support/valeurs';
import { HORLOGE_ABSENTE } from '../../support/synchronisation/horloge-absente';

const MAINTENANT = instant('2026-10-22T08:01:00.000Z');
/** Hors ligne, une modification en attente depuis plus de 24 h : indicateur hors ligne et rappel. */
const ETAT: EtatSynchronisationLu = {
  reseau: 'COUPE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 1,
  plusAncienneEnAttente: instant('2026-10-21T08:00:00.000Z'),
  aLire: 0,
  rappelMasque: false,
};

const preparer = (etatSynchro: EtatSynchronisationLu | undefined) => {
  const persistance: { etat: EtatPersistance; lectures: number } = {
    etat: 'NON_PERSISTANT',
    lectures: 0,
  };
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(etatSynchro),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    ...HORLOGE_ABSENTE,
    etatPersistance: () => {
      persistance.lectures += 1;
      return Promise.resolve(persistance.etat);
    },
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    lireChoixRestauration: () => Promise.resolve(undefined),
    lireRestaurationFaiteIci: () => Promise.resolve(undefined),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(MAINTENANT));
  return { controleur: new ControleurInterface(application, horloge), persistance };
};

describe('ControleurInterface — stockage de cet appareil (ST-US-018 §6.3)', () => {
  it('UT-US-018-11 non protégé puis protégé — ligne NON-PROTEGE et carte ALR-015, puis, au calcul suivant, ligne PROTEGE sans carte', async () => {
    const { controleur, persistance } = preparer(ETAT);

    await controleur.rafraichir();
    expect(controleur.vue().feuille?.stockage?.etat).toBe('NON-PROTEGE');
    expect(controleur.vue().feuille?.alerteStockage?.code).toBe('ALR-015');

    persistance.etat = 'PERSISTANT';
    await controleur.rafraichir();
    expect(controleur.vue().feuille?.stockage?.etat).toBe('PROTEGE');
    expect(controleur.vue().feuille).not.toHaveProperty('alerteStockage');
    expect(persistance.lectures).toBe(2);
  });

  it('UT-US-018-11 indicateur et bandeau indépendants du stockage — mêmes modèles de vue, protégé ou non', async () => {
    const nonProtege = preparer(ETAT);
    const protege = preparer(ETAT);
    protege.persistance.etat = 'PERSISTANT';

    await nonProtege.controleur.rafraichir();
    await protege.controleur.rafraichir();

    expect(nonProtege.controleur.vue().indicateur).toEqual(protege.controleur.vue().indicateur);
    expect(nonProtege.controleur.vue().bandeau).toEqual(protege.controleur.vue().bandeau);
    expect(nonProtege.controleur.vue().bandeau?.code).toBe('BAN-RAPPEL-24H');
    expect(nonProtege.controleur.vue().consultationSeule).toBe(false);
  });

  it('UT-US-018-11 sans espace ouvert — pas de feuille, persistance non lue', async () => {
    const { controleur, persistance } = preparer(undefined);

    await controleur.rafraichir();

    expect(controleur.vue().feuille).toBeUndefined();
    expect(persistance.lectures).toBe(0);
  });
});
