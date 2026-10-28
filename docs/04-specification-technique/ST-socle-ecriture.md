# ST-socle-ecriture — Modèle d'écriture synchronisable (rang 0 de LOT-001)

## 0. En-tête

| Élément | Valeur |
|---|---|
| Objet | Partie commune « modèle d'écriture synchronisable » : condition 1 de Starck (`explicitation-LOT-001.md`, note de Jarvis). Elle est partagée par US-001, US-023, US-002, US-024, US-003, US-025 et par l'incrément 1 d'US-017. |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **0** / 13 (partie « écriture » du socle ; le reste du socle relève de ST-US-022) |
| Exigences couvertes | RG-036 (contexte causal, préparation), RG-046 et RG-047 (pierres tombales et leur contexte), RG-050 (journal métier), RG-057 (index des écritures en attente, préparation), ENF-06, ENF-T-02, ENF-T-07 ; DS-07, DS-08, DS-11, DS-19 |
| DAT / ADR de référence | DAT v0.10.1 (§2.4, §4.1.5 bis, §4.2, §4.2.1, §6.1, §6.4) ; DAT v0.11 (§3.2, DS-07 : durabilité stricte) ; ADR-003, ADR-010, ADR-011, ADR-013 |
| Hypothèses du contrôle d'explicitation appliquées | H-1 (§6.4), H-4 (§6.5), H-5 (§12) |
| Version de la ST | 0.3.1 |
| Statut | **Prête pour E10** ; tests UT-SOC-44 à 46 ajoutés en v0.2 (rouges) |
| Auteur | Anthony |
| Branche Git | `us/SOCLE-ecriture` créée depuis `lot/LOT-001-socle-objectifs-taches` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-22 | Anthony | Alignement sur `conventions.md` v0.4 (DEC-034, ADR-013, DAT v0.11). `DepotLocalDexie` : base ouverte en durabilité stricte, écriture confirmée à l'événement `complete`, transaction avortée traduite en `EcritureLocaleImpossible` (§4.4, §6.8, §8) ; tests UT-SOC-44 à 46 et support `FabriqueIndexedDbEspionne` (§13). Rédaction : `DepotLocalSqlite` et horloge d'Android renvoyés au repli (§1, §3) ; réserve R1 limitée au repli (§5.3, §7, §16, §17). Aucun changement d'interface ni de type. |
| 0.3.1 | 2026-10-28 | Anthony | E13 du rang 0 : §5.1, type d'événement inconnu dans le journal local (Q-BEN-E12-9) ; §12 n° 1, portée de la règle de l'heure inexistante (Q-BEN-E12-6). Aucun changement d'interface. |
| 0.3 | 2026-10-28 | Anthony | E11 : RL-LOT-001-A2 (fichiers d'appareil à la racine du dossier, §5.3) ; RL-LOT-001-A1 et Q-ST022-STA-3 : ajouts à `DepotLocalDexie` spécifiés par ST-US-022 v0.3 §5.2 (`ouvrirEspace`, `appareil()`, `fermer()`, option `surFermetureImposee`, `versionchange` sans réouverture automatique) ; types du socle inchangés. |

### Conditions de Starck (texte qui fait foi, note de Jarvis) et leur traitement
| Condition | Traitement dans ce document |
|---|---|
| 1. US-001 est construite directement sur le modèle d'écriture de la synchronisation : écriture par information avec HLC et contexte causal, transaction unique, index des écritures en attente, journal RG-050 au format du DAT §6.1 ; les ST d'US-001 et de l'incrément 1 sont conçues ensemble, avec le format Drive complet (schéma 1). | §4 à §6 : modèle complet, livré au rang 0. §5.3 : contenu logique du schéma 1, figé dès maintenant (sa forme physique relève de ST-US-017 ; réserve R1 en repli seulement). L'incrément 1 d'US-017 n'ajoute que le transport, la fusion et le marqueur « déposé jusqu'à » : il ne modifie aucun type de ce document. |
| 2. La revue E13 d'US-001 couvre ce chemin d'écriture. | §13 : les tests `UT-SOC-*` sont rejoués à la revue d'US-001 ; ST-US-001 §14 l'exige. |
| 3. Q-US-001-2 et Q-US-001-3 sont tranchées avant le développement d'US-001. | Tranchées en E8 (glossaire v1.4 §11 ; Q-US-001-3 : espaces retirés, pas de longueur maximale). Appliquées au §5.1 et dans ST-US-001. |
| Compléments d'Anthony | US-001 ne passe pas « En recette » avant l'approbation des incréments 1 et 2 ; l'incrément 1 suit immédiatement US-001 et est validé par des tests de propriétés de la fusion (ST-US-017). |

## 1. Résumé technique

- **Ce que ce socle apporte.** Un service applicatif unique, `ServiceEtatLocal`, par lequel tout contexte métier lit l'état local (`EtatMetier`, sans HLC) et l'écrit (`Modification`). Il exécute, en **une transaction** `DepotLocal` : la décision métier (fonction pure), l'attribution d'un **HLC** par modification, le calcul du **contexte causal** de chaque écriture, les **pierres tombales** et leur contexte, les entrées du **journal métier** (RG-050, format DAT §6.1) et la mise à jour de l'**index des écritures en attente** (DAT §4.1.5 bis). L'adaptateur `DepotLocalDexie` persiste cet état dans IndexedDB.
- **Hors périmètre** (ne pas réaliser ici) :
  - transport Drive, fusion, réception d'HLC, marqueur « déposé jusqu'à », retrait de l'index après dépôt, valeurs écartées, réparations RG-047 à RG-049, correction d'horloge mesurée : ST-US-017 (incréments 1 à 4) ;
  - ouverture de l'espace local par compte, identité, `appareilId` du premier lancement, outillage, CI, `.gitignore` (règles : `conventions.md` §9.1, §14) : ST-US-022 et conventions ;
  - adaptateur SQLite et horloge monotone d'Android : **repli seulement** (`conventions.md` v0.4 §19.4), si la condition de DEC-034 échoue ; en cible, `DepotLocalDexie` et `HorlogeSysteme` servent tous les appareils (ADR-013) ;
  - verrou entre onglets : ST-US-031.
- **Prérequis** : aucun (premier élément du lot).

## 2. Traçabilité

### 2.1 Exigences → éléments → tests
| Exigence | Élément | Tests |
|---|---|---|
| DAT §6.4 : HLC = max(heure physique corrigée, dernier HLC + 1), compteur, `appareilId` | `hlcSuivant`, `comparerHlc` | UT-SOC-08 à 12, 42 |
| DAT §4.2.1 : contexte causal par écriture | `contexteDeNouvelleEcriture`, `estConnue`, `fusionnerContextes` | UT-SOC-13 à 16, 43 |
| DAT §4.2.1 v0.10.1 (H-1) : contexte de la pierre tombale, étendu aux écritures qui pointent vers l'élément | `contexteDePierreTombale` | UT-SOC-17 à 19 |
| DS-07, DS-11 : une transaction par cas d'usage ; un HLC par modification | `ServiceEtatLocalTransactionnel.modifier`, `planifierEcritures`, `DepotLocalDexie.appliquer` | UT-SOC-20, 21, 33 à 35, 38, 39 |
| RG-050, DAT §6.1 : journal en ajout seul, valeurs structurées, HLC, instant, jour de Paris, cause | `EvenementJournal`, `planifierEcritures` | UT-SOC-22, 23, 36, 37 |
| DAT §4.1.5 bis v0.10.1 (H-4) : index des écritures en attente, décompte par élément, purges | `IndexEnAttente`, `enregistrerEnAttente`, `purgerPourSuppression`, `decompterModificationsEnAttente`, `plusAncienneModificationEnAttente` | UT-SOC-25 à 30 |
| ADR-010 : l'interface ne lit que la base locale ; ENF-T-07 | `projeterEtatMetier`, `ServiceEtatLocal.lire` | UT-SOC-31, 32, 35 |
| RG-053, PT-16 : jour de Paris | `jourDeReference` | UT-SOC-05 à 07 |
| RG-028 : `Duree.saisie`, `Duree.calculee` | `commun/domaine/duree.ts` | UT-SOC-01, 02 |

## 3. Composants et fichiers

| # | Fichier | Couche | Action | Responsabilité | Dépend de |
|---|---|---|---|---|---|
| 1 | `src/commun/domaine/resultat.ts` | Domaine | Créer | `Resultat`, `succes`, `echec` (`conventions.md` §8.1) | — |
| 2 | `src/commun/domaine/marque.ts` | Domaine | Créer | Type `Marque<T, M>` | — |
| 3 | `src/commun/domaine/assert-never.ts` | Domaine | Créer | `assertNever` | — |
| 4 | `src/commun/domaine/erreur-programmation.ts` | Domaine | Créer | `ErreurProgrammation extends Error` (seule classe d'erreur levée) | — |
| 5 | `src/commun/domaine/temps/instant.ts`, `date-calendaire.ts`, `ecart-temps.ts`, `fuseau.ts`, `fuseau-reference.ts`, `jour-de-reference.ts` | Domaine | Créer | Types temporels et calcul du jour de Paris (`conventions.md` §7.1, §7.2) | 2, date-fns, @date-fns/tz |
| 6 | `src/commun/domaine/duree.ts` | Domaine | Créer | `Duree`, `Duree.saisie`, `Duree.calculee`, `additionnerDurees` | 1, 2 |
| 7 | `src/commun/domaine/identifiants.ts` | Domaine | Créer | `IdObjectif`, `IdTache`, `IdAppareil`, `IdOperation` et leurs constructeurs | 2 |
| 8 | `src/commun/application/ports/horloge.ts` | Application | Créer | Port `Horloge` (`conventions.md` §7.3) | 5 |
| 9 | `src/commun/application/ports/generateur-identifiants.ts` | Application | Créer | Port `GenerateurIdentifiants` | — |
| 10 | `src/commun/infrastructure/horloge-systeme.ts` | Infrastructure | Créer | Adaptateur `HorlogeSysteme` (web) | 8 |
| 11 | `src/commun/infrastructure/generateur-uuid-v7.ts` | Infrastructure | Créer | Adaptateur `GenerateurUuidV7` (paquet `uuid`, fonction `v7`) | 9 |
| 12 | `src/synchronisation/domaine/hlc.ts` | Domaine | Créer | `Hlc`, `hlcSuivant`, `comparerHlc`, `COMPTEUR_HLC_MAX` | 5, 7 |
| 13 | `src/synchronisation/domaine/contexte-causal.ts` | Domaine | Créer | `ContexteCausal`, `EcritureDatee`, `fusionnerContextes`, `contexteDeNouvelleEcriture`, `estConnue` | 12 |
| 13b | `src/synchronisation/domaine/identifiant-evenement.ts` | Domaine | Créer | `IdEvenement`, `idEvenement` (fichier séparé pour éviter un cycle entre `information.ts` et `evenement-journal.ts`) | 7 |
| 14 | `src/synchronisation/domaine/information.ts` | Domaine | Créer | `TypeElement`, `RefElementMetier`, `OrigineParent`, `PlacementObjectif`, `CycleDeVie`, `ValeursParChamp`, `CleInformation`, `cleEnTexte`, `idLien`, `elementDeCle` | 5, 6, 7, 12, 13b |
| 15 | `src/synchronisation/domaine/ecriture.ts` | Domaine | Créer | `Ecriture<V>`, `Registre`, `RegistreQuelconque` | 12, 13, 14 |
| 16 | `src/synchronisation/domaine/evenement-journal.ts` | Domaine | Créer | `TypeEvenementJournal`, `EtatJournal`, `PlacementJournal`, `ContenuEvenement`, `EvenementJournal`, `EvenementACreer` | 12, 13b, 14 |
| 17 | `src/synchronisation/domaine/index-en-attente.ts` | Domaine | Créer | `IndexEnAttente`, `EntreeEnAttente` et fonctions du §6.5 | 12, 14 |
| 18 | `src/synchronisation/domaine/etat-local.ts` | Domaine | Créer | `EtatLocal`, `ETAT_LOCAL_VIDE(appareilId)` | 12 à 17 |
| 19 | `src/synchronisation/domaine/modification.ts` | Domaine | Créer | `Modification` (langage d'écriture des contextes métier) | 14, 16 |
| 20 | `src/synchronisation/domaine/pierre-tombale.ts` | Domaine | Créer | `contexteDePierreTombale`, `descendantsSupprimesParDerivation` | 13, 15, 18 |
| 21 | `src/synchronisation/domaine/planifier-ecritures.ts` | Domaine | Créer | `planifierEcritures` (§6.3) et `PlanEcriture` | 12 à 20 |
| 22 | `src/synchronisation/domaine/etat-metier.ts` | Domaine | Créer | Types `EtatMetier`, `ObjectifEnregistre`, `TacheEnregistree`, `CycleDeVie` (réexporté de 14) | 14 |
| 23 | `src/synchronisation/domaine/projection.ts` | Domaine | Créer | `projeterEtatMetier` (§6.6) | 17, 18, 22 |
| 24 | `src/synchronisation/application/ports/depot-local.ts` | Application | Créer | Port `DepotLocal`, `ErreurDepotLocal`, `IssueTransaction` | 18, 21 |
| 25 | `src/synchronisation/application/service-etat-local.ts` | Application | Créer | Interface `ServiceEtatLocal`, types `DecisionMetier`, `Decision`, `ContexteDecision` | 19, 22, 24 |
| 26 | `src/synchronisation/application/service-etat-local-transactionnel.ts` | Application | Créer | Implémentation du §6.8 | 8, 9, 21, 23, 24, 25 |
| 27 | `src/synchronisation/infrastructure/depot-local-dexie.ts` | Infrastructure | Créer | Adaptateur `DepotLocalDexie` (§4.4, §5.1) | 24, Dexie |
| 28 | `src/synchronisation/infrastructure/stockage-local/schemas.ts` | Infrastructure | Créer | Schémas Zod de relecture des lignes IndexedDB (§5.1) | Zod |
| 29 | `src/synchronisation/index.ts` | Interface publique | Créer | Exporte : `ServiceEtatLocal`, `DecisionMetier`, `Decision`, `ContexteDecision`, `Modification`, `EtatMetier` et ses types, `CycleDeVie`, `EcritureChampObjectif`, `EcritureChampTache`, `EvenementJournal`, `EvenementACreer`, `EtatJournal`, `TypeEvenementJournal`, `IdEvenement`, `idEvenement`, `RefElementMetier`, `ErreurDepotLocal` ; rien d'autre (en particulier ni `Hlc`, ni `Ecriture`, ni `ContexteCausal`) | 19, 22, 25 |
| 30 | `src/composition/web.ts` | Composition | Créer | Assemble `HorlogeSysteme`, `GenerateurUuidV7`, `DepotLocalDexie`, `ServiceEtatLocalTransactionnel` (le nom de base vient de ST-US-022) | 10, 11, 26, 27 |
| 31 | `tests/doublures/horloge-simulee.ts`, `generateur-identifiants-sequentiel.ts` | Test | Créer | Doublures (`conventions.md` §7.3, §7.5) | 8, 9 |
| 32 | `tests/support/banc/temps-simule.ts`, `appareil-simule.ts`, `banc-synchro.ts` | Test | Créer | Banc minimal à un ou deux appareils, sans transport (§12) ; le `FauxDrive` est ajouté par ST-US-017 | 26, 27, 31 |
| 33 | `tests/support/monde.ts`, `hooks.ts`, `types-parametres.ts`, `prefixes.ts`, `references.ts`, `temps.ts`, `commandes-en-attente.ts` | Test | Créer | Monde, préfixes, types de paramètres, résolution des intitulés, conversion des heures murales, commandes en attente (§12) | 32 |
| 34 | `tests/steps/commun/temps.steps.ts`, `appareils.steps.ts`, `confirmations.steps.ts` | Test | Créer | Étapes communes du §12 | 33 |
| 35 | `tests/contrats/depot-local.contrat.ts` | Test | Créer | Suite de contrat du port `DepotLocal`, exécutée sur `DepotLocalDexie` (en repli seulement, aussi sur `DepotLocalSqlite`, `conventions.md` §19.4) | 24 |
| 36 | `tests/support/fabrique-indexeddb-espionne.ts` | Test | Livré (E10, v0.2) | `FabriqueIndexedDbEspionne` : `IDBFactory` de `fake-indexeddb` qui observe le mode, la durabilité et l'événement `complete` de chaque transaction, et peut avorter les écritures (UT-SOC-44 à 46) | — |

**Fichiers qui ne doivent pas être créés à ce rang** : tout fichier de `src/synchronisation/infrastructure/drive/`, `TransportSynchro`, fusion (ST-US-017).

## 4. Interfaces et signatures

### 4.1 Domaine

#### 4.1.1 Commun
```ts
// src/commun/domaine/marque.ts
export type Marque<T, M extends string> = T & { readonly __marque: M };

// src/commun/domaine/temps/*.ts
export type Instant = Marque<number, 'Instant'>;               // ms UTC depuis l'époque
export const Instant = {
  depuisMillisecondes: (ms: number): Instant => …,             // lève ErreurProgrammation si non entier ou non fini
  enIso: (i: Instant): string => …,                            // « 2026-10-21T08:00:00.000Z »
  depuisIso: (texte: string): Resultat<Instant, { readonly type: 'InstantInvalide' }> => …,
  decaler: (i: Instant, e: EcartTemps): Instant => …,
} as const;
export type EcartTemps = Marque<number, 'EcartTemps'>;         // ms, signé
export type DateCalendaire = Marque<string, 'DateCalendaire'>; // « AAAA-MM-JJ », date réelle du calendrier grégorien
export const DateCalendaire = {
  depuisTexte: (texte: string): Resultat<DateCalendaire, { readonly type: 'DateInvalide'; readonly texte: string }> => …,
  comparer: (a: DateCalendaire, b: DateCalendaire): -1 | 0 | 1 => …, // ordre lexicographique, valable pour ce format
  ajouterJours: (d: DateCalendaire, n: number): DateCalendaire => …,
} as const;
export type Fuseau = Marque<string, 'Fuseau'>;
export const FUSEAU_REFERENCE: Fuseau;                          // 'Europe/Paris' (ADR-011)
export const jourDeReference: (instant: Instant) => DateCalendaire; // jour de Paris (RG-053)

// src/commun/domaine/duree.ts — RG-028
export type Duree = Marque<number, 'Duree'>;                    // minutes entières, multiple de 30, ≥ 0
export type DureeSaisieInvalide = { readonly type: 'DureeSaisieInvalide'; readonly minutes: number };
export type DureeCalculeeInvalide = { readonly type: 'DureeCalculeeInvalide'; readonly minutes: number };
export const PAS_DUREE_MINUTES = 30;                            // RG-028
export const Duree = {
  saisie: (minutes: number): Resultat<Duree, DureeSaisieInvalide> => …,     // refuse ≤ 0, non entier, non multiple de 30
  calculee: (minutes: number): Resultat<Duree, DureeCalculeeInvalide> => …, // accepte 0 ; refuse < 0, non entier, non multiple de 30
  zero: (): Duree => …,
  additionner: (a: Duree, b: Duree): Duree => …,
} as const;

// src/commun/domaine/identifiants.ts — DS-08
export type IdObjectif = Marque<string, 'IdObjectif'>;
export type IdTache = Marque<string, 'IdTache'>;
export type IdAppareil = Marque<string, 'IdAppareil'>;
export type IdOperation = Marque<string, 'IdOperation'>;
export const IdObjectif = { depuisUuid: (uuid: string): IdObjectif => … } as const; // vérifie la forme UUID, sinon ErreurProgrammation
export const IdTache = { depuisUuid: (uuid: string): IdTache => … } as const;
export const IdAppareil = { depuisUuid: (uuid: string): IdAppareil => … } as const;
export const IdOperation = { depuisUuid: (uuid: string): IdOperation => … } as const;
```

#### 4.1.2 Synchronisation : HLC et contexte causal
```ts
// src/synchronisation/domaine/hlc.ts — DAT §6.4, ADR-011
export type Hlc = {
  readonly physique: Instant;      // heure physique corrigée, ms UTC
  readonly compteur: number;       // entier, 0 ≤ compteur ≤ COMPTEUR_HLC_MAX
  readonly appareil: IdAppareil;   // départage des égalités (DS-11)
};
export const COMPTEUR_HLC_MAX = 65_535;
export const hlcSuivant: (dernier: Hlc | undefined, physiqueCorrigee: Instant, appareil: IdAppareil) => Hlc;
export const comparerHlc: (a: Hlc, b: Hlc) => -1 | 0 | 1;
export const maxHlc: (a: Hlc, b: Hlc) => Hlc;

// src/synchronisation/domaine/contexte-causal.ts — DAT §4.2.1
export type ContexteCausal = Readonly<Record<string /* IdAppareil */, Hlc>>; // absent = vide ; une clé par appareil
export const CONTEXTE_VIDE: ContexteCausal;
export const fusionnerContextes: (a: ContexteCausal, b: ContexteCausal) => ContexteCausal;      // max par appareil
export const ajouterAuContexte: (c: ContexteCausal, hlc: Hlc) => ContexteCausal;              // c ⊔ {hlc.appareil : hlc}
export const retirerAppareil: (c: ContexteCausal, appareil: IdAppareil) => ContexteCausal;
export type EcritureDatee = { readonly hlc: Hlc; readonly contexte: ContexteCausal }; // partie commune à toute Ecriture<V>
export const contexteDeNouvelleEcriture: (precedente: EcritureDatee | undefined, auteur: IdAppareil) => ContexteCausal;
export const estConnue: (gagnante: EcritureDatee, autre: EcritureDatee) => boolean;
```

#### 4.1.3 Synchronisation : informations et écritures
```ts
// src/synchronisation/domaine/information.ts — DAT §4.2, §6.1
export type TypeElement = 'OBJECTIF' | 'TACHE' | 'LIEN_TACHE_OBJECTIF';
export type IdLien = Marque<string, 'IdLien'>;                       // `${IdTache}|${IdObjectif}` (DS-08, clé déterministe)
export const idLien: (tacheId: IdTache, objectifId: IdObjectif) => IdLien;
export const partiesDuLien: (id: IdLien) => { readonly tacheId: IdTache; readonly objectifId: IdObjectif };
export type RefElementMetier =
  | { readonly type: 'OBJECTIF'; readonly id: IdObjectif }
  | { readonly type: 'TACHE'; readonly id: IdTache };

export type OrigineParent = 'CREATION' | 'DEPLACEMENT';              // RG-048 : une création n'est jamais annulée
export type PlacementObjectif = {
  readonly parentId?: IdObjectif;                                    // absent = objectif principal
  readonly origine: OrigineParent;
  readonly hlcOrigine: Hlc;                                          // HLC de l'écriture d'origine (égal à l'HLC de l'écriture, sauf réparation RG-048)
};
export type CycleDeVie =                                             // registre unique (DAT §4.2), RG-026, RG-027
  | { readonly etat: 'A_FAIRE' }
  | { readonly etat: 'TERMINEE'; readonly dateFin: DateCalendaire; readonly instantFin: Instant }
  | {
      readonly etat: 'ABANDONNEE';
      readonly dateAbandon: DateCalendaire;
      readonly instantAbandon: Instant;
      readonly evenementAbandon: IdEvenement;                        // entrée ABANDON de cette tâche
      readonly abandonParCascade?: IdEvenement;                      // entrée ABANDON de la tâche parente qui l'a entraîné (US-025 CA-7)
    };

export type ValeursParChamp = {
  readonly OBJECTIF: {
    readonly creation: { readonly creeLe: Instant };
    readonly intitule: string;
    readonly description: string | undefined;                       // undefined = sans description
    readonly delai: DateCalendaire | undefined;                      // undefined = sans délai (RG-002)
    readonly parent: PlacementObjectif;
    readonly suppression: true;                                      // pierre tombale (RG-046)
  };
  readonly TACHE: {
    readonly creation: { readonly creeLe: Instant; readonly tacheParenteId?: IdTache }; // tâche parente fixée à la création (US-024, hors périmètre : transformation)
    readonly intitule: string;
    readonly delai: DateCalendaire;                                  // RG-003
    readonly estimationInitiale: Duree;                              // RG-029 ; ignorée tant que la tâche a des sous-tâches (DAT §6.2)
    readonly cycleDeVie: CycleDeVie;
    readonly suppression: true;
  };
  readonly LIEN_TACHE_OBJECTIF: { readonly actif: boolean };        // RG-001, H-1
};
export type ChampDe<T extends TypeElement> = keyof ValeursParChamp[T] & string;
export type IdDe<T extends TypeElement> = T extends 'OBJECTIF' ? IdObjectif : T extends 'TACHE' ? IdTache : IdLien;
export type CleInformation = {
  [T in TypeElement]: { [C in ChampDe<T>]: { readonly type: T; readonly id: IdDe<T>; readonly champ: C } }[ChampDe<T>];
}[TypeElement];
export type CleTexte = Marque<string, 'CleTexte'>;
export const cleEnTexte: (cle: CleInformation) => CleTexte;          // `${type}/${id}/${champ}`
export const elementDeCle: (cle: CleInformation) => RefElementMetier; // LIEN (t|o) → { TACHE, t } ; sinon l'élément lui-même

// src/synchronisation/domaine/ecriture.ts
export type Ecriture<V> = EcritureDatee & { readonly valeur: V };
export type Registre<T extends TypeElement, C extends ChampDe<T>> = {
  readonly cle: { readonly type: T; readonly id: IdDe<T>; readonly champ: C };
  readonly ecriture: Ecriture<ValeursParChamp[T][C]>;
};
export type RegistreQuelconque = {
  [T in TypeElement]: { [C in ChampDe<T>]: Registre<T, C> }[ChampDe<T>];
}[TypeElement];
```

#### 4.1.4 Synchronisation : journal métier (RG-050, DAT §6.1)
```ts
// src/synchronisation/domaine/identifiant-evenement.ts
export type IdEvenement = Marque<string, 'IdEvenement'>;            // `${IdOperation}:${rang}` (§6.7 ; validé par Starck, DAT v0.10.2 §6.1)
export const idEvenement: (operation: IdOperation, rang: number) => IdEvenement;

// src/synchronisation/domaine/evenement-journal.ts
export type TypeEvenementJournal =
  | 'CREATION' | 'MODIFICATION_DELAI' | 'MODIFICATION_ESTIMATION' | 'RATTACHEMENT' | 'DETACHEMENT'
  | 'CHANGEMENT_PARENT' | 'FIN' | 'REOUVERTURE' | 'ABANDON' | 'REPRISE' | 'SUPPRESSION';
export type EtatJournal = {                                          // valeur « état » d'une tâche, telle que l'utilisateur la voyait
  readonly etat: 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE';
  readonly dateFin?: DateCalendaire;
  readonly dateAbandon?: DateCalendaire;
};
export type PlacementJournal = { readonly parentId?: IdObjectif; readonly origine: OrigineParent; readonly hlcOrigine: Hlc };
export type ContenuEvenement =
  | { readonly type: 'CREATION'; readonly element: { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
      readonly avant: Record<string, never>; readonly apres: { readonly parentId?: IdObjectif; readonly delai?: DateCalendaire } }
  | { readonly type: 'CREATION'; readonly element: { readonly type: 'TACHE'; readonly id: IdTache };
      readonly avant: Record<string, never>;
      readonly apres: { readonly tacheParenteId?: IdTache; readonly delai: DateCalendaire; readonly estimation: Duree;
                        readonly objectifIds: ReadonlyArray<IdObjectif> } }                  // ordre de saisie ; vide pour une sous-tâche
  | { readonly type: 'MODIFICATION_DELAI'; readonly element: RefElementMetier;
      readonly avant: { readonly delai?: DateCalendaire }; readonly apres: { readonly delai?: DateCalendaire } }
  | { readonly type: 'MODIFICATION_ESTIMATION'; readonly element: { readonly type: 'TACHE'; readonly id: IdTache };
      readonly avant: { readonly estimation: Duree }; readonly apres: { readonly estimation: Duree } }  // valeurs vues par l'utilisateur (estimation calculée d'une parente)
  | { readonly type: 'RATTACHEMENT'; readonly element: { readonly type: 'TACHE'; readonly id: IdTache };
      readonly avant: Record<string, never>; readonly apres: { readonly objectifId: IdObjectif } }
  | { readonly type: 'DETACHEMENT'; readonly element: { readonly type: 'TACHE'; readonly id: IdTache };
      readonly avant: { readonly objectifId: IdObjectif }; readonly apres: Record<string, never> }
  | { readonly type: 'CHANGEMENT_PARENT'; readonly element: { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
      readonly avant: PlacementJournal; readonly apres: PlacementJournal }                    // calculés par planifierEcritures (§6.3)
  | { readonly type: 'FIN' | 'REOUVERTURE' | 'ABANDON' | 'REPRISE'; readonly element: { readonly type: 'TACHE'; readonly id: IdTache };
      readonly avant: EtatJournal; readonly apres: EtatJournal }
  | { readonly type: 'SUPPRESSION'; readonly element: RefElementMetier;
      readonly avant: Record<string, never>; readonly apres: Record<string, never> };
export type EvenementJournal = ContenuEvenement & {
  readonly id: IdEvenement;
  readonly hlc: Hlc;                    // HLC de la modification qui porte l'événement
  readonly instant: Instant;            // Horloge.maintenant(), non corrigé
  readonly jour: DateCalendaire;        // jourDeReference(instant)
  readonly cause?: IdEvenement;         // conséquence enregistrée (DAT §6.1 c)
};
/** Ce que fournit un contexte métier : ni HLC, ni avant/après d'un changement de parent. */
export type EvenementACreer =
  | (Exclude<ContenuEvenement, { readonly type: 'CHANGEMENT_PARENT' }> & { readonly rang: number; readonly cause?: number })
  | { readonly type: 'CHANGEMENT_PARENT'; readonly element: { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
      readonly rang: number; readonly cause?: number };
```
`rang` : numéro de l'événement dans la décision (0, 1, 2…), unique ; `cause` : rang de l'événement déclencheur dans la même décision. `planifierEcritures` les convertit en `IdEvenement` (§6.7).

#### 4.1.5 Synchronisation : index, état local, modifications, état métier
```ts
// src/synchronisation/domaine/index-en-attente.ts — DAT §4.1.5 bis
export type EntreeEnAttente = {
  readonly premiereEcriture: Instant;   // instant corrigé de la première écriture locale non déposée de cette information
  readonly derniereHlc: Hlc;            // HLC de la dernière écriture de cette information
};
export type IndexEnAttente = ReadonlyMap<CleTexte, { readonly cle: CleInformation; readonly entree: EntreeEnAttente }>;
export const enregistrerEnAttente: (index: IndexEnAttente, cle: CleInformation, hlc: Hlc, instantCorrige: Instant) => IndexEnAttente;
export const aCreationNonDeposee: (index: IndexEnAttente, element: RefElementMetier) => boolean; // entrée (type, id, 'creation') présente
export const retirerEntreesDeElement: (index: IndexEnAttente, element: RefElementMetier) => IndexEnAttente; // champs de l'élément et, pour une tâche, ses liens
export type PurgeSuppression = { readonly element: RefElementMetier; readonly descendantsSupprimes: ReadonlyArray<RefElementMetier>;
  readonly hlc: Hlc; readonly instantCorrige: Instant };                                    // objet nommé (RCD-02, précision E10)
export const purgerPourSuppression: (index: IndexEnAttente, purge: PurgeSuppression) => IndexEnAttente; // §6.5
export const decompterModificationsEnAttente: (index: IndexEnAttente) => number;
export const plusAncienneModificationEnAttente: (index: IndexEnAttente) => Instant | undefined;
export const elementsEnAttente: (index: IndexEnAttente) => ReadonlySet<string /* id d'objectif ou de tâche */>;

// src/synchronisation/domaine/etat-local.ts
export type EtatLocal = {
  readonly appareilId: IdAppareil;
  readonly version: number;                         // incrémentée à chaque transaction validée (§6.8)
  readonly dernierHlc?: Hlc;                        // dernier HLC émis ou reçu ; l'HLC ne recule jamais
  readonly correctionHorloge: EcartTemps;           // écart mesuré avec Google ; 0 au rang 0 (mesure : ST-US-017)
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
  readonly enAttente: IndexEnAttente;
};

// src/synchronisation/domaine/modification.ts — langage d'écriture des contextes métier
export type EcritureChampObjectif =
  | { readonly champ: 'intitule'; readonly valeur: string }
  | { readonly champ: 'description'; readonly valeur: string | undefined }
  | { readonly champ: 'delai'; readonly valeur: DateCalendaire | undefined }
  | { readonly champ: 'parent'; readonly parentId: IdObjectif | undefined };   // déplacement (origine DEPLACEMENT)
export type EcritureChampTache =
  | { readonly champ: 'intitule'; readonly valeur: string }
  | { readonly champ: 'delai'; readonly valeur: DateCalendaire }
  | { readonly champ: 'estimationInitiale'; readonly valeur: Duree }
  | { readonly champ: 'cycleDeVie'; readonly valeur: CycleDeVie };
export type Modification =
  | { readonly type: 'CREER_OBJECTIF'; readonly id: IdObjectif; readonly creeLe: Instant;
      readonly valeurs: { readonly intitule: string; readonly description?: string; readonly delai?: DateCalendaire; readonly parentId?: IdObjectif };
      readonly evenement: EvenementACreer }
  | { readonly type: 'CREER_TACHE'; readonly id: IdTache; readonly creeLe: Instant;
      readonly valeurs: { readonly intitule: string; readonly delai: DateCalendaire; readonly estimationInitiale: Duree;
                          readonly tacheParenteId?: IdTache; readonly objectifIds: ReadonlyArray<IdObjectif> };
      readonly evenement: EvenementACreer }
  | { readonly type: 'ECRIRE_OBJECTIF'; readonly id: IdObjectif; readonly ecriture: EcritureChampObjectif; readonly evenement?: EvenementACreer }
  | { readonly type: 'ECRIRE_TACHE'; readonly id: IdTache; readonly ecriture: EcritureChampTache; readonly evenement?: EvenementACreer }
  | { readonly type: 'ECRIRE_LIEN'; readonly tacheId: IdTache; readonly objectifId: IdObjectif; readonly actif: boolean; readonly evenement?: EvenementACreer }
  | { readonly type: 'SUPPRIMER'; readonly element: RefElementMetier; readonly evenement: EvenementACreer };

// src/synchronisation/domaine/etat-metier.ts — projection lue par les contextes métier, sans HLC ni contexte
export type ObjectifEnregistre = {
  readonly id: IdObjectif; readonly intitule: string; readonly description?: string; readonly delai?: DateCalendaire;
  readonly parentIdEnregistre?: IdObjectif;        // valeur gagnante, sans dérivation RG-046 (le contexte métier dérive le parent effectif)
  readonly creeLe: Instant; readonly supprime: boolean; readonly enAttente: boolean;
};
export type TacheEnregistree = {
  readonly id: IdTache; readonly intitule: string; readonly delai: DateCalendaire; readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie; readonly tacheParenteId?: IdTache;
  readonly objectifIdsActifs: ReadonlyArray<IdObjectif>;  // liens actifs, par HLC croissant de l'écriture actif = true (ordre de rattachement), objectifs supprimés compris
  readonly creeLe: Instant; readonly supprime: boolean; readonly enAttente: boolean;
};
export type EtatMetier = {
  readonly objectifs: ReadonlyMap<IdObjectif, ObjectifEnregistre>;   // supprimés compris
  readonly taches: ReadonlyMap<IdTache, TacheEnregistree>;           // supprimées compris (pas de dérivation)
};
export const projeterEtatMetier: (etat: EtatLocal) => EtatMetier;

// src/synchronisation/domaine/planifier-ecritures.ts
export type PlanEcriture = {
  readonly etatApres: EtatLocal;                                      // version non incrémentée (le dépôt l'incrémente)
  readonly registresEcrits: ReadonlyArray<RegistreQuelconque>;
  readonly evenementsAjoutes: ReadonlyArray<EvenementJournal>;
  readonly enAttenteEcrites: ReadonlyArray<CleTexte>;                 // clés ajoutées ou modifiées (lire la valeur dans etatApres)
  readonly enAttenteRetirees: ReadonlyArray<CleTexte>;
};
export const PLAN_VIDE: (etat: EtatLocal) => PlanEcriture;
export const planifierEcritures: (
  etat: EtatLocal,
  modifications: ReadonlyArray<Modification>,
  contexte: { readonly operation: IdOperation; readonly instant: Instant; readonly jour: DateCalendaire; readonly physiqueCorrigee: Instant },
) => PlanEcriture;                                                    // lève ErreurProgrammation sur une modification incohérente (§8)
```

### 4.2 Application — service `ServiceEtatLocal`
```ts
// src/synchronisation/application/service-etat-local.ts
export type ContexteDecision = {
  readonly instant: Instant;          // Horloge.maintenant(), lu une fois avant la transaction
  readonly jour: DateCalendaire;      // jourDeReference(instant)
  readonly operation: IdOperation;    // tiré une fois par appel ; idEvenement(operation, rang) désigne l'événement de rang donné de la décision
};
export type Decision<T> = { readonly modifications: ReadonlyArray<Modification>; readonly valeur: T };
export type DecisionMetier<T, E> = (etat: EtatMetier, contexte: ContexteDecision) => Resultat<Decision<T>, E>;
export interface ServiceEtatLocal {
  lire(): Promise<Resultat<EtatMetier, ErreurDepotLocal>>;
  lireJournal(element: RefElementMetier): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>>; // par HLC croissant, puis id
  lireDecompteEnAttente(): Promise<Resultat<{ readonly nombre: number; readonly plusAncienne?: Instant }, ErreurDepotLocal>>; // utilisé à partir de l'incrément 1
  modifier<T, E extends { readonly type: string }>(decision: DecisionMetier<T, E>): Promise<Resultat<T, E | ErreurDepotLocal>>;
}
```

| Opération | Entrée | Sortie | Erreurs | Ports | Effets de bord |
|---|---|---|---|---|---|
| `lire` | — | `EtatMetier` | `ErreurDepotLocal` | `DepotLocal` | Aucun |
| `lireJournal` | `RefElementMetier` | entrées de l'élément, ordre chronologique | `ErreurDepotLocal` | `DepotLocal` | Aucun |
| `modifier` | `DecisionMetier<T, E>` | `T` | `E` (refus métier, aucune écriture), `ErreurDepotLocal` | `DepotLocal`, `Horloge`, `GenerateurIdentifiants` | Une transaction : registres, journal, index, `dernierHlc`, `version` |

Séquence de `modifier` : §6.8.

### 4.3 Ports
```ts
// src/synchronisation/application/ports/depot-local.ts
export type ErreurDepotLocal =
  | { readonly type: 'EspaceLocalNonOuvert' }
  | { readonly type: 'EcritureLocaleImpossible' }      // → ERR-014 (TST-ERREUR-ENREGISTREMENT)
  | { readonly type: 'DonneesLocalesIllisibles' };     // ligne relue invalide (Zod) ; journalisée en « erreur »
export type IssueTransaction<T> = { readonly plan: PlanEcriture; readonly valeur: T };
export interface DepotLocal {
  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>>;
  appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>>;
  observer(rappel: () => void): () => void;            // rappel après chaque transaction validée, y compris d'une autre instance (onglet) ; renvoie la fonction de désabonnement
}

// src/commun/application/ports/generateur-identifiants.ts
export interface GenerateurIdentifiants { genererUuidV7(): string }
```
**Contrat de `DepotLocal.appliquer`** (suite `tests/contrats/depot-local.contrat.ts`) :
- `calcul` est **synchrone et pur** ; il reçoit l'état **à jour** au début de la transaction (même si une autre instance a écrit entre-temps) ;
- s'il renvoie `Echec`, rien n'est écrit et l'`Echec` est renvoyé tel quel ;
- s'il renvoie `Succes` avec un plan vide, rien n'est écrit, `version` est inchangée ;
- s'il renvoie un plan non vide, toutes ses écritures sont faites **ou aucune** ; `version` augmente de 1 ; les observateurs sont appelés après la validation ;
- s'il lève une exception, rien n'est écrit et l'exception est propagée ;
- une erreur de la base est traduite en `EcritureLocaleImpossible` (aucune exception de Dexie ne sort).

### 4.4 Adaptateurs
| Adaptateur | Port | Technologie | Points d'attention |
|---|---|---|---|
| `DepotLocalDexie` | `DepotLocal` | Dexie sur IndexedDB ; `fake-indexeddb` en test (une `IDBFactory` par appareil simulé) | Constructeur `new DepotLocalDexie({ nomBase: string, fabrique?: IDBFactory, appareilId: IdAppareil })`. **Durabilité stricte** (`conventions.md` §10.1, ADR-013) : la base Dexie est construite avec l'option `chromeTransactionDurability: 'strict'` (avec `indexedDB: fabrique` et l'`IDBKeyRange` correspondant quand `fabrique` est fournie), de sorte que **toute** transaction d'écriture est ouverte en `durability: 'strict'` (UT-SOC-44). À la première ouverture, écrit `meta.appareilId` ; ensuite, vérifie qu'il est identique (sinon `ErreurProgrammation`). Garde en mémoire le dernier `EtatLocal` lu et sa `version` ; au début de chaque transaction, relit `meta.version` et recharge tout l'état si elle diffère (autre onglet). `null` en base ↔ `undefined` en mémoire ; `Instant` et `Hlc.physique` en ISO 8601. Toute ligne relue passe par Zod (§5.1). **Ajouts du rang 1 (ST-US-022 v0.3 §5.2)** : fabrique `ouvrirEspace` (l'`appareilId` naît avec l'espace), `appareil()`, `fermer()` ; `versionchange` → `close({ disableAutoOpen: true })`, rappel `surFermetureImposee`, puis `EspaceLocalNonOuvert` (DAT v0.11.4 §4.1.6). |
| `HorlogeSysteme` | `Horloge` | `Date.now()`, `performance.now()`, `Intl.DateTimeFormat().resolvedOptions().timeZone` | Seul fichier autorisé à lire l'heure système (`conventions.md` §7.2) |
| `GenerateurUuidV7` | `GenerateurIdentifiants` | `uuid` (`v7`) | — |

### 4.5 Présentation
Sans objet : ce socle n'a pas d'écran. Les modèles de vue des contextes métier lisent par les requêtes de leur contexte.

## 5. Modèle de données et migrations

### 5.1 Stockage local (IndexedDB, `DepotLocalDexie`, version de base Dexie 1)
Nom de la base : fourni par le contexte `compte` (empreinte SHA-256 du `sub`, `conventions.md` §9.3 ; ST-US-022). Tables :

| Table | Clé primaire | Index | Contenu d'une ligne | Validation Zod de relecture |
|---|---|---|---|---|
| `registres` | `cle` (`CleTexte`) | `[type+id]` | `{ cle, type, id, champ, valeur, hlc: { physique: ISO, compteur, appareil }, contexte: { [appareil]: hlc } }` ; `valeur` sérialisée selon `ValeursParChamp` (`undefined` → `null`) | Union discriminée par `type` puis `champ`, `.passthrough()` interdit en local (pas de champ inconnu localement) |
| `journal` | `id` | `[elementType+elementId]`, `hlcTri` (texte `ISO|compteur(5 chiffres)|appareil`) | `EvenementJournal` sérialisé | Union discriminée par `type`. **Rang 0 à incrément 3** : le journal local n'est écrit que par cette version de l'application ; une ligne de type inconnu est une ligne invalide (§8 n° 4, `DonneesLocalesIllisibles`). **Incrément 4 d'US-017** (lecture tolérante des fichiers d'un appareil plus récent, ANT-19) : un type inconnu reçu du Drive est conservé sous `{ type: 'INCONNU', brut }` et ignoré par la projection ; la variante est ajoutée à `EvenementJournal` et à ce schéma par ST-US-017 (Q-BEN-E12-9) |
| `enAttente` | `cle` | — | `{ cle, type, id, champ, premiereEcriture: ISO, derniereHlc }` | strict |
| `meta` | `nom` | — | `appareilId`, `version`, `dernierHlc`, `correctionHorloge` (ms) ; l'incrément 1 ajoute `deposeJusquA`, `pageToken`, `dernierContactDrive` | strict par nom |

Taille cible (ENF-T-05) : 5 000 tâches, environ 40 000 registres et 50 000 entrées de journal ; chargement complet à l'ouverture en moins de 1 s sur un appareil milieu de gamme (mesure : recette technique E14).

### 5.2 Migrations
| Version | De → vers | Opération | Données existantes | Réversibilité | Test |
|---|---|---|---|---|---|
| Base Dexie 1 | — → 1 | Création des tables | Aucune (rien n'est publié) | Sans objet | UT-SOC-35 |

Versions suivantes de la base (ST-US-017 §5.1, qui fait foi ; Q-BEN-LOT001-9) : version 2 à l'incrément 1 (méta étendue, aucune table), version 3 à l'incrément 2 (tables `valeursEcartees` et `lectures`), version 4 à l'incrément 4 (table `registresInconnus`) : ajouts purs, sans transformation de données.

### 5.3 Contenu logique du fichier d'appareil dans le Drive, schéma 1
**Hypothèse retenue (DAT §4.2, §4.2.1, §4.2.2, §6.1)** : un dossier visible `Done Juan/` (portée `drive.file`), un fichier `<appareilId>.etat.json.gz` par appareil, **directement dans le dossier** (sans sous-dossier, reconnu par ses `appProperties` : DAT v0.11.4 §4.2, RL-LOT-001-A2), écrit par lui seul, et un `manifeste.json`. Avec un client OAuth Web unique (ADR-013), R1 est sans objet (DAT v0.11 §10.1). **En repli seulement** (`conventions.md` §19), si le test R1 échouait (fichiers d'un client invisibles de l'autre), le repli `drive.appdata` (arbitrage A6 à rouvrir) changerait l'emplacement et la visibilité, **pas** le contenu logique ci-dessous. La sérialisation physique (compression, table d'appareils, schéma Zod `v1.ts`, empreinte) est spécifiée par ST-US-017, incrément 1.

Contenu logique figé dès le rang 0 (le rang 2 n'écrit que des données de ces formes) :
| Partie | Contenu | Origine |
|---|---|---|
| En-tête | `schemaVersion` = 1, `versionApplication`, `generation`, `appareil` (id, plateforme), `empreinte` (SHA-256 de la sérialisation canonique) | DAT §4.2, DS-10 |
| Registres | Pour chaque `RegistreQuelconque` de l'état local (§4.1.3) : type, id, champ, valeur, HLC, contexte (omis s'il est vide) ; pierres tombales comprises (champ `suppression`) | DAT §4.2, §6.1 |
| Journal | Chaque `EvenementJournal` (§4.1.4), y compris les types inconnus conservés | DAT §6.1, ANT-19 |
| Valeurs écartées et lectures | `ValeurEcartee` (identifiant déterministe, entité, champ, valeur écartée, valeur retenue, appareils, date) et registre « lu » par entrée | DAT §4.2.1, §6.1 ; contenu fixé par ST-US-017 incrément 2, emplacement réservé dès le schéma 1 |
| Appareils | `Appareil` (id, libellé, plateforme, dernier dépôt) | DAT §6.1 ; ST-US-017 incrément 1 |
| Non transmis | Index des écritures en attente, `correctionHorloge`, `deposeJusquA`, `pageToken`, `version` | DAT §6.1 « données locales non synchronisées » |

## 6. Règles et algorithmes

### 6.1 HLC (DAT §6.4, ADR-011)
```text
hlcSuivant(dernier, physiqueCorrigee, appareil):
  1. si dernier est absent, ou physiqueCorrigee > dernier.physique :
       renvoyer { physique: physiqueCorrigee, compteur: 0, appareil }
  2. sinon, si dernier.compteur < COMPTEUR_HLC_MAX :
       renvoyer { physique: dernier.physique, compteur: dernier.compteur + 1, appareil }
  3. sinon : renvoyer { physique: dernier.physique + 1 ms, compteur: 0, appareil }

comparerHlc(a, b): compare physique, puis compteur, puis appareil
  (ordre des chaînes par unités de code UTF-16, opérateurs < et >, jamais localeCompare)
```
- `physiqueCorrigee = Instant.decaler(Horloge.maintenant(), etat.correctionHorloge)`. Au rang 0, `correctionHorloge` vaut 0 ; sa mesure (en-tête `Date`) et l'ancrage monotone relèvent de ST-US-017 et ST-US-018.
- L'HLC ne recule jamais : si l'horloge murale recule, la règle 2 s'applique (UT-SOC-10).
- Deux appareils sans décalage qui écrivent au même instant simulé produisent deux HLC égaux sauf l'`appareil` : le départage est vérifiable (US-002 S20b sur un appareil, US-017 S12b).

### 6.2 Contexte causal d'une écriture (DAT §4.2.1)
```text
contexteDeNouvelleEcriture(precedente, auteur):
  1. si precedente est absente (création) : renvoyer CONTEXTE_VIDE
  2. c ← ajouterAuContexte(precedente.contexte, precedente.hlc)
  3. renvoyer retirerAppareil(c, auteur)          // un appareil connaît toujours ses propres écritures

estConnue(gagnante, autre):
  autre.hlc.appareil = gagnante.hlc.appareil
  ou (gagnante.contexte[autre.hlc.appareil] existe et comparerHlc(gagnante.contexte[autre.hlc.appareil], autre.hlc) ≥ 0)
```
`precedente` est la valeur gagnante courante de la même information dans l'état local. Exemple du DAT (chaîne) : le PC écrit A ; le smartphone, qui connaît A, écrit B (contexte {PC: A}) puis C sur B (contexte {PC: A}) : `estConnue(C, A)` est vrai (UT-SOC-15).

### 6.3 Traduction des modifications (`planifierEcritures`)
```text
planifierEcritures(etat, modifications, { operation, instant, jour, physiqueCorrigee }):
  e ← etat ; h ← etat.dernierHlc
  pour chaque modification m, dans l'ordre :
    h ← hlcSuivant(h, physiqueCorrigee, etat.appareilId)
    selon m.type :
      CREER_OBJECTIF : exiger qu'aucun registre de (OBJECTIF, m.id) n'existe ;
        écrire creation = { creeLe: m.creeLe }, intitule, description (si présente), delai (si présent),
               parent = { parentId: m.valeurs.parentId, origine: CREATION, hlcOrigine: h } ; contexte vide
      CREER_TACHE : exiger qu'aucun registre de (TACHE, m.id) n'existe ;
        écrire creation = { creeLe, tacheParenteId? }, intitule, delai, estimationInitiale, cycleDeVie = { etat: A_FAIRE } ;
        pour chaque objectifId (sans doublon, sinon ErreurProgrammation) : écrire (LIEN, idLien(m.id, objectifId), actif) = true,
        contexte selon §6.2 (le lien peut préexister)
      ECRIRE_OBJECTIF / ECRIRE_TACHE : exiger que l'élément existe (registre creation) et ne soit pas supprimé ;
        pour le champ parent : valeur = { parentId, origine: DEPLACEMENT, hlcOrigine: h }
        contexte selon §6.2
      ECRIRE_LIEN : exiger que la tâche et l'objectif existent ; contexte selon §6.2
      SUPPRIMER : exiger que l'élément existe et ne soit pas déjà supprimé ;
        écrire (type, id, suppression) = true avec contexte = contexteDePierreTombale(e, élément, auteur) (§6.4)
    pour chaque écriture : e.registres[cle] ← nouveau registre ; index (§6.5)
    si m.evenement : ajouter l'événement (§6.7) avec hlc = h, instant, jour
  renvoyer le plan (etatApres = e avec dernierHlc = h ; version inchangée)
```
- Toutes les écritures d'une même modification partagent `h` ; une modification suivante reçoit un `h` strictement plus grand.
- Une modification voit les effets des précédentes de la même liste (création d'une sous-tâche puis réouverture de la tâche parente, par exemple).
- `CHANGEMENT_PARENT` : `avant` = valeur du registre `parent` avant l'écriture (avec son origine et son `hlcOrigine`) ; `apres` = nouvelle valeur. Le contexte métier ne fournit que l'élément.
- Liste vide : `PLAN_VIDE(etat)`.

### 6.4 Contexte d'une pierre tombale (DAT §4.2.1 v0.10.1, H-1)
```text
contexteDePierreTombale(etat, E, auteur):
  c ← CONTEXTE_VIDE
  pour chaque registre r de E (tous les champs) : c ← fusionnerContextes(c, ajouterAuContexte(r.contexte, r.hlc))
  si E est un objectif :
    pour chaque registre de lien (t, E), actif ou non : idem
    pour chaque objectif O' dont le registre parent vaut parentId = E : idem avec ce registre parent
  si E est une tâche :
    pour chaque tâche T' dont le registre creation porte tacheParenteId = E : idem avec ce registre creation
  renvoyer retirerAppareil(c, auteur)
```
L'utilisation de ce contexte (une écriture R est « écartée par la suppression » si `non estConnue(D, R)`) relève de l'incrément 2 d'US-017 ; le calcul, lui, est fait dès la première suppression (rang 2), pour que le schéma 1 ne change pas.

### 6.5 Index des écritures en attente (DAT §4.1.5 bis v0.10.1, H-4)
```text
enregistrerEnAttente(index, cle, hlc, instantCorrige):
  si index contient cle : garder premiereEcriture, remplacer derniereHlc par hlc
  sinon : ajouter { premiereEcriture: instantCorrige, derniereHlc: hlc }

Pour une écriture autre qu'une suppression : enregistrerEnAttente(index, cle, h, physiqueCorrigee).

purgerPourSuppression(index, E, descendants, h, instantCorrige)   // descendants = descendantsSupprimesParDerivation(etat, E)
  1. pour chaque D de descendants tel que aCreationNonDeposee(index, D) : index ← retirerEntreesDeElement(index, D)
  2. si aCreationNonDeposee(index, E) : index ← retirerEntreesDeElement(index, E)      // et aucune entrée de suppression
     sinon : index ← enregistrerEnAttente(index, (E.type, E.id, suppression), h, instantCorrige)

descendantsSupprimesParDerivation(etat, E):
  objectif : aucun (ses tâches sont détachées et ses sous-objectifs promus, RG-046 : ils ne sont pas supprimés)
  tâche : ses sous-tâches non supprimées (registre creation avec tacheParenteId = E, sans registre suppression)

retirerEntreesDeElement(index, E) : retire les clés (E.type, E.id, *) et, si E est une tâche, (LIEN, idLien(E.id, *), *)
decompterModificationsEnAttente(index) = nombre d'éléments distincts { elementDeCle(cle) }
plusAncienneModificationEnAttente(index) = minimum des premiereEcriture (absent si l'index est vide)
elementsEnAttente(index) = ids des éléments { elementDeCle(cle) }
```
Exemples de contrôle : hors ligne, créer l'objectif X, le renommer, puis changer deux fois le délai de la tâche T déjà déposée → décompte 2 (guide §6.6.1) ; créer puis supprimer X → 0 (US-018 S05c) ; sous-tâche créée hors ligne sous une tâche déposée, puis tâche supprimée → 1 (É-4).

Le retrait des entrées après un dépôt confirmé jusqu'à l'HLC x (`derniereHlc ≤ x`) est ajouté par l'incrément 1 d'US-017.

### 6.6 Projection `EtatMetier` (§4.1.5)
```text
projeterEtatMetier(etat):
  pour chaque élément (OBJECTIF ou TACHE) qui a un registre creation et un registre intitule :
    lire la valeur de chaque registre ; supprime ← présence du registre suppression ;
    enAttente ← élément ∈ elementsEnAttente(etat.enAttente)
    objectif : parentIdEnregistre ← registre parent.parentId (sans dérivation)
    tâche : objectifIdsActifs ← liens (id, o) dont actif = true, triés par HLC croissant de leur registre
  un élément sans registre creation ou intitule est ignoré (incohérence de programmation journalisée en « erreur » par le service)
```
Le service mémorise la dernière projection par `version` de l'état (aucun recalcul sans écriture).

### 6.7 Identifiant et ordre des entrées du journal
- `idEvenement(operation, rang)` = `${operation}:${rang}`, où `operation` est un UUID v7 tiré une fois par appel de `modifier` (`GenerateurIdentifiants`). Unique, déterministe dans les tests, sans tirage dans le domaine. Validé par Starck, DAT v0.10.2 §6.1 (et DS-08). Le rang s'écrit en décimal, sans zéros de tête (`…:0`, `…:1`, `…:12`). L'identifiant est **opaque** : aucun code ne doit en extraire l'opération, le rang ni l'horodatage.
- `cause` : `idEvenement(operation, m.evenement.cause)`.
- Une décision qui doit **enregistrer** l'identifiant d'un de ses propres événements dans une valeur (par exemple `evenementAbandon` et `abandonParCascade` du registre `cycleDeVie`, ST-US-025) le calcule avec `idEvenement(contexte.operation, rang)` : c'est le même identifiant que celui que `planifierEcritures` attribue à l'événement de ce rang (UT-SOC-23).
- Ordre chronologique d'un historique : HLC croissant, puis `id` en comparaison ordinale de chaînes (opérateurs `<` et `>`), sans `localeCompare`.
- Les entrées produites par la fusion (réparations RG-048) ont l'identifiant déterministe `hash(élément, HLC du déplacement annulé)` du DAT §6.1, en base32hex (incrément 2). Le test de l'incrément 2 d'US-017 qui couvre les réparations vérifie que cet identifiant ne contient pas « : » : il ne peut donc jamais être confondu avec un identifiant d'opération (suggestion de Starck, reprise dans ST-US-017).

### 6.8 Transaction (`ServiceEtatLocalTransactionnel.modifier`)
```text
modifier(decision):
  1. operation ← IdOperation.depuisUuid(generateur.genererUuidV7())
  2. instant ← horloge.maintenant() ; jour ← jourDeReference(instant)
  3. renvoyer depot.appliquer(etat ⇒
       a. metier ← projection mémorisée de etat
       b. r ← decision(metier, { instant, jour, operation })
       c. si r est un Echec : renvoyer r                                  (aucune écriture)
       d. physiqueCorrigee ← Instant.decaler(instant, etat.correctionHorloge)
       e. plan ← planifierEcritures(etat, r.valeur.modifications, { operation, instant, jour, physiqueCorrigee })
       f. renvoyer succes({ plan, valeur: r.valeur.valeur }))
```
`DepotLocalDexie.appliquer` : transaction Dexie `rw` sur les quatre tables, en durabilité stricte (§4.4) ; lecture de `meta.version` ; rechargement si nécessaire ; appel de `calcul` ; si `Succes` et plan non vide : `bulkPut` des registres écrits, `bulkAdd` des événements, `bulkPut` et `bulkDelete` de l'index, écriture de `meta.dernierHlc` et `meta.version + 1`. **Confirmation** : `appliquer` ne résout son `Succes` qu'**après l'événement `complete`** de la transaction, c'est-à-dire après la résolution de la promesse de `db.transaction(…)` de Dexie, jamais au `success` d'une requête isolée (UT-SOC-45) ; mise à jour du cache et notification des observateurs (et, entre onglets, par l'observation Dexie) après cette confirmation. Une transaction rejetée par Dexie (`error`, `abort`, quota) donne `Echec({ type: 'EcritureLocaleImpossible' })`, sans mise à jour du cache ni notification (§8 n° 3, UT-SOC-46).

**Temps et fuseaux** : `jour` est le jour de Paris de l'instant non corrigé (`conventions.md` §7.1) ; PT-16 : UT-SOC-05 à 07.
**Hasard** : aucun ; seuls les UUID v7 de `GenerateurIdentifiants`.

## 7. Intégration Google
Sans objet à ce rang : aucune requête Google. Le contenu logique du fichier Drive est figé au §5.3 (réserve R1 en repli seulement).

## 8. Gestion des erreurs

| # | Situation | Détection | Erreur | Comportement | Message | Journalisation | Test |
|---|---|---|---|---|---|---|---|
| 1 | Refus métier dans la décision | Domaine métier | `E` du contexte | Aucune écriture ; `Echec` renvoyé | Code `ERR-…` attribué par le modèle de vue du contexte | `info` : `cas_usage`, `type` | UT-SOC-33 |
| 2 | Modification incohérente (élément absent ou supprimé, création en double, lien en double) | `planifierEcritures` | `ErreurProgrammation` levée | Transaction annulée ; exception propagée jusqu'à la frontière (gestionnaire global) | `ERR-014` (toast) | `erreur` : `cas_usage`, nature, identifiants opaques | UT-SOC-24, 34 |
| 3 | Base IndexedDB indisponible, quota, transaction avortée | `DepotLocalDexie` | `EcritureLocaleImpossible` | Aucune écriture ; ni cache mis à jour ni observateur prévenu ; l'utilisateur peut réessayer | `ERR-014` (`TST-ERREUR-ENREGISTREMENT`) | `erreur` : nom de l'erreur Dexie, sans contenu | UT-SOC-46 ; suite de contrat |
| 4 | Ligne relue invalide | `DepotLocalDexie` (Zod) | `DonneesLocalesIllisibles` | Lecture refusée, aucune écriture | `ERR-014` | `erreur` : table, clé | UT-SOC-41 |
| 5 | Espace non ouvert | `DepotLocalDexie` | `EspaceLocalNonOuvert` | Aucune lecture ni écriture | Aucun (l'interface ne propose rien sans compte, RG-019) | `avertissement` | Suite de contrat |

Paramètres de nouvelle tentative : aucun (écriture locale ; l'utilisateur réessaie).

## 9. Patterns imposés

| Pattern | Où | Pourquoi |
|---|---|---|
| Unité de travail (une transaction par cas d'usage) | `ServiceEtatLocal.modifier`, `DepotLocal.appliquer` | DS-07, ENF-T-07 : aucune écriture partielle |
| Décision pure (fonction `état → modifications`) | `DecisionMetier` des contextes métier | Domaine pur, testable sans base ; cohérence lecture-validation-écriture dans la même transaction |
| Projection (lecture sans représentation CRDT) | `projeterEtatMetier`, `EtatMetier` | `conventions.md` §10.1 : seuls `synchronisation` manipule HLC et contexte |
| Objet-valeur | `Duree`, `DateCalendaire`, `Instant`, identifiants | RCD-09, RCD-10 |
| Registre « dernier écrit gagnant » par information | `Registre`, `Ecriture` | ADR-003, DS-11 |

**Interdits** : toute importation de `DepotLocal`, `Hlc`, `Ecriture` ou `ContexteCausal` hors du contexte `synchronisation` (règle dependency-cruiser : seul `synchronisation/index.ts` est importable) ; toute écriture directe dans IndexedDB hors de `DepotLocalDexie` ; toute lecture de l'heure dans le domaine ; tout `await` d'une promesse non Dexie dans `appliquer` (la transaction IndexedDB se fermerait).

## 10. Sécurité et données personnelles
- Données : intitulés, descriptions, délais, estimations (données personnelles d'usage, sensibilité modérée). Pas de chiffrement au repos en v1 (DT-001).
- Jetons : aucun.
- Journal technique : jamais d'intitulé ni de description ; seulement des identifiants opaques, des noms de cas d'usage, des types d'erreur.
- Entrées : toute ligne relue de la base passe par Zod (`conventions.md` §6.2, « `unknown` aux frontières »).
- OWASP : aucune donnée n'est interprétée comme du HTML ; aucun `eval`.

## 11. Exigences non fonctionnelles

| ENF | Exigence | Vérification |
|---|---|---|
| ENF-T-02 | Une action locale (décision, plan, transaction) en moins de 100 ms avec 5 000 tâches | Test d'intégration de performance (§14), indicatif en CI, mesuré en E14 |
| ENF-T-07, ENF-06 | Une écriture validée survit à l'arrêt de l'instance ; une transaction avortée ne laisse rien | UT-SOC-34, 35 ; suite de contrat |
| ENF-04 | Aucune dépendance au réseau | Aucun port distant n'est utilisé |

## 12. Step definitions et banc communs

> Phrases du glossaire d'étapes v1.4. Les étapes ci-dessous sont **nouvelles** et livrées au rang 0 ; les ST métier les réutilisent.

| # | Phrase Gherkin exacte | Mot-clé | Fichier | Nouveau / réutilisé | Implémentation attendue |
|---|---|---|---|---|---|
| 1 | `nous sommes le {date} à {heure} heure de {fuseau}` (avec ou sans « que ») | Étant donné, Quand | `tests/steps/commun/temps.steps.ts` | Nouveau | Convertit l'heure murale du fuseau en `Instant` (`tests/support/temps.ts` : heure ambiguë → première occurrence ; heure inexistante → échec de l'étape, règle propre au banc, qui ne contredit pas le décalage appliqué par `src/` : `conventions.md` §7.1, Q-BEN-E12-6) ; `TempsSimule.positionner` |
| 2 | Préfixe `{ecart} plus tard, ` d'une action | Quand | `tests/support/prefixes.ts` | Nouveau | Avance le `TempsSimule` de l'écart, puis joue l'action |
| 3 | Préfixe `au même instant exact, ` d'une action | Quand | `tests/support/prefixes.ts` | Nouveau | Rejoue l'action à l'instant simulé de l'étape précédente (le temps simulé n'avance pas) |
| 4 | `le {appareil} est réglé sur le fuseau {string}` (avec ou sans « que ») | Étant donné | `tests/steps/commun/appareils.steps.ts` | Nouveau | `HorlogeSimulee.reglerFuseauAppareil` ; valeurs admises : Europe/Paris, America/New_York, UTC, Pacific/Auckland |
| 5 | `l'utilisateur confirme` | Quand | `tests/steps/commun/confirmations.steps.ts` | Nouveau | H-5 : l'appareil qui a exactement une commande en attente ; appelle `executer` (`conventions.md` §8.6) ; mémorise le résultat ; échec si aucune ou plusieurs |
| 6 | `l'utilisateur renonce` | Quand | idem | Nouveau | H-5 ; oublie la commande en attente, sans appel |
| 7 | `que l'utilisateur est connecté avec le compte {string} sur le {appareil}` | Étant donné | `tests/steps/compte/connexion.steps.ts` | **Défini par ST-US-022** (sous réserve R2) | Contrat minimal exigé par les ST métier : à l'issue de l'étape, l'appareil simulé a un `ServiceEtatLocal` ouvert sur l'espace du compte, avec son `appareilId` fixe ; aucune donnée métier |

**Types de paramètres** (`tests/support/types-parametres.ts`, `conventions.md` §11.7) : `{appareil}`, `{date}`, `{heure}`, `{fuseau}`, `{duree}`, `{ecart}` livrés ici ; `{intitules}` est ajouté par ST-US-001.

**Monde et banc** :
- `AppareilSimule` (rang 0) : `nom`, `appareilId` fixe (`conventions.md` §11.11), `horloge: HorlogeSimulee`, `depot: DepotLocalDexie` sur une `IDBFactory` neuve, `service: ServiceEtatLocalTransactionnel`, `generateur: GenerateurIdentifiantsSequentiel` (un compteur par appareil, préfixe d'appareil dans la partie aléatoire pour éviter toute collision entre appareils), `application` : objet de composition des cas d'usage, requêtes et modèles de vue des contextes métier (complété à chaque rang). `arreterBrutalement` et `redemarrer` : abandon de l'instance du service et du dépôt, nouvelle instance sur la même `IDBFactory`.
- `MondeDoneJuan` : `banc`, `resultats: Map<NomAppareil, Resultat<unknown, unknown>>` (dernier résultat d'action), `commandesEnAttente: Map<NomAppareil, CommandeEnAttente>` (`{ description, executer(): Promise<Resultat<unknown, unknown>> }`), `references` (`conventions.md` §11.7).
- Hook `After` : échec si le journal technique d'un appareil contient une entrée `erreur` non attendue.

Scénarios `@ihm` : aucun. Scénarios `@recette` : aucun.

## 13. Tests unitaires fournis (E10)

> Phase rouge : E10 livre les **squelettes** des fichiers du §3 (types complets, fonctions qui lèvent `ErreurNonImplementee`, classe définie dans `tests/support/erreur-non-implementee.ts` et importée par les squelettes via un alias de test). Raison d'échec attendue notée « NI » : le test échoue sur `ErreurNonImplementee`.

| Id | Fichier | Élément testé | Cas testé | Exigence | Échec attendu |
|---|---|---|---|---|---|
| UT-SOC-01 | `tests/unitaires/commun/domaine/duree.test.ts` | `Duree.saisie` | refuse 0, -30, 45, 30,5 ; accepte 30 et 90 | RG-028 | NI |
| UT-SOC-02 | idem | `Duree.calculee` | accepte 0 ; refuse -30 et 45 | RG-028, PEP-9 | NI |
| UT-SOC-03 | `tests/unitaires/commun/domaine/temps/date-calendaire.test.ts` | `DateCalendaire.depuisTexte` | refuse « 2026-02-30 », « 2026-1-5 », « » ; accepte « 2028-02-29 » | RG-045 | NI |
| UT-SOC-04 | idem | `DateCalendaire.comparer`, `ajouterJours` | 2026-12-31 + 1 = 2027-01-01 ; ordre | — | NI |
| UT-SOC-05 | `tests/unitaires/commun/domaine/temps/jour-de-reference.test.ts` | `jourDeReference` | `2026-10-21T21:59:59.999Z` → 2026-10-21 ; `2026-10-21T22:00:00.000Z` → 2026-10-22 | RG-053 | NI |
| UT-SOC-06 | idem | `jourDeReference` | PT-16 hiver : `2026-10-24T22:30Z` → 2026-10-25 ; `2026-10-25T22:30Z` → 2026-10-25 ; `2026-10-25T23:30Z` → 2026-10-26 | RG-053, PT-16 | NI |
| UT-SOC-07 | idem | `jourDeReference` | PT-16 été : `2027-03-27T23:30Z` → 2027-03-28 ; `2027-03-28T21:30Z` → 2027-03-28 | PT-16 | NI |
| UT-SOC-08 | `tests/unitaires/synchronisation/domaine/hlc.test.ts` | `hlcSuivant` | sans dernier : compteur 0, physique corrigée | DAT §6.4 | NI |
| UT-SOC-09 | idem | `hlcSuivant` | même physique que le dernier : compteur + 1 | DAT §6.4 | NI |
| UT-SOC-10 | idem | `hlcSuivant` | horloge reculée : physique du dernier conservée, compteur + 1 (l'HLC ne recule jamais) | DAT §6.4 point 3 | NI |
| UT-SOC-11 | idem | `hlcSuivant` | compteur à `COMPTEUR_HLC_MAX` : physique + 1 ms, compteur 0 | — | NI |
| UT-SOC-12 | idem | `comparerHlc` | ordre physique, puis compteur, puis appareil (`…001` < `…002`) | DS-11 | NI |
| UT-SOC-13 | `tests/unitaires/synchronisation/domaine/contexte-causal.test.ts` | `contexteDeNouvelleEcriture` | création : contexte vide | DAT §4.2.1 | NI |
| UT-SOC-14 | idem | `contexteDeNouvelleEcriture` | sur une écriture du PC, par le smartphone : contient l'HLC du PC, sans entrée du smartphone | DAT §4.2.1 | NI |
| UT-SOC-15 | idem | `estConnue` | chaîne A (PC) → B → C (smartphone) : C connaît A | DAT §4.2.1 (exemple) | NI |
| UT-SOC-16 | idem | `estConnue` | écritures concurrentes (US-017 S10) : B ne connaît pas A ; même appareil : toujours connue | RG-036 | NI |
| UT-SOC-17 | `tests/unitaires/synchronisation/domaine/pierre-tombale.test.ts` | `contexteDePierreTombale` | couvre les écritures de tous les champs de l'élément, sans l'auteur | RG-047 | NI |
| UT-SOC-18 | idem | `contexteDePierreTombale` | objectif : couvre un lien (t, E) et un placement d'un objectif sous E | DAT v0.10.1, H-1 | NI |
| UT-SOC-19 | idem | `contexteDePierreTombale` | tâche : couvre la création de ses sous-tâches | RG-047 | NI |
| UT-SOC-20 | `tests/unitaires/synchronisation/domaine/planifier-ecritures.test.ts` | `planifierEcritures` | `CREER_OBJECTIF` : registres creation, intitule, delai, parent (origine CREATION, `hlcOrigine` = h), même HLC, contexte vide ; pas de registre description si absente | DS-11 | NI |
| UT-SOC-21 | idem | `planifierEcritures` | deux modifications : HLC strictement croissants ; la seconde voit l'effet de la première | DS-11 | NI |
| UT-SOC-22 | idem | `planifierEcritures` | `ECRIRE_OBJECTIF` parent : origine DEPLACEMENT ; événement `CHANGEMENT_PARENT` avec `avant` (origine et `hlcOrigine` de l'ancienne valeur) et `apres` | RG-048 (préparation), RG-050 | NI |
| UT-SOC-23 | idem | `planifierEcritures` | événement : `id` = `<operation>:<rang>` (rang décimal sans zéros de tête), `hlc` de sa modification, `instant` et `jour` fournis, `cause` convertie | RG-050 | NI |
| UT-SOC-24 | idem | `planifierEcritures` | écriture sur un élément absent ou supprimé ; création en double → `ErreurProgrammation` | — | NI |
| UT-SOC-25 | `tests/unitaires/synchronisation/domaine/index-en-attente.test.ts` | `enregistrerEnAttente` | la réécriture d'une information conserve `premiereEcriture` et remplace `derniereHlc` | RG-057, DEC-025 | NI |
| UT-SOC-26 | idem | `decompterModificationsEnAttente` | objectif X créé puis renommé, délai de T modifié deux fois, T rattachée → 2 | Q-US-018-1 | NI |
| UT-SOC-27 | idem | `purgerPourSuppression` | élément créé puis supprimé avant dépôt : toutes ses entrées retirées, aucune entrée de suppression → 0 | US-018 S05c | NI |
| UT-SOC-28 | idem | `purgerPourSuppression` | élément déjà déposé puis supprimé : une entrée `suppression` → 1 | DAT §4.1.5 bis | NI |
| UT-SOC-29 | idem | `purgerPourSuppression` | sous-tâche créée hors ligne sous une tâche déposée, tâche supprimée → 1 | H-4, É-4 | NI |
| UT-SOC-30 | idem | `plusAncienneModificationEnAttente` | minimum des `premiereEcriture` ; index vide → `undefined` | RG-057 | NI |
| UT-SOC-31 | `tests/unitaires/synchronisation/domaine/projection.test.ts` | `projeterEtatMetier` | valeurs gagnantes ; `supprime` ; `parentIdEnregistre` brut ; `objectifIdsActifs` par HLC d'activation, lien désactivé exclu | ADR-003 | NI |
| UT-SOC-32 | idem | `projeterEtatMetier` | `enAttente` vrai pour un élément de l'index, y compris une tâche dont seul un lien est en attente | DAT §4.1.5 bis | NI |
| UT-SOC-33 | `tests/unitaires/synchronisation/application/service-etat-local.test.ts` (Dexie sur `fake-indexeddb`) | `modifier` | décision en `Echec` : `Echec` renvoyé, `version`, registres, journal, index et `dernierHlc` inchangés | DS-07 | NI |
| UT-SOC-34 | idem | `modifier` | décision qui lève une exception : rien n'est écrit, exception propagée | ENF-T-07 | NI |
| UT-SOC-35 | idem | `modifier` puis `lire` sur une **nouvelle instance** du dépôt (même `IDBFactory`) | état relu identique (persistance, arrêt brutal simulé) | ENF-T-07, US-018 S09 | NI |
| UT-SOC-36 | idem | `modifier` | `correctionHorloge` = +5 min : `hlc.physique` = maintenant + 5 min ; `evenement.instant` = maintenant ; `premiereEcriture` = maintenant + 5 min | DAT §4.1.5 bis, §6.4 | NI |
| UT-SOC-37 | idem | `lireJournal` | entrées de l'élément seulement, par HLC croissant | RG-050 | NI |
| UT-SOC-38 | idem | `modifier` | après redémarrage avec une horloge reculée, le nouvel HLC est strictement supérieur au dernier persisté | DAT §6.4 | NI |
| UT-SOC-39 | idem | `modifier` sur deux instances du service partageant la base | la décision de la seconde voit l'écriture de la première (rechargement par `version`) | US-031 (onglets) | NI |
| UT-SOC-40 | `tests/integration/synchronisation/depot-local-dexie.test.ts` | `DepotLocalDexie` | aller-retour d'un registre `delai: undefined` (stocké `null`) et d'un `Instant` (ISO) | `conventions.md` §7.1 | NI |
| UT-SOC-41 | idem | `DepotLocalDexie.lire` | ligne `registres` corrompue → `DonneesLocalesIllisibles` | `conventions.md` §6.2 | NI |
| UT-SOC-44 | idem (`FabriqueIndexedDbEspionne`) | `DepotLocalDexie.appliquer` | toute transaction d'écriture est ouverte en durabilité `strict` | `conventions.md` §10.1, ADR-013 | NI |
| UT-SOC-45 | idem | `DepotLocalDexie.appliquer` | à la résolution du `Succes`, chaque transaction d'écriture a reçu `complete` | US-018 CA-5, ENF-T-07 | NI |
| UT-SOC-46 | idem | `DepotLocalDexie.appliquer` | transaction d'écriture avortée → `EcritureLocaleImpossible` ; une nouvelle instance relit la version 0, sans registre | §8 n° 3, ENF-T-07 | NI |
| UT-SOC-42 | `tests/unitaires/synchronisation/domaine/hlc.proprietes.test.ts` (fast-check) | `hlcSuivant` | pour toute suite d'heures physiques, la suite des HLC est strictement croissante | DAT §6.4 | NI |
| UT-SOC-43 | `tests/unitaires/synchronisation/domaine/contexte-causal.proprietes.test.ts` (fast-check) | `fusionnerContextes` | commutative, associative, idempotente | DAT §4.2.1 | NI |

Suites de contrat : `DepotLocal` → `tests/contrats/depot-local.contrat.ts` (écrite par Anthony en E10, exécutée sur `DepotLocalDexie`).

**Précisions de l'E10 (2026-10-22)** — les squelettes font foi pour les signatures suivantes, absentes ou ajustées par rapport au §4 :
- `purgerPourSuppression(index, purge: PurgeSuppression)`, avec `PurgeSuppression = { element, descendantsSupprimes, hlc, instantCorrige }` : la signature à cinq paramètres du §4.1.5 enfreignait RCD-02 (quatre au plus) ;
- `planifierEcritures(etat, modifications, contexte: ContextePlanification)` : type nommé du troisième paramètre ;
- `new ServiceEtatLocalTransactionnel({ depot, horloge, generateur }: DependancesServiceEtatLocal)` ;
- doublures (`tests/doublures/`) et `TempsSimule` livrés en squelettes, avec leur contrat en commentaire : `new TempsSimule(depart)`, `new HorlogeSimulee(temps)`, `new GenerateurIdentifiantsSequentiel(prefixeAppareil = '00')` (UUID `00000000-0000-7000-80<pp>-<n sur 12 chiffres>`) ;
- suite de contrat : identifiants `CT-DEPOT-01` à `CT-DEPOT-07` ; les observateurs de l'instance qui écrit sont appelés au plus tard à la résolution de la promesse d'`appliquer` (CT-DEPOT-05) ;
- squelettes : `nonImplemente(…)` importé par l'alias `@non-implemente` (`tsconfig.json`, `vitest.config.ts`) ; plus aucun import de cet alias dans `src/` à la revue E13 du rang ;
- `Resultat`, `succes`, `echec`, `Marque`, `assertNever`, `ErreurProgrammation`, `FUSEAU_REFERENCE`, `COMPTEUR_HLC_MAX`, `CONTEXTE_VIDE`, `PAS_DUREE_MINUTES` sont livrés complets (types fondateurs et constantes).
- Support de test livré par Anthony : `tests/support/valeurs.ts`, `fabriques/etat-local.ts`, `environnement.ts`, `modifications.ts`, `plans.ts`, `fast-check.ts` (graine `FC_SEED`, défaut 20261022).
Cas temporels couverts : minuit de Paris, PT-16 (hiver et été), fin d'année, année bissextile.
Commande (v0.3, Q-BEN-LOT001-2) : `RANG_COURANT=0 pnpm test` ; la sélection par rang (`conventions.md` §11.14) exécute UT-SOC-01 à 46, CT-DEPOT-01 à 07 sur `DepotLocalDexie` seulement, UT-US-022-48 et 49, et les tests d'outillage. Les autres tests des mêmes fichiers appartiennent à des rangs ultérieurs.

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère de suffisance |
|---|---|---|
| Unitaires complémentaires | `cleEnTexte`, `idLien`, `partiesDuLien`, `elementDeCle`, `Instant` | Couverture du §12 de `conventions.md` (95 % synchronisation) |
| Intégration | `DepotLocalDexie` : observation entre deux instances, quota simulé (exception Dexie → `EcritureLocaleImpossible`) | Cas §8 n° 3 et 5 |
| Performance (indicatif) | `modifier` avec 5 000 tâches et 50 000 entrées de journal générées | < 100 ms par action sur la machine de CI, mesure consignée dans la *pull request* |
| Support de test | `tests/support/temps.ts` : heure ambiguë et inexistante ; `references.ts` : intitulé ambigu | Un test par règle |

## 15. Plan de réalisation
1. Commun : `Resultat`, `Marque`, types temporels, `Duree`, identifiants (UT-SOC-01 à 07).
2. Synchronisation, domaine : HLC, contexte causal, informations, journal, index, pierre tombale, planification, projection (UT-SOC-08 à 32, 42, 43).
3. Port `DepotLocal` et suite de contrat ; `DepotLocalDexie` (UT-SOC-40, 41, 44 à 46).
4. `ServiceEtatLocalTransactionnel` (UT-SOC-33 à 39).
5. Doublures, banc minimal, monde, préfixes, types de paramètres, étapes communes (§12).
6. Composition `web.ts` ; contrôle dependency-cruiser (aucun import interdit, §9).

## 16. Dette, hypothèses et points ouverts
- **Points ouverts** : aucun. ANT-25 (format de l'`IdEvenement`) est clos : validé par Starck, DAT v0.10.2 §6.1.
- **Réserve R1** : en repli seulement (`conventions.md` §19) ; elle porterait sur l'emplacement du fichier Drive (§5.3), pas sur son contenu logique.
- **Hypothèses** : H-1, H-4, H-5 (contrôle d'explicitation), appliquées sans changement.
- **Dette acceptée d'emblée** : aucune. DT-001 (données locales non chiffrées) s'applique à `DepotLocalDexie`.

## 17. Checklist de complétude (avant E11)
- [x] Chaque exigence est reliée à un élément et à au moins un test (§2.1).
- [x] Tous les fichiers à créer sont listés, avec leur couche (§3).
- [x] Toutes les signatures publiques sont données, erreurs comprises (§4).
- [x] Le modèle de données et les migrations sont décrits (§5) ; le contenu logique du format Drive est figé (§5.3), la réserve R1 ne valant qu'en repli.
- [x] Chaque algorithme est décrit de façon déterministe (§6).
- [x] Chaque erreur a un comportement, un code de message et un test (§8).
- [x] Les patterns imposés et interdits sont listés (§9) ; la sécurité est explicite (§10).
- [x] Les étapes communes sont listées (§12).
- [x] Les tests du §13 existent, s'exécutent et échouent pour la raison attendue (E10, 2026-10-22 : 68 cas UT-SOC et 7 cas CT-DEPOT, tous « NI » ; v0.2 : 3 cas UT-SOC-44 à 46 ajoutés, « NI »).
- [x] ANT-25 validé par Starck (DAT v0.10.2 §6.1).
