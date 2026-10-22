import { describe, expect, it } from 'vitest';
import { construireListeObjectifs } from '@src/objectifs-taches/presentation/modeles-de-vue/liste-objectifs';
import type { LigneObjectif } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif';
import { creeAuRang, resumeObjectif } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { date, idObjectif, NEW_YORK } from '@tests/support/valeurs';

const AUJOURDHUI = '2026-10-21T08:00:00.000Z';
const o = (n: number) => idObjectif(n);
const intitules = (lignes: ReadonlyArray<LigneObjectif>) => lignes.map((l) => l.intitule);
const ligne = (lignes: ReadonlyArray<LigneObjectif>, intitule: string) =>
  lignes.find((l) => l.intitule === intitule);

describe('construireListeObjectifs (ECR-008)', () => {
  it('UT-US-001-28 construireListeObjectifs — produit les codes d’état, le compteur, MEN-SANS-DELAI et MEN-EN-RETARD (US-001 CA-2, CA-3, CA-7)', () => {
    const objectifs = [
      resumeObjectif({
        id: o(1),
        intitule: 'Publier le guide',
        delai: '2026-12-15',
        etat: 'EN_COURS',
        tachesTerminees: 1,
        tachesNonAbandonnees: 3,
      }),
      resumeObjectif({ id: o(2), intitule: 'Apprendre le piano', etat: 'A_DECLINER' }),
      resumeObjectif({
        id: o(3),
        intitule: 'Ranger le garage',
        delai: '2026-10-01',
        etat: 'EN_COURS',
        enRetard: true,
      }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(ligne(modele.lignes, 'Publier le guide')).toMatchObject({
      niveau: 'PRINCIPAL',
      etat: { code: 'ETA-OBJ-EN-COURS' },
      compteur: { code: 'ETA-OBJ-COMPTEUR', terminees: 1, nonAbandonnees: 3 },
      delai: { type: 'DATE', date: date('2026-12-15') },
    });
    expect(ligne(modele.lignes, 'Publier le guide')?.enRetard).toBeUndefined();
    expect(ligne(modele.lignes, 'Apprendre le piano')).toMatchObject({
      etat: { code: 'ETA-OBJ-A-DECLINER' },
      delai: { type: 'SANS_DELAI', code: 'MEN-SANS-DELAI' },
    });
    expect(ligne(modele.lignes, 'Ranger le garage')?.enRetard?.code).toBe('MEN-EN-RETARD');
  });

  it('UT-US-001-29 construireListeObjectifs — affiche MEN-HEURE-PARIS pour un appareil à New York, pas pour un appareil à Paris (RG-054)', () => {
    const objectifs = [resumeObjectif({ id: o(1) })];

    const aNewYork = construireListeObjectifs(
      { objectifs },
      { horloge: horlogeSur(AUJOURDHUI, NEW_YORK) },
    );
    const aParis = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(aNewYork.mentionHeureParis?.code).toBe('MEN-HEURE-PARIS');
    expect(aParis.mentionHeureParis).toBeUndefined();
  });

  it('UT-US-001-30 construireListeObjectifs — produit EVD-OBJECTIFS quand il n’y a aucun objectif (guide §6.6.5)', () => {
    const modele = construireListeObjectifs({ objectifs: [] }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(modele.etatVide).toEqual({ code: 'EVD-OBJECTIFS' });
    expect(modele.lignes).toEqual([]);
    expect(modele.sectionAtteints).toBeUndefined();
  });

  it('UT-US-001-35 construireListeObjectifs — ordonne les principaux par délai croissant, sans délai à la fin, puis création, puis intitulé sans casse ni accents (guide v0.2.9 §5.8 a)', () => {
    const objectifs = [
      resumeObjectif({
        id: o(1),
        intitule: 'Délai 30 créé en 3',
        delai: '2026-11-30',
        creeLe: creeAuRang(3),
      }),
      resumeObjectif({
        id: o(2),
        intitule: 'Délai 20',
        delai: '2026-11-20',
        creeLe: creeAuRang(5),
      }),
      resumeObjectif({ id: o(3), intitule: 'Sans délai', creeLe: creeAuRang(1) }),
      resumeObjectif({
        id: o(4),
        intitule: 'Délai 30 créé en 2',
        delai: '2026-11-30',
        creeLe: creeAuRang(2),
      }),
      resumeObjectif({ id: o(5), intitule: 'Zoom', delai: '2026-12-31', creeLe: creeAuRang(7) }),
      resumeObjectif({ id: o(6), intitule: 'écrire', delai: '2026-12-31', creeLe: creeAuRang(7) }),
      resumeObjectif({ id: o(7), intitule: 'appeler', delai: '2026-12-31', creeLe: creeAuRang(7) }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(intitules(modele.lignes)).toEqual([
      'Délai 20',
      'Délai 30 créé en 2',
      'Délai 30 créé en 3',
      'appeler',
      'écrire',
      'Zoom',
      'Sans délai',
    ]);
  });

  it('UT-US-001-35 construireListeObjectifs — regroupe les principaux atteints et leurs sous-objectifs dans SEC-OBJ-ATTEINTS, repliée, avec n (guide v0.2.9 §5.8 b)', () => {
    const objectifs = [
      resumeObjectif({ id: o(1), intitule: 'En cours', etat: 'EN_COURS' }),
      resumeObjectif({ id: o(2), intitule: 'Atteint tard', etat: 'ATTEINT', delai: '2026-12-31' }),
      resumeObjectif({ id: o(3), intitule: 'Atteint tôt', etat: 'ATTEINT', delai: '2026-11-01' }),
      resumeObjectif({ id: o(4), intitule: 'Sous atteint tard', etat: 'ATTEINT', parentId: o(2) }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(intitules(modele.lignes)).toEqual(['En cours']);
    expect(modele.sectionAtteints).toMatchObject({
      code: 'SEC-OBJ-ATTEINTS',
      n: 2,
      replieeParDefaut: true,
    });
    expect(intitules(modele.sectionAtteints?.lignes ?? [])).toEqual([
      'Atteint tôt',
      'Atteint tard',
      'Sous atteint tard',
    ]);
  });

  it('UT-US-001-35 construireListeObjectifs — omet SEC-OBJ-ATTEINTS quand aucun principal n’est atteint et garde un sous-objectif atteint sous son parent en cours (guide v0.2.9 §5.8 b, c)', () => {
    const objectifs = [
      resumeObjectif({ id: o(1), intitule: 'Parent en cours', etat: 'EN_COURS' }),
      resumeObjectif({
        id: o(2),
        intitule: 'Sous-objectif atteint',
        etat: 'ATTEINT',
        parentId: o(1),
      }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(modele.sectionAtteints).toBeUndefined();
    expect(intitules(modele.lignes)).toEqual(['Parent en cours', 'Sous-objectif atteint']);
  });

  it('UT-US-023-16 construireListeObjectifs — place un sous-objectif (SOUS_OBJECTIF) juste après son parent, avec ALR-007 nommant le parent (US-023 CA-2, CA-4)', () => {
    const objectifs = [
      resumeObjectif({
        id: o(1),
        intitule: 'Publier le guide',
        delai: '2026-12-15',
        creeLe: creeAuRang(1),
      }),
      resumeObjectif({
        id: o(2),
        intitule: 'Autre objectif',
        delai: '2026-12-20',
        creeLe: creeAuRang(2),
      }),
      resumeObjectif({
        id: o(3),
        intitule: 'Version imprimable',
        delai: '2027-01-15',
        parentId: o(1),
        parentIntitule: 'Publier le guide',
        alerteDelai: {
          parentId: o(1),
          parentIntitule: 'Publier le guide',
          delaiParent: date('2026-12-15'),
        },
        creeLe: creeAuRang(3),
      }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(intitules(modele.lignes)).toEqual([
      'Publier le guide',
      'Version imprimable',
      'Autre objectif',
    ]);
    expect(ligne(modele.lignes, 'Version imprimable')).toMatchObject({
      niveau: 'SOUS_OBJECTIF',
      parentId: o(1),
      alerteDelai: { code: 'ALR-007', parent: 'Publier le guide' },
    });
    expect(ligne(modele.lignes, 'Publier le guide')?.alerteDelai).toBeUndefined();
  });

  it('UT-US-023-21 construireListeObjectifs — trie les sous-objectifs sous leur parent par l’ordre de référence, atteints compris, sans les déplacer (guide v0.2.9 §5.8 c)', () => {
    const objectifs = [
      resumeObjectif({ id: o(1), intitule: 'Parent', etat: 'EN_COURS' }),
      resumeObjectif({
        id: o(2),
        intitule: 'Sous sans délai',
        parentId: o(1),
        creeLe: creeAuRang(1),
      }),
      resumeObjectif({
        id: o(3),
        intitule: 'Sous atteint 11-30',
        parentId: o(1),
        delai: '2026-11-30',
        etat: 'ATTEINT',
      }),
      resumeObjectif({ id: o(4), intitule: 'Sous 11-10', parentId: o(1), delai: '2026-11-10' }),
    ];

    const modele = construireListeObjectifs({ objectifs }, { horloge: horlogeSur(AUJOURDHUI) });

    expect(intitules(modele.lignes)).toEqual([
      'Parent',
      'Sous 11-10',
      'Sous atteint 11-30',
      'Sous sans délai',
    ]);
  });
});
