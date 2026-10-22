import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import { date } from '@tests/support/valeurs';

describe('DateCalendaire', () => {
  it.each(['2026-02-30', '2026-1-5', ''])(
    'UT-SOC-03 DateCalendaire.depuisTexte — refuse « %s » (RG-045)',
    (texte) => {
      const resultat = DateCalendaire.depuisTexte(texte);

      expect(resultat).toEqual(echec({ type: 'DateInvalide', texte }));
    },
  );

  it('UT-SOC-03 DateCalendaire.depuisTexte — accepte le 29 février d’une année bissextile (RG-045)', () => {
    const resultat = DateCalendaire.depuisTexte('2028-02-29');

    expect(resultat).toEqual(succes(date('2028-02-29')));
  });

  it('UT-SOC-04 DateCalendaire.ajouterJours — passe à l’année suivante le 31 décembre', () => {
    expect(DateCalendaire.ajouterJours(date('2026-12-31'), 1)).toBe('2027-01-01');
    expect(DateCalendaire.ajouterJours(date('2028-02-28'), 1)).toBe('2028-02-29');
    expect(DateCalendaire.ajouterJours(date('2027-01-01'), -1)).toBe('2026-12-31');
  });

  it('UT-SOC-04 DateCalendaire.comparer — ordonne les dates civiles', () => {
    expect(DateCalendaire.comparer(date('2026-12-31'), date('2027-01-01'))).toBe(-1);
    expect(DateCalendaire.comparer(date('2027-01-01'), date('2027-01-01'))).toBe(0);
    expect(DateCalendaire.comparer(date('2027-01-01'), date('2026-12-31'))).toBe(1);
  });
});
