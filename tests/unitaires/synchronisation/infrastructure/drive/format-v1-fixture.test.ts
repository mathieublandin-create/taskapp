/**
 * Lecture de chaque version publiée du format (conventions §10.3 (a) ; RG-058 ; ST-US-017 v0.11 §5.3) : le fichier
 * d'appareil du schéma 1, figé dans `tests/fixtures/drive/v1/` au rang 11 (tous les types de registre et d'entrée de
 * journal de l'incrément 1, génération nouvelle, contextes, une lecture), est lu sans erreur et réécrit à l'identique
 * par la version courante. À chaque nouveau `schemaVersion`, un dossier `v<n>/` et son test s'ajoutent (migration
 * `migrerV<n>VersV<n+1>`). UT-US-017-88 (rang 11, tranche H2).
 */
import { readFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
  decoderFichierAppareil,
  encoderFichierAppareil,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import { valeurDe } from '@tests/support/environnement';

const FIXTURE = 'tests/fixtures/drive/v1/fichier-appareil.json';

describe('Format du Drive, versions publiées (conventions §10.3 a)', () => {
  it('UT-US-017-88 le fichier figé du schéma 1 est lu (empreinte vérifiée) puis réécrit à l’identique, sans élément inconnu', async () => {
    const texte = readFileSync(FIXTURE, 'utf8');
    const objet = JSON.parse(texte) as Record<string, unknown>;
    expect(objet['schemaVersion']).toBe(1);

    const contenu = valeurDe(
      await decoderFichierAppareil(new Uint8Array(gzipSync(Buffer.from(texte, 'utf8')))),
    );
    expect(contenu.registres).toHaveLength(10);
    expect(contenu.journal).toHaveLength(9);
    expect(contenu.lectures).toHaveLength(1);
    expect('inconnus' in contenu).toBe(false);

    const reecrit = JSON.parse(
      gunzipSync(await encoderFichierAppareil(contenu)).toString('utf8'),
    ) as unknown;
    expect(reecrit).toEqual(objet);
  });
});
