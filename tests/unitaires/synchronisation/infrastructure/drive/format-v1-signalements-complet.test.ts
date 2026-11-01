/**
 * Lecture tolérante des tableaux `valeursEcartees` et `lectures` du schéma 1 (ST-US-017 v0.5 §5.2, §5.3 ; DAT v0.11.7
 * §4.2 : motif lu avant la forme, entrées lâches, compatibilité avec les fichiers de l'incrément 1). Complète
 * UT-US-017-52 (tests complémentaires de la tranche B2).
 */
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  encoderFichierAppareil,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';
import {
  h,
  idArbitraire,
  intituleTache,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idTache, PC, SMARTPHONE } from '@tests/support/valeurs';

const T1 = idTache(1);
const SANS_SIGNALEMENT: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: SMARTPHONE,
  registres: [intituleTache(T1, 'B', h(2, SMARTPHONE))],
  journal: [],
};
const AVEC_SIGNALEMENTS: ContenuFichierAppareil = {
  ...SANS_SIGNALEMENT,
  valeursEcartees: [
    {
      id: idArbitraire(1),
      motif: 'SUPPRESSION',
      ecartee: intituleTache(T1, 'A', h(1, PC)),
      gagnante: suppressionTache(T1, h(2, SMARTPHONE)),
    },
  ],
  lectures: [{ id: idArbitraire(1), hlc: h(3, PC) }],
};

type Brut = Record<string, unknown>;

const brutDe = async (contenu: ContenuFichierAppareil): Promise<Brut> =>
  JSON.parse(gunzipSync(await encoderFichierAppareil(contenu)).toString('utf8')) as Brut;

const resceller = async (objet: Brut): Promise<Uint8Array> => {
  const { empreinte: _ancienne, ...sansEmpreinte } = objet;
  const scelle = {
    ...sansEmpreinte,
    empreinte: await empreinteSha256(serialiserCanonique(sansEmpreinte)),
  };
  return new Uint8Array(gzipSync(Buffer.from(serialiserCanonique(scelle), 'utf8')));
};

/** Fichier avec signalements dont la première valeur écartée est transformée par `modifier`. */
const avecValeurModifiee = async (modifier: (valeur: Brut) => unknown): Promise<Uint8Array> => {
  const brut = await brutDe(AVEC_SIGNALEMENTS);
  const [premiere] = brut['valeursEcartees'] as ReadonlyArray<Brut>;
  return resceller({ ...brut, valeursEcartees: [modifier(premiere ?? {})] });
};

const SCHEMA = echec({ type: 'FichierIllisible', cause: 'SCHEMA' });

describe('Signalements du schéma 1 : lecture tolérante (ST-US-017 v0.5 §5.2, §5.3)', () => {
  it('UT-COMP-US-017-2-19 fichier de l’incrément 1 (tableaux vides ou absents) : lu sans valeursEcartees ni lectures', async () => {
    const brut = await brutDe(SANS_SIGNALEMENT);
    const { lectures: _l, valeursEcartees: _v, ...sansTableaux } = brut;

    expect([brut['valeursEcartees'], brut['lectures']]).toEqual([[], []]);
    expect(await decoderFichierAppareil(await resceller(brut))).toEqual(succes(SANS_SIGNALEMENT));
    expect(await decoderFichierAppareil(await resceller(sansTableaux))).toEqual(
      succes(SANS_SIGNALEMENT),
    );
  });

  it('UT-COMP-US-017-2-20 propriété inconnue d’une entrée tolérée ; registre d’un champ inconnu : entrée ignorée', async () => {
    const enPlus = await avecValeurModifiee((v) => ({ ...v, ajoutFutur: 1 }));
    const champInconnu = await avecValeurModifiee((v) => ({
      ...v,
      ecartee: { ...(v['ecartee'] as Brut), champ: 'couleur' },
    }));

    expect(await decoderFichierAppareil(enPlus)).toEqual(succes(AVEC_SIGNALEMENTS));
    expect(await decoderFichierAppareil(champInconnu)).toEqual(
      succes({ ...AVEC_SIGNALEMENTS, valeursEcartees: undefined }),
    );
    const lu = await decoderFichierAppareil(champInconnu);
    expect(lu.ok && 'valeursEcartees' in lu.valeur).toBe(false);
  });

  it.each([
    ['pas un objet', (): unknown => 'texte'],
    ['sans motif', ({ motif: _m, ...v }: Brut): unknown => v],
    ['identifiant mal formé', (v: Brut): unknown => ({ ...v, id: 'court' })],
    ['gagnante absente', ({ gagnante: _g, ...v }: Brut): unknown => v],
    ['generation absente', (v: Brut): unknown => ({ ...v, motif: 'DONNEES_EFFACEES' })],
    [
      'gagnante invalide',
      (v: Brut): unknown => ({ ...v, gagnante: { ...(v['gagnante'] as Brut), valeur: 42 } }),
    ],
    [
      'écartée invalide',
      (v: Brut): unknown => ({ ...v, ecartee: { ...(v['ecartee'] as Brut), id: 'x' } }),
    ],
  ])(
    'UT-COMP-US-017-2-21 valeur écartée mal formée (%s) : FichierIllisible SCHEMA',
    async (_cas, modifier) => {
      expect(await decoderFichierAppareil(await avecValeurModifiee(modifier))).toEqual(SCHEMA);
    },
  );

  it('UT-COMP-US-017-2-22 lecture mal formée : FichierIllisible SCHEMA ; registre écarté d’un type inconnu : entrée ignorée', async () => {
    const brut = await brutDe(AVEC_SIGNALEMENTS);
    const lectureInvalide = await resceller({ ...brut, lectures: [{ id: idArbitraire(1) }] });
    const typeInconnu = await avecValeurModifiee((v) => ({
      ...v,
      gagnante: { ...(v['gagnante'] as Brut), type: 'PROJET' },
    }));

    expect(await decoderFichierAppareil(lectureInvalide)).toEqual(SCHEMA);
    const lu = await decoderFichierAppareil(typeInconnu);
    expect(lu.ok && lu.valeur.valeursEcartees).toBeUndefined();
  });
});
