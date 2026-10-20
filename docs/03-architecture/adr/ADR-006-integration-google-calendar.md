# ADR-006 — Intégration Google Calendar : séries de rappels, identifiants déterministes, réconciliation

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | RG-012 à RG-014, RG-033, RG-034, RG-035, RG-037, RG-038, RG-040, Q-DEM001-33, 34, 37, 38, 40, DAT §4.4 |

## Contexte
L'application écrit dans l'agenda **principal** :
- les rappels quotidiens de 8 h et de 21 h ;
- les créneaux des tâches planifiées.

Elle lit cet agenda pour calculer la capacité disponible et détecter les créneaux déplacés ou supprimés par l'utilisateur. Deux appareils peuvent agir en même temps, et ils sont parfois hors ligne. Aucun serveur n'est disponible (ADR-002).

## Options étudiées
**Forme des rappels**
- (a) un événement par jour, créé à l'avance sur N jours : aucun rappel si l'application n'a pas été ouverte depuis N jours ;
- (b) **une série récurrente quotidienne**, dont le contenu de chaque jour est porté par une modification d'occurrence.

**Écritures**
- (a) une file d'ordres « créer, modifier, supprimer » rejouée : risque de doublons entre appareils et d'ordres périmés ;
- (b) une **réconciliation déclarative** de l'état souhaité avec l'état observé, avec des **identifiants d'événements déterministes**.

**Détection des modifications**
- (a) notifications push (`events.watch`) : exigent un serveur ;
- (b) **synchronisation incrémentale** par `syncToken`.

**Agenda cible** : agenda principal (décision du commanditaire) ou agenda dédié. Hors débat.

## Décision
- **Rappels** : deux séries récurrentes quotidiennes, transparentes, avec une notification « fenêtre » à 0 min, avec `timeZone: "Europe/Paris"` (fuseau de référence fixe, ADR-011, DEC-012). Les heures de 8 h et 21 h sont des heures de Paris, maintenues au changement d'heure par la `RRULE`. Les créneaux sont eux aussi écrits dans ce fuseau.
  - Le contenu (tâches du jour, fun fact, questions de bilan) est écrit par modification d'occurrence, sur l'horizon J à J+7.
  - Une occurrence dont l'heure est passée n'est jamais modifiée.
  - Pour changer d'heure, on clôt la série en cours (`UNTIL`) et on en crée une nouvelle.
- **Créneaux** : événements simples, opaques, dont l'identifiant est `hash(tacheId, génération)` en base32hex.
- **Marquage** : `extendedProperties.private` avec l'identifiant de l'application, le type et le `tacheId`.
- **Réconciliation déclarative** :
  - elle est idempotente ;
  - un code `409` entraîne une relecture puis une mise à jour ;
  - à chaque écriture, l'application inscrit dans l'événement la position qu'elle a écrite (`extendedProperties.private.posApp` et `generation`). Le diagnostic est ainsi autonome et ne dépend pas de l'état synchronisé :
    - si `start`/`end` sont égaux à `posApp`, l'écriture vient de l'application, de l'un ou l'autre appareil : aucune alerte, et donc **aucune boucle** ;
    - si `start`/`end` diffèrent de `posApp`, c'est un **déplacement par l'utilisateur** : l'application ne l'écrase pas et crée une `AlerteCreneau`, dont l'identifiant est déterministe ;
  - la dernière position écrite est aussi conservée dans l'état synchronisé (`CreneauAgenda`).
- **Synchronisation incrémentale** de l'agenda principal par `syncToken`, conservé localement par appareil :
  - un code `410` déclenche une resynchronisation complète sur l'horizon ;
  - le filtrage des événements de l'application se fait côté client, car `syncToken` est incompatible avec `privateExtendedProperty`.
- **Capacité** : seuls les intervalles occupés des événements de l'utilisateur sont retenus. Leurs titres et leurs participants ne sont jamais persistés.
- **Reprise sur erreur** : attente exponentielle avec gigue pour les codes `429`, `403` de quota et `5xx`. En cas de perte d'accès, l'application ne supprime jamais d'événement (RG-035).

## Conséquences
- \+ Les rappels se déclenchent même si aucun appareil n'est ouvert : le contenu est générique s'il n'a pas été calculé.
- \+ Pas de doublon entre appareils ; nouvelles tentatives sans risque ; rattrapage en une passe après une longue période hors ligne.
- \+ Les événements personnels de l'utilisateur ne sont jamais modifiés, ni leur contenu conservé.
- − Le contenu d'un rappel reflète l'état connu lors de la dernière réconciliation, avant l'heure du rappel (DAT §8, F4).
- − Les créneaux déplacés sont détectés en différé, sans serveur (F2).
- − Une série modifiée ou supprimée par l'utilisateur dans Google Calendar doit être détectée et signalée (risque R7).
