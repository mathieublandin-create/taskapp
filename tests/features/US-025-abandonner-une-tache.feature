# language: fr
#
# Tests métiers — US-025 — Abandonner une tâche
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.12, US-025
# E8 (Pepper, 2026-10-21) : réponses aux demandes de précision d'Anthony (explicitation-LOT-001.md, « Réponses aux Q-US ») ; glossaire d'étapes v1.2.
# E9 (Pepper, 2026-10-22) : DEC-032 (Q-US-025-3 a), CA-13 : scénarios S12c à S12f ; confirmation CNF-REPRENDRE-SOUS-TACHE (guide v0.2.11, §6.6.7) ; glossaire d'étapes v1.6.
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).
# Confirmation de l'abandon : le commanditaire a répondu « toujours » à Q-ERG-13 (2026-10-21). La confirmation est
# demandée pour tout abandon, avec ou sans sous-tâches ; elle est établie dès l'origine (aucune proposition en attente).

Fonctionnalité: Abandonner une tâche
  En tant qu'utilisateur,
  je veux abandonner une tâche que je ne réaliserai pas, sans la supprimer,
  afin de garder une trace et de ne plus la voir parmi mon travail à faire.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Abandonner (CA-1 à CA-3)

  @US-025 @RG-027 @LOT-001
  Scénario: S01 — Abandonner une tâche sans sous-tâche demande toujours une confirmation
    Étant donné les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur demande l'abandon de la tâche "Refaire le logo"
    Alors une confirmation est demandée, qui rappelle que la tâche pourra être reprise
    Quand l'utilisateur confirme
    Alors l'état de la tâche "Refaire le logo" est "abandonnée"

  @US-025 @RG-027 @LOT-001
  Scénario: S02 — Renoncer à l'abandon laisse la tâche à faire
    Étant donné les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur abandonne la tâche "Refaire le logo" et renonce
    Alors l'état de la tâche "Refaire le logo" est "à faire"

  @US-025 @RG-027 @RG-008 @RG-053 @LOT-001
  Plan du scénario: S03 — La date d'abandon est la journée de Paris, y compris en voyage et la nuit du changement d'heure
    Étant donné les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est réglé sur le fuseau "<fuseau de l'appareil>"
    Et que nous sommes le <date> à <heure> heure de <fuseau de l'appareil>
    Quand l'utilisateur abandonne la tâche "Refaire le logo" et confirme
    Alors la tâche "Refaire le logo" est "abandonnée" avec la date d'abandon <date d'abandon>

    Exemples:
      | fuseau de l'appareil | date       | heure | date d'abandon |
      | Europe/Paris         | 2026-10-21 | 10:00 | 2026-10-21     |
      | America/New_York     | 2026-11-10 | 23:00 | 2026-11-11     |
      | Europe/Paris         | 2026-10-25 | 02:30 | 2026-10-25     |
      | UTC                  | 2026-10-25 | 22:30 | 2026-10-25     |
      | UTC                  | 2026-10-25 | 23:30 | 2026-10-26     |

  @US-025 @RG-027 @LOT-001
  Scénario: S04 — Une tâche abandonnée quitte les tâches à faire et reste consultable parmi les tâches abandonnées
    Étant donné les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
      | Chapitre 1      | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur abandonne la tâche "Refaire le logo" et confirme
    Et l'utilisateur filtre les tâches sur l'état "à faire"
    Alors la liste des tâches contient exactement "Chapitre 1"
    Quand l'utilisateur filtre les tâches sur l'état "abandonnée"
    Alors la liste des tâches contient exactement "Refaire le logo"

  @US-025 @RG-027 @RG-045 @LOT-001
  Scénario: S05 — Une tâche abandonnée n'a pas de date de fin et n'est pas en retard
    Étant donné les tâches suivantes :
      | intitulé         | état    | délai      | estimation | objectifs | tâche parente |
      | Payer la facture | à faire | 2026-10-19 | 30 min     |           |               |
    Et la tâche "Payer la facture" est en retard
    Quand l'utilisateur abandonne la tâche "Payer la facture" et confirme
    Alors l'état de la tâche "Payer la facture" est "abandonnée"
    Et la tâche "Payer la facture" n'a pas de date de fin
    Et la tâche "Payer la facture" n'est pas en retard

  @US-025 @RG-027 @LOT-001
  Scénario: S06 — Abandonner une tâche terminée n'est pas proposé
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée | 2026-11-30 | 2 h        |           |               |
    Alors l'action "abandonner" n'est pas proposée pour la tâche "Chapitre 1"

  # ---------------------------------------------------------------- Objectifs (CA-4)

  @US-025 @RG-025 @RG-027 @LOT-001
  Plan du scénario: S07 — L'état des objectifs ignore la tâche abandonnée
    Étant donné un objectif "Nouvelle identité visuelle" sans délai
    Et les tâches suivantes :
      | intitulé        | état     | délai      | estimation | objectifs                  | tâche parente |
      | Choisir l'agence | <état autre tâche> | 2026-11-15 | 1 h | Nouvelle identité visuelle |    |
      | Refaire le logo | à faire  | 2026-11-30 | 2 h        | Nouvelle identité visuelle |               |
    Quand l'utilisateur abandonne la tâche "Refaire le logo" et confirme
    Alors l'état de l'objectif "Nouvelle identité visuelle" est "<état attendu>"

    Exemples:
      | état autre tâche | état attendu         |
      | terminée         | atteint              |
      | à faire          | en cours             |
      | abandonnée       | à décliner en tâches |

  # ---------------------------------------------------------------- Reprendre (CA-5)

  @US-025 @RG-027 @RG-025 @RG-045 @LOT-001
  Scénario: S08 — Reprendre une tâche abandonnée la remet à faire et recalcule ses objectifs
    Étant donné un objectif "Nouvelle identité visuelle" sans délai
    Et les tâches suivantes :
      | intitulé         | état       | délai      | estimation | objectifs                  | tâche parente |
      | Choisir l'agence | terminée   | 2026-10-15 | 1 h        | Nouvelle identité visuelle |               |
      | Refaire le logo  | abandonnée | 2026-10-19 | 2 h        | Nouvelle identité visuelle |               |
    Et l'état de l'objectif "Nouvelle identité visuelle" est "atteint"
    Quand l'utilisateur reprend la tâche "Refaire le logo"
    Alors l'état de la tâche "Refaire le logo" est "à faire"
    Et la tâche "Refaire le logo" n'a pas de date d'abandon
    Et la tâche "Refaire le logo" est en retard
    Et l'état de l'objectif "Nouvelle identité visuelle" est "en cours"

  # ---------------------------------------------------------------- Tâche parente et sous-tâches (CA-6 à CA-9)

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S09 — Abandonner une tâche parente abandonne ses sous-tâches à faire, pas ses sous-tâches terminées
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Alors l'état de la tâche "Chapitre 1" est "abandonnée"
    Et l'état de la tâche "Section A" est "terminée"
    Et l'état de la tâche "Section B" est "abandonnée"
    Et l'état de la tâche "Section C" est "abandonnée"

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S10 — La confirmation de l'abandon d'une tâche parente indique le nombre de sous-tâches abandonnées avec elle
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur demande l'abandon de la tâche "Chapitre 1"
    Alors une confirmation est demandée, qui annonce 2 sous-tâches abandonnées avec la tâche

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S11 — Reprendre une tâche parente reprend les sous-tâches abandonnées avec elle, pas celles abandonnées auparavant
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
      | Section C  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur abandonne la tâche "Section C" et confirme
    Et l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et l'utilisateur reprend la tâche "Chapitre 1"
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Et l'état de la tâche "Section A" est "terminée"
    Et l'état de la tâche "Section B" est "à faire"
    Et l'état de la tâche "Section C" est "abandonnée"

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S12 — La reprise d'une sous-tâche dont la tâche parente est abandonnée n'est pas proposée
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | abandonnée | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Alors l'action "reprendre" n'est pas proposée pour la tâche "Section A"

  # DEC-030 (Q-US-025-2 a) : pas de réouverture directe ; il faut d'abord reprendre la tâche parente.
  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S12b — La réouverture d'une sous-tâche terminée dont la tâche parente est abandonnée n'est pas proposée
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | abandonnée | 2026-11-30 |            |           |               |
      | Section A  | terminée   | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Alors l'action "rouvrir" n'est pas proposée pour la tâche "Section A"
    Quand l'utilisateur reprend la tâche "Chapitre 1"
    Alors l'action "rouvrir" est proposée pour la tâche "Section A"

  # DEC-032 (Q-US-025-3 a) : la reprise d'une sous-tâche abandonnée dont la tâche parente est terminée est proposée,
  # après la confirmation CNF-REPRENDRE-SOUS-TACHE (Steeve, guide d'ergonomie v0.2.11, §6.6.7 ; ECR-007 D3),
  # qui annonce la réouverture de la tâche parente. Construction du contexte (glossaire §1, Q-US-024-1 b) :
  # "Section A" est abandonnée seule, "Section B" terminée, puis "Chapitre 1" terminée (permis : US-024 CA-8).
  @US-025 @RG-027 @RG-023 @RG-025 @LOT-001
  Scénario: S12c — Reprendre une sous-tâche abandonnée dont la tâche parente est terminée rouvre aussi la tâche parente, après confirmation
    Étant donné un objectif "Nouvelle identité visuelle" sans délai
    Et les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs                  | tâche parente |
      | Chapitre 1 | terminée   | 2026-11-30 |            | Nouvelle identité visuelle |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |                            | Chapitre 1    |
      | Section B  | terminée   | 2026-11-25 | 1 h        |                            | Chapitre 1    |
    Et l'état de l'objectif "Nouvelle identité visuelle" est "atteint"
    Alors l'action "reprendre" est proposée pour la tâche "Section A"
    Quand l'utilisateur reprend la tâche "Section A"
    Alors une confirmation "CNF-REPRENDRE-SOUS-TACHE" est demandée, qui annonce la réouverture de la tâche "Chapitre 1"
    Quand l'utilisateur confirme
    Alors l'état de la tâche "Section A" est "à faire"
    Et la tâche "Section A" n'a pas de date d'abandon
    Et l'état de la tâche "Chapitre 1" est "à faire"
    Et la tâche "Chapitre 1" n'a pas de date de fin
    Et l'état de la tâche "Section B" est "terminée"
    Et l'état de l'objectif "Nouvelle identité visuelle" est "en cours"
    Et aucun élément ne porte la mention "MEN-INCOHERENCE"

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S12d — Renoncer à la reprise d'une sous-tâche abandonnée dont la tâche parente est terminée ne change rien
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée   | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | terminée   | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Quand l'utilisateur reprend la tâche "Section A" et renonce
    Alors la tâche "Section A" est "abandonnée" avec la date d'abandon 2026-10-21
    Et la tâche "Chapitre 1" est "terminée" avec la date de fin 2026-10-21
    Et l'état de la tâche "Section B" est "terminée"
    Et l'historique ne contient aucune entrée "reprise" pour la tâche "Section A"
    Et l'historique ne contient aucune entrée "réouverture" pour la tâche "Chapitre 1"

  @US-025 @RG-027 @RG-023 @RG-021 @LOT-001
  Scénario: S12e — Hors ligne, la reprise confirmée d'une sous-tâche sous une tâche parente terminée est conservée puis retrouvée sur l'autre appareil
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée   | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | terminée   | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Et que le smartphone est sans réseau
    Quand sur le smartphone, l'utilisateur reprend la tâche "Section A"
    Alors sur le smartphone, une confirmation "CNF-REPRENDRE-SOUS-TACHE" est demandée, qui annonce la réouverture de la tâche "Chapitre 1"
    Quand sur le smartphone, l'utilisateur confirme
    Alors sur le smartphone, l'état de la tâche "Section A" est "à faire"
    Et sur le smartphone, l'état de la tâche "Chapitre 1" est "à faire"
    Et sur le smartphone, la tâche "Section A" porte la mention "MEN-ATTENTE"
    Et sur le smartphone, la tâche "Chapitre 1" porte la mention "MEN-ATTENTE"
    Et sur le PC, l'état de la tâche "Section A" est "abandonnée"
    Et sur le PC, l'état de la tâche "Chapitre 1" est "terminée"
    Quand le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Section A" est "à faire"
    Et sur les deux appareils, l'état de la tâche "Chapitre 1" est "à faire"
    Et sur les deux appareils, la tâche "Chapitre 1" n'a pas de date de fin
    Et aucun élément ne porte la mention "MEN-INCOHERENCE"
    Et sur les deux appareils, la liste des modifications non retenues est vide

  # CA-11 (RG-050), Q-US-001-2 c : la réouverture de la tâche parente, conséquence de la reprise, a sa propre entrée (comme US-003 S22).
  @US-025 @RG-050 @RG-027 @RG-023 @LOT-001
  Scénario: S12f — La reprise d'une sous-tâche et la réouverture de sa tâche parente terminée sont conservées dans l'historique
    Étant donné les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | terminée   | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | terminée   | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Quand l'utilisateur reprend la tâche "Section A"
    Et l'utilisateur confirme
    Alors l'historique de la tâche "Section A" se termine par :
      | événement | journée    | avant                                 | après   |
      | reprise   | 2026-10-22 | abandonnée, date d'abandon 2026-10-21 | à faire |
    Et l'historique de la tâche "Chapitre 1" se termine par :
      | événement   | journée    | avant                            | après   |
      | réouverture | 2026-10-22 | terminée, date de fin 2026-10-21 | à faire |

  @US-025 @RG-027 @RG-023 @LOT-001
  Scénario: S13 — Abandonner une sous-tâche seule recalcule l'estimation de la tâche parente et peut la rendre terminable
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h 30     |           | Chapitre 1    |
    Quand l'utilisateur abandonne la tâche "Section B" et confirme
    Alors l'état de la tâche "Chapitre 1" est "à faire"
    Et l'estimation de la tâche "Chapitre 1" est 1 h
    Quand l'utilisateur termine la tâche "Chapitre 1"
    Alors l'état de la tâche "Chapitre 1" est "terminée"

  # ---------------------------------------------------------------- Deux appareils (cas limite RG-036, CA-10 RG-049)

  @US-025 @RG-036 @LOT-001
  Scénario: S14 — Abandon sur un appareil et modification d'une autre information sur l'autre : les deux sont conservés
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur abandonne la tâche "Refaire le logo" et confirme
    Et sur le smartphone, l'utilisateur modifie le délai de la tâche "Refaire le logo" en 2026-12-15
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Refaire le logo" est "abandonnée"
    Et sur les deux appareils, la tâche "Refaire le logo" existe avec le délai 2026-12-15
    Et sur les deux appareils, la liste des modifications non retenues est vide

  @US-025 @RG-049 @LOT-001
  Scénario: S15 — Tâche parente abandonnée sur le PC pendant qu'une sous-tâche est reprise sur le smartphone : incohérence signalée
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et les tâches suivantes :
      | intitulé   | état       | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire    | 2026-11-30 |            |           |               |
      | Section A  | abandonnée | 2026-11-20 | 1 h        |           | Chapitre 1    |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et sur le smartphone, l'utilisateur reprend la tâche "Section A"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'état de la tâche "Chapitre 1" est "abandonnée"
    Et sur les deux appareils, l'état de la tâche "Section A" est "à faire"
    Et sur les deux appareils, la tâche "Chapitre 1" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "Section A"

  @US-025 @RG-049 @LOT-001
  Plan du scénario: S16 — L'incohérence d'une tâche parente abandonnée est résolue par l'utilisateur
    Étant donné que la tâche "Chapitre 1", abandonnée, est signalée en incohérence avec sa sous-tâche à faire "Section A"
    Quand l'utilisateur <action>
    Alors la tâche "Chapitre 1" ne porte plus la mention "MEN-INCOHERENCE"

    Exemples:
      | action                                     |
      | termine la tâche "Section A"               |
      | abandonne la tâche "Section A" et confirme |
      | reprend la tâche "Chapitre 1"              |

  # ---------------------------------------------------------------- Historique (CA-11, RG-050)

  @US-025 @RG-050 @LOT-001
  Scénario: S17 — L'abandon et la reprise d'une tâche sont conservés dans l'historique
    Étant donné les tâches suivantes :
      | intitulé        | état    | délai      | estimation | objectifs | tâche parente |
      | Refaire le logo | à faire | 2026-11-30 | 2 h        |           |               |
    Quand l'utilisateur abandonne la tâche "Refaire le logo" et confirme
    Et que nous sommes le 2026-10-24 à 09:00 heure de Europe/Paris
    Et l'utilisateur reprend la tâche "Refaire le logo"
    Alors l'historique contient, pour la tâche "Refaire le logo" :
      | événement | journée    | avant                                  | après                                  |
      | création  | 2026-10-21 |                                        | délai 2026-11-30, estimation 2 h       |
      | abandon   | 2026-10-21 | à faire                                | abandonnée, date d'abandon 2026-10-21  |
      | reprise   | 2026-10-24 | abandonnée, date d'abandon 2026-10-21  | à faire                                |

  @US-025 @RG-050 @RG-027 @RG-023 @LOT-001
  Scénario: S18 — L'abandon et la reprise en cascade des sous-tâches sont conservés dans l'historique de chaque sous-tâche concernée
    # E8, Q-US-001-2 c : une conséquence enregistrée (abandon ou reprise d'une sous-tâche avec sa tâche parente) a sa propre entrée.
    Étant donné les tâches suivantes :
      | intitulé   | état     | délai      | estimation | objectifs | tâche parente |
      | Chapitre 1 | à faire  | 2026-11-30 |            |           |               |
      | Section A  | terminée | 2026-11-20 | 1 h        |           | Chapitre 1    |
      | Section B  | à faire  | 2026-11-25 | 1 h        |           | Chapitre 1    |
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Quand l'utilisateur abandonne la tâche "Chapitre 1" et confirme
    Et que nous sommes le 2026-10-24 à 09:00 heure de Europe/Paris
    Et l'utilisateur reprend la tâche "Chapitre 1"
    Alors l'historique de la tâche "Section B" se termine par :
      | événement | journée    | avant                                 | après                                 |
      | abandon   | 2026-10-22 | à faire                               | abandonnée, date d'abandon 2026-10-22 |
      | reprise   | 2026-10-24 | abandonnée, date d'abandon 2026-10-22 | à faire                               |
    Et l'historique ne contient aucune entrée "abandon" pour la tâche "Section A"
