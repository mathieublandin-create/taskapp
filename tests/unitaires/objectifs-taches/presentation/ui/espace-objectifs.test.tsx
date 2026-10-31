/**
 * Espace des objectifs d'US-001 (ST-US-001 §14) sur les vrais cas d'usage et l'espace local simulé : création,
 * navigation, modification, suppression avec confirmation, erreur d'enregistrement (ERR-014) et déclaration de la
 * saisie en cours au registre (GardeSaisie).
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { valeurDe } from '@tests/support/environnement';
import { registreSaisie } from '@src/commun/presentation/saisie/registre-saisie';
import { EspaceObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import {
  champ,
  choixDuMenu,
  cliquerBoutonIon,
  creerBancEcritureImpossible,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  saisir,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';

/** Les superpositions Ionic (feuille, menu) sont téléportées dans le corps de la page : elles sont retirées aussi. */
afterEach(nettoyerDocument);

const afficher = (banc: BancObjectifs) => render(<EspaceObjectifs magasin={banc.magasin} />);
const titre = () => screen.getByRole('heading', { level: 1 }).textContent;
const ligne = (nom: RegExp) => screen.findByRole('button', { name: nom });
const ouvrirMenu = (): Promise<void> =>
  ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
const choisirOuvrantUneFeuille = (action: string): Promise<void> =>
  ouvrir('Modal', () => choixDuMenu(action));
const ouvrirDetail = async (banc: BancObjectifs, intitule: string, delai?: string) => {
  await banc.creer(intitule, delai);
  afficher(banc);
  await userEvent.click(await ligne(new RegExp(`^${intitule}`)));
  await screen.findByRole('heading', { level: 1, name: intitule });
};

describe('Création d’un objectif (ECR-008 B, US-001 CA-1, CA-2, CA-5)', () => {
  it('UT-COMP-US-001-60 liste vide, feuille de création, objectif créé : le détail s’ouvre, la saisie en cours est déclarée puis retirée', async () => {
    const banc = creerBancObjectifs();
    afficher(banc);
    await screen.findByRole('region', { name: 'Un objectif donne une direction à vos tâches.' });

    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    expect(await screen.findByRole('form', { name: 'Nouvel objectif' })).toBeTruthy();
    expect(registreSaisie.saisieEnCours()).toBe(false);
    await saisir('Intitulé', '  Publier le guide  ');
    await waitFor(() => {
      expect(registreSaisie.saisieEnCours()).toBe(true);
    });
    await saisir('Description (facultative)', 'Version 1');
    await saisir('Délai (facultatif)', '2026-12-15');
    await cliquerBoutonIon('Créer l’objectif');

    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });
    await waitFor(() => {
      expect(screen.queryByRole('form')).toBeNull();
    });
    expect(screen.getByText('Version 1', { selector: 'p' })).toBeTruthy();
    expect(screen.getByText('Délai : 15 déc.')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'À décliner en tâches.' })).toBeTruthy();
    await waitFor(() => {
      expect(registreSaisie.saisieEnCours()).toBe(false);
    });
    expect(screen.queryByRole('form')).toBeNull();
  });

  it('UT-COMP-US-001-61 intitulé vide : ERR-020 sous le champ, focus sur le champ, saisie conservée, rien n’est créé', async () => {
    const banc = creerBancObjectifs();
    afficher(banc);
    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    await saisir('Description (facultative)', 'À garder');

    await cliquerBoutonIon('Créer l’objectif');

    const erreur = await screen.findByRole('alert');
    expect(erreur.textContent).toBe('Indiquez un intitulé.');
    expect(erreur.dataset['message']).toBe('ERR-020');
    await waitFor(() => {
      expect(document.activeElement).toBe(document.querySelector('ion-input input'));
    });
    expect((await champ('Description (facultative)')).value).toBe('À garder');
    expect((await champ('Intitulé')).getAttribute('aria-invalid')).toBe(null);
    expect(screen.getByRole('form', { name: 'Nouvel objectif' })).toBeTruthy();
    expect(valeurDe(await banc.services.consulterObjectifs.executer()).objectifs).toHaveLength(0);
  });

  it('UT-COMP-US-001-62 « Annuler » ferme la feuille sans créer et retire la saisie en cours ; Entrée valide', async () => {
    const banc = creerBancObjectifs();
    afficher(banc);
    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    await saisir('Intitulé', 'Abandonné');
    await waitFor(() => {
      expect(registreSaisie.saisieEnCours()).toBe(true);
    });

    await cliquerBoutonIon('Annuler');

    await waitFor(() => {
      expect(screen.queryByRole('form')).toBeNull();
    });
    expect(registreSaisie.saisieEnCours()).toBe(false);
    expect(valeurDe(await banc.services.consulterObjectifs.executer()).objectifs).toHaveLength(0);

    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    await saisir('Intitulé', 'Par Entrée');
    await userEvent.type(await champ('Intitulé'), '{Enter}');
    await screen.findByRole('heading', { level: 1, name: 'Par Entrée' });
  });
});

describe('Liste et détail (ECR-008, ECR-003)', () => {
  it('UT-COMP-US-001-63 la liste affiche les objectifs créés ; un appui ouvre le détail, « Objectifs » revient à la liste', async () => {
    const banc = creerBancObjectifs();
    await banc.creer('Publier le guide', '2026-12-15');
    await banc.creer('Apprendre le piano');
    afficher(banc);

    const guide = await ligne(/^Publier le guide, À décliner en tâches/);
    expect(within(guide).getByText('15 déc.')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await userEvent.click(guide);
    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });
    await userEvent.click(screen.getByText('Objectifs'));
    await ligne(/^Apprendre le piano/);
  });
});

describe('Menu « … » de l’objectif (ECR-003 C, US-001 CA-5, CA-9)', () => {
  it('UT-COMP-US-001-64 le menu offre les actions de l’objectif sans délai (pas de « Retirer le délai ») puis les actions de l’objectif avec délai', async () => {
    const banc = creerBancObjectifs();
    await ouvrirDetail(banc, 'Sans délai');
    await ouvrirMenu();
    await screen.findByRole('button', { name: 'Renommer l’objectif' });
    expect(screen.getByRole('button', { name: 'Modifier la description' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Changer le délai' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retirer le délai' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Supprimer l’objectif…' })).toBeTruthy();
  });

  it('UT-COMP-US-001-65 renommer : la feuille reprend l’intitulé, le détail affiche le nouvel intitulé', async () => {
    const banc = creerBancObjectifs();
    await ouvrirDetail(banc, 'Ancien nom');
    await ouvrirMenu();
    await choisirOuvrantUneFeuille('Renommer l’objectif');

    expect(await screen.findByRole('form', { name: 'Renommer l’objectif' })).toBeTruthy();
    expect((await champ('Intitulé')).value).toBe('Ancien nom');
    await saisir('Intitulé', 'Nouveau nom');
    await cliquerBoutonIon('Enregistrer');

    await screen.findByRole('heading', { level: 1, name: 'Nouveau nom' });
    expect(titre()).toBe('Nouveau nom');
  });

  it('UT-COMP-US-001-66 renommer avec un intitulé vide : ERR-020, le détail est inchangé', async () => {
    const banc = creerBancObjectifs();
    await ouvrirDetail(banc, 'Reste');
    await ouvrirMenu();
    await choisirOuvrantUneFeuille('Renommer l’objectif');
    await saisir('Intitulé', '');

    await cliquerBoutonIon('Enregistrer');

    expect((await screen.findByRole('alert')).dataset['message']).toBe('ERR-020');
    expect(titre()).toBe('Reste');
  });

  it('UT-COMP-US-001-67 description et délai : modifiés par leur feuille, puis le délai est retiré par « Retirer le délai »', async () => {
    const banc = creerBancObjectifs();
    await ouvrirDetail(banc, 'Guide');
    await ouvrirMenu();
    await choisirOuvrantUneFeuille('Modifier la description');
    await saisir('Description (facultative)', 'Nouvelle description');
    await cliquerBoutonIon('Enregistrer');
    await screen.findByText('Nouvelle description', { selector: 'p' });

    await ouvrirMenu();
    await choisirOuvrantUneFeuille('Changer le délai');
    await saisir('Délai (facultatif)', '2026-12-22');
    await cliquerBoutonIon('Enregistrer');
    await screen.findByText('Délai : 22 déc.');

    await ouvrirMenu();
    await choixDuMenu('Retirer le délai');
    await screen.findByText('Délai : Sans délai');
  });

  it('UT-COMP-US-001-68 supprimer : confirmation CNF-SUPPR-OBJECTIF (alertdialog, « Annuler » focalisé), puis retour à la liste sans l’objectif', async () => {
    const banc = creerBancObjectifs();
    await ouvrirDetail(banc, 'À supprimer');
    await ouvrirMenu();
    await choixDuMenu('Supprimer l’objectif…');

    const dialogue = await screen.findByRole('alertdialog');
    expect(dialogue.dataset['code']).toBe('CNF-SUPPR-OBJECTIF');
    expect(dialogue.textContent).toContain('La suppression est définitive.');
    const annuler = within(dialogue).getByRole('button', { name: 'Annuler' });
    expect(document.activeElement).toBe(annuler);
    await userEvent.click(annuler);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(titre()).toBe('À supprimer');

    await ouvrirMenu();
    await choixDuMenu('Supprimer l’objectif…');
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Supprimer' }),
    );

    await screen.findByRole('region', { name: 'Un objectif donne une direction à vos tâches.' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(valeurDe(await banc.services.consulterObjectifs.executer()).objectifs).toHaveLength(0);
  });
});

describe('Erreur d’enregistrement (ERR-014)', () => {
  it('UT-COMP-US-001-69 écriture impossible : toast d’alerte TST-ERREUR-ENREGISTREMENT, la feuille reste ouverte avec la saisie ; le geste suivant efface le toast', async () => {
    const banc = creerBancEcritureImpossible();
    afficher(banc);
    await ouvrir('Modal', () => cliquerBoutonIon('Créer un objectif'));
    await saisir('Intitulé', 'Perdu ?');

    await cliquerBoutonIon('Créer l’objectif');

    const toast = await waitFor(() => {
      const hote = document.querySelector<HTMLElement>('ion-toast');
      if (hote === null) throw new Error('Toast absent');
      return hote;
    });
    expect(toast.dataset['etat']).toBe('TST-ERREUR-ENREGISTREMENT');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(screen.getByRole('form', { name: 'Nouvel objectif' })).toBeTruthy();
    expect((await champ('Intitulé')).value).toBe('Perdu ?');

    await cliquerBoutonIon('Créer l’objectif');
    await waitFor(() => {
      expect(document.querySelectorAll('ion-toast')).toHaveLength(1);
    });
  });
});
