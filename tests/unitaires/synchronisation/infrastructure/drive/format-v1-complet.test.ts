/**
 * Format Drive, schéma 1 : compléments (ST-US-017 §5.2, §5.3) — toutes les valeurs de registre et tous les types
 * d'entrée de journal en aller-retour, génération nouvelle, contexte causal ; rejets structurels.
 */
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import type {
  EvenementJournal,
  TypeEvenementJournal,
} from '@src/synchronisation/domaine/evenement-journal';
import { idLien } from '@src/synchronisation/domaine/information';
import {
  decoderFichierAppareil,
  decoderManifeste,
  encoderFichierAppareil,
  encoderManifeste,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  TYPES_ELEMENT_V1,
  TYPES_EVENEMENT_V1,
} from '@src/synchronisation/infrastructure/drive/schemas/v1';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';
import { registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
  TROISIEME,
} from '@tests/support/valeurs';

const O = idObjectif(1);
const P = idObjectif(2);
const T = idTache(1);
const S = idTache(2);
const h0 = hlc('2026-10-21T08:00:00.000Z', 0, PC);
const h1 = hlc('2026-10-21T08:01:00.000Z', 1, SMARTPHONE);
const h2 = hlc('2026-10-21T08:02:00.000Z', 2, TROISIEME);
const ev = (rang: number) => idEvenementTest(idOperation(rang), 0);
const commun = (rang: number) => ({
  id: ev(rang),
  hlc: h1,
  instant: instant('2026-10-21T08:01:00.000Z'),
  jour: date('2026-10-21'),
});
const JOURNAL: ReadonlyArray<EvenementJournal> = [
  {
    ...commun(1),
    type: 'CREATION',
    element: { type: 'OBJECTIF', id: O },
    avant: {},
    apres: { parentId: P, delai: date('2026-12-15') },
  },
  {
    ...commun(2),
    type: 'CREATION',
    element: { type: 'TACHE', id: S },
    avant: {},
    apres: {
      tacheParenteId: T,
      delai: date('2026-12-01'),
      estimation: duree(60),
      objectifIds: [O],
    },
  },
  {
    ...commun(3),
    type: 'MODIFICATION_DELAI',
    element: { type: 'OBJECTIF', id: O },
    avant: {},
    apres: { delai: date('2026-12-15') },
  },
  {
    ...commun(4),
    type: 'MODIFICATION_ESTIMATION',
    element: { type: 'TACHE', id: T },
    avant: { estimation: duree(30) },
    apres: { estimation: duree(90) },
  },
  {
    ...commun(5),
    type: 'RATTACHEMENT',
    element: { type: 'TACHE', id: T },
    avant: {},
    apres: { objectifId: O },
  },
  {
    ...commun(6),
    type: 'DETACHEMENT',
    element: { type: 'TACHE', id: T },
    avant: { objectifId: O },
    apres: {},
  },
  {
    ...commun(7),
    type: 'CHANGEMENT_PARENT',
    element: { type: 'OBJECTIF', id: O },
    avant: { origine: 'CREATION', hlcOrigine: h0 },
    apres: { parentId: P, origine: 'DEPLACEMENT', hlcOrigine: h2 },
  },
  {
    ...commun(8),
    type: 'ABANDON',
    element: { type: 'TACHE', id: T },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'ABANDONNEE', dateAbandon: date('2026-10-21') },
    cause: ev(9),
  },
  { ...commun(10), type: 'SUPPRESSION', element: { type: 'TACHE', id: S }, avant: {}, apres: {} },
];
const CONTENU: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'NOUVELLE', hlc: h2 },
  appareil: SMARTPHONE,
  registres: [
    registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier', h1, {
      [PC]: h0,
      [TROISIEME]: h2,
    }),
    registre({ type: 'OBJECTIF', id: O, champ: 'description' }, 'Texte', h1),
    registre({ type: 'OBJECTIF', id: O, champ: 'delai' }, date('2026-12-15'), h1),
    registre(
      { type: 'OBJECTIF', id: O, champ: 'parent' },
      { parentId: P, origine: 'DEPLACEMENT', hlcOrigine: h2 },
      h1,
    ),
    registre({ type: 'OBJECTIF', id: P, champ: 'suppression' }, true, h1),
    registre(
      { type: 'TACHE', id: S, champ: 'creation' },
      { creeLe: instant('2026-10-21T08:00:00.000Z'), tacheParenteId: T },
      h0,
    ),
    registre({ type: 'TACHE', id: T, champ: 'delai' }, date('2026-12-01'), h0),
    registre(
      { type: 'TACHE', id: T, champ: 'cycleDeVie' },
      {
        etat: 'ABANDONNEE',
        dateAbandon: date('2026-10-21'),
        instantAbandon: instant('2026-10-21T08:01:00.000Z'),
        evenementAbandon: ev(8),
        abandonParCascade: ev(9),
      },
      h1,
    ),
    registre({ type: 'TACHE', id: S, champ: 'cycleDeVie' }, { etat: 'A_FAIRE' }, h1),
    registre({ type: 'LIEN_TACHE_OBJECTIF', id: idLien(T, O), champ: 'actif' }, false, h1),
  ],
  journal: JOURNAL,
};

/** Une entrée par type d'événement : le `Record` impose l'exhaustivité à la compilation (RC-R3-1). */
const UN_PAR_TYPE: Readonly<Record<TypeEvenementJournal, EvenementJournal>> = {
  CREATION: {
    ...commun(20),
    type: 'CREATION',
    element: { type: 'OBJECTIF', id: P },
    avant: {},
    apres: {},
  },
  MODIFICATION_DELAI: {
    ...commun(21),
    type: 'MODIFICATION_DELAI',
    element: { type: 'TACHE', id: T },
    avant: { delai: date('2026-12-01') },
    apres: { delai: date('2026-12-02') },
  },
  MODIFICATION_ESTIMATION: {
    ...commun(22),
    type: 'MODIFICATION_ESTIMATION',
    element: { type: 'TACHE', id: T },
    avant: { estimation: duree(30) },
    apres: { estimation: duree(60) },
  },
  RATTACHEMENT: {
    ...commun(23),
    type: 'RATTACHEMENT',
    element: { type: 'TACHE', id: T },
    avant: {},
    apres: { objectifId: P },
  },
  DETACHEMENT: {
    ...commun(24),
    type: 'DETACHEMENT',
    element: { type: 'TACHE', id: T },
    avant: { objectifId: P },
    apres: {},
  },
  CHANGEMENT_PARENT: {
    ...commun(25),
    type: 'CHANGEMENT_PARENT',
    element: { type: 'OBJECTIF', id: P },
    avant: { parentId: O, origine: 'DEPLACEMENT', hlcOrigine: h1 },
    apres: { origine: 'DEPLACEMENT', hlcOrigine: h2 },
  },
  FIN: {
    ...commun(26),
    type: 'FIN',
    element: { type: 'TACHE', id: T },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'TERMINEE', dateFin: date('2026-10-21') },
  },
  REOUVERTURE: {
    ...commun(27),
    type: 'REOUVERTURE',
    element: { type: 'TACHE', id: T },
    avant: { etat: 'TERMINEE', dateFin: date('2026-10-21') },
    apres: { etat: 'A_FAIRE' },
  },
  ABANDON: {
    ...commun(28),
    type: 'ABANDON',
    element: { type: 'TACHE', id: S },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'ABANDONNEE', dateAbandon: date('2026-10-21') },
  },
  REPRISE: {
    ...commun(29),
    type: 'REPRISE',
    element: { type: 'TACHE', id: S },
    avant: { etat: 'ABANDONNEE', dateAbandon: date('2026-10-21') },
    apres: { etat: 'A_FAIRE' },
    cause: ev(28),
  },
  SUPPRESSION: {
    ...commun(30),
    type: 'SUPPRESSION',
    element: { type: 'OBJECTIF', id: P },
    avant: {},
    apres: {},
  },
};

const ouvrir = (octets: Uint8Array) =>
  JSON.parse(gunzipSync(octets).toString('utf8')) as Record<string, unknown>;
const sceller = async (objet: Record<string, unknown>): Promise<Uint8Array> => {
  const { empreinte: _e, ...sans } = objet;
  const scelle = { ...sans, empreinte: await empreinteSha256(serialiserCanonique(sans)) };
  return new Uint8Array(gzipSync(Buffer.from(serialiserCanonique(scelle), 'utf8')));
};

describe('Format Drive, schéma 1 : compléments (ST-US-017 §5.2)', () => {
  it('UT-COMP-US-017-30 aller-retour de toutes les valeurs de registre, de tous les types d’entrée et d’une génération nouvelle', async () => {
    const octets = await encoderFichierAppareil(CONTENU);

    expect(await decoderFichierAppareil(octets)).toEqual(succes(CONTENU));
    expect(ouvrir(octets)['appareils']).toEqual([SMARTPHONE, PC, TROISIEME].sort());
  });

  it('UT-COMP-US-017-34 aller-retour d’une entrée de journal de chaque type connu du schéma 1, et d’un registre de chaque type d’élément : aucune n’est ignorée', async () => {
    const journal = Object.values(UN_PAR_TYPE);
    const contenu: ContenuFichierAppareil = { ...CONTENU, journal };

    const lu = await decoderFichierAppareil(await encoderFichierAppareil(contenu));

    expect(Object.keys(UN_PAR_TYPE).sort()).toEqual(Object.keys(TYPES_EVENEMENT_V1).sort());
    expect(lu).toEqual(succes(contenu));
    expect(lu.ok && lu.valeur.journal.map((e) => e.type)).toEqual(Object.keys(UN_PAR_TYPE));
    expect(lu.ok && [...new Set(lu.valeur.registres.map((r) => r.cle.type))].sort()).toEqual(
      Object.keys(TYPES_ELEMENT_V1).sort(),
    );
  });

  it('UT-COMP-US-017-31 entrée de journal de type inconnu ignorée ; entrée connue invalide, indice d’appareil hors table, contexte incohérent, racine non objet : SCHEMA', async () => {
    const brut = ouvrir(await encoderFichierAppareil(CONTENU));
    const journal = brut['journal'] as ReadonlyArray<Record<string, unknown>>;
    const registres = brut['registres'] as ReadonlyArray<Record<string, unknown>>;
    const premier = registres[0] ?? {};
    const schema = echec({ type: 'FichierIllisible', cause: 'SCHEMA' });

    expect(
      await decoderFichierAppareil(
        await sceller({ ...brut, journal: [...journal, { type: 'ETIQUETAGE' }] }),
      ),
    ).toEqual(succes(CONTENU));
    expect(
      await decoderFichierAppareil(
        await sceller({ ...brut, journal: [{ ...journal[0], element: 1 }] }),
      ),
    ).toEqual(schema);
    expect(
      await decoderFichierAppareil(
        await sceller({
          ...brut,
          registres: [
            { ...premier, hlc: { physique: '2026-10-21T08:00:00.000Z', compteur: 0, appareil: 9 } },
          ],
        }),
      ),
    ).toEqual(schema);
    expect(
      await decoderFichierAppareil(
        await sceller({
          ...brut,
          registres: [{ ...premier, contexte: { '1': premier['hlc'] as object } }],
        }),
      ),
    ).toEqual(schema);
    expect(
      await decoderFichierAppareil(
        await sceller({ ...brut, registres: [{ ...premier, valeur: 3 }] }),
      ),
    ).toEqual(schema);
    expect(
      await decoderFichierAppareil(
        await sceller({ ...brut, registres: [{ ...premier, id: 'x' }] }),
      ),
    ).toEqual(schema);
    expect(await decoderFichierAppareil(await sceller({ ...brut, appareils: 'x' }))).toEqual(
      schema,
    );
    expect(
      await decoderFichierAppareil(new Uint8Array(gzipSync(Buffer.from('[1]', 'utf8')))),
    ).toEqual(schema);
    expect(
      await decoderFichierAppareil(
        new Uint8Array(gzipSync(Buffer.from('{"schemaVersion":"1"}', 'utf8'))),
      ),
    ).toEqual(schema);
  });

  it('UT-COMP-US-017-32 manifeste — génération nouvelle et restauration en aller-retour ; schemaVersion 2 : FormatPlusRecent ; champ manquant : SCHEMA', async () => {
    const manifeste = {
      schemaVersion: 1,
      generation: { type: 'NOUVELLE', hlc: h2 },
      restauration: h1,
    } as const;
    const octets = await encoderManifeste(manifeste);

    expect(await decoderManifeste(octets)).toEqual(succes(manifeste));
    expect(await decoderManifeste(new TextEncoder().encode('{"schemaVersion":2}'))).toEqual(
      echec({ type: 'FormatPlusRecent', schemaVersion: 2 }),
    );
    expect(await decoderManifeste(new TextEncoder().encode('{"schemaVersion":1}'))).toEqual(
      echec({ type: 'FichierIllisible', cause: 'SCHEMA' }),
    );
    expect(await decoderManifeste(new TextEncoder().encode('{'))).toEqual(
      echec({ type: 'FichierIllisible', cause: 'JSON' }),
    );
  });

  it('UT-COMP-US-017-33 sérialisation canonique — une propriété undefined est omise ; un nombre non fini ou une fonction sont refusés', () => {
    expect(serialiserCanonique({ a: undefined, b: [true, 'x'] })).toBe('{"b":[true,"x"]}');
    expect(() => serialiserCanonique({ a: Number.NaN })).toThrow();
    expect(() => serialiserCanonique(() => 1)).toThrow();
  });
});
