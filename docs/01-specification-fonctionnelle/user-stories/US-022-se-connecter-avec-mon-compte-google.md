# US-022 — Se connecter avec mon compte Google
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Prête — révision DEC-034 validée le 2026-10-22 (DEC-036, V-DEC034-1, 3, 5) ; textes DEC-034 retirés si la condition de DEC-034 échoue (M-RED, M-PERSIST)

**En tant qu'**utilisateur, **je veux** me connecter à l'application avec mon compte Google, **afin d'**accéder à mes données conservées dans mon propre espace de stockage, depuis chacun de mes appareils.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau.** La v0.1 ne prévoyait de connexion Google que pour les rappels (US-014). La réponse Q-DEM001-19.2 (« non » : application inutilisable sans compte Google) fait de la connexion un préalable à toute utilisation. Q-DEM001-3 b) y ajoute la conservation des données dans l'espace personnel de l'utilisateur.
- **Précisé en v0.4** par les réponses Q-DEM001-22 :
  - l'espace de stockage est le Google Drive du compte de connexion (22.1 a), dans un dossier visible (DEC-009) ;
  - en cas de perte d'accès, l'application fonctionne comme sans réseau (22.2 c) ;
  - **à la déconnexion, les données restent sur l'appareil (22.3 b, contraire à la recommandation)**. La tension avec ENF-05 (appareil prêté, perdu, volé ou cédé ; changement de compte) a été levée par les réponses à Q-DEM001-42 : action distincte « Supprimer les données de cet appareil » (DEC-015, RG-055) ; données d'un compte conservées à part et invisibles pour un autre compte (DEC-016, RG-043).
- **Modifié.** US-014 est recentrée sur l'autorisation d'accès à l'agenda, au lot « Rappels ». L'écran d'avertissement de Google (« application non validée »), accepté par le commanditaire (DEC-008), n'apparaîtra qu'à cette autorisation (ENF-08).
- **Modifié par DEC-034 (2026-10-22), validé par DEC-036** : la connexion se fait sur le smartphone comme sur le PC, dans l'application web (plus d'application Android). L'accès accordé par Google dure une heure sur les deux appareils ; au-delà, il doit être renouvelé (bref passage par Google ou geste, RG-017 proposée, Q-PWA-2). Conséquences : CA-5 précisé (renouveler l'accès n'est pas se reconnecter) ; la précision E8 de CA-7 (accès expiré sans bandeau) s'étend au smartphone ; cas limite « session expirée » étendu au smartphone ; iPhone reformulé.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-018 : un seul utilisateur par compte, données non partagées.
- RG-019 : la connexion avec un compte Google est obligatoire.
- RG-020 : données conservées dans le Google Drive du compte de connexion, dans un dossier visible.
- RG-035 : accès retiré ou expiré → avertissement, proposition de reconnexion, fonctionnement comme sans réseau en attendant, aucune perte de donnée.
- RG-043 : à la déconnexion volontaire, les données restent sur l'appareil ; elles restent aussi, à part, quand un autre compte se connecte.
- RG-055 : suppression des données de l'appareil, action distincte de la déconnexion (garde-fous validés, DEC-018).
- ENF-05 (validée) : accès minimal au compte Google. ENF-06 (validée) : aucune perte de donnée. ENF-08 : consentement Google.
- RG-017 *(reformulée, DEC-034, validée DEC-036)* : accès Google à renouveler, sur les deux appareils.

## Critères d'acceptation
1. **CA-1** — Sur un appareil où aucune session n'est ouverte, l'application n'affiche que l'invitation à se connecter avec un compte Google. Aucune autre fonction n'est accessible, et aucune donnée n'est affichée, même si des données sont restées sur l'appareil après une déconnexion (RG-019, RG-043).
2. **CA-2** — Après une connexion réussie, l'utilisateur accède à ses objectifs et à ses tâches, conservés dans le Google Drive du compte avec lequel il s'est connecté (RG-020). Lors de la toute première connexion, le Drive ne contient aucune donnée de l'application, et celle-ci affiche un état vide qui propose, au choix de l'utilisateur, de créer un premier objectif ou d'ajouter une première tâche (les deux actions sont proposées). *Précision de rédaction E7 (BEN-6) : le « ou » désigne le choix laissé à l'utilisateur, sans changement de sens.*
3. **CA-3** — Après la première connexion, un dossier de l'application est visible dans le Drive de l'utilisateur (RG-020, DEC-009). Ce dossier s'appelle **« Done Juan »**, comme l'application (V-13, DEC-017, DEC-018).
4. **CA-4** — Si l'utilisateur annule la connexion ou refuse les autorisations demandées, il reste sur l'écran de connexion. Un message lui explique que la connexion à un compte Google est nécessaire pour utiliser l'application. Aucune donnée n'est créée.
5. **CA-5** — À la réouverture de l'application sur le même appareil, l'utilisateur n'a pas à se reconnecter tant que son accès est valide.
   - *Précision DEC-034 (validée le 2026-10-22, V-DEC034-5, DEC-036 ; retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST))* : « se reconnecter » s'entend comme repasser par l'écran de connexion (CA-1). Renouveler l'accès Google après une heure (bref passage par Google à l'ouverture, ou geste « Reprendre la synchronisation ») n'est pas une reconnexion : les données de l'appareil s'affichent aussitôt, sans écran de connexion, et aucune saisie n'est demandée tant que l'utilisateur reste identifié auprès de Google sur l'appareil (S23, S23b).
6. **CA-6** — L'utilisateur peut se déconnecter à tout moment depuis l'application. Il revient alors à l'écran de connexion (RG-043) :
   - les données restent sur l'appareil, y compris les modifications pas encore enregistrées dans son Drive ;
   - elles ne sont plus affichées jusqu'à la reconnexion (CA-1) ;
   - à la reconnexion avec le même compte, il retrouve toutes ses données, et les modifications en attente sont enregistrées dans son Drive ;
   - avant la déconnexion, si des modifications ne sont pas encore enregistrées dans son Drive, l'application lui en indique le nombre et lui précise qu'elles le seront à sa prochaine connexion sur cet appareil.
   - La déconnexion n'efface jamais les données de l'appareil ; il n'existe pas d'action combinée « se déconnecter et effacer » (DEC-015).
   - *Précision E8 (Q-US-022-4, sans changement de règle)* : avec le réseau, l'application tente d'abord d'enregistrer les modifications en attente dans le Drive ; elle n'indique leur nombre (et ne demande confirmation) que s'il en reste après cette tentative (S09c, S09d). En consultation seule (RG-058), elle ne tente aucun enregistrement (Q-US-022-3 ; S25).
7. **CA-7** — Si l'accès au compte Google a été retiré ou a expiré, l'application l'indique à l'utilisateur dès sa prochaine utilisation et lui propose de se reconnecter. En attendant, il continue de consulter et de saisir ses données, comme sans réseau (RG-035, US-018). Après reconnexion, ses modifications faites entre-temps sont enregistrées dans son Drive ; aucune n'est perdue (ENF-06).
   - *Précision E8 (Q-US-031-1, sans changement de règle)* : sur le PC, l'accès expiré est la session Google du navigateur expirée, signalée sans bandeau, avec l'action « Reprendre la synchronisation » (US-031 CA-5 et CA-9) ; l'accès retiré est signalé par le bandeau « Se reconnecter » dès que l'application en a la preuve.
   - *Extension DEC-034 (validée le 2026-10-22, V-DEC034-5, DEC-036 ; retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST))* : il en va de même **sur le smartphone** (US-018 CA-8) : l'accès expiré y est un accès à renouveler, sans bandeau ; seul l'accès retiré affiche « Se reconnecter » (S11).
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
- *DEC-034, validé le 2026-10-22 (V-DEC034-3, DEC-036 ; retiré si la condition de DEC-034 échoue (M-RED, M-PERSIST))* : sur le smartphone, accès Google à renouveler à l'ouverture : les données du smartphone s'affichent aussitôt, sans écran de connexion ; l'accès est renouvelé sans saisie et sans geste, par une redirection silencieuse (réponse de Starck à Q-DEC034-1 ; si elle échoue : « Reprendre la synchronisation », US-018 S06c) (US-017 CA-3 ; S23b).
- Déconnexion puis reconnexion avec le même compte, sans réseau : la reconnexion n'est pas possible sans réseau ; l'application l'indique (motif `ERR-004`).
- *Précision E11 (RL-LOT-001-P4, 2026-10-27)* — choix entre `ERR-003` et `ERR-004` sans réseau : sans réseau, l'application ne peut pas savoir quel compte va se connecter. Le message de reconnexion (`ERR-004`) est donc affiché **dès qu'un espace de compte existe sur l'appareil, quel que soit le compte** ; s'il n'en existe aucun, c'est le message de première connexion (`ERR-003`). Exemple : le compte A a supprimé les données de cet appareil alors que celles du compte B y restent ; A, sans réseau, voit `ERR-004`. Cas non scénarisé ; règle couverte par UT-US-022-04. Le texte d'`ERR-004` (« Vos données sont conservées sur cet appareil ») est à vérifier par Steeve dans ce cas.
- *Cas limite validé par le commanditaire (DEC-039, 2026-10-28 ; RL-LOT-001-P6) — geste pendant une saisie, fenêtre de Google en panne* : si l'utilisateur fait le geste « Reprendre la synchronisation » pendant qu'une saisie est en cours et que la fenêtre de Google ne peut pas s'ouvrir (panne technique, qui obligerait à quitter la page), l'application ne quitte pas la page : elle affiche « Terminez votre saisie, puis reprenez la synchronisation. » (`TST-SAISIE-A-TERMINER`, guide v0.2.14 §6.6.6). Rien n'est perdu ni lancé ; l'indicateur reste « Reprendre la synchronisation ». Une fois la saisie terminée, un **second geste** est nécessaire : c'est la seule exception à « jamais plus d'un geste » (RG-017), acceptée par le commanditaire pour cette seule panne technique (DEC-039). Non scénarisé (le banc ne simule pas la panne de la fenêtre de Google) ; couvert par les tests unitaires de la conception (UT-US-022-54).
- Changement de compte : voir CA-9.
- Déconnexion ou suppression des données de cet appareil avec plusieurs onglets ouverts sur le PC : les autres onglets reviennent aussitôt à l'écran de connexion (CA-1 ; précision E9, Q-ST031-PEP-1 ; US-031 S16b, S16c).
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
- Usage sur iPhone : hors périmètre de la v1 (DEC-001) ; techniquement possible depuis DEC-034, mais ni testé ni garanti (formulation validée, V-DEC034-1, DEC-036).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-004, ADR-005, ADR-010, ADR-011. **Révisé le 2026-10-22 (DEC-034)** : DAT v0.11 (§4.1.2, §4.1.6 bis, §4.1.7), ADR-013.*

> **Révision DEC-034 (Starck, 2026-10-22).** Un seul adaptateur d'authentification, web, sur tous les appareils. Les mentions « repli » ne valent que si la condition de DEC-034 échoue (on garde alors l'APK, ADR-012). Pour CA-5, CA-7 et S23b : **Q-DEC034-1 (réponse de Starck, 2026-10-22)** : à l'ouverture, le renouvellement se fait **sans geste** : l'application part d'elle-même chez Google (redirection `prompt=none`, 1 à 2 s derrière un écran d'attente) et revient avec l'accès, sans saisie ni appui, si la session Google du téléphone est active (DAT v0.11 §4.1.7, ADR-013). Un geste (« Reprendre la synchronisation ») n'est nécessaire que si l'accès expire **pendant** l'usage, ou si ce retour automatique échoue (une seule tentative par ouverture, puis `SYN-SESSION`). Une saisie n'est demandée que si la session Google elle-même a expiré. Cette réponse est **sous réserve de la mesure M-RED** du test technique v3, dont c'est le critère.

- **Composants touchés** :
  - contexte `compte` : cas d'usage `SeConnecter`, `SeDeconnecter` et `ReprendreSession` ; état de session ;
  - port `FournisseurAuth`, avec **un seul adaptateur web** (DEC-034, ADR-013) :
    - à l'ouverture : **redirection pleine page** vers Google (`response_type=token`, `prompt=none`, `login_hint`, `state`), une seule tentative par ouverture, fragment de retour lu puis effacé avant tout autre traitement ;
    - sur geste (« Reprendre la synchronisation », « Se reconnecter ») et à la première connexion : Google Identity Services, modèle « jeton », script chargé à la demande, ou redirection interactive (iPhone, ou si la fenêtre GIS échoue) ;
    - *repli* : Android natif, Credential Manager et AuthorizationClient ;
  - `CoffreJetons` : jeton d'accès conservé en mémoire seulement ;
  - adaptateur Drive dans `infrastructure-google` : création ou recherche du dossier de l'application et de `manifeste.json` ;
  - `composition/web.ts` seulement ; *repli* : aussi `composition/capacitor.ts` ;
  - écran d'attente de la redirection (Steeve).
- **Données** :
  - **base locale cloisonnée par compte** : un espace de stockage par `sub` Google (base IndexedDB nommée d'après une empreinte du `sub` ; *repli* : fichier SQLite). Ce cloisonnement satisfait CA-1 et CA-9 sans rien effacer (RG-043) ;
  - identité mise en cache localement (`sub`, adresse) : elle permet de rouvrir la session sans réseau (CA-5, US-018) ;
  - aucun jeton n'est persisté par notre code ; le contexte de redirection (`state`, instant) est conservé localement sans jeton, 10 min au plus, à usage unique ;
  - **première connexion** : le dossier est recherché par `appProperties` avant d'être créé. Si deux dossiers sont créés en même temps sur les deux appareils, l'application conserve le plus ancien (`createdTime`) et y fusionne le contenu de l'autre (DAT §4.2).
- **Accès Google** :
  - scopes `openid`, `email` et `drive.file`, tous non sensibles. Aucun accès à l'agenda (CA-8, ENF-05) ;
  - projet OAuth publié en production, sans logo, pour qu'aucun écran d'avertissement ne s'affiche (ENF-08). À confirmer par le test technique v3 (risque R11) ;
  - client OAuth Web : origines autorisées **et URI de redirection autorisés** (`https://mathieublandin-create.github.io/taskapp/` ; adresse de recette ; `http://localhost:5173/`) ;
  - retours de redirection en erreur : `interaction_required`, `login_required`, `consent_required` donnent « session à reprendre » (`SYN-SESSION`, sans bandeau) ; `redirect_uri_mismatch` et erreurs de configuration : `SYN-SESSION` et anomalie journalisée ;
  - erreurs traduites : refus ou annulation, `PorteeInsuffisante`, `AccesGoogleRevoque` ; Drive désactivé ou indisponible : `403` puis message explicite.
- **Sécurité** :
  - client OAuth public, sans secret, restreint aux origines et aux URI de redirection autorisés ; *repli* : nom de paquet et empreinte SHA-1 sur Android ;
  - redirection : `state` d'au moins 128 bits vérifié, fragment effacé (`history.replaceState`) avant tout traitement, `Referrer-Policy: no-referrer`, aucune ressource tierce, jeton jamais journalisé ni persisté (exception à `conventions.md` §9 limitée au fragment de retour) ;
  - aucun jeton dans les journaux ni dans le stockage persistant ;
  - **RG-043** : après une déconnexion, les données restent au repos sur l'appareil, non chiffrées. Elles sont protégées par le profil du navigateur, sur le smartphone (Chrome) comme sur le PC ; *repli* : bac à sable Android sur le smartphone. Le commanditaire a traité cette tension avec ENF-05 par l'action distincte « Supprimer les données de cet appareil » (DEC-015) ;
  - **DEC-015** : cas d'usage `SupprimerDonneesAppareil`. Il tente un dépôt ; si c'est impossible, il demande une confirmation qui indique le nombre de modifications perdues (garde-fou établi : V-09, RG-055) ; puis il supprime l'espace de stockage du compte connecté et ferme la session.
  - la déconnexion efface la session, le jeton en mémoire, l'identité en cache servant au `login_hint` et tout contexte de redirection ; elle ne déclenche aucune redirection à l'ouverture suivante. *Repli* : sur Android, elle efface aussi l'état d'identification du Credential Manager. Ce n'est pas une révocation.
- **Exigences non fonctionnelles** :
  - réouverture d'une session existante sans aucun appel réseau bloquant (ENF-T-01) ;
  - première connexion jusqu'à l'état vide en moins de 10 s, sur un réseau 4G.
- **Risques** :
  - R3 et CA-5, **sur tous les appareils** (DEC-034) : la session logique est conservée localement, mais le jeton d'accès doit être obtenu de nouveau ; à l'ouverture, par redirection sans geste si la session Google est active ; en cours d'usage, par un geste ; saisie seulement si la session Google a expiré (F14). Mesure M-RED, condition de DEC-034 et d'E9 ;
  - R18 : flux OAuth implicite susceptible d'évoluer chez Google ; parade : adaptateur isolé, repli au geste seul ;
  - *repli seulement* : R2 (renouvellement silencieux sur Android) ;
  - R11 : l'origine de la PWA, sans domaine propre (DEC-006), doit être acceptée par l'écran de consentement en production.
- **ADR applicables** : ADR-002, ADR-004, ADR-005, ADR-010, ADR-013.
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
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-022-se-connecter-avec-mon-compte-google.feature`](../../../tests/features/US-022-se-connecter-avec-mon-compte-google.feature) — **33 scénarios** dont 1 en recette manuelle (`@recette`). *DEC-034 : S11 (accès retiré seulement), S23 (complété) et S23b (nouveau) portent le tag `@DEC-034` ; validés le 2026-10-22 (DEC-036), retirés si la condition de DEC-034 échoue (M-RED, M-PERSIST).* Chaque scénario porte les tags `@US-022`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02 |
| CA-2 | S03, S04 |
| CA-3 | S05 |
| CA-4 | S06 |
| CA-5 | S07 ; précision DEC-034 (DEC-036) : S23, S23b |
| CA-6 | S08, S09a, S09b, S09c (avec réseau : enregistrement d'abord), S09d (avec réseau, Drive momentanément indisponible), S10, S25 (consultation seule) |
| CA-7 | S11 (accès retiré ; `@DEC-034` : l'exemple « a expiré » est retiré, l'accès expiré relève de S23 et S23b) |
| CA-8 | S13a ; S13b (recette manuelle, `@recette`) |
| CA-9 | S14 |
| CA-10 (RG-055) | S10, S15, S16, S17a, S17b, S18, S19, S24 (consultation seule) |
| Cas limite : première connexion sans réseau ; réseau interrompu | S20a, S20b |
| Cas limite : Drive indisponible ou désactivé | S21 (désactivé, `ERR-006`), S20c (momentanément indisponible, `ERR-005`) |
| Cas limite : accès retiré pendant l'utilisation | S12 |
| Cas limite : session Google expirée sur PC | S23 (redirection silencieuse en échec à l'ouverture, `@DEC-034`) |
| Cas limite (DEC-034, DEC-036) : accès Google à renouveler à l'ouverture sur le smartphone | S23b |
| Cas limite : reconnexion sans réseau | S22 |
| Cas limite : données du compte A supprimables seulement par A | S19 |
| Cas limite : suppression sur un appareil pas encore entièrement chargé | S15 (le Drive n'est jamais touché) |
| Cas limite : distinction avec « repartir de zéro » | S15 ; US-017 S21 |

Nom de l'application : « Done Juan » (DEC-017), utilisé dans les scénarios. Le dossier du Drive s'appelle « Done Juan » (V-13, DEC-018), comme l'application (S05).

## Questions ouvertes
Aucune. V-DEC034-1, 3, 5 validées le 2026-10-22 (DEC-036, « Tout reco ») ; Q-DEC034-1 répondue par Starck (à l'ouverture, renouvellement sans aucun geste ; voir US-018).

*Antérieurement* : Q-DEM001-42 a été répondue le 2026-10-21 (DEC-015, DEC-016). Le déroulement de CA-10 et les autres critères sont validés par le commanditaire (DEC-018).

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
| 2026-10-22 | Révision DEC-034 (Pepper), proposée (V-DEC034) : CA-5 précisé (renouveler l'accès n'est pas se reconnecter) ; précision E8 de CA-7 étendue au smartphone (accès expiré sans bandeau) ; cas limite de l'accès à renouveler sur le smartphone ; iPhone reformulé. Scénarios : S11 limité à l'accès retiré ; nouveau S23b (33 scénarios). Note à Starck sur la section « Impacts architecture ». Statut : En analyse. |
| 2026-10-22 | Révision DEC-034 **validée par le commanditaire** (DEC-036, verbatim « Tout reco », V-DEC034-1, 3, 5) : précisions de CA-5 et CA-7 et cas limite en vigueur, retirées si la condition de DEC-034 échoue (M-RED, M-PERSIST) ; Q-DEC034-1 répondue par Starck (renouvellement sans geste à l'ouverture) ; S23 (PC) complété par la précondition « redirection silencieuse en échec », S23b complété (aucun bandeau), tag `@DEC-034`. Statut : **Prête**. |
| 2026-10-27 | E9 (Pepper), Q-ST031-PEP-1 : cas limite « plusieurs onglets » ajouté (renvoi à US-031 S16b, S16c), sans changement de règle. |
| 2026-10-27 | Suites de l'E11 (Pepper) : RL-LOT-001-P2 (S23b réordonné : assertions sur les données après l'étape de renouvellement, DEC-038) ; RL-LOT-001-P4 (cas limite : `ERR-003` ou `ERR-004` sans réseau quand l'espace d'un autre compte existe) ; RL-LOT-001-P6 (cas limite : second geste après une saisie quand la fenêtre de Google est en panne, `TST-SAISIE-A-TERMINER`). Précisions sans changement de règle, sauf l'exception de P6 à « jamais plus d'un geste », signalée à Jarvis. |
| 2026-10-28 | DEC-039 (Q-RL-P6, a) : l'exception au geste unique du cas limite RL-LOT-001-P6 est validée par le commanditaire ; cas limite mis à jour. |
