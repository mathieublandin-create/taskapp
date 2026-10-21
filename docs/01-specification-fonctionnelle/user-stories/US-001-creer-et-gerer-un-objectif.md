# US-001 — Créer et gérer un objectif
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer un objectif, avec ou sans délai, **afin de** formaliser ce que je cherche à atteindre.

> Les marqueurs (P) (propositions de Pepper) ont été retirés : tous les critères sont validés par le commanditaire (DEC-018, 2026-10-21).

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 : le délai d'un objectif devient facultatif (Q-DEM001-5.1 : « non ») ; l'état « atteint » est calculé (Q-DEM001-5.4 a).
- **Précisé en v0.4** :
  - un objectif sans tâche non abandonnée ni sous-objectif est « à décliner en tâches » (Q-DEM001-26.3 a) ;
  - un délai déjà dépassé peut être saisi, et l'objectif est aussitôt signalé en retard (Q-DEM001-28.4 et 28.5 a) ;
  - la suppression est définitive ; les tâches sont détachées et les sous-objectifs deviennent principaux (Q-DEM001-29.1, 29.2, 29.4).
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : la suppression l'emporte sur une modification concurrente faite sur l'autre appareil (RG-047, F12) ; historique des événements (RG-050, F10).
- **Non inclus ici** : l'importance d'un objectif (RG-030), reportée avec la priorisation (US-030) ; les sous-objectifs (US-023).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : un objectif peut regrouper plusieurs tâches.
- RG-002 : délai facultatif, date sans heure ; délai dépassé accepté.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte quand le délai d'une tâche est postérieur à celui de l'objectif.
- RG-025 : état calculé (en cours, atteint, à décliner en tâches).
- RG-045 : objectif « en retard ».
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-046 : suppression.
- RG-047 : suppression concurrente d'une modification.
- RG-050 : historique.

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée un objectif en saisissant un intitulé non vide, une description facultative et, s'il le souhaite, un délai, qui est une date sans heure (RG-002).
2. **CA-2** — Un objectif peut être enregistré sans délai. Il est alors affiché avec la mention « sans délai ».
3. **CA-3** — La liste des objectifs affiche, pour chacun : l'intitulé ; le délai ou la mention « sans délai » ; l'état (« en cours », « atteint » ou « à décliner en tâches ») ; l'indication « en retard » le cas échéant ; le nombre de tâches terminées sur le nombre de tâches non abandonnées qui lui sont directement rattachées, sans compter les sous-tâches.
4. **CA-4** — Le détail d'un objectif affiche ses informations, la liste de ses tâches et celle de ses sous-objectifs (US-023).
5. **CA-5** — L'utilisateur peut modifier l'intitulé, la description et le délai, ainsi qu'ajouter ou retirer un délai, à tout moment (RG-004).
6. **CA-6** — Quand le délai de l'objectif est modifié, ajouté ou retiré, les alertes RG-024 de ses tâches sont recalculées :
   - une tâche dont le délai devient postérieur à celui de l'objectif affiche l'alerte ;
   - l'alerte disparaît si le délai de l'objectif est retiré ou repoussé au-delà de celui de la tâche.
7. **CA-7** — Un délai déjà dépassé est accepté à la saisie ; l'objectif est aussitôt signalé « en retard ». Un objectif est « en retard » quand son délai est antérieur à la journée en cours et qu'il n'est pas atteint. Il ne l'est plus dès qu'il est atteint, ou que son délai est retiré ou reporté à aujourd'hui ou plus tard (RG-045).
8. **CA-8** — L'état d'un objectif n'est jamais saisi par l'utilisateur. Il est calculé selon RG-025 (voir US-003). Un objectif qui n'a ni tâche non abandonnée ni sous-objectif est affiché « à décliner en tâches ».
9. **CA-9** — La suppression d'un objectif demande une confirmation, puis elle est définitive (RG-046) :
   - ses tâches sont conservées et détachées de lui ; celles qui n'ont plus aucun objectif deviennent des tâches sans objectif ;
   - ses sous-objectifs deviennent des objectifs principaux ;
   - le message de confirmation indique le nombre de tâches détachées et de sous-objectifs concernés.
10. **CA-10** — *(RG-047)* Si l'objectif est supprimé sur un appareil et modifié sur l'autre avant qu'ils n'aient échangé leurs modifications, il reste supprimé sur les deux appareils, et l'utilisateur est informé des modifications écartées. Une tâche rattachée entre-temps à cet objectif sur l'autre appareil en est détachée ; un sous-objectif créé entre-temps sous lui devient objectif principal.
11. **CA-11** — *(RG-050)* La création d'un objectif, la modification de son délai et sa suppression sont conservées dans l'historique, avec la journée et les valeurs avant et après. Cet historique n'est pas affiché au lot 1.

## Cas limites et cas d'erreur
- Intitulé vide, ou composé uniquement d'espaces : l'enregistrement est refusé, avec un message qui l'explique.
- Deux objectifs portant le même intitulé : c'est autorisé.
- Délai égal à la journée en cours : l'objectif n'est pas en retard.
- Objectif dont toutes les tâches sont abandonnées et qui n'a pas de sous-objectif : « à décliner en tâches » (RG-025).
- Suppression du seul objectif d'une tâche : la tâche devient une tâche sans objectif.
- Modification du même objectif sur deux appareils : RG-036 (US-017).
- Utilisateur en voyage hors du fuseau de Paris : l'indication « en retard » suit la journée de Paris (RG-008, RG-053) ; par exemple, à New York en hiver, un objectif dont le délai est la date du jour à New York est signalé en retard dès 18 h, heure locale, puisqu'il est alors minuit à Paris. Le délai lui-même, date sans heure, ne change jamais de jour (RG-053). Les deux appareils affichent toujours la même indication ; la mention « heure de Paris » est proposée (RG-054).

## Hors périmètre
- Importance d'un objectif (US-030).
- Sous-objectifs (US-023).
- Atteinte déclarée manuellement, ou mesurée par une valeur cible chiffrée (exclues, Q-DEM001-5.4 a).
- Corbeille et restauration d'un objectif supprimé (exclues, Q-DEM001-29.4 a).
- Contrôle de la tenue du délai selon la vélocité (US-007).
- Affichage de l'historique (lots « Vélocité et pilotage »).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§6), ADR-003, ADR-010, ADR-011.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - entité `Objectif` ;
    - cas d'usage `CreerObjectif`, `ModifierObjectif` et `SupprimerObjectif` ;
    - services de domaine **dérivés**, calculés et jamais stockés : état (RG-025), « en retard » (RG-045, journée calculée dans Europe/Paris par `Horloge`) et alertes RG-024 ;
  - présentation : liste et détail.
- **Données** :
  - `Objectif` : id en UUID v7, intitulé, description, délai (`DateCalendaire` sans fuseau, RG-053), `parentId`, pierre tombale `supprime` ;
  - chaque champ porte son HLC ;
  - journal (RG-050) : `OBJECTIF_CREE`, `DELAI_MODIFIE` et `OBJECTIF_SUPPRIME`, avec l'instant UTC, le jour calculé dans Europe/Paris et les valeurs avant et après.
- **Suppression (RG-046)** :
  - pierre tombale ;
  - les conséquences sont **dérivées à la lecture**, et non écrites en cascade :
    - un lien tâche–objectif dont l'objectif est supprimé est ignoré ;
    - un sous-objectif dont le parent est supprimé est affiché comme objectif principal.
  - Cette dérivation applique **par construction** RG-047 aux éléments rattachés ou créés en même temps sur l'autre appareil (CA-10). Elle ne demande aucune écriture de réparation et converge sur les deux appareils.
- **Accès Google** : aucun appel direct ; Drive est utilisé à travers US-017.
- **Sécurité** : intitulés et descriptions affichés avec échappement (pas d'injection HTML) ; aucune donnée métier dans les journaux techniques.
- **Exigences non fonctionnelles** :
  - recalcul des états et des alertes en moins de 100 ms pour 500 objectifs et 5 000 tâches ;
  - calcul en mémoire, à partir d'index locaux.
- **Risques** :
  - « en retard » dépend de la journée à Paris : tests multi-fuseaux et changements d'heure (PT-16) ;
  - si **RG-047 était rejetée**, le comportement par défaut de la fusion par champ ne « ressuscite » pas un élément supprimé ; une règle contraire demanderait une logique de restauration supplémentaire.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés** : [ECR-008](../../02-ux/maquettes/ECR-008-liste-objectifs.html), liste des objectifs (état, progression, délai ou « Sans délai », « En retard »), création d'un objectif, suppression avec ses conséquences, état vide.
- **Écrans modifiés** : [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html) (version LOT-001 : en-tête, progression en tâches, menu « … », suppression ; réserves Q-DEM001-26.3 et 29 levées).
- **Parcours impactés** : P-02 (créer un objectif et ses tâches, adapté au lot 1).
- **Nouveaux composants** : `ObjectiveRow` (liste), `GoalProgress` (existant, états « atteint » et « à décliner en tâches »), variante « objectif » de la feuille de saisie, `ConfirmDialog` de suppression (guide §4.15, §4.28, §4.12).
- **Décisions d'ergonomie** :
  - création : intitulé seul obligatoire (CA-1), description facultative, « Sans délai » explicite (CA-2), pas d'importance au lot 1 ; après « Créer », le détail du nouvel objectif s'ouvre ;
  - la liste affiche l'état en toutes lettres, les tâches terminées sur les tâches non abandonnées directement rattachées (CA-3) ; « En retard » = mot + icône + rouge (CA-7) ;
  - suppression (CA-9) : texte de confirmation avec le nombre de tâches détachées et de sous-objectifs promus ; définitive, sans corbeille ;
  - suppression concurrente d'une modification (CA-10, RG-047) : signalée dans la feuille de synchronisation, pas dans cet écran.
- **États** :
  - *vide* : « Un objectif donne une direction à vos tâches. » + « Créer un objectif » ;
  - *chargement* : données de l'appareil aussitôt ;
  - *erreur* : « Indiquez un intitulé. » sous le champ, focus dessus, texte conservé ;
  - *hors ligne* : création, modification et suppression disponibles ;
  - *synchronisation* : point « en attente » sur les lignes modifiées hors ligne ;
  - *conflit* : voir US-017 (ECR-011 C).
- **Accessibilité et responsive** : anneau de progression avec texte équivalent ; nom accessible complet de la ligne ; création en feuille sur smartphone, panneau de 400 px sur PC (`Maj`+`N`).
- **Questions et réserves** : l'importance (US-030) est hors lot ; le regroupement « Atteints » replié est une proposition de Steeve (E6).

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-001-creer-et-gerer-un-objectif.feature`](../../../tests/features/US-001-creer-et-gerer-un-objectif.feature) — **21 scénarios, dont 0 tagué `@propose`** (les règles et critères proposés ont été validés le 2026-10-21, DEC-018 ; le tag est retiré). Chaque scénario porte les tags `@US-001`, `@RG-xxx` et `@LOT-001`.

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01, S02, S04 |
| CA-2 | S03 |
| CA-3 | S06 |
| CA-4 | S07 |
| CA-5 | S08, S09 |
| CA-6 | S10 |
| CA-7 | S11, S12, S13, S14 |
| CA-8 | S15 |
| CA-9 | S16, S17, S18 |
| CA-10 (RG-047) | S19, S20 |
| CA-11 (RG-050) | S21 |
| Cas limite : intitulé vide ou blanc | S04 |
| Cas limite : intitulé en double | S05 |
| Cas limite : délai égal à la journée en cours ; changement d'heure du 25/10/2026 | S13 |
| Cas limite : toutes les tâches abandonnées | S15 |
| Cas limite : suppression du seul objectif d'une tâche | S16 |
| Cas limite : voyage hors du fuseau de Paris | S14 |
| Cas limite : modification sur deux appareils (RG-036) | US-017 S09, S10 |

## Questions ouvertes
Aucune. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5 et 6. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-26, 28 et 29 intégrées (CA-3, CA-7, CA-8, CA-9) ; règles proposées RG-047 et RG-050 (CA-10, CA-11) ; DEC-012 (fuseau de référence Europe/Paris). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
