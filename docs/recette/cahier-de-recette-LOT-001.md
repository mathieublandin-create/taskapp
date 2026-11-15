# Cahier de recette de LOT-001 : « Done Juan », objectifs, tâches, synchronisation, hors ligne

> **Version 0.1 (projet), 2026-11-12, Pepper (E16).** Statut : à finaliser à l'ouverture de l'E16, après les recettes des agents (E14). Les sections 7 (synthèse des PV) et 8 (anomalies ouvertes) sont à mettre à jour à ce moment.
> **Pour qui ?** Pour vous, commanditaire. Aucune compétence technique n'est nécessaire : il suffit de suivre les étapes, de regarder l'écran et de cocher.
> **Combien de temps ?** Environ 2 h 30 en tout, en plusieurs séances si vous voulez. Les parcours sont indépendants à partir du parcours 1, sauf indication contraire.
> **Aucun mot de passe, aucune clé, aucune adresse e-mail n'est à écrire dans ce document ni dans vos retours.** Dites « le compte de recette ».

---

## 1. Avant de commencer

### 1.1 Ce qu'il vous faut

| Quoi | Détail |
|---|---|
| Un PC | Chrome ou Edge à jour |
| Un smartphone Android | Chrome à jour. Notez le modèle et la version d'Android (Paramètres > À propos du téléphone) : vous les indiquerez à la fin |
| Le **compte Google de recette** | Un compte Google créé uniquement pour la recette, jamais votre compte habituel. Son Drive doit être **vide** au départ (voir 1.3) |
| L'application « Done Juan (recette) » en ligne | Mise en place avec le guide `docs/recette/guide-mise-en-place-recette.md` (une seule fois). L'adresse de recette vous est donnée par ce guide |
| Ce cahier, imprimé ou ouvert à côté | Vous cochez au fur et à mesure |

### 1.2 Comment lire un parcours

Chaque parcours est un tableau. Pour chaque ligne :

1. Faites ce qui est écrit dans **Je fais**.
2. Comparez avec **Je dois voir**.
3. Cochez : **OK** (c'est conforme), **KO** (ce n'est pas conforme ou ça ne marche pas), **R** (remarque : ça marche, mais quelque chose vous gêne ou vous surprend).
4. En cas de KO ou de R, écrivez en une phrase ce que vous avez vu, dans la colonne « Ce que j'ai vu ». Une capture d'écran aide beaucoup (nommez-la avec la référence de la ligne, par exemple `P3-04.png`).

Les textes de l'application peuvent différer légèrement de ceux de ce cahier (une virgule, une majuscule) : ce n'est pas une anomalie tant que le sens est le même.

### 1.3 Préparer le compte de recette (à faire une fois, avant le parcours 1)

1. Dans le navigateur du PC, connectez-vous à Google avec le **compte de recette** (fenêtre de navigation privée conseillée, pour ne pas mélanger avec votre compte habituel).
2. Ouvrez Google Drive. Vérifiez qu'il n'existe **aucun dossier nommé « Done Juan »**. S'il existe (reste d'un essai précédent), supprimez-le et videz la corbeille. Notez-le dans la grille (ligne P0-02).
3. Sur le téléphone, vérifiez que Chrome peut se connecter avec ce même compte (voir l'étape 10 du guide de mise en place).

### 1.4 Jeu de données de la recette

Il n'y a rien à importer : vous créez vous-même les données au parcours 2 et 3, avec les noms ci-dessous. Gardez ces noms exacts, les parcours suivants s'y réfèrent.

| Type | Nom | Détail |
|---|---|---|
| Objectif | **Publier le guide** | délai 2026-12-15 |
| Sous-objectif de « Publier le guide » | **Relire le guide** | délai 2026-12-20 (volontairement après son parent) |
| Objectif | **Courir un semi-marathon** | sans délai |
| Tâche | **Chapitre 1** | délai 2026-11-30, estimation 2 h, objectif « Publier le guide » |
| Tâche | **Chapitre 2** | délai 2026-11-01 (déjà dépassé, donc « en retard »), estimation 1 h, objectif « Publier le guide » |
| Tâche sans objectif | **Appeler l'imprimeur** | délai 2026-12-01, estimation 0 h 30 |
| Sous-tâches de « Chapitre 1 » | **Section A** (délai 2026-11-20, 1 h) et **Section B** (délai 2026-11-25, 1 h) | |

### 1.5 Ce qui n'est pas une anomalie (limites connues du lot 1)

- L'application ne se présente que par la **barre d'onglets en bas** (« Tâches » et « Objectifs »), aussi sur PC. Il n'y a pas de menu latéral sur PC (prévu plus tard).
- Il n'y a **pas d'onglet « Aujourd'hui »**, pas de bilan du soir, pas de mode sombre, pas de réglages : ce sont des lots suivants.
- Il n'y a **que Chrome sur Android et Chrome ou Edge sur PC** : pas d'iPhone, pas d'application Android à télécharger. L'application s'installe depuis le navigateur.
- Les données sont **gardées sur l'appareil après une déconnexion** (mais invisibles). C'est voulu (« Supprimer les données de cet appareil » les efface).
- Si Google affiche un écran d'avertissement à la connexion, **notez-le** (ligne P1-04) : ne le contournez pas sans l'avoir noté. Voir aussi 6.1.
- Quelques détails d'apparence connus : espaces entre un nombre et son unité, icônes de la barre d'onglets.

### 1.6 Si vous bloquez

Arrêtez-vous, notez le numéro de la ligne et ce que vous voyez (capture d'écran), et envoyez-les à Jarvis. Rien ne se perd : vous pouvez reprendre plus tard au même endroit.

---

## 2. Parcours 0 : vérifier qu'on teste la bonne version

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P0-01 | PC | Ouvrez l'adresse de recette dans Chrome ou Edge | Le nom **« Done Juan (recette) »** dans l'onglet du navigateur et une page de connexion avec un bouton « Continuer avec Google » | | |
| P0-02 | PC | Dans Google Drive du compte de recette, cherchez « Done Juan » | Aucun dossier de ce nom (Drive vide au départ) | | |
| P0-03 | Les deux | Notez la date et l'heure de la séance, le modèle du téléphone, la version d'Android, la version de Chrome | (rien à voir : ces informations servent à reproduire un problème) | | |
| P0-04 | PC | Lisez, dans le guide de mise en place, le numéro du commit publié (étape 5 du guide) et recopiez-le ici : ______ | (rien à voir) | | |

---

## 3. Parcours par fonction

### Parcours 1 : se connecter avec mon compte Google (US-022)

*Règles vérifiées : l'accès est réservé aux utilisateurs connectés ; seules l'identité et les fichiers de l'application sont demandés ; le dossier « Done Juan » est créé dans le Drive.*

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P1-01 | PC | Ouvrez l'application (première fois) | Uniquement l'invitation à se connecter : un bouton « Continuer avec Google », la liste de ce que l'application demande. Aucune donnée, aucun autre bouton utile | | |
| P1-02 | PC | Cliquez sur « Continuer avec Google », puis, sur la fenêtre de Google, **annulez** (fermez la fenêtre ou « Annuler ») | Vous restez sur l'écran de connexion, avec un message qui explique qu'un compte Google est nécessaire. Rien n'est créé | | |
| P1-03 | PC | Recommencez et choisissez le **compte de recette** | La fenêtre de Google vous demande vos autorisations | | |
| P1-04 | PC | Regardez attentivement l'écran de Google. **Notez** s'il affiche l'avertissement « Google n'a pas validé cette application » (ou équivalent) | **Résultat attendu par la spécification : aucun avertissement de ce type** (scénario S13b). Si l'avertissement apparaît : cochez KO, recopiez le texte et dites si vous avez dû cliquer sur « Paramètres avancés » | | |
| P1-05 | PC | Vérifiez la liste des autorisations demandées | Seulement : identification du compte et accès aux fichiers de l'application dans le Drive. **Rien sur l'agenda** | | |
| P1-06 | PC | Acceptez | Vous arrivez dans l'application, sur l'onglet « Tâches », avec un message de bienvenue qui propose de créer un premier objectif. Aucune donnée | | |
| P1-07 | PC | Dans Google Drive (compte de recette), rafraîchissez | Un dossier **« Done Juan »** est apparu | | |
| P1-08 | Android | Dans Chrome, ouvrez l'adresse de recette. Connectez-vous avec le compte de recette (mêmes écrans, mêmes questions qu'en P1-01, P1-04, P1-05) | Même résultat qu'au PC. Notez à nouveau la ligne P1-04 pour Android | | |
| P1-09 | Android | Menu de Chrome (trois points) > « Installer l'application » | Une icône « Done Juan (recette) » apparaît sur l'écran d'accueil | | |
| P1-10 | Android | Fermez complètement l'application, puis ouvrez-la **par son icône** | Vous arrivez directement dans l'application (encore vide à ce stade) : **vous n'avez pas à vous reconnecter** et **aucun écran de connexion n'apparaît, même une fraction de seconde** | | |
| P1-11 | PC | Fermez l'onglet, rouvrez l'adresse de recette | Même constat qu'en P1-10 : l'application s'ouvre sans repasser par la connexion, **sans clignotement de l'écran de connexion** | | |

### Parcours 2 : mes objectifs et sous-objectifs (US-001, US-023)

*Vérifie aussi la correction des anomalies ANO-002 et ANO-003 (création d'un objectif sur smartphone).*

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P2-01 | Android | Ouvrez l'onglet « Objectifs » **sans passer en « mode bureau »** de Chrome | Le bouton rond « + » est visible en bas à droite, au-dessus de la barre d'onglets (ANO-002). Il n'a pas d'étiquette écrite ; en appuyant longuement ou avec un lecteur d'écran, son nom est « Nouvel objectif » | | |
| P2-02 | Android | Appuyez sur « + » | Une feuille « Nouvel objectif » s'ouvre. Elle demande un intitulé, une description facultative, un délai facultatif. Elle ne parle ni d'estimation de durée ni de « tâche » (ANO-003) | | |
| P2-03 | Android | Saisissez **Publier le guide**, délai 2026-12-15, puis validez | Le **détail de l'objectif** s'ouvre, avec l'état « à décliner en tâches ». **Aucune tâche n'a été créée** (vérifiez dans l'onglet « Tâches » au parcours 3) (ANO-003) | | |
| P2-04 | Android | Revenez à la liste des objectifs | « Publier le guide », délai 15 décembre, état « à décliner en tâches » | | |
| P2-05 | Android | Créez **Courir un semi-marathon**, sans délai (choisissez « Sans délai ») | Dans la liste : la mention « sans délai » | | |
| P2-06 | Android | Ouvrez « Publier le guide » : créez le sous-objectif **Relire le guide**, délai 2026-12-20 | Le sous-objectif est enregistré, et une alerte indique que son délai est **après celui de « Publier le guide »** (rien n'est bloqué) | | |
| P2-07 | Android | Ouvrez « Relire le guide » | Aucune action « créer un sous-objectif » n'est proposée (un seul niveau) | | |
| P2-08 | Android | Modifiez le délai de « Relire le guide » : 2026-12-10 | L'alerte disparaît | | |
| P2-09 | PC | Cherchez le bouton de création d'un objectif et créez un objectif « Objectif de test PC », sans délai | Le bouton « + » est aligné sur la colonne de contenu (pas au bord de la fenêtre) ; l'objectif est créé, **pas une tâche** | | |
| P2-10 | PC | Supprimez « Objectif de test PC » | Une confirmation est demandée. En cliquant sur le bouton de confirmation **avec la souris**, la suppression a lieu (ANO-007). L'objectif disparaît | | |
| P2-11 | Android | Avec « Relire le guide » rattaché à « Publier le guide », supprimez **Publier le guide** | Une confirmation est demandée. Après confirmation (**au toucher**), « Relire le guide » devient un objectif principal (ANO-007) | | |
| P2-12 | Android | Recréez « Publier le guide » (délai 2026-12-15) et replacez « Relire le guide » sous lui (menu « … » > déplacer), délai 2026-12-10 | Le sous-objectif apparaît de nouveau sous « Publier le guide » | | |

### Parcours 3 : mes tâches et sous-tâches (US-002, US-024)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P3-01 | Android | Onglet « Tâches ». Notez le bouton rond « + » (nom « Ajouter une tâche ») : appuyez dessus | La feuille de saisie d'une tâche s'ouvre. **Aucun délai ni aucune estimation n'est présélectionné** | | |
| P3-02 | Android | Saisissez l'intitulé **Chapitre 1** seul et validez | Refus : un message indique le délai manquant (puis, une fois le délai donné, l'estimation manquante) | | |
| P3-03 | Android | Complétez : délai 2026-11-30, estimation 2 h, objectif « Publier le guide » | La tâche est créée. Dans la liste : intitulé, délai, estimation, objectif | | |
| P3-04 | Android | Essayez une estimation de 45 min | Impossible : seuls les multiples de 30 min (au moins 0 h 30) sont proposés | | |
| P3-05 | Android | Créez **Chapitre 2** (délai 2026-11-01, estimation 1 h, objectif « Publier le guide ») | La tâche est créée et portée « **en retard** » | | |
| P3-06 | Android | Créez **Appeler l'imprimeur** (délai 2026-12-01, 0 h 30), sans objectif | La tâche apparaît dans la liste ; elle est classée « sans objectif » | | |
| P3-07 | Android | Observez l'ordre de la liste | Tri par délai croissant : Chapitre 2, Chapitre 1, Appeler l'imprimeur | | |
| P3-08 | Android | **Défilez jusqu'à la dernière ligne de la liste, puis touchez le centre de cette dernière ligne** (pas son bord) | Le **détail de la tâche s'ouvre**. Le bouton « + » ne recouvre jamais le centre d'une ligne (ANO-005) | | |
| P3-09 | Android | Dans le détail de « Chapitre 1 », créez la sous-tâche **Section A** (délai 2026-11-20, 1 h), puis **Section B** (délai 2026-11-25, 1 h) | À la première sous-tâche, un message vous prévient que l'estimation de « Chapitre 1 » sera remplacée par la somme des sous-tâches. Ensuite l'estimation de « Chapitre 1 » vaut 2 h (1 h + 1 h), **non modifiable à la main** | | |
| P3-10 | Android | Dans « Section A », cherchez une action « créer une sous-tâche » | Elle n'est pas proposée (un seul niveau) | | |
| P3-11 | Android | Modifiez le délai de « Section B » : 2026-12-05 (après celui de « Chapitre 1 ») | La sous-tâche est enregistrée ; une alerte nomme la tâche parente | | |
| P3-12 | Android | Modifiez les objectifs de « Section B » | Impossible : ils sont hérités de la tâche parente | | |
| P3-13 | PC | Ouvrez l'application sur le PC, après avoir cliqué sur « Synchroniser maintenant » dans la feuille « Compte et synchronisation » sur le téléphone et sur le PC (voir parcours 5 pour le détail) | Les mêmes objectifs, tâches et sous-tâches s'affichent sur le PC | | |
| P3-14 | PC | Supprimez la tâche « Appeler l'imprimeur » | Confirmation demandée, puis suppression. (Pour une tâche avec sous-tâches, la confirmation en donne le nombre.) | | |
| P3-15 | PC | Recréez « Appeler l'imprimeur » (délai 2026-12-01, 0 h 30, sans objectif) | La tâche est de retour | | |

### Parcours 4 : terminer, rouvrir, abandonner (US-003, US-025)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P4-01 | PC | Dans « Chapitre 1 », essayez de **terminer la tâche** alors que « Section A » et « Section B » sont à faire | Refus avec un message qui indique « 2 sous-tâches restantes » | | |
| P4-02 | PC | Terminez « Section A » (case ronde) | La sous-tâche est terminée. L'avancement du parent indique « 1 sous-tâche terminée sur 2 » | | |
| P4-03 | PC | Terminez « Section B » | « Chapitre 1 » **reste à faire** : elle ne se termine jamais toute seule | | |
| P4-04 | PC | Terminez « Chapitre 1 » | Elle passe à l'état « terminée ». Elle n'est plus « en retard » même si son délai était dépassé | | |
| P4-05 | PC | Terminez « Chapitre 2 » | Dans l'onglet « Objectifs », « Publier le guide » reste **« en cours »** : son sous-objectif « Relire le guide », sans tâche, est « à décliner en tâches » et n'est donc pas atteint | | |
| P4-06 | PC | Créez la tâche **Relecture finale** (délai 2026-12-10, 1 h) rattachée à « Relire le guide », puis terminez-la | « Relire le guide » est **atteint**, puis « Publier le guide » est **atteint** (toutes ses tâches sont terminées et tous ses sous-objectifs sont atteints) | | |
| P4-07 | PC | Rouvrez la sous-tâche « Section A » alors que « Chapitre 1 » est terminée | Une confirmation annonce que la tâche parente « Chapitre 1 » sera aussi rouverte. Après confirmation : les deux sont « à faire » ; « Publier le guide » repasse « en cours » | | |
| P4-08 | PC | Rouvrez « Chapitre 2 » (terminée en P4-05), puis abandonnez-la | Une confirmation est demandée. Après confirmation, la tâche quitte « À faire » et se trouve dans le filtre « Abandonnées », sans date de fin, jamais « en retard » | | |
| P4-09 | PC | Abandonnez « Chapitre 1 » (« Section A » est à faire, « Section B » est terminée) | La confirmation annonce que 1 sous-tâche à faire sera abandonnée aussi et que 1 sous-tâche déjà terminée reste terminée | | |
| P4-10 | PC | Reprenez « Chapitre 1 » (filtre « Abandonnées ») | Reprise sans confirmation. Les sous-tâches abandonnées **avec elle** sont reprises ; pas celles abandonnées auparavant une par une | | |
| P4-11 | PC | Reprenez « Chapitre 2 » | La tâche revient « à faire ». Elle est de nouveau « en retard » | | |

### Parcours 5 : retrouver mes données sur les deux appareils (US-017)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P5-01 | Les deux | Ouvrez l'application sur le PC et sur le téléphone, avec du réseau sur les deux | L'indicateur de synchronisation (en haut) dit que tout est à jour | | |
| P5-02 | PC | Sur le PC, renommez « Chapitre 2 » en « Chapitre 2 : plan » | (rien d'autre) | | |
| P5-03 | Android | Appuyez sur l'indicateur de synchronisation pour ouvrir la feuille « Compte et synchronisation », puis « Synchroniser maintenant » | La feuille s'ouvre **par-dessus l'écran** (elle ne pousse pas la liste vers le bas). Le nouveau nom « Chapitre 2 : plan » apparaît sur le téléphone en quelques secondes (sinon, dans l'heure au plus tard : notez le délai réel) | | |
| P5-04 | Android | Fermez la feuille (bouton « Fermer », ou geste retour) | Retour à la liste, qui est visible dès la fermeture, avec ses tâches sans avoir à faire défiler | | |
| P5-05 | Les deux | Sans réseau **ni sur l'un ni sur l'autre** (voir 4), renommez « Chapitre 1 » en « Chapitre 1 A » sur le PC et en « Chapitre 1 B » sur le téléphone. Rétablissez le réseau sur les deux, attendez la synchronisation | Une seule version est conservée (la plus récente). L'application vous informe, dans la feuille, que votre autre valeur **n'a pas été retenue**, avec l'élément, l'information et la valeur écartée | | |
| P5-06 | Les deux | Ouvrez la section « Modifications non retenues », cliquez sur « Compris » pour cette ligne | La ligne disparaît. (Si vous aviez quitté et rouvert l'application avant, elle y était encore.) Remettez ensuite le nom « Chapitre 1 » sur la tâche, pour les parcours suivants | | |
| P5-07 | PC | Changez l'heure ou le fuseau du PC sur un autre fuseau que Paris (par exemple New York) | Une mention « heure de Paris » apparaît dans l'application. Remettez le fuseau d'origine : la mention disparaît | | |
| P5-08 | Les deux | Ouvrez Google Drive (compte de recette) > dossier « Done Juan » | Des fichiers de l'application sont présents. **Ne les modifiez pas** (sauf au parcours 5 bis) | | |

#### Parcours 5 bis (facultatif, à faire en dernier, il modifie le Drive) : données absentes du Drive

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P5b-01 | PC | Dans Google Drive, déplacez le dossier « Done Juan » dans la corbeille (il y reste récupérable) | (rien) | | |
| P5b-02 | PC | Dans l'application, ouvrez la feuille « Compte et synchronisation », « Synchroniser maintenant » | Un avertissement : « Vos données ne sont plus utilisables dans votre Google Drive ». Rien n'est effacé. Trois choix : « Restaurer mes données », « Repartir de zéro… » ou « Décider plus tard » | | |
| P5b-03 | PC | Choisissez « Restaurer mes données » | Un message confirme que vos données sont de nouveau dans le Drive ; le dossier « Done Juan » est recréé | | |

### Parcours 6 : sans réseau sur le smartphone (US-018)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P6-01 | Android | Activez le **mode avion** | (rien) | | |
| P6-02 | Android | Ouvrez l'application par son icône | Vos données s'affichent aussitôt, **sans écran de connexion ni d'attente**. L'application dit qu'elle est **hors ligne** | | |
| P6-03 | Android | Renommez « Chapitre 1 » en « Chapitre 1 : contexte » ; créez un objectif « Hors ligne 1 » ; terminez « Appeler l'imprimeur » | Tout est possible comme avec le réseau. Les éléments modifiés portent un signe « en attente » ; l'indicateur dit « Hors ligne · 3 en attente » (ou équivalent) | | |
| P6-04 | Android | Fermez l'application (retirez-la des applications récentes) puis rouvrez-la, toujours en mode avion | Les trois modifications sont toujours là, toujours « en attente » | | |
| P6-05 | Android | Désactivez le mode avion | Les modifications sont enregistrées dans le Drive sans geste de votre part, **ou** l'application propose « Reprendre la synchronisation » : dans ce cas, faites ce geste. L'indicateur « en attente » disparaît | | |
| P6-06 | PC | Dans Google Drive ou sur le PC (« Synchroniser maintenant »), vérifiez | Les trois modifications sont présentes, **chacune une seule fois** | | |
| P6-07 (`@recette`, US-018 S09b) | Android | **Mode avion**. Renommez « Chapitre 1 : contexte » en « Chapitre 1 : contexte 2 ». Puis : Paramètres du téléphone > Applications > « Done Juan (recette) » > **Forcer l'arrêt**. Puis **éteignez le téléphone** et rallumez-le. Rouvrez l'application, toujours en mode avion | La tâche porte bien le nom « Chapitre 1 : contexte 2 » avec le signe « en attente » : **rien n'est perdu** | | |
| P6-08 | Android | Désactivez le mode avion et faites, si l'application le propose, « Reprendre la synchronisation » | La modification arrive dans le Drive, une seule fois | | |
| P6-09 | Android | Allez dans « Compte et synchronisation » : repérez la liste des modifications en attente quand vous en avez | Liste lisible des modifications en attente (un intitulé par ligne) | | |

### Parcours 7 : sans réseau sur le PC (US-031)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P7-01 | PC | Coupez le Wi-Fi (ou débranchez le câble) | (rien) | | |
| P7-02 | PC | Rechargez la page de l'application (F5) | L'application se rouvre avec ses données, « hors ligne » | | |
| P7-03 | PC | Renommez « Chapitre 2 : plan » en « Chapitre 2 : plan B » ; créez un objectif « Hors ligne PC » | Possible. Signes « en attente » comme sur le téléphone | | |
| P7-04 | PC | Ouvrez un **deuxième onglet** avec l'adresse de l'application | Le second onglet affiche les mêmes données et reste utilisable. La feuille de synchronisation dit, **sans message d'interruption**, qu'un autre onglet gère la synchronisation | | |
| P7-05 | PC | Dans le second onglet, créez l'objectif « Objectif second onglet » | Il apparaît aussi dans le premier onglet | | |
| P7-06 | PC | Rebranchez le réseau | Les modifications partent dans le Drive sans geste, **une seule fois chacune** | | |
| P7-07 | PC | Fermez tous les onglets, rouvrez l'application **sans réseau** (coupez-le de nouveau avant) | L'application s'ouvre avec les données | | |
| P7-08 | PC | Ouvrez un **autre navigateur** (ou une fenêtre de navigation privée) où l'application n'a jamais été ouverte, **sans réseau**, et saisissez l'adresse | **Aucun écran de Done Juan** : le navigateur affiche son propre message « page inaccessible ». C'est normal : la première ouverture exige le réseau | | |

### Parcours 8 : se déconnecter, supprimer les données de l'appareil, changer de compte (US-022, US-031)

*Vérifie la correction des anomalies ANO-006 (retour à la connexion) et ANO-007 (boutons des confirmations).*

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P8-01 | PC | Ouvrez l'application dans **deux onglets**. Dans le premier, ouvrez « Compte et synchronisation » puis « Se déconnecter » (sans modification en attente) | **Les deux onglets** reviennent à l'écran de connexion et **n'affichent plus aucune donnée** (ANO-006). Si une confirmation apparaît alors qu'aucune modification n'est en attente, notez-le | | |
| P8-02 | PC | Reconnectez-vous avec le compte de recette | Vos données sont là | | |
| P8-03 | PC | Faites une modification **hors réseau** (coupez le Wi-Fi, renommez une tâche), puis « Se déconnecter » | Une confirmation indique le nombre de modifications qui seront enregistrées dans le Drive à la prochaine connexion **sur cet appareil**. Cliquez avec la souris sur « Annuler », puis redemandez et confirmez : **les boutons répondent au clic** (ANO-007) | | |
| P8-04 | PC | Rétablissez le réseau, reconnectez-vous | La modification est dans vos données et dans le Drive | | |
| P8-05 | Android | Mêmes essais que P8-03 sur le téléphone, avec le doigt | Les boutons de la confirmation répondent au toucher (ANO-007) | | |
| P8-06 | PC | Deux onglets ouverts : dans le premier, « Supprimer les données de cet appareil », puis confirmez | Une confirmation est demandée **avant**. Après : **les deux onglets** reviennent à la connexion, sans donnée. Le Drive et l'autre appareil ne sont pas touchés (vérifiez au parcours 5) | | |
| P8-07 | PC | Reconnectez-vous | Vos données sont rechargées depuis le Drive | | |
| P8-08 | PC | Si vous disposez d'un **second compte Google de test**, connectez-le sur le PC après une déconnexion du premier | Le second compte ne voit **jamais** les données du premier ; il arrive sur un espace vide. En revenant avec le premier compte, vous retrouvez vos données | | |

### Parcours 9 : accès Google retiré (US-022 CA-7, US-018 CA-8, US-031 CA-9)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P9-01 | PC | Sur la page Compte Google (compte de recette) > Sécurité > « Applications tierces avec accès au compte », **retirez l'accès** de l'application de recette | (rien tout de suite) | | |
| P9-02 | PC | Dans l'application ouverte, modifiez une tâche, puis ouvrez « Compte et synchronisation » | Un bandeau indique que l'accès Google est perdu, avec la seule action « Se reconnecter ». **Rien n'est bloqué** : vous continuez à consulter et à saisir | | |
| P9-03 | PC | Faites une autre modification | Elle est conservée sur le PC, signalée « en attente » | | |
| P9-04 | PC | Cliquez sur « Se reconnecter » et autorisez à nouveau | Les modifications faites entre-temps sont enregistrées dans le Drive | | |

### Parcours 10 : accessibilité de base (Steeve fera le détail, mais dites si quelque chose vous gêne)

| Réf | Appareil | Je fais | Je dois voir | OK / KO / R | Ce que j'ai vu |
|---|---|---|---|---|---|
| P10-01 | PC | Parcourez l'écran avec la touche **Tabulation** | Un **contour bleu bien visible** entoure l'élément sélectionné, partout, y compris sur les onglets et les boutons | | |
| P10-02 | PC | Sur les écrans de connexion et de synchronisation, regardez les boutons | Tous les boutons ont la même apparence (même forme, même taille tactile) | | |
| P10-03 | Android | Tournez le téléphone en mode paysage | L'application reste utilisable : rien d'important n'est caché derrière le bouton « + » ou la barre d'onglets | | |
| P10-04 | PC | Agrandissez la fenêtre au maximum | Le contenu reste centré, lisible, sans lignes démesurément longues | | |

---

## 4. Comment simuler « sans réseau »

- **Android** : glissez la barre de notifications vers le bas, activez **Mode avion** (et pas seulement les données mobiles : coupez aussi le Wi-Fi si le mode avion le laisse actif).
- **PC** : cliquez sur l'icône réseau, en bas à droite de l'écran (Windows) ou en haut (macOS), et désactivez le Wi-Fi ; ou débranchez le câble réseau.
- Pour rétablir : faites l'inverse. Attendez quelques secondes que l'application s'en aperçoive.

---

## 5. Grille de retours (à renvoyer à Jarvis)

**Pour chaque ligne cochée KO ou R, remplissez une ligne de ce tableau.** Jarvis en fera une anomalie `ANO-xxx` dans le registre, avec la gravité ci-dessous (vous pouvez la proposer, c'est Pepper qui la qualifie).

| N° | Réf de la ligne (ex. P3-08) | Appareil (PC, Android) | Ce que j'ai fait | Ce que j'ai vu | Ce que j'attendais | Gravité proposée | Capture (nom du fichier) |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |

**Gravité (proposez celle qui vous parle le plus) :**

| Gravité | Quand l'utiliser | Exemple |
|---|---|---|
| **Bloquante** | Je ne peux pas faire une action essentielle, ou je **perds ou je vois des données** que je ne devrais pas | Je me déconnecte et mes données restent affichées |
| **Majeure** | Je peux faire l'action, mais avec un détour pénible ou un résultat faux | Le bouton « + » masque la dernière ligne de ma liste |
| **Mineure** | C'est gênant, mais sans conséquence sur mes données et avec un contournement simple | L'écran de connexion clignote à l'ouverture |
| **Cosmétique** | Un détail d'apparence, un texte, une faute | Un mot mal orthographié |

**Remarques générales** (ce que vous avez aimé, trouvé compliqué, imaginé en plus). Elles ne sont pas des anomalies ; elles nourrissent les futurs lots.

______________________________________________________________________

**Appareils utilisés** : PC (système, navigateur, version) : __________ · Téléphone (modèle, Android, Chrome) : __________

**Verdict général du commanditaire** (cochez) : ☐ Je valide le lot 1 · ☐ Je valide avec réserves non bloquantes · ☐ Je ne valide pas (voir les lignes KO bloquantes ou majeures)

**Date** : __________

---

## 6. Points d'attention pour la recette

### 6.1 Avertissement de Google à la connexion (P1-04)

La règle validée (US-022 CA-8, ENF-08) est qu'**aucun avertissement du type « application non validée » ne s'affiche** au lot 1. Le guide de mise en place indique que, tant que l'application Google de recette est en mode « Test », cet avertissement peut apparaître et que c'est « normal ». Les deux ne vont pas ensemble : **si l'avertissement apparaît, le scénario S13b ne peut pas être déclaré réussi** sur la version de recette ; la décision à prendre (publier l'écran de consentement du projet de développement, ou accepter le contrôle sur la version finale seulement) est à votre charge. Notez ce que vous voyez, sans le contourner à votre insu.

### 6.2 Délai de synchronisation

Quand la spécification dit « au plus tard une heure après », elle accorde une marge ; en pratique, la synchronisation se fait en quelques secondes après un changement. Les lignes qui mentionnent « Synchroniser maintenant » servent à ne pas attendre. Notez dans la grille le **délai réel** observé quand vous attendez sans rien faire.

### 6.3 Ce que ce cahier ne vérifie pas

La connexion Google « réelle » n'a été vérifiée que par des doublures pendant le développement : c'est vous qui la validez ici. Les contrôles d'accessibilité fins (lecteur d'écran, contrastes, zoom à 200 %) sont faits par Steeve (PV d'ergonomie). Les contrôles techniques (console du navigateur, poids du premier chargement) sont faits par Starck.

---

## 7. Synthèse des PV de recette des agents (à compléter à l'E16)

| Agent | Document | Verdict | Anomalies ouvertes | Date |
|---|---|---|---|---|
| Pepper | `docs/01-specification-fonctionnelle/recette/PV-LOT-001-metier.md` | à venir (E14) | | |
| Steeve | `docs/01-specification-fonctionnelle/recette/PV-LOT-001-ergonomie.md` | à venir (E14) | | |
| Starck | PV d'architecture (DT-008, poids, bout en bout) | à venir (E14) | | |

## 8. Anomalies ouvertes au moment de la rédaction (à mettre à jour à l'E16)

| Anomalie | Gravité qualifiée | Statut | Ce qu'elle change pour vous |
|---|---|---|---|
| ANO-004 | Mineure | Ouverte (correction avant l'E16 proposée) | L'écran de connexion clignote à l'ouverture (parcours P1-10, P1-11, P6-02) |
| ANO-005 | Majeure | Ouverte (correction avant l'E14) | Le « + » recouvre la dernière ligne ; la feuille de synchronisation pousse la liste (P3-08, P5-03, P5-04) |
| ANO-002, ANO-003, ANO-006, ANO-007 | Majeure ou Bloquante (qualifiées) | Corrigées, **à confirmer par vous** | Parcours 2 (ANO-002 et 003), 8 (ANO-006 et 007) |
