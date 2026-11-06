/**
 * RC-ANO-002-003-1 : barre d'onglets et navigation entre les espaces Tâches et Objectifs (guide §4.14), « Voir … » de
 * la section « À lire » et ouverture d'une tâche depuis le détail d'un objectif, sur les vrais cas d'usage.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { valeurDe } from '@tests/support/environnement';
import {
  EcransObjectifs,
  useNavigation,
} from '@src/objectifs-taches/presentation/ui/ecrans/espaces';
import { creerBancObjectifs, nettoyerDocument } from '@tests/support/ui-objectifs';
import { date } from '@tests/support/valeurs';
import type { RefElementMetier } from '@src/synchronisation';

afterEach(nettoyerDocument);

const demandes: { tache: RefElementMetier; objectif: RefElementMetier } = {
  tache: { type: 'TACHE', id: '' as never },
  objectif: { type: 'OBJECTIF', id: '' as never },
};

/** Hôte minimal : la navigation de main.tsx et deux boutons qui jouent « Voir … ». */
const Hote = ({ banc }: { readonly banc: ReturnType<typeof creerBancObjectifs> }) => {
  const { voir, ...navigation } = useNavigation();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          voir(demandes.tache);
        }}
      >
        Voir la tâche
      </button>
      <button
        type="button"
        onClick={() => {
          voir(demandes.objectif);
        }}
      >
        Voir l’objectif
      </button>
      <EcransObjectifs objectifs={banc.services} navigation={navigation} />
    </>
  );
};

const onglet = (nom: string) =>
  within(screen.getByRole('navigation', { name: 'Espaces' })).getByRole('button', { name: nom });
const ongletCourant = async (nom: string): Promise<void> => {
  await waitFor(() => {
    expect(onglet(nom).getAttribute('aria-current')).toBe('page');
  });
};

describe('Espaces et barre d’onglets (RC-ANO-002-003-1)', () => {
  it('UT-COMP-US-002-191 l’onglet actif porte aria-current ; « Voir … » et l’ouverture d’une tâche depuis un objectif changent d’onglet et ouvrent le détail', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const tacheId = valeurDe(
      await banc.services.creerTache.executer({
        intitule: 'Chapitre 1',
        delai: date('2026-11-30'),
        estimationMinutes: 60,
        objectifIds: [objectifId],
      }),
    );
    demandes.tache = { type: 'TACHE', id: tacheId };
    demandes.objectif = { type: 'OBJECTIF', id: objectifId };
    render(<Hote banc={banc} />);

    await ongletCourant('Tâches');
    expect(onglet('Objectifs').getAttribute('aria-current')).toBeNull();
    await userEvent.click(onglet('Objectifs'));
    await ongletCourant('Objectifs');
    expect(onglet('Tâches').getAttribute('aria-current')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Voir la tâche' }));
    await ongletCourant('Tâches');
    await screen.findByRole('heading', { level: 1, name: 'Chapitre 1' });

    await userEvent.click(screen.getByRole('button', { name: 'Voir l’objectif' }));
    await ongletCourant('Objectifs');
    await screen.findByRole('heading', { level: 1, name: 'Publier le guide' });

    const ligne = await screen.findByRole('button', { name: /^Chapitre 1, à faire/u });
    await userEvent.click(ligne);
    await ongletCourant('Tâches');
    await screen.findByRole('heading', { level: 1, name: 'Chapitre 1' });
  });
});
