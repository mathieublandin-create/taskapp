/**
 * Composants d'US-002 (ST-US-002 §14) : TaskRow, DurationStepper, FieldRow / LockedField, QuickAdd (erreurs cumulées,
 * focus sur le premier défaut, saisie conservée), filtres et puces.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ChampDetail,
  ChampVerrouille,
} from '@src/objectifs-taches/presentation/ui/composants/champ-detail';
import {
  FiltreEtatUi,
  FiltreObjectifUi,
} from '@src/objectifs-taches/presentation/ui/composants/filtre-etat';
import { LigneTacheUi } from '@src/objectifs-taches/presentation/ui/composants/ligne-tache';
import { PucesObjectif } from '@src/objectifs-taches/presentation/ui/composants/puces-objectif';
import { SaisieRapide } from '@src/objectifs-taches/presentation/ui/composants/saisie-rapide';
import { SelecteurDuree } from '@src/objectifs-taches/presentation/ui/composants/selecteur-duree';
import type { IssueTache } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { construireFormulaireTache } from '@src/objectifs-taches/presentation/modeles-de-vue/formulaire-tache';
import { construireLigneTache } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-tache';
import { resumeTache } from '@tests/support/fabriques/resumes';
import {
  apresFermeture,
  cliquerBoutonIon,
  nettoyerDocument,
  renseigner,
} from '@tests/support/ui-objectifs';
import { date, idObjectif, idTache } from '@tests/support/valeurs';

afterEach(nettoyerDocument);

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const OBJECTIFS = [
  { id: O1, intitule: 'Publier le guide' },
  { id: O2, intitule: 'Écrire' },
];

describe('SelecteurDuree (DurationStepper)', () => {
  it('UT-COMP-US-002-70 spinbutton — « — » tant que rien n’est saisi, premier pas à 30 min, pas de 30 min, minimum 30 min, annonce en toutes lettres', async () => {
    const surChanger = vi.fn();
    const { rerender } = render(
      <SelecteurDuree nom="Estimation" valeur={undefined} surChanger={surChanger} />,
    );
    const champ = screen.getByRole('spinbutton', { name: 'Estimation' });
    expect(champ.textContent).toBe('—');
    expect(champ.hasAttribute('aria-valuenow')).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    expect(surChanger).toHaveBeenLastCalledWith(30);

    rerender(<SelecteurDuree nom="Estimation" valeur={90} surChanger={surChanger} />);
    expect(champ.textContent).toBe('1 h 30');
    expect(champ.getAttribute('aria-valuetext')?.replace(/\s/gu, ' ')).toBe('1 heure 30 minutes');
    champ.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(surChanger).toHaveBeenLastCalledWith(120);
    await userEvent.keyboard('{PageDown}');
    expect(surChanger).toHaveBeenLastCalledWith(30);
    await userEvent.click(screen.getByRole('button', { name: 'Moins 30 minutes' }));
    expect(surChanger).toHaveBeenLastCalledWith(60);
    await userEvent.keyboard('{Home}');
    expect(surChanger).toHaveBeenCalledTimes(4);
  });
});

describe('Ligne, champs, filtres et puces', () => {
  it('UT-COMP-US-002-71 LigneTacheUi — nom accessible complet, mentions écrites, une seule puce d’objectif puis « +n », ouverture au clic', async () => {
    const surOuvrir = vi.fn();
    const ligne = construireLigneTache(
      resumeTache({
        id: idTache(1),
        intitule: 'Relire',
        enRetard: true,
        enAttente: true,
        sousTaches: { terminees: 1, nonAbandonnees: 3 },
        objectifs: OBJECTIFS,
        alertes: [
          {
            type: 'OBJECTIFS',
            objectifs: [{ id: O1, intitule: 'Publier le guide', delai: date('2026-11-20') }],
          },
        ],
      }),
      date('2026-10-21'),
    );
    render(
      <ul>
        <LigneTacheUi ligne={ligne} surOuvrir={surOuvrir} />
      </ul>,
    );

    const bouton = screen.getByRole('button', { name: /^Relire, à faire, délai /u });
    expect(
      document.getElementById(bouton.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toBe('Modification en attente d’envoi');
    expect(bouton.textContent).toContain('Publier le guide +1');
    expect(bouton.textContent).toContain('1/3');
    expect(bouton.textContent).toContain('En retard');
    expect(bouton.textContent).toContain('après le délai de l’objectif');
    await userEvent.click(bouton);
    expect(surOuvrir).toHaveBeenCalledWith(ligne);
  });

  it('UT-COMP-US-002-96 LigneTacheUi — une ligne de sous-tâche n’affiche aucune puce d’objectif (guide §6.6.4)', () => {
    const ligne = construireLigneTache(
      resumeTache({
        id: idTache(2),
        intitule: 'Section A',
        objectifs: [{ id: O1, intitule: 'Publier le guide' }],
        objectifsHerites: true,
      }),
      date('2026-10-21'),
    );
    render(
      <ul>
        <LigneTacheUi ligne={ligne} niveau="SOUS_TACHE" surOuvrir={vi.fn()} />
      </ul>,
    );

    expect(document.querySelector('.ligne-tache-objectifs')).toBeNull();
  });

  it('UT-COMP-US-002-72 ChampDetail et ChampVerrouille — « Modifier » ouvre l’éditeur ; un champ verrouillé explique pourquoi et n’a pas de bouton', async () => {
    const surEditer = vi.fn();
    const { rerender } = render(
      <ChampDetail
        nom="Délai"
        valeur="30 nov."
        surEditer={surEditer}
        editeur={<input aria-label="éditeur" />}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Délai' }));
    expect(surEditer).toHaveBeenCalled();
    expect(screen.queryByLabelText('éditeur')).toBeNull();

    rerender(
      <ChampDetail
        nom="Délai"
        valeur="30 nov."
        enEdition
        editeur={<input aria-label="éditeur" />}
        surEditer={surEditer}
      />,
    );
    expect(screen.getByLabelText('éditeur')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Modifier Délai' })).toBeNull();

    rerender(
      <ChampVerrouille
        nom="Estimation"
        valeur="2 h"
        verrou={{ code: 'MEN-ESTIMATION-CALCULEE', libelle: 'Somme des sous-tâches' }}
      />,
    );
    expect(screen.getByText('Somme des sous-tâches')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('UT-COMP-US-002-73 filtres et puces — l’état actif est écrit (aria-pressed) ; choisir un filtre ou basculer une puce appelle l’écran', async () => {
    const surEtat = vi.fn();
    const surObjectif = vi.fn();
    const surBasculer = vi.fn();
    render(
      <>
        <FiltreEtatUi etat="A_FAIRE" surChoisir={surEtat} />
        <FiltreObjectifUi
          filtre={{ type: 'OBJECTIF', id: O1 }}
          objectifs={OBJECTIFS}
          surChoisir={surObjectif}
        />
        <PucesObjectif
          nom="Objectifs"
          objectifs={OBJECTIFS}
          selection={[O2]}
          surBasculer={surBasculer}
        />
      </>,
    );

    expect(screen.getByRole('button', { name: 'À faire' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'Terminées' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Abandonnées' }));
    expect(surEtat).toHaveBeenCalledWith('ABANDONNEE');
    const filtre = screen.getByRole('group', { name: 'Filtrer par objectif' });
    expect(filtre.querySelector('[aria-pressed="true"]')?.textContent).toBe('Publier le guide');
    await userEvent.click(screen.getByRole('button', { name: 'Sans objectif' }));
    expect(surObjectif).toHaveBeenCalledWith({ type: 'SANS_OBJECTIF' });
    const puces = screen.getByRole('group', { name: 'Objectifs' });
    await userEvent.click(within(puces).getByRole('button', { name: 'Publier le guide' }));
    expect(surBasculer).toHaveBeenCalledWith(O1);
  });
});

describe('SaisieRapide (QuickAdd)', () => {
  const REFUS: IssueTache = {
    type: 'REFUSEE',
    messages: [
      { code: 'ERR-020', variables: {} },
      { code: 'ERR-021', variables: {} },
      { code: 'ERR-022', variables: {} },
    ],
  };

  const afficher = async (surValider: () => Promise<IssueTache>, objectifPreRempli = O1) => {
    const proprietes = {
      formulaire: construireFormulaireTache({ objectifPreRempli }),
      objectifs: OBJECTIFS,
      surValider,
      surFermee: vi.fn(),
      registre: { declarer: vi.fn() },
    };
    const rendu = render(<SaisieRapide ouverte {...proprietes} />);
    await screen.findByRole('form', { name: 'Nouvelle tâche' });
    return async () => {
      const fermee = apresFermeture('Modal');
      rendu.rerender(<SaisieRapide ouverte={false} {...proprietes} />);
      await fermee;
    };
  };

  it('UT-COMP-US-002-74 « Ajouter » reste actif ; les défauts sont cumulés sous leurs champs, le focus va au premier, la saisie est conservée ; l’objectif du contexte est pré-sélectionné, rien d’autre', async () => {
    const surValider = vi.fn(() => Promise.resolve(REFUS));
    const fermer = await afficher(surValider);

    expect(
      screen.getByRole('button', { name: 'Publier le guide' }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByRole('button', { name: 'Écrire' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
    expect(screen.getByRole('spinbutton').textContent).toBe('—');
    await renseigner('Intitulé', 'Relire');
    await cliquerBoutonIon('Ajouter');

    await waitFor(() => {
      expect(document.querySelectorAll('[data-message]')).toHaveLength(3);
    });
    expect(
      Array.from(document.querySelectorAll('[data-message]')).map((n) =>
        n.getAttribute('data-message'),
      ),
    ).toEqual(['ERR-020', 'ERR-021', 'ERR-022']);
    expect(surValider).toHaveBeenCalledWith({ intitule: 'Relire', objectifIds: [O1] });
    expect(document.querySelector<HTMLIonInputElement>('ion-input')?.value).toBe('Relire');
    await fermer();
  });

  it('UT-COMP-US-002-75 une saisie valide est transmise, puis la feuille reste ouverte et vide avec « Ajoutée à Tâches »', async () => {
    const surValider = vi.fn((): Promise<IssueTache> => Promise.resolve({ type: 'FAITE' }));
    const fermer = await afficher(surValider);

    await renseigner('Intitulé', 'Relire');
    await renseigner(/^Délai/u, '2026-11-30');
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await cliquerBoutonIon('Ajouter');

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('Ajoutée à Tâches');
    });
    expect(surValider).toHaveBeenCalledWith({
      intitule: 'Relire',
      delai: '2026-11-30',
      estimationMinutes: 60,
      objectifIds: [O1],
    });
    expect(screen.getByRole('spinbutton').textContent).toBe('—');
    await fermer();
  });
});
