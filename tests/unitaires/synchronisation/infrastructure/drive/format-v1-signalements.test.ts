/**
 * Valeurs écartées et lectures dans le fichier d'appareil, schéma 1 (ST-US-017 v0.5 §5.2) et dans le contenu déposé
 * (`contenuAEnvoyer`). UT-US-017-52.
 */
import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contenuAEnvoyer } from '@src/synchronisation/domaine/depot';
import type { Lecture } from '@src/synchronisation/domaine/lectures';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import {
  decoderFichierAppareil,
  encoderFichierAppareil,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import {
  creeSous,
  delaiTache,
  h,
  idArbitraire,
  intituleTache,
  parentObjectif,
  signalements,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const T1 = idTache(1);
const O1 = idObjectif(1);
const O2 = idObjectif(2);

const VALEURS: ReadonlyArray<ValeurEcartee> = [
  {
    id: idArbitraire(1),
    motif: 'CONFLIT',
    ecartee: intituleTache(T1, 'A', h(1, PC)),
    gagnante: intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) }),
  },
  {
    id: idArbitraire(2),
    motif: 'SUPPRESSION',
    ecartee: delaiTache(T1, '2026-12-10', h(2, TROISIEME), { [PC]: h(0, PC) }),
    gagnante: suppressionTache(T1, h(1, PC)),
    intituleElement: 'Chapitre 1',
  },
  {
    id: idArbitraire(3),
    motif: 'PLACEMENT_ANNULE',
    ecartee: parentObjectif(O1, creeSous(O2, h(1, PC)), h(1, PC)),
    gagnante: parentObjectif(O1, { origine: 'CREATION', hlcOrigine: h(0, PC) }, h(3, SMARTPHONE), {
      [PC]: h(1, PC),
    }),
  },
  {
    id: idArbitraire(4),
    motif: 'DONNEES_EFFACEES',
    ecartee: intituleTache(T1, 'Perdu', h(1, SMARTPHONE)),
    generation: h(5, PC),
  },
];
const LECTURES: ReadonlyArray<Lecture> = [{ id: idArbitraire(1), hlc: h(4, SMARTPHONE) }];
const CONTENU: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: SMARTPHONE,
  registres: [intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) })],
  journal: [],
  valeursEcartees: VALEURS,
  lectures: LECTURES,
};

const resceller = async (objet: Record<string, unknown>): Promise<Uint8Array> => {
  const { empreinte: _ancienne, ...sansEmpreinte } = objet;
  const scelle = {
    ...sansEmpreinte,
    empreinte: await empreinteSha256(serialiserCanonique(sansEmpreinte)),
  };
  return new Uint8Array(gzipSync(Buffer.from(serialiserCanonique(scelle), 'utf8')));
};

describe('Signalements dans le format Drive, schéma 1 (ST-US-017 v0.5 §5.2)', () => {
  it('UT-US-017-52 aller-retour des valeurs écartées et des lectures (table d’appareils) ; motif inconnu ignoré ; contenuAEnvoyer les recopie', async () => {
    const octets = await encoderFichierAppareil(CONTENU);
    const brut = JSON.parse(gunzipSync(octets).toString('utf8')) as Record<string, unknown>;

    expect(await decoderFichierAppareil(octets)).toEqual(succes(CONTENU));
    expect(brut['appareils']).toEqual([SMARTPHONE, PC, TROISIEME].sort());
    expect(brut['valeursEcartees']).toHaveLength(4);
    expect(brut['lectures']).toHaveLength(1);

    // Entrée d’un motif inconnu (version plus récente, même schemaVersion) : ignorée, sans erreur.
    const valeurs = brut['valeursEcartees'] as ReadonlyArray<Record<string, unknown>>;
    const futur = await resceller({
      ...brut,
      valeursEcartees: [...valeurs, { ...valeurs[0], id: 'w'.repeat(52), motif: 'FUTUR' }],
    });
    expect(await decoderFichierAppareil(futur)).toEqual(succes(CONTENU));

    // Contenu déposé : recopiés et triés par identifiant s’ils existent ; absents sinon.
    const etat = etatLocal({ appareilId: SMARTPHONE, registres: CONTENU.registres });
    const parametres = { versionApplication: '0.1.0', generation: { type: 'INITIALE' } } as const;
    const depose = contenuAEnvoyer(etat, {
      ...parametres,
      signalements: signalements([...VALEURS].reverse(), LECTURES),
    });
    expect(depose.valeursEcartees).toEqual(VALEURS);
    expect(depose.lectures).toEqual(LECTURES);
    const sans = contenuAEnvoyer(etat, { ...parametres, signalements: signalements() });
    expect('valeursEcartees' in sans || 'lectures' in sans).toBe(false);
  });
});
