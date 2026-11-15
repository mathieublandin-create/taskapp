# Revue de code (E13) — correction d'ANO-002 et d'ANO-003, LOT-001

| Élément | Valeur |
|---|---|
| Date | 2026-11-06 |
| Relecteur | Anthony |
| Demande | PR #32 (brouillon), `fix/ANO-002-003` vers `lot/LOT-001`, 5 commits de Benjamin, 14 fichiers |
| Référentiel | `checklist-revue-code.md` v0.3, `conventions.md`, guide d'ergonomie §2.1, §2.2, §4.14, §10, ECR-008, DT-018, anomalies ANO-002 et ANO-003 (Pepper) |
| Verdict | **Remarques** : 1 remarque à lever dans cette PR (RC-ANO-002-003-1), les autres acceptées en dette ou renvoyées à Steeve (E14). Pas d'autre point bloquant. |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, dépôt) | Vert |
| `vitest run` avec couverture, rang 9 | 206 fichiers, 1 040 tests verts ; seuils tenus |
| `playwright test` (second `webServer` compris) | 6 tests verts (2 CSP, 4 mise en page) |
| Défaut réintroduit (annulation du CSS) | Les tests de mise en page échouent (voir décision 7) |

## 2. Décisions demandées

| N° | Question | Décision |
|---|---|---|
| 1 | Conformité au guide | Conforme pour l'essentiel : barre en bas, boutons de 56 px de haut (test à 44 px et plus), « + » dans le tiers inférieur de l'écran (testé), `aria-current="page"` sur l'onglet actif (testé), libellés issus de `libelles-ui.ts` (motif établi, DT-006), icônes décoratives en `aria-hidden`. Écarts : focus, icônes, marges de sécurité (RC-3, DT-034) ; « + » libellé (décision 3) |
| 2 | Barre en bas à toutes les largeurs | **Dette, pas un défaut bloquant** : DT-033 (P2). Raisons : l'anomalie portait sur un contenu invisible sur smartphone ; aucune fonction n'est perdue à 600 px et plus ; DT-018 (P2) acceptait déjà la navigation provisoire jusqu'à la recette de clôture. DT-018 est remboursée en partie ; le reliquat est DT-033. Steeve peut relever la priorité en E14 |
| 3 | Libellé écrit à côté du « + » | **Accepté pour la correction.** Question Q-ANT-E13-ANO-1 à Steeve, en E14 : le guide (composant « Bouton flottant », ECR-008 A) prévoit-il un « + » rond sans texte (FAB 56 px) ou un bouton flottant étendu avec libellé ? Si le « + » seul est confirmé, le libellé reste utile tant que les deux « + » des onglets sont identiques ; ne rien retirer sans réponse |
| 4 | Harnais et second `webServer` | **Conforme.** Aucune dépendance ajoutée ; le job `e2e` lance `pnpm e2e`, qui démarre les deux serveurs ; `reuseExistingServer` est faux en CI ; aucune variable ni secret ; le serveur de développement écoute en local seulement ; le harnais n'est pas dans le build (entrée unique `index.html`), et `tests/` n'est pas importé par `src/` (règle dependency-cruiser). Réserve : la duplication de l'enveloppe `main` (DT-035, P3) |
| 5 | Extraction vers `espaces.tsx` | **Conforme.** `ObjectifsTaches` est redéfini par type structurel (`Parameters<…>`), la présentation n'importe pas la composition, et `tsc` valide l'assignation depuis `main.tsx`. Reprise mineure (RC-2) : `RefElementMetier` est dupliqué alors que `../../../../synchronisation` l'exporte (déjà importé par `etat/issues.ts`) |
| 6 | Mes fichiers | `rangs-fichiers.json` : 2 entrées `{ 9, 9 }` correctes (`verifier:rangs` vert, rang courant 9). UT-COMP-US-001-45 : intact (aucun test existant modifié ; il passe) |
| 7 | Le test rouge prouve-t-il le défaut ? | **Oui, avec réserve.** Avec `styles.css` de la base, 2 tests échouent : la barre est à 28 px du haut (attendu : plus de 840) et `ion-content` mesure 0 px de haut (attendu : plus de 300). En retirant la seule ligne `height: 100dvh`, les mêmes 2 tests échouent : la cause est donc la hauteur absente de l'espace (contenu écrasé, « + » hors de l'écran). Réserve : le test rouge a été écrit avec le correctif et non avant (écart au TDD, pas de reprise ; l'essai ci-dessus en tient lieu) |
| 8 | Défauts récurrents | `void` : 3 occurrences, toutes déplacées depuis `main.tsx` sans changement (`espaces.tsx:83, 84, 116`), sans promesse perdue nouvelle ; un `as unknown as` dans un test de navigateur (`mise-en-page-smartphone.e2e.ts:17`), accepté : déclaration de la propriété de `window` du harnais ; aucun paramètre trop large ; pas d'assertion Ionic immédiate (CR-72b) : UT-COMP-US-001-190 et US-002-190 utilisent `findBy*` et `waitFor`. Couverture : voir RC-1 |
| 9 | ANO-003 : l'erreur est-elle devenue impossible ? | **Non, elle n'est pas prouvée corrigée.** Le branchement est sain : UT-COMP-US-001-190 (aucun appel à `creerTache`) et le test de navigateur (1 objectif, 0 tâche) montrent que « Créer un objectif » crée un objectif. Le défaut n'a pas été reproduit, donc la cause reste une hypothèse (confusion entre deux « + » identiques, sans libellé, dont l'un crée une tâche, aggravée par la mise en page cassée d'ANO-002). La correction rend la confusion improbable (libellé visible, feuilles « Nouvel objectif » et « Nouvelle tâche ») et verrouille le branchement, mais ne la rend pas impossible. ANO-003 ne doit pas être close sur cette revue : à garder « Corrigée, en revue » jusqu'à la recette (E14) avec les questions Q-ANO-003-1 à 8 de Pepper, et à rouvrir si le commanditaire la reproduit |

## 3. Remarques

| N° | Gravité | Point de la grille | Localisation | Constat | Action | Statut |
|---|---|---|---|---|---|---|
| RC-ANO-002-003-1 | Majeure (à lever dans cette PR) | CR-63 (couverture), CR-65 (tests utiles) | `src/objectifs-taches/presentation/ui/ecrans/espaces.tsx:23-156` | Le fichier a 0 % de couverture (lignes, branches, fonctions). `main.tsx` était exclu de la couverture : en déplaçant `useNavigation`, `useOuvertureDemandee` et `BarreOnglets` vers un fichier couvert, la logique de navigation (bascule d'onglet, « Voir … » de la section « À lire », `surOuvrirTache`) n'a plus aucun test unitaire. Seuls les tests de navigateur l'exercent, et ils ne comptent pas dans la couverture | Ajouter un test de composant (fichier `espaces-comp.test.tsx`, Ionic : `findBy*` / `waitFor`) : `aria-current` suit l'onglet choisi ; `voir` d'une tâche ouvre l'onglet Tâches et le détail, `voir` d'un objectif l'onglet Objectifs, puis la demande est acquittée ; `surOuvrirTache` depuis un objectif bascule sur Tâches | Ouverte |
| RC-ANO-002-003-2 | Mineure | CR-14, duplication | `espaces.tsx:11-14` | `RefElementMetier` est recopié. Une divergence passerait inaperçue du côté de `useNavigation` | Importer `RefElementMetier` depuis `../../../../synchronisation` (comme `etat/issues.ts`) | Ouverte |
| RC-ANO-002-003-3 | Mineure | Guide §3.7, §10 | `styles.css:309-327` ; `espaces.tsx:20-24` | Pas d'anneau de focus de 2 px `color.focus` ; icônes en trait de 2 px (1,5 px au guide) ; « Tâches » est une coche au lieu d'une liste à puces cochées ; ni `safe-area` ni marge de défilement sous le « + » | **Acceptée en dette : DT-034 (P2)**, contrôle par Steeve en E14 | Dette |
| RC-ANO-002-003-4 | Mineure | CR-13, tests | `tests/support/harnais/ecran-connecte.tsx:56-62` | Le harnais recopie `<main className="espace-application">` : le test de mise en page ne verrait pas la perte de la classe dans `main.tsx` | **Acceptée en dette : DT-035 (P3)** | Dette |
| RC-ANO-002-003-5 | Mineure | Guide ECR-008, nom accessible | `liste-objectifs.tsx:102, 109` | Sur la liste vide, deux contrôles portent le même nom « Créer un objectif » (bouton de l'état vide et « + » libellé), avec la même action. Redondance pour un lecteur d'écran ; le test UT-COMP-US-001-190 clique sur le premier trouvé | Question Q-ANT-E13-ANO-2 à Steeve (E14) : garder le « + » avec l'état vide, comme le guide §6 (états vides : « FAB conservé »), mais avec un libellé distinct, ou ne l'afficher qu'en liste non vide. Pas de changement d'ici là | Question |
| RC-ANO-002-003-6 | Mineure | Tests | `tests/e2e/mise-en-page-smartphone.e2e.ts:6` | L'URL du harnais (port 4174) est écrite en dur, alors que `playwright.config.ts` définit déjà le port ; deux sources | Exporter le port ou l'origine du harnais depuis un module commun, au prochain passage dans ces fichiers (pas de blocage) | Ouverte |

## 4. Dette inscrite (`dette-technique.md` v0.32)

| Numéro | Objet | Priorité |
|---|---|---|
| DT-018 | Remboursée en partie (barre d'onglets en bas) ; reliquat transféré | — |
| DT-033 | Rail (600 à 1023 px) et barre latérale (1024 px et plus), panneau de détail | P2 |
| DT-034 | Focus visible, icônes, marges de sécurité et de défilement de la barre d'onglets et du « + » | P2 |
| DT-035 | Le harnais duplique l'enveloppe `main` de `main.tsx` | P3 |

## 5. Questions (Steeve, E14, via Jarvis)

- Q-ANT-E13-ANO-1 : un « + » flottant avec libellé visible est-il accepté (décision 3) ? Quelle forme finale ?
- Q-ANT-E13-ANO-2 : sur la liste vide d'objectifs, que faire du doublon « Créer un objectif » (RC-ANO-002-003-5) ?

## 6. Suite

Benjamin lève RC-ANO-002-003-1 et RC-ANO-002-003-2 (RC-6 s'il passe dans la zone). Je ne contrôle ensuite que ces remarques. La recette (E14) confirme ou rouvre ANO-002 et ANO-003.

## 7. Revue 2 (2026-11-06, commit 0c8227c, différentiel depuis 1e8af7c)

**Verdict : Approuvé.** Aucun nouveau défaut ; aucune remarque devenue majeure.

| Remarque | Statut | Constat |
|---|---|---|
| RC-ANO-002-003-1 | Levée | `tests/unitaires/objectifs-taches/presentation/ui/espaces-comp.test.tsx` (UT-COMP-US-002-191) couvre `aria-current` (présent et absent), la bascule des onglets, « Voir … » d'une tâche et d'un objectif (onglet et titre du détail), et `surOuvrirTache` depuis un objectif. Assertions Ionic dans `waitFor` / `findBy*` (CR-72b) ; aucun test existant modifié. Le test passe sur les jobs CI Pacific/Auckland et America/New_York (207 fichiers verts, pas d'erreur de seuil) ; le job UTC était encore en cours à la lecture. Le chiffre annoncé (94,11 % lignes, 80 % branches) n'apparaît pas dans les journaux CI (pas de tableau de couverture) : non vérifié par moi, le seuil CI tient. |
| RC-ANO-002-003-2 | Levée | `espaces.tsx` importe `RefElementMetier` depuis `../../../../synchronisation` ; copie supprimée. Même import que `etat/issues.ts` ; le job `qualite` (`pnpm architecture`, dependency-cruiser) est vert. |
| RC-ANO-002-003-6 | Levée | `tests/support/harnais/port.ts` est la source unique, importée par `playwright.config.ts` et `mise-en-page-smartphone.e2e.ts`. Job `e2e` vert. |
| RC-ANO-002-003-5 | Inchangée | Q-ANT-E13-ANO-2 reste à Steeve (E14). |
| DT-033, DT-034, DT-035 | Inchangées | Non traitées, conformément à la demande. |
