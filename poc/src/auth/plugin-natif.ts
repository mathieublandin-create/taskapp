import { registerPlugin } from '@capacitor/core';

export interface InfoSignature {
  versionCode: number;
  versionName: string;
  sha256: string;
  sha1: string;
}

export interface ResultatAutorisation {
  statut: 'OK' | 'INTERACTION_REQUISE';
  /** Échéance du jeton (ms depuis l'époque), si connue. */
  echeance?: number;
  scopesAccordes: string[];
}

export interface ResultatConnexion {
  email: string;
  nom: string;
}

export interface GoogleAuthNativePlugin {
  signIn(): Promise<ResultatConnexion>;
  authorizeSilently(options: { scopes: string[] }): Promise<ResultatAutorisation>;
  authorizeInteractive(options: { scopes: string[] }): Promise<ResultatAutorisation>;
  /** Réservé aux appels Drive : ne jamais journaliser. */
  getAccessToken(): Promise<{ accessToken: string }>;
  signatureInfo(): Promise<InfoSignature>;
  signOut(): Promise<void>;
  clearAuthorizationState(): Promise<void>;
}

export const GoogleAuthNative = registerPlugin<GoogleAuthNativePlugin>('GoogleAuthNative');

/** Codes d'erreur normalisés par le plugin Kotlin (spécification §5). */
export type CodeErreurNatif = 'INTERACTION_REQUISE' | 'ACCES_REVOQUE' | 'HORS_LIGNE' | 'AUTRE';

export interface ErreurNative {
  code?: string;
  message?: string;
  /** Code natif brut (Android), toujours journalisé. */
  data?: { codeNatif?: string };
}
