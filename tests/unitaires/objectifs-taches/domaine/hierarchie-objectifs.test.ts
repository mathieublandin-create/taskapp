import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { verifierPlacement } from '@src/objectifs-taches/domaine/hierarchie-objectifs';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { idObjectif } from '@tests/support/valeurs';

const X = idObjectif(1);
const P = idObjectif(2);
const SP = idObjectif(3);
const Y = idObjectif(4);
const SY = idObjectif(5);
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: X, intitule: 'Lancer le site' })
      .avecObjectif({ id: P, intitule: 'Publier le guide' })
      .avecObjectif({ id: SP, intitule: 'Version imprimable', parentIdEnregistre: P })
      .avecObjectif({ id: Y, intitule: 'Développer mon activité' })
      .avecObjectif({ id: SY, intitule: 'Trouver des clients', parentIdEnregistre: Y })
      .construire(),
  );

describe('verifierPlacement (RG-022, Q-US-023-1)', () => {
  it('UT-US-023-01 verifierPlacement — refuse de placer un objectif sous lui-même (ERR-031)', () => {
    expect(verifierPlacement(vue(), X, X)).toEqual(echec({ type: 'PlacementSousLuiMeme' }));
  });

  it('UT-US-023-02 verifierPlacement — refuse de placer un objectif qui a un sous-objectif sous un autre (ERR-030, n = 1)', () => {
    expect(verifierPlacement(vue(), Y, P)).toEqual(
      echec({
        type: 'DeuxiemeNiveau',
        variante: 'objectif-a-des-sous-objectifs',
        objectif: 'Développer mon activité',
        nombreSousObjectifs: 1,
      }),
    );
  });

  it('UT-US-023-03 verifierPlacement — refuse de placer un objectif sans sous-objectif sous un sous-objectif (ERR-030 cible-est-sous-objectif)', () => {
    expect(verifierPlacement(vue(), X, SP)).toEqual(
      echec({
        type: 'DeuxiemeNiveau',
        variante: 'cible-est-sous-objectif',
        cible: 'Version imprimable',
      }),
    );
  });

  it('UT-US-023-04 verifierPlacement — applique l’ordre de priorité de Q-US-023-1', () => {
    expect(verifierPlacement(vue(), Y, Y)).toEqual(echec({ type: 'PlacementSousLuiMeme' }));
    expect(verifierPlacement(vue(), Y, SY)).toEqual(
      echec({
        type: 'DeuxiemeNiveau',
        variante: 'objectif-a-des-sous-objectifs',
        objectif: 'Développer mon activité',
        nombreSousObjectifs: 1,
      }),
    );
  });

  it('UT-US-023-05 verifierPlacement — est sans effet sous le parent actuel ou pour un principal rendu principal ; à écrire sinon (S12)', () => {
    expect(verifierPlacement(vue(), SP, P)).toEqual(succes('SANS_EFFET'));
    expect(verifierPlacement(vue(), X, undefined)).toEqual(succes('SANS_EFFET'));
    expect(verifierPlacement(vue(), X, P)).toEqual(succes('A_ECRIRE'));
    expect(verifierPlacement(vue(), SP, undefined)).toEqual(succes('A_ECRIRE'));
  });
});
