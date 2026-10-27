import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import { fusionnerEtats, type EtatFusionnable } from '@src/synchronisation/domaine/fusion';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import type { CleTexte } from '@src/synchronisation/domaine/information';
import { registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import { hlc, idTache, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;
/** Écriture d'intitulé : tâche (3), minute (5), compteur (2), appareil (3). Même HLC ⇒ même valeur (unicité d'une écriture). */
const ecriture = fc
  .tuple(
    fc.integer({ min: 1, max: 3 }),
    fc.integer({ min: 0, max: 4 }),
    fc.integer({ min: 0, max: 1 }),
    fc.integer({ min: 0, max: 2 }),
  )
  .map(([tache, minute, compteur, appareil]) => {
    const h = hlc(
      `2026-10-21T08:0${String(minute)}:00.000Z`,
      compteur,
      APPAREILS[appareil] ?? SMARTPHONE,
    );
    return registre(
      { type: 'TACHE', id: idTache(tache), champ: 'intitule' },
      `v-${String(minute)}-${String(compteur)}-${String(appareil)}`,
      h,
    );
  });
const etatArbitraire = fc.array(ecriture, { maxLength: 8 }).map((registres): EtatFusionnable => {
  const parCle = new Map<CleTexte, RegistreQuelconque>();
  registres.forEach((r) => parCle.set(texteDeCle(r.cle), r));
  return { registres: parCle, journal: new Map<IdEvenement, EvenementJournal>() };
});
const normaliser = (e: EtatFusionnable) =>
  [...e.registres.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

describe('Propriétés de la fusion (R14, conventions §11.4)', () => {
  it('UT-US-017-04 fusionnerEtats — est commutative, associative et idempotente', () => {
    fc.assert(
      fc.property(etatArbitraire, etatArbitraire, etatArbitraire, (a, b, c) => {
        expect(normaliser(fusionnerEtats(a, b))).toEqual(normaliser(fusionnerEtats(b, a)));
        expect(normaliser(fusionnerEtats(fusionnerEtats(a, b), c))).toEqual(
          normaliser(fusionnerEtats(a, fusionnerEtats(b, c))),
        );
        expect(normaliser(fusionnerEtats(a, a))).toEqual(normaliser(a));
      }),
    );
  });
});
