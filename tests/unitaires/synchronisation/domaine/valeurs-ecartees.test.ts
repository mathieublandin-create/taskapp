/**
 * Valeurs écartées (ST-US-017 v0.5 §6.6 n° 1 à 6 ; DAT §4.2.1 ; RG-036, RG-047, RG-056) : identifiant déterministe,
 * critère du contexte causal, pierre tombale étendue (H-1), signalement unique, lectures. UT-US-017-40 à 47.
 */
import { describe, expect, it } from 'vitest';
import { condensatSha256, encoderBase32Hex } from '@src/synchronisation/domaine/condensat-sha256';
import {
  compterALire,
  fusionnerLectures,
  type Lecture,
} from '@src/synchronisation/domaine/lectures';
import {
  detecterValeursEcartees,
  fusionnerValeursEcartees,
  idValeurEcartee,
  type IdValeurEcartee,
  type ValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import {
  creationObjectifRegistre,
  creationTacheRegistre,
  creeSous,
  delaiTache,
  etatFusionnable,
  h,
  idArbitraire,
  intituleObjectif,
  intituleTache,
  lien,
  parentObjectif,
  parIdentifiant,
  suppressionObjectif,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, PC, SMARTPHONE } from '@tests/support/valeurs';

const T1 = idTache(1);
const T2 = idTache(2);
const T3 = idTache(3);
const O1 = idObjectif(1);
const O3 = idObjectif(3);
const utf8 = (texte: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(texte);
const hex = (octets: Uint8Array): string =>
  [...octets].map((o) => o.toString(16).padStart(2, '0')).join('');
const cleIntitule = { type: 'TACHE', id: T1, champ: 'intitule' } as const;
const cleDelai = { type: 'TACHE', id: T1, champ: 'delai' } as const;

// S10 : « Plan » créé par le PC (t0), renommé « A » sur le PC (t1), puis « B » sur le smartphone hors ligne (t2).
const plan = intituleTache(T1, 'Plan', h(0, PC));
const renommeA = intituleTache(T1, 'A', h(1, PC));
const renommeB = intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) });

describe('Identifiant d’une valeur écartée (DAT §4.2.1, signalement unique)', () => {
  it('UT-US-017-40 condensat SHA-256 synchrone, base32hex et idValeurEcartee déterministe, sans « : »', async () => {
    expect(hex(condensatSha256(utf8('abc')))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(hex(condensatSha256(new Uint8Array()))).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    const long = utf8('Échéance « Rédiger le plan » — '.repeat(9));
    const reference = new Uint8Array(await crypto.subtle.digest('SHA-256', long));
    expect(hex(condensatSha256(long))).toBe(hex(reference));
    // RFC 4648 §10, alphabet base32hex en minuscules, sans remplissage.
    expect(
      ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar'].map((s) => encoderBase32Hex(utf8(s))),
    ).toEqual(['', 'co', 'cpng', 'cpnmu', 'cpnmuog', 'cpnmuoj1', 'cpnmuoj1e8']);

    const id = idValeurEcartee(cleIntitule, renommeA.ecriture.hlc);
    const physique = String(renommeA.ecriture.hlc.physique);
    expect(id).toBe(
      encoderBase32Hex(condensatSha256(utf8(`TACHE|${T1}|intitule|${PC}|${physique}|0`))),
    );
    expect(id).toMatch(/^[0-9a-v]{52}$/);
    expect(idValeurEcartee(cleIntitule, h(1, PC, 1))).not.toBe(id);
    expect(idValeurEcartee(cleIntitule, h(1, SMARTPHONE))).not.toBe(id);
    expect(idValeurEcartee(cleDelai, renommeA.ecriture.hlc)).not.toBe(id);
  });
});

describe('detecterValeursEcartees — critère du contexte causal (RG-036, DAT §4.2.1)', () => {
  it('UT-US-017-41 S10 : la valeur écrite sans connaissance de l’autre est écartée ; S11 et S09 : rien', () => {
    const attendue: ValeurEcartee = {
      id: idValeurEcartee(cleIntitule, renommeA.ecriture.hlc),
      motif: 'CONFLIT',
      ecartee: renommeA,
      gagnante: renommeB,
    };
    expect(
      detecterValeursEcartees(etatFusionnable([renommeB]), etatFusionnable([renommeA])),
    ).toEqual([attendue]);

    // S11 : « B » écrit en connaissance de « A » (contexte[PC] = HLC de A).
    const bConnaissantA = intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(1, PC) });
    expect(
      detecterValeursEcartees(etatFusionnable([bConnaissantA]), etatFusionnable([renommeA])),
    ).toEqual([]);
    expect(
      detecterValeursEcartees(etatFusionnable([renommeA]), etatFusionnable([bConnaissantA])),
    ).toEqual([]);

    // S09 : informations différentes du même élément.
    const delai = delaiTache(T1, '2026-11-15', h(2, SMARTPHONE), { [PC]: h(0, PC) });
    expect(
      detecterValeursEcartees(
        etatFusionnable([plan, delai]),
        etatFusionnable([intituleTache(T1, 'Rédiger le plan', h(1, PC))]),
      ),
    ).toEqual([]);
  });

  it('UT-US-017-42 même entrée des deux côtés ; S12b départagé par l’appareil ; valeurs égales et pierres tombales concurrentes non signalées', () => {
    const cotePc = detecterValeursEcartees(
      etatFusionnable([renommeA]),
      etatFusionnable([renommeB]),
    );
    const coteSmartphone = detecterValeursEcartees(
      etatFusionnable([renommeB]),
      etatFusionnable([renommeA]),
    );
    expect(cotePc).toEqual(coteSmartphone);
    expect(cotePc).toHaveLength(1);

    // S12b : même physique, même compteur ; le PC (identifiant le plus grand) l’emporte, « B » est écartée.
    const aMemeInstant = intituleTache(T1, 'A', h(1, PC), { [PC]: h(0, PC) });
    const bMemeInstant = intituleTache(T1, 'B', h(1, SMARTPHONE), { [PC]: h(0, PC) });
    const s12b = detecterValeursEcartees(
      etatFusionnable([bMemeInstant]),
      etatFusionnable([aMemeInstant]),
    );
    expect(s12b).toEqual([
      {
        id: idValeurEcartee(cleIntitule, bMemeInstant.ecriture.hlc),
        motif: 'CONFLIT',
        ecartee: bMemeInstant,
        gagnante: aMemeInstant,
      },
    ]);
    expect(
      detecterValeursEcartees(etatFusionnable([aMemeInstant]), etatFusionnable([bMemeInstant])),
    ).toEqual(s12b);

    // Même valeur écrite des deux côtés : rien n’est perdu.
    expect(
      detecterValeursEcartees(
        etatFusionnable([intituleTache(T1, 'A', h(2, SMARTPHONE), { [PC]: h(0, PC) })]),
        etatFusionnable([renommeA]),
      ),
    ).toEqual([]);
    // Deux suppressions concurrentes : le registre `suppression` n’est jamais signalé.
    expect(
      detecterValeursEcartees(
        etatFusionnable([suppressionTache(T1, h(2, SMARTPHONE))]),
        etatFusionnable([suppressionTache(T1, h(1, PC))]),
      ),
    ).toEqual([]);
  });
});

describe('detecterValeursEcartees — pierre tombale (RG-047, DAT §4.2.1, H-1)', () => {
  // S24 : « Chapitre 1 » créé par le PC (t0) ; supprimé sur le PC (t1) ; délai modifié sur le smartphone (t2).
  const creation = creationTacheRegistre(T1, h(0, PC));
  const chapitre = intituleTache(T1, 'Chapitre 1', h(0, PC));
  const delaiInitial = delaiTache(T1, '2026-11-30', h(0, PC));
  const suppression = suppressionTache(T1, h(1, PC));
  const delaiModifie = delaiTache(T1, '2026-12-10', h(2, SMARTPHONE), { [PC]: h(0, PC) });

  it('UT-US-017-43 S24 : une écriture inconnue de la suppression est écartée par elle (même entrée des deux côtés) ; connue : rien', () => {
    const attendue: ValeurEcartee = {
      id: idValeurEcartee(cleDelai, delaiModifie.ecriture.hlc),
      motif: 'SUPPRESSION',
      ecartee: delaiModifie,
      gagnante: suppression,
      intituleElement: 'Chapitre 1',
    };
    const pc = etatFusionnable([creation, chapitre, delaiInitial, suppression]);
    const smartphone = etatFusionnable([creation, chapitre, delaiModifie]);

    expect(detecterValeursEcartees(pc, smartphone)).toEqual([attendue]);
    expect(detecterValeursEcartees(smartphone, pc)).toEqual([attendue]);

    // Délai modifié avant la suppression et connu d’elle (contexte de la pierre tombale) : rien.
    const delaiConnu = delaiTache(T1, '2026-12-10', h(1, SMARTPHONE), { [PC]: h(0, PC) });
    const suppressionInformee = suppressionTache(T1, h(2, PC), { [SMARTPHONE]: h(1, SMARTPHONE) });
    expect(
      detecterValeursEcartees(
        etatFusionnable([creation, chapitre, delaiConnu, suppressionInformee]),
        etatFusionnable([creation, chapitre, delaiConnu]),
      ),
    ).toEqual([]);
  });

  it('UT-US-017-44 H-1 : rattachement, placement et création de sous-tâche pointant vers l’élément supprimé sont écartés ; connus : rien', () => {
    // US-001 S20 : l’objectif « Publier le guide » (O1) est supprimé sur le PC (t1) ; sur le smartphone, la tâche
    // « Annexe » (T2) lui est rattachée (t2) et le sous-objectif « Version imprimable » (O3) est créé sous lui (t3).
    const objectif = [
      creationObjectifRegistre(O1, h(0, PC)),
      intituleObjectif(O1, 'Publier le guide', h(0, PC)),
    ];
    const annexe = [creationTacheRegistre(T2, h(0, PC)), intituleTache(T2, 'Annexe', h(0, PC))];
    const suppressionO1 = suppressionObjectif(O1, h(1, PC));
    const rattachement = lien(T2, O1, true, h(2, SMARTPHONE));
    const placement = parentObjectif(O3, creeSous(O1, h(3, SMARTPHONE)), h(3, SMARTPHONE));
    const sousObjectif = [
      creationObjectifRegistre(O3, h(3, SMARTPHONE)),
      intituleObjectif(O3, 'Version imprimable', h(3, SMARTPHONE)),
      placement,
    ];
    const pc = etatFusionnable([...objectif, ...annexe, suppressionO1]);
    const smartphone = etatFusionnable([...objectif, ...annexe, rattachement, ...sousObjectif]);
    const attendues = parIdentifiant([
      {
        id: idValeurEcartee(rattachement.cle, rattachement.ecriture.hlc),
        motif: 'SUPPRESSION',
        ecartee: rattachement,
        gagnante: suppressionO1,
        intituleElement: 'Annexe',
      },
      {
        id: idValeurEcartee(placement.cle, placement.ecriture.hlc),
        motif: 'SUPPRESSION',
        ecartee: placement,
        gagnante: suppressionO1,
      },
    ]);
    expect(detecterValeursEcartees(pc, smartphone)).toEqual(attendues);
    expect(detecterValeursEcartees(smartphone, pc)).toEqual(attendues);

    // US-024 S22 : sous-tâche « Section A » (T3) créée sur le smartphone sous « Chapitre 1 » (T1) supprimé sur le PC.
    const chapitre = [
      creationTacheRegistre(T1, h(0, PC)),
      intituleTache(T1, 'Chapitre 1', h(0, PC)),
    ];
    const suppressionT1 = suppressionTache(T1, h(1, PC));
    const creationSection = creationTacheRegistre(T3, h(2, SMARTPHONE), T1);
    const section = [creationSection, intituleTache(T3, 'Section A', h(2, SMARTPHONE))];
    expect(
      detecterValeursEcartees(
        etatFusionnable([...chapitre, suppressionT1]),
        etatFusionnable([...chapitre, ...section]),
      ),
    ).toEqual([
      {
        id: idValeurEcartee(creationSection.cle, creationSection.ecriture.hlc),
        motif: 'SUPPRESSION',
        ecartee: creationSection,
        gagnante: suppressionT1,
      },
    ]);

    // Rattachement fait avant la suppression et connu d’elle : rien.
    const rattachementConnu = lien(T2, O1, true, h(1, SMARTPHONE));
    const suppressionInformee = suppressionObjectif(O1, h(2, PC), {
      [SMARTPHONE]: h(1, SMARTPHONE),
    });
    expect(
      detecterValeursEcartees(
        etatFusionnable([...objectif, ...annexe, rattachementConnu, suppressionInformee]),
        etatFusionnable([...objectif, ...annexe, rattachementConnu]),
      ),
    ).toEqual([]);
  });

  it('UT-US-017-45 S23 : l’intitulé de l’élément est celui que connaît la suppression ; l’entrée qui le porte l’emporte à la fusion', () => {
    const creation = creationTacheRegistre(T1, h(0, PC));
    const chapitre = intituleTache(T1, 'Chapitre 1', h(0, PC));
    const suppressionT1 = suppressionTache(T1, h(1, PC));
    const revu = intituleTache(T1, 'Chapitre 1 revu', h(2, SMARTPHONE), { [PC]: h(0, PC) });
    const avecIntitule: ValeurEcartee = {
      id: idValeurEcartee(cleIntitule, revu.ecriture.hlc),
      motif: 'SUPPRESSION',
      ecartee: revu,
      gagnante: suppressionT1,
      intituleElement: 'Chapitre 1',
    };
    const { intituleElement: _intitule, ...sansIntitule } = avecIntitule;

    // Le PC (qui connaît « Chapitre 1 ») ou le smartphone recevant le fichier du PC avant qu’il n’ait fusionné « revu ».
    expect(
      detecterValeursEcartees(
        etatFusionnable([creation, chapitre, suppressionT1]),
        etatFusionnable([creation, revu]),
      ),
    ).toEqual([avecIntitule]);
    expect(
      detecterValeursEcartees(
        etatFusionnable([creation, revu]),
        etatFusionnable([creation, chapitre, suppressionT1]),
      ),
    ).toEqual([avecIntitule]);
    // Le smartphone recevant le fichier du PC après sa fusion : aucun intitulé connu de la suppression.
    expect(
      detecterValeursEcartees(
        etatFusionnable([creation, revu]),
        etatFusionnable([creation, revu, suppressionT1]),
      ),
    ).toEqual([sansIntitule]);

    const vide = new Map<IdValeurEcartee, ValeurEcartee>();
    const parUnCote = fusionnerValeursEcartees(new Map([[avecIntitule.id, sansIntitule]]), [
      avecIntitule,
    ]);
    const parLAutre = fusionnerValeursEcartees(new Map([[avecIntitule.id, avecIntitule]]), [
      sansIntitule,
    ]);
    expect(parUnCote.get(avecIntitule.id)).toEqual(avecIntitule);
    expect(parLAutre.get(avecIntitule.id)).toEqual(avecIntitule);
    expect(fusionnerValeursEcartees(vide, [sansIntitule]).get(avecIntitule.id)).toEqual(
      sansIntitule,
    );
  });
});

describe('fusionnerValeursEcartees et lectures (DAT §4.2.1, RG-056)', () => {
  const ecartee = intituleTache(T1, 'A', h(1, PC));
  const conflit = (id: IdValeurEcartee, gagnante = renommeB): ValeurEcartee => ({
    id,
    motif: 'CONFLIT',
    ecartee,
    gagnante,
  });

  it('UT-US-017-46 union par identifiant ; pour un même identifiant, le gagnant de plus petit HLC ; commutative, associative, idempotente', () => {
    const premier = conflit(idArbitraire(1));
    const remplacant = conflit(
      idArbitraire(1),
      intituleTache(T1, 'C', h(3, SMARTPHONE), { [SMARTPHONE]: h(2, SMARTPHONE) }),
    );
    const autre = conflit(idArbitraire(2));
    const a = new Map([[premier.id, premier]]);
    const b = new Map([[remplacant.id, remplacant]]);
    const c = new Map([[autre.id, autre]]);
    const ab = fusionnerValeursEcartees(a, b.values());
    const ba = fusionnerValeursEcartees(b, a.values());

    expect([...ab.values()]).toEqual([premier]);
    expect([...ba.values()]).toEqual([premier]);
    const gauche = fusionnerValeursEcartees(ab, c.values());
    const droite = fusionnerValeursEcartees(a, fusionnerValeursEcartees(b, c.values()).values());
    expect(new Map(gauche)).toEqual(new Map(droite));
    expect(new Map(fusionnerValeursEcartees(gauche, gauche.values()))).toEqual(new Map(gauche));
    expect(gauche.size).toBe(2);
  });

  it('UT-US-017-47 lectures fusionnées par HLC ; aLire ne compte que les entrées ALR-009 à ALR-011 non lues (H-6)', () => {
    const l1: Lecture = { id: idArbitraire(1), hlc: h(4, PC) };
    const l1Plus: Lecture = { id: idArbitraire(1), hlc: h(5, SMARTPHONE) };
    const l9: Lecture = { id: idArbitraire(9), hlc: h(4, PC) };
    const fusion = fusionnerLectures(new Map([[l1.id, l1]]), [l1Plus, l9]);
    expect(fusion).toEqual(
      new Map([
        [l1.id, l1Plus],
        [l9.id, l9],
      ]),
    );
    expect(fusionnerLectures(new Map([[l1Plus.id, l1Plus]]), [l1]).get(l1.id)).toEqual(l1Plus);

    const suppression = suppressionTache(T1, h(1, PC));
    const valeurs: ReadonlyArray<ValeurEcartee> = [
      conflit(idArbitraire(1)),
      { id: idArbitraire(2), motif: 'SUPPRESSION', ecartee, gagnante: suppression },
      { id: idArbitraire(3), motif: 'PLACEMENT_ANNULE', ecartee, gagnante: renommeB },
      { id: idArbitraire(4), motif: 'DONNEES_EFFACEES', ecartee, generation: h(6, PC) },
    ];
    const index = new Map(valeurs.map((v) => [v.id, v]));
    expect(compterALire(index, new Map())).toBe(3);
    // Lecture d’une entrée connue, et lecture d’un identifiant inconnu (ignorée).
    expect(compterALire(index, fusion)).toBe(2);
    expect(compterALire(new Map(), fusion)).toBe(0);
  });
});
