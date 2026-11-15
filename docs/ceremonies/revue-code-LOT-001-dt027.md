# Revue de code E13 (courte) : tranche DT-027, `us/DT-027-parent` → `lot/LOT-001`

Revue : Anthony, 2026-11-10. Diff : `git diff origin/lot/LOT-001...origin/us/DT-027-parent` (commit `3146de6`). Un seul fichier de `src/` : `src/synchronisation/domaine/valeurs-ecartees.ts` (`valeurPourEgalite`, utilisée par `conflitEntre`).

**Verdict : APPROUVÉ.** Aucune remarque bloquante. Deux remarques non bloquantes.

## 1. Conformité

- ST-US-017 v0.11.4 §6.6 n° 2 b : pour le registre `parent`, la valeur comparée est `{ parentId }` (ou `{}` pour un objectif principal, `parentId` absent) ; `origine` et `hlcOrigine` n'entrent pas dans la comparaison ; les autres champs comparent la valeur entière. Conforme.
- DAT §4.2.1 « Valeurs égales » (v0.11.11, Q-ANT-E13-R9-2) : égalité sur le seul parent visé ; réparation (registre gagnant, journal) et ordre total de l'union inchangés. Conforme : `fusionnerValeursEcartees`, `comparerEntrees`, `canonique`, `idValeurEcartee` ne sont pas touchés.
- Garde de type par `estRegistre(registre, 'OBJECTIF', 'parent')`, pas de cast, fonction pure, 6 lignes, commentaire qui cite la règle. Aucun problème de sécurité ni de dépendance nouvelle.

## 2. Convergence

L'égalité sur `parentId` est une relation d'équivalence (réflexive, symétrique, transitive : égalité de valeurs optionnelles) appliquée symétriquement par `conflitEntre` (gagnante et écartée passent par la même fonction), donc la détection est indépendante du sens local/reçu (UT-US-017-128 et 129 le vérifient dans les deux sens). Elle ne modifie que l'**existence** d'une entrée `CONFLIT`, jamais son identifiant, son gagnant ni l'ordre total de l'union ; la jointure des registres (plus grand HLC), le journal (les deux `CHANGEMENT_PARENT` restent) et la réparation RG-048 ne la lisent pas. Cas limites :

| Cas | Verdict | Couverture |
|---|---|---|
| Parent absent = principal (absent des deux côtés égal ; absent contre présent reste un conflit) | correct | UT-128, 129 |
| Parent supprimé / pierre tombale concurrente (S10c) | `suppressions()` est indépendante de `conflitEntre` : motif `SUPPRESSION`, inchangé | UT-117, 118 (suppressions concurrentes mêlées aux déplacements) |
| Placement annulé (RG-048) | motif `PLACEMENT_ANNULE`, id sur `hlcOrigine` du déplacement annulé, inchangé ; deux déplacements de même parent annulés ensemble : un seul signalement porte la même valeur, ce que le DAT prévoit | UT-117, 118, 131 |
| Déplacement concurrent sous deux parents différents | reste un conflit, valeur de plus petit HLC écartée | UT-129, 130, 132 |
| Déplacement vers un parent lui-même déplacé (cycle) | la réparation n'est pas modifiée ; oracle indépendant de la propriété 4 étendu (`memeValeur`) | UT-117, 118 (« déplacements en cycle », hiérarchie valide) |

Remarque sur l'oracle de `convergence-globale.proprietes.test.ts` : `valeurComparee` et `memeValeur` sont réécrits dans le test, indépendamment du code (bon principe). Les attendus d'UT-117 et 118 sont **inversés** en cohérence avec la règle (propriété 5 ajoutée), pas affaiblis : l'assertion de non-perte silencieuse subsiste.

## 3. Mutations

Rejouées (sur `valeurPourEgalite`, restaurée après chaque essai ; suite `tests/unitaires/synchronisation/domaine`) :

| Mutation | Résultat |
|---|---|
| M1 : toujours `{}` (tout parent égal) | **détectée**, 5 tests rouges (UT-117, 118, 129, 130, 132) |
| M2 : valeur entière (retour au comportement avant DT-027) | **détectée**, 6 tests rouges (UT-117, 118, 128, 130, 131, 132) |
| M3 : `parentId` + `origine` | **détectée**, UT-128 rouge |

Les trois mutations rejouées tombent ; les cinq rapportées par Bruce sont donc cohérentes avec cette couverture (aucune des deux familles « trop large » / « trop étroite » ne survit). Tests verts sur le code livré : 7 tests des deux fichiers concernés, `tests/unitaires/synchronisation/domaine` complet vert hors mutation.

## 4. Numérotation et rangs

UT-US-017-128 à 132 : contigus avec 127 (dernier de l'incrément précédent), aucun doublon dans `tests/`. Règle `UT-US-017-1(?:2[89]|3\d)\b` → rang 12 insérée **avant** `UT-US-017-1[2-3]\d\b` (rang 11) : la première règle gagnant (conventions §11.14), 120 à 127 restent au rang 11, 128 à 132 passent au rang 12. Cohérente avec les tranches hors rang (rattachée au dernier rang fusionné, donc toujours exécutée). `pnpm verifier:rangs` : 0 erreur.

## 5. Dette

DT-027 : registre v0.42 déjà à jour (statut « Planifiée », échéance avant E13b tenue). Au moment de la fusion : DT-027 → « Remboursée à la fusion de la PR de `us/DT-027-parent` » ; le numéro de version (v0.43 si une autre fusion a eu lieu entre-temps) et le numéro de DEC/DT relèvent de Jarvis (OPT-20). Aucune dette nouvelle.

## 6. Remarques

| N° | Gravité | Remarque |
|---|---|---|
| RC-DT027-01 | non bloquante | `rangs-tests.json` : le motif `1(?:2[89]|3\d)` couvre aussi 133 à 139, inexistants. Sans effet aujourd'hui ; si un test UT-US-017-133 et suivants est créé, il tombera au rang 12 sans règle explicite. À resserrer en `1(?:2[89]|3[0-2])` à la prochaine modification du fichier (pas de reprise). |
| RC-DT027-02 | non bloquante | Aucun test unitaire dédié « mêmes parents + pierre tombale du parent concurrente » ; couvert seulement par les propriétés aléatoires UT-117/118 (S10c). Acceptable (le chemin `suppressions()` n'est pas modifié) ; à ajouter si le noyau est retouché. |

## 7. Contrôles

`format:verifier`, `lint`, `types`, `architecture`, `verifier:catalogue`, `verifier:tags`, `verifier:rangs`, `verifier:depot` : 0 erreur (exécutés individuellement : l'environnement a Node 22 alors que `pnpm verifier` exige Node 24 ; même séquence que le script). Tests ciblés verts.
