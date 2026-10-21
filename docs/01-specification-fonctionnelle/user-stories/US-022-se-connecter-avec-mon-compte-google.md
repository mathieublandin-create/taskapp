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
  - **à la déconnexion, les données restent sur l'appareil (22.3 b, contraire à la recommandation)**. La tension avec ENF-05 (appareil prêté, perdu, volé ou cédé ; changement de compte) a été levée par les réponses à Q-DEM001-42 : action distincte « Supprimer les données de cet appareil » (DEC-015, RG-055) ; données d'un compte conservées à part et invisibles pour un autre compte (DEC-016, RG-043).
- **Modifié.** US-014 est recentrée sur l'autorisation d'accès à l'agenda, au lot « Rappels ». L'écran d'avertissement de Google (« application non validée »), accepté par le commanditaire (DEC-008), n'apparaîtra qu'à cette autorisation (ENF-08).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-018 : un seul utilisateur par compte, données non partagées.
- RG-019 : la connexion avec un compte Google est obligatoire.
- RG-020 : données conservées dans le Google Drive du compte de connexion, dans un dossier visible.
- RG-035 : accès retiré ou expiré → avertissement, proposition de reconnexion, fonctionnement comme sans réseau en attendant, aucune perte de donnée.
- RG-043 : à la déconnexion volontaire, les données restent sur l'appareil ; elles restent aussi, à part, quand un autre compte se connecte.
- RG-055 : suppression des données de l'appareil, action distincte de la déconnexion (garde-fous proposés).
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
   - La déconnexion n'efface jamais les données de l'appareil ; il n'existe pas d'action combinée « se déconnecter et effacer » (DEC-015).
7. **CA-7** — Si l'accès au compte Google a été retiré ou a expiré, l'application l'indique à l'utilisateur dès sa prochaine utilisation et lui propose de se reconnecter. En attendant, il continue de consulter et de saisir ses données, comme sans réseau (RG-035, US-018). Après reconnexion, ses modifications faites entre-temps sont enregistrées dans son Drive ; aucune n'est perdue (ENF-06).
8. **CA-8** — Au lot 1, l'application ne demande que l'identification du compte et l'accès à ses propres fichiers dans le Drive. Elle ne demande pas l'accès à l'agenda (ENF-05). Aucun écran d'avertissement de Google du type « application non validée » ne s'affiche lors de la connexion (ENF-08).
9. **CA-9** — Quand un compte Google B se connecte sur un appareil où restent les données d'un compte A (RG-043, DEC-016) :
   - l'utilisateur connecté avec B ne voit jamais les données de A (RG-018) ;
   - les données de A restent sur l'appareil, conservées à part, y compris ses modifications pas encore enregistrées dans le Drive de A ;
   - quand A se reconnecte sur cet appareil, il retrouve toutes ses données, et ses modifications en attente sont enregistrées dans son Drive.
10. **CA-10** — L'utilisateur dispose, en plus de « Se déconnecter », d'une action distincte **« Supprimer les données de cet appareil »** (DEC-015, RG-055). Elle retire de l'appareil les données du compte connecté, sans rien supprimer dans son Drive ni sur son autre appareil. Déroulement **(P)** :
   - l'action est proposée quand l'utilisateur est connecté ;
   - elle demande toujours une confirmation, qui précise que les données restent dans le Drive ;
   - elle enregistre d'abord dans le Drive les modifications en attente ; si c'est impossible (par exemple sans réseau), elle indique le nombre de modifications qui seraient perdues et demande une confirmation explicite ; si l'utilisateur renonce, rien n'est supprimé ;
   - une fois les données supprimées, la session prend fin et l'application revient à l'écran de connexion ;
   - à la prochaine connexion avec ce compte sur cet appareil, les données sont de nouveau chargées depuis le Drive, comme sur un nouvel appareil (réseau nécessaire) ;
   - les données d'un autre compte conservées sur l'appareil (CA-9) ne sont pas touchées.

## Cas limites et cas d'erreur
- Première connexion sans réseau : l'application indique qu'une connexion réseau est nécessaire pour se connecter la première fois **(P)**.
- Réseau interrompu pendant la connexion : message d'erreur et possibilité de réessayer, sans donnée créée à moitié **(P)**.
- Drive indisponible ou désactivé pour ce compte (par exemple, un compte d'organisation sans accès au Drive) : message explicite, et pas d'accès aux fonctions (RG-019, RG-020).
- Accès retiré pendant que l'application est ouverte : traité comme CA-7 dès l'action suivante qui nécessite l'accès.
- Sur PC, session Google du navigateur expirée : l'application reste utilisable avec les données présentes sur le PC ; la mise à jour avec l'autre appareil reprend après un geste de reconnexion (US-017, CA-3).
- Déconnexion puis reconnexion avec le même compte, sans réseau : la reconnexion n'est pas possible sans réseau ; l'application l'indique **(P)**.
- Changement de compte : voir CA-9.
- Les données du compte A, restées sur l'appareil, ne peuvent être supprimées qu'en se connectant avec le compte A, puis en utilisant « Supprimer les données de cet appareil » (CA-10) **(P)**.
- « Supprimer les données de cet appareil » sur un appareil où les données ne sont pas encore toutes chargées depuis le Drive : sans perte, puisque seules les données de l'appareil sont retirées.
- À ne pas confondre avec le choix « repartir de zéro » de RG-044 (US-017, CA-9), qui efface les données sur les deux appareils.

## Hors périmètre
- Autorisation d'accès à l'agenda Google, et écran d'avertissement de Google qui l'accompagne (US-014, ENF-08).
- Connexion par un autre moyen qu'un compte Google ; utilisation sans compte (exclue, RG-019).
- Plusieurs comptes connectés simultanément.
- Application pour iPhone (exclue en v1, DEC-001).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-004, ADR-005, ADR-010, ADR-011.*

- **Composants touchés** :
  - contexte `compte` : cas d'usage `SeConnecter`, `SeDeconnecter` et `ReprendreSession` ; état de session ;
  - port `FournisseurAuth`, avec deux adaptateurs :
    - web : Google Identity Services, modèle « jeton », script chargé à la demande ;
    - Android : Credential Manager et AuthorizationClient ;
  - `CoffreJetons` : jeton d'accès conservé en mémoire seulement ;
  - adaptateur Drive dans `infrastructure-google` : création ou recherche du dossier de l'application et de `manifeste.json` ;
  - `composition/web.ts` et `composition/capacitor.ts`.
- **Données** :
  - **base locale cloisonnée par compte** : un espace de stockage par `sub` Google (base IndexedDB, ou fichier SQLite, nommé d'après une empreinte du `sub`). Ce cloisonnement satisfait CA-1 et CA-9 sans rien effacer (RG-043) ;
  - identité mise en cache localement (`sub`, adresse) : elle permet de rouvrir la session sans réseau (CA-5, US-018) ;
  - aucun jeton n'est persisté par notre code ;
  - **première connexion** : le dossier est recherché par `appProperties` avant d'être créé. Si deux dossiers sont créés en même temps sur les deux appareils, l'application conserve le plus ancien (`createdTime`) et y fusionne le contenu de l'autre (DAT §4.2).
- **Accès Google** :
  - scopes `openid`, `email` et `drive.file`, tous non sensibles. Aucun accès à l'agenda (CA-8, ENF-05) ;
  - projet OAuth publié en production, sans logo, pour qu'aucun écran d'avertissement ne s'affiche (ENF-08). À confirmer par le test technique R1/R2 (risque R11) ;
  - erreurs traduites : refus ou annulation, `PorteeInsuffisante`, `AccesGoogleRevoque` ; Drive désactivé ou indisponible : `403` puis message explicite.
- **Sécurité** :
  - clients OAuth publics, restreints au nom de paquet et à l'empreinte SHA-1 sur Android, et aux origines autorisées sur le web ;
  - aucun jeton dans les journaux ni dans le stockage persistant ;
  - **RG-043** : après une déconnexion, les données restent au repos sur l'appareil, non chiffrées. Elles sont protégées par le bac à sable Android sur le smartphone, et seulement par le profil du navigateur sur PC. Le commanditaire a traité cette tension avec ENF-05 par l'action distincte « Supprimer les données de cet appareil » (DEC-015) ;
  - **DEC-015** : cas d'usage `SupprimerDonneesAppareil`. Il tente un dépôt ; si c'est impossible, il demande une confirmation qui indique le nombre de modifications perdues (garde-fou à valider) ; puis il supprime l'espace de stockage du compte connecté et ferme la session.
  - la déconnexion efface la session et les jetons en mémoire. Sur Android, elle efface aussi l'état d'identification du Credential Manager. Ce n'est pas une révocation.
- **Exigences non fonctionnelles** :
  - réouverture d'une session existante sans aucun appel réseau bloquant (ENF-T-01) ;
  - première connexion jusqu'à l'état vide en moins de 10 s, sur un réseau 4G.
- **Risques** :
  - R2 : renouvellement silencieux du jeton sur Android ;
  - R3 et CA-5 sur PC : la session logique est conservée localement, mais le jeton d'accès doit être obtenu de nouveau. C'est silencieux si la session Google du navigateur est active, et demande un geste sinon (F14) ;
  - R11 : l'origine de la PWA, sans domaine propre (DEC-006), doit être acceptée par l'écran de consentement en production.
- **ADR applicables** : ADR-002, ADR-004, ADR-005, ADR-010.
- **Décisions prises en compte** : DEC-015 (deux actions distinctes) et DEC-016 (données du premier compte conservées à part, invisibles pour l'autre compte). Le cloisonnement par `sub` réalise DEC-016 sans traitement supplémentaire.

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-022-se-connecter-avec-mon-compte-google.feature`.

## Questions ouvertes
Aucune. Q-DEM001-42 a été répondue le 2026-10-21 (DEC-015, DEC-016). Le déroulement proposé de CA-10 et les autres critères (P) sont soumis à la validation du commanditaire en E6.

> **Note pour l'architecte (via Jarvis).** Le DAT (§4.1.4, §4.1.5, §7.1, DS-07) prévoit l'effacement des données locales à la déconnexion, sur la base de la recommandation Q-22.3 a). Le commanditaire a répondu b) : les données restent sur l'appareil (RG-043), y compris quand un autre compte se connecte (DEC-016), et une action distincte permet de les supprimer (RG-055). Le DAT est à aligner.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir des réponses Q-DEM001-3 b), 19.2 et 19.3 et des compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-22 intégrées (CA-2, CA-3, CA-6, CA-7) ; décisions DEC-001 (Android), DEC-008 (avertissement Google, hors lot 1) et DEC-009 (dossier visible) ; nouvelle question Q-DEM001-42. |
| 2026-10-21 | v0.5 (Pepper) : réponses Q-DEM001-42 intégrées (DEC-015, DEC-016) : CA-6 complété, CA-9 réécrit, nouveau CA-10 « Supprimer les données de cet appareil » (déroulement proposé). |
