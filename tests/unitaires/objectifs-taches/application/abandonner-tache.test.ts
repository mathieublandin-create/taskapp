import { describe, expect, it } from 'vitest';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import { AbandonnerTache } from '@src/objectifs-taches/application/cas-usage/abandonner-tache';
import { TerminerTache } from '@src/objectifs-taches/application/cas-usage/terminer-tache';
import { ConsulterDetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import type { CycleDeVie } from '@src/synchronisation/domaine/information';
import { succes } from '@src/commun/domaine/resultat';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache, ecritureCycleDeVie } from '@tests/support/modifications';
import {
  date,
  duree,
  idEvenementTest,
  idObjectif,
  idTache,
  NEW_YORK,
  PARIS,
  UTC,
} from '@tests/support/valeurs';

const P = idTache(1);
const S1 = idTache(2);
const S2 = idTache(3);
const O = idObjectif(1);

describe('AbandonnerTache (US-025)', () => {
  it('UT-US-025-11 AbandonnerTache puis TerminerTache — la sous-tâche de 1 h 30 abandonnée, la tâche parente est estimée à 1 h et peut être terminée (US-025 CA-9, S13)', async () => {
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
        creationTache(
          {
            id: S2,
            intitule: 'Section B',
            delai: date('2026-11-20'),
            estimation: duree(60),
            tacheParenteId: P,
          },
          c.instant,
          2,
        ),
        ecritureCycleDeVie(S2, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
      ]),
    );

    valeurDe(await new AbandonnerTache(env.service).executer({ tacheId: S1 }));

    expect(
      valeurDe(await new ConsulterDetailTache(env.service, env.horloge).executer(P)).tache
        .estimation,
    ).toBe(60);
    expect(await new TerminerTache(env.service).executer({ tacheId: P })).toEqual(
      succes(undefined),
    );
  });

  it.each<[CycleDeVie['etat'], string]>([
    ['TERMINEE', 'ATTEINT'],
    ['A_FAIRE', 'EN_COURS'],
    ['ABANDONNEE', 'A_DECLINER'],
  ])(
    'UT-US-025-12 AbandonnerTache puis ConsulterObjectifs — autre tâche %s : objectif %s (S07, US-025 CA-4)',
    async (autreEtat, etatAttendu) => {
      const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
      const autre = idTache(9);
      valeurDe(
        await appliquerModifications(env.service, (_, c) => {
          const etats: Record<CycleDeVie['etat'], CycleDeVie | undefined> = {
            A_FAIRE: undefined,
            TERMINEE: { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant },
            ABANDONNEE: {
              etat: 'ABANDONNEE',
              dateAbandon: c.jour,
              instantAbandon: c.instant,
              evenementAbandon: idEvenementTest(c.operation, 9),
            },
          };
          const etatAutre = etats[autreEtat];
          return [
            creationObjectif({ id: O, intitule: 'Nouvelle identité visuelle' }, c.instant, 0),
            creationTache(
              {
                id: autre,
                intitule: 'Choisir l’agence',
                delai: date('2026-11-15'),
                estimation: duree(60),
                objectifIds: [O],
              },
              c.instant,
              1,
            ),
            creationTache(
              {
                id: P,
                intitule: 'Refaire le logo',
                delai: date('2026-11-30'),
                estimation: duree(120),
                objectifIds: [O],
              },
              c.instant,
              2,
            ),
            ...(etatAutre === undefined ? [] : [ecritureCycleDeVie(autre, etatAutre)]),
          ];
        }),
      );

      valeurDe(await new AbandonnerTache(env.service).executer({ tacheId: P }));

      const { objectifs } = valeurDe(
        await new ConsulterObjectifs(env.service, env.horloge).executer(),
      );
      expect(objectifs.map((o) => o.etat)).toEqual([etatAttendu]);
    },
  );

  it.each<[string, Fuseau, string, string]>([
    ['Paris 2026-10-21 10:00', PARIS, '2026-10-21T08:00:00.000Z', '2026-10-21'],
    ['New York 2026-11-10 23:00', NEW_YORK, '2026-11-11T04:00:00.000Z', '2026-11-11'],
    [
      'Paris 2026-10-25 02:30 (première occurrence)',
      PARIS,
      '2026-10-25T00:30:00.000Z',
      '2026-10-25',
    ],
    ['UTC 2026-10-25 22:30', UTC, '2026-10-25T22:30:00.000Z', '2026-10-25'],
    ['UTC 2026-10-25 23:30', UTC, '2026-10-25T23:30:00.000Z', '2026-10-26'],
  ])(
    'UT-US-025-13 AbandonnerTache — %s : date d’abandon attendue (S03, PT-16)',
    async (_cas, fuseau, iso, dateAbandon) => {
      const env = creerEnvironnement(iso);
      env.horloge.reglerFuseauAppareil(fuseau);
      valeurDe(
        await appliquerModifications(env.service, (_, c) => [
          creationTache(
            {
              id: P,
              intitule: 'Refaire le logo',
              delai: date('2026-11-30'),
              estimation: duree(120),
            },
            c.instant,
          ),
        ]),
      );

      valeurDe(await new AbandonnerTache(env.service).executer({ tacheId: P }));

      expect(valeurDe(await env.service.lire()).taches.get(P)?.cycleDeVie).toMatchObject({
        etat: 'ABANDONNEE',
        dateAbandon: date(dateAbandon),
      });
    },
  );
});
