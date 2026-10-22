# ST-US-002 — Créer et gérer mes tâches

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-002](../01-specification-fonctionnelle/user-stories/US-002-creer-et-gerer-mes-taches.md), état du 2026-10-21 (validée, DEC-018) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **5** / 13 |
| Fichier `.feature` | [`tests/features/US-002-creer-et-gerer-mes-taches.feature`](../../tests/features/US-002-creer-et-gerer-mes-taches.feature), 28 scénarios |
| RG couvertes | RG-001, RG-003, RG-004, RG-024, RG-028, RG-029, RG-045, RG-046, RG-047 (via ST-US-017 incrément 2), RG-050, RG-053 |
| DAT / ADR | DAT v0.10.1 (§4.2, §6.1, §6.2) ; ADR-003, ADR-010, ADR-011 |
| Maquettes | ECR-002 (L1 à L5), ECR-006 (guide §4.3), ECR-007 (A, B, C, E) ; guide v0.2.8 §5.7 |
| Q-US traitées | Q-US-002-1, Q-US-002-2, Q-US-002-3, Q-US-001-2, Q-US-001-3, Q-US-024-1 (E8) ; Q-US-001-6 (d) (réponse de Steeve, guide v0.2.9 §5.8) ; **Q-US-002-4 posée (§16, non bloquante)** |
| Prérequis | ST-US-001 (rang 2), ST-US-023 (rang 4) |
| Version | 0.1 |
| Statut | **Prête pour E10** (Q-US-001-6 (d) répondue) ; Q-US-002-4 non bloquante, à lever avant E11 |
| Auteur | Anthony |
| Branche Git | `us/US-002-taches` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-22 | Anthony | Réponse à Q-US-001-6 (d) (guide v0.2.9 §5.8) : sections `SEC-TACHES-*`, sous-tâches sous leur tâche parente ; §4.5, §6.6, §12, UT-US-002-33 ; statut levé ; Q-US-002-4 posée |

## 1. Résumé technique
- **Ce que l'US change.** Saisie d'une tâche avec contrôles cumulables (`ERR-020` à `ERR-023`), rattachement n-n par `LienTacheObjectif` (H-1), modification de l'intitulé, du délai, de l'estimation (`ERR-033` pour une tâche parente) et des objectifs (`ERR-034` pour une sous-tâche), suppression avec confirmation, alertes de délai (`ALR-005`, RG-024), retard (RG-045), estimation en vigueur, liste « Tâches » avec filtres et tri du guide §5.7, détail d'une tâche, tâches dans le détail d'un objectif, journal RG-050. Livre aussi l'étape de contexte « les tâches suivantes : » (H-7), étendue aux rangs 6 à 8.
- **Hors périmètre** : sous-tâches et estimation calculée en pratique (ST-US-024) ; terminer et rouvrir (ST-US-003) ; abandonner et reprendre (ST-US-025) ; suppression concurrente (ST-US-017 incrément 2) ; priorisation (US-004).
- **Prérequis** : ST-US-001, ST-US-023.

## 2. Traçabilité
### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests | Composants | Rang |
|---|---|---|---|---|---|
| CA-1 création | S01 | RG-001, 003, 028, 029 | UT-US-002-04, 29 | `CreerTache` | 5 |
| CA-2 aucune présélection | S02 | RG-003, RG-029 | UT-US-002-26 | `construireFormulaireTache` | 5 |
| CA-3 refus | S03, S04 | RG-003, RG-029 | UT-US-002-01, 02, 27 | `validerSaisieTache` | 5 |
| CA-4 estimation | S05a, S05b | RG-028 | UT-US-002-03 | `Duree.saisie` | 5 |
| CA-5 sans objectif | S06 | RG-001 | UT-US-002-23 | Filtre « Sans objectif » | 5 |
| CA-6 plusieurs objectifs | S07 | RG-001 | UT-US-002-32 | `ConsulterDetailObjectif` | 5 |
| CA-7 alerte | S08 | RG-024 | UT-US-002-14 à 16 | `alertesDelaiTache` | 5 |
| CA-8 modification | S09, S10, S11 | RG-004, RG-025 | UT-US-002-06, 10, 11 | Cas d'usage de modification | 5 (S11 : 7) |
| CA-9 estimation | S12, S13 | RG-029, RG-023 | UT-US-002-07, 08, 09, 18 | `ModifierEstimationTache` | 5 (S13 : 6) |
| CA-10 retard | S14 à S17, S19 | RG-045, RG-053 | UT-US-002-17, 30 | `estTacheEnRetard` | 5 (S15 : 8) |
| CA-11 liste | S20, S20b, S20c, S20d | RG-045, RG-001 | UT-US-002-19 à 25 | `construireListeTaches` | 5 (S20 : 7 ; S20c, S20d : 8) |
| CA-12 suppression | S21, S22 | RG-046 | UT-US-002-12, 13, 28, 31 | `SupprimerTache` | 5 (S21 : 7) |
| CA-13 suppression concurrente | S23 | RG-047 | ST-US-017 incrément 2 | — | 9 |
| CA-14 historique | S24 | RG-050 | UT-US-002-04, 06, 07, 10, 11, 13 | Décisions | 5 |
| Délai sans heure entre appareils | S18 | RG-003, RG-053, RG-017 | UT-SOC-03 | — | 5 (exige l'incrément 1) |

### 2.2 Règles de gestion → implémentation
| RG | Élément | Tests |
|---|---|---|
| RG-001 | `LienTacheObjectif` (socle), `deciderRattachement`, `deciderDetachement`, `VueMetier.objectifsDirectsPar` | UT-US-002-10, 11 |
| RG-003, RG-029 | `validerSaisieTache` | UT-US-002-01 à 03 |
| RG-024 | `alertesDelaiTache` (`ALR-005`) | UT-US-002-14 à 16 |
| RG-028 | `Duree.saisie` | UT-SOC-01, UT-US-002-03 |
| RG-045 | `estTacheEnRetard` | UT-US-002-17 |
| RG-046 | `deciderSuppressionTache` ; sous-tâches supprimées par dérivation (`VueMetier`) | UT-US-002-12, 13 |
| RG-050 | Événements `CREATION`, `MODIFICATION_DELAI`, `MODIFICATION_ESTIMATION`, `RATTACHEMENT`, `DETACHEMENT`, `SUPPRESSION` | UT-US-002-04, 06, 07, 10, 11, 13 |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/saisie-tache.ts` | Domaine | Créer | `validerSaisieTache` (§6.1) |
| 2 | `src/objectifs-taches/domaine/estimation.ts` | Domaine | Créer | `estimationEnVigueur` (RG-023, RG-029) |
| 3 | `src/objectifs-taches/domaine/alertes-delai.ts` | Domaine | Modifier | `alertesDelaiTache` (§6.3) |
| 4 | `src/objectifs-taches/domaine/retard.ts` | Domaine | Modifier | `estTacheEnRetard` |
| 5 | `src/objectifs-taches/domaine/refus.ts` | Domaine | Modifier | `EstimationCalculee` (ERR-033), `ObjectifsHerites` (ERR-034) |
| 6 | `src/objectifs-taches/domaine/confirmation.ts` | Domaine | Modifier | `SUPPRESSION_TACHE` |
| 7 | `src/objectifs-taches/domaine/actions.ts` | Domaine | Modifier | `ActionTache`, `actionsTache` (actions d'édition au rang 5) |
| 8 | `src/objectifs-taches/domaine/decisions/creer-tache.ts` | Domaine | Créer | `deciderCreationTache` |
| 9 | `src/objectifs-taches/domaine/decisions/modifier-tache.ts` | Domaine | Créer | `deciderRenommageTache`, `deciderModificationDelaiTache`, `deciderModificationEstimation` |
| 10 | `src/objectifs-taches/domaine/decisions/rattacher-tache.ts` | Domaine | Créer | `deciderRattachement`, `deciderDetachement` |
| 11 | `src/objectifs-taches/domaine/decisions/supprimer-tache.ts` | Domaine | Créer | `evaluerSuppressionTache`, `deciderSuppressionTache` (complétée par ST-US-024, H-3) |
| 12 | `src/objectifs-taches/application/cas-usage/creer-tache.ts`, `modifier-tache.ts`, `rattacher-tache.ts`, `supprimer-tache.ts` | Application | Créer | `CreerTache`, `RenommerTache`, `ModifierDelaiTache`, `ModifierEstimationTache`, `RattacherTache`, `DetacherTache`, `SupprimerTache` |
| 13 | `src/objectifs-taches/application/requetes/resumes.ts` | Application | Modifier | `ResumeTache`, `resumerTache` |
| 14 | `src/objectifs-taches/application/requetes/consulter-taches.ts`, `consulter-detail-tache.ts` | Application | Créer | Requêtes `ConsulterTaches`, `ConsulterDetailTache` |
| 15 | `src/objectifs-taches/application/requetes/consulter-detail-objectif.ts` | Application | Modifier | Ajout des tâches directes (`taches`) |
| 16 | `src/objectifs-taches/presentation/modeles-de-vue/ligne-tache.ts`, `liste-taches.ts`, `detail-tache.ts`, `formulaire-tache.ts` | Modèle de vue | Créer | ECR-002, ECR-007, ECR-006 |
| 17 | `src/objectifs-taches/presentation/modeles-de-vue/detail-objectif.ts`, `confirmation.ts`, `messages-de-refus.ts`, `vues-exposees.ts` | Modèle de vue | Modifier | Tâches du détail, `CNF-SUPPR-TACHE`, `ERR-021` à `ERR-023`, `ERR-033`, `ERR-034` |
| 18 | `src/commun/presentation/format/duree.ts` | Modèle de vue | Créer | « 1 h 30 », « 30 min » (guide §8) |
| 19 | `src/objectifs-taches/presentation/ui/ecrans/liste-taches.tsx`, `detail-tache.tsx` ; `composants/ligne-tache.tsx`, `saisie-rapide.tsx`, `selecteur-duree.tsx`, `champ-detail.tsx`, `filtre-etat.tsx`, `puces-objectif.tsx` | UI | Créer | `TaskRow`, `QuickAdd`, `DurationStepper`, `FieldRow` / `LockedField` |
| 20 | `src/composition/web.ts`, `src/objectifs-taches/index.ts` | Composition | Modifier | Enregistrement |
| 21 | `tests/steps/objectifs-taches/taches.steps.ts`, `liste-taches.steps.ts`, `refus.steps.ts`, `historique.steps.ts` | Test | Créer / Modifier | Étapes du §12 |
| 22 | `tests/support/construction-taches.ts` | Test | Créer | Construction H-7 des tableaux de contexte (§12.1) |

## 4. Interfaces et signatures
### 4.1 Domaine
```ts
// saisie-tache.ts — RG-003, RG-028, RG-029 ; guide §6.6.8 (cumul, ordre intitulé, délai, estimation)
export type SaisieTache = { readonly intitule: string; readonly delai?: DateCalendaire; readonly estimationMinutes?: number };
export type SaisieTacheValide = { readonly intitule: Intitule; readonly delai: DateCalendaire; readonly estimation: Duree };
export const validerSaisieTache = (s: SaisieTache): Resultat<SaisieTacheValide, Extract<RefusMetier, { type: 'SaisieInvalide' }>> => …;

// estimation.ts — RG-023, RG-029
export type EstimationEnVigueur = { readonly duree: Duree; readonly calculee: boolean };
export const estimationEnVigueur = (vue: VueMetier, id: IdTache): EstimationEnVigueur => …;
// sous-tâches présentes (non supprimées) : Duree.calculee(somme des estimations des sous-tâches non abandonnées), calculee = true ;
// sinon : estimationInitiale, calculee = false

// alertes-delai.ts (ajout) — RG-024, RG-023
export type AlerteDelaiTache =
  | { readonly type: 'OBJECTIFS'; readonly objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string; readonly delai: DateCalendaire }> } // ALR-005
  | { readonly type: 'TACHE_PARENTE'; readonly tache: { readonly id: IdTache; readonly intitule: string; readonly delai: DateCalendaire } };                // ALR-006 (ST-US-024)
export const alertesDelaiTache = (vue: VueMetier, id: IdTache): ReadonlyArray<AlerteDelaiTache> => …;

// retard.ts (ajout) — RG-045
export const estTacheEnRetard = (t: Tache, jour: DateCalendaire): boolean => …; // A_FAIRE et delai < jour

// refus.ts (ajouts)
  | { readonly type: 'EstimationCalculee' }          // ERR-033
  | { readonly type: 'ObjectifsHerites' }            // ERR-034

// confirmation.ts (ajout)
  | { readonly type: 'SUPPRESSION_TACHE'; readonly tacheId: IdTache; readonly intitule: string; readonly sousTaches: number }

// actions.ts (ajout)
export type ActionTache = 'RENOMMER' | 'MODIFIER_DELAI' | 'MODIFIER_ESTIMATION' | 'RATTACHER' | 'DETACHER' | 'SUPPRIMER'
  | 'CREER_SOUS_TACHE' | 'TERMINER' | 'ROUVRIR' | 'ABANDONNER' | 'REPRENDRE';   // les cinq dernières : ST-US-024, 003, 025
export const actionsTache = (vue: VueMetier, id: IdTache): ReadonlyArray<ActionTache> => …; // §6.5

// decisions
export const deciderCreationTache = (c: { readonly id: IdTache; readonly saisie: SaisieTache; readonly objectifIds: ReadonlyArray<IdObjectif> }) => (vue, contexte) => Resultat<Decision<IdTache>, RefusMetier>;
export const deciderRenommageTache = (c: { readonly tacheId: IdTache; readonly intitule: string }) => …;
export const deciderModificationDelaiTache = (c: { readonly tacheId: IdTache; readonly delai: DateCalendaire }) => …;
export const deciderModificationEstimation = (c: { readonly tacheId: IdTache; readonly estimationMinutes: number }) => …;
export const deciderRattachement = (c: { readonly tacheId: IdTache; readonly objectifId: IdObjectif }) => …;
export const deciderDetachement = (c: { readonly tacheId: IdTache; readonly objectifId: IdObjectif }) => …;
export const evaluerSuppressionTache = (c: { readonly tacheId: IdTache }) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderSuppressionTache = (c: { readonly tacheId: IdTache }) => (vue, contexte) => Resultat<Decision<void>, RefusMetier>;
```

### 4.2 Application
| Cas d'usage | Entrée | Sortie | Erreurs | Effets |
|---|---|---|---|---|
| `CreerTache.executer` | `{ intitule: string; delai?: DateCalendaire; estimationMinutes?: number; objectifIds: ReadonlyArray<IdObjectif> }` | `IdTache` | `SaisieInvalide`, `ElementIntrouvable` | `CREER_TACHE` + `CREATION` |
| `RenommerTache.executer` | `{ tacheId; intitule }` | `void` | `SaisieInvalide`, `ElementIntrouvable` | `ECRIRE_TACHE intitule` |
| `ModifierDelaiTache.executer` | `{ tacheId; delai: DateCalendaire }` | `void` | `ElementIntrouvable` | `ECRIRE_TACHE delai` + `MODIFICATION_DELAI` |
| `ModifierEstimationTache.executer` | `{ tacheId; estimationMinutes: number }` | `void` | `ElementIntrouvable`, `EstimationCalculee`, `SaisieInvalide [ESTIMATION_INVALIDE]` | `ECRIRE_TACHE estimationInitiale` + `MODIFICATION_ESTIMATION` |
| `RattacherTache.executer` / `DetacherTache.executer` | `{ tacheId; objectifId }` | `void` | `ElementIntrouvable`, `ObjectifsHerites` | `ECRIRE_LIEN` + `RATTACHEMENT` / `DETACHEMENT` |
| `SupprimerTache.evaluer` / `executer` | `{ tacheId }` | `Evaluation` / `void` | `ElementIntrouvable` | `SUPPRIMER` + `SUPPRESSION` (+ ST-US-024) |

**Requêtes et résumés**
```ts
export type ResumeTache = {
  readonly id: IdTache; readonly intitule: string; readonly delai: DateCalendaire;
  readonly estimation: Duree; readonly estimationCalculee: boolean; readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie;
  readonly tacheParente?: { readonly id: IdTache; readonly intitule: string };
  readonly objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string }>;   // directs, ou ceux de la tâche parente ; ordre de rattachement
  readonly objectifsHerites: boolean;
  readonly enRetard: boolean; readonly alertes: ReadonlyArray<AlerteDelaiTache>;
  readonly sousTaches?: { readonly terminees: number; readonly nonAbandonnees: number };        // présent si la tâche a des sous-tâches
  readonly creeLe: Instant; readonly enAttente: boolean;
};
export class ConsulterTaches { constructor(service: ServiceEtatLocal, horloge: Horloge);
  executer(): Promise<Resultat<{ readonly taches: ReadonlyArray<ResumeTache>; readonly existeAuMoinsUnObjectif: boolean }, ErreurDepotLocal>> } // tâches sans tâche parente
export type DetailTache = { readonly tache: ResumeTache; readonly sousTaches: ReadonlyArray<ResumeTache>; readonly actions: ReadonlyArray<ActionTache> };
export class ConsulterDetailTache { constructor(service, horloge); executer(id: IdTache): Promise<Resultat<DetailTache, RefusMetier | ErreurDepotLocal>> }
// DetailObjectif (ajout) : readonly taches: ReadonlyArray<ResumeTache>   — tâches directes, tous états
```

### 4.3 Ports, 4.4 Adaptateurs
Sans objet.

### 4.5 Présentation
```ts
export type FiltreEtat = 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE';
export type FiltreObjectif = { readonly type: 'TOUS' } | { readonly type: 'OBJECTIF'; readonly id: IdObjectif } | { readonly type: 'SANS_OBJECTIF' };
export const FILTRE_ETAT_PAR_DEFAUT: FiltreEtat = 'A_FAIRE';   // à chaque ouverture, non mémorisé (guide §5.7)
export type LigneTache = {
  readonly id: IdTache; readonly intitule: string;
  readonly etat: { readonly code: 'ETA-TACHE-A-FAIRE' | 'ETA-TACHE-TERMINEE' | 'ETA-TACHE-ABANDONNEE' };
  readonly delai: { readonly date: DateCalendaire; readonly libelle: string };
  readonly estimation: { readonly minutes: number; readonly libelle: string; readonly calculee: boolean };
  readonly objectifs: ReadonlyArray<string>;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  readonly alertes: ReadonlyArray<{ readonly code: 'ALR-005'; readonly objectifs: ReadonlyArray<string>; readonly libelle: string }
                               | { readonly code: 'ALR-006'; readonly tache: string; readonly libelle: string }>;
  readonly compteurSousTaches?: { readonly terminees: number; readonly nonAbandonnees: number; readonly libelle: string }; // « 1/3 »
  readonly nomAccessible: string;
};
export type ModeleVueListeTaches = {
  readonly filtreEtat: FiltreEtat; readonly filtreObjectif: FiltreObjectif;
  readonly sousTitre: { readonly code: 'MEN-TRI-DELAI'; readonly libelle: string };   // « Triées par délai » ou « Plus récentes d'abord »
  readonly lignes: ReadonlyArray<LigneTache>;
  readonly etatVide?: { readonly code: 'EVD-BIENVENUE' | 'EVD-TACHES' | 'EVD-FILTRE-SANS-OBJECTIF' | 'EVD-FILTRE-A-FAIRE' | 'EVD-FILTRE-TERMINEES' | 'EVD-FILTRE-ABANDONNEES' };
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
};
export const construireListeTaches = (donnees: { readonly taches: ReadonlyArray<ResumeTache>; readonly existeAuMoinsUnObjectif: boolean },
  filtres: { readonly etat: FiltreEtat; readonly objectif: FiltreObjectif }, dependances: { readonly horloge: Horloge }) => ModeleVueListeTaches;
export type ModeleVueDetailTache = {
  readonly id: IdTache; readonly intitule: string; readonly etat: LigneTache['etat'];
  readonly delai: { readonly date: DateCalendaire; readonly libelle: string; readonly alertes: LigneTache['alertes'] }; // jamais de MEN-HEURE-PARIS sur un délai
  readonly estimation: { readonly minutes: number; readonly libelle: string; readonly verrou?: { readonly code: 'MEN-ESTIMATION-CALCULEE'; readonly libelle: string } };
  readonly estimationInitiale: { readonly minutes: number };
  readonly objectifs: { readonly intitules: ReadonlyArray<string>; readonly verrou?: { readonly code: 'MEN-OBJECTIFS-HERITES'; readonly libelle: string } };
  readonly tacheParente?: { readonly id: IdTache; readonly intitule: string };
  readonly enRetard?: LigneTache['enRetard'];
  readonly actions: ReadonlyArray<ActionTache>;
  // ST-US-024 : sousTaches, compteur, infoFinImpossible ; ST-US-003 / 025 : dateFin, dateAbandon et mention MEN-HEURE-PARIS
};
export const construireDetailTache = (donnees: DetailTache, dependances: { readonly horloge: Horloge }) => ModeleVueDetailTache;
export type ModeleVueFormulaireTache = {
  readonly delaiPreselectionne: undefined; readonly estimationPreselectionnee: undefined;  // CA-2, Q-ERG-03
  readonly objectifsPreRemplis: ReadonlyArray<IdObjectif>;                              // objectif du détail d'où l'on vient, sinon vide
  readonly mentionsObligatoire: ReadonlyArray<{ readonly champ: 'DELAI' | 'ESTIMATION'; readonly code: 'MEN-OBLIGATOIRE' }>;
};
export const construireFormulaireTache = (donnees: { readonly objectifPreRempli?: IdObjectif }) => ModeleVueFormulaireTache;
// ModeleVueDetailObjectif (ajouts) — guide v0.2.9 §5.8 d
export type LigneDetailObjectif = LigneTache & { readonly niveau: 'TACHE' | 'SOUS_TACHE' };   // SOUS_TACHE : suit immédiatement sa tâche parente
export type SectionTaches<C extends 'SEC-TACHES-A-FAIRE' | 'SEC-TACHES-TERMINEES' | 'SEC-TACHES-ABANDONNEES'> = {
  readonly code: C; readonly n: number;            // n = nombre de tâches directes de la section (sous-tâches non comptées)
  readonly libelle: string;                        // « Tâches à faire · {n} », « Terminées ({n}) », « Abandonnées ({n}) »
  readonly replieeParDefaut: boolean;              // faux pour « à faire », vrai pour les deux autres
  readonly lignes: ReadonlyArray<LigneDetailObjectif>;
};
// readonly taches: { readonly aFaire: SectionTaches<'SEC-TACHES-A-FAIRE'>; readonly terminees: SectionTaches<'SEC-TACHES-TERMINEES'>;
//                    readonly abandonnees: SectionTaches<'SEC-TACHES-ABANDONNEES'> };
// readonly etatVide?: { readonly code: 'EVD-OBJECTIF-SANS-TACHE' }   // aucune tâche directe
```

| Écran | Maquette | Codes | Actions → cas d'usage | États |
|---|---|---|---|---|
| Liste « Tâches » (accueil) | ECR-002 L1, L3, L4, L5 | `ETA-TACHE-*`, `MEN-EN-RETARD`, `ALR-005`, `ALR-006`, `MEN-TRI-DELAI`, `MEN-HEURE-PARIS`, `EVD-*` | case « Terminer » (rang 7) ; ligne → détail ; filtre d'état ; puces d'objectif ; « + » / `N` → saisie rapide | vide ; hors ligne ; `MEN-ATTENTE` (rang 3) |
| Saisie rapide | ECR-002 L2, ECR-006 | `MEN-OBLIGATOIRE`, `ERR-020` à `ERR-023` (cumulés, focus sur la première erreur, saisie conservée), `TST-AJOUTEE` | « Ajouter » → `CreerTache` ; la feuille reste ouverte | erreurs |
| Détail d'une tâche | ECR-007 B, C, E | `ALR-005`, `MEN-ESTIMATION-CALCULEE`, `MEN-OBJECTIFS-HERITES`, `ERR-033`, `ERR-034`, `CNF-SUPPR-TACHE` | `FieldRow` délai → `ModifierDelaiTache` ; estimation → `ModifierEstimationTache` ; objectifs → `RattacherTache` / `DetacherTache` ; menu : intitulé → `RenommerTache`, supprimer → `SupprimerTache.evaluer` puis `CNF-SUPPR-TACHE` puis `executer` | — |
| Détail d'un objectif (tâches) | ECR-003 D | idem lignes | « Ajouter une tâche » : saisie rapide avec l'objectif pré-rempli | `EVD-OBJECTIF-SANS-TACHE` |

## 5. Modèle de données et migrations
Registres de la tâche du socle (`creation`, `intitule`, `delai`, `estimationInitiale`, `cycleDeVie`, `suppression`) et `LIEN_TACHE_OBJECTIF.actif` (H-1). Aucune migration. Drive : schéma 1 logique (**sous réserve R1**).

## 6. Règles et algorithmes
### 6.1 Validation de la saisie (cumul, guide §6.6.8)
```text
validerSaisieTache(s):
  defauts ← []
  intitule ← construireIntitule(s.intitule) ; si échec : defauts += INTITULE_VIDE
  si s.delai absent : defauts += DELAI_ABSENT
  si s.estimationMinutes absent : defauts += ESTIMATION_ABSENTE
  sinon si Duree.saisie(s.estimationMinutes) échoue : defauts += ESTIMATION_INVALIDE
  si defauts non vide : Echec SaisieInvalide(defauts) sinon Succes
```
### 6.2 Décisions
| Décision | Contrôles, dans l'ordre | Modifications | Événement |
|---|---|---|---|
| Création | saisie (§6.1) ; chaque objectif actif (`ElementIntrouvable`) ; doublons d'objectifs retirés (premier rang conservé) | `CREER_TACHE { id, creeLe, valeurs }` | `CREATION apres { delai, estimation, objectifIds }` |
| Renommage | tâche active ; intitulé | `ECRIRE_TACHE intitule` ; aucune si identique | Aucun |
| Délai | tâche active | `ECRIRE_TACHE delai` ; aucune si identique | `MODIFICATION_DELAI` |
| Estimation | tâche active ; **sous-tâches présentes → `EstimationCalculee`** ; `Duree.saisie` → `SaisieInvalide [ESTIMATION_INVALIDE]` | `ECRIRE_TACHE estimationInitiale` ; aucune si égale à l'estimation en vigueur | `MODIFICATION_ESTIMATION avant { estimation en vigueur } apres { nouvelle }` |
| Rattachement | tâche active ; **sous-tâche → `ObjectifsHerites`** ; objectif actif | `ECRIRE_LIEN actif = true` ; aucune si déjà rattachée | `RATTACHEMENT apres { objectifId }` |
| Détachement | tâche active ; sous-tâche → `ObjectifsHerites` ; objectif actif | `ECRIRE_LIEN actif = false` ; aucune si non rattachée | `DETACHEMENT avant { objectifId }` |
| Évaluation de la suppression | tâche active | — | `CONFIRMATION_REQUISE SUPPRESSION_TACHE { sousTaches = |sousTachesDe| }` (toujours, CA-12) |
| Suppression | tâche active | `SUPPRIMER { TACHE, id }` ; aucune écriture sur les sous-tâches (dérivation) ; ST-US-024 ajoute la recopie de l'estimation | `SUPPRESSION` |

« Tâche active » : présente dans `vue.taches` (ni elle ni sa tâche parente supprimée), sinon `ElementIntrouvable`.

### 6.3 Alertes de délai (RG-024 ; RG-023 pour une sous-tâche)
```text
alertesDelaiTache(vue, t):
  objectifs ← t a une tâche parente p ? objectifsDirectsPar(p) : objectifsDirectsPar(t)     // objectifs hérités (US-024 CA-7)
  depasses ← [o ∈ objectifs | o.delai défini et t.delai > o.delai]                           // ordre de rattachement
  alertes ← depasses non vide ? [{ OBJECTIFS, depasses }] : []
  si t a une tâche parente p et t.delai > p.delai : alertes += { TACHE_PARENTE, p }            // ALR-006, ST-US-024
```
Une sous-tâche reçoit donc aussi l'alerte de ses objectifs hérités : application directe de RG-024 (« le délai d'une tâche … un de ses objectifs ») et de RG-023 (une sous-tâche est rattachée aux objectifs de sa tâche parente).

### 6.4 Liste « Tâches » (guide §5.7 ; Q-US-002-1)
```text
lignes ← taches (sans tâche parente)
  filtrées par état : A_FAIRE | TERMINEE | ABANDONNEE
  filtrées par objectif : TOUS ; OBJECTIF id (id ∈ objectifs) ; SANS_OBJECTIF (objectifs vide)
tri A_FAIRE : délai croissant ; puis creeLe croissant ; puis intitulé (Intl.Collator('fr', { sensitivity: 'base' })) ; puis id
tri TERMINEE : dateFin décroissante ; puis instantFin décroissant ; puis creeLe croissant ; puis intitulé ; puis id
tri ABANDONNEE : dateAbandon décroissante ; puis instantAbandon décroissant ; puis creeLe croissant ; puis intitulé ; puis id
etatVide (première condition vraie) :
  aucune tâche et aucun objectif → EVD-BIENVENUE
  aucune tâche (tous états) → EVD-TACHES
  filtre SANS_OBJECTIF et aucune ligne → EVD-FILTRE-SANS-OBJECTIF
  aucune ligne → EVD-FILTRE-A-FAIRE | EVD-FILTRE-TERMINEES | EVD-FILTRE-ABANDONNEES selon le filtre d'état
sousTitre : « Triées par délai » pour A_FAIRE, « Plus récentes d'abord » sinon (MEN-TRI-DELAI)
```
Exemple de contrôle (S20b) : Relire (t₀), Zoom, écrire, Appeler (t₀ + 5 min, même instant), Banque (délai antérieur) → Banque, Relire, Appeler, écrire, Zoom.

### 6.5 Actions d'une tâche (rang 5)
`RENOMMER`, `MODIFIER_DELAI`, `MODIFIER_ESTIMATION` (sauf si la tâche a des sous-tâches : champ verrouillé), `RATTACHER` et `DETACHER` (sauf pour une sous-tâche : objectifs verrouillés), `SUPPRIMER`. Les actions de cycle de vie et `CREER_SOUS_TACHE` sont ajoutées par ST-US-024, ST-US-003 et ST-US-025.

### 6.6 Tâches dans le détail d'un objectif (guide v0.2.9 §5.8 d, réponse à Q-US-001-6)
```text
tâches directes de l'objectif réparties par état :
  SEC-TACHES-A-FAIRE   (« Tâches à faire · {n} », dépliée)  : comparerOrdreReference (ST-US-001 §6.6 ; délai, création, intitulé)
  SEC-TACHES-TERMINEES (« Terminées ({n}) », repliée)       : dateFin décroissante, puis instantFin décroissant, puis creeLe, intitulé, id (§6.4)
  SEC-TACHES-ABANDONNEES (« Abandonnées ({n}) », repliée)   : dateAbandon décroissante, puis instantAbandon décroissant, puis creeLe, intitulé, id
  chaque section est présente même vide (n = 0) ; n ne compte que les tâches directes
sous-tâches (rang 6) : sous une tâche parente de la section « à faire », ses sous-tâches non supprimées suivent immédiatement
  la ligne de la tâche parente (niveau SOUS_TACHE), tous états, dans l'ordre de référence (§5.8 e) ;
  sous une tâche parente terminée ou abandonnée : aucune ligne de sous-tâche, seul le compteur « t/n » de la ligne
  (hypothèse retenue en attendant Q-US-002-4)
```

Temps et fuseaux : retard selon le jour de Paris (S16 : 2026-10-25 à 02:30 = première occurrence ; S17 : appareil en UTC ; S19 : New York).

## 7. Intégration Google
Sans objet.

## 8. Gestion des erreurs
| # | Situation | Erreur | Comportement | Message | Test |
|---|---|---|---|---|---|
| 1 | Intitulé, délai, estimation manquants ou invalides | `SaisieInvalide` (défauts cumulés) | Refus ; tous les défauts nommés en même temps | `ERR-020`, `ERR-021`, `ERR-022`, `ERR-023` (ordre intitulé, délai, estimation) | UT-US-002-01 à 03, 27 |
| 2 | Estimation d'une tâche parente | `EstimationCalculee` | Refus | `ERR-033` (`LockedField`) | UT-US-002-08 |
| 3 | Objectifs d'une sous-tâche | `ObjectifsHerites` | Refus | `ERR-034` | UT-US-002-10, 11 |
| 4 | Tâche ou objectif absent ou supprimé | `ElementIntrouvable` | Refus | Aucun | UT-US-002-05 |

## 9. Patterns imposés
Décisions pures ; commande avec confirmation (`SupprimerTache`) ; tri et filtres **dans le modèle de vue** (règle d'affichage du guide §5.7) ; aucune règle métier dans les composants.

## 10. Sécurité
Intitulés en texte ; aucune donnée métier journalisée.

## 11. Exigences non fonctionnelles
| ENF | Exigence | Vérification |
|---|---|---|
| Performance (US-002, impacts) | Liste de 5 000 tâches triée et filtrée en moins de 100 ms | Test indicatif (§14) ; liste virtualisée à l'écran |
| ENF-04 | Saisie hors ligne | Aucun port distant |

## 12. Step definitions Cucumber
> Fichiers : `taches.steps.ts` (sauf mention). Les phrases écrites ici avec `(s)` (pluriel variable) sont définies en **expression régulière** qui accepte le singulier, le pluriel et la forme littérale « (s) » (`conventions.md` §11.6) ; les autres, en expressions Cucumber. Le rang est celui de la livraison de la définition (`conventions.md` §11.13).

| # | Phrase Gherkin exacte | Mot-clé | Nouveau / réutilisé | Rang | Implémentation |
|---|---|---|---|---|---|
| 1 | `les tâches suivantes :` + tableau (intitulé, état, délai, estimation, objectifs, tâche parente ; facultatives : date de fin, date d'abandon) | Étant donné | Nouveau | 5, étendu aux rangs 6, 7, 8 | §12.1 |
| 2 | `l'objectif {string} a {int} tâche(s) à faire, {int} tâche(s) terminée(s) et {int} tâche(s) abandonnée(s)` | Étant donné | Nouveau | 5, étendu aux rangs 7, 8 | §12.1 |
| 3 | `l'utilisateur crée une tâche :` + tableau (intitulé, délai, estimation, objectifs) | Quand | Nouveau | 5 | `CreerTache` ; cellule vide → champ absent ; estimation : type `{duree}` appliqué à la cellule (minutes non validées) ; objectifs : intitulés séparés par « , » |
| 4 | `l'utilisateur crée une tâche de délai {date}, estimée à {duree}, dont l'intitulé est vide` ; `… est composé uniquement d'espaces` | Quand | Nouveau | 5 | `CreerTache` |
| 5 | `l'utilisateur commence la saisie d'une nouvelle tâche` | Quand | Nouveau | 5 | `construireFormulaireTache({})` mémorisé |
| 6 | `aucun délai n'est présélectionné` ; `aucune estimation n'est présélectionnée` | Alors | Nouveau | 5 | Champs `undefined` du dernier formulaire (tâche ou sous-tâche) |
| 7 | `la tâche {string} existe avec :` + tableau (état, délai, estimation, objectifs ; tâche parente : ST-US-024) | Alors | Nouveau | 5 | `construireDetailTache` ; colonnes présentes seulement |
| 8 | `la tâche {string} existe avec le délai {date}` ; `… existe avec l'estimation {duree}` ; `… existe sans objectif` | Alors | Nouveau | 5 | Détail de la tâche |
| 9 | `la tâche {string} est rattachée au seul objectif {string}` ; `… aux objectifs {intitules}` | Alors | Nouveau | 5 | `ResumeTache.objectifs` : égalité d'ensemble |
| 10 | `l'estimation de la tâche {string} est {duree}` ; `l'estimation initiale de la tâche {string} est {duree}` | Alors | Nouveau | 5 | `estimation.minutes` ; `estimationInitiale.minutes` |
| 11 | `la tâche {string} porte une alerte de délai qui nomme l'objectif {string}` ; `… qui nomme les objectifs {intitules}` ; `la tâche {string} ne porte aucune alerte de délai` | Alors | Nouveau | 5 | Alerte `ALR-005` : ensemble des objectifs **exactement** égal (Q-US-002-2) ; « aucune » : `alertes` vide |
| 12 | `la tâche {string} est en retard` ; `… n'est pas en retard` | Alors (aussi en précondition) | Nouveau | 5 | `ResumeTache.enRetard` |
| 13 | `la tâche {string} n'existe plus` ; `… n'existe pas` ; `les tâches {intitules} n'existent plus` ; `aucune tâche n'existe` | Alors | Nouveau | 5 | Absence dans `vue.taches` (référence mémorisée pour « n'existe plus » ; aucun élément de cet intitulé pour « n'existe pas ») |
| 14 | `l'utilisateur renomme la tâche {string} en {string}` | Quand | Nouveau | 5 | `RenommerTache` ; référence mise à jour |
| 15 | `l'utilisateur modifie le délai de la tâche {string} en {date}` ; `… l'estimation de la tâche {string} en {duree}` | Quand | Nouveau | 5 | `ModifierDelaiTache`, `ModifierEstimationTache` |
| 16 | `l'utilisateur rattache la tâche {string} à l'objectif {string}` ; `l'utilisateur détache la tâche {string} de l'objectif {string}` | Quand | Nouveau | 5 | `RattacherTache`, `DetacherTache` |
| 17 | `l'utilisateur supprime la tâche {string} et confirme` ; `… et renonce` ; `l'utilisateur demande la suppression de la tâche {string}` | Quand | Nouveau | 5 | `SupprimerTache` (`conventions.md` §8.6) |
| 18 | `une confirmation est demandée, qui annonce {int} sous-tâche(s) supprimée(s) avec la tâche` | Alors (`refus.steps.ts`) | Nouveau | 5 | `CNF-SUPPR-TACHE`, variable `n` |
| 19 | `la modification est refusée avec le motif {string}` | Alors (`refus.steps.ts`) | Nouveau | 5 | Comme ST-US-001 §12 n° 26 |
| 20 | `le détail de l'objectif {string} présente la tâche {string}` ; `le détail présente les tâches {intitules}` | Alors | Nouveau | 5 | Lignes de niveau `TACHE` des trois sections de `ModeleVueDetailObjectif.taches` (les lignes de sous-tâches sont ignorées) : appartenance ; égalité d'ensemble pour « les tâches » |
| 21 | `l'objectif {string} a toujours {int} tâche(s) rattachée(s)` | Alors | Nouveau | 5 | Nombre de tâches directes, tous états |
| 22 | `l'utilisateur consulte la liste des tâches` | Quand (`liste-taches.steps.ts`) | Nouveau | 5 | `construireListeTaches` avec `FILTRE_ETAT_PAR_DEFAUT`, filtre d'objectif `TOUS` |
| 23 | `l'utilisateur filtre les tâches sur l'état {string}` | Quand | Nouveau | 5 | « à faire » → `A_FAIRE`, « terminée » → `TERMINEE`, « abandonnée » → `ABANDONNEE` ; toute autre valeur fait échouer l'étape |
| 24 | `le filtre d'état de la liste des tâches est {string}` | Alors | Nouveau | 5 | `filtreEtat` du dernier modèle |
| 25 | `la liste des tâches présente, dans cet ordre :` + tableau | Alors | Nouveau | 5 | Ordre et colonnes présentes (intitulé, délai, estimation, état, objectifs, en retard) |
| 26 | `la liste des tâches contient exactement {intitules}` ; `la liste des tâches est vide` | Alors | Nouveau | 5 | Égalité d'ensemble des intitulés ; aucune ligne |
| 27 | `la tâche {string} figure parmi les tâches sans objectif` ; `… ne figure pas parmi …` | Alors | Nouveau | 5 | Union des lignes des trois filtres d'état avec le filtre d'objectif `SANS_OBJECTIF` |
| 28 | `dans la liste des tâches, la tâche {string} indique {int} sous-tâche(s) terminée(s) sur {int} sous-tâche(s) non abandonnée(s)` | Alors | Nouveau | 6 (ST-US-024) | `compteurSousTaches` |
| 29 | `l'historique contient, pour la tâche {string} :` ; `l'historique de la tâche {string} se termine par :` ; `l'historique ne contient aucune entrée {string} pour la tâche {string}` | Alors (`historique.steps.ts`) | Nouveau | 5 | Comme pour l'objectif (ST-US-001 §12 n° 27 à 29) |
| 30 | `le PC est réglé sur le fuseau {string}` | Étant donné | Réutilisé (socle) | 0 | — |
| 31 | `au même instant exact, l'utilisateur crée une tâche :` ; `{ecart} plus tard, l'utilisateur crée une tâche :` | Quand | Réutilisés (préfixes du socle) | 0 | — |
| 32 | `l'utilisateur termine la tâche …` ; `… abandonne … et confirme` ; `… reprend …` | Quand | Réutilisés (ST-US-003, ST-US-025) | 7, 8 | — |
| 33 | Étapes à deux appareils (S18, S23) et `la liste des modifications non retenues contient :` | — | Réutilisés (ST-US-017, **sous réserve R1**) | 3, 9 | — |

### 12.1 Construction des contextes (`tests/support/construction-taches.ts`, H-7, glossaire §1)
```text
lesTachesSuivantes(tableau):
  0. si une ligne « terminée » ou « abandonnée » est la tâche parente d'une ligne « à faire » : échec (incohérence, utiliser l'étape du §1 dédiée)
  1. pour chaque ligne, dans l'ordre :
       sans tâche parente : CreerTache { intitulé, délai, estimation, objectifs }
         estimation vide : 30 min si la ligne est la tâche parente d'une autre ligne ; sinon échec
       avec tâche parente : CreerSousTache (rang 6, ST-US-024)
  2. états : d'abord les lignes avec tâche parente, puis les autres, chacune dans l'ordre du tableau :
       terminée : TerminerTache.executer (rang 7) ; abandonnée : AbandonnerTache.executer (rang 8)
       date : colonne « date de fin » ou « date d'abandon » si présente, sinon la date courante du banc ;
              l'horloge simulée est placée sur cette date, à l'heure courante de Paris, le temps de l'action, puis rétablie
  3. tout refus d'un cas d'usage fait échouer l'étape ; chaque intitulé est mémorisé dans les références
lObjectifAUnNombreDeTaches(objectif, a, t, ab):
  crée a + t + ab tâches « <objectif> — tâche <n> » (n = 1, 2…), délai = jour courant + 7 jours, estimation 1 h, rattachées à l'objectif ;
  puis termine les t suivantes (rang 7) et abandonne les ab dernières (rang 8)
```
Avant le rang qui livre une capacité (7 : terminer ; 8 : abandonner ; 6 : sous-tâche), l'étape lève `ErreurProgrammation('capacité livrée au rang n')` ; la sélection des scénarios (§11.13) garantit qu'elle n'est pas appelée.

**Scénarios exécutables par rang** : rang 5 : S01, S02, S03, S04, S05a, S05b, S06 à S10, S12, S14, S16, S17, S18, S19, S20b, S22, S24 ; rang 6 : S13 ; rang 7 : S11, S20, S21 ; rang 8 : S15, S20c, S20d ; rang 9 : S23.

## 13. Tests unitaires fournis (E10)
| Id | Fichier | Élément | Cas testé | RG / CA | Échec |
|---|---|---|---|---|---|
| UT-US-002-01 | `tests/unitaires/objectifs-taches/domaine/saisie-tache.test.ts` | `validerSaisieTache` | délai absent → `[DELAI_ABSENT]` ; estimation absente → `[ESTIMATION_ABSENTE]` ; les deux → `[DELAI_ABSENT, ESTIMATION_ABSENTE]` | CA-3 | NI |
| UT-US-002-02 | idem | `validerSaisieTache` | intitulé « ␣␣ » avec délai et estimation → `[INTITULE_VIDE]` ; cumul intitulé et délai dans l'ordre | CA-3 | NI |
| UT-US-002-03 | idem | `validerSaisieTache` | 0, 45, 70 → `[ESTIMATION_INVALIDE]` ; 30, 60, 90 acceptés | CA-4, RG-028 | NI |
| UT-US-002-04 | `…/domaine/decisions/creer-tache.test.ts` | `deciderCreationTache` | `CREER_TACHE` ; événement `CREATION apres { delai, estimation, objectifIds dans l'ordre saisi }` | CA-1, CA-14 | NI |
| UT-US-002-05 | idem | `deciderCreationTache` | objectif supprimé → `ElementIntrouvable` ; doublon d'objectif retiré | RG-001 | NI |
| UT-US-002-06 | `…/domaine/decisions/modifier-tache.test.ts` | `deciderModificationDelaiTache` | événement ; même délai → aucune modification | CA-8, CA-14 | NI |
| UT-US-002-07 | idem | `deciderModificationEstimation` | `avant 2 h`, `apres 3 h` ; même valeur → aucune modification | CA-9, CA-14 | NI |
| UT-US-002-08 | idem | `deciderModificationEstimation` | tâche avec une sous-tâche, valeur 3 h → `EstimationCalculee` (avant tout contrôle de la valeur) | CA-9, RG-023 | NI |
| UT-US-002-09 | idem | `deciderModificationEstimation` | 0 h sur une tâche simple → `SaisieInvalide [ESTIMATION_INVALIDE]` | RG-028 | NI |
| UT-US-002-10 | `…/domaine/decisions/rattacher-tache.test.ts` | `deciderRattachement` | `ECRIRE_LIEN true` + `RATTACHEMENT` ; déjà rattachée → rien ; sous-tâche → `ObjectifsHerites` | RG-001, US-024 CA-7 | NI |
| UT-US-002-11 | idem | `deciderDetachement` | `ECRIRE_LIEN false` + `DETACHEMENT` ; non rattachée → rien ; sous-tâche → `ObjectifsHerites` | RG-001 | NI |
| UT-US-002-12 | `…/domaine/decisions/supprimer-tache.test.ts` | `evaluerSuppressionTache` | tâche à 2 sous-tâches → `SUPPRESSION_TACHE (2)` ; sans sous-tâche → `(0)` | CA-12 | NI |
| UT-US-002-13 | idem | `deciderSuppressionTache` | une `SUPPRIMER` et un événement `SUPPRESSION` ; aucune écriture sur les sous-tâches | RG-046 | NI |
| UT-US-002-14 | `…/domaine/alertes-delai.test.ts` | `alertesDelaiTache` | les cinq exemples de S08 | CA-7 | NI |
| UT-US-002-15 | idem | `alertesDelaiTache` | objectif sans délai ignoré ; objectif supprimé ignoré ; délai égal → aucune alerte | RG-024 | NI |
| UT-US-002-16 | idem | `alertesDelaiTache` | sous-tâche : alerte `OBJECTIFS` sur les objectifs hérités de la tâche parente | RG-024, RG-023 | NI |
| UT-US-002-17 | `…/domaine/retard.test.ts` | `estTacheEnRetard` | à faire, délai < jour → vrai ; délai = jour → faux ; terminée, abandonnée → faux | CA-10 | NI |
| UT-US-002-18 | `…/domaine/estimation.test.ts` | `estimationEnVigueur` | tâche simple → estimation initiale, `calculee` faux | CA-9 | NI |
| UT-US-002-19 | `…/presentation/liste-taches.test.ts` | `construireListeTaches` | filtre `A_FAIRE` ; ordre de S20b | CA-11 | NI |
| UT-US-002-20 | idem | `construireListeTaches` | filtre `TERMINEE` : ordre de S20c (Sommaire, Préface, Plan) ; départage par `instantFin` | CA-11 | NI |
| UT-US-002-21 | idem | `construireListeTaches` | filtre `ABANDONNEE` : Affiche, Logo | CA-11 | NI |
| UT-US-002-22 | idem | `construireListeTaches` | sous-tâches jamais en ligne ; compteur « 1/2 » sur la tâche parente | CA-11 | NI |
| UT-US-002-23 | idem | `construireListeTaches` | filtres d'objectif `SANS_OBJECTIF` et `OBJECTIF` | CA-5 | NI |
| UT-US-002-24 | idem | `construireListeTaches` | `EVD-BIENVENUE`, `EVD-TACHES`, `EVD-FILTRE-SANS-OBJECTIF`, `EVD-FILTRE-A-FAIRE`, `-TERMINEES`, `-ABANDONNEES` | Guide §6.6.5 | NI |
| UT-US-002-25 | idem | `construireLigneTache` | `ETA-TACHE-*`, `MEN-EN-RETARD`, `ALR-005` avec intitulés, `MEN-TRI-DELAI` | CA-7, CA-10 | NI |
| UT-US-002-26 | `…/presentation/formulaire-tache.test.ts` | `construireFormulaireTache` | aucun délai ni estimation présélectionnés ; mentions `MEN-OBLIGATOIRE` | CA-2 | NI |
| UT-US-002-27 | `…/presentation/messages-de-refus.test.ts` | `messagesDeRefus` | `[DELAI_ABSENT, ESTIMATION_ABSENTE]` → `ERR-021`, `ERR-022` dans cet ordre ; `ERR-023`, `ERR-033`, `ERR-034` | CA-3, CA-9 | NI |
| UT-US-002-28 | `…/presentation/confirmation.test.ts` | `construireConfirmation` | `SUPPRESSION_TACHE (3)` → `CNF-SUPPR-TACHE`, `n = 3` | CA-12 | NI |
| UT-US-002-29 | `tests/unitaires/objectifs-taches/application/creer-tache.test.ts` | `CreerTache` | tâche lue par `ConsulterTaches` ; journal `CREATION` | CA-1 | NI |
| UT-US-002-30 | `…/application/consulter-taches.test.ts` | `ConsulterTaches` | appareil en UTC, 2026-10-25 22:30 → pas en retard ; 23:30 → en retard (délai 2026-10-25) | RG-045, RG-053 | NI |
| UT-US-002-31 | `…/application/supprimer-tache.test.ts` | `SupprimerTache.executer` | tâche et sous-tâches absentes à la lecture ; état de l'objectif recalculé | CA-12 | NI |
| UT-US-002-32 | `…/presentation/detail-objectif.test.ts` | `construireDetailObjectif` | tâche rattachée à deux objectifs présente dans chaque détail ; `EVD-OBJECTIF-SANS-TACHE` | CA-6 | NI |
| UT-US-002-33 | idem | `construireDetailObjectif` | sections `SEC-TACHES-A-FAIRE` (dépliée), `SEC-TACHES-TERMINEES` et `SEC-TACHES-ABANDONNEES` (repliées) avec n ; tris de chaque section ; sous-tâches d'une tâche parente à faire juste après elle, dans l'ordre de référence ; n ne compte pas les sous-tâches | Guide v0.2.9 §5.8 d (Q-US-001-6) | NI |
| UT-US-002-35 | idem | `construireDetailObjectif` | sous-tâches d'une tâche parente terminée ou abandonnée | Q-US-002-4 | **Écrit après la réponse à Q-US-002-4** |
| UT-US-002-34 | `…/application/consulter-detail-tache.test.ts` | `ConsulterDetailTache` | objectifs, alertes, `estimationCalculee` faux, actions d'édition | CA-8, CA-9 | NI |

Cas temporels : PT-16 (S16), UTC (S17), New York (S19). Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-002`.

## 14. Tests attendus de Benjamin
Composants `TaskRow`, `QuickAdd` (erreurs cumulées, focus, saisie conservée), `DurationStepper` (`spinbutton`, pas de 30 min), `FieldRow` / `LockedField` ; test de performance indicatif de `construireListeTaches` (5 000 tâches, < 100 ms) ; tests de `tests/support/construction-taches.ts` (cas (a), (b), (c) de H-7).

## 15. Plan de réalisation
1. Domaine : saisie, estimation, alertes, retard, refus, actions (UT 01 à 03, 14 à 18).
2. Décisions et cas d'usage (UT 04 à 13, 29, 31).
3. Requêtes et modèles de vue (UT 19 à 28, 30, 32, 34).
4. Construction des contextes et étapes ; scénarios du rang 5 et du rang 4 différé (US-023 S07), et d'US-001 (S07, S10, S16, S18, S22).
5. Écrans ; DoD.

## 16. Dette, hypothèses et points ouverts
- **Concernée par Q-US-001-6 (d)** (ST-US-001 §16).
  - **Réponse de Steeve (E9, 2026-10-22, guide v0.2.9 §5.8) : (d) Oui** ; la proposition du §6.6 est retenue (sections « Tâches à faire · n », « Terminées (n) », « Abandonnées (n) », les deux dernières repliées ; tris du guide §5.7). Codes `SEC-TACHES-A-FAIRE`, `SEC-TACHES-TERMINEES`, `SEC-TACHES-ABANDONNEES` créés. Une sous-tâche affichée suit sa tâche parente. UT-US-002-33 peut être écrit en E10.
  - **Réponse de Steeve à Q-US-002-4 (E9, 2026-10-22, guide v0.2.10 §5.8 (d)) : option a)** : sous une tâche terminée ou abandonnée (sections repliées), aucune ligne de sous-tâche, seulement le compteur « t / n » sur la ligne de la tâche parente ; les sous-tâches ne sont listées que sous les tâches à faire. Aucune règle de gestion ni périmètre touché.
- **Question posée — Q-US-002-4** (Steeve ; **non bloquante pour E10**, à lever avant E11) : le guide v0.2.9 §5.8 d dit qu'« une sous-tâche affichée suit immédiatement sa tâche parente », et ECR-003 D ne montre des sous-tâches que sous des tâches **à faire**. Rien ne dit ce qu'on voit sous une tâche parente **terminée** ou **abandonnée**, dans les sections repliées « Terminées » et « Abandonnées ». Proposition :
  - a) ★ aucune ligne de sous-tâche sous une tâche parente terminée ou abandonnée, seulement le compteur « t/n » de sa ligne ; le détail de la tâche (ECR-007 F) montre ses sous-tâches et leurs étiquettes ;
  - b) les sous-tâches sont listées sous la tâche parente dans toutes les sections, tous états, dans l'ordre de référence.
  La conception applique a) en attendant (§6.6). Seul UT-US-002-35 en dépend ; aucun scénario n'est concerné (les étapes du détail ignorent les lignes de sous-tâches).
- **Hypothèses** : H-1 (rattachement = `LienTacheObjectif.actif`), H-7 (construction des tableaux), appliquées.
- **Dette** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] CA, RG, fichiers, signatures, erreurs, patterns, étapes, construction des contextes.
- [ ] Tests du §13 en phase rouge (E10).
- [x] Q-US-001-6 (d) répondue (Steeve, guide v0.2.9 §5.8).
- [ ] Q-US-002-4 répondue (avant E11).
