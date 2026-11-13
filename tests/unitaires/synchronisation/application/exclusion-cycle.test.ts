/**
 * ST-US-031 v0.4 §4.1, §6.2 (rang 13, tranche B1) : décorateur d'exclusion du cycle. `SANS_EXCLUSION` appelle la tâche
 * aussitôt (comportement des rangs 3 à 12) ; `exclusionParVerrou` sérialise les tâches de deux onglets sur un même nom.
 */
import { describe, expect, it } from 'vitest';
import {
  exclusionParVerrou,
  SANS_EXCLUSION,
} from '@src/synchronisation/application/exclusion-cycle';
import { VerrouOngletsEnMemoire } from '@tests/doublures/verrou-onglets-memoire';
import { barriere, vider } from '@tests/support/synchronisation/onglets';

const NOM = 'donejuan-recette-3f5a9c0e:synchronisation-cycle';

describe('ExclusionCycle (ST-US-031 §6.2)', () => {
  it('UT-US-031-05 SANS_EXCLUSION — la tâche est appelée pendant l’appel ; sa promesse est renvoyée telle quelle', async () => {
    const appels: Array<string> = [];
    const promesse = Promise.resolve(42);

    const rendue = SANS_EXCLUSION.executer(() => {
      appels.push('tache');
      return promesse;
    });

    expect(appels).toEqual(['tache']);
    expect(rendue).toBe(promesse);
    const erreur = new Error('panne');
    await expect(SANS_EXCLUSION.executer(() => Promise.reject(erreur))).rejects.toBe(erreur);
  });

  it('UT-US-031-05 exclusionParVerrou — deux onglets : exécutions disjointes, ordre FIFO, verrou rendu après un rejet, erreur propagée', async () => {
    const verrous = new VerrouOngletsEnMemoire();
    const [a, b] = [verrous.onglet(), verrous.onglet()];
    const exclusionA = exclusionParVerrou(a, NOM);
    const exclusionB = exclusionParVerrou(b, NOM);
    const traces: Array<string> = [];
    const fin = barriere();
    const erreur = new Error('panne du cycle');

    const premiere = exclusionA.executer(async () => {
      traces.push('a:debut');
      await fin.promesse;
      traces.push('a:fin');
      throw erreur;
    });
    const seconde = exclusionB.executer(() => {
      traces.push('b');
      return Promise.resolve('b');
    });
    const troisieme = exclusionA.executer(() => {
      traces.push('a2');
      return Promise.resolve('a2');
    });
    await vider();
    expect(traces).toEqual(['a:debut']);
    expect(verrous.detenteur(NOM)).toBe(a.id);
    expect(verrous.enAttente(NOM)).toBe(2);

    fin.ouvrir();
    await expect(premiere).rejects.toBe(erreur);
    expect(await seconde).toBe('b');
    expect(await troisieme).toBe('a2');
    expect(traces).toEqual(['a:debut', 'a:fin', 'b', 'a2']);
    expect(verrous.detenteur(NOM)).toBeUndefined();
  });
});
