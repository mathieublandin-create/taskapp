# Cahier des charges — Application de gestion d'objectifs et de tâches synchronisée avec Google Calendar

> **Version 0.1 — brouillon.** Ce document est établi à partir de la seule demande DEM-001. Plusieurs règles restent à confirmer : elles sont signalées par le statut **À préciser** et renvoient aux questions ouvertes du fichier [`questions-ouvertes.md`](questions-ouvertes.md). Aucune règle de ce document ne peut être considérée comme définitive avant les réponses du commanditaire.

## 1. Historique des versions

| Version | Date | Auteur | Demande | Nature de la modification |
|---|---|---|---|---|
| 0.1 | 2026-10-20 | Pepper (BA) | DEM-001 | Création du brouillon à partir de la demande initiale. Règles de gestion RG-001 à RG-017, exigences ENF-01 à ENF-05, questions Q-DEM001-1 à Q-DEM001-20. |

## 2. Contexte

Le commanditaire souhaite disposer d'un outil personnel pour piloter son travail à partir de ses **objectifs**. Chaque objectif se décline en **tâches**. L'outil doit l'aider à :
- décider quoi faire en priorité ;
- planifier ses journées ;
- vérifier que ce planning lui permet de tenir ses objectifs dans les délais.

Le commanditaire veut aussi mesurer le temps qu'il passe réellement chaque jour sur chaque tâche. Ces mesures doivent lui permettre d'évaluer sa vitesse de travail (**vélocité**) et d'ajuster en conséquence ses objectifs, les délais de ses tâches et le temps qu'il prévoit de consacrer chaque jour à ses tâches.

Pour ancrer cet usage dans son quotidien, il souhaite recevoir chaque jour deux rappels, de préférence par Google Calendar :
- le matin, la liste des tâches du jour ;
- le soir, le bilan du temps passé et du reste à faire.

Il veut utiliser l'application aussi bien sur son smartphone que sur un PC et retrouver les mêmes données sur les deux appareils.

### Reformulation du besoin (à valider par le commanditaire)
> « Je fixe des objectifs datés que je décompose en tâches. L'application m'aide à choisir l'ordre dans lequel les réaliser et à les répartir sur mes journées, en fonction du temps que je peux y consacrer chaque jour. Elle me dit si ce planning me permet de tenir mes délais. Chaque jour, je note le temps passé sur chaque tâche et ce qu'il me reste à faire. L'application en déduit ma vélocité et me montre comment évoluent mon backlog et ma vélocité, ce qui me permet de réajuster mes délais et mon temps quotidien. Google Calendar me rappelle le matin ce que j'ai prévu et le soir ce que j'ai fait. J'utilise tout cela indifféremment sur mon téléphone et sur mon PC. »

### Existant
Aucun : pas de cahier des charges antérieur, pas d'US, aucune fonctionnalité livrée. L'analyse d'écart porte donc entièrement sur du **nouveau** besoin. Il n'y a ni modification ni contradiction avec un existant.

## 3. Objectifs du produit

| Id | Objectif métier | Source (DEM-001) |
|---|---|---|
| OBJ-1 | Structurer le travail en objectifs déclinés en tâches | « gestion d'objectifs dérivés en tâches » |
| OBJ-2 | Aider à prioriser les tâches à réaliser | « afin de m'aider à prioriser les tâches à réaliser » |
| OBJ-3 | Planifier les tâches et vérifier la tenue des objectifs et des délais | « planifier mes tâches et vérifier que cela me permet de tenir mes objectifs et leurs délais » |
| OBJ-4 | Suivre le temps passé chaque jour sur chaque tâche | « suivre le temps passé chaque jour sur chaque tâche » |
| OBJ-5 | Estimer la vélocité pour ajuster objectifs et délais | « afin d'estimer ma vélocité et d'ajuster mes objectifs et les délais des tâches » |
| OBJ-6 | Estimer et réajuster le temps à consacrer chaque jour aux tâches | « estimer le temps à consacrer pour ces tâches tous les jours afin de le ré-estimer si besoin » |
| OBJ-7 | Recevoir des rappels quotidiens, le matin et le soir, via Google Calendar | « rappels quotidiens le matin […] et le soir […] » ; « via google calendar » |
| OBJ-8 | Visualiser l'évolution du backlog et de la vélocité | « visualiser l'évolution du backlog et de la vélocité » |
| OBJ-9 | Utiliser l'application sur smartphone et sur PC avec les mêmes données | « sur mon smartphone et aussi sur un PC […] y accéder de ces 2 manières » |

## 4. Périmètre

### 4.1 Inclus (d'après DEM-001)
- La création et la gestion d'objectifs comportant un délai.
- La déclinaison des objectifs en tâches comportant un délai.
- La priorisation des tâches à réaliser.
- La planification des tâches.
- Le contrôle de la compatibilité entre la planification et les délais.
- La définition et la ré-estimation d'une capacité quotidienne (temps à consacrer chaque jour aux tâches).
- La saisie du temps passé par tâche et par jour, et le suivi du reste à faire.
- Le calcul de la vélocité et l'aide à l'ajustement des objectifs et des délais.
- Les rappels quotidiens du matin et du soir, via Google Calendar.
- La visualisation de l'évolution du backlog et de la vélocité.
- L'accès aux mêmes données depuis un smartphone et depuis un PC.

### 4.2 Exclu (proposé, à confirmer par le commanditaire)
Ces exclusions découlent de l'absence de mention dans la demande. Elles sont **proposées** et non décidées.

| Élément exclu | Question de confirmation |
|---|---|
| Usage collaboratif : partage d'objectifs ou de tâches, affectation à d'autres personnes | Q-DEM001-2 |
| Synchronisation avec d'autres agendas que Google Calendar (Outlook, iCloud…) | — |
| Import depuis d'autres outils de gestion de tâches | — |
| Facturation ou suivi financier du temps passé | — |
| Tâches récurrentes | Q-DEM001-8 |
| Création de créneaux de travail dans Google Calendar, prise en compte des événements existants de l'agenda | Q-DEM001-15 |
| Utilisation sans connexion | Q-DEM001-4 |

## 5. Acteurs et personas

| Acteur | Description | Statut |
|---|---|---|
| **Utilisateur** (persona « le commanditaire ») | Personne qui définit ses objectifs, ses tâches, son planning et sa capacité quotidienne, saisit son temps passé, reçoit les rappels et consulte les indicateurs. Utilise un smartphone et un PC. | Établi |
| **Google Calendar** (système externe) | Agenda de l'utilisateur. Porte les rappels quotidiens. Son rôle éventuel dans la planification est à préciser (Q-DEM001-15). | Établi pour les rappels |
| Autres utilisateurs | Existence à confirmer (Q-DEM001-2) | À préciser |

**Persona principal.** Le commanditaire, travailleur autonome sur ses propres objectifs. Il organise ses journées lui-même, alterne entre smartphone et PC, et utilise déjà Google Calendar. Il veut un pilotage chiffré : temps passé, reste à faire, vélocité.

## 6. Concepts métier et glossaire

Les définitions marquées *(provisoire)* dépendent des réponses aux questions ouvertes.

| Terme | Définition | Référence |
|---|---|---|
| **Objectif** | Résultat que l'utilisateur veut atteindre avant un délai donné. Il se décline en tâches. Sa condition d'atteinte et sa hiérarchie éventuelle sont à préciser. *(provisoire)* | RG-001, RG-002, Q-DEM001-5, Q-DEM001-6 |
| **Tâche** | Unité de travail concrète, dérivée d'un objectif, qui comporte un délai et un reste à faire. *(provisoire : rattachement obligatoire ou non à un objectif)* | RG-001, RG-003, Q-DEM001-6 |
| **Délai (échéance)** | Date à laquelle un objectif ou une tâche doit être atteint ou terminé. | RG-002, RG-003 |
| **Estimation** | Quantité de travail prévue pour réaliser une tâche, exprimée dans l'unité d'estimation. *(provisoire)* | Q-DEM001-9 |
| **Unité d'estimation** | Unité dans laquelle on exprime les estimations, le reste à faire et la capacité. *(à préciser : heures, jours ou points)* | Q-DEM001-9 |
| **Priorité** | Rang d'une tâche dans l'ordre de réalisation conseillé. Son mode de détermination est à préciser. | RG-005, Q-DEM001-16 |
| **Planification** | Affectation d'une tâche à une ou plusieurs journées, voire à des créneaux horaires. *(granularité à préciser)* | RG-006, Q-DEM001-13 |
| **Journée** | Jour calendaire de l'utilisateur, unité de référence pour la planification, le temps passé et les rappels. *(fuseau horaire de référence à préciser)* | Q-DEM001-10 |
| **Capacité quotidienne** | Temps que l'utilisateur prévoit de consacrer chaque jour à ses tâches. Il peut la ré-estimer. | RG-011, Q-DEM001-14 |
| **Temps passé** | Durée réellement consacrée à une tâche au cours d'une journée donnée. | RG-008, Q-DEM001-10 |
| **Reste à faire** | Quantité de travail restant pour terminer une tâche, exprimée dans l'unité d'estimation. *(mode de mise à jour à préciser)* | RG-009, Q-DEM001-11 |
| **Tâche terminée** | Tâche qui n'a plus de reste à faire ou que l'utilisateur a déclarée terminée. *(règle à préciser)* | Q-DEM001-7 |
| **Vélocité** | Mesure du rythme de travail réel de l'utilisateur, calculée à partir des temps passés enregistrés. *(formule et période à préciser)* | RG-010, Q-DEM001-12 |
| **Backlog** | Ensemble du travail restant à réaliser. *(périmètre et mesure à préciser : nombre de tâches ou somme des restes à faire)* | RG-015, Q-DEM001-20 |
| **Rappel du matin** | Message quotidien listant les tâches planifiées dans la journée. | RG-012 |
| **Rappel du soir** | Message quotidien listant, par tâche, le temps passé dans la journée et le reste à faire. | RG-013 |
| **Accès Google** | Autorisation donnée par l'utilisateur à l'application pour agir sur son agenda Google. L'utilisateur peut la retirer (révocation). | RG-014, Q-DEM001-19 |
| **Appareil** | Smartphone ou PC depuis lequel l'utilisateur utilise l'application. | RG-017 |
| **Conflit de modification** | Situation où une même donnée a été modifiée différemment sur deux appareils avant que ceux-ci n'aient échangé leurs modifications. | Q-DEM001-4 |

## 7. Règles de gestion

Statuts :
- **Établie** : la règle découle sans ambiguïté de la demande ;
- **À préciser** : le principe est établi, mais ses modalités dépendent d'une question ouverte.

| RG | Énoncé | Source | Statut | Questions liées | US |
|---|---|---|---|---|---|
| RG-001 | Un objectif se décline en tâches. Toute tâche dérivée d'un objectif est rattachée à cet objectif, et un objectif peut regrouper plusieurs tâches. | « objectifs dérivés en tâches » | Établie (hiérarchie et tâches sans objectif : à préciser) | Q-DEM001-6 | US-001, US-002, US-003 |
| RG-002 | Un objectif comporte un délai. | « tenir mes objectifs et leurs délais » | À préciser (caractère obligatoire) | Q-DEM001-5 | US-001, US-007 |
| RG-003 | Une tâche comporte un délai. | « les délais des tâches » | À préciser (caractère obligatoire, cohérence avec le délai de l'objectif) | Q-DEM001-5 | US-002, US-007 |
| RG-004 | L'utilisateur peut modifier à tout moment ses objectifs et les délais de ses tâches. | « ajuster mes objectifs et les délais des tâches » | Établie | Q-DEM001-17 (assistance à l'ajustement) | US-001, US-002, US-011 |
| RG-005 | L'application présente les tâches à réaliser dans un ordre de priorité. | « m'aider à prioriser les tâches à réaliser » | À préciser (règle de priorisation) | Q-DEM001-16 | US-004 |
| RG-006 | Une tâche peut être planifiée sur une journée. | « planifier mes tâches » ; « tâches plannifiées dans la journée » | À préciser (granularité, planification sur plusieurs jours, planification automatique) | Q-DEM001-13 | US-006, US-020 |
| RG-007 | L'application indique, pour chaque objectif et pour chaque tâche, si la planification permet de respecter son délai. | « vérifier que cela me permet de tenir mes objectifs et leurs délais » | À préciser (méthode de calcul, forme de l'alerte) | Q-DEM001-17 | US-007, US-011 |
| RG-008 | Le temps passé est enregistré par tâche et par journée. | « suivre le temps passé chaque jour sur chaque tâche » | À préciser (mode de saisie, rattachement à la journée) | Q-DEM001-10 | US-008 |
| RG-009 | Chaque tâche non terminée a un reste à faire. | « le reste à faire » | À préciser (unité, mode de mise à jour, lien avec la fin de la tâche) | Q-DEM001-7, Q-DEM001-9, Q-DEM001-11 | US-002, US-003, US-009 |
| RG-010 | La vélocité est calculée à partir des temps passés enregistrés. | « suivre le temps passé […] afin d'estimer ma vélocité » | À préciser (formule, période) | Q-DEM001-12 | US-010, US-011 |
| RG-011 | L'utilisateur définit le temps qu'il prévoit de consacrer chaque jour à ses tâches (capacité quotidienne) et peut le ré-estimer à tout moment. | « estimer le temps à consacrer pour ces tâches tous les jours afin de le ré-estimer si besoin » | À préciser (valeur unique ou par jour, jours non travaillés, prise en compte de l'agenda) | Q-DEM001-14, Q-DEM001-15 | US-005, US-006, US-019 |
| RG-012 | Chaque jour concerné, l'utilisateur reçoit le matin un rappel qui liste les tâches planifiées dans la journée. | « rappels quotidiens le matin pour lister les tâches plannifiées dans la journée » | À préciser (heure, jours concernés, forme, journée sans tâche) | Q-DEM001-18 | US-015 |
| RG-013 | Chaque jour concerné, l'utilisateur reçoit le soir un rappel qui liste, pour chaque tâche, le temps passé dans la journée et le reste à faire. | « le soir pour lister le temps passé sur chaque tâche et le resta à faire » | À préciser (heure, tâches listées, forme) | Q-DEM001-18 | US-016 |
| RG-014 | Les rappels quotidiens sont réalisés via Google Calendar. | « J'aurais aimé que ces rappels quotidiens soient réalisés via google calendar » | À préciser (impératif ou souhait, comportement sans accès Google ou après révocation) | Q-DEM001-18, Q-DEM001-19 | US-014, US-015, US-016 |
| RG-015 | L'utilisateur peut visualiser l'évolution de son backlog dans le temps. | « visualiser l'évolution du backlog » | À préciser (définition et mesure du backlog, période) | Q-DEM001-20 | US-012 |
| RG-016 | L'utilisateur peut visualiser l'évolution de sa vélocité dans le temps. | « visualiser l'évolution […] de la vélocité » | À préciser (période, dépend de la définition de la vélocité) | Q-DEM001-12, Q-DEM001-20 | US-013 |
| RG-017 | L'utilisateur accède aux mêmes données depuis son smartphone et depuis son PC. Une modification faite sur un appareil est retrouvée sur l'autre. | « sur mon smartphone et aussi sur un PC […] y accéder de ces 2 manières » | À préciser (sens de « décentralisées », hors ligne, conflits, délai de prise en compte) | Q-DEM001-3, Q-DEM001-4 | US-017, US-018 |

## 8. Exigences non fonctionnelles (côté métier)

| ENF | Exigence | Source | Statut | Questions liées |
|---|---|---|---|---|
| ENF-01 | L'application est utilisable sur smartphone et sur PC, avec un affichage adapté à chaque appareil. | DEM-001 | Établie | — |
| ENF-02 | Les données (objectifs, tâches, planification, temps passés, capacité) sont accessibles depuis les deux appareils, et les modifications faites sur l'un se retrouvent sur l'autre. | DEM-001 (« décentralisées ») | À préciser : sens de « décentralisées », délai acceptable de prise en compte | Q-DEM001-3 |
| ENF-03 | Les rappels quotidiens parviennent à l'utilisateur via Google Calendar, sur les appareils où il consulte son agenda. | DEM-001 | À préciser | Q-DEM001-18, Q-DEM001-19 |
| ENF-04 | Utilisation sans connexion réseau, et règle de résolution des conflits entre appareils. | Implicite (usage mobile) | À préciser : non exigé à ce stade | Q-DEM001-4 |
| ENF-05 | Confidentialité : les données de l'utilisateur ne sont accessibles qu'à lui. L'accès à son agenda Google se limite à ce qui est nécessaire aux fonctions demandées, et l'utilisateur peut le retirer à tout moment. | Implicite (données personnelles, accès à un compte Google) | Proposée, à confirmer | Q-DEM001-2, Q-DEM001-19 |

## 9. Traçabilité

- RG ↔ US : voir la colonne « US » de la section 7 et le fichier [`backlog-initial.md`](backlog-initial.md).
- RG ↔ questions : voir la colonne « Questions liées » de la section 7 et le fichier [`questions-ouvertes.md`](questions-ouvertes.md).
- RG ↔ scénarios de test : à établir en E5 (tags `@RG-xxx` dans `tests/features/`).
