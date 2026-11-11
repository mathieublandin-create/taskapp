/**
 * ST-US-031 v0.4 §6.3, §15 tranche D1 (guide v0.2.25 §6.6.9) : ligne `SYN-FEUILLE-AUTRE-ONGLET` du composant
 * `FeuilleSynchronisation` : texte du modèle de vue, `role="status"`, entre « Synchroniser maintenant » (et son
 * explication) et les cartes, sans toast ni action ; disparaît sans message quand l'onglet n'est plus suiveur.
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';

afterEach(cleanup);

const TEXTE = 'Texte du modèle de vue, distinct du catalogue : le composant ne le calcule pas.';
const BASE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  horsLigne: { code: 'SYN-FEUILLE-HORS-LIGNE', libelle: 'Enregistré sur cet appareil.' },
  bouton: {
    code: 'SYN-FEUILLE-BOUTON',
    libelle: 'Synchroniser maintenant',
    disponible: false,
    explication: 'Disponible au retour du réseau.',
  },
  cartes: [
    {
      message: 'ERR-011',
      titre: 'Votre Google Drive est plein',
      texte: 'Elles sont conservées sur cet appareil.',
      action: { type: 'OUVRIR_GOOGLE_DRIVE', libelle: 'Ouvrir Google Drive' },
    },
  ],
};
const AVEC_LIGNE: ModeleVueFeuilleSynchronisation = {
  ...BASE,
  autreOnglet: { code: 'SYN-FEUILLE-AUTRE-ONGLET', libelle: TEXTE },
};

const rendre = (vue: ModeleVueFeuilleSynchronisation) =>
  render(
    <FeuilleSynchronisation
      vue={vue}
      surSynchroniser={() => undefined}
      surActionCarte={() => undefined}
    />,
  );
const ligne = (c: HTMLElement) =>
  c.querySelector<HTMLElement>('[data-etat="SYN-FEUILLE-AUTRE-ONGLET"]');

describe('FeuilleSynchronisation — autre onglet (ST-US-031 §6.3)', () => {
  it('UT-COMP-US-031-20 ligne présente — texte exact du modèle de vue, role="status", texte simple sans bouton ni lien ni icône, aucun toast', () => {
    const { container } = rendre(AVEC_LIGNE);

    const p = ligne(container);
    expect(p?.tagName).toBe('P');
    expect(p?.textContent).toBe(TEXTE);
    expect(p?.getAttribute('role')).toBe('status');
    expect(screen.getByRole('status')).toBe(p);
    expect(p?.children).toHaveLength(0);
    expect(container.querySelectorAll('[data-etat="SYN-FEUILLE-AUTRE-ONGLET"]')).toHaveLength(1);
    expect(document.querySelector('ion-toast')).toBeNull();
  });

  it('UT-COMP-US-031-21 ordre — après le bouton et son explication, avant les cartes ; le bouton et les cartes restent inchangés', () => {
    const { container } = rendre(AVEC_LIGNE);

    const ordre = Array.from(
      container.querySelectorAll(
        'button[data-etat="SYN-FEUILLE-BOUTON"], #feuille-synchronisation-explication, [data-etat="SYN-FEUILLE-AUTRE-ONGLET"], [data-message="ERR-011"]',
      ),
      (n) => n.getAttribute('data-etat') ?? n.getAttribute('data-message') ?? n.id,
    );
    expect(ordre).toEqual([
      'SYN-FEUILLE-BOUTON',
      'feuille-synchronisation-explication',
      'SYN-FEUILLE-AUTRE-ONGLET',
      'ERR-011',
    ]);
    const carte = container.querySelector('[data-message="ERR-011"]');
    expect(carte?.textContent).toContain('Votre Google Drive est plein');
  });

  it('UT-COMP-US-031-22 modèle sans autreOnglet — aucune ligne ; elle disparaît quand l’onglet cesse d’être suiveur, sans message ni toast', () => {
    const { container, rerender } = rendre(AVEC_LIGNE);
    expect(ligne(container)).not.toBeNull();

    rerender(
      <FeuilleSynchronisation
        vue={BASE}
        surSynchroniser={() => undefined}
        surActionCarte={() => undefined}
      />,
    );

    expect(ligne(container)).toBeNull();
    expect(screen.queryByText(TEXTE)).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.querySelector('ion-toast')).toBeNull();
    expect(screen.getByRole('button', { name: 'Synchroniser maintenant' })).toBeTruthy();
  });
});
