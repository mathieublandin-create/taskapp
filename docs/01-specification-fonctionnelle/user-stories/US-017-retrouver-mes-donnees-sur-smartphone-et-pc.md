# US-017 — Retrouver mes données sur smartphone et sur PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** que mes données soient conservées dans mon espace de stockage personnel et que je les retrouve sur mon smartphone comme sur mon PC, **afin de** passer de l'un à l'autre sans ressaisie.

> Les marqueurs (P) (propositions de Pepper) ont été retirés : tous les critères sont validés par le commanditaire (DEC-018, 2026-10-21).

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - le sens de « données décentralisées » est tranché : les données sont dans le Google Drive du compte de connexion (Q-DEM001-3 b, 22.1 a), dans un dossier visible (DEC-009) ;
  - smartphone Android et PC sont exigés dès la première version (complément Q-DEM001-1 j ; DEC-001) ;
  - délai d'une heure (complément ; Q-DEM001-21.1 a, confirmée par Q-DEM001-41, DEC-014) et affichage immédiat à l'ouverture (Q-DEM001-21.2) ;
  - règle de conflit appliquée information par information, avec information sur la valeur écartée (Q-DEM001-23).
- **Limites signalées par l'architecte** (DAT §8), conséquences de la décision « aucun serveur » (DEC-007) :
  - F1 : un appareil éteint ou fermé ne peut rien afficher ; le délai d'une heure ne vaut que si l'appareil destinataire est ouvert et connecté ;
  - F14 : sur PC, si la session Google du navigateur a expiré, un geste de reconnexion précède la mise à jour.
- **Nouveau en v0.4** : restauration ou remise à zéro si les données sont supprimées hors de l'application (RG-044) ; règles de réparation après fusion (RG-047 à RG-049, proposées, F12).
- **Décisions D1 (DEC-002) et Q-39 b) (DEC-013)** : le hors ligne du smartphone (US-018) et celui du PC (US-031) entrent dans LOT-001. Le CA-7 retient la variante « hors ligne inclus » (F13).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-017 : smartphone et PC dès la première version, mêmes données, délai d'une heure (formulation F1 et F14).
- RG-018 : utilisateur unique, données non partagées.
- RG-020 : données conservées dans le Google Drive du compte de connexion.
- RG-021, RG-035 : sans réseau ou sans accès Google, saisies conservées puis enregistrées (CA-7).
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-044 : données supprimées ou illisibles dans le Drive : restaurer ou repartir de zéro.
- RG-047, RG-048, RG-049 : réparations après fusion.
- RG-008, RG-053 : journée et horaires dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris ».
- ENF-01, ENF-02, ENF-04, ENF-06 (validée), ENF-07.

## Critères d'acceptation
1. **CA-1** — L'application est utilisable sur un smartphone Android et sur un PC, avec un affichage adapté à chacun (ENF-01). Toutes les fonctions du lot 1 sont disponibles sur les deux appareils.
2. **CA-2** — Les deux appareils étant ouverts et connectés au réseau, un objectif ou une tâche créé, modifié ou supprimé sur l'un est visible sur l'autre **au plus tard une heure après**, sans action de l'utilisateur (RG-017 ; DEC-014). Ce délai ne porte que sur les données : il ne s'applique pas à la détection d'un créneau déplacé dans Google Calendar (lot « Agenda », RG-037). Si l'autre appareil est fermé ou éteint, la modification y est visible dès son ouverture (CA-3).
3. **CA-3** — À l'ouverture de l'application sur un appareil connecté :
   - les données présentes sur l'appareil s'affichent aussitôt ;
   - les modifications faites sur l'autre appareil et déjà enregistrées dans le Drive y sont intégrées **sans attendre le délai d'une heure**, au plus tard **une minute** après l'ouverture **(P : valeur à valider)** ;
   - **exception sur PC** : si la session Google du navigateur a expiré, l'application affiche les données présentes sur le PC, reste utilisable et indique qu'une reconnexion est nécessaire pour la mise à jour. L'intégration a lieu après le geste de reconnexion de l'utilisateur (F14).
4. **CA-4** — Toutes les données de l'application sont conservées dans le Drive de l'utilisateur (RG-020). L'application n'en conserve aucune copie ailleurs que dans ce Drive et sur les appareils de l'utilisateur (DEC-007).
5. **CA-5** — Après fermeture et réouverture de l'application, sur le même appareil ou sur l'autre, les données sont identiques à celles enregistrées.
6. **CA-6** — Quand la **même information** d'un élément a été modifiée sur les deux appareils avant qu'ils n'aient échangé leurs modifications, la modification la plus récente l'emporte. Quand des **informations différentes** du même élément ont été modifiées, toutes les modifications sont conservées (RG-036).
   - Exemple : sur le PC, l'intitulé d'une tâche devient « Rédiger le plan » ; ensuite, sur le smartphone, avant tout échange, son délai passe au 15 novembre. Après échange, la tâche a l'intitulé « Rédiger le plan » et le délai du 15 novembre, sur les deux appareils.
7. **CA-7** — *(variante « hors ligne inclus », retenue par DEC-002)* Sans réseau, l'utilisateur continue de consulter et de saisir. Ses saisies sont conservées sur l'appareil, signalées comme non synchronisées, puis enregistrées dans son Drive au retour du réseau, sans action de sa part ; aucune n'est perdue (ENF-06). Le fonctionnement détaillé sans réseau (ouverture sans réseau, indicateurs) est décrit par US-018 pour le smartphone et par US-031 pour le PC (DEC-013). La même règle s'applique pendant une perte de l'accès Google (RG-035).
8. **CA-8** — Quand une valeur saisie sur un appareil est écartée par une modification concurrente faite sur l'autre (CA-6), l'utilisateur en est informé : élément concerné, information, valeur non retenue (RG-036). Une valeur remplacée plus tard, en connaissance de cause, n'est pas signalée.
   - Exemple signalé : intitulé « A » saisi sur le PC, puis intitulé « B » saisi sur le smartphone sans réseau, avant d'avoir reçu « A » ; « B » l'emporte, et « A » est signalé comme valeur écartée.
   - Exemple non signalé : le smartphone reçoit « A », puis l'utilisateur le remplace par « B ».
9. **CA-9** — Si les données de l'application sont absentes ou illisibles dans le Drive alors que l'appareil en détient une copie, l'application avertit l'utilisateur et lui propose (RG-044) :
   - **restaurer** ses données à partir de la copie de l'appareil : elles sont de nouveau présentes dans le Drive et sur les deux appareils ;
   - **repartir de zéro** *(proposé, à valider en E6)* : après une confirmation, les données sont effacées de l'appareil ; à sa prochaine synchronisation, l'autre appareil efface aussi les siennes, sans reposer la question. S'il détenait des modifications pas encore enregistrées, l'utilisateur en est informé (valeurs écartées).
   - Tant que l'utilisateur n'a pas choisi, rien n'est effacé et rien n'est réécrit dans le Drive.
10. **CA-10** — *(règles proposées, à valider en E6)* Après l'échange des modifications des deux appareils, l'application applique les règles de réparation :
    - suppression d'un côté, modification de l'autre : la suppression l'emporte, et les modifications écartées sont signalées (RG-047 ; détail dans US-001, US-002, US-024) ;
    - hiérarchie d'objectifs invalide : le déplacement le plus ancien est annulé et signalé (RG-048 ; détail dans US-023) ;
    - incohérence d'état entre une tâche et ses sous-tâches : elle est signalée, sans correction automatique (RG-049 ; détail dans US-003, US-024, US-025).
11. **CA-11** — *(RG-054)* Quand l'appareil est réglé sur un autre fuseau horaire que celui de Paris, l'application signale que les horaires et la journée « aujourd'hui » qu'elle affiche sont à l'heure de Paris (mention « heure de Paris »). Quand l'appareil est à l'heure de Paris, cette mention n'apparaît pas.

## Cas limites et cas d'erreur
- Drive plein : l'utilisateur est averti que ses modifications ne peuvent pas être enregistrées dans son Drive ; elles restent conservées sur l'appareil et rien n'est perdu sans avertissement.
- Les deux appareils dans des fuseaux horaires différents, ou l'utilisateur en voyage : la date de fin, la date d'abandon et l'indication « en retard » sont déterminées dans le fuseau de Paris (RG-008, RG-053, DEC-012) ; elles sont donc identiques sur les deux appareils, mais peuvent ne pas correspondre à la date locale du lieu où se trouve l'utilisateur. Les délais, dates sans heure, ne changent jamais de jour (RG-053).
- Horloge de l'un des appareils déréglée de plusieurs minutes : la modification réellement la plus récente l'emporte quand même. Si l'écart dépasse 24 h, l'application avertit l'utilisateur.
- Les deux appareils n'ont pas la même version de l'application : l'appareil dont la version est la plus ancienne invite l'utilisateur à la mettre à jour avant de permettre la saisie **(P, comportement à confirmer par l'architecte en E3)**.
- Modification faite directement dans les fichiers du Drive, qui les laisse lisibles : *point à préciser par l'architecte en E3* (cas non couvert par RG-044, qui ne vise que les données absentes ou illisibles).

## Hors périmètre
- Fonctionnement détaillé sans réseau sur le smartphone (US-018) et sur le PC (US-031).
- Mise à jour des données quand l'application est fermée (synchronisation en arrière-plan, lot ultérieur).
- Partage avec d'autres personnes (exclu, RG-018).
- Export ou import de données.
- Application pour iPhone (exclue en v1, DEC-001).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-003, ADR-010, ADR-011.*

- **Composants touchés** :
  - contexte `synchronisation` :
    - moteur CRDT par champ, avec l'HLC corrigée de l'écart avec l'heure Google ;
    - cycle de synchronisation : au démarrage, au retour au premier plan, 5 s après une modification, toutes les 2 min, au retour du réseau ;
    - passe de réparation après fusion ;
    - journal des valeurs écartées ;
    - détection et traitement de RG-044 ;
  - ports `TransportSynchro` (Drive : `files.list`, `files.get`, `files.update`, `changes.list`), `DepotLocal` et `Horloge` (expose `FUSEAU_REFERENCE` = Europe/Paris et, pour l'affichage seulement, le fuseau de l'appareil : RG-054).
- **Données** :
  - `appareils/<appareilId>.etat.json.gz` : chaque appareil écrit son seul fichier ;
  - `manifeste.json`, qui contient `schemaVersion`, `generation` (identifiant de la génération des données, utilisé par RG-044 b) et la date de création ;
  - **chaque fichier porte une empreinte SHA-256 de son contenu**. Si l'empreinte ne correspond pas, le fichier est considéré comme illisible et traité par RG-044.
  - **Réponse au cas limite « fichiers du Drive modifiés mais restés lisibles »** : une modification manuelle invalide l'empreinte. Le fichier est alors traité comme illisible (avertissement, puis restaurer ou repartir de zéro), et n'est jamais fusionné. Je recommande d'étendre RG-044 à ce cas.
  - **Réponse au cas limite « versions différentes »** :
    - seule une différence de **version de schéma** gêne : l'appareil dont le schéma est le plus ancien passe en lecture seule et invite à mettre l'application à jour ;
    - deux versions de l'application qui partagent le même schéma coexistent sans restriction ;
    - le comportement « bloquer la saisie dès que la version de l'application diffère » est déconseillé, car il bloquerait le PC à chaque publication de la PWA avant l'application Android.
- **RG-044** :
  - **restaurer** : l'appareil réécrit son fichier et le manifeste ;
  - **repartir de zéro** (b, proposée) : l'appareil crée un nouveau manifeste avec une nouvelle `generation` ;
  - l'autre appareil constate que sa `generation` locale est différente de celle du Drive. Il signale alors ses modifications non déposées comme valeurs écartées, efface ses données locales du compte, puis relit le Drive, sans reposer la question ;
  - une erreur transitoire (réseau, `5xx`, `429`) n'est **jamais** interprétée comme une absence de données. Seuls un dossier ou un fichier mis à la corbeille ou introuvable (`404`), ou un fichier invalide, déclenchent l'avertissement.
- **Accès Google** : Drive seulement (`drive.file`). Erreurs gérées :
  - `403 storageQuotaExceeded` (Drive plein) : avertissement, et les données restent sur l'appareil ;
  - `429` et `5xx` : nouvelle tentative avec attente exponentielle ;
  - `401` : un renouvellement, puis l'état « accès perdu ».
- **Sécurité** :
  - validation de schéma (Zod) et vérification de l'empreinte de chaque fichier lu ;
  - un fichier invalide n'écrase jamais l'état local ;
  - aucune donnée hors du Drive et des appareils (CA-4).
- **Exigences non fonctionnelles** :
  - CA-2 : moins de 5 min quand les deux appareils sont ouverts ;
  - CA-3 : intégration à l'ouverture en moins de 10 s, ce qui respecte la limite d'une minute proposée par Pepper ;
  - état de moins de 5 Mo non compressé ;
  - convergence garantie : fusion commutative, associative et idempotente, vérifiée par des tests de propriétés.
- **Risques** :
  - R1 : visibilité de `drive.file` entre le client Android et le client web (test technique préalable) ;
  - R4 : horloge déréglée ;
  - R5 : versions de schéma ;
  - R6 : modifications manuelles dans le Drive ;
  - R14 : correction de la fusion et de la réparation ; la parade est une couverture par tests de propriétés et un banc Cucumber à deux appareils.
- **Règles proposées dont dépend l'architecture** :
  - RG-044 b : mécanisme de `generation`, inutile si la règle est rejetée ;
  - RG-047 à RG-049 : la passe de réparation. **Une règle déterministe de réparation des hiérarchies (RG-048) est techniquement indispensable**, quelle que soit sa formulation ;
  - RG-054 : affichage seulement.
- **ADR applicables** : ADR-002, ADR-003, ADR-009, ADR-010, ADR-011.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés** : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html), feuille « Compte et synchronisation » : huit états de l'indicateur, modifications en attente, modifications non retenues (valeurs écartées, suppression qui l'emporte, déplacement annulé), accès Google perdu, données absentes du Drive (restaurer ou repartir de zéro), Drive plein, horloge déréglée, version trop ancienne, choix « repartir de zéro » fait sur l'autre appareil, session expirée sur PC, verrou entre onglets, fuseau.
- **Écrans modifiés** : [ECR-001](../../02-ux/maquettes/ECR-001-aujourdhui.html), [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html), [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html), [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html), [ECR-008](../../02-ux/maquettes/ECR-008-liste-objectifs.html) : indicateur de synchronisation en en-tête (smartphone) et en pied de barre latérale (PC) ; mention « Heure de Paris ». Le premier chargement des données est porté par [ECR-010](../../02-ux/maquettes/ECR-010-connexion.html).
- **Parcours impactés** : P-01 (étapes hors ligne), P-07 (premier chargement), P-09 (hors ligne et modifications non retenues), P-10 (reprise de session sur PC), P-11 (restaurer ou repartir de zéro), P-12.
- **Nouveaux composants** : `SyncStatus` à huit états (dont « informations à lire », point accent), `SyncSheet`, `DiscardedItem`, `OptionCard`, `InconsistencyCard` (côté US-003, 024, 025), `ParisTimeNote` (guide §4.8, §4.21, §4.23 à §4.26).
- **Décisions d'ergonomie** :
  - un seul endroit pour la synchronisation et le compte, ouvert par l'indicateur ou l'avatar ;
  - l'indicateur n'affiche que le plus grave des états ; seul « Action requise » interrompt, et seulement l'accès Google perdu est un bandeau (P8) ;
  - **valeurs écartées** (CA-8, RG-036, Q-DEM001-23.2) : élément, information, valeur non retenue et valeur conservée, avec « Compris » ; signalées par un point accent, un toast à l'ouverture et la liste de la feuille ; une valeur remplacée en connaissance de cause n'est jamais signalée ;
  - **RG-047, RG-048** (CA-10) : mêmes éléments `DiscardedItem` pour une suppression qui l'emporte et pour un déplacement annulé ;
  - **RG-049** : signalée sur l'élément, sans correction (voir US-003, 024, 025) ;
  - **RG-044** (CA-9) : exception à « alerter sans bloquer », car le choix engage les données ; « Restaurer » est l'action principale, « Repartir de zéro… » est secondaire avec confirmation ; « Décider plus tard » laisse l'application utilisable ; rien n'est effacé ni réécrit avant le choix ;
  - **mention « Heure de Paris »** (CA-11, RG-054) : forme définie au guide §4.21 (puce, quand le fuseau de l'appareil diffère, explication à l'appui) ;
  - le délai d'une heure ne se voit pas : l'indicateur affiche l'heure du dernier échange.
- **États** :
  - *vide* : section « Modifications non retenues » absente quand il n'y a rien à lire ;
  - *chargement* : « Synchronisation… » discrète ; les données de l'appareil s'affichent aussitôt (CA-3) ;
  - *erreur* : Drive plein, horloge, version, données absentes ;
  - *hors ligne* : voir US-018 et US-031 ;
  - *synchronisation* : huit états ;
  - *conflit* : `DiscardedItem` (trois formes).
- **Accessibilité et responsive** : changements d'état annoncés `role="status"` ; « Synchroniser maintenant » désactivé reste focalisable avec son explication ; feuille haute sur smartphone, boîte de dialogue ou panneau sur PC.
- **Questions et réserves** : Q-ERG-14 (durée de conservation des modifications non retenues ; proposition : jusqu'à « Compris »). Les critères (P) de CA-3, CA-9 et CA-11 attendent la validation de E6 ; les maquettes les appliquent.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature`](../../../tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature) — **30 scénarios, dont 0 tagué `@propose`** (les règles et critères proposés ont été validés le 2026-10-21, DEC-018 ; le tag est retiré). Chaque scénario porte les tags `@US-017`, `@RG-xxx` et `@LOT-001`.

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01 |
| CA-2 | S02, S03, S04 |
| CA-3 | S04, S05, S06 |
| CA-4 | S07 |
| CA-5 | S08 |
| CA-6 | S09, S10 |
| CA-7 | S17 ; détail : US-018, US-031 |
| CA-8 | S10, S11 |
| CA-9 (RG-044) | S18, S19, S20, S21, S22, S23 |
| CA-10 (RG-047 à RG-049) | S24, S25, S26 ; détail (tous P) : US-001 S19-S20, US-002 S23, US-023 S16-S19, US-024 S20-S22, US-003 S18-S19, US-025 S15-S16 |
| CA-11 (RG-054) | S27 ; US-003 S21 |
| RG-056 (modifications non retenues, point « à lire ») | S14, S15, S16 |
| Cas limite : Drive plein | S29 |
| Cas limite : fuseaux différents sur les deux appareils, voyage | S28 |
| Cas limite : horloge déréglée (quelques minutes ; plus de 24 h) | S12, S13 |
| Cas limite : versions différentes | S30 (voir point d'arbitrage ci-dessous) |
| Cas limite : fichiers du Drive modifiés mais restés lisibles | **Non couvert** : en attente d'arbitrage (voir ci-dessous) |
| Session Google expirée sur PC (F14) | S06 ; US-031 S06, S07 ; US-022 S23 |

**Points d'arbitrage relevés en E5** :
- *Versions différentes* : le cas limite (P) de l'US prévoit de bloquer la saisie dès que la version de l'application diffère ; l'architecte (E3) recommande de ne bloquer que si le format des données diffère. S30 ne couvre que le terrain commun (format plus récent illisible : invitation à mettre à jour, sans perte). La formulation du cas limite est à trancher en E6.
- *Fichiers du Drive modifiés mais restés lisibles* : l'architecte recommande d'étendre RG-044 à ce cas. Cela modifierait une règle établie : à soumettre au commanditaire en E6. Aucun scénario n'est rédigé tant que la décision n'est pas prise.

## Questions ouvertes
Aucune. Q-DEM001-41 (DEC-014) et Q-DEM001-39 (DEC-013) ont été répondues le 2026-10-21. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-3 et 4 et les compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-21, 22 et 23 intégrées (CA-2, CA-3, CA-6, CA-8, CA-9) ; limites F1 et F14 de l'architecte (CA-2, CA-3) ; règles de réparation proposées F12 (CA-10) ; CA-7 remplacé par la variante « hors ligne inclus » (F13, DEC-002) ; mention « heure de Paris » proposée (RG-054, CA-11) ; DEC-001 (Android), DEC-007 (aucun serveur), DEC-009 (dossier visible), DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | v0.5 (Pepper) : Q-DEM001-41 confirmée (DEC-014, CA-2) ; hors ligne du PC dans le lot (DEC-013, CA-7 renvoie à US-031). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
