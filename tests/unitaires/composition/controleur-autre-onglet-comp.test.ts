/**
 * ST-US-031 v0.4 §3 n° 14, §6.3 (rang 13, tranche B2), test complémentaire de Bruce : le contrôleur passe à la feuille
 * ECR-011 l'état de coordination lu par `Application.lireCoordination`, relu à chaque calcul de la vue ; propriété
 * omise quand il n'y en a pas. UT-COMP-US-031-19.
 */
import { describe, expect, it } from 'vitest';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { EtatCoordination } from '@src/synchronisation/application/coordination-onglets';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { libelle } from '@src/commun/presentation/messages/libelle';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { HORLOGE_ABSENTE } from '../../support/synchronisation/horloge-absente';
import { instant } from '../../support/valeurs';

const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

const preparer = () => {
  const coordination: { courante: EtatCoordination | undefined; lectures: number } = {
    courante: undefined,
    lectures: 0,
  };
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(ETAT),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    ...HORLOGE_ABSENTE,
    lireCoordination: () => {
      coordination.lectures += 1;
      return Promise.resolve(coordination.courante);
    },
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  return { controleur: new ControleurInterface(application, horloge), coordination };
};

const LIGNE = {
  code: 'SYN-FEUILLE-AUTRE-ONGLET',
  libelle: libelle('SYN-FEUILLE-AUTRE-ONGLET'),
} as const;

describe('ControleurInterface — onglet suiveur (ST-US-031 §6.3)', () => {
  it('UT-COMP-US-031-19 feuille.autreOnglet — suit lireCoordination à chaque calcul : suiveur avec meneur, puis meneur, puis sans espace', async () => {
    const { controleur, coordination } = preparer();

    coordination.courante = { role: 'SUIVEUR', autreMeneur: true };
    await controleur.rafraichir();
    expect(controleur.vue().feuille?.autreOnglet).toEqual(LIGNE);

    coordination.courante = { role: 'MENEUR', autreMeneur: false };
    await controleur.rafraichir();
    expect(controleur.vue().feuille).toBeDefined();
    expect(controleur.vue().feuille).not.toHaveProperty('autreOnglet');

    coordination.courante = { role: 'SUIVEUR', autreMeneur: true };
    await controleur.rafraichir();
    expect(controleur.vue().feuille?.autreOnglet).toEqual(LIGNE);

    coordination.courante = undefined;
    await controleur.rafraichir();
    expect(controleur.vue().feuille).toBeDefined();
    expect(controleur.vue().feuille).not.toHaveProperty('autreOnglet');
    expect(coordination.lectures).toBe(4);
  });
});
