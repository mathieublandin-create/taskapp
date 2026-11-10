# Revue de code E13 — LOT-001, rang 12 (US-018 : hors ligne smartphone, persistance, service worker, chaîne `@ihm`, déploiement)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-10 |
| Branche | `us/US-018-rang12` @ `71f5460` (PR #37 en brouillon, base `lot/LOT-001`) |
| Auteurs | Bruce (opus) : B1 (persistance, déclencheurs de RG-057, règle ESLint), B2 (codec, `TransportParPont`, `FournisseurAuthTestIhm`, `ponts.ts`, `test-ihm.ts`, alias, règles d'isolement), UT-COMP-US-018-1 à 20. Benjamin (sonnet) : D1 (feuille, `ALR-015`, étapes du banc, DT-038), D2 (options PWA, enregistrement, `ALR-016`, e2e de démarrage), D3 (profil `ihm`, `tests/steps-ihm/`, `rangCourant` 12), UT-COMP-US-018-21 à 39. Friday (sonnet) : F1 (job `ihm`, `verifier:dist`, `deploiement.yml`, action composite, `poc.yml`, pages publiques, UT-COMP-US-018-40). Pepper (glossaire v1.13, S12d, S17b, S21b), Steeve (guide v0.2.24), Starck (DAT v0.11.12). |
| Périmètre | Différentiel `origin/lot/LOT-001...origin/us/US-018-rang12` : 98 fichiers, + 5 599, − 252 (tranches B1, D1, D2, B2, D3, F1) |
| Référentiel | ST-US-018 v0.4.1 (portée à v0.4.2 par cette revue, §7), DAT v0.11.12 (§4.1.3, §4.1.6, §4.1.7, §7.2, §7.4, §7.5), guide d'ergonomie v0.2.24 §6.6.9, §6.6.15, glossaire d'étapes v1.13 §14, conventions §11.14, §14.1 à §14.3, `checklist-revue-code.md` v0.3, revue du rang 11 |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, hygiène) | **0 erreur.** |
| `pnpm test` (local, Node 24, `rangCourant` = 12) | **1 544 / 1 544** (285 fichiers). Les 90 rouges de l'E10 sont verts, les 7 gardes aussi. |
| `pnpm cucumber` (profil `default`) | **406 / 406 scénarios** (404 au rang 11, + S17b et S21b). S12d vert **avec** le geste de reconnexion et sans contournement du banc. |
| `pnpm build` puis `pnpm verifier:dist` | **0 erreur.** `dist/` : ni `donejuanFaux`, ni `jeton-test-ihm`, ni `test-ihm`. `dist/sw.js` : `skipWaiting()` appelé **uniquement** sur `{ type: 'SKIP_WAITING' }` (H-18-1 vérifiée), aucun `clientsClaim`, `createHandlerBoundToURL("/index.html")`, liste d'exclusion `[/^\/accueil\.html$/, /^\/confidentialite\.html$/]`. |
| `pnpm cucumber:ihm`, `pnpm e2e` | Non exécutables ici (Chromium de Playwright non téléchargeable dans ce bac à sable). Pris dans la CI : job « e2e (CSP, navigateur réel) » (= job `ihm`) **vert** sur `71f5460`. |
| CI de `71f5460` (API REST, check-runs) | **Verte sur les 7 contrôles** (`qualite`, `securite`, `build`, job `ihm`, `tests` dans les trois fuseaux). |
| Mutations locales (non commitées, annulées) | 14 mutations, **toutes détectées** : (M1) promesse partagée jamais oubliée → UT-US-018-01, 06, UT-COMP-US-018-9 rouges ; (M2) `persist()` à chaque lancement → 8 rouges (UT-US-018-01, UT-COMP-US-018-1 à 3, 9…) ; (M3) `controller` ignoré → UT-US-018-12 « premier chargement » rouge ; (M4) contrôle du réseau retiré de `TransportParPont` → 11 rouges (UT-US-018-14) ; (M5) `ALR-016` en même temps que la carte `ERR-013` → UT-COMP-US-018-25, 33 rouges ; (M6) pas de recalcul au retour au premier plan → UT-COMP-US-018-12 ; (M7) pas de demande de persistance au démarrage → UT-COMP-US-018-10, 11, 12, 15, 16 ; (M8) `forEach` au lieu de la boucle par indice (tableau creux) → UT-COMP-US-018-18 ; (M9) contrôle des clés symboles retiré → UT-COMP-US-018-18 ; (M10) échéance du jeton simulé − 1 ms → UT-US-018-15 ; (M11) `signalerNouvelleVersion` sans rafraîchissement → UT-COMP-US-018-30, 31, 33 ; (M12) pied de feuille avant le bouton → UT-US-018-10 ; (M13) ligne invalide non signalée → UT-US-018-08, UT-COMP-US-018-5 ; (M14) `oublier` sans vider le coffre → UT-US-018-15. |
| Tests fournis en E10 (CR-60) | Comparaison `9cf17be..71f5460` : deux modifications. (1) `d574e27`, arbitrage du rang 12 B1 (de moi, ST v0.4.1) : UT-US-018-01 et 08 **renforcés**. (2) `a8bcd16` (Benjamin, D1) : UT-US-018-04 et 10, espace ordinaire remplacée par l'espace insécable avant « : » dans l'attendu, pour suivre le catalogue (typographie française, DT-032) ; égalité stricte conservée, rien n'est affaibli. **Accord donné ici, a posteriori** ; à l'avenir, la demande précède le commit. |
| Rangs | `rangCourant` = 12. Les 10 fichiers créés dans `src/` figurent dans `rangs-fichiers.json` (`debut = fin = 12`), y compris `ponts.ts`, hors liste de la ST ; `fin` portée à 12 pour `application.ts` et `base-technique.ts` (squelettes remplacés). `rangs-tests.json` : `TransportParPont.*CT-TRANS-\d+` → 12 et `UT-COMP-US-018-\d+` → 12, placées avant les règles plus générales. **Conforme.** |
| Numérotation `UT-COMP-US-018-nn` | 1 à 40, **sans doublon entre auteurs** (Bruce 1 à 20, Benjamin 21 à 39, Friday 40). Plusieurs cas d'un même `describe` ou `it.each` partagent un identifiant (17, 23, 25 à 27, 34, 38 à 40) : admis (règle de rang par motif), sans effet. |
| Sécurité | Aucun secret, jeton réel, `localStorage`, `console` ni `dangerouslySetInnerHTML` ajouté. Journal de l'enregistrement du service worker : nom de l'erreur seulement. Composition de test isolée trois fois (alias du seul mode `test-ihm`, dependency-cruiser `composition-test-ihm-isolee`, ESLint sur `window`/`globalThis`/`self`.`donejuanFaux*`) et contrôlée dans `dist/` en CI. Workflows : actions épinglées par empreinte, permissions `contents: read` par défaut (voir RC-US-018-2, 3). **Conforme, sous réserve des RC-US-018-1 à 3 (F1).** |

## 2. Points soumis

### 2.1 B1 : persistance du stockage et déclencheurs de RG-057

| Mécanisme | Constat |
|---|---|
| `PersistanceNavigateur` | `etat()` → `persisted()` seul, `demander()` → `persist()` seul ; gestionnaire absent → `INDISPONIBLE` ; rejet **et** exception synchrone → `INDISPONIBLE` (l'appel est fait dans le `try` de `etatDepuis`). Ne rejette jamais. **Conforme** (UT-US-018-07). |
| `DemanderPersistance` | Promesse partagée tant qu'elle n'est pas réglée, oubliée par `finally` ; drapeau noté **après** la réponse de `persist()`, même refusée. **Conforme** (M1, M2). |
| `MemoireDemandePersistanceDexie`, `BaseTechnique.lire/ecrire` avec `cle` | Ligne `{ cle: 'persistanceDemandee', demandee: true }`, Zod `z.literal(true)`, ligne invalide → faux et `signalerLigneInvalide('installation')` ; écriture en transaction confirmée à `complete` ; base fermée → `undefined` / `INDISPONIBLE` absorbé. Le paramètre `cle` (défaut : nom de la table) ne change pas les appels de `session` et `redirection`. **Conforme**, suggestion RC-US-018-7. |
| Déclencheurs de RG-057 | `armerReevaluationRappel` = `periodiquement(60 s, rafraichir)`, sans appel à l'armement ; `web.ts` : rafraîchissement après `definirPremierPlan(true)` au retour au premier plan, jamais au passage au second plan ; masquage jamais remis par la visibilité (garde UT-US-018-03). **Conforme** (UT-US-018-09, UT-COMP-US-018-11, 12, M6). |
| Demande au démarrage | `void application.etatPersistance()` dans `apresOuvertureWeb`, après `ouvrirApplication`, avant la connexion. **Conforme** (UT-COMP-US-018-10, M7). |
| Règle ESLint `navigator.storage` | `no-restricted-properties`, dispenses par bloc `files` : `persistance-navigateur.ts` et `main.tsx` (ST v0.4.1 §9, aligné). `main.tsx` ne fait que transmettre `'storage' in navigator ? navigator.storage : undefined`. **Conforme.** |

### 2.2 D1 : feuille, `ALR-015`, ligne « Stockage », DT-038

- Modèle de vue : `persistance` absente → rien ; `PERSISTANT` → `PROTEGE` seul ; `NON_PERSISTANT` / `INDISPONIBLE` → `NON-PROTEGE` + carte `ALR-015` (`status`, non fermable, sans action). Composant : carte `IonCard` `data-message="ALR-015"`, `data-niveau="attention"`, `role="status"`, aucun bouton, puis `<p data-etat>` en dernier, après le bouton « Synchroniser maintenant » et les cartes (Q-ST018-STE-3 a, confirmée par Steeve). **Conforme** (UT-US-018-04, 10, 11 ; M12).
- **DT-038** : `seReconnecterAuRetourDuReseau`, `reconnexionEnCours`, `reconnecter` et le rappel du réseau sont retirés d'`appareil-simule.ts` ; `banc-synchro.ts` n'attend plus que les cycles. S12d, S17b et S21b passent par l'étape existante « l'utilisateur fait le geste de reconnexion » (glossaire v1.13 §14), et S17b / S21b vérifient d'abord `SYN-SESSION` et le rappel maintenu. **Remboursée** (effectif à la fusion de la PR #37).
- Étapes du banc : « ferme le bandeau » exige `BAN-RAPPEL-24H` **et** son affichage avant `masquerRappel()` ; « ferme l'onglet » vise le PC ; « depuis son adresse web » = même ouverture. **Conforme** à §12.1.

### 2.3 D2 : service worker et invite `ALR-016`

| Point | Constat |
|---|---|
| `optionsPwa` | `prompt`, `injectRegister: false`, précache seul (ni `skipWaiting`, ni `clientsClaim`, ni `runtimeCaching`), `navigateFallback` sous la base, exclusion ancrée des deux pages publiques, manifeste et nom de recette. **Conforme** (UT-US-018-05 ; `dist/sw.js` vérifié, §1). |
| `SKIP_WAITING` | Le service worker généré n'appelle `skipWaiting()` qu'à réception du message (H-18-1 confirmée) : aucune activation sans le geste « Mettre à jour ». **Conforme.** |
| Enregistrement après RED-02 | `main.tsx` : `enregistrerServiceWorker` est une instruction de premier niveau **après** celle qui appelle `demarrerWeb(consommerRetourRedirection(…))` (UT-COMP-US-018-35, contrôle statique), et l'e2e vérifie le fragment effacé. `waiting` présent → annonce ; `installed` annoncé seulement si la page est déjà contrôlée ; échec journalisé, jamais rejeté. **Conforme** (UT-US-018-12, M3). |
| `demarrerWeb` → `{ controleur, journal }` | `DemarrageWeb`, `journal` = `Application.journal` (ajouté à `Application`), aucun accès global. Forme la plus simple : **acceptée** (ST v0.4.2 §4.3). |
| `ALR-016` : accessibilité | `IonCard` `data-message="ALR-016"`, `data-niveau="information"`, `role="status"`, non fermable ; retours d'`ERR-013` dans une ligne `role="status"` sous le texte ; action `aria-disabled` pendant `rechargement` (`BoutonCarte` commun). **Conforme** au guide §6.6.15 (UT-COMP-US-018-26 à 29). |
| Absence de toast | `signalerNouvelleVersion` ne pose qu'un drapeau et rafraîchit : ni toast, ni bandeau, ni point sur l'indicateur, ni rechargement sans geste (UT-COMP-US-018-31). **Conforme.** |
| Non-coexistence avec la variante `carte` d'`ERR-013` | `modeleAlerteVersion` : rien sous `FORMAT_PLUS_RECENT` ; l'invite revient quand la consultation seule cesse (UT-COMP-US-018-25, 33 ; M5). **Conforme.** |
| Ordre `ALR-016` / « À lire » | Voir la décision 3 (§3). |

### 2.4 B2 : composition `test-ihm`

| Point | Constat |
|---|---|
| Isolement du bundle de production | (1) alias `^\.\/composition\/web$` → `test-ihm.ts` dans le seul mode `test-ihm` (UT-COMP-US-018-20 : aucun alias dans les autres modes) ; (2) dependency-cruiser : `src/composition/test-ihm(.ts|/)` n'est importé par aucun autre module de `src/` ; (3) ESLint : `donejuanFauxDrive` / `donejuanFauxGoogle` sur `window`, `globalThis`, `self` interdits hors `src/composition/test-ihm/**` ; (4) `verifier:dist` en CI (`build` et `deploiement.yml`). **Conforme.** |
| `demarrerWeb`, 3e paramètre `adaptateurs` | Écart à la ST (fonction `demarrerAvec` prévue) : le troisième paramètre, par défaut `ADAPTATEURS_GOOGLE`, évite une fonction de plus et garde un seul chemin d'ouverture (le retour n'est lu qu'une fois, RED-05). `main.tsx` ne le passe jamais ; en mode `test-ihm`, `main.tsx` appelle le `demarrerWeb` de `test-ihm.ts`, qui force `VITE_ENV = recette` (UT-COMP-US-018-15). **Accepté** (ST v0.4.2 §4.4, §6.4 n° 5). |
| `ponts.ts` | Seul lecteur des bindings, fonction exigée sinon `ErreurProgrammation` qui nomme le binding, avant toute ouverture (UT-COMP-US-018-13, 14). Hors liste de la ST : **accepté** (§3 n° 21 b). |
| Transtypages `as` sur les réponses décodées | `transport-par-pont.ts:160`, `fournisseur-auth-test-ihm.ts:285`, `ponts.ts:35-36`. **Acceptables, sans décodage sûr**, voir la décision 4 (§3). |
| Codec | JSON strict ; boucle par indice (un trou de tableau creux est `undefined` hors objet → refusé) ; clés symboles refusées ; `toJSON`, `Date`, `Map`, `Uint8Array`, instances refusés ; message = chemin et type, jamais la valeur (aucun jeton recopié). Propriétés fast-check. **Conforme** (UT-US-018-13, UT-COMP-US-018-17 à 19 ; M8, M9). |
| Contrat CT-TRANS-01 à 15 sur `TransportParPont` | Vert : le pont est transparent. |

### 2.5 D3 : chaîne `@ihm`

- Profil `ihm` : supports propres (`tests/steps-ihm/support/*.ts`, sans le monde ni les crochets du banc), étapes `tests/steps-ihm/*.steps.ts`, mode strict, sélection par rang. `cucumber:ihm` construit `dist-test-ihm` d'abord. **Conforme.**
- **Aucun contournement du banc** : l'autre appareil est un `AppareilSimule` alimenté par les fonctions de `tests/support/` (pas les fichiers d'étapes) ; l'appareil du navigateur passe par le vrai bouton « Continuer avec Google », le vrai bouton de l'indicateur pour le geste, les rôles accessibles pour la saisie ; le Drive est lu par `drive-banc.ts`. `MondeIhm.#verifierOuvertureHorsLigne` exige, pour une ouverture sans réseau, `navigator.onLine` faux **et** une page contrôlée par le service worker : « sans réseau » est prouvé, pas supposé. Les mutations rapportées par Benjamin (`eb7c6ef`) sont cohérentes avec ce contrôle.
- `[data-ecran]` : **absent de `src/`** ; la ST v0.4 §12.2 n° 4 et 5 le citait à tort. Les repères de `support/ecrans-ihm.ts` (`main.espace-application`, bouton « Continuer avec Google », `[data-etat]`, `[data-action]`) le remplacent : **ST corrigée** (v0.4.2). `ecrans-ihm.ts`, hors liste : **accepté** (§3 n° 24).
- Effacement des données : `Storage.clearDataForOrigin` (CDP, `all`) au lieu de la suite `deleteDatabase` / `caches.delete` / désinscription : même effet, plus sûr. **Accepté** (ST v0.4.2 §12.2 n° 5).
- Variables `VITE_*` du job `ihm` en environnement (valeurs fictives, aucun secret, aucun accès à Google) : **acceptées**.
- Observations d'interface rapportées par Benjamin : **inscrites en anomalies** (§5), non corrigées ici. Le clic au bord gauche de la ligne (`saisie.steps.ts:19-25`) est un geste d'utilisateur légitime, mais il doit renvoyer à l'anomalie (RC-US-018-5).

### 2.6 F1 : CI, déploiement, pages publiques

| Point | Constat |
|---|---|
| `ci.yml`, job `ihm` | Build `test-ihm`, `cucumber:ihm`, puis `pnpm e2e` ; ancien job `e2e` absorbé. Intitulé conservé « e2e (CSP, navigateur réel) » pour satisfaire le contrôle requis de la protection de `main` : **accepté provisoirement**, renommage soumis au commanditaire (Q-ANT-E13-R12-1), dette candidate R12-b. |
| `verifier:dist` | Recherche récursive de `donejuanFaux` et `jeton-test-ihm`, code 1 sinon ; appelé après `pnpm build` en CI et dans `deploiement.yml`. **Conforme.** |
| `deploiement.yml` | `workflow_dispatch` seul, `permissions: contents: read` au niveau du workflow, `concurrency` sans annulation, actions épinglées par empreinte ; `inputs.ref` utilisé seulement dans `with:` (aucune injection dans un `run`), entrées passées par `env`. **Quatre verrous de la production** : variable `DEPLOIEMENT_PRODUCTION_AUTORISE` = `true` (garde), entrée `confirmation` = `PUBLIER` (garde), commit ancêtre de `origin/main` (`git merge-base --is-ancestor`, construction), environnement `production` (publication). Recette construite et contrôlée à blanc, non publiée (Q-ANT26). Déclenchement par étiquette `v*` volontairement non branché (contournerait la garde) : **accepté**, dette candidate R12-a. Remarques RC-US-018-2 et 3. |
| Action composite | `actions/deploy-pages` épinglée, sortie `url`, aucun secret. **Conforme.** |
| `poc.yml` | Entrée `deploy_pages`, étape `upload-pages-artifact@v3` et job `deploy-pages` retirés ; l'artefact `site` reste téléchargeable. **Conforme** (DAT v0.11.12 §7.4). |
| Pages publiques | Fichiers présents, sans `<script`, sans `mailto:` ni adresse e-mail, liens externes limités à GitHub et Google, ni « POC » ni « Diagnostic », hors repli (UT-COMP-US-018-40). Relecture de chaque affirmation contre `src/` et le DAT : **trois affirmations inexactes** dans `confidentialite.html` (RC-US-018-1). `accueil.html` : exacte. |

## 3. Décisions

| # | Point | Décision |
|---|---|---|
| 1 | Modification d'UT-US-018-04 et 10 par Benjamin (`a8bcd16`) | Acceptée a posteriori (§1). |
| 2 | Écarts de conception de B2 et D3 (`demarrerWeb` à trois paramètres, `ponts.ts`, `ecrans-ihm.ts`, effacement par CDP, `[data-ecran]`) | Acceptés ; la ST est portée à **v0.4.2** dans ce commit. |
| 3 | **Ordre `ALR-016` / « À lire »** (guide v0.2.24 §6.6.15 : « en tête du corps de la feuille, avant la section « Synchronisation » » ; §6.6.2 et point « à lire » : « la feuille s'ouvre sur la section « À lire » en tête ») | **Je tranche pour le code** : « À lire » (quand elle est présente), puis `ALR-016`, puis la section « Synchronisation » (`main.tsx` : `ALire` avant `FeuilleSynchronisation`, dont `ALR-016` est le premier élément). Motifs : « À lire » est désignée par le point de l'indicateur et reçoit le focus de fin (`useFocusFinALire`, RG-056) ; le guide lui-même qualifie la mise à jour de non urgente. Les deux phrases du guide sont compatibles avec cet ordre si « en tête » se lit « avant la section Synchronisation ». **Steeve précise le guide** (v0.2.25, §6.6.15, ligne « Emplacement ») : « en tête du corps de la feuille, après la section « À lire » quand elle est présente, avant la section « Synchronisation » ». Aucun changement de code. |
| 4 | Transtypages `as` sur les réponses décodées des ponts | **Acceptables, pas de décodage sûr.** Les réponses viennent du processus cucumber, qui les encode par le même codec depuis les doublures vérifiées par leurs contrats (CT-TRANS sur `TransportParPont`) ; le code n'existe que dans le build `test-ihm`, jamais en production (§2.4). Un décodage Zod par type de port dupliquerait les schémas du domaine (CR-22) pour un risque nul en production ; une réponse mal formée ferait échouer le scénario, ce qui est le comportement voulu d'un défaut de test. Conditions : le commentaire qui justifie chaque `as` reste ; aucun `as` sur une donnée reçue hors de `src/composition/test-ihm/**`. |
| 5 | Codec refusant symboles et tableaux creux | Conforme et couvert (M8, M9). |
| 6 | Intitulé du job `ihm` | Provisoire, Q-ANT-E13-R12-1 au commanditaire ; dette candidate R12-b. |
| 7 | Numérotation et dettes reportées | **Plan confirmé.** Numéros DT et DEC attribués par Jarvis à la fusion (OPT-20) : les deux dettes candidates de cette revue (R12-a, R12-b) n'ont pas de numéro. **DT-025** : rang 13 (aucun fichier du cycle touché au rang 12 : `cycle-synchronisation.ts` et `suivi-cycle.ts` hors du différentiel, vérifié). **DT-027** : tranche autonome de Bruce (opus, 0,5 j), après la fusion de la PR #37 et avant l'E13b. **DT-037** : Q-ANT-E13-R11-3 répondue (DAT v0.11.12 §4.2 « Requalification ») ; échéance inchangée (E10 de la première évolution compatible du schéma 1). **DT-038** : remboursée (§2.2). |
| 8 | Conformité US / RG, qualité | US-018 CA-1 (S19 `@ihm`), CA-5 (S18 `@ihm`), CA-9 / RG-057 (S17b), R15 (UT) couverts ; aucun comportement ajouté. Fonctions courtes, aucune duplication de logique métier, typage strict (hors décision 4). Assertions exactes (valeurs, appels comptés, ordre) ; aucune assertion « définie » seule. Remarques mineures et suggestions au §4. |

## 4. Remarques

Gravité et statut selon la grille. Itération 1 pour toutes. **Aucune remarque bloquante.** Les remarques sont mécaniques : E13 bis sur sonnet (OPT-18).

### 4.1 F1 (Friday)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-018-1 | **Majeure** | CR-06, CR-56 ; DAT v0.11.12 §7.2 (« elle décrit l'application réellement publiée ») | `public/confidentialite.html:63-64`, `:75-76`, `:46` | Trois affirmations ne décrivent pas l'application : (a) `drive.file` donnerait accès aux fichiers « que vous choisissez vous-même dans le sélecteur de fichiers de Google » : l'application n'utilise pas le sélecteur (aucun Picker dans `src/`) ; (b) « un fichier de données » : l'application écrit **un fichier par appareil et un manifeste** (`manifeste.json`, DAT §4.2) ; (c) « Personne d'autre que vous n'y a accès » : le Drive est hébergé par Google et partageable par l'utilisateur ; l'application, elle, ne transmet rien. Pas d'effet tant que le verrou 1 bloque la production, mais la page sert à la vérification Google. | (a) Supprimer « , ou que vous choisissez vous-même dans le sélecteur de fichiers de Google » ; (b) remplacer par « des fichiers de données créés par l'application (un par appareil, et un fichier d'index), dans le dossier « Done Juan » » ; (c) remplacer par « L'application ne les transmet à personne. » Date de mise à jour à la date du commit. UT-COMP-US-018-40 reste vert. Starck relit l'ensemble à l'E13b (inchangé). | Ouverte |
| RC-US-018-2 | Mineure | CR-57 ; conventions §9.5 (permissions minimales et explicites) | `.github/workflows/deploiement.yml:108-110` | Le job `publication` déclare ses permissions (`pages`, `id-token`) : toutes les autres passent à `none`, `contents` compris, alors que le job fait un `actions/checkout` pour lire l'action locale. Dépôt privé : échec ; dépôt public : dépend d'un accès anonyme non déclaré. | Ajouter `contents: read` aux permissions du job `publication`. | Ouverte |
| RC-US-018-3 | Mineure | CR-41, CR-23 ; ST §3 n° 28 | `.github/workflows/deploiement.yml:71`, `:81` | (a) En production, `VITE_GOOGLE_WEB_CLIENT_ID` retombe sur `identifiant-fictif.apps.googleusercontent.com` si la variable de dépôt manque : la production serait publiée avec une connexion impossible, sans erreur. (b) Le message « Hors main » cite `${GITHUB_SHA}` (commit du workflow), pas le commit construit. | (a) Dans le job `garde` (production), refuser si `vars.VITE_GOOGLE_WEB_CLIENT_ID` est vide (passé par `env`, comme `AUTORISE`), et ne garder le repli fictif que pour la recette. (b) Citer `$(git rev-parse HEAD)`. | Ouverte |

### 4.2 D2, D3 (Benjamin)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-018-4 | Mineure | CR-62 ; ST-US-018 §14 (D2) | `tests/e2e/demarrage.e2e.ts` | Le test attendu « intégration de `PersistanceNavigateur` dans Chromium réel (`persisted()` répond) » manque : seuls des gestionnaires simulés exercent l'adaptateur. | Ajouter un test au fichier : sur le build de production chargé, `page.evaluate(() => navigator.storage.persisted())` se résout en booléen, et `persist()` aussi, sans exception de page. Il rougit si l'API manque ou si la CSP la bloquait. | Ouverte |
| RC-US-018-5 | Mineure | CR-24 (contournement sans référence) | `tests/steps-ihm/saisie.steps.ts:19-25` | Le clic au bord gauche de la ligne contourne le recouvrement de la dernière ligne par le bouton flottant, sans renvoi : il survivrait à la correction. | Compléter le commentaire : « ANO-005 : à remettre au centre de la ligne à la correction ». | Ouverte |
| RC-US-018-6 | Suggestion | CR-22 | `src/main.tsx:57`, `:64` ; `tests/unitaires/composition/main-service-worker.test.ts:75-77` | Expression `'serviceWorker' in navigator ? navigator.serviceWorker : undefined` écrite deux fois ; UT-COMP-US-018-37 compare le texte source exact, ce qui empêche de la nommer. | Facultatif : une constante de module, et UT-COMP-US-018-37 qui accepte cet identifiant (accord donné ici). | Ouverte (suggestion) |
| RC-US-018-8 | Suggestion | CR-22 | `src/synchronisation/presentation/ui/FeuilleSynchronisation.tsx:92-130`, `:156-182` | `CarteNouvelleVersion` reprend le corps « texte, ligne de retour, `BoutonCarte` » de `CarteErreur` pour `METTRE_A_JOUR`. | Facultatif : extraire un composant `CorpsMiseAJour` partagé. | Ouverte (suggestion) |
| RC-US-018-9 | Suggestion | CR-42 | `tests/steps-ihm/support/monde-ihm.ts:278-281` | `expect.poll(…).toBeGreaterThan(0).catch(() => undefined)` : une assertion utilisée comme attente, dont l'échec est absorbé. Sans affaiblissement (l'étape « s'affichent aussitôt » échoue ensuite), mais le motif est trompeur. | Facultatif : attendre par une fonction booléenne (`page.waitForFunction` ou boucle de `expect.poll` sur une condition rendue), sans `catch`. | Ouverte (suggestion) |
| RC-US-018-10 | Suggestion | CR-23 | `tests/steps-ihm/support/serveur-ihm.ts:14` | `MODE_TEST_IHM` redéfini (déjà exporté par `vite.config.ts`). | Facultatif : une seule définition. | Ouverte (suggestion) |

### 4.3 B1 (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-018-7 | Suggestion | CR-26 | `src/compte/infrastructure/base-technique.ts:116`, `:143` | Le défaut `cle = table` admet `lire('installation')`, qui lirait une clé « installation » sans signification. | Facultatif : surcharges (`session` / `redirection` sans clé, `installation` avec clé obligatoire). | Ouverte (suggestion) |

Le cœur de persistance et la composition `test-ihm` (Bruce) n'appellent **aucune reprise**.

## 5. Anomalies inscrites (`docs/anomalies.md`)

Observations de Benjamin pendant D3, confirmées à la lecture du code ; non corrigées au rang 12. Gravité **proposée**, à qualifier par Pepper avec Steeve, puis à confirmer en recette (E14) :
- **ANO-004** (Mineure proposée) : au lancement, l'écran de connexion (ECR-010) s'affiche brièvement avant l'espace, même pour une session existante, car la vue initiale du contrôleur est `CONNEXION` (`src/composition/controleur-interface.ts:172`) jusqu'à la fin d'`ouvrirApplication`. Guide §6.2 (v0.2) « Réouverture d'une session existante : aucun écran d'attente, même sans réseau » (US-022 CA-5, ENF-T-01) ; l'utilisateur peut croire à une déconnexion.
- **ANO-005** (Mineure proposée) : à 390 × 844, l'étiquette du bouton flottant « Ajouter une tâche » recouvre le centre de la dernière ligne visible de la liste, et la feuille de synchronisation, rendue en ligne au-dessus de l'espace, pousse la liste sous le pli (`src/main.tsx`, `EtatSynchronisation` ; `src/commun/presentation/ui/bouton-flottant.tsx`). Distincte d'ANO-002 (action de création absente, corrigée par la PR #32).

## 6. Questions ouvertes (via Jarvis)

- **Q-ANT-E13-R12-1** (commanditaire ; non bloquante) : le contrôle requis de la protection de `main` s'appelle « e2e (CSP, navigateur réel) », intitulé que porte aujourd'hui le job `ihm`. Acceptez-vous : a) ★ de remplacer ce contrôle requis par « ihm » après la fusion de la PR #37, puis Friday renomme le job (dette R12-b remboursée) ; b) de garder l'intitulé actuel (la dette R12-b est alors close sans action) ?
- **Q-ANT-E13-R12-2** (commanditaire, propriétaire du dépôt ; bloquante pour le seul premier déploiement de production) : pour l'environnement GitHub `production`, confirmez-vous : a) ★ relecteur requis = vous, **et** politique de branches de déploiement limitée à `main` (sans elle, `deploiement.yml` lancé depuis une autre branche porterait sa propre version de la garde) ; b) relecteur requis seulement ? Friday vérifie au premier lancement que la source GitHub Pages est « GitHub Actions » et que `actions/deploy-pages` accepte l'environnement `production` ; sinon, il le renomme `github-pages` en reportant les mêmes protections.
- **Demande à Steeve** (non bloquante) : préciser le guide §6.6.15 (ligne « Emplacement ») selon la décision 3.

## 7. Apports d'Anthony dans ce commit

- ST-US-018 **v0.4.2** (§3 n° 21 b et 24, §4.3, §4.4, §6.1 n° 5, §6.4 n° 5, §12.2 n° 4 et 5).
- Registre de la dette **v0.39** : DT-038 remboursée à la fusion ; dettes candidates R12-a (déclenchement par étiquette de `deploiement.yml`, recette non publiée) et R12-b (intitulé du job `ihm`), sans numéro (OPT-20) ; DT-037 : réponse de Starck consignée.
- `docs/anomalies.md` : ANO-004, ANO-005.

## 8. Verdict

**Changements requis** (une majeure, quatre mineures, toutes mécaniques ; aucune bloquante).
- Friday : RC-US-018-1, 2, 3 (`public/confidentialite.html`, `deploiement.yml`).
- Benjamin (sonnet) : RC-US-018-4, 5 (`demarrage.e2e.ts`, commentaire de `saisie.steps.ts`).
- Bruce : aucune reprise. Suggestions RC-US-018-6 à 10 facultatives.
- E13 bis sur sonnet (OPT-18) : contrôle des seules RC-US-018-1 à 5 et du différentiel ; la CI doit rester verte sur les 7 contrôles.
