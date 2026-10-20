# Avis de l'architecte sur les dépendances techniques du lot 1 (E2)

> Version 1.2 du 2026-10-20. Auteur : Starck. Mise à jour : prise en compte de DEC-012, qui remplace DEC-011 (fuseau de référence fixe Europe/Paris, instants en UTC).
> Objet : avis demandé dans [`LOT-001.md`](../lots/LOT-001.md), §7 (points S1 à S10) et §9 (D1, D2), sur la base du [DAT v0.1](DAT.md) et des ADR-001 à ADR-011 (statut « Proposé »).
> Ce document ne modifie pas les livrables de Pepper. Les propositions de modification sont adressées à Pepper par l'intermédiaire de Jarvis.

## 1. Synthèse

| Sujet | Avis |
|---|---|
| Composition (D2) | **Composition complète** (§2 de LOT-001), sous trois conditions : (1) **mise au point technique** préalable sur les risques R1 et R2 ; (2) réalisation de US-022 puis de US-017 **en premier** ; (3) intégration du hors ligne du smartphone (D1). |
| Hors ligne sur smartphone (D1, S3) | **Recommandé dans le lot 1.** Le socle *local-first* l'impose de toute façon, et le surcoût restant est faible. À défaut, il peut être reporté au lot 2 **sans reprise**, à condition de modifier le CA-7 de US-017 (§3). |
| Typologie (D3) | **Majeure.** Accord avec Pepper : le lot pose un socle d'architecture structurant. |
| Éléments transverses indispensables au lot 1 | Connexion Google, avec les scopes `openid`, `email` et `drive.file` seulement ; stockage Drive ; moteur de synchronisation et de fusion ; base locale ; **journal métier** ; chaîne de construction PWA et Android ; intégration continue avec Cucumber et banc multi-appareils. |
| Éléments transverses **non** nécessaires au lot 1 | Accès à l'agenda et vérification Google ; synchronisation d'arrière-plan ; notifications locales ; fun facts. |

## 2. Éléments transverses à livrer dès le lot 1, et pourquoi

| Élément | Justification technique | Coût évité par une livraison dès le lot 1 |
|---|---|---|
| Connexion Google (US-022) et autorisation de `drive.file` | RG-019 : aucune fonction n'est accessible sans compte. L'identité (`sub`) cloisonne la base locale. | — |
| Base locale transactionnelle (`DepotLocal`, IndexedDB et SQLite) | L'interface lit et écrit localement (ADR-010) ; c'est la condition de l'affichage immédiat à l'ouverture (Q-21.2). | Réécriture de toute la couche de persistance |
| Horodatage HLC par champ et fusion CRDT (US-017) | Le conflit entre deux appareils **connectés** existe dès le lot 1 : deux saisies faites dans la fenêtre de synchronisation de 2 min. RG-036 s'applique donc dès le lot 1, hors ligne ou non. | Migration du format des données personnelles déjà enregistrées dans le Drive |
| Format Drive versionné (`schemaVersion`, migrations) | Les données du lot 1 seront relues par toutes les versions suivantes. | Perte ou corruption lors des évolutions |
| Journal métier (S7) | L'historique de vélocité et de backlog ne peut **pas** être reconstitué après coup. | Courbes vides ou fausses sur les premières semaines, de façon irréversible |
| Construction et distribution : PWA et Android | RG-017 : deux appareils dès la v1. | — |
| Banc de tests Cucumber multi-appareils (simulateurs Drive, horloge, réseau) | Seul moyen de tester la convergence et les conflits de façon déterministe (ADR-009). | — |

## 3. Réponses aux points S1 à S10 de LOT-001

Correspondance avec les décisions DS attendues par Anthony (`conventions.md` §15) : S1 → DS-03, DS-10 ; S2 → DS-02 ; S3 → DS-07, DS-11 ; S4 → DS-11 ; S5 → DS-11 ; S6 → DS-04, DS-06 ; S7 → DS-19 ; S8 → DS-05 ; S9 → DS-09 ; S10 → DS-20. Le détail de chaque DS figure au DAT §11.

### S1 — Stockage entièrement dans le Google Drive de l'utilisateur (DS-03, DS-10)
- **Faisable, sans serveur** (ADR-002, ADR-003). Chaque appareil écrit son propre fichier d'état dans un dossier visible du Drive, et lit ceux des autres. Comme chaque fichier n'a qu'un écrivain, il n'y a aucun conflit d'écriture dans Drive.
- **Sécurité** :
  - scope `drive.file`, non sensible : l'application n'accède qu'aux fichiers qu'elle a créés ;
  - aucune donnée ni aucun jeton chez l'éditeur ;
  - les données sont protégées par le compte Google de l'utilisateur ; un chiffrement supplémentaire est optionnel (A7).
- **Performance** :
  - lecture et écriture locales immédiates ;
  - un état inférieur à 1 Mo compressé à 5 ans, réécrit à chaque dépôt ;
  - un cycle de synchronisation inférieur à 10 s.
- **Reprise après incident** :
  - chaque appareil détient une copie complète ;
  - Drive conserve des révisions de chaque fichier ;
  - un fichier supprimé ou corrompu est détecté (validation de schéma) et peut être réécrit depuis l'appareil (Q-22.4 a, faisable).
- **Limite** : la mise au point technique doit confirmer que les fichiers créés par le client Android sont visibles par le client web du même projet Google Cloud, et inversement (risque R1). Repli : `drive.appdata`.

### S2 — Smartphone et PC dès le lot 1 (DS-02)
- **Oui, avec une base de code unique** (ADR-001) : PWA sur PC, Capacitor sur smartphone. Le code métier et l'interface sont partagés à 100 %.
- **Surcoût pour le lot 1** : il est concentré sur le socle et n'affecte pas les US métier.
  - construction et signature Android ;
  - module d'authentification native ;
  - hébergement de la PWA ;
  - deux clients OAuth et deux adaptateurs de stockage.

  Nous l'estimons **modéré**. L'essentiel se joue dans US-022 et dans la mise en place de l'intégration continue. Les US-001, 002, 003, 023, 024 et 025 n'ont aucun surcoût lié à la double plateforme.
- **Point du commanditaire** : système du smartphone (A1). L'iPhone ajoute un coût annuel Apple et un Mac ou un service de construction macOS.

### S3 — Hors ligne différé : possible sans reprise ? (DS-07, DS-11)
- **Oui, sans reprise**, mais **à une condition** : le socle du lot 1 doit être *local-first*, c'est-à-dire avec :
  - la base locale qui fait foi pour l'interface ;
  - des horodatages HLC par champ ;
  - un marqueur « déposé jusqu'à » ;
  - la fusion CRDT.

  C'est l'architecture retenue, et elle est **nécessaire au lot 1 de toute façon** : RG-036 s'applique dès que deux appareils connectés modifient la même donnée entre deux synchronisations.
- **Conséquence** : la mécanique du hors ligne est déjà présente au lot 1. Il reste à US-018 :
  - le démarrage à froid sans réseau (service worker de la PWA ; immédiat sur l'application native) ;
  - le démarrage sans jeton, avec une identité mise en cache ;
  - les indicateurs « non synchronisé » et « hors ligne » ;
  - l'affichage des valeurs écartées ;
  - les scénarios de test hors ligne.

  Le surcoût est **faible**.
- **Problème du CA-7 de US-017** (« sans réseau, l'application indique qu'une connexion est nécessaire ») : dans une architecture *local-first*, **bloquer** l'usage hors réseau est un développement **supplémentaire**, à retirer au lot 2. Il resterait de toute façon à gérer sans perte une coupure en cours de saisie (PT-13), ce qui revient à faire du hors ligne.
- **Recommandation (D1)** : **intégrer US-018 (smartphone) au lot 1.** À défaut, garder US-018 au lot 2 et remplacer le CA-7 par : « sans réseau, les saisies sont conservées sur l'appareil, signalées comme non synchronisées, puis déposées au retour du réseau ; le démarrage de l'application sans réseau relève de US-018 ». Les deux options sont sans reprise. La seconde est simplement moins utile pour un coût presque identique.
- **Hors ligne sur PC (Q-39, US-031)** : il est quasi gratuit avec le même code. Seul le renouvellement du jeton après 1 h demande un geste de l'utilisateur. Recommandation : Q-39 b, dans le même lot que le smartphone. La recommandation a de Pepper reste acceptable.
- **Garanties transactionnelles (PT-13)** :
  - une transaction locale par cas d'usage ;
  - un dépôt idempotent ;
  - un marqueur avancé seulement après la confirmation de Drive.

  Il n'y a pas de file d'opérations à rejouer.

### S4 — Délai de prise en compte entre appareils (DS-11)
- **Réaliste** :
  - **moins de 5 minutes** quand les deux appareils sont ouverts et connectés : dépôt 5 s après la modification, lecture toutes les 2 min au premier plan ;
  - **à l'ouverture**, quelques secondes : l'état local s'affiche immédiatement, puis l'application se synchronise. Q-21.2 « oui » est donc **faisable**.
- **Exception** : sur la PWA du PC, si la session Google du navigateur a expiré, un clic de reconnexion précède la synchronisation (F14).
- **Limite non contournable** : un appareil éteint ou fermé ne peut rien afficher. Le délai d'une heure se garantit au premier plan, ou dès l'ouverture (F1).
- Mécanismes testables pour les critères d'acceptation : voir PT-04 au DAT §11.

### S5 — « La plus récente l'emporte » malgré des horloges différentes (DS-11, ADR-011)
- **Horodatage** : horloge hybride logique (HLC). Elle combine :
  - l'heure de l'appareil **corrigée de l'écart mesuré avec l'heure des serveurs Google**, mesurée à chaque échange par l'en-tête HTTP `Date`, avec la dernière valeur connue utilisée hors ligne ;
  - un compteur qui garantit la causalité : une modification faite après en avoir vu une autre est toujours plus récente qu'elle.
- **Précision obtenue** : environ une seconde entre les deux appareils, même si l'horloge de l'un d'eux est décalée de plusieurs minutes. Si une horloge est décalée de plus de 24 h, l'application avertit l'utilisateur.
- **Départage en cas d'égalité stricte** : identifiant d'appareil, de façon déterministe.
- **Traitement information par information (Q-23.1 a) : faisable et recommandé.** Le mécanisme fusionne champ par champ. Si le commanditaire choisit l'option b, on regroupe les champs par élément, sans changer de mécanisme.
- **Information sur la valeur écartée (Q-23.2) : faisable.** Une valeur locale non encore déposée, battue par une valeur distante plus récente, est consignée dans le journal des valeurs écartées, synchronisé et consultable.
- **Réserve à porter dans les US (F12)** : la fusion par champ peut produire des états qu'aucun appareil n'aurait acceptés seul. Exemples :
  - une tâche terminée sur le PC pendant qu'une de ses sous-tâches est rouverte sur le smartphone ;
  - deux déplacements croisés de sous-objectifs, qui créent un cycle ;
  - une suppression d'un côté et une modification de l'autre.

  Règles proposées, à intégrer par Pepper dans US-017, 023, 024 et 003 :
  - la suppression l'emporte, avec signalement ;
  - un cycle ou un niveau interdit est réparé en annulant le déplacement le plus ancien, avec signalement ;
  - une incohérence d'état est signalée sans être corrigée automatiquement.

### S6 — Perte ou expiration de l'accès Google (DS-04, DS-06)
- **Conditions d'expiration imposées par Google** :
  - **mode « Test »** du projet OAuth : autorisations expirées au bout de **7 jours**. Il faut donc publier le projet en production dès le lot 1 (ADR-005) ;
  - **en production** : l'autorisation reste valide jusqu'à sa révocation par l'utilisateur, ou après une longue inactivité, de l'ordre de 6 mois ;
  - **sur le web** : le jeton d'accès dure 1 h, puis il est renouvelé ; ce renouvellement est silencieux si la session Google du navigateur est active.
- **Modifications non enregistrées** : elles sont conservées dans la base locale. Elles ne sont jamais effacées avant leur dépôt confirmé (ENF-T-07).
- **Options de Q-22.2** : les trois sont faisables. **L'option c recommandée par Pepper est la plus simple techniquement** : la perte d'accès se comporte comme une coupure de réseau. Les options a et b demanderaient de développer des modes bloquants. Si US-018 n'est pas au lot 1, l'option c revient de fait à du hors ligne : c'est un argument de plus pour D1.
- **Q-22.3 a** (effacement à la déconnexion, avec confirmation si des modifications ne sont pas déposées) : faisable.
- **Q-22.4 a** (restauration) : faisable. **Nuance** : l'application ne peut pas savoir si une suppression dans Drive est volontaire. Elle doit donc poser la question à l'utilisateur : restaurer, ou repartir de zéro et effacer aussi la copie locale.

### S7 — Données à enregistrer dès le lot 1 (DS-19)
Les historiques sur 12 semaines sont recalculés à partir d'un **journal métier en ajout seul** (DAT §6.1, `EvenementJournal`). Ils ne sont pas tirés d'instantanés. Chaque entrée contient :
- un identifiant UUID v7 ;
- l'HLC et l'**instant en UTC** ;
- la **date calendaire** de l'événement, calculée dans le fuseau de référence **Europe/Paris** à partir de l'instant UTC (décision DEC-012 du commanditaire) ;
- l'appareil ;
- le type ;
- les valeurs **avant et après**.

**Événements à journaliser dès le lot 1** :

| Événement | Utilisé plus tard pour |
|---|---|
| `TACHE_CREEE` (estimation initiale, délai, parent, objectifs) | Vélocité, backlog, historique d'estimation |
| `ESTIMATION_MODIFIEE` (avant et après) | Vélocité fondée sur l'estimation initiale (Q-28.3) |
| `DELAI_MODIFIE` (tâche ou objectif) | Pilotage des délais (US-011) |
| `TERMINEE`, `ROUVERTE` (date de journée) | Vélocité hebdomadaire (RG-010, Q-30.4 et 30.5) |
| `ABANDONNEE`, `REPRISE` | Backlog (Q-27.3), atteinte des objectifs |
| `RATTACHEE`, `DETACHEE` (tâche ↔ objectif) | Backlog et vélocité **par objectif** à une date passée (RG-015, RG-016) |
| `PARENT_MODIFIE` (tâche ou objectif) | Hiérarchie à une date passée (sous-tâches dans la vélocité, Q-25.3) |
| `OBJECTIF_CREE`, `OBJECTIF_SUPPRIME`, `TACHE_SUPPRIMEE` | Cohérence des courbes après une suppression |

**Événements des lots suivants** : `RAF_CORRIGE`, `TEMPS_SAISI`, `PLANIFIEE` et `DEPLANIFIEE`. Ils ne concernent pas des données du lot 1.

**Point de départ des courbes** : première entrée du journal, sans reconstitution antérieure.

**Volume** : négligeable, quelques dizaines d'octets par événement.

**Proposition à Pepper** : ajouter à US-002, 003, 024 et 025 une exigence « l'événement est historisé (date de journée, valeurs avant et après) ». Elle est vérifiable en Gherkin, sans écran.

### S8 — Autorisations Google au lot 1 et délai de vérification (DS-05)
- **Oui** : au lot 1, l'application ne demande que `openid`, `email` et `drive.file`, trois scopes **non sensibles**.
  - Aucune vérification Google n'est nécessaire, et aucun écran d'avertissement ne s'affiche, si l'application n'affiche pas de logo.
  - **Aucun délai Google ne pèse sur le lot 1.**
- **L'agenda** est demandé plus tard, par **autorisation incrémentale**, au premier usage d'une fonction d'agenda. C'est conforme à ENF-05.
- **Contraintes pour le lot qui introduira l'agenda** : `calendar.events` est **sensible**. Deux voies sont possibles :
  - **sans vérification** : un écran « application non validée par Google » s'affiche lors du consentement, et un plafond de 100 utilisateurs s'applique, sans effet ici. C'est ma recommandation (A5) ;
  - **avec vérification** : il faut un domaine, une page d'accueil, une politique de confidentialité et une vidéo, et le délai va de quelques jours à plusieurs semaines. Dans ce cas, la démarche doit être **lancée pendant le lot précédent** pour ne pas retarder celui-ci.

  Si le compte du commanditaire est un compte Google Workspace, une application « interne » ne demande aucune vérification.
- **À faire dès le lot 1** : publier le projet OAuth en **production**, pour éviter l'expiration à 7 jours du mode « Test ».

### S9 — Notification émise par l'application en secours (DS-09)
- **Faisable sur le smartphone (application native)**. Les notifications locales sont programmées à l'avance (J à J+7) avec le contenu précalculé. Elles se déclenchent sans réseau, et sont annulées tant que l'agenda est accessible.
- Le stockage personnel ne pose aucun problème : tout est calculé sur l'appareil.
- **Pas faisable sur la PWA du PC sans serveur** de notifications push.
- Recommandation pour Q-38 : **b, limitée au smartphone**.
- Non nécessaire au lot 1.

### S10 — Liste des fun facts (DS-20)
- **Emplacement** : la liste est un **référentiel embarqué dans l'application** (fichier JSON versionné). Ce n'est pas une donnée personnelle, et RG-020 ne s'applique donc pas.
  - Si le commanditaire veut pouvoir modifier la liste (Q-DEM002-5), elle devient une donnée personnelle et passe dans l'état synchronisé du Drive.
- **Égalité entre deux appareils** (RG-042) : le fun fact du jour est une **fonction pure** de (graine synchronisée, date d'origine, jour, version de la liste). Il s'agit d'une permutation aléatoire par cycle de 100 jours (ADR-008).
  - Les deux appareils et le rappel précalculé trouvent le même fun fact sans se coordonner.
  - Chaque fun fact est présenté exactement une fois par cycle.
  - Cette solution correspond à l'option a de Q-DEM002-6. Un jour sans rappel consomme son fun fact.
- Non nécessaire au lot 1.

## 4. Avis sur les recommandations de Pepper (Q-DEM001-21 à 23)

| Question | Recommandation de Pepper | Avis de Starck |
|---|---|---|
| Q-21.1 | Aucune recommandation | Suggérer **a** pour les données. La notification d'un créneau déplacé relève d'un autre mécanisme, sans garantie d'une heure si aucun appareil n'est actif (F2). |
| Q-21.2 | Oui (affichage immédiat à l'ouverture) | **Faisable**, avec l'exception de la PWA du PC quand la session Google a expiré (F14). |
| Q-22.1 | a (Drive du même compte) | **D'accord.** Un seul consentement ; scope `drive.file`. |
| Q-22.2 | c (fonctionnement comme hors ligne) | **D'accord.** C'est la plus simple techniquement. Elle suppose toutefois la mécanique du hors ligne : argument pour D1. |
| Q-22.3 | a (effacement après dépôt, confirmation sinon) | **D'accord.** |
| Q-22.4 | a (restauration depuis l'appareil) | **D'accord, faisable.** Ajouter le choix « repartir de zéro », car une suppression volontaire ne se distingue pas d'une suppression accidentelle. |
| Q-23.1 | a (information par information) | **D'accord.** Ajouter les règles de réparation des invariants entre plusieurs informations (F12). |
| Q-23.2 | Oui (informer de la valeur écartée) | **D'accord, faisable.** Préciser que seules les modifications **concurrentes** sont concernées : une valeur remplacée plus tard, en connaissance de cause, n'est pas une valeur écartée. |
| Q-29.4 | a (suppression définitive) | D'accord. Préciser que des traces techniques subsistent : la pierre tombale nécessaire à la synchronisation, et les révisions de fichier conservées un temps par Drive. Sans impact pour l'utilisateur. |

## 5. Ordre et précautions de réalisation (pour Anthony, en E9)
1. **Mise au point technique, avant E9**, sur une demi-journée à deux jours :
   - visibilité `drive.file` entre le client Android et le client web (R1) ;
   - authentification native Capacitor et renouvellement silencieux (R2) ;
   - Google Identity Services dans la PWA installée.

   À organiser par Jarvis : soit par Benjamin hors du cycle de développement, soit par Anthony dans le cadre de E9.
2. **US-022**, puis **US-017**, avec le moteur de synchronisation, le journal et le banc multi-appareils, puis **US-018** si D1 est retenu.
3. US-001 → US-023 ; US-002 → US-024 ; US-003 → US-025. Chaque US alimente le journal métier (S7).
