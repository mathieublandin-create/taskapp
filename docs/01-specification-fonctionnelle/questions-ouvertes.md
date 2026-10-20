# Questions ouvertes au commanditaire — DEM-001

> Version 0.1 du 2026-10-20 (Pepper, E1). Questions à transmettre au commanditaire via Jarvis.
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
| Q-DEM001-1 | 2026-10-20 | a) seul indispensable en 1re version (objectifs et tâches). j) non répondu. | À reporter par Pepper |
| Q-DEM001-2 | 2026-10-20 | a) moi seul. | À reporter par Pepper |
| Q-DEM001-3 | 2026-10-20 | b) dans mon propre espace de stockage en ligne (ex. Google Drive). Délai de propagation : non répondu. | À reporter par Pepper |
| Q-DEM001-4 | 2026-10-20 | 1. c) consultation et saisie hors ligne (appareil : non précisé). 2. règle de conflit : non répondu. | À reporter par Pepper |
| Q-DEM001-5 | 2026-10-20 | 5.1 non · 5.2 oui · 5.3 b) oui avec alerte · 5.4 a) quand toutes ses tâches sont terminées. | À reporter par Pepper |
| Q-DEM001-6 | 2026-10-20 | 6.1 d) sous-objectifs et sous-tâches · 6.2 oui · 6.3 oui · 6.4 oui. | À reporter par Pepper |
| Q-DEM001-7 | 2026-10-20 | 7.1 a) je la déclare terminée · 7.2 oui · 7.3 oui (sortie du backlog : non précisé). | À reporter par Pepper |
| Q-DEM001-8 | 2026-10-20 | b) oui, mais plus tard (fréquences non précisées). | À reporter par Pepper |
| Q-DEM001-9 | 2026-10-20 | a) heures et minutes, précision 30 min. | À reporter par Pepper |
| Q-DEM001-10 | 2026-10-20 | 10.1 b) saisie d'une durée par tâche et par jour · 10.2 b) oui sans limite · 10.3 a) jour de démarrage · 10.4 a) heure locale de l'appareil. | À reporter par Pepper |
| Q-DEM001-11 | 2026-10-20 | 11.1 c) calcul automatique corrigeable · 11.2 b) alerte demandant de ré-estimer. | À reporter par Pepper |
| Q-DEM001-12 | 2026-10-20 | 12.1 réponse libre : « la somme des temps originaux estimés des tâches terminées » · 12.2 b) par semaine · 12.3 oui. | À reporter par Pepper |
| Q-DEM001-13 | 2026-10-20 | 13.1 a) sur une journée, sans horaire · 13.2 b) l'application propose, je modifie · 13.3 report automatique. | À reporter par Pepper |
| Q-DEM001-14 | 2026-10-20 | 14.1 c) valeur par jour de semaine + exceptions datées · 14.2 b) proposée par l'application, validée par moi · 14.3 b) alerte sans blocage. | À reporter par Pepper |
| Q-DEM001-15 | 2026-10-20 | 15.1 oui · 15.2 oui (sous-questions : prise en compte d'un déplacement dans Google et agenda principal/dédié : non répondu). | À reporter par Pepper |
| Q-DEM001-16 | 2026-10-20 | c) ordre proposé automatiquement, modifiable (critères et départage : non répondu). | À reporter par Pepper |
| Q-DEM001-17 | 2026-10-20 | 17.1 b) selon la vélocité réelle · 17.2 b) proposition acceptée ou refusée · 17.3 dans l'application et dans les rappels. | À reporter par Pepper |
| Q-DEM001-18 | 2026-10-20 | 18.1 8 h et 21 h, modifiables par moi · 18.2 a) tous les jours · 18.3 a) événement dans l'agenda principal · 18.4 non · 18.5 c) les deux (invitation à saisir : non répondu) · 18.6 oui. | À reporter par Pepper |
| Q-DEM001-19 | 2026-10-20 | 19.1 b) souhaité, notification de l'application acceptable · 19.2 non · 19.3 c) événements conservés (a implicite). | À reporter par Pepper |
| Q-DEM001-20 | 2026-10-20 | 20.1 b) tâches non terminées et non planifiées · 20.2 b) somme des restes à faire · 20.3 oui · 20.4 b) 12 dernières semaines, par semaine. | À reporter par Pepper |
