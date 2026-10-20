# US-025 — Abandonner une tâche
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** abandonner une tâche que je ne réaliserai pas, sans la supprimer, **afin de** garder une trace et de ne plus la voir parmi mon travail à faire.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-7.3 (« oui »). La sortie du backlog n'a pas été précisée (Q-DEM001-27.3, P2 : sans effet au lot 1, puisque le backlog n'y est pas encore livré).
- **Impact** sur l'atteinte d'un objectif (RG-025, Q-DEM001-26.2).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-027 : une tâche abandonnée n'est ni terminée, ni à faire.
- RG-025 : atteinte d'un objectif (prise en compte de l'abandon : Q-DEM001-26.2).

## Critères d'acceptation
1. **CA-1** — L'utilisateur abandonne une tâche « à faire », après confirmation **(P)**. Elle passe à l'état « abandonnée », et la date du jour est conservée comme date d'abandon **(P)**.
2. **CA-2** — Une tâche abandonnée n'apparaît plus parmi les tâches à faire. Elle reste consultable dans une vue ou un filtre des tâches abandonnées **(P)**.
3. **CA-3** — Une tâche abandonnée n'est pas une tâche terminée : elle n'a pas de date de fin.
4. **CA-4** — L'état des objectifs de la tâche est recalculé selon RG-025 et Q-DEM001-26.2.
5. **CA-5** — La reprise d'une tâche abandonnée suit Q-DEM001-27.1. Si elle est autorisée, la tâche repasse « à faire » et les objectifs concernés sont recalculés.
6. **CA-6** — L'abandon d'une tâche qui a des sous-tâches suit Q-DEM001-27.2.

## Cas limites et cas d'erreur
- Abandonner une tâche terminée : l'action n'est pas proposée ; il faut d'abord la rouvrir **(P)**.
- Abandonner la dernière tâche non terminée d'un objectif : l'objectif est recalculé (Q-DEM001-26.2 et 26.3).
- Abandon sur un appareil, modification sur l'autre : RG-036 (US-017).

## Hors périmètre
- Effet de l'abandon sur le backlog (US-012, Q-DEM001-27.3).
- Abandon d'un objectif entier.

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-025-abandonner-une-tache.feature`.

## Questions ouvertes
- **Q-DEM001-27 (P1, points 1 et 2)** : reprise d'une tâche abandonnée ; abandon d'une tâche qui a des sous-tâches.
- **Q-DEM001-26 (P1)** : prise en compte des tâches abandonnées dans l'atteinte d'un objectif.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-7.3. |
