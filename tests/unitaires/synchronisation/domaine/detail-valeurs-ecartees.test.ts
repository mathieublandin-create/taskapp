/**
 * Détail des valeurs écartées pour la liste ECR-011 (glossaire §8, H-2 ; ST-US-017 v0.5 §6.6 n° 12) : élément,
 * information, valeur non retenue, valeur conservée, lecture, existence de l'élément. UT-US-017-57.
 */
import { describe, expect, it } from 'vitest';
import {
  detaillerValeursEcartees,
  type ValeurEcarteeDetaillee,
} from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  creationObjectifRegistre,
  creationTacheRegistre,
  creePrincipal,
  creeSous,
  delaiTache,
  deplaceSous,
  h,
  idArbitraire,
  intituleObjectif,
  intituleTache,
  lien,
  parentObjectif,
  signalements,
  suppressionObjectif,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  date,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const T1 = idTache(1); // « Chapitre 1 », supprimée, renommée « Chapitre 1 revu » sur l'autre appareil
const T2 = idTache(2); // « Annexe »
const T3 = idTache(3); // « Section A », sous-tâche de T1
const T4 = idTache(4); // « B »
const O1 = idObjectif(1); // « Publier le guide », supprimé
const O3 = idObjectif(3); // « Version imprimable », créé sous O1
const ALPHA = idObjectif(5);
const BETA = idObjectif(6);

const cycle = (etat: 'TERMINEE' | 'ABANDONNEE', n: number, appareil = PC): RegistreQuelconque =>
  registre(
    { type: 'TACHE', id: T4, champ: 'cycleDeVie' },
    etat === 'TERMINEE'
      ? { etat, dateFin: date('2026-10-21'), instantFin: instant('2026-10-21T08:10:00.000Z') }
      : {
          etat,
          dateAbandon: date('2026-10-21'),
          instantAbandon: instant('2026-10-21T08:20:00.000Z'),
          evenementAbandon: idEvenementTest(idOperation(1), 0),
        },
    h(n, appareil),
  );

const revu = intituleTache(T1, 'Chapitre 1 revu', h(2, SMARTPHONE), { [PC]: h(0, PC) });
const suppressionT1 = suppressionTache(T1, h(1, PC));
const suppressionO1 = suppressionObjectif(O1, h(1, PC));
const rattachement = lien(T2, O1, true, h(2, SMARTPHONE));
const placement = parentObjectif(O3, creeSous(O1, h(3, SMARTPHONE)), h(3, SMARTPHONE));
const creationSection = creationTacheRegistre(T3, h(2, SMARTPHONE), T1);
const alphaSousBeta = parentObjectif(ALPHA, deplaceSous(BETA, h(1, PC)), h(1, PC));
const alphaRetabli = parentObjectif(ALPHA, creePrincipal(h(0, PC)), h(3, SMARTPHONE), {
  [PC]: h(1, PC),
});
const intituleB = intituleTache(T4, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) });

const ETAT = etatLocal({
  appareilId: SMARTPHONE,
  registres: [
    creationTacheRegistre(T1, h(0, PC)),
    revu,
    suppressionT1,
    creationTacheRegistre(T2, h(0, PC)),
    intituleTache(T2, 'Annexe', h(0, PC)),
    creationSection,
    intituleTache(T3, 'Section A', h(2, SMARTPHONE)),
    creationTacheRegistre(T4, h(0, PC)),
    intituleB,
    cycle('ABANDONNEE', 2, SMARTPHONE),
    creationObjectifRegistre(O1, h(0, PC)),
    intituleObjectif(O1, 'Publier le guide', h(0, PC)),
    suppressionO1,
    creationObjectifRegistre(O3, h(3, SMARTPHONE)),
    intituleObjectif(O3, 'Version imprimable', h(3, SMARTPHONE)),
    placement,
    creationObjectifRegistre(ALPHA, h(0, PC)),
    intituleObjectif(ALPHA, 'Alpha', h(0, PC)),
    alphaRetabli,
    creationObjectifRegistre(BETA, h(0, PC)),
    intituleObjectif(BETA, 'Bêta', h(0, PC)),
  ],
});

const VALEURS: ReadonlyArray<ValeurEcartee> = [
  {
    id: idArbitraire(1),
    motif: 'CONFLIT',
    ecartee: intituleTache(T4, 'A', h(1, PC)),
    gagnante: intituleB,
  },
  {
    id: idArbitraire(2),
    motif: 'CONFLIT',
    ecartee: cycle('TERMINEE', 1),
    gagnante: cycle('ABANDONNEE', 2, SMARTPHONE),
  },
  {
    id: idArbitraire(3),
    motif: 'SUPPRESSION',
    ecartee: revu,
    gagnante: suppressionT1,
    intituleElement: 'Chapitre 1',
  },
  {
    id: idArbitraire(4),
    motif: 'SUPPRESSION',
    ecartee: rattachement,
    gagnante: suppressionO1,
    intituleElement: 'Annexe',
  },
  { id: idArbitraire(5), motif: 'SUPPRESSION', ecartee: placement, gagnante: suppressionO1 },
  { id: idArbitraire(6), motif: 'SUPPRESSION', ecartee: creationSection, gagnante: suppressionT1 },
  {
    id: idArbitraire(7),
    motif: 'PLACEMENT_ANNULE',
    ecartee: alphaSousBeta,
    gagnante: alphaRetabli,
  },
  {
    id: idArbitraire(8),
    motif: 'DONNEES_EFFACEES',
    ecartee: delaiTache(T2, '2026-12-01', h(1, SMARTPHONE)),
    generation: h(4, PC),
  },
];

const physique = (n: number) => h(n, PC).physique;

describe('detaillerValeursEcartees (glossaire §8, H-2)', () => {
  it('UT-US-017-57 les quatre colonnes, l’instant, la lecture et l’existence de l’élément, pour chaque motif et chaque forme de valeur', () => {
    const detail = detaillerValeursEcartees(
      ETAT,
      signalements(VALEURS, [{ id: idArbitraire(2), hlc: h(5, SMARTPHONE) }]),
    );

    const attendus: ReadonlyArray<ValeurEcarteeDetaillee> = [
      {
        id: idArbitraire(1),
        motif: 'CONFLIT',
        element: { type: 'TACHE', id: T4 },
        intitule: 'B',
        information: 'INTITULE',
        valeurNonRetenue: { type: 'TEXTE', texte: 'A' },
        valeurConservee: { type: 'TEXTE', texte: 'B' },
        instant: physique(2),
        lue: false,
        elementExiste: true,
      },
      {
        id: idArbitraire(2),
        motif: 'CONFLIT',
        element: { type: 'TACHE', id: T4 },
        intitule: 'B',
        information: 'ETAT',
        valeurNonRetenue: { type: 'ETAT', etat: 'TERMINEE' },
        valeurConservee: { type: 'ETAT', etat: 'ABANDONNEE' },
        instant: physique(2),
        lue: true,
        elementExiste: true,
      },
      {
        id: idArbitraire(3),
        motif: 'SUPPRESSION',
        element: { type: 'TACHE', id: T1 },
        intitule: 'Chapitre 1',
        information: 'INTITULE',
        valeurNonRetenue: { type: 'TEXTE', texte: 'Chapitre 1 revu' },
        valeurConservee: { type: 'TACHE_SUPPRIMEE' },
        instant: physique(1),
        lue: false,
        elementExiste: false,
        supprime: { type: 'TACHE', id: T1 },
      },
      {
        id: idArbitraire(4),
        motif: 'SUPPRESSION',
        element: { type: 'TACHE', id: T2 },
        intitule: 'Annexe',
        information: 'OBJECTIFS',
        valeurNonRetenue: { type: 'RATTACHEE', intitule: 'Publier le guide' },
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        instant: physique(1),
        lue: false,
        elementExiste: true,
        supprime: { type: 'OBJECTIF', id: O1 },
      },
      {
        id: idArbitraire(5),
        motif: 'SUPPRESSION',
        element: { type: 'OBJECTIF', id: O3 },
        intitule: 'Version imprimable',
        information: 'PARENT',
        valeurNonRetenue: { type: 'SOUS', intitule: 'Publier le guide' },
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        instant: physique(1),
        lue: false,
        elementExiste: true,
        supprime: { type: 'OBJECTIF', id: O1 },
      },
      {
        id: idArbitraire(6),
        motif: 'SUPPRESSION',
        element: { type: 'TACHE', id: T3 },
        intitule: 'Section A',
        information: 'CREATION',
        valeurNonRetenue: { type: 'SOUS_TACHE_DE', intitule: 'Chapitre 1 revu' },
        valeurConservee: { type: 'SUPPRIMEE_AVEC', intitule: 'Chapitre 1 revu' },
        instant: physique(1),
        lue: false,
        elementExiste: false,
        supprime: { type: 'TACHE', id: T1 },
      },
      {
        id: idArbitraire(7),
        motif: 'PLACEMENT_ANNULE',
        element: { type: 'OBJECTIF', id: ALPHA },
        intitule: 'Alpha',
        information: 'PARENT',
        valeurNonRetenue: { type: 'SOUS', intitule: 'Bêta' },
        valeurConservee: { type: 'PLACEMENT_ANNULE' },
        instant: physique(3),
        lue: false,
        elementExiste: true,
      },
      {
        id: idArbitraire(8),
        motif: 'DONNEES_EFFACEES',
        element: { type: 'TACHE', id: T2 },
        intitule: 'Annexe',
        information: 'DELAI',
        valeurNonRetenue: { type: 'DATE', date: date('2026-12-01') },
        valeurConservee: { type: 'DONNEES_EFFACEES' },
        instant: physique(4),
        lue: false,
        elementExiste: true,
      },
    ];
    expect(detail).toHaveLength(attendus.length);
    expect(detail).toEqual(expect.arrayContaining([...attendus]));
  });
});
