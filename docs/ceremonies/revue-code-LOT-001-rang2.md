# Revue de code E13 — LOT-001, rang 2 (US-001, objectifs)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-28 |
| Branche | `us/US-001-objectifs` @ `bcd1149` (PR #4, base `lot/LOT-001`) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 72 fichiers, + 2 926, − 364 (OPT-7) |
| Référentiel | ST-US-001 (§3, §12 à §15), `conventions.md` v0.4.5 (§11.14, §12), `dette-technique.md`, lancement LOT-001 (Benjamin), rang 2 |
| Passage | 1 |

## 1. Verdict : **À reprendre**

Le code livré est propre, mais le rang n'est pas complet. Quatre remarques sont bloquantes :

- RC-R2-1 : les écrans d'US-001 manquent ;
- RC-R2-2 : la couverture est sous les seuils, et la CI est rouge ;
- RC-R2-3 : DT-007 n'est testée que partiellement ;
- RC-R2-5 : le nommage des tests complémentaires n'est pas conforme.

Le domaine, l'application, les modèles de vue et les *step definitions* sont conformes à la ST et n'appellent aucune reprise.

## 2. Contrôles exécutés (Node 24, `bcd1149`)

| Commande | Résultat |
|---|---|
| `pnpm verifier` (formatage, lint, types, architecture, catalogue, tags, rangs, dépôt) | Vert. dependency-cruiser : 0 violation (173 modules) |
| `pnpm test` | Vert : 407 passés, 219 non sélectionnés (rangs ultérieurs), 0 échec |
| `pnpm cucumber` | Vert : 43 scénarios, 344 étapes |
| `pnpm cucumber:steps-inutilises` | Vert : 0 définition inutilisée |
| `pnpm test:performance` | Vert (1 test) |
| `pnpm test:couverture` | **Rouge** (voir RC-R2-2). Global : lignes 94,04 %, branches 85,34 % |

Tests fournis en E10 : UT-US-001-01 à 35 sont tous présents et verts, et aucun fichier de test fourni n'a été modifié. Le seul test existant qui change est `etat-synchronisation.test.tsx` (point 3, accepté). Aucune assertion n'est affaiblie.

## 3. Réponses aux points signalés par Benjamin

| # | Point | Décision |
|---|---|---|
| 1 | Entrées ajoutées à `rangs-fichiers.json` (UT-OUT-05) | **Acceptées.** Il y a en fait 11 entrées, toutes `{ debut: 2, fin: 2 }` : `appareil.ts`, `catalogue.fr.ts`, `modeles-de-vue/mention-heure-paris.ts`, `registre-saisie.ts`, `boite-confirmation.tsx`, `etat-vide.tsx`, `ui/mention-heure-paris.tsx`, `toast.tsx`, `composition/objectifs-taches.ts`, `types-actions.ts`, `objectifs-taches/index.ts`. Ce sont des fichiers créés au rang 2 sans squelette, donc `fin = 2` est correct (§11.14). Ces entrées manquaient de mon fait en E10 ; les écrans de RC-R2-1 seront ajoutés de la même façon. |
| 2a | UT-COMP-US-022-201 à 204 (« Réessayer ») | **Validés.** Je rattrape une lacune de mon E10 : DT-007 annonçait des tests fournis par moi. Les quatre tests vérifient de vraies issues : toast, racine, nombre de réouvertures, absence de notification. J'ai ajouté la règle `UT-COMP-US-022-2\d\d` au **rang 2** dans `rangs-tests.json` (auparavant, ils tombaient sous la règle du rang 1). Il manque deux cas du plan de DT-007 : voir RC-R2-3. |
| 2b | UT-US-001-901 et 902 (`RegistreSaisie`) | **Contenu validé, identifiants à changer** : voir RC-R2-5. La plage `UT-US-001-nn` est réservée aux tests fournis en E10. La règle `UT-COMP-US-001-\d+`, au rang 2, est ajoutée à `rangs-tests.json`. |
| 3 | `appareil` obligatoire sur `<Bandeau>` | **Accepté.** `{appareil}` est une variable des textes `BAN-` (guide §6.6.1). La rendre obligatoire évite tout texte incomplet. L'adaptation du test se limite à ajouter la prop, sans toucher aux assertions. Voir la suggestion RC-R2-7 sur l'endroit où l'appareil est calculé. |
| 4 | DT-006 partielle | **Le remboursement partiel est accepté.** Plus aucun texte n'est codé en dur dans `compte` ni dans `synchronisation`. Le pluriel est sorti des composants. Les libellés de portée d'ECR-010 restent hors catalogue, ce qui est justifié en commentaire. **Rattachement du reliquat** : les composants **créés au rang 2** (écrans d'US-001 ; `Toast`, `BoiteConfirmation`, `EtatVide`, `MentionHeureParis`) sont réalisés en Ionic **dans cette PR** (RC-R2-4). La migration vers Ionic des composants **du rang 1** (`src/compte/presentation/ui/`, `src/synchronisation/presentation/ui/`) est rattachée au **rang 3** (US-017, incrément 1), qui reprend la présentation de `synchronisation`. Le registre est mis à jour (v0.8). Le libellé « Annuler » en constante est accepté : voir la suggestion RC-R2-8. |
| 5 | DT-007 : second paramètre optionnel d'`apresOuverture` | **Accepté.** C'est conforme au plan de DT-007 (`OuvrirApplication.executer({ type: 'AUCUN' })`, puis `apresOuverture`). Le paramètre optionnel garde UT-COMP-US-022-107 et 108 inchangés. `#effacerToast` efface aussi le geste mémorisé : il n'y a donc pas de rejeu fantôme. |
| 6 | Q-BEN-E12-3 et `RegistreSaisie` | **Cycle rompu : confirmé.** `ActionObjectif` et `ActionTache` sont déplacés dans `types-actions.ts`, que `refus.ts` importe désormais. `actions.ts` les réexporte. dependency-cruiser est vert alors que `refus.ts` est à `debut = 2`, c'est-à-dire sans exemption. **`RegistreSaisie` branché dans `web.ts` : accepté sur le principe**, mais aucun formulaire n'appelle `declarer`, si bien que la garde rend toujours `false` : voir RC-R2-1 (c). |

## 4. Remarques

| Id | Bloquante | Localisation | Constat | Action attendue |
|---|---|---|---|---|
| RC-R2-1 | **Oui** | ST-US-001 §3 n° 28 à 30 et 32 ; §14 ; lancement LOT-001, rang 2 | Les **écrans et le magasin d'US-001 sont absents** : `presentation/ui/ecrans/liste-objectifs.tsx` (ECR-008), `detail-objectif.tsx` (ECR-003), `composants/ligne-objectif.tsx`, `progression-objectif.tsx`, `feuille-objectif.tsx`, `menu-objectif.tsx`, et `ui/etat/magasin-objectifs-taches.ts` (Zustand). Le plan du rang 2 les prévoit (§15, étape 6 ; lancement : « écrans, magasin Zustand »). L'application installée n'offre donc encore aucun geste métier. | (a) Créer les fichiers n° 28 à 30 et 32, en Ionic (RC-R2-4), conformes aux maquettes ECR-008 et ECR-003, et ajouter leurs entrées `{ 2, 2 }` à `rangs-fichiers.json`. (b) Brancher l'écran ECR-008 dans `main.tsx`, à la place de « les écrans métier arrivent au rang 2 » ; `objectifs()` de l'`Application` existe déjà. (c) La feuille de création (et le renommage, s'il est en ligne) déclare son état dans `registreSaisie.declarer(id, modifie)`, et le retire à la fermeture. (d) Ajouter les tests de composants du §14 : rendu des libellés du catalogue, `data-etat`, rôles, action déclenchée. |
| RC-R2-2 | **Oui** | `vitest.config.ts` (seuils `conventions.md` §12) ; CI « tests (UTC) » rouge | `pnpm test:couverture` échoue sur trois motifs : modèles de vue (branches 73,07 % pour 85 %) ; `commun/presentation/{format,messages}` (lignes 78,57 % pour 90 %, branches 53,84 % pour 85 %) ; `presentation/ui` (branches 46,8 % pour 60 %). Fichiers en cause, avec les lignes non couvertes :<br>- `commun/presentation/format/appareil.ts` : 0 % ;<br>- `format/date.ts` : branches l. 27-28 ;<br>- `messages/libelle.ts` : l. 33-34 (variable absente), 61-62 (variante inconnue), 74-75 (partie absente), `aUnePartie` et `aUneVariante` ;<br>- `objectifs-taches/.../confirmation.ts` : 2 branches sur 13. Les cas `SUPPRESSION_TACHE`, avec et sans sous-tâche, `AJOUT_SOUS_TACHE_TERMINEE`, `REOUVERTURE_SOUS_TACHE`, `ABANDON_TACHE` (cascade ou non) et `REPRISE_SOUS_TACHE` ne sont pas couverts, car le fichier est à `fin = 2` ;<br>- `detail-objectif.ts` : l. 75-79 (`niveauDe`, sous-objectif et parent sans intitulé), branches `description`, `enRetard`, `alerteDelai` ;<br>- `messages-de-refus.ts` : l. 21 et 33 ;<br>- `ordre-reference.ts` : l. 23-24 et 28 (départage par création puis intitulé) ;<br>- `synchronisation/.../indicateur-synchronisation.ts` : `libelleIndicateur` l. 86-93 (SYN-INFO, SYN-ATTENTE, SYN-HORS-LIGNE avec et sans attente) ;<br>- `compte/.../confirmations-compte.ts` : l. 30 et 43 ;<br>- composants `toast.tsx`, `etat-vide.tsx`, `mention-heure-paris.tsx` : 0 % ; `boite-confirmation.tsx` : branches l. 22 (Échap), 71 et 75 (sans texte) ; `compte/.../DialogueConfirmation.tsx` : l. 16. | Écrire des tests `UT-COMP-US-001-nn` (rang 2) qui couvrent ces branches **avec des assertions utiles** : texte exact, `data-etat`, rôle, appel du rappel. Cela inclut les tests de `libelle` (pluriel 0/1/2, insécables, erreurs de programmation) et de `formaterDate` (année différente) du §14. **On ne baisse pas les seuils et on n'ajoute pas de `v8 ignore`.** Les écrans de RC-R2-1 doivent aussi atteindre le seuil `ui`. |
| RC-R2-3 | **Oui** | `tests/unitaires/composition/controleur-reessai.test.ts` ; `src/composition/controleur-interface.ts:197`, `:273-279` | Le plan de DT-007 nomme trois gestes rejoués : `continuerAvecGoogle`, la suite d'une confirmation et `reessayerSuppression`. Seuls le premier et l'ouverture sont testés (201 à 203). `#jouerSuite` (rejeu récursif d'une confirmation) et `#permettreReessai(this.reessayerSuppression)` ne sont vérifiés par aucun test. `src/composition/**` étant exclu de la couverture, rien d'autre ne les garde. | Ajouter UT-COMP-US-022-205 : suite de confirmation (déconnexion confirmée) en échec `EspaceInaccessible`, puis « Réessayer » qui la rejoue. Ajouter UT-COMP-US-022-206 : `reessayerSuppression` en échec, puis « Réessayer » qui rappelle `supprimerDonnees.reessayer()`. Chaque test vérifie l'appel effectif et l'état du toast après le rejeu. |
| RC-R2-4 | Non (levée avec RC-R2-1) | `src/commun/presentation/ui/toast.tsx`, `boite-confirmation.tsx`, `etat-vide.tsx`, `mention-heure-paris.tsx` | Les composants communs créés au rang 2 sont en HTML sémantique. DT-006 prévoit les composants Ionic du gabarit, et `@ionic/react` est déjà en dépendance. | Les réaliser avec `IonToast`/`IonAlert` (ou `IonModal`) et les composants Ionic du gabarit, en même temps que les écrans de RC-R2-1. Conserver `role`, `data-etat` et le focus sur « Annuler ». |
| RC-R2-5 | **Oui** | `tests/unitaires/commun/presentation/registre-saisie.test.ts:6`, `:10` | Les identifiants `UT-US-001-901/902` sont pris dans la plage des tests fournis en E10. Un test complémentaire de Benjamin se nomme `UT-COMP-<US>-nn` (`conventions.md` §11.14, Q-BEN-E12-1). | Les renommer `UT-COMP-US-001-01` et `UT-COMP-US-001-02` ; la règle de rang est déjà en place. |
| RC-R2-6 | Non | `tests/steps/compte/connexion.steps.ts:376` | L'étape « les données du compte … sont conservées … avec n modifications en attente » ignore en silence une évaluation de déconnexion qui ne demande pas de confirmation, ou qui échoue. Avec n > 0, la confirmation `CNF-` est pourtant obligatoire : si elle disparaissait, l'étape passerait quand même. | Remplacer le `if` par une assertion : `assert.ok(evaluation.ok && evaluation.valeur.type === 'CONFIRMATION_REQUISE')`, puis `executer()`. |
| RC-R2-7 | Non (suggestion) | `src/main.tsx:49` | `appareilDepuisAgent(navigator.userAgent, …)` est recalculé à chaque rendu, dans l'interface. | Le calculer une seule fois dans `demarrerWeb` (composition) et l'exposer par le contrôleur ou par une constante du module. |
| RC-R2-8 | Non (suggestion) | `src/commun/presentation/ui/boite-confirmation.tsx:16`, `:6`, `:70-74` | (a) « Annuler » est un libellé générique du guide (§4.12, §6.6.7) sans code de catalogue : la constante est acceptée. Je demande à Steeve, via Jarvis, s'il crée un code `BTN-ANNULER` pour avoir une source unique ; si oui, ce sera au rang 3, avec le reliquat de DT-006. (b) `code: string` peut se typer en `CodeCatalogue`. (c) Les identifiants `dialogue-titre` et `dialogue-texte` sont fixes : préférer `useId()`. | À la discrétion de Benjamin. (a) attend la réponse de Steeve. |

## 5. Points vérifiés sans remarque

- **Domaine** : `construireIntitule` (Q-US-001-3), `normaliserDescription`, `etatObjectif` (RG-025, abandonnées exclues, garde-fou de cycle), `compteurObjectif` (tâches directes, CA-3), `estObjectifEnRetard` (RG-045), décisions sans écriture superflue (comparaison des `DateCalendaire` sous forme de chaîne, donc correcte), suppression sans écriture de liens (RG-046).
- **Application** : `avecVue`, `lireVueCourante` (jour de Paris), `SupprimerObjectif.evaluer`, qui n'écrit rien (§8.6).
- **Composition** : `objectifsDe` remet en mémoire l'assemblage à chaque changement de service (changement de compte).
- **Sécurité** : aucun secret, aucun jeton, aucune donnée personnelle ajoutée au journal technique. Les textes saisis ne sont jamais retouchés par la typographie (`libelle`).
- **Chemin d'écriture** (condition 2 de Starck) : UT-SOC-* et la suite de contrat `DepotLocal` sont rejoués et verts.

## 6. Modifications faites par Anthony dans cette revue

- `tests/support/rangs/rangs-tests.json` : règles `UT-COMP-US-022-2\d\d` (rang 2) et `UT-COMP-US-001-\d+` (rang 2).
- `docs/04-specification-technique/dette-technique.md` v0.8 : DT-006 et DT-007 passent « En cours » ; le reliquat de DT-006 (composants du rang 1) est rattaché au rang 3.
- Aucune modification du code de production.

## 7. Suite

Benjamin reprend RC-R2-1, 2, 3 et 5 (bloquantes) et RC-R2-4, ainsi que RC-R2-6 s'il le souhaite. RC-R2-7 et 8 sont à sa discrétion. La nouvelle revue ne portera que sur ces remarques et sur le nouveau différentiel. Question pour Steeve, via Jarvis : un code de catalogue pour « Annuler » (RC-R2-8 a) ?
