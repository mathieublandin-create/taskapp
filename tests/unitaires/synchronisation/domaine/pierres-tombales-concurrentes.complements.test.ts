/**
 * Compléments de Bruce à la tranche B1c (ST-US-017 v0.8 §6.6 n° 3, 3 b ; DAT v0.11.9 §4.2.1 ; conditions J1 à J3 de
 * Starck, Q-ST017-STA-6). UT-COMP-US-017-2-52 et suivants.
 */
import { describe, expect, it } from 'vitest';
import { contextesEgaux, estConnue } from '@src/synchronisation/domaine/contexte-causal';
import { joindrePierresTombales } from '@src/synchronisation/domaine/pierre-tombale';
import {
  detecterValeursEcartees,
  idValeurEcartee,
  type ValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import {
  creationObjectifRegistre,
  deplaceSous,
  etatFusionnable,
  h,
  parentObjectif,
  suppressionObjectif,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const E = idObjectif(1);
const X = idObjectif(2);
const T1 = idTache(1);

const resume = (v: ValeurEcartee) => [v.id, v.motif, 'gagnante' in v ? v.gagnante : undefined];

describe('J1 : une pierre tombale ne connaît pas une écriture postérieure de son propre appareil (DAT v0.11.9 §4.2.1)', () => {
  it('UT-COMP-US-017-2-52 estConnue : même appareil connue si antérieure ou égale, pas si postérieure ; autre appareil par le contexte', () => {
    const tombe = suppressionObjectif(E, h(2, PC), { [SMARTPHONE]: h(1, SMARTPHONE) });
    const ecriture = (hlc: ReturnType<typeof h>) => ({ hlc, contexte: {} });
    expect(estConnue(tombe.ecriture, ecriture(h(1, PC)))).toBe(true);
    expect(estConnue(tombe.ecriture, ecriture(h(2, PC)))).toBe(true);
    expect(estConnue(tombe.ecriture, ecriture(h(4, PC)))).toBe(false);
    expect(estConnue(tombe.ecriture, ecriture(h(1, SMARTPHONE)))).toBe(true);
    expect(estConnue(tombe.ecriture, ecriture(h(2, SMARTPHONE)))).toBe(false);
    expect(estConnue(tombe.ecriture, ecriture(h(0, TROISIEME)))).toBe(false);
  });

  it('UT-COMP-US-017-2-53 réparation RG-048 du PC postérieure à sa suppression, qui replace un objectif sous E : écartée, que la pierre tombale du PC soit vue seule ou jointe', () => {
    const creationE = creationObjectifRegistre(E, h(0, PC));
    const creationX = creationObjectifRegistre(X, h(0, PC));
    const tombePc = suppressionObjectif(E, h(2, PC));
    const tombeJointe = suppressionObjectif(E, h(3, SMARTPHONE), { [PC]: h(2, PC) });
    // Écriture de réparation du PC (HLC postérieur à sa pierre tombale) qui rétablit X sous E.
    const reparation = parentObjectif(X, deplaceSous(E, h(1, PC)), h(4, PC));
    const recu = etatFusionnable([creationE, creationX, tombePc, reparation]);
    const attendu = idValeurEcartee({ type: 'OBJECTIF', id: X, champ: 'parent' }, h(4, PC));

    const vueSeule = detecterValeursEcartees(
      etatFusionnable([creationE, creationX, tombePc]),
      recu,
    );
    const vueJointe = detecterValeursEcartees(
      etatFusionnable([creationE, creationX, tombeJointe]),
      recu,
    );

    expect(vueSeule.map(resume)).toEqual([[attendu, 'SUPPRESSION', tombePc]]);
    expect(vueJointe.map(resume)).toEqual([[attendu, 'SUPPRESSION', tombeJointe]]);
  });

  it('UT-COMP-US-017-2-54 J1 sans effet entre deux écritures d’une même information : quand la gagnante est la plus grande, toute écriture de son appareil est connue, une autre par le contexte seul', () => {
    const gagnante = { hlc: h(3, PC), contexte: { [SMARTPHONE]: h(1, SMARTPHONE) } };
    const attendus: ReadonlyArray<readonly [ReturnType<typeof h>, boolean]> = [
      [h(1, PC), true],
      [h(2, PC), true],
      [h(1, SMARTPHONE), true],
      [h(2, SMARTPHONE), false],
      [h(2, TROISIEME), false],
    ];
    for (const [autre, connue] of attendus) {
      expect(estConnue(gagnante, { hlc: autre, contexte: {} })).toBe(connue);
    }
  });
});

describe('Jointure des pierres tombales : forme du résultat (ST-US-017 v0.8 §6.6 n° 3 b)', () => {
  const p = suppressionTache(T1, h(2, PC), { [SMARTPHONE]: h(0, SMARTPHONE) });
  const s = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(0, PC) });
  const sJointe = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(2, PC) });

  it('UT-COMP-US-017-2-55 contextesEgaux : mêmes appareils et mêmes HLC, dans un ordre de clés quelconque', () => {
    expect(contextesEgaux({}, {})).toBe(true);
    expect(
      contextesEgaux(
        { [PC]: h(1, PC), [SMARTPHONE]: h(2, SMARTPHONE) },
        { [SMARTPHONE]: h(2, SMARTPHONE), [PC]: h(1, PC) },
      ),
    ).toBe(true);
    expect(contextesEgaux({ [PC]: h(1, PC) }, { [PC]: h(2, PC) })).toBe(false);
    expect(contextesEgaux({ [PC]: h(1, PC) }, {})).toBe(false);
    expect(contextesEgaux({}, { [PC]: h(1, PC) })).toBe(false);
    expect(contextesEgaux({ [PC]: h(1, PC) }, { [TROISIEME]: h(1, TROISIEME) })).toBe(false);
  });

  it('UT-COMP-US-017-2-56 joindrePierresTombales : valeur et HLC de la plus récente, contexte joint sans son auteur ; référence conservée si rien ne change', () => {
    const jointe = joindrePierresTombales(p, s);
    expect(jointe).toEqual(sJointe);
    expect(joindrePierresTombales(s, p)).toEqual(sJointe);
    // a conservée (même HLC, contexte déjà joint), b conservée de même, quel que soit l'ordre.
    expect(joindrePierresTombales(sJointe, p)).toBe(sJointe);
    expect(joindrePierresTombales(p, sJointe)).toBe(sJointe);
    expect(joindrePierresTombales(s, sJointe)).toBe(sJointe);
    expect(joindrePierresTombales(sJointe, s)).toBe(sJointe);
    expect(joindrePierresTombales(p, p)).toBe(p);
    // Nouvel objet : aucune des deux ne porte le contexte joint ; les entrées ne sont pas modifiées.
    expect(jointe).not.toBe(s);
    expect(s.ecriture.contexte).toEqual({ [PC]: h(0, PC) });
  });
});
