import { describe, expect, it } from 'vitest';
import { CreerSousObjectif } from '@src/objectifs-taches/application/cas-usage/creer-sous-objectif';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { idObjectif } from '@tests/support/valeurs';

const P = idObjectif(1);

describe('CreerSousObjectif (US-023 CA-1)', () => {
  it('UT-US-023-19 CreerSousObjectif — le sous-objectif est lu avec son parent effectif, « à décliner en tâches »', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: P, intitule: 'Publier le guide' }, c.instant),
      ]),
    );

    const id = valeurDe(
      await new CreerSousObjectif(env.service, env.generateur).executer({
        parentId: P,
        intitule: 'Version imprimable',
      }),
    );

    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    expect(objectifs.find((o) => o.id === id)).toMatchObject({
      intitule: 'Version imprimable',
      parentId: P,
      etat: 'A_DECLINER',
    });
  });
});
