import { Capacitor } from '@capacitor/core';

export type TypeAppareil = 'android' | 'pc';

export function typeAppareil(): TypeAppareil {
  return Capacitor.isNativePlatform() ? 'android' : 'pc';
}

export function descriptionAppareil(): string {
  return `${typeAppareil()} | ${navigator.userAgent}`;
}
