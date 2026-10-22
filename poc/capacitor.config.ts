import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: process.env.POC_ANDROID_PACKAGE || 'fr.donejuan.poc',
  appName: 'Diagnostic POC',
  webDir: 'dist',
};

export default config;
