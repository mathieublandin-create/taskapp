/**
 * Éléments inconnus du fichier d'appareil, cas limites (ST-US-017 v0.11 §6.8 n° 12, hypothèses H-11, H-12 ; tests
 * complémentaires de la tranche H2). Complète UT-US-017-86.
 */
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  encoderFichierAppareil,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';
import { valeurDe } from '@tests/support/environnement';
import { registre } from '@tests/support/fabriques/etat-local';
import { idArbitraire } from '@tests/support/synchronisation/ecritures-concurrentes';
import { echec } from '@src/commun/domaine/resultat';
import { hlc, idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

const O = idObjectif(1);
const h1 = hlc('2026-10-21T08:00:00.000Z', 0, PC);
const h2 = hlc('2026-10-21T08:05:00.000Z', 1, SMARTPHONE);
const intitule = registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier', h2);
const CONTENU: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: SMARTPHONE,
  registres: [intitule],
  journal: [],
};

type Brut = Record<string, unknown>;
const ouvrir = (octets: Uint8Array): Brut =>
  JSON.parse(gunzipSync(octets).toString('utf8')) as Brut;
const sceller = async (objet: Brut): Promise<Uint8Array> => {
  const { empreinte: _e, ...sans } = objet;
  const scelle = { ...sans, empreinte: await empreinteSha256(serialiserCanonique(sans)) };
  return new Uint8Array(gzipSync(Buffer.from(serialiserCanonique(scelle), 'utf8')));
};
const hlcBrut = (indice: number) => ({
  physique: '2026-10-21T08:00:00.000Z',
  compteur: 0,
  appareil: indice,
});

describe('Éléments inconnus du fichier d’appareil : cas limites (n° 12)', () => {
  it('UT-COMP-US-017-4-28 une valeur écartée dont le registre écarté ou gagnant est inconnu est ignorée, sans être conservée (H-12) ; les autres sont lues', async () => {
    const brut = ouvrir(await encoderFichierAppareil(CONTENU));
    const [connu] = brut['registres'] as ReadonlyArray<Brut>;
    const inconnu = { type: 'ETIQUETTE', id: 'e-1', champ: 'nom', valeur: 'x', hlc: hlcBrut(0) };
    const futur = await sceller({
      ...brut,
      valeursEcartees: [
        { id: idArbitraire(1), motif: 'CONFLIT', ecartee: inconnu, gagnante: connu },
        { id: idArbitraire(2), motif: 'CONFLIT', ecartee: connu, gagnante: inconnu },
        {
          id: idArbitraire(3),
          motif: 'DONNEES_EFFACEES',
          ecartee: inconnu,
          generation: hlcBrut(0),
        },
        { id: idArbitraire(4), motif: 'CONFLIT', ecartee: connu, gagnante: connu },
      ],
    });

    const lu = valeurDe(await decoderFichierAppareil(futur));

    expect(lu.valeursEcartees?.map((v) => v.id)).toEqual([idArbitraire(4)]);
    expect('inconnus' in lu).toBe(false);
  });

  it('UT-COMP-US-017-4-29 entrée de journal inconnue : identifiant vide ou non textuel, HLC d’un appareil hors table : ignorée ; registre inconnu au contexte vide : relu sans contexte ; doublon de clé : le plus grand HLC', async () => {
    const brut = ouvrir(await encoderFichierAppareil(CONTENU));
    const futur = await sceller({
      ...brut,
      registres: [
        ...(brut['registres'] as ReadonlyArray<Brut>),
        { type: 'X', id: '1', champ: 'y', valeur: 1, hlc: hlcBrut(0), contexte: {} },
        { type: 'X', id: '1', champ: 'y', valeur: 2, hlc: { ...hlcBrut(0), compteur: 3 } },
      ],
      journal: [
        { type: 'ETIQUETAGE', id: '', hlc: hlcBrut(0) },
        { type: 'ETIQUETAGE', id: 7, hlc: hlcBrut(0) },
        { type: 'ETIQUETAGE', id: 'evt', hlc: hlcBrut(9) },
      ],
    });

    const lu = valeurDe(await decoderFichierAppareil(futur));

    expect(lu.registres).toEqual([intitule]);
    expect(lu.inconnus).toStrictEqual({
      registres: [
        {
          type: 'X',
          id: '1',
          champ: 'y',
          valeur: 2,
          hlc: hlc('2026-10-21T08:00:00.000Z', 3, SMARTPHONE),
        },
      ],
      evenements: [],
    });
  });

  it('UT-COMP-US-017-4-30 un registre inconnu au HLC invalide rend le fichier illisible (SCHEMA), comme un registre connu ; un registre inconnu écrit avec un contexte vide est réécrit sans contexte', async () => {
    const brut = ouvrir(await encoderFichierAppareil(CONTENU));
    const altere = await sceller({
      ...brut,
      registres: [{ type: 'X', id: '1', champ: 'y', valeur: 1, hlc: hlcBrut(9) }],
    });
    expect(await decoderFichierAppareil(altere)).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );

    const octets = await encoderFichierAppareil({
      ...CONTENU,
      inconnus: {
        registres: [{ type: 'X', id: '1', champ: 'y', valeur: 1, hlc: h1, contexte: {} }],
        evenements: [],
      },
    });
    const ecrits = ouvrir(octets)['registres'] as ReadonlyArray<Brut>;
    expect(ecrits.map((r) => 'contexte' in r)).toEqual([false, false]);
  });
});
