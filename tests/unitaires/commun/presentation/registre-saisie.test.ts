/** GardeSaisie réel (DAT §4.1.7) : une saisie est en cours tant qu'un formulaire ouvert est modifié. */
import { describe, expect, it } from 'vitest';
import { RegistreSaisie } from '@src/commun/presentation/saisie/registre-saisie';

describe('RegistreSaisie', () => {
  it('UT-COMP-US-001-01 aucune saisie en cours au départ', () => {
    expect(new RegistreSaisie().saisieEnCours()).toBe(false);
  });

  it('UT-COMP-US-001-02 une saisie est en cours tant qu’un formulaire modifié est déclaré', () => {
    const registre = new RegistreSaisie();
    registre.declarer('feuille-objectif', true);
    registre.declarer('renommer', true);
    registre.declarer('feuille-objectif', false);
    expect(registre.saisieEnCours()).toBe(true);
    registre.declarer('renommer', false);
    expect(registre.saisieEnCours()).toBe(false);
  });
});
