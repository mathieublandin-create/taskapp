# language: fr
#
# Tests métiers — US-022 — Se connecter avec mon compte Google
# Lot : LOT-001 · Pepper, E5, 2026-10-21 · Référentiel : cahier des charges v0.6, US-022
#
# Conventions d'écriture : voir l'en-tête de US-001-creer-et-gerer-un-objectif.feature (communes au lot).
# @propose : le scénario repose sur une règle ou un critère encore proposé, à valider par le commanditaire en E6.
# « l'utilisateur se déconnecte » : déconnexion menée à son terme, y compris la confirmation si elle est demandée (CA-6, proposée).
# Nom de l'application : « Done Juan » (DEC-017). Le dossier du Drive garde provisoirement le nom « Objectifs et Tâches » (à revoir par Steeve en E7).

Fonctionnalité: Se connecter avec mon compte Google
  En tant qu'utilisateur,
  je veux me connecter à Done Juan avec mon compte Google,
  afin d'accéder à mes données conservées dans mon propre espace de stockage, depuis chacun de mes appareils.

  Contexte:
    Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris

  # ---------------------------------------------------------------- Accès réservé aux utilisateurs connectés (CA-1)

  @US-022 @RG-019 @LOT-001
  Scénario: S01 — Sans session ouverte, seule l'invitation à se connecter est proposée
    Étant donné que l'application n'a jamais été utilisée sur le smartphone
    Quand l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée
    Et sur le smartphone, aucune autre fonction n'est accessible

  @US-022 @RG-019 @RG-043 @LOT-001
  Scénario: S02 — Après une déconnexion, les données restées sur l'appareil ne sont pas affichées
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Quand sur le smartphone, l'utilisateur se déconnecte
    Alors sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée
    Et sur le smartphone, aucune donnée n'est affichée
    Et sur le smartphone, aucune autre fonction n'est accessible

  # ---------------------------------------------------------------- Connexion (CA-2 à CA-5)

  @US-022 @RG-019 @RG-020 @LOT-001
  Scénario: S03 — Après la connexion, l'utilisateur retrouve les données conservées dans le Drive de ce compte
    Étant donné que le Drive du compte "A" contient un objectif "Publier le guide" de délai 2026-12-15 enregistré par le PC
    Et que l'application n'a jamais été utilisée sur le smartphone
    Quand l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-022 @RG-020 @LOT-001 @propose
  Scénario: S04 — À la toute première connexion, le Drive ne contient rien et l'application présente un état vide qui invite à créer
    Étant donné que le Drive du compte "A" ne contient aucune donnée de l'application
    Et que l'application n'a jamais été utilisée sur le smartphone
    Quand l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, aucun objectif et aucune tâche n'existent
    Et sur le smartphone, l'application invite à créer un premier objectif ou une première tâche

  @US-022 @RG-020 @LOT-001
  Scénario: S05 — Après la première connexion, le dossier de l'application est visible dans le Drive
    # Nom du dossier fixé en E4 (Steeve) ; il reste « Objectifs et Tâches » malgré DEC-017, à revoir en E7.
    Étant donné que le Drive du compte "A" ne contient aucune donnée de l'application
    Quand l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors le Drive du compte "A" contient un dossier visible nommé "Objectifs et Tâches"

  @US-022 @RG-019 @LOT-001
  Plan du scénario: S06 — Connexion annulée ou autorisations refusées : l'utilisateur reste sur l'écran de connexion, sans donnée créée
    Étant donné que l'application n'a jamais été utilisée sur le smartphone
    Quand l'utilisateur tente de se connecter avec le compte "A" sur le smartphone et <refus>
    Alors sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée
    Et sur le smartphone, un message explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application
    Et aucune donnée n'est créée sur le smartphone
    Et aucune donnée n'est créée dans le Drive du compte "A"

    Exemples:
      | refus                                   |
      | annule la connexion                     |
      | refuse les autorisations demandées      |

  @US-022 @RG-019 @LOT-001 @propose
  Scénario: S07 — À la réouverture, l'utilisateur n'a pas à se reconnecter tant que son accès est valide
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Quand l'utilisateur ferme l'application sur le smartphone
    Et l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, aucune connexion n'est demandée
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  # ---------------------------------------------------------------- Se déconnecter (CA-6)

  @US-022 @RG-043 @LOT-001
  Scénario: S08 — Se déconnecter conserve les données sur l'appareil, y compris les modifications en attente, retrouvées à la reconnexion
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a créé un objectif "Courir un semi-marathon" sans délai
    Quand sur le smartphone, l'utilisateur se déconnecte
    Alors les données du compte "A" sont toujours présentes sur le smartphone, y compris 1 modification en attente
    Quand le réseau revient sur le smartphone
    Et l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et sur le smartphone, l'objectif "Courir un semi-marathon" existe sans délai
    Et le Drive du compte "A" contient l'objectif "Courir un semi-marathon"

  @US-022 @RG-043 @LOT-001 @propose
  Plan du scénario: S09 — Avant la déconnexion, l'application indique le nombre de modifications pas encore enregistrées dans le Drive
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et que le smartphone est sans réseau
    Et que sur le smartphone, <n> modifications ne sont pas encore enregistrées dans le Drive
    Quand sur le smartphone, l'utilisateur demande à se déconnecter
    Alors <résultat>

    Exemples:
      | n | résultat                                                                                                              |
      | 2 | une confirmation est demandée, qui annonce 2 modifications enregistrées dans le Drive à la prochaine connexion sur cet appareil |
      | 0 | sur le smartphone, l'utilisateur est déconnecté sans confirmation                                                     |

  @US-022 @RG-043 @RG-055 @LOT-001
  Scénario: S10 — La déconnexion n'efface jamais les données ; aucune action combinée « se déconnecter et effacer » n'existe
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Alors les actions de compte proposées sur le smartphone sont exactement "Se déconnecter" et "Supprimer les données de cet appareil"
    Quand sur le smartphone, l'utilisateur se déconnecte
    Alors les données du compte "A" sont toujours présentes sur le smartphone

  # ---------------------------------------------------------------- Accès retiré ou expiré (CA-7)

  @US-022 @RG-035 @LOT-001
  Plan du scénario: S11 — Accès Google retiré ou expiré : avertissement à la prochaine utilisation, travail possible, aucune perte
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que l'accès au compte Google "A" <cause> sur le smartphone
    Quand l'utilisateur ouvre l'application sur le smartphone
    Alors sur le smartphone, l'application indique que l'accès au compte Google doit être renouvelé et propose de se reconnecter
    Quand sur le smartphone, l'utilisateur modifie le délai de l'objectif "Publier le guide" en 2027-01-31
    Alors sur le smartphone, l'opération est acceptée
    Quand sur le smartphone, l'utilisateur se reconnecte avec le compte "A"
    Alors le Drive du compte "A" contient l'objectif "Publier le guide" avec le délai 2027-01-31

    Exemples:
      | cause        |
      | a été retiré |
      | a expiré     |

  @US-022 @RG-035 @LOT-001
  Scénario: S12 — Accès retiré pendant l'utilisation : signalé dès l'action suivante qui en a besoin, sans perte
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et que l'application est ouverte sur le smartphone
    Quand l'accès au compte Google "A" est retiré depuis le compte Google
    Et sur le smartphone, l'utilisateur crée un objectif "Courir un semi-marathon" sans délai
    Et le smartphone échange ses modifications avec le Drive
    Alors sur le smartphone, l'application propose de se reconnecter
    Et sur le smartphone, l'objectif "Courir un semi-marathon" est signalé comme non synchronisé

  # ---------------------------------------------------------------- Autorisations demandées (CA-8)

  @US-022 @RG-019 @RG-020 @LOT-001
  Scénario: S13 — Au lot 1, seuls l'identification du compte et l'accès aux fichiers de l'application dans le Drive sont demandés
    Étant donné que l'application n'a jamais été utilisée sur le smartphone
    Quand l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors les autorisations demandées au compte Google sont exactement : identification du compte, accès aux fichiers de l'application dans le Drive
    Et aucun accès à l'agenda n'est demandé
    Et aucun avertissement de Google du type « application non validée » n'est présenté

  # ---------------------------------------------------------------- Autre compte sur l'appareil (CA-9)

  @US-022 @RG-043 @RG-018 @LOT-001
  Scénario: S14 — Un autre compte qui se connecte sur l'appareil ne voit jamais les données du premier, qui les retrouve ensuite
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que le smartphone est sans réseau
    Et que sur le smartphone, l'utilisateur a créé un objectif "Courir un semi-marathon" sans délai
    Quand sur le smartphone, l'utilisateur se déconnecte
    Et le réseau revient sur le smartphone
    Et l'utilisateur se connecte avec le compte "B" sur le smartphone
    Alors sur le smartphone, aucun objectif n'existe
    Et sur le smartphone, aucune donnée du compte "A" n'est accessible
    Et le Drive du compte "B" ne contient aucune donnée du compte "A"
    Et les données du compte "A" sont toujours présentes sur le smartphone, y compris 1 modification en attente
    Quand sur le smartphone, l'utilisateur se déconnecte
    Et l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et sur le smartphone, l'objectif "Courir un semi-marathon" existe sans délai
    Et le Drive du compte "A" contient l'objectif "Courir un semi-marathon"

  # ---------------------------------------------------------------- Supprimer les données de cet appareil (CA-10, RG-055)

  @US-022 @RG-055 @LOT-001 @propose
  Scénario: S15 — Supprimer les données de cet appareil : confirmation, dépôt préalable, retour à la connexion, rien n'est supprimé dans le Drive
    Étant donné que l'utilisateur utilise le compte "A" sur le smartphone et sur le PC, tous deux à jour
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que sur le smartphone, l'utilisateur a créé un objectif "Courir un semi-marathon" sans délai, pas encore enregistré dans le Drive
    Quand sur le smartphone, l'utilisateur demande la suppression des données de cet appareil
    Alors une confirmation est demandée, qui précise que les données restent dans le Drive
    Quand l'utilisateur confirme
    Alors le Drive du compte "A" contient l'objectif "Courir un semi-marathon"
    Et les données du compte "A" ne sont plus présentes sur le smartphone
    Et sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée
    Et le Drive du compte "A" contient l'objectif "Publier le guide"
    Et sur le PC, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-022 @RG-055 @LOT-001 @propose
  Scénario: S16 — Renoncer à la suppression des données de l'appareil ne change rien
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Quand sur le smartphone, l'utilisateur demande la suppression des données de cet appareil
    Et l'utilisateur renonce
    Alors les données du compte "A" sont toujours présentes sur le smartphone
    Et sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-022 @RG-055 @LOT-001 @propose
  Plan du scénario: S17 — Sans réseau, la suppression annonce le nombre de modifications qui seraient perdues et demande une confirmation explicite
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et que le smartphone est sans réseau
    Et que sur le smartphone, 3 modifications ne sont pas encore enregistrées dans le Drive
    Quand sur le smartphone, l'utilisateur demande la suppression des données de cet appareil
    Et l'utilisateur confirme
    Alors une confirmation explicite est demandée, qui annonce que 3 modifications seraient perdues
    Quand l'utilisateur <choix>
    Alors <résultat>

    Exemples:
      | choix    | résultat                                                                                   |
      | confirme | les données du compte "A" ne sont plus présentes sur le smartphone                         |
      | renonce  | les données du compte "A" sont toujours présentes sur le smartphone, y compris 3 modifications en attente |

  @US-022 @RG-055 @LOT-001 @propose
  Scénario: S18 — Après la suppression des données de l'appareil, la connexion suivante recharge les données depuis le Drive, réseau nécessaire
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et le smartphone enregistre ses modifications dans le Drive
    Et que sur le smartphone, l'utilisateur a supprimé les données de cet appareil
    Et que le smartphone est sans réseau
    Quand l'utilisateur tente de se connecter avec le compte "A" sur le smartphone
    Alors la connexion échoue avec le motif "réseau nécessaire pour la première connexion"
    Quand le réseau revient sur le smartphone
    Et l'utilisateur se connecte avec le compte "A" sur le smartphone
    Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15

  @US-022 @RG-055 @RG-043 @LOT-001 @propose
  Scénario: S19 — Supprimer les données de cet appareil ne touche pas aux données d'un autre compte conservées sur l'appareil
    Étant donné que les données du compte "A" sont conservées sur le smartphone, avec 1 modification en attente
    Et que l'utilisateur est connecté avec le compte "B" sur le smartphone
    Quand sur le smartphone, l'utilisateur demande la suppression des données de cet appareil
    Et l'utilisateur confirme
    Alors les données du compte "B" ne sont plus présentes sur le smartphone
    Et les données du compte "A" sont toujours présentes sur le smartphone, y compris 1 modification en attente

  # ---------------------------------------------------------------- Cas limites et cas d'erreur

  @US-022 @RG-019 @LOT-001 @propose
  Plan du scénario: S20 — Connexion impossible sans réseau, ou interrompue : message, nouvel essai possible, rien de créé à moitié
    Étant donné que l'application n'a jamais été utilisée sur le smartphone
    Et que <situation réseau>
    Quand l'utilisateur tente de se connecter avec le compte "A" sur le smartphone
    Alors la connexion échoue avec le motif "<motif>"
    Et sur le smartphone, l'utilisateur peut réessayer
    Et aucune donnée n'est créée sur le smartphone
    Et aucune donnée n'est créée dans le Drive du compte "A"

    Exemples:
      | situation réseau                                        | motif                                       |
      | le smartphone est sans réseau                           | réseau nécessaire pour la première connexion |
      | le réseau du smartphone est coupé pendant la connexion  | connexion interrompue                       |

  @US-022 @RG-019 @RG-020 @LOT-001
  Scénario: S21 — Drive indisponible ou désactivé pour le compte : message explicite et aucun accès aux fonctions
    Étant donné que le Drive est désactivé pour le compte "C"
    Quand l'utilisateur tente de se connecter avec le compte "C" sur le smartphone
    Alors la connexion échoue avec le motif "Drive indisponible pour ce compte"
    Et sur le smartphone, aucune autre fonction n'est accessible

  @US-022 @RG-019 @RG-043 @LOT-001 @propose
  Scénario: S22 — Après une déconnexion, la reconnexion sans réseau n'est pas possible
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le smartphone
    Quand sur le smartphone, l'utilisateur se déconnecte
    Et que le smartphone est sans réseau
    Et l'utilisateur tente de se connecter avec le compte "A" sur le smartphone
    Alors la connexion échoue avec le motif "réseau nécessaire pour se connecter"
    Et les données du compte "A" sont toujours présentes sur le smartphone

  @US-022 @RG-017 @RG-035 @LOT-001
  Scénario: S23 — Sur le PC, session Google du navigateur expirée : l'application reste utilisable avec les données du PC
    Étant donné que l'utilisateur est connecté avec le compte "A" sur le PC
    Et un objectif "Publier le guide" de délai 2026-12-15
    Et que la session Google du navigateur du PC a expiré
    Quand l'utilisateur ouvre l'application sur le PC, connecté au réseau
    Alors sur le PC, aucune connexion n'est demandée avant d'afficher les données
    Et sur le PC, l'objectif "Publier le guide" existe avec le délai 2026-12-15
    Et sur le PC, l'application indique qu'une reconnexion est nécessaire pour la mise à jour avec l'autre appareil
