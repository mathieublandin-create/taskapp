# Revue de code E13 courte — LOT-001, rang 14 (corrections de l'E13b), tranches T1 à T3

| Élément | Valeur |
|---|---|
| Relecteur | Anthony (sonnet) |
| Date | 2026-11-13 |
| Branche | `fix/e13b-lot001` @ `bd06f48` (fusion de T3 ; PR #46 en brouillon) |
| Auteur | Benjamin (sonnet) : T1 (textes, étapes du premier onglet), T2 (focus, zone sûre, réserve de 88 px), T3 (boutons natifs) |
| Périmètre | `git diff d1062cb..bd06f48 -- src tests/steps-ihm tests/unitaires tests/e2e` : 17 fichiers de `src`, `index.html`, guide §6.6.8 et §6.6.12 (Steeve), `tests/steps-ihm/compte.steps.ts`. **Aucun test fourni en E10 n'est modifié** (le diff de `tests/unitaires` et de `tests/e2e` est vide). |
| Référentiel | ST-CORR-E13B-LOT-001 v0.1 (portée à **v0.2** par cette revue), guide v0.2.26, `checklist-revue-code.md`, revue du rang 13 (format) |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (Node 24) | **0 erreur** (format, lint, types, architecture, catalogue, tags, rangs, hygiène), y compris avec mes ajouts. `verifier:catalogue` : les trois sources (codes, catalogue, guide) s'accordent, les apostrophes du guide (`'`) et du catalogue (`’`) sont normalisées par l'outil (aucune modification de typographie à demander). |
| `pnpm test` (rang 13) | **1 621 verts, 29 ignorés** (sans changement). |
| `RANG_COURANT=14` : familles de T1 à T3 | UT-E13B-TXT-01 à 06, UT-DT-034-01 et 02, UT-DT-014-01 à 06 : **14 / 14**. |
| `RANG_COURANT=14 pnpm e2e -g "E2E-DT-034\|E2E-DT-014"` | **11 / 11** (Chromium local). |
| `pnpm exec cucumber-js --profile ihm` au rang 14 | **13 / 13**. S16b et S16c : **verts** (29 étapes). |
| `pnpm cucumber:steps-inutilises` | 0 définition inutilisée. |
| Couverture (`pnpm test:couverture`) | Global 98,22 % des instructions, 95,81 % des branches (rang 13 : 98,2 / 95,85, soit −0,04 point de branches, sans fichier modifié sous 100 % : aucun fichier de T1 à T3 n'apparaît dans le tableau des fichiers incomplets). `verifier:couverture-fichiers` exige un rapport de base : pris dans la CI. |
| Géométrie de `overflow: hidden` (mesure par Playwright, build `test-ihm` et harnais) | Voir §3 (décision 2). |
| Mutations propres | Variantes `danger` → `principal` et `tertiaire` → `danger` dans `ChoixRestauration.tsx` et `ModificationsNonRetenues.tsx` : **survivantes** (20 tests verts) avec les tests de l'E10. Corrigé par mes tests UT-DT-014-07 à 09 (rougissent avec la même mutation). Voir RC-CORR-1. |

## 2. Points soumis

### 2.1 T1 : textes et étapes
- **Codes `TXT-*`** : conformes (§3.1 de la ST). Les trois sources sont dans le même commit, `libelles-ui.ts` ne porte plus aucun `TODO(`. Seul écart de forme : les deux codes sont placés après `TXT-INF-PARENT`, pas par ordre alphabétique strict. Ma formulation v0.1 (« alphabétique, avant `TXT-VAL-AUCUNE` ») était contradictoire ; la ST v0.2 décrit l'état livré. **Sans remarque.**
- **`libelle()` dans `carte-incoherence.tsx`** : conforme à la ST. Le nom accessible vient du catalogue (`nomAccessible`), la fonction locale et l'espace insécable écrits à la main sont supprimés (moins de duplication, UT-COMP-US-024-13 et 15 inchangés et verts). Pas de leçon du rang 13 à appliquer : la ST ne contraignait pas ici le code au-delà de ce qui est simple, aucune tranche supplémentaire n'est nécessaire.
- **Variantes d'`ERR-016`** : `varianteEchec` (0 : `aucune`, 1 : `une`, sinon base) est lisible, le titre et l'action ne lisent pas la variante (`variables` sans `variante`), conforme au §3.2. Le texte du guide §6.6.8 est identique au catalogue.
- **Étapes du premier onglet** : une définition unique par phrase `(premier|second)`, `ecranDeConnexionDe` factorisée, le premier onglet attendu par sondage (`attendreEcranDeConnexion`, ANO-006) et le second par rechargement et `networkidle` (ANO-004). Assertions inchangées pour le second, identiques pour le premier. **Conforme.**
- **S16b et S16c verts avant T5** : la ST v0.1 les attendait rouges jusqu'à T5b ; c'était une erreur de ma part (la section « Compte » est encore dans la page). **Décision** : ils reviennent au **rang 13** (`rangs-scenarios.json`, `LOT-001.md`, ST §9.1 et §12.1). Ils tournent donc dans le job `ihm` à chaque tranche et protègent ANO-006 pendant T4 et T5. T5b les rejoue sur la feuille modale (étape `boutonDeLaSectionCompte` adaptée, §12.2).

### 2.2 T2 : focus, zone sûre, réserve
- **Focus** : règle `:where(…):focus-visible` globale (spécificité nulle), `outline: 2px solid var(--dj-focus)`, décalage de 2 px, `-2px` pour la barre d'onglets, les lignes et la case ; `ion-fab-button::part(native)` et `ion-button::part(native)` rétablissent l'anneau dans le shadow DOM. Aucun `outline: none` ni `0` ajouté. Aucun anneau au clic : E2E-DT-034-05 vert, et la sélection est `:focus-visible` uniquement. **Conforme.**
- **`viewport-fit=cover`** dans `index.html` (ordre exact) et `padding-bottom: env(safe-area-inset-bottom)` dans la règle `.barre-onglets` (E2E-DT-034-07 lit le sélecteur) : conformes.
- **Réserve de 88 px** : `--dj-marge-fab`, `--padding-bottom` et `scroll-padding-bottom` conformes ; la classe `contenu-avec-fab` est posée sur les deux `IonContent` des listes. E2E-DT-034-08 vert.
- **`overflow: hidden` sur `ion-content.contenu-avec-fab`** (hors ST) : voir §3, décision 2.

### 2.3 T3 : boutons natifs
- **`bouton-natif` et `data-variante`** : tous les `<button>` de `src/compte/presentation/ui/` et `src/synchronisation/presentation/ui/` portent la classe en littéral (UT-DT-014-06 vert) ; l'attribution suit le §4.2, aux deux exceptions de RC-CORR-2. Les extractions de sous-composants (`PorteesAnnoncees`, `BoutonActionCompte`, `ExplicationBlocage`, `EnTeteFeuille`) servent uniquement à respecter `max-lines-per-function` : acceptées, sans changement de comportement.
- **`ChoixRestauration`** : `className="primaire"` est remplacé par `bouton-natif` + `data-variante="principal"` ; `.primaire` n'avait aucune règle CSS (classe morte) : aucun effet perdu. Les autres usages de `primaire` (`selecteur-parent.tsx`, `boite-confirmation.tsx`) sont hors périmètre (§4.1, §4.4).
- **CSS du §4.3** : reproduit à l'identique, `:disabled` ajouté comme demandé. Un seul principal par écran (guide §4.1) n'est pas un contrôle de la tranche : le bandeau, la carte et le choix de restauration peuvent coexister dans la feuille ; à signaler à Steeve à l'E14 (information, pas une remarque).
- **Rustines de mise en page** (`.espace-application`, `.espaces`) : voir §3, décision 3.

## 3. Décisions sur les trois contournements de mise en page (hors ST)

Mesures de l'E13 sur l'application réelle (build `test-ihm`, compte A connecté, compte et feuille encore dans la page) :

| Viewport | Sans les rustines de T3 | Avec les rustines de T3 |
|---|---|---|
| 390 × 844 | hôte de `ion-content` : **88 px** (la réserve seule) | 478 px, mais `main.espace-application` fait 1 235 px de haut (la page défile de 391 px) |
| 360 × 480 | hôte : 88 px | 223 px, page de 1 004 px (défile de 524 px) |

La cause est la présence du compte et de la feuille de synchronisation dans `main` (c'est ANO-005 n° 2 elle-même) : T3 (boutons de 44 px) a fait passer l'espace de la liste de 160 px à 88 px. Ce n'est pas un défaut de T3.

| # | Règle | Décision |
|---|---|---|
| 1 | `.espace-application { overflow-y: auto }` et `.espaces { flex: 1 0 auto; min-height: 70dvh }` (T3) | **Gardée jusqu'à T5b, retirée par T5b avec test.** Sans elles, la liste est inutilisable (88 px) et S16 échoue. Elles ne masquent pas de contenu : la page défile, la liste garde 70 % de l'écran. Aucune alternative plus petite avant T5b (déplacer le compte dans la feuille, c'est T5b). Retrait obligatoire : leur survie après T5b ajouterait un second défilement de page et une hauteur minimale sans objet. **E2E-ANO-005-FEUILLE-06** (ajouté par cette revue, rouge) le garantit. |
| 2 | `ion-content.contenu-avec-fab { overflow: hidden }` (T2) | **Gardée jusqu'à T5b, retirée par T5b avec le même test.** Elle **n'empêche pas le défilement réel** : la liste défile dans le `.inner-scroll` du shadow DOM, qui est un élément à part ; mesuré à 390 × 844, 390 × 500 et 320 × 360 avec 0, 1, 6 et 15 tâches, avec et sans la règle : les `scrollHeight`, `clientHeight`, positions de défilement et boîtes sont **identiques** (le défilement atteint la dernière ligne, au-dessus du « + »). Elle ne masque pas de contenu non plus (l'anneau de focus est à l'intérieur de l'hôte). Elle n'a d'effet que quand l'hôte est écrasé à 0 px (390 × 600 sans les rustines de T3 : la page déborde de 87 px sur la barre). C'est donc le même contournement du même défaut de mise en page ; elle devient sans objet avec la feuille modale. Elle est testée par construction à T5b (`overflow` calculé `visible` + dernière ligne atteignable). |
| 3 | Refus | Aucun : aucune des trois règles n'est dangereuse pour l'utilisateur avant T6. Elles ne doivent pas survivre à T5b. |

La ST est portée en v0.2 : §2 (rustine de T2 déclarée), §4.3 bis (rustine de T3 déclarée), **§5.2 bis** (retrait par T5b, trois règles, valeurs calculées attendues, test).

## 4. Couverture et mutations rapportées

- **T3, 4 mutations rapportées** : le compte et les écrans connexion, ERR-017, section « Compte », feuille, bandeau (UT-DT-014-01 à 05) sont couverts. **Insuffisant** : les attributions de `ChoixRestauration` (principal, danger, tertiaires, secondaire) et de `ModificationsNonRetenues` (quatre tertiaires), et l'action `REPRENDRE_LA_SYNCHRONISATION` du bandeau, n'avaient **aucun test** ; mes mutations ont survécu. C'est un manque de mon E10, pas de Benjamin (les tests fournis font foi). Il est comblé par **UT-DT-014-07 à 10** (`boutons-natifs-complements.test.tsx`, rang 14, verts, rougissent sous mutation). Aucun travail pour Benjamin.
- **T2, 2 mutations rapportées** : suffisantes. Chaque règle du §2 est lue par une assertion exacte de l'E10 (contour comparé en entier, `-2px` contre `2px`, valeur de la règle `.barre-onglets`, réserve de 88 px sur la dernière ligne). La mutation de la règle `ion-fab-button::part(native)` est couverte par E2E-DT-034-02.
- **Couverture** : aucune régression par fichier ; la baisse globale (−0,04 point de branches) vient des fichiers modifiés par d'autres changements du rang 13, pas de T1 à T3 : acceptée. La règle de non-régression par fichier est contrôlée par la CI.

## 5. Tests, rangs

- Les tests fournis sont intacts (diff vide), **aucun test affaibli**.
- `rangs-tests.json` : aucune règle à ajouter (`UT-DT-014`, `E2E-ANO-005-FEUILLE` déjà rattachés au rang 14). Mes ajouts (UT-DT-014-07 à 10, E2E-ANO-005-FEUILLE-06) sont donc exclus au rang 13 et rejoués avec `RANG_COURANT=14`. UT-OUT-14 (tout `E2E-…` a un rang) vert.
- `rangs-fichiers.json` : aucun squelette touché par T1 à T3 : sans remarque.
- `rangs-scenarios.json` : S16b et S16c repassent à 13 (décision 2.1). `pnpm verifier` 0 erreur.

## 6. Remarques

| Id | Gravité | Lieu | Constat et attendu | Statut |
|---|---|---|---|---|
| RC-CORR-1 | Mineure | `tests/unitaires/commun/presentation/ui/boutons-natifs.test.tsx` (E10) | Variantes de `ChoixRestauration`, `ModificationsNonRetenues` et de l'action du bandeau non testées (mutations survivantes). **Traité par Anthony** : UT-DT-014-07 à 10 ajoutés, ST §13.1. | **Close** (rien pour Benjamin) |
| RC-CORR-2 | Mineure | `src/synchronisation/presentation/ui/Bandeau.tsx:47` (commit `e899915`) | « Reprendre la synchronisation » du bandeau (`BAN-RAPPEL-24H`, variante `session`) devient `principal` alors que la ST §4.2 ne le listait pas (secondaire). Raison donnée : éviter une branche non couverte, ce qui n'est pas une raison de conception. **Accepté** : l'action unique d'un bandeau est son action principale, sur les trois variantes ; ST §4.2 alignée, test UT-DT-014-10. | **Close** |
| RC-CORR-3 | Non bloquante, **pour T5b** | `src/commun/presentation/ui/styles.css:314-323` (`.espace-application`, `.espaces`), `:409` (`ion-content.contenu-avec-fab`) | Retirer les trois rustines à T5b, valeurs de §5.2 bis de la ST v0.2, jusqu'à **E2E-ANO-005-FEUILLE-06** vert (2 exécutions). Ne pas en ajouter d'autre sans la justifier dans la revue de T5b. | **Ouverte** (T5b) |
| RC-CORR-4 | Suggestion | `src/commun/presentation/messages/codes.ts:144-145` | Ordre des deux codes `TXT-…-SOUS-TACHE` non alphabétique ; l'outil ne le contrôle pas, ma ST était contradictoire. ST alignée sur l'état livré. | **Close** (aucune action) |

Aucune remarque Bloquante, Majeure ni Mineure ouverte sur le code de T1 à T3.

## 7. Apports d'Anthony dans ce commit

- **ST-CORR-E13B-LOT-001 v0.2** : §2 et §4.3 bis (rustines déclarées), **§5.2 bis** (retrait par T5b), §4.2 (bandeau), §3.1 (ordre des codes), §9.1 et §12.1 (S16b, S16c), §13.1 (tests ajoutés), §15 (T5b), historique.
- **Tests** : `tests/unitaires/commun/presentation/ui/boutons-natifs-complements.test.tsx` (UT-DT-014-07 à 10, verts) ; `tests/e2e/feuille-synchronisation.e2e.ts` (E2E-ANO-005-FEUILLE-06, **rouge** au rang 14, 2 exécutions : à rendre vert par T5b).
- `tests/support/rangs-scenarios.json` : US-031 S16b et S16c → 13 ; `docs/lots/LOT-001.md` aligné.

## 8. Verdict

**Approuvé** pour T1, T2 et T3 : aucun changement de code requis. T4 peut commencer. Pour T5b : RC-CORR-3 (retrait des trois rustines) et E2E-ANO-005-FEUILLE-06 rouge à rendre vert.

Règle de relance (ST §9.1) : l'E13 de T4 rejoue `RANG_COURANT=14` sur UT-E13B-TXT, UT-DT-034 et UT-DT-014 (dont les compléments 07 à 10) et E2E-DT-034, E2E-DT-014.

## 9. Information pour Jarvis et Steeve (sans question bloquante)

- Steeve (E14) : le guide §4.1 demande un seul bouton principal par écran ; la feuille, le bandeau et le choix de restauration peuvent en montrer deux (par exemple « Mettre à jour » du bandeau et de la carte `ERR-013`, même action). Les attributions suivent la ST ; à contrôler en recette.
- Dette : aucune nouvelle. Les trois rustines sont transitoires et ont leur retrait daté (T5b, test rouge).
