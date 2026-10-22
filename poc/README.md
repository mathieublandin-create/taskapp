# Application de test (PoC) — mesures R1, R2, R11

Outil de mesure **jetable** du test technique (`docs/03-architecture/test-technique-R1-R2.md`),
construit selon `docs/03-architecture/poc-specification.md`. Il n'est pas la base du code de production.

## Nom de paquet Android du PoC

> **`fr.donejuan.poc`**

C'est la valeur à déclarer dans le client OAuth **Android** (avec le SHA-1 de la clé de signature).
Elle est la valeur par défaut de `POC_ANDROID_PACKAGE` (`capacitor.config.ts`, `scripts/prepare-android.sh`, workflow).

## Commandes

```
npm ci
npm run lint        # ESLint + Prettier
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # tsc + vite build + service worker -> dist/
npm run dev         # http://localhost:5173
```

## Configuration

Toutes les valeurs viennent de l'environnement ; `.env.example` ne liste que les noms.
Copier vers `.env.local` (ignoré par Git) pour le travail local. Sur GitHub : « Settings > Secrets and variables > Actions ».
`VITE_GOOGLE_WEB_CLIENT_ID` est obligatoire : sans lui l'application affiche une erreur de configuration au démarrage.

## Écran « Diagnostic » et journal

Boutons par mesure : R11 (Se connecter), R1 (Créer, Lister, Lire, Modifier, Changements), R2 (Jeton silencieux),
R3 (Synchroniser), R15 (stockage persistant), R16-T (signature et version), §3.5 (Appeler Drive, Demander un jeton).
Le journal est stocké localement (IndexedDB sur PC, `localStorage` sur Android), filtrable, exportable en JSON et CSV,
copiable, avec marqueur d'étape. **Il ne contient jamais de valeur de jeton** : masquage des jetons déclarés et des motifs
connus (`journal/journal.ts`), vérifié par `tests/journal-anti-secret.test.ts`.

## Android

- Plugin Kotlin : `android-plugin/src/GoogleAuthNativePlugin.kt` (Credential Manager + AuthorizationClient).
  **Non compilé dans le conteneur** : première compilation attendue dans GitHub Actions.
- `scripts/prepare-android.sh` régénère `android/` (ignoré par Git) après `npm run build`, copie le plugin,
  ajoute Kotlin et la configuration de signature lue dans l'environnement. Puis `cd android && ./gradlew assembleDebug`.
- Sans clé fournie, l'APK debug est signé par la clé automatique d'Android (SHA-1 différent à chaque poste ou exécution) :
  suffisant pour vérifier la compilation, pas pour l'authentification Google. Les clés P9 sont fournies par secrets.

## Limites connues

- La tâche de fond informative (R2, 3.3.6, WorkManager) n'est pas implémentée.
- Aucune clé de signature n'est générée par ce dépôt ; aucun secret n'est configuré.
