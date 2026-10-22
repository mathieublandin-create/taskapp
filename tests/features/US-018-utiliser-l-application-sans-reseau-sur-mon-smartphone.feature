# language: fr
#
# Tests métiers — US-018 — Utiliser l'application sans réseau sur mon smartphone
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.11, US-018
# E8 (Pepper, 2026-10-21) : réponses aux demandes de précision d'Anthony (explicitation-LOT-001.md, « Réponses aux Q-US ») ; glossaire d'étapes v1.2.
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).
# DEC-034 (Pepper, 2026-10-22) : le smartphone utilise l'application web installée depuis Chrome, et non plus une application Android (APK).
# Scénarios nouveaux ou adaptés, tag @DEC-034, validés par le commanditaire le 2026-10-22 (DEC-036, « Tout reco ») (V-DEC034-5 et V-DEC034-7) : S06 (accès Google valide),
# S06b (accès Google à renouveler au retour du réseau), S06c (redirection silencieuse en échec à l'ouverture, Q-DEC034-1), S09b (application installée),
# S11 (accès retiré seulement ; l'accès expiré relève de S06b), S18 et S19 (cas limites du navigateur).
# Ils sont retirés, et la version précédente de ce fichier rétablie, si la condition de DEC-034 échoue (M-RED, M-PERSIST).

Fonctionnalité: Utiliser l'application sans réseau sur mon smartphone
  En tant qu'utilisateur,
  je veux consulter et saisir mes données sur mon smartphone sans réseau,
  mes modifications étant prises en compte au retour du réseau,
  afin de ne pas dépendre de la couverture réseau.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |

  # ---------------------------------------------------------------- Ouverture et opérations sans réseau (CA-1, CA-2)

  @US-018 @RG-021 @LOT-001
  Scénario: S01 — L'application s'ouvre sans réseau et affiche les données du smartphone
    Étant donné que l'application est fermée sur le smartphone
    Et que le smartphone est sans réseau
    Quand l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, les données présentes sur le smartphone s'affichent aussitôt
    Et sur le smartphone, la tâche "Chapitre 1" existe avec le délai 2026-11-30

  @US-018 @RG-021 @LOT-001
  Plan du scénario: S02 — Toutes les opérations du lot 1 sont possibles sans réseau
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur <opération>
    Alors sur le smartphone, l'opération est acceptée
    Et sur le smartphone, <résultat>

    Exemples:
      | opération                                                                                    | résultat                                                        |
      | crée un objectif "Courir un semi-marathon" de délai 2027-04-30                               | l'objectif "Courir un semi-marathon" existe avec le délai 2027-04-30 |
      | modifie le délai de l'objectif "Publier le guide" en 2027-01-31                              | l'objectif "Publier le guide" existe avec le délai 2027-01-31   |
      | crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai      | "Version imprimable" est un sous-objectif de l'objectif "Publier le guide" |
      | crée une sous-tâche "Section A" de la tâche "Chapitre 1", de délai 2026-11-20, estimée à 1 h | l'estimation de la tâche "Chapitre 1" est 1 h                   |
      | renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"                                     | la tâche "Chapitre 1 : contexte" existe avec le délai 2026-11-30 |
      | termine la tâche "Chapitre 1"                                                                | l'état de l'objectif "Publier le guide" est "atteint"           |
      | abandonne la tâche "Chapitre 1" et confirme                                                  | l'état de l'objectif "Publier le guide" est "à décliner en tâches" |
      | supprime la tâche "Chapitre 1" et confirme                                                   | la tâche "Chapitre 1" n'existe plus                             |
      | supprime l'objectif "Publier le guide" et confirme                                           | la tâche "Chapitre 1" existe sans objectif                      |

  @US-018 @RG-021 @RG-026 @RG-027 @LOT-001
  Scénario: S03 — Rouvrir et reprendre une tâche sont possibles sans réseau
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur rouvre la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et sur le smartphone, l'utilisateur reprend la tâche "Chapitre 1"
    Alors sur le smartphone, l'état de la tâche "Chapitre 1" est "à faire"

  @US-018 @RG-021 @RG-045 @RG-024 @RG-053 @LOT-001
  Scénario: S04 — Sans réseau, les règles de gestion s'appliquent comme avec le réseau, journée de Paris comprise
    Étant donné que le smartphone est sans réseau
    Et que le smartphone est réglé sur le fuseau "America/New_York"
    Et que nous sommes le 2026-11-10 à 23:00 heure de America/New_York
    Quand sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-20
    Alors sur le smartphone, la tâche "Chapitre 1" porte une alerte de délai qui nomme l'objectif "Publier le guide"
    Quand sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-11-10
    Alors sur le smartphone, la tâche "Chapitre 1" est en retard
    Quand sur le smartphone, l'utilisateur termine la tâche "Chapitre 1"
    Alors sur le smartphone, la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-11-11
    Et sur le smartphone, l'état de l'objectif "Publier le guide" est "atteint"

  # ---------------------------------------------------------------- Indication hors ligne (CA-3)

  @US-018 @RG-021 @LOT-001
  Scénario: S05 — Sans réseau, l'application indique qu'elle est hors ligne et combien de modifications attendent
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le smartphone, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec 2 modification(s) en attente
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Et sur le smartphone, l'objectif "Courir un semi-marathon" porte la mention "MEN-ATTENTE"
    Et sur le smartphone, l'objectif "Publier le guide" ne porte pas la mention "MEN-ATTENTE"

  # E8, Q-US-018-1, option a) : le nombre de modifications en attente est le nombre d'éléments distincts (objectifs, tâches, sous-tâches)
  # qui portent la mention MEN-ATTENTE ; plusieurs modifications d'un même élément comptent pour une.
  @US-018 @RG-021 @LOT-001
  Scénario: S05b — Plusieurs modifications d'un même élément comptent pour une seule modification en attente
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et sur le smartphone, l'utilisateur renomme l'objectif "Courir un semi-marathon" en "Courir un marathon"
    Et sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-05
    Et sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-10
    Alors sur le smartphone, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec 2 modification(s) en attente
    Et sur le smartphone, l'objectif "Courir un marathon" porte la mention "MEN-ATTENTE"
    Et sur le smartphone, la tâche "Chapitre 1" porte la mention "MEN-ATTENTE"

  @US-018 @RG-021 @RG-046 @LOT-001
  Scénario: S05c — Un élément créé puis supprimé sans réseau ne compte pas ; la suppression d'un élément déjà enregistré compte pour une modification
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur crée un objectif "Brouillon" sans délai
    Et sur le smartphone, l'utilisateur supprime l'objectif "Brouillon" et confirme
    Alors sur le smartphone, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec 0 modification(s) en attente
    Quand sur le smartphone, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Alors sur le smartphone, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec 1 modification(s) en attente

  # ---------------------------------------------------------------- Retour du réseau (CA-4, CA-7)

  @US-018 @RG-021 @LOT-001 @DEC-034
  Scénario: S06 — Au retour du réseau, accès Google valide, les modifications sont enregistrées et celles de l'autre appareil intégrées, sans action
    Étant donné que le smartphone est sans réseau
    Et que l'application est ouverte sur le smartphone
    Et que la session Google du smartphone est active
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et sur le PC, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et sur le PC, l'utilisateur enregistre ses modifications dans le Drive
    Et le réseau revient sur le smartphone, sans aucune action de l'utilisateur
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le smartphone, l'objectif "Courir un semi-marathon" existe sans délai
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" ne porte plus la mention "MEN-ATTENTE"
    Et sur le smartphone, l'indicateur de synchronisation n'est plus "SYN-HORS-LIGNE"

  @US-018 @RG-017 @RG-021 @LOT-001 @DEC-034
  Scénario: S06b — Au retour du réseau, accès Google à renouveler : le travail continue, puis tout est enregistré après au plus un geste, sans bandeau
    Étant donné que le smartphone est sans réseau
    Et que l'application est ouverte sur le smartphone
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et sur le PC, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et sur le PC, l'utilisateur enregistre ses modifications dans le Drive
    Et la session Google du smartphone expire
    Et le réseau revient sur le smartphone
    Alors sur le smartphone, l'indicateur de synchronisation est "SYN-SESSION", avec l'action "Reprendre la synchronisation"
    Et sur le smartphone, aucun bandeau n'est affiché
    Et le Drive du compte "A" ne contient pas encore la tâche "Chapitre 1 : contexte"
    Quand sur le smartphone, l'utilisateur termine la tâche "Chapitre 1 : contexte"
    Alors sur le smartphone, l'opération est acceptée
    Quand sur le smartphone, l'utilisateur fait le geste de reconnexion
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte" à l'état "terminée"
    Et sur le smartphone, l'objectif "Courir un semi-marathon" existe sans délai
    Et sur le smartphone, aucun élément ne porte la mention "MEN-ATTENTE"

  # Réponse de Starck à Q-DEC034-1 : à l'ouverture, une seule tentative de redirection silencieuse ; en cas d'échec, SYN-SESSION et le geste.
  @US-018 @RG-017 @RG-021 @LOT-001 @DEC-034
  Scénario: S06c — À l'ouverture, accès Google à renouveler et redirection silencieuse en échec : données affichées, travail possible, enregistrement après le geste, aucune saisie
    Étant donné que l'application est fermée sur le smartphone
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte", pas encore enregistré dans le Drive
    Et que la session Google du smartphone a expiré
    Et que la redirection silencieuse vers Google échoue à l'ouverture sur le smartphone
    Quand l'utilisateur ouvre l'application sur le smartphone, connecté au réseau
    Alors sur le smartphone, les données présentes sur le smartphone s'affichent aussitôt
    Et sur le smartphone, aucune connexion n'est demandée avant d'afficher les données
    Et sur le smartphone, l'indicateur de synchronisation est "SYN-SESSION", avec l'action "Reprendre la synchronisation"
    Et sur le smartphone, aucun bandeau n'est affiché
    Quand sur le smartphone, l'utilisateur fait le geste de reconnexion
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le smartphone, aucun élément ne porte la mention "MEN-ATTENTE"

  @US-018 @RG-021 @RG-036 @RG-056 @LOT-001
  Scénario: S07 — Au retour du réseau, la règle de conflit s'applique et la valeur écartée est signalée
    Étant donné que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-01
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-05
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" existe avec le délai 2026-12-05
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue | valeur conservée |
      | Chapitre 1 | délai       | 2026-12-01         | 2026-12-05       |

  @US-018 @RG-021 @RG-047 @RG-056 @LOT-001
  Scénario: S08 — Au retour du réseau, une suppression faite sur le PC l'emporte sur une modification faite sans réseau
    Étant donné que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" n'existe plus
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue    | valeur conservée |
      | Chapitre 1 | intitulé    | Chapitre 1 : contexte | tâche supprimée  |

  # ---------------------------------------------------------------- Aucune perte (CA-5, CA-6)

  @US-018 @RG-021 @LOT-001
  Plan du scénario: S09 — Aucune modification faite sans réseau n'est perdue, même si l'application est fermée ou le smartphone éteint
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et <interruption>
    Et l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, la tâche "Chapitre 1 : contexte" existe avec le délai 2026-11-30
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Quand le réseau revient sur le smartphone
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"

    Exemples:
      | interruption                                     |
      | l'utilisateur ferme l'application sur le smartphone |
      | le smartphone est éteint puis rallumé            |
      | l'application est arrêtée brutalement sur le smartphone |

  @US-018 @RG-021 @recette @LOT-001 @DEC-034
  Scénario: S09b — Recette manuelle sur un vrai smartphone : après un arrêt forcé de l'application installée puis un redémarrage du téléphone, aucune modification faite sans réseau n'est perdue
    # E8, Q-US-018-3 : S09 s'exécute au niveau des cas d'usage ; cette variante se déroule à la main sur l'appareil (recette, E14).
    # DEC-034 : l'application est celle installée sur l'écran d'accueil depuis Chrome (Android) ; l'arrêt forcé se fait depuis les réglages du téléphone.
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et l'application est arrêtée brutalement sur le smartphone
    Et le smartphone est éteint puis rallumé
    Et l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, la tâche "Chapitre 1 : contexte" existe avec le délai 2026-11-30
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Quand le réseau revient sur le smartphone
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"

  @US-018 @RG-021 @LOT-001
  Scénario: S10 — Il n'y a pas de durée maximale d'utilisation sans réseau
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-12-21 à 10:00 heure de Europe/Paris
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le smartphone, l'opération est acceptée
    Quand le réseau revient sur le smartphone
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et le Drive du compte "A" contient l'objectif "Courir un semi-marathon"

  # ---------------------------------------------------------------- Perte de l'accès Google (CA-8)

  # DEC-034 : l'exemple « a expiré » est retiré ; sur le smartphone comme sur le PC, un accès expiré est un accès à renouveler (S06b, sans bandeau).
  @US-018 @RG-035 @LOT-001 @DEC-034
  Scénario: S11 — Accès Google retiré : le smartphone fonctionne comme sans réseau et propose de se reconnecter
    Étant donné que l'accès au compte Google "A" a été retiré sur le smartphone
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Alors sur le smartphone, l'opération est acceptée
    Et sur le smartphone, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" porte la mention "MEN-ATTENTE"
    Quand sur le smartphone, l'utilisateur se reconnecte avec le compte "A"
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"

  # ---------------------------------------------------------------- Cas limites

  @US-018 @RG-019 @LOT-001
  Scénario: S12 — La toute première connexion sans réseau est impossible
    # DEC-034 : « jamais utilisée » = l'application a déjà été chargée une fois avec le réseau (installée), mais aucun compte ne s'y est connecté. L'application jamais chargée relève de S19.
    Étant donné que l'application n'a jamais été utilisée sur le smartphone
    Et que le smartphone est sans réseau
    Quand l'utilisateur tente de se connecter avec le compte "A" sur le smartphone
    Alors la connexion échoue avec le motif "ERR-003"
    Et aucune donnée n'est créée sur le smartphone

  @US-018 @RG-021 @LOT-001
  Scénario: S13 — Le réseau perdu pendant une saisie ne laisse aucune donnée enregistrée à moitié
    # E8, Q-US-018-2 : saisie en étapes successives, alignée sur US-031 S17.
    Quand sur le smartphone, l'utilisateur commence la saisie d'une sous-tâche de la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur saisit l'intitulé "Section A", le délai 2026-11-20 et l'estimation 1 h
    Et le réseau est coupé sur le smartphone pendant la saisie
    Et l'utilisateur termine la saisie
    Alors sur le smartphone, la tâche "Section A" existe avec le délai 2026-11-20
    Et sur le smartphone, l'estimation de la tâche "Chapitre 1" est 1 h
    Quand le réseau revient sur le smartphone
    Alors le Drive du compte "A" contient la tâche "Section A" exactement une fois

  @US-018 @RG-021 @LOT-001
  Scénario: S14 — Avec un réseau intermittent, aucune modification n'est enregistrée deux fois ni perdue
    Étant donné que le réseau du smartphone est intermittent
    Quand sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et l'envoi au Drive est interrompu 3 fois avant d'aboutir
    Alors le Drive du compte "A" contient l'objectif "Courir un semi-marathon" exactement une fois
    Et sur le PC, après échange, il existe 1 objectif d'intitulé "Courir un semi-marathon"

  # ---------------------------------------------------------------- Modifications en attente depuis plus de 24 h (CA-9, RG-057 ; Q-ERG-16 b, Q-ERG-18, DEC-025)
  # Les 24 h courent depuis la plus ancienne modification en attente ; le bandeau est BAN-RAPPEL-24H.

  @US-018 @RG-057 @RG-021 @LOT-001
  Scénario: S15 — Avec une modification en attente depuis plus de 24 h, le bandeau "BAN-RAPPEL-24H" s'affiche sur le smartphone sans rien bloquer
    Étant donné que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Et sur le smartphone, le bandeau "BAN-RAPPEL-24H" est non bloquant
    Quand sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le smartphone, l'opération est acceptée

  @US-018 @RG-057 @LOT-001
  Scénario: S15b — Les 24 h courent depuis la plus ancienne modification en attente : une modification plus récente ne les remet pas à zéro
    Étant donné que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et que sur le smartphone, l'utilisateur a créé un objectif "Courir un semi-marathon" sans délai
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 2 modifications en attente

  @US-018 @RG-057 @LOT-001
  Scénario: S15c — Modifier de nouveau un élément déjà en attente ne remet pas à zéro les 24 h
    # E8, Q-US-018-1 : les 24 h partent de la première modification non encore enregistrée dans le Drive, tous éléments confondus.
    Étant donné que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et que sur le smartphone, l'utilisateur a modifié le délai de la tâche "Chapitre 1 : contexte" en 2026-12-05
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente

  @US-018 @RG-057 @LOT-001
  Plan du scénario: S16 — Pas de bandeau "BAN-RAPPEL-24H" tant que la plus ancienne modification en attente a 24 h ou moins, ni sans modification en attente
    Étant donné que le smartphone est sans réseau
    Et que <situation>
    Quand nous sommes le <moment> heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

    Exemples:
      | situation                                                                                    | moment              |
      | sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"         | 2026-10-22 à 09:59  |
      | sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"         | 2026-10-22 à 10:00  |
      | aucune modification n'est en attente sur le smartphone                                              | 2026-10-22 à 10:01  |

  @US-018 @RG-057 @LOT-001
  Scénario: S16b — Appareil hors ligne depuis plus de 24 h mais dont la seule modification en attente a 1 minute : pas de bandeau tant que la plus ancienne modification en attente a 24 h ou moins
    Étant donné que le smartphone est sans réseau
    Et que nous sommes le 2026-10-22 à 11:00 heure de Europe/Paris
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 11:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand nous sommes le 2026-10-23 à 11:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente

  @US-018 @RG-057 @RG-021 @LOT-001
  Scénario: S17 — Le bandeau "BAN-RAPPEL-24H" disparaît quand les modifications sont enregistrées dans le Drive
    Étant donné que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Et que sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand le réseau revient sur le smartphone
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

  @US-018 @RG-057 @LOT-001
  Scénario: S17b — Le bandeau "BAN-RAPPEL-24H" fermé réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente
    Étant donné que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et que nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Et que sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand sur le smartphone, l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand l'utilisateur ferme l'application sur le smartphone
    Et l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" est affiché avec 1 modification en attente
    Quand le réseau revient sur le smartphone
    Alors sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché

  @US-018 @RG-057 @RG-035 @LOT-001
  Scénario: S17c — Accès Google perdu avec des modifications en attente depuis plus de 24 h : un seul bandeau "BAN-ACCES-GOOGLE", complété du nombre de modifications
    Étant donné que l'accès au compte Google "A" a été retiré sur le smartphone
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:01 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le smartphone, le bandeau "BAN-ACCES-GOOGLE" variante 24H mentionne 1 modification en attente
    Et sur le smartphone, un seul bandeau est affiché
    Et sur le smartphone, le bandeau "BAN-RAPPEL-24H" n'est pas affiché
    Quand sur le smartphone, l'utilisateur se reconnecte avec le compte "A"
    Alors le Drive du compte "A" contient la tâche "Chapitre 1 : contexte"
    Et sur le smartphone, aucun bandeau n'est affiché

  @US-018 @RG-057 @RG-035 @LOT-001
  Scénario: S17d — Accès Google perdu depuis 24 h ou moins : le bandeau "BAN-ACCES-GOOGLE" n'est pas complété du nombre de modifications
    Étant donné que l'accès au compte Google "A" a été retiré sur le smartphone
    Et que sur le smartphone, l'utilisateur a renommé la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Quand nous sommes le 2026-10-22 à 10:00 heure de Europe/Paris
    Alors sur le smartphone, le bandeau "BAN-ACCES-GOOGLE" est affiché, avec l'action "Se reconnecter"
    Et sur le smartphone, le bandeau "BAN-ACCES-GOOGLE" variante 24H n'est pas affiché
    Et sur le smartphone, un seul bandeau est affiché

  # ---------------------------------------------------------------- Cas limites du navigateur (DEC-034 ; V-DEC034-7, validée DEC-036)

  @US-018 @RG-021 @ihm @LOT-001 @DEC-034
  Scénario: S18 — Données du navigateur effacées sur le smartphone : les modifications non enregistrées sont perdues et les données sont rechargées depuis le Drive
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"
    Et l'utilisateur efface les données de son navigateur sur le smartphone
    Et le réseau revient sur le smartphone
    Et l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, la tâche "Chapitre 1" existe avec le délai 2026-11-30
    Et sur le smartphone, la tâche "Chapitre 1 : contexte" n'existe pas

  @US-018 @RG-021 @ihm @LOT-001 @DEC-034
  Scénario: S19 — La première ouverture de l'application dans le navigateur du smartphone, sans réseau, est impossible
    Étant donné que l'application n'a jamais été ouverte dans le navigateur du smartphone
    Et que le smartphone est sans réseau
    Quand l'utilisateur ouvre l'application sur le smartphone depuis son adresse web
    Alors sur le smartphone, aucun écran de Done Juan n'est affiché
    Et le navigateur du smartphone affiche son propre message de page inaccessible
