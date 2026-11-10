/**
 * Tests complémentaires de `CycleSynchronisation` sous exclusion (ST-US-031 v0.4 §6.2, tranche B1), au-delà
 * d'UT-US-031-06 : une exclusion qui exécute la tâche pendant l'appel (Web Locks absent, RL-LOT-001-A6) laisse voir
 * `cycleEnCours()` dès la première notification ; une exclusion rejetée sans exécuter la tâche ne bloque pas le cycle
 * de l'onglet.
 */
import { describe, expect, it } from 'vitest';
import type { ExclusionCycle } from '@src/synchronisation/application/exclusion-cycle';
import { VerrouOngletsWeb } from '@src/synchronisation/infrastructure/verrou-onglets-web';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { creerAppareilCycle } from '@tests/support/synchronisation/appareil-cycle';
import { idObjectif, instant, PC } from '@tests/support/valeurs';

const CYCLE = 'donejuan-test-espace:synchronisation-cycle';

const preparer = async (exclusion: ExclusionCycle) => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const drive = new FauxDrive(temps);
  const pc = creerAppareilCycle({
    appareilId: PC,
    prefixe: '02',
    drive,
    temps,
    planificateur: new PlanificateurSimule(temps),
    exclusion,
  });
  await appliquerModifications(pc.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
  ]);
  const releves: Array<{ readonly cycle: string; readonly enCours: boolean }> = [];
  pc.cycle.observer(() => {
    releves.push({
      cycle: pc.cycle.etatMoteur().cycle,
      enCours: pc.cycle.cycleEnCours() !== undefined,
    });
  });
  return { drive, pc, releves };
};

describe('CycleSynchronisation sous exclusion, compléments (ST-US-031 §6.2)', () => {
  it('UT-COMP-US-031-3 exclusion qui exécute la tâche pendant l’appel (Web Locks absent) — cycle en cours dès la première notification, DEJA_EN_COURS ensuite, TERMINE', async () => {
    const verrou = new VerrouOngletsWeb({
      gestionnaire: undefined,
      journal: new JournalEnMemoire(),
    });
    const env = await preparer({ executer: (tache) => verrou.executerExclusivement(CYCLE, tache) });

    const issue = env.pc.cycle.synchroniserMaintenant();
    expect(env.pc.cycle.cycleEnCours()).toBeInstanceOf(Promise);
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DEJA_EN_COURS');

    expect(await issue).toBe('TERMINE');
    expect(env.releves[0]).toEqual({ cycle: 'EN_COURS', enCours: true });
    expect(env.releves.at(-1)).toEqual({ cycle: 'REPOS', enCours: false });
    expect(env.pc.cycle.cycleEnCours()).toBeUndefined();
    expect(valeurDe(await env.pc.service.lireDecompteEnAttente()).nombre).toBe(0);
  });

  it('UT-COMP-US-031-4 exclusion rejetée sans exécuter la tâche — erreur propagée telle quelle, aucune notification, cycle libéré : l’exécution suivante a lieu', async () => {
    const erreur = new Error('verrou indisponible');
    let refuser = true;
    const env = await preparer({
      executer: (tache) => (refuser ? Promise.reject(erreur) : tache()),
    });

    await expect(env.pc.cycle.synchroniserMaintenant()).rejects.toBe(erreur);
    expect(env.pc.cycle.cycleEnCours()).toBeUndefined();
    expect(env.releves).toEqual([]);
    expect(env.drive.nombreReponses(PC)).toBe(0);

    refuser = false;
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(valeurDe(await env.pc.service.lireDecompteEnAttente()).nombre).toBe(0);
  });

  it('UT-COMP-US-031-6 corps réglé, verrou pas encore rendu — le cycle de l’onglet est déjà libéré, après un contrôle en échec comme après une exécution', async () => {
    const vusAvantRestitution: Array<boolean> = [];
    let cycle: { cycleEnCours: () => unknown } = { cycleEnCours: () => undefined };
    const env = await preparer({
      executer: async (tache) => {
        await Promise.resolve();
        const issue = await tache();
        vusAvantRestitution.push(cycle.cycleEnCours() === undefined);
        return issue;
      },
    });
    cycle = env.pc.cycle;

    const horsLigne = env.pc.cycle.synchroniserMaintenant();
    env.pc.reseau.changer(false);
    expect(await horsLigne).toBe('NON_LANCE_HORS_LIGNE');
    env.pc.reseau.changer(true);
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(vusAvantRestitution).toEqual([true, true]);
  });
});
