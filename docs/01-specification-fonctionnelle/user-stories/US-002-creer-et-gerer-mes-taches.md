# US-002 — Créer et gérer mes tâches
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer une tâche, avec son délai et son estimation, et la rattacher à zéro, un ou plusieurs objectifs, **afin de** transformer mes objectifs en travail concret.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - délai obligatoire (Q-DEM001-5.2) ;
  - délai postérieur à celui de l'objectif accepté avec une alerte (Q-DEM001-5.3 b) ;
  - tâche possible sans objectif (Q-DEM001-6.2) ou rattachée à plusieurs objectifs (Q-DEM001-6.3) ;
  - estimation en heures et minutes, au pas de 30 min (Q-DEM001-9) ;
  - estimation initiale conservée pour la vélocité (Q-DEM001-12.1).
- **Précisé en v0.4** :
  - estimation obligatoire, au minimum 30 min, modifiable tant qu'aucun temps passé n'est saisi (Q-DEM001-28.1 à 28.3) ;
  - délai sans heure ; délai dépassé accepté et signalé en retard (Q-DEM001-28.4, 28.5) ;
  - suppression définitive, avec les sous-tâches (Q-DEM001-29.3, 29.4) ;
  - **aucun délai ni aucune estimation présélectionnés par défaut à la saisie** (Q-ERG-03 « non »).
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : suppression concurrente d'une modification (RG-047) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : rattachement à zéro, un ou plusieurs objectifs.
- RG-003 : délai obligatoire, date sans heure, sans valeur par défaut.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte si le délai de la tâche est postérieur à celui d'un de ses objectifs.
- RG-028 : heures et minutes, pas de 30 min, minimum 30 min.
- RG-029 : estimation obligatoire, sans valeur par défaut, modifiable tant qu'aucun temps passé n'est saisi.
- RG-045 : tâche « en retard ».
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-046 : suppression.
- RG-047, RG-050.

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée une tâche en saisissant :
   - un intitulé non vide ;
   - un délai, obligatoire, qui est une date sans heure (RG-003) ;
   - une estimation, obligatoire, en heures et minutes, au pas de 30 min, d'au moins 30 min (RG-028, RG-029) ;
   - éventuellement, un ou plusieurs objectifs de rattachement (RG-001).
2. **CA-2** — À l'ouverture de la saisie d'une tâche, aucun délai et aucune estimation ne sont présélectionnés : l'utilisateur choisit explicitement l'un et l'autre (Q-ERG-03).
3. **CA-3** — L'enregistrement d'une tâche sans délai, ou sans estimation, est refusé, avec un message qui indique l'information manquante.
4. **CA-4** — Seules des estimations multiples de 30 min, d'au moins 0 h 30, peuvent être saisies (par exemple 0 h 30, 1 h 00, 1 h 30).
5. **CA-5** — Une tâche peut être créée sans objectif. Elle apparaît alors dans la vue « Tâches sans objectif ».
6. **CA-6** — Une tâche rattachée à plusieurs objectifs apparaît dans le détail de chacun d'eux.
7. **CA-7** — Si le délai de la tâche est postérieur au délai d'un de ses objectifs, la tâche est enregistrée et une alerte nomme le ou les objectifs concernés (RG-024). Les objectifs sans délai ne déclenchent aucune alerte.
8. **CA-8** — L'utilisateur peut modifier l'intitulé, le délai et les objectifs de rattachement à tout moment (RG-004). Après chaque modification, les alertes RG-024, l'indication « en retard » et l'état des objectifs concernés (RG-025) sont recalculés.
9. **CA-9** — L'utilisateur peut modifier l'estimation d'une tâche tant qu'aucun temps passé n'a été saisi sur elle (RG-029). Au lot 1, la saisie du temps passé n'existe pas encore : l'estimation reste donc modifiable. La valeur en vigueur est l'estimation initiale qui servira à la vélocité. Pour une tâche qui a des sous-tâches, l'estimation est calculée et ne peut pas être modifiée (US-024).
10. **CA-10** — Un délai déjà dépassé est accepté ; la tâche est aussitôt signalée « en retard ». Une tâche est « en retard » quand elle est à faire et que son délai est antérieur à la journée en cours. Elle ne l'est plus dès que son délai est reporté à aujourd'hui ou plus tard, ou qu'elle est terminée ou abandonnée (RG-045).
11. **CA-11** — La liste des tâches affiche, pour chacune : l'intitulé, le délai, l'estimation, l'état, le ou les objectifs, et l'indication « en retard » le cas échéant. Elle est triée par délai croissant, en attendant l'ordre de priorité (US-004).
    - *Précision E8 (Q-US-002-1, sans changement de règle ; guide d'ergonomie §5.7, ECR-002)* :
      - à l'ouverture, la liste présente les tâches **à faire** ; un filtre d'état propose trois valeurs, à faire, terminées, abandonnées (pas de valeur « toutes ») ;
      - tâches à faire : délai croissant ; à délai égal, de la plus anciennement créée à la plus récente ; puis par intitulé (ordre alphabétique, sans tenir compte des majuscules ni des accents) ;
      - tâches terminées : de la plus récemment terminée à la plus ancienne ; tâches abandonnées : de la plus récemment abandonnée à la plus ancienne ;
      - les sous-tâches ne sont jamais des lignes de la liste, dans aucun filtre (« Sans objectif » compris) : la tâche parente indique le nombre de sous-tâches terminées sur le nombre de sous-tâches non abandonnées ; les sous-tâches figurent dans son détail (US-024).
12. **CA-12** — La suppression d'une tâche demande une confirmation, puis elle est définitive. Si la tâche a des sous-tâches, la confirmation indique leur nombre, et elles sont supprimées avec elle (RG-046). L'état de ses objectifs est recalculé.
13. **CA-13** — *(RG-047)* Si une tâche est supprimée sur un appareil et modifiée sur l'autre avant qu'ils n'aient échangé leurs modifications, elle reste supprimée sur les deux appareils, et l'utilisateur est informé des modifications écartées.
14. **CA-14** — *(RG-050)* La création d'une tâche (avec son estimation, son délai, ses objectifs), la modification de son délai ou de son estimation, son rattachement à un objectif ou son détachement, et sa suppression sont conservés dans l'historique, avec la journée et les valeurs avant et après.
    - *Précision E8 (Q-US-001-2)* : rendu des valeurs et liste fermée des événements au §11 du glossaire d'étapes. Les sous-tâches supprimées avec leur tâche parente n'ont pas d'entrée propre.

## Cas limites et cas d'erreur
- Délai égal à la journée en cours : accepté, la tâche n'est pas en retard.
- Espaces au début ou à la fin de l'intitulé : retirés à l'enregistrement ; aucune longueur maximale (précision E8, Q-US-001-3).
- Plusieurs tâches de même délai : classées par date de création, puis par intitulé (CA-11, S20b).
- Délai de la tâche égal au délai de l'objectif : pas d'alerte, puisque le délai n'est pas postérieur.
- Estimation de 0 h, ou non multiple de 30 min : refusée.
- Rattachement à un objectif atteint : l'objectif repasse « en cours » (RG-025).
- Rattachement d'une tâche à faire à un objectif « à décliner en tâches » : l'objectif passe « en cours ».
- Retrait du dernier objectif d'une tâche : elle devient une tâche sans objectif.
- Modification de la même tâche sur deux appareils : RG-036 (US-017).
- Utilisateur en voyage hors du fuseau de Paris : l'indication « en retard » suit la journée de Paris (RG-008, RG-053), et non celle du lieu où il se trouve ; les deux appareils affichent la même indication.

## Hors périmètre
- Sous-tâches (US-024).
- Priorisation (US-004), planification (US-006), temps passé et reste à faire (US-008, US-009).
- Tâches récurrentes (US-021, reportée).
- Corbeille et restauration d'une tâche supprimée (exclues, Q-DEM001-29.4 a).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§6), ADR-003, ADR-010, ADR-011.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - entité `Tache` et entité `LienTacheObjectif` (relation n-n) ;
    - cas d'usage `CreerTache`, `ModifierTache`, `RattacherTache`, `DetacherTache` et `SupprimerTache` ;
    - objet-valeur `Duree` : minutes entières, multiples de 30, au moins 30 (RG-028) ;
    - éléments dérivés : alertes RG-024, « en retard » (RG-045), état des objectifs ;
  - présentation : liste des tâches, vue « Tâches sans objectif », formulaire sans valeur présélectionnée.
- **Données** :
  - `Tache` : intitulé, délai (`DateCalendaire`), `estimationInitiale` (`Duree`), registre « cycle de vie » (voir US-003), `parentId`, pierre tombale ;
  - `LienTacheObjectif` :
    - clé déterministe (tacheId, objectifId) ;
    - un registre `actif` par lien : un rattachement fait sur un appareil et un détachement fait sur l'autre se fusionnent lien par lien ;
    - un lien vers un objectif supprimé est ignoré à la lecture (RG-047) ;
  - journal : `TACHE_CREEE` (estimation, délai, objectifs), `DELAI_MODIFIE`, `ESTIMATION_MODIFIEE`, `RATTACHEE`, `DETACHEE` et `TACHE_SUPPRIMEE`.
- **Accès Google** : aucun appel direct.
- **Sécurité** : échappement des intitulés.
- **Exigences non fonctionnelles** : liste de 5 000 tâches triée et filtrée en moins de 100 ms (index locaux, liste virtualisée à l'écran).
- **Risques** :
  - RG-029 : l'estimation reste modifiable au lot 1, car aucun temps passé n'existe encore. Le champ doit garder son HLC et son journal, pour que la vélocité utilise plus tard la bonne valeur ;
  - RG-047 (établie) : comme US-001.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés** : [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html) (cadres A, B et I : champs, estimation modifiable, saisie d'une sous-tâche).
- **Écrans modifiés** : [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) (version LOT-001, cadres L1 à L4 : liste triée par délai, saisie rapide sans valeur par défaut, filtre « Sans objectif », heure de Paris) ; ECR-006 (états de la saisie rapide, décrits au guide §4.3).
- **Parcours impactés** : P-02 (étape 4), P-07 (état vide), P-13 (étapes 1 à 3).
- **Nouveaux composants** : `QuickAdd` v2 (libellés « obligatoire », aucune valeur présélectionnée, erreurs nommées), `DurationStepper` (usage dans le détail), `FieldRow` (guide §4.3, §4.4, §4.22).
- **Décisions d'ergonomie** :
  - **aucun délai ni aucune estimation présélectionnés** (CA-2, Q-ERG-03 « non ») ; le bouton « Ajouter » reste actif et, s'il manque une information, le message la nomme sous les puces (CA-3) ; l'intitulé saisi est conservé ;
  - estimation au pas de 30 min, minimum 30 min (CA-4) : puces rapides et stepper ; aucune autre valeur n'est saisissable ;
  - liste triée par délai croissant (CA-11), avec l'en-tête « Triées par délai » ; filtres À faire / Terminées / Abandonnées et puces d'objectif dont « Sans objectif » (CA-5) ;
  - alerte de délai postérieur à celui d'un objectif (CA-7, RG-024) : icône + texte nommant l'objectif ; « En retard » (CA-10) ;
  - suppression (CA-12) : confirmation avec le nombre de sous-tâches, définitive ;
  - suppression concurrente d'une modification (CA-13) : dans la feuille de synchronisation.
- **États** :
  - *vide* : premier lancement (ECR-010 C), filtres vides ;
  - *chargement* : données aussitôt ;
  - *erreur* : « Indiquez un délai. », « Indiquez une estimation. », « Indiquez un intitulé. », focus sur le premier champ en erreur ;
  - *hors ligne* : création, modification et suppression disponibles ;
  - *synchronisation* : point « en attente » ;
  - *conflit* : valeur écartée (ECR-011 C) et ligne « 1 modification non retenue » dans le détail.
- **Accessibilité et responsive** : cibles de 44 px ; le clavier virtuel ne masque jamais le champ ni le bouton ; touche `N` sur PC ; stepper `spinbutton` avec valeur en toutes lettres.
- **Questions et réserves** : Q-ERG-12 (écran d'accueil du lot 1 : la liste est l'accueil).

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21 ; mis à jour en E8).* Fichier : [`tests/features/US-002-creer-et-gerer-mes-taches.feature`](../../../tests/features/US-002-creer-et-gerer-mes-taches.feature) — **28 scénarios**. Chaque scénario porte les tags `@US-002`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S04, S05a, S05b |
| CA-2 | S02 |
| CA-3 | S03 |
| CA-4 | S05a, S05b |
| CA-5 | S06 |
| CA-6 | S07 |
| CA-7 | S08 |
| CA-8 | S09, S10, S11 |
| CA-9 | S12, S13 |
| CA-10 | S14, S15 |
| CA-11 | S20 (filtre par défaut « à faire », tri par délai), S20b (départage par création puis intitulé), S20c (terminées et abandonnées, plus récentes d'abord), S20d (sous-tâches jamais listées) ; US-003 S16 ; US-025 S04 |
| CA-12 | S21, S22 |
| CA-13 (RG-047) | S23 |
| CA-14 (RG-050) | S24 |
| Cas limite : délai égal à la journée en cours ; changement d'heure du 25/10/2026 | S16, S17 |
| Cas limite : délai égal à celui de l'objectif | S08 |
| Cas limite : estimation de 0 h ou non multiple de 30 min (le minimum de 30 min vaut pour la saisie ; une estimation calculée de 0 h reste valide : US-024 S16, S16b) | S05b |
| Cas limite : rattachement à un objectif atteint ou « à décliner en tâches » | S11 |
| Cas limite : retrait du dernier objectif | S09, S11 |
| Cas limite : délai sans heure, identique sur les deux appareils | S18 |
| Cas limite : voyage hors du fuseau de Paris | S19 |
| Cas limite : modification sur deux appareils (RG-036) | US-017 S09, S10 |

## Questions ouvertes
Aucune. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5, 6, 9 et 12. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-28 et 29 intégrées (CA-1, CA-3, CA-4, CA-9, CA-10, CA-12) ; réponse Q-ERG-03 (CA-2) ; règles proposées RG-047 et RG-050 (CA-13, CA-14) ; DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : PEP-7 (S05 scindé en S05a et S05b pour supprimer la colonne de texte libre « résultat »), BEN-10 et PEP-9 (renvoi à US-024 pour l'estimation calculée de 0 h), PEP-8 (mentions caduques retirées). Aucune règle ni aucun critère n'est modifié. |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-002-1 (contenu, filtres et tri de la liste, précisés dans CA-11 ; S20 réécrit, S20b, S20c, S20d ajoutés), Q-US-002-2 (une alerte nomme exactement les objectifs cités ; forme « nomme le seul objectif » retirée), Q-US-002-3 (glossaire v1.2), Q-US-001-2 (historique), Q-US-001-3 (espaces de l'intitulé), Q-US-017-7 (préfixe d'appareil, S23). Précisions sans changement de règle de gestion ni de critère validé. |
