# US-023 — Organiser un objectif en sous-objectifs
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** décomposer un objectif en sous-objectifs, **afin de** structurer les objectifs ambitieux.

## Analyse d'écart (cahier des charges et existant)
- **Nouveau** : issu de Q-DEM001-6.1 d), qui retient les sous-objectifs et les sous-tâches. La v0.1 ne prévoyait que deux niveaux.
- **Précisé en v0.4** (Q-DEM001-24, 26, 29) : un seul niveau ; parent unique ; délai postérieur au parent accepté avec alerte ; déplacement et promotion possibles ; atteinte du parent conditionnée à celle de ses sous-objectifs ; à la suppression du parent, les sous-objectifs deviennent principaux.
- **Établi en v0.7** (validé le 2026-10-21, DEC-018) : réparation d'une hiérarchie invalide après fusion des modifications des deux appareils (RG-048, F12) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-022 : sous-objectifs sur un seul niveau, parent unique, alerte de délai, déplacement.
- RG-025 : un objectif est atteint quand ses tâches non abandonnées sont terminées et ses sous-objectifs atteints.
- RG-002, RG-004, RG-024, RG-045 s'appliquent aux sous-objectifs, qui sont des objectifs.
- RG-046 : suppression d'un objectif qui a des sous-objectifs.
- RG-047, RG-048, RG-050.

## Critères d'acceptation
1. **CA-1** — Depuis le détail d'un objectif principal, l'utilisateur crée un sous-objectif. Celui-ci a les mêmes informations qu'un objectif (US-001) et est rattaché à cet objectif, son seul parent (RG-022).
2. **CA-2** — Le détail d'un objectif affiche ses sous-objectifs, avec leur intitulé, leur délai, leur état et l'indication « en retard » le cas échéant. La liste des objectifs permet de distinguer les objectifs principaux de leurs sous-objectifs.
3. **CA-3** — Un seul niveau est autorisé : sur un sous-objectif, l'action « créer un sous-objectif » n'est pas proposée.
4. **CA-4** — Si le délai d'un sous-objectif est postérieur à celui de son parent, le sous-objectif est enregistré et une alerte nomme le parent. Aucune alerte si l'un des deux délais est absent. L'alerte est recalculée dès que l'un des deux délais change.
5. **CA-5** — L'utilisateur peut déplacer un sous-objectif sous un autre objectif principal, ou en faire un objectif principal. Les états des anciens et nouveaux parents, et l'alerte de délai, sont recalculés.
6. **CA-6** — Un objectif principal **sans** sous-objectif peut être placé sous un autre objectif principal et devient alors son sous-objectif. Un objectif principal qui **a** des sous-objectifs ne peut pas être placé sous un autre objectif : l'action est refusée, avec un message qui indique qu'un seul niveau est autorisé. Un objectif ne peut jamais être placé sous lui-même.
7. **CA-7** — Un objectif qui a des sous-objectifs est atteint quand toutes ses tâches non abandonnées sont terminées **et** que tous ses sous-objectifs sont atteints (RG-025). Son état est mis à jour dès qu'un sous-objectif change d'état.
   - Exemple 1 : toutes les tâches de O sont terminées, mais son sous-objectif S est en cours : O est « en cours ».
   - Exemple 2 : O n'a pas de tâche propre, et son unique sous-objectif S est atteint : O est « atteint ».
   - Exemple 3 : O a un sous-objectif S « à décliner en tâches » : O n'est pas atteint.
8. **CA-8** — La suppression d'un objectif qui a des sous-objectifs les transforme en objectifs principaux, après confirmation (RG-046).
9. **CA-9** — *(RG-048)* Si l'échange des modifications des deux appareils produit un objectif placé sous l'un de ses sous-objectifs, ou un deuxième niveau de sous-objectifs, l'application annule les déplacements en cause **un par un, du plus ancien au plus récent, jusqu'à obtenir une hiérarchie valide** (le seul, s'il n'y en a qu'un) ; les déplacements restants, devenus sans conflit, sont conservés. **Chaque déplacement annulé est signalé** comme valeur écartée. Une création n'est jamais annulée. *(DEC-025, Q-REF-1 a.)*
   - Exemple 1 : sur le PC, A est placé sous B ; ensuite, sur le smartphone sans réseau, B est placé sous A. Après échange, B est sous A (le déplacement le plus récent est conservé), A est objectif principal, et l'utilisateur est informé que le placement de A sous B a été annulé.
   - Exemple 2 : sur le PC, l'objectif O est placé sous P ; sur le smartphone, un sous-objectif S est créé sous O. Après échange, O redevient objectif principal avec son sous-objectif S, et l'utilisateur est informé que le placement de O sous P a été annulé.
10. **CA-10** — *(RG-047)* Si un objectif est supprimé sur un appareil pendant qu'un sous-objectif est créé sous lui sur l'autre, le sous-objectif créé devient objectif principal après échange.
11. **CA-11** — *(RG-050)* La création d'un sous-objectif et chaque changement de parent sont conservés dans l'historique, avec la journée et les valeurs avant et après.

## Cas limites et cas d'erreur
- Sous-objectif sans délai sous un objectif avec délai, ou l'inverse : aucune alerte (RG-022).
- Délai de sous-objectif égal à celui du parent : aucune alerte, puisqu'il n'est pas postérieur.
- Déplacement d'un sous-objectif sous l'objectif qui est déjà son parent : sans effet.
- Sous-objectif atteint dont le parent a encore des tâches à faire : le parent reste « en cours ».
- Chaîne de trois déplacements concurrents : annuler le plus ancien ne suffit pas toujours à rendre la hiérarchie valide ; le suivant est alors annulé à son tour, et chaque annulation est signalée (CA-9 ; S18c : A sous B, puis C sous A, puis D sous C, deux annulations).

## Hors périmètre
- Plus d'un niveau de sous-objectifs ; plusieurs parents pour un sous-objectif (exclus, Q-DEM001-24).
- Importance d'un sous-objectif (US-030).
- Agrégation des délais ou des estimations au niveau de l'objectif parent.

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4 (§4.2, §6), ADR-003.*

- **Composants touchés** :
  - contexte `objectifs-taches` :
    - champ `parentId` de `Objectif` ;
    - cas d'usage `CreerSousObjectif` et `DeplacerObjectif` ;
    - invariants vérifiés à la saisie : un seul niveau, aucun cycle, un objectif qui a des sous-objectifs ne peut pas être placé sous un autre ;
  - contexte `synchronisation` : **passe de réparation des hiérarchies** (RG-048), exécutée après chaque fusion.
- **Réparation RG-048** :
  - elle est déterministe ;
  - une **création** se reconnaît à ce que le HLC de `parentId` est égal au HLC de création de l'élément ; une création n'est jamais annulée ;
  - parmi les déplacements en cause, le plus ancien (HLC le plus petit) est annulé : `parentId` reprend sa valeur précédente, lue dans le journal ;
  - l'annulation est écrite avec un nouvel HLC. Si les deux appareils effectuent la même réparation, ils écrivent la même valeur, et la fusion converge ;
  - le signalement de la valeur écartée a un identifiant déterministe, qui évite les doublons.
- **Données** :
  - journal : `OBJECTIF_CREE` (avec le parent) et `PARENT_MODIFIE` (avant et après). La **valeur précédente du journal est nécessaire à RG-048** ;
  - RG-050 (établie, V-14) : le journal sert à l'historique et à la réparation (valeur précédente).
- **Accès Google** : aucun.
- **Sécurité** : sans objet particulier.
- **Exigences non fonctionnelles** : la passe de réparation est en O(n) sur les objectifs, négligeable.
- **Risques** :
  - R14 : exactitude de la réparation ; parade : tests de propriétés (aucun cycle, au plus un niveau, convergence) ;
  - RG-048 (établie, V-04) : règle déterministe (annulation du déplacement le plus ancien, une création n'étant jamais annulée), implémentée dans la passe de réparation.
- **ADR applicables** : ADR-003, ADR-010.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans créés (partagés)** : [ECR-008](../../02-ux/maquettes/ECR-008-liste-objectifs.html) (sous-objectifs en retrait, « Placer sous… », refus d'un deuxième niveau).
- **Écrans modifiés** : [ECR-003](../../02-ux/maquettes/ECR-003-detail-objectif.html) (version LOT-001, cadre E : détail d'un sous-objectif ; réserves Q-DEM001-24 et Q-24.4 levées).
- **Parcours impactés** : P-02 (étape 6), P-09 (déplacement annulé après fusion).
- **Nouveaux composants** : `ObjectiveRow` en retrait de 28 px, `ParentPicker` (liste à choix unique des parents possibles et de « Aucun, objectif principal ») (guide §4.28).
- **Décisions d'ergonomie** :
  - un seul niveau : sur un sous-objectif, « Ajouter un sous-objectif » est **absent** (CA-3), pas désactivé ;
  - alerte quand le délai du sous-objectif est postérieur à celui du parent, avec le parent nommé, sans blocage (CA-4) ;
  - déplacement (CA-5, CA-6) : le sélecteur propose les seuls parents possibles ; l'objectif lui-même est indisponible avec sa raison ; un objectif qui a des sous-objectifs ne peut pas être placé sous un autre, et le message l'explique avant tout choix ;
  - déplacement annulé après fusion (CA-9, RG-048) : `DiscardedItem` « Placement de X annulé » dans la feuille de synchronisation ;
  - suppression d'un objectif qui a des sous-objectifs (CA-8) : le texte de confirmation nomme les sous-objectifs promus.
- **États** :
  - *vide* : sous-objectif sans tâche, « À décliner en tâches » ;
  - *chargement* : sans objet ;
  - *erreur* : refus d'un deuxième niveau (message, bouton « Compris ») ;
  - *hors ligne* : toutes les actions disponibles ;
  - *synchronisation* : voir US-017 ;
  - *conflit* : déplacement annulé (RG-048), sous-objectif promu après suppression concurrente (CA-10, RG-047).
- **Accessibilité et responsive** : sélecteur de parent en boutons radio navigables au clavier ; retrait visible aussi dans le nom accessible (« sous-objectif de … »).
- **Compteur et état (PEP-10)** : un parent dont toutes les tâches propres sont terminées (3 / 3) reste « En cours » tant que son sous-objectif ne l'est pas atteint : voir ECR-008 A, « Préparer le lancement » (US-023 CA, exemple 1).
- **Questions et réserves** : aucune nouvelle.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21 ; mis à jour en E8).* Fichier : [`tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature`](../../../tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature) — **22 scénarios**. Chaque scénario porte les tags `@US-023`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01 |
| CA-2 | S02, S03 |
| CA-3 | S04 |
| CA-4 | S05, S06 |
| CA-5 | S07, S08 |
| CA-6 | S09, S10, S11 (dont, E8 Q-US-023-1, les refus cumulés : un seul code, par ordre de priorité ERR-031, puis ERR-030 variante objectif-a-des-sous-objectifs, puis ERR-030 variante cible-est-sous-objectif) |
| CA-7 | S13, S14 |
| CA-8 | S15 |
| CA-9 (RG-048) | S16, S17, S18, S18b (trois placements concurrents, seul le plus ancien est annulé), S18c (chaîne de trois placements, deux annulations successives, du plus ancien au plus récent) |
| CA-10 (RG-047) | S19 |
| CA-11 (RG-050) | S20 |
| Cas limite : un des délais absent ; délais égaux | S05 |
| Cas limite : déplacement sous le parent actuel | S12 |
| Cas limite : sous-objectif atteint, parent avec tâches à faire | S13 |

## Questions ouvertes
- **Q-US-001-1 (E8, en attente du commanditaire ; question portée par US-001)** : faut-il signaler dans la liste « Modifications non retenues » un sous-objectif créé sous un objectif supprimé sur l'autre appareil, devenu objectif principal (RG-047) ? Selon la réponse, CA-10 et S19 seront complétés et l'US repassera en validation (E6) pour ce point.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | Création (Pepper, E1), à partir de la réponse Q-DEM001-6.1 d). |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-24, 26 et 29 intégrées (CA-1 à CA-8) ; règles proposées RG-047, RG-048 et RG-050 (CA-9 à CA-11). |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : BEN-9 (S18b : RG-048 avec trois déplacements concurrents), PEP-8 (mentions caduques retirées). Aucune règle ni aucun critère n'est modifié. |
| 2026-10-21 | E7, tour 2 du refinement (Pepper) : DEC-025 / Q-REF-1 a intégrée à RG-048 et au CA-9 (annulation un par un, du plus ancien au plus récent, jusqu'à une hiérarchie valide ; chaque annulation signalée). Nouveau scénario S18c (chaîne de trois déplacements, deux annulations). S16, S17, S18 et S18b restent valables. |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-023-1 (ordre des refus cumulés ; deux exemples ajoutés à S11), Q-US-023-2 (glossaire v1.2), Q-US-001-2 (rendu de l'historique de S20 confirmé, valeur « aucun (objectif principal) » inscrite au glossaire), Q-US-017-7 (préfixes d'appareil, S16 à S18c). Précisions sans changement de règle. Q-US-001-1 (S19) en attente du commanditaire. |
