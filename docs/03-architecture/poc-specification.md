# Spécification de l'application de test (preuve de concept, dossier `poc/`)

> Version 1 du 2026-10-22. Auteur : Starck. Destinataire : Benjamin (revue : Anthony).
> Références : `test-technique-R1-R2.md` (protocole, §3.1 à §3.5, prérequis P8 et P9), DAT v0.10.1 §3 et §4.1, ADR-004, ADR-005, ADR-012, DEC-023, DEC-031.
> Objet : outil de mesure **jetable**. Il ne sert pas de base au code de production, mais il en reprend la stack et les contrats d'authentification, pour que les mesures soient valables.

## 1. Périmètre minimal

Aucune fonction métier, aucune donnée réelle. Un écran « Diagnostic » avec des boutons et un journal.

| Mesure | Plateformes | Boutons / fonctions | Protocole |
|---|---|---|---|
| **R11** consentement | PC, Android | « Se connecter » (scopes `openid email drive.file`) ; affichage des scopes accordés et de `hasGrantedAllScopes` | §3.1 |
| **R1** visibilité croisée | PC, Android | « Créer » (dossier + fichier d'état), « Lister », « Lire », « Modifier », « Changements » (`changes.list` depuis un `pageToken` conservé) | §3.2 |
| **R2** jeton silencieux | Android | « Jeton silencieux » ; affichage de l'échéance ; mode avion avec identité en cache ; révocation traduite en `AccesGoogleRevoque` ; tâche de fond (informative, 30 min pendant 3 h) | §3.3 |
| **R3** renouvellement PC | PC | « Synchroniser » (demande de jeton, comptage des gestes) | §3.4.1-2 |
| **R12** démarrage hors ligne | PC | PWA installable, service worker, démarrage sans le script GIS ; identité en cache | §3.4.3 |
| **R15** | PC | Résultat de `navigator.storage.persist()` | §3.4.4 |
| **R16-T** APK signé | Android | Affichage de `versionCode`, `versionName`, empreinte du certificat de signature ; conservation des données après `adb install -r` | §3.3.8 |
| **§3.5** accès retiré | PC | « Appeler Drive » (code HTTP, code d'erreur GIS, échéance) ; « Demander un jeton » ; affichage de `hasGrantedAllScopes` | §3.5 |

Hors périmètre : Calendar, CRDT, SQLite, notifications, interface métier, iOS.

## 2. Stack

Identique au DAT §3 (même versions que le futur `package.json` racine, à aligner avec Anthony) :

| Élément | Choix |
|---|---|
| Langage | TypeScript `strict` |
| Interface | React + Ionic React (pages minimales) |
| Construction | Vite + `vite-plugin-pwa` (Workbox) |
| Coque mobile | Capacitor (Android) |
| Authentification Web | Google Identity Services, modèle « jeton » (`google.accounts.oauth2.initTokenClient`), chargé dynamiquement (R12) |
| Authentification Android | Plugin Capacitor local en Kotlin (`poc/android-plugin`) : Credential Manager (identité) et `AuthorizationClient` (jeton), voir §5 |
| Appels Drive | `fetch` direct sur l'API REST v3 (pas de bibliothèque Google côté web) |
| Tests | Vitest, avec simulateurs de `fetch` et du plugin ; pas de Playwright pour le PoC |
| Qualité | ESLint, Prettier, `tsc --noEmit`, comme le reste du projet |

Contrat d'authentification : **réutiliser les ports d'ADR-004** (`FournisseurJeton` avec les états `jeton obtenu`, `interaction requise`, `accès révoqué`, `hors ligne`), même sous une forme réduite. Raison : le PoC doit valider le comportement de ce contrat, pas un code ad hoc.

Règles de journalisation : le journal contient pour chaque appel l'heure (UTC et locale), l'appareil, l'opération, le code HTTP, le code d'erreur GIS ou Android, l'échéance du jeton, `hasGrantedAllScopes`. **Il ne contient jamais la valeur d'un jeton**, ni de code d'autorisation, ni de jeton d'identité. Un test Vitest le vérifie (injection d'une valeur sentinelle dans le simulateur, absence de la sentinelle dans le journal exporté).

## 3. Structure du dossier `poc/`

```
poc/
  package.json              # scripts : dev, build, test, lint, typecheck, cap:sync
  tsconfig.json             # strict
  vite.config.ts            # base = VITE_BASE_PATH, vite-plugin-pwa
  capacitor.config.ts       # appId = POC_ANDROID_PACKAGE (lu dans l'environnement)
  .env.example              # noms de variables, valeurs vides (versionné)
  src/
    config.ts               # lecture et validation des variables d'environnement
    auth/
      ports.ts              # FournisseurJeton, états (ADR-004)
      auth-web.ts           # GIS, chargement dynamique du script
      auth-android.ts       # appel du plugin natif
      plugin-natif.ts       # définition TypeScript du plugin
    drive/
      client-drive.ts       # files.list/get/create/update, changes.getStartPageToken/list
      empreinte.ts          # SHA-256 (SubtleCrypto)
      etat-poc.ts           # génération du fichier d'environ 10 Ko, gzip
    journal/
      journal.ts            # entrées horodatées, stockage local, filtre anti-secret
      export.ts             # export JSON et CSV
    ui/
      PageDiagnostic.tsx    # boutons, journal, infos appareil
      main.tsx
    sw/                     # stratégie de service worker (précache complet, GIS non précaché)
  android-plugin/           # sources Kotlin du plugin (GoogleAuthNative)
  tests/                    # Vitest : journal, config, empreinte, états d'auth, filtre anti-secret
  public/                   # icônes génériques, manifeste
android/                    # généré par `npx cap add android` ; ignoré par Git (voir §7)
```

Le dossier `android/` est **régénéré** à chaque construction par un script (`poc/scripts/prepare-android.sh`) qui exécute `cap add android` puis copie le plugin et applique la configuration de signature. Il n'est pas versionné.

## 4. Configuration (variables d'environnement)

Aucune valeur n'est versionnée. `.env.example` liste les noms ; `.env.local` (ignoré par Git) porte les valeurs en local ; GitHub Actions les prend dans « Settings > Secrets and variables > Actions ».

| Variable | Où | Secret ? | Rôle |
|---|---|---|---|
| `VITE_GOOGLE_WEB_CLIENT_ID` | PWA, et plugin Android (identifiant « serveur » de Credential Manager) | Non, mais non versionné | ID client OAuth Web |
| `VITE_BASE_PATH` | PWA | Non | `/` (Cloudflare) ou `/<nom-du-depot>/` (GitHub Pages) |
| `VITE_APP_ORIGIN` | PWA | Non | Origine hébergée, affichée dans le Diagnostic |
| `VITE_POC_APP_PROPERTY` | PWA, Android | Non | Valeur de `appProperties.app`, par défaut `objectifs-taches-poc` |
| `VITE_POC_FOLDER_NAME` | PWA, Android | Non | Par défaut `Done Juan (POC)` |
| `POC_ANDROID_PACKAGE` | Android | Non | Nom de paquet fixé par Anthony |
| `POC_VERSION_CODE`, `POC_VERSION_NAME` | Android | Non | Pour le test d'écrasement (§3.3.8.3) : 1 puis 2 |
| `POC_KEYSTORE_FILE` | Android | Chemin, non secret | Fichier de clé, **hors dépôt** |
| `POC_KEYSTORE_PASSWORD`, `POC_KEY_ALIAS`, `POC_KEY_PASSWORD` | Android | **Oui** | Signature |
| `POC_BUILD_TYPE` | Android | Non | `debug` ou `release` (deux clés distinctes, P9) |

`config.ts` échoue **au démarrage** avec un message explicite si `VITE_GOOGLE_WEB_CLIENT_ID` est vide. Le client Android n'est pas passé au code : Google le retrouve par nom de paquet et empreinte de signature.

## 5. Plugin Android (`GoogleAuthNative`)

| Méthode | Comportement |
|---|---|
| `signIn()` | Credential Manager, `GetSignInWithGoogleOption` (identifiant serveur = ID client Web). Retourne l'adresse e-mail et le nom, jamais le jeton d'identité vers le journal. |
| `authorizeSilently({scopes})` | `Identity.getAuthorizationClient(...).authorize(...)` **sans lancer** l'`PendingIntent`. Si le résultat porte `hasResolution()`, retourne `INTERACTION_REQUISE` sans afficher d'interface. Sinon, retourne l'échéance et garde le jeton en mémoire native. |
| `authorizeInteractive({scopes})` | Lance le `PendingIntent` de consentement. |
| `getAccessToken()` | Renvoie le jeton à la couche web **uniquement pour les appels Drive**, jamais au journal. |
| `signatureInfo()` | `versionCode`, `versionName`, SHA-256 et SHA-1 du certificat de signature de l'APK en cours. |
| `signOut()` / `clearAuthorizationState()` | Remise à zéro. |

Les erreurs sont normalisées : `INTERACTION_REQUISE`, `ACCES_REVOQUE`, `HORS_LIGNE`, `AUTRE` (avec le code natif). Le test R2 dépend de la précision de cette normalisation : le code natif brut est toujours journalisé.

## 6. Journal des résultats

- Affiché à l'écran, plus récent en haut, filtrable par mesure (R1, R2, R3, R11, R12, R16-T, §3.5).
- Chaque entrée : identifiant, horodatage, appareil, mesure, étape du protocole (ex. `3.2.4`), opération, résultat, détail.
- Stocké localement (IndexedDB sur PC, `localStorage` sur Android) : il survit à la fermeture de l'application, ce qui est nécessaire pour la séance du lendemain.
- **Export** : boutons « Exporter JSON », « Exporter CSV » et « Copier ». Le fichier est téléchargé (PC) ou partagé (Android). Pas de réseau.
- Un bouton « Marquer l'étape » permet à l'équipe de saisir le numéro d'étape du protocole et un commentaire libre.
- Bouton « Vider le journal » avec confirmation.

## 7. Construction

### 7.1 PWA
1. `cd poc && npm ci`
2. `npm run lint && npm run typecheck && npm test`
3. `npm run build` avec les variables du §4 : produit `poc/dist/` (site statique + service worker).
4. Déploiement :
   - **Cas A, GitHub Pages** : action `deploy-pages` (§9).
   - **Cas B, Cloudflare Pages** (dépôt privé) : le commanditaire charge le dossier compressé `site` (artefact de la construction) par « Upload assets ». Aucun jeton d'API Cloudflare n'est donné à l'équipe.

### 7.2 APK de test
1. `npm run build` (la PWA sert de contenu à Capacitor).
2. `poc/scripts/prepare-android.sh` : `npx cap add android`, copie du plugin, `npx cap sync android`, injection de `applicationId`, `versionCode`, `versionName` et de la configuration de signature (lue dans l'environnement).
3. `cd android && ./gradlew assembleDebug` ou `assembleRelease`.
4. L'APK signé est sous `android/app/build/outputs/apk/<type>/`.

### 7.3 Clés de signature (P9)
- Deux clés de test **distinctes** : « débogage » et « publication de test ». Chacune a son SHA-1, déclaré dans son client OAuth Android.
- Génération : `keytool` (JDK seul, sans SDK Android), sur un poste de l'équipe ou dans le conteneur Linux. L'équipe transmet **uniquement les SHA-1** au commanditaire.
- Stockage : fichier hors dépôt ; pour GitHub Actions, contenu encodé en base64 dans un **secret** (`POC_KEYSTORE_DEBUG_B64`, `POC_KEYSTORE_RELEASE_B64`) avec leurs mots de passe.
- Ce sont des clés **jetables** : elles ne servent jamais à la production (ADR-012). Elles sont détruites avec le projet `objectifs-taches-dev`.

## 8. Ce qui se construit où

| Tâche | Conteneur Linux sans SDK Android | GitHub Actions | Poste du commanditaire |
|---|---|---|---|
| Installation des dépendances, lint, typage | Oui | Oui | — |
| Tests Vitest (simulateurs) | Oui | Oui | — |
| `vite build` (PWA, service worker) | Oui | Oui | — |
| Servir la PWA en local (`vite preview`, `localhost:5173`) pour R1 côté PC | Oui | — | Oui (avec Node, non recommandé) |
| `npx cap add android` / `cap sync` (génération du projet) | Oui (Node seul) | Oui | — |
| Génération des clés et calcul des SHA-1 (`keytool`) | Oui, si un JDK est présent ; sinon à installer (`apt`) | Oui | Possible (méthode de secours du guide) |
| Écriture du plugin Kotlin | Oui (écriture), **pas de compilation** | — | — |
| **Compilation de l'APK** (`gradlew assemble*`) | **Non** : exige le SDK Android (plateformes, build-tools). Ne pas compter sur son installation dans le conteneur, même si le réseau l'autorisait. | **Oui** (`ubuntu-latest` fournit le SDK) | Oui, avec Android Studio (déconseillé, lourd) |
| Signature de l'APK | Non (pas d'APK) | Oui, avec les secrets | Possible |
| Déploiement de la PWA | — | Oui (cas A) ; artefact à charger à la main (cas B) | Cas B : chargement par « Upload assets » |
| Installation sur le téléphone | Non | Non | **Oui** (câble ADB ou fichier APK) |
| Mesures réelles (consentement, jeton, expirations) | Non | Non | **Oui, avec le commanditaire** |

Conséquence pour l'organisation : Benjamin peut tout écrire et tester dans le conteneur, **sauf** la vérification que le plugin Kotlin compile. Prévoir un premier passage de GitHub Actions dès que le squelette du plugin existe, pour corriger les erreurs de compilation avant le jour J. Le dépôt privé offre un quota de minutes Actions gratuit suffisant pour ce besoin (à vérifier au moment du test).

## 9. Exemple de workflow GitHub Actions

Fichier `.github/workflows/poc.yml`, à adapter par Anthony (noms de paquet, version de Node et de Java alignés sur le projet). Il suppose les **variables** `VITE_GOOGLE_WEB_CLIENT_ID`, `POC_ANDROID_PACKAGE`, `VITE_BASE_PATH`, `VITE_APP_ORIGIN` et les **secrets** de signature du §7.3.

```yaml
name: poc

on:
  workflow_dispatch:
    inputs:
      version_code:
        description: "versionCode de l'APK"
        default: "1"
      version_name:
        description: "versionName de l'APK"
        default: "0.0.1"
      deploy_pages:
        description: "Déployer sur GitHub Pages (dépôt public uniquement)"
        type: boolean
        default: false

permissions:
  contents: read

jobs:
  pwa:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: poc
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: poc/package-lock.json
      - run: npm ci
      - run: npm run lint && npm run typecheck && npm test
      - run: npm run build
        env:
          VITE_GOOGLE_WEB_CLIENT_ID: ${{ vars.VITE_GOOGLE_WEB_CLIENT_ID }}
          VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH }}
          VITE_APP_ORIGIN: ${{ vars.VITE_APP_ORIGIN }}
      - uses: actions/upload-artifact@v4
        with:
          name: pwa-dist
          path: poc/dist
          retention-days: 3

  apk:
    needs: pwa
    runs-on: ubuntu-latest
    strategy:
      matrix:
        type: [debug, release]
    defaults:
      run:
        working-directory: poc
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: poc/package-lock.json
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: pwa-dist
          path: poc/dist
      - name: Restaurer la clé de signature (jamais écrite dans le dépôt)
        env:
          KEYSTORE_B64: ${{ matrix.type == 'release' && secrets.POC_KEYSTORE_RELEASE_B64 || secrets.POC_KEYSTORE_DEBUG_B64 }}
        run: |
          echo "$KEYSTORE_B64" | base64 -d > "$RUNNER_TEMP/poc.jks"
          echo "POC_KEYSTORE_FILE=$RUNNER_TEMP/poc.jks" >> "$GITHUB_ENV"
      - name: Préparer le projet Android
        env:
          POC_ANDROID_PACKAGE: ${{ vars.POC_ANDROID_PACKAGE }}
          POC_VERSION_CODE: ${{ inputs.version_code }}
          POC_VERSION_NAME: ${{ inputs.version_name }}
        run: ./scripts/prepare-android.sh
      - name: Compiler et signer
        working-directory: poc/android
        env:
          POC_KEYSTORE_PASSWORD: ${{ matrix.type == 'release' && secrets.POC_KEYSTORE_RELEASE_PASSWORD || secrets.POC_KEYSTORE_DEBUG_PASSWORD }}
          POC_KEY_ALIAS: ${{ matrix.type == 'release' && secrets.POC_KEY_RELEASE_ALIAS || secrets.POC_KEY_DEBUG_ALIAS }}
          POC_KEY_PASSWORD: ${{ matrix.type == 'release' && secrets.POC_KEY_RELEASE_PASSWORD || secrets.POC_KEY_DEBUG_PASSWORD }}
        run: ./gradlew assemble${{ matrix.type == 'release' && 'Release' || 'Debug' }}
      - name: Afficher l'empreinte SHA-1 du certificat (contrôle, non secret)
        run: keytool -list -v -keystore "$POC_KEYSTORE_FILE" -storepass "${{ matrix.type == 'release' && secrets.POC_KEYSTORE_RELEASE_PASSWORD || secrets.POC_KEYSTORE_DEBUG_PASSWORD }}" | grep "SHA1:"
      - uses: actions/upload-artifact@v4
        with:
          name: poc-${{ matrix.type }}-apk
          path: poc/android/app/build/outputs/apk/${{ matrix.type }}/*.apk
          retention-days: 3

  site:
    needs: [pwa, apk]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: pwa-dist
          path: site
      - uses: actions/download-artifact@v4
        with:
          name: poc-release-apk
          path: site/android
      - uses: actions/upload-artifact@v4
        with:
          name: site
          path: site
          retention-days: 3
      - if: ${{ inputs.deploy_pages }}
        uses: actions/upload-pages-artifact@v3
        with:
          path: site

  deploy-pages:
    if: ${{ inputs.deploy_pages }}
    needs: site
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Points d'attention sur ce workflow :
- La commande d'affichage du SHA-1 passe le mot de passe en argument : GitHub masque les secrets dans les journaux, mais Anthony peut préférer la variable d'environnement `-storepass:env`. Elle ne doit jamais afficher autre chose que `SHA1:`.
- **Dépôt public** : les artefacts d'exécution sont téléchargeables par tout compte GitHub connecté. Les APK de test ne contiennent aucune clé, mais l'APK signé et le site sont publics, ce qui est voulu pour le site. Garder la rétention courte (3 jours).
- Un `workflow_dispatch` ne se déclenche qu'une fois le fichier présent sur la branche par défaut. Prévoir ce point dans le calendrier.
- Pour le test d'écrasement (§3.3.8.3), lancer le workflow deux fois (`version_code` 1 puis 2) et conserver les deux APK.
- Les actions sont référencées par version majeure ; Anthony peut les figer par empreinte de commit (bonne pratique du DAT §6).

## 10. Critères d'acceptation du PoC (pour Anthony et Starck)

1. `npm run lint`, `typecheck` et `test` au vert dans le conteneur.
2. Le journal exporté ne contient aucune valeur de jeton (test Vitest du §2).
3. La PWA démarre hors ligne en environnement de test (service worker actif, GIS non requis), vérifiable en local.
4. Le workflow produit les deux APK (débogage et publication de test), signés, et affiche les SHA-1 attendus.
5. `signatureInfo()` renvoie bien l'empreinte et le `versionCode` de l'APK installé.
6. Toutes les variables du §4 sont documentées dans `.env.example`, sans valeur.
7. Revue de Starck avant la séance 1 (conformité au DAT et à ADR-004).

## 11. Indication pour le `.gitignore` (à intégrer par Anthony)

**Moment : avant toute chose, c'est-à-dire avant le premier commit de `poc/`, et en tout cas avant de générer la moindre clé de signature (P9).** Il n'existe aucun `.gitignore` à ce jour. Une clé ajoutée par erreur dans l'historique reste récupérable même après suppression : le dépôt devant devenir public (DEC-023), cela imposerait de détruire la clé et de réécrire l'historique. Le `.gitignore` est donc le premier commit de la préparation, avant le squelette de `poc/` et avant la création des clés.

Contenu minimal :

```
# Clés de signature et secrets (ADR-012)
*.jks
*.keystore
*.p12
*.pem
keystore.properties
local.properties
.env
.env.*
!.env.example
secrets/

# Dépendances et constructions
node_modules/
dist/
build/
coverage/
poc/android/
android/.gradle/
android/app/build/
*.apk
*.aab

# Éditeurs et système
.idea/
.vscode/
.DS_Store
```

Complément recommandé : un contrôle automatique (Semgrep ou `gitleaks`, DAT §6) dans l'intégration continue, qui échoue si un fichier de clé ou un motif de secret est ajouté. Les clés de test du PoC vivent hors dépôt, dans les secrets GitHub et dans le gestionnaire de mots de passe de l'équipe.

## 12. Reste à faire par l'équipe

| # | Tâche | Qui |
|---|---|---|
| 1 | Poser le `.gitignore` (§11) | Anthony |
| 2 | Fixer le nom de paquet Android | Anthony |
| 3 | Générer les deux clés de test, transmettre les SHA-1 au commanditaire par Jarvis, poser les secrets GitHub | Anthony |
| 4 | Écrire `poc/` (§3 à §6), avec ses tests Vitest | Benjamin |
| 5 | Écrire le plugin Kotlin et le faire compiler via le workflow | Benjamin |
| 6 | Ajouter `.github/workflows/poc.yml` | Anthony |
| 7 | Revue du PoC (§10) | Starck |
| 8 | Tenir le tableau de résultats pendant les séances et en tirer la décision | Starck |
