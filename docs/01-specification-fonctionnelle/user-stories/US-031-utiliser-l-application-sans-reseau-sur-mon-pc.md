# US-031 — Utiliser l'application sans réseau sur mon PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée (DEC-018) — révision de forme DEC-034 validée le 2026-10-22 (DEC-036, V-DEC034-2, 4, 6) ; aucun critère d'acceptation ni scénario modifié

**En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon PC sans réseau, mes modifications étant prises en compte au retour du réseau, **afin d'**avoir le même comportement sur mes deux appareils.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau dans le lot** : US conditionnelle depuis la v0.2. Le commanditaire a retenu l'option b) de Q-DEM001-39 : le PC est utilisable hors ligne dès LOT-001 (DEC-013), comme le recommandait l'architecte.
- **Transposition de US-018** : mêmes règles que sur le smartphone (RG-021, RG-035, RG-036, RG-047 à RG-049).
- **Spécificités du PC** :
  - l'application s'utilise depuis une adresse web et peut être installée comme une application (ENF-07, DEC-006) ;
  - pour l'ouvrir sans réseau, il faut l'avoir ouverte au moins une fois avec le réseau, sur ce PC et dans ce navigateur ;
  - limite F14 : quand la session Google du navigateur a expiré, la mise à jour avec l'autre appareil attend un geste de reconnexion ; l'utilisation sur les données du PC continue ;
  - les données du PC sont conservées par le navigateur : si l'utilisateur efface les données de son navigateur, il efface aussi celles de l'application sur ce PC.
- **DEC-034 (2026-10-22), validé par DEC-036** (retiré si la condition de DEC-034 échoue (M-RED, M-PERSIST)) : le comportement du PC ne change pas. Ce qui était propre au PC devient commun aux deux appareils : la limite F14 (accès Google à renouveler, RG-017 et ENF-04 proposées), l'installation comme une application et les cas limites du navigateur (repris dans US-018). ENF-07 est reformulée (plus d'APK sur le smartphone). La synchronisation en arrière-plan est exclue (Q-PWA-3). Les critères d'acceptation et les 28 scénarios sont inchangés.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-057 : bandeau de rappel non bloquant quand la plus ancienne modification en attente date de plus de 24 h.
- RG-021 : consultation et saisie sans réseau, sur le smartphone et sur le PC ; prise en compte au retour du réseau.
- RG-035 : la perte de l'accès Google se comporte comme une coupure de réseau.
- RG-017 : exception du PC quand la session Google du navigateur a expiré (F14) ; *reformulée (DEC-034, validée DEC-036) : exception commune au smartphone et au PC (accès Google à renouveler)*.
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-047 à RG-049 : réparations après fusion.
- RG-019 : la première connexion nécessite le compte Google, donc le réseau.
- ENF-04, ENF-06 (validée), ENF-07 ; *ENF-04 et ENF-07 : reformulées (DEC-034, validées DEC-036)*.

## Critères d'acceptation
1. **CA-1** — Sur le PC, l'utilisateur s'étant déjà connecté au moins une fois dans ce navigateur, l'application s'ouvre sans réseau, depuis son adresse web ou depuis l'application installée, et affiche les données présentes sur le PC.
2. **CA-2** — Sans réseau, l'utilisateur peut effectuer toutes les opérations du lot 1 : créer, modifier et supprimer des objectifs, sous-objectifs, tâches et sous-tâches ; terminer, rouvrir, abandonner et reprendre des tâches. Les règles de gestion s'appliquent comme avec le réseau.
3. **CA-3** — Sans réseau, l'application indique qu'elle est hors ligne et que des modifications ne sont pas encore synchronisées, de la même façon que sur le smartphone.
4. **CA-4** — Au retour du réseau, si la session Google du navigateur est active, les modifications sont enregistrées dans le Drive sans action de l'utilisateur, et celles faites entre-temps sur l'autre appareil sont intégrées. L'indication « non synchronisé » disparaît une fois l'enregistrement fait.
5. **CA-5** — *(limite F14)* Si la session Google du navigateur a expiré, l'utilisateur continue de consulter et de saisir sur les données du PC. L'application indique qu'une reconnexion est nécessaire pour la mise à jour avec l'autre appareil ; après le geste de reconnexion, les modifications en attente sont enregistrées et celles de l'autre appareil intégrées. Aucune n'est perdue.
6. **CA-6** — Aucune modification faite sans réseau n'est perdue, même si l'onglet ou le navigateur est fermé, ou le PC éteint, avant le retour du réseau (ENF-06). Elle est enregistrée dans le Drive au premier retour du réseau, application ouverte et session Google active.
7. **CA-7** — Il n'y a pas de durée maximale d'utilisation sans réseau : l'utilisation n'est jamais bloquée.
8. **CA-8** — Au retour du réseau, la règle de conflit, l'information sur les valeurs écartées et les règles de réparation s'appliquent comme sur le smartphone (RG-036, RG-047 à RG-049 ; US-017, CA-6, CA-8 et CA-10).
9. **CA-9** — Quand l'accès au compte Google est perdu (retiré ou expiré), le PC se comporte comme sans réseau (CA-2 à CA-6), et l'application propose de se reconnecter (RG-035 ; US-022, CA-7).
   - *Précision E8 (Q-US-031-1, réponse de Starck, DAT §4.1.6 bis ; sans changement de règle)* : sur le PC, un accès **expiré** est la session Google du navigateur expirée (CA-5) : l'application propose « Reprendre la synchronisation », sans bandeau. Un accès **retiré** est signalé par le bandeau « Se reconnecter » dès que l'application en a la preuve (jeton encore valide refusé, ou refus au moment de la reconnexion) ; tant qu'elle ne sait pas, elle traite la situation comme une session expirée. Point à confirmer par le test technique R2 et R11.
10. **CA-10** — *(RG-057, V-12 ; DEC-025)* Quand le PC a des modifications en attente (non encore enregistrées dans le Drive) dont la plus ancienne date de plus de 24 h, l'application affiche un bandeau de rappel **non bloquant** (`BAN-RAPPEL-24H`, titre « Modifications en attente depuis plus de 24 h ») : ces modifications ne sont encore que sur le PC. (a) **Point de départ** : les 24 h courent depuis la **plus ancienne modification en attente** ; le bandeau s'affiche quand elle a **plus de 24 h** (à 24 h exactement, ou moins, il n'apparaît pas). Un appareil hors ligne depuis plus de 24 h dont la seule modification en attente date de 1 minute n'affiche pas le bandeau. (b) **Fermeture** : le bandeau peut être fermé ; il **réapparaît à la prochaine ouverture de l'application** (lancement de l'application ou rechargement de la PWA, pas un simple retour au premier plan , confirmé par le commanditaire, DEC-026) tant que des modifications sont en attente. (c) **Accès Google perdu** (CA-9, RG-035 ; renvoi corrigé en E8, Q-US-031-3) : si des modifications sont en attente depuis plus de 24 h, **un seul** bandeau est affiché, « Se reconnecter » (`BAN-ACCES-GOOGLE`), complété de la mention « n modifications ne sont encore que sur cet appareil » ; il n'y a pas de second bandeau. Depuis moins de 24 h, il est affiché sans cette mention. (d) Le bandeau n'empêche aucune opération et peut être ignoré. Il n'apparaît pas si aucune modification n'est en attente. Il disparaît dès que les modifications sont enregistrées dans le Drive.
    - *Précisions E8* : (Q-US-018-1) le nombre de modifications et le départ des 24 h suivent US-018 CA-3 et CA-9 ; (Q-US-031-2 a, sans changement de RG-057, qui vaut « que l'appareil soit hors ligne ou non ») si la session Google du navigateur a expiré et que la plus ancienne modification en attente a plus de 24 h, le bandeau de rappel s'affiche aussi, avec l'action « Reprendre la synchronisation » (S22c).

## Cas limites et cas d'erreur
- Première ouverture de l'application sur ce PC, ou dans ce navigateur, sans réseau : impossible ; le navigateur ne peut pas afficher l'application.
- Données du navigateur effacées par l'utilisateur alors que des modifications ne sont pas encore enregistrées dans le Drive : ces modifications sont perdues ; l'application ne peut pas l'empêcher. Les données sont rechargées depuis le Drive à la connexion suivante.
- Deux onglets de l'application ouverts sur le même PC sans réseau : aucune modification n'est perdue, et les deux onglets affichent les mêmes données.
- *Précision E9 (Q-ST031-PEP-1, 2026-10-27, sans changement de règle)* : la session est celle de l'appareil. Quand l'utilisateur se déconnecte, ou supprime les données de cet appareil, dans un onglet, **l'autre onglet revient aussitôt à l'écran de connexion** et n'affiche plus aucune donnée (US-022 CA-1, CA-6 et CA-10 ; RG-019, RG-043, RG-055). Les modifications en attente sont traitées par l'action elle-même : conservées sur le PC après une déconnexion, annoncées avant une suppression, quel que soit l'onglet où elles ont été faites. Une saisie commencée dans l'autre onglet et pas encore validée n'est pas une modification enregistrée : elle n'est pas conservée (S16b, S16c). La présence d'un message dans l'onglet qui revient à la connexion relève de l'ergonomie (Steeve, non bloquant).
- *Précision E11 (RL-LOT-001-P6, 2026-10-27) — geste pendant une saisie, fenêtre de Google en panne* : si l'utilisateur fait le geste « Reprendre la synchronisation » pendant qu'une saisie est en cours et que la fenêtre de Google ne peut pas s'ouvrir (panne technique, qui obligerait à quitter la page), l'application ne quitte pas la page : elle affiche « Terminez votre saisie, puis reprenez la synchronisation. » (`TST-SAISIE-A-TERMINER`, guide v0.2.14 §6.6.6). Rien n'est perdu ni lancé ; l'indicateur reste « Reprendre la synchronisation ». Une fois la saisie terminée, un **second geste** est nécessaire : c'est la seule exception à « jamais plus d'un geste » (RG-017), limitée à cette panne technique. Non scénarisé (le banc ne simule pas la panne de la fenêtre de Google) ; couvert par les tests unitaires de la conception (UT-US-022-54).
- Navigateur en mode « navigation privée » : les données ne sont pas conservées après la fermeture ; l'usage hors ligne n'est pas garanti.
- Réseau perdu pendant une saisie : la saisie est conservée ; aucune donnée n'est enregistrée à moitié.
- Réseau intermittent : aucune modification n'est enregistrée deux fois, et aucune n'est perdue.
- Mise à jour avec l'autre appareil quand l'application est fermée : hors périmètre ; elle a lieu à la prochaine ouverture.
- Appareil hors ligne depuis plus de 24 h, mais seule modification en attente faite il y a 1 minute : pas de bandeau de rappel (CA-10 a ; S20b).
- Bandeau de rappel fermé : il réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente (CA-10 b ; S21).
- Accès Google perdu depuis plus de 24 h avec des modifications en attente : un seul bandeau « Se reconnecter », complété du nombre de modifications (CA-10 c ; S22, S22b). La session Google expirée sur PC (CA-5) reste sans bandeau tant que la plus ancienne modification en attente a 24 h ou moins ; au-delà, le bandeau de rappel s'affiche, avec l'action « Reprendre la synchronisation » (CA-10, S22c).

## Hors périmètre
- Synchronisation en arrière-plan, application fermée : **exclue** (DEC-034, Q-PWA-3 ; formulation validée, V-DEC034-6, DEC-036 ; retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST)).
- Renouvellement de la session Google sans geste de l'utilisateur après son expiration (impossible sans serveur, DEC-007).
- Utilisation sur un PC partagé sans session personnelle.

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§4.1.6), ADR-001, ADR-003, ADR-004, ADR-010. **Révisé le 2026-10-22 (DEC-034)** : DAT v0.11 (§4.1.6, §4.1.6 bis, §4.1.7, §7.4 bis), ADR-013.*

> **Révision DEC-034 (Starck, 2026-10-22).** Le PC utilise la même PWA que le téléphone (ADR-013). Deux changements le concernent. (1) **À l'ouverture, sur le PC aussi**, l'application tente une **redirection silencieuse** vers Google (`prompt=none`, une tentative par ouverture, DAT §4.1.7) si une identité est en cache, que le réseau est disponible et qu'aucun jeton n'est en mémoire. Si la session Google du navigateur est active, l'accès est renouvelé sans geste. Sinon, la redirection revient en erreur, l'application s'ouvre sur les données locales avec `SYN-SESSION`, et la demande de jeton exige un geste (« Reprendre la synchronisation »), comme avant. D'où la précondition « redirection en échec » ajoutée par Pepper à US-017 S06 et US-022 S23. Le geste reste nécessaire si le jeton expire **pendant** l'usage. (2) Les écritures IndexedDB passent en **durabilité stricte**. Les remarques liées à l'application Android (RG-058) ne valent plus qu'en repli (ADR-012).

- **Composants touchés** :
  - PWA :
    - service worker Workbox en **précache** de toute l'application, ce qui permet l'ouverture sans réseau depuis l'adresse web ou depuis l'application installée (CA-1) ;
    - invitation à mettre à jour, sans rechargement forcé pendant une saisie ;
  - `DepotLocal` IndexedDB (Dexie), **cloisonné par compte** (DEC-016) et par environnement (§7.4 bis du DAT), une transaction par cas d'usage, en **durabilité stricte**, confirmée à `complete` ;
  - `FournisseurAuth` web (le même sur tous les appareils, ADR-013) : redirection silencieuse à l'ouverture (§4.1.7, sans script tiers, fragment de retour lu puis effacé avant tout traitement), et Google Identity Services **chargé à la demande et de façon non bloquante** pour le geste. Le script de Google ne se charge pas hors ligne ; hors ligne, aucune redirection n'est tentée : l'application démarre à partir de l'identité mise en cache (R12) ;
  - `synchronisation` : déclenchée par les événements `online`, `visibilitychange` et par le geste de reconnexion (CA-4, CA-5).
- **Plusieurs onglets ouverts** (cas limite) :
  - un seul `appareilId` par profil de navigateur ;
  - **Web Locks API** (`navigator.locks`) : un seul onglet à la fois exécute le cycle de synchronisation et écrit le fichier de l'appareil dans le Drive. Sans ce verrou, deux onglets pourraient écrire chacun une version du même fichier ;
  - l'HLC est lue et avancée dans la transaction IndexedDB, donc partagée entre onglets ;
  - l'actualisation de l'affichage d'un onglet à l'autre se fait par observation de la base (`liveQuery` de Dexie, ou `BroadcastChannel`).
- **Stockage et éviction** :
  - l'application demande `navigator.storage.persist()` au premier lancement. Son état est visible dans l'écran « État de la synchronisation », et un avertissement s'affiche si le stockage n'est pas persistant ;
  - si les données du navigateur sont effacées, seules les modifications non déposées sont perdues. Le dépôt 5 s après chaque modification réduit cette fenêtre au minimum ;
  - **navigation privée** : stockage temporaire, aucune garantie. L'application la détecte si possible, sinon elle se contente de la mention dans le guide utilisateur.
- **Données** : aucune nouvelle donnée ; même modèle que sur le smartphone.
- **Accès Google** :
  - jeton d'accès d'une heure, en mémoire ;
  - à l'ouverture : redirection silencieuse, qui renouvelle l'accès sans geste si la session Google du navigateur est active (v0.11) ; en échec, ou en cours d'usage après l'expiration du jeton, une nouvelle demande de jeton exige un geste (CA-5, F14). Entre-temps, l'application continue de fonctionner ;
  - aucun renouvellement en arrière-plan, puisqu'il n'y a pas de serveur (DEC-007).
- **Sécurité** :
  - CSP stricte : seules les origines Google sont autorisées ;
  - redirection : `state` vérifié, fragment effacé avant tout traitement, `Referrer-Policy: no-referrer`, URI de redirection déclarées dans le client OAuth Web ;
  - aucun jeton dans IndexedDB ;
  - données au repos dans le profil du navigateur, lisibles par toute personne qui utilise ce profil (RG-043). Parades : l'action « Supprimer les données de cet appareil » (DEC-015) et la recommandation de ne pas utiliser un PC partagé.
- **Exigences non fonctionnelles** :
  - ouverture hors ligne de la PWA installée en moins de 2 s ;
  - action locale en moins de 100 ms ;
  - intégration à l'ouverture en moins de 10 s si la session est active ;
  - navigateurs cibles : Chrome et Edge pour ordinateur.
- **Risques** :
  - R12 : chargement du script de Google hors ligne ;
  - R15 : éviction du stockage ;
  - R3 : friction de la reconnexion, réduite par la redirection silencieuse à l'ouverture ;
  - R18 : évolution possible du flux OAuth implicite chez Google ;
  - comportement réel de `storage.persist()` pour une PWA installée, à observer pendant le test technique (§3.4) ;
  - deux onglets : traités par le verrou.
- **RG-057 (rappel après 24 h hors ligne, établie, V-12)** :
  - calcul **purement local**, sans réseau ni donnée synchronisée : le bandeau est affiché si la **plus ancienne modification en attente** (marqueur « déposé jusqu'à HLC x » en retard) date de plus de 24 h (DEC-025) ; ce sont les 24 h de la donnée présente seulement sur l'appareil qui comptent ;
  - l'instant de cette modification est déduit du journal local des modifications non déposées ; il est remis à zéro par un dépôt confirmé. Il n'est pas synchronisé et ne change pas le format Drive. Il est évalué à l'ouverture, au retour au premier plan et chaque minute tant que l'application est ouverte ; il est comparé à l'horloge de l'appareil (écart d'horloge sans conséquence grave : bandeau non bloquant) ;
  - le bandeau disparaît dès que le marqueur rejoint la dernière modification, c'est-à-dire après un dépôt confirmé par Drive ;
  - aucune limite de durée imposée à l'usage hors ligne (RG-021), aucune notification système (pas de serveur ni de tâche de fond : DEC-007) ;
  - impact : un champ local de plus, un sélecteur dans `synchronisation`, aucune migration du format Drive.
- **RG-058 (versions de l'application)** : avec la PWA unique, tous les appareils se mettent à jour par le service worker ; *en repli (APK)*, la PWA est publiée avant l'application Android. Le PC ne passe en consultation seule que si le `schemaVersion` du Drive dépasse le sien (cas rare : PC resté sur un service worker ancien). L'invitation à mettre à jour ne recharge jamais pendant une saisie.
- **ADR applicables** : ADR-001, ADR-002, ADR-003, ADR-004, ADR-010, ADR-013.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2.5](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés (partagés)** : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html), cadres H et I (PC) : session Google expirée, « Reprendre la synchronisation », deux onglets, fuseau.
- **Écrans modifiés** : pied de la barre latérale de tous les écrans PC (indicateur avec libellé toujours visible) ; [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) et [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html) pour la liste et le panneau.
- **Parcours impactés** : P-10 (reprise de session sur PC), P-09 (hors ligne, identique au smartphone).
- **Nouveaux composants** : `SyncStatus` état « Session à renouveler » (accent, un clic, sans bandeau) ; mention du verrou entre onglets dans `SyncSheet` (guide §6.4, §6.5, DAT-UX-13, DAT-UX-16).
- **Décisions d'ergonomie** :
  - hors ligne sur PC **identique au smartphone** (CA-3, DEC-013) : libellé « Hors ligne · n en attente » dans le pied de la barre latérale, point « en attente » sur les lignes, liste dans la feuille ;
  - session Google expirée (CA-5, F14) : état routinier (jeton d'une heure), donc **pas de bandeau** ; l'indicateur propose « Reprendre la synchronisation », **un clic**, et le travail continue ; fréquence à observer en recette E16 ;
  - **deux onglets** (cas limite) : les deux restent utilisables et identiques ; seul un onglet synchronise et l'autre le dit dans la feuille, sans message d'interruption ; reprise sans message si l'onglet qui synchronise est fermé ;
  - **première ouverture sans réseau** : le navigateur ne peut rien afficher, aucun écran n'est concevable ; l'information va dans le guide utilisateur (E17), ainsi que les avertissements « navigation privée » et « effacement des données du navigateur ».
- **Rappel après 24 h (CA-10, RG-057, V-12)** : même bandeau que sur smartphone (US-018), placé en tête de la colonne de contenu, avec « ce PC » ; fermable, non bloquant. Mêmes décisions que US-018 (DEC-025 : point de départ des 24 h, plus ancienne modification en attente ; accès Google perdu : un seul bandeau, celui de « Se reconnecter » ; « Masquer le rappel » réapparaît à la prochaine ouverture, Q-ERG-18 a). Maquette : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) J et L (déclinaison PC identique, non redessinée).
  - **Distinction à tenir** : la session Google expirée sur PC (CA-5) reste sans bandeau, seul le rappel de 24 h et la perte d'accès en ont un.
- **États** :
  - *vide* : voir US-022 ;
  - *chargement* : ouverture immédiate sur les données du PC ;
  - *erreur* : données du navigateur effacées (modifications non envoyées perdues, hors de notre contrôle) ;
  - *hors ligne* : comme US-018 ;
  - *synchronisation* : « Session à renouveler » → « Synchronisation… » → « À jour » ;
  - *conflit* : voir US-017.
- **Accessibilité et responsive** : le bouton de reprise est focalisable au clavier depuis la barre latérale ; boîte de dialogue de 480 px ou panneau de 400 px ; raccourcis à une touche inchangés.
- **Questions et réserves** : aucune nouvelle. À vérifier en E14 avec deux onglets hors ligne (DAT-UX-16).

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature`](../../../tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature) — **30 scénarios** dont 9 exécutés par l'interface (`@ihm`). Chaque scénario porte les tags `@US-031`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01a (adresse web, `@ihm`), S01b (application installée, `@ihm`) |
| CA-2 | S02, S03 |
| CA-3 | S04 |
| CA-4 | S05 |
| CA-5 | S06, S07 |
| CA-6 | S08 (`@ihm`) |
| CA-7 | S09 |
| CA-8 | S10, S11, S12 |
| CA-9 | S13 |
| CA-10 (RG-057) | S19, S19b (plus ancienne modification en attente), S20 (24 h exactement, avant 24 h, aucune modification), S20b (hors ligne depuis 25 h, modification faite il y a 1 min), S21 (disparition à l'enregistrement), S21b (fermé puis rouvert), S22, S22b (accès Google perdu : un seul bandeau, avec ou sans mention), S22c (session expirée depuis plus de 24 h : rappel avec « Reprendre la synchronisation ») |
| Cas limite : première ouverture sans réseau | S14 (`@ihm` ; résultat observable confirmé en E8, Q-US-031-4 : la navigation hors ligne échoue, aucun élément de l'application n'est affiché, la page courante est la page d'erreur du navigateur) |
| Cas limite : données du navigateur effacées | S15 (`@ihm`) |
| Cas limite : deux onglets | S16 (`@ihm`) ; fin de session dans un autre onglet : S16b (déconnexion), S16c (suppression des données) (`@ihm`, Q-ST031-PEP-1) |
| Cas limite : navigation privée | **Non scénarisé** : le critère n'énonce qu'une absence de garantie, sans comportement vérifiable ; information portée par le guide utilisateur |
| Cas limite : réseau perdu pendant une saisie | S17 (`@ihm` ; saisie en cours décrite en étapes successives) |
| Cas limite : réseau intermittent | S18 |
| Cas limite : mise à jour application fermée | US-017 S04 |

## Questions ouvertes
Aucune. V-DEC034-2, 4, 6 validées le 2026-10-22 (DEC-036).

*Antérieurement* : tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.2 : US conditionnelle au backlog (Q-DEM001-39). |
| 2026-10-21 | Intégration à LOT-001 par décision du commanditaire (Q-DEM001-39 b, DEC-013). Fichier détaillé créé (Pepper, v0.5). |
| 2026-10-21 | V-12 retenue (DEC-018) : nouveau CA-10 (bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente, RG-057) et CA-7 précisé ; scénarios S19 et S20. |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : ANT-5 et ANT-6 (tag `@ihm` sur S01a, S01b, S08, S14, S15, S16, S17 ; S01 scindé ; résultat observable de S14 ; S17 reformulé en étapes successives), ANT-16 (convention de date des tâches de contexte : glossaire d'étapes), assertions de bandeaux, mentions et indicateur exprimées par les codes du catalogue (`SYN-`, `MEN-`, `BAN-`), PEP-8. RG-057 et les scénarios S19 et S20 sont inchangés dans l'attente des réponses Q-ERG-16 à 18. |
| 2026-10-21 | E7, tour 2 du refinement (Pepper) : DEC-025 intégrée à RG-057 et au CA-10 (24 h depuis la plus ancienne modification en attente ; accès perdu : un seul bandeau « Se reconnecter » complété ; bandeau fermé réapparaissant à la prochaine ouverture). Scénarios S19 et S20 réécrits avec `BAN-RAPPEL-24H` ; nouveaux S19b, S20b, S21, S21b, S22, S22b (le S19 d'origine est scindé : la disparition du bandeau est dans S21). |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-031-1 (réponse de Starck reflétée dans CA-9 : accès expiré = session expirée sur le PC), Q-US-031-2 (option a : rappel après 24 h aussi en session expirée, avec « Reprendre la synchronisation » ; S22c ajouté), Q-US-031-3 (renvoi de CA-10 c corrigé vers CA-9), Q-US-031-4 (formes au glossaire v1.2 ; sens observable de S14 confirmé, ANT-23), Q-US-018-1 (décompte), Q-US-017-7 (préfixes d'appareil, S10 et S11), Q-US-022-1 (forme unique « est affiché, avec l'action », S22 et S22b). Précisions sans changement de règle. |
| 2026-10-22 | Révision de forme DEC-034 (Pepper), proposée (V-DEC034) : analyse d'écart, règles citées (RG-017, ENF-04, ENF-07 proposées), synchronisation en arrière-plan exclue, note à Starck. Critères et scénarios inchangés. |
| 2026-10-22 | Révision de forme DEC-034 **validée** (DEC-036, « Tout reco ») ; retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST). |
| 2026-10-27 | E9 (Pepper), réponse à Q-ST031-PEP-1 d'Anthony : fin de session dans un autre onglet (déconnexion, suppression des données) : l'autre onglet revient à l'écran de connexion ; conséquence de US-022 CA-1, CA-6, CA-10 et de RG-019, RG-043, RG-055, **sans changement de règle** ; cas limite précisé, scénarios S16b et S16c ajoutés (30 scénarios). |
| 2026-10-27 | Suites de l'E11 (Pepper), RL-LOT-001-P6 : cas limite « geste pendant une saisie, fenêtre de Google en panne » (`TST-SAISIE-A-TERMINER`, second geste après la saisie). Exception à « jamais plus d'un geste » limitée à cette panne technique, signalée à Jarvis. Scénarios inchangés. |
