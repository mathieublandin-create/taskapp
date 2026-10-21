# Validation des user stories de LOT-001 (étape E6)

| Élément | Valeur |
|---|---|
| Lot | LOT-001 « Socle et objectifs/tâches » (itération majeure), 10 user stories |
| Préparé par | Pepper (business analyste), le 2026-10-21, pour Jarvis |
| Référentiel | Cahier des charges v0.6 · [LOT-001](../lots/LOT-001.md) · 10 user stories · 211 scénarios de test |
| Lecture | Environ 10 minutes |
| État | **En attente de la réponse du commanditaire** |

---

## 1. Comment répondre

Vous avez deux choses à faire :

1. **Pour chaque décision V-01 à V-23** (partie 3 et suivantes), choisir l'option proposée. L'option recommandée est marquée ★.
2. **Pour chaque user story** (partie 2), dire : *Validée*, *À reprendre* ou *Retirée du lot*.

Quand une décision comporte plusieurs points (a, b, c), vous pouvez en contester un seul sans toucher aux autres.

**Réponse compacte possible.** Trois exemples :

- « **Tout reco** » : vous suivez toutes les recommandations ★ et les 10 user stories sont validées.
- « **Tout reco sauf V-09 b** » : tout est suivi, sauf le point b de la décision V-09, sur lequel vous demandez une autre solution.
- « **Tout reco sauf V-13 option 1, et US-025 à reprendre** » : vous choisissez l'option 1 pour la décision V-13 (au lieu de l'option 2 recommandée), et vous demandez de reprendre US-025.

**Après votre réponse.** Les user stories validées passent au refinement (E7). Pour une décision que vous refusez, Pepper corrige les user stories concernées et vous les représente (retour en E1, puis nouvelle validation). Les corrections de forme de la partie 6 sont faites dans tous les cas.

**Vocabulaire.** La *synchronisation* est la mise à jour automatique de vos données entre vos deux appareils, par votre Google Drive. Une *modification non retenue* est une saisie que l'application a dû écarter parce qu'une autre, plus récente ou prioritaire, venait de l'autre appareil. Elle vous est toujours signalée.

---

## 2. Synthèse par user story (ordre de réalisation)

Les scénarios de test « à valider » sont ceux qui reposent sur une règle ou un critère encore proposé. Ils sont tous soumis à vos décisions V-xx. Total du lot : **211 scénarios, dont 88 à valider**.

### US-022 — Se connecter avec mon compte Google
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-022-se-connecter-avec-mon-compte-google.md)
- **Vous pourrez** vous connecter avec votre compte Google, retrouver vos données dans un dossier visible de votre Drive, vous déconnecter, et supprimer les données d'un appareil sans toucher au Drive.
- **Règles clés** :
  - sans connexion, rien n'est accessible (RG-019) ;
  - l'application ne demande que l'identité du compte et l'accès à ses propres fichiers, pas l'agenda ; aucun écran d'avertissement de Google (ENF-05, ENF-08) ;
  - se déconnecter conserve les données sur l'appareil ; un autre compte ne les voit jamais (RG-043, RG-018) ;
  - si l'accès Google est perdu, l'application fonctionne comme sans réseau, sans perte (RG-035) ;
  - « Supprimer les données de cet appareil » est une action distincte (RG-055).
- **Maquettes** : [ECR-010 Connexion](../02-ux/maquettes/ECR-010-connexion.html) · [ECR-011 Synchronisation et compte](../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) (section Compte).
- **Scénarios** : 23, dont 10 à valider. **Décisions liées** : V-09, V-13, V-20.

**Validée / À reprendre / Retirée du lot :** ………………

### US-017 — Retrouver mes données sur smartphone et sur PC
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.md)
- **Vous pourrez** utiliser l'application sur votre smartphone Android et sur votre PC, avec les mêmes données, conservées dans votre Drive.
- **Règles clés** :
  - une modification apparaît sur l'autre appareil au plus tard une heure après s'il est ouvert et connecté, sinon dès son ouverture (RG-017) ;
  - si la même information est modifiée sur les deux appareils, la plus récente l'emporte ; l'autre valeur vous est signalée (RG-036) ;
  - si les données sont supprimées du Drive hors de l'application, vous choisissez entre restaurer et repartir de zéro (RG-044) ;
  - après une fusion, quelques règles de réparation s'appliquent (RG-047, RG-048, RG-049) ;
  - la mention « heure de Paris » s'affiche si l'appareil est dans un autre fuseau (RG-054).
- **Maquettes** : [ECR-011](../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) (feuille de synchronisation, modifications non retenues, données absentes) ; l'indicateur de synchronisation figure aussi sur ECR-002, 003, 007 et 008.
- **Scénarios** : 30, dont 15 à valider. **Décisions liées** : V-01 à V-08, V-10, V-11, V-20.

**Validée / À reprendre / Retirée du lot :** ………………

### US-018 — Utiliser l'application sans réseau sur mon smartphone
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.md)
- **Vous pourrez** ouvrir l'application sans réseau, consulter et saisir tout ce que permet le lot (objectifs, tâches, fin, abandon).
- **Règles clés** :
  - vos saisies sont conservées sur le smartphone et enregistrées dans le Drive au retour du réseau, sans action de votre part (RG-021) ;
  - rien n'est perdu, même si le smartphone est éteint avant le retour du réseau (ENF-06) ;
  - la perte de l'accès Google se comporte comme une coupure de réseau (RG-035) ;
  - pas de durée maximale d'utilisation sans réseau.
- **Maquettes** : [ECR-011](../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) cadre B (modifications en attente) · [ECR-008](../02-ux/maquettes/ECR-008-liste-objectifs.html) cadre E · [ECR-002](../02-ux/maquettes/ECR-002-taches-priorisees.html) cadre L3.
- **Scénarios** : 14, dont 4 à valider. **Décisions liées** : V-12, V-20.

**Validée / À reprendre / Retirée du lot :** ………………

### US-031 — Utiliser l'application sans réseau sur mon PC
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.md)
- **Vous pourrez** faire sur le PC la même chose que sur le smartphone sans réseau, depuis l'adresse web ou l'application installée (il faut l'avoir ouverte une première fois avec le réseau).
- **Règles clés** :
  - mêmes règles que le smartphone (RG-021) ;
  - si la session Google du navigateur a expiré, vous continuez à travailler ; la mise à jour avec le smartphone reprend après un clic de reconnexion (RG-017) ;
  - deux onglets ouverts : rien n'est perdu, les deux affichent les mêmes données.
- **Maquettes** : [ECR-011](../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) cadres H et I (session expirée, deux onglets) · [ECR-002](../02-ux/maquettes/ECR-002-taches-priorisees.html) et [ECR-007](../02-ux/maquettes/ECR-007-detail-tache.html).
- **Scénarios** : 18, dont 8 à valider. **Décisions liées** : V-08, V-12, V-20.

**Validée / À reprendre / Retirée du lot :** ………………

### US-001 — Créer et gérer un objectif
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-001-creer-et-gerer-un-objectif.md)
- **Vous pourrez** créer, consulter, modifier et supprimer un objectif, avec ou sans délai.
- **Règles clés** :
  - le délai est une date sans heure, facultatif, et peut être déjà dépassé : l'objectif est alors « en retard » (RG-002, RG-045) ;
  - l'état (en cours, atteint, à décliner en tâches) est calculé, jamais saisi (RG-025) ;
  - la suppression est définitive, après confirmation ; les tâches sont détachées, les sous-objectifs deviennent principaux (RG-046) ;
  - si l'objectif est supprimé sur un appareil et modifié sur l'autre, la suppression l'emporte (RG-047) ;
  - les événements importants sont conservés dans un historique (RG-050).
- **Maquettes** : [ECR-008 Liste des objectifs](../02-ux/maquettes/ECR-008-liste-objectifs.html) · [ECR-003 Détail d'un objectif](../02-ux/maquettes/ECR-003-detail-objectif.html).
- **Scénarios** : 21, dont 9 à valider. **Décisions liées** : V-03, V-14, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

### US-023 — Organiser un objectif en sous-objectifs
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-023-organiser-un-objectif-en-sous-objectifs.md)
- **Vous pourrez** décomposer un objectif en sous-objectifs, les déplacer sous un autre objectif ou les promouvoir en objectifs principaux.
- **Règles clés** :
  - un seul niveau, un seul parent par sous-objectif (RG-022) ;
  - un délai de sous-objectif postérieur à celui du parent est accepté, avec une alerte qui nomme le parent ;
  - un objectif est atteint quand ses tâches non abandonnées sont terminées et ses sous-objectifs atteints (RG-025) ;
  - si la fusion entre appareils crée une hiérarchie impossible, le déplacement le plus ancien est annulé et signalé (RG-048).
- **Maquettes** : [ECR-008](../02-ux/maquettes/ECR-008-liste-objectifs.html) (sous-objectifs en retrait, « Placer sous… ») · [ECR-003](../02-ux/maquettes/ECR-003-detail-objectif.html) cadre E.
- **Scénarios** : 20, dont 8 à valider. **Décisions liées** : V-03, V-04, V-14, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

### US-002 — Créer et gérer mes tâches
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-002-creer-et-gerer-mes-taches.md)
- **Vous pourrez** créer, modifier et supprimer une tâche avec son délai et son estimation, et la rattacher à zéro, un ou plusieurs objectifs.
- **Règles clés** :
  - délai et estimation obligatoires, aucune valeur présélectionnée (RG-003, RG-029) ;
  - estimation par pas de 30 minutes, 30 minutes au minimum (RG-028) ;
  - estimation modifiable tant qu'aucun temps passé n'est saisi (au lot 1, toujours) ;
  - délai postérieur à celui d'un objectif : accepté, avec une alerte qui nomme l'objectif (RG-024) ;
  - tâche « en retard » si son délai est passé (RG-045) ;
  - suppression définitive avec ses sous-tâches (RG-046).
- **Maquettes** : [ECR-007 Détail d'une tâche](../02-ux/maquettes/ECR-007-detail-tache.html) cadres A, B, I · [ECR-002 Tâches](../02-ux/maquettes/ECR-002-taches-priorisees.html) cadres L1 à L4.
- **Scénarios** : 24, dont 5 à valider. **Décisions liées** : V-03, V-14, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

### US-024 — Décomposer une tâche en sous-tâches
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-024-decomposer-une-tache-en-sous-taches.md)
- **Vous pourrez** découper une tâche en sous-tâches (un seul niveau), chacune avec son délai et son estimation.
- **Règles clés** :
  - l'estimation de la tâche parente est la somme de celle de ses sous-tâches : elle est calculée, pas saisie (RG-023) ;
  - une sous-tâche reprend les objectifs de sa tâche parente ;
  - la tâche parente ne peut pas être terminée tant qu'il reste une sous-tâche à faire ;
  - quand toutes les sous-tâches sont terminées, la parente reste « à faire » jusqu'à ce que vous la terminiez vous-même.
- **Maquettes** : [ECR-007](../02-ux/maquettes/ECR-007-detail-tache.html) cadres A, H, I, J · [ECR-003](../02-ux/maquettes/ECR-003-detail-objectif.html) · [ECR-002](../02-ux/maquettes/ECR-002-taches-priorisees.html).
- **Scénarios** : 23, dont 11 à valider. **Décisions liées** : V-03, V-05, V-14, V-15, V-16, V-17, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

### US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.md)
- **Vous pourrez** déclarer une tâche terminée, la rouvrir, et voir quels objectifs sont atteints.
- **Règles clés** :
  - une tâche n'est terminée que sur votre action, jamais automatiquement (RG-026) ;
  - la date de fin est le jour à l'heure de Paris, où que vous soyez (RG-008, RG-053) ;
  - une tâche terminée n'est jamais « en retard » (RG-045) ;
  - une tâche rattachée à plusieurs objectifs compte comme terminée pour chacun d'eux ;
  - si la fusion entre appareils crée une incohérence entre une tâche et ses sous-tâches, elle est signalée sans correction automatique (RG-049).
- **Maquettes** : [ECR-007](../02-ux/maquettes/ECR-007-detail-tache.html) cadres A, G, H · [ECR-002](../02-ux/maquettes/ECR-002-taches-priorisees.html) cadre L4 · [ECR-003](../02-ux/maquettes/ECR-003-detail-objectif.html) · [ECR-008](../02-ux/maquettes/ECR-008-liste-objectifs.html).
- **Scénarios** : 21, dont 9 à valider. **Décisions liées** : V-05, V-11, V-14, V-17, V-19, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

### US-025 — Abandonner une tâche
[Fichier de l'US](../01-specification-fonctionnelle/user-stories/US-025-abandonner-une-tache.md)
- **Vous pourrez** abandonner une tâche sans la supprimer, puis la reprendre plus tard.
- **Règles clés** :
  - l'abandon est toujours confirmé (Q-ERG-13, tranché) ;
  - une tâche abandonnée n'est ni à faire, ni terminée, ni « en retard », et est ignorée dans l'atteinte des objectifs (RG-027, RG-025) ;
  - abandonner une tâche parente abandonne ses sous-tâches non terminées ;
  - on peut abandonner une sous-tâche seule.
- **Maquettes** : [ECR-007](../02-ux/maquettes/ECR-007-detail-tache.html) cadres C, D, F · [ECR-002](../02-ux/maquettes/ECR-002-taches-priorisees.html) (filtre « Abandonnées ») · [ECR-003](../02-ux/maquettes/ECR-003-detail-objectif.html).
- **Scénarios** : 17, dont 9 à valider. **Décisions liées** : V-05, V-14, V-16, V-18, V-19, V-21.

**Validée / À reprendre / Retirée du lot :** ………………

---

## 3. Décisions à prendre

★ = option recommandée. Les identifiants entre parenthèses (RG, CA) servent à la traçabilité.

| N° | Sujet | Recommandé |
|---|---|---|
| V-01 | « Repartir de zéro » (RG-044 b) | Oui (a et b) |
| V-02 | Fichiers du Drive modifiés à la main mais lisibles (extension de RG-044) | Oui |
| V-03 | Suppression qui l'emporte sur une modification (RG-047) | Oui |
| V-04 | Hiérarchie d'objectifs impossible après fusion (RG-048) | Oui |
| V-05 | Incohérence tâche/sous-tâches signalée sans correction (RG-049) | Oui (a et b) |
| V-06 | Versions différentes de l'application (US-017) | Option 2 : seulement si le format des données diffère |
| V-07 | Délai d'une heure (F1 : RG-017, ENF-02, RG-037) | Oui (a et b) |
| V-08 | Reconnexion d'un clic sur PC (F14 : RG-017, ENF-04) | Oui |
| V-09 | « Supprimer les données de cet appareil » : garde-fous (RG-055) | Oui (a, b et c) |
| V-10 | Liste « Modifications non retenues » : signalement (RG-056 a, b, c) | Oui (a, b et c) |
| V-11 | Mention « heure de Paris » (RG-054) | Oui |
| V-12 | Rappel après 24 h hors ligne avec modifications en attente | Oui |
| V-13 | Nom du dossier dans le Drive | « Done Juan » |
| V-14 | Historique des événements (RG-050) | Oui |
| V-15 | Sous-tâches abandonnées exclues de l'estimation de la tâche parente | Oui |
| V-16 | Estimation de la tâche parente : cas particuliers | Oui (a, b et c) |
| V-17 | Rouvrir une sous-tâche rouvre la tâche parente | Oui |
| V-18 | Reprise en cascade des sous-tâches | Oui |
| V-19 | Tâche terminée sur un appareil, abandonnée sur l'autre | Oui |
| V-20 | Critères (P) mineurs : connexion, synchronisation, hors ligne | Oui à tous |
| V-21 | Critères (P) mineurs : objectifs et tâches | Oui à tous |
| V-22 | Reformulation du besoin | Oui |
| V-23 | Exclusions proposées | Oui |

### A. Synchronisation entre appareils et conflits

**V-01 — « Repartir de zéro » (RG-044 b ; US-017 CA-9)**
Si vos données ont été supprimées ou rendues illisibles dans le Drive en dehors de l'application, la restauration à partir de la copie de l'appareil est déjà décidée. On vous propose d'y ajouter :
- a) un second choix « **Repartir de zéro** », avec confirmation, qui efface aussi les données de cet appareil ;
- b) le choix fait sur un appareil **vaut pour les deux** : l'autre appareil efface ses données à sa prochaine synchronisation, sans reposer la question, en vous signalant les modifications qu'il n'avait pas encore enregistrées.

★ Oui aux deux. *Pourquoi :* une suppression volontaire ne se distingue pas d'une erreur ; il faut donc vous laisser le choix.
Si non : seule la restauration existe. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

**V-02 — Fichiers du Drive modifiés à la main mais restés lisibles (proposition de Starck ; US-017)**
Aujourd'hui, seuls les fichiers supprimés ou illisibles sont traités (V-01). On propose d'y ajouter les fichiers **modifiés à la main** dans le Drive : ils sont traités comme illisibles (avertissement, puis restaurer ou repartir de zéro) et jamais fusionnés.
★ Oui. *Pourquoi :* c'est la seule façon de ne jamais mélanger un fichier modifié à la main avec vos vraies données.
Si non : ce cas reste sans comportement défini. Si oui, Pepper ajoute les scénarios correspondants. Réponse : ☐ Oui ☐ Non

**V-03 — La suppression l'emporte (RG-047 ; US-017, 001, 002, 023, 024)**
Si un élément est supprimé sur un appareil et modifié sur l'autre avant leur mise à jour mutuelle, **il reste supprimé**, même si la modification est plus récente. Vous êtes informé des modifications écartées. Ce qui a été ajouté entre-temps suit : une sous-tâche ajoutée à une tâche supprimée est supprimée, une tâche rattachée à un objectif supprimé en est détachée, un sous-objectif créé sous un objectif supprimé devient principal.
★ Oui. *Pourquoi :* une suppression est définitive (RG-046) ; laisser l'élément supprimé est le comportement le plus simple et le plus prévisible.
Si non : la modification ressusciterait l'élément, ce qui demande une logique supplémentaire à définir. Réponse : ☐ Oui ☐ Non

**V-04 — Hiérarchie d'objectifs impossible après fusion (RG-048 ; US-017 CA-10, US-023 CA-9)**
Si la fusion crée un objectif placé sous l'un de ses sous-objectifs, ou un deuxième niveau, l'application **annule le déplacement le plus ancien** et vous le signale. Une création n'est jamais annulée.
★ Oui. *Pourquoi :* une règle claire est indispensable quelle qu'elle soit, et celle-ci conserve ce que vous avez fait en dernier.
Si non : une autre règle est à proposer. Réponse : ☐ Oui ☐ Non

**V-05 — Incohérence entre une tâche et ses sous-tâches (RG-049 ; US-003 CA-5 et CA-12, US-024 CA-10, US-025 CA-10)**
Exemple : une tâche est terminée sur le PC pendant qu'une de ses sous-tâches est rouverte sur le smartphone.
- a) L'application **signale l'incohérence sur la tâche, sans rien corriger**, jusqu'à ce que vous terminiez ou abandonniez la sous-tâche, ou rouvriez la tâche parente.
- b) Tant que l'incohérence dure, les objectifs de la tâche **ne sont pas considérés comme atteints** (les sous-tâches comptent alors pour l'atteinte : US-003 CA-5).

★ Oui aux deux. *Pourquoi :* vous décidez vous-même de la bonne issue, et un objectif n'est jamais déclaré atteint à tort.
Si non : une correction automatique serait à définir. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

**V-06 — Versions différentes de l'application (US-017, cas limite)**
Quand le smartphone et le PC n'ont pas la même version de l'application :
- **Option 1** (critère actuel) : l'appareil à la version la plus ancienne vous invite à mettre à jour avant de permettre la saisie, dès que les versions diffèrent.
- ★ **Option 2** (recommandation de Starck) : la saisie n'est bloquée que si le **format des données** est plus récent ; l'appareil passe alors en consultation seule et vous invite à mettre à jour. Deux versions qui partagent le même format coexistent.

*Pourquoi :* avec l'option 1, le PC serait bloqué à chaque nouvelle publication, tant que l'application Android n'est pas mise à jour. Réponse : ☐ Option 1 ☐ Option 2

### B. Les promesses sur les délais

**V-07 — Délai d'une heure : formulation tenant compte de l'absence de serveur (F1 ; RG-017, ENF-02, RG-037)**
Votre demande était qu'une modification soit visible sur l'autre appareil en une heure. Sans serveur (décision DEC-007), un appareil fermé ou éteint ne peut rien afficher. Formulation proposée :
- a) Une modification est visible sur l'autre appareil **au plus tard une heure après si cet appareil est ouvert et connecté, et sinon dès son ouverture**. À l'ouverture, vos données s'affichent aussitôt, puis les nouveautés de l'autre appareil sont intégrées sans attendre l'heure. Aucun délai n'est garanti pour un appareil fermé.
- b) Même principe pour un créneau déplacé dans Google Calendar (RG-037, lots ultérieurs) : il est détecté à l'ouverture de l'application et pendant son utilisation, pas avant.

★ Oui aux deux. *Pourquoi :* c'est la meilleure promesse tenable sans serveur.
Si non : la formulation est à revoir avec vous. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

**V-08 — Sur PC, un clic de reconnexion (F14 ; RG-017, ENF-04, US-031 CA-5)**
Sur PC, quand la session Google du navigateur a expiré, l'application reste utilisable avec les données du PC et indique qu'une reconnexion est nécessaire ; la mise à jour avec le smartphone reprend **après un clic de votre part** (« Reprendre la synchronisation »). Rien n'est perdu. Steeve note que cela peut arriver régulièrement.
★ Oui. *Pourquoi :* sans serveur, le renouvellement automatique est impossible.
Si non : formulation à revoir. Réponse : ☐ Oui ☐ Non

### C. Données conservées sur l'appareil

**V-09 — « Supprimer les données de cet appareil » : garde-fous (RG-055 ; US-022 CA-10)**
Le principe est décidé (DEC-015) : action distincte de « Se déconnecter », sans effet sur le Drive ni sur l'autre appareil. On vous propose le déroulement suivant :
- a) l'action est proposée quand vous êtes connecté, et **demande toujours une confirmation**, qui précise que vos données restent dans le Drive ;
- b) elle **enregistre d'abord** dans le Drive les modifications en attente ; si c'est impossible (par exemple sans réseau), elle indique le **nombre de modifications qui seraient perdues** et demande une confirmation explicite ;
- c) ensuite la session prend fin ; à la prochaine connexion, les données sont rechargées depuis le Drive comme sur un nouvel appareil. Les données d'un autre compte restées sur l'appareil ne sont pas touchées.

★ Oui aux trois. *Pourquoi :* l'action est irréversible sur l'appareil, il faut donc éviter de perdre une modification sans le savoir (ENF-06).
Si non : déroulement à redéfinir. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non · ☐ c oui ☐ c non

### D. Ce que l'application vous montre

**V-10 — Signalement des modifications non retenues (RG-056 a, b, c ; US-017, 018, 031)**
Déjà établi : la liste « Modifications non retenues » existe et chaque ligne y reste jusqu'à ce que vous disiez « Compris ». Il reste à valider :
- a) tant qu'au moins une ligne n'est pas lue, un **point discret et permanent** s'affiche sur l'indicateur de synchronisation, sans bloquer ; il disparaît à la dernière lecture ;
- b) une ligne lue sur un appareil l'est **aussi sur l'autre**, après la mise à jour entre appareils ;
- c) une même information n'est signalée **qu'une fois**, même si les deux appareils constatent le même écart.

★ Oui aux trois. *Pourquoi :* vous êtes prévenu sans être dérangé, et sans doublon d'un appareil à l'autre.
Si non : le point « à lire » (a), la lecture partagée (b) ou le signalement unique (c) n'est pas livré. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non · ☐ c oui ☐ c non

**V-11 — Mention « heure de Paris » (RG-054 ; US-017 CA-11)**
La journée et les horaires de l'application sont à l'heure de Paris, où que vous soyez (décision DEC-012). On propose d'afficher la mention « **heure de Paris** » **seulement quand l'appareil est réglé sur un autre fuseau** ; elle n'apparaît jamais quand l'appareil est à l'heure de Paris, ni sur un délai.
★ Oui. *Pourquoi :* en voyage, on évite de vous laisser croire qu'une tâche terminée à 23 h à New York est datée du jour local.
Si non : aucune mention. Réponse : ☐ Oui ☐ Non

**V-12 — Rappel après 24 h hors ligne (guide d'ergonomie §4.9 ; US-018 CA-6, US-031 CA-7)**
Aucune règle de gestion ne le prévoit : l'utilisation sans réseau n'a pas de durée maximale. Le guide d'ergonomie de Steeve prévoit toutefois un **bandeau de rappel, non bloquant**, quand l'appareil est hors ligne avec des modifications en attente depuis plus de 24 h. Le voulez-vous ?
★ Oui. *Pourquoi :* ces modifications ne sont encore que sur l'appareil ; un rappel limite le risque de les oublier (ENF-06).
Si oui : Pepper rédige la règle correspondante et les scénarios de test. Si non : seul l'indicateur « Hors ligne · n en attente » reste affiché. Réponse : ☐ Oui ☐ Non

**V-13 — Nom du dossier dans le Drive (US-022 CA-3, DEC-017)**
L'application s'appelle « Done Juan » (DEC-017). Le dossier visible dans votre Drive porte provisoirement un autre nom dans les maquettes. Lequel retenir ?
- **Option 1** : « Objectifs et Tâches » (maquettes actuelles).
- ★ **Option 2** : « Done Juan ».

*Pourquoi :* vous reconnaissez tout de suite l'origine des fichiers dans votre Drive, et c'est cohérent avec le nom de l'application. Réponse : ☐ Option 1 ☐ Option 2

### E. Historique

**V-14 — Historique des événements (RG-050 ; US-001, 002, 003, 023, 024, 025)**
Dès ce lot, l'application **garde la trace** de la vie de vos objectifs et tâches : création, changement de délai ou d'estimation, fin, réouverture, abandon, reprise, rattachement, changement de parent, suppression, avec la journée et les valeurs avant et après. Cet historique **n'est pas affiché** dans ce lot.
★ Oui. *Pourquoi :* les courbes sur 12 semaines des lots suivants ne pourraient pas être reconstituées après coup.
Si non : la période précédant ces lots ne pourrait pas être reconstituée. Réponse : ☐ Oui ☐ Non

### F. Sous-tâches, fin et abandon

**V-15 — Sous-tâches abandonnées exclues de l'estimation de la tâche parente (US-024 CA-4)**
L'estimation d'une tâche parente est la somme de ses sous-tâches. On propose d'**exclure les sous-tâches abandonnées** de cette somme. Exemple : deux sous-tâches de 1 h 00 et 1 h 30 donnent 2 h 30 ; si celle de 1 h 00 est abandonnée, l'estimation devient 1 h 30.
★ Oui. *Pourquoi :* ce qui ne sera pas fait ne doit pas gonfler la charge annoncée.
Si non : les sous-tâches abandonnées resteraient comptées. Réponse : ☐ Oui ☐ Non

**V-16 — Estimation de la tâche parente : cas particuliers (US-024 CA-5 et cas limites)**
- a) Quand vous ajoutez la **première sous-tâche** à une tâche, l'estimation que vous aviez saisie est **remplacée par la somme** ; l'application vous en informe avant l'enregistrement.
- b) Quand vous supprimez la **dernière sous-tâche**, la tâche redevient simple ; son estimation est la dernière somme calculée, de nouveau modifiable.
- c) Si **toutes les sous-tâches sont abandonnées**, l'estimation de la tâche parente est de 0 h, et elle peut être terminée ou abandonnée.

★ Oui aux trois. *Pourquoi :* chaque cas a un résultat prévisible et vous êtes prévenu avant toute perte de valeur saisie.
Si non : règle à redéfinir. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non · ☐ c oui ☐ c non

**V-17 — Rouvrir une sous-tâche rouvre la tâche parente (US-003 CA-9 ; US-024, cas limite)**
- Rouvrir une sous-tâche dont la tâche parente est terminée **rouvre aussi la tâche parente**, après confirmation.
- Ajouter une sous-tâche à une tâche terminée fait de même : confirmation, puis réouverture de la parente.
- Ajouter une sous-tâche à une tâche **abandonnée** est refusé tant que la tâche n'est pas reprise.

★ Oui. *Pourquoi :* une tâche parente ne reste pas « terminée » avec une sous-tâche à faire (RG-023).
Si non : règle à redéfinir. Réponse : ☐ Oui ☐ Non

**V-18 — Reprise en cascade des sous-tâches (US-025 CA-7 et CA-8)**
- Reprendre une tâche parente abandonnée reprend aussi les sous-tâches **abandonnées avec elle**, mais pas celles que vous aviez abandonnées une par une auparavant.
- Reprendre une sous-tâche seule n'est pas proposé tant que la tâche parente est abandonnée : il faut d'abord reprendre la parente.

★ Oui. *Pourquoi :* vous retrouvez la tâche exactement comme avant l'abandon, sans ressusciter ce que vous aviez écarté exprès.
Si non : règle à redéfinir. Réponse : ☐ Oui ☐ Non

**V-19 — Tâche terminée sur un appareil, abandonnée sur l'autre (US-003, cas limite)**
Si cela arrive avant la mise à jour entre appareils, l'état **le plus récent l'emporte** et l'autre est signalé comme modification non retenue (comme RG-036).
★ Oui. *Pourquoi :* même règle que partout ailleurs, sans surprise.
Si non : règle à redéfinir. Réponse : ☐ Oui ☐ Non

### G. Critères (P) mineurs

Ce sont des propositions de détail qui n'ont pas de conséquence importante pour vous. Vous pouvez les valider en bloc ou contester une lettre.

**V-20 — Critères (P) mineurs : connexion, synchronisation, hors ligne** ★ Oui à tous
- a) Première connexion, Drive vide : un écran vide vous invite à créer un premier objectif ou une première tâche (US-022 CA-2).
- b) À la réouverture, vous n'avez pas à vous reconnecter tant que votre accès est valide (US-022 CA-5).
- c) Avant « Se déconnecter », si des modifications ne sont pas encore dans le Drive, l'application en indique le nombre et précise qu'elles seront enregistrées à votre prochaine connexion sur l'appareil (US-022 CA-6).
- d) Première connexion ou reconnexion sans réseau : impossible, un message l'explique (US-022).
- e) Réseau coupé pendant la connexion : message d'erreur, possibilité de réessayer, rien n'est créé à moitié (US-022).
- f) Les données d'un compte A restées sur l'appareil ne se suppriment qu'en se connectant avec A, puis « Supprimer les données de cet appareil » (US-022).
- g) Toutes les fonctions du lot sont disponibles sur les deux appareils (US-017 CA-1).
- h) À l'ouverture, les nouveautés de l'autre appareil sont intégrées au plus tard **une minute** après (valeur à valider, US-017 CA-3).
- i) Tant que vous n'avez pas choisi entre restaurer et repartir de zéro, rien n'est effacé ni réécrit dans le Drive (US-017 CA-9).
- j) Drive plein : avertissement, vos modifications restent sur l'appareil (US-017).
- k) Horloge d'un appareil déréglée de plus de 24 h : avertissement (US-017).
- l) Hors ligne : l'application l'indique, avec les modifications non synchronisées, sous la forme définie par Steeve (libellé « Hors ligne · n en attente », point gris sur les lignes modifiées) (US-018 CA-3, US-031 CA-3).
- m) Pas de durée maximale d'utilisation hors ligne (US-018 CA-6, US-031 CA-7 ; voir aussi V-12).
- n) Réseau perdu pendant une saisie : la saisie est conservée, rien n'est enregistré à moitié (US-018, US-031).
- o) PC : la première ouverture sans réseau, sur un PC ou un navigateur jamais utilisé, est impossible ; l'information est donnée dans le guide utilisateur (US-031).
- p) PC : si vous effacez les données du navigateur, les modifications non encore dans le Drive sont perdues (l'application ne peut pas l'empêcher) ; un avertissement figure dans le guide utilisateur (US-031).
- q) PC : deux onglets ouverts sans réseau, rien n'est perdu et les deux affichent les mêmes données (US-031).
- r) PC : en navigation privée, les données ne sont pas conservées et l'usage hors ligne n'est pas garanti ; information dans le guide utilisateur, sans test (US-031).

Réponse : ☐ Oui à tous · ☐ Oui sauf : ……………

**V-21 — Critères (P) mineurs : objectifs et tâches** ★ Oui à tous
- a) Un objectif et une tâche exigent un intitulé non vide ; un intitulé vide ou fait d'espaces est refusé avec un message (US-001 CA-1, US-002 CA-1). La description d'un objectif est facultative.
- b) Un objectif sans délai affiche « sans délai » (US-001 CA-2).
- c) La liste des objectifs indique le nombre de tâches terminées sur le nombre de tâches non abandonnées **directement** rattachées, sans compter les sous-tâches (US-001 CA-3).
- d) La confirmation de suppression d'un objectif indique le nombre de tâches détachées et de sous-objectifs concernés (US-001 CA-9).
- e) Deux objectifs peuvent porter le même intitulé (US-001).
- f) La liste distingue les objectifs principaux de leurs sous-objectifs (US-023 CA-2).
- g) Un objectif qui a des sous-objectifs ne peut pas être placé sous un autre : refus avec un message « un seul niveau » (US-023 CA-6).
- h) Déplacer un sous-objectif sous son parent actuel est sans effet (US-023).
- i) Une tâche sans objectif apparaît dans la vue « Tâches sans objectif » (US-002 CA-5).
- j) La liste des tâches est triée par délai croissant, en attendant la priorisation d'un lot ultérieur (US-002 CA-11).
- k) Le détail d'une tâche indique le nombre de sous-tâches terminées sur les sous-tâches non abandonnées (US-024 CA-3).
- l) Transformer une tâche existante en sous-tâche d'une autre, ou l'inverse, n'est pas prévu dans ce lot (US-024).
- m) Les listes permettent de distinguer ou de filtrer les tâches « à faire » et « terminées » (US-003 CA-11).
- n) La date d'abandon est conservée : c'est le jour à l'heure de Paris (US-025 CA-1).
- o) Une tâche abandonnée reste consultable dans une vue ou un filtre « Abandonnées » (US-025 CA-2).
- p) La confirmation d'abandon d'une tâche parente indique le nombre de sous-tâches qui seront abandonnées (US-025 CA-6).
- q) Abandonner une tâche terminée n'est pas proposé : il faut d'abord la rouvrir (US-025).

Réponse : ☐ Oui à tous · ☐ Oui sauf : ……………

---

## 4. Reformulation du besoin (V-22)

Texte intégral du cahier des charges (§2, version 0.2). Il décrit le produit complet, au-delà de ce premier lot.

> « Je fixe des objectifs, datés ou non, que je décompose en sous-objectifs et en tâches, elles-mêmes décomposables en sous-tâches. Chaque tâche a un délai et une estimation en heures. L'application me propose un ordre de priorité et un planning à la journée, que je peux modifier, en fonction du temps que je peux consacrer chaque jour à mes tâches et des événements de mon agenda. Elle suggère un horaire pour chaque tâche planifiée et la place en créneau dans mon agenda Google principal. Chaque jour, je note le temps passé sur chaque tâche ; le reste à faire est calculé et je peux le corriger. L'application en déduit ma vélocité hebdomadaire, me dit si mes délais sont tenables, me propose de nouveaux délais ou un nouveau planning, et me montre l'évolution de mon backlog et de ma vélocité. Google Calendar me rappelle à 8 h ce que j'ai prévu et à 21 h ce que j'ai fait. Je me connecte avec mon compte Google ; mes données restent dans mon propre espace de stockage, je les retrouve sur mon smartphone et sur mon PC, et je peux travailler sans réseau sur mon smartphone. »

**V-22** — Cette reformulation exprime-t-elle bien votre besoin ?
★ Oui. *Pourquoi :* elle reprend vos demandes et vos réponses depuis le début du projet.
Si non : indiquez ce qu'il faut corriger. Réponse : ☐ Oui ☐ À corriger : ……………

---

## 5. Exclusions (V-23)

**À valider : trois exclusions proposées par Pepper**, absentes de votre demande. Elles sortent du périmètre de l'application :
1. la synchronisation avec d'autres agendas que Google Calendar (Outlook, iCloud, etc.) ;
2. l'import depuis d'autres outils de gestion de tâches ;
3. la facturation ou le suivi financier du temps passé.

**V-23** — Confirmez-vous ces trois exclusions ?
★ Oui aux trois. *Pourquoi :* elles ne figurent pas dans votre demande et alourdiraient le produit.
Si non : indiquez celle à réintégrer ; elle serait étudiée comme une nouvelle demande. Réponse : ☐ 1 oui ☐ 1 non · ☐ 2 oui ☐ 2 non · ☐ 3 oui ☐ 3 non

**Déjà décidées, pour information** (aucune action de votre part) :
- usage par plusieurs personnes, partage ou affectation ;
- utilisation sans compte Google ;
- conservation des données ailleurs que dans votre espace personnel, et serveur exploité pour votre compte ;
- chronomètre de suivi du temps ;
- planification d'une tâche répartie sur plusieurs journées ;
- fin automatique d'une tâche quand son reste à faire atteint zéro ;
- atteinte d'un objectif déclarée à la main ou mesurée par une valeur cible chiffrée ;
- ajustement automatique des délais ou du planning sans votre validation ;
- mise à jour du rappel du matin après son heure d'envoi ;
- plus d'un niveau de sous-objectifs ou de sous-tâches ; sous-objectif à plusieurs parents ;
- corbeille ou restauration d'un élément supprimé ;
- effacement automatique des données à la déconnexion, et action combinée « se déconnecter et effacer » ;
- application pour iPhone en première version ;
- chiffrement supplémentaire des données du Drive, vérification de l'application par Google.

---

## 6. Corrections de forme déjà tranchées (pour information)

Aucune décision à prendre. Elles sont appliquées lors de la mise à jour des user stories qui suivra votre réponse.

1. **US-025, CA-1** : le marqueur (P) est retiré de la confirmation avant abandon, puisque vous avez répondu « toujours » à Q-ERG-13. La date d'abandon du même critère reste une proposition (V-21 n) ; la confirmation d'abandon d'une tâche parente reste elle aussi une proposition (V-21 p).
2. **US-003, CA-1** : l'exemple de date (une tâche terminée le 10 mars à 23 h à New York, soit le 11 mars à 4 h à Paris) n'est exact que pour l'année 2026 ; en 2027, l'écart est de 6 h ce jour-là et l'heure à Paris serait 5 h. L'exemple sera daté avec son année, ou remplacé par une date vérifiée. La règle ne change pas : la date de fin est celle du jour à Paris.
