# E11 — Revue de lancement de LOT-001 : avis de l'architecte (Starck)

> **2026-10-27.** Auteur : Starck. Destinataires : Anthony (conception), Jarvis (cérémonie).
> **Objet** : conformité de la conception détaillée et des squelettes au DAT v0.11.3 (porté à v0.11.4 par cette revue), aux ADR (en particulier ADR-003, 004, 009, 010 et 013) et aux trois conditions posées à l'E8 (`explicitation-LOT-001.md` §4.3 ; texte qui fait foi : `LOT-001.md`, « Conditions de Starck sur l'ordre »).
> **Périmètre relu** (commit `9597df8`) :
> - `ST-socle-ecriture.md` v0.2, ST-US-022, 017, 018 et 031 v0.2 ; ST métier par sondage (US-001 §14, US-003, US-025) ;
> - `conventions.md` v0.4.1 ;
> - arborescence `src/` (squelettes et ports) ;
> - `tests/contrats/` (`depot-local.contrat.ts`, `transport-synchro.contrat.ts`) et les tests de propriétés de `tests/unitaires/synchronisation/domaine/`.

## 1. Avis

**Avis favorable au lancement, sous réserve de la correction d'une seule remarque bloquante (RL-LOT-001-A1)**, qui ne demande qu'une modification locale de ST-US-022 §6.6 et de ST-US-031 §6.4, et un test.

La conception est conforme à l'architecture sur l'essentiel :
- **ADR-013** : adaptateur web unique ; redirection silencieuse à l'ouverture (RED-01 à RED-08), avec une tentative par ouverture et l'effacement du fragment avant tout rendu ; `state` de 128 bits valable 10 min, écrit avant la navigation ; repli interactif de GIS, une redirection par geste ; IndexedDB en durabilité stricte, contrôlée par UT-SOC-44 ; persistance demandée et affichée.
- **ADR-004** : jeton en mémoire seulement (`CoffreJetonsMemoire`), aucun jeton ni fragment journalisé ou mis en cache, CSP et `no-referrer` dans `index.html`.
- **ADR-003** : un écrivain par fichier ; fusion par information, commutative, associative et idempotente (tests de propriétés UT-US-017-04, UT-SOC-43) ; marqueur « déposé jusqu'à » avancé seulement après la confirmation de Drive ; manifeste et `generation` à l'incrément 3.
- **ADR-010** : couches respectées dans les squelettes. Aucun import de Dexie ni d'infrastructure hors de `infrastructure`, aucun `Date.now`, `Math.random` ni stockage web en dehors des adaptateurs (contrôle par recherche sur `src/`).
- **ADR-009** : banc à deux appareils, `FauxDrive` et suites de contrat ; scénarios `@ihm` par cucumber-js et Playwright (ST-US-018, ST-US-031).
- **Réponses du 2026-10-27 (DAT v0.11.3)** : toutes intégrées fidèlement :
  - `appareilId` rangé dans l'espace du compte ;
  - médiane de 5 mesures, et seul un recul de l'horloge est corrigé ;
  - verrous « meneur » et « cycle » ;
  - meneur à accès valide seulement ;
  - écriture du départ confirmée avant la navigation, et reprise d'écran sans contenu métier.

**Les trois conditions de l'E8 sont remplies** :
1. **Modèle d'écriture** : US-001 écrit par le modèle définitif du rang 0 : HLC, contexte causal, pierres tombales, journal typé, index des écritures en attente, une transaction stricte. Le contenu logique du schéma 1 est figé (ST-socle §5.3, ST-US-017 §5.2). L'incrément 1 n'ajoute au port `DepotLocal` que deux méthodes, sans toucher aux types du socle (Q-ST017-STA-1, validé). Le déplacement de `IdFichierDrive`, réexporté sans changement de forme, est sans effet.
2. **Revue E13 d'US-001 sur le chemin d'écriture** : ST-US-001 §14 impose de rejouer `UT-SOC-*` et la suite de contrat `DepotLocal`.
3. **Q-US-001-2 et Q-US-001-3** : tranchées en E8. Les compléments d'Anthony sont respectés : l'incrément 1 suit immédiatement US-001, il est validé par les propriétés de la fusion avant le rang 4, et US-001 ne passe pas « En recette » avant les incréments 1 et 2.

## 2. Réponses aux deux questions nouvelles

### Q-ST022-STA-4 — Retour d'un repli en erreur alors que l'accès était déjà perdu
**Confirmé : a), garder `PERDU`.** Ma réponse à Q-ST022-STA-2 (« toute autre erreur donne `SYN-SESSION` ») visait le cas courant de l'accès à renouveler. Elle ne déroge pas à la règle du DAT §4.1.6 bis : une erreur sans preuve ne transforme jamais un accès perdu en accès à renouveler, ni l'inverse. Le tableau `accesApresRetour` de ST-US-022 §6.3 est exact. J'ai précisé la phrase dans le DAT v0.11.4 §4.1.7.

### Q-ST017-STA-3 — Archivage des appareils inactifs depuis 90 jours
**Tranché : sortie du lot 1, inscription au registre de dette (proposition d'Anthony retenue).** Le DAT v0.11.4 §4.2 l'acte :
- **au lot 1** : un fichier d'appareil inactif (ancienne installation, ou espace supprimé, DAT §4.1.4) est **fusionné comme les autres**, sans traitement particulier ; ST-US-022 §6.6 et ST-US-017 §6.3 retirent « puis archivé après 90 jours » ;
- **justification** : aucun scénario ne le décrit. Au lot 1, les fichiers inactifs sont peu nombreux et relus une seule fois par appareil (premier inventaire). Surtout, déplacer le fichier d'un autre appareil déroge à la règle « un seul écrivain par fichier » : cela demande une conception propre ;
- **entrée de dette à créer par Anthony** : catégorie Conception, priorité P3. Conditions déjà fixées pour le futur traitement : n'archiver qu'un fichier non modifié depuis 90 jours **et** dont toutes les écritures sont connues du fichier de l'appareil qui archive (contexte causal). Déclencheur de remboursement : plus de 10 fichiers d'appareil dans un dossier, ou le premier lot d'EPI-001, au plus tard.

## 3. Remarques

| # | Référence | Constat | Correction attendue | Gravité |
|---|---|---|---|---|
| **RL-LOT-001-A1** | ST-US-022 §6.6 (`SupprimerDonneesAppareil`) ; ST-US-031 §6.4 (avis `SESSION_FERMEE`) ; ST-socle §4.4 (`DepotLocalDexie`) ; DAT v0.11.4 §4.1.6 | **Suppression d'un espace avec d'autres onglets ouverts.** `indexedDB.deleteDatabase` reste bloqué tant qu'un autre onglet garde la base ouverte. Or l'avis `SESSION_FERMEE` n'est diffusé qu'**après** la dernière écriture, donc après une suppression qui attend précisément la fermeture des autres onglets : celle-ci n'aboutit pas, ou n'aboutit qu'au gré du navigateur. Si Dexie ferme la connexion sur `versionchange` puis la rouvre automatiquement au prochain accès, un onglet resté ouvert **recrée un espace vide**, avec un nouvel `appareilId`, juste après la suppression. La montée de version de la base (versions 2 à 4 de l'espace, aux incréments 1, 2 et 4) a le même défaut si un onglet de l'ancienne version reste ouvert. | (1) Chaque instance qui ouvre une base (espace et base technique) traite `versionchange` : fermeture, arrêt de la coordination et du cycle, **aucune réouverture automatique** (option Dexie correspondante, ou garde dans l'adaptateur), puis rechargement de la page. (2) Ordre de `supprimer` : `memoireSession.effacer` → `avisOnglets.diffuser('SESSION_FERMEE')` → `espaces.supprimer(compte)` → `fournisseur.oublier` → `sessionCourante.fermer`. (3) Suppression bloquée au-delà d'un délai (5 s proposé) : message demandant de fermer les autres fenêtres (code à demander à Steeve), et non une attente sans fin. (4) Tests : intégration `fake-indexeddb` avec deux connexions (suppression qui aboutit, absence de réouverture), et unitaire sur l'ordre des appels. | **Bloquante** (intégrité des données, US-022 CA de suppression, US-031). À corriger dans les ST avant l'E12 du rang 1 |
| RL-LOT-001-A2 | ST-US-017 §4.4 (`TransportSynchroDrive` : « parent = dossier ») ; ST-socle §5.3 l. 466 et ST-US-022 §6.6 (`appareils/<id>.etat.json.gz`) ; DAT §4.2 | **Rangement des fichiers d'appareil incohérent.** L'adaptateur les range à la racine du dossier, alors que le DAT, ST-socle et ST-US-022 citent un sous-dossier `appareils/`. | **Arbitré dans le DAT v0.11.4 §4.2 : à la racine du dossier**, sans sous-dossier, reconnus par leurs `appProperties` (choix de l'adaptateur, plus simple : pas de création concurrente ni de doublon de sous-dossier). Aligner le texte de ST-socle §5.3 et de ST-US-022 §6.6. Aucun schéma n'est publié. | Non bloquante (documentation) |
| RL-LOT-001-A3 | ST-US-017 §4.3 (`listerFichiersAppareils`), §6.3 ; `transport-synchro.contrat.ts` ; DAT v0.11.4 §4.3 | **Jeton de changements.** (a) L'ordre entre l'inventaire (`files.list`) et `changes.getStartPageToken` n'est pas fixé : si le jeton est pris **après** l'inventaire, un fichier modifié entre les deux n'est relu qu'à sa prochaine modification, ce qui peut dépasser le délai d'une heure. (b) Un jeton refusé par Drive (inconnu ou périmé : `RessourceIntrouvable` ou `400`) n'a pas de traitement dans le cycle. | (a) Obtenir le jeton de départ **avant** l'inventaire ; un fichier vu deux fois est sans effet (fusion idempotente). (b) Jeton refusé : oublier `meta.pageToken` et refaire un inventaire complet dans le même cycle, sans compter de tentative. Ajouter CT-TRANS-09 (fichier modifié pendant l'inventaire, retrouvé par `changements`) et un UT du cycle pour (b). | Non bloquante (avant l'E12 du rang 3) |
| RL-LOT-001-A4 | `conventions.md` v0.4.1, RED-04 | **Support du `state` périmé.** RED-04 désigne encore `sessionStorage`, avec sa dérogation à `no-restricted-globals`, alors que ST-US-022 v0.2 et le DAT v0.11.3 (Q-ST022-STA-1) retiennent la base technique IndexedDB, avec écriture confirmée avant la navigation. | Réécrire RED-04 : base `donejuan-<env>-technique`, table `redirection`, `memoriser` confirmé à `complete` avant la navigation, lecture destructive, reprise sans contenu métier ; retirer la dérogation `sessionStorage`. | Non bloquante (documentation ; ST et ESLint déjà conformes) |
| RL-LOT-001-A5 | `package.json` ; `.github/workflows/` ; ST-US-022 §3.1 (socle complémentaire) ; `conventions.md` §3.1, §14.2 ; DEC-029 | **Outillage pas encore en place.** Ne sont pas encore installés : `@cucumber/cucumber`, MSW, Playwright, dependency-cruiser, React, Ionic, `vite-plugin-pwa`. Il n'existe pas de workflow d'intégration continue de l'application (seul `poc.yml`). C'est attendu à ce stade (squelettes), mais c'est la condition d'application d'ADR-009 et des règles de couches. | Livrer au rang 0, avant son E13 : dépendances figées ; workflow CI (lint, types, Vitest, `cucumber-js --strict` par rang, dependency-cruiser, gitleaks, osv-scanner) ; puis demander à Jarvis d'activer la protection de `main` (DEC-029). | Non bloquante (condition de l'E13 du rang 0) |
| RL-LOT-001-A6 | ST-US-031 §8 (« `navigator.locks` absent : onglet meneur d'office ») | Sans Web Locks, plusieurs onglets écriraient le même fichier d'appareil, contrairement à ADR-003. Les navigateurs cibles (Chrome, Edge ; Safari 15.4 et plus pour EPI-001) disposent tous de l'API : le cas ne se présente pas en v1. | Garder le comportement, mais le journaliser en `erreur` (et non en `avertissement`), et ajouter une ligne au registre des hypothèses de ST-US-031 : « API requise par les navigateurs cibles ». | Non bloquante |
| RL-LOT-001-A7 | ST-US-017 §6.8 (correction d'horloge) ; port `TransportSynchro` | L'en-tête `Date` des réponses ne transite pas par le port `TransportSynchro` : la mesure doit donc être prise dans `ClientGoogle`, pour toutes les requêtes Google (Drive, et plus tard Calendar), et non dans un adaptateur particulier. | Préciser dans ST-US-017 §6.8, avant l'E10 de l'incrément 4, que la mesure est faite par un observateur de `ClientGoogle` (envoi, réception, `Date`), injecté dans la correction d'horloge. Aucun changement de port. | Non bloquante (avant l'E10 de l'incrément 4) |
| RL-LOT-001-A8 | `LOT-001.md`, « Synthèse des impacts architecture du lot » (Starck, E3) | Ma synthèse d'E3 décrit encore Capacitor, SQLite, l'authentification native et l'APK. | **Corrigé dans cette revue** : note datée en tête de section, qui renvoie au DAT v0.11.4 et à ADR-013. La réécriture complète sera faite à l'E17, avec le passage des ADR à « Accepté ». | Non bloquante (close) |
| RL-LOT-001-A9 | ST-US-022 §6.6, ST-US-017 §6.3 (« puis archivé après 90 jours ») ; registre de dette | Conséquence de Q-ST017-STA-3. | Retirer la mention de l'archivage des ST ; créer l'entrée de dette décrite au §2. | Non bloquante |

## 4. Points vérifiés sans remarque
- **Ouverture** (`deciderOuverture`, ST-US-022 §6.1) : aucune nouvelle redirection si un départ attend son retour (leçon EC-5 et EC-8 du PoC) ; aucune redirection hors ligne ni sans session. Conforme à RED-08 et au DAT §4.1.7.
- **Qualification de l'accès** (`accesApresRetour`, `qualifierRefusJeton`) : conforme au DAT §4.1.6 bis, y compris EC-7 (`access_denied` sans geste n'est pas une preuve).
- **Service worker** (ST-US-018 §6) : enregistré après la consommation du retour (RED-02), précache seul, aucune requête Google en cache, mise à jour sur accord, jamais pendant une saisie.
- **Coordination entre onglets** (ST-US-031 §6.1, §6.2) : exclusion du cycle jusqu'à `deposeJusquA` compris ; aucun jeton partagé entre onglets ; méta relue à chaque cycle.
- **Recette** : origine distincte (DEC-037), `VITE_ENV` en préfixe de tous les noms de stockage (`conventions.md` §9).
- **ANT-25** (identifiant des entrées de journal) : conforme au DAT v0.10.2 §6.1 ; validation acquise.
- **Contrats** : CT-DEPOT-01 à 11 couvrent les méthodes du socle et de l'incrément 1 ; CT-TRANS-01 à 08 couvrent le port, sous réserve de RL-LOT-001-A3.

## 5. Suite
- **Anthony** :
  - corriger RL-LOT-001-A1 dans ST-US-022 et ST-US-031 (la seule remarque bloquante) ;
  - traiter A2 à A4, A7 et A9 aux échéances indiquées ;
  - livrer A5 avec le rang 0 ;
  - créer l'entrée de dette de l'archivage.
- **Steeve** : un code de message pour la suppression bloquée par une autre fenêtre (A1, point 3).
- **Starck** : je vérifie la correction d'A1 dès qu'elle est livrée. Je lève alors la réserve sans nouvelle cérémonie.

## 6. Réponse d'Anthony (2026-10-28)

Versions produites : ST-US-022 v0.3, ST-US-017 v0.3, ST-US-031 v0.3, ST-socle-ecriture v0.3, `conventions.md` v0.4.2, registre de dette v0.4. Types, lint et formatage au vert ; 424 tests en échec « non implémenté » (phase rouge), dont 16 ajoutés pour cette revue.

| # | Réponse | Où |
|---|---|---|
| **A1** | **Corrigée, à vérifier par Starck.** (1) `versionchange` : `DepotLocalDexie` et la base technique ferment la connexion par `close({ disableAutoOpen: true })`, sans aucune réouverture automatique, puis appellent `surFermetureImposee`. Ensuite, toute méthode rend `EspaceLocalNonOuvert`. La composition arrête la coordination et le cycle, puis recharge la page. Une montée de version est traitée de la même façon. (2) Ordre imposé. Suppression : `memoireSession.effacer → avis.diffuser('SESSION_FERMEE') → espaces.supprimer → fournisseur.oublier → session.fermer`. Déconnexion : `oublier → effacer → diffuser → fermer`. Le port `AvisOnglets` et son adaptateur `BroadcastChannel` passent du rang 13 au rang 1. (3) Suppression bloquée au-delà de 5 s : `SuppressionBloquee` → `SUPPRESSION_BLOQUEE` → `ERR-017` (guide v0.2.15), avec « Réessayer » (`reessayer`, sans nouvelle confirmation) et « Fermer » (`fermerApresBlocage`). **Point à connaître** : IndexedDB ne permet pas d'annuler une demande `deleteDatabase` en attente. Une fois la confirmation donnée, la suppression aboutit dès que l'autre fenêtre ferme l'espace. Comme la session mémorisée est déjà effacée, une ouverture ultérieure ne rouvre pas l'espace. « Fermer » ramène donc cet onglet à l'écran de connexion. Je l'ai signalé à Steeve, car son texte d'`ERR-017` (« la session reste ouverte, vos données n'ont pas été supprimées ») ne peut pas être tenu tel quel. (4) Tests : UT-US-022-56 (ordre des appels pour la déconnexion et la suppression), UT-US-022-57 (bloquée, réessayer, fermer), UT-US-022-60 (intégration `fake-indexeddb`, deux connexions : fermeture sans réouverture, base non recréée) et UT-US-022-61 (connexion qui ne se ferme pas : `SuppressionBloquee` après 5 s, puis la suppression aboutit à sa fermeture). | ST-US-022 §3.2 n° 10 b, §4.3, §5.2, §6.5, §6.6, §6.11, §8 n° 7 d, §13 ; ST-US-031 §6.4 ; ST-socle §4.4 |
| A2 | Corrigée : les fichiers d'appareil sont à la racine du dossier, reconnus par leurs `appProperties`. | ST-socle §5.3, ST-US-022 §6.6, ST-US-017 §6.3 |
| A3 | Corrigée. (a) Le jeton de départ est obtenu avant l'inventaire. (b) Un jeton refusé rend `JetonChangementsInvalide`, nouvelle variante d'`ErreurTransport`. Le jeton est alors oublié et un inventaire complet est fait dans le même cycle, sans tentative comptée. Tests : CT-TRANS-09 et 10, UT-US-017-32. Ajouts au `FauxDrive` : `pendantLeProchainInventaire` et `invaliderJetons`. | ST-US-017 §4.3, §6.3, §13.1 |
| A4 | Corrigée : RED-04 est réécrit (base technique IndexedDB, écriture confirmée avant la navigation, lecture destructive, reprise sans contenu métier) et la dérogation `sessionStorage` est retirée. | `conventions.md` v0.4.2 |
| A5 | Acceptée. C'est une condition explicite de l'E13 du rang 0 : liste des dépendances figées, jobs de CI bloquants, puis demande de protection de `main` à Jarvis. | ST-US-022 §3.1 |
| A6 | Corrigée : l'absence de `navigator.locks` est journalisée en `erreur`. L'hypothèse H-031-1 est inscrite. | ST-US-031 §4, §8, §13, §16 |
| A7 | Corrigée : la mesure est prise par l'observateur `ObservateurEchangesGoogle` de `ClientGoogle`, pour toutes les réponses Google. Aucun changement de port. | ST-US-017 §6.8 |
| A8 | Close (corrigée par Starck). | — |
| A9 | Corrigée : la mention de l'archivage est retirée des ST et l'entrée **DT-002** est créée (Conception, P3, conditions et déclencheur fixés par Starck). | ST-US-022 §6.6, ST-US-017 §6.3, `dette-technique.md` |
| Q-ST022-STA-4 | Réponse a) prise en compte. Le §6.3 est inchangé. | ST-US-022 §16 |
| Q-ST017-STA-3 | Réponse intégrée (DT-002). | ST-US-017 §16 |

**Reste ouvert** : la levée d'A1 par Starck.
