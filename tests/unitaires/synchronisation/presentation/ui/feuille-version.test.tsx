/**
 * ST-US-018 v0.4 §6.1 n° 5 (rang 12, tranche D2), tests complémentaires de Benjamin : rendu de l'invite `ALR-016`
 * (guide v0.2.24 §6.6.15) : carte `status` d'information, non fermable, en tête de la feuille ; action « Mettre à
 * jour » (clic ou Entrée, sans confirmation) et retours d'`ERR-013`. UT-COMP-US-018-26 à 29.
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IssueMiseAJour } from '@src/synchronisation/application/ports/mise-a-jour-application';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';

afterEach(cleanup);

const AVEC_INVITE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  bouton: { code: 'SYN-FEUILLE-BOUTON', libelle: 'Synchroniser maintenant', disponible: true },
  cartes: [],
  alerteVersion: {
    code: 'ALR-016',
    titre: 'Une nouvelle version est disponible',
    texte: 'Mettez à jour quand vous le souhaitez. Vos modifications sont conservées.',
    role: 'status',
    fermable: false,
    action: { type: 'METTRE_A_JOUR', libelle: 'Mettre à jour' },
  },
};

const rendre = (miseAJour?: IssueMiseAJour) => {
  const surActionCarte = vi.fn();
  const rendu = render(
    <FeuilleSynchronisation
      vue={AVEC_INVITE}
      surSynchroniser={() => undefined}
      surActionCarte={surActionCarte}
      miseAJour={miseAJour}
    />,
  );
  const carte = rendu.container.querySelector('[data-message="ALR-016"]');
  if (!(carte instanceof HTMLElement)) throw new Error('Carte ALR-016 absente');
  return { carte, surActionCarte, container: rendu.container };
};

describe('FeuilleSynchronisation — invite « nouvelle version » (ST-US-018 §6.1 n° 5)', () => {
  it('UT-COMP-US-018-26 carte ALR-016 — role="status", niveau information, titre et texte du catalogue, un seul bouton (non fermable)', () => {
    const { carte } = rendre();

    expect(carte.getAttribute('role')).toBe('status');
    expect(carte.getAttribute('data-niveau')).toBe('information');
    const dansLaCarte = within(carte);
    expect(dansLaCarte.getByText('Une nouvelle version est disponible')).toBeDefined();
    expect(
      dansLaCarte.getByText(
        'Mettez à jour quand vous le souhaitez. Vos modifications sont conservées.',
      ),
    ).toBeDefined();
    const boutons = dansLaCarte.getAllByRole('button');
    expect(boutons.map((b) => b.textContent)).toEqual(['Mettre à jour']);
  });

  it('UT-COMP-US-018-26 emplacement — en tête de la feuille, avant la première ligne et le bouton « Synchroniser maintenant »', () => {
    const { carte, container } = rendre();

    const suit = Node.DOCUMENT_POSITION_FOLLOWING;
    const premiereLigne = container.querySelector('[data-etat]');
    const synchroniser = screen.getByRole('button', { name: 'Synchroniser maintenant' });
    expect(container.querySelector('section')?.firstElementChild).toBe(carte);
    expect(carte.compareDocumentPosition(synchroniser) & suit).toBe(suit);
    expect(
      premiereLigne !== null && (carte.compareDocumentPosition(premiereLigne) & suit) === suit,
    ).toBe(true);
  });

  it('UT-COMP-US-018-27 geste — un clic sur « Mettre à jour » demande la mise à jour, une fois, sans confirmation', async () => {
    const { carte, surActionCarte } = rendre();

    await userEvent.setup().click(within(carte).getByRole('button', { name: 'Mettre à jour' }));

    expect(surActionCarte).toHaveBeenCalledTimes(1);
    expect(surActionCarte).toHaveBeenCalledWith('METTRE_A_JOUR');
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });

  it('UT-COMP-US-018-27 geste — Entrée sur « Mettre à jour » (atteint au clavier, premier élément focalisable) demande la mise à jour, une fois', async () => {
    const { carte, surActionCarte } = rendre();
    const clavier = userEvent.setup();

    await clavier.tab();
    expect(document.activeElement).toBe(
      within(carte).getByRole('button', { name: 'Mettre à jour' }),
    );
    await clavier.keyboard('{Enter}');

    expect(surActionCarte).toHaveBeenCalledTimes(1);
    expect(surActionCarte).toHaveBeenCalledWith('METTRE_A_JOUR');
  });

  it('UT-COMP-US-018-28 sans issue — la ligne de retour (role="status") est présente et vide, l’action n’est pas désactivée', () => {
    const { carte } = rendre();

    const retour = within(carte).getAllByRole('status')[0];
    expect(retour?.textContent).toBe('');
    expect(within(carte).getByRole('button').hasAttribute('aria-disabled')).toBe(false);
  });

  it.each([
    ['AUCUNE_VERSION', 'Aucune version plus récente n’est disponible.'],
    ['ECHEC', 'Vérification impossible pour le moment. Réessayez dans quelques instants.'],
  ] as const)(
    'UT-COMP-US-018-28 retour %s — texte d’ERR-013 sous le texte de la carte, action toujours active',
    async (issue, texte) => {
      const { carte, surActionCarte } = rendre(issue);

      expect(within(carte).getByText(texte).getAttribute('role')).toBe('status');
      const bouton = within(carte).getByRole('button', { name: 'Mettre à jour' });
      expect(bouton.hasAttribute('aria-disabled')).toBe(false);
      await userEvent.setup().click(bouton);
      expect(surActionCarte).toHaveBeenCalledTimes(1);
    },
  );

  it('UT-COMP-US-018-29 retour RECHARGEMENT_LANCE — texte d’ERR-013 et action désactivée (aria-disabled, focalisable), sans effet au clic', async () => {
    const { carte, surActionCarte } = rendre('RECHARGEMENT_LANCE');

    const retour = within(carte).getByText(
      'L’application va se recharger. Vos modifications sont conservées.',
    );
    expect(retour.getAttribute('role')).toBe('status');
    const bouton = within(carte).getByRole('button', { name: 'Mettre à jour' });
    expect(bouton.getAttribute('aria-disabled')).toBe('true');
    await userEvent.setup().click(bouton);
    expect(surActionCarte).not.toHaveBeenCalled();
  });
});
