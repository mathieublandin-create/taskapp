# ST-US-003 — Terminer ou rouvrir une tâche et suivre l'atteinte d'un objectif

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-003](../01-specification-fonctionnelle/user-stories/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.md), état du 2026-10-21 (validée, DEC-018 ; DEC-030 pour le cas limite RG-027) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **7** / 13 |
| Fichier `.feature` | [`tests/features/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.feature`](../../tests/features/US-003-terminer-ou-rouvrir-une-tache-et-suivre-l-atteinte-d-un-objectif.feature), 22 scénarios |
| RG couvertes | RG-001, RG-008, RG-023, RG-025, RG-026, RG-027 (cas limite DEC-030), RG-036 et RG-049 (via le rang 9), RG-045, RG-050, RG-053, RG-054 |
| DAT / ADR | DAT v0.10.1 (§4.2 « état d'une tâche », §6.1) ; ADR-003, ADR-011 |
| Maquettes | ECR-007 (A, G, H), ECR-002 L4, ECR-003, ECR-008 ; guide v0.2.8 §4.21, §5.5, §6.6.6, §6.6.10 |
| Q-US traitées | Q-US-003-1, Q-US-003-2, Q-US-002-1, Q-US-001-2, Q-US-025-2 (E8, DEC-030) |
| Prérequis | ST-US-024 (rang 6) |
| Version | 0.2 |
| Statut | **Prête pour E10** |
| Auteur | Anthony |
| Branche Git | `us/US-003-terminer-rouvrir` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-31 | Anthony | E13 du rang 6 (`docs/ceremonies/revue-code-LOT-001-rang6.md`, décision 5) : la case « Terminer » des lignes de sous-tâches (`section-sous-taches.tsx`, créée au rang 6, désactivée) est activée au rang 7 par `surTerminer` (§3 n° 7). |

## 1. Résumé technique
- **Ce que l'US change.** Fin d'une tâche (registre `cycleDeVie` : `TERMINEE`, date de fin = jour de Paris, instant de fin), refus `ERR-035` pour une tâche parente qui a des sous-tâches à faire, réouverture (avec confirmation `CNF-ROUVRIR-SOUS-TACHE` et réouverture de la tâche parente pour une sous-tâche d'une tâche terminée ; non proposée pour une sous-tâche d'une tâche abandonnée, DEC-030), actions proposées, date de fin et mention `MEN-HEURE-PARIS` dans le détail, journal (`FIN`, `REOUVERTURE`). L'atteinte d'un objectif est déjà calculée (ST-US-001 §6.2) : cette US la rend observable par les fins et réouvertures.
- **Hors périmètre** : abandon et reprise (ST-US-025) ; conflit fin/abandon entre appareils (S17) et incohérence (S18, S19) : rang 9 (ST-US-017 incrément 2, ST-US-024 §6.6) ; vélocité (US-010).
- **Prérequis** : ST-US-024.

## 2. Traçabilité
### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests | Composants | Rang |
|---|---|---|---|---|---|
| CA-1 fin, date de Paris | S01, S02, S03 | RG-026, RG-008, RG-053 | UT-US-003-01, 11 | `TerminerTache` | 7 |
| CA-2 jamais automatique | S04 | RG-026, RG-023 | UT-US-003-04 | `deciderFinTache` | 7 |
| Cas limite : déjà terminée | S05 | RG-026 | UT-US-003-02, 10 | `actionsTache` | 7 |
| CA-3 réouverture | S06 | RG-026 | UT-US-003-05, 08 | `RouvrirTache` | 7 |
| CA-4 à CA-7 atteinte | S07, S08, S09, S10, S11 | RG-025, RG-001 | ST-US-001 UT-US-001-05 à 10 ; UT-US-003-14 | `etatObjectif` | 7 (S07, S09 : 8) |
| CA-8 tâche parente | S12 | RG-023 | UT-US-003-03, 13 | `SousTachesRestantes` | 8 |
| CA-9 sous-tâche d'une tâche terminée | S13, S14 | RG-026, RG-023 | UT-US-003-06, 09, 15 | `RouvrirTache.evaluer` | 7 |
| CA-10 retard | S15 | RG-045 | UT-US-002-17 | `estTacheEnRetard` | 7 |
| CA-11 filtres | S16 | RG-026 | UT-US-002-20 ; UT-US-003-16 | `construireListeTaches` | 7 |
| CA-12 incohérence | S18, S19 | RG-049 | ST-US-024 UT-US-024-21, 22 | `incoherenceDe` | 9 |
| Cas limite : fin et abandon concurrents | S17 | RG-036 | ST-US-017 incrément 2 | Registre unique `cycleDeVie` | 9 |
| CA-13 historique | S20, S22 | RG-050 | UT-US-003-01, 08, 09, 15 | Décisions | 7 |
| RG-054 | S21 | RG-054 | UT-US-003-12 | `construireDetailTache` | 7 |
| Cas limite RG-027 (DEC-030) | US-025 S12b | RG-027 | UT-US-003-07, 10 | `evaluerReouverture` | 8 |

### 2.2 Règles de gestion → implémentation
| RG | Élément | Tests |
|---|---|---|
| RG-026 | `decisions/terminer-tache.ts`, `decisions/rouvrir-tache.ts` | UT-US-003-01 à 09 |
| RG-023 (fin de la tâche parente) | `deciderFinTache` (`ERR-035`) ; aucune fin automatique | UT-US-003-03, 04 |
| RG-027 (DEC-030) | `evaluerReouverture` : non proposée sous une tâche parente abandonnée | UT-US-003-07 |
| RG-008, RG-053 | `dateFin = contexte.jour` (jour de Paris de l'instant) | UT-US-003-01, 11 |
| RG-054 | `MEN-HEURE-PARIS` à côté de la date de fin | UT-US-003-12 |
| RG-050 | `FIN`, `REOUVERTURE` (et conséquence, `cause`) | UT-US-003-01, 08, 09, 15 |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/decisions/terminer-tache.ts` | Domaine | Créer | `deciderFinTache` |
| 2 | `src/objectifs-taches/domaine/decisions/rouvrir-tache.ts` | Domaine | Créer | `evaluerReouverture`, `deciderReouverture` |
| 3 | `src/objectifs-taches/domaine/etat-journal.ts` | Domaine | Créer | `etatJournalDe(cycleDeVie): EtatJournal` (partagé avec ST-US-025) |
| 4 | `src/objectifs-taches/domaine/refus.ts`, `confirmation.ts`, `actions.ts` | Domaine | Modifier | `SousTachesRestantes` ; `REOUVERTURE_SOUS_TACHE` ; `TERMINER`, `ROUVRIR` |
| 5 | `src/objectifs-taches/application/cas-usage/terminer-tache.ts`, `rouvrir-tache.ts` | Application | Créer | `TerminerTache`, `RouvrirTache` (`evaluer`, `executer`) |
| 6 | `src/objectifs-taches/presentation/modeles-de-vue/detail-tache.ts`, `ligne-tache.ts`, `confirmation.ts`, `messages-de-refus.ts` | Modèle de vue | Modifier | Date de fin et `MEN-HEURE-PARIS` ; `ETA-TACHE-TERMINEE` ; `CNF-ROUVRIR-SOUS-TACHE` ; `ERR-035` |
| 7 | `src/objectifs-taches/presentation/ui/composants/ligne-tache.tsx` (case « Terminer », `checkbox`), `ecrans/detail-tache.tsx` (bouton « Terminer la tâche », `aria-disabled` si sous-tâches restantes, « Rouvrir la tâche » ; v0.2 : propriété `surTerminer` de `SectionSousTaches` branchée sur `TerminerTache`), `composants/section-sous-taches.tsx` (case « Terminer » des lignes de sous-tâches, livrée désactivée au rang 6 faute de `surTerminer`), toast `TST-TERMINEE` avec « Annuler » | UI | Modifier | ECR-007 A, G ; ECR-002 L4 |
| 8 | `src/composition/web.ts`, `src/objectifs-taches/index.ts` | Composition | Modifier | Enregistrement |
| 9 | `tests/steps/objectifs-taches/taches.steps.ts`, `objectifs.steps.ts`, `refus.steps.ts` ; `tests/support/construction-taches.ts` | Test | Modifier | §12 ; état « terminée » et colonne « date de fin » des tableaux |

## 4. Interfaces et signatures
### 4.1 Domaine
```ts
// refus.ts (ajout)
  | { readonly type: 'SousTachesRestantes'; readonly nombre: number }        // ERR-035 (n variable)
// confirmation.ts (ajout)
  | { readonly type: 'REOUVERTURE_SOUS_TACHE'; readonly tacheParenteId: IdTache; readonly intitule: string }   // CNF-ROUVRIR-SOUS-TACHE
// etat-journal.ts
export const etatJournalDe = (c: CycleDeVie): EtatJournal => …;  // A_FAIRE → { A_FAIRE } ; TERMINEE → { TERMINEE, dateFin } ; ABANDONNEE → { ABANDONNEE, dateAbandon }
// decisions
export const deciderFinTache = (c: { readonly tacheId: IdTache }) => (vue: VueMetier, contexte: ContexteDecision) => Resultat<Decision<void>, RefusMetier>;
export const evaluerReouverture = (c: { readonly tacheId: IdTache }) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderReouverture = (c: { readonly tacheId: IdTache }) => (vue: VueMetier, contexte: ContexteDecision) => Resultat<Decision<void>, RefusMetier>;
```
### 4.2 Application
| Cas d'usage | Entrée | Sortie | Erreurs | Effets |
|---|---|---|---|---|
| `TerminerTache.executer` | `{ tacheId }` | `void` | `ElementIntrouvable`, `ActionNonDisponible('TERMINER')`, `SousTachesRestantes` | `ECRIRE_TACHE cycleDeVie TERMINEE` + `FIN` |
| `RouvrirTache.evaluer` | `{ tacheId }` | `Evaluation` | `ElementIntrouvable`, `ActionNonDisponible('ROUVRIR')` | Aucun |
| `RouvrirTache.executer` | `{ tacheId }` | `void` | idem | `ECRIRE_TACHE cycleDeVie A_FAIRE` + `REOUVERTURE` (+ tâche parente terminée : idem, `cause`) |

### 4.3 Ports, 4.4 Adaptateurs
Sans objet.

### 4.5 Présentation
```ts
// ModeleVueDetailTache (ajout)
readonly dateFin?: { readonly date: DateCalendaire; readonly libelle: string;                        // « Terminée le {date} » (ETA-TACHE-TERMINEE)
                     readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string } }; // présente ssi fuseau de l'appareil ≠ Europe/Paris (guide §6.6.10)
```
| Écran | Maquette | Codes | Actions → cas d'usage |
|---|---|---|---|
| Liste « Tâches » | ECR-002 L1, L4 | case « Terminer » (`checkbox`, nom « Terminer X ») ; `ETA-TACHE-TERMINEE` ; en liste, « Terminée » sans date | case → `TerminerTache` ; toast `TST-TERMINEE` « Annuler » → `RouvrirTache.executer` (Q-US-003-1 a : fin puis réouverture au journal) ; la ligne reste 3 s puis quitte le filtre « À faire » |
| Détail d'une tâche | ECR-007 A, G | « Terminée le … » + `MEN-HEURE-PARIS` ; `ALR-013` / `ERR-035` ; `CNF-ROUVRIR-SOUS-TACHE` | « Terminer la tâche » (refus annoncé `role="alert"` si sous-tâches restantes) ; « Rouvrir la tâche » → `RouvrirTache.evaluer`, boîte si demandée, puis `executer` |

## 5. Modèle de données et migrations
Registre `cycleDeVie` (socle §4.1.3) : `{ TERMINEE, dateFin, instantFin }` ou `{ A_FAIRE }`. La date de fin précédente est conservée dans le journal (`REOUVERTURE.avant`). Aucune migration. Drive : **sous réserve R1**.

## 6. Règles et algorithmes
### 6.1 Fin (RG-026, RG-023 ; US-003 CA-1, CA-2, CA-8)
```text
deciderFinTache(c)(vue, contexte):
  1. T ← tâche active, sinon ElementIntrouvable
  2. si T.etat ≠ A_FAIRE : ActionNonDisponible(TERMINER)
  3. n ← |{ s ∈ sousTachesDe(vue, T) | s.etat = A_FAIRE }| ; si n > 0 : SousTachesRestantes(n)       // ERR-035
  4. modifications ← [ ECRIRE_TACHE T cycleDeVie { TERMINEE, dateFin: contexte.jour, instantFin: contexte.instant },
                       evenement FIN rang 0, avant { A_FAIRE }, apres { TERMINEE, dateFin } ]
```
Aucune écriture sur la tâche parente ni sur les objectifs : l'atteinte est dérivée (CA-2, CA-6).

### 6.2 Réouverture (RG-026 ; CA-3, CA-9 ; RG-027 complétée par DEC-030)
```text
evaluerReouverture(c)(vue):
  1. T ← tâche active, sinon ElementIntrouvable
  2. si T.etat ≠ TERMINEE : ActionNonDisponible(ROUVRIR)
  3. si T a une tâche parente P et P.etat = ABANDONNEE : ActionNonDisponible(ROUVRIR)                 // DEC-030 (US-025 CA-12)
  4. si T a une tâche parente P et P.etat = TERMINEE : CONFIRMATION_REQUISE REOUVERTURE_SOUS_TACHE(P)
  5. sinon : SANS_CONFIRMATION
deciderReouverture(c)(vue, contexte): contrôles 1 à 3, puis
  modifications ← [ ECRIRE_TACHE T cycleDeVie { A_FAIRE }, evenement REOUVERTURE rang 0, avant etatJournalDe(T), apres { A_FAIRE } ]
  si P existe et P.etat = TERMINEE :
     modifications += ECRIRE_TACHE P cycleDeVie { A_FAIRE }, evenement REOUVERTURE rang 1, cause 0, avant etatJournalDe(P), apres { A_FAIRE }
```
### 6.3 Actions (ajout à `actionsTache`)
`TERMINER` si `A_FAIRE` (y compris une tâche parente qui a des sous-tâches à faire : l'action est proposée, puis refusée avec `ERR-035`, ECR-007 A) ; `ROUVRIR` si `TERMINEE`, sauf sous-tâche d'une tâche parente abandonnée.

### 6.4 Dates et fuseau (RG-008, RG-053, RG-054 ; PT-16)
`dateFin = jourDeReference(Horloge.maintenant())`, persistée (jamais recalculée). Exemples (S03) : 2026-10-25 01:59, 02:30 (première occurrence), 23:59 à Paris → 2026-10-25 ; 2026-10-26 00:00 → 2026-10-26 ; appareil en UTC, 2026-10-24 22:30 → 2026-10-25 ; 2026-10-25 22:30 → 2026-10-25 ; 2026-10-25 23:30 → 2026-10-26. New York, 2026-11-10 23:00 → 2026-11-11 (S02). La date affichée est toujours le jour de Paris ; `MEN-HEURE-PARIS` l'accompagne si le fuseau de l'appareil diffère, jamais un délai (S21).

## 7. Intégration Google
Sans objet.

## 8. Gestion des erreurs
| # | Situation | Erreur | Comportement | Message | Test |
|---|---|---|---|---|---|
| 1 | Tâche parente avec n sous-tâches à faire | `SousTachesRestantes(n)` | Refus, état inchangé | `ERR-035` (n) ; `ALR-013` affiché en permanence | UT-US-003-03, 13 |
| 2 | Terminer une tâche non « à faire », rouvrir une tâche non terminée ou une sous-tâche d'une tâche abandonnée | `ActionNonDisponible` | Refus | Aucun (action non proposée) | UT-US-003-02, 05, 07 |

## 9. Patterns imposés
Registre unique `cycleDeVie` (DAT §4.2) : une seule écriture par changement d'état ; commande avec confirmation (`RouvrirTache`) ; conséquence enregistrée (réouverture de la tâche parente) avec `cause`.

## 10. Sécurité
Sans objet particulier.

## 11. Exigences non fonctionnelles
Recalcul de l'atteinte en moins de 100 ms pour 5 000 tâches (impacts architecture d'US-003) : test indicatif (§14).

## 12. Step definitions Cucumber
| # | Phrase Gherkin exacte | Mot-clé | Fichier | Nouveau / réutilisé | Rang | Implémentation |
|---|---|---|---|---|---|---|
| 1 | `l'utilisateur termine la tâche {string}` | Quand | `taches.steps.ts` | Nouveau | 7 | `TerminerTache` ; résultat mémorisé (un refus n'échoue pas l'étape) |
| 2 | `l'utilisateur rouvre la tâche {string}` | Quand | idem | Nouveau | 7 | `RouvrirTache.evaluer` ; `CONFIRMATION_REQUISE` → commande en attente ; sinon `executer` |
| 3 | `l'utilisateur rouvre la tâche {string} et renonce` | Quand | idem | Nouveau | 7 | `evaluer` (doit demander une confirmation), puis oubli |
| 4 | `la tâche {string} est {string} avec la date de fin {date}` | Alors | idem | Nouveau | 7 | État « terminée » et `dateFin` du détail |
| 5 | `la tâche {string} n'a pas de date de fin` | Alors | idem | Nouveau | 7 | `dateFin` absent |
| 6 | `l'état de la tâche {string} est {string}` | Alors | idem | Nouveau | 7 | « à faire », « terminée », « abandonnée » ↔ `ETA-TACHE-*` |
| 7 | `la date de fin de la tâche {string} est accompagnée de la mention {string}` ; `… n'est pas accompagnée …` | Alors | idem | Nouveau | 7 | `dateFin.mentionHeureParis` présente ou absente |
| 8 | `le délai de la tâche {string} n'est jamais accompagné de la mention {string}` | Alors | idem | Nouveau | 7 | Aucun `MEN-HEURE-PARIS` dans `delai` du détail ni dans la ligne de la liste |
| 9 | `l'objectif {string} a un sous-objectif absent` ; `… atteint` ; `… en cours` ; `… à décliner en tâches` | Étant donné | `objectifs.steps.ts` | Nouveau | 7 | Glossaire §1 : sous-objectif « Sous-objectif de <objectif> », sans délai, avec respectivement rien, 1 tâche terminée, 1 tâche à faire, aucune tâche |
| 10 | `l'action {string} n'est pas proposée pour la tâche {string}` (« terminer », « rouvrir ») ; `l'action {string} est proposée …` | Alors | `liste-taches.steps.ts` | Réutilisé (ST-US-024), étendu | 7 | `TERMINER`, `ROUVRIR` |
| 11 | `une confirmation est demandée, qui annonce la réouverture de la tâche {string}` | Alors | `refus.steps.ts` | Réutilisé (ST-US-024), étendu | 7 | `CNF-ROUVRIR-SOUS-TACHE` |
| 12 | `les tâches suivantes :` (état « terminée », colonne « date de fin ») ; `l'objectif {string} a … {int} tâche(s) terminée(s) …` | Étant donné | `construction-taches.ts` | Réutilisés, étendus | 7 | `TerminerTache.executer` (ST-US-002 §12.1) |
| 13 | `l'action est refusée avec le motif {string}` ; `l'état de l'objectif {string} est {string}` ; `l'historique …` ; `l'utilisateur filtre …` ; `la liste des tâches contient exactement …` | — | — | Réutilisés (ST-US-001, 002, 023) | 2 à 5 | — |
| 14 | `l'utilisateur confirme` | Quand | `confirmations.steps.ts` | Réutilisé (socle) | 0 | — |
| 15 | Étapes du rang 9 : deux appareils, `la liste des modifications non retenues contient :`, incohérence | — | — | Réutilisés (ST-US-017, ST-US-024) | 9 | — |

**Scénarios exécutables par rang** : rang 7 : S01 à S06, S08, S10, S11, S13, S14, S15, S16, S20, S21, S22 ; rang 8 : S07, S09, S12 ; rang 9 : S17, S18, S19.

## 13. Tests unitaires fournis (E10)
| Id | Fichier | Élément | Cas testé | RG / CA | Échec |
|---|---|---|---|---|---|
| UT-US-003-01 | `tests/unitaires/objectifs-taches/domaine/decisions/terminer-tache.test.ts` | `deciderFinTache` | à faire → `cycleDeVie { TERMINEE, dateFin = jour, instantFin = instant }` ; `FIN avant { A_FAIRE } apres { TERMINEE, dateFin }` | CA-1, CA-13 | NI |
| UT-US-003-02 | idem | `deciderFinTache` | déjà terminée ou abandonnée → `ActionNonDisponible('TERMINER')` | S05 | NI |
| UT-US-003-03 | idem | `deciderFinTache` | tâche parente : 1 terminée, 2 à faire, 1 abandonnée → `SousTachesRestantes(2)` | CA-8 | NI |
| UT-US-003-04 | idem | `deciderFinTache` | sous-tâches toutes terminées ou abandonnées → fin acceptée ; terminer la dernière sous-tâche ne produit aucune écriture sur la tâche parente | CA-2 | NI |
| UT-US-003-05 | `…/domaine/decisions/rouvrir-tache.test.ts` | `evaluerReouverture` | tâche terminée simple → `SANS_CONFIRMATION` ; à faire → `ActionNonDisponible('ROUVRIR')` | CA-3 | NI |
| UT-US-003-06 | idem | `evaluerReouverture` | sous-tâche d'une tâche terminée → `CONFIRMATION_REQUISE REOUVERTURE_SOUS_TACHE` | CA-9 | NI |
| UT-US-003-07 | idem | `evaluerReouverture` | sous-tâche terminée d'une tâche abandonnée → `ActionNonDisponible('ROUVRIR')` | RG-027, DEC-030 | NI |
| UT-US-003-08 | idem | `deciderReouverture` | simple : `A_FAIRE`, `REOUVERTURE avant { TERMINEE, dateFin } apres { A_FAIRE }` | CA-3, CA-13 | NI |
| UT-US-003-09 | idem | `deciderReouverture` | sous-tâche d'une tâche terminée : deux écritures, deux événements, le second avec `cause` = premier | CA-9, S22 | NI |
| UT-US-003-10 | `…/domaine/actions.test.ts` | `actionsTache` | `TERMINER` ssi à faire ; `ROUVRIR` ssi terminée et pas sous une tâche abandonnée | S05, S12b | NI |
| UT-US-003-11 | `tests/unitaires/objectifs-taches/application/terminer-tache.test.ts` | `TerminerTache` | les sept exemples de S03 et l'exemple de S02 : date de fin attendue (`HorlogeSimulee`) | CA-1, PT-16 | NI |
| UT-US-003-12 | `…/presentation/detail-tache.test.ts` | `construireDetailTache` | `dateFin` avec `MEN-HEURE-PARIS` pour `America/New_York`, sans pour `Europe/Paris` ; jamais sur le délai | RG-054, S21 | NI |
| UT-US-003-13 | `…/presentation/messages-de-refus.test.ts`, `confirmation.test.ts` | modèles de vue | `SousTachesRestantes(2)` → `ERR-035`, n = 2 ; `REOUVERTURE_SOUS_TACHE` → `CNF-ROUVRIR-SOUS-TACHE` | CA-8, CA-9 | NI |
| UT-US-003-14 | `…/application/terminer-tache.test.ts` | `TerminerTache` puis `ConsulterObjectifs` | tâche rattachée à deux objectifs : les deux deviennent « atteint » | CA-7 | NI |
| UT-US-003-15 | `…/application/rouvrir-tache.test.ts` | `RouvrirTache.executer` | sous-tâche d'une tâche terminée : les deux à faire ; historique de la tâche parente terminé par `REOUVERTURE` | CA-9, S22 | NI |
| UT-US-003-16 | `…/presentation/liste-taches.test.ts` | `construireListeTaches` | filtre `TERMINEE` : `ETA-TACHE-TERMINEE`, aucune date dans la ligne | CA-11 | NI |

Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-003`.

## 14. Tests attendus de Benjamin
Composants : case « Terminer » (`checkbox`, cible 44 px, annonce `role="status"`), toast `TST-TERMINEE` et « Annuler », bouton « Terminer la tâche » en `aria-disabled` avec `ALR-013` ; performance indicative de `ConsulterObjectifs` (5 000 tâches).

## 15. Plan de réalisation
1. Domaine (UT 01 à 10). 2. Cas d'usage (UT 11, 14, 15). 3. Modèles de vue (UT 12, 13, 16). 4. Étapes du §12 ; scénarios du rang 7, dont les scénarios différés d'US-001 (S12, S17), d'US-002 (S11, S20, S21), d'US-023 (S13, S14), d'US-024 (S07, S17, S19). 5. Écrans ; DoD.

## 16. Dette, hypothèses et points ouverts
- **Points ouverts** : aucun. Le cas « reprendre une sous-tâche abandonnée sous une tâche parente terminée » relève de `ReprendreTache` (Q-US-025-3, ST-US-025).
- **Hypothèses** : H-5, H-7 appliquées.
- **Dette** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] CA, RG, fichiers, signatures, erreurs, patterns, étapes, cas temporels.
- [x] Tests du §13 en phase rouge (E10, 2026-10-22 : 25 cas).
