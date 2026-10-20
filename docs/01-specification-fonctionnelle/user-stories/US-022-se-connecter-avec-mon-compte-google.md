# US-022 — Se connecter avec mon compte Google
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** me connecter à l'application avec mon compte Google, **afin d'**accéder à mes données conservées dans mon propre espace de stockage, depuis chacun de mes appareils.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau.** La v0.1 ne prévoyait de connexion Google que pour les rappels (US-014). La réponse Q-DEM001-19.2 (« non » : application inutilisable sans compte Google) fait de la connexion un préalable à toute utilisation. Q-DEM001-3 b) y ajoute la conservation des données dans l'espace personnel de l'utilisateur.
- **Précisé en v0.4** par les réponses Q-DEM001-22 :
  - l'espace de stockage est le Google Drive du compte de connexion (22.1 a), dans un dossier visible (DEC-009) ;
  - en cas de perte d'accès, l'application fonctionne comme sans réseau (22.2 c) ;
  - **à la déconnexion, les données restent sur l'appareil (22.3 b, contraire à la recommandation)**. Cela crée une tension avec ENF-05 (appareil prêté, perdu, volé ou cédé ; changement de compte) : question Q-DEM001-42.
- **Modifié.** US-014 est recentrée sur l'autorisation d'accès à l'agenda, au lot « Rappels ». L'écran d'avertissement de Google (« application non validée »), accepté par le commanditaire (DEC-008), n'apparaîtra qu'à cette autorisation (ENF-08).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-018 : un seul utilisateur par compte, données non partagées.
- RG-019 : la connexion avec un compte Google est obligatoire.
- RG-020 : données conservées dans le Google Drive du compte de connexion, dans un dossier visible.
- RG-035 : accès retiré ou expiré → avertissement, proposition de reconnexion, fonctionnement comme sans réseau en attendant, aucune perte de donnée.
- RG-043 : à la déconnexion volontaire, les données restent sur l'appareil.
- ENF-05 (validée) : accès minimal au compte Google. ENF-06 (validée) : aucune perte de donnée. ENF-08 : consentement Google.

## Critères d'acceptation
1. **CA-1** — Sur un appareil où aucune session n'est ouverte, l'application n'affiche que l'invitation à se connecter avec un compte Google. Aucune autre fonction n'est accessible, et aucune donnée n'est affichée, même si des données sont restées sur l'appareil après une déconnexion (RG-019, RG-043).
2. **CA-2** — Après une connexion réussie, l'utilisateur accède à ses objectifs et à ses tâches, conservés dans le Google Drive du compte avec lequel il s'est connecté (RG-020). Lors de la toute première connexion, le Drive ne contient aucune donnée de l'application, et celle-ci affiche un état vide invitant à créer un premier objectif ou une première tâche **(P)**.
3. **CA-3** — Après la première connexion, un dossier de l'application est visible dans le Drive de l'utilisateur (RG-020, DEC-009). Son nom est fixé en E4.
4. **CA-4** — Si l'utilisateur annule la connexion ou refuse les autorisations demandées, il reste sur l'écran de connexion. Un message lui explique que la connexion à un compte Google est nécessaire pour utiliser l'application. Aucune donnée n'est créée.
5. **CA-5** — À la réouverture de l'application sur le même appareil, l'utilisateur n'a pas à se reconnecter tant que son accès est valide **(P)**.
6. **CA-6** — L'utilisateur peut se déconnecter à tout moment depuis l'application. Il revient alors à l'écran de connexion (RG-043) :
   - les données restent sur l'appareil, y compris les modifications pas encore enregistrées dans son Drive ;
   - elles ne sont plus affichées jusqu'à la reconnexion (CA-1) ;
   - à la reconnexion avec le même compte, il retrouve toutes ses données, et les modifications en attente sont enregistrées dans son Drive ;
   - avant la déconnexion, si des modifications ne sont pas encore enregistrées dans son Drive, l'application lui en indique le nombre et lui précise qu'elles le seront à sa prochaine connexion sur cet appareil **(P)**.
   - L'éventuelle action « Se déconnecter et effacer les données de cet appareil » dépend de Q-DEM001-42.1.
7. **CA-7** — Si l'accès au compte Google a été retiré ou a expiré, l'application l'indique à l'utilisateur dès sa prochaine utilisation et lui propose de se reconnecter. En attendant, il continue de consulter et de saisir ses données, comme sans réseau (RG-035, US-018). Après reconnexion, ses modifications faites entre-temps sont enregistrées dans son Drive ; aucune n'est perdue (ENF-06).
8. **CA-8** — Au lot 1, l'application ne demande que l'identification du compte et l'accès à ses propres fichiers dans le Drive. Elle ne demande pas l'accès à l'agenda (ENF-05). Aucun écran d'avertissement de Google du type « application non validée » ne s'affiche lors de la connexion (ENF-08).
9. **CA-9** — Connecté avec un compte Google B, l'utilisateur ne voit jamais les données d'un compte Google A utilisé auparavant sur le même appareil (RG-018). Le sort des données du compte A sur l'appareil dépend de Q-DEM001-42.2.

## Cas limites et cas d'erreur
- Première connexion sans réseau : l'application indique qu'une connexion réseau est nécessaire pour se connecter la première fois **(P)**.
- Réseau interrompu pendant la connexion : message d'erreur et possibilité de réessayer, sans donnée créée à moitié **(P)**.
- Drive indisponible ou désactivé pour ce compte (par exemple, un compte d'organisation sans accès au Drive) : message explicite, et pas d'accès aux fonctions (RG-019, RG-020).
- Accès retiré pendant que l'application est ouverte : traité comme CA-7 dès l'action suivante qui nécessite l'accès.
- Sur PC, session Google du navigateur expirée : l'application reste utilisable avec les données présentes sur le PC ; la mise à jour avec l'autre appareil reprend après un geste de reconnexion (US-017, CA-3).
- Déconnexion puis reconnexion avec le même compte, sans réseau : la reconnexion n'est pas possible sans réseau ; l'application l'indique **(P)**.
- Changement de compte : voir CA-9.

## Hors périmètre
- Autorisation d'accès à l'agenda Google, et écran d'avertissement de Google qui l'accompagne (US-014, ENF-08).
- Connexion par un autre moyen qu'un compte Google ; utilisation sans compte (exclue, RG-019).
- Plusieurs comptes connectés simultanément.
- Application pour iPhone (exclue en v1, DEC-001).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-022-se-connecter-avec-mon-compte-google.feature`.

## Questions ouvertes
- **Q-DEM001-42 (P1)** : action d'effacement des données de l'appareil, en plus de la déconnexion simple ; sort des données restées sur l'appareil quand un autre compte s'y connecte.

> **Note pour l'architecte (via Jarvis).** Le DAT (§4.1.4, §4.1.5, §7.1, DS-07) prévoit l'effacement des données locales à la déconnexion, sur la base de la recommandation Q-22.3 a). Le commanditaire a répondu b) : les données restent sur l'appareil (RG-043). Le DAT est à aligner.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir des réponses Q-DEM001-3 b), 19.2 et 19.3 et des compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-22 intégrées (CA-2, CA-3, CA-6, CA-7) ; décisions DEC-001 (Android), DEC-008 (avertissement Google, hors lot 1) et DEC-009 (dossier visible) ; nouvelle question Q-DEM001-42. |
