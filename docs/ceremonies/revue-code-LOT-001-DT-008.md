# Revue de code E13 — LOT-001, correctif DT-008 (CSP compatible avec Ionic)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-29 |
| Auteur | Benjamin |
| Branche | `fix/DT-008-csp` (PR #7, base `lot/LOT-001`), tête `ed5d301` |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD`, commit `ed5d301` : `index.html`, `src/main.tsx`, `src/compte/infrastructure/zod-sans-compilation.ts`, `tests/unitaires/compte/infrastructure/zod-sans-compilation.test.ts`, `tests/e2e/csp.e2e.ts`, `playwright.config.ts`, `package.json`, `tsconfig.json`, `.gitignore`, `tests/support/rangs/rangs-fichiers.json`. Le commit `c4d8c45` (ADR-014, DAT v0.11.6, `revue-code-LOT-001-rang2.md`) relève de Starck et n'est pas revu ici |
| Référentiel | ADR-014 (mesures M1 à M4), DEC-041 (option c), DAT v0.11.6 §7.1, `conventions.md` v0.4.5 §9.3, §11.12, §11.14, §12 |
| Passage | 1 |

## 1. Verdict : **Approuvé**

Le correctif applique fidèlement ADR-014 et DEC-041 : `'unsafe-inline'` est limité à `style-src`, et `script-src` reste inchangé (ni `'unsafe-inline'` ni `'unsafe-eval'`). La sonde de Zod est neutralisée au démarrage. Le test de fumée en navigateur réel est probant : je l'ai fait échouer volontairement (§3). Aucune remarque n'est bloquante. RC-DT8-1 est un renforcement de test à faire dans cette PR ou au rang 3. RC-DT8-2 demande d'inscrire au registre la dette liée à l'absence d'exécution en CI.

## 2. Contrôles exécutés (Node 24, tête `ed5d301`)

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` | Vert (format, lint, types, architecture, catalogue, tags, rangs, dépôt) |
| `pnpm test` | Vert : 101 fichiers, 489 tests passants, 219 ignorés (rangs futurs) |
| `TZ=UTC pnpm test:couverture` | Vert, seuils respectés (global : lignes 97,59 %, branches 91,78 %) |
| `pnpm cucumber` | Vert : 43 scénarios, 344 étapes |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome pnpm e2e` | Vert : 2 tests (build de production, `vite preview`) |
| CI de la PR #7 sur `ed5d301` | 6 jobs verts (`qualite`, `securite`, `build`, `tests` × 3 fuseaux) |

## 3. Efficacité du test de fumée (mutation, copie hors dépôt)

| Mutation | Résultat attendu | Résultat obtenu |
|---|---|---|
| `style-src 'self'` restauré et import de `zod-sans-compilation` retiré de `main.tsx` | Échec | **Les 2 tests échouent.** Le test 1 relève 1 violation `script-src` (`eval`, sonde Zod) et 14 violations `style-src-elem` : c'est exactement la mesure d'ADR-014. Le test 2 détecte que la directive `style-src` ne contient plus `'unsafe-inline'` |
| `expect(definis).toEqual(COMPOSANTS_IONIC)` au lieu de `toBeGreaterThan(0)` | Succès | Succès : les 14 composants listés sont définis dans le build (voir RC-DT8-1) |

Le test garde donc les deux mesures M1 et M2, ainsi que `script-src`.

## 4. Points signalés par Benjamin

| N° | Point | Avis |
|---|---|---|
| 1 | `z.config({ jitless: true })` dans `src/compte/infrastructure/zod-sans-compilation.ts`, premier import de `main.tsx` | **Validé.** Les imports ESM sont évalués dans l'ordre de déclaration. Le premier import s'exécute donc avant les modules qui construisent des schémas à l'évaluation (`base-technique.ts`, `stockage-local/schemas.ts`). La mutation du §3 le confirme : sans cet import, la violation `eval` revient. L'emplacement dans `compte/infrastructure` est imposé par la zone d'imports d'ESLint (Zod n'est autorisé que dans `compte/infrastructure` et `synchronisation/infrastructure`). Il est cohérent, puisque `compte` porte la base technique. Le commentaire du module explique l'effet de bord voulu et la contrainte d'ordre, ce qui suffit. UT-COMP-US-022-210 et 211 sont rattachés au rang 2 par la règle `UT-COMP-US-022-2\d\d` et n'entrent pas en collision avec 207 et 208, réservés à DT-010 |
| 2 | Test de fumée, `playwright.config.ts`, `pnpm e2e`, variable `PLAYWRIGHT_CHROMIUM_EXECUTABLE` | **Validé.** Le test porte sur le build de production servi en statique, ce que demande M3. Les variables `VITE_*` sont des valeurs de test, sans secret. La variable optionnelle n'altère pas le comportement par défaut. Le second test (lecture de la balise) est un garde-fou utile contre un retour arrière silencieux de la directive. Une réserve, voir RC-DT8-1 |
| 3 | Pas d'étape CI | **À consigner comme dette**, voir RC-DT8-2. Le plan du rang 12 ne suffit pas : ADR-014 fixe M3 « au plus tard au rang 3 », et un test qui ne tourne pas en CI ne protège pas contre une régression |
| 4 | `.gitignore` et `tsconfig.json` | **Validés.** `test-results/` et `playwright-report/` sont des artefacts de Playwright. L'ajout de `playwright.config.ts` à `include` soumet la configuration au typage strict (`pnpm types` vert). `tests/e2e` était déjà couvert par `tests`, et Vitest ne prend pas les fichiers `*.e2e.ts` |

## 5. Remarques

| N° | Bloquante | Localisation | Constat | Action demandée |
|---|---|---|---|---|
| RC-DT8-1 | Non | `tests/e2e/csp.e2e.ts:67` | `expect(definis.length).toBeGreaterThan(0)` accepte qu'un composant de la liste ne soit plus défini dans le build (par exemple après un changement d'import ou d'arbre de dépendances). Dans ce cas, ses styles ne seraient plus éprouvés et le test passerait en silence. Les 14 composants sont aujourd'hui tous définis (§3). | Remplacer par `expect(definis).toEqual(COMPOSANTS_IONIC)`. Un composant retiré de `src/` sera alors retiré explicitement de la liste. À faire dans cette PR si elle est reprise, sinon au rang 3 (Benjamin). |
| RC-DT8-2 | Non (consignation) | `.github/workflows/ci.yml` (absence d'étape `pnpm e2e`) ; `docs/04-specification-technique/dette-technique.md` | Le test de fumée n'est exécuté qu'à la main. Une régression de la CSP (nouvelle origine, nouveau script, nouvelle dépendance qui évalue du code) passerait la CI. Le navigateur manque dans l'environnement des agents, mais pas sur les exécuteurs GitHub (`pnpm exec playwright install --with-deps chromium`). | Inscrire **DT-012** au registre : catégorie Tests, priorité P2, impact « garde de la CSP non automatisée », plan « étape `pnpm e2e` ajoutée à la CI par Friday au **rang 3** (échéance de M3 dans ADR-014), préfiguration du job `ihm` du rang 12 ». Jusqu'au remboursement, le test de fumée est lancé à la main à chaque E13 qui touche `index.html`, `src/main.tsx` ou les dépendances, et son résultat est noté dans la revue. Pour ne pas créer de conflit avec la PR #6, qui modifie le même registre, j'inscris cette dette après la fusion de la PR #6, à l'E13 du rang 3. |

## 6. Sécurité

- **CSP** : `script-src`, `connect-src`, `frame-src`, `object-src`, `base-uri` et `form-action` sont inchangés. Seul `style-src` reçoit `'unsafe-inline'`, comme le prévoient DEC-041 et ADR-014. Le commentaire d'`index.html` renvoie à ADR-014.
- **M4** : le différentiel n'introduit ni `dangerouslySetInnerHTML`, ni `innerHTML`, ni `innerHTMLTemplatesEnabled`.
- **Secrets et jetons** : aucun. L'identifiant client OAuth de `playwright.config.ts` est fictif (`test.apps.googleusercontent.com`), et le test n'accède pas à Google.
- **Vérification restante (ADR-014, E14)** : console sans violation sur Android (PWA installée) et sur PC, flux GIS compris. Le test de fumée ne peut pas la couvrir, car il tourne hors réseau.

## 7. Dette

- **DT-008** : remboursée sur le fond par cette PR (M1, M2, M3). La mise à jour de sa ligne et de `conventions.md` §9.3 est faite dans la revue du rang 3 (PR #6), conformément à la consigne de Jarvis.
- **DT-012** : inscrite à l'E13 du rang 3 (RC-DT8-2 ; numéro DT-011 attribué entre-temps à la feuille ECR-011).
- Le statut d'ADR-014 reste « Proposé » jusqu'à l'E17, selon la convention de Starck.
