# language: fr
#
# Tests métiers — US-024 — Décomposer une tâche en sous-tâches
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.6, US-024
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# @propose : le scénario repose sur une règle ou un critère encore proposé, à valider par le commanditaire en E6.

Fonctionnalité: Décomposer une tâche en sous-tâches
  En tant qu'utilisateur,
  je veux découper une tâche en sous-tâches,
  afin de suivre plus finement un travail important.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Création (CA-1, CA-2)

  @US-024 @RG-023 @LOT-001
  Scénario: S01 — Créer une sous-tâche depuis une tâche
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Alors la tâche "Section A" existe avec :
      | état    | délai      | estimation | tâche parente |
      | à faire | 2026-11-20 | 1 h        | Chapitre 1    |

  @US-024 @RG-023 @LOT-001
  Scénario: S02 — Une sous-tâche ne peut pas avoir de sous-tâche
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Alors l'action "créer une sous-tâche" n'est pas proposée pour la tâche "Section A"

  @US-024 @RG-003 @RG-028 @RG-029 @LOT-001
  Plan du scénario: S03 — Une sous-tâche se saisit comme une tâche : délai et estimation obligatoires, au pas de 30 min
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai   | estimation   |
      | Section A | <délai> | <estimation> |
    Alors l'enregistrement est refusé avec le motif "<motif>"
    Et la tâche "Chapitre 1" n'a aucune sous-tâche

    Exemples:
      | délai      | estimation | motif                |
      |            | 1 h        | délai manquant       |
      | 2026-11-20 |            | estimation manquante |
      | 2026-11-20 | 0 h        | estimation invalide  |
      | 2026-11-20 | 45 min     | estimation invalide  |

  @US-024 @RG-003 @RG-029 @LOT-001
  Scénario: S04 — Aucun délai ni aucune estimation ne sont présélectionnés à la saisie d'une sous-tâche
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur commence la saisie d'une sous-tâche de la tâche "Chapitre 1"
    Alors aucun délai n'est présélectionné
    Et aucune estimation n'est présélectionnée

  # ---------------------------------------------------------------- Affichage (CA-3)

  @US-024 @RG-023 @RG-045 @LOT-001 @propose
  Scénario: S05 — Le détail d'une tâche présente ses sous-tâches et le nombre de sous-tâches terminées
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire    | 2026-11-30 |            |           |               |
      | Section A  | terminée   | 2026-10-15 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire    | 2026-10-20 | 30 min     |           | Chapitre 1    |
      | Section C  | à faire    | 2026-11-25 | 1 h 30     |           | Chapitre 1    |
      | Section D  | abandonnée | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur consulte le détail de la tâche "Chapitre 1"
    Alors le détail présente les sous-tâches :
      | intitulé  | délai      | estimation | état       | en retard |
      | Section A | 2026-10-15 | 1 h        | terminée   | non       |
      | Section B | 2026-10-20 | 30 min     | à faire    | oui       |
      | Section C | 2026-11-25 | 1 h 30     | à faire    | non       |
      | Section D | 2026-11-25 | 1 h        | abandonnée | non       |
    Et le détail indique 1 sous-tâche terminée sur 3 sous-tâches non abandonnées

  # ---------------------------------------------------------------- Estimation calculée (CA-4, CA-5)

  @US-024 @RG-023 @RG-029 @LOT-001
  Scénario: S06 — L'estimation d'une tâche parente est la somme des estimations de ses sous-tâches et n'est pas saisissable
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire | 2026-11-25 | 1 h 30     |           | Chapitre 1    |
    Alors l'estimation de la tâche "Chapitre 1" est 2 h 30
    Quand l'utilisateur modifie l'estimation de la tâche "Chapitre 1" en 4 h
    Alors la modification est refusée avec le motif "estimation calculée à partir des sous-tâches"
    Et l'estimation de la tâche "Chapitre 1" est 2 h 30

  @US-024 @RG-023 @LOT-001
  Plan du scénario: S07 — L'estimation de la tâche parente se met à jour à chaque changement de ses sous-tâches
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire | 2026-11-25 | 1 h 30     |           | Chapitre 1    |
    Quand l'utilisateur <changement>
    Alors l'estimation de la tâche "Chapitre 1" est <estimation>

    Exemples:
      | changement                                                                 | estimation |
      | crée une sous-tâche "Section C" de la tâche "Chapitre 1", de délai 2026-11-28, estimée à 2 h | 4 h 30 |
      | modifie l'estimation de la tâche "Section A" en 2 h                        | 3 h 30     |
      | supprime la tâche "Section B" et confirme                                  | 1 h        |
      | termine la tâche "Section A"                                               | 2 h 30     |

  @US-024 @RG-023 @LOT-001 @propose
  Scénario: S08 — Les sous-tâches abandonnées ne comptent pas dans l'estimation de la tâche parente
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire | 2026-11-25 | 1 h 30     |           | Chapitre 1    |
    Quand l'utilisateur abandonne la tâche "Section A" et confirme
    Alors l'estimation de la tâche "Chapitre 1" est 1 h 30
    Quand l'utilisateur reprend la tâche "Section A"
    Alors l'estimation de la tâche "Chapitre 1" est 2 h 30

  @US-024 @RG-023 @RG-029 @LOT-001 @propose
  Scénario: S09 — La première sous-tâche remplace l'estimation saisie de la tâche, après information de l'utilisateur
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur commence la saisie d'une sous-tâche de la tâche "Chapitre 1"
    Alors l'utilisateur est informé que l'estimation de 3 h de la tâche "Chapitre 1" sera remplacée par la somme de ses sous-tâches
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Alors l'estimation de la tâche "Chapitre 1" est 1 h

  @US-024 @RG-023 @RG-029 @LOT-001 @propose
  Scénario: S10 — Après suppression de sa dernière sous-tâche, la tâche redevient simple avec la dernière somme, de nouveau modifiable
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h 30     |           | Chapitre 1    |
    Quand l'utilisateur supprime la tâche "Section A" et confirme
    Alors la tâche "Chapitre 1" n'a aucune sous-tâche
    Et l'estimation de la tâche "Chapitre 1" est 1 h 30
    Quand l'utilisateur modifie l'estimation de la tâche "Chapitre 1" en 2 h
    Alors l'estimation initiale de la tâche "Chapitre 1" est 2 h

  # ---------------------------------------------------------------- Délai (CA-6) et objectifs hérités (CA-7)

  @US-024 @RG-023 @LOT-001
  Plan du scénario: S11 — Une alerte nomme la tâche parente quand le délai d'une sous-tâche lui est postérieur
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai   | estimation |
      | Section A | <délai> | 1 h        |
    Alors la tâche "Section A" existe avec le délai <délai>
    Et la tâche "Section A" <alerte>

    Exemples:
      | délai      | alerte                                                        |
      | 2026-12-05 | porte une alerte de délai qui nomme la tâche parente "Chapitre 1" |
      | 2026-11-30 | ne porte aucune alerte de délai                               |
      | 2026-11-20 | ne porte aucune alerte de délai                               |

  @US-024 @RG-023 @LOT-001
  Plan du scénario: S12 — L'alerte de délai d'une sous-tâche est recalculée quand l'un des deux délais change
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur <modification>
    Alors la tâche "Section A" <alerte>

    Exemples:
      | modification                                            | alerte                                                        |
      | modifie le délai de la tâche "Chapitre 1" en 2026-11-15 | porte une alerte de délai qui nomme la tâche parente "Chapitre 1" |
      | modifie le délai de la tâche "Section A" en 2026-12-02  | porte une alerte de délai qui nomme la tâche parente "Chapitre 1" |
      | modifie le délai de la tâche "Section A" en 2026-11-29  | ne porte aucune alerte de délai                               |

  @US-024 @RG-023 @RG-045 @LOT-001
  Scénario: S13 — Une sous-tâche au délai déjà dépassé est acceptée et signalée en retard
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-10-18 | 1 h        |
    Alors la tâche "Section A" existe avec le délai 2026-10-18
    Et la tâche "Section A" est en retard

  @US-024 @RG-023 @RG-001 @LOT-001
  Scénario: S14 — Une sous-tâche hérite des objectifs de sa tâche parente, sans pouvoir en changer
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Écrire" sans délai
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            | Publier le guide |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |                  | Chapitre 1    |
    Alors la tâche "Section A" est rattachée au seul objectif "Publier le guide"
    Quand l'utilisateur rattache la tâche "Section A" à l'objectif "Écrire"
    Alors la modification est refusée avec le motif "objectifs hérités de la tâche parente"
    Quand l'utilisateur rattache la tâche "Chapitre 1" à l'objectif "Écrire"
    Alors la tâche "Section A" est rattachée aux objectifs "Publier le guide" et "Écrire"
    Quand l'utilisateur détache la tâche "Chapitre 1" de l'objectif "Publier le guide"
    Alors la tâche "Section A" est rattachée au seul objectif "Écrire"

  # ---------------------------------------------------------------- Fin de la tâche parente (CA-8)

  @US-024 @RG-023 @RG-026 @LOT-001
  Scénario: S15 — La tâche parente ne peut être terminée qu'une fois toutes ses sous-tâches terminées ou abandonnées, puis reste à faire
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors l'action est refusée avec le motif "2 sous-tâches restantes"
    Quand l'utilisateur termine la tâche "Section A"
    Et l'utilisateur abandonne la tâche "Section B" et confirme
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors l'état de la tâche "Chapitre 1" est "terminée"

  @US-024 @RG-023 @LOT-001 @propose
  Scénario: S16 — Quand toutes les sous-tâches sont abandonnées, l'estimation est de 0 h et la tâche parente peut être terminée
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire    | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Alors l'estimation de la tâche "Chapitre 1" est 0 h
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors l'état de la tâche "Chapitre 1" est "terminée"

  @US-024 @RG-023 @RG-026 @LOT-001 @propose
  Scénario: S17 — Ajouter une sous-tâche à une tâche terminée la rouvre, après confirmation
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Alors une confirmation est demandée, qui annonce la réouverture de la tâche "Chapitre 1"
    Quand l'utilisateur confirme
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Et la tâche "Section A" existe avec le délai 2026-11-20

  @US-024 @RG-023 @RG-027 @LOT-001 @propose
  Scénario: S18 — Ajouter une sous-tâche à une tâche abandonnée est refusé tant qu'elle n'est pas reprise
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | abandonnée | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Alors l'action est refusée avec le motif "tâche abandonnée"
    Et la tâche "Chapitre 1" n'a aucune sous-tâche

  # ---------------------------------------------------------------- Suppression (CA-9)

  @US-024 @RG-046 @RG-023 @LOT-001
  Scénario: S19 — Supprimer une tâche parente supprime ses sous-tâches, après une confirmation qui en indique le nombre
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur demande la suppression de la tâche "Chapitre 1"
    Alors une confirmation est demandée, qui annonce 3 sous-tâches supprimées avec la tâche
    Quand l'utilisateur confirme
    Alors les tâches "Chapitre 1", "Section A", "Section B" et "Section C" n'existent plus

  # ---------------------------------------------------------------- Deux appareils (CA-10 RG-049, CA-11 RG-047)

  @US-024 @RG-049 @LOT-001 @propose
  Scénario: S20 — Tâche parente terminée sur le PC pendant qu'une sous-tâche est créée sur le smartphone : incohérence signalée, rien n'est corrigé
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur termine la tâche "Chapitre 1"
    Et sur le smartphone, l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section B | 2026-11-25 | 1 h        |
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Chapitre 1" est "terminée"
    Et sur les deux appareils, l'état de la tâche "Section B" est "à faire"
    Et sur les deux appareils, la tâche "Chapitre 1" est signalée en incohérence avec sa sous-tâche "Section B"

  @US-024 @RG-049 @LOT-001 @propose
  Plan du scénario: S21 — L'incohérence est signalée jusqu'à ce que l'utilisateur la résolve
    Étant donné que la tâche "Chapitre 1", terminée, est signalée en incohérence avec sa sous-tâche à faire "Section B"
    Quand l'utilisateur <action>
    Alors la tâche "Chapitre 1" n'est plus signalée en incohérence

    Exemples:
      | action                                     |
      | termine la tâche "Section B"               |
      | abandonne la tâche "Section B" et confirme |
      | rouvre la tâche "Chapitre 1"               |

  @US-024 @RG-047 @RG-046 @RG-056 @LOT-001 @propose
  Scénario: S22 — Une sous-tâche ajoutée à une tâche supprimée sur l'autre appareil est supprimée, et l'utilisateur en est informé
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et sur le smartphone, l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, les tâches "Chapitre 1" et "Section A" n'existent plus
    Et la liste des modifications non retenues contient :
      | élément   | information | valeur non retenue      | valeur conservée                  |
      | Section A | création    | sous-tâche de Chapitre 1 | supprimée avec la tâche Chapitre 1 |

  # ---------------------------------------------------------------- Historique (CA-12, RG-050 proposée)

  @US-024 @RG-050 @LOT-001 @propose
  Scénario: S23 — La création d'une sous-tâche, avec sa tâche parente, et sa suppression sont conservées dans l'historique
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 3 h        |           |               |
    Quand l'utilisateur crée une sous-tâche de la tâche "Chapitre 1" :
      | intitulé  | délai      | estimation |
      | Section A | 2026-11-20 | 1 h        |
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et l'utilisateur supprime la tâche "Section A" et confirme
    Alors l'historique contient, pour la tâche "Section A" :
      | événement   | journée    | avant | après                                                    |
      | création    | 2026-10-21 |       | tâche parente Chapitre 1, délai 2026-11-20, estimation 1 h |
      | suppression | 2026-10-22 |       |                                                          |
