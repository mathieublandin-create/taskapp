# ST-US-022 — Se connecter avec mon compte Google (et socle complémentaire, rang 0)

## Sommaire

- [0. En-tête](#0-en-tête) (l. 52)
  - [Historique](#historique) (l. 71)
- [1. Résumé technique](#1-résumé-technique) (l. 78)
- [2. Traçabilité](#2-traçabilité) (l. 85)
  - [2.1 Critères d'acceptation → scénarios → tests](#21-critères-dacceptation--scénarios--tests) (l. 87)
  - [2.2 Règles de gestion → implémentation](#22-règles-de-gestion--implémentation) (l. 103)
- [3. Composants et fichiers](#3-composants-et-fichiers) (l. 115)
  - [3.1 Socle complémentaire (rang 0)](#31-socle-complémentaire-rang-0) (l. 117)
  - [3.2 US-022 (rang 1)](#32-us-022-rang-1) (l. 136)
- [4. Interfaces et signatures](#4-interfaces-et-signatures) (l. 202)
  - [4.1 Domaine](#41-domaine) (l. 204)
  - [4.2 Application](#42-application) (l. 255)
  - [4.3 Ports (nouveaux)](#43-ports-nouveaux) (l. 293)
  - [4.4 Adaptateurs](#44-adaptateurs) (l. 452)
  - [4.5 Présentation](#45-présentation) (l. 469)
- [5. Modèle de données et migrations](#5-modèle-de-données-et-migrations) (l. 530)
  - [5.1 Base technique donejuan-<VITE_ENV>-technique (Dexie, version 1, durabilité stricte)](#51-base-technique-donejuan-vite_env-technique-dexie-version-1-durabilité-stricte) (l. 532)
  - [5.2 Espaces par compte](#52-espaces-par-compte) (l. 543)
  - [5.3 Drive (rang 1)](#53-drive-rang-1) (l. 550)
  - [5.4 Migrations](#54-migrations) (l. 553)
- [6. Règles et algorithmes](#6-règles-et-algorithmes) (l. 556)
  - [6.1 deciderOuverture (DAT §4.1.7, RED-08)](#61-deciderouverture-dat-417-red-08) (l. 558)
  - [6.2 OuvrirApplication.executer(retour)](#62-ouvrirapplicationexecuterretour) (l. 567)
  - [6.3 accesApresRetour (DAT §4.1.6 bis, ADR-013, EC-7)](#63-accesapresretour-dat-416-bis-adr-013-ec-7) (l. 593)
  - [6.4 FournisseurAuthWeb.demanderJeton (ADR-013 ; étape 16 refaite)](#64-fournisseurauthwebdemanderjeton-adr-013--étape-16-refaite) (l. 605)
  - [6.5 SeDeconnecter](#65-sedeconnecter) (l. 628)
  - [6.6 SupprimerDonneesAppareil](#66-supprimerdonneesappareil) (l. 638)
  - [6.7 SeConnecter](#67-seconnecter) (l. 654)
  - [6.8 ClientGoogle.traduireReponse et reprise (DAT §4.4.5)](#68-clientgoogletraduirereponse-et-reprise-dat-445) (l. 667)
  - [6.9 Indicateur et bandeaux (guide §6.6.2, §6.6.3 ; conventions §8.5)](#69-indicateur-et-bandeaux-guide-662-663--conventions-85) (l. 681)
  - [6.10 ReprendreSession.executer(reprise) (DAT §4.1.6 bis, v0.11.3 §4.1.7)](#610-reprendresessionexecuterreprise-dat-416-bis-v0113-417) (l. 690)
  - [6.11 GestionEspacesIndexedDb.supprimer (DAT v0.11.4 §4.1.6, RL-LOT-001-A1)](#611-gestionespacesindexeddbsupprimer-dat-v0114-416-rl-lot-001-a1) (l. 707)
- [7. Intégration Google](#7-intégration-google) (l. 716)
- [8. Gestion des erreurs](#8-gestion-des-erreurs) (l. 727)
- [9. Patterns imposés](#9-patterns-imposés) (l. 750)
- [10. Sécurité et données personnelles](#10-sécurité-et-données-personnelles) (l. 761)
- [11. Exigences non fonctionnelles](#11-exigences-non-fonctionnelles) (l. 768)
- [12. Step definitions Cucumber](#12-step-definitions-cucumber) (l. 775)
  - [12.1 Phrases (rang 1, sauf mention)](#121-phrases-rang-1-sauf-mention) (l. 777)
  - [12.2 Scénarios par rang (liste nominative, à reporter dans rangs-scenarios.json)](#122-scénarios-par-rang-liste-nominative-à-reporter-dans-rangs-scenariosjson) (l. 827)
  - [12.3 Banc, monde et doublures](#123-banc-monde-et-doublures) (l. 835)
- [13. Tests unitaires fournis (E10)](#13-tests-unitaires-fournis-e10) (l. 846)
- [14. Tests attendus de Benjamin](#14-tests-attendus-de-benjamin) (l. 931)
- [15. Plan de réalisation](#15-plan-de-réalisation) (l. 942)
- [16. Dette, hypothèses et points ouverts](#16-dette-hypothèses-et-points-ouverts) (l. 950)
- [17. Checklist de complétude (avant E11)](#17-checklist-de-complétude-avant-e11) (l. 977)

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-022](../01-specification-fonctionnelle/user-stories/US-022-se-connecter-avec-mon-compte-google.md), statut « Prête » (DEC-018 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **0** (socle complémentaire, §3.1) et **1** (US-022) / 13 |
| Fichier `.feature` | [`tests/features/US-022-se-connecter-avec-mon-compte-google.feature`](../../tests/features/US-022-se-connecter-avec-mon-compte-google.feature), 33 scénarios (dont S13b `@recette`) |
| RG couvertes | RG-017 (accès à renouveler), RG-018, RG-019, RG-020, RG-035, RG-043, RG-055, RG-058 (actions de compte en consultation seule, avec ST-US-017 incrément 4) |
| ENF concernées | ENF-05, ENF-06, ENF-08 ; ENF-T-01 |
| DAT / ADR de référence | DAT v0.11.3 (§4.1.1 à §4.1.7, §4.2.2 d, §7.1, §7.4 bis) ; ADR-004, ADR-005, ADR-010, ADR-013 |
| Résultats du test technique | `03-architecture/resultats-test-technique.md` : R11 favorable (en production) ; M-RED 12/12 ; M-PERSIST et M-DUR favorables ; **étape 16 refaite (information de Jarvis, 2026-10-27)** : avec `login_hint` transmis à GIS, le renouvellement par geste ne demande plus de choisir le compte |
| Maquettes | ECR-010 (connexion, premier lancement, cadre « Attente »), ECR-011 section « Compte » ; guide d'ergonomie v0.2.13 §6.6 |
| Q-US traitées | Q-US-022-1 à Q-US-022-4 (E8) ; Q-US-031-1 (DAT §4.1.6 bis) ; Q-DEC034-1 (Starck) |
| Questions de cette ST | Toutes répondues et intégrées : Q-ST022-STA-1 à 4, Q-ST022-STE-1 à 4 ; Q-RL-P1 tranchée par le commanditaire (**DEC-038** : écran d'attente `SYN-REDIRECTION` à chaque ouverture avec réseau, aucun jeton conservé) |
| Version de la ST | 0.3 |
| Statut | **E11 : remarques traitées** (v0.3 ; RL-LOT-001-A1 en attente de levée par Starck) ; tests du §13 livrés en rouge |
| Auteur | Anthony |
| Branches Git | `us/SOCLE-complement` (rang 0) puis `us/US-022-connexion` (rang 1), depuis `lot/LOT-001-socle-objectifs-taches` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après R11 et M-RED). Stratégies d'authentification arrêtées d'après l'étape 16 refaite : geste par GIS avec `login_hint`, redirection `prompt=none` à l'ouverture et en repli d'une erreur technique de GIS. E10 du rang 1 livrée. |
| 0.2 | 2026-10-27 | Anthony | Réponses de Starck (DAT v0.11.3) et de Steeve (guide v0.2.13). **Q-ST022-STA-1** : écriture du départ confirmée avant la navigation, reprise sans contenu métier (`ROUTE_REPRISE`), garde de saisie (`GardeSaisie`, `redirectionPermise`) (§4.3, §5.1, §6.4, §6.10). **Q-ST022-STA-2** : repli de GIS par **redirection interactive** (`prompt` absent), une seule par geste ; web-ios : redirection interactive d'emblée (`strategie-geste.ts`, §6.4). **Q-ST022-STA-3** : l'`appareilId` naît avec l'espace du compte (`DepotLocalDexie.ouvrirEspace`) ; `RegistreAppareil` supprimé ; table `appareil` remplacée par `installation` (§5.1, §5.2, §6.6). **Q-ST022-STE-3** : `SYN-SESSION` jamais hors ligne (§6.9). E10 complétée : UT-US-022-43 (repli interactif), 44, 45, 47 (hors ligne), 51 à 55. |
| 0.3 | 2026-10-28 | Anthony | E11 (revue de lancement). **RL-LOT-001-A1** : `versionchange` traité sans réouverture (`surFermetureImposee`, `DepotLocalDexie.fermer`) ; ordre « effacer la session → prévenir les autres onglets → supprimer » ; suppression bloquée au-delà de 5 s → `ERR-017` (`SUPPRESSION_BLOQUEE`, `reessayer`, `fermerApresBlocage`) ; port `AvisOnglets` avancé au rang 1 ; `GestionEspacesIndexedDb` (§4.3, §5.2, §6.5, §6.6, §6.11). **RL-S6** : écran d'attente limité à 10 s (`abandonnerAttenteGoogle`, §6.2) ; toast `TST-SAISIE-A-TERMINER` (`construireRetourReprise`). **RL-S5** : `construireRacine` testé. **RL-A2** : fichiers d'appareil à la racine du dossier. **RL-A9** : archivage retiré (DT-002). **Q-ST022-STA-4** : a) confirmé. **DEC-038** : conception confirmée. Tests : UT-US-022-35 (`redirectionPermise`), 54 (toast), 56 à 61 ajoutés. |

## 1. Résumé technique

- **Ce que l'US change.** Création du contexte `compte` : identité (`sub`), portées, état de l'accès Google (valide, à renouveler, perdu), décision d'ouverture (DAT §4.1.7), motifs `ERR-001` à `ERR-006`, cas d'usage `OuvrirApplication`, `SeConnecter`, `ReprendreSession`, `SeDeconnecter`, `SupprimerDonneesAppareil`, `SignalerRefusJeton`. Adaptateur **`FournisseurAuthWeb` unique** (ADR-013) : redirection pleine page `prompt=none` à l'ouverture, Google Identity Services (GIS, modèle « jeton ») avec `login_hint` pour la première connexion et pour le geste, **redirection interactive** (`prompt` absent, `login_hint` présent) en repli d'une erreur technique de GIS, une seule par geste, et d'emblée sur web-ios (DAT v0.11.3 §4.1.7). Consommation du retour de redirection par la première instruction de `main.tsx` (RED-01 à RED-08). Base IndexedDB **technique**, hors espace de compte (installation, session mémorisée, départ de redirection). Espaces de stockage par compte (DEC-016), chacun avec son `appareilId` (DAT v0.11.3 §4.1.4). Préparation du dossier « Done Juan » dans le Drive. Modèles de vue partagés de l'indicateur de synchronisation et des bandeaux (sélection unique, `conventions.md` §8.5), utilisés dès ce rang.
- **Socle complémentaire (rang 0)** : outillage, CI, ports transverses et leurs doublures, banc à deux appareils (§3.1).
- **Hors périmètre** : transport Drive complet, fusion, cycle de synchronisation, décompte affiché (ST-US-017 incrément 1, rang 3) ; valeurs écartées (incrément 2) ; RG-044 (incrément 3) ; consultation seule et correction d'horloge (incrément 4) ; service worker, `storage.persist()`, RG-057 évalué en continu (ST-US-018, rang 12) ; verrou entre onglets (ST-US-031, rang 13) ; première connexion par redirection (iPhone, EPI-001 : hors v1).
- **Prérequis** : `ST-socle-ecriture.md` (rang 0, écriture).

## 2. Traçabilité

### 2.1 Critères d'acceptation → scénarios → tests

| CA | Scénarios | RG | Tests unitaires (§13) | Composants | Rang d'exécution |
|---|---|---|---|---|---|
| CA-1 accès réservé | S01, S02 | RG-019, RG-043 | UT-US-022-08, 09, 40, 41 | `deciderOuverture`, `construireRacine` | S01 : 1 ; S02 : 2 |
| CA-2 données du Drive, état vide | S03, S04 | RG-020 | (ST-US-017) | `SeConnecter`, cycle (rang 3), `EVD-BIENVENUE` (ST-US-002) | S03 : 3 ; S04 : 5 |
| CA-3 dossier visible | S05 | RG-020 | UT-US-022-27 | `PreparationDossierDrive`, `TransportSynchro.preparerDossier` | 1 |
| CA-4 annulation, refus | S06 | RG-019 | UT-US-022-05, 06, 21, 22 | `SeConnecter`, `motifEchecConnexion` | 1 |
| CA-5 réouverture sans reconnexion | S07, S23, S23b | RG-017, RG-019 | UT-US-022-08 à 13, 18, 19, 33 à 36 | `OuvrirApplication`, `FournisseurAuthWeb` | S07, S23 : 2 ; S23b : 3 |
| CA-6 déconnexion | S08, S09a à S09d, S10, S25 | RG-043 | UT-US-022-28 à 30, 42 | `SeDeconnecter` | S09b : 1 ; S09a, S10 : 2 ; S08, S09c, S09d : 3 ; S25 : 11 |
| CA-7 accès retiré ou expiré | S11, S12 | RG-035 | UT-US-022-14 à 17, 25, 26, 44 à 47 | `accesApresRetour`, `qualifierRefusJeton`, `SignalerRefusJeton`, `construireBandeau` | 3 |
| CA-8 autorisations | S13a, S13b | ENF-05, ENF-08 | UT-US-022-01 à 03 | `PORTEES_LOT_1` | S13a : 1 ; S13b : recette (E14) |
| CA-9 autre compte | S14 | RG-018, RG-043 | UT-US-022-37 | `GestionEspacesIndexedDb`, `nomEspace` | 3 |
| CA-10 supprimer les données | S10, S15 à S19, S24 | RG-055 | UT-US-022-31, 32 | `SupprimerDonneesAppareil` | S16, S17a, S17b, S19 : 2 ; S15, S18 : 3 ; S24 : 11 |
| Cas limites de connexion | S20a, S20b, S20c, S21, S22 | RG-019 | UT-US-022-04 à 07, 23, 24 | `SeConnecter`, `motifEchecConnexion` | 1 |

### 2.2 Règles de gestion → implémentation

| RG | Énoncé résumé | Élément | Tests |
|---|---|---|---|
| RG-017 | Accès à renouveler : sans écran de connexion, au plus un geste | `deciderOuverture`, `accesApresRetour`, `ReprendreSession` | UT-US-022-08 à 17, 25, 26 |
| RG-018 | Un compte, des données non partagées | `nomEspace` (empreinte du `sub`), `GestionEspaces` | UT-US-022-37 |
| RG-019 | Connexion obligatoire | `deciderOuverture` (pas de session → écran de connexion), `construireRacine` | UT-US-022-08, 40 |
| RG-020 | Dossier visible « Done Juan » | `PreparationDossierDrive` | UT-US-022-27 |
| RG-035 | Accès perdu : comme hors ligne, aucune perte | `qualifierRefusJeton`, `accesApresRetour`, `construireBandeau` | UT-US-022-14 à 17, 44 |
| RG-043 | Déconnexion sans effacement | `SeDeconnecter` | UT-US-022-28 à 30 |
| RG-055 | Supprimer les données de l'appareil | `SupprimerDonneesAppareil` | UT-US-022-31, 32 |

## 3. Composants et fichiers

### 3.1 Socle complémentaire (rang 0)

| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| S1 | `src/commun/application/ports/planificateur.ts` | Application | Créer | Port `Planificateur` (§4.3) |
| S2 | `src/commun/application/ports/etat-reseau.ts` | Application | Créer | Port `EtatReseau` (§4.3) |
| S3 | `src/commun/application/ports/source-aleatoire.ts` | Application | Créer | Port `SourceAleatoire` (§4.3) |
| S4 | `src/commun/application/ports/journal-technique.ts` | Application | Créer | Port `JournalTechnique` (§4.3) |
| S5 | `src/commun/infrastructure/planificateur-navigateur.ts`, `etat-reseau-navigateur.ts`, `source-aleatoire-crypto.ts`, `journal-technique-local.ts` | Infrastructure | Créer | Adaptateurs ; `journal-technique-local.ts` exporte aussi la fonction pure `masquerDonneesSensibles` (§9.4 des conventions) |
| S6 | `tests/doublures/planificateur-simule.ts`, `reseau-simule.ts`, `source-aleatoire-deterministe.ts`, `journal-technique-memoire.ts` | Test | Créer | Doublures (`conventions.md` §11.10) |
| S7 | `tests/support/banc/banc-synchro.ts`, `appareil-simule.ts` | Test | Compléter | Banc à deux appareils (§12.3) |
| S8 | `package.json`, `.npmrc`, `.nvmrc`, `.dependency-cruiser.cjs`, `cucumber.mjs`, `.prettierrc`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.github/pull_request_template.md`, `.env.example`, `.gitignore` (complété, §9.1 des conventions) | Outillage | Créer ou modifier | `conventions.md` §3, §9.1, §11.8, §13, §14 |
| S9 | `scripts/verifier-catalogue.ts`, `verifier-tags.ts`, `verifier-rangs.ts`, `verifier-depot.ts`, `selection-scenarios.mjs`, `verifier-etapes-inutilisees.mjs` ; `tests/support/rangs-scenarios.json` | Outillage | Créer | Contrôles de CI (`conventions.md` §8.5, §11.8, §11.13, §9.1) ; le fichier des rangs reprend la liste nominative de `LOT-001.md` |
| S10 | `src/composition/web.ts`, `src/main.tsx`, `index.html`, `vite.config.ts` | Composition | Créer | Assemblage (complété à chaque rang) ; `index.html` porte `<meta name="referrer" content="no-referrer">` et la CSP (RED-07) ; **au rang 0 (Q-BEN-LOT001-5)** : `web.ts` n'est qu'une fonction d'assemblage du socle paramétrée par `nomBase`, non branchée sur `main.tsx`, exclue de la couverture (§12 des conventions) ; la base technique (§3.2 n° 28) et le branchement de `main.tsx` arrivent au rang 1 |

**Condition de l'E13 du rang 0 (RL-LOT-001-A5, Starck)** : dépendances installées et figées dans `pnpm-lock.yaml` (`@cucumber/cucumber`, `msw`, `@playwright/test`, `dependency-cruiser`, `react`, `react-dom`, `@ionic/react`, `vite-plugin-pwa`, `dexie`, `zod`, `fake-indexeddb`, `fast-check`) ; workflow `.github/workflows/ci.yml` avec les jobs lint (ESLint, Prettier), types (`tsc`), Vitest, `cucumber-js --strict` restreint au rang courant (`selection-scenarios.mjs`), dependency-cruiser, gitleaks et osv-scanner, tous bloquants ; après le premier passage vert, Anthony demande à Jarvis d'activer la protection de `main` (DEC-029).

Le socle complémentaire n'a pas d'autre test fourni que UT-US-022-48 (masquage du journal) et UT-US-022-49 (délais de reprise) : les doublures sont spécifiées par leur contrat (§12.3) et vérifiées par les scénarios.

### 3.2 US-022 (rang 1)

| # | Fichier | Couche | Action | Responsabilité | Dépend de |
|---|---|---|---|---|---|
| 1 | `src/compte/domaine/identite.ts` | Domaine | Créer | `IdCompte`, `AdresseGoogle`, `Identite` | commun |
| 2 | `src/compte/domaine/portees.ts` | Domaine | Créer | `Portee`, `PORTEES_LOT_1`, `normaliserPortee`, `porteesManquantes` | — |
| 3 | `src/compte/domaine/motif-connexion.ts` | Domaine | Créer | `MotifEchecConnexion`, `CauseEchecConnexion`, `motifEchecConnexion` | — |
| 4 | `src/compte/domaine/ouverture.ts` | Domaine | Créer | `EntreeOuverture`, `DecisionOuverture`, `deciderOuverture` (DAT §4.1.7) | 1 |
| 5 | `src/compte/domaine/acces.ts` | Domaine | Créer | `EtatAcces`, `IssueRetourGoogle`, `accesApresRetour`, `qualifierRefusJeton`, `MARGE_ECHEANCE_JETON` | commun |
| 6 | `src/compte/application/ports/fournisseur-auth.ts` | Application | Créer | Port `FournisseurAuth` | 1, 2 |
| 7 | `src/compte/application/ports/coffre-jetons.ts` | Application | Créer | Port `CoffreJetons`, type `JetonAcces` | — |
| 8 | `src/compte/application/ports/memoire-redirection.ts` | Application | Créer | Port interne `MemoireRedirection`, `DepartMemorise`, `EtatReprise` | — |
| 9 | `src/compte/application/ports/memoire-session.ts` | Application | Créer | Port `MemoireSession`, `SessionMemorisee` | 1 |
| 10 b | `src/compte/application/ports/avis-onglets.ts`, `src/compte/infrastructure/avis-onglets-broadcast.ts` | Application, infrastructure | Créer | Port `AvisOnglets` (`SESSION_FERMEE`) et adaptateur `BroadcastChannel` `donejuan-<env>-session` ; **avancé au rang 1** (RL-LOT-001-A1 ; ST-US-031 v0.2 le prévoyait au rang 13) | — |
| 10 | `src/compte/application/ports/garde-saisie.ts` | Application | Créer | Port `GardeSaisie` (saisie en cours : aucune redirection, DAT v0.11.3 §4.1.7). *Le port `RegistreAppareil` de la v0.1 est supprimé (Q-ST022-STA-3)* | — |
| 11 | `src/compte/application/ports/gestion-espaces.ts` | Application | Créer | Port `GestionEspaces` | 1 |
| 12 | `src/compte/application/ports/preparation-stockage.ts` | Application | Créer | Port `PreparationStockage` | — |
| 13 | `src/compte/application/ports/depot-avant-sortie.ts` | Application | Créer | Port `DepotAvantSortie` | — |
| 14 | `src/compte/application/session-courante.ts` | Application | Créer | `SessionCourante` : état en mémoire, observable | 1, 5 |
| 15 | `src/compte/application/cas-usage/ouvrir-application.ts` | Application | Créer | `OuvrirApplication` (§6.2) | 4 à 14 |
| 16 | `src/compte/application/cas-usage/se-connecter.ts` | Application | Créer | `SeConnecter` (§6.3) | 2, 3, 6, 9, 11, 12, 14 |
| 17 | `src/compte/application/cas-usage/reprendre-session.ts` | Application | Créer | `ReprendreSession` (geste « Reprendre la synchronisation », « Se reconnecter », §6.10) | 5, 6, 9, 10, 14 |
| 18 | `src/compte/application/cas-usage/se-deconnecter.ts` | Application | Créer | `SeDeconnecter` (`evaluer` / `executer`) | 6, 9, 11, 13, 14 |
| 19 | `src/compte/application/cas-usage/supprimer-donnees-appareil.ts` | Application | Créer | `SupprimerDonneesAppareil` (`evaluer` / `confirmer` / `confirmerPerte`) | 6, 9, 11, 13, 14 |
| 20 | `src/compte/application/cas-usage/signaler-refus-jeton.ts` | Application | Créer | `SignalerRefusJeton` (401 d'un appel Google) | 5, 7, 9, 14 |
| 21 | `src/compte/application/requetes/consulter-compte.ts` | Application | Créer | Données de la section « Compte » et de l'écran racine | 14 |
| 22 | `src/compte/infrastructure/auth/retour-redirection.ts` | Infrastructure | Créer | `consommerRetourRedirection` (RED-02), `analyserFragment` | — |
| 23 | `src/compte/infrastructure/auth/verification-retour.ts` | Infrastructure | Créer | `verifierRetour` (RED-03, portées) | 2, 8 |
| 24 | `src/compte/infrastructure/auth/url-autorisation.ts` | Infrastructure | Créer | `uriRedirection`, `construireUrlAutorisation`, `encoderBase64Url`, `VALIDITE_STATE_REDIRECTION` | — |
| 25 | `src/compte/infrastructure/auth/passerelle-gis.ts` | Infrastructure | Créer | Interface `PasserelleGis` et adaptateur `PasserelleGisNavigateur` (chargement à la demande, R12) | — |
| 25 b | `src/compte/infrastructure/auth/strategie-geste.ts` | Infrastructure | Créer | Fonctions pures `mecanismeGeste(plateforme)`, `suiteErreurGis(erreur, reseau)` (§6.4) | 6 |
| 26 | `src/compte/infrastructure/auth/fournisseur-auth-web.ts` | Infrastructure | Créer | `FournisseurAuthWeb` (§6.4) | 22 à 25, 7, 8 |
| 27 | `src/compte/infrastructure/coffre-jetons-memoire.ts` | Infrastructure | Créer | `CoffreJetonsMemoire` (adaptateur réel et doublure) | 7 |
| 28 | `src/compte/infrastructure/base-technique.ts` | Infrastructure | Créer | Base Dexie `donejuan-<env>-technique` (§5.1) ; `MemoireSessionDexie`, `MemoireRedirectionDexie` | 8, 9 |
| 29 | `src/compte/infrastructure/espaces/nom-espace.ts` | Infrastructure | Créer | `nomEspace(env, compte)` : `donejuan-<env>-<sha256 hex du sub>` | 1 |
| 30 | `src/compte/infrastructure/espaces/gestion-espaces-indexeddb.ts` | Infrastructure | Créer | `GestionEspacesIndexedDb` | 11, 29 |
| 31 | `src/compte/infrastructure/configuration.ts` | Infrastructure | Créer | `lireConfiguration(env)` : `VITE_ENV`, `VITE_GOOGLE_WEB_CLIENT_ID`, `VITE_BASE_PATH`, `VITE_APP_ORIGIN` ; `plateforme` (`web-ios` si l'agent utilisateur est Safari sur iPhone ou iPad, sinon `web`) | — |
| 32 | `src/compte/presentation/modeles-de-vue/ecran-connexion.ts` | Modèle de vue | Créer | ECR-010 (invitation, portées annoncées, messages `ERR-001` à `ERR-006`) | 3 |
| 33 | `src/compte/presentation/modeles-de-vue/racine.ts` | Modèle de vue | Créer | Écran racine : connexion, attente de Google (`SYN-REDIRECTION`), application (UT-US-022-59) | 14 |
| 33 b | `src/compte/presentation/modeles-de-vue/retour-reprise.ts` | Modèle de vue | Créer | `construireRetourReprise(issue)` : toast `TST-SAISIE-A-TERMINER` pour `SAISIE_A_TERMINER` (guide v0.2.14 §6.6.6) | 17 |
| 34 | `src/compte/presentation/modeles-de-vue/section-compte.ts` | Modèle de vue | Créer | ECR-011, section « Compte » | 21 |
| 35 | `src/compte/presentation/modeles-de-vue/confirmations-compte.ts` | Modèle de vue | Créer | `CNF-DECONNEXION`, `CNF-SUPPR-DONNEES`, `CNF-SUPPR-DONNEES-PERTE` | 18, 19 |
| 36 | `src/compte/index.ts` | Interface publique | Créer | Types et cas d'usage nécessaires à la composition et aux autres contextes : `EtatAcces`, `Identite`, `IdCompte`, `SessionCourante` (type), `SignalerRefusJeton` | — |
| 37 | `src/infrastructure-google/client-google.ts` | Infrastructure | Créer | `ClientGoogle` : `fetch`, en-tête `Authorization`, traduction des erreurs (`traduireReponse`), en-tête `Date` | 7 |
| 38 | `src/infrastructure-google/reprise.ts` | Infrastructure | Créer | **Rang 0** : constantes et `delaiAvantTentative` (DAT §4.4.5, UT-US-022-49) ; **rang 1** : `executerAvecReprise` (Q-BEN-LOT001-5) | commun |
| 39 | `src/synchronisation/application/ports/transport-synchro.ts` | Application | Créer | Port `TransportSynchro`, **méthode `preparerDossier` seulement à ce rang** (le reste : ST-US-017) | — |
| 40 | `src/synchronisation/application/ports/acces-google.ts` | Application | Créer | Port `AccesGoogle` (vue de l'accès par la synchronisation) | — |
| 41 | `src/synchronisation/application/ports/suivi-cycle.ts` | Application | Créer | Port `SuiviCycle` ; constante `SUIVI_CYCLE_AU_REPOS` utilisée par la composition jusqu'au rang 3 | — |
| 42 | `src/synchronisation/application/preparation-dossier-drive.ts` | Application | Créer | `PreparationDossierDrive` (implémente le port 12 dans la composition) | 38, 39 |
| 43 | `src/synchronisation/application/masquage-rappel.ts` | Application | Créer | `MasquageRappel` : état « bandeau des 24 h fermé », en mémoire, propre à l'ouverture | — |
| 44 | `src/synchronisation/application/requetes/consulter-etat-synchronisation.ts` | Application | Créer | `consulterEtatSynchronisation` → `EtatSynchronisationAffichable` | 40, 41, 43 |
| 45 | `src/synchronisation/infrastructure/drive/transport-synchro-drive.ts` | Infrastructure | Créer | `TransportSynchroDrive.preparerDossier` | 37 |
| 46 | `src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable.ts` | Modèle de vue | Créer | Type d'entrée commun | — |
| 47 | `src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation.ts` | Modèle de vue | Créer | `selectionnerEtatIndicateur`, `construireIndicateur` | 46 |
| 48 | `src/synchronisation/presentation/modeles-de-vue/bandeau.ts` | Modèle de vue | Créer | `construireBandeau` (seule fonction de sélection des bandeaux ; RG-035, RG-057, RG-058) | 46, 47 |
| 49 | `src/synchronisation/index.ts` | Interface publique | Modifier | Ajoute les exports des fichiers 39 à 48 utiles à la composition | — |
| 50 | `src/compte/presentation/ui/…`, `src/synchronisation/presentation/ui/…` | UI | Créer | ECR-010, section Compte d'ECR-011, `SyncStatus`, `Banner`, `ConfirmDialog` (cas `CNF-` du compte), écran d'attente (Q-ST022-STE-1) | 32 à 35, 47, 48 |
| 51 | `src/composition/web.ts`, `src/main.tsx` | Composition | Modifier | §6.6 | tout |
| 52 | `tests/doublures/faux-fournisseur-auth.ts`, `faux-google.ts`, `faux-drive.ts` (rang 1 : dossier seulement) | Test | Créer | §12.3 | — |
| 53 | `tests/support/compte/*.ts`, `tests/steps/compte/connexion.steps.ts`, `tests/steps/synchronisation/etat-affiche.steps.ts` | Test | Créer | §12 | — |
| 54 | `src/synchronisation/infrastructure/depot-local-dexie.ts` | Infrastructure | Modifier | Fabrique `DepotLocalDexie.ouvrirEspace({ nomBase, fabrique?, generateur })` et accesseur `appareil()` (§5.2, Q-ST022-STA-3) ; le constructeur du socle est inchangé | socle |

**Fichiers qui ne doivent pas être modifiés** : les types de `ST-socle-ecriture.md` §4 ; `src/objectifs-taches/**`.

**Règles d'outillage ajoutées** (`eslint.config.js`, blocs `files`) : `location.hash` et `history.replaceState` admis dans `src/compte/infrastructure/auth/retour-redirection.ts` seulement ; `location.assign` et `window.google` dans `fournisseur-auth-web.ts` et `passerelle-gis.ts` seulement ; **aucune dérogation `sessionStorage`** (le support du `state` est la base technique, §5.1, Q-ST022-STA-1) ; `crypto.subtle` admis dans `nom-espace.ts` et dans `synchronisation/infrastructure/drive/` (rang 3).

## 4. Interfaces et signatures

### 4.1 Domaine

```ts
// src/compte/domaine/identite.ts — DAT §4.1.4 ; conventions §9.2 (compte identifié par le sub)
export type IdCompte = Marque<string, 'IdCompte'>;          // claim `sub`
export type AdresseGoogle = Marque<string, 'AdresseGoogle'>;  // e-mail : login_hint et affichage seulement
export type Identite = { readonly compte: IdCompte; readonly adresse: AdresseGoogle };
export const IdCompte = {
  depuisSub: (sub: string): Resultat<IdCompte, { readonly type: 'SubInvalide' }>, // 1 à 255 caractères visibles ASCII (0x21 à 0x7E)
} as const;
export const AdresseGoogle = {
  depuisTexte: (texte: string): Resultat<AdresseGoogle, { readonly type: 'AdresseInvalide' }>, // non vide, sans espace, un seul « @ » non initial ni final
} as const;

// src/compte/domaine/portees.ts — DS-05, ADR-005, ENF-05
export type Portee = 'openid' | 'email' | 'https://www.googleapis.com/auth/drive.file';
export const PORTEES_LOT_1: ReadonlyArray<Portee>;  // ['openid', 'email', '…/drive.file'], dans cet ordre
/** Google renvoie `email` sous la forme `https://www.googleapis.com/auth/userinfo.email` : ramenée à `email`. */
export const normaliserPortee: (brute: string) => string;
/** Portées requises absentes des portées accordées (après normalisation), dans l'ordre de `requises`. */
export const porteesManquantes: (accordees: ReadonlyArray<string>, requises: ReadonlyArray<Portee>) => ReadonlyArray<Portee>;

// src/compte/domaine/motif-connexion.ts — US-022 « Motifs de connexion », guide §6.6.8
export type MotifEchecConnexion = 'ERR-001' | 'ERR-002' | 'ERR-003' | 'ERR-004' | 'ERR-005' | 'ERR-006';
export type CauseEchecConnexion =
  | 'ANNULEE' | 'PORTEES_REFUSEES' | 'HORS_LIGNE' | 'INTERROMPUE'
  | 'DRIVE_MOMENTANEMENT_INDISPONIBLE' | 'DRIVE_INDISPONIBLE_POUR_LE_COMPTE';
export const motifEchecConnexion: (cause: CauseEchecConnexion, contexte: { readonly espaceLocalExistant: boolean }) => MotifEchecConnexion;

// src/compte/domaine/ouverture.ts — DAT §4.1.7, RED-08, DEC-026
export type EntreeOuverture = {
  readonly sessionMemorisee: boolean;          // une identité est en cache
  readonly retour: 'AUCUN' | 'PRESENT';        // la page revient de Google (fragment non vide)
  readonly departEnAttente: boolean;           // un départ mémorisé, non expiré, sans retour
  readonly reseau: 'CONNECTE' | 'COUPE';
};
export type DecisionOuverture = 'ECRAN_CONNEXION' | 'TRAITER_RETOUR' | 'OUVRIR_SANS_JETON' | 'REDIRECTION_SILENCIEUSE';
export const deciderOuverture: (entree: EntreeOuverture) => DecisionOuverture;

// src/compte/domaine/acces.ts — DAT §4.1.5, §4.1.6 bis, ADR-013
export type EtatAcces = 'VALIDE' | 'A_RENOUVELER' | 'PERDU';
export const MARGE_ECHEANCE_JETON: EcartTemps;   // 60 s (DAT §4.1.6 bis)
export type IssueRetourGoogle =
  | 'JETON' | 'ERREUR_INTERACTION' | 'ERREUR_CONFIGURATION' | 'REFUS'
  | 'PORTEES_PARTIELLES' | 'RETOUR_REJETE' | 'ANNULATION' | 'ERREUR_TECHNIQUE';
export type OrigineDemande = 'OUVERTURE' | 'GESTE';
export const accesApresRetour: (p: { readonly avant: EtatAcces; readonly issue: IssueRetourGoogle; readonly origine: OrigineDemande }) => EtatAcces;
/** 401 reçu d'une API Google : jeton échu ou proche de l'échéance → à renouveler ; jeton valide refusé → perdu. */
export const qualifierRefusJeton: (p: { readonly echeance: EcartTemps | undefined; readonly maintenant: EcartTemps }) => 'A_RENOUVELER' | 'PERDU';
```

### 4.2 Application

```ts
// src/compte/application/session-courante.ts
export type EtatSession =
  | { readonly type: 'SANS_SESSION' }
  | { readonly type: 'ATTENTE_GOOGLE'; readonly identite: Identite }   // redirection lancée, la page va quitter l'application
  | { readonly type: 'OUVERTE'; readonly identite: Identite; readonly acces: EtatAcces };
export class SessionCourante {
  etat(): EtatSession;
  ouvrir(identite: Identite, acces: EtatAcces): void;
  attendreGoogle(identite: Identite): void;
  changerAcces(acces: EtatAcces): void;        // ErreurProgrammation si aucune session ouverte
  fermer(): void;
  observer(rappel: (etat: EtatSession) => void): Annulation;
}
```

| Cas d'usage | Entrée | Sortie | Erreurs | Ports | Effets de bord |
|---|---|---|---|---|---|
| `OuvrirApplication.executer(retour: RetourGoogle)` | Retour déjà extrait par `consommerRetourRedirection` | `IssueOuverture` : `{ type: 'ECRAN_CONNEXION' }` \| `{ type: 'REDIRECTION_LANCEE' }` \| `{ type: 'SESSION_OUVERTE'; acces: EtatAcces; reprise?: EtatReprise }` | Aucune (toutes les situations sont des issues) | `MemoireSession`, `MemoireRedirection`, `FournisseurAuth`, `GestionEspaces`, `EtatReseau`, `JournalTechnique`, `SessionCourante`, `Horloge` | Ouvre l'espace du compte ; lance au plus une redirection |
| `SeConnecter.executer()` | — | `Identite` | `{ type: 'ConnexionImpossible'; motif: MotifEchecConnexion }`, `{ type: 'EspaceInaccessible' }` | `EtatReseau`, `FournisseurAuth`, `PreparationStockage`, `GestionEspaces`, `MemoireSession`, `SessionCourante` | Dossier Drive, espace local, session mémorisée |
| `ReprendreSession.executer(reprise: EtatReprise)` | État d'écran courant | `IssueReprise` : `{ type: 'ACCES_RENOUVELE' }` \| `{ type: 'REDIRECTION_LANCEE' }` \| `{ type: 'SAISIE_A_TERMINER' }` \| `{ type: 'ACCES_PERDU' }` \| `{ type: 'INCHANGE' }` | `{ type: 'HorsLigne' }`, `{ type: 'SansSession' }` | `FournisseurAuth`, `MemoireSession`, `SessionCourante`, `EtatReseau`, `GardeSaisie` | §6.10 ; jeton dans le coffre ; `accesPerdu` effacé si renouvelé, mémorisé si perdu |
| `SeDeconnecter.evaluer()` | — | `Evaluation` (`CNF-DECONNEXION` avec `n`, ou sans confirmation) | `{ type: 'SansSession' }` | `DepotAvantSortie`, `SessionCourante` | Tente un dépôt (§6.5), aucune écriture locale métier |
| `SeDeconnecter.executer()` | — | `undefined` | `{ type: 'SansSession' }` | `FournisseurAuth`, `MemoireSession`, `AvisOnglets`, `GestionEspaces`, `SessionCourante` | §6.5 |
| `SupprimerDonneesAppareil.evaluer()` | — | `Evaluation` (`CNF-SUPPR-DONNEES`, toujours) | `SansSession` | `SessionCourante` | Aucun |
| `SupprimerDonneesAppareil.confirmer()` | — | `{ type: 'SUPPRIMEES' }` \| `{ type: 'CONFIRMATION_REQUISE'; confirmation: { code: 'CNF-SUPPR-DONNEES-PERTE'; n: number } }` \| `{ type: 'SUPPRESSION_BLOQUEE' }` (`ERR-017`) | `SansSession`, `EspaceInaccessible` | `DepotAvantSortie`, `GestionEspaces`, `FournisseurAuth`, `MemoireSession`, `SessionCourante` | §6.6 |
| `SupprimerDonneesAppareil.confirmerPerte()` | — | `{ type: 'SUPPRIMEES' }` \| `{ type: 'SUPPRESSION_BLOQUEE' }` | idem | idem + `AvisOnglets` | Suppression de l'espace |
| `SupprimerDonneesAppareil.reessayer()` | — (« Réessayer » d'`ERR-017`, sans nouvelle confirmation) | `SUPPRIMEES` \| `SUPPRESSION_BLOQUEE` | idem | idem | Attend la même suppression |
| `SupprimerDonneesAppareil.fermerApresBlocage()` | — (« Aller à la connexion » d'`ERR-017`) | `undefined` | `SansSession` | `FournisseurAuth`, `SessionCourante` | §6.6 |
| `OuvrirApplication.abandonnerAttenteGoogle()` | — (échéance de `DELAI_MAX_ATTENTE_REDIRECTION`, 10 s) | `IssueOuverture \| undefined` | — | `MemoireRedirection`, `MemoireSession`, `SessionCourante`, `JournalTechnique` | §6.2 |
| `SignalerRefusJeton.executer()` | — | `'A_RENOUVELER' \| 'PERDU'` | — | `CoffreJetons`, `Horloge`, `MemoireSession`, `SessionCourante` | Coffre vidé ; `accesPerdu` mémorisé si perdu |
| `consulterCompte(session)` | — | `{ racine: 'CONNEXION' \| 'ATTENTE_GOOGLE' \| 'APPLICATION'; adresse?: AdresseGoogle }` | — | `SessionCourante` | Aucun |

`Evaluation` est le type de `conventions.md` §8.6 ; la confirmation porte `{ code: 'CNF-DECONNEXION'; n: number }` ou `{ code: 'CNF-SUPPR-DONNEES' }`.

**Écart documenté à `conventions.md` §8.6** : `SeDeconnecter.evaluer` et `SupprimerDonneesAppareil.confirmer` tentent un **dépôt dans le Drive** avant de compter (CA-6 précision E8, CA-10, guide §6.6.7). Ce dépôt n'est pas une écriture métier locale : la règle « `evaluer` n'écrit rien » reste vraie pour l'état métier.

### 4.3 Ports (nouveaux)

```ts
// src/commun/application/ports/planificateur.ts — conventions §2.3, §10.2
export type Annulation = () => void;
export interface Planificateur {
  apres(delai: EcartTemps, action: () => void): Annulation;
  periodiquement(periode: EcartTemps, action: () => void): Annulation;
  attendre(delai: EcartTemps): Promise<void>;
}
// src/commun/application/ports/etat-reseau.ts
export interface EtatReseau {
  estConnecte(): boolean;
  surChangement(rappel: (connecte: boolean) => void): Annulation;
}
// src/commun/application/ports/source-aleatoire.ts — conventions §7.4
export interface SourceAleatoire { octets(n: number): Uint8Array; entierEntre(min: number, max: number): number }
// src/commun/application/ports/journal-technique.ts — conventions §9.4
export type NiveauJournal = 'erreur' | 'avertissement' | 'info' | 'debug';
export type EntreeJournalTechnique = {
  readonly niveau: NiveauJournal; readonly evenement: string;
  readonly champs?: Readonly<Record<string, string | number | boolean>>;
};
export interface JournalTechnique { consigner(entree: EntreeJournalTechnique): void }

// src/compte/application/ports/coffre-jetons.ts — DS-06, RED-05
export type JetonAcces = Marque<string, 'JetonAcces'>;
export type JetonEnCoffre = { readonly jeton: JetonAcces; readonly echeance: EcartTemps }; // échéance sur l'horloge monotone
export interface CoffreJetons { placer(j: JetonEnCoffre): void; lire(): JetonEnCoffre | undefined; vider(): void }

// src/compte/application/ports/memoire-redirection.ts — RED-03, RED-04, DAT v0.11.3 §4.1.7 (port interne au contexte compte, validé par Starck)
export type ModeDepart = 'RENOUVELLEMENT_OUVERTURE' | 'REPLI_GESTE';   // REPLI_GESTE : redirection interactive d'un geste
/** Aucun contenu métier : `ecran` est une route (segments fixes et identifiants), conforme à ROUTE_REPRISE. */
export type EtatReprise = { readonly ecran: string; readonly feuilleSynchronisationOuverte: boolean };
export const ROUTE_REPRISE: RegExp;   // /^[a-z0-9/_-]{1,200}$/
export type DepartMemorise = {
  readonly state: string; readonly expireA: Instant; readonly lanceA: Instant;
  readonly mode: ModeDepart; readonly reprise: EtatReprise;
};
export interface MemoireRedirection {
  /** Succes seulement après `complete` (durabilité stricte), donc avant la navigation ; base indisponible ou route
   *  hors ROUTE_REPRISE → MemoireTechniqueIndisponible, et aucune redirection. */
  memoriser(depart: DepartMemorise): Promise<Resultat<undefined, { readonly type: 'MemoireTechniqueIndisponible' }>>;
  /** Lit puis supprime, dans tous les cas (usage unique) ; base indisponible → undefined. */
  consommer(): Promise<DepartMemorise | undefined>;
}

// src/compte/application/ports/memoire-session.ts — DAT §4.1.4 (identité en cache)
export type SessionMemorisee = { readonly identite: Identite; readonly accesPerdu: boolean };
export interface MemoireSession {
  lire(): Promise<SessionMemorisee | undefined>;
  ecrire(s: SessionMemorisee): Promise<Resultat<undefined, { readonly type: 'MemoireTechniqueIndisponible' }>>;
  effacer(): Promise<void>;
}

// src/compte/application/ports/garde-saisie.ts — DAT v0.11.3 §4.1.7 (Q-ST022-STA-1) ; implémenté par la présentation
export interface GardeSaisie { saisieEnCours(): boolean }   // vrai si un formulaire est ouvert et modifié
// (v0.1 : RegistreAppareil, supprimé — l'appareilId naît avec l'espace du compte, §5.2)

// src/compte/application/ports/gestion-espaces.ts — DEC-016, conventions §9.3 ; DAT v0.11.4 §4.1.6 (RL-LOT-001-A1)
export type ErreurEspace = { readonly type: 'EspaceInaccessible' };
export type ErreurSuppressionBloquee = { readonly type: 'SuppressionBloquee' };
export const DELAI_SUPPRESSION_BLOQUEE: EcartTemps;                       // 5 s (guide v0.2.15, ERR-017)
export interface GestionEspaces {
  ouvrir(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>>; // crée si absent ; ferme l'espace ouvert auparavant
  fermer(): Promise<void>;
  existeUnEspace(): Promise<boolean>;                                     // au moins un espace de compte sur l'appareil
  /** Ferme l'espace ouvert, puis deleteDatabase ; bloquée > 5 s → SuppressionBloquee, la demande restant en cours
   *  (IndexedDB ne permet pas de l'annuler) ; un nouvel appel attend la même demande. */
  supprimer(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>>;
}

// src/compte/application/ports/avis-onglets.ts — RL-LOT-001-A1 (rang 1)
export type AvisOnglet = 'SESSION_FERMEE';
export interface AvisOnglets { diffuser(avis: AvisOnglet): void; ecouter(rappel: (avis: AvisOnglet) => void): Annulation }

// src/compte/application/ports/preparation-stockage.ts — RG-020, CA-3
export type ErreurPreparation =
  | { readonly type: 'DriveIndisponiblePourLeCompte' } | { readonly type: 'DriveMomentanementIndisponible' }
  | { readonly type: 'ReseauInterrompu' };
export interface PreparationStockage { preparer(): Promise<Resultat<undefined, ErreurPreparation>> }

// src/compte/application/ports/depot-avant-sortie.ts — CA-6, CA-10, Q-US-022-3, Q-US-022-4
export type IssueDepotAvantSortie = 'DEPOSE' | 'ECHEC' | 'NON_TENTE';
export interface DepotAvantSortie {
  compterEnAttente(): Promise<number>;            // décompte par élément (DAT §4.1.5 bis)
  /** Tente un dépôt si réseau, accès valide et saisie non bloquée (RG-058) ; sinon NON_TENTE. */
  deposerSiPossible(): Promise<IssueDepotAvantSortie>;
}

// src/compte/application/ports/fournisseur-auth.ts — ADR-004, ADR-013, conventions §2.3
export type ModeDemande = 'CONNEXION' | 'RENOUVELLEMENT_OUVERTURE' | 'RENOUVELLEMENT_GESTE' | 'RECONNEXION_GESTE';
export type DemandeJeton = {
  readonly mode: ModeDemande;
  readonly portees: ReadonlyArray<Portee>;
  readonly indice?: AdresseGoogle;   // login_hint, obligatoire dès que l'identité est en cache (tous les modes sauf CONNEXION)
  readonly reprise: EtatReprise;     // état d'écran sauvegardé si la page doit quitter l'application
  readonly redirectionPermise: boolean;  // faux si une saisie est en cours : aucune redirection, RedirectionNonPermise
};
export type AccesObtenu = { readonly porteesAccordees: ReadonlyArray<string>; readonly identite: Identite };
export type IssueDemandeJeton =
  | { readonly type: 'ACCES_OBTENU'; readonly acces: AccesObtenu }
  | { readonly type: 'REDIRECTION_LANCEE' };
export type ErreurAuth =
  | { readonly type: 'ConnexionAnnulee' }                  // fenêtre fermée par l'utilisateur
  | { readonly type: 'PorteeInsuffisante'; readonly manquantes: ReadonlyArray<Portee> }
  | { readonly type: 'AccesGoogleRevoque' }                // access_denied après un geste
  | { readonly type: 'SessionARenouveler'; readonly code: string }
  | { readonly type: 'ConfigurationOAuthInvalide'; readonly code: string }
  | { readonly type: 'RetourRedirectionRejete'; readonly motif: 'STATE_ABSENT' | 'STATE_INCONNU' | 'STATE_EXPIRE' | 'SANS_DEPART' }
  | { readonly type: 'CompteDifferent' }                   // jeton obtenu pour un autre `sub`
  | { readonly type: 'MemoireTechniqueIndisponible' }      // départ non mémorisé : aucune navigation
  | { readonly type: 'ReseauIndisponible' }
  | { readonly type: 'RedirectionNonPermise' };            // repli nécessaire mais redirectionPermise faux
export type RetourGoogle =
  | { readonly type: 'AUCUN' }
  | { readonly type: 'JETON'; readonly jeton: string; readonly expireEnSecondes?: number; readonly portees: ReadonlyArray<string>; readonly state?: string }
  | { readonly type: 'ERREUR'; readonly code: string; readonly state?: string };
export interface FournisseurAuth {
  demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>>;
  /** Valide le retour (state, portées, compte attendu) puis place le jeton dans le coffre. */
  recevoirRetour(p: { readonly retour: RetourGoogle; readonly depart: DepartMemorise | undefined; readonly compteAttendu: IdCompte }):
    Promise<Resultat<{ readonly acces: AccesObtenu; readonly mode: ModeDepart; readonly reprise: EtatReprise }, ErreurAuth>>;
  /** Efface le jeton en mémoire (déconnexion, suppression des données). */
  oublier(): void;
}

// src/synchronisation/application/ports/transport-synchro.ts — rang 1 : une seule méthode
export type ErreurTransport =
  | { readonly type: 'ReseauIndisponible' } | { readonly type: 'NonAutorise' }
  | { readonly type: 'DriveIndisponible' } | { readonly type: 'EspaceDrivePlein' }
  | { readonly type: 'ServeurIndisponible' } | { readonly type: 'RessourceIntrouvable' }
  | { readonly type: 'FichierIllisible'; readonly cause: string };    // ce dernier : rang 3
export type IdFichierDrive = Marque<string, 'IdFichierDrive'>;
export interface TransportSynchro {
  /** Recherche le dossier « Done Juan » de l'application (appProperties), le crée s'il est absent. Idempotent. */
  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  // méthodes du rang 3 : ST-US-017 §4.3
}

// src/synchronisation/application/ports/acces-google.ts
export type EtatAccesGoogle = 'SANS_SESSION' | 'VALIDE' | 'A_RENOUVELER' | 'PERDU';
export interface AccesGoogle {
  etat(): EtatAccesGoogle;
  /** À appeler sur un 401 ; renvoie l'état qualifié. */
  signalerRefus(): Promise<EtatAccesGoogle>;
  observer(rappel: (etat: EtatAccesGoogle) => void): Annulation;
}

// src/synchronisation/application/ports/suivi-cycle.ts
export type EtatMoteur = {
  readonly cycle: 'REPOS' | 'EN_COURS' | 'RETENTATIVE';
  readonly actionRequise?: 'DRIVE_PLEIN' | 'DONNEES_ABSENTES' | 'FORMAT_PLUS_RECENT' | 'ECHEC_PERSISTANT';
  readonly aLire: number;
};
export interface SuiviCycle { etatMoteur(): EtatMoteur }
export const SUIVI_CYCLE_AU_REPOS: SuiviCycle;   // { cycle: 'REPOS', aLire: 0 } ; remplacé au rang 3 par CycleSynchronisation
```

### 4.4 Adaptateurs

| Adaptateur | Port | Technologie | Points d'attention |
|---|---|---|---|
| `FournisseurAuthWeb` | `FournisseurAuth` | GIS (`google.accounts.oauth2.initTokenClient`), redirection OAuth 2.0 implicite, userinfo | §6.4 ; aucune exception ne sort ; jeton jamais journalisé |
| `PasserelleGisNavigateur` | `PasserelleGis` (interface interne) | Script `https://accounts.google.com/gsi/client` chargé à la demande | Hors ligne : `ScriptIndisponible` sans attente (R12) |
| `CoffreJetonsMemoire` | `CoffreJetons` | Variable privée | Seul détenteur du jeton |
| `MemoireSessionDexie`, `MemoireRedirectionDexie` | ports 8, 9 | Base `donejuan-<env>-technique`, durabilité stricte ; `memoriser` confirmé à `complete` | §5.1 |
| `GestionEspacesIndexedDb` | `GestionEspaces` | `indexedDB.databases()`, `deleteDatabase` ; options `{ env, fabrique?, planificateur, surOuverture(nomBase), surFermeture() }` : la composition ouvre (`DepotLocalDexie.ouvrirEspace`) et ferme (`DepotLocalDexie.fermer`) l'espace | Le nom ne contient ni `sub` ni adresse (`nomEspace`) ; suppression : §6.11 |
| `AvisOngletsBroadcast` | `AvisOnglets` | `BroadcastChannel('donejuan-<env>-session')` | Seul fichier autorisé à utiliser `BroadcastChannel` (règle ESLint) |
| `ClientGoogle` | (utilitaire d'infrastructure) | `fetch`, `AbortSignal` | §6.8 |
| `TransportSynchroDrive` | `TransportSynchro` | Drive v3 REST | `appProperties` `{ donejuan: 'dossier' }`, dossier racine, `trashed = false` |
| `EtatReseauNavigateur` | `EtatReseau` | `navigator.onLine`, événements `online` et `offline` | — |
| `PlanificateurNavigateur` | `Planificateur` | `setTimeout`, `setInterval` (seul fichier autorisé) | — |
| `SourceAleatoireCrypto` | `SourceAleatoire` | `crypto.getRandomValues` | — |
| `JournalTechniqueLocal` | `JournalTechnique` | Tampon IndexedDB circulaire de 7 jours (base technique, table `journal`) | `masquerDonneesSensibles` appliqué à chaque champ texte |

### 4.5 Présentation

| Écran / composant | Maquette | Modèle de vue | Codes | Actions → cas d'usage |
|---|---|---|---|---|
| Racine | ECR-010 (cadre « Attente ») | `construireRacine(etat: EtatSession): ModeleVueRacine` → `{ ecran: 'CONNEXION' \| 'ATTENTE_GOOGLE' \| 'APPLICATION' }` ; `ATTENTE_GOOGLE` s'affiche avec `data-etat="SYN-REDIRECTION"` (« Connexion à Google… », logo, sans action, `role="status"`, Q-ST022-STE-1) | `SYN-REDIRECTION` | — |
| Connexion (ECR-010) | ECR-010 A, D, E, F | `construireEcranConnexion(e: { readonly dernierEchec?: MotifEchecConnexion; readonly enCours: boolean }): ModeleVueConnexion` | `ERR-001` à `ERR-006` (`data-message`) | « Continuer avec Google » / « Réessayer » / « Choisir un autre compte » → `SeConnecter` |
| Section Compte (ECR-011) | ECR-011 | `construireSectionCompte(c: { readonly adresse: AdresseGoogle }): ModeleVueSectionCompte` → `actions: ['SE_DECONNECTER', 'SUPPRIMER_DONNEES']` (dans cet ordre, aucune autre) | `SYN-FEUILLE-DOSSIER` | → `SeDeconnecter`, `SupprimerDonneesAppareil` |
| Confirmations du compte | ECR-011 | `construireConfirmationCompte(c: ConfirmationCompte): { code; libelle; boutonAction; rouge }` | `CNF-DECONNEXION`, `CNF-SUPPR-DONNEES`, `CNF-SUPPR-DONNEES-PERTE` | « Se déconnecter », « Supprimer les données », « Supprimer quand même » |
| Indicateur (`SyncStatus`) | ECR-011, en-têtes | `construireIndicateur(e: EtatSynchronisationAffichable): ModeleVueIndicateur` | `SYN-…`, `data-a-lire` | `SYN-SESSION` → `ReprendreSession` |
| Bandeau (`Banner`) | ECR-011 D, J, K, L | `construireBandeau(e: EtatSynchronisationAffichable, maintenant: Instant): ModeleVueBandeau \| undefined` | `BAN-…`, `data-variante` | « Se reconnecter » → `ReprendreSession` ; « Masquer le rappel » → `MasquageRappel` (rang 12) |

```ts
// src/compte/presentation/modeles-de-vue/ecran-connexion.ts
export type PorteeAnnoncee = 'IDENTIFICATION_DU_COMPTE' | 'FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE';
export type ModeleVueConnexion = {
  readonly porteesAnnoncees: ReadonlyArray<PorteeAnnoncee>;       // toujours les deux, dans cet ordre (guide, ECR-010 A)
  readonly message?: { readonly code: MotifEchecConnexion; readonly titre: string; readonly texte: string };
  readonly action: 'CONTINUER_AVEC_GOOGLE' | 'REESSAYER' | 'CHOISIR_UN_AUTRE_COMPTE';
  readonly actionActive: boolean;                                   // faux seulement pendant une connexion en cours
};
// action : sans échec ou ERR-001/002 → CONTINUER_AVEC_GOOGLE ; ERR-003/004/005 → REESSAYER ; ERR-006 → CHOISIR_UN_AUTRE_COMPTE

// src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable.ts
export type EtatSynchronisationAffichable = {
  readonly reseau: 'CONNECTE' | 'COUPE';
  readonly acces: 'VALIDE' | 'A_RENOUVELER' | 'PERDU';
  readonly cycle: 'REPOS' | 'EN_COURS' | 'RETENTATIVE';
  readonly actionRequise?: 'DRIVE_PLEIN' | 'DONNEES_ABSENTES' | 'FORMAT_PLUS_RECENT' | 'ECHEC_PERSISTANT';
  readonly enAttente: number;                    // décompte par élément
  readonly plusAncienneEnAttente?: Instant;      // heure de l'appareil (ST-US-017 incr. 4 : correction retranchée)
  readonly aLire: number;
  readonly rappelMasque: boolean;
};
// src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation.ts
export type CodeIndicateur = 'SYN-ACTION' | 'SYN-SESSION' | 'SYN-RETENTATIVE' | 'SYN-HORS-LIGNE' | 'SYN-EN-COURS' | 'SYN-ATTENTE' | 'SYN-INFO' | 'SYN-OK';
export type MessageFeuille = 'ERR-010' | 'ERR-011' | 'ERR-012' | 'ERR-013' | 'ERR-015' | 'ERR-016';
export type ModeleVueIndicateur = {
  readonly code: CodeIndicateur;
  readonly n?: number;                           // SYN-HORS-LIGNE, SYN-ATTENTE
  readonly aLire?: number;                       // absent si 0
  readonly action?: 'REPRENDRE_LA_SYNCHRONISATION';  // SYN-SESSION seulement
  readonly messageFeuille?: MessageFeuille;
};
export const selectionnerEtatIndicateur: (e: EtatSynchronisationAffichable) => CodeIndicateur;
export const construireIndicateur: (e: EtatSynchronisationAffichable) => ModeleVueIndicateur;
// src/synchronisation/presentation/modeles-de-vue/bandeau.ts
export const SEUIL_RAPPEL_HORS_LIGNE: EcartTemps;   // 24 h (RG-057) — défini dans synchronisation/domaine/parametres-synchronisation.ts, réexporté
export type ModeleVueBandeau = {
  readonly code: 'BAN-ACCES-GOOGLE' | 'BAN-CONSULTATION-SEULE' | 'BAN-RAPPEL-24H';
  readonly variante?: '24H' | 'session';
  readonly n?: number;
  readonly action?: 'SE_RECONNECTER' | 'METTRE_A_JOUR' | 'REPRENDRE_LA_SYNCHRONISATION';
  readonly fermable: boolean;
  readonly bloquant: false;
  readonly message: 'ERR-010' | 'ERR-013' | 'ALR-002';
};
export const construireBandeau: (e: EtatSynchronisationAffichable, maintenant: Instant) => ModeleVueBandeau | undefined;
```

Libellés : catalogue §6.6, par `libelle()` ; les tests vérifient les codes. Accessibilité : erreurs de connexion en `role="alert"`, focus sur le bouton (guide §6.6.8) ; dialogues `alertdialog`, « Annuler » focalisé ; indicateur `role="status"`.

## 5. Modèle de données et migrations

### 5.1 Base technique `donejuan-<VITE_ENV>-technique` (Dexie, version 1, durabilité stricte)

| Table | Clé | Contenu | Écrit par | Effacé par |
|---|---|---|---|---|
| `installation` | `'installation'` | `{ persistanceDemandee?: boolean }` (ST-US-018 §5). **Aucun `appareilId`** : il est dans l'espace du compte (§5.2, Q-ST022-STA-3) | `DemanderPersistance` (rang 12) | Jamais par l'application |
| `session` | `'session'` | `{ sub, adresse, accesPerdu }` | `SeConnecter`, `ReprendreSession`, `SignalerRefusJeton` | `SeDeconnecter`, `SupprimerDonneesAppareil` |
| `redirection` | `'redirection'` | `{ state, expireA (ISO), lanceA (ISO), mode, reprise }` ; **ni jeton, ni adresse, ni `sub`, ni contenu métier** : `reprise.ecran` conforme à `ROUTE_REPRISE` (RED-04, DAT v0.11.3 §4.1.7) | `FournisseurAuthWeb`, écriture confirmée à `complete` **avant** la navigation | `consommer()` (toujours, lecture destructive), déconnexion |
| `journal` | auto | Entrées du journal technique (7 jours) | `JournalTechniqueLocal` | Rotation |

Relecture par Zod (`compte/infrastructure/base-technique.ts`) ; une ligne invalide vaut « absente » et est journalisée en `avertissement`. Le nom de la base n'est pas cloisonné par compte : elle ne contient aucune donnée métier. **Base indisponible** (ouverture refusée, quota) : `memoriser` échoue, donc aucune redirection n'est lancée et l'application s'ouvre sans jeton (`OUVRIR_SANS_JETON` de fait, §6.2 étape 6) ; `consommer` rend `undefined`. Le journal technique peut porter un identifiant d'installation distinct (non requis au lot 1) ; il n'est jamais écrit dans le Drive.

### 5.2 Espaces par compte
Nom : `nomEspace(env, compte)` = `donejuan-<env>-` + SHA-256 hexadécimal (64 caractères minuscules) du `sub` encodé en UTF-8. Contenu : base de `ST-socle-ecriture.md` §5.1.

**`appareilId` (DAT v0.11.3 §4.1.4, Q-ST022-STA-3)** : il est rangé dans l'espace (`meta.appareilId` du socle) et **naît avec lui**, un par couple installation et compte. La composition ouvre l'espace par `DepotLocalDexie.ouvrirEspace({ nomBase, fabrique?, generateur })` : base neuve → `IdAppareil.depuisUuid(generateur.genererUuidV7())` écrit dans `meta.appareilId` en transaction stricte confirmée à `complete` ; base existante → identifiant relu, générateur non appelé ; ligne illisible → `Echec(DonneesLocalesIllisibles)`. Le rappel `surOuverture(nomBase): Promise<Resultat<undefined, ErreurEspace>>` de `GestionEspacesIndexedDb` rend `EspaceInaccessible` sur tout échec. Après « Supprimer les données de cet appareil », la reconnexion crée un espace neuf, donc un **nouvel** `appareilId` (UT-US-022-55).

**Connexions des autres onglets (DAT v0.11.4 §4.1.6, RL-LOT-001-A1)** : toute instance qui ouvre une base (espace par `DepotLocalDexie`, base technique par `base-technique.ts`) traite `versionchange` : `db.close({ disableAutoOpen: true })` (Dexie 4 : aucune réouverture automatique au prochain accès), puis rappel `surFermetureImposee` ; toute méthode rend ensuite `Echec(EspaceLocalNonOuvert)` (base technique : lecture `undefined`, écriture `MemoireTechniqueIndisponible`). Dans la composition, ce rappel arrête la coordination et le cycle, puis recharge la page ; la nouvelle ouverture suit `deciderOuverture`. Une montée de version (versions 2 à 4 de l'espace, ST-US-017) est traitée de la même façon. `existeUnEspace()` : vrai si `indexedDB.databases()` contient au moins un nom de la forme `donejuan-<env>-` suivi de 64 caractères hexadécimaux.

### 5.3 Drive (rang 1)
Seul le **dossier** est créé : `name = "Done Juan"`, `mimeType = application/vnd.google-apps.folder`, `appProperties = { donejuan: "dossier" }`, à la racine. Recherche : `q = "appProperties has { key='donejuan' and value='dossier' } and trashed = false and mimeType = 'application/vnd.google-apps.folder'"`, `orderBy = createdTime`, premier résultat retenu (dossier canonique, DAT §4.2.2 d ; le dédoublonnage est fait au rang 3). Le manifeste et les fichiers d'appareil relèvent de ST-US-017.

### 5.4 Migrations
Base technique version 1 : création. Aucune donnée existante. Aucun impact sur le format Drive.

## 6. Règles et algorithmes

### 6.1 `deciderOuverture` (DAT §4.1.7, RED-08)
| `sessionMemorisee` | `retour` | `departEnAttente` | `reseau` | Décision |
|---|---|---|---|---|
| faux | — | — | — | `ECRAN_CONNEXION` (un retour éventuel est rejeté : `RetourRedirectionRejete` motif `SANS_DEPART`, journal `avertissement`) |
| vrai | `PRESENT` | — | — | `TRAITER_RETOUR` |
| vrai | `AUCUN` | vrai | — | `OUVRIR_SANS_JETON` (départ sans retour : retour arrière depuis Google ou application tuée ; aucune nouvelle redirection, leçon EC-5 et EC-8 du PoC) |
| vrai | `AUCUN` | faux | `COUPE` | `OUVRIR_SANS_JETON` |
| vrai | `AUCUN` | faux | `CONNECTE` | `REDIRECTION_SILENCIEUSE` |

### 6.2 `OuvrirApplication.executer(retour)`
```text
1. depart ← memoireRedirection.consommer()            // toujours, usage unique
   departValide ← depart défini et horloge.maintenant() ≤ depart.expireA
2. session ← memoireSession.lire()
3. decision ← deciderOuverture({ sessionMemorisee: session défini, retour: retour.type = 'AUCUN' ? 'AUCUN' : 'PRESENT',
                                 departEnAttente: departValide et retour.type = 'AUCUN', reseau })
4. ECRAN_CONNEXION : sessionCourante.fermer() ; renvoyer { type: 'ECRAN_CONNEXION' }
5. sinon : espaces.ouvrir(session.compte) (en échec : journal « erreur », ECRAN_CONNEXION)
   accesInitial ← session.accesPerdu ? 'PERDU' : 'A_RENOUVELER'
6. REDIRECTION_SILENCIEUSE : sessionCourante.attendreGoogle(identite) ;
     fournisseur.demanderJeton({ mode: 'RENOUVELLEMENT_OUVERTURE', portees: PORTEES_LOT_1, indice: adresse, reprise: REPRISE_ACCUEIL })
     REDIRECTION_LANCEE → renvoyer { type: 'REDIRECTION_LANCEE' }
     Echec (mémoire technique indisponible…) → ouvrir(identite, accesInitial) ; SESSION_OUVERTE
7. TRAITER_RETOUR : r ← fournisseur.recevoirRetour({ retour, depart: departValide ? depart : undefined, compteAttendu })
     Succes → acces 'VALIDE' ; si accesPerdu : memoireSession.ecrire({ …, accesPerdu: false }) ; reprise ← r.reprise
     Echec e → acces ← accesApresRetour({ avant: accesInitial, issue: issueDe(e), origine: depart?.mode = 'REPLI_GESTE' ? 'GESTE' : 'OUVERTURE' })
                si acces = 'PERDU' et non session.accesPerdu : memoireSession.ecrire({ …, accesPerdu: true })
     journal « info » : evenement 'RetourGoogle', champs { categorie, code (erreur Google seulement), dureeMs = maintenant − depart.lanceA }
8. OUVRIR_SANS_JETON : acces ← accesInitial (si departEnAttente : journal 'RetourAbsent')
9. sessionCourante.ouvrir(identite, acces) ; renvoyer { type: 'SESSION_OUVERTE', acces, reprise? }
```
**Écran d'attente limité à 10 s (guide v0.2.15 §6.6.2, RL-LOT-001-S6 ; DEC-038)** : quand `executer` rend `REDIRECTION_LANCEE`, la composition arme `planificateur.apres(DELAI_MAX_ATTENTE_REDIRECTION (10 s), …)`. À l'échéance, si la page n'a pas quitté l'application : `navigation.annuler()` (`window.stop()`), puis `abandonnerAttenteGoogle()` : `memoireRedirection.consommer()` ; journal `avertissement` `RedirectionSansReponse` ; `session.ouvrir(identite, accesPerdu ? PERDU : A_RENOUVELER)` → `SESSION_OUVERTE` (en ligne : `SYN-SESSION` avec `ERR-015`). Aucune nouvelle redirection dans cette ouverture (pas de boucle) ; hors état `ATTENTE_GOOGLE` : `undefined`, rien ne change (UT-US-022-58).

`REPRISE_ACCUEIL` = `{ ecran: 'accueil', feuilleSynchronisationOuverte: false }`. `issueDe` : `SessionARenouveler` → `ERREUR_INTERACTION` ; `ConfigurationOAuthInvalide` → `ERREUR_CONFIGURATION` ; `RetourRedirectionRejete` → `RETOUR_REJETE` ; `AccesGoogleRevoque` → `REFUS` ; `PorteeInsuffisante` → `PORTEES_PARTIELLES` ; `CompteDifferent`, `MemoireTechniqueIndisponible`, `ReseauIndisponible` → `ERREUR_TECHNIQUE` ; `ConnexionAnnulee` → `ANNULATION`.

### 6.3 `accesApresRetour` (DAT §4.1.6 bis, ADR-013, EC-7)
| Issue | Origine | Après |
|---|---|---|
| `JETON` | toutes | `VALIDE` |
| `PORTEES_PARTIELLES` | toutes | `PERDU` |
| `REFUS` (`access_denied`) | `GESTE` | `PERDU` |
| `REFUS` | `OUVERTURE` | comme `ERREUR_INTERACTION` (EC-7 : sans geste, `access_denied` ne prouve pas un retrait) |
| `ERREUR_INTERACTION`, `ERREUR_CONFIGURATION`, `RETOUR_REJETE`, `ERREUR_TECHNIQUE` | toutes | `PERDU` si `avant = PERDU`, sinon `A_RENOUVELER` (une erreur sans preuve ne transforme jamais un accès perdu en accès à renouveler, ni l'inverse) |
| `ANNULATION` | toutes | `avant` inchangé |

`qualifierRefusJeton` : `echeance` absente → `A_RENOUVELER` ; `maintenant ≥ echeance − MARGE_ECHEANCE_JETON` → `A_RENOUVELER` ; sinon `PERDU`.

### 6.4 `FournisseurAuthWeb.demanderJeton` (ADR-013 ; étape 16 refaite)
| Mode | Mécanisme | Paramètres |
|---|---|---|
| `CONNEXION` | GIS `initTokenClient` puis `requestAccessToken({ prompt: '' })` | `scope` = `PORTEES_LOT_1` séparées par un espace ; **pas de `login_hint`** (compte inconnu) |
| `RENOUVELLEMENT_OUVERTURE` | Redirection pleine page | `response_type=token`, `prompt=none`, `include_granted_scopes=true`, `login_hint`, `state`, `redirect_uri = uriRedirection(config)` |
| `RENOUVELLEMENT_GESTE` | `mecanismeGeste(plateforme)` : `web` → GIS, `prompt: ''`, **`login_hint` obligatoire** ; `web-ios` → redirection **interactive** d'emblée | Repli (`suiteErreurGis`) : **redirection interactive** (`prompt` absent, `login_hint` présent ; mode mémorisé `REPLI_GESTE`) **si et seulement si** GIS échoue pour une cause technique : script indisponible alors que le réseau est présent, `popup_failed_to_open`, ou type d'erreur GIS inconnu. **Une seule redirection par geste**, jamais enchaînée. Si `redirectionPermise` est faux : `RedirectionNonPermise`, aucune navigation |
| `RECONNEXION_GESTE` (après `PERDU`) | Idem | Même repli |

Sans repli : `popup_closed` → `ConnexionAnnulee` ; `access_denied` → `AccesGoogleRevoque` ; portées partielles (`hasGrantedAllScopes` faux, ou `porteesManquantes` non vide) → `PorteeInsuffisante`. Après un jeton GIS : appel userinfo (`https://openidconnect.googleapis.com/v1/userinfo`) ; en mode renouvellement ou reconnexion, si `sub` ≠ compte de la session → jeton jeté (coffre vidé), `CompteDifferent`. `demanderJeton` sans `indice` dans un mode autre que `CONNEXION` → `ErreurProgrammation`.

Redirection (ouverture silencieuse, ou repli interactif d'un geste) :
```text
0. geste et non demande.redirectionPermise : renvoyer Echec({ type: 'RedirectionNonPermise' }), sans naviguer
1. state ← encoderBase64Url(aleatoire.octets(16))                  // 128 bits, RED-03
2. memoireRedirection.memoriser({ state, expireA: maintenant + VALIDITE_STATE_REDIRECTION (10 min), lanceA: maintenant, mode, reprise })
   attendu jusqu'à `complete` ; en échec : renvoyer Echec({ type: 'MemoireTechniqueIndisponible' }), sans naviguer
3. navigation.aller(construireUrlAutorisation({ clientId, redirectUri, portees, state, indice,
      interaction: mode = 'RENOUVELLEMENT_OUVERTURE' ? 'SILENCIEUSE' : 'INTERACTIVE' }))
4. renvoyer Succes({ type: 'REDIRECTION_LANCEE' })
```
À l'ouverture, `redirectionPermise` vaut vrai (aucune saisie n'a pu commencer).
`recevoirRetour` : `verifierRetour(retour, depart, maintenant)` (RED-03 : comparaison de la chaîne entière ; expiré si `maintenant > expireA`, accepté à `expireA` exactement) ; erreur Google : `access_denied` → `AccesGoogleRevoque` si `depart.mode = 'REPLI_GESTE'` (« accès perdu », DAT v0.11.3), sinon `SessionARenouveler` ; codes d'interaction (`interaction_required`, `login_required`, `consent_required`, `account_selection_required`) → `SessionARenouveler` ; codes de configuration (`redirect_uri_mismatch`, `invalid_request`, `invalid_client`, `origin_mismatch`, `invalid_scope`, `unauthorized_client`, `unsupported_response_type`) → `ConfigurationOAuthInvalide`, journal `erreur` ; autre → `SessionARenouveler`. Jeton : portées vérifiées, jeton placé dans le coffre avec `echeance = horloge.monotone() + expireEnSecondes × 1000` (3 600 s si absent), userinfo, contrôle du compte.

### 6.5 `SeDeconnecter`
```text
evaluer : n ← depot.compterEnAttente() ; si n > 0 : depot.deposerSiPossible() ; n ← depot.compterEnAttente()
          n = 0 → SANS_CONFIRMATION ; sinon CONFIRMATION_REQUISE { code: 'CNF-DECONNEXION', n }
executer : fournisseur.oublier() ; memoireSession.effacer() ; avis.diffuser('SESSION_FERMEE') ; espaces.fermer() ; sessionCourante.fermer()
           (la mémoire de redirection est effacée par fournisseur.oublier ; aucune donnée de l'espace n'est supprimée ; aucune révocation ;
            les autres onglets se rechargent sur l'écran de connexion, sans message : ST-US-031 §6.4 ; UT-US-022-56)
```
En consultation seule (RG-058, S25), `deposerSiPossible` renvoie `NON_TENTE` (garde du port, ST-US-017 incrément 4).

### 6.6 `SupprimerDonneesAppareil`
```text
evaluer   : CONFIRMATION_REQUISE { code: 'CNF-SUPPR-DONNEES' }
confirmer : n ← compter ; si n > 0 : deposerSiPossible ; n ← compter
            n > 0 → CONFIRMATION_REQUISE { code: 'CNF-SUPPR-DONNEES-PERTE', n } ; sinon supprimer
confirmerPerte : supprimer
supprimer : memoireSession.effacer ; avis.diffuser('SESSION_FERMEE') ; r ← espaces.supprimer(compte)      // ordre imposé : DAT v0.11.4 §4.1.6
            r = SuppressionBloquee → { type: 'SUPPRESSION_BLOQUEE' } (ERR-017 ; jeton et session en mémoire gardés, aucune autre action)
            r = EspaceInaccessible → memoireSession.ecrire(session d'avant) ; Echec(EspaceInaccessible)
            r = Succes → fournisseur.oublier ; sessionCourante.fermer → { type: 'SUPPRIMEES' }
reessayer : r ← espaces.supprimer(compte) (attend la même demande, au plus 5 s) ; mêmes suites
fermerApresBlocage : fournisseur.oublier ; sessionCourante.fermer (écran de connexion) ; aucune nouvelle demande
```
**`ERR-017` et irréversibilité (RL-LOT-001-A1)** : IndexedDB ne permet pas d'annuler une demande `deleteDatabase` en attente. Une fois la confirmation donnée, la suppression **aboutira** dès que l'autre fenêtre fermera l'espace ; « Réessayer » attend de nouveau (au plus 5 s), « Aller à la connexion » ramène cet onglet à l'écran de connexion. La session mémorisée a été effacée avant la suppression : une ouverture ultérieure ne rouvre pas l'espace. Texte et libellés arrêtés par Steeve dans le guide v0.2.17.
Le Drive n'est jamais modifié par cette action. Les espaces d'autres comptes ne sont pas touchés (S19). **L'`appareilId` disparaît avec l'espace** (DAT v0.11.3 §4.1.4, réponse b) à Q-ST022-STA-3) : la reconnexion crée un espace neuf et un nouvel `appareilId` ; l'ancien fichier `<ancien id>.etat.json.gz` (à la racine du dossier `Done Juan/`, DAT v0.11.4 §4.2) est celui d'un appareil inactif, fusionné comme les autres ; l'archivage est hors du lot 1 (DAT v0.11.4 §4.2, dette DT-002).

### 6.7 `SeConnecter`
```text
1. si réseau coupé : Echec(ConnexionImpossible, motifEchecConnexion('HORS_LIGNE', { espaceLocalExistant: await espaces.existeUnEspace() }))
2. r ← fournisseur.demanderJeton({ mode: 'CONNEXION', portees: PORTEES_LOT_1, reprise: REPRISE_ACCUEIL })
   ConnexionAnnulee → ANNULEE ; PorteeInsuffisante → PORTEES_REFUSEES ; ReseauIndisponible → INTERROMPUE ; autres → INTERROMPUE
3. p ← preparation.preparer()
   DriveIndisponiblePourLeCompte → DRIVE_INDISPONIBLE_POUR_LE_COMPTE ; DriveMomentanementIndisponible → DRIVE_MOMENTANEMENT_INDISPONIBLE ;
   ReseauInterrompu → INTERROMPUE ; en échec, fournisseur.oublier()
4. espaces.ouvrir(compte) (échec → EspaceInaccessible, fournisseur.oublier)
5. memoireSession.ecrire({ identite, accesPerdu: false }) ; sessionCourante.ouvrir(identite, 'VALIDE')
```
Rien n'est écrit dans l'appareil (espace, session) avant l'étape 4 : un échec aux étapes 1 à 3 ne crée aucune donnée (S06, S20a à S21).

### 6.8 `ClientGoogle.traduireReponse` et reprise (DAT §4.4.5)
| Statut | Raison (`error.errors[0].reason` ou `error.status`) | Erreur |
|---|---|---|
| échec de `fetch`, `AbortError` de délai | — | `ReseauIndisponible` |
| 401 | — | `NonAutorise` |
| 403 | `storageQuotaExceeded`, `quotaExceeded` | `EspaceDrivePlein` |
| 403 | `rateLimitExceeded`, `userRateLimitExceeded` | `QuotaDepasse` |
| 403 | `domainPolicy`, `appNotAuthorizedToFile`… autre | `DriveIndisponible` |
| 404 | — | `RessourceIntrouvable` |
| 429 | — | `QuotaDepasse` |
| ≥ 500 | — | `ErreurServeurDistant` |

`delaiAvantTentative(n, gigue)` (n ≥ 1, gigue ∈ [0, 1[ tirée par `SourceAleatoire`) = min(`PLAFOND_REPRISE` = 5 min, `DELAI_INITIAL_REPRISE` (1 s) × 2^(n−1)) × (0,5 + gigue / 2). `PreparationDossierDrive` : au plus `TENTATIVES_CONNEXION` = 3 essais, reprise sur `QuotaDepasse`, `ErreurServeurDistant`, `ReseauIndisponible` ; après le troisième : `DriveMomentanementIndisponible` (5xx, 429) ou `ReseauInterrompu` (réseau) ; `DriveIndisponible` → `DriveIndisponiblePourLeCompte` sans reprise.

### 6.9 Indicateur et bandeaux (guide §6.6.2, §6.6.3 ; conventions §8.5)
`selectionnerEtatIndicateur` (ordre de gravité, premier qui s'applique) : `acces = PERDU` ou `actionRequise` défini → `SYN-ACTION` ; `acces = A_RENOUVELER` **et `reseau = CONNECTE`** → `SYN-SESSION` (hors ligne, jamais : guide v0.2.12 §6.6.2, Q-ST022-STE-3 b) ; `cycle = RETENTATIVE` → `SYN-RETENTATIVE` ; `reseau = COUPE` → `SYN-HORS-LIGNE` ; `cycle = EN_COURS` → `SYN-EN-COURS` ; `enAttente > 0` → `SYN-ATTENTE` ; `aLire > 0` → `SYN-INFO` ; sinon `SYN-OK`. `messageFeuille` : `PERDU` → `ERR-010` ; `DRIVE_PLEIN` → `ERR-011` ; `DONNEES_ABSENTES` → `ERR-012` ; `FORMAT_PLUS_RECENT` → `ERR-013` ; `ECHEC_PERSISTANT` → `ERR-016` ; `SYN-SESSION` → `ERR-015`.

`construireBandeau(e, maintenant)` : `depasse = e.enAttente > 0 et e.plusAncienneEnAttente défini et maintenant − plusAncienne > SEUIL_RAPPEL_HORS_LIGNE` (strict).
1. `acces = PERDU` → `BAN-ACCES-GOOGLE`, action `SE_RECONNECTER`, non fermable, message `ERR-010` ; si `depasse` : variante `24H` et `n = enAttente`.
2. `actionRequise = FORMAT_PLUS_RECENT` → `BAN-CONSULTATION-SEULE`, action `METTRE_A_JOUR`, non fermable, `n` si > 0, message `ERR-013`.
3. `depasse` et non `rappelMasque` → `BAN-RAPPEL-24H`, `n = enAttente`, fermable, message `ALR-002` ; si `selectionnerEtatIndicateur(e) = SYN-SESSION` (donc en ligne seulement) : variante `session`, action `REPRENDRE_LA_SYNCHRONISATION` ; hors ligne, rappel ordinaire.
4. sinon `undefined`.

### 6.10 `ReprendreSession.executer(reprise)` (DAT §4.1.6 bis, v0.11.3 §4.1.7)
```text
1. etat ← session.etat() ; si etat.type ≠ OUVERTE : Echec(SansSession)
2. si réseau coupé : Echec(HorsLigne) (aucune demande ; l'indicateur est alors SYN-HORS-LIGNE, §6.9)
3. mode ← etat.acces = PERDU ? RECONNEXION_GESTE : RENOUVELLEMENT_GESTE
4. r ← fournisseur.demanderJeton({ mode, portees: PORTEES_LOT_1, indice: etat.identite.adresse, reprise,
                                   redirectionPermise: non gardeSaisie.saisieEnCours() })
5. ACCES_OBTENU → si session mémorisée avec accesPerdu : memoireSession.ecrire({ identite, accesPerdu: false }) ;
                  session.changerAcces(VALIDE) ; ACCES_RENOUVELE
   REDIRECTION_LANCEE → session.attendreGoogle(identite) ; REDIRECTION_LANCEE
   Echec RedirectionNonPermise → SAISIE_A_TERMINER, rien ne change (message : Q-ST022-STE-4)
   Echec e → acces ← accesApresRetour({ avant: etat.acces, issue: issueDe(e), origine: GESTE })
             acces = PERDU et avant ≠ PERDU → memoireSession.ecrire({ …, accesPerdu: true }) ; changerAcces ; ACCES_PERDU
             sinon : changerAcces(acces) si différent ; INCHANGE
```
Au retour d'un repli interactif, `OuvrirApplication` traite le retour (§6.2, origine `GESTE`) : `access_denied` → accès perdu ; toute autre erreur → `A_RENOUVELER` (`SYN-SESSION`), sauf si l'accès était déjà perdu (règle du §6.3, Q-ST022-STA-4).

### 6.11 `GestionEspacesIndexedDb.supprimer` (DAT v0.11.4 §4.1.6, RL-LOT-001-A1)
```text
si une demande de suppression de ce compte est en cours : attendre son issue, au plus DELAI_SUPPRESSION_BLOQUEE (5 s)
sinon : surFermeture() (ferme l'espace de cet onglet) ; demande ← fabrique.deleteDatabase(nomEspace(env, compte))
        issue ← course(succès de la demande, planificateur.apres(5 s))
        succès → Succes ; erreur → EspaceInaccessible ; échéance → SuppressionBloquee (la demande reste mémorisée et en cours)
```
Les autres onglets coopérants ferment leur connexion sur `versionchange` (§5.2) : la suppression aboutit sans attendre. Seule une connexion qui ne réagit pas (ancienne version de l'application, onglet gelé) la bloque.

## 7. Intégration Google

| Opération | Portée | Données | Idempotence | Erreurs |
|---|---|---|---|---|
| GIS `initTokenClient` | `openid email …/drive.file` | `client_id`, `scope`, `login_hint` (sauf première connexion) | — | §6.4 |
| Redirection `GET https://accounts.google.com/o/oauth2/v2/auth` | idem | `client_id`, `redirect_uri`, `response_type=token`, `scope`, `include_granted_scopes=true`, `login_hint`, `state` ; `prompt=none` à l'ouverture seulement (repli d'un geste et web-ios : `prompt` absent) | `state` à usage unique ; une redirection par ouverture, une par geste | RED-03, DAT v0.11.3 §4.1.7 |
| `GET https://openidconnect.googleapis.com/v1/userinfo` | `openid email` | Lit `sub`, `email` | Lecture | `NonAutorise` → `SessionARenouveler` |
| `GET drive/v3/files?q=…` puis `POST drive/v3/files` | `drive.file` | Dossier (§5.3) | Recherche avant création | §6.8 |

Nouvelle portée : non. Aucun événement d'agenda.

## 8. Gestion des erreurs

| # | Situation | Détection | Erreur | Comportement | Code | Journal | Test |
|---|---|---|---|---|---|---|---|
| 1 | Connexion sans réseau | `SeConnecter` | `ConnexionImpossible` | Rien n'est créé | `ERR-003` / `ERR-004` | `info` | UT-US-022-23 |
| 2 | Fenêtre GIS fermée | `FournisseurAuthWeb` | `ConnexionAnnulee` | Reste sur ECR-010 ; en reprise : état inchangé | `ERR-001` | `info` | UT-US-022-21 |
| 3 | Portées partielles | idem | `PorteeInsuffisante` | Connexion : `ERR-002` ; reprise : `PERDU` | `ERR-002` / `BAN-ACCES-GOOGLE` | `avertissement` | UT-US-022-22, 15 |
| 4 | Réseau coupé pendant la connexion, Drive momentanément indisponible | `SeConnecter`, `PreparationDossierDrive` | `ConnexionImpossible` | Nouvel essai possible | `ERR-005` | `avertissement` : statut | UT-US-022-24, 27 |
| 5 | Drive désactivé pour le compte | `ClientGoogle` (403) | `DriveIndisponiblePourLeCompte` | Aucune fonction | `ERR-006` | `avertissement` | UT-US-022-06 |
| 6 | Retour `prompt=none` en erreur d'interaction | `recevoirRetour` | `SessionARenouveler` | `SYN-SESSION`, aucune nouvelle redirection | `SYN-SESSION`, `ERR-015` | `info` : code | UT-US-022-33 |
| 7 | Erreur de configuration OAuth | idem | `ConfigurationOAuthInvalide` | Comme 6 ; anomalie | `SYN-SESSION` | `erreur` : code Google seul | UT-US-022-34 |
| 7 b | Repli de GIS nécessaire alors qu'une saisie est en cours | `FournisseurAuthWeb` (`redirectionPermise` faux) | `RedirectionNonPermise` | Aucune navigation ; `SAISIE_A_TERMINER` ; état inchangé | Q-ST022-STE-4 | `info` | UT-US-022-54 |
| 7 d | Suppression bloquée par une autre fenêtre | `GestionEspacesIndexedDb` (5 s) | `SuppressionBloquee` | `SUPPRESSION_BLOQUEE` ; « Réessayer » / « Aller à la connexion » | `ERR-017` | `avertissement` | UT-US-022-57, 61 |
| 7 e | Aucun retour de Google 10 s après le départ de la redirection d'ouverture | Composition (`Planificateur`) | — | `abandonnerAttenteGoogle` : ouverture sans jeton, sans boucle | `SYN-SESSION`, `ERR-015` | `avertissement` | UT-US-022-58 |
| 7 c | Base technique indisponible | `MemoireRedirectionDexie` | `MemoireTechniqueIndisponible` | Aucune redirection ; ouverture sans jeton | `SYN-SESSION` (en ligne) | `avertissement` | Intégration de la base technique (§14) |
| 8 | `state` absent, inconnu, rejoué, expiré | `verifierRetour` | `RetourRedirectionRejete` | Jeton ignoré | `SYN-SESSION` | `avertissement` : motif | UT-US-022-18, 19 |
| 9 | Jeton d'un autre compte | `FournisseurAuthWeb` | `CompteDifferent` | Jeton jeté | `SYN-SESSION` | `avertissement` | UT-US-022-36 |
| 10 | 401 d'une API Google | `SignalerRefusJeton` | — | `A_RENOUVELER` ou `PERDU` (§6.3) | `SYN-SESSION` / `BAN-ACCES-GOOGLE` | `info` | UT-US-022-16, 17, 25, 26 |
| 11 | Base technique indisponible | adaptateurs Dexie | `MemoireTechniqueIndisponible` | Pas de redirection ; ouverture sans jeton | `SYN-SESSION` | `erreur` | UT-US-022-38 |
| 12 | Espace local inaccessible | `GestionEspaces` | `EspaceInaccessible` | Écran de connexion | `ERR-014` | `erreur` | UT-US-022-39 |

Nouvelle tentative : §6.8.

## 9. Patterns imposés

| Pattern | Où | Pourquoi |
|---|---|---|
| Fonction pure de décision | `deciderOuverture`, `accesApresRetour`, `qualifierRefusJeton`, `motifEchecConnexion`, sélections de l'indicateur et du bandeau | Tables du §6, testées cas par cas |
| Stratégie par mode | `FournisseurAuthWeb` | Un seul point de choix GIS ou redirection (§6.4) |
| Port interne | `MemoireRedirection`, `PasserelleGis` | Support et script Google isolés |
| Observateur | `SessionCourante`, `AccesGoogle` | La synchronisation suit l'état de l'accès sans dépendre du contexte `compte` |

**Interdits** : importer `compte` depuis `synchronisation` (et l'inverse) ailleurs que dans la composition ; lire `location` ou `history` ailleurs que dans `retour-redirection.ts` ; toute redirection en cours de session hors du repli d'un geste ; tout jeton hors de `CoffreJetonsMemoire`.

## 10. Sécurité et données personnelles
- Données : `sub`, adresse (base technique) ; jeton (mémoire seulement, RED-05).
- RED-01 à RED-08 appliquées (`conventions.md` §9.2.1) ; `consommerRetourRedirection` est la première instruction de `main.tsx`, synchrone ; aucun module de `src/` n'a d'effet de bord à l'évaluation.
- Journal : jamais le fragment, le jeton, le `state`, `login_hint`, l'adresse ni le `sub` ; `masquerDonneesSensibles` en défense (UT-US-022-48).
- CSP (`index.html`) : `default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client; connect-src 'self' https://*.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com; style-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'self'; object-src 'none'`.
- OWASP : vérification du `state`, du compte (`CompteDifferent`) et des portées ; aucun secret client.

## 11. Exigences non fonctionnelles
| ENF | Exigence | Vérification |
|---|---|---|
| ENF-T-01 | Réouverture d'une session sans réseau sans aucun appel réseau bloquant | UT-US-022-11 ; S07 |
| — | Première connexion jusqu'à l'état vide < 10 s en 4G | Recette E14 |
| ENF-06 | Déconnexion et changement de compte sans perte | S08, S14 |

## 12. Step definitions Cucumber

### 12.1 Phrases (rang 1, sauf mention)
| # | Phrase | Mot-clé | Fichier | Nouveau / réutilisé | Implémentation |
|---|---|---|---|---|---|
| 1 | `l'utilisateur est connecté avec le compte {string} sur le {appareil}` | Étant donné | `compte/connexion.steps.ts` | Nouveau (contrat du socle §12 n° 7) | Crée l'appareil s'il manque ; `SeConnecter` avec le compte simulé ; `ServiceEtatLocal` ouvert sur l'espace |
| 2 | `l'utilisateur utilise le compte {string} sur le smartphone et sur le PC, tous deux à jour` | Étant donné | idem | Nouveau (rang 1 : connexion des deux ; rang 3 : échange jusqu'au repos) | |
| 3 | `l'application n'a jamais été utilisée sur le {appareil}` | Étant donné | `commun/appareils.steps.ts` | Nouveau | Appareil neuf (nouvelle `IDBFactory`, rien en mémoire technique) |
| 4 | `l'application est ouverte sur le {appareil}` ; `… fermée sur le {appareil}` | Étant donné | idem | Nouveau | `banc.ouvrirApplication` / `fermerApplication` |
| 5 | `l'utilisateur ouvre l'application sur le {appareil}` ; `…, connecté au réseau` | Quand | idem | Nouveau | Nouvelle instance de l'application ; `OuvrirApplication` ; achève la redirection selon §12.3 ; capture l'instantané d'ouverture |
| 6 | `l'utilisateur ferme l'application sur le smartphone` | Quand | idem | Nouveau | Abandon de l'instance (mémoire perdue) |
| 7 | `l'utilisateur se connecte avec le compte {string} sur le {appareil}` | Quand | `compte/connexion.steps.ts` | Nouveau | `SeConnecter` ; échec si refus |
| 8 | `l'utilisateur tente de se connecter avec le compte {string} sur le {appareil}` ; `… et annule la connexion` ; `… et refuse les autorisations demandées` | Quand | idem | Nouveau | Configure `FauxFournisseurAuth` puis `SeConnecter` ; mémorise le résultat |
| 9 | `la connexion échoue avec le motif {string}` | Alors | idem | Nouveau | Dernier résultat = `ConnexionImpossible` du motif |
| 10 | `seule l'invitation à se connecter à Done Juan avec un compte Google est proposée` | Alors | idem | Nouveau | `construireRacine` = `CONNEXION` et `construireEcranConnexion().action` ∈ {`CONTINUER_AVEC_GOOGLE`, `REESSAYER`} |
| 11 | `aucune autre fonction n'est accessible` ; `aucune donnée n'est affichée` | Alors | idem | Nouveau | Racine `CONNEXION` (aucun modèle de vue de données n'est construit par l'application de l'appareil) |
| 12 | `le message d'erreur {string} explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application` | Alors | idem | Nouveau | `message.code` = code ; texte = `libelle(code)` (CA-4) |
| 13 | `l'utilisateur peut réessayer` | Alors | idem | Nouveau | `actionActive` vrai |
| 14 | `aucune donnée n'est créée sur le {appareil}` | Alors | idem | Nouveau | `existeUnEspace()` faux et session mémorisée absente |
| 15 | `aucune donnée n'est créée dans le Drive du compte {string}` | Alors | `synchronisation/drive.steps.ts` | Nouveau | `FauxGoogle.drive(compte).fichiers()` vide |
| 16 | `le Drive du compte {string} contient un dossier visible nommé {string}` | Alors | idem | Nouveau | Dossier non supprimé de ce nom |
| 17 | `le Drive du compte {string} ne contient aucune donnée de l'application` ; `que le Drive est momentanément indisponible` ; `que le Drive est désactivé pour le compte {string}` ; `que le réseau du smartphone est coupé pendant la connexion` | Étant donné | `drive.steps.ts`, `commun/reseau.steps.ts` | Nouveau | Pilotage `FauxDrive` (5xx persistants ; 403 `domainPolicy`) et `FauxFournisseurAuth` (coupure pendant la connexion) |
| 18 | `que le {appareil} est sans réseau` ; `le réseau revient sur le {appareil}` | Étant donné / Quand | `commun/reseau.steps.ts` | Nouveau (rang 1 ; au rang 3, le retour déclenche le cycle) | `ReseauSimule` |
| 19 | `les autorisations demandées au compte Google sont exactement : identification du compte, accès aux fichiers de l'application dans le Drive` ; `aucun accès à l'agenda n'est demandé` | Alors | `compte/connexion.steps.ts` | Nouveau | Portées observées par `FauxFournisseurAuth` ; `openid` et `email` ↦ « identification du compte », `drive.file` ↦ « accès aux fichiers de l'application dans le Drive » ; aucune portée contenant `calendar` |
| 20 | `sur le {appareil}, l'utilisateur se déconnecte` | Quand | idem | Nouveau | `evaluer` puis, s'il le faut, `executer` |
| 21 | `sur le {appareil}, l'utilisateur demande à se déconnecter` | Quand | idem | Nouveau | `evaluer` ; sans confirmation → `executer` ; sinon commande en attente |
| 22 | `l'utilisateur est déconnecté sans confirmation` | Alors | idem | Nouveau | Dernière évaluation `SANS_CONFIRMATION` et racine `CONNEXION` |
| 23 | `une confirmation est demandée, qui annonce {int} modification(s) enregistrée(s) dans le Drive à la prochaine connexion sur cet appareil` | Alors | `commun/confirmations.steps.ts` | Nouveau | Commande en attente `CNF-DECONNEXION`, `n` |
| 24 | `sur le {appareil}, l'utilisateur demande la suppression des données de cet appareil` | Quand | `compte/connexion.steps.ts` | Nouveau | `evaluer` ; commande en attente « confirmer » |
| 25 | `une confirmation est demandée, qui précise que les données restent dans le Drive` ; `une confirmation explicite est demandée, qui annonce que {int} modification(s) seraient perdues` | Alors | `confirmations.steps.ts` | Nouveau | `CNF-SUPPR-DONNEES` ; `CNF-SUPPR-DONNEES-PERTE` et `n` |
| 26 | `l'utilisateur confirme` ; `l'utilisateur renonce` | Quand | `confirmations.steps.ts` | Réutilisé (socle), **étendu** | Si `executer` renvoie une suite `CONFIRMATION_REQUISE`, la nouvelle commande devient la commande en attente (§12.3) |
| 27 | `les actions de compte proposées sur le smartphone sont exactement {string} et {string}` | Alors | `connexion.steps.ts` | Nouveau | `construireSectionCompte().actions` ↦ libellés « Se déconnecter », « Supprimer les données de cet appareil » |
| 28 | `les données du compte {string} sont toujours présentes sur le smartphone` ; `…, y compris {int} modification(s) en attente` ; `… ne sont plus présentes …` | Alors | idem | Nouveau | Ouverture en lecture de l'espace `nomEspace(env, compte)` dans l'`IDBFactory` de l'appareil ; décompte du socle |
| 29 | `que les données du compte {string} sont conservées sur le smartphone, avec {int} modification(s) en attente` | Étant donné | idem | Nouveau (rang 2) | Connexion du compte, hors ligne, `n` objectifs créés (`CreerObjectif`, intitulés « Préparation 1 » à « n »), déconnexion confirmée |
| 30 | `que sur le {appareil}, {int} modification(s) ne sont pas encore enregistrées dans le Drive` ; `qu'aucune modification n'est en attente sur le {appareil}` | Étant donné | `synchronisation/echanges.steps.ts` | Nouveau (rang 2 pour n > 0) | `n` objectifs créés comme au n° 29, sans dépôt ; vérifie le décompte |
| 31 | `que sur le smartphone, l'utilisateur a supprimé les données de cet appareil` | Étant donné | `connexion.steps.ts` | Nouveau | `evaluer`, `confirmer` ; exige `SUPPRIMEES` |
| 32 | `que l'accès au compte Google {string} a été retiré sur le {appareil}` | Étant donné | idem | Nouveau | `FauxGoogle` : accès retiré ; `SignalerRefusJeton` avec un jeton non échu (constaté) |
| 33 | `l'accès au compte Google {string} est retiré depuis le compte Google` | Quand | idem | Nouveau | `FauxGoogle` : accès retiré, non constaté |
| 34 | `que la session Google du {appareil} a expiré` ; `que la session Google du navigateur du PC a expiré` ; `… est active` ; `la session Google du {appareil} expire` ; `la session Google du navigateur du PC expire` | Étant donné / Quand | idem | Nouveau | Expire le jeton (échéance atteinte) et marque le retour de la prochaine redirection d'ouverture « différé » (§12.3) ; « est active » : rien |
| 35 | `que la redirection silencieuse vers Google échoue à l'ouverture sur le {appareil}` | Étant donné | idem | Nouveau | Retour `interaction_required` à la prochaine ouverture |
| 36 | `sur le {appareil}, l'accès à Google est renouvelé sans saisie` | Quand | idem | Nouveau | Livre le retour différé (jeton) ; échoue s'il n'y a pas de redirection en attente, ou si un geste, une saisie ou l'écran de connexion ont été demandés depuis l'ouverture |
| 37 | `sur le {appareil}, l'utilisateur fait le geste de reconnexion` ; `sur le {appareil}, l'utilisateur se reconnecte avec le compte {string}` | Quand | idem | Nouveau | `ReprendreSession` |
| 38 | `aucune connexion n'est demandée` ; `… avant d'afficher les données` | Alors | idem | Nouveau | Depuis l'ouverture : racine jamais `CONNEXION` et aucune demande `CONNEXION`, geste ni saisie observée par `FauxFournisseurAuth`. La racine `ATTENTE_GOOGLE` (`SYN-REDIRECTION`) n'est **pas** une demande de connexion : l'étape passe pendant le passage par Google (glossaire v1.10 §12, DEC-038) ; les données ne sont vérifiées qu'après, par ST-US-017 §12.1 n° 10, qui échoue tant que la racine est `ATTENTE_GOOGLE` (RL-LOT-001-P2) |
| 39 | `l'indicateur de synchronisation est {string}, avec l'action {string}` ; `… n'est plus {string}` ; `… est {string}` ; `… n'est pas {string}` ; `… est toujours {string}` | Alors | `synchronisation/etat-affiche.steps.ts` | Nouveau | `construireIndicateur(consulterEtatSynchronisation())` ; action « Reprendre la synchronisation » ↦ `REPRENDRE_LA_SYNCHRONISATION` |
| 40 | `le bandeau {string} est affiché, avec l'action {string}` ; `… n'est pas affiché` ; `aucun bandeau n'est affiché` ; `un seul bandeau est affiché` | Alors | idem | Nouveau | `construireBandeau(…, horloge.maintenant())` |
| 41 | `que le Drive du compte {string} contient un objectif {string} de délai {date} enregistré par le PC` | Étant donné | `drive.steps.ts` | Nouveau (rang 3) | ST-US-017 |
| 42 | `l'application propose de créer un premier objectif et d'ajouter une première tâche` ; `aucun objectif et aucune tâche n'existent` | Alors | `connexion.steps.ts` | Nouveau (rang 5) | `EVD-BIENVENUE` (ST-US-002) ; requêtes des objectifs et des tâches vides |
| 43 | `aucune donnée du compte {string} n'est accessible` ; `le Drive du compte {string} ne contient aucune donnée du compte {string}` ; `le Drive du compte {string} contient l'objectif {string}` (et `… avec le délai {date}`) ; `aucune écriture n'a été faite dans le Drive par le smartphone` | Alors | `connexion.steps.ts`, `drive.steps.ts` | Nouveau (rangs 3 et 11) | ST-US-017 §12 |
| 44 | `aucun avertissement de Google du type « application non validée » n'est présenté` | Alors | — | `@recette` (aucune définition) | Recette E14 : écran de consentement observé à la main |

Étapes réutilisées : `nous sommes le …` (socle) ; `un objectif … de délai …`, `l'objectif … existe …`, `… crée un objectif …`, `… modifie le délai de l'objectif …`, `aucun objectif n'existe`, `l'opération est acceptée` (ST-US-001, ST-US-024) ; `… porte la mention "MEN-ATTENTE"`, `le smartphone échange …`, `le smartphone enregistre …` (ST-US-017).

### 12.2 Scénarios par rang (liste nominative, à reporter dans `rangs-scenarios.json`)
- Rang 1 : S01, S05, S06, S09b, S13a, S20a, S20b, S20c, S21, S22.
- Rang 2 : S02, S07, S09a, S10, S16, S17a, S17b, S19, S23.
- Rang 3 : S03, S08, S09c, S09d, S11, S12, S14, S15, S18, S23b.
- Rang 5 : S04.
- Rang 11 : S24, S25.
- Recette (E14) : S13b.

### 12.3 Banc, monde et doublures
- **`FauxGoogle`** (partagé par le banc) : comptes simulés par nom (« A », « B », « C ») avec `sub` (`sub-A`…) et adresse (`a@exemple.test`…) fictifs ; par compte : accès accordé ou retiré, Drive (`FauxDrive`).
- **`FauxFournisseurAuth`** (par appareil, implémente `FournisseurAuth`) : demandes observées (mode, portées, indice) ; `CONNEXION` → accès obtenu, ou `ConnexionAnnulee`, `PorteeInsuffisante`, `ReseauIndisponible` selon la configuration ; `RENOUVELLEMENT_OUVERTURE` → `REDIRECTION_LANCEE`, puis le banc **achève** la redirection : retour immédiat en succès (session active), immédiat en erreur `interaction_required` (« redirection en échec »), ou **différé** jusqu'à l'étape n° 36 (« session a expiré ») ; gestes → accès obtenu (en mémoire, comme GIS), ou `AccesGoogleRevoque` si l'accès est retiré et que le mode est `RENOUVELLEMENT_GESTE` (le banc ne simule pas le repli interactif, couvert par les tests unitaires de `FournisseurAuthWeb`) ; `RECONNEXION_GESTE` → réaccorde l'accès puis accès obtenu. Compteurs : redirections automatiques par ouverture (RED-08), gestes, demandes `CONNEXION`.
- **Appareil simulé et `appareilId`** : l'espace de chaque appareil simulé est ouvert par `DepotLocalDexie.ouvrirEspace` avec un `GenerateurIdentifiantsSequentiel` au préfixe de l'appareil ; le banc lit l'`appareilId` par `appareil()` et l'utilise pour `FauxDrive.transportPour`. Après « Supprimer les données de cet appareil » puis reconnexion, l'appareil simulé a donc un nouvel identifiant (S15, S18).
- **Achever une redirection** = abandonner l'instance de l'application de l'appareil et en créer une nouvelle (même `IDBFactory`) avec le retour correspondant, comme un rechargement de page.
- **Commandes en attente** (`tests/support/commandes-en-attente.ts`, extension compatible) : `executer()` peut renvoyer `Succes({ type: 'CONFIRMATION_REQUISE', suite: CommandeEnAttente })` ; « l'utilisateur confirme » remplace alors la commande en attente par `suite`.
- **Monde** : `instantaneOuverture` par appareil (racine et nombre de réponses du `FauxDrive` à cet appareil au moment de l'ouverture, pour ST-US-017) ; `globalThis.fetch` remplacé dans le hook `Before` par un enregistreur qui échoue (aucune requête réelle ; « aucune donnée transmise ailleurs que dans le Drive »).
- **`PlanificateurSimule`** : `attendre` se résout quand le temps du banc avance ; `banc.executerEnLaissantPasserLeTemps(promesse)` avance le temps d'échéance en échéance jusqu'au règlement de la promesse (100 itérations au plus), utilisé par les étapes de connexion (reprises du §6.8).

Scénarios `@ihm` : aucun. Scénario `@recette` : S13b (mode opératoire : compte de recette, « Supprimer l'accès » préalable, connexion sur le téléphone, noter les écrans ; résultat attendu : aucun écran « Google n'a pas validé cette application »).

## 13. Tests unitaires fournis (E10)

Raison d'échec en phase rouge : « NI » (`ErreurNonImplementee` des squelettes). Fichiers sous `tests/unitaires/` (miroir de `src/`).

| Id | Fichier | Élément | Cas | Exigence |
|---|---|---|---|---|
| UT-US-022-01 | `compte/domaine/portees.test.ts` | `PORTEES_LOT_1` | exactement `openid`, `email`, `drive.file`, aucune portée d'agenda | CA-8, ENF-05 |
| UT-US-022-02 | idem | `porteesManquantes` | `userinfo.email` vaut `email` ; toutes accordées → vide | DS-05 |
| UT-US-022-03 | idem | `porteesManquantes` | `drive.file` refusée → `[drive.file]` | CA-4 |
| UT-US-022-04 | `compte/domaine/motif-connexion.test.ts` | `motifEchecConnexion` | hors ligne sans espace → `ERR-003` ; avec espace → `ERR-004` | S20a, S22, S18 |
| UT-US-022-05 | idem | idem | annulée → `ERR-001` ; portées refusées → `ERR-002` | CA-4 |
| UT-US-022-06 | idem | idem | interrompue et Drive momentanément indisponible → `ERR-005` ; Drive indisponible pour le compte → `ERR-006` | S20b, S20c, S21 |
| UT-US-022-07 | `compte/domaine/identite.test.ts` | `IdCompte.depuisSub`, `AdresseGoogle.depuisTexte` | refus du vide, des espaces, d'une adresse sans « @ » ; acceptation des valeurs ordinaires | conventions §9.2 |
| UT-US-022-08 | `compte/domaine/ouverture.test.ts` | `deciderOuverture` | sans session → `ECRAN_CONNEXION`, même avec un retour | RG-019 |
| UT-US-022-09 | idem | idem | retour présent → `TRAITER_RETOUR`, réseau coupé compris | RED-08 |
| UT-US-022-10 | idem | idem | réseau connecté, sans retour ni départ → `REDIRECTION_SILENCIEUSE` | DAT §4.1.7 |
| UT-US-022-11 | idem | idem | réseau coupé → `OUVRIR_SANS_JETON` | ENF-T-01 |
| UT-US-022-12 | idem | idem | départ en attente sans retour → `OUVRIR_SANS_JETON` | EC-5, EC-8 |
| UT-US-022-13 | `compte/domaine/acces.test.ts` | `accesApresRetour` | jeton → `VALIDE` quel que soit l'état | RG-017 |
| UT-US-022-14 | idem | idem | erreur d'interaction : `A_RENOUVELER` → `A_RENOUVELER`, `PERDU` → `PERDU` | DAT §4.1.6 bis a |
| UT-US-022-15 | idem | idem | portées partielles → `PERDU` ; `access_denied` après geste → `PERDU`, à l'ouverture → `A_RENOUVELER` | ADR-013, EC-7 |
| UT-US-022-16 | idem | `qualifierRefusJeton` | échéance absente ou atteinte, ou à moins de 60 s → `A_RENOUVELER` | DAT §4.1.6 bis |
| UT-US-022-17 | idem | idem | à 60 s + 1 ms de l'échéance → `PERDU` ; à 60 s exactement → `A_RENOUVELER` | DAT §4.1.6 bis |
| UT-US-022-18 | `compte/infrastructure/auth/verification-retour.test.ts` | `verifierRetour` | `state` absent, inconnu, sans départ → rejet avec le motif | RED-03 |
| UT-US-022-19 | idem | idem | expiré à 10 min + 1 ms → rejet ; accepté à 10 min exactement | RED-03 |
| UT-US-022-20 | `compte/infrastructure/auth/retour-redirection.test.ts` | `consommerRetourRedirection` | efface le fragment **avant** l'analyse (ordre des appels), dans tous les cas (jeton, erreur, mal formé, vide) ; renvoie le retour analysé | RED-02 |
| UT-US-022-21 | `compte/application/se-connecter.test.ts` | `SeConnecter` | fenêtre fermée → `ERR-001`, aucune session ni espace | CA-4, S06 |
| UT-US-022-22 | idem | idem | portées partielles → `ERR-002`, jeton oublié | CA-4 |
| UT-US-022-23 | idem | idem | hors ligne → `ERR-003`, aucune demande de jeton | S20a |
| UT-US-022-24 | idem | idem | Drive momentanément indisponible → `ERR-005`, aucun espace ouvert | S20c |
| UT-US-022-25 | `compte/application/signaler-refus-jeton.test.ts` | `SignalerRefusJeton` | jeton non échu → `PERDU`, mémorisé, coffre vidé | DAT §4.1.6 bis |
| UT-US-022-26 | idem | idem | jeton échu → `A_RENOUVELER`, rien de mémorisé | idem |
| UT-US-022-27 | `synchronisation/application/preparation-dossier-drive.test.ts` | `PreparationDossierDrive` | 3 échecs 5xx → `DriveMomentanementIndisponible` après deux attentes ; succès à la 2e tentative ; `DriveIndisponible` sans reprise | S20c, S21 |
| UT-US-022-28 | `compte/application/se-deconnecter.test.ts` | `evaluer` | rien en attente → sans confirmation, sans dépôt | S09b |
| UT-US-022-29 | idem | `evaluer` | 2 en attente, dépôt qui en laisse 2 → `CNF-DECONNEXION` n = 2 ; dépôt complet → sans confirmation | S09c, S09d |
| UT-US-022-30 | idem | `executer` | jeton oublié, session mémorisée effacée, espace fermé **non supprimé** | RG-043 |
| UT-US-022-31 | `compte/application/supprimer-donnees-appareil.test.ts` | `confirmer` | dépôt impossible avec 3 en attente → `CNF-SUPPR-DONNEES-PERTE` n = 3, rien supprimé | S17a, S17b |
| UT-US-022-32 | idem | `confirmer`, `confirmerPerte` | rien en attente → espace du compte supprimé, session fermée ; autre compte intact | S15, S19 |
| UT-US-022-33 | `compte/application/ouvrir-application.test.ts` | `OuvrirApplication` | retour `interaction_required` → session ouverte `A_RENOUVELER`, aucune redirection | S23, RED-08 |
| UT-US-022-34 | idem | idem | retour `redirect_uri_mismatch` → `A_RENOUVELER`, journal `erreur` avec le seul code | conventions §8.3 |
| UT-US-022-35 | idem | idem | réseau connecté, session en cache → `REDIRECTION_LANCEE`, demande `RENOUVELLEMENT_OUVERTURE` avec `login_hint` | DAT §4.1.7 |
| UT-US-022-36 | idem | idem | retour d'un jeton → `VALIDE`, reprise restituée ; `accesPerdu` remis à faux | CA-5 |
| UT-US-022-37 | `compte/infrastructure/espaces/nom-espace.test.ts` | `nomEspace` | `donejuan-recette-` + SHA-256 hexadécimal du `sub` ; ne contient pas le `sub` | conventions §9.3 |
| UT-US-022-38 | `compte/application/ouvrir-application.test.ts` | idem | session absente → `ECRAN_CONNEXION`, départ consommé | RG-019 |
| UT-US-022-39 | idem | idem | accès perdu mémorisé, réseau coupé → session `PERDU` | RG-035 |
| UT-US-022-40 | `compte/presentation/ecran-connexion.test.ts` | `construireEcranConnexion` | sans échec : deux portées annoncées, « Continuer avec Google » | CA-1, CA-8 |
| UT-US-022-41 | idem | idem | `ERR-001` et `ERR-002` : même texte ; `ERR-003`/`004`/`005` → « Réessayer » ; `ERR-006` → « Choisir un autre compte » | guide §6.6.8 |
| UT-US-022-42 | `compte/presentation/section-compte.test.ts` | `construireSectionCompte` | exactement `SE_DECONNECTER`, `SUPPRIMER_DONNEES` | CA-6, CA-10 |
| UT-US-022-43 | `compte/infrastructure/auth/url-autorisation.test.ts` | `construireUrlAutorisation`, `encoderBase64Url` | paramètres exacts en `SILENCIEUSE` (`prompt=none`, `login_hint`, `include_granted_scopes`, `response_type=token`) ; en `INTERACTIVE`, mêmes paramètres sans `prompt` ; base64url sans `+`, `/`, `=` | DAT v0.11.3 §4.1.7 |
| UT-US-022-44 | `synchronisation/presentation/indicateur-synchronisation.test.ts` | `selectionnerEtatIndicateur` | ordre de gravité complet, cas par cas ; accès à renouveler hors ligne → `SYN-HORS-LIGNE` (ou `SYN-RETENTATIVE`) | conventions §8.5, Q-ST022-STE-3 |
| UT-US-022-45 | idem | `construireIndicateur` | `SYN-SESSION` porte l'action et `ERR-015`, jamais hors ligne ; `aLire` absent à 0 ; `SYN-INFO` seulement à la place de `SYN-OK` | Q-US-017-6 |
| UT-US-022-46 | `synchronisation/presentation/bandeau.test.ts` | `construireBandeau` | accès perdu : variante `24H` seulement au-delà de 24 h strictes ; un seul bandeau | RG-057 c, DEC-025 |
| UT-US-022-47 | idem | idem | rappel : absent à 24 h exactement, présent à 24 h + 1 min, absent si masqué ou sans attente ; variante `session` en `SYN-SESSION` (en ligne), rappel ordinaire hors ligne ; consultation seule prioritaire | RG-057 a, b, RG-058 |
| UT-US-022-48 | `commun/infrastructure/journal-technique-local.test.ts` | `masquerDonneesSensibles` | `ya29.`, `Bearer`, `access_token=`, adresse e-mail masqués | conventions §9.4 |
| UT-US-022-49 | `infrastructure-google/reprise.test.ts` | `delaiAvantTentative` | 1 s, 2 s, 4 s…, plafond 5 min, gigue entre 50 % et 100 % | DAT §4.4.5 |
| UT-US-022-50 | `infrastructure-google/client-google.test.ts` | `traduireReponse` | table du §6.8 | DAT §4.4.5 |
| UT-US-022-51 | `compte/infrastructure/auth/strategie-geste.test.ts` | `mecanismeGeste` | `web` → GIS ; `web-ios` → redirection interactive d'emblée | DAT v0.11.3 §4.1.7 |
| UT-US-022-52 | idem | `suiteErreurGis` | repli interactif pour script indisponible avec réseau, `popup_failed_to_open`, erreur inconnue ; script indisponible hors ligne → `ReseauIndisponible` ; `popup_closed` → `ConnexionAnnulee` ; `access_denied` → `AccesGoogleRevoque` | Q-ST022-STA-2 |
| UT-US-022-53 | `compte/application/reprendre-session.test.ts` | `ReprendreSession` | demande `RENOUVELLEMENT_GESTE` avec `login_hint` et `redirectionPermise` → `VALIDE` ; après `PERDU` : `RECONNEXION_GESTE`, `accesPerdu` effacé | RG-017, RG-035 |
| UT-US-022-54 | idem ; `compte/presentation/retour-reprise.test.ts` | idem ; `construireRetourReprise` | toast `TST-SAISIE-A-TERMINER` pour `SAISIE_A_TERMINER` (RL-S6) ; saisie en cours → `redirectionPermise` faux, `RedirectionNonPermise` → `SAISIE_A_TERMINER`, état inchangé ; `access_denied` → `ACCES_PERDU` mémorisé ; fenêtre fermée → `INCHANGE` ; hors ligne → `HorsLigne` sans demande | Q-ST022-STA-1 |
| UT-US-022-56 | `compte/application/se-deconnecter.test.ts`, `supprimer-donnees-appareil.test.ts` | `SeDeconnecter.executer`, `SupprimerDonneesAppareil.confirmer` | ordre des appels : déconnexion `oublier → effacer → diffuser → fermer` ; suppression `effacer → diffuser → supprimer → oublier` | RL-LOT-001-A1 |
| UT-US-022-57 | `compte/application/supprimer-donnees-appareil.test.ts` | `confirmer`, `reessayer`, `fermerApresBlocage` | suppression bloquée → `SUPPRESSION_BLOQUEE`, ni jeton oublié ni session fermée ; « Réessayer » aboutit ; « Aller à la connexion » : jeton oublié, session fermée, aucune nouvelle demande | `ERR-017` |
| UT-US-022-58 | `compte/application/ouvrir-application.test.ts` | `abandonnerAttenteGoogle` | après 10 s sans retour : départ consommé, session sans jeton (`A_RENOUVELER` ou `PERDU`), aucune nouvelle redirection ; hors attente : `undefined` | RL-LOT-001-S6 |
| UT-US-022-59 | `compte/presentation/racine.test.ts` | `construireRacine` | sans session → `CONNEXION` ; attente → `SYN-REDIRECTION` et nom accessible ; ouverte → `APPLICATION` | RL-LOT-001-S5, CA-1 |
| UT-US-022-60 | `tests/integration/compte/gestion-espaces-indexeddb.test.ts` | `GestionEspacesIndexedDb.supprimer`, `DepotLocalDexie` (`surFermetureImposee`) | deux connexions : l'autre se ferme sur `versionchange`, n'est jamais rouverte (`EspaceLocalNonOuvert`), la base n'est pas recréée | RL-LOT-001-A1 |
| UT-US-022-61 | idem | idem | connexion qui ne se ferme pas : `SuppressionBloquee` après 5 s, base intacte ; nouvel appel → aboutit à la fermeture | RL-LOT-001-A1, `ERR-017` |
| UT-US-022-55 | `tests/integration/synchronisation/depot-local-dexie-espace.test.ts` | `DepotLocalDexie.ouvrirEspace` | base neuve → `appareilId` généré, relu à la réouverture sans nouvel appel ; base supprimée puis rouverte → nouvel `appareilId` | Q-ST022-STA-3 |

**Précisions de l'E10 (2026-10-27)** — les squelettes font foi :
- `verifierRetour({ stateRecu, depart, maintenant })` renvoie `Resultat<DepartMemorise, MotifRejetRetour>` ;
- `NavigationRetour` est un type (`lireFragment`, `effacerFragment`), implémenté dans la composition ;
- `EcartTemps.depuisMillisecondes` (`commun/domaine/temps/ecart-temps.ts`) est livré complet : constructeur des constantes `MARGE_ECHEANCE_JETON`, `VALIDITE_STATE_REDIRECTION`, `DELAI_INITIAL_REPRISE`, `PLAFOND_REPRISE` et de `parametres-synchronisation.ts` (livrées complètes) ;
- `ConfirmationCompte`, `EvaluationCompte`, `ErreurSansSession` : `src/compte/application/evaluation.ts` ; `REPRISE_ACCUEIL` : `memoire-redirection.ts` ;
- `delaiAvantTentative` arrondit à la milliseconde inférieure ; `TENTATIVES_AVANT_ABANDON` = 3 sert à la connexion et au cycle ;
- doublures livrées : `SourceAleatoireDeterministe` (complète), `PlanificateurSimule` (squelette documenté, avec `executerJusquAuReglement` et `attentesDemandees`) ; `tests/support/compte/doublures-compte.ts` (doublures simples des ports du compte, complètes).
Bilan : **60 cas** (UT-US-022-01 à 50, dont des cas multiples pour 12, 20, 24, 27, 43), tous en échec « NI ».

**Compléments de la v0.2 (2026-10-27)** : UT-US-022-43 (cas interactif), 44, 45, 47 (hors ligne) modifiés ; UT-US-022-51 à 55 ajoutés ; squelettes `strategie-geste.ts`, `garde-saisie.ts`, `ReprendreSession` (dépendance `gardeSaisie`), `DemandeJeton.redirectionPermise`, `ErreurAuth` `RedirectionNonPermise`, `ROUTE_REPRISE`, `DepotLocalDexie.ouvrirEspace` et `appareil()` ; `registre-appareil.ts` supprimé. Bilan : **70 cas**, tous en échec « NI ».

**Compléments de la v0.3 (E11, 2026-10-28)** : UT-US-022-35 attend `redirectionPermise: true` ; UT-US-022-54 complété (toast) ; UT-US-022-56 à 61 ajoutés ; squelettes `avis-onglets.ts`, `gestion-espaces-indexeddb.ts`, `racine.ts`, `retour-reprise.ts`, `DELAI_MAX_ATTENTE_REDIRECTION`, `DELAI_SUPPRESSION_BLOQUEE`, `SupprimerDonneesAppareil.reessayer` / `fermerApresBlocage`, `OuvrirApplication.abandonnerAttenteGoogle`, `DepotLocalDexie.fermer` et `surFermetureImposee`. Bilan : **80 cas**, tous en échec « NI ».

**Compléments de la v0.3, suite (Q-BEN-LOT001-8)** : suite de contrat `tests/contrats/fournisseur-auth.contrat.ts` (CT-AUTH-01 : connexion accordée ; 02 : fenêtre fermée, sans repli ; 03 : `drive.file` refusée ; 04 : mode autre que `CONNEXION` sans `login_hint` → `ErreurProgrammation` en rejet ; 05 : redirection d'ouverture puis retour accepté, reprise restituée ; 06 : retour sans départ → `SANS_DEPART` ; 07 : accès retiré → `AccesGoogleRevoque`, sans repli ; 08 : autre compte → `CompteDifferent` ; 09 : panne technique de GIS → une redirection interactive `REPLI_GESTE`, refusée si une saisie est en cours) et squelette `FauxFournisseurAuth`. 9 cas, rang 1, en échec « NI ».

Commande : `pnpm test -- tests/unitaires/compte tests/unitaires/synchronisation/presentation tests/unitaires/synchronisation/application/preparation-dossier-drive.test.ts tests/unitaires/infrastructure-google tests/unitaires/commun/infrastructure tests/integration/synchronisation/depot-local-dexie-espace.test.ts`.

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère |
|---|---|---|
| Intégration | Base technique Dexie (`fake-indexeddb`) : relecture Zod, durabilité stricte, `memoriser` résolu après `complete`, `consommer` toujours destructif, route hors `ROUTE_REPRISE` refusée, base indisponible → aucune redirection | Un test par adaptateur et par condition |
| Intégration | `GestionEspacesIndexedDb` : création, `existeUnEspace`, suppression sans toucher un autre espace | 3 cas (en plus d'UT-US-022-60 et 61) |
| Intégration | Base technique : `versionchange` sans réouverture, deux connexions | 1 cas |
| Intégration | `AvisOngletsBroadcast` : non reçu par l'émetteur, reçu par une autre instance | 1 cas |
| Contrat | `FournisseurAuth` : `FauxFournisseurAuth` et `FournisseurAuthWeb` (GIS et navigation doublés) | Suite `tests/contrats/fournisseur-auth.contrat.ts`, **livrée par Anthony en E11** (CT-AUTH-01 à 09, rang 1, Q-BEN-LOT001-8) : exécutée sur `FauxFournisseurAuth` (squelette `tests/doublures/faux-fournisseur-auth.ts`) ; Benjamin l'exécute aussi sur `FournisseurAuthWeb` par la fonction exportée `suiteContratFournisseurAuth(nom, fixture)` |
| Unitaires | `FournisseurAuthWeb` : repli par redirection **interactive** pour chaque erreur technique de GIS (URL sans `prompt`), une seule navigation par geste, aucun repli sur `popup_closed` ni `access_denied`, web-ios sans GIS, `redirectionPermise` faux → aucune navigation | Un test par code |
| Bout en bout | Au premier rendu, `location.hash` est vide (RED-02) | Playwright, rang 12 (service worker) |

## 15. Plan de réalisation
1. Rang 0 : outillage, CI, ports transverses et doublures, banc à deux appareils.
2. Domaine `compte` (UT 01 à 17).
3. Infrastructure d'authentification : retour, vérification, URL, stratégie du geste, `FournisseurAuthWeb`, base technique, espaces, `ouvrirEspace` (UT 18 à 20, 37, 43, 51, 52, 55).
4. Cas d'usage (UT 21 à 36, 38, 39, 53, 54) ; `ClientGoogle`, reprise, `PreparationDossierDrive`, `TransportSynchroDrive.preparerDossier` (UT 27, 49, 50).
5. Modèles de vue (UT 40 à 47) ; écrans.
6. Steps, doublures, composition `web.ts`, `main.tsx` ; DoD.

## 16. Dette, hypothèses et points ouverts

**Questions à Starck (architecture)** — Q-ST022-STA-1 à 3 répondues (DAT v0.11.3) et intégrées en v0.2 :
- **Q-ST022-STA-1 — Support du `state`.** RED-04 prévoit `sessionStorage`, sous réserve de M-RED. M-RED a été mesurée avec un `localStorage` (PoC), donc sans prouver que le retour a lieu dans le même contexte de navigation. Je retiens la base IndexedDB technique (alternative prévue par RED-04), qui sert aussi à sauvegarder l'état d'écran avant la redirection. Validez-vous ? a) oui ★ ; b) non, `sessionStorage` (le port `MemoireRedirection` isole le support : seul l'adaptateur change).
  - **Réponse de Starck (2026-10-27, DAT v0.11.3 §4.1.7) : validé, à trois conditions**, intégrées : écriture confirmée à `complete` avant la navigation (§4.3, §6.4) ; lecture destructive, base indisponible → aucune redirection (§5.1) ; reprise sans contenu métier (`ROUTE_REPRISE`) et saisie en cours protégée (`GardeSaisie`, §6.10).
- **Q-ST022-STA-2 — Repli de GIS sur la redirection.** D'après votre consigne relayée par Jarvis, la redirection `prompt=none` sert de repli « en cas d'erreur de GIS ». Je la déclenche pour les seules erreurs techniques : script indisponible avec réseau, `popup_failed_to_open`, type d'erreur inconnu ; jamais sur `popup_closed` (l'utilisateur a fermé la fenêtre) ni sur `access_denied` (accès perdu). Si ce repli revient en erreur d'interaction, l'application reste en `SYN-SESSION`, sans enchaîner de redirection interactive. Validez-vous cette liste et l'absence d'enchaînement ? a) oui ★ ; b) précisez.
  - **Réponse de Starck (2026-10-27) : liste validée, mode corrigé**, intégrée : le repli est une redirection **interactive** (`prompt` absent, `login_hint` présent), une seule par geste ; au retour, `access_denied` → accès perdu, toute autre erreur → `SYN-SESSION` ; web-ios : redirection interactive d'emblée (§6.4, §6.10).
- **Q-ST022-STA-3 — Appareil après « Supprimer les données ».** L'`appareilId` est propre à l'installation (DAT §4.1.4) et survit à la suppression : à la reconnexion, l'appareil lit son ancien fichier du Drive comme une source ordinaire, puis le réécrit. Confirmez-vous ? a) oui ★ ; b) un nouvel `appareilId` après la suppression (« comme un nouvel appareil »).
  - **Réponse de Starck (2026-10-27, DAT v0.11.3 §4.1.4) : b)**, intégrée : l'`appareilId` est dans l'espace du compte et naît avec lui ; `RegistreAppareil` supprimé ; la base technique ne le porte plus (§5.1, §5.2, §6.6).
- **Q-ST022-STA-4 (nouvelle, non bloquante) — Retour d'un repli interactif en erreur alors que l'accès était déjà perdu.** Votre réponse à Q-ST022-STA-2 : « toute autre erreur donne `SYN-SESSION` ». Le §6.3 (DAT §4.1.6 bis) dit qu'une erreur sans preuve ne transforme jamais un accès perdu en accès à renouveler. Après « Se reconnecter » (accès `PERDU`) suivi d'un repli revenu en `interaction_required`, je garde donc `PERDU` (bandeau « Se reconnecter »). a) garder `PERDU` ★ ; b) passer à `A_RENOUVELER` (`SYN-SESSION`).
  - **Réponse de Starck (E11, DAT v0.11.4 §4.1.7) : a) confirmé.** Le tableau du §6.3 est exact ; aucun changement.

**Questions à Steeve (ergonomie)** — Q-ST022-STE-1 à 3 répondues (guide v0.2.12) et intégrées :
- **Q-ST022-STE-1 — Écran d'attente de la redirection à l'ouverture** (ADR-013 le confie à Steeve) : code et texte ? Proposition : code `SYN-REDIRECTION`, texte « Connexion à Google… », sans action, logo de l'application.
- **Réponse de Steeve à Q-ST022-STE-1 (E9, 2026-10-27, guide v0.2.12 §6.6.2)** : code `SYN-REDIRECTION`, texte « Connexion à Google… », logo, aucune action ; nom accessible « Connexion à Google en cours » (`role="status"`) ; cadre « Attente » d'ECR-010.
- **Q-ST022-STE-2 — `SYN-SESSION` et `ERR-015` sur le smartphone** (DEC-034) : le catalogue indique « PC seulement » et « ce PC ». Proposition : même libellé et même bouton sur le smartphone ; textes de `ERR-015` et de `BAN-RAPPEL-24H` variante `session` paramétrés par `{appareil}` et `{autre appareil}`.
- **Réponse de Steeve à Q-ST022-STE-2 (E9, 2026-10-27, guide v0.2.12)** : oui, proposition retenue. `SYN-SESSION` : même libellé et même bouton sur smartphone (libellé visible « Reprendre la synchronisation » dans l'en-tête). `ERR-015` : titre « La session Google de cet appareil a expiré », texte avec `{appareil}` et `{autre appareil}` (§6.6.8) ; `BAN-RAPPEL-24H` variante `session` avec `{appareil}` (§6.6.3).
- **Q-ST022-STE-3 — `SYN-SESSION` hors ligne.** L'ordre de gravité fait passer `SYN-SESSION` avant `SYN-HORS-LIGNE` : hors ligne, l'indicateur propose « Reprendre la synchronisation », qui ne peut pas aboutir. a) garder l'ordre (conception actuelle) ; b) `SYN-HORS-LIGNE` tant que le réseau est coupé, `SYN-SESSION` au retour du réseau ★ (aucun scénario n'est touché).
- **Réponse de Steeve à Q-ST022-STE-3 (E9, 2026-10-27, guide v0.2.12 §6.6.2)** : option b) ★. `SYN-HORS-LIGNE` tant que le réseau est coupé ; `SYN-SESSION` (et `ERR-015`) n'est exposé qu'avec un réseau disponible, la session à renouveler étant mémorisée. Aucun scénario touché ; l'ordre de gravité du reste est inchangé. *Intégré en v0.2 : §6.9, UT-US-022-44, 45, 47.*
- **Q-ST022-STE-4 (nouvelle, non bloquante pour l'E10, avant l'E12 des écrans) — Geste de reprise pendant une saisie.** Condition de Starck (DAT v0.11.3 §4.1.7) : une saisie en cours n'est jamais perdue par un rechargement. Si GIS échoue et que le repli (qui recharge la page) est nécessaire pendant qu'un formulaire modifié est ouvert, aucune redirection n'est lancée (`SAISIE_A_TERMINER`). Que voit l'utilisateur ? Proposition : un toast « Terminez votre saisie, puis reprenez la synchronisation. » (code à créer), l'indicateur restant `SYN-SESSION`. a) ce toast ★ ; b) une confirmation « Abandonner la saisie et reprendre » ; c) autre.
  - **Réponse de Steeve (E11, 2026-10-27, guide v0.2.14 §6.6.6)** : a) retenu. Toast `TST-SAISIE-A-TERMINER` « Terminez votre saisie, puis reprenez la synchronisation. » (4 s, `role="status"`, sans action) ; l'indicateur reste `SYN-SESSION` ; aucune confirmation (option b écartée : détruire une saisie pour une opération technique n'est pas un choix à offrir). `SAISIE_A_TERMINER` produit ce toast.

**DEC-038 (commanditaire, Q-RL-P1 a)** : l'écran d'attente `SYN-REDIRECTION` s'affiche à chaque ouverture avec réseau, et aucun jeton n'est conservé sur l'appareil ; la conception (§6.1, §6.2) est confirmée telle quelle.

**Hypothèses** : aucune hors des questions ci-dessus (la conception retient l'option ★ de chacune et sera ajustée sans reprise d'architecture si la réponse diffère).
**Dette acceptée** : aucune. DT-001 s'applique aux espaces de compte et à la base technique.

## 17. Checklist de complétude (avant E11)
- [x] Chaque CA est relié à un scénario et à un test (§2.1).
- [x] Chaque RG est reliée à un élément et à un test (§2.2).
- [x] Fichiers listés par couche (§3) ; signatures (§4) ; données (§5) ; algorithmes (§6) ; Google (§7) ; erreurs (§8).
- [x] Chaque phrase Gherkin d'US-022 a une ligne au §12.
- [x] Les tests du §13 existent, s'exécutent et échouent pour la raison attendue (E10, 2026-10-27).
- [x] Q-ST022-STA-1 à 3 et Q-ST022-STE-1 à 3 répondues et intégrées (v0.2).
- [x] Q-ST022-STA-4 et Q-ST022-STE-4 répondues ; Q-RL-P1 tranchée (DEC-038).
- [ ] RL-LOT-001-A1 levée par Starck.
