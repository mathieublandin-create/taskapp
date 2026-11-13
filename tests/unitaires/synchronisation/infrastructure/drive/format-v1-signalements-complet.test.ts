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
import { contenuAEnvoyer } from '@src/synchronisation/domaine/depot';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import {
  creeSous,
  h,
  idArbitraire,
  intituleTache,
  parentObjectif,
  signalements,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

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
    const motifFutur = await avecValeurModifiee((v) => ({ ...v, motif: 'FUTUR', ecartee: 1 }));
    const luFutur = await decoderFichierAppareil(motifFutur);
    expect(luFutur.ok && 'valeursEcartees' in luFutur.valeur).toBe(false);
    expect(luFutur.ok && luFutur.valeur.lectures).toEqual(AVEC_SIGNALEMENTS.lectures);
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

  it('UT-COMP-US-017-2-23 aller-retour des quatre motifs, écrits triés par identifiant ; contenuAEnvoyer avec des lectures seules', async () => {
    const O1 = idObjectif(1);
    const valeurs: ReadonlyArray<ValeurEcartee> = [
      {
        id: idArbitraire(4),
        motif: 'DONNEES_EFFACEES',
        ecartee: intituleTache(T1, 'Perdu', h(1, TROISIEME)),
        generation: h(5, PC),
      },
      {
        id: idArbitraire(3),
        motif: 'PLACEMENT_ANNULE',
        ecartee: parentObjectif(O1, creeSous(idObjectif(2), h(1, PC)), h(1, PC)),
        gagnante: parentObjectif(O1, { origine: 'CREATION', hlcOrigine: h(0, PC) }, h(3, PC)),
      },
      {
        id: idArbitraire(2),
        motif: 'SUPPRESSION',
        ecartee: intituleTache(T1, 'A', h(1, PC)),
        gagnante: suppressionTache(T1, h(2, SMARTPHONE)),
        intituleElement: 'Chapitre 1',
      },
      {
        id: idArbitraire(1),
        motif: 'CONFLIT',
        ecartee: intituleTache(T1, 'A', h(1, PC)),
        gagnante: intituleTache(T1, 'B', h(2, SMARTPHONE)),
      },
    ];
    const contenu = { ...SANS_SIGNALEMENT, valeursEcartees: valeurs };
    const brut = await brutDe(contenu);

    expect((brut['valeursEcartees'] as ReadonlyArray<Brut>).map((v) => v['id'])).toEqual(
      [1, 2, 3, 4].map(idArbitraire),
    );
    expect(brut['appareils']).toEqual([SMARTPHONE, PC, TROISIEME].sort());
    expect(await decoderFichierAppareil(await encoderFichierAppareil(contenu))).toEqual(
      succes({ ...contenu, valeursEcartees: [...valeurs].reverse() }),
    );
    const etat = etatLocal({ appareilId: SMARTPHONE });
    const lecture = { id: idArbitraire(1), hlc: h(3, PC) };
    const depose = contenuAEnvoyer(etat, {
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      signalements: signalements([], [lecture]),
    });
    expect(['valeursEcartees' in depose, depose.lectures]).toEqual([false, [lecture]]);
    const valeursSeules = contenuAEnvoyer(etat, {
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      signalements: signalements(valeurs),
    });
    expect(['lectures' in valeursSeules, valeursSeules.valeursEcartees]).toEqual([
      false,
      [...valeurs].reverse(),
    ]);
  });

  it('UT-COMP-US-017-2-24 DONNEES_EFFACEES dont le registre écarté est inconnu : entrée ignorée', async () => {
    const effacee = await avecValeurModifiee(({ gagnante, ...v }) => ({
      ...v,
      motif: 'DONNEES_EFFACEES',
      generation: (gagnante as Brut)['hlc'],
      ecartee: { ...(v['ecartee'] as Brut), type: 'PROJET' },
    }));

    const lu = await decoderFichierAppareil(effacee);

    expect(lu.ok && lu.valeur.valeursEcartees).toBeUndefined();
  });
});
