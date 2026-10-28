# ST-US-024 — Décomposer une tâche en sous-tâches

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-024](../01-specification-fonctionnelle/user-stories/US-024-decomposer-une-tache-en-sous-taches.md), état du 2026-10-21 (validée, DEC-018) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **6** / 13 ; partie RG-049 (incohérences) : **rang 9**, avec l'incrément 2 d'US-017 |
| Fichier `.feature` | [`tests/features/US-024-decomposer-une-tache-en-sous-taches.feature`](../../tests/features/US-024-decomposer-une-tache-en-sous-taches.feature), 25 scénarios |
| RG couvertes | RG-003, RG-023, RG-026, RG-028, RG-029, RG-045, RG-046, RG-047 (via ST-US-017 incrément 2), RG-049, RG-050 |
| DAT / ADR | DAT v0.10.1 (§4.2 « suppressions », « incohérences d'état », §6.1, §6.2) ; ADR-003, ADR-010 |
| Maquettes | ECR-007 (A, H, I, J), ECR-003 D, ECR-002 ; guide v0.2.8 §4.22, §4.23, §6.6.9 |
| Q-US traitées | Q-US-024-1, Q-US-024-2, Q-US-024-3, Q-US-001-2 (E8) ; hypothèse H-3 ; Q-US-001-6 (e) (réponse de Steeve, guide v0.2.9 §5.8) |
| Prérequis | ST-US-002 (rang 5) |
| Version | 0.1 |
| Statut | **Prête pour E10** (Q-US-001-6 (e) répondue) |
| Auteur | Anthony |
| Branche Git | `us/US-024-sous-taches` (rang 6) ; la partie RG-049 est livrée sur la branche de l'incrément 2 d'US-017 |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-22 | Anthony | Réponse à Q-US-001-6 (e) (guide v0.2.9 §5.8) : section `SEC-SOUS-TACHES`, ordre de référence ; §4.5, §6.7, UT-US-024-23 ; statut levé |

## 1. Résumé technique
- **Ce que l'US change.** Création d'une sous-tâche (un seul niveau ; refus `ERR-032` sous une tâche abandonnée ; confirmation `CNF-AJOUT-SOUS-TACHE-TERMINEE` et réouverture de la tâche parente sous une tâche terminée), estimation calculée de la tâche parente (somme des sous-tâches non abandonnées, 0 h admis), information `ALR-012` avant la première sous-tâche, objectifs hérités (`ERR-034`, ST-US-002), alerte `ALR-006`, détail d'une tâche parente (sous-tâches, compteur, `ALR-013`), recopie de l'estimation à la suppression de la dernière sous-tâche (H-3). Au rang 9 : incohérences dérivées RG-049 (`MEN-INCOHERENCE`, `ALR-003`, `ALR-004`).
- **Hors périmètre** : terminer la tâche parente (`ERR-035`) et rouvrir une sous-tâche (ST-US-003) ; abandon en cascade (ST-US-025) ; sous-tâche ajoutée à une tâche supprimée de façon concurrente (S22, ST-US-017 incrément 2) ; transformation d'une tâche en sous-tâche (exclue).
- **Prérequis** : ST-US-002.

## 2. Traçabilité
### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests | Composants | Rang |
|---|---|---|---|---|---|
| CA-1 création, un niveau | S01, S02 | RG-023 | UT-US-024-01, 04, 06, 14 | `CreerSousTache` | 6 |
| CA-2 saisie comme une tâche | S03, S04 | RG-003, 028, 029 | UT-US-024-05, 15 | `validerSaisieTache`, `construireFormulaireSousTache` | 6 |
| CA-3 détail | S05 | RG-023, RG-045 | UT-US-024-16 | `construireDetailTache` | 8 |
| CA-4 estimation calculée | S06, S07, S08 | RG-023 | UT-US-024-08, 09 ; UT-US-002-08 | `estimationEnVigueur` | 6 (S07 : 7 ; S08 : 8) |
| CA-5 première sous-tâche | S09 | RG-029 | UT-US-024-15 | `ALR-012` | 6 |
| CA-6 alerte | S11, S12, S13 | RG-023, RG-045 | UT-US-024-13 | `alertesDelaiTache` | 6 |
| CA-7 objectifs hérités | S14 | RG-023 | UT-US-002-10, 16 ; UT-US-024-17 | `VueMetier`, `deciderRattachement` | 6 |
| CA-8 fin de la tâche parente | S15, S16, S16b | RG-023, RG-026 | ST-US-003 ; UT-US-024-08, 16 | `ALR-013` | 8 |
| CA-9 suppression | S10, S10b, S19 | RG-046, RG-029 | UT-US-024-10 à 12, 20 | `deciderSuppressionTache` | 6 (S10b : 8 ; S19 : 7) |
| Cas limite : tâche terminée | S17 | RG-023, RG-026 | UT-US-024-02, 07, 19 | `CreerSousTache` | 7 |
| Cas limite : tâche abandonnée | S18 | RG-027 | UT-US-024-03 | idem | 8 |
| CA-10 incohérence | S20, S21 | RG-049 | UT-US-024-21, 22 | `incoherenceDe` | 9 |
| CA-11 suppression concurrente | S22 | RG-047 | ST-US-017 incrément 2 | — | 9 |
| CA-12 historique | S23 | RG-050 | UT-US-024-06 | Décisions | 6 |

### 2.2 Règles de gestion → implémentation
| RG | Élément | Tests |
|---|---|---|
| RG-023 (un niveau, somme, objectifs hérités, alerte) | `decisions/creer-sous-tache.ts`, `estimationEnVigueur`, `alertesDelaiTache`, `actionsTache` | UT-US-024-01 à 09, 13, 14 |
| RG-029 et cas limite « dernière sous-tâche » (Q-US-024-2 a) | `deciderSuppressionTache` (H-3) | UT-US-024-10 à 12 |
| RG-049 | `incoherence.ts` (rang 9) | UT-US-024-21, 22 |
| RG-050 | Événements `CREATION` (tâche parente), `REOUVERTURE` (conséquence), `MODIFICATION_ESTIMATION` (recopie) | UT-US-024-06, 07, 10 |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/decisions/creer-sous-tache.ts` | Domaine | Créer | `evaluerCreationSousTache`, `deciderCreationSousTache` |
| 2 | `src/objectifs-taches/domaine/decisions/supprimer-tache.ts` | Domaine | Modifier | Recopie de l'estimation (H-3, §6.3) |
| 3 | `src/objectifs-taches/domaine/refus.ts`, `confirmation.ts`, `actions.ts` | Domaine | Modifier | `AjoutSousTacheATacheAbandonnee` ; `AJOUT_SOUS_TACHE_TERMINEE` ; `CREER_SOUS_TACHE` |
| 4 | `src/objectifs-taches/domaine/incoherence.ts` | Domaine | Créer (rang 9) | `incoherenceDe` (RG-049) |
| 5 | `src/objectifs-taches/application/cas-usage/creer-sous-tache.ts` | Application | Créer | `CreerSousTache` (`evaluer`, `executer`) |
| 6 | `src/objectifs-taches/application/requetes/resumes.ts`, `consulter-detail-tache.ts` | Application | Modifier | `sousTaches`, compteur, `sousTachesAFaire` ; `incoherence` (rang 9) |
| 7 | `src/objectifs-taches/presentation/modeles-de-vue/detail-tache.ts`, `ligne-tache.ts`, `formulaire-sous-tache.ts`, `confirmation.ts`, `messages-de-refus.ts` | Modèle de vue | Créer / Modifier | ECR-007 A, I, J ; `ALR-012`, `ALR-013`, `ALR-006`, `MEN-ESTIMATION-CALCULEE`, `MEN-OBJECTIFS-HERITES`, `CNF-AJOUT-SOUS-TACHE-TERMINEE`, `ERR-032` ; rang 9 : `MEN-INCOHERENCE`, `ALR-003`, `ALR-004` |
| 8 | `src/objectifs-taches/presentation/ui/ecrans/detail-tache.tsx`, `composants/saisie-rapide.tsx` (variante sous-tâche), `composants/carte-incoherence.tsx` (rang 9) | UI | Modifier / Créer | Section « Sous-tâches », `LockedField`, `InconsistencyCard` |
| 9 | `src/composition/web.ts`, `src/objectifs-taches/index.ts` | Composition | Modifier | Enregistrement |
| 10 | `tests/steps/objectifs-taches/taches.steps.ts`, `refus.steps.ts` ; `tests/support/construction-taches.ts` | Test | Modifier | §12 ; colonne « tâche parente » des tableaux |

## 4. Interfaces et signatures
### 4.1 Domaine
```ts
// refus.ts (ajout)
  | { readonly type: 'AjoutSousTacheATacheAbandonnee' }                                   // ERR-032
// confirmation.ts (ajout)
  | { readonly type: 'AJOUT_SOUS_TACHE_TERMINEE'; readonly tacheParenteId: IdTache; readonly intitule: string }   // CNF-AJOUT-SOUS-TACHE-TERMINEE
// decisions/creer-sous-tache.ts
export type CommandeCreerSousTache = { readonly id: IdTache; readonly tacheParenteId: IdTache; readonly saisie: SaisieTache };
export const evaluerCreationSousTache = (c: CommandeCreerSousTache) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderCreationSousTache = (c: CommandeCreerSousTache) => (vue: VueMetier, contexte: ContexteDecision) => Resultat<Decision<IdTache>, RefusMetier>;
// incoherence.ts (rang 9) — RG-049, dérivée, jamais écrite
export type Incoherence = { readonly etatParent: 'TERMINEE' | 'ABANDONNEE'; readonly sousTachesAFaire: ReadonlyArray<{ readonly id: IdTache; readonly intitule: string }> };
export const incoherenceDe = (vue: VueMetier, id: IdTache): Incoherence | undefined => …;
```
### 4.2 Application
| Cas d'usage | Entrée | Sortie | Erreurs | Effets |
|---|---|---|---|---|
| `CreerSousTache.evaluer` | `{ tacheParenteId; intitule; delai?; estimationMinutes? }` | `Evaluation` | `ElementIntrouvable`, `ActionNonDisponible('CREER_SOUS_TACHE')`, `AjoutSousTacheATacheAbandonnee`, `SaisieInvalide` | Aucun |
| `CreerSousTache.executer` | idem | `IdTache` | idem | `CREER_TACHE` (+ réouverture de la tâche parente terminée) |

`CreerSousTache` génère l'`IdTache` une seule fois par commande : `evaluer` et `executer` reçoivent la même commande, l'identifiant est tiré dans `executer`.

Résumés (ajouts) : `ResumeTache.sousTaches = { terminees, nonAbandonnees }` (présent si la tâche a au moins une sous-tâche) ; `DetailTache.sousTaches: ReadonlyArray<ResumeTache>` ; `DetailTache.sousTachesAFaire: number` ; rang 9 : `ResumeTache.incoherence?: Incoherence`.

### 4.3 Ports, 4.4 Adaptateurs
Sans objet.

### 4.5 Présentation
```ts
// ModeleVueDetailTache (ajouts)
readonly sousTaches?: {                                   // section SEC-SOUS-TACHES (guide v0.2.9 §5.8 e)
  readonly code: 'SEC-SOUS-TACHES'; readonly libelle: string;   // « Sous-tâches » + compteur « {t} / {n} »
  readonly lignes: ReadonlyArray<{ readonly id: IdTache; readonly intitule: string; readonly delai: DateCalendaire; readonly estimation: { readonly minutes: number; readonly libelle: string };
                                  readonly etat: LigneTache['etat']; readonly enRetard?: LigneTache['enRetard']; readonly alertes: LigneTache['alertes'];
                                  readonly nomAccessible: string;                       // « {intitulé}, {état en toutes lettres}, délai {date} » (+ « , en retard »), comme LigneTache (RL-LOT-001-S4)
                                  readonly caseTerminer: { readonly nomAccessible: string } }>;   // « Terminer « {intitulé} » » ; une seule liste, tous états, ordre de référence (§6.7)
  readonly compteur: { readonly terminees: number; readonly nonAbandonnees: number; readonly libelle: string };   // « 1 / 3 »
};
readonly infoFinImpossible?: { readonly code: 'ALR-013'; readonly n: number; readonly libelle: string };   // n = sous-tâches à faire ; absent si n = 0
readonly incoherence?: { readonly code: 'ALR-003' | 'ALR-004'; readonly n: number; readonly libelle: string };  // rang 9
// LigneTache (ajout, rang 9) : readonly incoherence?: { readonly code: 'MEN-INCOHERENCE' }
// formulaire-sous-tache.ts — ECR-007 I
export type ModeleVueFormulaireSousTache = ModeleVueFormulaireTache & {
  readonly tacheParente: { readonly id: IdTache; readonly intitule: string };
  readonly information?: { readonly code: 'ALR-012'; readonly duree: { readonly minutes: number; readonly libelle: string }; readonly libelle: string }; // première sous-tâche
};
export const construireFormulaireSousTache = (donnees: DetailTache) => ModeleVueFormulaireSousTache;
```
| Écran | Maquette | Codes | Actions → cas d'usage |
|---|---|---|---|
| Détail d'une tâche parente | ECR-007 A | `MEN-ESTIMATION-CALCULEE` (verrou), compteur, `ALR-006` sur les sous-tâches, `ALR-013` | « Ajouter une sous-tâche » → saisie rapide (variante) → `CreerSousTache.evaluer` ; si `CONFIRMATION_REQUISE` : boîte `CNF-AJOUT-SOUS-TACHE-TERMINEE` puis `executer` ; refus `ERR-032` (`role="alert"`, action « Reprendre la tâche » dans le message, rang 8) |
| Saisie d'une sous-tâche | ECR-007 I | `ALR-012`, `MEN-OBLIGATOIRE`, `ERR-021` à `ERR-023` | « Ajouter » |
| Détail d'une sous-tâche | ECR-007 J | `MEN-OBJECTIFS-HERITES` (verrou), tâche parente nommée ; pas d'action « Ajouter une sous-tâche » | — |
| Incohérence (rang 9) | ECR-007 H | `ALR-003` / `ALR-004` (`InconsistencyCard`), `MEN-INCOHERENCE` dans les listes | « Rouvrir la tâche » / « Reprendre la tâche » (principal), « Terminer la sous-tâche », « Abandonner la sous-tâche » |

## 5. Modèle de données et migrations
Registre `creation.tacheParenteId` (fixé à la création) ; `estimationInitiale` de la tâche parente conservée, ignorée tant qu'elle a des sous-tâches, réécrite à la suppression de la dernière (H-3). Aucune migration. Drive : **sous réserve R1**.

## 6. Règles et algorithmes
### 6.1 Création d'une sous-tâche
```text
evaluerCreationSousTache(c)(vue):
  1. P ← tâche active c.tacheParenteId, sinon ElementIntrouvable
  2. si P a une tâche parente : ActionNonDisponible(CREER_SOUS_TACHE)       // un seul niveau (CA-1)
  3. si P est ABANDONNEE : AjoutSousTacheATacheAbandonnee                   // ERR-032, avant la saisie : action refusée
  4. validerSaisieTache(c.saisie)                                           // ERR-020 à ERR-023
  5. si P est TERMINEE : CONFIRMATION_REQUISE AJOUT_SOUS_TACHE_TERMINEE(P)
  6. sinon : SANS_CONFIRMATION
deciderCreationSousTache(c)(vue, contexte): contrôles 1 à 4, puis
  modifications ← [ CREER_TACHE { id, creeLe: instant, valeurs: { intitulé, délai, estimation, tacheParenteId: P, objectifIds: [] },
                                  evenement: CREATION rang 0 apres { tacheParenteId, delai, estimation, objectifIds: [] } } ]
  si P est TERMINEE : modifications += ECRIRE_TACHE P cycleDeVie { A_FAIRE }
                       evenement REOUVERTURE rang 1, cause 0, avant { TERMINEE, dateFin }, apres { A_FAIRE }   // conséquence enregistrée
```
### 6.2 Estimation en vigueur (RG-023, ST-US-002 §4.1)
Sous-tâches présentes (non supprimées) : `Duree.calculee(Σ estimationInitiale des sous-tâches non abandonnées)`, `calculee = true` (0 h si toutes sont abandonnées, S16). Sinon : `estimationInitiale`. Exemple CA-4 : 1 h + 1 h 30 = 2 h 30 ; 1 h abandonnée → 1 h 30.

### 6.3 Suppression de la dernière sous-tâche (cas limite, Q-US-024-2 a, H-3)
```text
deciderSuppressionTache(c)(vue, contexte):
  T ← tâche active
  modifications ← [ SUPPRIMER T, evenement SUPPRESSION rang 0 ]
  si T a une tâche parente P et sousTachesDe(vue, P) = { T } :
     s ← estimationEnVigueur(vue, P).duree                                 // somme avant la suppression (T comprise si non abandonnée)
     modifications += ECRIRE_TACHE P estimationInitiale = s,
                      evenement MODIFICATION_ESTIMATION rang 1, cause 0, avant { s }, apres { s }   // même si avant = après (H-3)
```
S10 : 3 h saisies, Section A 1 h 30 → 1 h 30 recopiée, puis modifiable (2 h). S10b : seule sous-tâche abandonnée → 0 h recopiée ; une saisie de 0 h est refusée (`ERR-023`), 1 h acceptée.

### 6.4 Alerte d'une sous-tâche (RG-023)
`ALR-006` si le délai de la sous-tâche est strictement postérieur à celui de sa tâche parente (`alertesDelaiTache`, ST-US-002 §6.3) ; recalculée à chaque lecture.

### 6.5 Actions et informations
- `actionsTache` (ajout) : `CREER_SOUS_TACHE` si la tâche n'est pas une sous-tâche, quel que soit son état (sous une tâche abandonnée, l'action est proposée puis refusée, guide §6.6.8 `ERR-032`).
- `ALR-012` : présente dans le formulaire si la tâche n'a encore aucune sous-tâche ; `duree` = son estimation en vigueur.
- `ALR-013` : présente dans le détail si la tâche a au moins une sous-tâche à faire ; `n` = ce nombre.

### 6.6 Incohérence (RG-049, rang 9)
`incoherenceDe(vue, t)` : t sans tâche parente, t `TERMINEE` ou `ABANDONNEE`, et au moins une sous-tâche `A_FAIRE` → `{ etatParent, sousTachesAFaire }` ; sinon `undefined`. Jamais écrite ni corrigée ; elle disparaît quand la sous-tâche est terminée ou abandonnée, ou la tâche parente rouverte ou reprise. Tant qu'elle existe, les objectifs ne sont pas atteints (déjà assuré par `etatObjectif`, ST-US-001 §6.2, étape 3).

### 6.7 Ordre des sous-tâches dans le détail (guide v0.2.9 §5.8 e, réponse à Q-US-001-6)
Une seule liste, section `SEC-SOUS-TACHES` (« Sous-tâches » + compteur « {t} / {n} »), tous états confondus, triée par `comparerOrdreReference` (ST-US-001 §6.6 : délai croissant, création, intitulé, id). Une sous-tâche terminée ou abandonnée reste à sa place : la progression se lit sur la liste entière. Le même ordre s'applique aux sous-tâches affichées sous leur tâche parente dans le détail d'un objectif (ST-US-002 §6.6).

## 7. Intégration Google
Sans objet.

## 8. Gestion des erreurs
| # | Situation | Erreur | Comportement | Message | Test |
|---|---|---|---|---|---|
| 1 | Sous-tâche sous une tâche abandonnée | `AjoutSousTacheATacheAbandonnee` | Refus, aucune sous-tâche créée | `ERR-032` | UT-US-024-03 |
| 2 | Sous-tâche d'une sous-tâche (appel invalide) | `ActionNonDisponible` | Refus | Aucun (action non proposée) | UT-US-024-04 |
| 3 | Saisie incomplète | `SaisieInvalide` | Refus, cumul | `ERR-021` à `ERR-023` | UT-US-024-05 |
| 4 | Estimation d'une tâche parente | `EstimationCalculee` | Refus | `ERR-033` | UT-US-002-08 |

## 9. Patterns imposés
Commande avec confirmation (`CreerSousTache`) ; conséquence enregistrée dans la même décision (réouverture, recopie) avec `cause` ; incohérence **dérivée** (aucune écriture de réparation).

## 10. Sécurité
Sans objet particulier.

## 11. Exigences non fonctionnelles
Agrégations en O(nombre de sous-tâches).

## 12. Step definitions Cucumber
| # | Phrase Gherkin exacte | Mot-clé | Fichier | Nouveau / réutilisé | Rang | Implémentation |
|---|---|---|---|---|---|---|
| 1 | `l'utilisateur crée une sous-tâche de la tâche {string} :` + tableau (intitulé, délai, estimation) | Quand | `taches.steps.ts` | Nouveau | 6 | `CreerSousTache.evaluer` ; `CONFIRMATION_REQUISE` → commande en attente ; `SANS_CONFIRMATION` → `executer` ; refus → résultat mémorisé |
| 2 | `l'utilisateur crée une sous-tâche {string} de la tâche {string}, de délai {date}, estimée à {duree}` | Quand | idem | Nouveau | 6 | idem (forme d'une ligne, glossaire §5) |
| 3 | `l'utilisateur commence la saisie d'une sous-tâche de la tâche {string}` | Quand | idem | Nouveau | 6 | `construireFormulaireSousTache` mémorisé |
| 4 | `l'utilisateur est informé que l'estimation de {duree} de la tâche {string} sera remplacée par la somme de ses sous-tâches` | Alors | idem | Nouveau | 6 | `information.code = ALR-012`, durée égale |
| 5 | `la tâche {string} n'a aucune sous-tâche` | Alors | idem | Nouveau | 6 | `ResumeTache.sousTaches` absent |
| 6 | `l'utilisateur consulte le détail de la tâche {string}` | Quand | idem | Nouveau | 6 | `construireDetailTache` mémorisé |
| 7 | `le détail présente les sous-tâches :` + tableau (intitulé, délai, estimation, état, en retard) | Alors | idem | Nouveau | 6 | Lignes de `sousTaches` ; ordre non vérifié |
| 8 | `le détail indique {int} sous-tâche(s) terminée(s) sur {int} sous-tâche(s) non abandonnée(s)` | Alors | idem | Nouveau | 6 | `sousTaches.compteur` |
| 9 | `dans la liste des tâches, la tâche {string} indique {int} sous-tâche(s) terminée(s) sur {int} sous-tâche(s) non abandonnée(s)` | Alors | `liste-taches.steps.ts` | Nouveau | 6 | `LigneTache.compteurSousTaches` du dernier modèle de liste |
| 10 | `la tâche {string} porte une alerte de délai qui nomme la tâche parente {string}` | Alors | idem | Nouveau | 6 | Alerte `ALR-006` nommant la tâche |
| 11 | `l'action {string} n'est pas proposée pour la tâche {string}` ; `l'action {string} est proposée pour la tâche {string}` | Alors | idem | Nouveau | 6, étendu aux rangs 7 et 8 | Liste fermée : « créer une sous-tâche » (6), « terminer », « rouvrir » (7), « abandonner », « reprendre » (8) → `ActionTache` ; vérifie `construireDetailTache(…).actions` |
| 12 | `une confirmation est demandée, qui annonce la réouverture de la tâche {string}` | Alors | `refus.steps.ts` | Nouveau | 6, étendu au rang 7 | Code `CNF-AJOUT-SOUS-TACHE-TERMINEE` (rang 6) ou `CNF-ROUVRIR-SOUS-TACHE` (rang 7), élément = la tâche nommée |
| 13 | `l'opération est acceptée` | Alors | `refus.steps.ts` | Nouveau | 6 | Dernier résultat de l'appareil = `Succes` |
| 14 | `la tâche {string} existe avec :` (colonne « tâche parente ») | Alors | `taches.steps.ts` | Réutilisé, étendu | 6 | `ModeleVueDetailTache.tacheParente` |
| 15 | `les tâches suivantes :` (colonne « tâche parente ») | Étant donné | `construction-taches.ts` | Réutilisé, étendu | 6 | `CreerSousTache.executer` (ST-US-002 §12.1) |
| 16 | `que la tâche {string}, terminée, est signalée en incohérence avec sa sous-tâche à faire {string}` ; `…, abandonnée, …` | Étant donné | `taches.steps.ts` | Nouveau | 9 | Glossaire §1 : banc à deux appareils, la tâche parente a la sous-tâche terminée (ou abandonnée) ; sur le PC, la tâche parente est terminée (ou abandonnée) pendant que la sous-tâche est rouverte (ou reprise) sur le smartphone hors ligne ; échange ; l'étape vérifie que l'incohérence existe |
| 17 | `la tâche {string} porte la mention {string} pour sa sous-tâche {string}` ; `la tâche {string} ne porte plus la mention {string}` | Alors | idem | Nouveau | 9 | `LigneTache.incoherence` (`MEN-INCOHERENCE`) et `Incoherence.sousTachesAFaire` |
| 18 | Étapes de tâches, de suppression, de refus et d'historique | — | — | Réutilisées (ST-US-002) | 5 | — |
| 19 | `l'utilisateur termine …` ; `… rouvre …` ; `… abandonne … et confirme` ; `… reprend …` | Quand | — | Réutilisées (ST-US-003, ST-US-025) | 7, 8 | — |
| 20 | Étapes à deux appareils, `la liste des modifications non retenues contient :` | — | — | Réutilisées (ST-US-017, **sous réserve R1**) | 3, 9 | — |

**Scénarios exécutables par rang** : rang 6 : S01, S02, S03, S04, S06, S09, S10, S11, S12, S13, S14, S23 ; rang 7 : S07, S17, S19 ; rang 8 : S05, S08, S10b, S15, S16, S16b, S18 ; rang 9 : S20, S21, S22.

## 13. Tests unitaires fournis (E10)
| Id | Fichier | Élément | Cas testé | RG / CA | Échec |
|---|---|---|---|---|---|
| UT-US-024-01 | `tests/unitaires/objectifs-taches/domaine/decisions/creer-sous-tache.test.ts` | `evaluerCreationSousTache` | tâche parente à faire, saisie valide → `SANS_CONFIRMATION` | CA-1 | NI |
| UT-US-024-02 | idem | `evaluerCreationSousTache` | tâche parente terminée → `CONFIRMATION_REQUISE AJOUT_SOUS_TACHE_TERMINEE` | Cas limite (S17) | NI |
| UT-US-024-03 | idem | `evaluerCreationSousTache` | tâche parente abandonnée, saisie invalide → `AjoutSousTacheATacheAbandonnee` (prioritaire) | S18 | NI |
| UT-US-024-04 | idem | `evaluerCreationSousTache` | sous une sous-tâche → `ActionNonDisponible` | CA-1 | NI |
| UT-US-024-05 | idem | `evaluerCreationSousTache` | les quatre exemples de S03 → `ERR-021`, `ERR-022`, `ERR-023`, `ERR-023` | CA-2 | NI |
| UT-US-024-06 | idem | `deciderCreationSousTache` | `CREER_TACHE` avec `tacheParenteId`, sans objectif ; `CREATION apres { tacheParenteId, delai, estimation, objectifIds: [] }` | CA-1, CA-12 | NI |
| UT-US-024-07 | idem | `deciderCreationSousTache` | tâche parente terminée → `ECRIRE_TACHE cycleDeVie A_FAIRE` + `REOUVERTURE` (rang 1, cause 0) | S17, RG-050 c | NI |
| UT-US-024-08 | `…/domaine/estimation.test.ts` | `estimationEnVigueur` | 1 h + 1 h 30 → 2 h 30 ; 1 h abandonnée → 1 h 30 ; toutes abandonnées → 0 h ; `calculee` vrai | CA-4 | NI |
| UT-US-024-09 | idem | `estimationEnVigueur` | sous-tâche supprimée exclue ; plus de sous-tâche → estimation initiale | CA-9 | NI |
| UT-US-024-10 | `…/domaine/decisions/supprimer-tache.test.ts` | `deciderSuppressionTache` | dernière sous-tâche (1 h 30) : recopie 1 h 30 + `MODIFICATION_ESTIMATION` 1 h 30 → 1 h 30, cause = suppression | H-3, S10 | NI |
| UT-US-024-11 | idem | `deciderSuppressionTache` | dernière sous-tâche abandonnée → recopie 0 h | Q-US-024-2 a, S10b | NI |
| UT-US-024-12 | idem | `deciderSuppressionTache` | sous-tâche qui n'est pas la dernière → aucune recopie | CA-9 | NI |
| UT-US-024-13 | `…/domaine/alertes-delai.test.ts` | `alertesDelaiTache` | sous-tâche 2026-12-05 sous une tâche au 2026-11-30 → `TACHE_PARENTE` ; délai égal ou antérieur → aucune | CA-6 | NI |
| UT-US-024-14 | `…/domaine/actions.test.ts` | `actionsTache` | sous-tâche : pas de `CREER_SOUS_TACHE` ; tâche abandonnée sans tâche parente : `CREER_SOUS_TACHE` présent | CA-1 | NI |
| UT-US-024-15 | `…/presentation/formulaire-sous-tache.test.ts` | `construireFormulaireSousTache` | première sous-tâche d'une tâche de 3 h → `ALR-012` (180 min) ; sinon absent ; aucune présélection | CA-2, CA-5 | NI |
| UT-US-024-16 | `…/presentation/detail-tache.test.ts` | `construireDetailTache` | tâche parente : lignes, compteur 1 / 3 (S05), `MEN-ESTIMATION-CALCULEE`, `ALR-013` (n = 2) ; aucune sous-tâche à faire → pas d'`ALR-013` ; noms accessibles de la ligne et de la case « Terminer » (E11, RL-LOT-001-S4) | CA-3, CA-4, CA-8 | NI |
| UT-US-024-17 | idem | `construireDetailTache` | sous-tâche : `MEN-OBJECTIFS-HERITES`, objectifs de la tâche parente, tâche parente nommée | CA-7 | NI |
| UT-US-024-18 | `…/presentation/messages-de-refus.test.ts`, `confirmation.test.ts` | `messagesDeRefus`, `construireConfirmation` | `ERR-032` ; `CNF-AJOUT-SOUS-TACHE-TERMINEE` avec l'élément | S17, S18 | NI |
| UT-US-024-19 | `tests/unitaires/objectifs-taches/application/creer-sous-tache.test.ts` | `CreerSousTache.executer` | sous une tâche terminée (préparée par `Modification`) : sous-tâche créée, tâche parente à faire, deux entrées de journal | S17 | NI |
| UT-US-024-20 | `…/application/supprimer-tache.test.ts` | `SupprimerTache.executer` | dernière sous-tâche : estimation initiale de la tâche parente persistée, entrée d'historique | S10 | NI |
| UT-US-024-21 | `…/domaine/incoherence.test.ts` (rang 9) | `incoherenceDe` | terminée + sous-tâche à faire → `TERMINEE` ; abandonnée → `ABANDONNEE` ; résolue après fin, abandon de la sous-tâche ou réouverture de la tâche parente | RG-049 | NI |
| UT-US-024-22 | `…/presentation/liste-taches.test.ts`, `detail-tache.test.ts` (rang 9) | modèles de vue | `MEN-INCOHERENCE` sur la ligne ; `ALR-003` / `ALR-004` avec n dans le détail | RG-049 | NI |
| UT-US-024-23 | `…/presentation/detail-tache.test.ts` | `construireDetailTache` | section `SEC-SOUS-TACHES` avec compteur ; une seule liste, tous états, ordre de référence ; une sous-tâche terminée garde sa place | Guide v0.2.9 §5.8 e (Q-US-001-6) | NI |

Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-024`.

**Précisions de l'E10 (2026-10-22)** : `new CreerSousTache(service, generateur)` ; `construireFormulaireSousTache(detail: DetailTache)` ; les lignes de sous-tâches du détail sont de type `LigneSousTache` (`detail-tache.ts`). UT-US-024-21 et 22 (rang 9) sont écrits et rouges dès maintenant.

## 14. Tests attendus de Benjamin
Composants `LockedField` (lecture de l'explication, non focalisable en saisie), variante « sous-tâche » de `QuickAdd`, `InconsistencyCard` (rang 9) ; extension des tests de `construction-taches.ts` (colonne « tâche parente », estimation technique de 30 min).

## 15. Plan de réalisation
1. Décisions de création et de suppression (UT 01 à 07, 10 à 12) ; estimation, alertes, actions (UT 08, 09, 13, 14).
2. Cas d'usage (UT 19, 20) ; modèles de vue (UT 15 à 18).
3. Étapes du §12 (rang 6) ; extension de la construction des contextes ; scénarios du rang 6 et US-002 S13.
4. Écrans ; DoD.
5. Rang 9 (avec l'incrément 2 d'US-017) : `incoherence.ts`, modèles de vue, étapes 16 et 17 (UT 21, 22).

## 16. Dette, hypothèses et points ouverts
- **Concernée par Q-US-001-6 (e)** (ST-US-001 §16).
  - **Réponse de Steeve (E9, 2026-10-22, guide v0.2.9 §5.8) : (e) Oui** ; la proposition du §6.6.7 est retenue (une seule liste, tous états confondus, délai croissant, sans délai à la fin, création, intitulé). Code `SEC-SOUS-TACHES` créé. UT-US-024-23 peut être écrit en E10.
- **Hypothèses** : H-3 et H-7 appliquées.
- **Dette** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] CA, RG, fichiers, signatures, erreurs, patterns, étapes.
- [x] Tests du §13 en phase rouge (E10, 2026-10-22 : 32 cas) ; UT 21 et 22 rattachés au rang 9.
- [x] Q-US-001-6 (e) répondue (Steeve, guide v0.2.9 §5.8).
