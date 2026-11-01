/**
 * Écrans ECR-008 (liste) et ECR-003 (détail) d'US-001 (ST-US-001 §14) : rendu des libellés du catalogue, `data-etat`,
 * rôles, action déclenchée. Les écrans reçoivent des modèles de vue construits par les fonctions du contexte.
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DetailObjectif as DonneesDetail, ResumeObjectif } from '@src/objectifs-taches';
import { construireDetailObjectif } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-objectif';
import { construireListeObjectifs } from '@src/objectifs-taches/presentation/modeles-de-vue/liste-objectifs';
import { DetailObjectif } from '@src/objectifs-taches/presentation/ui/ecrans/detail-objectif';
import { ListeObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/liste-objectifs';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { NEW_YORK, idObjectif } from '@tests/support/valeurs';
import { cliquerBoutonIon } from '@tests/support/ui-objectifs';

afterEach(cleanup);

const MAINTENANT = '2026-10-21T08:00:00.000Z';
const o = (n: number) => idObjectif(n);
const liste = (
  objectifs: ReadonlyArray<ResumeObjectif>,
  fuseau = undefined as typeof NEW_YORK | undefined,
) =>
  construireListeObjectifs(
    { objectifs },
    { horloge: fuseau === undefined ? horlogeSur(MAINTENANT) : horlogeSur(MAINTENANT, fuseau) },
  );
const detail = (donnees: Partial<DonneesDetail> & { objectif: ResumeObjectif }) =>
  construireDetailObjectif(
    { sousObjectifs: [], taches: [], sousTachesPar: new Map(), actions: [], ...donnees },
    { horloge: horlogeSur(MAINTENANT) },
  );

describe('ListeObjectifs (ECR-008 A, E)', () => {
  const GUIDE = resumeObjectif({
    id: o(1),
    intitule: 'Publier le guide',
    delai: '2026-12-15',
    tachesTerminees: 1,
    tachesNonAbandonnees: 3,
  });
  const SOUS = resumeObjectif({
    id: o(2),
    intitule: 'Relecture',
    parentId: o(1),
    etat: 'A_DECLINER',
  });
  const RETARD = resumeObjectif({
    id: o(3),
    intitule: 'Ranger le garage',
    delai: '2026-10-01',
    enRetard: true,
  });

  it('UT-COMP-US-001-41 une ligne par objectif, nommée en entier (intitulé, état, tâches, délai), avec son état en toutes lettres et data-etat', () => {
    render(
      <ListeObjectifs
        modele={liste([GUIDE, SOUS, RETARD])}
        surCreer={vi.fn()}
        surOuvrir={vi.fn()}
      />,
    );

    const ligne = screen.getByRole('button', {
      name: 'Publier le guide, En cours, 1 tâches sur 3 terminées, délai 15 déc.',
    });
    expect(ligne.dataset['etat']).toBe('ETA-OBJ-EN-COURS');
    expect(within(ligne).getByText('1 / 3 tâches')).toBeTruthy();
    expect(within(ligne).getByText('15 déc.')).toBeTruthy();
    const sous = screen.getByRole('button', { name: /^Relecture, À décliner en tâches/ });
    expect(sous.dataset['etat']).toBe('ETA-OBJ-A-DECLINER');
    expect(sous.parentElement?.dataset['niveau']).toBe('SOUS_OBJECTIF');
    expect(within(sous).getByText('Sans délai')).toBeTruthy();
    const retard = screen.getByRole('button', { name: /^Ranger le garage/ });
    expect(within(retard).getByText('En retard · 1 oct.')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('UT-COMP-US-001-42 un appui sur une ligne ouvre le détail de cet objectif', async () => {
    const surOuvrir = vi.fn();
    render(<ListeObjectifs modele={liste([GUIDE])} surCreer={vi.fn()} surOuvrir={surOuvrir} />);

    await userEvent.click(screen.getByRole('button', { name: /^Publier le guide/ }));

    expect(surOuvrir).toHaveBeenCalledExactlyOnceWith(o(1));
  });

  it('UT-COMP-US-001-43 aucun objectif : état vide EVD-OBJECTIFS et son action « Créer un objectif »', async () => {
    const surCreer = vi.fn();
    const { container } = render(
      <ListeObjectifs modele={liste([])} surCreer={surCreer} surOuvrir={vi.fn()} />,
    );

    const vide = screen.getByRole('region', {
      name: 'Un objectif donne une direction à vos tâches.',
    });
    expect(vide.dataset['etat']).toBe('EVD-OBJECTIFS');
    expect(container.querySelector('ul')).toBeNull();
    await userEvent.click(within(vide).getByText('Créer un objectif'));
    expect(surCreer).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-001-44 section « Atteints (n) » repliée par défaut, dépliée et repliée par son bouton ; état vide « Tous vos objectifs sont atteints »', async () => {
    const atteint = resumeObjectif({ id: o(4), intitule: 'Plan détaillé', etat: 'ATTEINT' });
    render(<ListeObjectifs modele={liste([atteint])} surCreer={vi.fn()} surOuvrir={vi.fn()} />);

    expect(
      screen.getByRole('region', { name: 'Tous vos objectifs sont atteints.' }).dataset['etat'],
    ).toBe('EVD-OBJECTIFS-TOUS-ATTEINTS');
    const bouton = screen.getByRole('button', { name: 'Atteints (1)' });
    expect(bouton.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: /^Plan détaillé/ })).toBeNull();

    await userEvent.click(bouton);
    expect(bouton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /^Plan détaillé, Atteint/ }).dataset['etat']).toBe(
      'ETA-OBJ-ATTEINT',
    );
    await userEvent.click(bouton);
    expect(screen.queryByRole('button', { name: /^Plan détaillé/ })).toBeNull();
  });

  it('UT-COMP-US-001-45 le bouton « + » et Maj+N créent un objectif ; Maj+N est ignoré pendant une saisie et avec un autre modificateur', async () => {
    const surCreer = vi.fn();
    const { container } = render(
      <>
        <ListeObjectifs modele={liste([GUIDE])} surCreer={surCreer} surOuvrir={vi.fn()} />
        <input aria-label="Saisie" />
      </>,
    );

    await userEvent.click(container.querySelector('ion-fab-button') as HTMLElement);
    expect(surCreer).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    expect(surCreer).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(document.body, { key: 'n' });
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true, ctrlKey: true });
    fireEvent.keyDown(screen.getByLabelText('Saisie'), { key: 'N', shiftKey: true });
    expect(surCreer).toHaveBeenCalledTimes(2);
  });

  it('UT-COMP-US-001-46 la puce « Heure de Paris » n’apparaît que si le fuseau de l’appareil diffère de Paris', () => {
    const { rerender } = render(
      <ListeObjectifs modele={liste([GUIDE])} surCreer={vi.fn()} surOuvrir={vi.fn()} />,
    );
    expect(document.querySelector('[data-etat="MEN-HEURE-PARIS"]')).toBeNull();

    rerender(
      <ListeObjectifs modele={liste([GUIDE], NEW_YORK)} surCreer={vi.fn()} surOuvrir={vi.fn()} />,
    );
    expect(document.querySelector('[data-etat="MEN-HEURE-PARIS"]')).not.toBeNull();
  });
});

describe('DetailObjectif (ECR-003 A, B, D)', () => {
  const proprietes = () => ({
    surRetour: vi.fn(),
    surOuvrirMenu: vi.fn(),
    surOuvrirSousObjectif: vi.fn(),
  });

  it('UT-COMP-US-001-47 en-tête : intitulé, état, niveau, barre de progression nommée, compteur, délai, description', () => {
    const modele = detail({
      objectif: resumeObjectif({
        id: o(1),
        intitule: 'Publier le guide',
        description: 'Version 1 du guide',
        delai: '2026-12-22',
        tachesTerminees: 7,
        tachesNonAbandonnees: 12,
      }),
    });
    render(<DetailObjectif modele={modele} {...proprietes()} />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Publier le guide');
    expect(document.querySelector('ion-chip[data-code="ETA-OBJ-EN-COURS"]')?.textContent).toBe(
      'En cours',
    );
    expect(document.body.textContent).toContain('Objectif principal');
    const barre = screen.getByRole('progressbar', {
      name: 'Publier le guide, En cours, 7 tâches sur 12 terminées, délai 22 déc.',
    });
    expect(barre.getAttribute('aria-valuenow')).toBe('58');
    expect(barre.getAttribute('aria-valuemin')).toBe('0');
    expect(barre.getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByText('7 / 12 tâches')).toBeTruthy();
    expect(screen.getByText('Délai : 22 déc.')).toBeTruthy();
    expect(screen.getByText('Version 1 du guide')).toBeTruthy();
  });

  it('UT-COMP-US-001-48 sans tâche : état vide « À décliner en tâches » sans action ; sans délai : « Sans délai » ; pas de section de sous-objectifs', () => {
    const modele = detail({
      objectif: resumeObjectif({ id: o(1), intitule: 'Courir', etat: 'A_DECLINER' }),
    });
    render(<DetailObjectif modele={modele} {...proprietes()} />);

    const vide = screen.getByRole('region', { name: 'À décliner en tâches.' });
    expect(vide.dataset['etat']).toBe('EVD-OBJECTIF-SANS-TACHE');
    expect(within(vide).queryByText('Ajouter une tâche')).toBeNull();
    expect(screen.getByText('Délai : Sans délai')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Sous-objectifs' })).toBeNull();
    expect(document.querySelector('[data-code="MEN-EN-RETARD"]')).toBeNull();
  });

  it('UT-COMP-US-001-49 un sous-objectif nomme son parent ; l’alerte de délai (ALR-007) et le retard sont écrits', () => {
    const modele = detail({
      objectif: resumeObjectif({
        id: o(2),
        intitule: 'Relecture',
        parentId: o(1),
        parentIntitule: 'Guide',
        delai: '2026-10-01',
        enRetard: true,
        alerteDelai: { parentIntitule: 'Guide', delaiParent: '2026-09-01' } as never,
      }),
    });
    render(<DetailObjectif modele={modele} {...proprietes()} />);

    expect(document.body.textContent).toContain('Sous-objectif de «\u00a0Guide\u00a0»');
    expect(document.querySelector('[data-code="MEN-EN-RETARD"]')?.textContent).toBe(
      'En retard · 1 oct.',
    );
    expect(document.querySelector('[data-code="ALR-007"]')?.getAttribute('role')).toBe('status');
  });

  it('UT-COMP-US-023-12 la carte ALR-007 du détail d’un sous-objectif (variante detail) porte titre, texte et l’action « Changer le délai » qui ouvre la feuille du délai', async () => {
    const surChangerDelai = vi.fn();
    const modele = detail({
      objectif: resumeObjectif({
        id: o(2),
        intitule: 'Relecture',
        parentId: o(1),
        parentIntitule: 'Guide',
        delai: '2026-10-01',
        alerteDelai: { parentIntitule: 'Guide', delaiParent: '2026-09-01' } as never,
      }),
    });
    render(<DetailObjectif modele={modele} {...proprietes()} surChangerDelai={surChangerDelai} />);

    const carte = document.querySelector('[data-code="ALR-007"]');
    expect(carte?.getAttribute('data-variante')).toBe('detail');
    expect(carte?.getAttribute('role')).toBe('status');
    expect(carte?.textContent).toContain('Délai postérieur à celui du parent');
    expect(carte?.textContent).toContain('Rien n’est bloqué.');
    await cliquerBoutonIon('Changer le délai');
    expect(surChangerDelai).toHaveBeenCalledOnce();
  });

  it('UT-COMP-US-001-50 les sous-objectifs sont listés sous leur titre ; un appui ouvre le détail du sous-objectif', async () => {
    const proprietesDetail = proprietes();
    const sous = resumeObjectif({
      id: o(2),
      intitule: 'Relecture',
      parentId: o(1),
      delai: '2026-11-01',
    });
    const modele = detail({
      objectif: resumeObjectif({ id: o(1), intitule: 'Guide' }),
      sousObjectifs: [sous],
    });
    render(<DetailObjectif modele={modele} {...proprietesDetail} />);

    const section = screen.getByRole('heading', { name: 'Sous-objectifs' }).parentElement;
    if (section === null) throw new Error('Section des sous-objectifs absente');
    expect(section.dataset['code']).toBe('SEC-SOUS-OBJECTIFS');
    await userEvent.click(within(section).getByRole('button', { name: /^Relecture/ }));
    expect(proprietesDetail.surOuvrirSousObjectif).toHaveBeenCalledExactlyOnceWith(o(2));
  });

  it('UT-COMP-US-001-51 « Objectifs » revient à la liste et « … » ouvre le menu de l’objectif', async () => {
    const proprietesDetail = proprietes();
    render(
      <DetailObjectif
        modele={detail({ objectif: resumeObjectif({ id: o(1) }) })}
        {...proprietesDetail}
      />,
    );

    await userEvent.click(screen.getByText('Objectifs'));
    expect(proprietesDetail.surRetour).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText('…'));
    expect(proprietesDetail.surOuvrirMenu).toHaveBeenCalledTimes(1);
  });
});
