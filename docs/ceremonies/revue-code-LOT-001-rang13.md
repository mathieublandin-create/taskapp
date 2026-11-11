# Revue de code E13 — LOT-001, rang 13 (US-031 : coordination entre onglets, exclusion du cycle, DT-025, S16 à S16c)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-11 |
| Branche | `us/US-031-rang13` @ `abddb0a` (PR #40 en brouillon, base `lot/LOT-001` @ `01da5ff`) |
| Auteurs | Bruce (opus) : B1 (noms des verrous, `ExclusionCycle`, `VerrouOngletsWeb`, exclusion dans `CycleSynchronisation`, DT-025), B2 (`CoordinationOnglets`, fin de session, composition, banc), UT-COMP-US-031-1 à 19. Benjamin (sonnet) : D1 (ligne `SYN-FEUILLE-AUTRE-ONGLET`), D2 (monde à deux onglets, 13 phrases, `onglets.e2e.ts`, `rangCourant = 13`), UT-COMP-US-031-20 à 22 |
| Périmètre | Différentiel `origin/lot/LOT-001...origin/us/US-031-rang13` : 58 fichiers, + 3 691, − 287 (B1, B2, D1, D2 ; réponses de Steeve, guide v0.2.25, et de Starck, DAT v0.11.13) |
| Référentiel | ST-US-031 v0.4 (portée à **v0.4.1** par cette revue), DAT v0.11.13 §4.1.6, guide d'ergonomie v0.2.25 §6.6.9, `checklist-revue-code.md`, revue du rang 12 (format) |
| Passage | 1 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, hygiène) | **0 erreur.** |
| `pnpm test` (Node 24, `rangCourant` = 13) | **1 614 / 1 614.** Les 32 rouges de l'E10 sont verts. |
| `pnpm test:couverture` | Global 98,2 % des instructions, 95,85 % des branches ; fichiers du rang couverts (contrôle par fichier : job `tests (UTC)` de la CI, vert). |
| `pnpm cucumber` (profil `default`) | **406 / 406**, inchangé (critère de non-régression du §6.5 n° 10 tenu, banc sans contournement : `verrou: new VerrouOngletsEnMemoire().onglet()` par instance). |
| CI de `abddb0a` (API REST, check-runs) | **Verte** : `qualite`, `securite`, `build`, `tests` (UTC, America/New_York, Pacific/Auckland), job `ihm` « e2e (CSP, navigateur réel) » (Cucumber `@ihm` 13/13 et `pnpm e2e`, dont `onglets.e2e.ts`). |
| `pnpm cucumber:ihm`, `pnpm e2e` en local | Non concluants dans ce bac à sable (le bouton « Continuer avec Google » n'apparaît pas, y compris pour `onglets.e2e.ts`, vert en CI : environnement). Pris dans la CI. |
| Reproduction d'ANO-006 (test de composant jetable, non commité) | Application assemblée (`assemblerApplication`, `VerrouOngletsEnMemoire`) et `ControleurInterface` ; onglet seul meneur ; `actionCompte('SE_DECONNECTER')` puis attente de tous les rafraîchissements : **`racine = APPLICATION` avec la session `SANS_SESSION`, 3 sur 3** sur `us/US-031-rang13` ; **`CONNEXION`, 3 sur 3** sur `lot/LOT-001` (même test sans verrou). Suppression des données : `CONNEXION` (non touchée). |
| Mutations locales (annulées) | (M1) exclusion retirée de `fabriquerSynchronisations` → UT-COMP-US-031-9 rouge ; (M2) garde `if (rendu)` retirée de `VerrouOngletsWeb` → CT-VER-05 rouge. Mutations rapportées par les tranches (garde non refaite → UT-US-031-06 ; `arreter`/`recharger` inversés → UT-US-031-11 ; ligne toujours présente → UT-US-031-07) : lues, cohérentes avec les tests. |
| Tests fournis en E10 (CR-60) | Modifiés seulement par l'accord du §6.6 de la ST (DT-025) : **15 attendus**, clé `aLire` seule retirée, aucun matcher ni autre clé touché (vérifié ligne à ligne). Aucun autre test de l'E10 modifié. |
| Doublures et tests d'autres rangs | `lireCoordination` ajouté à `tests/support/synchronisation/horloge-absente.ts` et à la doublure de `controleur-incrementation-4-comp.test.ts` : ajout mécanique imposé par le type `ApplicationInterface`, aucune assertion touchée. **Accepté.** |
| Rangs | `rangCourant` = 13 (dernier commit de D2). `rangs-fichiers.json` : les 6 fichiers créés à `debut = fin = 13` ; fichiers modifiés sans squelette inchangés (§3.1 de la ST). `rangs-tests.json` : `(?:UT-US-031\|CT-VER)-\d+`, `UT-DT-025-\d+` et **`UT-COMP-US-031-\d+` → 13 déjà présente** (point 8 : rien à ajouter). |
| Numérotation | UT-COMP-US-031-1 à 22 sans doublon entre auteurs (Bruce 1 à 19, Benjamin 20 à 22) ; deux cas partagent le 8 dans le même fichier (admis). |
| Sécurité | Aucun secret, jeton, `localStorage` ni `console` ajouté. `navigator.locks` lu dans le seul adaptateur. Noms de verrous dérivés de `nomEspace` (empreinte). Journal : `OngletMeneur`, `VerrouOngletsIndisponible` sans champ ; `SynchronisationInterrompue` avec le nom de l'erreur seulement. **Exception : ANO-006** (données affichées après la déconnexion). |

## 2. Points soumis

### 2.1 B1 : exclusion du cycle, `VerrouOngletsWeb`, DT-025
- **`VerrouOngletsWeb`** (`src/synchronisation/infrastructure/verrou-onglets-web.ts`) : conforme au §4.2. Garde `if (rendu)` présente et utile (M2). Abandon par `AbortController` d'une demande en attente ; `rendre` idempotent ; API absente : microtâche, une seule entrée `erreur`. Le `.catch(() => undefined)` de `demanderLaMain` (l. 46) est celui que **ma ST imposait** : il absorbe l'`AbortError`, mais aussi toute autre erreur, dont une exception de `quandObtenue`. Au regard de CR-42, c'est une capture silencieuse trop large. Je ne le compte pas comme un écart du code : je l'inscris en dette candidate **R13-a** (§6), et c'est à moi de corriger la ST.
- **`ExclusionCycle`** : décorateur injecté, `CycleSynchronisation` ignore Web Locks (§9 de la ST). Conforme.
- **Contrôles avant et sous le verrou** (DAT v0.11.13 §4.1.6, Q-ST031-STA-3) : `#lancer` ne lit que l'état en mémoire (`#garde` : réseau, accès) avant la demande. `#sousExclusion` refait la garde sous le verrou, sans notification ni appel au Drive en cas d'échec. La relance `aRefaire` reste dans la même tenue. Conforme.
- **`DEJA_EN_COURS` pendant l'attente du verrou** : il pose `#aRefaire = vrai`. `#unCycle` le remet à faux au début du corps, qui ne s'exécute qu'après l'obtention du verrou et relit l'espace (méta, attente). **Une demande faite pendant l'attente est donc couverte par l'exécution en file, sans perte** : je confirme l'analyse de Bruce. Le test qui l'établit n'existe pas sous cette forme : UT-US-031-06 écrit avant l'attente, et UT-US-031-08 ne cible pas ce cas. Je demande **UT-COMP-US-031-23** (RC-US-031-5) pour figer cette propriété face à un futur remaniement de `#aRefaire`.
- **Promesse enveloppée** : `enCours.then(liberer, liberer)` (`cycle-synchronisation.ts:454`) traite les deux issues, donc la promesse dérivée ne rejette jamais. La promesse rendue est celle de l'exclusion, traitée par l'appelant. Aucun rejet non traité. Conforme.
- **DT-025** : il ne reste plus aucun `aLire` dans `suivi-cycle.ts` ni dans `cycle-synchronisation.ts` ; le commentaire de `consulter-etat-synchronisation.ts` est retiré ; UT-DT-025-01 (égalité stricte) passe au vert. **Confirmé** : « Remboursée » à la fusion de la PR #40 (registre v0.44).

### 2.2 B2 : coordination, fin de session, composition
- **`CoordinationOnglets`** : conforme au §6.1.
  - Un candidat qui perd l'accès abandonne sa demande (`#lacher`), comme le teste UT-US-031-03.
  - Une candidature double est impossible (`#rendre !== undefined`), comme le teste UT-COMP-US-031-7.
  - `arreter()` est définitif. Il arrête le cycle une fois, quel que soit le rôle, et notifie si le rôle change.
- **`quitterApresFinDeSession`** : n'agit qu'une fois, arrête puis recharge, et recharge même si l'arrêt lève une exception (`try/finally`) (UT-US-031-11, UT-COMP-US-031-15 à 18). Conforme.
- **Composition** :
  - `arreterCoordination` et `lireCoordination` sont présents, et `lireCoordination` est obligatoire dans `ApplicationInterface`.
  - `fermerEspace` suit l'ordre suivi, désabonnement, coordination, dépôt.
  - `demarrerEspace` ne lance plus de cycle direct.
  - `web.ts` : une seule lecture de `navigator.locks`, une référence tardive, et `ecouterFinDeSession` remplace `avis.ecouter(recharger)`.
  - Conforme au §6.5.
- **Défaut révélé** : la notification d'`arreter()` (conforme au §6.1) déclenche ANO-006 dans le contrôleur (§5, RC-US-031-1).

### 2.3 D1 : ligne `SYN-FEUILLE-AUTRE-ONGLET`
- `LigneAutreOnglet` est extrait pour respecter `max-lines-per-function` : **accepté**.
- `modeleAutreOnglet` est dans le modèle de vue alors que la ST v0.4 disait « types seulement » : cette mention décrivait l'état de l'E10. La ST v0.4.1 est **alignée** (§3 n° 8).
- `role="status"` : c'est la décision de Steeve (guide v0.2.25, Q-ST031-STE-1). La ST v0.4.1 est alignée (§6.3).
- L'ordre bouton, explication, ligne, cartes est vérifié par UT-COMP-US-031-21, avec l'égalité de séquence.

### 2.4 D2 : étapes `@ihm`, e2e
- **Les 13 phrases** sont écrites sans duplication (`renommerTache` et `creerObjectifSansDelai` sont partagées) et les repères viennent de `ecrans-ihm.ts`. ANO-004 est respectée : la conclusion n'est tirée qu'après le rechargement compté et `networkidle`.
- **`onglets.e2e.ts`** (et non `.spec.ts`) : le motif `**/*.e2e.ts` de `playwright.config.ts` l'impose. La ST est corrigée (§3 n° 17, §14, §15).
- **Dépendance au build `dist-test-ihm`** : elle est assurée en CI par l'ordre du job `ihm` (`cucumber:ihm`, qui construit, puis `e2e`). Lancé seul, le fichier échoue avec un message explicite. **Accepté**, documenté au §14 de la ST.
- **Interface réelle** : la section « Compte » est rendue dans l'espace et le bouton s'appelle « Créer un objectif ». La ST est corrigée (§12.2 n° 4, 7, 8).
- **Mutations non détectées par les scénarios** : verrou « cycle » absent, données supprimées sans avis `SESSION_FERMEE`. **Acceptables**, pour trois raisons :
  - l'exclusion est couverte par UT-US-031-05, 06 et 08, et le **câblage** de la composition par UT-COMP-US-031-9 (M1 détectée) ;
  - l'ordre de l'avis est couvert par UT-US-022-56 (rang 1) ;
  - le filet `versionchange` est couvert par UT-COMP-US-031-18.
  - Aucun test supplémentaire n'est demandé pour ces deux mutations.
- **S16b et S16c ne concluent rien sur le premier onglet** : c'est ce qui a laissé passer ANO-006. S16b est **vert alors que le premier onglet affiche encore les données après la déconnexion**. Je demande RC-US-031-2.

## 3. Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Exclusion du cycle (B1) | Conforme au DAT v0.11.13 et à la ST. `DEJA_EN_COURS` pendant l'attente : non-perte **confirmée** ; test de non-perte demandé (RC-US-031-5, UT-COMP-US-031-23). |
| 2 | Q-BRU-1 (espion de `request` dans UT-US-031-10) | **Retiré** (c'est mon test) : l'espion attache ses propres gestionnaires à la promesse rendue et vide l'assertion « aucun rejet non traité ». Il est remplacé par `registre.demandes` ; le nom et le mode restent vérifiés par l'instantané `pending`. Accord CR-60 écrit dans la ST v0.4.1 §13 (RC-US-031-4). UT-COMP-US-031-1 est conservé. |
| 3 | DT-025 | Confirmée ; « Remboursée » à la fusion de la PR #40. |
| 4 | B2 | Conforme ; doublures de `lireCoordination` acceptées. |
| 5 | D1 | Conforme ; ST alignée (modèle de vue, `role="status"`). |
| 6 | D2 | Conforme sauf RC-US-031-2 et 3 ; ST alignée (`.e2e.ts`, interface réelle, dépendance au build). |
| 7 | ANO-006, ANO-007 | Voir §5. **ANO-006 bloque le rang 13** (régression introduite par le rang, données affichées après la déconnexion). **ANO-007 ne le bloque pas** (antérieure, branche `ano/`). |
| 8 | Numérotation | R13-a sans numéro (OPT-20, attribué par Jarvis à la fusion). Règle `UT-COMP-US-031-\d+` → 13 déjà présente. |

## 4. Remarques

| Id | Gravité | Lieu | Critère | Constat et attendu | Qui |
|---|---|---|---|---|---|
| RC-US-031-1 | **Bloquante** | `src/composition/controleur-interface.ts:208-233` (déclenché par `src/synchronisation/application/coordination-onglets.ts:110-117` via `src/composition/application.ts:448-451`, avant `session.fermer()` de `src/compte/application/cas-usage/se-deconnecter.ts:52-53`) | CR-42, US-022 CA-6, RG-043 ; ANO-006 | **Constat.** Un calcul de vue lancé pendant `espaces.fermer()` (session encore ouverte) publie en dernier une vue `APPLICATION` : après « Se déconnecter », l'onglet reste sur les données. **Attendu.** Le correctif imposé par la ST v0.4.1 §6.7 : compteur `#dernierCalcul`, un calcul dépassé ne publie pas. Aucune autre modification de `src/`. Tests **UT-COMP-US-031-24** (application assemblée et contrôleur : `CONNEXION`, ni `compte` ni `feuille`) et **UT-COMP-US-031-25** (ordre de règlement inversé, doublure), selon le §14. | Benjamin (sonnet) |
| RC-US-031-2 | Majeure | `tests/steps-ihm/compte.steps.ts:79-88`, `:99-102` | CR (tests : critère non asserté) ; ST v0.4.1 §6.7, §12.2 n° 7, 9 | **Constat.** Les étapes « se déconnecte » et « confirme » ne vérifient rien sur le premier onglet : S16b est vert avec ANO-006. **Attendu.** Après le geste, attendre sur la page 1 `ecranAffiche(page) = 'CONNEXION'` (`expect.poll`, `DELAI_ATTENTE_MS`). Vérifier que S16b rougit sans le correctif de RC-US-031-1 (à rapporter dans la demande de nouvelle revue). | Benjamin (sonnet) |
| RC-US-031-3 | Mineure | `tests/steps-ihm/compte.steps.ts:100-101` | Traçabilité (comme RC-US-018-5) | **Constat.** Le commentaire dit « ANO à inscrire ». **Attendu.** « ANO-007 : … contournement par la touche Entrée, à remettre au clic à la correction d'ANO-007 ». | Benjamin (sonnet) |
| RC-US-031-4 | Mineure | `tests/unitaires/synchronisation/infrastructure/verrou-onglets-web.test.ts:63`, `:74-76` | CR-60 (accord écrit), Q-BRU-1 | **Constat.** L'espion `vi.spyOn(gestionnaire, 'request')` masque les rejets non traités. **Attendu.** Retirer l'espion et ses trois assertions, puis ajouter `expect(registre.demandes).toBe(2)`. Aucune autre modification (accord : ST v0.4.1 §13). | Benjamin (sonnet), mécanique |
| RC-US-031-5 | Mineure | `tests/unitaires/synchronisation/application/cycle-exclusion-complements.test.ts` (nouveau cas) | Tests de non-régression d'une propriété du §6.2 n° 1 | **Constat.** La non-perte d'une demande faite pendant l'attente du verrou n'est testée nulle part. **Attendu.** Ajouter **UT-COMP-US-031-23** selon le §14 de la ST v0.4.1 : création pendant l'attente, `DEJA_EN_COURS`, puis `TERMINE`, l'objectif une fois dans le Drive, attente 0, 2 notifications. | Benjamin (sonnet) |

Aucune remarque sur le cœur (B1, B2) qui demande Bruce : le correctif d'ANO-006 est dans le contrôleur de la composition.

## 5. Anomalies inscrites (`docs/anomalies.md`)

- **ANO-006 (Majeure proposée, régression du rang 13, bloque la fusion)** : après « Se déconnecter », l'onglet qui a fait le geste reste sur l'espace (`SYN-OK`, tâches) alors que la session est `SANS_SESSION`.
  - **Diagnostic, différent de celui de Starck.** Ce n'est pas une liaison React défaillante : la **vue du contrôleur elle-même** est fausse (`racine = APPLICATION`). La cause est la publication sans contrôle d'ordre de `#calculerVue`, présente depuis le rang 1. La notification d'arrêt de la coordination, ajoutée au rang 13, la déclenche pendant `espaces.fermer()`.
  - **Reproduction.** 3/3 sur la branche, 0/3 sur `lot/LOT-001`. La suppression des données n'est pas touchée.
  - **Tests qui auraient dû l'attraper.** Aucun test existant ne la voit :
    - UT-COMP-US-022-95 utilise des doublures, sans coordination ;
    - les scénarios d'US-022 s'exécutent au niveau des cas d'usage ;
    - S16b ne regarde pas le premier onglet (RC-US-031-2).
  - **Correction** : Benjamin (sonnet), ST v0.4.1 §6.7.
- **ANO-007 (Majeure proposée ; Bloquante si le toucher sur smartphone est aussi intercepté, à qualifier par Pepper avec Steeve)** : le fond `IonBackdrop` recouvre les boutons de `BoiteConfirmation`, et la même structure existe dans le sélecteur de parent.
  - **Cause probable** : `.boite-confirmation { z-index: 1 }` sous le `z-index: 2` de l'hôte `ion-backdrop` (`src/commun/presentation/ui/styles.css:21-23`). Le défaut existe depuis le rang 2.
  - **Décision** : il ne bloque pas le rang 13 (hors différentiel). Le contournement par la touche Entrée dans l'étape n° 9 est accepté, avec un renvoi explicite (RC-US-031-3).
  - **Correction** : branche `ano/ANO-007` par Benjamin (sonnet), avec retour au clic dans l'étape, un test e2e de clic sur les deux boutons et le remboursement de DT-024. **À faire avant l'E13b de LOT-001.**

## 6. Dette (registre v0.44)

1. **R13-a** (numéro à la fusion) : `VerrouOngletsWeb.demanderLaMain` absorbe tout rejet, pas seulement l'`AbortError` (CR-42). La cause est ma ST v0.4 §4.2. P3, ST à compléter par moi, échéance E17.
2. **DT-025** : réalisée, « Remboursée » à la fusion de la PR #40.
3. **DT-024** : remboursement rattaché à la correction d'ANO-007.

## 7. Apports d'Anthony dans ce commit

- **ST-US-031 v0.4.1**, alignée sur le code et sur les réponses :
  - DAT v0.11.13 et guide v0.2.25 ;
  - §3 n° 8 et 17 ;
  - §6.3 ;
  - §12.2 n° 4, 7, 8, 9 ;
  - §14 et §15 : `.e2e.ts` et dépendance au build ;
  - **§6.7, correctif imposé d'ANO-006** ;
  - §13 : accord CR-60 de Q-BRU-1 ;
  - §14 : UT-COMP-US-031-23 à 25 ;
  - §16.
- `docs/anomalies.md` : ANO-006, ANO-007.
- `dette-technique.md` v0.44.
- Ce compte rendu.

## 8. Verdict

**Changements requis.**
- **Bloquant pour la fusion** : RC-US-031-1 (ANO-006) et RC-US-031-2.
- **Aussi à corriger dans la même tournée** : RC-US-031-3 à 5, Mineures.

Tout est pour Benjamin (sonnet) ; le cœur (B1, B2) est approuvé en l'état. La nouvelle revue portera seulement sur ces cinq remarques et sur le différentiel de correction, avec la preuve que S16b rougit sans le correctif.

## 9. Questions (via Jarvis)

- **Q-ANT-E13-R13-1 (Pepper, avec Steeve)** : qualification d'ANO-006 et d'ANO-007, en particulier le toucher sur smartphone pour ANO-007 (Bloquante ?).
- **Q-ANT-E13-R13-2 (Pepper)** : pour S16b et S16c, ajouter une ligne explicite « Et dans le premier onglet, seule l'invitation à se connecter … est proposée » ? a) oui ★ (la règle devient lisible dans le scénario ; la vérification de RC-US-031-2 passe alors de l'étape `Quand` à cette étape `Alors`) ; b) non (la vérification reste dans l'étape du geste).
