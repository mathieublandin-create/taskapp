/**
 * DT-025 (ST-US-031 v0.4 §6.6, rang 13, tranche B1 ; ST-US-017 v0.5 §3.4 I2-16) : `EtatMoteur` n'a plus de champ
 * `aLire` (le nombre d'informations à lire vient des signalements de l'espace, `AttenteLocale.aLire`). Égalité stricte :
 * une clé `aLire` résiduelle, même à 0, fait échouer le test.
 */
import { describe, expect, it } from 'vitest';
import { SUIVI_CYCLE_AU_REPOS } from '@src/synchronisation/application/ports/suivi-cycle';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { creerAppareilCycle } from '@tests/support/synchronisation/appareil-cycle';
import { idObjectif, instant, PC } from '@tests/support/valeurs';

describe('EtatMoteur sans aLire (DT-025)', () => {
  it('UT-DT-025-01 au repos, puis après un Drive plein — seules les clés cycle et actionRequise ; SUIVI_CYCLE_AU_REPOS de même', async () => {
    const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
    const drive = new FauxDrive(temps);
    const pc = creerAppareilCycle({
      appareilId: PC,
      prefixe: '02',
      drive,
      temps,
      planificateur: new PlanificateurSimule(temps),
    });

    expect(pc.cycle.etatMoteur()).toStrictEqual({ cycle: 'REPOS' });
    expect(SUIVI_CYCLE_AU_REPOS.etatMoteur()).toStrictEqual({ cycle: 'REPOS' });

    await appliquerModifications(pc.service, (_etat, contexte) => [
      creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
    ]);
    drive.plein();
    expect(await pc.cycle.synchroniserMaintenant()).toBe('DRIVE_PLEIN');
    expect(pc.cycle.etatMoteur()).toStrictEqual({ cycle: 'REPOS', actionRequise: 'DRIVE_PLEIN' });
  });
});
