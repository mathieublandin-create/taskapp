/**
 * « Compris » sur une modification non retenue (RG-056 b ; ST-US-017 v0.5 §6.6 n° 6) : une lecture par identifiant
 * connu et non lu, un seul HLC, une seule transaction. UT-US-017-55.
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { MarquerCommeLue } from '@src/synchronisation/application/cas-usage/marquer-comme-lue';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { planVide } from '@tests/support/plans';
import {
  h,
  idArbitraire,
  intituleTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { ecart, hlc, idTache, MINUTE, PC, SMARTPHONE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T09:00:00.000Z';
const T1 = idTache(1);
const entree = (n: number): ValeurEcartee => ({
  id: idArbitraire(n),
  motif: 'CONFLIT',
  ecartee: intituleTache(T1, 'A', h(1, PC)),
  gagnante: intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) }),
});

const preparer = async () => {
  const env = creerEnvironnement(DEPART);
  valeurDe(
    await env.depot.appliquerSynchronisation((etat) => ({
      plan: planVide(etat),
      meta: {},
      signalements: { valeursEcartees: [entree(1), entree(2), entree(3)], lectures: [] },
    })),
  );
  let notifications = 0;
  env.depot.observer(() => {
    notifications += 1;
  });
  const marquer = new MarquerCommeLue({ depot: env.depot, horloge: new HorlogeSimulee(env.temps) });
  return { env, marquer, notifications: () => notifications };
};

describe('MarquerCommeLue (RG-056 b)', () => {
  it('UT-US-017-55 écrit une lecture datée par hlcSuivant ; déjà lue ou inconnue : rien ; plusieurs identifiants : un seul HLC ; erreur du dépôt propagée', async () => {
    const { env, marquer, notifications } = await preparer();
    const version = valeurDe(await env.depot.lire()).version;

    valeurDe(await marquer.executer([idArbitraire(1)]));

    const premier = hlc(DEPART, 0, SMARTPHONE);
    expect([...valeurDe(await env.depot.lireSignalements()).lectures.values()]).toEqual([
      { id: idArbitraire(1), hlc: premier },
    ]);
    const apres = valeurDe(await env.depot.lire());
    expect(apres.dernierHlc).toEqual(premier);
    expect(apres.version).toBe(version + 1);
    expect(notifications()).toBe(1);

    // Déjà lue, et identifiant inconnu : aucune écriture.
    valeurDe(await marquer.executer([idArbitraire(1), idArbitraire(9)]));
    expect(valeurDe(await env.depot.lire()).version).toBe(version + 1);
    expect(notifications()).toBe(1);

    // Deux identifiants (carte ALR-008, H-6) : même HLC.
    env.temps.avancer(ecart(MINUTE));
    valeurDe(await marquer.executer([idArbitraire(2), idArbitraire(3)]));
    const lectures = valeurDe(await env.depot.lireSignalements()).lectures;
    expect(lectures.get(idArbitraire(2))?.hlc).toEqual(
      hlc('2026-10-21T09:01:00.000Z', 0, SMARTPHONE),
    );
    expect(lectures.get(idArbitraire(3))?.hlc).toEqual(lectures.get(idArbitraire(2))?.hlc);

    const illisible = echec({ type: 'DonneesLocalesIllisibles' } as const);
    const depotIllisible: DepotLocal = {
      lire: () => Promise.resolve(illisible),
      appliquer: () => Promise.resolve(illisible),
      observer: () => () => undefined,
      lireMeta: () => Promise.resolve(illisible),
      lireSignalements: () => Promise.resolve(illisible),
      appliquerSynchronisation: () => Promise.resolve(illisible),
    };
    expect(
      await new MarquerCommeLue({
        depot: depotIllisible,
        horloge: new HorlogeSimulee(env.temps),
      }).executer([idArbitraire(1)]),
    ).toEqual(illisible);
  });
});
