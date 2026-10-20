# Cahier des charges — Application de gestion d'objectifs et de tâches synchronisée avec Google Calendar

> **Version 0.3 — 2026-10-20.** Intègre la demande DEM-002 (questions de bilan du soir, fun fact du matin) : RG-012 et RG-013 modifiées, nouvelles RG-038 à RG-042, questions Q-DEM002-1 à 7.
>
> **Version 0.2 — 2026-10-20.** Ce document intègre les réponses du commanditaire aux questions Q-DEM001-1 à Q-DEM001-20, ainsi que ses trois compléments du 2026-10-20. Les réponses figurent dans le fichier [`questions-ouvertes.md`](questions-ouvertes.md).
>
> Statuts des règles :
> - **Établie** : la règle découle sans ambiguïté de la demande ou d'une réponse du commanditaire ;
> - **À préciser** : le principe est établi, mais certaines modalités dépendent d'une question résiduelle (Q-DEM001-21 et suivantes).
>
> **Validations encore attendues du commanditaire** (voir §11) : la reformulation du besoin (§2), les exclusions proposées (§4.3), les exigences ENF-05 et ENF-06, au statut « proposée », et les réponses aux questions Q-DEM002.

## 1. Historique des versions

| Version | Date | Auteur | Demande | Nature de la modification |
|---|---|---|---|---|
| 0.1 | 2026-10-20 | Pepper (BA) | DEM-001 | Création du brouillon à partir de la demande initiale. Règles de gestion RG-001 à RG-017, exigences ENF-01 à ENF-05, questions Q-DEM001-1 à Q-DEM001-20. |
| 0.2 | 2026-10-20 | Pepper (BA) | DEM-001 | Intégration des réponses Q-DEM001-1 à 20 et des trois compléments du commanditaire du 2026-10-20. Changements : RG-001 à RG-017 précisées, dont 10 passent au statut « Établie » ; nouvelles RG-018 à RG-037 ; périmètre mis à jour (hors ligne, créneaux dans Google Calendar et prise en compte des événements désormais inclus ; tâches récurrentes reportées) ; nouvelles exclusions décidées ; ENF-04 devient exigée ; ajout d'ENF-06 ; glossaire complété ; reformulation du besoin mise à jour ; questions résiduelles Q-DEM001-21 à Q-DEM001-40. |
| 0.3 | 2026-10-20 | Pepper (BA) | DEM-002 | Ajout de deux questions de bilan dans le rappel du soir et d'un fun fact scientifique dans le rappel du matin. Changements : RG-012 et RG-013 modifiées ; nouvelles RG-038 à RG-042 ; OBJ-11 ; périmètre et glossaire complétés ; analyse d'écart DEM-002 (§2) ; questions Q-DEM002-1 à Q-DEM002-7. |

## 2. Contexte

Le commanditaire souhaite disposer d'un outil personnel pour piloter son travail à partir de ses **objectifs**. Chaque objectif se décline en **tâches**, et peut être organisé en sous-objectifs. Les tâches peuvent elles-mêmes comporter des sous-tâches. L'outil doit l'aider à :
- décider quoi faire en priorité ;
- planifier ses journées ;
- vérifier que ce planning lui permet de tenir ses objectifs dans les délais.

Le commanditaire veut aussi mesurer le temps qu'il passe réellement chaque jour sur chaque tâche. Ces mesures doivent lui permettre d'évaluer sa vitesse de travail (**vélocité**) et d'ajuster en conséquence ses objectifs, les délais de ses tâches et le temps qu'il prévoit de consacrer chaque jour à ses tâches.

Pour ancrer cet usage dans son quotidien, il s'appuie sur son agenda Google :
- deux rappels quotidiens : le matin, la liste des tâches du jour ; le soir, le bilan du temps passé et du reste à faire ;
- ses tâches planifiées apparaissent comme des créneaux dans son agenda principal ;
- ses événements d'agenda réduisent le temps disponible pour ses tâches.

Il utilise l'application sur son smartphone, usage prioritaire, et sur un PC, dès la première version. Ses données sont conservées dans son propre espace de stockage en ligne. L'application est utilisable sans réseau, au moins sur le smartphone.

### Reformulation du besoin, version 0.2 (à valider par le commanditaire)
> « Je fixe des objectifs, datés ou non, que je décompose en sous-objectifs et en tâches, elles-mêmes décomposables en sous-tâches. Chaque tâche a un délai et une estimation en heures. L'application me propose un ordre de priorité et un planning à la journée, que je peux modifier, en fonction du temps que je peux consacrer chaque jour à mes tâches et des événements de mon agenda. Elle suggère un horaire pour chaque tâche planifiée et la place en créneau dans mon agenda Google principal. Chaque jour, je note le temps passé sur chaque tâche ; le reste à faire est calculé et je peux le corriger. L'application en déduit ma vélocité hebdomadaire, me dit si mes délais sont tenables, me propose de nouveaux délais ou un nouveau planning, et me montre l'évolution de mon backlog et de ma vélocité. Google Calendar me rappelle à 8 h ce que j'ai prévu et à 21 h ce que j'ai fait. Je me connecte avec mon compte Google ; mes données restent dans mon propre espace de stockage, je les retrouve sur mon smartphone et sur mon PC, et je peux travailler sans réseau sur mon smartphone. »

### Analyse d'écart de la demande DEM-002 (v0.3)
DEM-002, reformulée : « Chaque soir, en plus du bilan de mes tâches, l'application me pose deux questions : ce qui s'est bien passé aujourd'hui, et ce que j'aurais aimé faire autrement. Chaque matin, en plus de la liste de mes tâches, elle me présente une anecdote surprenante (fun fact), de préférence scientifique, tirée d'une liste de 100 anecdotes enregistrées dans l'application. Le tirage est aléatoire, mais chaque anecdote doit apparaître aussi souvent que les autres. »

| Nature | Élément |
|---|---|
| **Nouveau** | Questions de bilan du soir et réponses de l'utilisateur (RG-038, RG-039) ; fun fact du matin (RG-040), liste de 100 fun facts (RG-041), équité d'affichage (RG-042). Il s'agit d'un nouvel objet métier : les réponses aux questions de bilan, qui ne portent ni sur une tâche, ni sur un objectif. |
| **Modifié** | RG-012 (le rappel du matin contient aussi un fun fact) ; RG-013 (le rappel du soir contient aussi les deux questions de bilan). |
| **Contradiction ou tension** | Le rappel du soir est un événement Google Calendar (RG-014, Q-DEM001-18.3 a). Un tel événement permet d'afficher des questions, pas d'y répondre. Le lieu de la réponse est donc à définir (Q-DEM002-1), en lien avec le rôle de la notification de l'application (Q-DEM001-38). La demande parle de « notification du soir » : nous l'entendons comme le rappel du soir (RG-013). |
| **Sans impact** | Les règles existantes s'appliquent aux réponses : stockage dans l'espace personnel (RG-020), usage hors ligne (RG-021) et règle de conflit (RG-036). |
| **Lot** | Les rappels ne font pas partie des capacités indispensables à la première version (Q-DEM001-1 : seul a) l'est). DEM-002 enrichit les rappels : elle relève donc du lot « Rappels », et non de LOT-001. |

### Existant
Aucune fonctionnalité livrée. L'existant documentaire se limite à la version 0.1 de ce cahier des charges et au backlog initial. L'écart entre la v0.1 et la v0.2 est détaillé ci-dessous.

| Nature | Élément |
|---|---|
| **Nouveau** | Connexion obligatoire avec un compte Google (RG-019) ; stockage dans l'espace personnel de l'utilisateur (RG-020) ; sous-objectifs et sous-tâches (RG-022, RG-023) ; tâche rattachée à zéro, un ou plusieurs objectifs (RG-001) ; abandon d'une tâche (RG-027) ; importance d'un objectif (RG-030) ; proposition de planning (RG-031) ; report automatique (RG-032) ; prise en compte des événements de l'agenda (RG-033) ; créneaux dans l'agenda principal, avec horaire suggéré (RG-034) ; prise en compte d'un créneau déplacé dans Google Calendar, avec notification et replanification proposée le soir (RG-037) ; règle de conflit entre appareils (RG-036). |
| **Modifié** | Délai d'un objectif facultatif (RG-002) ; contrôle des délais fondé sur la vélocité réelle (RG-007) ; vélocité définie comme la somme des estimations initiales des tâches terminées, par semaine (RG-010) ; backlog limité aux tâches non terminées et non planifiées (RG-015) ; utilisation hors ligne exigée (ENF-04). |
| **Contradiction levée** | Planification « sur une journée, sans horaire » (Q-DEM001-13) et tâches visibles « comme des créneaux » (Q-DEM001-15) : tranché par le complément du commanditaire. La tâche est planifiée sur une journée et l'application lui suggère un horaire, qui produit le créneau (RG-006, RG-034). |
| **Tensions restant à arbitrer (DEM-001)** | Voir les questions résiduelles Q-DEM001-21 à Q-DEM001-40. Les principales portent sur la vélocité et le reste à faire (Q-DEM001-30), sur la définition du backlog (Q-DEM001-36) et sur l'atteinte d'un objectif hiérarchisé (Q-DEM001-26). |

## 3. Objectifs du produit

| Id | Objectif métier | Source |
|---|---|---|
| OBJ-1 | Structurer le travail en objectifs déclinés en tâches | DEM-001 ; Q-DEM001-6 |
| OBJ-2 | Aider à prioriser les tâches à réaliser | DEM-001 ; Q-DEM001-16 |
| OBJ-3 | Planifier les tâches et vérifier la tenue des objectifs et des délais | DEM-001 ; Q-DEM001-13, Q-DEM001-17 |
| OBJ-4 | Suivre le temps passé chaque jour sur chaque tâche | DEM-001 ; Q-DEM001-10 |
| OBJ-5 | Estimer la vélocité pour ajuster objectifs et délais | DEM-001 ; Q-DEM001-12, Q-DEM001-17 |
| OBJ-6 | Estimer et réajuster le temps à consacrer chaque jour aux tâches | DEM-001 ; Q-DEM001-14 |
| OBJ-7 | Recevoir des rappels quotidiens, le matin et le soir, via Google Calendar | DEM-001 ; Q-DEM001-18, Q-DEM001-19 |
| OBJ-8 | Visualiser l'évolution du backlog et de la vélocité | DEM-001 ; Q-DEM001-20 |
| OBJ-9 | Utiliser l'application sur smartphone et sur PC avec les mêmes données, conservées dans l'espace personnel de l'utilisateur, y compris sans réseau | DEM-001 ; Q-DEM001-1 j), Q-DEM001-3, Q-DEM001-4 (compléments) |
| OBJ-10 | Articuler le planning avec l'agenda Google : créneaux de tâches, prise en compte des événements | Q-DEM001-15 (et compléments) |
| OBJ-11 | Favoriser la prise de recul quotidienne (bilan du soir) et rendre le rappel du matin plus engageant (fun fact) | DEM-002 |

## 4. Périmètre

### 4.1 Inclus
- La connexion à l'application avec un compte Google, obligatoire.
- La conservation des données dans l'espace de stockage en ligne personnel de l'utilisateur.
- L'accès aux mêmes données depuis un smartphone et depuis un PC, dès la première version.
- L'utilisation sans réseau, en consultation et en saisie : en priorité sur le smartphone ; pour le PC, voir Q-DEM001-39.
- La création et la gestion d'objectifs (délai facultatif, importance) et de sous-objectifs.
- La création et la gestion de tâches (délai obligatoire, estimation) et de sous-tâches. Une tâche est rattachée à zéro, un ou plusieurs objectifs.
- La fin d'une tâche sur déclaration, sa réouverture, son abandon ; le calcul de l'atteinte d'un objectif.
- La priorisation : ordre proposé par l'application, modifiable.
- La capacité quotidienne : valeur par jour de la semaine, exceptions datées, ré-estimation proposée par l'application.
- La planification à la journée : planning proposé par l'application et modifiable, report automatique des tâches non terminées.
- Les créneaux de tâches dans l'agenda Google principal, avec un horaire suggéré, et la prise en compte d'un créneau déplacé dans Google Calendar.
- La prise en compte des événements de l'agenda Google dans la capacité disponible.
- La saisie du temps passé par tâche et par jour, et le reste à faire, calculé et corrigeable.
- Le calcul de la vélocité hebdomadaire, le contrôle de tenue des délais et la proposition d'ajustements.
- Les rappels quotidiens du matin et du soir, via l'agenda Google principal.
- La visualisation de l'évolution du backlog et de la vélocité, en vue globale et par objectif.
- Les deux questions de bilan du rappel du soir et la saisie des réponses (DEM-002).
- Le fun fact du rappel du matin, tiré équitablement d'une liste de 100 (DEM-002).

### 4.2 Reporté à un lot ultérieur (dans le périmètre à terme)
| Élément | Source | Remarque |
|---|---|---|
| Tâches récurrentes | Q-DEM001-8 b) « oui, mais plus tard » | Les fréquences seront recueillies lors de la préparation du lot concerné. Elles ne sont pas demandées à ce stade. |

### 4.3 Exclu
| Élément exclu | Statut | Source |
|---|---|---|
| Usage par plusieurs personnes, partage d'objectifs ou de tâches, affectation à d'autres personnes | Décidé | Q-DEM001-2 a) |
| Utilisation de l'application sans compte Google | Décidé | Q-DEM001-19.2 « non » |
| Conservation des données par l'application ailleurs que dans l'espace personnel de l'utilisateur | Décidé | Q-DEM001-3 b) |
| Chronomètre de suivi du temps | Décidé | Q-DEM001-10.1 b) |
| Planification d'une tâche répartie sur plusieurs journées | Décidé | Q-DEM001-13.1 a) |
| Fin automatique d'une tâche quand son reste à faire atteint zéro | Décidé | Q-DEM001-7.1 a) |
| Atteinte d'un objectif déclarée manuellement, ou mesurée par une valeur cible chiffrée | Décidé | Q-DEM001-5.4 a) |
| Ajustement automatique des délais ou du planning sans validation de l'utilisateur | Décidé | Q-DEM001-17.2 b) |
| Mise à jour du rappel du matin après son heure d'envoi | Décidé | Q-DEM001-18.4 « non » |
| Synchronisation avec d'autres agendas que Google Calendar (Outlook, iCloud…) | Proposé, à valider | Absent de la demande |
| Import depuis d'autres outils de gestion de tâches | Proposé, à valider | Absent de la demande |
| Facturation ou suivi financier du temps passé | Proposé, à valider | Absent de la demande |

## 5. Acteurs et personas

| Acteur | Description | Statut |
|---|---|---|
| **Utilisateur** (persona « le commanditaire ») | Seul utilisateur de l'application. Il définit ses objectifs, ses tâches, son planning et sa capacité, saisit son temps passé, reçoit les rappels et consulte les indicateurs. Utilise un smartphone (usage prioritaire) et un PC. | Établi (Q-DEM001-2 a) |
| **Compte Google de l'utilisateur** (système externe) | Sert à la connexion à l'application, obligatoire. Fournit l'agenda principal (rappels, créneaux de tâches, événements pris en compte dans la capacité) et, probablement, l'espace de stockage des données (à confirmer : Q-DEM001-22). | Établi |
| **Espace de stockage en ligne personnel** (système externe) | Espace appartenant à l'utilisateur, dans lequel ses données sont conservées. | Établi (service exact : Q-DEM001-22) |

**Persona principal.** Le commanditaire, travailleur autonome sur ses propres objectifs. Il organise lui-même ses journées et utilise surtout son smartphone, parfois sans réseau. Il travaille aussi sur PC et utilise déjà Google Calendar. Il veut un pilotage chiffré (temps passé, reste à faire, vélocité) et garder la maîtrise de ses données.

## 6. Concepts métier et glossaire

| Terme | Définition | Référence |
|---|---|---|
| **Objectif** | Résultat que l'utilisateur veut atteindre, avec ou sans délai. Il peut comporter des sous-objectifs et regrouper des tâches. Son état (en cours ou atteint) est calculé à partir de ses tâches. | RG-001, RG-002, RG-022, RG-025 |
| **Sous-objectif** | Objectif rattaché à un objectif parent. | RG-022, Q-DEM001-24 |
| **Importance d'un objectif** | Niveau d'importance porté par un objectif, utilisé pour proposer l'ordre de priorité des tâches. | RG-030, Q-DEM001-35 |
| **Tâche** | Unité de travail concrète, avec un délai obligatoire et une estimation. Elle est rattachée à zéro, un ou plusieurs objectifs. Ses états sont : à faire, terminée ou abandonnée. | RG-001, RG-003, RG-026, RG-027 |
| **Tâche sans objectif** | Tâche rattachée à aucun objectif. | RG-001 |
| **Sous-tâche** | Tâche rattachée à une tâche parente. | RG-023, Q-DEM001-25 |
| **Délai (échéance)** | Date à laquelle un objectif ou une tâche doit être atteint ou terminé. Il est facultatif pour un objectif et obligatoire pour une tâche. | RG-002, RG-003 |
| **Estimation initiale** (« temps original estimé ») | Quantité de travail prévue pour réaliser une tâche lors de sa création, exprimée en heures et minutes par pas de 30 min. Elle est conservée pour le calcul de la vélocité. | RG-028, RG-029 |
| **Unité de temps** | Heures et minutes, avec une précision de 30 min. | RG-028 |
| **Priorité** | Rang d'une tâche dans l'ordre de réalisation proposé par l'application. L'utilisateur peut modifier cet ordre. | RG-005 |
| **Planification** | Affectation d'une tâche à une journée, sans horaire. L'application suggère ensuite un horaire, qui donne le créneau. | RG-006, RG-031, RG-034 |
| **Horaire suggéré** | Heure de début et durée proposées par l'application pour une tâche planifiée sur une journée. Elles forment le créneau placé dans l'agenda Google. | RG-034, Q-DEM001-32 |
| **Créneau de tâche** | Événement de l'agenda Google principal qui représente une tâche planifiée, à son horaire suggéré. | RG-034, RG-037 |
| **Report automatique** | Déplacement automatique au jour suivant d'une tâche planifiée un jour passé et non terminée. | RG-032 |
| **Journée** | Jour calendaire déterminé par l'heure locale de l'appareil utilisé. | RG-008 |
| **Capacité quotidienne** | Temps que l'utilisateur prévoit de consacrer à ses tâches pour un jour de la semaine, éventuellement remplacé par une exception à une date donnée. Les événements de l'agenda la réduisent. | RG-011, RG-033 |
| **Temps passé** | Durée consacrée à une tâche au cours d'une journée, saisie par l'utilisateur. | RG-008 |
| **Reste à faire** | Travail restant pour terminer une tâche. Il est calculé (estimation initiale moins temps passé cumulé) et l'utilisateur peut le corriger. | RG-009 |
| **Tâche terminée** | Tâche que l'utilisateur a déclarée terminée. Elle peut être rouverte. | RG-026 |
| **Tâche abandonnée** | Tâche que l'utilisateur ne réalisera pas : ni terminée, ni à faire. | RG-027 |
| **Objectif atteint** | Objectif dont toutes les tâches sont terminées. Les modalités pour les sous-objectifs et les tâches abandonnées sont à préciser. | RG-025, Q-DEM001-26 |
| **Vélocité** | Somme des estimations initiales des tâches terminées dans une semaine. | RG-010 |
| **Backlog** | Ensemble des tâches non terminées et non planifiées, mesuré par la somme de leurs restes à faire. | RG-015, Q-DEM001-36 |
| **Rappel du matin** | Événement quotidien de l'agenda Google principal, à 8 h par défaut, qui liste les tâches planifiées dans la journée et présente un fun fact. | RG-012, RG-014, RG-040 |
| **Rappel du soir** | Événement quotidien de l'agenda Google principal, à 21 h par défaut, qui liste le temps passé dans la journée et le reste à faire, et pose les deux questions de bilan. | RG-013, RG-014, RG-038 |
| **Questions de bilan** | Les deux questions posées chaque soir : ce qui s'est bien passé aujourd'hui ; ce que l'utilisateur aurait aimé faire autrement. | RG-038, RG-039 |
| **Fun fact** | Anecdote surprenante et vérifiable, de préférence scientifique, présentée dans le rappel du matin. | RG-040, RG-041 |
| **Liste des fun facts** | Ensemble des 100 fun facts enregistrés dans l'application, parmi lesquels le fun fact du jour est tiré. | RG-041, RG-042 |
| **Compte Google** | Compte avec lequel l'utilisateur se connecte. Il donne accès à son agenda et, probablement, à son espace de stockage. L'utilisateur peut retirer l'accès qu'il a accordé (révocation), et cet accès peut expirer. | RG-019, RG-035 |
| **Espace de stockage personnel** | Espace de stockage en ligne appartenant à l'utilisateur, dans lequel ses données sont conservées. | RG-020 |
| **Appareil** | Smartphone ou PC depuis lequel l'utilisateur utilise l'application. | RG-017 |
| **Conflit de modification** | Situation où une même donnée a été modifiée différemment sur deux appareils avant que ceux-ci n'aient échangé leurs modifications. | RG-036 |

## 7. Règles de gestion

| RG | Énoncé | Source | Statut | Questions liées | US |
|---|---|---|---|---|---|
| RG-001 | Une tâche peut être rattachée à zéro, un ou plusieurs objectifs. Un objectif peut regrouper plusieurs tâches. | DEM-001 ; Q-DEM001-6.2, 6.3 | Établie | — | US-001, US-002, US-003 |
| RG-002 | Le délai d'un objectif est facultatif. S'il est renseigné, c'est une date. | Q-DEM001-5.1 | Établie (délai passé à la saisie : Q-DEM001-28) | Q-DEM001-28 | US-001, US-007 |
| RG-003 | Le délai d'une tâche est obligatoire. | Q-DEM001-5.2 | Établie (forme et délai passé : Q-DEM001-28) | Q-DEM001-28 | US-002, US-024, US-007 |
| RG-004 | L'utilisateur peut modifier à tout moment ses objectifs et les délais de ses tâches. | DEM-001 | Établie | — | US-001, US-002, US-011 |
| RG-005 | L'application propose un ordre de priorité des tâches à réaliser. L'utilisateur peut le modifier manuellement. | Q-DEM001-16 c) | À préciser (critères, départage, sort des modifications manuelles) | Q-DEM001-35 | US-004, US-027 |
| RG-006 | Planifier une tâche, c'est la placer sur une journée, sans horaire. Une tâche n'est planifiée que sur une seule journée à la fois. | Q-DEM001-13.1 a) | Établie | Q-DEM001-32 (tâche plus longue qu'une journée) | US-006, US-027 |
| RG-007 | L'application juge qu'un délai ne tient pas en comparant le travail restant à ce que la vélocité réelle permet de réaliser avant ce délai. Dans ce cas, elle propose un nouveau délai ou un nouveau planning, que l'utilisateur accepte ou refuse. Les alertes apparaissent dans l'application et dans les rappels. | Q-DEM001-17.1 b), 17.2 b), 17.3 | À préciser (mesure du travail restant, valeur de vélocité retenue, démarrage sans historique) | Q-DEM001-30 | US-007, US-011, US-015, US-016 |
| RG-008 | Le temps passé est saisi comme une durée, par tâche et par journée. Une saisie ou une correction est possible sur n'importe quel jour antérieur, sans limite. La journée est déterminée par l'heure locale de l'appareil. | Q-DEM001-10.1 b), 10.2 b), 10.4 a) | Établie (précision et nature de la saisie : Q-DEM001-31) | Q-DEM001-31 | US-008 |
| RG-009 | Le reste à faire d'une tâche est calculé automatiquement : estimation initiale moins temps passé cumulé. L'utilisateur peut le corriger à tout moment. Si le temps passé dépasse l'estimation sans que la tâche soit terminée, l'application affiche une alerte qui demande de ré-estimer. | Q-DEM001-11.1 c), 11.2 b) | À préciser (calcul après correction, seuil de l'alerte) | Q-DEM001-31 | US-009, US-016 |
| RG-010 | La vélocité d'une semaine est la somme des estimations initiales des tâches terminées dans cette semaine. Une semaine sans tâche terminée a une vélocité nulle et entre dans le calcul. | Q-DEM001-12.1, 12.2 b), 12.3 | À préciser (semaine de rattachement, tâches rouvertes, sous-tâches) | Q-DEM001-30, Q-DEM001-25 | US-010, US-011, US-013 |
| RG-011 | La capacité quotidienne est définie par jour de la semaine, avec des exceptions à une date précise. L'application propose une ré-estimation à partir du temps réellement passé, que l'utilisateur valide ou non. Si la planification d'une journée dépasse sa capacité, l'application alerte sans bloquer. | Q-DEM001-14.1 c), 14.2 b), 14.3 b) | Établie | — | US-005, US-006, US-026, US-027, US-019 |
| RG-012 | Chaque jour, y compris le week-end, l'utilisateur reçoit à 8 h (heure par défaut, modifiable) un rappel qui liste les tâches planifiées dans la journée. Une journée sans tâche planifiée donne lieu à un rappel indiquant qu'aucune tâche n'est planifiée. Le contenu du rappel n'est pas mis à jour si le planning change après son heure. Le rappel contient aussi un fun fact (RG-040). | Q-DEM001-18.1, 18.2 a), 18.4, 18.6 ; DEM-002 | À préciser (fuseau horaire ; fun fact un jour sans tâche) | Q-DEM001-37, Q-DEM002-7 | US-015, US-029, US-035 |
| RG-013 | Chaque jour, l'utilisateur reçoit à 21 h (heure par défaut, modifiable) un rappel qui liste le temps passé dans la journée et le reste à faire. Il porte sur les tâches planifiées dans la journée et sur les tâches qui ont reçu du temps passé dans la journée. Il pose aussi les deux questions de bilan (RG-038). | Q-DEM001-18.1, 18.2 a), 18.5 c) ; DEM-002 | À préciser (invitation à saisir, fuseau horaire) | Q-DEM001-37, Q-DEM001-40 | US-016, US-029, US-033 |
| RG-014 | Un rappel est un événement court dans l'agenda Google principal. Sa description contient la liste, et une notification Google se déclenche à l'heure du rappel. Google Calendar est le canal souhaité ; une notification de l'application elle-même est acceptable. | Q-DEM001-18.3 a), 19.1 b) | À préciser (rôle de la notification de l'application) | Q-DEM001-38 | US-014, US-015, US-016 |
| RG-015 | Le backlog est l'ensemble des tâches non terminées et non planifiées. Son évolution se mesure par la somme de leurs restes à faire, en vue globale et par objectif, sur les 12 dernières semaines, semaine par semaine. | Q-DEM001-20 | À préciser (cohérence avec la proposition de planning, tâches abandonnées) | Q-DEM001-36, Q-DEM001-27 | US-012 |
| RG-016 | L'évolution de la vélocité s'affiche en vue globale et par objectif, sur les 12 dernières semaines, semaine par semaine. | Q-DEM001-20.3, 20.4 | Établie (dépend de RG-010) | — | US-013 |
| RG-017 | L'application est utilisable sur smartphone et sur PC dès la première version. L'utilisateur y retrouve les mêmes données. Une modification faite sur un appareil est visible sur l'autre dans l'heure qui suit. | Q-DEM001-1 j), Q-DEM001-3 (complément) | À préciser (interprétation du délai d'une heure) | Q-DEM001-21 | US-017 |
| RG-018 | L'application a un seul utilisateur par compte. Les données d'un utilisateur ne sont ni partagées ni visibles par d'autres personnes. | Q-DEM001-2 a) | Établie | — | US-022, US-017 |
| RG-019 | L'utilisation de l'application nécessite une connexion avec un compte Google. Sans compte Google connecté, aucune fonction n'est accessible. | Q-DEM001-19.2 « non » | Établie | Q-DEM001-22 (perte d'accès) | US-022 |
| RG-020 | Les données de l'utilisateur sont conservées dans son propre espace de stockage en ligne. | Q-DEM001-3 b) | À préciser (service de stockage, données modifiées hors de l'application) | Q-DEM001-22 | US-017, US-022 |
| RG-021 | L'utilisateur peut consulter et saisir ses données sans réseau. Ses modifications sont prises en compte au retour du réseau. Le smartphone est l'appareil prioritaire pour cet usage. | Q-DEM001-4.1 c) (et complément) | À préciser (hors ligne sur le PC) | Q-DEM001-39 | US-018, US-031 |
| RG-022 | Un objectif peut comporter des sous-objectifs. | Q-DEM001-6.1 d) | À préciser (profondeur, parent unique, délai, déplacement) | Q-DEM001-24 | US-023 |
| RG-023 | Une tâche peut comporter des sous-tâches. | Q-DEM001-6.1 d) | À préciser (profondeur, délai et estimation, fin de la tâche parente, objectifs) | Q-DEM001-25 | US-024 |
| RG-024 | Le délai d'une tâche peut être postérieur au délai d'un de ses objectifs. L'application l'accepte et affiche une alerte qui nomme le ou les objectifs concernés. Aucune alerte n'est émise pour un objectif sans délai. | Q-DEM001-5.3 b), 5.1 | Établie | — | US-002, US-001 |
| RG-025 | Un objectif est atteint quand toutes ses tâches sont terminées. Cet état est calculé : il change dès qu'une tâche de l'objectif est ajoutée, rouverte ou terminée. | Q-DEM001-5.4 a) | À préciser (sous-objectifs, tâches abandonnées, objectif sans tâche) | Q-DEM001-26 | US-001, US-003, US-023, US-025 |
| RG-026 | Une tâche est terminée quand l'utilisateur la déclare terminée, et jamais automatiquement. Une tâche terminée peut être rouverte. | Q-DEM001-7.1 a), 7.2 | Établie | Q-DEM001-25 (tâche avec sous-tâches) | US-003 |
| RG-027 | Une tâche peut être abandonnée : elle n'est alors ni terminée, ni à faire. | Q-DEM001-7.3 | À préciser (reprise, sous-tâches, backlog) | Q-DEM001-27 | US-025 |
| RG-028 | Les estimations, les restes à faire et la capacité s'expriment en heures et minutes, avec une précision de 30 min. | Q-DEM001-9 a) | Établie (temps passé : Q-DEM001-31) | Q-DEM001-31 | US-002, US-024, US-005, US-009 |
| RG-029 | L'estimation initiale d'une tâche est conservée, car elle sert au calcul de la vélocité (RG-010). | Q-DEM001-12.1 | À préciser (caractère obligatoire, modification) | Q-DEM001-28 | US-002, US-010 |
| RG-030 | Un objectif porte une importance, utilisée pour proposer l'ordre de priorité. | Q-DEM001-6.4 | À préciser (échelle, valeur par défaut, tâches à plusieurs objectifs) | Q-DEM001-35 | US-030, US-004 |
| RG-031 | L'application propose un planning, selon la priorité, les délais et la capacité. L'utilisateur peut le modifier. | Q-DEM001-13.2 b) | À préciser (horizon de la proposition) | Q-DEM001-36 | US-027, US-032 |
| RG-032 | Une tâche planifiée un jour passé et non terminée est reportée automatiquement au jour suivant. | Q-DEM001-13.3 | À préciser (jour suivant sans capacité) | Q-DEM001-32 | US-028 |
| RG-033 | Les événements de l'agenda Google réduisent automatiquement le temps disponible du jour pour les tâches. | Q-DEM001-15.1 | À préciser (mode de calcul, événements retenus) | Q-DEM001-34 | US-019 |
| RG-034 | Chaque tâche planifiée reçoit un horaire suggéré par l'application et apparaît comme un créneau dans l'agenda Google principal. | Q-DEM001-15.2 (et compléments) | À préciser (choix de l'horaire, durée, modification par l'utilisateur) | Q-DEM001-32 | US-020 |
| RG-035 | Si l'utilisateur retire l'accès à son compte Google, ou si cet accès expire, l'application l'avertit au prochain usage et lui propose de se reconnecter. Les événements déjà créés dans l'agenda sont conservés. Aucune donnée de l'utilisateur n'est perdue. | Q-DEM001-19.3 a) et c) | À préciser (usage de l'application en attendant la reconnexion) | Q-DEM001-22 | US-022, US-014 |
| RG-036 | Quand une même donnée a été modifiée sur les deux appareils avant qu'ils n'aient échangé leurs modifications, la modification la plus récente l'emporte. | Q-DEM001-4.2 (complément) | À préciser (granularité de la règle) | Q-DEM001-23 | US-017, US-018 |
| RG-037 | Quand un créneau de tâche est déplacé dans Google Calendar, l'application affiche une notification. Le soir, elle propose une replanification de la tâche, que l'utilisateur valide ou modifie. La replanification n'est jamais appliquée sans sa validation. | Q-DEM001-15.2 (compléments) | À préciser (moment de la proposition, jour proposé, créneau supprimé ou déplacé dans la même journée) | Q-DEM001-33 | US-032 |
| RG-038 | Chaque soir, le rappel du soir pose deux questions de bilan : l'une sur ce qui s'est bien passé dans la journée, l'autre sur ce que l'utilisateur aurait aimé faire autrement. | DEM-002 | Établie (formulation exacte à valider en E6) | — | US-033, US-016 |
| RG-039 | L'utilisateur peut répondre aux deux questions de bilan d'une journée. | DEM-002 | À préciser (lieu et moment de la réponse, caractère facultatif, conservation et consultation) | Q-DEM002-1, Q-DEM002-2, Q-DEM002-3 | US-033, US-034 |
| RG-040 | Chaque matin, le rappel du matin présente un fun fact, de préférence dans le domaine scientifique. | DEM-002 | À préciser (jour sans tâche, domaine) | Q-DEM002-4, Q-DEM002-7 | US-035, US-015 |
| RG-041 | Le fun fact du jour est tiré parmi une liste de 100 fun facts enregistrés dans l'application. | DEM-002 | À préciser (fournisseur du contenu, langue, liste modifiable) | Q-DEM002-4, Q-DEM002-5 | US-035, US-036 |
| RG-042 | Le tirage du fun fact est aléatoire, et chaque fun fact de la liste est présenté aussi souvent que les autres. | DEM-002 | À préciser (mode de tirage garantissant l'égalité) | Q-DEM002-6 | US-035 |

## 8. Exigences non fonctionnelles (côté métier)

| ENF | Exigence | Source | Statut | Questions liées |
|---|---|---|---|---|
| ENF-01 | L'application est utilisable sur smartphone et sur PC dès la première version, avec un affichage adapté à chaque appareil. Le smartphone est l'usage prioritaire. | DEM-001 ; Q-DEM001-1 j) (complément) | Établie | — |
| ENF-02 | Les données sont conservées dans l'espace de stockage personnel de l'utilisateur et accessibles depuis les deux appareils. Une modification faite sur un appareil est visible sur l'autre dans l'heure qui suit. | DEM-001 ; Q-DEM001-3 (et complément) | À préciser | Q-DEM001-21, Q-DEM001-22 |
| ENF-03 | Les rappels et les créneaux de tâches sont des événements de l'agenda Google principal. L'utilisateur les retrouve partout où il consulte cet agenda. | Q-DEM001-18.3, 15.2 | Établie | Q-DEM001-38 |
| ENF-04 | L'application est utilisable sans réseau, en consultation et en saisie, au moins sur le smartphone. Les conflits sont résolus selon RG-036. | Q-DEM001-4 (et complément) | À préciser (PC, granularité des conflits) | Q-DEM001-23, Q-DEM001-39 |
| ENF-05 | Confidentialité : les données de l'utilisateur ne sont accessibles qu'à lui. L'application ne demande accès à son compte Google que pour ce que nécessitent les fonctions livrées. L'utilisateur peut retirer cet accès à tout moment. | Implicite ; Q-DEM001-2 a), Q-DEM001-3 b) | Proposée, à valider | — |
| ENF-06 | Aucune perte de donnée : ni une coupure du réseau, ni la perte de l'accès Google, ni un conflit entre appareils ne doivent faire disparaître une donnée saisie sans que l'utilisateur en soit informé. | Implicite ; Q-DEM001-19 (« sans perte de vos données »), RG-036 | Proposée, à valider | Q-DEM001-22, Q-DEM001-23 |

## 9. Réponses sans objet ou non reprises

- **Q-DEM001-10.3** (chronomètre à cheval sur minuit) : sans objet, puisque le chronomètre n'est pas retenu (Q-DEM001-10.1 b).
- **Q-DEM001-8** (fréquences des récurrences) : non reposée, car les récurrences sont reportées (§4.2).

## 10. Traçabilité

- RG ↔ US : voir la colonne « US » de la section 7 et la matrice de [`backlog-initial.md`](backlog-initial.md).
- RG ↔ questions : voir la colonne « Questions liées » de la section 7 et le fichier [`questions-ouvertes.md`](questions-ouvertes.md).
- RG ↔ scénarios de test : à établir en E5 (tags `@RG-xxx` dans `tests/features/`).

## 11. Validations attendues du commanditaire

| Objet | Section | État |
|---|---|---|
| Reformulation du besoin, version 0.2 | §2 | En attente |
| Exclusions au statut « Proposé, à valider » | §4.3 | En attente |
| ENF-05 (confidentialité, accès minimal au compte Google) et ENF-06 (aucune perte de donnée) | §8 | En attente |
| Réponses aux questions résiduelles Q-DEM001-21 à 40 (les questions P1 en priorité) | `questions-ouvertes.md` | En attente |
| Reformulation de DEM-002 et réponses aux questions Q-DEM002-1 à 7 | §2, `questions-ouvertes.md` | En attente |
