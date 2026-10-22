import { Capacitor } from '@capacitor/core';
import { FournisseurJetonAndroid } from './auth-android';
import { FournisseurJetonWeb } from './auth-web';
import { GoogleAuthNative } from './plugin-natif';
import type { FournisseurJeton } from './ports';

export function creerFournisseur(clientIdWeb: string): FournisseurJeton {
  return Capacitor.isNativePlatform()
    ? new FournisseurJetonAndroid(GoogleAuthNative)
    : new FournisseurJetonWeb(clientIdWeb);
}
