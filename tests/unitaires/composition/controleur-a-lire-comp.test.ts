/**
 * Section « À lire » d'ECR-011 vue par le contrôleur (ST-US-017 v0.7 §3.4 I2-21) : la vue porte la section et le jour
 * de référence ; « Compris » appelle l'application et rafraîchit la vue ; un échec d'écriture locale est signalé
 * (ERR-014) et « Réessayer » rejoue le geste. Tests complémentaires de la tranche D3.
 */
import { describe, expect, it, vi } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { ErreurDepotLocal } from '@src/synchronisation/application/ports/depot-local';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import type { ModificationsNonRetenuesLues } from '@src/synchronisation/application/requetes/consulter-modifications-non-retenues';
import type { ValeurEcarteeDetaillee } from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { h, idArbitraire } from '../../support/synchronisation/ecritures-concurrentes';
import { date, idTache, instant, PC } from '../../support/valeurs';

const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 1,
  rappelMasque: false,
};
const VALEUR: ValeurEcarteeDetaillee = {
  id: idArbitraire(1),
  motif: 'CONFLIT',
  element: { type: 'TACHE', id: idTache(1) },
  intitule: 'Chapitre 1',
  information: 'DELAI',
  valeurNonRetenue: { type: 'DATE', date: date('2026-12-10') },
  valeurConservee: { type: 'DATE', date: date('2026-12-05') },
  instant: h(1, PC).physique,
  lue: false,
  elementExiste: true,
};

const preparer = (issue: Resultat<undefined, ErreurDepotLocal> = succes(undefined)) => {
  const etat: { lu: ModificationsNonRetenuesLues | undefined } = {
    lu: { valeurs: [VALEUR], aLire: 1 },
  };
  const marquerCommeLue = vi.fn(() => Promise.resolve(issue));
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(ETAT),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    lireModificationsNonRetenues: () => Promise.resolve(etat.lu),
    marquerCommeLue,
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const controleur = new ControleurInterface(
    application,
    new HorlogeSimulee(new TempsSimule(instant('2026-11-01T08:00:00.000Z'))),
  );
  return { controleur, etat, marquerCommeLue };
};

describe('ControleurInterface — section « À lire » (I2-21)', () => {
  it('UT-COMP-US-017-2-45 vue — la section est construite des valeurs lues avec le jour de référence ; absente quand rien n’est lu ou sans espace', async () => {
    const { controleur, etat } = preparer();

    await controleur.rafraichir();
    expect(controleur.vue().nonRetenues?.lignes.map((l) => l.element)).toEqual(['Chapitre 1']);
    expect(controleur.vue().aujourdhui).toBe('2026-11-01');

    etat.lu = { valeurs: [{ ...VALEUR, lue: true }], aLire: 0 };
    await controleur.rafraichir();
    expect(controleur.vue().nonRetenues).toBeUndefined();

    etat.lu = undefined;
    await controleur.rafraichir();
    expect(controleur.vue().nonRetenues).toBeUndefined();
  });

  it('UT-COMP-US-017-2-46 marquerCommeLue — transmet les identifiants à l’application, puis rafraîchit la vue sans toast', async () => {
    const { controleur, marquerCommeLue, etat } = preparer();
    await controleur.rafraichir();
    etat.lu = { valeurs: [{ ...VALEUR, lue: true }], aLire: 0 };

    await controleur.marquerCommeLue([VALEUR.id]);

    expect(marquerCommeLue).toHaveBeenCalledExactlyOnceWith([VALEUR.id]);
    expect(controleur.vue().nonRetenues).toBeUndefined();
    expect(controleur.vue().toast).toBeUndefined();
  });

  it('UT-COMP-US-017-2-47 marquerCommeLue — échec d’écriture locale : toast TST-ERREUR-ENREGISTREMENT, « Réessayer » rejoue le geste', async () => {
    const { controleur, marquerCommeLue } = preparer(echec({ type: 'EcritureLocaleImpossible' }));
    await controleur.rafraichir();

    await controleur.marquerCommeLue([VALEUR.id]);
    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');

    await controleur.reessayer();
    expect(marquerCommeLue).toHaveBeenCalledTimes(2);
    expect(marquerCommeLue).toHaveBeenLastCalledWith([VALEUR.id]);
  });
});
