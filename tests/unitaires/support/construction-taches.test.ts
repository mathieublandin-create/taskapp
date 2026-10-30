/**
 * Construction des contextes de tâches (ST-US-002 §12.1, H-7) : (a) tâches à faire créées dans l'ordre, avec leurs
 * objectifs ; (b) estimation technique de 30 min pour une tâche parente sans estimation ; (c) incohérence refusée.
 */
import { DataTable } from '@cucumber/cucumber';
import { describe, expect, it } from 'vitest';
import { BancSynchro } from '@tests/support/banc/banc-synchro';
import { connecter } from '@tests/support/compte/etapes-compte';
import {
  lObjectifAUnNombreDeTaches,
  lesTachesSuivantes,
  lireLignesContexte,
  separerIntitules,
} from '@tests/support/construction-taches';
import type { MondeDoneJuan } from '@tests/support/monde';
import { objectifsDe } from '@tests/support/objectifs';
import { References } from '@tests/support/references';
import { valeurDe } from '@tests/support/environnement';

const COLONNES = ['intitulé', 'état', 'délai', 'estimation', 'objectifs', 'tâche parente'] as const;

const tableau = (...lignes: ReadonlyArray<ReadonlyArray<string>>) =>
  lireLignesContexte(new DataTable([[...COLONNES], ...lignes.map((l) => [...l])]));

const contexte = async () => {
  const monde = {
    banc: new BancSynchro(),
    references: new References(),
  } as unknown as MondeDoneJuan;
  const appareil = monde.banc.appareil('smartphone');
  await connecter(monde, appareil, 'A');
  return { monde, appareil };
};

describe('Construction des tableaux de contexte (H-7)', () => {
  it('UT-COMP-US-002-30 lireLignesContexte — lit les colonnes, sépare les objectifs et refuse un état inconnu', () => {
    const [ligne] = tableau(['Chapitre 1', 'à faire', '2026-11-30', '2 h', 'A, B', '']);

    expect(ligne).toMatchObject({ intitule: 'Chapitre 1', etat: 'à faire', objectifs: ['A', 'B'] });
    expect(separerIntitules('')).toEqual([]);
    expect(() => tableau(['X', 'en cours', '2026-11-30', '1 h', '', ''])).toThrow(/État inconnu/);
  });

  it('UT-COMP-US-002-31 lesTachesSuivantes (a) — crée les tâches à faire dans l’ordre du tableau, avec leurs objectifs', async () => {
    const { monde, appareil } = await contexte();
    const { creerObjectif, consulterTaches } = await objectifsDe(appareil);
    valeurDe(await creerObjectif.executer({ intitule: 'Publier le guide' }));

    await lesTachesSuivantes(
      { monde, appareil },
      tableau(
        ['Plan', 'à faire', '2026-11-10', '1 h', 'Publier le guide', ''],
        ['Payer', 'à faire', '2026-10-19', '30 min', '', ''],
      ),
    );

    const { taches } = valeurDe(await consulterTaches.executer());
    expect(taches.map((t) => [t.intitule, t.estimation, t.objectifs.length])).toEqual(
      expect.arrayContaining([
        ['Plan', 60, 1],
        ['Payer', 30, 0],
      ]),
    );
  });

  it('UT-COMP-US-002-32 lesTachesSuivantes (b) — une ligne sans estimation qui n’est la tâche parente d’aucune autre fait échouer l’étape', async () => {
    const { monde, appareil } = await contexte();

    await expect(
      lesTachesSuivantes(
        { monde, appareil },
        tableau(['Plan', 'à faire', '2026-11-10', '', '', '']),
      ),
    ).rejects.toThrow(/Estimation absente/);
  });

  it('UT-COMP-US-002-33 lesTachesSuivantes (c) — une sous-tâche à faire sous une tâche parente terminée est une incohérence ; les capacités des rangs suivants ne sont pas encore livrées', async () => {
    const { monde, appareil } = await contexte();
    const incoherent = tableau(
      ['Chapitre 1', 'terminée', '2026-11-30', '', '', ''],
      ['Section A', 'à faire', '2026-11-20', '1 h', '', 'Chapitre 1'],
    );

    await expect(lesTachesSuivantes({ monde, appareil }, incoherent)).rejects.toThrow(
      /Incohérence/,
    );
    await expect(
      lesTachesSuivantes(
        { monde, appareil },
        tableau(
          ['Chapitre 1', 'à faire', '2026-11-30', '', '', ''],
          ['Section A', 'à faire', '2026-11-20', '1 h', '', 'Chapitre 1'],
        ),
      ),
    ).rejects.toThrow(/capacité livrée au rang 6/);
    await expect(
      lesTachesSuivantes(
        { monde, appareil },
        tableau(['Plan', 'terminée', '2026-11-10', '1 h', '', '']),
      ),
    ).rejects.toThrow(/capacité livrée au rang 7/);
    await expect(
      lesTachesSuivantes(
        { monde, appareil },
        tableau(['Logo', 'abandonnée', '2026-11-10', '1 h', '', '']),
      ),
    ).rejects.toThrow(/capacité livrée au rang 8/);
  });

  it('UT-COMP-US-002-34 lObjectifAUnNombreDeTaches — crée les tâches « <objectif> — tâche <n> » rattachées à l’objectif, à 7 jours, 1 h', async () => {
    const { monde, appareil } = await contexte();
    const { creerObjectif, consulterTaches } = await objectifsDe(appareil);
    valeurDe(await creerObjectif.executer({ intitule: 'Santé' }));

    await lObjectifAUnNombreDeTaches({ monde, appareil }, 'Santé', {
      aFaire: 2,
      terminees: 0,
      abandonnees: 0,
    });
    await expect(
      lObjectifAUnNombreDeTaches({ monde, appareil }, 'Santé', {
        aFaire: 0,
        terminees: 1,
        abandonnees: 0,
      }),
    ).rejects.toThrow(/rang 7/);

    const { taches } = valeurDe(await consulterTaches.executer());
    expect(taches.map((t) => [t.intitule, t.estimation])).toEqual(
      expect.arrayContaining([
        ['Santé — tâche 1', 60],
        ['Santé — tâche 2', 60],
      ]),
    );
  });
});
