# US-022 — Se connecter avec mon compte Google
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse — révision DEC-034 **proposée, à valider** (V-DEC034-1, 3, 5) ; version validée le 2026-10-21 (DEC-018) en vigueur jusque-là

**En tant qu'**utilisateur, **je veux** me connecter à l'application avec mon compte Google, **afin d'**accéder à mes données conservées dans mon propre espace de stockage, depuis chacun de mes appareils.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau.** La v0.1 ne prévoyait de connexion Google que pour les rappels (US-014). La réponse Q-DEM001-19.2 (« non » : application inutilisable sans compte Google) fait de la connexion un préalable à toute utilisation. Q-DEM001-3 b) y ajoute la conservation des données dans l'espace personnel de l'utilisateur.
- **Précisé en v0.4** par les réponses Q-DEM001-22 :
  - l'espace de stockage est le Google Drive du compte de connexion (22.1 a), dans un dossier visible (DEC-009) ;
  - en cas de perte d'accès, l'application fonctionne comme sans réseau (22.2 c) ;
  - **à la déconnexion, les données restent sur l'appareil (22.3 b, contraire à la recommandation)**. La tension avec ENF-05 (appareil prêté, perdu, volé ou cédé ; changement de compte) a été levée par les réponses à Q-DEM001-42 : action distincte « Supprimer les données de cet appareil » (DEC-015, RG-055) ; données d'un compte conservées à part et invisibles pour un autre compte (DEC-016, RG-043).
- **Modifié.** US-014 est recentrée sur l'autorisation d'accès à l'agenda, au lot « Rappels ». L'écran d'avertissement de Google (« application non validée »), accepté par le commanditaire (DEC-008), n'apparaîtra qu'à cette autorisation (ENF-08).
- **Modifié par DEC-034 (2026-10-22), proposé, à valider** : la connexion se fait sur le smartphone comme sur le PC, dans l'application web (plus d'application Android). L'accès accordé par Google dure une heure sur les deux appareils ; au-delà, il doit être renouvelé (bref passage par Google ou geste, RG-017 proposée, Q-PWA-2). Conséquences : CA-5 précisé (renouveler l'accès n'est pas se reconnecter) ; la précision E8 de CA-7 (accès expiré sans bandeau) s'étend au smartphone ; cas limite « session expirée » étendu au smartphone ; iPhone reformulé.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-018 : un seul utilisateur par compte, données non partagées.
- RG-019 : la connexion avec un compte Google est obligatoire.
- RG-020 : données conservées dans le Google Drive du compte de connexion, dans un dossier visible.
- RG-035 : accès retiré ou expiré → avertissement, proposition de reconnexion, fonctionnement comme sans réseau en attendant, aucune perte de donnée.
- RG-043 : à la déconnexion volontaire, les données restent sur l'appareil ; elles restent aussi, à part, quand un autre compte se connecte.
- RG-055 : suppression des données de l'appareil, action distincte de la déconnexion (garde-fous validés, DEC-018).
- ENF-05 (validée) : accès minimal au compte Google. ENF-06 (validée) : aucune perte de donnée. ENF-08 : consentement Google.
- RG-017 *(reformulation proposée, DEC-034)* : accès Google à renouveler, sur les deux appareils.

## Critères d'acceptation
1. **CA-1** — Sur un appareil où aucune session n'est ouverte, l'application n'affiche que l'invitation à se connecter avec un compte Google. Aucune autre fonction n'est accessible, et aucune donnée n'est affichée, même si des données sont restées sur l'appareil après une déconnexion (RG-019, RG-043).
2. **CA-2** — Après une connexion réussie, l'utilisateur accède à ses objectifs et à ses tâches, conservés dans le Google Drive du compte avec lequel il s'est connecté (RG-020). Lors de la toute première connexion, le Drive ne contient aucune donnée de l'application, et celle-ci affiche un état vide qui propose, au choix de l'utilisateur, de créer un premier objectif ou d'ajouter une première tâche (les deux actions sont proposées). *Précision de rédaction E7 (BEN-6) : le « ou » désigne le choix laissé à l'utilisateur, sans changement de sens.*
3. **CA-3** — Après la première connexion, un dossier de l'application est visible dans le Drive de l'utilisateur (RG-020, DEC-009). Ce dossier s'appelle **« Done Juan »**, comme l'application (V-13, DEC-017, DEC-018).
4. **CA-4** — Si l'utilisateur annule la connexion ou refuse les autorisations demandées, il reste sur l'écran de connexion. Un message lui explique que la connexion à un compte Google est nécessaire pour utiliser l'application. Aucune donnée n'est créée.
5. **CA-5** — À la réouverture de l'application sur le même appareil, l'utilisateur n'a pas à se reconnecter tant que son accès est valide.
   - *Précision proposée (DEC-034), à valider : V-DEC034-5* : « se reconnecter » s'entend comme repasser par l'écran de connexion (CA-1). Renouveler l'accès Google après une heure (bref passage par Google à l'ouverture, ou geste « Reprendre la synchronisation ») n'est pas une reconnexion : les données de l'appareil s'affichent aussitôt, sans écran de connexion, et aucune saisie n'est demandée tant que l'utilisateur reste identifié auprès de Google sur l'appareil (S23, S23b).
6. **CA-6** — L'utilisateur peut se déconnecter à tout moment depuis l'application. Il revient alors à l'écran de connexion (RG-043) :
   - les données restent sur l'appareil, y compris les modifications pas encore enregistrées dans son Drive ;
   - elles ne sont plus affichées jusqu'à la reconnexion (CA-1) ;
   - à la reconnexion avec le même compte, il retrouve toutes ses données, et les modifications en attente sont enregistrées dans son Drive ;
   - avant la déconnexion, si des modifications ne sont pas encore enregistrées dans son Drive, l'application lui en indique le nombre et lui précise qu'elles le seront à sa prochaine connexion sur cet appareil.
   - La déconnexion n'efface jamais les données de l'appareil ; il n'existe pas d'action combinée « se déconnecter et effacer » (DEC-015).
   - *Précision E8 (Q-US-022-4, sans changement de règle)* : avec le réseau, l'application tente d'abord d'enregistrer les modifications en attente dans le Drive ; elle n'indique leur nombre (et ne demande confirmation) que s'il en reste après cette tentative (S09c, S09d). En consultation seule (RG-058), elle ne tente aucun enregistrement (Q-US-022-3 ; S25).
7. **CA-7** — Si l'accès au compte Google a été retiré ou a expiré, l'application l'indique à l'utilisateur dès sa prochaine utilisation et lui propose de se reconnecter. En attendant, il continue de consulter et de saisir ses données, comme sans réseau (RG-035, US-018). Après reconnexion, ses modifications faites entre-temps sont enregistrées dans son Drive ; aucune n'est perdue (ENF-06).
   - *Précision E8 (Q-US-031-1, sans changement de règle)* : sur le PC, l'accès expiré est la session Google du navigateur expirée, signalée sans bandeau, avec l'action « Reprendre la synchronisation » (US-031 CA-5 et CA-9) ; l'accès retiré est signalé par le bandeau « Se reconnecter » dès que l'application en a la preuve.
   - *Extension proposée (DEC-034), à valider : V-DEC034-5* : il en va de même **sur le smartphone** (US-018 CA-8) : l'accès expiré y est un accès à renouveler, sans bandeau ; seul l'accès retiré affiche « Se reconnecter » (S11).
8. **CA-8** — Au lot 1, l'application ne demande que l'identification du compte et l'accès à ses propres fichiers dans le Drive. Elle ne demande pas l'accès à l'agenda (ENF-05). Aucun écran d'avertissement de Google du type « application non validée » ne s'affiche lors de la connexion (ENF-08). *Cette dernière vérification se fait à la main en recette métier (scénario S13b, tag `@recette`) : le banc ne peut pas simuler l'écran de Google.*
9. **CA-9** — Quand un compte Google B se connecte sur un appareil où restent les données d'un compte A (RG-043, DEC-016) :
   - l'utilisateur connecté avec B ne voit jamais les données de A (RG-018) ;
   - les données de A restent sur l'appareil, conservées à part, y compris ses modifications pas encore enregistrées dans le Drive de A ;
   - quand A se reconnecte sur cet appareil, il retrouve toutes ses données, et ses modifications en attente sont enregistrées dans son Drive.
10. **CA-10** — L'utilisateur dispose, en plus de « Se déconnecter », d'une action distincte **« Supprimer les données de cet appareil »** (DEC-015, RG-055). Elle retire de l'appareil les données du compte connecté, sans rien supprimer dans son Drive ni sur son autre appareil. Déroulement :
   - l'action est proposée quand l'utilisateur est connecté ;
   - elle demande toujours une confirmation, qui précise que les données restent dans le Drive ;
   - elle enregistre d'abord dans le Drive les modifications en attente ; si c'est impossible (par exemple sans réseau), elle indique le nombre de modifications qui seraient perdues et demande une confirmation explicite ; si l'utilisateur renonce, rien n'est supprimé ;
   - une fois les données supprimées, la session prend fin et l'application revient à l'écran de connexion ;
   - à la prochaine connexion avec ce compte sur cet appareil, les données sont de nouveau chargées depuis le Drive, comme sur un nouvel appareil (réseau nécessaire) ;
   - les données d'un autre compte conservées sur l'appareil (CA-9) ne sont pas touchées.
   - *Précision E8 (Q-US-022-3, réponse de Starck, DAT §4.2)* : en consultation seule (RG-058), l'enregistrement préalable est considéré comme impossible : l'application annonce directement le nombre de modifications qui seraient perdues et n'écrit rien dans le Drive (S24).

## Cas limites et cas d'erreur
- Première connexion sans réseau : l'application indique qu'une connexion réseau est nécessaire pour se connecter la première fois (motif `ERR-003`).
- Réseau interrompu pendant la connexion : message d'erreur et possibilité de réessayer, sans donnée créée à moitié (motif `ERR-005`).
- Drive **momentanément** indisponible à la connexion (erreurs passagères qui persistent après les nouvelles tentatives) : traité comme une connexion interrompue, motif `ERR-005` (précision E8, Q-US-022-2 a ; S20c). `ERR-006` reste réservé au Drive désactivé ou refusé pour le compte.
- Drive indisponible ou désactivé pour ce compte (par exemple, un compte d'organisation sans accès au Drive) : message explicite, et pas d'accès aux fonctions (RG-019, RG-020 ; motif `ERR-006`).
- Accès retiré pendant que l'application est ouverte : traité comme CA-7 dès l'action suivante qui nécessite l'accès.
- Sur PC, session Google du navigateur expirée : l'application reste utilisable avec les données présentes sur le PC ; la mise à jour avec l'autre appareil reprend après un geste de reconnexion (US-017, CA-3).
- *Proposé (DEC-034), à valider : V-DEC034-3* : sur le smartphone, accès Google à renouveler à l'ouverture : les données du smartphone s'affichent aussitôt, sans écran de connexion ; l'accès est renouvelé sans saisie, après au plus un geste (US-017 CA-3 ; S23b).
- Déconnexion puis reconnexion avec le même compte, sans réseau : la reconnexion n'est pas possible sans réseau ; l'application l'indique (motif `ERR-004`).
- Changement de compte : voir CA-9.
- Les données du compte A, restées sur l'appareil, ne peuvent être supprimées qu'en se connectant avec le compte A, puis en utilisant « Supprimer les données de cet appareil » (CA-10).
- « Supprimer les données de cet appareil » sur un appareil où les données ne sont pas encore toutes chargées depuis le Drive : sans perte, puisque seules les données de l'appareil sont retirées.
- À ne pas confondre avec le choix « repartir de zéro » de RG-044 (US-017, CA-9), qui efface les données sur les deux appareils.

### Motifs de connexion (codes du catalogue)
Chaque échec ou refus de connexion porte un code, que les tests vérifient. **Le catalogue des messages de Steeve (guide d'ergonomie §6.6.8) fait foi** pour les codes et les libellés ; le libellé peut évoluer sans changer le code (ANT-2, ANT-15).

| Code | Situation | Scénarios |
|---|---|---|
| `ERR-001` | Connexion annulée (CA-4) | S06 |
| `ERR-002` | Autorisations refusées (CA-4) ; même texte que `ERR-001`, seul le code diffère | S06 |
| `ERR-003` | Première connexion sur l'appareil, ou connexion après suppression des données de l'appareil, sans réseau | S18, S20a ; US-018 S12 |
| `ERR-004` | Reconnexion après une déconnexion, sans réseau | S22 |
| `ERR-005` | Réseau coupé pendant la connexion | S20b |
| `ERR-006` | Drive désactivé ou indisponible pour le compte | S21 |

## Hors périmètre
- Autorisation d'accès à l'agenda Google, et écran d'avertissement de Google qui l'accompagne (US-014, ENF-08).
- Connexion par un autre moyen qu'un compte Google ; utilisation sans compte (exclue, RG-019).
- Plusieurs comptes connectés simultanément.
- Usage sur iPhone : hors périmètre de la v1 (DEC-001) ; techniquement possible depuis DEC-034, mais ni testé ni garanti (formulation proposée, V-DEC034-1).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-004, ADR-005, ADR-010, ADR-011.*

> **À réviser par Starck (DEC-034).** Cette section décrit encore l'authentification native Android (Credential Manager, AuthorizationClient, composition `capacitor.ts`, client OAuth Android, risque R2). Si DEC-034 est confirmée, elle sera alignée sur ETU-002 §3 et §7.1 et sur le nouvel ADR. Pepper ne la modifie pas.

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
  - **DEC-015** : cas d'usage `SupprimerDonneesAppareil`. Il tente un dépôt ; si c'est impossible, il demande une confirmation qui indique le nombre de modifications perdues (garde-fou établi : V-09, RG-055) ; puis il supprime l'espace de stockage du compte connecté et ferme la session.
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

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés** :
  - [ECR-010](../../02-ux/maquettes/ECR-010-connexion.html), connexion Google et premier lancement : invitation unique (CA-1), préparation en étapes, état vide du premier compte (CA-2), connexion annulée ou refusée (CA-4), sans réseau, Drive indisponible, retour après « Se déconnecter » (smartphone, mode sombre, PC) ;
  - [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html), section « Compte » : adresse, dossier du Drive, « Se déconnecter » (CA-6) et « Supprimer les données de cet appareil » (CA-10), avec leurs confirmations.
- **Écrans modifiés** : tous les écrans, par l'avatar de l'en-tête (smartphone) et de la barre latérale (PC), qui ouvre la feuille de compte.
- **Parcours impactés** : P-07 (première connexion), P-08 (se déconnecter, se reconnecter, changer de compte), P-12 (supprimer les données de cet appareil).
- **Nouveaux composants** : `SignInPanel` (bouton Google et liste de ce qui est demandé), `StepProgress`, `SyncSheet` section Compte, `DangerLink`, variantes de `ConfirmDialog` (guide §4.12, §4.25 à §4.27).
- **Décisions d'ergonomie** :
  - **nom du dossier du Drive : « Done Juan »** (CA-3, V-13), identique au nom de l'application (DEC-017) ;
  - un seul bouton « Continuer avec Google » ; la liste de ce qui est demandé (identité, dossier, pas d'agenda) prépare à l'écran de consentement de Google, qui n'affiche aucun avertissement « application non validée » au lot 1 (CA-8, ENF-08) ;
  - « Se déconnecter » (secondaire) et « Supprimer les données de cet appareil » (texte rouge isolé) sont deux actions séparées dans la feuille (DEC-015) ; la déconnexion n'est confirmée que s'il y a des modifications en attente, avec leur nombre (CA-6) ;
  - la suppression suit le déroulement de CA-10 : confirmation toujours, dépôt d'abord, nombre de modifications perdues si le dépôt est impossible, retour à la connexion ;
  - un autre compte sur l'appareil n'a **aucun indice** des données du premier (CA-9, DEC-016, RG-018).
- **États** :
  - *vide* : premier lancement, compte neuf (`EVD-BIENVENUE`, CA-2) : affiché tant qu'il n'existe ni objectif ni tâche. **Atterrissage (BEN-6)** : l'utilisateur arrive sur Tâches ; « Créer mon premier objectif » mène à la création (ECR-008 B) puis au détail de l'objectif vide (`EVD-OBJECTIF-SANS-TACHE`, ECR-003 B) ; « Ajouter une tâche sans objectif » mène à la saisie rapide (ECR-006) puis à la liste Tâches (ECR-002 L1) ;
  - *chargement* : étapes « Compte identifié », « Dossier trouvé ou créé », « Récupération de vos données » ; au-delà de 10 s, message de patience ;
  - *erreur* : connexion annulée ou refusée, interrompue, Drive indisponible ; chacune dit ce qui s'est passé, ce qui est préservé et quoi faire ;
  - *hors ligne* : première connexion ou reconnexion impossible, message et « Réessayer » ; réouverture d'une session existante sans réseau : aucun écran dédié (CA-5) ;
  - *synchronisation* : accès Google perdu → bandeau non fermable « Se reconnecter », travail possible comme hors ligne (CA-7, voir US-017) ;
  - *conflit* : sans objet.
- **Accessibilité et responsive** : aucun test cognitif (WCAG 3.3.8) ; erreurs annoncées `role="alert"` ; dialogues `alertdialog` avec « Annuler » focalisé ; cible 48 px ; connexion en une colonne sur smartphone, bloc centré de 460 px sur PC.
- **Libellés et codes (ANT-7, ANT-2, ANT-15)** : les six motifs d'échec de connexion ont des codes stables `ERR-001` à `ERR-006` (annulation, autorisations refusées, réseau absent à la première connexion, réseau absent à la reconnexion, connexion interrompue, Drive indisponible), avec titre et texte exacts, au guide §6.6.8. `ERR-001` et `ERR-002` partagent le même texte (CA-4) ; `ERR-003` et `ERR-004` ont deux textes distincts. Le catalogue complet (indicateur, bandeaux, mentions, confirmations) est au guide §6.6.
- **Questions et réserves** : Q-ERG-15 (nom de l'application) tranchée : « Done Juan » (DEC-017), dossier du Drive identique (V-13) ; guide et maquettes alignés. Le bouton officiel de Google doit respecter ses consignes de marque (à voir avec Anthony en E9).

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-022-se-connecter-avec-mon-compte-google.feature`](../../../tests/features/US-022-se-connecter-avec-mon-compte-google.feature) — **33 scénarios** dont 1 en recette manuelle (`@recette`). *DEC-034 : S11 (accès retiré seulement) et S23b (nouveau) portent le tag `@DEC-034` ; ils sont à valider avec V-DEC034.* Chaque scénario porte les tags `@US-022`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02 |
| CA-2 | S03, S04 |
| CA-3 | S05 |
| CA-4 | S06 |
| CA-5 | S07 ; précision proposée (DEC-034) : S23, S23b |
| CA-6 | S08, S09a, S09b, S09c (avec réseau : enregistrement d'abord), S09d (avec réseau, Drive momentanément indisponible), S10, S25 (consultation seule) |
| CA-7 | S11 (accès retiré ; `@DEC-034` : l'exemple « a expiré » est retiré, l'accès expiré relève de S23 et S23b) |
| CA-8 | S13a ; S13b (recette manuelle, `@recette`) |
| CA-9 | S14 |
| CA-10 (RG-055) | S10, S15, S16, S17a, S17b, S18, S19, S24 (consultation seule) |
| Cas limite : première connexion sans réseau ; réseau interrompu | S20a, S20b |
| Cas limite : Drive indisponible ou désactivé | S21 (désactivé, `ERR-006`), S20c (momentanément indisponible, `ERR-005`) |
| Cas limite : accès retiré pendant l'utilisation | S12 |
| Cas limite : session Google expirée sur PC | S23 |
| Cas limite (proposé, DEC-034) : accès Google à renouveler à l'ouverture sur le smartphone | S23b |
| Cas limite : reconnexion sans réseau | S22 |
| Cas limite : données du compte A supprimables seulement par A | S19 |
| Cas limite : suppression sur un appareil pas encore entièrement chargé | S15 (le Drive n'est jamais touché) |
| Cas limite : distinction avec « repartir de zéro » | S15 ; US-017 S21 |

Nom de l'application : « Done Juan » (DEC-017), utilisé dans les scénarios. Le dossier du Drive s'appelle « Done Juan » (V-13, DEC-018), comme l'application (S05).

## Questions ouvertes
- **V-DEC034-1, 3, 5** (commanditaire, via Jarvis) : validation des reformulations proposées à la suite de DEC-034 (`docs/ceremonies/validation-DEC-034.md`).
- **Q-DEC034-1** (Starck, bloquante pour E9) : renouvellement à l'ouverture sur le smartphone, avec ou sans geste ; voir US-018, « Questions ouvertes ». Fixe le résultat observable de S23b.

*Avant DEC-034* : aucune. Q-DEM001-42 a été répondue le 2026-10-21 (DEC-015, DEC-016). Le déroulement de CA-10 et les autres critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir des réponses Q-DEM001-3 b), 19.2 et 19.3 et des compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-22 intégrées (CA-2, CA-3, CA-6, CA-7) ; décisions DEC-001 (Android), DEC-008 (avertissement Google, hors lot 1) et DEC-009 (dossier visible) ; nouvelle question Q-DEM001-42. |
| 2026-10-21 | v0.5 (Pepper) : réponses Q-DEM001-42 intégrées (DEC-015, DEC-016) : CA-6 complété, CA-9 réécrit, nouveau CA-10 « Supprimer les données de cet appareil » (déroulement proposé). |
| 2026-10-21 | Nom du dossier du Drive : « Done Juan » (V-13, DEC-018), CA-3 précisé. |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : ANT-1 (S13 scindé, avertissement Google en recette manuelle, tag `@recette`), BEN-6 (CA-2 précisé : les deux actions sont proposées), ANT-2 et ANT-15 (motifs de connexion identifiés par les codes `ERR-001` à `ERR-006` du catalogue de Steeve), PEP-7 et ANT-9 (S09, S17 et S20 scindés pour supprimer les colonnes de texte libre), PEP-8 (mentions caduques retirées). Aucune règle ni aucun critère validé n'est modifié dans son sens. |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-022-1 (formes au glossaire v1.2 ; « l'accès a été retiré » = perte déjà constatée ; forme unique « est affiché, avec l'action »), Q-US-022-2 (Drive momentanément indisponible : `ERR-005` ; S20c), Q-US-022-3 (consultation seule : aucune écriture pour la suppression des données ni pour la déconnexion ; S24, S25), Q-US-022-4 (déconnexion avec réseau : enregistrement d'abord ; S09c, S09d), Q-US-031-1 (accès expiré sur le PC, CA-7). Précisions sans changement de règle. |
| 2026-10-22 | Révision DEC-034 (Pepper), **proposée, à valider** (V-DEC034) : CA-5 précisé (renouveler l'accès n'est pas se reconnecter) ; précision E8 de CA-7 étendue au smartphone (accès expiré sans bandeau) ; cas limite de l'accès à renouveler sur le smartphone ; iPhone reformulé. Scénarios : S11 limité à l'accès retiré ; nouveau S23b (33 scénarios). Note à Starck sur la section « Impacts architecture ». Statut : En analyse. |
