import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: process.env.POC_ANDROID_PACKAGE || 'fr.donejuan.poc',
  appName: 'Diagnostic POC',
  webDir: 'dist',
  // Évite que les résultats de plugin (jetons) soient écrits dans logcat.
  loggingBehavior: 'none',
};

export default config;
