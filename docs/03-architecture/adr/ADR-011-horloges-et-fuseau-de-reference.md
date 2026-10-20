# ADR-011 — Horloges hybrides (HLC), stockage en UTC et journée dans le fuseau de l'appareil

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (révisé après la décision DEC-011 ; passage à « Accepté » en E17) | 2026-10-20 | Starck | **DEC-011** (commanditaire, 2026-10-20), RG-008, RG-012, RG-013, RG-032, RG-036, RG-042, Q-DEM001-23, Q-DEM001-37, DAT §6.4 |

## Historique
| Date | Évolution |
|---|---|
| 2026-10-20 | Création. Option proposée pour la journée : fuseau de l'agenda Google. |
| 2026-10-20 | **Révision après DEC-011.** Verbatim du commanditaire : « le fuseau horaire est celui de l'appareil, on enregistre en base les éléments en utc ». La journée est celle du fuseau de l'appareil (RG-008 maintenue), et les horodatages sont stockés en UTC. L'option « fuseau de l'agenda » est écartée. |

## Contexte
Deux questions de temps se posent :
1. **« La plus récente l'emporte »** (RG-036). Chaque appareil a sa propre horloge, qui peut être décalée. L'heure murale seule ne garantit pas la causalité.
2. **« La journée »**. RG-008 la définit par l'heure locale de l'appareil. Or :
   - les rappels et les créneaux sont des événements Google, qui ont leur propre fuseau ;
   - deux appareils peuvent se trouver dans deux fuseaux différents, par exemple le smartphone en voyage et le PC resté au domicile.

## Options étudiées
**Ordre des modifications**
- (a) l'heure murale de l'appareil ;
- (b) des horloges vectorielles : elles détectent la concurrence, mais ne désignent pas la modification « la plus récente » ;
- (c) **une HLC fondée sur l'heure UTC corrigée** de l'écart mesuré avec l'en-tête `Date` des réponses Google. **Retenue.**

**Journée**
- (a) **le fuseau de l'appareil qui fait l'action** (RG-008). **Retenue par DEC-011.**
- (b) le fuseau de l'agenda Google. **Écartée par DEC-011.** C'était la proposition initiale de Starck : un fuseau unique pour toutes les règles datées, qui rendait les calculs identiques sur tous les appareils. Le commanditaire a préféré que la journée suive l'appareil.
- (c) un fuseau fixe choisi dans l'application. Écartée.

## Décision
1. **Instants en UTC** : tout horodatage est stocké en UTC, au format ISO 8601 avec `Z` et une précision à la milliseconde. Cela vaut pour l'HLC, la date de création, la date de modification et l'instant d'une fin de tâche. Le composant physique de l'HLC est en millisecondes UTC, corrigé de l'écart avec l'heure des serveurs Google. En cas d'égalité, l'`appareilId` départage.
2. **Contexte de fuseau enregistré avec chaque action datée** : chaque entrée du journal métier et chaque donnée rattachée à une journée conservent trois informations.
   - `instant` : l'instant en UTC ;
   - `fuseau` : le fuseau IANA de l'appareil au moment de l'action ;
   - `jour` : la `DateCalendaire` locale qui en découle, calculée **une fois, sur l'appareil qui fait l'action**, puis persistée sans être recalculée.

   Le `jour` est déductible de `instant` et `fuseau`, mais il est persisté pour figer l'interprétation (conformément à `conventions.md` §6.1).
3. **Dates civiles choisies par l'utilisateur** : délai, journée de planification, journée d'une saisie de temps antérieure, date d'une exception de capacité. Elles restent des `DateCalendaire` (`AAAA-MM-JJ`) et **ne sont jamais converties en UTC**. Une conversion en « minuit UTC » décalerait la date d'un jour selon le fuseau. C'est l'interprétation de « en UTC » que je retiens, à confirmer (point P-T1 du DAT §8).
4. **« Aujourd'hui »** : chaque appareil l'évalue dans son fuseau courant. Deux appareils situés dans des fuseaux différents peuvent donc avoir, pendant quelques heures, deux « aujourd'hui » différents.
5. **Agenda Google** : un événement Google a un fuseau propre et ne peut pas dépendre de l'appareil qui le lit. Pour éviter que deux appareils dans deux fuseaux réécrivent sans fin les mêmes événements, la réconciliation de l'agenda (rappels, créneaux) utilise **un seul fuseau, enregistré dans `Parametres.fuseauAgenda`**. Ce choix est technique et s'impose par construction. En revanche, **la valeur de ce fuseau est une question métier ouverte** (Q-DEM001-37). Les options sont décrites au DAT §8, F3. En attendant la réponse, l'ADR ne fige pas cette valeur.

## Conséquences
- \+ Conforme à DEC-011 et à RG-008 : une saisie ou une fin de tâche est rangée dans la journée vue par l'utilisateur sur l'appareil qu'il tient.
- \+ L'instant UTC et le fuseau sont conservés : toute donnée peut être réinterprétée plus tard sans perte.
- \+ Le sens de « plus récente » ne change pas : l'HLC en UTC est indépendante des fuseaux.
- − Les calculs fondés sur « aujourd'hui » peuvent différer d'un appareil à l'autre quand les deux appareils sont dans deux fuseaux différents : report automatique, rappel, fun fact affiché dans l'application, bilan. Les règles à arbitrer sont listées au DAT §8, F3.
- − Il faut un fuseau unique pour l'agenda (`fuseauAgenda`), distinct de la journée métier. Sa valeur dépend de Q-DEM001-37.
- − Les tests doivent couvrir le cas de plusieurs fuseaux : deux appareils dans deux fuseaux, et le passage à l'heure d'été ou d'hiver. C'est déjà exigé par `conventions.md` §12.
