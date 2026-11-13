# Revue de code E13 — LOT-001, outillage DT-012 (test de fumée de la CSP en CI)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-30 |
| Auteur | Friday |
| Branche | `outillage/DT-012-e2e-ci` (PR #8, base `lot/LOT-001` à `9a8fde2`), tête `87787d9` |
| Périmètre | Différentiel `9a8fde2..87787d9` (DEC-040, revue sur le différentiel seul), commits `1b204e5` et `87787d9` : job `e2e` de `.github/workflows/ci.yml` ; ligne DT-012 de `docs/04-specification-technique/dette-technique.md`. Lecture ciblée de `playwright.config.ts` et du script `e2e` de `package.json` pour vérifier le fonctionnement en CI |
| Référentiel | ADR-014 (mesure M3, « au plus tard au rang 3 »), RC-DT8-2 (`revue-code-LOT-001-DT-008.md`), `conventions.md` v0.4.6 §9.5, §11.12, §14.1, §14.3, DEC-029 |
| Passage | 1 |

## 1. Verdict : **Approuvé**

Le job `e2e` rembourse DT-012 et applique la mesure M3 d'ADR-014 dans le délai fixé (rang 3). Il est vert sur la PR #8. Aucune remarque n'est bloquante. J'ai corrigé moi-même les deux points documentaires (RC-DT12-1 et RC-DT12-2). RC-DT12-3 revient à Friday et peut attendre le rang 12. RC-DT12-4 est une action de Jarvis sur la protection des branches.

## 2. Fonctionnement du job en CI

| Point | Constat | Avis |
|---|---|---|
| Actions | `checkout`, `pnpm/action-setup` et `setup-node` sont épinglées par empreinte, avec les mêmes empreintes que les autres jobs. Node est lu dans `.nvmrc` et le cache pnpm est actif | Conforme à §9.5 |
| Navigateur | `pnpm exec playwright install --with-deps chromium` installe le Chromium attendu par `@playwright/test` 1.64.1, la version figée par le lockfile. Les dépendances système sont installées sur l'exécuteur | Conforme. Sur l'exécuteur, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` est absente : `playwright.config.ts` ne surcharge donc pas `executablePath` et utilise le Chromium installé. La variable reste réservée aux postes sans ce Chromium, comme l'environnement des agents |
| Build et serveur | `pnpm e2e` (`playwright test`) lance le `webServer` de `playwright.config.ts` : `pnpm build && vite preview --port 4173 --strictPort`, avec des variables `VITE_*` de test (`recette`, base `/`, identifiant client fictif). Le délai est de 120 s | Conforme à M3 : le test porte sur le build de production servi en statique. Aucune étape de build n'est nécessaire dans le job |
| Variable `CI` | GitHub Actions définit `CI=true`. Le serveur est donc toujours démarré par Playwright (`reuseExistingServer: false`), et un `test.only` oublié fait échouer le job (`forbidOnly`) | Conforme |
| Garde contre un faux vert | Playwright sort en erreur quand aucun test n'est trouvé. L'efficacité des deux tests a été établie par mutation à l'E13 de DT-008 (§3 de cette revue) | Conforme |
| Durée | 20 min au plus (`timeout-minutes`). Durée constatée : 41 s | Conforme. Le job tourne en parallèle des autres et n'allonge pas la CI |
| Permissions et secrets | Le job hérite de `permissions: contents: read` et n'utilise aucun secret | Conforme (DS-04) |

## 3. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| CI de la PR #8 sur `87787d9`, job `e2e (CSP, navigateur réel)` | Vert. Les 7 étapes réussissent, dont l'installation de Chromium et le test de fumée |
| CI de la PR #8 sur `87787d9`, autres jobs | `qualite`, `securite`, `build`, `tests (America/New_York)` et `tests (Pacific/Auckland)` sont verts. `tests (UTC)` était en cours lors de la rédaction ; le différentiel ne touche ni `src/` ni `tests/` |
| Lancement local de `pnpm e2e` | Non refait : le différentiel ne modifie ni `index.html`, ni `src/main.tsx`, ni les dépendances, et l'exécution en CI fait foi |

## 4. Remarques

| N° | Bloquante | Localisation | Constat | Action demandée |
|---|---|---|---|---|
| RC-DT12-1 | Non (corrigée par Anthony) | `docs/04-specification-technique/dette-technique.md:3`, table des versions, ligne DT-012 | Le passage de DT-012 à « Remboursée » n'a pas de ligne de version, et l'en-tête reste en v0.12. Le statut ne cite pas la PR et ne dit pas que le remboursement prend effet à la fusion, contrairement à DT-005 et DT-010 | **Fait** : v0.13 (2026-10-30) ajoutée à la table et à l'en-tête. Statut complété : « PR #8 … ; effective à la fusion de la PR #8 » |
| RC-DT12-2 | Non (corrigée par Anthony) | `docs/04-specification-technique/conventions.md` §14.1, « Portée au rang 0 » | §14.1 situe `pnpm e2e` dans le job `ihm` au rang 12. Il ne prévoit pas le job `e2e` du rang 3, qu'impose ADR-014 | **Fait** : `conventions.md` v0.4.7. Paragraphe « Avancement au rang 3 » ajouté : job bloquant `e2e` dès le rang 3, repris par le job `ihm` au rang 12 puis retiré, avec mise à jour des contrôles requis |
| RC-DT12-3 | Non | `.github/workflows/ci.yml:2` | Le commentaire d'en-tête indique toujours « Rang 0 : tous les contrôles du §14.1 sauf le job `ihm` / bout en bout (rang 12) ». Il est devenu inexact : le test de fumée de bout en bout tourne désormais | Friday : compléter le commentaire, par exemple « ; test de fumée de la CSP (job `e2e`) depuis le rang 3 (ADR-014 M3, DT-012) ». À faire dans cette PR si elle est reprise, sinon avec le job `ihm` au rang 12 |
| RC-DT12-4 | Non (action hors code) | Protection des branches `lot/*` et `main` (DEC-029, `conventions.md` §13.1) | Le nouveau contrôle n'est pas encore requis. Sans cela, une PR dont le job `e2e` échoue reste fusionnable, et DT-012 n'est remboursée qu'à moitié | Jarvis : après la fusion, demander au commanditaire d'ajouter le contrôle requis portant le nom exact du job, `e2e (CSP, navigateur réel)`. Si Friday renomme le job (RC-DT12-3 ne l'exige pas), transmettre le nouveau nom |

## 5. Sécurité

- **Secrets** : aucun. Les variables `VITE_*` du serveur de test sont fictives, et l'identifiant client `test.apps.googleusercontent.com` ne donne accès à rien.
- **Chaîne d'approvisionnement** : les actions sont épinglées par empreinte. Le navigateur vient du CDN de Playwright, à la version liée au paquet figé par le lockfile. C'est le procédé prévu par RC-DT8-2.
- **Permissions** : lecture seule, héritée du flux.

## 6. Dette

- **DT-012** : remboursée par la PR #8, effective à sa fusion. La garde n'est complète qu'avec RC-DT12-4 (contrôle requis). Le test de fumée n'a plus à être lancé à la main à chaque E13 qui touche `index.html`, `src/main.tsx` ou les dépendances : le job `e2e` de la PR fait foi.
- Aucune dette nouvelle.
