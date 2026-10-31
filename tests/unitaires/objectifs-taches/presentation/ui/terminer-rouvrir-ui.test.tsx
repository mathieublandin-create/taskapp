/**
 * Interface d'US-003 (ST-US-003 §14, rang 7) : case « Terminer » des lignes, bouton « Terminer la tâche » (ERR-035),
 * « Rouvrir la tâche » avec CNF-ROUVRIR-SOUS-TACHE, date de fin avec MEN-HEURE-PARIS, toast TST-TERMINEE, maintien de
 * la ligne 3 s. Tests complémentaires de Benjamin (UT-COMP-US-003-nn).
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Planificateur } from '@src/commun/application/ports/planificateur';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { Toast } from '@src/commun/presentation/ui/toast';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { valeurDe } from '@tests/support/environnement';
import {
  creerBancEcritureInterruptible,
  creerBancObjectifs,
  nettoyerDocument,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';
import { date, NEW_YORK } from '@tests/support/valeurs';

afterEach(nettoyerDocument);

/** Planificateur dont l'échéance est déclenchée à la main par le test. */
class PlanificateurManuel implements Planificateur {
  action: (() => void) | undefined;
  annulations = 0;
  apres(_delai: unknown, action: () => void): () => void {
    this.action = action;
    return () => {
      this.annulations += 1;
      this.action = undefined;
    };
  }
  periodiquement(): () => void {
    return () => undefined;
  }
  attendre(): Promise<void> {
    return Promise.resolve();
  }
  echeance(): void {
    this.action?.();
  }
}

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

const intitulesDeLaListe = (magasin: ReturnType<typeof creerMagasinTaches>): Array<string> =>
  (magasin.getState().liste?.lignes ?? []).map((l) => l.intitule);

describe('Magasin des tâches — fin et réouverture (ST-US-003 §4.2, §4.5)', () => {
  it('UT-COMP-US-003-01 terminer retire la ligne du filtre « À faire » et offre l’annulation ; annuler rouvre la tâche ; sans fin à annuler, rien ne change', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.afficherListe();

    expect((await actions.terminer(id)).type).toBe('FAITE');

    expect(magasin.getState().finAnnulable).toBe(id);
    expect(intitulesDeLaListe(magasin)).toEqual([]);
    expect((await actions.annulerFin()).type).toBe('FAITE');
    expect(magasin.getState().finAnnulable).toBeUndefined();
    expect(intitulesDeLaListe(magasin)).toEqual(['Rédiger']);
    expect((await actions.annulerFin()).type).toBe('FAITE');
    actions.oublierFin();
    expect(magasin.getState().finAnnulable).toBeUndefined();
  });

  it('UT-COMP-US-003-12 terminer une tâche déjà terminée ailleurs est refusé sans message et met la liste à jour', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.afficherListe();
    await terminer(banc, id);
    expect(intitulesDeLaListe(magasin)).toEqual(['Rédiger']);

    expect(await actions.terminer(id)).toEqual({ type: 'REFUSEE', messages: [] });

    expect(intitulesDeLaListe(magasin)).toEqual([]);
    expect(magasin.getState().finAnnulable).toBeUndefined();
  });

  it('UT-COMP-US-003-02 une tâche parente qui a des sous-tâches à faire est refusée avec ERR-035 (n variable) ; une écriture impossible affiche ERR-014', async () => {
    const banc = creerBancEcritureInterruptible();
    const parente = await creerTache(banc, 'Chapitre 1');
    await creerSousTache(banc, parente, 'Section A');
    await creerSousTache(banc, parente, 'Section B');
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.ouvrirDetail(parente);

    const refus = await actions.terminer(parente);

    expect(refus).toEqual({
      type: 'REFUSEE',
      messages: [{ code: 'ERR-035', variables: { n: 2 } }],
    });
    expect(magasin.getState().finAnnulable).toBeUndefined();
    banc.interrompre();
    const sousTache = magasin.getState().detail?.sousTaches?.lignes[0]?.id;
    if (sousTache === undefined) throw new Error('Sous-tâche absente');
    expect((await actions.terminer(sousTache)).type).toBe('ENREGISTREMENT_IMPOSSIBLE');
    expect(magasin.getState().erreurEnregistrement).toBe(true);
  });

  it('UT-COMP-US-003-03 avec un planificateur, la ligne terminée reste 3 s dans « À faire » (case cochée), même si le dépôt change ; l’échéance recalcule la liste', async () => {
    const banc = creerBancObjectifs();
    const planificateur = new PlanificateurManuel();
    const a = await creerTache(banc, 'Rédiger');
    await creerTache(banc, 'Relire');
    let rappel: (() => void) | undefined;
    const magasin = creerMagasinTaches({
      ...banc.services,
      planificateur,
      observer: (r) => {
        rappel = r;
        return () => undefined;
      },
    });
    const { actions } = magasin.getState();
    actions.observerDepot();
    await actions.afficherListe();

    await actions.terminer(a);
    rappel?.();
    await Promise.resolve();

    expect(magasin.getState().termineesRecentes).toEqual([a]);
    expect(intitulesDeLaListe(magasin)).toEqual(['Rédiger', 'Relire']);
    planificateur.echeance();
    await waitFor(() => {
      expect(intitulesDeLaListe(magasin)).toEqual(['Relire']);
    });
    expect(magasin.getState().termineesRecentes).toEqual([]);
  });

  it('UT-COMP-US-003-04 annuler pendant le maintien arrête la minuterie et rouvre ; terminer depuis le détail ou un autre filtre recalcule aussitôt', async () => {
    const banc = creerBancObjectifs();
    const planificateur = new PlanificateurManuel();
    const a = await creerTache(banc, 'Rédiger');
    const b = await creerTache(banc, 'Relire');
    const magasin = creerMagasinTaches({ ...banc.services, planificateur });
    const { actions } = magasin.getState();
    await actions.afficherListe();
    await actions.terminer(a);
    await actions.terminer(b);
    expect(planificateur.annulations).toBe(1);

    await actions.annulerFin();

    expect(planificateur.annulations).toBe(2);
    expect(magasin.getState().termineesRecentes).toEqual([]);
    expect(intitulesDeLaListe(magasin)).toEqual(['Relire']);
    await actions.filtrerEtat('TERMINEE');
    await actions.terminer(b);
    expect(magasin.getState().termineesRecentes).toEqual([]);
    expect(planificateur.action).toBeUndefined();
    await actions.ouvrirDetail(b);
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-TERMINEE');
  });

  it('UT-COMP-US-003-05 rouvrir : sans confirmation pour une tâche simple ; une tâche à faire est refusée ; sous une tâche parente terminée, la confirmation précède les deux réouvertures', async () => {
    const banc = creerBancObjectifs();
    const simple = await creerTache(banc, 'Rédiger');
    const parente = await creerTache(banc, 'Chapitre 1');
    const fille = await creerSousTache(banc, parente, 'Section A');
    await terminer(banc, simple);
    await terminer(banc, fille);
    await terminer(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    await actions.ouvrirDetail(fille);

    expect((await actions.rouvrir(simple)).type).toBe('FAITE');
    expect((await actions.rouvrir(simple)).type).toBe('REFUSEE');
    const issue = await actions.rouvrir(fille);
    if (issue.type !== 'CONFIRMATION_REQUISE') throw new Error(`Issue inattendue : ${issue.type}`);
    expect(issue.confirmation.code).toBe('CNF-ROUVRIR-SOUS-TACHE');
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-TERMINEE');
    expect((await issue.confirmer()).type).toBe('FAITE');
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-A-FAIRE');
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });
});

describe('Espace des tâches — liste (ECR-002 L1, L4)', () => {
  it('UT-COMP-US-003-06 la case « Terminer » coche la ligne, qui reste affichée ; le toast TST-TERMINEE et « Annuler » rouvrent la tâche ; fermer le toast oublie la fin', async () => {
    const banc = creerBancObjectifs();
    const planificateur = new PlanificateurManuel();
    const id = await creerTache(banc, 'Rédiger');
    const magasin = creerMagasinTaches({ ...banc.services, planificateur });
    render(<EspaceTaches magasin={magasin} />);
    const caseTerminer = await screen.findByRole('checkbox', { name: 'Terminer « Rédiger »' });

    await userEvent.click(caseTerminer);

    await waitFor(() => {
      const cochee = screen.getByRole('checkbox', { name: 'Terminer « Rédiger »' });
      expect((cochee as HTMLInputElement).checked).toBe(true);
      expect((cochee as HTMLInputElement).disabled).toBe(true);
    });
    const hote = await waitFor(() => {
      const toast = document.querySelector('ion-toast');
      if (toast?.shadowRoot?.querySelector('button.toast-button') == null)
        throw new Error('Toast absent');
      return toast;
    });
    expect(hote.dataset['etat']).toBe('TST-TERMINEE');
    hote.shadowRoot?.querySelector<HTMLElement>('button.toast-button')?.click();
    await waitFor(() => {
      expect(magasin.getState().finAnnulable).toBeUndefined();
    });
    await waitFor(() => {
      expect(
        screen.getByRole<HTMLInputElement>('checkbox', { name: 'Terminer « Rédiger »' }).disabled,
      ).toBe(false);
    });
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(id)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });

  it('UT-COMP-US-003-07 une tâche terminée n’a pas de case ; une liste sans action « terminer » n’en affiche pas', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    await terminer(banc, id);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.filtrerEtat('TERMINEE');
    render(<EspaceTaches magasin={magasin} />);

    await screen.findByRole('button', { name: /^Rédiger, terminée/u });

    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

describe('Toast — fermeture', () => {
  it('UT-COMP-US-003-08 le rappel de fermeture est appelé quand le toast disparaît', async () => {
    const surFermeture = vi.fn();
    render(<Toast code="TST-TERMINEE" surAction={vi.fn()} surFermeture={surFermeture} />);
    const hote = await waitFor(() => {
      const toast = document.querySelector('ion-toast');
      if (toast === null) throw new Error('Toast absent');
      return toast;
    });

    await waitFor(async () => {
      expect(await hote.dismiss()).toBe(true);
    });

    await waitFor(() => {
      expect(surFermeture).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Espace des tâches — détail (ECR-007 A, G)', () => {
  it('UT-COMP-US-003-09 « Terminer la tâche » reste focalisable mais aria-disabled tant qu’il reste des sous-tâches : ERR-035 annoncé ; terminer les sous-tâches, puis la tâche, donne « Terminée le … » et « Rouvrir la tâche », focus conservé', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    await creerSousTache(banc, parente, 'Section A');
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(parente);
    render(<EspaceTaches magasin={magasin} />);
    const bouton = await screen.findByRole('button', { name: 'Terminer la tâche' });
    expect(bouton.getAttribute('aria-disabled')).toBe('true');
    const note = screen.getByText('Il reste 1 sous-tâche à terminer ou abandonner.');
    expect(bouton.getAttribute('aria-describedby')).toBe(note.id);

    await userEvent.click(bouton);

    const alerte = await screen.findByRole('alert');
    expect(alerte.textContent).toBe('Il reste 1 sous-tâche à terminer ou abandonner.');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Terminer « Section A »' }));
    await waitFor(() => {
      expect(screen.queryByText(/Il reste 1 sous-tâche/u)).toBeNull();
    });
    bouton.focus();
    await userEvent.click(screen.getByRole('button', { name: 'Terminer la tâche' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Rouvrir la tâche' })).toBe(bouton);
    });
    expect(document.activeElement).toBe(bouton);
    expect(screen.getByText(/^Terminée le /u)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('UT-COMP-US-003-10 « Rouvrir la tâche » d’une sous-tâche sous une tâche terminée demande CNF-ROUVRIR-SOUS-TACHE : Échap annule et rend le focus ; confirmer rouvre les deux', async () => {
    const banc = creerBancObjectifs();
    const parente = await creerTache(banc, 'Chapitre 1');
    const fille = await creerSousTache(banc, parente, 'Section A');
    await terminer(banc, fille);
    await terminer(banc, parente);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(fille);
    render(<EspaceTaches magasin={magasin} />);
    const bouton = await screen.findByRole('button', { name: 'Rouvrir la tâche' });

    await userEvent.click(bouton);

    const boite = await screen.findByRole('alertdialog');
    expect(within(boite).getByRole('heading').textContent).toMatch(
      /^Rouvrir aussi «\s*Chapitre 1\s*»\s*\?$/u,
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(bouton);
    expect(magasin.getState().detail?.etat.code).toBe('ETA-TACHE-TERMINEE');
    await userEvent.click(bouton);
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Rouvrir les deux',
      }),
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Terminer la tâche' })).toBe(bouton);
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(bouton);
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(parente)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });

  it('UT-COMP-US-003-11 la date de fin porte la mention « Heure de Paris » hors fuseau de Paris, jamais à Paris', async () => {
    const banc = creerBancObjectifs();
    const id = await creerTache(banc, 'Rédiger');
    await terminer(banc, id);
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.ouvrirDetail(id);
    const { unmount } = render(<EspaceTaches magasin={magasin} />);
    await screen.findByRole('button', { name: 'Rouvrir la tâche' });
    expect(document.querySelector('.mention-heure-paris')).toBeNull();
    unmount();

    banc.env.horloge.reglerFuseauAppareil(NEW_YORK);
    await magasin.getState().actions.ouvrirDetail(id);
    render(<EspaceTaches magasin={magasin} />);

    await waitFor(() => {
      expect(document.querySelector('.mention-heure-paris')).not.toBeNull();
    });
    expect(screen.getByText(/^Terminée le /u)).toBeTruthy();
  });
});
