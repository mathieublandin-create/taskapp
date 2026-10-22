import { describe, expect, it } from 'vitest';
import { RouvrirTache } from '@src/objectifs-taches/application/cas-usage/rouvrir-tache';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationTache, ecritureCycleDeVie } from '@tests/support/modifications';
import { date, duree, idTache } from '@tests/support/valeurs';

const P = idTache(1);
const S = idTache(2);

describe('RouvrirTache (US-003 CA-9, S22)', () => {
  it('UT-US-003-15 RouvrirTache.executer — la sous-tâche d’une tâche terminée et sa tâche parente sont à faire ; l’historique de la tâche parente se termine par REOUVERTURE', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationTache(
          { id: P, intitule: 'Chapitre 1', delai: date('2026-11-30'), estimation: duree(120) },
          c.instant,
          0,
        ),
        creationTache(
          {
            id: S,
            intitule: 'Section A',
            delai: date('2026-11-20'),
            estimation: duree(60),
            tacheParenteId: P,
          },
          c.instant,
          1,
        ),
        ecritureCycleDeVie(S, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
        ecritureCycleDeVie(P, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
      ]),
    );

    valeurDe(await new RouvrirTache(env.service).executer({ tacheId: S }));

    const etat = valeurDe(await env.service.lire());
    expect([etat.taches.get(S)?.cycleDeVie, etat.taches.get(P)?.cycleDeVie]).toEqual([
      { etat: 'A_FAIRE' },
      { etat: 'A_FAIRE' },
    ]);
    const historique = valeurDe(
      await new ConsulterHistorique(env.service).executer({ type: 'TACHE', id: P }),
    );
    expect(historique.at(-1)?.type).toBe('REOUVERTURE');
  });
});
