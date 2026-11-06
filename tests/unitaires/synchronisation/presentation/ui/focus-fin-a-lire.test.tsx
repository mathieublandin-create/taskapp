/**
 * DT-028 : le focus n'est jamais sur `body` après « Compris » sur la dernière entrée de « À lire » (guide §10,
 * WCAG 2.4.3) : il va à l'indicateur de synchronisation. UT-COMP-US-017-3-nn, tranche D3a.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { construireIndicateur } from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import { useFocusFinALire } from '@src/synchronisation/presentation/ui/focus-fin-a-lire';
import { IndicateurSynchronisation } from '@src/synchronisation/presentation/ui/IndicateurSynchronisation';
import { nettoyerDocument } from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

const INDICATEUR = construireIndicateur({
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
});

const Banc = ({ focusAilleurs = false }: { readonly focusAilleurs?: boolean }) => {
  const [presente, setPresente] = useState(true);
  const refIndicateur = useFocusFinALire<HTMLDivElement>(presente);
  return (
    <>
      <IndicateurSynchronisation
        vue={INDICATEUR}
        surReprendre={() => undefined}
        refElement={refIndicateur}
      />
      {focusAilleurs ? <button type="button">Autre</button> : null}
      {presente ? (
        <button
          type="button"
          onClick={() => {
            setPresente(false);
          }}
        >
          Compris
        </button>
      ) : null}
    </>
  );
};

describe('useFocusFinALire (DT-028)', () => {
  it('UT-COMP-US-017-3-15 la section disparaît avec le focus dessus : le focus va à l’indicateur, jamais sur body', async () => {
    render(<Banc />);
    await userEvent.click(screen.getByRole('button', { name: 'Compris' }));

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('status'));
    });
  });

  it('UT-COMP-US-017-3-16 un focus déjà placé ailleurs que sur body n’est pas déplacé', async () => {
    render(<Banc focusAilleurs />);
    const autre = screen.getByRole('button', { name: 'Autre' });
    screen.getByRole('button', { name: 'Compris' }).click();
    autre.focus();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Compris' })).toBeNull();
    });
    expect(document.activeElement).toBe(autre);
  });
});
