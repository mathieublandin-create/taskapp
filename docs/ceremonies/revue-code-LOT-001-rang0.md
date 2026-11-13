# Revue de code E13 — LOT-001, rang 0 (socle d'écriture)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony (responsable technique) |
| Date | 2026-10-28 |
| Branche | `us/SOCLE-ecriture`, *pull request* n° 1 (base `lot/LOT-001`) |
| Périmètre | `git diff origin/lot/LOT-001...HEAD` (DEC-040, OPT-7) : les 8 commits de Benjamin (`a5afcff` à `868d0bf`) et les 3 commits CI de Jarvis (`5257898`, `04ccf1e`, `8a67a8f`) |
| Référentiels | `ST-socle-ecriture.md` v0.3 ; `conventions.md` §6, §9, §11, §12, §14 ; `checklist-revue-code.md` v0.3 ; RL-LOT-001-A5 (Starck) |
| Passage | 1 |

## 1. Verdict

**Changements requis.**

| Gravité | Nombre | Remarques |
|---|---|---|
| Bloquante | 0 | — |
| Majeure | 2 | RC-SOCLE-1, RC-SOCLE-2 |
| Mineure | 4 | RC-SOCLE-3 à RC-SOCLE-5 ouvertes ; RC-SOCLE-6 acceptée en dette (DT-005) |
| Suggestion | 4 | RC-SOCLE-7 à RC-SOCLE-10 |

Le socle est de bonne facture : il respecte la ST (composants, signatures, transaction confirmée à `complete`, durabilité stricte, projection mémorisée par version) et les couches. Aucun test n'est affaibli. Les deux remarques majeures sont courtes à corriger. Après leur correction et celle des mineures ouvertes, une nouvelle revue limitée à ces points suffit (`checklist-revue-code.md` §1.5).

## 2. Contrôles exécutés

### 2.1 Localement, sous Node 24.22.1, sur `8a67a8f`
| Commande | Résultat |
|---|---|
| `pnpm test` | Vert : 149 tests exécutés (rang 0 et outillage), 353 non sélectionnés (rangs suivants), 0 échec. Vert aussi sous `TZ=Pacific/Auckland CI=true`. |
| `pnpm types` | Vert |
| `pnpm lint` | Vert, 0 avertissement |
| `pnpm architecture` | Vert : 0 violation (173 modules) |
| `pnpm verifier` | Vert : formatage, lint, types, architecture, catalogue, tags, rangs, dépôt |
| `pnpm test:couverture` | Vert : lignes 98,1 %, branches 89,2 % ; seuils du §12 respectés |
| `pnpm cucumber` | Vert : aucun scénario exécutable au rang 0 (`rangs-scenarios.json`), cucumber-js non lancé, comme prévu |
| `pnpm cucumber:steps-inutilises` | Vert : 0 définition inutilisée |
| `pnpm build` | Vert ; `sw.js` généré mais non enregistré (Q-BEN-E12-10) |

### 2.2 GitHub Actions
Sur `8a67a8f`, les six contrôles sont verts : `qualite`, `tests (UTC)`, `tests (Pacific/Auckland)`, `tests (America/New_York)`, `securite`, `build`. Sur `868d0bf` (dernier commit de Benjamin), `securite` était rouge : la commande `gitleaks git` n'existe pas dans gitleaks 8.9.0. Jarvis l'a corrigé (8.28.0, `5257898`).

### 2.3 Tests du rang 0 non affaiblis (`conventions.md` §11.5)
- Aucun fichier de test fourni en E10 n'est modifié ni supprimé dans le diff. Les seuls fichiers modifiés sous `tests/` sont des doublures et des éléments de support dont le squelette était à réaliser par Benjamin (`HorlogeSimulee`, `PlanificateurSimule`, `TempsSimule`, `GenerateurIdentifiantsSequentiel`) et les fichiers de rang.
- Tests exécutés et verts : UT-SOC-01 à 46 (71 cas, aucun identifiant manquant), CT-DEPOT-01 à 07 sur `DepotLocalDexie`, UT-US-022-48 et 49, UT-OUT-01 à 06. S'y ajoutent 63 cas complémentaires `UT-COMP` de Benjamin.
- Aucun `skip`, `only`, `todo` ni `@wip`. Aucune exclusion de couverture locale. Seuils non relâchés.

### 2.4 Condition A5 de Starck (RL-LOT-001-A5)
**Remplie**, sous réserve de RC-SOCLE-2 qui porte sur le §14.1 et non sur la liste A5.
- Les dépendances sont figées en versions exactes.
- `ci.yml` contient les contrôles demandés : lint, types, Vitest, cucumber-js `strict` limité par le rang, dependency-cruiser, gitleaks et osv-scanner. Il ajoute formatage, catalogue, tags, rangs, dépôt, trois fuseaux, couverture, licences, Semgrep et build.
- Toute la CI est verte.

Jarvis peut demander l'activation de la protection de `main` et de `lot/*` (DEC-029) dès la fusion. Contrôles requis : `qualite`, `tests (UTC)`, `tests (Pacific/Auckland)`, `tests (America/New_York)`, `securite`, `build`.

### 2.5 Exceptions de sécurité posées par Jarvis
- **`.gitleaksignore`** : **validée**. Il s'agit du jeton factice `jeton-test-0123456789` d'un test du PoC, à l'empreinte exacte (commit, fichier, règle, ligne). Ce n'est pas un secret, il n'y a rien à révoquer.
- **`osv-scanner.toml`, GHSA-gcqx-w48m-w2h4 (`deepmerge` 4.3.1)** : **validée**, jusqu'au 2027-01-31.
  - J'ai vérifié la chaîne dans `pnpm-lock.yaml` : `vite-plugin-pwa` > `workbox-build` > `@rollup/plugin-node-resolve` 16.0.3 > `deepmerge`. C'est une dépendance de développement seulement.
  - Le paquet est absent de `dist/` après `pnpm build`.
  - La vulnérabilité est de gravité moyenne et ne bloquerait pas au sens du §14.1 (haute et critique).
  - L'exception est inscrite au registre sous **DT-003**.

## 3. Remarques

| Id | Localisation | Critère | Gravité | Constat | Correction attendue | Statut |
|---|---|---|---|---|---|---|
| RC-SOCLE-1 | `src/synchronisation/infrastructure/stockage-local/schemas.ts:277-280`, `:290-293`, `:301`, `:312`, `:359` ; `:68-92` | CR-26, CR-27, CR-46 ; `conventions.md` §6.2 (« `unknown` aux frontières », `as` hors constructeurs interdit), RCD-10 ; ST §5.1 | **Majeure** | Les lignes relues passent par Zod, puis sont converties par `as unknown as` en `Hlc`, `ContexteCausal`, `RegistreQuelconque`, `EvenementJournal`, `CleInformation` et `IdAppareil`. Les types marqués sont donc fabriqués sans leurs constructeurs, et plusieurs invariants ne sont pas contrôlés. Exemples : `appareil` d'un HLC et `appareilId` validés en simple `guid` au lieu d'UUID v7 (`IdAppareil.depuisUuid`) ; `compteur` non borné par `COMPTEUR_HLC_MAX` ; `TACHE/estimationInitiale` admis comme tout entier positif au lieu d'une `Duree` (`Duree.calculee`) ; `id` d'un registre en `z.string()` ; identifiants du journal non contrôlés. Une donnée locale altérée entre ainsi dans le domaine avec un type qui ment. | Construire les valeurs du domaine dans les `transform` Zod, par leurs constructeurs : `Instant` et `DateCalendaire` (déjà fait), `IdAppareil`, `IdObjectif`, `IdTache`, `Duree`, `idEvenement`, et une fonction de construction d'`Hlc` qui vérifie le compteur. Puis supprimer les `as unknown as`. S'il reste une conversion indispensable entre la sortie Zod et une union du domaine (par exemple `RegistreQuelconque`), la garder **unique**, dans une fonction nommée et commentée, et l'appliquer uniquement à des champs déjà construits. Typer `VALEURS_STOCKEES` par `type/champ` (`satisfies`) plutôt qu'en `Record<string, z.ZodType>`. Ajouter un test `UT-COMP` par invariant : compteur > 65 535, `appareil` non v7, estimation non multiple de 30, chacun rejeté avec `DonneesLocalesIllisibles`. | Ouverte |
| RC-SOCLE-2 | `.github/workflows/ci.yml:119` | CR-50, CR-55 ; `conventions.md` §14.1 (SAST) | **Majeure** | Semgrep s'exécute avec `p/typescript` et `p/security-audit`. Le §14.1 impose `p/typescript`, `p/react`, `p/owasp-top-ten` et `p/secrets`. | Utiliser `--config p/typescript --config p/react --config p/owasp-top-ten --config p/secrets`. `p/security-audit` peut être conservé en plus. Le contrôle doit rester bloquant et vert. | Ouverte |
| RC-SOCLE-3 | `src/synchronisation/infrastructure/depot-local-dexie.ts:196` | CR-41 ; ST §8 n° 4 | Mineure | Une table `meta` illisible à l'ouverture (`decoderMeta` renvoie `undefined`) lève `ErreurProgrammation` (« appartient à un autre appareil »). La ST prévoit `DonneesLocalesIllisibles` pour une ligne relue invalide. L'erreur levée et son message sont donc faux pour ce cas. | Distinguer les deux cas. Une `meta` illisible donne `Echec({ type: 'DonneesLocalesIllisibles' })` dans `lire` et `appliquer`, et l'ouverture peut être retentée. Un `appareilId` lisible mais différent garde l'`ErreurProgrammation`. Ajouter le test `UT-COMP` correspondant. | Ouverte |
| RC-SOCLE-4 | `src/main.tsx:7` | CR-42 ; ST §3 n° 4 (« seule classe d'erreur levée ») | Mineure | `throw new Error(…)` dans `src/`. | Lever `ErreurProgrammation`. | Ouverte |
| RC-SOCLE-5 | `.github/workflows/ci.yml:8-9` ; `package.json:8` | `conventions.md` §14.3 ; DT-004 | Mineure | (a) Le déclencheur `push` ne couvre que `lot/**`, alors que le §14.3 demande `us/**`, `ano/**`, `lot/**` et `main`. (b) jsx-a11y est utilisé avec ESLint 10 sans acceptation explicite du pair : pnpm émet un avertissement silencieux (Q-BEN-E12-7). | (a) Utiliser `branches: ['us/**', 'ano/**', 'lot/**', 'main']`. Le groupe `concurrency` existant évite les doublons d'exécution. (b) Ajouter `"pnpm": { "peerDependencyRules": { "allowedVersions": { "eslint-plugin-jsx-a11y>eslint": "10" } } }` à `package.json` et régénérer le verrou si nécessaire. | Ouverte |
| RC-SOCLE-6 | `.github/workflows/ci.yml` (job `tests`) | `conventions.md` §12 (non-régression de la couverture par fichier) | Mineure | La comparaison de la couverture avec la branche cible n'est pas automatisée. | Acceptée en dette **DT-005** : à livrer au plus tard au rang 2. | Acceptée en dette (DT-005) |
| RC-SOCLE-7 | `src/synchronisation/domaine/planifier-ecritures.ts:92-97` | CR-26 | Suggestion | `ecrire` reçoit `valeur: unknown` et recompose le registre par `as RegistreQuelconque`. | Rendre `ecrire` générique sur la clé (`<T, C>(cle: CleDe<T, C>, valeur: ValeursParChamp[T][C])`) pour que le compilateur vérifie la paire clé-valeur. | Ouverte |
| RC-SOCLE-8 | `tests/doublures/planificateur-simule.ts:48-53` | CR-43 | Suggestion | Une action périodique de période nulle boucle sans fin dans `executerEchus`. | Refuser une période ≤ 0 à la programmation (`RangeError`), comme `TempsSimule.avancer`. | Ouverte |
| RC-SOCLE-9 | `eslint.config.js:233` | `conventions.md` §14.2 | Suggestion | Les globales Node sont déclarées pour tout le dépôt, `src/` compris, alors que `src/` est du code de navigateur. | Réserver `globals.node` à `scripts/`, aux fichiers de configuration et à `tests/`, et appliquer `globals.browser` à `src/`. | Ouverte |
| RC-SOCLE-10 | `tests/support/temps.ts:9` | `conventions.md` §7.1, §11.7 | Suggestion | Le type local `HeureLocale` (`{ heures, minutes }`) porte le nom du type marqué `HeureLocale` (`HH:MM`) des conventions. | Renommer en `HeureMurale` (ou équivalent), ou s'aligner sur le type de `src/` quand il sera créé. | Ouverte |

Points vérifiés sans remarque :
- `DepotLocalDexie` : durabilité stricte, confirmation à `complete`, aucun `await` hors Dexie dans la transaction, traduction en `EcritureLocaleImpossible`, exception du calcul propagée telle quelle, rechargement sur changement de `version`.
- `ServiceEtatLocalTransactionnel` : conforme au §6.8. Tri du journal par HLC puis identifiant, sans `localeCompare`.
- HLC, contexte causal, pierres tombales et index des écritures en attente : conformes aux §6.1 à §6.5.
- Adaptateurs : seuls autorisés à lire l'heure, l'aléatoire et les minuteries, avec exceptions ESLint par blocs `files`. Tirage sans biais de modulo.
- Masquage du journal technique conforme au §9.4.
- `index.html` : CSP sans `unsafe-*`, `no-referrer`.
- `.gitignore` complet au sens du §9.1, `.env.example` sans valeur, aucun secret.
- Mesure de performance PERF-SOC-01 (ENF-T-02, moins de 100 ms avec 5 000 tâches) : passée en CI, en indicatif.

## 4. Réponses aux questions de Benjamin (Q-BEN-E12)

| Question | Décision | Fichiers modifiés par Anthony |
|---|---|---|
| **Q-BEN-E12-1** — Ajouts à `rangs-fichiers.json` et `rangs-tests.json` | **Acceptés tels quels.**<br>- Les six fichiers ajoutés à `rangs-fichiers.json` ont des rangs exacts. Les trois adaptateurs, `schemas.ts` et `main.tsx` ont `debut` 0. `composition/web.ts` et `main.tsx` ont `fin` 1, car ils sont complétés au rang 1 sans squelette.<br>- La règle `UT-COMP-\d+` au rang 0 est acceptée.<br>- **Pour la suite**, les tests complémentaires seront nommés `UT-COMP-<US>-nn` (par exemple `UT-COMP-US-001-03`). J'en ajouterai la règle à `rangs-tests.json` à l'E13 de la *pull request* qui les introduit. Un `UT-COMP-nn` sans US reste réservé au socle. | `conventions.md` §11.14 |
| **Q-BEN-E12-2** — `setupFiles` IndexedDB et seuils dans `vitest.config.ts` | **`setupFiles` accepté.** `indexeddb-fake.ts` ne pose que `IDBKeyRange` en global, comme un navigateur. Chaque appareil garde sa propre `IDBFactory` et aucun code testé n'est remplacé. C'est conforme au §4.4 de la ST.<br>**Seuils : complétés par moi.** Il manquait `presentation/modeles-de-vue`, `commun/presentation/{format,messages}`, `presentation/ui` et `infrastructure-google`, alors que `src/infrastructure-google/reprise.ts` est couvert dès le rang 0. Tous les seuils du §12 sont désormais déclarés. Un motif sans fichier livré est sans effet. J'ai vérifié que la couverture reste verte. | `vitest.config.ts`, `conventions.md` §12 |
| **Q-BEN-E12-3** — Cycle `actions → vue-metier → refus` (rang 2) | **Exemption acceptée, et inscrite au §11.14 (b).** dependency-cruiser exempte des règles « orphelin » et « cycle » les fichiers de `debut > rangCourant`.<br>Ce cycle est purement de types et il vient de mes squelettes E10. **Je le romprai moi-même avant l'E12 du rang 2**, dans le cadre de ST-US-001, en déplaçant `ActionObjectif` et `ActionTache` hors du chemin de `refus.ts`. L'exemption tombe d'elle-même au rang 2. | `conventions.md` §11.14 |
| **Q-BEN-E12-4** — Six codes ajoutés à `codes.ts` | **Acceptés.** `ALR-015`, `ERR-017`, `EVD-OBJECTIFS-TOUS-ATTEINTS`, `SYN-FEUILLE-STOCKAGE`, `SYN-REDIRECTION` et `TST-SAISIE-A-TERMINER` figurent tous au catalogue du guide d'ergonomie (§6.6), et `verifier:catalogue` est vert.<br>`codes.ts` reste un fichier du rang 2 : seule sa liste suit le catalogue de Steeve dès maintenant. | — |
| **Q-BEN-E12-5** — Tags `@DEC-nnn` dans `verifier-tags` | **Admis et inscrits au §11.8.** C'est un tag de traçabilité facultatif posé par Pepper (16 scénarios portent `@DEC-034`), sans effet sur les profils. `verifier-tags.ts` est conforme. | `conventions.md` §11.8 |
| **Q-BEN-E12-6** — Heure inexistante : « échec » (ST) ou « décalage » (conventions) | **Les deux font foi, chacune dans sa portée. Il n'y a pas de contradiction.**<br>- Le **décalage** (règle « compatible ») s'applique au code de `src/` (`instantDeReference`, lots ultérieurs).<br>- L'**échec** s'applique au seul banc de test, pour l'étape « nous sommes le … » : glossaire d'étapes v1.4 §4, ST §12 n° 1, et deuxième puce du §7.1 des conventions.<br>`tests/support/temps.ts` est donc correct. J'ai explicité la portée des deux règles dans les deux documents. | `conventions.md` §7.1, `ST-socle-ecriture.md` §12 |
| **Q-BEN-E12-7** — jsx-a11y face à ESLint 10 | **jsx-a11y 6.10.2 est conservé sous ESLint 10. Le retour à ESLint 9 est refusé.**<br>J'ai vérifié que le greffon n'appelle aucune API retirée par ESLint 10 (`context.getScope`, `getSourceCode`, `getAncestors`, `getFilename`). Conditions :<br>- acceptation explicite du pair dans `package.json` (RC-SOCLE-5 b) ;<br>- axe dans Playwright en complément ;<br>- dette **DT-004**, levée dès qu'une version compatible paraît (Dependabot). | `conventions.md` §14.2, `dette-technique.md` |
| **Q-BEN-E12-8** — `JournalTechniqueLocal` au rang 0 | **Accepté.** Au rang 0 : le masquage défensif (UT-US-022-48) et un puits injecté.<br>Au rang 1, ST-US-022 ajoute le tampon persistant de 7 jours (base technique) et la désactivation de `debug` en production.<br>Les autres adaptateurs de ST-US-022 S5 réalisés en avance (`PlanificateurNavigateur`, `EtatReseauNavigateur`, `SourceAleatoireCrypto`) sont acceptés au rang 0 : ils sont spécifiés, testés et sans squelette. | — |
| **Q-BEN-E12-9** — Type d'événement inconnu | **Comportement actuel accepté : une ligne de journal de type inconnu donne `DonneesLocalesIllisibles`.**<br>Jusqu'à l'incrément 3 d'US-017, le journal local n'est écrit que par cette version. La variante `{ type: 'INCONNU', brut }` ne concerne que les fichiers d'un appareil plus récent lus depuis le Drive (ANT-19). Elle est ajoutée par ST-US-017 à l'incrément 4.<br>J'ai corrigé le §5.1 de la ST, qui laissait croire qu'elle était due dès le rang 0. | `ST-socle-ecriture.md` §5.1 (v0.3.1) |
| **Q-BEN-E12-10** — Scénarios `@recette`, `sw.js`, avertissement Vite | (a) **Rang 14 accepté** pour US-022 S13b et US-018 S09b. Il code la ligne « Recette (E14) » de l'ordre de réalisation ; c'est inscrit au §11.13.<br>(b) **Accepté** : `sw.js` est généré mais non enregistré (`injectRegister: false`) jusqu'au rang 12, et rien n'est déployé avant.<br>(c) **Corrigé par moi** : `vitest.config.ts` importe `selection-rangs.ts` avec son extension, et `tsconfig.json` admet `allowImportingTsExtensions` (compatible avec `noEmit`). L'avertissement du chargeur de configuration de Vite a disparu. | `conventions.md` §11.13, `vitest.config.ts`, `tsconfig.json` |

## 5. Points à ma charge (hors code de Benjamin)
- Rompre le cycle de types de Q-BEN-E12-3 avant l'E12 du rang 2 (ST-US-001).
- `ST-socle-ecriture.md` §8, colonne « Journalisation » : `DepotLocalDexie` ne reçoit pas de `JournalTechnique` (signature du §4.4). La journalisation des cas n° 3 et 4 se fera à la frontière, dans la composition, au rang 1. Je le préciserai dans ST-US-022 avant l'E12 du rang 1. Aucune remarque n'est adressée à Benjamin sur ce point.

## 6. Suite
Benjamin corrige RC-SOCLE-1 à 5. Les suggestions RC-SOCLE-7 à 10 sont à sa discrétion. Il demande ensuite une nouvelle revue, qui portera uniquement sur ces remarques et sur le nouveau différentiel.

---

## 7. Passage 2 — nouvelle revue (2026-10-28)

**Périmètre** : `git diff 819c589..b234c69`, soit les commits `9867048`, `ced759f` et `b234c69` de Benjamin. Conformément à `checklist-revue-code.md` §1.5, la revue porte uniquement sur les remarques ouvertes et sur ce différentiel.

### 7.1 Contrôles
- Sous Node 24, sur `b234c69`, sont verts : `pnpm types`, `lint`, `architecture`, `verifier` et `test:couverture`. Les tests passent à 165 verts, dont 16 nouveaux `UT-COMP`, avec 0 échec ; c'est aussi le cas sous `TZ=America/New_York`. Couverture : lignes 97,5 %, branches 90,5 %, seuils du §12 respectés.
- GitHub Actions sur `b234c69` : les 6 contrôles sont verts, y compris `securite` avec les nouveaux jeux Semgrep.
- Aucun test existant n'est modifié ni supprimé. Les ajouts sont `tests/integration/synchronisation/depot-local-dexie.relecture.test.ts` (UT-COMP-100 à 115) et le support `tests/support/ligne-brute.ts`.

### 7.2 Statut des remarques
| Id | Statut | Constat |
|---|---|---|
| RC-SOCLE-1 | **Close** | La relecture construit désormais les valeurs par les constructeurs du domaine : `IdAppareil`, `IdObjectif`, `IdTache`, `creerHlc` (compteur borné), `Duree.calculee`, `lireIdEvenement`, `Instant` et `DateCalendaire`. Les `as unknown as` ont disparu. `VALEURS_STOCKEES` est typé par `satisfies SchemasDesValeurs`. Le journal est discriminé par type d'élément. Chaque invariant a un test de rejet. **L'écart des trois conversions restantes est validé** : il entre dans le cadre fixé par la remarque (« une conversion unique, nommée, commentée, sur des champs déjà construits ») ou relève d'une contrainte du compilateur. (1) `assemblerRegistre` (`schemas.ts`) est le seul rétablissement de l'union `RegistreQuelconque`, appliqué à une clé, une valeur et une écriture déjà validées. (2) `sansIndefini` est un utilitaire générique imposé par `exactOptionalPropertyTypes` ; il ne fabrique aucun type marqué. (3) `as CleInformation` dans `lireCle` n'intervient qu'après la construction de l'identifiant selon son type, la vérification du champ connu et la cohérence avec la colonne `cle`. **UUID v7 en minuscules à la relecture : accepté.** C'est la forme produite par `GenerateurUuidV7` et par la doublure séquentielle ; une ligne qui ne l'a pas a été altérée. |
| RC-SOCLE-2 | **Close** | Semgrep s'exécute avec `p/typescript`, `p/react`, `p/owasp-top-ten` et `p/secrets`, plus `p/security-audit`. Le contrôle est bloquant et vert. |
| RC-SOCLE-3 | **Close** | Une `meta` illisible donne `Echec({ type: 'DonneesLocalesIllisibles' })` dans `lire` et `appliquer`, sans mémoriser l'échec : l'ouverture peut être retentée. Un appareil différent lève toujours `ErreurProgrammation`. Testé par UT-COMP-115. |
| RC-SOCLE-4 | **Close** | `src/main.tsx` lève `ErreurProgrammation`. |
| RC-SOCLE-5 | **Close** | (a) Déclencheurs `push` : `us/**`, `ano/**`, `lot/**`, `main`. (b) `pnpm.peerDependencyRules.allowedVersions` pour jsx-a11y et ESLint 10, conformément à DT-004. |
| RC-SOCLE-6 | Acceptée en dette (DT-005) | Inchangé. |
| RC-SOCLE-7 à 10 | Suggestions non retenues | Laissées à la discrétion de Benjamin (sans effet sur le verdict). |

**Observation, sans remarque.** Les constructeurs de `src/commun/domaine/identifiants.ts` vérifient la forme UUID mais pas la version 7, alors que la relecture l'exige. Le fichier, déjà approuvé, n'est pas concerné par une exigence nouvelle (§1.5). Je propose de l'aligner sur la relecture quand un rang ultérieur le touchera.

### 7.3 Verdict final du rang 0

**Approuvé.** Aucune remarque bloquante, majeure ni mineure n'est ouverte. La branche `us/SOCLE-ecriture` peut être fusionnée dans `lot/LOT-001` par commit de fusion (`conventions.md` §13.1). Jarvis peut ensuite demander l'activation de la protection des branches (DEC-029), avec les contrôles requis listés au §2.4.
