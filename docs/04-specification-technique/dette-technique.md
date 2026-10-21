# Registre de la dette technique

> **Version 0.2 — 2026-10-21 — Anthony.** Il est tenu par Anthony et vérifié par Jarvis à la clôture de chaque lot (E17).

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Registre initialisé, vide. |
| 0.2 | 2026-10-21 | Anthony | E7 de LOT-001 : inscription de DT-001 (données locales non chiffrées au repos, DS-07, RG-043, DEC-015). |

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
| DT-001 | 2026-10-21 | Constat (DAT v0.5 DS-07, §7.1 ; RG-043 ; DEC-015) | Sécurité | Les données locales (IndexedDB sur PC, SQLite sur Android) ne sont pas chiffrées au repos et restent sur l'appareil après une déconnexion. | `DepotLocalDexie`, `DepotLocalSqlite` (contexte `synchronisation`, à créer en LOT-001) | Lecture possible par une personne disposant du téléphone déverrouillé ou du même profil de navigateur sur PC ; sensibilité accrue avec les réponses de bilan (lot DEM-002) | P3 | Réévaluation avant la conception du lot DEM-002 (bilan du soir) et à toute évolution des données sensibles ; option SQLCipher sur Android (DAT §7.1) | Identifiée |

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

### DT-001 — Données locales non chiffrées au repos
- Date d'inscription : 2026-10-21 — inscrite par : Anthony
- Origine : constat sur le DAT v0.5 (DS-07, §7.1 « Données au repos »), RG-043 (données conservées à la déconnexion), DEC-015 (action distincte « Supprimer les données de cet appareil »), DEC-010 (pas de chiffrement supplémentaire dans le Drive)
- Catégorie : Sécurité — Priorité : P3 — Statut : Identifiée
- Localisation : adaptateurs `DepotLocalDexie` et `DepotLocalSqlite` du contexte `synchronisation` (à créer en LOT-001) ; `conventions.md` §9.3
- Description : en v1, l'état local est écrit en clair : IndexedDB dans le profil du navigateur sur PC, SQLite dans le bac à sable de l'application sur Android, sans SQLCipher. Depuis RG-043, ces données ne sont pas effacées à la déconnexion. La cible de sécurité (OWASP MASVS-STORAGE pour le mobile, protection des données personnelles au repos) n'est pas atteinte au-delà de l'isolement fourni par la plateforme.
- Raison : choix d'architecture de Starck (DS-07) pour la simplicité et la robustesse du lot 1 ; décision du commanditaire de conserver les données à la déconnexion (RG-043), avec pour parade une action explicite de suppression (DEC-015, RG-055). Les données du lot 1 (objectifs, tâches) sont d'une sensibilité modérée.
- Impact : sur Android, données accessibles à qui dispose du téléphone déverrouillé et peut se reconnecter avec le compte enregistré, ou à un attaquant disposant d'un accès au système de fichiers (appareil rooté, sauvegarde) ; sur PC, données lisibles par tout utilisateur du même profil de navigateur. L'impact augmente avec les réponses aux questions de bilan du soir (DEM-002), traitées comme les données les plus sensibles.
- Mesures compensatoires en place dès LOT-001 : espace local cloisonné par compte et nommé par empreinte SHA-256 du `sub` (aucun e-mail ni `sub` en clair dans les noms) ; aucun jeton persisté (DS-06) ; action « Supprimer les données de cet appareil » testée pour ne laisser aucune donnée de l'espace (conventions §9.3) ; recommandation d'usage du DAT §7.1 (pas de PC partagé sans session personnelle du système).
- Plan de remboursement : (1) avant E9 du lot DEM-002, Anthony saisit Starck pour décider du chiffrement au repos (SQLCipher sur Android ; sur PC, chiffrement applicatif par clé non extractible WebCrypto, à évaluer) ; (2) si le chiffrement est retenu, ST-US dédiée avec migration de l'espace local existant ; (3) sinon, passage au statut « Acceptée durablement », sur décision motivée validée par Starck et portée à la connaissance du commanditaire via Jarvis.
- Critère de remboursement : données de l'espace local illisibles sans la clé (test d'intégration lisant le fichier SQLite ou la base IndexedDB brute), ou décision « Acceptée durablement » tracée.
- Historique : 2026-10-21, inscription (Identifiée).
