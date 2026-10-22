# Procédure du commanditaire : clés de test, secrets GitHub et premier passage du workflow

> **SUSPENDUE le 2026-10-22 (DEC-034, Q-PWA-5).** Ne créez pas les clés de signature. Seul le volet web du test technique est maintenu. Cette procédure ne reprendra que si la mesure de la PWA sur Chrome Android échoue et qu'on garde l'APK. Les étapes 3 et 4 sont reprises dans le guide v3 du test technique (`guide-test-technique-commanditaire.md`) : **suivez ce guide-là**.

> Rédigée par Jarvis le 2026-10-22 à la suite de DEC-032 (H-1 A, H-2 oui).
> L'équipe ne peut pas faire ces actions depuis sa session, car l'écriture de secrets et le lancement de workflows GitHub lui sont interdits. Cette procédure remplace donc, pour les clés, la « méthode recommandée » du guide du test technique (§c.2) : c'est vous qui créez les clés.
> Ce document ne contient aucun secret et ne doit jamais en contenir.

Durée : environ 30 min. Prérequis : un PC avec Java (JDK 17 ou plus, `https://adoptium.net`, « Temurin »).

## 1. Créer les deux clés de test (sur votre PC, hors du dépôt)
1. Créez un dossier **hors** de toute copie du dépôt, par exemple `Documents\cles-done-juan`.
2. Ouvrez un terminal dans ce dossier. Sous Windows, ouvrez PowerShell, puis tapez `cd $HOME\Documents\cles-done-juan`.
3. Inventez **deux mots de passe** différents, d'au moins 12 caractères, sans espace, et notez-les dans votre gestionnaire de mots de passe.
4. Lancez les deux commandes suivantes, une par clé. À chaque fois, le mot de passe demandé est celui de la clé concernée.
   ```
   keytool -genkeypair -keystore poc-debug.jks -storetype PKCS12 -alias poc-debug -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Done Juan PoC debug, C=FR"
   keytool -genkeypair -keystore poc-release.jks -storetype PKCS12 -alias poc-release -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Done Juan PoC release, C=FR"
   ```
5. Affichez l'empreinte de chaque clé, puis copiez la ligne `SHA1:`.
   ```
   keytool -list -v -keystore poc-debug.jks -alias poc-debug
   keytool -list -v -keystore poc-release.jks -alias poc-release
   ```
   Ces deux empreintes sont `<SHA1_DEBUG>` et `<SHA1_PUBLICATION>` du guide du test technique. Elles ne sont **pas** secrètes.
6. Convertissez chaque fichier de clé en texte, pour pouvoir le coller dans GitHub :
   - Windows (PowerShell) :
     ```
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\poc-debug.jks")) | Set-Clipboard
     ```
     Le texte est copié dans le presse-papiers. Collez-le directement à l'étape 2. Faites de même avec `poc-release.jks`.
   - macOS / Linux : `base64 -i poc-debug.jks | pbcopy` (macOS) ou `base64 -w0 poc-debug.jks` (Linux).

## 2. Enregistrer les 8 secrets dans GitHub
Page du dépôt `mathieublandin-create/taskapp`, puis **Settings > Secrets and variables > Actions**, onglet **Secrets**, puis **New repository secret**. Créez un secret par ligne :

| Nom du secret (exact) | Valeur |
|---|---|
| `POC_KEYSTORE_DEBUG_B64` | Texte issu de `poc-debug.jks` (étape 1.6) |
| `POC_KEYSTORE_DEBUG_PASSWORD` | Mot de passe de la clé « debug » |
| `POC_KEY_DEBUG_ALIAS` | `poc-debug` |
| `POC_KEY_DEBUG_PASSWORD` | Mot de passe de la clé « debug », le même |
| `POC_KEYSTORE_RELEASE_B64` | Texte issu de `poc-release.jks` |
| `POC_KEYSTORE_RELEASE_PASSWORD` | Mot de passe de la clé « release » |
| `POC_KEY_RELEASE_ALIAS` | `poc-release` |
| `POC_KEY_RELEASE_PASSWORD` | Mot de passe de la clé « release », le même |

Avec le format PKCS12, le mot de passe du fichier et celui de la clé sont identiques.

## 3. Rendre le dépôt public et activer GitHub Pages (H-1 A)
L'équipe a vérifié l'historique du dépôt le 2026-10-22 : aucun fichier de clé, aucun `.env` et aucun jeton connu n'y figure.
1. **Settings > General**, tout en bas : **Danger Zone > Change repository visibility > Make public**.
2. **Settings > Pages** : sous « Build and deployment », réglez « Source » sur **GitHub Actions**.
3. **Settings > Secrets and variables > Actions**, onglet **Variables**, puis **New repository variable**. Créez deux variables. Ce ne sont pas des secrets.

   | Nom de la variable | Valeur |
   |---|---|
   | `VITE_BASE_PATH` | `/taskapp/` (avec les deux barres obliques, sinon le site ne se charge pas) |
   | `VITE_APP_ORIGIN` | `https://mathieublandin-create.github.io` (sans chemin ni barre oblique finale) |

   La variable `VITE_GOOGLE_WEB_CLIENT_ID` sera ajoutée après la création du projet Google Cloud. Le premier passage fonctionne sans elle.

Les secrets de l'étape 2 restent secrets quand le dépôt est public.

## 4. Lancer le premier passage du workflow (RV-POC-2)
1. Onglet **Actions**, workflow **poc** (colonne de gauche), puis **Run workflow**.
2. Gardez les valeurs proposées. Cochez « Déployer sur GitHub Pages » si l'étape 3 est faite.
3. Cliquez sur **Run workflow** et attendez la fin, environ 10 min.
4. Ouvrez le passage, puis le job **apk (release)**, puis l'étape « Afficher l'empreinte SHA-1… ». L'empreinte affichée doit être identique à celle de l'étape 1.5. Faites la même vérification pour **apk (debug)**.

## 5. Transmettre à Jarvis
- Les deux empreintes SHA-1, qui ne sont pas secrètes.
- Le résultat du passage : vert ou rouge, avec le nom du job en échec s'il y en a un.

Ne transmettez **jamais** les fichiers `.jks`, les textes en base64 ni les mots de passe.

## 6. Après
Une fois cette procédure faite, reprenez le guide du test technique (`guide-test-technique-commanditaire.md`) à la partie a) : projet Google Cloud.
- Le nom de paquet à saisir est `fr.donejuan.poc`.
- Les empreintes sont celles de l'étape 1.5.
- L'adresse d'hébergement (cas A) est `https://mathieublandin-create.github.io`.
