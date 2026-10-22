import { describe, expect, it } from 'vitest';
import { ConsulterDetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const T = idTache(1);

describe('ConsulterDetailTache (US-002 CA-8, CA-9)', () => {
  it('UT-US-002-34 ConsulterDetailTache — présente les objectifs, l’alerte de délai, l’estimation non calculée et les actions d’édition', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif(
          { id: O1, intitule: 'Publier le guide', delai: date('2026-11-20') },
          c.instant,
          0,
        ),
        creationObjectif({ id: O2, intitule: 'Développer mon activité' }, c.instant, 1),
        creationTache(
          {
            id: T,
            intitule: 'Rédiger l’interview',
            delai: date('2026-11-30'),
            estimation: duree(60),
            objectifIds: [O1, O2],
          },
          c.instant,
          2,
        ),
      ]),
    );

    const detail = valeurDe(await new ConsulterDetailTache(env.service, env.horloge).executer(T));

    expect(detail.tache).toMatchObject({
      objectifs: [
        { id: O1, intitule: 'Publier le guide' },
        { id: O2, intitule: 'Développer mon activité' },
      ],
      objectifsHerites: false,
      alertes: [
        {
          type: 'OBJECTIFS',
          objectifs: [{ id: O1, intitule: 'Publier le guide', delai: date('2026-11-20') }],
        },
      ],
      estimation: 60,
      estimationCalculee: false,
    });
    expect(detail.actions).toEqual(
      expect.arrayContaining([
        'RENOMMER',
        'MODIFIER_DELAI',
        'MODIFIER_ESTIMATION',
        'RATTACHER',
        'DETACHER',
        'SUPPRIMER',
      ]),
    );
    expect(detail.sousTaches).toEqual([]);
  });
});
