import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
} from '@src/synchronisation/application/ports/depot-local';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import { GenerateurIdentifiantsSequentiel } from '@tests/doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import {
  date,
  duree,
  ecart,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
  instant,
  MINUTE,
  SMARTPHONE,
} from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';
const ILLISIBLE: ErreurDepotLocal = { type: 'DonneesLocalesIllisibles' };

/** Dépôt dont toute lecture échoue, pour vérifier que le service propage l'erreur sans la déformer. */
const depotIllisible: DepotLocal = {
  lire: () => Promise.resolve(echec(ILLISIBLE)),
  appliquer: () => Promise.resolve(echec(ILLISIBLE)),
  observer: () => () => undefined,
  lireMeta: () => Promise.resolve(echec(ILLISIBLE)),
  appliquerSynchronisation: () => Promise.resolve(echec(ILLISIBLE)),
  lireSignalements: () => Promise.resolve(echec(ILLISIBLE)),
};

const serviceSur = (depot: DepotLocal) =>
  new ServiceEtatLocalTransactionnel({
    depot,
    horloge: new HorlogeSimulee(new TempsSimule(instant(DEPART))),
    generateur: new GenerateurIdentifiantsSequentiel(),
  });

describe('ServiceEtatLocalTransactionnel — compléments (ST-socle-ecriture.md §4.2, §6.6)', () => {
  it('UT-COMP-60 lire, lireJournal et lireDecompteEnAttente — propagent l’erreur du dépôt', async () => {
    const service = serviceSur(depotIllisible);

    const resultats: ReadonlyArray<Resultat<unknown, ErreurDepotLocal>> = [
      await service.lire(),
      await service.lireJournal({ type: 'OBJECTIF', id: idObjectif(1) }),
      await service.lireDecompteEnAttente(),
    ];

    expect(resultats).toEqual([echec(ILLISIBLE), echec(ILLISIBLE), echec(ILLISIBLE)]);
  });

  it('UT-COMP-61 lireDecompteEnAttente — compte les éléments distincts et date la plus ancienne modification', async () => {
    const env = creerEnvironnement(DEPART);
    expect(valeurDe(await env.service.lireDecompteEnAttente())).toEqual({ nombre: 0 });
    valeurDe(
      await appliquerModifications(env.service, (_etat, c) => [
        creationObjectif({ id: idObjectif(1), intitule: 'A' }, c.instant),
      ]),
    );
    env.temps.avancer(ecart(10 * MINUTE));
    valeurDe(
      await appliquerModifications(env.service, (_etat, c) => [
        creationTache(
          { id: idTache(1), intitule: 'T', delai: date('2026-12-01'), estimation: duree(30) },
          c.instant,
        ),
      ]),
    );

    const decompte = valeurDe(await env.service.lireDecompteEnAttente());

    expect(decompte).toEqual({ nombre: 2, plusAncienne: instant(DEPART) });
  });

  it('UT-COMP-62 modifier — projette l’état une seule fois par version (mémorisation, §6.6)', async () => {
    const env = creerEnvironnement(DEPART);
    valeurDe(
      await appliquerModifications(env.service, (_etat, c) => [
        creationObjectif({ id: idObjectif(1), intitule: 'A' }, c.instant),
      ]),
    );

    const premiere = valeurDe(await env.service.lire());
    const seconde = valeurDe(await env.service.lire());

    expect(seconde).toBe(premiere);
    expect(succes(premiere).valeur.objectifs.get(idObjectif(1))?.intitule).toBe('A');
  });

  it('UT-COMP-63 lireJournal — départage deux entrées de même HLC par l’identifiant, en ordre ordinal (§6.7)', async () => {
    const O = idObjectif(1);
    const h = hlc(DEPART, 0, SMARTPHONE);
    const evenement = (rang: number): EvenementJournal => ({
      type: 'SUPPRESSION',
      element: { type: 'OBJECTIF', id: O },
      avant: {},
      apres: {},
      id: idEvenementTest(idOperation(1), rang),
      hlc: h,
      instant: instant(DEPART),
      jour: date('2026-10-21'),
    });
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      journal: [evenement(2), evenement(10), evenement(1)],
    });
    const service = serviceSur({ ...depotIllisible, lire: () => Promise.resolve(succes(etat)) });

    const journal = valeurDe(await service.lireJournal({ type: 'OBJECTIF', id: O }));

    expect(journal.map((e) => e.id.split(':')[1])).toEqual(['1', '10', '2']);
  });

  it('UT-COMP-US-017-2-29 lireJournal — à HLC égal, une entrée de cas d’usage précède une entrée de réparation, quel que soit l’identifiant (ST-US-017 v0.6 §6.6 n° 9 c)', async () => {
    const O = idObjectif(1);
    const h = hlc(DEPART, 0, SMARTPHONE);
    const evenement = (id: string): EvenementJournal => ({
      type: 'SUPPRESSION',
      element: { type: 'OBJECTIF', id: O },
      avant: {},
      apres: {},
      id: id as EvenementJournal['id'],
      hlc: h,
      instant: instant(DEPART),
      jour: date('2026-10-21'),
    });
    const reparation = '0'.repeat(52);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      journal: [evenement(reparation), evenement(idEvenementTest(idOperation(1), 1))],
    });
    const service = serviceSur({ ...depotIllisible, lire: () => Promise.resolve(succes(etat)) });

    const journal = valeurDe(await service.lireJournal({ type: 'OBJECTIF', id: O }));

    expect(journal.map((e) => e.id === reparation)).toEqual([false, true]);
  });
});
