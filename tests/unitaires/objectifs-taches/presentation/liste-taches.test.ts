import { describe, expect, it } from 'vitest';
import type { ResumeTache } from '@src/objectifs-taches/application/requetes/resumes';
import { construireLigneTache } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-tache';
import {
  construireListeTaches,
  FILTRE_ETAT_PAR_DEFAUT,
  type FiltreEtat,
  type FiltreObjectif,
} from '@src/objectifs-taches/presentation/modeles-de-vue/liste-taches';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { creeAuRang, resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { date, idObjectif, idTache, MINUTE } from '@tests/support/valeurs';

const AUJOURDHUI = '2026-10-21T08:00:00.000Z';
const t = (n: number) => idTache(n);
const O = idObjectif(1);
const TOUS: FiltreObjectif = { type: 'TOUS' };

const liste = (
  taches: ReadonlyArray<ResumeTache>,
  etat: FiltreEtat = FILTRE_ETAT_PAR_DEFAUT,
  objectif: FiltreObjectif = TOUS,
  existeAuMoinsUnObjectif = true,
) =>
  construireListeTaches(
    { taches, existeAuMoinsUnObjectif },
    { etat, objectif },
    { horloge: horlogeSur(AUJOURDHUI) },
  );
const intitules = (
  taches: ReadonlyArray<ResumeTache>,
  etat?: FiltreEtat,
  objectif?: FiltreObjectif,
) => liste(taches, etat, objectif).lignes.map((l) => l.intitule);

describe('construireListeTaches (guide §5.7, US-002 CA-11)', () => {
  it('UT-US-002-19 construireListeTaches — filtre « à faire » par défaut, ordre de S20b : délai, création, puis intitulé sans casse ni accents', () => {
    const t0 = creeAuRang(1);
    const t5 = (t0 + 5 * MINUTE) as typeof t0;
    const taches = [
      resumeTache({ id: t(1), intitule: 'Relire', delai: '2026-11-30', creeLe: t0 }),
      resumeTache({ id: t(2), intitule: 'Zoom', delai: '2026-11-30', creeLe: t5 }),
      resumeTache({ id: t(3), intitule: 'écrire', delai: '2026-11-30', creeLe: t5 }),
      resumeTache({ id: t(4), intitule: 'Appeler', delai: '2026-11-30', creeLe: t5 }),
      resumeTache({ id: t(5), intitule: 'Banque', delai: '2026-11-20', creeLe: t5 }),
      resumeTache({ id: t(6), intitule: 'Terminée', cycleDeVie: terminee('2026-10-20') }),
    ];

    expect(FILTRE_ETAT_PAR_DEFAUT).toBe('A_FAIRE');
    expect(liste(taches).filtreEtat).toBe('A_FAIRE');
    expect(intitules(taches)).toEqual(['Banque', 'Relire', 'Appeler', 'écrire', 'Zoom']);
  });

  it('UT-US-002-20 construireListeTaches — filtre « terminée » : date de fin décroissante, départagée par l’instant de fin (S20c)', () => {
    const taches = [
      resumeTache({ id: t(1), intitule: 'Plan', cycleDeVie: terminee('2026-10-10') }),
      resumeTache({
        id: t(2),
        intitule: 'Sommaire',
        cycleDeVie: terminee('2026-10-18', '2026-10-18T08:00:00.000Z'),
      }),
      resumeTache({ id: t(3), intitule: 'Préface', cycleDeVie: terminee('2026-10-14') }),
      resumeTache({
        id: t(4),
        intitule: 'Index',
        cycleDeVie: terminee('2026-10-18', '2026-10-18T12:00:00.000Z'),
      }),
    ];

    expect(intitules(taches, 'TERMINEE')).toEqual(['Index', 'Sommaire', 'Préface', 'Plan']);
  });

  it('UT-US-002-21 construireListeTaches — filtre « abandonnée » : Affiche puis Logo (S20c)', () => {
    const taches = [
      resumeTache({ id: t(1), intitule: 'Logo', cycleDeVie: abandonnee('2026-10-12', 'op:0') }),
      resumeTache({ id: t(2), intitule: 'Affiche', cycleDeVie: abandonnee('2026-10-19', 'op:1') }),
    ];

    expect(intitules(taches, 'ABANDONNEE')).toEqual(['Affiche', 'Logo']);
  });

  it('UT-US-002-22 construireListeTaches — ne présente jamais une sous-tâche en ligne ; la tâche parente porte le compteur 1/2 (S20d)', () => {
    const taches = [
      resumeTache({
        id: t(1),
        intitule: 'Chapitre 1',
        sousTaches: { terminees: 1, nonAbandonnees: 2 },
      }),
      resumeTache({
        id: t(2),
        intitule: 'Section B',
        tacheParente: { id: t(1), intitule: 'Chapitre 1' },
      }),
    ];

    const modele = liste(taches);

    expect(modele.lignes.map((l) => l.intitule)).toEqual(['Chapitre 1']);
    expect(modele.lignes[0]?.compteurSousTaches).toMatchObject({ terminees: 1, nonAbandonnees: 2 });
  });

  it('UT-US-002-23 construireListeTaches — filtre d’objectif SANS_OBJECTIF et OBJECTIF (US-002 CA-5)', () => {
    const taches = [
      resumeTache({
        id: t(1),
        intitule: 'Avec objectif',
        objectifs: [{ id: O, intitule: 'Publier le guide' }],
      }),
      resumeTache({ id: t(2), intitule: 'Sans objectif' }),
    ];

    expect(intitules(taches, 'A_FAIRE', { type: 'SANS_OBJECTIF' })).toEqual(['Sans objectif']);
    expect(intitules(taches, 'A_FAIRE', { type: 'OBJECTIF', id: O })).toEqual(['Avec objectif']);
  });

  it('UT-US-002-24 construireListeTaches — choisit l’état vide selon le guide §6.6.5', () => {
    const terminees = [
      resumeTache({
        id: t(1),
        cycleDeVie: terminee('2026-10-20'),
        objectifs: [{ id: O, intitule: 'Publier' }],
      }),
    ];
    const aFaire = [resumeTache({ id: t(2), objectifs: [{ id: O, intitule: 'Publier' }] })];

    expect(liste([], 'A_FAIRE', TOUS, false).etatVide).toEqual({ code: 'EVD-BIENVENUE' });
    expect(liste([], 'A_FAIRE', TOUS, true).etatVide).toEqual({ code: 'EVD-TACHES' });
    expect(liste(aFaire, 'A_FAIRE', { type: 'SANS_OBJECTIF' }).etatVide).toEqual({
      code: 'EVD-FILTRE-SANS-OBJECTIF',
    });
    expect(liste(terminees, 'A_FAIRE').etatVide).toEqual({ code: 'EVD-FILTRE-A-FAIRE' });
    expect(liste(aFaire, 'TERMINEE').etatVide).toEqual({ code: 'EVD-FILTRE-TERMINEES' });
    expect(liste(aFaire, 'ABANDONNEE').etatVide).toEqual({ code: 'EVD-FILTRE-ABANDONNEES' });
    expect(liste(aFaire, 'A_FAIRE').etatVide).toBeUndefined();
  });

  it('UT-US-002-25 construireLigneTache — produit ETA-TACHE-*, MEN-EN-RETARD et ALR-005 avec les intitulés des objectifs (US-002 CA-7, CA-10)', () => {
    const aujourdhui = date('2026-10-21');
    const enRetard = construireLigneTache(
      resumeTache({
        id: t(1),
        enRetard: true,
        alertes: [
          {
            type: 'OBJECTIFS',
            objectifs: [{ id: O, intitule: 'Publier le guide', delai: date('2026-11-20') }],
          },
        ],
      }),
      aujourdhui,
    );

    expect(enRetard).toMatchObject({
      etat: { code: 'ETA-TACHE-A-FAIRE' },
      enRetard: { code: 'MEN-EN-RETARD' },
      alertes: [{ code: 'ALR-005', objectifs: ['Publier le guide'] }],
    });
    expect(
      construireLigneTache(
        resumeTache({ id: t(2), cycleDeVie: terminee('2026-10-20') }),
        aujourdhui,
      ).etat.code,
    ).toBe('ETA-TACHE-TERMINEE');
    expect(
      construireLigneTache(
        resumeTache({ id: t(3), cycleDeVie: abandonnee('2026-10-20', 'op:0') }),
        aujourdhui,
      ).etat.code,
    ).toBe('ETA-TACHE-ABANDONNEE');
    expect(construireLigneTache(resumeTache({ id: t(4) }), aujourdhui).enRetard).toBeUndefined();
  });

  it('UT-US-002-25 construireListeTaches — porte le sous-titre MEN-TRI-DELAI pour chaque filtre d’état (guide §6.6.4)', () => {
    expect(liste([], 'A_FAIRE').sousTitre.code).toBe('MEN-TRI-DELAI');
    expect(liste([], 'TERMINEE').sousTitre.code).toBe('MEN-TRI-DELAI');
  });

  it('UT-US-003-16 construireListeTaches — filtre « terminée » : ETA-TACHE-TERMINEE, la ligne montre le délai et non la date de fin (US-003 CA-11)', () => {
    const modele = liste(
      [resumeTache({ id: t(1), delai: '2026-11-15', cycleDeVie: terminee('2026-10-20') })],
      'TERMINEE',
    );

    expect(modele.lignes.map((l) => [l.etat.code, l.delai.date])).toEqual([
      ['ETA-TACHE-TERMINEE', '2026-11-15'],
    ]);
  });

  it('UT-US-025-16 construireListeTaches — une tâche abandonnée quitte le filtre « à faire » et figure dans « abandonnée » (US-025 CA-2)', () => {
    const taches = [
      resumeTache({
        id: t(1),
        intitule: 'Refaire le logo',
        cycleDeVie: abandonnee('2026-10-21', 'op:0'),
      }),
    ];

    expect(intitules(taches, 'A_FAIRE')).toEqual([]);
    expect(intitules(taches, 'ABANDONNEE')).toEqual(['Refaire le logo']);
  });

  it('UT-US-024-22 construireLigneTache — porte MEN-INCOHERENCE quand le résumé signale une incohérence, et seulement alors (RG-049, rang 9)', () => {
    const aujourdhui = date('2026-10-21');
    const incoherente = resumeTache({
      id: t(1),
      cycleDeVie: terminee('2026-10-20'),
      incoherence: {
        etatParent: 'TERMINEE',
        sousTachesAFaire: [{ id: t(2), intitule: 'Section A' }],
      },
    });

    expect(construireLigneTache(incoherente, aujourdhui).incoherence).toEqual({
      code: 'MEN-INCOHERENCE',
    });
    expect(construireLigneTache(resumeTache({ id: t(3) }), aujourdhui).incoherence).toBeUndefined();
  });
});
