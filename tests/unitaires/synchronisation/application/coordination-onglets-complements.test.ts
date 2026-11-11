/**
 * ST-US-031 v0.4 §6.1 (rang 13, tranche B2), tests complémentaires de Bruce sur `CoordinationOnglets` : une seule
 * candidature à la fois (l'accès est notifié `VALIDE` à chaque changement de session, sans changer d'état) ; arrêt
 * avant tout démarrage ; désabonnement d'un observateur. UT-COMP-US-031-7, 8.
 */
import { describe, expect, it, vi } from 'vitest';
import { CoordinationOnglets } from '@src/synchronisation/application/coordination-onglets';
import { VerrouOngletsEnMemoire } from '@tests/doublures/verrou-onglets-memoire';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { AccesCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { vider } from '@tests/support/synchronisation/onglets';

const ESPACE = 'donejuan-recette-3f5a9c0e';
const MENEUR = `${ESPACE}:synchronisation-meneur`;

const onglet = (verrous: VerrouOngletsEnMemoire) => {
  const verrou = verrous.onglet();
  const acces = new AccesCommandable('VALIDE');
  const cycle = {
    demarrer: vi.fn(),
    arreter: vi.fn(),
    synchroniserMaintenant: vi.fn(() => Promise.resolve('TERMINE' as const)),
  };
  const coordination = new CoordinationOnglets({
    verrou,
    cycle,
    acces,
    nomEspace: ESPACE,
    journal: new JournalEnMemoire(),
  });
  return { verrou, acces, cycle, coordination };
};

describe('CoordinationOnglets — compléments (ST-US-031 §6.1)', () => {
  it('UT-COMP-US-031-7 accès renotifié VALIDE — ni seconde demande du candidat, ni seconde demande ni second cycle d’ouverture du meneur ; la main est bien rendue à l’arrêt', async () => {
    const verrous = new VerrouOngletsEnMemoire();
    const a = onglet(verrous);
    const b = onglet(verrous);
    a.coordination.demarrer();
    await vider();
    b.coordination.demarrer();
    await vider();

    a.acces.changer('VALIDE');
    b.acces.changer('VALIDE');
    await vider();

    expect(verrous.enAttente(MENEUR)).toBe(1);
    expect(a.cycle.demarrer).toHaveBeenCalledTimes(1);
    expect(a.cycle.synchroniserMaintenant).toHaveBeenCalledTimes(1);

    a.coordination.arreter();
    await vider();
    expect(verrous.detenteur(MENEUR)).toBe(b.verrou.id);
    b.coordination.arreter();
    await vider();
    expect(verrous.detenteur(MENEUR)).toBeUndefined();
    expect(verrous.enAttente(MENEUR)).toBe(0);
  });

  it('UT-COMP-US-031-8 arrêt avant tout démarrage — cycle arrêté une fois, aucune candidature ensuite ; observateur désabonné : plus notifié', async () => {
    const verrous = new VerrouOngletsEnMemoire();
    const a = onglet(verrous);
    a.coordination.arreter();
    a.coordination.demarrer();
    await vider();
    expect(a.cycle.arreter).toHaveBeenCalledTimes(1);
    expect(verrous.detenteur(MENEUR)).toBeUndefined();
    expect(verrous.enAttente(MENEUR)).toBe(0);

    const b = onglet(verrous);
    const notifie = vi.fn();
    const annuler = b.coordination.observer(notifie);
    b.coordination.demarrer();
    await vider();
    expect(notifie).toHaveBeenCalledTimes(1);
    annuler();
    b.coordination.arreter();
    expect(notifie).toHaveBeenCalledTimes(1);
  });
});
