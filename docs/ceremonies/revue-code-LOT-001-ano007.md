# Revue de code E13 : correction d'ANO-007 (PR `ano/ANO-007` vers `lot/LOT-001`)

Relecteur : Anthony (E13 courte). Commit relu : `8dc6faf`. Verdict : **Changements requis** (1 remarque bloquante, 2 non bloquantes).

## 1. Correctif CSS (`src/commun/presentation/ui/styles.css`)
- `.boite-confirmation { z-index: 3 }` couvre les trois boîtes : `BoiteConfirmation` et le sélecteur de parent (y compris le refus « Compris ») partagent `.scrim` + `IonBackdrop` + `.boite-confirmation` ; e2e vert sur les trois.
- Pas de nouveau recouvrement : `.scrim` est `position: fixed; z-index: 30000`, il crée son propre contexte d'empilement. Le `z-index: 3` n'est comparé qu'à l'`ion-backdrop` (2) du même contexte et ne peut pas dépasser un toast, une feuille, une `ion-modal` ou l'action sheet Ionic (overlays Ionic ~ 20000 ; le `.scrim` à 30000 reste, comme avant, au-dessus d'eux). Aucun autre `z-index` dans `src/`.
- Clavier, focus (`Annuler` au premier plan), `aria-modal`, `role` : composants inchangés.

## 2. Tests
- Harnais `boites.html/.tsx` : servi par le serveur `vite` de développement (port 4174), pas par le build de production (entrée `index.html` seule) ; `pnpm architecture` et `verifier:depot` verts ; il n'appartient pas à `src/` donc n'a pas à figurer dans `rangs-fichiers.json` (couverture limitée à `src/`).
- Mutation rejouée (Chromium `/opt/pw-browsers`) : avec le correctif 9 verts ; en remettant `z-index: 1`, **6 rouges** (clic et toucher, 3 boîtes), les 3 tests « fond » restent verts (attendu). Le test échoue donc bien sans le correctif.
- DT-024 : critère (clic sur le fond, la boîte reste ouverte, aucun rappel) rempli par UT-COMP-DT-024-01 et 02 (jsdom : absence de rappel, limite connue et déclarée dans l'en-tête du fichier) et par les 3 cas e2e du fond en navigateur réel. Suffisant.
- Étape `@ihm` remise au clic (`compte.steps.ts`), commentaire de contournement retiré.

## 3. Remarques
- **RC-ANO007-01 (bloquante)** : `tests/support/rangs/rangs-tests.json` n'a aucune règle pour `UT-COMP-DT-024-\d+`. Sans règle, `rangDuTest` renvoie `undefined` et le test est **ignoré** : `vitest run` sur le fichier donne « 2 skipped », même avec `RANG_COURANT=99`. Les tests de DT-024 ne s'exécutent donc jamais dans `pnpm test` ni en CI (avec règle, ils passent : 2/2, vérifié via `-t`). Action : ajouter `{ "motif": "UT-COMP-DT-024-\\d+", "rang": 13 }` (rang courant : 13 ; modèle : `UT-COMP-DT-03[01]-\\d+`), puis vérifier « 2 passed ». Règle de rang : tenue par Anthony, ajoutée à l'E13 de la PR qui introduit les tests (`conventions.md` §11.14) ; non poussée ici (revue en lecture seule du code, docs seulement), à faire par Benjamin ou par Anthony sur la branche à la demande de Jarvis.
- **RC-ANO007-02 (non bloquante)** : `boites.tsx` recopie les arguments de `construireSelecteurParent` déjà présents dans `fond-des-boites.test.tsx` ; extraire une fabrique de test partagée au prochain passage (sans dette nouvelle).
- **RC-ANO007-03 (non bloquante)** : l'e2e clique à `(5,5)` pour « le fond » ; viser le centre de `ion-backdrop` hors boîte serait plus robuste si la taille de la boîte évoluait.

## 4. Dette et suivi
- DT-024 : « Remboursée à la fusion » (inchangée). Registre passé en v0.46 (ligne ajoutée) ; aucune dette nouvelle ; numérotation des versions à la fusion (OPT-20).
- ANO-007 : « Corrigée, en revue » : conforme. Passage à « Close » à la fusion et à la vérification de l'E14.
- `pnpm verifier` : vert (0 erreur).
