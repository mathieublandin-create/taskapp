/**
 * ST-US-031 v0.4 §6.1 (rang 13, tranche B2) ; DAT v0.11.12 §4.1.6 (Q-ST031-STA-1, Q-ST031-STA-2) ; guide §6.4 (deux
 * onglets : reprise sans message). `CoordinationOnglets` sur la doublure `VerrouOngletsEnMemoire` (un profil, plusieurs
 * onglets), un cycle espion et un accès commandable par onglet.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  CoordinationOnglets,
  type EtatCoordination,
} from '@src/synchronisation/application/coordination-onglets';
import type { IssueCycle } from '@src/synchronisation/application/cycle-synchronisation';
import type { EtatAccesGoogle } from '@src/synchronisation/application/ports/acces-google';
import { VerrouOngletsEnMemoire } from '@tests/doublures/verrou-onglets-memoire';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { AccesCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { vider } from '@tests/support/synchronisation/onglets';

const ESPACE = 'donejuan-recette-3f5a9c0e';
const MENEUR = `${ESPACE}:synchronisation-meneur`;
const ENTREE_MENEUR = { niveau: 'info', evenement: 'OngletMeneur' } as const;

const est = (role: EtatCoordination['role'], autreMeneur: boolean): EtatCoordination => ({
  role,
  autreMeneur,
});

const preparer = () => {
  const verrous = new VerrouOngletsEnMemoire();
  const traces: Array<string> = [];
  const onglet = (
    nom: string,
    accesInitial: EtatAccesGoogle = 'VALIDE',
    synchroniser: () => Promise<IssueCycle> = () => Promise.resolve('TERMINE'),
  ) => {
    const verrou = verrous.onglet();
    const acces = new AccesCommandable(accesInitial);
    const journal = new JournalEnMemoire();
    const cycle = {
      demarrer: vi.fn(() => {
        traces.push(`${nom}:demarrer`);
      }),
      arreter: vi.fn(() => {
        traces.push(`${nom}:arreter`);
      }),
      synchroniserMaintenant: vi.fn(() => {
        traces.push(`${nom}:synchroniser`);
        return synchroniser();
      }),
    };
    const coordination = new CoordinationOnglets({
      verrou,
      cycle,
      acces,
      nomEspace: ESPACE,
      journal,
    });
    const notifications = { nombre: 0 };
    coordination.observer(() => {
      notifications.nombre += 1;
    });
    return { verrou, acces, journal, cycle, coordination, notifications };
  };
  const tracesDe = (nom: string) => traces.filter((t) => t.startsWith(`${nom}:`));
  return { verrous, traces, tracesDe, onglet };
};

describe('CoordinationOnglets — onglet meneur (ST-US-031 §6.1)', () => {
  it('UT-US-031-01 premier onglet, accès VALIDE — MENEUR : cycle démarré puis un cycle d’ouverture, une seule entrée info, une notification', async () => {
    const env = preparer();
    const a = env.onglet('a');

    a.coordination.demarrer();
    expect(env.traces).toEqual([]);
    await vider();

    expect(env.traces).toEqual(['a:demarrer', 'a:synchroniser']);
    expect(await a.coordination.etat()).toEqual(est('MENEUR', false));
    expect(env.verrous.detenteur(MENEUR)).toBe(a.verrou.id);
    expect(a.journal.entrees).toEqual([ENTREE_MENEUR]);
    expect(a.notifications.nombre).toBe(1);
  });

  it('UT-US-031-01 cycle d’ouverture rejeté — journal erreur SynchronisationInterrompue (nom de l’erreur), le rôle reste MENEUR', async () => {
    const env = preparer();
    const a = env.onglet('a', 'VALIDE', () => Promise.reject(new TypeError('panne')));

    a.coordination.demarrer();
    await vider();

    expect(a.journal.entrees).toEqual([
      ENTREE_MENEUR,
      {
        niveau: 'erreur',
        evenement: 'SynchronisationInterrompue',
        champs: { erreur: 'TypeError' },
      },
    ]);
    expect(await a.coordination.etat()).toEqual(est('MENEUR', false));
  });

  it('UT-US-031-02 second onglet — SUIVEUR avec autre meneur, cycle non démarré ; fermeture du premier : il devient MENEUR, sans message', async () => {
    const env = preparer();
    const a = env.onglet('a');
    const b = env.onglet('b');
    a.coordination.demarrer();
    await vider();

    b.coordination.demarrer();
    await vider();
    expect(await b.coordination.etat()).toEqual(est('SUIVEUR', true));
    expect(env.tracesDe('b')).toEqual([]);
    expect(b.notifications.nombre).toBe(0);
    expect(env.verrous.enAttente(MENEUR)).toBe(1);

    env.verrous.fermerOnglet(a.verrou.id);
    await vider();

    expect(await b.coordination.etat()).toEqual(est('MENEUR', false));
    expect(env.tracesDe('b')).toEqual(['b:demarrer', 'b:synchroniser']);
    expect(b.journal.entrees).toEqual([ENTREE_MENEUR]);
    expect(b.notifications.nombre).toBe(1);
  });
});

describe('CoordinationOnglets — accès Google (Q-ST031-STA-2)', () => {
  it.each<EtatAccesGoogle>(['A_RENOUVELER', 'PERDU', 'SANS_SESSION'])(
    'UT-US-031-03 meneur dont l’accès passe à %s — cycle arrêté, main rendue au suiveur VALIDE ; retour à VALIDE : candidature derrière lui',
    async (perte) => {
      const env = preparer();
      const a = env.onglet('a');
      const b = env.onglet('b');
      a.coordination.demarrer();
      await vider();
      b.coordination.demarrer();
      await vider();

      a.acces.changer(perte);
      await vider();
      expect(env.traces).toEqual([
        'a:demarrer',
        'a:synchroniser',
        'a:arreter',
        'b:demarrer',
        'b:synchroniser',
      ]);
      expect(await a.coordination.etat()).toEqual(est('SUIVEUR', true));
      expect(await b.coordination.etat()).toEqual(est('MENEUR', false));
      expect(a.notifications.nombre).toBe(2);

      a.acces.changer('VALIDE');
      await vider();
      expect(env.tracesDe('a')).toEqual(['a:demarrer', 'a:synchroniser', 'a:arreter']);
      expect(env.verrous.enAttente(MENEUR)).toBe(1);

      b.coordination.arreter();
      await vider();
      expect(env.traces.slice(5)).toEqual(['b:arreter', 'a:demarrer', 'a:synchroniser']);
      expect(await a.coordination.etat()).toEqual(est('MENEUR', false));
    },
  );

  it('UT-US-031-03 sans accès VALIDE, aucune candidature ; un candidat qui perd l’accès abandonne sa demande et ne devient jamais meneur', async () => {
    const env = preparer();
    const seul = env.onglet('seul', 'A_RENOUVELER');
    seul.coordination.demarrer();
    await vider();
    expect(env.verrous.enAttente(MENEUR)).toBe(0);
    expect(await seul.coordination.etat()).toEqual(est('SUIVEUR', false));
    seul.acces.changer('VALIDE');
    await vider();
    expect(await seul.coordination.etat()).toEqual(est('MENEUR', false));

    const candidat = env.onglet('candidat');
    candidat.coordination.demarrer();
    await vider();
    expect(env.verrous.enAttente(MENEUR)).toBe(1);
    candidat.acces.changer('PERDU');
    await vider();
    expect(env.verrous.enAttente(MENEUR)).toBe(0);

    seul.coordination.arreter();
    await vider();
    expect(env.verrous.detenteur(MENEUR)).toBeUndefined();
    expect(env.tracesDe('candidat')).toEqual([]);
    expect(await candidat.coordination.etat()).toEqual(est('SUIVEUR', false));
  });
});

describe('CoordinationOnglets — démarrage et arrêt', () => {
  it('UT-US-031-04 demarrer idempotent ; arreter idempotent et définitif : cycle arrêté une fois, main rendue, plus aucune candidature', async () => {
    const env = preparer();
    const a = env.onglet('a');
    a.coordination.demarrer();
    a.coordination.demarrer();
    await vider();
    expect(env.traces).toEqual(['a:demarrer', 'a:synchroniser']);
    expect(a.notifications.nombre).toBe(1);

    a.coordination.arreter();
    a.coordination.arreter();
    await vider();
    expect(env.traces).toEqual(['a:demarrer', 'a:synchroniser', 'a:arreter']);
    expect(env.verrous.detenteur(MENEUR)).toBeUndefined();
    expect(await a.coordination.etat()).toEqual(est('SUIVEUR', false));
    expect(a.notifications.nombre).toBe(2);

    a.acces.changer('PERDU');
    a.acces.changer('VALIDE');
    a.coordination.demarrer();
    await vider();
    expect(env.traces).toHaveLength(3);
    expect(env.verrous.enAttente(MENEUR)).toBe(0);
  });

  it('UT-US-031-04 arreter d’un suiveur en attente — cycle arrêté une fois, demande abandonnée : il ne devient pas meneur ensuite', async () => {
    const env = preparer();
    const a = env.onglet('a');
    const b = env.onglet('b');
    a.coordination.demarrer();
    await vider();
    b.coordination.demarrer();
    await vider();

    b.coordination.arreter();
    await vider();
    expect(env.tracesDe('b')).toEqual(['b:arreter']);
    expect(env.verrous.enAttente(MENEUR)).toBe(0);

    a.coordination.arreter();
    await vider();
    expect(env.verrous.detenteur(MENEUR)).toBeUndefined();
    expect(env.tracesDe('b')).toEqual(['b:arreter']);
    expect(b.notifications.nombre).toBe(0);
  });
});
