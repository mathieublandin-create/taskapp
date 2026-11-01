/**
 * Modifications perdues par « repartir de zéro » dans la liste ECR-011 (ST-US-017 v0.10 §6.7 n° 10 ; RG-044 b,
 * RG-056 ; guide §6.6.9 : ALR-008 n'est affichée que sur l'appareil qui découvre le choix fait ailleurs) : seul
 * l'appareil dont la modification est perdue la détaille, sous l'intitulé conservé dans l'entrée. UT-US-017-73.
 */
import { describe, expect, it } from 'vitest';
import { detaillerValeursEcartees } from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import {
  h,
  idArbitraire,
  intituleObjectif,
  signalements,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';
import { construireModificationsNonRetenues } from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';

const O1 = idObjectif(1);

const effacee = (n: number, auteur: typeof PC): ValeurEcartee => ({
  id: idArbitraire(n),
  motif: 'DONNEES_EFFACEES',
  ecartee: intituleObjectif(O1, 'Publier le guide pratique', h(1, auteur)),
  generation: h(5, SMARTPHONE),
  intituleElement: 'Publier le guide pratique',
});

describe('Détail des modifications perdues par « repartir de zéro » (ST-US-017 v0.10 §6.7 n° 10)', () => {
  it('UT-US-017-73 S21 : sur le PC (auteur de la modification perdue), une ligne sous l’intitulé conservé dans l’entrée, l’élément n’existant plus ; ALR-008 groupe la ligne ALR-014', () => {
    const etatPc = etatLocal({ appareilId: PC });
    const [detail, ...autres] = detaillerValeursEcartees(etatPc, signalements([effacee(1, PC)]));
    expect(autres).toEqual([]);
    expect(detail).toMatchObject({
      id: idArbitraire(1),
      motif: 'DONNEES_EFFACEES',
      element: { type: 'OBJECTIF', id: O1 },
      intitule: 'Publier le guide pratique',
      information: 'INTITULE',
      valeurNonRetenue: { type: 'TEXTE', texte: 'Publier le guide pratique' },
      valeurConservee: { type: 'DONNEES_EFFACEES' },
      lue: false,
      elementExiste: false,
    });
    const vue = construireModificationsNonRetenues(detail === undefined ? [] : [detail]);
    expect(vue?.n).toBe(0);
    expect(vue?.donneesEffacees?.code).toBe('ALR-008');
    expect(vue?.donneesEffacees?.ids).toEqual([idArbitraire(1)]);
  });

  it('UT-US-017-73 S21 : sur le smartphone (qui a choisi), l’entrée reçue du PC n’est pas détaillée : ni ALR-008 ni ALR-014 ; les autres motifs restent détaillés quel que soit leur auteur', () => {
    const etatSmartphone = etatLocal({ appareilId: SMARTPHONE });
    expect(detaillerValeursEcartees(etatSmartphone, signalements([effacee(1, PC)]))).toEqual([]);
    expect(construireModificationsNonRetenues([])).toBeUndefined();
    const conflit: ValeurEcartee = {
      id: idArbitraire(2),
      motif: 'CONFLIT',
      ecartee: intituleObjectif(O1, 'A', h(1, PC)),
      gagnante: intituleObjectif(O1, 'B', h(2, PC)),
    };
    expect(
      detaillerValeursEcartees(
        etatSmartphone,
        signalements([conflit, effacee(3, PC), effacee(4, SMARTPHONE)]),
      ).map((d) => d.id),
    ).toEqual([idArbitraire(2), idArbitraire(4)]);
  });
});
