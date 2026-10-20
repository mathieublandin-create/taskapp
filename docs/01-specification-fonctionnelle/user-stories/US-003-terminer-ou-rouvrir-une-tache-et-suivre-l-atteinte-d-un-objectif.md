# US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** déclarer une tâche terminée, pouvoir la rouvrir, et voir si chacun de mes objectifs est atteint, **afin de** savoir ce qui est accompli.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-049, RG-050) sont soumis à la validation de cette règle.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - une tâche n'est terminée que sur déclaration de l'utilisateur, jamais automatiquement (Q-DEM001-7.1 a) ;
  - une tâche terminée peut être rouverte (Q-DEM001-7.2) ;
  - un objectif est atteint quand toutes ses tâches sont terminées (Q-DEM001-5.4 a).
- **Précisé en v0.4** : atteinte d'un objectif qui a des sous-objectifs ou des tâches abandonnées, objectif « à décliner en tâches », tâche rattachée à plusieurs objectifs (Q-DEM001-26) ; fin d'une tâche parente (Q-DEM001-25.6 et 25.7).
- **Proposé en v0.4** (à valider en E6) : incohérence d'état après fusion signalée sans correction (RG-049, F12) ; historique (RG-050).
- **Journée** : la date de fin est celle de la journée dans le fuseau de référence, Europe/Paris (RG-008 modifiée et RG-053, DEC-012).
- **Dépendance retirée** : en v0.1, US-003 dépendait du reste à faire (US-009). La fin d'une tâche étant déclarative, cette dépendance disparaît.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-026 : fin sur déclaration, réouverture possible.
- RG-023 : fin d'une tâche parente.
- RG-025 : atteinte d'un objectif, état calculé.
- RG-001 : une tâche peut avoir plusieurs objectifs.
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris.
- RG-045 : une tâche terminée n'est pas en retard.
- RG-049, RG-050 (proposées).

## Critères d'acceptation
1. **CA-1** — L'utilisateur déclare une tâche « à faire » terminée. Elle passe à l'état « terminée », et la date de la journée en cours, dans le fuseau de référence Europe/Paris, est conservée comme date de fin (RG-026, RG-008, RG-053).
   - Exemple : l'utilisateur, à New York, termine une tâche le 10 mars à 23 h, heure locale (le 11 mars à 4 h à Paris) : la date de fin est le 11 mars.
2. **CA-2** — Aucune tâche ne passe à l'état « terminée » sans une action explicite de l'utilisateur, y compris une tâche parente dont toutes les sous-tâches sont terminées.
3. **CA-3** — L'utilisateur rouvre une tâche terminée. Elle repasse à l'état « à faire » et n'a plus de date de fin affichée. La date de fin précédente est conservée dans l'historique (RG-050).
4. **CA-4** — Un objectif est « atteint » quand toutes ses tâches non abandonnées sont terminées et que tous ses sous-objectifs sont atteints. Les tâches abandonnées sont ignorées. Un objectif qui n'a ni tâche non abandonnée ni sous-objectif est « à décliner en tâches ». Dans les autres cas, il est « en cours » (RG-025).
   - Exemple 1 : un objectif a trois tâches : deux terminées, une abandonnée. Il est atteint.
   - Exemple 2 : un objectif a une seule tâche, abandonnée, et aucun sous-objectif. Il est « à décliner en tâches ».
5. **CA-5** — Pour l'atteinte, les sous-tâches des tâches d'un objectif comptent comme ses tâches : l'objectif n'est pas atteint tant qu'une de ces sous-tâches est à faire **(P)**.
6. **CA-6** — L'état d'un objectif est recalculé dès que l'une de ses tâches est terminée, rouverte, ajoutée, retirée, abandonnée, reprise ou supprimée, ou qu'un de ses sous-objectifs change d'état.
   - Exemple : un objectif atteint repasse « en cours » quand l'une de ses tâches est rouverte, ou quand une nouvelle tâche à faire lui est rattachée.
7. **CA-7** — Une tâche rattachée à plusieurs objectifs, une fois terminée, compte comme terminée pour chacun d'eux.
8. **CA-8** — Une tâche parente ne peut pas être déclarée terminée tant qu'il lui reste une sous-tâche ni terminée ni abandonnée ; l'action est refusée, avec un message qui indique le nombre de sous-tâches restantes (RG-023).
9. **CA-9** — Rouvrir une sous-tâche dont la tâche parente est terminée rouvre aussi la tâche parente, après confirmation **(P)**.
10. **CA-10** — Une tâche terminée n'est pas « en retard », même si elle a été terminée après son délai. Rouverte, elle redevient « en retard » si son délai est antérieur à la journée en cours (RG-045).
11. **CA-11** — Les listes permettent de distinguer, ou de filtrer, les tâches « à faire » et « terminées » **(P)**.
12. **CA-12** — *(RG-049, proposée)* Si, après échange des modifications des deux appareils, une tâche parente est terminée alors qu'une de ses sous-tâches est à faire, l'application le signale sur la tâche sans rien corriger automatiquement. Tant que l'incohérence persiste, les objectifs de la tâche ne sont pas atteints (CA-5). Elle est résolue quand la sous-tâche est terminée ou abandonnée, ou quand la tâche parente est rouverte.
13. **CA-13** — *(RG-050, proposée)* La fin et la réouverture d'une tâche sont conservées dans l'historique, avec la journée concernée.

## Cas limites et cas d'erreur
- Déclarer terminée une tâche déjà terminée : l'action n'est pas proposée.
- Tâche terminée sur un appareil et modifiée sur l'autre : RG-036 (US-017).
- Tâche terminée sur un appareil et abandonnée sur l'autre, avant échange : l'état le plus récent l'emporte (RG-036), et l'autre est signalé comme valeur écartée **(P, à confirmer avec RG-036)**.
- Objectif sans délai : son atteinte se calcule de la même façon.
- Passage à l'heure d'été ou d'hiver : la journée reste celle de Paris, de minuit à minuit ; aucune date de fin n'est décalée.

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
Aucune. Les critères (P) et ceux qui appliquent une règle proposée (CA-12, CA-13) sont soumis à la validation du commanditaire en E6.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5.4 et 7. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-25 et 26 intégrées (CA-2, CA-4 à CA-8) ; règles proposées RG-049 et RG-050 (CA-12, CA-13) ; DEC-012 (fuseau de référence Europe/Paris). |
