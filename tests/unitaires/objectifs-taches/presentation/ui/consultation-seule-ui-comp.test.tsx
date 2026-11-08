/**
 * Consultation seule à l'écran (RG-058 ; ST-US-017 v0.11 §6.8 n° 9 ; guide v0.2.23 §6.6.14 c), tests complémentaires de
 * Benjamin (rang 11, tranche D2) : contrôles d'action `aria-disabled` (jamais `disabled`), champs en lecture seule,
 * toast `TST-CONSULTATION-SEULE` à la tentative et jamais au focus, une fois par geste, aucune commande appelée.
 * UT-COMP-US-017-4-57 à 4-62.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { echec } from '@src/commun/domaine/resultat';
import { FournisseurConsultationSeule } from '@src/commun/presentation/ui/consultation-seule';
import { EspaceObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/espace-objectifs';
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

const TEXTE_TOAST = 'Consultation seule · mettez à jour pour modifier';

const creerTache = async (banc: BancObjectifs, intitule: string): Promise<IdTache> =>
  valeurDe(
    await banc.services.creerTache.executer({
      intitule,
      delai: date('2026-11-30'),
      estimationMinutes: 180,
      objectifIds: [],
    }),
  );

const toastsDeConsultation = (): ReadonlyArray<Element> =>
  Array.from(document.querySelectorAll('ion-toast[data-etat="TST-CONSULTATION-SEULE"]'));

const toastAffiche = (): Promise<Element> =>
  waitFor(() => {
    const [toast] = toastsDeConsultation();
    if (toast === undefined) throw new Error('Toast absent');
    return toast;
  });

type BoutonIon = { readonly hote: HTMLElement; readonly natif: HTMLButtonElement };

/** Bouton Ionic hydraté : Ionic déplace `aria-label` et `aria-disabled` de l'hôte vers son bouton natif (DOM fantôme). */
const boutonIon = (nom: string): Promise<BoutonIon> =>
  waitFor(() => {
    for (const hote of Array.from(
      document.querySelectorAll<HTMLElement>('ion-button, ion-fab-button'),
    )) {
      const natif = hote.shadowRoot?.querySelector('button');
      if (
        natif != null &&
        (natif.getAttribute('aria-label') === nom || hote.textContent.trim() === nom)
      ) {
        return { hote, natif };
      }
    }
    throw new Error(`Bouton « ${nom} » absent`);
  });

const saisieRapideOuverte = (): boolean => {
  const modale = document.querySelector('ion-modal.saisie-rapide');
  return modale !== null && !modale.classList.contains('overlay-hidden');
};

const attendre = (): Promise<void> => new Promise((resoudre) => setTimeout(resoudre, 100));

const afficher = async (actif: boolean, intitule = 'Rédiger') => {
  const banc = creerBancObjectifs();
  await creerTache(banc, intitule);
  const magasin = creerMagasinTaches(banc.services);
  const arbre = (consultationSeule: boolean) => (
    <FournisseurConsultationSeule actif={consultationSeule}>
      <EspaceTaches magasin={magasin} />
    </FournisseurConsultationSeule>
  );
  const rendu = render(arbre(actif));
  return { banc, magasin, arbre, ...rendu };
};

const caseDe = (intitule: string): Promise<HTMLInputElement> =>
  screen.findByRole<HTMLInputElement>('checkbox', { name: `Terminer «\u00a0${intitule}\u00a0»` });

describe('Liste des tâches en consultation seule', () => {
  it('UT-COMP-US-017-4-57 ni « + », ni raccourci N ; la case « Terminer » reste visible en aria-disabled (jamais disabled) ; sans consultation seule, rien de tout cela', async () => {
    const { arbre, rerender } = await afficher(true);
    const caseTerminer = await caseDe('Rédiger');
    expect(caseTerminer.getAttribute('aria-disabled')).toBe('true');
    expect(caseTerminer.disabled).toBe(false);
    expect(document.querySelector('ion-fab-button')).toBeNull();
    expect(document.querySelector('ion-fab')).toBeNull();
    await userEvent.keyboard('n');
    await attendre();
    expect(saisieRapideOuverte()).toBe(false);

    rerender(arbre(false));
    expect((await caseDe('Rédiger')).getAttribute('aria-disabled')).toBeNull();
    expect((await boutonIon('Ajouter une tâche')).natif).toBeTruthy();
    await userEvent.keyboard('n');
    await waitFor(() => {
      expect(saisieRapideOuverte()).toBe(true);
    });
  });

  it('UT-COMP-US-017-4-58 activer la case (clic) affiche le toast et n’appelle aucune commande ; la tâche reste à faire', async () => {
    const { banc, magasin } = await afficher(true);
    const terminer = vi.spyOn(banc.services.terminerTache, 'executer');
    const caseTerminer = await caseDe('Rédiger');

    await userEvent.click(caseTerminer);

    const toast = await toastAffiche();
    expect(toast.getAttribute('role')).toBe('status');
    expect(terminer).not.toHaveBeenCalled();
    expect(caseTerminer.checked).toBe(false);
    expect(magasin.getState().liste?.lignes.map((l) => l.etat.code)).toEqual(['ETA-TACHE-A-FAIRE']);
    expect(TEXTE_TOAST).toContain('Consultation seule');
  });

  it('UT-COMP-US-017-4-59 le simple focus n’affiche aucun toast ; Espace sur la case en affiche un seul, et une tentative de plus pendant sa durée n’en ajoute pas', async () => {
    await afficher(true);
    const caseTerminer = await caseDe('Rédiger');

    await userEvent.tab();
    caseTerminer.focus();
    expect(document.activeElement).toBe(caseTerminer);
    expect(toastsDeConsultation()).toHaveLength(0);

    await userEvent.keyboard(' ');
    await toastAffiche();
    await userEvent.click(caseTerminer);
    await userEvent.keyboard(' ');
    expect(toastsDeConsultation()).toHaveLength(1);
  });
});

describe('Détail d’une tâche en consultation seule', () => {
  it('UT-COMP-US-017-4-60 le menu « … » et « Modifier » sont en aria-disabled : le toast s’affiche, le menu et l’éditeur ne s’ouvrent pas ; la navigation reste active', async () => {
    await afficher(true);
    await userEvent.click(await screen.findByRole('button', { name: /Rédiger/ }));
    const menu = await boutonIon('Actions sur la tâche');
    expect(menu.natif.getAttribute('aria-disabled')).toBe('true');
    expect(menu.natif.disabled).toBe(false);

    await userEvent.click(menu.hote);
    await toastAffiche();
    expect(document.querySelector('ion-action-sheet.overlay-hidden')).not.toBeNull();

    const modifier = screen.getByRole('button', { name: 'Modifier Délai' });
    expect(modifier.getAttribute('aria-disabled')).toBe('true');
    expect((modifier as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(modifier);
    expect(screen.queryByLabelText('Délai', { selector: 'input' })).toBeNull();

    await userEvent.click((await boutonIon('Tâches')).hote);
    expect(await caseDe('Rédiger')).toBeTruthy();
  });

  it('UT-COMP-US-017-4-61 un éditeur déjà ouvert devient lecture seule (readonly, aria-readonly) : la frappe affiche le toast, le simple focus non, « Enregistrer » est inerte', async () => {
    const { arbre, rerender, banc } = await afficher(false);
    const modifier = vi.spyOn(banc.services.renommerTache, 'executer');
    await userEvent.click(await screen.findByRole('button', { name: /Rédiger/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Modifier Délai' }));
    const champ = await screen.findByLabelText<HTMLInputElement>('Délai', { selector: 'input' });
    expect(champ.readOnly).toBe(false);

    rerender(arbre(true));
    expect(champ.readOnly).toBe(true);
    expect(champ.getAttribute('aria-readonly')).toBe('true');
    champ.focus();
    expect(toastsDeConsultation()).toHaveLength(0);
    await userEvent.keyboard('2');
    await toastAffiche();
    expect(modifier).not.toHaveBeenCalled();
  });
});

describe('Commande refusée à l’exécution (ConsultationSeule)', () => {
  it('UT-COMP-US-017-4-62 si le service refuse (version plus récente apparue entre-temps), le magasin compte le refus et l’écran affiche TST-CONSULTATION-SEULE, pas ERR-014', async () => {
    const { banc, magasin } = await afficher(false);
    vi.spyOn(banc.services.terminerTache, 'executer').mockResolvedValue(
      echec({ type: 'ConsultationSeule' as const }),
    );

    await userEvent.click(await caseDe('Rédiger'));

    await toastAffiche();
    expect(magasin.getState().refusConsultationSeule).toBe(1);
    expect(magasin.getState().erreurEnregistrement).toBe(false);
    expect(document.querySelector('ion-toast[data-etat="TST-ERREUR-ENREGISTREMENT"]')).toBeNull();
  });
});

describe('Espace des objectifs en consultation seule', () => {
  it('UT-COMP-US-017-4-63 liste : ni « + » ni état vide actionnable ; détail : menu « … » et « Ajouter » en aria-disabled, toast à l’activation, aucune feuille ouverte', async () => {
    const banc = creerBancObjectifs();
    render(
      <FournisseurConsultationSeule actif>
        <EspaceObjectifs magasin={banc.magasin} />
      </FournisseurConsultationSeule>,
    );
    await screen.findByRole('region', { name: 'Un objectif donne une direction à vos tâches.' });
    expect(document.querySelector('ion-fab')).toBeNull();
    expect(screen.queryByText('Créer un objectif')).toBeNull();
    await nettoyerDocument();

    await banc.creer('Publier le guide');
    render(
      <FournisseurConsultationSeule actif>
        <EspaceObjectifs magasin={banc.magasin} />
      </FournisseurConsultationSeule>,
    );
    await userEvent.click(await screen.findByRole('button', { name: /^Publier le guide/ }));
    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });
    const menu = await boutonIon('Actions sur l’objectif');
    const ajouter = await boutonIon('Ajouter');
    expect(menu.natif.getAttribute('aria-disabled')).toBe('true');
    expect(ajouter.natif.getAttribute('aria-disabled')).toBe('true');

    await userEvent.click(ajouter.hote);
    await toastAffiche();
    expect(document.querySelector('ion-modal:not(.overlay-hidden)')).toBeNull();
    await userEvent.click(menu.hote);
    expect(document.querySelector('ion-action-sheet:not(.overlay-hidden)')).toBeNull();
    expect(toastsDeConsultation()).toHaveLength(1);
  });
});
