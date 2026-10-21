# language: fr
#
# Tests métiers — US-002 — Créer et gérer mes tâches
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.11, US-002
# E8 (Pepper, 2026-10-21) : réponses aux demandes de précision d'Anthony (explicitation-LOT-001.md, « Réponses aux Q-US ») ; glossaire d'étapes v1.2.
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).

Fonctionnalité: Créer et gérer mes tâches
  En tant qu'utilisateur,
  je veux créer, consulter, modifier et supprimer une tâche, avec son délai et son estimation,
  et la rattacher à zéro, un ou plusieurs objectifs,
  afin de transformer mes objectifs en travail concret.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Création (CA-1 à CA-4)

  @US-002 @RG-001 @RG-003 @RG-028 @RG-029 @LOT-001
  Scénario: S01 — Créer une tâche avec son délai, son estimation et un objectif
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Quand l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation | objectifs        |
      | Chapitre 1 | 2026-11-30 | 2 h 30     | Publier le guide |
    Alors la tâche "Chapitre 1" existe avec :
      | état    | délai      | estimation | objectifs        |
      | à faire | 2026-11-30 | 2 h 30     | Publier le guide |
    Et l'estimation initiale de la tâche "Chapitre 1" est 2 h 30

  @US-002 @RG-003 @RG-029 @LOT-001
  Scénario: S02 — Aucun délai ni aucune estimation ne sont présélectionnés à la saisie d'une tâche
    Quand l'utilisateur commence la saisie d'une nouvelle tâche
    Alors aucun délai n'est présélectionné
    Et aucune estimation n'est présélectionnée

  @US-002 @RG-003 @RG-029 @LOT-001
  Plan du scénario: S03 — Une tâche sans délai ou sans estimation est refusée, avec l'information manquante
    Quand l'utilisateur crée une tâche :
      | intitulé   | délai   | estimation   | objectifs |
      | Chapitre 1 | <délai> | <estimation> |           |
    Alors l'enregistrement est refusé avec le motif "<motif>"
    Et aucune tâche n'existe

    Exemples:
      | délai      | estimation | motif            |
      |            | 2 h        | ERR-021          |
      | 2026-11-30 |            | ERR-022          |
      |            |            | ERR-021, ERR-022 |

  @US-002 @RG-003 @LOT-001
  Plan du scénario: S04 — Une tâche à l'intitulé vide est refusée
    Quand l'utilisateur crée une tâche de délai 2026-11-30, estimée à 1 h, dont l'intitulé est <intitulé>
    Alors l'enregistrement est refusé avec le motif "ERR-020"
    Et aucune tâche n'existe

    Exemples:
      | intitulé                     |
      | vide                         |
      | composé uniquement d'espaces |

  @US-002 @RG-028 @RG-029 @LOT-001
  Plan du scénario: S05a — Les estimations multiples de 30 min, d'au moins 30 min, sont acceptées
    Quand l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation   | objectifs |
      | Chapitre 1 | 2026-11-30 | <estimation> |           |
    Alors la tâche "Chapitre 1" existe avec l'estimation <estimation>

    Exemples:
      | estimation |
      | 30 min     |
      | 1 h        |
      | 1 h 30     |

  @US-002 @RG-028 @RG-029 @LOT-001
  Plan du scénario: S05b — Une estimation de 0 h ou qui n'est pas un multiple de 30 min est refusée
    # Le minimum de 30 min vaut pour la saisie ; une estimation calculée de 0 h est valide (US-024, S16 et S16b).
    Quand l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation   | objectifs |
      | Chapitre 1 | 2026-11-30 | <estimation> |           |
    Alors l'enregistrement est refusé avec le motif "ERR-023"

    Exemples:
      | estimation |
      | 0 h        |
      | 45 min     |
      | 1 h 10     |

  # ---------------------------------------------------------------- Rattachement (CA-5, CA-6)

  @US-002 @RG-001 @LOT-001
  Scénario: S06 — Une tâche sans objectif figure dans la vue « Tâches sans objectif »
    Quand l'utilisateur crée une tâche :
      | intitulé        | délai      | estimation | objectifs |
      | Changer la roue | 2026-10-25 | 1 h        |           |
    Alors la tâche "Changer la roue" existe sans objectif
    Et la tâche "Changer la roue" figure parmi les tâches sans objectif

  @US-002 @RG-001 @LOT-001
  Scénario: S07 — Une tâche rattachée à plusieurs objectifs apparaît dans le détail de chacun
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Développer mon activité" sans délai
    Quand l'utilisateur crée une tâche :
      | intitulé            | délai      | estimation | objectifs                                 |
      | Rédiger l'interview | 2026-11-30 | 1 h        | Publier le guide, Développer mon activité |
    Alors le détail de l'objectif "Publier le guide" présente la tâche "Rédiger l'interview"
    Et le détail de l'objectif "Développer mon activité" présente la tâche "Rédiger l'interview"

  # ---------------------------------------------------------------- Alerte de délai (CA-7)

  @US-002 @RG-024 @LOT-001
  Plan du scénario: S08 — Une alerte nomme les objectifs dont le délai est antérieur à celui de la tâche, sans bloquer
    Étant donné un objectif "Publier le guide" de délai 2026-11-20
    Et un objectif "Développer mon activité" <délai du second objectif>
    Quand l'utilisateur crée une tâche :
      | intitulé            | délai     | estimation | objectifs                                 |
      | Rédiger l'interview | <délai>   | 1 h        | Publier le guide, Développer mon activité |
    Alors la tâche "Rédiger l'interview" existe avec le délai <délai>
    Et la tâche "Rédiger l'interview" <alerte>

    Exemples:
      | délai du second objectif | délai      | alerte                                                                                       |
      | de délai 2026-11-25      | 2026-11-30 | porte une alerte de délai qui nomme les objectifs "Publier le guide" et "Développer mon activité" |
      | de délai 2026-12-31      | 2026-11-30 | porte une alerte de délai qui nomme l'objectif "Publier le guide"                      |
      | sans délai               | 2026-11-30 | porte une alerte de délai qui nomme l'objectif "Publier le guide"                      |
      | sans délai               | 2026-11-20 | ne porte aucune alerte de délai                                                              |
      | de délai 2026-12-31      | 2026-11-10 | ne porte aucune alerte de délai                                                              |

  # ---------------------------------------------------------------- Modification et recalculs (CA-8)

  @US-002 @RG-004 @LOT-001
  Plan du scénario: S09 — Modifier une tâche à tout moment
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Écrire" sans délai
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |
    Quand l'utilisateur <modification>
    Alors la tâche <résultat>

    Exemples:
      | modification                                                        | résultat                                                       |
      | renomme la tâche "Chapitre 1" en "Chapitre 1 : contexte"            | "Chapitre 1 : contexte" existe avec le délai 2026-11-30        |
      | modifie le délai de la tâche "Chapitre 1" en 2026-12-10             | "Chapitre 1" existe avec le délai 2026-12-10                   |
      | rattache la tâche "Chapitre 1" à l'objectif "Écrire"                | "Chapitre 1" est rattachée aux objectifs "Publier le guide" et "Écrire" |
      | détache la tâche "Chapitre 1" de l'objectif "Publier le guide"      | "Chapitre 1" existe sans objectif                              |

  @US-002 @RG-024 @RG-045 @LOT-001
  Scénario: S10 — Modifier le délai d'une tâche recalcule l'alerte de délai et le retard
    Étant donné un objectif "Publier le guide" de délai 2026-11-20
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-10 | 2 h        | Publier le guide |               |
    Quand l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-11-25
    Alors la tâche "Chapitre 1" porte une alerte de délai qui nomme l'objectif "Publier le guide"
    Quand l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-10-20
    Alors la tâche "Chapitre 1" ne porte aucune alerte de délai
    Et la tâche "Chapitre 1" est en retard

  @US-002 @RG-001 @RG-025 @LOT-001
  Plan du scénario: S11 — Rattacher ou détacher une tâche recalcule l'état des objectifs concernés
    Étant donné un objectif "Santé" sans délai
    Et l'objectif "Santé" a 0 tâche(s) à faire, <terminées> tâche(s) terminée(s) et 0 tâche(s) abandonnée(s)
    Et les tâches suivantes :
      | intitulé    | état    | délai      | estimation | objectifs | tâche parente |
      | Prendre RDV | à faire | 2026-11-05 | 30 min     |           |               |
    Et l'état de l'objectif "Santé" est "<état avant>"
    Quand l'utilisateur rattache la tâche "Prendre RDV" à l'objectif "Santé"
    Alors l'état de l'objectif "Santé" est "en cours"
    Quand l'utilisateur détache la tâche "Prendre RDV" de l'objectif "Santé"
    Alors l'état de l'objectif "Santé" est "<état avant>"
    Et la tâche "Prendre RDV" existe sans objectif

    Exemples:
      | terminées | état avant           |
      | 1         | atteint              |
      | 0         | à décliner en tâches |

  # ---------------------------------------------------------------- Estimation (CA-9)

  @US-002 @RG-029 @LOT-001
  Scénario: S12 — Au lot 1, l'estimation d'une tâche reste modifiable et devient l'estimation initiale
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur modifie l'estimation de la tâche "Chapitre 1" en 3 h 30
    Alors l'estimation initiale de la tâche "Chapitre 1" est 3 h 30

  @US-002 @RG-029 @RG-023 @LOT-001
  Scénario: S13 — L'estimation d'une tâche qui a des sous-tâches ne peut pas être modifiée
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 |            |           |               |
      | Section A  | à faire | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur modifie l'estimation de la tâche "Chapitre 1" en 3 h
    Alors la modification est refusée avec le motif "ERR-033"
    Et l'estimation de la tâche "Chapitre 1" est 1 h

  # ---------------------------------------------------------------- Retard (CA-10), délai sans heure, heure de Paris

  @US-002 @RG-003 @RG-045 @LOT-001
  Scénario: S14 — Un délai déjà dépassé est accepté et la tâche est aussitôt en retard
    Quand l'utilisateur crée une tâche :
      | intitulé       | délai      | estimation | objectifs |
      | Payer la facture | 2026-10-19 | 30 min     |           |
    Alors la tâche "Payer la facture" existe avec le délai 2026-10-19
    Et la tâche "Payer la facture" est en retard

  @US-002 @RG-045 @LOT-001
  Plan du scénario: S15 — Une tâche cesse d'être en retard
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-10-19 | 30 min     |           |               |
    Quand l'utilisateur <action>
    Alors la tâche "Payer la facture" n'est pas en retard

    Exemples:
      | action                                                        |
      | modifie le délai de la tâche "Payer la facture" en 2026-10-21 |
      | modifie le délai de la tâche "Payer la facture" en 2026-10-30 |
      | termine la tâche "Payer la facture"                           |
      | abandonne la tâche "Payer la facture" et confirme             |

  @US-002 @RG-045 @RG-008 @RG-053 @LOT-001
  Plan du scénario: S16 — Un délai égal à la journée en cours n'est pas en retard ; le retard commence à minuit heure de Paris, y compris le jour du passage à l'heure d'hiver
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-10-25 | 30 min     |           |               |
    Et que nous sommes le <date> à <heure> heure de Europe/Paris
    Alors la tâche "Payer la facture" <résultat>

    Exemples:
      | date       | heure | résultat            |
      | 2026-10-25 | 00:00 | n'est pas en retard |
      | 2026-10-25 | 02:30 | n'est pas en retard |
      | 2026-10-25 | 23:59 | n'est pas en retard |
      | 2026-10-26 | 00:00 | est en retard       |

  @US-002 @RG-045 @RG-053 @LOT-001
  Plan du scénario: S17 — Le jour du changement d'heure, un appareil réglé sur un autre fuseau applique la journée de Paris
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-10-25 | 30 min     |           |               |
    Et que le smartphone est réglé sur le fuseau "UTC"
    Et que nous sommes le 2026-10-25 à <heure UTC> heure de UTC
    Alors la tâche "Payer la facture" <résultat>

    # 22:30 UTC = 23:30 à Paris (heure d'hiver, UTC+1) ; 23:30 UTC = 00:30 le 26 à Paris.
    Exemples:
      | heure UTC | résultat            |
      | 22:30     | n'est pas en retard |
      | 23:30     | est en retard       |

  @US-002 @RG-003 @RG-053 @RG-017 @LOT-001
  Scénario: S18 — Un délai est une date sans heure, identique sur les deux appareils quel que soit leur fuseau
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et que le smartphone est réglé sur le fuseau "America/New_York"
    Et que le PC est réglé sur le fuseau "Europe/Paris"
    Et que nous sommes le 2026-11-14 à 21:00 heure de America/New_York
    Quand sur le smartphone, l'utilisateur crée une tâche :
      | intitulé         | délai      | estimation | objectifs |
      | Envoyer le devis | 2026-11-15 | 1 h        |           |
    Et les deux appareils échangent leurs modifications
    Alors sur le smartphone, la tâche "Envoyer le devis" existe avec le délai 2026-11-15
    Et sur le PC, la tâche "Envoyer le devis" existe avec le délai 2026-11-15
    Et sur les deux appareils, la tâche "Envoyer le devis" n'est pas en retard

  @US-002 @RG-045 @RG-008 @RG-053 @LOT-001
  Plan du scénario: S19 — En voyage, le retard d'une tâche suit la journée de Paris
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-11-10 | 30 min     |           |               |
    Et que le smartphone est réglé sur le fuseau "America/New_York"
    Et que nous sommes le 2026-11-10 à <heure locale> heure de America/New_York
    Alors la tâche "Payer la facture" <résultat>

    Exemples:
      | heure locale | résultat            |
      | 17:59        | n'est pas en retard |
      | 18:00        | est en retard       |

  # ---------------------------------------------------------------- Liste (CA-11)

  # E8, Q-US-002-1 (guide d'ergonomie §5.7) : la liste s'ouvre sur le filtre d'état « à faire » ; trois valeurs de filtre, « à faire »,
  # « terminée », « abandonnée », sans valeur « tous » ; les sous-tâches ne sont jamais des lignes de la liste.
  @US-002 @RG-045 @RG-001 @LOT-001
  Scénario: S20 — Par défaut, la liste des tâches présente les tâches à faire, triées par délai croissant, avec les informations de chaque tâche
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé         | état     | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 2       | à faire  | 2026-12-01 | 3 h        | Publier le guide |               |
      | Payer la facture | à faire  | 2026-10-19 | 30 min     |                  |               |
      | Chapitre 1       | terminée | 2026-11-15 | 2 h        | Publier le guide |               |
    Quand l'utilisateur consulte la liste des tâches
    Alors le filtre d'état de la liste des tâches est "à faire"
    Et la liste des tâches présente, dans cet ordre :
      | intitulé         | délai      | estimation | état     | objectifs        | en retard |
      | Payer la facture | 2026-10-19 | 30 min     | à faire  |                  | oui       |
      | Chapitre 2       | 2026-12-01 | 3 h        | à faire  | Publier le guide | non       |
    Quand l'utilisateur filtre les tâches sur l'état "terminée"
    Alors la liste des tâches présente, dans cet ordre :
      | intitulé         | délai      | estimation | état     | objectifs        | en retard |
      | Chapitre 1       | 2026-11-15 | 2 h        | terminée | Publier le guide | non       |

  @US-002 @RG-003 @LOT-001
  Scénario: S20b — À délai égal, les tâches à faire sont classées de la plus anciennement créée à la plus récente, puis par intitulé
    # Ordre alphabétique de l'intitulé sans tenir compte des majuscules ni des accents (guide d'ergonomie §5.7).
    Quand l'utilisateur crée une tâche :
      | intitulé | délai      | estimation | objectifs |
      | Relire   | 2026-11-30 | 1 h        |           |
    Et 5 minutes plus tard, l'utilisateur crée une tâche :
      | intitulé | délai      | estimation | objectifs |
      | Zoom     | 2026-11-30 | 1 h        |           |
    Et au même instant exact, l'utilisateur crée une tâche :
      | intitulé | délai      | estimation | objectifs |
      | écrire   | 2026-11-30 | 1 h        |           |
    Et au même instant exact, l'utilisateur crée une tâche :
      | intitulé | délai      | estimation | objectifs |
      | Appeler  | 2026-11-30 | 1 h        |           |
    Et l'utilisateur crée une tâche :
      | intitulé | délai      | estimation | objectifs |
      | Banque   | 2026-11-20 | 30 min     |           |
    Et l'utilisateur consulte la liste des tâches
    Alors la liste des tâches présente, dans cet ordre :
      | intitulé |
      | Banque   |
      | Relire   |
      | Appeler  |
      | écrire   |
      | Zoom     |

  @US-002 @RG-026 @RG-027 @LOT-001
  Scénario: S20c — Les tâches terminées sont présentées de la plus récemment terminée à la plus ancienne, et les tâches abandonnées de la plus récemment abandonnée à la plus ancienne
    Étant donné les tâches suivantes :
      | intitulé | état     | délai      | estimation | objectifs | tâche parente | date de fin |
      | Plan     | terminée | 2026-12-01 | 1 h        |           |               | 2026-10-10  |
      | Sommaire | terminée | 2026-10-05 | 1 h        |           |               | 2026-10-18  |
      | Préface  | terminée | 2026-11-15 | 1 h        |           |               | 2026-10-14  |
    Et les tâches suivantes :
      | intitulé | état       | délai      | estimation | objectifs | tâche parente | date d'abandon |
      | Logo     | abandonnée | 2026-10-01 | 1 h        |           |               | 2026-10-12     |
      | Affiche  | abandonnée | 2026-12-20 | 1 h        |           |               | 2026-10-19     |
    Quand l'utilisateur filtre les tâches sur l'état "terminée"
    Alors la liste des tâches présente, dans cet ordre :
      | intitulé |
      | Sommaire |
      | Préface  |
      | Plan     |
    Quand l'utilisateur filtre les tâches sur l'état "abandonnée"
    Alors la liste des tâches présente, dans cet ordre :
      | intitulé |
      | Affiche  |
      | Logo     |

  @US-002 @RG-023 @RG-001 @LOT-001
  Scénario: S20d — Les sous-tâches ne sont jamais des lignes de la liste des tâches ; la tâche parente indique leur avancement
    Étant donné les tâches suivantes :
      | intitulé         | état       | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire    | 2026-10-25 | 30 min     |           |               |
      | Chapitre 1       | à faire    | 2026-11-30 |            |           |               |
      | Section A        | terminée   | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B        | à faire    | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C        | abandonnée | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur filtre les tâches sur l'état "à faire"
    Alors la liste des tâches contient exactement "Payer la facture" et "Chapitre 1"
    Et dans la liste des tâches, la tâche "Chapitre 1" indique 1 sous-tâche terminée sur 2 sous-tâches non abandonnées
    Et la tâche "Section B" ne figure pas parmi les tâches sans objectif
    Quand l'utilisateur filtre les tâches sur l'état "terminée"
    Alors la liste des tâches est vide
    Quand l'utilisateur filtre les tâches sur l'état "abandonnée"
    Alors la liste des tâches est vide

  # ---------------------------------------------------------------- Suppression (CA-12)

  @US-002 @RG-046 @RG-025 @LOT-001
  Scénario: S21 — Supprimer une tâche qui a des sous-tâches, après une confirmation qui en indique le nombre
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs        | tâche parente |
      | Plan       | terminée | 2026-11-01 | 1 h        | Publier le guide |               |
      | Chapitre 1 | à faire  | 2026-11-30 |            | Publier le guide |               |
      | Section A  | à faire  | 2026-11-20 | 1 h        |                  | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |                  | Chapitre 1    |
    Quand l'utilisateur demande la suppression de la tâche "Chapitre 1"
    Alors une confirmation est demandée, qui annonce 2 sous-tâches supprimées avec la tâche
    Quand l'utilisateur confirme
    Alors les tâches "Chapitre 1", "Section A" et "Section B" n'existent plus
    Et l'état de l'objectif "Publier le guide" est "atteint"

  @US-002 @RG-046 @LOT-001
  Scénario: S22 — Renoncer à la suppression d'une tâche ne change rien
    Étant donné les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur supprime la tâche "Chapitre 1" et renonce
    Alors la tâche "Chapitre 1" existe avec le délai 2026-11-30

  # ---------------------------------------------------------------- Suppression concurrente (CA-13) et historique (CA-14)

  @US-002 @RG-047 @RG-056 @LOT-001
  Scénario: S23 — La suppression d'une tâche l'emporte sur une modification plus récente faite sur l'autre appareil
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur renomme la tâche "Chapitre 1" en "Chapitre 1 revu"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, la tâche "Chapitre 1" n'existe plus
    Et sur les deux appareils, la tâche "Chapitre 1 revu" n'existe pas
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément    | information | valeur non retenue | valeur conservée |
      | Chapitre 1 | intitulé    | Chapitre 1 revu    | tâche supprimée  |

  @US-002 @RG-050 @LOT-001
  Scénario: S24 — La vie d'une tâche est conservée dans l'historique
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Quand l'utilisateur crée une tâche :
      | intitulé   | délai      | estimation | objectifs        |
      | Chapitre 1 | 2026-11-30 | 2 h        | Publier le guide |
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et l'utilisateur modifie le délai de la tâche "Chapitre 1" en 2026-12-05
    Et l'utilisateur modifie l'estimation de la tâche "Chapitre 1" en 3 h
    Et l'utilisateur détache la tâche "Chapitre 1" de l'objectif "Publier le guide"
    Et l'utilisateur rattache la tâche "Chapitre 1" à l'objectif "Publier le guide"
    Et que nous sommes le 2026-10-23 à 09:00 heure de Europe/Paris
    Et l'utilisateur supprime la tâche "Chapitre 1" et confirme
    Alors l'historique contient, pour la tâche "Chapitre 1" :
      | événement                | journée    | avant            | après                                        |
      | création                 | 2026-10-21 |                  | délai 2026-11-30, estimation 2 h, objectifs Publier le guide |
      | modification délai       | 2026-10-22 | 2026-11-30       | 2026-12-05                                   |
      | modification estimation  | 2026-10-22 | 2 h              | 3 h                                          |
      | détachement              | 2026-10-22 | Publier le guide |                                              |
      | rattachement             | 2026-10-22 |                  | Publier le guide                             |
      | suppression              | 2026-10-23 |                  |                                              |
    Et l'historique n'est affiché nulle part dans l'application
