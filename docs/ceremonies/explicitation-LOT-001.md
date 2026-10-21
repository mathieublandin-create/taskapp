# Contrôle d'explicitation LOT-001 (E8)

> Anthony, responsable technique, le 2026-10-21. Étape E8 de `docs/workflow.md`. Le lot est Ready et le refinement est clos (`refinement-LOT-001.md`).
>
> **Référentiel lu intégralement :**
> - les 10 US, sections métier, « Impacts architecture » et « Impacts ergonomie » comprises ;
> - les 10 fichiers `.feature` (243 scénarios ; décomptes conformes aux US) et `GLOSSAIRE-ETAPES.md` v1.1 ;
> - le cahier des charges v0.9.1 (§6 glossaire, §7 RG-001 à RG-058, §8 ENF) ;
> - le DAT v0.8 en entier ;
> - le guide d'ergonomie v0.2.6 (§4.2 à §4.28, §5, §6 dont le catalogue §6.6) et la maquette ECR-002 (cadres L1 à L4) ;
> - `LOT-001.md` et les décisions DEC-001 à DEC-029 de `suivi-projet.md`.
>
> Aucun autre fichier n'a été modifié. Les décisions DEC-001 à DEC-029 ne sont pas rouvertes. Quand une précision peut toucher une règle validée, je l'indique : elle repassera alors par le commanditaire (E6).

## 1. Définitions utilisées

| Terme | Sens dans ce document |
|---|---|
| **Explicite** | Aucune question bloquante n'est ouverte : l'US peut être conçue (E9) et testée (E10) sans interprétation. |
| **Non explicite** | Au moins une question bloquante est ouverte, propre à l'US ou transverse et qui la concerne. |
| **Bloquante E9** | Je ne peux pas arrêter la conception : interface, modèle de données ou format Drive. Une hypothèse prise maintenant coûterait une migration ou une reprise. |
| **Bloquante E10** | La conception peut avancer, mais je ne peux pas écrire les tests ni les *step definitions* des scénarios cités. |
| **Non bloquante** | Une hypothèse par défaut est proposée. Elle sera appliquée dans la ST si le propriétaire ne répond pas autrement avant E11. Il s'agit souvent d'une régularisation documentaire. |
| **Règle validée touchée** | « Oui » : selon la réponse, la précision modifie une RG ou un CA validé (DEC-018, DEC-025). Pepper le signale et l'US repasse en E6. |

Chaque question `Q-US-xxx-n` est un échange soumis à la règle anti-boucle (itération 1/2). Les questions transverses sont numérotées sous l'US la plus concernée. Les autres US y renvoient (« concernée par »).

## 2. Synthèse

| US | Verdict | Q-US propres | Dont bloquantes | Q-US transverses qui la concernent |
|---|---|---|---|---|
| US-022 Connexion | **Non explicite** | 4 | 0 | Q-US-018-1 (B-E9), Q-US-031-1 (B-E9) |
| US-017 Synchronisation | **Non explicite** | 12 | 5 | Q-US-018-1 (B-E9) |
| US-018 Hors ligne smartphone | **Non explicite** | 3 | 1 | Q-US-017-1 (B-E9), Q-US-017-12 |
| US-031 Hors ligne PC | **Non explicite** | 4 | 1 | Q-US-018-1 (B-E9), Q-US-017-1 (B-E9) |
| US-001 Objectif | **Non explicite** | 5 | 2 | Q-US-017-1 (B-E9, S19), Q-US-024-1 |
| US-023 Sous-objectifs | **Non explicite** | 2 | 0 | Q-US-001-1 (B-E10), Q-US-001-2 (B-E9), Q-US-017-1 (B-E9) |
| US-002 Tâches | **Non explicite** | 3 | 1 | Q-US-001-2 (B-E9), Q-US-024-1 |
| US-024 Sous-tâches | **Non explicite** | 3 | 0 | Q-US-001-2 (B-E9) |
| US-003 Terminer / rouvrir | **Non explicite** | 2 | 0 | Q-US-001-2 (B-E9), Q-US-002-1 (B-E10), Q-US-017-1 (B-E9, S17) |
| US-025 Abandonner | **Non explicite** | 2 | 1 | Q-US-001-2 (B-E9), Q-US-002-1 (B-E10) |
| **Total** | 0 / 10 explicites | **40** | **11** | — |

**Lecture.** Les dix US sont bien rédigées et cohérentes avec le catalogue. Les verdicts « Non explicite » tiennent surtout à quatre points transverses, auxquels on peut répondre rapidement :
- **Q-US-001-2** : format et contenu de l'historique (RG-050). Les six scénarios d'historique utilisent des rendus incompatibles entre eux.
- **Q-US-017-1** : critère de « valeur écartée ». Le DAT §4.2 contredit US-017 S10 et quatre autres scénarios.
- **Q-US-018-1** : unité de décompte d'une « modification en attente ».
- **Q-US-031-1** : sur PC, distinction entre « accès retiré » et « session expirée ».

Les autres questions bloquantes sont circonscrites : un incrément d'US-017, une vue, un cas d'usage.

### 2.1 Liste des questions bloquantes

| Id | Propriétaire | Niveau | Objet | Règle validée touchée |
|---|---|---|---|---|
| Q-US-001-1 | Pepper | E10 | RG-047 : signalement d'un rattachement ou d'une création sous un objectif supprimé (US-001 S20, US-023 S19) | Possible (RG-047) |
| Q-US-001-2 | Pepper, avis Starck | E9 | Historique RG-050 : contenu, rendu, conséquences indirectes (6 scénarios, format Drive) | Non (précision) |
| Q-US-002-1 | Pepper et Steeve | E10 | Contenu, filtres et tri de la liste « Tâches » (S20 contre ECR-002 L1 et L4) | Non |
| Q-US-017-1 | Starck | E9 (incr. 2) | Critère de concurrence d'une valeur écartée (DAT §4.2 contre S10) | Non |
| Q-US-017-2 | Starck | E9 (incr. 3) | Granularité de RG-044 avec un fichier par appareil et un manifeste | Non |
| Q-US-017-3 | Pepper et Starck | E9 (incr. 3) | Choix RG-044 concurrents sur les deux appareils | **Oui** (complète RG-044) |
| Q-US-017-4 | Starck | E9 (incr. 2 et 4) | Faisabilité de la garantie de CA-13 avec une horloge déréglée hors ligne | **Oui** si limitation |
| Q-US-017-6 | Steeve et Pepper | E10 (incr. 2) | Point « à lire » hors de `SYN-OK` (RG-056 a contre catalogue §6.6.2) | **Oui** si option b |
| Q-US-018-1 | Pepper et Steeve, avis Starck | E9 | Unité de décompte d'une « modification en attente » | Non (précision d'affichage) |
| Q-US-025-2 | Pepper | E10 (cas d'usage `RouvrirTache`) | Rouvrir une sous-tâche terminée dont la tâche parente est abandonnée | Possible (cas non couvert par RG-023 et RG-027) |
| Q-US-031-1 | Starck | E9 | PC : distinguer la révocation (`BAN-ACCES-GOOGLE`) de la session expirée (`SYN-SESSION`) | Non |

Les questions Q-US-017-1 à 4 et 6 ne bloquent que l'incrément d'US-017 indiqué. L'incrément 1 (synchronisation de base) peut être conçu sans elles.

---

## 3. US-022 — Se connecter avec mon compte Google

**Verdict : Non explicite** (par Q-US-018-1 et Q-US-031-1).

| Contrôle | Résultat |
|---|---|
| CA testables | Oui. CA-8 (avertissement Google) est en recette manuelle (S13b, `@recette`). |
| RG référencées | RG-018, 019, 020, 035, 043, 055, ENF-05, 06, 08 : conformes au CdC v0.9.1. |
| Cas limites et cas d'erreur | Couverts ; motifs `ERR-001` à `ERR-006` conformes au §6.6.8. |
| Maquettes | ECR-010, ECR-011 (section Compte). |
| `.feature` et CA | Matrice complète (27 scénarios). En-tête « CdC v0.8 » (ANT-24). |
| Codes du catalogue | `ERR-001` à `006`, `BAN-ACCES-GOOGLE`, `SYN-SESSION`, `MEN-ATTENTE`. |
| Contradictions | Aucune dans l'US. La déconnexion avec réseau est précisée par le DAT seul (Q-US-022-4). |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-022-1 | **Glossaire.** Ces formes d'étapes sont utilisées mais absentes du glossaire v1.1 : « sur le smartphone, aucune autre fonction n'est accessible » ; « … aucune donnée n'est affichée » ; « aucun objectif et aucune tâche n'existent » ; « que sur le smartphone, l'utilisateur a créé un objectif "X" sans délai[, pas encore enregistré dans le Drive] » ; « … aucune connexion n'est demandée[ avant d'afficher les données] » ; « les actions de compte proposées sur le smartphone sont exactement "X" et "X" » ; « le bandeau "X" est affiché, avec l'action "X" » (avec virgule ; US-018 et US-031 emploient aussi la forme sans virgule : une seule forme) ; « l'indicateur de synchronisation est "X", avec l'action "X" » ; « les autorisations demandées au compte Google sont exactement : … » ; « aucun accès à l'agenda n'est demandé » ; « aucun avertissement de Google … n'est présenté » ; « aucune donnée du compte "X" n'est accessible » ; « le Drive du compte "X" ne contient aucune donnée du compte "X" » ; « le Drive du compte "X" contient l'objectif "X" avec le délai AAAA-MM-JJ » ; « une confirmation explicite est demandée, qui annonce que n modifications seraient perdues » ; « que … l'utilisateur a supprimé les données de cet appareil » ; « que les données du compte "X" sont conservées sur le smartphone, avec n modification en attente ». **Sens à fixer** pour « que l'accès au compte Google "X" a été retiré / a expiré sur le <appareil> » (US-022 S11, US-018 S11, S17c, US-031 S13, S22) : a) l'accès est retiré côté Google **et déjà constaté** par l'application ; b) il est seulement retiré côté Google et sera constaté au prochain appel. Hypothèse : a). Sans cela, US-018 S11 et S17c n'ont pas d'étape qui déclenche la détection. | Pepper | Non bloquante | Non |
| Q-US-022-2 | Première connexion, ou reconnexion, avec le réseau présent mais un Drive **momentanément** indisponible (5xx ou 429 persistants après les nouvelles tentatives) : quel motif ? a) `ERR-005` ; b) `ERR-006`. Hypothèse : a). `ERR-006` reste réservé au Drive désactivé ou refusé pour le compte (403 permanent), puisque son texte invite à « essayer avec un autre compte ». | Steeve et Pepper | Non bloquante | Non |
| Q-US-022-3 | Consultation seule (RG-058, aucune écriture dans le Drive) et compte : confirmez-vous les deux points suivants ? (1) « Supprimer les données de cet appareil » considère le dépôt comme impossible et passe directement à `CNF-SUPPR-DONNEES-PERTE`. (2) « Se déconnecter » ne tente aucun dépôt. Oui ou non. | Starck et Pepper | Non bloquante | Non |
| Q-US-022-4 | Déconnexion **avec réseau** et modifications en attente. Le DAT §4.1.5 prévoit un dernier dépôt ; CA-6 n'en parle pas. Confirmez-vous ce déroulement : l'application tente le dépôt ; `CNF-DECONNEXION` n'apparaît que si des modifications restent en attente après le dépôt, avec leur nombre. Oui ou non. | Pepper et Steeve | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-018-1 (unité de décompte : CA-6, CA-10, S08, S09a, S14, S17a, S17b, S19) ;
- Q-US-031-1 (CA-7 sur le PC ; S23).

**Préalable inchangé** : le test technique R1, R2 et R11 doit avoir lieu avant E9 (R11 conditionne CA-8 sur le PC).

---

## 4. US-017 — Retrouver mes données sur smartphone et PC

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui, avec l'horloge contrôlée (délais d'une heure et d'une minute). La dernière phrase de CA-13 n'est pas testée (Q-US-017-4). |
| RG référencées | RG-017, 018, 020, 021, 035, 036, 044, 047 à 049, 053, 054, 056, 058 : conformes. |
| Cas limites et cas d'erreur | Couverts, sauf deux trous : choix RG-044 concurrents (Q-US-017-3) et horloge déréglée hors ligne (Q-US-017-4). |
| Maquettes | ECR-011 (cadres A à L), ECR-010. |
| `.feature` et CA | 37 scénarios ; matrice complète ; en-tête « CdC v0.8 ». |
| Codes du catalogue | `ERR-011`, `ERR-012`, `ALR-001`, `SYN-INFO`, `SYN-SESSION`, `MEN-ATTENTE`, `MEN-INCOHERENCE`, `MEN-HEURE-PARIS`, `BAN-CONSULTATION-SEULE`. |
| Contradictions | DAT §4.2 contre S10 (Q-US-017-1) ; RG-056 a contre catalogue §6.6.2 (Q-US-017-6) ; DAT §6.4 contre CA-13 (Q-US-017-5) ; version de schéma affichée : DAT contre catalogue (Q-US-017-10). |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-017-1 | **Critère de « valeur écartée ».** Le DAT §4.2 consigne une valeur perdue « quand une valeur distante l'emporte sur une valeur locale **pas encore déposée** ». Dans S10, le PC, en ligne, saisit « A », qui est donc déposé. Le smartphone, hors ligne, saisit « B » dix minutes plus tard. Avec le critère du DAT, rien n'est consigné, alors que S10, US-018 S07, US-031 S10, US-003 S17 et US-001 S19 attendent l'entrée. Le critère est-il celui-ci : « une valeur est écartée si l'écriture gagnante a été faite sans connaissance d'elle, c'est-à-dire si la valeur que l'écriture gagnante a remplacée n'est pas la valeur perdue » ? Sa mise en œuvre conserve, avec chaque écriture de champ, l'HLC de la valeur remplacée. Oui ou non ; si non, quel critère ? Le DAT §4.2 est à aligner. | Starck | **Bloquante E9** (incr. 2) | Non |
| Q-US-017-2 | **Granularité de RG-044**, avec un fichier d'état par appareil et un `manifeste.json`. (a) Si seul le fichier d'**un** appareil est supprimé, illisible ou modifié à la main, quels appareils affichent `ERR-012` : seulement son propriétaire, ou les deux ? (b) « Restaurer » réécrit-il seulement le fichier de l'appareil qui restaure et le manifeste, le fichier altéré de l'autre appareil étant ignoré jusqu'à ce que son propriétaire le réécrive ? (c) Le fichier d'un autre appareil supprimé à la main est indiscernable d'un appareil jamais vu, donc ne déclenche aucun avertissement : confirmez-vous ? (d) Le manifeste a plusieurs écrivains (première connexion, restauration, repartir de zéro) : quelle règle en cas d'écritures concurrentes ? Scénarios concernés : S18, S20, S21, S32 et S33. L'étape « un fichier de données de l'application » de S32 ne dit pas lequel. | Starck | **Bloquante E9** (incr. 3) | Non |
| Q-US-017-3 | **Choix RG-044 concurrents.** Les deux appareils constatent l'absence des données. Avant tout échange, le PC choisit « Restaurer » et le smartphone « Repartir de zéro ». Quel choix s'applique ? a) « repartir de zéro » l'emporte toujours (nouvelle `generation`) ; b) le choix le plus récent ; c) le premier déposé. Et si l'autre appareil a déjà restauré, la question restée en attente (« Décider plus tard ») disparaît-elle d'elle-même ? Oui ou non. | Pepper et Starck | **Bloquante E9** (incr. 3) | **Oui** : complète RG-044, à soumettre au commanditaire |
| Q-US-017-4 | **CA-13, « quel que soit l'écart, la modification réellement la plus récente l'emporte ».** La correction d'horloge (DAT §6.4) n'est mesurée qu'à un échange avec Google ; hors ligne, l'appareil applique le dernier écart connu. Si l'horloge est déréglée pendant que l'appareil est hors ligne, ou après un redémarrage hors ligne, ses modifications sont mal horodatées et peuvent l'emporter sur des modifications réellement plus récentes. Deux options : a) la garantie est tenue dans tous les cas, et vous précisez le mécanisme (par exemple une horloge monotone depuis le dernier échange, avec son comportement après un redémarrage) ; b) la garantie ne vaut que pour les modifications faites après la dernière mesure de l'écart. Dans le cas b), CA-13 est à reformuler et à revalider par le commanditaire. Par ailleurs, aucun scénario ne vérifie cette phrase avec un écart de plus de 24 h : Pepper en ajoute-t-il un ? Oui ou non. | Starck, puis Pepper | **Bloquante E9** (incr. 2 et 4) | **Oui** si b) |
| Q-US-017-5 | Le DAT §6.4 indique qu'« une valeur reçue datée de plus de 24 h dans le futur déclenche un avertissement », donc sur l'appareil **à l'heure**. CA-13 et S13a affichent `ALR-001` sur l'appareil **déréglé**. Confirmez-vous ceci : `ALR-001` ne s'affiche que sur l'appareil dont l'horloge diffère de plus de 24 h de l'en-tête `Date` de Google ; l'autre appareil n'affiche rien ? Le DAT est à aligner. | Starck | Non bloquante | Non |
| Q-US-017-6 | **Point « à lire » hors de `SYN-OK`.** RG-056 a demande un signalement « discret et permanent » tant qu'une information n'est pas lue. Le catalogue §6.6.2 en fait un modificateur de `SYN-OK` seulement, « jamais d'un autre état ». Hors ligne (`SYN-HORS-LIGNE`), ou avec des modifications à envoyer (`SYN-ATTENTE`), une information non lue est-elle signalée ? a) oui : le point s'ajoute à tout état, et le catalogue est à corriger ; b) non : RG-056 a est à reformuler et revalider. | Steeve et Pepper | **Bloquante E10** (incr. 2) | **Oui** si b) |
| Q-US-017-7 | **Préfixe d'appareil des assertions dans un scénario à deux appareils.** Exemples : « la liste des modifications non retenues contient : » (S10, S24, S25 ; US-001 S19 ; US-002 S23 ; US-018 S07 et S08 ; US-023 S16 à S18c ; US-024 S22 ; US-031 S10 et S11) ; « l'état de l'objectif … » (US-003 S18). Le glossaire dit : « sans préfixe, l'appareil est le seul en jeu ». Hypothèse : sans préfixe dans un scénario à deux appareils, l'assertion vaut « sur chacun des deux appareils ». À confirmer, ou ajouter les préfixes. | Pepper | Non bloquante | Non |
| Q-US-017-8 | **Valeurs fermées du tableau « modifications non retenues ».** Colonne `information` : intitulé, délai, parent, état, création, et éventuellement description, estimation, objectifs ? Valeurs spéciales des colonnes `valeur non retenue` et `valeur conservée` : « tâche supprimée », « objectif supprimé », « placement annulé », « sous <objectif> », « sous-tâche de <tâche> », « supprimée avec la tâche <tâche> », « données effacées (repartir de zéro) ». Elles sont à inscrire au glossaire §8, avec leur correspondance avec `ALR-008` à `ALR-011`. Pour S21 : les modifications perdues par « repartir de zéro » figurent-elles a) dans la liste (une ligne `DiscardedItem` par modification), en plus de la carte `ALR-008` ; b) seulement dans la carte `ALR-008` ? Hypothèse : a), conforme au DAT §4.2. Le catalogue n'a aucun code pour cette forme : Steeve en crée-t-il un ? | Pepper et Steeve | Non bloquante | Non |
| Q-US-017-9 | **Sens observable et liste fermée.** Hypothèses proposées : « les données présentes sur le <appareil> s'affichent aussitôt » : le modèle de vue de la liste est produit depuis `DepotLocal` avant toute réponse du faux Drive ; « toutes les fonctions restent utilisables » (S15) : aucune action de saisie n'est désactivée ni refusée ; « les données sont identiques à celles enregistrées » (S08) : l'état métier lu est égal à celui du Drive ; « 3 modifications ont été enregistrées … » et « les 3 modifications sont intégrées » (S05) : trois opérations fixées par la step (création, renommage, changement de délai) ; « aucune donnée … transmise ailleurs que dans le Drive » (S07) : le banc n'observe aucune requête sortante hors du faux Google. Liste fermée des valeurs d'état à ajouter au glossaire §8 : tâche (« à faire », « terminée », « abandonnée »), objectif (« en cours », « atteint », « à décliner en tâches »). Formes absentes du glossaire : « toutes ces opérations ont été acceptées » (S01), « les deux appareils affichent le même intitulé pour la tâche "X", "A" ou "B" », « la liste … contient exactement n information(s) », « la liste … contient [toujours] une valeur écartée pour <information> de la tâche "X" », « l'indicateur de synchronisation est toujours / n'est pas "X" », « que sur le smartphone, le message d'erreur "X" est affiché », « l'utilisateur se voit proposer "restaurer" et "repartir de zéro" », « aucun choix entre restaurer et repartir de zéro n'est demandé », « que … le délai de l'objectif "X" a été changé à la main en …, le fichier restant lisible », « l'objectif "X" a été créé et n'est pas encore synchronisé », « l'objectif "X" existe toujours », « la tâche "X" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "X" ». | Pepper | Non bloquante | Non |
| Q-US-017-10 | RG-058 : (a) sur le PC, que fait « Mettre à jour » ? Hypothèse : activation du service worker en attente, puis rechargement, sans perte des modifications en attente. (b) Le message de consultation seule affiche-t-il la version de schéma attendue, comme le prévoient le DAT §4.2 et les impacts d'US-017, alors que le texte de `BAN-CONSULTATION-SEULE`, qui fait foi, ne la contient pas ? Oui ou non. | Starck et Steeve | Non bloquante | Non |
| Q-US-017-11 | RG-044 : (a) après « Décider plus tard », le choix est-il reproposé à chaque ouverture, ou seulement disponible dans la feuille (`SYN-ACTION`, `ERR-012`) ? Hypothèse : feuille seulement. (b) « Restaurer » choisi sans réseau : a) refusé, avec un message ; b) mémorisé et exécuté au retour du réseau ? Hypothèse : b). | Steeve | Non bloquante | Non |
| Q-US-017-12 | Échec persistant de synchronisation (§6.3 ; `SYN-RETENTATIVE`, 3 tentatives au plus avant `SYN-ACTION`) : (a) quel code `ERR-` pour un échec réseau ou 5xx persistant ? Aucun code de `ERR-010` à `ERR-015` ne le couvre. (b) Les tentatives continuent-elles après `SYN-ACTION` (DAT §4.4.5 : attente exponentielle jusqu'à 5 min) ? Oui ou non. US-018 S14 et US-031 S18 (3 interruptions, puis succès) passent par cet état. | Steeve et Starck | Non bloquante | Non |

**Concernée aussi par** Q-US-018-1 (décompte des modifications en attente dans la feuille et dans `SYN-ATTENTE`).

---

## 5. US-018 — Utiliser l'application sans réseau sur mon smartphone

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui ; RG-057 est entièrement scénarisée (S15 à S17d), avec un seuil strict. |
| RG référencées | RG-019, 021, 035, 036, 047 à 049, 057 : conformes (CdC v0.9.1, DEC-025, DEC-026). |
| Cas limites et cas d'erreur | Couverts. Les scénarios système (arrêt brutal, coupure pendant la saisie) n'ont pas de niveau d'exécution fixé (Q-US-018-3). |
| Maquettes | ECR-011 B, J, L ; ECR-002 L3 ; ECR-008 E. |
| `.feature` et CA | 22 scénarios, matrice complète. |
| Codes du catalogue | `SYN-HORS-LIGNE`, `MEN-ATTENTE`, `BAN-RAPPEL-24H`, `BAN-ACCES-GOOGLE` variante `24H`, `ERR-003`. |
| Contradictions | Aucune. Le glossaire §6 porte encore « interprétation de Starck, à confirmer » (caduc depuis DEC-026), et le §8 « situation … à revoir » (caduc depuis DEC-025) : à nettoyer avec ANT-24. |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-018-1 | **Unité de décompte d'une « modification en attente ».** Elle vaut pour `SYN-HORS-LIGNE`, `SYN-ATTENTE`, `BAN-RAPPEL-24H`, la variante `24H`, `CNF-DECONNEXION`, `CNF-SUPPR-DONNEES-PERTE`, `SYN-FEUILLE-EN-ATTENTE` et l'étape « … y compris n modifications en attente ». Exemple : hors ligne, l'utilisateur crée l'objectif X, puis le renomme, puis change deux fois le délai de la tâche T. Que vaut n ? a) 2 : éléments distincts portant `MEN-ATTENTE` ; b) 4 : opérations de l'utilisateur ; c) autre. Les scénarios actuels ne départagent pas ces options, mais la conception en dépend. En b), il faut un journal local des opérations : DS-11 n'a pas de file, et le journal métier (RG-050) n'enregistre pas les renommages. Avis de Starck attendu sur ce point. Confirmez aussi l'instant retenu pour « la plus ancienne modification en attente » (RG-057) : celui de la première écriture locale non déposée, quel que soit l'élément. | Pepper et Steeve, avis Starck | **Bloquante E9** | Non (précision d'affichage), sauf si Pepper en juge autrement |
| Q-US-018-2 | **Glossaire.** S13 emploie « commence la création d'une sous-tâche "X" de la tâche "X", de délai …, estimée à … ». Cette forme est absente du glossaire, qui prévoit la séquence d'US-031 S17 : « commence la saisie d'une sous-tâche … », « saisit l'intitulé … », « termine la saisie ». Alignez-vous S13 sur cette séquence ? Oui ou non. Autres formes absentes : « crée une sous-tâche "X" de la tâche "X", de délai …, estimée à … » (S02 ; aussi US-024 S07 et US-031 S02) ; « sur le PC, après échange, il existe n objectif d'intitulé "X" » (S14) ; « le bandeau "X" est affiché avec l'action "X" », sans virgule (voir Q-US-022-1) ; « le bandeau "X" est affiché avec n modification(s) en attente » (le glossaire a la forme, mais le pluriel est à fixer en une seule définition). | Pepper | Non bloquante | Non |
| Q-US-018-3 | **Niveau d'exécution des scénarios qui relèvent du système** sur smartphone : S09 (« éteint puis rallumé », « arrêt brutal ») et S13 (« réseau coupé pendant la saisie »). DS-14 exclut tout bout-en-bout automatisé sur Android en v1. Proposition : exécution au niveau des cas d'usage, avec un `DepotLocal` persistant simulé (un arrêt est un abandon de l'instance sans fermeture propre), complétée par une vérification manuelle sur appareil en recette technique (E14, Starck). Faut-il en plus une variante `@recette` de S09 ? Oui ou non. | Pepper et Starck | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-017-1 (S07 et S08 : valeurs écartées) ;
- Q-US-017-12 (S14) ;
- Q-US-022-1 (sens de « l'accès a été retiré »).

---

## 6. US-031 — Utiliser l'application sans réseau sur mon PC

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui. Sept scénarios `@ihm` sont exécutés par cucumber-js et Playwright (DAT §3.3). |
| RG référencées | RG-017, 019, 021, 035, 036, 047 à 049, 057 : conformes. |
| Cas limites et cas d'erreur | Couverts. La navigation privée n'est pas scénarisée, ce qui est justifié. |
| Maquettes | ECR-011 H, I, J, L (déclinaison PC identique) ; ECR-002 ; ECR-007. |
| `.feature` et CA | 27 scénarios, matrice complète. |
| Codes du catalogue | `SYN-SESSION`, `SYN-HORS-LIGNE`, `MEN-ATTENTE`, `MEN-INCOHERENCE`, `BAN-RAPPEL-24H`, `BAN-ACCES-GOOGLE`. |
| Contradictions | CA-10 c renvoie à « CA-8 » au lieu de CA-9 (Q-US-031-3). |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-031-1 | **PC : retrait de l'accès ou session expirée ?** Avec Google Identity Services (modèle « jeton », sans jeton de rafraîchissement), une demande silencieuse de jeton échoue-t-elle de la même façon quand la session Google du navigateur a expiré et quand l'accès a été retiré ? (a) Comment l'application distingue-t-elle `SYN-SESSION` et `ERR-015`, sans bandeau, de `BAN-ACCES-GOOGLE` et `ERR-010` ? (b) Si ce n'est pas possible avant un geste de l'utilisateur, quel état afficher ? Proposition : `SYN-SESSION`, puis `BAN-ACCES-GOOGLE` si le geste de reconnexion aboutit à un refus ou à `invalid_grant`. (c) Sur le PC, « accès expiré » (RG-035, US-022 CA-7, US-031 CA-9) équivaut-il à « session Google du navigateur expirée », donc jamais de bandeau ? Point à vérifier pendant le test technique R2 et R11. Scénarios : US-031 S13, S22, S22b ; US-022 S23. | Starck | **Bloquante E9** (adaptateur `FournisseurAuth` web) | Non |
| Q-US-031-2 | PC en `SYN-SESSION`, avec une modification en attente depuis plus de 24 h : `BAN-RAPPEL-24H` s'affiche-t-il ? a) oui : RG-057 porte sur l'âge de la modification, quel que soit l'état ; b) non. Le catalogue (« aucun bandeau pour `SYN-SESSION` ») et la phrase de l'US (« la session expirée reste sans bandeau ») se lisent dans les deux sens. Hypothèse : a). | Steeve et Pepper | Non bloquante | Non |
| Q-US-031-3 | Correction rédactionnelle : CA-10 c renvoie à « CA-8, RG-035 », alors que la perte d'accès est le CA-9 d'US-031 (copie d'US-018). | Pepper | Non bloquante | Non |
| Q-US-031-4 | **Glossaire et ANT-23.** Formes absentes : « le Drive du compte "X" ne contient pas encore la tâche "X" » ; « aucun élément ne porte la mention "X" » ; « les deux onglets affichent la tâche "X" et l'objectif "X" » ; « que la session Google du navigateur du PC est active » (présente au §1, à garder telle quelle). Sens proposé pour S14 (ANT-23) : « aucun écran de Done Juan n'est affiché » signifie que la navigation Playwright hors ligne échoue (`net::ERR_INTERNET_DISCONNECTED`) et qu'aucun élément portant un `data-etat` de l'application n'existe ; « le navigateur du PC affiche son propre message de page inaccessible » signifie que la page courante est la page d'erreur du navigateur. À confirmer. | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-018-1 (décompte : S04, S19 à S22) ;
- Q-US-017-1 (S10, S11) ;
- Q-US-022-1 (sens de « l'accès a été retiré »).

---

## 7. US-001 — Créer et gérer un objectif

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui. |
| RG référencées | RG-001, 002, 004, 024, 025, 045, 046, 047, 050, 053, 054 : conformes. |
| Cas limites et cas d'erreur | Couverts : intitulé vide ou blanc, doublon, changement d'heure, voyage. |
| Maquettes | ECR-008, ECR-003. |
| `.feature` et CA | 21 scénarios, matrice complète. |
| Codes du catalogue | `ERR-020`, `MEN-SANS-DELAI`. |
| Contradictions | Rendu de l'historique S21 incompatible avec US-023 S20, US-002 S24 et US-024 S23 (Q-US-001-2). |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-001-1 | **RG-047, ce qui est signalé.** CA-10 prévoit que l'utilisateur est « informé des modifications écartées ». Dans S20 (et dans US-023 S19), après fusion, la liste des modifications non retenues contient-elle une entrée : (a) pour le rattachement de « Annexe » à l'objectif supprimé ? Oui ou non. (b) pour la création de « Version imprimable » sous l'objectif supprimé, devenue objectif principal ? Oui ou non. Si oui, ajouter l'assertion et la forme (information, valeur non retenue, valeur conservée) à S20 et à US-023 S19. | Pepper | **Bloquante E10** (US-001 S20, US-023 S19) | Possible (RG-047) |
| Q-US-001-2 | **Historique (RG-050) : contenu et rendu.** Le journal est persisté dans le Drive : son format engage le schéma. Concerne US-001 S21, US-023 S20, US-002 S24, US-024 S23, US-003 S20 et US-025 S17. (a) **Rendu des valeurs avant et après.** Pour une création, il diffère d'un fichier à l'autre : « 2026-12-15 » (objectif, US-001), « parent Publier le guide » (sous-objectif), « délai …, estimation …, objectifs … » (tâche), « tâche parente …, délai …, estimation … » (sous-tâche). Règle proposée : pour une création, « après » énumère, dans l'ordre (tâche parente ou parent, délai, estimation, objectifs), les seules valeurs renseignées, chacune préfixée de son nom. Pour la modification d'un seul champ, les valeurs brutes sans préfixe. Pour un changement d'état, la forme d'US-003 S20 et d'US-025 S17. Conséquence : la ligne « création » d'US-001 S21 devient « délai 2026-12-15 ». Validez-vous cette règle ? Oui ou non. (b) **Libellés d'événement**, liste fermée proposée : création, modification délai, modification estimation, rattachement, détachement, changement parent, fin, réouverture, abandon, reprise, suppression. À compléter ? (c) **Conséquences indirectes.** Écrivent-elles des entrées ? Cas à trancher : suppression d'un objectif (une entrée « détachement » par tâche, « changement parent » par sous-objectif promu ?) ; abandon en cascade (une entrée « abandon » par sous-tâche ?) ; suppression d'une tâche parente (une entrée « suppression » par sous-tâche ?) ; réouverture de la tâche parente par US-003 CA-9 ou par l'ajout d'une sous-tâche à une tâche terminée (une entrée « réouverture » ?) ; estimation recopiée à la suppression de la dernière sous-tâche (une entrée « modification estimation » ; le DAT dit oui). La vélocité et le backlog des lots suivants en dépendent, et le DAT dérive ces conséquences à la lecture, sans écriture. (d) Ni l'intitulé ni la description ne sont historisés, puisque RG-050 ne les cite pas : confirmez-vous ? | Pepper, avis Starck | **Bloquante E9** (schéma du journal) et **E10** (6 scénarios) | Non (précision de RG-050) |
| Q-US-001-3 | Intitulé d'un objectif ou d'une tâche : les espaces de début et de fin sont-ils retirés à l'enregistrement ? Oui ou non. Longueur maximale : aucune, ou N caractères ? Hypothèse : espaces retirés ; aucune longueur maximale fonctionnelle. | Pepper | Non bloquante | Non |
| Q-US-001-4 | **Heure locale ambiguë dans l'étape « nous sommes le … à HH:MM heure de Europe/Paris ».** Le 2026-10-25 à 02:30 existe deux fois (US-001 S13, US-002 S16, US-003 S03, US-025 S03). Règle proposée pour le banc : première occurrence (heure d'été, UTC+2) ; une heure inexistante, comme le 2027-03-28 à 02:30, fait échouer l'étape. Validation et inscription au glossaire §4. | Pepper | Non bloquante | Non |
| Q-US-001-5 | **Glossaire.** Formes absentes : « l'objectif "X" a n tâche(s) à faire, n tâche(s) terminée(s) et n tâche(s) abandonnée(s) » ; « il existe n objectifs d'intitulé "X" » ; « la liste des objectifs présente : » (valeurs « oui » et « non », « sans délai ») ; « le détail présente l'intitulé …, la description … et le délai … » ; « le détail présente les tâches "X" et "X" » ; « le détail présente le sous-objectif "X" » ; « la tâche "X" figure parmi les tâches sans objectif » ; « l'objectif "X" a toujours n tâche rattachée » ; « l'historique contient, pour l'objectif ou la tâche "X" : » ; « l'historique n'est affiché nulle part dans l'application » (sens proposé : aucun modèle de vue n'expose le journal) ; « aucune action ne permet à l'utilisateur de saisir l'état de l'objectif "X" » (sens proposé : aucun modèle de vue n'expose cette action et aucun cas d'usage ne l'accepte) ; « crée un objectif sans délai dont l'intitulé est <vide \| composé uniquement d'espaces> » (liste fermée). | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-017-1 (S19) ;
- Q-US-017-7 (S19, préfixe) ;
- Q-US-024-1 (tableaux de contexte, S06).

---

## 8. US-023 — Organiser un objectif en sous-objectifs

**Verdict : Non explicite** (par Q-US-001-1, Q-US-001-2 et Q-US-017-1).

| Contrôle | Résultat |
|---|---|
| CA testables | Oui ; RG-048 itérative (DEC-025) est couverte par S16 à S18c. S18c est conforme à l'exemple en chaîne de RG-048 (CdC v0.9.1). |
| RG référencées | RG-002, 004, 022, 024, 025, 045, 046 à 048, 050 : conformes. |
| Cas limites et cas d'erreur | Couverts. |
| Maquettes | ECR-008, ECR-003 E. |
| `.feature` et CA | 22 scénarios, matrice complète. |
| Codes du catalogue | `ERR-030` et ses deux variantes, `ERR-031`. |
| Contradictions | Les impacts architecture décrivent encore l'annulation d'un seul déplacement (DAT v0.4). Le DAT v0.8 §4.2 fait foi et en fait un cas particulier : pas de contradiction de fond. |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-023-1 | **Refus cumulés.** Exemple : « Publier le guide », qui a des sous-objectifs, est placé sous « Version imprimable », son propre sous-objectif. C'est à la fois un cycle, un objectif qui a des sous-objectifs et une cible qui est un sous-objectif. Quel code unique ? Ordre proposé : `ERR-031` (sous lui-même), puis `ERR-030 variante objectif-a-des-sous-objectifs`, puis `ERR-030 variante cible-est-sous-objectif`. Le placement d'un objectif sous son propre sous-objectif donne `ERR-030 objectif-a-des-sous-objectifs`, et non `ERR-031`. Validez-vous ? | Steeve et Pepper | Non bloquante | Non |
| Q-US-023-2 | **Glossaire.** Formes absentes : « la liste présente "X" comme objectif principal » ; « … comme sous-objectif de "X" » ; « aucun sous-objectif n'a de sous-objectif » ; « les deux appareils présentent la même hiérarchie d'objectifs » ; « aucun changement de parent n'est enregistré pour l'objectif "X" » (sens proposé : aucune entrée « changement parent » dans l'historique) ; « le détail présente les sous-objectifs : » ; « l'objectif "X" porte une alerte de délai qui nomme l'objectif "X" » (le glossaire n'a que la forme pour une tâche) ; « l'action "créer un sous-objectif" n'est pas proposée pour l'objectif "X" » ; colonnes d'Exemples « délai du parent » et « délai du sous-objectif » (« de délai AAAA-MM-JJ » ou « sans délai »). Valeur « aucun (objectif principal) » de S20 : voir Q-US-001-2. | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-001-1 (S19) ;
- Q-US-001-2 (S20) ;
- Q-US-017-1 (S16 à S18c) ;
- Q-US-017-7 et Q-US-017-8 (tableau des modifications non retenues).

---

## 9. US-002 — Créer et gérer mes tâches

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui, sauf CA-11 (contenu et tri de la liste), ambigu (Q-US-002-1). |
| RG référencées | RG-001, 003, 004, 024, 028, 029, 045, 046, 047, 050, 053, 054 : conformes. |
| Cas limites et cas d'erreur | Couverts. |
| Maquettes | ECR-002 (L1 à L4), ECR-007, ECR-006 (guide §4.3). |
| `.feature` et CA | 25 scénarios, matrice complète. |
| Codes du catalogue | `ERR-020` à `ERR-023` (cumul « ERR-021, ERR-022 » conforme), `ERR-033`. |
| Contradictions | S20 contre ECR-002 L1 et L4 et contre le guide §4.2 (Q-US-002-1). |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-002-1 | **Contenu de la liste « Tâches » (CA-11).** S20 mêle une tâche terminée aux tâches à faire, triées par délai, sans filtre. Or la maquette ECR-002 prévoit un filtre d'état par défaut « À faire » (L1) et un filtre « Terminées » trié par date de fin (L4). Les tâches abandonnées n'y sont visibles que dans leur filtre. Le guide §4.2 ne liste pas les sous-tâches une à une : la tâche parente porte un compteur « 1/3 ». Questions : (a) quel est le filtre par défaut à l'ouverture : « À faire » ou « Tous » ? (b) S20 se lit-il avec le filtre « Tous » ? Si oui, ajouter l'étape de filtre. (c) Dans « Tous », toutes les tâches sont-elles triées par délai croissant, ou les terminées sont-elles dans une section séparée ? (d) Les sous-tâches sont-elles absentes, comme lignes, de la liste « Tâches » dans tous les filtres, « Sans objectif » compris ? (e) À délai égal, quel départage : date de création croissante, ou intitulé ? (f) Quelles valeurs fermées pour l'étape « filtre les tâches sur l'état "X" » : « à faire », « terminée », « abandonnée », « tous » ? Concerne aussi US-003 S16 et US-025 S04. | Pepper et Steeve | **Bloquante E10** (modèle de vue de la liste) | Non |
| Q-US-002-2 | « porte une alerte de délai qui nomme l'objectif "X" » (US-001 S10, US-018 S04, US-031 S02) et « … qui nomme le seul objectif "X" » (US-002) : la première forme signifie-t-elle « au moins X » ou « exactement X » ? Hypothèse : exactement X. Une seule forme au glossaire, plus « nomme les objectifs "X" et "X" ». | Pepper | Non bloquante | Non |
| Q-US-002-3 | **Glossaire.** Formes absentes : « la tâche "X" existe avec : » suivi d'un tableau ; « crée une tâche de délai …, estimée à …, dont l'intitulé est <…> » ; « commence la saisie d'une nouvelle tâche » ; « aucun délai n'est présélectionné » ; « aucune estimation n'est présélectionnée » ; « le détail de l'objectif "X" présente la tâche "X" » ; « la liste des tâches présente, dans cet ordre : » ; « les tâches "X", "X" et "X" n'existent plus » ; « une confirmation est demandée, qui annonce n sous-tâches supprimées avec la tâche ». **Convention à inscrire** : une assertion tabulaire sans « dans cet ordre » ne vérifie pas l'ordre. Oui ou non. | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-001-2 (S24) ;
- Q-US-017-1 (S23) ;
- Q-US-024-1 (contexte, S13 et S21 : tâche parente sans estimation).

---

## 10. US-024 — Décomposer une tâche en sous-tâches

**Verdict : Non explicite** (par Q-US-001-2).

| Contrôle | Résultat |
|---|---|
| CA testables | Oui ; l'estimation calculée de 0 h est explicitée (S16, S16b). |
| RG référencées | RG-003, 023, 026, 028, 029, 045 à 047, 049, 050 : conformes. |
| Cas limites et cas d'erreur | Couverts, sauf la somme nulle lors de la suppression de la dernière sous-tâche (Q-US-024-2). |
| Maquettes | ECR-007 (A, H, I, J), ECR-003, ECR-002. |
| `.feature` et CA | 24 scénarios, matrice complète. |
| Codes du catalogue | `ERR-021` à `023`, `ERR-032` à `035`, `MEN-INCOHERENCE`. |
| Contradictions | Aucune. |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-024-1 | **Convention des tableaux « les tâches suivantes : »** (glossaire §1, ANT-16), créés par les cas d'usage. Concerne aussi US-001, 002, 003, 017, 025 et 031. (a) Une tâche parente sans estimation dans le tableau (US-024 S02, S05… ; US-002 S13, S21 ; US-017 S26) serait refusée par `CreerTache` (`ERR-022`). Proposition : toutes les lignes sont d'abord créées « à faire », dans l'ordre du tableau ; une tâche parente sans estimation reçoit une estimation technique de 30 min, aussitôt remplacée par la somme de ses sous-tâches. (b) Les états « terminée » et « abandonnée » sont ensuite appliqués, d'abord aux sous-tâches, puis aux tâches parentes. L'abandon d'une sous-tâche est alors individuel, sans cascade. Sans cette règle, US-003 S13 (ajout d'une sous-tâche à une tâche terminée, d'où une confirmation) et US-025 S12 (ajout à une tâche abandonnée, d'où `ERR-032`) échouent dès le contexte. (c) Une tâche parente « abandonnée » dont des sous-tâches sont « à faire » dans le tableau : la cascade s'applique-t-elle ? Oui ou non. Validation de (a) à (c). | Pepper | Non bloquante | Non |
| Q-US-024-2 | Cas limite « suppression de la dernière sous-tâche » quand la dernière somme calculée vaut 0 h : la seule sous-tâche restante est abandonnée, puis supprimée. Quelle estimation prend la tâche redevenue simple ? a) 0 h, modifiable ensuite ; c'est une exception au minimum de RG-028 jusqu'à la prochaine saisie ; b) l'estimation saisie avant la première sous-tâche, que le DAT conserve ; c) 30 min. | Pepper | Non bloquante (hypothèse a) | Possible (RG-028, RG-029) |
| Q-US-024-3 | **Glossaire.** Formes absentes : « la tâche "X" n'a aucune sous-tâche » ; « le détail présente les sous-tâches : » ; « le détail indique n sous-tâche terminée sur n sous-tâches non abandonnées » ; « l'utilisateur est informé que l'estimation de … de la tâche "X" sera remplacée par la somme de ses sous-tâches » ; « porte une alerte de délai qui nomme la tâche parente "X" » ; « porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "X" » ; « que la tâche "X", terminée [ou abandonnée], est signalée en incohérence avec sa sous-tâche à faire "X" » (construction proposée : banc à deux appareils, fin ou abandon de la tâche parente sur le PC, création de la sous-tâche sur le smartphone hors ligne, puis échange) ; « une confirmation est demandée, qui annonce la réouverture de la tâche "X" » ; « les tâches "X" et "X" n'existent plus » ; « l'action "créer une sous-tâche" n'est pas proposée pour la tâche "X" ». | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-001-2 (S23) ;
- Q-US-017-7 et Q-US-017-8 (S22).

---

## 11. US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif

**Verdict : Non explicite** (par Q-US-001-2, Q-US-002-1 et Q-US-017-1).

| Contrôle | Résultat |
|---|---|
| CA testables | Oui ; dates de fin conformes à DEC-012 (S02, S03, PT-16). |
| RG référencées | RG-001, 008, 023, 025, 026, 045, 049, 050, 053, 054 : conformes. |
| Cas limites et cas d'erreur | Couverts. |
| Maquettes | ECR-007 (A, G, H), ECR-002 L4, ECR-003, ECR-008. |
| `.feature` et CA | 21 scénarios, matrice complète. |
| Codes du catalogue | `ERR-035`, `MEN-INCOHERENCE`, `MEN-HEURE-PARIS` (forme définie au §6.6.10). |
| Contradictions | Aucune dans l'US. CA-11 dépend de Q-US-002-1. |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-003-1 | « Annuler » dans le toast qui suit « Terminer » (guide §4.2, §4.10, §5.5 ; `TST-TERMINEE`) : est-ce a) une réouverture, avec dans l'historique une entrée « fin » puis une entrée « réouverture » ; b) une annulation pure, sans aucune entrée, la fin n'étant écrite qu'à l'expiration du toast ? Hypothèse : a). L'option b) retarde l'écriture locale, ce qui touche ENF-T-07 et la saisie hors ligne. | Steeve et Pepper | Non bloquante | Non |
| Q-US-003-2 | **Glossaire.** Formes absentes : « l'action "terminer" n'est pas proposée pour la tâche "X" », avec une liste fermée des actions : terminer, rouvrir, abandonner, reprendre, créer une sous-tâche, créer un sous-objectif ; « l'objectif "X" a un sous-objectif <absent \| atteint \| en cours \| à décliner en tâches> » (construction proposée : un sous-objectif avec respectivement aucune tâche, 1 tâche terminée, 1 tâche à faire, ou rien) ; « l'utilisateur rouvre la tâche "X" et renonce » ; « la liste des tâches contient exactement "X" » (forme pour plusieurs tâches ?) ; « la date de fin de la tâche "X" est [n'est pas] accompagnée de la mention "X" » ; « le délai de la tâche "X" n'est jamais accompagné de la mention "X" ». | Pepper | Non bloquante | Non |

**Concernée aussi par :**
- Q-US-001-2 (S20) ;
- Q-US-002-1 (CA-11, S16) ;
- Q-US-017-1 (S17) ;
- Q-US-017-7 (S18) ;
- Q-US-024-1 (contexte de S13 et S14).

---

## 12. US-025 — Abandonner une tâche

**Verdict : Non explicite.**

| Contrôle | Résultat |
|---|---|
| CA testables | Oui ; confirmation toujours demandée (Q-ERG-13). |
| RG référencées | RG-008, 023, 025, 027, 045, 049, 050, 053, 054 : conformes. |
| Cas limites et cas d'erreur | Un cas manque : la réouverture d'une sous-tâche terminée sous une tâche parente abandonnée (Q-US-025-2). |
| Maquettes | ECR-007 (C, D, D2, F), ECR-002, ECR-003. |
| `.feature` et CA | 17 scénarios, matrice complète. |
| Codes du catalogue | `CNF-ABANDON-TACHE` et `CNF-ABANDON-TACHE-CASCADE` (implicites), `MEN-INCOHERENCE`. |
| Contradictions | Aucune. |

| Id | Question | Propriétaire | Niveau | Règle validée touchée |
|---|---|---|---|---|
| Q-US-025-1 | **Glossaire.** Formes absentes : « l'utilisateur demande l'abandon de la tâche "X" » (présente au §5) ; « une confirmation est demandée, qui rappelle que la tâche pourra être reprise » ; « … qui annonce n sous-tâches abandonnées avec la tâche » ; « la tâche "X" n'a pas de date d'abandon affichée » (à aligner sur « n'a pas de date de fin ») ; « l'action "abandonner" / "reprendre" n'est pas proposée pour la tâche "X" » ; « que la tâche "X", abandonnée, est signalée en incohérence … » (voir Q-US-024-3). | Pepper | Non bloquante | Non |
| Q-US-025-2 | **Cas non couvert.** Une tâche parente est abandonnée ; l'une de ses sous-tâches avait été terminée avant l'abandon (`ETA-SOUS-TACHE-TERMINEE-AVANT`). L'utilisateur peut-il rouvrir cette sous-tâche ? Sinon, on produirait localement l'incohérence de RG-049, qu'« aucun appareil n'aurait acceptée seul ». Options : a) action non proposée, comme pour la reprise (CA-8) ; b) action proposée, avec confirmation, qui reprend aussi la tâche parente, par symétrie avec US-003 CA-9 ; c) autre. | Pepper | **Bloquante E10** (cas d'usage `RouvrirTache`) | Possible (cas non couvert par RG-023 et RG-027) |

**Concernée aussi par :**
- Q-US-001-2 (S17) ;
- Q-US-002-1 (S04, filtres) ;
- Q-US-024-1 (contexte de S12).

---

## Annexe A — Suivis non bloquants reportés en E9

| Id | Objet | Traitement prévu en E9 | Porteur |
|---|---|---|---|
| ANT-22 | `conventions.md` v0.3 | Aligner sur le DAT v0.8 et l'ADR-012 : distribution par APK ; signature dans la CI sur étiquette ; `versionCode` croissant ; publication `android/` ; hébergement GitHub Pages ou Cloudflare Pages ; décisions DEC-026 à DEC-029. Mettre à jour les entrées : CdC v0.9.1, glossaire v1.1, catalogue v0.2.6, 243 scénarios. Intégrer les réponses aux Q-US de ce document : unité de décompte, critère de valeur écartée, conventions des tableaux de contexte et des heures ambiguës. | Anthony |
| ANT-23 | Résultat observable d'US-031 S14 | Sens proposé dans Q-US-031-4 : échec de navigation hors ligne (`net::ERR_INTERNET_DISCONNECTED`), aucun élément `data-etat` de l'application, page d'erreur du navigateur. Une fois confirmé, il est écrit dans ST-US-031 (profil `ihm`). | Anthony (sens à confirmer par Pepper) |
| ANT-24 | En-têtes des `.feature` | Les dix fichiers citent « cahier des charges v0.8 » : passer à la v0.9.1. Nettoyer le glossaire : §6, « interprétation de Starck, à confirmer » (caduc, DEC-026) ; §8, colonne `situation`, « à revoir après Q-ERG-16 à 18 » (caduc, DEC-025). | Pepper |
| BEN-13 | APK et clé de signature | Socle (ST d'US-022) : créer `.gitignore` **avant** la clé (point bloquant du suivi). Clé conservée dans les secrets chiffrés de GitHub Actions, avec une sauvegarde hors ligne chez le commanditaire (DEC-027). Compte gratuit « distribution limitée » (DEC-028). Flux de signature, `apksigner verify` et contrôle du `versionCode` sur étiquette de `main` (ADR-012, DAT §7.4). APK de recette `<paquet>.recette` avec une clé de recette. Protection de `main` dès que la CI existe (DEC-029). Construction Android dans ST-US-018. | Anthony (ST), Benjamin (E12) |
| BEN-14 | Rattachement des scénarios d'US-017 à ses 4 incréments (Q-LOT-1 b, DEC-025) | Voir le tableau ci-dessous. | Anthony |
| ANT-14, BEN-2 | Ordre de réalisation | Voir A.2. Il est arrêté en E9 dans `LOT-001.md`. | Anthony |

### A.1 Incréments d'US-017 (proposition BEN-14)

| Incrément | Contenu | Scénarios US-017 | Scénarios des autres US livrés avec lui | Q-US à lever avant E9 de l'incrément |
|---|---|---|---|---|
| 1. Synchronisation de base | CRDT par champ, HLC, cycle de synchronisation, marqueur « déposé jusqu'à », `MEN-ATTENTE`, erreurs de dépôt | S02 à S08, S17a, S17b, S29 | — | Q-US-018-1 (décompte, s'il est affiché dans cet incrément) |
| 2. Conflits et modifications non retenues | Valeurs écartées, RG-056, passe de réparation RG-047 à RG-049 | S09 à S12b, S14 à S16, S24 à S26 | US-001 S19, S20 ; US-002 S23 ; US-023 S16 à S19 ; US-024 S20 à S22 ; US-003 S17 à S19 ; US-025 S14 à S16 | Q-US-017-1, Q-US-017-4, Q-US-017-6, Q-US-001-1 |
| 3. Restauration | RG-044, empreinte, `generation` | S18 à S23, S32, S33 | — | Q-US-017-2, Q-US-017-3 |
| 4. Versions, horloge et fuseau | RG-058, `ALR-001`, RG-054, couverture complète | S01, S13a, S13b, S27, S28, S30, S30b, S31 | — | Q-US-017-4 (volet `ALR-001`), Q-US-017-5 |

Chaque incrément a sa revue de code E13 (DEC-025).

### A.2 Ordre de réalisation proposé (ANT-14, BEN-2)

**Préalables :**
- le test technique R1, R2 et R11 (actions du commanditaire), avant E9 d'US-022 et d'US-017 ;
- les réponses aux questions bloquantes E9.

| Rang | Élément | Périmètre | Justification |
|---|---|---|---|
| 0 | Socle technique, dans la ST d'US-022 | Dépôt, outillage, CI, `.gitignore`, banc de test (horloge, faux Google, réseau, deux appareils, `appareilId` fixes), ports, composition web et Capacitor, `DepotLocal` cloisonné par compte | Tout en dépend |
| 1 | US-022 | Tous les scénarios | Point d'entrée ; R2 et R11 ; conforme à la condition 2 de l'architecte (`LOT-001.md` §7.1 : US-022, puis US-017, en premier) |
| 2 | US-001 | Scénarios à un appareil (S01 à S18, S21) | Premier objet métier, nécessaire pour éprouver le CRDT. **Écart à la recommandation §7.3 de l'architecte** (US-017 juste après US-022) : l'incrément 1 d'US-017 a besoin d'un objet métier pour être testé (S02 à S08 créent des objectifs). À confirmer par Starck en E9. |
| 3 | US-017, incrément 1 | Voir A.1 | Synchronisation de base, éprouvée sur les objectifs |
| 4 | US-023 | S01 à S15, S20 | Hiérarchie ; prérequis de RG-048 |
| 5 | US-002 | S01 à S22, S24 | |
| 6 | US-024 | S01 à S19, S23 | |
| 7 | US-003 | S01 à S16, S20, S21 | |
| 8 | US-025 | S01 à S13, S17 | |
| 9 | US-017, incrément 2 | Voir A.1, scénarios à deux appareils des US métier compris | Les réparations ont besoin de tous les objets métier |
| 10 | US-017, incrément 3 | Voir A.1 | |
| 11 | US-017, incrément 4 | Voir A.1 (S01 en dernier : il exige toutes les opérations du lot) | |
| 12 | US-018 | Tous les scénarios ; adaptateur SQLite, `@capacitor/network`, RG-057, APK (BEN-13) | Le smartphone est prioritaire, mais il repose sur le noyau |
| 13 | US-031 | Tous les scénarios ; service worker, Web Locks, `storage.persist()`, profil `@ihm` | Spécificités du PC |

**Point à faire valider par Jarvis et Pepper (DoD par US).** Selon cet ordre, la revue E13 d'une US métier porte sur ses scénarios à un appareil. Ses scénarios à deux appareils sont livrés et revus avec l'incrément 2 d'US-017, comme le prévoit déjà le CA-10 d'US-017 (« détail dans US-001, … »). L'US métier n'est pas déclarée « En recette » avant l'approbation de l'incrément 2.

---

## Réponses aux Q-US

> Pepper, business analyste, le 2026-10-21. Étape E8 de LOT-001, itération 1/2 de la règle anti-boucle. Réponses établies avec celles de Starck (DAT v0.9 : §4.1.5 bis, §4.1.6 bis, §4.2, §4.2.1, §4.2.2, §6.1, §6.4) et de Steeve (guide d'ergonomie v0.2.7 : §5.7, §6.6.1, §6.6.2, §6.6.3, §6.6.8, §6.6.9, §6.6.11 ; ECR-002 L5, ECR-011 M), vérifiées dans leurs fichiers. Les décisions DEC-001 à DEC-029 ne sont pas rouvertes ; le DAT, le guide d'ergonomie et `suivi-projet.md` ne sont pas modifiés.
>
> **Fichiers modifiés** : cahier des charges v0.10 ; les 10 US (sections métier, « Tests métiers », « Questions ouvertes », « Historique ») ; les 10 `.feature` (en-tête : cahier des charges v0.10, ANT-24) ; `GLOSSAIRE-ETAPES.md` v1.2 (nettoyage ANT-24 compris). Syntaxe vérifiée avec le parseur Cucumber (`@cucumber/gherkin`, dialecte `fr`) : 10 fichiers, **266 scénarios** (243 auparavant, 23 ajoutés), aucune erreur, tags `@US-xxx`, `@RG-xxx` et `@LOT-001` présents sur chaque scénario.
>
> Abréviations : « GL » = `tests/features/GLOSSAIRE-ETAPES.md` v1.2 ; « CdC » = cahier des charges v0.10 ; « US-xxx » = fichier d'US ; « .f » = fichier `.feature` de l'US.

### Synthèse

| Statut | Nombre | Q-US |
|---|---|---|
| Répondue | 36 | toutes les autres |
| Répondue (DEC-030) | 4 | Q-US-001-1, Q-US-025-2, Q-US-017-3 et Q-US-017-4 / A8 (verbatim « Reco ») |
| En attente commanditaire | 0 | — |

**Ce qui était bloquant pour Anthony, levé par DEC-030** (les points ci-dessous sont désormais définis) : US-001 S20 et US-023 S19 (E10, Q-US-001-1) ; le cas d'usage `RouvrirTache` pour une sous-tâche sous une tâche parente abandonnée (E10, Q-US-025-2) ; US-017, incrément 3 (Q-US-017-3) et la dernière phrase de CA-13 (incréments 2 et 4, Q-US-017-4 / A8 ; la conception retient le DAT §6.4, points 1 à 3). Toutes les autres questions bloquantes sont levées.

**Divergence à aligner par Starck (sans question au commanditaire)** : pour un élément créé puis supprimé hors ligne, le DAT §4.1.5 bis le compte « pour un tant que sa suppression n'est pas déposée » ; le guide §6.6.1 (Steeve) et ma réponse à Q-US-018-1 ne le comptent pas (rien à envoyer, aucune ligne dans la feuille). La règle retenue pour l'affichage est celle du guide (US-018 S05c).

**Précisions de conception de Steeve reprises comme précisions, sans changement de règle validée** : « Restaurer » choisi sans réseau est mémorisé et fait au retour du réseau ; « Repartir de zéro » n'est pas disponible sans réseau (RG-044 garde ses deux choix, le second est seulement différé ; US-017 S20b, S22b) ; action « Reprendre la synchronisation » dans `BAN-RAPPEL-24H` variante `session` (RG-057 vaut « que l'appareil soit hors ligne ou non » ; US-031 S22c).

**Lecture de RG-044 (Q-US-017-2)** : ma lecture est celle de Starck. « Rien n'est réécrit dans le Drive » protège les données altérées : l'appareil qui pose la question n'écrit rien, et l'autre appareil peut continuer d'enregistrer son propre fichier, distinct du fichier altéré, qu'il ne fusionne jamais. Aucune question au commanditaire n'est nécessaire.

### Réponses détaillées

| Q-US | Réponse | Fichiers modifiés | Statut |
|---|---|---|---|
| Q-US-022-1 | Formes ajoutées au glossaire (§1, §6, §7). Une seule forme : `le bandeau "X" est affiché, avec l'action "X"` (avec virgule). Sens retenu : a) l'accès est perdu **et déjà constaté** par l'application ; un retrait non encore constaté s'écrit avec l'étape `Quand` « l'accès … est retiré depuis le compte Google ». Sur le PC, « a expiré » ne s'emploie pas (session expirée, Q-US-031-1). | GL ; US-018.f (S17c, S17d) ; US-031.f (S22, S22b) ; US-022 | Répondue |
| Q-US-022-2 | a) `ERR-005` (réponse commune avec Steeve) ; `ERR-006` reste réservé au Drive désactivé ou refusé. | US-022 (cas limites) ; US-022.f (S20c ajouté) | Répondue |
| Q-US-022-3 | (1) Oui ; (2) Oui (réponse commune avec Starck, DAT §4.2). Aucune action de compte n'écrit dans le Drive en consultation seule. | US-022 (CA-6, CA-10 précisés) ; US-022.f (S24, S25 ajoutés) | Répondue |
| Q-US-022-4 | Oui : avec le réseau, l'enregistrement est tenté d'abord ; la confirmation n'apparaît que s'il reste des modifications en attente, avec leur nombre (réponse commune avec Steeve). | US-022 (CA-6 précisé) ; US-022.f (S09c, S09d ajoutés) | Répondue |
| Q-US-017-1 | Réponse de Starck (DAT §4.2.1) : une valeur est écartée si et seulement si l'écriture gagnante a été faite sans connaissance d'elle. Conforme à RG-036 et à CA-8 ; US-017 S10, S11, S12b, US-018 S07, US-031 S10, US-003 S17 et US-001 S19 sont vérifiés et inchangés. | US-017 (CA-8 précisé) | Répondue |
| Q-US-017-2 | Réponse de Starck (DAT §4.2.2). S32 et S33 désignent le **fichier du smartphone** ; nouveau S32b (seul le smartphone pose la question, le PC continue d'enregistrer son propre fichier) ; S20 complété (b : l'autre appareil ne repose pas la question après une restauration). Ma lecture de « rien n'est réécrit » est celle de Starck (voir ci-dessus). | US-017 (CA-9 précisé) ; US-017.f (S20, S32, S33 ; S32b ajouté) ; GL §1 | Répondue |
| Q-US-017-3 | a) « Repartir de zéro » l'emporte toujours sur « Restaurer » ; les données des deux appareils sont effacées ; les modifications non déposées de l'appareil qui avait choisi « Restaurer » sont listées dans « Modifications non retenues » ; la question laissée en attente disparaît d'elle-même. RG-044 complétée. | US-017 (CA-9, cas limites) ; US-017.f (S22c, S22d ajoutés) ; CdC RG-044 | Répondue (DEC-030) |
| Q-US-017-4 | Limite acceptée (A8) : CA-13 reformulé avec la formulation de Starck (« … sauf si l'heure de l'appareil a été changée pendant qu'il était sans réseau, application fermée ou appareil redémarré … »). Scénario S12c (écart constant de plus de 24 h) conservé ; S12d ajouté pour la limite. | US-017 (CA-13) ; US-017.f (S12c, S12d) ; GL §1 ; CdC RG-036 | Répondue (DEC-030) |
| Q-US-017-5 | Réponse de Starck : oui, `ALR-001` n'est affiché que sur l'appareil déréglé. | US-017.f (S13a complété) ; GL §6 | Répondue |
| Q-US-017-6 | Option a) (réponse de Steeve) : le point « à lire » est indépendant de l'état (`data-a-lire`) ; RG-056 a) est tenue sans modification. Étapes ajoutées : « l'indicateur de synchronisation signale n information(s) à lire » et « … ne signale aucune information à lire ». | US-017 (CA-14 précisé) ; US-017.f (S15 complété, S15b ajouté) ; GL §6 ; CdC (RG-056) | Répondue |
| Q-US-017-7 | Hypothèse retenue (sans préfixe dans un scénario à deux appareils : « sur chacun des deux appareils »), inscrite au glossaire, **et** préfixes rendus explicites dans les scénarios cités. | GL (conventions) ; US-001.f S19 ; US-002.f S23 ; US-003.f S17, S18 ; US-017.f S09, S10, S11, S14, S15, S24, S25 ; US-018.f S07, S08 ; US-023.f S16 à S18c ; US-024.f S22 ; US-025.f S14 ; US-031.f S10, S11 | Répondue |
| Q-US-017-8 | Valeurs fermées des colonnes `information`, `valeur non retenue` et `valeur conservée`, et correspondance avec `ALR-009` à `ALR-011` et `ALR-014`, inscrites au glossaire §8. S21 : option a), une ligne par modification perdue, groupée sous `ALR-008` (code `ALR-014` créé par Steeve), non comptée parmi les informations à lire. | GL §8 ; US-017 (CA-9) ; US-017.f (S21 complété) | Répondue |
| Q-US-017-9 | Sens observables proposés retenus (GL §12) ; liste fermée des états (tâche : à faire, terminée, abandonnée ; objectif : en cours, atteint, à décliner en tâches) ; toutes les formes citées ajoutées. | GL §1, §6, §8, §12 | Répondue |
| Q-US-017-10 | Réponses de Starck et Steeve : (a) « Mettre à jour » sur le PC active la version en attente puis recharge, sans perte ; (b) non, la version de schéma n'est pas affichée. Aucun scénario ne vérifie la version : rien à modifier. | — | Répondue |
| Q-US-017-11 | Réponses de Steeve : (a) feuille seulement ; (b) « Restaurer » mémorisé, « Repartir de zéro » indisponible sans réseau. Reprises comme précisions de RG-044 (voir ci-dessus). | US-017 (CA-9) ; US-017.f (S20b, S22b ajoutés) ; GL §3, §6 ; CdC (RG-044) | Répondue |
| Q-US-017-12 | Réponses de Steeve et Starck : `ERR-016` ; les tentatives continuent après `SYN-ACTION`. US-018 S14 et US-031 S18 restent valables. | GL §3 | Répondue |
| Q-US-018-1 | Option a) : nombre d'**éléments distincts** qui portent `MEN-ATTENTE` (exemple de la question : n = 2) ; la suppression d'un élément déjà enregistré compte pour 1 ; un élément créé puis supprimé hors ligne ne compte pas. Les 24 h partent de la première écriture non encore enregistrée, tous éléments confondus. Précision d'affichage, sans changement de règle. | US-018 (CA-3, CA-9) ; US-031 (CA-10) ; US-018.f (S05b, S05c, S15c ajoutés) ; GL §6 ; CdC (glossaire, RG-057) | Répondue |
| Q-US-018-2 | Oui : S13 aligné sur la séquence d'US-031 S17. Formes ajoutées, dont la forme sur une ligne de création de sous-tâche (seule admise dans une colonne d'`Exemples`) ; pluriel en une seule définition. | US-018.f (S13) ; GL (conventions, §5, §6) | Répondue |
| Q-US-018-3 | Proposition retenue (exécution au niveau des cas d'usage, avis de Starck DAT §3.3) ; oui, variante `@recette` de S09 ajoutée. | US-018 ; US-018.f (S09b ajouté) ; GL §10 | Répondue |
| Q-US-031-1 | Réponse de Starck (DAT §4.1.6 bis) : `SYN-SESSION` tant que le retrait n'est pas prouvé, `BAN-ACCES-GOOGLE` ensuite ; sur le PC, « accès expiré » = session expirée, sans bandeau. Reflétée sans changement de règle (sous réserve du test technique R2 et R11). | US-031 (CA-9) ; US-022 (CA-7) ; GL §1 | Répondue |
| Q-US-031-2 | a) (réponse commune avec Steeve) : `BAN-RAPPEL-24H`, variante `session`, avec l'action « Reprendre la synchronisation ». | US-031 (CA-10, cas limites) ; US-031.f (S22c ajouté) ; GL §6 | Répondue |
| Q-US-031-3 | Corrigé : CA-10 c) renvoie à CA-9. | US-031 | Répondue |
| Q-US-031-4 | Formes ajoutées ; sens proposé pour S14 confirmé (ANT-23). | GL §6, §7 ; US-031 (Tests métiers) | Répondue |
| Q-US-001-1 | a) Les deux cas sont signalés dans « Modifications non retenues » : rattachement d'une tâche et placement d'un sous-objectif sous un objectif supprimé de façon concurrente. RG-047 complétée ; US-001 S20 et US-023 S19 complétés. | US-001 (CA-10) ; US-023 (CA-10) ; US-001.f (S20), US-023.f (S19) ; CdC RG-047 | Répondue (DEC-030) |
| Q-US-001-2 | (a) Oui, règle validée, complétée : plusieurs objectifs s'écrivent « objectifs o1, o2 et o3 », toujours en dernier ; les valeurs sont celles que voyait l'utilisateur (estimation calculée pour une tâche parente). US-001 S21 aligné (« délai 2026-12-15 »). (b) Liste fermée retenue telle quelle (11 événements, identique au DAT §6.1). (c) Principe de Starck retenu : une conséquence **enregistrée** a son entrée (abandon et reprise en cascade, réouverture de la tâche parente, estimation recopiée, placement annulé par RG-048) ; une conséquence **déduite** n'en a pas (tâches détachées, sous-objectifs promus, sous-tâches supprimées avec leur tâche parente). (d) Confirmé. Rendu complet : GL §11. Précision de RG-050, sans changement de sens. | GL §11 ; CdC (RG-050, glossaire) ; US-001, US-002, US-003, US-024, US-025 ; US-001.f (S21 ; S22 ajouté) ; US-003.f (S22 ajouté) ; US-024.f (S10 complété) ; US-025.f (S18 ajouté) | Répondue |
| Q-US-001-3 | Hypothèse retenue : espaces de début et de fin retirés ; aucune longueur maximale. | US-001, US-002 (cas limites) ; US-001.f (S04b ajouté) ; GL §5 | Répondue |
| Q-US-001-4 | Règle retenue : première occurrence (UTC+2) ; une heure inexistante fait échouer l'étape. | GL §4 | Répondue |
| Q-US-001-5 | Formes ajoutées ; sens proposés retenus pour « l'historique n'est affiché nulle part » et « aucune action ne permet … de saisir l'état ». | GL §1, §6, §7, §11, §12 | Répondue |
| Q-US-023-1 | Ordre validé (avec Steeve) : `ERR-031`, puis `ERR-030 variante objectif-a-des-sous-objectifs`, puis `ERR-030 variante cible-est-sous-objectif`. | US-023 ; US-023.f (S11 : deux exemples ajoutés) | Répondue |
| Q-US-023-2 | Formes ajoutées ; valeur « aucun (objectif principal) » inscrite au rendu de l'historique. | GL §6, §7, §11 | Répondue |
| Q-US-002-1 | (a) « À faire » ; (b) S20 réécrit avec le filtre par défaut, l'étape de filtre « terminée » montre la tâche terminée ; (c) pas de valeur « Tous » ; (d) oui, sous-tâches jamais listées, « Sans objectif » compris ; (e) date de création croissante, puis intitulé ; (f) `à faire`, `terminée`, `abandonnée`. Réponse commune avec Steeve (guide §5.7). US-003 S16 et US-025 S04 conformes. Précision de CA-11, sans changement de règle. | US-002 (CA-11) ; US-003 (CA-11) ; US-002.f (S20 réécrit ; S20b, S20c, S20d ajoutés) ; US-003.f, US-025 ; GL §5, §6, §8 | Répondue |
| Q-US-002-2 | « Exactement X ». Une seule forme `… qui nomme l'objectif "X"`, plus `… qui nomme les objectifs "X" et "X"` ; la forme « nomme le seul objectif » est retirée. | US-002.f (S08, S10) ; GL §6 | Répondue |
| Q-US-002-3 | Formes ajoutées ; convention retenue (oui) : sans « dans cet ordre », l'ordre n'est pas vérifié ; seules les colonnes présentes sont vérifiées. | GL (conventions, §6) | Répondue |
| Q-US-024-1 | (a) Oui ; (b) Oui ; (c) Non : un tableau qui donne une tâche parente terminée ou abandonnée avec une sous-tâche à faire décrit une incohérence ; l'étape échoue, et cette situation se construit par l'étape d'incohérence. | GL §1 | Répondue |
| Q-US-024-2 | Hypothèse a) retenue : la tâche garde 0 h, modifiable ensuite au pas de 30 min. Elle découle du cas limite validé « dernière somme calculée » et de l'estimation calculée de 0 h (S16, S16b) : pas de changement de RG-028 ni de RG-029. | US-024 (cas limites) ; US-024.f (S10b ajouté) | Répondue |
| Q-US-024-3 | Formes ajoutées ; construction proposée de l'incohérence retenue. | GL §1, §6 | Répondue |
| Q-US-003-1 | a) (réponse commune avec Steeve) : « Annuler » est une réouverture ; une entrée « fin » puis une entrée « réouverture ». | US-003 (CA-13) ; GL §11 | Répondue |
| Q-US-003-2 | Liste fermée des actions retenue (terminer, rouvrir, abandonner, reprendre, créer une sous-tâche, créer un sous-objectif) ; construction du sous-objectif de contexte retenue ; formes ajoutées, dont `la liste des tâches contient exactement "X" et "X"`. | GL §1, §5, §6, §7 | Répondue |
| Q-US-025-1 | Formes ajoutées ; « n'a pas de date d'abandon » (alignée sur « n'a pas de date de fin »). | GL §6, §7 ; US-025.f (S08) | Répondue |
| Q-US-025-2 | a) Pas de réouverture directe : l'action « rouvrir » n'est pas proposée sur une sous-tâche terminée dont la tâche parente est abandonnée ; il faut d'abord reprendre la tâche parente. RG-027 complétée ; US-025 CA-12 ; US-003 (cas limite). | US-025 (CA-12) ; US-025.f (S12b ajouté) ; US-003 ; CdC RG-027 | Répondue (DEC-030) |

### Questions au commanditaire (à transmettre par Jarvis)

**Q-US-001-1 — Faut-il vous signaler un rattachement ou un sous-objectif « perdu » par la suppression d'un objectif sur l'autre appareil ?**

Situation : votre smartphone est sans réseau. Sur le PC, vous supprimez l'objectif « Publier le guide ». Pendant ce temps, sur le smartphone, vous rattachez la tâche « Annexe » à cet objectif et vous créez sous lui un sous-objectif « Version imprimable ». Au retour du réseau, la suppression l'emporte (règle déjà validée, RG-047) : « Annexe » devient une tâche sans objectif et « Version imprimable » devient un objectif principal. Rien n'est perdu, mais ce que vous avez fait sur le smartphone n'a pas l'effet attendu.

Faut-il vous l'indiquer dans la liste « Modifications non retenues » (celle qui vous signale déjà, jusqu'à « Compris », les modifications écartées) ?
- **a) Oui, les deux** : une ligne « Annexe : rattachement à Publier le guide non retenu, objectif supprimé » et une ligne « Version imprimable : placement sous Publier le guide non retenu, objectif supprimé ». ★ Recommandé.
- b) Seulement le rattachement de la tâche.
- c) Non : vous constaterez vous-même que la tâche n'a plus d'objectif et que le sous-objectif est devenu principal.

*Pourquoi a)* : sans signalement, vous pouvez croire « Annexe » rattachée à un objectif qui n'existe plus, ou chercher « Version imprimable » au mauvais endroit. C'est déjà ce que la règle prévoit pour une sous-tâche ajoutée à une tâche supprimée ; a) traite les trois cas de la même façon, conformément à l'exigence « rien ne disparaît sans que vous en soyez informé » (ENF-06). Coût : deux lignes de plus dans une liste qui existe déjà.

**Q-US-025-2 — Peut-on rouvrir une sous-tâche terminée quand sa tâche parente est abandonnée ?**

Situation : la tâche « Chapitre 1 » a deux sous-tâches. « Section A » était terminée, « Section B » à faire. Vous abandonnez « Chapitre 1 » : « Section B » est abandonnée avec elle, « Section A » reste terminée (règles déjà validées). Vous voulez ensuite rouvrir « Section A ».
- **a) Non, pas directement** : l'action « Rouvrir » n'est pas proposée sur « Section A ». Vous reprenez d'abord « Chapitre 1 » (ce qui reprend aussi « Section B »), puis vous rouvrez « Section A ». ★ Recommandé.
- b) Oui, avec une confirmation : rouvrir « Section A » reprend aussi « Chapitre 1 », et donc « Section B ».
- c) Oui, sans rien changer à « Chapitre 1 » : la tâche resterait abandonnée avec une sous-tâche à faire, et l'application la signalerait comme incohérente.

*Pourquoi a)* : c'est déjà la règle pour reprendre une sous-tâche abandonnée quand la tâche parente est abandonnée (US-025 CA-8) ; vous n'avez qu'une règle à retenir. b) reprendrait en cascade des sous-tâches sans que vous l'ayez demandé ; c) créerait volontairement une situation incohérente que l'application vous demanderait ensuite de corriger.

Selon les réponses, Pepper complète les US concernées (US-001, US-023, US-025), leurs critères et leurs scénarios ; ces points repassent par la validation du commanditaire (E6).

---

## Contrôle final (itération 2)

> Anthony, responsable technique, le 2026-10-21. Étape E8 de LOT-001, **itération 2/2** de la règle anti-boucle (dernière).
>
> **Référentiel relu** :
> - cahier des charges v0.11 ;
> - les 10 US ;
> - les 10 `.feature` : **270 scénarios**, recomptés au parseur (US-001 : 23, US-002 : 28, US-003 : 22, US-017 : 45, US-018 : 26, US-022 : 32, US-023 : 22, US-024 : 25, US-025 : 19, US-031 : 28) ;
> - `GLOSSAIRE-ETAPES.md` v1.3 ;
> - guide d'ergonomie v0.2.7 (§5.7, §6.6.1 à §6.6.11) ;
> - DAT v0.10 (§3.3, §4.1.5 bis, §4.1.6 bis, §4.2, §4.2.1, §4.2.2, §4.3, §6.1, §6.4, §9, §10) ;
> - `test-technique-R1-R2.md` §3.5 ;
> - DEC-030 dans `suivi-projet.md`.
>
> Seul ce fichier est modifié. Une Q-US « non levée » partirait en arbitrage. Je ne relève donc comme non levé que ce qui empêche réellement de concevoir (E9) ou de tester (E10). Les points mineurs sont des **hypothèses de conception** (H-n), appliquées en E9 dans les ST. Elles sont modifiables par leur propriétaire jusqu'à E11, sans nouvel échange.

### 1. Statut des 40 Q-US

**Résultat : 40 levées sur 40, 0 non levée. Aucune question ne part en arbitrage.**

| Q-US | Statut | Commentaire (si utile) |
|---|---|---|
| Q-US-022-1 | Levée | Sens a) retenu ; étape `Quand` distincte pour un retrait non constaté. |
| Q-US-022-2 | Levée | `ERR-005` (S20c). |
| Q-US-022-3 | Levée | S24 et S25 ; DAT §4.2. |
| Q-US-022-4 | Levée | S09c, S09d ; guide §6.6.7. |
| Q-US-017-1 | Levée | Contexte causal par écriture (DAT §4.2.1). Il remplace ma proposition « HLC de la valeur remplacée », dont le contre-exemple est valable. |
| Q-US-017-2 | Levée | DAT §4.2.2 ; S32, S32b, S33. |
| Q-US-017-3 | Levée | DEC-030 a) ; S22c, S22d ; voir H-5. |
| Q-US-017-4 | Levée | DEC-030 (A8) ; DAT §6.4, points 1 à 4. **Écart É-1** introduit par S12d (§3), à corriger sans arbitrage. |
| Q-US-017-5 | Levée | `ALR-001` sur le seul appareil déréglé (DAT §6.4, S13a). |
| Q-US-017-6 | Levée | `data-a-lire` indépendant ; `SYN-INFO` dérivé (guide §6.6.2) ; S15b. |
| Q-US-017-7 | Levée | Préfixes rendus explicites, et convention au glossaire. |
| Q-US-017-8 | Levée | Glossaire §8 ; `ALR-014`. |
| Q-US-017-9 | Levée | Glossaire §12. |
| Q-US-017-10 | Levée | — |
| Q-US-017-11 | Levée | S20b, S22b. |
| Q-US-017-12 | Levée | `ERR-016` ; DAT §4.3. |
| Q-US-018-1 | Levée | Éléments distincts (DAT §4.1.5 bis v0.10 aligné sur guide §6.6.1) ; S05b, S05c, S15c ; voir H-4. |
| Q-US-018-2 | Levée | — |
| Q-US-018-3 | Levée | DAT §3.3 ; S09b `@recette`. |
| Q-US-031-1 | Levée | Hypothèse de conception du DAT §4.1.6 bis, indépendante des états affichés. Protocole §3.5 ajouté. Seule la détection précoce (ligne « 401 sur jeton non échu ») dépend de R2 et R11 (PO-10). |
| Q-US-031-2 | Levée | `BAN-RAPPEL-24H`, variante `session` ; S22c. |
| Q-US-031-3 | Levée | — |
| Q-US-031-4 | Levée | Le sens de S14 est confirmé (ANT-23 clos). |
| Q-US-001-1 | Levée | DEC-030 a) ; DAT §4.2.1 étendu ; S20 (US-001), S19 (US-023) ; voir É-2 et É-3. |
| Q-US-001-2 | Levée | Glossaire §11 ; DAT §6.1. Le rendu est porté par les *step definitions* ; le format Drive est structuré. |
| Q-US-001-3 | Levée | S04b. |
| Q-US-001-4 | Levée | Glossaire §4. |
| Q-US-001-5 | Levée | — |
| Q-US-023-1 | Levée | Deux exemples ajoutés à S11. |
| Q-US-023-2 | Levée | — |
| Q-US-002-1 | Levée | Guide §5.7 ; S20 à S20d. |
| Q-US-002-2 | Levée | — |
| Q-US-002-3 | Levée | — |
| Q-US-024-1 | Levée | Glossaire §1 (construction a, b et c). |
| Q-US-024-2 | Levée | S10b (0 h conservé). |
| Q-US-024-3 | Levée | — |
| Q-US-003-1 | Levée | — |
| Q-US-003-2 | Levée | — |
| Q-US-025-1 | Levée | — |
| Q-US-025-2 | Levée | DEC-030 a) ; RG-027 ; S12b. |

### 2. Verdicts par US

| US | Verdict | Réserve |
|---|---|---|
| US-022 | **Explicite** | E9 conditionnée au test technique R1, R2 et R11 (rappel, hors explicitation). |
| US-017 | **Explicite** | E9 conditionnée au test technique. **É-1** : S12d est à corriger par Pepper avant l'E10 de l'incrément 4. Cette correction n'empêche ni l'E9 ni l'E10 des incréments 1 à 3. |
| US-018 | **Explicite** | — |
| US-031 | **Explicite** | Adaptateur `FournisseurAuth` web conçu selon le DAT §4.1.6 bis. Le résultat de R2 et R11 peut seulement retirer une ligne du tableau. |
| US-001 | **Explicite** | Hypothèses H-1 et H-2 (É-2, É-3). |
| US-023 | **Explicite** | H-1, H-2. |
| US-002 | **Explicite** | — |
| US-024 | **Explicite** | — |
| US-003 | **Explicite** | — |
| US-025 | **Explicite** | — |
| **Total** | **10 / 10 explicites** | Seule É-1 appelle une correction, ciblée sur un scénario. |

### 3. Écarts introduits par les réponses

| Id | Écart | Nature | Traitement | Bloque |
|---|---|---|---|---|
| **É-1** | **US-017 S12d contredit le DAT §6.4 et la note de CA-13 d'US-017.** Le scénario se joue sur le **smartphone**, « application fermée », **sans redémarrage**. Or, selon le DAT §6.4 point 3 et selon la note de CA-13 elle-même (« une heure changée … sans redémarrage du smartphone ne relève pas de la limite »), l'ancrage sur l'horloge monotone d'Android reste valable dans ce cas. L'heure corrigée est donc juste, et « B » (10 min après « A ») l'emporte, alors que S12d attend « A ». Autre défaut : le PC renomme au même instant physique que la création du contexte (10:00). Après le changement d'heure, l'HLC du smartphone vaut « dernier HLC + 1 ». Les deux écritures peuvent donc avoir le même instant physique, et l'issue dépendrait du compteur et de l'`appareilId`, pas du scénario. | US contre `.feature`, et DAT contre `.feature` | **Correction fermée, sans arbitrage** (alignement sur DEC-030, déjà décidée). Pepper, avec l'avis de Starck, choisit (a) ou (b) : (a) remplacer « que l'application est fermée sur le smartphone » par un redémarrage du smartphone (forme au passé à ajouter au glossaire §1, par exemple `que le smartphone a été éteint puis rallumé`) ; (b) jouer S12d sur le **PC**, application fermée. Dans les deux cas, ajouter `Et 5 minutes plus tard,` avant le renommage sur le PC, pour que l'HLC de « A » soit strictement supérieur au dernier HLC connu du smartphone. Mettre aussi à jour le commentaire de S12c (« CA-13 n'est pas modifié » est caduc). | E10 de S12d (incrément 4) seulement |
| É-2 | DAT §4.2.1 (extension v0.10) : le rattachement est décrit comme un champ `objectifId` de la tâche. Le DAT §6.1 modélise pourtant la relation n-n par `LienTacheObjectif` (id = tacheId, objectifId ; champ `actif`). | Incohérence interne au DAT | **H-1** : l'information « rattachement » est `LienTacheObjectif(tacheId, E).actif`. Le contexte de la pierre tombale de E couvre les écritures des liens dont `objectifId = E`. L'entrée `ValeurEcartee` affichée porte : élément = la tâche ; information = `objectifs` ; valeur non retenue = intitulé de E ; valeur conservée = `objectif supprimé` (conforme à US-001 S20). Wording à aligner par Starck, sans changement de schéma. | Rien |
| É-3 | Le guide §6.6.9 n'a pas été revu après DEC-030. Le gabarit d'`ALR-010` (« Objectif « {élément} » supprimé … Votre modification de {sa/son} {information} ») ne précise pas quel élément est nommé pour un rattachement ou un placement non retenu. Le `DiscardedItem` porte sur l'enfant (« Annexe », « Version imprimable »). | Guide contre US et `.feature` | **H-2** : le code reste `ALR-010`. Le modèle de vue expose l'enfant comme élément et l'objectif supprimé comme cause. Les tests vérifient le code et les quatre colonnes du glossaire §8. Le texte exact est à fixer par Steeve avant l'E12 des écrans concernés. | Rien en E9 et E10 |
| É-4 | Décompte des modifications en attente. Cas : une sous-tâche ou un sous-objectif est créé hors ligne sous un parent **déjà déposé**, puis le parent est supprimé hors ligne. Le DAT §4.1.5 bis ne purge les entrées d'un enfant que si le parent supprimé porte lui-même `creationNonDeposee`. Il compterait donc 2 (parent « Supprimée » et enfant), alors que la règle du guide §6.6.1 (« un élément créé puis supprimé hors ligne ne compte pas ») donne 1. Aucun scénario ne couvre ce cas. | DAT contre guide | **H-4** : à la suppression d'un élément, toutes les entrées de ses descendants qui portent `creationNonDeposee` et que la suppression rend supprimés par dérivation sont purgées dans la même transaction. Décompte = 1. Je le signale à Starck pour alignement, sans échange. | Rien |
| É-5 | US-017 S22c. Les préconditions placent « le PC est sans réseau » **avant** « sur le PC, le message `ERR-012` est affiché », qu'un PC hors ligne ne peut pas constater. De plus, « l'utilisateur confirme », sans préfixe, figure dans un scénario à deux appareils. | Rédaction `.feature` | **H-5** : les préconditions `Étant donné` décrivent un état, pas une chronologie. La *step definition* de « `ERR-012` est affiché » fait constater l'altération par l'appareil **avant** d'appliquer la coupure réseau déclarée. Une action de confirmation sans préfixe s'applique à l'appareil qui a une confirmation en attente ; elle échoue s'il y en a zéro ou deux. | Rien |
| É-6 | Points documentaires : en-têtes des 10 `.feature` restés à « cahier des charges v0.10 » au lieu de v0.11 ; en-tête de `test-technique-R1-R2.md` resté en « Version 2 » malgré l'ajout du §3.5 ; dans `suivi-projet.md`, « Points bloquants » liste encore l'alignement du DAT §4.1.5 bis, fait en v0.10 ; l'historique du DAT v0.9 annonce un « avis sur l'ordre de réalisation (A.2) » sans corps correspondant dans le DAT (voir §4). | Documentaire | À corriger par leurs propriétaires lors de leur prochaine mise à jour. | Rien |

**Contrôles de cohérence sans écart** :
- critère de valeur écartée : DAT §4.2.1 contre S10, S11, S12b, US-018 S07, US-031 S10, US-003 S17, US-001 S19 ;
- RG-044 : DAT §4.2.2 contre S18 à S22d, S32, S32b, S33 ;
- décompte et 24 h : DAT §4.1.5 bis contre guide §6.6.1, US-018 S05b, S05c, S15c, US-031 S22c ;
- historique : DAT §6.1 contre glossaire §11, US-001 S21, S22, US-003 S22, US-024 S10, US-025 S18 ;
- liste des tâches : guide §5.7 contre US-002 S20 à S20d ;
- RG-027 : DEC-030 contre US-025 S12b ;
- consultation seule : DAT §4.2 contre US-022 S24 et S25.

**Autres hypothèses de conception appliquées en E9** (pas des écarts) :
- **H-3** : dans US-024 S10, l'estimation recopiée produit une entrée `MODIFICATION_ESTIMATION` même si avant = après (1 h 30 → 1 h 30). Il en va de même pour 0 h → 0 h (S10b).
- **H-6** : `ALR-014` est exclu de `data-a-lire` et retiré par le « Compris » de la carte `ALR-008`.
- **H-7** : les tableaux de contexte appliquent la construction du glossaire §1. Une tâche parente « abandonnée » avec une sous-tâche « terminée » (US-025 S12b) est valide, puisque seule une sous-tâche « à faire » fait échouer l'étape.

### 4. Ordre de réalisation définitif (ANT-14, BEN-2, BEN-14)

#### 4.1 Constat complémentaire : dépendances entre US au niveau des scénarios

La relecture des 270 scénarios montre que la proposition A.2 sous-estimait les dépendances. Plusieurs scénarios « à un appareil » d'une US métier construisent leur contexte avec des capacités d'US réalisées plus tard. Exemples :
- US-001 S06 utilise des tâches terminées, abandonnées et une sous-tâche ;
- US-001 S07, S16 et S22 utilisent des sous-objectifs et des tâches ;
- US-017 S02, S03, S07 et S08 utilisent des tâches et « terminer ».

Ces dépendances sont propres à un domaine unique. Aucun ordre des six US métier ne les supprime : le meilleur ordre testé en évite 2 sur environ 37. Je garde donc l'ordre fonctionnel de l'architecte (§7.3 point 3) et je fixe la règle suivante.

**Règle de rattachement (s'impose à E10, E12 et E13)** :
1. Un scénario reste tracé sur son US (tags inchangés).
2. Il est **exécuté et revu au rang de son dernier prérequis** : la dernière US, ou le dernier incrément d'US-017, dont il utilise une capacité.
3. La revue E13 d'un rang couvre le code du rang et tous les scénarios qui deviennent exécutables à ce rang, y compris les scénarios différés des rangs précédents. Une revue ne peut pas être approuvée si un scénario devenu exécutable est rouge.
4. Une US n'est déclarée « En recette » que lorsque **tous** ses scénarios sont verts.
5. La liste nominative des scénarios par rang est arrêtée en E9 dans `LOT-001.md`. La table de §4.4 en fixe la partie US-017 et les scénarios à deux appareils.

#### 4.2 Ordre retenu

**Préalables** : test technique R1, R2 et R11 avant l'E9 d'US-022 et d'US-017 (inchangé) ; correction É-1 avant l'E10 de l'incrément 4.

| Rang | Élément | Périmètre livré | Scénarios exécutés à ce rang (outre les tests unitaires) |
|---|---|---|---|
| 0 | Socle (ST d'US-022) | Dépôt, outillage, CI, `.gitignore` avant la clé (BEN-13), protection de `main` dès la CI (DEC-029). Ports `DepotLocal` (cloisonné par compte), `Horloge` (murale et monotone), `GenerateurId`, `TransportSynchro`. Modèle d'écriture synchronisable (HLC, `appareilId`, contexte causal, pierres tombales, `EvenementJournal` typé, index des écritures en attente). Banc : faux Google avec en-tête `Date` simulé, réseau, deux appareils à `appareilId` fixes. | — |
| 1 | US-022 | Connexion, compte, déconnexion, suppression des données | US-022 (scénarios sans prérequis métier) |
| 2 | US-001 | Objectifs (cas d'usage, modèles de vue, journal) | US-001 S01 à S05, S04b, S08, S09, S11, S13, S14, S21 |
| 3 | US-017, incrément 1 | Cycle de synchronisation, fusion par champ, marqueur « déposé jusqu'à », `MEN-ATTENTE`, indicateur et décompte, erreurs de dépôt | US-017 S04, S17a, S17b, S29 ; scénarios d'US-022 qui exigent un échange |
| 4 | US-023 | Sous-objectifs, refus `ERR-030` et `ERR-031` | US-023 S01 à S06, S08 à S12, S15, S20 |
| 5 | US-002 | Tâches, liste « Tâches » (guide §5.7) | US-002 (sans prérequis ultérieur) ; différés devenus exécutables : US-001 S07, S10, S16, S18, S22 ; US-023 S07 ; US-017 S05, S06 ; US-002 S18 (deux appareils, incrément 1) |
| 6 | US-024 | Sous-tâches, estimation calculée | US-024 (sans prérequis ultérieur) ; US-002 S13 |
| 7 | US-003 | Terminer, rouvrir, atteinte d'un objectif | US-003 (sans prérequis ultérieur) ; différés : US-001 S12, S17 ; US-002 S20, S21 ; US-023 S14 ; US-024 (S07, S10, S17, S19…) ; US-017 S02, S03, S07, S08 |
| 8 | US-025 | Abandon, reprise, RG-027 complétée | US-025 sans deux appareils ; différés : US-001 S06, S15 ; US-002 S11, S15, S19, S20c, S20d ; US-023 S13 ; US-003 S07, S09, S12, S15 ; US-024 S05, S08, S10b, S15, S16, S16b, S18, S21 |
| 9 | US-017, incrément 2 | Valeurs écartées (contexte causal, pierre tombale étendue), RG-056, réparations RG-047 à RG-049 | Voir §4.4 |
| 10 | US-017, incrément 3 | RG-044 (fichier par appareil, manifeste, `generation`, choix concurrents) | Voir §4.4 |
| 11 | US-017, incrément 4 | Correction d'horloge et `ALR-001`, RG-054, RG-058 | Voir §4.4 (S01 en dernier) |
| 12 | US-018 | SQLite, `@capacitor/network`, extension native d'horloge monotone (DAT §6.4), RG-057, APK (BEN-13) | US-018 ; S09b en recette (E14) |
| 13 | US-031 | Service worker, Web Locks, `storage.persist()`, `FournisseurAuth` web (DAT §4.1.6 bis), profil `@ihm` | US-031 |

Les listes « différés » des rangs 5 à 8 sont tirées d'une analyse outillée des contextes ; elles sont reprises et vérifiées une à une dans `LOT-001.md` en E9.

#### 4.3 Conditions pour placer US-001 avant l'incrément 1 d'US-017

**Constat préalable** : le dépôt ne contient pas de texte de Starck qui énonce ces trois conditions. L'historique du DAT v0.9 mentionne un « avis sur l'ordre de réalisation (A.2) », mais aucune section du DAT, de `avis-dependances-lot1.md` ni de `LOT-001.md` ne le contient. Je reprends donc ci-dessous les trois conditions sous la forme où je les applique. **Jarvis vérifie qu'elles correspondent au verbatim de Starck.** En cas d'écart de formulation, le verbatim de Starck l'emporte sans nouvel échange, car il ne s'agit pas d'un arbitrage.

1. **Aucun modèle provisoire** : dès le rang 2, US-001 écrit exclusivement par le modèle synchronisable définitif livré au rang 0 :
   - écriture de champ avec HLC, `appareilId` et contexte causal ;
   - pierres tombales ;
   - `EvenementJournal` typé (DAT §6.1) ;
   - index des écritures en attente (DAT §4.1.5 bis).

   Le schéma 1 du format Drive est donc figé avant US-001. L'incrément 1 n'entraîne ni migration ni reprise du code d'US-001.
2. **Périmètre de revue limité et pas de recette anticipée** : la revue E13 d'US-001 ne porte que sur les scénarios exécutables au rang 2 (§4.2). US-001 n'est pas déclarée « En recette » avant l'approbation de l'incrément 1, puis de l'incrément 2 (S19, S20) et des US qui portent ses scénarios différés (règle §4.1).
3. **L'incrément 1 suit immédiatement US-001**, sans aucune autre US intercalée. Ainsi, US-022 puis US-017 restent « en premier » au sens de la condition 2 de l'architecte (`LOT-001.md` §7.1), à un objet métier près. L'incrément 1 est en outre validé par des tests de propriétés de la fusion (commutativité, associativité, idempotence, fast-check : R14) avant le rang 4.

#### 4.4 Rattachement des scénarios d'US-017 à ses incréments (BEN-14, définitif)

| Incrément | Scénarios US-017 (45) | Scénarios des autres US livrés et revus avec lui | Rang d'exécution effectif |
|---|---|---|---|
| 1. Synchronisation de base | S02, S03, S04, S05, S06, S07, S08, S17a, S17b, S29 (10) | US-002 S18 ; scénarios d'US-022 qui exigent un échange | S04, S17a, S17b, S29 au rang 3 ; S05, S06 au rang 5 ; S02, S03, S07, S08 au rang 7 |
| 2. Conflits et modifications non retenues | S09, S10, S11, S12, S12b, S14, S15, S15b, S16, S24, S25, S26 (12) | US-001 S19, S20 ; US-002 S23 ; US-023 S16, S17, S18, S18b, S18c, S19 ; US-024 S20, S21, S22 ; US-003 S17, S18, S19 ; US-025 S14, S15, S16 (les trois scénarios d'incohérence, US-024 S21, US-003 S19 et US-025 S16, utilisent l'étape de construction à deux appareils) | Rang 9 |
| 3. Restauration (RG-044) | S18, S19, S20, S20b, S21, S22, S22b, S22c, S22d, S23, S32, S32b, S33 (13) | — | Rang 10 |
| 4. Horloge, fuseau, versions | S01, S12c, S12d, S13a, S13b, S27, S28, S30, S30b, S31 (10) | — | Rang 11 ; S12d après correction É-1 ; S01 en dernier |

Total : 10 + 12 + 13 + 10 = 45 scénarios, conforme au fichier. Changements par rapport à A.1 :
- S12c et S12d sont rattachés à l'incrément 4, car ils dépendent de la correction d'écart et d'`ALR-001` ;
- S12 reste dans l'incrément 2 ;
- les nouveaux scénarios S15b (incrément 2) et S20b, S22b, S22c, S22d, S32b (incrément 3) sont rattachés ;
- Q-US-001-1 est levé : l'incrément 2 n'a plus de question en attente.

**Suites pour E9** :
- ANT-22 : `conventions.md` v0.4, avec les entrées v0.11, 270 scénarios, glossaire v1.3 et guide v0.2.7, et les hypothèses H-1 à H-7 ;
- inscription de cet ordre, de la règle §4.1 et des listes nominatives dans `LOT-001.md` ;
- ST-US-022 (socle) puis ST-US-017 après le test technique.

## Note de Jarvis : conditions de Starck sur l'ordre de réalisation (texte qui fait foi)
Ces conditions sont tirées du compte rendu de Starck en E8 (2026-10-21), qui n'avait pas été versé au dépôt. Selon la règle posée par Anthony, **le texte de Starck l'emporte**. Les conditions d'Anthony qui ne le contredisent pas s'y ajoutent en complément.

Starck accepte de placer US-001 avant l'incrément 1 d'US-017, à trois conditions :
1. **Modèle d'écriture.** US-001 est construite directement sur le modèle d'écriture de la synchronisation, et non sur un stockage provisoire à reprendre ensuite : écriture par information avec HLC et contexte causal, transaction unique, index des écritures en attente, journal RG-050 au format du §6.1. Les ST d'US-001 et de l'incrément 1 sont donc conçues ensemble en E9, avec le format Drive complet (schéma 1).
2. **Revue de code.** La revue E13 d'US-001 couvre ce chemin d'écriture.
3. **Questions préalables.** Q-US-001-2 et Q-US-001-3 sont tranchées avant le développement d'US-001, car le journal est alimenté dès la première création.

Compléments d'Anthony retenus, car compatibles :
- US-001 ne passe pas « En recette » avant l'approbation des incréments 1 et 2 ;
- l'incrément 1 suit immédiatement US-001 et est validé par des tests de propriétés de la fusion.

## Clôture de l'E8 (Jarvis, 2026-10-21)
- 40/40 Q-US levées. Les 10 US sont **Explicites**. Aucun arbitrage.
- Corrections non bloquantes en cours :
  - É-1 et É-5 (Pepper) : US-017 S12d et S22c ;
  - É-2 et É-4 (Starck) : DAT ;
  - É-3 (Steeve) : texte d'`ALR-010` ;
  - É-6 : en-têtes et documentation.
- **Lot passé en E9.** E9 d'US-022 (y compris le socle) et d'US-017 reste conditionnée au test technique R1/R2/R11.
