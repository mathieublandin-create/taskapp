# ST-US-017 — Retrouver mes données sur smartphone et sur PC (incréments 1 à 4)

## Sommaire

- [0. En-tête](#0-en-tête) (l. 60)
  - [Historique](#historique) (l. 79)
- [1. Résumé technique](#1-résumé-technique) (l. 94)
- [2. Traçabilité](#2-traçabilité) (l. 105)
  - [2.1 Critères d'acceptation](#21-critères-dacceptation) (l. 107)
  - [2.2 Règles de gestion](#22-règles-de-gestion) (l. 126)
- [3. Composants et fichiers](#3-composants-et-fichiers) (l. 141)
  - [3.1 Incrément 1 (rang 3)](#31-incrément-1-rang-3) (l. 143)
  - [3.2 Incréments 2 à 4](#32-incréments-2-à-4) (l. 175)
  - [3.3 Correction d'ANO-001 (v0.4.3, branche fix/ANO-001)](#33-correction-dano-001-v043-branche-fixano-001) (l. 189)
  - [3.4 Incrément 2 (rang 9, v0.5) : fichiers et tranches](#34-incrément-2-rang-9-v05--fichiers-et-tranches) (l. 205)
- [4. Interfaces et signatures (incrément 1, et ce que les incréments suivants doivent respecter)](#4-interfaces-et-signatures-incrément-1-et-ce-que-les-incréments-suivants-doivent-respecter) (l. 237)
  - [4.1 Domaine](#41-domaine) (l. 239)
  - [4.2 Application](#42-application) (l. 293)
  - [4.3 Port TransportSynchro (complet)](#43-port-transportsynchro-complet) (l. 326)
  - [4.4 Adaptateurs](#44-adaptateurs) (l. 354)
  - [4.5 Présentation](#45-présentation) (l. 360)
  - [4.5 bis Feuille ECR-011 de l'incrément 1 et point « en attente » (v0.4, DT-011)](#45-bis-feuille-ecr-011-de-lincrément-1-et-point--en-attente--v04-dt-011) (l. 367)
  - [4.6 Incrément 2 (rang 9, v0.5) : signatures](#46-incrément-2-rang-9-v05--signatures) (l. 399)
- [5. Modèle de données et migrations](#5-modèle-de-données-et-migrations) (l. 496)
  - [5.1 Stockage local](#51-stockage-local) (l. 498)
  - [5.2 Fichier d'appareil, schéma 1 (contenu logique : ST-socle §5.3)](#52-fichier-dappareil-schéma-1-contenu-logique--st-socle-53) (l. 503)
  - [5.3 Compatibilité (RG-058, conventions §10.3)](#53-compatibilité-rg-058-conventions-103) (l. 533)
- [6. Règles et algorithmes](#6-règles-et-algorithmes) (l. 536)
  - [6.1 Fusion](#61-fusion) (l. 538)
  - [6.2 Dépôt](#62-dépôt) (l. 551)
  - [6.3 Cycle](#63-cycle) (l. 564)
  - [6.4 Déclencheurs (DAT §4.3)](#64-déclencheurs-dat-43) (l. 592)
  - [6.5 DepotAvantSortieSynchro](#65-depotavantsortiesynchro) (l. 588)
  - [6.6 Incrément 2 (rang 9) : règles arrêtées (détaillées en v0.5)](#66-incrément-2-rang-9--règles-arrêtées-détaillées-en-v05) (l. 606)
  - [6.7 Incrément 3 (rang 10) : règles arrêtées](#67-incrément-3-rang-10--règles-arrêtées) (l. 632)
  - [6.8 Incrément 4 (rang 11) : règles arrêtées](#68-incrément-4-rang-11--règles-arrêtées) (l. 635)
  - [6.9 Correction d'ANO-001 : la vue suit les cycles sans geste et les écritures locales (v0.4.3)](#69-correction-dano-001--la-vue-suit-les-cycles-sans-geste-et-les-écritures-locales-v043) (l. 641)
- [7. Intégration Google](#7-intégration-google) (l. 660)
- [8. Gestion des erreurs](#8-gestion-des-erreurs) (l. 672)
- [9. Patterns imposés](#9-patterns-imposés) (l. 686)
- [10. Sécurité et données personnelles](#10-sécurité-et-données-personnelles) (l. 696)
- [11. Exigences non fonctionnelles](#11-exigences-non-fonctionnelles) (l. 699)
- [12. Step definitions Cucumber](#12-step-definitions-cucumber) (l. 706)
  - [12.1 Phrases](#121-phrases) (l. 708)
  - [12.2 Rangs d'exécution revérifiés](#122-rangs-dexécution-revérifiés) (l. 737)
  - [12.3 Banc](#123-banc) (l. 752)
  - [12.4 Scénarios S06c à S06f (ANO-001, glossaire v1.11 §13) : banc et steps (E12 de la correction)](#124-scénarios-s06c-à-s06f-ano-001-glossaire-v111-13--banc-et-steps-e12-de-la-correction) (l. 758)
  - [12.5 Incrément 2 (rang 9, v0.5) : phrases, banc et scénarios différés](#125-incrément-2-rang-9-v05--phrases-banc-et-scénarios-différés) (l. 784)
- [13. Tests unitaires fournis](#13-tests-unitaires-fournis) (l. 820)
  - [13.1 Incrément 1 (E10, livrés en rouge le 2026-10-27)](#131-incrément-1-e10-livrés-en-rouge-le-2026-10-27) (l. 822)
  - [13.2 Incréments 2 à 4 (E10 à livrer avant leur E12)](#132-incréments-2-à-4-e10-à-livrer-avant-leur-e12) (l. 875)
  - [13.3 Correction d'ANO-001 (E10 v0.4.3, livrés en rouge le 2026-10-30)](#133-correction-dano-001-e10-v043-livrés-en-rouge-le-2026-10-30) (l. 878)
  - [13.4 Incrément 2 (E10 v0.5, livrés en rouge le 2026-10-31)](#134-incrément-2-e10-v05-livrés-en-rouge-le-2026-10-31) (l. 897)
- [14. Tests attendus de Benjamin](#14-tests-attendus-de-benjamin) (l. 940)
- [15. Plan de réalisation](#15-plan-de-réalisation) (l. 951)
  - [15.1 Incrément 2 (rang 9) : réalisation en tranches (OPT-15, v0.5)](#151-incrément-2-rang-9--réalisation-en-tranches-opt-15-v05) (l. 954)
- [16. Dette, hypothèses et points ouverts](#16-dette-hypothèses-et-points-ouverts) (l. 969)
- [17. Checklist de complétude](#17-checklist-de-complétude) (l. 1006)

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-017](../01-specification-fonctionnelle/user-stories/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.md), statut « Prête » (DEC-018 ; DEC-030 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — **4 incréments internes** (Q-LOT-1 b, DEC-025), chacun avec sa branche et sa revue E13 : incrément 1 au **rang 3**, incrément 2 au **rang 9**, incrément 3 au **rang 10**, incrément 4 au **rang 11** |
| Fichier `.feature` | [`tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature`](../../tests/features/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.feature), 46 scénarios |
| RG couvertes | RG-017, RG-018, RG-020, RG-021, RG-035, RG-036, RG-044, RG-047, RG-048, RG-049, RG-053, RG-054, RG-056, RG-058 |
| ENF concernées | ENF-01, ENF-02, ENF-04, ENF-06, ENF-07 ; ENF-T-03, ENF-T-04, ENF-T-05, ENF-T-07 |
| DAT / ADR | DAT v0.11.3 §4.1.4, §4.1.5 bis, §4.2, §4.2.1, §4.2.2, §4.3, §4.4.5, §6.1, §6.4 ; ADR-003, ADR-010, ADR-011, ADR-013 |
| Prérequis | `ST-socle-ecriture.md` (rang 0, dont le contenu logique du schéma 1, §5.3) ; ST-US-022 (rang 1 : accès, `TransportSynchro.preparerDossier`, indicateur et bandeaux) ; ST-US-001 (rang 2) |
| Hypothèses du contrôle d'explicitation appliquées | H-1, H-2 (incrément 2), H-4 (socle), H-5 (§12), H-6 (incréments 2 et 3) |
| Q-US traitées | Q-US-017-1 à 12 (E8) ; DEC-030 (Q-US-017-3, A8) ; Q-DEC034-1 |
| Questions de cette ST | Q-ST017-PEP-1, Q-ST017-STA-1 à 3 répondues et intégrées ; Q-ST017-STE-1 ouverte, non bloquante ; v0.5 : Q-ST017-STA-4 et Q-ST017-PEP-2 répondues (v0.6 : PEP-2 b intégrée), Q-ST017-STE-2 ouverte ; v0.6 : Q-ST017-STA-5, Q-ST017-PEP-3, Q-ST017-STE-3 ouvertes, Q-BRU-1 répondue (§16) |
| Version | 0.6 |
| Statut | **v0.6 : entrée de journal de la réparation RG-048 (Q-ST017-PEP-2 b), tranche B1b, et date des valeurs d'état (n° 12)** ; **E10 de l'incrément 2 livrée (v0.5)** : conception détaillée (§3.4, §4.6, §5, §6.6, §12.5), tests du §13.4 livrés en rouge, plan en tranches (§15). Incréments 3 et 4 : conception arrêtée ; E10 avant l'E12 de chacun (§13.2) |
| Auteur | Anthony |
| Branches | `us/US-017-1-synchronisation-de-base`, `us/US-017-2-conflits`, `us/US-017-3-restauration`, `us/US-017-4-horloge-versions` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après R11 et M-RED ; R1 sans objet avec un client OAuth Web unique). Rangs d'exécution des scénarios revérifiés (§12.2). E10 de l'incrément 1 livrée. |
| 0.2 | 2026-10-27 | Anthony | Réponses de Pepper (S06 et S06b corrigés : S06b exécuté au rang 3 sans condition) et de Starck (DAT v0.11.3). **Q-ST017-STA-1** : doublure `DepotLocalEnMemoire` et suite de contrat étendue (CT-DEPOT-08 à 11), une seule transaction stricte (§3.1, §4.2, §13.1). **Q-ST017-STA-2** : médiane de 5 mesures d'aller-retour < 3 s, seul un recul corrigé, contrôle chaque minute et au retour au premier plan (§6.8, constantes livrées). **Q-ST022-STA-3** : l'`appareilId` naît avec l'espace ; l'ancien fichier d'un appareil après suppression des données est celui d'un appareil inactif (§6.3). |
| 0.4.1 | 2026-10-30 | Anthony | E13 du reliquat du rang 3, **Q-BEN-R3R-1** (RC-R3-8) : n° 17 e (`elementsEnAttenteDetailles`, domaine) et n° 17 f (branchement de la feuille) ; §4.5 bis complété ; §13.1 : UT-COMP-US-017-54 livré en rouge (squelette au rang 4), UT-COMP-US-017-53 à écrire par Benjamin. |
| 0.4.3 | 2026-10-30 | Anthony | **Correction d'ANO-001** (E9, E10 ; `docs/anomalies.md` ; scénarios US-017 S06c à S06f de Pepper, glossaire v1.11) : l'indicateur et la feuille ECR-011 suivent les cycles menés sans geste et les écritures locales. §3.3 (fichiers), §6.9 (conception), §12.4 (steps et banc), §13.3 (UT-US-017-90 à 99, livrés en rouge ; règle `UT-US-017-9\d` → rang 3). Conventions v0.4.8 (§11.8, tag `@ANO-nnn`). Ni le cœur de données ni la fusion ne changent. |
| 0.5 | 2026-10-31 | Anthony | **E10 de l'incrément 2 (rang 9)**. §3.4 : fichiers et tranches ; §4.6 : signatures (valeurs écartées, lectures, signalements, réparation, intégration d'un fichier reçu, port `DepotLocal` étendu de `lireSignalements`, « Compris », liste ECR-011) ; §5.1, §5.2 : base Dexie version 3, tableaux `valeursEcartees` et `lectures` du schéma 1 ; §6.6 réécrit en règles numérotées (n° 1 à 13) ; **correction** : la réparation RG-048 n'écrit **pas** d'entrée de journal (la v0.4 en prévoyait une, à tort : l'identifiant déterministe du DAT §4.2 est celui de l'entrée « Modifications non retenues ») ; §8 n° 7 à 10 ; §12.5 : phrases du rang 9 et couverture des scénarios différés ; §13.4 : UT-US-017-40 à 59 et CT-DEPOT-12, 13 livrés en rouge (domaine vérifié vert sur une réalisation d'essai non commitée) ; §15 : plan en tranches ; §16 : Q-ST017-STA-4, Q-ST017-PEP-2, Q-ST017-STE-2, DT-025. |
| 0.6 | 2026-10-31 | Anthony | **Réponse de Pepper à Q-ST017-PEP-2 b** (cahier des charges v0.14.3, US-023 CA-11 et S18d, glossaire d'étapes v1.12 §11) : la règle n° 9 de la v0.5 (« aucune entrée de journal ») est **non conforme** à RG-050 et au glossaire d'étapes §11 ; elle est corrigée. §6.6 n° 8 (l'entrée du déplacement annulé se cherche parmi les entrées de cas d'usage seulement), n° 9 (registres, inchangés) et nouveaux n° 9 b (entrée « changement parent » par annulation : identifiant = texte de l'identifiant du signalement, HLC du déplacement annulé, journée et instant de son entrée, sans `cause`), 9 c (ordre de l'historique : à HLC égal, l'entrée de réparation suit), 9 d (forme d'identifiant acceptée par la base locale et par le fichier Drive), n° 11 d (entrées de réparation dans le plan), n° 12 (une valeur d'état porte sa date, remarque de Pepper, RG-056). §3.4 I2-23 à I2-25, §4.6, §5.1, §5.2, §12.5 (S10b, S10c, S18d au rang 9), §13.4 (UT-US-017-48 à 51 détachés de l'entrée de journal ; 57 et 58 complétés ; **UT-US-017-100 à 108** livrés en rouge ; règle `UT-US-017-10\d` → 9), §14 (propriété de Q-BRU-1 corrigée), §15.1 (tranche **B1b**, garde de Bruce confirmée), §16 (texte exact de l'amendement du DAT §4.2, §6.1 pour Starck ; Q-ST017-STA-5, Q-ST017-PEP-3, Q-ST017-STE-3). Aucun type figé pour D1 ne change (le champ `date?` de `ValeurSignalee` est un ajout optionnel). |
| 0.4.4 | 2026-10-30 | Anthony | **E13 d'ANO-001** (`docs/ceremonies/revue-code-LOT-001-ANO-001.md`) : §12.4 corrigé sur deux points relevés par Benjamin, sa réalisation fait foi : `expirerAccesSansConstat()` place un jeton **échu** (un 401 sur un jeton non échu prouve un retrait, DAT §4.1.6 bis : `PERDU`, `SYN-ACTION`) ; n° 1 ferme puis rouvre l'application (instantané d'ouverture d'une session connue, exigé par S06f) ; unité « secondes » de `{ecart}`. **RC-ANO-001-1** : l'abonnement permanent du relais au dépôt laissait l'écoute globale `Dexie.on('storagemutated')` active après la fermeture de l'espace ; §6.9 n° 4 et §3.3 A8 : `DepotLocalDexie.fermer()` la retire ; §13.3 : UT-COMP-US-017-56 (rouge) et 57. UT-COMP-90 complété (secondes). |
| 0.4.2 | 2026-10-30 | Anthony | E13 du reliquat du rang 3, 2e tour : n° 17 f, la feuille est rendue **avant** `<SectionCompte>` et non après (ordre d'ECR-011, guide d'ergonomie §4.26 ; écart de la v0.4.1 relevé à la revue, réalisation de Benjamin conforme au guide). |
| 0.4 | 2026-10-30 | Anthony | E10 du reliquat du rang 3 (DT-011, RC-R3-4) : §3.1 n° 17 b précisé, n° 17 c (`formaterHeure`, `formaterAnciennete`) et n° 17 d (point `MEN-ATTENTE` de la ligne d'objectif, `nomAccessible`) ; §4.5 bis (signatures et règles de `construireFeuilleSynchronisation` et de `FeuilleSynchronisation`) ; §13.1 : UT-US-017-34 à 39, UT-US-001-36 et 37, livrés en rouge ; squelettes au rang 4 dans `rangs-fichiers.json` pendant la phase rouge (§13.1) ; Q-ST017-STE-1 (§16). DT-006 et DT-009 : pas de test fourni par Anthony, tests complémentaires de Benjamin (§14). |
| 0.3.1 | 2026-10-29 | Anthony | E13 du rang 3 (`docs/ceremonies/revue-code-LOT-001-rang3.md`) : **Q-BRU-R3-1** : feuille ECR-011 de l'incrément 1 ajoutée au §3.1 (n° 17 b), tests à fournir (§13.1), dette DT-011 ; **Q-BRU-R3-2** : entrée de journal de type inconnu ignorée à l'incrément 1 (§5.3) ; §6.3 aligné sur la réalisation revue : jeton mémorisé dès la fin des fusions, `RessourceIntrouvable` ignorée comme un fichier illisible, `definirPremierPlan(visible)` (§6.4) ; `attente` (`MEN-ATTENTE`) sur la ligne d'objectif (§4.5). |
| 0.3 | 2026-10-28 | Anthony | E11. **RL-LOT-001-A3** : jeton de départ obtenu avant l'inventaire ; jeton refusé (`JetonChangementsInvalide`) → nouvel inventaire complet dans le même cycle, sans tentative comptée (§4.3, §6.3) ; CT-TRANS-09, 10 et UT-US-017-32. **RL-A7** : mesure d'horloge par un observateur de `ClientGoogle` (§6.8). **RL-A9 / Q-ST017-STA-3** : archivage hors du lot 1, dette DT-002 (§6.3, §16). **RL-S3** : ordre des listes de la feuille (`comparerLignesFeuille`, UT-US-017-33). **RL-P2** : étape n° 10 en échec tant que la racine est `ATTENTE_GOOGLE` (glossaire v1.10 §12). **RL-P3** : étape de S27 définie (n° 23), S27 exécuté au rang 2. |

## 1. Résumé technique

| Incrément | Rang | Ce qu'il livre | Ne livre pas |
|---|---|---|---|
| **1. Synchronisation de base** | 3 | Port `TransportSynchro` complet ; format Drive **schéma 1** (sérialisation canonique, empreinte SHA-256, compression gzip, table d'appareils) ; manifeste initial ; fusion par information (HLC le plus grand) ; réception d'HLC ; dépôt et marqueur `deposeJusquA` ; retrait de l'index après dépôt confirmé ; `CycleSynchronisation` (déclencheurs, cycles non concurrents, reprises, `SYN-RETENTATIVE`, `SYN-ACTION` avec `ERR-016`, Drive plein `ERR-011`, 401 qualifié) ; `DepotAvantSortie` réel ; `MEN-ATTENTE` ; banc à deux appareils avec `FauxDrive` complet | Valeurs écartées, RG-047 à RG-049 (incrément 2) ; altérations et RG-044 (incrément 3) ; correction d'horloge, `ALR-001`, RG-054 (feuille), RG-058 (incrément 4) |
| **2. Conflits et modifications non retenues** | 9 | Détection des valeurs écartées par contexte causal (DAT §4.2.1), y compris par une pierre tombale étendue (H-1) ; liste « Modifications non retenues » synchronisée, état « lu » ; point « à lire » ; réparation itérative des hiérarchies (RG-048) ; incohérences RG-049 dérivées (ST-US-024 §6.6) | — |
| **3. Restauration (RG-044)** | 10 | Ordre des contrôles du DAT §4.2.2 ; altération (absent, illisible, empreinte) ; `ERR-012` ; « Restaurer » (mémorisé hors ligne), « Repartir de zéro » (génération), « Décider plus tard » ; choix concurrents (DEC-030) ; `ALR-008`, `ALR-014` ; dossier et manifeste en double | — |
| **4. Horloge, fuseau, versions** | 11 | Correction d'horloge par l'en-tête `Date` (lissage), détection des sauts par l'horloge monotone, `ALR-001` (seuil strict de 24 h) ; ligne « Fuseau » de la feuille (RG-054) ; RG-058 : `FormatPlusRecent`, consultation seule (aucune écriture Drive, saisie bloquée), « Mettre à jour » (service worker), conservation des champs inconnus de même `schemaVersion` (ANT-19) | — |

**Hors périmètre** : verrou entre onglets (ST-US-031) ; service worker et `storage.persist()` (ST-US-018) ; agenda.

## 2. Traçabilité

### 2.1 Critères d'acceptation
| CA | Scénarios | Incrément | Tests (§13) | Composants |
|---|---|---|---|---|
| CA-1 | S01 | 4 (exécuté en dernier) | — | Composition |
| CA-2 délai d'une heure | S02, S03 | 1 | UT-US-017-21 à 24 | `CycleSynchronisation` (2 min, 5 s) |
| CA-3 ouverture, accès à renouveler | S04, S05, S06, S06b | 1 | UT-US-017-21, 25 | Déclencheur d'ouverture et de retour du jeton |
| CA-4 données dans le Drive seulement | S07 | 1 | UT-US-017-10 à 14 | `TransportSynchroDrive`, format v1 |
| CA-5 réouverture | S08 | 1 | UT-US-017-01 à 05 | Fusion |
| CA-6 information par information | S09, S10, S12b | 1 (fusion), 2 (signalement) | UT-US-017-01 à 05 | `fusionnerEtats` |
| CA-7 hors ligne, accès perdu | S17a, S17b | 1 | UT-US-017-20, 26 | Cycle, `AccesGoogle` |
| CA-8 valeur écartée | S10, S11 | 2 | §13.2 | `detecterValeursEcartees` |
| CA-9 RG-044 | S18 à S23, S32, S32b, S33 | 3 | §13.2 | Contrôles du cycle |
| CA-10 réparations | S24, S25, S26 | 2 | §13.2 | `reparerHierarchie`, dérivation RG-049 |
| CA-11 heure de Paris | S27 | Exécuté au rang 2 (RL-LOT-001-P3) ; ligne « Fuseau » : 4 | ST-US-001 UT-US-001-29 | `ModeleVueListeObjectifs.mentionHeureParis` (ST-US-001) ; feuille (incrément 4) |
| CA-12 RG-058 | S30, S30b, S31 | 4 | §13.2 | Garde de compatibilité |
| CA-13 horloge | S12, S12c, S12d, S13a, S13b | 1 (S12), 4 | §13.2 | `CorrectionHorloge` |
| CA-14 RG-056 | S14, S15, S15b, S16 | 2 | §13.2 | `ModificationsNonRetenues` |
| Cas limites | S28 (fuseaux), S29 (Drive plein) | 1 | UT-US-017-27 | Cycle |

### 2.2 Règles de gestion
| RG | Élément | Incrément |
|---|---|---|
| RG-017 | Déclencheurs du cycle (ouverture, 5 s, 2 min, retour du réseau, retour du jeton) | 1 |
| RG-020 | Dossier « Done Juan », fichiers d'appareil, manifeste | 1 |
| RG-021, RG-035 | Cycle inactif sans réseau ou sans accès ; index conservé | 1 |
| RG-036 | `fusionnerEtats` (gagnant) ; `detecterValeursEcartees` (signalement) | 1, 2 |
| RG-044 | `controlerDrive` (ordre DAT §4.2.2), `Generation`, `Restauration` | 3 |
| RG-047 | Contexte de pierre tombale (socle) ; détection | 2 |
| RG-048 | `reparerHierarchie` | 2 |
| RG-049 | Dérivation (ST-US-024 §6.6) | 2 |
| RG-054 | Ligne « Fuseau » de la feuille | 4 |
| RG-056 | `ModificationsNonRetenues`, `Lecture` | 2 |
| RG-058 | `verifierCompatibilite`, consultation seule | 4 |

## 3. Composants et fichiers

### 3.1 Incrément 1 (rang 3)
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/synchronisation/domaine/version-schema.ts` | Domaine | Créer | `SCHEMA_VERSION = 1` (seul point de définition) |
| 2 | `src/synchronisation/domaine/contenu-fichier.ts` | Domaine | Créer | `ContenuFichierAppareil`, `ContenuManifeste`, `Generation` |
| 3 | `src/synchronisation/domaine/fusion.ts` | Domaine | Créer | `EtatFusionnable`, `fusionnerEtats`, `planifierFusion` |
| 4 | `src/synchronisation/domaine/depot.ts` | Domaine | Créer | `contenuAEnvoyer`, `retirerDeposees`, `doitDeposer` |
| 5 | `src/synchronisation/domaine/meta-synchronisation.ts` | Domaine | Créer | `MetaSynchronisation`, `PlanSynchronisation` |
| 6 | `src/synchronisation/application/ports/depot-local.ts` | Application | **Modifier (ajout)** | Méthodes `lireMeta()` et `appliquerSynchronisation(calcul)` ; aucun type existant modifié |
| 7 | `src/synchronisation/application/ports/transport-synchro.ts` | Application | Compléter | Méthodes du §4.3 |
| 8 | `src/synchronisation/application/cycle-synchronisation.ts` | Application | Créer | `CycleSynchronisation` (implémente `SuiviCycle`) |
| 9 | `src/synchronisation/application/depot-avant-sortie-synchro.ts` | Application | Créer | Implémentation du port `DepotAvantSortie` du contexte `compte` (adapté dans la composition) |
| 10 | `src/synchronisation/infrastructure/drive/serialisation-canonique.ts` | Infrastructure | Créer | `serialiserCanonique`, `empreinteSha256` |
| 11 | `src/synchronisation/infrastructure/drive/compression.ts` | Infrastructure | Créer | `compresser`, `decompresser` (`CompressionStream('gzip')`) |
| 12 | `src/synchronisation/infrastructure/drive/schemas/v1.ts` | Infrastructure | Créer | Schémas Zod `SchemaFichierAppareilV1`, `SchemaManifesteV1` (objets **lâches** : `z.looseObject`, `.strict()` interdit) |
| 13 | `src/synchronisation/infrastructure/drive/format-v1.ts` | Infrastructure | Créer | `encoderFichierAppareil`, `decoderFichierAppareil`, `encoderManifeste`, `decoderManifeste` |
| 14 | `src/synchronisation/infrastructure/drive/transport-synchro-drive.ts` | Infrastructure | Compléter | Méthodes du §4.3 (Drive v3 REST, `ClientGoogle`) |
| 15 | `src/synchronisation/infrastructure/depot-local-dexie.ts` | Infrastructure | Modifier | Base Dexie version 2 : aucune nouvelle table ; méta étendue (§5.1) ; `lireMeta`, `appliquerSynchronisation` |
| 16 | `src/synchronisation/application/requetes/consulter-etat-synchronisation.ts` | Application | Modifier | Lit `CycleSynchronisation` au lieu de `SUIVI_CYCLE_AU_REPOS` |
| 17 | `src/synchronisation/presentation/modeles-de-vue/mention-attente.ts` | Modèle de vue | Créer | `mentionAttente(element, elementsEnAttente)` → `MEN-ATTENTE` ou rien (lu par les modèles de vue des lignes, ST-US-001 et ST-US-002) |
| 17 b | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts`, `src/synchronisation/presentation/ui/FeuilleSynchronisation.tsx` | Modèle de vue, UI | Compléter (squelettes E10 v0.4) | `construireFeuilleSynchronisation(e)` et `FeuilleSynchronisation` (§4.5 bis ; ECR-011, section « Synchronisation »). **Ajout v0.3.1 (Q-BRU-R3-1)** : réalisé par Benjamin dans la PR séparée du reliquat du rang 3 (dette DT-011) ; branchement dans `main.tsx` et la composition (état lu par `consulterEtatSynchronisation`, `lireMeta().dernierContactDrive`, éléments en attente du dépôt) dans la même PR |
| 17 c | `src/commun/presentation/format/heure.ts` | Modèle de vue | Compléter (squelette E10 v0.4) | `formaterHeure(instant)`, `formaterAnciennete(instant, maintenant)` (guide §6.6.1, heure de Paris) ; **sans date-fns** (règle dependency-cruiser `date-fns-dans-temps-seulement`) : `Intl.DateTimeFormat` avec `timeZone: FUSEAU_REFERENCE`, ou fonction ajoutée à `commun/domaine/temps/` |
| 17 d | `src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif.ts`, `src/objectifs-taches/presentation/ui/composants/ligne-objectif.tsx` | Modèle de vue, UI | Modifier | `attente` porte `nomAccessible` (`libelle('MEN-ATTENTE', {}, 'nomAccessible')`) ; la ligne rend le point (§4.5 bis) (DT-011, RC-R3-4) |
| 17 e | `src/synchronisation/domaine/elements-en-attente.ts` | Domaine | Compléter (squelette E13 v0.4.1) | `elementsEnAttenteDetailles(etat: EtatLocal): ReadonlyArray<ElementEnAttente>` (§4.5 bis). Fonction pure : la règle (regroupement par élément, lien compté pour sa tâche, plus grand `derniereHlc`, intitulé) reste hors de la composition (Q-BEN-R3R-1) |
| 17 f | `src/composition/application.ts`, `src/composition/web.ts`, `src/composition/controleur-interface.ts`, `src/main.tsx`, `tests/e2e/csp.e2e.ts` | Composition, UI | Modifier | Branchement de la feuille (RC-R3-8, Q-BEN-R3R-1) : `Application.lireElementsEnAttente()` (= `depot.lire()` puis `elementsEnAttenteDetailles`, `[]` sans espace ou si la lecture échoue, comme `attenteDe`), `lireDernierContact()` (`lireMeta().dernierContactDrive`, `undefined` sans espace ou en échec), `synchroniserMaintenant()` (`cycle.synchroniserMaintenant()`, sans effet sans espace) ; contrôleur : `vue.feuille` construite par `construireFeuilleSynchronisation` avec l'état affichable déjà calculé et `horloge.maintenant()`, recalculée aux mêmes notifications que l'indicateur ; actions : `surSynchroniser` et `REESSAYER_MAINTENANT` → `synchroniserMaintenant()`, `OUVRIR_GOOGLE_DRIVE` → `Application.ouvrirGoogleDrive()`, qui appelle `Navigateur.ouvrirOnglet('https://drive.google.com/')` (nouvelle méthode du type `Navigateur` de `composition/web.ts`, implémentée dans `main.tsx` par `window.open(url, '_blank', 'noopener,noreferrer')` ; jamais `window.open` hors de `main.tsx`) ; `main.tsx` rend `<FeuilleSynchronisation>` avec l'indicateur et le bandeau, **avant** `<SectionCompte>` (ordre d'ECR-011, guide d'ergonomie §4.26 : synchronisation, puis compte ; v0.4.2) ; `ion-card`, `ion-card-title`, `ion-card-content` ajoutés à `COMPOSANTS_IONIC` |
| 18 | `src/composition/web.ts` | Composition | Modifier | Cycle, déclencheurs (`visibilitychange`, `online`, observateur du dépôt, accès), `DepotAvantSortie` réel |
| 19 | `tests/doublures/faux-drive.ts` | Test | Compléter | §12.3 |
| 20 | `tests/contrats/transport-synchro.contrat.ts` | Test | Créer | Suite de contrat (CT-TRANS-01 à 10 ; 09 et 10 : RL-LOT-001-A3), exécutée sur `FauxDrive` et, avec MSW, sur `TransportSynchroDrive` |
| 21 | `tests/steps/synchronisation/echanges.steps.ts`, `drive.steps.ts`, `etat-affiche.steps.ts` | Test | Créer ou compléter | §12 |
| 21 b | `tests/doublures/depot-local-memoire.ts` | Test | Compléter (squelette E10) | `DepotLocalEnMemoire` et `StockageDepotEnMemoire` : doublure du port `DepotLocal` complet, partagée par plusieurs instances ; passe CT-DEPOT-01 à 11 (condition de Starck, Q-ST017-STA-1) |
| 21 c | `tests/contrats/depot-local.contrat.ts` | Test | Compléter (E10) | CT-DEPOT-08 à 11 (`lireMeta`, `appliquerSynchronisation`), exécutés sur `DepotLocalDexie` et `DepotLocalEnMemoire` |

### 3.2 Incréments 2 à 4
| # | Fichier | Incr. | Responsabilité |
|---|---|---|---|
| 22 | `src/synchronisation/domaine/valeurs-ecartees.ts` | 2 | `ValeurEcartee`, `idValeurEcartee`, `detecterValeursEcartees`, `fusionnerValeursEcartees` |
| 23 | `src/synchronisation/domaine/reparation-hierarchie.ts` | 2 | `reparerHierarchie` (RG-048, DAT §4.2) |
| 24 | `src/synchronisation/domaine/lectures.ts` | 2 | Registre « lu » par entrée (`Lecture`), fusion par HLC |
| 25 | `src/synchronisation/application/cas-usage/marquer-comme-lue.ts` | 2 | `MarquerCommeLue` (« Compris ») |
| 26 | `src/synchronisation/application/requetes/consulter-modifications-non-retenues.ts` ; `presentation/modeles-de-vue/modifications-non-retenues.ts` | 2 | Liste ECR-011 C, codes `ALR-009` à `ALR-011`, `ALR-014` |
| 27 | `src/synchronisation/domaine/controle-drive.ts` | 3 | `controlerDrive` (ordre DAT §4.2.2), `Generation`, `comparerGenerations` |
| 28 | `src/synchronisation/application/cas-usage/choisir-restauration.ts` | 3 | `RestaurerDonnees`, `RepartirDeZero` (`evaluer`/`executer`, `CNF-REPARTIR-ZERO`), `DeciderPlusTard` |
| 29 | `src/synchronisation/domaine/correction-horloge.ts` | 4 | `mesurerEcart` (rend `undefined` si l'aller-retour dure 3 s ou plus), `retenirMesure` (5 dernières), `medianeCorrection`, `qualifierSaut` (`RECUL` / `AVANCE` / `AUCUN`), `decalerMesures`, `estHorlogeDereglee` ; constantes dans `parametres-synchronisation.ts` (livrées en E10) |
| 30 | `src/synchronisation/domaine/compatibilite.ts` | 4 | `verifierCompatibilite(schemaVersionLu)` |
| 31 | `src/synchronisation/application/ports/mise-a-jour-application.ts` ; `infrastructure/mise-a-jour-service-worker.ts` | 4 | « Mettre à jour » (DAT §4.2) |
| 32 | Base Dexie version 3 (incr. 2) : tables `valeursEcartees`, `lectures` ; version 4 (incr. 4) : table `registresInconnus` (§5.1, qui fait foi ; Q-BEN-LOT001-9) | 2, 4 | Ajouts purs |

### 3.3 Correction d'ANO-001 (v0.4.3, branche `fix/ANO-001`)
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| A1 | `src/synchronisation/application/cycle-synchronisation.ts` | Application | Compléter (squelette E10) | `CycleSynchronisation.observer(rappel)` et sa notification (§6.9 n° 1) |
| A2 | `src/composition/application.ts` | Composition | Compléter (squelette E10) | `Application.observerSynchronisation(rappel)` : relais abonné au cycle **et** au dépôt de chaque espace créé par `fabriqueCycle.creer` (§6.9 n° 2) |
| A3 | `src/composition/controleur-interface.ts` | Composition | Compléter (squelette E10) | `ApplicationInterface` inclut `observerSynchronisation` (fait en E10) ; abonnement dans le constructeur ; `rafraichissementsTermines()` pour le banc (§6.9 n° 3) |
| A4 | `tests/unitaires/composition/controleur-interface.test.ts`, `controleur-reessai.test.ts`, `controleur-feuille.test.ts` | Test | Modifié en E10 | Doublure `observerSynchronisation: () => () => undefined` ajoutée ; aucune assertion changée |
| A5 | `tests/support/banc/appareil-simule.ts` | Test (banc) | Modifier (E12) | Contrôleur de l'appareil, premier plan, accès expiré sans constat (§12.4) |
| A6 | `tests/steps/synchronisation/etat-affiche.steps.ts`, `tests/steps/commun/appareils.steps.ts`, `tests/steps/objectifs-taches/objectifs.steps.ts`, `tests/steps/compte/connexion.steps.ts`, `tests/support/hooks.ts`, `tests/support/monde.ts` | Test (steps) | Modifier (E12) | Phrases du glossaire v1.11 §13 (§12.4) |
| A7 | `scripts/verifier-tags.ts`, `tests/unitaires/outillage/controles-ci.test.ts`, `docs/04-specification-technique/conventions.md` | Outillage | Modifié en E10 | Tag `@ANO-nnn` admis (UT-OUT-10) ; UT-COMP-86 : 286 scénarios (S06c à S06f) |
| A8 (v0.4.4) | `src/synchronisation/infrastructure/depot-local-dexie.ts` | Infrastructure | Modifier (E12, RC-ANO-001-1) | `fermer()` vide les observateurs et retire l'écoute des autres instances (§6.9 n° 4) |
| A9 (v0.4.4) | `tests/integration/synchronisation/depot-local-dexie-fermeture.test.ts` ; `tests/unitaires/support/steps-communes.test.ts` | Test | Créé / complété en E13 | UT-COMP-US-017-56 et 57 ; UT-COMP-90 (unité « secondes » de `{ecart}`, `tests/support/conversions.ts`) |

Aucun autre fichier : ni `web.ts` (le contrôleur s'abonne lui-même), ni `main.tsx`, ni le port `SuiviCycle`, ni `src/synchronisation/domaine/**`, ni les modèles de vue ; dans `depot-local-dexie.ts`, seul `fermer()` change (A8). Aucun nouveau fichier de `src/` : `rangs-fichiers.json` est inchangé ; `rang-courant.json` aussi. Pas de nouveau libellé : le catalogue est inchangé.

### 3.4 Incrément 2 (rang 9, v0.5) : fichiers et tranches
Remplace les n° 22 à 26 et la ligne « version 3 » du n° 32 du §3.2. Tranches et ordre : §15.

| # | Fichier | Couche | Action | Tranche | Responsabilité |
|---|---|---|---|---|---|
| I2-1 | `src/synchronisation/domaine/condensat-sha256.ts` | Domaine | Compléter (squelette) | B1 | `condensatSha256`, `encoderBase32Hex` : synchrones, sans dépendance (§6.6 n° 1) |
| I2-2 | `src/synchronisation/domaine/valeurs-ecartees.ts` | Domaine | Compléter (squelette) | B1 | `IdValeurEcartee`, `idValeurEcartee`, `ValeurEcartee`, `MOTIFS_A_LIRE`, `hlcDuGagnant`, `detecterValeursEcartees`, `fusionnerValeursEcartees` (§6.6 n° 1 à 5). **Types figés** : D1 en dépend |
| I2-3 | `src/synchronisation/domaine/lectures.ts` | Domaine | Compléter (squelette) | B1 | `Lecture`, `fusionnerLectures`, `compterALire` (n° 6) |
| I2-4 | `src/synchronisation/domaine/signalements.ts` | Domaine | Livré complet (E10) | — | `Signalements`, `SIGNALEMENTS_VIDES`, `AjoutsSignalements` |
| I2-5 | `src/synchronisation/domaine/reparation-hierarchie.ts` | Domaine | Compléter (squelette) | B1 | `reparerHierarchie` (n° 7 à 10) |
| I2-6 | `src/synchronisation/domaine/planifier-synchronisation.ts` | Domaine | Compléter (squelette) | B1 | `planifierSynchronisation` (n° 11) |
| I2-7 | `src/synchronisation/domaine/pierre-tombale.ts` | Domaine | Modifier (facultatif) | B1 | Peut exporter `estRattacheA` (renommé `pointeVers`) pour I2-2 ; comportement inchangé |
| I2-8 | `src/synchronisation/domaine/meta-synchronisation.ts`, `contenu-fichier.ts`, `depot.ts` | Domaine | Modifiés en E10 (types) ; `depot.ts` à compléter | B2 | `PlanSynchronisation.signalements?`, `ContenuFichierAppareil.valeursEcartees?` et `lectures?` ; `contenuAEnvoyer` recopie les signalements (n° 11, §5.2) |
| I2-9 | `src/synchronisation/application/ports/depot-local.ts` | Application | Modifié en E10 | — | `lireSignalements()` ; 3e paramètre `signalements` du calcul d'`appliquerSynchronisation` (§4.6) |
| I2-10 | `src/synchronisation/infrastructure/depot-local-dexie.ts`, `infrastructure/stockage-local/schemas.ts` | Infrastructure | Compléter (squelette inerte) | B2 | Base version 3 (§5.1) ; `lireSignalements` ; le calcul reçoit les signalements lus dans la transaction ; écriture (`bulkPut`) de `signalements` dans la même transaction ; version et observateurs si plan **ou** signalements non vides ; `etatApres.dernierHlc` écrit dans ce cas |
| I2-11 | `src/synchronisation/infrastructure/drive/format-v1.ts`, `drive/schemas/v1.ts` | Infrastructure | Compléter | B2 | Encodage et décodage de `valeursEcartees` et `lectures` (§5.2) |
| I2-12 | `tests/doublures/depot-local-memoire.ts` | Test | Compléter (squelette inerte) | B2 | Stockage des signalements (CT-DEPOT-12, 13) |
| I2-13 | `src/synchronisation/application/cycle-synchronisation.ts` | Application | Modifier | B3 | Lecture (`#lire`) des signalements ; `#integrer` par `planifierSynchronisation` (pré-contrôle compris) ; `#deposer` : `contenuAEnvoyer(…, { signalements })` (§6.3 complété, n° 11) |
| I2-14 | `src/synchronisation/application/cas-usage/marquer-comme-lue.ts` | Application | Compléter (squelette) | B3 | `MarquerCommeLue` (n° 6) |
| I2-15 | `src/synchronisation/application/requetes/consulter-modifications-non-retenues.ts` | Application | Compléter (squelette) | B3 | `consulterModificationsNonRetenues` (§4.6) |
| I2-16 | `src/synchronisation/application/requetes/consulter-etat-synchronisation.ts` | Application | Compléter (squelette inerte : champ `AttenteLocale.aLire?` livré) | B3 | `aLire = attente.aLire ?? 0` ; `moteur.aLire` n'est plus lu (DT-025) |
| I2-17 | `src/synchronisation/domaine/detail-valeurs-ecartees.ts` | Domaine | Compléter (squelette) | D1 | `detaillerValeursEcartees` (n° 12) |
| I2-18 | `src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues.ts` | Modèle de vue | Compléter (squelette) | D1 | `construireModificationsNonRetenues` (n° 13) |
| I2-19 | `src/synchronisation/presentation/ui/ModificationsNonRetenues.tsx` | UI | Compléter (squelette) | D1 | Section « À lire » (n° 13) |
| I2-20 | `src/objectifs-taches/application/requetes/resumes.ts` ; modèles de vue `ligne-tache.ts`, `detail-tache.ts` | Application, modèle de vue | Modifier | D2 | RG-049 : appel de `incoherenceDe` rétabli dans `resumerTache` (ST-US-024 §16, n° 5) ; UT-US-024-21, 22 |
| I2-21 | `src/composition/application.ts`, `src/composition/controleur-interface.ts`, `src/main.tsx` | Composition, UI | Modifier | D3 | `attenteDe` : `aLire = compterALire(...)` de `lireSignalements()` ; `Application.lireModificationsNonRetenues()` (`consulterModificationsNonRetenues`, `undefined` sans espace ou en échec) ; `Application.marquerCommeLue(ids)` (`MarquerCommeLue`, sans effet sans espace) ; contrôleur : `vue.nonRetenues = construireModificationsNonRetenues(lu.valeurs)`, recalculée aux mêmes notifications que la feuille, actions `surCompris(ids)` → `marquerCommeLue`, `surVoir(element)` → navigation existante vers le détail ; `main.tsx` rend `<ModificationsNonRetenues>` **en tête** de la feuille (guide §6.6.2 `SYN-FEUILLE-A-LIRE`), avant `<FeuilleSynchronisation>` |
| I2-23 (v0.6) | `src/synchronisation/domaine/entree-reparation.ts` | Domaine | Compléter (squelette E10 v0.6) | **B1b** | `idEvenementDeReparation`, `estIdEvenementDeReparation`, `Annulation`, `entreeDeReparation` (§6.6 n° 9 b à 9 d) |
| I2-24 (v0.6) | `src/synchronisation/domaine/identifiant-evenement.ts` | Domaine | Modifier | **B1b** | `FORME_ID_EVENEMENT_REPARATION = /^[0-9a-v]{52}$/` (exportée) ; `lireIdEvenement` accepte aussi cette forme (n° 9 d) ; la forme `${operation}:${rang}` est inchangée |
| I2-25 (v0.6) | `src/synchronisation/application/service-etat-local-transactionnel.ts` | Application | Modifier | **B1b** | `comparerEvenements` : HLC, puis entrées de cas d'usage avant entrées de réparation, puis identifiant (n° 9 c) |
| I2-5, I2-6 (v0.6) | `reparation-hierarchie.ts`, `planifier-synchronisation.ts` | Domaine | Modifier (après B1) | **B1b** | `ReparationHierarchie.evenementsAjoutes` rempli (n° 9 b) ; `indexerJournal` ignore les entrées de réparation (n° 8) ; `appliquerReparation` reprend `rep.evenementsAjoutes` (n° 11 d). Le champ est **déjà dans le type** (E10 v0.6) : B1 le rend vide |
| I2-22 | `tests/steps/synchronisation/modifications-non-retenues.steps.ts` (nouveau), `etat-affiche.steps.ts`, `tests/steps/commun/appareils.steps.ts`, `tests/steps/objectifs-taches/taches.steps.ts`, `tests/support/synchronisation/valeurs-non-retenues.ts` (nouveau) | Test (steps) | Créer, modifier | D2, D3 | §12.5 |

## 4. Interfaces et signatures (incrément 1, et ce que les incréments suivants doivent respecter)

### 4.1 Domaine
```ts
// src/synchronisation/domaine/version-schema.ts — RG-058, conventions §10.3
export const SCHEMA_VERSION = 1;

// src/synchronisation/domaine/contenu-fichier.ts — ST-socle §5.3 ; DAT §4.2, §4.2.2
export type Generation = { readonly type: 'INITIALE' } | { readonly type: 'NOUVELLE'; readonly hlc: Hlc };  // NOUVELLE : incrément 3
export type ContenuFichierAppareil = {
  readonly schemaVersion: number;
  readonly versionApplication: string;
  readonly generation: Generation;
  readonly appareil: IdAppareil;
  readonly registres: ReadonlyArray<RegistreQuelconque>;
  readonly journal: ReadonlyArray<EvenementJournal>;
};
export type ContenuManifeste = { readonly schemaVersion: number; readonly generation: Generation; readonly restauration?: Hlc };

// src/synchronisation/domaine/fusion.ts — ADR-003, DS-11, DAT §4.2
export type EtatFusionnable = {
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
};
/** Par information : l'écriture de plus grand HLC (comparerHlc) ; journal : union. Commutative, associative, idempotente. */
export const fusionnerEtats: (a: EtatFusionnable, b: EtatFusionnable) => EtatFusionnable;
/**
 * Plan d'intégration d'un fichier reçu : registres gagnants nouveaux ou remplacés, entrées de journal absentes,
 * dernierHlc = max(dernierHlc, plus grand HLC reçu) (réception, DAT §6.4). L'index des écritures en attente
 * n'est jamais modifié par une valeur reçue (DAT §4.1.5 bis).
 */
export const planifierFusion: (etat: EtatLocal, recu: ContenuFichierAppareil) => PlanEcriture;

// src/synchronisation/domaine/depot.ts — DAT §4.1.5 bis, §4.3, ENF-T-07
export const contenuAEnvoyer: (etat: EtatLocal, p: { readonly versionApplication: string; readonly generation: Generation }) => ContenuFichierAppareil;
/** Retire les entrées dont derniereHlc ≤ jusqua (comparerHlc). */
export const retirerDeposees: (index: IndexEnAttente, jusqua: Hlc) => IndexEnAttente;
export const doitDeposer: (etat: EtatLocal, meta: MetaSynchronisation) => boolean;

// src/synchronisation/domaine/meta-synchronisation.ts — données locales non synchronisées (DAT §6.1)
export type MetaSynchronisation = {
  readonly dossier?: IdFichierDrive;
  readonly fichierPropre?: IdFichierDrive;     // mémorisé au premier dépôt confirmé (DAT §4.2.2)
  readonly manifeste?: IdFichierDrive;
  readonly deposeJusquA?: Hlc;
  readonly pageToken?: string;
  readonly dernierContactDrive?: Instant;
  readonly fusionNonDeposee: boolean;          // une fusion a écrit des registres depuis le dernier dépôt confirmé
};
export const META_INITIALE: MetaSynchronisation;  // { fusionNonDeposee: false }
export type PlanSynchronisation = { readonly plan: PlanEcriture; readonly meta: Partial<MetaSynchronisation> };
```
`IdFichierDrive` est déplacé de `transport-synchro.ts` (rang 1) vers `meta-synchronisation.ts`, réexporté par le port (aucun changement de forme).

`doitDeposer(etat, meta)` = index non vide **ou** `fichierPropre` absent **ou** `fusionNonDeposee` **ou** `dernierHlc` défini et différent de `deposeJusquA`.

### 4.2 Application
```ts
// src/synchronisation/application/ports/depot-local.ts — ajouts (ST-socle §5.1 l'annonçait)
export interface DepotLocal {
  // … méthodes du socle, inchangées
  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>>;
  /** Comme `appliquer`, en **une seule** transaction en durabilité stricte (condition de Starck) ; la méta est écrite
   *  dans la même transaction, fusionnée champ à champ (clé absente de `meta` : valeur inchangée). `version`
   *  n'augmente et les observateurs ne sont prévenus que si le plan est non vide. Exception du calcul : rien n'est écrit. */
  appliquerSynchronisation(
    calcul: (etat: EtatLocal, meta: MetaSynchronisation) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>>;
}

// src/synchronisation/application/cycle-synchronisation.ts
export type IssueCycle =
  | 'TERMINE' | 'NON_LANCE_HORS_LIGNE' | 'NON_LANCE_SANS_ACCES' | 'DEJA_EN_COURS'
  | 'ACCES_REFUSE' | 'DRIVE_PLEIN' | 'ECHEC_TRANSITOIRE';
export type DependancesCycle = {
  readonly depot: DepotLocal; readonly transport: TransportSynchro; readonly acces: AccesGoogle;
  readonly reseau: EtatReseau; readonly planificateur: Planificateur; readonly aleatoire: SourceAleatoire;
  readonly horloge: Horloge; readonly journal: JournalTechnique; readonly versionApplication: string;
};
export class CycleSynchronisation implements SuiviCycle {
  constructor(d: DependancesCycle);
  /** Installe les déclencheurs (§6.4) ; idempotent. */
  demarrer(): void;
  arreter(): void;
  /** Un cycle complet : lecture, fusion, manifeste, dépôt. */
  synchroniserMaintenant(): Promise<IssueCycle>;
  /** Dépôt seul, sans lecture (étape « … enregistre ses modifications dans le Drive », déconnexion). */
  deposerMaintenant(): Promise<IssueCycle>;
  etatMoteur(): EtatMoteur;
  /** Promesse du cycle en cours, pour le banc (undefined au repos). */
  cycleEnCours(): Promise<IssueCycle> | undefined;
}
```

### 4.3 Port `TransportSynchro` (complet)
```ts
export type FichierAppareilDistant = { readonly id: IdFichierDrive; readonly appareil: IdAppareil };
export type Changements = { readonly fichiers: ReadonlyArray<FichierAppareilDistant>; readonly jeton: string };
export type ErreurTransport = /* rang 1 */ … | { readonly type: 'FichierIllisible'; readonly cause: 'DECOMPRESSION' | 'JSON' | 'SCHEMA' | 'EMPREINTE' }
  | { readonly type: 'FormatPlusRecent'; readonly schemaVersion: number };   // ce dernier est traité à l'incrément 4
export interface TransportSynchro {
  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  /** Premier passage : tous les fichiers d'appareil du dossier et un jeton de départ (changes.getStartPageToken). */
  listerFichiersAppareils(dossier: IdFichierDrive): Promise<Resultat<Changements, ErreurTransport>>;
  /** changes.list depuis `jeton` (toutes les pages) : fichiers d'appareil créés ou modifiés, non supprimés. */
  changements(dossier: IdFichierDrive, jeton: string): Promise<Resultat<Changements, ErreurTransport>>;
  lireFichierAppareil(id: IdFichierDrive): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>>;
  /** Crée (fichierExistant absent) ou remplace le contenu du fichier de l'appareil ; idempotent. */
  deposerFichierAppareil(p: { readonly dossier: IdFichierDrive; readonly contenu: ContenuFichierAppareil; readonly fichierExistant?: IdFichierDrive }):
    Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  lireManifeste(dossier: IdFichierDrive): Promise<Resultat<{ readonly id: IdFichierDrive; readonly contenu: ContenuManifeste } | undefined, ErreurTransport>>;
  ecrireManifeste(p: { readonly dossier: IdFichierDrive; readonly contenu: ContenuManifeste; readonly fichierExistant?: IdFichierDrive }):
    Promise<Resultat<IdFichierDrive, ErreurTransport>>;
}
```
Ordre et jeton (DAT v0.11.4 §4.3, RL-LOT-001-A3) : `listerFichiersAppareils` obtient le jeton de départ (`changes.getStartPageToken`) **avant** l'inventaire (`files.list`) ; un fichier modifié entre les deux est retrouvé par `changements` (au pire vu deux fois : sans effet, fusion idempotente). `changements` traduit un jeton refusé par Drive (400 ou 404 sur `changes.list`) en `{ type: 'JetonChangementsInvalide' }`, ajouté à `ErreurTransport`. Contrat (CT-TRANS-01 à 08 ; 09 : fichier modifié pendant l'inventaire retrouvé par `changements` ; 10 : jeton refusé → `JetonChangementsInvalide`) : `preparerDossier` idempotent (deux appels → un seul dossier) ; un dépôt suivi d'une lecture rend un contenu égal ; un second dépôt sur `fichierExistant` ne crée pas de second fichier ; `changements` ne renvoie que les fichiers modifiés depuis le jeton ; un fichier altéré rend `FichierIllisible` (cause exacte) ; un `schemaVersion` supérieur à `SCHEMA_VERSION` rend `FormatPlusRecent` ; aucune méthode ne lève d'exception ; `NonAutorise` sur un accès retiré.

### 4.4 Adaptateurs
| Adaptateur | Points d'attention |
|---|---|
| `TransportSynchroDrive` | Fichier d'appareil : `name = "<appareilId>.etat.json.gz"`, `appProperties = { donejuan: "appareil", appareil: "<appareilId>" }`, parent = dossier, `mimeType = application/gzip`, création en `uploadType=multipart`, remplacement en `PATCH uploadType=media` ; **sans `fichierExistant`, le fichier de l'appareil est d'abord recherché** (`appProperties` `appareil`) et remplacé s'il existe : un dépôt dont la réponse a été perdue ne crée jamais de second fichier (CT-TRANS-03, UT-US-017-19). Manifeste : `manifeste.json`, `appProperties = { donejuan: "manifeste" }`, `application/json`. `LISEZ-MOI.txt` créé une fois avec le manifeste (texte fixe du §5.2). Recherche par `appProperties` et `'<dossier>' in parents and trashed = false`. Champs demandés : `id,name,appProperties,createdTime,modifiedTime`. |
| `DepotLocalDexie` | Table `meta` étendue (§5.1) ; `appliquerSynchronisation` dans la même transaction `rw` stricte que `appliquer` |

### 4.5 Présentation
| Élément | Modèle de vue | Codes |
|---|---|---|
| Point « en attente » d'une ligne | `mentionAttente(element: RefElementMetier, enAttente: ReadonlySet<string>): { code: 'MEN-ATTENTE' } \| undefined` ; ligne d'objectif : champ `attente?: { code: 'MEN-ATTENTE'; libelle }` de `LigneObjectif` (v0.3.1) | `MEN-ATTENTE` |
| Indicateur, bandeaux | ST-US-022 §4.5 (données réelles à partir du rang 3) | `SYN-…`, `BAN-…` |
| Feuille (ECR-011) : dernier échange, modifications en attente, erreurs | `construireFeuilleSynchronisation(e)` (ECR-011 ; incrément 1 : `SYN-FEUILLE-DERNIER-ECHANGE`, `SYN-FEUILLE-RIEN-EN-ATTENTE`, `SYN-FEUILLE-EN-ATTENTE` (une ligne par élément), `SYN-FEUILLE-HORS-LIGNE`, `SYN-FEUILLE-BOUTON`, `SYN-FEUILLE-DOSSIER` ; cartes `ERR-011`, `ERR-016`) | idem ; **ordre des lignes** (guide v0.2.14 §5.8 f, RL-LOT-001-S3) : `comparerLignesFeuille` (`ordre-feuille.ts`) : la plus récente d'abord (physique du `derniereHlc` de l'élément), à égalité intitulé, puis id ; même ordre pour les informations à lire (incrément 2), `ALR-014` groupé sous `ALR-008` |

### 4.5 bis Feuille ECR-011 de l'incrément 1 et point « en attente » (v0.4, DT-011)
Les squelettes font foi pour les types (`feuille-synchronisation.ts`, `FeuilleSynchronisation.tsx`, `heure.ts`).

```ts
export type EntreeFeuilleSynchronisation = {
  readonly etat: EtatSynchronisationAffichable;
  readonly maintenant: Instant;
  readonly dernierEchange?: Instant;                                 // MetaSynchronisation.dernierContactDrive
  readonly elementsEnAttente: ReadonlyArray<LigneFeuilleOrdonnable>; // un élément MEN-ATTENTE par entrée
};
export const construireFeuilleSynchronisation: (e: EntreeFeuilleSynchronisation) => ModeleVueFeuilleSynchronisation;
export const FeuilleSynchronisation: (p: {
  vue: ModeleVueFeuilleSynchronisation; surSynchroniser: () => void; surActionCarte: (a: ActionCarteFeuille) => void;
}) => ReactElement;
export const formaterHeure: (i: Instant) => string;                       // « 10 h 32 »
export const formaterAnciennete: (i: Instant, maintenant: Instant) => string;
```

| Élément | Règle | Test |
|---|---|---|
| `formaterHeure` | Heure de Paris (DEC-012) ; heures sans zéro initial, minutes sur deux chiffres ; espaces insécables : « 9 h 05 » | UT-US-017-34 |
| `formaterAnciennete` | e = `maintenant - instant` : e < 1 min (négatif compris) « à l’instant » ; e < 1 h « il y a {⌊e / 1 min⌋} min » ; e < 24 h « il y a {⌊e / 1 h⌋} h » ; sinon « hier à {heure} » si le jour de Paris de l'instant est la veille de celui de `maintenant`, sinon « le {formaterDate} à {heure} ». Espace insécable entre le nombre et l'unité | UT-US-017-34 |
| `dernierEchange` | Présent si et seulement si l'entrée a `dernierEchange` : `libelle('SYN-FEUILLE-DERNIER-ECHANGE', { anciennete, heure })` | UT-US-017-35 |
| `attente` | Aucun élément : `SYN-FEUILLE-RIEN-EN-ATTENTE`. Sinon `SYN-FEUILLE-EN-ATTENTE`, `n` = **nombre de lignes** (guide §6.6.1, « Décompte » ; pas `etat.enAttente`), `lignes` = `{ id, intitule }` triées par `comparerLignesFeuille` | UT-US-017-36 |
| `horsLigne`, `bouton` | `reseau = COUPE` : ligne `SYN-FEUILLE-HORS-LIGNE`, bouton `disponible: false` avec `explication` (`libelle('SYN-FEUILLE-BOUTON', {}, 'texte')`). Connecté : pas de ligne, bouton disponible sans `explication`, quel que soit le cycle | UT-US-017-37 |
| `cartes` | `actionRequise = DRIVE_PLEIN` : `ERR-011`, action `OUVRIR_GOOGLE_DRIVE` ; `ECHEC_PERSISTANT` : `ERR-016` avec `n` = nombre de lignes, action `REESSAYER_MAINTENANT` ; titre = libellé, texte = partie `texte`, libellé d'action = partie `action` du catalogue. Aucune carte sinon (`ERR-012`, `ERR-013` : incréments 3 et 4 ; accès perdu : bandeau) | UT-US-017-38 |
| `SYN-FEUILLE-DOSSIER` | Non repris dans la section « Synchronisation » : déjà affiché par la section « Compte » (`section-compte.ts`, UT-COMP-US-022-82) | — |
| `FeuilleSynchronisation` | Chaque ligne expose son code dans `data-etat`, sur l'élément dont le texte est exactement le libellé ; liste `<ul>` nommée par son titre (`aria-labelledby`), une `<li>` par ligne, texte = intitulé ; bouton natif `<button data-etat="SYN-FEUILLE-BOUTON">` : indisponible, `aria-disabled="true"` (jamais `disabled`), focalisable, sans effet au clic ni au clavier, explication liée par `aria-describedby` ; carte : conteneur `data-message="ERR-0xx"` avec titre, texte et bouton natif de l'action, qui appelle `surActionCarte(type)`. Boutons natifs plutôt qu'`IonButton` : le contrat `aria-disabled` focalisable n'est pas tenu par `IonButton` (même décision que `BoiteConfirmation`, DT-006) | UT-US-017-39 |
| Ligne d'objectif | `attente = { code: 'MEN-ATTENTE', libelle: '', nomAccessible: 'Modification en attente d’envoi' }` ; `nomAccessible` de la ligne inchangé. Composant : point `data-code="MEN-ATTENTE"` sans texte, dans le bouton de la ligne, qui le décrit par `aria-describedby` (le nom du bouton vient de son `aria-label`) | UT-US-001-36, 37 |
| `elementsEnAttenteDetailles` (v0.4.1) | Une entrée par élément (objectif ou tâche) ayant au moins une entrée dans `etat.enAttente` ; une entrée de lien compte pour sa tâche (`elementDeCle`) ; nombre d'entrées = `decompterModificationsEnAttente` ; `instant` = physique du plus grand `derniereHlc` de l'élément ; `intitule` = valeur du registre `intitule`, même si l'élément est supprimé, `''` si le registre est absent ; ordre non garanti. Forme identique à `LigneFeuilleOrdonnable` (pas de dépendance du domaine vers la présentation) | UT-COMP-US-017-54 |
| Contrôleur (v0.4.1) | `vue.feuille` présente dès qu'un espace est ouvert et que l'indicateur l'est ; actions transmises | UT-COMP-US-017-53 (Benjamin, écrit avant le code) |

### 4.6 Incrément 2 (rang 9, v0.5) : signatures
Les squelettes font foi pour les types et les commentaires de contrat (fichiers du §3.4) ; résumé :

```ts
// domaine/condensat-sha256.ts
export const condensatSha256: (octets: Uint8Array) => Uint8Array;          // FIPS 180-4, 32 octets
export const encoderBase32Hex: (octets: Uint8Array) => string;             // RFC 4648 §7, minuscules, sans « = »

// domaine/valeurs-ecartees.ts
export type IdValeurEcartee = Marque<string, 'IdValeurEcartee'>;
export const idValeurEcartee: (cle: CleInformation, hlcEcarte: Hlc) => IdValeurEcartee;
export type ValeurEcartee =
  | { id; ecartee: RegistreQuelconque; motif: 'CONFLIT'; gagnante: RegistreQuelconque }                       // ALR-009
  | { id; ecartee; motif: 'SUPPRESSION'; gagnante: RegistreQuelconque /* registre suppression */; intituleElement?: string } // ALR-010
  | { id; ecartee; motif: 'PLACEMENT_ANNULE'; gagnante: RegistreQuelconque /* registre de réparation */ }     // ALR-011
  | { id; ecartee; motif: 'DONNEES_EFFACEES'; generation: Hlc };                                               // ALR-014 (incr. 3)
export const MOTIFS_A_LIRE: ReadonlySet<MotifValeurEcartee>;               // CONFLIT, SUPPRESSION, PLACEMENT_ANNULE (H-6)
export const hlcDuGagnant: (v: ValeurEcartee) => Hlc;                      // gagnante.ecriture.hlc ou generation
export type RegistresDeLEtat = { readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque> };
export const detecterValeursEcartees: (local: RegistresDeLEtat, recu: RegistresDeLEtat) => ReadonlyArray<ValeurEcartee>;
export const fusionnerValeursEcartees: (connues: ReadonlyMap<IdValeurEcartee, ValeurEcartee>, nouvelles: Iterable<ValeurEcartee>)
  => ReadonlyMap<IdValeurEcartee, ValeurEcartee>;

// domaine/lectures.ts
export type Lecture = { readonly id: IdValeurEcartee; readonly hlc: Hlc };
export const fusionnerLectures: (connues: ReadonlyMap<IdValeurEcartee, Lecture>, nouvelles: Iterable<Lecture>) => ReadonlyMap<…>;
export const compterALire: (valeurs: ReadonlyMap<IdValeurEcartee, ValeurEcartee>, lectures: ReadonlyMap<IdValeurEcartee, Lecture>) => number;

// domaine/signalements.ts (livré complet)
export type Signalements = { valeursEcartees: ReadonlyMap<IdValeurEcartee, ValeurEcartee>; lectures: ReadonlyMap<IdValeurEcartee, Lecture> };
export const SIGNALEMENTS_VIDES: Signalements;
export type AjoutsSignalements = { valeursEcartees: ReadonlyArray<ValeurEcartee>; lectures: ReadonlyArray<Lecture> };

// domaine/reparation-hierarchie.ts
export type ReparationHierarchie = { registresEcrits: ReadonlyArray<RegistreQuelconque>;
  valeursEcartees: ReadonlyArray<ValeurEcartee & { motif: 'PLACEMENT_ANNULE' }>;
  evenementsAjoutes: ReadonlyArray<EvenementJournal>;   // v0.6, n° 9 b (vide en B1)
  dernierHlc?: Hlc };

// domaine/entree-reparation.ts (v0.6, B1b)
export const idEvenementDeReparation: (objectif: IdObjectif, hlcAnnule: Hlc) => IdEvenement;  // texte de idValeurEcartee(clé parent, hlcAnnule)
export const estIdEvenementDeReparation: (id: IdEvenement) => boolean;                       // FORME_ID_EVENEMENT_REPARATION.test(id)
export type Annulation = { objectif: IdObjectif; annule: PlacementObjectif; retabli: PlacementObjectif };
export const entreeDeReparation: (journal: ReadonlyMap<IdEvenement, EvenementJournal>, a: Annulation) => EvenementJournal;
// domaine/identifiant-evenement.ts (v0.6, B1b)
export const FORME_ID_EVENEMENT_REPARATION: RegExp;   // /^[0-9a-v]{52}$/ ; lireIdEvenement accepte les deux formes
export const reparerHierarchie: (etat: EtatLocal, physiqueCorrigee: Instant) => ReparationHierarchie;

// domaine/planifier-synchronisation.ts
export const planifierSynchronisation: (etat: EtatLocal, signalements: Signalements, recu: ContenuFichierAppareil,
  physiqueCorrigee: Instant) => PlanSynchronisation;

// domaine/meta-synchronisation.ts, contenu-fichier.ts, depot.ts (ajouts optionnels, absents ≡ vides)
PlanSynchronisation.signalements?: AjoutsSignalements;
ContenuFichierAppareil.valeursEcartees?: ReadonlyArray<ValeurEcartee>; ContenuFichierAppareil.lectures?: ReadonlyArray<Lecture>;
contenuAEnvoyer(etat, { versionApplication, generation, signalements?: Signalements });

// domaine/detail-valeurs-ecartees.ts (D1)
export type InformationSignalee = 'INTITULE' | 'DESCRIPTION' | 'DELAI' | 'ESTIMATION' | 'OBJECTIFS' | 'PARENT' | 'ETAT' | 'CREATION';
export type ValeurSignalee = { type: 'TEXTE'; texte } | { type: 'AUCUNE' } | { type: 'DATE'; date } | { type: 'DUREE'; duree }
  | { type: 'ETAT'; etat; date?: DateCalendaire /* v0.6 */ } | { type: 'SOUS'; intitule } | { type: 'PRINCIPAL' } | { type: 'RATTACHEE'; intitule }
  | { type: 'DETACHEE'; intitule } | { type: 'SOUS_TACHE_DE'; intitule } | { type: 'CREEE' } | { type: 'TACHE_SUPPRIMEE' }
  | { type: 'OBJECTIF_SUPPRIME' } | { type: 'SUPPRIMEE_AVEC'; intitule } | { type: 'PLACEMENT_ANNULE' } | { type: 'DONNEES_EFFACEES' };
export type ValeurEcarteeDetaillee = { id; motif; element: RefElementMetier; intitule: string; information: InformationSignalee;
  valeurNonRetenue: ValeurSignalee; valeurConservee: ValeurSignalee; instant: Instant; lue: boolean; elementExiste: boolean;
  supprime?: RefElementMetier };
export const detaillerValeursEcartees: (etat: EtatLocal, s: Signalements) => ReadonlyArray<ValeurEcarteeDetaillee>;

// application/ports/depot-local.ts
appliquerSynchronisation(calcul: (etat: EtatLocal, meta: MetaSynchronisation, signalements: Signalements) => PlanSynchronisation)
  : Promise<Resultat<undefined, ErreurDepotLocal>>;
lireSignalements(): Promise<Resultat<Signalements, ErreurDepotLocal>>;

// application/cas-usage/marquer-comme-lue.ts
export class MarquerCommeLue {
  constructor(d: { readonly depot: DepotLocal; readonly horloge: Horloge });
  executer(ids: ReadonlyArray<IdValeurEcartee>): Promise<Resultat<undefined, ErreurDepotLocal>>;
}
// application/requetes/consulter-modifications-non-retenues.ts
export type ModificationsNonRetenuesLues = { readonly valeurs: ReadonlyArray<ValeurEcarteeDetaillee>; readonly aLire: number };
export const consulterModificationsNonRetenues: (depot: Pick<DepotLocal, 'lire' | 'lireSignalements'>)
  => Promise<Resultat<ModificationsNonRetenuesLues, ErreurDepotLocal>>;
// application/requetes/consulter-etat-synchronisation.ts
AttenteLocale.aLire?: number;   // absent ≡ 0 ; source d'EtatSynchronisationLu.aLire

// presentation/modeles-de-vue/modifications-non-retenues.ts (D1)
export type LigneModificationNonRetenue = { id; code: 'ALR-009' | 'ALR-010' | 'ALR-011'; variante?: 'tache' | 'rattachement' | 'placement';
  element: string; information; valeurNonRetenue; valeurConservee; titre: string; voir?: RefElementMetier };
export type ModeleVueModificationsNonRetenues = { code: 'SYN-FEUILLE-A-LIRE'; n: number; libelle: string;
  lignes: ReadonlyArray<LigneModificationNonRetenue>;
  donneesEffacees?: { code: 'ALR-008'; ids: ReadonlyArray<string>; lignes: ReadonlyArray<LigneDonneeEffacee> } };
export const construireModificationsNonRetenues: (valeurs: ReadonlyArray<ValeurEcarteeDetaillee>) => ModeleVueModificationsNonRetenues | undefined;
// presentation/ui/ModificationsNonRetenues.tsx (D1)
export const ModificationsNonRetenues: (p: { vue; surCompris: (ids: ReadonlyArray<string>) => void;
  surVoir: (element: RefElementMetier) => void }) => ReactElement;
```

## 5. Modèle de données et migrations

### 5.1 Stockage local
Base de l'espace : **version Dexie 2** (incrément 1) : aucune nouvelle table ; table `meta` : clés `dossier`, `fichierPropre`, `manifeste`, `deposeJusquA`, `pageToken`, `dernierContactDrive`, `fusionNonDeposee`. Version 3 (incrément 2) : tables `valeursEcartees` (clé `id`) et `lectures` (clé `id`). Version 4 (incrément 4) : table `registresInconnus` (clé `cle`) ; clé `mesuresHorloge` de la méta (tableau de millisecondes, 5 au plus). Toutes sont des ajouts purs (aucune transformation de donnée).

**Version 3 (v0.5, tranche B2)** : `base.version(3).stores({ ...tables, valeursEcartees: 'id', lectures: 'id' })`, sans fonction de mise à niveau ; `TABLES` inclut les deux nouvelles tables (transactions `rw` d'`appliquer` et d'`appliquerSynchronisation`). Lignes validées par Zod (`stockage-local/schemas.ts`) : une ligne illisible donne `DonneesLocalesIllisibles`, comme les autres tables. Forme des lignes : celle du fichier Drive (§5.2), sans table d'appareils (`appareil` en clair, comme les registres de la table `registres`). Test : UT-US-017-53 (base version 2 existante ouverte sans perte), CT-DEPOT-12, 13. **v0.6** : la table `journal` reçoit aussi des entrées de réparation (identifiant de 52 caractères `[0-9a-v]`, n° 9 d) ; le schéma Zod de la ligne les accepte par `lireIdEvenement` ; ni version de base ni index nouveaux. UT-US-017-106.

### 5.2 Fichier d'appareil, schéma 1 (contenu logique : ST-socle §5.3)
JSON avant compression (clés dans l'ordre de la sérialisation canonique, tri lexicographique à tous les niveaux) :

```json
{
  "appareil": { "id": "<appareilId>", "plateforme": "web" },
  "appareils": ["<appareilId 0>", "<appareilId 1>"],
  "empreinte": "<64 hexadécimaux>",
  "generation": { "type": "INITIALE" },
  "journal": [ { "id": "…", "type": "CREATION", "element": { "type": "OBJECTIF", "id": "…" }, "avant": {}, "apres": { … },
                 "hlc": { "physique": "2026-10-21T08:00:00.000Z", "compteur": 0, "appareil": 0 },
                 "instant": "2026-10-21T08:00:00.000Z", "jour": "2026-10-21", "cause": "…" } ],
  "lectures": [],
  "registres": [ { "type": "OBJECTIF", "id": "…", "champ": "delai", "valeur": "2026-12-15",
                   "hlc": { "physique": "…", "compteur": 0, "appareil": 1 }, "contexte": { "0": { … } } } ],
  "schemaVersion": 1,
  "valeursEcartees": [],
  "versionApplication": "0.1.0"
}
```
- `appareils` : table des `appareilId` cités (HLC, contextes, `appareil` d'un HLC = indice dans cette table), triée dans l'ordre lexicographique.
- `valeur` : `undefined` → `null` ; `Instant` → ISO ; `Duree` → entier de minutes ; `PlacementObjectif.hlcOrigine` et `CycleDeVie` sérialisés champ à champ.
- `contexte` omis s'il est vide ; `cause` omise si absente.
- **Empreinte** : SHA-256 (hexadécimal minuscule) de `serialiserCanonique(objet sans la clé empreinte)` encodé en UTF-8.
- **Compression** : gzip de l'UTF-8 de `serialiserCanonique(objet complet)`.
- `lectures` et `valeursEcartees` restent vides jusqu'à l'incrément 2 ; un lecteur les tolère.
- **Incrément 2 (v0.5)** : l'encodeur écrit toujours les deux tableaux (vides compris), triés par `id`. Lecture : `{ "id": "<52 car.>", "hlc": <hlc> }`. Valeur écartée : `{ "id", "motif", "ecartee": <registre>, "gagnante"?: <registre>, "generation"?: <hlc>, "intituleElement"?: "…" }`, où `<registre>` a la forme d'une entrée de `registres` (type, id, champ, valeur, hlc, contexte) et `<hlc>` celle des HLC du fichier (`appareil` = indice dans `appareils`, qui inclut les appareils cités par ces tableaux). `gagnante` présent pour `CONFLIT`, `SUPPRESSION`, `PLACEMENT_ANNULE` ; `generation` pour `DONNEES_EFFACEES`. Le décodeur rend `valeursEcartees` et `lectures` **si et seulement si** le tableau lu est non vide (UT-US-017-12 inchangé) ; une entrée de `motif` inconnu, ou dont un registre est de type ou de champ inconnu, est ignorée (tolérance du §5.3) ; une entrée mal formée rend `FichierIllisible` `SCHEMA`. UT-US-017-52. **v0.6** : une entrée de `journal` peut porter un identifiant de réparation (52 caractères `[0-9a-v]`, sans « : », n° 9 d), accepté par le décodeur ; pas de nouveau `schemaVersion` (Q-ST017-STA-5 b). UT-US-017-106.

Manifeste : `{ "empreinte": "…", "generation": { "type": "INITIALE" }, "schemaVersion": 1 }` (+ `restauration` : incrément 3). `LISEZ-MOI.txt` : « Ce dossier contient les données de l'application Done Juan. Ne modifiez pas ces fichiers : l'application les gère seule. »

### 5.3 Compatibilité (RG-058, conventions §10.3)
Schéma 1 publié par l'incrément 1. Lecture tolérante : objets lâches ; à l'incrément 1, un registre de type ou de champ inconnu, comme une entrée de journal de type inconnu (Q-BRU-R3-2), est **ignoré** (non fusionné), sans erreur ; l'incrément 4 le **conserve** (table `registresInconnus`) et le réécrit (ANT-19). Tests obligatoires (a) à (c) du §10.3 des conventions : incrément 4.

## 6. Règles et algorithmes

### 6.1 Fusion
```text
fusionnerEtats(a, b) :
  registres : pour chaque clé de a ∪ b : celle des deux écritures dont comparerHlc est le plus grand (une seule si une seule existe)
  journal : union par identifiant (deux entrées de même identifiant sont identiques par construction)
planifierFusion(etat, recu) :
  pour chaque registre r de recu : si absent localement ou comparerHlc(r.hlc, local.hlc) > 0 → registresEcrits
  evenementsAjoutes = entrées de recu.journal absentes de etat.journal
  h = plus grand HLC de recu (registres et journal) ; etatApres.dernierHlc = maxHlc(etat.dernierHlc, h)
  enAttente inchangé ; projection : registres remplacés
```
Une écriture locale en attente qui perd reste dans l'index jusqu'au dépôt suivant (le signalement relève de l'incrément 2).

### 6.2 Dépôt
```text
deposer() :
  (etat, meta) ← lire
  si non doitDeposer(etat, meta) : TERMINE
  x ← etat.dernierHlc ; contenu ← contenuAEnvoyer(etat, …)
  id ← transport.deposerFichierAppareil({ dossier, contenu, fichierExistant: meta.fichierPropre })
  depot.appliquerSynchronisation((e, m) ⇒ {
      plan : enAttenteRetirees = clés de e.enAttente dont derniereHlc ≤ x ;
      meta : { fichierPropre: id, deposeJusquA: x, fusionNonDeposee: false, dernierContactDrive: maintenant } })
```
Une écriture faite pendant le dépôt a un HLC > x : elle reste en attente (DAT §4.1.5 bis). `deposeJusquA` n'avance qu'après la confirmation de Drive (ENF-T-07).

### 6.3 Cycle
```text
synchroniserMaintenant() :
  si un cycle est en cours : marquer « à refaire » ; DEJA_EN_COURS
  si réseau coupé : NON_LANCE_HORS_LIGNE ; si acces.etat() ≠ VALIDE : NON_LANCE_SANS_ACCES
  état moteur ← EN_COURS
  dossier ← meta.dossier ?? transport.preparerDossier()
  (fichiers, jeton) ← meta.pageToken ? transport.changements(dossier, pageToken) : transport.listerFichiersAppareils(dossier)
      JetonChangementsInvalide → meta.pageToken oublié ; (fichiers, jeton) ← transport.listerFichiersAppareils(dossier), dans le même cycle,
                                 sans tentative comptée ni attente (DAT v0.11.4 §4.3 ; UT-US-017-32)
  pour chaque fichier f d'un autre appareil (f.appareil ≠ appareil local) :
      c ← transport.lireFichierAppareil(f.id) ; en FichierIllisible, FormatPlusRecent ou RessourceIntrouvable (fichier supprimé entre l'inventaire et la lecture) : journal « avertissement », f ignoré (incr. 3 et 4 : traitement)
      sinon depot.appliquerSynchronisation(e ⇒ { plan: planifierFusion(e, c), meta: { fusionNonDeposee: plan non vide ? true : inchangé } })
  un fichier dont l'appareil n'est pas l'appareil local est fusionné, y compris l'ancien fichier de cette installation après « Supprimer les données » :
  l'appareilId naît avec l'espace (DAT v0.11.3 §4.1.4), ce fichier est donc celui d'un appareil inactif ; il est fusionné sans traitement
  particulier, l'archivage étant hors du lot 1 (DAT v0.11.4 §4.2, dette DT-002) ; les fichiers d'appareil sont à la racine du dossier (RL-A2)
  si aucun manifeste (meta.manifeste absent et lireManifeste = undefined) : ecrireManifeste({ schemaVersion: 1, generation: INITIALE }) et LISEZ-MOI
  meta.pageToken ← jeton (v0.3.1 : dès que toutes les fusions sont validées, écrit seulement s'il a changé) ; deposer() ; état moteur ← REPOS ; tentatives ← 0
  si « à refaire » : relancer une fois
erreurs (à toute étape) :
  NonAutorise → acces.signalerRefus() ; REPOS ; ACCES_REFUSE (aucune reprise automatique ; le retour du jeton relance)
  EspaceDrivePlein → actionRequise DRIVE_PLEIN ; DRIVE_PLEIN (reprise au déclencheur suivant ; disparaît au premier dépôt réussi)
  ReseauIndisponible → REPOS (le retour du réseau relance)
  ServeurIndisponible, QuotaDepasse → tentatives += 1 ; si tentatives < TENTATIVES_AVANT_ABANDON : RETENTATIVE, sinon actionRequise ECHEC_PERSISTANT ;
      nouvelle tentative programmée après delaiAvantTentative(tentatives, gigue) (les tentatives continuent au palier, DAT §4.3)
  DriveIndisponible (403 sur un compte connecté) → actionRequise ECHEC_PERSISTANT
```

### 6.4 Déclencheurs (DAT §4.3)
| Déclencheur | Mise en œuvre |
|---|---|
| Ouverture (session ouverte avec accès valide) | `demarrer()` puis `synchroniserMaintenant()` |
| Retour au premier plan | `visibilitychange` (composition) → `cycle.definirPremierPlan(visible)` : visible → période réinstallée et `synchroniserMaintenant()` ; masquée → période suspendue |
| Modification locale | `depot.observer` : si aucun minuteur n'est armé, `planificateur.apres(TEMPORISATION_DEPOT)` → `synchroniserMaintenant()` (le premier changement fixe l'échéance ; pas de report) |
| Toutes les 2 min au premier plan | `planificateur.periodiquement(PERIODE_SYNCHRONISATION_PREMIER_PLAN)` ; suspendu quand la page est masquée |
| Retour du réseau | `reseau.surChangement(true)` |
| Retour du jeton | `acces.observer` : passage à `VALIDE` |
| « Synchroniser maintenant », geste de reconnexion réussi | Appel direct |

### 6.5 `DepotAvantSortieSynchro`
`compterEnAttente` = décompte du socle ; `deposerSiPossible` : réseau connecté, accès `VALIDE` et pas de consultation seule (incrément 4) → `deposerMaintenant()` (`TERMINE` → `DEPOSE`, sinon `ECHEC`) ; sinon `NON_TENTE`.

### 6.6 Incrément 2 (rang 9) : règles arrêtées (détaillées en v0.5)
Rappel de la v0.3 : valeur écartée (DAT §4.2.1), réparation RG-048 (DAT §4.2), RG-049 dérivée (ST-US-024 §6.6), affichage `ALR-009` à `ALR-011`, `ALR-014`, `aLire` (H-6). Règles détaillées, qui font foi :

1. **Identifiant** : `idValeurEcartee(cle, h)` = `encoderBase32Hex(condensatSha256(UTF-8 de "${type}|${id}|${champ}|${h.appareil}|${h.physique}|${h.compteur}"))` (52 caractères `[0-9a-v]`, sans « : »), `physique` en millisecondes entières écrites en décimal. `h` = HLC de l'écriture écartée L ; pour un placement annulé, `hlcOrigine` du placement annulé (« HLC du déplacement annulé », DAT §4.2), donc identique sur tous les appareils même si la valeur annulée a été réécrite par une réparation. Condensat synchrone codé dans le domaine (`crypto.subtle` est asynchrone, donc exclu d'un calcul de transaction ; aucune dépendance ajoutée). UT-US-017-40.
2. **Conflit** (`CONFLIT`, RG-036) : `detecterValeursEcartees(local, recu)` reçoit les états **avant** fusion. Pour chaque clé présente des deux côtés avec deux écritures de HLC différents : W = la plus grande (`comparerHlc`), L = l'autre ; entrée si et seulement si `champ ≠ 'suppression'`, `non estConnue(W.ecriture, L.ecriture)` et les deux valeurs ne sont pas **structurellement égales** (égalité récursive des objets et des primitives, une propriété `undefined` valant absence). `ecartee = L`, `gagnante = W`. UT-US-017-41, 42.
3. **Pierre tombale** (`SUPPRESSION`, RG-047, H-1) : pour chaque élément E qui a au moins un registre `suppression` dans `local` ou `recu` (les pierres tombales de E : D₁…Dₙ, au plus deux écritures), sont examinées toutes les écritures R de `local` et de `recu` (les deux versions d'une clé si elles diffèrent) qui sont **d'un champ de E** autre que `suppression`, ou qui **pointent vers E** : registre de lien dont l'`objectifId` vaut E (quelle que soit la valeur d'`actif`), registre `parent` dont `parentId` vaut E, registre `creation` d'une tâche dont `tacheParenteId` vaut E (même prédicat que `contexteDePierreTombale`, socle §6.4). Seules les paires dont D ou R est une écriture de `recu` sont examinées. R est écartée si **aucune** des Dᵢ ne la connaît (`estConnue(Dᵢ.ecriture, R.ecriture)` faux pour tout i) ; `gagnante` = la Dᵢ de plus grand HLC. UT-US-017-43, 44.
4. **Intitulé connu de la suppression** (`intituleElement`, US-002 S23, US-018 S08) : pour une entrée `SUPPRESSION`, parmi les registres `intitule` de l'élément de R (`elementDeCle(R.cle)`) présents dans `local` et dans `recu`, ceux que la `gagnante` connaît ; `intituleElement` = la valeur du plus grand (HLC) d'entre eux ; absent s'il n'y en a aucun. UT-US-017-45.
5. **Union** (`fusionnerValeursEcartees`) : par identifiant ; pour un même identifiant, l'entrée de plus petit `hlcDuGagnant` (DAT §4.2.1) ; à égalité, celle qui porte `intituleElement`, puis le plus petit `intituleElement` (unités de code) ; à égalité complète, l'entrée déjà connue (même référence : rien à réécrire). Commutative, associative, idempotente. `detecterValeursEcartees` rend ses entrées triées par identifiant. UT-US-017-45, 46.
6. **Lectures** (« Compris », RG-056 b) : `Lecture = { id, hlc }` ; union par identifiant, plus grand HLC. `compterALire` = nombre d'entrées de motif `CONFLIT`, `SUPPRESSION` ou `PLACEMENT_ANNULE` sans lecture ; une lecture d'identifiant inconnu est conservée mais ne compte pas (H-6). `MarquerCommeLue.executer(ids)` : une transaction `appliquerSynchronisation` ; identifiants inconnus de `signalements.valeursEcartees` ou déjà lus ignorés ; s'il n'en reste aucun, plan vide et aucun signalement (version inchangée) ; sinon h = `hlcSuivant(etat.dernierHlc, Instant.decaler(horloge.maintenant(), etat.correctionHorloge), etat.appareilId)`, **une** lecture `{ id, hlc: h }` par identifiant retenu, `plan = PLAN_VIDE(etat)` avec `etatApres.dernierHlc = h`, `meta = {}` (le dépôt suit : `dernierHlc ≠ deposeJusquA`). La lecture n'entre pas dans l'index des écritures en attente (ni `MEN-ATTENTE`, ni décompte). UT-US-017-47, 55.
7. **Réparation, validité** (RG-048) : sur l'état **fusionné**. Objectifs considérés : ceux qui ont un registre `creation` et pas de registre `suppression`. Parent effectif de x : `parent.parentId` s'il désigne un objectif considéré, sinon aucun (RG-047 dérivée : parent supprimé ou absent = principal). Violation : x a un parent effectif p et p a lui-même un parent effectif ; **participants** : x et p. Les cycles sont des cas particuliers.
8. **Boucle** : tant qu'il existe des participants, candidats = participants dont le placement **courant** a l'origine `DEPLACEMENT` (une création n'est jamais candidate) ; annuler le candidat de plus petit `hlcOrigine` (`comparerHlc` : physique, compteur, appareil), puis de plus petit identifiant (unités de code) ; réévaluer. Un déplacement déjà annulé dans la passe (même x, même `hlcOrigine`) n'est plus candidat (**garde de Bruce, confirmée en v0.6** : elle n'est atteinte qu'avec un journal incohérent, et assure la terminaison sans exception ; §8 n° 10). Aucun candidat : arrêt (garde de terminaison, non atteinte d'après le DAT). Valeur rétablie = `avant` de l'entrée `CHANGEMENT_PARENT` du journal dont l'élément est x, dont le **HLC est égal** à `hlcOrigine` du placement annulé (celle du déplacement ; une valeur rétablie d'origine `DEPLACEMENT` reste candidate avec son propre `hlcOrigine`) **et dont l'identifiant est de la forme `${operation}:${rang}`** (v0.6 : une entrée de réparation, n° 9 b, porte le même HLC et le même élément ; elle n'est jamais prise, quel que soit l'ordre du journal ; l'index `indexerJournal` l'écarte par `estIdEvenementDeReparation`) ; entrée absente : `{ origine: 'CREATION', hlcOrigine: HLC du registre creation de x }` (principal). UT-US-017-48 à 50, 102.
9. **Écritures de réparation** : un registre `parent` par objectif annulé au moins une fois, de valeur finale (la dernière valeur rétablie), écrits dans l'ordre de la première annulation de chaque objectif ; HLC successifs `hlcSuivant(dernier, physiqueCorrigee, etat.appareilId)` à partir de `etat.dernierHlc` ; contexte = `contexteDeNouvelleEcriture(registre parent de x dans l'état fusionné, etat.appareilId)`. (**v0.6** : la phrase « aucune entrée de journal » de la v0.5 est retirée, non conforme à RG-050, US-023 CA-11 et au glossaire d'étapes §11 ; Q-ST017-PEP-2 b ; l'entrée est spécifiée au n° 9 b.) Les réparations n'entrent pas dans l'index des écritures en attente ; elles sont déposées par `fusionNonDeposee`. Deux appareils écrivent la même valeur : le conflit entre leurs deux réparations n'est pas signalé (n° 2, valeurs égales).
9 b. **Entrée de journal d'une annulation (v0.6, RG-050 ; US-023 CA-11, S18d ; glossaire d'étapes v1.12 §11 ; DAT §6.1 « Entrées produites par la fusion »)** : pour **chaque** annulation (x, placement annulé A d'`hlcOrigine` h, valeur rétablie R du n° 8, celle de **ce pas** de la boucle), une entrée `entreeDeReparation(etat.journal, { objectif: x, annule: A, retabli: R })` :
   - `id` = `idEvenementDeReparation(x, h)` = **le texte** de `idValeurEcartee({ type: 'OBJECTIF', id: x, champ: 'parent' }, h)`, celui du signalement du n° 10 (52 caractères `[0-9a-v]`, sans « : ») ;
   - `type` = `CHANGEMENT_PARENT`, `element` = `{ type: 'OBJECTIF', id: x }`, `avant` = A, `apres` = R (champs `parentId?`, `origine`, `hlcOrigine` ; `parentId` absent pour un principal) ;
   - `hlc` = h (HLC du déplacement annulé) ;
   - `instant` et `jour` = ceux de l'entrée E du déplacement annulé (n° 8 : élément x, HLC h, identifiant de cas d'usage), donc la **journée du placement annulé**, pas celle de l'échange ; E absente (cas théorique : le registre et l'entrée voyagent dans le même fichier) : `instant` = `h.physique`, `jour` = `jourDeReference(instant)` ;
   - **pas de `cause`** (la cause d'une conséquence désigne une entrée de la même opération, DAT §6.1 ; le lien au placement annulé est porté par le HLC égal et par l'identifiant partagé avec le signalement).
   Rendue dans `ReparationHierarchie.evenementsAjoutes`, dans l'ordre des annulations, **sauf** si `etat.journal` contient déjà cet identifiant (idempotence : l'autre appareil l'a déposée, ou une passe précédente l'a écrite). Chaque entrée ne dépend que de son annulation : l'entrée est identique quel que soit l'appareil qui répare, l'heure de la réparation, et le nombre de passes (une chaîne réparée en une ou deux passes donne les mêmes entrées ; avec « après = valeur finale », une réparation en deux passes divergerait : Q-ST017-PEP-3). Deux appareils qui réparent tous deux : même identifiant, même contenu, l'union du journal (premier arrivé conservé) n'en garde qu'une. Une chaîne de N annulations : N entrées (US-023 S18c : 2). UT-US-017-100 à 104.
9 c. **Ordre de l'historique (v0.6)** : `comparerEvenements` (`service-etat-local-transactionnel.ts`, ST-socle §6.8) : HLC croissant (`comparerHlc`) ; à HLC égal, une entrée de cas d'usage (`estIdEvenementDeReparation` faux) **avant** une entrée de réparation ; puis identifiant en ordre ordinal. Dans l'historique d'un objectif, les seules entrées de même HLC sont le déplacement et son entrée de réparation : celle-ci le **suit immédiatement** (US-023 S18d). Ordre total ; aucun autre historique ne change (aucune entrée de réparation avant la v0.6). UT-US-017-107.
9 d. **Forme acceptée** : `lireIdEvenement` accepte `${operation}:${rang}` (inchangé) **ou** `FORME_ID_EVENEMENT_REPARATION` (`/^[0-9a-v]{52}$/`) ; cela suffit pour la base locale (`stockage-local/schemas.ts`) et pour le fichier Drive (`drive/schemas/v1.ts`), qui l'appellent tous deux ; aucune autre modification de format. Un appareil d'un rang antérieur rejetterait le fichier (`SCHEMA`) : sans effet, aucun schéma 1 n'étant publié avant la livraison du lot (DAT v0.10.2 ; à confirmer, Q-ST017-STA-5 b). UT-US-017-105, 106.
10. **Signalement des annulations** : une entrée `PLACEMENT_ANNULE` par annulation, dans l'ordre : `id` = `idValeurEcartee(cle parent de x, hlcOrigine annulé)`, `ecartee` = registre `parent` de x dans l'état fusionné, `gagnante` = registre de réparation de x (n° 9). Une chaîne de N annulations produit N entrées (US-023 S18c : 2).
11. **Intégration d'un fichier reçu** (`planifierSynchronisation`, appelé par `#integrer` dans la transaction, `physiqueCorrigee = Instant.decaler(horloge.maintenant(), e.correctionHorloge)`) : (a) `detecterValeursEcartees(etat, registres de recu)` ; (b) `fusion = planifierFusion(etat, recu)` ; (c) `rep = reparerHierarchie(fusion.etatApres, physiqueCorrigee)` ; (d) plan = fusion, registres de `rep` appliqués à `etatApres`, `registresEcrits` = ceux de la fusion dont la clé n'est pas réécrite par `rep`, puis ceux de `rep` ; **v0.6** : `evenementsAjoutes` = ceux de la fusion, puis `rep.evenementsAjoutes` ; `etatApres.journal` les contient tous (rep est calculé sur `fusion.etatApres`, dont le journal inclut déjà les entrées reçues : une entrée de réparation reçue n'est pas rendue deux fois) ; `etatApres.dernierHlc = rep.dernierHlc ?? fusion` ; index inchangé ; (e) `valeurs = fusionnerValeursEcartees(signalements.valeursEcartees, [...a, ...recu.valeursEcartees ?? [], ...rep.valeursEcartees])`, à écrire : les entrées nouvelles ou dont la référence a changé ; (f) lectures : `fusionnerLectures(signalements.lectures, recu.lectures ?? [])`, même règle ; (g) `meta = { fusionNonDeposee: true }` si `registresEcrits`, `evenementsAjoutes` ou l'un des deux tableaux à écrire est non vide, `{}` sinon. Pré-contrôle de `#integrer` (aucune transaction si rien n'est apporté) : même calcul sur l'état et les signalements lus au début du cycle. Dépôt : `contenuAEnvoyer(etat, { …, signalements })` (signalements lus avec l'état). UT-US-017-51, 52, 54, 104.
12. **Détail pour l'affichage** (`detaillerValeursEcartees`, D1) : une entrée par valeur écartée. `element = elementDeCle(ecartee.cle)` ; `intitule` = `intituleElement` (s'il existe) sinon valeur du registre `intitule` de l'élément (même supprimé), sinon `''`. `information` : `intitule` → `INTITULE`, `description` → `DESCRIPTION`, `delai` → `DELAI`, `estimationInitiale` → `ESTIMATION`, lien → `OBJECTIFS`, `parent` → `PARENT`, `cycleDeVie` → `ETAT`, `creation` → `CREATION`. Valeur d'une écriture : texte → `TEXTE` ; description ou délai `undefined` → `AUCUNE` ; date → `DATE` ; estimation → `DUREE` ; `cycleDeVie` → `ETAT` : son `etat` et, **v0.6** (remarque de Pepper, RG-056 : la ligne montre la valeur non retenue et la valeur conservée ; deux fins à des dates différentes sont signalées, US-017 CA-8, et ne doivent pas s'afficher « terminée / terminée »), `date` = `dateFin` (terminée) ou `dateAbandon` (abandonnée), absente (propriété omise) pour « à faire » ; `parent` : `SOUS` (intitulé courant du parent) ou `PRINCIPAL` ; lien : `actif` vrai → `RATTACHEE`, faux → `DETACHEE` (intitulé courant de l'objectif) ; `creation` d'une tâche avec `tacheParenteId` → `SOUS_TACHE_DE` (intitulé courant de la tâche parente), sinon `CREEE`. `valeurNonRetenue` = valeur de `ecartee`. `valeurConservee` : `CONFLIT` → valeur de `gagnante` ; `SUPPRESSION` → `SUPPRIMEE_AVEC` (intitulé courant de E) si `ecartee` est la création d'une sous-tâche de E, sinon `TACHE_SUPPRIMEE` ou `OBJECTIF_SUPPRIME` selon le type de E ; `PLACEMENT_ANNULE` → `PLACEMENT_ANNULE` ; `DONNEES_EFFACEES` → `DONNEES_EFFACEES`. `instant` = physique de `hlcDuGagnant`. `lue` = une lecture existe. `elementExiste` = registre `creation` présent, pas de registre `suppression`, et, pour une sous-tâche, tâche parente sans registre `suppression`. `supprime` = E pour `SUPPRESSION`. UT-US-017-57 (deux fins à des dates différentes, réouverture contre fin).
13. **Section « À lire »** (`construireModificationsNonRetenues`, D1 ; guide §4.24, §6.6.2, §6.6.9, §5.8 f) : entrées non lues seulement ; aucune : `undefined` (section absente). Lignes `CONFLIT` → `ALR-009` ; `SUPPRESSION` → `ALR-010`, variante `rattachement` si `information = OBJECTIFS`, `placement` si `PARENT`, sinon `tache` si E est une tâche, aucune si E est un objectif ; `PLACEMENT_ANNULE` → `ALR-011`. Ordre `comparerLignesFeuille` (`instant`, puis `intitule`, puis `id`). `titre` = `libelle(code, { variante?, element: intitule, information? })` : `ALR-010` et `ALR-011` sans autre variable que `element` ; `ALR-009` attend les noms d'information de Q-ST017-STE-2 a (non testé d'ici là). `voir` = `element` si `elementExiste`. `valeurNonRetenue` et `valeurConservee` sont recopiées telles quelles (date d'une valeur d'état comprise, v0.6, UT-US-017-58) ; leur **texte** (dont « terminée le … ») est celui de Steeve (Q-ST017-STE-2 f, Q-ST017-STE-3) : une valeur d'état s'affiche toujours avec sa date quand elle en a une. `n` = nombre de lignes ; `libelle` = `libelle('SYN-FEUILLE-A-LIRE', { n })`. Entrées `DONNEES_EFFACEES` non lues : `donneesEffacees = { code: 'ALR-008', ids, lignes }` dans le même ordre, non comptées dans `n` (H-6) ; section présente avec `n = 0` si elles sont seules. **Composant** : titre `data-etat="SYN-FEUILLE-A-LIRE"` ; `<ul aria-labelledby>` ; une `<li data-message="ALR-0xx" data-variante?>` par ligne, qui contient le titre ; bouton natif « Compris » (`libelle('ALR-009', {}, 'action')`), nom accessible `« Compris : » + titre`, première lettre du titre en minuscule (guide §10, « Compris : intitulé de Rédiger le plan »), qui appelle `surCompris([id])` ; bouton natif « Voir … » si `voir` (libellé : Q-ST017-STE-2 c ; en attendant, partie `action` de la variante pour `ALR-010` `rattachement` et `placement` et pour `ALR-011`), qui appelle `surVoir(voir)` ; carte `data-message="ALR-008"` contenant une ligne `data-message="ALR-014"` par entrée (repliable, guide §6.6.9) et **un seul** bouton « Compris » qui appelle `surCompris(ids)`. UT-US-017-58, 59.

### 6.7 Incrément 3 (rang 10) : règles arrêtées
Ordre des contrôles du DAT §4.2.2 à chaque cycle, en un seul point (`controlerDrive`) : (1) dossier et manifeste ; (2) compatibilité (incrément 4) ; (3) génération effective = maximum des générations du ou des manifestes et des fichiers valides, `INITIALE` < `NOUVELLE(hlc)` ordonnées par HLC ; génération plus récente que la locale → valeurs en attente signalées (`ALR-014`), effacement de l'espace, relecture ; (4) fichier propre ; (5) autres fichiers. `ERR-012` : manifeste attendu absent, illisible ou modifié (tout appareil) ; fichier propre attendu altéré (cet appareil seulement) ; un autre fichier altéré est ignoré sans message. Tant que `ERR-012` est affiché, l'appareil n'écrit rien dans le Drive. « Restaurer » : réécrit le fichier propre et le manifeste (`restauration = (HLC, appareil)`, génération inchangée) ; hors ligne : mémorisé, exécuté après les contrôles 1 à 3 au retour du réseau. « Repartir de zéro » (`CNF-REPARTIR-ZERO`, réseau exigé) : manifeste avec `NOUVELLE(hlc)`, fichier propre vide, effacement local. Dossier ou manifeste en double : le plus ancien (`createdTime`, puis `id`) est canonique ; un appareil supprime seulement le double qu'il a créé. Une erreur transitoire n'est jamais une altération.

### 6.8 Incrément 4 (rang 11) : règles arrêtées
- **Correction d'horloge (DAT v0.11.3 §6.4, Q-ST017-STA-2)** : à chaque réponse de Google portant un en-tête `Date` (précision à la seconde), `mesure = Date − (envoi + réception) / 2` (instants de l'appareil), retenue seulement si `réception − envoi < ALLER_RETOUR_MAX_MESURE_HORLOGE` (3 s, mesuré sur l'horloge monotone) ; la méta garde les `NOMBRE_MESURES_HORLOGE` (5) dernières mesures retenues (`mesuresHorloge`, donnée locale) ; `correctionHorloge` = **médiane** de ces mesures (nombre pair : moyenne des deux valeurs centrales, arrondie à la milliseconde inférieure). **Saut** : contrôlé toutes les `PERIODE_CONTROLE_SAUT_HORLOGE` (1 min, `Planificateur`) et à chaque retour au premier plan ; `d = Δ murale − Δ monotone` depuis le contrôle précédent ; `d < −SEUIL_SAUT_HORLOGE` (recul de plus de 2 s) → `correctionHorloge` augmentée de `−d` exactement et chaque mesure conservée décalée de `−d` ; `d > SEUIL_SAUT_HORLOGE` (avance) → **aucune correction**, entrée `info` « avance d'horloge » au journal technique (veille possible : `performance.now()` peut s'arrêter) ; une avance manuelle n'est rattrapée qu'au prochain échange avec Google. L'HLC ne recule jamais (socle). Le jour métier reste calculé sur l'heure non corrigée (conventions §7.1). **Point de mesure (RL-LOT-001-A7)** : l'en-tête `Date` ne transite pas par `TransportSynchro` ; la mesure est prise par un observateur de `ClientGoogle` (`ObservateurEchangesGoogle.surReponse({ envoiMonotone, receptionMonotone, envoiMurale, receptionMurale, date })`), appelé pour **toutes** les réponses Google (Drive, userinfo, plus tard Calendar) et injecté dans la correction d'horloge par la composition. Aucun changement de port.
- **`ALR-001`** : affiché si `|correctionHorloge| > SEUIL_HORLOGE_DEREGLEE` (strict), sur l'appareil qui mesure ; une valeur reçue datée de plus de 24 h dans le futur est seulement journalisée.
- **Âge de la plus ancienne modification en attente** : `consulterEtatSynchronisation` retranche `correctionHorloge` à `premiereEcriture` (heure de l'appareil, ST-US-022 §4.5).
- **RG-058** : `FormatPlusRecent` (fichier ou manifeste de `schemaVersion` > `SCHEMA_VERSION`) → consultation seule : aucune écriture Drive (y compris manifeste et dépôt), aucune fusion du plus récent, aucun effacement ; `actionRequise = FORMAT_PLUS_RECENT` ; saisie bloquée (`ModeSaisie = CONSULTATION_SEULE` : un décorateur unique de `ServiceEtatLocal.modifier`, posé dans la composition, renvoie `Echec({ type: 'ConsultationSeule' })` ; le socle ne change pas) ; « Mettre à jour » : `registration.update()`, `skipWaiting`, rechargement. Champs inconnus de même `schemaVersion` conservés et réécrits.

### 6.9 Correction d'ANO-001 : la vue suit les cycles sans geste et les écritures locales (v0.4.3)
**Défaut** : `ControleurInterface.rafraichir()` n'était appelé qu'à un geste du contrôleur, à un changement de session ou de réseau. Un cycle lancé par un déclencheur sans geste (§6.4 : temporisation de 5 s, période de 2 min, retour au premier plan, reprise programmée) changeait l'état du moteur, le décompte en attente et `dernierContactDrive` sans que la vue soit recalculée (US-017 CA-3, CA-7) ; de même, une écriture locale (création d'un objectif par le magasin des objectifs) ne faisait pas passer l'indicateur à « en attente » (S06c, première assertion).

**Correctif** (trois points, rien d'autre) :
1. **`CycleSynchronisation.observer(rappel: () => void): Annulation`** (méthode publique ; le port `SuiviCycle` est inchangé). Ensemble d'observateurs privé (`Set`). Notification privée `#notifier()` appelant chaque rappel, dans l'ordre d'abonnement :
   - **au début** de chaque exécution effectivement lancée, dans `#lancer`, juste après `this.#enCours = enCours` (l'état est alors `EN_COURS`, `cycleEnCours()` défini) ;
   - **à la fin**, dans le `finally` de `#executer`, **après** `this.#enCours = undefined` et `this.#aRefaire = false` : l'état final (REPOS, RETENTATIVE, `actionRequise`) est établi, `cycleEnCours()` vaut `undefined`. Vaut en succès, en échec et sur exception (la notification précède la propagation).
   - **Deux notifications par exécution**, relance « à refaire » comprise (elle appartient à la même exécution) ; `synchroniserMaintenant` et `deposerMaintenant` notifient de même. **Aucune** notification pour `DEJA_EN_COURS`, `NON_LANCE_HORS_LIGNE`, `NON_LANCE_SANS_ACCES` (aucun changement d'état).
   - Annulation : retire le rappel. `arreter()` ne retire pas les observateurs (le cycle d'un espace fermé n'est plus lancé ; une fin tardive ne fait que recalculer la vue de l'espace courant).
   - Contrat : un rappel ne lève pas d'exception (celui du contrôleur est `() => void this.rafraichir()`, comme pour la session et le réseau).
2. **`Application.observerSynchronisation(rappel: () => void): Annulation`** (`application.ts`). `assemblerNoyau` crée `const relais = new Set<() => void>()` et `const notifier = (): void => { relais.forEach((r) => { r(); }); }` ; `fabriqueCycle.creer(depot)` crée le cycle, puis `cycle.observer(notifier)` **et** `depot.observer(notifier)` (écritures locales et écritures d'un autre onglet, déjà notifiées par `DepotLocalDexie` quand la version change), et rend le cycle. Le `Noyau` porte `relais` (non exposé dans `Application`) ; `assemblerSynchronisation` en tire `observerSynchronisation`, qui ajoute au relais et rend la fonction qui l'en retire. Un abonnement pris sans session vaut pour tout espace ouvert ensuite. Les deux abonnements de l'espace vivent autant que lui et ne sont pas annulés par la composition : `fermerEspace` arrête le cycle et ferme le dépôt, dont la fermeture libère les observateurs (n° 4).
3. **`ControleurInterface`** : `ApplicationInterface` inclut `'observerSynchronisation'` ; le constructeur, juste après l'abonnement à la session, appelle **une fois** `application.observerSynchronisation(() => void this.rafraichir())`. `rafraichir()` relit déjà l'état (indicateur, bandeau), `lireDernierContact` et `lireElementsEnAttente` (feuille) : son calcul est inchangé, déplacé dans une méthode privée `#calculerVue()` ; `rafraichir()` ajoute la promesse de ce calcul à un `Set` privé, l'attend et l'en retire dans un `finally`. **`rafraichissementsTermines(): Promise<void>`** (pour le banc, comme `cycleEnCours()`) : `while (set.size > 0) await Promise.allSettled([...set])`.

4. **`DepotLocalDexie.fermer()`** (v0.4.4, RC-ANO-001-1). Avant la v0.4.4, l'écoute globale `Dexie.on('storagemutated')`, installée au premier `observer` et retirée quand le dernier observateur se désabonne, n'était jamais retirée une fois le relais abonné (n° 2) : chaque espace fermé restait référencé par l'écouteur global de Dexie (dépôt, cycle, relais, contrôleur). `fermer()` fait désormais, avant `base.close(...)` : `this.observateurs.clear()`, puis `this.desabonnementStockage?.()` et `this.desabonnementStockage = undefined`. Toujours idempotent ; un désabonnement tardif (magasin des objectifs démonté après la fermeture) ne retire rien de plus et ne lève pas. Tests : UT-COMP-US-017-56 et 57 (§13.3).

**Patterns** : observateur (comme `DepotLocal.observer`, `SessionCourante.observer`) ; la composition câble, le cycle ne connaît pas le contrôleur (DAT : dépendances vers l'intérieur). **Hors périmètre** : `src/synchronisation/domaine/**` (fusion, dépôt, état local), `depot-local-dexie.ts` hormis `fermer()` (n° 4), port `SuiviCycle`, `web.ts`, `main.tsx`, modèles de vue, catalogue, `rangs-fichiers.json`, `rang-courant.json`.

**Coût** : un rafraîchissement (trois lectures locales) par écriture et deux par cycle (au plus un cycle toutes les 2 min au repos) ; négligeable devant ENF-01.

## 7. Intégration Google
| Opération | Requête | Erreurs |
|---|---|---|
| Lister les fichiers d'appareil | `GET drive/v3/files?q=appProperties has {key='donejuan' and value='appareil'} and '<dossier>' in parents and trashed=false` | §6.8 de ST-US-022 |
| Jeton de départ | `GET drive/v3/changes/startPageToken` | idem |
| Changements | `GET drive/v3/changes?pageToken=…&fields=nextPageToken,newStartPageToken,changes(fileId,removed,file(id,name,appProperties,parents,trashed))` | idem |
| Lire | `GET drive/v3/files/<id>?alt=media` | 404 → `RessourceIntrouvable` |
| Déposer | `POST upload/drive/v3/files?uploadType=multipart` ; `PATCH upload/drive/v3/files/<id>?uploadType=media` | 403 `storageQuotaExceeded` → `EspaceDrivePlein` |
| Manifeste | idem, `application/json` | — |

Portée : `drive.file` (inchangée). Idempotence : chaque dépôt réécrit le fichier entier.

## 8. Gestion des erreurs
| # | Situation | Comportement | Code | Test |
|---|---|---|---|---|
| 1 | Réseau coupé pendant le cycle | Cycle interrompu, index conservé | `SYN-HORS-LIGNE` | UT-US-017-20 |
| 2 | 401 | `AccesGoogle.signalerRefus` | `SYN-SESSION` / `BAN-ACCES-GOOGLE` | UT-US-017-26 |
| 3 | Drive plein | Modifications conservées | `ERR-011`, `SYN-ACTION` | UT-US-017-27 |
| 4 | 5xx, 429 répétés | Trois tentatives, puis action requise, tentatives poursuivies | `SYN-RETENTATIVE`, `ERR-016` | UT-US-017-28 |
| 5 | Fichier reçu illisible | Non fusionné (incr. 1 : journalisé ; incr. 3 : RG-044) | — / `ERR-012` | UT-US-017-13 |
| 6 | Dépôt interrompu (panne entre dépôt et confirmation) | `deposeJusquA` inchangé ; dépôt rejoué | — | UT-US-017-19 |
| 7 | (incr. 2) Entrée de `valeursEcartees` ou de `lectures` mal formée dans un fichier reçu ; motif ou registre inconnu | Mal formée : `FichierIllisible` `SCHEMA` (fichier non fusionné, comme n° 5) ; inconnue : entrée ignorée | — | UT-US-017-52 |
| 8 | (incr. 2) Ligne illisible des tables `valeursEcartees` ou `lectures` | `DonneesLocalesIllisibles`, comme les autres tables | — | tests complémentaires de Bruce (B2) |
| 9 | (incr. 2) « Compris » : écriture locale impossible | `Echec` du dépôt rendu tel quel ; l'appelant (contrôleur) l'affiche comme toute écriture refusée (`ERR-014`) | `ERR-014` | UT-US-017-55 |
| 10 | (incr. 2) Réparation sans candidat alors que la hiérarchie est invalide (non atteint, DAT §4.2) | Arrêt de la boucle, hiérarchie laissée telle quelle, sans exception | — | — |

## 9. Patterns imposés
| Pattern | Où | Pourquoi |
|---|---|---|
| CRDT à base d'état, fonction de fusion pure | `fusionnerEtats`, `planifierFusion` | ADR-003 ; propriétés vérifiées |
| Unité de travail | `appliquerSynchronisation` | DS-07, ENF-T-07 |
| Sérialisation canonique unique | `serialiserCanonique` | Empreinte identique à l'écriture et à la lecture (conventions §10.3) |
| Garde de compatibilité en un seul point | `controlerDrive` (incr. 3 et 4) | Conventions §10.3 |

Interdits : toute écriture dans le Drive hors de `CycleSynchronisation` et des cas d'usage RG-044 ; deux cycles simultanés sur un même appareil ; tout `await` étranger à Dexie dans `appliquerSynchronisation`.

## 10. Sécurité et données personnelles
Le contenu des fichiers n'est jamais journalisé (seulement identifiants opaques, tailles, durées, codes). Validation Zod et empreinte avant toute fusion. Aucune donnée hors du Drive et des appareils (CA-4, S07).

## 11. Exigences non fonctionnelles
| Exigence | Vérification |
|---|---|
| ENF-T-04 : intégration à l'ouverture < 10 s pour 5 Mo | Test de performance indicatif (§14) ; recette E14 |
| ENF-T-03 : ≤ 5 min entre appareils ouverts | S02 (2 min par cycle) |
| ENF-06, ENF-T-07 : aucune perte | Propriétés de reprise du banc (UT-US-017-31) |

## 12. Step definitions Cucumber

### 12.1 Phrases
| # | Phrase | Fichier | Rang | Implémentation |
|---|---|---|---|---|
| 1 | `l'utilisateur utilise le compte {string} sur le smartphone et sur le PC, tous deux à jour` | `compte/connexion.steps.ts` | 3 (étend ST-US-022) | Connexion des deux appareils puis `banc.synchroniserJusquAuRepos()` |
| 2 | `les deux appareils échangent leurs modifications` | `synchronisation/echanges.steps.ts` | 3 | `banc.synchroniserJusquAuRepos()` : cycles smartphone, PC, smartphone…, jusqu'à un tour sans fusion ni dépôt (10 tours au plus) |
| 3 | `le {appareil} échange ses modifications avec le Drive` | idem | 3 | Un `synchroniserMaintenant()` (H-5 : joué avant une coupure déclarée du même appareil) |
| 4 | `le {appareil} enregistre ses modifications dans le Drive` ; `sur le {appareil}, l'utilisateur enregistre ses modifications dans le Drive` | idem | 3 | `deposerMaintenant()` |
| 5 | `le réseau revient sur le {appareil}` ; `…, sans aucune action de l'utilisateur` | `commun/reseau.steps.ts` | 3 (étend ST-US-022) | `ReseauSimule.retablir()` puis attente du cycle déclenché |
| 6 | `le réseau est coupé sur le {appareil}` ; `… pendant la saisie` | idem | 3 | `ReseauSimule.couper()` |
| 7 | `que le réseau du smartphone est intermittent` ; `l'envoi au Drive est interrompu {int} fois avant d'aboutir` | idem, `drive.steps.ts` | 3 | `FauxDrive.interrompreDepots(n)` ; le banc laisse passer le temps jusqu'au dépôt réussi |
| 8 | `l'horloge avance de {ecart}, sans aucune action de l'utilisateur` ; `l'horloge avance de {ecart} depuis l'ouverture` ; `… depuis la reconnexion` | `commun/temps.steps.ts` | 3 | `banc.avancerTemps(ecart)` (exécute les échéances et attend les cycles en cours) |
| 9 | `que l'application est ouverte sur le smartphone et sur le PC, connectés au réseau` | `commun/appareils.steps.ts` | 3 | Les deux ouverts, cycles démarrés |
| 10 | `les données présentes sur le {appareil} s'affichent aussitôt` | `synchronisation/etat-affiche.steps.ts` | 3 | Instantané d'ouverture (ST-US-022 §12.3) : produit avant toute réponse du `FauxDrive` à cet appareil, et égal à la vue des données locales. **L'étape échoue tant que la racine de l'appareil est `ATTENTE_GOOGLE`** (`construireRacine`, écran `SYN-REDIRECTION`) : aucun faux positif sur des données non affichées ; « aussitôt » se compte depuis la fin du passage par Google (glossaire v1.10 §12, DEC-038, RL-LOT-001-P2) |
| 11 | `le Drive du compte {string} contient l'objectif {string}` ; `… la tâche {string}` ; `… à l'état {string}` ; `… exactement une fois` ; `… avec le délai {date}` ; `le Drive du compte {string} ne contient pas l'objectif {string}` ; `… ne contient pas encore la tâche {string}` | `drive.steps.ts` | 3 | Décode les fichiers d'appareil valides du `FauxDrive` du compte par `decoderFichierAppareil`, fusionne, projette ; « exactement une fois » : un seul élément non supprimé de cet intitulé |
| 12 | `aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte {string}` | idem | 3 | Enregistreur de `fetch` du monde vide ; toutes les requêtes du banc passent par `FauxGoogle` |
| 13 | `que le Drive du compte {string} est plein` ; `de l'espace est libéré dans le Drive du compte {string}` ; `le Drive redevient disponible` ; `que le Drive est momentanément indisponible` | idem | 3 | Pilotage du `FauxDrive` |
| 14 | `que le Drive du compte {string} contient un objectif {string} de délai {date} enregistré par le PC` | idem | 3 | Appareil PC du banc créé si besoin, objectif créé, dépôt |
| 15 | `que sur le {appareil}, l'utilisateur a créé un objectif {string} de délai {date}, enregistré dans le Drive` | `echanges.steps.ts` | 3 | Opération au passé puis `deposerMaintenant()` |
| 16 | `que sur le {appareil}, l'utilisateur a <opération au passé>[, pas encore enregistré dans le Drive]` ; `que sur le {appareil}, l'objectif {string} a été créé et n'est pas encore synchronisé` | idem | 3 (opérations de leur rang) | Glossaire « Opération au passé » ; vérifie l'élément en attente |
| 17 | `que sur le smartphone, 3 modifications ont été enregistrées dans le Drive depuis la dernière ouverture du PC` ; `sur le PC, les 3 modifications sont intégrées` | idem | 5 | Opérations fixées : création de l'objectif « Écrire l'introduction » sans délai, renommage de la tâche de contexte (ou d'une tâche « Relire » créée à cet effet) en « Relire le chapitre », délai de cette tâche au 2026-12-01 ; dépôt ; assertion sur les trois valeurs |
| 18 | `… porte la mention "MEN-ATTENTE"` ; `… ne porte pas …` ; `… ne porte plus …` ; `aucun élément ne porte la mention {string}` | `etat-affiche.steps.ts` | 3 | `mentionAttente` |
| 19 | `l'indicateur de synchronisation est "SYN-HORS-LIGNE" avec {int} modification(s) en attente` | idem | 3 | `construireIndicateur` : code et `n` |
| 20 | `les données sont identiques à celles enregistrées` | idem | 7 | `EtatMetier` de l'appareil égal à la projection du Drive |
| 21 | `le message d'erreur {string} est affiché` ; `… n'est pas affiché` ; `que … le message d'erreur … est affiché` | idem | 3 (`ERR-011`), 10 (`ERR-012`) | `messageFeuille` |
| 23 | `sur le {appareil}, la mention "MEN-HEURE-PARIS" apparaît` ; `… n'apparaît pas` | `synchronisation/etat-affiche.steps.ts` | 2 | Glossaire v1.10 §12 (RL-LOT-001-P3) : `construireListeObjectifs(…, { horloge })` de l'appareil (ST-US-001 §4.5) ; `mentionHeureParis` présente si et seulement si le fuseau de l'appareil n'est pas Europe/Paris. La liste « Tâches » et la ligne « Fuseau » ne sont pas vérifiées par cette étape |
| 22 | Phrases des incréments 2 à 4 (modifications non retenues, RG-044, horloge, versions, fuseau, `ALR-…`) | `modifications-non-retenues.steps.ts`, `drive.steps.ts`, `etat-affiche.steps.ts`, `commun/temps.steps.ts` | 9, 10, 11 | Spécifiées dans la mise à jour de cette ST qui précède l'E10 de chaque incrément (§13.2) ; formes : glossaire v1.8 §1, §3, §6, §7, §8. **Incrément 2 : §12.5 (v0.5)** |

Étapes réutilisées : objectifs, tâches, sous-objectifs, terminer, rouvrir, abandonner, reprendre, supprimer, « l'opération est acceptée » (ST-US-001 à ST-US-025) ; connexion et session (ST-US-022).

### 12.2 Rangs d'exécution revérifiés
| Incrément | Scénarios | Rang d'exécution |
|---|---|---|
| 1 | S04, S17a, S17b, S29, **S02, S07** (corrigés : objectifs seulement), **S06b** | 3 |
| 1 | S05, S06 | 5 |
| 1 | S03, S08 | 7 |
| 2 | **S12** (corrigé : fusion seule, tâches) | 5 |
| 2 | S09, S10, S11, S12b, S14, S15, S15b, S16, S24, S25, S26 | 9 |
| 3 | S18, S19, S20, S20b, S21, S22, S22b, S22c, S22d, S23, S32, S32b, S33 | 10 |
| 4 | **S28** (corrigé : terminer et retard, deux fuseaux) | 7 |
| 4 | **S27** (corrigé : puce de la liste des objectifs, RL-LOT-001-P3) | 2 |
| 4 | S12c, S12d, S13a, S13b, S30, S30b, S31 | 11 |
| 4 | S01 (en dernier, décision du contrôle d'explicitation) | 11 |
Total : 46. Les corrections portent sur S02, S07 (rang 7 → 3), S12 (9 → 5), S28 (11 → 7) et l'ajout de S06b (DEC-034) ; E11 : S27 (rang 11 → 2, RL-LOT-001-P3). **Vérification après la correction de Pepper (Q-ST017-PEP-1)** : S06 retrouve `Et le Drive du compte "A" contient la tâche "Envoyer le devis"` (phrase n° 11, rang 3, déjà définie) et reste au rang 5 ; S06b se termine par `Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15` (ST-US-001, rang 2) ; ses autres phrases relèvent de ST-US-022 (rangs 1 et 2) et de la phrase n° 8 : **S06b est exécutable au rang 3**, sans nouvelle step.

### 12.3 Banc
- **`FauxDrive`** (par compte, dans `FauxGoogle`) : implémente `TransportSynchro` par appareil (`transportPour(appareil)`, soumis au `ReseauSimule` et à l'accès Google de l'appareil : réseau coupé → `ReseauIndisponible`, accès retiré → `NonAutorise`) ; stockage partagé de fichiers (`id`, nom, `appProperties`, octets, `createdTime`, `modifiedTime`, supprimé) ; journal des changements (jeton = numéro de séquence) ; pilotage : `plein()`, `liberer()`, `indisponible(n | 'toujours')`, `interrompreDepots(n)`, `desactiverPourLeCompte()` ; altérations (incrément 3) ; en-tête `Date` (incrément 4) ; observation : `fichiers()`, `nombreReponses(appareil)`, `ecrituresPar(appareil)`.
- Les fichiers du `FauxDrive` sont produits et lus par `encoderFichierAppareil` et `decoderFichierAppareil` réels : le format est exercé par les scénarios.
- `banc.synchroniserJusquAuRepos()`, `banc.avancerTemps(ecart)` : ST-socle §11.11 des conventions ; ils attendent `cycleEnCours()` de chaque appareil.
- Propriétés (fast-check, graine fixe) : convergence, aucune perte silencieuse (incr. 2), idempotence, reprise après arrêt brutal (UT-US-017-29 à 31).

### 12.4 Scénarios S06c à S06f (ANO-001, glossaire v1.11 §13) : banc et steps (E12 de la correction)
Les steps existants de l'indicateur lisent `consulterEtat()`, toujours à jour : tels quels, S06c à S06f passeraient sans le correctif (c'est la lacune notée dans ANO-001). Ils lisent donc, dans ces scénarios, la **vue affichée** : celle du contrôleur, jamais rafraîchie par le step.

**Banc** (`tests/support/banc/appareil-simule.ts`) :
- `controleur: ControleurInterface` : créé à chaque nouvelle instance (`demarrer`), comme `demarrerWeb` : `new ControleurInterface(application, this.horloge, application.objectifs)`, puis `this.reseau.surChangement(() => void controleur.rafraichir())` ; `apresOuverture(issue)` appelé avec l'issue de l'ouverture. Abonnements retirés avec l'instance (`fermerApplication`).
- `async vueAffichee(): Promise<VueInterface>` : `await this.attendreCycle()`, puis `await this.controleur.rafraichissementsTermines()`, recommencés tant qu'un cycle est en cours ; rend `controleur.vue()`. **N'appelle jamais `rafraichir()`.**
- `passerAuSecondPlan()` / `revenirAuPremierPlan()` : `espace()?.cycle.definirPremierPlan(false | true)`, comme le `visibilitychange` de `web.ts`.
- `expirerAccesSansConstat()` (corrigé en v0.4.4) : Google ne reconnaît plus le jeton (`fournisseur.expirerJeton()`) et le jeton du coffre est **échu** (échéance = `horloge.monotone()`), sans que la session change : le premier appel au Drive reçoit 401, le cycle appelle `acces.signalerRefus()`, qualifié `A_RENOUVELER` (`qualifierRefusJeton`, DAT §4.1.6 bis, 1re ligne) → `SYN-SESSION`. La v0.4.3 prescrivait un jeton non échu : un 401 sur un jeton non échu est une preuve de retrait (DAT §4.1.6 bis, 2e ligne : `PERDU`, `SYN-ACTION`), contraire à S06f. À la différence d'`expirerSessionGoogle()`, le retour de la prochaine redirection n'est pas différé. Le geste de reconnexion existant (`connexion.steps.ts`) redonne un jeton reconnu.

**Lecture affichée** : `Before({ tags: '@ANO-001' })` (`tests/support/hooks.ts`) pose `monde.lectureAffichee = true` (`tests/support/monde.ts`, faux par défaut). Quand il est vrai, `indicateurDe(appareil)` (`etat-affiche.steps.ts`) rend `(await appareil.vueAffichee()).indicateur` au lieu de `construireIndicateur(await consulterEtat())`. Aucun autre scénario ne change.

| # | Phrase (glossaire v1.11 §13) | Fichier | Nouveau / réutilisé | Mise en œuvre |
|---|---|---|---|---|
| 1 | `(que )l'application est ouverte sur le {appareil}, connecté au réseau` | `commun/appareils.steps.ts` | Nouveau | (v0.4.4) `reseau.retablir()`, `fermerApplication()`, `ouvrirApplication()`, `banc.attendreCycles()`. Contrairement à la forme à deux appareils (`assurerOuverte()`), l'application est rouverte : l'instantané d'ouverture est celui d'une session connue (`APPLICATION`), non celui de la connexion du contexte (`CONNEXION`), ce qu'exige `les données présentes … s'affichent aussitôt` de S06f (vérifié : avec `assurerOuverte()`, S06f échoue sur cette étape) |
| 2 | `(que )l'application est passée au second plan sur le {appareil}` | `commun/appareils.steps.ts` | Nouveau | `passerAuSecondPlan()` |
| 3 | `l'utilisateur ramène l'application au premier plan sur le {appareil}` | `commun/appareils.steps.ts` | Nouveau | `revenirAuPremierPlan()` ; le cycle lancé n'est **pas** attendu par ce step (l'horloge du step suivant s'en charge) |
| 4 | `(que )l'accès Google du compte {string} va expirer sur le {appareil} pendant l'utilisation` | `compte/connexion.steps.ts` | Nouveau | `assert` : le compte est celui de la session ; `expirerAccesSansConstat()` |
| 5 | `l'indicateur de synchronisation indique un dernier échange à l'instant` (préfixe `sur le <appareil>,`) | `synchronisation/etat-affiche.steps.ts` | Nouveau | `(await vueAffichee()).feuille?.dernierEchange?.libelle` contient `formaterAnciennete(t, t)` (« à l'instant ») ; lu dans la vue affichée **quel que soit** le tag |
| 6 | `la feuille "Compte et synchronisation" indique {int} modification(s) en attente` (préfixe ; pluriel par expression régulière, conventions §11.6) | `synchronisation/etat-affiche.steps.ts` | Nouveau | Vue affichée, quel que soit le tag : n = 0 → `attente.code === 'SYN-FEUILLE-RIEN-EN-ATTENTE'` ; sinon `SYN-FEUILLE-EN-ATTENTE` et `attente.n === n` |
| 7 | `l'objectif {string} ne porte plus la mention {string}` (préfixe) | `objectifs-taches/objectifs.steps.ts` | Nouveau | Négation de la phrase existante l. 317 (même lecture de la ligne) |
| 8 | `l'indicateur de synchronisation est "…"` (avec ou sans `, avec l'action "…"`), `l'horloge avance de …, sans aucune action de l'utilisateur`, `… depuis la reconnexion`, `l'utilisateur crée un objectif … de délai …`, `l'objectif … porte la mention …`, `… existe avec le délai …`, `le Drive du compte … contient l'objectif …`, `… a créé un objectif …, enregistré dans le Drive`, `l'utilisateur fait le geste de reconnexion`, `les données présentes … s'affichent aussitôt` | existants | Réutilisés | L'indicateur lit la vue affichée sous `@ANO-001` (ci-dessus) |

**Unité « secondes »** (v0.4.4) : `l'horloge avance de 5 secondes, …` (S06c, S06f) ; `FRAGMENT_ECART` et `convertirEcart` (`tests/support/conversions.ts`) admettent `\d+ secondes?` (UT-COMP-90).

Rangs : S06c à S06f au rang 3 (`rangs-scenarios.json`, Pepper) ; ils doivent être verts sur `fix/ANO-001` avant la fusion, **et rouges sans le correctif** (contrôle de revue E13 : retirer l'abonnement du constructeur fait échouer S06c à S06f).

### 12.5 Incrément 2 (rang 9, v0.5) : phrases, banc et scénarios différés
**Phrases nouvelles** (glossaire v1.11 §1, §6, §8 ; livrées au rang 9, rang de la capacité). « Liste » = lignes de `construireModificationsNonRetenues(detaillerValeursEcartees(état, signalements))` de l'appareil (non lues, `ALR-009` à `ALR-011`), lue après `banc.attendreCycles()`. Comparaison des cellules du glossaire §8 : `tests/support/synchronisation/valeurs-non-retenues.ts` (nouveau, D3) convertit la colonne `information` en `InformationSignalee` (intitulé → `INTITULE`, …, création → `CREATION`) et les colonnes de valeurs en `ValeurSignalee` selon l'information : `intitulé`/`description` → `TEXTE` ; `délai` → `DATE` ; `estimation` → `DUREE` (`convertirDuree`) ; `état` → `ETAT` ; `objectifs` → `RATTACHEE` ; `sous <X>` → `SOUS` ; `sous-tâche de <X>` → `SOUS_TACHE_DE` ; `tâche supprimée`, `objectif supprimé`, `supprimée avec la tâche <X>`, `placement annulé`, `données effacées (repartir de zéro)` → types spéciaux. **v0.6** : une cellule `état` (« terminée », « abandonnée », « à faire ») est comparée au seul `etat` de la valeur ; la `date` n'est pas comparée (le glossaire §8 n'en écrit pas).

| # | Phrase | Type | Fichier | Tranche | Mise en œuvre |
|---|---|---|---|---|---|
| N1 | `la liste des modifications non retenues contient :` + tableau (préfixes `sur chacun des deux appareils,`, `sur le <appareil>,`) | Alors | `synchronisation/modifications-non-retenues.steps.ts` | D3 | Pour chaque appareil visé : chaque ligne du tableau est présente (élément, information, deux valeurs) ; inclusion, pas égalité (US-023 S18b combine N1 et N2) |
| N2 | `la liste des modifications non retenues contient exactement {int} information(s)` (mêmes préfixes) | Alors | idem | D3 | `lignes.length === n` (0 si section absente) |
| N3 | `la liste des modifications non retenues est vide` (préfixes `sur le <appareil>,`, `sur les deux appareils,`) | Alors | idem | D3 | Aucune ligne non lue |
| N4 | `que sur le <appareil>, la liste des modifications non retenues contient une valeur écartée pour <l'intitulé \| le délai> de la tâche "X"` | Étant donné | idem | D3 | Construction réelle au banc (deux appareils), entrée non lue : intitulé : tâche « Plan » créée sur le PC et échangée, smartphone hors ligne, PC renomme « Plan » en « A », 10 min après le smartphone renomme en « X », réseau rétabli, échange (procédure de S10) ; délai : tâche « X » (créée si absente, délai 2026-11-30, 1 h) échangée, PC fixe le délai au 2026-12-01, 10 min après le smartphone au 2026-12-05, échange. Vérifie que la ligne existe sur l'appareil |
| N5 | `sur le <appareil>, la liste des modifications non retenues contient toujours la valeur écartée pour <l'intitulé \| le délai> de la tâche "X"` | Alors | idem | D3 | Une ligne d'élément « X » et d'information `INTITULE` (ou `DELAI`) |
| N6 | `sur le <appareil>, l'utilisateur marque comme lue la modification non retenue de la tâche "X"` | Quand | idem | D3 | Exactement une ligne non lue d'élément « X » (sinon échec) ; `surCompris([id])` du contrôleur de l'appareil, puis attente du rafraîchissement |
| N7 | `sur le <appareil>, l'indicateur de synchronisation signale {int} information(s) à lire` ; `… ne signale aucune information à lire` | Alors | `synchronisation/etat-affiche.steps.ts` | D3 | `construireIndicateur(consulterEtat()).aLire` égal à n (absent pour « aucune ») ; vaut dans tous les états (glossaire §6) |
| N8 | `sur le <appareil>, toutes les fonctions restent utilisables` | Alors | `commun/appareils.steps.ts` | D3 | **Sans écriture** (S15 vérifie ensuite `SYN-INFO`) : racine de l'appareil = application (pas d'écran d'attente), aucune confirmation ni carte bloquante ouverte dans la vue du contrôleur, saisie non bloquée (garde de saisie libre) |
| N9 | `les deux appareils affichent le même intitulé pour la tâche "X", "A" ou "B"` | Alors | `objectifs-taches/taches.steps.ts` | D3 | Tâche d'intitulé initial « X » retrouvée par son identifiant (référence du monde) ; même intitulé sur les deux appareils, égal à « A » ou « B » |
| N10 | `que la tâche "X", <terminée \| abandonnée>, est signalée en incohérence avec sa sous-tâche à faire "Y"` | Étant donné | `objectifs-taches/taches.steps.ts` | D2 | ST-US-024 §12 n° 16 (glossaire §1, construction au banc) |
| N11 | `la tâche "X" porte la mention "MEN-INCOHERENCE" pour sa sous-tâche "Y"` (préfixes) | Alors | idem | D2 | ST-US-024 §12 n° 17 |

**Scénarios du rang 9 et ce qui les rend exécutables** (en plus des phrases existantes) :

| Scénarios | Capacité de l'incrément 2 | Phrases |
|---|---|---|
| US-017 S09, S11 ; US-025 S14 ; **v0.6** : US-017 S10b (valeurs égales), S10c (suppressions concurrentes) | Détection (n° 2, 3) : rien | N3, N7 |
| US-017 S10, S16 ; US-018 S07 ; US-031 S10 ; US-003 S17 | `CONFLIT` (n° 2, 5, 6), lecture partagée (S16) | N1, N2, N3, N6 |
| US-017 S12b | Départage par l'appareil, entrée unique | N2, N9 |
| US-017 S14, S15, S15b | Lectures, `aLire`, `SYN-INFO` (H-6) | N4, N5, N6, N7, N8 |
| US-017 S24 ; US-001 S19 ; US-031 S11 | `SUPPRESSION` d'un champ (n° 3) | N1 |
| US-002 S23 ; US-018 S08 | `SUPPRESSION` de l'intitulé, élément = intitulé connu de la suppression (n° 4) | N1 |
| US-001 S20 ; US-023 S19 | H-1 : rattachement, placement (n° 3) | N1 |
| US-024 S22 | H-1 : création de sous-tâche (n° 3), `SUPPRIMEE_AVEC` | N1 |
| US-017 S25 ; US-023 S16, S17, S18, S18b, S18c | Réparation (n° 7 à 10) | N1, N2 |
| **v0.6** : US-023 S18d | Entrée de journal de la réparation (n° 9 b, 9 c) | Phrase existante ST-US-001 §12 n° 27 (`l'historique contient, pour l'objectif …`, préfixe `sur chacun des deux appareils,`) ; `nous sommes le …` existante |
| US-017 S26 ; US-024 S20, S21 ; US-003 S18, S19 ; US-025 S15, S16 ; US-031 S12 | RG-049 (D2) ; aucune logique de synchronisation nouvelle | N10, N11 |
| US-025 S12c, S12e | RG-049 réactivée (l'absence de `MEN-INCOHERENCE` n'a de sens qu'avec elle) ; S12e : N3 | N3 |

Aucun scénario différé n'exige de capacité hors de l'incrément 2 et de la réactivation de RG-049 (D2) ; aucun test unitaire de plus que UT-US-017-40 à 59, **100 à 108 (v0.6)**, CT-DEPOT-12, 13 et UT-US-024-21, 22 (déjà écrits) n'est nécessaire. Tous ces scénarios passent au **rang 9** dans la PR de la tranche D3, qui porte `rangCourant = 9`.

## 13. Tests unitaires fournis

### 13.1 Incrément 1 (E10, livrés en rouge le 2026-10-27)
| Id | Fichier | Élément | Cas | Exigence |
|---|---|---|---|---|
| UT-US-017-01 | `synchronisation/domaine/fusion.test.ts` | `fusionnerEtats` | par information, le plus grand HLC l'emporte ; informations différentes du même élément toutes conservées (CA-6, S09) | RG-036 |
| UT-US-017-02 | idem | idem | égalité de physique et de compteur : départage par `appareilId` (S12b) | DS-11 |
| UT-US-017-03 | idem | idem | journal : union par identifiant | RG-050 |
| UT-US-017-04 | `fusion.proprietes.test.ts` | idem | commutative, associative, idempotente (fast-check) | R14 |
| UT-US-017-05 | `fusion.test.ts` | `planifierFusion` | registres gagnants seulement ; entrées de journal nouvelles ; `dernierHlc` = max ; index inchangé | DAT §6.4, §4.1.5 bis |
| UT-US-017-06 | idem | idem | fichier reçu sans rien de nouveau → plan vide | — |
| UT-US-017-07 | `synchronisation/domaine/depot.test.ts` | `retirerDeposees` | retire `derniereHlc ≤ x`, garde `> x` | DAT §4.1.5 bis |
| UT-US-017-08 | idem | `doitDeposer` | les quatre conditions, et faux quand rien n'a changé depuis le dernier dépôt | §4.1 |
| UT-US-017-09 | idem | `contenuAEnvoyer` | registres et journal de l'état, `schemaVersion` 1, génération fournie | ST-socle §5.3 |
| UT-US-017-10 | `synchronisation/infrastructure/drive/serialisation-canonique.test.ts` | `serialiserCanonique` | clés triées à tous les niveaux, tableaux dans l'ordre, sans espace | conventions §10.3 |
| UT-US-017-11 | idem | `empreinteSha256` | vecteur connu (« abc ») | — |
| UT-US-017-12 | `synchronisation/infrastructure/drive/format-v1.test.ts` | `encoderFichierAppareil` puis `decoderFichierAppareil` | aller-retour égal (`undefined` ↔ `null`, `Instant` ↔ ISO, table d'appareils) | ST-socle §5.3 |
| UT-US-017-13 | idem | `decoderFichierAppareil` | octets non gzip → `DECOMPRESSION` ; JSON invalide → `JSON` ; champ manquant → `SCHEMA` ; empreinte fausse (valeur changée, fichier resté lisible) → `EMPREINTE` | RG-044, V-02 |
| UT-US-017-14 | idem | idem | champ inconnu au premier niveau et registre de champ inconnu tolérés (registre ignoré à l'incrément 1) ; `schemaVersion` 2 → `FormatPlusRecent` | RG-058, ANT-19 |
| UT-US-017-15 | idem | `encoderManifeste` / `decoderManifeste` | aller-retour ; empreinte vérifiée | DAT §4.2.2 |
| UT-US-017-16 | `synchronisation/presentation/mention-attente.test.ts` | `mentionAttente` | `MEN-ATTENTE` seulement pour un élément en attente | US-018 CA-3 |
| UT-US-017-33 | `synchronisation/presentation/ordre-feuille.test.ts` | `comparerLignesFeuille` | la plus récente d'abord ; à égalité, intitulé (sans casse ni accents), puis id | Guide v0.2.14 §5.8 f, RL-S3 |
| UT-US-017-17 à 32 | `synchronisation/application/cycle-synchronisation.test.ts` (sur `FauxDrive`, `DepotLocalDexie` et `fake-indexeddb`) | `CycleSynchronisation` | 17 : premier cycle → manifeste, `LISEZ-MOI`, fichier propre, `fichierPropre` et `deposeJusquA` mémorisés, index vidé ; 18 : fusion du fichier de l'autre appareil ; 19 : panne après le dépôt, avant la confirmation → `deposeJusquA` inchangé, l'entrée reste ; 20 : réseau coupé → `NON_LANCE_HORS_LIGNE`, rien d'écrit ; 21 : temporisation de 5 s après une modification ; 22 : cycle toutes les 2 min ; 23 : retour du réseau ; 24 : écriture pendant le dépôt reste en attente ; 25 : retour du jeton → cycle ; 26 : 401 → `signalerRefus` ; 27 : Drive plein → `DRIVE_PLEIN`, puis effacé au dépôt suivant réussi ; 28 : trois 5xx → `RETENTATIVE` puis `ECHEC_PERSISTANT`, tentatives poursuivies ; 29 : convergence (propriété) ; 30 : idempotence ; 31 : reprise après arrêt brutal (propriété) ; 32 : jeton de changements refusé → oublié, inventaire complet dans le même cycle, sans tentative (RL-A3) | §6 |

Suite de contrat : `tests/contrats/transport-synchro.contrat.ts` (CT-TRANS-01 à 10), exécutée sur `FauxDrive` (E10) et sur `TransportSynchroDrive` avec MSW (Benjamin), par la fonction exportée `suiteContratTransport(nom, fixture)`.

**Précisions de l'E10 (2026-10-27)** — les squelettes font foi :
- `IssueCycle` : une coupure du réseau ou une réponse perdue **pendant** un cycle donne `ECHEC_TRANSITOIRE` (la reprise est celle du §6.3 ; avant le cycle, `NON_LANCE_HORS_LIGNE`) ;
- `FauxDrive` (squelette documenté) : API de pilotage et d'observation du §12.3, plus `avantReponseDuProchainDepot(rappel)`, `perdreReponseDuProchainDepot()`, `modifierFichierALaMain(id)` ;
- support de test livré complet : `tests/support/synchronisation/appareil-cycle.ts` (`ReseauCommandable`, `AccesCommandable`, `creerAppareilCycle`) ;
- `PreparationDossierDrive` ne dépend que de `Pick<TransportSynchro, 'preparerDossier'>` (ségrégation, rang 1) ;
- `DepotLocalDexie` porte les deux nouvelles méthodes en squelette ; la classe de test `DepotAvecCorrection` (UT-SOC-36) les délègue.
Bilan : **39 cas** (UT-US-017-01 à 31, dont des cas multiples pour 04 et 29 à 31, et CT-TRANS-01 à 08), tous en échec « NI ».

**Compléments de la v0.2 (2026-10-27, condition de Starck sur Q-ST017-STA-1)** : CT-DEPOT-08 (`lireMeta` d'un espace neuf), 09 (plan vide : méta fusionnée, version et observateurs inchangés), 10 (plan et méta dans la même transaction, version + 1, observateurs), 11 (état et méta d'une autre instance transmis ; exception : ni plan ni méta écrits), exécutés sur `DepotLocalDexie` et sur `DepotLocalEnMemoire` ; CT-DEPOT-01 à 07 exécutés aussi sur `DepotLocalEnMemoire`. Constantes de l'incrément 4 livrées (`NOMBRE_MESURES_HORLOGE`, `ALLER_RETOUR_MAX_MESURE_HORLOGE`, `SEUIL_SAUT_HORLOGE`, `PERIODE_CONTROLE_SAUT_HORLOGE`). Bilan : **54 cas** (39 + 15), tous en échec « NI ».

**Compléments de la v0.3 (E11, 2026-10-28)** : CT-TRANS-09 et 10, UT-US-017-32 (jeton), UT-US-017-33 (ordre de la feuille) ; squelettes `JetonChangementsInvalide`, `FauxDrive.pendantLeProchainInventaire` et `invaliderJetons`, `ordre-feuille.ts`. Bilan : **58 cas**, tous en échec « NI ».

**Compléments de la v0.4 (E10 du reliquat du rang 3, 2026-10-30, DT-011)** :

| Id | Fichier | Élément | Cas | Exigence |
|---|---|---|---|---|
| UT-US-017-34 | `commun/presentation/heure.test.ts` | `formaterHeure`, `formaterAnciennete` | 4 heures (été, hiver, minuit à Paris) ; 11 anciennetés : bornes 59 s, 1 min, 59 min 59 s, 1 h, 23 h 59, 24 h, instant futur, veille à Paris mais avant-veille en UTC, deux jours, autre année | Guide §6.6.1, DEC-012 |
| UT-US-017-35 | `synchronisation/presentation/feuille-synchronisation.test.ts` | `construireFeuilleSynchronisation` | dernier échange (« il y a », « hier ») ; absent sans échange | §4.5 bis |
| UT-US-017-36 | idem | idem | rien en attente ; n = nombre de lignes ; ordre ; singulier | Guide §6.6.1, §5.8 f |
| UT-US-017-37 | idem | idem | hors ligne : ligne, bouton indisponible et explication ; connecté (au repos, en cours) | Guide §6.6.2 |
| UT-US-017-38 | idem | idem | `ERR-011`, `ERR-016` (n) ; aucune carte dans les autres états | §8 n° 3 et 4 |
| UT-US-017-39 | `synchronisation/presentation/ui/feuille-synchronisation.test.tsx` | `FeuilleSynchronisation` | `data-etat`, liste nommée et ordonnée, bouton `aria-disabled` focalisable et inerte avec description, cartes `data-message` et actions | Guide §4.26, §6.6.2 |
| UT-US-001-36 | `objectifs-taches/presentation/liste-objectifs.test.ts` | `construireLigneObjectif` | `attente` avec `nomAccessible` ; absente sans attente ; nom de la ligne inchangé | Guide §6.6.4 |
| UT-US-001-37 | `objectifs-taches/presentation/ui/composants-objectifs.test.tsx` | `LigneObjectifUi` | point `MEN-ATTENTE` dans le bouton, description accessible ; absent sans attente | RC-R3-4 |
| UT-COMP-US-017-54 (v0.4.1) | `synchronisation/domaine/elements-en-attente.test.ts` | `elementsEnAttenteDetailles` | vide ; regroupement par élément, lien compté pour sa tâche, plus grand `derniereHlc`, intitulé d'un élément supprimé, intitulé absent ; nombre = `decompterModificationsEnAttente` | Q-BEN-R3R-1 |
| UT-COMP-US-017-53 (v0.4.1, Benjamin) | test du contrôleur | `vue.feuille`, actions | feuille présente après l'ouverture de l'espace ; `surSynchroniser` et `REESSAYER_MAINTENANT` appellent `synchroniserMaintenant` ; `OUVRIR_GOOGLE_DRIVE` appelle `ouvrirGoogleDrive` | RC-R3-8 |

Rangs : les règles existantes de `rangs-tests.json` couvrent ces identifiants (`UT-US-017-(?:0[1-9]|[12]\d|3[0-9])` → 3 ; `UT-US-001-\d+` → 2) : ils s'exécutent au rang courant (3) et restent rouges sur la branche `us/US-017-reliquat-rang3` jusqu'à la réalisation ; la branche n'est fusionnée qu'au vert. Les trois squelettes (n° 17 b, 17 c) sont inscrits dans `rangs-fichiers.json` avec `debut = fin = 4` pendant la phase rouge (exemption d'orphelin et de couverture, `@non-implemente` toléré par UT-OUT-06) ; **Benjamin les ramène à `debut = fin = 3` dans la PR du reliquat**, ce qui réactive les trois contrôles. À défaut, ils s'appliquent d'eux-mêmes au rang 4. Bilan : **22 cas**, tous en échec (« NI » ou assertion). **v0.4.1** : squelette `elements-en-attente.ts` à `debut = fin = 4`, ramené à 3 par Benjamin ; UT-COMP-US-017-54 (2 cas) en échec « NI ».

### 13.2 Incréments 2 à 4 (E10 à livrer avant leur E12)
**Incrément 2 : livré en v0.5, §13.4.** Liste arrêtée, identifiants réservés : UT-US-017-40 à 59 (incrément 2 : détection par contexte, pierre tombale étendue H-1, signalement unique, gagnant de plus petit HLC, lecture fusionnée, `aLire` H-6, réparation RG-048 dont la chaîne de trois déplacements à deux annulations, identifiant sans « : ») ; UT-US-017-60 à 74 (incrément 3 : ordre des contrôles, qui affiche `ERR-012`, restauration mémorisée, génération plus récente, choix concurrents DEC-030, doublons) ; UT-US-017-75 à 89 (incrément 4 : mesure retenue seulement sous 3 s d'aller-retour, médiane de 5 (nombre pair compris), recul corrigé et mesures décalées, avance seulement journalisée, contrôle à la minute et au retour au premier plan, seuil strict d'`ALR-001`, consultation seule sans écriture ni effacement, coexistence de champs inconnus, lecture de chaque version antérieure).

### 13.3 Correction d'ANO-001 (E10 v0.4.3, livrés en rouge le 2026-10-30)
| ID | Fichier (`tests/unitaires/…`) | Cible | Cas | Exigence |
|---|---|---|---|---|
| UT-US-017-90 | `synchronisation/application/cycle-synchronisation-observation.test.ts` | `CycleSynchronisation.observer` | cycle réussi : `EN_COURS` (en cours) puis `REPOS` (terminé) ; décompte lu à la fin = 0 | CA-7 |
| UT-US-017-91 | idem | idem | `DEJA_EN_COURS` ne notifie pas ; relance comprise : deux notifications | §6.9 |
| UT-US-017-92 | idem (2 cas) | idem | fin notifiée avec l'état final : RETENTATIVE, `ECHEC_PERSISTANT` après les reprises programmées, `DRIVE_PLEIN`, refus d'accès ; exception : `REPOS` notifié avant la propagation | CA-3, guide (« Action requise ») |
| UT-US-017-93 | idem | idem | hors ligne et sans accès : aucune notification ; `deposerMaintenant` notifie ; deux observateurs ; annulation | §6.9 |
| UT-US-017-94 | idem | idem | cycles sans geste (temporisation de 5 s, période de 2 min) : fin notifiée, modification déposée | ANO-001 |
| UT-US-017-95 | `composition/application-observation-synchronisation.test.ts` | `Application.observerSynchronisation` (banc) | abonnement pris avant la connexion : notifié par le cycle d'ouverture, par une écriture locale (sans cycle, `enAttente` = 1), puis par le cycle 5 s après (`enAttente` = 0) ; plus rien après annulation | §6.9, S06c |
| UT-US-017-96 | `composition/controleur-synchronisation.test.ts` | `ControleurInterface` | un seul abonnement, pris à la construction | §6.9 |
| UT-US-017-97 | idem | idem | notification de fin : `SYN-ATTENTE` (2) → `SYN-OK`, feuille `SYN-FEUILLE-RIEN-EN-ATTENTE` et dernier échange, observateurs de la vue avertis | CA-7 |
| UT-US-017-98 | idem | idem | `SYN-EN-COURS` ; accès `A_RENOUVELER` → `SYN-SESSION` avec `REPRENDRE_LA_SYNCHRONISATION` ; `ECHEC_PERSISTANT` → `SYN-ACTION`, `ERR-016`, carte ERR-016 | CA-3 |
| UT-US-017-99 | idem | `rafraichissementsTermines` | attend un rafraîchissement retenu et celui lancé pendant l'attente ; résolu aussitôt au repos | §12.4 |
| UT-COMP-US-017-56 (v0.4.4) | `tests/integration/synchronisation/depot-local-dexie-fermeture.test.ts` | `DepotLocalDexie.fermer` | deux observateurs encore abonnés : `fermer()` (deux fois) retire l'écoute `storagemutated` une seule fois. **Rouge** jusqu'à RC-ANO-001-1 | §6.9 n° 4 |
| UT-COMP-US-017-57 (v0.4.4) | idem | idem | désabonnement après `fermer()` : aucun retrait de plus, aucune exception (vert, garde du correctif) | §6.9 n° 4 |
| UT-OUT-10 | `outillage/controles-ci.test.ts` | `verifierTags` | `@ANO-001` admis ; `@ANOMALIE` refusé (vert : réalisé en E10, une expression régulière) | Conventions §11.8 |

Rangs : règle `UT-US-017-9\d\b` → 3 ajoutée à `rangs-tests.json` (après celle des UT-US-017-01 à 39) ; ces tests s'exécutent au rang courant et restent rouges sur `fix/ANO-001` jusqu'à la réalisation (§11.14 ; précédent du reliquat du rang 3) ; la branche n'est fusionnée qu'au vert. Squelettes **inertes** (`observer` et `observerSynchronisation` rendent une annulation sans rien enregistrer ; `rafraichissementsTermines` se résout aussitôt) plutôt que `@non-implemente` : les fichiers touchés sont livrés (`fin` ≤ rang courant, UT-OUT-06) et le contrôleur appellera `observerSynchronisation` dans tous les tests existants ; échecs par assertion (11 cas). Vérifiés verts sur une réalisation d'essai non commitée, suite complète sans régression. Doublures des trois tests existants du contrôleur complétées (§3.3, A4).

### 13.4 Incrément 2 (E10 v0.5, livrés en rouge le 2026-10-31)
| ID | Fichier (`tests/…`) | Cible | Cas | Exigence | Tranche |
|---|---|---|---|---|---|
| UT-US-017-40 | `unitaires/synchronisation/domaine/valeurs-ecartees.test.ts` | `condensatSha256`, `encoderBase32Hex`, `idValeurEcartee` | vecteurs « abc » et vide ; égalité avec `crypto.subtle` sur plusieurs blocs ; vecteurs RFC 4648 ; identifiant = condensat de la chaîne du n° 1, `[0-9a-v]{52}`, distinct si compteur, appareil ou champ changent | §6.6 n° 1 | B1 |
| UT-US-017-41 | idem | `detecterValeursEcartees` | S10 : « A » écartée par « B » ; S11 : connue, rien (des deux côtés) ; S09 : informations différentes, rien | RG-036, DAT §4.2.1 | B1 |
| UT-US-017-42 | idem | idem | même entrée des deux côtés ; S12b départagé par l'appareil ; valeurs égales non signalées ; deux pierres tombales concurrentes non signalées | n° 2 | B1 |
| UT-US-017-43 | idem | idem | S24 : délai écarté par la suppression, même entrée des deux côtés, `intituleElement` ; écriture connue de la suppression : rien | RG-047 | B1 |
| UT-US-017-44 | idem | idem | H-1 : rattachement et placement sous l'objectif supprimé (US-001 S20) ; création d'une sous-tâche sous la tâche supprimée (US-024 S22) ; rattachement connu : rien | H-1, DEC-030 | B1 |
| UT-US-017-45 | idem | `detecterValeursEcartees`, `fusionnerValeursEcartees` | S23 : `intituleElement` = intitulé connu de la suppression, des deux côtés ; absent après la fusion de l'intitulé écarté ; l'entrée qui le porte l'emporte à l'union, dans les deux sens | n° 4, 5 | B1 |
| UT-US-017-46 | idem | `fusionnerValeursEcartees` | union ; même identifiant : gagnant de plus petit HLC, dans les deux sens ; associative, idempotente | n° 5, RG-056 c | B1 |
| UT-US-017-47 | idem | `fusionnerLectures`, `compterALire` | plus grand HLC ; `aLire` compte `CONFLIT`, `SUPPRESSION`, `PLACEMENT_ANNULE` non lues, ni `DONNEES_EFFACEES` ni lecture inconnue | n° 6, H-6 | B1 |
| UT-US-017-48 | `unitaires/synchronisation/domaine/reparation-hierarchie.test.ts` | `reparerHierarchie` | S25 (cycle) : registre rétabli (valeur, HLC, contexte), entrée `PLACEMENT_ANNULE`, `dernierHlc` ; hiérarchie valide : rien (`evenementsAjoutes` vide compris). v0.6 : comparés sans `evenementsAjoutes` (vérifié par UT-US-017-100 à 104) | RG-048 | B1 |
| UT-US-017-49 | idem | idem | US-023 S17 (création jamais candidate), S18, S18b (une seule annulation) ; parent supprimé = principal | n° 7, 8 | B1 |
| UT-US-017-50 | idem | idem | **S18c : chaîne de trois déplacements, deux annulations dans l'ordre** (cas imposé, DAT §4.2) ; mêmes valeurs et identifiants sur l'autre appareil ; valeur rétablie d'origine `DEPLACEMENT` annulée à son tour (deux entrées, un registre) | n° 8 à 10 | B1 |
| UT-US-017-51 | `unitaires/synchronisation/domaine/planifier-synchronisation.test.ts` | `planifierSynchronisation` | S25 réparé dans le plan (hors index, `dernierHlc`, `fusionNonDeposee`) ; S10 : une entrée, puis rien quand elle est connue (plan et méta vides) ; signalements reçus unis | n° 11 | B1 |
| UT-US-017-52 | `unitaires/synchronisation/infrastructure/drive/format-v1-signalements.test.ts` | `encoderFichierAppareil`, `decoderFichierAppareil`, `contenuAEnvoyer` | aller-retour des quatre motifs et d'une lecture, table d'appareils ; motif inconnu ignoré ; `contenuAEnvoyer` recopie et trie, n'ajoute rien s'il n'y a rien | §5.2 | B2 |
| UT-US-017-53 | `unitaires/synchronisation/infrastructure/depot-local-dexie-version3.test.ts` | `DepotLocalDexie` | base version 2 existante ouverte en version 3 sans perte (état, méta) ; tables créées et vides | §5.1, CR-02 | B2 |
| CT-DEPOT-12 | `contrats/depot-local.contrat.ts` (Dexie et mémoire) | `lireSignalements`, `appliquerSynchronisation` | vides pour un espace neuf ; écriture des signalements, version + 1, observateurs, relue par une autre instance ; 3e paramètre du calcul ; plan et signalements vides : version inchangée | §4.6 | B2 |
| CT-DEPOT-13 | idem | idem | remplacement par identifiant ; exception du calcul : rien d'écrit | §4.6 | B2 |
| UT-US-017-54 | `unitaires/synchronisation/application/cycle-valeurs-ecartees.test.ts` (FauxDrive, deux appareils) | `CycleSynchronisation` | S10 : une entrée, la même sur les deux appareils et dans les deux fichiers Drive ; S16 : « Compris », lue partout après échange ; S25 : hiérarchie et entrée identiques, rien en attente | n° 11, CA-8, CA-10, CA-14 | B3 |
| UT-US-017-55 | `unitaires/synchronisation/application/marquer-comme-lue.test.ts` | `MarquerCommeLue` | lecture datée par `hlcSuivant`, `dernierHlc`, version, observateur ; déjà lue ou inconnue : rien ; deux identifiants : un HLC ; erreur du dépôt propagée | n° 6, RG-056 b | B3 |
| UT-US-017-56 | `unitaires/synchronisation/application/consulter-modifications-non-retenues.test.ts` | `consulterModificationsNonRetenues`, `consulterEtatSynchronisation` | détail de toutes les entrées et `aLire` ; erreur propagée ; `aLire` lu de l'attente → `SYN-INFO` | §4.6, S15 | B3 |
| UT-US-017-57 | `unitaires/synchronisation/domaine/detail-valeurs-ecartees.test.ts` | `detaillerValeursEcartees` | quatre colonnes, instant, lecture, existence, pour les quatre motifs et les formes `TEXTE`, `ETAT`, `RATTACHEE`, `SOUS`, `SOUS_TACHE_DE`, `SUPPRIMEE_AVEC`, `DATE` ; **v0.6** : `ETAT` avec sa date ; deux fins à des dates différentes ; « à faire » sans date (propriété absente) | n° 12, glossaire §8, H-2 | D1 |
| UT-US-017-58 | `unitaires/synchronisation/presentation/modifications-non-retenues.test.ts` | `construireModificationsNonRetenues` | codes, variantes, titres `ALR-010` et `ALR-011`, `voir`, ordre, lues exclues, `ALR-014` sous `ALR-008` non comptées ; section absente ; **v0.6** : date d'une valeur d'état recopiée | n° 13, H-6 | D1 |
| UT-US-017-100 (v0.6) | `unitaires/synchronisation/domaine/reparation-journal.test.ts` | `reparerHierarchie` | S25, US-023 S18d : entrée exacte (identifiant = texte du signalement, `CHANGEMENT_PARENT`, avant, après, HLC du déplacement, instant et journée de son entrée, sans `cause`), **identique** sur les deux appareils réparant à des heures différentes ; hiérarchie valide : aucune | n° 9 b | B1b |
| UT-US-017-101 (v0.6) | idem | idem | S18c : deux entrées, dans l'ordre des annulations, chacune à sa journée ; même objectif annulé deux fois : deux entrées, chacune décrit son pas (après = valeur rétablie à ce pas) | n° 9 b, Q-ST017-PEP-3 | B1b |
| UT-US-017-102 (v0.6) | idem | idem | entrée déjà connue : non rendue, registres et signalement inchangés ; entrée de réparation placée avant l'entrée du déplacement dans le journal : jamais prise pour elle (valeur rétablie = principal) | n° 8, 9 b | B1b |
| UT-US-017-103 (v0.6) | idem | `reparerHierarchie`, `entreeDeReparation` | entrée du déplacement absente : instant = physique du HLC, journée de Paris (22:30 UTC → le lendemain), après = principal ; même résultat par la fonction exposée | n° 9 b | B1b |
| UT-US-017-104 (v0.6) | idem | `planifierSynchronisation` | entrée reçue puis entrée de réparation dans `evenementsAjoutes` et `etatApres.journal` ; le fichier de l'autre appareil, qui a aussi réparé, n'ajoute rien (une seule entrée de réparation dans l'historique) | n° 11 d | B1b |
| UT-US-017-105 (v0.6) | idem | `idEvenementDeReparation`, `estIdEvenementDeReparation`, `lireIdEvenement` | texte du signalement, `[0-9a-v]{52}`, distinct si HLC ou objectif changent ; reconnu ; accepté à la relecture ; formes invalides refusées (51 ou 53 caractères, majuscules, « w », rang à zéro de tête) | n° 9 d | B1b |
| UT-US-017-106 (v0.6) | `unitaires/synchronisation/infrastructure/journal-reparation.test.ts` | `encoderEvenement`/`decoderEvenement` (base locale), `encoderFichierAppareil`/`decoderFichierAppareil` | aller-retour sans perte d'une entrée de réparation, à côté de l'entrée du déplacement | n° 9 d, §5.1, §5.2 | B1b |
| UT-US-017-107 (v0.6) | `unitaires/synchronisation/application/historique-reparation.test.ts` | `ServiceEtatLocalTransactionnel.lireJournal` | à HLC égal, l'entrée de réparation suit celle du déplacement alors que son identifiant la précède dans l'ordre ordinal ; autres éléments exclus | n° 9 c | B1b |
| UT-US-017-108 (v0.6) | `unitaires/synchronisation/application/cycle-valeurs-ecartees.test.ts` (FauxDrive, deux appareils) | `CycleSynchronisation` | US-023 S18d : placements le 22, échange le 23 ; historique d'Alpha : création (21), déplacement (22), réparation (22, avant/après inversés, même HLC) ; **même historique** sur les deux appareils | n° 9 b, 9 c, 11 | B3 |
| UT-US-017-59 | `unitaires/synchronisation/presentation/ui/modifications-non-retenues.test.tsx` | `ModificationsNonRetenues` | titre, liste nommée, `data-message`, `data-variante`, « Compris » nommé par la ligne, « Voir » si l'élément existe, carte `ALR-008` à un seul « Compris » | n° 13, guide §4.24 | D1 |

Support de test livré : `tests/support/synchronisation/ecritures-concurrentes.ts` (écritures, contextes, journal construits à la main).

**Compléments de la v0.6 (2026-10-31)** : UT-US-017-48 à 50 comparent le résultat **sans** `evenementsAjoutes` (fonction `sansJournal`) et la hiérarchie valide à `{ registresEcrits: [], valeursEcartees: [], evenementsAjoutes: [] }` ; UT-US-017-51 ne vérifie plus que la première entrée de `evenementsAjoutes` (la suivante : UT-US-017-104). Ce n'est pas un affaiblissement : l'entrée de journal est vérifiée exactement par UT-US-017-100 à 104 ; B1 (sans entrée) reste vert. **Vérifié** sur la réalisation de B1 (`b1ad88d`) dans une copie de travail temporaire : avec le seul ajout `evenementsAjoutes: []` au résultat de `reparerHierarchie`, UT-US-017-40 à 51 sont verts et le typage passe. Squelette `entree-reparation.ts` (`debut = fin = 9`). Règle `UT-US-017-10\d\b` → 9 ajoutée à `rangs-tests.json`. Avec `RANG_COURANT=9` sur cette branche (sans B1) : UT-US-017-100 à 108 en échec, « NI » ou assertion (106 : identifiant refusé à la relecture ; 107 : ordre ordinal ; 108 : historique sans entrée de réparation), pour la raison attendue ; au rang 8, `pnpm verifier` et `pnpm test` verts.

**Rangs** : règle existante `UT-US-017-(?:4\d|5\d)\b` → 9 ; règle `CT-DEPOT-1[2-9]\b` → 9 ajoutée **en tête** de `rangs-tests.json` (avant `DepotLocalEnMemoire.*CT-DEPOT-\d+` → 3). Onze fichiers de `src/` créés avec `debut = fin = 9` dans `rangs-fichiers.json` (§3.4 I2-1 à I2-6, I2-14, I2-15, I2-17 à I2-19) ; seuls ceux-là importent `@non-implemente`. Fichiers existants touchés en E10 par des squelettes **inertes** (aucun `@non-implemente`, `fin` inchangé, précédent d'ANO-001) : port `DepotLocal`, `meta-synchronisation.ts`, `contenu-fichier.ts`, `depot.ts` (paramètre `signalements` ignoré), `depot-local-dexie.ts` (`lireSignalements` rend des signalements vides ; le calcul reçoit `SIGNALEMENTS_VIDES` ; les signalements du plan sont ignorés), `consulter-etat-synchronisation.ts` (champ `AttenteLocale.aLire` livré, non lu) ; doublures (`DepotLocalEnMemoire`, `DepotAvecCorrection`, `depotAvecPannes`, `depotIllisible`) complétées de `lireSignalements` sans assertion changée.

**Bilan** : au rang 8 (`pnpm test`), 905 tests verts, ces tests non sélectionnés ; `pnpm verifier` vert. Avec `RANG_COURANT=9` : 25 en échec (UT-US-017-40 à 59, CT-DEPOT-12 et 13 sur les deux adaptateurs, UT-US-024-22 déjà rouge), « NI » ou assertion, rien d'autre. **Vérification** : UT-US-017-40 à 51 verts sur une réalisation d'essai du domaine (non commitée), ce qui garantit la cohérence des cas entre eux.

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère |
|---|---|---|
| Contrat | `TransportSynchroDrive` avec MSW | CT-TRANS-01 à 10 ; erreurs 401, 403 (deux raisons), 404, 429, 5xx |
| Intégration | `DepotLocalDexie` : `appliquerSynchronisation` atomique et en durabilité stricte (`FabriqueIndexedDbEspionne`), méta relue | 3 cas |
| Performance | Encodage, décodage et fusion d'un état de 5 000 tâches | < 2 s en CI (indicatif) |
| Intégration (incr. 2, Bruce, B2) | `DepotLocalDexie` version 3 : ligne illisible de `valeursEcartees` ou de `lectures` → `DonneesLocalesIllisibles` ; transaction stricte commune aux registres et aux signalements | `UT-COMP-US-017-2-nn` (règle ajoutée par Anthony à l'E13) |
| Propriété (incr. 2, Bruce, B1) | **Corrigé en v0.6 (Q-BRU-1)** : détection **symétrique entre deux appareils** (même ensemble d'entrées, quel que soit celui qui intègre le fichier de l'autre) et union commutative, associative, idempotente ; à trois appareils, l'ensemble peut contenir une entrée de trop (DAT v0.11.7 §4.2.1, « Existence d'une entrée ») : la propriété « même ensemble quel que soit l'ordre de fusion de trois fichiers » de la v0.5 était fausse. Réparation : hiérarchie valide en sortie pour des placements aléatoires ; **B1b** : entrées de réparation identiques sur deux appareils (fast-check, graine fixe) | `UT-COMP-US-017-2-nn` ; complète UT-US-017-29 (convergence) |
| Composant (reliquat du rang 3, v0.4) | **DT-009** : abonnement du magasin des objectifs à `DepotLocal.observer` (par la composition) | `UT-COMP-US-017-…` : une écriture faite hors du magasin (autre cas d'usage sur le même dépôt) met à jour la liste (ECR-008) et le détail (ECR-003) ; plus de rafraîchissement après désabonnement. Pas de test fourni par Anthony : le critère de remboursement du registre fait foi |
| Composant (reliquat du rang 3, v0.4) | **DT-006** : composants du rang 1 (`compte/presentation/ui`, `synchronisation/presentation/ui`) en composants Ionic | Tests de composants existants inchangés et verts ; contrôle par Steeve en E14. Pas de nouveau test fourni par Anthony |

## 15. Plan de réalisation
Incrément 1 : (1) version, contenu, sérialisation canonique, empreinte, compression, format v1 (UT 10 à 15) ; (2) fusion, dépôt (UT 01 à 09) ; (3) port `DepotLocal` étendu et `DepotLocalDexie` ; (4) `TransportSynchroDrive`, `FauxDrive`, contrat ; (5) `CycleSynchronisation`, déclencheurs (UT 17 à 31) ; (6) modèles de vue, steps, composition. Incréments 3 et 4 : E10 puis réalisation, dans l'ordre.

### 15.1 Incrément 2 (rang 9) : réalisation en tranches (OPT-15, v0.5)
Branche de travail : `us/US-017-rang9` (E10), puis une branche par tranche depuis `lot/LOT-001` à jour, chacune fusionnée au vert de ses tests (règle du §13.1 : tests au rang courant 8 non sélectionnés ; `RANG_COURANT=9` en local). **Aucun fichier n'est touché par deux développeurs en parallèle** : la colonne « Fichiers » est exhaustive pour `src/` ; un besoin hors de la liste passe par Anthony.

| Tranche | Développeur | Dépend de | Fichiers (§3.4) | Tests visés | Parallélisme |
|---|---|---|---|---|---|
| **B1** Domaine : détection, union, lectures, réparation, intégration | Bruce | — | I2-1, I2-2, I2-3, I2-5, I2-6, I2-7 (facultatif) | UT-US-017-40 à 51 | Parallèle à D1 et D2 |
| **B1b** (v0.6) Entrée de journal de la réparation | Bruce | B1 | I2-5, I2-6 (modifiés), I2-23, I2-24, I2-25 | UT-US-017-100 à 107 ; non-régression UT-US-017-48 à 51, UT-SOC-37 | Parallèle à B2, D1, D2 (aucun fichier commun avec B2 : `stockage-local/schemas.ts` et `drive/schemas/v1.ts` ne changent pas, ils appellent `lireIdEvenement`) |
| **B2** Persistance et format | Bruce | B1 (types seulement ; `contenuAEnvoyer` n'appelle pas B1) | I2-8 (`depot.ts`), I2-10, I2-11, I2-12 | UT-US-017-52, 53 ; CT-DEPOT-12, 13 ; tests complémentaires (§14) | Parallèle à D1 et D2 |
| **B3** Application : cycle, « Compris », requêtes | Bruce | B1, B1b, B2 | I2-13, I2-14, I2-15, I2-16 | UT-US-017-54 à 56, 108 ; non-régression de UT-US-017-17 à 32 et 90 à 94 | Parallèle à D1 et D2 |
| **D1** Détail, modèle de vue et composant « À lire » | Benjamin | Types de B1 (figés par les squelettes) | I2-17, I2-18, I2-19 | UT-US-017-57 à 59 | Parallèle à B1 à B3 |
| **D2** RG-049 réactivée et étapes d'incohérence | Benjamin | — | I2-20 ; `taches.steps.ts` (N10, N11) | UT-US-024-21, 22 ; US-017 S26, US-024 S20, S21, US-003 S18, S19, US-025 S12c, S15, S16, US-031 S12 (vérifiés en local avec `RANG_COURANT=9`) | Parallèle à B1 à B3 ; après D1 ou avant, au choix de Benjamin (aucun fichier commun) |
| **D3** Composition, interface, étapes du rang 9, **livraison du rang** | Benjamin | B3, D1, D2 | I2-21, I2-22 (sauf N10, N11) ; `rang-courant.json` → 9 | Tous les scénarios du rang 9 (§12.5) ; `pnpm e2e` (feuille), `pnpm verifier`, couverture | Dernière ; porte `rangCourant = 9` |

Points de vigilance : (1) B1 ne change aucun type exporté de `valeurs-ecartees.ts`, `lectures.ts`, `signalements.ts` sans accord d'Anthony (D1 en dépend) ; (2) B3 et D3 se suivent sur la frontière `AttenteLocale.aLire` (B3 la lit, D3 la renseigne dans `attenteDe`) : les tests UT-US-017-56 et un test de composition de D3 en font le contrat ; (3) D2 touche `taches.steps.ts`, D3 aussi (N9) : même développeur, tranches successives ; (4) la question Q-ST017-STE-2 conditionne seulement les textes de D1 et D3 (titres `ALR-009`, libellés « Voir », noms d'information) : D1 peut être livrée avec les éléments testés, les textes suivent la réponse de Steeve avant D3 ; (5) Q-ST017-STA-4 conditionne B2 (port, tables, format) : si Starck refuse, seule B2 change de forme, les tests B1 et D1 restent. (6) **v0.6** : B1 livrée par Bruce (`b1ad88d`) avant cette révision : à la fusion de cette branche, `reparerHierarchie` rend `evenementsAjoutes: []` (une ligne ; le type `ReparationHierarchie` n'est pas figé pour D1, qui ne dépend que de `valeurs-ecartees.ts`, `lectures.ts`, `signalements.ts` et de son propre `detail-valeurs-ecartees.ts`) ; puis B1b. La garde « déplacement déjà annulé non candidat » de B1 est confirmée (n° 8). (7) B1b ne commence qu'après la réponse de Starck à Q-ST017-STA-5 (amendement du DAT) ; Q-ST017-PEP-3 ne la bloque pas (les tests suivent la lecture littérale du glossaire).

## 16. Dette, hypothèses et points ouverts

- **Q-ST017-PEP-1 (Pepper, bloque S06b)** : US-017 S06b se termine par `Et le Drive du compte "A" contient la tâche "Envoyer le devis"`, alors qu'aucune étape de S06b ne crée cette tâche (reprise de S06, où le PC la crée). Tel quel, le scénario ne peut pas passer. a) retirer cette dernière ligne ★ ; b) ajouter, avant l'ouverture, `Et que sur le smartphone, l'utilisateur a créé une tâche … pas encore enregistrée dans le Drive` (forme à ajouter au glossaire).
  - **Réponse de Pepper (2026-10-27) : ni a) ni b), correction d'une erreur de rédaction.** La ligne `Et le Drive du compte "A" contient la tâche "Envoyer le devis"` est la dernière assertion de **S06** (validée depuis E5) ; elle avait été déplacée par erreur dans S06b lors de son insertion (DEC-034). Elle est rendue à S06 et retirée de S06b. S06b se termine désormais par `Alors sur le smartphone, l'objectif "Publier le guide" existe avec le délai 2026-12-15`. Aucune règle, aucun critère ni aucune étape du glossaire ne change ; **S06 retrouve son assertion finale** (à vérifier dans les steps du rang 3). Débloque S06b. *Intégré en v0.2 : §12.2.*
- **Q-ST017-STA-1 (Starck)** : l'incrément 1 ajoute au port `DepotLocal` deux méthodes (`lireMeta`, `appliquerSynchronisation`) et étend la méta locale, comme le prévoyait ST-socle §5.1, sans modifier aucun type du socle (condition 1). Le confirmez-vous conforme à la condition 1 ? a) oui ★ ; b) non.
  - **Réponse de Starck (2026-10-27) : validé, à deux conditions**, intégrées : la suite de contrat et l'adaptateur en mémoire couvrent les deux méthodes (CT-DEPOT-08 à 11, `DepotLocalEnMemoire`) ; `appliquerSynchronisation` tient en une seule transaction stricte (§4.2).
- **Q-ST017-STA-2 (Starck)** : DAT §6.4 ne fixe pas la méthode de lissage de l'écart mesuré par l'en-tête `Date`. Je retiens la moyenne glissante des 5 dernières mesures, chacune au milieu de l'aller-retour, et la détection d'un saut d'horloge murale au-delà de 2 s d'écart avec l'horloge monotone (§6.8). Validez-vous ? a) oui ★ ; b) autre méthode. Non bloquante avant l'E10 de l'incrément 4.
  - **Réponse de Starck (2026-10-27, DAT v0.11.3 §6.4) : corrigé**, intégré au §6.8 : médiane des 5 dernières mesures prises au milieu de l'aller-retour, allers-retours de moins de 3 s seulement ; seuil de saut de 2 s contrôlé chaque minute et au retour au premier plan ; seul un recul est corrigé, une avance est journalisée ; mesures conservées décalées du saut.
- **Q-ST017-STA-3 (nouvelle, non bloquante avant l'E10 du rang 10) — Archivage des appareils inactifs.** DAT §4.2 et v0.11.3 §4.1.4 : le fichier d'un appareil inactif depuis plus de 90 jours est « fusionné puis archivé ». Aucun scénario du lot ne le vérifie, et le DAT ne dit pas ce qu'est « archivé » (déplacé dans un sous-dossier, supprimé par qui ?). Comme le fichier est fusionné à chaque lecture de façon idempotente, l'absence d'archivage n'a pas de conséquence fonctionnelle. a) hors du lot 1, inscrit au registre de dette (DT) avec votre définition ★ ; b) à l'incrément 3 : précisez l'opération (déplacement dans `Done Juan/archives/` par l'appareil qui le constate ?).
  - **Réponse de Starck (E11, DAT v0.11.4 §4.2) : a)**, intégrée : archivage hors du lot 1 ; les fichiers inactifs sont fusionnés comme les autres ; entrée DT-002 créée au registre de dette (conditions et déclencheur de Starck).
- **Q-ST017-STE-1 (Steeve, v0.4, non bloquante)** : a) le guide §6.6.1 demande pour chaque ligne de `SYN-FEUILLE-EN-ATTENTE` la nature de la modification (« Nouvelle tâche », « Délai changé : 20 déc. → 15 déc. »), mais le catalogue n'a aucun code de nature et l'ancienne valeur n'est pas conservée (pas de journal d'opérations, même convention). À l'incrément 1, la ligne n'affiche que l'intitulé. 1) codes de nature à créer (création, suppression, champs modifiés, sans les valeurs), ajoutés au modèle de vue par un champ `nature?` ★ ; 2) intitulé seul. b) `ERR-016` « Vos {n} modifications » n'a ni singulier ni forme pour n = 0 (échec persistant sans modification en attente) : 1) gabarit `{n:|s}` et variante sans attente ★ ; 2) inchangé.
- **Q-BEN-R3R-1 (Benjamin, E13 du reliquat, RC-R3-8)** : rester dans la composition comme `attenteDe`, une fonction de `application.ts` construisant les `LigneFeuilleOrdonnable[]` depuis `depot.lire()` ? **Réponse d'Anthony : découpage validé avec une correction.** La lecture (`depot.lire()`, `lireMeta`) et le câblage restent dans la composition, comme `attenteDe` (conforme au DAT : la présentation n'accède pas au dépôt). La **règle** de regroupement (élément, lien → tâche, plus grand `derniereHlc`, intitulé) va dans le domaine (`elementsEnAttenteDetailles`, n° 17 e, UT-COMP-US-017-54 livré en rouge), pas dans `application.ts` (CR-12, CR-13 : la composition câble, elle ne calcule pas). Détail au n° 17 f. Ordre : 17 e (vert), UT-COMP-US-017-53, contrôleur, `main.tsx`, liste CSP, `pnpm e2e`.
- **ANO-001 (v0.4.3)** : pas de dette introduite ; pas de question ouverte. Recoupement avec le rang 5 (US-002) : aucun fichier de `src/` commun (§3.3) ; à l'E12, les steps `objectifs.steps.ts` (n° 7, une phrase ajoutée) et le banc peuvent être touchés aussi par le rang 5 (fusion à surveiller).
- **Dette** : DT-011 (feuille ECR-011 et point « en attente » : tests livrés en v0.4, réalisation dans la PR du reliquat du rang 3).
- **Q-ST017-STA-4 (Starck, v0.5 ; non bloquante, sauf pour la tranche B2)** — Incrément 2, quatre points : a) le port `DepotLocal` reçoit `lireSignalements()` et un 3e paramètre `signalements` du calcul d'`appliquerSynchronisation`, dont le résultat porte `signalements?` écrits dans la **même** transaction stricte ; base Dexie version 3 (tables `valeursEcartees`, `lectures`, ajout pur) ; même démarche que Q-ST017-STA-1, suite de contrat étendue (CT-DEPOT-12, 13) et doublure en mémoire ; b) contenu des tableaux `valeursEcartees` et `lectures` du schéma 1 (§5.2), lecture tolérante d'un motif inconnu ; c) règles complémentaires du DAT §4.2.1 : à gagnant égal, l'entrée qui porte l'intitulé connu de la suppression l'emporte (n° 4, 5 ; US-002 S23 et US-018 S08 l'exigent : l'intitulé d'origine n'existe plus ailleurs) ; deux valeurs structurellement égales ne sont pas signalées (n° 2 ; nécessaire pour que les réparations identiques des deux appareils ne se signalent pas l'une l'autre) ; avec deux pierres tombales concurrentes, une écriture n'est écartée que si aucune ne la connaît (n° 3) ; d) la réparation RG-048 n'écrit pas d'entrée de journal (n° 9 ; le DAT ne la demande pas ; datée par chaque appareil, elle divergerait à l'union du journal) et le condensat SHA-256 est codé, synchrone, dans le domaine (n° 1). Validez-vous a) à d) ? a) oui ★ ; b) non, préciser le point.
  - **Réponse de Starck (2026-10-31, DAT v0.11.7 §4.2 et §4.2.1) : a) à d) validés, avec conditions ; B2 débloquée.** Aucune décision d'ADR modifiée ; aucune règle métier validée n'est changée par cet avis.
    - **a) Port et base version 3 : validé avec deux conditions.** Le 3e paramètre du calcul et `signalements?` du résultat sont des ajouts compatibles (un calcul à deux paramètres reste valable ; résultat sans signalements ≡ vides) ; une seule transaction stricte, tables incluses dans `TABLES` ; version 3 en ajout pur, `stores` complet (tables des versions 1 et 2 répétées), sans `upgrade` ; montée de version gérée par `versionchange` (RL-LOT-001-A1, déjà en place). Les doublures de `DepotLocal` écrites à la main dans les tests unitaires (service d'état local, cycle) recevront `lireSignalements`. Conditions : (1) **ordre de lecture du dépôt** : les signalements sont lus **après** l'état (ou dans la même transaction de lecture), jamais avant ; sinon une lecture « Compris » écrite entre les deux lectures est couverte par `deposeJusquA = x` sans figurer dans le fichier, et n'est plus déposée tant que rien ne change. À écrire au §6.2 et à couvrir par un test du cycle. (2) CT-DEPOT-12, 13 exécutés contre les deux adaptateurs (Dexie et mémoire), y compris « version et observateurs si plan **ou** signalements non vides ».
    - **b) Format : validé avec une condition.** Compatibilité vérifiée sur le code de l'incrément 1 : `lectures` et `valeursEcartees` y sont des `z.array(z.unknown()).optional()`, et l'empreinte est calculée sur l'objet brut ; un appareil de l'incrément 1 lit donc un fichier de l'incrément 2 sans erreur ni consultation seule, ignore les tableaux et réécrit les siens vides (sans perte : chaque appareil n'écrit que son fichier). Pas de nouveau `schemaVersion` (RG-058). Les fichiers déjà déposés (tableaux vides) sont lus comme « absents ≡ vides ». Condition : le décodeur teste le **motif avant** de valider la forme de l'entrée (un motif futur peut avoir une autre forme), et les entrées sont des objets lâches (`looseObject`) ; seule une entrée de motif connu mal formée rend `FichierIllisible` `SCHEMA` (cohérent avec les registres, et l'empreinte exclut une modification manuelle). Ajouter ce cas « motif inconnu de forme quelconque » à UT-US-017-52.
    - **c) Règles complémentaires : validées, une condition.** (1) Valeurs égales non signalées : conforme à l'intention du DAT (une valeur écartée est une valeur **perdue**) et nécessaire à la convergence de la réparation ; un registre d'état dont seules les dates diffèrent reste signalé. (2) Pierres tombales concurrentes : conforme (un utilisateur a supprimé en connaissance de R). Ces deux points restent soumis à la réponse de Pepper à Q-ST017-PEP-2 a (le commanditaire, s'il y a lieu) : si l'option 2 était retenue, B1 devrait distinguer les écritures de réparation (marqueur à ajouter), B2 ne change pas. (3) Intitulé connu de la suppression : validé. Condition : **ordre total** de l'union. « À égalité complète, l'entrée déjà connue » dépend de l'ordre d'arrivée si deux entrées de même identifiant, même gagnant et même intitulé diffèrent par ailleurs (par exemple `ecartee` d'un `PLACEMENT_ANNULE`, registre courant au moment de la réparation) : garder l'entrée connue **seulement si elle est structurellement égale**, sinon la plus petite sérialisation canonique (n° 5 à compléter, un cas à UT-US-017-46). Performance : la détection (n° 2, 3) indexe une fois par intégration les écritures par élément et par élément visé ; pas de produit « pierres tombales × registres » ; mesure en E14 au volume ENF-T-05.
    - **d) Réparation sans entrée de journal ; SHA-256 dans le domaine : validé avec une condition.** Conforme au DAT : la boucle retrouve une valeur rétablie par le HLC de l'entrée de l'utilisateur (n° 8), une entrée de réparation datée par appareil divergerait à l'union ; le DAT v0.11.7 §4.2 l'écrit désormais explicitement. L'historique (RG-050) relève de Q-ST017-PEP-2 b ; si une entrée y était exigée, elle serait datée de façon déterministe (HLC du déplacement annulé). SHA-256 codé, synchrone, dans le domaine : conforme au DAT §2.4 (domaine sans dépendance) et nécessaire (`crypto.subtle` asynchrone hors transaction) ; usage d'identification, pas de sécurité. Condition : vecteurs NIST FIPS 180-4 (vide, « abc », 448 et 896 bits, longueurs 55, 56, 63, 64, 65 octets) et comparaison avec `crypto.subtle` sur des entrées aléatoires dans UT-US-017-40 ou un test complémentaire ; l'empreinte des fichiers reste en WebCrypto (pas de double usage).
- **Q-ST017-PEP-2 (Pepper, v0.5, non bloquante)** — a) Deux modifications concurrentes qui donnent la **même** valeur (deux renommages en « A ») ou deux suppressions concurrentes du même élément ne sont pas signalées dans « Modifications non retenues » (rien n'est perdu). 1) oui ★ ; 2) les signaler. b) Le placement annulé par la réparation (RG-048) apparaît dans la liste (`ALR-011`), mais **pas** dans l'historique de l'objectif (RG-050). 1) oui ★ (l'annulation n'est pas une action de l'utilisateur) ; 2) une entrée « changement de parent » est attendue dans l'historique (je la spécifierai, datée de façon déterministe).
  - **Réponse de Pepper (2026-10-31, cahier des charges v0.14.3, sans changement de règle)** : a) 1) confirmé (US-017 CA-8 précisé, S10b, S10c ; « terminée le 22 » et « terminée le 23 » restent signalées) ; b) **2)** : le n° 9 de la v0.5 n'est pas conforme à RG-050, à US-023 CA-11 et au glossaire d'étapes §11 (v1.2, Q-US-001-2 : le placement annulé par RG-048 est une conséquence enregistrée) ; précision : l'entrée porte la journée du placement annulé, le suit immédiatement, et est unique sur les deux appareils (US-023 S18d, glossaire d'étapes v1.12). **Intégré en v0.6** : §6.6 n° 8, 9, 9 b à 9 d, 11 d, 12 ; tests UT-US-017-100 à 108. Les règles métier validées priment : je ne demande pas d'arbitrage (pas de désaccord, une correction de ma ST). Remarque de Pepper sur le n° 12 (une valeur d'état sans date) : intégrée (n° 12, UT-US-017-57, 58).
- **Q-ST017-STE-2 (Steeve, v0.5 ; non bloquante pour Bruce, à répondre avant la tranche D3)** — Textes de la section « À lire » sans code au catalogue : a) noms des informations pour `{information}` d'`ALR-009` et d'`ALR-010` (intitulé, description, délai, estimation, objectifs, placement, état, création), avec majuscule en titre ; b) `{appareil}` : les données ne portent aucun nom d'appareil (PWA unique, `plateforme: web`) ; 1) « cet appareil » / « l'autre appareil » ★ ; 2) autre ; même question pour `{heure}` (heure de l'écriture, `formaterHeure`) ★ ; c) libellés « Voir la tâche » / « Voir l'objectif » d'`ALR-009` et d'`ALR-010` générique (le catalogue n'a qu'une partie `action`, « Compris ») ; libellé « Compris » d'`ALR-011` (son `action` est « Voir l'objectif ») ; d) US-024 S22 (sous-tâche créée sous une tâche supprimée) : 1) variante `sous-tache` d'`ALR-010` ★ ; 2) variante `tache` (titre « Tâche « Section A » supprimée ») ; e) `ALR-011` emploie `{element}` dans le titre (objectif annulé) et dans le texte (objectif déplacé) : deux variables distinctes ★ ; f) textes des valeurs hors glossaire §8 : objectif principal, détachée de « X », création, aucune (description ou délai vides).
- **Dette (v0.5)** : DT-025 (`EtatMoteur.aLire` n'est plus lu après B3).
- **Q-BRU-1 (Bruce, B1, 2026-10-31)** — propriété du §14 « même ensemble d'entrées quel que soit l'ordre de fusion de trois fichiers » contraire au DAT v0.11.7 §4.2.1 (« Existence d'une entrée » : une entrée de trop acceptée à trois appareils) ; remplacée par la symétrie entre deux appareils. **Réponse d'Anthony : Bruce a raison**, §14 corrigé (symétrie à deux appareils, union commutative, associative, idempotente). Garde « déplacement déjà annulé non candidat » : **confirmée** (n° 8). Changement de type pour B1b : `ReparationHierarchie.evenementsAjoutes` (déjà dans le squelette v0.6 ; B1 le rend vide) ; type non figé pour D1 (§15.1 n° 6).
- **Q-ST017-STA-5 (Starck, v0.6 ; bloque B1b)** — Amendement du DAT pour l'entrée de journal de la réparation (Q-ST017-PEP-2 b), qui remplace la puce « Pas d'entrée de journal pour la réparation » de la v0.11.7. Validez-vous : a) le texte ci-dessous, tel quel ★ ; b) avec modifications (préciser). Points de décision inclus : (1) identifiant = **texte de l'identifiant du signalement** (même condensat, forme du DAT §6.1 déjà prévue en v0.10.2), plutôt qu'un UUID dérivé, qui éviterait de toucher `lireIdEvenement` mais contredirait §6.1 et DS-08 ; (2) pas de `cause` ; (3) ordre de l'historique complété ; (4) b) : confirmez qu'aucun schéma 1 n'est publié (lot 1 non livré), donc pas de nouveau `schemaVersion` alors qu'un appareil d'un rang antérieur rejetterait un fichier portant une telle entrée.
  **Texte exact proposé** (DAT v0.11.8) :
  - §4.2, puce de la passe de réparation (« Chaque déplacement annulé est consigné comme valeur écartée ; ») → « Chaque déplacement annulé est consigné comme valeur écartée et dans le journal métier (§4.2, « hiérarchies », puce « Entrée de journal de la réparation ») ; ».
  - §4.2 « hiérarchies », la puce « **Pas d'entrée de journal pour la réparation (v0.11.7, Q-ST017-STA-4 d)** … jamais de l'heure de l'appareil qui répare. » est **remplacée** par : « **Entrée de journal de la réparation (v0.11.8, Q-ST017-PEP-2 b, Q-ST017-STA-5)** : chaque déplacement annulé produit une entrée `CHANGEMENT_PARENT` du journal métier, conséquence enregistrée (RG-050, US-023 CA-11 et S18d). Elle est entièrement déterminée par l'annulation, pour que les appareils qui réparent produisent la même entrée et que l'union du journal la dédoublonne : identifiant = texte de l'identifiant du signalement de cette annulation (`hash(élément, champ parent, HLC du déplacement annulé)`, base32hex, 52 caractères, sans `:`) ; HLC = HLC du déplacement annulé ; instant et jour = ceux de l'entrée du déplacement annulé (à défaut, physique de ce HLC et jour de Paris de cet instant) ; `avant` = placement annulé, `apres` = valeur rétablie par cette annulation (avant toute annulation suivante) ; pas de `cause`. Elle n'est jamais datée de l'heure de l'appareil qui répare ni de la valeur finale d'une chaîne, qui dépendrait du nombre de passes. Une entrée déjà présente dans le journal n'est pas réécrite. La boucle cherche la valeur rétablie dans l'entrée du déplacement (identifiant `<UUID v7 de l'opération>:<rang>`), jamais dans une entrée de réparation, qui porte le même HLC et le même élément. »
  - §6.1, « Conséquences indirectes (c) », après « et des déplacements annulés par RG-048 » : « (l'entrée d'un déplacement annulé ne porte pas de `cause` : elle se rattache au déplacement par son HLC, égal, et à son signalement par son identifiant, §4.2) ».
  - §6.1, « Entrées produites par la fusion » → « **Entrées produites par la fusion** (réparation RG-048, §4.2) : identifiant **déterministe**, égal au texte de l'identifiant du signalement `PLACEMENT_ANNULE` correspondant (`hash(élément, HLC du déplacement annulé)`, §4.2.1), pour que les deux appareils produisent la même entrée et que l'union la dédoublonne. Son encodage (base32hex, 52 caractères `[0-9a-v]`) ne contient pas le caractère `:`, ce qui exclut toute collision avec la forme `<UUID v7 de l'opération>:<rang>`. La base locale et le fichier d'appareil (schéma 1) acceptent les deux formes ; aucun schéma 1 n'étant publié avant la livraison du lot 1, pas de nouveau `schemaVersion`. »
  - §6.1, « Ordre d'un historique » → « **Ordre d'un historique** : HLC croissant ; à HLC égal, une entrée écrite par un cas d'usage avant une entrée de réparation ; puis `id` en comparaison ordinale de chaînes (unités de code, sans `localeCompare`). Deux entrées d'un même élément n'ont le même HLC que dans un cas : un déplacement annulé et son entrée de réparation, qui le suit donc immédiatement (US-023 S18d). »
  - Historique : « 0.11.8 | 2026-10-31 | Starck | Q-ST017-STA-5 (Anthony), suite de Q-ST017-PEP-2 b (Pepper) | §4.2 et §6.1 : la réparation RG-048 écrit une entrée de journal par déplacement annulé, déterministe (identifiant du signalement, HLC et journée du déplacement annulé), unique par union ; ordre de l'historique complété. Remplace la puce « Pas d'entrée de journal » de la v0.11.7. Aucune décision d'ADR modifiée. »
- **Q-ST017-PEP-3 (Pepper, v0.6 ; non bloquante, confirmation)** **[RÉPONDUE par Pepper le 2026-11-01 : option 1 confirmée, sans changement de règle ; glossaire d’étapes v1.12.1 §11 ; Anthony intègre.]** — Un même objectif dont deux placements sont annulés dans la même réparation (US-023 S18c, variante : Alpha placé sous Bêta le 21, puis sous Gamma le 22 ; Gamma placé sous Alpha sur l'autre appareil) : deux entrées, chacune décrivant **son** annulation : « Gamma → Bêta » (journée du 22) et « Bêta → aucun (objectif principal) » (journée du 21). Rangé par HLC, l'historique se lit : création ; aucun → Bêta (21) ; Bêta → aucun (21) ; Bêta → Gamma (22) ; Gamma → Bêta (22) : la dernière ligne ne donne pas le placement final (principal). L'autre lecture (« après » = placement final, « Gamma → aucun ») n'est pas réalisable sans doublon : un appareil qui réparerait en deux passes (la seconde annulation constatée plus tard) aurait déjà écrit « Gamma → Bêta », et l'autre appareil, réparant en une passe, écrirait une entrée de même identifiant et de contenu différent. 1) chaque entrée décrit son annulation (lecture littérale du glossaire §11 : « avant = le parent annulé, après = le placement rétabli ») ★ ; 2) autre (à préciser ; probablement un arbitrage, la règle d'unicité l'exclut). Tests UT-US-017-101 écrits selon 1).
- **Q-ST017-STE-3 (Steeve, v0.6 ; non bloquante pour B1b, à répondre avant D3, avec Q-ST017-STE-2)** — Texte d'une valeur d'état dans « Modifications non retenues » (`ALR-009`, `{valeur}`), qui doit montrer la date (RG-056 ; deux fins à des dates différentes) : 1) « terminée le 22 oct. », « abandonnée le 22 oct. », « à faire » (date courte du guide §6.6.1, sans l'année si c'est l'année en cours) ★ ; 2) autre format.


## 17. Checklist de complétude
- [x] Incrément 1 : fichiers, signatures, format, algorithmes, erreurs, steps, tests (E10 livrée).
- [x] Incréments 2 à 4 : règles arrêtées (§6.6 à §6.8) ; E10 et phrases détaillées à livrer avant leur E12.
- [x] Q-ST017-PEP-1, Q-ST017-STA-1 et Q-ST017-STA-2 répondues et intégrées (v0.2).
- [x] Q-ST017-STA-3 répondue (DT-002).
- [x] Incrément 2 (v0.5) : fichiers et tranches, signatures, données, règles n° 1 à 13, erreurs, phrases et scénarios différés, tests (E10 livrée) ; Q-ST017-STA-4, Q-ST017-PEP-2, Q-ST017-STE-2 ouvertes, non bloquantes pour B1, D1, D2.
- [x] v0.6 : entrée de journal de la réparation (n° 9 b à 9 d), date des valeurs d'état (n° 12), tranche B1b, UT-US-017-100 à 108 en rouge ; Q-ST017-STA-5 (bloque B1b), Q-ST017-PEP-3, Q-ST017-STE-3 ouvertes.
