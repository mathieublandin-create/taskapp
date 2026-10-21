# Backlog initial — DEM-001 et DEM-002

> Version 0.1 du 2026-10-20 (Pepper, E1) : découpage provisoire.
> **Version 0.2 du 2026-10-20 (Pepper, fin de E1)** : intégration des réponses aux questions Q-DEM001-1 à 20 et des compléments du commanditaire. Les US conditionnelles sont confirmées ou reportées, et des US sont créées (US-022 à US-032). Les fichiers d'US détaillés n'existent que pour les US proposées dans [LOT-001](../lots/LOT-001.md).
>
> **Version 0.3 du 2026-10-20 (Pepper, E1 de DEM-002)** : ajout des US-033 à US-036 (questions de bilan du soir, fun fact du matin).
>
> **Version 0.4 du 2026-10-20 (Pepper, fin de E1 pour LOT-001)** : réponses Q-DEM001-21 à 29, avis de l'architecte (F1 à F14), décisions DEC-001 à DEC-012 et réponses aux questions ergonomiques Q-ERG-02 à 11 intégrées. US-018 rejoint LOT-001 (DEC-002). Dans la colonne RG, l'astérisque (*) signale une règle **proposée**, à valider en E6.
>
> Toutes les US non reportées sont au statut **En analyse**. Persona unique : **l'utilisateur** (le commanditaire). Voir le [cahier des charges v0.4](cahier-des-charges.md).

## Légende
- **Q bloquantes** : questions résiduelles (Q-DEM001-21 et suivantes) dont la réponse est nécessaire pour finaliser les critères d'acceptation de l'US.
- **Évolution v0.2** :
  - *Confirmée* : l'US existait en v0.1 et son contenu est inchangé sur le fond ;
  - *Modifiée* : son contenu change à la suite des réponses ;
  - *Nouvelle* ;
  - *Reportée*.
- **Lot** : lot proposé. Au-delà de LOT-001, le découpage est **indicatif** et sera proposé formellement lors des E2 suivantes.

## Vue d'ensemble des épopées

| Épopée | Titre | US |
|---|---|---|
| EP-01 | Objectifs et tâches | US-001, US-002, US-003, US-023, US-024, US-025, US-021 (reportée) |
| EP-02 | Priorisation | US-004, US-030 |
| EP-03 | Planification et capacité | US-005, US-006, US-007, US-026, US-027, US-028 |
| EP-04 | Suivi du temps | US-008, US-009 |
| EP-05 | Vélocité et pilotage | US-010, US-011, US-012, US-013 |
| EP-06 | Rappels quotidiens via Google Calendar | US-014, US-015, US-016, US-029, US-033, US-034, US-035, US-036 (DEM-002) |
| EP-07 | Compte, données et accès multi-appareils | US-022, US-017, US-018, US-031 |
| EP-08 | Planning et agenda Google | US-019, US-020, US-032 |

## EP-01 — Objectifs et tâches

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-001 | Créer et gérer un objectif | **En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer un objectif, avec ou sans délai, **afin de** formaliser ce que je cherche à atteindre. | RG-001, RG-002, RG-004, RG-024, RG-025, RG-045, RG-046, RG-047*, RG-050*, RG-053, RG-054* | — | Modifiée : délai facultatif (Q5.1) ; v0.4 : Q-26, 28, 29 intégrées | LOT-001 |
| US-023 | Organiser un objectif en sous-objectifs | **En tant qu'**utilisateur, **je veux** décomposer un objectif en sous-objectifs, **afin de** structurer les objectifs ambitieux. | RG-022, RG-025, RG-046, RG-047*, RG-048*, RG-050* | — | Nouvelle (Q6.1 d) ; v0.4 : Q-24, 26, 29 intégrées | LOT-001 |
| US-002 | Créer et gérer mes tâches | **En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer une tâche, avec son délai et son estimation, et la rattacher à zéro, un ou plusieurs objectifs, **afin de** transformer mes objectifs en travail concret. | RG-001, RG-003, RG-004, RG-024, RG-028, RG-029, RG-045, RG-046, RG-047*, RG-050*, RG-053, RG-054* | — | Modifiée : délai obligatoire, rattachement multiple, tâches sans objectif (Q5, Q6) ; v0.4 : Q-28, 29 et Q-ERG-03 (aucun délai ni estimation par défaut) intégrées | LOT-001 |
| US-024 | Décomposer une tâche en sous-tâches | **En tant qu'**utilisateur, **je veux** découper une tâche en sous-tâches, **afin de** suivre plus finement un travail important. | RG-023, RG-003, RG-028, RG-029, RG-046, RG-047*, RG-049*, RG-050* | — | Nouvelle (Q6.1 d) ; v0.4 : Q-25, 27, 29 intégrées | LOT-001 |
| US-003 | Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif | **En tant qu'**utilisateur, **je veux** déclarer une tâche terminée, pouvoir la rouvrir, et voir si chacun de mes objectifs est atteint, **afin de** savoir ce qui est accompli. | RG-025, RG-026, RG-023, RG-001, RG-008, RG-045, RG-049*, RG-050*, RG-053, RG-054* | — | Modifiée : fin sur déclaration, réouverture, atteinte calculée (Q5.4, Q7) ; v0.4 : Q-25, 26 intégrées | LOT-001 |
| US-025 | Abandonner une tâche | **En tant qu'**utilisateur, **je veux** abandonner une tâche que je ne réaliserai pas, sans la supprimer, **afin de** garder une trace et de ne plus la voir parmi mon travail à faire. | RG-027, RG-025, RG-023, RG-045, RG-049*, RG-050*, RG-053, RG-054* | — | Nouvelle (Q7.3) ; v0.4 : Q-26.2, 27 intégrées | LOT-001 |
| US-021 | Gérer des tâches récurrentes | **En tant qu'**utilisateur, **je veux** définir une tâche qui se répète selon une fréquence, **afin de** ne pas la recréer à chaque occurrence. | à créer | Fréquences à recueillir le moment venu | **Reportée** (Q8 b : « plus tard ») | Non planifiée |

## EP-02 — Priorisation

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-030 | Donner une importance à un objectif | **En tant qu'**utilisateur, **je veux** indiquer l'importance de chaque objectif, **afin que** la priorité proposée de mes tâches en tienne compte. | RG-030 | Q-DEM001-35 | Nouvelle (Q6.4) | Lot « Priorisation et planification » |
| US-004 | Prioriser les tâches à réaliser | **En tant qu'**utilisateur, **je veux** que l'application me propose un ordre de priorité de mes tâches, que je peux modifier, **afin de** savoir sur quoi travailler en premier. | RG-005, RG-030, RG-051 | Q-DEM001-35 | Modifiée : ordre proposé et modifiable (Q16 c) ; v0.4 : tâches du jour classées par priorité (Q-ERG-06, RG-051) | Lot « Priorisation et planification » |

## EP-03 — Planification et capacité

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-005 | Définir ma capacité quotidienne | **En tant qu'**utilisateur, **je veux** indiquer le temps que je consacre à mes tâches pour chaque jour de la semaine, avec des exceptions datées, **afin de** planifier sur une base réaliste. | RG-011, RG-028 | — | Modifiée : capacité par jour de la semaine et exceptions (Q14.1 c) | Lot « Priorisation et planification » |
| US-026 | Recevoir une proposition de ré-estimation de ma capacité | **En tant qu'**utilisateur, **je veux** que l'application me propose une nouvelle capacité à partir du temps que j'ai réellement passé, et la valider ou non, **afin de** garder une capacité réaliste. | RG-011 | Q-DEM001-31 | Nouvelle (Q14.2 b) ; v0.4 : ré-estimation proposée chaque semaine, le dimanche (Q-ERG-09) | Lot « Vélocité et pilotage » |
| US-006 | Planifier mes tâches sur mes journées | **En tant qu'**utilisateur, **je veux** placer une tâche sur une journée, et être alerté si je dépasse ma capacité, **afin de** savoir ce que je dois faire chaque jour. | RG-006, RG-011, RG-051 | Q-DEM001-32 | Modifiée : planification à la journée, alerte sans blocage (Q13.1 a, Q14.3 b) ; v0.4 : planification après le délai possible, avec alerte (Q-ERG-08) ; ordre de priorité dans « Aujourd'hui » (RG-051) | Lot « Priorisation et planification » |
| US-027 | Recevoir une proposition de planning | **En tant qu'**utilisateur, **je veux** que l'application me propose un planning selon la priorité, les délais et ma capacité, que je peux modifier, **afin de** gagner du temps dans l'organisation de mes journées. | RG-031, RG-005, RG-011 | Q-DEM001-35, 36 | Nouvelle (Q13.2 b) ; v0.4 : planning proposé accepté tâche par tâche (Q-ERG-10) | Lot « Priorisation et planification » |
| US-028 | Reporter automatiquement les tâches non terminées | **En tant qu'**utilisateur, **je veux** qu'une tâche planifiée un jour passé et non terminée soit reportée automatiquement, **afin de** ne rien perdre de vue. | RG-032 | Q-DEM001-32 | Nouvelle (Q13.3) | Lot « Priorisation et planification » |
| US-007 | Vérifier que mes délais sont tenables | **En tant qu'**utilisateur, **je veux** être averti quand ma vélocité réelle ne permet pas de tenir le délai d'une tâche ou d'un objectif, **afin de** réagir à temps. | RG-007, RG-002, RG-003, RG-052 | Q-DEM001-30 | Modifiée : contrôle fondé sur la vélocité (Q17.1 b) ; v0.4 : alerte non traitée réaffichée chaque jour, même après un refus (Q-ERG-07, RG-052) | Lot « Vélocité et pilotage » |

## EP-04 — Suivi du temps

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-008 | Saisir le temps passé sur une tâche | **En tant qu'**utilisateur, **je veux** saisir une durée passée sur une tâche pour une journée, y compris pour un jour antérieur, **afin de** suivre mon travail réel. | RG-008 | Q-DEM001-31 | Modifiée : saisie d'une durée, sans chronomètre, sans limite d'antériorité (Q10) | Lot « Suivi du temps » |
| US-009 | Consulter et corriger le reste à faire | **En tant qu'**utilisateur, **je veux** voir le reste à faire calculé de chaque tâche, le corriger, et être alerté quand il est dépassé, **afin de** disposer d'une vision fiable du travail restant. | RG-009, RG-028 | Q-DEM001-31 | Modifiée : calcul automatique corrigeable, alerte de ré-estimation (Q11) | Lot « Suivi du temps » |

## EP-05 — Vélocité et pilotage

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-010 | Consulter ma vélocité | **En tant qu'**utilisateur, **je veux** connaître ma vélocité hebdomadaire, **afin de** mesurer mon rythme réel. | RG-010, RG-029 | Q-DEM001-25, 30 | Modifiée : définition et période (Q12) | Lot « Vélocité et pilotage » |
| US-011 | Accepter ou refuser un ajustement proposé | **En tant qu'**utilisateur, **je veux** recevoir une proposition de nouveau délai ou de nouveau planning quand un délai ne tient pas, et l'accepter ou la refuser, **afin de** garder un planning réaliste sans perdre la main. | RG-007, RG-004, RG-052 | Q-DEM001-30 | Modifiée : proposition à accepter ou refuser (Q17.2 b) ; v0.4 : proposition refusée : alerte réaffichée le lendemain si le délai ne tient toujours pas (RG-052) | Lot « Vélocité et pilotage » |
| US-012 | Visualiser l'évolution du backlog | **En tant qu'**utilisateur, **je veux** voir l'évolution de mon backlog sur les 12 dernières semaines, en vue globale et par objectif, **afin de** savoir si mon travail diminue au rythme attendu. | RG-015 | Q-DEM001-27, 36 | Modifiée : définition, mesure, période, vue par objectif (Q20) | Lot « Vélocité et pilotage » |
| US-013 | Visualiser l'évolution de la vélocité | **En tant qu'**utilisateur, **je veux** voir l'évolution de ma vélocité sur les 12 dernières semaines, en vue globale et par objectif, **afin de** repérer les variations de mon rythme. | RG-016, RG-010 | Q-DEM001-30 | Modifiée : période, vue par objectif (Q20) | Lot « Vélocité et pilotage » |

## EP-06 — Rappels quotidiens via Google Calendar

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-014 | Autoriser l'accès à mon agenda Google | **En tant qu'**utilisateur, **je veux** autoriser l'application à écrire et lire dans mon agenda Google principal, et être averti si cet accès est perdu, **afin de** bénéficier des rappels et des créneaux tout en gardant la maîtrise de mon compte. | RG-014, RG-035 | Q-DEM001-38 | Modifiée : la connexion au compte est désormais portée par US-022 ; US-014 ne couvre plus que l'accès à l'agenda | Lot « Rappels » |
| US-015 | Recevoir le rappel du matin | **En tant qu'**utilisateur, **je veux** recevoir chaque matin, dans mon agenda principal, la liste des tâches planifiées dans la journée, **afin de** démarrer ma journée en sachant quoi faire. | RG-012, RG-014, RG-007, RG-053 | Q-DEM001-38 | Modifiée : 8 h, tous les jours, agenda principal, rappel même sans tâche (Q18) ; v0.4 : heure de Paris (DEC-012, RG-053) | Lot « Rappels » |
| US-016 | Recevoir le rappel du soir | **En tant qu'**utilisateur, **je veux** recevoir chaque soir, dans mon agenda principal, le temps passé dans la journée et le reste à faire de mes tâches, **afin de** faire le bilan de ma journée. | RG-013, RG-014, RG-007, RG-053 | Q-DEM001-31, 38, 40 | Modifiée : 21 h, tâches planifiées et tâches avec temps saisi (Q18.5 c) ; v0.4 : heure de Paris (DEC-012, RG-053) | Lot « Rappels » |
| US-033 | Répondre aux questions de bilan du soir | **En tant qu'**utilisateur, **je veux** que mon rappel du soir me pose deux questions (ce qui s'est bien passé aujourd'hui, ce que j'aurais aimé faire autrement) et pouvoir y répondre, **afin de** prendre du recul sur ma journée. | RG-038, RG-039, RG-013 | Q-DEM002-1, 2, 3 | Nouvelle (DEM-002) ; v0.4 : bilan accessible avant l'heure du rappel du soir et le lendemain pour la veille (Q-ERG-04) | Lot « Rappels » |
| US-034 | *(conditionnelle)* Consulter le journal de mes bilans | **En tant qu'**utilisateur, **je veux** relire mes réponses aux questions de bilan, jour par jour, **afin de** repérer ce qui marche et ce que je veux changer. | RG-039 | Q-DEM002-3 | Nouvelle, conditionnelle (Q-DEM002-1 et 3) (DEM-002) | Lot « Rappels » |
| US-035 | Découvrir un fun fact scientifique dans mon rappel du matin | **En tant qu'**utilisateur, **je veux** que mon rappel du matin présente un fun fact, tiré d'une liste de 100 de façon que chacun apparaisse aussi souvent que les autres, **afin de** commencer ma journée sur une note stimulante. | RG-040, RG-041, RG-042, RG-012 | Q-DEM002-4, 6, 7 | Nouvelle (DEM-002) ; v0.4 : fun fact aussi affiché dans l'application, masquable (Q-ERG-02) | Lot « Rappels » |
| US-036 | *(conditionnelle)* Gérer ma liste de fun facts | **En tant qu'**utilisateur, **je veux** ajouter, modifier ou retirer des fun facts, **afin d'**adapter la liste à mes goûts. | RG-041 | Q-DEM002-5 | Nouvelle, conditionnelle (Q-DEM002-5 b) (DEM-002) | Selon Q-DEM002-5 |
| US-029 | Régler les heures de mes rappels | **En tant qu'**utilisateur, **je veux** modifier l'heure de mes rappels du matin et du soir, **afin de** les adapter à mon rythme. | RG-012, RG-013, RG-053 | — | Nouvelle (Q18.1 : horaires modifiables) ; v0.4 : heures exprimées à l'heure de Paris (DEC-012) | Lot « Rappels » |

## EP-07 — Compte, données et accès multi-appareils

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-022 | Se connecter avec mon compte Google | **En tant qu'**utilisateur, **je veux** me connecter à l'application avec mon compte Google, **afin d'**accéder à mes données conservées dans mon propre espace de stockage. | RG-018, RG-019, RG-020, RG-035, RG-043 | Q-DEM001-42 | Nouvelle (Q19.2 « non », Q3 b) ; v0.4 : Q-22 intégrée ; données conservées à la déconnexion (22.3 b) | LOT-001 |
| US-017 | Retrouver mes données sur smartphone et sur PC | **En tant qu'**utilisateur, **je veux** que mes données soient conservées dans mon espace de stockage personnel et que je les retrouve sur mon smartphone comme sur mon PC, **afin de** passer de l'un à l'autre sans ressaisie. | RG-017, RG-018, RG-020, RG-036, RG-044, RG-047* à RG-049*, RG-053, RG-054* | Q-DEM001-39, 41 | Modifiée : stockage personnel, smartphone et PC dès la première version, règle de conflit (Q3, compléments) ; v0.4 : Q-21, 22, 23 intégrées ; limites F1, F14 ; CA-7 « hors ligne inclus » | LOT-001 |
| US-018 | Utiliser l'application sans réseau sur mon smartphone | **En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon smartphone sans réseau, mes modifications étant prises en compte au retour du réseau, **afin de** ne pas dépendre de la couverture réseau. | RG-021, RG-035, RG-036, RG-047* à RG-049* | Q-DEM001-39 | Modifiée : confirmée (Q4.1 c), recentrée sur le smartphone (complément) ; v0.4 : intégrée à LOT-001 (DEC-002) ; fichier détaillé créé | LOT-001 |
| US-031 | *(conditionnelle)* Utiliser l'application sans réseau sur mon PC | **En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon PC sans réseau, **afin d'**avoir le même comportement sur mes deux appareils. | RG-021, RG-036 | Q-DEM001-39 (P1 depuis DEC-002) | Nouvelle, conditionnelle (Q-DEM001-39) ; v0.4 : si Q-39 b), rejoint LOT-001 | Selon Q-DEM001-39 (LOT-001 si b) |

## EP-08 — Planning et agenda Google

| US | Titre | Récit | RG | Q bloquantes | Évolution v0.2 | Lot |
|---|---|---|---|---|---|---|
| US-019 | Tenir compte de mes événements d'agenda dans ma capacité | **En tant qu'**utilisateur, **je veux** que mes événements Google Calendar réduisent le temps disponible du jour, **afin de** ne pas planifier plus que ce que mon agenda permet. | RG-033, RG-011 | Q-DEM001-34 | Confirmée : n'est plus conditionnelle (Q15.1 « oui ») | Lot « Agenda » |
| US-020 | Placer mes tâches planifiées en créneaux dans mon agenda | **En tant qu'**utilisateur, **je veux** que chaque tâche planifiée reçoive un horaire suggéré et apparaisse comme un créneau dans mon agenda Google principal, **afin de** voir mon travail dans mon agenda. | RG-034, RG-006, RG-053 | Q-DEM001-32 | Modifiée : n'est plus conditionnelle ; horaire suggéré, agenda principal (Q15.2, compléments) ; v0.4 : horaires à l'heure de Paris (DEC-012) | Lot « Agenda » |
| US-032 | Prendre en compte un créneau déplacé dans mon agenda | **En tant qu'**utilisateur, **je veux** être notifié dans l'application quand je déplace un créneau de tâche dans Google Calendar, et recevoir le soir une proposition de replanification que je valide ou modifie, **afin que** mon planning reste cohérent avec mon agenda. | RG-037, RG-031, RG-052 | Q-DEM001-33 (en partie répondue), 41 | Nouvelle (compléments Q15.2) ; v0.4 : détection limitée aux moments où l'application est ouverte (F2) ; traitement immédiat possible (Q-ERG-05) ; reproposée chaque jour si non traitée (RG-052) ; en cas de refus, créneau supprimé de l'agenda et tâche déplanifiée (Q-ERG-11 a) | Lot « Agenda » |

## Dépendances entre US

| US | Dépend de | Nature de la dépendance |
|---|---|---|
| US-017 | US-022 | Les données sont dans l'espace de l'utilisateur, accessible après connexion. |
| US-001 | US-022, US-017 | Toute donnée est enregistrée dans l'espace de l'utilisateur. |
| US-023 | US-001 | Un sous-objectif est un objectif. |
| US-002 | US-001 | Le rattachement à un objectif suppose des objectifs ; une tâche sans objectif reste possible. |
| US-024 | US-002 | Une sous-tâche est une tâche. |
| US-003 | US-002, US-001 | La fin d'une tâche et l'atteinte d'un objectif s'appuient sur les tâches et les objectifs. |
| US-025 | US-002, US-003 | L'abandon est un état de tâche, pris en compte dans l'atteinte d'un objectif. |
| US-018 | US-017, US-022 | Le hors ligne complète l'accès multi-appareils ; il suppose une première connexion. |
| US-031 | US-018 | Même comportement que sur le smartphone. |
| US-030 | US-001 | L'importance est un attribut de l'objectif. |
| US-004 | US-002, US-030 | Il faut des tâches pour les prioriser, et l'importance des objectifs est un critère. |
| US-005 | US-022 | Réglage de l'utilisateur. |
| US-006 | US-002, US-005 | Planifier suppose des tâches et une capacité. |
| US-027 | US-004, US-006 | Le planning proposé suit la priorité et la capacité. |
| US-028 | US-006 | Le report porte sur des tâches planifiées. |
| US-008 | US-002 | Le temps passé est saisi sur une tâche. |
| US-009 | US-008 | Le reste à faire est déduit du temps passé. |
| US-010 | US-003, US-002 | La vélocité somme les estimations initiales des tâches terminées. |
| US-026 | US-005, US-008 | La proposition de capacité s'appuie sur le temps réellement passé. |
| US-007 | US-010, US-006 | Le contrôle compare le travail restant à la vélocité. |
| US-011 | US-007 | L'ajustement fait suite à l'alerte. |
| US-012 | US-009, US-006, US-025 | Le backlog dépend du reste à faire, de la planification et de l'abandon. |
| US-013 | US-010 | Sans objet sans vélocité. |
| US-014 | US-022 | L'accès à l'agenda complète la connexion au compte Google. |
| US-015 | US-014, US-006 | Le rappel liste les tâches planifiées. |
| US-016 | US-014, US-008, US-009 | Le rappel liste le temps passé et le reste à faire. |
| US-029 | US-015, US-016 | Réglage des rappels. |
| US-019 | US-014, US-005 | Agenda connecté et capacité. |
| US-020 | US-014, US-006 | Agenda connecté et planification. |
| US-032 | US-020, US-027 | Un créneau existe, et la replanification est une proposition de planning. |
| US-033 | US-016 | Les questions sont posées dans le rappel du soir. |
| US-034 | US-033 | Le journal présente les réponses saisies. |
| US-035 | US-015 | Le fun fact est présenté dans le rappel du matin. La liste des 100 fun facts doit être fournie et validée (Q-DEM002-4) avant la recette. |
| US-036 | US-035 | La gestion porte sur la liste utilisée par le tirage. |

### Enchaînement indicatif des lots (à proposer formellement lors des E2 suivantes)
1. **LOT-001 — Socle et objectifs/tâches** (validé : DEC-002 à DEC-004) : US-022, US-017, US-018, US-001, US-023, US-002, US-024, US-003, US-025 ; US-031 selon Q-DEM001-39.
2. *(Lot « Hors ligne » supprimé : US-018 est intégrée à LOT-001.)*
3. **Priorisation et planification** : US-030, US-004, US-005, US-006, US-027, US-028.
4. **Suivi du temps** : US-008, US-009.
5. **Rappels** : US-014, US-015, US-016, US-029, avec les ajouts de DEM-002 : US-033, US-035, et US-034 et US-036 selon les réponses.
6. **Agenda** : US-019, US-020, US-032.
7. **Vélocité et pilotage** : US-010, US-007, US-011, US-026, US-012, US-013.

## Matrice de traçabilité RG → US

| RG | US |
|---|---|
| RG-001 | US-001, US-002, US-003 |
| RG-002 | US-001, US-007 |
| RG-003 | US-002, US-024, US-007 |
| RG-004 | US-001, US-002, US-011 |
| RG-005 | US-004, US-027 |
| RG-006 | US-006, US-020 |
| RG-007 | US-007, US-011, US-015, US-016 |
| RG-008 | US-008, US-003, US-025 |
| RG-009 | US-009 |
| RG-010 | US-010, US-013 |
| RG-011 | US-005, US-006, US-026, US-027, US-019 |
| RG-012 | US-015, US-029, US-035 |
| RG-013 | US-016, US-029, US-033 |
| RG-014 | US-014, US-015, US-016 |
| RG-015 | US-012 |
| RG-016 | US-013 |
| RG-017 | US-017 |
| RG-018 | US-022, US-017 |
| RG-019 | US-022 |
| RG-020 | US-022, US-017 |
| RG-021 | US-018, US-031, US-017 |
| RG-022 | US-023 |
| RG-023 | US-024, US-002, US-003, US-025 |
| RG-024 | US-001, US-002, US-023, US-024 |
| RG-025 | US-001, US-003, US-023, US-025 |
| RG-026 | US-003 |
| RG-027 | US-025, US-012 |
| RG-028 | US-002, US-024, US-005, US-009 |
| RG-029 | US-002, US-024, US-010 |
| RG-030 | US-030, US-004 |
| RG-031 | US-027, US-032 |
| RG-032 | US-028 |
| RG-033 | US-019 |
| RG-034 | US-020 |
| RG-035 | US-022, US-017, US-018, US-014 |
| RG-036 | US-017, US-018, US-031, US-003 |
| RG-037 | US-032 |
| RG-038 | US-033, US-016 |
| RG-039 | US-033, US-034 |
| RG-040 | US-035, US-015 |
| RG-041 | US-035, US-036 |
| RG-042 | US-035 |
| RG-043 | US-022 |
| RG-044 | US-017 |
| RG-045 | US-001, US-002, US-003, US-023, US-024, US-025 |
| RG-046 | US-001, US-002, US-023, US-024 |
| RG-047* | US-017, US-001, US-002, US-023, US-024 |
| RG-048* | US-017, US-023 |
| RG-049* | US-017, US-003, US-024, US-025 |
| RG-050* | US-001, US-002, US-003, US-023, US-024, US-025 |
| RG-051 | US-004, US-006, US-020 |
| RG-052 | US-007, US-011, US-032 |
| RG-053 | US-001, US-002, US-003, US-017, US-025, US-008, US-015, US-016, US-020, US-028, US-029 |
| RG-054* | US-017, US-001, US-002, US-003, US-025 |

### Pourquoi DEM-002 n'entre pas dans LOT-001
Selon Q-DEM001-1, seule la capacité « objectifs et tâches » est indispensable à la première version ; les rappels (Q-DEM001-1 e) ne le sont pas. Les US-033 à US-036 enrichissent les rappels du matin et du soir (US-015, US-016), qui ne sont pas encore livrés : elles ne peuvent pas être recettées sans eux. Elles rejoignent donc le lot « Rappels », où elles partagent les mêmes écrans et le même canal (l'agenda Google). Les y ajouter ne retarde pas LOT-001.


## Notes pour les lots ultérieurs (avis de l'architecte, DAT §8)

> Ajoutées en v0.4. Ces points ne concernent pas LOT-001. Ils seront traités dans l'analyse d'écart du lot concerné ; ils ne sont pas tranchés ici.

| Point | Objet | US concernées | Note |
|---|---|---|---|
| F2 | Détection d'un créneau déplacé dans Google Calendar | US-032 | Sans serveur (DEC-007), le déplacement n'est détecté qu'à l'ouverture de l'application et pendant son utilisation ; une détection en arrière-plan sur le smartphone (environ toutes les heures) est envisagée par l'architecte. RG-037 déjà reformulée ; confirmation du délai : Q-DEM001-41. |
| F4 | Contenu du rappel du matin | US-015 | Une modification faite sans réseau et non synchronisée avant 8 h ne figure pas dans le rappel. Cohérent avec « pas de mise à jour après l'heure » (Q-DEM001-18.4) ; à préciser dans les critères d'acceptation. |
| F5 | Report automatique | US-028 | Sans appareil actif, le créneau n'est pas déplacé à minuit : le report est appliqué au plus tard à la première ouverture de l'application du jour. À préciser dans les critères d'acceptation. |
| F6 | Notification de secours de l'application (Q-DEM001-38) | US-014, US-015, US-016 | Possible sur le smartphone seulement ; impossible sur le PC sans serveur. Recommandation de l'architecte : Q-38 b) limitée au smartphone. |
| F7 | Équité des fun facts (RG-042) | US-035 | Équité définie sur les attributions quotidiennes (un jour sans rappel consomme son fun fact), exacte par cycle de 100 jours. Origine et licence des fun facts à préciser (Q-DEM002-4). |
| F8 | Réponses aux questions du soir (RG-039) | US-033 | Un événement Google Calendar ne permet pas de répondre : questions dans le rappel, avec un lien vers l'écran de bilan de l'application (cohérent avec la recommandation Q-DEM002-1 a). |
| F11 | Horizon du planning proposé (Q-DEM001-36.2) | US-027 | L'architecte soutient la recommandation N = 7 jours. |
| A-F3 | Date d'une réponse au bilan donnée après minuit | US-033 | Proposition de l'architecte : rattachement à la date du rappel. **Non tranché**, à soumettre au commanditaire avec le lot « Rappels ». |
| A-F5 | Fun fact affiché dans l'application | US-035 | **Non tranché** (modalités d'affichage ; la réponse Q-ERG-02 retient l'affichage et le masquage). À traiter avec le lot « Rappels ». |
