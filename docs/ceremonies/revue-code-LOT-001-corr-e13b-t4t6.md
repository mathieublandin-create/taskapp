# Revue de code E13 courte — LOT-001, rang 14 (corrections de l'E13b), tranches T4 à T6 et rang complet

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-15 |
| Branche | `fix/e13b-lot001` @ `dd83cf4` (fusion de T6, `rangCourant = 14` ; PR #46 en brouillon vers `lot/LOT-001`) |
| Auteur | Benjamin : T4 (« + » rond, colonne de 720 px), T5a (feuille modale non branchée, focus, Échap), T5b (branchement, retrait des rustines, étapes `@ihm`), T6 (vue initiale `OUVERTURE`, livraison du rang) |
| Périmètre | `git diff 1f0e569..dd83cf4 -- src tests/steps-ihm tests/unitaires tests/e2e tests/support` (fin de l'arbitrage UX de T4 → fin de T6) : 11 fichiers de `src`, 11 fichiers de tests. Les tests de T4 et de T5b ont déjà été arbitrés (ST v0.3 §6.5, v0.4 §13.2 bis) : seul leur code est relu ici. |
| Référentiel | ST-CORR-E13B-LOT-001 **v0.4** (portée à **v0.5** par cette revue), guide v0.2.27 §2.2, §6.6.15 à 17, `checklist-revue-code.md`, revue du rang 13 (format), revue de T1 à T3 |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm test` (rang 14, sans variable) sur `dd83cf4` | **Code de sortie 1** : 1 660 verts, mais une `TypeError` « insertBefore » non gérée levée par Ionic dans `boutons-natifs-complements.test.tsx` (UT-DT-014-07 et 08, **défaut de mon test**, RC-CORR-8). |
| `pnpm test` après ma correction | **Code 0** : 317 fichiers, **1 661 verts** (dont UT-ANO-004-08 ajouté), 0 erreur non gérée ; fichier corrigé relancé 3 fois sans erreur. |
| `pnpm verifier` | **0 erreur** (format, lint, types, architecture, catalogue, tags, rangs, hygiène), avec mes ajouts. |
| `pnpm e2e` (Chromium local, build `test-ihm` refait) | Les **48 tests existants : 48 verts**. Avec mes ajouts : **50 verts, 4 rouges attendus** (E2E-ANO-005-FEUILLE-13 à 600 et 639 px, FEUILLE-14 à 390 et 1280 px : RC-CORR-5 et 6). Avec les deux déclarations CSS demandées (réalisation locale annulée) : `feuille-synchronisation.e2e.ts` **16 sur 16** ; total attendu **54 sur 54**. |
| Couverture (`pnpm test:couverture`) | Global 98,22 % des instructions, 95,83 % des branches (base `lot/LOT-001` : 98,2 / 95,82). Fichiers de T4 à T6 mesurés : `bouton-flottant.tsx`, `boite-confirmation.tsx`, `racine.ts`, `Racine.tsx`, `focus-fin-a-lire.ts` à 100 % ; `FeuilleCompteEtSynchronisation.tsx` 100 % des lignes, 92,9 % des branches. |
| `pnpm verifier:couverture-fichiers` (base `lot/LOT-001` @ `6b10e91`, rapport local) | **20 fichiers comparés, 0 erreur** ; non comparés (absents de la base ou exclus) : `composition/**`, `main.tsx`, `FeuilleCompteEtSynchronisation.tsx` (squelette non mesuré à la base), `libelles-feuille.ts`. |
| Mutations (réalisations locales annulées) | `useFocusFinALire` qui ignore `cible` : UT-COMP-CORR-01 **rouge** ; feuille qui ignore `refTitre` : **rouge** ; `queueMicrotask` remplacé par un appel synchrone : UT-ANO-005-FEUILLE-09 et 10 **rouges** ; rejet de l'ouverture non géré ou mené à `ESPACE_INACCESSIBLE` : UT-ANO-004-08 **rouge**. |
| Navigateur réel (build `test-ihm`, compte A, Chromium) | §3. |

## 2. Points soumis

### 2.1 T4 : « + » et colonne
- **`bouton-flottant.tsx`** : conforme au §6.1 (plus d'étiquette, `aria-label` et `title` égaux au libellé, signature inchangée). Nom accessible : `getByRole('button', { name: 'Ajouter une tâche' })` trouve **un** bouton en navigateur réel (le nom de l'hôte `ion-fab-button` est relayé au bouton natif du shadow DOM par Ionic) ; `title` présent. 56 × 56 mesurés.
- **CSS** : `.espaces-contenu ion-fab` (16 px), `ion-fab-button` (56 px, `--border-radius: 50%`) et la colonne `@media (width >= 600px)` sont ceux du §6.2 ; `.bouton-flottant` et `.bouton-flottant-etiquette` sont retirés. **Conforme.**
- **Barre d'onglets sur PC** (accord du commanditaire) : conservée, dans la colonne (capture 1280 × 800). **Pas de mode sombre** : aucune règle `prefers-color-scheme` ajoutée. **Intitulé seul** : sans objet dans ce différentiel.

### 2.2 T5a : composant de la feuille
- **Rendu** : identique au §5.1 (identifiant, classe, `aria-label`, points d'arrêt, `handle`, `expandToScroll`, ordre « À lire », « Synchronisation », « Compte », dialogues dans la modale). Les extractions `EnteteFeuille`, `CorpsFeuille`, `useFocusDeLaFeuille`, `usePanneauLateral` servent `max-lines-per-function` sans changer le comportement : **acceptées**.
- **`const fenetre: Partial<Window> = window`** (`FeuilleCompteEtSynchronisation.tsx:58`) : **accepté**. C'est un élargissement sûr (aucun `as`, `Window` est assignable à `Partial<Window>`), qui rend l'appel optionnel `matchMedia?.` légitime pour le typage strict et le lint (`no-unnecessary-condition`) ; le commentaire dit pourquoi. Un `typeof window.matchMedia === 'function'` serait refusé par le lint pour la même raison.
- **`useFocusFinALire`** : signature étendue compatible (§5.2) ; UT-COMP-US-017-3-15 et 16 verts. Voir RC-CORR-9 (suggestion).
- **`boite-confirmation.tsx`, Échap en capture** (`:28-36`) :
  - fuite d'écouteur : non ; ajout et retrait avec le même drapeau `true` et la même fonction, dans le même effet ;
  - double déclenchement : seulement si deux `BoiteConfirmation` étaient montées en même temps (les deux écouteurs sont sur `document`, `stopPropagation` n'arrête pas un écouteur du même nœud). Cas inatteignable : `Dialogues` n'a qu'un exemplaire monté (racine **ou** feuille, `main.tsx`), et la confirmation de la saisie rapide n'existe que dans sa propre modale, sous un fond qui empêche d'ouvrir la feuille ;
  - autres modales Ionic : l'écoute d'Ionic sur `document` est en bouillonnement, après la capture ; tant qu'une boîte est affichée, Échap ferme la boîte seule, quel que soit l'overlay qui la contient (voulu, §5.1 bis n° 3 ; la saisie rapide en profite). Sans boîte, aucun écouteur : Ionic garde la main ;
  - `ion-action-sheet` : les menus « … » se ferment avant que l'action n'ouvre une boîte (`detail-tache.tsx`, action exécutée à la fermeture) ; ils ne coexistent donc pas avec une boîte. **Sans remarque.**

### 2.3 T5b : branchement
- **`main.tsx`** : structure du §5.2 respectée (ligne d'état, bandeau, toast, objectifs dans `main` ; feuille dans un fragment après `main` ; `Dialogues` monté une seule fois ; `FeuilleChoixRestauration` hors de la feuille). `useFeuilleOuverte` ajuste l'état pendant le rendu (motif React de l'« état dérivé ») et ferme la feuille en fin de session : **conforme**. Exclusion de la couverture : acceptée, le comportement est prouvé par E2E-ANO-005-FEUILLE-01 à 09 et les 13 scénarios `@ihm` (S16b, S16c rejoués sur la feuille).
- **« Voir » ferme la feuille avant de naviguer** (`main.tsx:309-313`) : décision intégrée à la ST v0.4, deux lignes lisibles. **Sans test** : non suffisant à terme, mais ni test unitaire (`main.tsx` exclu) ni test de navigateur (`test-ihm` ne sait pas produire une entrée « À lire ») ne sont possibles sans outillage nouveau ; **dette candidate CORR-c** (P3, LOT-002). Constat de comportement : le focus va ensuite au bouton « Compte et synchronisation » (§5.1 bis n° 2), pas au détail ouvert ; destination du focus ajoutée à **Q-CORR-STE-7** (Steeve, non bloquante). RC-CORR-10.
- **Retrait des trois rustines** : `overflow-y: auto` de `.espace-application`, `flex: 1 0 auto` et `min-height: 70dvh` de `.espaces`, `overflow: hidden` de `ion-content.contenu-avec-fab` : **plus aucune trace** dans `styles.css` (ni la règle ni son commentaire). E2E-ANO-005-FEUILLE-06 vert (390 × 844 et 360 × 480). RC-CORR-3 : **close**. Aucune règle de mise en page non justifiée ajoutée (§5.2 bis).
- **Étapes `@ihm`** : `actionDuCompte` n'a plus de double voie (ouvre la feuille si elle est fermée, cherche dans `ion-modal.feuille-synchronisation`) ; `feuilleDeSaisie` exclut la feuille ; `ouvrirDetail` touche le centre de la ligne (ANO-005 n° 1). **Conforme** au §12.2 et au §5.2 ter n° 4.

### 2.4 T6 : vue initiale `OUVERTURE`
- **`racine.ts`** : `EtatOuverture`, `construireRacine(etat, ouverture = 'ETABLIE')` à deux paramètres, valeur par défaut qui garde le banc inchangé : **conforme** au §7.1. `switch` sans `default: assertNever` : **accepté** ; l'exhaustivité est garantie par le type de retour (TS 2366 si un cas manque) et par `@typescript-eslint/switch-exhaustiveness-check` en erreur ; c'est la forme déjà en place dans ce fichier et dans `Racine.tsx`.
- **`Racine.tsx`** : `<main className="cadre-ouverture" aria-busy="true" />`, sans texte, sans `data-*` : ce n'est pas l'« écran d'attente » d'US-018 (S14, S19 lisent `[data-etat]`). Conforme au §7.4 ; UT-ANO-004-02 et E2E-ANO-004-01, 02 verts.
- **`controleur-interface.ts`** : état initial `OUVERTURE`, `ouvertureEtablie` posé par une session vue, par `apresOuverture` (avant tout traitement) et par `continuerAvecGoogle` (première instruction) : **conforme** au §7.2. **ANO-006 non régressée** : `#dernierCalcul` inchangé, le drapeau est posé avant l'`await` et ne publie rien seul ; UT-COMP-US-031-24 et 25 verts.
- **`web.ts`, rejet de l'ouverture** (`:240-250`) : `suivreOuverture` garde `UT-COMP-US-022-89` vert (retour lu une fois). La branche de rejet n'avait **aucun test** (défaut de mon E10, `composition/**` hors couverture) : **UT-ANO-004-08** ajouté (RC-CORR-7).

### 2.5 Tests, rangs, numérotation
- Tests fournis : intacts hors arbitrages déjà tracés (v0.3 §6.5, v0.4 §13.2 bis). Tests de Benjamin : UT-COMP-CORR-01 (obligatoire, présent, assertion exacte du `document.activeElement`, rougit sous les deux mutations exigées par le §5.2). **Aucun test affaibli.**
- `rangs-tests.json` : règle `UT-COMP-CORR-\d+` → 14 (posée en v0.3) ; mes ajouts (UT-ANO-004-08, E2E-ANO-005-FEUILLE-13, 14) relèvent des règles existantes. `rangs-fichiers.json` : aucun squelette restant (`nonImplemente` absent de `src/`) ; `verifier:rangs` 0 erreur. `rang-courant.json` : **14**.
- Numérotation : continue ; FEUILLE-13 et 14 ne réutilisent pas d'identifiant `E2E-…` (les UT-ANO-005-FEUILLE-08 à 12 sont unitaires).

## 3. Vérification en navigateur réel (build `test-ihm`, compte A)

| Mesure | 390 × 844 | 600 × 800 | 1280 × 800 |
|---|---|---|---|
| Colonne `.espaces` | x 0, largeur 390 | x 0, largeur 600 (`max-width: 720px` appliqué) | **x 280, largeur 720** (centrée) |
| « + » | 56 × 56, à 16 px du bord droit de la colonne | 56 × 56 | 56 × 56, x 928 (bord droit de la colonne − 16) |
| Défilement de la page | 0 | 0 | 0 |
| Ligne d'état | 48 px | 48 px | 48 px |
| Feuille ouverte | enveloppe de 834 px, partie visible à y = 76,7 : **0,92** de l'enveloppe | **x = −20, largeur 640** : déborde de 20 px de chaque côté, titre et « Fermer » coupés (**RC-CORR-5**) | panneau de **400 px** à droite, pleine hauteur |
| Focus à la présentation | `h2` « Compte et synchronisation » | idem | idem |
| Focus après Échap | bouton « Compte et synchronisation » | idem | idem |
| Marge du corps de la feuille | **0 px** (textes au bord de l'écran, **RC-CORR-6**) | 0 px | 0 px (textes au bord du panneau) |

« + » et lignes : E2E-ANO-005-FAB-03 (zone visible de la liste, au moins 5 lignes, dernière comprise) et FEUILLE-06 (8 tâches, dernière ligne au-dessus du « + ») verts ; aucune ligne recouverte.

## 4. Remarques

| Id | Gravité | Critère | Lieu | Constat et attendu | Qui | Statut |
|---|---|---|---|---|---|---|
| RC-CORR-5 | **Majeure (bloquante pour la PR finale)** | CR-07 | `src/commun/presentation/ui/styles.css:278-282` | De 600 à 639 px, `--width: 640px` fixe dépasse la fenêtre : feuille à x = −20, titre et « Fermer » coupés. Le guide (§6.6.15, tableau des tailles d'écran) dit « 640 px au plus, centrée ». **Défaut de ma ST v0.1** (CSS imposée), Benjamin l'a reproduite fidèlement. Attendu : `--width: min(640px, 100%);` (ST v0.5 §5.1). Test : **E2E-ANO-005-FEUILLE-13** (600, 639, 640, 1023 px), rouge à 600 et 639. | Benjamin (T6 bis) | Ouverte |
| RC-CORR-6 | **Mineure (bloquante pour la PR finale)** | CR-07 | `src/commun/presentation/ui/styles.css:274-276` | Le corps de la feuille (`IonContent.feuille-corps`) n'a aucune marge latérale : textes et boutons collés au bord de l'écran (smartphone) et du panneau (PC). Guide `space.4` : 16 px. **Omission de ma ST.** Attendu : `--padding-start: 16px; --padding-end: 16px;` dans la règle `.feuille-corps` (ST v0.5 §5.1). Test : **E2E-ANO-005-FEUILLE-14** (390 × 844, 1280 × 800), rouge (marge mesurée : 0 px). Non convertible en dette : effet visible à chaque ouverture de la feuille, correction d'une ligne. | Benjamin (T6 bis) | Ouverte |
| RC-CORR-7 | Mineure | CR-62, CR-66 | `src/composition/web.ts:246-249` | La branche de rejet de `suivreOuverture` (§7.3) n'avait aucun test ; défaut de mon E10. **Traité par Anthony** : UT-ANO-004-08 (`tests/unitaires/composition/ouverture-rejet-comp.test.ts`) ; rougit si le gestionnaire est retiré ou mène à `ESPACE_INACCESSIBLE`. | Anthony | **Close** |
| RC-CORR-8 | Bloquante (outillage) | CR-62 | `tests/unitaires/commun/presentation/ui/boutons-natifs-complements.test.tsx` | Mes tests UT-DT-014-07 et 08 démontaient la feuille modale pendant sa présentation : `TypeError` non gérée, `pnpm test` en code 1. **Corrigé par Anthony** : attente de `ionModalDidPresent` (`surPresentationModale()`), sans délai fixe, assertions inchangées. | Anthony | **Close** |
| RC-CORR-9 | Suggestion | CR-21 | `src/main.tsx:288-290`, `src/synchronisation/presentation/ui/focus-fin-a-lire.ts:20` | La fonction `cible` est recréée à chaque rendu d'`EspaceApplication` : l'effet de `useFocusFinALire` se relance à chaque rendu. Sans effet observable (la condition ne vaut qu'à la disparition de la section), mais inutile. Possible : `useCallback` sur `feuilleOuverte`. | Benjamin (facultatif) | Ouverte (sans effet sur le verdict) |
| RC-CORR-10 | Non bloquante | CR-07, CR-71 | `src/main.tsx:309-313` | « Voir » : comportement conforme à la ST v0.4, sans test automatisé possible aujourd'hui → **dette candidate CORR-c** ; destination du focus après « Voir » (bouton d'ouverture, réalisé) ajoutée à **Q-CORR-STE-7** (Steeve). Rien à faire par Benjamin avant la réponse. | Steeve (question), Anthony (registre) | Close (dette) |

RC-CORR-3 (rustines, revue de T1 à T3) : **close** (§2.3).

## 5. Dette et anomalies

| Sujet | Décision |
|---|---|
| **CORR-a** (boutons natifs d'`objectifs-taches` hors du style commun) | Inchangée, P3, ≈ 0,5 j, LOT-002 ou E17. Numéro proposé : **DT-045**. |
| **CORR-b** (message de « plus de 10 s » du cadre neutre non réalisé) | Inchangée, P3 ; plan : si une lecture distante est ajoutée à l'ouverture. Numéro proposé : **DT-046**. |
| **CORR-c** (nouvelle, « Voir » sans test automatisé) | P3 ; plan : scénario `@ihm` ou test de navigateur en LOT-002 dès que le banc sait produire une entrée « À lire ». Numéro proposé : **DT-047**. |
| E13b-a, E13b-b (candidates de l'E13b) | Numéros proposés **DT-043** (« Remboursée » à la même fusion : plus aucun `TODO(` dans `src/`) et **DT-044**. |
| **DT-014** | Critères remplis (périmètre §4, UT-DT-014-01 à 10, E2E-DT-014-01 à 03 verts) : **« Remboursée » à la fusion** de la PR #46 ; reliquat = CORR-a. |
| **DT-034** | Points 1 et 3 remplis (UT-DT-034-01, 02, E2E-DT-034-01 à 08 verts) : **remboursés à la fusion** ; la dette **reste ouverte pour le point 2** (icônes, LOT-002, décision de Steeve). Elle ne peut pas passer « Remboursée » en entier. |
| ANO-004, ANO-005 | **« Corrigée, en revue »** dans `docs/anomalies.md` (ANO-005 : avec RC-CORR-5 et 6 à corriger avant la PR finale). |

Numéros attribués par Jarvis à la fusion (OPT-20) ; ordre proposé = ordre d'inscription au registre (dernier numéro attribué : DT-042). Registre porté en **v0.51**.

## 6. Apports d'Anthony dans ce commit

- `tests/unitaires/commun/presentation/ui/boutons-natifs-complements.test.tsx` : UT-DT-014-07 et 08 corrigés (RC-CORR-8).
- `tests/unitaires/composition/ouverture-rejet-comp.test.ts` : **UT-ANO-004-08** (vert, RC-CORR-7).
- `tests/e2e/feuille-synchronisation.e2e.ts` : **E2E-ANO-005-FEUILLE-13** (4 exécutions) et **14** (2 exécutions), **rouges** jusqu'à T6 bis.
- ST-CORR-E13B-LOT-001 **v0.5** : §5.1 (CSS corrigée), §5.2 (« Voir » et focus), §7.3 (test du rejet), §13 (tests), §15 (T6 bis, 0,1 j ; `pnpm e2e` 54 sur 54), §16 (CORR-c, numéros proposés, Q-CORR-STE-7 complétée).
- Registre de la dette **v0.51** ; `docs/anomalies.md` (ANO-004, ANO-005).

## 7. Verdict

**Changements requis** (passage 1), limités à **T6 bis** : RC-CORR-5 et RC-CORR-6, deux déclarations dans `styles.css`, par Benjamin (≈ 0,1 j), jusqu'à E2E-ANO-005-FEUILLE-13 et 14 verts, `pnpm e2e` 54 sur 54. Le code de T4, T5a, T5b et T6 est **approuvé** pour le reste : aucune autre remarque Bloquante, Majeure ou Mineure ouverte. La nouvelle revue ne portera que sur ces deux déclarations (§1.5 de la grille).

Question non bloquante : Q-CORR-STE-7 complétée (Steeve, via Jarvis). Après T6 bis : PR #46 prête, puis nouvelle E13b limitée.
