# US-017 — Retrouver mes données sur smartphone et sur PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** que mes données soient conservées dans mon espace de stockage personnel et que je les retrouve sur mon smartphone comme sur mon PC, **afin de** passer de l'un à l'autre sans ressaisie.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - le sens de « données décentralisées » est tranché : les données sont dans le Google Drive du compte de connexion (Q-DEM001-3 b, 22.1 a), dans un dossier visible (DEC-009) ;
  - smartphone Android et PC sont exigés dès la première version (complément Q-DEM001-1 j ; DEC-001) ;
  - délai d'une heure (complément ; Q-DEM001-21.1 a, confirmée par Q-DEM001-41, DEC-014) et affichage immédiat à l'ouverture (Q-DEM001-21.2) ;
  - règle de conflit appliquée information par information, avec information sur la valeur écartée (Q-DEM001-23).
- **Limites signalées par l'architecte** (DAT §8), conséquences de la décision « aucun serveur » (DEC-007) :
  - F1 : un appareil éteint ou fermé ne peut rien afficher ; le délai d'une heure ne vaut que si l'appareil destinataire est ouvert et connecté ;
  - F14 : sur PC, si la session Google du navigateur a expiré, un geste de reconnexion précède la mise à jour.
- **Nouveau en v0.4** : restauration ou remise à zéro si les données sont supprimées hors de l'application (RG-044) ; règles de réparation après fusion (RG-047 à RG-049, F12) ; fichiers du Drive modifiés à la main, traités comme illisibles (extension de RG-044, V-02) ; compatibilité entre versions de l'application (RG-058, V-06 option 2).
- **Décisions D1 (DEC-002) et Q-39 b) (DEC-013)** : le hors ligne du smartphone (US-018) et celui du PC (US-031) entrent dans LOT-001. Le CA-7 retient la variante « hors ligne inclus » (F13).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-017 : smartphone et PC dès la première version, mêmes données, délai d'une heure (formulation F1 et F14).
- RG-018 : utilisateur unique, données non partagées.
- RG-020 : données conservées dans le Google Drive du compte de connexion.
- RG-021, RG-035 : sans réseau ou sans accès Google, saisies conservées puis enregistrées (CA-7).
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-044 : données supprimées, illisibles ou modifiées à la main dans le Drive : restaurer ou repartir de zéro.
- RG-058 : versions différentes de l'application ; saisie bloquée seulement si le format des données diffère.
- RG-056 : liste « Modifications non retenues » (signalement « à lire », lecture partagée, signalement unique).
- RG-047, RG-048, RG-049 : réparations après fusion.
- RG-008, RG-053 : journée et horaires dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris ».
- ENF-01, ENF-02, ENF-04, ENF-06 (validée), ENF-07.

## Critères d'acceptation
1. **CA-1** — L'application est utilisable sur un smartphone Android et sur un PC, avec un affichage adapté à chacun (ENF-01). Toutes les fonctions du lot 1 sont disponibles sur les deux appareils.
2. **CA-2** — Les deux appareils étant ouverts et connectés au réseau, un objectif ou une tâche créé, modifié ou supprimé sur l'un est visible sur l'autre **au plus tard une heure après**, sans action de l'utilisateur (RG-017 ; DEC-014). Ce délai ne porte que sur les données : il ne s'applique pas à la détection d'un créneau déplacé dans Google Calendar (lot « Agenda », RG-037). Si l'autre appareil est fermé ou éteint, la modification y est visible dès son ouverture (CA-3).
3. **CA-3** — À l'ouverture de l'application sur un appareil connecté :
   - les données présentes sur l'appareil s'affichent aussitôt ;
   - les modifications faites sur l'autre appareil et déjà enregistrées dans le Drive y sont intégrées **sans attendre le délai d'une heure**, au plus tard **une minute** après l'ouverture ;
   - **exception sur PC** : si la session Google du navigateur a expiré, l'application affiche les données présentes sur le PC, reste utilisable et indique qu'une reconnexion est nécessaire pour la mise à jour. L'intégration a lieu après le geste de reconnexion de l'utilisateur (F14).
4. **CA-4** — Toutes les données de l'application sont conservées dans le Drive de l'utilisateur (RG-020). L'application n'en conserve aucune copie ailleurs que dans ce Drive et sur les appareils de l'utilisateur (DEC-007).
5. **CA-5** — Après fermeture et réouverture de l'application, sur le même appareil ou sur l'autre, les données sont identiques à celles enregistrées.
6. **CA-6** — Quand la **même information** d'un élément a été modifiée sur les deux appareils avant qu'ils n'aient échangé leurs modifications, la modification la plus récente l'emporte. Quand des **informations différentes** du même élément ont été modifiées, toutes les modifications sont conservées (RG-036).
   - Exemple : sur le PC, l'intitulé d'une tâche devient « Rédiger le plan » ; ensuite, sur le smartphone, avant tout échange, son délai passe au 15 novembre. Après échange, la tâche a l'intitulé « Rédiger le plan » et le délai du 15 novembre, sur les deux appareils.
7. **CA-7** — *(variante « hors ligne inclus », retenue par DEC-002)* Sans réseau, l'utilisateur continue de consulter et de saisir. Ses saisies sont conservées sur l'appareil, signalées comme non synchronisées, puis enregistrées dans son Drive au retour du réseau, sans action de sa part ; aucune n'est perdue (ENF-06). Le fonctionnement détaillé sans réseau (ouverture sans réseau, indicateurs) est décrit par US-018 pour le smartphone et par US-031 pour le PC (DEC-013). La même règle s'applique pendant une perte de l'accès Google (RG-035).
8. **CA-8** — Quand une valeur saisie sur un appareil est écartée par une modification concurrente faite sur l'autre (CA-6), l'utilisateur en est informé : élément concerné, information, valeur non retenue (RG-036). Une valeur remplacée plus tard, en connaissance de cause, n'est pas signalée.
   - Exemple signalé : intitulé « A » saisi sur le PC, puis intitulé « B » saisi sur le smartphone sans réseau, avant d'avoir reçu « A » ; « B » l'emporte, et « A » est signalé comme valeur écartée.
   - Exemple non signalé : le smartphone reçoit « A », puis l'utilisateur le remplace par « B ».
   - *Précision E8 (Q-US-017-1, réponse de Starck, DAT §4.2.1)* : une valeur est écartée si et seulement si la modification qui l'emporte a été faite sans connaissance d'elle ; qu'elle ait déjà été enregistrée dans le Drive ou non n'intervient pas (S10, S11). Une même valeur écartée constatée par les deux appareils n'est signalée qu'une fois.
9. **CA-9** — Si les données de l'application sont absentes ou illisibles dans le Drive, ou si leurs fichiers ont été modifiés à la main dans le Drive (même s'ils restent lisibles), alors que l'appareil en détient une copie, l'application avertit l'utilisateur et lui propose (RG-044) :
   - **restaurer** ses données à partir de la copie de l'appareil : elles sont de nouveau présentes dans le Drive et sur les deux appareils ;
   - **repartir de zéro** : après une confirmation, les données sont effacées de l'appareil ; à sa prochaine synchronisation, l'autre appareil efface aussi les siennes, sans reposer la question. S'il détenait des modifications pas encore enregistrées, l'utilisateur en est informé (valeurs écartées).
   - Un fichier modifié à la main est traité comme un fichier illisible : son contenu n'est jamais fusionné avec les données de l'application (V-02, extension de RG-044).
   - Tant que l'utilisateur n'a pas choisi, rien n'est effacé et rien n'est réécrit dans le Drive.
   - *Précisions E8 (sans changement de RG-044)* :
     - *(Q-US-017-2, DAT §4.2.2)* si seul le fichier de données d'un appareil est altéré, seul cet appareil avertit l'utilisateur et lui propose le choix ; l'autre appareil n'affiche rien, ne fusionne jamais le fichier altéré et continue d'enregistrer ses propres données, distinctes de celui-ci. « Rien n'est réécrit dans le Drive » protège les données altérées : l'appareil qui pose la question n'écrit rien (S32, S32b, S33) ;
     - *(Q-US-017-2 b)* après « restaurer » sur un appareil, l'autre appareil réécrit ses propres données sans reposer la question (S20) ;
     - *(précision de conception de Steeve, guide §6.6.8)* sans réseau, « restaurer » est mémorisé et fait au retour du réseau ; « repartir de zéro », qui efface, n'est disponible qu'avec le réseau (S20b, S22b) ;
     - *(Q-US-017-8 a)* au « repartir de zéro », l'autre appareil affiche une information qui l'annonce, et chaque modification qu'il n'avait pas encore enregistrée figure dans la liste « Modifications non retenues », avec la valeur conservée « données effacées (repartir de zéro) » ; ces lignes ne sont pas comptées dans le signalement « à lire » de CA-14 (S21).
10. **CA-10** — *(RG-047 à RG-049)* Après l'échange des modifications des deux appareils, l'application applique les règles de réparation :
    - suppression d'un côté, modification de l'autre : la suppression l'emporte, et les modifications écartées sont signalées (RG-047 ; détail dans US-001, US-002, US-024) ;
    - hiérarchie d'objectifs invalide : les déplacements sont annulés un par un, du plus ancien au plus récent, jusqu'à une hiérarchie valide, chaque annulation étant signalée (RG-048 ; détail dans US-023) ;
    - incohérence d'état entre une tâche et ses sous-tâches : elle est signalée, sans correction automatique (RG-049 ; détail dans US-003, US-024, US-025).
11. **CA-11** — *(RG-054)* Quand l'appareil est réglé sur un autre fuseau horaire que celui de Paris, l'application signale que les horaires et la journée « aujourd'hui » qu'elle affiche sont à l'heure de Paris (mention « heure de Paris »). Quand l'appareil est à l'heure de Paris, cette mention n'apparaît pas.
12. **CA-12** — *(RG-058, V-06 option 2)* Deux appareils qui n'ont pas la même version de l'application continuent de travailler normalement, saisie comprise, tant que les données qu'ils échangent ont le même format. La saisie n'est bloquée que si un appareil rencontre des données enregistrées dans un format plus récent que celui qu'il connaît : cet appareil passe alors en consultation seule et invite l'utilisateur à mettre l'application à jour. Les données présentes sur l'appareil, y compris ses modifications en attente, restent consultables et ne sont pas perdues (ENF-06). **En consultation seule, l'appareil n'écrit rien dans le Drive** ; ses modifications en attente sont déposées dans le Drive après la mise à jour, et la saisie reprend à ce moment (DEC-025, Q-REF-2 ; scénario S30b). Sur le smartphone, l'action « Mettre à jour » ouvre la page de téléchargement de la dernière version de l'application, sans renvoi vers Google Play (DEC-021 ; scénario S30).
13. **CA-13** — *(RG-036 ; seuil de l'horloge déréglée, E7 ANT-4 et BEN-12)* Quand l'horloge d'un appareil est décalée, en retard ou en avance, par rapport à l'heure réelle, l'application avertit l'utilisateur **si et seulement si l'écart est strictement supérieur à 24 h**. Un écart de 24 h exactement, ou moins, ne déclenche aucun avertissement ; un écart de 24 h et 1 min en déclenche un. Quel que soit l'écart, la modification réellement la plus récente l'emporte (CA-6). *Cette précision rend numéroté et exact le cas limite « si l'écart dépasse 24 h », déjà validé ; le seuil n'est pas modifié.*
    - *E8 (Q-US-017-4 et Q-US-017-5)* : CA-13 **n'est pas modifié** ; la portée de sa dernière phrase quand l'horloge est changée pendant que l'appareil est hors ligne est soumise au commanditaire par Jarvis (arbitrage A8). Sont déjà précisés : l'avertissement n'est affiché que sur l'appareil dont l'horloge est décalée (S13a) ; un écart constant de plus de 24 h, mesuré au dernier échange, ne fausse pas la règle (S12c).
14. **CA-14** — *(RG-056, E7 STE-3)* Une modification non retenue (valeur écartée, modification écartée par une suppression, déplacement annulé) reste dans la liste « Modifications non retenues », **sans limite de durée, jusqu'à ce que l'utilisateur indique l'avoir lue (« Compris »)** ; fermer puis rouvrir l'application ne la retire pas. Tant qu'au moins une information n'a pas été lue, l'application le signale de façon discrète et permanente, sans bloquer ; le signalement disparaît quand la dernière est lue. Une information lue sur un appareil l'est aussi sur l'autre, après échange des modifications. Une même information n'est signalée qu'une fois, même si les deux appareils constatent le même écart.
    - *Précision E8 (Q-US-017-6, option a, sans changement de RG-056)* : le signalement « à lire » est présent quel que soit l'état de la synchronisation (hors ligne, modifications à envoyer, session à reprendre…), et indique le nombre d'informations à lire (S15, S15b).

## Cas limites et cas d'erreur
- Drive plein : l'utilisateur est averti que ses modifications ne peuvent pas être enregistrées dans son Drive ; elles restent conservées sur l'appareil et rien n'est perdu sans avertissement.
- Les deux appareils dans des fuseaux horaires différents, ou l'utilisateur en voyage : la date de fin, la date d'abandon et l'indication « en retard » sont déterminées dans le fuseau de Paris (RG-008, RG-053, DEC-012) ; elles sont donc identiques sur les deux appareils, mais peuvent ne pas correspondre à la date locale du lieu où se trouve l'utilisateur. Les délais, dates sans heure, ne changent jamais de jour (RG-053).
- Horloge de l'un des appareils déréglée de plusieurs minutes : la modification réellement la plus récente l'emporte quand même. Si l'écart dépasse 24 h, l'application avertit l'utilisateur (seuil exact : CA-13).
- Deux modifications de la même information faites au même instant exact sur les deux appareils : RG-036 ne dit pas laquelle l'emporte ; le critère vérifié est que les deux appareils retiennent la même valeur et qu'une seule information non retenue est signalée (S12b).
- Les deux appareils n'ont pas la même version de l'application : voir CA-12 (blocage de la saisie seulement si le format des données diffère).
- Modification faite directement dans les fichiers du Drive, qui les laisse lisibles : traitée comme des données illisibles (CA-9, extension de RG-044) ; le contenu modifié à la main n'est jamais fusionné.

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
  - **repartir de zéro** (b, établie : V-01) : l'appareil crée un nouveau manifeste avec une nouvelle `generation` ;
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
- **Règles établies dont dépend l'architecture** (DEC-018) :
  - RG-044 b et son extension aux fichiers modifiés à la main (V-01, V-02) : mécanisme de `generation` et vérification de l'empreinte, tels que décrits ci-dessus ;
  - RG-047 à RG-049 : la passe de réparation (suppression dérivée, hiérarchie réparée de façon déterministe, incohérence dérivée) ;
  - RG-054 : affichage seulement ;
  - RG-056 : l'état « lu / non lu » des modifications non retenues est une donnée synchronisée (lecture valable sur les deux appareils, signalement unique à identifiant déterministe), mais le point « à lire » de l'indicateur est calculé localement, sans réseau ;
  - **RG-058 (V-06 option 2) : seul un `schemaVersion` plus récent que celui de l'appareil le met en consultation seule.** Les versions d'application qui partagent le même schéma coexistent, saisie comprise. En consultation seule : aucune écriture dans le Drive, les modifications en attente restent dans la base locale (ENF-06) et sont déposées après la mise à jour ; la lecture des fichiers plus récents n'est pas fusionnée. Toute évolution du modèle de données doit donc distinguer évolution compatible (sans incrément) et incrément de `schemaVersion` (DAT §4.2, DS-10). L'application affiche la version de schéma bloquante (message de ECR-011).
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
- **Questions et réserves** : Q-ERG-14 (durée de conservation des modifications non retenues ; proposition : jusqu'à « Compris »). Les critères CA-3, CA-9 et CA-11 sont validés (DEC-018) ; les maquettes les appliquent. **Ajout E7** : état « consultation seule » de RG-058 (CA-12) maquetté dans ECR-011 K : bandeau non fermable « Consultation seule » avec l'unique action « Mettre à jour », indicateur « Action requise », cases inertes expliquées par un toast au toucher, bouton « + » masqué ; la consultation reste complète et les modifications en attente sont conservées.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21 ; mis à jour en E7 et E8).* Fichier : [`tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature`](../../../tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature) — **42 scénarios**. Chaque scénario porte les tags `@US-017`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01 |
| CA-2 | S02, S03, S04 |
| CA-3 | S04, S05, S06 |
| CA-4 | S07 |
| CA-5 | S08 |
| CA-6 | S09, S10, S12b |
| CA-7 | S17a, S17b ; détail : US-018, US-031 |
| CA-8 | S10, S11 |
| CA-9 (RG-044) | S18, S19, S20, S20b, S21, S22, S22b, S23, S32, S32b, S33 |
| CA-10 (RG-047 à RG-049) | S24, S25, S26 ; détail : US-001 S19-S20, US-002 S23, US-023 S16-S19, US-024 S20-S22, US-003 S18-S19, US-025 S15-S16 |
| CA-11 (RG-054) | S27 ; US-003 S21 |
| CA-14 (RG-056 : modifications non retenues, jusqu'à « Compris », point « à lire ») | S14, S15, S15b (point « à lire » hors ligne), S16 |
| Cas limite : Drive plein | S29 |
| Cas limite : fuseaux différents sur les deux appareils, voyage | S28 |
| CA-13 ; cas limite : horloge déréglée (quelques minutes ; seuil de 24 h ; écart constant de plus de 24 h) | S12, S12c, S13a, S13b |
| Cas limite : horodatages strictement identiques | S12b |
| CA-12 (RG-058) ; cas limite : versions différentes | S30, S30b, S31 |
| Cas limite : fichiers du Drive modifiés à la main mais restés lisibles | S32, S32b (seul le fichier du smartphone est altéré), S33 |
| Session Google expirée sur PC (F14) | S06 ; US-031 S06, S07 ; US-022 S23 |

**Délais (CA-2, CA-3, E7 ANT-3)** : les scénarios ne mesurent aucun temps réel. Le délai d'une heure se vérifie en faisant avancer l'horloge contrôlée du banc de 60 minutes sans action de l'utilisateur (S02, S03) ; le délai d'une minute à l'ouverture ou après le geste de reconnexion, en l'avançant de 1 minute (S04, S05, S06). S04 vérifie aussi, par une avance de 1 minute seulement, qu'on n'attend pas le délai d'une heure.

**Consultation seule (CA-12, E7 STA-5)** : S30b vérifie que, tant que l'appareil est en consultation seule, il n'écrit rien dans le Drive, que ses modifications en attente restent signalées comme non synchronisées, puis qu'elles sont enregistrées dans le Drive après la mise à jour de l'application. La mention « aucune écriture » découle du sens de « consultation seule » ; elle est à confirmer si le commanditaire l'entendait autrement.

**Décisions du commanditaire intégrées (DEC-018)** :
- *Versions différentes* (V-06, option 2) : la saisie n'est bloquée que si le format des données diffère (CA-12, RG-058). S30 couvre le format plus récent (consultation seule, invitation à mettre à jour, rien de perdu) ; S31 couvre deux versions de même format qui coexistent.
- *Fichiers du Drive modifiés à la main mais restés lisibles* (V-02) : traités comme des données illisibles (CA-9, RG-044 étendue). S32 couvre l'avertissement et le choix ; S33 vérifie que le contenu modifié à la main n'est jamais fusionné.

## Questions ouvertes
- **Q-US-017-3 (E8, posée au commanditaire par Jarvis)** : choix RG-044 concurrents sur les deux appareils (« restaurer » sur l'un, « repartir de zéro » sur l'autre, avant tout échange). Rien n'est écrit dans l'US ni dans les scénarios avant la réponse.
- **Q-US-017-4 (E8, posée au commanditaire par Jarvis, arbitrage A8)** : portée de la dernière phrase de CA-13 quand l'horloge d'un appareil est modifiée pendant qu'il est hors ligne. CA-13 n'est pas modifié avant la réponse ; le scénario S12c (écart constant de plus de 24 h) est ajouté sans attendre.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-3 et 4 et les compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-21, 22 et 23 intégrées (CA-2, CA-3, CA-6, CA-8, CA-9) ; limites F1 et F14 de l'architecte (CA-2, CA-3) ; règles de réparation proposées F12 (CA-10) ; CA-7 remplacé par la variante « hors ligne inclus » (F13, DEC-002) ; mention « heure de Paris » proposée (RG-054, CA-11) ; DEC-001 (Android), DEC-007 (aucun serveur), DEC-009 (dossier visible), DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | v0.5 (Pepper) : Q-DEM001-41 confirmée (DEC-014, CA-2) ; hors ligne du PC dans le lot (DEC-013, CA-7 renvoie à US-031). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | v0.7 (Pepper) : V-06 option 2 mise en œuvre (CA-12, RG-058 ; scénarios S30 et S31) ; V-02 : fichiers du Drive modifiés à la main traités comme illisibles (CA-9, cas limites ; scénarios S32 et S33). Les deux cas qui étaient en attente d'arbitrage sont tranchés. |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : ANT-3 (délais reformulés par l'avance de l'horloge contrôlée) ; ANT-4 et BEN-12 (CA-13, seuil strictement supérieur à 24 h, S13a/S13b) ; STE-3 (CA-14, conservation jusqu'à « Compris ») ; ANT-11 (S12b, égalité stricte des horodatages) ; STA-5 (S30b) ; PEP-7 (S17 scindé en S17a/S17b) ; PEP-8 (mentions caduques retirées). Aucune règle validée n'est modifiée dans son sens ; CA-13 et CA-14 explicitent des éléments déjà validés (cas limite de l'horloge, RG-056). |
| 2026-10-21 | E7, tour 2 du refinement (Pepper) : DEC-025 : Q-REF-2 ajoutée au CA-12 (aucune écriture dans le Drive en consultation seule ; dépôt après la mise à jour ; S30b conservé) ; Q-REF-1 a : annulations RG-048 un par un (cas limites, CA-10) ; Q-LOT-1 b : US-017 n'est pas découpée, livrée en 4 incréments internes avec une revue de code chacun (voir LOT-001 §9.3). DEC-021 sans effet sur cette US (aucune mention de Google Play). |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-017-1 (critère de valeur écartée, CA-8 précisé ; S10 et S11 vérifiés par Starck), Q-US-017-2 (granularité de RG-044 : fichier du smartphone dans S32 et S33, S32b ajouté, S20 complété ; lecture de « rien n'est réécrit » confirmée), Q-US-017-5 (S13a complété), Q-US-017-6 (point « à lire » dans tous les états ; S15 complété, S15b ajouté), Q-US-017-7 (préfixes d'appareil), Q-US-017-8 (valeurs fermées du tableau, S21 complété), Q-US-017-9 à 12 (glossaire v1.2) ; précisions de conception de Steeve sur RG-044 sans réseau (S20b, S22b) ; S12c ajouté (écart d'horloge constant de plus de 24 h). Aucune règle ni aucun critère validé n'est modifié. **En attente du commanditaire** : Q-US-017-3 et Q-US-017-4 (A8), posées par Jarvis. |
