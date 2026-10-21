# US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** déclarer une tâche terminée, pouvoir la rouvrir, et voir si chacun de mes objectifs est atteint, **afin de** savoir ce qui est accompli.

> Les marqueurs (P) (propositions de Pepper) ont été retirés : tous les critères sont validés par le commanditaire (DEC-018, 2026-10-21).

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - une tâche n'est terminée que sur déclaration de l'utilisateur, jamais automatiquement (Q-DEM001-7.1 a) ;
  - une tâche terminée peut être rouverte (Q-DEM001-7.2) ;
  - un objectif est atteint quand toutes ses tâches sont terminées (Q-DEM001-5.4 a).
- **Précisé en v0.4** : atteinte d'un objectif qui a des sous-objectifs ou des tâches abandonnées, objectif « à décliner en tâches », tâche rattachée à plusieurs objectifs (Q-DEM001-26) ; fin d'une tâche parente (Q-DEM001-25.6 et 25.7).
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : incohérence d'état après fusion signalée sans correction (RG-049, F12) ; historique (RG-050).
- **Journée** : la date de fin est celle de la journée dans le fuseau de référence, Europe/Paris (RG-008 modifiée et RG-053, DEC-012).
- **Dépendance retirée** : en v0.1, US-003 dépendait du reste à faire (US-009). La fin d'une tâche étant déclarative, cette dépendance disparaît.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-026 : fin sur déclaration, réouverture possible.
- RG-023 : fin d'une tâche parente.
- RG-025 : atteinte d'un objectif, état calculé.
- RG-001 : une tâche peut avoir plusieurs objectifs.
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-045 : une tâche terminée n'est pas en retard.
- RG-049, RG-050.

## Critères d'acceptation
1. **CA-1** — L'utilisateur déclare une tâche « à faire » terminée. Elle passe à l'état « terminée », et la date de la journée en cours, dans le fuseau de référence Europe/Paris, est conservée comme date de fin (RG-026, RG-008, RG-053).
   - Exemple : l'utilisateur, à New York, termine une tâche le 10 novembre 2026 à 23 h, heure locale (le 11 novembre 2026 à 5 h à Paris, 6 h d'écart à cette date) : la date de fin est le 11 novembre 2026.
2. **CA-2** — Aucune tâche ne passe à l'état « terminée » sans une action explicite de l'utilisateur, y compris une tâche parente dont toutes les sous-tâches sont terminées.
3. **CA-3** — L'utilisateur rouvre une tâche terminée. Elle repasse à l'état « à faire » et n'a plus de date de fin affichée. La date de fin précédente est conservée dans l'historique (RG-050).
4. **CA-4** — Un objectif est « atteint » quand toutes ses tâches non abandonnées sont terminées et que tous ses sous-objectifs sont atteints. Les tâches abandonnées sont ignorées. Un objectif qui n'a ni tâche non abandonnée ni sous-objectif est « à décliner en tâches ». Dans les autres cas, il est « en cours » (RG-025).
   - Exemple 1 : un objectif a trois tâches : deux terminées, une abandonnée. Il est atteint.
   - Exemple 2 : un objectif a une seule tâche, abandonnée, et aucun sous-objectif. Il est « à décliner en tâches ».
5. **CA-5** — Pour l'atteinte, les sous-tâches des tâches d'un objectif comptent comme ses tâches : l'objectif n'est pas atteint tant qu'une de ces sous-tâches est à faire.
6. **CA-6** — L'état d'un objectif est recalculé dès que l'une de ses tâches est terminée, rouverte, ajoutée, retirée, abandonnée, reprise ou supprimée, ou qu'un de ses sous-objectifs change d'état.
   - Exemple : un objectif atteint repasse « en cours » quand l'une de ses tâches est rouverte, ou quand une nouvelle tâche à faire lui est rattachée.
7. **CA-7** — Une tâche rattachée à plusieurs objectifs, une fois terminée, compte comme terminée pour chacun d'eux.
8. **CA-8** — Une tâche parente ne peut pas être déclarée terminée tant qu'il lui reste une sous-tâche ni terminée ni abandonnée ; l'action est refusée, avec un message qui indique le nombre de sous-tâches restantes (RG-023).
9. **CA-9** — Rouvrir une sous-tâche dont la tâche parente est terminée rouvre aussi la tâche parente, après confirmation.
10. **CA-10** — Une tâche terminée n'est pas « en retard », même si elle a été terminée après son délai. Rouverte, elle redevient « en retard » si son délai est antérieur à la journée en cours (RG-045).
11. **CA-11** — Les listes permettent de distinguer, ou de filtrer, les tâches « à faire » et « terminées ».
12. **CA-12** — *(RG-049)* Si, après échange des modifications des deux appareils, une tâche parente est terminée alors qu'une de ses sous-tâches est à faire, l'application le signale sur la tâche sans rien corriger automatiquement. Tant que l'incohérence persiste, les objectifs de la tâche ne sont pas atteints (CA-5). Elle est résolue quand la sous-tâche est terminée ou abandonnée, ou quand la tâche parente est rouverte.
13. **CA-13** — *(RG-050)* La fin et la réouverture d'une tâche sont conservées dans l'historique, avec la journée concernée.

## Cas limites et cas d'erreur
- Déclarer terminée une tâche déjà terminée : l'action n'est pas proposée.
- Tâche terminée sur un appareil et modifiée sur l'autre : RG-036 (US-017).
- Tâche terminée sur un appareil et abandonnée sur l'autre, avant échange : l'état le plus récent l'emporte (RG-036), et l'autre est signalé comme valeur écartée.
- Objectif sans délai : son atteinte se calcule de la même façon.
- Passage à l'heure d'été ou d'hiver : la journée reste celle de Paris, de minuit à minuit ; aucune date de fin n'est décalée.

## Hors périmètre
- Fin automatique quand le reste à faire atteint zéro (exclue, Q-DEM001-7.1 a).
- Atteinte d'un objectif déclarée manuellement (exclue).
- Calcul et affichage de la vélocité (US-010).
- Abandon d'une tâche (US-025).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§4.2, §6), ADR-003, ADR-011.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - cas d'usage `TerminerTache` et `RouvrirTache` ;
    - CA-9 : la réouverture de la tâche parente se fait dans la **même transaction** ;
    - calcul dérivé et récursif de l'atteinte : tâches non abandonnées, sous-tâches (CA-5), sous-objectifs, incohérences RG-049.
- **Données, décision d'architecture** :
  - l'état et ses dates forment **un seul registre « cycle de vie »** : `{etat, dateFin?, dateAbandon?, abandonParCascade?}`. Ce registre est fusionné comme **une seule information** au sens de RG-036 ;
  - sans ce regroupement, une fin sur un appareil et un abandon sur l'autre donneraient après fusion une tâche « abandonnée » portant une date de fin. Le regroupement règle ce cas limite (« état le plus récent l'emporte, l'autre est signalé ») et n'a pas d'effet visible pour l'utilisateur ;
  - `dateFin` est la `DateCalendaire` de la journée à Paris, calculée à partir de l'instant UTC (CA-1, RG-053). L'instant UTC est conservé dans le journal ;
  - journal : `TERMINEE` et `ROUVERTE`. La date de fin précédente est conservée (CA-3), et elle servira à la vélocité.
- **Accès Google** : aucun.
- **Sécurité** : sans objet particulier.
- **Exigences non fonctionnelles** : recalcul de l'atteinte en moins de 100 ms (5 000 tâches), avec mémoïsation par objectif.
- **Risques** :
  - changements d'heure (PT-16 : 25/10/2026 et 28/03/2027) ;
  - RG-049 (établie, V-05) : incohérence dérivée à la lecture, sans écriture (voir US-024) ;
  - CA-5 (validé) : il modifie la récursion de l'atteinte, sans effet sur l'architecture.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés (partagés)** : [ECR-007](../../02-ux/maquettes/ECR-007-detail-tache.html) (cadres A, G, H : terminer, tâche terminée à New York, incohérence).
- **Écrans modifiés** : [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) (cadre L4, filtre « Terminées » et marqueur d'incohérence) ; [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html) et [ECR-008](../../02-ux/maquettes/ECR-008-liste-objectifs.html) (état d'un objectif : « En cours », « Atteint », « À décliner en tâches »).
- **Parcours impactés** : P-13 (étapes 3 à 5 et 8), P-01 (étape 6, cible).
- **Nouveaux composants** : `ParisTimeNote` (date de fin à l'heure de Paris), `InconsistencyCard` (guide §4.21, §4.23).
- **Décisions d'ergonomie** :
  - terminer : 1 geste (case ronde, liste ou détail), avec toast « Annuler » ; rouvrir de même ; la ligne terminée rejoint « Terminées » après 3 s (CA-1, CA-3) ;
  - aucune fin automatique, même quand toutes les sous-tâches sont terminées (CA-2) ;
  - tâche parente non terminable : voir US-024 (CA-8) ;
  - rouvrir une sous-tâche d'une tâche terminée : dialogue « Rouvrir aussi X ? » (CA-9) ;
  - état d'un objectif toujours calculé, jamais saisi (CA-4 à CA-7) : l'anneau et le mot d'état se mettent à jour sur l'écran ;
  - **date de fin à l'heure de Paris** (CA-1) : quand l'appareil est ailleurs, la puce « Heure de Paris » accompagne « Terminée le 11 novembre 2026 » et l'explique (exemple de CA-1 : terminée à New York le 10 novembre à 23 h, soit le 11 novembre à 5 h à Paris ; cadre G) ;
  - incohérence (CA-12, RG-049) : voir US-024 ; tant qu'elle existe, les objectifs de la tâche ne sont pas atteints et l'écran de l'objectif ne le montre pas comme atteint.
- **États** :
  - *vide* : filtre « Terminées » vide, « Aucune tâche terminée. » ;
  - *chargement* : sans objet ;
  - *erreur* : action de fin refusée avec le nombre de sous-tâches restantes ;
  - *hors ligne* : disponible ; la date de fin reste celle de Paris ;
  - *synchronisation* : point « en attente » ;
  - *conflit* : tâche terminée d'un côté et abandonnée de l'autre : valeur écartée (ECR-011 C) ; incohérence.
- **Accessibilité et responsive** : la case ronde est un `checkbox` au nom explicite (« Terminer X » / « Rouvrir X ») ; la fin est annoncée `role="status"`, jamais seulement par la couleur ; cible 44 px.
- **Heure de Paris (BEN-8)** : écran du lot 1 portant la puce avec une date de fin : ECR-007 G (liste des écrans au guide §4.21).
- **Questions et réserves** : aucune nouvelle.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.feature`](../../../tests/features/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.feature) — **21 scénarios, dont 0 tagué `@propose`** (les règles et critères proposés ont été validés le 2026-10-21, DEC-018 ; le tag est retiré). Chaque scénario porte les tags `@US-003`, `@RG-xxx` et `@LOT-001`.

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02, S03 |
| CA-2 | S04 |
| CA-3 | S06, S20 |
| CA-4 | S07 |
| CA-5 | S08 |
| CA-6 | S09, S10 |
| CA-7 | S11 |
| CA-8 | S12 |
| CA-9 | S13, S14 |
| CA-10 | S15 |
| CA-11 | S16 |
| CA-12 (RG-049) | S18, S19 |
| CA-13 (RG-050) | S20 |
| Cas limite : terminer une tâche déjà terminée | S05 |
| Cas limite : terminée sur un appareil, abandonnée sur l'autre | S17 |
| Cas limite : objectif sans délai | S11 |
| Cas limite : changement d'heure du 25/10/2026 | S03 |
| RG-054 (mention « heure de Paris » sur la date de fin) | S21 |

Remarque : l'exemple de CA-1 est daté avec son année (10 novembre 2026, 23 h à New York, soit 5 h à Paris le 11 novembre), puisque l'écart horaire entre New York et Paris varie selon les dates ; il correspond au scénario S02. Correction de forme appliquée avec la validation du 2026-10-21 (DEC-018).

## Questions ouvertes
Aucune. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5.4 et 7. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-25 et 26 intégrées (CA-2, CA-4 à CA-8) ; règles proposées RG-049 et RG-050 (CA-12, CA-13) ; DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
