/**
 * Interface d'US-023 (ST-US-023 §14) : ParentPicker (ECR-008 C, D), section « Sous-objectifs » et placement dans
 * l'espace des objectifs (ECR-003 D, E), actions du magasin.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { valeurDe } from '@tests/support/environnement';
import { construireSelecteurParent } from '@src/objectifs-taches';
import { SelecteurParent } from '@src/objectifs-taches/presentation/ui/composants/selecteur-parent';
import { EspaceObjectifs } from '@src/objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { date, idObjectif } from '@tests/support/valeurs';
import {
  choixDuMenu,
  cliquerBoutonIon,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  saisir,
  type BancObjectifs,
} from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

const X = idObjectif(1);
const P = idObjectif(2);
const objectif = resumeObjectif({ id: X, intitule: 'Publier le guide' });
const candidats = [objectif, resumeObjectif({ id: P, intitule: 'Développer mon activité' })];

const proprietesSelecteur = (nombreSousObjectifs = 0) => ({
  modele: construireSelecteurParent({
    objectif,
    candidats,
    nombreSousObjectifs,
    jour: date('2026-10-21'),
    autresSousObjectifs: new Map(),
  }),
  surRefusCompris: vi.fn(),
  surChoisir: vi.fn(),
  surFermer: vi.fn(),
});

describe('ParentPicker (ECR-008 C, D ; guide §4.28)', () => {
  it('UT-COMP-US-023-13 les indications d’un candidat (délai, puis effectif) sont lues avec l’option (aria-describedby), sur une ligne', () => {
    const parent = resumeObjectif({
      id: P,
      intitule: 'Développer mon activité',
      delai: '2026-12-15',
    });
    render(
      <SelecteurParent
        {...proprietesSelecteur()}
        modele={construireSelecteurParent({
          objectif,
          candidats: [objectif, parent],
          nombreSousObjectifs: 0,
          jour: date('2026-10-21'),
          autresSousObjectifs: new Map([[P, 2]]),
        })}
      />,
    );

    const option = screen.getByRole('radio', { name: 'Développer mon activité' });
    const decrit = document.getElementById(option.getAttribute('aria-describedby') ?? '');
    expect(decrit?.textContent).toBe('Son délai\u00a0: 15 déc. · Aura 3 sous-objectifs');
  });

  it('UT-COMP-US-023-01 les options sont des boutons radio ; l’objectif lui-même est indisponible et lu avec sa raison ; le choix est transmis', async () => {
    const proprietes = proprietesSelecteur();
    render(<SelecteurParent {...proprietes} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.closest('label')?.textContent)).toEqual([
      'Aucun, objectif principal',
      'Développer mon activité',
      'Publier le guide',
    ]);
    const soiMeme = screen.getByRole('radio', { name: 'Publier le guide' });
    expect(soiMeme).toHaveProperty('disabled', true);
    expect(soiMeme.getAttribute('aria-describedby')).not.toBeNull();
    expect(document.querySelector('[data-code="ERR-031"]')?.textContent).toBe(
      'Un objectif ne peut pas être placé sous lui-même',
    );
    expect(screen.getByRole('button', { name: 'Placer' })).toHaveProperty('disabled', true);

    await userEvent.click(screen.getByRole('radio', { name: 'Développer mon activité' }));
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }));
    expect(proprietes.surChoisir).toHaveBeenCalledExactlyOnceWith({ type: 'OBJECTIF', id: P });
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(proprietes.surFermer).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-023-02 un objectif qui a des sous-objectifs : ERR-030 est expliquée avant tout choix (« Compris »), seule l’option « Aucun » reste possible', async () => {
    render(<SelecteurParent {...proprietesSelecteur(2)} />);

    const boite = screen.getByRole('alertdialog');
    expect(boite.dataset['code']).toBe('ERR-030');
    expect(boite.dataset['variante']).toBe('objectif-a-des-sous-objectifs');
    expect(boite.textContent).toContain('«\u00a0Publier le guide\u00a0» a déjà 2 sous-objectifs');
    expect(screen.getByRole('radio', { name: 'Développer mon activité' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByRole('radio', { name: 'Aucun, objectif principal' })).toHaveProperty(
      'disabled',
      false,
    );

    await userEvent.click(within(boite).getByRole('button', { name: 'Compris' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('UT-COMP-US-023-03 un refus rendu par le cas d’usage est expliqué ; « Compris » demande au magasin de l’effacer', async () => {
    const proprietes = proprietesSelecteur();
    render(
      <SelecteurParent
        {...proprietes}
        refus={{
          code: 'ERR-030',
          variante: 'cible-est-sous-objectif',
          variables: { element: 'Version imprimable' },
        }}
      />,
    );

    const boite = screen.getByRole('alertdialog');
    expect(boite.dataset['variante']).toBe('cible-est-sous-objectif');
    await userEvent.click(within(boite).getByRole('button', { name: 'Compris' }));
    expect(proprietes.surRefusCompris).toHaveBeenCalledTimes(1);
  });
});

const afficher = (banc: BancObjectifs) => render(<EspaceObjectifs magasin={banc.magasin} />);
const ligne = (nom: RegExp) => screen.findByRole('button', { name: nom });
const ouvrirDetail = async (nom: RegExp, titre: string) => {
  await userEvent.click(await ligne(nom));
  await screen.findByRole('heading', { level: 1, name: titre });
};

describe('Sous-objectifs dans l’espace des objectifs (ECR-003 D, E ; ECR-008 A)', () => {
  it('UT-COMP-US-023-04 « Ajouter » crée un sous-objectif sous l’objectif principal ouvert et reste sur son détail', async () => {
    const banc = creerBancObjectifs();
    await banc.creer('Publier le guide', '2026-12-15');
    afficher(banc);
    await ouvrirDetail(/^Publier le guide/, 'Publier le guide');

    await ouvrir('Modal', () => cliquerBoutonIon('Ajouter'));
    await saisir('Intitulé', 'Version imprimable');
    await cliquerBoutonIon('Créer le sous-objectif');

    const section = (await screen.findByRole('heading', { name: 'Sous-objectifs' })).parentElement;
    if (section === null) throw new Error('Section des sous-objectifs absente');
    await within(section).findByRole('button', { name: /^Version imprimable/ });
    expect(screen.getByRole('heading', { level: 1, name: 'Publier le guide' })).toBeTruthy();
  });

  it('UT-COMP-US-023-05 un sous-objectif n’offre pas « Ajouter » (absent) ; « Placer sous un autre objectif » (menu « … ») le rend principal', async () => {
    const banc = creerBancObjectifs();
    const parent = await banc.creer('Publier le guide');
    valeurDe(
      await banc.services.creerSousObjectif.executer({
        parentId: parent,
        intitule: 'Version imprimable',
      }),
    );
    afficher(banc);
    await ouvrirDetail(/^Publier le guide/, 'Publier le guide');
    await userEvent.click(await ligne(/^Version imprimable/));
    await screen.findByRole('heading', { level: 1, name: 'Version imprimable' });
    expect(screen.queryByRole('button', { name: 'Ajouter' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Sous-objectifs' })).toBeNull();

    await ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
    await choixDuMenu('Placer sous un autre objectif');
    await userEvent.click(await screen.findByRole('radio', { name: 'Aucun, objectif principal' }));
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }));

    await waitFor(() => {
      expect(screen.queryByRole('radio')).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByText('Objectif principal')).toBeTruthy();
    });
    expect(screen.queryByText(/^Sous-objectif de/)).toBeNull();
  });
});

describe('Magasin des objectifs — sous-objectifs (US-023 CA-5, CA-6)', () => {
  it('UT-COMP-US-023-06 placer — un refus ERR-030 garde le sélecteur ouvert avec l’explication ; un placement valide le referme', async () => {
    const banc = creerBancObjectifs();
    const parent = await banc.creer('Publier le guide');
    const autre = await banc.creer('Développer mon activité');
    valeurDe(
      await banc.services.creerSousObjectif.executer({ parentId: parent, intitule: 'Sous' }),
    );
    const { actions } = banc.magasin.getState();

    await actions.ouvrirSelecteurParent(parent);
    expect(banc.magasin.getState().selecteurParent?.modele.messageBloquant?.code).toBe('ERR-030');

    const refus = await actions.placer(parent, { type: 'OBJECTIF', id: autre });
    expect(refus.type).toBe('REFUSEE');
    expect(banc.magasin.getState().selecteurParent?.refus).toMatchObject({
      code: 'ERR-030',
      variante: 'objectif-a-des-sous-objectifs',
    });
    actions.effacerRefusPlacement();
    expect(banc.magasin.getState().selecteurParent?.refus).toBeUndefined();

    await actions.ouvrirSelecteurParent(autre);
    expect((await actions.placer(autre, { type: 'OBJECTIF', id: parent })).type).toBe('FAITE');
    expect(banc.magasin.getState().selecteurParent).toBeUndefined();
  });

  it('UT-COMP-US-023-07 effacerRefusPlacement sans sélecteur ouvert est sans effet ; fermerSelecteurParent le referme ; un objectif introuvable ne l’ouvre pas', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('Guide');
    const { actions } = banc.magasin.getState();

    actions.effacerRefusPlacement();
    expect(banc.magasin.getState().selecteurParent).toBeUndefined();
    await actions.ouvrirSelecteurParent(idObjectif(99));
    expect(banc.magasin.getState().selecteurParent).toBeUndefined();
    await actions.ouvrirSelecteurParent(id);
    actions.fermerSelecteurParent();
    expect(banc.magasin.getState().selecteurParent).toBeUndefined();
  });

  it('UT-COMP-US-023-08 creerSousObjectif — rend l’identifiant ; un parent introuvable est refusé sans message', async () => {
    const banc = creerBancObjectifs();
    const parent = await banc.creer('Guide');
    const { actions } = banc.magasin.getState();

    expect((await actions.creerSousObjectif(parent, { intitule: 'Sous' })).type).toBe('FAITE');
    expect(await actions.creerSousObjectif(idObjectif(99), { intitule: 'Sous' })).toEqual({
      type: 'REFUSEE',
      messages: [],
    });
  });
});
