# ST-US-017 — Retrouver mes données sur smartphone et sur PC (incréments 1 à 4)

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
| Questions de cette ST | Q-ST017-PEP-1, Q-ST017-STA-1 à 3 répondues et intégrées ; Q-ST017-STE-1 ouverte, non bloquante (§16) |
| Version | 0.4 |
| Statut | **E11 : remarques traitées (v0.3)**. Incrément 1 : tests du §13.1 livrés en rouge. Incréments 2 à 4 : conception arrêtée ; E10 avant l'E12 de chacun (§13.2) |
| Auteur | Anthony |
| Branches | `us/US-017-1-synchronisation-de-base`, `us/US-017-2-conflits`, `us/US-017-3-restauration`, `us/US-017-4-horloge-versions` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après R11 et M-RED ; R1 sans objet avec un client OAuth Web unique). Rangs d'exécution des scénarios revérifiés (§12.2). E10 de l'incrément 1 livrée. |
| 0.2 | 2026-10-27 | Anthony | Réponses de Pepper (S06 et S06b corrigés : S06b exécuté au rang 3 sans condition) et de Starck (DAT v0.11.3). **Q-ST017-STA-1** : doublure `DepotLocalEnMemoire` et suite de contrat étendue (CT-DEPOT-08 à 11), une seule transaction stricte (§3.1, §4.2, §13.1). **Q-ST017-STA-2** : médiane de 5 mesures d'aller-retour < 3 s, seul un recul corrigé, contrôle chaque minute et au retour au premier plan (§6.8, constantes livrées). **Q-ST022-STA-3** : l'`appareilId` naît avec l'espace ; l'ancien fichier d'un appareil après suppression des données est celui d'un appareil inactif (§6.3). |
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

## 5. Modèle de données et migrations

### 5.1 Stockage local
Base de l'espace : **version Dexie 2** (incrément 1) : aucune nouvelle table ; table `meta` : clés `dossier`, `fichierPropre`, `manifeste`, `deposeJusquA`, `pageToken`, `dernierContactDrive`, `fusionNonDeposee`. Version 3 (incrément 2) : tables `valeursEcartees` (clé `id`) et `lectures` (clé `id`). Version 4 (incrément 4) : table `registresInconnus` (clé `cle`) ; clé `mesuresHorloge` de la méta (tableau de millisecondes, 5 au plus). Toutes sont des ajouts purs (aucune transformation de donnée).

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

### 6.6 Incrément 2 (rang 9) : règles arrêtées
- **Valeur écartée** (DAT §4.2.1) : à chaque fusion, pour chaque information où deux écritures distinctes coexistent (locale et reçue), la perdante L est écartée si `non estConnue(W, L)`. Pour une pierre tombale D de l'élément, toute écriture R d'un champ de l'élément, ou pointant vers lui (lien `(t, E)`, `parent = E`, H-1), est écartée si `non estConnue(D, R)`. Identifiant : `idValeurEcartee = base32hex(SHA-256(type|id|champ|appareil de L|HLC de L))` (sans « : »). Pour un même identifiant, l'entrée retenue est celle dont le gagnant a le plus petit HLC. Union dans `valeursEcartees` ; « lu » : registre par identifiant, fusionné par HLC.
- **Réparation RG-048** : boucle du DAT §4.2 (candidats = placements d'origine `DEPLACEMENT` participant à une violation ; annulation du plus ancien (HLC, puis `appareilId`, puis identifiant) ; valeur rétablie = `avant` de l'entrée `CHANGEMENT_PARENT` du journal ; écriture de réparation et entrée de journal à identifiant déterministe `hash(élément, HLC du déplacement annulé)` en base32hex ; une valeur écartée « placement annulé » par annulation). Test imposé : chaîne de trois déplacements croisés qui exige deux annulations.
- **RG-049** : dérivée à la lecture (ST-US-024 §6.6), sans écriture.
- **Affichage** : `ALR-009` (valeur conservée ordinaire), `ALR-010` (suppression ; variantes `rattachement`, `placement`, H-2), `ALR-011` (placement annulé), `ALR-014` (repartir de zéro, groupé sous `ALR-008`, non compté) ; `aLire` = nombre d'entrées `ALR-009` à `ALR-011` non lues (H-6).

### 6.7 Incrément 3 (rang 10) : règles arrêtées
Ordre des contrôles du DAT §4.2.2 à chaque cycle, en un seul point (`controlerDrive`) : (1) dossier et manifeste ; (2) compatibilité (incrément 4) ; (3) génération effective = maximum des générations du ou des manifestes et des fichiers valides, `INITIALE` < `NOUVELLE(hlc)` ordonnées par HLC ; génération plus récente que la locale → valeurs en attente signalées (`ALR-014`), effacement de l'espace, relecture ; (4) fichier propre ; (5) autres fichiers. `ERR-012` : manifeste attendu absent, illisible ou modifié (tout appareil) ; fichier propre attendu altéré (cet appareil seulement) ; un autre fichier altéré est ignoré sans message. Tant que `ERR-012` est affiché, l'appareil n'écrit rien dans le Drive. « Restaurer » : réécrit le fichier propre et le manifeste (`restauration = (HLC, appareil)`, génération inchangée) ; hors ligne : mémorisé, exécuté après les contrôles 1 à 3 au retour du réseau. « Repartir de zéro » (`CNF-REPARTIR-ZERO`, réseau exigé) : manifeste avec `NOUVELLE(hlc)`, fichier propre vide, effacement local. Dossier ou manifeste en double : le plus ancien (`createdTime`, puis `id`) est canonique ; un appareil supprime seulement le double qu'il a créé. Une erreur transitoire n'est jamais une altération.

### 6.8 Incrément 4 (rang 11) : règles arrêtées
- **Correction d'horloge (DAT v0.11.3 §6.4, Q-ST017-STA-2)** : à chaque réponse de Google portant un en-tête `Date` (précision à la seconde), `mesure = Date − (envoi + réception) / 2` (instants de l'appareil), retenue seulement si `réception − envoi < ALLER_RETOUR_MAX_MESURE_HORLOGE` (3 s, mesuré sur l'horloge monotone) ; la méta garde les `NOMBRE_MESURES_HORLOGE` (5) dernières mesures retenues (`mesuresHorloge`, donnée locale) ; `correctionHorloge` = **médiane** de ces mesures (nombre pair : moyenne des deux valeurs centrales, arrondie à la milliseconde inférieure). **Saut** : contrôlé toutes les `PERIODE_CONTROLE_SAUT_HORLOGE` (1 min, `Planificateur`) et à chaque retour au premier plan ; `d = Δ murale − Δ monotone` depuis le contrôle précédent ; `d < −SEUIL_SAUT_HORLOGE` (recul de plus de 2 s) → `correctionHorloge` augmentée de `−d` exactement et chaque mesure conservée décalée de `−d` ; `d > SEUIL_SAUT_HORLOGE` (avance) → **aucune correction**, entrée `info` « avance d'horloge » au journal technique (veille possible : `performance.now()` peut s'arrêter) ; une avance manuelle n'est rattrapée qu'au prochain échange avec Google. L'HLC ne recule jamais (socle). Le jour métier reste calculé sur l'heure non corrigée (conventions §7.1). **Point de mesure (RL-LOT-001-A7)** : l'en-tête `Date` ne transite pas par `TransportSynchro` ; la mesure est prise par un observateur de `ClientGoogle` (`ObservateurEchangesGoogle.surReponse({ envoiMonotone, receptionMonotone, envoiMurale, receptionMurale, date })`), appelé pour **toutes** les réponses Google (Drive, userinfo, plus tard Calendar) et injecté dans la correction d'horloge par la composition. Aucun changement de port.
- **`ALR-001`** : affiché si `|correctionHorloge| > SEUIL_HORLOGE_DEREGLEE` (strict), sur l'appareil qui mesure ; une valeur reçue datée de plus de 24 h dans le futur est seulement journalisée.
- **Âge de la plus ancienne modification en attente** : `consulterEtatSynchronisation` retranche `correctionHorloge` à `premiereEcriture` (heure de l'appareil, ST-US-022 §4.5).
- **RG-058** : `FormatPlusRecent` (fichier ou manifeste de `schemaVersion` > `SCHEMA_VERSION`) → consultation seule : aucune écriture Drive (y compris manifeste et dépôt), aucune fusion du plus récent, aucun effacement ; `actionRequise = FORMAT_PLUS_RECENT` ; saisie bloquée (`ModeSaisie = CONSULTATION_SEULE` : un décorateur unique de `ServiceEtatLocal.modifier`, posé dans la composition, renvoie `Echec({ type: 'ConsultationSeule' })` ; le socle ne change pas) ; « Mettre à jour » : `registration.update()`, `skipWaiting`, rechargement. Champs inconnus de même `schemaVersion` conservés et réécrits.

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
| 22 | Phrases des incréments 2 à 4 (modifications non retenues, RG-044, horloge, versions, fuseau, `ALR-…`) | `modifications-non-retenues.steps.ts`, `drive.steps.ts`, `etat-affiche.steps.ts`, `commun/temps.steps.ts` | 9, 10, 11 | Spécifiées dans la mise à jour de cette ST qui précède l'E10 de chaque incrément (§13.2) ; formes : glossaire v1.8 §1, §3, §6, §7, §8 |

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

Rangs : les règles existantes de `rangs-tests.json` couvrent ces identifiants (`UT-US-017-(?:0[1-9]|[12]\d|3[0-9])` → 3 ; `UT-US-001-\d+` → 2) : ils s'exécutent au rang courant (3) et restent rouges sur la branche `us/US-017-reliquat-rang3` jusqu'à la réalisation ; la branche n'est fusionnée qu'au vert. Les trois squelettes (n° 17 b, 17 c) sont inscrits dans `rangs-fichiers.json` avec `debut = fin = 4` pendant la phase rouge (exemption d'orphelin et de couverture, `@non-implemente` toléré par UT-OUT-06) ; **Benjamin les ramène à `debut = fin = 3` dans la PR du reliquat**, ce qui réactive les trois contrôles. À défaut, ils s'appliquent d'eux-mêmes au rang 4. Bilan : **22 cas**, tous en échec (« NI » ou assertion).

### 13.2 Incréments 2 à 4 (E10 à livrer avant leur E12)
Liste arrêtée, identifiants réservés : UT-US-017-40 à 59 (incrément 2 : détection par contexte, pierre tombale étendue H-1, signalement unique, gagnant de plus petit HLC, lecture fusionnée, `aLire` H-6, réparation RG-048 dont la chaîne de trois déplacements à deux annulations, identifiant sans « : ») ; UT-US-017-60 à 74 (incrément 3 : ordre des contrôles, qui affiche `ERR-012`, restauration mémorisée, génération plus récente, choix concurrents DEC-030, doublons) ; UT-US-017-75 à 89 (incrément 4 : mesure retenue seulement sous 3 s d'aller-retour, médiane de 5 (nombre pair compris), recul corrigé et mesures décalées, avance seulement journalisée, contrôle à la minute et au retour au premier plan, seuil strict d'`ALR-001`, consultation seule sans écriture ni effacement, coexistence de champs inconnus, lecture de chaque version antérieure).

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère |
|---|---|---|
| Contrat | `TransportSynchroDrive` avec MSW | CT-TRANS-01 à 10 ; erreurs 401, 403 (deux raisons), 404, 429, 5xx |
| Intégration | `DepotLocalDexie` : `appliquerSynchronisation` atomique et en durabilité stricte (`FabriqueIndexedDbEspionne`), méta relue | 3 cas |
| Performance | Encodage, décodage et fusion d'un état de 5 000 tâches | < 2 s en CI (indicatif) |
| Composant (reliquat du rang 3, v0.4) | **DT-009** : abonnement du magasin des objectifs à `DepotLocal.observer` (par la composition) | `UT-COMP-US-017-…` : une écriture faite hors du magasin (autre cas d'usage sur le même dépôt) met à jour la liste (ECR-008) et le détail (ECR-003) ; plus de rafraîchissement après désabonnement. Pas de test fourni par Anthony : le critère de remboursement du registre fait foi |
| Composant (reliquat du rang 3, v0.4) | **DT-006** : composants du rang 1 (`compte/presentation/ui`, `synchronisation/presentation/ui`) en composants Ionic | Tests de composants existants inchangés et verts ; contrôle par Steeve en E14. Pas de nouveau test fourni par Anthony |

## 15. Plan de réalisation
Incrément 1 : (1) version, contenu, sérialisation canonique, empreinte, compression, format v1 (UT 10 à 15) ; (2) fusion, dépôt (UT 01 à 09) ; (3) port `DepotLocal` étendu et `DepotLocalDexie` ; (4) `TransportSynchroDrive`, `FauxDrive`, contrat ; (5) `CycleSynchronisation`, déclencheurs (UT 17 à 31) ; (6) modèles de vue, steps, composition. Incréments 2 à 4 : E10 puis réalisation, dans l'ordre.

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
- **Dette** : DT-011 (feuille ECR-011 et point « en attente » : tests livrés en v0.4, réalisation dans la PR du reliquat du rang 3).

## 17. Checklist de complétude
- [x] Incrément 1 : fichiers, signatures, format, algorithmes, erreurs, steps, tests (E10 livrée).
- [x] Incréments 2 à 4 : règles arrêtées (§6.6 à §6.8) ; E10 et phrases détaillées à livrer avant leur E12.
- [x] Q-ST017-PEP-1, Q-ST017-STA-1 et Q-ST017-STA-2 répondues et intégrées (v0.2).
- [x] Q-ST017-STA-3 répondue (DT-002).
