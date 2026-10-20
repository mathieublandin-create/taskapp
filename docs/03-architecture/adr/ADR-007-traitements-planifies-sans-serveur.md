# ADR-007 — Traitements planifiés sans serveur : délégation à Calendar et rattrapage idempotent

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | RG-012, RG-013, RG-032, RG-037, Q-DEM001-38, ADR-002, ADR-006, DAT §5 |

## Contexte
Plusieurs traitements dépendent de l'heure :
- rappels à 8 h et 21 h ;
- report automatique des tâches non terminées après minuit ;
- détection des créneaux déplacés ;
- proposition de replanification le soir ;
- notification de secours de l'application.

Aucun serveur n'est disponible, et les appareils peuvent tous être éteints.

## Options étudiées
1. Un serveur planifié (cron), rejeté par ADR-002.
2. Des tâches planifiées sur l'appareil (alarmes, WorkManager) : non garanties, en particulier sur iOS et sur la PWA.
3. **Délégation et rattrapage** :
   - ce qui doit se produire à heure fixe sans appareil est délégué à Google Calendar ;
   - le reste est exprimé comme une **fonction déterministe et idempotente de l'état et de la date**, appliquée par le premier appareil actif.

## Décision
Option 3.
- **Notifications des rappels** : séries Calendar (ADR-006).
- **Contenu des rappels** : précalculé à chaque réconciliation, avec la projection du report automatique.
- **Report automatique** : appliqué à la première activité du jour, puis répercuté sur les créneaux par la réconciliation.
- **Détection des déplacements** : à chaque synchronisation. Elle s'ajoute, dans un lot ultérieur, à une synchronisation d'arrière-plan sur Android, via WorkManager toutes les 30 à 60 minutes.
- **Proposition du soir** : calculée à l'heure du rappel du soir et présentée à l'ouverture suivante.
- **Notification de secours** (Q-38 b) : notifications locales programmées à l'avance sur le smartphone (J à J+7), sur la seule application native.
- **Historiques** (vélocité, backlog) : jamais d'instantané planifié ; ils sont recalculés à partir du journal métier.

## Conséquences
- \+ Il n'existe aucun « traitement manqué » : chaque traitement est rattrapé à la première occasion, et le résultat est identique quel que soit l'appareil qui l'exécute.
- \+ Les fonctions de rattrapage sont pures, donc testables unitairement et en Gherkin avec une horloge simulée.
- − Certains effets sont différés jusqu'à la première ouverture (DAT §8, F2 et F5). Les critères d'acceptation des US concernées doivent le dire explicitement.
- − Pas de notification de secours sur la PWA du PC.
