/**
 * Composants d'US-001 (ST-US-001 §14) : feuille de saisie, menu « … », ligne et anneau de progression.
 */
import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeuilleObjectif } from '@src/objectifs-taches/presentation/ui/composants/feuille-objectif';
import { LigneObjectifUi } from '@src/objectifs-taches/presentation/ui/composants/ligne-objectif';
import {
  actionsDuMenu,
  MenuObjectif,
} from '@src/objectifs-taches/presentation/ui/composants/menu-objectif';
import { ProgressionObjectif } from '@src/objectifs-taches/presentation/ui/composants/progression-objectif';
import type { IssueSaisie } from '@src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';
import { construireLigneObjectif } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { date, idObjectif } from '@tests/support/valeurs';
import {
  apresFermeture,
  champ,
  choixDuMenu,
  cliquerBoutonIon,
  nettoyerDocument,
  ouvrir,
  saisir,
} from '@tests/support/ui-objectifs';

/** Les superpositions Ionic sont téléportées dans le corps de la page : elles sont retirées aussi. */
afterEach(nettoyerDocument);

const FAITE: IssueSaisie = { type: 'FAITE' };
const proprietesFeuille = (
  surValider: () => Promise<IssueSaisie>,
  registre = { declarer: vi.fn() },
) => ({
  ouverte: true,
  mode: 'CREATION' as const,
  identifiantSaisie: 'feuille-test',
  surValider,
  surFermee: vi.fn(),
  registre,
});
/** Affiche la feuille ouverte ; `fermer` la referme proprement avant la fin du test. */
const afficherFeuille = async (
  proprietes: ReturnType<typeof proprietesFeuille>,
  complements: Partial<ComponentProps<typeof FeuilleObjectif>> = {},
) => {
  const rendu = render(<FeuilleObjectif {...proprietes} {...complements} />);
  await screen.findByRole('form');
  return {
    fermer: async () => {
      const fermee = apresFermeture('Modal');
      rendu.rerender(<FeuilleObjectif {...proprietes} {...complements} ouverte={false} />);
      await fermee;
    },
  };
};

describe('FeuilleObjectif (ECR-008 B, ECR-003 C)', () => {
  it('UT-COMP-US-001-70 la saisie en cours est déclarée au registre dès qu’une valeur diffère du départ, retirée au retour au départ et à la fermeture', async () => {
    const proprietes = proprietesFeuille(() => Promise.resolve(FAITE));
    const feuille = await afficherFeuille(proprietes, {
      mode: 'RENOMMAGE',
      initiales: { intitule: 'Guide' },
    });
    const { declarer } = proprietes.registre;
    expect(screen.getByRole('form', { name: 'Renommer l’objectif' })).toBeTruthy();
    await waitFor(() => {
      expect(declarer).toHaveBeenLastCalledWith('feuille-test', false);
    });

    await saisir('Intitulé', 'Guide 2');
    expect(declarer).toHaveBeenLastCalledWith('feuille-test', true);
    await saisir('Intitulé', 'Guide');
    expect(declarer).toHaveBeenLastCalledWith('feuille-test', false);

    await saisir('Intitulé', 'Autre');
    expect(declarer).toHaveBeenLastCalledWith('feuille-test', true);
    await feuille.fermer();
    await waitFor(() => {
      expect(declarer).toHaveBeenLastCalledWith('feuille-test', false);
    });
  });

  it('UT-COMP-US-001-71 chaque mode ne montre que ses champs : création (3), renommage (intitulé), description, délai', async () => {
    const libelles = async (mode: 'CREATION' | 'RENOMMAGE' | 'DESCRIPTION' | 'DELAI') => {
      const feuille = await afficherFeuille(
        proprietesFeuille(() => Promise.resolve(FAITE)),
        {
          mode,
        },
      );
      const champs = Array.from(
        document.querySelectorAll<HTMLElement & { label?: string }>('ion-input, ion-textarea'),
      ).map((e) => e.label);
      await feuille.fermer();
      await nettoyerDocument();
      return champs;
    };

    expect(await libelles('CREATION')).toEqual([
      'Intitulé',
      'Description (facultative)',
      'Délai (facultatif)',
    ]);
    expect(await libelles('RENOMMAGE')).toEqual(['Intitulé']);
    expect(await libelles('DESCRIPTION')).toEqual(['Description (facultative)']);
    expect(await libelles('DELAI')).toEqual(['Délai (facultatif)']);
  });

  it('UT-COMP-US-001-72 une saisie faite ferme la feuille ; un refus ou un échec d’enregistrement la laisse ouverte', async () => {
    const issues: Array<IssueSaisie> = [
      { type: 'REFUSEE', messages: [{ code: 'ERR-020', variables: {} }] },
      { type: 'ENREGISTREMENT_IMPOSSIBLE' },
      FAITE,
    ];
    const surValider = vi.fn(() => Promise.resolve(issues.shift() ?? FAITE));
    const proprietes = proprietesFeuille(surValider);
    const feuille = await afficherFeuille(proprietes);

    await cliquerBoutonIon('Créer l’objectif');
    await screen.findByRole('alert');
    await cliquerBoutonIon('Créer l’objectif');
    await waitFor(() => {
      expect(surValider).toHaveBeenCalledTimes(2);
    });
    expect(proprietes.surFermee).not.toHaveBeenCalled();

    await cliquerBoutonIon('Créer l’objectif');
    await waitFor(() => {
      expect(proprietes.surFermee).toHaveBeenCalledTimes(1);
    });
    expect(surValider).toHaveBeenCalledTimes(3);
    await feuille.fermer();
  });

  it('UT-COMP-US-001-73 « Annuler » ferme sans valider ; une validation en cours n’est pas relancée', async () => {
    let terminer: (issue: IssueSaisie) => void = () => undefined;
    const surValider = vi.fn(
      () =>
        new Promise<IssueSaisie>((resolve) => {
          terminer = resolve;
        }),
    );
    const proprietes = proprietesFeuille(surValider);
    const feuille = await afficherFeuille(proprietes);

    await cliquerBoutonIon('Créer l’objectif');
    await userEvent.type(await champ('Intitulé'), '{Enter}');
    expect(surValider).toHaveBeenCalledTimes(1);
    terminer(FAITE);
    await waitFor(() => {
      expect(proprietes.surFermee).toHaveBeenCalledTimes(1);
    });

    await cliquerBoutonIon('Annuler');
    expect(proprietes.surFermee).toHaveBeenCalledTimes(2);
    expect(surValider).toHaveBeenCalledTimes(1);
    await feuille.fermer();
  });
});

describe('MenuObjectif (ECR-003 C)', () => {
  it('UT-COMP-US-001-75 actionsDuMenu — garde les actions connues de l’écran, dans l’ordre du menu ; PLACER et CREER_SOUS_OBJECTIF viennent avec US-023', () => {
    expect(
      actionsDuMenu([
        'SUPPRIMER',
        'PLACER',
        'RENOMMER',
        'CREER_SOUS_OBJECTIF',
        'RETIRER_DELAI',
        'MODIFIER_DELAI',
      ]),
    ).toEqual(['RENOMMER', 'MODIFIER_DELAI', 'RETIRER_DELAI', 'SUPPRIMER']);
    expect(actionsDuMenu([])).toEqual([]);
  });

  it('UT-COMP-US-001-76 le menu présente les actions offertes, la suppression en rouge en dernier, et appelle l’action choisie', async () => {
    const surAction = vi.fn();
    const surFermer = vi.fn();
    await ouvrir('ActionSheet', async () => {
      render(
        <MenuObjectif
          ouvert
          actions={['RENOMMER', 'SUPPRIMER', 'PLACER']}
          surAction={surAction}
          surFermer={surFermer}
        />,
      );
      await Promise.resolve();
    });

    const boutons = (await screen.findAllByRole('button')).map((b) => b.textContent);
    expect(boutons).toEqual(['Renommer l’objectif', 'Supprimer l’objectif…', 'Annuler']);
    expect(screen.getByRole('button', { name: 'Supprimer l’objectif…' }).className).toContain(
      'action-sheet-destructive',
    );

    await choixDuMenu('Supprimer l’objectif…');
    expect(surAction).toHaveBeenCalledExactlyOnceWith('SUPPRIMER');
    await waitFor(() => {
      expect(surFermer).toHaveBeenCalled();
    });
  });
});

describe('ProgressionObjectif et LigneObjectifUi', () => {
  it('UT-COMP-US-001-77 ProgressionObjectif — barre nommée (valeurs 0 à 100) ou décor masqué ; vert seulement si atteint ; petite pour un sous-objectif', () => {
    const { container, rerender } = render(
      <ProgressionObjectif
        progression={40}
        atteint={false}
        nomAccessible="Guide, 2 tâches sur 5"
      />,
    );
    const barre = screen.getByRole('progressbar', { name: 'Guide, 2 tâches sur 5' });
    expect(barre.getAttribute('aria-valuenow')).toBe('40');
    expect(barre.dataset['atteint']).toBe('false');
    expect(barre.className).toBe('progression-objectif');
    expect(barre.style.getPropertyValue('--progression')).toBe('40%');

    rerender(<ProgressionObjectif progression={100} atteint petit />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    const decor = container.firstElementChild;
    expect(decor?.getAttribute('aria-hidden')).toBe('true');
    expect(decor?.getAttribute('data-atteint')).toBe('true');
    expect(decor?.className).toContain('progression-objectif-petit');
  });

  it('UT-COMP-US-001-78 LigneObjectifUi — l’alerte de délai du sous-objectif (ALR-007) et le retard sont écrits dans la ligne', async () => {
    const ligne = construireLigneObjectif(
      resumeObjectif({
        id: idObjectif(2),
        intitule: 'Relecture',
        parentId: idObjectif(1),
        delai: '2026-10-01',
        enRetard: true,
        alerteDelai: { parentIntitule: 'Guide' } as never,
      }),
      date('2026-10-21'),
    );
    const surOuvrir = vi.fn();
    render(
      <ul>
        <LigneObjectifUi ligne={ligne} surOuvrir={surOuvrir} />
      </ul>,
    );

    const bouton = screen.getByRole('button', { name: /^Relecture/ });
    expect(bouton.querySelector('[data-code="ALR-007"]')?.textContent).toContain('après');
    expect(bouton.querySelector('[data-code="MEN-EN-RETARD"]')?.textContent).toBe(
      'En retard · 1 oct.',
    );
    await userEvent.click(bouton);
    expect(surOuvrir).toHaveBeenCalledExactlyOnceWith(ligne);
  });
});

describe('LigneObjectifUi — point « en attente » (ST-US-017 v0.4 §4.5, DT-011, RC-R3-4)', () => {
  it('UT-US-001-37 LigneObjectifUi — MEN-ATTENTE : point data-code="MEN-ATTENTE" sans texte visible, décrit au bouton de la ligne par « Modification en attente d’envoi » ; absent sans attente', () => {
    const ligneDe = (enAttente: boolean) =>
      construireLigneObjectif(
        resumeObjectif({ id: idObjectif(1), intitule: 'Publier le guide', enAttente }),
        date('2026-10-21'),
      );
    const { container, rerender } = render(
      <ul>
        <LigneObjectifUi ligne={ligneDe(true)} surOuvrir={vi.fn()} />
      </ul>,
    );

    const point = container.querySelector<HTMLElement>('[data-code="MEN-ATTENTE"]');
    expect(point).not.toBeNull();
    expect(point?.textContent).toBe('');
    const bouton = screen.getByRole('button', {
      name: /^Publier le guide/,
      description: 'Modification en attente d’envoi',
    });
    expect(bouton.contains(point)).toBe(true);

    rerender(
      <ul>
        <LigneObjectifUi ligne={ligneDe(false)} surOuvrir={vi.fn()} />
      </ul>,
    );
    expect(container.querySelector('[data-code="MEN-ATTENTE"]')).toBeNull();
    expect(screen.getByRole('button', { name: /^Publier le guide/, description: '' })).toBeTruthy();
  });
});
