/**
 * Tests complémentaires de TransportSynchroDrive (ST-US-017 §4.3, §4.4, §7), au-delà de la suite de contrat :
 * traduction des erreurs, réponses incomplètes, filtrage des changements. Drive v3 REST simulé derrière `fetch`.
 */
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { ClientGoogle } from '@src/infrastructure-google';
import type { IdFichierDrive } from '@src/synchronisation/application/ports/transport-synchro';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  NOM_LISEZ_MOI,
  TransportSynchroDrive,
} from '@src/synchronisation/infrastructure/drive/transport-synchro-drive';
import { DriveHttpSimule } from '@tests/doublures/drive-http-simule';
import { valeurDe } from '@tests/support/environnement';
import { PC, SMARTPHONE } from '@tests/support/valeurs';

const contenu = (appareil = SMARTPHONE): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil,
  registres: [],
  journal: [],
});
const MANIFESTE = { schemaVersion: 1, generation: { type: 'INITIALE' } } as const;

const preparer = () => {
  const drive = new DriveHttpSimule();
  const transport = new TransportSynchroDrive(
    new ClientGoogle({ lireJeton: () => 'jeton', fetch: drive.fetch }),
  );
  return { drive, transport };
};

describe('TransportSynchroDrive, compléments (ST-US-017 §4.4)', () => {
  it('UT-COMP-US-017-01 erreurs Google traduites sur chaque méthode (401, 403 plein, 5xx, 429)', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    drive.repondre(503);
    expect(await transport.listerFichiersAppareils(dossier)).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(200, { startPageToken: '0-1' });
    drive.repondre(429);
    expect(await transport.listerFichiersAppareils(dossier)).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(500);
    expect(await transport.changements(dossier, '0-0')).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(200, { files: [] });
    drive.repondre(403, { error: { errors: [{ reason: 'storageQuotaExceeded' }] } });
    expect(await transport.deposerFichierAppareil({ dossier, contenu: contenu() })).toEqual(
      echec({ type: 'EspaceDrivePlein' }),
    );
    drive.repondre(401);
    expect(await transport.lireManifeste(dossier)).toEqual(echec({ type: 'NonAutorise' }));
    drive.repondre(404);
    expect(await transport.lireFichierAppareil('absent' as IdFichierDrive)).toEqual(
      echec({ type: 'RessourceIntrouvable' }),
    );
  });

  it('UT-COMP-US-017-02 changements — jeton refusé (400 ou 404), réponse sans jeton : FichierIllisible SCHEMA', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    drive.repondre(400);
    expect(await transport.changements(dossier, 'x')).toEqual(
      echec({ type: 'JetonChangementsInvalide' }),
    );
    drive.repondre(200, { changes: [] });
    expect(await transport.changements(dossier, '0-0')).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    drive.repondre(200, {});
    expect(await transport.listerFichiersAppareils(dossier)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
  });

  it('UT-COMP-US-017-03 changements — ignore les fichiers supprimés, à la corbeille, hors du dossier ou qui ne sont pas des fichiers d’appareil', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    const appareil = (id: string, extra: object = {}) => ({
      fileId: id,
      file: {
        id,
        parents: [dossier],
        appProperties: { donejuan: 'appareil', appareil: PC },
        ...extra,
      },
    });
    drive.repondre(200, {
      changes: [
        { fileId: 'a', removed: true },
        appareil('b', { parents: ['autre'] }),
        appareil('c', { trashed: true }),
        {
          fileId: 'd',
          file: { id: 'd', parents: [dossier], appProperties: { donejuan: 'manifeste' } },
        },
        'illisible',
        appareil('g'),
      ],
      newStartPageToken: 'j',
    });

    const changements = valeurDe(await transport.changements(dossier, 'x'));

    expect(changements).toEqual({ fichiers: [{ id: 'g', appareil: PC }], jeton: 'j' });
  });

  it('UT-COMP-US-017-04 dépôts et manifeste — remplacement d’un fichier disparu : RessourceIntrouvable ; création sans identifiant : SCHEMA', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    expect(
      await transport.deposerFichierAppareil({
        dossier,
        contenu: contenu(),
        fichierExistant: 'disparu' as IdFichierDrive,
      }),
    ).toEqual(echec({ type: 'RessourceIntrouvable' }));
    drive.repondre(200, { files: [] });
    drive.repondre(200, {});
    expect(await transport.deposerFichierAppareil({ dossier, contenu: contenu() })).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    drive.repondre(200, { files: [] });
    drive.repondre(503);
    expect(await transport.ecrireManifeste({ dossier, contenu: MANIFESTE })).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
  });

  it('UT-COMP-US-017-05 manifeste — LISEZ-MOI créé une seule fois ; réécriture en place ; échec de LISEZ-MOI rendu', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    const id = valeurDe(await transport.ecrireManifeste({ dossier, contenu: MANIFESTE }));

    expect(await transport.ecrireManifeste({ dossier, contenu: MANIFESTE })).toEqual(succes(id));
    expect(drive.fichiers().filter((f) => f.name === NOM_LISEZ_MOI)).toHaveLength(1);

    const autre = preparer();
    const dossier2 = valeurDe(await autre.transport.preparerDossier());
    autre.drive.repondre(200, { files: [] });
    autre.drive.repondre(200, { id: 'm' });
    autre.drive.repondre(503);
    expect(
      await autre.transport.ecrireManifeste({ dossier: dossier2, contenu: MANIFESTE }),
    ).toEqual(echec({ type: 'ServeurIndisponible' }));
  });

  it('UT-COMP-US-017-06 lecture — corps non binaire : DECOMPRESSION ; manifeste illisible : FichierIllisible ; échec de lecture rendu', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    const client = {
      executer: () => Promise.resolve(succes({ statut: 200, corps: 'texte', date: undefined })),
    } as unknown as ClientGoogle;
    expect(
      await new TransportSynchroDrive(client).lireFichierAppareil('f' as IdFichierDrive),
    ).toEqual(echec({ type: 'FichierIllisible', cause: 'DECOMPRESSION' }));
    const id = valeurDe(await transport.ecrireManifeste({ dossier, contenu: MANIFESTE }));
    drive.modifierALaMain(id);
    expect((await transport.lireManifeste(dossier)).ok).toBe(false);
    drive.repondre(200, { files: [{ id }] });
    drive.repondre(500);
    expect(await transport.lireManifeste(dossier)).toEqual(echec({ type: 'ServeurIndisponible' }));
  });
});
