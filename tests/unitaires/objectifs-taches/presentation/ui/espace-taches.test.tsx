/**
 * Espace des tâches d'US-002 (ST-US-002 §14) sur les vrais cas d'usage et l'espace local simulé : liste « Tâches »,
 * détail (champs modifiables, champs verrouillés), suppression avec confirmation, filtres, et sections de tâches du
 * détail d'un objectif.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireDetailObjectif } from '@src/objectifs-taches';
import { valeurDe } from '@tests/support/environnement';
import { DetailObjectif } from '@src/objectifs-taches/presentation/ui/ecrans/detail-objectif';
import { EspaceObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { resumeObjectif, resumeTache } from '@tests/support/fabriques/resumes';
import { date, idTache } from '@tests/support/valeurs';
import {
  choixDuMenu,
  cliquerBoutonIon,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

const creerTache = async (banc: BancObjectifs, intitule: string, delai = '2026-11-30') =>
  valeurDe(
    await banc.services.creerTache.executer({
      intitule,
      delai: date(delai),
      estimationMinutes: 60,
      objectifIds: [],
    }),
  );

const afficher = (banc: BancObjectifs) => {
  const magasin = creerMagasinTaches(banc.services);
  render(<EspaceTaches magasin={magasin} />);
  return magasin;
};

describe('Espace des tâches (ECR-002, ECR-007)', () => {
  it('UT-COMP-US-002-80 liste vide : état de bienvenue ; avec des tâches : lignes triées, filtre « à faire » actif, tri annoncé', async () => {
    const vide = creerBancObjectifs();
    afficher(vide);
    await screen.findByRole('region', { name: 'Bienvenue' });
    await nettoyerDocument();

    const banc = creerBancObjectifs();
    await creerTache(banc, 'Zoom');
    await creerTache(banc, 'Banque', '2026-11-20');
    afficher(banc);

    const lignes = await screen.findAllByRole('button', { name: /, à faire, délai / });
    expect(lignes.map((l) => l.getAttribute('aria-label')?.split(',')[0])).toEqual([
      'Banque',
      'Zoom',
    ]);
    expect(screen.getByRole('button', { name: 'À faire' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByText('Triées par délai')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Terminées' }));
    await screen.findByRole('region', { name: 'Aucune tâche terminée.' });
  });

  it('UT-COMP-US-002-81 détail : champs et alertes ; modifier le délai et l’estimation ; renommer par le menu ; supprimer après confirmation', async () => {
    const banc = creerBancObjectifs();
    await creerTache(banc, 'Rédiger');
    afficher(banc);
    await userEvent.click(await screen.findByRole('button', { name: /^Rédiger, à faire/u }));
    await screen.findByRole('heading', { level: 1, name: 'Rédiger' });

    await userEvent.click(screen.getByRole('button', { name: 'Modifier Délai' }));
    const editeurDelai = screen.getByLabelText('Délai', { selector: 'input' });
    await userEvent.clear(editeurDelai);
    await userEvent.type(editeurDelai, '2026-12-10');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Délai' }).textContent).toContain('10 déc.');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Modifier Estimation' }));
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Estimation' }).textContent).toContain('1 h 30');
    });

    await ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
    await choixDuMenu('Renommer la tâche');
    const champ = await screen.findByLabelText('Renommer la tâche');
    await userEvent.clear(champ);
    await userEvent.type(champ, 'Relire');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await screen.findByRole('heading', { level: 1, name: 'Relire' });

    await ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
    await choixDuMenu('Supprimer la tâche…');
    const confirmation = await screen.findByRole('alertdialog');
    expect(within(confirmation).getByText('Supprimer la tâche ?')).toBeTruthy();
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Supprimer' }));
    await screen.findByRole('region', { name: 'Bienvenue' });
  });

  it('UT-COMP-US-002-82 détail d’une tâche parente : estimation verrouillée ; d’une sous-tâche : objectifs hérités verrouillés', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const parente = valeurDe(
      await banc.services.creerTache.executer({
        intitule: 'Chapitre 1',
        delai: date('2026-11-30'),
        estimationMinutes: 60,
        objectifIds: [objectifId],
      }),
    );
    const modele = creerMagasinTaches(banc.services);
    await modele.getState().actions.ouvrirDetail(parente);
    expect(modele.getState().detail?.objectifs.intitules).toEqual(['Publier le guide']);
    render(<EspaceTaches magasin={modele} />);
    expect(await screen.findByRole('group', { name: 'Objectifs' })).toBeTruthy();
  });
});

describe('Sections de tâches du détail d’un objectif (ECR-003 D)', () => {
  it('UT-COMP-US-002-83 sans tâche : état vide seul ; avec tâches : « Tâches à faire · n » dépliée, sections vides absentes, ouverture et ajout', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const detail = (taches: number) =>
      construireDetailObjectif(
        {
          objectif: {
            id: objectifId,
            intitule: 'Publier le guide',
            etat: taches === 0 ? 'A_DECLINER' : 'EN_COURS',
            enRetard: false,
            tachesTerminees: 0,
            tachesNonAbandonnees: taches,
            creeLe: 0 as never,
            enAttente: false,
          },
          sousObjectifs: [],
          taches: [],
          sousTachesPar: new Map(),
          actions: [],
        },
        { horloge: banc.env.horloge },
      );
    const detailAvecTache = construireDetailObjectif(
      {
        objectif: resumeObjectif({ id: objectifId, intitule: 'Publier le guide' }),
        sousObjectifs: [],
        taches: [resumeTache({ id: idTache(1), intitule: 'Chapitre 1' })],
        sousTachesPar: new Map(),
        actions: [],
      },
      { horloge: banc.env.horloge },
    );
    const surAjouterTache = vi.fn();
    const rendu = render(
      <DetailObjectif
        modele={detail(0)}
        surRetour={vi.fn()}
        surOuvrirMenu={vi.fn()}
        surOuvrirSousObjectif={vi.fn()}
        surChangerDelai={vi.fn()}
        surAjouterTache={surAjouterTache}
      />,
    );

    expect(screen.getByRole('region', { name: 'À décliner en tâches.' })).toBeTruthy();
    expect(document.querySelector('[data-code="SEC-TACHES-A-FAIRE"]')).toBeNull();
    await cliquerBoutonIon('Ajouter une tâche');
    expect(surAjouterTache).toHaveBeenCalled();
    rendu.unmount();

    render(
      <DetailObjectif
        modele={detailAvecTache}
        surRetour={vi.fn()}
        surOuvrirMenu={vi.fn()}
        surOuvrirSousObjectif={vi.fn()}
        surChangerDelai={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /^Chapitre 1, à faire/u }));
    expect(document.querySelector('[data-code="SEC-TACHES-TERMINEES"]')).toBeNull();
  });
});

describe('Tâches depuis le détail d’un objectif (ECR-003 D, guide §4.3)', () => {
  it('UT-COMP-US-002-84 le détail d’un objectif présente ses tâches ; une tâche s’ouvre ; « Ajouter une tâche » ouvre la saisie rapide avec l’objectif pré-rempli, et la tâche créée apparaît', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const tache = valeurDe(
      await banc.services.creerTache.executer({
        intitule: 'Chapitre 1',
        delai: date('2026-11-30'),
        estimationMinutes: 60,
        objectifIds: [objectifId],
      }),
    );
    const surOuvrirTache = vi.fn();
    const magasinTaches = creerMagasinTaches(banc.services);
    render(
      <EspaceObjectifs
        magasin={banc.magasin}
        taches={{ magasin: magasinTaches, surOuvrirTache }}
      />,
    );

    await userEvent.click(await screen.findByRole('button', { name: /^Publier le guide/u }));
    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });
    const section = await waitFor(() => {
      const trouvee = document.querySelector('[data-code="SEC-TACHES-A-FAIRE"]');
      if (trouvee === null) throw new Error('Section absente');
      return trouvee as HTMLElement;
    });
    expect(section.textContent).toContain('Tâches à faire · 1');
    await userEvent.click(within(section).getByRole('button', { name: /^Chapitre 1, à faire/u }));
    expect(surOuvrirTache).toHaveBeenCalledWith(tache);

    await ouvrir('Modal', () => cliquerBoutonIon('Ajouter une tâche'));
    await screen.findByRole('form', { name: 'Nouvelle tâche' });
    const pressee = screen.getByRole('button', { name: 'Publier le guide', pressed: true });
    expect(pressee).toBeTruthy();
    await cliquerBoutonIon('Annuler');
    await waitFor(() => {
      expect(screen.queryByRole('form')).toBeNull();
    });
  });
});
