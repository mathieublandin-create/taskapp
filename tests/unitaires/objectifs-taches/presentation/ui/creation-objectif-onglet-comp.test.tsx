/**
 * ANO-003 (issue #31, « créer un objectif crée une tâche ») : l'espace des objectifs, monté comme main.tsx le fait
 * (avec la liaison des tâches), ouvre la feuille d'un objectif, jamais la saisie rapide d'une tâche. Test
 * complémentaire : le geste « Créer un objectif » de la liste n'appelle pas la création de tâche.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EspaceObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import {
  cliquerBoutonIon,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  saisir,
} from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

describe('Création d’un objectif depuis l’onglet Objectifs (ANO-003)', () => {
  it('UT-COMP-US-001-190 « Créer un objectif » ouvre la feuille « Nouvel objectif » et crée un objectif, pas une tâche', async () => {
    const banc = creerBancObjectifs();
    const creerTache = vi.spyOn(banc.services.creerTache, 'executer');
    render(
      <EspaceObjectifs
        magasin={banc.magasin}
        taches={{ magasin: creerMagasinTaches(banc.services), surOuvrirTache: vi.fn() }}
      />,
    );

    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    expect(await screen.findByRole('form', { name: 'Nouvel objectif' })).toBeTruthy();
    await saisir('Intitulé', 'Publier le guide');
    await cliquerBoutonIon('Créer l’objectif');

    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });
    await waitFor(() => {
      expect(screen.queryByRole('form')).toBeNull();
    });
    expect(creerTache).not.toHaveBeenCalled();
  });
});
