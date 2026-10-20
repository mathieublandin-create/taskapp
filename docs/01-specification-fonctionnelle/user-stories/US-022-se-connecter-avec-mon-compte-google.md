# US-022 — Se connecter avec mon compte Google
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** me connecter à l'application avec mon compte Google, **afin d'**accéder à mes données conservées dans mon propre espace de stockage, depuis chacun de mes appareils.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau.** La v0.1 ne prévoyait de connexion Google que pour les rappels (US-014). La réponse Q-DEM001-19.2 (« non » : application inutilisable sans compte Google) fait de la connexion un préalable à toute utilisation. Q-DEM001-3 b) y ajoute la conservation des données dans l'espace personnel de l'utilisateur.
- **Modifié.** US-014 est recentrée sur l'autorisation d'accès à l'agenda, au lot « Rappels ».
- **Existant.** Aucune fonctionnalité livrée. Aucune contradiction.

## Règles de gestion applicables (RG-xxx)
- RG-018 : un seul utilisateur par compte, données non partagées.
- RG-019 : la connexion avec un compte Google est obligatoire.
- RG-020 : données conservées dans l'espace de stockage personnel de l'utilisateur.
- RG-035 : accès retiré ou expiré → avertissement, proposition de reconnexion, aucune perte de donnée.
- ENF-05 (proposée) : accès minimal au compte Google. ENF-06 (proposée) : aucune perte de donnée.

## Critères d'acceptation
1. **CA-1** — Sur un appareil où aucune session n'est ouverte, l'application n'affiche que l'invitation à se connecter avec un compte Google. Aucune autre fonction n'est accessible (RG-019).
2. **CA-2** — Après une connexion réussie, l'utilisateur accède à ses objectifs et à ses tâches, lus depuis son espace de stockage personnel (RG-020). Lors de la toute première connexion, l'espace ne contient aucune donnée de l'application, et celle-ci affiche un état vide invitant à créer un premier objectif ou une première tâche **(P)**.
3. **CA-3** — Si l'utilisateur annule la connexion ou refuse les autorisations demandées, il reste sur l'écran de connexion. Un message lui explique que la connexion à un compte Google est nécessaire pour utiliser l'application. Aucune donnée n'est créée.
4. **CA-4** — À la réouverture de l'application sur le même appareil, l'utilisateur n'a pas à se reconnecter tant que son accès est valide **(P)**.
5. **CA-5** — L'utilisateur peut se déconnecter à tout moment depuis l'application. Il revient alors à l'écran de connexion. Le sort des données présentes sur l'appareil dépend de Q-DEM001-22.3.
6. **CA-6** — Si l'accès au compte Google a été retiré ou a expiré, l'application l'indique à l'utilisateur dès sa prochaine utilisation et lui propose de se reconnecter. Après reconnexion, il retrouve toutes ses données, y compris les modifications faites avant la perte d'accès (RG-035, ENF-06). Ce que l'application permet en attendant la reconnexion dépend de Q-DEM001-22.2.
7. **CA-7** — Au lot 1, l'application ne demande que les autorisations nécessaires à la connexion et à l'espace de stockage. Elle ne demande pas l'accès à l'agenda (ENF-05, à valider).
8. **CA-8** — Connecté avec un compte Google A, l'utilisateur ne voit jamais les données d'un compte Google B utilisé auparavant sur le même appareil (RG-018).

## Cas limites et cas d'erreur
- Première connexion sans réseau : l'application indique qu'une connexion réseau est nécessaire pour se connecter la première fois **(P)**.
- Réseau interrompu pendant la connexion : message d'erreur et possibilité de réessayer, sans donnée créée à moitié **(P)**.
- Espace de stockage indisponible ou désactivé pour ce compte (par exemple, un compte d'organisation sans accès au stockage) : message explicite, et pas d'accès aux fonctions (RG-019, RG-020).
- Changement de compte sur un même appareil : voir CA-8.
- Accès retiré pendant que l'application est ouverte : traité comme CA-6 dès l'action suivante qui nécessite l'accès.

## Hors périmètre
- Autorisation d'accès à l'agenda Google (US-014).
- Connexion par un autre moyen qu'un compte Google ; utilisation sans compte (exclue, RG-019).
- Plusieurs comptes connectés simultanément.
- Utilisation sans réseau après la connexion (US-018).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-022-se-connecter-avec-mon-compte-google.feature`.

## Questions ouvertes
- **Q-DEM001-22 (P1)** : service de stockage (Drive du même compte ?), comportement en cas de perte d'accès, effacement des données de l'appareil à la déconnexion, données modifiées hors de l'application.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir des réponses Q-DEM001-3 b), 19.2 et 19.3 et des compléments du commanditaire. |
