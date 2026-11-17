/**
 * ST-US-018 v0.4 §3 n° 29, §16 (réponse de Starck à Q-ST018-STA-2), DAT v0.11.12 §4.1.3, §7.2 : pages publiques du client
 * OAuth, servies par l'application (`public/`) aux adresses du PoC. UT-COMP-US-018-40.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { optionsPwa } from '../../../pwa.config';

const PAGES = ['accueil.html', 'confidentialite.html'] as const;
const lire = (page: string): string => readFileSync(`public/${page}`, 'utf8');

/** Hôtes externes admis : GitHub et Google seulement. */
const HOTE_ADMIS = /(^|\.)(github\.com|google\.com)$/;

describe('Pages publiques (UT-COMP-US-018-40)', () => {
  it.each(PAGES)('UT-COMP-US-018-40 %s — le fichier existe dans public/', (page) => {
    expect(existsSync(`public/${page}`)).toBe(true);
  });

  it.each(PAGES)('UT-COMP-US-018-40 %s — ni script, ni mailto:, ni adresse e-mail', (page) => {
    const texte = lire(page);

    expect(texte).not.toMatch(/<script/i);
    expect(texte).not.toMatch(/mailto:/i);
    expect(texte).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  });

  it.each(PAGES)(
    'UT-COMP-US-018-40 %s — ni « POC » ni « Diagnostic » ni « version de test »',
    (page) => {
      const texte = lire(page);

      expect(texte).not.toMatch(/\bPOC\b/i);
      expect(texte).not.toMatch(/diagnostic/i);
      expect(texte).not.toMatch(/version de test/i);
      expect(texte).not.toMatch(/application de test/i);
    },
  );

  it.each(PAGES)('UT-COMP-US-018-40 %s — liens externes limités à GitHub et Google', (page) => {
    const hotes = [...lire(page).matchAll(/href="(https?:\/\/[^"]+)"/g)].map(
      (m) => new URL(m[1] ?? '').hostname,
    );

    expect(hotes.length).toBeGreaterThan(0);
    expect(hotes.filter((hote) => !HOTE_ADMIS.test(hote))).toEqual([]);
  });

  it('UT-COMP-US-018-40 hors repli — le service worker ne remplace aucune des deux pages par index.html', () => {
    const interdits = optionsPwa({ env: 'production', base: '/taskapp/' }).workbox
      ?.navigateFallbackDenylist;

    for (const page of PAGES) {
      expect(interdits?.some((motif) => motif.test(`/taskapp/${page}`))).toBe(true);
    }
  });
});

describe('Pages publiques, exactitude des affirmations (UT-COMP-US-018-41 et suivants)', () => {
  const condense = (page: string): string =>
    lire(page)
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ');

  it('UT-COMP-US-018-41 confidentialite.html — Google affiche une adresse github.io, non « Done Juan »', () => {
    const texte = condense('confidentialite.html');

    expect(texte).toContain('mathieublandin-create.github.io');
    expect(texte).not.toMatch(/« Done Juan », « Supprimer l'accès »/);
  });

  it('UT-COMP-US-018-42 confidentialite.html — corbeille du Drive et suppression des données de l’appareil', () => {
    const texte = condense('confidentialite.html');

    expect(texte).toContain('corbeille de votre Drive');
    expect(texte).toContain('Supprimer les données de cet appareil');
  });

  it('UT-COMP-US-018-43 confidentialite.html — données conservées non chiffrées après la déconnexion (DT-001)', () => {
    const texte = condense('confidentialite.html');

    expect(texte).toContain("restent sur l'appareil après la déconnexion");
    expect(texte).toContain('ne les chiffre pas');
  });

  it('UT-COMP-US-018-44 confidentialite.html — date de mise à jour exacte', () => {
    expect(condense('confidentialite.html')).toContain('Dernière mise à jour : 17 novembre 2026.');
  });
});
