# ADR-011 — Horloges hybrides (HLC), instants en UTC et fuseau de référence fixe Europe/Paris

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (révisé après DEC-012, qui remplace DEC-011 ; passage à « Accepté » en E17) | 2026-10-20 | Starck | **DEC-012** et DEC-011 (commanditaire, 2026-10-20), RG-008, RG-012, RG-013, RG-032, RG-036, RG-042, Q-DEM001-23, Q-DEM001-37, DAT §6.4 |

## Historique
| Date | Évolution |
|---|---|
| 2026-10-20 | Création. Option proposée pour la journée : le fuseau de l'agenda Google. |
| 2026-10-20 | Révision après **DEC-011** : la journée suit le fuseau de l'appareil, et les instants sont stockés en UTC. |
| 2026-10-20 | Révision après **DEC-012**, qui remplace DEC-011. Verbatim du commanditaire : « je change d'avis, reste sur un agenda qui est aligné sur le fuseau horaire Français métropolitain ». Le fuseau de référence est désormais **fixe : Europe/Paris**. Il vaut pour la journée, les rappels et les créneaux, quel que soit l'appareil. Les instants restent en UTC. |

## Contexte
Deux questions de temps se posent :
1. **« La plus récente l'emporte »** (RG-036). Chaque appareil a sa propre horloge, qui peut être décalée, et l'heure murale seule ne garantit pas la causalité.
2. **« La journée »**. Plusieurs éléments doivent s'accorder sur un même jour :
   - la saisie de temps ;
   - la fin d'une tâche ;
   - la semaine de vélocité ;
   - le report automatique ;
   - le bilan du soir ;
   - le fun fact ;
   - les rappels et les créneaux, qui sont des événements Google.

   Or deux appareils peuvent se trouver dans deux fuseaux différents.

## Options étudiées
**Ordre des modifications**
- (a) l'heure murale de l'appareil ;
- (b) des horloges vectorielles : elles détectent la concurrence, mais ne désignent pas la modification « la plus récente » ;
- (c) **une HLC fondée sur l'heure UTC, corrigée de l'écart mesuré avec l'en-tête `Date` des réponses Google**. **Retenue.**

**Fuseau de la journée**
- (a) **Le fuseau de l'appareil qui fait l'action** : retenue par DEC-011, puis **abandonnée par DEC-012**.
  - Elle collait à l'heure du téléphone en voyage.
  - En contrepartie, deux appareils dans deux fuseaux pouvaient avoir deux « aujourd'hui » différents, ce qui affectait le report, le bilan et le fun fact.
  - Elle obligeait aussi à prévoir, en plus, un fuseau technique pour l'agenda.
- (b) **Le fuseau de l'agenda Google** : proposition initiale de Starck, **écartée**.
  - Elle offrait un fuseau unique, mais il était modifiable dans Google.
  - Elle dépendait d'une lecture du compte, et la journée pouvait changer si l'utilisateur modifiait le fuseau de son agenda.
- (c) Le fuseau du dernier appareil utilisé : **écartée**. Les séries de rappels basculeraient sans cesse avec deux appareils dans deux fuseaux.
- (d) **Un fuseau fixe, Europe/Paris** : **retenue par DEC-012**.

## Décision
1. **Instants en UTC** : tout horodatage est stocké en UTC, au format ISO 8601 avec `Z` et une précision à la milliseconde. Cela vaut pour l'HLC, la date de création, la date de modification et l'instant d'une fin de tâche. Le composant physique de l'HLC est en millisecondes UTC, corrigé de l'écart avec Google. En cas d'égalité, l'`appareilId` départage.
2. **Fuseau de référence** : la constante de code `FUSEAU_REFERENCE = "Europe/Paris"`.
   - Ce n'est pas un paramètre utilisateur ni une donnée synchronisée.
   - Le port `Horloge` expose ce fuseau. Le fuseau système de l'appareil n'est jamais utilisé pour un calcul métier.
3. **Jour** : la `DateCalendaire` d'une action est calculée dans Europe/Paris à partir de l'instant UTC, puis persistée avec l'instant.
   - Le calcul donne le **même résultat sur tous les appareils**, où qu'ils soient.
   - Le fuseau de l'appareil n'est **pas** enregistré, car il n'a plus d'usage métier.
4. **Dates civiles choisies par l'utilisateur** : délai, jour planifié, jour d'une saisie de temps, date d'une exception de capacité. Elles restent des `DateCalendaire` (`AAAA-MM-JJ`) et ne sont jamais converties en UTC.
5. **Agenda Google** :
   - les séries de rappels et les créneaux sont écrits avec `timeZone: "Europe/Paris"` ;
   - les heures de 8 h et 21 h sont des heures murales de Paris, maintenues automatiquement au changement d'heure par la règle de récurrence (`RRULE`) ;
   - Google affiche ces événements dans le fuseau d'affichage de l'agenda de l'utilisateur.
6. **Semaines** : semaines ISO, du lundi au dimanche, des jours calculés dans Europe/Paris.

## Conséquences
- \+ Tous les calculs datés sont **déterministes et identiques sur tous les appareils** : report, rappel, fun fact, bilan, vélocité. Il n'y a ni divergence ni réécriture en boucle de l'agenda.
- \+ Le modèle est simplifié : pas de fuseau par appareil à publier, pas de paramètre de fuseau de l'agenda.
- \+ Le sens de « plus récente » ne change pas : l'HLC est en UTC.
- − **En voyage**, la journée reste celle de Paris. À New York, une saisie à 20 h locales (2 h à Paris) tombe par défaut le lendemain. Le jour reste modifiable par l'utilisateur pour une saisie de temps (RG-008). Les horaires sont affichés en heure de Paris : point d'ergonomie, transmis à Steeve et à Pepper.
- − Les deux changements d'heure annuels de Paris doivent être testés. L'heure de 2 h à 3 h existe deux fois le dernier dimanche d'octobre, et n'existe pas le dernier dimanche de mars. Voir PT-16 au DAT §11.
- − RG-008 (« heure locale de l'appareil ») doit être mise à jour par Pepper pour refléter DEC-012.
