# ETU-002 — Une PWA unique pour le PC, Android et l'iPhone, sans application Android ?

> **Version 1 du 2026-10-22.** Auteur : Starck, architecte logiciel.
> **Origine** : question du commanditaire relayée par Jarvis le 2026-10-22, verbatim : « demande-lui si il serait pertinent de ne pas faire d'application Android mais une [PWA] pour tout le monde ».
> **Nature** : étude d'aide à la décision. **Aucune décision n'est prise ici.** Le DAT (v0.10.2) et les ADR-001 à ADR-012 ne sont pas modifiés ; aucun ADR n'est créé. Si la PWA unique est retenue, il faudra un arbitrage consigné dans `suivi-projet.md` (il remplacerait DEC-021 et compléterait DEC-001), puis une révision d'ADR-001, ADR-004 et ADR-012 et une nouvelle version du DAT.
> **Références** : ADR-001, ADR-003, ADR-004, ADR-005, ADR-007, ADR-010, ADR-012 ; DAT v0.10.2 (§3.1, §3.2, §4.1.2, §4.1.6, §4.1.6 bis, §4.3, §5, §6.4, §7.5, §10) ; cahier des charges (RG-017, RG-021, RG-035, ENF-01, ENF-04, ENF-07) ; US-018, US-022, US-031 ; `test-technique-R1-R2.md` v2 ; `revue-poc.md` ; `poc/` ; `conventions.md` v0.3 ; `backlog-idees.md` (EPI-001, EPI-002).
> **Fiabilité** : recherches web du 2026-10-22, sources au §12. La mention **(à mesurer)** signale un comportement de Google ou d'Apple qui n'est pas documenté de façon fiable et que seul un essai sur appareil réel peut établir.

---

## 0. Synthèse

| | |
|---|---|
| **Ce qu'on gagne** | Un seul livrable, mis à jour automatiquement. Disparaissent : la coque Capacitor, le module Kotlin d'authentification native, l'adaptateur SQLite, la construction et la signature Android, la clé de signature et sa sauvegarde (R16), la vérification des développeurs Android en 2027 (R17), les installations manuelles d'APK, le décalage de versions entre le PC et le téléphone (RG-058). L'iPhone devient utilisable sans développement spécifique, ce qui sert directement EPI-001. |
| **Ce qu'on perd** | Le **renouvellement silencieux du jeton Google** sur le téléphone : comme sur le PC, au-delà d'une heure, la synchronisation demande un bref passage par Google (automatique à l'ouverture, ou d'un geste). Les **notifications locales de secours** (Q-38 b) et la **synchronisation en arrière-plan** sur Android, prévues pour des lots ultérieurs. L'ancrage de l'horloge sur l'horloge monotone d'Android (§6.4). La reconnaissance vocale Android sur l'appareil, prévue pour EPI-002. |
| **Recommandation** | **Oui, sous condition** : adopter la PWA unique si le volet web du test technique (§7.3) montre que, sur Chrome Android, le jeton se renouvelle **à l'ouverture, sans saisie, en au plus un aller-retour vers Google**. Sinon, garder l'APK pour Android. Dans les deux cas, la conception déjà faite (E9, E10) est conservée. |
| **Test technique, en attendant** | **Ne pas tout suspendre** : exécuter tout de suite le **volet web** (PC et Chrome Android, sans APK ni clé), utile dans les deux options. **Suspendre le volet Android natif** (R1 croisé, R2, R16-T) et différer la création des clés de signature (DEC-032, H-2). |

---

## 1. Question et périmètre

Aujourd'hui (ADR-001, option 2 ; ADR-012) :
- une base de code TypeScript, React et Ionic ;
- une **PWA** pour le PC (Chrome, Edge), hébergée sur GitHub Pages ;
- une **application Capacitor** pour Android, distribuée par APK installé à la main (DEC-021), avec authentification native (Credential Manager et AuthorizationClient), base SQLite, notifications locales et arrière-plan dans des lots ultérieurs.

Option étudiée : la **même PWA** sur le PC, sur Android (Chrome, installée sur l'écran d'accueil) et, de fait, sur iPhone (Safari, ajoutée à l'écran d'accueil). Plus d'APK.

L'option « PWA seule » avait été écartée en v0.1 (ADR-001, option 1 ; DAT §3.1). Les arguments d'alors portaient **surtout sur iOS** : notifications locales, purge du stockage, connexion par fenêtre surgissante. Deux faits ont changé depuis : le smartphone est Android (DEC-001), et les rappels passent par Google Calendar (DEC-022). Il est donc légitime de réexaminer la question.

## 2. Ce qui change, composant par composant

| Composant | Aujourd'hui (PWA + APK) | PWA unique |
|---|---|---|
| Authentification smartphone | Module natif Kotlin (`GoogleAuthNativePlugin`), jeton renouvelé sans interface | Google Identity Services (GIS) ou redirection OAuth, jeton d'une heure, comme sur le PC |
| Base locale smartphone | SQLite (`DepotLocalSqlite`) | IndexedDB (`DepotLocalDexie`), déjà nécessaire pour le PC |
| Horloge monotone | `SystemClock.elapsedRealtime` (extension native) | `performance.now()` et détection des sauts, comme sur le PC |
| Clients OAuth | Un client web, un client Android par clé (production, recette, PoC) | Un client web par environnement |
| Notifications locales de secours (lot « Rappels ») | `@capacitor/local-notifications` | Impossibles sans serveur |
| Synchronisation en arrière-plan (lot ultérieur) | WorkManager | Impossible (pas de jeton sans fenêtre) |
| Distribution | APK signé, mis à jour à la main (ADR-012) | URL de la PWA, mise à jour automatique par le service worker |
| Intégration continue | Construction web et Android, signature, publication de l'APK | Construction web seulement |
| Composition | `web.ts` et `capacitor.ts` | `web.ts` seulement |

## 3. Connexion Google

### 3.1 Constat
- **Durée de l'accès** : un jeton d'accès Google dure **une heure**. Sans serveur, une page web ne reçoit **jamais de jeton d'actualisation** : Google exige un secret client pour échanger un code contre un jeton d'actualisation, même avec PKCE, et ce secret ne peut pas vivre dans une page web (ADR-004, option 2 rejetée ; sources [1], [2]). C'est la raison de l'exception PC de **RG-017** et d'**ENF-04** : « si la session Google du navigateur a expiré, l'intégration n'a lieu qu'après la reconnexion de l'utilisateur, qui la déclenche d'un geste ».
- **Sur Android natif**, Google Play services détient l'autorisation : l'application obtient un nouveau jeton **sans interface**, même après un redémarrage ou le lendemain. C'est exactement ce que mesure R2. C'est **le** véritable avantage de l'APK.
- **Avec GIS (modèle « jeton »)**, la demande de jeton ouvre une **fenêtre surgissante**, qui se referme seule si la session Google du navigateur est active et le consentement acquis (DAT §4.1.6 bis). Les navigateurs bloquent une fenêtre surgissante ouverte sans geste : d'où le bouton « Reprendre la synchronisation ».
- **Autre voie, à mesurer** : une **redirection pleine page** vers Google (flux OAuth « applications web côté client », `response_type=token`, `prompt=none`). Une redirection n'exige pas de geste. À l'ouverture de l'application, si aucun jeton valide n'est en mémoire, l'application peut donc partir chez Google et revenir avec un jeton en une ou deux secondes, **sans saisie** si la session Google est active. C'est aussi la seule méthode fiable sur iPhone, où la fenêtre surgissante est réputée défaillante dans une application de l'écran d'accueil ([3], [4]). Contreparties :
  - la page est rechargée : à ne faire qu'à l'ouverture, jamais pendant une saisie ;
  - le jeton arrive dans le fragment de l'URL : il doit en être effacé immédiatement (`history.replaceState`), avec un paramètre `state` vérifié et une politique `no-referrer` (`conventions.md` §9 l'interdit aujourd'hui « dans une URL » : la règle serait à préciser) ;
  - ce flux « implicite » est déconseillé par les recommandations OAuth récentes ; Google le documente toujours, mais il peut évoluer (risque de veille, R8).

### 3.2 Expérience prévisible sur smartphone en PWA

| Situation | APK (aujourd'hui) | PWA, geste seul (comme le PC) | PWA, redirection à l'ouverture (à mesurer) |
|---|---|---|---|
| Ouverture, jeton de moins d'une heure | Synchronisation immédiate | Idem | Idem |
| Ouverture après plus d'une heure, session Google active | Synchronisation immédiate, sans interface | Données locales affichées ; `SYN-SESSION` ; un appui sur « Reprendre la synchronisation », fenêtre qui se ferme seule | Bref passage par Google (environ 1 à 2 s, écran d'attente), puis synchronisation, sans appui |
| Session ouverte depuis plus d'une heure (rare sur téléphone) | Silencieux | Un appui | Un appui (pas de rechargement pendant l'usage) |
| Session Google expirée dans le navigateur | Silencieux tant que l'autorisation est valide | Saisie du mot de passe Google | Saisie du mot de passe Google |
| Retour du réseau, application ouverte, jeton expiré | Dépôt automatique | Attend un appui | Attend un appui |

Sur Android, Chrome partage la session Google du téléphone : la session est en général active, et le cas « mot de passe » est rare **(à mesurer)**. Un usage de téléphone se fait par courtes sessions : avec la redirection à l'ouverture, la friction se limite à un bref écran d'attente quand l'application n'a pas été ouverte depuis plus d'une heure.

### 3.3 Conséquences sur les règles validées
- **RG-017 et ENF-04** : l'exception « sur PC » deviendrait « sur tous les appareils » (ou serait reformulée : « si l'accès à Google doit être renouvelé, l'intégration a lieu à l'ouverture suivante, ou après un geste »).
- **US-022 CA-5** (« pas à se reconnecter tant que l'accès est valide ») reste tenu au sens de la session logique (identité en cache), comme sur le PC, mais pas au sens « synchronisation sans geste ».
- **US-018 CA-4** (« au retour du réseau, **sans action de l'utilisateur**, ses modifications sont enregistrées ») n'est **plus tenu** si le jeton a expiré entre-temps : il faudrait la même précision que US-031 CA-5 et CA-9.
- Ces règles ont été validées en E6 (DEC-018) : leur modification relève du commanditaire, puis de Pepper (E1) et de Steeve (affichage de `SYN-SESSION` sur le téléphone).

## 4. Stockage local et hors ligne sur smartphone (US-018, RG-021)

### 4.1 Android : onglet Chrome ou PWA installée
- **Même stockage** : l'onglet et la PWA installée partagent l'IndexedDB de l'origine dans le profil Chrome. La différence tient à la **persistance** : Chrome accorde `navigator.storage.persist()` sans demander, selon des critères d'importance du site, dont l'**installation** ; une PWA installée l'obtient en général, un simple onglet souvent non ([5]). Sans persistance, Chrome peut évincer les données en cas de manque d'espace.
- **Recommandation** : n'exiger le hors ligne que pour la **PWA installée** ; afficher l'état de persistance dans « État de la synchronisation » (déjà prévu sur le PC, R15) et un avertissement s'il n'est pas obtenu.
- **Durabilité d'une écriture** : par défaut, Chrome valide les transactions IndexedDB en mode « relâché » (durabilité `relaxed`) : une transaction terminée peut être perdue en cas de coupure brutale du système, pas en cas d'arrêt de l'application. US-018 CA-5 (« même si le smartphone est éteint ») impose donc d'ouvrir les transactions d'écriture en **`durability: 'strict'`**. Coût négligeable au volume de Done Juan. À vérifier par le test (arrêt forcé, redémarrage).
- **Effacement** : « Effacer les données » de Chrome ou du site supprime la base ; la désinstallation de la PWA peut aussi la supprimer **(à mesurer)**. Comme sur le PC, seules les modifications non déposées sont exposées ; tout le reste est dans le Drive.
- **Comparaison avec SQLite** : le DAT jugeait déjà l'IndexedDB de la WebView « acceptable sur Android » (§3.2). Le risque propre à iOS (purge) ne concerne pas Android. L'écart avec SQLite est faible ; il tient surtout à l'éviction, que la persistance neutralise.

### 4.2 iPhone (si EPI-001 est priorisée)
- Une application ajoutée à l'écran d'accueil a **son propre espace**, séparé de Safari ; elle échappe à l'effacement après 7 jours sans visite, qui touche Safari ([6], [7]).
- `navigator.storage.persist()` existe depuis iOS 17 ; WebKit l'accorde selon des heuristiques, dont le fait d'être une application de l'écran d'accueil ([7]).
- Supprimer l'icône supprime les données.
- Conclusion : acceptable pour un contributeur, avec les mêmes parades que sur le PC.

### 4.3 Bilan US-018 et RG-021
RG-021 reste tenue sur Android : consultation et saisie sans réseau, sans durée maximale, modifications conservées. Deux nuances : la persistance doit être obtenue (PWA installée), et le dépôt au retour du réseau peut attendre un geste si le jeton a expiré (§3.3).

## 5. Rappels et notifications
- **Rappels de 8 h et 21 h, créneaux** : portés par Google Calendar (DEC-022, ADR-006, ADR-007). **Aucun changement** : ils se déclenchent même si aucun appareil n'est allumé.
- **Notifications locales de secours** (DAT §5, Q-38 b : si l'accès à l'agenda est perdu, le téléphone affiche lui-même les rappels) : **impossibles** en PWA. Le web ne sait pas programmer une notification locale à l'avance ; Web Push existe, sur Android comme sur iOS depuis 16.4 ([8]), mais il exige un **serveur émetteur**, exclu par DEC-007.
- **Synchronisation en arrière-plan Android** (détection d'un créneau déplacé application fermée, lot ultérieur) : impossible. Même avec les API de synchronisation périodique de Chrome, une PWA n'a pas de jeton Google sans fenêtre. La détection a lieu à l'ouverture, comme sur le PC (DAT §5 le prévoit déjà en repli).
- **Bilan** : la perte touche des fonctions de **secours** de lots futurs, pas le cœur du besoin. Elle devrait être actée dans le cahier des charges (Q-38 b).

## 6. Distribution
- **Disparaît** : l'APK installé directement (DEC-021, ADR-012), la clé de signature et sa sauvegarde (DEC-027, R16), la vérification des développeurs Android en 2027 (DEC-028, R17), la page `android/`, le guide d'installation remis à chaque recette, l'autorisation « applications inconnues » et l'avertissement de Play Protect.
- **Remplacé par** : l'adresse GitHub Pages (DEC-023), puis « Installer l'application » dans Chrome. Android crée une icône et une fenêtre sans barre d'adresse.
- **Mises à jour** : automatiques, par le service worker. Le téléphone et le PC ont la même version. La consultation seule pour cause de schéma plus récent (RG-058) devient exceptionnelle, et l'action « Mettre à jour » est la même partout (DAT §4.2).
- **Recette (E16)** : une seconde adresse, celle de la recette, au lieu d'un APK `.recette` à installer.
- **Dépendance nouvelle** : la politique de Google pour Chrome sur Android, et, pour l'iPhone, celle d'Apple. Apple a renoncé en mars 2024 à retirer les applications web de l'écran d'accueil dans l'UE ([9]) ; le risque d'un revirement subsiste, sans effet sur Android.

## 7. Impact sur LOT-001

### 7.1 Conception (E9) et tests unitaires (E10)
- **US métier (US-001, 023, 002, 024, 003, 025), socle d'écriture, 281 tests unitaires** : indépendants de la plateforme (architecture hexagonale, ADR-010). **Aucun impact.**
- **`conventions.md` v0.3** : sections à alléger si la PWA unique est retenue : pile Capacitor et construction Android (§3.1), arborescence `android/` et composition `capacitor.ts` (§4.2), adaptateur `DepotLocalSqlite` (§10.1, §11.10), secrets de signature, nom de paquet et vérification des développeurs (§9). Rien à reprendre dans le code déjà écrit : la suite de contrat `tests/contrats/depot-local.contrat.ts` s'exécute déjà sur Dexie.
- **US-022, US-017, US-018, US-031** : leur E9 n'a pas commencé (elle attend le test technique). Aucun travail perdu ; il faut en revanche décider avant de la commencer :
  - **US-022** : un seul adaptateur `FournisseurAuth` (web), avec la variante « redirection à l'ouverture » si elle est retenue ; CA-5 et CA-7 précisés (§3.3) ;
  - **US-018** : même mécanique que US-031 ; CA-4 précisé ; scénarios « système » (DAT §3.3) exécutés avec Chrome sur Android (arrêt forcé, redémarrage) au lieu de `adb shell am force-stop` sur l'APK ;
  - **US-031** : inchangée ;
  - **US-017** : inchangée dans sa logique ; une seule version de l'application en circulation simplifie RG-058.
- **UX (Steeve)** : `SYN-SESSION` et « Reprendre la synchronisation » à décliner sur le téléphone ; écran d'attente de la redirection ; invitation « Installer l'application » dans ECR-010. Aucun écran métier touché.

### 7.2 PoC (`poc/`)
- **Réutilisable tel quel** : la partie web (`src/auth/auth-web.ts`, `src/drive/`, écran « Diagnostic », journal anti-secret).
- **Devient inutile** : `android-plugin/` (`GoogleAuthNativePlugin.kt`), `scripts/prepare-android.sh`, `capacitor.config.ts`, les étapes Android du workflow `poc.yml`. Inutile de les supprimer avant la décision.
- **À ajouter pour mesurer la redirection** (§3.1) : un bouton « Jeton par redirection » (`prompt=none`), environ une demi-journée de travail de Benjamin.

### 7.3 Test technique R1, R2, R11 : que faire en attendant la décision ?

| Partie du protocole (`test-technique-R1-R2.md` v2) | Utile si PWA + APK | Utile si PWA unique | Recommandation |
|---|---|---|---|
| R11 (consentement, origine GitHub Pages) | Oui | Oui | **Exécuter maintenant** |
| R3 et §3.5 (GIS sur PC : geste, fenêtre, retrait de l'accès) | Oui | Oui, et central | **Exécuter maintenant**, et **refaire les mêmes étapes avec la PWA installée sur Chrome Android** |
| R12 et R15 (démarrage hors ligne, `storage.persist()`) | Oui (PC) | Oui (PC et Android) | **Exécuter maintenant**, sur le PC et sur Chrome Android |
| R1 (visibilité croisée client Android / client web) | Oui | **Sans objet** (un seul client web) | Suspendre |
| R2 (jeton silencieux natif Android) | Oui | **Sans objet** | Suspendre |
| R16-T (APK signé, mise à jour par écrasement) | Oui | **Sans objet** | Suspendre |
| Nouveau : redirection `prompt=none` à l'ouverture (PC, Chrome Android ; iPhone si EPI-001) | Facultatif | **Décisif** | Ajouter au PoC (§7.2), puis mesurer |
| Nouveau : durabilité IndexedDB après arrêt forcé et redémarrage sous Chrome Android | Non | Oui | Mesurer avec le volet web |

**Recommandation** : le test n'est **ni suspendu en bloc, ni modifié** avant la décision.
- On exécute **dès maintenant le volet web**, utile dans les deux options. Il n'exige ni APK, ni clé de signature, ni client OAuth Android, ni mode développeur sur le téléphone : seulement le projet Google Cloud (P2, P3), le client web (P4 a), GitHub Pages (P5), un PC et le téléphone Android avec Chrome. Durée : une séance d'environ 1 h, plus l'attente d'une heure pour l'expiration du jeton.
- Le **volet Android natif** (P4 b, P6 « débogage », P9, R1, R2, R16-T) est **suspendu** jusqu'à la décision. La création des clés de signature de test (DEC-032, H-2) est **différée** si elle n'est pas déjà faite ; si elle est faite, elle n'est pas perdue.
- Après la décision, je publie la version 3 du protocole et du guide du commanditaire : soit le volet Android est repris tel quel, soit il est retiré et les deux mesures nouvelles sont ajoutées.
- **Condition d'E9 de US-022 et US-017** : aujourd'hui R1, R2 et R11. Avec la PWA unique, elle deviendrait R11 et la mesure de la redirection (ou, à défaut, R3 et §3.5).

## 8. Effets sur les épiques du backlog
- **EPI-001 (partage, contributeur sur iPhone)** : la PWA unique est **favorable**. Le contributeur utilise la même application que tout le monde ; le travail propre à l'iPhone se réduit à la redirection de connexion et à une recette sous Safari. Avec PWA + APK, il faudrait de toute façon rendre la PWA utilisable sur smartphone pour l'iPhone : on maintiendrait alors **trois** cibles (PC, APK Android, PWA iPhone) au lieu d'une.
- **EPI-002 (assistant vocal)** : mon avis du 2026-10-22 s'appuyait sur Android natif. En PWA :
  - la dictée passe par l'API Web Speech de Chrome, qui envoie en général l'audio aux serveurs de Google ; le mode « sur l'appareil » d'Android (`createOnDeviceSpeechRecognizer`) n'est plus accessible. La réponse M2-8 a) « reconnaissance vocale d'Android » serait à confirmer sous cette forme ;
  - la clé d'API est conservée comme sur le PC (IndexedDB, chiffrée par une clé WebCrypto non exportable), sans Keystore ;
  - l'appel à Mistral depuis le navigateur exige que Mistral autorise CORS (à vérifier, déjà noté) ; le HTTP natif de Capacitor ne contourne plus ce point.
  La taille M reste valable si CORS est accepté.

## 9. Coût et risque comparés

| Critère | PWA + APK Android (situation actuelle) | PWA unique |
|---|---|---|
| Développement du socle (lot 1) | Deux adaptateurs de stockage, module natif Kotlin, extension d'horloge monotone, composition double, chaîne Android | Un adaptateur, une composition, pas de code natif. Gain estimé : **15 à 25 % du socle technique** du lot 1, sans effet sur les US métier |
| Coût récurrent à chaque lot | Deux constructions, deux recettes techniques (E14), un APK à installer en recette (E16), mises à jour manuelles | Une construction, une recette par navigateur cible, aucune installation |
| Coût financier | Nul (DEC-021, DEC-028) | Nul |
| Charge du commanditaire | Installation de chaque version, clé de signature à sauvegarder, démarche 2027 | Aucune |
| Expérience de synchronisation sur téléphone | **Meilleure** : silencieuse, y compris (à terme) en arrière-plan | Bref passage par Google, ou un appui, après plus d'une heure (§3.2) |
| Fonctions de secours futures | Notifications locales, arrière-plan | Absentes |
| iPhone (EPI-001) | Troisième cible à maintenir | Couvert par la même application |
| Risques supprimés | — | R1 (croisement des clients), R2, R13 (SQLite), R16, R17 |
| Risques ajoutés ou aggravés | — | R3 étendu au téléphone ; éviction du stockage si la persistance est refusée (R15 étendu) ; flux par redirection soumis à l'évolution des règles OAuth (R8) ; horloge sans ancrage monotone hors session (limite A8 étendue au téléphone, déjà acceptée pour le PC par DEC-030) |
| Réversibilité | — | **Bonne** : le noyau est commun (ADR-010) ; réintroduire une coque Capacitor plus tard, si l'usage le justifie, est un ajout d'adaptateurs, pas une refonte |

## 10. Recommandation

**Je recommande la PWA unique, sous une condition mesurable**, pour quatre raisons :
1. **Proportionnalité** : pour un utilisateur principal et un contributeur, l'APK coûte cher à chaque version (signature, installation, décalage de versions, démarche 2027) pour un seul bénéfice tangible, le renouvellement silencieux du jeton.
2. **Les rappels n'en dépendent pas** : ils passent par Google Calendar (DEC-022). Ce que l'APK apporte en plus (notifications de secours, arrière-plan) relève de lots futurs et de cas dégradés.
3. **EPI-001 impose déjà une PWA de smartphone** pour l'iPhone : autant n'en maintenir qu'une.
4. **La décision est réversible** à faible coût, et rien de ce qui est conçu ou testé n'est perdu.

**Condition** : le volet web du test technique doit montrer que, sur Chrome Android, la PWA installée obtient un jeton **à l'ouverture, sans saisie, par au plus un aller-retour vers Google**, et que `storage.persist()` est accordé. Si ce n'est pas le cas, je recommande de garder l'APK pour Android (situation actuelle), la PWA servant au PC et à l'iPhone.

**Ce que la recommandation implique si elle est retenue** : une décision du commanditaire remplaçant DEC-021 ; la révision d'ADR-001 (option 1 retenue pour tous les appareils, option 2 en évolution), d'ADR-004 (adaptateur unique, redirection), d'ADR-012 (abandonné) ; DAT v0.11 ; la reformulation par Pepper de RG-017, ENF-01, ENF-04, ENF-07, US-018 CA-4 et Q-38 b, à valider par le commanditaire ; l'allègement de `conventions.md` par Anthony.

## 11. Questions fermées pour le commanditaire

- **Q-PWA-1** : Remplacer l'application Android (APK) par la PWA sur tous les appareils ?
  - (a) oui, **si** le volet web du test technique confirme le renouvellement à l'ouverture sans saisie ; sinon, on garde l'APK ;
  - (b) oui, sans condition ;
  - (c) non, on garde PWA + APK.

  *Reco : (a).*
- **Q-PWA-2** : Acceptez-vous que, sur le téléphone comme sur le PC, la synchronisation passe brièvement par Google à l'ouverture, ou attende un appui, quand l'application n'a pas servi depuis plus d'une heure ? (extension au téléphone de l'exception de RG-017, et précision de US-018 CA-4) *Reco : oui.*
- **Q-PWA-3** : Renoncez-vous, pour les lots futurs, aux notifications de secours affichées par le téléphone si l'agenda est inaccessible (Q-38 b) et à la synchronisation en arrière-plan ? Les rappels restent assurés par Google Calendar. *Reco : oui.*
- **Q-PWA-4** : En attendant votre décision, pour le test technique :
  - (a) exécuter dès maintenant le seul volet web (PC et Chrome Android, environ 1 h, sans APK ni clé) et suspendre le volet Android natif ;
  - (b) tout exécuter comme prévu ;
  - (c) tout suspendre jusqu'à la décision.

  *Reco : (a).*
- **Q-PWA-5** : Différer la création des clés de signature Android de test (DEC-032, H-2) jusqu'à votre décision ? *Reco : oui, si elles ne sont pas déjà créées.*

## 12. Sources
Consultées le 2026-10-22.
1. Blog ktaka, « Google OAuth2/OIDC and PKCE: Understanding Client Secret Requirements » (2025) : secret client exigé pour un client Web même avec PKCE. https://ktaka.blog.ccmp.jp/2025/07/oogle-oauth2-and-pkce-understanding.html
2. Google Developer Forums, « Authorization Code Flow without client secret ». https://discuss.google.dev/t/authorization-code-flow-without-client-secret/168113
3. Progressier, « Google oAuth2 is not working in my PWA on iOS. Why? ». https://intercom.help/progressier/en/articles/9519381-google-oauth2-is-not-working-in-my-pwa-on-ios-why
4. SpotLi, PR #231 « redirect instead of popup for Google sign-in in an installed PWA » (fenêtre surgissante sans retour dans une application de l'écran d'accueil iOS). https://github.com/SaharAga/SpotLi/pull/231
5. web.dev, « Persistent storage » (critères d'octroi de Chrome, dont l'installation). https://web.dev/articles/persistent-storage
6. Search Engine Land, « What Safari's 7-day cap on script-writeable storage means for PWA developers » (compteur propre aux applications de l'écran d'accueil). https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519
7. WebKit, « Updates to Storage Policy » (éviction, `persist()`, heuristique « Home Screen Web App »). https://webkit.org/?p=14403
8. WebKit, « Web Push for Web Apps on iOS and iPadOS » (iOS 16.4, écran d'accueil, geste requis). https://webkit.org/?p=13878
9. Engadget, « Apple backtracks on plans to get rid of web apps on iPhones in the EU » (mars 2024). https://www.engadget.com/apple-backtracks-on-plans-to-get-rid-of-web-apps-on-iphones-in-the-eu-195232177.html
10. Google, « Google Account Authorization JavaScript API reference » (GIS : `ux_mode` popup ou redirect pour le modèle « code »). https://developers.google.com/identity/oauth2/web/reference/js-reference
