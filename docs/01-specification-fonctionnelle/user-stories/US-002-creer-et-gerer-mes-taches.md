# US-002 — Créer et gérer mes tâches
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer une tâche, avec son délai et son estimation, et la rattacher à zéro, un ou plusieurs objectifs, **afin de** transformer mes objectifs en travail concret.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - délai obligatoire (Q-DEM001-5.2) ;
  - délai postérieur à celui de l'objectif accepté avec une alerte (Q-DEM001-5.3 b) ;
  - tâche possible sans objectif (Q-DEM001-6.2) ou rattachée à plusieurs objectifs (Q-DEM001-6.3) ;
  - estimation en heures et minutes, au pas de 30 min (Q-DEM001-9) ;
  - estimation initiale conservée pour la vélocité (Q-DEM001-12.1).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : rattachement à zéro, un ou plusieurs objectifs.
- RG-003 : délai obligatoire.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte si le délai de la tâche est postérieur à celui d'un de ses objectifs.
- RG-028 : heures et minutes, pas de 30 min.
- RG-029 : estimation initiale conservée.

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée une tâche en saisissant :
   - un intitulé non vide **(P)** ;
   - un délai, obligatoire (RG-003) ;
   - une estimation en heures et minutes, au pas de 30 min (RG-028), dont le caractère obligatoire et la valeur minimale suivent Q-DEM001-28.1 et 28.2 ;
   - éventuellement, un ou plusieurs objectifs de rattachement (RG-001).
2. **CA-2** — L'enregistrement d'une tâche sans délai est refusé, avec un message qui indique que le délai est obligatoire.
3. **CA-3** — Seules des estimations multiples de 30 min peuvent être saisies (par exemple 0 h 30, 1 h 00, 1 h 30).
4. **CA-4** — Une tâche peut être créée sans objectif. Elle apparaît alors dans la vue « Tâches sans objectif » **(P)**.
5. **CA-5** — Une tâche rattachée à plusieurs objectifs apparaît dans le détail de chacun d'eux.
6. **CA-6** — Si le délai de la tâche est postérieur au délai d'un de ses objectifs, la tâche est enregistrée et une alerte nomme le ou les objectifs concernés (RG-024). Les objectifs sans délai ne déclenchent aucune alerte.
7. **CA-7** — L'utilisateur peut modifier l'intitulé, le délai et les objectifs de rattachement à tout moment (RG-004). Après chaque modification, les alertes RG-024 et l'état des objectifs concernés (RG-025) sont recalculés.
8. **CA-8** — La modification de l'estimation suit Q-DEM001-28.3. L'estimation initiale reste disponible pour le calcul de la vélocité (RG-029).
9. **CA-9** — La liste des tâches affiche, pour chacune : l'intitulé, le délai, l'estimation, l'état et le ou les objectifs. Elle est triée par délai croissant **(P)**, en attendant l'ordre de priorité (US-004).
10. **CA-10** — La suppression d'une tâche demande une confirmation. Elle suit Q-DEM001-29.3 et 29.4.

## Cas limites et cas d'erreur
- Délai égal à aujourd'hui : accepté.
- Délai déjà passé : Q-DEM001-28.5.
- Délai de la tâche égal au délai de l'objectif : pas d'alerte, puisque le délai n'est pas postérieur.
- Estimation de 0 h, ou non multiple de 30 min : refusée **(P)**, sous réserve de Q-DEM001-28.2.
- Rattachement à un objectif atteint : l'objectif repasse « en cours » (RG-025).
- Retrait du dernier objectif d'une tâche : elle devient une tâche sans objectif.
- Modification de la même tâche sur deux appareils : RG-036 (US-017).

## Hors périmètre
- Sous-tâches (US-024).
- Priorisation (US-004), planification (US-006), temps passé et reste à faire (US-008, US-009).
- Tâches récurrentes (US-021, reportée).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-002-creer-et-gerer-mes-taches.feature`.

## Questions ouvertes
- **Q-DEM001-28 (P1)** : estimation obligatoire, valeur minimale, modification de l'estimation initiale, forme du délai, délai déjà passé.
- **Q-DEM001-29 (P1)** : suppression d'une tâche qui a des sous-tâches ; caractère définitif.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5, 6, 9 et 12. |
