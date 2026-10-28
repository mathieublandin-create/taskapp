# Revue de code E13 — LOT-001, rang 1 (US-022, connexion et session Google)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony (responsable technique) |
| Date | 2026-10-28 |
| Auteur du code | Bruce |
| Branche | `us/US-022-connexion` @ `5ca925a`, *pull request* n° 2 (base `us/SOCLE-ecriture`, *pull request* n° 1 approuvée) |
| Périmètre | `git diff origin/us/SOCLE-ecriture...HEAD` (OPT-7) : 10 commits de Bruce (`f5c1934` à `5ca925a`), 93 fichiers |
| Référentiels | ST-US-022 v0.3 (§3, §6, §8, §12) ; `conventions.md` v0.4.4 (§9.2.1 RED-01 à RED-08, §11, §12) ; `checklist-revue-code.md` v0.3 |
| Passage | 1 |

## 1. Verdict

**Changements requis.**

| Gravité | Nombre | Remarques |
|---|---|---|
| Bloquante | 1 | RC-US022-1 |
| Majeure | 2 | RC-US022-2, RC-US022-3 |
| Mineure | 3 | RC-US022-4 à RC-US022-6 |
| Suggestion | 3 | RC-US022-7 à RC-US022-9 |

Le code est solide et lisible. Le flux OAuth suit fidèlement RED-01 à RED-08 : fragment effacé avant l'analyse, `state` de 128 bits à usage unique, `login_hint` obligatoire hors connexion, un seul repli interactif par geste, `versionchange` sans réouverture et `ERR-017`. Les tests fournis en E10 sont intacts et les 55 tests `UT-COMP-US-022` sont de bonne facture. Trois points empêchent l'approbation :
- le jeton reste dans une variable de module de `main.tsx` (RC-US022-1) ;
- les *step definitions* du rang 1 sont incomplètes (RC-US022-2) ;
- des erreurs sont ignorées en silence dans le contrôleur d'interface, qui n'est pas testé (RC-US022-3).

## 2. Contrôles exécutés

### 2.1 Localement, sous Node 24, sur `5ca925a`
| Commande | Résultat |
|---|---|
| `pnpm test` | Vert : 330 tests exécutés (rangs 0 et 1, outillage), 266 non sélectionnés, 0 échec |
| `pnpm verifier` | Vert : formatage, lint (0 avertissement), types, architecture (198 modules, 0 violation), catalogue, tags, rangs, dépôt |
| `pnpm test:couverture` | Vert : lignes 97,2 %, branches 91,4 % ; seuils du §12 respectés. Point faible : `passerelle-gis-navigateur.ts` à 62 % de lignes, compensé au niveau du motif d'infrastructure |
| `pnpm cucumber` | Vert : 11 scénarios, 91 étapes |
| `pnpm cucumber:steps-inutilises` | Vert : 0 définition inutilisée |

### 2.2 GitHub Actions (commit `5ca925a`)
Tous les contrôles sont verts : `qualite`, `build`, `securite`, et `tests` dans les trois fuseaux (UTC, America/New_York, Pacific/Auckland). La *pull request* est fusionnable (`clean`).

### 2.3 Intégrité des tests (CR-60, CR-61)
Aucun fichier de test livré en E10 n'est modifié : `tests/unitaires/**` et `tests/contrats/fournisseur-auth.contrat.ts` n'apparaissent qu'en ajout dans le différentiel. Seuls deux squelettes sont complétés, comme prévu : `faux-fournisseur-auth.ts` et `faux-drive.ts`. Aucun `skip`, `only` ou `@wip`.

## 3. Points de sécurité examinés en priorité

| Point | Constat | Statut |
|---|---|---|
| Jeton en mémoire seulement (RED-05, CR-51) | `CoffreJetonsMemoire` utilise un champ privé `#jeton`. `ClientGoogle` et userinfo passent le jeton par l'en-tête `Authorization` ; aucun jeton n'est journalisé. **Mais** le `RetourGoogle`, qui porte le jeton, reste dans la constante de module `retour` de `main.tsx` pendant toute la vie de la page, y compris après une déconnexion. | **RC-US022-1** |
| Fragment effacé avant le rendu (RED-02) | `consommerRetourRedirection` est la première instruction de `main.tsx`. Elle lit, efface (`replaceState(history.state, '', pathname + search)`) puis analyse, dans tous les cas. Aucun module importé n'a d'effet de bord à l'évaluation. | Conforme |
| `state` à usage unique, valable 10 min (RED-03, RED-04) | Le `state` fait 16 octets (`SourceAleatoire`), encodé en base64url. Il est mémorisé dans la base technique, confirmé à `complete`, avant la navigation. `consommer` lit puis supprime dans une même transaction (§6.2, étape 1, et `abandonnerAttenteGoogle`). Le rejet couvre un `state` absent, inconnu ou expiré (`>`) ; il est accepté à `expireA` exactement. La route de reprise est validée par `ROUTE_REPRISE` à l'écriture et à la relecture (Zod). | Conforme |
| `login_hint` (§6.4) | Il est présent à l'ouverture, pour le geste par GIS et pour le repli. Il est absent à la connexion. Son absence hors `CONNEXION` lève `ErreurProgrammation`. Il n'est jamais journalisé. | Conforme |
| Un seul repli interactif par geste (Q-ST022-STA-2) | `#gesteGis` mène à `#repli` une seule fois, sans enchaînement. Sur web-ios, le repli est fait d'emblée. Il n'y a pas de repli sur `popup_closed` ni sur `access_denied`. Si `redirectionPermise` est faux, `RedirectionNonPermise` est rendu sans navigation (UT-COMP-US-022-01 à 04). | Conforme |
| `location.assign` restreint par ESLint | La règle existe et seul `fournisseur-auth-web.ts` en est dispensé. Elle ne couvre pas les variantes `window.location.assign`, `location.replace` et `location.href = …`. | **RC-US022-5** |
| `appareilId` par espace (Q-ST022-STA-3) | `DepotLocalDexie.ouvrirEspace` crée l'identifiant dans une transaction stricte, le relit sans appeler le générateur, et rend `DonneesLocalesIllisibles` si la ligne est illisible (UT-US-022-55). | Conforme |
| `versionchange` et `ERR-017` (RL-LOT-001-A1) | `BaseTechnique` et `DepotLocalDexie` ferment la connexion avec `close({ disableAutoOpen: true })`, rendent `false` puis appellent `surFermetureImposee`. L'ordre « effacer → prévenir → supprimer » est respecté. La suppression bloquée rend `SuppressionBloquee` au bout de 5 s par le `Planificateur`, et la même demande est attendue ensuite (UT-US-022-56, 57, 60, 61). | Conforme |

## 4. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US022-1 | **Bloquante** | CR-51, CR-53 ; RED-05 | `src/main.tsx:20` | `const retour = consommerRetourRedirection(…)` est une variable de module. Elle garde le `RetourGoogle`, donc le jeton brut, hors de `CoffreJetonsMemoire`, pendant toute la vie de la page. Elle survit à `SeDeconnecter`, qui ne recharge pas la page. RED-05 interdit explicitement toute variable de module pour le fragment brut et le jeton. | Ne lier le retour à aucun nom de module. La première instruction de `main.tsx` doit devenir `const controleur = demarrerWeb(consommerRetourRedirection(NAVIGATION_RETOUR_NAVIGATEUR), { … });` : l'argument est évalué en premier, donc l'ordre de RED-02 est conservé. Garder le commentaire RED-02 au-dessus. Vérifier qu'aucune fermeture de `demarrerWeb` ne capture `retour` au-delà de l'appel à `executer`. | Ouverte | 1 |
| RC-US022-2 | Majeure | CR-01, CR-64 ; `conventions.md` §11.13 ; ST §12.1 | `tests/steps/` (fichiers ST §12.1 ; `tests/steps/synchronisation/etat-affiche.steps.ts` absent) | Une *step definition* doit être livrée au rang de la capacité qu'elle appelle (§11.13), et le §12.1 de la ST les place au rang 1 sauf mention contraire. Or seules les phrases des scénarios exécutés au rang 1 sont définies. Il manque : n° 2 (partie rang 1 : connexion des deux appareils), 4, 18 (« le réseau revient »), 23, 24, 25, l'extension « suite » du n° 26 (§12.3), 27, 28 (variante « ne sont plus présentes »), et 31 à 40, dont tout le fichier `etat-affiche.steps.ts` (n° 39 et 40, qui portent sur `construireIndicateur` et `construireBandeau`). Le contrôle des étapes inutilisées ne détecte pas ces absences. Aucun écart n'a été déclaré pour ce point. | Livrer ces définitions dans les fichiers du §12.1, selon l'implémentation décrite au §12.1 et au §12.3 de la ST v0.3.1 (n° 37 précisé par Q-BRU-2). Contrôle de sortie : un `cucumber-js --dry-run` sur `US-022-*.feature` ne laisse indéfinies que les phrases marquées « rang 2 », « rang 3 », « rang 5 » ou « rang 11 » (n° 29, 30 pour n > 0, 41, 42, 43) et le n° 44 (`@recette`). `pnpm cucumber:steps-inutilises` doit rester vert. | Ouverte | 1 |
| RC-US022-3 | Majeure | CR-41, CR-42, CR-16 ; ST §8 n° 12 | `src/composition/controleur-interface.ts:106-109`, `:202-204` | `continuerAvecGoogle` ne traite que `ConnexionImpossible` : un `EspaceInaccessible` de `SeConnecter` efface le message et n'affiche rien. `#apresSuppression` renvoie sans rien faire sur `!r.ok`, donc un `EspaceInaccessible` de `confirmer`, `confirmerPerte` ou `reessayer` est aussi silencieux. Le contrôleur, environ 200 lignes de logique d'état (chaînes de confirmation, `ERR-017`, toast), n'a aucun test et se trouve hors couverture du fait de l'exclusion de `src/composition/**`. | 1) Appliquer la ST v0.3.1 §8 n° 12 : sur `EspaceInaccessible` (connexion, suppression), afficher le toast `TST-ERREUR-ENREGISTREMENT` (message `ERR-014`) sur l'écran courant. Étendre `VueInterface.toast` en conséquence. 2) Ajouter `tests/unitaires/composition/controleur-interface.test.ts` (`UT-COMP-US-022-nn`, environnement node, `Application` assemblée avec les doublures du banc ou de `doublures-compte.ts`). Cas à couvrir : échec de connexion `ERR-00x` ; `EspaceInaccessible` → toast ; déconnexion directe puis confirmée (`CNF-DECONNEXION`) ; `CNF-SUPPR-DONNEES` → `CNF-SUPPR-DONNEES-PERTE` → `SUPPRIMEES` ; `SUPPRESSION_BLOQUEE` → « Réessayer » puis « Aller à la connexion » ; « Annuler » ; toast `TST-SAISIE-A-TERMINER`. | Ouverte | 1 |
| RC-US022-4 | Mineure | CR-22 (RCD-04) | `src/synchronisation/application/preparation-dossier-drive.ts:36-44` ; `src/infrastructure-google/reprise.ts:33-48` | La boucle de reprise existe deux fois. `executerAvecReprise` est livrée et testée mais n'est utilisée par aucun code de `src/`. `PreparationDossierDrive` en réécrit une copie sur `ErreurTransport`. | Rendre `executerAvecReprise` générique sur le type d'erreur, avec un paramètre `estTransitoire: (e: E) => boolean` (par défaut `estErreurTransitoire` pour `ErreurGoogle`). Faire reposer `PreparationDossierDrive.preparer` dessus, puis traduire l'erreur finale. UT-US-022-27 et les tests `executerAvecReprise` restent verts sans modification. | Ouverte | 1 |
| RC-US022-5 | Mineure | CR-52 ; ST §3.2 « Règles d'outillage », §9 | `eslint.config.js:78-84` | La restriction ne vise que `location.assign`. Trois appels quittent l'application sans être détectés : `window.location.assign(url)`, `location.replace(url)` et `location.href = url`. Une redirection hors de `FournisseurAuthWeb` resterait donc possible. | Ajouter à `proprietesInterdites` : `{ object: 'location', property: 'replace' }` et `{ object: 'location', property: 'href' }`, sans dispense ; `{ object: 'window', property: 'location' }`, sans dispense. Message : « Navigation hors de l'application : FournisseurAuthWeb seul (ST-US-022 §3.2) ». Aucun fichier actuel n'est touché : `retour-redirection.ts` ne lit que `pathname` et `search`, et `main.tsx` n'appelle que `location.reload`. | Ouverte | 1 |
| RC-US022-6 | Mineure | CR-64 ; `conventions.md` §11.7 (types de paramètres) | `tests/steps/compte/connexion.steps.ts:22, 32, 45, 59, 102, 113, 179` ; `tests/steps/commun/appareils.steps.ts:11, 19` | Les nouvelles définitions utilisent des expressions régulières locales, `(smartphone\|PC)` et `"([A-Z])"`, au lieu des types communs `{appareil}` et `{string}`. Elles dupliquent ainsi le type de paramètre et restreignent les noms de compte à une lettre. | Réécrire ces définitions en expressions Cucumber avec `{appareil}` et `{string}`. Le « que » facultatif devient du texte optionnel `(que )`. Ne garder une expression régulière que pour les pluriels « (s) » (§11.6). Les définitions approuvées au rang 0 ne sont pas concernées. | Ouverte | 1 |
| RC-US022-7 | Suggestion | CR-26, CR-55 | `src/compte/infrastructure/auth/lecture-identite.ts:10-15` ; `src/synchronisation/infrastructure/drive/transport-synchro-drive.ts:33-43` ; `src/compte/infrastructure/configuration.ts:42` | Les réponses Google et la configuration sont lues par des `as`. | Utiliser des schémas Zod (admis dans ces dossiers) pour userinfo et les réponses Drive, et une garde de type pour `NomEnvironnement`. | Ouverte | 1 |
| RC-US022-8 | Suggestion | CR-54 ; RED-06 | `src/compte/application/cas-usage/ouvrir-application.ts:163` | Le champ `code` vient du fragment, que n'importe quelle page peut forger, et il est journalisé tel quel. | Ne journaliser le code que s'il respecte `^[a-z_]{1,64}$`, et sinon écrire `code_inconnu`. | Ouverte | 1 |
| RC-US022-9 | Suggestion | CR-13 | `src/composition/web.ts:111`, `:114` | Un second `EtatReseauNavigateur` et un second `PlanificateurNavigateur` sont instanciés hors de `assembler`. | Réutiliser les instances du socle, par exemple en les exposant par `Application` ou en les créant dans `demarrerWeb` puis en les passant à `assembler`. | Ouverte | 1 |

## 5. Réponses aux écarts déclarés par Bruce

| # | Écart | Décision |
|---|---|---|
| 1 | `src/infrastructure-google/index.ts` créé pour respecter la règle `contextes-par-index` | **Accepté.** Il est cohérent avec §4.2 et la règle de dependency-cruiser. Reporté dans ST-US-022 v0.3.1 §3.2 n° 38 b. |
| 2 | 25 nouveaux fichiers dans `rangs-fichiers.json` ; règle `UT-COMP-US-022-\d+` au rang 1 dans `rangs-tests.json` | **Accepté.** Tous sont des fichiers `{ debut: 1, fin: 1 }`, cohérents avec le contenu livré ; UT-OUT-01 à 06 sont verts. La règle `UT-COMP-US-022` est celle que prévoit §11.14 ; je la valide telle qu'écrite. Les fichiers non prévus par la ST sont ajoutés au §3.2 (n° 15 b, 25 a, 26 b, 51 b). |
| 3 | jsdom, `@testing-library/dom`, `react`, `user-event`, et projet Vitest jsdom pour `presentation/ui` | **Accepté.** Conforme à `conventions.md` v0.4.3 §11.12 (Q-BEN-LOT001-7). Versions figées ; licences MIT ; dépendances de développement seulement ; osv-scanner vert (CR-28). |
| 4 | `appareilId` du banc tiré du générateur à préfixe (ST §12.3) au lieu des identifiants fixes du §11.11 | **Accepté.** La ST v0.3 §12.3 l'impose (Q-ST022-STA-3). L'ordre smartphone (`…-8001-…`) < PC (`…-8002-…`) est conservé, donc le départage des égalités d'`Hlc` reste connu. `conventions.md` §11.11 est aligné (v0.4.5). |
| 5 | Interface du rang 1 en HTML sémantique, sans Ionic | **Accepté à titre provisoire, inscrit en dette DT-006** (P2, remboursement au rang 2 avec le gabarit d'application et `libelle()`). Rôles ARIA, `data-etat`, `data-message` et gestion du focus sont conformes au §4.5 ; le contrôle fin revient à Steeve en E14. |
| Q-BRU-1 | Textes ERR, CNF et interface codés en dur en attendant `libelle()` (rang 2) : faut-il les remplacer au rang 2 ? | **Oui.** Au rang 2, dans la *pull request* qui livre `libelle()`, chaque texte du rang 1 est remplacé par `libelle(code, variables)`. Sont concernés les tableaux `MESSAGES` d'`ecran-connexion.ts`, les gabarits de `confirmations-compte.ts`, les tables de libellés des composants, le pluriel de `IndicateurSynchronisation` et le toast de `main.tsx`. Le pluriel quitte alors les composants (CR-16). Inscrit en **DT-006** et au §16 de la ST v0.3.1. |
| Q-BRU-2 | CT-AUTH-07 exige `AccesGoogleRevoque` alors que ST §12.3 dit « réaccorde l'accès » | **Bruce a raison de suivre le contrat ; la ST est alignée** (v0.3.1 §12.3). Avec un accès retiré, tout geste rend `AccesGoogleRevoque`, quel que soit le mode, comme Google sans nouveau consentement. Le réaccord n'est pas un comportement de la doublure. Il est joué par l'étape n° 37 « l'utilisateur se reconnecte avec le compte "A" » (S11) : `FauxGoogle` réaccorde l'accès du compte, l'utilisateur consentant de nouveau, puis `ReprendreSession` est appelé. « Fait le geste de reconnexion » (S23b) n'a pas de réaccord. |

## 6. Documents corrigés par Anthony (commits locaux de cette revue)

- `docs/04-specification-technique/ST-US-022.md` → v0.3.1 :
  - §3.2 : fichiers ajoutés ;
  - §8 n° 12 : affichage d'`EspaceInaccessible` ;
  - §12.1 n° 37 et §12.3 : Q-BRU-2 ;
  - §16 : DT-006 et `GardeSaisie` réel au rang 2.
- `docs/04-specification-technique/conventions.md` → v0.4.5 : §11.11, `appareilId` du banc.
- `docs/04-specification-technique/dette-technique.md` → v0.6 : DT-006.

## 7. Dette

| Id | Description | Décision |
|---|---|---|
| DT-006 | Libellés codés en dur et interface sans Ionic au rang 1 (Q-BRU-1, écart 5) | Inscrite, P2, remboursement au rang 2 |
| — | `GardeSaisie` toujours faux dans `web.ts:89` et dans le banc | Pas une dette au rang 1, qui n'a aucun formulaire. Le branchement réel est exigé au rang 2 (ST v0.3.1 §16) |
| DT-003, DT-004 | Contrôle périodique | DT-003 : aucun correctif publié de `deepmerge`, osv-scanner vert avec l'exception. DT-004 : jsx-a11y actif sur les nouveaux `.tsx`, lint vert. Inchangées |

## 8. Suite

Retour en E12 pour Bruce, sur RC-US022-1 à RC-US022-6. Les suggestions RC-US022-7 à 9 sont facultatives. La nouvelle revue portera seulement sur ces remarques et sur le différentiel introduit (`checklist-revue-code.md` §1.5).

---

# Nouvelle revue — passage 2

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-28 |
| Branche | `us/US-022-connexion` @ `a6a8fb7` |
| Périmètre | Remarques ouvertes RC-US022-1 à 6 ; différentiel `010676a..a6a8fb7` (6 commits de Bruce, 21 fichiers) ; question Q-BRU-3 (`checklist-revue-code.md` §1.5) |
| Passage | 2 |

## 9. Verdict du passage 2

**Changements requis**, sur un seul point : **RC-US022-10** (Q-BRU-3). Ce point découle de ma décision ci-dessous, pas d'un défaut de Bruce. RC-US022-1 à 6 sont **levées**. Les corrections sont propres, ciblées et testées, sans test affaibli. Le prochain passage ne portera que sur RC-US022-10.

## 10. Contrôles exécutés (Node 24, `a6a8fb7`, avant mes commits)

| Commande | Résultat |
|---|---|
| `pnpm test` | Vert : 351 tests, 266 non sélectionnés, 0 échec |
| `pnpm verifier` | Vert : formatage, lint, types, architecture, catalogue, tags, rangs, dépôt |
| `pnpm test:couverture` | Vert : lignes 97,23 %, branches 91,51 % |
| `pnpm cucumber` | Vert : 11 scénarios, 91 étapes |
| `pnpm cucumber:steps-inutilises` | Vert : 0 définition inutilisée |
| `cucumber-js --dry-run` sur `US-022-*.feature` (contrôle de sortie de RC-US022-2) | Restent indéfinies : n° 29, n° 30 pour n > 0, n° 41 à 43, et des phrases d'objectifs et d'échange avec le Drive qui relèvent des ST des rangs 2, 3 et 5. Aucune phrase du rang 1 ne manque |

Après mes commits, UT-US-022-62 et UT-COMP-US-022-107 sont **rouges** pour la raison attendue : l'issue reçue est `ECRAN_CONNEXION`, et le squelette d'`apresOuverture` ne pose pas de toast. C'est la phase rouge de RC-US022-10. UT-COMP-US-022-108 est déjà vert : il garde contre la régression (pas de toast sur `ECRAN_CONNEXION`, effacement au geste suivant). `pnpm verifier` et `pnpm cucumber` restent verts.

## 11. Suivi des remarques

| Id | Constat au passage 2 | Statut |
|---|---|---|
| RC-US022-1 | Dans `main.tsx`, la première instruction est `const controleur = demarrerWeb(consommerRetourRedirection(…), {…})`. Aucun nom de module ne reçoit le retour. Dans `demarrerWeb`, `retour` n'est lu qu'une fois, en argument d'`ouvrirApplication.executer`, et aucune fermeture ne le capture. Un verrou statique sur l'arbre syntaxique le garantit (UT-COMP-US-022-87 à 89). | **Levée** |
| RC-US022-2 | Les définitions sont livrées dans les fichiers du §12.1, dont `etat-affiche.steps.ts` (n° 39 et 40, sur `construireIndicateur` et `construireBandeau`). Le contrôle de sortie est satisfait (§10). | **Levée** |
| RC-US022-3 | `EspaceInaccessible` est signalé par le toast `TST-ERREUR-ENREGISTREMENT` à la connexion, à la confirmation de suppression et au « Réessayer » d'`ERR-017`. Le toast est effacé au geste suivant. `ApplicationInterface` (`Pick<Application, …>`) permet de tester le contrôleur sans l'assemblage complet (ISP). `controleur-interface.test.ts` couvre tous les cas demandés (UT-COMP-US-022-90 à 105). Le toast d'erreur porte `role="alert"`. | **Levée** |
| RC-US022-4 | `executerAvecReprise` est générique par surcharges : sans critère, `E = ErreurGoogle` ; avec `estTransitoire`, la famille d'erreurs est libre. La conversion `as` interne est sûre grâce à la première signature. `PreparationDossierDrive.preparer` repose sur cette fonction. UT-US-022-27 et les tests de reprise sont inchangés et verts. | **Levée** |
| RC-US022-5 | `location.replace`, `location.href`, `window.location`, `globalThis.location` et `document.location` sont interdits, sans dispense. Les deux dernières règles vont au-delà de la demande, à bon escient. La règle sur `location.href` en interdit aussi la lecture ; c'est acceptable, car aucun code ne la lit. | **Levée** |
| RC-US022-6 | Les nouvelles définitions sont des expressions Cucumber avec `{appareil}` et `{string}`. Deux cas gardent une expression régulière : les définitions passées par `etapeContexte`, `etapeAction` et `etapeAssertion` (préfixes, §11.6), et `appareils.steps.ts:56`, qui vient du rang 0 approuvé. | **Levée** |
| RC-US022-7 à 9 | Bruce n'a pas repris ces suggestions. Elles restent facultatives et ne conditionnent pas l'approbation. | Ouvertes (facultatives) |
| RC-US022-10 | Voir le §12 (Q-BRU-3). | **Ouverte** |

### Corrections du support de tests du rang 0 (commit `c5aeaf0`)

Les deux corrections sont **justes et acceptées**.
- **`prefixes.ts`.** cucumber-js compare l'arité de la fonction au nombre de groupes capturants, sans compter le paramètre du reste. `avecArite` fixe donc `length` d'après le motif complet. `nombreDeGroupes` exécute la source suivie d'une alternative vide (`source|`) sur la chaîne vide : la correspondance réussit toujours, et la longueur du résultat moins un donne le nombre exact de groupes capturants, quels que soient les ancres et les groupes non capturants. Le corps des trois fonctions est inchangé, au retrait près.
- **`convertirAppareil`.** La fonction devient idempotente, car le groupe de préfixe arrive déjà converti en `'pc'` par le type `{appareil}`. Sans cette correction, « sur le PC, » désignait le smartphone : ce défaut réel aurait faussé les scénarios à deux appareils. UT-COMP-US-022-106 le verrouille.

## 12. Décisions sur Q-BRU-3

**a) `EspaceInaccessible` à l'ouverture : nouvelle issue, à corriger dans ce rang (RC-US022-10).** La ST v0.3.1 exigeait le toast à l'ouverture (§8 n° 12), mais son §4.2 n'offrait aucun moyen de l'exprimer. Le défaut vient donc de ma ST, pas du code. La correction est petite et entièrement spécifiée. La renvoyer en dette laisserait une ouverture qui échoue en silence (CR-41), ce que la règle « jamais d'échec silencieux » interdit. ST-US-022 passe en **v0.3.2** :
- **§4.2 et §6.2, étape 5.** `IssueOuverture` reçoit la variante `{ type: 'ESPACE_INACCESSIBLE' }`. Je préfère une variante distincte à un champ optionnel sur `ECRAN_CONNEXION` : tout consommateur devra la traiter explicitement.
- **§8 n° 12.** Dans `demarrerWeb`, `ControleurInterface.apresOuverture(issue)` remplace l'appel direct à `rafraichir()` qui suit `executer`.

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US022-10 | Majeure | CR-41 ; ST v0.3.2 §4.2, §6.2 étape 5, §8 n° 12 | `src/compte/application/cas-usage/ouvrir-application.ts:21-24`, `:67` ; `src/composition/controleur-interface.ts` ; `src/composition/web.ts:112-120` | À l'ouverture, un espace local inaccessible rend `ECRAN_CONNEXION` sans aucun signal pour l'utilisateur. | 1) Ajouter `{ readonly type: 'ESPACE_INACCESSIBLE' }` à `IssueOuverture`. Quand `#ouvrirEspace` échoue, garder le journal `erreur` `EspaceInaccessible` et l'appel à `session.fermer()`, puis rendre cette issue sans appeler le fournisseur. Ne pas modifier le chemin `ECRAN_CONNEXION` (`#ecranConnexion`). 2) Ajouter au contrôleur `readonly apresOuverture = async (issue: IssueOuverture): Promise<void>`. Sur `ESPACE_INACCESSIBLE`, elle pose `toast = 'TST-ERREUR-ENREGISTREMENT'` ; dans tous les cas, elle appelle `rafraichir()`. 3) Dans `demarrerWeb`, remplacer `await controleur.rafraichir()` par `await controleur.apresOuverture(issue)`. UT-COMP-US-022-89 doit rester vert. 4) Rendre verts UT-US-022-62, UT-COMP-US-022-107 et 108 **sans les modifier**. Toutes les commandes du §10 doivent rester vertes, couverture comprise. | Ouverte | 2 |

**b) Bouton « Réessayer » du toast : le renvoi en dette est accepté, mais pas vers l'E14.** Au rang 1, l'utilisateur réessaie par le geste d'origine. Rien n'est perdu, puisque rien n'a été écrit. Le bouton dépend du composant toast Ionic, attendu au rang 2 avec DT-006. Je refuse en revanche le renvoi à l'E14 : cette étape contrôle mais ne livre rien, et un écart connu au guide d'ergonomie doit figurer au registre. L'écart est inscrit en **DT-007** (P2), à rembourser **au rang 2**. Le bouton rejouera le dernier geste échoué ; après l'ouverture, il appellera `executer({ type: 'AUCUN' })` puis `apresOuverture`. Les tests du contrôleur seront fournis en E10 du rang 2 (ST v0.3.2 §16).

## 13. Documents et tests livrés par Anthony (commits locaux de ce passage)

- `docs/04-specification-technique/ST-US-022.md` passe en v0.3.2 : §4.2, §6.2, §8 n° 12, §13 (UT-US-022-62) et §16 (DT-007).
- `docs/04-specification-technique/dette-technique.md` passe en v0.7 : ajout de DT-007.
- Tests : `tests/unitaires/compte/application/ouvrir-application.test.ts` (UT-US-022-62, rouge) et `tests/unitaires/composition/controleur-interface.test.ts` (UT-COMP-US-022-107, rouge, et 108).
- Squelettes sans implémentation, pour que les types restent valides : variante `ESPACE_INACCESSIBLE` dans `IssueOuverture` (`ouvrir-application.ts`), et `apresOuverture` réduite à `rafraichir()` dans `controleur-interface.ts`. `@non-implemente` n'est pas utilisé, car ces fichiers sont à `fin = 1` (`conventions.md` §11.14 a). Bruce les complète.

## 14. Suite

Retour en E12 pour Bruce, sur RC-US022-10 seulement. Le passage 3 ne portera que sur cette remarque et sur son différentiel.

---

# Nouvelle revue — passage 3

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-28 |
| Branche | `us/US-022-connexion` @ `0b3baba` |
| Périmètre | RC-US022-10 ; différentiel `5d412a6..0b3baba` : `54f227c` (correction) et `0b3baba` (fusion d'`origin/lot/LOT-001`, rang 0 fusionné, sans autre fichier modifié) |
| Passage | 3 |

## 15. Verdict final : **Approuvé**

| Commande (Node 24, `0b3baba`) | Résultat |
|---|---|
| `pnpm test` | Vert : 354 tests, 266 non sélectionnés, 0 échec |
| `pnpm verifier` | Vert |
| `pnpm test:couverture` | Vert : lignes 97,24 %, branches 91,51 % |
| `pnpm cucumber` | Vert : 11 scénarios, 91 étapes |
| `pnpm cucumber:steps-inutilises` | Vert : 0 définition inutilisée |

| Id | Constat | Statut |
|---|---|---|
| RC-US022-10 | Conforme à la ST v0.3.2. `OuvrirApplication.executer` rend `{ type: 'ESPACE_INACCESSIBLE' }` après le journal `erreur` `EspaceInaccessible` et `session.fermer()`, sans appeler le fournisseur. `apresOuverture` pose le toast sur cette seule issue, puis rafraîchit. `demarrerWeb` l'appelle à la place de `rafraichir()`. UT-COMP-US-022-89 est vert : le retour n'est toujours lu qu'une fois. UT-US-022-62, UT-COMP-US-022-107 et 108 sont verts, et leurs fichiers sont inchangés depuis `1406264`. | **Levée** |

Les deux points signalés sont **acceptés**.

- **Modification d'UT-COMP-US-022-62.** C'est un test complémentaire de Bruce, pas un test fourni en E10 (CR-60 ne s'applique pas). Le changement aligne son attente sur l'issue `ESPACE_INACCESSIBLE` que j'ai introduite en v0.3.2. L'assertion reste aussi stricte qu'avant (égalité exacte de l'issue et du journal), donc le test n'est pas affaibli. La seconde moitié (`RetourRedirectionRejete` sans session) est intacte.
- **`RetourRedirectionRejete` n'est plus consigné quand l'espace est inaccessible et qu'un retour est présent.** Ce comportement est voulu : le §6.2, étape 5, de la v0.3.2 ne prévoit que le journal `EspaceInaccessible`. L'ancien chemin écrivait le motif `SANS_DEPART`, ce qui était faux dans ce cas : une session est mémorisée et un départ valide peut exister. Le retour est abandonné sans être lu, donc le jeton n'est conservé nulle part (RED-05). L'entrée `erreur` suffit au diagnostic. Ce n'est pas une dette.

Les suggestions RC-US022-7 à 9 restent facultatives et ouvertes ; elles sont sans effet sur le verdict. La dette du rang est inscrite au registre : DT-006 et DT-007, à rembourser au rang 2. Le rang 1 peut passer à l'étape suivante du workflow.
