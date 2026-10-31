/**
 * Cycle de l'incrément 2 sur deux appareils (FauxDrive, DepotLocalDexie) : signalement unique, réparation convergente,
 * lecture partagée (ST-US-017 v0.5 §6.6 n° 11, §6.3 ; US-017 S10, S16, S25). UT-US-017-54.
 */
import { describe, expect, it } from 'vitest';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import { MarquerCommeLue } from '@src/synchronisation/application/cas-usage/marquer-comme-lue';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import type { Modification } from '@src/synchronisation/domaine/modification';
import { decoderFichierAppareil } from '@src/synchronisation/infrastructure/drive/format-v1';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import {
  creerAppareilCycle,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import {
  date,
  duree,
  ecart,
  idObjectif,
  idTache,
  instant,
  MINUTE,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';
const T1 = idTache(1);
const ALPHA = idObjectif(1);
const BETA = idObjectif(2);

const preparer = () => {
  const temps = new TempsSimule(instant(DEPART));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const smartphone = creerAppareilCycle({
    appareilId: SMARTPHONE,
    prefixe: '01',
    drive,
    temps,
    planificateur,
  });
  const pc = creerAppareilCycle({ appareilId: PC, prefixe: '02', drive, temps, planificateur });
  const echanger = async () => {
    for (let tour = 0; tour < 3; tour += 1) {
      await smartphone.cycle.synchroniserMaintenant();
      await pc.cycle.synchroniserMaintenant();
    }
  };
  const plusTard = () => {
    temps.avancer(ecart(10 * MINUTE));
  };
  return { temps, drive, smartphone, pc, echanger, plusTard };
};

const modifier = (a: AppareilCycle, m: Modification) =>
  appliquerModifications(a.service, () => [m]);
const renommer = (a: AppareilCycle, id: IdTache, intitule: string) =>
  modifier(a, { type: 'ECRIRE_TACHE', id, ecriture: { champ: 'intitule', valeur: intitule } });
const placer = (a: AppareilCycle, id: IdObjectif, parentId: IdObjectif) =>
  modifier(a, {
    type: 'ECRIRE_OBJECTIF',
    id,
    ecriture: { champ: 'parent', parentId },
    evenement: { type: 'CHANGEMENT_PARENT', element: { type: 'OBJECTIF', id }, rang: 0 },
  });
const signalementsDe = async (a: AppareilCycle) => valeurDe(await a.depot.lireSignalements());
const idsDe = async (a: AppareilCycle) => [...(await signalementsDe(a)).valeursEcartees.keys()];
const aLireSur = async (a: AppareilCycle) => {
  const s = await signalementsDe(a);
  return compterALire(s.valeursEcartees, s.lectures);
};

describe('Cycle et valeurs écartées (ST-US-017 v0.5 §6.6)', () => {
  it('UT-US-017-54 S10 et S16 : une entrée, la même sur les deux appareils et dans leurs fichiers, lue partout après « Compris » ; S25 : réparation convergente', async () => {
    const env = preparer();
    valeurDe(
      await appliquerModifications(env.pc.service, (_etat, contexte) => [
        creationTache(
          { id: T1, intitule: 'Plan', delai: date('2026-11-30'), estimation: duree(60) },
          contexte.instant,
        ),
        creationObjectif({ id: ALPHA, intitule: 'Alpha' }, contexte.instant, 1),
        creationObjectif({ id: BETA, intitule: 'Bêta' }, contexte.instant, 2),
      ]),
    );
    await env.echanger();

    // S10 : « A » sur le PC, puis « B » sur le smartphone (sans échange entre-temps).
    valeurDe(await renommer(env.pc, T1, 'A'));
    env.plusTard();
    valeurDe(await renommer(env.smartphone, T1, 'B'));
    await env.echanger();

    const ids = await idsDe(env.smartphone);
    expect(ids).toHaveLength(1);
    expect(await idsDe(env.pc)).toEqual(ids);
    const [entree] = [...(await signalementsDe(env.pc)).valeursEcartees.values()];
    expect(entree?.motif).toBe('CONFLIT');
    for (const fichier of env.drive
      .fichiers()
      .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'appareil')) {
      const contenu = valeurDe(await decoderFichierAppareil(fichier.octets));
      expect((contenu.valeursEcartees ?? []).map((v) => v.id)).toEqual(ids);
    }

    // S16 : « Compris » sur le smartphone, puis échange : lue sur les deux appareils.
    const marquer = new MarquerCommeLue({
      depot: env.smartphone.depot,
      horloge: new HorlogeSimulee(env.temps),
    });
    valeurDe(await marquer.executer(ids));
    expect(await aLireSur(env.smartphone)).toBe(0);
    expect(await aLireSur(env.pc)).toBe(1);
    await env.echanger();
    expect(await aLireSur(env.pc)).toBe(0);
    expect(await idsDe(env.pc)).toEqual(ids);

    // S25 : Alpha sous Bêta sur le PC, puis Bêta sous Alpha sur le smartphone.
    valeurDe(await placer(env.pc, ALPHA, BETA));
    env.plusTard();
    valeurDe(await placer(env.smartphone, BETA, ALPHA));
    await env.echanger();

    for (const appareil of [env.smartphone, env.pc]) {
      const objectifs = valeurDe(await appareil.service.lire()).objectifs;
      expect(objectifs.get(ALPHA)?.parentIdEnregistre).toBeUndefined();
      expect(objectifs.get(BETA)?.parentIdEnregistre).toBe(ALPHA);
      expect(valeurDe(await appareil.service.lireDecompteEnAttente()).nombre).toBe(0);
    }
    const annulations = async (a: AppareilCycle) =>
      [...(await signalementsDe(a)).valeursEcartees.values()]
        .filter((v) => v.motif === 'PLACEMENT_ANNULE')
        .map((v) => v.id);
    expect(await annulations(env.smartphone)).toHaveLength(1);
    expect(await annulations(env.pc)).toEqual(await annulations(env.smartphone));
  });
});
