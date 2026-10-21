# language: fr
#
# Tests métiers — US-017 — Retrouver mes données sur smartphone et sur PC
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.8, US-017
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).
# Les délais d'une heure et d'une minute (CA-2, CA-3) se vérifient en faisant avancer l'horloge contrôlée du banc à deux appareils
# (conventions §9.11, PT-04) : aucun scénario n'attend en temps réel (E7, ANT-3).
# E7 : S12b (horodatages identiques), S13 scindé en S13a/S13b (seuil de 24 h, CA-13), S17 scindé en S17a/S17b, S30b (RG-058 : aucune écriture, dépôt après mise à jour).

Fonctionnalité: Retrouver mes données sur smartphone et sur PC
  En tant qu'utilisateur,
  je veux que mes données soient conservées dans mon espace de stockage personnel
  et que je les retrouve sur mon smartphone comme sur mon PC,
  afin de passer de l'un à l'autre sans ressaisie.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour

  # ---------------------------------------------------------------- Deux appareils (CA-1)

  @US-017 @RG-017 @LOT-001
  Plan du scénario: S01 — Les fonctions du lot 1 sont disponibles sur chacun des deux appareils
    Quand sur le <appareil>, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et sur le <appareil>, l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation | objectifs        |
      | Chapitre 1 | 2026-11-30 | 2 h        | Publier le guide |
    Et sur le <appareil>, l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Et sur le <appareil>, l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai
    Et sur le <appareil>, l'utilisateur termine la tâche "Section A"
    Et sur le <appareil>, l'utilisateur rouvre la tâche "Section A"
    Et sur le <appareil>, l'utilisateur abandonne la tâche "Section A" et confirme
    Et sur le <appareil>, l'utilisateur reprend la tâche "Section A"
    Et sur le <appareil>, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et sur le <appareil>, l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Alors sur le <appareil>, toutes ces opérations ont été acceptées
    Et sur le <appareil>, "Version imprimable" est un objectif principal

    Exemples:
      | appareil   |
      | smartphone |
      | PC         |

  # ---------------------------------------------------------------- Délai entre appareils (CA-2, CA-3)

  @US-017 @RG-017 @LOT-001
  Scénario: S02 — Les deux appareils ouverts et connectés, une modification est visible sur l'autre au plus tard une heure après, sans action
    Étant donné que l'application est ouverte sur le smartphone et sur le PC, connectés au réseau
    Quand sur le PC, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et l'horloge avance de 60 minutes, sans aucune action de l'utilisateur
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-017 @RG-017 @LOT-001
  Plan du scénario: S03 — Créations, modifications et suppressions sont toutes visibles sur l'autre appareil dans l'heure
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |
    Et que l'application est ouverte sur le smartphone et sur le PC, connectés au réseau
    Quand sur le smartphone, l'utilisateur <opération>
    Et l'horloge avance de 60 minutes, sans aucune action de l'utilisateur
    Alors sur le PC, <résultat>

    Exemples:
      | opération                                                       | résultat                                               |
      | modifie le délai de la tâche "Chapitre 1" en 2026-12-05         | la tâche "Chapitre 1" existe avec le délai 2026-12-05  |
      | termine la tâche "Chapitre 1"                                   | l'état de l'objectif "Publier le guide" est "atteint"  |
      | supprime la tâche "Chapitre 1" et confirme                      | la tâche "Chapitre 1" n'existe plus                    |

  @US-017 @RG-017 @LOT-001
  Scénario: S04 — L'appareil fermé reçoit la modification dès son ouverture, sans attendre le délai d'une heure
    Étant donné que l'application est fermée sur le PC
    Quand sur le smartphone, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et le smartphone enregistre ses modifications dans le Drive
    Et que nous sommes le 2026-10-23 à 08:00 heure de Europe/Paris
    Et l'utilisateur ouvre l'application sur le PC, connecté au réseau
    Alors sur le PC, les données présentes sur le PC s'affichent aussitôt
    Quand l'horloge avance de 1 minute depuis l'ouverture
    Alors sur le PC, l'objectif "Publier le guide" existe

  @US-017 @RG-017 @LOT-001
  Scénario: S05 — À l'ouverture, les modifications de l'autre appareil sont intégrées en une minute au plus
    Étant donné que l'application est fermée sur le PC
    Et que sur le smartphone, 3 modifications ont été enregistrées dans le Drive depuis la dernière ouverture du PC
    Quand l'utilisateur ouvre l'application sur le PC, connecté au réseau
    Et l'horloge avance de 1 minute depuis l'ouverture
    Alors sur le PC, les 3 modifications sont intégrées

  @US-017 @RG-017 @RG-035 @LOT-001
  Scénario: S06 — Sur le PC, session Google du navigateur expirée : données du PC affichées et utilisables, mise à jour après le geste de reconnexion
    Étant donné que l'application est fermée sur le PC
    Et que la session Google du navigateur du PC a expiré
    Et que sur le smartphone, l'utilisateur a créé un objectif "Publier le guide" de délai 2026-12-15, enregistré dans le Drive
    Quand l'utilisateur ouvre l'application sur le PC, connecté au réseau
    Alors sur le PC, les données présentes sur le PC s'affichent aussitôt
    Et sur le PC, l\'indicateur de synchronisation est "SYN-SESSION", avec l\'action "Reprendre la synchronisation"
    Et sur le PC, l'objectif "Publier le guide" n'existe pas
    Quand sur le PC, l'utilisateur crée une tâche :
      | intitulé         | délai      | estimation | objectifs |
      | Envoyer le devis | 2026-11-15 | 1 h        |           |
    Alors sur le PC, la tâche "Envoyer le devis" existe avec le délai 2026-11-15
    Quand sur le PC, l'utilisateur fait le geste de reconnexion
    Et l'horloge avance de 1 minute depuis la reconnexion
    Alors sur le PC, l'objectif "Publier le guide" existe
    Et le Drive du compte "A" contient la tâche "Envoyer le devis"

  # ---------------------------------------------------------------- Stockage dans le Drive (CA-4, CA-5)

  @US-017 @RG-020 @RG-018 @LOT-001
  Scénario: S07 — Les données sont conservées dans le Drive de l'utilisateur et nulle part ailleurs que sur ses appareils
    Quand sur le smartphone, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et le smartphone enregistre ses modifications dans le Drive
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"
    Et aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte "A"

  @US-017 @RG-017 @RG-020 @LOT-001
  Plan du scénario: S08 — Après fermeture et réouverture, sur le même appareil ou sur l'autre, les données sont identiques
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs        | tâche parente |
      | Plan       | terminée | 2026-11-01 | 1 h        | Publier le guide |               |
      | Chapitre 1 | à faire  | 2026-11-30 | 2 h 30     | Publier le guide |               |
    Et le smartphone enregistre ses modifications dans le Drive
    Quand l'utilisateur ferme l'application sur le smartphone
    Et l'utilisateur ouvre l'application sur le <appareil>, connecté au réseau
    Alors sur le <appareil>, les données sont identiques à celles enregistrées

    Exemples:
      | appareil   |
      | smartphone |
      | PC         |

  # ---------------------------------------------------------------- Conflits (CA-6, CA-8) et RG-056

  @US-017 @RG-036 @LOT-001
  Scénario: S09 — Des informations différentes du même élément modifiées sur les deux appareils sont toutes conservées
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Plan" en "Rédiger le plan"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur modifie le délai de la tâche "Plan" en 2026-11-15
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Rédiger le plan" existe avec le délai 2026-11-15
    Et la liste des modifications non retenues est vide

  @US-017 @RG-036 @RG-056 @LOT-001
  Scénario: S10 — La même information modifiée sur les deux appareils : la plus récente l'emporte et la valeur écartée est signalée
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Plan" en "A"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur renomme la tâche "Plan" en "B"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "B" existe avec le délai 2026-11-30
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | B       | intitulé    | A                  | B                |

  @US-017 @RG-036 @LOT-001
  Scénario: S11 — Une valeur remplacée en connaissance de cause n'est pas signalée
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Quand sur le PC, l'utilisateur renomme la tâche "Plan" en "A"
    Et les deux appareils échangent leurs modifications
    Et sur le smartphone, l'utilisateur renomme la tâche "A" en "B"
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "B" existe avec le délai 2026-11-30
    Et la liste des modifications non retenues est vide

  @US-017 @RG-036 @LOT-001
  Scénario: S12 — Avec l'horloge d'un appareil décalée de quelques minutes, la modification réellement la plus récente l'emporte
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Et que l'horloge du PC est en avance de 5 minutes
    Et que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur renomme la tâche "Plan" en "A"
    Et 2 minutes plus tard, sur le PC, l'utilisateur renomme la tâche "Plan" en "B"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "B" existe avec le délai 2026-11-30

  @US-017 @RG-036 @RG-056 @LOT-001
  Scénario: S12b — Deux modifications de la même information au même instant exact : les deux appareils retiennent la même valeur
    # RG-036 ne dit pas laquelle des deux l'emporte à l'égalité stricte ; le scénario n'exige que la convergence (E7, ANT-11).
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Plan" en "A"
    Et au même instant exact, sur le smartphone, l'utilisateur renomme la tâche "Plan" en "B"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors les deux appareils affichent le même intitulé pour la tâche "Plan", "A" ou "B"
    Et sur chacun des deux appareils, la liste des modifications non retenues contient exactement 1 information

  # Seuil de l'horloge déréglée (CA-13) : l'avertissement n'est émis que si l'écart dépasse 24 h strictement.
  @US-017 @RG-036 @LOT-001
  Plan du scénario: S13a — Une horloge d'appareil décalée de plus de 24 h est signalée à l'utilisateur
    Étant donné que l'horloge du smartphone est <sens> de <écart>
    Quand les deux appareils échangent leurs modifications
    Alors sur le smartphone, l\'alerte "ALR-001" est affichée

    Exemples:
      | sens       | écart       |
      | en retard  | 25 h        |
      | en avance  | 25 h        |
      | en retard  | 24 h 1 min  |
      | en avance  | 24 h 1 min  |

  @US-017 @RG-036 @LOT-001
  Plan du scénario: S13b — Une horloge d'appareil décalée de 24 h au plus n'est pas signalée
    Étant donné que l'horloge du smartphone est <sens> de <écart>
    Quand les deux appareils échangent leurs modifications
    Alors sur le smartphone, l\'alerte "ALR-001" n\'est pas affichée

    Exemples:
      | sens       | écart       |
      | en retard  | 24 h        |
      | en avance  | 24 h        |
      | en retard  | 23 h 59 min |
      | en avance  | 5 min       |

  @US-017 @RG-056 @LOT-001
  Scénario: S14 — Une modification non retenue reste listée jusqu'à ce que l'utilisateur la marque comme lue, même après réouverture
    Étant donné que la liste des modifications non retenues contient une valeur écartée pour l'intitulé de la tâche "B"
    Quand l'utilisateur ferme l'application sur le smartphone
    Et que nous sommes le 2026-11-21 à 10:00 heure de Europe/Paris
    Et l'utilisateur ouvre l'application sur le smartphone, connecté au réseau
    Alors la liste des modifications non retenues contient toujours la valeur écartée pour l'intitulé de la tâche "B"
    Quand l'utilisateur marque comme lue la modification non retenue de la tâche "B"
    Alors la liste des modifications non retenues est vide

  @US-017 @RG-056 @LOT-001
  Scénario: S15 — Tant qu'une modification non retenue n'est pas lue, l'application le signale sans bloquer
    Étant donné que la liste des modifications non retenues contient une valeur écartée pour l'intitulé de la tâche "B"
    Et que la liste des modifications non retenues contient une valeur écartée pour le délai de la tâche "Chapitre 1"
    Alors l\'indicateur de synchronisation est "SYN-INFO"
    Et toutes les fonctions restent utilisables
    Quand l'utilisateur marque comme lue la modification non retenue de la tâche "B"
    Alors l\'indicateur de synchronisation est toujours "SYN-INFO"
    Quand l'utilisateur marque comme lue la modification non retenue de la tâche "Chapitre 1"
    Alors l\'indicateur de synchronisation n\'est pas "SYN-INFO"

  @US-017 @RG-056 @LOT-001
  Scénario: S16 — Une modification non retenue lue sur un appareil l'est aussi sur l'autre, et n'est signalée qu'une fois
    Étant donné les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Plan     | à faire | 2026-11-30 | 1 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur renomme la tâche "Plan" en "A"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur renomme la tâche "Plan" en "B"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Et les deux appareils échangent leurs modifications
    Alors sur chacun des deux appareils, la liste des modifications non retenues contient exactement 1 information
    Quand sur le smartphone, l'utilisateur marque comme lue la modification non retenue de la tâche "B"
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la liste des modifications non retenues est vide
    Et sur les deux appareils, l\'indicateur de synchronisation n\'est pas "SYN-INFO"

  # ---------------------------------------------------------------- Sans réseau et perte d'accès (CA-7)

  @US-017 @RG-021 @LOT-001
  Scénario: S17a — Sans réseau, les saisies sont conservées puis enregistrées au retour du réseau, sans action
    Étant donné que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Alors sur le smartphone, l'objectif "Publier le guide" porte la mention "MEN-ATTENTE"
    Quand le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"
    Et sur le PC, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-017 @RG-035 @LOT-001
  Scénario: S17b — Sans accès Google, les saisies sont conservées puis enregistrées après la reconnexion
    Étant donné que l'accès au compte Google "A" a été retiré sur le smartphone
    Quand sur le smartphone, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Alors sur le smartphone, l'objectif "Publier le guide" porte la mention "MEN-ATTENTE"
    Quand sur le smartphone, l'utilisateur se reconnecte avec le compte "A"
    Et les deux appareils échangent leurs modifications
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"
    Et sur le PC, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  # ---------------------------------------------------------------- Données absentes ou illisibles dans le Drive (CA-9, RG-044)

  @US-017 @RG-044 @LOT-001
  Plan du scénario: S18 — Données de l'application supprimées ou illisibles dans le Drive : avertissement, et rien n'est effacé ni réécrit avant le choix
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les données de l'application ont été <altération> dans le Drive, en dehors de l'application
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Et sur le smartphone, l'utilisateur se voit proposer "restaurer" et "repartir de zéro"
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et rien n'a été réécrit dans le Drive

    Exemples:
      | altération                     |
      | supprimées                     |
      | rendues illisibles             |

  @US-017 @RG-044 @LOT-001
  Scénario: S19 — Décider plus tard laisse l'application utilisable, sans rien effacer
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les données de l'application ont été supprimées dans le Drive, en dehors de l'application
    Et que sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Quand sur le smartphone, l'utilisateur décide plus tard
    Et sur le smartphone, l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation | objectifs |
      | Chapitre 1 | 2026-11-30 | 2 h        |           |
    Alors sur le smartphone, la tâche "Chapitre 1" existe avec le délai 2026-11-30
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et rien n'a été réécrit dans le Drive

  @US-017 @RG-044 @LOT-001
  Scénario: S20 — Restaurer les données à partir de la copie de l'appareil
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les données de l'application ont été supprimées dans le Drive, en dehors de l'application
    Et que sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Quand sur le smartphone, l'utilisateur choisit de restaurer ses données
    Et les deux appareils échangent leurs modifications
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"
    Et sur les deux appareils, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-017 @RG-044 @LOT-001
  Scénario: S21 — Repartir de zéro efface les données des deux appareils ; l'autre appareil ne repose pas la question
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les données de l'application ont été supprimées dans le Drive, en dehors de l'application
    Et que le PC est sans réseau
    Et que sur le PC, l'utilisateur a renommé l'objectif "Publier le guide" en "Publier le guide pratique"
    Et que sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Quand sur le smartphone, l'utilisateur choisit de repartir de zéro
    Alors une confirmation est demandée
    Quand l'utilisateur confirme
    Alors sur le smartphone, aucun objectif n'existe
    Quand le réseau revient sur le PC
    Et les deux appareils échangent leurs modifications
    Alors sur le PC, aucun objectif n'existe
    Et sur le PC, aucun choix entre restaurer et repartir de zéro n'est demandé
    Et sur le PC, la liste des modifications non retenues contient :
      | élément          | information | valeur non retenue        | valeur conservée          |
      | Publier le guide | intitulé    | Publier le guide pratique | données effacées (repartir de zéro) |

  @US-017 @RG-044 @LOT-001
  Scénario: S22 — Renoncer à repartir de zéro ne change rien
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les données de l'application ont été supprimées dans le Drive, en dehors de l'application
    Et que sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Quand sur le smartphone, l'utilisateur choisit de repartir de zéro et renonce
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et rien n'a été réécrit dans le Drive

  @US-017 @RG-044 @LOT-001
  Scénario: S23 — Une indisponibilité momentanée du Drive n'est pas prise pour une suppression des données
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et que le Drive est momentanément indisponible
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, le message d\'erreur "ERR-012" n\'est pas affiché
    Et sur le smartphone, l'objectif "Publier le guide" porte la mention "MEN-ATTENTE"
    Quand le Drive redevient disponible
    Et le smartphone échange ses modifications avec le Drive
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"

  # ---------------------------------------------------------------- Réparations après fusion (CA-10 ; détail dans US-001, 002, 003, 023, 024, 025)

  @US-017 @RG-047 @RG-056 @LOT-001
  Scénario: S24 — Réparation après fusion : la suppression l'emporte sur une modification concurrente
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-10
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" n'existe plus
    Et la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue | valeur conservée |
      | Chapitre 1 | délai       | 2026-12-10         | tâche supprimée  |

  @US-017 @RG-048 @RG-056 @LOT-001
  Scénario: S25 — Réparation après fusion : une hiérarchie d'objectifs invalide est rétablie en annulant le placement le plus ancien
    Étant donné un objectif "Alpha" sans délai
    Et un objectif "Bêta" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "Alpha" sous l'objectif "Bêta"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Bêta" sous l'objectif "Alpha"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "Bêta" est un sous-objectif de l'objectif "Alpha"
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | Alpha   | parent      | sous Bêta          | placement annulé |

  @US-017 @RG-049 @LOT-001
  Scénario: S26 — Réparation après fusion : une incohérence d'état est signalée, sans correction automatique
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur rouvre la tâche "Section A"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Chapitre 1" est "terminée"
    Et sur les deux appareils, la tâche "Chapitre 1" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "Section A"

  # ---------------------------------------------------------------- Heure de Paris (CA-11, RG-054 ; cas limite des fuseaux)

  @US-017 @RG-054 @RG-053 @LOT-001
  Plan du scénario: S27 — La mention « heure de Paris » n'apparaît que si l'appareil est réglé sur un autre fuseau
    Étant donné que le smartphone est réglé sur le fuseau "<fuseau>"
    Alors sur le smartphone, la mention "MEN-HEURE-PARIS" <présence>

    Exemples:
      | fuseau           | présence          |
      | Europe/Paris     | n'apparaît pas    |
      | America/New_York | apparaît          |
      | UTC              | apparaît          |
      | Pacific/Auckland | apparaît          |

  @US-017 @RG-053 @RG-008 @RG-045 @LOT-001
  Scénario: S28 — Avec les deux appareils dans des fuseaux différents, dates de fin et retards sont identiques, et les délais ne changent pas de jour
    Étant donné que le smartphone est réglé sur le fuseau "America/New_York"
    Et que le PC est réglé sur le fuseau "Europe/Paris"
    Et les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-11-10 | 30 min     |           |               |
      | Chapitre 1       | à faire | 2026-11-30 | 2 h        |           |               |
    Et que nous sommes le 2026-11-10 à 23:00 heure de America/New_York
    Quand sur le smartphone, l'utilisateur termine la tâche "Chapitre 1"
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-11-11
    Et sur les deux appareils, la tâche "Payer la facture" est en retard
    Et sur les deux appareils, la tâche "Payer la facture" existe avec le délai 2026-11-10

  # ---------------------------------------------------------------- Autres cas limites

  @US-017 @RG-020 @LOT-001
  Scénario: S29 — Drive plein : l'utilisateur est averti et ses modifications restent sur l'appareil
    Étant donné que le Drive du compte "A" est plein
    Quand sur le smartphone, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, le message d\'erreur "ERR-011" est affiché
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et sur le smartphone, l'objectif "Publier le guide" porte la mention "MEN-ATTENTE"
    Quand de l'espace est libéré dans le Drive du compte "A"
    Et le smartphone échange ses modifications avec le Drive
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"

  @US-017 @RG-017 @RG-058 @LOT-001
  Scénario: S30 — Un appareil qui ne sait pas lire le format des données enregistrées par une version plus récente passe en consultation seule et invite à se mettre à jour, sans rien perdre
    Étant donné que le PC a enregistré dans le Drive des données dans un format plus récent que celui que connaît le smartphone
    Et que sur le smartphone, l'objectif "Publier le guide" a été créé et n'est pas encore synchronisé
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, l\'action "Mettre à jour" est proposée
    Et sur le smartphone, le bandeau "BAN-CONSULTATION-SEULE" est affiché et la saisie n\'est pas possible tant que l\'application n\'est pas mise à jour
    Et sur le smartphone, l'objectif "Publier le guide" existe toujours

  @US-017 @RG-058 @LOT-001
  Scénario: S30b — En consultation seule, rien n'est écrit dans le Drive ; les modifications en attente sont enregistrées après la mise à jour de l'application
    Étant donné que le PC a enregistré dans le Drive des données dans un format plus récent que celui que connaît le smartphone
    Et que sur le smartphone, l'objectif "Publier le guide" a été créé et n'est pas encore synchronisé
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, le bandeau "BAN-CONSULTATION-SEULE" est affiché et la saisie n\'est pas possible tant que l\'application n\'est pas mise à jour
    Et aucune écriture n'a été faite dans le Drive par le smartphone
    Et le Drive du compte "A" ne contient pas l'objectif "Publier le guide"
    Et sur le smartphone, l'objectif "Publier le guide" porte la mention "MEN-ATTENTE"
    Quand sur le smartphone, l'application est mise à jour et connaît le format plus récent
    Et le smartphone échange ses modifications avec le Drive
    Alors le Drive du compte "A" contient l'objectif "Publier le guide"
    Et sur le smartphone, la saisie n'est plus bloquée

  @US-017 @RG-058 @LOT-001
  Scénario: S31 — Deux versions de l'application qui partagent le même format de données coexistent : la saisie n'est pas bloquée
    Étant donné que le PC utilise une version de l'application plus récente que celle du smartphone
    Et que les deux versions partagent le même format de données
    Quand sur le PC, l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Alors sur le smartphone, l'opération est acceptée
    Et sur le smartphone, la saisie n'est pas bloquée
    Quand les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et sur les deux appareils, l'objectif "Courir un semi-marathon" existe sans délai

  # ---------------------------------------------------------------- Fichiers du Drive modifiés à la main mais restés lisibles (CA-9, RG-044 étendue, V-02)

  @US-017 @RG-044 @LOT-001
  Scénario: S32 — Un fichier du Drive modifié à la main mais resté lisible est traité comme illisible : avertissement, et rien n'est effacé ni réécrit avant le choix
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et qu'un fichier de données de l'application a été modifié à la main dans le Drive, en dehors de l'application, et reste lisible
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, le message d\'erreur "ERR-012" est affiché
    Et sur le smartphone, l'utilisateur se voit proposer "restaurer" et "repartir de zéro"
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et rien n'a été réécrit dans le Drive

  @US-017 @RG-044 @LOT-001
  Scénario: S33 — Le contenu modifié à la main dans le Drive n'est jamais fusionné avec les données de l'application
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et que dans le Drive, le délai de l'objectif "Publier le guide" a été changé à la main en 2027-06-30, le fichier restant lisible
    Quand le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Quand sur le smartphone, l'utilisateur choisit de restaurer ses données
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et le Drive du compte "A" contient l'objectif "Publier le guide"
