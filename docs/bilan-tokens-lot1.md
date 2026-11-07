# Bilan de consommation de tokens du lot 1

Demande du commanditaire du 2026-11-02 : une fois le lot 1 terminé, Jarvis produit l'analyse des tokens par jour de devis et par palier (rang), des 3 rangs les plus efficaces et des 3 moins efficaces, de ce qui a bien et mal marché, avec des propositions pour un système plus efficient à qualité constante (voir `.claude/agents/jarvis.md`, section « Bilan de consommation de tokens à la clôture du lot 1 »).

## Registre (à tenir à la fin de chaque rang)

Les totaux sont ceux que les agents rapportent à leur fin (somme des notifications, relances comprises). Ils ne comprennent pas la consommation de la session principale de Jarvis. Les rangs 0 à 2 ont été menés avant le registre. Les chiffres 3 à 9 ci-dessous ont été relevés le 2026-11-02 à partir des notifications de la session ; ils sont **provisoires** (arrondis, répartition par rang faite à la main) et à recontrôler au bilan.

| Rang | Contenu | Estimation | Tokens des agents (≈) | Tokens par jour de devis (≈) | Remarques |
|---|---|---|---|---|---|
| 3 (reliquat) | US-017 incr. 1 : reliquat (DT-006, 009, 011) | partie des 10 j | 470 k | non calculable (reliquat d'un rang de 10 j) | 2 tours E13, feuille de synchronisation non branchée au 1er passage |
| 4 | US-023 Sous-objectifs | 3 j | 620 k | 207 k | 1 relance mécanique ; PR fusionnée avant le verdict |
| 5 | US-002 Tâches | 6 j | 1 200 k | 200 k | un seul développeur sur 664 k (252 appels) ; 3 majeures à l'E13 ; PR #13 fusionnée avant le verdict |
| 6 | US-024 Sous-tâches | 4 j | 790 k | 197 k | première application du découpage par couche (OPT-15) |
| 7 | US-003 Terminer, rouvrir | 3 j | 805 k | 268 k | étape de test affaiblie (bloquante à l'E13), régression de couverture, test instable |
| 8 | US-025 Abandonner | 3,5 j | 660 k | 189 k | corrections mécaniques relues par sonnet (OPT-18) |
| 9 | US-017 incr. 2 | 11 j | 3 500 k | 320 k | 2 erreurs de spécification rattrapées tard, 3 relances de l'E10 aux tranches, noyau de fusion |
| 10 | US-017 incr. 3 | 6 j | fusionné (PR #33) ; ≈ 1 500 k à la reprise du 2026-11-02, valeur finale à relever dans `ccusage` | à compléter | coupures par la limite d'usage ; E13 opus (≈ 5 $), corrections sonnet (≈ 0,5 $), E13 bis sonnet (≈ 0,5 $) le 2026-11-07 ; CI rouge corrigée (UT-COMP-US-002-87) |
| 11 | US-017 incr. 4 | 6 j | à compléter | | |
| 12 | US-018 Hors ligne smartphone | 6,5 j | à compléter | | |
| 13 | US-031 Hors ligne PC | 3,5 j | à compléter | | |

Hors rangs (à ventiler au bilan) : ANO-001 (≈ 530 k), dépendances de sécurité (PR #15), test instable (PR #20), catalogue DT-015/017/019 (≈ 600 k avec les réponses de Steeve), OPT-15 à OPT-21 et leur analyse.

## Bilan (à rédiger à la clôture du lot 1)

À rédiger par Jarvis : classement des rangs par tokens par jour de devis, 3 plus efficaces et 3 moins efficaces avec ce qui a bien et mal marché, propositions chiffrées (gain, risque pour la qualité), évaluation du pilote Mistral AI.

## Relevé `ccusage` du 2026-11-02 (13 h 56 UTC)

Mesure objective de toute la session (session principale et sous-agents), `npx --yes ccusage@latest daily --breakdown`. Le coût est estimé au tarif public de l'API, ce n'est pas une facturation. Dates en UTC.

| Jour | Tokens totaux | dont lecture de cache | Sortie | Coût estimé | opus / sonnet (coût) |
|---|---|---|---|---|---|
| 2026-10-30 | 172,6 M | 169,2 M | 0,76 M | 39,02 $ | 14,71 $ / 24,31 $ |
| 2026-10-31 | 234,2 M | 227,1 M | 1,32 M | 73,87 $ | 43,46 $ / 30,41 $ |
| 2026-11-01 | 249,5 M | 239,7 M | 1,42 M | 94,82 $ | 64,35 $ / 30,47 $ |
| 2026-11-02 (partiel) | 37,2 M | 35,3 M | 0,15 M | 13,83 $ | 6,31 $ / 7,52 $ |
| **Total** | **693,6 M** | **671,3 M (96,8 %)** | **3,64 M** | **221,55 $** | **128,83 $ (58 %) / 92,83 $ (42 %)** |

Constats : 97 % des tokens sont des lectures de cache (le contexte relu à chaque appel d'outil) ; la sortie représente 0,5 % des tokens ; opus pèse 39 % des tokens mais 58 % du coût. Les « tokens rapportés » des agents (≈ 12,6 M cumulés au 2026-11-02) ne sont pas l'unité de `ccusage` (693,6 M) : le coût ressort à environ 17,6 $ par million de « tokens rapportés ». Cette équivalence sert de passerelle pour estimer le coût du travail restant.
