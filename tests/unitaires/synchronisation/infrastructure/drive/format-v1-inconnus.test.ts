/**
 * Coexistence de deux versions de même `schemaVersion` (RG-058 ; ANT-19 ; conventions §10.3 (b) ; ST-US-017 v0.11
 * §5.2, §6.8 n° 12, n° 14) : le décodeur conserve les registres et les entrées de journal inconnus (HLC et contexte
 * traduits en `appareilId`), l'encodeur les réécrit (table d'appareils comprise), `contenuAEnvoyer` les recopie.
 * UT-US-017-86 (rang 11, tranche H2).
 */
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contenuAEnvoyer } from '@src/synchronisation/domaine/depot';
import { ETAT_LOCAL_VIDE } from '@src/synchronisation/domaine/etat-local';
import type { Inconnus } from '@src/synchronisation/domaine/inconnus';
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
import { hlc, idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const O = idObjectif(1);
const h1 = hlc('2026-10-21T08:00:00.000Z', 0, PC);
const h2 = hlc('2026-10-21T08:05:00.000Z', 2, SMARTPHONE);
const h3 = hlc('2026-10-21T08:06:00.000Z', 0, TROISIEME);
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
    registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier le guide', h2),
  ],
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
/** Indice d'un appareil dans la table du fichier. */
const indice = (brut: Brut, appareil: string): number =>
  (brut['appareils'] as ReadonlyArray<string>).indexOf(appareil);
const hlcBrut = (brut: Brut, iso: string, compteur: number, appareil: string) => ({
  physique: iso,
  compteur,
  appareil: indice(brut, appareil),
});

describe('Éléments inconnus dans le fichier d’appareil (n° 12, n° 14)', () => {
  it('UT-US-017-86 décodage : registre d’un champ inconnu (type connu) et d’un type inconnu conservés, HLC et contexte traduits ; entrée de journal inconnue avec id et hlc conservée sans ses clés id et hlc ; entrée inconnue sans hlc ignorée ; connus inchangés', async () => {
    const brut = ouvrir(await encoderFichierAppareil(CONTENU));
    const registres = brut['registres'] as ReadonlyArray<Brut>;
    const futur = await sceller({
      ...brut,
      registres: [
        ...registres,
        {
          type: 'OBJECTIF',
          id: O,
          champ: 'importance',
          valeur: { niveau: 3 },
          hlc: hlcBrut(brut, '2026-10-21T08:05:00.000Z', 2, SMARTPHONE),
          contexte: {
            [String(indice(brut, PC))]: hlcBrut(brut, '2026-10-21T08:00:00.000Z', 0, PC),
          },
        },
        {
          type: 'ETIQUETTE',
          id: 'e-1',
          champ: 'nom',
          valeur: 'Travail',
          hlc: hlcBrut(brut, '2026-10-21T08:00:00.000Z', 0, PC),
        },
      ],
      journal: [
        {
          type: 'ETIQUETAGE',
          id: 'evt-futur',
          hlc: hlcBrut(brut, '2026-10-21T08:05:00.000Z', 2, SMARTPHONE),
          element: { type: 'OBJECTIF', id: O },
          nouveau: 1,
        },
        { type: 'ETIQUETAGE' },
      ],
    });

    const lu = valeurDe(await decoderFichierAppareil(futur));

    expect(lu.registres).toEqual(CONTENU.registres);
    expect(lu.journal).toEqual([]);
    expect(lu.inconnus).toEqual({
      registres: [
        { type: 'ETIQUETTE', id: 'e-1', champ: 'nom', valeur: 'Travail', hlc: h1 },
        {
          type: 'OBJECTIF',
          id: O,
          champ: 'importance',
          valeur: { niveau: 3 },
          hlc: h2,
          contexte: { [PC]: h1 },
        },
      ],
      evenements: [
        {
          id: 'evt-futur',
          hlc: h2,
          brut: { type: 'ETIQUETAGE', element: { type: 'OBJECTIF', id: O }, nouveau: 1 },
        },
      ],
    });
    expect(
      'inconnus' in valeurDe(await decoderFichierAppareil(await encoderFichierAppareil(CONTENU))),
    ).toBe(false);
  });

  it('UT-US-017-86 encodage : aller-retour identique, appareils cités par les seuls inconnus ajoutés à la table ; contenuAEnvoyer recopie les inconnus non vides', async () => {
    const inconnus: Inconnus = {
      registres: [
        {
          type: 'OBJECTIF',
          id: O,
          champ: 'importance',
          valeur: 3,
          hlc: h3,
          contexte: { [PC]: h1 },
        },
      ],
      evenements: [{ id: 'evt-futur', hlc: h3, brut: { type: 'ETIQUETAGE', x: [1, 2] } }],
    };
    const avecInconnus: ContenuFichierAppareil = { ...CONTENU, inconnus };
    const octets = await encoderFichierAppareil(avecInconnus);

    expect(ouvrir(octets)['appareils']).toEqual([SMARTPHONE, PC, TROISIEME].sort());
    expect(await decoderFichierAppareil(octets)).toEqual({ ok: true, valeur: avecInconnus });

    const etat = ETAT_LOCAL_VIDE(SMARTPHONE);
    const p = { versionApplication: '0.1.0', generation: { type: 'INITIALE' } as const };
    expect(contenuAEnvoyer(etat, { ...p, inconnus }).inconnus).toEqual(inconnus);
    expect(
      'inconnus' in contenuAEnvoyer(etat, { ...p, inconnus: { registres: [], evenements: [] } }),
    ).toBe(false);
    expect('inconnus' in contenuAEnvoyer(etat, p)).toBe(false);
  });
});
