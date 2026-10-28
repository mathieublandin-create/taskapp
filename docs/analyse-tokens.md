# Analyse de la consommation de tokens et organisation du développement

> Rédigée par Jarvis le 2026-10-28, à la demande du commanditaire. Mesures tirées des journaux de la session et des 63 sous-agents, du 2026-10-20 au 2026-10-28.
> Les chiffres agrègent les tokens traités : lecture du cache, écriture du cache, entrée et sortie. Les tokens de sortie de certains anciens journaux ne sont pas enregistrés : ce sont des ordres de grandeur.

## 1. Constats chiffrés

| Poste | Tokens traités | Part | Remarque |
|---|---|---|---|
| Session principale (Jarvis) | environ 180 M | 28 % | 513 appels, environ **340 k de contexte relu à chaque appel** |
| Sous-agents opus (Pepper, Starck, Anthony) | environ 377 M | 59 % | 1 408 appels, **267 k par appel** en moyenne |
| Sous-agents sonnet (Steeve, Benjamin, intégrations) | environ 74 M | 12 % | 686 appels, 108 k par appel |
| Sous-agents haiku | environ 5 M | 1 % | 104 appels, 45 k par appel |
| **Total** | **environ 635 M** | | **94 % de relecture de cache** ; moins de 1 % de texte réellement produit |

Les cinq agents les plus coûteux :

| Agent | Tokens traités | Appels | Cause |
|---|---|---|---|
| Anthony : E9 des 4 US techniques, puis E10 et traitement de toute l'E11 | environ 116 M | 291 | **Le même agent a été relancé 8 fois** : son contexte a atteint environ 400 k par appel |
| Anthony : E9 des 6 US métier, puis questions | environ 47 M | 96 | Même phénomène |
| Pepper : révision DEC-034, puis E9, E11 et DEC-039 | environ 40 M | 142 | 9 sujets différents dans le même agent |
| Anthony : E10 | environ 31 M | 87 | Lecture complète de toutes les ST |
| Starck : suites de DEC-034, puis E9 et E11 | environ 27 M | 103 | 7 sujets différents dans le même agent |

**Ce qui coûte, par ordre d'importance :**
1. **Les agents « fil rouge » relancés sur des sujets successifs.** Chaque relance relit tout l'historique. Un agent à 400 k de contexte coûte environ 4 fois plus cher par appel qu'un agent neuf qui ne lit que ce dont il a besoin.
2. **La session de Jarvis elle-même.** Elle tourne sur opus avec un contexte d'environ 340 k : chaque échange court, comme un « ok » ou un commit, relit tout. La politique de modèles prévoit pourtant sonnet pour Jarvis (`.claude/agents/jarvis.md`), mais la session a été lancée sans `--agent jarvis`.
3. **Opus utilisé pour du travail mécanique.** Un agent relancé garde son modèle d'origine. Ainsi, des intégrations simples ont tourné sur opus : reporter une décision dans le cahier des charges, corriger un libellé, mettre à jour un statut.
4. **Des documents très longs, relus en entier** : DAT, `conventions.md`, ST-US-022 (environ 900 lignes), ST-US-017, glossaire. Chaque relecteur de cérémonie les relit en totalité.
5. **Des comptes rendus d'agents très détaillés.** Ils grossissent ensuite le contexte de Jarvis.
6. **Les limites d'utilisation atteintes 9 fois.** Elles viennent de pics de 3 ou 4 agents opus lancés en parallèle. Chaque reprise relit le contexte une fois de plus.

## 2. Optimisations proposées

| N° | Mesure | Gain estimé | Effet sur la qualité |
|---|---|---|---|
| OPT-1 | **Un agent neuf par sujet.** On ne relance un agent que pour la suite immédiate du même sujet, au plus 2 relances, ou tant que son contexte reste sous 150 k environ. Le reste passe par un brief autonome qui pointe vers les fichiers. | 30 à 40 % des sous-agents | Neutre : les briefs pointent vers les sources de vérité, déjà toutes dans le dépôt |
| OPT-2 | **Jarvis sur sonnet**, en lançant la session avec `claude --agent jarvis`. Jarvis délègue à opus le raisonnement difficile, comme les fiches d'arbitrage. | 60 à 70 % du coût de la session principale | Faible risque : Jarvis coordonne, il ne conçoit pas |
| OPT-3 | **Modèle imposé à chaque délégation**, selon la politique : haiku pour les reports mécaniques et les statuts, sonnet pour la production, opus pour la conception, la revue et l'arbitrage. Pour un report mécanique, Jarvis crée un agent haiku neuf plutôt que de relancer l'agent opus. | 10 à 15 % | Neutre |
| OPT-4 | **Lecture ciblée** : chaque ST, le DAT et `conventions.md` ont un sommaire avec ancres. Les briefs citent les sections à lire (§x.y), et les agents lisent par plages ou par `grep`, jamais le document entier sauf en E9 ou E11. | 15 à 20 % | Positif : les agents se concentrent sur le bon passage |
| OPT-5 | **Comptes rendus plafonnés** à environ 15 lignes : verdict, fichiers modifiés, questions. Le détail va dans le livrable du dépôt, pas dans le message. | 5 à 10 % de la session Jarvis | Neutre |
| OPT-6 | **Au plus 2 agents opus en parallèle.** Les autres attendent ou passent sur sonnet. | Évite les reprises coûteuses | Positif : moins d'interruptions en cours de tâche |
| OPT-7 | **Revues E13 et E13b sur le diff** de la branche (`git diff lot/LOT-001...us/xxx`) plutôt que sur l'ensemble des ST. La relecture complète reste réservée à l'E11. | 20 à 30 % des revues | Neutre : c'est le standard d'une revue de code |
| OPT-8 | **Compactage de la session Jarvis** à chaque changement d'étape. Jarvis s'appuie sur `suivi-projet.md` et l'état des lieux, qui sont faits pour cela, plutôt que sur l'historique de la conversation. | 10 à 20 % de la session | Neutre |

**Gain global estimé : 40 à 55 %** de tokens pour le même travail. OPT-1 et OPT-2 représentent l'essentiel du gain.

## 3. Plusieurs développeurs ?

### Ce qu'il reste à faire (LOT-001, environ 91 jours estimés)
| Nature | Rangs | Part | Exigence |
|---|---|---|---|
| Cœur de synchronisation : HLC, fusion LWW, contexte causal, Drive, verrous, horloge | 0, 3, 9, 10, 11 | environ 45 % | **Très élevée** : une erreur fait perdre ou dupliquer des données |
| Connexion Google et cycle de vie de session | 1 | environ 13 % | Élevée : sécurité, règles RED-01 à 08 |
| Fonctions métier et écrans : objectifs, tâches, sous-éléments, états | 2, 4 à 8 | environ 27 % | Moyenne : règles bien spécifiées, beaucoup d'interface |
| Hors ligne, PWA, onglets, IHM de bout en bout | 12, 13 | environ 11 % | Moyenne |
| Outillage, CI, scripts, configuration | transverse (A5) | environ 4 % | Faible et mécanique, mais bloquante pour le rang 0 |

### Avis de Jarvis
- **Des développeurs en parallèle n'économisent pas de tokens.** Le volume dépend du travail à faire, pas du nombre d'agents. Chaque agent supplémentaire relit en plus le socle, les conventions et les ST, ce qui ajoute 10 à 20 % par agent. Il faut aussi gérer les conflits de fusion. Le gain serait seulement en durée, et l'ordre des rangs, très séquentiel (0 → 1 → 2 → 3…), le limite.
- **En revanche, spécialiser les développeurs améliore la qualité et réduit les tokens.** La reprise après revue est le poste le plus coûteux d'un développement. Un profil adapté à la difficulté fait moins d'allers-retours en E13. Un profil moins cher sur les parties simples économise le reste.

### Organisation recommandée : 3 profils, sur des agents neufs à chaque rang
| Profil | Nom proposé | Modèle | Rangs | Pourquoi |
|---|---|---|---|---|
| **Développeur cœur de données et synchronisation** | à nommer | **opus** | 0, 1, 3, 9, 10, 11 | Les algorithmes de fusion, l'horloge, la concurrence et la sécurité de connexion demandent un raisonnement fin. Une erreur coûte des données et plusieurs revues. |
| **Développeur fonctionnel et interface** : Benjamin | Benjamin | **sonnet** | 2, 4 à 8, 12, 13 | Règles métier bien spécifiées, React et Ionic, modèles de vue : du travail de production. |
| **Développeur outillage et intégration continue** | à nommer | **haiku**, puis sonnet en cas d'échec | Outillage A5, CI, scripts, dépendances, sous l'autorité de Benjamin | Tâches mécaniques et bien bornées. |

- **Parallélisme limité et sûr**, chaque agent dans son propre worktree :
  - l'outillage et la CI avancent en parallèle du rang 0 ;
  - à partir du rang 2, les écrans d'un rang métier peuvent avancer pendant que le cœur prépare le rang de synchronisation suivant, **si** Anthony confirme que les fichiers ne se recouvrent pas.
- **Un agent neuf par rang** (OPT-1), avec un brief qui pointe vers la ST, les tests du rang et les conventions, plutôt qu'un Benjamin unique qui accumule tout le lot.
- **Anthony reste le relecteur unique en E13.** La cohérence est assurée par les conventions, les contrats de ports et la CI, pas par la mémoire d'un agent.

**Effet attendu** : moins de reprises sur les rangs critiques ; environ 35 % du code produit par haiku ou sonnet plutôt que par opus ; aucune hausse de coût liée à la coordination, car il n'y a pas de parallélisme sur les mêmes fichiers.

## 4. Décisions proposées au commanditaire
- **Q-TOK-1** : adopter les optimisations OPT-1 à OPT-8 ? *Reco : oui.* OPT-2 suppose que vous lanciez désormais la session avec `claude --agent jarvis`.
- **Q-TOK-2** : créer le profil « développeur cœur de données et synchronisation » (opus) et le profil « outillage et CI » (haiku), en gardant Benjamin (sonnet) sur le fonctionnel et l'interface ? *Reco : oui.* Choisissez les deux noms, ou laissez Jarvis en proposer.
- **Q-TOK-3** : appliquer ce découpage dès le rang 0 en cours ? *Reco : non.* Benjamin termine le rang 0, qui est déjà bien avancé. Le nouveau profil prend le rang 1, et l'outillage restant est confié au profil outillage.
