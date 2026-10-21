# Glossaire d'étapes figé — tests métiers de LOT-001

Version 1.1 — 2026-10-21 — Pepper (E7, remarques ANT-9, ANT-10, PEP-7, ANT-2, ANT-15 ; ANT-21 : motifs de refus rattachés aux codes du catalogue). Ce fichier n'est pas lu par Cucumber (extension `.md`). Il fige le vocabulaire des étapes des dix fichiers `.feature` du lot : une étape qui n'y figure pas ne doit pas être écrite sans que Pepper ait mis ce glossaire à jour. Anthony en tire les définitions d'étapes (E9) ; Benjamin n'en crée pas d'autres.

Conventions :
- `"…"` : texte entre guillemets (intitulé, nom de compte, libellé) ; `AAAA-MM-JJ` : date ; `HH:MM` : heure ; `durée` : « 30 min », « 1 h », « 2 h 30 », « 0 h » ; `n` : entier.
- **Préfixe d'appareil.** Toute étape `Quand` ou `Alors` peut commencer par `sur le smartphone, ` ou `sur le PC, ` ; `sur les deux appareils, ` et `sur chacun des deux appareils, ` ne s'emploient qu'avec une assertion. Sans préfixe, l'appareil est le seul en jeu dans le scénario.
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
| `les tâches suivantes :` + tableau (colonnes : intitulé, état, délai, estimation, objectifs, tâche parente) | États : « à faire », « terminée », « abandonnée ». **Convention de date (ANT-16)** : ces tâches sont créées par les cas d'usage, qui produisent des dates et des entrées d'historique (RG-050). Une tâche de contexte « terminée » a pour date de fin, et une tâche « abandonnée » pour date d'abandon, **la date du contexte**, c'est-à-dire la date de la dernière étape `nous sommes le …` jouée avant elle (par défaut celle du `Contexte`, 2026-10-21), sauf si le tableau porte une colonne facultative `date de fin` ou `date d'abandon`, qui l'emporte. L'entrée d'historique correspondante porte la même journée. |
| `que le smartphone est sans réseau` ; `que le PC est sans réseau` ; `que le réseau du smartphone est intermittent` | Le réseau revient par une étape `Quand` (§3). |
| `que l'application est ouverte sur le <appareil>` ; `… fermée sur le <appareil>` ; `… ouverte sur le smartphone et sur le PC, connectés au réseau` ; `… ouverte dans deux onglets du PC` | |
| `que l'application n'a jamais été utilisée sur le smartphone` ; `… jamais ouverte dans le navigateur du PC` | |
| `que le smartphone est réglé sur le fuseau "X"` ; `que le PC est réglé sur le fuseau "X"` | |
| `que l'horloge du <appareil> est en avance de <écart>` ; `… en retard de <écart>` | Voir US-017 CA-13. Les écarts d'horloge s'écrivent avec leurs unités (« 24 h », « 24 h 1 min », « 23 h 59 min », « 5 min »). |
| `que l'accès au compte Google "X" a été retiré sur le <appareil>` ; `… a expiré sur le <appareil>` | |
| `que la session Google du navigateur du PC est active` ; `… a expiré` | |
| `que le Drive du compte "X" ne contient aucune donnée de l'application` ; `… contient un objectif "X" de délai AAAA-MM-JJ enregistré par le PC` ; `… est plein` ; `que le Drive est momentanément indisponible` ; `que le Drive est désactivé pour le compte "X"` | |
| `que les données de l'application ont été <altération> dans le Drive, en dehors de l'application` | Liste fermée « altération » (§8). |
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
| `sur le smartphone, l'application est mise à jour et connaît le format plus récent` |
| `dans le premier onglet, <étape>` ; `dans le second onglet, <étape>` (scénarios `@ihm` à deux onglets) |

## 3. Synchronisation et réseau (`Quand`)

| Étape | Sens |
|---|---|
| `les deux appareils échangent leurs modifications` | Chacun enregistre ses modifications dans le Drive, puis intègre celles de l'autre. |
| `le smartphone échange ses modifications avec le Drive` | Un seul appareil échange. |
| `le smartphone enregistre ses modifications dans le Drive` ; `sur le PC, l'utilisateur enregistre ses modifications dans le Drive` | Dépôt seul, sans intégration de l'autre appareil. |
| `le réseau revient sur le <appareil>` ; `… , sans aucune action de l'utilisateur` | |
| `le réseau est coupé sur le <appareil> pendant la saisie` | |
| `l'envoi au Drive est interrompu n fois avant d'aboutir` | |
| `de l'espace est libéré dans le Drive du compte "X"` ; `le Drive redevient disponible` | |
| `sur le smartphone, l'utilisateur choisit de restaurer ses données` ; `… choisit de repartir de zéro` ; `… choisit de repartir de zéro et renonce` ; `… décide plus tard` | RG-044. |
| `l'utilisateur marque comme lue la modification non retenue de la tâche "X"` | « Compris » (RG-056). |

## 4. Temps (horloge contrôlée du banc)

Aucun scénario n'attend en temps réel. Le temps ne passe que par ces étapes.

| Étape | Sens |
|---|---|
| `que nous sommes le AAAA-MM-JJ à HH:MM heure de <fuseau>` (aussi en `Quand`, sans « que ») | Positionne l'horloge. |
| `n minutes plus tard, <étape>` | L'étape est jouée n minutes après la précédente. |
| `l'horloge avance de <durée>, sans aucune action de l'utilisateur` | Fait avancer le temps sans action ; sert aux délais de RG-017 (US-017 S02, S03). |
| `l'horloge avance de <durée> depuis l'ouverture` ; `l'horloge avance de <durée> depuis la reconnexion` | Mesure le délai qui suit l'ouverture ou le geste de reconnexion (US-017 S04, S05, S06). |
| `au même instant exact, <étape>` | L'étape est jouée au même instant exact que la précédente : les deux modifications portent le même horodatage (US-017 S12b). |

## 5. Actions sur les données (`Quand`, avec ou sans préfixe d'appareil)

Liste fermée des **opérations** (colonnes `opération` des `Exemples`, et étapes simples) :
- `l'utilisateur crée un objectif "X"` suivi de `de délai AAAA-MM-JJ` ou `sans délai` (et, au besoin, `avec la description "X"` ou `sans description`) ;
- `l'utilisateur crée un sous-objectif "X" de l'objectif "X"` suivi de `, sans délai` ou `, de délai AAAA-MM-JJ` ;
- `l'utilisateur crée une tâche :` + tableau (intitulé, délai, estimation, objectifs) ;
- `l'utilisateur crée une sous-tâche de la tâche "X" :` + tableau (intitulé, délai, estimation) ;
- `l'utilisateur renomme la tâche "X" en "X"` ; `… l'objectif "X" en "X"` ;
- `l'utilisateur modifie la description de l'objectif "X" en "X"` ; `l'utilisateur retire le délai de l'objectif "X"` ;
- `sur le <appareil>, l'utilisateur commence la saisie d'une sous-tâche de la tâche "X"` puis `l'utilisateur saisit l'intitulé "X", le délai AAAA-MM-JJ et l'estimation durée` puis `l'utilisateur termine la saisie` ;
- `l'utilisateur modifie le délai de la tâche "X" en AAAA-MM-JJ` ; `… de l'objectif "X" en AAAA-MM-JJ` ;
- `l'utilisateur modifie l'estimation de la tâche "X" en durée` ;
- `l'utilisateur rattache la tâche "X" à l'objectif "X"` ; `l'utilisateur détache la tâche "X" de l'objectif "X"` ;
- `l'utilisateur place l'objectif "X" sous l'objectif "X"` ; `l'utilisateur fait de l'objectif "X" un objectif principal` ;
- `l'utilisateur termine la tâche "X"` ; `… rouvre la tâche "X"` ; `… reprend la tâche "X"` ;
- `l'utilisateur abandonne la tâche "X" et confirme` (ou `et renonce`) ; `l'utilisateur supprime la tâche "X" et confirme` (ou `et renonce`) ; `l'utilisateur supprime l'objectif "X" et confirme` (ou `et renonce`) ; `l'utilisateur demande l'abandon de la tâche "X"` ; `… la suppression de la tâche "X"` ; `… la suppression de l'objectif "X"` ;
- consultations : `l'utilisateur consulte la liste des objectifs` ; `… la liste des tâches` ; `… le détail de l'objectif "X"` ; `… le détail de la tâche "X"` ; `l'utilisateur filtre les tâches sur l'état "X"`.

Les colonnes `opération` des `Exemples` ne prennent que ces formes. Les colonnes `résultat` ne prennent que les assertions du §6.

## 6. Assertions positives (`Alors`)

- Existence : `l'objectif "X" existe` ; `… existe avec le délai AAAA-MM-JJ` ; `… existe sans délai` ; `… existe sans description` ; `… a la description "X"` ; même famille pour `la tâche "X"` ; `"X" est un objectif principal` ; `"X" est un sous-objectif de l'objectif "X"` ; `la tâche "X" est rattachée au seul objectif "X"` ; `… aux objectifs "X" et "X"` ; `la tâche "X" existe sans objectif`.
- État : `l'état de l'objectif "X" est "X"` ; `l'état de la tâche "X" est "X"` ; `la tâche "X" est "X" avec la date de fin AAAA-MM-JJ` ; `… avec la date d'abandon AAAA-MM-JJ` ; `la tâche "X" est en retard` ; `l'objectif "X" est en retard`.
- Estimation : `l'estimation de la tâche "X" est durée` ; `la tâche "X" existe avec l'estimation durée` ; `l'estimation initiale de la tâche "X" est durée`. Une estimation calculée de « 0 h » est une valeur valide (US-024, S16, S16b) ; le minimum de 30 min ne s'applique qu'à la saisie (RG-028).
- Alertes : `la tâche "X" porte une alerte de délai qui nomme l'objectif "X"` ; `l'objectif "X" porte une alerte de délai qui nomme l'objectif "X"`.
- Drive : `le Drive du compte "X" contient l'objectif "X"` ; `… la tâche "X"` ; `… la tâche "X" à l'état "X"` ; `… exactement une fois` ; `le Drive contient la tâche "X"` ; `le Drive du compte "X" contient un dossier visible nommé "X"`.
- Synchronisation : `sur le <appareil>, la tâche "X" porte la mention "MEN-ATTENTE"` ; `… l'objectif "X" porte la mention "MEN-ATTENTE"` ; `sur le <appareil>, l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec n modification(s) en attente` ; `la liste des modifications non retenues contient :` + tableau (élément, information, valeur non retenue, valeur conservée) ; `la liste des modifications non retenues est vide` ; `l'indicateur de synchronisation est "SYN-INFO"`.
- Refus et messages : `l'enregistrement est refusé avec le motif "ERR-…"` ; `la modification est refusée avec le motif "ERR-…"` ; `l'action est refusée avec le motif "ERR-…"` ; `la connexion échoue avec le motif "ERR-…"` (codes du §9). **Le motif d'un refus est toujours un code du §9, jamais un libellé en texte libre.** Plusieurs codes cumulés s'écrivent dans une même chaîne, séparés par `, ` et dans l'ordre du catalogue (`"ERR-021, ERR-022"`) ; la variante d'un code s'écrit `"ERR-030 variante <variante>"` ; `une confirmation est demandée` suivi, si besoin, de `, qui annonce …` ou `, qui précise …`.
- Opération acceptée : `sur le <appareil>, l'opération est acceptée` ; `sur le <appareil>, la saisie n'est plus bloquée`.
- Connexion : `sur le smartphone, l'application propose de créer un premier objectif et d'ajouter une première tâche` ; `sur le smartphone, le message d'erreur "ERR-001" ou "ERR-002" explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application` ; `sur le smartphone, l'utilisateur est déconnecté sans confirmation` ; `sur le smartphone, l'utilisateur peut réessayer`.
- Versions et Drive : `sur le <appareil>, le bandeau "BAN-CONSULTATION-SEULE" est affiché et la saisie n'est pas possible tant que l'application n'est pas mise à jour` ; `l'action "Mettre à jour" est proposée` ; `sur le smartphone, l'action "Mettre à jour" ouvre la page de téléchargement de la dernière version et ne renvoie pas vers Google Play` (DEC-021) ; `aucune écriture n'a été faite dans le Drive par le smartphone` ; `le Drive du compte "X" ne contient pas l'objectif "X"` ; `les deux appareils affichent le même intitulé pour la tâche "X", "A" ou "B"` (convergence, sans préjuger de la valeur retenue).
- Interface réelle (`@ihm`) : `sur le PC, aucun écran de Done Juan n'est affiché` ; `le navigateur du PC affiche son propre message de page inaccessible` ; `les deux onglets affichent …`.
- Compte et données locales : `les données du compte "X" sont toujours présentes sur le smartphone` (+ `, y compris n modification(s) en attente`) ; `les données du compte "X" ne sont plus présentes sur le smartphone` ; `sur le smartphone, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée`.
- Bandeaux, indicateur, mentions, erreurs et alertes : on référence **le code du catalogue de Steeve** (guide d'ergonomie §6.6, qui fait foi pour les libellés et les codes), jamais un libellé. Ces assertions s'exécutent au niveau des modèles de vue (DAT v0.6, §2.4), sans interface :
  - `le bandeau "BAN-…" est affiché` (BAN-ACCES-GOOGLE, BAN-CONSULTATION-SEULE ; BAN-RAPPEL-24H, RG-057) ;
  - Bandeaux de RG-057 (DEC-025) : `sur le <appareil>, le bandeau "BAN-RAPPEL-24H" est affiché avec n modification(s) en attente` ; `… le bandeau "BAN-RAPPEL-24H" est non bloquant` ; `… le bandeau "BAN-RAPPEL-24H" n'est pas affiché` ; `sur le <appareil>, l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"` ; `sur le <appareil>, le bandeau "BAN-ACCES-GOOGLE" variante 24H mentionne n modification(s) en attente` ; `… variante 24H n'est pas affiché` ; `sur le <appareil>, un seul bandeau est affiché` ; `sur le <appareil>, aucun bandeau n'est affiché`. Les 24 h courent depuis la **plus ancienne modification en attente** (le seuil est strict : exactement 24 h ne déclenche rien) ; un bandeau fermé réapparaît à la prochaine ouverture de l'application (lancement de l'application ou rechargement de la PWA, pas un simple retour au premier plan : interprétation de Starck, à confirmer) tant que des modifications sont en attente.
  - `l'indicateur de synchronisation est "SYN-…"` (SYN-OK, SYN-INFO, SYN-HORS-LIGNE, SYN-SESSION, …) ;
  - `<l'élément> porte la mention "MEN-…"` (MEN-ATTENTE = « non synchronisé », MEN-INCOHERENCE, MEN-SANS-DELAI, MEN-HEURE-PARIS) ;
  - `le message d'erreur "ERR-…" est affiché` ; `l'alerte "ALR-…" est affichée` (ALR-001 horloge déréglée).

## 7. Négations : formes figées

| Forme | Emploi |
|---|---|
| `… n'existe pas` | Élément qui n'a jamais été présent à cet endroit (par exemple, avant intégration). |
| `… n'existe plus` | Élément supprimé. |
| `aucun objectif n'existe` ; `aucune tâche n'existe` | Liste vide. |
| `… n'est pas en retard` ; `… n'a pas de date de fin` ; `… ne porte aucune alerte de délai` | |
| `… ne porte plus la mention "MEN-ATTENTE"` ; `… n'est plus "SYN-HORS-LIGNE"` | État qui change. |
| `… ne porte pas la mention "MEN-ATTENTE"` ; `le message d'erreur "ERR-…" n'est pas affiché` ; `l'alerte "ALR-…" n'est pas affichée` | État qui n'a pas changé. |
| `l'action "X" n'est pas proposée pour la tâche "X"` ; `… pour l'objectif "X"` | |
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
| `situation` (US-018 S16, US-031 S20) | une précondition du §1 ; ces deux scénarios restent à revoir après la réponse à Q-ERG-16 à 18 (RG-057) |

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
- `@recette` : le scénario ne s'automatise pas ; il se déroule à la main en recette métier (E14), car il dépend d'un service extérieur que le banc ne peut pas simuler.
