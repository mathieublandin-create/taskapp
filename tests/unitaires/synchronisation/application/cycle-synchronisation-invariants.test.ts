/**
 * Cas limites du cycle (ST-US-017 v0.10.2 §6.7 n° 2 et n° 11 b) : fichier propre dont le Drive ne donne pas de version
 * (relu à chaque cycle, C4 ne s'applique pas) ; adoption de la génération de l'appareil devant un Drive sans dossier
 * (décision forcée : le dossier est préparé, son échec est une erreur du cycle). Compléments de Bruce (rang 10).
 */
import { describe, expect, it, vi } from 'vitest';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';
import { controlerDrive } from '@src/synchronisation/domaine/controle-drive';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import { AccesCommandable, ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import {
  avecObjectifPublie,
  DEPART,
  metaDe,
  objectifsDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import { hlc, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

vi.mock('@src/synchronisation/domaine/controle-drive', async (original) => {
  const reel = await original<typeof import('@src/synchronisation/domaine/controle-drive')>();
  return { ...reel, controlerDrive: vi.fn(reel.controlerDrive) };
});

const cycleSur = (env: ReturnType<typeof preparerRestauration>, transport: TransportSynchro) =>
  new CycleSynchronisation({
    depot: env.smartphone.depot,
    transport,
    acces: new AccesCommandable(),
    reseau: new ReseauCommandable(),
    planificateur: env.planificateur,
    aleatoire: new SourceAleatoireDeterministe([500]),
    horloge: new HorlogeSimulee(env.temps),
    journal: new JournalEnMemoire(),
    versionApplication: '0.1.0',
  });

describe('Cas limites du cycle (ST-US-017 v0.10.2 §6.7)', () => {
  it('UT-COMP-US-017-3-113 version du fichier propre non fournie par le Drive : le fichier est relu à chaque cycle (C4 ne s’applique pas), sans altération ni écriture', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: env.smartphone.reseau,
      accesAccorde: () => true,
    });
    const lectures: Array<string> = [];
    const transport: TransportSynchro = {
      ...reel,
      inventorierDossier: async (dossier) => {
        const inventaire = await reel.inventorierDossier(dossier);
        if (!inventaire.ok) return inventaire;
        return {
          ok: true,
          valeur: {
            ...inventaire.valeur,
            fichiers: inventaire.valeur.fichiers.map(({ version: _version, ...f }) => f),
          },
        };
      },
      lireFichierAppareil: (id) => {
        lectures.push(id);
        return reel.lireFichierAppareil(id);
      },
    };
    const cycle = cycleSur(env, transport);
    const propre = (await metaDe(env.smartphone)).fichierPropre;

    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(lectures.filter((id) => id === propre)).toHaveLength(2);
    expect(cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await objectifsDe(env.smartphone)).size).toBe(1);
  });

  it('UT-COMP-US-017-3-114 adoption de la génération de l’appareil devant un Drive sans dossier : le dossier est préparé avant le manifeste ; sa préparation en échec interrompt le cycle sans réinitialiser', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDossiers();
    const generation = {
      type: 'NOUVELLE',
      hlc: hlc('2026-10-21T09:00:00.000Z', 1, SMARTPHONE),
    } as const;
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: env.smartphone.reseau,
      accesAccorde: () => true,
    });
    const transport: TransportSynchro = {
      ...reel,
      preparerDossier: () => Promise.resolve(echec({ type: 'ServeurIndisponible' })),
    };
    vi.mocked(controlerDrive).mockReturnValueOnce({ type: 'NOUVELLE_GENERATION', generation });

    expect(await cycleSur(env, transport).synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect((await metaDe(env.smartphone)).generation?.type).not.toBe('NOUVELLE');
    expect((await objectifsDe(env.smartphone)).size).toBe(1);
  });

  it('UT-COMP-US-017-3-116 déménagement dont la relecture de la méta ne donne aucun fichier propre mémorisé : rien n’est mis à la corbeille à ce titre, le dossier quitté est conservé', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.ajouterDossier(PC, instant(DEPART) - 60_000);
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: env.smartphone.reseau,
      accesAccorde: () => true,
    });
    let relectures = 0;
    const supprimes: Array<string> = [];
    const transport: TransportSynchro = {
      ...reel,
      supprimerFichier: (id) => {
        supprimes.push(id);
        return reel.supprimerFichier(id);
      },
    };
    const vrai = env.smartphone.depot;
    // Relecture du déménagement (n° 14), 2e lecture de la méta du cycle : la méta n'a pas de fichier propre.
    const depot: DepotLocal = {
      lire: () => vrai.lire(),
      lireSignalements: () => vrai.lireSignalements(),
      appliquer: (calcul) => vrai.appliquer(calcul),
      observer: (rappel) => vrai.observer(rappel),
      lireMeta: async () => {
        const meta = await vrai.lireMeta();
        relectures += 1;
        if (!meta.ok || relectures !== 2) return meta;
        const { fichierPropre: _fichierPropre, ...sans } = meta.valeur;
        return succes(sans);
      },
      appliquerSynchronisation: (calcul) => vrai.appliquerSynchronisation(calcul),
    };
    const cycle = new CycleSynchronisation({
      depot,
      transport,
      acces: new AccesCommandable(),
      reseau: new ReseauCommandable(),
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal: new JournalEnMemoire(),
      versionApplication: '0.1.0',
    });

    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(supprimes).toEqual([]);
    expect(env.drive.dossiers().filter((d) => !d.supprime)).toHaveLength(2);
  });
});
