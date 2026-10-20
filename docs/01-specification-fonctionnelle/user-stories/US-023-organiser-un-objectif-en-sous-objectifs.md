# US-023 — Organiser un objectif en sous-objectifs
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** décomposer un objectif en sous-objectifs, **afin de** structurer les objectifs ambitieux.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-047, RG-048, RG-050) sont soumis à la validation de cette règle.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-6.1 d), qui retient les sous-objectifs et les sous-tâches. La v0.1 ne prévoyait que deux niveaux.
- **Précisé en v0.4** (Q-DEM001-24, 26, 29) : un seul niveau ; parent unique ; délai postérieur au parent accepté avec alerte ; déplacement et promotion possibles ; atteinte du parent conditionnée à celle de ses sous-objectifs ; à la suppression du parent, les sous-objectifs deviennent principaux.
- **Proposé en v0.4** (à valider en E6) : réparation d'une hiérarchie invalide après fusion des modifications des deux appareils (RG-048, F12) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-022 : sous-objectifs sur un seul niveau, parent unique, alerte de délai, déplacement.
- RG-025 : un objectif est atteint quand ses tâches non abandonnées sont terminées et ses sous-objectifs atteints.
- RG-002, RG-004, RG-024, RG-045 s'appliquent aux sous-objectifs, qui sont des objectifs.
- RG-046 : suppression d'un objectif qui a des sous-objectifs.
- RG-047, RG-048, RG-050 (proposées).

## Critères d'acceptation
1. **CA-1** — Depuis le détail d'un objectif principal, l'utilisateur crée un sous-objectif. Celui-ci a les mêmes informations qu'un objectif (US-001) et est rattaché à cet objectif, son seul parent (RG-022).
2. **CA-2** — Le détail d'un objectif affiche ses sous-objectifs, avec leur intitulé, leur délai, leur état et l'indication « en retard » le cas échéant. La liste des objectifs permet de distinguer les objectifs principaux de leurs sous-objectifs **(P)**.
3. **CA-3** — Un seul niveau est autorisé : sur un sous-objectif, l'action « créer un sous-objectif » n'est pas proposée.
4. **CA-4** — Si le délai d'un sous-objectif est postérieur à celui de son parent, le sous-objectif est enregistré et une alerte nomme le parent. Aucune alerte si l'un des deux délais est absent. L'alerte est recalculée dès que l'un des deux délais change.
5. **CA-5** — L'utilisateur peut déplacer un sous-objectif sous un autre objectif principal, ou en faire un objectif principal. Les états des anciens et nouveaux parents, et l'alerte de délai, sont recalculés.
6. **CA-6** — Un objectif principal **sans** sous-objectif peut être placé sous un autre objectif principal et devient alors son sous-objectif. Un objectif principal qui **a** des sous-objectifs ne peut pas être placé sous un autre objectif : l'action est refusée, avec un message qui indique qu'un seul niveau est autorisé **(P)**. Un objectif ne peut jamais être placé sous lui-même.
7. **CA-7** — Un objectif qui a des sous-objectifs est atteint quand toutes ses tâches non abandonnées sont terminées **et** que tous ses sous-objectifs sont atteints (RG-025). Son état est mis à jour dès qu'un sous-objectif change d'état.
   - Exemple 1 : toutes les tâches de O sont terminées, mais son sous-objectif S est en cours : O est « en cours ».
   - Exemple 2 : O n'a pas de tâche propre, et son unique sous-objectif S est atteint : O est « atteint ».
   - Exemple 3 : O a un sous-objectif S « à décliner en tâches » : O n'est pas atteint.
8. **CA-8** — La suppression d'un objectif qui a des sous-objectifs les transforme en objectifs principaux, après confirmation (RG-046).
9. **CA-9** — *(RG-048, proposée)* Si l'échange des modifications des deux appareils produit un objectif placé sous l'un de ses sous-objectifs, ou un deuxième niveau de sous-objectifs, l'application annule le plus ancien des déplacements en cause (le seul, s'il n'y en a qu'un) et signale le déplacement annulé comme valeur écartée. Une création n'est jamais annulée.
   - Exemple 1 : sur le PC, A est placé sous B ; ensuite, sur le smartphone sans réseau, B est placé sous A. Après échange, B est sous A (le déplacement le plus récent est conservé), A est objectif principal, et l'utilisateur est informé que le placement de A sous B a été annulé.
   - Exemple 2 : sur le PC, l'objectif O est placé sous P ; sur le smartphone, un sous-objectif S est créé sous O. Après échange, O redevient objectif principal avec son sous-objectif S, et l'utilisateur est informé que le placement de O sous P a été annulé.
10. **CA-10** — *(RG-047, proposée)* Si un objectif est supprimé sur un appareil pendant qu'un sous-objectif est créé sous lui sur l'autre, le sous-objectif créé devient objectif principal après échange.
11. **CA-11** — *(RG-050, proposée)* La création d'un sous-objectif et chaque changement de parent sont conservés dans l'historique, avec la journée et les valeurs avant et après.

## Cas limites et cas d'erreur
- Sous-objectif sans délai sous un objectif avec délai, ou l'inverse : aucune alerte (RG-022).
- Délai de sous-objectif égal à celui du parent : aucune alerte, puisqu'il n'est pas postérieur.
- Déplacement d'un sous-objectif sous l'objectif qui est déjà son parent : sans effet **(P)**.
- Sous-objectif atteint dont le parent a encore des tâches à faire : le parent reste « en cours ».

## Hors périmètre
- Plus d'un niveau de sous-objectifs ; plusieurs parents pour un sous-objectif (exclus, Q-DEM001-24).
- Importance d'un sous-objectif (US-030).
- Agrégation des délais ou des estimations au niveau de l'objectif parent.

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature`.

## Questions ouvertes
Aucune. Les critères (P) et ceux qui appliquent une règle proposée (CA-9 à CA-11) sont soumis à la validation du commanditaire en E6.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-6.1 d). |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-24, 26 et 29 intégrées (CA-1 à CA-8) ; règles proposées RG-047, RG-048 et RG-050 (CA-9 à CA-11). |
