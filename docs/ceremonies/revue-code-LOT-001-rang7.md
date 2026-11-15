# Revue de code E13 — LOT-001, rang 7 (US-003 : terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-31 |
| Branche | `us/US-003-rang7` @ `4b165dc` (PR #21, brouillon, base `lot/LOT-001`) |
| Auteurs | Benjamin : `94d207c` (domaine, application, composition), `bb6b6b6` (étapes), `04b41c7` (DT-021, point 1), `4d3f7d0` (date de fin, `MEN-HEURE-PARIS`), `4b165dc` (interface). Bruce : `31565a4` (étapes Drive de ST-US-017 §12.1 n° 11 et 20, `drive-banc.ts`). Pepper : `e74e5ae` (ligne « création » de US-003 S20 et de US-025 S17). |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 39 fichiers, + 1 304, − 135 |
| Référentiel | ST-US-003 v0.2 (§3, §4, §6, §8, §12, §13, §15, §16), `checklist-revue-code.md` v0.3, ST-US-017 §12.1, glossaire d'étapes (§1, §11), guide d'ergonomie (§4.2, §4.10, §6.6, accessibilité), revues des rangs 5 et 6 |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| CI de la PR #21 sur `4b165dc` | Deux passages. Le second est entièrement vert : qualité (lint, types, architecture, couverture, rangs), sécurité, build, e2e (CSP), tests UTC, America/New_York et Pacific/Auckland. Le premier a échoué sur `tests (America/New_York)`, dans UT-COMP-US-001-70 (`composants-objectifs.test.tsx:75`), un fichier que la branche ne touche pas. Le test est instable : inscrit en **DT-022**. La CI fait foi pour la couverture. |
| Tests fournis en E10 (CR-60) | Aucun fichier `UT-US-003-*` n'est modifié. Les tests sont intacts. |
| Tests complémentaires modifiés | UT-COMP-US-002-01 (`taches-comp.test.ts`) : `TERMINER` ajouté aux listes attendues (conséquence du §6.3). UT-COMP-US-002-33 (`construction-taches.test.ts`) : « terminée » est désormais appliqué et vérifié, et le refus du rang 8 est conservé. Les deux sont **renforcés, pas affaiblis** : acceptés. |
| Synchronisation et modèle d'écriture | Aucun fichier de `src/synchronisation/` n'est modifié. `deciderFinTache` et `deciderReouverture` produisent des `Modification` `ECRIRE_TACHE` existantes sur le registre `cycleDeVie` (une écriture par changement d'état), avec les événements existants `FIN` et `REOUVERTURE` (`avant` via `etatJournalDe`, `rang`, `cause`). Chaque écriture passe par `service.modifier` (une transaction, journal RG-050). **Intacts.** |
| Rangs | `rangCourant` = 7 ; `action-fin.tsx` est au rang 7/7 dans `rangs-fichiers.json` ; le motif `UT-COMP-US-003-\d+` est au rang 7 dans `rangs-tests.json`. **Conformes.** |

## 2. Conformité à la ST et aux US

- **Fin** (`decisions/terminer-tache.ts`) : les contrôles 1 à 3 du §6.1 sont faits dans l'ordre. `SousTachesRestantes(n)` ne compte que les sous-tâches à faire (UT-US-003-03). `dateFin = contexte.jour`, calculé à partir de l'instant puis persisté (RG-008, PT-16). Aucune écriture sur la tâche parente ni sur les objectifs. **Conforme.**
- **Réouverture** (`decisions/rouvrir-tache.ts`) : `controler` factorise les contrôles 1 à 3, partagés par `evaluerReouverture`, `deciderReouverture` et `reouvrable` (l'action `ROUVRIR` du §6.3). DEC-030 est respectée : une tâche parente abandonnée entraîne un refus. La conséquence sur la tâche parente terminée porte `rang 1, cause 0`. **Conforme.**
- **ERR-035** : le détail affiche `ALR-013` en permanence, et le bouton est `aria-disabled` et décrit par la note. Le refus est annoncé en `role="alert"` (UT-COMP-US-003-09). **Dans la liste, en revanche, le refus est perdu** : voir RC-US-003-2.
- **CNF-ROUVRIR-SOUS-TACHE** : le magasin appelle `evaluer` avant toute écriture (conventions §8.6). Échap annule et rend le focus, et la confirmation rouvre les deux tâches (UT-COMP-US-003-10). **Conforme.**
- **Date de fin de Paris** : le détail affiche « Terminée le {date} » (`ETA-TACHE-TERMINEE`). `MEN-HEURE-PARIS` n'apparaît que si le fuseau de l'appareil n'est pas celui de Paris, et jamais sur le délai. En liste, l'état « Terminée » s'affiche sans date (UT-US-003-12 et 16). **Conforme.** L'étape n° 8 est en partie vide de contrôle : voir RC-US-003-6.
- **Journal** : la fin, puis la réouverture via « Annuler » de `TST-TERMINEE`, sont deux entrées (Q-US-003-1 a). La date de fin précédente figure dans `REOUVERTURE.avant`. **Conforme.**
- **Guide d'ergonomie** : la case native `checkbox` a une cible de 44 px et le nom « Terminer « X » » (DT-019, déplacé dans `ligne-tache.ts`). La ligne reste 3 s dans « À faire », case cochée et non focalisable (guide §4.2, §307). Le toast avec action dure 6 s et sa fermeture est notifiée. Pour l'enchaînement de deux fins, voir RC-US-003-5.
- **Défauts des rangs 5 et 6** :
  - Promesses jetées : une seule issue est perdue, celle de la case de la liste (RC-US-003-2). Les autres `void` portent des commandes dont l'issue est appliquée par le magasin (`ERR-014`) ou ne comporte aucun message.
  - Focus : le bouton unique d'`ActionFin` conserve le focus de « Terminer » à « Rouvrir ». Après la boîte de confirmation, le focus revient au bouton.
  - `aria-invalid` : sans objet (aucun champ).
  - Échap : il est traité par `BoiteConfirmation`.
  - Textes : « Terminer la tâche » et « Rouvrir la tâche » sont dans `libelles-ui.ts`, et seul DT-019 est codé en dur.
  - CR-72b : les assertions qui suivent les interactions Ionic passent par `waitFor` ou `findBy*`.
- **Écarts relevés pour Steeve (E14, sans remarque à Benjamin, qui suit la ST)** : la maquette ECR-002 L4 montre, dans le filtre « Terminées », une case cochée « Rouvrir « X » » et la mention « Terminée le 20 oct. ». La ST v0.2 et UT-US-003-16 prévoient l'état « Terminée » sans date et aucune case. Par ailleurs, pendant les 3 s de maintien, la ligne n'a pas l'intitulé barré du guide §4.2. Question **Q-ANT-E13-R7-1** à Steeve, via Jarvis, pour l'E14 : le rendu L4 (case « Rouvrir » et date) et l'intitulé barré pendant le maintien sont-ils exigés au LOT-001 ?

## 3. Décisions sur les points soumis

| # | Point | Décision |
|---|---|---|
| 1 | Conformité à la ST, aux US et au guide | Conforme, sauf RC-US-003-2 (refus `ERR-035` perdu dans la liste), RC-US-003-5 (enchaînement de deux toasts) et RC-US-003-6 (étape n° 8 vide de contrôle pour la ligne). Voir §2. |
| 2 | L'étape « annonce la réouverture de la tâche » accepte deux codes | **Test affaibli** (CR-61). L'assertion exacte (`deepEqual` sur `CNF-AJOUT-SOUS-TACHE-TERMINEE`) de US-024 S17 devient une appartenance à une liste, et S13 ne vérifie plus `CNF-ROUVRIR-SOUS-TACHE`. **Il n'y a pas lieu de créer deux étapes distinctes** : la phrase a le même sens pour l'utilisateur dans les deux scénarios et elle est au glossaire ; les `.feature` restent inchangés. La vérification doit redevenir exacte, selon la nature de la commande en attente : RC-US-003-1 (bloquante), ST v0.3 §12 n° 11. |
| 3 | Port `Planificateur` optionnel (magasin et `composition/`) ; prop `surFermeture` du `Toast` | **Conforme au DAT et aux ADR.** `Planificateur` est le seul mécanisme de déclenchement différé admis (conventions §10.2, port de `commun/application/ports`), et `setTimeout` est absent. Le DAT §3 n'interdit ce port qu'aux **modèles de vue**, or le magasin Zustand n'en est pas un, et les tests d'architecture sont verts. Aucune question à Starck. `surFermeture` est générique et facultative ; elle se branche sur `onDidDismiss` d'Ionic, sans minuterie : **acceptée**. Une réserve : à l'assemblage (`composition/objectifs-taches.ts`), la dépendance doit être obligatoire, comme `observer` (précédent RC-R3-11). Voir RC-US-003-4. |
| 4 | Étapes Drive de Bruce | **Assez strictes sur le fond.** « contient la tâche … à l'état … » exige exactement une tâche non supprimée de cet intitulé et compare son état. « ne contient pas encore » exige l'absence. Ignorer `enAttente` est justifié : c'est une marque locale de synchronisation, pas une donnée métier (glossaire : « données métier égales à celles du Drive »), et la projection du Drive la met toujours à `false`. Deux réserves : la comparaison dépend de l'ordre d'insertion des `Map`, et deux états vides seraient déclarés identiques. Voir RC-US-017-1 (mineure). |
| 5 | Correction de S20 et de US-025 S17 par Pepper | **Sens inchangé.** `l'historique contient, pour … :` vérifie la liste **complète** (glossaire §1 et §11). L'entrée « création » existait déjà, et le tableau était faux sans elle. La journée (2026-10-21, date du contexte) et le rendu « délai …, estimation … » correspondent au contexte du scénario. Les CA (CA-3, CA-13 ; US-025 CA-11) et l'intention du scénario ne changent pas. Acceptée. |
| 6 | Défauts du type des rangs 5 et 6 | Voir §2. Une seule promesse jetée a un effet visible (RC-US-003-2). |
| 7 | DT-021 point 2 laissé ouvert | **Accepté.** Le point 2 (variante sous-tâche dans `saisie-rapide.tsx` et `detail-tache.tsx`) ne relève pas d'US-003, et l'imposer ici élargirait le périmètre du rang. Il est **replanifié au rang 8** (ST-US-025 modifie `ecrans/detail-tache.tsx`). Le point 1 est remboursé par `evaluerSurEtat` (`04b41c7`) : quatre `evaluer` sans copie. Registre v0.25 : DT-021 « En cours ». |
| 8 | Couverture et rangs | **Conformes.** Le job `qualite` (seuils et non-régression par fichier) est vert sur `4b165dc` ; la CI fait foi. `rangCourant` = 7 ; `rangs-fichiers.json` et `rangs-tests.json` sont à jour (§1). |

## 4. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US-003-1 | **Bloquante** | CR-61, CR-64 ; ST-US-003 §12 n° 11 | `tests/steps/objectifs-taches/refus.steps.ts:68-84` ; `tests/steps/objectifs-taches/taches.steps.ts:134`, `:617` ; `tests/support/commandes-en-attente.ts:8` | Test affaibli. L'étape accepte `CNF-AJOUT-SOUS-TACHE-TERMINEE` **ou** `CNF-ROUVRIR-SOUS-TACHE` : une réouverture qui afficherait la confirmation d'ajout, ou l'inverse, passerait. | Garder la phrase unique et rétablir l'égalité stricte (ST v0.3 §12 n° 11). Ajouter à `CommandeEnAttente` un champ `nature?: 'AJOUT_SOUS_TACHE' \| 'REOUVERTURE'`, renseigné par les étapes d'action (`:134` → `AJOUT_SOUS_TACHE`, `:617` → `REOUVERTURE`). Dans `refus.steps.ts`, une table nommée `CONFIRMATION_DE_REOUVERTURE: Readonly<Record<Nature, CodeCatalogue>>` donne le code attendu. L'étape échoue si `nature` est absente, puis compare `{ code, element }` à `{ CONFIRMATION_DE_REOUVERTURE[nature], tache }` par `assert.deepEqual`. Aucun `.feature` n'est modifié. | Ouverte | 1 |
| RC-US-003-2 | **Majeure** | CR-42, CR-44, CR-07 ; guide §6.6 `ERR-035` ; ST v0.3 §4.5 | `src/objectifs-taches/presentation/ui/ecrans/espace-taches.tsx:48` ; `ecrans/liste-taches.tsx` | La case « Terminer » d'une tâche parente dont des sous-tâches sont à faire (cas montré par ECR-002 L1, « 1/3 ») est affichée. Le refus `ERR-035` renvoyé par `actions.terminer` est jeté (`void`) : la case reste décochée sans aucune annonce. L'erreur est donc mal traitée. | Appliquer la ST v0.3 §4.5 (amendée dans ce commit) : `PageListe` garde les messages de refus dans un état local, alimenté par l'issue de `actions.terminer` (même forme que `ActionFin`, fonction `messagesDe`). `ListeTaches` reçoit une prop `refus` et les affiche sous les filtres par `MessagesRefus` (`role="alert"`). Les messages sont effacés au geste « Terminer » suivant, et le focus reste sur la case. Test UT-COMP-US-003-13 : tâche parente avec 2 sous-tâches à faire dans la liste ; après un clic sur sa case, `findByRole('alert')` contient « Il reste 2 sous-tâches à terminer ou abandonner. », la case est décochée et `document.activeElement` est la case. | Ouverte | 1 |
| RC-US-003-3 | Mineure | CR-26 ; conventions §6.2 (« se termine par `assertNever(x)` ») | `src/objectifs-taches/domaine/etat-journal.ts:5-12` | Le `switch` sur `CycleDeVie['etat']` n'a pas de `default: return assertNever(…)`. | Ajouter `default: return assertNever(cycleDeVie);` (`commun/domaine/assert-never.ts`). | Ouverte | 1 |
| RC-US-003-4 | Mineure | CR-13 ; conventions §6.2 (pas de dépendance masquée) ; précédent RC-R3-11 (`observer` obligatoire à l'assemblage) | `src/composition/objectifs-taches.ts:64`, `:72`, `:108` ; `tests/support/ui-objectifs.ts:27` | `planificateur` est facultatif à l'assemblage. Un oubli dans une composition dégraderait le comportement en silence : la ligne quitterait la liste aussitôt. | Rendre `planificateur` obligatoire dans `Dependances` et dans `ObjectifsTaches`, et supprimer la décomposition conditionnelle de `:108`. Dans `tests/support/ui-objectifs.ts`, passer le planificateur de l'environnement de test. `ServicesTaches.planificateur` (magasin) peut rester facultatif, comme `observer`. | Ouverte | 1 |
| RC-US-003-5 | Mineure | CR-07 ; guide §4.10 et accessibilité 2.2.1 (toast avec action : 6 s minimum) | `src/objectifs-taches/presentation/ui/ecrans/espace-taches.tsx:138-144`, `:232` ; `src/objectifs-taches/presentation/ui/etat/magasin-taches.ts:408-410` | Si l'utilisateur termine une deuxième tâche pendant que `TST-TERMINEE` est ouvert, le même `IonToast` reste monté. Son délai ne repart pas, et la nouvelle fin dispose de moins de 6 s pour « Annuler ». À l'échéance, `oublierFin` efface aussi la nouvelle fin. | Monter un toast par fin (`<ToastFin key={etat.finAnnulable} … />`). Changer `oublierFin` en `oublierFin(id: IdTache)`, qui n'efface `finAnnulable` que s'il vaut encore `id` (la fermeture d'un ancien toast ne touche pas la fin suivante). Test : deux fins successives, la fermeture du premier toast laisse `finAnnulable` sur la seconde. | Ouverte | 1 |
| RC-US-003-6 | Mineure | CR-61, CR-64 ; ST §12 n° 8 | `tests/steps/objectifs-taches/taches.steps.ts:683-697` | Le contrôle de la ligne s'appuie sur `monde.derniereListeTaches`. Or S21 ne consulte aucune liste : `!ligne` est vrai et la moitié de l'assertion ne vérifie rien. | Dans l'étape, consulter la liste (le même chemin que `liste-taches.steps.ts:25`, filtre de l'état de la tâche), exiger que la ligne existe (`assert.ok(ligne, …)`), puis vérifier l'absence de `MEN-HEURE-PARIS` sur son délai. S21 reste inchangé. | Ouverte | 1 |
| RC-US-003-7 | Mineure | CR-65 ; ST §11, §14 | `tests/unitaires/objectifs-taches/application/` | Le test de performance indicatif de `ConsulterObjectifs` (5 000 tâches) n'est pas livré. | Pour éviter les faux rouges des runners partagés, ce test ne doit pas devenir un contrôle bloquant. Reporté en dette. | Acceptée en dette (DT-023) | 1 |
| RC-US-003-8 | Suggestion | CR-65 | `tests/unitaires/objectifs-taches/presentation/ui/terminer-rouvrir-ui.test.tsx:151-152` | Un seul `await Promise.resolve()` après `rappel?.()` ne prouve pas que le rafraîchissement a été évité : il pourrait simplement ne pas être terminé. | Espionner `consulterTaches.executer` (`vi.spyOn`) et vérifier qu'il n'est pas rappelé avant `planificateur.echeance()`. | Ouverte | 1 |
| RC-US-003-9 | Suggestion | CR-21, CR-22 | `src/objectifs-taches/presentation/ui/etat/magasin-taches.ts:388-395`, `:413-428` | `terminer` rafraîchit l'écran après un refus sans message (action plus proposée, modifiée ailleurs), mais `rouvrir` ne le fait pas. | Extraire une fonction privée `#apresRefusSilencieux(issue)` et l'appliquer aux deux commandes. | Ouverte | 1 |
| RC-US-017-1 | Mineure | CR-64 ; ST-US-017 §12.1 n° 20 | `tests/steps/synchronisation/drive.steps.ts:146-150` | `assert.deepEqual` compare des tableaux d'entrées dans l'ordre d'insertion des `Map` : un ordre différent pour des données égales ferait échouer l'étape à tort. Deux états vides seraient aussi déclarés « identiques ». | Trier les entrées par identifiant dans `sansAttente`. Avant la comparaison, exiger qu'au moins un objectif ou une tâche figure dans l'état local (`assert.ok(local.objectifs.size + local.taches.size > 0, …)`). Responsable : Bruce. | Ouverte | 1 |

## 5. Dette

| Id | Description | Décision |
|---|---|---|
| DT-021 | Point 1 remboursé (`evaluerSurEtat`) ; point 2 hors périmètre d'US-003 | « En cours », point 2 replanifié au rang 8 (décision 7) |
| DT-022 | UT-COMP-US-001-70 instable sous America/New_York (premier passage CI de `4b165dc`) | Inscrite, P2, Tests |
| DT-023 | Test de performance indicatif de `ConsulterObjectifs` non livré (RC-US-003-7) | Inscrite, P3, Tests |

Actions d'Anthony (faites dans ce commit) :
- **A-1** : ST-US-003 v0.3 : §4.5 (refus `ERR-035` de la case de la liste), §12 n° 11 (code exact selon la nature de la commande en attente), §14 (report en DT-023).
- **A-2** : registre de la dette v0.25 (DT-021, DT-022, DT-023).
- **A-3** : Q-ANT-E13-R7-1 à Steeve, par Jarvis (rendu L4 du filtre « Terminées » et intitulé barré pendant le maintien de 3 s).

## 6. Verdict : Changements requis

Le domaine, l'application, la composition et les modèles de vue sont conformes. La synchronisation et les tests d'E10 sont intacts. Les étapes de Bruce et la correction de Pepper sont acceptées.

Un bloquant reste ouvert : RC-US-003-1, l'étape de confirmation affaiblie. S'y ajoutent une remarque majeure, RC-US-003-2 (`ERR-035` perdu dans la liste), et quatre remarques mineures à corriger : RC-US-003-3 à 6. RC-US-017-1 est confiée à Bruce. La nouvelle revue ne portera que sur ces remarques et sur le différentiel.
