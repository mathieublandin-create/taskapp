import { describe, expect, it } from 'vitest';
import { SupprimerTache } from '@src/objectifs-taches/application/cas-usage/supprimer-tache';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { ConsulterTaches } from '@src/objectifs-taches/application/requetes/consulter-taches';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const O = idObjectif(1);
const P = idTache(1);
const S1 = idTache(2);
const S2 = idTache(3);

describe('SupprimerTache (US-002 CA-12 ; US-024 CA-9)', () => {
  it('UT-US-002-31 SupprimerTache.executer — la tâche et ses sous-tâches disparaissent à la lecture ; l’état de l’objectif est recalculé (US-002 CA-12)', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: O, intitule: 'Publier le guide' }, c.instant, 0),
        creationTache(
          {
            id: P,
            intitule: 'Chapitre 1',
            delai: date('2026-11-30'),
            estimation: duree(180),
            objectifIds: [O],
          },
          c.instant,
          1,
        ),
        creationTache(
          {
            id: S1,
            intitule: 'Section A',
            delai: date('2026-11-20'),
            estimation: duree(60),
            tacheParenteId: P,
          },
          c.instant,
          2,
        ),
        creationTache(
          {
            id: S2,
            intitule: 'Section B',
            delai: date('2026-11-25'),
            estimation: duree(60),
            tacheParenteId: P,
          },
          c.instant,
          3,
        ),
      ]),
    );

    valeurDe(await new SupprimerTache(env.service).executer({ tacheId: P }));

    expect(valeurDe(await new ConsulterTaches(env.service, env.horloge).executer()).taches).toEqual(
      [],
    );
    expect([...construireVueMetier(valeurDe(await env.service.lire())).taches.keys()]).toEqual([]);
    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    expect(objectifs.map((o) => o.etat)).toEqual(['A_DECLINER']);
  });

  it('UT-US-024-20 SupprimerTache.executer — à la suppression de la dernière sous-tâche, l’estimation initiale de la tâche parente est persistée et historisée (S10)', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationTache(
          { id: P, intitule: 'Chapitre 1', delai: date('2026-11-30'), estimation: duree(180) },
          c.instant,
          0,
        ),
        creationTache(
          {
            id: S1,
            intitule: 'Section A',
            delai: date('2026-11-20'),
            estimation: duree(90),
            tacheParenteId: P,
          },
          c.instant,
          1,
        ),
      ]),
    );

    valeurDe(await new SupprimerTache(env.service).executer({ tacheId: S1 }));

    expect(valeurDe(await env.service.lire()).taches.get(P)?.estimationInitiale).toBe(90);
    const historique = valeurDe(
      await new ConsulterHistorique(env.service).executer({ type: 'TACHE', id: P }),
    );
    expect(historique.at(-1)).toMatchObject({
      type: 'MODIFICATION_ESTIMATION',
      avant: { estimation: 90 },
      apres: { estimation: 90 },
    });
  });
});
