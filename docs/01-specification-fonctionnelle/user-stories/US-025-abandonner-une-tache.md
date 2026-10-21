# US-025 — Abandonner une tâche
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** abandonner une tâche que je ne réaliserai pas, sans la supprimer, **afin de** garder une trace et de ne plus la voir parmi mon travail à faire.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-7.3 (« oui »).
- **Précisé en v0.4** (Q-DEM001-26.2, 27) : une tâche abandonnée peut être reprise ; abandonner une tâche parente abandonne ses sous-tâches non terminées ; les tâches abandonnées sont ignorées dans l'atteinte d'un objectif ; une tâche abandonnée sort du backlog (sans effet visible au lot 1, le backlog n'étant pas encore livré).
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : incohérence d'état après fusion (RG-049) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-027 : abandon, reprise, cascade sur les sous-tâches, sortie du backlog.
- RG-025 : les tâches abandonnées sont ignorées dans l'atteinte d'un objectif.
- RG-023 : estimation de la tâche parente ; fin de la tâche parente.
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-045 : une tâche abandonnée n'est pas en retard.
- RG-049, RG-050.

## Critères d'acceptation
1. **CA-1** — L'utilisateur abandonne une tâche « à faire », après confirmation. Elle passe à l'état « abandonnée », et la date de la journée en cours, dans le fuseau de référence Europe/Paris (RG-053), est conservée comme date d'abandon.
2. **CA-2** — Une tâche abandonnée n'apparaît plus parmi les tâches à faire. Elle reste consultable dans une vue ou un filtre des tâches abandonnées.
3. **CA-3** — Une tâche abandonnée n'est pas une tâche terminée : elle n'a pas de date de fin. Elle n'est pas « en retard » (RG-045).
4. **CA-4** — L'état des objectifs de la tâche est recalculé : la tâche abandonnée est ignorée (RG-025).
   - Exemple : un objectif a deux tâches, l'une terminée, l'autre à faire. L'utilisateur abandonne la seconde : l'objectif devient « atteint ».
5. **CA-5** — L'utilisateur peut reprendre une tâche abandonnée : elle repasse « à faire », sa date d'abandon n'est plus affichée, et les objectifs concernés sont recalculés (RG-027).
6. **CA-6** — Abandonner une tâche parente abandonne aussi ses sous-tâches à faire ; ses sous-tâches terminées restent terminées. La confirmation indique le nombre de sous-tâches qui seront abandonnées.
7. **CA-7** — Reprendre une tâche parente reprend aussi les sous-tâches qui avaient été abandonnées avec elle (CA-6), mais pas celles qui avaient été abandonnées auparavant, une par une.
8. **CA-8** — La reprise d'une sous-tâche dont la tâche parente est abandonnée n'est pas proposée ; il faut d'abord reprendre la tâche parente.
9. **CA-9** — L'utilisateur peut abandonner une sous-tâche seule. L'estimation de la tâche parente est recalculée (US-024, CA-4). Si c'était la dernière sous-tâche ni terminée ni abandonnée, la tâche parente peut désormais être déclarée terminée.
10. **CA-10** — *(RG-049)* Si, après échange des modifications des deux appareils, une tâche parente est abandonnée alors qu'une de ses sous-tâches est à faire (par exemple, tâche parente abandonnée sur le PC pendant qu'une sous-tâche est reprise, ou créée, sur le smartphone), l'application le signale sans rien corriger automatiquement, jusqu'à ce que l'utilisateur termine ou abandonne la sous-tâche, ou reprenne la tâche parente.
11. **CA-11** — *(RG-050)* L'abandon et la reprise d'une tâche sont conservés dans l'historique, avec la journée concernée.
    - *Précision E8 (Q-US-001-2)* : l'abandon et la reprise en cascade (CA-6, CA-7) ont une entrée dans l'historique de chaque sous-tâche concernée (S18) ; rendu au §11 du glossaire d'étapes.

## Cas limites et cas d'erreur
- Abandonner une tâche terminée : l'action n'est pas proposée ; il faut d'abord la rouvrir.
- Rouvrir une sous-tâche terminée dont la tâche parente est abandonnée : **cas non couvert par les règles validées, soumis au commanditaire (Q-US-025-2)** ; voir « Questions ouvertes ».
- Abandonner la dernière tâche non abandonnée d'un objectif sans sous-objectif : l'objectif devient « à décliner en tâches » (RG-025).
- Abandon sur un appareil, modification sur l'autre : RG-036 (US-017).
- Ajouter une sous-tâche à une tâche abandonnée : refusé tant que la tâche n'a pas été reprise (US-024).

## Hors périmètre
- Graphique du backlog (US-012) : la sortie du backlog des tâches abandonnées (RG-027) y sera vérifiée.
- Abandon d'un objectif entier.

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§6), ADR-003, ADR-011.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - cas d'usage `AbandonnerTache` et `ReprendreTache` ;
    - cascade vers les sous-tâches dans une **seule transaction** (CA-6) ;
    - interdiction de reprendre une sous-tâche dont la tâche parente est abandonnée (CA-8) ;
    - incohérence RG-049, dérivée comme dans US-024.
- **Données** :
  - registre « cycle de vie » (voir US-003), avec `dateAbandon` (`DateCalendaire` à Paris) et **`abandonParCascade` = identifiant de l'abandon de la tâche parente**. Ce marqueur permet à CA-7 de ne reprendre que les sous-tâches abandonnées avec la tâche parente, et non celles abandonnées une par une auparavant ;
  - journal : `ABANDONNEE` et `REPRISE`. La sortie du backlog (RG-027) sera calculée à partir du journal.
- **Accès Google** : aucun.
- **Sécurité** : sans objet particulier.
- **Exigences non fonctionnelles** : comme US-003.
- **Risques** :
  - la cascade porte sur plusieurs éléments et peut être en concurrence avec une reprise ou une création de sous-tâche sur l'autre appareil. Ce cas est couvert par RG-049 (établie, V-05), qui le signale sans le corriger ;
  - CA-7 (validé) : le marqueur `abandonParCascade` est conservé.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés (partagés)** : [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html) (cadres C, D, F : menu, confirmation d'abandon, tâche abandonnée).
- **Écrans modifiés** : [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) (filtre « Abandonnées »), [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html) (section « Abandonnées » repliée).
- **Parcours impactés** : P-13 (étapes 6 et 7).
- **Nouveaux composants** : variante « abandon » de `ConfirmDialog` ; état « Abandonnée » de `TaskRow` (guide §4.2, §4.12).
- **Décisions d'ergonomie** :
  - abandon dans le **menu « … » uniquement**, jamais par un geste de balayage (guide §5.2) ;
  - **confirmation** conforme à CA-1, avec le nombre de sous-tâches abandonnées avec la tâche (CA-6) et le rappel que la reprise est possible ; bouton normal, non rouge (réversible) ; toujours demandée, y compris pour une tâche sans sous-tâche (ECR-007 D2, `CNF-ABANDON-TACHE`) ; avec sous-tâches : ECR-007 D (`CNF-ABANDON-TACHE-CASCADE`) ;
  - tâche abandonnée : plus de case « Terminer », icône cercle barré, date d'abandon à l'heure de Paris (CA-1, RG-053), jamais « en retard » (CA-3) ; visible dans le filtre « Abandonnées » (CA-2) ;
  - action principale « Reprendre la tâche » (CA-5) ; reprise de la tâche parente = reprise des sous-tâches abandonnées avec elle (CA-7) ; la reprise d'une sous-tâche d'une tâche abandonnée n'est pas proposée (CA-8) ;
  - abandon d'une sous-tâche seule : estimation de la tâche parente recalculée (CA-9) ;
  - incohérence après fusion (CA-10) : voir US-024.
- **États** :
  - *vide* : filtre « Abandonnées » vide, « Aucune tâche abandonnée. » ;
  - *chargement* : sans objet ;
  - *erreur* : sans objet ;
  - *hors ligne* : disponible ;
  - *synchronisation* : point « en attente » ;
  - *conflit* : abandon d'un côté, modification de l'autre : valeur écartée (ECR-011 C) ; incohérence.
- **Accessibilité et responsive** : dialogue `alertdialog`, « Annuler » focalisé ; abandon accessible au clavier par le menu ; l'état « Abandonnée » est dit en texte et pas seulement par l'icône.
- **Questions et réserves** : Q-ERG-13 tranchée par le commanditaire : confirmation toujours (CA-1), appliquée dans ECR-007.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21 ; mis à jour en E8).* Fichier : [`tests/features/US-025-abandonner-une-tache.feature`](../../../tests/features/US-025-abandonner-une-tache.feature) — **18 scénarios**. Chaque scénario porte les tags `@US-025`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02, S03 |
| CA-2 | S04 ; US-002 S20c (ordre des abandonnées) |
| CA-3 | S05 |
| CA-4 | S07 |
| CA-5 | S08 |
| CA-6 | S09, S10 |
| CA-7 | S11 |
| CA-8 | S12 |
| CA-9 | S13 |
| CA-10 (RG-049) | S15, S16 |
| CA-11 (RG-050) | S17, S18 (cascade) |
| Cas limite : abandonner une tâche terminée | S06 |
| Cas limite : dernière tâche non abandonnée d'un objectif | S07 |
| Cas limite : abandon sur un appareil, modification sur l'autre | S14 |
| Cas limite : sous-tâche ajoutée à une tâche abandonnée | US-024 S18 |
| Changement d'heure du 25/10/2026, voyage | S03 |

Q-ERG-13 : le commanditaire a répondu « toujours » (2026-10-21). La confirmation de l'abandon, prévue par CA-1, est donc validée. La date d'abandon (CA-1, S03) et le contenu de la confirmation (CA-6, S10), proposés par Pepper, sont validés par le commanditaire le 2026-10-21 (DEC-018, V-21 n et p).

## Questions ouvertes
- **Q-US-025-2 (E8, en attente du commanditaire)** : une sous-tâche terminée avant l'abandon de sa tâche parente peut-elle être rouverte tant que la tâche parente est abandonnée ? Option recommandée : a) non, l'action n'est pas proposée ; il faut d'abord reprendre la tâche parente (comme CA-8 pour la reprise). Texte de la question : `docs/ceremonies/explicitation-LOT-001.md`, section « Réponses aux Q-US ». Selon la réponse, un critère et un scénario seront ajoutés et l'US repassera en validation (E6) pour ce point.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-7.3. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-26.2 et 27 intégrées (CA-3 à CA-9) ; règles proposées RG-049 et RG-050 (CA-10, CA-11) ; DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : PEP-8 (mentions caduques retirées), PEP-7 (glossaire d'étapes figé). Aucun critère n'est modifié. |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-025-1 (glossaire v1.2 ; « n'a pas de date d'abandon »), Q-US-001-2 (historique de la cascade ; S18 ajouté), Q-US-002-1 (filtre « abandonnée », S04 conforme), Q-US-024-1 (construction des tableaux de contexte), Q-US-017-7 (préfixe d'appareil, S14). Précisions sans changement de règle. **Q-US-025-2 soumise au commanditaire** (réouverture d'une sous-tâche terminée sous une tâche parente abandonnée). |
