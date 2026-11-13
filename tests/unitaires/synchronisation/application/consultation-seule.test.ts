/**
 * Consultation seule (RG-058 ; ST-US-017 v0.11 §6.8 n° 6 à 9 ; DAT §4.2 ; conventions §10.3 (c)) : un fichier d'un
 * `schemaVersion` plus récent arrête le cycle avant toute écriture dans le Drive, toute fusion et tout effacement ;
 * les modifications en attente sont conservées puis déposées par la version mise à jour ; la saisie est refusée par le
 * décorateur du service ; le dépôt avant sortie n'est pas tenté. UT-US-017-84 (rang 11, tranches H4 et D1).
 */
import { describe, expect, it, vi } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DepotAvantSortieSynchro } from '@src/synchronisation/application/depot-avant-sortie-synchro';
import { ServiceEtatLocalConsultationSeule } from '@src/synchronisation/application/service-etat-local-consultation-seule';
import { decompterModificationsEnAttente } from '@src/synchronisation/domaine/index-en-attente';
import { SCHEMA_VERSION } from '@src/synchronisation/domaine/version-schema';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  avecObjectifPublie,
  fichierDuDrive,
  metaDe,
  objectifsDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import type { AppareilCycle } from '@tests/support/synchronisation/appareil-cycle';
import { idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

const creerObjectif = async (a: AppareilCycle, n: number, intitule: string) => {
  valeurDe(
    await appliquerModifications(a.service, (_etat, contexte) => [
      creationObjectif({ id: idObjectif(n), intitule }, contexte.instant),
    ]),
  );
};

/** Smartphone avec une modification en attente ; le PC est passé à une version de format plus récent. */
const preparer = async () => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  await creerObjectif(env.smartphone, 2, 'Courir un semi-marathon');
  await env.drive.passerAuFormatPlusRecent(PC);
  await creerObjectif(env.pc, 3, 'Écrire au PC');
  expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
  return env;
};

const octetsDuDrive = (env: Awaited<ReturnType<typeof preparer>>) =>
  env.drive.fichiers().map((f) => [f.id, f.supprime, Buffer.from(f.octets).toString('base64')]);

describe('Consultation seule dans le cycle (ST-US-017 v0.11 §6.8 n° 6, n° 7)', () => {
  it('UT-US-017-84 format plus récent : FORMAT_PLUS_RECENT, aucune écriture dans le Drive (ni dépôt, ni manifeste, ni corbeille), aucune fusion, méta et état local inchangés, modification en attente conservée ; dépôt seul refusé de même', async () => {
    const env = await preparer();
    const avant = octetsDuDrive(env);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    const etatAvant = valeurDe(await env.smartphone.depot.lire());
    const metaAvant = await metaDe(env.smartphone);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('FORMAT_PLUS_RECENT');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('FORMAT_PLUS_RECENT');
    expect(await env.smartphone.cycle.deposerMaintenant()).toBe('FORMAT_PLUS_RECENT');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(octetsDuDrive(env)).toEqual(avant);
    const etatApres = valeurDe(await env.smartphone.depot.lire());
    expect(etatApres.version).toBe(etatAvant.version);
    expect(decompterModificationsEnAttente(etatApres.enAttente)).toBe(1);
    expect(await metaDe(env.smartphone)).toEqual(metaAvant);
    expect([...(await objectifsDe(env.smartphone)).keys()].sort()).toEqual([
      'Courir un semi-marathon',
      'Publier le guide',
    ]);
  });

  it('UT-US-017-84 après la mise à jour (format connu), le cycle suivant fusionne le fichier plus récent et dépose les modifications conservées ; l’action requise disparaît', async () => {
    const env = await preparer();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('FORMAT_PLUS_RECENT');

    env.drive.connaitreFormat(SMARTPHONE, SCHEMA_VERSION + 1);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect([...(await objectifsDe(env.smartphone)).keys()].sort()).toEqual([
      'Courir un semi-marathon',
      'Publier le guide',
      'Écrire au PC',
    ]);
    const etat = valeurDe(await env.smartphone.depot.lire());
    expect(decompterModificationsEnAttente(etat.enAttente)).toBe(0);
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(
      contenu.registres.some(
        (r) => r.cle.champ === 'intitule' && r.ecriture.valeur === 'Courir un semi-marathon',
      ),
    ).toBe(true);
  });
});

describe('Saisie et sortie en consultation seule (n° 8, n° 9 ; US-022 S24, S25)', () => {
  it('UT-US-017-84 le dépôt avant sortie n’est pas tenté (NON_TENTE, aucun appel au cycle) et le décompte reste lisible', async () => {
    const env = await preparer();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('FORMAT_PLUS_RECENT');
    const deposer = vi.spyOn(env.smartphone.cycle, 'deposerMaintenant');
    const sortie = new DepotAvantSortieSynchro({
      depot: env.smartphone.depot,
      cycle: env.smartphone.cycle,
      reseau: env.smartphone.reseau,
      acces: env.smartphone.acces,
    });

    expect(await sortie.deposerSiPossible()).toBe('NON_TENTE');
    expect(deposer).not.toHaveBeenCalled();
    expect(await sortie.compterEnAttente()).toBe(1);
  });

  it('UT-US-017-84 décorateur : en consultation seule, `modifier` rend ConsultationSeule sans appeler la décision ni écrire ; hors consultation seule, tout est délégué', async () => {
    const env = await preparer();
    let consultation = true;
    const service = new ServiceEtatLocalConsultationSeule({
      service: env.smartphone.service,
      estConsultationSeule: () => consultation,
    });
    const decision = vi.fn(() => succes({ modifications: [], valeur: 'fait' }));
    const version = valeurDe(await env.smartphone.depot.lire()).version;

    expect(await service.modifier(decision)).toEqual(echec({ type: 'ConsultationSeule' }));
    expect(decision).not.toHaveBeenCalled();
    expect(valeurDe(await env.smartphone.depot.lire()).version).toBe(version);
    expect(valeurDe(await service.lire()).objectifs.size).toBe(2);
    expect(valeurDe(await service.lireDecompteEnAttente()).nombre).toBe(1);

    consultation = false;
    expect(await service.modifier(decision)).toEqual(succes('fait'));
    expect(decision).toHaveBeenCalledTimes(1);
    expect(await service.lireJournal({ type: 'OBJECTIF', id: idObjectif(2) })).toEqual(
      await env.smartphone.service.lireJournal({ type: 'OBJECTIF', id: idObjectif(2) }),
    );
  });
});
