# Registre de la dette technique

> **Version 0.1 — 2026-10-20 — Anthony.** Registre initialisé, vide. Il est tenu par Anthony et vérifié par Jarvis à la clôture de chaque lot (E17).

## Règles de tenue

- **Qui inscrit** : Anthony, à partir de ses propres constats, des déclarations de Benjamin (E12), des remarques de revue acceptées en dette (E13) ou des constats de Starck (E14).
- **Identifiant** : `DT-xxx`, numérotation continue, jamais réutilisée.
- **Lien avec le code** : tout `TODO` ou `FIXME` du code référence son entrée : `TODO(DT-xxx)`. Toute dérogation à une règle impérative de `conventions.md` fait l'objet d'une entrée.
- **Remboursement** : chaque entrée a un plan (lot cible ou condition déclenchante). Une dette de priorité P1 est remboursée dans le lot en cours ou le suivant. Une entrée remboursée passe au statut « Remboursée » avec la référence du commit ou de l'US ; elle n'est pas supprimée.
- **Revue** : le registre est relu à chaque conception détaillée (E9). Les dettes qui touchent le périmètre du lot sont intégrées aux ST-US quand c'est pertinent.

### Catégories
| Catégorie | Exemples |
|---|---|
| Conception | Couplage entre contextes, abstraction manquante, écart provisoire au DAT validé par Starck |
| Code | Duplication tolérée, complexité au-dessus du seuil, nommage provisoire |
| Tests | Couverture sous le seuil, doublure incomplète, cas temporel non couvert, test manuel non automatisé |
| Sécurité | Durcissement reporté, dépendance vulnérable sans correctif disponible |
| Données | Migration provisoire, format temporaire dans l'espace de l'utilisateur |
| Outillage | Contrôle de CI manquant ou non bloquant |
| Documentation | ST-US ou glossaire non à jour |

### Priorités
| Priorité | Définition | Délai de remboursement |
|---|---|---|
| P1 — Critique | Risque de sécurité, de perte ou de corruption de données, ou blocage à court terme | Lot en cours ou suivant |
| P2 — Haute | Ralentit nettement les évolutions ou fragilise les tests d'une zone active | Sous 2 lots |
| P3 — Moyenne | Gêne localisée | Planifiée lors d'un passage dans la zone |
| P4 — Basse | Confort | Opportuniste |

### Statuts
`Identifiée` → `Planifiée` → `En cours` → `Remboursée` (ou `Acceptée durablement`, sur décision motivée d'Anthony, validée par Starck pour une dette de conception).

## Registre

| Id | Date | Origine (US / RC / ANO) | Catégorie | Description | Localisation | Impact | Priorité | Plan de remboursement | Statut |
|---|---|---|---|---|---|---|---|---|---|

*Aucune dette inscrite à ce jour.*

## Gabarit de fiche détaillée

Une fiche détaillée est rédigée ci-dessous pour toute dette de priorité P1 ou P2.

```markdown
### DT-xxx — <titre court>
- Date d'inscription : AAAA-MM-JJ — inscrite par : <agent>
- Origine : US-xxx / RC-US-xxx-n / ANO-xxx / constat
- Catégorie : <catégorie> — Priorité : P<n> — Statut : <statut>
- Localisation : `chemin/fichier:ligne` (et repères `TODO(DT-xxx)`)
- Description : ce qui a été fait, et en quoi cela s'écarte de la cible.
- Raison : pourquoi cette dette a été acceptée (contrainte, délai, information manquante).
- Impact : risques (sécurité, données, maintenabilité, tests) et zones concernées.
- Plan de remboursement : actions, lot cible ou condition déclenchante, effort estimé.
- Critère de remboursement : comment vérifier que la dette est soldée.
- Historique : dates et changements de statut.
```

## Fiches détaillées

*Aucune fiche à ce jour.*
