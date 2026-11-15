/**
 * Tests complémentaires du rang 2 (RC-R2-2, ST-US-001 §14) : `appareilDepuisAgent`, `formaterDate` (règles du guide
 * §6.6.1) et `libelle` (pluriel, insécables, erreurs de programmation).
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { appareilDepuisAgent, autreAppareil } from '@src/commun/presentation/format/appareil';
import { formaterDate } from '@src/commun/presentation/format/date';
import { aUnePartie, aUneVariante, libelle } from '@src/commun/presentation/messages/libelle';
import { date } from '@tests/support/valeurs';

const INSECABLE = ' ';

describe('appareilDepuisAgent et autreAppareil (guide §6.6.1)', () => {
  it('UT-COMP-US-001-03 appareilDepuisAgent — smartphone pour un agent mobile ou un Mac tactile, PC sinon ; autreAppareil échange les deux', () => {
    expect(appareilDepuisAgent('Mozilla/5.0 (Linux; Android 15) Mobile', 5)).toBe('smartphone');
    expect(appareilDepuisAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', 5)).toBe('smartphone');
    expect(appareilDepuisAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 5)).toBe(
      'smartphone',
    );
    expect(appareilDepuisAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 0)).toBe('PC');
    expect(appareilDepuisAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toBe('PC');
    expect(autreAppareil('PC')).toBe('smartphone');
    expect(autreAppareil('smartphone')).toBe('PC');
  });
});

describe('formaterDate (guide §6.6.1)', () => {
  it('UT-COMP-US-001-04 formaterDate — « 19 oct. » dans l’année courante, avec l’année dans une autre année', () => {
    const aujourdhui = date('2026-10-21');

    expect(formaterDate(date('2026-10-19'), aujourdhui)).toBe('19 oct.');
    expect(formaterDate(date('2026-01-05'), aujourdhui)).toBe('5 janv.');
    expect(formaterDate(date('2027-01-05'), aujourdhui)).toBe('5 janv. 2027');
    expect(formaterDate(date('2025-12-31'), aujourdhui)).toBe('31 déc. 2025');
  });
});

describe('libelle (guide §6.6.1, conventions.md §8.5)', () => {
  it('UT-COMP-US-001-05 libelle — le pluriel suit n : 0 et 1 au singulier, 2 et plus au pluriel', () => {
    expect(libelle('SEC-OBJ-ATTEINTS', { n: 3 })).toBe('Atteints (3)');
    expect(libelle('MEN-NON-RETENUE', { n: 0 })).toContain('0 modification non retenue');
    expect(libelle('MEN-NON-RETENUE', { n: 1 })).toContain('1 modification non retenue');
    expect(libelle('MEN-NON-RETENUE', { n: 2 })).toContain('2 modifications non retenues');
  });

  it('UT-COMP-US-001-06 libelle — espace insécable avant « ? », « : », « ! », « ; » et dans les guillemets « », sans retoucher les valeurs interpolées', () => {
    expect(libelle('CNF-SUPPR-OBJECTIF', { element: 'a ? b', taches: 1, sousObjectifs: 0 })).toBe(
      `Supprimer «${INSECABLE}a ? b${INSECABLE}»${INSECABLE}?`,
    );
    expect(libelle('CNF-ABANDON-TACHE', { element: 'Chapitre 1' })).toBe(
      `Abandonner «${INSECABLE}Chapitre 1${INSECABLE}»${INSECABLE}?`,
    );
  });

  it('UT-COMP-US-001-07 libelle — une variante remplace les champs qu’elle redéfinit, la partie « action » est lue séparément', () => {
    expect(libelle('CNF-SUPPR-TACHE', { n: 2 })).toBe(
      `Supprimer la tâche et ses 2 sous-tâches${INSECABLE}?`,
    );
    expect(libelle('CNF-SUPPR-TACHE', { variante: 'sans-sous-tache' })).toBe(
      `Supprimer la tâche${INSECABLE}?`,
    );
    expect(libelle('CNF-SUPPR-TACHE', {}, 'action')).toBe('Supprimer');
  });

  it('UT-COMP-US-001-08 libelle — une variable absente, une variante inconnue ou une partie absente sont des erreurs de programmation', () => {
    expect(() => libelle('SEC-OBJ-ATTEINTS')).toThrow(ErreurProgrammation);
    expect(() => libelle('SEC-OBJ-ATTEINTS')).toThrow('Variable « n » absente');
    expect(() => libelle('CNF-SUPPR-TACHE', { n: 1, variante: 'inconnue' })).toThrow(
      'Variante « inconnue » inconnue',
    );
    expect(() => libelle('MEN-SANS-DELAI', {}, 'action')).toThrow("n'a pas de « action »");
  });

  it('UT-COMP-US-001-09 aUnePartie et aUneVariante — disent si le code porte la partie ou la variante', () => {
    expect(aUnePartie('EVD-OBJECTIFS', 'action')).toBe(true);
    expect(aUnePartie('EVD-OBJECTIFS', 'texte')).toBe(false);
    expect(aUneVariante('ERR-014', 'avec-action')).toBe(true);
    expect(aUneVariante('ERR-014', 'autre')).toBe(false);
    expect(aUneVariante('MEN-SANS-DELAI', 'avec-action')).toBe(false);
  });
});
