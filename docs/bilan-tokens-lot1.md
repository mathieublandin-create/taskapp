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
| 10 | US-017 incr. 3 | 6 j | en cours (≈ 1 500 k à la reprise du 2026-11-02) | à compléter | 2 coupures par la limite d'usage |
| 11 | US-017 incr. 4 | 6 j | à compléter | | |
| 12 | US-018 Hors ligne smartphone | 6,5 j | à compléter | | |
| 13 | US-031 Hors ligne PC | 3,5 j | à compléter | | |

Hors rangs (à ventiler au bilan) : ANO-001 (≈ 530 k), dépendances de sécurité (PR #15), test instable (PR #20), catalogue DT-015/017/019 (≈ 600 k avec les réponses de Steeve), OPT-15 à OPT-21 et leur analyse.

## Bilan (à rédiger à la clôture du lot 1)

À rédiger par Jarvis : classement des rangs par tokens par jour de devis, 3 plus efficaces et 3 moins efficaces avec ce qui a bien et mal marché, propositions chiffrées (gain, risque pour la qualité), évaluation du pilote Mistral AI.
