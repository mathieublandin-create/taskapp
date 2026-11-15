/**
 * ST-CORR-E13B-LOT-001 §5.2 (T5b), Q-CORR-STE-6 : focus de fin de « À lire » avec la feuille « Compte et
 * synchronisation ». Après le dernier « Compris », le focus va sur le titre de la feuille si elle est ouverte, sur le
 * bouton d'ouverture si elle est fermée. UT-COMP-CORR-01, rang 14.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BoutonFeuille,
  FeuilleCompteEtSynchronisation,
} from '@src/synchronisation/presentation/ui/FeuilleCompteEtSynchronisation';
import { useFocusFinALire } from '@src/synchronisation/presentation/ui/focus-fin-a-lire';
import { LIBELLES_FEUILLE } from '@src/synchronisation/presentation/ui/libelles-feuille';
import { surPresentationModale } from '@tests/support/ui-objectifs';

afterEach(cleanup);

/** Montage de `EspaceApplication` (`main.tsx`) réduit au focus : mêmes références, même cible calculée. */
const Banc = ({ ouverteAuDepart }: { readonly ouverteAuDepart: boolean }) => {
  const [ouverte, setOuverte] = useState(ouverteAuDepart);
  const [presente, setPresente] = useState(true);
  const refBouton = useRef<HTMLButtonElement>(null);
  const refTitre = useRef<HTMLHeadingElement>(null);
  useFocusFinALire(presente, () => (ouverte ? refTitre.current : refBouton.current));
  const compris = presente ? (
    <button
      type="button"
      onClick={() => {
        setPresente(false);
      }}
    >
      Compris
    </button>
  ) : null;
  return (
    <>
      <BoutonFeuille
        ouverte={ouverte}
        surOuvrir={() => {
          setOuverte(true);
        }}
        refElement={refBouton}
      />
      {ouverteAuDepart ? null : compris}
      <FeuilleCompteEtSynchronisation
        ouverte={ouverte}
        surFermee={() => {
          setOuverte(false);
        }}
        aLire={ouverteAuDepart ? compris : undefined}
        refBoutonOuverture={refBouton}
        refTitre={refTitre}
      />
    </>
  );
};

describe('Focus de fin de « À lire » avec la feuille (Q-CORR-STE-6)', () => {
  it('UT-COMP-CORR-01 feuille ouverte : le focus va sur le titre de la feuille ; feuille fermée : sur le bouton d’ouverture', async () => {
    const presentee = surPresentationModale();
    render(<Banc ouverteAuDepart />);
    await presentee;
    await userEvent.click(screen.getByRole('button', { name: 'Compris' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('heading', { name: LIBELLES_FEUILLE.titre }),
      );
    });
    cleanup();

    render(<Banc ouverteAuDepart={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Compris' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: LIBELLES_FEUILLE.ouvrir }),
      );
    });
  });
});
