/**
 * Composants communs du rang 2 en Ionic (RC-R2-2, RC-R2-4) : Toast, BoiteConfirmation, EtatVide, NoteHeureParis.
 * Les composants Ionic à DOM fantôme (ion-toast, ion-button) sont lus par leur élément hôte.
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireConfirmationCompte } from '@src/compte/presentation/modeles-de-vue/confirmations-compte';
import { DialogueConfirmation } from '@src/compte/presentation/ui/DialogueConfirmation';
import { BoiteConfirmation } from '@src/commun/presentation/ui/boite-confirmation';
import { EtatVide } from '@src/commun/presentation/ui/etat-vide';
import { NoteHeureParis } from '@src/commun/presentation/ui/mention-heure-paris';
import { Toast } from '@src/commun/presentation/ui/toast';

afterEach(cleanup);

const hoteToast = async (): Promise<HTMLElement> => {
  await waitFor(() => {
    expect(
      document.querySelector('ion-toast')?.shadowRoot?.querySelector('.toast-message'),
    ).not.toBeNull();
  });
  return document.querySelector('ion-toast') as HTMLElement;
};
const textesToast = (hote: HTMLElement): string =>
  hote.shadowRoot?.querySelector('.toast-message')?.textContent ?? '';
const boutonsToast = (hote: HTMLElement): ReadonlyArray<HTMLElement> =>
  Array.from(hote.shadowRoot?.querySelectorAll<HTMLElement>('button.toast-button') ?? []);

describe('Toast (guide §4.10, §6.6.6)', () => {
  it('UT-COMP-US-001-24 Toast — role="status" et data-etat sur l’élément, texte du catalogue, durée de 4 s sans action', async () => {
    render(<Toast code="TST-SAISIE-A-TERMINER" />);

    const hote = await hoteToast();

    expect(hote.getAttribute('role')).toBe('status');
    expect(hote.dataset['etat']).toBe('TST-SAISIE-A-TERMINER');
    expect(textesToast(hote)).toBe('Terminez votre saisie, puis reprenez la synchronisation.');
    expect((hote as HTMLElement & { duration: number }).duration).toBe(4000);
    expect(boutonsToast(hote)).toHaveLength(0);
  });

  it('UT-COMP-US-001-25 Toast — l’échec d’enregistrement est une alerte persistante ; avec action, « Réessayer » appelle le rappel et le libellé est la variante courte', async () => {
    const surAction = vi.fn();
    render(<Toast code="TST-ERREUR-ENREGISTREMENT" surAction={surAction} />);

    const hote = await hoteToast();

    expect(hote.getAttribute('role')).toBe('alert');
    expect(hote.dataset['etat']).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(textesToast(hote)).toBe('Impossible d’enregistrer.');
    expect((hote as HTMLElement & { duration: number }).duration).toBe(0);
    const boutons = boutonsToast(hote);
    expect(boutons.map((b) => b.textContent.trim())).toEqual(['Réessayer']);
    boutons[0]?.click();
    expect(surAction).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-001-26 Toast — sans rappel, le libellé complet « Impossible d’enregistrer. Réessayer » et aucun bouton ; un code sans action n’en offre pas', async () => {
    const { rerender } = render(<Toast code="TST-ERREUR-ENREGISTREMENT" />);
    const hote = await hoteToast();
    expect(textesToast(hote)).toBe('Impossible d’enregistrer. Réessayer');
    expect(boutonsToast(hote)).toHaveLength(0);

    rerender(<Toast code="TST-HORS-LIGNE" surAction={vi.fn()} />);
    await waitFor(() => {
      expect(textesToast(hote)).toContain('Hors ligne.');
    });
    expect(boutonsToast(hote)).toHaveLength(0);
  });

  it('UT-COMP-US-001-27 Toast — un code avec action mais sans variante courte garde son libellé et offre son action', async () => {
    const surAction = vi.fn();
    render(<Toast code="TST-TERMINEE" surAction={surAction} />);

    const hote = await hoteToast();

    expect(textesToast(hote)).toBe('Tâche terminée');
    expect((hote as HTMLElement & { duration: number }).duration).toBe(6000);
    expect(boutonsToast(hote).map((b) => b.textContent.trim())).toEqual(['Annuler']);
  });
});

describe('BoiteConfirmation (guide §4.12, §6.6.7)', () => {
  const proprietes = (surales: { surConfirmer?: () => void; surAnnuler?: () => void } = {}) => ({
    code: 'CNF-SUPPR-OBJECTIF' as const,
    titre: 'Supprimer « Guide » ?',
    actionLibelle: 'Supprimer',
    rouge: true,
    surConfirmer: surales.surConfirmer ?? vi.fn(),
    surAnnuler: surales.surAnnuler ?? vi.fn(),
  });

  it('UT-COMP-US-001-28 BoiteConfirmation — alertdialog nommé par son titre, décrit par son texte, « Annuler » focalisé', () => {
    render(<BoiteConfirmation {...proprietes()} texte="La suppression est définitive." />);

    const dialogue = screen.getByRole('alertdialog', { name: 'Supprimer « Guide » ?' });
    expect(dialogue.dataset['code']).toBe('CNF-SUPPR-OBJECTIF');
    expect(dialogue.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('alertdialog', { description: 'La suppression est définitive.' })).toBe(
      dialogue,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Annuler' }));
  });

  it('UT-COMP-US-001-29 BoiteConfirmation — sans texte, aucune description ; deux boîtes ont des identifiants distincts', () => {
    render(
      <>
        <BoiteConfirmation {...proprietes()} />
        <BoiteConfirmation {...proprietes()} texte="Autre" />
      </>,
    );

    const [sans, avec] = screen.getAllByRole('alertdialog');
    expect(sans?.hasAttribute('aria-describedby')).toBe(false);
    expect(sans?.getAttribute('aria-labelledby')).not.toBe(avec?.getAttribute('aria-labelledby'));
  });

  it('UT-COMP-US-001-30 BoiteConfirmation — « Annuler » et Échap appellent surAnnuler, l’action rouge appelle surConfirmer', async () => {
    const surConfirmer = vi.fn();
    const surAnnuler = vi.fn();
    render(<BoiteConfirmation {...proprietes({ surConfirmer, surAnnuler })} />);

    fireEvent.keyDown(document, { key: 'a' });
    expect(surAnnuler).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(surAnnuler).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(surAnnuler).toHaveBeenCalledTimes(2);
    const action = screen.getByRole('button', { name: 'Supprimer' });
    expect(action.dataset['rouge']).toBe('true');
    await userEvent.click(action);
    expect(surConfirmer).toHaveBeenCalledTimes(1);
  });
});

describe('DialogueConfirmation (conventions.md §8.6)', () => {
  it('UT-COMP-US-001-35 DialogueConfirmation — une confirmation avec texte est décrite par ce texte ; la déconnexion n’est pas en rouge', () => {
    render(
      <DialogueConfirmation
        vue={construireConfirmationCompte({ code: 'CNF-DECONNEXION', n: 2 })}
        surConfirmer={vi.fn()}
        surAnnuler={vi.fn()}
      />,
    );

    const dialogue = screen.getByRole('alertdialog', {
      name: 'Se déconnecter\u00a0?',
    });
    expect(dialogue.getAttribute('aria-describedby')).not.toBeNull();
    expect(
      screen.getByRole('alertdialog', {
        description: /2 modifications ne sont pas encore enregistrées/,
      }),
    ).toBe(dialogue);
    expect(screen.getByRole('button', { name: 'Se déconnecter' }).dataset['rouge']).toBe('false');
  });
});

describe('EtatVide (guide §4.19, §6.5.5)', () => {
  it('UT-COMP-US-001-31 EtatVide — phrase, texte et action du catalogue ; l’action appelle le rappel', async () => {
    const surAction = vi.fn();
    const { container } = render(<EtatVide code="EVD-TACHES" surAction={surAction} />);

    const etat = screen.getByRole('region', { name: 'Aucune tâche pour l’instant.' });
    expect(etat.dataset['etat']).toBe('EVD-TACHES');
    expect(
      screen.getByText('Commencez par ce qui vous vient à l’esprit, vous trierez ensuite.'),
    ).toBeTruthy();
    const bouton = container.querySelector('ion-button');
    expect(bouton?.textContent).toBe('Ajouter une tâche');
    await userEvent.click(bouton as HTMLElement);
    expect(surAction).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-001-32 EtatVide — sans rappel ou sans action au catalogue, aucun bouton ; sans texte, un seul paragraphe', () => {
    const { container, rerender } = render(<EtatVide code="EVD-OBJECTIF-SANS-TACHE" />);
    expect(container.querySelector('ion-button')).toBeNull();

    rerender(<EtatVide code="EVD-FILTRE-A-FAIRE" surAction={vi.fn()} />);
    expect(container.querySelector('ion-button')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});

describe('NoteHeureParis (guide §4.21, RG-054)', () => {
  const mention = { code: 'MEN-HEURE-PARIS', libelle: 'Heure de Paris' } as const;

  it('UT-COMP-US-001-33 NoteHeureParis — puce « Heure de Paris » nommée, explication au clic, refermée par Échap', async () => {
    const { container } = render(<NoteHeureParis mention={mention} />);

    const puce = container.querySelector('ion-button') as HTMLElement;
    expect(container.querySelector('[data-etat="MEN-HEURE-PARIS"]')).not.toBeNull();
    expect(puce.textContent).toBe('Heure de Paris');
    expect(puce.getAttribute('aria-label')).toBe('Heure de Paris\u00a0: afficher l’explication');
    expect(puce.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('tooltip')).toBeNull();

    await userEvent.click(puce);
    expect(puce.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('tooltip').textContent).toBe(
      'Les jours, les retards et les horaires suivent l’heure de Paris, où que vous soyez.',
    );

    fireEvent.keyDown(document, { key: 'a' });
    expect(screen.getByRole('tooltip')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(puce.getAttribute('aria-expanded')).toBe('false');
  });

  it('UT-COMP-US-001-34 NoteHeureParis — un second clic referme l’explication', async () => {
    const { container } = render(<NoteHeureParis mention={mention} />);
    const puce = container.querySelector('ion-button') as HTMLElement;

    await userEvent.click(puce);
    await userEvent.click(puce);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
