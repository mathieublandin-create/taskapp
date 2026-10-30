# Revue de code E13 — LOT-001, correction d'ANO-001 (la vue suit les cycles sans geste)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-30 |
| Auteur | Benjamin (`f25e557`) ; tests et ST : Anthony (`80bebfb`, `060c711`) ; scénarios : Pepper (`9a0b86b`) |
| Branche | `fix/ANO-001` → `lot/LOT-001` (PR #11), tête `f25e557` |
| Périmètre | Différentiel `git diff origin/lot/LOT-001...HEAD` (4 commits, 28 fichiers). Le code examiné est celui de Benjamin (`f25e557`). Les commits d'Anthony et de Pepper ont été relus pour vérifier que les tests sont intacts (CR-60) |
| Référentiel | ST-US-017 v0.4.3 §3.3, §6.9, §12.4, §13.3 (portée en v0.4.4 par cette revue) ; DAT §4.1.6 bis ; ADR-013 ; `checklist-revue-code.md` v0.3 ; glossaire d'étapes v1.11 §13 |
| Passage | 1 ; **2** (tête `39063f6`, différentiel `git diff 0964705..HEAD`, §9) |

## 1. Verdict : **Changements requis**

Le correctif répond à la ST : observateur du cycle, relais de la composition, abonnement du contrôleur et `rafraichissementsTermines()`. Les S06c à S06f passent grâce à lui, et le contrôle de mutation le confirme (§3). La CI de la PR #11 est verte. Les trois écarts que Benjamin a remontés sont **acceptés**, et la ST est corrigée en v0.4.4.

Une remarque **majeure** reste ouverte : **RC-ANO-001-1**, une fuite d'abonnement introduite par le correctif. Elle vient de ma ST v0.4.3, qui la laissait passer. Le correctif est réduit (4 lignes dans `fermer()`) et le test rouge est fourni. Le prochain passage portera sur ce seul point.

## 2. Points remontés par Benjamin

| # | Point | Décision | Justification |
|---|---|---|---|
| 1 | `expirerAccesSansConstat()` place un jeton **échu**, alors que le §12.4 demandait un jeton non échu | **Accepté ; la ST est corrigée** (v0.4.4, §12.4) | Mon §12.4 contredisait le DAT §4.1.6 bis. Un 401 sur un jeton non échu prouve un retrait (`qualifierRefusJeton`, `src/compte/domaine/acces.ts:51-54`) : l'accès passe à `PERDU`, puis `SYN-ACTION` et `BAN-ACCES-GOOGLE`. S06f attend au contraire « Session à reprendre » (`SYN-SESSION`, `A_RENOUVELER`), c'est-à-dire un 401 sur un jeton échu (1re ligne du tableau du DAT). La réalisation de Benjamin est la bonne. |
| 2 | Le step `l'application est ouverte sur le {appareil}, connecté au réseau` ferme puis rouvre l'application au lieu d'appeler `assurerOuverte()` | **Accepté ; la ST est corrigée** (v0.4.4, §12.4 n° 1) | Vérifié par mutation. Avec `assurerOuverte()`, S06f échoue sur `les données présentes sur le smartphone s'affichent aussitôt` (« Racine : CONNEXION »), parce que l'instantané d'ouverture est alors celui de la connexion du Contexte. La réouverture correspond au sens du glossaire (« l'application est ouverte ») et n'affaiblit aucune assertion : l'étape vérifie aussi la racine courante. Elle ne touche pas la forme à deux appareils. |
| 3 | Unité « secondes » ajoutée à `{ecart}` (`tests/support/conversions.ts:13`, `:39-40`) | **Accepté** | S06c et S06f utilisent « 5 secondes ». Aucune autre unité ne change, et la conversion produit des millisecondes entières. J'ai ajouté le cas au test UT-COMP-90 (`tests/unitaires/support/steps-communes.test.ts`), qui m'appartient. À l'attention de Pepper (non bloquant) : les conventions du glossaire (`durée`, `écart`, §8) ne citent pas encore « secondes ». |

## 3. Contrôles exécutés

Les commandes ont été lancées depuis `node_modules/.bin`, car le poste a Node 22 et `pnpm` refuse l'engine. La CI, qui tourne sous Node 24, fait foi.

| Contrôle | Résultat |
|---|---|
| CI de la PR #11 sur `f25e557` | Verte : `qualite`, `securite`, `build`, `e2e`, `tests` dans les trois fuseaux |
| Local : `tsc`, `eslint`, `prettier`, `depcruise`, catalogue, tags, rangs, hygiène | 0 erreur |
| Local : `vitest run --coverage` | 678 réussis, 134 ignorés (hors rang), seuils atteints |
| Non-régression de la couverture par fichier (base `origin/lot/LOT-001` remesurée dans un worktree) | 0 erreur. `cycle-synchronisation.ts` reste à 100 % des lignes et des branches. `application.ts` et `controleur-interface.ts` sont dans `src/composition/**`, exclu de la mesure (`vitest.config.ts:78`, conventions §12) |
| Cucumber, profil `default` | 86 scénarios, 86 réussis |
| **Mutation demandée par §12.4** : abonnement du constructeur retiré (`controleur-interface.ts:105`) | **S06c, S06d, S06e et S06f échouent tous les quatre**, chacun sur une assertion ciblée : S06c sur la feuille (`SYN-FEUILLE-RIEN-EN-ATTENTE` au lieu de 1 en attente), S06d et S06e sur l'indicateur (`SYN-EN-COURS` au lieu de `SYN-OK`), S06f sur l'indicateur après reconnexion (`SYN-ATTENTE` au lieu de `SYN-OK`). C'est donc bien le correctif qui les fait passer |
| Mutation du point 2 (`assurerOuverte()`) | S06f échoue (voir §2) |
| Tests fournis intacts (CR-60) | Aucun test de `060c711` n'a été modifié par `f25e557` |

## 4. Fuites d'abonnement, rafraîchissements après destruction

| Point | Constat | Avis |
|---|---|---|
| `CycleSynchronisation.observer` (`cycle-synchronisation.ts:175-180`) | Un `Set` et une annulation qui retire le rappel. Le cycle ne retient que le `notifier` de la composition | Conforme. Une fin tardive après `arreter()` déclenche seulement un recalcul de la vue de l'espace courant (§6.9 n° 1, admis) |
| Relais (`application.ts:379-384`) | Un `Set`, avec annulation | Conforme |
| `#rafraichissements` (`controleur-interface.ts:125-133`) | Retrait dans `finally`, donc pas d'accumulation, y compris en cas d'échec | Conforme |
| Contrôleur | Il n'a pas de cycle de vie : il vit autant que la page (`web.ts`), comme son abonnement à la session | Conforme à §6.9 n° 3. Dans le banc, `fermerApplication()` retire l'abonnement au réseau et oublie le contrôleur |
| **`depot.observer(notifier)` (`application.ts:407`)** | Jamais annulé. Or `DepotLocalDexie` installe au premier `observer` une écoute **globale** `Dexie.on('storagemutated')` (`depot-local-dexie.ts:222-232`, `:409-418`), qu'il ne retire que lorsque le dernier observateur se désabonne. `fermer()` (`:179-182`) ne la retire pas. Avant le correctif, les deux abonnés (déclencheurs du cycle, retirés par `arreter()`, et magasin des objectifs, retiré au démontage) se désabonnaient. Après le correctif, l'écoute globale survit à chaque fermeture d'espace (déconnexion, changement de compte, suppression des données, `arreter()`). L'écouteur global de Dexie retient alors le dépôt fermé, son cache d'état, et par le `notifier` le relais et le contrôleur. Chaque écriture d'une base du même nom relance `verifierVersion()` sur une base fermée, et l'erreur est avalée | **Fuite introduite : RC-ANO-001-1.** Ma ST v0.4.3 la rendait possible : elle affirmait que la fermeture du dépôt libérait l'abonnement |

## 5. Sécurité (CR-50 à CR-58, ADR-013)

| Point | Constat |
|---|---|
| Jetons | `src/` ne touche ni au coffre, ni au fournisseur, ni à `AccesGoogle`. Les jetons simulés (`'jeton-simule-echu'`) ne sont placés que dans le banc, dans `CoffreJetonsMemoire`, en mémoire, comme `expirerSessionGoogle()`. Aucun jeton n'est persisté, journalisé ni écrit dans une URL. Conforme à ADR-013 et CR-51 |
| Données personnelles | Le relais ne transporte aucune donnée (`() => void`) et ne journalise rien |
| SAST, SCA, secrets | Job `securite` vert |

## 6. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-ANO-001-1 | **Majeure** | CR-13, CR-41 ; ST-US-017 v0.4.4 §6.9 n° 4, §3.3 A8 | `src/synchronisation/infrastructure/depot-local-dexie.ts:179-182` (cause : `src/composition/application.ts:407`) | Fuite de l'écoute globale `Dexie.on('storagemutated')` après la fermeture d'un espace (§4) | Dans `fermer()`, avant `this.base.close(...)` : `this.observateurs.clear()`, puis `this.desabonnementStockage?.()` et `this.desabonnementStockage = undefined`. La méthode reste idempotente, et son commentaire doit mentionner la libération des observateurs. Test fourni : **UT-COMP-US-017-56**, rouge (`tests/integration/synchronisation/depot-local-dexie-fermeture.test.ts`), et UT-COMP-US-017-57, vert, qui sert de garde. Ce correctif a été essayé sans être commité : tous les tests unitaires, d'intégration et de contrat, ainsi que les 86 scénarios Cucumber, sont verts | **Levée** (`39063f6`, passage 2) | 2 |
| RC-ANO-001-2 | Suggestion | CR-22 | `tests/support/banc/appareil-simule.ts:170-176` et `:236-243` | `expirerSessionGoogle()` et `expirerAccesSansConstat()` répètent les mêmes trois instructions. Seul `retourDiffere` les distingue | Faire appeler `expirerAccesSansConstat()` par `expirerSessionGoogle()`, puis poser `retourDiffere` | **Levée sans suite** (justification de Benjamin acceptée, §9) | 2 |
| RC-ANO-001-3 | Suggestion | CR-25 | `tests/support/conversions.ts:37` | Le commentaire de `convertirEcart` ne cite pas les secondes | Ajouter « 5 secondes » aux exemples | **Levée** (`39063f6`) | 2 |
| RC-ANO-001-4 | Suggestion | CR-41 | `src/composition/controleur-interface.ts:135-157` | Deux rafraîchissements peuvent se chevaucher : celui du début et celui de la fin d'un cycle, ou une écriture suivie d'un cycle. Si le premier se termine après le second, il réécrit une vue plus ancienne, jusqu'à la notification suivante. Le risque existait déjà avec la session et le réseau, mais il devient plus fréquent. Je ne l'ai pas observé : les lectures Dexie sont servies dans l'ordre | Facultatif dans cette correction : un numéro de génération, pour que seul le dernier calcul lancé écrive `#vue`. Sinon, je l'inscrirai au registre de la dette à la prochaine revue | **Inscrite en dette : DT-016** (P3, `dette-technique.md` v0.20) | 2 |

## 7. Dette

Aucune dette nouvelle n'est déclarée. Si RC-ANO-001-4 n'est pas traitée, je propose de l'inscrire au registre au prochain passage, avec la priorité « Basse ».

## 8. Suite

1. Benjamin corrige RC-ANO-001-1 sur `fix/ANO-001`. UT-COMP-US-017-56 doit passer au vert, et rien d'autre ne doit changer dans `src/`.
2. Au passage 2, je contrôle uniquement RC-ANO-001-1 et le nouveau différentiel (checklist §1.5). Si tout est conforme, j'approuve et la branche est fusionnée. ANO-001 passe ensuite en nouvelle recette (S06c à S06f).

## 9. Passage 2 (2026-10-30, tête `39063f6`)

**Verdict : Approuvé.** Aucun point bloquant.

| Contrôle | Résultat |
|---|---|
| Différentiel `0964705..HEAD` | 2 fichiers : `src/synchronisation/infrastructure/depot-local-dexie.ts` (`fermer()`, +6/−1) et `tests/support/conversions.ts` (commentaire). Aucune autre modification de `src/`, ni de la couche de stockage, ni des tests fournis (CR-60) |
| RC-ANO-001-1 | Conforme à l'action attendue : `observateurs.clear()`, `desabonnementStockage?.()` puis `undefined`, avant `base.close(...)`. Le commentaire mentionne la libération. L'idempotence est conservée : au 2e appel, l'ensemble est vide et le désabonnement vaut `undefined`. Un désabonnement tardif d'un ancien observateur reste sans effet (`?.`). UT-COMP-US-017-56 et 57 passent, sans modification du test |
| RC-ANO-001-3 | Appliquée (« 5 secondes » dans les exemples de `convertirEcart`) |
| RC-ANO-001-2 | Levée sans suite. Les deux méthodes ne sont pas strictement identiques : `expirerSessionGoogle()` écrit dans le coffre de `this.instance?` (instance ouverte, facultative), et `expirerAccesSansConstat()` dans celui de `this.application`. Les factoriser changerait la cible du coffre. Pas de dette inscrite (code de banc de test, duplication de trois lignes) |
| RC-ANO-001-4 | Non traitée dans cette correction, car elle relève de la logique du contrôleur. Elle est inscrite en **DT-016**, avec la priorité P3 : gêne localisée, non observée, et la vue est corrigée à la notification suivante |
| Exécution locale (Node 22 ; pnpm refuse l'exécution hors de `engines`, d'où un lancement direct) | `vitest run` : 136 fichiers, 680 tests verts, 134 ignorés. Lint des deux fichiers sans avertissement |
| CI de `39063f6` | `qualite`, `build`, `securite`, `e2e` et `tests` (America/New_York, Pacific/Auckland) au vert ; `tests (UTC)` en cours au moment de la revue. **La fusion est conditionnée à son succès** |

Suite : fusion de la PR #11 dans `lot/LOT-001` une fois la CI entièrement verte, puis nouvelle recette d'ANO-001 (S06c à S06f).
