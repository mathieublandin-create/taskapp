import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { verifierPlacement } from '@src/objectifs-taches/domaine/hierarchie-objectifs';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { idObjectif } from '@tests/support/valeurs';

const X = idObjectif(1);
const C = idObjectif(2);
const SUPPRIME = idObjectif(3);
const INCONNU = idObjectif(99);
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: X, intitule: 'Lancer le site' })
      .avecObjectif({ id: C, intitule: 'Publier le guide' })
      .avecObjectif({ id: SUPPRIME, intitule: 'Ancien objectif', supprime: true })
      .construire(),
  );

const introuvable = (id: typeof X) =>
  echec({ type: 'ElementIntrouvable', element: { type: 'OBJECTIF', id } });

describe('verifierPlacement — éléments introuvables (Q-US-023-1, étapes 1 et 2)', () => {
  it('UT-COMP-US-023-10 verifierPlacement — X inconnu ou supprimé est introuvable, avec ou sans cible ; X actif et C inconnu ou supprimé : C est introuvable, avant ERR-031', () => {
    expect(verifierPlacement(vue(), INCONNU, undefined)).toEqual(introuvable(INCONNU));
    expect(verifierPlacement(vue(), SUPPRIME, undefined)).toEqual(introuvable(SUPPRIME));
    expect(verifierPlacement(vue(), INCONNU, C)).toEqual(introuvable(INCONNU));
    expect(verifierPlacement(vue(), SUPPRIME, C)).toEqual(introuvable(SUPPRIME));

    expect(verifierPlacement(vue(), X, INCONNU)).toEqual(introuvable(INCONNU));
    expect(verifierPlacement(vue(), X, SUPPRIME)).toEqual(introuvable(SUPPRIME));
    expect(verifierPlacement(vue(), SUPPRIME, SUPPRIME)).toEqual(introuvable(SUPPRIME));
    expect(verifierPlacement(vue(), INCONNU, INCONNU)).toEqual(introuvable(INCONNU));
  });
});
