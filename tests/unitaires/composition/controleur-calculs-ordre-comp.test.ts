/**
 * ST-US-031 v0.4.1 §6.7, §14 (E13, ANO-006) : un calcul de vue dépassé ne publie pas. Doublure d'`ApplicationInterface`
 * dont `consulterEtat` est réglé à la main : le calcul A (session ouverte) se règle après le calcul B (session
 * fermée) ; seule la vue de B est publiée. UT-COMP-US-031-25.
 */
import { describe, expect, it } from 'vitest';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { HORLOGE_ABSENTE } from '../../support/synchronisation/horloge-absente';
import { barriere, vider } from '../../support/synchronisation/onglets';
import { IDENTITE_A } from '../../support/compte/doublures-compte';
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
  const session = new SessionCourante();
  const lectures: Array<() => Promise<EtatSynchronisationLu | undefined>> = [];
  const application = {
    session,
    consulterEtat: () => {
      const lecture = lectures.shift();
      return lecture === undefined ? Promise.resolve(undefined) : lecture();
    },
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    ...HORLOGE_ABSENTE,
    lireCoordination: () => Promise.resolve(undefined),
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  return { controleur: new ControleurInterface(application, horloge), session, lectures };
};

describe('ControleurInterface — ordre des calculs de vue (ANO-006)', () => {
  it('UT-COMP-US-031-25 calcul A (session ouverte) réglé après le calcul B (session fermée) — la vue est celle de B, observateurs avertis une seule fois', async () => {
    const { controleur, session, lectures } = preparer();
    const reglageA = barriere();
    const reglageB = barriere();
    lectures.push(
      async () => {
        await reglageA.promesse;
        return ETAT;
      },
      async () => {
        await reglageB.promesse;
        return undefined;
      },
    );
    session.ouvrir(IDENTITE_A, 'VALIDE');
    // `ouvrir` lance un calcul par l'observateur de la session : il consomme la première lecture (A, session ouverte).
    session.fermer();
    // `fermer` lance le calcul B (session fermée), qui consomme la seconde lecture.
    let avertissements = 0;
    controleur.observer(() => {
      avertissements += 1;
    });

    reglageB.ouvrir();
    await vider();
    reglageA.ouvrir();
    await controleur.rafraichissementsTermines();
    await vider();

    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(controleur.vue()).not.toHaveProperty('compte');
    expect(controleur.vue()).not.toHaveProperty('feuille');
    expect(avertissements).toBe(1);
  });
});
