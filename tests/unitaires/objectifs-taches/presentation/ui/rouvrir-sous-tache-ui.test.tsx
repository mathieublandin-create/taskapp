/**
 * Case « Rouvrir » d'une sous-tâche terminée dans le détail de sa tâche parente (DT-030, reliquat ; ST-US-024 v0.7
 * §4.5, §6.8 ; guide §6.6.4 `ETA-TACHE-CASE` variante `rouvrir`, §6.6.7 `CNF-ROUVRIR-SOUS-TACHE` ; maquette ECR-007 A).
 * UT-US-024-25 à 27 (rang 11, tranche D4) ; UT-COMP-US-017-4-82 (focus sans focalisation au pointeur).
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { construireDetailTache } from '@src/objectifs-taches';
import { SectionSousTaches } from '@src/objectifs-taches/presentation/ui/composants/section-sous-taches';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { valeurDe } from '@tests/support/environnement';
import {
  creerBancObjectifs,
  nettoyerDocument,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';
import { date } from '@tests/support/valeurs';

afterEach(nettoyerDocument);

const creerTache = async (banc: BancObjectifs, intitule: string): Promise<IdTache> =>
  valeurDe(
    await banc.services.creerTache.executer({
      intitule,
      delai: date('2026-11-30'),
      estimationMinutes: 180,
      objectifIds: [],
    }),
  );

const creerSousTache = async (banc: BancObjectifs, parente: IdTache, intitule: string) =>
  valeurDe(
    await banc.services.creerSousTache.executer({
      tacheParenteId: parente,
      intitule,
      delai: date('2026-11-20'),
      estimationMinutes: 60,
    }),
  );

const terminer = async (banc: BancObjectifs, id: IdTache) => {
  valeurDe(await banc.services.terminerTache.executer({ tacheId: id }));
};

/** Tâche « Chapitre 1 » : « Section A » à faire, « Section B » terminée, « Section C » abandonnée. */
const preparer = async () => {
  const banc = creerBancObjectifs();
  const parente = await creerTache(banc, 'Chapitre 1');
  const a = await creerSousTache(banc, parente, 'Section A');
  const b = await creerSousTache(banc, parente, 'Section B');
  const c = await creerSousTache(banc, parente, 'Section C');
  await terminer(banc, b);
  valeurDe(await banc.services.abandonnerTache.executer({ tacheId: c }));
  return { banc, parente, a, b, c };
};

const sectionDe = async (banc: BancObjectifs, parente: IdTache) => {
  const detail = valeurDe(await banc.services.consulterDetailTache.executer(parente));
  const modele = construireDetailTache(detail, { horloge: banc.env.horloge });
  if (modele.sousTaches === undefined) throw new Error('Section absente');
  return modele.sousTaches;
};

describe('Modèle de vue : action de la case d’une sous-tâche (ST-US-024 v0.7 §4.5)', () => {
  it('UT-US-024-25 à faire : TERMINER (« Terminer « … » ») ; terminée : ROUVRIR (« Rouvrir « … » ») ; abandonnée : aucune action', async () => {
    const { banc, parente } = await preparer();
    const lignes = (await sectionDe(banc, parente)).lignes;
    const parIntitule = new Map(lignes.map((l) => [l.intitule, l.caseTerminer]));

    expect(parIntitule.get('Section A')).toEqual({
      nomAccessible: 'Terminer « Section A »',
      action: 'TERMINER',
    });
    expect(parIntitule.get('Section B')).toEqual({
      nomAccessible: 'Rouvrir « Section B »',
      action: 'ROUVRIR',
    });
    expect(parIntitule.get('Section C')?.action).toBeUndefined();
  });
});

describe('SectionSousTaches : case « Rouvrir » (ECR-007 A)', () => {
  it('UT-US-024-26 la sous-tâche terminée porte une case cochée « Rouvrir « … » », active seulement si l’écran sait rouvrir, qui transmet son identifiant ; la sous-tâche abandonnée n’a pas de case', async () => {
    const { banc, parente, b } = await preparer();
    const section = await sectionDe(banc, parente);
    const surRouvrir = vi.fn();
    const { rerender } = render(<SectionSousTaches section={section} surOuvrir={vi.fn()} />);

    const inactive = screen.getByRole('checkbox', { name: 'Rouvrir « Section B »' });
    expect((inactive as HTMLInputElement).checked).toBe(true);
    expect((inactive as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole('checkbox', { name: /Section C/u })).toBeNull();

    rerender(<SectionSousTaches section={section} surOuvrir={vi.fn()} surRouvrir={surRouvrir} />);
    const active = screen.getByRole('checkbox', { name: 'Rouvrir « Section B »' });
    expect((active as HTMLInputElement).disabled).toBe(false);
    await userEvent.click(active);
    expect(surRouvrir).toHaveBeenCalledWith(b);
  });
});

describe('Détail d’une tâche parente : rouvrir une sous-tâche (ECR-007 A, CNF-ROUVRIR-SOUS-TACHE)', () => {
  it('UT-US-024-27 tâche parente à faire : la sous-tâche est rouverte sans confirmation, sa case redevient « Terminer »', async () => {
    const { banc, parente, b } = await preparer();
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Rouvrir « Section B »' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Terminer « Section B »' })).toBeTruthy();
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    const detail = valeurDe(await banc.services.consulterDetailTache.executer(b));
    expect(detail.tache.cycleDeVie.etat).toBe('A_FAIRE');
  });

  it('UT-US-024-27 tâche parente terminée : CNF-ROUVRIR-SOUS-TACHE (« Rouvrir aussi « Chapitre 1 » ? ») ; « Annuler » ne change rien et rend le focus à la case ; « Rouvrir les deux » rouvre la sous-tâche et la tâche parente', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const a = await creerSousTache(banc, parente, 'Section A');
    await terminer(banc, a);
    await terminer(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);
    const nom = 'Rouvrir « Section A »';

    await userEvent.click(screen.getByRole('checkbox', { name: nom }));
    const boite = await screen.findByRole('alertdialog');
    expect(boite.getAttribute('data-code')).toBe('CNF-ROUVRIR-SOUS-TACHE');
    expect(within(boite).getByRole('heading').textContent).toBe(
      'Rouvrir aussi « Chapitre 1 »\u00a0?',
    );
    await userEvent.click(within(boite).getByRole('button', { name: 'Annuler' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: nom }));
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(a)).tache.cycleDeVie.etat,
    ).toBe('TERMINEE');

    await userEvent.click(screen.getByRole('checkbox', { name: nom }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Rouvrir les deux',
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(a)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });

  it('UT-COMP-US-017-4-82 « Annuler » rend le focus à la case même si elle n’avait pas le focus au changement (Safari, pointeur)', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const a = await creerSousTache(banc, parente, 'Section A');
    await terminer(banc, a);
    await terminer(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);
    const nom = 'Rouvrir \u00ab\u00a0Section A\u00a0\u00bb';
    const caseARouvrir = screen.getByRole('checkbox', { name: nom });
    expect(document.activeElement).not.toBe(caseARouvrir);

    fireEvent.click(caseARouvrir);
    const boite = await screen.findByRole('alertdialog');
    await userEvent.click(within(boite).getByRole('button', { name: 'Annuler' }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: nom }));
  });
});
