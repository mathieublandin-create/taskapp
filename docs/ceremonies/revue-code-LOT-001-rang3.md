# Revue de code E13 — LOT-001, rang 3 (US-017, incrément 1 : synchronisation de base)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-29 |
| Branche | `us/US-017-synchro-1` @ `24d65e5` (PR #6, base `lot/LOT-001`) |
| Auteur | Bruce (rang critique) |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 46 fichiers, + 4 042, − 282 (OPT-7) |
| Référentiel | ST-US-017 v0.3 (§3.1, §4.5, §5, §6.1 à §6.5, §7, §8), `conventions.md` v0.4.5 (§9, §10.3, §11.14, §12), DAT §4.1.5 bis, §4.2, §4.3, ADR-014, DEC-041, `dette-technique.md` |
| Passage | 1 |

## 1. Verdict : **À reprendre**

Le cœur de l'incrément est solide. La fusion par information, la réception d'HLC, le dépôt avec `deposeJusquA` posé après la confirmation de Drive, le retrait de l'index borné par `x`, la transaction stricte unique de `appliquerSynchronisation` et la sérialisation canonique avec empreinte sont conformes à la ST et au DAT. Aucun défaut de perte de données n'a été trouvé dans le chemin nominal.

Deux remarques sont bloquantes, toutes deux liées à l'intégrité des données reçues :

- **RC-R3-1** : la liste des types d'événements lus du Drive est une copie manuelle, sans garde d'exhaustivité ;
- **RC-R3-2** : les chemins d'erreur qui protègent le jeton de changements ne sont pas testés.

Les autres remarques ne sont pas bloquantes.

## 2. Contrôles exécutés (Node 24, `24d65e5` + tests DT-010 de cette revue)

| Commande | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, dépôt) | Vert |
| `pnpm test` | 115 fichiers, 581 tests passés, 161 ignorés (rangs > 3) |
| `TZ=UTC pnpm test:couverture` | Vert, seuils par motif respectés ; global 98,1 % lignes, 91,5 % branches. UT-US-017-29 à 31 (propriétés) passent sous couverture sans délai relevé |
| `pnpm cucumber` | 60 scénarios, 543 étapes, tous passés |

Aucun test existant n'a été modifié ni affaibli : le différentiel ne touche aucun fichier d'UT-US-017, ni `vitest.config.ts`, ni les délais. Les tests ajoutés par Bruce (`UT-COMP-US-017-*`, 4 fichiers) contiennent des assertions réelles.

## 3. Réponses aux points signalés par Bruce

| # | Point | Décision |
|---|---|---|
| 1 | Optimisations pour UT-US-017-29 à 31 (schémas Zod construits une fois, cache par table d'appareils ; pas de transaction sans changement) | **Accepté.** Les tests n'ont pas été touchés. Le court-circuit de `#integrer` (`cycle-synchronisation.ts:385`) est correct à l'incrément 1, parce que l'état local ne fait que croître : un registre perdant ou une entrée connue le restent. **À revoir à l'incrément 3** : « Repartir de zéro » efface l'espace. Le court-circuit ne devra jamais s'appuyer sur un état lu avant un effacement. Je l'inscrirai dans l'E10 de l'incrément 3. |
| 2 | `CycleSynchronisation.definirPremierPlan(visible)` sur `visibilitychange` | **Accepté** (DAT §4.3 : période suspendue quand la page est masquée, et retour au premier plan comme déclencheur). C'est testé par UT-COMP-US-017. La ST passe en v0.3.1 (§6.4). Voir RC-R3-3 pour l'état initial. |
| 3 a | `ClientGoogle` : `octets` (corps binaire) et `reponse: 'OCTETS'` | **Accepté.** Le jeton reste dans l'en-tête `Authorization`. Le corps d'une erreur reste lu en JSON. Aucun effet sur les appels existants. |
| 3 b | `attente` (`MEN-ATTENTE`) sur `LigneObjectif` | **Accepté** (ST v0.3.1 §4.5). Le rendu dans `ligne-objectif.tsx` manque : il est rattaché à DT-011 (Benjamin). Voir RC-R3-4. |
| 3 c | `versionApplication` lue dans `package.json` (0.0.0) | **Accepté.** Vite n'embarque que `version` (import nommé). La valeur réelle sera posée par la publication (Friday, rang 12). La valeur 0.0.0 est sans effet fonctionnel à l'incrément 1. |
| 3 d | Règle `UT-COMP-US-017-\d+` au rang 3 dans `rangs-tests.json` | **Acceptée**, je la reprends à mon compte. Elle est placée avant les règles génériques, et `UT-COMP-\d+` ne la capture pas. |
| 4 | Banc et étapes (H-5) : dépôt automatique par « un objectif … », temps avancé d'échéance en échéance, Drive répondant après l'instantané d'ouverture, retrait d'accès avec jeton non échu, étape `l'opération est acceptée` livrée dès le rang 3 | **Acceptés.** Ils sont conformes à H-5 : une précondition décrit un état stable, donc un objectif « établi » est déposé si l'appareil le peut, et reste en attente sinon. L'étape `l'opération est acceptée` est celle du glossaire (ST-US-024 §12 n° 13). Sa livraison anticipée pour US-022 S11 est sans conflit. |
| 5 | Manifeste : appareil des HLC encodé par son identifiant, sans table d'appareils | **Accepté** (`SchemaManifesteV1`, `hlcManifeste`). Le manifeste de l'incrément 1 ne contient aucun HLC (`generation: INITIALE`). L'encodage n'aura d'effet qu'à l'incrément 3. Je le figerai dans ST-US-017 §5.2 à l'E10 de l'incrément 3. |
| **Q-BRU-R3-1** | `construireFeuilleSynchronisation` (ECR-011) : présente au §4.5, absente du §3.1 ; à qui, à quel rang ? | **C'est une omission de conception de ma part.** La feuille fait partie de l'incrément 1. ST-US-017 v0.3.1 l'ajoute au §3.1 (n° 17 b). **Responsable : Benjamin** (présentation), dans la PR séparée du reliquat du rang 3 (avec DT-006 et DT-009), une fois que j'aurai livré les tests UT-US-017-34 et suivants en rouge. Le point est suivi en dette **DT-011** (P2). Il ne bloque pas cette PR. |
| **Q-BRU-R3-2** | Entrées de journal de type inconnu ignorées à l'incrément 1 : conforme à ANT-19 ? | **Conforme.** ANT-19 (conservation et réécriture) relève de l'incrément 4 : variante `{ type: 'INCONNU', brut }` (ST-socle §5.1, Q-BEN-E12-9) et table `registresInconnus`. À l'incrément 1, ignorer sans erreur est la règle des registres de type ou de champ inconnu. La ST v0.3.1 §5.3 cite désormais explicitement le journal. **Condition** : un type *connu* de cette version ne doit jamais tomber dans cette branche, d'où RC-R3-1. |

## 4. Remarques

| Id | Bloquante | Référence | Constat | Action attendue |
|---|---|---|---|---|
| RC-R3-1 | **Oui** | `src/synchronisation/infrastructure/drive/format-v1.ts:44`, `:49`, `:310` ; `schemas/v1.ts:256`, `:397` | `TYPES_EVENEMENT` (et `TYPES_ELEMENT`) recopient à la main l'union `TypeEvenementJournal` (et `TypeElement`) dans un `Set`, sans contrôle d'exhaustivité. `lireEvenementV1` se termine par un transtypage `as EvenementJournal`. Si un rang ultérieur ajoute un type d'événement au domaine et oublie ces deux endroits, l'appareil émetteur l'écrit dans son fichier, mais l'appareil récepteur, **de même version**, l'**ignore en silence** (ou rejette tout le fichier si le type est dans le `Set` mais pas dans le schéma). Le journal diverge entre appareils sans aucun signal. Les registres sont protégés par le type `SchemasDesValeurs` ; le journal ne l'est pas. | (a) Dériver les deux ensembles d'un objet exhaustif : `const TYPES_EVENEMENT_V1 = { CREATION: true, … } as const satisfies Record<TypeEvenementJournal, true>`, puis `new Set(Object.keys(…))`, idem pour `TypeElement`. (b) Ajouter une assertion de type qui échoue à la compilation si l'union des `type` de `schemaContenuEvenement` diffère de `TypeEvenementJournal` (par exemple `z.output<…>['type']` comparé dans les deux sens). (c) Ajouter un test aller-retour `encoderFichierAppareil` → `decoderFichierAppareil` qui parcourt **tous** les types d'événements de l'objet exhaustif (UT-COMP-US-017-n). |
| RC-R3-2 | **Oui** | `src/synchronisation/application/cycle-synchronisation.ts:61`, `:295`, `:345`, `:370`, `:391`, `:402` (branches non couvertes) | Le fichier critique est à 85,9 % de branches. Le seuil du motif passe en agrégat, mais les branches non couvertes sont précisément celles qui protègent l'intégrité. En particulier : (1) une erreur non ignorable à la lecture d'un fichier d'appareil (`ServeurIndisponible`, `ReseauIndisponible`) doit interrompre le cycle **sans mémoriser le nouveau jeton**, sinon le fichier n'est jamais relu ; (2) `RessourceIntrouvable` (fichier supprimé entre l'inventaire et la lecture) est ignorée et journalisée ; (3) un échec de l'inventaire ou de `lireManifeste` (erreur non ignorable) interrompt le cycle sans dépôt ; (4) `#dossier` : échec de mémorisation de l'identifiant ; (5) `#integrer` : plan devenu vide dans la transaction (`ecrit = false`, `fusionNonDeposee` inchangé). | Ajouter des UT-COMP-US-017 (FauxDrive avec panne ciblée sur `lireFichierAppareil`, `changements`, `lireManifeste`) qui vérifient pour chaque cas l'issue, `meta.pageToken` **inchangé** (cas 1 et 3), l'absence de dépôt et la reprise programmée (5xx). Pour le cas 1, vérifier aussi qu'au cycle suivant, après le retour du service, le fichier est relu et fusionné. Aucune modification de `src/` n'est attendue, sauf si un test révèle un défaut. |
| RC-R3-3 | Non | `src/composition/web.ts:123` ; `cycle-synchronisation.ts:94` | `#premierPlan` vaut `true` à la création du cycle. Un espace ouvert pendant que la page est masquée (retour de redirection en arrière-plan, changement de compte dans un autre onglet) installe donc la période de 2 min jusqu'au prochain `visibilitychange`. | Dans `demarrerCycle` (composition), après `demarrer()`, appeler `definirPremierPlan(document.visibilityState === 'visible')`, via un adaptateur `Navigateur` pour rester testable. Sinon, passer l'état initial au constructeur. |
| RC-R3-4 | Non | `src/objectifs-taches/presentation/modeles-de-vue/ligne-objectif.ts:81-82` | `modeleAttente` construit un `Set` d'un seul élément à partir du booléen `resume.enAttente` pour appeler `mentionAttente`. C'est un détour peu lisible : la requête des résumés sait déjà si l'objectif est en attente. Le champ n'est pas rendu par `ligne-objectif.tsx` (rattaché à DT-011). | Garder `mentionAttente` comme seule source du code, mais l'appeler avec l'ensemble des éléments en attente exposé par la requête, ou ajouter une surcharge `mentionAttenteSi(enAttente: boolean)` dans le module. Ce point est à traiter au plus tard avec DT-011. |
| RC-R3-5 | Non | `src/synchronisation/infrastructure/drive/transport-synchro-drive.ts:235-260` | Si la création de `LISEZ-MOI.txt` échoue après celle du manifeste, le cycle échoue. Au cycle suivant, `lireManifeste` trouve le manifeste, le mémorise, et `LISEZ-MOI.txt` n'est plus jamais créé. | Créer `LISEZ-MOI.txt` en premier, ou s'assurer de sa présence (recherche `appProperties donejuan = lisezmoi`) quand le manifeste existe sans lui. À faire avant l'incrément 3, qui reprend les contrôles du dossier (§6.7). |
| RC-R3-6 | Non | `transport-synchro-drive.ts:88-97` | Les identifiants (`dossier`, `appareil`) sont interpolés entre apostrophes dans la requête `q` de Drive, sans échappement. Ils viennent de Drive ou d'un UUID local : il n'y a pas de risque aujourd'hui, mais la fonction ne se protège pas elle-même. | Ajouter un utilitaire `litteralRequeteDrive(valeur)` qui échappe `\` et `'` (syntaxe de requête Drive v3), et l'utiliser pour toute valeur interpolée. |
| RC-R3-7 | Non | `cycle-synchronisation.ts:154` | `deposerMaintenant` attend `this.#enCours`. Si le cycle en cours lève une exception (erreur de programmation), `deposerMaintenant` la propage à `DepotAvantSortieSynchro`, donc à la déconnexion ou à la suppression des données. | Attendre `this.#enCours.catch(() => undefined)` : l'exception est déjà journalisée par `#declencher`, et la sortie doit pouvoir tenter son propre dépôt. |

## 5. Points vérifiés sans remarque

- **Fusion** (`fusion.ts`) : HLC strictement plus grand ; union du journal par identifiant ; `dernierHlc = max` sur registres et journal reçus (DAT §6.4) ; index inchangé ; propriétés UT-US-017-29 à 31 vertes.
- **Dépôt** (`depot.ts`, `#deposer`) : `x` lu avant l'envoi, `deposeJusquA ← x` et retrait `≤ x` dans une transaction postérieure à la réponse de Drive (ENF-T-07). Une écriture faite pendant le dépôt reste en attente. La réutilisation de la lecture du début de cycle, quand aucune fusion n'a écrit, est correcte : `fichierPropre`, `deposeJusquA` et `fusionNonDeposee` ne sont modifiés que par le cycle, qui est sérialisé.
- **Jeton** : il est mémorisé après validation de toutes les fusions, et non plus après le dépôt comme le disait la ST v0.3. Ce choix est plus économe et aussi sûr, puisque les fusions sont déjà durables. La ST v0.3.1 §6.3 est alignée.
- **Transaction** (`depot-local-dexie.ts`) : une seule transaction `rw` stricte ; méta fusionnée clé à clé ; observateurs notifiés seulement si le plan est non vide (une écriture de la méta seule ne relance pas la temporisation) ; exception du calcul propagée sans écriture.
- **Format** : sérialisation canonique (ordre des unités de code, nombres non finis refusés), empreinte calculée sur l'objet brut (les champs inconnus sont couverts, ce qui prépare ANT-19), `FormatPlusRecent` détecté avant Zod, objets lâches, gzip natif.
- **Transport** : `changes.list` paginé, jeton refusé (400 ou 404) → `JetonChangementsInvalide` → inventaire complet dans le même cycle (RL-A3) ; jeton de départ obtenu avant l'inventaire ; jamais de second fichier d'appareil (CT-TRANS-03) ; aucune exception ne sort.
- **Cycle** : jamais deux cycles à la fois, une seule relance ; gestion des erreurs conforme au §6.3 (401 → `signalerRefus`, Drive plein, 5xx et 429 avec action requise à la 3e tentative et poursuite des tentatives, 403 → échec persistant).
- **Sécurité** : jeton dans l'en-tête seulement ; aucune donnée personnelle dans le journal technique (seuls les types d'erreurs) ; portée `drive.file` inchangée.
- **Composition** : cycle par espace, arrêté avant la fermeture du dépôt ; `DepotAvantSortie` réel. La fabrique à liaison tardive (`FabriqueCycle`) est acceptable, et elle est documentée.

## 6. Modifications faites par Anthony dans cette revue

| Fichier | Modification |
|---|---|
| `tests/unitaires/synchronisation/presentation/bandeau-libelles.test.ts` | **DT-010** : UT-COMP-US-022-207 (variante explicite : `BAN-ACCES-GOOGLE` 24H, `BAN-RAPPEL-24H` session) et 208 (sans variante : `BAN-CONSULTATION-SEULE` « avec-attente » ou de base, `BAN-RAPPEL-24H` sans action). Ils passent. `bandeau.ts` revient à 100 % de branches, sans modification de `src/`. |
| `docs/04-specification-technique/conventions.md` (v0.4.6) | §9.3 : DEC-041 et ADR-014, `style-src 'self' 'unsafe-inline'` comme seule exception, `script-src` inchangé ; mesures M2 à M4. |
| `docs/04-specification-technique/dette-technique.md` (v0.11) | DT-008 « En cours (DEC-041) », mise en œuvre sur `fix/DT-008-csp` ; DT-010 remboursée (effective à la fusion de la PR #6) ; DT-011 inscrite (feuille ECR-011 de l'incrément 1 et rendu de `MEN-ATTENTE`, Q-BRU-R3-1). |
| `docs/04-specification-technique/ST-US-017.md` (v0.3.1) | Q-BRU-R3-1 (§3.1 n° 17 b), Q-BRU-R3-2 (§5.3), §6.3 (moment de mémorisation du jeton, `RessourceIntrouvable`), §6.4 (`definirPremierPlan`), §4.5 (`attente` de la ligne d'objectif). |

## 7. Suite

1. Bruce traite RC-R3-1 et RC-R3-2 (itération 1/2), et répond aux remarques non bloquantes : correction ou justification.
2. Nouvelle revue limitée aux remarques ouvertes et aux nouveaux changements.
3. Hors de cette PR : la PR séparée de Benjamin (reliquat DT-006, DT-009, DT-011) après la livraison de mes tests de la feuille ; `fix/DT-008-csp` (M1, M2) ; M3 (Friday).
