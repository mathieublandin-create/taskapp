/**
 * ANO-003 : sur la liste des tâches, le « + » (nom accessible) et la touche N ouvrent la saisie rapide d'une tâche,
 * sauf pendant une saisie de texte (le geste de création d'objectif reste propre à l'onglet Objectifs).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { creerBancObjectifs, nettoyerDocument, ouvrir } from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

describe('Création d’une tâche depuis l’onglet Tâches (ANO-003)', () => {
  it('UT-COMP-US-002-190 le « + » se nomme « Ajouter une tâche » et la touche N ouvre la saisie rapide, pas pendant une saisie de texte', async () => {
    const banc = creerBancObjectifs();
    const { container } = render(
      <>
        <EspaceTaches magasin={creerMagasinTaches(banc.services)} />
        <input aria-label="Saisie" />
      </>,
    );
    await waitFor(() => {
      expect(container.querySelector('ion-fab-button')?.getAttribute('aria-label')).toBe(
        'Ajouter une tâche',
      );
    });

    fireEvent.keyDown(screen.getByLabelText('Saisie'), { key: 'n' });
    expect(screen.queryByRole('form')).toBeNull();
    await ouvrir('Modal', () => {
      fireEvent.keyDown(document.body, { key: 'n' });
      return Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByRole('form', { name: 'Nouvelle tâche' })).toBeTruthy();
    });
  });
});
