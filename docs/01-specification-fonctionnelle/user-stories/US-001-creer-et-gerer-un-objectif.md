# US-001 — Créer et gérer un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer un objectif, avec ou sans délai, **afin de** formaliser ce que je cherche à atteindre.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-047, RG-050) sont soumis à la validation de cette règle.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 : le délai d'un objectif devient facultatif (Q-DEM001-5.1 : « non ») ; l'état « atteint » est calculé (Q-DEM001-5.4 a).
- **Précisé en v0.4** :
  - un objectif sans tâche non abandonnée ni sous-objectif est « à décliner en tâches » (Q-DEM001-26.3 a) ;
  - un délai déjà dépassé peut être saisi, et l'objectif est aussitôt signalé en retard (Q-DEM001-28.4 et 28.5 a) ;
  - la suppression est définitive ; les tâches sont détachées et les sous-objectifs deviennent principaux (Q-DEM001-29.1, 29.2, 29.4).
- **Proposé en v0.4** (à valider en E6) : la suppression l'emporte sur une modification concurrente faite sur l'autre appareil (RG-047, F12) ; historique des événements (RG-050, F10).
- **Non inclus ici** : l'importance d'un objectif (RG-030), reportée avec la priorisation (US-030) ; les sous-objectifs (US-023).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : un objectif peut regrouper plusieurs tâches.
- RG-002 : délai facultatif, date sans heure ; délai dépassé accepté.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte quand le délai d'une tâche est postérieur à celui de l'objectif.
- RG-025 : état calculé (en cours, atteint, à décliner en tâches).
- RG-045 : objectif « en retard ».
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 (proposée) : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-046 : suppression.
- RG-047 (proposée) : suppression concurrente d'une modification.
- RG-050 (proposée) : historique.

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée un objectif en saisissant un intitulé non vide **(P)**, une description facultative **(P)** et, s'il le souhaite, un délai, qui est une date sans heure (RG-002).
2. **CA-2** — Un objectif peut être enregistré sans délai. Il est alors affiché avec la mention « sans délai » **(P)**.
3. **CA-3** — La liste des objectifs affiche, pour chacun : l'intitulé ; le délai ou la mention « sans délai » ; l'état (« en cours », « atteint » ou « à décliner en tâches ») ; l'indication « en retard » le cas échéant ; le nombre de tâches terminées sur le nombre de tâches non abandonnées qui lui sont directement rattachées, sans compter les sous-tâches **(P)**.
4. **CA-4** — Le détail d'un objectif affiche ses informations, la liste de ses tâches et celle de ses sous-objectifs (US-023).
5. **CA-5** — L'utilisateur peut modifier l'intitulé, la description et le délai, ainsi qu'ajouter ou retirer un délai, à tout moment (RG-004).
6. **CA-6** — Quand le délai de l'objectif est modifié, ajouté ou retiré, les alertes RG-024 de ses tâches sont recalculées :
   - une tâche dont le délai devient postérieur à celui de l'objectif affiche l'alerte ;
   - l'alerte disparaît si le délai de l'objectif est retiré ou repoussé au-delà de celui de la tâche.
7. **CA-7** — Un délai déjà dépassé est accepté à la saisie ; l'objectif est aussitôt signalé « en retard ». Un objectif est « en retard » quand son délai est antérieur à la journée en cours et qu'il n'est pas atteint. Il ne l'est plus dès qu'il est atteint, ou que son délai est retiré ou reporté à aujourd'hui ou plus tard (RG-045).
8. **CA-8** — L'état d'un objectif n'est jamais saisi par l'utilisateur. Il est calculé selon RG-025 (voir US-003). Un objectif qui n'a ni tâche non abandonnée ni sous-objectif est affiché « à décliner en tâches ».
9. **CA-9** — La suppression d'un objectif demande une confirmation, puis elle est définitive (RG-046) :
   - ses tâches sont conservées et détachées de lui ; celles qui n'ont plus aucun objectif deviennent des tâches sans objectif ;
   - ses sous-objectifs deviennent des objectifs principaux ;
   - le message de confirmation indique le nombre de tâches détachées et de sous-objectifs concernés **(P)**.
10. **CA-10** — *(RG-047, proposée)* Si l'objectif est supprimé sur un appareil et modifié sur l'autre avant qu'ils n'aient échangé leurs modifications, il reste supprimé sur les deux appareils, et l'utilisateur est informé des modifications écartées. Une tâche rattachée entre-temps à cet objectif sur l'autre appareil en est détachée ; un sous-objectif créé entre-temps sous lui devient objectif principal.
11. **CA-11** — *(RG-050, proposée)* La création d'un objectif, la modification de son délai et sa suppression sont conservées dans l'historique, avec la journée et les valeurs avant et après. Cet historique n'est pas affiché au lot 1.

## Cas limites et cas d'erreur
- Intitulé vide, ou composé uniquement d'espaces : l'enregistrement est refusé, avec un message qui l'explique **(P)**.
- Deux objectifs portant le même intitulé : c'est autorisé **(P)**.
- Délai égal à la journée en cours : l'objectif n'est pas en retard.
- Objectif dont toutes les tâches sont abandonnées et qui n'a pas de sous-objectif : « à décliner en tâches » (RG-025).
- Suppression du seul objectif d'une tâche : la tâche devient une tâche sans objectif.
- Modification du même objectif sur deux appareils : RG-036 (US-017).
- Utilisateur en voyage hors du fuseau de Paris : l'indication « en retard » suit la journée de Paris (RG-008, RG-053) ; par exemple, à New York en hiver, un objectif dont le délai est la date du jour à New York est signalé en retard dès 18 h, heure locale, puisqu'il est alors minuit à Paris. Le délai lui-même, date sans heure, ne change jamais de jour (RG-053). Les deux appareils affichent toujours la même indication ; la mention « heure de Paris » est proposée (RG-054).

## Hors périmètre
- Importance d'un objectif (US-030).
- Sous-objectifs (US-023).
- Atteinte déclarée manuellement, ou mesurée par une valeur cible chiffrée (exclues, Q-DEM001-5.4 a).
- Corbeille et restauration d'un objectif supprimé (exclues, Q-DEM001-29.4 a).
- Contrôle de la tenue du délai selon la vélocité (US-007).
- Affichage de l'historique (lots « Vélocité et pilotage »).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-001-creer-et-gerer-un-objectif.feature`.

## Questions ouvertes
Aucune. Les critères (P) et ceux qui appliquent une règle proposée (CA-10, CA-11) sont soumis à la validation du commanditaire en E6.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5 et 6. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-26, 28 et 29 intégrées (CA-3, CA-7, CA-8, CA-9) ; règles proposées RG-047 et RG-050 (CA-10, CA-11) ; DEC-012 (fuseau de référence Europe/Paris). |
