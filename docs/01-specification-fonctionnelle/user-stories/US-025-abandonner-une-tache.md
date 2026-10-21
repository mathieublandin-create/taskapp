# US-025 — Abandonner une tâche
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** abandonner une tâche que je ne réaliserai pas, sans la supprimer, **afin de** garder une trace et de ne plus la voir parmi mon travail à faire.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-049, RG-050) sont soumis à la validation de cette règle.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-7.3 (« oui »).
- **Précisé en v0.4** (Q-DEM001-26.2, 27) : une tâche abandonnée peut être reprise ; abandonner une tâche parente abandonne ses sous-tâches non terminées ; les tâches abandonnées sont ignorées dans l'atteinte d'un objectif ; une tâche abandonnée sort du backlog (sans effet visible au lot 1, le backlog n'étant pas encore livré).
- **Proposé en v0.4** (à valider en E6) : incohérence d'état après fusion (RG-049) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-027 : abandon, reprise, cascade sur les sous-tâches, sortie du backlog.
- RG-025 : les tâches abandonnées sont ignorées dans l'atteinte d'un objectif.
- RG-023 : estimation de la tâche parente ; fin de la tâche parente.
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 (proposée) : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-045 : une tâche abandonnée n'est pas en retard.
- RG-049, RG-050 (proposées).

## Critères d'acceptation
1. **CA-1** — L'utilisateur abandonne une tâche « à faire », après confirmation **(P)**. Elle passe à l'état « abandonnée », et la date de la journée en cours, dans le fuseau de référence Europe/Paris (RG-053), est conservée comme date d'abandon **(P)**.
2. **CA-2** — Une tâche abandonnée n'apparaît plus parmi les tâches à faire. Elle reste consultable dans une vue ou un filtre des tâches abandonnées **(P)**.
3. **CA-3** — Une tâche abandonnée n'est pas une tâche terminée : elle n'a pas de date de fin. Elle n'est pas « en retard » (RG-045).
4. **CA-4** — L'état des objectifs de la tâche est recalculé : la tâche abandonnée est ignorée (RG-025).
   - Exemple : un objectif a deux tâches, l'une terminée, l'autre à faire. L'utilisateur abandonne la seconde : l'objectif devient « atteint ».
5. **CA-5** — L'utilisateur peut reprendre une tâche abandonnée : elle repasse « à faire », sa date d'abandon n'est plus affichée, et les objectifs concernés sont recalculés (RG-027).
6. **CA-6** — Abandonner une tâche parente abandonne aussi ses sous-tâches à faire ; ses sous-tâches terminées restent terminées. La confirmation indique le nombre de sous-tâches qui seront abandonnées **(P pour le contenu de la confirmation)**.
7. **CA-7** — Reprendre une tâche parente reprend aussi les sous-tâches qui avaient été abandonnées avec elle (CA-6), mais pas celles qui avaient été abandonnées auparavant, une par une **(P)**.
8. **CA-8** — La reprise d'une sous-tâche dont la tâche parente est abandonnée n'est pas proposée ; il faut d'abord reprendre la tâche parente **(P)**.
9. **CA-9** — L'utilisateur peut abandonner une sous-tâche seule. L'estimation de la tâche parente est recalculée (US-024, CA-4). Si c'était la dernière sous-tâche ni terminée ni abandonnée, la tâche parente peut désormais être déclarée terminée.
10. **CA-10** — *(RG-049, proposée)* Si, après échange des modifications des deux appareils, une tâche parente est abandonnée alors qu'une de ses sous-tâches est à faire (par exemple, tâche parente abandonnée sur le PC pendant qu'une sous-tâche est reprise, ou créée, sur le smartphone), l'application le signale sans rien corriger automatiquement, jusqu'à ce que l'utilisateur termine ou abandonne la sous-tâche, ou reprenne la tâche parente.
11. **CA-11** — *(RG-050, proposée)* L'abandon et la reprise d'une tâche sont conservés dans l'historique, avec la journée concernée.

## Cas limites et cas d'erreur
- Abandonner une tâche terminée : l'action n'est pas proposée ; il faut d'abord la rouvrir **(P)**.
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
  - la cascade porte sur plusieurs éléments et peut être en concurrence avec une reprise ou une création de sous-tâche sur l'autre appareil. Ce cas est couvert par RG-049 (proposée), qui le signale sans le corriger ;
  - CA-7 est proposé : si le marqueur `abandonParCascade` est jugé inutile, on le supprime.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-025-abandonner-une-tache.feature`.

## Questions ouvertes
Aucune. Les critères (P) et ceux qui appliquent une règle proposée (CA-10, CA-11) sont soumis à la validation du commanditaire en E6.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-7.3. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-26.2 et 27 intégrées (CA-3 à CA-9) ; règles proposées RG-049 et RG-050 (CA-10, CA-11) ; DEC-012 (fuseau de référence Europe/Paris). |
