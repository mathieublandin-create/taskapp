# language: fr
#
# Tests métiers — US-001 — Créer et gérer un objectif
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.11, US-001
# E8 (Pepper, 2026-10-21) : réponses aux demandes de précision d'Anthony (explicitation-LOT-001.md, « Réponses aux Q-US ») ; glossaire d'étapes v1.2.
#
# Conventions d'écriture, communes aux fichiers du lot :
# - les étapes s'exécutent au niveau des cas d'usage (conventions techniques §9.6 et §9.7), sans détail d'interface, sauf les scénarios tagués @ihm ;
# - dates au format AAAA-MM-JJ, heures HH:MM, durées « 2 h 30 », « 30 min », « 0 h » ;
# - toute heure est ancrée explicitement dans un fuseau (« heure de Europe/Paris ») ;
# - « sur le smartphone, » ou « sur le PC, » en tête d'étape désigne l'appareil concerné ; sans mention, l'appareil est le seul en jeu ;
# - « les deux appareils échangent leurs modifications » : chacun enregistre ses modifications dans le Drive puis intègre celles de l'autre ;
# - le vocabulaire des étapes est figé dans GLOSSAIRE-ETAPES.md (appareil, synchronisation, temps, assertions, négations, listes fermées pour les colonnes d'Exemples) ;
# - date des tâches de contexte : une tâche de contexte « terminée » ou « abandonnée » a pour date de fin ou d'abandon la date du contexte, sauf mention contraire (GLOSSAIRE-ETAPES.md §1) ;
# - le temps ne passe que par l'horloge contrôlée du banc (jamais d'attente réelle) ;
# - tags : @US-xxx, @RG-xxx et @LOT-001 sur chaque scénario ; @ihm si le scénario exige l'interface réelle ; @recette s'il se déroule à la main ;
# - Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).

Fonctionnalité: Créer et gérer un objectif
  En tant qu'utilisateur,
  je veux créer, consulter, modifier et supprimer un objectif, avec ou sans délai,
  afin de formaliser ce que je cherche à atteindre.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Création (CA-1, CA-2)

  @US-001 @RG-002 @LOT-001
  Scénario: S01 — Créer un objectif avec un délai
    Quand l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Alors l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et l'état de l'objectif "Publier le guide" est "à décliner en tâches"
    Et l'objectif "Publier le guide" n'est pas en retard

  @US-001 @RG-002 @LOT-001
  Scénario: S02 — La description d'un objectif est facultative
    Quand l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15 avec la description "Version imprimable comprise"
    Et l'utilisateur crée un objectif "Courir un semi-marathon" de délai 2027-04-30 sans description
    Alors l'objectif "Publier le guide" a la description "Version imprimable comprise"
    Et l'objectif "Courir un semi-marathon" existe sans description

  @US-001 @RG-002 @LOT-001
  Scénario: S03 — Un objectif sans délai est accepté et affiché « sans délai »
    Quand l'utilisateur crée un objectif "Apprendre l'italien" sans délai
    Alors l'objectif "Apprendre l'italien" existe sans délai
    Et l'objectif "Apprendre l'italien" porte la mention "MEN-SANS-DELAI"
    Et l'objectif "Apprendre l'italien" n'est pas en retard

  @US-001 @RG-002 @LOT-001
  Plan du scénario: S04 — Un intitulé vide est refusé
    Quand l'utilisateur crée un objectif sans délai dont l'intitulé est <intitulé>
    Alors l'enregistrement est refusé avec le motif "ERR-020"
    Et aucun objectif n'existe

    Exemples:
      | intitulé                     |
      | vide                         |
      | composé uniquement d'espaces |

  @US-001 @RG-002 @LOT-001
  Scénario: S04b — Les espaces placés au début et à la fin d'un intitulé ne sont pas conservés
    # E8, Q-US-001-3 : les espaces de début et de fin sont retirés à l'enregistrement ; aucune longueur maximale n'est fixée.
    Quand l'utilisateur crée un objectif "   Publier le guide  " de délai 2026-12-15
    Alors l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et il existe 1 objectif d'intitulé "Publier le guide"

  @US-001 @RG-002 @LOT-001
  Scénario: S05 — Deux objectifs peuvent porter le même intitulé
    Étant donné un objectif "Santé" sans délai
    Quand l'utilisateur crée un objectif "Santé" de délai 2027-06-30
    Alors il existe 2 objectifs d'intitulé "Santé"

  # ---------------------------------------------------------------- Consultation (CA-3, CA-4)

  @US-001 @RG-025 @RG-045 @LOT-001
  Scénario: S06 — La liste des objectifs affiche l'état, le délai, le retard et la progression en tâches directes
    Étant donné un objectif "Publier le guide" de délai 2026-10-15
    Et un objectif "Apprendre l'italien" sans délai
    Et les tâches suivantes :
      | intitulé         | état       | délai      | estimation | objectifs        | tâche parente |
      | Plan             | terminée   | 2026-10-10 | 1 h        | Publier le guide |               |
      | Chapitre 1       | à faire    | 2026-10-30 | 2 h        | Publier le guide |               |
      | Relecture        | abandonnée | 2026-10-30 | 1 h        | Publier le guide |               |
      | Relire section A | terminée   | 2026-10-30 | 30 min     |                  | Chapitre 1    |
    Quand l'utilisateur consulte la liste des objectifs
    Alors la liste des objectifs présente :
      | intitulé            | délai      | état                 | en retard | tâches terminées | tâches non abandonnées |
      | Publier le guide    | 2026-10-15 | en cours             | oui       | 1                | 2                      |
      | Apprendre l'italien | sans délai | à décliner en tâches | non       | 0                | 0                      |

  @US-001 @RG-001 @RG-022 @LOT-001
  Scénario: S07 — Le détail d'un objectif présente ses informations, ses tâches et ses sous-objectifs
    Étant donné un objectif "Publier le guide" de délai 2026-12-15 avec la description "Version imprimable comprise"
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Plan       | à faire | 2026-11-10 | 1 h        | Publier le guide |               |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |
    Quand l'utilisateur consulte le détail de l'objectif "Publier le guide"
    Alors le détail présente l'intitulé "Publier le guide", la description "Version imprimable comprise" et le délai 2026-12-15
    Et le détail présente les tâches "Plan" et "Chapitre 1"
    Et le détail présente le sous-objectif "Version imprimable"

  # ---------------------------------------------------------------- Modification (CA-5, CA-6)

  @US-001 @RG-004 @RG-002 @LOT-001
  Plan du scénario: S08 — Modifier un objectif à tout moment
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Quand l'utilisateur <modification>
    Alors l'objectif <résultat>

    Exemples:
      | modification                                                            | résultat                                                  |
      | renomme l'objectif "Publier le guide" en "Publier le guide pratique"   | "Publier le guide pratique" existe avec le délai 2026-12-15 |
      | modifie la description de l'objectif "Publier le guide" en "Format A5" | "Publier le guide" a la description "Format A5"           |
      | modifie le délai de l'objectif "Publier le guide" en 2027-01-31        | "Publier le guide" existe avec le délai 2027-01-31        |
      | retire le délai de l'objectif "Publier le guide"                       | "Publier le guide" existe sans délai                      |

  @US-001 @RG-004 @RG-002 @LOT-001
  Scénario: S09 — Ajouter un délai à un objectif qui n'en avait pas
    Étant donné un objectif "Apprendre l'italien" sans délai
    Quand l'utilisateur modifie le délai de l'objectif "Apprendre l'italien" en 2027-06-30
    Alors l'objectif "Apprendre l'italien" existe avec le délai 2027-06-30

  @US-001 @RG-024 @LOT-001
  Plan du scénario: S10 — Les alertes de délai des tâches sont recalculées quand le délai de l'objectif change
    Étant donné un objectif "Publier le guide" <délai initial de l'objectif>
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs        | tâche parente |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide |               |
    Quand l'utilisateur <modification du délai de l'objectif>
    Alors la tâche "Chapitre 1" <alerte>

    Exemples:
      | délai initial de l'objectif | modification du délai de l'objectif                             | alerte                                                         |
      | de délai 2026-12-15         | modifie le délai de l'objectif "Publier le guide" en 2026-11-20 | porte une alerte de délai qui nomme l'objectif "Publier le guide" |
      | de délai 2026-11-20         | retire le délai de l'objectif "Publier le guide"                | ne porte aucune alerte de délai                                |
      | de délai 2026-11-20         | modifie le délai de l'objectif "Publier le guide" en 2026-12-31 | ne porte aucune alerte de délai                                |
      | de délai 2026-11-20         | modifie le délai de l'objectif "Publier le guide" en 2026-11-30 | ne porte aucune alerte de délai                                |
      | sans délai                  | modifie le délai de l'objectif "Publier le guide" en 2026-11-29 | porte une alerte de délai qui nomme l'objectif "Publier le guide" |

  # ---------------------------------------------------------------- Retard (CA-7) et heure de Paris

  @US-001 @RG-002 @RG-045 @LOT-001
  Scénario: S11 — Un délai déjà dépassé est accepté et l'objectif est aussitôt en retard
    Quand l'utilisateur crée un objectif "Déclarer les impôts" de délai 2026-10-20
    Alors l'objectif "Déclarer les impôts" existe avec le délai 2026-10-20
    Et l'objectif "Déclarer les impôts" est en retard

  @US-001 @RG-045 @RG-025 @LOT-001
  Plan du scénario: S12 — Un objectif cesse d'être en retard
    Étant donné un objectif "Déclarer les impôts" de délai 2026-10-20
    Et les tâches suivantes :
      | intitulé           | état    | délai      | estimation | objectifs           | tâche parente |
      | Remplir le dossier | à faire | 2026-10-20 | 1 h        | Déclarer les impôts |               |
    Et l'objectif "Déclarer les impôts" est en retard
    Quand l'utilisateur <action>
    Alors l'objectif "Déclarer les impôts" n'est pas en retard

    Exemples:
      | action                                                                |
      | termine la tâche "Remplir le dossier"                                 |
      | retire le délai de l'objectif "Déclarer les impôts"                   |
      | modifie le délai de l'objectif "Déclarer les impôts" en 2026-10-21    |
      | modifie le délai de l'objectif "Déclarer les impôts" en 2026-11-05    |

  @US-001 @RG-045 @RG-008 @RG-053 @LOT-001
  Plan du scénario: S13 — Le retard d'un objectif bascule à minuit heure de Paris, y compris la nuit du passage à l'heure d'hiver
    Étant donné un objectif "Déclarer les impôts" de délai 2026-10-25
    Et que nous sommes le <date> à <heure> heure de Europe/Paris
    Alors l'objectif "Déclarer les impôts" <résultat>

    Exemples:
      | date       | heure | résultat           |
      | 2026-10-25 | 02:30 | n'est pas en retard |
      | 2026-10-25 | 23:59 | n'est pas en retard |
      | 2026-10-26 | 00:00 | est en retard       |

  @US-001 @RG-045 @RG-008 @RG-053 @LOT-001
  Plan du scénario: S14 — En voyage, le retard suit la journée de Paris et non celle du lieu
    Étant donné un objectif "Déclarer les impôts" de délai 2026-11-10
    Et que le smartphone est réglé sur le fuseau "America/New_York"
    Et que nous sommes le 2026-11-10 à <heure locale> heure de America/New_York
    Alors l'objectif "Déclarer les impôts" <résultat>
    Et l'objectif "Déclarer les impôts" existe avec le délai 2026-11-10

    Exemples:
      | heure locale | résultat            |
      | 17:59        | n'est pas en retard |
      | 18:00        | est en retard       |

  # ---------------------------------------------------------------- État calculé (CA-8)

  @US-001 @RG-025 @LOT-001
  Plan du scénario: S15 — L'état d'un objectif sans sous-objectif est calculé, jamais saisi
    Étant donné un objectif "Santé" sans délai
    Et l'objectif "Santé" a <a> tâche(s) à faire, <t> tâche(s) terminée(s) et <ab> tâche(s) abandonnée(s)
    Alors l'état de l'objectif "Santé" est "<état>"
    Et aucune action ne permet à l'utilisateur de saisir l'état de l'objectif "Santé"

    Exemples:
      | a | t | ab | état                 |
      | 0 | 0 | 0  | à décliner en tâches |
      | 0 | 0 | 2  | à décliner en tâches |
      | 1 | 1 | 0  | en cours             |
      | 0 | 2 | 1  | atteint              |

  # ---------------------------------------------------------------- Suppression (CA-9)

  @US-001 @RG-046 @LOT-001
  Scénario: S16 — Supprimer un objectif détache ses tâches et promeut ses sous-objectifs
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Écrire" sans délai
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et les tâches suivantes :
      | intitulé   | état    | délai      | estimation | objectifs                | tâche parente |
      | Plan       | à faire | 2026-11-10 | 1 h        | Publier le guide         |               |
      | Chapitre 1 | à faire | 2026-11-30 | 2 h        | Publier le guide, Écrire |               |
    Quand l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Alors l'objectif "Publier le guide" n'existe plus
    Et la tâche "Plan" existe sans objectif
    Et la tâche "Plan" figure parmi les tâches sans objectif
    Et la tâche "Chapitre 1" est rattachée au seul objectif "Écrire"
    Et "Version imprimable" est un objectif principal

  @US-001 @RG-046 @LOT-001
  Scénario: S17 — La confirmation de suppression annonce le nombre de tâches détachées et de sous-objectifs concernés
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et l'objectif "Publier le guide" a 2 tâche(s) à faire, 1 tâche(s) terminée(s) et 0 tâche(s) abandonnée(s)
    Quand l'utilisateur demande la suppression de l'objectif "Publier le guide"
    Alors une confirmation est demandée, qui annonce 3 tâches détachées et 1 sous-objectif devenu objectif principal

  @US-001 @RG-046 @LOT-001
  Scénario: S18 — Renoncer à la suppression d'un objectif ne change rien
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et l'objectif "Publier le guide" a 1 tâche(s) à faire, 0 tâche(s) terminée(s) et 0 tâche(s) abandonnée(s)
    Quand l'utilisateur supprime l'objectif "Publier le guide" et renonce
    Alors l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et l'objectif "Publier le guide" a toujours 1 tâche rattachée

  # ---------------------------------------------------------------- Suppression concurrente (CA-10, RG-047)

  @US-001 @RG-047 @RG-056 @LOT-001
  Scénario: S19 — La suppression d'un objectif l'emporte sur une modification plus récente faite sur l'autre appareil
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur modifie le délai de l'objectif "Publier le guide" en 2027-01-31
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'objectif "Publier le guide" n'existe plus
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément          | information | valeur non retenue | valeur conservée   |
      | Publier le guide | délai       | 2027-01-31         | objectif supprimé  |

  # DEC-030 (Q-US-001-1 a) : le rattachement de « Annexe » et le placement de « Version imprimable » sous l'objectif supprimé sont signalés.
  @US-001 @RG-047 @RG-046 @LOT-001
  Scénario: S20 — Ce qui a été rattaché ou créé entre-temps sous l'objectif supprimé subit les conséquences de la suppression
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | Annexe   | à faire | 2026-11-30 | 1 h        |           |               |
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Et sur le smartphone, l'utilisateur rattache la tâche "Annexe" à l'objectif "Publier le guide"
    Et sur le smartphone, l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'objectif "Publier le guide" n'existe plus
    Et sur les deux appareils, la tâche "Annexe" existe sans objectif
    Et sur les deux appareils, "Version imprimable" est un objectif principal
    Et sur chacun des deux appareils, la liste des modifications non retenues contient :
      | élément            | information | valeur non retenue    | valeur conservée  |
      | Annexe             | objectifs   | Publier le guide      | objectif supprimé |
      | Version imprimable | parent      | sous Publier le guide | objectif supprimé |

  # ---------------------------------------------------------------- Historique (CA-11, RG-050)

  @US-001 @RG-050 @LOT-001
  Scénario: S21 — La création, le changement de délai et la suppression d'un objectif sont conservés dans l'historique
    Quand l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et l'utilisateur modifie le délai de l'objectif "Publier le guide" en 2027-01-31
    Et que nous sommes le 2026-10-23 à 09:00 heure de Europe/Paris
    Et l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Alors l'historique contient, pour l'objectif "Publier le guide" :
      | événement           | journée    | avant      | après      |
      | création            | 2026-10-21 |            | délai 2026-12-15 |
      | modification délai  | 2026-10-22 | 2026-12-15 | 2027-01-31       |
      | suppression         | 2026-10-23 |            |                  |
    Et l'historique n'est affiché nulle part dans l'application

  @US-001 @RG-050 @RG-046 @LOT-001
  Scénario: S22 — Le détachement des tâches et la promotion des sous-objectifs, qui découlent de la suppression d'un objectif, n'ajoutent aucune entrée à l'historique
    # E8, Q-US-001-2 c : une conséquence qui se déduit d'un autre événement de l'historique (ici, la suppression de l'objectif) n'a pas d'entrée propre.
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai
    Et les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs        | tâche parente |
      | Plan     | à faire | 2026-11-10 | 1 h        | Publier le guide |               |
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Quand l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Alors la tâche "Plan" existe sans objectif
    Et "Version imprimable" est un objectif principal
    Et l'historique de l'objectif "Publier le guide" se termine par :
      | événement   | journée    | avant | après |
      | suppression | 2026-10-22 |       |       |
    Et l'historique ne contient aucune entrée "détachement" pour la tâche "Plan"
    Et l'historique ne contient aucune entrée "changement parent" pour l'objectif "Version imprimable"
