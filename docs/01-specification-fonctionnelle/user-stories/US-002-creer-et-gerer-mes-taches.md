# US-002 — Créer et gérer mes tâches
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** créer, consulter, modifier et supprimer une tâche, avec son délai et son estimation, et la rattacher à zéro, un ou plusieurs objectifs, **afin de** transformer mes objectifs en travail concret.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6. Les critères qui appliquent une règle **proposée** (RG-047, RG-050) sont soumis à la validation de cette règle.

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
- **Proposé en v0.4** (à valider en E6) : suppression concurrente d'une modification (RG-047) ; historique (RG-050).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-001 : rattachement à zéro, un ou plusieurs objectifs.
- RG-003 : délai obligatoire, date sans heure, sans valeur par défaut.
- RG-004 : modification possible à tout moment.
- RG-024 : alerte si le délai de la tâche est postérieur à celui d'un de ses objectifs.
- RG-028 : heures et minutes, pas de 30 min, minimum 30 min.
- RG-029 : estimation obligatoire, sans valeur par défaut, modifiable tant qu'aucun temps passé n'est saisi.
- RG-045 : tâche « en retard ».
- RG-008, RG-053 : journée dans le fuseau de référence, Europe/Paris ; RG-054 (proposée) : mention « heure de Paris » quand l'appareil est dans un autre fuseau (US-017, CA-11).
- RG-046 : suppression.
- RG-047, RG-050 (proposées).

## Critères d'acceptation
1. **CA-1** — L'utilisateur crée une tâche en saisissant :
   - un intitulé non vide **(P)** ;
   - un délai, obligatoire, qui est une date sans heure (RG-003) ;
   - une estimation, obligatoire, en heures et minutes, au pas de 30 min, d'au moins 30 min (RG-028, RG-029) ;
   - éventuellement, un ou plusieurs objectifs de rattachement (RG-001).
2. **CA-2** — À l'ouverture de la saisie d'une tâche, aucun délai et aucune estimation ne sont présélectionnés : l'utilisateur choisit explicitement l'un et l'autre (Q-ERG-03).
3. **CA-3** — L'enregistrement d'une tâche sans délai, ou sans estimation, est refusé, avec un message qui indique l'information manquante.
4. **CA-4** — Seules des estimations multiples de 30 min, d'au moins 0 h 30, peuvent être saisies (par exemple 0 h 30, 1 h 00, 1 h 30).
5. **CA-5** — Une tâche peut être créée sans objectif. Elle apparaît alors dans la vue « Tâches sans objectif » **(P)**.
6. **CA-6** — Une tâche rattachée à plusieurs objectifs apparaît dans le détail de chacun d'eux.
7. **CA-7** — Si le délai de la tâche est postérieur au délai d'un de ses objectifs, la tâche est enregistrée et une alerte nomme le ou les objectifs concernés (RG-024). Les objectifs sans délai ne déclenchent aucune alerte.
8. **CA-8** — L'utilisateur peut modifier l'intitulé, le délai et les objectifs de rattachement à tout moment (RG-004). Après chaque modification, les alertes RG-024, l'indication « en retard » et l'état des objectifs concernés (RG-025) sont recalculés.
9. **CA-9** — L'utilisateur peut modifier l'estimation d'une tâche tant qu'aucun temps passé n'a été saisi sur elle (RG-029). Au lot 1, la saisie du temps passé n'existe pas encore : l'estimation reste donc modifiable. La valeur en vigueur est l'estimation initiale qui servira à la vélocité. Pour une tâche qui a des sous-tâches, l'estimation est calculée et ne peut pas être modifiée (US-024).
10. **CA-10** — Un délai déjà dépassé est accepté ; la tâche est aussitôt signalée « en retard ». Une tâche est « en retard » quand elle est à faire et que son délai est antérieur à la journée en cours. Elle ne l'est plus dès que son délai est reporté à aujourd'hui ou plus tard, ou qu'elle est terminée ou abandonnée (RG-045).
11. **CA-11** — La liste des tâches affiche, pour chacune : l'intitulé, le délai, l'estimation, l'état, le ou les objectifs, et l'indication « en retard » le cas échéant. Elle est triée par délai croissant **(P)**, en attendant l'ordre de priorité (US-004).
12. **CA-12** — La suppression d'une tâche demande une confirmation, puis elle est définitive. Si la tâche a des sous-tâches, la confirmation indique leur nombre, et elles sont supprimées avec elle (RG-046). L'état de ses objectifs est recalculé.
13. **CA-13** — *(RG-047, proposée)* Si une tâche est supprimée sur un appareil et modifiée sur l'autre avant qu'ils n'aient échangé leurs modifications, elle reste supprimée sur les deux appareils, et l'utilisateur est informé des modifications écartées.
14. **CA-14** — *(RG-050, proposée)* La création d'une tâche (avec son estimation, son délai, ses objectifs), la modification de son délai ou de son estimation, son rattachement à un objectif ou son détachement, et sa suppression sont conservés dans l'historique, avec la journée et les valeurs avant et après.

## Cas limites et cas d'erreur
- Délai égal à la journée en cours : accepté, la tâche n'est pas en retard.
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
  - RG-047 (proposée) : comme US-001.
- **ADR applicables** : ADR-003, ADR-010, ADR-011.

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-002-creer-et-gerer-mes-taches.feature`.

## Questions ouvertes
Aucune. Les critères (P) et ceux qui appliquent une règle proposée (CA-13, CA-14) sont soumis à la validation du commanditaire en E6.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-5, 6, 9 et 12. |
| 2026-10-20 | v0.4 (Pepper, fin de E1) : réponses Q-DEM001-28 et 29 intégrées (CA-1, CA-3, CA-4, CA-9, CA-10, CA-12) ; réponse Q-ERG-03 (CA-2) ; règles proposées RG-047 et RG-050 (CA-13, CA-14) ; DEC-012 (fuseau de référence Europe/Paris). |
