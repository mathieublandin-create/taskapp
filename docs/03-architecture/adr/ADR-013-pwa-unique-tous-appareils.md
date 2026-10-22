# ADR-013 — PWA unique sur tous les appareils, connexion par redirection à l'ouverture (sous condition de mesure)

| Statut | Date | Auteur | Références |
|---|---|---|---|
| **Proposé**, sous condition de mesure (DEC-034) | 2026-10-22 | Starck | **DEC-034** (Q-PWA-1 à 5), DEC-001, DEC-006, DEC-007, DEC-021, DEC-022, DEC-023, DEC-035 (M1-10, M1-14) ; ETU-002 (`etude-pwa-unique.md`) ; ADR-001, ADR-004, ADR-010, ADR-012 ; DAT v0.11 §3, §4.1.2, §4.1.7, §7.5 ; `test-technique-R1-R2.md` v3 |

**Remplace ADR-012 sous condition** : si la condition ci-dessous est remplie, ADR-012 est abandonné ; si elle échoue, ADR-012 s'applique de nouveau pour Android et le présent ADR ne vaut que pour le PC (et l'iPhone d'EPI-001).

## Contexte
ADR-001 (option 2) prévoyait une PWA pour le PC et une application Capacitor pour Android, distribuée par APK installé à la main (DEC-021, ADR-012). Le commanditaire a demandé s'il serait pertinent de ne faire qu'une PWA. L'étude ETU-002 a conclu : oui, sous condition. Le commanditaire a retenu cette recommandation (DEC-034) :
- **Q-PWA-1 (a)** : la PWA remplace l'APK sur tous les appareils, **à condition que**, sur Chrome Android, la PWA installée obtienne un jeton Google **à l'ouverture, sans saisie, en un aller-retour de redirection au plus**, et que le **stockage persistant** soit accordé. Sinon, on garde l'APK pour Android ;
- **Q-PWA-2** : un bref passage par Google, ou un appui, après plus d'une heure, est accepté aussi sur le téléphone ;
- **Q-PWA-3** : renonciation aux notifications de secours (Q-38 b) et à la synchronisation en arrière-plan ;
- **Q-PWA-4** : test technique réduit au volet web ;
- **Q-PWA-5** : création des clés de signature différée, procédure des clés suspendue.

Faits techniques structurants (ETU-002 §3, §4) :
- sans serveur, une page web ne reçoit jamais de jeton de rafraîchissement ; le jeton d'accès dure une heure ;
- une demande de jeton par fenêtre surgissante (Google Identity Services) exige un geste ; elle est réputée défaillante dans une application de l'écran d'accueil d'iOS ;
- une **redirection pleine page** vers Google (`response_type=token`, `prompt=none`) n'exige pas de geste : elle peut avoir lieu à l'ouverture et revient sans interface si la session Google est active et le consentement acquis ;
- sur Android, Chrome accorde en général `navigator.storage.persist()` à une PWA installée ; par défaut, une transaction IndexedDB est validée en durabilité « relâchée ».

## Options étudiées
1. **PWA (PC) et APK Capacitor (Android)** : situation d'ADR-001 et ADR-012. Renouvellement silencieux du jeton et arrière-plan sur Android ; en contrepartie, deux adaptateurs de stockage, un module natif Kotlin, une chaîne de signature, une clé à sauvegarder (R16), la vérification des développeurs de 2027 (R17), des mises à jour manuelles et trois cibles si l'iPhone d'EPI-001 arrive.
2. **PWA unique, connexion au geste seulement** (comme le PC aujourd'hui) : simple, mais un appui est nécessaire à chaque ouverture après plus d'une heure, sur un appareil utilisé par courtes sessions.
3. **PWA unique, redirection silencieuse à l'ouverture, geste en cours de session** : aucun appui à l'ouverture si la session Google est active ; un appui seulement si le jeton expire pendant l'usage. **Retenue, sous condition de mesure.**
4. **PWA unique, jeton persistant chiffré** (IndexedDB, clé WebCrypto non extractible) pour éviter une redirection à chaque ouverture dans l'heure : moins d'allers-retours, mais un jeton au repos sur l'appareil, contraire au principe d'ADR-004. Écartée en v1 ; réexaminable si la mesure montre que les redirections gênent.
5. **Flux avec code d'autorisation et PKCE dans la page** : Google exige le secret client pour un client Web, même avec PKCE ; impossible sans serveur (ADR-002).

## Décision
**Option 3, sous la condition de DEC-034.**

### Plateforme et distribution
- **Un seul livrable** : la PWA (TypeScript, React, Ionic, Vite, `vite-plugin-pwa`), hébergée sur GitHub Pages (DEC-023, `https://mathieublandin-create.github.io/taskapp/`).
- **Cibles** : Chrome et Edge sur PC ; **Chrome sur Android, PWA installée** (« Installer l'application ») ; Safari sur iPhone, application ajoutée à l'écran d'accueil, pour le contributeur d'EPI-001 (pas de cible iPhone en v1, DEC-001).
- **Plus de coque Capacitor, de module natif, de base SQLite, de clé de signature ni d'APK.** Une seule composition (`composition/web.ts`).
- **Mises à jour** : automatiques par le service worker, sur tous les appareils. « Mettre à jour » (RG-058) suit le parcours du PC (DAT §4.2).
- **Recette (E16)** : une adresse de recette, au lieu d'un APK `.recette`.

### Connexion Google (précise ADR-004)
- **Adaptateur `FournisseurAuth` web unique**, deux stratégies :
  1. **À l'ouverture** (lancement ou rechargement, DEC-026), si aucun jeton valide n'est en mémoire, que le réseau est disponible, qu'une identité est en cache et qu'aucune saisie n'est en cours : **redirection pleine page** vers `https://accounts.google.com/o/oauth2/v2/auth` avec `response_type=token`, `prompt=none`, `login_hint=<adresse en cache>`, `include_granted_scopes=true`, `state` aléatoire. **Une seule tentative automatique par ouverture** : un retour en erreur (`interaction_required`, `login_required`, `consent_required`…) ne relance pas de redirection ; l'application affiche alors `SYN-SESSION`.
  2. **En cours de session, sur geste** (« Reprendre la synchronisation », « Se reconnecter ») : fenêtre Google Identity Services là où la mesure la montre fiable (PC, Chrome Android), sinon redirection interactive (sans `prompt=none`), notamment sur iPhone. Le choix par plateforme est fixé en E9 d'US-022 à partir des résultats du test.
- **Première connexion** : redirection interactive, ou fenêtre GIS sur PC ; consentement à `openid`, `email`, `drive.file`.
- **Le jeton reste en mémoire uniquement** (ADR-004 inchangé sur ce point) : il arrive dans le fragment de l'URL de retour, est lu par le premier script de la page, puis le fragment est **effacé immédiatement** (`history.replaceState`) avant toute autre requête. Conséquence assumée : une ouverture à froid sans jeton en mémoire passe par Google (1 à 2 s, écran d'attente), même moins d'une heure après la précédente.
- **Sécurité de la redirection** :
  - `state` de 128 bits issu de `crypto.getRandomValues`, à usage unique, validité de 10 min, conservé localement sans jeton ; un retour dont le `state` est absent, inconnu ou expiré est **rejeté** et journalisé, le jeton éventuel est ignoré ;
  - URI de retour déclarée exactement dans le client OAuth Web (« URI de redirection autorisés ») : l'adresse de l'application (`…/taskapp/`) et `http://localhost:5173/` en développement ;
  - `Referrer-Policy: no-referrer` (balise `meta`, GitHub Pages ne permettant pas d'en-tête), aucune ressource tierce, CSP stricte (DAT §7.1) ;
  - scopes accordés vérifiés au retour (`scope`), comme `hasGrantedAllScopes` ;
  - le jeton et le fragment ne sont jamais journalisés ; seul le code d'erreur Google l'est.
  La règle « aucun jeton dans une URL » de `conventions.md` §9 reçoit une seule exception, le fragment de retour de Google, consommé et effacé par le premier script (à reporter par Anthony).
- **États affichés** : ceux du DAT §4.1.6 bis, étendus à tous les appareils. Un retour `prompt=none` en erreur d'interaction donne `SYN-SESSION` (sans bandeau) ; `access_denied` après un geste ou des scopes partiels donnent « accès perdu » ; `invalid_request`, `redirect_uri_mismatch` ou `origin_mismatch` sont des erreurs de configuration, journalisées, affichées comme `SYN-SESSION` et remontées comme anomalie.

### Stockage local (précise ADR-010)
- **IndexedDB (Dexie) sur tous les appareils.** L'adaptateur `DepotLocalSqlite` n'est pas réalisé.
- **Écritures en durabilité stricte** : les transactions d'écriture des cas d'usage sont ouvertes avec `durability: 'strict'` (option `chromeTransactionDurability: 'strict'` de Dexie), et une écriture n'est confirmée qu'à l'événement `complete` de la transaction (US-018 CA-5).
- **Persistance** : `navigator.storage.persist()` au premier lancement ; état affiché dans « État de la synchronisation » ; avertissement s'il est refusé (R15). Le hors ligne du smartphone n'est garanti que pour la **PWA installée**.

### Horloge
- Ancrage monotone par `performance.now()` et détection des sauts d'horloge, comme sur le PC (DAT §6.4). L'extension native `SystemClock.elapsedRealtime` disparaît. La limite résiduelle d'A8 (DEC-030) s'étend au téléphone, déjà acceptée pour le PC.

### Ce qui disparaît (Q-PWA-3)
- Notifications locales de secours (Q-38 b) et synchronisation en arrière-plan : non réalisées. Les rappels restent portés par Google Calendar (DEC-022). La détection des créneaux déplacés a lieu à l'ouverture et au premier plan.

### Condition et repli
- **Condition (DEC-034)**, mesurée par le volet web du test technique v3 (mesures M-RED et M-PERSIST sur Chrome Android) :
  - la PWA installée, ouverte plus d'une heure après la dernière connexion, session Google du téléphone active, obtient un jeton **sans saisie et sans appui**, en **au plus un aller-retour** vers Google ;
  - `navigator.storage.persist()` renvoie `true` pour la PWA installée.
  Mesure complémentaire, non conditionnelle mais à analyser : un marqueur IndexedDB écrit en durabilité stricte survit à un arrêt forcé et à un redémarrage du téléphone (M-DUR).
- **Si la condition est remplie** : le présent ADR s'applique à tous les appareils ; ADR-012 est abandonné ; ADR-001 voit son option 1 retenue pour tous les appareils.
- **Si elle échoue** : on garde l'APK pour Android. ADR-012, les volets Android du DAT marqués « repli » et le protocole Android natif (annexe A du test technique v3) sont réactivés ; la procédure des clés reprend. Le présent ADR vaut alors pour le PC et l'iPhone (redirection à l'ouverture, IndexedDB strict).
- **Ce qui est commun aux deux branches** et peut être conçu dès maintenant : noyau, cas d'usage, modèles de vue, `DepotLocalDexie`, adaptateur `FournisseurAuth` web avec redirection.

## Conséquences
- \+ Un seul livrable, mis à jour automatiquement ; plus de décalage de versions entre le PC et le téléphone (RG-058 plus rare).
- \+ Disparaissent : module Kotlin, `DepotLocalSqlite`, composition Capacitor, construction et signature Android, clés et leur sauvegarde (R16), vérification des développeurs en 2027 (R17), installations manuelles, croisement de clients OAuth (R1), jeton silencieux natif (R2), SQLite (R13). Gain estimé : 15 à 25 % du socle technique du lot 1.
- \+ L'iPhone du contributeur (EPI-001) est couvert par la même application.
- \+ Réversible : réintroduire une coque Capacitor revient à ajouter des adaptateurs derrière les ports existants (ADR-010).
- − Pas de renouvellement silencieux du jeton : passage par Google à chaque ouverture à froid sans jeton en mémoire, appui si le jeton expire pendant l'usage (accepté, Q-PWA-2).
- − Flux implicite OAuth : déconseillé par les recommandations récentes, toujours documenté par Google ; risque d'évolution (R18, veille).
- − Pas de notification de secours ni d'arrière-plan (accepté, Q-PWA-3).
- − Dépendance aux politiques de Chrome (persistance, installation) et, pour l'iPhone, d'Apple (R19).
- **À répercuter** : RG-017, ENF-01, ENF-04, ENF-07, US-018 CA-4 et Q-38 b (Pepper, en cours) ; DEC-021 (Jarvis, validation du commanditaire) ; `conventions.md` §3.1, §4.2, §9, §10.1, §11.10 (Anthony) ; `SYN-SESSION` sur le téléphone, écran d'attente de la redirection, invitation à installer l'application (Steeve) ; ADR-001, ADR-004, ADR-010 (notes de portée), ADR-012 (statut).
- **Condition d'E9 d'US-022 et d'US-017** : R11 et la mesure de la redirection (M-RED) au lieu de R1, R2 et R11.
