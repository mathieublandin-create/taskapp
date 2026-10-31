/**
 * Interface d'US-024 (ST-US-024 §14, rang 6) : variante « sous-tâche » de la saisie rapide (ECR-007 I), section
 * « Sous-tâches » du détail (ECR-007 A), confirmation CNF-AJOUT-SOUS-TACHE-TERMINEE et refus du magasin.
 * Tests complémentaires de Benjamin (UT-COMP-US-024-nn).
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireDetailTache, construireFormulaireSousTache } from '@src/objectifs-taches';
import { SaisieRapide } from '@src/objectifs-taches/presentation/ui/composants/saisie-rapide';
import { SectionSousTaches } from '@src/objectifs-taches/presentation/ui/composants/section-sous-taches';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import {
  creerMagasinTaches,
  type IssueSaisie,
  type IssueTache,
} from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { ecritureCycleDeVie } from '@tests/support/modifications';
import {
  apresFermeture,
  cliquerBoutonIon,
  creerBancEcritureInterruptible,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  renseigner,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';
import { date, idTache } from '@tests/support/valeurs';

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

const terminerLaTache = async (banc: BancObjectifs, id: IdTache): Promise<void> => {
  valeurDe(
    await appliquerModifications(banc.env.service, (_, c) => [
      ecritureCycleDeVie(id, { etat: 'TERMINEE', dateFin: c.jour, instantFin: c.instant }),
    ]),
  );
};

const detailDe = async (banc: BancObjectifs, id: IdTache) =>
  valeurDe(await banc.services.consulterDetailTache.executer(id));

const SAISIE_COMPLETE = { intitule: 'Section A', delai: date('2026-11-20'), estimationMinutes: 60 };

describe('Magasin des tâches — création d’une sous-tâche (ST-US-024 §6.1)', () => {
  it('UT-COMP-US-024-01 sans confirmation : la sous-tâche est créée, le détail de la tâche parente est recalculé avec sa section et son formulaire', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    expect(magasin.getState().formulaireSousTache?.information?.code).toBe('ALR-012');

    const issue = await magasin.getState().actions.creerSousTache(parente, SAISIE_COMPLETE);

    expect(issue.type).toBe('FAITE');
    const { detail, formulaireSousTache } = magasin.getState();
    expect(detail?.sousTaches?.lignes.map((l) => l.intitule)).toEqual(['Section A']);
    expect(formulaireSousTache?.information).toBeUndefined();
  });

  it('UT-COMP-US-024-02 une tâche parente terminée demande confirmation avant toute écriture ; confirmer crée la sous-tâche et rouvre la tâche', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    await terminerLaTache(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);

    const issue = await magasin.getState().actions.creerSousTache(parente, SAISIE_COMPLETE);

    if (issue.type !== 'CONFIRMATION_REQUISE') throw new Error(`Issue inattendue : ${issue.type}`);
    expect(issue.confirmation.code).toBe('CNF-AJOUT-SOUS-TACHE-TERMINEE');
    expect((await detailDe(banc, parente)).sousTaches).toEqual([]);
    expect((await issue.confirmer()).type).toBe('FAITE');
    expect((await detailDe(banc, parente)).tache.cycleDeVie.etat).toBe('A_FAIRE');
    expect(magasin.getState().detail?.sousTaches?.compteur.libelle).toBe('0 / 1');
  });

  it('UT-COMP-US-024-03 une saisie incomplète est refusée avec ses messages (ERR-021, ERR-022) ; une tâche parente introuvable est refusée sans message', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const { actions } = creerMagasinTaches(banc.services).getState();

    const incomplete = await actions.creerSousTache(parente, { intitule: 'Section A' });
    const introuvable = await actions.creerSousTache(idTache(99), SAISIE_COMPLETE);

    expect(incomplete).toEqual({
      type: 'REFUSEE',
      messages: [
        { code: 'ERR-021', variables: {} },
        { code: 'ERR-022', variables: {} },
      ],
    });
    expect(introuvable).toEqual({ type: 'REFUSEE', messages: [] });
  });

  it('UT-COMP-US-024-04 un espace local inaccessible : enregistrement impossible, toast ERR-014', async () => {
    const banc = creerBancEcritureInterruptible();
    const parente = await creerTache(banc, 'Chapitre 1');
    const magasin = creerMagasinTaches(banc.services);
    banc.interrompre();

    const issue = await magasin.getState().actions.creerSousTache(parente, SAISIE_COMPLETE);

    expect(issue).toEqual({ type: 'ENREGISTREMENT_IMPOSSIBLE' });
    expect(magasin.getState().erreurEnregistrement).toBe(true);
  });
});

describe('SaisieRapide — variante sous-tâche (ECR-007 I)', () => {
  const afficher = async (
    surValider: () => Promise<IssueSaisie>,
    banc: BancObjectifs,
    parente: IdTache,
    surFermee = vi.fn(),
  ) => {
    const proprietes = {
      formulaire: construireFormulaireSousTache(await detailDe(banc, parente)),
      objectifs: [],
      surValider,
      surFermee,
      registre: { declarer: vi.fn() },
    };
    const rendu = render(<SaisieRapide ouverte {...proprietes} />);
    await screen.findByRole('form', { name: 'Nouvelle sous-tâche' });
    return async () => {
      const fermee = apresFermeture('Modal');
      rendu.rerender(<SaisieRapide ouverte={false} {...proprietes} />);
      await fermee;
    };
  };

  it('UT-COMP-US-024-05 tâche parente nommée, ALR-012 annoncée, aucun objectif à choisir ; un refus sans champ (ERR-032) est affiché en alerte, sans déplacer le focus', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const surValider = vi.fn((): Promise<IssueSaisie> =>
      Promise.resolve({ type: 'REFUSEE', messages: [{ code: 'ERR-032', variables: {} }] }),
    );
    const fermer = await afficher(surValider, banc, parente);

    expect(screen.getByText(/^de «\s*Chapitre 1\s*»$/u)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe(
      'L’estimation de la tâche (3 h) sera remplacée par la somme de ses sous-tâches.',
    );
    expect(screen.queryByRole('button', { name: 'Écrire' })).toBeNull();
    await renseigner('Intitulé', 'Section A');
    await cliquerBoutonIon('Ajouter');

    const alerte = await screen.findByRole('alert');
    expect(alerte.getAttribute('data-message')).toBe('ERR-032');
    expect(alerte.textContent).toContain('Cette tâche est abandonnée');
    await fermer();
  });

  const afficherAvecConfirmation = async (confirmer: () => Promise<IssueTache>) => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    await terminerLaTache(banc, parente);
    const surFermee = vi.fn();
    const surValider = (): Promise<IssueSaisie> =>
      Promise.resolve({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          code: 'CNF-AJOUT-SOUS-TACHE-TERMINEE',
          variables: { element: 'Chapitre 1' },
          titre: 'Rouvrir « Chapitre 1 » pour y ajouter une sous-tâche ?',
          actionLibelle: 'Rouvrir et ajouter',
        },
        confirmer,
      });
    const fermer = await afficher(surValider, banc, parente, surFermee);
    return { fermer, surFermee };
  };

  it('UT-COMP-US-024-06 la confirmation s’affiche sans perdre la saisie : « Annuler » la ferme, « Rouvrir et ajouter » exécute la commande puis vide la feuille', async () => {
    const confirmer = vi.fn((): Promise<IssueTache> => Promise.resolve({ type: 'FAITE' }));
    const { fermer } = await afficherAvecConfirmation(confirmer);

    await renseigner('Intitulé', 'Section A');
    await cliquerBoutonIon('Ajouter');
    const boite = await screen.findByRole('alertdialog');
    expect(within(boite).getByRole('heading').textContent).toContain('Rouvrir');
    await userEvent.click(within(boite).getByRole('button', { name: 'Annuler' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.querySelector<HTMLIonInputElement>('ion-input')?.value).toBe('Section A');

    await cliquerBoutonIon('Ajouter');
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Rouvrir et ajouter',
      }),
    );
    await waitFor(() => {
      expect(screen.getByText('Ajoutée à Tâches')).toBeTruthy();
    });
    expect(confirmer).toHaveBeenCalledTimes(1);
    expect(document.querySelector<HTMLIonInputElement>('ion-input')?.value).toBe('');
    await fermer();
  });

  it('UT-COMP-US-024-10 Échap sur la confirmation l’annule seule : la feuille reste ouverte avec la saisie, le focus revient à « Ajouter » (RC-US-024-1)', async () => {
    const confirmer = vi.fn((): Promise<IssueTache> => Promise.resolve({ type: 'FAITE' }));
    const { fermer, surFermee } = await afficherAvecConfirmation(confirmer);
    await renseigner('Intitulé', 'Section A');
    await cliquerBoutonIon('Ajouter');
    await screen.findByRole('alertdialog');
    expect(document.querySelector<HTMLIonModalElement>('ion-modal')?.backdropDismiss).toBe(false);

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(surFermee).not.toHaveBeenCalled();
    expect(confirmer).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLIonInputElement>('ion-input')?.value).toBe('Section A');
    expect(document.querySelector<HTMLIonModalElement>('ion-modal')?.backdropDismiss).toBe(true);
    expect(document.activeElement?.textContent).toContain('Ajouter');
    await fermer();
  });
});

describe('SectionSousTaches (ECR-007 A, guide §5.8 e)', () => {
  const sectionDe = async (banc: BancObjectifs, parente: IdTache) => {
    const modele = construireDetailTache(await detailDe(banc, parente), {
      horloge: banc.env.horloge,
    });
    if (modele.sousTaches === undefined) throw new Error('Section absente');
    return modele.sousTaches;
  };

  it('UT-COMP-US-024-07 liste dans l’ordre du modèle, compteur « t / n », ouverture d’une sous-tâche ; la case « Terminer » est désactivée tant que l’écran ne sait pas terminer', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const fait = await creerSousTache(banc, parente, 'Section A');
    await creerSousTache(banc, parente, 'Section B');
    await terminerLaTache(banc, fait);
    const surOuvrir = vi.fn();
    render(<SectionSousTaches section={await sectionDe(banc, parente)} surOuvrir={surOuvrir} />);

    const section = screen.getByRole('region', { name: /Sous-tâches/u });
    expect(within(section).getByRole('heading').textContent).toBe('Sous-tâches 1 / 2');
    expect(within(section).getAllByRole('listitem')).toHaveLength(2);
    expect(within(section).getAllByText('20 nov.')).toHaveLength(2);
    const caseTerminer = within(section).getByRole('checkbox', {
      name: 'Terminer « Section B »',
    });
    expect((caseTerminer as HTMLInputElement).disabled).toBe(true);
    expect(within(section).queryByRole('checkbox', { name: /Section A/u })).toBeNull();
    await userEvent.click(within(section).getByRole('button', { name: /^Section A, terminée/u }));
    expect(surOuvrir).toHaveBeenCalledWith(fait);
  });

  it('UT-COMP-US-024-08 avec une action « terminer » fournie par l’écran, la case est active et la transmet', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const id = await creerSousTache(banc, parente, 'Section A');
    const surTerminer = vi.fn();
    render(
      <SectionSousTaches
        section={await sectionDe(banc, parente)}
        surOuvrir={vi.fn()}
        surTerminer={surTerminer}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Terminer « Section A »' }));

    expect(surTerminer).toHaveBeenCalledWith(id);
  });
});

describe('Espace des tâches — sous-tâches (ECR-007 A, I, J)', () => {
  it('UT-COMP-US-024-09 détail d’une tâche : « Ajouter une sous-tâche » ouvre la saisie ; après l’ajout la section, le compteur, ALR-013 et l’estimation calculée apparaissent ; une sous-tâche nomme sa tâche parente et ne propose pas l’ajout', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);

    await ouvrir('Modal', () =>
      userEvent.click(screen.getByRole('button', { name: 'Ajouter une sous-tâche' })),
    );
    await screen.findByRole('form', { name: 'Nouvelle sous-tâche' });
    await renseigner('Intitulé', 'Section A');
    await renseigner(/^Délai/u, '2026-11-20');
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await cliquerBoutonIon('Ajouter');

    await waitFor(() => {
      expect(screen.getByText('Ajoutée à Tâches')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Sous-tâches/u })).toBeTruthy();
    });
    expect(screen.getByText('Il reste 1 sous-tâche à terminer ou abandonner.')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Estimation' }).textContent).toContain('1 h');

    await userEvent.click(screen.getByRole('button', { name: /^Section A, à faire/u }));
    await screen.findByRole('heading', { level: 1, name: 'Section A' });
    expect(screen.getByText(/^Sous-tâche de «\s*Chapitre 1\s*»$/u)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ajouter une sous-tâche' })).toBeNull();
  });
});
