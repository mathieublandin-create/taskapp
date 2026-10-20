# US-001 — Créer et gérer un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer un objectif, avec ou sans délai, **afin de** formaliser ce que je cherche à atteindre.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 : le délai d'un objectif devient facultatif (Q-DEM001-5.1 : « non ») ; l'état « atteint » est calculé (Q-DEM001-5.4 a).
- **Non inclus ici** : l'importance d'un objectif (RG-030), reportée avec la priorisation (US-030) ; les sous-objectifs (US-023).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : un objectif peut regrouper plusieurs tâches.
- RG-002 : délai facultatif ; s'il est renseigné, c'est une date.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte quand le délai d'une tâche est postérieur à celui de l'objectif.
- RG-025 : objectif atteint quand toutes ses tâches sont terminées (état calculé).

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée un objectif en saisissant un intitulé non vide **(P)**, une description facultative **(P)** et, s'il le souhaite, un délai (RG-002).
2. **CA-2** — Un objectif peut être enregistré sans délai. Il est alors affiché avec la mention « sans délai » **(P)**.
3. **CA-3** — La liste des objectifs affiche, pour chacun : l'intitulé, le délai ou la mention « sans délai », l'état (« en cours » ou « atteint », RG-025) et le nombre de tâches terminées sur le nombre total de tâches **(P)**.
4. **CA-4** — Le détail d'un objectif affiche ses informations et la liste de ses tâches.
5. **CA-5** — L'utilisateur peut modifier l'intitulé, la description et le délai, ainsi qu'ajouter ou retirer un délai, à tout moment (RG-004).
6. **CA-6** — Quand le délai de l'objectif est modifié, ajouté ou retiré, les alertes RG-024 de ses tâches sont recalculées :
   - une tâche dont le délai devient postérieur à celui de l'objectif affiche l'alerte ;
   - l'alerte disparaît si le délai de l'objectif est retiré ou repoussé au-delà de celui de la tâche.
7. **CA-7** — La suppression d'un objectif demande une confirmation. Le sort de ses tâches et de ses sous-objectifs suit la réponse à Q-DEM001-29.
8. **CA-8** — L'état d'un objectif n'est jamais saisi par l'utilisateur. Il est calculé selon RG-025 (voir US-003).

## Cas limites et cas d'erreur
- Intitulé vide, ou composé uniquement d'espaces : l'enregistrement est refusé, avec un message qui l'explique **(P)**.
- Deux objectifs portant le même intitulé : c'est autorisé **(P)**.
- Délai déjà passé à la saisie : Q-DEM001-28.5.
- Objectif sans tâche : son état suit Q-DEM001-26.3.
- Modification du même objectif sur deux appareils : RG-036 (US-017).

## Hors périmètre
- Importance d'un objectif (US-030).
- Sous-objectifs (US-023).
- Atteinte déclarée manuellement, ou mesurée par une valeur cible chiffrée (exclues, Q-DEM001-5.4 a).
- Contrôle de la tenue du délai selon la vélocité (US-007).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-001-creer-et-gerer-un-objectif.feature`.

## Questions ouvertes
- **Q-DEM001-26 (P1)** : état d'un objectif sans tâche ou dont toutes les tâches sont abandonnées.
- **Q-DEM001-28 (P1)** : délai déjà passé à la saisie (point 5).
- **Q-DEM001-29 (P1)** : suppression d'un objectif qui a des tâches ou des sous-objectifs ; caractère définitif.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5 et 6. |
