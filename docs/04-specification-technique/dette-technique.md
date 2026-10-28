# Registre de la dette technique

> **Version 0.4 — 2026-10-28 — Anthony.** Il est tenu par Anthony et vérifié par Jarvis à la clôture de chaque lot (E17).

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Registre initialisé, vide. |
| 0.2 | 2026-10-21 | Anthony | E7 de LOT-001 : inscription de DT-001 (données locales non chiffrées au repos, DS-07, RG-043, DEC-015). |
| 0.4 | 2026-10-28 | Anthony | E11 de LOT-001 : inscription de DT-002 (archivage des appareils inactifs hors du lot 1, Q-ST017-STA-3, RL-LOT-001-A9, DAT v0.11.4 §4.2). |
| 0.3 | 2026-10-22 | Anthony | DT-001 alignée sur `conventions.md` v0.4 (DEC-034, ADR-013) : IndexedDB sur tous les appareils ; SQLite et SQLCipher renvoyés au repli. |

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
| DT-001 | 2026-10-21 | Constat (DAT v0.5 DS-07, §7.1 ; RG-043 ; DEC-015 ; DAT v0.11, ADR-013) | Sécurité | Les données locales (IndexedDB du profil du navigateur, sur le PC et sur le téléphone ; *repli* : SQLite sur Android) ne sont pas chiffrées au repos et restent sur l'appareil après une déconnexion. | `DepotLocalDexie` (contexte `synchronisation`, LOT-001) ; *repli* : `DepotLocalSqlite` | Lecture possible par une personne disposant du téléphone déverrouillé (profil Chrome) ou du même profil de navigateur sur PC ; sensibilité accrue avec les réponses de bilan (lot DEM-002) | P3 | Réévaluation avant la conception du lot DEM-002 (bilan du soir) et à toute évolution des données sensibles ; option de chiffrement applicatif par clé WebCrypto non extractible ; *repli* : SQLCipher sur Android (DAT §7.1) | Identifiée |
| DT-002 | 2026-10-28 | Q-ST017-STA-3, RL-LOT-001-A9 (DAT v0.11.4 §4.2, §4.1.4) | Conception | L'archivage des fichiers d'appareil inactifs depuis plus de 90 jours (DAT §4.2) n'est pas réalisé au lot 1 : un fichier inactif (ancienne installation, espace supprimé puis recréé avec un nouvel `appareilId`) est fusionné comme les autres et reste dans le dossier `Done Juan/`. | `CycleSynchronisation` et `controlerDrive` (contexte `synchronisation`, ST-US-017 §6.3, §6.7) | Fichiers inactifs accumulés dans le Drive ; chacun relu une fois au premier inventaire de chaque appareil, puis jamais (inchangé) ; aucune perte, aucun effet fonctionnel au lot 1 | P3 | Conception propre (dérogation à « un seul écrivain par fichier ») avec Starck. Conditions fixées : n'archiver qu'un fichier non modifié depuis 90 jours **et** dont toutes les écritures sont connues du fichier de l'appareil qui archive (contexte causal). Déclencheur : plus de 10 fichiers d'appareil dans un dossier, ou le premier lot d'EPI-001 (plusieurs comptes), au plus tard | Identifiée |

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
- Origine : constat sur le DAT v0.5 (DS-07, §7.1 « Données au repos »), confirmé par le DAT v0.11 et ADR-013 (IndexedDB sur tous les appareils), RG-043 (données conservées à la déconnexion), DEC-015 (action distincte « Supprimer les données de cet appareil »), DEC-010 (pas de chiffrement supplémentaire dans le Drive)
- Catégorie : Sécurité — Priorité : P3 — Statut : Identifiée
- Localisation : adaptateur `DepotLocalDexie` du contexte `synchronisation` (LOT-001), seul adaptateur en cible ; *repli* : `DepotLocalSqlite` (`conventions.md` §19.4) ; `conventions.md` §9.3
- Description : en v1, l'état local est écrit en clair dans IndexedDB, dans le profil du navigateur, sur le PC comme sur le téléphone (PWA installée, ADR-013) ; *repli* : SQLite dans le bac à sable de l'application Android, sans SQLCipher. Depuis RG-043, ces données ne sont pas effacées à la déconnexion. La protection des données personnelles au repos (OWASP ASVS ; *repli* : MASVS-STORAGE) n'est pas atteinte au-delà de l'isolement par origine fourni par le navigateur.
- Raison : choix d'architecture de Starck (DS-07) pour la simplicité et la robustesse du lot 1 ; décision du commanditaire de conserver les données à la déconnexion (RG-043), avec pour parade une action explicite de suppression (DEC-015, RG-055). Les données du lot 1 (objectifs, tâches) sont d'une sensibilité modérée.
- Impact : sur le téléphone, données accessibles à qui dispose du téléphone déverrouillé et peut ouvrir la PWA avec le compte enregistré, ou à un attaquant disposant d'un accès au système de fichiers (appareil rooté, profil Chrome) ; sur PC, données lisibles par tout utilisateur du même profil de navigateur. L'impact augmente avec les réponses aux questions de bilan du soir (DEM-002), traitées comme les données les plus sensibles.
- Mesures compensatoires en place dès LOT-001 : espace local cloisonné par compte et nommé par empreinte SHA-256 du `sub` (aucun e-mail ni `sub` en clair dans les noms) ; aucun jeton persisté (DS-06) ; action « Supprimer les données de cet appareil » testée pour ne laisser aucune donnée de l'espace (conventions §9.3) ; recommandation d'usage du DAT §7.1 (pas de PC partagé sans session personnelle du système).
- Plan de remboursement : (1) avant E9 du lot DEM-002, Anthony saisit Starck pour décider du chiffrement au repos (chiffrement applicatif par clé WebCrypto non extractible, à évaluer, sur tous les appareils ; *repli* : SQLCipher sur Android) ; (2) si le chiffrement est retenu, ST-US dédiée avec migration de l'espace local existant ; (3) sinon, passage au statut « Acceptée durablement », sur décision motivée validée par Starck et portée à la connaissance du commanditaire via Jarvis.
- Critère de remboursement : données de l'espace local illisibles sans la clé (test d'intégration lisant la base IndexedDB brute ; *repli* : le fichier SQLite), ou décision « Acceptée durablement » tracée.
- Historique : 2026-10-21, inscription (Identifiée) ; 2026-10-22, alignement sur ADR-013, sans changement de priorité ni de statut.
