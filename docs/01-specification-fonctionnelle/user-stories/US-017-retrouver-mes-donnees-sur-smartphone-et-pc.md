# US-017 — Retrouver mes données sur smartphone et sur PC
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** que mes données soient conservées dans mon espace de stockage personnel et que je les retrouve sur mon smartphone comme sur mon PC, **afin de** passer de l'un à l'autre sans ressaisie.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Modifié** par rapport à la v0.1 :
  - le sens de « données décentralisées » est tranché : les données sont dans l'espace de stockage personnel de l'utilisateur (Q-DEM001-3 b) ;
  - smartphone et PC sont exigés dès la première version (complément Q-DEM001-1 j) ;
  - délai d'une heure (complément, interprétation à confirmer en Q-DEM001-21) ;
  - règle de conflit : la modification la plus récente l'emporte (complément Q-DEM001-4.2).
- **Séparé.** L'usage hors ligne fait l'objet de US-018 (lot suivant proposé) et de US-031.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-017 : smartphone et PC dès la première version, mêmes données, délai d'une heure.
- RG-018 : utilisateur unique, données non partagées.
- RG-020 : données conservées dans l'espace personnel.
- RG-036 : la modification la plus récente l'emporte.
- ENF-01, ENF-02, ENF-06 (proposée).

## Critères d'acceptation
1. **CA-1** — L'application est utilisable sur un smartphone et sur un PC, avec un affichage adapté à chacun (ENF-01). Toutes les fonctions du lot 1 sont disponibles sur les deux appareils **(P)**.
2. **CA-2** — Un objectif ou une tâche créé, modifié ou supprimé sur un appareil connecté au réseau devient visible sur l'autre appareil connecté dans le délai fixé par RG-017 : au plus une heure, sous réserve de Q-DEM001-21.1.
3. **CA-3** — À l'ouverture de l'application sur un appareil connecté, les données affichées tiennent compte des dernières modifications faites sur l'autre appareil, selon la réponse à Q-DEM001-21.2.
4. **CA-4** — Toutes les données de l'application sont conservées dans l'espace de stockage personnel de l'utilisateur (RG-020). L'application n'en conserve aucune copie ailleurs que dans cet espace et sur les appareils de l'utilisateur.
5. **CA-5** — Après fermeture et réouverture de l'application, sur le même appareil ou sur l'autre, les données sont identiques à celles enregistrées.
6. **CA-6** — Quand la même donnée a été modifiée sur les deux appareils avant qu'ils n'aient échangé leurs modifications, la modification la plus récente l'emporte (RG-036). La granularité et l'information de l'utilisateur dépendent de Q-DEM001-23.
7. **CA-7** — Au lot 1, sans réseau, l'application indique qu'une connexion est nécessaire. Aucune saisie n'est perdue sans que l'utilisateur en soit averti (ENF-06). Le fonctionnement hors ligne relève de US-018.

## Cas limites et cas d'erreur
- Suppression d'une tâche sur un appareil, modification de la même tâche sur l'autre : application de RG-036 (l'action la plus récente l'emporte), sous réserve de la granularité de Q-DEM001-23.
- Espace de stockage plein : l'utilisateur est averti que sa modification n'a pas pu être enregistrée, et rien n'est perdu sans avertissement **(P)**.
- Données supprimées ou modifiées directement dans l'espace de stockage, hors de l'application : Q-DEM001-22.4.
- Les deux appareils sont dans des fuseaux horaires différents : sans effet au lot 1, puisque les délais sont des dates (Q-DEM001-28.4, à confirmer).

## Hors périmètre
- Saisie hors ligne (US-018, US-031).
- Partage avec d'autres personnes (exclu, RG-018).
- Export ou import de données.

## Impacts architecture

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature`.

## Questions ouvertes
- **Q-DEM001-21 (P1)** : sens de « dans l'heure qui suit » ; affichage immédiat à l'ouverture.
- **Q-DEM001-22 (P1)** : service de stockage ; données modifiées hors de l'application.
- **Q-DEM001-23 (P1)** : granularité de la règle de conflit et information de l'utilisateur.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 : US provisoire au backlog initial. |
| 2026-10-20 | Fichier détaillé créé (Pepper, E1), après les réponses Q-DEM001-3 et 4 et les compléments du commanditaire. |
