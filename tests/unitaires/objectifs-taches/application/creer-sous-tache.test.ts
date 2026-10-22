import { describe, expect, it } from 'vitest';
import { CreerSousTache } from '@src/objectifs-taches/application/cas-usage/creer-sous-tache';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationTache, ecritureCycleDeVie } from '@tests/support/modifications';
import { date, duree, idTache } from '@tests/support/valeurs';

const P = idTache(1);

describe('CreerSousTache (US-024 S17)', () => {
  it('UT-US-024-19 CreerSousTache.executer — sous une tâche terminée : la sous-tâche est créée, la tâche parente est à faire, deux entrées de journal', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationTache(
          { id: P, intitule: 'Chapitre 1', delai: date('2026-11-30'), estimation: duree(120) },
          c.instant,
          0,
        ),
        ecritureCycleDeVie(P, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
      ]),
    );

    const id = valeurDe(
      await new CreerSousTache(env.service, env.generateur).executer({
        tacheParenteId: P,
        intitule: 'Section A',
        delai: date('2026-11-20'),
        estimationMinutes: 60,
      }),
    );

    const etat = valeurDe(await env.service.lire());
    expect(etat.taches.get(id)).toMatchObject({ intitule: 'Section A', tacheParenteId: P });
    expect(etat.taches.get(P)?.cycleDeVie).toEqual({ etat: 'A_FAIRE' });
    const historique = new ConsulterHistorique(env.service);
    expect(valeurDe(await historique.executer({ type: 'TACHE', id })).map((e) => e.type)).toEqual([
      'CREATION',
    ]);
    expect(
      valeurDe(await historique.executer({ type: 'TACHE', id: P })).map((e) => e.type),
    ).toEqual(['CREATION', 'REOUVERTURE']);
  });
});
