# US-024 — Décomposer une tâche en sous-tâches
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** découper une tâche en sous-tâches, **afin de** suivre plus finement un travail important.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-6.1 d).
- **Tension** avec Q-DEM001-12.1 : la vélocité somme les estimations initiales des tâches terminées. Si une tâche et ses sous-tâches portent chacune une estimation, le même travail risque d'être compté deux fois (Q-DEM001-25.3).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-023 : une tâche peut comporter des sous-tâches.
- RG-003 : délai obligatoire, s'il s'applique aux sous-tâches (Q-DEM001-25.2).
- RG-028 : heures et minutes, pas de 30 min.
- RG-026 : fin sur déclaration (cas de la tâche parente : Q-DEM001-25.6 et 25.7).

## Critères d'acceptation
1. **CA-1** — Depuis le détail d'une tâche, l'utilisateur crée une sous-tâche, rattachée à cette tâche.
2. **CA-2** — Les informations obligatoires d'une sous-tâche (délai, estimation) suivent Q-DEM001-25.2.
3. **CA-3** — Le détail d'une tâche affiche ses sous-tâches, avec leur intitulé, leur délai, leur estimation et leur état, ainsi que le nombre de sous-tâches terminées sur le total **(P)**.
4. **CA-4** — Le nombre de niveaux de sous-tâches est limité selon Q-DEM001-25.1. Au-delà, l'action de création n'est pas proposée.
5. **CA-5** — L'estimation d'une tâche qui a des sous-tâches est déterminée selon Q-DEM001-25.3. Elle est mise à jour à chaque ajout, modification ou suppression d'une sous-tâche si elle est calculée.
6. **CA-6** — Un délai de sous-tâche postérieur à celui de sa tâche parente est traité selon Q-DEM001-25.4.
7. **CA-7** — Les objectifs d'une sous-tâche suivent Q-DEM001-25.5.
8. **CA-8** — La fin de la tâche parente suit Q-DEM001-25.6 et 25.7 (voir US-003).

## Cas limites et cas d'erreur
- Suppression d'une tâche qui a des sous-tâches : Q-DEM001-29.3.
- Suppression de la dernière sous-tâche : la tâche redevient une tâche simple. Si son estimation était calculée, la règle à appliquer découle de Q-DEM001-25.3 et sera précisée après la réponse.
- Ajout d'une sous-tâche à une tâche terminée : la tâche est rouverte **(P)**, sous réserve de Q-DEM001-25.6.
- Ajout d'une sous-tâche à une tâche abandonnée : refusé tant que la tâche n'a pas été reprise **(P)**, sous réserve de Q-DEM001-27.1.

## Hors périmètre
- Transformation d'une tâche existante en sous-tâche d'une autre tâche **(P)**.
- Planification et suivi du temps des sous-tâches (lots ultérieurs).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-024-decomposer-une-tache-en-sous-taches.feature`.

## Questions ouvertes
- **Q-DEM001-25 (P1)** : profondeur, délai et estimation des sous-tâches, estimation de la tâche parente, délai postérieur, objectifs, fin de la tâche parente.
- **Q-DEM001-29 (P1)** : suppression d'une tâche qui a des sous-tâches.
- **Q-DEM001-27 (P1)** : reprise d'une tâche abandonnée (cas limite).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-6.1 d). |
