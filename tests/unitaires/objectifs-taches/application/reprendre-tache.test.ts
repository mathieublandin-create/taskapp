import { describe, expect, it } from 'vitest';
import { AbandonnerTache } from '@src/objectifs-taches/application/cas-usage/abandonner-tache';
import { ReprendreTache } from '@src/objectifs-taches/application/cas-usage/reprendre-tache';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationTache, ecritureCycleDeVie } from '@tests/support/modifications';
import { date, duree, ecart, HEURE, idTache } from '@tests/support/valeurs';

const CHAPITRE = idTache(1);
const SECTION_A = idTache(2);
const SECTION_B = idTache(3);

describe('ReprendreTache (US-025 CA-11, S18)', () => {
  it('UT-US-025-17 ReprendreTache — l’historique de « Section B » se termine par ABANDON puis REPRISE ; « Section A », terminée, n’a aucune entrée ABANDON', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationTache(
          {
            id: CHAPITRE,
            intitule: 'Chapitre 1',
            delai: date('2026-11-30'),
            estimation: duree(180),
          },
          c.instant,
          0,
        ),
        creationTache(
          {
            id: SECTION_A,
            intitule: 'Section A',
            delai: date('2026-11-20'),
            estimation: duree(60),
            tacheParenteId: CHAPITRE,
          },
          c.instant,
          1,
        ),
        creationTache(
          {
            id: SECTION_B,
            intitule: 'Section B',
            delai: date('2026-11-25'),
            estimation: duree(60),
            tacheParenteId: CHAPITRE,
          },
          c.instant,
          2,
        ),
        ecritureCycleDeVie(SECTION_A, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
      ]),
    );
    valeurDe(await new AbandonnerTache(env.service).executer({ tacheId: CHAPITRE }));
    env.horloge.avancer(ecart(HEURE));

    valeurDe(await new ReprendreTache(env.service).executer({ tacheId: CHAPITRE }));

    const historique = new ConsulterHistorique(env.service);
    const typesB = valeurDe(await historique.executer({ type: 'TACHE', id: SECTION_B })).map(
      (e) => e.type,
    );
    const typesA = valeurDe(await historique.executer({ type: 'TACHE', id: SECTION_A })).map(
      (e) => e.type,
    );
    expect(typesB.slice(-2)).toEqual(['ABANDON', 'REPRISE']);
    expect(typesA).not.toContain('ABANDON');
  });
});
