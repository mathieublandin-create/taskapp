/**
 * ST-US-031 v0.4 §4.2, §8 (rang 13, tranche B1) ; RL-LOT-001-A6, hypothèse H-031-1. `VerrouOngletsWeb` sans
 * `LockManager` (API absente) : exécution sans verrou, onglet meneur d'office, une seule entrée `erreur` ; sur un
 * `LockManager` simulé : options de `request`, demande abandonnée sans rejet non traité. Le comportement nominal est
 * couvert par le contrat (CT-VER-01 à 07).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VerrouOngletsWeb } from '@src/synchronisation/infrastructure/verrou-onglets-web';
import { RegistreVerrousSimule } from '@tests/doublures/lock-manager-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { barriere, vider } from '@tests/support/synchronisation/onglets';

const NOM = 'donejuan-recette-3f5a9c0e:synchronisation-meneur';
const ENTREE_INDISPONIBLE = {
  niveau: 'erreur',
  evenement: 'VerrouOngletsIndisponible',
} as const;

const rejetsNonTraites: Array<unknown> = [];
const surRejet = (motif: unknown): void => {
  rejetsNonTraites.push(motif);
};

beforeEach(() => {
  rejetsNonTraites.length = 0;
  process.on('unhandledRejection', surRejet);
});

afterEach(() => {
  process.off('unhandledRejection', surRejet);
});

describe('VerrouOngletsWeb sans navigator.locks (RL-LOT-001-A6)', () => {
  it('UT-US-031-10 API absente — tâche exécutée directement (valeur et erreur telles quelles), main obtenue d’office, jamais tenu, une seule entrée erreur', async () => {
    const journal = new JournalEnMemoire();
    const verrou = new VerrouOngletsWeb({ gestionnaire: undefined, journal });
    const erreur = new Error('panne');
    const obtenues: Array<string> = [];

    expect(await verrou.executerExclusivement(NOM, () => Promise.resolve('fait'))).toBe('fait');
    await expect(verrou.executerExclusivement(NOM, () => Promise.reject(erreur))).rejects.toBe(
      erreur,
    );
    verrou.demanderLaMain(NOM, () => obtenues.push('main'));
    expect(obtenues).toEqual([]);
    await vider();
    expect(obtenues).toEqual(['main']);
    expect(await verrou.estTenu(NOM)).toBe(false);

    const rendre = verrou.demanderLaMain(NOM, () => obtenues.push('abandonnee'));
    rendre();
    rendre();
    await vider();
    expect(obtenues).toEqual(['main']);
    expect(journal.entrees).toEqual([ENTREE_INDISPONIBLE]);
  });
});

describe('VerrouOngletsWeb sur un LockManager simulé', () => {
  it('UT-US-031-10 request — mode exclusif ; une demande abandonnée (AbortError) est absorbée : aucun rejet non traité, aucune entrée de journal', async () => {
    const registre = new RegistreVerrousSimule();
    const gestionnaire = registre.client('client-1');
    const journal = new JournalEnMemoire();
    const verrou = new VerrouOngletsWeb({ gestionnaire, journal });
    const autre = new VerrouOngletsWeb({ gestionnaire: registre.client('client-2'), journal });
    const fin = barriere();
    const tenue = autre.executerExclusivement(NOM, () => fin.promesse);
    await vider();

    const obtenues: Array<string> = [];
    const rendre = verrou.demanderLaMain(NOM, () => obtenues.push('jamais'));
    await vider();
    expect(registre.demandes).toBe(2);
    expect((await gestionnaire.query()).pending).toEqual([
      { name: NOM, mode: 'exclusive', clientId: 'client-1' },
    ]);

    rendre();
    await vider();
    fin.ouvrir();
    await tenue;
    await vider();

    expect((await gestionnaire.query()).pending).toEqual([]);
    expect((await gestionnaire.query()).held).toEqual([]);
    expect(obtenues).toEqual([]);
    expect(rejetsNonTraites).toEqual([]);
    expect(journal.entrees).toEqual([]);
  });
});
