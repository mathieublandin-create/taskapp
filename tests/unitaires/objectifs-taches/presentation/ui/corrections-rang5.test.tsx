/**
 * Corrections de la revue E13 du rang 5 (revue-code-LOT-001-rang5.md) : focus et état d'erreur de l'estimation en
 * saisie rapide (RC-US-002-1), refus du détail affichés (RC-US-002-2), rattachement par identifiant (RC-US-002-3).
 * Tests complémentaires.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import { SaisieRapide } from '@src/objectifs-taches/presentation/ui/composants/saisie-rapide';
import { construireFormulaireTache } from '@src/objectifs-taches/presentation/modeles-de-vue/formulaire-tache';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import type { IssueTache } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { valeurDe } from '@tests/support/environnement';
import { date } from '@tests/support/valeurs';
import {
  choixDuMenu,
  cliquerBoutonIon,
  creerBancObjectifs,
  nettoyerDocument,
  ouvrir,
  saisir,
} from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

describe('SaisieRapide — première erreur sur l’estimation (RC-US-002-1)', () => {
  it('UT-COMP-US-002-87 intitulé et délai valides, estimation absente : le focus va au spinbutton, qui porte aria-invalid ; les champs valides ne sont pas signalés', async () => {
    const refus: IssueTache = {
      type: 'REFUSEE',
      messages: [{ code: 'ERR-022', variables: {} }],
    };
    render(
      <SaisieRapide
        ouverte
        formulaire={construireFormulaireTache({})}
        objectifs={[]}
        surValider={() => Promise.resolve(refus)}
        surFermee={vi.fn()}
        registre={{ declarer: vi.fn() }}
      />,
    );
    await screen.findByRole('form', { name: 'Nouvelle tâche' });
    await saisir('Intitulé', 'Relire');
    await saisir(/^Délai/u, '2026-11-30');
    await cliquerBoutonIon('Ajouter');

    const estimation = await screen.findByRole('spinbutton');
    await waitFor(() => {
      expect(document.activeElement).toBe(estimation);
    });
    expect(estimation.getAttribute('aria-invalid')).toBe('true');
    const champs = Array.from(document.querySelectorAll('ion-input'));
    expect(
      champs.map((c) => c.querySelector('input')?.getAttribute('aria-invalid') ?? null),
    ).toEqual([null, null]);
  });

  it('UT-COMP-US-002-88 intitulé et délai en erreur : aria-invalid sur ces deux champs, pas sur l’estimation saisie', async () => {
    const refus: IssueTache = {
      type: 'REFUSEE',
      messages: [
        { code: 'ERR-020', variables: {} },
        { code: 'ERR-021', variables: {} },
      ],
    };
    render(
      <SaisieRapide
        ouverte
        formulaire={construireFormulaireTache({})}
        objectifs={[]}
        surValider={() => Promise.resolve(refus)}
        surFermee={vi.fn()}
        registre={{ declarer: vi.fn() }}
      />,
    );
    await screen.findByRole('form', { name: 'Nouvelle tâche' });
    await userEvent.click(screen.getByRole('button', { name: 'Plus 30 minutes' }));
    await cliquerBoutonIon('Ajouter');

    await waitFor(() => {
      const champs = Array.from(document.querySelectorAll('ion-input'));
      expect(champs.map((c) => c.querySelector('input')?.getAttribute('aria-invalid'))).toEqual([
        'true',
        'true',
      ]);
    });
    expect(screen.getByRole('spinbutton').hasAttribute('aria-invalid')).toBe(false);
  });
});

const tacheDe = async (
  banc: ReturnType<typeof creerBancObjectifs>,
  objectifIds: ReadonlyArray<IdObjectif>,
) =>
  valeurDe(
    await banc.services.creerTache.executer({
      intitule: 'Rédiger',
      delai: date('2026-11-30'),
      estimationMinutes: 60,
      objectifIds,
    }),
  );

describe('Détail d’une tâche — refus affichés et objectifs homonymes (RC-US-002-2, RC-US-002-3)', () => {
  it('UT-COMP-US-002-89 renommer en « ␣␣ » : ERR-020 est affiché et l’éditeur reste ouvert ; un nom valide le ferme', async () => {
    const banc = creerBancObjectifs();
    await tacheDe(banc, []);
    render(<EspaceTaches magasin={creerMagasinTaches(banc.services)} />);
    await userEvent.click(await screen.findByRole('button', { name: /^Rédiger, à faire/u }));
    await screen.findByRole('heading', { level: 1, name: 'Rédiger' });

    await ouvrir('ActionSheet', () => userEvent.click(screen.getByText('…')));
    await choixDuMenu('Renommer la tâche');
    const champ = await screen.findByLabelText('Renommer la tâche');
    await userEvent.clear(champ);
    await userEvent.type(champ, '  ');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(document.querySelector('[data-message="ERR-020"]')).not.toBeNull();
    });
    expect(screen.getByLabelText('Renommer la tâche')).toBeTruthy();

    await userEvent.clear(screen.getByLabelText('Renommer la tâche'));
    await userEvent.type(screen.getByLabelText('Renommer la tâche'), 'Relire');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await screen.findByRole('heading', { level: 1, name: 'Relire' });
    // Le titre peut être rafraîchi par l'observation du dépôt (DT-009) avant que l'issue de la commande ne ferme
    // l'éditeur : la fermeture s'attend, elle ne se constate pas dans la foulée (E13 2e tour, instabilité).
    await waitFor(() => {
      expect(screen.queryByLabelText('Renommer la tâche')).toBeNull();
    });
    expect(document.querySelector('[data-message]')).toBeNull();
  });

  it('UT-COMP-US-002-90 deux objectifs homonymes : seule la puce de l’objectif rattaché est pressée, et un geste agit sur l’objectif cliqué', async () => {
    const banc = creerBancObjectifs();
    const premier = await banc.creer('Doublon');
    const second = await banc.creer('Doublon');
    const magasin = creerMagasinTaches(banc.services);
    const id = await tacheDe(banc, [second]);
    await magasin.getState().actions.ouvrirDetail(id);
    render(<EspaceTaches magasin={magasin} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Modifier Objectifs' }));
    const puces = await screen.findAllByRole('button', { name: 'Doublon' });
    expect(puces.map((p) => p.getAttribute('aria-pressed'))).toEqual(['false', 'true']);

    const [cliquee] = puces;
    if (cliquee === undefined) throw new Error('Puce absente');
    await userEvent.click(cliquee);
    await waitFor(() => {
      expect(magasin.getState().detail?.objectifs.ids).toEqual(
        expect.arrayContaining([premier, second]),
      );
    });
    expect(magasin.getState().detail?.objectifs.ids).toHaveLength(2);
  });
});
