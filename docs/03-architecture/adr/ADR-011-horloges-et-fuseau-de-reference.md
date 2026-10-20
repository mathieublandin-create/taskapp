# ADR-011 — Horloges hybrides (HLC) et fuseau de référence de la journée

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (le fuseau de référence dépend de Q-DEM001-37 et de l'avis F3) | 2026-10-20 | Starck | RG-008, RG-012, RG-013, RG-032, RG-036, RG-042, Q-DEM001-23, Q-DEM001-37, DAT §6.4 |

## Contexte
Deux questions de temps se posent :
1. **« La plus récente l'emporte »** (RG-036). Chaque appareil a sa propre horloge, qui peut être décalée de plusieurs minutes, voire mal réglée. L'heure murale seule ne garantit pas non plus la causalité : une modification faite après en avoir vu une autre pourrait être datée avant elle.
2. **« La journée »**. RG-008 la définit par l'heure locale de l'appareil. Or :
   - les rappels et les créneaux sont dans l'agenda Google, qui a son propre fuseau ;
   - plusieurs calculs doivent donner le même résultat sur les deux appareils : report automatique, fun fact du jour (ADR-008), semaine de vélocité.

## Options étudiées
**Ordre des modifications**
- (a) l'heure murale de l'appareil ;
- (b) des horloges vectorielles : détectent la concurrence, mais ne disent pas laquelle est « la plus récente » ;
- (c) une **horloge hybride logique (HLC)** fondée sur l'heure physique **corrigée** par l'écart mesuré avec l'en-tête `Date` des réponses de Google.

**Journée**
- (a) le fuseau de l'appareil (RG-008 actuel) ;
- (b) **le fuseau de l'agenda Google** ;
- (c) un fuseau fixe choisi dans l'application.

## Décision proposée
- **HLC (option c)** : horodatage = (heure physique corrigée, compteur, `appareilId`).
  - L'écart avec l'heure des serveurs Google est mesuré à chaque échange, puis lissé. Hors ligne, l'appareil utilise le dernier écart connu.
  - Une valeur reçue datée de plus de 24 h dans le futur déclenche un avertissement.
- **Journée** : fuseau de l'agenda Google (option b), lu à la connexion et conservé dans `Parametres`. Il sert à la journée, aux rappels, aux créneaux et aux semaines (du lundi au dimanche).
  - Cette option **modifie RG-008** : elle est soumise à Pepper et au commanditaire (DAT §8, F3, et Q-DEM001-37).
  - En attendant, l'heure locale de l'appareil reste utilisée au lot 1, où aucune règle datée ne crée de divergence entre appareils. Les dates de journée sont tout de même stockées sous forme de dates civiles (`AAAA-MM-JJ`), sans heure.

## Conséquences
- \+ Le sens de « plus récente » est le même pour l'utilisateur et pour la machine, à environ une seconde près. La causalité est respectée.
- \+ Avec un fuseau de référence unique, les calculs datés donnent le même résultat sur tous les appareils.
- − En voyage, la « journée » suit le fuseau de l'agenda et non l'heure du téléphone, sauf si l'utilisateur change le fuseau de son agenda.
- − Entre deux appareils hors ligne longtemps et mal réglés, la correction d'écart reste imparfaite. Le journal des valeurs écartées garantit que l'utilisateur est informé (ENF-06).
