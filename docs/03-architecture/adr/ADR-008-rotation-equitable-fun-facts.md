# ADR-008 — Rotation équitable des fun facts par permutation déterministe

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | DEM-002, RG-040, RG-041, RG-042, Q-DEM002-4 à 6, DAT §6.3 |

## Contexte
Chaque matin, un fun fact est tiré au hasard parmi 100, et chacun doit être présenté aussi souvent que les autres. Plusieurs contraintes pèsent sur ce tirage :
- le contenu du rappel est précalculé, parfois plusieurs jours à l'avance (ADR-006) ;
- deux appareils peuvent le calculer, chacun de son côté, hors ligne ;
- aucun serveur ne peut tenir un compteur central.

## Options étudiées
1. **Tirage aléatoire indépendant chaque jour** : pas d'égalité garantie ; les écarts grandissent comme √n. Rejeté.
2. **Tirage parmi les moins affichés, avec compteurs synchronisés** : deux appareils hors ligne peuvent tirer différemment ou incrémenter deux fois, et il faut un état partagé à fusionner.
3. **Permutation déterministe par cycle** :
   - le fun fact de J vaut `permutation(graine, k)[i]`, où `n` est le nombre de jours depuis l'origine, `k = n div 100` et `i = n mod 100` ;
   - la permutation est un mélange de Fisher-Yates initialisé par `(graine, k)`.

## Décision
Option 3.
- La graine et la date d'origine sont générées une fois et synchronisées, dans `RotationFunFacts`.
- À la jonction de deux cycles, si le premier élément du nouveau cycle est identique au dernier élément du cycle précédent, il est échangé avec un autre, pour éviter une répétition deux jours de suite.
- La liste des 100 fun facts est un **référentiel embarqué** dans l'application : un fichier JSON versionné. Ce n'est pas une donnée personnelle, et elle n'est pas soumise à RG-020.
- Si la liste devient modifiable par l'utilisateur (Q-DEM002-5), elle devient une donnée personnelle et passe dans l'état synchronisé (ADR-003). Une modification de la liste ouvre un nouveau cycle.
- Le jour J servant au calcul est le jour de Paris (fuseau de référence fixe Europe/Paris, ADR-011, DEC-012). Le fun fact du rappel et celui affiché dans l'application sont donc identiques sur tous les appareils.
- L'équité porte sur les **attributions quotidiennes** (DAT §8, F7), et non sur les consultations effectives.

## Conséquences
- \+ L'égalité est exacte à chaque cycle de 100 jours ; l'écart entre deux fun facts ne dépasse jamais un affichage.
- \+ Le résultat est identique sur tous les appareils et dans le rappel précalculé, sans coordination ni conflit.
- \+ Le tirage est entièrement testable : fonction pure de (graine, date).
- − L'ordre est prévisible pour qui connaît la graine, ce qui est sans enjeu.
