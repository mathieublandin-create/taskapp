# US-024 — Décomposer une tâche en sous-tâches
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** découper une tâche en sous-tâches, **afin de** suivre plus finement un travail important.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-6.1 d).
- **Tension levée** (Q-DEM001-25.3 a) : l'estimation d'une tâche parente est la somme de celles de ses sous-tâches, calculée ; dans la vélocité, seules comptent les tâches sans sous-tâche. Le même travail n'est donc jamais compté deux fois.
- **Précisé en v0.4** (Q-DEM001-25, 29) : un seul niveau ; délai et estimation obligatoires pour chaque sous-tâche ; alerte si le délai d'une sous-tâche dépasse celui de la tâche parente ; objectifs hérités de la tâche parente ; fin de la tâche parente conditionnée ; sous-tâches supprimées avec leur tâche parente.
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : réparations après fusion (RG-047, RG-049, F12) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-023 : sous-tâches sur un seul niveau ; estimation de la tâche parente calculée ; objectifs hérités ; fin de la tâche parente.
- RG-003, RG-028, RG-029 : délai et estimation obligatoires, sans valeur par défaut, pas de 30 min, minimum 30 min.
- RG-026 : fin sur déclaration.
- RG-045 : « en retard ».
- RG-046 : suppression d'une tâche qui a des sous-tâches.
- RG-047, RG-049, RG-050.

## Critères d'acceptation
1. **CA-1** — Depuis le détail d'une tâche qui n'est pas elle-même une sous-tâche, l'utilisateur crée une sous-tâche, rattachée à cette tâche. Sur une sous-tâche, l'action « créer une sous-tâche » n'est pas proposée (un seul niveau).
2. **CA-2** — Une sous-tâche se saisit comme une tâche (US-002, CA-1 à CA-4) : intitulé, délai obligatoire et estimation obligatoire, sans valeur présélectionnée.
3. **CA-3** — Le détail d'une tâche affiche ses sous-tâches, avec leur intitulé, leur délai, leur estimation, leur état et l'indication « en retard » le cas échéant, ainsi que le nombre de sous-tâches terminées sur le nombre de sous-tâches non abandonnées.
4. **CA-4** — L'estimation d'une tâche qui a des sous-tâches est la somme des estimations de ses sous-tâches non abandonnées. Elle est calculée, ne peut pas être saisie, et se met à jour à chaque ajout, modification d'estimation, abandon, reprise ou suppression d'une sous-tâche (RG-023).
   - Exemple : une tâche a deux sous-tâches de 1 h 00 et 1 h 30 ; son estimation est 2 h 30. La sous-tâche de 1 h 00 est abandonnée : l'estimation devient 1 h 30.
5. **CA-5** — Quand l'utilisateur ajoute la première sous-tâche à une tâche, l'estimation saisie jusque-là pour cette tâche est remplacée par la somme calculée. L'application l'en informe avant l'enregistrement.
6. **CA-6** — Si le délai d'une sous-tâche est postérieur à celui de sa tâche parente, la sous-tâche est enregistrée et une alerte nomme la tâche parente. L'alerte est recalculée dès que l'un des deux délais change.
7. **CA-7** — Une sous-tâche est rattachée aux objectifs de sa tâche parente, sans pouvoir en changer. Quand les objectifs de la tâche parente changent, ceux de ses sous-tâches changent aussi.
8. **CA-8** — La tâche parente ne peut pas être déclarée terminée tant qu'il lui reste une sous-tâche ni terminée ni abandonnée : l'action est refusée, avec un message qui indique le nombre de sous-tâches restantes. Quand toutes ses sous-tâches sont terminées ou abandonnées, la tâche parente reste à faire jusqu'à ce que l'utilisateur la déclare terminée (RG-023 ; voir US-003).
9. **CA-9** — La suppression d'une tâche qui a des sous-tâches les supprime avec elle, après une confirmation qui indique leur nombre (RG-046). La suppression d'une sous-tâche recalcule l'estimation de la tâche parente.
10. **CA-10** — *(RG-049)* Si, après échange des modifications des deux appareils, une tâche parente terminée a une sous-tâche à faire (par exemple : tâche parente terminée sur le PC, pendant qu'une de ses sous-tâches est rouverte, ou créée, sur le smartphone sans réseau), l'application ne corrige rien automatiquement : elle signale l'incohérence sur la tâche jusqu'à ce que l'utilisateur termine ou abandonne la sous-tâche, ou rouvre la tâche parente.
11. **CA-11** — *(RG-047)* Si une tâche est supprimée sur un appareil pendant qu'une sous-tâche lui est ajoutée sur l'autre, la sous-tâche ajoutée est elle aussi supprimée après échange, et l'utilisateur en est informé.
12. **CA-12** — *(RG-050)* La création d'une sous-tâche (avec sa tâche parente) et sa suppression sont conservées dans l'historique, comme pour toute tâche (US-002, CA-14).

## Cas limites et cas d'erreur
- Suppression de la dernière sous-tâche : la tâche redevient une tâche simple ; son estimation est alors la dernière somme calculée, de nouveau modifiable selon RG-029.
- Ajout d'une sous-tâche à une tâche terminée : l'application demande confirmation, puis rouvre la tâche parente, conformément à RG-023.
- Ajout d'une sous-tâche à une tâche abandonnée : refusé tant que la tâche n'a pas été reprise (US-025).
- Toutes les sous-tâches abandonnées : l'estimation calculée de la tâche parente est de 0 h, et la tâche parente peut être déclarée terminée ou abandonnée. Le minimum de 30 min (RG-028) ne s'applique qu'à une estimation **saisie** : une estimation calculée de 0 h est valide, n'est refusée par aucune opération sur la tâche (renommer, modifier son délai, la terminer, l'abandonner), et reste non modifiable puisqu'elle est calculée (CA-4). *Précision de rédaction E7 (BEN-10, PEP-9) : le cas était déjà validé ; elle en explicite la relation avec RG-028.*
- Délai de sous-tâche déjà dépassé : accepté, la sous-tâche est signalée en retard (RG-045).

## Hors périmètre
- Plus d'un niveau de sous-tâches (exclu, Q-DEM001-25.1 a).
- Transformation d'une tâche existante en sous-tâche d'une autre tâche, ou l'inverse.
- Planification et suivi du temps des sous-tâches (lots ultérieurs).
- Calcul de la vélocité (US-010) : la règle « seules comptent les tâches sans sous-tâche » y sera vérifiée.

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§4.2, §6), ADR-003.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - champ `parentId` de `Tache` ;
    - invariant « un seul niveau » ;
    - éléments dérivés :
      - estimation calculée de la tâche parente : somme des sous-tâches non abandonnées (CA-4) ;
      - objectifs d'une sous-tâche = **objectifs de la tâche parente, dérivés à la lecture**. Une sous-tâche n'a pas de lien propre, ce qui satisfait CA-7 sans propagation ;
      - **incohérence RG-049** : une tâche parente terminée ou abandonnée qui a une sous-tâche à faire est un état **calculé**, signalé tant qu'il existe, sans aucune écriture corrective.
- **Données** :
  - CA-5 : l'estimation saisie de la tâche parente est conservée telle quelle, mais elle est ignorée tant que la tâche a des sous-tâches ;
  - cas limite « suppression de la dernière sous-tâche » : la dernière somme calculée est **écrite** dans `estimationInitiale`, avec l'événement de journal `ESTIMATION_MODIFIEE` ;
  - une sous-tâche dont la tâche parente est supprimée est considérée comme supprimée à la lecture (RG-046 et RG-047, CA-11), et signalée ;
  - journal : `TACHE_CREEE` (avec le parent) et `TACHE_SUPPRIMEE`.
- **Accès Google** : aucun.
- **Sécurité** : sans objet particulier.
- **Exigences non fonctionnelles** : agrégations en O(nombre de sous-tâches), négligeables.
- **Risques** :
  - RG-049 et RG-047 sont établies (V-05, V-03). L'architecture retenue, fondée sur la dérivation à la lecture, convient à ces règles. Une correction automatique, à la place de RG-049, demanderait des écritures de réparation, avec le même mécanisme que RG-048 ;
  - la règle de vélocité « seules les tâches sans sous-tâche comptent » sera appliquée par US-010, à partir du journal (`PARENT_MODIFIE`).
- **ADR applicables** : ADR-003, ADR-010.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés (partagés)** : [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html) (cadres A, H, I, J : tâche parente, incohérence, saisie d'une sous-tâche, détail d'une sous-tâche).
- **Écrans modifiés** : [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html) (version LOT-001, tâche parente avec compteur et sous-tâches) ; [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) (compteur « 1/3 » sur la ligne).
- **Parcours impactés** : P-02 (étape 7), P-13 (décomposer, terminer, abandonner).
- **Nouveaux composants** : `LockedField` (estimation calculée, objectifs hérités), `InconsistencyCard`, variante « sous-tâche » de `QuickAdd`, section « Sous-tâches » de `FieldRow` (guide §4.22, §4.23, §4.3).
- **Décisions d'ergonomie** :
  - estimation d'une tâche parente : calculée, affichée avec un cadenas et son origine « Somme des sous-tâches » (CA-4), jamais un stepper ;
  - **première sous-tâche** : message d'information avant l'enregistrement, « L'estimation de la tâche (3 h) sera remplacée par la somme de ses sous-tâches » (CA-5) ;
  - objectifs d'une sous-tâche : lecture seule, cadenas, « Hérités de la tâche » (CA-7) ;
  - tâche parente non terminable tant qu'il reste des sous-tâches : action principale indisponible avec la phrase « Il reste 2 sous-tâches à terminer ou abandonner » (CA-8) ;
  - alerte quand le délai d'une sous-tâche dépasse celui de la tâche parente, avec la tâche nommée (CA-6) ;
  - incohérence après fusion (CA-10, RG-049) : carte d'attention sur la tâche, sans correction automatique, trois issues (rouvrir la tâche, terminer ou abandonner la sous-tâche), marqueur dans les listes ;
  - suppression (CA-9) : confirmation avec le nombre de sous-tâches ; suppression concurrente (CA-11) : feuille de synchronisation.
- **États** :
  - *vide* : tâche sans sous-tâche, lien « Ajouter une sous-tâche » ;
  - *chargement* : sans objet ;
  - *erreur* : champs obligatoires de la sous-tâche, action de fin refusée ;
  - *hors ligne* : toutes les actions disponibles ;
  - *synchronisation* : point « en attente » ;
  - *conflit* : incohérence (RG-049), sous-tâche supprimée avec sa tâche (RG-047).
- **Accessibilité et responsive** : le bouton « Terminer la tâche » reste focalisable (`aria-disabled`) et la phrase qui l'explique est annoncée ; sous-tâches en liste sémantique ; sur PC, panneau de 440 px.
- **Questions et réserves** : aucune nouvelle. Les confirmations d'ajout à une tâche terminée ou abandonnée suivent le guide §4.12.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-024-decomposer-une-tache-en-sous-taches.feature`](../../../tests/features/US-024-decomposer-une-tache-en-sous-taches.feature) — **24 scénarios**. Chaque scénario porte les tags `@US-024`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02 |
| CA-2 | S03, S04 |
| CA-3 | S05 |
| CA-4 | S06, S07, S08 |
| CA-5 | S09 |
| CA-6 | S11, S12 |
| CA-7 | S14 |
| CA-8 | S15 |
| CA-9 | S19, S07 |
| CA-10 (RG-049) | S20, S21 |
| CA-11 (RG-047) | S22 |
| CA-12 (RG-050) | S23 |
| Cas limite : suppression de la dernière sous-tâche | S10 |
| Cas limite : ajout à une tâche terminée | S17 |
| Cas limite : ajout à une tâche abandonnée | S18 |
| Cas limite : toutes les sous-tâches abandonnées | S16, S16b (estimation calculée de 0 h face au minimum de 30 min) |
| Cas limite : délai de sous-tâche dépassé | S13 |

## Questions ouvertes
Aucune. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-6.1 d). |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-25, 27 et 29 intégrées (CA-1 à CA-9) ; règles proposées RG-047, RG-049 et RG-050 (CA-10 à CA-12). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : BEN-10 et PEP-9 (cas limite « estimation calculée de 0 h » explicité face à RG-028 ; scénario S16b), PEP-8 (mentions caduques retirées). Aucune règle ni aucun critère n'est modifié dans son sens. |
