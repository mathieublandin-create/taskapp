/**
 * Textes du choix de restauration (guide §6.6.4, §6.6.7, §6.6.9) : mention de la demande selon le réseau,
 * confirmation de « Repartir de zéro », titre d'`ALR-014` sans élément. Tests complémentaires de la tranche D3a.
 */
import { describe, expect, it } from 'vitest';
import {
  construireConfirmationRepartirDeZero,
  construireTextesChoixRestauration,
} from '@src/synchronisation/presentation/modeles-de-vue/choix-restauration';
import { titreDonneeEffacee } from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';

describe('textes du choix de restauration', () => {
  it('UT-COMP-US-017-3-17 la mention de la demande dit « au retour du réseau » hors ligne, « à la prochaine synchronisation » en ligne', () => {
    expect(construireTextesChoixRestauration('COUPE').mentionDemandee).toBe(
      'Restauration demandée. Elle sera faite au retour du réseau.',
    );
    expect(construireTextesChoixRestauration('CONNECTE').mentionDemandee).toBe(
      'Restauration demandée. Elle sera faite à la prochaine synchronisation.',
    );
    expect(construireTextesChoixRestauration('CONNECTE').deciderPlusTard).toBe('Décider plus tard');
  });

  it('UT-COMP-US-017-3-18 la confirmation n’annonce les modifications perdues qu’à partir de 1, avec l’accord', () => {
    expect(construireConfirmationRepartirDeZero(0).texte).not.toContain('modification');
    expect(construireConfirmationRepartirDeZero(1).texte).toContain(
      '1 modification faite ici et pas encore enregistrée sera perdue.',
    );
    expect(construireConfirmationRepartirDeZero(3).texte).toContain(
      '3 modifications faites ici et pas encore enregistrées seront perdues.',
    );
  });

  it('UT-COMP-US-017-3-19 ALR-014 : titre « {Information} » seul quand l’intitulé de l’élément est inconnu', () => {
    const ligne = {
      id: 'x' as never,
      information: 'DELAI' as const,
      valeurNonRetenue: { type: 'AUCUNE' as const },
    };
    expect(titreDonneeEffacee({ ...ligne, element: '' })).toBe('Délai');
    expect(titreDonneeEffacee({ ...ligne, element: 'Annexe' })).toMatch(/^Délai de «\sAnnexe\s»$/u);
  });
});
