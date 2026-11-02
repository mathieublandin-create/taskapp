/**
 * Interface de la carte d'incohérence d'ECR-007 H (ST-US-024 v0.5 §6.6, §14 ; DT-026, rang 10) : carte en tête du
 * détail, actions principale et tertiaires, abandon de la sous-tâche par l'espace des tâches. Tests de composant de
 * Benjamin (UT-COMP-US-024-11 à 15).
 */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import type { DetailTache as DonneesDetail } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { construireDetailTache } from '@src/objectifs-taches';
import { DetailTache } from '@src/objectifs-taches/presentation/ui/ecrans/detail-tache';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import type {
  IssueSaisie,
  IssueTache,
} from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { ecritureCycleDeVie } from '@tests/support/modifications';
import {
  creerBancObjectifs,
  nettoyerDocument,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';
import { date, idObjectif, idTache } from '@tests/support/valeurs';

afterEach(nettoyerDocument);

const horloge = horlogeSur('2026-10-25T10:00:00.000Z');
const SECTION_A = { id: idTache(2), intitule: 'Section A' };
const SECTION_B = { id: idTache(3), intitule: 'Section B' };
const FAITE: IssueTache = { type: 'FAITE' };

const modeleIncoherent = (
  etat: 'TERMINEE' | 'ABANDONNEE',
  sousTachesAFaire: ReadonlyArray<{ readonly id: IdTache; readonly intitule: string }>,
) => {
  const detail: DonneesDetail = {
    tache: resumeTache({
      id: idTache(1),
      intitule: 'Chapitre 1',
      cycleDeVie: etat === 'TERMINEE' ? terminee('2026-10-20') : abandonnee('2026-10-20', 'op:0'),
      objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
      incoherence: { etatParent: etat, sousTachesAFaire },
    }),
    sousTaches: [],
    sousTachesAFaire: sousTachesAFaire.length,
    actions: [],
  };
  return construireDetailTache(detail, { horloge });
};

type Commandes = {
  readonly surRouvrir: () => Promise<IssueSaisie>;
  readonly surReprendre: () => Promise<IssueSaisie>;
  readonly surTerminerSousTache: (id: IdTache) => void;
  readonly surAbandonnerSousTache: (id: IdTache) => Promise<IssueSaisie>;
};

const commandesEspionnees = (): Commandes => ({
  surRouvrir: vi.fn(() => Promise.resolve(FAITE)),
  surReprendre: vi.fn(() => Promise.resolve(FAITE)),
  surTerminerSousTache: vi.fn(),
  surAbandonnerSousTache: vi.fn(() => Promise.resolve(FAITE)),
});

const afficher = (
  modele: ReturnType<typeof modeleIncoherent>,
  commandes: Partial<Commandes> = commandesEspionnees(),
): void => {
  render(
    <DetailTache
      modele={modele}
      objectifs={[]}
      surRetour={vi.fn()}
      surRenommer={vi.fn()}
      surModifierDelai={vi.fn()}
      surModifierEstimation={vi.fn()}
      surBasculerObjectif={vi.fn()}
      surSupprimer={vi.fn()}
      surOuvrirSousTache={vi.fn()}
      surAjouterSousTache={vi.fn()}
      surAbandonner={vi.fn()}
      {...commandes}
    />,
  );
};

describe('Carte d’incohérence du détail (ST-US-024 v0.5 §6.6, DT-026)', () => {
  it('UT-COMP-US-024-11 la carte ALR-003 (puis ALR-004) est rendue avant les champs avec son titre et son texte ; data-variante seulement pour une variante ; l’action de fin du bas disparaît ; aucune carte sans incohérence', () => {
    const commandes = commandesEspionnees();
    afficher(modeleIncoherent('TERMINEE', [SECTION_A]), commandes);
    const carte = document.querySelector<HTMLElement>('[data-message="ALR-003"]');
    expect(carte).not.toBeNull();
    expect(carte?.hasAttribute('data-variante')).toBe(false);
    expect(carte?.getAttribute('role')).toBeNull();
    expect(within(carte as HTMLElement).getByRole('heading').textContent).toBe(
      'Incohérence avec une sous-tâche',
    );
    expect(carte?.textContent).toContain(
      'Cette tâche est terminée, mais 1 sous-tâche est à faire.',
    );
    const champ = screen.getByText('Délai');
    expect(
      (carte as HTMLElement).compareDocumentPosition(champ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Rouvrir la tâche' })).toHaveLength(1);
    expect(carte?.contains(screen.getByRole('button', { name: 'Rouvrir la tâche' }))).toBe(true);
  });

  it('UT-COMP-US-024-11 variantes d’ALR-003 et ALR-004 ; sans incohérence, ni carte ni sous-tâche visée', () => {
    afficher(modeleIncoherent('ABANDONNEE', [SECTION_A]));
    expect(document.querySelector('[data-message="ALR-004"]')).not.toBeNull();
    expect(document.querySelector('[data-variante]')).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Reprendre la tâche' })).toHaveLength(1);
    cleanup();

    const { incoherence: _carte, ...sansIncoherence } = modeleIncoherent('TERMINEE', [SECTION_A]);
    afficher(sansIncoherence);
    expect(document.querySelector('[data-message]')).toBeNull();
  });

  it('UT-COMP-US-024-12 « Rouvrir la tâche » appelle surRouvrir, « Reprendre la tâche » surReprendre ; un refus rendu par l’issue est affiché sans déplacer le focus', async () => {
    const commandes = commandesEspionnees();
    afficher(modeleIncoherent('TERMINEE', [SECTION_A]), commandes);
    await userEvent.click(screen.getByRole('button', { name: 'Rouvrir la tâche' }));
    await waitFor(() => {
      expect(commandes.surRouvrir).toHaveBeenCalledTimes(1);
    });
    expect(commandes.surReprendre).not.toHaveBeenCalled();
    cleanup();

    const refus: IssueSaisie = {
      type: 'REFUSEE',
      messages: [{ code: 'ERR-035', variables: { n: 1 } }],
    };
    const reprendre = vi.fn(() => Promise.resolve(refus));
    afficher(modeleIncoherent('ABANDONNEE', [SECTION_A]), {
      ...commandes,
      surReprendre: reprendre,
    });
    const bouton = screen.getByRole('button', { name: 'Reprendre la tâche' });
    bouton.focus();
    await userEvent.click(bouton);
    await waitFor(() => {
      expect(reprendre).toHaveBeenCalledTimes(1);
    });
    expect((await screen.findByRole('alert')).getAttribute('data-message')).toBe('ERR-035');
    expect(document.activeElement).toBe(bouton);
    expect(commandes.surRouvrir).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-024-13 une seule sous-tâche à faire : « Terminer » et « Abandonner la sous-tâche » visent son identifiant, après l’action principale, avec le nom accessible « … : « Section A » »', async () => {
    const commandes = commandesEspionnees();
    afficher(modeleIncoherent('TERMINEE', [SECTION_A]), commandes);
    const carte = document.querySelector<HTMLElement>('[data-message="ALR-003"]') as HTMLElement;
    const boutons = within(carte).getAllByRole('button');
    expect(boutons.map((b) => b.getAttribute('data-action'))).toEqual([
      'ROUVRIR',
      'TERMINER_SOUS_TACHE',
      'ABANDONNER_SOUS_TACHE',
    ]);
    const terminer = within(carte).getByRole('button', {
      name: /^Terminer la sous-tâche\s*: «\s*Section A\s*»$/u,
    });
    const abandonner = within(carte).getByRole('button', {
      name: /^Abandonner la sous-tâche\s*: «\s*Section A\s*»$/u,
    });
    await userEvent.click(terminer);
    expect(commandes.surTerminerSousTache).toHaveBeenCalledWith(SECTION_A.id);
    await userEvent.click(abandonner);
    await waitFor(() => {
      expect(commandes.surAbandonnerSousTache).toHaveBeenCalledWith(SECTION_A.id);
    });
  });

  it('UT-COMP-US-024-14 deux sous-tâches à faire ou plus : l’action principale seule ; commande absente : bouton correspondant non rendu', () => {
    afficher(modeleIncoherent('TERMINEE', [SECTION_A, SECTION_B]));
    const carte = document.querySelector<HTMLElement>('[data-message="ALR-003"]') as HTMLElement;
    expect(
      within(carte)
        .getAllByRole('button')
        .map((b) => b.getAttribute('data-action')),
    ).toEqual(['ROUVRIR']);
    cleanup();

    const { surTerminerSousTache: _t, ...sansTerminer } = commandesEspionnees();
    afficher(modeleIncoherent('TERMINEE', [SECTION_A]), sansTerminer);
    const unique = document.querySelector<HTMLElement>('[data-message="ALR-003"]') as HTMLElement;
    expect(
      within(unique)
        .getAllByRole('button')
        .map((b) => b.getAttribute('data-action')),
    ).toEqual(['ROUVRIR', 'ABANDONNER_SOUS_TACHE']);
  });
});

const creerTache = async (banc: BancObjectifs, intitule: string): Promise<IdTache> =>
  valeurDe(
    await banc.services.creerTache.executer({
      intitule,
      delai: date('2026-11-30'),
      estimationMinutes: 180,
      objectifIds: [],
    }),
  );

describe('Espace des tâches — carte d’incohérence (ST-US-024 v0.5 §6.6 n° 2, 4)', () => {
  it('UT-COMP-US-024-15 « Abandonner la sous-tâche » demande la confirmation habituelle ; la confirmer abandonne la sous-tâche et la carte disparaît au recalcul', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const sousTache = valeurDe(
      await banc.services.creerSousTache.executer({
        tacheParenteId: parente,
        intitule: 'Section A',
        delai: date('2026-11-20'),
        estimationMinutes: 60,
      }),
    );
    valeurDe(
      await appliquerModifications(banc.env.service, (_, c) => [
        ecritureCycleDeVie(parente, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
      ]),
    );
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);

    await userEvent.click(
      await screen.findByRole('button', { name: /^Abandonner la sous-tâche/u }),
    );

    const boite = await screen.findByRole('alertdialog');
    await userEvent.click(within(boite).getByRole('button', { name: 'Abandonner' }));
    await waitFor(() => {
      expect(document.querySelector('[data-message="ALR-003"]')).toBeNull();
    });
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(sousTache)).tache.cycleDeVie.etat,
    ).toBe('ABANDONNEE');
    expect(screen.getByRole('button', { name: 'Rouvrir la tâche' })).toBeTruthy();
  });
});
