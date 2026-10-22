# ST-US-023 — Organiser un objectif en sous-objectifs

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-023](../01-specification-fonctionnelle/user-stories/US-023-organiser-un-objectif-en-sous-objectifs.md), état du 2026-10-21 (validée, DEC-018 ; complément DEC-030) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **4** / 13 |
| Fichier `.feature` | [`tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature`](../../tests/features/US-023-organiser-un-objectif-en-sous-objectifs.feature), 22 scénarios |
| RG couvertes | RG-002, RG-004, RG-022, RG-024 (sous-objectif), RG-025, RG-045, RG-046, RG-047 et RG-048 (via ST-US-017 incrément 2), RG-050 |
| DAT / ADR | DAT v0.10.1 (§4.2 « hiérarchies », §6.1) ; ADR-003, ADR-010 |
| Maquettes | ECR-008 (A, C, D), ECR-003 (E) ; guide v0.2.8 §4.28, §6.6.8, §6.6.9 |
| Q-US traitées | Q-US-023-1, Q-US-023-2 (E8) ; Q-US-001-1 (DEC-030) ; Q-US-001-6 (c) (réponse de Steeve, guide v0.2.9 §5.8) |
| Prérequis | ST-US-001 (rang 2), ST-US-017 incrément 1 (rang 3) |
| Version | 0.1 |
| Statut | **Prête pour E10** (Q-US-001-6 (c) répondue) |
| Auteur | Anthony |
| Branche Git | `us/US-023-sous-objectifs` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-22 | Anthony | Création (E9, DEC-031) |
| 0.2 | 2026-10-22 | Anthony | Réponse à Q-US-001-6 (guide v0.2.9 §5.8) : ordre de référence, sections `SEC-SOUS-OBJECTIFS` et `SEC-OBJ-ATTEINTS` ; §6.5, §6.6, §12, UT-US-023-21 ; statut levé |

## 1. Résumé technique
- **Ce que l'US change.** Création d'un sous-objectif (champ `parent` du socle, origine `CREATION`), placement sous un autre objectif ou retour au rang d'objectif principal (origine `DEPLACEMENT`, événement `CHANGEMENT_PARENT`), contrôles RG-022 à la saisie avec l'ordre de priorité de Q-US-023-1, alerte de délai d'un sous-objectif (`ALR-007`), sélecteur de parent (`ParentPicker`), sous-objectifs dans la liste et le détail. L'état d'un objectif tient déjà compte des sous-objectifs (ST-US-001 §6.2).
- **Hors périmètre** : réparation RG-048 et signalement des placements annulés (S16 à S18c), placement non retenu après suppression concurrente (S19) : ST-US-017 incrément 2. Plus d'un niveau ; plusieurs parents (exclus).
- **Prérequis** : ST-US-001, socle d'écriture, incrément 1 d'US-017 (aucune dépendance de code ; ordre du lot).

## 2. Traçabilité
### 2.1 Critères d'acceptation → scénarios → tests
| CA | Scénarios | RG | Tests | Composants | Rang |
|---|---|---|---|---|---|
| CA-1 création d'un sous-objectif | S01 | RG-022 | UT-US-023-09, 10, 19 | `CreerSousObjectif` | 4 |
| CA-2 affichage | S02, S03 | RG-022, RG-045 | UT-US-023-16, 20 | Modèles de vue | 4 |
| CA-3 un seul niveau | S04 | RG-022 | UT-US-023-10, 13 | `actionsObjectif` | 4 |
| CA-4 alerte de délai | S05, S06 | RG-022, RG-024 | UT-US-023-11, 12 | `alerteDelaiObjectif` | 4 |
| CA-5 déplacement | S07, S08, S12 | RG-022, RG-025 | UT-US-023-05 à 08, 17, 18 | `PlacerObjectif`, `RendreObjectifPrincipal` | 4 (S07 : 5) |
| CA-6 refus | S09, S10, S11 | RG-022 | UT-US-023-01 à 04, 14, 15 | `deciderPlacementObjectif` | 4 |
| CA-7 atteinte | S13, S14 | RG-025 | ST-US-001 UT-US-001-10 | `etatObjectif` | 7 |
| CA-8 suppression | S15 | RG-046 | ST-US-001 UT-US-001-04, 21 | `SupprimerObjectif` | 4 |
| CA-9 RG-048 | S16, S17, S18, S18b, S18c | RG-048 | ST-US-017 incrément 2 | Passe de réparation | 9 |
| CA-10 RG-047 | S19 | RG-047 | ST-US-017 incrément 2 | `contexteDePierreTombale` | 9 |
| CA-11 historique | S20 | RG-050 | UT-US-023-06, 07, 09, 17 | Décisions | 4 |

### 2.2 Règles de gestion → implémentation
| RG | Élément | Tests |
|---|---|---|
| RG-022 (un niveau, parent unique, déplacement, alerte) | `hierarchie-objectifs.ts`, `decisions/placer-objectif.ts`, `alertes-delai.ts` | UT-US-023-01 à 12 |
| RG-025 (sous-objectifs) | `etatObjectif` (ST-US-001) | UT-US-001-10, UT-US-023-18 |
| RG-050 (`CREATION` avec parent, `CHANGEMENT_PARENT`) | Décisions ; `planifierEcritures` du socle | UT-US-023-06, 07, 09, 17 |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/objectifs-taches/domaine/hierarchie-objectifs.ts` | Domaine | Créer | `verifierPlacement` (§6.1), `estObjectifPrincipal` |
| 2 | `src/objectifs-taches/domaine/alertes-delai.ts` | Domaine | Créer | `alerteDelaiObjectif` (ALR-007) ; ST-US-002 y ajoute les alertes des tâches |
| 3 | `src/objectifs-taches/domaine/decisions/placer-objectif.ts` | Domaine | Créer | `deciderPlacementObjectif` |
| 4 | `src/objectifs-taches/domaine/decisions/creer-objectif.ts` | Domaine | Modifier | Prise en compte de `parentId` (§6.2) |
| 5 | `src/objectifs-taches/domaine/refus.ts` | Domaine | Modifier | Ajout de `PlacementSousLuiMeme`, `DeuxiemeNiveau` |
| 6 | `src/objectifs-taches/domaine/actions.ts` | Domaine | Modifier | `actionsObjectif(vue, id)` : ajout de `PLACER` et `CREER_SOUS_OBJECTIF` |
| 7 | `src/objectifs-taches/application/cas-usage/creer-sous-objectif.ts` | Application | Créer | `CreerSousObjectif` |
| 8 | `src/objectifs-taches/application/cas-usage/placer-objectif.ts` | Application | Créer | `PlacerObjectif`, `RendreObjectifPrincipal` |
| 9 | `src/objectifs-taches/application/requetes/resumes.ts` | Application | Modifier | `ResumeObjectif.alerteDelai`, `ResumeObjectif.parentIntitule` |
| 10 | `src/objectifs-taches/application/requetes/consulter-selecteur-parent.ts` | Application | Créer | Requête `ConsulterSelecteurParent` |
| 11 | `src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif.ts`, `liste-objectifs.ts`, `detail-objectif.ts` | Modèle de vue | Modifier | `ALR-007`, niveau, sous-objectifs, actions |
| 12 | `src/objectifs-taches/presentation/modeles-de-vue/selecteur-parent.ts` | Modèle de vue | Créer | `construireSelecteurParent` (ECR-008 C, D) |
| 13 | `src/objectifs-taches/presentation/modeles-de-vue/messages-de-refus.ts` | Modèle de vue | Modifier | `ERR-030` (variantes), `ERR-031` |
| 14 | `src/objectifs-taches/presentation/ui/composants/selecteur-parent.tsx`, `ligne-objectif.tsx` (retrait de 28 px), `ecrans/detail-objectif.tsx` (section « Sous-objectifs », cadre E) | UI | Créer / Modifier | `ParentPicker`, affichage des sous-objectifs |
| 15 | `src/composition/web.ts`, `src/objectifs-taches/index.ts` | Composition | Modifier | Enregistrement |
| 16 | `tests/steps/objectifs-taches/objectifs.steps.ts` | Test | Modifier | Étapes du §12 |

## 4. Interfaces et signatures
### 4.1 Domaine
```ts
// refus.ts (ajouts)
  | { readonly type: 'PlacementSousLuiMeme' }                                                          // ERR-031
  | { readonly type: 'DeuxiemeNiveau'; readonly variante: 'objectif-a-des-sous-objectifs';
      readonly objectif: string; readonly nombreSousObjectifs: number }                               // ERR-030
  | { readonly type: 'DeuxiemeNiveau'; readonly variante: 'cible-est-sous-objectif'; readonly cible: string } // ERR-030

// hierarchie-objectifs.ts — RG-022, Q-US-023-1
export const estObjectifPrincipal = (o: Objectif): boolean => o.parentId === undefined;
export type IssuePlacement = 'SANS_EFFET' | 'A_ECRIRE';
export const verifierPlacement = (vue: VueMetier, objectifId: IdObjectif, cibleId: IdObjectif | undefined)
  : Resultat<IssuePlacement, RefusMetier> => …;                                                      // §6.1

// alertes-delai.ts
export type AlerteDelaiObjectif = { readonly parentId: IdObjectif; readonly parentIntitule: string; readonly delaiParent: DateCalendaire };
export const alerteDelaiObjectif = (vue: VueMetier, id: IdObjectif): AlerteDelaiObjectif | undefined => …; // §6.3

// decisions/placer-objectif.ts
export const deciderPlacementObjectif = (c: { readonly objectifId: IdObjectif; readonly parentId?: IdObjectif }) =>
  (vue: VueMetier, contexte: ContexteDecision): Resultat<Decision<void>, RefusMetier> => …;

// actions.ts
export const actionsObjectif = (vue: VueMetier, id: IdObjectif): ReadonlyArray<ActionObjectif> => …; // §6.4
```
### 4.2 Application
| Cas d'usage | Entrée | Sortie | Erreurs | Effets |
|---|---|---|---|---|
| `CreerSousObjectif.executer` | `{ parentId; intitule; description?; delai? }` | `IdObjectif` | `SaisieInvalide`, `ElementIntrouvable`, `ActionNonDisponible('CREER_SOUS_OBJECTIF')` | `CREER_OBJECTIF` avec `parentId` + `CREATION` `apres { parentId, delai? }` |
| `PlacerObjectif.executer` | `{ objectifId; parentId }` | `void` | `ElementIntrouvable`, `PlacementSousLuiMeme`, `DeuxiemeNiveau` | `ECRIRE_OBJECTIF parent` + `CHANGEMENT_PARENT`, ou rien (sans effet) |
| `RendreObjectifPrincipal.executer` | `{ objectifId }` | `void` | `ElementIntrouvable` | idem avec `parentId` absent |
| `ConsulterSelecteurParent.executer` | `{ objectifId }` | `{ objectif: ResumeObjectif; candidats: ReadonlyArray<ResumeObjectif>; nombreSousObjectifs: number }` | `ElementIntrouvable` | Aucun |

`ResumeObjectif` (ajouts) : `alerteDelai?: AlerteDelaiObjectif` ; `parentIntitule?: string`. `DetailObjectif.actions` = `actionsObjectif`.

### 4.3 Ports, 4.4 Adaptateurs
Sans objet.

### 4.5 Présentation
```ts
// LigneObjectif (ajout)
readonly alerteDelai?: { readonly code: 'ALR-007'; readonly parent: string; readonly libelle: string };   // « {date} · après « {parent} » »
// selecteur-parent.ts — ECR-008 C, D ; guide §4.28
export type OptionParent = {
  readonly cible: { readonly type: 'AUCUN' } | { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
  readonly intitule: string;                           // « Aucun, objectif principal » pour AUCUN (libellé du catalogue)
  readonly disponible: boolean; readonly raison?: MessageRefus;
};
export type ModeleVueSelecteurParent = {
  readonly titre: string;                              // « Placer « {élément} » sous… »
  readonly messageBloquant?: MessageRefus;             // ERR-030 variante objectif-a-des-sous-objectifs, affiché avant tout choix
  readonly options: ReadonlyArray<OptionParent>;       // AUCUN, puis les objectifs principaux (y compris l'objectif lui-même, indisponible, raison ERR-031)
};
export const construireSelecteurParent = (donnees: { readonly objectif: ResumeObjectif; readonly candidats: ReadonlyArray<ResumeObjectif>; readonly nombreSousObjectifs: number }) => ModeleVueSelecteurParent;
```
| Écran | Maquette | Codes | Actions → cas d'usage | États |
|---|---|---|---|---|
| Liste | ECR-008 A | `ALR-007` sur la ligne ; sous-objectif en retrait, nom accessible « sous-objectif de … » | — | — |
| Sélecteur de parent | ECR-008 C, D | `ERR-031` (option indisponible), `ERR-030` (boîte avec « Compris », `data-variante`) | option → `PlacerObjectif` ou `RendreObjectifPrincipal` | refus |
| Détail d'un objectif principal | ECR-003 D | section « Sous-objectifs » + « Ajouter » | « Ajouter » → feuille de création avec parent → `CreerSousObjectif` | — |
| Détail d'un sous-objectif | ECR-003 E | « Sous-objectif de « X » », carte d'alerte `ALR-007` ; **pas** d'action « Ajouter un sous-objectif » (absente, non désactivée) | « Modifier le délai » | vide `EVD-OBJECTIF-SANS-TACHE` |

## 5. Modèle de données et migrations
Registre `parent` de l'objectif (`PlacementObjectif`, socle §4.1.3) : `parentId`, `origine`, `hlcOrigine`. Aucune migration. Contenu logique du Drive inchangé (**sous réserve R1**).

## 6. Règles et algorithmes
### 6.1 Contrôle d'un placement (RG-022, Q-US-023-1 ; guide §4.28)
```text
verifierPlacement(vue, X, C):
  1. X actif, sinon ElementIntrouvable
  2. si C est défini : C actif, sinon ElementIntrouvable
  3. si C = X : PlacementSousLuiMeme                                                   (ERR-031)
  4. si C est défini et sousObjectifsDe(vue, X) n'est pas vide :
       DeuxiemeNiveau { variante: objectif-a-des-sous-objectifs, objectif: X.intitule, nombreSousObjectifs }   (ERR-030)
  5. si C est défini et C n'est pas principal : DeuxiemeNiveau { variante: cible-est-sous-objectif, cible: C.intitule }
  6. si le parent effectif de X est égal à C (y compris tous deux absents) : SANS_EFFET   (S12 : aucune écriture, aucun événement)
  7. A_ECRIRE
```
| X a des sous-objectifs | C = X | C est un sous-objectif | Résultat |
|---|---|---|---|
| — | oui | — | `ERR-031` |
| oui | non | — | `ERR-030 objectif-a-des-sous-objectifs` |
| non | non | oui | `ERR-030 cible-est-sous-objectif` |
| non | non | non | placement (ou sans effet) |

### 6.2 Décisions
| Décision | Contrôles | Modifications | Événement |
|---|---|---|---|
| Création d'un sous-objectif (`deciderCreationObjectif` avec `parentId`) | parent actif (`ElementIntrouvable`) ; parent principal (`ActionNonDisponible('CREER_SOUS_OBJECTIF')`) ; intitulé | `CREER_OBJECTIF` avec `valeurs.parentId` | `CREATION` `apres { parentId, delai? }` |
| Placement / retour au rang principal | §6.1 | `ECRIRE_OBJECTIF { champ: 'parent', parentId }` si `A_ECRIRE` ; aucune si `SANS_EFFET` | `CHANGEMENT_PARENT` (avant et après calculés par le socle) |

### 6.3 Alerte de délai d'un sous-objectif (RG-022, CA-4)
`alerteDelaiObjectif(vue, o)` : p = parent effectif de o ; renvoie `{ p }` si p existe, `o.delai` et `p.delai` sont définis et `o.delai > p.delai` (strictement) ; sinon `undefined`. Recalculée à chaque lecture : un changement de l'un des deux délais, un déplacement ou la suppression du parent la mettent à jour sans écriture.

### 6.4 Actions d'un objectif
`actionsObjectif(vue, o)` = `RENOMMER`, `MODIFIER_DESCRIPTION`, `MODIFIER_DELAI`, `RETIRER_DELAI` (si délai), `PLACER`, `CREER_SOUS_OBJECTIF` (seulement si o est principal), `SUPPRIMER`.

### 6.5 Sélecteur de parent
Candidats : objectifs principaux actifs, plus l'objectif lui-même s'il est principal (indisponible, raison `ERR-031`). Si l'objectif a des sous-objectifs, `messageBloquant` = `ERR-030 objectif-a-des-sous-objectifs` et seules l'option `AUCUN` et la fermeture restent possibles (guide §4.28 : « le message l'explique avant tout choix »). Ordre des candidats : `comparerOrdreReference` (ST-US-001 §6.6, guide v0.2.9 §5.8 a).

### 6.6 Ordre des sous-objectifs (guide v0.2.9 §5.8 c)
Sous leur parent, dans la liste (section principale ou section « Atteints » selon l'état du parent principal, ST-US-001 §6.6) et dans le détail (section `SEC-SOUS-OBJECTIFS`) : `comparerOrdreReference` (délai croissant, sans délai à la fin, création, intitulé), atteints compris ; un sous-objectif ne change pas de place quand son état change. Un sous-objectif atteint sous un parent en cours reste sous lui ; un objectif principal atteint emmène ses sous-objectifs dans la section « Atteints ».

## 7. Intégration Google
Sans objet.

## 8. Gestion des erreurs
| # | Situation | Erreur | Comportement | Message | Test |
|---|---|---|---|---|---|
| 1 | Objectif placé sous lui-même | `PlacementSousLuiMeme` | Refus, aucune écriture | `ERR-031` | UT-US-023-01 |
| 2 | Objectif qui a des sous-objectifs placé sous un autre | `DeuxiemeNiveau` (`objectif-a-des-sous-objectifs`) | idem | `ERR-030`, `data-variante`, variables `{ element, n }` | UT-US-023-02 |
| 3 | Cible qui est un sous-objectif | `DeuxiemeNiveau` (`cible-est-sous-objectif`) | idem | `ERR-030`, variable `{ element }` | UT-US-023-03 |
| 4 | Création d'un sous-objectif sous un sous-objectif (appel invalide : l'action n'est pas proposée) | `ActionNonDisponible` | Refus | Aucun | UT-US-023-10 |

## 9. Patterns imposés
Décision pure, table de décision unique pour les refus (§6.1). **Interdit** : vérifier la hiérarchie dans le modèle de vue ou dans le composant ; écrire une réparation à la saisie.

## 10. Sécurité
Sans objet particulier (intitulés affichés en texte).

## 11. Exigences non fonctionnelles
Contrôle de placement en O(nombre d'objectifs).

## 12. Step definitions Cucumber
> Fichier `tests/steps/objectifs-taches/objectifs.steps.ts`.

| # | Phrase Gherkin exacte | Mot-clé | Nouveau / réutilisé | Rang | Implémentation |
|---|---|---|---|---|---|
| 1 | `un sous-objectif {string} de l'objectif {string}` ; `…, sans délai` ; `…, de délai {date}` | Étant donné | Nouveau | 4 | `CreerSousObjectif` ; sans suffixe = sans délai (glossaire §1) |
| 2 | `l'utilisateur crée un sous-objectif {string} de l'objectif {string}, sans délai` ; `…, de délai {date}` ; et sans suffixe (US-001 S20) | Quand | Nouveau | 4 | `CreerSousObjectif` ; la forme sans suffixe vaut « sans délai », comme la précondition du glossaire §1 |
| 3 | `l'utilisateur place l'objectif {string} sous l'objectif {string}` | Quand | Nouveau | 4 | `PlacerObjectif` ; résultat mémorisé |
| 4 | `l'utilisateur fait de l'objectif {string} un objectif principal` | Quand | Nouveau | 4 | `RendreObjectifPrincipal` |
| 5 | `{string} est un objectif principal` ; `{string} est un sous-objectif de l'objectif {string}` | Alors | Nouveau | 4 | Parent effectif dans la vue de l'appareil |
| 6 | `la liste présente {string} comme objectif principal` ; `… comme sous-objectif de {string}` | Alors | Nouveau | 4 | `LigneObjectif.niveau`, `parentId`, cherchés dans la section principale et dans `sectionAtteints` du dernier modèle de liste consulté |
| 7 | `l'action {string} n'est pas proposée pour l'objectif {string}` | Alors | Nouveau | 4 | « créer un sous-objectif » → `CREER_SOUS_OBJECTIF` absent de `construireDetailObjectif(…).actions` |
| 8 | `l'objectif {string} porte une alerte de délai qui nomme l'objectif {string}` ; `l'objectif {string} ne porte aucune alerte de délai` | Alors | Nouveau | 4 | `LigneObjectif.alerteDelai` (`ALR-007`) et nom du parent |
| 9 | `le détail présente les sous-objectifs :` + tableau (intitulé, délai, état, en retard) | Alors | Nouveau | 4 | `ModeleVueDetailObjectif.sousObjectifs.lignes` (section `SEC-SOUS-OBJECTIFS`) ; ordre non vérifié |
| 10 | `le détail présente le sous-objectif {string}` | Alors | Nouveau | 4 | Présence dans `sousObjectifs.lignes` |
| 11 | `aucun changement de parent n'est enregistré pour l'objectif {string}` | Alors | Nouveau | 4 | Aucune entrée `CHANGEMENT_PARENT` dans `ConsulterHistorique` |
| 12 | `aucun sous-objectif n'a de sous-objectif` | Alors | Nouveau | 4 | Pour tout objectif dont le parent effectif est défini, `sousObjectifsDe` est vide |
| 13 | `les deux appareils présentent la même hiérarchie d'objectifs` | Alors | Nouveau | 4 | Égalité des couples (intitulé, intitulé du parent effectif) sur les deux appareils du banc |
| 14 | `l'action est refusée avec le motif {string}` | Alors (`refus.steps.ts`) | Nouveau | 4 | Même logique que « l'enregistrement est refusé » (ST-US-001 §12 n° 26) |
| 15 | Étapes de création, de modification, de consultation et de l'historique d'un objectif | — | Réutilisées (ST-US-001) | 2 | — |
| 16 | `les tâches suivantes :` ; `l'objectif {string} a {int} tâche(s) à faire, …` ; `l'utilisateur termine la tâche` ; `l'utilisateur rouvre la tâche` | — | Réutilisées (ST-US-002, ST-US-003) | 5, 7 | — |
| 17 | Étapes à deux appareils, réseau, échanges, `la liste des modifications non retenues contient …` | — | Réutilisées (ST-US-017, **sous réserve R1**) | 3, 9 | — |

**Scénarios exécutables par rang** : rang 4 : S01 à S06, S08 à S12, S15, S20 ; rang 5 : S07 ; rang 7 : S13, S14 ; rang 9 : S16, S17, S18, S18b, S18c, S19.

## 13. Tests unitaires fournis (E10)
| Id | Fichier | Élément | Cas testé | RG / CA | Échec |
|---|---|---|---|---|---|
| UT-US-023-01 | `tests/unitaires/objectifs-taches/domaine/hierarchie-objectifs.test.ts` | `verifierPlacement` | X sous X → `PlacementSousLuiMeme` | CA-6 | NI |
| UT-US-023-02 | idem | `verifierPlacement` | X avec 1 sous-objectif sous C → `DeuxiemeNiveau objectif-a-des-sous-objectifs` (n = 1) | CA-6 | NI |
| UT-US-023-03 | idem | `verifierPlacement` | X sans sous-objectif sous un sous-objectif → `cible-est-sous-objectif` | CA-6 | NI |
| UT-US-023-04 | idem | `verifierPlacement` | priorités : X (avec sous-objectifs) sous X → `ERR-031` ; X sous son propre sous-objectif → `objectif-a-des-sous-objectifs` | Q-US-023-1 | NI |
| UT-US-023-05 | idem | `verifierPlacement` | sous le parent actuel ; principal rendu principal → `SANS_EFFET` | S12 | NI |
| UT-US-023-06 | `…/domaine/decisions/placer-objectif.test.ts` | `deciderPlacementObjectif` | `ECRIRE_OBJECTIF parent` + événement `CHANGEMENT_PARENT` rang 0 | CA-5, CA-11 | NI |
| UT-US-023-07 | idem | `deciderPlacementObjectif` | sans `parentId` → `parentId` absent, événement | CA-5 | NI |
| UT-US-023-08 | idem | `deciderPlacementObjectif` | `SANS_EFFET` → aucune modification | S12 | NI |
| UT-US-023-09 | `…/domaine/decisions/creer-objectif.test.ts` | `deciderCreationObjectif` | avec parent → `valeurs.parentId`, `CREATION apres { parentId }` | CA-1, CA-11 | NI |
| UT-US-023-10 | idem | `deciderCreationObjectif` | parent sous-objectif → `ActionNonDisponible` ; parent supprimé → `ElementIntrouvable` | CA-3 | NI |
| UT-US-023-11 | `…/domaine/alertes-delai.test.ts` | `alerteDelaiObjectif` | les cinq cas de S05 (postérieur, égal, antérieur, sous-objectif sans délai, parent sans délai) | CA-4 | NI |
| UT-US-023-12 | idem | `alerteDelaiObjectif` | parent supprimé (devenu principal) → aucune alerte | RG-046 | NI |
| UT-US-023-13 | `…/domaine/actions.test.ts` | `actionsObjectif` | sous-objectif : sans `CREER_SOUS_OBJECTIF`, avec `PLACER` ; principal : les deux | CA-3 | NI |
| UT-US-023-14 | `…/presentation/messages-de-refus.test.ts` | `messagesDeRefus` | `ERR-030` + variante + variables ; `ERR-031` | CA-6 | NI |
| UT-US-023-15 | `…/presentation/selecteur-parent.test.ts` | `construireSelecteurParent` | option `AUCUN` ; objectif lui-même indisponible (`ERR-031`) ; objectif à sous-objectifs → `messageBloquant` `ERR-030` | Guide §4.28 | NI |
| UT-US-023-16 | `…/presentation/liste-objectifs.test.ts` | `construireListeObjectifs` | sous-objectif `SOUS_OBJECTIF` juste après son parent ; `ALR-007` | CA-2, CA-4 | NI |
| UT-US-023-17 | `tests/unitaires/objectifs-taches/application/placer-objectif.test.ts` | `PlacerObjectif` | journal `CHANGEMENT_PARENT` : `avant` = parent de création (origine `CREATION`, `hlcOrigine` = HLC de la création), `apres` origine `DEPLACEMENT` | CA-11, RG-048 (préparation) | NI |
| UT-US-023-18 | idem | `PlacerObjectif` puis `ConsulterObjectifs` | ancien parent sans autre contenu → « à décliner » ; nouveau parent → « en cours » (S07, avec tâche de contexte créée par `Modification`) | CA-5 | NI |
| UT-US-023-19 | `…/application/creer-sous-objectif.test.ts` | `CreerSousObjectif` | sous-objectif lu avec parent effectif ; « à décliner en tâches » | CA-1 | NI |
| UT-US-023-20 | `…/presentation/detail-objectif.test.ts` | `construireDetailObjectif` | sous-objectif : niveau avec parent nommé ; principal : lignes des sous-objectifs | CA-2 | NI |
| UT-US-023-21 | `…/presentation/detail-objectif.test.ts`, `liste-objectifs.test.ts` | `construireDetailObjectif`, `construireListeObjectifs` | sous-objectifs dans `SEC-SOUS-OBJECTIFS` et sous leur parent dans la liste, triés par l'ordre de référence ; un sous-objectif atteint reste à sa place sous un parent en cours ; les sous-objectifs d'un principal atteint sont dans `SEC-OBJ-ATTEINTS` | Guide v0.2.9 §5.8 c (Q-US-001-6) | NI |

Commandes : `pnpm test -- tests/unitaires/objectifs-taches` ; `pnpm cucumber -- --tags @US-023`.

**Précisions de l'E10 (2026-10-22)** : `ConsulterSelecteurParent.executer({ objectifId })` ; ses `candidats` comprennent l'objectif lui-même s'il est principal, que le modèle de vue rend indisponible (`ERR-031`) ; `construireSelecteurParent` ordonne les candidats (UT-US-023-15). Constructeurs : ST-US-001 §13.

## 14. Tests attendus de Benjamin
Composant `ParentPicker` (radios au clavier, option indisponible lue avec sa raison) ; écran de détail d'un sous-objectif (absence de l'action, carte d'alerte).

## 15. Plan de réalisation
1. Refus, `verifierPlacement`, alerte, actions (UT 01 à 05, 11 à 13).
2. Décisions et cas d'usage (UT 06 à 10, 17 à 19).
3. Modèles de vue (UT 14 à 16, 20).
4. Étapes du §12 ; scénarios du rang 4.
5. Écrans ; DoD.

## 16. Dette, hypothèses et points ouverts
- **Concernée par Q-US-001-6 (c)** (ST-US-001 §16) : ordre des sous-objectifs.
  - **Réponse de Steeve (E9, 2026-10-22, guide v0.2.9 §5.8) : (c) Oui** ; la proposition du §6.6 est retenue telle quelle (délai croissant, sans délai à la fin, création, intitulé ; atteints non déplacés). Même ordre pour les candidats du sélecteur de parent (a). UT-US-023-21 peut être écrit en E10.
- **Hypothèses** : H-2 (signalement `ALR-010` variante `placement`) relève de l'incrément 2 d'US-017. Forme de l'étape « crée un sous-objectif … » sans suffixe (US-001 S20) lue comme « sans délai », par analogie avec la précondition du glossaire §1 : signalée à Pepper pour inscription au glossaire, sans effet sur le sens.
- **Dette** : aucune.

## 17. Checklist de complétude (avant E11)
- [x] CA, RG, fichiers, signatures, erreurs, patterns, étapes.
- [x] Tests du §13 en phase rouge (E10, 2026-10-22 : 27 cas).
- [x] Q-US-001-6 (c) répondue (Steeve, guide v0.2.9 §5.8).
