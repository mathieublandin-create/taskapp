# Revue de code E13 — LOT-001, rang 4 (US-023 : organiser un objectif en sous-objectifs)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-30 |
| Branche | `us/US-023-rang4` @ `b554ec7` (PR #10, base `lot/LOT-001` @ `2b5aa57`, branche rebasée) |
| Auteur | Benjamin |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD`, 4 commits (`eab202a`, `0f36ed2`, `30020a5`, `b554ec7`) : 25 fichiers, + 1 170, − 117 |
| Référentiel | ST-US-023 v0.2 (§3, §4, §6, §8, §12 à §15), `checklist-revue-code.md` v0.3, `conventions.md` v0.4.7 (§8.5, §11.14, §12, §13.2), guide d'ergonomie §4.28, maquettes ECR-003 (C, D, E) et ECR-008 (A, C, D) |
| Passage | 1 |

## 1. Verdict : **Changements requis**

Aucune remarque bloquante. Le domaine est conforme à la ST :
- `verifierPlacement` est l'unique table de décision et suit l'ordre de Q-US-023-1 ;
- `alerteDelaiObjectif` est recalculée à la lecture, avec une comparaison stricte ;
- les décisions de création et de placement produisent `CREATION { parentId, delai? }` et `CHANGEMENT_PARENT` ; un placement `SANS_EFFET` n'écrit rien.

Les cas d'usage orchestrent sans règle. Les modèles de vue portent les codes. Aucun test fourni en E10 n'a été modifié.

Trois remarques restent ouvertes : une **majeure** (RC-US-023-1 : emplacement de « Placer sous un autre objectif ») et deux **mineures** (RC-US-023-2 et 3).

## 2. Contrôles exécutés

Contrôles locaux en Node 22, lancés par `node_modules/.bin` (pnpm refuse Node 22 : `engine-strict`), et CI de la PR.

| Contrôle | Résultat |
|---|---|
| CI de la PR #10 sur `b554ec7` | Tous les jobs sont verts : qualité, sécurité, build, e2e (CSP), tests dans les fuseaux UTC, America/New_York et Pacific/Auckland. `cucumber:steps-inutilises` est exécuté par le job qualité. |
| `TZ=UTC vitest run --coverage` | 130 fichiers ; 665 tests passés, 134 ignorés (rangs > 4) ; seuils par motif respectés |
| Non-régression de la couverture par fichier (`verifier-non-regression-couverture.ts`, base `origin/lot/LOT-001` recalculée) | 9 fichiers comparés, **0 régression**. Les 9 fichiers nouvellement mesurés au rang 4 sont listés ci-dessous. |
| Couverture des fichiers nouvellement mesurés | `hierarchie-objectifs.ts` : lignes 100 %, **branches 85,7 %** (RC-US-023-2). `alertes-delai.ts` : lignes 87,5 % (squelette ST-US-002, `fin = 5`, attendu). `consulter-selecteur-parent.ts` : branches 75 % (seul l'échec de lecture du dépôt n'est pas couvert, toléré). `selecteur-parent.tsx` : lignes 96,8 %, branches 80,8 %. Les autres fichiers sont à 100 %. |
| Tests E10 intacts (CR-60) | Oui : le différentiel ne touche aucun fichier de test existant ; un seul fichier de test est ajouté. |
| Rang | `rangCourant` = 4 est cohérent : `rangs-scenarios.json` place exactement S01 à S06, S08 à S12, S15 et S20 d'US-023 au rang 4 (LOT-001.md, ordre de réalisation). Les règles de rang 4 sont `UT-COMP-US-023-\d+` et `UT-US-023-\d+`. `@non-implemente` n'est plus importé par les fichiers de `fin = 4`. |

## 3. Décisions sur les points remontés par Benjamin

| # | Point | Décision |
|---|---|---|
| 1 | UT-COMP-US-001-75 : `actionsDuMenu` filtre `PLACER` et `CREER_SOUS_OBJECTIF`, que Benjamin a placées sur l'écran de détail | **Les deux actions sont traitées différemment.** **`CREER_SOUS_OBJECTIF` : conforme.** « Ajouter » est dans l'en-tête de la section « Sous-objectifs » (ECR-003 D, cible A) ; il est absent du menu et absent, non désactivé, sur un sous-objectif (ECR-003 E). **`PLACER` : à reprendre.** La maquette ECR-003 C fait de « Déplacer sous un autre objectif » une entrée du menu « … ». L'annotation d'ECR-008 le confirme : « Placer sous un autre objectif […] Entrée du menu « … » du détail (ECR-003) ». Le bouton dans le corps du détail n'est prévu par aucune maquette. Voir RC-US-023-1. UT-COMP-US-001-75 est un test de Benjamin, dont le titre annonçait déjà l'arrivée de ces actions avec US-023. **Accord écrit (CR-60)** : son attendu passe à `['RENOMMER', 'MODIFIER_DELAI', 'RETIRER_DELAI', 'PLACER', 'SUPPRIMER']` ; `CREER_SOUS_OBJECTIF` reste filtrée. |
| 2 | Titre du sélecteur et « Aucun, objectif principal » sans code de catalogue, en constantes dans `selecteur-parent.ts` et `libelles-ui.ts` | **Dette, non bloquant.** Ces textes viennent de la maquette ECR-008 C. Le guide §6.6 ne leur donne pas de code, et `verifier-catalogue` interdit d'en créer hors du guide. ST-US-023 §4.5 les disait « du catalogue » : c'est une imprécision de ma part, corrigée en v0.3. Les constantes sont uniques et nommées (CR-23 respecté), sans duplication. La même lacune touche aussi la carte d'alerte d'ECR-003 E (titre, explication, action « Modifier le délai ») et les indications d'ECR-008 C (« Son délai : … », « Aura n sous-objectifs »). Le tout est inscrit en **DT-015** (P2, avant l'E14 de LOT-001) ; la question Q-ANT-E13-R4-1 est adressée à Steeve via Jarvis. |
| 3 | `selecteur-parent.tsx` dans `rangs-fichiers.json` (4 / 4), règle `UT-COMP-US-023-\d+` → 4, UT-COMP-US-023-01 à 09 | **Validés, je les reprends à mon compte.** Le fichier est prévu par la ST (§3 n° 14) ; son squelette manquait à l'E10. Le contrôle UT-OUT impose son inscription. La règle est conforme à `conventions.md` §11.14 : `UT-COMP-\d+` (règle 1) ne la capture pas, et elle précède `UT-US-023-\d+`. Les tests 01 à 09 ont des assertions réelles. Pour 05 et 09, voir RC-US-023-5. |
| 4 | `construireSelecteurParent` : options indisponibles avec `ERR-030` en plus de `messageBloquant` | **Conforme à §6.5 et au guide §4.28.** « Seules l'option `AUCUN` et la fermeture restent possibles » impose de rendre les candidats indisponibles. Le guide demande que toute option indisponible soit présentée « avec la raison », une seule raison, selon l'ordre de Q-US-023-1 : `ERR-031` pour l'objectif lui-même (`selecteur-parent.ts:34`), puis `ERR-030` `objectif-a-des-sous-objectifs` pour les autres. C'est exactement ce qui est implémenté. L'option affiche le libellé court d'`ERR-030` (« Déplacement impossible »), sans variante ; l'explication complète reste dans la boîte « Compris ». |

## 4. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US-023-1 | Majeure | CR-07, CR-01 (ST-US-023 §4.5, §6.4 v0.3) | `src/objectifs-taches/presentation/ui/ecrans/detail-objectif.tsx:27`, `:115`, `:123`, `:130-134` ; `ui/composants/menu-objectif.tsx:6-17` ; `ui/libelles-ui.ts:30-36` ; `ui/ecrans/espace-objectifs.tsx:30-32`, `:137`, `:146-151` ; `tests/unitaires/objectifs-taches/presentation/ui/composants-objectifs.test.tsx:165-177` ; `…/ui/sous-objectifs-ui.test.tsx:143` | « Placer sous un autre objectif » est un bouton dans le corps du détail, alors qu'ECR-003 C et l'annotation d'ECR-008 le placent dans le menu « … ». | (a) Ajouter `'PLACER'` à `ORDRE_MENU`, entre `RETIRER_DELAI` et `SUPPRIMER` (ordre d'ECR-003 C), et `LIBELLES_OBJECTIFS.menu.PLACER = 'Placer sous un autre objectif'` (libellé à confirmer dans DT-015). Mettre à jour le commentaire d'en-tête de `menu-objectif.tsx`. (b) Dans `surActionMenu`, faire `PLACER` → `actions.ouvrirSelecteurParent(ecran.id)` et l'exclure du type de `FEUILLE_PAR_ACTION`. (c) Retirer la propriété `surPlacer` et le bouton du corps du détail ; `OrganisationDetail` ne garde que la section « Sous-objectifs ». (d) Mettre à jour UT-COMP-US-001-75 (titre et attendu du §3, point 1) et faire passer UT-COMP-US-023-05 par le menu « … ». `CREER_SOUS_OBJECTIF` reste hors du menu. | Ouverte | 1 |
| RC-US-023-2 | Mineure | CR-63, CR-65 (`conventions.md` §12 : domaine à 90 % de branches) | `src/objectifs-taches/domaine/hierarchie-objectifs.ts:18`, `:21` | Les étapes 1 et 2 de la table §6.1 (`ElementIntrouvable` pour X, puis pour C) ne sont exercées par aucun test : le fichier est à 85,7 % de branches. Le seuil du motif passe en agrégat, mais c'est la règle « X actif, C actif » de la table unique qui n'est pas vérifiée. | Ajouter UT-COMP-US-023-10 dans un nouveau fichier `tests/unitaires/objectifs-taches/domaine/hierarchie-objectifs-comp.test.ts`, sans modifier le fichier de l'E10. Il doit vérifier : X inconnu ou supprimé → `ElementIntrouvable` sur X, avec ou sans cible ; X actif et C inconnu ou supprimé → `ElementIntrouvable` sur C, et cette erreur passe avant `PlacementSousLuiMeme`. Le fichier doit atteindre 100 % de branches. | Ouverte | 1 |
| RC-US-023-3 | Mineure | CR-72 (`conventions.md` §13.2) | Commits `eab202a`, `0f36ed2`, `30020a5`, `b554ec7` | Les messages ne suivent pas la forme `<type>(<portée>): <résumé>` (« US-023 : … », « Rang 4 livré : … »). `eab202a` et `0f36ed2` n'ont pas les lignes d'attribution (signalé par Benjamin). | Reformuler les 4 messages, avec les lignes d'attribution, avant la nouvelle revue. Exemples : `feat(US-023): …`, `test(US-023): …`, `chore(rangs): rang 4 livré …`. La branche d'US n'est pas protégée, donc `git push --force-with-lease` est admis. Les commits de correction suivent la même forme. | Ouverte | 1 |
| RC-US-023-4 | Suggestion | CR-22 | `src/objectifs-taches/application/requetes/consulter-selecteur-parent.ts:31-34` | Le contrôle « objectif actif, sinon `ElementIntrouvable` » recode `objectifActif` (`domaine/vue-metier.ts:136`). | Utiliser `objectifActif(vue, c.objectifId)`. | Ouverte | 1 |
| RC-US-023-5 | Suggestion | CR-65 | `tests/unitaires/objectifs-taches/presentation/ui/sous-objectifs-ui.test.tsx:151`, `:210-225` | (a) UT-COMP-US-023-05 conclut sur `document.body.textContent` contenant « Objectif principal » : l'assertion est peu précise. (b) UT-COMP-US-023-09 teste un modèle de vue pur dans un fichier du projet `ihm` (jsdom). | (a) Viser la puce de niveau de l'en-tête du détail, ou l'absence de « Sous-objectif de « … » ». (b) Déplacer UT-COMP-US-023-09 dans `tests/unitaires/objectifs-taches/presentation/messages-de-refus-comp.test.ts`, en gardant le même identifiant. | Ouverte | 1 |
| RC-US-023-6 | Suggestion | CR-26 | `src/objectifs-taches/presentation/ui/ecrans/detail-objectif.tsx:25-26` | `surAjouterSousObjectif` est facultatif, avec un commentaire (« Absents tant que l'écran n'offre pas le geste ») qui ne correspond plus à la réalité : l'écran l'offre toujours. | Après RC-US-023-1, rendre la propriété obligatoire si les tests du rang 2 le permettent sans changer leur sens. Sinon, corriger le commentaire. | Ouverte | 1 |

## 5. Dette

| Id | Description | Décision |
|---|---|---|
| DT-015 | Textes des maquettes ECR-008 C et ECR-003 E sans code au catalogue (guide §6.6) : titre « Placer « {élément} » sous… », option « Aucun, objectif principal », indications des candidats, carte d'alerte du détail d'un sous-objectif avec son action « Modifier le délai », libellé de l'entrée de menu (« Placer » ou « Déplacer »). | **Inscrite** (`dette-technique.md` v0.18, P2). Q-ANT-E13-R4-1 est adressée à Steeve via Jarvis. |

## 6. Points ouverts hors de cette PR (conception, Anthony)

- **Q-ANT-E13-R4-1 (Steeve, via Jarvis)** :
  - codes du guide §6.6 pour les textes de DT-015 ;
  - libellé de l'entrée de menu : ECR-003 C dit « Déplacer sous un autre objectif », l'annotation d'ECR-008 dit « Placer sous un autre objectif » ;
  - la carte `ALR-007` d'ECR-003 E (titre, explication, « Modifier le délai ») fait-elle partie de LOT-001 ?
- **Q-ANT-E13-R4-2 (Steeve et Pepper, via Jarvis)** : la feuille de création d'ECR-008 B et G montre un champ « Placer sous un objectif » (« Aucun, objectif principal » par défaut). ST-US-023 ne le prévoit pas : la création d'un sous-objectif passe par « Ajouter » dans le détail du parent (ECR-003 D). Il faut savoir si ce champ relève de LOT-001. Si oui, j'ajouterai à la ST un incrément du rang 4 ou un rattachement à un rang ultérieur, avec ses tests. Ce n'est pas une remarque à Benjamin (CR-05 lui interdit de l'ajouter).
- ST-US-023 passe en **v0.3** :
  - §6.4 : emplacement des actions (`PLACER` dans le menu « … », `CREER_SOUS_OBJECTIF` dans l'en-tête de la section) ;
  - §4.5 : libellés du sélecteur sans code (DT-015) ;
  - §3 n° 14 : `selecteur-parent.tsx` inscrit à `rangs-fichiers.json` (4 / 4) ;
  - §14 : UT-COMP-US-023-01 à 10.

## 7. Suite

Retour en E12. La nouvelle revue portera uniquement sur RC-US-023-1 à 3 (et sur les suggestions, si Benjamin les retient), ainsi que sur le différentiel depuis `b554ec7`.
