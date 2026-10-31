# Revue de code E13 — LOT-001, rang 6 (US-024 : décomposer une tâche en sous-tâches)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-31 |
| Branche | `us/US-024-rang6` @ `bbe5d34` (PR #18, brouillon, base `lot/LOT-001`, à jour de la base) |
| Auteur | Benjamin (`8371126` domaine et application, `ca08e3b` modèles de vue, `778de62` interface, Cucumber et fin de rang) ; `489a2ea` est d'Anthony (ST v0.3, DT-019, rattachements) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 34 fichiers, + 1 478, − 164 |
| Référentiel | ST-US-024 v0.3 (§3, §4, §6, §8, §12, §13, §15, §16), `checklist-revue-code.md` v0.3, ST-US-018 §12.1, guide d'ergonomie (§4, §5.8 e, §6.6.7, accessibilité), revue du rang 5 |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| CI de la PR #18 sur `bbe5d34` | Tous les jobs sont verts : qualité, sécurité, build, e2e (CSP), tests dans les fuseaux UTC, America/New_York et Pacific/Auckland. |
| Contrôles locaux (Node 22 : outils lancés directement, `pnpm` refusant le moteur) | `tsc`, `eslint --max-warnings 0`, `prettier --check`, `depcruise` (0 violation), catalogue, tags, rangs et hygiène du dépôt : 0 erreur. `vitest --coverage` : 821 tests passés, 56 ignorés (rangs 7 et suivants, dont UT-US-024-21 et 22) ; seuils atteints. |
| Tests fournis en E10 (CR-60) | Aucun fichier de test d'E10 d'US-024 n'est modifié par Benjamin. Seul `489a2ea` (Anthony) touche aux rattachements. Les tests sont intacts. |
| Entrées (§1.1) et DoD | Complètes dans la PR. Les limitations déclarées (case « Terminer », `ERR-032`, `formulaireSousTache`) sont traitées aux décisions 4 et 5. |
| Synchronisation et modèle d'écriture | Aucun fichier de `src/synchronisation/` n'est modifié. Les décisions consomment les `Modification` existantes : `CREER_TACHE` avec `tacheParenteId`, et `ECRIRE_TACHE` sur `cycleDeVie` ou `estimationInitiale`. Chaque écriture se fait en une transaction (`service.modifier(avecVue(…))`). Les événements RG-050 portent `rang` et `cause` (réouverture et recopie de rang 1, cause 0). Intacts. |

## 2. Conformité à la ST et aux US

- **Création** (`decisions/creer-sous-tache.ts`) : l'ordre des contrôles 1 à 4 du §6.1 est respecté (introuvable, un seul niveau, `AjoutSousTacheATacheAbandonnee` avant la saisie, validation). La confirmation n'est demandée que pour une tâche parente terminée. La réouverture est une conséquence enregistrée dans la même décision. `evaluerCreationSousTache` reçoit une commande sans `id` (`Pick`) : c'est un élargissement compatible avec la signature du §4.1 et cohérent avec le §4.2 (identifiant tiré dans `executer`). Accepté.
- **H-3** (`decisions/supprimer-tache.ts`) : la somme est calculée **avant** la suppression (sous-tâche supprimée comprise si elle n'est pas abandonnée) et recopiée, avec `MODIFICATION_ESTIMATION` avant = après. Conforme au §6.3 et à UT-US-024-10 à 12.
- **Actions** : `CREER_SOUS_TACHE` est proposée pour toute tâche sans tâche parente, quel que soit son état (§6.5).
- **Compteur, tri, ALR-012 et ALR-013** : la section `SEC-SOUS-TACHES` forme une seule liste triée par `comparerOrdreReference`, avec le compteur « t / n » (§6.7). `ALR-012` est présente si la tâche n'a aucune sous-tâche, avec l'estimation en vigueur. `ALR-013` est absente si n = 0. Conformes.
- **Confirmation `CNF-AJOUT-SOUS-TACHE-TERMINEE`** : le magasin appelle `evaluer` d'abord, sans écriture (UT-COMP-US-024-02). « Annuler » conserve la saisie (UT-COMP-US-024-06). **Échap**, en revanche, ferme la feuille et perd la saisie : voir RC-US-024-1.
- **RG-029** : la saisie d'une sous-tâche passe par `validerSaisieTache`, qui cumule les erreurs `ERR-021` à `ERR-023`. Les objectifs ne sont pas proposés à la saisie : ils sont hérités (RG-023).
- **Défauts du rang 5** : aucun ne se reproduit.
  - `focaliserPremier` ne focalise l'estimation que si le message porte sur elle (correction bienvenue : `ERR-032` ne déplace plus le focus).
  - Les refus sans champ sont affichés en `role="alert"`.
  - L'issue de la confirmation est appliquée par `appliquerIssue`. Le `void` de `surConfirmer` ne jette aucune issue (la promesse ne fait que porter `appliquerIssue`). C'est la même forme que « Ajouter ».
  - Aucun texte en dur hors `libelles-ui.ts`, sauf DT-019. Aucun transtypage dans `src/`.

## 3. Décisions sur les points soumis

| # | Point | Décision |
|---|---|---|
| 3 | `incoherenceDe` conservée, non appelée avant le rang 9 | **Conforme** à ST v0.3 §15. La fonction est pure et n'est appelée nulle part dans `src/` (vérifié). `ResumeTache.incoherence` n'est jamais renseigné. `incoherence.ts` porte le rang 9/9 dans `rangs-fichiers.json`. Revue de la fonction à l'E13 du rang 9 (suggestion RC-US-024-5 sur le commentaire). |
| 4 | `formulaireSousTache` calculé dans `#chargerDetail` | **Accepté, sans remarque.** Le magasin construit déjà les modèles de vue (`detail`, `liste`). La condition lit la liste `actions` calculée par le domaine, sans règle propre. Elle a les mêmes précédents que `detail-objectif.tsx:127` (`CREER_SOUS_OBJECTIF`) et le menu de `detail-tache.tsx`. CR-16 est respecté. |
| 5 | Case « Terminer » désactivée au rang 6 | **Conforme.** La ST demande au rang 6 le seul `caseTerminer.nomAccessible` (§4.5). Terminer appartient au rang 7 (§1 hors périmètre ; S07, S17). La case `disabled` native est non focalisable, et aucune explication n'est due puisque l'utilisateur ne peut pas y remédier (guide, états communs). Le branchement de `surTerminer` au rang 7 est inscrit dans **ST-US-003 v0.2 §3 n° 7** (présent commit). |
| 6 | Étapes de saisie par étapes d'US-018 S13 | **Rattachement au rang 6 confirmé** : ST-US-018 §12.1 n° 6 et §15 (« Rang 6 : S13 »), glossaire d'étapes §1. La phrase « saisit l'intitulé …, le délai … et l'estimation … » appartient à cette séquence. Elle est réutilisée telle quelle par US-031 S17. |
| 7 | Modifications de tests | **Acceptées** (ce ne sont pas des tests d'E10 ; aucun n'est affaibli). UT-COMP-US-002-01 : l'ajout de `CREER_SOUS_TACHE` découle du §6.5, et l'assertion sur la sous-tâche (sans cette action) est conservée. UT-COMP-US-002-33 : le rejet « rang 6 » est remplacé par une assertion positive (compteur 0 / 1, estimation technique de 30 min, ST §14), et les rejets des rangs 7 et 8 sont conservés. `renseigner` est déplacé à l'identique dans `tests/support/ui-objectifs.ts`. Coquille du titre : RC-US-024-3. |
| 8 | Couverture et rangs | **Conformes.** Global : lignes 98,29 %, branches 93,43 %. Fichiers modifiés : `section-sous-taches.tsx` 92,85 % / 75 %, `saisie-rapide.tsx` 97 % / 79,59 %, `magasin-taches.ts` 95,69 % / 88,88 %, `detail-tache.tsx` (écran) 98,46 % / 84,37 %. Modèles de vue, domaine et application au-dessus de leurs seuils. Non-régression par fichier verte en CI. `rangCourant` = 6. `rangs-fichiers.json` : `incoherence.ts` 9/9, `section-sous-taches.tsx` 6, reclassement alphabétique de `progression-objectif.tsx`. `rangs-tests.json` : `UT-COMP-US-024-\d+` au rang 6, `UT-US-024-2[12]\b` au rang 9 avant la règle générique. |

## 4. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US-024-1 | **Majeure** | CR-07, guide §6.6.7 et accessibilité (« Dialogues de confirmation : Échap annule, le focus revient à l'élément d'origine ») | `src/objectifs-taches/presentation/ui/composants/saisie-rapide.tsx:347-360`, `:428-437` | La boîte `CNF-AJOUT-SOUS-TACHE-TERMINEE` est rendue **dans** l'`IonModal` de la feuille. À la touche Échap, `BoiteConfirmation` annule, mais Ionic ferme aussi l'overlay du dessus (`@ionic/core` 9.0.9, `overlays` : écouteur `keydown` « Escape » sur le document, `dismiss` si `backdropDismiss`, vrai par défaut). La feuille se ferme, son contenu est démonté et **la saisie est perdue**, ce qui contredit « confirmation sans perdre la saisie ». De plus, après « Annuler », le focus tombe sur `body`, hors du piège de la feuille, au lieu de revenir sur « Ajouter ». | Tant qu'une confirmation est affichée, la feuille ne doit pas pouvoir être fermée. Remonter l'indicateur « confirmation affichée » de `CorpsSaisie` à `SaisieRapide` et poser `backdropDismiss={!confirmationAffichee}` sur l'`IonModal` (ou un `canDismiss` équivalent). Après « Annuler » ou Échap, rendre le focus au bouton « Ajouter ». Test de composant `UT-COMP-US-024-nn` : Échap, boîte ouverte → boîte fermée, `surFermee` non appelé, intitulé conservé, focus sur « Ajouter ». Si jsdom ne reproduit pas l'écouteur d'Ionic, vérifier au minimum la propriété `backdropDismiss` de l'`ion-modal` pendant la confirmation. | Ouverte | 1 |
| RC-US-024-2 | Mineure | CR-07, CR-44 ; ST-US-024 §4.5 (imprécision de conception, corrigée en v0.4) | `src/objectifs-taches/presentation/ui/composants/section-sous-taches.tsx:21` ; `modeles-de-vue/detail-tache.ts:18`, `:132` ; `tests/steps/objectifs-taches/taches.steps.ts:305` | La ligne de sous-tâche affiche la date brute au format ISO (« 2026-11-20 »). Les autres listes affichent `delai.libelle`, formaté. La ST ne donnait que `delai: DateCalendaire`. | **Évolution de la ST validée ici (v0.4, présent commit)** : `LigneSousTache.delai` devient `LigneTache['delai']` (`{ date, libelle }`). La section affiche `ligne.delai.libelle`, et l'étape « le détail présente les sous-tâches » lit `l.delai.date`. Compléter UT-COMP-US-024-07 : le libellé formaté est visible. | Ouverte | 1 |
| RC-US-024-3 | Mineure | CR-65 | `tests/unitaires/support/construction-taches.test.ts:78` | Coquille dans le titre de UT-COMP-US-002-33 : « les les capacités ». | Corriger en « les capacités ». | Ouverte | 1 |
| RC-US-024-4 | Suggestion | CR-22, RCD-04 | `src/objectifs-taches/application/cas-usage/creer-sous-tache.ts:33-39` (et `supprimer-tache.ts:21-24`, `supprimer-objectif.ts:21-24`) | Troisième copie de la séquence « lire l'état, construire la vue, évaluer, ré-emballer le résultat ». | Extraire `evaluerSurEtat(service, evaluation)` dans `requetes/lecture-courante.ts`, au plus tard avec les `evaluer` du rang 7 (ST-US-003). | Ouverte | 1 |
| RC-US-024-5 | Suggestion | CR-25 | `src/objectifs-taches/application/requetes/resumes.ts:57` | Le commentaire « rang 9 » est devenu « RG-049, dérivée ». Il ne dit plus que le champ n'est jamais renseigné avant le rang 9 (ST §15). | Écrire par exemple `// RG-049, dérivée ; renseignée au rang 9 seulement (ST-US-024 §15)`. | Ouverte | 1 |
| RC-US-024-6 | Suggestion | CR-16, CR-23 | `saisie-rapide.tsx:289`, `:302` ; `ecrans/detail-tache.tsx:318` | La variante est reconnue par `'tacheParente' in formulaire`, et la phrase « de « {parent} » » / « Sous-tâche de « {parent} » » est composée dans le composant. Le précédent `detail-objectif.tsx:38` ayant été approuvé, ce n'est qu'une suggestion. | Faire porter au modèle de vue un discriminant (`variante: 'SOUS_TACHE'`) et le libellé déjà composé de la tâche parente. | Ouverte | 1 |
| RC-US-024-7 | Suggestion | CR-21 | `src/objectifs-taches/domaine/actions.ts:46-47` | Deux décompositions successives portent la même condition `tacheParenteId === undefined`. | Fusionner en `['RATTACHER', 'DETACHER', 'CREER_SOUS_TACHE']`, sans changer l'ordre attendu par UT-COMP-US-002-01. | Ouverte | 1 |

## 5. Dette

| Id | Description | Décision |
|---|---|---|
| — | Aucune dette nouvelle. Les limitations déclarées (case « Terminer », action « Reprendre la tâche » de `ERR-032` au rang 8) sont du travail planifié dans les ST des rangs 7 et 8 (ST-US-003 v0.2 §3 n° 7, ST-US-025), pas de la dette. DT-019 (E12) reste inscrite. | Registre inchangé (v0.23) |

Actions d'Anthony (faites dans ce commit) :
- **A-1** : ST-US-024 v0.4 §4.5 (`LigneSousTache.delai`, RC-US-024-2).
- **A-2** : ST-US-003 v0.2 §3 n° 7 (branchement de `surTerminer` sur la section des sous-tâches au rang 7).

## 6. Verdict : Changements requis

Aucune remarque bloquante. Le domaine, l'application, les modèles de vue, les étapes Cucumber, les rangs et la couverture sont conformes ; la synchronisation est intacte et les tests d'E10 aussi.

Il reste une remarque majeure, RC-US-024-1 : Échap sur la confirmation ferme la feuille et perd la saisie, et le focus n'est pas rendu à « Ajouter ». Deux remarques mineures s'y ajoutent : RC-US-024-2 (date ISO affichée) et RC-US-024-3 (coquille). Les corrections se font sur `us/US-024-rang6` ; la nouvelle revue portera sur ces seuls points.
