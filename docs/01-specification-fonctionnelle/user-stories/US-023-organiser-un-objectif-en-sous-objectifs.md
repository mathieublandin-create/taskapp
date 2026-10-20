# US-023 — Organiser un objectif en sous-objectifs
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** décomposer un objectif en sous-objectifs, **afin de** structurer les objectifs ambitieux.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-6.1 d), qui retient les sous-objectifs et les sous-tâches. La v0.1 ne prévoyait que deux niveaux.
- **Impact** sur la règle d'atteinte d'un objectif (RG-025, Q-DEM001-26).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-022 : un objectif peut comporter des sous-objectifs.
- RG-025 : atteinte d'un objectif (modalités pour les sous-objectifs : Q-DEM001-26.1).
- RG-002, RG-004 et RG-024 s'appliquent aux sous-objectifs, qui sont des objectifs.

## Critères d'acceptation
1. **CA-1** — Depuis le détail d'un objectif, l'utilisateur crée un sous-objectif. Celui-ci a les mêmes informations qu'un objectif (US-001) et est rattaché à cet objectif.
2. **CA-2** — Le détail d'un objectif affiche ses sous-objectifs, avec leur intitulé, leur délai et leur état. La liste des objectifs permet de distinguer les objectifs principaux de leurs sous-objectifs **(P)**.
3. **CA-3** — Le nombre de niveaux de sous-objectifs est limité selon la réponse à Q-DEM001-24.1. Au-delà, l'action de création d'un sous-objectif n'est pas proposée.
4. **CA-4** — Un sous-objectif a un seul objectif parent, ou plusieurs, selon Q-DEM001-24.2.
5. **CA-5** — Un délai de sous-objectif postérieur à celui de son parent est traité selon Q-DEM001-24.3.
6. **CA-6** — Le déplacement d'un sous-objectif sous un autre objectif, ou sa promotion en objectif principal, suit Q-DEM001-24.4.
7. **CA-7** — Un objectif ne peut jamais devenir son propre sous-objectif, ni le sous-objectif de l'un de ses descendants. L'action est refusée avec un message **(P)**.
8. **CA-8** — L'état « atteint » d'un objectif qui a des sous-objectifs est calculé selon RG-025 et Q-DEM001-26.1. Il est mis à jour dès qu'un sous-objectif change d'état.

## Cas limites et cas d'erreur
- Suppression d'un objectif qui a des sous-objectifs : Q-DEM001-29.2.
- Sous-objectif sans délai sous un objectif avec délai, ou l'inverse : aucune alerte, car RG-024 ne s'applique qu'entre deux délais renseignés **(P)**.
- Création d'un sous-objectif au niveau maximal autorisé : voir CA-3.

## Hors périmètre
- Importance d'un sous-objectif (US-030).
- Agrégation des délais ou des estimations au niveau de l'objectif parent.

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature`.

## Questions ouvertes
- **Q-DEM001-24 (P1)** : profondeur, parent unique, délai postérieur, déplacement.
- **Q-DEM001-26 (P1)** : atteinte d'un objectif qui a des sous-objectifs.
- **Q-DEM001-29 (P1)** : suppression d'un objectif qui a des sous-objectifs.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-6.1 d). |
