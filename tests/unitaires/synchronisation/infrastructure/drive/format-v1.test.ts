import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  decoderManifeste,
  encoderFichierAppareil,
  encoderManifeste,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';
import { registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O = idObjectif(1);
const T = idTache(1);
const h1 = hlc('2026-10-21T08:00:00.000Z', 0, PC);
const h2 = hlc('2026-10-21T08:05:00.000Z', 3, SMARTPHONE);
const CONTENU: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: SMARTPHONE,
  registres: [
    registre(
      { type: 'OBJECTIF', id: O, champ: 'creation' },
      { creeLe: instant('2026-10-21T08:00:00.000Z') },
      h1,
    ),
    registre({ type: 'OBJECTIF', id: O, champ: 'delai' }, undefined, h2, { [PC]: h1 }),
    registre(
      { type: 'OBJECTIF', id: O, champ: 'parent' },
      { origine: 'CREATION', hlcOrigine: h1 },
      h1,
    ),
    registre({ type: 'TACHE', id: T, champ: 'estimationInitiale' }, duree(90), h2),
    registre(
      { type: 'TACHE', id: T, champ: 'cycleDeVie' },
      {
        etat: 'TERMINEE',
        dateFin: date('2026-10-21'),
        instantFin: instant('2026-10-21T08:05:00.000Z'),
      },
      h2,
    ),
  ],
  journal: [],
};

/** Ouvre le fichier encodé, applique une modification au JSON, le recompresse (modification « à la main »). */
const modifierALaMain = (
  octets: Uint8Array,
  modification: (objet: Record<string, unknown>) => void,
): Uint8Array => {
  const objet = JSON.parse(gunzipSync(octets).toString('utf8')) as Record<string, unknown>;
  modification(objet);
  return new Uint8Array(gzipSync(Buffer.from(JSON.stringify(objet), 'utf8')));
};

/** Recalcule l'empreinte d'un objet de fichier et le recompresse, avec la sérialisation canonique de l'application. */
const resceller = async (objet: Record<string, unknown>): Promise<Uint8Array> => {
  const { empreinte: _ancienne, ...sansEmpreinte } = objet;
  const scelle = {
    ...sansEmpreinte,
    empreinte: await empreinteSha256(serialiserCanonique(sansEmpreinte)),
  };
  return new Uint8Array(gzipSync(Buffer.from(serialiserCanonique(scelle), 'utf8')));
};

describe('Format Drive, schéma 1 (ST-US-017 §5.2)', () => {
  it('UT-US-017-12 encoderFichierAppareil puis decoderFichierAppareil — l’aller-retour rend un contenu égal (null, ISO, table d’appareils)', async () => {
    const octets = await encoderFichierAppareil(CONTENU);
    const objet = JSON.parse(gunzipSync(octets).toString('utf8')) as Record<string, unknown>;

    expect(await decoderFichierAppareil(octets)).toEqual(succes(CONTENU));
    expect(objet['appareils']).toEqual([SMARTPHONE, PC].sort());
    expect(objet['empreinte']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('UT-US-017-13 decoderFichierAppareil — rejette un fichier non gzip, du JSON invalide, un champ manquant ou modifié à la main (V-02)', async () => {
    const octets = await encoderFichierAppareil(CONTENU);
    const nonGzip = new TextEncoder().encode('{"a":1}');
    const jsonInvalide = new Uint8Array(gzipSync(Buffer.from('{ pas du json', 'utf8')));
    const sansRegistres = modifierALaMain(octets, (o) => {
      delete o['registres'];
    });
    const modifie = modifierALaMain(octets, (o) => {
      o['versionApplication'] = '9.9.9';
    });

    expect(await decoderFichierAppareil(nonGzip)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'DECOMPRESSION' }),
    );
    expect(await decoderFichierAppareil(jsonInvalide)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'JSON' }),
    );
    expect(await decoderFichierAppareil(sansRegistres)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    expect(await decoderFichierAppareil(modifie)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'EMPREINTE' }),
    );
  });

  it('UT-US-017-14 decoderFichierAppareil — tolère un champ inconnu et ignore un registre de champ inconnu ; schemaVersion 2 → FormatPlusRecent', async () => {
    const octets = await encoderFichierAppareil(CONTENU);
    const brut = JSON.parse(gunzipSync(octets).toString('utf8')) as Record<string, unknown>;
    const registres = brut['registres'] as ReadonlyArray<Record<string, unknown>>;
    // Fichier d'une version plus récente de même schemaVersion (ANT-19), correctement scellé :
    const futur = await resceller({
      ...brut,
      nouveauChamp: { x: 1 },
      registres: [...registres, { ...registres[0], champ: 'importance', valeur: 3 }],
    });
    const plusRecent = await resceller({ ...brut, schemaVersion: 2 });

    expect(await decoderFichierAppareil(futur)).toEqual(succes(CONTENU));
    expect(await decoderFichierAppareil(plusRecent)).toEqual(
      echec({ type: 'FormatPlusRecent', schemaVersion: 2 }),
    );
  });

  it('UT-US-017-15 encoderManifeste puis decoderManifeste — aller-retour, empreinte vérifiée', async () => {
    const manifeste = { schemaVersion: 1, generation: { type: 'INITIALE' } } as const;
    const octets = await encoderManifeste(manifeste);
    const modifie = new TextEncoder().encode(
      new TextDecoder().decode(octets).replace('"schemaVersion":1', '"schemaVersion":1,"x":0'),
    );

    expect(await decoderManifeste(octets)).toEqual(succes(manifeste));
    expect(await decoderManifeste(modifie)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'EMPREINTE' }),
    );
  });
});
