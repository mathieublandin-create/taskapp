# E11 — Revue de lancement de LOT-001 : reformulation et questions de Benjamin

| Élément | Valeur |
|---|---|
| Lot | LOT-001 « Socle et objectifs/tâches », 14 rangs (0 à 13), 10 US, 282 scénarios |
| Date, auteur | 2026-10-28, Benjamin |
| Conception relue | `LOT-001.md` (section « Ordre de réalisation et incréments », rangs 0 à 13) ; `ST-socle-ecriture.md` v0.3 ; ST-US-001, 023, 002, 024, 003, 025 ; ST-US-022 v0.3, ST-US-017 v0.3, ST-US-018, ST-US-031 ; `conventions.md` v0.4.2 ; `checklist-revue-code.md` ; `lancement-LOT-001-{pepper,steeve,starck}.md` (Starck : réserve A1 levée, avis favorable sans réserve) |
| Code relu | 117 squelettes de `src/` (fichiers qui lèvent `ErreurNonImplementee` par `nonImplemente`) ; 100 fichiers de test, 424 tests rouges |
| État de départ mesuré | Commit `b542d4e`, branche `main`. Node 22.22.0, pnpm 10.28.0. `tsc --noEmit`, `eslint . --max-warnings 0` et `prettier --check .` : au vert. `vitest run` : 100 fichiers et **424 tests en échec « non implémenté »**, comme annoncé. `pnpm test` refuse de démarrer (`engine-strict`, Node 24 requis) ; j'ai lancé `node_modules/.bin/vitest` directement, en lecture seule. |
| Avis | **Prêt** pour l'E12 du rang 0, sous réserve de la réponse à Q-BEN-LOT001-1 (branches Git). Les autres questions ne bloquent pas le démarrage ; trois d'entre elles (2, 3, 4) bloquent la **clôture** du rang 0 si elles restent sans réponse. |

Aucun fichier de `src/` ni de `tests/` n'a été modifié pour rédiger ce document.

---

## 1. Reformulation du travail, rang par rang

### Règles de travail que j'applique à tous les rangs

- Les tests d'Anthony (`UT-…`, `CT-…`, `.feature`) ne sont ni modifiés, ni désactivés, ni affaiblis. Les corps de `tests/doublures/*` et de `tests/support/banc/temps-simule.ts`, livrés en squelettes (`nonImplemente`), sont des **livrables à réaliser** : ST-socle §3 n° 31 et 32, et « Précisions de l'E10 ». Je ne touche pas aux fabriques et aux assertions déjà complètes (`tests/support/valeurs.ts`, `fabriques/`, `plans.ts`, `modifications.ts`, `environnement.ts`, `fabrique-indexeddb-espionne.ts`, `fast-check.ts`). Si Anthony lit cela autrement, qu'il me le dise.
- Un rang est livré par une branche, une *pull request* et la Definition of Done de `conventions.md` §15 : tests du rang verts, lint, types, architecture, formatage, sécurité, couverture, `rangCourant` incrémenté dans la PR qui livre le rang.
- Les *step definitions* sont livrées au rang de la capacité qu'elles appellent (`conventions.md` §11.13), même si leurs scénarios s'exécutent plus tard. Elles sont minces, sans logique métier.
- Aucun texte affiché hors catalogue, aucune décision dans un composant React, aucun secret en dur ; `VITE_ENV` préfixe tous les noms de stockage.
- Les rangs 9 à 13 n'ont pas encore leurs tests unitaires (E10 d'Anthony avant chaque E12 : incréments 2 à 4, US-018, US-031). Ces rangs sont décrits d'après les ST.

### Rang 0 — Socle (8 j écriture + 4 j socle complémentaire) — détaillé

**Ce que je livre.** Le modèle d'écriture synchronisable (ST-socle) et le socle complémentaire (ST-US-022 §3.1) : types communs, HLC, contexte causal, pierres tombales, journal typé, index des écritures en attente, projection `EtatMetier`, `ServiceEtatLocal` et son implémentation transactionnelle, `DepotLocalDexie` en durabilité stricte, ports et adaptateurs transverses, doublures, banc, monde Cucumber, étapes communes, outillage et CI.

**Ordre de réalisation** (ST-socle §15 ; l'outillage de la partie 2 passe avant la première ligne de code).

| Étape | Contenu | Fichiers (numéros des ST) | Tests à faire passer |
|---|---|---|---|
| 0.1 | Outillage minimal pour travailler en Node 24 (partie 2, étapes 1 et 2) | `package.json`, `pnpm-lock.yaml`, configurations | Base de départ : 424 rouges, types, lint et formatage au vert |
| 0.2 | Commun, domaine : `Instant`, `EcartTemps`, `DateCalendaire`, `Fuseau`, `jourDeReference` (date-fns et @date-fns/tz, seul usage dans `commun/domaine/temps/`), `Duree`, identifiants (vérifient la forme UUID). `Resultat`, `Marque`, `assertNever`, `ErreurProgrammation` sont livrés complets : je n'y touche pas. | socle #1 à 7 ; `src/commun/domaine/**` | UT-SOC-01 à 07 (`duree`, `date-calendaire`, `jour-de-reference`) |
| 0.3 | Adaptateurs `HorlogeSysteme` (seul lecteur de l'heure système, `Date.now`, `performance.now`, `Intl`) et `GenerateurUuidV7` ; doublures `HorlogeSimulee`, `TempsSimule`, `GenerateurIdentifiantsSequentiel` | socle #8 à 11, #31, #32 (partie temps) | Utilisés par tous les tests suivants |
| 0.4 | Synchronisation, domaine : `hlc` (3 règles, comparaison ordinale, jamais `localeCompare`), `contexte-causal`, `identifiant-evenement`, `information` (`cleEnTexte`, `idLien`, `elementDeCle`), `ecriture`, `evenement-journal`, `index-en-attente`, `etat-local`, `modification`, `pierre-tombale`, `planifier-ecritures` (§6.3, un HLC par modification), `etat-metier`, `projection` | socle #12 à 23 | UT-SOC-08 à 32, 42, 43 (dont les deux fichiers de propriétés fast-check) |
| 0.5 | Port `DepotLocal` et `DepotLocalDexie` : 4 tables (`registres`, `journal`, `enAttente`, `meta`), Dexie v1, `chromeTransactionDurability: 'strict'`, succès résolu **après `complete`**, rechargement de l'état si `meta.version` a changé, `null` ↔ `undefined`, instants en ISO, relecture par Zod, toute erreur de base traduite en `EcritureLocaleImpossible`. Je ne réalise pas ici `ouvrirEspace`, `appareil()`, `fermer()`, `surFermetureImposee` (rang 1) ni `lireMeta` / `appliquerSynchronisation` (rang 3). | socle #24, 27, 28 | UT-SOC-40, 41, 44, 45, 46 ; CT-DEPOT-01 à 07 sur `DepotLocalDexie` |
| 0.6 | `ServiceEtatLocalTransactionnel.modifier` (§6.8) : opération UUID v7, instant lu une fois, projection mémorisée par `version`, plan, une seule transaction ; `lire`, `lireJournal`, `lireDecompteEnAttente` | socle #25, 26 | UT-SOC-33 à 39 |
| 0.7 | Support Cucumber : `monde.ts` (`MondeDoneJuan`), `hooks.ts` (`After` : échec sur entrée `erreur` non attendue), `types-parametres.ts` (`{appareil}`, `{date}`, `{heure}`, `{fuseau}`, `{duree}`, `{ecart}`), `prefixes.ts` (`etapeContexte`, `etapeAction`, `etapeAssertion` : variantes du §11.7), `references.ts` (intitulé ambigu), `temps.ts` (heure ambiguë : première occurrence ; heure inexistante : échec), `commandes-en-attente.ts` ; étapes communes : `nous sommes le …`, préfixes `{ecart} plus tard, ` et `au même instant exact, `, `réglé sur le fuseau`, `l'utilisateur confirme` / `renonce` ; `AppareilSimule` et `BancSynchro` à un ou deux appareils, sans transport | socle #32 à 34 | Tests complémentaires de moi (ST-socle §14) : `temps.ts`, `references.ts`, préfixes |
| 0.8 | Socle complémentaire : ports `Planificateur`, `EtatReseau`, `SourceAleatoire`, `JournalTechnique` (existent déjà), adaptateurs `PlanificateurNavigateur`, `EtatReseauNavigateur`, `SourceAleatoireCrypto`, `JournalTechniqueLocal` (avec `masquerDonneesSensibles`) ; doublures `PlanificateurSimule` (à réaliser), `ReseauSimule`, `SourceAleatoireDeterministe` (complète), `JournalTechniqueMemoire` | ST-US-022 §3.1 S1 à S6 | UT-US-022-48 (masquage) ; UT-US-022-49 (délais de reprise), voir Q-BEN-LOT001-5 |
| 0.9 | Outillage du dépôt et CI : configurations (`.dependency-cruiser.cjs`, `cucumber.mjs`, ESLint étendu : blocs `files` des adaptateurs autorisés, importations restreintes, React, a11y), scripts `verifier-catalogue`, `verifier-tags`, `verifier-rangs`, `verifier-depot`, `selection-scenarios.mjs`, `verifier-etapes-inutilisees.mjs`, `tests/support/rangs-scenarios.json` (282 clés, tirées de la table de `LOT-001.md`, avec contrôle des décomptes par US), `ci.yml`, `dependabot.yml`, `pull_request_template.md`, `.env.example`, `.gitignore` complété | ST-US-022 §3.1 S8, S9 | Les contrôles eux-mêmes ; la CI verte |
| 0.10 | Composition minimale : `index.html` (`no-referrer`, CSP), `vite.config.ts`, `main.tsx`, `composition/web.ts` ; contrôle dependency-cruiser | ST-US-022 §3.1 S10 ; socle #30 | `vite build` passe ; aucun import interdit |
| 0.11 | Tests complémentaires (ST-socle §14) : `cleEnTexte`, `idLien`, `partiesDuLien`, `elementDeCle`, `Instant` ; intégration `DepotLocalDexie` (observation entre deux instances, quota simulé) ; performance indicative `modifier` avec 5 000 tâches et 50 000 entrées de journal, mesure consignée dans la PR | — | Couverture 95 % / 90 % sur `synchronisation/{domaine,application}` |

**Scénarios Cucumber visés.** Aucun (rang 0 : « — »). La preuve des étapes communes vient de leurs tests de support et d'un `cucumber-js --dry-run` sur les dix `.feature` (aucune étape de rang 0 ne doit être signalée comme inutilisée). Comme la sélection est vide à ce rang, `cucumber.mjs` ne doit pas retomber sur « tous les `.feature` » quand la liste est vide : je le traite dans le script.

**Risques que je surveille.**
- Observation entre instances : le port exige un rappel « y compris d'une autre instance (onglet) ». Le mécanisme de Dexie entre onglets (`storagemutated`) n'est pas garanti avec `fake-indexeddb` dans un seul processus. Je réalise d'abord le cahier des charges du contrat (CT-DEPOT-05, UT-SOC-39) ; si un registre interne par `IDBFactory` est nécessaire en test, je le signalerai comme détail d'adaptateur et non comme changement d'architecture.
- Aucun `await` d'une promesse non Dexie dans `appliquer` (la transaction se fermerait) : règle du §9 du socle, vérifiée par UT-SOC-45 et 46.
- Le départage des HLC et des identifiants d'événement repose sur l'ordre ordinal des chaînes : je n'emploie jamais `localeCompare`.

**Fin du rang 0.** PR avec sortie des commandes, couverture, mesure de performance ; première CI verte ; puis demande à Jarvis d'activer la protection de `main` (DEC-029, condition A5 de Starck).

### Rang 1 — US-022, connexion et compte (11,5 j) — détaillé

**Ce que je livre.** Le contexte `compte` complet et le premier adaptateur Google : `FournisseurAuthWeb` unique (redirection silencieuse `prompt=none` à l'ouverture, GIS `initTokenClient` avec `login_hint` pour le geste, repli par redirection interactive une fois par geste, redirection interactive d'emblée sur web-ios, `GardeSaisie`), consommation du retour de redirection par la première instruction de `main.tsx` (RED-01 à RED-08), base technique `donejuan-<env>-technique`, espaces par compte (`nomEspace` = SHA-256 du `sub`), `ouvrirEspace` avec `appareilId` né avec l'espace, déconnexion, suppression des données, fin de session entre onglets (`AvisOnglets`, `versionchange` sans réouverture, `ERR-017`), préparation du dossier Drive, `ClientGoogle` et reprise, modèles de vue partagés de l'indicateur et des bandeaux (RG-057, RG-058), écran d'attente `SYN-REDIRECTION` limité à 10 s, écrans ECR-010 et section « Compte » d'ECR-011.

**Ordre de réalisation** (ST-US-022 §15, avec les ajouts de la v0.3).

| Étape | Contenu | Fichiers (ST-US-022 §3.2) | Tests |
|---|---|---|---|
| 1.1 | Domaine `compte` : `identite`, `portees`, `motif-connexion`, `ouverture` (`deciderOuverture`), `acces` (`accesApresRetour`, `qualifierRefusJeton`) | #1 à 5 | UT-US-022-01 à 17 |
| 1.2 | Ports (`FournisseurAuth`, `CoffreJetons`, `MemoireRedirection`, `MemoireSession`, `AvisOnglets`, `GardeSaisie`, `GestionEspaces`, `PreparationStockage`, `DepotAvantSortie`), `SessionCourante` | #6 à 14 | (via les cas d'usage) |
| 1.3 | Infrastructure d'authentification : `retour-redirection` (efface le fragment **avant** analyse), `verification-retour`, `url-autorisation`, `passerelle-gis`, `strategie-geste`, `fournisseur-auth-web`, `coffre-jetons-memoire`, `configuration` | #22 à 27, 31 | UT-US-022-18, 19, 20, 43, 51, 52 ; mes tests unitaires de `FournisseurAuthWeb` (un par code d'erreur GIS, une navigation par geste, web-ios sans GIS, `redirectionPermise` faux) |
| 1.4 | Stockage : `base-technique` (Dexie technique, durabilité stricte, `memoriser` résolu après `complete`, lecture destructive, `versionchange` sans réouverture), `nom-espace`, `GestionEspacesIndexedDb` (délai de 5 s, `SuppressionBloquee`), `AvisOngletsBroadcast`, `DepotLocalDexie.ouvrirEspace` / `appareil()` / `fermer()` / `surFermetureImposee` | #28 à 30, 10 b, 54 | UT-US-022-37, 55, 60, 61 ; mes tests d'intégration (base technique, `GestionEspaces`, `AvisOngletsBroadcast`) |
| 1.5 | Cas d'usage : `OuvrirApplication` (dont `abandonnerAttenteGoogle` à 10 s), `SeConnecter`, `ReprendreSession`, `SeDeconnecter`, `SupprimerDonneesAppareil` (`evaluer`, `confirmer`, `confirmerPerte`, `reessayer`, `fermerApresBlocage`), `SignalerRefusJeton`, `consulter-compte`. Ordres imposés : suppression `effacer → diffuser → supprimer → oublier → fermer` ; déconnexion `oublier → effacer → diffuser → fermer`. | #15 à 21 | UT-US-022-21 à 36, 38, 39, 53, 54, 56, 57, 58 |
| 1.6 | `ClientGoogle` (en-tête `Authorization`, `traduireReponse`, en-tête `Date`), `executerAvecReprise`, ports `TransportSynchro` (méthode `preparerDossier` seule), `AccesGoogle`, `SuiviCycle`, `PreparationDossierDrive`, `TransportSynchroDrive.preparerDossier` | #37 à 42, 45 | UT-US-022-27, 50 (et 49 si Q-BEN-LOT001-5 le place ici) |
| 1.7 | Modèles de vue : `ecran-connexion`, `racine`, `retour-reprise` (toast `TST-SAISIE-A-TERMINER`), `section-compte`, `confirmations-compte`, `etat-synchronisation-affichable`, `indicateur-synchronisation`, `bandeau` (seule fonction de sélection), `MasquageRappel`, `consulterEtatSynchronisation` | #32 à 35, 43 à 48 | UT-US-022-40 à 42, 44 à 47, 59 |
| 1.8 | UI : ECR-010 (invitation, erreurs `ERR-001` à `ERR-006`, cadre « Attente »), section « Compte », `SyncStatus`, `Banner`, `ConfirmDialog` ; tests de composants avec `@testing-library/react` | #50 | Tests de composants (catalogue, `data-etat`, rôles ARIA) |
| 1.9 | Doublures et steps : `FauxGoogle`, `FauxFournisseurAuth`, `FauxDrive` (dossier seulement), `ReseauSimule` branché, étapes de `connexion.steps.ts`, `etat-affiche.steps.ts`, `drive.steps.ts`, `reseau.steps.ts`, `appareils.steps.ts` (§12.1 n° 1 à 44) ; banc à deux appareils complété | #52, 53 | Scénarios du rang |
| 1.10 | Composition : `web.ts` et `main.tsx` (première instruction : `consommerRetourRedirection`), règles ESLint ajoutées (`location.hash` et `history.replaceState` dans `retour-redirection.ts` seulement ; `location.assign` et `window.google` dans deux fichiers ; aucune dérogation `sessionStorage`) | #51 | Build ; aucun import interdit |
| 1.11 | Contrat `FournisseurAuth` (`FauxFournisseurAuth` et `FournisseurAuthWeb`) | — | Voir Q-BEN-LOT001-8 |

**Scénarios Cucumber visés (profil `default`, `rangCourant` = 1).** US-022 : S01, S05, S06, S09b, S13a, S20a, S20b, S20c, S21, S22. Les scénarios différés d'US-022 (S02, S07, S09a, S10, S16, S17a, S17b, S19, S23 au rang 2 ; S03, S08, S09c, S09d, S11, S12, S14, S15, S18, S23b au rang 3) n'ont pas à être verts au rang 1, mais leurs étapes sont livrées ici dès que la capacité existe.

**Points d'attention.**
- Tests : 80 cas UT-US-022 en tout (dont 48 et 49 au rang 0), 2 cas d'intégration, plus mes tests de la §14 de la ST.
- La racine `ATTENTE_GOOGLE` n'est pas une demande de connexion (glossaire v1.10 §12) ; l'étape « les données … s'affichent aussitôt » échoue tant que la racine est `ATTENTE_GOOGLE` (RL-LOT-001-P2).
- Aucun jeton ni fragment dans le journal, le cache ou l'historique ; jeton en mémoire seulement.
- `ERR-017` : libellé « Aller à la connexion » repris de UT-US-022-57 (commit `ea298ed`).

### Rangs 2 à 13 — vue d'ensemble

| Rang | Je livre | Fichiers principaux | Tests à faire passer | Scénarios visés |
|---|---|---|---|---|
| 2, US-001 (5 j) | Contexte `objectifs-taches` : `Intitule`, description, `refus`, `actions`, `confirmation`, `vue-metier`, `etat-objectif` (RG-025), `retard` (RG-045), décisions de création, modification et suppression d'objectif, cas d'usage, requêtes (`lecture-courante`, `resumes`, liste, détail, historique), `comparerOrdreReference` (ordre du guide §5.8), modèles de vue de la liste (ECR-008, sections `SEC-OBJ-ATTEINTS`, `EVD-OBJECTIFS-TOUS-ATTEINTS`) et du détail (ECR-003), `VUES_EXPOSEES` ; catalogue complet (`catalogue.fr.ts`, `libelle`, `formaterDate`) ; écrans, magasin Zustand ; `rendu-historique.ts` ; étapes d'objectifs, de refus et d'historique | ST-US-001 §3 (#1 à 38) | UT-US-001-01 à 35 ; relecture de `UT-SOC-*` et de la suite de contrat (condition 2 de Starck) ; mes tests de `formaterDate` et `libelle`, performance 500 objectifs / 5 000 tâches | US-001 : S01, S02, S03, S04, S04b, S05, S08, S09, S11, S13, S14, S21. Différés : US-022 S02, S07, S09a, S10, S16, S17a, S17b, S19, S23 ; US-017 S27 |
| 3, US-017 incr. 1 (10 j) | Transport Drive complet (`TransportSynchroDrive`), format schéma 1 (sérialisation canonique, empreinte SHA-256, gzip, schémas Zod lâches, table d'appareils), fusion par information, réception d'HLC, marqueur « déposé jusqu'à », retrait de l'index après dépôt, `CycleSynchronisation` (déclencheurs, reprises, `SYN-RETENTATIVE`, `SYN-ACTION`, `ERR-011`, 401), `DepotAvantSortie` réel, `MEN-ATTENTE`, ordre de la feuille ; jeton de changements pris avant l'inventaire, `JetonChangementsInvalide` ; `FauxDrive` complet, `DepotLocalEnMemoire`, `lireMeta` et `appliquerSynchronisation` (Dexie v2) | ST-US-017 §3.1 (#1 à 21 c) | UT-US-017-01 à 33 ; CT-TRANS-01 à 10 (sur `FauxDrive` puis `TransportSynchroDrive` avec MSW) ; CT-DEPOT-01 à 11 sur Dexie **et** `DepotLocalEnMemoire` ; propriétés de la fusion | US-017 : S02, S04, S06b, S07, S17a, S17b, S29. Différés : US-022 S03, S08, S09c, S09d, S11, S12, S14, S15, S18, S23b |
| 4, US-023 (3 j) | Sous-objectifs : `verifierPlacement`, `ALR-007`, décisions de placement, `CreerSousObjectif`, `PlacerObjectif`, `RendreObjectifPrincipal`, sélecteur de parent, refus `ERR-030` et `ERR-031` | ST-US-023 §3 (#1 à 16) | UT-US-023-01 à 21 | US-023 : S01, S02, S03, S04, S05, S06, S08, S09, S10, S11, S12, S15, S20 |
| 5, US-002 (6 j) | Tâches : saisie cumulable (`ERR-020` à `ERR-023`), rattachements n-n, estimation en vigueur, alertes `ALR-005`, retard, suppression confirmée, liste « Tâches » (filtres et tris du guide §5.7), détail, tâches dans le détail d'objectif, étape de contexte « les tâches suivantes : » (`construction-taches.ts`) | ST-US-002 §3 (#1 à 22) | UT-US-002-01 à 35 | US-002 : 20 scénarios (S01 à S24 listés dans `LOT-001.md`) ; **rang le plus chargé en différés** : US-001 (S07, S10, S16, S18, S22), US-023 S07, US-017 (S05, S06, S12), US-022 S04, US-018 (19 scénarios) et US-031 (14 scénarios) |
| 6, US-024 (4 j) | Sous-tâches : un seul niveau, `ERR-032`, confirmation `CNF-AJOUT-SOUS-TACHE-TERMINEE`, estimation calculée, recopie de l'estimation à la suppression de la dernière sous-tâche (H-3), `ALR-006`, `ALR-012`, `ALR-013`, `nomAccessible` des lignes | ST-US-024 §3 (#1 à 10, #4 au rang 9) | UT-US-024-01 à 23 (sauf les cas de rang 9, voir Q-BEN-LOT001-2) | US-024 : S01, S02, S03, S04, S06, S09, S10, S11, S12, S13, S14, S23. Différés : US-002 S13, US-018 S13 |
| 7, US-003 (3 j) | Terminer et rouvrir : `deciderFinTache`, `ERR-035`, `CNF-ROUVRIR-SOUS-TACHE`, date de fin de Paris, `MEN-HEURE-PARIS`, `etatJournalDe` | ST-US-003 §3 (#1 à 9) | UT-US-003-01 à 16 | US-003 : 16 scénarios (S01 à S22 listés). Différés : US-001 S12, S17 ; US-002 S11, S20, S21 ; US-023 S13, S14 ; US-024 S07, S17, S19 ; US-017 S03, S08, S28 ; US-018 S04, S06b ; US-031 S06 |
| 8, US-025 (3,5 j) | Abandon (cascade, `abandonParCascade`), reprise dont celle d'une sous-tâche sous une tâche terminée (DEC-032, `CNF-REPRENDRE-SOUS-TACHE`), actions, `ETA-SOUS-TACHE-*` | ST-US-025 §3 (#1 à 8) | UT-US-025-01 à 18 | US-025 : 18 scénarios. Différés : US-001 S06, S15 ; US-002 S15, S20c, S20d ; US-003 S07, S09, S12 ; US-024 (7) ; US-018 S02, S03 ; US-031 S02, S03 |
| 9, US-017 incr. 2 (11 j) | Valeurs écartées par contexte causal et pierre tombale étendue, RG-056 (« Modifications non retenues », « Compris »), réparation RG-048, incohérences RG-049 (`incoherence.ts`, `MEN-INCOHERENCE`) ; Dexie v3 (`valeursEcartees`, `lectures`) | ST-US-017 §3.2 (#22 à 26, 32) ; ST-US-024 §6.6 | **À écrire par Anthony (E10) avant l'E12 du rang** (ST-US-017 §13.2), plus UT-US-024-21 déjà présent | US-017 : S09, S10, S11, S12b, S14, S15, S15b, S16, S24, S25, S26 ; différés d'US-001, 002, 023, 024, 003, 025, 018 (S07, S08), 031 (S10, S11, S12) |
| 10, US-017 incr. 3 (6 j) | RG-044 : `controlerDrive` (ordre du DAT §4.2.2), manifeste, `generation`, `ERR-012`, « Restaurer » / « Repartir de zéro » / « Décider plus tard », `ALR-008`, `ALR-014`, doublons de dossier et de manifeste | ST-US-017 §3.2 (#27, 28) | **À écrire par Anthony avant l'E12** | US-017 : S18, S19, S20, S20b, S21, S22, S22b, S22c, S22d, S23, S32, S32b, S33 |
| 11, US-017 incr. 4 (6 j) | Correction d'horloge par l'en-tête `Date` (observateur de `ClientGoogle`, médiane de 5 mesures, seul un recul est corrigé), détection des sauts par l'horloge monotone, `ALR-001` ; ligne « Fuseau » de la feuille (RG-054) ; RG-058 (`verifierCompatibilite`, consultation seule, « Mettre à jour ») ; Dexie v4 (`registresInconnus`) | ST-US-017 §3.2 (#29 à 32), §6.8 | **À écrire par Anthony avant l'E12** | US-017 : S12c, S12d (après la correction É-1), S13a, S13b, S30, S30b, S31, puis S01 en dernier ; différés US-022 S24, S25 |
| 12, US-018 (6,5 j) | Service worker (vite-plugin-pwa, précache, `navigateFallback`, invite de mise à jour, enregistrement **après** la consommation du retour), `storage.persist()` et ligne `SYN-FEUILLE-STOCKAGE` / carte `ALR-015`, évaluation continue de RG-057 et masquage du rappel, chaîne `@ihm` (`composition/test-ihm.ts`, profil `ihm`, Playwright, pont du `FauxDrive`), `deploiement.yml` et environnements `recette` et `production`. Ni SQLite, ni Capacitor, ni APK. | ST-US-018 §3 (#1 à 12) | UT-US-018-01 à 05 **à écrire par Anthony avant l'E12** ; e2e Playwright (`location.hash` vide, hors ligne, axe) | US-018 : S17b, S18 et S19 (`@ihm`). Différés : US-031 S01a, S01b, S08, S14, S15, S17 (`@ihm`), S21b |
| 13, US-031 (3,5 j) | Onglet meneur et exclusion par cycle (`VerrouOngletsWeb`, `CoordinationOnglets`, `exclusionParVerrou`), `SYN-FEUILLE-AUTRE-ONGLET`, arrêt de la coordination sur l'avis de fin de session (avis livré au rang 1), steps `@ihm` | ST-US-031 §3 (#1 à 13) | UT-US-031-01 à 11 et CT-VER-01 à 05 **à écrire par Anthony avant l'E12** ; e2e `onglets.spec.ts` | US-031 : S16, S16b, S16c (`@ihm`) ; à la fin, tous les scénarios non `@recette` sont sélectionnés |

---

## 2. Prérequis d'outillage avant l'E12 du rang 0 (remarque A5 de Starck)

### 2.1 État constaté

| Élément | Constaté |
|---|---|
| Node | 22.22.0 (`/opt/node22`). Le dépôt exige `>=24 <25` (`engines`, `.nvmrc` = 24, `engine-strict=true`). `pnpm test`, `pnpm lint` et `pnpm types` refusent donc de démarrer. Le dernier Node 24 publié est la v24.22.1 (LTS « Krypton », 2026-10-20). |
| pnpm | 10.28.0, déjà figé dans `packageManager` (la dernière version publiée est la 12.15.0 : voir Q-BEN-LOT001-6). |
| Déjà installés (versions exactes) | `dexie` 4.4.6 (expose `chromeTransactionDurability` et `disableAutoOpen`), `zod`, `date-fns`, `@date-fns/tz`, `uuid`, `vite` 8.3.5, `vitest` 5.0.5, `@vitest/coverage-v8`, `fake-indexeddb`, `fast-check`, `eslint` 10.13, `typescript-eslint`, `@vitest/eslint-plugin`, `prettier`, `typescript` 5.9.3 |
| Absents | `@cucumber/cucumber`, `@cucumber/gherkin`, `tsx`, MSW, Playwright et axe, dependency-cruiser, React, Ionic, Zustand, `@vitejs/plugin-react`, `vite-plugin-pwa`, `@testing-library/react`, plugins ESLint React et a11y, license-checker, Husky, lint-staged |
| Fichiers de configuration présents | `.npmrc` (`save-exact`, `engine-strict`), `.nvmrc`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `vitest.config.ts`, `tsconfig.json`, `.gitignore` (clés, `.env*`, `dist`, `coverage`) |
| Fichiers de configuration absents | `.dependency-cruiser.cjs`, `cucumber.mjs`, `vite.config.ts`, `index.html`, `.env.example`, `.github/workflows/ci.yml`, `dependabot.yml`, `pull_request_template.md`, `scripts/`, `tests/support/rangs-scenarios.json` |
| CI | Seul `.github/workflows/poc.yml` (manuel). |
| Accès GitHub | Le jeton `GH_TOKEN` de cet environnement est invalide (`gh auth status`) : je ne peux ni pousser, ni ouvrir de PR, ni lire un run de CI (voir Q-BEN-LOT001-1). |

### 2.2 Ordre d'installation que je propose

Chaque ajout est en version exacte, justifié dans la PR (besoin, maintenance, licence, sécurité : RCD-16). Les numéros de version ci-dessous sont les dernières publiées au 2026-10-28 d'après le registre npm ; je les figerai à l'installation après contrôle des plages de compatibilité (pairs de `vite-plugin-pwa` avec Vite 8, plugins ESLint avec ESLint 10, Ionic avec React). Rien n'est installé à ce stade.

| Ordre | Étape | Détail | Vérification |
|---|---|---|---|
| 1 | **Node 24** | Télécharger la v24.22.1 depuis nodejs.org (archive Linux x64), vérifier la somme SHA-256 de `SHASUMS256.txt`, extraire dans un dossier utilisateur, placer son `bin` en tête du `PATH`. Pas de gestionnaire de versions pour l'instant : l'archive suffit et reste reproductible. En CI, `actions/setup-node` avec `node-version-file: .nvmrc`. | `node -v` donne 24.x ; `pnpm -v` donne 10.28.0 (voir Q-BEN-LOT001-6) |
| 2 | **Base de référence** | `pnpm install --frozen-lockfile` ; `pnpm types`, `pnpm lint`, `pnpm format:verifier` (au vert) ; `pnpm test` (424 rouges). Comparer avec la mesure faite sous Node 22 : même résultat attendu. | Aucune dérive du lockfile |
| 3 | **Tests d'acceptation** | `@cucumber/cucumber` (13.3.0), `@cucumber/gherkin` (42.0.1, pour `selection-scenarios.mjs`), `tsx` (4.23.15, chargement des steps TypeScript) | `cucumber-js --dry-run` sur les dix `.feature` |
| 4 | **Règles de couches** | `dependency-cruiser` (18.7.0) et `.dependency-cruiser.cjs` : couches de `conventions.md` §2.2, imports entre contextes par `index.ts` seulement, aucun import de `src/` vers `tests/`, aucun cycle, aucun orphelin (voir Q-BEN-LOT001-3) | `pnpm architecture` |
| 5 | **Doublures HTTP et bout en bout** | `msw` (3.0.3, contrat `TransportSynchroDrive` et `ClientGoogle`, premier usage au rang 1 puis au rang 3), `@playwright/test` (1.64.1) et `@axe-core/playwright` (4.14.0). Seuls les paquets sont figés au rang 0 : le téléchargement des navigateurs et le job `ihm` arrivent au rang 12. | Paquets présents dans le lockfile |
| 6 | **Interface et PWA** | `react` et `react-dom` (19.3.1), `@types/react`, `@types/react-dom`, `@ionic/react` (9.0.9), `zustand` (5.0.16), `@vitejs/plugin-react`, `vite-plugin-pwa` (2.0.0, avec ses pairs `workbox-build` et `workbox-window`), puis `vite.config.ts`, `index.html` (CSP, `no-referrer`), `main.tsx`. Ajout de l'option JSX dans `tsconfig.json`. Aucun `@capacitor/*`, aucun SQLite (interdits en cible, `conventions.md` §14.2). | `vite build` produit un `dist/` ; aucune requête externe |
| 7 | **Tests de composants et lint de l'interface** | `@testing-library/react` (16.3.3), environnement DOM (choix : Q-BEN-LOT001-7), `eslint-plugin-react-hooks` (7.1.1), `eslint-plugin-jsx-a11y` (6.10.2). Extension de `eslint.config.js` : blocs `files` des adaptateurs autorisés (`HorlogeSysteme`, `PlanificateurNavigateur`, `SourceAleatoireCrypto`, `GenerateurUuidV7`, `JournalTechniqueLocal`, `EtatReseauNavigateur`), importations restreintes (`date-fns`, `dexie`, `zod`, `react`, `@ionic/*`, `zustand`, `@capacitor/*`, bibliothèques de test hors `tests/`), règles de `location` et `window.google`. | `pnpm lint` au vert sur le code actuel et sur le mien |
| 8 | **Contrôles de CI et hygiène** | `license-checker` (25.0.1), `husky` (9.1.7) et `lint-staged` (17.6.0) : hooks recommandés, non substituables à la CI. Stryker : voir Q-BEN-LOT001-4. Outils hors npm (Semgrep, gitleaks, osv-scanner) : versions épinglées dans le workflow, pas dans `package.json`. | `pnpm verifier:depot` |
| 9 | **Scripts** | `scripts/verifier-catalogue.ts`, `verifier-tags.ts`, `verifier-rangs.ts`, `verifier-depot.ts`, `selection-scenarios.mjs`, `verifier-etapes-inutilisees.mjs`, `cucumber.mjs` (profils `default`, `rapide`, `ihm`, `google-reel`) ; `rangs-scenarios.json` généré une fois depuis la table de `LOT-001.md` puis contrôlé : 282 clés, décomptes par US 23 / 22 / 28 / 25 / 22 / 23 / 33 / 46 / 30 / 30, `@recette` à part. Scripts `package.json` : `architecture`, `cucumber`, `cucumber:ihm`, `cucumber:steps-inutilises`, `verifier:*`, `build`, `e2e`. | Les scripts échouent sur des cas fabriqués (scénario sans rang, clé orpheline) |
| 10 | **CI de l'application** | `.github/workflows/ci.yml` : déclenchement sur `us/**`, `ano/**`, `lot/**`, `main` et PR ; `permissions: contents: read` ; jobs `qualite` (formatage, lint, types, architecture, catalogue, tags, rangs, dépôt), `tests` (matrice `TZ=UTC`, `TZ=Pacific/Auckland`, `TZ=America/New_York` : Vitest et Cucumber ; couverture dans le job UTC), `securite` (gitleaks, osv-scanner, licences, Semgrep), `build` (PWA avec `VITE_BASE_PATH` de production). Actions GitHub épinglées par somme SHA. Puis `dependabot.yml` (npm et actions, hebdomadaire, regroupé), `pull_request_template.md` (DoD du §15), `.env.example`, `.gitignore` complété. Le job `ihm` et `deploiement.yml` viennent au rang 12. | Premier passage vert sur GitHub (je ne peux pas le déclencher moi-même : Q-BEN-LOT001-1) ; puis demande de protection de `main` à Jarvis, avec les noms exacts des jobs requis |

Les étapes 1 à 5 sont nécessaires avant le premier test que je fais passer. Les étapes 6 à 10 sont faites en parallèle du code du rang 0, mais avant l'E13 du rang 0 (condition A5).

---

## 3. Questions à Anthony

Format : référence, constat, proposition, caractère bloquant. Aucune question ne porte sur une règle métier ou sur l'architecture ; toutes portent sur une incohérence ou un vide de la conception.

### Q-BEN-LOT001-1 — Branches Git, livraison et accès au dépôt
- **Référence** : `conventions.md` §13.1 (branches `lot/…` et `us/…` créées en E10, protection de `main` à la fusion du rang 0) ; en-tête de `ST-socle-ecriture.md` (« `us/SOCLE-ecriture` créée depuis `lot/LOT-001-socle-objectifs-taches` ») et de `ST-US-022.md` (`us/SOCLE-complement`, puis `us/US-022-connexion`).
- **Constat** : `git branch -a` ne montre que `main` (local et `origin/main`) ; tous les commits d'E10 et d'E11 sont sur `main`. Aucune branche de lot ni d'US n'existe. Le rang 0 a deux branches nommées (écriture, complément) ; l'accès GitHub de cet environnement est invalide, donc je ne peux ni pousser ni ouvrir de PR.
- **Proposition** : Jarvis ou toi crée `lot/LOT-001-socle-objectifs-taches` à partir de `b542d4e` (ou du dernier commit de `main`), puis `us/SOCLE-ecriture` ; pour le rang 0, une seule PR de deux branches successives ou une seule branche `us/SOCLE-ecriture` qui porte aussi le complément ? Je propose **une seule branche et une seule PR pour le rang 0** (l'outillage et la CI doivent précéder le reste), au nom `us/SOCLE-ecriture`, et je ne crée pas `us/SOCLE-complement`. Qui pousse mes commits et ouvre les PR (Jarvis), et comment me communique-t-il le résultat de la CI ?
- **Bloque** : l'E12 du rang 0 pour le premier commit (pas pour la lecture ni la mise en place locale de l'environnement).

### Q-BEN-LOT001-2 — Périmètre des tests « de l'évolution » et CI verte à chaque rang
- **Référence** : `conventions.md` §14.1 (`pnpm test` bloquant), §13.1 (« la branche de lot et `main` restent vertes »), §15 (« la suite complète est verte ») ; `ST-socle-ecriture.md` §13, dernière ligne (« Commande : `pnpm test -- tests/unitaires/commun tests/unitaires/synchronisation tests/integration/synchronisation tests/contrats/depot-local.contrat.ts` ») ; `ST-US-017.md` §13.1 (CT-DEPOT-08 à 11).
- **Constat** : les 424 tests de tous les rangs sont déjà dans l'arbre et rouges. Deux difficultés :
  1. La commande du socle inclut tous les fichiers de `tests/unitaires/synchronisation` : `cycle-synchronisation`, `fusion`, `depot`, `format-v1`, `mention-attente`, `bandeau`, etc., qui sont aux rangs 1 et 3.
  2. Des fichiers mélangent plusieurs rangs : `depot-local.contrat.ts` (CT-DEPOT-01 à 07 au rang 0, 08 à 11 au rang 3, et la même suite exécutée sur `DepotLocalEnMemoire`, rang 3) ; `domaine/actions.test.ts`, `alertes-delai.test.ts`, `decisions/creer-objectif.test.ts`, `presentation/liste-objectifs.test.ts`, `messages-de-refus.test.ts`, etc. (US-001 avec US-023, 024, 025). Il sera donc impossible d'avoir un fichier entièrement vert à chaque rang.
  Or `it.skip` et `it.todo` sont interdits (§11.5).
- **Proposition** : même mécanisme que pour Cucumber (§11.13). Un fichier `tests/support/rangs-tests.json` associe chaque identifiant (`UT-…`, `CT-…`) à un rang ; un script `scripts/selection-tests.mjs` construit le motif `--testNamePattern` pour `rangCourant` ; `verifier-rangs.ts` exige qu'aucun test n'ait pas de rang. Tu es le seul à pouvoir fixer ces rangs (le tableau « Tests » de chaque ST le permet presque). Périmètre que je comprends pour le rang 0 : UT-SOC-01 à 46 ; CT-DEPOT-01 à 07 sur `DepotLocalDexie` seulement ; UT-US-022-48 ; UT-US-022-49 (voir Q-BEN-LOT001-5).
- **Bloque** : pas le démarrage de l'E12 du rang 0 (je commence par les tests UT-SOC, dont la liste est sans ambiguïté), mais la sortie du rang 0 (job `tests` bloquant de la CI, DoD §15). À trancher avant la fin du rang 0.

### Q-BEN-LOT001-3 — Squelettes des rangs suivants : `@non-implemente`, modules orphelins, couverture
- **Référence** : `ST-socle-ecriture.md` §13, « Précisions de l'E10 » (« plus aucun import de cet alias dans `src/` à la revue E13 du rang ») ; `conventions.md` §14.2 (dependency-cruiser : « aucun module orphelin dans `src/` ») et §12 (seuils par motif de chemin, global 85 % / 75 %) ; `vitest.config.ts` (`coverage.include: src/**/*.ts`).
- **Constat** : au rang 0, 117 fichiers de `src/` importent encore `@non-implemente` (rangs 1 à 13, et même des méthodes de rang 1 et 3 dans `DepotLocalDexie`). Ils ne sont importés par rien d'autre (orphelins), et ils feraient échouer les seuils de couverture globaux. Pris à la lettre, la règle « plus aucun import » rendrait le rang 0 impossible à approuver.
- **Proposition** : (a) le contrôle « plus d'import de `@non-implemente` » porte sur les fichiers du rang livré, la liste étant déduite de la colonne « Fichiers » des ST ; (b) dependency-cruiser exempte les orphelins listés temporairement, la liste diminuant à chaque rang ; (c) la couverture est mesurée sur les fichiers déjà livrés (liste d'inclusion qui s'enrichit par rang). Je mets en place ces trois mécanismes dans le script de contrôle si tu les valides.
- **Bloque** : pas le démarrage ; bloque l'E13 du rang 0.

### Q-BEN-LOT001-4 — Portée de la CI au rang 0
- **Référence** : `lancement-LOT-001-starck.md` RL-LOT-001-A5 (jobs : lint, types, Vitest, `cucumber-js --strict` par rang, dependency-cruiser, gitleaks, osv-scanner) ; `ST-US-022.md` §3.1 (condition de l'E13 du rang 0, même liste) ; `conventions.md` §14.1 et §14.3 (formatage, catalogue, tags, rangs, dépôt, trois fuseaux, couverture, Semgrep, license-checker, build PWA, `ihm` et e2e, Stryker et `hebdomadaire.yml`).
- **Constat** : la liste de Starck est plus courte que celle de `conventions.md`. Par ailleurs, `verifier:catalogue` n'a rien à vérifier avant le rang 2 (le catalogue `catalogue.fr.ts` est écrit à ce rang), et le job `ihm` suppose Playwright, `test-ihm.ts` et un `FauxDrive` à pont (rang 12). Enfin, `deploiement.yml` est au rang 12 dans `LOT-001.md` et `ST-US-018.md` mais au rang 13 dans `conventions.md` §14.3 (« Ordre de mise en place »).
- **Proposition** : au rang 0, les jobs de `conventions.md` §14.1 **sauf** `ihm` / e2e et `deploiement.yml` (rang 12), avec Semgrep et licences inclus ; `verifier:catalogue` livré mais sans objet jusqu'au rang 2 (il réussit sur un catalogue vide, avec un test qui prouve qu'il échoue sur un code manquant) ; Stryker et `hebdomadaire.yml` repoussés à la fin du lot (indicateur non bloquant) pour ne pas installer d'outil inutilisé. Le nom exact des jobs requis est communiqué à Jarvis pour DEC-029.
- **Bloque** : l'écriture de `ci.yml`, donc la fin du rang 0, pas son démarrage.

### Q-BEN-LOT001-5 — Frontière entre le rang 0 et le rang 1
- **Référence** : `LOT-001.md`, ligne du rang 0 (« base IndexedDB technique, banc ») ; `ST-US-022.md` §3.1 (liste du rang 0 sans base technique) et §3.2 n° 28 (`base-technique.ts`, rang 1) ; §3.1, dernier alinéa (« UT-US-022-48 … et UT-US-022-49 (délais de reprise) ») et §3.2 n° 38 (`reprise.ts`, rang 1) ; `ST-socle-ecriture.md` §3 n° 30 (`composition/web.ts` « assemble … `DepotLocalDexie` … le nom de base vient de ST-US-022 ») et `ST-US-022.md` §3.1 S10 (même fichier, rang 0).
- **Constat** : trois recoupements.
  1. La base technique est au rang 0 dans `LOT-001.md`, au rang 1 dans la ST.
  2. UT-US-022-49 teste `delaiAvantTentative` de `infrastructure-google/reprise.ts`, fichier du rang 1 : le test est annoncé au rang 0.
  3. `composition/web.ts` est « créé » aux deux endroits, mais il n'y a pas de nom de base ni de compte avant le rang 1.
- **Proposition** : base technique au rang 1 (la ST fait foi). `reprise.ts` : au rang 0, les constantes et `delaiAvantTentative` (UT-US-022-49) ; `executerAvecReprise` au rang 1. `web.ts` au rang 0 : une fonction d'assemblage du socle paramétrée par `nomBase`, non branchée sur `main.tsx`, exclue de la couverture comme le prévoit le §12.
- **Bloque** : non (je pars de ces propositions si je n'ai pas de réponse).

### Q-BEN-LOT001-6 — Version de pnpm
- **Référence** : `conventions.md` §3.1 (« dernière version stable au démarrage d'E12 de LOT-001, figée dans `packageManager` ») ; `package.json` (`pnpm@10.28.0`).
- **Constat** : la dernière version publiée de pnpm est la 12.15.0 ; le dépôt est déjà figé en 10.28.0 avec son `pnpm-lock.yaml`.
- **Proposition** : conserver 10.28.0 (lockfile existant, aucune dérive) ; une montée majeure passe par une PR de Dependabot, selon §3.2.
- **Bloque** : non.

### Q-BEN-LOT001-7 — Environnement DOM des tests de composants
- **Référence** : `conventions.md` §3.1 (`@testing-library/react`) et §11.12 ; `vitest.config.ts` (`environment: 'node'`).
- **Constat** : aucun environnement DOM (jsdom ou happy-dom) n'est choisi dans les conventions, alors que les tests de composants commencent au rang 1 (ECR-010, section « Compte »).
- **Proposition** : `jsdom` (30.1.3), activé seulement pour `tests/unitaires/**/presentation/ui/**` par un projet Vitest dédié, les autres tests restant en `node` ; `@testing-library/user-event` en plus de `@testing-library/react`.
- **Bloque** : non pour le rang 0 ; à confirmer avant l'E12 du rang 1.

### Q-BEN-LOT001-8 — Suite de contrat `FournisseurAuth`
- **Référence** : `ST-US-022.md` §14, ligne « Contrat » (« Suite `tests/contrats/fournisseur-auth.contrat.ts` (écrite par Anthony au rang 1, E12 avant la revue) »).
- **Constat** : la suite n'existe pas dans `tests/contrats/`. La formulation « écrite par Anthony … E12 avant la revue » laisse ouvert qui l'écrit et quand. Une suite de contrat est un test d'Anthony (`conventions.md` §11.3) : je ne l'écris pas de ma propre initiative.
- **Proposition** : tu la livres avant l'E12 du rang 1 ; je réalise `FauxFournisseurAuth` et `FournisseurAuthWeb` pour la satisfaire.
- **Bloque** : non pour le rang 0 ; **oui** pour l'E12 du rang 1 (adaptateur `FournisseurAuthWeb`).

### Q-BEN-LOT001-9 — Incohérences de documentation à aligner
Constats sans effet sur le rang 0, que je signale pour qu'elles ne deviennent pas des ambiguïtés plus tard. Je suis les ST de rang concerné en attendant.
1. **Versions de la base Dexie.** `ST-socle-ecriture.md` §5.2 (dernière phrase) : « L'incrément 2 d'US-017 ajoutera la version 2 de la base (tables `valeursEcartees` et `lectures`) ». `ST-US-017.md` §5.1 : version 2 à l'incrément 1 (sans table), version 3 à l'incrément 2, version 4 à l'incrément 4 ; mais son §3.2 n° 32 parle de « version 3 : … `registresInconnus` (incr. 4) ». Je suivrai le §5.1 de ST-US-017.
2. **Doublure du dépôt.** `conventions.md` §11.10 : « `DepotLocal` n'a **pas** de doublure en mémoire ». `ST-US-017.md` §3.1 n° 21 b et le fichier `tests/doublures/depot-local-memoire.ts` (condition de Starck, Q-ST017-STA-1) en prévoient une. Je suivrai la ST (rang 3).
3. **Ordre de mise en place du déploiement.** `conventions.md` §14.3 (`deploiement.yml` et service worker au rang 13) contre `LOT-001.md` et `ST-US-018.md` (rang 12). Je suivrai le rang 12 (voir aussi Q-BEN-LOT001-4).
- **Bloque** : non.

### Q-BEN-LOT001-10 — Valeurs de configuration OAuth et d'environnement
- **Référence** : `ST-US-022.md` §3.1 S8 (`.env.example`) et §3.2 n° 31 (`VITE_ENV`, `VITE_GOOGLE_WEB_CLIENT_ID`, `VITE_BASE_PATH`, `VITE_APP_ORIGIN`) ; `conventions.md` §9.1 et §14.3 (origine de recette en attente de Q-ANT26).
- **Constat** : je pose `.env.example` avec des valeurs fictives. Pour essayer une vraie connexion à la main (rang 1) puis déployer (rang 12), il me faudra l'identifiant du client OAuth Web de `objectifs-taches-dev` (une valeur publique, jamais committée en dehors des variables du dépôt GitHub) et l'origine de développement. Les tests automatisés, eux, n'en ont pas besoin (doublures).
- **Proposition** : Jarvis ou le commanditaire me transmet ces valeurs hors dépôt (fichier `.env.local`, ignoré par Git) avant la fin de l'E12 du rang 1 ; l'origine de recette attend la réponse à Q-ANT26 (rang 12).
- **Bloque** : non pour l'E12 du rang 1 (tests automatisés) ; oui pour toute vérification manuelle de la connexion réelle.

---

## 4. Synthèse

- **Compris et sans ambiguïté** : le contenu des rangs 0 et 1, leur ordre interne, les tests qui les définissent, les scénarios exécutés (aucun au rang 0, dix au rang 1) et les règles de rattachement des scénarios différés.
- **Questions** : 10, dont **une seule bloque le démarrage de l'E12 du rang 0** (Q-BEN-LOT001-1, branches et accès). Les questions 2, 3 et 4 doivent avoir une réponse avant la clôture du rang 0 (CI verte, protection de `main`) ; la question 8 avant l'E12 du rang 1 ; les questions 5, 6, 7, 9 et 10 ont une proposition par défaut que j'applique sans réponse.
- **Dette que je signale d'emblée** : DT-001 (données locales non chiffrées) s'applique à `DepotLocalDexie` et à la base technique ; DT-002 (archivage des fichiers d'appareil inactifs) ne me concerne pas au lot 1. Je ne vois pas d'autre dette à inscrire avant le début du développement.

---

## Réponse de Jarvis à Q-BEN-LOT001-1 (2026-10-28)
- **Branches** (conventions §13.1) : `lot/LOT-001` part de `main`, puis `us/SOCLE-ecriture` part de `lot/LOT-001` pour tout le rang 0, comme Benjamin le propose. Ensuite, une branche `us/US-xxx-<slug>` par US, ou `us/US-017-<n>-<slug>` par incrément. Benjamin crée les branches et commite **en local**.
- **Poussée** : Jarvis pousse les branches, comme il le fait déjà pour `main`. Benjamin ne pousse pas.
- **Pull requests** : Jarvis les ouvre au moment de l'E13 par l'API REST de GitHub. L'API GraphQL n'est pas accessible depuis la session.
  - La lecture de l'état de la CI passe par `GET /repos/{owner}/{repo}/commits/{sha}/check-runs`. Cette route a été vérifiée le 2026-10-28 : elle fonctionne.
  - Si la création d'une PR échoue depuis la session, Jarvis demande au commanditaire de l'ouvrir depuis l'interface GitHub, avec un lien direct.
- **Constat transmis à Anthony avec Q-BEN-LOT001-2** : les tests rouges de l'E10 ont été commités sur `main`. Cela déroge au §13.1 (« la branche de lot et `main` restent vertes »).
