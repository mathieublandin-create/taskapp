import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { validerSaisieTache } from '@src/objectifs-taches/domaine/saisie-tache';
import { date, duree } from '@tests/support/valeurs';

const DELAI = date('2026-11-30');
const refus = (...defauts: ReadonlyArray<string>) => echec({ type: 'SaisieInvalide', defauts });

describe('validerSaisieTache (RG-003, RG-028, RG-029 ; guide §6.6.8)', () => {
  it('UT-US-002-01 validerSaisieTache — nomme le délai absent, l’estimation absente, ou les deux dans l’ordre (US-002 CA-3)', () => {
    expect(validerSaisieTache({ intitule: 'Rédiger', estimationMinutes: 60 })).toEqual(
      refus('DELAI_ABSENT'),
    );
    expect(validerSaisieTache({ intitule: 'Rédiger', delai: DELAI })).toEqual(
      refus('ESTIMATION_ABSENTE'),
    );
    expect(validerSaisieTache({ intitule: 'Rédiger' })).toEqual(
      refus('DELAI_ABSENT', 'ESTIMATION_ABSENTE'),
    );
  });

  it('UT-US-002-02 validerSaisieTache — nomme l’intitulé vide, et cumule intitulé puis délai dans l’ordre (US-002 CA-3)', () => {
    expect(validerSaisieTache({ intitule: '  ', delai: DELAI, estimationMinutes: 60 })).toEqual(
      refus('INTITULE_VIDE'),
    );
    expect(validerSaisieTache({ intitule: '', estimationMinutes: 60 })).toEqual(
      refus('INTITULE_VIDE', 'DELAI_ABSENT'),
    );
  });

  it.each([0, 45, 70])(
    'UT-US-002-03 validerSaisieTache — refuse une estimation de %d min (US-002 CA-4, RG-028)',
    (minutes) => {
      expect(
        validerSaisieTache({ intitule: 'Rédiger', delai: DELAI, estimationMinutes: minutes }),
      ).toEqual(refus('ESTIMATION_INVALIDE'));
    },
  );

  it.each([30, 60, 90])(
    'UT-US-002-03 validerSaisieTache — accepte une estimation de %d min (US-002 CA-4, RG-028)',
    (minutes) => {
      expect(
        validerSaisieTache({ intitule: ' Rédiger ', delai: DELAI, estimationMinutes: minutes }),
      ).toEqual(succes({ intitule: 'Rédiger', delai: DELAI, estimation: duree(minutes) }));
    },
  );
});
