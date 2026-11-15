/**
 * ST-US-018 v0.4 §6.3, §13 (rang 12, tranche D1) : rendu de la ligne `SYN-FEUILLE-STOCKAGE` et de la carte `ALR-015`
 * (guide v0.2.12 §6.6.2, §6.6.9 ; RL-LOT-001-S7 : ligne en texte simple, carte `role="status"`, non fermable).
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';

afterEach(cleanup);

const BASE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  bouton: { code: 'SYN-FEUILLE-BOUTON', libelle: 'Synchroniser maintenant', disponible: true },
  cartes: [],
};

const PROTEGE: ModeleVueFeuilleSynchronisation = {
  ...BASE,
  stockage: {
    code: 'SYN-FEUILLE-STOCKAGE',
    etat: 'PROTEGE',
    libelle: 'Stockage de cet appareil : protégé',
  },
};

const NON_PROTEGE: ModeleVueFeuilleSynchronisation = {
  ...BASE,
  stockage: {
    code: 'SYN-FEUILLE-STOCKAGE',
    etat: 'NON-PROTEGE',
    libelle: 'Stockage de cet appareil : non protégé',
  },
  alerteStockage: {
    code: 'ALR-015',
    titre: 'Vos données ne sont pas protégées',
    texte: 'Vos données ne sont pas protégées contre un nettoyage du navigateur.',
    role: 'status',
    fermable: false,
  },
};

const rendre = (vue: ModeleVueFeuilleSynchronisation) =>
  render(
    <FeuilleSynchronisation
      vue={vue}
      surSynchroniser={() => undefined}
      surActionCarte={() => undefined}
    />,
  );

const SUIT = Node.DOCUMENT_POSITION_FOLLOWING;

describe('FeuilleSynchronisation — stockage de cet appareil (ST-US-018 §6.3)', () => {
  it('UT-US-018-10 protégé — ligne en texte simple data-etat="PROTEGE", sans contrôle ; aucune carte ALR-015', () => {
    const { container } = rendre(PROTEGE);

    const ligne = screen.getByText('Stockage de cet appareil : protégé');
    expect(ligne.getAttribute('data-etat')).toBe('PROTEGE');
    expect(ligne.tagName).toBe('P');
    expect(within(ligne).queryAllByRole('button')).toHaveLength(0);
    expect(within(ligne).queryAllByRole('link')).toHaveLength(0);
    expect(container.querySelector('[data-message="ALR-015"]')).toBeNull();
  });

  it('UT-US-018-10 non protégé — ligne data-etat="NON-PROTEGE" et carte ALR-015 role="status", niveau Attention, sans aucun bouton', () => {
    const { container } = rendre(NON_PROTEGE);

    const ligne = screen.getByText('Stockage de cet appareil : non protégé');
    expect(ligne.getAttribute('data-etat')).toBe('NON-PROTEGE');
    const carte = container.querySelector('[data-message="ALR-015"]');
    if (!(carte instanceof HTMLElement)) throw new Error('Carte ALR-015 absente');
    expect(carte.getAttribute('role')).toBe('status');
    expect(carte.getAttribute('data-niveau')).toBe('attention');
    const dansLaCarte = within(carte);
    expect(dansLaCarte.getByText('Vos données ne sont pas protégées')).toBeDefined();
    expect(
      dansLaCarte.getByText('Vos données ne sont pas protégées contre un nettoyage du navigateur.'),
    ).toBeDefined();
    expect(dansLaCarte.queryAllByRole('button')).toHaveLength(0);
  });

  it('UT-US-018-10 pied de feuille — bouton « Synchroniser maintenant », puis carte ALR-015, puis ligne « Stockage » en dernier', () => {
    const { container } = rendre(NON_PROTEGE);

    const bouton = screen.getByRole('button', { name: 'Synchroniser maintenant' });
    const carte = container.querySelector('[data-message="ALR-015"]');
    if (!(carte instanceof HTMLElement)) throw new Error('Carte ALR-015 absente');
    const ligne = screen.getByText('Stockage de cet appareil : non protégé');
    expect(bouton.compareDocumentPosition(carte) & SUIT).toBe(SUIT);
    expect(carte.compareDocumentPosition(ligne) & SUIT).toBe(SUIT);
    const derniers = Array.from(container.querySelectorAll('[data-etat], [data-message]'));
    expect(derniers.at(-1)).toBe(ligne);
  });

  it('UT-US-018-10 persistance non lue — ni ligne « Stockage », ni carte ALR-015', () => {
    const { container } = rendre(BASE);

    expect(container.querySelector('[data-etat="PROTEGE"], [data-etat="NON-PROTEGE"]')).toBeNull();
    expect(container.querySelector('[data-message="ALR-015"]')).toBeNull();
  });
});
