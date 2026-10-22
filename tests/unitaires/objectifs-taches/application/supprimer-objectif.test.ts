import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import { SupprimerObjectif } from '@src/objectifs-taches/application/cas-usage/supprimer-objectif';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const O = idObjectif(1);
const SO = idObjectif(2);
const T = idTache(1);

describe('SupprimerObjectif (US-001 CA-9, RG-046)', () => {
  it('UT-US-001-25 SupprimerObjectif.executer — l’objectif disparaît, sa tâche n’a plus d’objectif et son sous-objectif devient principal', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: O, intitule: 'Publier le guide' }, c.instant, 0),
        creationObjectif({ id: SO, intitule: 'Version imprimable', parentId: O }, c.instant, 1),
        creationTache(
          {
            id: T,
            intitule: 'Rédiger',
            delai: date('2026-11-30'),
            estimation: duree(60),
            objectifIds: [O],
          },
          c.instant,
          2,
        ),
      ]),
    );

    const resultat = await new SupprimerObjectif(env.service).executer({ objectifId: O });

    expect(resultat).toEqual(succes(undefined));
    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    expect(objectifs.map((o) => [o.id, o.parentId])).toEqual([[SO, undefined]]);
    const vue = construireVueMetier(valeurDe(await env.service.lire()));
    expect(vue.objectifsDirectsPar.get(T) ?? []).toEqual([]);
  });
});
