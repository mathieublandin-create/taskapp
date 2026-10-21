# language: fr
#
# Tests métiers — US-023 — Organiser un objectif en sous-objectifs
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.8, US-023
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# Vocabulaire des étapes : GLOSSAIRE-ETAPES.md (figé ; tags @ihm et @recette définis au §10).
# Règles et critères validés par le commanditaire le 2026-10-21 (DEC-018).

Fonctionnalité: Organiser un objectif en sous-objectifs
  En tant qu'utilisateur,
  je veux décomposer un objectif en sous-objectifs,
  afin de structurer les objectifs ambitieux.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris
    Et que l'utilisateur est connecté avec le compte "A" sur le smartphone

  # ---------------------------------------------------------------- Création et affichage (CA-1 à CA-3)

  @US-023 @RG-022 @LOT-001
  Scénario: S01 — Créer un sous-objectif depuis un objectif principal
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Quand l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", de délai 2026-12-01
    Alors l'objectif "Version imprimable" existe avec le délai 2026-12-01
    Et "Version imprimable" est un sous-objectif de l'objectif "Publier le guide"
    Et l'état de l'objectif "Version imprimable" est "à décliner en tâches"

  @US-023 @RG-022 @RG-045 @LOT-001
  Scénario: S02 — Le détail d'un objectif présente ses sous-objectifs avec leur délai, leur état et leur retard
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide", de délai 2026-10-20
    Et un sous-objectif "Version en ligne" de l'objectif "Publier le guide", sans délai
    Quand l'utilisateur consulte le détail de l'objectif "Publier le guide"
    Alors le détail présente les sous-objectifs :
      | intitulé           | délai      | état                 | en retard |
      | Version imprimable | 2026-10-20 | à décliner en tâches | oui       |
      | Version en ligne   | sans délai | à décliner en tâches | non       |

  @US-023 @RG-022 @LOT-001
  Scénario: S03 — La liste des objectifs distingue les objectifs principaux de leurs sous-objectifs
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Quand l'utilisateur consulte la liste des objectifs
    Alors la liste présente "Publier le guide" comme objectif principal
    Et la liste présente "Version imprimable" comme sous-objectif de "Publier le guide"

  @US-023 @RG-022 @LOT-001
  Scénario: S04 — Un sous-objectif ne peut pas avoir de sous-objectif
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Alors l'action "créer un sous-objectif" n'est pas proposée pour l'objectif "Version imprimable"

  # ---------------------------------------------------------------- Alerte de délai (CA-4)

  @US-023 @RG-022 @RG-024 @LOT-001
  Plan du scénario: S05 — Une alerte nomme le parent quand le délai d'un sous-objectif lui est postérieur
    Étant donné un objectif "Publier le guide" <délai du parent>
    Quand l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", <délai du sous-objectif>
    Alors l'objectif "Version imprimable" existe
    Et l'objectif "Version imprimable" <alerte>

    Exemples:
      | délai du parent     | délai du sous-objectif | alerte                                                          |
      | de délai 2026-12-15 | de délai 2027-01-15    | porte une alerte de délai qui nomme l'objectif "Publier le guide" |
      | de délai 2026-12-15 | de délai 2026-12-15    | ne porte aucune alerte de délai                                 |
      | de délai 2026-12-15 | de délai 2026-12-01    | ne porte aucune alerte de délai                                 |
      | de délai 2026-12-15 | sans délai             | ne porte aucune alerte de délai                                 |
      | sans délai          | de délai 2027-01-15    | ne porte aucune alerte de délai                                 |

  @US-023 @RG-022 @LOT-001
  Plan du scénario: S06 — L'alerte de délai d'un sous-objectif est recalculée quand l'un des deux délais change
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide", de délai 2026-12-01
    Quand l'utilisateur <modification>
    Alors l'objectif "Version imprimable" <alerte>

    Exemples:
      | modification                                                         | alerte                                                          |
      | modifie le délai de l'objectif "Publier le guide" en 2026-11-20      | porte une alerte de délai qui nomme l'objectif "Publier le guide" |
      | modifie le délai de l'objectif "Version imprimable" en 2027-01-10    | porte une alerte de délai qui nomme l'objectif "Publier le guide" |
      | retire le délai de l'objectif "Publier le guide"                     | ne porte aucune alerte de délai                                 |

  # ---------------------------------------------------------------- Déplacements (CA-5, CA-6)

  @US-023 @RG-022 @RG-025 @LOT-001
  Scénario: S07 — Déplacer un sous-objectif sous un autre objectif principal recalcule les états et l'alerte
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Développer mon activité" de délai 2026-11-01
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide", de délai 2026-12-01
    Et les tâches suivantes :
      | intitulé       | état    | délai      | estimation | objectifs          | tâche parente |
      | Mettre en page | à faire | 2026-12-01 | 2 h        | Version imprimable |               |
    Et l'état de l'objectif "Publier le guide" est "en cours"
    Quand l'utilisateur place l'objectif "Version imprimable" sous l'objectif "Développer mon activité"
    Alors "Version imprimable" est un sous-objectif de l'objectif "Développer mon activité"
    Et l'état de l'objectif "Publier le guide" est "à décliner en tâches"
    Et l'état de l'objectif "Développer mon activité" est "en cours"
    Et l'objectif "Version imprimable" porte une alerte de délai qui nomme l'objectif "Développer mon activité"

  @US-023 @RG-022 @RG-025 @LOT-001
  Scénario: S08 — Faire d'un sous-objectif un objectif principal
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide", de délai 2027-01-15
    Et l'objectif "Version imprimable" porte une alerte de délai qui nomme l'objectif "Publier le guide"
    Quand l'utilisateur fait de l'objectif "Version imprimable" un objectif principal
    Alors "Version imprimable" est un objectif principal
    Et l'objectif "Version imprimable" ne porte aucune alerte de délai
    Et l'état de l'objectif "Publier le guide" est "à décliner en tâches"

  @US-023 @RG-022 @LOT-001
  Scénario: S09 — Placer un objectif principal sans sous-objectif sous un autre objectif principal
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Version imprimable" sans délai
    Quand l'utilisateur place l'objectif "Version imprimable" sous l'objectif "Publier le guide"
    Alors "Version imprimable" est un sous-objectif de l'objectif "Publier le guide"

  @US-023 @RG-022 @LOT-001
  Scénario: S10 — Un objectif qui a des sous-objectifs ne peut pas être placé sous un autre objectif
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et un objectif "Développer mon activité" sans délai
    Quand l'utilisateur place l'objectif "Publier le guide" sous l'objectif "Développer mon activité"
    Alors l'action est refusée avec le motif "ERR-030 variante objectif-a-des-sous-objectifs"
    Et "Publier le guide" est un objectif principal

  @US-023 @RG-022 @LOT-001
  Plan du scénario: S11 — Un objectif ne peut jamais être placé sous lui-même ni sous un sous-objectif
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Apprendre l'italien" sans délai
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Quand l'utilisateur place l'objectif "<objectif déplacé>" sous l'objectif "<parent visé>"
    Alors l'action est refusée avec le motif "<motif>"

    Exemples:
      | objectif déplacé    | parent visé         | motif                                    |
      | Apprendre l'italien | Apprendre l'italien | ERR-031                                  |
      | Apprendre l'italien | Version imprimable  | ERR-030 variante cible-est-sous-objectif |

  @US-023 @RG-022 @LOT-001
  Scénario: S12 — Déplacer un sous-objectif sous son parent actuel est sans effet
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Quand l'utilisateur place l'objectif "Version imprimable" sous l'objectif "Publier le guide"
    Alors "Version imprimable" est un sous-objectif de l'objectif "Publier le guide"
    Et aucun changement de parent n'est enregistré pour l'objectif "Version imprimable"

  # ---------------------------------------------------------------- Atteinte (CA-7)

  @US-023 @RG-025 @LOT-001
  Plan du scénario: S13 — Un objectif est atteint quand ses tâches non abandonnées sont terminées et ses sous-objectifs atteints
    Étant donné un objectif "O" sans délai
    Et l'objectif "O" a <a> tâche(s) à faire, <t> tâche(s) terminée(s) et 0 tâche(s) abandonnée(s)
    Et un sous-objectif "S" de l'objectif "O"
    Et l'objectif "S" a <sa> tâche(s) à faire, <st> tâche(s) terminée(s) et 0 tâche(s) abandonnée(s)
    Alors l'état de l'objectif "S" est "<état de S>"
    Et l'état de l'objectif "O" est "<état de O>"

    Exemples:
      | a | t | sa | st | état de S            | état de O |
      | 0 | 2 | 1  | 0  | en cours             | en cours  |
      | 0 | 0 | 0  | 1  | atteint              | atteint   |
      | 0 | 1 | 0  | 0  | à décliner en tâches | en cours  |
      | 1 | 0 | 0  | 1  | atteint              | en cours  |

  @US-023 @RG-025 @LOT-001
  Scénario: S14 — L'objectif parent est mis à jour dès qu'un sous-objectif change d'état
    Étant donné un objectif "O" sans délai
    Et un sous-objectif "S" de l'objectif "O"
    Et les tâches suivantes :
      | intitulé | état    | délai      | estimation | objectifs | tâche parente |
      | T1       | à faire | 2026-11-30 | 1 h        | S         |               |
    Quand l'utilisateur termine la tâche "T1"
    Alors l'état de l'objectif "O" est "atteint"
    Quand l'utilisateur rouvre la tâche "T1"
    Alors l'état de l'objectif "O" est "en cours"

  # ---------------------------------------------------------------- Suppression (CA-8)

  @US-023 @RG-046 @LOT-001
  Scénario: S15 — Supprimer un objectif qui a des sous-objectifs les transforme en objectifs principaux
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un sous-objectif "Version imprimable" de l'objectif "Publier le guide"
    Et un sous-objectif "Version en ligne" de l'objectif "Publier le guide"
    Quand l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Alors l'objectif "Publier le guide" n'existe plus
    Et "Version imprimable" est un objectif principal
    Et "Version en ligne" est un objectif principal

  # ---------------------------------------------------------------- Deux appareils (CA-9 RG-048, CA-10 RG-047)

  @US-023 @RG-048 @RG-056 @LOT-001
  Scénario: S16 — Placements croisés sur les deux appareils : le placement le plus ancien est annulé et signalé
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Alpha" sans délai
    Et un objectif "Bêta" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "Alpha" sous l'objectif "Bêta"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Bêta" sous l'objectif "Alpha"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "Bêta" est un sous-objectif de l'objectif "Alpha"
    Et sur les deux appareils, "Alpha" est un objectif principal
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée     |
      | Alpha   | parent      | sous Bêta          | placement annulé     |

  @US-023 @RG-048 @RG-056 @LOT-001
  Scénario: S17 — Un placement qui créerait un deuxième niveau est annulé, la création concurrente est conservée
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "O" sans délai
    Et un objectif "P" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "O" sous l'objectif "P"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur crée un sous-objectif "S" de l'objectif "O", sans délai
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "O" est un objectif principal
    Et sur les deux appareils, "S" est un sous-objectif de l'objectif "O"
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | O       | parent      | sous P             | placement annulé |

  @US-023 @RG-048 @RG-056 @LOT-001
  Scénario: S18 — Deux placements concurrents qui produiraient un deuxième niveau : le plus ancien est annulé, la hiérarchie est identique sur les deux appareils
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Alpha" sans délai
    Et un objectif "Bêta" sans délai
    Et un objectif "Gamma" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "Alpha" sous l'objectif "Bêta"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Bêta" sous l'objectif "Gamma"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "Bêta" est un sous-objectif de l'objectif "Gamma"
    Et sur les deux appareils, "Alpha" est un objectif principal
    Et sur les deux appareils, aucun sous-objectif n'a de sous-objectif
    Et les deux appareils présentent la même hiérarchie d'objectifs
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | Alpha   | parent      | sous Bêta          | placement annulé |

  @US-023 @RG-048 @RG-056 @LOT-001
  Scénario: S18b — Trois placements concurrents dont deux se cumulent sur un objectif : seul le plus ancien est annulé, les deux autres sont conservés
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Alpha" sans délai
    Et un objectif "Bêta" sans délai
    Et un objectif "Gamma" sans délai
    Et un objectif "Delta" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "Alpha" sous l'objectif "Bêta"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Gamma" sous l'objectif "Alpha"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Delta" sous l'objectif "Alpha"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "Alpha" est un objectif principal
    Et sur les deux appareils, "Gamma" est un sous-objectif de l'objectif "Alpha"
    Et sur les deux appareils, "Delta" est un sous-objectif de l'objectif "Alpha"
    Et sur les deux appareils, aucun sous-objectif n'a de sous-objectif
    Et les deux appareils présentent la même hiérarchie d'objectifs
    Et sur chacun des deux appareils, la liste des modifications non retenues contient exactement 1 information
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | Alpha   | parent      | sous Bêta          | placement annulé |

  @US-023 @RG-048 @RG-056 @LOT-001
  Scénario: S18c — Chaîne de trois placements : les placements sont annulés un par un, du plus ancien au plus récent, jusqu'à obtenir une hiérarchie valide
    # Annuler le seul placement le plus ancien ne suffit pas (Alpha resterait au sommet de deux niveaux) : le suivant est annulé à son tour ;
    # le troisième, devenu valide, est conservé. Chaque annulation est signalée.
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Alpha" sans délai
    Et un objectif "Bêta" sans délai
    Et un objectif "Gamma" sans délai
    Et un objectif "Delta" sans délai
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur place l'objectif "Alpha" sous l'objectif "Bêta"
    Et 10 minutes plus tard, sur le smartphone, l'utilisateur place l'objectif "Gamma" sous l'objectif "Alpha"
    Et 10 minutes plus tard, sur le PC, l'utilisateur place l'objectif "Delta" sous l'objectif "Gamma"
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, "Alpha" est un objectif principal
    Et sur les deux appareils, "Gamma" est un objectif principal
    Et sur les deux appareils, "Delta" est un sous-objectif de l'objectif "Gamma"
    Et sur les deux appareils, aucun sous-objectif n'a de sous-objectif
    Et les deux appareils présentent la même hiérarchie d'objectifs
    Et sur chacun des deux appareils, la liste des modifications non retenues contient exactement 2 informations
    Et la liste des modifications non retenues contient :
      | élément | information | valeur non retenue | valeur conservée |
      | Alpha   | parent      | sous Bêta          | placement annulé |
      | Gamma   | parent      | sous Alpha         | placement annulé |

  @US-023 @RG-047 @LOT-001
  Scénario: S19 — Un sous-objectif créé sous un objectif supprimé sur l'autre appareil devient objectif principal
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que le smartphone est sans réseau
    Quand sur le PC, l'utilisateur supprime l'objectif "Publier le guide" et confirme
    Et sur le smartphone, l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai
    Et le réseau revient sur le smartphone
    Et les deux appareils échangent leurs modifications
    Alors sur les deux appareils, l'objectif "Publier le guide" n'existe plus
    Et sur les deux appareils, "Version imprimable" est un objectif principal

  # ---------------------------------------------------------------- Historique (CA-11, RG-050)

  @US-023 @RG-050 @LOT-001
  Scénario: S20 — La création d'un sous-objectif et ses changements de parent sont conservés dans l'historique
    Étant donné un objectif "Publier le guide" de délai 2026-12-15
    Et un objectif "Développer mon activité" sans délai
    Quand l'utilisateur crée un sous-objectif "Version imprimable" de l'objectif "Publier le guide", sans délai
    Et que nous sommes le 2026-10-22 à 09:00 heure de Europe/Paris
    Et l'utilisateur place l'objectif "Version imprimable" sous l'objectif "Développer mon activité"
    Et l'utilisateur fait de l'objectif "Version imprimable" un objectif principal
    Alors l'historique contient, pour l'objectif "Version imprimable" :
      | événement         | journée    | avant                   | après                   |
      | création          | 2026-10-21 |                         | parent Publier le guide |
      | changement parent | 2026-10-22 | Publier le guide        | Développer mon activité |
      | changement parent | 2026-10-22 | Développer mon activité | aucun (objectif principal) |
