/**
 * ST-US-018 v0.4 §3 n° 1, §6.1 (rang 12, tranche D2) ; DAT §4.1.5 bis, §4.1.7 (RED-05), §7.4 bis : configuration du
 * service worker et du manifeste, dérivée de `VITE_BASE_PATH` et de `VITE_ENV` en un seul point.
 */
import { describe, expect, it } from 'vitest';
import { optionsPwa } from '../../../pwa.config';

/** Appelée dans chaque test (jamais à la collecte : la sélection par rang doit pouvoir l'écarter). */
const production = () => optionsPwa({ env: 'production', base: '/taskapp/' });

describe('optionsPwa (ST-US-018 §6.1)', () => {
  it('UT-US-018-05 invite de mise à jour — registerType « prompt », aucun script d’enregistrement injecté, ni skipWaiting ni clientsClaim automatiques', () => {
    expect(production().registerType).toBe('prompt');
    expect(production().injectRegister).toBe(false);
    expect(production().workbox?.skipWaiting).toBeUndefined();
    expect(production().workbox?.clientsClaim).toBeUndefined();
  });

  it('UT-US-018-05 précache seul — tout dist/ (globPatterns exacts), aucune mise en cache à l’exécution (aucune requête Google en cache)', () => {
    expect(production().workbox?.globPatterns).toEqual([
      '**/*.{js,css,html,ico,png,svg,webmanifest,woff2}',
    ]);
    expect(production().workbox?.runtimeCaching).toBeUndefined();
  });

  it('UT-US-018-05 navigateFallback sous VITE_BASE_PATH — /taskapp/index.html ; / pour la base racine', () => {
    expect(production().workbox?.navigateFallback).toBe('/taskapp/index.html');
    expect(optionsPwa({ env: 'recette', base: '/' }).workbox?.navigateFallback).toBe('/index.html');
  });

  it('UT-US-018-05 pages publiques exclues du repli — accueil.html et confidentialite.html, et elles seules', () => {
    const exclusions = production().workbox?.navigateFallbackDenylist ?? [];
    const exclu = (chemin: string): boolean => exclusions.some((motif) => motif.test(chemin));

    expect(exclusions.length).toBeGreaterThan(0);
    expect(exclu('/taskapp/accueil.html')).toBe(true);
    expect(exclu('/taskapp/confidentialite.html')).toBe(true);
    expect(exclu('/taskapp/')).toBe(false);
    expect(exclu('/taskapp/index.html')).toBe(false);
    expect(exclu('/taskapp/objectifs/abc-1')).toBe(false);
    expect(exclu('/taskapp/accueil')).toBe(false);
  });

  it('UT-US-018-05 manifeste — portée et départ = base, standalone, français ; nom de recette distinct', () => {
    const manifeste = production().manifest;
    expect(manifeste).toMatchObject({
      name: 'Done Juan',
      short_name: 'Done Juan',
      lang: 'fr',
      start_url: '/taskapp/',
      scope: '/taskapp/',
      display: 'standalone',
    });
    expect(optionsPwa({ env: 'recette', base: '/taskapp-recette/' }).manifest).toMatchObject({
      name: 'Done Juan (recette)',
      start_url: '/taskapp-recette/',
      scope: '/taskapp-recette/',
    });
    expect(optionsPwa({ env: undefined, base: '/' }).manifest).toMatchObject({ name: 'Done Juan' });
  });
});
