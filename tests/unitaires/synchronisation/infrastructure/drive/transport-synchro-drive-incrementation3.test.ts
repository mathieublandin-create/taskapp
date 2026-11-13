/**
 * Compléments de TransportSynchroDrive pour l'incrément 3 (ST-US-017 v0.10.1 §4.7, §6.7, §7 ; tranche R1) :
 * requêtes émises, réponses incomplètes, erreurs de transport. Drive v3 REST simulé derrière `fetch`.
 */
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { ClientGoogle } from '@src/infrastructure-google';
import type { IdFichierDrive } from '@src/synchronisation/application/ports/transport-synchro';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { TransportSynchroDrive } from '@src/synchronisation/infrastructure/drive/transport-synchro-drive';
import { DriveHttpSimule } from '@tests/doublures/drive-http-simule';
import { valeurDe } from '@tests/support/environnement';
import { SMARTPHONE } from '@tests/support/valeurs';

const contenu: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: SMARTPHONE,
  registres: [],
  journal: [],
};

const preparer = () => {
  const drive = new DriveHttpSimule();
  const transport = new TransportSynchroDrive(
    new ClientGoogle({ lireJeton: () => 'jeton', fetch: drive.fetch }),
  );
  return { drive, transport };
};

const CREE = '2026-01-01T00:00:00.000Z';

describe('TransportSynchroDrive, incrément 3 (ST-US-017 v0.10.1)', () => {
  it('UT-COMP-US-017-58 listerDossiers et inventorierDossier — ordre canonique (date, puis identifiant) ; date absente ou illisible : FichierIllisible SCHEMA', async () => {
    const { drive, transport } = preparer();
    drive.repondre(200, {
      files: [
        { id: 'b', createdTime: CREE },
        { id: 'c', createdTime: '2026-01-02T00:00:00.000Z' },
        { id: 'a', createdTime: CREE },
        { id: 'a', createdTime: CREE },
        { id: 'd', createdTime: CREE },
        { id: 'b', createdTime: CREE },
        { id: 'z', createdTime: '2025-12-31T00:00:00.000Z' },
      ],
    });
    expect(valeurDe(await transport.listerDossiers()).map((d) => d.id)).toEqual([
      'z',
      'a',
      'a',
      'b',
      'b',
      'd',
      'c',
    ]);

    drive.repondre(200, { files: [{ id: 'a' }] });
    expect(await transport.listerDossiers()).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    drive.repondre(200, { files: [{ createdTime: CREE }] });
    expect(await transport.listerDossiers()).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    drive.repondre(200, { files: [{ id: 'a', createdTime: 'hier' }] });
    expect(await transport.inventorierDossier('d' as IdFichierDrive)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    drive.repondre(200, { files: [] });
    drive.repondre(200, { files: [{ id: 'm', createdTime: 'hier' }] });
    expect(await transport.inventorierDossier('d' as IdFichierDrive)).toEqual(
      succes({ manifestes: [], fichiers: [] }),
    );
  });

  it('UT-COMP-US-017-59 requêtes — toute liste porte trashed = false et demande version ; le dépôt demande id,version ; la suppression est un PATCH trashed, jamais un DELETE', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    valeurDe(await transport.listerDossiers());
    valeurDe(await transport.inventorierDossier(dossier));
    const depot = valeurDe(await transport.deposerFichierAppareil({ dossier, contenu }));
    valeurDe(await transport.supprimerFichier(depot.id));

    const listes = drive.requetes.filter((r) => r.methode === 'GET' && r.url.includes('?q='));
    expect(listes.length).toBeGreaterThan(0);
    listes.forEach((r) => {
      expect(new URL(r.url).searchParams.get('q')).toContain('trashed = false');
    });
    expect(
      drive.requetes
        .filter((r) => r.methode === 'GET' && new URL(r.url).pathname === '/drive/v3/files')
        .some((r) => (new URL(r.url).searchParams.get('fields') ?? '').includes('version')),
    ).toBe(true);
    const envois = drive.requetes.filter((r) => r.url.includes('/upload/'));
    expect(envois).toHaveLength(1);
    expect(new URL(envois[0]?.url ?? '').searchParams.get('fields')).toBe('id,version');
    expect(drive.requetes.some((r) => r.methode === 'DELETE')).toBe(false);
    expect(drive.requetes.at(-1)?.methode).toBe('PATCH');
  });

  it('UT-COMP-US-017-60 dépôt et suppression — version absente de la réponse : id seul ; id absent : SCHEMA ; erreurs de transport traduites ; fichier introuvable : succès', async () => {
    const { drive, transport } = preparer();
    const dossier = valeurDe(await transport.preparerDossier());
    const existant = 'x' as IdFichierDrive;
    drive.repondre(200, { id: 'x' });
    expect(
      await transport.deposerFichierAppareil({ dossier, contenu, fichierExistant: existant }),
    ).toEqual(succes({ id: 'x' }));
    drive.repondre(200, { id: 'x', version: '7' });
    expect(
      await transport.deposerFichierAppareil({ dossier, contenu, fichierExistant: existant }),
    ).toEqual(succes({ id: 'x', version: '7' }));
    drive.repondre(200, {});
    expect(
      await transport.deposerFichierAppareil({ dossier, contenu, fichierExistant: existant }),
    ).toEqual(echec({ type: 'FichierIllisible', cause: 'SCHEMA' }));

    drive.repondre(404);
    expect(await transport.supprimerFichier(existant)).toEqual(succes(undefined));
    drive.repondre(503);
    expect(await transport.supprimerFichier(existant)).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(503);
    expect(await transport.listerDossiers()).toEqual(echec({ type: 'ServeurIndisponible' }));
    drive.repondre(503);
    expect(await transport.inventorierDossier(dossier)).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(200, { files: [] });
    drive.repondre(503);
    expect(await transport.inventorierDossier(dossier)).toEqual(
      echec({ type: 'ServeurIndisponible' }),
    );
    drive.repondre(404);
    expect(await transport.lireContenuManifeste(existant)).toEqual(
      echec({ type: 'RessourceIntrouvable' }),
    );
  });

  it('UT-COMP-US-017-61 inventorierDossier — un fichier sans propriétés d’appareil dans la liste est ignoré', async () => {
    const { drive, transport } = preparer();
    drive.repondre(200, { files: [] });
    drive.repondre(200, { files: [{ id: 'f', createdTime: CREE }] });
    expect(await transport.inventorierDossier('d' as IdFichierDrive)).toEqual(
      succes({ manifestes: [], fichiers: [] }),
    );
  });
});
