# Revue de code E13 — LOT-001, outillage DT-005 (non-régression de la couverture par fichier)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-29 |
| Auteur | Friday |
| Branche | `outillage/DT-005-couverture` (PR #5, base `lot/LOT-001`) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 6 fichiers, + 242, − 1 (OPT-7) |
| Référentiel | `conventions.md` v0.4.5 §12 (règle de non-régression), §11.14 (rangs des tests) ; `dette-technique.md`, ligne DT-005 |
| Passage | 1, puis 2 (§9) |

## 1. Verdict : **À reprendre**

L'architecture de la solution est bonne et je la retiens telle quelle : script pur et testé, étape CI isolée dans un arbre séparé, référence de base passée par variable d'environnement. Une remarque est bloquante. RC-DT5-1 : le traitement des métriques vides repose sur la valeur « Unknown », que notre chaîne ne produit jamais. Il en résulte un faux positif possible, qui bloquerait une PR à tort, et un comportement non spécifié. La correction est petite et bien localisée.

## 2. Contrôles exécutés (Node 24, tête de `outillage/DT-005-couverture`)

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` | Vert |
| `vitest run tests/unitaires/outillage/non-regression-couverture.test.ts` | Vert : 4 tests (UT-OUT-07 à 10) |
| `pnpm test:couverture` en local | Vert, 1 min 05. `coverage/coverage-summary.json` produit |
| CI de la PR #5 (run 40840328298) | 6 jobs verts. L'étape « Non-régression » de `tests (UTC)` s'est exécutée en **27 s** |
| Valeur de `pct` quand une métrique n'a aucun élément (rapport réel du dépôt) | **Jamais « Unknown »** : `lines` total 0 donne `pct: 0` (32 fichiers) ; `branches` total 0 donne `pct: 0` (32 fichiers) ou `pct: 100` (25 fichiers). « Unknown » n'existe que dans le résumé vide initial de `@vitest/istanbul-lib-coverage` 1.0.2 (`blankSummary`) et n'atteint pas le rapport par fichier |

## 3. Conformité à `conventions.md` §12

| Point | Appréciation |
|---|---|
| Périmètre : fichiers `src/` modifiés par la PR (`git diff --name-only --diff-filter=AMR base...HEAD -- src`) | Conforme. Un fichier renommé apparaît sous son nouveau chemin, donc sans référence : c'est acceptable |
| Métriques : lignes et branches | Conforme. Le §12 fixe ses seuils sur ces deux métriques, et les instructions et fonctions n'y ajoutent rien |
| Fichier nouveau ou non mesuré à la base : ignoré et signalé | **Correct.** Il n'y a pas de référence. Le fichier reste soumis aux seuils par motif, qui sont bloquants. Les fichiers exclus (`src/composition/**`, `src/main.tsx`) et les fichiers dont le rang `debut` est postérieur à celui de la base suivent la même règle |
| Fichier mesuré à la base mais absent du rapport de la PR : erreur | Correct et volontairement strict. Sortir un fichier de la mesure se décide en revue, pas en silence |
| Métrique « Unknown » ignorée | **Incorrect en l'état**, voir RC-DT5-1 |
| Comparaison stricte (`apres < avant`) sur des pourcentages tronqués à 2 décimales | Conforme. Une baisse de 0,01 point est une baisse |

## 4. Robustesse de l'étape CI

- **`fetch-depth: 0`** : il est indispensable pour `git worktree add origin/<base>` et pour `base...HEAD`. Les jobs `qualite` et `build` l'utilisent déjà (lignes 26 et 111), donc l'ajouter ici n'introduit aucun écart. Sur l'évènement `pull_request`, `HEAD` est le commit de fusion de test, et `base...HEAD` donne exactement les changements de la PR. La comparaison porte bien sur la tête de la base. Conforme.
- **Arbre de base sous `RUNNER_TEMP`** : le runner est éphémère et l'arbre n'est pas nettoyé, ce qui est sans conséquence. `pnpm install --frozen-lockfile` profite du magasin pnpm déjà rempli, ce qui explique les 27 s mesurées, bien en dessous de la minute annoncée.
- **Sécurité** : `github.base_ref` passe par `env` et n'est pas interpolé dans le script, donc il n'y a pas d'injection. Le code exécuté est celui de la base, dont la confiance est égale ou supérieure à celle de la PR. Aucun secret n'est utilisé.
- **Rapport de la base** : `--coverage.reporter=json-summary` est passé en ligne de commande. C'est indispensable, car la configuration de la base peut ne pas le produire. Correct.
- **Effet sur les PR existantes** : l'étape ne s'exécute que sur `pull_request` et dans le job UTC. Les PR vers `lot/LOT-001` comparent avec une base qui contient déjà les régressions passées : elles ne sont donc pas cassées. **Exception à anticiper** : la PR finale `lot/LOT-001` → `main` comparera avec `main`, où `bandeau.ts` existe dans sa version du rang 1. Voir §6.
- **Échec de la base** : si un test ou un seuil de la base échoue, l'étape échoue alors que la PR n'y est pour rien. C'est accepté : la base est verte par construction (protection de branche).

## 5. Remarques

| N° | Localisation | Remarque | Bloquante |
|---|---|---|---|
| RC-DT5-1 | `scripts/verifier-non-regression-couverture.ts:6`, `:11`, `:78` ; `tests/unitaires/outillage/non-regression-couverture.test.ts:70-99` | **Métriques vides.** Le rapport réel ne contient jamais « Unknown » (§2). Une métrique sans élément vaut `pct: 0` ou `pct: 100` selon le fichier. Deux conséquences : (a) **faux positif** : un fichier qui passe de lignes couvertes (100) à un contenu uniquement de types (total 0, `pct: 0`) est signalé en baisse « 100 → 0 », et la PR est bloquée à tort ; (b) le cas testé par UT-OUT-10 (`'Unknown'`) n'existe pas, donc le test ne protège rien. **Règle à appliquer** (je la fixe comme propriétaire du §12) : une métrique n'est comparée que si son `total` est **strictement positif à la base et dans la PR**. Base à 0 : les éléments sont nouveaux et relèvent des seuils par motif. PR à 0 : il ne reste rien à couvrir. **Correction attendue** : `type Metrique = { readonly total: number; readonly pct: number }`, condition `reference[cle].total > 0 && mesure[cle].total > 0 && apres < avant`, retrait de la mention « Unknown » de l'en-tête (ligne 6), remplacée par la règle ci-dessus. **Tests** : UT-OUT-10 reprend ses fixtures avec des métriques réelles (`src/vide.ts` : branches `{ total: 0, pct: 100 }` à la base et `{ total: 0, pct: 0 }` dans la PR, sans erreur). Ajouter **UT-OUT-11** : « une métrique vide d'un côté n'est pas comparée ». Cas 1 : lignes `{ total: 10, pct: 100 }` à la base et `{ total: 0, pct: 0 }` dans la PR, sans erreur. Cas 2 : branches `{ total: 0, pct: 100 }` à la base et `{ total: 4, pct: 50 }` dans la PR, sans erreur. Le fichier figure dans `compares` dans les deux cas. Le motif `UT-OUT-\d+` de `rangs-tests.json` place UT-OUT-11 au rang -1, sans autre modification. Le helper `entree` des tests prend désormais `total` | **Oui** |
| RC-DT5-2 | `scripts/verifier-non-regression-couverture.ts:114-115` | Les rapports sont convertis par `as RapportBrut` sans aucune validation. Si un rapport est absent ou malformé (par exemple si la commande de la base change), l'exécution se termine par une `TypeError` ou une `ENOENT` brute, au lieu d'un message explicite (`conventions.md`, gestion des erreurs explicite). Correction attendue : une garde minimale avant l'appel, qui vérifie que le fichier existe et que chaque entrée porte `lines` et `branches` avec `total` et `pct` numériques. Sinon, message `Rapport de couverture illisible : <chemin>` et `exit(2)`. La garde peut s'écrire avec RC-DT5-1, puisque le type change. Aucun test unitaire n'est exigé pour la partie CLI | Non (à traiter dans le même passage si possible) |

**Réponse de Friday à RC-DT5-1 (corrigée).** Une métrique est désormais `{ total, pct }`, et n'est comparée que si `total > 0` à la base et dans la PR (`avant.total > 0 && apres.total > 0 && apres.pct < avant.pct`). La mention « Unknown » de l'en-tête est retirée et remplacée par la règle. UT-OUT-10 reprend ses fixtures avec `total` (`src/vide.ts` : branches `{ total: 0, pct: 100 }` puis `{ total: 0, pct: 0 }`, sans erreur). UT-OUT-11 est ajouté avec les deux cas de la revue, et vérifie `compares` dans chacun. Le motif `UT-OUT-\d+` le range au rang -1, et `pnpm verifier:rangs` reste vert.

**Réponse de Friday à RC-DT5-2 (corrigée).** Le garde `estRapportValide` vérifie que chaque entrée porte `lines` et `branches`, avec `total` et `pct` numériques. Si le fichier est absent, n'est pas du JSON ou est malformé, `lireRapportOuArreter` écrit `Rapport de couverture illisible : <chemin>` sur la sortie d'erreur et sort avec le code 2. Ce garde s'applique aux deux rapports, celui de la base et celui de la PR. Il est testé par UT-OUT-12 (rapport complet accepté ; absent, tableau, `pct` « Unknown », `branches` sans `total` numérique refusés). J'ai aussi vérifié le comportement en ligne de commande : rapport malformé et rapport absent donnent le code 2, rapport valide donne le code 0.

Tests UT-OUT-07 à 10 : leur place est conforme. Ils se trouvent dans `tests/unitaires/outillage/`, au rang -1 par la règle `UT-OUT-\d+`, et s'exécutent donc toujours, comme UT-OUT-01 à 06 (§11.14). Leurs assertions sont exactes et leurs messages sont vérifiés en entier. Le seul défaut d'UT-OUT-07 à 09 est de ne pas porter `total`, ce que RC-DT5-1 corrige. L'écart de propriété est admis : je n'ai pas écrit ces tests d'outillage, mais je les reprends à mon compte après correction. Ils font foi.

## 6. Signal de Friday : régression de `bandeau.ts` au rang 2

**Constat confirmé.** `src/synchronisation/presentation/modeles-de-vue/bandeau.ts` a 100 % de lignes et 90,9 % de branches (30 sur 33) sur `lot/LOT-001`, contre 100 % de branches sur son parent. Les trois branches non couvertes ont été ajoutées par `bcd1149` (PR #4, rang 2, DT-006) dans `libellesBandeau` :

- ligne 79, `varianteDe` : la branche `b.variante` définie et la branche « avec-attente » (`BAN-CONSULTATION-SEULE` avec `n`) ;
- ligne 88, `variablesBandeau` : la variable `variante` présente.

Le seuil du motif (85 %) est respecté, mais la règle de non-régression du §12 ne l'est pas. Le contrôle manuel de l'E13 du rang 2 ne l'a pas vu, faute d'outil : c'est précisément l'objet de DT-005.

**Action requise**, sans reprise du rang 2 :

1. **Qui et quand** : Anthony, à l'**E10 du rang 3** (US-017 incrément 1, qui reprend la présentation de `synchronisation`). J'ajoute **UT-COMP-US-022-207 et 208** sur `libellesBandeau` : variante explicite du modèle, et variante « avec-attente » de `BAN-CONSULTATION-SEULE` avec `n`, en vérifiant le texte produit par `libelle()`. Benjamin n'a rien à coder : ces tests passent sur le code actuel.
2. **Échéance impérative** : avant la PR `lot/LOT-001` → `main`. Sans ces tests, la nouvelle étape bloquera cette PR, puisque `main` porte la version du rang 1 à 100 %.
3. **Traçabilité** : l'écart est inscrit au registre sous **DT-010** (catégorie Tests, P2), remboursement au rang 3.

## 7. Registre de la dette

- DT-005 : le statut « Remboursée » rédigé par Friday est accepté. Il prend effet à la fusion de la PR #5, après la levée de RC-DT5-1.
- DT-010 : inscrite (§6).
- L'en-tête et l'historique passent en **v0.10** (DT-005 remboursée, DT-010 inscrite).

## 8. Suite

Friday corrige RC-DT5-1, et RC-DT5-2 si possible dans le même passage. Au passage 2, je contrôle seulement ces deux remarques et les nouveaux changements.

## 9. Passage 2 (itération 2/2)

**Périmètre.** Différentiel `5708034..HEAD` (commits `50fe3b1` et `9d2c5f6`) : 3 fichiers, + 125, − 33. Je contrôle seulement RC-DT5-1, RC-DT5-2 et les nouveaux changements, sans nouvelle exigence sur le code déjà revu.

### Verdict : **Approuvé**

| Remarque | Contrôle | Statut |
|---|---|---|
| RC-DT5-1 | Le type `Metrique` vaut `{ readonly total: number; readonly pct: number }`, sans `string`. La condition est conforme à la règle fixée : `avant.total > 0 && apres.total > 0 && apres.pct < avant.pct`. L'en-tête ne mentionne plus « Unknown » et énonce la règle. UT-OUT-10 utilise des métriques réelles pour `src/vide.ts` (`{0, 100}` puis `{0, 0}`). UT-OUT-11 couvre les deux cas demandés et vérifie `compares`. Le helper `metrique(total, pct)` est en place. Les deux gardes sont protégées par des tests : un mutant qui retire `avant.total > 0` et un mutant qui retire `apres.total > 0` font chacun échouer UT-OUT-11. | **Levée** |
| RC-DT5-2 | `estRapportValide` est une garde de type sans `as`, qui refuse les tableaux, `null` et les métriques non numériques. `lireRapportOuArreter` s'applique aux deux rapports avant tout calcul. Le message correspond exactement à `Rapport de couverture illisible : <chemin>`, avec le code 2. J'ai vérifié en ligne de commande : rapport malformé (`pct` « Unknown ») → exit 2 ; rapport absent → exit 2. UT-OUT-12, non exigé, est accepté : il couvre la garde pure (le cas « absent » y est représenté par `undefined`, la lecture du fichier étant de la CLI). | **Levée** |

**Contrôles exécutés (Node 24).** `pnpm verifier` : exit 0 (lint, types, dépendances, catalogue, tags, rangs, hygiène du dépôt). `vitest run tests/unitaires/outillage/non-regression-couverture.test.ts` : 6/6 verts (UT-OUT-07 à 12). Aucun test n'a été affaibli : les assertions d'UT-OUT-07 à 10 sont inchangées et seules les fixtures portent désormais `total`. UT-OUT-11 et UT-OUT-12 sont rangés au rang -1 par le motif `UT-OUT-\d+`, et `verifier:rangs` reste vert.

**Nouveaux changements.** Aucun défaut. Aucune dette nouvelle.

**Suite.** La PR #5 peut être fusionnée dans `lot/LOT-001`. À la fusion, DT-005 passe au statut « Remboursée » (§7).
