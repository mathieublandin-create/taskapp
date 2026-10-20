# US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** déclarer une tâche terminée, pouvoir la rouvrir, et voir si chacun de mes objectifs est atteint, **afin de** savoir ce qui est accompli.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - une tâche n'est terminée que sur déclaration de l'utilisateur, jamais automatiquement (Q-DEM001-7.1 a) ;
  - une tâche terminée peut être rouverte (Q-DEM001-7.2) ;
  - un objectif est atteint quand toutes ses tâches sont terminées (Q-DEM001-5.4 a).
- **Dépendance retirée** : en v0.1, US-003 dépendait du reste à faire (US-009). La fin d'une tâche étant déclarative, cette dépendance disparaît.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-026 : fin sur déclaration, réouverture possible.
- RG-025 : objectif atteint quand toutes ses tâches sont terminées, état calculé.
- RG-001 : une tâche peut avoir plusieurs objectifs.

## Critères d'acceptation
1. **CA-1** — L'utilisateur déclare une tâche « à faire » terminée. Elle passe à l'état « terminée », et la date du jour, selon l'heure locale de l'appareil, est conservée comme date de fin (RG-026, RG-008 pour la notion de journée).
2. **CA-2** — Aucune tâche ne passe à l'état « terminée » sans une action explicite de l'utilisateur.
3. **CA-3** — L'utilisateur rouvre une tâche terminée. Elle repasse à l'état « à faire » et n'a plus de date de fin affichée. La date de fin précédente est conservée dans l'historique de la tâche, pour les besoins de la vélocité (Q-DEM001-30.5) **(P)**.
4. **CA-4** — Un objectif est « atteint » quand toutes ses tâches sont terminées, et « en cours » sinon (RG-025). Le traitement des sous-objectifs, des tâches abandonnées et des objectifs sans tâche suit Q-DEM001-26.
5. **CA-5** — L'état d'un objectif est recalculé dès que l'une de ses tâches est terminée, rouverte, ajoutée, retirée ou supprimée.
   - Exemple : un objectif atteint repasse « en cours » quand l'une de ses tâches est rouverte, ou quand une nouvelle tâche lui est rattachée.
6. **CA-6** — Une tâche rattachée à plusieurs objectifs, une fois terminée, compte comme terminée pour chacun d'eux (sous réserve de Q-DEM001-26.4).
7. **CA-7** — Les listes permettent de distinguer, ou de filtrer, les tâches « à faire » et « terminées » **(P)**.
8. **CA-8** — La fin d'une tâche qui a des sous-tâches suit Q-DEM001-25.6 et 25.7.

## Cas limites et cas d'erreur
- Déclarer terminée une tâche déjà terminée : l'action n'est pas proposée.
- Tâche terminée sur un appareil et modifiée sur l'autre : RG-036 (US-017).
- Tâche terminée dont le délai est dépassé : elle est terminée normalement ; aucune alerte de retard ne s'affiche plus **(P)**.
- Objectif sans délai : son atteinte se calcule de la même façon.

## Hors périmètre
- Fin automatique quand le reste à faire atteint zéro (exclue, Q-DEM001-7.1 a).
- Atteinte d'un objectif déclarée manuellement (exclue).
- Calcul et affichage de la vélocité (US-010).
- Abandon d'une tâche (US-025).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.feature`.

## Questions ouvertes
- **Q-DEM001-26 (P1)** : atteinte d'un objectif qui a des sous-objectifs, des tâches abandonnées, aucune tâche ; tâche rattachée à plusieurs objectifs.
- **Q-DEM001-25 (P1)** : fin d'une tâche qui a des sous-tâches (points 6 et 7).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5.4 et 7. |
