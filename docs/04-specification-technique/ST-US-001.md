# ST-US-001 — Créer et gérer un objectif

## Sommaire

- [0. En-tête](#0-en-tête) (l. 41)
  - [Historique](#historique) (l. 59)
- [1. Résumé technique](#1-résumé-technique) (l. 65)
- [2. Traçabilité](#2-traçabilité) (l. 71)
  - [2.1 Critères d'acceptation → scénarios → tests](#21-critères-dacceptation--scénarios--tests) (l. 73)
  - [2.2 Règles de gestion → implémentation](#22-règles-de-gestion--implémentation) (l. 88)
- [3. Composants et fichiers](#3-composants-et-fichiers) (l. 99)
- [4. Interfaces et signatures](#4-interfaces-et-signatures) (l. 145)
  - [4.1 Domaine](#41-domaine) (l. 147)
  - [4.2 Application — cas d'usage](#42-application--cas-dusage) (l. 223)
  - [4.3 Ports](#43-ports) (l. 256)
  - [4.4 Adaptateurs](#44-adaptateurs) (l. 259)
  - [4.5 Présentation](#45-présentation) (l. 262)
- [5. Modèle de données et migrations](#5-modèle-de-données-et-migrations) (l. 312)
  - [5.1 Modèle](#51-modèle) (l. 313)
  - [5.2 Migrations](#52-migrations) (l. 324)
- [6. Règles et algorithmes](#6-règles-et-algorithmes) (l. 327)
  - [6.1 Vue métier (RG-046, RG-047 : dérivations de lecture)](#61-vue-métier-rg-046-rg-047--dérivations-de-lecture) (l. 329)
  - [6.2 État d'un objectif (RG-025 ; US-001 CA-8, US-003 CA-4 à CA-7, US-023 CA-7)](#62-état-dun-objectif-rg-025--us-001-ca-8-us-003-ca-4-à-ca-7-us-023-ca-7) (l. 340)
  - [6.3 Retard (RG-045, RG-053)](#63-retard-rg-045-rg-053) (l. 352)
  - [6.4 Décisions](#64-décisions) (l. 355)
  - [6.5 Modèles de vue](#65-modèles-de-vue) (l. 368)
  - [6.6 Ordre et sections de la liste des objectifs (guide v0.2.9 §5.8, réponse à Q-US-001-6)](#66-ordre-et-sections-de-la-liste-des-objectifs-guide-v029-58-réponse-à-q-us-001-6) (l. 376)
  - [6.7 Rendu de l'historique dans les tests (tests/support/rendu-historique.ts, glossaire v1.4 §11)](#67-rendu-de-lhistorique-dans-les-tests-testssupportrendu-historiquets-glossaire-v14-11) (l. 394)
- [7. Intégration Google](#7-intégration-google) (l. 406)
- [8. Gestion des erreurs](#8-gestion-des-erreurs) (l. 409)
- [9. Patterns imposés](#9-patterns-imposés) (l. 416)
- [10. Sécurité et données personnelles](#10-sécurité-et-données-personnelles) (l. 425)
- [11. Exigences non fonctionnelles](#11-exigences-non-fonctionnelles) (l. 428)
- [12. Step definitions Cucumber](#12-step-definitions-cucumber) (l. 434)
- [13. Tests unitaires fournis (E10)](#13-tests-unitaires-fournis-e10) (l. 481)
- [14. Tests attendus de Benjamin](#14-tests-attendus-de-benjamin) (l. 533)
- [15. Plan de réalisation](#15-plan-de-réalisation) (l. 541)
- [16. Dette, hypothèses et points ouverts](#16-dette-hypothèses-et-points-ouverts) (l. 549)
- [17. Checklist de complétude (avant E11)](#17-checklist-de-complétude-avant-e11) (l. 561)

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-001](../01-specification-fonctionnelle/user-stories/US-001-creer-et-gerer-un-objectif.md), état du 2026-10-21 (validée, DEC-018 ; complément DEC-030) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **2** / 13 |
| Fichier `.feature` | [`tests/features/US-001-creer-et-gerer-un-objectif.feature`](../../tests/features/US-001-creer-et-gerer-un-objectif.feature), 23 scénarios (CdC v0.11) |
| RG couvertes | RG-001, RG-002, RG-004, RG-024 (via ST-US-002), RG-025, RG-045, RG-046, RG-047 (via ST-US-017 incrément 2), RG-050, RG-053, RG-054 |
| ENF concernées | ENF-04, ENF-06, ENF-T-02 |
| DAT / ADR de référence | DAT v0.10.1 (§2.4, §4.2, §6.1, §6.2) ; ADR-003, ADR-010, ADR-011 |
| Maquettes | ECR-008 (A, B, E, F), ECR-003 (C, D) ; guide d'ergonomie v0.2.8 |
| Q-US traitées | Q-US-001-1 (DEC-030), Q-US-001-2, Q-US-001-3, Q-US-001-4, Q-US-001-5 (E8, 2026-10-21) ; Q-US-001-6 (réponse de Steeve, guide v0.2.9 §5.8, 2026-10-22) |
| Prérequis | `ST-socle-ecriture.md` (rang 0) ; ST-US-022 (rang 1 : étape de connexion) |
| Version de la ST | 0.1 |
| Statut | **Prête pour E10** (Q-US-001-6 répondue, guide v0.2.9 §5.8) |
| Auteur | Anthony |
| Branche Git | `us/US-001-objectifs` créée depuis `lot/LOT-001-socle-objectifs-taches` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-22 | Anthony | Réponse de Steeve à Q-US-001-6 (guide v0.2.9 §5.8) : ordre de référence, section « Atteints » (`SEC-OBJ-ATTEINTS`), section `SEC-SOUS-OBJECTIFS` ; §4.5, §6.6, §12, UT-US-001-35 ; statut levé |

## 1. Résumé technique

- **Ce que l'US change.** Création du contexte `objectifs-taches` : objet-valeur `Intitule`, vue métier (`VueMetier`) dérivée de l'`EtatMetier` du socle, état calculé d'un objectif (RG-025, complet, sous-objectifs et sous-tâches compris), retard (RG-045), décisions pures de création, de modification et de suppression d'un objectif, cas d'usage qui les exécutent par `ServiceEtatLocal`, journal RG-050 (`CREATION`, `MODIFICATION_DELAI`, `SUPPRESSION`), requêtes et modèles de vue de la liste (ECR-008) et du détail (ECR-003) des objectifs, catalogue des messages.
- **Hors périmètre** : sous-objectifs, placement, alerte de délai d'un sous-objectif (ST-US-023) ; tâches et leur présence dans le détail (ST-US-002) ; synchronisation, `MEN-ATTENTE`, modifications non retenues (ST-US-017) ; importance (US-030).
- **Prérequis** : socle d'écriture (rang 0) ; connexion (rang 1).

## 2. Traçabilité

### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests unitaires | Composants | Rang d'exécution |
|---|---|---|---|---|---|
| CA-1 création | S01, S02, S04, S04b | RG-002 | UT-US-001-01, 02, 03, 14, 15, 16, 24 | `CreerObjectif`, `deciderCreationObjectif` | 2 |
| CA-2 sans délai | S03 | RG-002 | UT-US-001-16, 28 | `construireListeObjectifs` | 2 |
| CA-3 liste | S06 | RG-025, RG-045 | UT-US-001-12, 28, 35 | `ConsulterObjectifs`, `construireListeObjectifs` | 8 |
| CA-4 détail | S07 | RG-001, RG-022 | UT-US-001-31 | `ConsulterDetailObjectif`, `construireDetailObjectif` | 5 |
| CA-5 modification | S08, S09 | RG-004 | UT-US-001-17 à 20 | `RenommerObjectif`, `ModifierDescriptionObjectif`, `ModifierDelaiObjectif`, `RetirerDelaiObjectif` | 2 |
| CA-6 alertes recalculées | S10 | RG-024 | ST-US-002 (UT-US-002-14 à 16) | `alertesDelaiTache` | 5 |
| CA-7 retard | S11, S12, S13, S14 | RG-045, RG-053 | UT-US-001-13, 26 | `estObjectifEnRetard` | 2 (S12 : 7) |
| CA-8 état calculé | S15 | RG-025 | UT-US-001-05 à 11, 31 | `etatObjectif` | 8 |
| CA-9 suppression | S16, S17, S18 | RG-046 | UT-US-001-04, 21, 22, 25, 32 | `SupprimerObjectif` | 5 (S17 : 7) |
| CA-10 suppression concurrente | S19, S20 | RG-047 | ST-US-017 incrément 2 | Passe de réparation, `contexteDePierreTombale` | 9 |
| CA-11 historique | S21, S22 | RG-050 | UT-US-001-14, 19, 20, 22, 27, 34 | Décisions, `ConsulterHistorique` | 2 (S22 : 5) |

### 2.2 Règles de gestion → implémentation
| RG | Énoncé résumé | Élément de domaine | Tests |
|---|---|---|---|
| RG-002 | Délai facultatif, date sans heure ; délai dépassé accepté | `deciderCreationObjectif`, `DateCalendaire` | UT-US-001-14, 16 |
| RG-004 | Modification à tout moment | Décisions de `decisions/modifier-objectif.ts` | UT-US-001-17 à 20 |
| RG-025 | État calculé | `etat-objectif.ts` : `etatObjectif`, `compteurObjectif` | UT-US-001-05 à 12 |
| RG-045, RG-053 | En retard selon la journée de Paris | `retard.ts` : `estObjectifEnRetard` | UT-US-001-13, 26 |
| RG-046 | Suppression définitive, conséquences dérivées | `decisions/supprimer-objectif.ts` ; `vue-metier.ts` (parent effectif, liens ignorés) | UT-US-001-04, 21, 22 |
| RG-050 | Historique | Événements des décisions | UT-US-001-14, 19, 20, 22, 27 |
| RG-054 | Mention « heure de Paris » | `construireListeObjectifs`, `construireDetailObjectif` | UT-US-001-29 |

## 3. Composants et fichiers

| # | Fichier | Couche | Action | Responsabilité | Dépend de |
|---|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/intitule.ts` | Domaine | Créer | `Intitule`, `construireIntitule` (Q-US-001-3) | socle |
| 2 | `src/objectifs-taches/domaine/description.ts` | Domaine | Créer | `normaliserDescription` | — |
| 3 | `src/objectifs-taches/domaine/refus.ts` | Domaine | Créer | `RefusMetier`, `DefautSaisie` (complété par les rangs suivants) | — |
| 4 | `src/objectifs-taches/domaine/actions.ts` | Domaine | Créer | `ActionObjectif`, `ACTIONS_OBJECTIF` (complété par ST-US-023) ; `ActionTache` (ST-US-024, ST-US-003, ST-US-025) | — |
| 5 | `src/objectifs-taches/domaine/confirmation.ts` | Domaine | Créer | `ConfirmationRequise`, `Evaluation` (complétés par les rangs suivants) | — |
| 6 | `src/objectifs-taches/domaine/vue-metier.ts` | Domaine | Créer | `VueMetier`, `construireVueMetier`, fonctions d'accès (§4.1) | `synchronisation` (index) |
| 7 | `src/objectifs-taches/domaine/etat-objectif.ts` | Domaine | Créer | `EtatObjectif`, `etatObjectif`, `compteurObjectif` (RG-025) | 6 |
| 8 | `src/objectifs-taches/domaine/retard.ts` | Domaine | Créer | `estObjectifEnRetard` (RG-045) ; `estTacheEnRetard` ajouté par ST-US-002 | 6, 7 |
| 9 | `src/objectifs-taches/domaine/decisions/creer-objectif.ts` | Domaine | Créer | `deciderCreationObjectif` (le paramètre parent est utilisé par ST-US-023) | 1, 2, 3, 6 |
| 10 | `src/objectifs-taches/domaine/decisions/modifier-objectif.ts` | Domaine | Créer | `deciderRenommageObjectif`, `deciderModificationDescription`, `deciderModificationDelaiObjectif`, `deciderRetraitDelaiObjectif` | 1, 2, 3, 6 |
| 11 | `src/objectifs-taches/domaine/decisions/supprimer-objectif.ts` | Domaine | Créer | `evaluerSuppressionObjectif`, `deciderSuppressionObjectif` | 3, 5, 6 |
| 12 | `src/objectifs-taches/application/cas-usage/creer-objectif.ts` | Application | Créer | Cas d'usage `CreerObjectif` | 9, `ServiceEtatLocal`, `GenerateurIdentifiants` |
| 13 | `src/objectifs-taches/application/cas-usage/modifier-objectif.ts` | Application | Créer | `RenommerObjectif`, `ModifierDescriptionObjectif`, `ModifierDelaiObjectif`, `RetirerDelaiObjectif` | 10 |
| 14 | `src/objectifs-taches/application/cas-usage/supprimer-objectif.ts` | Application | Créer | `SupprimerObjectif` (`evaluer`, `executer`) | 11 |
| 15 | `src/objectifs-taches/application/requetes/lecture-courante.ts` | Application | Créer | `lireVueCourante(service, horloge)` : `{ vue: VueMetier, jour }` | 6 |
| 16 | `src/objectifs-taches/application/requetes/resumes.ts` | Application | Créer | Types `ResumeObjectif` (complété par ST-US-023) et fonction `resumerObjectif` | 7, 8 |
| 17 | `src/objectifs-taches/application/requetes/consulter-objectifs.ts` | Application | Créer | Requête `ConsulterObjectifs` | 15, 16 |
| 18 | `src/objectifs-taches/application/requetes/consulter-detail-objectif.ts` | Application | Créer | Requête `ConsulterDetailObjectif` (complétée par ST-US-023 et ST-US-002) | 15, 16 |
| 19 | `src/objectifs-taches/application/requetes/consulter-historique.ts` | Application | Créer | Requête `ConsulterHistorique` (non exposée à l'interface au lot 1) | `ServiceEtatLocal` |
| 20 | `src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif.ts` | Modèle de vue | Créer | `construireLigneObjectif` (partagée par la liste et le détail) | 16, catalogue |
| 20b | `src/objectifs-taches/presentation/modeles-de-vue/ordre-reference.ts` | Modèle de vue | Créer | `comparerOrdreReference` (guide v0.2.9 §5.8), partagé avec ST-US-023, ST-US-002 et ST-US-024 | — |
| 21 | `src/objectifs-taches/presentation/modeles-de-vue/liste-objectifs.ts` | Modèle de vue | Créer | `construireListeObjectifs` (ECR-008) | 20 |
| 22 | `src/objectifs-taches/presentation/modeles-de-vue/detail-objectif.ts` | Modèle de vue | Créer | `construireDetailObjectif` (ECR-003) | 20 |
| 23 | `src/objectifs-taches/presentation/modeles-de-vue/confirmation.ts` | Modèle de vue | Créer | `construireConfirmation` (`CNF-…` ; complété par les rangs suivants) | 5, catalogue |
| 24 | `src/objectifs-taches/presentation/modeles-de-vue/messages-de-refus.ts` | Modèle de vue | Créer | `messagesDeRefus` (`conventions.md` §8.5 ; complété par les rangs suivants) | 3 |
| 25 | `src/objectifs-taches/presentation/modeles-de-vue/vues-exposees.ts` | Modèle de vue | Créer | `VUES_EXPOSEES` (liste fermée des vues offertes à l'interface) | — |
| 26 | `src/commun/presentation/messages/catalogue.fr.ts`, `libelle.ts`, `codes.ts` | Modèle de vue | Créer | Catalogue **complet** du guide v0.2.9 §6.6 (codes `SEC-` compris) (tous les codes, `conventions.md` §8.5) ; `libelle(code, variables)` | — |
| 27 | `src/commun/presentation/format/date.ts` | Modèle de vue | Créer | `formaterDate(d, aujourdhui)` : « 19 oct. », année si différente (guide §6.6.1) | date-fns (`fr`) |
| 28 | `src/objectifs-taches/presentation/ui/ecrans/liste-objectifs.tsx` | UI | Créer | Écran ECR-008 (cadres A, E) | 21 |
| 29 | `src/objectifs-taches/presentation/ui/ecrans/detail-objectif.tsx` | UI | Créer | Écran ECR-003 (cadres C, D) | 22 |
| 30 | `src/objectifs-taches/presentation/ui/composants/ligne-objectif.tsx`, `progression-objectif.tsx`, `feuille-objectif.tsx`, `menu-objectif.tsx` | UI | Créer | `ObjectiveRow`, `GoalProgress`, feuille de création (ECR-008 B), menu « … » (ECR-003 C) | 20 à 22 |
| 31 | `src/commun/presentation/ui/boite-confirmation.tsx`, `mention-heure-paris.tsx`, `etat-vide.tsx` | UI | Créer | `ConfirmDialog`, `ParisTimeNote`, `EmptyState` | 23, 26 |
| 32 | `src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches.ts` | UI | Créer | Magasin Zustand : modèles de vue courants, rafraîchis sur `DepotLocal.observer` | 21, 22 |
| 33 | `src/objectifs-taches/index.ts` | Interface publique | Créer | Exporte les cas d'usage, requêtes, modèles de vue et types publics | — |
| 34 | `src/composition/web.ts` | Composition | Modifier | Instancie les cas d'usage et requêtes du contexte | 12 à 19 |
| 35 | `tests/support/fabriques/etat-metier.ts` | Test | Créer | Fabrique d'`EtatMetier` pour les tests du domaine (`etatMetier().avecObjectif(…).avecTache(…)`) | socle |
| 36 | `tests/support/rendu-historique.ts` | Test | Créer | Rendu des entrées du journal selon le glossaire v1.4 §11 (§6.7) | socle |
| 37 | `tests/steps/objectifs-taches/objectifs.steps.ts`, `refus.steps.ts`, `historique.steps.ts` | Test | Créer | Étapes du §12 | 12 à 25 |
| 38 | `tests/support/types-parametres.ts` | Test | Modifier | Ajout du type `{intitules}` (§12) | — |

**Fichiers qui ne doivent pas être modifiés** : ceux du contexte `synchronisation` (sauf demande d'Anthony).

## 4. Interfaces et signatures

### 4.1 Domaine
```ts
// intitule.ts — Q-US-001-3
export type Intitule = Marque<string, 'Intitule'>;
export const construireIntitule = (brut: string): Resultat<Intitule, { readonly type: 'IntituleVide' }> => …;
// retire les espaces de début et de fin (String.prototype.trim) ; vide après retrait → IntituleVide ; aucune longueur maximale

// description.ts
export const normaliserDescription = (brute: string | undefined): string | undefined => …;
// undefined ou vide après retrait des espaces de début et de fin → undefined ; sinon la chaîne sans ces espaces

// refus.ts — union complétée aux rangs suivants (ST-US-023, 002, 024, 003, 025)
export type DefautSaisie = 'INTITULE_VIDE' | 'DELAI_ABSENT' | 'ESTIMATION_ABSENTE' | 'ESTIMATION_INVALIDE';
export type RefusMetier =
  | { readonly type: 'SaisieInvalide'; readonly defauts: ReadonlyArray<DefautSaisie> }   // ordre : INTITULE_VIDE, DELAI_ABSENT, ESTIMATION_ABSENTE ou ESTIMATION_INVALIDE
  | { readonly type: 'ElementIntrouvable'; readonly element: RefElementMetier }          // absent ou supprimé (y compris par dérivation)
  | { readonly type: 'ActionNonDisponible'; readonly action: ActionObjectif | ActionTache };

// actions.ts
export type ActionObjectif = 'RENOMMER' | 'MODIFIER_DESCRIPTION' | 'MODIFIER_DELAI' | 'RETIRER_DELAI' | 'SUPPRIMER'
  | 'PLACER' | 'CREER_SOUS_OBJECTIF';                       // les deux dernières : ST-US-023 (rang 4)
export const ACTIONS_OBJECTIF: ReadonlyArray<ActionObjectif>; // aucune action ne modifie l'état (CA-8)

// confirmation.ts — union complétée aux rangs suivants
export type ConfirmationRequise =
  | { readonly type: 'SUPPRESSION_OBJECTIF'; readonly objectifId: IdObjectif; readonly intitule: string;
      readonly tachesDetachees: number; readonly sousObjectifsPromus: number };
export type Evaluation = { readonly type: 'SANS_CONFIRMATION' } | { readonly type: 'CONFIRMATION_REQUISE'; readonly confirmation: ConfirmationRequise };

// vue-metier.ts — dérivations de lecture RG-046 et RG-047 (DAT §4.2)
export type Objectif = {
  readonly id: IdObjectif; readonly intitule: string; readonly description?: string; readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif;   // parent EFFECTIF : absent si l'objectif enregistré comme parent est supprimé
  readonly creeLe: Instant; readonly enAttente: boolean;
};
export type Tache = {
  readonly id: IdTache; readonly intitule: string; readonly delai: DateCalendaire; readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie; readonly tacheParenteId?: IdTache; readonly creeLe: Instant; readonly enAttente: boolean;
};
export type VueMetier = {
  readonly objectifs: ReadonlyMap<IdObjectif, Objectif>;                  // non supprimés
  readonly taches: ReadonlyMap<IdTache, Tache>;                           // non supprimées, ni elles ni leur tâche parente
  readonly sousObjectifsPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdObjectif>>;  // par parent effectif
  readonly sousTachesPar: ReadonlyMap<IdTache, ReadonlyArray<IdTache>>;
  readonly tachesDirectesPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdTache>>;    // tâches non sous-tâches, lien actif, objectif non supprimé
  readonly objectifsDirectsPar: ReadonlyMap<IdTache, ReadonlyArray<IdObjectif>>;  // ordre de rattachement ; objectifs supprimés exclus
  readonly intitulesConnus: ReadonlyMap<string, string>;                  // id → intitulé, éléments supprimés compris (rendu de l'historique)
};
export const construireVueMetier = (etat: EtatMetier): VueMetier => …;
export const objectifActif = (vue: VueMetier, id: IdObjectif): Resultat<Objectif, RefusMetier> => …;  // ElementIntrouvable sinon
export const sousObjectifsDe = (vue: VueMetier, id: IdObjectif): ReadonlyArray<Objectif> => …;
export const tachesDirectesDe = (vue: VueMetier, id: IdObjectif): ReadonlyArray<Tache> => …;
export const sousTachesDe = (vue: VueMetier, id: IdTache): ReadonlyArray<Tache> => …;

// etat-objectif.ts — RG-025
export type EtatObjectif = 'EN_COURS' | 'ATTEINT' | 'A_DECLINER';
export const etatObjectif = (vue: VueMetier, id: IdObjectif): EtatObjectif => …;      // §6.2
export const compteurObjectif = (vue: VueMetier, id: IdObjectif): { readonly terminees: number; readonly nonAbandonnees: number } => …; // CA-3

// retard.ts — RG-045
export const estObjectifEnRetard = (objectif: Objectif, etat: EtatObjectif, jour: DateCalendaire): boolean => …;

// decisions/*.ts — fonctions pures, de type DecisionMetier une fois liées à leur commande
export type CommandeCreerObjectif = { readonly id: IdObjectif; readonly intitule: string; readonly description?: string;
                                      readonly delai?: DateCalendaire; readonly parentId?: IdObjectif };
export const deciderCreationObjectif = (commande: CommandeCreerObjectif) => (vue: VueMetier, contexte: ContexteDecision)
  : Resultat<Decision<IdObjectif>, RefusMetier> => …;
export const deciderRenommageObjectif = (c: { readonly objectifId: IdObjectif; readonly intitule: string }) => (vue, contexte) => Resultat<Decision<void>, RefusMetier>;
export const deciderModificationDescription = (c: { readonly objectifId: IdObjectif; readonly description?: string }) => …;
export const deciderModificationDelaiObjectif = (c: { readonly objectifId: IdObjectif; readonly delai: DateCalendaire }) => …;
export const deciderRetraitDelaiObjectif = (c: { readonly objectifId: IdObjectif }) => …;
export const evaluerSuppressionObjectif = (c: { readonly objectifId: IdObjectif }) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderSuppressionObjectif = (c: { readonly objectifId: IdObjectif }) => (vue, contexte) => Resultat<Decision<void>, RefusMetier>;
```
Les décisions reçoivent la `VueMetier` : l'adaptateur `avecVue(decision)` (fichier 15) les transforme en `DecisionMetier` du socle en construisant la vue à partir de l'`EtatMetier` reçu dans la transaction.

### 4.2 Application — cas d'usage
| Cas d'usage | Entrée | Sortie | Erreurs | Ports / services | Effets |
|---|---|---|---|---|---|
| `CreerObjectif.executer` | `{ intitule: string; description?: string; delai?: DateCalendaire }` | `IdObjectif` | `SaisieInvalide`, `ErreurDepotLocal` | `GenerateurIdentifiants`, `ServiceEtatLocal` | `CREER_OBJECTIF` + `CREATION` |
| `RenommerObjectif.executer` | `{ objectifId; intitule: string }` | `void` | `SaisieInvalide`, `ElementIntrouvable` | `ServiceEtatLocal` | `ECRIRE_OBJECTIF intitule` (aucun événement) |
| `ModifierDescriptionObjectif.executer` | `{ objectifId; description?: string }` | `void` | `ElementIntrouvable` | idem | `ECRIRE_OBJECTIF description` |
| `ModifierDelaiObjectif.executer` | `{ objectifId; delai: DateCalendaire }` | `void` | `ElementIntrouvable` | idem | `ECRIRE_OBJECTIF delai` + `MODIFICATION_DELAI` |
| `RetirerDelaiObjectif.executer` | `{ objectifId }` | `void` | `ElementIntrouvable` | idem | `ECRIRE_OBJECTIF delai = undefined` + `MODIFICATION_DELAI` |
| `SupprimerObjectif.evaluer` | `{ objectifId }` | `Evaluation` (toujours `CONFIRMATION_REQUISE`) | `ElementIntrouvable` | `ServiceEtatLocal.lire` | Aucun |
| `SupprimerObjectif.executer` | `{ objectifId }` | `void` | `ElementIntrouvable` | `ServiceEtatLocal` | `SUPPRIMER` + `SUPPRESSION` |

Toute sortie est `Promise<Resultat<…, RefusMetier | ErreurDepotLocal>>`. Séquence d'un cas d'usage d'écriture : (1) préparer les identifiants nécessaires (`CreerObjectif` : `IdObjectif.depuisUuid(generateur.genererUuidV7())`) ; (2) `service.modifier(avecVue(decider…(commande)))` ; (3) renvoyer le résultat. Aucune règle métier dans le cas d'usage.

**Requêtes**
```ts
// resumes.ts
export type ResumeObjectif = {
  readonly id: IdObjectif; readonly intitule: string; readonly description?: string; readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif; readonly etat: EtatObjectif; readonly enRetard: boolean;
  readonly tachesTerminees: number; readonly tachesNonAbandonnees: number;
  readonly creeLe: Instant; readonly enAttente: boolean;
};
export class ConsulterObjectifs { constructor(service: ServiceEtatLocal, horloge: Horloge);
  executer(): Promise<Resultat<{ readonly objectifs: ReadonlyArray<ResumeObjectif>; readonly existeAuMoinsUneTache: boolean }, ErreurDepotLocal>> }
export class ConsulterDetailObjectif { constructor(service: ServiceEtatLocal, horloge: Horloge);
  executer(id: IdObjectif): Promise<Resultat<DetailObjectif, RefusMetier | ErreurDepotLocal>> }
export type DetailObjectif = { readonly objectif: ResumeObjectif; readonly sousObjectifs: ReadonlyArray<ResumeObjectif>;
                               readonly actions: ReadonlyArray<ActionObjectif> };   // ST-US-002 ajoute les tâches
export class ConsulterHistorique { constructor(service: ServiceEtatLocal);
  executer(element: RefElementMetier): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>> }
```
Le jour de référence des requêtes est `jourDeReference(horloge.maintenant())`.

### 4.3 Ports
Aucun nouveau port : `ServiceEtatLocal`, `Horloge`, `GenerateurIdentifiants` (socle).

### 4.4 Adaptateurs
Sans objet (aucun adaptateur nouveau).

### 4.5 Présentation
```ts
export type ModeleVueDelai =
  | { readonly type: 'DATE'; readonly date: DateCalendaire; readonly libelle: string }
  | { readonly type: 'SANS_DELAI'; readonly code: 'MEN-SANS-DELAI'; readonly libelle: string };
export type LigneObjectif = {
  readonly id: IdObjectif; readonly intitule: string;
  readonly niveau: 'PRINCIPAL' | 'SOUS_OBJECTIF'; readonly parentId?: IdObjectif;
  readonly etat: { readonly code: 'ETA-OBJ-EN-COURS' | 'ETA-OBJ-ATTEINT' | 'ETA-OBJ-A-DECLINER'; readonly libelle: string };
  readonly compteur: { readonly code: 'ETA-OBJ-COMPTEUR'; readonly terminees: number; readonly nonAbandonnees: number; readonly libelle: string };
  readonly delai: ModeleVueDelai;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  readonly nomAccessible: string;       // « {intitulé}, {état}, {t} tâches sur {n} terminées, délai {date} » (guide §6.6.4)
};
export type ModeleVueListeObjectifs = {
  readonly lignes: ReadonlyArray<LigneObjectif>;   // objectifs principaux non atteints, chacun suivi de ses sous-objectifs ; ordre : §6.6
  readonly sectionAtteints?: {                     // absente si aucun objectif principal atteint (guide v0.2.9 §5.8 b)
    readonly code: 'SEC-OBJ-ATTEINTS'; readonly n: number; readonly libelle: string;   // « Atteints ({n}) »
    readonly replieeParDefaut: true;
    readonly lignes: ReadonlyArray<LigneObjectif>;  // objectifs principaux atteints, chacun suivi de ses sous-objectifs
  };
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
  readonly etatVide?: { readonly code: 'EVD-OBJECTIFS' | 'EVD-OBJECTIFS-TOUS-ATTEINTS' };   // aucun objectif ; ou lignes vides et section des atteints présente (RL-LOT-001-S1)
};
export const construireListeObjectifs = (donnees: { readonly objectifs: ReadonlyArray<ResumeObjectif> }, dependances: { readonly horloge: Horloge }) => ModeleVueListeObjectifs;
export type ModeleVueDetailObjectif = {
  readonly id: IdObjectif; readonly intitule: string; readonly description?: string; readonly delai: ModeleVueDelai;
  readonly niveau: { readonly type: 'PRINCIPAL' } | { readonly type: 'SOUS_OBJECTIF'; readonly parent: { readonly id: IdObjectif; readonly intitule: string } };
  readonly etat: LigneObjectif['etat']; readonly compteur: LigneObjectif['compteur']; readonly enRetard?: LigneObjectif['enRetard'];
  readonly sousObjectifs: { readonly code: 'SEC-SOUS-OBJECTIFS'; readonly libelle: string; readonly lignes: ReadonlyArray<LigneObjectif> }; // ordre : §6.6
  readonly actions: ReadonlyArray<ActionObjectif>;
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
};
export const construireDetailObjectif = (donnees: DetailObjectif, dependances: { readonly horloge: Horloge }) => ModeleVueDetailObjectif;
export type ModeleVueConfirmation = { readonly code: CodeCatalogue; readonly variables: Readonly<Record<string, string | number>>; readonly titre: string; readonly texte: string; readonly actionLibelle: string };
export const construireConfirmation = (c: ConfirmationRequise) => ModeleVueConfirmation;
export type MessageRefus = { readonly code: CodeCatalogue; readonly variante?: string; readonly variables: Readonly<Record<string, string | number>> };
export const messagesDeRefus = (refus: RefusMetier) => ReadonlyArray<MessageRefus>;
export type NomVue = 'LISTE_OBJECTIFS' | 'DETAIL_OBJECTIF' | 'LISTE_TACHES' | 'DETAIL_TACHE' | 'FORMULAIRE_TACHE' | 'FORMULAIRE_SOUS_TACHE';
export const VUES_EXPOSEES: ReadonlyArray<NomVue>;    // l'historique n'y figure pas (CA-11)
```

| Écran / composant | Maquette | Modèle de vue | Codes produits | Actions → cas d'usage | États à gérer |
|---|---|---|---|---|---|
| Liste des objectifs | ECR-008 A, E | `construireListeObjectifs` | `ETA-OBJ-*`, `ETA-OBJ-COMPTEUR`, `MEN-SANS-DELAI`, `MEN-EN-RETARD`, `MEN-HEURE-PARIS`, `EVD-OBJECTIFS`, `EVD-OBJECTIFS-TOUS-ATTEINTS` | « + » ou `Maj`+`N` → feuille de création ; ligne → détail | vide ; données aussitôt affichées ; hors ligne (rien n'est désactivé) |
| Feuille de création | ECR-008 B | — (champs locaux de l'écran) | `ERR-020` (sous le champ, focus, saisie conservée) | « Créer l'objectif » → `CreerObjectif` ; succès → détail du nouvel objectif | erreur de saisie |
| Détail | ECR-003 C, D | `construireDetailObjectif` | idem liste ; `CNF-SUPPR-OBJECTIF` | menu « … » : renommer → `RenommerObjectif` ; description → `ModifierDescriptionObjectif` ; changer le délai → `ModifierDelaiObjectif` ; retirer le délai → `RetirerDelaiObjectif` ; supprimer → `SupprimerObjectif.evaluer` puis boîte `CNF-SUPPR-OBJECTIF` puis `executer` ; après suppression, retour à la liste | erreur `ERR-014` (toast) |

Libellés : codes et textes du catalogue §6.6 ; attributs `data-etat` et `data-message` (`conventions.md` §8.5). Accessibilité : anneau de progression avec texte équivalent, nom accessible complet de la ligne, feuille en `BottomSheet` sur smartphone, panneau de 400 px sur PC, `ConfirmDialog` en `alertdialog` avec « Annuler » focalisé.

## 5. Modèle de données et migrations
### 5.1 Modèle
| Élément | Champ (registre du socle) | Type | Obligatoire | Contrainte | Remarque |
|---|---|---|---|---|---|
| Objectif | `creation.creeLe` | `Instant` | Oui | — | Ordre de création |
| | `intitule` | `string` | Oui | non vide après retrait des espaces | Non historisé (RG-050 d) |
| | `description` | `string \| undefined` | Non | normalisée (§4.1) | Non historisée |
| | `delai` | `DateCalendaire \| undefined` | Non | date réelle | Historisé (`MODIFICATION_DELAI`) |
| | `parent` | `PlacementObjectif` | Oui | `parentId` absent au rang 2 | ST-US-023 |
| | `suppression` | pierre tombale | — | — | `SUPPRESSION` |

Aucune nouvelle donnée hors du modèle du socle. Fichier Drive : contenu logique du schéma 1 (`ST-socle-ecriture.md` §5.3, **sous réserve R1**).
### 5.2 Migrations
Sans objet : aucune donnée publiée, aucun changement de schéma.

## 6. Règles et algorithmes

### 6.1 Vue métier (RG-046, RG-047 : dérivations de lecture)
```text
construireVueMetier(etat):
  objectifs ← objectifs non supprimés ; parentId effectif ← parentIdEnregistre s'il désigne un objectif non supprimé, sinon absent
  taches ← tâches non supprimées dont la tâche parente éventuelle n'est pas supprimée
  sousObjectifsPar ← regroupement des objectifs par parentId effectif
  sousTachesPar ← regroupement des tâches par tacheParenteId
  tachesDirectesPar(o) ← tâches sans tâche parente dont objectifIdsActifs contient o (o non supprimé)
  objectifsDirectsPar(t) ← objectifIdsActifs de t, objectifs supprimés exclus, ordre conservé
  intitulesConnus ← intitulés de tous les éléments enregistrés, supprimés compris
```
### 6.2 État d'un objectif (RG-025 ; US-001 CA-8, US-003 CA-4 à CA-7, US-023 CA-7)
```text
etatObjectif(vue, o, visites = ∅):
  1. si o ∈ visites : renvoyer EN_COURS                         // garde-fou : hiérarchie invalide transitoire avant réparation
  2. D ← tachesDirectesDe(vue, o)
  3. N ← { t ∈ D | t.etat ≠ ABANDONNEE } ∪ { s ∈ sousTachesDe(vue, t), t ∈ D | s.etat ≠ ABANDONNEE }   // CA-5 d'US-003 ; RG-049
  4. S ← sousObjectifsDe(vue, o)
  5. si N = ∅ et S = ∅ : renvoyer A_DECLINER
  6. si tout t ∈ N est TERMINEE et tout s ∈ S vérifie etatObjectif(vue, s, visites ∪ {o}) = ATTEINT : renvoyer ATTEINT
  7. renvoyer EN_COURS
compteurObjectif(vue, o) = { terminees : |{t ∈ D | TERMINEE}|, nonAbandonnees : |{t ∈ D | ≠ ABANDONNEE}| }   // tâches directes seulement (CA-3)
```
### 6.3 Retard (RG-045, RG-053)
`estObjectifEnRetard(o, etat, jour)` = `o.delai` défini **et** `o.delai < jour` **et** `etat ≠ ATTEINT`. `jour` = jour de Paris de `Horloge.maintenant()` (PT-16 : S13 ; voyage : S14).

### 6.4 Décisions
| Décision | Contrôles, dans l'ordre | Modifications produites | Événement (rang 0) |
|---|---|---|---|
| Création | intitulé (`SaisieInvalide [INTITULE_VIDE]`) | `CREER_OBJECTIF` `{ id, creeLe: contexte.instant, valeurs: { intitule, description normalisée, delai } }` | `CREATION`, `apres: { delai? }` (et `parentId?`, ST-US-023) |
| Renommage | objectif actif ; intitulé | `ECRIRE_OBJECTIF intitule` ; **aucune** si identique | Aucun |
| Description | objectif actif | `ECRIRE_OBJECTIF description` (normalisée) ; aucune si identique | Aucun |
| Délai | objectif actif | `ECRIRE_OBJECTIF delai` ; aucune si identique | `MODIFICATION_DELAI`, `avant: { delai? }`, `apres: { delai }` |
| Retrait du délai | objectif actif | `ECRIRE_OBJECTIF delai = undefined` ; aucune si déjà sans délai | `MODIFICATION_DELAI`, `avant: { delai }`, `apres: {}` |
| Évaluation de la suppression | objectif actif | — | `CONFIRMATION_REQUISE` `SUPPRESSION_OBJECTIF` : `tachesDetachees = |tachesDirectesDe(o)|` (tous états), `sousObjectifsPromus = |sousObjectifsDe(o)|` |
| Suppression | objectif actif | `SUPPRIMER { OBJECTIF, id }` ; **aucune** écriture sur les liens ni sur les sous-objectifs (dérivation, DAT §4.2) | `SUPPRESSION` |

« Objectif actif » : présent dans `vue.objectifs`, sinon `ElementIntrouvable`.

### 6.5 Modèles de vue
- `construireLigneObjectif` : `etat` → `ETA-OBJ-EN-COURS` / `ETA-OBJ-ATTEINT` / `ETA-OBJ-A-DECLINER` ; `delai` → `DATE` ou `SANS_DELAI` (`MEN-SANS-DELAI`) ; `enRetard` présent si et seulement si le résumé est en retard ; `compteur` toujours présent.
- `mentionHeureParis` présente si et seulement si `horloge.fuseauAppareil() ≠ FUSEAU_REFERENCE` (RG-054, guide §4.21) ; jamais sur un délai.
- `etatVide = EVD-OBJECTIFS` si aucun objectif ; `etatVide = EVD-OBJECTIFS-TOUS-ATTEINTS` (« Tous vos objectifs sont atteints. », action « Créer un objectif », affiché au-dessus de la section repliée) si `lignes` est vide et `sectionAtteints` présente (guide v0.2.14 §6.6.5, RL-LOT-001-S1).
- `actions` du détail : `RENOMMER`, `MODIFIER_DESCRIPTION`, `MODIFIER_DELAI`, `RETIRER_DELAI` (seulement si un délai existe), `SUPPRIMER` ; ST-US-023 ajoute `PLACER` et `CREER_SOUS_OBJECTIF`.
- `construireConfirmation(SUPPRESSION_OBJECTIF)` : code `CNF-SUPPR-OBJECTIF`, variables `{ element: intitulé, taches: tachesDetachees, sousObjectifs: sousObjectifsPromus }`.
- `messagesDeRefus` : `SaisieInvalide` → un message par défaut, dans l'ordre (`INTITULE_VIDE` → `ERR-020`, `DELAI_ABSENT` → `ERR-021`, `ESTIMATION_ABSENTE` → `ERR-022`, `ESTIMATION_INVALIDE` → `ERR-023`) ; `ElementIntrouvable`, `ActionNonDisponible` → liste vide.

### 6.6 Ordre et sections de la liste des objectifs (guide v0.2.9 §5.8, réponse à Q-US-001-6)
```text
comparerOrdreReference(a, b) :                                  // ordre de référence (§5.8), partagé par toutes les listes concernées
  1. délai croissant ; un élément sans délai vient après tout élément avec délai
  2. à délai égal (ou tous deux sans délai) : creeLe croissant
  3. puis intitulé : Intl.Collator('fr', { sensitivity: 'base' }).compare
  4. puis id (comparaison ordinale), pour un ordre total

construireListeObjectifs :
  principaux ← objectifs dont le parent effectif est absent
  section principale (lignes) : principaux NON atteints, triés par comparerOrdreReference ;
      chacun immédiatement suivi de ses sous-objectifs, triés de même, atteints compris (aucun déplacement quand l'état change, §5.8 c)
  sectionAtteints (SEC-OBJ-ATTEINTS, « Atteints ({n}) », repliée par défaut) : principaux ATTEINTS, même tri,
      chacun suivi de ses sous-objectifs ; n = nombre de principaux atteints ; absente si n = 0 (§5.8 b)
  un sous-objectif atteint dont le parent n'est pas atteint reste sous son parent, dans la section principale
```
Détail d'un objectif : section `SEC-SOUS-OBJECTIFS` (« Sous-objectifs » + nombre), lignes triées par `comparerOrdreReference`, atteints compris. Aucune règle de gestion n'est touchée (affichage seulement).

### 6.7 Rendu de l'historique dans les tests (`tests/support/rendu-historique.ts`, glossaire v1.4 §11)
`rendreEntree(evenement, intitules): { evenement: string; journee: string; avant: string; apres: string }` :
- événement : `CREATION` → « création », `MODIFICATION_DELAI` → « modification délai », `MODIFICATION_ESTIMATION` → « modification estimation », `RATTACHEMENT` → « rattachement », `DETACHEMENT` → « détachement », `CHANGEMENT_PARENT` → « changement parent », `FIN` → « fin », `REOUVERTURE` → « réouverture », `ABANDON` → « abandon », `REPRISE` → « reprise », `SUPPRESSION` → « suppression » ;
- journée : `evenement.jour` ;
- création : parties présentes, dans cet ordre, jointes par « , » : « tâche parente <intitulé> » ou « parent <intitulé> », « délai <date> », « estimation <durée> », « objectifs <o1> » (plusieurs : « o1, o2 et o3 », ordre de `objectifIds`) ; vide si aucune ;
- délai, estimation : valeur brute, vide si absente ; durée au format du glossaire (`0 h`, `30 min`, `1 h`, `2 h 30`) ;
- rattachement / détachement : intitulé de l'objectif ; changement parent : intitulé, ou « aucun (objectif principal) » ;
- fin, réouverture, abandon, reprise : « à faire », « terminée, date de fin <date> », « abandonnée, date d'abandon <date> » ;
- suppression : vide, vide. Les intitulés viennent de `VueMetier.intitulesConnus` (supprimés compris).

Temps et fuseaux : jour de Paris (PT-16 : S13, 2026-10-25 à 02:30 = première occurrence). Hasard : aucun.

## 7. Intégration Google
Sans objet : aucun appel Google (les données vont dans le Drive par ST-US-017, sous réserve R1).

## 8. Gestion des erreurs
| # | Situation | Détection | Erreur | Comportement | Message | Journalisation | Test |
|---|---|---|---|---|---|---|---|
| 1 | Intitulé vide ou composé d'espaces | Domaine | `SaisieInvalide [INTITULE_VIDE]` | Refus, aucune écriture, saisie conservée | `ERR-020` | `info` : `cas_usage`, `type` | UT-US-001-15, 33 |
| 2 | Objectif absent ou supprimé (concurrence d'onglets, appel invalide) | Domaine | `ElementIntrouvable` | Refus, aucune écriture ; l'écran se rafraîchit | Aucun | `avertissement` | UT-US-001-23 |
| 3 | Écriture locale impossible | `DepotLocal` | `EcritureLocaleImpossible` | Aucune écriture | `ERR-014` (toast « Réessayer ») | `erreur` | Socle |

## 9. Patterns imposés
| Pattern | Où | Pourquoi |
|---|---|---|
| Décision pure liée à une commande (`decider…(commande)(vue, contexte)`) | `domaine/decisions/` | Domaine pur ; une transaction (socle) |
| Commande avec confirmation (`evaluer` / `executer`) | `SupprimerObjectif` | `conventions.md` §8.6 |
| Objet-valeur | `Intitule` | RCD-09, RCD-10 |
| Requête + modèle de vue | `Consulter…`, `construire…` | `conventions.md` §4.3 |
**Interdits** : écrire dans `DepotLocal` ; stocker l'état ou le retard d'un objectif ; écrire en cascade sur les tâches ou sous-objectifs à la suppression.

## 10. Sécurité et données personnelles
Intitulés et descriptions : affichés comme texte (React échappe), jamais en HTML ; jamais journalisés. Aucune longueur maximale (Q-US-001-3) : le rendu tronque à deux lignes (guide §4.2), la donnée est intacte.

## 11. Exigences non fonctionnelles
| ENF | Exigence | Vérification |
|---|---|---|
| ENF-04 | Création, modification, suppression sans réseau | Aucun port distant ; scénarios d'US-018 |
| Performance (US-001, impacts architecture) | États et alertes recalculés en moins de 100 ms pour 500 objectifs et 5 000 tâches | Test de performance indicatif (§14) |

## 12. Step definitions Cucumber
> Fichiers : `tests/steps/objectifs-taches/objectifs.steps.ts` (sauf mention). Les phrases écrites ici avec `(s)` (pluriel variable) sont définies en **expression régulière** qui accepte le singulier, le pluriel et la forme littérale « (s) » (`conventions.md` §11.6) ; les autres, en expressions Cucumber. « Rang » = rang de livraison de la définition. Le contexte de chaque scénario utilise les étapes du socle (`nous sommes le …`, préfixes) et l'étape de connexion de ST-US-022.

| # | Phrase Gherkin exacte | Mot-clé | Nouveau / réutilisé | Rang | Implémentation attendue |
|---|---|---|---|---|---|
| 1 | `l'utilisateur crée un objectif {string} de délai {date}` | Quand (`etapeAction`) | Nouveau | 2 | `CreerObjectif` ; mémorise l'id sous l'intitulé normalisé ; résultat dans le monde |
| 2 | `l'utilisateur crée un objectif {string} de délai {date} avec la description {string}` | Quand | Nouveau | 2 | idem, description |
| 3 | `l'utilisateur crée un objectif {string} de délai {date} sans description` | Quand | Nouveau | 2 | idem, sans description |
| 4 | `l'utilisateur crée un objectif {string} sans délai` | Quand | Nouveau | 2 | idem, sans délai |
| 5 | `l'utilisateur crée un objectif sans délai dont l'intitulé est vide` ; `… est composé uniquement d'espaces` | Quand | Nouveau | 2 | Intitulé `""` ou `"   "` |
| 6 | `un objectif {string} de délai {date}` ; `un objectif {string} sans délai` ; `un objectif {string} de délai {date} avec la description {string}` | Étant donné (`etapeContexte`) | Nouveau | 2 | `CreerObjectif` ; l'étape échoue si le résultat est un refus |
| 7 | `l'utilisateur renomme l'objectif {string} en {string}` | Quand | Nouveau | 2 | `RenommerObjectif` ; met à jour la référence |
| 8 | `l'utilisateur modifie la description de l'objectif {string} en {string}` | Quand | Nouveau | 2 | `ModifierDescriptionObjectif` |
| 9 | `l'utilisateur modifie le délai de l'objectif {string} en {date}` | Quand | Nouveau | 2 | `ModifierDelaiObjectif` |
| 10 | `l'utilisateur retire le délai de l'objectif {string}` | Quand | Nouveau | 2 | `RetirerDelaiObjectif` |
| 11 | `l'utilisateur supprime l'objectif {string} et confirme` ; `… et renonce` | Quand | Nouveau | 2 | `evaluer` (doit demander `CNF-SUPPR-OBJECTIF`) puis `executer`, ou rien |
| 12 | `l'utilisateur demande la suppression de l'objectif {string}` | Quand | Nouveau | 2 | `evaluer` ; commande en attente (`conventions.md` §8.6) |
| 13 | `une confirmation est demandée, qui annonce {int} tâche(s) détachée(s) et {int} sous-objectif(s) devenu(s) objectif principal` | Alors (`refus.steps.ts`) | Nouveau | 2 | `construireConfirmation` de la commande en attente : code `CNF-SUPPR-OBJECTIF`, variables `taches` et `sousObjectifs` |
| 14 | `l'objectif {string} existe` ; `… existe avec le délai {date}` ; `… existe sans délai` ; `… existe sans description` ; `… a la description {string}` | Alors (`etapeAssertion`) | Nouveau | 2 | `ConsulterDetailObjectif` de l'objectif résolu (`conventions.md` §11.7) |
| 15 | `l'objectif {string} n'existe plus` | Alors | Nouveau | 2 | La référence mémorisée n'est plus dans `vue.objectifs` |
| 16 | `aucun objectif n'existe` | Alors | Nouveau | 2 | `ConsulterObjectifs` vide |
| 17 | `il existe {int} objectif(s) d'intitulé {string}` | Alors | Nouveau | 2 | Décompte dans `ConsulterObjectifs` |
| 18 | `l'état de l'objectif {string} est {string}` | Alors (aussi en précondition) | Nouveau | 2 | `LigneObjectif.etat.code` ; valeurs « en cours », « atteint », « à décliner en tâches » |
| 19 | `l'objectif {string} est en retard` ; `l'objectif {string} n'est pas en retard` | Alors (aussi en précondition) | Nouveau | 2 | `LigneObjectif.enRetard` |
| 20 | `l'objectif {string} porte la mention {string}` | Alors | Nouveau | 2 | Codes de mention de la ligne : `MEN-SANS-DELAI` (rang 2), `MEN-ATTENTE` (ajouté par ST-US-017 incrément 1) |
| 21 | `l'utilisateur consulte la liste des objectifs` | Quand | Nouveau | 2 | `construireListeObjectifs` ; modèle mémorisé dans le monde |
| 22 | `la liste des objectifs présente :` + tableau | Alors | Nouveau | 2 | Lignes de la section principale **et** de la section « Atteints » ; colonnes présentes seulement, ordre non vérifié ; `délai` : date ou « sans délai » ; `en retard` : « oui »/« non » |
| 23 | `l'utilisateur consulte le détail de l'objectif {string}` | Quand | Nouveau | 2 | `construireDetailObjectif` mémorisé |
| 24 | `le détail présente l'intitulé {string}, la description {string} et le délai {date}` | Alors | Nouveau | 2 | Égalité des trois valeurs |
| 25 | `aucune action ne permet à l'utilisateur de saisir l'état de l'objectif {string}` | Alors | Nouveau | 2 | `detail.actions ⊆ ACTIONS_OBJECTIF` (aucune action d'état) et aucun export de `objectifs-taches/index.ts` dont le nom contient « Etat » et désigne une commande |
| 26 | `l'enregistrement est refusé avec le motif {string}` | Alors (`refus.steps.ts`) | Nouveau | 2 | Dernier résultat de l'appareil = `Echec` ; `messagesDeRefus` mis en forme (`ERR-021, ERR-022`, `ERR-030 variante <v>`) égal au motif |
| 27 | `l'historique contient, pour l'objectif {string} :` + tableau | Alors (`historique.steps.ts`) | Nouveau | 2 | `ConsulterHistorique` ; `rendreEntree` ; liste complète, ordre chronologique |
| 28 | `l'historique de l'objectif {string} se termine par :` + tableau | Alors | Nouveau | 2 | Dernières entrées, dans l'ordre |
| 29 | `l'historique ne contient aucune entrée {string} pour l'objectif {string}` | Alors | Nouveau | 2 | Aucune entrée du type correspondant |
| 30 | `l'historique n'est affiché nulle part dans l'application` | Alors | Nouveau | 2 | `VUES_EXPOSEES` ne contient aucune vue d'historique |
| 31 | `le smartphone est réglé sur le fuseau {string}` ; `nous sommes le …` | Étant donné | Réutilisé (socle) | 0 | — |
| 32 | `le détail présente les tâches {intitules}` ; `la tâche {string} existe sans objectif` ; `… figure parmi les tâches sans objectif` ; `… est rattachée au seul objectif {string}` ; `l'objectif {string} a toujours {int} tâche(s) rattachée(s)` ; `la tâche {string} porte une alerte …` ; `les tâches suivantes :` ; `l'objectif {string} a {int} tâche(s) à faire, …` ; `l'historique ne contient aucune entrée {string} pour la tâche {string}` | — | Réutilisés (ST-US-002, étendus par ST-US-024, 003, 025) | 5 à 8 | — |
| 33 | `un sous-objectif {string} de l'objectif {string}` (et `, sans délai`) ; `le détail présente le sous-objectif {string}` ; `{string} est un objectif principal` | — | Réutilisés (ST-US-023) | 4 | — |
| 34 | `l'utilisateur termine la tâche {string}` | Quand | Réutilisé (ST-US-003) | 7 | — |
| 35 | Étapes à deux appareils (S19, S20) : `l'utilisateur utilise le compte … tous deux à jour`, `le smartphone est sans réseau`, `le réseau revient …`, `les deux appareils échangent …`, `la liste des modifications non retenues contient :` | — | Réutilisés (ST-US-017, incréments 1 et 2, **sous réserve R1**) | 3, 9 | — |

**Type de paramètre nouveau** : `{intitules}` = `"[^"]+"(?:, "[^"]+")*(?: et "[^"]+")?` → `ReadonlyArray<string>` (« "A" et "B" », « "A", "B" et "C" »).
**Monde** : modèles de vue consultés mémorisés par appareil (`derniereListeObjectifs`, `dernierDetailObjectif`).
**Scénarios `@ihm` / `@recette`** : aucun.

**Scénarios exécutables par rang** (`conventions.md` §11.13) : rang 2 : S01, S02, S03, S04, S04b, S05, S08, S09, S11, S13, S14, S21 ; rang 5 : S07, S10, S16, S18, S22 ; rang 7 : S12, S17 ; rang 8 : S06, S15 ; rang 9 : S19, S20.

## 13. Tests unitaires fournis (E10)
> Raison d'échec « NI » : le squelette lève `ErreurNonImplementee` (`ST-socle-ecriture.md` §13). Les tests d'application utilisent `ServiceEtatLocalTransactionnel` sur `DepotLocalDexie` et `fake-indexeddb`, `HorlogeSimulee`, `GenerateurIdentifiantsSequentiel` ; leurs préconditions de tâches sont créées par des `Modification` directes du socle (les cas d'usage des tâches n'existent pas encore).

| Id | Fichier | Élément | Cas testé | RG / CA | Échec attendu |
|---|---|---|---|---|---|
| UT-US-001-01 | `tests/unitaires/objectifs-taches/domaine/intitule.test.ts` | `construireIntitule` | « ␣␣Publier le guide␣ » → « Publier le guide » | Q-US-001-3 | NI |
| UT-US-001-02 | idem | `construireIntitule` | « » et « ␣␣␣ » → `IntituleVide` | CA-1 | NI |
| UT-US-001-03 | `…/domaine/description.test.ts` | `normaliserDescription` | `undefined`, « », « ␣ » → `undefined` ; « ␣A5␣ » → « A5 » | CA-1 | NI |
| UT-US-001-04 | `…/domaine/vue-metier.test.ts` | `construireVueMetier` | objectif supprimé exclu ; sous-objectif dont le parent est supprimé : parent effectif absent ; lien vers un objectif supprimé ignoré | RG-046 | NI |
| UT-US-001-05 | `…/domaine/etat-objectif.test.ts` | `etatObjectif` | ni tâche ni sous-objectif → `A_DECLINER` | CA-8 | NI |
| UT-US-001-06 | idem | `etatObjectif` | deux tâches abandonnées, sans sous-objectif → `A_DECLINER` | RG-025 | NI |
| UT-US-001-07 | idem | `etatObjectif` | une tâche à faire et une terminée → `EN_COURS` | RG-025 | NI |
| UT-US-001-08 | idem | `etatObjectif` | deux terminées et une abandonnée → `ATTEINT` | RG-025 | NI |
| UT-US-001-09 | idem | `etatObjectif` | tâche directe terminée dont une sous-tâche est à faire → `EN_COURS` | US-003 CA-5, RG-049 | NI |
| UT-US-001-10 | idem | `etatObjectif` | toutes les tâches terminées, un sous-objectif en cours → `EN_COURS` ; sous-objectif atteint sans tâche propre → `ATTEINT` ; sous-objectif à décliner → `EN_COURS` | RG-025, PEP-10 | NI |
| UT-US-001-11 | idem | `etatObjectif` | cycle transitoire A ↔ B : le calcul se termine | Garde-fou | NI |
| UT-US-001-12 | idem | `compteurObjectif` | Plan terminée, Chapitre 1 à faire (avec sous-tâche terminée), Relecture abandonnée → 1 / 2 | CA-3 | NI |
| UT-US-001-13 | `…/domaine/retard.test.ts` | `estObjectifEnRetard` | délai < jour non atteint → vrai ; délai = jour → faux ; atteint → faux ; sans délai → faux | CA-7, RG-045 | NI |
| UT-US-001-14 | `…/domaine/decisions/creer-objectif.test.ts` | `deciderCreationObjectif` | `CREER_OBJECTIF` (intitulé normalisé, `creeLe` = instant), événement `CREATION` rang 0 `apres: { delai: 2026-12-15 }` | CA-1, RG-050 | NI |
| UT-US-001-15 | idem | `deciderCreationObjectif` | intitulé « ␣␣ » → `SaisieInvalide [INTITULE_VIDE]`, aucune modification | CA-1 | NI |
| UT-US-001-16 | idem | `deciderCreationObjectif` | sans délai ni description → valeurs sans `delai` ni `description`, `apres: {}` | CA-2 | NI |
| UT-US-001-17 | `…/domaine/decisions/modifier-objectif.test.ts` | `deciderRenommageObjectif` | écriture `intitule`, aucun événement ; intitulé vide refusé ; identique → aucune modification | CA-5, RG-050 d | NI |
| UT-US-001-18 | idem | `deciderModificationDescription` | écriture `description` normalisée, aucun événement | CA-5 | NI |
| UT-US-001-19 | idem | `deciderModificationDelaiObjectif` | événement `MODIFICATION_DELAI` `avant 2026-12-15`, `apres 2027-01-31` ; même délai → aucune modification | CA-5, RG-050 | NI |
| UT-US-001-20 | idem | `deciderRetraitDelaiObjectif` | écriture `undefined`, événement `avant { delai }`, `apres {}` ; sans délai → aucune modification | CA-5 | NI |
| UT-US-001-21 | `…/domaine/decisions/supprimer-objectif.test.ts` | `evaluerSuppressionObjectif` | 2 tâches à faire et 1 terminée rattachées, 1 sous-objectif → `CONFIRMATION_REQUISE` (3, 1) | CA-9 | NI |
| UT-US-001-22 | idem | `deciderSuppressionObjectif` | une seule modification `SUPPRIMER`, événement `SUPPRESSION` ; aucune écriture de lien ni de parent | RG-046, S22 | NI |
| UT-US-001-23 | idem | décisions sur un objectif supprimé | `ElementIntrouvable` | — | NI |
| UT-US-001-24 | `tests/unitaires/objectifs-taches/application/creer-objectif.test.ts` | `CreerObjectif` | l'objectif créé est lu par `ConsulterObjectifs` ; le journal contient `CREATION` du jour de Paris | CA-1 | NI |
| UT-US-001-25 | `…/application/supprimer-objectif.test.ts` | `SupprimerObjectif.executer` | après suppression : objectif absent ; tâche de contexte sans objectif ; sous-objectif principal (lecture) | CA-9 | NI |
| UT-US-001-26 | `…/application/consulter-objectifs.test.ts` | `ConsulterObjectifs` | appareil à New York, 2026-11-10 17:59 → pas en retard ; 18:00 → en retard (délai 2026-11-10) | RG-045, RG-053 | NI |
| UT-US-001-27 | `…/application/consulter-historique.test.ts` | `ConsulterHistorique` | création, délai modifié le lendemain, suppression le surlendemain : trois entrées dans l'ordre, journées de Paris | CA-11 | NI |
| UT-US-001-28 | `tests/unitaires/objectifs-taches/presentation/liste-objectifs.test.ts` | `construireListeObjectifs` | codes `ETA-OBJ-*`, compteur, `MEN-SANS-DELAI`, `MEN-EN-RETARD` | CA-2, CA-3, CA-7 | NI |
| UT-US-001-29 | idem | `construireListeObjectifs` | `MEN-HEURE-PARIS` présente avec `America/New_York`, absente avec `Europe/Paris` | RG-054 | NI |
| UT-US-001-30 | idem | `construireListeObjectifs` | aucun objectif → `EVD-OBJECTIFS` ; tous les principaux atteints → `EVD-OBJECTIFS-TOUS-ATTEINTS` et section repliée (E11, RL-LOT-001-S1) | Guide v0.2.14 §6.6.5 | NI |
| UT-US-001-31 | `…/presentation/detail-objectif.test.ts` | `construireDetailObjectif` | actions sans `RETIRER_DELAI` pour un objectif sans délai ; aucune action d'état | CA-5, CA-8 | NI |
| UT-US-001-32 | `…/presentation/confirmation.test.ts` | `construireConfirmation` | `SUPPRESSION_OBJECTIF` → `CNF-SUPPR-OBJECTIF`, variables | CA-9 | NI |
| UT-US-001-33 | `…/presentation/messages-de-refus.test.ts` | `messagesDeRefus` | `[INTITULE_VIDE]` → `ERR-020` ; `ElementIntrouvable` → liste vide | CA-1 | NI |
| UT-US-001-34 | `…/presentation/vues-exposees.test.ts` | `VUES_EXPOSEES` | ne contient aucune vue d'historique | CA-11 | NI |
| UT-US-001-35 | `…/presentation/liste-objectifs.test.ts` | `construireListeObjectifs` | ordre de référence (délai croissant, sans délai à la fin, puis création, puis intitulé sans casse ni accents) ; principaux atteints dans `SEC-OBJ-ATTEINTS` avec n et leurs sous-objectifs ; section absente si n = 0 ; sous-objectif atteint sous un parent en cours resté sous lui ; `SEC-SOUS-OBJECTIFS` dans le détail | Guide v0.2.9 §5.8 (Q-US-001-6) | NI |

Suites de contrat : aucune nouvelle. Cas temporels couverts : minuit de Paris (S13), PT-16 (S13 à 02:30), appareil hors du fuseau de Paris (UT-US-001-26, 29).

**Précisions de l'E10 (2026-10-22)** — les squelettes font foi pour :
- constructeurs : `new CreerObjectif(service, generateur)`, `new CreerSousObjectif(service, generateur)` ; les autres cas d'usage d'objectif : `new …(service)` ; `executer(entree)` (et `evaluer(entree)` pour une commande avec confirmation) renvoient `Promise<Resultat<…, RefusMetier | ErreurDepotLocal>>` ;
- types des décisions : `DecisionSurVue<T> = (vue, contexte) => Resultat<Decision<T>, RefusMetier>` et `EvaluationSurVue = (vue) => Resultat<Evaluation, RefusMetier>` (`vue-metier.ts`) ; `avecVue<T>(decision: DecisionSurVue<T>): DecisionMetier<T, RefusMetier>` ; `lireVueCourante(service, horloge): Promise<Resultat<{ vue, jour }, ErreurDepotLocal>>` ;
- `resumerObjectif(vue, objectif, jour)`, `construireLigneObjectif(resume, aujourdhui: DateCalendaire)`, `comparerOrdreReference(a, b)` sur `ElementOrdonnable = { id, intitule, delai?, creeLe }` ;
- les actions d'un objectif sont calculées dès le rang 2 par `actionsObjectif(vue, id)` (domaine, ST-US-023 §6.4) et recopiées par la requête puis par le modèle de vue : UT-US-001-31 vérifie `actionsObjectif` (avec ou sans délai) et la recopie par `construireDetailObjectif` ;
- `VUES_EXPOSEES` est livré vide : UT-US-001-34 échoue sur l'assertion (comportement absent), non sur « NI » ;
- `CodeCatalogue` (`commun/presentation/messages/codes.ts`) est livré complet (codes du guide v0.2.10 §6.6) ; `libelle()`, `formaterDate()`, `formaterDuree()` et `CATALOGUE` restent à réaliser.
Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-001`.

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère de suffisance |
|---|---|---|
| Composants | Écrans liste, détail, feuille de création | Rendu des libellés du catalogue, `data-etat`, rôles ; action déclenchée |
| Unitaires | `formaterDate`, `libelle` (pluriel, insécables) | Règles du guide §6.6.1 |
| Performance (indicatif) | `ConsulterObjectifs` avec 500 objectifs et 5 000 tâches | < 100 ms |
| Revue E13 (condition 2 de Starck) | Rejouer `UT-SOC-*` et la suite de contrat `DepotLocal` | Tous verts |

## 15. Plan de réalisation
1. Domaine : `Intitule`, description, refus, actions, confirmation, vue métier, état, retard (UT-US-001-01 à 13).
2. Décisions (UT-US-001-14 à 23).
3. Cas d'usage et requêtes (UT-US-001-24 à 27).
4. Catalogue, formatage, modèles de vue (UT-US-001-28 à 35).
5. *Step definitions* du §12 ; scénarios du rang 2.
6. Écrans et composants ; composition ; DoD (`conventions.md` §15).

## 16. Dette, hypothèses et points ouverts
- **Question posée — Q-US-001-6** (Steeve, avis de Pepper ; concerne aussi ST-US-023, ST-US-002, ST-US-024) : *ordre d'affichage des listes non fixé*. Aucun critère d'acceptation, aucun scénario (les tableaux concernés n'ont pas « dans cet ordre »), ni le guide v0.2.8, ni les maquettes ne fixent l'ordre des lignes suivantes. ECR-008 A montre un groupe « Atteints (2) » sans code de catalogue. Merci de répondre par oui ou non à chaque proposition :
  - (a) Liste des objectifs (ECR-008) : objectifs principaux par délai croissant, sans délai à la fin, puis date de création croissante, puis intitulé (ordre alphabétique sans casse ni accents) ? ★ Oui.
  - (b) Objectifs principaux atteints regroupés à la fin dans une section repliée « Atteints (n) » ? Si oui, Steeve crée son code de catalogue. ★ Non au lot 1 (une seule liste, l'état est écrit sur chaque ligne).
  - (c) Sous-objectifs, sous leur parent dans la liste et dans le détail d'un objectif (ECR-003) : même ordre que (a) ? ★ Oui.
  - (d) Tâches dans le détail d'un objectif (ECR-003 D) : trois sections « Tâches à faire », « Terminées (n) » et « Abandonnées (n) », les deux dernières repliées, triées comme la liste « Tâches » (guide §5.7) ? Si oui, codes des titres de section à créer. ★ Oui.
  - (e) Sous-tâches dans le détail d'une tâche (ECR-007 A, F) : une seule liste, tous états confondus, par délai croissant, puis date de création, puis intitulé ? ★ Oui.
  Seuls l'ordre des lignes (§6.6) et UT-US-001-35 en dépendent ; aucune règle de gestion n'est touchée.
  - **Réponse de Steeve (E9, 2026-10-22, guide v0.2.9 §5.8)** : (a) **Oui**. (b) **Non à la ★ : la section repliée « Atteints (n) » est conservée** (déjà dans ECR-008, validée avec US-001 en E6 ; sans elle, un objectif atteint à délai proche resterait en tête) ; code `SEC-OBJ-ATTEINTS` « Atteints ({n}) » créé (§6.6.4 du guide), n = objectifs principaux atteints, même ordre à l'intérieur ; un sous-objectif atteint sous un parent en cours reste sous lui ; un principal atteint emmène ses sous-objectifs. Le §6.6 ci-dessus (« pas de section Atteints ») est donc remplacé par cette réponse pour E10. (c) **Oui** (atteints compris, sans déplacement). (d) **Oui**, codes `SEC-TACHES-A-FAIRE`, `SEC-TACHES-TERMINEES`, `SEC-TACHES-ABANDONNEES` créés. (e) **Oui**, une seule liste tous états confondus. Ordre commun : délai croissant, sans délai à la fin, création croissante, intitulé (`Intl.Collator('fr', { sensitivity: 'base' })`). Aucune règle de gestion ni périmètre touché.
- **Hypothèses** : H-5, H-7 appliquées (`conventions.md` §17.3). Aucune autre.
- **Dette acceptée d'emblée** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] Chaque CA est relié à un scénario et à un test (§2.1).
- [x] Chaque RG est reliée à un élément de domaine et à un test (§2.2).
- [x] Fichiers, couches, signatures, erreurs (§3, §4, §8).
- [x] Modèle de données sans migration (§5).
- [x] Algorithmes déterministes (§6), ordre des lignes compris (guide v0.2.9 §5.8).
- [x] Interactions Google : sans objet (§7).
- [x] Patterns et sécurité (§9, §10).
- [x] Chaque phrase du `.feature` a une ligne au §12.
- [x] Tests du §13 en phase rouge (E10, 2026-10-22 : 46 cas).
- [x] Q-US-001-6 répondue (Steeve, guide v0.2.9 §5.8).
