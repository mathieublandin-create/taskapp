#!/usr/bin/env bash
# Régénère poc/android (non versionné) : projet Capacitor, plugin Kotlin, Gradle, signature.
# Variables lues : POC_ANDROID_PACKAGE (défaut fr.donejuan.poc), POC_VERSION_CODE, POC_VERSION_NAME,
# VITE_GOOGLE_WEB_CLIENT_ID, POC_KEYSTORE_* (lues ensuite par Gradle). Aucune n'est écrite sur disque.
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$racine"

export POC_ANDROID_PACKAGE="${POC_ANDROID_PACKAGE:-fr.donejuan.poc}"
if ! [[ "$POC_ANDROID_PACKAGE" =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]]; then
  echo "POC_ANDROID_PACKAGE invalide : $POC_ANDROID_PACKAGE" >&2
  exit 1
fi
[ -f dist/index.html ] || { echo "dist/ absent : lancer 'npm run build' d'abord." >&2; exit 1; }

rm -rf android
npx cap add android
npx cap sync android

chemin="android/app/src/main/java/${POC_ANDROID_PACKAGE//./\/}"
mkdir -p "$chemin"
sed "s/__PACKAGE__/${POC_ANDROID_PACKAGE}/g" android-plugin/src/GoogleAuthNativePlugin.kt > "$chemin/GoogleAuthNativePlugin.kt"
sed "s/__PACKAGE__/${POC_ANDROID_PACKAGE}/g" android-plugin/MainActivity.java.template > "$chemin/MainActivity.java"

# Kotlin : plugin Gradle au niveau racine, application au module app, puis configuration du PoC.
sed -i "s#classpath 'com.google.gms:google-services:[^']*'#&\n        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.20'#" android/build.gradle
sed -i "1a apply plugin: 'kotlin-android'" android/app/build.gradle
cp android-plugin/poc.gradle android/app/poc.gradle
echo "apply from: 'poc.gradle'" >> android/app/build.gradle
echo "Projet Android prêt (paquet ${POC_ANDROID_PACKAGE}). Compiler : cd android && ./gradlew assembleDebug"
