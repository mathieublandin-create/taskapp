/**
 * ST-CORR-E13B-LOT-001 §3 (tranche T1) : textes de l'E13b de LOT-001. E13b-a (Q-ST024-STE-1, réponse b 1) : codes
 * `TXT-TERMINER-SOUS-TACHE` et `TXT-ABANDONNER-SOUS-TACHE` (guide v0.2.26 §6.6.12, §6.6.16 n° 3) ; Q-ST017-STE-1 b :
 * variantes `une` et `aucune` d'`ERR-016` (guide §6.6.8, §6.6.16 n° 3). Rang 14 (rangs-tests.json).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { libelle } from '@src/commun/presentation/messages/libelle';
import { CODES_CATALOGUE, type CodeCatalogue } from '@src/commun/presentation/messages/codes';
import { LIBELLES_TACHES } from '@src/objectifs-taches/presentation/ui/libelles-ui';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import type { LigneFeuilleOrdonnable } from '@src/synchronisation/presentation/modeles-de-vue/ordre-feuille';
import { codesDuGuide } from '../../../../scripts/verifier-catalogue';
import { instant } from '@tests/support/valeurs';

const RACINE = join(import.meta.dirname, '..', '..', '..', '..');
const lire = (chemin: string): string => readFileSync(join(RACINE, chemin), 'utf8');
const lister = (dossier: string): ReadonlyArray<string> =>
  readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? lister(chemin) : [chemin];
  });

const INSECABLE = ' ';
const TERMINER = 'TXT-TERMINER-SOUS-TACHE' as CodeCatalogue;
const ABANDONNER = 'TXT-ABANDONNER-SOUS-TACHE' as CodeCatalogue;

const ETAT_ECHEC: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
  actionRequise: 'ECHEC_PERSISTANT',
};

const elements = (n: number): ReadonlyArray<LigneFeuilleOrdonnable> =>
  Array.from({ length: n }, (_, i) => ({
    id: `id-${String(i + 1)}`,
    intitule: `Tâche ${String(i + 1)}`,
    instant: instant('2026-10-21T08:00:00.000Z'),
  }));

/** Texte de la carte `ERR-016` de la feuille pour `n` modifications en attente. */
const texteErr016 = (n: number): string | undefined =>
  construireFeuilleSynchronisation({
    etat: { ...ETAT_ECHEC, enAttente: n },
    maintenant: instant('2026-10-21T08:32:00.000Z'),
    elementsEnAttente: elements(n),
  }).cartes.find((c) => c.message === 'ERR-016')?.texte;

describe('E13b-a : actions de la carte d’incohérence au catalogue (guide §6.6.12, §6.6.16 n° 3)', () => {
  it('UT-E13B-TXT-01 TXT-TERMINER-SOUS-TACHE et TXT-ABANDONNER-SOUS-TACHE : présents dans CODES_CATALOGUE, libellé et nom accessible exacts', () => {
    expect(CODES_CATALOGUE).toContain('TXT-TERMINER-SOUS-TACHE');
    expect(CODES_CATALOGUE).toContain('TXT-ABANDONNER-SOUS-TACHE');
    expect(libelle(TERMINER)).toBe('Terminer la sous-tâche');
    expect(libelle(ABANDONNER)).toBe('Abandonner la sous-tâche');
    expect(libelle(TERMINER, { element: 'Section A' }, 'nomAccessible')).toBe(
      `Terminer la sous-tâche${INSECABLE}: «${INSECABLE}Section A${INSECABLE}»`,
    );
    expect(libelle(ABANDONNER, { element: 'Section A' }, 'nomAccessible')).toBe(
      `Abandonner la sous-tâche${INSECABLE}: «${INSECABLE}Section A${INSECABLE}»`,
    );
  });

  it('UT-E13B-TXT-02 guide §6.6.12 : les deux codes sont lus par verifier:catalogue (colonne « Code » en premier)', () => {
    const codes = codesDuGuide(lire('docs/02-ux/guide-ergonomie.md'));
    expect(codes.has('TXT-TERMINER-SOUS-TACHE')).toBe(true);
    expect(codes.has('TXT-ABANDONNER-SOUS-TACHE')).toBe(true);
  });

  it('UT-E13B-TXT-03 libelles-ui.ts : plus de constantes terminerSousTache ni abandonnerSousTache ; plus aucun TODO( dans src/', () => {
    expect(Object.keys(LIBELLES_TACHES)).not.toContain('terminerSousTache');
    expect(Object.keys(LIBELLES_TACHES)).not.toContain('abandonnerSousTache');
    const avecTodo = lister(join(RACINE, 'src'))
      .filter((chemin) => /\.tsx?$/.test(chemin))
      .filter((chemin) => readFileSync(chemin, 'utf8').includes('TODO('));
    expect(avecTodo).toEqual([]);
  });

  it('UT-E13B-TXT-04 carte-incoherence.tsx : les deux actions passent par libelle() avec les codes TXT-, jamais par LIBELLES_TACHES', () => {
    const source = lire('src/objectifs-taches/presentation/ui/composants/carte-incoherence.tsx');
    expect(source).toContain("'TXT-TERMINER-SOUS-TACHE'");
    expect(source).toContain("'TXT-ABANDONNER-SOUS-TACHE'");
    expect(source).not.toMatch(/terminerSousTache|abandonnerSousTache/);
  });
});

describe('Q-ST017-STE-1 b : variantes d’ERR-016 (guide §6.6.8, §6.6.16 n° 3)', () => {
  const SUITE = `L’application réessaie toute seule${INSECABLE}; vous pouvez aussi réessayer maintenant.`;

  it('UT-E13B-TXT-05 catalogue : variante une (n = 1), variante aucune (n = 0), texte inchangé pour n ≥ 2 ; titre et action inchangés', () => {
    expect(libelle('ERR-016', { n: 1, variante: 'une' }, 'texte')).toBe(
      `Votre modification est conservée sur cet appareil. ${SUITE}`,
    );
    expect(libelle('ERR-016', { n: 0, variante: 'aucune' }, 'texte')).toBe(SUITE);
    expect(libelle('ERR-016', { n: 2 }, 'texte')).toBe(
      `Vos 2 modifications sont conservées sur cet appareil. ${SUITE}`,
    );
    expect(libelle('ERR-016', { n: 1, variante: 'une' })).toBe('La synchronisation n’a pas abouti');
    expect(libelle('ERR-016', { n: 0, variante: 'aucune' }, 'action')).toBe('Réessayer maintenant');
  });

  it('UT-E13B-TXT-06 carte ERR-016 de la feuille : la variante suit le nombre de lignes en attente (0 : aucune, 1 : une, 2 et plus : texte de base)', () => {
    expect(texteErr016(0)).toBe(SUITE);
    expect(texteErr016(1)).toBe(`Votre modification est conservée sur cet appareil. ${SUITE}`);
    expect(texteErr016(2)).toBe(`Vos 2 modifications sont conservées sur cet appareil. ${SUITE}`);
    expect(texteErr016(5)).toBe(`Vos 5 modifications sont conservées sur cet appareil. ${SUITE}`);
  });
});
