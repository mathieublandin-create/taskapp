import { Capacitor } from '@capacitor/core';

export type TypeAppareil = 'android' | 'pc';
export type PlateformeWeb = 'web-android' | 'web-ios' | 'web-pc';
export type ModeAffichage = 'standalone' | 'navigateur';

/**
 * Type d'appareil pour nommer les fichiers d'état : `android` = APK natif. Sur le web, `pc` pour tous
 * les appareils : la plateforme réelle est donnée par `plateformeWeb`.
 */
export function typeAppareil(): TypeAppareil {
  return Capacitor.isNativePlatform() ? 'android' : 'pc';
}

/** Plateforme web déduite de l'agent utilisateur (iPadOS se présente en Macintosh tactile). */
export function plateformeWeb(agent: string, pointsTactiles = 0): PlateformeWeb {
  if (/android/i.test(agent)) return 'web-android';
  if (/iphone|ipad|ipod/i.test(agent) || (/macintosh/i.test(agent) && pointsTactiles > 1)) {
    return 'web-ios';
  }
  return 'web-pc';
}

export function modeAffichage(
  correspond: (requete: string) => { matches: boolean } = (r) => window.matchMedia(r),
): ModeAffichage {
  return correspond('(display-mode: standalone)').matches ? 'standalone' : 'navigateur';
}

/** Mode d'affichage, plateforme web et état réseau (spécification §13.5). */
export function contexteExecution(): string {
  const plateforme = plateformeWeb(navigator.userAgent, navigator.maxTouchPoints);
  return `mode d'affichage : ${modeAffichage()} ; plateforme : ${plateforme} ; en ligne : ${navigator.onLine}`;
}

export function descriptionAppareil(): string {
  const plateforme = plateformeWeb(navigator.userAgent, navigator.maxTouchPoints);
  return `${typeAppareil()} | ${plateforme} | ${modeAffichage()} | ${navigator.userAgent}`;
}
