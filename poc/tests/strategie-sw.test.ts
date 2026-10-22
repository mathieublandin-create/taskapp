import { describe, expect, it } from 'vitest';
import { optionsWorkbox } from '../src/sw/strategie';

describe('stratégie de service worker (R12)', () => {
  it('précache l’application complète et ne met pas GIS en cache', () => {
    expect(optionsWorkbox.globPatterns).toContain('**/*.{js,css,html,png,svg,webmanifest}');
    expect(optionsWorkbox.navigateFallback).toBe('index.html');
    expect(optionsWorkbox.runtimeCaching).toEqual([]);
  });
});
