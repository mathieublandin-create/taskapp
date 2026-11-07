/**
 * Contrôles du Drive (ST-US-017 v0.10 §6.7 n° 2 à n° 8 ; RG-044 ; DAT §4.2.2 ; DEC-030) : ordre des contrôles et
 * précédence des décisions (UT-US-017-60), fichier propre et fichiers des autres appareils (UT-US-017-61),
 * restauration demandée ou faite ailleurs (UT-US-017-62).
 * v0.10.1 (conditions de Starck, DAT v0.11.10 §4.2.2) : C1 et C2 (dernière restauration vue), C3 (plancher du HLC
 * d'un choix) dans UT-US-017-62 ; C8 (fichiers orphelins de l'appareil) dans UT-US-017-60.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
  Generation,
} from '@src/synchronisation/domaine/contenu-fichier';
import {
  controlerDrive,
  GENERATION_INITIALE,
  hlcMaxDuContenu,
  hlcPlancherDesChoix,
  restaurationConnueApres,
  situationDe,
  type LectureDrive,
  type ObservationDrive,
  type SituationLocale,
} from '@src/synchronisation/domaine/controle-drive';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import { comparerHlc, maxHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import {
  META_INITIALE,
  type IdFichierDrive,
} from '@src/synchronisation/domaine/meta-synchronisation';
import type { IdValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { registre } from '@tests/support/fabriques/etat-local';
import { date, hlc, idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const id = (texte: string): IdFichierDrive => texte as IdFichierDrive;
const H1 = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);
const H2 = hlc('2026-10-21T09:00:00.000Z', 0, PC);
const H3 = hlc('2026-10-21T10:00:00.000Z', 0, SMARTPHONE);
const G1: Generation = { type: 'NOUVELLE', hlc: H1 };
const G2: Generation = { type: 'NOUVELLE', hlc: H2 };

const manifeste = (
  generation: Generation = GENERATION_INITIALE,
  restauration?: Hlc,
): ContenuManifeste => ({
  schemaVersion: 1,
  generation,
  ...(restauration === undefined ? {} : { restauration }),
});

const fichier = (
  appareil: IdAppareil,
  generation: Generation = GENERATION_INITIALE,
  hlcs: ReadonlyArray<Hlc> = [],
): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation,
  appareil,
  registres: hlcs.map((h, i) =>
    registre({ type: 'OBJECTIF', id: idObjectif(i + 1), champ: 'delai' }, date('2026-12-15'), h),
  ),
  journal: [],
});

const lu = <T>(contenu: T): LectureDrive<T> => ({ type: 'LU', contenu });
const ILLISIBLE = { type: 'ILLISIBLE' } as const;
const PLUS_RECENT = { type: 'FORMAT_PLUS_RECENT', schemaVersion: 2 } as const;

const observation = (p: Partial<ObservationDrive> = {}): ObservationDrive => ({
  dossierPresent: true,
  manifestes: [{ id: id('m1'), lecture: lu(manifeste()) }],
  fichierPropre: { type: 'INCHANGE' },
  autres: [],
  autresPresents: false,
  orphelins: [],
  ...p,
});

const situation = (p: Partial<SituationLocale> = {}): SituationLocale => ({
  manifesteAttendu: true,
  fichierPropreAttendu: true,
  generation: GENERATION_INITIALE,
  restaurationDemandee: false,
  ...p,
});

const AUCUNE_FUSION = { aFusionner: [], ignores: [] };
const synchroniser = (p: Record<string, unknown> = {}) => ({
  type: 'SYNCHRONISER',
  fusion: AUCUNE_FUSION,
  depotForce: false,
  abandonnerDemande: false,
  ...p,
});

describe('controlerDrive — ordre des contrôles et manifeste (ST-US-017 v0.10 §6.7 n° 3, n° 4, n° 7)', () => {
  it('UT-US-017-60 première connexion : dossier sans manifeste ni fichier, rien d’attendu → manifeste INITIALE à écrire ; dossier absent, idem', () => {
    const neuf = situation({ manifesteAttendu: false, fichierPropreAttendu: false });
    const attendu = synchroniser({ manifesteAEcrire: manifeste() });
    expect(
      controlerDrive(observation({ manifestes: [], fichierPropre: { type: 'ABSENT' } }), neuf),
    ).toEqual(attendu);
    expect(
      controlerDrive(
        observation({ dossierPresent: false, manifestes: [], fichierPropre: { type: 'ABSENT' } }),
        neuf,
      ),
    ).toEqual(attendu);
  });

  it('UT-US-017-60 manifeste absent alors qu’il est attendu, dossier présent ou absent → ALTERATION MANIFESTE (tout appareil), même si le fichier propre manque aussi', () => {
    const alteration = { type: 'ALTERATION', portee: 'MANIFESTE' };
    expect(controlerDrive(observation({ manifestes: [] }), situation())).toEqual(alteration);
    expect(
      controlerDrive(
        observation({ manifestes: [], fichierPropre: { type: 'ABSENT' } }),
        situation(),
      ),
    ).toEqual(alteration);
    expect(
      controlerDrive(
        observation({ dossierPresent: false, manifestes: [], fichierPropre: { type: 'ABSENT' } }),
        situation(),
      ),
    ).toEqual(alteration);
    // Dossier absent, manifeste jamais lu mais fichier propre déjà déposé : altération aussi.
    expect(
      controlerDrive(
        observation({ dossierPresent: false, manifestes: [], fichierPropre: { type: 'ABSENT' } }),
        situation({ manifesteAttendu: false }),
      ),
    ).toEqual(alteration);
  });

  it('UT-US-017-60 manifeste illisible (S18, S32 sur le manifeste), attendu ou non, ou un seul des doublons illisible → ALTERATION MANIFESTE', () => {
    const alteration = { type: 'ALTERATION', portee: 'MANIFESTE' };
    expect(
      controlerDrive(
        observation({ manifestes: [{ id: id('m1'), lecture: ILLISIBLE }] }),
        situation(),
      ),
    ).toEqual(alteration);
    expect(
      controlerDrive(
        observation({ manifestes: [{ id: id('m1'), lecture: ILLISIBLE }] }),
        situation({ manifesteAttendu: false, fichierPropreAttendu: false }),
      ),
    ).toEqual(alteration);
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste()) },
            { id: id('m2'), lecture: ILLISIBLE },
          ],
        }),
        situation(),
      ),
    ).toEqual(alteration);
  });

  it('UT-US-017-60 manifeste absent, non attendu, avec des fichiers d’autres appareils → cycle normal sans écrire de manifeste (pas une première connexion)', () => {
    const autre = fichier(PC, GENERATION_INITIALE, [H2]);
    expect(
      controlerDrive(
        observation({
          manifestes: [],
          fichierPropre: { type: 'ABSENT' },
          autres: [{ id: id('f-pc'), lecture: lu(autre) }],
          autresPresents: true,
        }),
        situation({ manifesteAttendu: false, fichierPropreAttendu: false }),
      ),
    ).toEqual(synchroniser({ fusion: { aFusionner: [autre], ignores: [] } }));
    // Fichier d'un autre appareil présent dans le dossier mais non relu pendant ce cycle (jeton) : idem.
    expect(
      controlerDrive(
        observation({ manifestes: [], fichierPropre: { type: 'ABSENT' }, autresPresents: true }),
        situation({ manifesteAttendu: false, fichierPropreAttendu: false }),
      ),
    ).toEqual(synchroniser());
  });

  it('UT-US-017-60 précédence (contrôle 2 avant les autres) : un format plus récent (manifeste, fichier propre ou autre) l’emporte sur l’altération et sur une génération plus récente', () => {
    const plusRecent = { type: 'FORMAT_PLUS_RECENT' };
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: PLUS_RECENT },
            { id: id('m2'), lecture: ILLISIBLE },
          ],
        }),
        situation(),
      ),
    ).toEqual(plusRecent);
    expect(
      controlerDrive(observation({ fichierPropre: PLUS_RECENT, manifestes: [] }), situation()),
    ).toEqual(plusRecent);
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(G1)) }],
          autres: [{ id: id('f-pc'), lecture: PLUS_RECENT }],
          autresPresents: true,
        }),
        situation(),
      ),
    ).toEqual(plusRecent);
  });

  it('UT-US-017-60 précédence (contrôle 3) : une génération plus récente, lue dans un manifeste ou dans un fichier valide, l’emporte sur toute altération (DEC-030 : la question disparaît)', () => {
    const nouvelle = { type: 'NOUVELLE_GENERATION', generation: G2 };
    // Manifeste absent (attendu) mais fichier de l'autre appareil en génération G2 : écriture du manifeste perdue.
    expect(
      controlerDrive(
        observation({
          manifestes: [],
          autres: [{ id: id('f-pc'), lecture: lu(fichier(PC, G2)) }],
          autresPresents: true,
        }),
        situation(),
      ),
    ).toEqual(nouvelle);
    // Manifeste G2, fichier propre absent (attendu) : RG-044 b, pas ERR-012.
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(G2)) }],
          fichierPropre: { type: 'ABSENT' },
        }),
        situation(),
      ),
    ).toEqual(nouvelle);
    // Maximum de toutes les sources : G1 (manifeste) < G2 (fichier) ; locale G1.
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(G1)) }],
          autres: [
            { id: id('f-pc'), lecture: lu(fichier(PC, G2)) },
            { id: id('f-3'), lecture: lu(fichier(TROISIEME, GENERATION_INITIALE)) },
          ],
          autresPresents: true,
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual(nouvelle);
    // Un fichier illisible ne compte pas dans la génération effective.
    expect(
      controlerDrive(
        observation({ autres: [{ id: id('f-pc'), lecture: ILLISIBLE }], autresPresents: true }),
        situation(),
      ),
    ).toEqual(synchroniser({ fusion: { aFusionner: [], ignores: [id('f-pc')] } }));
  });

  it('UT-US-017-60 condition C8 : un fichier orphelin de l’appareil (création interrompue) compte au contrôle 3 et au contrôle 2, jamais comme altération ni comme fichier à fusionner', () => {
    const G3: Generation = { type: 'NOUVELLE', hlc: H3 };
    // « Repartir de zéro » interrompu après le dépôt (fichier créé, identifiant non mémorisé) : sa génération l'emporte,
    // même devant le manifeste absent (C9 : l'appareil achève son choix, n° 11).
    expect(
      controlerDrive(
        observation({
          manifestes: [],
          fichierPropre: { type: 'ABSENT' },
          orphelins: [{ id: id('f-orphelin'), lecture: lu(fichier(SMARTPHONE, G3)) }],
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual({ type: 'NOUVELLE_GENERATION', generation: G3 });
    // Orphelin illisible ou d'une génération antérieure : ni altération, ni fusion, ni « ignoré » des autres.
    expect(
      controlerDrive(
        observation({
          orphelins: [
            { id: id('f-o1'), lecture: ILLISIBLE },
            { id: id('f-o2'), lecture: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H1])) },
          ],
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual(synchroniser({ manifesteAEcrire: manifeste(G1) }));
    // Orphelin de la même génération : jamais fusionné (le contenu de l'appareil est déjà dans sa copie locale).
    expect(
      controlerDrive(
        observation({
          orphelins: [
            { id: id('f-o1'), lecture: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H1])) },
          ],
        }),
        situation(),
      ),
    ).toEqual(synchroniser());
    // Orphelin d'un format plus récent : contrôle 2 (aucun contrôle suivant).
    expect(
      controlerDrive(
        observation({ orphelins: [{ id: id('f-o1'), lecture: PLUS_RECENT }] }),
        situation(),
      ),
    ).toEqual({ type: 'FORMAT_PLUS_RECENT' });
  });

  it('UT-US-017-60 manifeste en retard sur la génération de l’appareil, ou doublons de contenus différents → contenu à écrire = jointure ; canonique déjà égal → rien', () => {
    expect(
      controlerDrive(
        observation({ manifestes: [{ id: id('m1'), lecture: lu(manifeste()) }] }),
        situation({ generation: G1 }),
      ),
    ).toEqual(synchroniser({ manifesteAEcrire: manifeste(G1) }));
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste()) },
            { id: id('m2'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) },
          ],
        }),
        situation(),
      ),
    ).toEqual(
      synchroniser({
        manifesteAEcrire: manifeste(GENERATION_INITIALE, H2),
        restaurationVue: H2,
      }),
    );
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) },
            { id: id('m2'), lecture: lu(manifeste()) },
          ],
        }),
        situation(),
      ),
    ).toEqual(synchroniser({ restaurationVue: H2 }));
  });
});

describe('controlerDrive — fichier propre et fichiers des autres appareils (n° 4, n° 5, n° 6)', () => {
  it('UT-US-017-61 fichier propre attendu absent ou illisible, manifeste intact, aucune restauration → ALTERATION FICHIER_PROPRE (cet appareil seulement) ; non attendu → rien', () => {
    const alteration = { type: 'ALTERATION', portee: 'FICHIER_PROPRE' };
    expect(controlerDrive(observation({ fichierPropre: { type: 'ABSENT' } }), situation())).toEqual(
      alteration,
    );
    expect(controlerDrive(observation({ fichierPropre: ILLISIBLE }), situation())).toEqual(
      alteration,
    );
    expect(
      controlerDrive(
        observation({ fichierPropre: { type: 'ABSENT' } }),
        situation({ fichierPropreAttendu: false }),
      ),
    ).toEqual(synchroniser());
  });

  it('UT-US-017-61 S33, S32b : le fichier altéré d’un autre appareil est ignoré sans message ; seuls les fichiers valides de la génération de l’appareil sont fusionnés, dans l’ordre lu', () => {
    const pc = fichier(PC, G1, [H2]);
    const troisieme = fichier(TROISIEME, G1, [H3]);
    const ancien = fichier(SMARTPHONE, GENERATION_INITIALE, [H1]);
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(G1)) }],
          autres: [
            { id: id('f-3'), lecture: lu(troisieme) },
            { id: id('f-x'), lecture: ILLISIBLE },
            { id: id('f-ancien'), lecture: lu(ancien) },
            { id: id('f-pc'), lecture: lu(pc) },
          ],
          autresPresents: true,
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual(
      synchroniser({
        fusion: { aFusionner: [troisieme, pc], ignores: [id('f-x'), id('f-ancien')] },
      }),
    );
  });

  it('UT-US-017-61 fichier propre relu valide : dépôt forcé s’il est périmé (plus ancien que deposeJusquA, vide, ou d’une génération antérieure), sinon non', () => {
    const avecDepot = situation({ deposeJusquA: H3 });
    expect(
      controlerDrive(
        observation({ fichierPropre: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H1])) }),
        avecDepot,
      ),
    ).toEqual(synchroniser({ depotForce: true }));
    expect(
      controlerDrive(observation({ fichierPropre: lu(fichier(SMARTPHONE)) }), avecDepot),
    ).toEqual(synchroniser({ depotForce: true }));
    expect(
      controlerDrive(
        observation({ fichierPropre: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H1, H3])) }),
        avecDepot,
      ),
    ).toEqual(synchroniser());
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(G1)) }],
          fichierPropre: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H3])),
        }),
        situation({ generation: G1, deposeJusquA: H3 }),
      ),
    ).toEqual(synchroniser({ depotForce: true }));
    // Version inchangée : fichier non relu, jamais de dépôt forcé.
    expect(controlerDrive(observation(), avecDepot)).toEqual(synchroniser());
    // Aucun dépôt confirmé (deposeJusquA absent) : un fichier propre valide n'est jamais périmé.
    expect(
      controlerDrive(observation({ fichierPropre: lu(fichier(SMARTPHONE)) }), situation()),
    ).toEqual(synchroniser());
  });

  it('UT-US-017-61 hlcMaxDuContenu — maximum des HLC des registres, du journal et des lectures ; undefined pour un fichier vide', () => {
    const entree = {
      id: 'op:0' as IdEvenement,
      type: 'SUPPRESSION',
      element: { type: 'OBJECTIF', id: idObjectif(9) },
      avant: {},
      apres: {},
      hlc: H2,
      instant: instant('2026-10-21T09:00:00.000Z'),
      jour: date('2026-10-21'),
    } as unknown as EvenementJournal;
    expect(hlcMaxDuContenu(fichier(SMARTPHONE))).toBeUndefined();
    expect(hlcMaxDuContenu(fichier(SMARTPHONE, GENERATION_INITIALE, [H1]))).toEqual(H1);
    expect(
      hlcMaxDuContenu({ ...fichier(SMARTPHONE, GENERATION_INITIALE, [H1]), journal: [entree] }),
    ).toEqual(H2);
    expect(
      hlcMaxDuContenu({
        ...fichier(SMARTPHONE, GENERATION_INITIALE, [H1]),
        journal: [entree],
        lectures: [{ id: 'x'.repeat(52) as IdValeurEcartee, hlc: H3 }],
      }),
    ).toEqual(H3);
    // La génération n'est pas une écriture de l'appareil : elle ne compte pas.
    expect(hlcMaxDuContenu(fichier(SMARTPHONE, { type: 'NOUVELLE', hlc: H3 }, [H1]))).toEqual(H1);
  });
});

describe('controlerDrive — restauration (n° 8, n° 9 ; DAT §4.2.2 b ; DEC-030)', () => {
  it('UT-US-017-62 « Restaurer » demandé : exécuté si une altération demeure (manifeste ou fichier propre), avec les fichiers valides à fusionner ; oublié si plus rien n’est altéré', () => {
    const demandee = situation({ restaurationDemandee: true });
    const pc = fichier(PC, GENERATION_INITIALE, [H2]);
    expect(
      controlerDrive(
        observation({
          manifestes: [],
          fichierPropre: { type: 'ABSENT' },
          autres: [{ id: id('f-pc'), lecture: lu(pc) }],
          autresPresents: true,
        }),
        demandee,
      ),
    ).toEqual({
      type: 'RESTAURER',
      motif: 'DEMANDEE',
      fusion: { aFusionner: [pc], ignores: [] },
    });
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H1)) }],
          fichierPropre: ILLISIBLE,
        }),
        demandee,
      ),
    ).toEqual({
      type: 'RESTAURER',
      motif: 'DEMANDEE',
      fusion: AUCUNE_FUSION,
      restaurationVue: H1,
    });
    expect(controlerDrive(observation(), demandee)).toEqual(
      synchroniser({ abandonnerDemande: true }),
    );
  });

  it('UT-US-017-62 S22c : une génération plus récente apparue avant l’exécution d’une restauration demandée l’abandonne (RG-044 b)', () => {
    expect(
      controlerDrive(
        observation({ manifestes: [{ id: id('m1'), lecture: lu(manifeste(G2)) }] }),
        situation({ restaurationDemandee: true }),
      ),
    ).toEqual({ type: 'NOUVELLE_GENERATION', generation: G2 });
  });

  it('UT-US-017-62 S20 : restauration faite ailleurs, plus récente que la dernière connue, manifeste valide de même génération → fichier propre réécrit sans question ; même restauration déjà connue → nouvel incident, ERR-012', () => {
    const restauree = observation({
      manifestes: [{ id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) }],
      fichierPropre: { type: 'ABSENT' },
    });
    const faite = {
      type: 'RESTAURER',
      motif: 'FAITE_AILLEURS',
      fusion: AUCUNE_FUSION,
      restaurationVue: H2,
    };
    expect(controlerDrive(restauree, situation())).toEqual(faite);
    expect(controlerDrive(restauree, situation({ restaurationConnue: H1 }))).toEqual(faite);
    expect(controlerDrive(restauree, situation({ restaurationConnue: H2 }))).toEqual({
      type: 'ALTERATION',
      portee: 'FICHIER_PROPRE',
    });
    expect(controlerDrive(restauree, situation({ restaurationConnue: H3 }))).toEqual({
      type: 'ALTERATION',
      portee: 'FICHIER_PROPRE',
    });
    // Fichier propre illisible : même règle.
    expect(controlerDrive({ ...restauree, fichierPropre: ILLISIBLE }, situation())).toEqual(faite);
  });

  it('UT-US-017-62 pas de restauration « faite ailleurs » si le manifeste est lui-même altéré ou d’une génération antérieure à celle de l’appareil', () => {
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) },
            { id: id('m2'), lecture: ILLISIBLE },
          ],
          fichierPropre: { type: 'ABSENT' },
        }),
        situation(),
      ),
    ).toEqual({ type: 'ALTERATION', portee: 'MANIFESTE' });
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) }],
          fichierPropre: { type: 'ABSENT' },
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual({ type: 'ALTERATION', portee: 'FICHIER_PROPRE' });
  });

  it('UT-US-017-62 cycle sans altération : restaurationVue = plus grande restauration des manifestes lisibles (à mémoriser)', () => {
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H3)) },
            { id: id('m2'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) },
          ],
        }),
        situation({ restaurationConnue: H1 }),
      ),
    ).toEqual(synchroniser({ restaurationVue: H3 }));
  });

  it('UT-US-017-62 condition C2 : NOUVELLE_GENERATION porte restaurationVue (plus grande restauration des manifestes lisibles, toutes générations), valeur initiale de restaurationConnue à l’adoption', () => {
    expect(
      controlerDrive(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste(G2, H1)) },
            { id: id('m2'), lecture: ILLISIBLE },
          ],
        }),
        situation({ restaurationConnue: H3 }),
      ),
    ).toEqual({ type: 'NOUVELLE_GENERATION', generation: G2, restaurationVue: H1 });
    // Génération lue dans un fichier seulement, manifeste d'une génération antérieure qui garde une restauration.
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H3)) }],
          autres: [{ id: id('f-pc'), lecture: lu(fichier(PC, G2)) }],
          autresPresents: true,
        }),
        situation(),
      ),
    ).toEqual({ type: 'NOUVELLE_GENERATION', generation: G2, restaurationVue: H3 });
  });

  it('UT-US-017-62 condition C1 : restaurationConnueApres — maximum de l’ancienne et de la vue, jamais décroissante (manifeste revenu en arrière après une écriture concurrente perdue)', () => {
    expect(restaurationConnueApres(undefined, undefined)).toBeUndefined();
    expect(restaurationConnueApres(undefined, H1)).toEqual(H1);
    expect(restaurationConnueApres(H1, undefined)).toEqual(H1);
    expect(restaurationConnueApres(H1, H3)).toEqual(H3);
    expect(restaurationConnueApres(H3, H2)).toEqual(H3);
    // Puis la décision : la restauration du manifeste revenu en arrière (H2) n'est pas « plus récente que la connue »
    // (H3) : une altération du fichier propre est un nouvel incident.
    expect(
      controlerDrive(
        observation({
          manifestes: [{ id: id('m1'), lecture: lu(manifeste(GENERATION_INITIALE, H2)) }],
          fichierPropre: ILLISIBLE,
        }),
        situation({ restaurationConnue: restaurationConnueApres(H3, H2) ?? H3 }),
      ),
    ).toEqual({ type: 'ALTERATION', portee: 'FICHIER_PROPRE' });
  });

  it('UT-US-017-62 condition C1 (propriété) : pour toute suite de restaurations vues, restaurationConnue est croissante et vaut le maximum de celles vues', () => {
    const hlcArbitraire = fc
      .tuple(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 2 }),
        fc.constantFrom(PC, SMARTPHONE, TROISIEME),
      )
      .map(([minute, compteur, appareil]) =>
        hlc(`2026-10-21T08:0${String(minute)}:00.000Z`, compteur, appareil),
      );
    fc.assert(
      fc.property(
        fc.array(fc.option(hlcArbitraire, { nil: undefined }), { maxLength: 12 }),
        (vues) => {
          let connue: Hlc | undefined;
          let maximum: Hlc | undefined;
          for (const vue of vues) {
            const apres = restaurationConnueApres(connue, vue);
            const recul =
              connue !== undefined && (apres === undefined || comparerHlc(apres, connue) < 0);
            expect(recul).toBe(false);
            if (vue !== undefined) maximum = maximum === undefined ? vue : maxHlc(maximum, vue);
            connue = apres;
          }
          expect(connue).toEqual(maximum);
        },
      ),
      { seed: 20261101, numRuns: 300 },
    );
  });

  it('UT-US-017-62 condition C3 : hlcPlancherDesChoix — maximum de la restauration connue, de la génération de l’appareil, des générations et restaurations des manifestes lisibles et des générations des fichiers lus valides ; illisibles ignorés', () => {
    const H4 = hlc('2026-10-21T11:00:00.000Z', 0, PC);
    const H5 = hlc('2026-10-21T12:00:00.000Z', 0, TROISIEME);
    expect(hlcPlancherDesChoix(observation(), situation())).toBeUndefined();
    expect(hlcPlancherDesChoix(observation(), situation({ restaurationConnue: H2 }))).toEqual(H2);
    expect(hlcPlancherDesChoix(observation(), situation({ generation: G1 }))).toEqual(H1);
    expect(
      hlcPlancherDesChoix(
        observation({ manifestes: [{ id: id('m1'), lecture: lu(manifeste(G1, H3)) }] }),
        situation({ generation: G1 }),
      ),
    ).toEqual(H3);
    expect(
      hlcPlancherDesChoix(
        observation({
          manifestes: [
            { id: id('m1'), lecture: lu(manifeste(G1)) },
            { id: id('m2'), lecture: ILLISIBLE },
          ],
          fichierPropre: lu(fichier(SMARTPHONE, G1)),
          autres: [
            { id: id('f-pc'), lecture: lu(fichier(PC, { type: 'NOUVELLE', hlc: H4 })) },
            { id: id('f-3'), lecture: ILLISIBLE },
          ],
          autresPresents: true,
        }),
        situation({ generation: G1, restaurationConnue: H2 }),
      ),
    ).toEqual(H4);
    // Fichier orphelin de l'appareil (C8) : sa génération compte aussi ; un format plus récent ne compte pas.
    expect(
      hlcPlancherDesChoix(
        observation({
          orphelins: [
            { id: id('f-o1'), lecture: lu(fichier(SMARTPHONE, { type: 'NOUVELLE', hlc: H5 })) },
            { id: id('f-o2'), lecture: PLUS_RECENT },
          ],
        }),
        situation({ generation: G1 }),
      ),
    ).toEqual(H5);
    // Le contenu des registres ne compte pas (seuls les HLC de génération et de restauration) :
    expect(
      hlcPlancherDesChoix(
        observation({ fichierPropre: lu(fichier(SMARTPHONE, GENERATION_INITIALE, [H5])) }),
        situation(),
      ),
    ).toBeUndefined();
  });

  it('UT-US-017-62 situationDe — méta initiale : rien d’attendu, INITIALE, aucune demande ; méta complète recopiée', () => {
    expect(situationDe(META_INITIALE)).toEqual({
      manifesteAttendu: false,
      fichierPropreAttendu: false,
      generation: GENERATION_INITIALE,
      restaurationDemandee: false,
    });
    expect(
      situationDe({
        ...META_INITIALE,
        manifeste: id('m1'),
        fichierPropre: id('f1'),
        generation: G1,
        deposeJusquA: H2,
        restaurationDemandee: true,
        restaurationConnue: H3,
      }),
    ).toEqual({
      manifesteAttendu: true,
      fichierPropreAttendu: true,
      generation: G1,
      deposeJusquA: H2,
      restaurationDemandee: true,
      restaurationConnue: H3,
    });
  });
});
