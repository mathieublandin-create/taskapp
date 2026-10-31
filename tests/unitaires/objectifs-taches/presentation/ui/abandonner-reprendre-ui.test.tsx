/**
 * Interface d'US-025 (ST-US-025 §14, rang 8) : menu « … » et « Abandonner la tâche… » avec sa confirmation, tâche
 * abandonnée et « Reprendre la tâche », étiquettes des sous-tâches, action d'ERR-032, icône des lignes abandonnées,
 * phrases de la tâche parente composées par les modèles de vue (DT-021 point 2). Tests complémentaires de Benjamin
 * (UT-COMP-US-025-nn).
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { construireDetailTache, construireFormulaireSousTache } from '@src/objectifs-taches';
import { DetailTache } from '@src/objectifs-taches/presentation/ui/ecrans/detail-tache';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { valeurDe } from '@tests/support/environnement';
import {
  choixDuMenu,
  cliquerBoutonIon,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  renseigner,
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

const terminer = async (banc: BancObjectifs, id: IdTache): Promise<void> => {
  valeurDe(await banc.services.terminerTache.executer({ tacheId: id }));
};

const abandonner = async (banc: BancObjectifs, id: IdTache): Promise<void> => {
  valeurDe(await banc.services.abandonnerTache.executer({ tacheId: id }));
};

/** Détail ouvert sur la tâche, dans l'espace des tâches. */
const afficherDetail = async (banc: BancObjectifs, id: IdTache) => {
  const magasin = creerMagasinTaches(banc.services);
  await magasin.getState().actions.ouvrirDetail(id);
  render(<EspaceTaches magasin={magasin} />);
  return magasin;
};

const demanderAbandon = async (): Promise<void> => {
  await ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
  await choixDuMenu('Abandonner la tâche…');
};

const etatDe = (magasin: Awaited<ReturnType<typeof afficherDetail>>) =>
  magasin.getState().detail?.etat.code;

describe('Magasin des tâches — abandon et reprise (ST-US-025 §4.2)', () => {
  it('UT-COMP-US-025-02 abandonner demande toujours la confirmation (cascade comprise) puis écrit ; reprendre est refusé sur une tâche à faire et se confirme pour une sous-tâche sous une tâche parente terminée', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    await creerSousTache(banc, parente, 'Section A');
    await creerSousTache(banc, parente, 'Section B');
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.ouvrirDetail(parente);

    const refus = await actions.reprendre(parente);
    const demande = await actions.abandonner(parente);

    expect(refus).toEqual({ type: 'REFUSEE', messages: [] });
    if (demande.type !== 'CONFIRMATION_REQUISE') throw new Error(`Issue : ${demande.type}`);
    expect(demande.confirmation.code).toBe('CNF-ABANDON-TACHE-CASCADE');
    expect(demande.confirmation.variables).toEqual({ element: 'Chapitre 1', n: 2 });
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-A-FAIRE');
    expect((await demande.confirmer()).type).toBe('FAITE');
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-ABANDONNEE');
    expect((await actions.abandonner(parente)).type).toBe('REFUSEE');
    expect((await actions.reprendre(parente)).type).toBe('FAITE');
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-A-FAIRE');
  });

  it('UT-COMP-US-025-03 reprendre une sous-tâche abandonnée sous une tâche parente terminée demande CNF-REPRENDRE-SOUS-TACHE, puis rouvre les deux', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const sectionA = await creerSousTache(banc, parente, 'Section A');
    const sectionB = await creerSousTache(banc, parente, 'Section B');
    await abandonner(banc, sectionA);
    await terminer(banc, sectionB);
    await terminer(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.ouvrirDetail(sectionA);

    const demande = await actions.reprendre(sectionA);

    if (demande.type !== 'CONFIRMATION_REQUISE') throw new Error(`Issue : ${demande.type}`);
    expect(demande.confirmation.code).toBe('CNF-REPRENDRE-SOUS-TACHE');
    expect(demande.confirmation.variables).toEqual({
      element: 'Section A',
      tacheParente: 'Chapitre 1',
    });
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-ABANDONNEE');
    expect((await demande.confirmer()).type).toBe('FAITE');
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-A-FAIRE');
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });
});

describe('Détail d’une tâche — abandon (ECR-007 C, D, D2, F)', () => {
  it('UT-COMP-US-025-04 « Abandonner la tâche… » ouvre une boîte non rouge, « Annuler » focalisé ; Échap l’annule seule (détail inchangé, focus rendu au menu « … ») ; confirmer abandonne et offre « Reprendre la tâche »', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    const magasin = await afficherDetail(banc, id);
    // jsdom ne délègue pas le focus de l'hôte `ion-button` à son bouton natif : on vérifie la demande de focus.
    const menu = screen.getByText('…').closest('ion-button');
    if (menu === null) throw new Error('Menu « … » absent');
    const focusMenu = vi.spyOn(menu, 'focus');

    await demanderAbandon();

    const boite = await screen.findByRole('alertdialog');
    expect(boite.getAttribute('data-code')).toBe('CNF-ABANDON-TACHE');
    expect(within(boite).getByRole('heading').textContent).toContain('Abandonner');
    expect(within(boite).getByRole('button', { name: 'Abandonner' }).dataset['rouge']).toBe(
      'false',
    );
    expect(document.activeElement).toBe(within(boite).getByRole('button', { name: 'Annuler' }));

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Rédiger' })).toBeTruthy();
    expect(etatDe(magasin)).toBe('ETA-TACHE-A-FAIRE');
    expect(focusMenu).toHaveBeenCalledTimes(1);

    await demanderAbandon();
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Abandonner' }),
    );

    await waitFor(() => {
      expect(screen.getByText(/^Abandonnée le/u)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(screen.queryByRole('button', { name: 'Terminer la tâche' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Reprendre la tâche' })).toBeTruthy();
  });

  it('UT-COMP-US-025-05 « Reprendre la tâche » rend la tâche à faire : le bouton devient « Terminer la tâche » et garde le focus', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    await abandonner(banc, id);
    const magasin = await afficherDetail(banc, id);
    const reprendre = await screen.findByRole('button', { name: 'Reprendre la tâche' });
    reprendre.focus();

    await userEvent.click(reprendre);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Terminer la tâche' })).toBe(reprendre);
    });
    expect(etatDe(magasin)).toBe('ETA-TACHE-A-FAIRE');
    expect(document.activeElement).toBe(reprendre);
  });

  it('UT-COMP-US-025-06 tâche parente abandonnée : date d’abandon, étiquettes des sous-tâches (avec elle, avant), aucune case « Terminer »', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const avant = await creerSousTache(banc, parente, 'Section A');
    const terminee = await creerSousTache(banc, parente, 'Section B');
    await creerSousTache(banc, parente, 'Section C');
    await abandonner(banc, avant);
    await terminer(banc, terminee);
    await abandonner(banc, parente);

    await afficherDetail(banc, parente);

    await screen.findByText(/^Abandonnée le/u);
    const lignes = screen.getAllByRole('listitem');
    const etiquettes = lignes.map((l) => l.querySelector('[data-code]')?.getAttribute('data-code'));
    expect(etiquettes.sort()).toEqual([
      'ETA-SOUS-TACHE-ABANDONNEE-AVANT',
      'ETA-SOUS-TACHE-ABANDONNEE-AVEC',
      'ETA-SOUS-TACHE-TERMINEE-AVANT',
    ]);
    expect(screen.queryByRole('checkbox')).toBeNull();
    const ligneAvec = screen.getByRole('button', { name: /^Section C, abandonnée/u });
    const description = ligneAvec.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(description)?.textContent).toBe('Abandonnée avec la tâche');
  });

  it('UT-COMP-US-025-07 sous-tâche abandonnée sous une tâche parente terminée : « Reprendre la tâche » demande CNF-REPRENDRE-SOUS-TACHE ; Échap n’annule que la boîte, rien n’est repris ; confirmer rouvre la sous-tâche et la tâche parente', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const sectionA = await creerSousTache(banc, parente, 'Section A');
    const sectionB = await creerSousTache(banc, parente, 'Section B');
    await abandonner(banc, sectionA);
    await terminer(banc, sectionB);
    await terminer(banc, parente);
    const magasin = await afficherDetail(banc, sectionA);
    const reprendre = await screen.findByRole('button', { name: 'Reprendre la tâche' });

    await userEvent.click(reprendre);

    const boite = await screen.findByRole('alertdialog');
    expect(boite.getAttribute('data-code')).toBe('CNF-REPRENDRE-SOUS-TACHE');
    expect(within(boite).getByRole('button', { name: 'Reprendre les deux' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(etatDe(magasin)).toBe('ETA-TACHE-ABANDONNEE');
    expect(document.activeElement).toBe(reprendre);

    await userEvent.click(reprendre);
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Reprendre les deux',
      }),
    );

    await waitFor(() => {
      expect(etatDe(magasin)).toBe('ETA-TACHE-A-FAIRE');
    });
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });

  it('UT-COMP-US-025-08 un refus de l’abandon est affiché (role alert), jamais perdu', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    const detail = valeurDe(await banc.services.consulterDetailTache.executer(id));
    const modele = construireDetailTache(detail, { horloge: banc.env.horloge });
    const surAbandonner = vi.fn(() =>
      Promise.resolve({
        type: 'REFUSEE' as const,
        messages: [{ code: 'ERR-035' as const, variables: { n: 2 } }],
      }),
    );
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
        surAbandonner={surAbandonner}
      />,
    );

    await demanderAbandon();

    const alerte = await screen.findByRole('alert');
    expect(alerte.getAttribute('data-message')).toBe('ERR-035');
    expect(surAbandonner).toHaveBeenCalledTimes(1);
  });
});

describe('Saisie d’une sous-tâche — ERR-032 (guide §6.6.10)', () => {
  it('UT-COMP-US-025-09 sous une tâche abandonnée, le refus ERR-032 propose « Reprendre la tâche » : la tâche est reprise, le refus disparaît, la saisie est conservée', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Chapitre 1');
    await abandonner(banc, id);
    const magasin = await afficherDetail(banc, id);
    await ouvrir('Modal', () =>
      userEvent.click(screen.getByRole('button', { name: 'Ajouter une sous-tâche' })),
    );
    await renseigner('Intitulé', 'Section A');
    await renseigner(/^Délai/u, '2026-11-20');
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await cliquerBoutonIon('Ajouter');
    const alerte = await screen.findByRole('alert');
    expect(alerte.getAttribute('data-message')).toBe('ERR-032');

    const action = document.querySelector<HTMLElement>('[data-action="ERR-032"]');
    expect(action?.textContent).toBe('Reprendre la tâche');
    if (action !== null) await userEvent.click(action);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull();
    });
    expect(etatDe(magasin)).toBe('ETA-TACHE-A-FAIRE');
    expect(document.querySelector<HTMLIonInputElement>('ion-input')?.value).toBe('Section A');
    await cliquerBoutonIon('Ajouter');
    await waitFor(() => {
      expect(screen.getByText('Ajoutée à Tâches')).toBeTruthy();
    });
  });
});

describe('Liste des tâches — tâche abandonnée (guide §4.2)', () => {
  it('UT-COMP-US-025-10 la ligne d’une tâche abandonnée porte l’icône cercle barré (décorative) ; une tâche à faire n’en a pas', async () => {
    const banc = creerBancObjectifs();
    const faite = await creerTache(banc, 'Rédiger');
    await creerTache(banc, 'Relire');
    await abandonner(banc, faite);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.filtrerEtat('ABANDONNEE');
    render(<EspaceTaches magasin={magasin} />);

    const ligne = await screen.findByRole('button', { name: /^Rédiger, abandonnée/u });

    const icone = ligne.querySelector('svg.icone-abandonnee');
    expect(icone?.getAttribute('aria-hidden')).toBe('true');
    await magasin.getState().actions.filtrerEtat('A_FAIRE');
    const relire = await screen.findByRole('button', { name: /^Relire, à faire/u });
    expect(relire.querySelector('svg')).toBeNull();
  });
});

describe('Modèles de vue — phrase de la tâche parente (DT-021 point 2)', () => {
  it('UT-COMP-US-025-11 le formulaire de sous-tâche porte sa variante et sa phrase, le détail d’une sous-tâche la sienne ; un intitulé « $& » n’est pas interprété', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Prix en $& euros');
    const fille = await creerSousTache(banc, parente, 'Section A');

    const formulaire = construireFormulaireSousTache(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)),
    );
    const modele = construireDetailTache(
      valeurDe(await banc.services.consulterDetailTache.executer(fille)),
      { horloge: banc.env.horloge },
    );

    expect(formulaire.variante).toBe('SOUS_TACHE');
    expect(formulaire.libelleTacheParente).toBe('de « Prix en $& euros »');
    expect(modele.libelleTacheParente).toBe('Sous-tâche de « Prix en $& euros »');
  });
});
