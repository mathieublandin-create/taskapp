# ADR-003 — Synchronisation par Google Drive : état fusionnable par appareil (CRDT par champ)

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | RG-017, RG-020, RG-021, RG-036, ENF-02, ENF-04, ENF-06, Q-DEM001-21 à 23, DAT §4.2 et §4.3 |

## Contexte
Deux appareils, ou plus, modifient les mêmes données, parfois hors ligne. Ils n'ont aucun serveur commun, seulement Google Drive. Drive v3 n'offre pas de verrou optimiste fiable sur le contenu d'un fichier. La règle métier est la suivante : la modification la plus récente l'emporte, de préférence information par information (Q-23.1 a), et toute valeur écartée est signalée (Q-23.2, ENF-06).

## Options étudiées
1. **Un fichier unique partagé, réécrit en entier** : deux écritures concurrentes provoquent une perte silencieuse. Rejetée.
2. **Un fichier unique avec verrou applicatif** (fichier de verrou) : fragile hors ligne, verrous orphelins. Rejetée.
3. **Journaux d'opérations par appareil** (*event sourcing*) : robuste, mais il faut compacter les journaux, gérer les instantanés et rejouer dans l'ordre. Complexité élevée.
4. **État fusionnable par appareil (CRDT à base d'état)** :
   - chaque appareil écrit **son seul** fichier, qui contient son état complet ;
   - les autres appareils lisent ce fichier et en font la jointure ;
   - la fusion se fait champ par champ, la plus récente l'emportant (horodatage HLC, ADR-011) ;
   - le journal métier est en ajout seul (union) ;
   - les suppressions sont représentées par des pierres tombales.
5. **Base synchronisée par un tiers** (Firebase, CouchDB, etc.) : les données seraient conservées hors de l'espace de l'utilisateur. Contraire au CdC §4.3.

## Décision
Option 4.
- Fichiers : `appareils/<appareilId>.etat.json.gz` dans un dossier Drive dédié (ADR-005, A6), avec un `manifeste.json`.
- Fusion :
  - pour chaque champ, l'HLC le plus grand l'emporte ; les égalités sont départagées par l'`appareilId` ;
  - relation n-n tâche–objectif : un registre par lien ;
  - journal : union.
- Après chaque fusion, une passe de réparation déterministe :
  - corrige les cycles et les profondeurs illégales ;
  - signale les incohérences d'état ;
  - la suppression l'emporte sur une modification concurrente, avec signalement.
- Valeurs écartées : consignées quand l'écriture gagnante a été faite **sans connaissance** de la valeur perdue (RG-036), que celle-ci soit locale ou distante, déposée ou non. Chaque écriture porte un **contexte causal** (par appareil, HLC de la plus récente écriture connue de cette information) ; identifiant déterministe des entrées, signalement unique (DAT §4.2.1, v0.9). *Révision du 2026-10-21 (E8, Q-US-017-1) : remplace le critère « modification locale non encore déposée ».*
- RG-044 avec des fichiers par appareil : altération traitée fichier par fichier, `ERR-012` affiché par le propriétaire du fichier altéré (ou par tous si le manifeste est atteint) ; `generation` recopiée dans chaque fichier d'appareil ; manifeste à contenu monotone (lire, fusionner, écrire), doublons résolus par le plus ancien ; « repartir de zéro » l'emporte sur une restauration concurrente (DAT §4.2.2, v0.9).
- Cycle de synchronisation :
  - immédiatement au démarrage et au retour au premier plan ;
  - 5 s après une modification ;
  - toutes les 2 min au premier plan ;
  - en arrière-plan sur Android (lot ultérieur).
- Chaque fichier porte un `schemaVersion`. Un appareil qui rencontre un schéma plus récent que le sien passe en lecture seule.

## Conséquences
- \+ Aucun conflit d'écriture dans Drive : chaque fichier n'a qu'un écrivain.
- \+ Fusion commutative, associative et idempotente : convergence garantie, quel que soit l'ordre des synchronisations ; tests simples à écrire, y compris en Gherkin avec deux appareils simulés.
- \+ Hors ligne natif ; restauration possible depuis n'importe quel appareil (Q-22.4).
- \+ La granularité est réglable (champ ou élément) sans changer de mécanisme.
- − Chaque dépôt réécrit le fichier en entier : environ 1 Mo compressé à 5 ans, ce qui reste acceptable. Le journal pourra être partitionné si nécessaire.
- − Les pierres tombales et les métadonnées HLC alourdissent l'état (de l'ordre de +30 %).
- − Les règles qui portent sur plusieurs champs ne sont pas garanties par la fusion : il faut une passe de réparation, et les règles de réparation doivent être spécifiées (DAT §8, F12).
- − La « plus récente » repose sur des horloges d'appareils. Le risque est réduit par l'HLC et par la correction d'écart avec l'heure des serveurs Google (ADR-011).
- − Le contexte causal alourdit l'état d'environ 10 % (omis s'il est vide, `appareilId` indexés) ; en contrepartie, le signalement des valeurs écartées est exact, y compris pour une chaîne de modifications faite en connaissance de cause.
- − Le manifeste a plusieurs écrivains : son contenu est rendu monotone, et la génération est aussi portée par chaque fichier d'appareil, pour qu'une écriture concurrente perdue reste sans conséquence.
