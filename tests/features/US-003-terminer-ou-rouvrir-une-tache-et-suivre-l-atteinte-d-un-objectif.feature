# language: fr
#
# Tests métiers — US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.6, US-003
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# @propose : le scénario repose sur une règle ou un critère encore proposé, à valider par le commanditaire en E6.

Fonctionnalité: Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
  En tant qu'utilisateur,
  je veux déclarer une tâche terminée, pouvoir la rouvrir, et voir si chacun de mes objectifs est atteint,
  afin de savoir ce qui est accompli.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Terminer (CA-1, CA-2)

  @US-003 @RG-026 @RG-008 @RG-053 @LOT-001
  Scénario: Terminer une tâche conserve la journée de Paris comme date de fin
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-10-21

  @US-003 @RG-026 @RG-008 @RG-053 @LOT-001
  Scénario: En voyage, la date de fin est la journée de Paris
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est réglé sur le fuseau "America/New_York"
    Et que nous sommes le 2026-11-10 à 23:00 heure de America/New_York
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-11-11

  @US-003 @RG-026 @RG-008 @RG-053 @LOT-001
  Plan du scénario: La date de fin reste juste la nuit du passage à l'heure d'hiver (25/10/2026)
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est réglé sur le fuseau "<fuseau de l'appareil>"
    Et que nous sommes le <date> à <heure> heure de <fuseau de l'appareil>
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors la tâche "Chapitre 1" est "terminée" avec la date de fin <date de fin>

    # 02:30 existe deux fois à Paris le 2026-10-25 ; 22:30 UTC = 23:30 à Paris ; 23:30 UTC = 00:30 le 26 à Paris.
    Exemples:
      | fuseau de l'appareil | date       | heure | date de fin |
      | Europe/Paris         | 2026-10-25 | 01:59 | 2026-10-25  |
      | Europe/Paris         | 2026-10-25 | 02:30 | 2026-10-25  |
      | Europe/Paris         | 2026-10-25 | 23:59 | 2026-10-25  |
      | Europe/Paris         | 2026-10-26 | 00:00 | 2026-10-26  |
      | UTC                  | 2026-10-24 | 22:30 | 2026-10-25  |
      | UTC                  | 2026-10-25 | 22:30 | 2026-10-25  |
      | UTC                  | 2026-10-25 | 23:30 | 2026-10-26  |

  @US-003 @RG-026 @RG-023 @LOT-001
  Scénario: Aucune tâche n'est terminée automatiquement, même quand toutes ses sous-tâches le sont
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur termine la tâche "Section A"
    Et l'utilisateur termine la tâche "Section B"
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-10-21

  @US-003 @RG-026 @LOT-001
  Scénario: Terminer une tâche déjà terminée n'est pas proposé
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 | 2 h        |           |               |
    Alors l'action "terminer" n'est pas proposée pour la tâche "Chapitre 1"

  # ---------------------------------------------------------------- Rouvrir (CA-3)

  @US-003 @RG-026 @LOT-001
  Scénario: Rouvrir une tâche terminée
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur rouvre la tâche "Chapitre 1"
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Et la tâche "Chapitre 1" n'a pas de date de fin

  # ---------------------------------------------------------------- Atteinte d'un objectif (CA-4 à CA-7)

  @US-003 @RG-025 @LOT-001
  Plan du scénario: Un objectif est atteint quand ses tâches non abandonnées sont terminées et ses sous-objectifs atteints
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et l'objectif "Publier le guide" a <a> tâche(s) à faire, <t> tâche(s) terminée(s) et <ab> tâche(s) abandonnée(s)
    Et l'objectif "Publier le guide" a un sous-objectif <sous-objectif>
    Alors l'état de l'objectif "Publier le guide" est "<état>"

    Exemples:
      | a | t | ab | sous-objectif           | état                 |
      | 0 | 2 | 1  | absent                  | atteint              |
      | 0 | 0 | 1  | absent                  | à décliner en tâches |
      | 1 | 2 | 0  | absent                  | en cours             |
      | 0 | 2 | 0  | atteint                 | atteint              |
      | 0 | 2 | 0  | en cours                | en cours             |
      | 0 | 0 | 0  | atteint                 | atteint              |
      | 0 | 0 | 0  | à décliner en tâches    | en cours             |

  @US-003 @RG-025 @RG-023 @LOT-001 @propose
  Scénario: Une sous-tâche à faire empêche l'atteinte de l'objectif de sa tâche parente
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs        | tâche parente |
      | Plan       | terminée | 2026-11-01 | 1 h        | Publier le guide |               |
      | Chapitre 1 | à faire  | 2026-11-30 |            | Publier le guide |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |                  | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |                  | Chapitre 1    |
    Alors l'état de l'objectif "Publier le guide" est "en cours"
    Quand l'utilisateur termine la tâche "Section B"
    Et l'utilisateur termine la tâche "Chapitre 1"
    Alors l'état de l'objectif "Publier le guide" est "atteint"

  @US-003 @RG-025 @LOT-001
  Plan du scénario: L'état d'un objectif est recalculé à chaque événement de ses tâches
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs        | tâche parente |
      | Plan       | terminée | 2026-11-01 | 1 h        | Publier le guide |               |
      | Chapitre 1 | <état>   | 2026-11-30 | 2 h        | Publier le guide |               |
      | Annexe     | à faire  | 2026-11-30 | 1 h        |                  |               |
    Quand l'utilisateur <événement>
    Alors l'état de l'objectif "Publier le guide" est "<état attendu>"

    Exemples:
      | état       | événement                                                     | état attendu |
      | à faire    | termine la tâche "Chapitre 1"                                 | atteint      |
      | terminée   | rouvre la tâche "Plan"                                        | en cours     |
      | terminée   | rattache la tâche "Annexe" à l'objectif "Publier le guide"    | en cours     |
      | à faire    | détache la tâche "Chapitre 1" de l'objectif "Publier le guide" | atteint     |
      | à faire    | abandonne la tâche "Chapitre 1" et confirme                   | atteint      |
      | abandonnée | reprend la tâche "Chapitre 1"                                 | en cours     |
      | à faire    | supprime la tâche "Chapitre 1" et confirme                    | atteint      |

  @US-003 @RG-025 @RG-022 @LOT-001
  Scénario: L'état d'un objectif est recalculé quand un de ses sous-objectifs change d'état
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et les tâches suivantes :
      | intitulé           | état    | délai      | estimation | objectifs          | tâche parente |
      | Mettre en page     | à faire | 2026-12-01 | 2 h        | Version imprimable |               |
    Alors l'état de l'objectif "Publier le guide" est "en cours"
    Quand l'utilisateur termine la tâche "Mettre en page"
    Alors l'état de l'objectif "Version imprimable" est "atteint"
    Et l'état de l'objectif "Publier le guide" est "atteint"

  @US-003 @RG-025 @RG-001 @LOT-001
  Scénario: Une tâche rattachée à plusieurs objectifs compte comme terminée pour chacun d'eux
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Développer mon activité" sans délai
    Et les tâches suivantes :
      | intitulé            | état    | délai      | estimation | objectifs                                 | tâche parente |
      | Rédiger l'interview | à faire | 2026-11-30 | 1 h        | Publier le guide, Développer mon activité |               |
    Quand l'utilisateur termine la tâche "Rédiger l'interview"
    Alors l'état de l'objectif "Publier le guide" est "atteint"
    Et l'état de l'objectif "Développer mon activité" est "atteint"

  # ---------------------------------------------------------------- Tâche parente (CA-8, CA-9)

  @US-003 @RG-023 @LOT-001
  Scénario: Une tâche parente qui a des sous-tâches restantes ne peut pas être terminée
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire    | 2026-11-30 |            |           |               |
      | Section A  | terminée   | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire    | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C  | à faire    | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section D  | abandonnée | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors l'action est refusée avec le motif "2 sous-tâches restantes"
    Et l'état de la tâche "Chapitre 1" est "à faire"

  @US-003 @RG-026 @RG-023 @LOT-001 @propose
  Scénario: Rouvrir une sous-tâche d'une tâche parente terminée rouvre aussi la tâche parente, après confirmation
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur rouvre la tâche "Section A"
    Alors une confirmation est demandée, qui annonce la réouverture de la tâche "Chapitre 1"
    Quand l'utilisateur confirme
    Alors l'état de la tâche "Section A" est "à faire"
    Et l'état de la tâche "Chapitre 1" est "à faire"

  @US-003 @RG-026 @RG-023 @LOT-001 @propose
  Scénario: Renoncer à la réouverture d'une sous-tâche d'une tâche parente terminée ne change rien
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur rouvre la tâche "Section A" et renonce
    Alors l'état de la tâche "Section A" est "terminée"
    Et l'état de la tâche "Chapitre 1" est "terminée"

  # ---------------------------------------------------------------- Retard (CA-10) et filtres (CA-11)

  @US-003 @RG-045 @RG-026 @LOT-001
  Scénario: Une tâche terminée après son délai n'est pas en retard, mais le redevient une fois rouverte
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-10-19 | 30 min     |           |               |
    Et la tâche "Payer la facture" est en retard
    Quand l'utilisateur termine la tâche "Payer la facture"
    Alors la tâche "Payer la facture" n'est pas en retard
    Quand l'utilisateur rouvre la tâche "Payer la facture"
    Alors la tâche "Payer la facture" est en retard

  @US-003 @RG-026 @LOT-001 @propose
  Plan du scénario: Les tâches peuvent être filtrées selon qu'elles sont à faire ou terminées
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Plan       | terminée | 2026-11-01 | 1 h        |           |               |
      | Chapitre 1 | à faire  | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur filtre les tâches sur l'état "<filtre>"
    Alors la liste des tâches contient exactement "<tâches>"

    Exemples:
      | filtre   | tâches     |
      | à faire  | Chapitre 1 |
      | terminée | Plan       |

  # ---------------------------------------------------------------- Deux appareils : conflits et incohérence (CA-12, RG-049 proposée)

  @US-003 @RG-036 @RG-056 @LOT-001 @propose
  Scénario: Tâche terminée sur un appareil et abandonnée sur l'autre : l'état le plus récent l'emporte et l'autre est signalé
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Chapitre 1" est "abandonnée"
    Et sur les deux appareils, la tâche "Chapitre 1" n'a pas de date de fin
    Et la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue | valeur conservée |
      | Chapitre 1 | état        | terminée           | abandonnée       |

  @US-003 @RG-049 @RG-025 @LOT-001 @propose
  Scénario: Une tâche parente terminée alors qu'une sous-tâche a été rouverte sur l'autre appareil est signalée, sans correction automatique
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            | Publier le guide |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |                  | Chapitre 1    |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur rouvre la tâche "Section A"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Chapitre 1" est "terminée"
    Et sur les deux appareils, l'état de la tâche "Section A" est "à faire"
    Et sur les deux appareils, la tâche "Chapitre 1" est signalée en incohérence avec sa sous-tâche "Section A"
    Et l'état de l'objectif "Publier le guide" est "en cours"

  @US-003 @RG-049 @LOT-001 @propose
  Plan du scénario: L'incohérence d'une tâche parente terminée est résolue par l'utilisateur
    Étant donné que la tâche "Chapitre 1", terminée, est signalée en incohérence avec sa sous-tâche à faire "Section A"
    Quand l'utilisateur <action>
    Alors la tâche "Chapitre 1" n'est plus signalée en incohérence

    Exemples:
      | action                                         |
      | termine la tâche "Section A"                   |
      | abandonne la tâche "Section A" et confirme     |
      | rouvre la tâche "Chapitre 1"                   |

  # ---------------------------------------------------------------- Historique (CA-3, CA-13, RG-050 proposée)

  @US-003 @RG-050 @RG-026 @LOT-001 @propose
  Scénario: La fin et la réouverture d'une tâche sont conservées dans l'historique, avec la date de fin précédente
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Et que nous sommes le 2026-10-23 à 18:00 heure de Europe/Paris
    Et l'utilisateur rouvre la tâche "Chapitre 1"
    Alors l'historique contient, pour la tâche "Chapitre 1" :
      | événement   | journée    | avant      | après      |
      | fin         | 2026-10-21 | à faire    | terminée, date de fin 2026-10-21 |
      | réouverture | 2026-10-23 | terminée, date de fin 2026-10-21 | à faire |
