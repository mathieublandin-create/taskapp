import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Bandeau } from '@src/synchronisation/presentation/ui/Bandeau';
import { IndicateurSynchronisation } from '@src/synchronisation/presentation/ui/IndicateurSynchronisation';

afterEach(cleanup);

describe('Indicateur et bandeau (guide §6.6.2, §6.6.3)', () => {
  it('UT-COMP-US-022-85 IndicateurSynchronisation — role="status", data-etat, data-a-lire ; SYN-SESSION porte le bouton « Reprendre la synchronisation »', async () => {
    const surReprendre = vi.fn();
    const { rerender } = render(
      <IndicateurSynchronisation
        vue={{ code: 'SYN-HORS-LIGNE', n: 2, aLire: 1 }}
        surReprendre={surReprendre}
      />,
    );
    const statut = screen.getByRole('status');
    expect(statut.dataset['etat']).toBe('SYN-HORS-LIGNE');
    expect(statut.dataset['aLire']).toBe('1');
    expect(statut.textContent).toBe('Hors ligne · 2 en attente');
    expect(screen.queryByRole('button')).toBeNull();

    rerender(
      <IndicateurSynchronisation
        vue={{
          code: 'SYN-SESSION',
          action: 'REPRENDRE_LA_SYNCHRONISATION',
          messageFeuille: 'ERR-015',
        }}
        surReprendre={surReprendre}
      />,
    );
    expect(screen.getByRole('status').dataset['aLire']).toBeUndefined();
    await userEvent.click(screen.getByRole('button', { name: 'Reprendre la synchronisation' }));
    expect(surReprendre).toHaveBeenCalledTimes(1);
    rerender(
      <IndicateurSynchronisation vue={{ code: 'SYN-ATTENTE', n: 1 }} surReprendre={vi.fn()} />,
    );
    expect(screen.getByRole('status').textContent).toBe('1 modification à envoyer');
  });

  it('UT-COMP-US-022-86 Bandeau — data-etat, data-variante ; « Se reconnecter » ; rappel fermable par « Masquer le rappel »', async () => {
    const surAction = vi.fn();
    const surMasquer = vi.fn();
    const { rerender } = render(
      <Bandeau
        appareil="smartphone"
        vue={{
          code: 'BAN-ACCES-GOOGLE',
          variante: '24H',
          n: 3,
          action: 'SE_RECONNECTER',
          fermable: false,
          bloquant: false,
          message: 'ERR-010',
        }}
        surAction={surAction}
        surMasquer={surMasquer}
      />,
    );
    const bandeau = screen.getByRole('complementary', { name: 'Accès Google perdu' });
    expect(bandeau.dataset['etat']).toBe('BAN-ACCES-GOOGLE');
    expect(bandeau.dataset['variante']).toBe('24H');
    expect(screen.queryByRole('button', { name: 'Masquer le rappel' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Se reconnecter' }));
    expect(surAction).toHaveBeenCalledWith('SE_RECONNECTER');

    rerender(
      <Bandeau
        appareil="smartphone"
        vue={{ code: 'BAN-RAPPEL-24H', n: 1, fermable: true, bloquant: false, message: 'ALR-002' }}
        surAction={surAction}
        surMasquer={surMasquer}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Masquer le rappel' }));
    expect(surMasquer).toHaveBeenCalledTimes(1);
  });
});
