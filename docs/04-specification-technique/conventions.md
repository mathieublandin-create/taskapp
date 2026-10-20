# Conventions techniques

> **Version 0.1 — 2026-10-20 — Anthony (responsable technique).** Socle initial, établi hors cycle de lot, à la demande du commanditaire.
>
> **Statut : brouillon.** Ce document est rédigé **avant le DAT v0.1** et ne choisit aucun langage ni framework. Les sections qui dépendent de la stack portent la mention **« En attente du DAT (choix de stack) »** et listent les décisions attendues de Starck. La version 1.0 sera publiée après la parution du DAT v0.1 et des ADR de stack. Les règles indépendantes de la stack s'appliquent dès maintenant.
>
> **Note de synchronisation.** Un brouillon du DAT v0.1 (Starck, décisions au statut « Proposé ») est paru pendant la rédaction de ce document. Il n'est pas encore intégré ici : les marqueurs « En attente du DAT » restent valables jusqu'à ce que Jarvis confirme la stack. Une première lecture ne révèle aucune contradiction de principe (architecture hexagonale, Cucumber au niveau application, doublures Google en mémoire, banc à deux appareils, horloge logique hybride). Les écarts de nommage des ports seront résolus en faveur du DAT (§2.3).
>
> Entrées : `docs/workflow.md` v2, DEM-001, DEM-002, cahier des charges v0.3 (RG-001 à RG-042), backlog initial, questions ouvertes (Q-DEM001-21 à 40 et Q-DEM002-1 à 7 encore ouvertes), proposition `docs/lots/LOT-001.md` (points S1 à S10 soumis à Starck). Ces entrées évoluent. Toute contradiction entre ce document et un livrable d'un autre agent est remontée à Jarvis ; elle n'est jamais tranchée unilatéralement.

## Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Création : principes, organisation conceptuelle, règles de codage, erreurs, sécurité, stratégie de tests, Git, outillage par catégorie, DoD technique, points de testabilité, décisions attendues de Starck. |

## Sommaire

1. Portée et force des règles
2. Principes de conception
3. Organisation du code cible (niveau conceptuel)
4. Règles de nommage
5. Règles de codage
6. Modélisation du temps, des durées et du hasard
7. Gestion des erreurs
8. Sécurité, jetons OAuth, données personnelles et journalisation
9. Stratégie de tests
10. Couverture minimale
11. Gestion de configuration et branches Git
12. Outillage attendu
13. Definition of Done technique
14. Points de testabilité à traiter
15. Décisions attendues de Starck (récapitulatif)
16. Documents associés

---

## 1. Portée et force des règles

- Le mot **« doit »** exprime une règle impérative. Une violation est une remarque de revue de gravité **Majeure** au minimum (voir `checklist-revue-code.md`).
- Le mot **« devrait »** exprime une recommandation forte. Un écart est accepté s'il est justifié dans le code ou dans la description de la revue.
- Une règle du **DAT ou d'un ADR** prévaut sur ce document. En cas d'écart, Anthony saisit Starck, sans contournement.
- Une **décision d'arbitrage** consignée dans `docs/suivi-projet.md` prévaut sur tout.
- Toute dérogation à une règle impérative est consignée dans `dette-technique.md` avec un identifiant `DT-xxx`.

## 2. Principes de conception

### 2.1 Principes généraux
| Principe | Application attendue dans le projet |
|---|---|
| **S** — Responsabilité unique | Un module, une classe ou une fonction a une seule raison de changer. Exemple : le calcul du reste à faire (RG-009) ne connaît ni le stockage ni l'affichage. |
| **O** — Ouvert / fermé | Les variations prévisibles s'ajoutent sans modifier le code existant. Exemple : un nouveau critère de priorité (RG-005) s'ajoute comme une nouvelle stratégie. |
| **L** — Substitution de Liskov | Toute implémentation d'un port (adaptateur réel ou doublure) respecte le même contrat, vérifié par la même suite de tests de contrat (§9.9). |
| **I** — Ségrégation des interfaces | Des ports étroits, orientés usage. Pas de port « Google » fourre-tout : un port pour l'agenda, un pour le stockage distant, un pour l'identité. |
| **D** — Inversion des dépendances | Le domaine et l'application définissent les ports ; l'infrastructure les implémente. Les dépendances pointent toujours vers le domaine. |
| Clean code | Nommage révélant l'intention, fonctions courtes, pas de duplication, pas de code mort, pas de commentaire qui paraphrase le code. |
| Typage strict | Typage statique strict partout, sans échappatoire (type « quelconque », conversion forcée, suppression d'avertissement) sauf justification en revue. |
| Erreurs explicites | Les erreurs prévisibles font partie du contrat des fonctions (§7). |
| Simplicité | La solution la plus simple qui satisfait la spécification. Pas de généralisation spéculative. |

### 2.2 Séparation en couches
Le code est organisé en **architecture hexagonale (ports et adaptateurs)**, sous réserve de confirmation par le DAT.

| Couche | Contenu | Peut dépendre de | Ne doit jamais dépendre de |
|---|---|---|---|
| **Domaine** | Entités, objets-valeurs, règles de gestion (RG), services de domaine purs, erreurs métier | Rien d'autre que lui-même et la bibliothèque standard du langage (sans E/S) | Application, infrastructure, présentation, framework, SDK Google, horloge système, générateur aléatoire système, réseau, stockage |
| **Application** | Cas d'usage (un par intention de l'utilisateur ou par traitement planifié), ports (interfaces) vers l'extérieur, orchestration, transactions | Domaine | Infrastructure, présentation, framework d'IHM, SDK Google |
| **Infrastructure** | Adaptateurs : stockage local, stockage distant (Google Drive ou autre, selon le DAT), Google Calendar, identité OAuth, stockage sécurisé des jetons, horloge, aléatoire, réseau, planification système, notifications, journalisation | Application (pour implémenter ses ports), domaine (pour mapper), SDK et frameworks | Présentation |
| **Présentation** | Écrans, composants d'IHM, logique de présentation (états d'écran, formatage pour l'affichage) | Application (appel des cas d'usage), domaine (lecture des types) | Infrastructure directement |
| **Composition** | Point d'assemblage unique : instancie les adaptateurs et les injecte dans les cas d'usage | Tout | — |

Règles impératives :
- Le domaine **doit** être pur : aucune entrée-sortie, aucune lecture de l'heure courante, aucun tirage aléatoire, aucun accès à une variable d'environnement. L'heure et le hasard lui sont **passés en paramètre**, ou obtenus via un port par la couche application.
- Les règles de dépendance **doivent** être vérifiées automatiquement en CI (tests d'architecture, §12).
- Les types du SDK Google, du stockage ou du framework d'IHM **ne doivent pas** traverser la frontière d'un adaptateur. L'adaptateur traduit vers les types du domaine ou de l'application.

### 2.3 Isolement de l'intégration Google
- Toute interaction avec Google passe par des **ports** définis dans la couche application. Ports prévus à ce stade (noms indicatifs ; **les noms et le découpage fixés par le DAT prévalent**, par exemple `FournisseurAuth`, `TransportSynchro`, `PasserelleAgenda` dans le brouillon du DAT v0.1) :

| Port | Responsabilité | RG / ENF |
|---|---|---|
| `FournisseurIdentite` | Connexion et déconnexion Google, état de l'autorisation, obtention d'un jeton d'accès valide, détection de la révocation ou de l'expiration | RG-019, RG-035, ENF-05 |
| `CoffreJetons` | Conservation sécurisée des jetons sur l'appareil | ENF-05 |
| `StockageDistant` | Lecture et écriture des données de l'utilisateur dans son espace personnel, avec contrôle de version (étiquette de version ou équivalent) | RG-020, RG-017 |
| `AgendaGoogle` | Création, mise à jour, suppression et lecture des événements de l'application (rappels, créneaux) ; lecture incrémentale des changements ; lecture des événements de l'utilisateur pour la capacité | RG-012 à RG-014, RG-033, RG-034, RG-037 |

- Chaque port a **au moins deux implémentations** : l'adaptateur réel et une **doublure fidèle en mémoire** (§9.9), toutes deux soumises à la même suite de tests de contrat.
- Les événements créés par l'application **doivent** être identifiables comme tels de façon fiable (mécanisme à fixer par Starck), afin de ne jamais modifier ni supprimer un événement de l'utilisateur, et de ne pas compter ses propres créneaux dans la capacité.
- Les appels Google **doivent** être idempotents ou rendus idempotents : un même traitement exécuté deux fois, par exemple sur les deux appareils, ne doit pas créer deux rappels pour le même jour.

### 2.4 Logique métier pure et testable
- Chaque RG est implémentée dans le **domaine** par une fonction ou une méthode pure, testable sans doublure, ou par une composition de telles fonctions.
- Les cas d'usage de la couche application se limitent à : charger, appeler le domaine, persister, publier. Ils ne contiennent pas de règle métier.
- Les traitements planifiés (rappels de 8 h et 21 h, report automatique, replanification du soir) sont découpés en :
  1. une **fonction pure** qui décide quoi faire à un instant donné (« que doit contenir le rappel du matin du 2026-10-21 ? », « quelles tâches reporter ? ») ;
  2. un **cas d'usage** qui l'appelle avec l'heure fournie par le port `Horloge` ;
  3. un **adaptateur de déclenchement**, propre à la plateforme, qui appelle le cas d'usage.

## 3. Organisation du code cible (niveau conceptuel)

> **En attente du DAT (choix de stack)** pour l'arborescence physique (racines, extensions, découpage en paquets ou modules, emplacement des tests unitaires colocalisés ou séparés, partage de code entre smartphone et PC). Décisions attendues de Starck : DS-01, DS-02, DS-03, DS-15.

### 3.1 Découpage en contextes métier
Le code est découpé d'abord **par contexte métier**, puis **par couche** à l'intérieur de chaque contexte. Découpage provisoire, aligné sur les épopées du backlog :

| Contexte | Contenu | Épopées / US | RG principales |
|---|---|---|---|
| `objectifs-taches` | Objectifs, sous-objectifs, tâches, sous-tâches, états, atteinte | EP-01, US-022 à US-025, US-030 | RG-001 à RG-004, RG-022 à RG-030 |
| `priorisation` | Ordre de priorité proposé et ordre manuel | EP-02 | RG-005, RG-030 |
| `planification` | Capacité, planning proposé, report, horaire suggéré, créneaux | EP-03, US-026 à US-028, US-032 | RG-006, RG-011, RG-031 à RG-034, RG-037 |
| `suivi-temps` | Temps passé, reste à faire | EP-04 | RG-008, RG-009, RG-028 |
| `pilotage` | Vélocité, contrôle des délais, backlog, historiques | EP-05 | RG-007, RG-010, RG-015, RG-016 |
| `rappels` | Rappel du matin (dont fun fact, DEM-002), rappel du soir (dont questions de bilan, DEM-002), réponses de bilan, liste des fun facts, réglages | EP-06, US-029, US-033 à US-036 | RG-012 à RG-014, RG-038 à RG-042 |
| `synchronisation` | Stockage local, synchronisation entre appareils, résolution des conflits, hors ligne | EP-07, US-031 | RG-017, RG-020, RG-021, RG-036, ENF-04, ENF-06 |
| `compte` | Connexion Google, révocation, déconnexion | US-014, US-022 | RG-019, RG-035, ENF-05 |
| `commun` | Objets-valeurs partagés (`Duree`, `DateCalendaire`, `Instant`, `Fuseau`, `Identifiant`), ports transverses (`Horloge`, `SourceAleatoire`, `GenerateurIdentifiants`, `Journal`), type résultat | Transverse | RG-028 |

Un contexte n'accède à un autre que par son interface publique (cas d'usage ou types exportés), jamais par ses éléments internes. Le contexte `commun` ne contient que des éléments réellement partagés ; il ne doit pas devenir un fourre-tout.

### 3.2 Arborescence conceptuelle
```
<racine du code>/
  commun/
    domaine/          objets-valeurs partagés, type résultat, erreurs de base
    application/      ports transverses (Horloge, SourceAleatoire, GenerateurIdentifiants, Journal)
  <contexte>/
    domaine/          entités, objets-valeurs, services de domaine, erreurs métier
    application/      cas d'usage, ports propres au contexte
    infrastructure/   adaptateurs des ports du contexte
    presentation/     écrans et logique de présentation du contexte
  infrastructure-google/   adaptateurs Google partagés (client HTTP, identité, gestion des quotas)
  composition/        assemblage des dépendances, une configuration par plateforme
tests/
  features/           fichiers .feature (Pepper) — emplacement fixé par le workflow
  steps/              step definitions, par domaine (§9.7)
  support/            monde Cucumber, hooks, types de paramètres, fabriques de données
  doublures/          doublures des ports (Horloge contrôlable, source aléatoire déterministe, faux Google…)
  contrats/           suites de tests de contrat des ports (§9.9)
  unitaires/          tests unitaires, en miroir de l'arborescence du code (sauf si le DAT impose la colocalisation)
  integration/        tests d'intégration des adaptateurs
  e2e/                parcours d'IHM bout en bout
```

## 4. Règles de nommage

### 4.1 Langue
- **Langage du domaine en français**, aligné sur le glossaire du cahier des charges (§6) et sur les fichiers `.feature`. Objectif : un terme métier a un seul nom, du `.feature` jusqu'au code.
- Identifiants **sans accents ni caractères spéciaux** (`Tache`, `ResteAFaire`, `echeance`).
- Termes techniques sans équivalent français établi : l'anglais est admis (`token` est traduit par `jeton`, mais `etag`, `syncToken`, `payload` restent tels quels lorsqu'ils désignent un concept d'une API tierce, et uniquement dans l'infrastructure).
- Noms imposés par un framework : conservés tels quels.
- Messages destinés à l'utilisateur : en français, issus du catalogue de messages (§7.5), jamais écrits en dur dans la logique.

### 4.2 Glossaire code (provisoire, aligné sur le CdC v0.2)
| Terme métier | Identifiant de code | Remarque |
|---|---|---|
| Objectif, sous-objectif | `Objectif` (avec `objectifParentId` facultatif) | RG-022 ; profondeur selon Q-DEM001-24 |
| Tâche, sous-tâche | `Tache` (avec `tacheParenteId` facultatif) | RG-023 ; selon Q-DEM001-25 |
| Délai (échéance) | `echeance` (type `DateCalendaire`) | Forme selon Q-DEM001-28.4 |
| Estimation initiale | `estimationInitiale` (type `Duree`) | RG-029 |
| Reste à faire | `resteAFaire` (type `Duree`) | RG-009 |
| Temps passé | `SaisieTemps` (tâche, `DateCalendaire`, `Duree`) | RG-008 |
| Capacité quotidienne | `CapaciteQuotidienne`, `ExceptionCapacite` | RG-011 |
| Importance | `Importance` | RG-030 ; échelle selon Q-DEM001-35 |
| Planification | `Planification` (tâche, `DateCalendaire`) | RG-006 |
| Horaire suggéré, créneau | `HoraireSuggere`, `CreneauTache` | RG-034 |
| Vélocité | `Velocite` (semaine ISO, `Duree`) | RG-010 |
| Backlog | `Backlog` | RG-015 ; définition selon Q-DEM001-36 |
| Rappel du matin, du soir | `RappelMatin`, `RappelSoir` | RG-012, RG-013 |
| Fun fact, liste des fun facts | `FunFact`, `ListeFunFacts`, `CycleFunFacts` | RG-040 à RG-042 ; terme du commanditaire conservé ; `CycleFunFacts` selon Q-DEM002-6 |
| Questions et réponses de bilan du soir | `QuestionBilan`, `ReponseBilan` | RG-038, RG-039 |
| Appareil | `Appareil` | RG-017 |
| Conflit de modification | `ConflitModification` | RG-036 |

Ce glossaire est complété à chaque ST-US. Un nouveau terme métier y est ajouté avant d'être codé.

### 4.3 Conventions de forme
> **En attente du DAT (choix de stack)** pour la casse (camelCase, snake_case…), les suffixes de fichiers et les conventions idiomatiques du langage. Décision attendue : DS-01. Règle : la convention idiomatique du langage retenu s'applique, outillée par le formateur et le linter.

Règles indépendantes de la stack :
| Élément | Règle | Exemples |
|---|---|---|
| Type, entité, objet-valeur | Nom au singulier | `Tache`, `Duree`, `RappelMatin` |
| Cas d'usage | Verbe à l'infinitif + complément, exprimant l'intention | `CreerTache`, `DeclarerTacheTerminee`, `GenererRappelMatin` |
| Port | Nom du rôle, sans préfixe ni suffixe technique | `Horloge`, `AgendaGoogle`, `DepotTaches` |
| Adaptateur | Nom du port + technologie | `AgendaGoogleHttp`, `DepotTachesLocal` |
| Doublure | Nature + nom du port | `HorlogeControlable`, `FauxAgendaGoogle`, `SourceAleatoireDeterministe` |
| Fonction | Verbe à l'infinitif ; un prédicat commence par `est`, `a`, `peut` | `calculerResteAFaire`, `estEnRetard`, `peutEtreTerminee` |
| Booléen | Forme affirmative | `estAbandonnee` et non `nEstPasActive` |
| Erreur | Nom décrivant la situation | `EstimationNonMultipleDe30Minutes`, `AccesGoogleRevoque` |
| Constante métier | Nom explicite, référence à la RG en commentaire | `HEURE_RAPPEL_MATIN_PAR_DEFAUT` (RG-012) |
| Fichier | Un concept principal par fichier, nommé d'après ce concept | — |
| Unités | Toute grandeur porte son unité dans son type (`Duree`) ou, à défaut, dans son nom | `dureeEnMinutes`, jamais `duree` seul en entier nu |

Abréviations interdites, sauf celles du glossaire (`RG`, `US`, `ISO`, `UTC`, `ID`).

## 5. Règles de codage

| Id | Règle | Force |
|---|---|---|
| RCD-01 | Une fonction fait une seule chose. Repère : 30 lignes utiles au plus, complexité cyclomatique de 10 au plus, profondeur d'imbrication de 3 au plus. Les seuils exacts sont configurés dans le linter. | Doit |
| RCD-02 | Quatre paramètres au plus ; au-delà, un objet de paramètres nommé. Pas de paramètre booléen qui change le comportement : deux fonctions explicites. | Doit |
| RCD-03 | Aucun nombre ou texte « magique ». Les valeurs métier (8 h, 21 h, pas de 30 min, 12 semaines, 100 fun facts, lundi premier jour de semaine…) sont des constantes nommées, ou des réglages, et référencent leur RG. | Doit |
| RCD-04 | Pas de duplication de logique métier. Une RG est implémentée à un seul endroit. | Doit |
| RCD-05 | Pas de code mort, pas de code commenté, pas de journalisation de débogage oubliée. | Doit |
| RCD-06 | Pas de `TODO` ni de `FIXME` sans référence à la dette : `TODO(DT-xxx)`. | Doit |
| RCD-07 | Immuabilité par défaut : les objets-valeurs et les entités du domaine sont immuables ; une modification produit une nouvelle valeur. Les exceptions sont justifiées. | Devrait |
| RCD-08 | Pas d'absence de valeur implicite : l'absence est modélisée explicitement (type optionnel ou équivalent du langage). | Doit |
| RCD-09 | Pas de type primitif pour un concept métier : `Duree`, `DateCalendaire`, `Identifiant<Tache>`, et non des entiers ou des chaînes nus. | Doit |
| RCD-10 | Les invariants sont vérifiés à la construction : un objet du domaine invalide ne peut pas exister. | Doit |
| RCD-11 | Aucun état global mutable, aucun singleton porteur d'état hors de la composition. Les dépendances sont injectées par constructeur ou par paramètre. | Doit |
| RCD-12 | Les commentaires expliquent le **pourquoi**. Chaque implémentation de RG porte la référence de la RG (`RG-009`) au plus près du code concerné. | Doit |
| RCD-13 | Les éléments publics d'un module sont les seuls utilisés par les autres modules ; tout le reste est privé. | Doit |
| RCD-14 | Aucune valeur de configuration ni secret en dur (§8.1). | Doit |
| RCD-15 | Aucun avertissement du compilateur, du vérificateur de types ou du linter. Une suppression locale d'avertissement est justifiée en commentaire et validée en revue. | Doit |
| RCD-16 | Les dépendances tierces sont ajoutées avec justification (besoin, maintenance, licence, sécurité) dans la description de la revue. Les versions sont figées par un fichier de verrouillage versionné. | Doit |

> **En attente du DAT (choix de stack)** : règles idiomatiques propres au langage (gestion de l'asynchronisme, mécanisme d'erreur, injection de dépendances, gestion de l'état de l'IHM). Décisions attendues : DS-01, DS-12, DS-13.

## 6. Modélisation du temps, des durées et du hasard

Ces règles sont transverses : le temps est au cœur du produit (journée, semaine, rappels, délais), et le hasard intervient dans les fun facts (DEM-002).

### 6.1 Types temporels
| Type | Signification | Représentation persistée | Exemples d'usage |
|---|---|---|---|
| `Instant` | Point absolu dans le temps | UTC, ISO 8601 avec `Z`, précision à la milliseconde | Horodatage d'une modification (RG-036), heure d'envoi effective d'un rappel |
| `DateCalendaire` | Jour calendaire, sans heure ni fuseau | `AAAA-MM-JJ` | Délai (selon Q-DEM001-28.4), journée d'une saisie de temps (RG-008), journée de planification (RG-006) |
| `HeureLocale` | Heure murale sans date ni fuseau | `HH:MM` | Heure des rappels (8 h, 21 h, RG-012, RG-013) |
| `Fuseau` | Fuseau IANA | `Europe/Paris` | Fuseau de l'appareil (RG-008), fuseau de l'agenda (Q-DEM001-37) |
| `SemaineIso` | Semaine ISO 8601, du lundi au dimanche | `AAAA-Www` | Vélocité (RG-010), historiques sur 12 semaines (RG-015, RG-016) |
| `Duree` | Durée en **minutes entières** | Entier de minutes | Estimation, reste à faire, capacité, temps passé |

Règles impératives :
- Aucune durée en nombre à virgule flottante. `Duree` est un entier de minutes ; la contrainte « multiple de 30 min » (RG-028) est un invariant vérifié à la construction des types concernés.
- Aucune conversion implicite entre `Instant` et `DateCalendaire` : elle exige toujours un `Fuseau` explicite.
- La journée d'une saisie (RG-008) est la `DateCalendaire` calculée **au moment de la saisie**, dans le fuseau de l'appareil, puis **persistée telle quelle**. Elle n'est jamais recalculée à partir d'un instant.
- Le formatage pour l'affichage (« 2 h 30 », « mercredi 21 octobre ») est de la responsabilité de la présentation.

### 6.2 Horloge injectable
- Toute lecture de l'heure courante passe par le port `Horloge` : `maintenant() → Instant` et `fuseauCourant() → Fuseau`.
- L'appel direct à l'horloge système ou au fuseau système hors de l'adaptateur `HorlogeSysteme` est **interdit**. La règle est vérifiée par le linter ou par un test d'architecture.
- En test : `HorlogeFixe` (instant et fuseau figés) et `HorlogeControlable` (`positionner(instant)`, `avancer(duree)`, `changerFuseau(fuseau)`).

### 6.3 Hasard injectable
- Tout tirage aléatoire passe par le port `SourceAleatoire` (par exemple `entierEntre(min, max)` ou `melanger(liste)`).
- En test : `SourceAleatoireDeterministe`, initialisée par une graine fixe ou par une séquence imposée.
- L'algorithme de répartition équitable des fun facts doit être **déterministe à source aléatoire donnée** (voir PT-01).

### 6.4 Identifiants
- Tout identifiant est produit par le port `GenerateurIdentifiants` ; en test, par un générateur séquentiel prévisible.
- L'usage hors ligne sur deux appareils (RG-021) impose des identifiants **générés sur l'appareil et globalement uniques**, jamais des compteurs séquentiels partagés. Le format est une décision de Starck (DS-08).

## 7. Gestion des erreurs

> **En attente du DAT (choix de stack)** pour le mécanisme concret : exceptions typées ou type résultat. Décision attendue : DS-12. Recommandation d'Anthony : **type résultat** (`Succes<T> | Echec<E>`) pour les erreurs métier et les erreurs techniques attendues, exceptions réservées aux erreurs de programmation.

### 7.1 Catégories
| Catégorie | Exemples | Traitement |
|---|---|---|
| **Erreur métier** (violation d'une RG à la saisie) | Estimation non multiple de 30 min (RG-028) ; délai de tâche absent (RG-003) ; tâche avec sous-tâches non terminées déclarée terminée (selon Q-DEM001-25.6) | Retournée explicitement par le domaine, typée, dans la signature. Affichée à l'utilisateur via le catalogue de messages. Non journalisée en erreur (niveau information au plus). |
| **Alerte métier** (situation signalée sans blocage) | Délai de tâche postérieur au délai d'un objectif (RG-024) ; planning qui dépasse la capacité (RG-011) ; temps passé supérieur à l'estimation (RG-009) | Ce n'est pas une erreur : l'opération réussit et le résultat porte la liste des alertes, typées. |
| **Erreur technique attendue** | Réseau indisponible ; accès Google révoqué ou expiré ; quota dépassé ; conflit de version au stockage distant ; jeton de synchronisation invalide ; stockage local plein | Traduite par l'adaptateur en erreur du port (§7.2). Le cas d'usage décide : nouvelle tentative, mise en file d'attente, passage en mode hors ligne, demande de reconnexion. |
| **Erreur de programmation** | Invariant violé dans le code, état impossible | Échec immédiat, journalisé en erreur avec contexte technique sans donnée personnelle. Jamais masquée. |

### 7.2 Erreurs des ports Google et du stockage
Chaque adaptateur traduit les erreurs de l'API en erreurs du port. Aucun code HTTP, aucune exception de SDK ne remonte au-delà de l'adaptateur. Liste minimale, complétée par le DAT :

| Erreur du port | Situation typique | Comportement attendu (à confirmer par le DAT et les US) |
|---|---|---|
| `ReseauIndisponible` | Pas de réseau, délai dépassé | Pas d'erreur pour l'utilisateur : passage en mode hors ligne, modification conservée localement et mise en file d'attente (RG-021, ENF-06). |
| `AutorisationExpiree` | Jeton d'accès expiré | Renouvellement transparent, puis une seule nouvelle tentative. |
| `AccesGoogleRevoque` | Révocation par l'utilisateur, jeton de renouvellement invalide | Avertissement et proposition de reconnexion (RG-035). Aucune donnée locale perdue. Comportement en attendant : selon Q-DEM001-22.2. |
| `PorteeInsuffisante` | Autorisation accordée partiellement | Message dédié et nouvelle demande de consentement. |
| `QuotaDepasse` | Limitation de débit | Nouvelle tentative avec attente exponentielle et gigue, nombre maximal de tentatives fixé par le DAT. |
| `ConflitDeVersion` | Donnée distante modifiée depuis la dernière lecture | Relecture, fusion selon RG-036, nouvelle écriture. |
| `JetonSynchroInvalide` | Jeton de lecture incrémentale de l'agenda expiré | Resynchronisation complète. |
| `RessourceIntrouvable` | Événement ou fichier supprimé hors de l'application | Selon l'US (RG-037, Q-DEM001-33.4 ; Q-DEM001-22.4). |
| `ErreurServeurDistant` | Erreur 5xx | Nouvelle tentative avec attente ; au-delà, état « synchronisation en attente » visible. |

### 7.3 Nouvelles tentatives et idempotence
- Une nouvelle tentative n'est admise que sur une opération idempotente, ou rendue idempotente (identifiant déterministe de l'événement, écriture conditionnelle sur version).
- L'attente entre tentatives passe par l'`Horloge` (ou un port `Minuterie`) pour être testable sans attente réelle. **Aucune attente réelle dans un test.**
- Les paramètres (nombre maximal, délai initial, plafond) sont des constantes de configuration nommées.

### 7.4 Interdits
- Capturer une erreur sans la traiter ni la propager (capture silencieuse).
- Capturer « toutes les erreurs » ailleurs qu'aux frontières : point d'entrée d'un traitement planifié, gestionnaire global de l'IHM.
- Utiliser une erreur pour le contrôle de flux nominal (par exemple « hors ligne » n'est pas une exception).
- Afficher à l'utilisateur un message technique, une trace de pile ou un code HTTP.

### 7.5 Catalogue de messages
- Chaque erreur ou alerte visible par l'utilisateur a un **code stable** (`ERR-<CONTEXTE>-nnn` ou `ALR-<CONTEXTE>-nnn`) et un texte en français, fourni par la spécification fonctionnelle ou par la maquette (Steeve).
- Les tests vérifient le **code**, et le texte seulement lorsque le `.feature` l'exige mot pour mot.

## 8. Sécurité, jetons OAuth, données personnelles et journalisation

Référentiels : OWASP ASVS pour la partie web et OWASP MASVS pour la partie mobile, selon la stack retenue ; recommandations Google sur OAuth 2.0 pour les applications natives et monopages ; RGPD (données personnelles de l'utilisateur, même s'il est seul).

### 8.1 Secrets
- Aucun secret dans le dépôt : ni identifiant client confidentiel, ni secret client, ni jeton, ni clé d'API, ni compte de test.
- La configuration passe par des variables d'environnement ou par le mécanisme du DAT. Un fichier d'exemple, sans valeur réelle, documente les clés attendues.
- Une application installée sur l'appareil (mobile, bureau, monopage) est un **client public** : elle ne peut pas garder de secret client. Le flux OAuth doit être adapté (code d'autorisation avec PKCE, ou flux imposé par le DAT). Si un secret est nécessaire, il ne peut résider que côté serveur : décision de Starck (DS-04, DS-05).
- La CI exécute un **détecteur de secrets** sur chaque modification ; un secret détecté bloque la fusion et doit être révoqué, pas seulement supprimé de l'historique.

### 8.2 Jetons OAuth
| Règle | Force |
|---|---|
| Les jetons (accès, renouvellement, identité) sont conservés uniquement dans le **stockage sécurisé de la plateforme**, via le port `CoffreJetons`. Mécanisme : DS-06. | Doit |
| Jamais de jeton dans : la base locale en clair, l'espace de stockage de l'utilisateur, une URL, un journal, un message d'erreur, un rapport de plantage, un fichier de test versionné. | Doit |
| Paramètres `state` et PKCE vérifiés ; URI de redirection strictement définies. | Doit |
| Portées OAuth **minimales** (ENF-05) : seules les portées nécessaires aux fonctions livrées. Toute nouvelle portée passe par Starck et figure dans la ST-US. | Doit |
| Révocation et déconnexion : les jetons locaux sont effacés et révoqués côté Google lorsque c'est possible. | Doit |
| Le jeton d'accès n'est jamais conservé plus longtemps que sa durée de validité ; il est renouvelé via le port. | Doit |

### 8.3 Données personnelles
Données concernées : objectifs, tâches, temps passés, capacité, contenu de l'agenda de l'utilisateur, **réponses aux questions de bilan du soir** (DEM-002, données d'introspection, à traiter comme les plus sensibles), adresse e-mail et profil Google.

- **Minimisation** : on ne lit de l'agenda que ce dont la RG a besoin (RG-033 : plages occupées, pas le contenu des événements de l'utilisateur, sauf décision contraire de Starck).
- **Aucune transmission à un tiers** : pas d'outil d'analyse d'audience, de télémétrie ou de rapport de plantage externe sans décision explicite de Starck validée par le commanditaire.
- Les données ne quittent l'appareil que vers l'espace de stockage de l'utilisateur et vers son agenda Google.
- Le contenu écrit dans l'agenda (descriptions des rappels et des créneaux) se limite à ce que les US prévoient. Les réponses de bilan ne sont **pas** écrites dans l'agenda sauf exigence explicite d'une US.
- Données locales : protection au repos selon DS-07 ; effacement à la déconnexion selon Q-DEM001-22.3.
- Validation de toutes les entrées : saisies de l'utilisateur, contenus lus depuis le stockage distant (un fichier modifié hors de l'application est une entrée non fiable, Q-DEM001-22.4), réponses des API.
- Échappement de toute donnée affichée (prévention XSS si la présentation est web), aucune évaluation dynamique de code, liens profonds validés.

### 8.4 Journalisation
- Toute journalisation passe par le port `Journal`. Niveaux : `erreur`, `avertissement`, `info`, `debug` ; `debug` est désactivé en production.
- Format structuré : événement nommé + champs.
- **Autorisé** : identifiants techniques opaques, codes d'erreur, noms de cas d'usage, durées d'exécution, compteurs, codes de statut HTTP, version de l'application, plateforme.
- **Interdit** : jetons et en-têtes d'autorisation, codes d'autorisation OAuth, adresse e-mail, nom, intitulés et descriptions d'objectifs ou de tâches, réponses de bilan, contenu des événements d'agenda, corps des requêtes et réponses Google, chemins de fichiers contenant des données de l'utilisateur.
- L'adaptateur `Journal` applique un **masquage défensif** des motifs sensibles (jetons, e-mails). Un test unitaire vérifie ce masquage.
- Destination des journaux (locale uniquement, durée de conservation, rotation) : DS-11.

### 8.5 Dépendances et chaîne d'approvisionnement
- Analyse des vulnérabilités des dépendances en CI : une vulnérabilité critique ou haute bloque la fusion, sauf dérogation tracée en dette avec plan.
- Vérification des licences des dépendances, compatibles avec l'usage prévu.

## 9. Stratégie de tests

### 9.1 Démarche TDD dans le workflow
| Phase | Étape | Acteur | Production |
|---|---|---|---|
| Spécification par l'exemple | E5 | Pepper | Fichiers `.feature`, tags `@US-xxx`, `@RG-xxx`, `@LOT-xxx` |
| Conception testable | E9 | Anthony | ST-US : interfaces, liste des tests unitaires fournis, step definitions à implémenter |
| **Rouge** | E10 | Anthony | Tests unitaires qui compilent, s'exécutent et **échouent pour la bonne raison** (comportement absent, pas erreur de syntaxe ni import manquant non prévu). Squelettes d'interfaces si nécessaire pour qu'ils compilent. |
| **Vert** | E12 | Benjamin | Implémentation minimale qui rend les tests passants, step definitions comprises |
| **Refactorisation** | E12 | Benjamin | Amélioration du code sous tests verts, sans changer de comportement |
| Contrôle | E13 | Anthony | Revue selon `checklist-revue-code.md` |

Les tests d'Anthony **font foi**. Benjamin ne les modifie, ne les désactive ni ne les affaiblit sans accord écrit d'Anthony, tracé dans la revue. S'il estime un test faux, il le signale via Jarvis ; Anthony corrige ou confirme.

### 9.2 Pyramide de tests
| Niveau | Cible | Doublures | Volume relatif | Temps cible | Auteur |
|---|---|---|---|---|---|
| Unitaires du domaine | Fonctions et objets du domaine, une RG par groupe de tests | Aucune (pur) | Le plus élevé | < 10 ms par test | Anthony (fournis), Benjamin (complémentaires) |
| Unitaires de l'application | Cas d'usage | Doublures des ports (faux en mémoire de préférence) | Élevé | < 50 ms par test | Anthony, Benjamin |
| Unitaires de la présentation | Logique de présentation extraite (états d'écran, formatage) | Doublures des cas d'usage | Moyen | < 50 ms par test | Anthony, Benjamin |
| Contrat des ports | Même suite exécutée contre la doublure et contre l'adaptateur réel | Serveur simulé, ou compte Google de test hors CI | Faible | — | Anthony (suite), Benjamin (adaptateurs) |
| Intégration | Adaptateurs de stockage local réel, sérialisation, migrations | Stockage réel temporaire | Faible | < 1 s par test | Benjamin, revus par Anthony |
| Acceptation (Cucumber) | Scénarios `.feature`, exécutés **au niveau de la couche application** (cas d'usage), avec les doublures Google et l'horloge contrôlable | Doublures Google, horloge, aléatoire | Un scénario par exemple métier | < 30 s pour la suite d'un lot | Pepper (`.feature`), Benjamin (steps) |
| Bout en bout IHM | Parcours critiques uniquement (scénarios tagués `@ihm`) | Doublures Google | Très faible | — | Benjamin, sur spécification d'Anthony |
| Recette manuelle | Ergonomie, accessibilité, intégration réelle Google | Aucune | — | — | Pepper, Steeve, Starck (E14) |

Choix structurant : les scénarios Cucumber pilotent les **cas d'usage**, pas l'IHM. Ils restent rapides et déterministes, et la logique d'IHM est couverte par les tests de présentation et par quelques parcours bout en bout. Un scénario n'est exécuté via l'IHM que s'il est tagué `@ihm` dans la ST-US.

> **En attente du DAT (choix de stack)** : cadre de tests unitaires, exécuteur Cucumber (en Gherkin français), outil de tests bout en bout par plateforme, outil de couverture, outil de tests par propriétés, outil de mutation. Décision attendue : DS-14.

### 9.3 Responsabilités
| Acteur | Responsabilité |
|---|---|
| Anthony | Stratégie de tests, tests unitaires « qui font foi » (E10), suites de contrat des ports, spécification des step definitions et des doublures dans la ST-US, revue des tests ajoutés par Benjamin |
| Benjamin | Implémentation des step definitions, des doublures et des adaptateurs ; tests complémentaires (cas découverts en implémentation, tests d'intégration des adaptateurs) ; maintien du vert |
| Pepper | Fichiers `.feature` : contenu métier, exemples, tags. Toute modification d'un `.feature` passe par elle. |
| Starck | Validation de la fidélité des doublures Google au comportement réel (E14) |

### 9.4 Règles d'écriture des tests
- **Nommage** : en français, sous la forme `<élément testé> — <résultat attendu> quand <condition>`. Exemple : « calculerResteAFaire — renvoie 1 h 30 quand l'estimation est de 2 h et le temps passé de 30 min ».
- **Identifiant** : chaque test fourni par Anthony porte un identifiant `UT-US-xxx-nn`, repris dans la ST-US, et la ou les RG couvertes.
- **Structure** Préparer / Agir / Vérifier, séparées visuellement. Un comportement par test.
- **Indépendance** : aucun ordre d'exécution, aucun état partagé, aucun fichier ou réseau réel dans les tests unitaires.
- **Déterminisme** : aucun accès à l'horloge système, au fuseau système, à l'aléatoire non maîtrisé, au réseau, ni d'attente réelle (`sleep`). Les tests passent quels que soient le fuseau et la langue de la machine qui les exécute ; la CI les exécute dans au moins deux fuseaux différents (§12).
- **Assertions précises** : sur des valeurs exactes et des types d'erreur, pas sur des messages techniques ni sur la seule absence d'erreur.
- **Préférer les faux aux simulacres** : faux en mémoire plutôt que vérification d'appels. La vérification d'interaction est réservée aux effets de bord qui sont le comportement attendu (par exemple : « un et un seul événement créé dans l'agenda »).
- Ne jamais simuler un type que l'on ne possède pas (SDK Google) : on simule le **port**.
- **Tests par propriétés** recommandés pour les invariants : arithmétique des durées, équité des fun facts, convergence de la synchronisation, ordre total de priorité.

### 9.5 Tests affaiblis : interdits
Constituent un affaiblissement, refusé en revue avec une gravité **Bloquante** :
- supprimer un test, ou en retirer ou relâcher une assertion ;
- marquer un test comme ignoré, en attente, ou en exécution exclusive dans une version fusionnée ;
- élargir une tolérance, remplacer une valeur exacte par une plage sans justification ;
- régénérer un instantané (*snapshot*) sans revue explicite de la différence ;
- remplacer par une doublure le code même qui est testé ;
- capturer l'erreur attendue de façon trop large (« une erreur quelconque » au lieu du type d'erreur précis) ;
- modifier un `.feature` sans passer par Pepper.

### 9.6 Fichiers `.feature`
- Emplacement et nommage fixés par le workflow : `tests/features/US-xxx-<titre>.feature`, `# language: fr`, tags `@US-xxx`, `@RG-xxx`, `@LOT-xxx` sur chaque scénario.
- Tags techniques admis, ajoutés par Pepper sur demande d'Anthony : `@ihm` (exécution via l'IHM), `@lent` (exclu de la boucle rapide mais exécuté en CI), `@google-reel` (exécuté uniquement manuellement contre un compte de test, jamais en CI). Le tag `@wip` est interdit sur une version fusionnée.
- **Attentes de testabilité** à l'égard des `.feature` (transmises à Pepper via Jarvis, sans modification de ses fichiers par Anthony) :
  - chaque scénario dépendant du temps fixe explicitement la date, l'heure et le fuseau (« Étant donné que nous sommes le mardi 2026-10-20 à 20:59 heure de Europe/Paris ») ; les expressions relatives (« aujourd'hui », « demain ») ne sont utilisées qu'après cette ancre ;
  - les durées sont écrites sous une forme unique (`2 h 30`, `30 min`, `0 h`), les dates au format `AAAA-MM-JJ`, les heures au format `HH:MM` ;
  - chaque scénario dépendant du hasard fixe la séquence de tirage ou s'exprime sous forme de propriété (« sur 300 jours, chaque fun fact est affiché exactement 3 fois ») ;
  - les états de Google sont décrits en termes métier (« l'accès Google a été retiré », « le créneau a été déplacé au jeudi dans Google Calendar »), jamais en termes d'API.

### 9.7 Step definitions
- **Emplacement** : `tests/steps/`, un fichier **par domaine** et non par US, pour éviter les doublons : `commun` (horloge, fuseau, réseau, compte Google, appareils), `objectifs`, `taches`, `priorisation`, `planification`, `suivi-temps`, `pilotage`, `rappels`, `synchronisation`.
- **Support** : `tests/support/` contient le monde partagé (contexte d'un scénario : horloge, source aléatoire, doublures Google, un ou deux appareils simulés), les hooks de réinitialisation et les **types de paramètres** communs : `{duree}`, `{date}`, `{heure}`, `{fuseau}`, `{jour-semaine}`, `{appareil}`.
- **Règles** :
  - une phrase Gherkin correspond à une seule définition ; une définition ambiguë ou manquante fait échouer la suite (mode strict) ;
  - les steps sont **minces** : ils traduisent la phrase en appel de cas d'usage ou en préparation de doublure, sans logique métier ni calcul de résultat attendu ;
  - les steps « Étant donné » préparent l'état par les cas d'usage ou par les fabriques de données, jamais en écrivant directement dans le stockage interne ;
  - les steps « Alors » vérifient via les requêtes de l'application ou l'état observable des doublures Google (événements de l'agenda, fichiers du stockage distant) ;
  - chaque ST-US liste les phrases à implémenter, le fichier cible, et indique si le step est nouveau ou réutilisé.
- **Isolation** : chaque scénario démarre d'un monde neuf.

### 9.8 Données de test
- Données construites par des **fabriques** à valeurs par défaut valides (par exemple : une tâche à faire, estimée à 2 h, avec un délai à J+7 de l'horloge du test), surchargées uniquement sur ce que le test vérifie.
- Pas de jeu de données partagé mutable entre tests.
- **Aucune donnée personnelle réelle**, aucun compte Google réel dans les tests automatisés. Les intitulés sont fictifs et neutres.
- Fun facts : un jeu de 100 fun facts **fictifs** (« Fun fact de test n° 001 » à « n° 100 ») pour les tests ; le contenu réel relève de la spécification fonctionnelle.
- Identifiants prévisibles (`tache-001`, `objectif-001`) produits par le générateur de test.
- Les réponses Google enregistrées pour les tests de contrat sont anonymisées et versionnées dans `tests/contrats/`.

### 9.9 Doublures des API Google
Les API Google réelles ne sont **jamais** appelées par les tests automatisés de la CI.

| Doublure | Comportements à simuler (sur commande du test) |
|---|---|
| `FauxFournisseurIdentite` | Connexion réussie ou refusée ; consentement partiel ; expiration du jeton d'accès ; révocation (jeton de renouvellement invalide) ; déconnexion |
| `FauxStockageDistant` | Lecture et écriture avec numéro de version ; écriture conditionnelle refusée en cas de version périmée ; fichier supprimé ou modifié hors de l'application ; quota ; réseau coupé ; latence simulée sans attente réelle |
| `FauxAgendaGoogle` | Création, mise à jour et suppression d'événements avec identifiant fourni ; refus d'un identifiant déjà utilisé ; lecture incrémentale par jeton de synchronisation ; invalidation du jeton (resynchronisation complète) ; modification ou suppression d'un événement « par l'utilisateur » ; fuseau de l'agenda ; événements de l'utilisateur (disponible ou occupé, journée entière, accepté ou refusé) ; quota ; erreurs serveur ; pagination |

- Chaque doublure est soumise à la **suite de contrat** de son port. La même suite est exécutable manuellement contre l'adaptateur réel et un compte Google de test (tag `@google-reel`), afin de vérifier la fidélité de la doublure. Starck valide cette fidélité en E14.
- Les doublures exposent une **API de pilotage** pour les tests (`simulerRevocation()`, `deplacerEvenementCommeUtilisateur(id, nouvelleDate)`, `couperReseau()`…) et une **API d'observation** (`evenementsDeLApplication()`, `nombreAppels(operation)`).

### 9.10 Tests liés au temps
Cas à couvrir systématiquement dès qu'une RG dépend du temps. La ST-US indique lesquels s'appliquent.

| Cas | Exemple de valeurs de test |
|---|---|
| Minuit | 23:59:59.999 et 00:00:00.000 du lendemain, dans le fuseau concerné |
| Passage à l'heure d'hiver (Europe/Paris) | Dimanche 2026-10-25 : 03:00 devient 02:00 ; l'heure 02:30 existe deux fois |
| Passage à l'heure d'été (Europe/Paris) | Dimanche 2027-03-28 : 02:00 devient 03:00 ; l'heure 02:30 n'existe pas |
| Rappel à une heure inexistante ou ambiguë | Rappel réglé à 02:30 les deux dimanches ci-dessus (comportement à spécifier, PT-02) |
| Semaine ISO | Lundi 00:00 et dimanche 23:59 ; année ISO à 53 semaines : 2026-W53 va du lundi 2026-12-28 au dimanche 2027-01-03 |
| Fin d'année et année bissextile | 2026-12-31 → 2027-01-01 ; 2028-02-29 |
| Changement de fuseau de l'appareil | Saisie à Paris puis à New York (RG-008) |
| Fuseaux différents sur les deux appareils | Smartphone en `America/New_York`, PC en `Europe/Paris` (Q-DEM001-37) |
| Fuseaux de test | `Europe/Paris` (référence), `UTC`, `America/Los_Angeles`, `Pacific/Auckland` (décalage positif important, et passage à l'heure d'été en sens inverse) |
| Application non ouverte pendant plusieurs jours | Report automatique et rappels « en retard » : rattrapage idempotent (PT-07) |
| Horloges d'appareils décalées | Appareil A en avance de 5 min sur l'appareil B (RG-036, PT-03) |

### 9.11 Tests de synchronisation
- Un **banc de synchronisation** simule deux appareils (`smartphone`, `pc`), chacun avec son stockage local, son horloge contrôlable et son état réseau, partageant un même `FauxStockageDistant` et un même `FauxAgendaGoogle`.
- Propriétés vérifiées : **convergence** (après synchronisation des deux appareils, leurs données sont identiques), **aucune perte silencieuse** (ENF-06 : toute valeur écartée est signalée), **idempotence** (synchroniser deux fois ne change rien), **reprise** (une synchronisation interrompue puis relancée aboutit au même état).
- Tests par propriétés recommandés : séquences aléatoires, mais à graine fixe et rejouable, de modifications, coupures et synchronisations sur les deux appareils.

## 10. Couverture minimale

> **En attente du DAT (choix de stack)** pour l'outil de mesure. Décision attendue : DS-14.

| Périmètre | Lignes | Branches | Remarque |
|---|---|---|---|
| Domaine | 95 % | 90 % | Toute RG a au moins un test unitaire qui la cite |
| Application (cas d'usage) | 90 % | 85 % | — |
| Logique de présentation extraite | 80 % | 70 % | Les composants purement visuels sont exclus du calcul |
| Infrastructure (adaptateurs) | 70 % | 60 % | Complétée par les tests de contrat |
| Global | 85 % | 75 % | — |

Règles :
- **Non-régression** : la couverture d'un fichier modifié ne doit pas baisser.
- Exclusions de couverture : uniquement la composition et le code généré, déclarées dans la configuration, jamais par annotation locale sans justification en revue.
- **Couverture fonctionnelle** : chaque critère d'acceptation a au moins un scénario Cucumber ; chaque RG du lot a au moins un scénario tagué `@RG-xxx` et au moins un test unitaire qui la cite. Un contrôle automatique vérifie que chaque tag `@RG-xxx` d'un `.feature` existe dans le cahier des charges.
- **Tests de mutation** sur le domaine : recommandés dès le premier lot, avec un score cible de 70 % ; seuil bloquant à décider en version 1.0 de ce document.
- La couverture est un indicateur, pas un objectif : un test sans assertion utile est refusé en revue même s'il augmente la couverture.

## 11. Gestion de configuration et branches Git

### 11.1 Branches
| Branche | Rôle | Créée depuis | Fusionnée vers | Quand |
|---|---|---|---|---|
| `main` | Version de référence, toujours verte et livrable | — | — | Protégée : pas de commit direct de code ; fusion par revue uniquement |
| `lot/LOT-xxx-<slug>` | Intégration du lot en développement | `main` | `main` | Créée en E10, fusionnée en E17 (clôture du lot) |
| `us/US-xxx-<slug>` | Une branche par US | `lot/LOT-xxx-<slug>` | `lot/LOT-xxx-<slug>` | Créée en E10 (tests rouges d'Anthony), développée en E12, fusionnée après **Approuvé** en E13 |
| `ano/ANO-xxx-<slug>` | Correction d'une anomalie de recette | `lot/LOT-xxx-<slug>` | `lot/LOT-xxx-<slug>` | E15, puis revue E13 |

- Une seule branche de lot en développement à la fois, conformément au workflow (un seul lot en E12–E13).
- Une branche d'US est mise à jour par **rebase** sur la branche de lot avant la revue ; la fusion se fait **sans avance rapide** (`--no-ff`), pour garder la trace de l'US dans l'historique.
- Les commits de tests rouges (E10) sont admis sur la branche d'US uniquement ; la branche de lot et `main` restent vertes.
- Les documents des agents (`docs/`, `tests/features/`) suivent le circuit défini par Jarvis. Ils ne sont pas soumis à la revue de code.

### 11.2 Convention de commits
Format inspiré de *Conventional Commits*, résumé en français :
```
<type>(<portée>): <résumé à l'impératif, 72 caractères au plus>

<corps facultatif : le pourquoi, les choix>

Réf: US-xxx[, RG-xxx][, RC-US-xxx-n][, ANO-xxx][, DT-xxx]
```
- `type` : `feat` (évolution fonctionnelle), `fix` (correction), `test` (tests seuls), `refactor` (sans changement de comportement), `perf`, `build`, `ci`, `docs`, `chore`.
- `portée` : l'US (`US-002`) ou, à défaut, le contexte (`synchronisation`).
- Exemples : `test(US-002): tests unitaires en phase rouge du calcul du reste à faire` ; `feat(US-002): calcul du reste à faire après saisie du temps (RG-009)` ; `fix(US-002): traiter RC-US-002-3`.
- Commits **atomiques** : un commit compile et ne mélange pas refactorisation et changement de comportement.
- Les commits de documentation des agents conservent la convention déjà en usage dans le dépôt : `Ex <objet> : <résumé>`.
- Les lignes d'attribution demandées par l'environnement sont ajoutées en fin de message.

### 11.3 Versions et livrables
- Versionnement sémantique de l'application ; une étiquette `vX.Y.Z` est posée sur `main` à la clôture de chaque lot (E17).
- Les fichiers de verrouillage des dépendances sont versionnés. Les artefacts de build, les secrets, les données locales et les rapports de tests ne le sont pas.
- Les migrations de données (stockage local et format des données dans l'espace de l'utilisateur) sont versionnées, ordonnées et accompagnées de tests (§13).

## 12. Outillage attendu

> **En attente du DAT (choix de stack)** pour le choix des outils. Décisions attendues : DS-14 (tests), DS-16 (outillage qualité), DS-17 (plateforme de CI). Les catégories et les seuils ci-dessous sont exigés quelle que soit la stack.

| Catégorie | Exigence | Bloquant en CI |
|---|---|---|
| Formatage | Formateur automatique, configuration versionnée, vérification sans modification en CI | Oui |
| Lint | Règles strictes, dont complexité (RCD-01), nombre de paramètres (RCD-02), interdiction de l'horloge et de l'aléatoire système hors adaptateurs (§6) ; zéro avertissement | Oui |
| Vérification de types | Mode le plus strict disponible | Oui |
| Règles d'architecture | Contrôle automatique des dépendances entre couches et entre contextes (§2.2, §3.1) | Oui |
| Tests unitaires | Exécution complète, rapport par identifiant `UT-US-xxx-nn` | Oui |
| Couverture | Seuils du §10, non-régression par fichier | Oui |
| Tests de contrat | Suites de contrat contre les doublures | Oui |
| Cucumber | Mode strict (step indéfini, ambigu ou en attente = échec), Gherkin français, filtrage par tags | Oui |
| Multi-fuseaux | Tests unitaires et Cucumber exécutés avec au moins deux fuseaux système (`UTC` et `Pacific/Auckland`) | Oui |
| Analyse statique de sécurité (SAST) | Règles OWASP adaptées au langage | Oui (gravité haute et critique) |
| Détection de secrets | Sur chaque commit et sur l'historique de la branche | Oui |
| Analyse des dépendances (SCA) | Vulnérabilités connues ; licences | Oui (gravité haute et critique) |
| Tests de mutation | Sur le domaine | Non à la v0.1 (indicateur) |
| Tests bout en bout | Parcours `@ihm` par plateforme | Selon DS-14 |
| Build | Production des artefacts de chaque plateforme cible (smartphone, PC) | Oui |
| Hooks locaux | Formatage, lint et détection de secrets avant commit | Recommandé |

Pipeline de CI attendu, dans l'ordre : installation avec dépendances verrouillées → formatage → lint → types → règles d'architecture → tests unitaires et couverture → tests de contrat → Cucumber → sécurité (SAST, secrets, SCA) → build par plateforme → bout en bout (selon DS-14). Durée cible inférieure à 10 minutes pour la boucle hors bout en bout. La CI s'exécute sur chaque branche `us/`, `ano/`, `lot/` et sur `main`.

## 13. Definition of Done technique

Une US est soumise à la revue (E13) seulement si **tous** les points suivants sont vérifiés par Benjamin, puis contrôlés par Anthony :

**Tests**
- [ ] Tous les tests unitaires fournis par Anthony pour l'US sont passants, **sans modification** (ou avec un accord écrit d'Anthony tracé dans la revue).
- [ ] Tous les scénarios Cucumber de l'US sont passants, en mode strict ; aucun step indéfini, ambigu ou en attente.
- [ ] Aucune régression : la suite complète (unitaires, contrat, Cucumber) est verte sur la branche de l'US rebasée sur la branche de lot.
- [ ] Les seuils de couverture (§10) sont respectés, sans baisse sur les fichiers modifiés.
- [ ] Les tests passent dans les fuseaux de la CI (§12).
- [ ] Les tests ajoutés par Benjamin respectent §9.4 et ne dupliquent pas ceux d'Anthony.

**Qualité**
- [ ] Formatage, lint, types, règles d'architecture et analyses de sécurité au vert, sans nouvelle suppression d'avertissement non justifiée.
- [ ] Conformité à la ST-US : composants, signatures, modèle de données, erreurs, patterns imposés. Tout écart est validé par Anthony avant la revue.
- [ ] Règles de nommage et de codage (§4, §5) respectées ; chaque RG implémentée est référencée dans le code.
- [ ] Aucun `TODO` sans `DT-xxx` ; toute dette introduite est déclarée à Anthony pour le registre.

**Sécurité et données**
- [ ] Aucun secret, jeton ou donnée personnelle dans le code, les tests, les journaux ou l'historique Git.
- [ ] Portées OAuth inchangées, ou évolution prévue par la ST-US et validée par Starck.
- [ ] Les entrées externes sont validées ; les erreurs Google sont traduites par les adaptateurs.

**Données et compatibilité**
- [ ] Toute évolution du modèle de données est accompagnée d'une migration versionnée et testée, y compris sur des données produites par la version précédente.
- [ ] Les données existantes dans l'espace de l'utilisateur restent lisibles par la version précédente de l'application installée sur l'autre appareil, ou l'incompatibilité est gérée selon le DAT (DS-10).

**Livraison**
- [ ] Commits conformes au §11.2 ; branche à jour avec la branche de lot.
- [ ] Demande de revue contenant : résumé des changements, écarts éventuels à la ST-US, dette déclarée, sortie des commandes de tests, de couverture et d'analyse.
- [ ] Documentation technique mise à jour si nécessaire (ST-US « tel que réalisé », glossaire code §4.2).

## 14. Points de testabilité à traiter

Exigences fonctionnelles identifiées dès maintenant comme difficiles à tester, ou non testables en l'état. Chaque point indique l'approche de test retenue ou proposée et le destinataire de la question. Les questions destinées à Pepper ou à Starck leur sont transmises **par Jarvis** ; elles deviendront, une fois les US rédigées, des demandes `Q-US-xxx-n` en E8 si elles ne sont pas réglées entre-temps.

### PT-01 — Fun facts « aléatoires » et « présentés aussi souvent que les autres » (RG-040 à RG-042, DEM-002)
- **Difficulté** : « aléatoire » et « aussi souvent que les autres » sont contradictoires si on les teste statistiquement : un tirage indépendant uniforme ne garantit l'égalité qu'en moyenne, et un test statistique est soit instable, soit trop permissif.
- **Approche** : tirage **sans remise par cycles** (option a de Q-DEM002-6, recommandée par Pepper, en attente de la réponse du commanditaire). La liste est mélangée par la `SourceAleatoire`, puis parcourue ; un nouveau mélange intervient quand elle est épuisée. Propriétés testables de façon **déterministe** avec la `SourceAleatoireDeterministe` :
  - après k × 100 rappels, chaque fun fact a été présenté exactement k fois ;
  - à tout instant, l'écart entre le fun fact le plus présenté et le moins présenté est d'au plus 1 ;
  - aucun fun fact n'est présenté deux fois au cours d'un même cycle ;
  - le dernier fun fact d'un cycle n'est jamais le premier du cycle suivant ;
  - à graine égale, la séquence est identique (rejouabilité).
  Si l'option b (tirage indépendant) était retenue, RG-042 ne serait vérifiable que statistiquement : Anthony le signalerait alors en E8 comme non testable de façon fiable.
- **Questions déjà posées par Pepper**, à suivre : Q-DEM002-4 (origine, langue), Q-DEM002-5 (liste modifiable), Q-DEM002-6 (sens de l'égalité), Q-DEM002-7 (jour sans tâche).
- **Questions complémentaires pour Pepper**, à traiter lors de la rédaction de US-035 : (1) qu'est-ce qui compte comme « présenté » : l'inclusion dans l'événement du matin créé dans l'agenda, ou la consultation par l'utilisateur ? (2) un jour sans rappel (accès Google perdu, aucun appareil actif) consomme-t-il un fun fact du cycle ?
- **Pour Starck** (point S10 de LOT-001) : l'égalité doit tenir quand l'utilisateur alterne entre ses deux appareils. Le brouillon du DAT v0.1 (§6.3, ADR-008) propose un calcul **sans état partagé** : le fun fact du jour J est une fonction pure de (graine, date d'origine, J, liste). Cette approche est la plus testable ; elle répond aussi à la question complémentaire (2) ci-dessus, puisqu'un jour sans rappel consomme son fun fact. Elle sera confirmée par Pepper et par le commanditaire, via Q-DEM002-6. La graine ne doit pas provenir de l'aléatoire système au moment du calcul : elle est fixée une fois, persistée, et injectée en test.

### PT-02 — Rappels à 8 h et à 21 h (RG-012 à RG-014, DEM-002)
- **Difficulté** : un déclenchement à heure fixe ne se teste pas en attendant l'heure réelle ; le contenu doit être figé à l'heure du rappel (RG-012 : pas de mise à jour après son heure) ; plusieurs appareils peuvent produire le même rappel.
- **Approche** : séparer la fonction pure « contenu du rappel du jour J à l'instant T » de son déclenchement (§2.4), et tester la fonction avec l'`Horloge` contrôlable ; tester l'idempotence (un seul événement par jour et par type de rappel, même si les deux appareils le produisent) avec le banc à deux appareils.
- **Questions pour Starck** (décision structurante, DS-09 ; le brouillon du DAT v0.1 §5 et ADR-007 y répondent par une série récurrente Google Calendar dont le contenu est précalculé jusqu'à J+7, à confirmer) : **qui produit le rappel à 8 h si aucun appareil n'est ouvert** ? Sans serveur, une application mobile ou monopage ne peut pas garantir une exécution à heure fixe. Options : création anticipée des événements, avec mise à jour jusqu'à leur heure ; tâche de fond de la plateforme ; composant serveur. La réponse conditionne la testabilité de « contenu figé à 8 h » et du rattrapage.
- **Questions pour Pepper** : (1) gabarit **exact** du titre et de la description des événements de rappel (y compris fun fact, questions de bilan, alertes de délais selon RG-007) pour permettre une assertion exacte ; (2) comportement si l'heure de rappel n'existe pas ou existe deux fois (changement d'heure) ; (3) effet d'une modification de l'heure de rappel sur le rappel du jour même ; (4) rappel « manqué » (aucun appareil actif) : créé en retard, ou pas du tout ; (5) fuseau de référence (Q-DEM001-37).

### PT-03 — Conflits de synchronisation : « la modification la plus récente l'emporte » (RG-036, ENF-06)
- **Difficulté** : « la plus récente » suppose une horloge commune ; or les horloges des appareils peuvent être décalées, et une modification hors ligne peut être synchronisée des heures plus tard. Deux modifications peuvent porter le même horodatage. La granularité n'est pas tranchée (Q-DEM001-23).
- **Approche** : banc à deux appareils (§9.11), horloges décalées, tests par propriétés (convergence, aucune perte silencieuse).
- **Questions pour Starck** : (1) horodatage de référence : horloge de l'appareil au moment de la saisie, horloge logique hybride, ou heure du serveur de stockage ? (2) critère de départage déterministe en cas d'égalité (par exemple identifiant d'appareil) ; (3) conflit entre suppression et modification (marqueurs de suppression et durée de conservation) ; (4) granularité technique (par champ ou par entité) selon la réponse à Q-DEM001-23.
- **Question pour Pepper** : comment l'utilisateur est-il informé d'une valeur écartée (Q-DEM001-23.2) : contenu exact et durée de l'information ?

### PT-04 — « Visible sur l'autre appareil dans l'heure qui suit » (RG-017, ENF-02)
- **Difficulté** : un délai d'une heure n'est pas vérifiable par un test automatisé en temps réel, et dépend du réseau et de l'activité des appareils.
- **Approche** : reformuler en critères de **mécanisme** testables avec l'horloge contrôlable : synchronisation à l'ouverture de l'application (Q-DEM001-21.2) ; synchronisation périodique de période P inférieure ou égale à 60 min tant que l'application est active ; synchronisation au retour du réseau. Le délai de bout en bout relève de la recette technique de Starck (E14).
- **Question pour Pepper** : les critères d'acceptation peuvent-ils être formulés ainsi, avec les conditions explicites (deux appareils connectés, application ouverte ou non) ?

### PT-05 — Créneau déplacé ou supprimé dans Google Calendar (RG-037)
- **Difficulté** : distinguer un déplacement fait par l'utilisateur d'une modification faite par l'application elle-même (risque de boucle) ; moment « le soir » ; déplacement dans la même journée ; suppression (Q-DEM001-33).
- **Approche** : `FauxAgendaGoogle` avec `deplacerEvenementCommeUtilisateur()` ; vérification qu'une modification d'origine applicative ne produit aucune notification ; proposition du soir testée avec l'horloge.
- **Question pour Starck** : mécanisme de détection (lecture incrémentale ou notifications push) et marquage des événements de l'application.

### PT-06 — Journée déterminée par l'heure locale de l'appareil (RG-008) et fuseau de l'agenda (Q-DEM001-37)
- **Difficulté** : deux appareils dans deux fuseaux peuvent avoir deux « aujourd'hui » différents ; les rappels et les créneaux vivent dans le fuseau de l'agenda.
- **Approche** : persister la `DateCalendaire` de la saisie (§6.1) ; tests multi-fuseaux (§9.10).
- **Question pour Pepper** : pour le rappel du soir, le « temps passé dans la journée » se rapporte-t-il à la date calendaire saisie sur l'appareil, ou à la journée dans le fuseau de l'agenda ?

### PT-07 — Report automatique (RG-032)
- **Difficulté** : « automatique » sans moment défini ; si aucun appareil n'est ouvert pendant plusieurs jours, le rattrapage doit être correct et idempotent ; interaction avec la capacité nulle (Q-DEM001-32.5) et avec les créneaux de l'agenda (déplacement des événements).
- **Approche** : fonction pure « tâches à reporter à l'instant T » ; tests d'ouverture après 1, 3 et 10 jours d'inactivité ; exécution sur deux appareils sans double report.
- **Question pour Pepper** : à quel instant le report a-t-il lieu (minuit dans quel fuseau, ou première ouverture) et que devient le créneau de l'agenda du jour passé ?

### PT-08 — Vélocité hebdomadaire et historiques sur 12 semaines (RG-010, RG-015, RG-016)
- **Difficulté** : semaine de rattachement (Q-DEM001-30.4), tâches rouvertes (Q-DEM001-30.5), année ISO à 53 semaines, fuseau du « jour de fin ». L'évolution du backlog sur 12 semaines exige la **valeur passée** des restes à faire : elle n'est pas recalculable si seules les valeurs courantes sont conservées.
- **Approche** : tests sur 2026-W53 et à cheval sur deux années ; données historiques construites par fabriques.
- **Question pour Starck** (point S7 de LOT-001) : historisation (instantanés hebdomadaires, ou journal des événements permettant de reconstituer le passé) et date de départ des courbes pour un nouvel utilisateur. La décision doit être prise **avant E9 de LOT-001** : les données nécessaires (dates de fin, d'abandon, de réouverture ; valeurs successives du reste à faire) doivent être enregistrées dès le premier lot.

### PT-09 — Arithmétique des durées au pas de 30 min (RG-028, RG-009, Q-DEM001-31)
- **Difficulté** : précision du temps passé non tranchée (Q-DEM001-31.3) ; reste à faire négatif ; correction manuelle puis nouvelle saisie (Q-DEM001-31.1).
- **Approche** : `Duree` en minutes entières, invariants à la construction, tests par propriétés (somme, différence, bornes).
- **Question pour Pepper** : valeur affichée et stockée quand le temps passé dépasse le reste à faire (zéro ou négatif) et règle d'arrondi si la saisie à la minute est retenue.

### PT-10 — Ordre de priorité (RG-005, RG-030, Q-DEM001-35)
- **Difficulté** : sans critère de départage final, l'ordre n'est pas total et les tests deviennent instables (deux résultats valides).
- **Approche** : exiger un **ordre total** (dernier critère unique, par exemple date de création puis identifiant) ; test par propriété : le tri est stable et reproductible.
- **Question pour Pepper** : critère de départage final, et insertion d'une nouvelle tâche dans un ordre modifié à la main (Q-DEM001-35.5).

### PT-11 — Horaire suggéré et capacité réduite par les événements (RG-033, RG-034, Q-DEM001-32, Q-DEM001-34)
- **Difficulté** : un algorithme de suggestion est testable seulement s'il est entièrement spécifié (plages de travail, ordre de placement, événements retenus, chevauchements, granularité de l'horaire).
- **Approche** : fonction pure (tâches planifiées, plages, événements occupés, fuseau) → horaires ; jeux d'exemples tabulaires dans les `.feature`.
- **Question pour Pepper** : algorithme déterministe exprimé par des exemples, dont les cas : aucune plage libre, tâche plus longue que la plage libre, événement à cheval sur minuit, événement « journée entière ».

### PT-12 — Perte d'accès Google et révocation (RG-035, Q-DEM001-22)
- **Difficulté** : distinguer l'expiration normale du jeton d'accès (renouvellement transparent) de la révocation (reconnexion nécessaire) ; comportement de l'application en attendant (Q-DEM001-22.2) ; garantie « aucune donnée perdue ».
- **Approche** : `FauxFournisseurIdentite` et banc de synchronisation : saisies pendant la révocation, reconnexion, vérification que tout est enregistré dans l'espace distant.

### PT-13 — Hors ligne et « aucune perte de donnée » (RG-021, ENF-04, ENF-06)
- **Difficulté** : la perte de donnée survient typiquement lors d'un arrêt brutal de l'application en cours d'écriture ou de synchronisation, difficile à reproduire.
- **Approche** : écriture locale d'abord, puis file d'attente persistante ; tests d'intégration simulant une interruption à chaque étape de la synchronisation (injection de pannes dans les doublures), puis vérification de la reprise.
- **Question pour Starck** (point S3 de LOT-001) : garanties transactionnelles du stockage local retenu (DS-07) et format de la file d'attente. Si le hors ligne est reporté après LOT-001, le comportement du lot 1 sans réseau (« une connexion est nécessaire, aucune saisie perdue sans prévenir ») doit lui aussi être testé : saisie en cours au moment de la coupure, écriture distante échouée.

### PT-14 — Questions de bilan du soir (RG-038, RG-039, DEM-002)
- **Difficulté** : un événement d'agenda ne permet pas de saisir une réponse ; le lieu et le moment de la saisie, le caractère facultatif, la conservation et la consultation des réponses ne sont pas spécifiés.
- **Approche** : à définir après les réponses à Q-DEM002-1 à 3 et la rédaction de US-033 et US-034. Les réponses seront traitées comme les données les plus sensibles (§8.3). Si l'option a) de Q-DEM002-1 est retenue (lien du rappel vers l'écran de réponse), le lien profond devra être spécifié (format, validation, comportement si l'application n'est pas installée sur l'appareil qui l'ouvre) et testé.
- **Questions complémentaires pour Pepper**, à traiter lors de la rédaction de US-033 : (1) longueur maximale d'une réponse ; (2) les réponses apparaissent-elles dans l'agenda ? Recommandation d'Anthony : non (§8.3) ; (3) à quelle journée une réponse saisie après minuit se rattache-t-elle (cohérence avec RG-008) ?

### PT-15 — Alertes de délais « dans les rappels » (RG-007)
- **Difficulté** : contenu non spécifié ; dépend de la vélocité (Q-DEM001-30) et du démarrage sans historique.
- **Approche** : gabarit exact du rappel (PT-02) et exemples chiffrés dans les `.feature`.

## 15. Décisions attendues de Starck (récapitulatif)

Ces décisions conditionnent la version 1.0 du présent document. Elles sont transmises à Starck par Jarvis.

| Id | Décision attendue | Sections concernées |
|---|---|---|
| DS-01 | Langage(s) et versions, conventions idiomatiques associées | §3, §4.3, §5, §7 |
| DS-02 | Forme de l'application sur smartphone et sur PC (base de code unique ou non : application web progressive, multiplateforme, native…) et partage du code entre plateformes | §3, §12 |
| DS-03 | Présence ou absence d'un composant serveur, et son rôle (OAuth, rappels, synchronisation) | §2.3, §8.1, PT-02 |
| DS-04 | Flux OAuth (code d'autorisation avec PKCE, client public ou confidentiel) et gestion de l'identifiant client par environnement | §8.1, §8.2 |
| DS-05 | Portées Google minimales (stockage et agenda) et stratégie de consentement progressif | §8.2, ENF-05 |
| DS-06 | Mécanisme de stockage sécurisé des jetons par plateforme (`CoffreJetons`) | §8.2 |
| DS-07 | Stockage local (moteur, garanties transactionnelles, chiffrement au repos) | §8.3, PT-13 |
| DS-08 | Format des identifiants générés hors ligne | §6.4 |
| DS-09 | Mécanisme de production des rappels à heure fixe et des traitements planifiés (report, replanification du soir), avec idempotence entre appareils | §2.4, PT-02, PT-07 |
| DS-10 | Format et organisation des données dans l'espace de l'utilisateur (fichier unique ou découpé, emplacement, versionnement du schéma, compatibilité entre versions de l'application sur deux appareils, migrations) | §11.3, §13 |
| DS-11 | Synchronisation : stratégie, métadonnées de conflit (horodatage, horloge logique, départage), marqueurs de suppression, file d'attente hors ligne ; observabilité et destination des journaux | §9.11, PT-03, PT-04, §8.4 |
| DS-12 | Mécanisme de gestion des erreurs (type résultat ou exceptions) et asynchronisme | §7 |
| DS-13 | Injection de dépendances et gestion d'état de l'IHM | §2.2, §5 |
| DS-14 | Outillage de tests : unitaires, Cucumber en Gherkin français, bout en bout par plateforme, couverture, tests par propriétés, mutation | §9.2, §10, §12 |
| DS-15 | Arborescence physique du dépôt (monodépôt, paquets, colocalisation des tests) | §3 |
| DS-16 | Outillage qualité : formateur, linter, vérificateur de types, règles d'architecture, SAST, détection de secrets, SCA | §12 |
| DS-17 | Plateforme de CI, environnements, distribution des applications | §12 |
| DS-18 | Intégration Google Calendar : marquage des événements de l'application, identifiants déterministes (idempotence), lecture incrémentale ou notifications push, gestion des quotas et du fuseau de l'agenda | §2.3, §7.2, PT-02, PT-05 |
| DS-19 | Historisation nécessaire aux courbes sur 12 semaines (instantanés ou journal d'événements) et données à conserver dès LOT-001 | PT-08 |
| DS-20 | Emplacement de la liste des fun facts (donnée non personnelle) et partage de l'état du cycle de tirage entre appareils | PT-01 |

Correspondance avec les points soumis à Starck par Pepper dans `docs/lots/LOT-001.md` §7 : S1 → DS-03, DS-10 ; S2 → DS-02 ; S3 → DS-07, DS-11 ; S4 → DS-11 ; S5 → DS-11 ; S6 → DS-04, DS-06 ; S7 → DS-19 ; S8 → DS-05 ; S9 → DS-09 ; S10 → DS-20. Les décisions DS-01, DS-02, DS-03, DS-05, DS-07, DS-10, DS-11, DS-14, DS-15 et DS-16 sont **nécessaires avant la conception détaillée de LOT-001 (E9)**.

## 16. Documents associés
- `checklist-revue-code.md` : grille de revue de code (E13).
- `modele-ST-US.md` : gabarit des spécifications techniques par US (E9).
- `dette-technique.md` : registre de la dette technique.
- `docs/03-architecture/DAT.md` et ADR : à paraître (Starck).
