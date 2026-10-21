# Test technique préalable R1/R2 (avant E9 de LOT-001)

> Version 1 du 2026-10-21. Auteur : Starck.
> Statut : **protocole prêt, non exécuté. Aucun résultat à ce jour.**
> Références : DAT v0.4, §4.1, §4.1.6 et §10 (R1, R2, R3, R11, R12) ; ADR-004 ; ADR-005 ; US-022 (CA-5, CA-8) ; US-017 ; US-031.

## 1. Objet
Lever, avant la conception détaillée de LOT-001 (E9), les risques qui pourraient remettre en cause l'architecture :

| Risque | Question | Si le test échoue |
|---|---|---|
| **R1** | Un fichier créé dans Drive par le client OAuth **Android** est-il visible et lisible par le client OAuth **web** du même projet, et inversement, avec le scope `drive.file` ? | Repli sur `drive.appdata` (dossier caché) : il faut rouvrir l'arbitrage A6, car DEC-009 retient le dossier visible. |
| **R2** | Sur Android, obtient-on un jeton d'accès **sans aucune interface** après son expiration (au-delà d'une heure), après un redémarrage et le lendemain ? | Reconnexion manuelle périodique sur le smartphone : US-022 CA-5 non tenu. Il faut revoir ADR-004, par exemple avec un client « installé » et un jeton de rafraîchissement dans le Keystore Android. |
| **R3** (informatif) | Sur PC, le renouvellement du jeton demande-t-il au plus un geste, sans saisie du mot de passe, tant que la session Google du navigateur est active ? | Comportement F14 confirmé ou aggravé. Évolution possible : Tauri ou fonction d'échange de jeton (A4). |
| **R11** | En production, avec une origine de PWA sans domaine propre (DEC-006), le consentement est-il accepté **sans écran d'avertissement** pour `openid`, `email` et `drive.file` (US-022 CA-8) ? | Domaine personnalisé (environ 10 à 15 € par an, arbitrage du commanditaire), ou acceptation de l'écran. |
| **R12** | La PWA installée démarre-t-elle hors ligne sans le script de Google Identity Services (US-031) ? | Correction de la stratégie de chargement : bloquant pour US-031. |

## 2. Prérequis

| # | Prérequis | Qui | Remarque |
|---|---|---|---|
| P1 | **Compte Google** pour le test | **Commanditaire** | Le compte du commanditaire, ou un compte Gmail de test qu'il crée. Le comportement est identique ; un compte de test évite d'écrire dans son Drive. |
| P2 | **Projet Google Cloud** `objectifs-taches-dev` (DAT §7.4), avec l'API Google Drive activée | **Commanditaire** (propriétaire), ou une personne qu'il désigne comme propriétaire du projet | La création exige d'accepter les conditions de Google Cloud avec son compte. Aucune facturation n'est nécessaire. |
| P3 | **Écran de consentement OAuth** : type « Externe », statut **« En production »**, nom de l'application, adresse d'assistance, **sans logo**, scopes `openid`, `email` et `drive.file`, domaine autorisé de l'hébergement | Commanditaire, guidé pas à pas | Le passage en production se fait d'un clic, sans vérification pour des scopes non sensibles. |
| P4 | **Identifiants OAuth** : <br>(a) client **Web** avec les origines `http://localhost:5173` et l'URL de l'hébergement ;<br>(b) client **Android** avec le nom de paquet `<à fixer par Anthony>.poc` et l'empreinte SHA-1 de la clé de signature de débogage | Commanditaire, avec les informations fournies par l'équipe | Les identifiants clients ne sont pas des secrets : ils peuvent être transmis dans le dépôt. |
| P5 | **Hébergement statique** (DEC-006), avec une URL HTTPS | Commanditaire (création du compte gratuit), ou équipe si un compte projet existe | Nécessaire pour R11 et R12 ; R1 peut se tester sur `localhost`. |
| P6 | **Smartphone Android** physique, Android 10 ou plus, Google Play services à jour, mode développeur et débogage USB activés, ou installation d'un APK de débogage | **Commanditaire** | Un émulateur avec Google Play peut remplacer le téléphone pour R1, mais pas pour R2 (vérifications du Play Store et de l'appareil). Le Play Console (25 USD) n'est **pas** nécessaire pour ce test. |
| P7 | **PC** avec Chrome ou Edge à jour | Commanditaire | — |
| P8 | **Application de test** (preuve de concept) : coque Capacitor et page web reprenant le noyau prévu par ADR-004 | Équipe (Benjamin ou Anthony, à organiser par Jarvis) | Environ une journée de travail. Écran « Diagnostic » avec ses boutons et un journal horodaté. Elle ne journalise **jamais** la valeur d'un jeton, seulement sa présence et sa date d'expiration. |

## 3. Protocole

Chaque étape est consignée dans le tableau de résultats (§5) avec la date, l'heure, l'appareil, le résultat observé et une capture d'écran si une interface s'affiche.

### 3.1 R11 : consentement (PC, URL hébergée)
1. Ouvrir la PWA de test à l'URL hébergée, dans une fenêtre où aucune session de l'application n'existe.
2. Cliquer sur « Se connecter ». Consentir à `openid`, `email` et `drive.file`.
3. **Observer** : un écran du type « Google n'a pas validé cette application » apparaît-il ? Les scopes affichés sont-ils bien les trois demandés ?
4. Refaire l'étape 2 sur Android.

### 3.2 R1 : visibilité croisée (`drive.file`)
1. **Android** : se connecter. Bouton « Créer » : l'application crée le dossier `Done Juan (POC)` (`appProperties.app = objectifs-taches-poc`) et le fichier `appareils/android-poc.etat.json.gz`, d'environ 10 Ko, dont l'empreinte SHA-256 s'affiche à l'écran.
2. **PC** : se connecter avec le même compte. Bouton « Lister » : `files.list` avec `q = appProperties has { key='app' and value='objectifs-taches-poc' }`, puis `files.get?alt=media` sur le fichier Android. L'empreinte s'affiche.
3. **Sens inverse** : le PC crée `appareils/pc-poc.etat.json.gz`, puis Android le liste et le lit.
4. **Détection de changement** : le PC modifie son fichier (`files.update`). Android appelle `changes.list` depuis le `pageToken` obtenu à l'étape 1. Le fichier modifié doit apparaître, et la nouvelle empreinte doit correspondre.
5. **Interface Drive** : sur drive.google.com, le dossier et les deux fichiers sont visibles (DEC-009).
6. **Création simultanée** (informatif) : supprimer le dossier, puis lancer « Créer » au même moment sur les deux appareils. Observer si deux dossiers sont créés ; c'est le cas prévu au DAT §4.2.

### 3.3 R2 : renouvellement silencieux sur Android
1. Après la connexion de l'étape 3.2, noter l'heure d'expiration du jeton.
2. Fermer l'application en la retirant des applications récentes. La rouvrir **après l'expiration** (plus d'une heure). Bouton « Jeton silencieux » : l'AuthorizationClient est appelé avec les mêmes scopes. **Observer** : un jeton est-il obtenu sans aucune interface ?
3. Redémarrer le téléphone, puis refaire l'étape 2.
4. Le lendemain, plus de 24 h après, refaire l'étape 2.
5. **Mode avion** : ouvrir l'application. **Observer** : l'identité en cache est affichée, sans erreur bloquante. Les données sont alors des données factices de la preuve de concept.
6. **(Informatif, pour un lot ultérieur)** Une tâche d'arrière-plan (WorkManager ou Background Runner), application fermée, tente toutes les 30 min d'obtenir un jeton et de lister les fichiers pendant 3 h. Noter les réussites et les échecs.
7. **Révocation** : retirer l'accès sur myaccount.google.com → « Sécurité » → « Applications tierces ». Refaire l'étape 2. **Observer** l'erreur obtenue, qui doit être traduite en `AccesGoogleRevoque`.

### 3.4 R3 et R12 : PC
1. **R3** : PWA installée et session Google du navigateur active. Rouvrir la PWA plus d'une heure après la connexion. Cliquer sur « Synchroniser ». **Observer** : le jeton est-il obtenu par un seul clic, avec au plus une fenêtre qui se ferme seule, sans saisie de mot de passe ?
2. Se déconnecter de Google dans le navigateur, puis refaire l'étape 1. Une interface de connexion est attendue.
3. **R12** : couper le réseau du PC, puis ouvrir la PWA installée. **Observer** : l'application s'ouvre-t-elle et affiche-t-elle l'identité en cache, sans erreur liée au script de Google ?
4. Vérifier, dans l'écran « Diagnostic », le résultat de `navigator.storage.persist()` pour la PWA installée (R15).

## 4. Critères de succès

| Risque | Succès si | Bloquant pour E9 ? |
|---|---|---|
| R1 | Les étapes 3.2.1 à 3.2.5 réussissent **dans les deux sens**, avec des empreintes identiques. | **Oui** |
| R2 | Les étapes 3.3.2, 3.3.3 et 3.3.4 réussissent **sans aucune interface**, et l'étape 3.3.5 sans erreur bloquante. L'étape 3.3.6 est informative. | **Oui** (CA-5 de US-022) |
| R11 | Aucun écran d'avertissement ne s'affiche aux étapes 3.1.3 et 3.1.4. | **Oui** (CA-8 de US-022) ; sinon, arbitrage du commanditaire |
| R3 | Au plus un geste à l'étape 3.4.1, sans mot de passe. | Non : confirme F14 |
| R12 | L'étape 3.4.3 réussit. | Oui pour US-031, avec une correction possible en E12 |

## 5. Résultats
*À remplir lors de l'exécution. Aucun résultat n'est disponible à ce jour.*

| Étape | Date et heure | Appareil | Résultat observé | Conforme ? | Capture |
|---|---|---|---|---|---|
| | | | | | |

## 6. Ce qui est automatisable ici, et ce qui demande le commanditaire
- **Réalisable par l'équipe, sans le commanditaire** :
  - écrire l'application de test (§2, P8) ;
  - compiler la PWA et l'APK de débogage, si le SDK Android est disponible dans l'environnement de l'équipe ;
  - écrire les tests unitaires de la preuve de concept avec des simulateurs ;
  - rédiger le guide pas à pas de création du projet Google Cloud (P2 à P4).
- **Impossible sans le commanditaire** :
  - créer le projet Google Cloud sous son autorité, accepter les conditions de Google, configurer l'écran de consentement et créer les identifiants (P2 à P4) ;
  - fournir un compte Google et donner le consentement : une interaction humaine est exigée par Google ;
  - utiliser un téléphone Android physique (P6) ;
  - créer le compte d'hébergement (P5) ;
  - les attentes de plus d'une heure et de 24 h (R2).
- **Non automatisable de façon fiable** : le parcours de consentement Google et le renouvellement silencieux sur un appareil réel. Ils sont vérifiés manuellement, en suivant ce protocole.
- **Durée estimée** :
  - environ une journée de préparation par l'équipe ;
  - deux séances avec le commanditaire, d'environ 1 h 30 chacune, à J et J+1 ;
  - la création du projet Google Cloud, environ 30 min, guidée.
