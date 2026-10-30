# Revue de code (E13) — LOT-001, reliquat du rang 3 (US-017 incrément 1, US-001)

| Élément | Valeur |
|---|---|
| PR | #9, `us/US-017-reliquat-rang3` → `lot/LOT-001` |
| Commits revus | `b734f7c`, `0efccc0` (Benjamin) ; `bcd6245` = E10 d'Anthony (hors revue, sauf contrôle de non-modification) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` uniquement : DT-011 (feuille ECR-011, point `MEN-ATTENTE`), DT-009 (observation du dépôt), DT-006 (reliquat Ionic du rang 1), RC-R3-4, RC-DT8-1 |
| Références | ST-US-017 v0.4 (§3.1 n° 17 b à 17 d, §4.5 bis, §13.1, §14) ; `checklist-revue-code.md` v0.3 ; `dette-technique.md` |
| Relecteur | Anthony |
| Date | 2026-10-30 |

## 1. Verdict : **Changements requis**

Le code livré est propre et conforme au §4.5 bis : modèle de vue, composant, formats d'heure, point `MEN-ATTENTE`, observation du dépôt. Mes tests de l'E10 sont inchangés et verts. Aucun test n'est affaibli. Mais la feuille ECR-011 n'est **branchée nulle part** (RC-R3-8, majeure) : DT-011 n'est donc pas remboursée. La branche n'est pas non plus rebasée sur `lot/LOT-001`, et elle est en conflit sur le registre de la dette (RC-R3-9).

## 2. Contrôles exécutés (Node 24.22, `0efccc0`)

| Commande | Résultat |
|---|---|
| `pnpm verifier` | Vert (lint, types, architecture, catalogue, rangs, hygiène) |
| `pnpm test` | 121 fichiers, 623 tests passés, 161 ignorés (rangs > 3) |
| `TZ=UTC pnpm test:couverture` | Vert. Global : 98,16 % des lignes, 92,82 % des branches. Fichiers créés ou modifiés à 100 %, sauf `heure.ts`, à 90 % des branches (`:22`, repli `?? ''` défensif, accepté) |
| `pnpm cucumber` | 60 scénarios, 543 étapes, tous passés |
| `pnpm e2e` (Chromium 1243, à la main, car `main.tsx` est touché, DT-012) | 2 tests passés : aucune violation CSP ; `definis` égal à `COMPOSANTS_IONIC` |
| CI GitHub de `0efccc0` | qualite, securite, tests (UTC, New York, Auckland), build : succès. Le job `e2e` (PR #8) ne tourne pas, car la branche n'est pas rebasée |
| `git diff bcd6245 HEAD -- tests/unitaires` | Seul ajout : `magasin-objectifs-observation.test.ts` (UT-COMP-US-017-52). UT-US-017-34 à 39 et UT-US-001-36 et 37 sont **inchangés** |

## 3. Points vérifiés à la demande

| Point | Constat |
|---|---|
| Squelettes au rang 3 (`rangs-fichiers.json`) | **Conforme** (§13.1). `heure.ts`, `feuille-synchronisation.ts` et `FeuilleSynchronisation.tsx` passent de `debut = fin = 4` à `3` (`b734f7c`). Les contrôles d'orphelin, de couverture et `@non-implemente` sont réactivés, et `pnpm verifier` est vert. Mais l'outil ne détecte pas que `FeuilleSynchronisation.tsx` n'est importé que par son test (voir RC-R3-8) |
| `observer` optionnel dans `ServicesObjectifs` | **Accepté.** Le magasin reste testable sans dépôt observable, et le repli `?? (() => undefined)` garde un désabonnement valide. Le seul appelant de production (`application.ts:387`) le fournit. Voir la suggestion RC-R3-11, sur l'assemblage seulement |
| Liste CSP e2e (`ion-card*`) | **Conforme en l'état, à compléter avec RC-R3-8.** `ion-card`, `ion-card-title` et `ion-card-content` sont absents de `COMPOSANTS_IONIC`, ce qui est juste : la feuille n'est pas montée, donc ces composants ne sont pas définis dans le build. Avec `toEqual`, leur présence ferait échouer le test. `ion-text` est ajouté à juste titre. Ils devront être **ajoutés** dans la même PR que le branchement de la feuille |
| RC-DT8-1 | **Levée.** `expect(definis).toEqual(COMPOSANTS_IONIC)` (`tests/e2e/csp.e2e.ts:68`), vérifié en Chromium |
| UT-COMP-US-017-52 | **Recevable**, il satisfait le critère de remboursement de DT-009. Une écriture faite hors du magasin (`banc.creer`, `renommerObjectif`) met à jour la liste (ECR-008) et le détail (ECR-003). Après `arreter()`, il n'y a plus de rafraîchissement. Les assertions portent sur l'état observable. L'attente par sondage (2 s au plus, toutes les 5 ms) est bornée. La vérification négative (50 ms) est faible par nature, mais suffisante ici : `observer` de Dexie notifie en microtâche. Le branchement de production est fait (`main.tsx:54`, `useEffect` qui rend la fonction de désabonnement, compatible avec `StrictMode`) |
| RC-R3-4 | **Levée.** `mentionAttenteSi(enAttente)` (`mention-attente.ts:7-8`) reste la seule source du code. `mentionAttente` s'appuie dessus, et `modeleAttente` (`ligne-objectif.ts:85-96`) l'appelle directement |

## 4. Décision DT-006 : **boutons natifs conservés, tests inchangés**

1. **Je n'adapte pas les tests.** UT-COMP-US-022-80, 82, 84, 85 et 86 vérifient le contrat d'accessibilité par le rôle (`getByRole('button', { name })`). En jsdom, `IonButton` ne rend pas son bouton interne (Shadow DOM non hydraté). Les adapter reviendrait à chercher la balise `ion-button` : on perdrait la vérification du rôle et du nom accessible, donc ce serait un **test affaibli** (gravité bloquante, grille §1.3).
2. **La décision est cohérente** avec `BoiteConfirmation` (décision de revue du rang 2, passage 2) et avec ST-US-017 v0.4 §4.5 bis, qui impose déjà des boutons natifs dans la feuille ECR-011 (`aria-disabled` focalisable).
3. **Conséquences :**
   - les boutons des composants du rang 1 (`src/compte/presentation/ui/`, `src/synchronisation/presentation/ui/`, dont `Bandeau.tsx`) restent natifs ;
   - le reliquat de DT-006 est **soldé**, avec les textes en `IonText` de `0efccc0` ;
   - DT-006 passe à **Remboursée**.
4. **Dette consignée : DT-014 (P3).** Ces boutons natifs, comme ceux de la feuille, n'ont aujourd'hui aucun style du gabarit. `styles.css` ne cible que `.boite-confirmation button`, `.ligne-objectif button` et `.objectifs-atteints > button`. L'application a donc deux apparences de bouton : `IonButton` sur les écrans du rang 2, le style par défaut du navigateur ailleurs.
   - **Remboursement** : une classe commune du gabarit, alignée sur l'apparence d'`IonButton` (états normal, survol, focus, `aria-disabled`), appliquée à tous les `<button>` natifs hors des lignes.
   - **Échéance et contrôle** : au plus tard avant l'E14 de LOT-001, contrôle par Steeve.
   - **Inscription** : je l'inscris au registre après le rebase, pour ne pas ajouter de conflit (voir RC-R3-10).
5. **Pas de nouvelle exigence sur `IonText`.** Sans `color`, ce composant n'a pas d'effet visuel. Il ne nuit pas, et il est éprouvé par le test de fumée CSP.

## 5. Remarques

Numérotation continue avec la revue du rang 3 (`revue-code-LOT-001-rang3.md`, RC-R3-1 à 7).

| Id | Gravité | Localisation | Constat | Attendu |
|---|---|---|---|---|
| RC-R3-8 | **Majeure** (CR-01, CR-07) | `src/main.tsx:81-83` ; `src/composition/controleur-interface.ts:56-61` | `FeuilleSynchronisation` et `construireFeuilleSynchronisation` ne sont importés que par leurs tests : la section « Synchronisation » d'ECR-011 n'est pas affichée. ST-US-017 v0.4 §3.1 n° 17 b exige le branchement dans `main.tsx` et la composition **dans cette PR**. Le registre déclare pourtant DT-011 « Remboursée ». | Les 6 points ci-dessous (a à f) |
| RC-R3-9 | **Bloquante de procédure** (grille §1.2) | Branche entière ; `docs/04-specification-technique/dette-technique.md:3-12` | La branche n'est pas rebasée sur `lot/LOT-001`, à qui manque la PR #8 (DT-012, job `e2e`). `git merge-tree` signale un conflit sur le registre : la version 0.13 y est attribuée deux fois, à la revue DT-012 sur le lot et à mon E10 ici. | Rebaser sur `origin/lot/LOT-001`. Garder la v0.13 du lot (DT-012), renuméroter mon entrée E10 en **0.14** et la vôtre en **0.15**, mettre à jour l'en-tête. Le job `e2e` doit être vert sur la PR. |
| RC-R3-10 | Mineure (CR doc, registre) | `docs/04-specification-technique/dette-technique.md` : ligne DT-009 du tableau, ligne DT-011, ligne DT-006 | a) Ligne DT-009 du tableau : le statut est encore « Planifiée », alors que la fiche dit « Remboursée ». b) DT-011 « Remboursée » est prématuré tant que RC-R3-8 est ouverte. c) DT-006 : la ligne n'enregistre pas la décision du §4. | Les 3 corrections ci-dessous. J'inscris DT-014 moi-même après votre rebase. |
| RC-R3-11 | Suggestion (CR-13) | `src/composition/objectifs-taches.ts:37,48` | À l'assemblage, `observer` est optionnel : si un futur appelant de production l'oublie, le magasin cesse de suivre le dépôt sans aucun signal. | Le rendre obligatoire dans `assemblerObjectifsTaches` et `ObjectifsTaches` (le banc `tests/support/ui-objectifs.ts:28` passe `env.depot.observer`), en le laissant optionnel dans `ServicesObjectifs`. Facultatif. |

**RC-R3-8, détail de l'attendu :**

a) **Vue.** Ajouter à l'état d'écran du contrôleur un champ `feuille?: ModeleVueFeuilleSynchronisation`. Il est construit par `construireFeuilleSynchronisation` à partir de :
   - `consulterEtatSynchronisation` ;
   - `lireMeta().dernierContactDrive` ;
   - les éléments en attente du dépôt, avec intitulé et `derniereHlc` (`LigneFeuilleOrdonnable`) ;
   - `maintenant`, donné par l'horloge.

   Il est recalculé à chaque notification du cycle et du dépôt.

b) **Rendu.** Afficher `<FeuilleSynchronisation>` à côté de `<SectionCompte>`, dans `main.tsx`.

c) **Actions.**
   - `surSynchroniser` et l'action `REESSAYER_MAINTENANT` appellent `CycleSynchronisation.synchroniserMaintenant()`.
   - L'action `OUVRIR_GOOGLE_DRIVE` ouvre Google Drive dans un nouvel onglet (`noopener`).

d) **Tests.** Ajouter un test du contrôleur, `UT-COMP-US-017-53` : la feuille est présente après l'ouverture de l'espace, et les deux actions sont transmises.

e) **CSP.** Ajouter `ion-card`, `ion-card-title` et `ion-card-content` à `COMPOSANTS_IONIC` (`tests/e2e/csp.e2e.ts:6-22`) et vérifier `pnpm e2e`.

f) **Question préalable.** Si la lecture des éléments en attente avec intitulé n'est exposée par aucune requête existante, posez-moi une question `Q-BEN-R3R-n` avant de coder. N'accédez pas au dépôt depuis la présentation (CR-10).

**RC-R3-10, détail de l'attendu :**

a) Ligne DT-009 du tableau : statut « Remboursée (PR #9) ».

b) Ligne DT-011 : statut « En cours » jusqu'à la levée de RC-R3-8, puis « Remboursée (PR #9) ».

c) Ligne DT-006 : ajouter « **Décision de revue (reliquat du rang 3)** : boutons natifs conservés pour le contrat de rôle testé en jsdom (UT-COMP-US-022-80, 82, 84 à 86) ; textes en `IonText` ; apparence des boutons natifs suivie en DT-014 », puis passer le statut à « Remboursée (PR #9) ».

### Revue détaillée sans remarque

- **`heure.ts`** : conforme au §4.5 bis.
  - Le formatage passe par `Intl` avec `FUSEAU_REFERENCE` et `hourCycle: 'h23'`, sans date-fns.
  - Les bornes sont strictes (`<`), et l'avenir donne « à l'instant ».
  - La veille est déterminée par `jourDeReference` (jour de Paris).
- **`feuille-synchronisation.ts`** :
  - `n` est le nombre de lignes, pas `etat.enAttente` ;
  - le tri se fait sur une copie (`[...elements].sort`) ;
  - les cartes sont exclusives (`ERR-011` ou `ERR-016`) ;
  - les fonctions sont courtes et le module ne contient aucune logique d'interface.
- **`FeuilleSynchronisation.tsx`** :
  - `aria-disabled` n'est jamais remplacé par `disabled` ;
  - le clic, donc aussi la touche Entrée ou Espace, est neutralisé par la garde `disponible` ;
  - `aria-describedby` est présent seulement avec l'explication ;
  - la liste est nommée par `aria-labelledby` ;
  - les identifiants sont fixes, ce qui est acceptable : une seule feuille est montée.
- **`ligne-objectif.tsx`** :
  - le point `aria-hidden` porte la description dans un `<span hidden>`, référencé par `aria-describedby`, ce qui est valide (accname : contenu caché référencé inclus) ;
  - le nom accessible de la ligne est inchangé ;
  - l'identifiant `attente-{id}` est unique, car la liste et le détail sont exclusifs ;
  - le découpage en `PointAttente` et `TexteLigne` améliore la lisibilité.
- **`magasin-objectifs-taches.ts`** :
  - `#rafraichir` passe par des résultats (`lecture.ok`), sans rejet non traité derrière le `void` ;
  - le double rafraîchissement après une commande du magasin (`#apres` puis l'observateur) est idempotent ;
  - il n'y a pas de fuite : le désabonnement se fait au démontage.
- **Sécurité** : aucun jeton, secret ni donnée personnelle nouvelle. Dans la feuille, les intitulés sont rendus en texte par React, sans `dangerouslySetInnerHTML`.

## 6. Suite

1. Benjamin traite RC-R3-8 à RC-R3-10 (itération 1/2), puis rebase.
2. Nouvelle revue, limitée à ces remarques et au nouveau différentiel (branchement, contrôleur, liste CSP, registre).
3. Après le rebase : j'inscris DT-014 au registre.

## 7. Question de Benjamin pendant l'itération 1

| Id | Question | Réponse d'Anthony |
|---|---|---|
| Q-BEN-R3R-1 | Pour RC-R3-8 : construire les `LigneFeuilleOrdonnable[]` dans la composition (comme `attenteDe`), à partir de `espace.depot.lire()`, et exposer `lireElementsEnAttente()`, `lireDernierContact()` et `synchroniserMaintenant()` sur `Application` ? | **Validé, avec une correction**. La lecture du dépôt et le câblage restent dans la composition, comme `attenteDe`. C'est conforme au DAT : la présentation n'accède pas au dépôt. En revanche, la **règle** de regroupement ne va pas dans `application.ts` (CR-12, CR-13 : la composition câble, elle ne calcule pas) : elle va dans le domaine, avec la fonction pure `elementsEnAttenteDetailles(etat)` (`src/synchronisation/domaine/elements-en-attente.ts`). Cette règle couvre l'entrée par élément, le lien compté pour sa tâche, le plus grand `derniereHlc` et l'intitulé, même supprimé (`''` sans registre). J'ai livré son squelette et UT-COMP-US-017-54 en rouge, au rang 4 dans `rangs-fichiers.json`, à ramener à 3. En plus, il faut `Application.ouvrirGoogleDrive()`, par une nouvelle méthode `Navigateur.ouvrirOnglet(url)` implémentée dans `main.tsx`. Spécification : ST-US-017 v0.4.1, n° 17 e et 17 f, §4.5 bis, §13.1. Ordre : 17 e au vert, puis UT-COMP-US-017-53 écrit d'abord, le contrôleur, `main.tsx`, `ion-card*` dans la liste CSP, et enfin `pnpm e2e`. |

## 8. Nouvelle revue (2e tour, itération 2/2) : **Approuvé**

Périmètre : les corrections seulement, `6ba1214` (RC-R3-9 à 11), `1a6ac09` et `b097aed` (RC-R3-8) ; `39268b9` est mon E10 de Q-BEN-R3R-1 (contrôle de non-modification seulement). Branche rebasée sur `origin/lot/LOT-001` (contrôlé par `git merge-base --is-ancestor`).

### 8.1 Contrôles exécutés (`b097aed`)

L'environnement de ce tour n'a que Node 22 (`engine-strict`) : les outils sont lancés directement depuis `node_modules/.bin`, avec les mêmes arguments que les scripts de `package.json`.

| Contrôle | Résultat |
|---|---|
| `prettier --check`, `eslint --max-warnings 0`, `tsc --noEmit`, `depcruise` | Verts (234 modules, aucune violation) |
| `verifier-catalogue`, `-tags`, `-rangs`, `-depot` | 0 erreur. `elements-en-attente.ts` ramené au rang 3 |
| `vitest run --coverage` | 123 fichiers, 628 tests passés, 161 ignorés (rangs > 3). Global : 98,16 % des lignes, 92,84 % des branches |
| Cucumber (`default`) | 60 scénarios, 543 étapes, tous passés |
| `pnpm e2e` | **Non exécutable ici** : Chromium 1248 absent de l'environnement, seul le 1243 est installé. À constater sur le job `e2e` de la CI de la PR avant la fusion (condition de fusion, voir 8.4) |
| `git diff 39268b9 HEAD -- tests/unitaires/synchronisation/domaine/elements-en-attente.test.ts` | Vide : UT-COMP-US-017-54 est inchangé, et il est vert |

### 8.2 Remarques

| Id | Statut | Constat |
|---|---|---|
| RC-R3-8 | **Levée** | a) `vue.feuille` est construite par `construireFeuilleSynchronisation` avec l'état déjà lu, `lireDernierContact()`, `lireElementsEnAttente()` et `horloge.maintenant()`. Elle est recalculée aux mêmes notifications que l'indicateur, comme l'exige ST-US-017 v0.4.1 n° 17 f (qui précise le §5 a de cette revue). b) Montée dans `main.tsx` (`EtatSynchronisation`). c) `synchroniser` et `REESSAYER_MAINTENANT` appellent `synchroniserMaintenant()` ; `OUVRIR_GOOGLE_DRIVE` appelle `ouvrirGoogleDrive()`, puis `Navigateur.ouvrirOnglet`, et `window.open(..., 'noopener,noreferrer')` reste confiné à `main.tsx`. d) UT-COMP-US-017-53 : présence, absence sans espace, transmission des 3 actions. e) `ion-card*` ajoutés à `COMPOSANTS_IONIC`. f) Règle dans le domaine (`elementsEnAttenteDetailles`, pure, `maxHlc`, intitulé `''` sans registre) ; lecture et câblage dans la composition, en échec ramenés à `[]` ou `undefined`, comme `attenteDe`. **Position de la feuille** : elle est rendue avant `<SectionCompte>`, alors que la v0.4.1 disait « après ». Le guide d'ergonomie §4.26 fixe l'ordre Synchronisation puis Compte : c'est donc la réalisation qui est juste, et la ST est corrigée (v0.4.2) |
| RC-R3-9 | **Levée** | Rebase fait. Historique du registre : 0.13 (DT-012, lot), 0.14 (mon E10), 0.15 (Benjamin), 0.16 (Benjamin, RC-R3-8). L'en-tête était resté en 0.15 : je l'aligne en 0.17 avec mon inscription. Le job `e2e` reste à constater sur la CI (8.4) |
| RC-R3-10 | **Levée** | a) DT-009 « Remboursée (PR #9) ». b) DT-011 « Remboursée (2026-10-30, PR #9 ...) », correct maintenant que RC-R3-8 est levée. c) DT-006 : décision enregistrée mot pour mot, statut « Remboursée (PR #9) » |
| RC-R3-11 | **Levée** | `observer` est obligatoire dans `ObjectifsTaches` et `assemblerObjectifsTaches`, et reste optionnel dans `ServicesObjectifs`. Le banc `ui-objectifs.ts` passe `env.depot.observer` |

### 8.3 Points soumis à validation

- **Stubs ajoutés aux doublures** (`controleur-interface.test.ts:80-83`, `controleur-reessai.test.ts:75-78`, `appareil-simule.ts:347`) : **acceptés**. Ce sont des compléments de type, imposés par l'élargissement de `ApplicationInterface` et d'`AdaptateursApplication`. Ils sont neutres : `consulterEtat` y rend `undefined`, donc la feuille n'est jamais construite dans ces tests, et `ouvrirOnglet` n'est jamais appelé par le banc. Aucune assertion n'est modifiée, retirée ou relâchée : ce ne sont pas des tests affaiblis.
- **DT-014** : inscrite au registre (v0.17), P3, échéance avant l'E14 de LOT-001, contrôle par Steeve.

### 8.4 Condition de fusion et observation

- **Condition de fusion (non bloquante pour le verdict)** : le job `e2e` de la CI doit être vert sur la PR. Il est le seul à éprouver `ion-card*` et le montage réel de la feuille sous la CSP.
- **Observation O-1, hors différentiel, sans exigence sur cette PR** : `ControleurInterface` n'est rafraîchi qu'aux changements de session et de réseau (`web.ts:124`), ainsi qu'après les gestes de l'utilisateur. Un cycle mené en arrière-plan (envoi terminé, accès perdu) ne met donc à jour ni l'indicateur ni la feuille avant le prochain geste. Le défaut existe depuis le rang 1 sur du code approuvé. Je le transmets à Jarvis pour qu'il soit qualifié (anomalie, ou rattachement à la composition de l'incrément 2 de US-017).

### 8.5 Verdict : **Approuvé**

RC-R3-8 à 11 sont levées. Aucun test n'est affaibli, et je n'ai aucune nouvelle remarque bloquante.
