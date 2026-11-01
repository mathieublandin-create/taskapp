/**
 * Section « À lire » de la feuille ECR-011 : DiscardedItem (guide §4.24, §6.6.2, §6.6.9, §10 « Listes de modifications
 * non retenues » ; conventions.md §8.5 : data-etat, data-message, data-variante ; ST-US-017 v0.5 §6.6 n° 13). UT-US-017-59.
 */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import type { ModeleVueModificationsNonRetenues } from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';
import { ModificationsNonRetenues } from '@src/synchronisation/presentation/ui/ModificationsNonRetenues';
import { date, idTache } from '@tests/support/valeurs';

afterEach(cleanup);

const T1 = idTache(1);
/** Identifiants de signalement fixes, lisibles dans les assertions. */
const idv = (texte: string) => texte as IdValeurEcartee;
const VUE: ModeleVueModificationsNonRetenues = {
  code: 'SYN-FEUILLE-A-LIRE',
  n: 2,
  libelle: '2 informations à lire',
  libelleCompris: 'Compris',
  lignes: [
    {
      id: idv('v1'),
      code: 'ALR-009',
      element: 'Rédiger le plan',
      information: 'INTITULE',
      valeurNonRetenue: { type: 'TEXTE', texte: 'A' },
      valeurConservee: { type: 'TEXTE', texte: 'Rédiger le plan' },
      titre: 'Intitulé de « Rédiger le plan »',
      voir: { type: 'TACHE', id: T1 },
    },
    {
      id: idv('v2'),
      code: 'ALR-010',
      variante: 'tache',
      element: 'Chapitre 1',
      information: 'DELAI',
      valeurNonRetenue: { type: 'DATE', date: date('2026-12-10') },
      valeurConservee: { type: 'TACHE_SUPPRIMEE' },
      titre: 'Tâche « Chapitre 1 » supprimée',
    },
  ],
  donneesEffacees: {
    code: 'ALR-008',
    titre: 'Vos données ont été effacées',
    nomAccessibleCompris: 'Compris : vos données ont été effacées',
    action: 'Compris',
    ids: [idv('v8'), idv('v9')],
    lignes: [
      {
        id: idv('v8'),
        element: 'Annexe',
        information: 'DELAI',
        valeurNonRetenue: { type: 'DATE', date: date('2026-12-01') },
      },
      {
        id: idv('v9'),
        element: 'Annexe',
        information: 'INTITULE',
        valeurNonRetenue: { type: 'TEXTE', texte: 'Annexe B' },
      },
    ],
  },
};

const parMessage = (conteneur: HTMLElement, message: string): ReadonlyArray<HTMLElement> =>
  Array.from(conteneur.querySelectorAll<HTMLElement>(`[data-message="${message}"]`));

describe('ModificationsNonRetenues (ECR-011, section « À lire »)', () => {
  it('UT-US-017-59 titre SYN-FEUILLE-A-LIRE, liste nommée, une ligne data-message par information, « Compris » nommé par la ligne, « Voir » si l’élément existe, ALR-014 groupées sous ALR-008 avec un seul « Compris »', async () => {
    const surCompris = vi.fn();
    const surVoir = vi.fn();
    const { container } = render(
      <ModificationsNonRetenues
        vue={VUE}
        contexte={{ appareil: 'PC', aujourdhui: date('2026-11-01') }}
        surCompris={surCompris}
        surVoir={surVoir}
      />,
    );

    expect(container.querySelector('[data-etat="SYN-FEUILLE-A-LIRE"]')?.textContent).toBe(
      '2 informations à lire',
    );
    const liste = screen.getByRole('list', { name: '2 informations à lire' });
    const lignes = within(liste).getAllByRole('listitem');
    expect(lignes.map((l) => l.dataset['message'])).toEqual(['ALR-009', 'ALR-010']);
    expect(lignes[1]?.dataset['variante']).toBe('tache');
    expect(lignes[0]?.dataset['variante']).toBeUndefined();
    expect(lignes[0]?.textContent).toContain('Intitulé de « Rédiger le plan »');

    const [premiere, seconde] = lignes;
    if (premiere === undefined || seconde === undefined) throw new Error('lignes absentes');
    await userEvent.click(
      within(premiere).getByRole('button', { name: 'Compris : intitulé de « Rédiger le plan »' }),
    );
    expect(surCompris).toHaveBeenCalledExactlyOnceWith(['v1']);
    const voir = within(premiere)
      .getAllByRole('button')
      .filter((b) => !(b.getAttribute('aria-label') ?? '').startsWith('Compris'));
    expect(voir).toHaveLength(1);
    for (const bouton of voir) await userEvent.click(bouton);
    expect(surVoir).toHaveBeenCalledExactlyOnceWith({ type: 'TACHE', id: T1 });
    expect(within(seconde).getAllByRole('button')).toHaveLength(1);

    const [carte] = parMessage(container, 'ALR-008');
    if (carte === undefined) throw new Error('carte ALR-008 absente');
    expect(parMessage(carte, 'ALR-014')).toHaveLength(2);
    surCompris.mockClear();
    // Le repli des lignes (Disclosure, guide §6.6.9) peut ajouter un bouton ; un seul « Compris ».
    const boutons = within(carte).getAllByRole('button', { name: /^Compris/ });
    expect(boutons).toHaveLength(1);
    for (const bouton of boutons) await userEvent.click(bouton);
    expect(surCompris).toHaveBeenCalledExactlyOnceWith(['v8', 'v9']);
  });
});

describe('ModificationsNonRetenues — textes et repli (Q-ST017-STE-2)', () => {
  const CONTEXTE = { appareil: 'PC', aujourdhui: date('2026-11-01') } as const;

  it('UT-COMP-US-017-2-50 chaque ligne montre son titre et son texte ; « Voir » porte le nom accessible du guide ; la carte ALR-008 nomme l’autre appareil', () => {
    const { container } = render(
      <ModificationsNonRetenues
        vue={VUE}
        contexte={CONTEXTE}
        surCompris={vi.fn()}
        surVoir={vi.fn()}
      />,
    );

    const [premiere] = parMessage(container, 'ALR-009');
    expect(premiere?.textContent).toContain('n’a pas été retenue');
    expect(
      screen.getByRole('button', { name: 'Voir la tâche : intitulé de « Rédiger le plan »' }),
    ).toBeTruthy();
    const [carte] = parMessage(container, 'ALR-008');
    expect(carte?.textContent).toContain('sur votre smartphone');
  });

  it('UT-COMP-US-017-2-51 la Disclosure SEC-MODIFS-EFFACEES est repliée par défaut (aria-expanded) et garde les lignes ALR-014 dans le document', async () => {
    render(
      <ModificationsNonRetenues
        vue={VUE}
        contexte={CONTEXTE}
        surCompris={vi.fn()}
        surVoir={vi.fn()}
      />,
    );
    const repli = screen.getByRole('button', { name: 'Voir les 2 modifications' });
    const liste = repli.nextElementSibling;

    expect(repli.getAttribute('aria-expanded')).toBe('false');
    expect(liste?.hasAttribute('hidden')).toBe(true);

    await userEvent.click(repli);
    expect(repli.getAttribute('aria-expanded')).toBe('true');
    expect(liste?.hasAttribute('hidden')).toBe(false);
    expect(repli.textContent).toBe('Voir les 2 modifications');
  });
});

describe('ModificationsNonRetenues — placement de l’objectif supprimé (RC-US-017-3) et focus (RC-US-017-8)', () => {
  const CONTEXTE = { appareil: 'PC', aujourdhui: date('2026-11-01') } as const;

  it('UT-COMP-US-017-2-62 la ligne ALR-010 d’un objectif supprimé puis rendu principal se rend sans exception, avec le texte générique', () => {
    const vue: ModeleVueModificationsNonRetenues = {
      code: 'SYN-FEUILLE-A-LIRE',
      n: 1,
      libelle: '1 information à lire',
      libelleCompris: 'Compris',
      lignes: [
        {
          id: idv('v3'),
          code: 'ALR-010',
          element: 'Version imprimable',
          information: 'PARENT',
          valeurNonRetenue: { type: 'PRINCIPAL' },
          valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
          titre: 'Objectif « Version imprimable » supprimé',
        },
      ],
    };

    const { container } = render(
      <ModificationsNonRetenues
        vue={vue}
        contexte={CONTEXTE}
        surCompris={vi.fn()}
        surVoir={vi.fn()}
      />,
    );

    const [ligne] = parMessage(container, 'ALR-010');
    if (ligne === undefined) throw new Error('ligne ALR-010 absente');
    expect(ligne.dataset['variante']).toBeUndefined();
    expect(ligne.textContent).toContain(
      'Votre modification de son placement n’a pas été conservée.',
    );
    expect(within(ligne).getAllByRole('button')).toHaveLength(1);
  });

  /** Retire de la vue les entrées marquées comme lues, comme le fait le contrôleur après l’écriture. */
  const AvecRetrait = ({ echoue = false }: { readonly echoue?: boolean }) => {
    const [lues, setLues] = useState<ReadonlyArray<string>>([]);
    const { donneesEffacees, ...sansCarte } = VUE;
    const vue: ModeleVueModificationsNonRetenues = {
      ...sansCarte,
      lignes: VUE.lignes.filter((l) => !lues.includes(l.id)),
      ...(lues.includes(idv('v8')) || donneesEffacees === undefined ? {} : { donneesEffacees }),
    };
    return (
      <ModificationsNonRetenues
        vue={vue}
        contexte={CONTEXTE}
        surCompris={(ids) => {
          if (!echoue) setLues([...lues, ...ids]);
        }}
        surVoir={vi.fn()}
      />
    );
  };

  const comprisDe = (nom: RegExp) => screen.getByRole('button', { name: nom });

  it('UT-COMP-US-017-2-63 après « Compris », le focus va sur le « Compris » de l’entrée suivante, sinon de la précédente', async () => {
    render(<AvecRetrait />);

    await userEvent.click(comprisDe(/^Compris : intitulé de « Rédiger le plan »/));
    await waitFor(() => {
      expect(document.activeElement).toBe(comprisDe(/^Compris : tâche « Chapitre 1 »/));
    });

    await userEvent.click(comprisDe(/^Compris : tâche « Chapitre 1 »/));
    await waitFor(() => {
      expect(document.activeElement).toBe(comprisDe(/^Compris : vos données ont été effacées/));
    });

    await userEvent.click(comprisDe(/^Compris : vos données ont été effacées/));
    expect(screen.queryAllByRole('button', { name: /^Compris/ })).toHaveLength(0);
  });

  it('UT-COMP-US-017-2-64 la dernière entrée retirée : le focus va sur la précédente ; une entrée qui reste (échec) garde le focus', async () => {
    const { unmount } = render(<AvecRetrait />);
    await userEvent.click(comprisDe(/^Compris : tâche « Chapitre 1 »/));
    await userEvent.click(comprisDe(/^Compris : vos données ont été effacées/));
    await waitFor(() => {
      expect(document.activeElement).toBe(comprisDe(/^Compris : intitulé de « Rédiger le plan »/));
    });
    unmount();

    render(<AvecRetrait echoue />);
    const bouton = comprisDe(/^Compris : intitulé de « Rédiger le plan »/);
    await userEvent.click(bouton);
    expect(document.activeElement).toBe(bouton);
  });
});
