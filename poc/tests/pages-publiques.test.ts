import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { optionsWorkbox } from '../src/sw/strategie';

const HOTES_AUTORISES = new Set([
  'github.com',
  'docs.github.com',
  'myaccount.google.com',
  'developers.google.com',
  'policies.google.com',
]);

function lire(nom: string): string {
  return readFileSync(resolve(import.meta.dirname, '../public', nom), 'utf-8');
}

const PAGES = ['accueil.html', 'confidentialite.html'];

describe.each(PAGES)('page publique %s', (nom) => {
  const html = lire(nom);

  it('est du HTML statique : ni script, ni ressource externe', () => {
    expect(html).not.toContain('<script');
    expect(html).not.toContain('src="http');
    expect(html).toContain('lang="fr"');
  });

  it('ne pointe que vers des hôtes autorisés', () => {
    const hotes = [...html.matchAll(/href="(https?:\/\/[^"/]+)/g)].map(
      (m) => new URL(m[1] ?? '').hostname,
    );
    for (const hote of hotes) expect(HOTES_AUTORISES.has(hote)).toBe(true);
  });

  it('ne contient aucune adresse e-mail', () => {
    expect(html).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });
});

describe('contenu des pages', () => {
  it('l’accueil renvoie vers les règles de confidentialité', () => {
    expect(lire('accueil.html')).toContain('href="confidentialite.html"');
  });

  it('la confidentialité mentionne les trois scopes et renvoie vers l’accueil', () => {
    const html = lire('confidentialite.html');
    for (const scope of ['drive.file', 'openid', 'email']) expect(html).toContain(scope);
    expect(html).toContain('href="accueil.html"');
  });
});

describe('service worker', () => {
  it('n’applique pas le repli de navigation aux deux pages publiques', () => {
    const motifs = optionsWorkbox.navigateFallbackDenylist ?? [];
    for (const chemin of [
      '/taskapp/accueil.html',
      '/taskapp/confidentialite.html',
      '/accueil.html',
    ]) {
      expect(motifs.some((m) => m.test(chemin))).toBe(true);
    }
    expect(motifs.some((m) => m.test('/taskapp/'))).toBe(false);
  });
});
