# Revue de code E13 — LOT-001, rang 10 (US-017, incrément 3 : contrôles du Drive, restauration, « Repartir de zéro », ERR-012)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-07 |
| Branche | `us/US-017-rang10` @ `05cf02f` (PR #33 en brouillon, base `lot/LOT-001`) |
| Auteurs | Bruce : R1 (adaptateur Drive), R2 (domaine des contrôles), R3 (persistance, format), R4 (cycle, cas d'usage, `ecriture-manifeste.ts`), compléments de couverture (UT-COMP-US-017-3-101 à 116). Benjamin : D1 (copie locale, modèle de vue et composant du choix), D2 (DT-026, DT-029), D3a (composition, catalogue, `TST-RESTAUREE`, DT-028), D3b (étapes Cucumber, `rangCourant`), DT-030, DT-031. Starck (DAT v0.11.10), Steeve (guide v0.2.21). |
| Périmètre | Différentiel `origin/lot/LOT-001...origin/us/US-017-rang10` : 105 fichiers, + 10 407, − 370 |
| Référentiel | ST-US-017 v0.10.2 (§3.5, §4.7, §6.7 n° 1 à 17, §8 n° 12 à 16, §12.6, §13.5, §15.2), ST-US-024 v0.5 (DT-026), DAT v0.11.10 §4.2.2 (conditions C1 à C9 de Starck), guide d'ergonomie v0.2.21, `checklist-revue-code.md`, revue du rang 9 |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, hygiène) | **0 erreur.** Les 13 erreurs de lint signalées à la reprise sont levées par `48f113b` (découpage en sous-étapes privées, `switch` exhaustif de `lectureEnEchec`). |
| `pnpm test` (local, Node 24, `rangCourant` = 10) | **1 242 / 1 242.** |
| `pnpm cucumber` (local) | **387 / 387 scénarios**, dont les 13 du rang (S23 compris, `874ee4f`). |
| CI de `05cf02f` (deux exécutions, `push` et `pull_request`) | **Rouge.** `qualite`, `securite`, `build`, `e2e` verts. Les jobs `tests` échouent 3 fois sur 6 (UTC et America/New_York dans une exécution, Pacific/Auckland dans l'autre), toujours sur **UT-COMP-US-002-87** : le focus est sur `ion-modal` au lieu du `spinbutton`, alors que l'assertion est déjà dans `waitFor`. Voir RC-US-017-12. L'étape de non-régression de la couverture par fichier (DT-005) n'est pas atteinte dans les jobs rouges ; elle est verte dans les jobs verts. |
| Rangs | `rangCourant` = 10. Les 10 fichiers créés dans `src/` figurent dans `rangs-fichiers.json` (`debut = fin = 10`), `ecriture-manifeste.ts` et `focus-fin-a-lire.ts` compris. Aucun `@non-implemente` ne reste dans `src/`. `rangs-tests.json` : `CT-DEPOT-1[4-9]` → 10 et `CT-TRANS-1[1-9]` → 10 placés avant les règles plus générales ; `UT-COMP-US-017-3-\d+` → 10 placé **avant** `UT-COMP-US-017-\d+` → 3 (la première règle qui s'applique l'emporte) ; `UT-COMP-DT-03[01]-\d+`, `UT-COMP-US-024-1[1-9]`, `UT-US-024-2[4-9]` → 10. Rien à ajouter. |
| Migration | Aucune version Dexie nouvelle : les clés de méta de l'incrément 3 sont optionnelles (absente ≡ valeur initiale), la base v3 existante est lue sans perte (UT-COMP-US-017-3-1). `reinitialiser` agit en une transaction stricte. **Conforme.** |
| Sécurité | Aucun secret, jeton, `localStorage`, `console` ni `dangerouslySetInnerHTML` ajouté. Requêtes Drive : identifiants passés par `litteralRequeteDrive` (aucune injection dans `q`), `trashed = false` sur les trois listes, `supprimerFichier` = `PATCH { trashed: true }` (récupérable), jamais `DELETE` (C5). Journal : les nouvelles entrées (`MiseALaCorbeilleDifferee`, `DossierQuitteConserve`, `FichierAppareilIgnore`) ne portent qu'un type d'erreur. ADR-013 : rien de touché. **Conforme.** |

## 2. Convergence (point 1)

### 2.1 Noyau de fusion du rang 9

Le différentiel ne touche **aucun** fichier du noyau : `fusion.ts`, `pierre-tombale.ts`, `contexte-causal.ts`, `reparation-hierarchie.ts`, `entree-reparation.ts` et `planifier-synchronisation.ts` sont inchangés. J1 (`estConnue`, `L.hlc ≤ W.hlc` pour le même appareil), J2, la jointure des pierres tombales, la réparation RG-048 et son entrée de journal `CHANGEMENT_PARENT` (identifiant = texte du signalement, dédoublonnée par l'union) gardent les garanties établies au rang 9. UT-US-017-117 et 118 restent verts.

Les seuls changements du domaine des signalements sont :
- `ValeurEcartee` `DONNEES_EFFACEES` reçoit `intituleElement?`. L'ordre total de l'union reste total, car la sérialisation canonique (`valeurs-ecartees.ts:93-100`) couvre le nouveau champ. Pour cette variante, `hlcDuGagnant` = `generation`.
- `detaillerValeursEcartees` filtre les entrées `DONNEES_EFFACEES` dont l'auteur n'est pas l'appareil (`detail-valeurs-ecartees.ts:263-264`, n° 10 d). C'est un filtre d'affichage, appliqué après l'union : la convergence des signalements n'est pas touchée.

### 2.2 Mécanismes de l'incrément 3

| Mécanisme | Constat |
|---|---|
| Manifeste (`manifeste.ts`) | La jointure prend, champ par champ, le maximum de `schemaVersion`, de la génération (`comparerGenerations`, ordre total, `INITIALE` minimale) et de `restauration` (absente < présente). C'est un semi-treillis. La référence de `a` est rendue si le résultat lui est égal, donc rien n'est écrit sans changement. **Conforme** (UT-US-017-63, propriétés de `manifeste.proprietes.test.ts`). |
| Écriture monotone (`ecriture-manifeste.ts`) | Lecture, jointure, écriture, puis une relecture et une réécriture si le contenu a reculé (n° 13). Mode `CHOIX` : chaque manifeste illisible est réécrit, doublons compris (C6). Un doublon lisible n'est jamais réécrit. **Conforme.** Un défaut de reprise après échec est noté en DT-036 (point 4). |
| Restauration connue | Elle ne décroît jamais dans une génération : `restaurationConnueApres` en `SYNCHRONISER` et en `RESTAURER FAITE_AILLEURS` (C1). Elle est initialisée, et non maximisée, à l'adoption (`d.restaurationVue`, `cycle-synchronisation.ts:826`) et à la création (`ecrit.manifeste.contenu.restauration`, `:896`) (C2). **Conforme.** |
| HLC d'un choix (C3) | `#consommerHlc` lève le plancher au-dessus du dernier HLC, des générations et restaurations lues et de la restauration connue. Il est enregistré par une transaction **avant** toute écriture dans le Drive, puisque le plan qui avance `dernierHlc` est écrit (Q-BRU-1, CT-DEPOT-15). Le calcul est refait dans la transaction et c'est le dernier résultat qui compte. **Conforme.** |
| Achèvement par l'auteur (C9) | `#adopter` : quand `G.hlc.appareil` est cet appareil, le manifeste est écrit en mode `CHOIX` avant la réinitialisation. `valeursDonneesEffacees(e, G.hlc, G.hlc)` ne signale que les écritures strictement postérieures à G. En cas d'échec, rien n'est réinitialisé. **Conforme.** |
| Relance après l'adoption | Elle a lieu une seule fois (`relance`). La méta remplacée n'a plus de fichier propre : l'ancien fichier de l'appareil est un orphelin, et le dépôt sans `fichierExistant` le reprend en place (CT-TRANS-03). Un éventuel second fichier de l'appareil est mis à la corbeille en fin de relance. Il ne reste donc qu'un fichier par appareil. **Conforme** (UT-US-017-74, invariant « un fichier par appareil »). |
| Réinitialisation | Le plan `reinitialiser` conserve `appareilId`, `version`, `correctionHorloge` et le plus grand `dernierHlc` (le HLC ne recule jamais). Les signalements sont remplacés par les seules entrées `DONNEES_EFFACEES`. **Conforme.** |
| Propriété de convergence de l'incrément 3 | UT-US-017-74 est vert. Il couvre deux et trois appareils, des choix concurrents, des coupures entre dépôt et manifeste, des reculs d'horloge et des dossiers en double. Il vérifie une génération, un dossier, des manifestes lisibles, un fichier par appareil, des états identiques, la monotonie, aucune écriture pendant `ERR-012` et des `ALR-014` complètes. |

**Conclusion : le rang 10 ne dégrade pas la convergence du noyau, et ses propres mécanismes convergent.** Aucune remarque bloquante sur ce point.

Une observation de cohérence documentaire, sans effet sur le code : le DAT v0.11.10 §4.2.2, « Signalement (e) », dit que l'auteur des entrées `DONNEES_EFFACEES` « les compte comme à lire ». La ST (H-6, §6.6 n° 6, n° 13 ; UT-US-017-47) et la réalisation ne les comptent **jamais** dans `aLire` : la carte `ALR-008` s'affiche, mais le décompte et l'indicateur n'en tiennent pas compte. Je pose la question **Q-ANT-E13-R10-1** (§5).

## 3. Décisions sur les points soumis

| # | Point | Décision |
|---|---|---|
| 1 | Convergence (J1/J2, jointure, RG-048, `CHANGEMENT_PARENT`) | Voir le §2. **Conforme.** |
| 2 | Résidu de DT-030 : « Rouvrir » d'une sous-tâche dans `section-sous-taches.tsx` | **Confirmé.** `CaseTerminer` (`section-sous-taches.tsx:41`) ne rend une case que pour une sous-tâche à faire. La sous-tâche terminée d'ECR-007 A n'a ni case « Rouvrir » ni confirmation `CNF-ROUVRIR-SOUS-TACHE`, alors que `detail-tache.ts:186` calcule déjà le nom « Rouvrir ». La partie « liste » de DT-030 est faite et testée (UT-COMP-DT-030-01 à 05). **L'écart vient de moi** : DT-030 prévoyait que je complète ST-US-024 avant l'E12 du rang 10, et je ne l'ai pas fait. Benjamin n'avait donc pas de spécification pour ECR-007 A. **Ce n'est pas une remarque de cette PR.** DT-030 passe à « Partiellement remboursée ». Le reliquat garde son échéance (E13b). ST-US-024 v0.6 et ses tests seront livrés avant l'E12 du rang 11. |
| 3 | Étape `ERR-012` pouvant masquer une première détection en échec | **Défaut confirmé (RC-US-017-13, majeure).** Le repli « échanger une fois avec le Drive si `ERR-012` n'est pas affiché » (`etat-affiche.steps.ts:195-196`) s'applique à toute forme « est affiché », y compris aux assertions « Alors ». La ST R4 le limitait à la précondition. Benjamin n'a pas pu les distinguer, parce que « Et que » est un mot-clé Gherkin, et ma ST ne disait pas comment faire. **Mesure** : sur une copie locale non commitée, j'ai désactivé le repli. Huit scénarios échouent, **tous sur la précondition** « Et que … est affiché » (S19, S20, S20b, S21, S22, S22b, S22c, S22d). Les assertions (S18 dans ses deux exemples, S32, S32b, US-017 l. 744 et 768) passent sans repli. **Aucune détection n'est masquée aujourd'hui**, mais l'étape rattraperait en silence une régression qui demanderait deux cycles, ou un cycle de l'action resté sans effet. La ST v0.10.3 §12.6 R4 donne le moyen : un crochet `BeforeStep` lit `pickleStep.type`. |
| 4 | `supprimerFichier` en échec sur l'ancien fichier propre au déménagement | **Confirmé : doublon durable et silencieux.** Dans `#demenager` (`cycle-synchronisation.ts:1075-1077`), l'échec est seulement journalisé. La méta pointe déjà le canonique, donc le dossier quitté n'est plus jamais observé. `#quitterDossier` le trouve non vide (il contient encore l'ancien fichier) et le garde. Il n'y a ni reprise, ni nouvel essai. Le même cas existe pour le doublon de manifeste créé par `creer` (`ecriture-manifeste.ts:134-135`), que rien ne mémorise. **Rien n'est perdu et la fusion n'est pas touchée** : le fichier est périmé mais de même génération, un autre appareil resté dans l'ancien dossier le fusionne de façon idempotente, et les manifestes se joignent par maximum. En revanche, une copie des données personnelles survit dans le Drive, même à un « Repartir de zéro ». La réalisation est **conforme à ma ST**, qui n'a pas prévu de reprise (n° 14). → **DT-036** (P2) : je spécifie la reprise au rang 11 (identifiants à mettre à la corbeille mémorisés dans la méta, repris comme les orphelins), Bruce la réalise. Ce n'est pas une remarque de cette PR : le cas est rare (dossier en double, puis panne de Drive à ce moment précis) et sans perte. |
| 5 | Gardes défensives `#acheverRepartir` et `ancienPropre` | **Acceptées.** (a) `#acheverRepartir` → `#dossierOuPrepare` (`:843`) : `NOUVELLE_GENERATION` avec G de cet appareil suppose qu'un fichier de G a été lu, donc qu'un dossier est présent. La branche « dossier absent » est inatteignable, mais ma ST n° 11 b l'exigeait. Bruce l'a suivie et l'a couverte par UT-COMP-US-017-3-114, en forçant `controlerDrive` par un `vi.mock`. (b) `ancienPropre !== undefined` (`:1076`) : `#deposer` a toujours mémorisé un fichier propre avant `#demenager`, puisque `doitDeposer` est vrai sans fichier propre. Le test est un rétrécissement de type, couvert par UT-COMP-US-017-3-116 avec une fausse méta. Les deux gardes sont conservatrices : dans un état impossible, elles n'écrivent rien de plus. Les retirer demanderait de discriminer `Vue` par la présence d'un dossier, un remaniement du cœur que leur valeur ne justifie pas. Je le consigne dans l'historique de la ST v0.10.3 (n° 11 b). Suggestion RC-US-017-16 sur la fragilité d'UT-COMP-US-017-3-116. |
| 6 | Tests UT-COMP-US-017-3-101 à 116 de Bruce : numérotation et règle `-3-` | **Conformes.** Les numéros sont uniques et dans la série de Bruce (101 à 108 pour « Repartir de zéro », 109 à 116 pour les pannes et les cas limites). La règle `UT-COMP-US-017-3-\d+` → 10 précède `UT-COMP-US-017-\d+` → 3 : ces tests sont donc bien au rang 10 (sinon ils tourneraient dès le rang 3 et seraient rouges sur les rangs intermédiaires). Le balayage des pannes est de bonne facture : chaque appel du transport et du dépôt est mis en échec tour à tour, puis on vérifie l'issue et la convergence de la reprise vers le même état. C'est plus fort que des cas choisis à la main. **Une ambiguïté antérieure** : UT-COMP-US-017-3-1 à 5 (Bruce, R3) et UT-COMP-US-017-3-01 à 05 (Benjamin, D1) sont des identifiants distincts mais qu'on confond à la lecture (RC-US-017-17). |
| 7 | Q-ANT-E13-R9-1, Q-ANT-E13-R9-2, DT-027 | **Toujours ouvertes**, sans réponse de Starck. Le DAT §4.2.1 dit encore « (cas à trois appareils seulement) » (l. 548). Le rang 10 ne touche ni la détection ni l'égalité structurelle : il n'aggrave pas DT-027 et ne la règle pas. Elles restent non bloquantes, avec leur échéance (avant l'E13b). Jarvis doit les relancer auprès de Starck : la deuxième change peut-être une règle avant la recette. |
| 8 | Nouvelles dettes | **DT-036** inscrite (registre v0.34). DT-026, DT-028 et DT-031 passent à « Remboursée », DT-030 à « Partiellement remboursée ». DT-029 reste « En cours » (§6). |
| 9 | Conformité aux US et aux RG, qualité, checklist | **Conforme, sauf RC-US-017-12 à 17.** Détail :<br>• Contrôles 1 à 3 : précédence `FORMAT_PLUS_RECENT` > `NOUVELLE_GENERATION` > altération > `SYNCHRONISER` (n° 3, DEC-030).<br>• « Qui affiche `ERR-012` » (n° 4, DAT §4.2.2 a).<br>• Version du fichier propre : égalité de chaînes, sans ordre (C4).<br>• Orphelins (C8) : jamais supprimés sous `ALTERATION` ou `FORMAT_PLUS_RECENT`.<br>• Dossier en double : nouvel inventaire, puis corbeille (C5).<br>• « Restaurer » : mémorisé hors ligne, exécuté après les contrôles (S20b, S22c) ; fichier réécrit en place (C7) ; identifiant mémorisé avant le manifeste.<br>• « Repartir de zéro » : réseau exigé, jamais mémorisé (S22b) ; ordre fichier → manifeste → réinitialisation ; échec → état local intact sauf `dernierHlc`.<br>• `deposerMaintenant` refusé pendant une altération connue.<br>• Une erreur transitoire n'est jamais une altération (S23, UT-COMP-US-017-39).<br>• Carte `ALR-003` / `ALR-004` (DT-026) et focus en fin de « À lire » (DT-028) : conformes à leur critère.<br>• Le contrôleur met `decisionReportee` à zéro quand `ERR-012` disparaît. `TST-RESTAUREE` n'apparaît que si la restauration connue change et vient de cet appareil.<br>• Fonctions courtes et nommées, `switch` exhaustifs sans `default` (comme demandé au rang 9), `Resultat` partout, aucune exception métier.<br>Remarques : duplication de l'ordre canonique (RC-US-017-15) ; texte composé dans un composant (RC-US-017-14). |

### 3.1 Tests fournis en E10 modifiés par un développeur

| Test | Modification | Décision |
|---|---|---|
| UT-US-017-72 (« copie vide ») | Attendu remplacé par la variante `copie-vide` d'`ERR-012`. L'égalité stricte est gardée et une inclusion de texte ajoutée. | **Acceptée** : le texte est imposé par le guide v0.2.21 §6.6.8, arrivé après l'E10. Rien n'est affaibli. |
| UT-COMP-US-017-15, UT-COMP-US-017-39, UT-US-017-109 | Réécrits par moi (ST v0.10.2, Q-BRU-2). | Hors revue. |
| UT-COMP-US-003-07 (Benjamin) | « aucune case » devient « pas de case "Terminer", une case "Rouvrir" ». | **Acceptée** : le comportement attendu change avec DT-030. L'assertion est plus précise, pas plus faible. |
| UT-COMP-US-001-73, UT-COMP-US-025-04 et la transition de `saisir` vers `renseigner` (DT-029) | Assertions placées dans `waitFor` ; nombres d'appels inchangés, et l'appel unique de `surValider` toujours vérifié après coup. | **Acceptée** (plan de DT-029). Voir RC-US-017-12 pour l'effet de bord sur UT-COMP-US-002-87. |
| Doublures d'`ApplicationInterface` (`controleur-interface`, `controleur-reessai`) | Ajout de `RESTAURATION_ABSENTE`. | **Acceptée** : adaptation mécanique au port élargi, aucune assertion touchée. |

## 4. Remarques

Gravité et statut selon la grille habituelle. Itération 1 pour toutes.

### 4.1 Interface, étapes et tests de composants (Benjamin)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-12 | **Majeure** | CI verte avant l'approbation (OPT-16) ; CR-71, CR-72b ; DT-029 | `tests/unitaires/objectifs-taches/presentation/ui/corrections-rang5.test.tsx:44-52` (UT-COMP-US-002-87) ; `tests/support/ui-objectifs.ts` (`renseigner`) | La CI de `05cf02f` est rouge 3 fois sur 6 : `document.activeElement` est `ion-modal`, pas le `spinbutton`, même après `waitFor`. Avant ce rang, `saisir` (frappe touche par touche) laissait à la modale le temps de finir sa présentation. `renseigner` va trop vite : la modale prend le focus **après** que le composant l'a donné au champ invalide. C'est une course introduite par la branche, de la même famille que DT-029. | Attendre la fin de la présentation de la modale (`ionModalDidPresent`, ou un utilitaire `attendrePresentation()` dans `ui-objectifs.ts`) avant de renseigner les champs et de valider, dans ce test et dans tout test qui renseigne puis valide dans une `SaisieRapide` ou une `FeuilleObjectif` ouverte. Ne pas allonger les délais, ne pas retirer l'assertion de focus. Vérifier ensuite sous charge (suite `ihm` lancée 4 fois en parallèle, `TZ=America/New_York`) et obtenir une CI verte sur les 6 jobs. | Ouverte |
| RC-US-017-13 | **Majeure** | Test qui fait foi non affaibli ; ST-US-017 v0.10.3 §12.6 R4 | `tests/steps/synchronisation/etat-affiche.steps.ts:174-200` | Le repli d'`ERR-012` (un échange avec le Drive, en rétablissant le réseau au besoin) s'applique aussi aux assertions « Alors … est affiché ». Il rattraperait une première détection en échec (décision 3). | Ajouter un crochet `BeforeStep(function ({ pickleStep }) { this.typeEtape = pickleStep.type; })`, avec `typeEtape` déclaré dans `MondeDoneJuan`. N'appliquer `constaterDonneesAbsentes` que si `this.typeEtape === 'Context'`. En assertion (`Outcome`), lire seulement la vue. Critère : `pnpm cucumber` vert ; un essai local qui neutralise la détection au premier cycle (non commité) fait échouer S18 et S32 en assertion. | Ouverte |
| RC-US-017-14 | Mineure | CR-16, CR-44 ; précédent RC-US-017-7 | `src/objectifs-taches/presentation/ui/composants/ligne-tache.tsx:61` ; `modeles-de-vue/ligne-tache.ts:42`, `:175-176` | `MentionIncoherence` appelle `libelle(incoherence.code)` dans le composant. Le texte doit venir du modèle de vue. | Ajouter `libelle` à `LigneTache.incoherence` (`{ code: 'MEN-INCOHERENCE'; libelle: string }`), rempli par `modeleIncoherence`, et retirer l'import de `libelle` dans `ligne-tache.tsx`. Ne pas toucher aux assertions d'UT-COMP-DT-031-01. | Ouverte |

### 4.2 Adaptateur Drive (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-15 | Mineure | CR-22 (duplication d'une règle) | `src/synchronisation/infrastructure/drive/transport-synchro-drive.ts:104-106` ; `src/synchronisation/domaine/manifeste.ts:57-58` | L'ordre canonique (`creeA`, puis `id` en unités de code) est écrit deux fois : `comparerCanonique` du domaine et une copie locale dans l'adaptateur. | L'adaptateur importe `comparerCanonique` du domaine (`ElementDrive` correspond à `ElementDatable`) et supprime sa copie. La dépendance de l'infrastructure vers le domaine est permise (dependency-cruiser). | Ouverte |

### 4.3 Cycle et tests (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-16 | Suggestion | Lisibilité des tests | `tests/unitaires/synchronisation/application/cycle-synchronisation-invariants.test.ts:113-135` (UT-COMP-US-017-3-116) | La fausse méta retire `fichierPropre` à la **deuxième** lecture (`relectures !== 2`). Le test dépend du nombre de lectures de méta faites par le cycle. Un remaniement qui en ajoute une ferait porter la panne sur une autre lecture, et le test pourrait passer pour une autre raison. | Facultatif : déclencher la panne sur la lecture faite par `#demenager`, repérée par un drapeau posé à la création du fichier dans le dossier canonique (`deposerFichierAppareil` sur ce dossier), au lieu d'un compteur. | Ouverte (suggestion) |
| RC-US-017-17 | Mineure | Conventions §11.14 (identifiants de tests) | `tests/unitaires/synchronisation/infrastructure/depot-local-dexie-incrementation3.test.ts:26`, `:59`, `:102`, `:133`, `:148` | UT-COMP-US-017-3-1 à 5 (Bruce, R3) et UT-COMP-US-017-3-01 à 05 (Benjamin, D1) désignent des tests différents. Ces identifiants ne diffèrent que par un zéro, et une recherche de « 3-1 » les mélange avec 3-10 à 19 et 3-101 à 116. | Renommer UT-COMP-US-017-3-1 à 5 en UT-COMP-US-017-3-117 à 121, à la suite de la série de Bruce. Le libellé et les assertions restent les mêmes. | Ouverte |

Le cœur de synchronisation (`cycle-synchronisation.ts`, `controle-drive.ts`, `ecriture-manifeste.ts`, `donnees-effacees.ts`, `manifeste.ts`, cas d'usage) n'appelle **aucune remarque bloquante ni majeure**.

## 5. Questions ouvertes (via Jarvis)

- **Q-ANT-E13-R10-1** (Starck, puis Pepper si la règle change ; non bloquante) : le DAT v0.11.10 §4.2.2 (e) dit que l'auteur compte les entrées `DONNEES_EFFACEES` « comme à lire ». La ST (H-6 ; §6.6 n° 6, n° 13) et la réalisation ne les comptent pas : la carte `ALR-008` est affichée, mais n'entre ni dans `aLire` ni dans le décompte « À lire ». Proposez-vous : a) de corriger le DAT en « les détaille (carte `ALR-008`), sans les compter dans `aLire` (H-6) » ★ ; b) de les compter (`MOTIFS_A_LIRE` étendu, UT-US-017-47 et 58 à changer, impact sur `SYN-INFO`) ?
- **Q-ANT-E13-R9-1** et **Q-ANT-E13-R9-2** (Starck) : sans changement, à relancer.

## 6. Dette (registre v0.34)

- **DT-036** (nouvelle, P2) : ancien fichier propre du déménagement et doublon de manifeste non repris après un échec de mise à la corbeille (décision 4).
- **DT-026** : remboursée (carte d'incohérence et actions, tests verts ; contrôle de Steeve en E14).
- **DT-028** : remboursée (focus rendu à l'indicateur ; cible à confirmer par Steeve en E14).
- **DT-030** : partiellement remboursée ; reliquat ECR-007 A, avec ma ST due avant l'E12 du rang 11 (décision 2).
- **DT-031** : remboursée, sous réserve de RC-US-017-14.
- **DT-029** : reste « En cours » (RC-US-017-12 ; critère des 50 exécutions non mesuré).
- **DT-027** : inchangée (Q-ANT-E13-R9-2).

## 7. Apports d'Anthony dans ce commit

- ST-US-017 v0.10.3 : §12.6 R4 (repli limité à la précondition, mécanisme `BeforeStep`), §6.7 n° 14 (limite connue, DT-036), historique (n° 11 b : garde défensive acceptée).
- Registre de la dette v0.34.
- Ce rapport.

Aucun code de `src/` ni aucun test n'est modifié.

## 8. Verdict

**Changements requis.**

| Remarque | Gravité | Responsable | Bloque l'approbation |
|---|---|---|---|
| RC-US-017-12 | Majeure | Benjamin (sonnet) | **Oui** (CI rouge) |
| RC-US-017-13 | Majeure | Benjamin (sonnet) | **Oui** |
| RC-US-017-14 | Mineure | Benjamin (sonnet) | Non, à faire dans le même passage |
| RC-US-017-15 | Mineure | Bruce | Non, à faire dans le même passage |
| RC-US-017-17 | Mineure | Bruce | Non, à faire dans le même passage |
| RC-US-017-16 | Suggestion | Bruce | Non |

Les remarques de Bruce sont mécaniques (un import, un renommage d'identifiants) : selon OPT-18, elles peuvent être confiées à un agent sur sonnet. Le cœur de synchronisation lui-même n'est pas à reprendre. La nouvelle revue portera seulement sur ces remarques et sur le différentiel, avec une CI verte sur les 6 jobs.
