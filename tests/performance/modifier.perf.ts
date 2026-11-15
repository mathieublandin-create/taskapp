import { describe, expect, it } from 'vitest';
import { duree as dureeTest } from '@tests/support/valeurs';
import { succes } from '@src/commun/domaine/resultat';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { registre } from '@tests/support/fabriques/etat-local';
import { planAjoutant } from '@tests/support/plans';
import {
  date,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
  instant,
  SMARTPHONE,
} from '@tests/support/valeurs';

// ST-socle-ecriture.md §11 (ENF-T-02), §14 : une action locale en moins de 100 ms avec 5 000 tâches et
// 50 000 entrées de journal. Mesure indicative, consignée dans la pull request.
const NOMBRE_TACHES = 5_000;
const NOMBRE_EVENEMENTS = 50_000;
const SEUIL_MS = 100;
const DEPART = '2026-10-21T08:00:00.000Z';
const h = hlc(DEPART, 0, SMARTPHONE);

const registresDeTache = (n: number): ReadonlyArray<RegistreQuelconque> => {
  const id = idTache(n);
  return [
    registre({ type: 'TACHE', id, champ: 'creation' }, { creeLe: instant(DEPART) }, h),
    registre({ type: 'TACHE', id, champ: 'intitule' }, `Tâche ${String(n)}`, h),
    registre({ type: 'TACHE', id, champ: 'delai' }, date('2026-12-31'), h),
    registre({ type: 'TACHE', id, champ: 'estimationInitiale' }, dureeTest(60), h),
    registre({ type: 'TACHE', id, champ: 'cycleDeVie' }, { etat: 'A_FAIRE' }, h),
    registre(
      { type: 'LIEN_TACHE_OBJECTIF', id: `${id}|${idObjectif(1)}` as never, champ: 'actif' },
      true,
      h,
    ),
    registre({ type: 'TACHE', id, champ: 'intitule' }, `Tâche ${String(n)} bis`, h),
  ];
};

const evenement = (n: number): EvenementJournal => ({
  type: 'MODIFICATION_DELAI',
  element: { type: 'TACHE', id: idTache(1 + (n % NOMBRE_TACHES)) },
  avant: { delai: date('2026-12-30') },
  apres: { delai: date('2026-12-31') },
  id: idEvenementTest(idOperation(1), n),
  hlc: h,
  instant: instant(DEPART),
  jour: date('2026-10-21'),
});

describe('Performance de ServiceEtatLocal.modifier (ST-socle-ecriture.md §14)', () => {
  it(`PERF-SOC-01 modifier — une action prend moins de ${String(SEUIL_MS)} ms avec ${String(NOMBRE_TACHES)} tâches et ${String(NOMBRE_EVENEMENTS)} entrées de journal`, async () => {
    const env = creerEnvironnement(DEPART);
    const registres = Array.from({ length: NOMBRE_TACHES }, (_v, i) =>
      registresDeTache(i + 1),
    ).flat();
    const evenements = Array.from({ length: NOMBRE_EVENEMENTS }, (_v, i) => evenement(i));
    valeurDe(
      await env.depot.appliquer((etat) =>
        succes({
          plan: planAjoutant(etat, { registres, evenements, dernierHlc: h }),
          valeur: undefined,
        }),
      ),
    );
    const modifier = () =>
      env.service.modifier(() =>
        succes({
          modifications: [
            {
              type: 'ECRIRE_TACHE' as const,
              id: idTache(1),
              ecriture: { champ: 'intitule' as const, valeur: 'Renommée' },
            },
          ],
          valeur: undefined,
        }),
      );
    valeurDe(await modifier());

    const debut = performance.now();
    valeurDe(await modifier());
    const duree = performance.now() - debut;

    process.stdout.write(
      `[performance] modifier avec ${String(NOMBRE_TACHES)} tâches : ${duree.toFixed(1)} ms\n`,
    );
    expect(duree).toBeLessThan(SEUIL_MS);
  }, 120_000);
});
