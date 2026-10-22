# ST-US-025 — Abandonner une tâche

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-025](../01-specification-fonctionnelle/user-stories/US-025-abandonner-une-tache.md), état du 2026-10-21 (validée, DEC-018 ; complément DEC-030) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **8** / 13 |
| Fichier `.feature` | [`tests/features/US-025-abandonner-une-tache.feature`](../../tests/features/US-025-abandonner-une-tache.feature), 19 scénarios |
| RG couvertes | RG-008, RG-023, RG-025, RG-027, RG-036 et RG-049 (via le rang 9), RG-045, RG-050, RG-053, RG-054 |
| DAT / ADR | DAT v0.10.1 (§4.2 « état d'une tâche », §6.1) ; ADR-003, ADR-011 |
| Maquettes | ECR-007 (C, D, D2, F), ECR-002 (filtre « Abandonnées »), ECR-003 ; guide v0.2.8 §4.12, §6.6.4, §6.6.7 |
| Q-US traitées | Q-US-025-1, Q-US-025-2 (DEC-030), Q-US-001-2 (E8) ; **Q-US-025-3 posée (§16)** |
| Prérequis | ST-US-003 (rang 7) |
| Version | 0.1 |
| Statut | **Bloquée (partiellement) par Q-US-025-3** : seul le cas « reprendre une sous-tâche abandonnée dont la tâche parente est terminée » attend la réponse (§6.2, étape 4 ; UT-US-025-18) ; le reste est prêt pour E10 |
| Auteur | Anthony |
| Branche Git | `us/US-025-abandon` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |

## 1. Résumé technique
- **Ce que l'US change.** Abandon d'une tâche, toujours confirmé (`CNF-ABANDON-TACHE`, ou `CNF-ABANDON-TACHE-CASCADE` qui annonce le nombre de sous-tâches à faire abandonnées avec elle), date d'abandon = jour de Paris, cascade marquée par `abandonParCascade` (identifiant de l'entrée `ABANDON` de la tâche parente), reprise d'une tâche et des seules sous-tâches abandonnées avec elle, actions proposées (CA-8, DEC-030), affichage des sous-tâches d'une tâche abandonnée (`ETA-SOUS-TACHE-*`), journal (`ABANDON`, `REPRISE`, conséquences avec `cause`).
- **Hors périmètre** : conflits et incohérences entre appareils (S14, S15, S16 ; rang 9) ; graphique du backlog (US-012) ; abandon d'un objectif (exclu).
- **Prérequis** : ST-US-003 (registre `cycleDeVie`, `etatJournalDe`, `RouvrirTache`).

## 2. Traçabilité
### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests | Composants | Rang |
|---|---|---|---|---|---|
| CA-1 abandon confirmé, date de Paris | S01, S02, S03 | RG-027, RG-008, RG-053 | UT-US-025-01, 04, 13, 14 | `AbandonnerTache` | 8 |
| CA-2 sortie des tâches à faire | S04 | RG-027 | UT-US-025-16 | `construireListeTaches` | 8 |
| CA-3 pas de date de fin, pas en retard | S05 | RG-027, RG-045 | UT-US-025-15 ; UT-US-002-17 | Registre unique | 8 |
| Cas limite : tâche terminée | S06 | RG-027 | UT-US-025-03, 10 | `actionsTache` | 8 |
| CA-4 objectifs recalculés | S07 | RG-025 | UT-US-025-12 | `etatObjectif` | 8 |
| CA-5 reprise | S08 | RG-027, RG-025, RG-045 | UT-US-025-07, 09, 15 | `ReprendreTache` | 8 |
| CA-6 cascade | S09, S10 | RG-027, RG-023 | UT-US-025-02, 05, 14 | `deciderAbandon` | 8 |
| CA-7 reprise de la cascade | S11 | RG-027 | UT-US-025-09 | `deciderReprise` | 8 |
| CA-8 reprise d'une sous-tâche non proposée | S12 | RG-027 | UT-US-025-08, 10 | `evaluerReprise` | 8 |
| CA-9 sous-tâche seule | S13 | RG-023 | UT-US-025-06, 11 | `estimationEnVigueur`, `deciderFinTache` | 8 |
| CA-10 incohérence | S15, S16 | RG-049 | ST-US-024 UT-US-024-21, 22 | `incoherenceDe` | 9 |
| CA-11 historique | S17, S18 | RG-050 | UT-US-025-04, 05, 09, 17 | Décisions | 8 |
| CA-12 réouverture sous une tâche abandonnée (DEC-030) | S12b | RG-027 | ST-US-003 UT-US-003-07, 10 | `evaluerReouverture` | 8 |
| Cas limite RG-036 | S14 | RG-036 | ST-US-017 incrément 2 | — | 9 |

### 2.2 Règles de gestion → implémentation
| RG | Élément | Tests |
|---|---|---|
| RG-027 (abandon, reprise, cascade, CA-8, DEC-030) | `decisions/abandonner-tache.ts`, `decisions/reprendre-tache.ts`, `actionsTache` | UT-US-025-01 à 10 |
| RG-025 | `etatObjectif` (tâches abandonnées ignorées, ST-US-001) | UT-US-025-12 |
| RG-008, RG-053, RG-054 | `dateAbandon = contexte.jour` ; `MEN-HEURE-PARIS` | UT-US-025-13, 15 |
| RG-050 | `ABANDON`, `REPRISE`, conséquences avec `cause` | UT-US-025-04, 05, 09, 17 |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/decisions/abandonner-tache.ts` | Domaine | Créer | `evaluerAbandon`, `deciderAbandon` |
| 2 | `src/objectifs-taches/domaine/decisions/reprendre-tache.ts` | Domaine | Créer | `evaluerReprise`, `deciderReprise` |
| 3 | `src/objectifs-taches/domaine/confirmation.ts`, `actions.ts` | Domaine | Modifier | `ABANDON_TACHE` ; `ABANDONNER`, `REPRENDRE` |
| 4 | `src/objectifs-taches/application/cas-usage/abandonner-tache.ts`, `reprendre-tache.ts` | Application | Créer | `AbandonnerTache` (`evaluer`, `executer`), `ReprendreTache` (`evaluer`, `executer`) |
| 5 | `src/objectifs-taches/presentation/modeles-de-vue/detail-tache.ts`, `ligne-tache.ts`, `confirmation.ts` | Modèle de vue | Modifier | Date d'abandon, `ETA-TACHE-ABANDONNEE`, `ETA-SOUS-TACHE-*`, `CNF-ABANDON-TACHE`, `CNF-ABANDON-TACHE-CASCADE` |
| 6 | `src/objectifs-taches/presentation/ui/ecrans/detail-tache.tsx` (menu « … » : « Abandonner la tâche… » ; tâche abandonnée : « Reprendre la tâche »), `composants/ligne-tache.tsx` (icône cercle barré) | UI | Modifier | ECR-007 C, D, D2, F |
| 7 | `src/composition/web.ts`, `src/objectifs-taches/index.ts` | Composition | Modifier | Enregistrement |
| 8 | `tests/steps/objectifs-taches/taches.steps.ts`, `refus.steps.ts` ; `tests/support/construction-taches.ts` | Test | Modifier | §12 ; état « abandonnée » et colonne « date d'abandon » |

## 4. Interfaces et signatures
### 4.1 Domaine
```ts
// confirmation.ts (ajout)
  | { readonly type: 'ABANDON_TACHE'; readonly tacheId: IdTache; readonly intitule: string; readonly sousTachesAbandonnees: number }
// decisions
export const evaluerAbandon = (c: { readonly tacheId: IdTache }) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderAbandon = (c: { readonly tacheId: IdTache }) => (vue: VueMetier, contexte: ContexteDecision) => Resultat<Decision<void>, RefusMetier>;
export const evaluerReprise = (c: { readonly tacheId: IdTache }) => (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;
export const deciderReprise = (c: { readonly tacheId: IdTache }) => (vue: VueMetier, contexte: ContexteDecision) => Resultat<Decision<void>, RefusMetier>;
```
### 4.2 Application
| Cas d'usage | Entrée | Sortie | Erreurs | Effets |
|---|---|---|---|---|
| `AbandonnerTache.evaluer` | `{ tacheId }` | `Evaluation` (toujours `CONFIRMATION_REQUISE`, Q-ERG-13) | `ElementIntrouvable`, `ActionNonDisponible('ABANDONNER')` | Aucun |
| `AbandonnerTache.executer` | `{ tacheId }` | `void` | idem | `ECRIRE_TACHE cycleDeVie ABANDONNEE` (tâche et sous-tâches à faire) + `ABANDON` |
| `ReprendreTache.evaluer` | `{ tacheId }` | `Evaluation` | `ElementIntrouvable`, `ActionNonDisponible('REPRENDRE')` | Aucun |
| `ReprendreTache.executer` | `{ tacheId }` | `void` | idem | `ECRIRE_TACHE cycleDeVie A_FAIRE` (tâche et sous-tâches abandonnées avec elle) + `REPRISE` |

### 4.3 Ports, 4.4 Adaptateurs
Sans objet.

### 4.5 Présentation
```ts
// ModeleVueDetailTache (ajouts)
readonly dateAbandon?: { readonly date: DateCalendaire; readonly libelle: string;                   // « Abandonnée le {date} » (ETA-TACHE-ABANDONNEE)
                         readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string } };
// lignes de sous-tâches d'une tâche parente abandonnée (ajout)
readonly etiquette?: { readonly code: 'ETA-SOUS-TACHE-ABANDONNEE-AVEC' | 'ETA-SOUS-TACHE-ABANDONNEE-AVANT' | 'ETA-SOUS-TACHE-TERMINEE-AVANT'; readonly libelle: string };
// construireConfirmation(ABANDON_TACHE) : n = 0 → CNF-ABANDON-TACHE ; n > 0 → CNF-ABANDON-TACHE-CASCADE (variables element, n)
```
| Écran | Maquette | Codes | Actions → cas d'usage |
|---|---|---|---|
| Détail, menu « … » | ECR-007 C | — | « Abandonner la tâche… » (jamais par balayage) → `AbandonnerTache.evaluer` → boîte → `executer` |
| Confirmation | ECR-007 D, D2 | `CNF-ABANDON-TACHE`, `CNF-ABANDON-TACHE-CASCADE` (bouton normal, non rouge ; « Annuler » focalisé) | « Abandonner » → `executer` |
| Tâche abandonnée | ECR-007 F | `ETA-TACHE-ABANDONNEE` (« Abandonnée le … » + `MEN-HEURE-PARIS`), étiquettes `ETA-SOUS-TACHE-*`, aucune case « Terminer » | « Reprendre la tâche » → `ReprendreTache.evaluer` puis `executer` |
| Liste | ECR-002 | filtre « Abandonnées », `EVD-FILTRE-ABANDONNEES` | — |

## 5. Modèle de données et migrations
Registre `cycleDeVie` `{ ABANDONNEE, dateAbandon, instantAbandon, evenementAbandon, abandonParCascade? }` (socle §4.1.3). Aucune migration. Drive : **sous réserve R1**.

## 6. Règles et algorithmes
### 6.1 Abandon (RG-027 ; CA-1, CA-6, CA-9)
```text
evaluerAbandon(c)(vue):
  1. T ← tâche active, sinon ElementIntrouvable
  2. si T.etat ≠ A_FAIRE : ActionNonDisponible(ABANDONNER)                 // tâche terminée : « n'est pas proposée » (S06)
  3. n ← |{ s ∈ sousTachesDe(vue, T) | s.etat = A_FAIRE }|
  4. CONFIRMATION_REQUISE ABANDON_TACHE(T, n)                               // toujours (Q-ERG-13)
deciderAbandon(c)(vue, contexte): contrôles 1 et 2, puis
  e0 ← idEvenement(contexte.operation, 0)
  modifications ← [ ECRIRE_TACHE T cycleDeVie { ABANDONNEE, dateAbandon: jour, instantAbandon: instant, evenementAbandon: e0 },
                    evenement ABANDON rang 0, avant etatJournalDe(T), apres { ABANDONNEE, dateAbandon } ]
  pour chaque sous-tâche S de T à faire, par creeLe croissant puis id (rang k = 1, 2…) :
    modifications += ECRIRE_TACHE S cycleDeVie { ABANDONNEE, dateAbandon, instantAbandon, evenementAbandon: idEvenement(operation, k), abandonParCascade: e0 },
                     evenement ABANDON rang k, cause 0, avant { A_FAIRE }, apres { ABANDONNEE, dateAbandon }
  (les sous-tâches terminées ou déjà abandonnées ne sont pas écrites)
```
Une sous-tâche abandonnée seule n'a pas de sous-tâche : aucune cascade, `abandonParCascade` absent. L'estimation de sa tâche parente est recalculée à la lecture (CA-9).

### 6.2 Reprise (RG-027 ; CA-5, CA-7, CA-8)
```text
evaluerReprise(c)(vue):
  1. T ← tâche active, sinon ElementIntrouvable
  2. si T.etat ≠ ABANDONNEE : ActionNonDisponible(REPRENDRE)
  3. si T a une tâche parente P et P.etat = ABANDONNEE : ActionNonDisponible(REPRENDRE)          // CA-8
  4. si T a une tâche parente P et P.etat = TERMINEE : selon la réponse à Q-US-025-3            // en attente
  5. sinon : SANS_CONFIRMATION
deciderReprise(c)(vue, contexte): contrôles 1 à 4, puis
  modifications ← [ ECRIRE_TACHE T cycleDeVie { A_FAIRE }, evenement REPRISE rang 0, avant etatJournalDe(T), apres { A_FAIRE } ]
  pour chaque sous-tâche S de T telle que S.etat = ABANDONNEE et S.abandonParCascade = T.evenementAbandon (rang k = 1, 2…) :
    modifications += ECRIRE_TACHE S cycleDeVie { A_FAIRE }, evenement REPRISE rang k, cause 0, avant etatJournalDe(S), apres { A_FAIRE }
```
S11 : « Section C » abandonnée seule avant l'abandon de « Chapitre 1 » n'a pas `abandonParCascade` égal : elle reste abandonnée ; « Section B » est reprise ; « Section A », terminée, reste terminée.

### 6.3 Actions (ajout à `actionsTache`)
`ABANDONNER` si `A_FAIRE` ; `REPRENDRE` si `ABANDONNEE`, sauf sous-tâche d'une tâche parente abandonnée (et, selon Q-US-025-3, sous-tâche d'une tâche parente terminée).

### 6.4 Étiquettes des sous-tâches d'une tâche parente abandonnée (ECR-007 F, guide §6.6.4)
| Sous-tâche S (tâche parente P abandonnée) | Étiquette |
|---|---|
| `ABANDONNEE` et `S.abandonParCascade = P.evenementAbandon` | `ETA-SOUS-TACHE-ABANDONNEE-AVEC` |
| `ABANDONNEE`, autre cas | `ETA-SOUS-TACHE-ABANDONNEE-AVANT` |
| `TERMINEE` | `ETA-SOUS-TACHE-TERMINEE-AVANT` |
| `A_FAIRE` (incohérence, rang 9) | aucune ; carte `ALR-004` |

### 6.5 Dates (RG-008, RG-053, RG-054)
`dateAbandon = jourDeReference(Horloge.maintenant())`. Exemples (S03) : Paris 2026-10-21 10:00 → 2026-10-21 ; New York 2026-11-10 23:00 → 2026-11-11 ; Paris 2026-10-25 02:30 → 2026-10-25 ; UTC 2026-10-25 22:30 → 2026-10-25 ; UTC 23:30 → 2026-10-26. `MEN-HEURE-PARIS` à côté de « Abandonnée le … » si le fuseau de l'appareil diffère.

## 7. Intégration Google
Sans objet.

## 8. Gestion des erreurs
| # | Situation | Erreur | Comportement | Message | Test |
|---|---|---|---|---|---|
| 1 | Abandonner une tâche terminée ou abandonnée ; reprendre une tâche non abandonnée ou une sous-tâche d'une tâche abandonnée | `ActionNonDisponible` | Refus | Aucun (action non proposée) | UT-US-025-03, 08 |
| 2 | Tâche absente ou supprimée | `ElementIntrouvable` | Refus | Aucun | UT-US-025-07 |

## 9. Patterns imposés
Commande avec confirmation (`AbandonnerTache`) ; cascade écrite dans **une** décision, chaque conséquence avec sa `cause` (DAT §6.1 c) ; marqueur `abandonParCascade` (DAT, impacts d'US-025) comparé à `evenementAbandon`.

## 10. Sécurité
Sans objet particulier.

## 11. Exigences non fonctionnelles
Comme ST-US-003.

## 12. Step definitions Cucumber
| # | Phrase Gherkin exacte | Mot-clé | Fichier | Nouveau / réutilisé | Rang | Implémentation |
|---|---|---|---|---|---|---|
| 1 | `l'utilisateur abandonne la tâche {string} et confirme` ; `… et renonce` | Quand | `taches.steps.ts` | Nouveau | 8 | `AbandonnerTache.evaluer` puis `executer`, ou rien |
| 2 | `l'utilisateur demande l'abandon de la tâche {string}` | Quand | idem | Nouveau | 8 | `evaluer` ; commande en attente |
| 3 | `l'utilisateur reprend la tâche {string}` | Quand | idem | Nouveau | 8 | `ReprendreTache.evaluer` ; `SANS_CONFIRMATION` → `executer` ; `CONFIRMATION_REQUISE` → commande en attente (selon Q-US-025-3) ; refus → résultat mémorisé |
| 4 | `une confirmation est demandée, qui rappelle que la tâche pourra être reprise` | Alors | `refus.steps.ts` | Nouveau | 8 | Code `CNF-ABANDON-TACHE` ou `CNF-ABANDON-TACHE-CASCADE` |
| 5 | `une confirmation est demandée, qui annonce {int} sous-tâche(s) abandonnée(s) avec la tâche` | Alors | idem | Nouveau | 8 | `CNF-ABANDON-TACHE-CASCADE`, `n` |
| 6 | `la tâche {string} est {string} avec la date d'abandon {date}` | Alors | `taches.steps.ts` | Nouveau | 8 | État « abandonnée » et `dateAbandon` |
| 7 | `la tâche {string} n'a pas de date d'abandon` | Alors | idem | Nouveau | 8 | `dateAbandon` absent |
| 8 | `l'action {string} n'est pas proposée pour la tâche {string}` / `… est proposée …` (« abandonner », « reprendre ») | Alors | `liste-taches.steps.ts` | Réutilisé (ST-US-024), étendu | 8 | `ABANDONNER`, `REPRENDRE` |
| 9 | `les tâches suivantes :` (état « abandonnée », colonne « date d'abandon ») ; `l'objectif {string} a … {int} tâche(s) abandonnée(s)` | Étant donné | `construction-taches.ts` | Réutilisés, étendus | 8 | `AbandonnerTache.executer` (ST-US-002 §12.1) |
| 10 | `l'état de la tâche …`, `l'estimation de la tâche …`, `l'utilisateur termine …`, `l'utilisateur filtre …`, `la liste des tâches contient exactement …`, `l'historique …`, `l'utilisateur confirme` | — | — | Réutilisés (ST-US-002, 003, 024, socle) | 0 à 7 | — |
| 11 | Étapes du rang 9 (deux appareils, `la liste des modifications non retenues est vide`, incohérence) | — | — | Réutilisés (ST-US-017, ST-US-024) | 9 | — |

**Scénarios exécutables par rang** : rang 8 : S01 à S13, S12b, S17, S18 ; rang 9 : S14, S15, S16.

## 13. Tests unitaires fournis (E10)
| Id | Fichier | Élément | Cas testé | RG / CA | Échec |
|---|---|---|---|---|---|
| UT-US-025-01 | `tests/unitaires/objectifs-taches/domaine/decisions/abandonner-tache.test.ts` | `evaluerAbandon` | tâche sans sous-tâche → `CONFIRMATION_REQUISE ABANDON_TACHE (0)` | CA-1 | NI |
| UT-US-025-02 | idem | `evaluerAbandon` | 1 terminée et 2 à faire → `(2)` | CA-6 | NI |
| UT-US-025-03 | idem | `evaluerAbandon` | tâche terminée → `ActionNonDisponible('ABANDONNER')` | S06 | NI |
| UT-US-025-04 | idem | `deciderAbandon` | `cycleDeVie { ABANDONNEE, dateAbandon, instantAbandon, evenementAbandon = <op>:0 }` ; `ABANDON` | CA-1, CA-11 | NI |
| UT-US-025-05 | idem | `deciderAbandon` | cascade : sous-tâches à faire avec `abandonParCascade = <op>:0`, événements `ABANDON` cause 0 ; terminée et abandonnée avant : non écrites | CA-6, S18 | NI |
| UT-US-025-06 | idem | `deciderAbandon` | sous-tâche seule : une écriture, sans `abandonParCascade` | CA-9 | NI |
| UT-US-025-07 | `…/domaine/decisions/reprendre-tache.test.ts` | `evaluerReprise` | abandonnée → `SANS_CONFIRMATION` ; à faire → `ActionNonDisponible('REPRENDRE')` ; supprimée → `ElementIntrouvable` | CA-5 | NI |
| UT-US-025-08 | idem | `evaluerReprise` | sous-tâche d'une tâche abandonnée → `ActionNonDisponible('REPRENDRE')` | CA-8 | NI |
| UT-US-025-09 | idem | `deciderReprise` | reprend B (abandonnée avec la tâche), pas C (abandonnée avant), pas A (terminée) ; `REPRISE` cause 0 | CA-7, S11 | NI |
| UT-US-025-10 | `…/domaine/actions.test.ts` | `actionsTache` | `ABANDONNER` ssi à faire ; `REPRENDRE` ssi abandonnée, sauf sous une tâche abandonnée | CA-8, S06 | NI |
| UT-US-025-11 | `tests/unitaires/objectifs-taches/application/abandonner-tache.test.ts` | `AbandonnerTache` puis `TerminerTache` | sous-tâche de 1 h 30 abandonnée : estimation de la tâche parente 1 h ; la tâche parente peut être terminée | CA-9, S13 | NI |
| UT-US-025-12 | idem | `AbandonnerTache` puis `ConsulterObjectifs` | les trois exemples de S07 | CA-4 | NI |
| UT-US-025-13 | idem | `AbandonnerTache` | dates d'abandon des cinq exemples de S03 | CA-1, PT-16 | NI |
| UT-US-025-14 | `…/presentation/confirmation.test.ts` | `construireConfirmation` | `(0)` → `CNF-ABANDON-TACHE` ; `(2)` → `CNF-ABANDON-TACHE-CASCADE`, n = 2 | CA-1, CA-6 | NI |
| UT-US-025-15 | `…/presentation/detail-tache.test.ts` | `construireDetailTache` | « Abandonnée le » + `MEN-HEURE-PARIS` (New York) ; pas de date de fin ; étiquettes `ETA-SOUS-TACHE-*` du §6.4 | CA-3, CA-5 | NI |
| UT-US-025-16 | `…/presentation/liste-taches.test.ts` | `construireListeTaches` | tâche abandonnée absente du filtre « à faire », présente dans « abandonnée » | CA-2 | NI |
| UT-US-025-17 | `…/application/reprendre-tache.test.ts` | `ReprendreTache` | historique de « Section B » terminé par `ABANDON` puis `REPRISE` ; aucune entrée `ABANDON` pour « Section A » | CA-11, S18 | NI |
| UT-US-025-18 | `…/domaine/decisions/reprendre-tache.test.ts` | `evaluerReprise` | sous-tâche abandonnée d'une tâche parente terminée | Q-US-025-3 | **Écrit après la réponse** |

Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-025`.

## 14. Tests attendus de Benjamin
Boîte d'abandon (`alertdialog`, « Annuler » focalisé, bouton non rouge) ; menu « … » au clavier ; état « Abandonnée » dit en texte.

## 15. Plan de réalisation
1. Décisions (UT 01 à 10). 2. Cas d'usage (UT 11 à 13, 17). 3. Modèles de vue (UT 14 à 16). 4. Étapes du §12 ; scénarios du rang 8 et scénarios différés (US-001 S06, S15 ; US-002 S15, S20c, S20d ; US-003 S07, S09, S12 ; US-024 S05, S08, S10b, S15, S16, S16b, S18). 5. Écrans ; DoD.

## 16. Dette, hypothèses et points ouverts
- **Question posée — Q-US-025-3** (Pepper, avis de Steeve ; peut compléter RG-027 et repasser par le commanditaire, comme Q-US-025-2) : *reprendre une sous-tâche abandonnée dont la tâche parente est terminée*.
  Situation : « Chapitre 1 » a deux sous-tâches ; « Section A » est abandonnée seule, « Section B » est terminée ; « Chapitre 1 » est ensuite terminée, ce qui est permis puisqu'il ne lui reste aucune sous-tâche à faire (US-024 CA-8). L'utilisateur veut reprendre « Section A ». Aucune règle ne couvre ce cas : US-025 CA-8 vise une tâche parente **abandonnée**, US-003 CA-9 la **réouverture** d'une sous-tâche **terminée**. Sans règle, la reprise créerait sur un seul appareil l'incohérence de RG-049 (« tâche terminée avec une sous-tâche à faire »), qu'aucun appareil ne devrait produire seul. Options :
  - **a) ★** La reprise est proposée, avec une confirmation qui annonce la réouverture de « Chapitre 1 », et rouvre aussi « Chapitre 1 », dans la même opération (même comportement qu'US-003 CA-9 pour une sous-tâche terminée ; Steeve indique le code de confirmation, par exemple en étendant `CNF-ROUVRIR-SOUS-TACHE`).
  - b) La reprise n'est pas proposée : il faut d'abord rouvrir « Chapitre 1 » (même comportement que DEC-030 pour une tâche parente abandonnée).
  - c) La reprise est faite sans rien changer à « Chapitre 1 », qui est alors signalée incohérente (`ALR-003`).
  *Pourquoi a)* : c'est le cas le plus proche déjà tranché (même état de la tâche parente, même retour à « à faire » de la sous-tâche) ; aucune incohérence n'est créée ; l'utilisateur obtient ce qu'il demande en un geste. Seuls §6.2 (étape 4), §6.3 et UT-US-025-18 en dépendent ; un scénario sera à ajouter par Pepper.
- **Hypothèses** : H-5, H-7 appliquées.
- **Dette** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] CA, RG, fichiers, signatures, erreurs, patterns, étapes, cas temporels.
- [x] Tests du §13 en phase rouge (E10, 2026-10-22 : 24 cas), sauf UT-US-025-18 (Q-US-025-3).
- [ ] Q-US-025-3 répondue.
