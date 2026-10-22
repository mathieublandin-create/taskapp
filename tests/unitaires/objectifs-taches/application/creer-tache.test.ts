import { describe, expect, it } from 'vitest';
import { CreerTache } from '@src/objectifs-taches/application/cas-usage/creer-tache';
import { ConsulterTaches } from '@src/objectifs-taches/application/requetes/consulter-taches';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { date, idObjectif } from '@tests/support/valeurs';

const O = idObjectif(1);

describe('CreerTache (US-002 CA-1)', () => {
  it('UT-US-002-29 CreerTache — la tâche est lue par ConsulterTaches et le journal contient CREATION', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: O, intitule: 'Publier le guide' }, c.instant),
      ]),
    );

    const id = valeurDe(
      await new CreerTache(env.service, env.generateur).executer({
        intitule: 'Rédiger l’interview',
        delai: date('2026-11-30'),
        estimationMinutes: 60,
        objectifIds: [O],
      }),
    );

    const { taches } = valeurDe(await new ConsulterTaches(env.service, env.horloge).executer());
    expect(taches.map((t) => [t.id, t.intitule, t.delai, t.estimation, t.objectifs])).toEqual([
      [id, 'Rédiger l’interview', '2026-11-30', 60, [{ id: O, intitule: 'Publier le guide' }]],
    ]);
    const journal = valeurDe(await env.service.lireJournal({ type: 'TACHE', id }));
    expect(journal.map((e) => e.type)).toEqual(['CREATION']);
  });
});
