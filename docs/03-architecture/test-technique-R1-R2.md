# Test technique préalable (avant E9 de US-022 et US-017) : volet web, condition de DEC-034, essai de partage

> **Version 3 du 2026-10-22.** Auteur : Starck.
> **Version 3 (DEC-034, ADR-013, DEC-035)** : le **volet Android natif** (R1 croisé, R2, R16-T, prérequis P4 b, P6 « débogage », P9) est **retiré** du protocole et conservé en **annexe A « repli »**, à n'exécuter que si la condition de DEC-034 échoue. Ajouts : **M-RED** (jeton par redirection à l'ouverture sur Chrome Android, condition de DEC-034), **M-PERSIST** (stockage persistant de la PWA installée, condition de DEC-034), **M-DUR** (durabilité d'IndexedDB après arrêt forcé et redémarrage), volet **optionnel R-P1/R-P2** (essai de partage d'EPI-001, deux comptes et l'iPhone du contributeur, avant l'E3 d'EPI-001). R3, R12 et §3.5 sont refaits sur Chrome Android. La mise à disposition sur GitHub Pages (dépôt public, Pages en source « GitHub Actions », variables) est reprise de `procedure-cles-et-premier-passage.md` (suspendue). **Condition de l'E9 d'US-022 et d'US-017 : R11 et M-RED.**
> Version 2 du 2026-10-21 : APK installé directement (ADR-012), hébergement (DEC-023), P9, R16-T.
> Statut : **protocole prêt, non exécuté. Aucun résultat à ce jour.**
> Références : DAT v0.11 (§4.1.2, §4.1.6, §4.1.6 bis, §4.1.7, §10) ; **ADR-013** ; ADR-004 ; ADR-005 ; ADR-012 (repli) ; US-022 (CA-5, CA-8) ; US-017 ; US-018 (CA-5) ; US-031 ; `poc-specification.md` v2 ; `backlog-idees.md` (EPI-001, R-P1, R-P2).
> Guide pas à pas du commanditaire : `guide-test-technique-commanditaire.md` v3.

## 1. Objet

| Mesure | Question | Si le test échoue | Bloquant ? |
|---|---|---|---|
| **R11** | En production, avec l'origine GitHub Pages (sans domaine propre, DEC-006), le consentement à `openid`, `email` et `drive.file` s'affiche-t-il **sans écran d'avertissement**, sur le PC et sur Chrome Android (US-022 CA-8) ? | Domaine personnalisé (environ 10 à 15 € par an, arbitrage du commanditaire), ou acceptation de l'écran | **Oui** (E9 d'US-022, US-017) |
| **M-RED** (condition de DEC-034) | Sur Chrome Android, la **PWA installée**, ouverte plus d'une heure après la dernière connexion, session Google du téléphone active, obtient-elle un jeton par redirection `prompt=none` **sans saisie**, en **au plus un aller-retour** vers Google ? | On garde l'APK pour Android (DEC-034) : annexe A, ADR-012 réactivé | **Oui** (E9 d'US-022, US-017 ; décision PWA unique) |
| **M-PERSIST** (condition de DEC-034) | `navigator.storage.persist()` est-il accordé à la PWA installée sur Chrome Android ? Et sur le PC (R15) ? | Sur Android : on garde l'APK (DEC-034). Sur PC : avertissement R15, sans changement | **Oui** pour Android (décision PWA unique) |
| **M-DUR** | Un marqueur écrit dans IndexedDB en durabilité stricte survit-il à un **arrêt forcé** de Chrome et à un **redémarrage** du téléphone (US-018 CA-5) ? | Analyse par Starck : correction du mode d'écriture, ou constat d'une limite à soumettre au commanditaire | Non pour E9 d'US-022 et US-017 ; **oui pour E9 d'US-018** |
| **R3** (informatif) | Sur le PC **et sur Chrome Android**, une demande de jeton au geste (fenêtre Google Identity Services) aboutit-elle en un geste, sans saisie, quand la session Google est active ? | Le geste en cours de session passe par une redirection interactive (ADR-013) | Non |
| **R12** | La PWA installée démarre-t-elle hors ligne, sans le script de Google Identity Services, sur le PC et sur Chrome Android (US-031, US-018) ? | Correction de la stratégie de chargement | Oui pour US-031 et US-018, correction possible en E12 |
| **§3.5** (informatif) | Distinguer un accès retiré d'une session expirée (DAT §4.1.6 bis) | Retrait de la détection précoce (PO-10) | Non |
| **R-P1** (optionnel, EPI-001) | Avec `drive.file`, un dossier créé par l'application sous le compte A et partagé avec le compte B est-il lisible par l'application de B ? Sinon, la sélection du dossier dans le sélecteur Google suffit-elle, pour les fichiers existants et futurs ? | M1-11 (DEC-035) : choix manuel dans le sélecteur à l'invitation et à chaque nouvel appareil | Non pour LOT-001 ; **oui pour l'E3 d'EPI-001** |
| **R-P2** (optionnel, EPI-001) | Sur l'iPhone du contributeur, la PWA ajoutée à l'écran d'accueil se connecte-t-elle par redirection, renouvelle-t-elle son jeton par `prompt=none` à l'ouverture (après 1 h, 24 h, redémarrage), et conserve-t-elle ses données ? | M1-10 (DEC-035) : réexamen de l'option iPhone | Non pour LOT-001 ; **oui pour l'E3 d'EPI-001** |

R1 (croisement de clients Android et web), R2 (jeton silencieux natif) et R16-T (APK signé) sont **sans objet** avec la PWA unique : un seul client OAuth Web. Ils figurent en annexe A.

## 2. Prérequis

| # | Prérequis | Qui | Remarque |
|---|---|---|---|
| P1 | **Compte Google** pour le test | **Commanditaire** | Son compte, ou un compte Gmail de test. |
| P2 | **Projet Google Cloud** `objectifs-taches-dev`, API Google Drive activée | **Commanditaire** | Aucune facturation. |
| P3 | **Écran de consentement OAuth** : « Externe », **« En production »**, nom, adresse d'assistance, **sans logo**, scopes `openid`, `email`, `drive.file` | Commanditaire, guidé | Publication d'un clic, sans vérification. |
| P4 | **Client OAuth Web** : origines JavaScript `http://localhost:5173` et `https://mathieublandin-create.github.io` ; **URI de redirection autorisés** (v3) : `https://mathieublandin-create.github.io/taskapp/` et `http://localhost:5173/` | Commanditaire | L'URI de redirection est l'origine suivie de `VITE_BASE_PATH`, barre oblique finale comprise, à l'identique. Sans elle, M-RED échoue en `redirect_uri_mismatch`. |
| P5 | **Mise à disposition sur GitHub Pages** (DEC-023, DEC-032 H-1 A) : dépôt `mathieublandin-create/taskapp` rendu **public** par le commanditaire ; « Settings > Pages » : source **« GitHub Actions »** ; variables du dépôt `VITE_BASE_PATH=/taskapp/`, `VITE_APP_ORIGIN=https://mathieublandin-create.github.io`, puis `VITE_GOOGLE_WEB_CLIENT_ID` ; un passage du workflow `poc` avec « Déployer sur GitHub Pages » coché | **Commanditaire** | Reprise des étapes 3 et 4 de `procedure-cles-et-premier-passage.md` (suspendue), **sans clé** : le job `apk (release)` est sauté, sans conséquence. Historique vérifié le 2026-10-22 : aucun secret. |
| P6 | **Téléphone Android** 10 ou plus, **Chrome à jour**, session Google active dans Chrome (compte P1) | **Commanditaire** | Ni mode développeur, ni débogage USB, ni installation d'APK. |
| P7 | **PC** avec Chrome ou Edge à jour | Commanditaire | — |
| P8 | **Application de test** v2 (`poc/`, `poc-specification.md` v2 §13), écarts EC-1 et EC-2 corrigés | Équipe (Benjamin) | Jamais de jeton dans le journal. |
| P10 (optionnel, R-P1/R-P2) | Second compte Google (B, le contributeur) ; **iPhone** du contributeur, iOS 17 ou plus ; API **Google Picker** activée ; **clé d'API** restreinte (référents `https://mathieublandin-create.github.io/*` et `http://localhost:5173/*`, API Google Picker seule) ; volet partage du PoC (`poc-specification.md` §14) | Commanditaire et contributeur ; équipe pour le PoC | Avant l'E3 d'EPI-001 seulement. |

## 3. Protocole

Les numéros 3.1, 3.4 et 3.5 sont ceux de la v2 (cités par le DAT et les spécifications) ; les numéros 3.6 à 3.8 sont nouveaux. Les sections sont présentées dans l'**ordre d'exécution** de la séance. Les numéros 3.2 et 3.3 (R1, R2) sont en annexe A.

Chaque étape est consignée au §5 avec la date, l'heure, l'appareil, le **mode d'affichage** journalisé (`standalone` ou `navigateur`), le résultat observé et une capture si une interface Google s'affiche.

### 3.1 R11 : consentement
1. **PC** : ouvrir `https://mathieublandin-create.github.io/taskapp/` dans une fenêtre sans session de l'application. « Se connecter ». Consentir.
2. **Observer** : un écran « Google n'a pas validé cette application » apparaît-il ? Les scopes affichés sont-ils les trois demandés ?
3. **Chrome Android** : même adresse ; « Installer l'application » (menu de Chrome) ; ouvrir la PWA installée depuis l'écran d'accueil ; « Se connecter » ; mêmes observations.

### 3.6 M-RED : jeton par redirection à l'ouverture (Chrome Android, PWA installée ; PC en référence)
1. Après 3.1.3, dans la PWA installée : « Remettre à zéro le compteur », puis « Jeton par redirection ». **Observer** : retour `JetonObtenu`, compteur à 1, durée, contexte `standalone` et `web-android`. C'est la mesure « session fraîche ». Puis **cocher « Redirection automatique à l'ouverture »**.
2. Fermer la PWA en la retirant des applications récentes. **Attendre plus d'une heure.**
3. Rouvrir la PWA depuis l'écran d'accueil, **sans aucun appui** : le départ est automatique (entrée « Départ automatique à l'ouverture »). Si le journal indique « Non lancé », consigner la raison puis appuyer sur « Jeton par redirection ». **Observer** :
   - un écran Google s'affiche-t-il ? demande-t-il de **taper** quoi que ce soit (mot de passe, code) ? de choisir un compte ?
   - le journal montre-t-il `JetonObtenu`, le compteur a-t-il augmenté d'un seul, quelle durée ?
   - le retour se fait-il dans la fenêtre de la PWA (`standalone`), et non dans un onglet de Chrome ?
4. Redémarrer le téléphone, puis refaire 3.
5. (Informatif) Le lendemain, plus de 24 h après, refaire 3.
6. (Informatif, cas d'échec attendu) Se déconnecter de Google dans Chrome (ou retirer le compte du téléphone, si le commanditaire l'accepte), puis refaire 3 : un code `interaction_requise` (`login_required` ou `interaction_required`) est attendu, sans boucle de redirections.
7. **PC** : refaire 2 et 3 avec la PWA installée du PC (référence pour l'adaptateur web unique).

L'option « Redirection automatique à l'ouverture » (`poc-specification.md` §13.3, `62a010b`) est la voie de mesure principale de 3.6.3 à 3.6.7 ; le bouton n'est qu'un recours.

### 3.7 M-PERSIST et M-DUR : stockage
1. **M-PERSIST** : dans la PWA installée sur Chrome Android, « Stockage persistant ? ». Relever `persisted()` avant l'appel et le résultat de `persist()`. Refaire dans un **onglet** Chrome ordinaire (même adresse) pour comparaison, puis sur le PC (R15).
2. **M-DUR, arrêt forcé** : « Poser le marqueur » ; noter l'identifiant (8 premiers caractères). Dans les réglages Android : « Applications > Chrome > Forcer l'arrêt ». Rouvrir la PWA, « Lire le marqueur ». Succès : même identifiant.
3. **M-DUR, redémarrage** : « Poser le marqueur » ; redémarrer le téléphone **dans les 5 secondes** ; rouvrir, « Lire le marqueur ».
4. (Informatif) **Effacement** : noter si la désinstallation de la PWA (appui long sur l'icône) efface le marqueur : réinstaller, « Lire le marqueur ».

### 3.4 R3 et R12 : geste et démarrage hors ligne (PC et Chrome Android)
1. **R3** : PWA installée, session Google active, plus d'une heure après la connexion, **sans recharger** : « Synchroniser ». **Observer** : un seul geste ? une fenêtre qui se ferme seule ? une saisie ? Sur Chrome Android, la fenêtre s'ouvre-t-elle et revient-elle dans la PWA ?
2. Se déconnecter de Google dans le navigateur, refaire 1 : une interface de connexion est attendue.
3. **R12** : couper le réseau (mode avion sur le téléphone, Wi-Fi sur le PC), ouvrir la PWA installée. **Observer** : ouverture, identité en cache, aucune erreur liée au script Google.

### 3.5 Distinguer un accès retiré d'une session expirée (Q-US-031-1, DAT §4.1.6 bis ; ajouté en v0.10, sur PC ; v3 : informatif aussi sur Chrome Android)
Objet : valider l'hypothèse de conception qui qualifie « accès perdu » seulement sur preuve. Prérequis : connexion réussie au 3.1 ; écran « Diagnostic » journalisant, pour chaque appel, le code de réponse, le code d'erreur de Google Identity Services et l'échéance du jeton (jamais sa valeur).
1. **Demande de jeton après expiration (session Google active).** Attendre l'expiration du jeton (plus d'une heure) ou recharger la page, puis demander un jeton. **Observer** : un geste de l'utilisateur est-il exigé ? Une fenêtre s'ouvre-t-elle et se ferme-t-elle seule ? Quel code d'erreur si le navigateur bloque la fenêtre ? (Complète R3.)
2. **Jeton non échu après retrait de l'accès.** Avec un jeton valide (au moins 60 s avant son échéance), retirer l'accès de l'application dans « Compte Google > Sécurité > Applications tierces ». Appeler Drive immédiatement, puis à 1, 5 et 15 min. **Observer** : Drive répond-il `401`, ou accepte-t-il le jeton jusqu'à son échéance ? Dans quel délai le refus apparaît-il ? Si le jeton reste accepté, la ligne « `401` sur jeton non échu » du tableau du §4.1.6 bis disparaît.
3. **Demande de jeton après le retrait.** Après le retrait (jeton échu ou page rechargée), demander un jeton avec les mêmes scopes. **Observer** : l'écran de consentement s'affiche-t-il de nouveau, ou une erreur est-elle renvoyée (code exact) ? `hasGrantedAllScopes` est-il vrai après un nouveau consentement complet, faux après un consentement partiel ? Les deux cas (accès re-consenti et refus) doivent produire les états du tableau du §4.1.6 bis.

Critère : informatif pour E9 (les états affichés ne dépendent pas du résultat) ; seul le résultat du point 2 peut retirer la détection précoce du retrait (PO-10). Consigner les résultats au §5.

### 3.8 R-P1 et R-P2 : essai de partage d'EPI-001 (optionnel, avant l'E3 d'EPI-001)
Comptes : **A** (administrateur, le commanditaire) et **B** (contributeur). Appareils : le PC de A ; l'**iPhone** de B.

**R-P1, visibilité d'un partage avec `drive.file`** :
1. PC, compte A : « Se connecter », « Créer » : l'application crée `Done Juan (POC)` et un fichier.
2. Sur drive.google.com (A) : partager le dossier `Done Juan (POC)` avec B, **en lecture** (« Lecteur »).
3. iPhone, PWA de B (voir R-P2.1) : « Lire par identifiant » avec l'identifiant du fichier de A (communiqué par l'équipe à partir du journal de A). **Observer** le code HTTP : `404` attendu.
4. « Choisir dans le sélecteur Google » : onglet « Partagés avec moi », choisir le **dossier** `Done Juan (POC)`. Puis « Lister le dossier choisi » et « Lire par identifiant ». **Observer** : les fichiers du dossier sont-ils listés et lisibles ?
5. Si non : choisir le **fichier** lui-même dans le sélecteur, puis « Lire par identifiant ».
6. PC, A : « Créer » un second fichier dans le même dossier (nouveau nom). iPhone, B : « Lister le dossier choisi » **sans** repasser par le sélecteur. **Observer** : le nouveau fichier est-il visible ? (C'est ce qui décide des gestes à chaque nouvel appareil, M1-11.)
7. iPhone, B : « Tenter une écriture » sur le fichier de A : `403` attendu.
8. iPhone, B : « Créer mon fichier », puis le partager avec A en lecture depuis l'application Google Drive de l'iPhone. PC, A : « Lire par identifiant » (`404` attendu), puis sélecteur et lecture.

**R-P2, PWA sur iPhone** :
1. Safari, adresse de l'application, « Partager > Sur l'écran d'accueil ». Ouvrir l'icône. « Connexion par redirection » ; se connecter avec B ; consentir. **Observer** : retour dans la PWA, `JetonObtenu`.
2. « Se connecter » (fenêtre GIS) : **observer** si la fenêtre s'ouvre, aboutit et revient (réputée défaillante).
3. « Stockage persistant ? », « Poser le marqueur ».
4. Fermer la PWA (balayage). Après plus d'une heure : rouvrir, « Jeton par redirection ». Mêmes observations que M-RED.3.
5. Redémarrer l'iPhone ; rouvrir ; « Lire le marqueur » ; « Jeton par redirection ».
6. Après 24 h, puis (informatif) après 7 jours sans ouverture : rouvrir ; « Lire le marqueur » ; « Jeton par redirection ». La durée de la session Google dans la PWA est l'objet principal de R-P2.

## 4. Critères de succès

| Mesure | Succès si | Bloquant pour |
|---|---|---|
| R11 | Aucun écran d'avertissement aux étapes 3.1.2 et 3.1.3 | **E9 d'US-022 et d'US-017** ; sinon, arbitrage du commanditaire |
| **M-RED** | Aux étapes 3.6.3 et 3.6.4 : `JetonObtenu`, **aucune saisie et aucun appui chez Google** (ni mot de passe, ni code, ni choix de compte, ni bouton « Continuer »), compteur augmenté de **1 au plus**, retour en mode `standalone`. Le bouton du PoC ne fait que déclencher la mesure ; si l'option « redirection automatique à l'ouverture » existe, l'étape est refaite sans bouton et doit donner le même résultat. 3.6.5 à 3.6.7 informatives. **Ce critère fixe aussi la réponse à Q-DEC034-1** (renouvellement à l'ouverture sans geste) et le sens de l'étape Gherkin « l'accès à Google est renouvelé sans saisie ». | **E9 d'US-022 et d'US-017** ; **condition de DEC-034** |
| **M-PERSIST** | `persist()` (ou `persisted()`) vaut vrai dans la PWA installée sur Chrome Android | **Condition de DEC-034** |
| M-DUR | Même identifiant relu aux étapes 3.7.2 et 3.7.3 | E9 d'US-018 |
| R3 | Au plus un geste, sans saisie | Non |
| R12 | 3.4.3 réussit sur le PC et sur Chrome Android | US-031, US-018 (correction possible en E12) |
| §3.5 | Informatif | Non (PO-10) |
| R-P1 | Résultats consignés pour 3.8 R-P1.3 à 8 (pas de critère de réussite : l'essai éclaire M1-11) | E3 d'EPI-001 |
| R-P2 | Connexion par redirection réussie (R-P2.1) ; `prompt=none` sans saisie après 1 h (R-P2.4) ; marqueur conservé (R-P2.5) | E3 d'EPI-001 (M1-10) |

**Décision après le volet web** (Starck, puis Jarvis et le commanditaire) :
- M-RED **et** M-PERSIST réussis : la PWA unique est confirmée ; ADR-013 s'applique ; ADR-012 est abandonné ; DEC-021 est remplacée.
- L'un des deux échoue : on garde l'APK pour Android (DEC-034) ; l'annexe A et la procédure des clés reprennent ; ADR-013 vaut pour le PC (et l'iPhone).

## 5. Résultats
*À remplir lors de l'exécution. Aucun résultat n'est disponible à ce jour.*

| Étape | Date et heure | Appareil | Mode d'affichage | Résultat observé | Conforme ? | Capture |
|---|---|---|---|---|---|---|
| | | | | | | |

## 6. Ce qui est automatisable ici, et ce qui demande le commanditaire
- **Par l'équipe** : le PoC et ses tests Vitest ; le workflow ; le guide ; l'analyse.
- **Par le commanditaire uniquement** : rendre le dépôt public, régler Pages et les variables, lancer le workflow ; créer le projet Google Cloud, l'écran de consentement et le client Web ; consentir ; utiliser ses appareils ; les attentes d'une heure et de 24 h. Pour R-P1/R-P2 : le contributeur, son compte et son iPhone.
- **Durée** : préparation environ 1 h (dont 30 min de projet Google Cloud) ; **séance web** d'environ 1 h, plus une attente d'une heure ; un bref contrôle le lendemain (informatif). Volet partage : environ 1 h, plus les attentes, à une autre date.

---

## Annexe A — Repli : volet Android natif (à n'exécuter que si la condition de DEC-034 échoue)

Reprise de la version 2 du protocole, inchangée sur le fond. Dans cette annexe, les renvois « 3.2.x » et « 3.3.x » désignent les étapes A.3.2.x et A.3.3.x. Elle redevient active avec ADR-012 et la procédure `procedure-cles-et-premier-passage.md`.

**Prérequis supplémentaires** : P4 b (client OAuth **Android**, nom de paquet `fr.donejuan.poc`, empreinte SHA-1 de la clé de débogage, puis de la clé de publication de test) ; P6 complet (mode développeur, débogage USB, installation d'APK ; Google Play services à jour) ; **P9** (clé de publication de test, distincte de la clé de débogage, déclarée dans un second client Android ; `.gitignore` posé).

**Critères** : R1 réussi dans les deux sens, empreintes identiques (bloquant) ; R2 réussi sans aucune interface aux étapes A.3.3.2 à 4 (bloquant, US-022 CA-5) ; R16-T : APK signé hors Google Play authentifié, mise à jour par écrasement qui conserve données et autorisation (bloquant, ADR-012).

#### A.3.2 R1 : visibilité croisée (`drive.file`)
1. **Android** : se connecter. Bouton « Créer » : l'application crée le dossier `Done Juan (POC)` (`appProperties.app = objectifs-taches-poc`) et le fichier `appareils/android-poc.etat.json.gz`, d'environ 10 Ko, dont l'empreinte SHA-256 s'affiche à l'écran.
2. **PC** : se connecter avec le même compte. Bouton « Lister » : `files.list` avec `q = appProperties has { key='app' and value='objectifs-taches-poc' }`, puis `files.get?alt=media` sur le fichier Android. L'empreinte s'affiche.
3. **Sens inverse** : le PC crée `appareils/pc-poc.etat.json.gz`, puis Android le liste et le lit.
4. **Détection de changement** : le PC modifie son fichier (`files.update`). Android appelle `changes.list` depuis le `pageToken` obtenu à l'étape 1. Le fichier modifié doit apparaître, et la nouvelle empreinte doit correspondre.
5. **Interface Drive** : sur drive.google.com, le dossier et les deux fichiers sont visibles (DEC-009).
6. **Création simultanée** (informatif) : supprimer le dossier, puis lancer « Créer » au même moment sur les deux appareils. Observer si deux dossiers sont créés ; c'est le cas prévu au DAT §4.2.

#### A.3.3 R2 : renouvellement silencieux sur Android
1. Après la connexion de l'étape 3.2, noter l'heure d'expiration du jeton.
2. Fermer l'application en la retirant des applications récentes. La rouvrir **après l'expiration** (plus d'une heure). Bouton « Jeton silencieux » : l'AuthorizationClient est appelé avec les mêmes scopes. **Observer** : un jeton est-il obtenu sans aucune interface ?
3. Redémarrer le téléphone, puis refaire l'étape 2.
4. Le lendemain, plus de 24 h après, refaire l'étape 2.
5. **Mode avion** : ouvrir l'application. **Observer** : l'identité en cache est affichée, sans erreur bloquante. Les données sont alors des données factices de la preuve de concept.
6. **(Informatif, pour un lot ultérieur)** Une tâche d'arrière-plan (WorkManager ou Background Runner), application fermée, tente toutes les 30 min d'obtenir un jeton et de lister les fichiers pendant 3 h. Noter les réussites et les échecs.
7. **Révocation** : retirer l'accès sur myaccount.google.com → « Sécurité » → « Applications tierces ». Refaire l'étape 2. **Observer** l'erreur obtenue, qui doit être traduite en `AccesGoogleRevoque`.

8. **APK de publication et mise à jour par écrasement (ADR-012, R16-T)** :
   1. installer l'APK de la preuve de concept **signé par la clé P9**, par fichier (téléchargé depuis l'hébergement P5 avec le navigateur du téléphone) : noter les autorisations demandées par Android et un éventuel avertissement de Google Play Protect ;
   2. se connecter, créer le fichier de test (3.2.1), puis vérifier que le jeton silencieux (3.3.2) fonctionne avec ce client ;
   3. installer **par-dessus** un second APK de la même clé, avec un `versionCode` supérieur, par câble (`adb install -r`). **Observer** : données locales, identité et jeton silencieux conservés, sans nouvelle interface de consentement ;
   4. (informatif) tenter d'installer un APK signé par la clé de **débogage** par-dessus : le refus d'Android est attendu.


#### A.3.4 R11 sur Android natif
Refaire 3.1 dans l'APK installé (« Se connecter ») : même critère.
