# Glossaire d'étapes figé — tests métiers de LOT-001

Version 1.2 — 2026-10-21 — Pepper (E8 : réponses aux demandes de précision Q-US d'Anthony, `docs/ceremonies/explicitation-LOT-001.md`, section « Réponses aux Q-US » ; formes d'étapes complétées, sens observables fixés, rendu de l'historique (§11), listes fermées complétées (§8), nettoyage ANT-24). Version 1.1 — 2026-10-21 — Pepper (E7, remarques ANT-9, ANT-10, PEP-7, ANT-2, ANT-15 ; ANT-21 : motifs de refus rattachés aux codes du catalogue). Ce fichier n'est pas lu par Cucumber (extension `.md`). Il fige le vocabulaire des étapes des dix fichiers `.feature` du lot : une étape qui n'y figure pas ne doit pas être écrite sans que Pepper ait mis ce glossaire à jour. Anthony en tire les définitions d'étapes (E9) ; Benjamin n'en crée pas d'autres.

Conventions :
- `"…"` : texte entre guillemets (intitulé, nom de compte, libellé) ; `AAAA-MM-JJ` : date ; `HH:MM` : heure ; `durée` : « 30 min », « 1 h », « 2 h 30 », « 0 h » ; `n` : entier.
- **Préfixe d'appareil.** Toute étape `Étant donné`, `Quand` ou `Alors` peut commencer par `sur le smartphone, ` ou `sur le PC, ` ; `sur les deux appareils, ` et `sur chacun des deux appareils, ` (synonymes) ne s'emploient qu'avec une assertion. Sans préfixe, l'appareil est le seul en jeu dans le scénario. **(v1.2, Q-US-017-7)** Dans un scénario à deux appareils, une assertion sur ce qu'affiche un appareil porte toujours un préfixe ; si un préfixe manque, l'assertion vaut « sur chacun des deux appareils ». Les assertions sur le Drive (`le Drive du compte "X" …`) n'ont pas de préfixe.
- **Pluriel (v1.2, Q-US-018-2).** `modification(s)`, `information(s)`, `tâche(s)`, `sous-tâche(s)` : une seule définition d'étape accepte le singulier, le pluriel et la forme entre parenthèses (« 1 modification », « 2 modifications », « 2 modification(s) »).
- **Assertions tabulaires (v1.2, Q-US-002-3).** Une assertion suivie d'un tableau ne vérifie l'ordre des lignes que si elle contient `dans cet ordre`. Elle ne vérifie que les colonnes présentes dans le tableau (un tableau peut ne garder que la colonne `intitulé`). Exception : `l'historique contient, pour … :` vérifie la liste complète, dans l'ordre chronologique (§11).
- **« que » facultatif (v1.2).** En tête d'une précondition, `que` est facultatif : `Et l'objectif "X" a …` et `Et que l'objectif "X" a …` sont une seule définition d'étape.
- **Opération au passé (v1.2, Q-US-022-1).** Une précondition `que sur le <appareil>, l'utilisateur a <participe passé>` (« a créé », « a renommé », « a modifié », « a supprimé ») rejoue l'opération correspondante du §5 avant le scénario, sur cet appareil, à l'instant courant de l'horloge.
- **Accord.** « signalé(e) » s'accorde avec l'élément : « signalée » pour une tâche, « signalé » pour un objectif. Les deux sont une seule définition d'étape.
- **Aucun texte libre** n'est admis dans une colonne d'`Exemples` : chaque colonne ne prend que les valeurs de la liste fermée qui lui est associée (§8). Une valeur nouvelle suppose une mise à jour de ce glossaire.

## 1. Contexte et données de départ (`Étant donné`)

| Étape | Remarque |
|---|---|
| `que nous sommes le AAAA-MM-JJ à HH:MM heure de <fuseau>` | Ancre l'horloge contrôlée (voir §4). Fuseaux admis : Europe/Paris, America/New_York, UTC, Pacific/Auckland. |
| `que l'utilisateur est connecté avec le compte "X" sur le smartphone` ou `sur le PC` | Un seul appareil en jeu. |
| `que l'utilisateur utilise le compte "X" sur le smartphone et sur le PC, tous deux à jour` | Deux appareils, données identiques, échange déjà fait. |
| `un objectif "X" sans délai` ; `un objectif "X" de délai AAAA-MM-JJ` ; `… avec la description "X"` | |
| `un sous-objectif "X" de l'objectif "X"` suivi de `, sans délai` ou `, de délai AAAA-MM-JJ` | |
| `les tâches suivantes :` + tableau (colonnes : intitulé, état, délai, estimation, objectifs, tâche parente) | États : « à faire », « terminée », « abandonnée ». **Convention de date (ANT-16)** : ces tâches sont créées par les cas d'usage, qui produisent des dates et des entrées d'historique (RG-050). Une tâche de contexte « terminée » a pour date de fin, et une tâche « abandonnée » pour date d'abandon, **la date du contexte**, c'est-à-dire la date de la dernière étape `nous sommes le …` jouée avant elle (par défaut celle du `Contexte`, 2026-10-21), sauf si le tableau porte une colonne facultative `date de fin` ou `date d'abandon`, qui l'emporte. L'entrée d'historique correspondante porte la même journée. **Construction (v1.2, Q-US-024-1)** : (a) toutes les lignes sont d'abord créées « à faire », dans l'ordre du tableau ; une tâche parente laissée sans estimation reçoit une estimation technique de 30 min, aussitôt remplacée par la somme de ses sous-tâches ; (b) les états « terminée » et « abandonnée » sont ensuite appliqués, d'abord aux sous-tâches, puis aux tâches parentes ; l'abandon d'une sous-tâche est alors individuel (sans cascade) ; (c) un tableau qui donne une tâche parente « terminée » ou « abandonnée » avec une sous-tâche « à faire » décrit une incohérence qu'aucun cas d'usage ne produit seul : l'étape échoue. Pour obtenir cette situation, utiliser l'étape d'incohérence du §1. |
| `que l'objectif "X" a n tâche(s) à faire, n tâche(s) terminée(s) et n tâche(s) abandonnée(s)` ; assertion associée : `l'objectif "X" a toujours n tâche(s) rattachée(s)` | Tâches directement rattachées, sans sous-tâche, créées selon la construction ci-dessus (Q-US-001-5). |
| `que l'objectif "X" a un sous-objectif <absent \| atteint \| en cours \| à décliner en tâches>` | Construction (Q-US-003-2) : `absent` : aucun sous-objectif ; `atteint` : un sous-objectif avec 1 tâche terminée ; `en cours` : un sous-objectif avec 1 tâche à faire ; `à décliner en tâches` : un sous-objectif sans tâche. |
| `que la tâche "X", <terminée \| abandonnée>, est signalée en incohérence avec sa sous-tâche à faire "X"` | Construction (Q-US-024-3, Q-US-025-1) : banc à deux appareils ; la tâche parente a la sous-tâche terminée (ou abandonnée) ; la tâche parente est terminée (ou abandonnée) sur le PC pendant que la sous-tâche est rouverte (ou reprise) sur le smartphone hors ligne ; puis les deux appareils échangent leurs modifications. |
| `que sur le <appareil>, l'utilisateur a <participe passé d'une opération du §5>` ; `… , pas encore enregistré dans le Drive` | Voir « Opération au passé » ci-dessus. La mention finale précise que l'appareil n'a pas encore déposé la modification. |
| `que sur le <appareil>, l'objectif "X" a été créé et n'est pas encore synchronisé` | Équivalent de `que sur le <appareil>, l'utilisateur a créé un objectif "X" sans délai, pas encore enregistré dans le Drive`. |
| `que sur le <appareil>, l'utilisateur a supprimé les données de cet appareil` | Rejoue « Supprimer les données de cet appareil », confirmé, sans modification en attente. |
| `que les données du compte "X" sont conservées sur le smartphone, avec n modification(s) en attente` | Le compte X s'est déconnecté en laissant n modifications en attente (RG-043). |
| `que sur le <appareil>, la liste des modifications non retenues contient une valeur écartée pour <l'intitulé \| le délai> de la tâche "X"` | Précondition d'état ; l'entrée est non lue. |
| `que sur le <appareil>, le message d'erreur "ERR-…" est affiché` ; `que sur le <appareil>, le bandeau "BAN-RAPPEL-24H" est affiché avec n modification(s) en attente` | Précondition : l'état est atteint par les étapes qui le produisent (synchronisation, horloge). |
| `que sur le smartphone, 3 modifications ont été enregistrées dans le Drive depuis la dernière ouverture du PC` | Sens fixé (Q-US-017-9) : trois opérations fixées par la définition d'étape (création d'un objectif, renommage d'une tâche, changement de délai d'une tâche), déposées par le smartphone. L'assertion `sur le PC, les 3 modifications sont intégrées` vérifie ces trois opérations. |
| `que le smartphone est sans réseau` ; `que le PC est sans réseau` ; `que le réseau du smartphone est intermittent` | Le réseau revient par une étape `Quand` (§3). |
| `que l'application est ouverte sur le <appareil>` ; `… fermée sur le <appareil>` ; `… ouverte sur le smartphone et sur le PC, connectés au réseau` ; `… ouverte dans deux onglets du PC` | |
| `que l'application n'a jamais été utilisée sur le smartphone` ; `… jamais ouverte dans le navigateur du PC` | |
| `que le smartphone est réglé sur le fuseau "X"` ; `que le PC est réglé sur le fuseau "X"` | |
| `que l'horloge du <appareil> est en avance de <écart>` ; `… en retard de <écart>` | Voir US-017 CA-13. Les écarts d'horloge s'écrivent avec leurs unités (« 24 h », « 24 h 1 min », « 23 h 59 min », « 5 min »). |
| `que l'accès au compte Google "X" a été retiré sur le <appareil>` ; `… a expiré sur le <appareil>` | **Sens fixé (v1.2, Q-US-022-1 a)** : l'accès est perdu côté Google **et l'application l'a déjà constaté** (au dernier échange). Sur le PC, « a expiré » ne s'emploie pas : l'expiration y est la session expirée (`que la session Google du navigateur du PC a expiré`, `SYN-SESSION`, sans bandeau ; DAT §4.1.6 bis, Q-US-031-1). Pour un retrait non encore constaté, utiliser l'étape `Quand` du §2 (`l'accès au compte Google "X" est retiré depuis le compte Google`). |
| `que la session Google du navigateur du PC est active` ; `… a expiré` | |
| `que le Drive du compte "X" ne contient aucune donnée de l'application` ; `… contient un objectif "X" de délai AAAA-MM-JJ enregistré par le PC` ; `… est plein` ; `que le Drive est momentanément indisponible` ; `que le Drive est désactivé pour le compte "X"` | |
| `que les données de l'application ont été <altération> dans le Drive, en dehors de l'application` | Liste fermée « altération » (§8). **Sens (v1.2, Q-US-017-2)** : le manifeste et tous les fichiers d'appareil sont atteints ; tous les appareils le constatent. |
| `que le fichier de données du smartphone a été modifié à la main dans le Drive, en dehors de l'application, et reste lisible` ; `que dans le fichier de données du smartphone, le délai de l'objectif "X" a été changé à la main en AAAA-MM-JJ, le fichier restant lisible` | **Seul le fichier du smartphone** est altéré (v1.2, Q-US-017-2) : seul le smartphone affiche `ERR-012` ; le PC n'affiche rien et ne fusionne jamais ce fichier. |
| `que la liste des modifications non retenues contient …` | Précondition d'état, avec tableau ou formulation de S14/S15 d'US-017. |
| `que sur le <appareil>, n modifications ne sont pas encore enregistrées dans le Drive` ; `qu'aucune modification n'est en attente sur le <appareil>` | Précondition d'état. |
| `que le réseau du smartphone est coupé pendant la connexion` | Précondition d'une connexion qui va échouer (ERR-005). |
| `que le PC a enregistré dans le Drive des données dans un format plus récent que celui que connaît le smartphone` ; `que le PC utilise une version de l'application plus récente que celle du smartphone` ; `que les deux versions partagent le même format de données` | RG-058. |

## 2. Appareil et compte (`Quand`)

| Étape |
|---|
| `l'utilisateur ouvre l'application sur le <appareil>` ; `… , connecté au réseau` ; `l'utilisateur ouvre l'application sur le PC depuis son adresse web` ; `… depuis l'application installée` |
| `l'utilisateur ferme l'application sur le smartphone` ; `l'utilisateur ferme l'onglet de l'application` ; `l'utilisateur ferme le navigateur` |
| `le smartphone est éteint puis rallumé` ; `le PC est éteint puis rallumé` ; `l'application est arrêtée brutalement sur le smartphone` |
| `l'utilisateur se connecte avec le compte "X" sur le <appareil>` ; `l'utilisateur tente de se connecter avec le compte "X" sur le <appareil>` (suivi, si besoin, de `et annule la connexion` ou `et refuse les autorisations demandées`) |
| `sur le <appareil>, l'utilisateur se reconnecte avec le compte "X"` ; `sur le PC, l'utilisateur fait le geste de reconnexion` |
| `sur le smartphone, l'utilisateur se déconnecte` ; `… demande à se déconnecter` ; `… demande la suppression des données de cet appareil` ; `l'utilisateur confirme` ; `l'utilisateur renonce` |
| `l'utilisateur efface les données de son navigateur sur le PC` |
| `l'accès au compte Google "X" est retiré depuis le compte Google` ; `la session Google du navigateur du PC expire` |
| `sur le PC, l'utilisateur fait le geste de reconnexion` : action « Reprendre la synchronisation » (indicateur `SYN-SESSION` ou bandeau `BAN-RAPPEL-24H` variante `session`) |
| `sur le smartphone, l'application est mise à jour et connaît le format plus récent` |
| `dans le premier onglet, <étape>` ; `dans le second onglet, <étape>` (scénarios `@ihm` à deux onglets) |

## 3. Synchronisation et réseau (`Quand`)

| Étape | Sens |
|---|---|
| `les deux appareils échangent leurs modifications` | Chacun enregistre ses modifications dans le Drive, puis intègre celles de l'autre. |
| `le smartphone échange ses modifications avec le Drive` | Un seul appareil échange. |
| `le smartphone enregistre ses modifications dans le Drive` ; `sur le PC, l'utilisateur enregistre ses modifications dans le Drive` | Dépôt seul, sans intégration de l'autre appareil. |
| `le réseau revient sur le <appareil>` ; `… , sans aucune action de l'utilisateur` | |
| `le réseau est coupé sur le <appareil> pendant la saisie` ; `le réseau est coupé sur le <appareil>` (v1.2) | |
| `l'envoi au Drive est interrompu n fois avant d'aboutir` | |
| `de l'espace est libéré dans le Drive du compte "X"` ; `le Drive redevient disponible` | |
| `sur le smartphone, l'utilisateur choisit de restaurer ses données` ; `… choisit de repartir de zéro` ; `… choisit de repartir de zéro et renonce` ; `… décide plus tard` | RG-044. Sans réseau (v1.2, précision de Steeve, guide §6.6.8) : « restaurer » est mémorisé et fait au retour du réseau ; « repartir de zéro » n'est pas disponible. |
| `l'utilisateur marque comme lue la modification non retenue de la tâche "X"` | « Compris » (RG-056). |
| `le smartphone échange ses modifications avec le Drive` suivi d'un échec | Les échecs transitoires répétés passent par `SYN-RETENTATIVE`, puis `SYN-ACTION` avec `ERR-016` après 3 tentatives ; les tentatives continuent ensuite (guide §6.6.8, DAT §4.3 ; Q-US-017-12). |

## 4. Temps (horloge contrôlée du banc)

Aucun scénario n'attend en temps réel. Le temps ne passe que par ces étapes.

| Étape | Sens |
|---|---|
| `que nous sommes le AAAA-MM-JJ à HH:MM heure de <fuseau>` (aussi en `Quand`, sans « que ») | Positionne l'horloge. |
| `n minutes plus tard, <étape>` | L'étape est jouée n minutes après la précédente. |
| `l'horloge avance de <durée>, sans aucune action de l'utilisateur` | Fait avancer le temps sans action ; sert aux délais de RG-017 (US-017 S02, S03). |
| `l'horloge avance de <durée> depuis l'ouverture` ; `l'horloge avance de <durée> depuis la reconnexion` | Mesure le délai qui suit l'ouverture ou le geste de reconnexion (US-017 S04, S05, S06). |
| `au même instant exact, <étape>` | L'étape est jouée au même instant exact que la précédente : les deux modifications portent le même horodatage (US-017 S12b ; US-002 S20b). |

**Heure locale ambiguë ou inexistante (v1.2, Q-US-001-4).** Une heure qui existe deux fois à Paris (le 2026-10-25 de 02:00 à 02:59) désigne la **première** occurrence, en heure d'été (UTC+2). Une heure qui n'existe pas (le 2027-03-28 de 02:00 à 02:59) fait échouer l'étape : elle ne s'écrit pas dans un scénario.

## 5. Actions sur les données (`Quand`, avec ou sans préfixe d'appareil)

Liste fermée des **opérations** (colonnes `opération` des `Exemples`, et étapes simples) :
- `l'utilisateur crée un objectif "X"` suivi de `de délai AAAA-MM-JJ` ou `sans délai` (et, au besoin, `avec la description "X"` ou `sans description`) ;
- `l'utilisateur crée un sous-objectif "X" de l'objectif "X"` suivi de `, sans délai` ou `, de délai AAAA-MM-JJ` ;
- `l'utilisateur crée une tâche :` + tableau (intitulé, délai, estimation, objectifs) ;
- `l'utilisateur crée une sous-tâche de la tâche "X" :` + tableau (intitulé, délai, estimation) ; forme sur une ligne, seule admise dans une colonne d'`Exemples` (v1.2, Q-US-018-2) : `l'utilisateur crée une sous-tâche "X" de la tâche "X", de délai AAAA-MM-JJ, estimée à durée` ;
- `l'utilisateur crée un objectif sans délai dont l'intitulé est <vide | composé uniquement d'espaces>` ; `l'utilisateur crée une tâche de délai AAAA-MM-JJ, estimée à durée, dont l'intitulé est <vide | composé uniquement d'espaces>` (liste fermée) ; `l'utilisateur commence la saisie d'une nouvelle tâche` (v1.2, Q-US-001-5, Q-US-002-3). **Intitulés (Q-US-001-3)** : les espaces de début et de fin sont retirés à l'enregistrement ; aucune longueur maximale ;
- `l'utilisateur renomme la tâche "X" en "X"` ; `… l'objectif "X" en "X"` ;
- `l'utilisateur modifie la description de l'objectif "X" en "X"` ; `l'utilisateur retire le délai de l'objectif "X"` ;
- `sur le <appareil>, l'utilisateur commence la saisie d'une sous-tâche de la tâche "X"` puis `l'utilisateur saisit l'intitulé "X", le délai AAAA-MM-JJ et l'estimation durée` puis `l'utilisateur termine la saisie` ;
- `l'utilisateur modifie le délai de la tâche "X" en AAAA-MM-JJ` ; `… de l'objectif "X" en AAAA-MM-JJ` ;
- `l'utilisateur modifie l'estimation de la tâche "X" en durée` ;
- `l'utilisateur rattache la tâche "X" à l'objectif "X"` ; `l'utilisateur détache la tâche "X" de l'objectif "X"` ;
- `l'utilisateur place l'objectif "X" sous l'objectif "X"` ; `l'utilisateur fait de l'objectif "X" un objectif principal` ;
- `l'utilisateur termine la tâche "X"` ; `… rouvre la tâche "X"` (suivi, si une confirmation est demandée, de `l'utilisateur confirme`) ; `l'utilisateur rouvre la tâche "X" et renonce` ; `… reprend la tâche "X"` ;
- `l'utilisateur abandonne la tâche "X" et confirme` (ou `et renonce`) ; `l'utilisateur supprime la tâche "X" et confirme` (ou `et renonce`) ; `l'utilisateur supprime l'objectif "X" et confirme` (ou `et renonce`) ; `l'utilisateur demande l'abandon de la tâche "X"` ; `… la suppression de la tâche "X"` ; `… la suppression de l'objectif "X"` ;
- consultations : `l'utilisateur consulte la liste des objectifs` ; `… la liste des tâches` ; `… le détail de l'objectif "X"` ; `… le détail de la tâche "X"` ; `l'utilisateur filtre les tâches sur l'état "X"`, avec les seules valeurs `à faire`, `terminée`, `abandonnée` (v1.2, Q-US-002-1 ; il n'existe pas de valeur « tous ») ;
- `l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"` (avec préfixe d'appareil).

Les colonnes `opération` des `Exemples` ne prennent que ces formes. Les colonnes `résultat` ne prennent que les assertions du §6.

## 6. Assertions positives (`Alors`)

- Existence : `l'objectif "X" existe` ; `… existe avec le délai AAAA-MM-JJ` ; `… existe sans délai` ; `… existe sans description` ; `… a la description "X"` ; même famille pour `la tâche "X"` ; `"X" est un objectif principal` ; `"X" est un sous-objectif de l'objectif "X"` ; `la tâche "X" est rattachée au seul objectif "X"` ; `… aux objectifs "X" et "X"` ; `la tâche "X" existe sans objectif`.
- État : `l'état de l'objectif "X" est "X"` ; `l'état de la tâche "X" est "X"` ; `la tâche "X" est "X" avec la date de fin AAAA-MM-JJ` ; `… avec la date d'abandon AAAA-MM-JJ` ; `la tâche "X" est en retard` ; `l'objectif "X" est en retard`.
- Estimation : `l'estimation de la tâche "X" est durée` ; `la tâche "X" existe avec l'estimation durée` ; `l'estimation initiale de la tâche "X" est durée`. Une estimation calculée de « 0 h » est une valeur valide (US-024, S16, S16b) ; le minimum de 30 min ne s'applique qu'à la saisie (RG-028).
- Alertes : `la tâche "X" porte une alerte de délai qui nomme l'objectif "X"` ; `… qui nomme les objectifs "X" et "X"` ; `l'objectif "X" porte une alerte de délai qui nomme l'objectif "X"` ; `la tâche "X" porte une alerte de délai qui nomme la tâche parente "X"`. **Sens (v1.2, Q-US-002-2)** : l'alerte nomme **exactement** les objectifs cités, ni plus ni moins (la forme « nomme le seul objectif » est retirée).
- Liste des objectifs et détail (v1.2, Q-US-001-5, Q-US-023-2, Q-US-024-3) : `il existe n objectif(s) d'intitulé "X"` ; `la liste des objectifs présente :` + tableau (colonnes intitulé, délai, état, en retard, tâches terminées, tâches non abandonnées ; `délai` : date ou `sans délai` ; `en retard` : `oui` ou `non`) ; `la liste présente "X" comme objectif principal` ; `la liste présente "X" comme sous-objectif de "X"` ; `aucun sous-objectif n'a de sous-objectif` ; `les deux appareils présentent la même hiérarchie d'objectifs` ; `le détail présente l'intitulé "X", la description "X" et le délai AAAA-MM-JJ` ; `le détail présente les tâches "X" et "X"` ; `le détail présente le sous-objectif "X"` ; `le détail présente les sous-objectifs :` + tableau ; `le détail présente les sous-tâches :` + tableau ; `le détail indique n sous-tâche(s) terminée(s) sur n sous-tâche(s) non abandonnée(s)` ; `le détail de l'objectif "X" présente la tâche "X"` ; `la tâche "X" n'a aucune sous-tâche`.
- Liste des tâches (v1.2, Q-US-002-1, Q-US-002-3, Q-US-003-2) : `le filtre d'état de la liste des tâches est "X"` (`à faire` à l'ouverture) ; `la liste des tâches présente, dans cet ordre :` + tableau (colonnes parmi intitulé, délai, estimation, état, objectifs, en retard) ; `la liste des tâches contient exactement "X"` ; `… exactement "X" et "X"` (et `"X", "X" et "X"`) ; `la liste des tâches est vide` ; `dans la liste des tâches, la tâche "X" indique n sous-tâche(s) terminée(s) sur n sous-tâche(s) non abandonnée(s)` ; `la tâche "X" figure parmi les tâches sans objectif` ; `la tâche "X" ne figure pas parmi les tâches sans objectif`. Tri : à faire, délai croissant, puis date de création croissante, puis intitulé (ordre alphabétique sans majuscules ni accents) ; terminées, date de fin décroissante ; abandonnées, date d'abandon décroissante. Les sous-tâches ne sont jamais des lignes de la liste (guide §5.7).
- Tâche (v1.2, Q-US-002-3, Q-US-024-3) : `la tâche "X" existe avec :` + tableau (colonnes état, délai, estimation, objectifs) ; `aucun délai n'est présélectionné` ; `aucune estimation n'est présélectionnée` ; `l'utilisateur est informé que l'estimation de durée de la tâche "X" sera remplacée par la somme de ses sous-tâches` ; `les tâches "X", "X" et "X" n'existent plus` ; `la tâche "X" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "X"`.
- Confirmations (v1.2, Q-US-002-3, Q-US-024-3, Q-US-025-1, Q-US-022-1) : `une confirmation est demandée, qui annonce n sous-tâche(s) supprimée(s) avec la tâche` ; `… qui annonce n sous-tâche(s) abandonnée(s) avec la tâche` ; `… qui annonce la réouverture de la tâche "X"` ; `… qui rappelle que la tâche pourra être reprise` ; `… qui annonce n tâche(s) détachée(s) et n sous-objectif(s) devenu(s) objectif principal` ; `… qui précise que les données restent dans le Drive` ; `… qui annonce n modification(s) enregistrée(s) dans le Drive à la prochaine connexion sur cet appareil` ; `une confirmation explicite est demandée, qui annonce que n modification(s) seraient perdues`.
- Historique : voir §11.
- Drive : `le Drive du compte "X" contient l'objectif "X"` ; `… la tâche "X"` ; `… la tâche "X" à l'état "X"` ; `… exactement une fois` ; `le Drive contient la tâche "X"` ; `le Drive du compte "X" contient un dossier visible nommé "X"`.
- Synchronisation : `sur le <appareil>, la tâche "X" porte la mention "MEN-ATTENTE"` ; `… l'objectif "X" porte la mention "MEN-ATTENTE"` ; `sur le <appareil>, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec n modification(s) en attente` ; `la liste des modifications non retenues contient :` + tableau (élément, information, valeur non retenue, valeur conservée ; valeurs : §8) ; `la liste des modifications non retenues contient exactement n information(s)` ; `la liste des modifications non retenues contient toujours la valeur écartée pour <l'intitulé | le délai> de la tâche "X"` ; `la liste des modifications non retenues est vide` ; `l'indicateur de synchronisation est "SYN-INFO"` ; `… est toujours "SYN-…"` ; `… n'est pas "SYN-…"` ; `l'indicateur de synchronisation est "SYN-…", avec l'action "X"`.
  - **Décompte (v1.2, Q-US-018-1)** : `n modification(s) en attente` est le **nombre d'éléments distincts** (objectif, tâche, sous-tâche) qui portent `MEN-ATTENTE`. Plusieurs modifications d'un même élément comptent pour une ; la suppression d'un élément déjà enregistré dans le Drive compte pour une ; un élément créé puis supprimé avant tout enregistrement ne compte pas. Même `n` pour l'indicateur, les bandeaux, les confirmations de déconnexion et de suppression des données, et la feuille (guide §6.6.1). Les 24 h de RG-057 partent de la **première** modification non encore enregistrée, tous éléments confondus ; modifier de nouveau un élément en attente ne les remet pas à zéro.
  - **Informations à lire (v1.2, Q-US-017-6)** : `l'indicateur de synchronisation signale n information(s) à lire` ; `… ne signale aucune information à lire`. Valable **dans tous les états** de l'indicateur (`SYN-HORS-LIGNE`, `SYN-ATTENTE`…) : le point « à lire » est indépendant de l'état (guide §6.6.2, `data-a-lire`). `SYN-INFO` n'est l'état que si l'état serait `SYN-OK`. Ne sont comptées que les informations `ALR-009` à `ALR-011` (RG-036, RG-047, RG-048) ; pas `ALR-008` ni `ALR-014`.
  - **RG-044 (v1.2)** : `sur le <appareil>, l'utilisateur se voit proposer "restaurer" et "repartir de zéro"` ; `aucun choix entre restaurer et repartir de zéro n'est demandé` ; `sur le <appareil>, l'action "<restaurer | repartir de zéro | décider plus tard>" est disponible` ; `… n'est pas disponible` ; `sur le <appareil>, la restauration est en attente du retour du réseau` ; `le fichier de données du smartphone n'a pas été réécrit dans le Drive`.
- Refus et messages : `l'enregistrement est refusé avec le motif "ERR-…"` ; `la modification est refusée avec le motif "ERR-…"` ; `l'action est refusée avec le motif "ERR-…"` ; `la connexion échoue avec le motif "ERR-…"` (codes du §9). **Le motif d'un refus est toujours un code du §9, jamais un libellé en texte libre.** Plusieurs codes cumulés s'écrivent dans une même chaîne, séparés par `, ` et dans l'ordre du catalogue (`"ERR-021, ERR-022"`) ; la variante d'un code s'écrit `"ERR-030 variante <variante>"` ; `une confirmation est demandée` suivi, si besoin, de `, qui annonce …` ou `, qui précise …`.
- Opération acceptée : `sur le <appareil>, l'opération est acceptée` ; `sur le <appareil>, toutes ces opérations ont été acceptées` ; `sur le <appareil>, la saisie n'est plus bloquée` ; `sur le <appareil>, la saisie n'est pas bloquée` ; `sur le <appareil>, toutes les fonctions restent utilisables`.
- Ouverture et données (v1.2, Q-US-017-9) : `sur le <appareil>, les données présentes sur le <appareil> s'affichent aussitôt` ; `sur le <appareil>, les données sont identiques à celles enregistrées` ; `sur le PC, les 3 modifications sont intégrées` ; `aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte "X"` ; `sur le PC, après échange, il existe n objectif(s) d'intitulé "X"` ; `l'objectif "X" existe toujours` ; `sur le <appareil>, aucun objectif et aucune tâche n'existent`. Sens : voir §12.
- Connexion : `sur le smartphone, l'application propose de créer un premier objectif et d'ajouter une première tâche` ; `sur le smartphone, le message d'erreur "ERR-001" ou "ERR-002" explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application` ; `sur le smartphone, l'utilisateur est déconnecté sans confirmation` ; `sur le smartphone, l'utilisateur peut réessayer`.
- Compte et autorisations (v1.2, Q-US-022-1) : `sur le smartphone, aucune autre fonction n'est accessible` ; `sur le <appareil>, aucune donnée n'est affichée` ; `sur le <appareil>, aucune connexion n'est demandée` ; `… aucune connexion n'est demandée avant d'afficher les données` ; `les actions de compte proposées sur le smartphone sont exactement "X" et "X"` ; `les autorisations demandées au compte Google sont exactement :` + liste ; `aucun accès à l'agenda n'est demandé` ; `aucun avertissement de Google du type « application non validée » n'est présenté` (`@recette`) ; `sur le smartphone, aucune donnée du compte "X" n'est accessible` ; `le Drive du compte "X" ne contient aucune donnée du compte "X"` ; `le Drive du compte "X" contient l'objectif "X" avec le délai AAAA-MM-JJ` ; `le Drive du compte "X" ne contient pas encore la tâche "X"`.
- Versions et Drive : `sur le <appareil>, le bandeau "BAN-CONSULTATION-SEULE" est affiché et la saisie n'est pas possible tant que l'application n'est pas mise à jour` ; `l'action "Mettre à jour" est proposée` ; `sur le smartphone, l'action "Mettre à jour" ouvre la page de téléchargement de la dernière version et ne renvoie pas vers Google Play` (DEC-021) ; `aucune écriture n'a été faite dans le Drive par le smartphone` ; `le Drive du compte "X" ne contient pas l'objectif "X"` ; `les deux appareils affichent le même intitulé pour la tâche "X", "A" ou "B"` (convergence, sans préjuger de la valeur retenue).
- Interface réelle (`@ihm`) : `sur le PC, aucun écran de Done Juan n'est affiché` ; `le navigateur du PC affiche son propre message de page inaccessible` ; `les deux onglets affichent la tâche "X" et l'objectif "X"`. **Sens (v1.2, Q-US-031-4, ANT-23)** : « aucun écran de Done Juan n'est affiché » : la navigation hors ligne échoue et aucun élément portant un code `data-etat` de l'application n'existe dans la page ; « le navigateur du PC affiche son propre message de page inaccessible » : la page courante est la page d'erreur du navigateur.
- Compte et données locales : `les données du compte "X" sont toujours présentes sur le smartphone` (+ `, y compris n modification(s) en attente`) ; `les données du compte "X" ne sont plus présentes sur le smartphone` ; `sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée`.
- Bandeaux, indicateur, mentions, erreurs et alertes : on référence **le code du catalogue de Steeve** (guide d'ergonomie §6.6, qui fait foi pour les libellés et les codes), jamais un libellé. Ces assertions s'exécutent au niveau des modèles de vue (DAT v0.6, §2.4), sans interface :
  - `le bandeau "BAN-…" est affiché` (BAN-ACCES-GOOGLE, BAN-CONSULTATION-SEULE ; BAN-RAPPEL-24H, RG-057) ; `le bandeau "BAN-…" est affiché, avec l'action "X"` (**une seule forme, avec la virgule**, v1.2 ; actions : « Se reconnecter », « Mettre à jour », « Reprendre la synchronisation ») ; `le bandeau "BAN-…" n'est pas affiché` ;
  - Bandeaux de RG-057 (DEC-025) : `sur le <appareil>, le bandeau "BAN-RAPPEL-24H" est affiché avec n modification(s) en attente` ; `… le bandeau "BAN-RAPPEL-24H" est non bloquant` ; `… le bandeau "BAN-RAPPEL-24H" n'est pas affiché` ; `sur le <appareil>, l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"` ; `sur le <appareil>, le bandeau "BAN-ACCES-GOOGLE" variante 24H mentionne n modification(s) en attente` ; `… variante 24H n'est pas affiché` ; `sur le <appareil>, un seul bandeau est affiché` ; `sur le <appareil>, aucun bandeau n'est affiché`. Les 24 h courent depuis la **plus ancienne modification en attente** (le seuil est strict : exactement 24 h ne déclenche rien) ; un bandeau fermé réapparaît à la prochaine ouverture de l'application (lancement de l'application ou rechargement de la PWA, pas un simple retour au premier plan : confirmé par le commanditaire, DEC-026) tant que des modifications sont en attente. Sur le PC en `SYN-SESSION`, au-delà de 24 h, `BAN-RAPPEL-24H` (variante `session`) porte l'action « Reprendre la synchronisation » (v1.2, Q-US-031-2 a).
  - `l'indicateur de synchronisation est "SYN-…"` (SYN-OK, SYN-INFO, SYN-HORS-LIGNE, SYN-SESSION, …) ;
  - `<l'élément> porte la mention "MEN-…"` (MEN-ATTENTE = « non synchronisé », MEN-INCOHERENCE, MEN-SANS-DELAI, MEN-HEURE-PARIS) ; `sur le <appareil>, la mention "MEN-HEURE-PARIS" <apparaît | n'apparaît pas>` ; `la date de fin de la tâche "X" <est accompagnée | n'est pas accompagnée> de la mention "MEN-HEURE-PARIS"` ; `le délai de la tâche "X" n'est jamais accompagné de la mention "MEN-HEURE-PARIS"` ;
  - `le message d'erreur "ERR-…" est affiché` ; `l'alerte "ALR-…" est affichée` (ALR-001 horloge déréglée, affichée **seulement** sur l'appareil dont l'horloge est décalée de plus de 24 h, Q-US-017-5 ; ALR-008 « repartir de zéro » découvert sur l'autre appareil).

## 7. Négations : formes figées

| Forme | Emploi |
|---|---|
| `… n'existe pas` | Élément qui n'a jamais été présent à cet endroit (par exemple, avant intégration). |
| `… n'existe plus` | Élément supprimé. |
| `aucun objectif n'existe` ; `aucune tâche n'existe` | Liste vide. |
| `… n'est pas en retard` ; `… n'a pas de date de fin` ; `… ne porte aucune alerte de délai` | |
| `… ne porte plus la mention "MEN-ATTENTE"` ; `… n'est plus "SYN-HORS-LIGNE"` | État qui change. |
| `… ne porte pas la mention "MEN-ATTENTE"` ; `le message d'erreur "ERR-…" n'est pas affiché` ; `l'alerte "ALR-…" n'est pas affichée` | État qui n'a pas changé. |
| `l'action "X" n'est pas proposée pour la tâche "X"` ; `… pour l'objectif "X"` | Liste fermée des actions (v1.2, Q-US-003-2) : terminer, rouvrir, abandonner, reprendre, créer une sous-tâche, créer un sous-objectif. |
| `aucune action ne permet à l'utilisateur de saisir l'état de l'objectif "X"` | Sens (Q-US-001-5) : aucune vue n'expose une action qui change l'état d'un objectif, et aucun cas d'usage ne l'accepte. |
| `aucun élément ne porte la mention "X"` ; `aucun changement de parent n'est enregistré pour l'objectif "X"` (aucune entrée « changement parent » dans l'historique) | v1.2 |
| `la tâche "X" n'a pas de date d'abandon` (la forme « … n'a pas de date d'abandon affichée » est retirée, Q-US-025-1) | |
| `sur le <appareil>, un seul bandeau est affiché` ; `sur le <appareil>, aucun bandeau n'est affiché` | |
| `le Drive du compte "X" ne contient pas l'objectif "X"` ; `aucune écriture n'a été faite dans le Drive par le smartphone` | |
| `aucune donnée n'est créée sur le smartphone` ; `aucune donnée n'est créée dans le Drive du compte "X"` | |
| `rien n'a été réécrit dans le Drive` | |
| `sur le smartphone, l'utilisateur n'est pas averti que …` | |

## 8. Colonnes d'`Exemples` à liste fermée

| Colonne | Valeurs admises |
|---|---|
| `appareil` | smartphone ; PC |
| `fuseau` | Europe/Paris ; America/New_York ; UTC ; Pacific/Auckland |
| `refus` | annule la connexion ; refuse les autorisations demandées |
| `cause` | a été retiré ; a expiré |
| `interruption` | l'utilisateur ferme l'application sur le smartphone ; le smartphone est éteint puis rallumé ; l'application est arrêtée brutalement sur le smartphone ; l'utilisateur ferme l'onglet de l'application ; l'utilisateur ferme le navigateur ; le PC est éteint puis rallumé |
| `altération` | supprimées ; rendues illisibles |
| `point d'entrée` | son adresse web ; l'application installée |
| `écart d'horloge` | en retard ; en avance |
| `motif` (colonne de refus : `l'enregistrement est refusé`, `la modification est refusée`, `l'action est refusée`) | uniquement les codes du §9 : un code seul, plusieurs codes séparés par `, `, ou `ERR-030 variante <variante>` (table de correspondance, guide §6.6.10) |
| `écart` (horloge) et `sens` | `sens` : en retard ; en avance. `écart` : 24 h ; 24 h 1 min ; 25 h ; 23 h 59 min ; 5 min |
| `opération`, `modification`, `action`, `changement`, `événement` (colonnes qui complètent « l'utilisateur … ») | uniquement les formes du §5 |
| `résultat`, `alerte`, `présence`, `mention`, `état`, `état attendu` (colonnes qui complètent une assertion) | uniquement les formes du §6 (l'étape fixe le sujet ; la colonne ne donne que la fin de la phrase) |
| `situation` (US-018 S16, US-031 S20) | une précondition du §1 (scénarios conformes à DEC-025) |
| `filtre` (état de la liste des tâches) | à faire ; terminée ; abandonnée |
| `tâches` (US-003 S16) | un intitulé, ou plusieurs selon la forme `"X" et "X"` |
| `sous-objectif` (US-003 S07) | absent ; atteint ; en cours ; à décliner en tâches (construction : §1) |
| `intitulé` (refus d'intitulé) | vide ; composé uniquement d'espaces |
| Valeurs d'état (assertions `l'état de … est "X"`) (v1.2, Q-US-017-9) | tâche : à faire ; terminée ; abandonnée — objectif : en cours ; atteint ; à décliner en tâches |
| `information` (tableau des modifications non retenues) (v1.2, Q-US-017-8) | intitulé ; description ; délai ; estimation ; objectifs ; parent ; état ; création |
| `valeur non retenue` et `valeur conservée` (même tableau) | une valeur de l'information (date, durée, intitulé, état) ; ou une valeur spéciale : `sous <objectif>` (placement) ; `sous-tâche de <tâche>` (création) ; `tâche supprimée` ; `objectif supprimé` ; `supprimée avec la tâche <tâche>` ; `placement annulé` ; `données effacées (repartir de zéro)` |
| Correspondance avec le catalogue (guide §6.6.9) | valeur conservée ordinaire → `ALR-009` (RG-036) ; `tâche supprimée`, `objectif supprimé`, `supprimée avec la tâche <tâche>` → `ALR-010` (RG-047) ; `placement annulé` → `ALR-011` (RG-048) ; `données effacées (repartir de zéro)` → `ALR-014`, une ligne par modification perdue, groupée sous la carte `ALR-008`, non comptée parmi les informations à lire |

## 9. Codes de motif (connexion et refus)

Les codes sont ceux du catalogue de Steeve (guide d'ergonomie §6.6, qui fait foi pour les codes et les libellés) : `ERR-001` à `ERR-006` pour la connexion (§6.6.8), `ERR-020` à `ERR-035` pour les refus de saisie et de modification (§6.6). La correspondance « motif → code » des scénarios est au §6.6.10. Un libellé peut évoluer, pas le code. Détail des connexions : US-022, section « Motifs de connexion ».

| Code | Situation |
|---|---|
| `ERR-001` | Connexion annulée. |
| `ERR-002` | Autorisations refusées (même texte que ERR-001, seul le code diffère). |
| `ERR-003` | Première connexion sur l'appareil, ou rechargement après suppression des données de l'appareil, sans réseau. |
| `ERR-004` | Reconnexion après une déconnexion, sans réseau. |
| `ERR-005` | Réseau coupé pendant la connexion. |
| `ERR-006` | Drive désactivé ou indisponible pour le compte. |
| `ERR-020` | Intitulé vide (objectif ou tâche). |
| `ERR-021` | Délai non choisi à la saisie d'une tâche ou d'une sous-tâche. |
| `ERR-022` | Estimation non choisie à la saisie d'une tâche ou d'une sous-tâche. |
| `ERR-023` | Estimation de 0 h, ou non multiple de 30 min, saisie directement. |
| `ERR-030` | Deuxième niveau de sous-objectifs. Variantes : `objectif-a-des-sous-objectifs` (l'objectif déplacé en a déjà) ; `cible-est-sous-objectif` (la cible est déjà un sous-objectif). |
| `ERR-031` | Objectif placé sous lui-même. |
| `ERR-032` | Ajout d'une sous-tâche à une tâche abandonnée. |
| `ERR-033` | Modification de l'estimation d'une tâche qui a des sous-tâches (estimation calculée). |
| `ERR-034` | Modification des objectifs d'une sous-tâche (objectifs hérités). |
| `ERR-035` | Terminer une tâche qui a des sous-tâches restantes (n variable). |

## 10. Tags

- `@US-xxx`, `@RG-xxx`, `@LOT-001` : obligatoires sur chaque scénario (traçabilité).
- `@ihm` : le scénario ne peut se vérifier que par l'interface réelle (navigateur, installation, onglets, saisie en cours). Les bandeaux, mentions et indicateurs se vérifient par leur code du catalogue, au niveau des modèles de vue. Les autres scénarios s'exécutent au niveau des cas d'usage (conventions techniques §9.6, §9.7).
- `@recette` : le scénario ne s'automatise pas ; il se déroule à la main en recette métier (E14), car il dépend d'un service extérieur que le banc ne peut pas simuler, ou d'un comportement réel de l'appareil (US-018 S09b : arrêt forcé et redémarrage du téléphone, Q-US-018-3).
- **Scénarios « système » du smartphone (v1.2, Q-US-018-3)** : US-018 S09 et S13 s'exécutent au niveau des cas d'usage, avec un stockage local persistant simulé (un arrêt brutal est l'abandon de l'instance sans fermeture propre) ; S09b les complète à la main sur l'appareil.

## 11. Historique (RG-050) : étapes et rendu (v1.2, Q-US-001-2)

**Étapes.**
- `l'historique contient, pour l'objectif "X" :` ou `… pour la tâche "X" :` + tableau (événement, journée, avant, après) : **toutes** les entrées de l'élément, dans l'ordre chronologique.
- `l'historique de l'objectif "X" se termine par :` ou `l'historique de la tâche "X" se termine par :` + même tableau : les **dernières** entrées de l'élément, dans l'ordre chronologique (sert quand le contexte a déjà produit des entrées).
- `l'historique ne contient aucune entrée "<événement>" pour l'objectif "X"` ou `… pour la tâche "X"`.
- `l'historique n'est affiché nulle part dans l'application` : aucune vue n'expose l'historique (Q-US-001-5).

**Colonne `événement`, liste fermée** : création ; modification délai ; modification estimation ; rattachement ; détachement ; changement parent ; fin ; réouverture ; abandon ; reprise ; suppression. L'intitulé et la description ne sont pas historisés (RG-050 ne les cite pas).

**Colonne `journée`** : la journée de Paris de l'événement (RG-008, RG-053).

**Colonnes `avant` et `après`** (valeurs telles que l'utilisateur les voyait) :

| Événement | avant | après |
|---|---|---|
| création | vide | Les seules valeurs renseignées, dans cet ordre, chacune précédée de son nom, séparées par `, ` : `tâche parente <tâche>` (sous-tâche) ou `parent <objectif>` (sous-objectif) ; `délai <date>` ; `estimation <durée>` ; `objectifs <o1>` (plusieurs : `objectifs <o1>, <o2> et <o3>`, dans l'ordre de saisie ; toujours en dernier). Un objectif créé sans délai ni parent a une case vide. Les objectifs d'une sous-tâche, hérités, ne sont pas cités. |
| modification délai ; modification estimation | ancienne valeur brute (vide si absente) | nouvelle valeur brute (vide si retirée). Pour une tâche parente, l'estimation est la somme calculée de ses sous-tâches. |
| rattachement | vide | intitulé de l'objectif |
| détachement | intitulé de l'objectif | vide |
| changement parent | intitulé de l'ancien parent, ou `aucun (objectif principal)` | intitulé du nouveau parent, ou `aucun (objectif principal)` |
| fin ; réouverture ; abandon ; reprise | état : `à faire`, `terminée, date de fin <date>` ou `abandonnée, date d'abandon <date>` | idem |
| suppression | vide | vide |

**Conséquences d'un autre événement** :
- une conséquence **enregistrée** a sa propre entrée : abandon et reprise en cascade des sous-tâches (une entrée par sous-tâche) ; réouverture de la tâche parente entraînée par la réouverture d'une sous-tâche ou par l'ajout d'une sous-tâche à une tâche terminée ; estimation recopiée à la suppression de la dernière sous-tâche (`modification estimation`, avant = somme calculée, après = valeur recopiée) ; placement annulé par RG-048 (`changement parent`) ;
- une conséquence qui **se déduit** d'une autre entrée n'a pas d'entrée propre : tâches détachées d'un objectif supprimé, sous-objectifs devenus principaux, sous-tâches supprimées avec leur tâche parente. La suppression de l'élément supprimé suffit.
- « Annuler » dans le message qui suit « Terminer » est une réouverture : une entrée `fin`, puis une entrée `réouverture` (Q-US-003-1).

## 12. Sens observables fixés (v1.2, Q-US-017-9, Q-US-001-5)

| Étape | Sens vérifié |
|---|---|
| `les données présentes sur le <appareil> s'affichent aussitôt` | La vue est produite à partir des données de l'appareil avant toute réponse du Drive. |
| `toutes les fonctions restent utilisables` | Aucune action de saisie n'est désactivée ni refusée. |
| `les données sont identiques à celles enregistrées` | Les données métier lues sont égales à celles du Drive. |
| `aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte "X"` | Le banc n'observe aucune requête sortante hors du service Google simulé. |
| `toutes ces opérations ont été acceptées` | Aucune des opérations jouées dans le scénario n'a été refusée. |
| `les deux appareils affichent le même intitulé pour la tâche "X", "A" ou "B"` | Convergence : les deux appareils ont le même intitulé, égal à l'une des deux valeurs. |
| `l'historique n'est affiché nulle part dans l'application` | Aucune vue n'expose l'historique. |
