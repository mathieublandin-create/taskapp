# Spécification de l'application de test (preuve de concept, dossier `poc/`)

> **Version 2 du 2026-10-22.** Auteur : Starck. Destinataire : Benjamin (revue : Anthony).
> **Version 2 (DEC-034, ADR-013)** : volet Android natif **suspendu** (gardé pour le repli, §1 à §9 inchangés sur ce point) ; ajout du §13 « Redirection et durabilité » (mesures M-RED, M-PERSIST, M-DUR, condition de DEC-034), du §14 « Volet partage R-P1/R-P2 » (optionnel, DEC-035, M1-14) et du §15 « Écarts constatés avec l'implémentation » (commit `b0239ec`). Le §12 est mis à jour.
> Version 1 du 2026-10-22 : création.
> Références : `test-technique-R1-R2.md` v3, `guide-test-technique-commanditaire.md` v3, DAT v0.11 §3, §4.1 (dont §4.1.7), ADR-004, ADR-005, **ADR-013**, ADR-012 (repli), DEC-023, DEC-031, DEC-034, DEC-035.
> Objet : outil de mesure **jetable**. Il ne sert pas de base au code de production, mais il en reprend la stack et les contrats d'authentification, pour que les mesures soient valables.

> **Portée après DEC-034.** Seule la partie web est construite et déployée pour le test (§7.1). Le plugin Kotlin, `capacitor.config.ts`, `scripts/prepare-android.sh`, les jobs `apk` du workflow et la clé de signature (§5, §7.2, §7.3, §9) sont **conservés sans être exécutés** : ils ne servent que si la condition de DEC-034 échoue (annexe A du protocole v3). Ne pas les supprimer avant la décision.

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
| **M-RED** redirection (v2) | PC, Chrome Android (PWA installée) ; iPhone (R-P2) | « Jeton par redirection », « Remettre à zéro le compteur » ; traitement du retour au chargement | §3.6 du protocole v3, §13 ci-dessous |
| **M-PERSIST**, **M-DUR** (v2) | PC, Chrome Android ; iPhone (R-P2) | « Stockage persistant ? », « Poser le marqueur », « Lire le marqueur » | §3.7 du protocole v3, §13 |
| **R-P1/R-P2** partage (v2, optionnel) | PC, iPhone, deux comptes | Sélecteur Google (Picker), lecture d'un dossier choisi, connexion par redirection interactive | §3.8 du protocole v3, §14 |

En v2, les lignes R1 (croisement de clients), R2 et R16-T relèvent du **repli** (annexe A du protocole v3) et ne sont pas exécutées.

Hors périmètre : Calendar, CRDT, SQLite, notifications, interface métier.

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
| *(dérivée, v2)* URI de redirection | PWA | Non | `window.location.origin` + `VITE_BASE_PATH`, soit `https://mathieublandin-create.github.io/taskapp/` en recette du PoC et `http://localhost:5173/` en local. Doit figurer **à l'identique** (barre oblique finale comprise) dans les « URI de redirection autorisés » du client OAuth Web, en plus de l'origine JavaScript |
| `VITE_GOOGLE_API_KEY` (v2, volet partage seulement) | PWA | Non secret, mais **restreinte** (référents HTTP de l'origine, API Google Picker seule) | Clé d'API exigée par le sélecteur Google (§14) |
| `VITE_GOOGLE_PROJECT_NUMBER` (v2, volet partage seulement) | PWA | Non | Numéro du projet Google Cloud (`appId` du sélecteur, §14) |
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

**v2 (DEC-034)** : les tâches 2, 3 et 5 sont **suspendues** (repli). Le workflow `poc` fonctionne sans clé : le job `apk (release)` est sauté et `apk (debug)` est signé par une clé automatique, sans usage pour le test web.

| # | Tâche | Qui | État v2 |
|---|---|---|---|
| 1 | Poser le `.gitignore` (§11) | Anthony | Fait |
| 2 | Fixer le nom de paquet Android | Anthony | Fait (`fr.donejuan.poc`), repli |
| 3 | Générer les deux clés de test, transmettre les SHA-1 au commanditaire par Jarvis, poser les secrets GitHub | Commanditaire (DEC-032) | **Suspendu** (DEC-034, Q-PWA-5) |
| 4 | Écrire `poc/` (§3 à §6), avec ses tests Vitest | Benjamin | Fait |
| 5 | Écrire le plugin Kotlin et le faire compiler via le workflow | Benjamin | Écrit, repli |
| 6 | Ajouter `.github/workflows/poc.yml` | Anthony | Fait |
| 7 | Revue du PoC (§10) | Starck | Revue v2 au §15 |
| 8 | Tenir le tableau de résultats pendant les séances et en tirer la décision | Starck | À faire |
| 9 | Mesures M-RED, M-PERSIST, M-DUR (§13) | Benjamin | Fait (`b0239ec`), corrections du §15 à apporter |
| 10 | Volet partage R-P1/R-P2 (§14) | Benjamin | **Optionnel**, à faire avant l'E3 d'EPI-001, pas avant la séance web |
| 11 | (Suggestion) Entrée `android` (booléen, faux par défaut) dans `poc.yml` pour sauter les jobs `apk` | Anthony | Facultatif : gagne environ 10 min par passage |

## 13. Redirection et durabilité (v2, DEC-034, ADR-013)

### 13.1 Objet
Mesurer la **condition de DEC-034** sur Chrome Android, PWA installée : un jeton est-il obtenu à l'ouverture, **sans saisie**, en **au plus un aller-retour** vers Google, et le stockage persistant est-il accordé ? Mesurer aussi la durabilité d'une écriture IndexedDB après un arrêt forcé et un redémarrage. Les mêmes boutons servent sur le PC (référence) et sur l'iPhone (R-P2).

### 13.2 Bouton « Jeton par redirection » (groupe « Redirection (PWA unique, DEC-034) »)
**Départ** :
1. Tirer un `state` aléatoire d'au moins 122 bits (`crypto.randomUUID()` admis ; en production, `crypto.getRandomValues`, 128 bits).
2. Enregistrer dans `localStorage` le **contexte** `{ state, debutMs, numero }` (aucun jeton), et incrémenter le **compteur cumulatif** de redirections (`localStorage`, remis à zéro seulement par le bouton « Remettre à zéro le compteur »).
3. Journaliser « Départ vers Google » (mesure `Redirection`) : numéro, `prompt=none`, présence d'un `login_hint`, **mode d'affichage** (§13.5).
4. Naviguer (`location.assign`) vers `https://accounts.google.com/o/oauth2/v2/auth` avec : `client_id` ; `redirect_uri` = origine + `VITE_BASE_PATH` (exactement la valeur déclarée) ; `response_type=token` ; `scope=openid email https://www.googleapis.com/auth/drive.file` ; `prompt=none` ; `state` ; `include_granted_scopes=true` ; `login_hint` = adresse de l'identité en cache, si elle existe.

**Retour** (au chargement de la page, **avant tout appel réseau** de l'application) :
1. Lire le fragment ; s'il ne contient ni `access_token` ni `error`, ne rien faire.
2. **Effacer le fragment immédiatement** (`history.replaceState`, chemin et requête conservés), puis déclarer le jeton au filtre anti-secret du journal.
3. Consommer le contexte (lu puis effacé : un retour ne se traite qu'une fois). Rejeter le retour si le contexte est absent ou si `state` diffère : résultat « Retour rejeté », `codeErreur = etat_invalide`, jeton ignoré.
4. En cas d'erreur Google : journaliser le **code brut** et sa catégorie : `interaction_requise` (`interaction_required`, `login_required`, `consent_required`, `account_selection_required`, `access_denied`), `acces_revoque` (`invalid_grant`), `configuration` (`invalid_request`, `invalid_client`, `invalid_scope`, `redirect_uri_mismatch`, `unauthorized_client`, `unsupported_response_type`, `origin_mismatch`), `inconnue` (autres).
5. En cas de succès : adopter le jeton (mémoire seulement) pour les boutons Drive ; journaliser « JetonObtenu », l'échéance, la durée de vie annoncée, les scopes accordés, le numéro de redirection.
6. **Durée de l'aller-retour** : de l'instant du clic (`debutMs`) au traitement du retour, rechargement compris, en millisecondes (horloge murale : un écart dû à un changement d'heure pendant la mesure est négligeable).

**Ce que la mesure établit** :
- « sans saisie » : un retour `JetonObtenu` **sans** qu'aucun écran Google ne demande de taper quoi que ce soit (constat visuel du commanditaire, consigné dans le tableau) ;
- « au plus un aller-retour » : le compteur n'augmente que d'un entre le départ et le `JetonObtenu`, et le journal ne montre qu'un départ ;
- la durée, pour l'écran d'attente de la production (cible indicative : moins de 3 s).

Une navigation de premier niveau n'exige pas de geste de l'utilisateur : le bouton ne fait que déclencher la mesure. Le résultat vaut donc pour une redirection automatique à l'ouverture (ADR-013).

### 13.3 Option « Redirection automatique à l'ouverture » (souhaitable, non bloquante)
Une case à cocher, mémorisée dans `localStorage`, qui lance le départ du §13.2 **au chargement**, si et seulement si : la page ne revient pas elle-même de Google (aucun contexte en attente ni fragment), une identité est en cache, et le réseau est disponible. Une seule tentative par chargement. Elle reproduit à l'identique le comportement de production. Si elle n'est pas réalisée, le guide utilise le bouton juste après l'ouverture, ce qui suffit à la mesure (§13.2, dernier alinéa).

### 13.4 Persistance et marqueur IndexedDB
- **« Stockage persistant ? »** (M-PERSIST) : journaliser `navigator.storage.persisted()` **avant** l'appel, puis le résultat de `navigator.storage.persist()` (s'il n'était pas déjà persistant), avec le mode d'affichage.
- **« Poser le marqueur »** (M-DUR) : écrire `{ poseLe, identifiant }` dans une base IndexedDB dédiée (`poc-marqueur`), par une transaction ouverte en **durabilité stricte** (`db.transaction('marqueur', 'readwrite', { durability: 'strict' })`), et ne journaliser « OK » qu'à l'événement **`complete` de la transaction** (pas au `success` de la requête). C'est le mode d'écriture retenu pour la production (ADR-013) : la mesure doit porter sur lui.
- **« Lire le marqueur »** : relecture à la demande ; journaliser « Marqueur présent » (date de pose, âge, identifiant) ou « Marqueur absent ».
- Protocole : poser, noter l'identifiant, provoquer l'arrêt (arrêt forcé de Chrome dans les réglages Android, ou redémarrage du téléphone), rouvrir, lire. Succès : même identifiant.

### 13.5 Contexte d'exécution à journaliser
Chaque entrée des mesures `Redirection` et `R15` (persistance, marqueur) porte, dans `detail` ou dans un champ dédié :
- le **mode d'affichage** : `standalone` si `matchMedia('(display-mode: standalone)').matches`, sinon `navigateur` ; il prouve que la mesure a eu lieu dans la PWA installée, ce qu'exige DEC-034 ;
- la **plateforme web** déduite de l'agent utilisateur : `web-android`, `web-ios` ou `web-pc` (sur le web, `typeAppareil()` renvoie aujourd'hui `pc` pour tous les appareils) ;
- `navigator.onLine`.

### 13.6 Tests Vitest attendus
Analyse du fragment (jeton, erreur, vide) ; classement des codes ; construction de l'URL (paramètres exacts, `login_hint` facultatif) ; contexte à usage unique ; rejet d'un `state` différent ou absent ; fragment effacé avant la journalisation ; **absence du jeton dans le journal exporté** (sentinelle) ; compteur cumulatif et remise à zéro ; marqueur posé puis relu (`fake-indexeddb`), avec l'option de durabilité passée à la transaction.

## 14. Volet partage R-P1/R-P2 (v2, optionnel, DEC-035, M1-14)

À réaliser **avant l'E3 d'EPI-001**, pas avant la séance web : il n'entre pas dans la condition de DEC-034. Environ une demi-journée.

### 14.1 Objet
- **R-P1** : avec le scope `drive.file`, l'application d'un compte B (contributeur) voit-elle un dossier et des fichiers créés par l'application sous un compte A (administrateur) et **partagés** avec B dans Drive ? Sinon, la sélection du dossier dans le sélecteur Google (Picker) ouvre-t-elle l'accès à ses fichiers, existants **et futurs** ?
- **R-P2** : sur l'iPhone de B, la PWA ajoutée à l'écran d'accueil depuis Safari se connecte-t-elle par redirection, obtient-elle un jeton par `prompt=none` à l'ouverture après une heure, après 24 h, après un redémarrage, et conserve-t-elle ses données (persistance, marqueur) ?

### 14.2 Boutons supplémentaires (groupe « Partage (EPI-001) »)
| Bouton | Comportement | Journal |
|---|---|---|
| « Connexion par redirection » | Comme le §13.2, mais **sans** `prompt=none` (`prompt=consent select_account`) : première connexion dans la PWA de l'iPhone, où la fenêtre GIS est réputée défaillante | Mesure `R-P2` ; mêmes champs qu'au §13.2 |
| « Choisir dans le sélecteur Google » | Charge à la demande `https://apis.google.com/js/api.js` puis `picker` ; vue `DocsView` avec dossiers (`setIncludeFolders(true)`, `setSelectFolderEnabled(true)`, `setOwnedByMe(false)`), `setOAuthToken(jeton)`, `setDeveloperKey(VITE_GOOGLE_API_KEY)`, `setAppId(VITE_GOOGLE_PROJECT_NUMBER)` ; mémorise l'identifiant et le type de l'élément choisi | `R-P1` : identifiant, type MIME, propriétaire (adresse masquée sauf le domaine) |
| « Lister le dossier choisi » | `files.list` avec `q = '<id>' in parents and trashed = false`, `fields = files(id,name,owners(emailAddress),capabilities(canEdit))` | Nombre de fichiers, noms, `canEdit` |
| « Lire par identifiant » | Champ de saisie d'un identifiant de fichier, puis `files.get?alt=media` | Code HTTP (`404` attendu sans sélection), empreinte SHA-256 |
| « Tenter une écriture » | `files.update` sur le fichier lu | Code HTTP (`403` attendu : partage en lecture) |
| « Créer mon fichier » | Crée `contributeur-poc.etat.json.gz` dans un dossier `Done Juan (POC partage)` du compte connecté | Identifiant, empreinte |

Le jeton passé au sélecteur n'est jamais journalisé. La clé d'API n'est pas un secret, mais elle est restreinte dans la console (référents HTTP `https://mathieublandin-create.github.io/*` et `http://localhost:5173/*`, API Google Picker seule) et n'est pas versionnée.

### 14.3 Prérequis propres
API **Google Picker** activée dans le projet `objectifs-taches-dev` ; clé d'API restreinte ; second compte Google (B) ; iPhone sous iOS 17 ou plus ; accès d'un second compte à l'écran de consentement (application « En production » : aucun compte de test à déclarer).

## 15. Écarts constatés avec l'implémentation (revue de `b0239ec`, 2026-10-22 ; seconde revue de `e1d2b21` et `62a010b`, 2026-10-22)

**Bilan de la seconde revue** : EC-1, EC-2 et EC-5 sont **clos** ; 58 tests sur 58 au vert. Reste EC-8, mineur, contourné par le guide. EC-3 et EC-4 restent des exigences de production, et EC-6 est à traiter avec le volet partage. **Le PoC est prêt pour la séance web.**

| # | Écart | Spécification | Implémentation | Gravité | Action |
|---|---|---|---|---|---|
| EC-1 | Durabilité du marqueur | Transaction en `durability: 'strict'`, « OK » à l'événement `complete` (§13.4) | Transaction par défaut (durabilité relâchée sous Chrome) ; promesse résolue au `success` de la requête `put` | Bloquant pour M-DUR | **Clos** (`e1d2b21`) : transaction `readwrite` avec `{ durability: 'strict' }`, promesse résolue à `oncomplete`, rejet sur `onerror` et `onabort` |
| EC-2 | Mode d'affichage et plateforme non journalisés | §13.5 | Le journal ne porte que `pc \| <agent utilisateur>` ; sur Chrome Android, `typeAppareil()` vaut `pc` | Bloquant pour la condition | **Clos** (`e1d2b21`) : « mode d'affichage ; plateforme ; en ligne » ajoutés aux entrées `Redirection` et `R15`, à l'en-tête de l'écran et à l'en-tête des exports (JSON `{ contexte, entrees }`, CSV `# contexte : …`). `typeAppareil()` reste inchangé pour ne pas renommer les fichiers Drive : **accepté**, la plateforme fait foi |
| EC-3 | Ordre d'effacement du fragment | Avant tout appel réseau de l'application | Effacé dans `traiterRetourRedirection()`, appelé juste après `racine.render(...)` | Mineur pour le PoC (aucun appel réseau au rendu, GIS chargé à la demande) ; **exigence de production** (ADR-013) | Aucune pour le PoC. Anthony : en production, consommer le fragment avant le rendu |
| EC-4 | Validité du `state` | 10 min en production (ADR-013) | Pas de limite | Mineur pour le PoC | Aucune pour le PoC ; exigence de production |
| EC-5 | Redirection automatique à l'ouverture | Souhaitable (§13.3) | Case mémorisée dans `localStorage` ; une tentative par chargement ; départ seulement si la page ne revient pas de Google, si aucun départ n'attend son retour, si une identité est en cache et si le réseau est présent ; sinon, entrée « Non lancé » avec la raison | Recommandé (Q-DEC034-1) | **Clos** (`62a010b`), conforme au §13.3 |
| EC-8 | Départ resté sans retour | Un contexte de redirection expire après 10 min (ADR-013) | Le contexte n'expire pas. Si un retour n'arrive jamais (application fermée chez Google, ou retour ouvert dans un onglet de Chrome, cas que R19 cherche justement à observer), la redirection automatique reste bloquée (« Non lancé : un départ est déjà en attente de retour ») jusqu'au prochain appui sur « Jeton par redirection », qui réécrit le contexte | Mineur, non bloquant : le guide v3 donne le contournement (appuyer sur le bouton et noter la raison) | Facultatif pour Benjamin : faire expirer le contexte après 10 min dans `contexteEnAttente` |
| EC-6 | Connexion par redirection interactive | Nécessaire pour R-P2 (§14.2) | Absente | Non bloquant pour la séance web ; **bloquant pour R-P2** | À faire avec le volet partage (§14) |
| EC-7 | `access_denied` classé `interaction_requise` | Conforme pour `prompt=none` (§13.2) | Idem | Aucun | En production, après un geste, `access_denied` donne « accès perdu » (DAT §4.1.6 bis, ADR-013) |

Conformes : URI de redirection (origine + `VITE_BASE_PATH`), paramètres de l'URL (`response_type=token`, `prompt=none`, `include_granted_scopes`, `login_hint` facultatif), `state` par `crypto.randomUUID()`, contexte à usage unique dans `localStorage`, rejet `etat_invalide`, compteur cumulatif et remise à zéro, durée clic-retour rechargement compris, jeton en mémoire seulement et déclaré au filtre anti-secret, classement des erreurs, `persisted()` journalisé avant `persist()`, relecture du marqueur à la demande.
