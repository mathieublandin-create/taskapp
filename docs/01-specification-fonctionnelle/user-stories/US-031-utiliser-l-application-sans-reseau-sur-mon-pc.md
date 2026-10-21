# US-031 — Utiliser l'application sans réseau sur mon PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon PC sans réseau, mes modifications étant prises en compte au retour du réseau, **afin d'**avoir le même comportement sur mes deux appareils.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau dans le lot** : US conditionnelle depuis la v0.2. Le commanditaire a retenu l'option b) de Q-DEM001-39 : le PC est utilisable hors ligne dès LOT-001 (DEC-013), comme le recommandait l'architecte.
- **Transposition de US-018** : mêmes règles que sur le smartphone (RG-021, RG-035, RG-036, RG-047 à RG-049).
- **Spécificités du PC** :
  - l'application s'utilise depuis une adresse web et peut être installée comme une application (ENF-07, DEC-006) ;
  - pour l'ouvrir sans réseau, il faut l'avoir ouverte au moins une fois avec le réseau, sur ce PC et dans ce navigateur ;
  - limite F14 : quand la session Google du navigateur a expiré, la mise à jour avec l'autre appareil attend un geste de reconnexion ; l'utilisation sur les données du PC continue ;
  - les données du PC sont conservées par le navigateur : si l'utilisateur efface les données de son navigateur, il efface aussi celles de l'application sur ce PC.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-057 : bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente.
- RG-021 : consultation et saisie sans réseau, sur le smartphone et sur le PC ; prise en compte au retour du réseau.
- RG-035 : la perte de l'accès Google se comporte comme une coupure de réseau.
- RG-017 : exception du PC quand la session Google du navigateur a expiré (F14).
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-047 à RG-049 : réparations après fusion.
- RG-019 : la première connexion nécessite le compte Google, donc le réseau.
- ENF-04, ENF-06 (validée), ENF-07.

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
10. **CA-10** — *(RG-057, V-12)* Quand le PC est hors ligne depuis plus de 24 h avec des modifications en attente (non encore enregistrées dans le Drive), l'application affiche un bandeau de rappel **non bloquant**, comme sur le smartphone (US-018, CA-9) : ces modifications ne sont encore que sur le PC. Le bandeau n'empêche aucune opération et peut être ignoré. Il n'apparaît pas avant 24 h, ni si aucune modification n'est en attente. Il disparaît dès que les modifications sont enregistrées dans le Drive.

## Cas limites et cas d'erreur
- Première ouverture de l'application sur ce PC, ou dans ce navigateur, sans réseau : impossible ; le navigateur ne peut pas afficher l'application.
- Données du navigateur effacées par l'utilisateur alors que des modifications ne sont pas encore enregistrées dans le Drive : ces modifications sont perdues ; l'application ne peut pas l'empêcher. Les données sont rechargées depuis le Drive à la connexion suivante.
- Deux onglets de l'application ouverts sur le même PC sans réseau : aucune modification n'est perdue, et les deux onglets affichent les mêmes données.
- Navigateur en mode « navigation privée » : les données ne sont pas conservées après la fermeture ; l'usage hors ligne n'est pas garanti.
- Réseau perdu pendant une saisie : la saisie est conservée ; aucune donnée n'est enregistrée à moitié.
- Réseau intermittent : aucune modification n'est enregistrée deux fois, et aucune n'est perdue.
- Mise à jour avec l'autre appareil quand l'application est fermée : hors périmètre ; elle a lieu à la prochaine ouverture.

## Hors périmètre
- Synchronisation en arrière-plan, application fermée.
- Renouvellement de la session Google sans geste de l'utilisateur après son expiration (impossible sans serveur, DEC-007).
- Utilisation sur un PC partagé sans session personnelle.

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§4.1.6), ADR-001, ADR-003, ADR-004, ADR-010.*

- **Composants touchés** :
  - PWA :
    - service worker Workbox en **précache** de toute l'application, ce qui permet l'ouverture sans réseau depuis l'adresse web ou depuis l'application installée (CA-1) ;
    - invitation à mettre à jour, sans rechargement forcé pendant une saisie ;
  - `DepotLocal` IndexedDB (Dexie), **cloisonné par compte** (DEC-016), une transaction par cas d'usage ;
  - `FournisseurAuth` web : Google Identity Services **chargé à la demande et de façon non bloquante**. Le script de Google ne se charge pas hors ligne : l'application démarre à partir de l'identité mise en cache (R12) ;
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
  - une fois la session Google du navigateur expirée, une nouvelle demande de jeton exige un geste de l'utilisateur (CA-5, F14). Entre-temps, l'application continue de fonctionner ;
  - aucun renouvellement en arrière-plan, puisqu'il n'y a pas de serveur (DEC-007).
- **Sécurité** :
  - CSP stricte : seules les origines Google sont autorisées ;
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
  - R3 : friction de la reconnexion ;
  - comportement réel de `storage.persist()` pour une PWA installée, à observer pendant le test technique (§3.4) ;
  - deux onglets : traités par le verrou.
- **RG-057 (rappel après 24 h hors ligne, établie, V-12)** :
  - calcul **purement local**, sans réseau ni donnée synchronisée : la condition est « modifications en attente (marqueur « déposé jusqu'à HLC x » en retard) ET dernier contact réussi avec Drive vieux de plus de 24 h » ;
  - la référence est un instant local `dernierContactDrive`, persisté dans le dépôt local à chaque lecture ou dépôt réussi. Il est évalué à l'ouverture, au retour au premier plan et par une temporisation d'une minute pendant que l'application est ouverte ; il est comparé à l'horloge de l'appareil (écart d'horloge sans conséquence grave : bandeau non bloquant) ;
  - le bandeau disparaît dès que le marqueur rejoint la dernière modification, c'est-à-dire après un dépôt confirmé par Drive ;
  - aucune limite de durée imposée à l'usage hors ligne (RG-021), aucune notification système (pas de serveur ni de tâche de fond : DEC-007) ;
  - impact : un champ local de plus, un sélecteur dans `synchronisation`, aucune migration du format Drive.
- **RG-058 (versions de l'application)** : la PWA est publiée avant l'application Android. Le PC ne passe en consultation seule que si le `schemaVersion` du Drive dépasse le sien (cas rare : PC resté sur un service worker ancien). L'invitation à mettre à jour ne recharge jamais pendant une saisie.
- **ADR applicables** : ADR-001, ADR-002, ADR-003, ADR-004, ADR-010.

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
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature`](../../../tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature) — **21 scénarios** dont 7 exécutés par l'interface (`@ihm`). Chaque scénario porte les tags `@US-031`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

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
| CA-10 (RG-057) | S19, S20 |
| Cas limite : première ouverture sans réseau | S14 (`@ihm` ; résultat observable : aucun écran de Done Juan, message d'indisponibilité du navigateur) |
| Cas limite : données du navigateur effacées | S15 (`@ihm`) |
| Cas limite : deux onglets | S16 (`@ihm`) |
| Cas limite : navigation privée | **Non scénarisé** : le critère n'énonce qu'une absence de garantie, sans comportement vérifiable ; information portée par le guide utilisateur |
| Cas limite : réseau perdu pendant une saisie | S17 (`@ihm` ; saisie en cours décrite en étapes successives) |
| Cas limite : réseau intermittent | S18 |
| Cas limite : mise à jour application fermée | US-017 S04 |

## Questions ouvertes
Aucune. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.2 : US conditionnelle au backlog (Q-DEM001-39). |
| 2026-10-21 | Intégration à LOT-001 par décision du commanditaire (Q-DEM001-39 b, DEC-013). Fichier détaillé créé (Pepper, v0.5). |
| 2026-10-21 | V-12 retenue (DEC-018) : nouveau CA-10 (bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente, RG-057) et CA-7 précisé ; scénarios S19 et S20. |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : ANT-5 et ANT-6 (tag `@ihm` sur S01a, S01b, S08, S14, S15, S16, S17 ; S01 scindé ; résultat observable de S14 ; S17 reformulé en étapes successives), ANT-16 (convention de date des tâches de contexte : glossaire d'étapes), assertions de bandeaux, mentions et indicateur exprimées par les codes du catalogue (`SYN-`, `MEN-`, `BAN-`), PEP-8. RG-057 et les scénarios S19 et S20 sont inchangés dans l'attente des réponses Q-ERG-16 à 18. |
