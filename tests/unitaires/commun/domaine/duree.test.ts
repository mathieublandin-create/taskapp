import { describe, expect, it } from 'vitest';
import { Duree } from '@src/commun/domaine/duree';
import { echec, succes } from '@src/commun/domaine/resultat';
import { duree } from '@tests/support/valeurs';

describe('Duree (RG-028)', () => {
  it.each([0, -30, 45, 30.5])('UT-SOC-01 Duree.saisie — refuse %d minutes (RG-028)', (minutes) => {
    const resultat = Duree.saisie(minutes);

    expect(resultat).toEqual(echec({ type: 'DureeSaisieInvalide', minutes }));
  });

  it.each([30, 90])('UT-SOC-01 Duree.saisie — accepte %d minutes (RG-028)', (minutes) => {
    const resultat = Duree.saisie(minutes);

    expect(resultat).toEqual(succes(duree(minutes)));
  });

  it('UT-SOC-02 Duree.calculee — accepte 0 h quand le total dérivé est nul (RG-028, PEP-9)', () => {
    const resultat = Duree.calculee(0);

    expect(resultat).toEqual(succes(duree(0)));
  });

  it.each([-30, 45])('UT-SOC-02 Duree.calculee — refuse %d minutes (RG-028, PEP-9)', (minutes) => {
    const resultat = Duree.calculee(minutes);

    expect(resultat).toEqual(echec({ type: 'DureeCalculeeInvalide', minutes }));
  });
});
