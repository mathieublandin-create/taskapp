import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { AdresseGoogle, IdCompte } from '@src/compte/domaine/identite';

describe('Identité (conventions §9.2)', () => {
  it('UT-US-022-07 IdCompte et AdresseGoogle — refusent le vide, les espaces et une adresse sans « @ », acceptent des valeurs ordinaires', () => {
    expect(IdCompte.depuisSub('')).toEqual(echec({ type: 'SubInvalide' }));
    expect(IdCompte.depuisSub('12 34')).toEqual(echec({ type: 'SubInvalide' }));
    expect(IdCompte.depuisSub('x'.repeat(256))).toEqual(echec({ type: 'SubInvalide' }));
    expect(IdCompte.depuisSub('108234567890123456789')).toEqual({
      ok: true,
      valeur: '108234567890123456789',
    });
    expect(AdresseGoogle.depuisTexte('')).toEqual(echec({ type: 'AdresseInvalide' }));
    expect(AdresseGoogle.depuisTexte('a b@exemple.test')).toEqual(
      echec({ type: 'AdresseInvalide' }),
    );
    expect(AdresseGoogle.depuisTexte('exemple.test')).toEqual(echec({ type: 'AdresseInvalide' }));
    expect(AdresseGoogle.depuisTexte('@exemple.test')).toEqual(echec({ type: 'AdresseInvalide' }));
    expect(AdresseGoogle.depuisTexte('a@b@exemple.test')).toEqual(
      echec({ type: 'AdresseInvalide' }),
    );
    expect(AdresseGoogle.depuisTexte('a@exemple.test')).toEqual({
      ok: true,
      valeur: 'a@exemple.test',
    });
  });
});
