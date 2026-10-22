# Revue de l'application de test (PoC)

> Date : 2026-10-22. Auteur : Starck. Périmètre : `poc/`, `.github/workflows/poc.yml`, par rapport à `poc-specification.md`, `test-technique-R1-R2.md`, DAT v0.10.1 et ADR-004/005/012.
> Contrôles faits : relecture complète du code et du workflow ; `npm run lint`, `typecheck` et `test` exécutés (verts, 6 fichiers, 19 tests) ; gabarit Android de Capacitor 8 inspecté (cibles des `sed` de `prepare-android.sh` présentes). Le plugin Kotlin et le build Gradle **n'ont pas pu être compilés ici** (pas de SDK).

## Verdict : **Corrections requises**

Une correction bloquante (RV-POC-1, rapide) et une vérification préalable obligatoire (RV-POC-2, première exécution du workflow). Le reste est non bloquant. Après correction de RV-POC-1, le PoC est prêt pour la séance 1 sous réserve de RV-POC-2.

## Points signalés par Benjamin

| # | Décision |
|---|---|
| 1 | **Accepté.** L'expression `${{ A && s1 \|\| '' }}${{ B && s2 \|\| '' }}` est correcte : un secret vide donne une chaîne vide, jamais la clé de l'autre type. Le test `-z` + `exit 0` et les `if` sur les étapes suivantes sont cohérents. |
| 2 | **Accepté.** Un `base` de `/` est requis par Capacitor (origine `https://localhost`). L'artefact `pwa-dist` garde le `base` d'hébergement. Réserve : si la variable `VITE_BASE_PATH` n'est pas posée, le site GitHub Pages sera construit en `/` et cassé (RV-POC-6). |
| 3 | **Accepté, avec corrections.** Le constat est exact (clé automatique, SHA-1 variable, inutilisable en OAuth). Mais le guide et le workflow supposaient que la séance 1 utilise l'APK « débogage » (étapes 2 à 18), alors que seul l'APK « publication » est publié sur le site. Voir RV-POC-1. Guide corrigé (v2) : avertissement en c, APK confirmés par SHA-1 avant remise, deux adresses distinctes. |
| 4 | **Accepté** pour le PoC. `AuthorizationResult` n'expose pas l'échéance. `tokeninfo` envoie le jeton à Google seul (même confiance), la valeur n'est pas journalisée ; l'échéance est approximative (de l'ordre de la seconde) et vaut `null` en cas d'échec. Ne pas reprendre ce mécanisme en production : DAT à traiter dans le lot (déduire l'échéance de façon prudente). Voir RV-POC-8. |
| 5 | **Hypothèse acceptée, à traiter comme un résultat de mesure.** Le code natif brut est bien journalisé (`ACCES_REVOQUE/4`, etc.). Risque attendu : l'API d'autorisation ne lève probablement pas d'erreur après révocation mais renvoie `hasResolution()` : on observera alors `InteractionRequise`, pas `AccesGoogleRevoque`. Le guide (séance 2, étape 8) a été corrigé pour accepter les deux issues. Ce résultat alimentera PT-12 du DAT. |
| 6 | **Non requise.** Le protocole 3.3.6 est « informative, pour un lot ultérieur » et n'entre pas dans le critère R2 (§4). L'absence est correctement déclarée au README. Guide corrigé (étape 23 de la séance 1 et étape 2 de la séance 2 sans objet). |
| 7 | **Accepté** : les versions sont celles installées, les tests passent. À consigner dans le DAT §3 au moment de l'alignement avec Anthony (le PoC ne fait pas foi pour le `package.json` racine). Kotlin 2.1.20 et AGP 8.13 (celui du gabarit Capacitor 8) sont compatibles, `jvmTarget 21` cohérent avec Java 21 du workflow. `kotlinOptions` est déprécié en Kotlin 2.2 : sans effet ici. |
| 8 | **Accepté avec correction mineure** (RV-POC-4). Le cas `pendingIntent == null` est géré ; manquent la capture de `SendIntentException` et la libération de l'appel enregistré. |

## Couverture du protocole

| Mesure | Couverture | Remarque |
|---|---|---|
| R11 (3.1) | Oui | « Se connecter » (web : `prompt=consent`) ; scopes accordés et `hasGrantedAllScopes` journalisés. |
| R1 (3.2) | Oui | Créer (dossier, `appareils/`, fichier gz, empreinte, `pageToken`), Lister (filtre `appProperties`), Lire (empreinte), Modifier, Changements (avec rotation du `pageToken`). |
| R2 (3.3) | Partielle, conforme | 3.3.2 à 3.3.4 : « Jeton silencieux » (sans lancer l'`PendingIntent`). 3.3.5 : identité en cache affichée en en-tête, mais pas de ligne R2 dédiée au démarrage (RV-POC-7). 3.3.6 : absente (informative). 3.3.7 : voir point 5. |
| R3 (3.4.1-2) | Oui | « Synchroniser » = demande sans `prompt` forcé, avec compteur de gestes ; la nature des fenêtres reste observée à la main (prévu au guide). |
| R12 (3.4.3) | Oui | GIS chargé à la demande, absent du précache (`runtimeCaching: []`), identité en `localStorage`, entrée R12 au démarrage. |
| R15 (3.4.4) | Oui | `persisted()` puis `persist()` journalisés. |
| R16-T (3.3.8) | Oui | `signatureInfo` : `versionCode`, `versionName`, SHA-1 et SHA-256 du certificat. Conservation des données : stockage local conservé par `adb install -r`. |
| 3.5 | Oui | « Appeler Drive » (code HTTP brut, échéance), « Demander un jeton » (code d'erreur GIS, `hasGrantedAllScopes`). |

## Absence de jeton dans le journal

Conforme. Trois barrières : le plugin Kotlin ne renvoie jamais le jeton d'identité ni de code ; `Journal.masquer` retire les jetons déclarés, les motifs `Bearer`, `ya29.`, JWT, `4/…` et les paires clé=valeur ; la valeur du jeton n'est lue que par `ClientDrive`. Le test `journal-anti-secret.test.ts` injecte des sentinelles (y compris dans un corps d'erreur HTTP 401), couvre web et Android, JSON et CSV. Point de vigilance hors code : Capacitor peut écrire les résultats de plugin dans logcat en build debug (RV-POC-5).

## Conformité au DAT

- Ports : `FournisseurJeton` avec les quatre états d'ADR-004 sous forme réduite ; implémentations web et Android interchangeables ; le jeton n'est jamais dans `EtatJeton`. Conforme.
- Accès : `fetch` direct sur Drive v3, scopes minimaux `openid email drive.file`, jeton en mémoire seulement (web et plugin natif), aucun secret client, aucune clé dans le dépôt (`.gitignore` conforme au §11 de la spécification). Conforme.
- Écart toléré : l'état `AUTRE` natif et les codes GIS inconnus sont ramenés à `InteractionRequise`, et `access_denied` à `AccesGoogleRevoque` (RV-POC-3).

## Cohérence du guide avec le PoC

Nom de paquet `fr.donejuan.poc` : cohérent partout (README, `capacitor.config.ts`, script, workflow) ; guide mis à jour. Variables : celles du workflow (`VITE_GOOGLE_WEB_CLIENT_ID`, `POC_ANDROID_PACKAGE`, `VITE_BASE_PATH`, `VITE_APP_ORIGIN`, secrets de signature) correspondent à `.env.example` et au §4 de la spécification. Boutons et libellés du guide : cohérents après les corrections suivantes (guide v2) : « Stockage persistant ? » (R15), « Signature et version » et « Jeton silencieux » avant observation à l'étape 21, « Demander un jeton » (et non « Se connecter ») pour la mesure 3.5.3, sans rechargement de page avant l'étape 4 (le jeton n'est gardé qu'en mémoire).

## Remarques

| N° | Remarque | Propriétaire | Bloquante |
|---|---|---|---|
| RV-POC-1 | Le job `site` ne publie que l'APK `release`. La séance 1 (étapes 2 à 18, 22) exige l'APK `debug` signé par la clé de débogage de l'équipe. Publier aussi `poc-debug-apk` dans `site/android/` (noms `app-debug.apk` et `app-release.apk`, distincts), ou documenter un autre canal d'obtention. | Benjamin | **Oui** |
| RV-POC-2 | Le workflow, le script `prepare-android.sh`, `poc.gradle` et le plugin Kotlin n'ont jamais été exécutés. Avant la séance : une exécution complète de `workflow_dispatch` avec les secrets P9 doit réussir pour les deux types, et l'étape `apksigner` doit afficher les SHA-1 attendus (`<SHA1_DEBUG>` et `<SHA1_PUBLICATION>`). Risques de compilation à surveiller : versions `credentials:1.5.0`, `googleid:1.1.1`, `play-services-auth:21.4.0`, surcharge de `call.reject(...)` avec `null`. Jusque-là, le critère 4 du §10 de la spécification n'est pas démontré. | Benjamin (exécution), Anthony (secrets) | **Oui** (à lever avant la séance, pas avant la livraison) |
| RV-POC-3 | Ne pas fusionner les causes dans l'état du port : un code natif ou GIS inconnu devient `InteractionRequise`, et `access_denied` (refus utilisateur dans la fenêtre) devient `AccesGoogleRevoque`. Sans effet sur les mesures car le code brut est journalisé, mais à corriger ou à commenter pour que les journaux ne soient pas sur-interprétés. | Benjamin | Non |
| RV-POC-4 | `authorizeInteractive` : encadrer `startIntentSenderForResult` par un `try/catch` (`SendIntentException`) qui rejette l'appel, et libérer l'appel (`bridge.releaseCall`) à l'annulation. | Benjamin | Non |
| RV-POC-5 | Réduire le risque de fuite par logcat : dans `capacitor.config.ts`, `loggingBehavior: 'none'`, et vérifier à la première installation qu'aucun jeton n'apparaît dans `adb logcat` après « Lister ». | Benjamin | Non |
| RV-POC-6 | Documenter dans `.env.example` ou le README que `VITE_BASE_PATH` doit valoir `/<nom-du-depot>/` pour GitHub Pages et que `VITE_APP_ORIGIN` ne porte pas de chemin ; Jarvis/Anthony posent ces variables avant l'exécution. | Benjamin / Anthony | Non |
| RV-POC-7 | Journaliser au démarrage Android une ligne `R2 / 3.3.5` (identité en cache, état du réseau) pour que le mode avion soit tracé dans l'export, comme la ligne R12 du PC. | Benjamin | Non |
| RV-POC-8 | Consigner dans le DAT §4.1 que l'échéance du jeton Android n'est pas fournie par l'API (méthode `tokeninfo` propre au PoC) ; le choix de production sera tranché lors de la conception du lot. | Starck | Non |
| RV-POC-9 | Épingler les actions GitHub par empreinte de commit (DAT §6) : à faire au plus tard à la mise en production, tolérable pour un PoC jetable. | Anthony | Non |
