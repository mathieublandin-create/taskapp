# Revue de code E13 — LOT-001, dettes P1 DT-015, DT-017, DT-019 (branchement des codes du catalogue)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-01 |
| Auteur | Benjamin |
| Branche | `us/DT-015-017-019-catalogue` (PR #27, brouillon, base `lot/LOT-001` à `de72ba9`), tête `d8c4607` |
| Périmètre | Différentiel `origin/lot/LOT-001...d8c4607` (DEC-040) : commits `ae3be7f`, `db7fa90`, `d8c4607` de Benjamin ; la fusion `27ac97f` (guide d'ergonomie v0.2.21, Steeve) est lue comme référentiel |
| Référentiel | Guide d'ergonomie v0.2.21 §6.6.1, §6.6.4, §6.6.7, §6.6.9, §6.6.13 ; `checklist-revue-code.md` v0.3 ; ST-US-002, 023, 024, 025 ; `dette-technique.md` (DT-015, DT-017, DT-019) |
| Passage | 1 |

## 1. Verdict : **Changements requis**

Le branchement est fidèle au guide, mot pour mot. La CI est verte, sans test affaibli. Je demande quatre corrections mineures (RC-CAT-1 à RC-CAT-4) avant la fusion. Aucune n'est bloquante. Les ST sont à jour (ST-US-002 v0.5, ST-US-023 v0.4, ST-US-024 v0.5, ST-US-025 v0.3). J'ai inscrit trois dettes, DT-030 à DT-032 : ce sont des écarts antérieurs à la PR, relevés pendant la revue.

## 2. Contrôle préalable (§1.2)

| Point | Constat |
|---|---|
| CI de la PR sur `d8c4607` | Tous les jobs sont verts : `qualite`, `securite`, `build`, `e2e (CSP, navigateur réel)` et `tests` dans les trois fuseaux. Le job `tests (UTC)` passe 1 036 tests ; `verifier:catalogue` donne « 0 erreur(s) » ; la non-régression de la couverture donne « 15 fichier(s) comparé(s), 0 erreur(s) » |
| Rebasage | `de72ba9`, la tête de `lot/LOT-001`, est l'ancêtre commun. La PR apporte aussi le guide v0.2.21 (fusion `27ac97f`), qui doit l'accompagner |
| DoD | Cochée par Benjamin, sauf la sécurité (verte en CI) et la grille (cette revue) |
| `TODO(DT-0…)` dans `src/` | Aucun. Aucun `TODO` restant |

## 3. Point 1 — Conformité au guide v0.2.21, mot pour mot

| Code | Constat | Avis |
|---|---|---|
| `ETA-TACHE-CASE` | La base est « Terminer « {element} » ». La variante `rouvrir` est « Rouvrir « {element} » ». Le libellé visible est vide | Conforme (§6.6.4) |
| `ETA-TACHE-LIGNE` | La base est « {element}, {etat}, délai {date} ». Les 8 variantes sont `retard`, `alerte-objectif`, `alerte-tache`, `estimation`, `objectif`, `objectifs`, `sous-taches` (accord sur `t`) et `incoherence`. Leurs textes sont exacts. Les parties sont jointes par « , » dans l'ordre du guide (`partiesDuNom`). L'état est donné par la forme `nomAccessible` des codes `ETA-TACHE-*`, sans date | Conforme. Seul écart : la puce des objectifs d'une sous-tâche (RC-CAT-1) |
| `ALR-007` variante `detail` | Le titre, le texte et l'action « Changer le délai » sont exacts. `{dateParent}` est formaté depuis `alerteDelai.delaiParent` | Conforme (§6.6.9) |
| `CNF-ABANDON-TACHE-CASCADE` | Le texte est complet, avec le rappel de la reprise. Le nombre est toujours écrit hors des formes plurielles. `{n}` et `{t}` sont accordés (0 et 1 au singulier). La variante `sans-terminee` s'applique quand t = 0, et `CNF-ABANDON-TACHE` quand n = 0 | Conforme (§6.6.7, §6.6.13) |
| Espaces insécables | Le catalogue est écrit avec des espaces ordinaires. `libelle()` les rend insécables dans les guillemets « » et avant « : » (vérifié dans `libelle.ts:17-21`). Les tests attendent donc ` ` | Conforme. Deux écarts typographiques sont **antérieurs** à la PR : aucune espace insécable entre le nombre et l'unité (`format/duree.ts`, `format/date.ts`) ni avant « · ». Ils sont inscrits en DT-032 |
| `SEL-PARENT-*` | `TITRE`, `AUCUN`, `MENU` (menu et légende), `VALIDER`, `DELAI` et `EFFECTIF` (n = autres + 1, absent si autres = 0) sont branchés. Les indications figurent sur une ligne, dans l'ordre délai puis effectif. Elles sont absentes pour AUCUN et pour un candidat indisponible | Conforme |

## 4. Point 2 — Tests d'Anthony adaptés par Benjamin (CR-60, CR-61)

Toutes les adaptations suivent le guide v0.2.21. **Aucune n'affaiblit un test.** Je donne ici, par écrit, l'accord qu'exige CR-60.

| Test | Adaptation | Décision |
|---|---|---|
| UT-US-024-16 (et les noms de case de `sous-taches-ui`, `terminer-rouvrir-ui`) | `« … »` à la place d'espaces ordinaires | Accepté. C'est la typographie du guide §6.6.1, appliquée par `libelle()`. La comparaison reste exacte. Le plan de DT-019 disait « inchangé » : ce plan était imprécis, pas le test |
| UT-COMP-US-002-42 | « terminée » et « abandonnée » sans date ; « estimation 1 h » ajouté | Accepté. Ce sont la forme du nom accessible (§6.6.4, v0.2.20) et la partie `estimation`, toujours affichée. Les comparaisons gardent la même force (`toBe` et `toMatch` ancrés) |
| UT-COMP-US-001-17 | Assertion `toEqual` de la carte ajoutée | Renforcement |
| UT-COMP-US-001-49 | `delaiParent` ajouté à la donnée | Accepté. La donnée est exigée par `{dateParent}` ; les assertions sont inchangées |
| UT-COMP-US-001-12 | `toContain('Ses 3 sous-tâches…')` remplacé par `toBe` sur le texte complet de la variante `sans-terminee` | Renforcement |
| UT-US-025-01, UT-US-025-02, UT-US-025-14 | `sousTachesTerminees` (ou `t`) ajouté au `toEqual` / `toMatchObject` | Renforcement : -02 vérifie t = 1 |
| `construireSelecteurParent` (UT-US-023-15, UT-COMP-US-023-01) | Entrées `jour` et `autresSousObjectifs` | Adaptation de type, assertions inchangées. Les entrées changeront encore avec RC-CAT-2 |
| UT-COMP-US-025-02 | `variables` attend `t: 0` et `variante: 'sans-terminee'` | Renforcement |

Tests ajoutés par Benjamin (CR-65) : UT-COMP-US-002-95, UT-COMP-US-023-11 à 14, UT-COMP-US-024-11 et UT-COMP-US-025-16. Leurs identifiants sont uniques. Ils suivent la structure Préparer / Agir / Vérifier et comparent des textes exacts. Ils sont conformes.

## 5. Point 3 — `sousTachesTerminees` et `SelecteurParent`

- **`ABANDON_TACHE.sousTachesTerminees`**, calculé par `evaluerAbandon` (`abandonner-tache.ts:33-56`) : conforme. Le domaine reste pur ; il s'agit d'un décompte sur la vue, issu de la même lecture que `sousTachesAbandonnees`, déjà calculé là (ST-US-025 §4.1). Le cas d'usage n'ajoute aucune règle. ST-US-025 passe en v0.3.
- **`SelecteurParent.jour`** : conforme. C'est le jour de Paris de la même lecture que les résumés (`VueCourante`), ce qui garantit la cohérence entre l'état et le format. ST-US-023 passe en v0.4.
- **`SelecteurParent.autresSousObjectifs`** (table séparée) : à revoir (RC-CAT-2). La table laisse un repli `?? 0` qui ne peut jamais servir. ST-US-023 v0.4 retient un nombre porté par chaque candidat (`CandidatParent`).
- Architecture : aucune dépendance nouvelle entre couches. Les tests d'architecture sont verts. Aucun type de framework n'entre dans l'application.

## 6. Point 4 — Puce des objectifs d'une sous-tâche

**Décision : défaut, corrigé dans cette PR (RC-CAT-1).** Ce n'est ni une dette, ni une question à Steeve. Le guide §6.6.4 est explicite : une sous-tâche a des objectifs « hérités et non affichés ». La puce affichée par `ligne-tache.tsx` sur les lignes de sous-tâche (détail d'un objectif, `sections-taches.tsx`) contredit donc le guide. Avant cette PR, l'écart était invisible. La PR l'a rendu manifeste : le nom accessible omet l'objectif alors que l'écran le montre. La correction doit faire dériver la puce et la partie du nom d'**une seule** donnée du modèle de vue. `objectifs` ne peut pas être vidé, car `detail-tache.ts` s'en sert pour le détail (objectifs hérités sous cadenas) et pour la carte d'incohérence.

## 7. Point 6 — Défauts récurrents des rangs précédents

| Point | Constat |
|---|---|
| Promesses jetées | Aucune nouvelle (`onClick={surChangerDelai}` est synchrone) |
| Focus, Échap | Sélecteur inchangé. « Changer le délai » ouvre la feuille `DELAI` par le même `geste.ouvrirFeuille` que le menu, avec le même retour du focus |
| `aria-invalid` | Sans objet (aucun champ nouveau) |
| CR-72b | Aucune saisie Ionic dans les tests nouveaux. Les vérifications après ouverture passent par `findBy…` |
| Paramètres trop larges, repli inatteignable | `autresSousObjectifs.get(…) ?? 0` (RC-CAT-2) ; `surChangerDelai` facultatif alors que son seul appelant le fournit toujours (RC-CAT-3) |
| Couverture par fichier (CI) | 0 erreur sur 15 fichiers. `ligne-tache.ts`, `ligne-tache.tsx`, `catalogue.fr.ts` et `libelle.ts` sont à 100 % |

## 8. Remarques

| N° | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-CAT-1 | Mineure | CR-07, CR-16 | `src/objectifs-taches/presentation/ui/composants/ligne-tache.tsx:19-36` ; `modeles-de-vue/ligne-tache.ts:98-108`, `:185` | La puce des objectifs hérités est affichée sur une ligne de sous-tâche, contrairement au guide §6.6.4. Le nom accessible, lui, l'omet. La règle (« objectifs hérités ») vit dans `partieObjectifs` et pas dans le rendu | Ajouter à `LigneTache` le champ `objectifsAffiches: ReadonlyArray<string>` : `[]` si `resume.objectifsHerites`, sinon les intitulés (un seul assistant). `PucesObjectifsLigne` lit `ligne.objectifsAffiches` ; `partieObjectifs` part de la même valeur. `objectifs` reste inchangé pour `detail-tache.ts`. Tests : UT-COMP-US-002-96 et un test de composant qui vérifie l'absence de `.ligne-tache-objectifs` sur une ligne de sous-tâche (ST-US-002 v0.5 §4.5, §13) | Ouverte |
| RC-CAT-2 | Mineure | CR-26, CR-22 | `src/objectifs-taches/application/requetes/consulter-selecteur-parent.ts:18-21`, `:44-49` ; `modeles-de-vue/selecteur-parent.ts:38` | `autresSousObjectifs` est une table séparée des candidats. Le `?? 0` du modèle de vue ne peut jamais servir, car la table couvre tous les principaux, c'est-à-dire tous les candidats. Un paramètre trop large impose un repli fictif | Remplacer la table par `candidats: ReadonlyArray<CandidatParent>`, avec `CandidatParent = ResumeObjectif & { readonly autresSousObjectifs: number }`, calculé dans la requête. Supprimer le champ `autresSousObjectifs` de `SelecteurParent` et le `?? 0`. Adapter les fabriques des tests UT-US-023-15, UT-COMP-US-023-01, 11 et 13, sans toucher aux assertions (ST-US-023 v0.4 §4.2) | Ouverte |
| RC-CAT-3 | Mineure | CR-05, CR-26 | `src/objectifs-taches/presentation/ui/ecrans/detail-objectif.tsx:23-24`, `:169-173` | `surChangerDelai` est facultatif : « sans lui, la carte n'offre pas Changer le délai ». Or le guide fixe une action unique à la carte, et le seul appelant (`espace-objectifs.tsx`) la fournit toujours. La branche sans action est un rendu non conforme qui n'existe que pour les tests | Rendre `surChangerDelai` obligatoire dans `ProprietesDetailObjectif` et retirer la condition. Les tests passent `vi.fn()` par `proprietes()` (ST-US-023 v0.4 §4.5) | Ouverte |
| RC-CAT-4 | Mineure | CR-25 | `src/objectifs-taches/presentation/modeles-de-vue/selecteur-parent.ts:33` | Le commentaire « Un objectif qui a des sous-objectifs ne peut aller sous aucun objectif : seule l'option AUCUN reste » documente désormais `indicationsDe`, à laquelle il ne s'applique pas (il précédait `optionObjectif`) | Replacer le commentaire au-dessus de `messageBloquant` ou de `optionObjectif`, et donner à `indicationsDe` son propre commentaire (déjà présent sur le champ `indications`) | Ouverte |
| RC-CAT-5 | Suggestion | CR-16, CR-23 | `ui/composants/selecteur-parent.tsx:42` | Le séparateur `' · '` est codé dans le composant | Le fournir par le modèle de vue (un `libelle` d'indications déjà joint). Facultatif | — |
| RC-CAT-6 | Suggestion | CR-25 | `modeles-de-vue/detail-tache.ts:27-30` | Le commentaire de `LigneSousTache.nomAccessible` décrit l'ancien gabarit (« suivi de « , en retard » ») | Renvoyer à `ETA-TACHE-LIGNE` (ST-US-024 v0.5) | — |
| RC-CAT-7 | Suggestion | CR-21 | `modeles-de-vue/ligne-tache.ts:84` | `nomAccessibleCase(intitule, rouvrir = false)` : un booléen avec valeur par défaut | Passer l'état (`'A_FAIRE' \| 'TERMINEE'`) ou la variante explicitement | — |

Question pour Steeve (E14, non bloquante) : la légende du groupe de radios du sélecteur reprend `SEL-PARENT-MENU`, « Placer sous un autre objectif ». Le guide ne donne pas de légende ; le titre `SEL-PARENT-TITRE` dit déjà la même chose. À confirmer en recette ergonomique.

## 9. Point 7 — Clôture de DT-015, DT-017, DT-019

- **DT-015** : remboursée, critère atteint. Plus aucune constante `INTITULE_AUCUN_PARENT`, `titreDuSelecteur`, `placerSous`, `validerPlacement` ni `menu.PLACER`. Les indications et la carte sont réalisées. RC-CAT-2 et RC-CAT-3 portent sur la forme, pas sur le texte.
- **DT-017** : remboursée. Le gabarit vient du catalogue, avec une partie par information affichée. RC-CAT-1 corrige l'affichage, pas le nom.
- **DT-019** : remboursée. `ETA-TACHE-CASE` est branché partout. La variante `rouvrir` est calculée pour une sous-tâche terminée, mais aucune case pleine n'est encore rendue (`section-sous-taches.tsx` ne rend la case qu'à l'état « à faire »). Ce rendu relève de Q-ANT-E13-R7-1 b, hors DT-019 : je l'inscris en DT-030.
- Statut au registre : « Remboursée (v0.30) », **effective à la fusion de la PR #27**, mention ajoutée en v0.31. L'en-tête du registre revient à Anthony.

## 10. Dette inscrite (registre v0.31)

| Id | Description | Priorité |
|---|---|---|
| DT-030 | La case « Rouvrir » de la liste « Terminées » et des sous-tâches terminées d'ECR-007 A n'est pas rendue. L'intitulé n'est pas barré pendant le maintien de 3 s. C'est la réponse de Steeve à Q-ANT-E13-R7-1 b et c (guide §6.6.13), qu'aucune ST ni dette ne suivait | P1 |
| DT-031 | `MEN-INCOHERENCE` n'est pas rendue sur la ligne (`ligne-tache.tsx`). Le modèle de vue l'expose, et le nom accessible l'annonce désormais | P1 |
| DT-032 | Typographie : pas d'espace insécable entre le nombre et l'unité (`formaterDuree`, `formaterDate`) ni avant « · » (`libelle()`), contrairement au guide §6.6.1 | P2 |

## 11. Suite

Benjamin corrige RC-CAT-1 à RC-CAT-4 sur `us/DT-015-017-019-catalogue`. Le passage 2 ne portera que sur ces remarques et sur le différentiel correspondant.

## 12. Passage 2 (HEAD 3f2d629, différentiel 14a0308..3f2d629)

**Verdict : Approuvé.**

| N° | Statut | Contrôle |
|---|---|---|
| RC-CAT-1 | Close | `objectifsAffiches` est la source unique de la puce et du nom accessible ; vide pour une sous-tâche ; `objectifs` inchangé. UT-COMP-US-002-96 en deux tests (modèle de vue, composant) |
| RC-CAT-2 | Close | `CandidatParent` calculé par la requête ; table et `?? 0` supprimés |
| RC-CAT-3 | Close | `surChangerDelai` obligatoire, condition retirée |
| RC-CAT-4 | Close | Commentaires replacés |
| RC-CAT-5 | Acceptée en l'état | Séparateur `' · '` laissé dans le composant |
| RC-CAT-6, 7 | Closes | Commentaire à jour ; `nomAccessibleCase(intitule, 'TERMINER' \| 'ROUVRIR')` |

Tests : aucune assertion existante modifiée (seules les fabriques et entrées changent ; les 4 assertions ajoutées sont celles du test -96). Couverture : la CI de 3f2d629 était encore en cours à la revue (build vert) ; elle fait foi. Aucun point bloquant.
