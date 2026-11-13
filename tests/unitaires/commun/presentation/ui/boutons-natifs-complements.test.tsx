/**
 * Compléments de l'E13 des tranches T1 à T3 (revue-code-LOT-001-corr-e13b-t1t3.md, RC-CORR-1 et RC-CORR-2) : attribution
 * des variantes de `data-variante` (ST-CORR-E13B-LOT-001 §4.2) pour les composants que UT-DT-014-01 à 05 ne couvraient
 * pas (choix de restauration, modifications non retenues, action du bandeau en `SYN-SESSION`). Une mutation de ces
 * attributs laissait la suite verte. Garde-fous : verts dès leur écriture. Rang 14 (rangs-tests.json).
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import type {
  ModeleVueChoixRestauration,
  TextesChoixRestauration,
} from '@src/synchronisation/presentation/modeles-de-vue/choix-restauration';
import type { ModeleVueModificationsNonRetenues } from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';
import { Bandeau } from '@src/synchronisation/presentation/ui/Bandeau';
import {
  FeuilleChoixRestauration,
  type ProprietesChoixRestauration,
} from '@src/synchronisation/presentation/ui/ChoixRestauration';
import { ModificationsNonRetenues } from '@src/synchronisation/presentation/ui/ModificationsNonRetenues';
import { date, idTache } from '@tests/support/valeurs';
import { nettoyerDocument } from '@tests/support/ui-objectifs';

afterEach(async () => {
  cleanup();
  await nettoyerDocument();
});

/** Classe et variante d'un bouton : `undefined` pour une variante absente (secondaire par défaut). */
const style = (bouton: HTMLElement) => ({
  natif: bouton.classList.contains('bouton-natif'),
  variante: bouton.dataset['variante'],
});

const VUE_CHOIX: ModeleVueChoixRestauration = {
  code: 'ERR-012',
  titre: 'Titre d’essai',
  texte: 'Texte d’essai',
  propose: true,
  restaurer: { libelle: 'Restaurer d’essai', disponible: true },
  repartirDeZero: { disponible: true },
  deciderPlusTard: { disponible: true },
};

const TEXTES_CHOIX: TextesChoixRestauration = {
  titreFeuille: 'Feuille d’essai',
  fermer: 'Fermer d’essai',
  phraseRestaurer: 'Phrase restaurer',
  restaurationEnCours: 'En cours d’essai',
  mentionDemandee: 'Mention demandée',
  annulerDemande: 'Annuler la demande d’essai',
  repartirDeZero: 'Repartir d’essai',
  phraseRepartirDeZero: 'Phrase repartir',
  repartirDeZeroIndisponible: 'Indisponible d’essai',
  deciderPlusTard: 'Plus tard d’essai',
  phraseDeciderPlusTard: 'Phrase plus tard',
};

const proprietesChoix = (vue: ModeleVueChoixRestauration): ProprietesChoixRestauration => ({
  vue,
  textes: TEXTES_CHOIX,
  surRestaurer: vi.fn(() => Promise.resolve()),
  surAnnulerDemande: vi.fn(),
  evaluerRepartirDeZero: vi.fn(() => Promise.reject(new Error('non utilisé'))),
  surRepartirDeZero: vi.fn(() => Promise.resolve()),
  surDeciderPlusTard: vi.fn(),
});

const ID = (texte: string) => texte as IdValeurEcartee;

const VUE_NON_RETENUES: ModeleVueModificationsNonRetenues = {
  code: 'SYN-FEUILLE-A-LIRE',
  n: 1,
  libelle: '1 information à lire',
  libelleCompris: 'Compris',
  lignes: [
    {
      id: ID('v1'),
      code: 'ALR-009',
      element: 'Rédiger le plan',
      information: 'INTITULE',
      valeurNonRetenue: { type: 'TEXTE', texte: 'A' },
      valeurConservee: { type: 'TEXTE', texte: 'Rédiger le plan' },
      titre: 'Intitulé de « Rédiger le plan »',
      voir: { type: 'TACHE', id: idTache(1) },
    },
  ],
  donneesEffacees: {
    code: 'ALR-008',
    titre: 'Vos données ont été effacées',
    nomAccessibleCompris: 'Compris : vos données ont été effacées',
    action: 'Compris',
    ids: [ID('v8')],
    lignes: [
      {
        id: ID('v8'),
        element: 'Annexe',
        information: 'DELAI',
        valeurNonRetenue: { type: 'DATE', date: date('2026-12-01') },
      },
    ],
  },
};

describe('DT-014 : attribution des variantes, compléments de l’E13 (ST-CORR §4.2)', () => {
  it('UT-DT-014-07 choix de restauration : « Restaurer » principal, « Repartir de zéro » danger, « Décider plus tard » et « Fermer » tertiaires', async () => {
    render(<FeuilleChoixRestauration {...proprietesChoix(VUE_CHOIX)} />);
    const bouton = (nom: string) => screen.findByRole('button', { name: nom });
    expect(style(await bouton('Restaurer d’essai'))).toEqual({
      natif: true,
      variante: 'principal',
    });
    expect(style(await bouton('Repartir d’essai'))).toEqual({ natif: true, variante: 'danger' });
    expect(style(await bouton('Plus tard d’essai'))).toEqual({
      natif: true,
      variante: 'tertiaire',
    });
    expect(style(await bouton('Fermer d’essai'))).toEqual({ natif: true, variante: 'tertiaire' });
  });

  it('UT-DT-014-08 choix de restauration, demande en attente : « Annuler la demande » est secondaire (sans attribut)', async () => {
    render(
      <FeuilleChoixRestauration
        {...proprietesChoix({ ...VUE_CHOIX, restaurationEnAttente: true as const })}
      />,
    );
    expect(
      style(await screen.findByRole('button', { name: 'Annuler la demande d’essai' })),
    ).toEqual({ natif: true, variante: undefined });
  });

  it('UT-DT-014-09 modifications non retenues : les quatre boutons (Voir, Compris de la ligne, bascule des données effacées, Compris des données effacées) sont tertiaires', () => {
    const { container } = render(
      <ModificationsNonRetenues
        vue={VUE_NON_RETENUES}
        contexte={{ appareil: 'PC', aujourdhui: date('2026-11-01') }}
        surCompris={vi.fn()}
        surVoir={vi.fn()}
      />,
    );
    const boutons = Array.from(container.querySelectorAll<HTMLElement>('button'));
    expect(boutons).toHaveLength(4);
    expect(boutons.map(style)).toEqual(
      Array.from({ length: 4 }, () => ({ natif: true, variante: 'tertiaire' })),
    );
  });

  it('UT-DT-014-10 bandeau BAN-RAPPEL-24H (variante session) : « Reprendre la synchronisation » est principal, comme toute action de bandeau (accord de l’E13, ST-CORR v0.2 §4.2)', () => {
    render(
      <Bandeau
        appareil="PC"
        vue={{
          code: 'BAN-RAPPEL-24H',
          variante: 'session',
          action: 'REPRENDRE_LA_SYNCHRONISATION',
          n: 1,
          fermable: true,
          bloquant: false,
          message: 'ALR-002',
        }}
        surAction={vi.fn()}
        surMasquer={vi.fn()}
      />,
    );
    expect(style(screen.getByRole('button', { name: 'Reprendre la synchronisation' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
  });
});
