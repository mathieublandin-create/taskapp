# Revue de code E13 — LOT-001, rang 2 (US-001, objectifs)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-28 |
| Branche | `us/US-001-objectifs` @ `bcd1149` (PR #4, base `lot/LOT-001`) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 72 fichiers, + 2 926, − 364 (OPT-7) |
| Référentiel | ST-US-001 (§3, §12 à §15), `conventions.md` v0.4.5 (§11.14, §12), `dette-technique.md`, lancement LOT-001 (Benjamin), rang 2 |
| Passage | 1 |

## 1. Verdict : **À reprendre** (passage 1) ; **Approuvé** au passage 2 (§8)

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

### Réponses de Benjamin (correction, itération 1/2)

**RC-R2-1.** Réponse de Benjamin : corrigée.
- (a) Écrans créés en Ionic : `presentation/ui/ecrans/liste-objectifs.tsx` (ECR-008), `detail-objectif.tsx` (ECR-003), `espace-objectifs.tsx` (navigation, feuilles, menu, confirmation, toast) ; `composants/ligne-objectif.tsx`, `progression-objectif.tsx`, `feuille-objectif.tsx`, `menu-objectif.tsx` ; `etat/magasin-objectifs-taches.ts` (Zustand) ; `libelles-ui.ts` (libellés sans code de catalogue, comme « Annuler ») ; styles `commun/presentation/ui/styles.css`. Les 9 fichiers `src/objectifs-taches/presentation/ui/**` sont dans `rangs-fichiers.json` en `{ 2, 2 }`.
- (b) Branchement dans `main.tsx` (`IonApp`, `setupIonicReact`, CSS Ionic, `EcransObjectifs`). L'`Application.objectifs()` est lue par le contrôleur, qui reçoit un troisième paramètre optionnel (`web.ts` lui passe `application.objectifs`) ; les tests existants du contrôleur ne changent pas.
- (c) La feuille déclare `registreSaisie.declarer('feuille-objectif-<mode>', modifie)` dès que les valeurs diffèrent du départ, et le retire à la fermeture (UT-COMP-US-001-60, 62, 70).
- (d) Tests de composants : `tests/unitaires/objectifs-taches/presentation/ui/{ecrans-objectifs,espace-objectifs,composants-objectifs}.test.tsx` (UT-COMP-US-001-41 à 78) et `magasin-objectifs.test.ts` (80 à 89). Le détail du modèle de vue gagne `progression` et `nomAccessible` (ajout sans effet sur les tests fournis).
- Limites : le magasin se rafraîchit après chacune de ses commandes ; il n'écoute pas `DepotLocal.observer` (`ServiceEtatLocal` ne l'expose pas). Les fusions distantes (rang 3, US-017) devront l'alimenter. Les tâches du détail et les actions PLACER / CREER_SOUS_OBJECTIF viennent avec leurs US.

**RC-R2-2.** Réponse de Benjamin : corrigée, `TZ=UTC pnpm test:couverture` est vert sans toucher aux seuils ni `v8 ignore` (lignes 97,58 %, branches 91,78 %). Tests : `commun/presentation/format-et-libelle.test.ts` (UT-COMP-US-001-03 à 09 : `appareilDepuisAgent`, `formaterDate`, `libelle` pluriel, insécables, erreurs de programmation, `aUnePartie`, `aUneVariante`) ; `objectifs-taches/presentation/modeles-de-vue-complements.test.ts` (10 à 23 : toutes les confirmations, détail, refus, ordre de référence, `libelleIndicateur`, code inattendu de `construireConfirmationCompte`) ; `commun/presentation/ui/composants-communs.test.tsx` (24 à 35 : `Toast`, `BoiteConfirmation`, `EtatVide`, `NoteHeureParis`, `DialogueConfirmation` avec texte) ; les écrans (RC-R2-1 d). Reste non couvert, volontairement : la branche `nonImplemente` de `messagesDeRefus` (refus des rangs 3 à 6).

**RC-R2-3.** Réponse de Benjamin : corrigée dans `tests/unitaires/composition/controleur-reessai.test.ts`. UT-COMP-US-022-205 : la suite d'une confirmation rejouée est celle de **« Supprimer les données »** (confirmée, puis `EspaceInaccessible`, puis « Réessayer » : `supprimer` appelé 2 fois, session fermée). Ce n'est pas la déconnexion que demandait la revue : la suite de `SeDeconnecter` ignore son résultat et ne lève jamais ERR-014, donc elle ne peut pas être rejouée. UT-COMP-US-022-206 : `reessayerSuppression` en échec, puis « Réessayer » rappelle `supprimerDonnees.reessayer()` (2 appels, toast effacé, session fermée).

**RC-R2-4.** Réponse de Benjamin : corrigée, avec un désaccord partiel et justifié sur `BoiteConfirmation`.
- `Toast` en `IonToast` (`role` et `data-etat` sur l'hôte, 4 s / 6 s, persistant pour ERR-014, bouton d'action du catalogue) ; `EtatVide` et `NoteHeureParis` avec `IonButton` ; `EtatVide.surAction` devient facultatif (pas de bouton tant que le geste n'existe pas : « Ajouter une tâche » arrive au rang 5).
- `BoiteConfirmation` : `IonBackdrop`, `useId()` et le type `CodeCatalogue` (RC-R2-8 b et c) ; elle **garde ses boutons natifs et sa structure** parce que UT-COMP-US-022-83 (test d'Anthony, non modifié) exige un `alertdialog` portant `data-code`, `data-rouge` sur le bouton, des boutons trouvés par `getByRole('button')` et le focus sur « Annuler » **synchrone** après `render`. `IonAlert` ne permet pas de poser `data-code` sur le rôle `alertdialog` ; `IonModal` ne monte son contenu qu'après présentation (asynchrone) ; `IonButton` n'expose pas de `button` hors de son DOM fantôme. **Décision demandée à Anthony** : adapter UT-COMP-US-022-83 (attentes asynchrones, requêtes sur `ion-button`) pour passer en `IonModal`/`IonButton`, ou accepter cet état.
- Pièges Ionic relevés et traités : les propriétés booléennes ne deviennent pas des attributs (`aria-expanded`, `aria-invalid` passent en chaîne) ; Ionic retire `aria-label` de l'hôte d'un `ion-button` pour le reporter dans son DOM fantôme.

**RC-R2-5.** Réponse de Benjamin : corrigée, `tests/unitaires/commun/presentation/registre-saisie.test.ts` renomme les tests en UT-COMP-US-001-01 et 02 ; mon premier test complémentaire de la plage suivante est le 03.

**RC-R2-6.** Réponse de Benjamin : corrigée dans `tests/steps/compte/connexion.steps.ts` : l'évaluation doit réussir (`assert.ok`), et `CONFIRMATION_REQUISE` est exigée si n > 0 ; la déconnexion est ensuite toujours exécutée (cas n = 0 inclus).

**RC-R2-7.** Réponse de Benjamin : acceptée. `APPAREIL` est une constante du module `main.tsx`, calculée une fois (le premier énoncé reste l'appel à `demarrerWeb`, UT-COMP-US-022-87).

**RC-R2-8.** Réponse de Benjamin : (a) constante `LIBELLE_ANNULER` conservée et exportée, partagée par la boîte, la feuille et le menu, en attendant la réponse de Steeve ; (b) `code: CodeCatalogue` ; (c) `useId()`. Faits.

**Points à signaler à Anthony et Starck.**
- `vitest.config.ts` (projet `ihm`) : `resolve.conditions: ['browser']` et `server.deps.inline` pour `@lit/react` et `@stencil/react-output-target`. Sans cela, l'export « node » de `@lit/react` (rendu serveur) n'applique aucune propriété aux composants Ionic dans jsdom.
- CSP (`index.html`, `style-src 'self'`) : Ionic pose des styles en ligne depuis son code (`style` d'overlays, feuilles de style des composants). À vérifier en recette sur un navigateur réel (non vérifiable en jsdom). Si la CSP bloque, une décision d'architecture est à prendre (nonce ou assouplissement ciblé).
- Les tests des superpositions Ionic dans jsdom attendent `ionModalDidPresent` / `DidDismiss` (`tests/support/ui-objectifs.ts`) ; sans cela, Ionic déplace le focus en cours de saisie.

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

## 8. Passage 2 (itération 2/2), 2026-10-29

**Périmètre** : `git diff cb80fb4..8bfcd8a` (corrections de Benjamin) et remarques ouvertes du §4 seulement.

### 8.1 Verdict : **Approuvé**

### 8.2 Contrôles exécutés (Node 24, `8bfcd8a`)

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` | Vert (code de sortie 0 ; tags, rangs, hygiène : 0 erreur) |
| `pnpm test` | 481 réussis, 219 ignorés (rangs ultérieurs), 0 échec |
| `TZ=UTC pnpm test:couverture` | Vert, seuils inchangés : lignes 97,58 %, branches 91,78 %, fonctions 96,6 % |
| `pnpm cucumber` | 43 scénarios, 344 étapes réussis |
| CI de la PR #4 sur `8bfcd8a` | Entièrement verte, couverture comprise (selon Jarvis) |
| Recherche de `v8 ignore`, `.skip`, `.only`, `eslint-disable`, `as any`, `@ts-` dans le différentiel | Aucune occurrence |

### 8.3 Remarques du §4

| Id | Statut | Constat |
|---|---|---|
| RC-R2-1 | **Levée** | Écrans ECR-008 et ECR-003, composants, feuille, menu et magasin Zustand livrés en Ionic ; entrées `{ 2, 2 }` présentes ; écran branché dans `main.tsx` par `controleur.objectifs()` (paramètre optionnel, sans effet sur les tests existants) ; `registreSaisie.declarer` posé et retiré par la feuille (UT-COMP-US-001-60, 62, 70). Le magasin ne contient aucune règle métier, distingue refus métier et erreur du dépôt (ERR-014) et s'appuie sur les modèles de vue. Tests de composants 41 à 89 avec assertions de texte, de rôle, de `data-etat` et d'appel. Limite acceptée : voir 8.4, point 5. |
| RC-R2-2 | **Levée** | Couverture verte sans baisse de seuil ni `v8 ignore`. Les tests complémentaires (UT-COMP-US-001-03 à 35) vérifient des textes exacts et des issues, pas seulement l'exécution. |
| RC-R2-3 | **Levée** | Voir 8.4, point 4. |
| RC-R2-4 | **Levée** | `Toast`, `EtatVide`, `NoteHeureParis` en Ionic ; `BoiteConfirmation` : voir 8.4, point 1. |
| RC-R2-5 | **Levée** | UT-COMP-US-001-01 et 02. |
| RC-R2-6 | **Levée** | `connexion.steps.ts:376` : l'évaluation est exigée, `CONFIRMATION_REQUISE` aussi quand n > 0. |
| RC-R2-7 | **Levée** | Constante `APPAREIL` du module, calculée une fois ; `demarrerWeb` reste le premier énoncé (UT-COMP-US-022-87 vert). |
| RC-R2-8 | **Levée** | (b) `CodeCatalogue`, (c) `useId()` faits ; (a) `LIBELLE_ANNULER` partagée, en attente de la réponse de Steeve (rang 3 si un code est créé). |

### 8.4 Décisions sur les points signalés par Benjamin

1. **`BoiteConfirmation` en HTML sémantique : accepté, UT-COMP-US-022-83 n'est pas modifié.** Le test fixe le contrat d'accessibilité du guide (§4.12, §6.6.7) : `alertdialog` qui porte `data-code`, action rouge, focus **synchrone** sur « Annuler ». `IonAlert` ne permet pas de poser `data-code` sur le rôle ; `IonModal` présente son contenu de façon asynchrone, ce qui laisse une fenêtre où le focus n'est pas sur « Annuler ». Le contrat d'accessibilité prime sur l'uniformité des composants. La boîte utilise `IonBackdrop` et les styles du gabarit ; Steeve contrôle le rendu en E14. Ce n'est pas une dette : la décision est consignée dans DT-006.
2. **`vitest.config.ts`, projet `ihm` : accepté.** `resolve.conditions: ['browser']` et `server.deps.inline` pour `@lit/react` et `@stencil/react-output-target` ne concernent que la résolution des modules du projet de tests jsdom. Ils n'affectent ni la construction ni les seuils, et le motif est commenté. Sans eux, les propriétés Ionic ne seraient pas appliquées et les tests de composants ne prouveraient rien. Je reporterai la règle dans `conventions.md` (stratégie de tests de l'IHM) à la prochaine mise à jour.
3. **CSP `style-src 'self'` et Ionic : question pour Starck, avec une inscription en dette.** La CSP relève du DAT : je ne tranche pas en revue de code. **Q-ANT-E13-R2-1 (à Starck, via Jarvis)** : si la vérification en navigateur réel montre des violations CSP dues aux styles injectés par Ionic, quelle option retient-on : (a) nonce posé au build, (b) hachages des styles connus, (c) `'unsafe-inline'` limité à `style-src` ? Le risque est inscrit en **DT-008** (P2) ; la vérification est faite au plus tard en E14 du rang 2. Ce point ne bloque pas la PR.

   > **Réponse de Starck (2026-10-29) : option (c), `style-src 'self' 'unsafe-inline'`. Voir ADR-014 (Proposé) et DAT v0.11.6 §7.1.**
   >
   > - **Mesure** (`origin/lot/LOT-001`, `pnpm build` servi en statique, Chromium par Playwright, écouteur `securitypolicyviolation`) :
   >   - avec la CSP actuelle, **14 violations `style-src-elem`**, dont 2 dès l'écran de connexion. Toutes viennent du chargeur de styles de Stencil, qui insère un `<style>` dans `<head>` pour les composants « scoped » (`ion-buttons`, `ion-header`, `ion-input`, `ion-textarea`, `ion-action-sheet`, feuille globale d'`ion-app`) ;
   >   - **le rendu est dégradé**, par exemple `ion-buttons` en `display: block` au lieu de `flex` ;
   >   - les composants à Shadow DOM (`ion-button`, `ion-toast`, `ion-modal`) passent par `adoptedStyleSheets` et ne sont pas concernés ; les styles posés par le CSSOM (z-index des superpositions, `style` de React) non plus ;
   >   - avec un nonce (`<meta name="csp-nonce">`, lu nativement par Stencil) ou avec `'unsafe-inline'`, il ne reste aucune violation de style ;
   >   - constat annexe : une violation `script-src` `eval`, émise par la sonde de Zod 4 (`Function('')` dans un `try/catch`). Elle est sans effet fonctionnel, mais elle pollue la console.
   > - **Pourquoi pas (a)** : sur GitHub Pages, le nonce est fixe et publié dans `index.html`. Un attaquant qui sait injecter du HTML le recopie, donc la garantie est illusoire et la conformité trompeuse.
   > - **Pourquoi pas (b)** : il faudrait un hachage par composant et par mode, à régénérer à chaque version d'Ionic. Un oubli dégrade l'écran en silence et seulement sur l'appareil, car jsdom n'applique pas la CSP.
   > - **Pourquoi pas (d)** : aucune option d'Ionic ni de Stencil ne fournit ces styles en fichier externe.
   > - **Pourquoi (c) est acceptable** : `script-src` reste strict. L'injection CSS suppose une injection de HTML, déjà fermée (React, interdiction de `dangerouslySetInnerHTML`). Aucun secret n'est présent dans le DOM, puisque le jeton reste en mémoire.
   > - **Travail à faire** :
   >   - M1, `index.html` : `style-src 'self' 'unsafe-inline'`, avec un commentaire qui renvoie à ADR-014 ;
   >   - M2 : `z.config({ jitless: true })` au démarrage ;
   >   - ces deux corrections soldent DT-008, au rang 3 au plus tard, et de préférence en correctif avant E14 du rang 2, parce que les écrans d'US-001 sont aujourd'hui dégradés ;
   >   - M3 : test de fumée Playwright sans violation CSP sur le build servi en statique (Friday, rang 3) ;
   >   - Anthony : mise à jour de `conventions.md` §9.3 et de DT-008.
   > - **E14** : console sans violation sur Android et sur PC, flux GIS réel compris (PO-13 du DAT).
4. **UT-COMP-US-022-205 sur « Supprimer les données » : accepté.** Le plan de DT-007 visait « la suite d'une confirmation ». `SeDeconnecter.executer()` renvoie `Resultat<undefined, ErreurSansSession>` et ne peut pas lever ERR-014 : ma demande de rejouer la déconnexion était donc infondée. La suite de `CNF-SUPPR-DONNEES` exerce `#jouerSuite` de la même façon (2 appels, toast effacé, retour à la connexion). **DT-007 est remboursée.**
5. **Limites.**
   - (a) Le magasin ne s'abonne pas à `DepotLocal.observer` : accepté pour le rang 2, où l'écran est le seul écrivain. Le point est inscrit en **DT-009** (P2) et planifié au rang 3 (US-017, incrément 1).
   - (b) La branche `nonImplemente` de `messagesDeRefus` n'est pas couverte : accepté. Elle concerne les refus des rangs 3 à 6, les seuils sont atteints, et elle sera couverte par les tests fournis en E10 des US concernées. Aucune dette n'est inscrite.

### 8.5 Modifications faites par Anthony

- `docs/04-specification-technique/dette-technique.md` v0.9 : DT-007 remboursée ; DT-006 précisée ; DT-008 et DT-009 inscrites, avec leurs fiches.
- Aucune modification du code de production ni des tests.

### 8.6 Suite

US-001 est approuvée en E13. Q-ANT-E13-R2-1 est à transmettre à Starck par Jarvis. Pour E14, Steeve vérifie le rendu de `BoiteConfirmation` et la question RC-R2-8 a. La vérification CSP de DT-008 est à faire en navigateur réel.
