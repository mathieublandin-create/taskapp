# Revue de code E13 — LOT-001, rang 9 (US-017, incrément 2 : conflits et modifications non retenues)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-01 |
| Branche | `us/US-017-rang9` @ `b54827c` (PR en brouillon, base `lot/LOT-001` @ `82fc44b`, branche à jour de sa base) |
| Auteurs | Bruce : B1, B1b, B1c (noyau de fusion), B2 (persistance, format), B3 (application). Benjamin : D1, D1b, D2, D3 (détail, modèle de vue, composant, composition, étapes, livraison du rang). Pepper (scénarios), Steeve (textes), Starck (DAT v0.11.9). |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 100 fichiers, + 9 838, − 318 |
| Référentiel | ST-US-017 v0.8 (§3.4, §4.6, §6.6, §8, §12.5, §13.4, §14, §15.1, §16), ST-socle v0.3.1 §6.2, DAT v0.11.9 (§4.2, §4.2.1, §6.1), guide d'ergonomie (§4.24, §6.6.9, §6.6.12, §10), `checklist-revue-code.md` v0.3, revues des rangs 5 à 8 |
| Passage | 1 (`b54827c`, revue `121e11b`) ; 2 (`a2eeb11`, différentiel `121e11b..a2eeb11`, §9) |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| CI de la PR sur `b54827c` (exécution `pull_request` 41300853063) | **Verte** : qualité, sécurité, build, e2e (CSP, navigateur réel), tests dans les trois fuseaux. L'étape « Non-régression de la couverture par fichier (DT-005) » du job UTC est verte (base `origin/lot/LOT-001`). |
| Tests fournis en E10 (CR-60) | Les seuls fichiers d'Anthony modifiés par un développeur sont **UT-US-017-59** (prop `contexte` ajoutée au rendu, aucune assertion touchée) et quatre doublures d'application dans les tests de contrôleur. Voir la décision 5. Les autres modifications de fichiers `UT-US-017-*` sont les miennes (v0.6 à v0.8). |
| Rangs | `rangCourant` = 9. Les douze fichiers créés dans `src/` sont dans `rangs-fichiers.json` à `debut = fin = 9`. `fin` passe à 9 pour `application.ts`, `controleur-interface.ts`, `main.tsx` et `detail-tache.ts`. Aucun `@non-implemente` ne reste dans `src/`. `rangs-tests.json` contient `CT-DEPOT-1[2-9]` → 9 (en tête) et `UT-US-017-1[01]\d` → 9. La règle `UT-COMP-US-017-2-\d+` → 9, promise au §14, manquait. Ces tests passaient quand même, par la règle `UT-COMP-US-017-\d+` → 3. **Je l'ajoute dans ce commit.** |
| Migration Dexie v3 | Ajout pur : `stores` complet, tables `valeursEcartees` et `lectures`, aucun `upgrade` (`depot-local-dexie.ts:84-85`). UT-US-017-53 vérifie qu'une base v2 est ouverte en v3 sans perte. Les signalements sont écrits dans la transaction stricte unique ; `version`, `dernierHlc` et les observateurs ne changent que si le plan **ou** les signalements sont non vides. Aucune perte de données possible. **Conforme.** |
| Sécurité | Aucun secret, aucun jeton, aucun `localStorage`, `console` ni `dangerouslySetInnerHTML` ajouté. Journal « erreur » `ReparationSansEntreeDeplacement` : un seul champ, `entree` (condensat opaque). Il est écrit après la transaction validée, jamais depuis le pré-contrôle (`cycle-synchronisation.ts:441-449`, UT-US-017-109). ADR-013 : rien de touché. **Conforme.** |
| Exécution locale (`vitest run`, Node 22) sur cet état, avec les apports de ce commit | 1 025 tests, dont 1 en échec **voulu** : le nouveau cas d'UT-SOC-16, qui attend RC-US-017-2 (voir la décision 3). Les nouveaux UT-US-017-117 et 118 sont verts. |

## 2. Convergence du noyau de fusion (point 2)

### 2.1 Revue par mécanisme

| Mécanisme | Commutativité, associativité, idempotence | Terminaison, pas de va-et-vient | Constat |
|---|---|---|---|
| Registres hors `suppression` (`fusion.ts:25-32`) | Plus grand HLC. Deux HLC égaux désignent la même écriture : la locale est gardée, et rien n'est écrit (UT-COMP-US-017-2-59). | La fusion ne crée aucun HLC. | **Conforme.** |
| Jointure des pierres tombales (`pierre-tombale.ts:79-101`) | La gagnante a le plus grand HLC, et `Ĉ` est le maximum des `Ĉ`. Le résultat est une fonction de l'ensemble des pierres tombales vues (preuve de Starck, invariant I). La référence est conservée si le résultat est égal : `planifierFusion` n'écrit rien (`fusion.ts:80`). | Les contextes ne font que croître, dans un ensemble fini. À deux appareils, il y a au plus une écriture de plus (S'). | **Conforme.** Une remarque sur la connaissance : décision 3. |
| Détection (`valeurs-ecartees.ts:137-268`) | La version locale d'une pierre tombale est examinée si son contexte diffère de la reçue (J3 respectée : « même HLC » suffit pour les autres champs). La gagnante est la jointure des pierres tombales examinées, et « connue » se juge pierre par pierre, ce qui équivaut à la jointure sous l'invariant I. | — | **Conforme**, sous réserve de RC-US-017-2. |
| Union des valeurs écartées (`valeurs-ecartees.ts:104-126`) | Ordre total : `hlcDuGagnant`, intitulé, puis sérialisation canonique. Une égalité de comparaison implique une égalité structurelle. Union = minimum pour un ordre total : semi-treillis. | Une entrée n'est réécrite que si sa référence change (`planifier-synchronisation.ts:47`). | **Conforme** (condition c 3 de Starck). |
| Lectures (`lectures.ts`) | Plus grand HLC par identifiant. | Idem. | **Conforme.** |
| Réparation RG-048 (`reparation-hierarchie.ts`) | La réparation est une fonction pure de l'état fusionné : candidats triés par `hlcOrigine`, puis par identifiant. Deux appareils qui réparent écrivent la même valeur sous deux HLC : la plus grande l'emporte, et les valeurs égales ne sont pas signalées. | La garde « déjà annulé » arrête la boucle sans exception. Après une réparation, la hiérarchie est valide et la passe suivante n'annule rien. | **Conforme.** |
| Journal de réparation (`entree-reparation.ts`, `fusion.ts:35-45`) | L'union garde la première entrée arrivée. Elle est commutative parce qu'une entrée de réparation est une fonction de (x, h, E) (condition C1). Le repli « E absente » est signalé et journalisé (C2). | Une entrée déjà connue n'est pas réécrite (`reparation-hierarchie.ts:206-208`). | **Conforme.** |

### 2.2 Tests de propriété de Bruce (graine 20261101)

Ils sont justes, mais chacun teste son mécanisme **isolément**. Aucun ne combine les mécanismes, alors que c'est leur combinaison qui a produit les deux erreurs de spécification rattrapées pendant ce rang.

- **UT-COMP-US-017-2-57** (J2, trois appareils, 200 tirages) : ce test ne déplace que X, et seulement sous E. E n'est jamais placé, donc il n'y a ni cycle ni deuxième niveau, et **aucune réparation**. L'assertion « aucun HLC créé » échouerait d'ailleurs s'il y en avait une. Le journal n'est pas comparé, et les lectures ne sont pas échangées. Le cas même qui a motivé J1 (une réparation postérieure à la pierre tombale de son appareil) n'y apparaît donc pas. Il est couvert à part par UT-COMP-US-017-2-53.
- **UT-COMP-US-017-2-12 et 13** (réparation, deux et trois appareils, 100 tirages, graine globale) : ces tests n'ont ni pierre tombale, ni renommage, ni lecture. Ils vérifient les entrées de réparation et la validité de la hiérarchie. Ils ne vérifient ni l'égalité des registres entre appareils, ni qu'un tour de plus n'écrit rien (va-et-vient de réparations non contrôlé).
- **UT-COMP-US-017-2-06** (symétrie) : ce test porte sur un seul échange entre deux états causaux. Il est correct dans ce cadre (voir la décision 4).
- **UT-COMP-US-017-2-58** : connaissance exacte et associativité du pliage. C'est un bon test, mais il sera à adapter à RC-US-017-2.

### 2.3 Test de propriété ajouté : UT-US-017-117 et 118 (Anthony)

Fichier : `tests/unitaires/synchronisation/domaine/convergence-globale.proprietes.test.ts`, 300 tirages par test, graine 20261101. Le test combine, à trois puis à deux appareils, plusieurs écritures causales : suppressions concurrentes, renommages, déplacements pondérés (qui forment des cycles et des deuxièmes niveaux, donc des réparations et leurs entrées de journal) et « Compris ». Les écritures sont refusées comme le ferait l'interface (ERR-030, élément supprimé). Les échanges se font dans un ordre quelconque, puis par tours complets. Le test vérifie :
1. **terminaison** : un tour complet finit par ne plus rien écrire (au plus 6 tours) ; aucun va-et-vient ;
2. **convergence** : registres (contextes compris), journal, valeurs écartées et lectures sont structurellement égaux sur tous les appareils ;
3. la hiérarchie est valide ;
4. **aucune perte silencieuse** (ENF-06) : toute écriture d'utilisateur perdue sans connaissance a son entrée. L'oracle de connaissance est écrit dans le test, indépendamment du code ;
5. **aucune suppression constatée à tort** : à chaque intégration, une entrée `SUPPRESSION` nouvelle n'est admise que si aucune pierre tombale vue par l'un ou l'autre appareil ne connaît l'écriture écartée.

**Les deux tests sont verts sur `b54827c`.** Je les ai vérifiés par mutation, sur une copie locale non commitée :
- sans jointure (registre `suppression` fusionné par plus grand HLC), ils sont **rouges** : S10c est retrouvé par le générateur ;
- avec un ordre total tronqué (sérialisation canonique retirée), ils sont **rouges** : les signalements divergent.

Les mutants « J1 retirée » et « version locale S' ignorée » restent verts ici. Ils sont tués par UT-COMP-US-017-2-53 et par UT-US-017-111 à 113.

Le générateur a aussi produit deux constats, sans défaut du code :
- **Q-ANT-E13-R9-1** (à Starck) : le DAT §4.2.1 dit d'une entrée de trop qu'elle n'arrive que « à trois appareils seulement ». C'est faux : il existe un contre-exemple à deux appareils (voir la décision 4).
- **Q-ANT-E13-R9-2** (à Starck) : deux déplacements concurrents sous le **même** parent sont signalés en conflit, parce que l'égalité compare aussi `hlcOrigine`. C'est inscrit en DT-027.

**Conclusion sur la convergence : le noyau converge**, à deux et trois appareils : commutativité, associativité, idempotence, terminaison, sans va-et-vient. La seule correction demandée sur le noyau est RC-US-017-2 : une définition de la connaissance au lieu de deux.

## 3. Décisions sur les points soumis

| # | Point | Décision |
|---|---|---|
| 1 | Conformité à la ST, au DAT et aux US | **Conforme**, sauf RC-US-017-3. Le détail est vérifié sur chaque point :<br>• valeurs écartées (n° 2 à 5) et signalement unique (identifiant déterministe, union) ;<br>• lecture (« Compris » en une transaction, même HLC, hors index des écritures en attente ; `aLire` par `compterALire` dans `attenteDe`, DT-025 respectée) ;<br>• réparation RG-048 (n° 7 à 10) et son entrée de journal (n° 9 b à 9 e : identifiant = texte du signalement, HLC, journée de l'entrée du déplacement, pas de `cause`, idempotence, C2) ;<br>• ordre de l'historique (n° 9 c) ;<br>• RG-049 réactivée (`resumerTache`) ;<br>• textes `ALR-008` à `ALR-011` et `ALR-014` conformes au guide v0.2.20, carte `ALR-008` repliable ;<br>• ordre de lecture des signalements (§6.2, UT-US-017-110) ;<br>• format v1 : motif lu avant la forme, objets lâches.<br>**Défaut bloquant : RC-US-017-3.** La variante `placement` d'`ALR-010` est choisie pour **tout** placement écarté par une suppression, y compris celui de l'objectif supprimé lui-même. Si cet objectif a été rendu principal en même temps, `intituleCite` lève `ErreurProgrammation` au rendu. Il n'y a pas de frontière d'erreur : l'application ne s'affiche plus, et l'entrée, synchronisée, bloque aussi l'autre appareil. Ma ST (n° 13) était ambiguë ; elle est corrigée en v0.9. |
| 2 | Convergence | Voir le §2. Le noyau converge. Seule RC-US-017-2 est demandée. UT-US-017-117 et 118 sont ajoutés. |
| 3 | **Q-BRU-4** (`estConnueCausalement` à côté d'`estConnue`) | **La règle du socle est fausse ; l'écart n'est pas validé.** Le DAT §4.2.1 dit « ses propres écritures **antérieures** ». Le 4e cas d'UT-SOC-16 vérifiait justement qu'une écriture **postérieure** du même appareil était « connue » : mon test fixait la mauvaise règle. Les deux fonctions coïncident partout où la gagnante est la plus grande (conflits). Elles ne diffèrent que pour une pierre tombale face à une écriture postérieure de son appareil, et là, seule J1 est juste. Garder deux définitions de la connaissance, c'est dupliquer une règle (CR-22) et laisser un piège. **Corrigé dans ce commit** : ST-socle v0.3.2 §6.2 ; UT-SOC-16, où le 4e cas est réécrit (écriture antérieure ou égale : connue) et un cas est ajouté (écriture postérieure : non connue, **rouge** jusqu'à RC-US-017-2) ; ST-US-017 v0.9 n° 3 et §16. |
| 4 | §14 : symétrie de détection à deux appareils | **Précisé en v0.9 §14.** La symétrie est une propriété d'**un** échange entre deux états **causaux** : les écritures d'utilisateur sont construites par `planifierEcritures` sur l'état de leur appareil, et les pierres tombales respectent l'invariant I. Dans ce cadre, le PC qui intègre le fichier du smartphone constate les mêmes entrées que l'inverse. La symétrie ne s'étend pas aux écritures produites par la fusion (réparations, jointures), dont les signalements convergent par l'union. Elle ne s'étend pas non plus à une suite d'échanges : une entrée constatée sur la vue partielle d'un appareil reste dans l'union, **à deux appareils aussi**. Contre-exemple trouvé par UT-US-017-118 : le smartphone place O3 sous O1 ; le PC supprime O3 et intègre le fichier ; puis le smartphone supprime O3 en connaissance du placement. Rien n'est perdu. → Q-ANT-E13-R9-1 à Starck (correction de « trois appareils seulement » au DAT). |
| 5 | Tests d'Anthony touchés par Benjamin | **Acceptés.**<br>• UT-US-017-59 : la prop `contexte` (`appareil`, `aujourdhui`) est imposée par les textes de Steeve (Q-ST017-STE-2 b, STE-3 : `{appareil}` d'`ALR-008`, année des dates), arrivés après l'E10. Aucune assertion n'est modifiée. La signature du §4.6 est étendue en conséquence.<br>• Les quatre doublures d'`ApplicationInterface` (`controleur-feuille`, `-interface`, `-reessai`, `-synchronisation`) reçoivent `lireModificationsNonRetenues` et `marquerCommeLue` : c'est une adaptation mécanique au port élargi par la ST (I2-21), sans assertion changée.<br>Aucun test n'est affaibli. |
| 6 | `ALR-003` / `ALR-004` sans carte ; partie `sousTitre` | **La carte manquante est une dette de ma ST, pas un défaut de réalisation.** ST-US-024 annonce la carte `InconsistencyCard` au rang 9. Mais la liste exhaustive des fichiers du rang (ST-US-017 §3.4 I2-20, §15.1 D2) ne cite que les modèles de vue, et Benjamin l'a suivie. Les scénarios RG-049 passent par `MEN-INCOHERENCE`. → **DT-026** (P2, rang 10, au plus tard avant l'E13b). Le champ du modèle de vue est utile et correct (variantes `sans-objectif` et `objectifs` conformes au catalogue). **`sousTitre`** : accepté. Le guide §6.6.9 décrit un sous-titre pour les variantes `rattachement` et `placement`, et une partie nommée du catalogue vaut mieux qu'un texte composé dans le composant. |
| 7 | Défauts des rangs précédents | Promesses jetées : les `void controleur.marquerCommeLue(…)` portent une issue rendue (toast ERR-014, « Réessayer »). `useOuvertureDemandee` suit le même schéma que `surOuvrirTache`. Pas de défaut.<br>**Focus** : après « Compris », la ligne disparaît et le focus est perdu (RC-US-017-8).<br>`aria-invalid`, Échap : sans objet (aucune saisie, aucune boîte).<br>**Textes dans les composants** : `libelle(…)` est appelé dans `ModificationsNonRetenues.tsx` (RC-US-017-7).<br>CR-72b : aucune saisie Ionic ; l'assertion après `userEvent.click` porte sur un état React, pas sur un champ Ionic. Conforme.<br>**Paramètres trop larges et replis** : `intituleCite` (RC-US-017-3), `default: assertNever` inatteignables (RC-US-017-6), `ids` élargis en `string` puis convertis par `as` (RC-US-017-5). `valeurEtat` (date absente) relève de la suggestion RC-US-017-11.<br>Couverture par fichier : verte (la CI fait foi). |
| 8 | Migration, journalisation, sécurité | **Conformes** (§1). |
| 9 | `rangCourant`, `rangs-fichiers.json`, `rangs-tests.json` | **Conformes** (§1). La règle `UT-COMP-US-017-2-\d+` → 9 est ajoutée par Anthony. |

## 4. Remarques

Gravité et statut selon la grille §1.3. Itération 1 pour toutes.

### 4.1 Domaine de fusion (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-2 | Majeure | CR-22, CR-01 ; ST-socle v0.3.2 §6.2 ; DAT v0.11.9 §4.2.1 (J1) | `src/synchronisation/domaine/contexte-causal.ts:38-56` ; `valeurs-ecartees.ts:3`, `:218`, `:237` | Deux définitions de la connaissance coexistent (décision 3). `estConnue` applique encore la règle fausse du socle. | 1) Appliquer J1 dans `estConnue` (branche « même appareil » : `comparerHlc(autre.hlc, gagnante.hlc) <= 0`) et supprimer `estConnueCausalement`. 2) Remplacer ses trois usages dans `valeurs-ecartees.ts` et dans `pierres-tombales-concurrentes.complements.test.ts` et `.proprietes.test.ts`. UT-COMP-US-017-2-54 (« les deux coïncident ») devient sans objet : le retirer ou le réécrire sur `estConnue` seule. Ce n'est pas un affaiblissement, puisque la fonction disparaît. 3) UT-SOC-16 doit être vert, ainsi que UT-US-017-41 à 45, 111 à 118 et UT-COMP-US-017-2-*. | Levée (passage 2) |
| RC-US-017-4 | Mineure | CR-22, CR-23 | `src/synchronisation/domaine/identifiant-evenement.ts:16` ; `infrastructure/stockage-local/schemas.ts:440-444` ; `infrastructure/drive/schemas/v1.ts:126-130` | La forme `/^[0-9a-v]{52}$/` d'un identifiant de valeur écartée est écrite trois fois. Par construction, c'est aussi celle d'une entrée de réparation. | Exporter une seule constante du domaine (`FORME_ID_VALEUR_ECARTEE` dans `valeurs-ecartees.ts`, avec `FORME_ID_EVENEMENT_REPARATION = FORME_ID_VALEUR_ECARTEE`) et l'utiliser dans les deux schémas Zod. | Levée (passage 2, écart accepté) |

### 4.2 Persistance et format (Bruce)

Aucune remarque. Les points vérifiés :
- version 3 en ajout pur ;
- transaction stricte unique ;
- ligne illisible → `DonneesLocalesIllisibles` ;
- motif inconnu du fichier → entrée ignorée, entrée de motif connu mal formée → `SCHEMA` ;
- tableaux triés par identifiant ;
- table d'appareils étendue aux signalements.

### 4.3 Application (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-9 | Mineure | CR-25 | `src/synchronisation/application/requetes/consulter-etat-synchronisation.ts:14` | Le commentaire renvoie à DT-022 (test instable), au lieu de DT-025. | Remplacer par « DT-025 ». | Levée (passage 2) |

### 4.4 Présentation et composition (Benjamin)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-3 | **Bloquante** | CR-07, CR-42 ; ST-US-017 v0.9 §6.6 n° 13 ; guide §6.6.9 | `src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues.ts:191-198`, `:165-169`, `:305-311` | `varianteDe` choisit `placement` dès que `information = PARENT`. C'est faux quand l'objectif supprimé est l'élément de R lui-même : par exemple, X supprimé sur le PC et déplacé en même temps sur le smartphone. Le texte affiché est alors faux (« « X » est devenu objectif principal »). Si X a été rendu principal, `valeurNonRetenue` vaut `PRINCIPAL` et `intituleCite` lève `ErreurProgrammation` au rendu. Sans frontière d'erreur, l'application ne s'affiche plus, sur les deux appareils, et l'entrée ne peut pas être marquée « Compris ». | 1) `placement` seulement si `v.information === 'PARENT'` **et** `v.supprime` désigne un autre élément que `v.element` ; sinon générique (objectif). 2) Test de modèle de vue `UT-COMP-US-017-2-nn` : X supprimé, `parent` de X écarté avec `PRINCIPAL` puis avec `SOUS`. La ligne est `ALR-010` sans variante, sans `voir`. `texteLigne` et `sousTitreLigne` ne lèvent rien et rendent le texte générique (« Votre modification de son placement n'a pas été conservée. »). 3) Test de composant qui rend cette ligne sans exception. | Levée (passage 2) |
| RC-US-017-5 | Mineure | CR-26 | `src/composition/controleur-interface.ts:273` ; `modeles-de-vue/modifications-non-retenues.ts:24`, `:40`, `:56` ; `ui/ModificationsNonRetenues.tsx:28` | Les identifiants sont élargis en `string` par le modèle de vue, puis reconvertis par `as` dans le contrôleur. La ST v0.8 §4.6 tapait `surCompris(ids: ReadonlyArray<string>)` : l'écart vient de ma ST, qui est amendée ici. | Typer `id` et `ids` en `IdValeurEcartee` (lignes, carte `ALR-008`, `surCompris`, `ControleurInterface.marquerCommeLue`) et supprimer le `as`. Le modèle de vue importe déjà des types du domaine. | Levée (passage 2) |
| RC-US-017-6 | Mineure | CR-24, CR-26 ; revue du rang 8, décision 3 | `modeles-de-vue/modifications-non-retenues.ts:210-211`, `:312-313`, `:340-341` | Trois branches `default: return assertNever(…)` sont inatteignables : c'est du code mort, compté dans la couverture du fichier. | Utiliser un `switch` exhaustif **sans** `default`, avec retour dans chaque cas (TS2366, comme `encoderValeurEcartee`), ou une table `Readonly<Record<…>>`. | Levée (passage 2) |
| RC-US-017-7 | Mineure | CR-16, CR-44 ; DT-021 point 2 | `src/synchronisation/presentation/ui/ModificationsNonRetenues.tsx:72`, `:155`, `:161`, `:166` | Le composant appelle `libelle(…)` lui-même : libellé « Compris », titre, nom accessible et action de la carte `ALR-008`. | Faire produire ces textes par le modèle de vue (`libelleCompris` sur la vue, `titre`, `nomAccessibleCompris` et `action` sur `donneesEffacees`). Le composant n'importe plus `libelle`. Assertions des tests inchangées. | Levée (passage 2) |
| RC-US-017-8 | Mineure | CR-07 ; guide §10 (WCAG 2.4.3) | `src/synchronisation/presentation/ui/ModificationsNonRetenues.tsx:65-73`, `:159-167` | Après « Compris », la ligne (ou la carte) disparaît, et le focus clavier retombe sur `body`. | Déplacer le focus, dans l'ordre : sur le « Compris » de la ligne suivante, sinon sur celui de la précédente, sinon sur le titre de la section (`tabIndex={-1}`), sinon sur le titre de la feuille. Ajouter un test de composant (`document.activeElement`). Comportement soumis à Steeve en E14 ; s'il le modifie, sa décision prime. | Levée (passage 2), reliquat en DT-028 |
| RC-US-017-11 | Suggestion | CR-26 | `src/synchronisation/domaine/detail-valeurs-ecartees.ts` (`ValeurSignalee` `ETAT`) ; `modeles-de-vue/modifications-non-retenues.ts:104-106` | Avec `date?`, le type admet une valeur « terminée » sans date, d'où un repli `ErreurProgrammation` inatteignable. | Facultatif : discriminer `{ etat: 'A_FAIRE' } \| { etat: 'TERMINEE' \| 'ABANDONNEE'; date }`. | Close sans suite (suggestion, passage 2) |

### 4.5 Étapes et tests (Benjamin, Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-10 | Mineure | CR-71 ; DT-022 | `tests/unitaires/objectifs-taches/presentation/ui/composants-objectifs.test.tsx:73-76` | DT-022 (UT-COMP-US-001-70 instable sous America/New_York) devait être levée « au rang 9 au plus tard ». Rien n'a été fait. | Benjamin : reproduire (`vitest --repeat 50`, `TZ=America/New_York`), corriger la cause sans allonger le délai ni affaiblir l'assertion, puis déclarer DT-022 remboursée dans cette PR. | Levée (passage 2), DT-022 remboursée |

Les étapes N1 à N11 sont conformes au §12.5 : inclusion pour N1, égalité stricte pour N2 et N3, « exactement une ligne » pour N6. La date d'une valeur d'état n'est pas comparée, comme prévu en v0.6. Aucune étape n'est affaiblie.

## 5. Questions ouvertes (via Jarvis)

- **Q-ANT-E13-R9-1** (Starck, non bloquante) : correction de « (cas à trois appareils seulement) » au DAT §4.2.1, « Existence d'une entrée ». Texte proposé : ST-US-017 v0.9 §16.
- **Q-ANT-E13-R9-2** (Starck, puis Pepper si la règle change ; non bloquante) : égalité d'un placement réduite à `parentId`. Voir DT-027.

## 6. Dette

- **DT-026** : la carte `ALR-003` / `ALR-004` d'ECR-007 n'est pas rendue (décision 6), P2.
- **DT-027** : deux déplacements concurrents sous le même parent sont signalés (Q-ANT-E13-R9-2), P2.
- **DT-022** : échéance du rang 9 non tenue (RC-US-017-10).
- **DT-025** : inchangée.

Registre v0.28.

## 7. Apports d'Anthony dans ce commit

- ST-US-017 v0.9 : n° 3, n° 13, §13.4, §14, §16.
- ST-socle v0.3.2 §6.2.
- UT-SOC-16 corrigé et complété : un cas rouge, qui attend RC-US-017-2.
- UT-US-017-117 et 118, verts.
- Règle `UT-COMP-US-017-2-\d+` → 9.
- Registre de la dette v0.28.

## 8. Verdict

**Changements requis.**

| Remarque | Gravité | Responsable |
|---|---|---|
| RC-US-017-3 | Bloquante | Benjamin |
| RC-US-017-2 | Majeure | Bruce |
| RC-US-017-4 | Mineure | Bruce |
| RC-US-017-9 | Mineure | Bruce |
| RC-US-017-5 à 8 | Mineures | Benjamin |
| RC-US-017-10 | Mineure | Benjamin |
| RC-US-017-11 | Suggestion | Benjamin |

La nouvelle revue portera uniquement sur ces remarques et sur le différentiel.

## 9. Passage 2 (`a2eeb11`, différentiel `121e11b..a2eeb11`)

Périmètre : remarques ouvertes et différentiel seulement (17 fichiers, + 374, − 128). Mesures de Jarvis sur la branche fusionnée : `pnpm verifier` 0 erreur, `pnpm test` 1 029/1 029 (UT-SOC-16, UT-US-017-117 et 118 compris), Cucumber 373/373. Contre-mesure d'Anthony : les 15 fichiers de tests concernés (présentation, J1, convergence, `contexte-causal`) sont verts ; UT-COMP-US-001-7x, 6 exécutions parallèles sous `TZ=America/New_York` : vertes.

### 9.1 Remarques

| Id | Constat au passage 2 | Statut |
|---|---|---|
| RC-US-017-2 | Une seule `estConnue`, avec J1 (`contexte-causal.ts:44-47`) ; `estConnueCausalement` n'existe plus dans `src/` ni dans `tests/`. Le seul autre usage, la détection des conflits (`valeurs-ecartees.ts:162`), compare à la plus grande écriture : J1 n'y change rien. Compléments réécrits **sans affaiblissement** : -52 garde ses six attendus (dont l'égale, `h(2, PC)`, connue, et la postérieure, `h(4, PC)`, non connue) ; -54, qui comparait les deux fonctions, fixe désormais cinq valeurs attendues explicites, toutes justes (`h(1, PC)`, `h(2, PC)` ≤ `h(3, PC)` : connues ; `h(1, SMARTPHONE)` couvert par le contexte : connue ; `h(2, SMARTPHONE)`, `TROISIEME` : non connues), ce qui est plus fort qu'une égalité entre deux implémentations ; -58 (propriété) vérifie la connaissance exacte de la jointure sur `estConnue`. | Levée |
| RC-US-017-4 | **Écart accepté.** La constante demandée dans `valeurs-ecartees.ts` aurait fait dépendre `identifiant-evenement.ts` d'un module qui en dépend déjà (cycle refusé par dependency-cruiser) : ma demande était irréalisable telle quelle. Le motif unique `FORME_CONDENSAT_BASE32HEX` est placé dans `condensat-sha256.ts`, qui produit cette forme (`encoderBase32Hex`) : c'est son lieu naturel. `FORME_ID_VALEUR_ECARTEE` et `FORME_ID_EVENEMENT_REPARATION` en sont des alias nommés, et les deux schémas Zod utilisent le premier. Plus aucun littéral `[0-9a-v]{52}` dans le code (seulement dans des commentaires). | Levée |
| RC-US-017-9 | `consulter-etat-synchronisation.ts:14` renvoie à DT-025. | Levée |
| RC-US-017-3 | **Conforme à la ST v0.9 n° 13.** `varianteDe` (`modifications-non-retenues.ts:202-210`) ne donne `placement` que si `information = PARENT` **et** `supprime` ≠ `element` (comparaison du type et de l'identifiant). Sinon : objectif supprimé → aucune variante (titre générique), `voir` absent puisque l'élément n'existe plus, texte « Votre modification de son placement n'a pas été conservée. » (branche générique de `texteSuppression`), aucun sous-titre. `intituleCite` n'est plus appelé sur `PRINCIPAL`. UT-COMP-US-017-2-61 couvre `PRINCIPAL` puis `SOUS` au niveau du modèle de vue (code, variante, `voir`, texte, sous-titre) ; UT-COMP-US-017-2-62 rend la ligne sans exception (pas de `data-variante`, un seul bouton). **Frontière d'erreur : non nécessaire pour ce rang.** Le chemin qui levait est supprimé, et aucune autre combinaison atteignable ne mène à `intituleCite` sans intitulé (`ALR-011` porte toujours `SOUS`, `rattachement` toujours `RATTACHEE` / `DETACHEE`). Une frontière d'erreur générale de l'application est un choix d'architecture (DAT), absent de la ST : ce n'est pas une exigence de cette revue. | Levée |
| RC-US-017-5 | `IdValeurEcartee` de bout en bout : lignes, carte, `surCompris`, `ControleurInterface.marquerCommeLue` ; plus de `as` dans le contrôleur. Les seuls `as IdValeurEcartee` restants sont aux frontières Zod (après la regex) et dans les fixtures de test. | Levée |
| RC-US-017-6 | `CODES_MOTIF` en `Readonly<Record<MotifValeurEcartee, …>>` ; `texteSuppression` et `texteLigne` en `switch` exhaustifs sans `default` (TS2366). Plus d'import `assertNever`. | Levée |
| RC-US-017-7 | `libelleCompris`, `titre`, `nomAccessibleCompris` et `action` produits par le modèle de vue ; le composant n'importe plus `libelle`. | Levée |
| RC-US-017-8 | Focus sur le « Compris » suivant, sinon le précédent, seulement s'il est tombé sur `body` (un échec d'écriture garde le focus) ; UT-COMP-US-017-2-63 et 64 (`document.activeElement`). **Les deux derniers replis demandés ne sont pas faisables dans ce composant, et je l'accepte** : quand la dernière entrée est retirée, `construireModificationsNonRetenues` rend `undefined` et la section est démontée (`main.tsx:168`), donc son titre n'existe plus ; la feuille ECR-011 (`FeuilleSynchronisation`) n'a pas de titre. Le focus retombe alors sur `body`. C'est un écart WCAG 2.4.3 résiduel, sans perte de données, dont la cible relève de la feuille et d'un choix d'ergonomie (Steeve, E14) : **dette DT-028** (P2), pas un défaut de ce rang. | Levée, reliquat en DT-028 |
| RC-US-017-10 | UT-COMP-US-001-70 pose la valeur et émet `ionInput` (`renseigner`) ; assertions inchangées ; DT-022 déclarée remboursée. Accepté. **UT-COMP-US-001-73** (2 échecs sur 4 chez Bruce, non reproduit en 6 exécutions parallèles chez Anthony) : **même famille** (synchronisation des événements Ionic sous charge), autre mécanisme : deux assertions **synchrones** juste après `userEvent.type(…, '{Enter}')` et `cliquerBoutonIon('Annuler')` (`composants-objectifs.test.tsx:156-157`, `:163-164`), contraires à CR-72b. Test antérieur au rang 9, hors différentiel : **dette DT-029** (P2, Benjamin, rang 10), pas une condition de cette PR. | Levée |
| RC-US-017-11 | Suggestion non retenue : la discrimination du type `ETAT` rendrait sans objet le cas d'erreur d'UT-COMP-US-017-2-39. Accepté. | Close sans suite |

### 9.2 Tests d'Anthony modifiés par Benjamin

| Test | Modification | Décision |
|---|---|---|
| UT-US-017-58 | `toEqual` de `donneesEffacees` complété par `titre`, `nomAccessibleCompris`, `action` (RC-US-017-7) | **Acceptée** : l'égalité stricte reste, l'attendu est plus large ; rien n'est retiré. |
| UT-US-017-59 (fixture `VUE` de `modifications-non-retenues.test.tsx`) | Champs ajoutés par RC-US-017-7 ; identifiants typés par `idv` | **Acceptée** : adaptation de type, aucune assertion touchée. |
| UT-COMP-US-017-2-44 | `id: 'x'` → `idArbitraire(0)` | **Acceptée** : imposée par RC-US-017-5, sans effet sur l'assertion. |

### 9.3 Convergence

UT-US-017-117 et 118 restent des garde-fous suffisants. Leur oracle de connaissance (`connait`, `convergence-globale.proprietes.test.ts:235-240`) est écrit dans le test et appliquait déjà J1 : il ne dépend pas d'`estConnue`. La détection utilisait déjà J1 (`estConnueCausalement`) avant RC-US-017-2 ; le seul usage dont la fonction change, les conflits, n'est pas affecté (gagnante la plus grande). Le mutant « J1 retirée » reste tué par UT-COMP-US-017-2-52, 53 et UT-SOC-16.

### 9.4 Questions transmises (via Jarvis, non bloquantes)

- **Q-ANT-E13-R9-1** (Starck) : inchangée (§5).
- **Q-ANT-E13-R9-2** (Starck, puis Pepper si la règle change) : inchangée, DT-027.

### 9.5 Verdict du passage 2

**Approuvé.** Aucune remarque ouverte, aucun point bloquant. Dette inscrite : DT-028, DT-029 (registre v0.29).
