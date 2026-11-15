/**
 * ST-US-031 v0.4 §6.2 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6 : `CycleSynchronisation` sous exclusion entre onglets.
 * Le verrou « cycle » couvre toute l'exécution, contrôles du réseau et de l'accès refaits après son obtention, jusqu'à
 * la mise à jour de `deposeJusquA` ; `DEJA_EN_COURS` et un contrôle en échec à l'appel ne demandent pas le verrou ;
 * l'attente du verrou ne notifie pas et ne change pas l'état du moteur. Exclusion posée directement sur la doublure
 * (`VerrouOngletsEnMemoire`), indépendamment de `exclusionParVerrou` (UT-US-031-05).
 */
import { describe, expect, it, vi } from 'vitest';
import type { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type { ExclusionCycle } from '@src/synchronisation/application/exclusion-cycle';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import {
  VerrouOngletsEnMemoire,
  type IdOnglet,
  type OngletSimule,
} from '@tests/doublures/verrou-onglets-memoire';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { creerAppareilCycle } from '@tests/support/synchronisation/appareil-cycle';
import { barriere, vider } from '@tests/support/synchronisation/onglets';
import { idObjectif, instant, PC } from '@tests/support/valeurs';

const CYCLE = 'donejuan-test-espace:synchronisation-cycle';

const exclusionSur = (onglet: OngletSimule): ExclusionCycle => ({
  executer: (tache) => onglet.executerExclusivement(CYCLE, tache),
});

const preparer = async () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const verrous = new VerrouOngletsEnMemoire();
  const ici = verrous.onglet();
  const autre = verrous.onglet();
  const pc = creerAppareilCycle({
    appareilId: PC,
    prefixe: '02',
    drive,
    temps,
    planificateur,
    exclusion: exclusionSur(ici),
  });
  await appliquerModifications(pc.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
  ]);
  return { drive, verrous, ici, autre, pc };
};

/** Détenteur du verrou « cycle » et présence d'un cycle en cours, relevés à chaque notification du cycle. */
const espionner = (cycle: CycleSynchronisation, verrous: VerrouOngletsEnMemoire) => {
  const releves: Array<{ readonly detenteur: IdOnglet | undefined; readonly enCours: boolean }> =
    [];
  cycle.observer(() => {
    releves.push({
      detenteur: verrous.detenteur(CYCLE),
      enCours: cycle.cycleEnCours() !== undefined,
    });
  });
  return releves;
};

/** L'autre onglet tient le verrou « cycle » jusqu'à `fin.ouvrir()`. */
const autreTientLeVerrou = async (autre: OngletSimule) => {
  const fin = barriere();
  const tenue = autre.executerExclusivement(CYCLE, () => fin.promesse);
  await vider();
  return {
    rendre: async () => {
      fin.ouvrir();
      await tenue;
    },
  };
};

describe('CycleSynchronisation sous exclusion (ST-US-031 §6.2)', () => {
  it('UT-US-031-06 réseau coupé pendant l’attente du verrou — NON_LANCE_HORS_LIGNE après l’obtention, aucun appel au Drive, aucune notification', async () => {
    const env = await preparer();
    const releves = espionner(env.pc.cycle, env.verrous);
    const tenue = await autreTientLeVerrou(env.autre);

    const issue = env.pc.cycle.synchroniserMaintenant();
    await vider();
    expect(env.verrous.enAttente(CYCLE)).toBe(1);
    expect(env.pc.cycle.cycleEnCours()).toBeInstanceOf(Promise);
    expect(env.pc.cycle.etatMoteur().cycle).toBe('REPOS');
    expect(releves).toEqual([]);

    env.pc.reseau.changer(false);
    await tenue.rendre();

    expect(await issue).toBe('NON_LANCE_HORS_LIGNE');
    expect(env.drive.nombreReponses(PC)).toBe(0);
    expect(releves).toEqual([]);
    expect(env.pc.cycle.cycleEnCours()).toBeUndefined();
    expect(env.verrous.detenteur(CYCLE)).toBeUndefined();
  });

  it('UT-US-031-06 accès devenu A_RENOUVELER pendant l’attente — NON_LANCE_SANS_ACCES, aucun appel au Drive, aucune notification', async () => {
    const env = await preparer();
    const releves = espionner(env.pc.cycle, env.verrous);
    const tenue = await autreTientLeVerrou(env.autre);

    const issue = env.pc.cycle.synchroniserMaintenant();
    await vider();
    env.pc.acces.changer('A_RENOUVELER');
    await tenue.rendre();

    expect(await issue).toBe('NON_LANCE_SANS_ACCES');
    expect(env.drive.nombreReponses(PC)).toBe(0);
    expect(releves).toEqual([]);
    expect(env.verrous.detenteur(CYCLE)).toBeUndefined();
  });

  it('UT-US-031-06 DEJA_EN_COURS pendant l’attente et contrôle en échec à l’appel — rendus sans demander le verrou', async () => {
    const env = await preparer();
    const tenue = await autreTientLeVerrou(env.autre);
    const premiere = env.pc.cycle.synchroniserMaintenant();
    await vider();

    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DEJA_EN_COURS');
    expect(env.verrous.enAttente(CYCLE)).toBe(1);

    await tenue.rendre();
    expect(await premiere).toBe('TERMINE');
    expect(valeurDe(await env.pc.service.lireDecompteEnAttente()).nombre).toBe(0);

    env.pc.reseau.changer(false);
    const tenueBis = await autreTientLeVerrou(env.autre);
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('NON_LANCE_HORS_LIGNE');
    expect(env.verrous.enAttente(CYCLE)).toBe(0);
    await tenueBis.rendre();
  });

  it('UT-US-031-06 verrou tenu de la première notification à la dernière, et pendant chaque appliquerSynchronisation ; rendu ensuite', async () => {
    const env = await preparer();
    const releves = espionner(env.pc.cycle, env.verrous);
    const detenteursPendantLaMiseAJour: Array<IdOnglet | undefined> = [];
    const original = env.pc.depot.appliquerSynchronisation.bind(env.pc.depot);
    vi.spyOn(env.pc.depot, 'appliquerSynchronisation').mockImplementation((calcul) => {
      detenteursPendantLaMiseAJour.push(env.verrous.detenteur(CYCLE));
      return original(calcul);
    });

    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(await env.pc.cycle.deposerMaintenant()).toBe('TERMINE');

    expect(releves).toEqual([
      { detenteur: env.ici.id, enCours: true },
      { detenteur: env.ici.id, enCours: false },
      { detenteur: env.ici.id, enCours: true },
      { detenteur: env.ici.id, enCours: false },
    ]);
    expect(detenteursPendantLaMiseAJour.length).toBeGreaterThanOrEqual(2);
    expect(new Set(detenteursPendantLaMiseAJour)).toEqual(new Set([env.ici.id]));
    expect(env.verrous.detenteur(CYCLE)).toBeUndefined();
    expect(valeurDe(await env.pc.service.lireDecompteEnAttente()).nombre).toBe(0);
  });
});
