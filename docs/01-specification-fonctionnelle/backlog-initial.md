# Backlog initial — DEM-001

> Version 0.1 du 2026-10-20 (Pepper, E1). Ce découpage est **provisoire**. Les fichiers d'US détaillés (`user-stories/US-xxx-<titre>.md`) seront rédigés après réception des réponses aux [questions ouvertes](questions-ouvertes.md). Toutes les US sont au statut **En analyse**.
>
> Persona unique à ce stade : **l'utilisateur** (le commanditaire). Voir le [cahier des charges](cahier-des-charges.md), section 5.

## Légende
- **US conditionnelle** : l'US n'existe que si la réponse à la question indiquée la fait entrer dans le périmètre. Sinon, elle sera retirée.
- **Q bloquantes** : questions dont la réponse est nécessaire pour rédiger les critères d'acceptation de l'US.
- La question Q-DEM001-1 (priorités du MVP) conditionne la constitution des lots (E2) pour toutes les US. Elle n'est pas répétée ligne par ligne.

## Vue d'ensemble des épopées

| Épopée | Titre | US |
|---|---|---|
| EP-01 | Objectifs et tâches | US-001, US-002, US-003, US-021 |
| EP-02 | Priorisation | US-004 |
| EP-03 | Planification et capacité | US-005, US-006, US-007, US-019, US-020 |
| EP-04 | Suivi du temps | US-008, US-009 |
| EP-05 | Vélocité et pilotage | US-010, US-011, US-012, US-013 |
| EP-06 | Rappels quotidiens via Google Calendar | US-014, US-015, US-016 |
| EP-07 | Accès multi-appareils | US-017, US-018 |

## EP-01 — Objectifs et tâches

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-001 | Créer et gérer un objectif | **En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer un objectif doté d'un délai, **afin de** formaliser ce que je cherche à atteindre et pour quand. | RG-001, RG-002, RG-004 | Q-DEM001-5, Q-DEM001-6 |
| US-002 | Décliner un objectif en tâches | **En tant qu'**utilisateur, **je veux** créer, modifier et supprimer les tâches d'un objectif, avec leur délai et leur estimation, **afin de** transformer chaque objectif en travail concret. | RG-001, RG-003, RG-004, RG-009 | Q-DEM001-5, Q-DEM001-6, Q-DEM001-9 |
| US-003 | Terminer une tâche et suivre l'atteinte d'un objectif | **En tant qu'**utilisateur, **je veux** marquer une tâche comme terminée et voir où en est chacun de mes objectifs, **afin de** savoir ce qui est accompli et ce qui reste à atteindre. | RG-001, RG-009 | Q-DEM001-5, Q-DEM001-7, Q-DEM001-11 |
| US-021 | *(conditionnelle)* Gérer des tâches récurrentes | **En tant qu'**utilisateur, **je veux** définir une tâche qui se répète selon une fréquence, **afin de** ne pas la recréer à chaque occurrence. | à créer selon la réponse | Q-DEM001-8 |

## EP-02 — Priorisation

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-004 | Prioriser les tâches à réaliser | **En tant qu'**utilisateur, **je veux** voir mes tâches à réaliser classées par ordre de priorité, **afin de** savoir sur quoi travailler en premier. | RG-005 | Q-DEM001-16, Q-DEM001-6 |

## EP-03 — Planification et capacité

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-005 | Définir et ré-estimer ma capacité quotidienne | **En tant qu'**utilisateur, **je veux** indiquer le temps que je prévois de consacrer chaque jour à mes tâches et le modifier quand il le faut, **afin de** planifier sur la base d'une disponibilité réaliste. | RG-011 | Q-DEM001-9, Q-DEM001-14 |
| US-006 | Planifier mes tâches | **En tant qu'**utilisateur, **je veux** affecter mes tâches à des journées, dans la limite de ma capacité quotidienne, **afin de** savoir ce que je dois faire chaque jour. | RG-006, RG-011 | Q-DEM001-9, Q-DEM001-13, Q-DEM001-14, Q-DEM001-16 |
| US-007 | Vérifier que ma planification permet de tenir mes délais | **En tant qu'**utilisateur, **je veux** être averti lorsque ma planification ne permet pas de respecter le délai d'une tâche ou d'un objectif, **afin de** réagir avant qu'il ne soit trop tard. | RG-002, RG-003, RG-007 | Q-DEM001-5, Q-DEM001-13, Q-DEM001-17 |
| US-019 | *(conditionnelle)* Tenir compte de mes événements d'agenda dans ma capacité | **En tant qu'**utilisateur, **je veux** que mes événements Google Calendar réduisent la capacité disponible du jour, **afin de** ne pas planifier plus que ce que mon agenda permet. | RG-011 | Q-DEM001-15, Q-DEM001-14 |
| US-020 | *(conditionnelle)* Réserver dans mon agenda des créneaux pour mes tâches planifiées | **En tant qu'**utilisateur, **je veux** que mes tâches planifiées apparaissent comme des créneaux dans Google Calendar, **afin de** bloquer le temps correspondant dans mon agenda. | RG-006 | Q-DEM001-15, Q-DEM001-13 |

## EP-04 — Suivi du temps

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-008 | Saisir le temps passé sur une tâche | **En tant qu'**utilisateur, **je veux** enregistrer le temps que j'ai passé sur une tâche au cours d'une journée, **afin de** suivre mon travail réel. | RG-008 | Q-DEM001-9, Q-DEM001-10 |
| US-009 | Mettre à jour le reste à faire d'une tâche | **En tant qu'**utilisateur, **je veux** connaître et, si besoin, corriger le reste à faire de chaque tâche, **afin de** disposer d'une vision fiable du travail restant. | RG-009 | Q-DEM001-7, Q-DEM001-9, Q-DEM001-11 |

## EP-05 — Vélocité et pilotage

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-010 | Consulter ma vélocité | **En tant qu'**utilisateur, **je veux** connaître ma vélocité calculée à partir de mes temps passés, **afin de** mesurer mon rythme de travail réel. | RG-010 | Q-DEM001-9, Q-DEM001-12 |
| US-011 | Ajuster mes objectifs et délais à partir de ma vélocité | **En tant qu'**utilisateur, **je veux** voir l'effet de ma vélocité sur la tenue de mes délais et pouvoir ajuster mes objectifs et les délais de mes tâches, **afin de** garder un planning réaliste. | RG-004, RG-007, RG-010 | Q-DEM001-12, Q-DEM001-17 |
| US-012 | Visualiser l'évolution du backlog | **En tant qu'**utilisateur, **je veux** voir comment mon backlog évolue dans le temps, **afin de** savoir si le travail restant diminue au rythme attendu. | RG-015 | Q-DEM001-20, Q-DEM001-11 |
| US-013 | Visualiser l'évolution de la vélocité | **En tant qu'**utilisateur, **je veux** voir comment ma vélocité évolue dans le temps, **afin de** repérer les variations de mon rythme de travail. | RG-016 | Q-DEM001-12, Q-DEM001-20 |

## EP-06 — Rappels quotidiens via Google Calendar

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-014 | Connecter et déconnecter mon agenda Google | **En tant qu'**utilisateur, **je veux** autoriser l'application à utiliser mon agenda Google, et pouvoir retirer cette autorisation, **afin de** recevoir mes rappels dans mon agenda tout en gardant la maîtrise de mon compte. | RG-014 | Q-DEM001-18, Q-DEM001-19 |
| US-015 | Recevoir le rappel du matin | **En tant qu'**utilisateur, **je veux** recevoir chaque matin, via Google Calendar, la liste des tâches planifiées dans la journée, **afin de** démarrer ma journée en sachant quoi faire. | RG-012, RG-014 | Q-DEM001-13, Q-DEM001-18, Q-DEM001-19 |
| US-016 | Recevoir le rappel du soir | **En tant qu'**utilisateur, **je veux** recevoir chaque soir, via Google Calendar, la liste du temps passé sur chaque tâche dans la journée et de son reste à faire, **afin de** faire le bilan de ma journée. | RG-013, RG-014 | Q-DEM001-10, Q-DEM001-11, Q-DEM001-18, Q-DEM001-19 |

## EP-07 — Accès multi-appareils

| US | Titre | Récit | RG | Q bloquantes |
|---|---|---|---|---|
| US-017 | Retrouver mes données sur smartphone et sur PC | **En tant qu'**utilisateur, **je veux** accéder à mes données de façon sécurisée depuis mon smartphone comme depuis mon PC, **afin de** retrouver sur l'un ce que j'ai saisi sur l'autre. | RG-017 | Q-DEM001-2, Q-DEM001-3 |
| US-018 | *(conditionnelle)* Utiliser l'application sans connexion | **En tant qu'**utilisateur, **je veux** consulter et saisir mes données sans connexion réseau, avec une prise en compte de mes modifications au retour de la connexion, **afin de** ne pas dépendre du réseau. | RG-017 | Q-DEM001-4, Q-DEM001-3 |

## Dépendances entre US

| US | Dépend de | Nature de la dépendance |
|---|---|---|
| US-002 | US-001 | Une tâche est dérivée d'un objectif. |
| US-003 | US-002, US-009 | La fin d'une tâche et l'atteinte d'un objectif s'appuient sur les tâches et sur leur reste à faire. |
| US-004 | US-002 | Il faut des tâches pour les prioriser. |
| US-006 | US-002, US-005 | Planifier suppose des tâches et une capacité quotidienne. US-004 aussi si la planification suit la priorité (Q-DEM001-13). |
| US-007 | US-005, US-006 | Le contrôle compare la planification, la capacité et les délais. |
| US-008 | US-002 | Le temps passé est saisi sur une tâche. |
| US-009 | US-002, US-008 | Le reste à faire peut être déduit du temps passé (Q-DEM001-11). |
| US-010 | US-008 | La vélocité est calculée à partir des temps passés. |
| US-011 | US-007, US-010 | L'ajustement s'appuie sur la vélocité et sur le contrôle des délais. |
| US-012 | US-009 | Le backlog se mesure à partir des restes à faire ou des tâches non terminées (Q-DEM001-20). |
| US-013 | US-010 | Sans objet sans vélocité. |
| US-015 | US-006, US-014 | Le rappel du matin liste les tâches planifiées, via l'agenda connecté. |
| US-016 | US-008, US-009, US-014 | Le rappel du soir liste le temps passé et le reste à faire, via l'agenda connecté. |
| US-017 | — | US transverse : conditionne l'usage réel de toutes les autres US sur deux appareils. À traiter dès le premier lot. |
| US-018 | US-017 | Le hors ligne complète l'accès multi-appareils. |
| US-019 | US-005, US-014 | Elle suppose une capacité quotidienne et un agenda connecté. |
| US-020 | US-006, US-014 | Elle suppose une planification et un agenda connecté. |
| US-021 | US-002 | Une tâche récurrente est une variante de tâche. |

### Chemin critique proposé (indicatif, avant réponses du commanditaire)
US-017 → US-001 → US-002 → US-005 → US-006 → US-008 → US-009 → US-014 → US-015 / US-016 → US-007 → US-004 → US-010 → US-011 → US-012 / US-013.

## Matrice de traçabilité RG → US

| RG | US |
|---|---|
| RG-001 | US-001, US-002, US-003 |
| RG-002 | US-001, US-007 |
| RG-003 | US-002, US-007 |
| RG-004 | US-001, US-002, US-011 |
| RG-005 | US-004 |
| RG-006 | US-006, US-020 |
| RG-007 | US-007, US-011 |
| RG-008 | US-008 |
| RG-009 | US-002, US-003, US-009 |
| RG-010 | US-010, US-011 |
| RG-011 | US-005, US-006, US-019 |
| RG-012 | US-015 |
| RG-013 | US-016 |
| RG-014 | US-014, US-015, US-016 |
| RG-015 | US-012 |
| RG-016 | US-013 |
| RG-017 | US-017, US-018 |

US-021 n'a pas encore de RG : elle sera créée si la réponse à Q-DEM001-8 la fait entrer dans le périmètre.
