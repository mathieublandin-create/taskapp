/**
 * ST-US-017 v0.4 §4.5, §13.1 (DT-011) : composant de la section « Synchronisation » de la feuille ECR-011
 * (guide §4.26, §6.6.2 ; conventions.md §8.5 : data-etat, data-message).
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';

afterEach(cleanup);

const EN_LIGNE_AVEC_ATTENTE: ModeleVueFeuilleSynchronisation = {
  dernierEchange: {
    code: 'SYN-FEUILLE-DERNIER-ECHANGE',
    libelle: 'Dernier échange avec votre Google Drive : il y a 5 min (10 h 27).',
  },
  attente: {
    code: 'SYN-FEUILLE-EN-ATTENTE',
    n: 2,
    libelle: '2 modifications en attente',
    lignes: [
      { id: 'id-2', intitule: 'Publier le guide' },
      { id: 'id-1', intitule: 'Relire le plan' },
    ],
  },
  bouton: { code: 'SYN-FEUILLE-BOUTON', libelle: 'Synchroniser maintenant', disponible: true },
  cartes: [
    {
      message: 'ERR-016',
      titre: 'La synchronisation n’a pas abouti',
      texte: 'Vos 2 modifications sont conservées sur cet appareil.',
      action: { type: 'REESSAYER_MAINTENANT', libelle: 'Réessayer maintenant' },
    },
  ],
};

const HORS_LIGNE_SANS_ATTENTE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  horsLigne: {
    code: 'SYN-FEUILLE-HORS-LIGNE',
    libelle: 'Vos modifications sont enregistrées sur cet appareil.',
  },
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

const parEtat = (conteneur: HTMLElement, code: string): HTMLElement | null =>
  conteneur.querySelector<HTMLElement>(`[data-etat="${code}"]`);

/** Carte d'erreur exposée sous data-message ; son absence fait échouer le test. */
const carte = (conteneur: HTMLElement, message: string): HTMLElement => {
  const trouvee = conteneur.querySelector<HTMLElement>(`[data-message="${message}"]`);
  if (trouvee === null) throw new Error(`Carte ${message} absente`);
  return trouvee;
};

describe('FeuilleSynchronisation (ECR-011, section « Synchronisation »)', () => {
  it('UT-US-017-39 FeuilleSynchronisation — lignes SYN-FEUILLE-… sous data-etat, liste des modifications dans l’ordre du modèle de vue, « Synchroniser maintenant » (aria-disabled focalisable hors ligne), cartes ERR-011 et ERR-016 sous data-message avec leur action', async () => {
    const surSynchroniser = vi.fn();
    const surActionCarte = vi.fn();
    const { container, rerender } = render(
      <FeuilleSynchronisation
        vue={EN_LIGNE_AVEC_ATTENTE}
        surSynchroniser={surSynchroniser}
        surActionCarte={surActionCarte}
      />,
    );

    expect(parEtat(container, 'SYN-FEUILLE-DERNIER-ECHANGE')?.textContent).toBe(
      'Dernier échange avec votre Google Drive : il y a 5 min (10 h 27).',
    );
    expect(parEtat(container, 'SYN-FEUILLE-EN-ATTENTE')?.textContent).toBe(
      '2 modifications en attente',
    );
    const liste = screen.getByRole('list', { name: '2 modifications en attente' });
    expect(
      within(liste)
        .getAllByRole('listitem')
        .map((l) => l.textContent),
    ).toEqual(['Publier le guide', 'Relire le plan']);
    expect(parEtat(container, 'SYN-FEUILLE-RIEN-EN-ATTENTE')).toBeNull();
    expect(parEtat(container, 'SYN-FEUILLE-HORS-LIGNE')).toBeNull();

    const bouton = screen.getByRole('button', { name: 'Synchroniser maintenant' });
    expect(bouton.dataset['etat']).toBe('SYN-FEUILLE-BOUTON');
    expect(bouton.getAttribute('aria-disabled')).not.toBe('true');
    await userEvent.click(bouton);
    expect(surSynchroniser).toHaveBeenCalledTimes(1);

    const echec = carte(container, 'ERR-016');
    expect(echec.textContent).toContain('La synchronisation n’a pas abouti');
    expect(echec.textContent).toContain('Vos 2 modifications sont conservées sur cet appareil.');
    await userEvent.click(within(echec).getByRole('button', { name: 'Réessayer maintenant' }));
    expect(surActionCarte).toHaveBeenCalledExactlyOnceWith('REESSAYER_MAINTENANT');

    rerender(
      <FeuilleSynchronisation
        vue={HORS_LIGNE_SANS_ATTENTE}
        surSynchroniser={surSynchroniser}
        surActionCarte={surActionCarte}
      />,
    );
    expect(parEtat(container, 'SYN-FEUILLE-DERNIER-ECHANGE')).toBeNull();
    expect(parEtat(container, 'SYN-FEUILLE-RIEN-EN-ATTENTE')?.textContent).toBe(
      'Aucune modification en attente.',
    );
    expect(parEtat(container, 'SYN-FEUILLE-EN-ATTENTE')).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
    expect(parEtat(container, 'SYN-FEUILLE-HORS-LIGNE')?.textContent).toBe(
      'Vos modifications sont enregistrées sur cet appareil.',
    );

    // Guide §6.6.2 : hors ligne, le bouton reste focalisable (aria-disabled, jamais disabled) et son explication lui
    // est liée par aria-describedby ; l'activer ne fait rien.
    const indisponible = screen.getByRole('button', {
      name: 'Synchroniser maintenant',
      description: 'Disponible au retour du réseau.',
    });
    expect(indisponible.getAttribute('aria-disabled')).toBe('true');
    expect(indisponible.hasAttribute('disabled')).toBe(false);
    indisponible.focus();
    expect(document.activeElement).toBe(indisponible);
    await userEvent.click(indisponible);
    await userEvent.keyboard('{Enter}');
    expect(surSynchroniser).toHaveBeenCalledTimes(1);

    expect(container.querySelector('[data-message="ERR-016"]')).toBeNull();
    const plein = carte(container, 'ERR-011');
    expect(plein.textContent).toContain('Votre Google Drive est plein');
    await userEvent.click(within(plein).getByRole('button', { name: 'Ouvrir Google Drive' }));
    expect(surActionCarte).toHaveBeenLastCalledWith('OUVRIR_GOOGLE_DRIVE');
  });
});
