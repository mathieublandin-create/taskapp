/**
 * Altérations du Drive hors application et vérification que rien n'y a été réécrit (ST-US-017 §12.6 n° R1, R2, R13,
 * R14) : une photo du Drive est prise après l'altération ; les écritures des appareils et les octets des fichiers
 * sont comparés à cette photo.
 */
import assert from 'node:assert/strict';
import type { FauxDrive } from '../../doublures/faux-drive';
import { IDENTIFIANTS_APPAREILS, type NomAppareil } from '../banc/appareil-simule';
import type { MondeDoneJuan } from '../monde';
import { driveDeLAppareil } from './drive-banc';

type EtatFichier = { readonly version: string; readonly octets: Uint8Array };

export type PhotoDrive = {
  readonly drive: FauxDrive;
  readonly ecritures: ReadonlyMap<NomAppareil, number>;
  /** Fichiers non supprimés, par identifiant. */
  readonly fichiers: ReadonlyMap<string, EtatFichier>;
};

const NOMS: ReadonlyArray<NomAppareil> = ['smartphone', 'pc'];

/** Le Drive du compte des appareils connectés : un seul est attendu dans ces scénarios. */
export const driveDesAppareils = (monde: MondeDoneJuan): FauxDrive => {
  const drives = new Set(monde.banc.appareils().flatMap((a) => driveDeLAppareil(monde, a) ?? []));
  assert.equal(drives.size, 1, `${String(drives.size)} Drive(s) connu(s) : un seul est attendu`);
  const [drive] = drives;
  assert.ok(drive);
  return drive;
};

export const photographier = (drive: FauxDrive): PhotoDrive => ({
  drive,
  ecritures: new Map(NOMS.map((nom) => [nom, drive.ecrituresPar(IDENTIFIANTS_APPAREILS[nom])])),
  fichiers: new Map(
    drive
      .fichiers()
      .filter((f) => !f.supprime)
      .map((f) => [f.id, { version: f.version, octets: f.octets }]),
  ),
});

const photoDe = (monde: MondeDoneJuan): PhotoDrive => {
  assert.ok(monde.photoDrive, "Aucune altération du Drive n'a été déclarée");
  return monde.photoDrive;
};

const memesOctets = (a: Uint8Array, b: Uint8Array): boolean => Buffer.compare(a, b) === 0;

/** Aucune écriture d'aucun appareil, aucun fichier ajouté ni modifié depuis la photo. */
export const verifierRienReecrit = (monde: MondeDoneJuan): void => {
  const photo = photoDe(monde);
  for (const nom of NOMS) {
    assert.equal(
      photo.drive.ecrituresPar(IDENTIFIANTS_APPAREILS[nom]),
      photo.ecritures.get(nom),
      `Le ${nom} a écrit dans le Drive`,
    );
  }
  const actuels = photo.drive.fichiers().filter((f) => !f.supprime);
  assert.deepEqual(
    actuels.map((f) => f.id).sort(),
    [...photo.fichiers.keys()].sort(),
    'Des fichiers ont été ajoutés ou supprimés dans le Drive',
  );
  for (const f of actuels) {
    const avant = photo.fichiers.get(f.id);
    assert.ok(
      avant?.version === f.version && memesOctets(avant.octets, f.octets),
      `Le fichier « ${f.nom} » a été réécrit`,
    );
  }
};

/** Le fichier de données altéré de l'appareil a gardé sa version et ses octets. */
export const verifierFichierAltereIntact = (monde: MondeDoneJuan, nom: NomAppareil): void => {
  const photo = photoDe(monde);
  const id = monde.fichiersAlteres.get(nom);
  assert.ok(id, `Le fichier du ${nom} n'a pas été modifié à la main`);
  const avant = photo.fichiers.get(id);
  const actuel = photo.drive.fichiers().find((f) => f.id === id && !f.supprime);
  assert.ok(avant && actuel, `Le fichier du ${nom} a disparu du Drive`);
  assert.ok(
    avant.version === actuel.version && memesOctets(avant.octets, actuel.octets),
    `Le fichier du ${nom} a été réécrit dans le Drive`,
  );
};
