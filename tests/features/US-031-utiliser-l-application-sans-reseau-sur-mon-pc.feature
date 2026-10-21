# language: fr
#
# Tests métiers — US-031 — Utiliser l'application sans réseau sur mon PC
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.11, US-031
# E8 (Pepper, 2026-10-21) : réponses aux demandes de précision d'Anthony (explicitation-LOT-001.md, « Réponses aux Q-US ») ; glossaire d'étapes v1.2.
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).
# Tag @ihm (E7, ANT-5, ANT-6) : S01a, S01b, S08, S14, S15, S16 et S17 ne se vérifient que par l'interface réelle
# (adresse web, application installée, onglets, navigateur, saisie en cours) ; les autres s'exécutent au niveau des cas d'usage.
# S01 est scindé (S01a adresse web, S01b application installée).

Fonctionnalité: Utiliser l'application sans réseau sur mon PC
  En tant qu'utilisateur,
  je veux consulter et saisir mes données sur mon PC sans réseau,
  mes modifications étant prises en compte au retour du réseau,
  afin d'avoir le même comportement sur mes deux appareils.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |

  # ---------------------------------------------------------------- Ouverture et opérations sans réseau (CA-1, CA-2)

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S01a — L'application s'ouvre sans réseau sur le PC depuis son adresse web
    Étant donné que l'application est fermée sur le PC
    Et que le PC est sans réseau
    Quand l'utilisateur ouvre l'application sur le PC depuis son adresse web
    Alors sur le PC, les données présentes sur le PC s'affichent aussitôt
    Et sur le PC, la tâche "Chapitre 1" existe avec le délai 2026-11-30

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S01b — L'application s'ouvre sans réseau sur le PC depuis l'application installée
    Étant donné que l'application est fermée sur le PC
    Et que le PC est sans réseau
    Quand l'utilisateur ouvre l'application sur le PC depuis l'application installée
    Alors sur le PC, les données présentes sur le PC s'affichent aussitôt
    Et sur le PC, la tâche "Chapitre 1" existe avec le délai 2026-11-30

  @US-031 @RG-021 @LOT-001
  Plan du scénario: S02 — Toutes les opérations du lot 1 sont possibles sans réseau sur le PC
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur <opération>
    Alors sur le PC, l'opération est acceptée
    Et sur le PC, <résultat>

    Exemples:
      | opération                                                                                    | résultat                                                        |
      | crée un objectif "Courir un semi-marathon" de délai 2027-04-30                               | l'objectif "Courir un semi-marathon" existe avec le délai 2027-04-30 |
      | crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai      | "Version imprimable" est un sous-objectif de l'objectif "Publier le guide" |
      | crée une sous-tâche "Section A" de la tâche "Chapitre 1", de délai 2026-11-20, estimée à 1 h | l'estimation de la tâche "Chapitre 1" est 1 h                   |
      | modifie le délai de la tâche "Chapitre 1" en 2026-12-20                                      | la tâche "Chapitre 1" porte une alerte de délai qui nomme l'objectif "Publier le guide" |
      | termine la tâche "Chapitre 1"                                                                | l'état de l'objectif "Publier le guide" est "atteint"           |
      | abandonne la tâche "Chapitre 1" et confirme                                                  | l'état de l'objectif "Publier le guide" est "à décliner en tâches" |
      | supprime la tâche "Chapitre 1" et confirme                                                   | la tâche "Chapitre 1" n'existe plus                             |
      | supprime l'objectif "Publier le guide" et confirme                                           | la tâche "Chapitre 1" existe sans objectif                      |

  @US-031 @RG-021 @RG-026 @RG-027 @LOT-001
  Scénario: S03 — Rouvrir et reprendre une tâche sont possibles sans réseau sur le PC
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le PC, l'utilisateur rouvre la tâche "Chapitre 1"
    Et sur le PC, l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et sur le PC, l'utilisateur reprend la tâche "Chapitre 1"
    Alors sur le PC, l'état de la tâche "Chapitre 1" est "à faire"

  # ---------------------------------------------------------------- Indication hors ligne (CA-3)

  @US-031 @RG-021 @LOT-001
  Scénario: S04 — Sans réseau, le PC indique qu'il est hors ligne et combien de modifications attendent, comme le smartphone
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Alors sur le PC, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec 1 modification(s) en attente
    Et sur le PC, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"

  # ---------------------------------------------------------------- Retour du réseau (CA-4) et session expirée (CA-5)

  @US-031 @RG-021 @LOT-001
  Scénario: S05 — Au retour du réseau, session Google active, les modifications sont enregistrées et celles du smartphone intégrées, sans action
    Étant donné que le PC est sans réseau
    Et que l'application est ouverte sur le PC
    Et que la session Google du navigateur du PC est active
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et sur le smartphone, l'utilisateur enregistre ses modifications dans le Drive
    Et le réseau revient sur le PC, sans aucune action de l'utilisateur
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le PC, l'objectif "Courir un semi-marathon" existe sans délai
    Et sur le PC, la tâche "Chapitre 1 : contexte" ne porte plus la mention "MEN-ATTENTE"
    Et sur le PC, l'indicateur de synchronisation n'est plus "SYN-HORS-LIGNE"

  @US-031 @RG-017 @RG-021 @LOT-001
  Scénario: S06 — Session Google du navigateur expirée : le travail continue, puis tout est mis à jour après le geste de reconnexion
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et sur le smartphone, l'utilisateur enregistre ses modifications dans le Drive
    Et la session Google du navigateur du PC expire
    Et le réseau revient sur le PC
    Alors sur le PC, l'indicateur de synchronisation est "SYN-SESSION", avec l'action "Reprendre la synchronisation"
    Et le Drive du compte "A" ne contient pas encore la tâche "Chapitre 1 : contexte"
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1 : contexte"
    Alors sur le PC, l'opération est acceptée
    Quand sur le PC, l'utilisateur fait le geste de reconnexion
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte" à l'état "terminée"
    Et sur le PC, l'objectif "Courir un semi-marathon" existe sans délai
    Et sur le PC, aucun élément ne porte la mention "MEN-ATTENTE"

  @US-031 @RG-017 @LOT-001
  Scénario: S07 — Session Google expirée alors que le PC est connecté au réseau : même comportement
    Étant donné que l'application est ouverte sur le PC, connecté au réseau
    Et que la session Google du navigateur du PC a expiré
    Quand sur le PC, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-05
    Alors sur le PC, l'opération est acceptée
    Et sur le PC, l'indicateur de synchronisation est "SYN-SESSION", avec l'action "Reprendre la synchronisation"
    Quand sur le PC, l'utilisateur fait le geste de reconnexion
    Et les deux appareils échangent leurs modifications
    Alors sur le smartphone, la tâche "Chapitre 1" existe avec le délai 2026-12-05

  # ---------------------------------------------------------------- Aucune perte (CA-6, CA-7)

  @US-031 @RG-021 @ihm @LOT-001
  Plan du scénario: S08 — Aucune modification faite sans réseau n'est perdue, même si l'onglet ou le navigateur est fermé, ou le PC éteint
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et <interruption>
    Et l'utilisateur ouvre l'application sur le PC depuis son adresse web
    Alors sur le PC, la tâche "Chapitre 1 : contexte" existe avec le délai 2026-11-30
    Et sur le PC, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Quand le réseau revient sur le PC
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"

    Exemples:
      | interruption                          |
      | l'utilisateur ferme l'onglet de l'application |
      | l'utilisateur ferme le navigateur     |
      | le PC est éteint puis rallumé         |

  @US-031 @RG-021 @LOT-001
  Scénario: S09 — Il n'y a pas de durée maximale d'utilisation sans réseau sur le PC
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-12-21 à 10:00 heure de Europe/Paris
    Et sur le PC, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le PC, l'opération est acceptée
    Quand le réseau revient sur le PC
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et le Drive du compte "A" contient l'objectif "Courir un semi-marathon"

  # ---------------------------------------------------------------- Conflits (CA-8)

  @US-031 @RG-036 @RG-056 @LOT-001
  Scénario: S10 — Au retour du réseau sur le PC, la règle de conflit s'applique et la valeur écartée est signalée
    Étant donné que le PC est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "A"
    Et 10 minutes plus tard, sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "B"
    Et le réseau revient sur le PC
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "B" existe avec le délai 2026-11-30
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | B       | intitulé    | A                  | B                |

  @US-031 @RG-047 @RG-056 @LOT-001
  Scénario: S11 — Au retour du réseau sur le PC, une suppression faite sur le smartphone l'emporte sur une modification faite sans réseau
    Étant donné que le PC est sans réseau
    Quand sur le smartphone, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et 10 minutes plus tard, sur le PC, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-05
    Et le réseau revient sur le PC
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" n'existe plus
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue | valeur conservée |
      | Chapitre 1 | délai       | 2026-12-05         | tâche supprimée  |

  @US-031 @RG-049 @LOT-001
  Scénario: S12 — Au retour du réseau sur le PC, une incohérence d'état est signalée sans correction
    Étant donné les tâches suivantes :
      | intitulé  | état     | délai      | estimation | objectifs | tâche parente |
      | Section A | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Et que le PC est sans réseau
    Quand sur le smartphone, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le PC, l'utilisateur rouvre la tâche "Section A"
    Et le réseau revient sur le PC
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "Section A"

  # ---------------------------------------------------------------- Perte de l'accès Google (CA-9)

  @US-031 @RG-035 @LOT-001
  Scénario: S13 — Accès Google retiré : le PC fonctionne comme sans réseau et propose de se reconnecter
    Étant donné que l'accès au compte Google "A" a été retiré sur le PC
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Alors sur le PC, l'opération est acceptée
    Et sur le PC, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le PC, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Quand sur le PC, l'utilisateur se reconnecte avec le compte "A"
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"

  # ---------------------------------------------------------------- Cas limites

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S14 — La première ouverture de l'application dans un navigateur, sans réseau, est impossible
    Étant donné que l'application n'a jamais été ouverte dans le navigateur du PC
    Et que le PC est sans réseau
    Quand l'utilisateur ouvre l'application sur le PC depuis son adresse web
    Alors sur le PC, aucun écran de Done Juan n'est affiché
    Et le navigateur du PC affiche son propre message de page inaccessible

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S15 — Données du navigateur effacées : les modifications non enregistrées sont perdues et les données sont rechargées depuis le Drive
    Étant donné que le PC est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et l'utilisateur efface les données de son navigateur sur le PC
    Et le réseau revient sur le PC
    Et l'utilisateur se connecte avec le compte "A" sur le PC
    Alors sur le PC, la tâche "Chapitre 1" existe avec le délai 2026-11-30
    Et sur le PC, la tâche "Chapitre 1 : contexte" n'existe pas

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S16 — Deux onglets ouverts sans réseau affichent les mêmes données et ne perdent aucune modification
    Étant donné que l'application est ouverte dans deux onglets du PC
    Et que le PC est sans réseau
    Quand dans le premier onglet, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et dans le second onglet, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors les deux onglets affichent la tâche "Chapitre 1 : contexte" et l'objectif "Courir un semi-marathon"
    Quand le réseau revient sur le PC
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte" exactement une fois
    Et le Drive du compte "A" contient l'objectif "Courir un semi-marathon" exactement une fois

  @US-031 @RG-021 @ihm @LOT-001
  Scénario: S17 — Le réseau perdu pendant une saisie sur le PC ne laisse aucune donnée enregistrée à moitié
    Quand sur le PC, l'utilisateur commence la saisie d'une sous-tâche de la tâche "Chapitre 1"
    Et sur le PC, l'utilisateur saisit l'intitulé "Section A", le délai 2026-11-20 et l'estimation 1 h
    Et le réseau est coupé sur le PC pendant la saisie
    Et l'utilisateur termine la saisie
    Alors sur le PC, la tâche "Section A" existe avec le délai 2026-11-20
    Quand le réseau revient sur le PC
    Alors le Drive du compte "A" contient la tâche "Section A" exactement une fois

  @US-031 @RG-021 @LOT-001
  Scénario: S18 — Avec un réseau intermittent sur le PC, aucune modification n'est enregistrée deux fois ni perdue
    Étant donné que le réseau du PC est intermittent
    Quand sur le PC, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et l'envoi au Drive est interrompu 3 fois avant d'aboutir
    Alors le Drive du compte "A" contient l'objectif "Courir un semi-marathon" exactement une fois

  # ---------------------------------------------------------------- Modifications en attente depuis plus de 24 h (CA-10, RG-057 ; Q-ERG-16 b, Q-ERG-18, DEC-025)
  # Les 24 h courent depuis la plus ancienne modification en attente ; le bandeau est BAN-RAPPEL-24H.

  @US-031 @RG-057 @RG-021 @LOT-001
  Scénario: S19 — Avec une modification en attente depuis plus de 24 h, le bandeau "BAN-RAPPEL-24H" s'affiche sur le PC sans rien bloquer
    Étant donné que le PC est sans réseau
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Et sur le PC, le bandeau "BAN-RAPPEL-24H" est non bloquant
    Quand sur le PC, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le PC, l'opération est acceptée

  @US-031 @RG-057 @LOT-001
  Scénario: S19b — Les 24 h courent depuis la plus ancienne modification en attente : une modification plus récente ne les remet pas à zéro
    Étant donné que le PC est sans réseau
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et que sur le PC, l'utilisateur a créé un objectif "Courir un semi-marathon" sans délai
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 2 modifications en attente

  @US-031 @RG-057 @LOT-001
  Plan du scénario: S20 — Pas de bandeau "BAN-RAPPEL-24H" tant que la plus ancienne modification en attente a 24 h ou moins, ni sans modification en attente
    Étant donné que le PC est sans réseau
    Et que <situation>
    Quand nous sommes le <moment> heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

    Exemples:
      | situation                                                                                    | moment              |
      | sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"         | 2026-10-22 à 09:59  |
      | sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"         | 2026-10-22 à 10:00  |
      | aucune modification n'est en attente sur le PC                                              | 2026-10-22 à 10:01  |

  @US-031 @RG-057 @LOT-001
  Scénario: S20b — Appareil hors ligne depuis plus de 24 h mais dont la seule modification en attente a 1 minute : pas de bandeau tant que la plus ancienne modification en attente a 24 h ou moins
    Étant donné que le PC est sans réseau
    Et que nous sommes le 2026-10-22 à 11:00 heure de Europe/Paris
    Quand sur le PC, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 11:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand nous sommes le 2026-10-23 à 11:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente

  @US-031 @RG-057 @RG-021 @LOT-001
  Scénario: S21 — Le bandeau "BAN-RAPPEL-24H" disparaît quand les modifications sont enregistrées dans le Drive
    Étant donné que le PC est sans réseau
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Et que sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand le réseau revient sur le PC
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

  @US-031 @RG-057 @LOT-001
  Scénario: S21b — Le bandeau "BAN-RAPPEL-24H" fermé réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente
    Étant donné que le PC est sans réseau
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Et que sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand sur le PC, l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand l'utilisateur ferme l'onglet de l'application
    Et l'utilisateur ouvre l'application sur le PC depuis son adresse web
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand le réseau revient sur le PC
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

  @US-031 @RG-057 @RG-035 @LOT-001
  Scénario: S22 — Accès Google perdu avec des modifications en attente depuis plus de 24 h : un seul bandeau "BAN-ACCES-GOOGLE", complété du nombre de modifications
    Étant donné que l'accès au compte Google "A" a été retiré sur le PC
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le PC, le bandeau "BAN-ACCES-GOOGLE" variante 24H mentionne 1 modification en attente
    Et sur le PC, un seul bandeau est affiché
    Et sur le PC, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand sur le PC, l'utilisateur se reconnecte avec le compte "A"
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le PC, aucun bandeau n'est affiché

  @US-031 @RG-057 @RG-035 @LOT-001
  Scénario: S22b — Accès Google perdu depuis 24 h ou moins : le bandeau "BAN-ACCES-GOOGLE" n'est pas complété du nombre de modifications
    Étant donné que l'accès au compte Google "A" a été retiré sur le PC
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:00 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le PC, le bandeau "BAN-ACCES-GOOGLE" variante 24H n'est pas affiché
    Et sur le PC, un seul bandeau est affiché

  @US-031 @RG-057 @RG-017 @LOT-001
  Scénario: S22c — Session Google expirée avec une modification en attente depuis plus de 24 h : rappel "BAN-RAPPEL-24H" avec l'action "Reprendre la synchronisation"
    # E8, Q-US-031-2 a) : RG-057 porte sur l'âge de la plus ancienne modification en attente, quel que soit l'état de la synchronisation.
    # Avant 24 h, la session expirée reste sans bandeau (CA-5).
    Étant donné que la session Google du navigateur du PC a expiré
    Et que sur le PC, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:00 heure de Europe/Paris
    Alors sur le PC, l'indicateur de synchronisation est "SYN-SESSION", avec l'action "Reprendre la synchronisation"
    Et sur le PC, aucun bandeau n'est affiché
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché, avec l'action "Reprendre la synchronisation"
    Et sur le PC, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Et sur le PC, le bandeau "BAN-ACCES-GOOGLE" n'est pas affiché
    Quand sur le PC, l'utilisateur fait le geste de reconnexion
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le PC, aucun bandeau n'est affiché
