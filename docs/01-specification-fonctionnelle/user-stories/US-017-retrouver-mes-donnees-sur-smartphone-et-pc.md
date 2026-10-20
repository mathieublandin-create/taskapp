# US-017 — Retrouver mes données sur smartphone et sur PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** que mes données soient conservées dans mon espace de stockage personnel et que je les retrouve sur mon smartphone comme sur mon PC, **afin de** passer de l'un à l'autre sans ressaisie.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-047 à RG-049, partie b de RG-044) sont soumis à la validation de cette règle.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - le sens de « données décentralisées » est tranché : les données sont dans le Google Drive du compte de connexion (Q-DEM001-3 b, 22.1 a), dans un dossier visible (DEC-009) ;
  - smartphone Android et PC sont exigés dès la première version (complément Q-DEM001-1 j ; DEC-001) ;
  - délai d'une heure (complément ; Q-DEM001-21.1, lu comme l'option a, à confirmer en Q-DEM001-41) et affichage immédiat à l'ouverture (Q-DEM001-21.2) ;
  - règle de conflit appliquée information par information, avec information sur la valeur écartée (Q-DEM001-23).
- **Limites signalées par l'architecte** (DAT §8), conséquences de la décision « aucun serveur » (DEC-007) :
  - F1 : un appareil éteint ou fermé ne peut rien afficher ; le délai d'une heure ne vaut que si l'appareil destinataire est ouvert et connecté ;
  - F14 : sur PC, si la session Google du navigateur a expiré, un geste de reconnexion précède la mise à jour.
- **Nouveau en v0.4** : restauration ou remise à zéro si les données sont supprimées hors de l'application (RG-044) ; règles de réparation après fusion (RG-047 à RG-049, proposées, F12).
- **Décision D1 (DEC-002)** : le hors ligne du smartphone (US-018) entre dans LOT-001. Le CA-7 retient la variante « hors ligne inclus » (F13).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-017 : smartphone et PC dès la première version, mêmes données, délai d'une heure (formulation F1 et F14).
- RG-018 : utilisateur unique, données non partagées.
- RG-020 : données conservées dans le Google Drive du compte de connexion.
- RG-021, RG-035 : sans réseau ou sans accès Google, saisies conservées puis enregistrées (CA-7).
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-044 : données supprimées ou illisibles dans le Drive : restaurer ou repartir de zéro.
- RG-047, RG-048, RG-049 (proposées) : réparations après fusion.
- ENF-01, ENF-02, ENF-04, ENF-06 (validée), ENF-07.

## Critères d'acceptation
1. **CA-1** — L'application est utilisable sur un smartphone Android et sur un PC, avec un affichage adapté à chacun (ENF-01). Toutes les fonctions du lot 1 sont disponibles sur les deux appareils **(P)**.
2. **CA-2** — Les deux appareils étant ouverts et connectés au réseau, un objectif ou une tâche créé, modifié ou supprimé sur l'un est visible sur l'autre **au plus tard une heure après**, sans action de l'utilisateur (RG-017 ; sens du délai à confirmer, Q-DEM001-41). Si l'autre appareil est fermé ou éteint, la modification y est visible dès son ouverture (CA-3).
3. **CA-3** — À l'ouverture de l'application sur un appareil connecté :
   - les données présentes sur l'appareil s'affichent aussitôt ;
   - les modifications faites sur l'autre appareil et déjà enregistrées dans le Drive y sont intégrées **sans attendre le délai d'une heure**, au plus tard **une minute** après l'ouverture **(P : valeur à valider)** ;
   - **exception sur PC** : si la session Google du navigateur a expiré, l'application affiche les données présentes sur le PC, reste utilisable et indique qu'une reconnexion est nécessaire pour la mise à jour. L'intégration a lieu après le geste de reconnexion de l'utilisateur (F14).
4. **CA-4** — Toutes les données de l'application sont conservées dans le Drive de l'utilisateur (RG-020). L'application n'en conserve aucune copie ailleurs que dans ce Drive et sur les appareils de l'utilisateur (DEC-007).
5. **CA-5** — Après fermeture et réouverture de l'application, sur le même appareil ou sur l'autre, les données sont identiques à celles enregistrées.
6. **CA-6** — Quand la **même information** d'un élément a été modifiée sur les deux appareils avant qu'ils n'aient échangé leurs modifications, la modification la plus récente l'emporte. Quand des **informations différentes** du même élément ont été modifiées, toutes les modifications sont conservées (RG-036).
   - Exemple : sur le PC, l'intitulé d'une tâche devient « Rédiger le plan » ; ensuite, sur le smartphone, avant tout échange, son délai passe au 15 novembre. Après échange, la tâche a l'intitulé « Rédiger le plan » et le délai du 15 novembre, sur les deux appareils.
7. **CA-7** — *(variante « hors ligne inclus », retenue par DEC-002)* Sans réseau, l'utilisateur continue de consulter et de saisir. Ses saisies sont conservées sur l'appareil, signalées comme non synchronisées, puis enregistrées dans son Drive au retour du réseau, sans action de sa part ; aucune n'est perdue (ENF-06). Le fonctionnement détaillé sans réseau sur le smartphone (ouverture sans réseau, indicateurs) est décrit par US-018. Sur le PC, l'ouverture de l'application sans réseau dépend de Q-DEM001-39 ; une saisie faite sur le PC pendant une coupure, application déjà ouverte, est dans tous les cas conservée puis enregistrée. La même règle s'applique pendant une perte de l'accès Google (RG-035).
8. **CA-8** — Quand une valeur saisie sur un appareil est écartée par une modification concurrente faite sur l'autre (CA-6), l'utilisateur en est informé : élément concerné, information, valeur non retenue (RG-036). Une valeur remplacée plus tard, en connaissance de cause, n'est pas signalée.
   - Exemple signalé : intitulé « A » saisi sur le PC, puis intitulé « B » saisi sur le smartphone sans réseau, avant d'avoir reçu « A » ; « B » l'emporte, et « A » est signalé comme valeur écartée.
   - Exemple non signalé : le smartphone reçoit « A », puis l'utilisateur le remplace par « B ».
9. **CA-9** — Si les données de l'application sont absentes ou illisibles dans le Drive alors que l'appareil en détient une copie, l'application avertit l'utilisateur et lui propose (RG-044) :
   - **restaurer** ses données à partir de la copie de l'appareil : elles sont de nouveau présentes dans le Drive et sur les deux appareils ;
   - **repartir de zéro** *(proposé, à valider en E6)* : après une confirmation, les données sont effacées de l'appareil ; à sa prochaine synchronisation, l'autre appareil efface aussi les siennes, sans reposer la question. S'il détenait des modifications pas encore enregistrées, l'utilisateur en est informé (valeurs écartées).
   - Tant que l'utilisateur n'a pas choisi, rien n'est effacé et rien n'est réécrit dans le Drive **(P)**.
10. **CA-10** — *(règles proposées, à valider en E6)* Après l'échange des modifications des deux appareils, l'application applique les règles de réparation :
    - suppression d'un côté, modification de l'autre : la suppression l'emporte, et les modifications écartées sont signalées (RG-047 ; détail dans US-001, US-002, US-024) ;
    - hiérarchie d'objectifs invalide : le déplacement le plus ancien est annulé et signalé (RG-048 ; détail dans US-023) ;
    - incohérence d'état entre une tâche et ses sous-tâches : elle est signalée, sans correction automatique (RG-049 ; détail dans US-003, US-024, US-025).

## Cas limites et cas d'erreur
- Drive plein : l'utilisateur est averti que ses modifications ne peuvent pas être enregistrées dans son Drive ; elles restent conservées sur l'appareil et rien n'est perdu sans avertissement **(P)**.
- Les deux appareils dans des fuseaux horaires différents : au lot 1, la date de fin, la date d'abandon et l'indication « en retard » sont déterminées par la journée de l'appareil utilisé (RG-008) ; elles peuvent donc différer d'un appareil à l'autre pendant quelques heures. Ce comportement est assumé : le commanditaire a maintenu RG-008 (DEC-011).
- Horloge de l'un des appareils déréglée de plusieurs minutes : la modification réellement la plus récente l'emporte quand même. Si l'écart dépasse 24 h, l'application avertit l'utilisateur **(P)**.
- Les deux appareils n'ont pas la même version de l'application : l'appareil dont la version est la plus ancienne invite l'utilisateur à la mettre à jour avant de permettre la saisie **(P, comportement à confirmer par l'architecte en E3)**.
- Modification faite directement dans les fichiers du Drive, qui les laisse lisibles : *point à préciser par l'architecte en E3* (cas non couvert par RG-044, qui ne vise que les données absentes ou illisibles).

## Hors périmètre
- Fonctionnement détaillé sans réseau sur le smartphone (US-018) ; sur le PC (US-031, selon Q-DEM001-39).
- Mise à jour des données quand l'application est fermée (synchronisation en arrière-plan, lot ultérieur).
- Partage avec d'autres personnes (exclu, RG-018).
- Export ou import de données.
- Application pour iPhone (exclue en v1, DEC-001).

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature`.

## Questions ouvertes
- **Q-DEM001-41 (P1)** : confirmation que le délai d'une heure porte sur les données entre appareils (CA-2).
- **Q-DEM001-39 (P1 depuis DEC-002)** : ouverture de l'application sans réseau sur le PC (CA-7).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-3 et 4 et les compléments du commanditaire. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-21, 22 et 23 intégrées (CA-2, CA-3, CA-6, CA-8, CA-9) ; limites F1 et F14 de l'architecte (CA-2, CA-3) ; règles de réparation proposées F12 (CA-10) ; CA-7 remplacé par la variante « hors ligne inclus » (F13, DEC-002) ; DEC-001 (Android), DEC-007 (aucun serveur), DEC-009 (dossier visible), DEC-011 (journée de l'appareil). |
