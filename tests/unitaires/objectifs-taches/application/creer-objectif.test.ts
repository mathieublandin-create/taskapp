import { describe, expect, it } from 'vitest';
import { CreerObjectif } from '@src/objectifs-taches/application/cas-usage/creer-objectif';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { date } from '@tests/support/valeurs';

describe('CreerObjectif (US-001 CA-1)', () => {
  it('UT-US-001-24 CreerObjectif — l’objectif créé est lu par ConsulterObjectifs et le journal contient CREATION du jour de Paris', async () => {
    const env = creerEnvironnement('2026-10-21T22:30:00.000Z');
    const creer = new CreerObjectif(env.service, env.generateur);

    const id = valeurDe(
      await creer.executer({ intitule: 'Publier le guide', delai: date('2026-12-15') }),
    );

    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    expect(objectifs.map((o) => [o.id, o.intitule, o.delai, o.etat])).toEqual([
      [id, 'Publier le guide', '2026-12-15', 'A_DECLINER'],
    ]);
    const journal = valeurDe(await env.service.lireJournal({ type: 'OBJECTIF', id }));
    expect(journal.map((e) => [e.type, e.jour])).toEqual([['CREATION', '2026-10-22']]);
  });
});
