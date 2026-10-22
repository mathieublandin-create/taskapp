import { describe, expect, it } from 'vitest';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import { TerminerTache } from '@src/objectifs-taches/application/cas-usage/terminer-tache';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, idObjectif, idTache, NEW_YORK, PARIS, UTC } from '@tests/support/valeurs';

const T = idTache(1);

describe('TerminerTache (US-003 CA-1, PT-16)', () => {
  it.each<[string, Fuseau, string, string]>([
    ['Paris 2026-10-25 01:59', PARIS, '2026-10-24T23:59:00.000Z', '2026-10-25'],
    [
      'Paris 2026-10-25 02:30 (première occurrence)',
      PARIS,
      '2026-10-25T00:30:00.000Z',
      '2026-10-25',
    ],
    ['Paris 2026-10-25 23:59', PARIS, '2026-10-25T22:59:00.000Z', '2026-10-25'],
    ['Paris 2026-10-26 00:00', PARIS, '2026-10-25T23:00:00.000Z', '2026-10-26'],
    ['UTC 2026-10-24 22:30', UTC, '2026-10-24T22:30:00.000Z', '2026-10-25'],
    ['UTC 2026-10-25 22:30', UTC, '2026-10-25T22:30:00.000Z', '2026-10-25'],
    ['UTC 2026-10-25 23:30', UTC, '2026-10-25T23:30:00.000Z', '2026-10-26'],
    ['New York 2026-11-10 23:00 (S02)', NEW_YORK, '2026-11-11T04:00:00.000Z', '2026-11-11'],
  ])(
    'UT-US-003-11 TerminerTache — %s : date de fin attendue (S03, S02)',
    async (_cas, fuseau, iso, dateFin) => {
      const env = creerEnvironnement(iso);
      env.horloge.reglerFuseauAppareil(fuseau);
      valeurDe(
        await appliquerModifications(env.service, (_, c) => [
          creationTache(
            { id: T, intitule: 'Chapitre 1', delai: date('2026-11-30'), estimation: duree(120) },
            c.instant,
          ),
        ]),
      );

      valeurDe(await new TerminerTache(env.service).executer({ tacheId: T }));

      expect(valeurDe(await env.service.lire()).taches.get(T)?.cycleDeVie).toMatchObject({
        etat: 'TERMINEE',
        dateFin: date(dateFin),
      });
    },
  );

  it('UT-US-003-14 TerminerTache puis ConsulterObjectifs — une tâche rattachée à deux objectifs les rend tous deux « atteint » (US-003 CA-7)', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, c.instant, 0),
        creationObjectif({ id: idObjectif(2), intitule: 'Développer mon activité' }, c.instant, 1),
        creationTache(
          {
            id: T,
            intitule: 'Rédiger',
            delai: date('2026-11-30'),
            estimation: duree(60),
            objectifIds: [idObjectif(1), idObjectif(2)],
          },
          c.instant,
          2,
        ),
      ]),
    );

    valeurDe(await new TerminerTache(env.service).executer({ tacheId: T }));

    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    expect(objectifs.map((o) => o.etat)).toEqual(['ATTEINT', 'ATTEINT']);
  });
});
