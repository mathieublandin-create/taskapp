# Questions ouvertes au commanditaire — DEM-001 et DEM-002

> Version 0.1 du 2026-10-20 (Pepper, E1). Questions à transmettre au commanditaire via Jarvis.
>
> **Version 0.2 du 2026-10-20 (Pepper, fin de E1)** : les réponses aux questions 1 à 20 et les compléments du commanditaire sont reportés dans le [cahier des charges v0.2](cahier-des-charges.md). Les questions encore utiles sont regroupées en fin de document, dans la section « Questions résiduelles — v0.2 » (Q-DEM001-21 à Q-DEM001-40).
>
> Les thèmes sont présentés par ordre d'importance. Au sein de chaque thème, les questions sont elles aussi classées par importance.
>
> Priorités :
> - **P1** : bloque la rédaction des US du premier lot ;
> - **P2** : bloque des US ultérieures ;
> - **P3** : peut attendre.
>
> Pour chaque question à choix, indiquez la ou les lettres retenues, ou bien « autre » avec une précision.

## Synthèse

| Question | Thème | Priorité | US bloquées | État |
|---|---|---|---|---|
| Q-DEM001-1 | Cadrage | P1 | Constitution des lots (E2), toutes les US | Répondue |
| Q-DEM001-2 | Cadrage | P1 | US-017 | Répondue |
| Q-DEM001-3 | Accès multi-appareils | P1 | US-017, US-018 | Répondue |
| Q-DEM001-4 | Accès multi-appareils | P1 | US-018 | Répondue |
| Q-DEM001-5 | Objectifs et tâches | P1 | US-001, US-002, US-003, US-007 | Répondue |
| Q-DEM001-6 | Objectifs et tâches | P1 | US-001, US-002, US-004 | Répondue |
| Q-DEM001-7 | Objectifs et tâches | P2 | US-003, US-009 | Répondue |
| Q-DEM001-8 | Objectifs et tâches | P3 | US-021 | Répondue |
| Q-DEM001-9 | Estimation, temps, vélocité | P1 | US-002, US-005, US-006, US-008, US-009, US-010 | Répondue |
| Q-DEM001-10 | Estimation, temps, vélocité | P1 | US-008, US-016 | Répondue |
| Q-DEM001-11 | Estimation, temps, vélocité | P1 | US-003, US-009, US-012, US-016 | Répondue |
| Q-DEM001-12 | Estimation, temps, vélocité | P2 | US-010, US-011, US-013 | Répondue |
| Q-DEM001-13 | Planification, capacité, priorisation | P1 | US-006, US-007, US-015, US-020 | Répondue |
| Q-DEM001-14 | Planification, capacité, priorisation | P1 | US-005, US-006, US-019 | Répondue |
| Q-DEM001-15 | Planification, capacité, priorisation | P1 | US-019, US-020 | Répondue |
| Q-DEM001-16 | Planification, capacité, priorisation | P1 | US-004, US-006 | Répondue |
| Q-DEM001-17 | Planification, capacité, priorisation | P2 | US-007, US-011 | Répondue |
| Q-DEM001-18 | Rappels Google Calendar | P1 | US-014, US-015, US-016 | Répondue |
| Q-DEM001-19 | Rappels Google Calendar | P1 | US-014, US-015, US-016 | Répondue |
| Q-DEM001-20 | Visualisation | P2 | US-012, US-013 | Répondue |

---

## Thème 1 — Cadrage

### Q-DEM001-1 — Contenu de la première version (P1)
Parmi les capacités suivantes, lesquelles sont **indispensables dans la première version utilisable**, et lesquelles peuvent venir ensuite ?
- a) Créer des objectifs et les décliner en tâches
- b) Définir le temps à consacrer chaque jour à vos tâches (capacité quotidienne)
- c) Planifier vos tâches sur vos journées
- d) Saisir le temps passé et le reste à faire
- e) Rappels du matin et du soir via Google Calendar
- f) Contrôle « mon planning me permet-il de tenir mes délais ? »
- g) Priorisation des tâches
- h) Calcul de la vélocité et aide à l'ajustement des délais
- i) Graphiques d'évolution du backlog et de la vélocité
- j) Accès depuis le smartphone **et** depuis le PC dès la première version (sinon, lequel des deux en premier ?)

*Pourquoi* : cette réponse détermine la composition et l'ordre des lots.
*Bloque* : la constitution des lots (E2) pour toutes les US.

### Q-DEM001-2 — Nombre d'utilisateurs (P1)
Qui utilisera l'application ?
- a) Vous seul
- b) Plusieurs personnes, chacune avec ses propres données, sans partage
- c) Plusieurs personnes qui partagent des objectifs ou des tâches

*Pourquoi* : la réponse détermine s'il faut gérer plusieurs comptes, et éventuellement le partage et les droits. Elle confirme aussi l'exclusion proposée de l'usage collaboratif.
*Bloque* : US-017.

## Thème 2 — Accès multi-appareils et données

### Q-DEM001-3 — Sens de « données décentralisées » (P1)
Vous souhaitez que les données soient « décentralisées » pour y accéder depuis le smartphone et le PC. Quelle formulation correspond à votre attente ?
- a) Les données sont conservées en ligne par l'application, et je les retrouve sur mes deux appareils.
- b) Les données sont conservées dans **mon propre espace de stockage en ligne** (par exemple mon Google Drive), et l'application s'y connecte.
- c) Les données sont conservées **sur un serveur ou un ordinateur que je possède** (auto-hébergement).
- d) Les données restent sur mes appareils et s'échangent directement entre eux, sans service en ligne intermédiaire.
- e) Autre : précisez.

Question complémentaire : après une modification sur un appareil, au bout de combien de temps doit-elle être visible sur l'autre ? (quelques secondes / quelques minutes / à la prochaine ouverture de l'application)

*Pourquoi* : le mot « décentralisées » peut recouvrir des besoins très différents (propriété des données, absence de service tiers, simple accès multi-appareils). Chacun a des conséquences fortes sur le produit.
*Bloque* : US-017, US-018.

### Q-DEM001-4 — Utilisation sans connexion et conflits (P1)
1. Devez-vous pouvoir utiliser l'application **sans connexion réseau** ?
   - a) Non, une connexion est toujours disponible.
   - b) Oui, en consultation seulement.
   - c) Oui, en consultation et en saisie (temps passé, reste à faire, tâches…).

   Précisez sur quel appareil : smartphone, PC ou les deux.
2. Si vous répondez c) : une même tâche peut être modifiée différemment sur vos deux appareils avant qu'ils ne se soient mis à jour (par exemple, un reste à faire de 2 h sur le PC et de 3 h sur le smartphone). Que doit faire l'application ?
   - a) Conserver la modification la plus récente.
   - b) Vous montrer les deux versions et vous laisser choisir.
   - c) Pour le temps passé uniquement : additionner les saisies des deux appareils. Pour le reste, appliquer a) ou b).

*Pourquoi* : l'usage sur smartphone implique souvent des pertes de réseau. Une règle de conflit non définie peut conduire à une perte de données.
*Bloque* : US-018.

## Thème 3 — Objectifs et tâches

### Q-DEM001-5 — Délais et atteinte d'un objectif (P1)
1. Le délai d'un objectif est-il **obligatoire** ? (oui / non)
2. Le délai d'une tâche est-il **obligatoire** ? (oui / non)
3. Le délai d'une tâche peut-il être **postérieur** au délai de son objectif ?
   - a) Non, c'est interdit.
   - b) Oui, mais l'application m'alerte.
   - c) Oui, sans alerte.
4. Quand un objectif est-il **atteint** ?
   - a) Quand toutes ses tâches sont terminées.
   - b) Quand je le déclare atteint, quel que soit l'état de ses tâches.
   - c) Quand une valeur cible chiffrée propre à l'objectif est atteinte (par exemple « 10 articles publiés »).
   - d) Autre : précisez.

*Pourquoi* : le contrôle de tenue des délais et le suivi d'avancement des objectifs reposent sur ces règles.
*Bloque* : US-001, US-002, US-003, US-007.

### Q-DEM001-6 — Organisation entre objectifs et tâches (P1)
1. Quelle structure souhaitez-vous ?
   - a) Objectif puis tâches (deux niveaux seulement).
   - b) Objectif, sous-objectifs, puis tâches.
   - c) Objectif, tâches, puis sous-tâches.
   - d) b) et c) à la fois.
2. Une tâche peut-elle exister **sans objectif** (tâche isolée) ? (oui / non)
3. Une tâche peut-elle contribuer à **plusieurs objectifs** ? (oui / non)
4. Un objectif doit-il porter une **importance** ou une priorité propre, qui servirait à prioriser ses tâches ? (oui / non)

*Pourquoi* : la réponse définit la structure de base de l'application et intervient dans la priorisation.
*Bloque* : US-001, US-002, US-004.

### Q-DEM001-7 — Fin d'une tâche (P2)
1. Une tâche est terminée :
   - a) quand je la déclare terminée ;
   - b) automatiquement, quand son reste à faire atteint zéro ;
   - c) automatiquement à zéro, mais je peux aussi la déclarer terminée avant.
2. Une tâche terminée peut-elle être **rouverte** ? (oui / non)
3. Une tâche peut-elle être **abandonnée** (ni terminée ni à faire) ? Si oui, doit-elle sortir du backlog ? (oui / non)

*Pourquoi* : l'état « terminée » conditionne le backlog, l'atteinte des objectifs et les rappels.
*Bloque* : US-003, US-009.

### Q-DEM001-8 — Tâches récurrentes (P3)
Avez-vous des tâches qui se répètent (par exemple « 30 minutes de veille chaque jour » ou « bilan chaque vendredi ») ?
- a) Non, pas besoin.
- b) Oui, mais plus tard.
- c) Oui, dès la première version.

Si oui, quelles fréquences : tous les jours, certains jours de la semaine, une fois par mois, autre ?

*Pourquoi* : la demande n'en parle pas, mais ce besoin est fréquent et modifie la planification et les rappels.
*Bloque* : US-021 (conditionnelle).

## Thème 4 — Estimation, temps passé, vélocité

### Q-DEM001-9 — Unité d'estimation (P1)
Dans quelle unité voulez-vous estimer vos tâches, leur reste à faire et votre capacité quotidienne ?
- a) En heures et minutes. Précision minimale : 5 min, 15 min, 30 min ou autre ?
- b) En jours ou demi-journées.
- c) En points d'effort sans unité de temps. Dans ce cas, la capacité quotidienne serait exprimée en points, alors que le temps passé, lui, reste mesuré en heures.

*Pourquoi* : tous les calculs (capacité, reste à faire, contrôle des délais, vélocité) dépendent de cette unité.
*Bloque* : US-002, US-005, US-006, US-008, US-009, US-010.

### Q-DEM001-10 — Saisie du temps passé (P1)
1. Comment voulez-vous enregistrer le temps passé ?
   - a) Avec un chronomètre que je démarre et j'arrête sur une tâche.
   - b) En saisissant une durée par tâche et par jour.
   - c) Les deux.
2. Puis-je saisir ou corriger le temps passé d'un **jour antérieur** ?
   - a) Non.
   - b) Oui, sans limite.
   - c) Oui, jusqu'à N jours en arrière (précisez N).
3. Si vous répondez a) ou c) à la première question : un chronomètre démarré avant minuit et arrêté après minuit est rattaché :
   - a) au jour de démarrage ;
   - b) à chacun des deux jours, au prorata.
4. Si vous changez de fuseau horaire (voyage), quelle heure détermine « la journée » ?
   - a) L'heure locale de l'appareil.
   - b) Un fuseau de référence fixe, que je choisis.

*Pourquoi* : le temps passé alimente le rappel du soir, le reste à faire et la vélocité. Son rattachement à une journée doit donc être sans ambiguïté.
*Bloque* : US-008, US-016.

### Q-DEM001-11 — Mise à jour du reste à faire (P1)
Comment le reste à faire d'une tâche est-il mis à jour ?
- a) Automatiquement : estimation initiale moins temps passé cumulé.
- b) Je le ressaisis moi-même (ré-estimation), par exemple chaque soir.
- c) Calcul automatique comme en a), mais je peux le corriger à tout moment.

Si le temps passé dépasse l'estimation sans que la tâche soit terminée, que doit afficher l'application ?
- a) Un reste à faire de zéro.
- b) Une alerte qui me demande de ré-estimer.

*Pourquoi* : le reste à faire figure dans le rappel du soir. Il est aussi la base du backlog et du contrôle des délais.
*Bloque* : US-003, US-009, US-012, US-016.

### Q-DEM001-12 — Définition de la vélocité (P2)
Que doit mesurer la « vélocité » pour vous ?
- a) Le temps réellement travaillé sur mes tâches par jour (par exemple « en moyenne 3 h 10 par jour »).
- b) La quantité de reste à faire réellement consommée par jour (par exemple « je réduis mon backlog de 2 h 30 d'estimation par jour »).
- c) Le rapport entre le temps estimé et le temps réellement passé sur les tâches terminées (par exemple « mes tâches me prennent 1,3 fois le temps prévu »).
- d) Le nombre de tâches terminées par jour ou par semaine.
- e) Plusieurs de ces indicateurs : précisez lesquels.

Sur quelle période la calculer ?
- a) Par jour.
- b) Par semaine.
- c) En moyenne sur les N derniers jours (précisez N).

Les jours sans aucune saisie entrent-ils dans le calcul ? (oui / non)

*Pourquoi* : le terme recouvre plusieurs mesures possibles. Le calcul de l'ajustement des délais et le graphique d'évolution en dépendent.
*Bloque* : US-010, US-011, US-013.

## Thème 5 — Planification, capacité et priorisation

### Q-DEM001-13 — Forme de la planification (P1)
1. Planifier une tâche, c'est :
   - a) la placer sur une journée, sans horaire ;
   - b) la placer sur un créneau horaire précis (par exemple mardi de 9 h à 11 h) ;
   - c) répartir sa durée sur plusieurs journées (par exemple 2 h lundi et 1 h mardi).
2. Qui construit le planning ?
   - a) Moi, manuellement.
   - b) L'application, qui me propose un planning selon la priorité, les délais et ma capacité, et que je peux modifier.
   - c) L'application, automatiquement.
3. Une tâche planifiée un jour passé et non terminée est-elle reportée automatiquement au jour suivant ? (oui / non / l'application me le propose)

*Pourquoi* : le rappel du matin, le contrôle de tenue des délais et un éventuel lien avec l'agenda dépendent de cette réponse.
*Bloque* : US-006, US-007, US-015, US-020.

### Q-DEM001-14 — Capacité quotidienne (P1)
1. Le temps à consacrer chaque jour aux tâches est :
   - a) une seule valeur, identique pour tous les jours ;
   - b) une valeur par jour de la semaine (par exemple 4 h du lundi au vendredi, 0 h le week-end) ;
   - c) b), avec en plus des exceptions à une date précise (congés, journée chargée).
2. La ré-estimation de cette capacité est :
   - a) manuelle uniquement ;
   - b) proposée par l'application à partir du temps réellement passé, puis validée par moi.
3. Quand je planifie plus de travail qu'un jour ne le permet, l'application doit :
   - a) l'interdire ;
   - b) m'alerter, sans bloquer.

*Pourquoi* : la capacité est la base de la planification et du contrôle des délais.
*Bloque* : US-005, US-006, US-019.

### Q-DEM001-15 — Lien entre planification et agenda Google (P1)
1. Les événements déjà présents dans votre Google Calendar (réunions, rendez-vous) doivent-ils **réduire automatiquement** le temps disponible du jour pour vos tâches ? (oui / non)
2. Les tâches planifiées doivent-elles **apparaître comme des créneaux** dans votre Google Calendar ? (oui / non)
   - Si oui : quand je modifie ou déplace ce créneau directement dans Google Calendar, l'application doit-elle **en tenir compte** (replanification de la tâche) ? (oui / non)
   - Si oui : dans votre agenda principal, ou dans un agenda dédié à l'application ?

*Pourquoi* : la demande cite Google Calendar pour les rappels seulement. Toute autre interaction avec l'agenda élargit fortement le périmètre et introduit des risques de conflit entre l'application et l'agenda. Elle doit donc être explicitement demandée.
*Bloque* : US-019 et US-020 (conditionnelles).

### Q-DEM001-16 — Règle de priorisation (P1)
Comment l'ordre de priorité des tâches doit-il être déterminé ?
- a) Manuellement : je classe mes tâches moi-même, par glisser-déposer ou par niveau (haute, moyenne, basse).
- b) Automatiquement, à partir de critères. Lesquels, et dans quel ordre d'importance : proximité du délai, importance de l'objectif, retard, taille du reste à faire, autre ?
- c) L'application propose un ordre automatique, que je peux modifier manuellement.

En cas d'égalité, quel critère départage deux tâches ?

*Pourquoi* : c'est l'un des buts premiers de la demande (« m'aider à prioriser »). Aucune règle n'y est donnée.
*Bloque* : US-004, US-006.

### Q-DEM001-17 — Contrôle de tenue des délais et ajustement (P2)
1. Comment l'application doit-elle juger qu'un délai « ne tient pas » ?
   - a) Le reste à faire de la tâche ou de l'objectif dépasse le temps planifié avant son délai.
   - b) Le reste à faire dépasse ce que ma vélocité réelle permet de réaliser avant le délai.
   - c) Les deux, affichés séparément.
2. Quand un délai ne tient pas, l'application :
   - a) m'alerte seulement, et j'ajuste moi-même ;
   - b) me propose un nouveau délai ou un nouveau planning, que j'accepte ou que je refuse ;
   - c) ajuste automatiquement.
3. Où voulez-vous voir ces alertes : dans l'application seulement, ou aussi dans le rappel du matin ou du soir ?

*Pourquoi* : la demande parle de « vérifier » et d'« ajuster » sans dire qui décide. Une modification automatique de vos délais aurait un impact fort.
*Bloque* : US-007, US-011.

## Thème 6 — Rappels via Google Calendar

### Q-DEM001-18 — Forme, horaires et contenu des rappels (P1)
1. **Horaires** : à quelle heure le rappel du matin, et à quelle heure celui du soir ? Ces horaires sont-ils modifiables par vous dans l'application ? (oui / non)
2. **Jours** : les rappels sont-ils envoyés :
   - a) tous les jours ;
   - b) seulement les jours où ma capacité est supérieure à zéro ;
   - c) seulement du lundi au vendredi ?
3. **Forme dans Google Calendar** :
   - a) un événement court dans mon agenda principal, dont la description contient la liste, avec une notification Google à l'heure du rappel ;
   - b) la même chose, mais dans un agenda dédié à l'application, que je peux afficher ou masquer ;
   - c) autre : précisez.
4. **Mise à jour** : si je modifie mon planning après l'heure du rappel du matin, le contenu de l'événement du jour doit-il être mis à jour ? (oui / non)
5. **Rappel du soir** : il liste le temps passé et le reste à faire. Doit-il porter sur :
   - a) les tâches planifiées dans la journée ;
   - b) les tâches sur lesquelles j'ai saisi du temps ;
   - c) les deux ?

   S'il est généré avant que j'aie saisi mon temps, doit-il surtout m'**inviter à saisir** (avec un lien vers l'application) ? (oui / non)
6. **Journée sans tâche planifiée** : faut-il quand même envoyer un rappel du matin, avec un message du type « aucune tâche planifiée » ? (oui / non)

*Pourquoi* : un rappel Google Calendar est un événement d'agenda. Sa forme, son moment et sa mise à jour doivent être définis pour être testables.
*Bloque* : US-014, US-015, US-016.

### Q-DEM001-19 — Caractère obligatoire de Google Calendar et révocation de l'accès (P1)
1. Vous écrivez « J'aurais aimé » que les rappels passent par Google Calendar. Est-ce :
   - a) impératif ;
   - b) souhaité, mais une notification de l'application elle-même serait acceptable ?
2. L'application doit-elle rester **utilisable sans compte Google connecté** (sans les rappels) ? (oui / non)
3. Si vous retirez à l'application l'accès à votre agenda Google, ou si cet accès expire, que doit-il se passer ?
   - a) L'application m'avertit au prochain usage et me propose de reconnecter l'agenda.
   - b) Les événements de rappel déjà créés dans mon agenda sont supprimés.
   - c) Les événements de rappel déjà créés sont conservés.

   Choisissez a) et l'une des options b) ou c).

*Pourquoi* : la formulation « j'aurais aimé » laisse un doute sur le niveau d'exigence. La perte d'accès à Google doit avoir un comportement défini, sans perte de vos données.
*Bloque* : US-014, US-015, US-016.

## Thème 7 — Visualisation

### Q-DEM001-20 — Évolution du backlog et de la vélocité (P2)
1. Le **backlog** est, pour vous :
   - a) l'ensemble des tâches non terminées, planifiées ou non ;
   - b) seulement les tâches non terminées qui ne sont pas encore planifiées ;
   - c) autre : précisez.
2. Son évolution se mesure :
   - a) en nombre de tâches restantes ;
   - b) en somme des restes à faire ;
   - c) les deux.
3. Doit-on pouvoir afficher ces évolutions **par objectif**, en plus de la vue globale ? (oui / non)
4. Sur quelle période et avec quel pas ?
   - a) Les 30 derniers jours, jour par jour.
   - b) Les 12 dernières semaines, semaine par semaine.
   - c) Période librement choisie.

*Pourquoi* : sans définition du backlog ni de sa mesure, le graphique demandé ne peut pas être spécifié.
*Bloque* : US-012, US-013.

---

## Réponses du commanditaire
*(à compléter par Jarvis à réception ; chaque réponse sera ensuite reportée par Pepper dans le cahier des charges et dans les US)*

| Question | Date | Réponse | Impact (RG / US) |
|---|---|---|---|
| Q-DEM001-1 | 2026-10-20 | a) seul indispensable en 1re version (objectifs et tâches). j) non répondu. | Q1 a) : LOT-001 limité aux objectifs et tâches, avec le socle transverse. j) : tranché par le complément (smartphone et PC) → RG-017, ENF-01. |
| Q-DEM001-2 | 2026-10-20 | a) moi seul. | RG-018 ; exclusion de l'usage collaboratif décidée (CdC §4.3). |
| Q-DEM001-3 | 2026-10-20 | b) dans mon propre espace de stockage en ligne (ex. Google Drive). Délai de propagation : non répondu. | RG-020, ENF-02 ; délai : voir le complément ; interprétation à confirmer en Q-DEM001-21 ; service de stockage : Q-DEM001-22. |
| Q-DEM001-4 | 2026-10-20 | 1. c) consultation et saisie hors ligne (appareil : non précisé). 2. règle de conflit : non répondu. | RG-021, ENF-04 ; appareil et règle de conflit : voir le complément → RG-036 ; restent Q-DEM001-23 et Q-DEM001-39. |
| Q-DEM001-5 | 2026-10-20 | 5.1 non · 5.2 oui · 5.3 b) oui avec alerte · 5.4 a) quand toutes ses tâches sont terminées. | RG-002, RG-003, RG-024, RG-025 ; Q-DEM001-26 et Q-DEM001-28. |
| Q-DEM001-6 | 2026-10-20 | 6.1 d) sous-objectifs et sous-tâches · 6.2 oui · 6.3 oui · 6.4 oui. | RG-001, RG-022, RG-023, RG-030 ; nouvelles US-023, US-024, US-030 ; Q-DEM001-24, 25, 26 et 35. |
| Q-DEM001-7 | 2026-10-20 | 7.1 a) je la déclare terminée · 7.2 oui · 7.3 oui (sortie du backlog : non précisé). | RG-026, RG-027 ; nouvelle US-025 ; sortie du backlog : Q-DEM001-27. |
| Q-DEM001-8 | 2026-10-20 | b) oui, mais plus tard (fréquences non précisées). | US-021 reportée (CdC §4.2) ; fréquences non reposées. |
| Q-DEM001-9 | 2026-10-20 | a) heures et minutes, précision 30 min. | RG-028 ; précision du temps passé : Q-DEM001-31. |
| Q-DEM001-10 | 2026-10-20 | 10.1 b) saisie d'une durée par tâche et par jour · 10.2 b) oui sans limite · 10.3 a) jour de démarrage · 10.4 a) heure locale de l'appareil. | RG-008 ; chronomètre exclu ; 10.3 sans objet. |
| Q-DEM001-11 | 2026-10-20 | 11.1 c) calcul automatique corrigeable · 11.2 b) alerte demandant de ré-estimer. | RG-009 ; Q-DEM001-31. |
| Q-DEM001-12 | 2026-10-20 | 12.1 réponse libre : « la somme des temps originaux estimés des tâches terminées » · 12.2 b) par semaine · 12.3 oui. | RG-010, RG-029 ; tension avec Q11 et Q17 : Q-DEM001-30. |
| Q-DEM001-13 | 2026-10-20 | 13.1 a) sur une journée, sans horaire · 13.2 b) l'application propose, je modifie · 13.3 report automatique. | RG-006, RG-031, RG-032 ; nouvelles US-027, US-028 ; tension avec Q15.2 tranchée par le complément (horaire suggéré). |
| Q-DEM001-14 | 2026-10-20 | 14.1 c) valeur par jour de semaine + exceptions datées · 14.2 b) proposée par l'application, validée par moi · 14.3 b) alerte sans blocage. | RG-011 ; nouvelle US-026. |
| Q-DEM001-15 | 2026-10-20 | 15.1 oui · 15.2 oui (sous-questions : prise en compte d'un déplacement dans Google et agenda principal/dédié : non répondu). | RG-033, RG-034, RG-037 ; US-019 et US-020 confirmées ; nouvelle US-032 ; sous-questions tranchées par les compléments ; restent Q-DEM001-32, 33 et 34. |
| Q-DEM001-16 | 2026-10-20 | c) ordre proposé automatiquement, modifiable (critères et départage : non répondu). | RG-005 ; critères et départage : Q-DEM001-35. |
| Q-DEM001-17 | 2026-10-20 | 17.1 b) selon la vélocité réelle · 17.2 b) proposition acceptée ou refusée · 17.3 dans l'application et dans les rappels. | RG-007 ; Q-DEM001-30. |
| Q-DEM001-18 | 2026-10-20 | 18.1 8 h et 21 h, modifiables par moi · 18.2 a) tous les jours · 18.3 a) événement dans l'agenda principal · 18.4 non · 18.5 c) les deux (invitation à saisir : non répondu) · 18.6 oui. | RG-012, RG-013, RG-014 ; nouvelle US-029 ; Q-DEM001-37 et Q-DEM001-40. |
| Q-DEM001-19 | 2026-10-20 | 19.1 b) souhaité, notification de l'application acceptable · 19.2 non · 19.3 c) événements conservés (a implicite). | RG-019, RG-035, nouvelle US-022 ; US-014 recentrée sur l'agenda ; Q-DEM001-22 et Q-DEM001-38. |
| Q-DEM001-20 | 2026-10-20 | 20.1 b) tâches non terminées et non planifiées · 20.2 b) somme des restes à faire · 20.3 oui · 20.4 b) 12 dernières semaines, par semaine. | RG-015, RG-016 ; Q-DEM001-36. |
| Q-DEM001-1 j), 3, 4, 13/15 — complément | 2026-10-20 | Complément, verbatim : « je veux que l'application soit utilisable sur mon smartphone et un PC, je veux que la notification apparaisse dans l'heure qui suit, l'usage prioritaire est celui du smartphone si il y a une modification sur les 2, prendre la modification la plus récente. On place les créneaux dans google calendar. On part dans un premier temps sur un horaire suggéré. ok pour demander son avis à starck ». | Q1 j) : smartphone et PC dès la première version (RG-017, ENF-01). Q3 : délai d'une heure (RG-017, ENF-02 ; interprétation à confirmer en Q-DEM001-21). Q4 : smartphone prioritaire pour le hors ligne (RG-021) ; conflit : la modification la plus récente l'emporte (RG-036). Q13.1/Q15.2 : tension tranchée, la tâche est planifiée sur une journée et l'application lui suggère un horaire, qui donne le créneau (RG-034). Avis de Starck accepté (LOT-001). |
| Q-DEM001-15.2 (sous-questions) — complément | 2026-10-20 | Complément, verbatim : « les créneaux vont dans mon agenda principal oui si le créneau est déplacé dans calendar, il faut une notification dans l'application et une replanification le soir ». | Créneaux dans l'agenda principal (RG-034). Un créneau déplacé dans Google Calendar est pris en compte : notification dans l'application et replanification le soir (RG-037, US-032). |
| Q-DEM001-15.2 (replanification du soir) — complément | 2026-10-20 | Complément, confirmation : la replanification du soir qui suit le déplacement d'un créneau dans Google Calendar est proposée par l'application, puis validée ou modifiée par le commanditaire. Elle n'est pas automatique. | RG-037 (cohérent avec RG-031 et Q-DEM001-13.2 b). |
| Q-DEM001-21 à 29 (réponses brutes) | 2026-10-20 | Verbatim : « 21.1 : 1h, 21.2 : oui, 22.1 : oui, 22.2 : oui, 22.3 : non, 22.4 : oui, 23.1 : oui, 23.2 : oui, 24.1 à 24.4 : oui, 25.1 à 25.7 : oui, 26.1 à 26.4 : oui, 27.1 à 27.3 : oui, 28.1 à 28.5 : oui, 29.1 à 29.4 : oui ». Lecture de Jarvis : « oui » = option recommandée par Pepper ; « non » à 22.3 = option b). | À reporter par Pepper |
| Q-DEM001-21 | 2026-10-20 | 21.1 « 1h » (lecture : délai d'une heure pour qu'une modification soit visible sur l'autre appareil, option a) · 21.2 oui (affichage immédiat à l'ouverture). | À reporter par Pepper |
| Q-DEM001-22 | 2026-10-20 | 22.1 a) Drive du même compte · 22.2 c) perte d'accès = coupure réseau · **22.3 b) non : les données restent sur l'appareil à la déconnexion** · 22.4 a) alerte et proposition de restauration. | À reporter par Pepper |
| Q-DEM001-23 | 2026-10-20 | 23.1 a) information par information · 23.2 oui, information de la valeur écartée. | À reporter par Pepper |
| Q-DEM001-24 à 29 | 2026-10-20 | Toutes les options recommandées sont retenues (24.1–24.4, 25.1–25.7, 26.1–26.4, 27.1–27.3, 28.1–28.5, 29.1–29.4). | À reporter par Pepper |

---

## Questions résiduelles — v0.2

> Rédigées par Pepper le 2026-10-20 (fin de E1), après intégration des réponses aux questions 1 à 20 et des trois compléments du commanditaire.
>
> Cette section contient uniquement :
> - les sous-questions restées sans réponse et encore utiles ;
> - les tensions ou contradictions détectées entre les réponses.
>
> **Questions non reposées** :
> - celles qui ont été tranchées par les compléments : appareils de la première version, appareil prioritaire pour le hors ligne, règle de conflit, créneaux et horaire suggéré, agenda principal, replanification proposée après un déplacement de créneau ;
> - Q-DEM001-8 (fréquences des récurrences) : les récurrences sont reportées ;
> - Q-DEM001-10.3 : sans objet, le chronomètre n'étant pas retenu.
>
> Priorités :
> - **P1** : bloque le lot 1 (LOT-001) ;
> - **P2** : bloque des lots ultérieurs ;
> - **P3** : peut attendre.
>
> Pour chaque question, indiquez la lettre retenue, « oui » ou « non », ou bien « autre » avec une précision. L'option recommandée est signalée par **(recommandé)**.
>
> Les validations attendues en dehors de ces questions sont rappelées au §11 du cahier des charges : reformulation du besoin, exclusions proposées, ENF-05 et ENF-06.

### Synthèse des questions résiduelles

| Question | Objet | Origine | Priorité | US bloquées | État |
|---|---|---|---|---|---|
| Q-DEM001-21 | Sens de « dans l'heure qui suit » | Complément (Q3), formulation ambiguë | P1 | US-017 | Ouverte |
| Q-DEM001-22 | Compte Google, espace de stockage et perte d'accès | Tension Q3 b) / Q19.2 / Q19.3 / Q4 c) | P1 | US-022, US-017 | Ouverte |
| Q-DEM001-23 | Granularité de la règle « la plus récente l'emporte » | Complément (Q4.2) | P1 | US-017, US-018 | Ouverte |
| Q-DEM001-24 | Sous-objectifs | Conséquences de Q6.1 d) et Q5.3 | P1 | US-023, US-001 | Ouverte |
| Q-DEM001-25 | Sous-tâches | Tension Q6.1 d) / Q7.1 a) / Q12.1 / Q5.2 | P1 | US-024, US-002, US-003 | Ouverte |
| Q-DEM001-26 | Atteinte d'un objectif | Tension Q5.4 a) / Q6.1 d) / Q6.3 / Q7.3 | P1 | US-003, US-001, US-023, US-025 | Ouverte |
| Q-DEM001-27 | Tâche abandonnée | Q7.3 partielle | P1 (points 1 et 2), P2 (point 3) | US-025, US-012 | Ouverte |
| Q-DEM001-28 | Délai et estimation d'une tâche | Conséquences de Q5.1, Q5.2, Q9 et tension Q12.1 | P1 | US-002, US-001, US-024 | Ouverte |
| Q-DEM001-29 | Suppression d'un objectif ou d'une tâche | Conséquences de Q6.1 d), Q6.2, Q6.3 | P1 | US-001, US-002, US-023, US-024 | Ouverte |
| Q-DEM001-30 | Vélocité, reste à faire et contrôle des délais | Tension Q12.1 / Q11.1 c) / Q17.1 b) | P2 | US-007, US-010, US-011, US-013 | Ouverte |
| Q-DEM001-31 | Reste à faire après correction, temps passé | Tension Q11.1 c) / Q11.2 b) / Q9 / RG-036 | P2 | US-008, US-009, US-016 | Ouverte |
| Q-DEM001-32 | Horaire suggéré et planification à la journée | Compléments (Q13/Q15) et tension Q13.1 a) / Q13.3 / Q14 | P2 | US-020, US-006, US-027, US-028 | Ouverte |
| Q-DEM001-33 | Créneau déplacé dans Google Calendar | Compléments (Q15.2) | P2 | US-032 | Ouverte |
| Q-DEM001-34 | Événements de l'agenda et capacité | Tension Q15.1 / Q14.1 / RG-034 | P2 | US-019 | Ouverte |
| Q-DEM001-35 | Critères de l'ordre de priorité | Q16 partielle, tension Q6.3 / Q6.4 | P2 | US-004, US-030, US-027 | Ouverte |
| Q-DEM001-36 | Définition du backlog et planification | Tension Q20.1 b) / Q13.2 b) / Q13.3 | P2 | US-012, US-027 | Ouverte |
| Q-DEM001-37 | Fuseau horaire des rappels et des créneaux | Tension Q10.4 a) / Q18.1 | P2 | US-015, US-016, US-020, US-029 | Ouverte |
| Q-DEM001-38 | Rôle de la notification de l'application | Tension Q19.1 b) / Q18.3 a) | P2 | US-014, US-015, US-016 | Ouverte |
| Q-DEM001-39 | Usage hors ligne sur le PC | Q4.1 partielle (smartphone prioritaire) | P2 | US-031 | Ouverte |
| Q-DEM001-40 | Rappel du soir : invitation à saisir | Q18.5 partielle | P3 | US-016 | Ouverte |

### Q-DEM001-21 — Sens de « la notification apparaisse dans l'heure qui suit » (P1)
*Origine* : votre complément du 2026-10-20 sur le délai de prise en compte entre appareils (Q-DEM001-3). Le mot « notification » laisse un doute, car un autre complément parle d'une notification de l'application quand un créneau est déplacé dans Google Calendar.

1. Ce délai d'une heure porte sur :
   - a) le temps maximal pour qu'une modification faite sur un appareil connecté soit visible sur l'autre appareil connecté ;
   - b) le temps maximal pour que la notification d'un créneau déplacé dans Google Calendar apparaisse dans l'application ;
   - c) les deux.
2. Quel que soit votre choix au point 1 : quand vous ouvrez l'application sur un appareil connecté, doit-elle afficher **immédiatement** les dernières modifications faites sur l'autre appareil, sans attendre ce délai ? (oui / non)
   - **Recommandé : oui.** Le cas le plus courant est le passage du PC au smartphone. Un délai d'une heure à l'ouverture vous ferait travailler sur des données périmées et multiplierait les conflits.

*Bloque* : US-017 (critères d'acceptation sur le délai).

### Q-DEM001-22 — Compte Google, espace de stockage et perte d'accès (P1)
*Origine* : tension entre Q3 b), Q19.2, Q19.3 et Q4 c). Vos réponses sont cohérentes : un compte Google est obligatoire, et vos données sont dans votre propre espace en ligne. Elles ont toutefois une conséquence : l'accès Google ne sert plus seulement aux rappels, il conditionne l'accès à vos données. Or votre réponse Q19.3 ne portait que sur les événements d'agenda.

1. Votre espace de stockage est-il le **Google Drive du compte Google** avec lequel vous vous connectez à l'application ?
   - a) oui **(recommandé : un seul compte et une seule autorisation à gérer, ce qui est cohérent avec la connexion Google obligatoire)** ;
   - b) non, un autre service : précisez lequel. Une seconde connexion sera alors à gérer.
2. Si l'accès à votre compte Google est retiré ou expire, que fait l'application en attendant que vous vous reconnectiez ?
   - a) Elle bloque tout accès à vos données jusqu'à la reconnexion. Les modifications pas encore enregistrées dans votre espace sont conservées sur l'appareil et enregistrées après la reconnexion.
   - b) Elle permet de consulter les données présentes sur l'appareil, mais pas d'en saisir, jusqu'à la reconnexion. Même garantie de conservation qu'en a).
   - c) Elle permet de consulter et de saisir, comme sans réseau. L'enregistrement dans votre espace reprend après la reconnexion. **(recommandé : pour vous, la perte d'accès se comporte comme une coupure de réseau, sans blocage ni perte ; c'est cohérent avec l'usage hors ligne en saisie, Q4 c)**
3. Quand vous vous déconnectez volontairement sur un appareil, les données présentes sur cet appareil sont-elles effacées ?
   - a) Oui, après l'enregistrement dans votre espace des modifications en attente. Si certaines modifications ne peuvent pas être enregistrées (pas de réseau), l'application vous avertit et vous demande confirmation avant de les perdre. **(recommandé : protège vos données en cas de prêt, de perte ou de vol de l'appareil)**
   - b) Non, elles restent sur l'appareil.
4. Si les données de l'application sont supprimées ou modifiées directement dans votre espace de stockage, en dehors de l'application :
   - a) l'application vous avertit et vous propose de les restaurer à partir de la copie présente sur l'appareil **(recommandé, sous réserve de l'avis de Starck sur la faisabilité)** ;
   - b) l'application considère que la suppression est volontaire et repart d'un espace vide ;
   - c) autre : précisez.

*Bloque* : US-022, US-017.

### Q-DEM001-23 — Granularité de la règle « la modification la plus récente l'emporte » (P1)
*Origine* : votre complément sur Q4.2. La règle est acquise. Reste à préciser à quel niveau elle s'applique.

*Exemple* : sur le PC, vous modifiez l'intitulé d'une tâche ; sur le smartphone, hors ligne, vous modifiez ensuite son délai.

1. Que conserve l'application ?
   - a) Information par information : le nouvel intitulé et le nouveau délai sont conservés tous les deux. La règle « la plus récente l'emporte » ne s'applique que lorsque la **même information** a été modifiée sur les deux appareils. **(recommandé : aucune modification n'est perdue sans nécessité)**
   - b) Élément par élément : la version la plus récente de la tâche entière remplace l'autre, et le nouvel intitulé saisi sur le PC est perdu.
2. Quand une de vos modifications est écartée par cette règle, l'application doit-elle vous en informer, en indiquant la valeur écartée ? (oui / non)
   - **Recommandé : oui**, conformément à ENF-06 (aucune donnée ne disparaît sans que vous en soyez informé).

*Bloque* : US-017 et US-018.

### Q-DEM001-24 — Sous-objectifs (P1)
*Origine* : conséquences de Q6.1 d) et de Q5.3 b).

1. Combien de niveaux de sous-objectifs ?
   - a) Un seul niveau : objectif, puis sous-objectifs **(recommandé : reste lisible sur smartphone, votre usage prioritaire, et peut être étendu plus tard)** ;
   - b) plusieurs niveaux, N au maximum : précisez N ;
   - c) sans limite.
2. Un sous-objectif n'a-t-il qu'un seul objectif parent ? (oui / non)
   - **Recommandé : oui.** Une tâche peut déjà contribuer à plusieurs objectifs (Q6.3), ce qui couvre les besoins de rattachement multiple.
3. Le délai d'un sous-objectif peut-il être postérieur à celui de son objectif parent ?
   - a) non, c'est interdit ;
   - b) oui, avec une alerte **(recommandé : c'est la règle que vous avez choisie pour les tâches, en Q5.3 b)** ;
   - c) oui, sans alerte.
4. Un sous-objectif peut-il être déplacé sous un autre objectif, ou devenir un objectif principal ? (oui / non)
   - **Recommandé : oui**, pour pouvoir réorganiser vos objectifs sans tout ressaisir.

*Bloque* : US-023, US-001.

### Q-DEM001-25 — Sous-tâches (P1)
*Origine* : tension entre Q6.1 d), Q7.1 a), Q12.1 et Q5.2. La vélocité est la somme des estimations initiales des tâches terminées (Q12.1). Si une tâche et ses sous-tâches portent chacune une estimation, le même travail risque d'être compté deux fois.

1. Combien de niveaux de sous-tâches ?
   - a) Un seul niveau : tâche, puis sous-tâches **(recommandé, pour la même raison qu'en Q-DEM001-24)** ;
   - b) plusieurs niveaux, N au maximum : précisez N ;
   - c) sans limite.
2. Une sous-tâche a-t-elle, comme toute tâche, un délai obligatoire et sa propre estimation ?
   - a) oui **(recommandé : c'est la sous-tâche qui est réalisée, planifiée et suivie)** ;
   - b) non : le délai et l'estimation ne sont portés que par la tâche parente.
3. Quelle est l'estimation d'une tâche qui a des sous-tâches ?
   - a) La somme des estimations de ses sous-tâches, calculée et non saisie. Dans la vélocité, seules comptent les tâches qui n'ont pas de sous-tâches. **(recommandé : le même travail ne peut pas être compté deux fois)**
   - b) Une estimation saisie à part, qui s'ajoute à celles des sous-tâches.
   - c) Autre : précisez.
4. Le délai d'une sous-tâche peut-il être postérieur au délai de sa tâche parente ?
   - a) non, c'est interdit ;
   - b) oui, avec une alerte **(recommandé, par cohérence avec Q5.3 b)** ;
   - c) oui, sans alerte.
5. À quels objectifs une sous-tâche est-elle rattachée ?
   - a) aux objectifs de sa tâche parente, sans pouvoir en changer **(recommandé : évite qu'une tâche soit à moitié rattachée à un objectif)** ;
   - b) elle peut aussi être rattachée à d'autres objectifs.
6. Peut-on déclarer terminée une tâche dont certaines sous-tâches ne le sont pas ?
   - a) non, tant qu'il reste une sous-tâche ni terminée ni abandonnée **(recommandé : l'état de la tâche reste fidèle au travail réel)** ;
   - b) oui, et ses sous-tâches sont alors terminées aussi ;
   - c) oui, et ses sous-tâches restent à faire.
7. Quand toutes les sous-tâches sont terminées, la tâche parente :
   - a) reste à faire jusqu'à ce que vous la déclariez terminée **(recommandé : c'est cohérent avec Q7.1 a, une tâche n'est terminée que sur votre déclaration)** ;
   - b) est terminée automatiquement.

*Bloque* : US-024, US-002, US-003 ; plus tard US-010.

### Q-DEM001-26 — Atteinte d'un objectif (P1)
*Origine* : tension entre Q5.4 a) (objectif atteint quand toutes ses tâches sont terminées), Q6.1 d) (sous-objectifs), Q6.3 (une tâche pour plusieurs objectifs) et Q7.3 (abandon).

1. Un objectif qui a des sous-objectifs est atteint quand :
   - a) toutes ses tâches propres sont terminées **et** tous ses sous-objectifs sont atteints **(recommandé)** ;
   - b) seules ses tâches propres sont terminées, quel que soit l'état de ses sous-objectifs.
2. Comment comptent les tâches abandonnées ?
   - a) Elles sont ignorées : l'objectif est atteint quand toutes ses tâches non abandonnées sont terminées **(recommandé : sinon, un objectif qui contient une tâche abandonnée ne pourrait jamais être atteint)** ;
   - b) un objectif qui contient une tâche abandonnée ne peut pas être atteint.
3. Un objectif sans aucune tâche ni sous-objectif, ou dont toutes les tâches sont abandonnées, est :
   - a) non atteint, et affiché comme « à décliner en tâches » **(recommandé : un objectif vide n'a rien accompli)** ;
   - b) atteint.
4. Une tâche rattachée à plusieurs objectifs, une fois terminée, compte-t-elle comme terminée pour **chacun** de ces objectifs ? (oui / non)
   - **Recommandé : oui.**

*Bloque* : US-003, US-001, US-023, US-025.

### Q-DEM001-27 — Tâche abandonnée (P1 pour les points 1 et 2, P2 pour le point 3)
*Origine* : réponse partielle à Q7.3.

1. Une tâche abandonnée peut-elle être reprise, c'est-à-dire redevenir « à faire » ? (oui / non)
   - **Recommandé : oui**, pour corriger un abandon par erreur ou un changement d'avis.
2. Abandonner une tâche qui a des sous-tâches :
   - a) abandonne aussi ses sous-tâches qui ne sont pas terminées **(recommandé)** ;
   - b) n'est possible que lorsque toutes ses sous-tâches sont terminées ou abandonnées.
3. Une tâche abandonnée sort-elle du backlog ? (question Q7.3 restée sans réponse)
   - a) oui **(recommandé : elle ne représente plus de travail à faire ; sinon, le backlog ne diminuerait jamais)** ;
   - b) non.

*Bloque* : US-025 (points 1 et 2) ; US-012 (point 3).

### Q-DEM001-28 — Délai et estimation d'une tâche (P1)
*Origine* : conséquences de Q5.1, Q5.2 et Q9, et tension avec Q12.1. La vélocité repose sur les « temps originaux estimés », c'est-à-dire sur les estimations saisies à la création des tâches.

1. L'estimation est-elle obligatoire à la création d'une tâche ?
   - a) oui **(recommandé : une tâche sans estimation ne compterait pas dans la vélocité et ne pourrait être ni planifiée, ni contrôlée)** ;
   - b) non, mais une tâche sans estimation est signalée et ne peut pas être planifiée.
2. La plus petite estimation possible est-elle de 30 min ? (oui / non : précisez)
   - **Recommandé : oui**, c'est la précision que vous avez choisie (Q9).
3. L'estimation initiale peut-elle être modifiée ?
   - a) Librement, tant qu'aucun temps passé n'a été saisi sur la tâche. Elle est ensuite figée, et les corrections passent par le reste à faire. **(recommandé : vous pouvez corriger une erreur de saisie sans fausser votre vélocité)**
   - b) Jamais, après la création.
   - c) Toujours, et la vélocité utilise alors la dernière valeur.
4. Le délai est-il une date sans heure, une tâche étant dans les temps si elle est terminée au plus tard ce jour-là inclus ? (oui / non : précisez)
   - **Recommandé : oui**, par cohérence avec la planification à la journée (Q13.1 a).
5. Peut-on saisir un délai déjà dépassé, pour une tâche ou pour un objectif ?
   - a) oui, et l'élément est aussitôt signalé en retard **(recommandé : vous pouvez enregistrer un travail déjà en retard)** ;
   - b) oui, après confirmation ;
   - c) non, c'est interdit.

*Bloque* : US-002, US-001, US-024.

### Q-DEM001-29 — Suppression d'un objectif ou d'une tâche (P1)
*Origine* : conséquences de Q6.1 d), Q6.2 et Q6.3. La suppression est distincte de l'abandon : elle fait disparaître l'élément.

1. Que deviennent les tâches d'un objectif que vous supprimez ?
   - a) Elles sont conservées et détachées de cet objectif ; celles qui n'ont plus d'objectif deviennent des tâches sans objectif **(recommandé : aucune perte de travail, et Q6.2 autorise les tâches sans objectif)** ;
   - b) les tâches rattachées uniquement à cet objectif sont supprimées avec lui ;
   - c) la suppression est impossible tant que l'objectif a des tâches.
2. Que deviennent les sous-objectifs d'un objectif que vous supprimez ?
   - a) ils deviennent des objectifs principaux **(recommandé)** ;
   - b) ils sont supprimés avec lui, et leurs tâches suivent la règle du point 1 ;
   - c) la suppression est impossible tant que l'objectif a des sous-objectifs.
3. Que deviennent les sous-tâches d'une tâche que vous supprimez ?
   - a) elles sont supprimées avec elle, après une confirmation qui indique leur nombre **(recommandé : une sous-tâche n'a de sens que dans sa tâche parente ; l'abandon reste possible pour garder une trace)** ;
   - b) elles deviennent des tâches indépendantes ;
   - c) la suppression est impossible tant que la tâche a des sous-tâches.
4. La suppression est-elle définitive ?
   - a) oui, après confirmation **(recommandé dans un premier temps : l'abandon permet déjà de garder une trace)** ;
   - b) non : une corbeille permet de restaurer l'élément pendant N jours (précisez N).

*Bloque* : US-001, US-002, US-023, US-024.

### Q-DEM001-30 — Vélocité, reste à faire et contrôle des délais (P2)
*Origine* : tension entre Q12.1 (vélocité = somme des estimations initiales des tâches terminées, par semaine), Q11.1 c) (reste à faire corrigeable, qui exprime donc le temps réel restant) et Q17.1 b) (un délai ne tient pas si le reste à faire dépasse ce que la vélocité permet de réaliser avant ce délai). La vélocité est mesurée en « heures estimées », le reste à faire corrigé en « heures réelles » : les comparer directement fausse le résultat.

*Exemple* : vos tâches prennent en réalité deux fois le temps estimé. Vous travaillez 20 h par semaine et terminez des tâches estimées au total à 10 h : votre vélocité est de 10 h par semaine. Il vous reste une tâche estimée à 10 h, que vous avez ré-estimée à 20 h. Elle vous prendra une semaine. Si l'on compare son reste à faire corrigé (20 h) à votre vélocité (10 h par semaine), l'application annonce deux semaines : votre retard sur les estimations est compté deux fois.

1. Quelle quantité de travail restant l'application compare-t-elle à la vélocité ?
   - a) La somme des **estimations initiales** des tâches non terminées. Vos corrections du reste à faire servent alors au planning quotidien et au backlog, mais pas à ce contrôle. **(recommandé : les deux grandeurs sont dans la même unité, et la vélocité absorbe d'elle-même vos écarts d'estimation)**
   - b) La somme des **restes à faire corrigés**, en sachant que le résultat est pessimiste lorsque vos estimations sont trop optimistes.
   - c) Autre : précisez.
2. Quelle vélocité utiliser pour ce contrôle ?
   - a) la moyenne des 4 dernières semaines **(recommandé : réagit aux changements de rythme sans dépendre d'une seule semaine atypique)** ;
   - b) la dernière semaine complète ;
   - c) la moyenne des N dernières semaines : précisez N.
3. Tant que l'historique est insuffisant (par exemple pendant les premières semaines d'utilisation) :
   - a) le contrôle s'appuie sur votre capacité quotidienne, en indiquant que la vélocité n'est pas encore disponible **(recommandé : vous êtes alerté dès le départ)** ;
   - b) aucun contrôle n'est fait, et l'application indique que la vélocité n'est pas encore disponible.
4. Une tâche terminée compte dans la vélocité de la semaine, **du lundi au dimanche**, où vous l'avez déclarée terminée. (oui / non : précisez)
   - **Recommandé : oui.**
5. Une tâche terminée, puis rouverte, puis de nouveau terminée :
   - a) compte uniquement dans la semaine de sa dernière fin **(recommandé : elle n'est comptée qu'une fois)** ;
   - b) compte dans chacune des semaines où elle a été terminée.

*Bloque* : US-007, US-010, US-011, US-013.

### Q-DEM001-31 — Reste à faire après correction et saisie du temps passé (P2)
*Origine* : tension entre Q11.1 c) (reste à faire calculé, mais corrigeable), Q11.2 b) (alerte quand le temps passé dépasse l'estimation), Q9 (précision de 30 min) et la règle de conflit (la modification la plus récente l'emporte).

1. Après une correction manuelle du reste à faire, comment est-il calculé ensuite ?
   - a) reste à faire corrigé, moins le temps passé saisi depuis la correction **(recommandé : votre correction est conservée)** ;
   - b) toujours estimation initiale moins temps passé cumulé : votre correction est remplacée à la saisie suivante.
2. Quand l'alerte de ré-estimation se déclenche-t-elle ?
   - a) quand le reste à faire calculé atteint zéro alors que la tâche n'est pas terminée, le reste à faire étant alors affiché à zéro **(recommandé : cela tient compte de vos corrections)** ;
   - b) dès que le temps passé cumulé dépasse l'estimation initiale, même si vous avez corrigé le reste à faire.
3. Le temps passé se saisit-il aussi par pas de 30 min ?
   - a) oui **(recommandé : le reste à faire, égal à l'estimation moins le temps passé, reste alors un multiple de 30 min, comme en Q9)** ;
   - b) non, à la minute près : précisez alors comment le reste à faire est arrondi.
4. La durée saisie pour une tâche et un jour (Q10.1 b) est :
   - a) le **total** du jour pour cette tâche : une nouvelle saisie remplace la précédente **(recommandé : c'est cohérent avec « une durée par tâche et par jour » et avec la règle « la plus récente l'emporte » entre vos deux appareils)** ;
   - b) un **ajout** : chaque saisie s'additionne aux précédentes du jour. Dans ce cas, deux saisies faites sur vos deux appareils doivent-elles s'additionner, par exception à la règle « la plus récente l'emporte » ? (oui / non)

*Bloque* : US-008, US-009, US-016.

### Q-DEM001-32 — Horaire suggéré et planification à la journée (P2)
*Origine* : vos compléments (la tâche est planifiée sur une journée et l'application lui suggère un horaire, qui forme le créneau de l'agenda principal), et la tension entre Q13.1 a) (une seule journée), Q13.3 (report automatique au jour suivant) et Q14 (capacité par jour).

1. Comment l'application choisit-elle l'horaire suggéré ?
   - a) Dans le premier temps libre de votre agenda ce jour-là, à l'intérieur de **plages de travail** que vous définissez par jour de la semaine (par exemple 9 h – 18 h) **(recommandé : le créneau ne chevauche pas vos rendez-vous ; nouveau réglage à prévoir)** ;
   - b) à partir d'une heure de début fixe (par exemple 9 h), les tâches s'enchaînant dans l'ordre de priorité, sans tenir compte de vos rendez-vous ;
   - c) autre : précisez.
2. La durée du créneau est :
   - a) le reste à faire de la tâche, limité au temps disponible ce jour-là **(recommandé)** ;
   - b) le reste à faire de la tâche, même s'il dépasse le temps disponible.
3. Pouvez-vous modifier dans l'application l'horaire suggéré d'une tâche ? (oui / non)
   - **Recommandé : oui**, comme pour le planning proposé (Q13.2 b).
4. Une tâche plus longue que la capacité d'une journée (par exemple 6 h pour une capacité de 4 h) ne peut être planifiée que sur une journée (Q13.1 a). L'application :
   - a) la planifie sur une journée en signalant le dépassement (Q14.3 b), et le report automatique la reconduit les jours suivants tant qu'elle n'est pas terminée ;
   - b) vous invite à la découper en sous-tâches ;
   - c) fait les deux **(recommandé)**.
5. Le report automatique (Q13.3) se fait vers :
   - a) le lendemain, même si votre capacité ce jour-là est nulle (par exemple un dimanche) ;
   - b) le prochain jour où votre capacité est supérieure à zéro **(recommandé : une tâche n'est pas reportée sur un jour où vous ne travaillez pas)**.

*Bloque* : US-020, US-006, US-027, US-028.

### Q-DEM001-33 — Créneau déplacé dans Google Calendar (P2)
*Origine* : vos compléments. Un créneau déplacé dans Google Calendar déclenche une notification dans l'application, puis, le soir, une replanification proposée que vous validez ou modifiez. Restent les points suivants.

1. À quel moment la replanification est-elle proposée ?
   - a) à l'heure du rappel du soir (21 h par défaut), l'application la présentant à votre prochaine ouverture **(recommandé : un seul moment de bilan par jour)** ;
   - b) à une heure distincte que vous réglez ;
   - c) autre : précisez.
2. Quel jour l'application propose-t-elle pour la tâche ?
   - a) le jour où vous avez déplacé le créneau **(recommandé : votre déplacement exprime votre intention)** ;
   - b) un jour recalculé selon la priorité, les délais et la capacité, sans tenir compte du jour choisi dans Google.
3. Si le créneau est déplacé à une autre heure **du même jour** :
   - a) l'application retient le nouvel horaire sans proposer de replanification **(recommandé : la journée planifiée ne change pas)** ;
   - b) même traitement qu'un changement de jour.
4. Si le créneau est **supprimé** dans Google Calendar :
   - a) même traitement qu'un déplacement : notification, puis replanification proposée le soir **(recommandé)** ;
   - b) la tâche est déplanifiée, sans proposition ;
   - c) l'application recrée le créneau.

*Bloque* : US-032.

### Q-DEM001-34 — Événements de l'agenda et capacité (P2)
*Origine* : tension entre Q15.1 (les événements réduisent le temps disponible), Q14.1 (capacité par jour de la semaine) et les créneaux que l'application crée elle-même (RG-034).

*Exemple* : votre capacité du lundi est de 4 h et vous avez une réunion de 2 h ce jour-là.

1. Comment la réunion réduit-elle le temps disponible pour vos tâches ?
   - a) Il est réduit de la durée de la réunion : 4 h − 2 h = 2 h.
   - b) Il n'est réduit que si la réunion empiète sur le temps libre de vos plages de travail. Par exemple, avec une plage de 9 h à 18 h, il reste 7 h libres, ce qui couvre vos 4 h : le temps disponible reste de 4 h. **(recommandé : une réunion n'ampute pas forcément le temps des tâches ; ce mode utilise les mêmes plages de travail qu'en Q-DEM001-32)**
   - c) Autre : précisez.
2. Quels événements de votre agenda principal sont pris en compte ?
   - a) Les événements avec horaire que vous avez acceptés ou auxquels vous n'avez pas répondu. Sont exclus les événements marqués « disponible » et les événements « journée entière ». **(recommandé)**
   - b) Tous les événements.
   - c) Autre : précisez.
3. Les événements créés par l'application (rappels, créneaux de tâches) ne réduisent jamais le temps disponible. (oui / non)
   - **Recommandé : oui.** Sinon, une tâche planifiée réduirait la capacité qui sert à la planifier.

*Bloque* : US-019.

### Q-DEM001-35 — Critères de l'ordre de priorité (P2)
*Origine* : réponse partielle à Q16 (ordre proposé, modifiable ; critères et départage non précisés), et tension entre Q6.3 (une tâche pour plusieurs objectifs) et Q6.4 (importance d'un objectif).

1. Ordre d'application des critères. **Recommandé :**
   1. tâches en retard (délai dépassé) ;
   2. délai le plus proche ;
   3. importance de l'objectif ;
   4. plus petit reste à faire.

   Acceptez-vous cet ordre ? (oui / non : donnez votre ordre)
2. En cas d'égalité, quel critère départage deux tâches ?
   - a) la date de création, la plus ancienne d'abord **(recommandé : stable et prévisible)** ;
   - b) l'ordre alphabétique ;
   - c) autre : précisez.
3. Comment s'exprime l'importance d'un objectif ?
   - a) haute, moyenne ou basse, « moyenne » par défaut **(recommandé : simple à saisir sur smartphone)** ;
   - b) une note de 1 à 5, 3 par défaut ;
   - c) autre : précisez.
4. Quelle importance retenir pour une tâche rattachée à plusieurs objectifs ?
   - a) la plus haute **(recommandé)** ;
   - b) autre : précisez.

   Et pour une tâche sans objectif :
   - a) l'importance par défaut **(recommandé)** ;
   - b) la plus basse.
5. Après que vous avez modifié l'ordre à la main :
   - a) votre ordre est conservé ; les nouvelles tâches sont insérées selon les critères, et vous pouvez demander à tout moment un nouveau calcul **(recommandé : votre choix n'est pas écrasé sans votre accord)** ;
   - b) l'ordre est recalculé chaque jour, et vos modifications ne valent que pour la journée ;
   - c) autre : précisez.

*Bloque* : US-004, US-030, US-027.

### Q-DEM001-36 — Définition du backlog et planification (P2)
*Origine* : tension entre Q20.1 b) (backlog = tâches non terminées **et non planifiées**), Q13.2 b) (l'application vous propose un planning) et Q13.3 (report automatique). Avec le report automatique, une tâche planifiée ne revient jamais dans le backlog. Dès que vous acceptez un planning qui couvre toutes vos tâches, le backlog tombe à zéro alors que le travail restant n'a pas diminué. Il mesure alors le travail **non encore planifié**, et non le travail **restant**.

1. Le backlog, dont vous suivez l'évolution, doit être :
   - a) le travail non encore planifié, comme vous l'avez répondu : le graphique montre ce qui reste à placer dans votre planning ;
   - b) toutes les tâches non terminées, planifiées ou non : le graphique montre le travail restant total **(recommandé : cela répond à « savoir si mon travail restant diminue », et c'est cohérent avec le contrôle des délais)** ;
   - c) les deux, sous forme de deux courbes.
2. Sur quelle période l'application propose-t-elle un planning ?
   - a) toutes les tâches, jusqu'à leur délai ;
   - b) seulement les N prochains jours, avec N = 7 **(recommandé : un planning court reste lisible dans votre agenda et se corrige facilement ; précisez N si vous en voulez un autre)**.

*Bloque* : US-012, US-027.

### Q-DEM001-37 — Fuseau horaire des rappels et des créneaux (P2)
*Origine* : tension entre Q10.4 a) (la journée suit l'heure locale de l'appareil) et Q18.1 (rappels à 8 h et 21 h). Les rappels et les créneaux sont des événements de votre agenda Google, qui ne dépend d'aucun appareil, et vos deux appareils peuvent se trouver dans des fuseaux différents (smartphone en voyage, PC à domicile).

1. Les heures des rappels (8 h, 21 h) et les horaires suggérés des créneaux s'entendent :
   - a) dans le fuseau horaire de votre agenda Google **(recommandé : un seul fuseau, celui qu'affiche Google Calendar ; en voyage, vous le changez dans Google)** ;
   - b) dans le fuseau du dernier appareil utilisé ;
   - c) dans un fuseau de référence fixe, choisi dans l'application.

*Bloque* : US-015, US-016, US-020, US-029.

### Q-DEM001-38 — Rôle de la notification de l'application (P2)
*Origine* : tension entre Q19.1 b) (une notification de l'application est acceptable) et Q18.3 a) (rappel sous forme d'événement dans l'agenda principal). Quand la notification de l'application doit-elle servir ?

- a) Jamais pour les rappels : ils passent uniquement par Google Calendar. Si l'accès à l'agenda est perdu, l'application vous avertit (Q19.3).
- b) En secours : si l'accès à l'agenda est perdu, l'application émet elle-même les rappels jusqu'à votre reconnexion. **(recommandé, sous réserve de l'avis de Starck : vous ne perdez pas vos rappels quotidiens sans vous en rendre compte)**
- c) En complément : la notification de l'application s'ajoute toujours à l'événement Google.

*Bloque* : US-014, US-015, US-016.

### Q-DEM001-39 — Usage hors ligne sur le PC (P2)
*Origine* : réponse partielle à Q4.1. Vous avez indiqué que l'usage prioritaire est celui du smartphone.

- a) Le PC est utilisable hors ligne lui aussi, dans un lot ultérieur à celui du smartphone **(recommandé : vous gardez le même comportement sur vos deux appareils, sans retarder le smartphone)** ;
- b) le PC est utilisable hors ligne dans le même lot que le smartphone ;
- c) le PC n'a pas besoin de fonctionner hors ligne : sans réseau, il indique qu'une connexion est nécessaire.

*Bloque* : US-031 (conditionnelle). La question devient P1 si vous décidez d'intégrer l'usage hors ligne au lot 1.

### Q-DEM001-40 — Rappel du soir : invitation à saisir (P3)
*Origine* : réponse partielle à Q18.5.

1. Quand, à l'heure du rappel du soir, aucun temps n'a été saisi pour une tâche planifiée dans la journée, le rappel :
   - a) contient une invitation à saisir votre temps, avec un lien vers l'application **(recommandé : le rappel du soir sert alors à déclencher la saisie)** ;
   - b) liste simplement la tâche avec un temps passé de 0 h.
2. Si vous saisissez du temps après l'heure du rappel du soir, son contenu doit-il être mis à jour ? (oui / non)
   - **Recommandé : non**, par cohérence avec votre réponse pour le rappel du matin (Q18.4).

*Bloque* : US-016.

---

## DEM-002 — Questions ouvertes (v0.3)

> Rédigées par Pepper le 2026-10-20 (E1 de DEM-002 : questions de bilan du soir, fun fact du matin). Reformulation et analyse d'écart : [cahier des charges v0.3](cahier-des-charges.md), §2.
>
> Aucune question n'est P1 : DEM-002 enrichit les rappels, qui ne font pas partie de LOT-001. Toutes sont **P2** : elles bloquent le lot « Rappels ».
>
> Points examinés et non posés, car déjà réglés par les règles existantes :
> - une réponse saisie sans réseau, ou modifiée sur les deux appareils, suit RG-021 et RG-036 ;
> - les réponses sont conservées dans votre espace personnel (RG-020) ;
> - les questions de bilan sont posées tous les jours, comme le rappel du soir (Q-DEM001-18.2 a).

### Synthèse

| Question | Objet | Priorité | US bloquées | État |
|---|---|---|---|---|
| Q-DEM002-1 | Lieu et moment de la réponse aux questions du soir | P2 | US-033 | Ouverte |
| Q-DEM002-2 | Réponses facultatives et délai pour répondre | P2 | US-033 | Ouverte |
| Q-DEM002-3 | Conservation et consultation des réponses | P2 | US-033, US-034 | Ouverte |
| Q-DEM002-4 | Origine, langue et domaine des fun facts | P2 | US-035 | Ouverte |
| Q-DEM002-5 | Liste des fun facts modifiable | P2 | US-036 | Ouverte |
| Q-DEM002-6 | Sens de « aussi souvent que les autres » | P2 | US-035 | Ouverte |
| Q-DEM002-7 | Fun fact un jour sans tâche planifiée | P2 | US-035 | Ouverte |

### Q-DEM002-1 — Où et quand répondre aux questions du soir (P2)
*Origine* : tension entre DEM-002 et Q-DEM001-18.3 a). Le rappel du soir est un événement de votre agenda Google : il peut **afficher** les deux questions, mais vous ne pouvez pas y **répondre**.

- a) Les questions figurent dans l'événement du soir, avec un lien qui ouvre directement l'écran de réponse dans l'application ; vous pouvez aussi y répondre en ouvrant l'application vous-même. **(recommandé : le rappel reste dans votre agenda, comme vous l'avez choisi, et la réponse se fait là où elle peut être enregistrée)**
- b) Les questions figurent seulement dans l'événement du soir, comme une invitation à réfléchir : aucune réponse n'est saisie ni enregistrée.
- c) Les questions sont posées par une notification de l'application, qui permet de répondre directement (voir aussi Q-DEM001-38).

*Bloque* : US-033.

### Q-DEM002-2 — Réponses facultatives et délai pour répondre (P2)
*Origine* : DEM-002 ne dit pas si les réponses sont attendues chaque jour. Sans objet si vous répondez b) à Q-DEM002-1.

1. Les réponses sont-elles facultatives ?
   - a) oui : vous pouvez répondre à une seule question, aux deux ou à aucune, sans relance **(recommandé : un bilan imposé devient vite une contrainte)** ;
   - b) oui, mais une absence de réponse est rappelée dans le rappel du soir suivant ;
   - c) non, une réponse est attendue chaque jour.
2. Jusqu'à quand pouvez-vous répondre pour une journée donnée ?
   - a) sans limite, comme pour le temps passé (Q-DEM001-10.2 b) **(recommandé : par cohérence)** ;
   - b) jusqu'à la fin de la journée ;
   - c) jusqu'au lendemain soir.

*Bloque* : US-033.

### Q-DEM002-3 — Conservation et consultation des réponses (P2)
Sans objet si vous répondez b) à Q-DEM002-1.

1. Vos réponses sont-elles conservées et consultables ensuite ?
   - a) oui, sous forme d'un journal classé par date, qui affiche pour chaque journée les deux réponses **(recommandé : relire ses bilans donne tout son sens à l'exercice)** ;
   - b) oui, mais seulement celles de la journée en cours ;
   - c) non, elles ne sont pas conservées.
2. Une réponse déjà enregistrée peut-elle être modifiée ou supprimée ? (oui / non)
   - **Recommandé : oui.**

*Bloque* : US-033, US-034.

### Q-DEM002-4 — Origine, langue et domaine des fun facts (P2)
*Origine* : DEM-002 parle d'une liste de 100 fun facts « téléchargés en base », sans dire qui les fournit.

1. Qui fournit la liste des 100 fun facts ?
   - a) Vous, sous la forme d'une liste que vous remettez à l'équipe.
   - b) L'équipe projet les rédige, et vous les validez avant leur mise en service. **(recommandé : vous gardez la maîtrise du contenu, sans avoir à le rédiger ; votre validation garantit l'exactitude des faits)**
   - c) Ils proviennent d'une source externe que vous désignez : précisez laquelle.
2. Dans quelle langue sont-ils présentés ?
   - a) en français **(recommandé : c'est la langue de l'application et de vos rappels)** ;
   - b) en anglais ;
   - c) autre : précisez.
3. « Si possible dans le domaine scientifique » :
   - a) les 100 fun facts sont tous scientifiques **(recommandé : un critère simple à contrôler)** ;
   - b) une majorité est scientifique, et d'autres domaines sont admis (précisez lesquels).

*Bloque* : US-035.

### Q-DEM002-5 — Liste des fun facts modifiable (P2)
- a) La liste est fixe : la modifier passe par une nouvelle demande. **(recommandé dans un premier temps : c'est ce que décrit votre demande, et cela suffit à garantir l'égalité d'affichage de Q-DEM002-6)**
- b) Vous pouvez, dans l'application, ajouter, modifier ou retirer des fun facts. Dans ce cas, comment l'égalité d'affichage traite-t-elle un fun fact ajouté en cours de route ? Précisez.

*Bloque* : US-036 (conditionnelle).

### Q-DEM002-6 — Sens de « aussi souvent que les autres » (P2)
Un tirage au hasard chaque jour n'assure l'égalité qu'en moyenne, sur une très longue durée : certains fun facts reviendraient plusieurs fois avant que d'autres n'apparaissent.

- a) Tirage sans remise : les 100 fun facts sont présentés chacun une fois, dans un ordre aléatoire, sur 100 jours. Un nouveau cycle commence ensuite, dans un nouvel ordre aléatoire, et le dernier fun fact d'un cycle n'est jamais le premier du cycle suivant. **(recommandé : l'égalité est exacte à la fin de chaque cycle, et aucun fun fact ne se répète au cours d'un cycle)**
- b) Tirage au hasard indépendant chaque jour : l'égalité n'est que statistique, et des répétitions sont possibles.
- c) Autre : précisez.

*Bloque* : US-035.

### Q-DEM002-7 — Fun fact un jour sans tâche planifiée (P2)
Vous avez demandé qu'un rappel du matin soit envoyé même sans tâche planifiée (Q-DEM001-18.6). Ce rappel contient-il aussi le fun fact du jour ? (oui / non)
- **Recommandé : oui.** Le fun fact est présenté chaque matin, et le cycle d'égalité de Q-DEM002-6 se déroule sans interruption.

*Bloque* : US-035.

### Réponses du commanditaire (DEM-002)
*(à compléter par Jarvis à réception)*

| Question | Date | Réponse | Impact (RG / US) |
|---|---|---|---|
