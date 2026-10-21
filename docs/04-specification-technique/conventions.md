# Conventions techniques

> **Version 0.2 — 2026-10-21 — Anthony (responsable technique).** Alignement sur le DAT v0.5 et les ADR-001 à ADR-011 (statut « Proposé »), à l'issue du tour 1 du refinement de LOT-001 (E7).
>
> **Statut : brouillon applicable.** Les règles de ce document s'appliquent dès maintenant à LOT-001. La version 1.0 sera publiée à la revue de lancement de LOT-001 (E11), une fois levés les points encore ouverts du §17.2. Les marqueurs « En attente du DAT » de la v0.1 sont retirés : la stack est celle du DAT §3.2 et des décisions DS-01 à DS-20 (DAT §11).
>
> **Entrées** : `docs/workflow.md` ; cahier des charges v0.7 (RG-001 à RG-058) ; DAT v0.5 et ADR-001 à ADR-011 ; guide d'ergonomie v0.2.2 ; décisions DEC-010, DEC-012, DEC-015 à DEC-018 (`docs/suivi-projet.md`) ; compte rendu du tour 1 du refinement (`docs/ceremonies/refinement-LOT-001.md`) ; fichiers `.feature` de LOT-001 (219 scénarios).
>
> **Éléments attendus d'autres agents, non encore parus** (renvois explicites dans le texte) :
> - **couche de modèles de vue** au DAT (Starck, ANT-8) : §2.2, §4.3, §11.12 ;
> - **catalogue des codes d'état et des messages** au guide d'ergonomie (Steeve, ANT-7) : §8.5 ;
> - **glossaire d'étapes Gherkin** (Pepper, ANT-9, ANT-10, PEP-7) : §11.7 ;
> - **en-tête `Date` simulé et `appareilId` fixes du banc** (Starck, ANT-4, ANT-11) : §11.11.
>
> Toute contradiction entre ce document et un livrable d'un autre agent est remontée à Jarvis. Elle n'est jamais tranchée unilatéralement. Une règle du DAT ou d'un ADR prévaut sur ce document.

## Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Création : principes, organisation conceptuelle, règles de codage, erreurs, sécurité, stratégie de tests, Git, outillage par catégorie, DoD technique, points de testabilité, décisions attendues de Starck. |
| 0.2 | 2026-10-21 | Anthony | E7 de LOT-001, section 3 de l'avis de refinement (points 1 à 18). Marqueurs « En attente du DAT » retirés. Stack, versions figées et idiomes TypeScript (§3, §5.3, §6.2). Arborescence physique `src/<contexte>/<couche>/` (§4). Ports et doublures du DAT et de l'ADR-009 (§2.3, §11.10). Outillage complet et CI GitHub Actions (§13, §14 ; PO-7 : dépôt `mathieublandin-create/taskapp`). Seuils de couverture, dont 95 % pour la synchronisation (§12). Dates et temps selon DEC-012 et ADR-011 : `FUSEAU_REFERENCE`, date-fns et @date-fns/tz, fuseaux de CI, PT-16 (§7, §11.9). UUID v7 (§7.5). Sécurité DS-06 et DS-07 (§9). Nouvelle section stockage et synchronisation, dont RG-058 (§10). Banc de synchronisation (§11.11). Types de paramètres, organisation des steps, tags `@ihm`, `@lent`, `@google-reel`, `@recette` (§11.6 à §11.8). Couche de modèles de vue (§2.2, §4.3, §11.12). Catalogue de messages (§8.5). Glossaire code aligné sur le CdC v0.7 et le DAT §6.1 (§5.2). Points de testabilité mis à jour (§16). Dette DT-001 (données locales non chiffrées). |

## Sommaire

1. Portée et force des règles
2. Principes de conception
3. Stack et versions figées
4. Organisation du code
5. Règles de nommage
6. Règles de codage
7. Temps, durées, hasard et identifiants
8. Gestion des erreurs et catalogue de messages
9. Sécurité, jetons OAuth, données personnelles et journalisation
10. Stockage local et synchronisation
11. Stratégie de tests
12. Couverture minimale
13. Gestion de configuration et branches Git
14. Outillage et intégration continue
15. Definition of Done technique
16. Points de testabilité
17. Décisions de Starck et points ouverts
18. Documents associés

---

## 1. Portée et force des règles

- Le mot **« doit »** exprime une règle impérative. Une violation est une remarque de revue de gravité **Majeure** au minimum (voir `checklist-revue-code.md`).
- Le mot **« devrait »** exprime une recommandation forte. Un écart est accepté s'il est justifié dans le code ou dans la description de la revue.
- Une règle du **DAT ou d'un ADR** prévaut sur ce document. En cas d'écart, Anthony saisit Starck, sans contournement.
- Une **décision d'arbitrage** consignée dans `docs/suivi-projet.md` prévaut sur tout.
- Toute dérogation à une règle impérative est consignée dans `dette-technique.md` avec un identifiant `DT-xxx`.

## 2. Principes de conception

### 2.1 Principes généraux
| Principe | Application attendue dans le projet |
|---|---|
| **S** — Responsabilité unique | Un module, une classe ou une fonction a une seule raison de changer. Exemple : le calcul du reste à faire (RG-009) ne connaît ni le stockage ni l'affichage. |
| **O** — Ouvert / fermé | Les variations prévisibles s'ajoutent sans modifier le code existant. Exemple : un nouveau critère de priorité (RG-005) s'ajoute comme une nouvelle stratégie. |
| **L** — Substitution de Liskov | Toute implémentation d'un port (adaptateur réel ou doublure) respecte le même contrat, vérifié par la même suite de tests de contrat (§11.10). |
| **I** — Ségrégation des interfaces | Des ports étroits, orientés usage. Pas de port « Google » fourre-tout : le DAT sépare l'authentification (`FournisseurAuth`), le transport de synchronisation (`TransportSynchro`) et l'agenda (`PasserelleAgenda`). |
| **D** — Inversion des dépendances | Le domaine et l'application définissent les ports ; l'infrastructure les implémente. Les dépendances pointent toujours vers le domaine. |
| Clean code | Nommage révélant l'intention, fonctions courtes, pas de duplication, pas de code mort, pas de commentaire qui paraphrase le code. |
| Typage strict | TypeScript en mode le plus strict (§6.2), sans échappatoire (`any`, `as` injustifié, `!`, `@ts-ignore`) sauf justification en revue. |
| Erreurs explicites | Les erreurs prévisibles font partie du contrat des fonctions, par le type `Resultat` (§8). |
| Simplicité | La solution la plus simple qui satisfait la spécification. Pas de généralisation spéculative. |

### 2.2 Séparation en couches (DAT §2.4, ADR-010)
Le code est organisé en **architecture hexagonale (ports et adaptateurs)**. Les couches du DAT se projettent dans chaque contexte métier (§4.1) ainsi : `domaine`, `application`, `infrastructure`, `presentation` (couche `ui` du DAT). La couche `synchro` du DAT correspond au contexte `synchronisation`.

| Couche (dossier) | Contenu | Peut dépendre de | Ne doit jamais dépendre de |
|---|---|---|---|
| `domaine` | Entités, objets-valeurs, règles de gestion (RG), services de domaine purs, erreurs métier | Le domaine de son contexte, `commun/domaine`, le domaine public d'un autre contexte (§4.2) ; `date-fns` et `@date-fns/tz` dans `commun/domaine/temps` seulement (§7.2) | Application, infrastructure, présentation, React, Ionic, Zustand, Dexie, Capacitor, Zod, `fetch`, horloge système, aléatoire système, stockage, variables d'environnement |
| `application` | Cas d'usage (un par intention de l'utilisateur ou par traitement de rattrapage), **requêtes de lecture**, ports (interfaces), orchestration, transactions | `domaine`, `commun/application` | Infrastructure, présentation, framework d'IHM, Zod, API Google |
| `infrastructure` | Adaptateurs des ports : Dexie, SQLite, Drive REST, Calendar REST, Google Identity Services, authentification native, notifications locales, horloge et aléatoire système, journal technique | `application` (ports), `domaine` (mapping), bibliothèques tierces | Présentation |
| `presentation/modeles-de-vue` | **Modèles de vue** : fonctions pures qui transforment le résultat des requêtes de l'application en données d'affichage et en **codes d'état et de message** (§8.5) ; testables sans React | `application` (types des requêtes), `domaine` (types), `commun/presentation` | React, Ionic, Zustand, infrastructure, toute E/S |
| `presentation` (autres dossiers) | Composants et écrans React et Ionic, magasins Zustand, crochets (*hooks*) | Modèles de vue, `application` (appel des cas d'usage via la composition) | Infrastructure directement |
| `composition` | Point d'assemblage : instancie les adaptateurs et les injecte dans les cas d'usage, une configuration par plateforme (`web.ts`, `capacitor.ts`, DS-02) | Tout | — |

> **Renvoi** : la couche de modèles de vue est demandée à Starck (ANT-8) pour figurer au DAT. La définition ci-dessus est celle qu'Anthony applique en attendant. Si le DAT la précise autrement, le DAT prévaut et ce paragraphe sera aligné.

Règles impératives :
- Le domaine **doit** être pur : aucune entrée-sortie, aucune lecture de l'heure courante, aucun tirage aléatoire, aucun accès à une variable d'environnement. L'heure et le hasard lui sont **passés en paramètre** par la couche application, qui les obtient des ports `Horloge` et `SourceAleatoire`.
- Les règles de dépendance **doivent** être vérifiées automatiquement en CI par dependency-cruiser (§14.2).
- Les types d'une API Google, de Dexie, de SQLite, de Zod ou de Capacitor **ne doivent pas** traverser la frontière d'un adaptateur. L'adaptateur traduit vers les types du domaine ou de l'application.
- Les composants React **ne doivent contenir aucune logique** de décision : ils affichent un modèle de vue et déclenchent des cas d'usage. Toute condition d'affichage dérivée de l'état métier (afficher le bandeau RG-057, masquer la saisie en consultation seule RG-058, mention « heure de Paris » RG-054…) est calculée dans un modèle de vue.
- L'interface ne lit que la base locale ; elle ne fait jamais d'appel réseau bloquant (ADR-010).

### 2.3 Ports (DAT §2.4, ADR-010)
Les noms et le découpage des ports sont ceux du DAT. Chaque port est une `interface` TypeScript définie dans la couche `application` du contexte indiqué.

| Port | Contexte (dossier) | Responsabilité | Doublure de test (§11.10) | Référence |
|---|---|---|---|---|
| `DepotLocal` | `synchronisation/application/ports` | Lecture et écriture **transactionnelles** de l'état local (champs horodatés HLC, journal métier, pierres tombales), espace cloisonné par compte, abonnement aux changements | Adaptateur réel `DepotLocalDexie` sur `fake-indexeddb` (pas de doublure en mémoire, §11.10) | DS-07, ADR-010 |
| `TransportSynchro` | `synchronisation/application/ports` | Échanges avec le Drive : manifeste, liste des changements, lecture des fichiers des autres appareils, dépôt du fichier de l'appareil | `FauxDrive` | DS-10, DS-11, ADR-003 |
| `PasserelleAgenda` | Contexte agenda, fixé dans la ST du premier lot qui utilise l'agenda | Événements de l'application (séries de rappels, créneaux), lecture incrémentale, intervalles occupés | `FauxAgenda` | DS-18, ADR-006 |
| `FournisseurAuth` | `compte/application/ports` | Connexion et déconnexion Google, identité (`sub`), jeton d'accès valide, portées accordées, détection de la révocation et de la session expirée | `FauxFournisseurAuth` | DS-04, DS-05, ADR-004 |
| `CoffreJetons` | `compte/application/ports` | Conservation **en mémoire** du jeton d'accès ; aucun jeton de rafraîchissement (DS-06) | `CoffreJetonsMemoire` (l'adaptateur réel est déjà en mémoire) | DS-06 |
| `Horloge` | `commun/application/ports` | Instant courant de l'appareil ; fuseau de référence ; fuseau de l'appareil pour la seule mention RG-054 (§7.3) | `HorlogeSimulee` | ADR-011 |
| `Notifieur` | `commun/application/ports` | Notifications locales programmées (smartphone, lots ultérieurs) | `NotifieurMemoire` | DAT §5 |
| `Planificateur` | `commun/application/ports` | Déclenchements différés et périodiques : temporisation de dépôt de 5 s, synchronisation toutes les 2 min, évaluation du bandeau RG-057 chaque minute, attentes entre tentatives | `PlanificateurSimule` | DAT §4.3, §4.1.5 bis |
| `GenerateurIdentifiants` | `commun/application/ports` | Identifiants UUID v7 (§7.5) | `GenerateurIdentifiantsSequentiel` | DS-08 |
| `SourceAleatoire` | `commun/application/ports` | Tirages aléatoires (graine des fun facts) | `SourceAleatoireDeterministe` | DS-20, ADR-008 |
| `JournalTechnique` | `commun/application/ports` | Journal technique local (§9.4), distinct du **journal métier** `EvenementJournal` | `JournalTechniqueMemoire` | DAT §7.3 |
| `EtatReseau` | `commun/application/ports` | État connecté ou coupé, et événement de retour du réseau | `ReseauSimule` | DAT §4.3 |

- Les ports `CoffreJetons` (défini par Anthony, reconnu par le DAT §2.4), `GenerateurIdentifiants`, `SourceAleatoire`, `JournalTechnique` et `EtatReseau` complètent la liste du DAT. Ils sont transverses et sans effet sur l'architecture ; leur liste est soumise à Starck pour information (§17.2).
- Un **port interne à un contexte** (par exemple un verrou exclusif entre onglets pour `navigator.locks`, DAT §4.1.6) peut être défini dans une ST-US. Il est signalé à Starck dans la ST.
- Chaque port a **au moins deux implémentations**, l'adaptateur réel et une doublure, soumises à la même suite de contrat (§11.10), sauf `DepotLocal`, testé directement sur ses adaptateurs réels.
- Les événements créés par l'application sont marqués par `extendedProperties.private` et portent un identifiant déterministe (DS-18). Les appels Google sont idempotents (DAT §4.4.5).

### 2.4 Logique métier pure et testable
- Chaque RG est implémentée dans le **domaine** par une fonction pure, testable sans doublure, ou par une composition de telles fonctions.
- Les cas d'usage se limitent à : lire l'état, appeler le domaine, écrire en une transaction, signaler. Ils ne contiennent pas de règle métier.
- Les traitements dits « planifiés » sont, selon ADR-007, soit délégués à Google Calendar, soit des **rattrapages idempotents**. Ils sont découpés en :
  1. une **fonction pure** qui décide quoi faire pour un état et un jour donnés ;
  2. un **cas d'usage** qui l'appelle avec l'instant fourni par `Horloge` ;
  3. un **déclencheur** (ouverture, retour au premier plan, `Planificateur`) assemblé dans la composition.

## 3. Stack et versions figées

### 3.1 Pile (DAT §3.2, DS-01, DS-14, DS-16)
| Domaine | Outil | Règle de version |
|---|---|---|
| Exécution de l'outillage | **Node.js 24 LTS** | `.nvmrc` = `24` ; `package.json` : `"engines": { "node": ">=24 <25" }` ; `engine-strict=true` dans `.npmrc` |
| Gestionnaire de paquets | **pnpm** | Dernière version stable au démarrage d'E12 de LOT-001, figée dans le champ `packageManager` de `package.json` (`pnpm@x.y.z`) ; `pnpm install --frozen-lockfile` en CI |
| Langage | **TypeScript 5.x** | Dernière version 5.x stable au démarrage d'E12, figée **exactement** ; un passage en 6.x ou plus passe par Starck |
| Interface | React, Ionic React | Version exacte |
| Construction et PWA | Vite, vite-plugin-pwa (Workbox) | Version exacte |
| Coque mobile | Capacitor ; `@capacitor-community/sqlite` ; `@capacitor/local-notifications` (lots ultérieurs) | Version exacte |
| Base locale web | Dexie | Version exacte |
| État de l'interface | Zustand | Version exacte |
| Dates et fuseaux | **date-fns 4.x** et **@date-fns/tz** | Version exacte ; la version 4 est requise pour l'option `in` (§7.2) |
| Validation des fichiers Drive | Zod | Version exacte |
| Identifiants | `uuid` (fonction `v7`) | Version exacte ; dépendance ajoutée par les présentes conventions pour DS-08, justification au §7.5 |
| Tests | Vitest et `@vitest/coverage-v8`, `@testing-library/react`, `fake-indexeddb`, fast-check, `@cucumber/cucumber`, `tsx`, MSW, Playwright, `@axe-core/playwright`, Stryker | Version exacte |
| Qualité | ESLint (configuration *flat*), typescript-eslint, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `@vitest/eslint-plugin`, Prettier, dependency-cruiser, Semgrep, gitleaks, osv-scanner, license-checker, Husky, lint-staged | Version exacte (outils npm) ; version épinglée dans le workflow (outils hors npm) |

### 3.2 Règles de version
- **Versions exactes** : `save-exact=true` dans `.npmrc` ; aucune plage `^` ou `~` dans `package.json`. Le fichier `pnpm-lock.yaml` est versionné.
- Mises à jour par **Dependabot** (paquets npm et actions GitHub), regroupées chaque semaine. Une mise à jour majeure est une demande de revue à part, examinée par Anthony ; une mise à jour majeure de Node, TypeScript, React, Capacitor, Dexie ou d'une bibliothèque de stockage passe aussi par Starck.
- Toute nouvelle dépendance est justifiée dans la demande de revue : besoin, maintenance, licence, sécurité (RCD-16).

## 4. Organisation du code

### 4.1 Contextes métier
Le code est découpé d'abord **par contexte métier**, puis **par couche** (DAT §2.4, DS-15).

| Contexte | Contenu | Lot | RG principales |
|---|---|---|---|
| `commun` | Objets-valeurs partagés (`Duree`, `DateCalendaire`, `Instant`, `HeureLocale`, `SemaineIso`, `Fuseau`, identifiants), type `Resultat`, ports transverses, formatage et catalogue de messages | 1 | RG-028, RG-053 |
| `compte` | Connexion Google, identité, déconnexion, suppression des données de l'appareil, espace local par compte | 1 | RG-018, RG-019, RG-035, RG-043, RG-055 |
| `objectifs-taches` | Objectifs, sous-objectifs, tâches, sous-tâches, états, atteinte, retard, historique (journal métier) | 1 | RG-001 à RG-004, RG-022 à RG-030, RG-045 à RG-050 |
| `synchronisation` | État local horodaté (HLC), fusion CRDT, réparations, valeurs écartées, dépôt et lecture Drive, versions de format, hors ligne, bandeau des 24 h | 1 | RG-017, RG-020, RG-021, RG-036, RG-044, RG-047 à RG-049, RG-056 à RG-058, ENF-04, ENF-06 |
| `priorisation`, `planification`, `suivi-temps`, `pilotage`, `rappels` | Selon les épopées du backlog | Ultérieurs | — |

### 4.2 Arborescence physique (DS-15)
Un seul paquet pnpm, sans monodépôt.
```
/
  .github/                    workflows GitHub Actions, dependabot.yml, modèle de pull request
  android/                    généré par Capacitor (ios/ si l'arbitrage A1 retient l'iPhone)
  public/                     ressources statiques (dont fun-facts.fr.json, lot DEM-002)
  scripts/                    scripts d'outillage TypeScript (contrôle du catalogue, des tags…)
  src/
    commun/
      domaine/                type Resultat, objets-valeurs, temps/ (seul usage de date-fns, §7.2)
      application/ports/      Horloge, Planificateur, GenerateurIdentifiants, SourceAleatoire, JournalTechnique, EtatReseau, Notifieur
      infrastructure/         HorlogeSysteme, PlanificateurNavigateur, GenerateurUuidV7, SourceAleatoireCrypto, JournalTechniqueLocal, EtatReseauNavigateur
      presentation/           format/ (durées, dates), messages/ (catalogue, §8.5), composants partagés
    <contexte>/
      domaine/                entités, objets-valeurs, règles, erreurs métier
      application/            cas-usage/, requetes/, ports/
      infrastructure/         adaptateurs des ports du contexte
      presentation/
        modeles-de-vue/       fonctions pures, sans React (§2.2)
        etat/                 magasins Zustand
        composants/           composants React et Ionic
        ecrans/               écrans ECR-xxx
      index.ts                interface publique du contexte (seul point d'import depuis un autre contexte)
    infrastructure-google/    client HTTP Google partagé : fetch, traduction des erreurs, attente exponentielle, lecture de l'en-tête Date
    composition/              web.ts, capacitor.ts, test-ihm.ts (assemblage avec doublures pour @ihm)
    main.tsx                  point d'entrée
  tests/
    features/                 fichiers .feature (Pepper)
    steps/                    step definitions au niveau application (§11.7)
    steps-ihm/                step definitions des scénarios @ihm (Playwright)
    support/                  monde, hooks, types de paramètres, banc/ (§11.11), fabriques/
    doublures/                doublures des ports (§11.10)
    contrats/                 suites de contrat des ports
    unitaires/                tests unitaires, en miroir de src/ (non colocalisés, DS-15)
    integration/              adaptateurs réels : Dexie sur fake-indexeddb, SQLite sur node:sqlite, REST Google avec MSW
    e2e/                      parcours Playwright hors Cucumber (accessibilité axe, démarrage PWA)
    fixtures/                 données de test versionnées : drive/v<n>/, reponses-google/ (anonymisées)
```

Règles :
- Un contexte n'importe un autre contexte **que par son `index.ts`**. Aucun autre fichier « baril » (`index.ts` de réexport) n'est admis.
- `commun` ne contient que des éléments utilisés par au moins deux contextes. Il ne doit pas devenir un fourre-tout.
- Les tests unitaires reproduisent le chemin de `src/` : `src/objectifs-taches/domaine/tache.ts` → `tests/unitaires/objectifs-taches/domaine/tache.test.ts`.

### 4.3 Requêtes et modèles de vue
- Une **requête** (`application/requetes/`) lit l'état local et renvoie des données métier typées, sans formatage. Exemple : `listerTachesAFaire(depot, jour)`.
- Un **modèle de vue** (`presentation/modeles-de-vue/`) est une fonction pure `construire<Nom>(entrees) → ModeleVue<Nom>`. Ses entrées sont des résultats de requêtes et, si besoin, l'instant ou le jour courant, passés en paramètre. Sa sortie contient des valeurs prêtes à afficher et des **codes** (état, message, mention), jamais de JSX.
- Les scénarios Cucumber non tagués `@ihm` vérifient l'état observable de l'interface (indicateur de synchronisation, bandeaux, mentions, « non synchronisé ») **par les modèles de vue**, en comparant les codes du catalogue (§8.5).

## 5. Règles de nommage

### 5.1 Langue
- **Langage du domaine en français**, aligné sur le glossaire du cahier des charges (§6) et sur les fichiers `.feature`. Un terme métier a un seul nom, du `.feature` jusqu'au code.
- Identifiants **sans accents ni caractères spéciaux** (`Tache`, `resteAFaire`, `delai`).
- Termes d'une API tierce : conservés tels quels, **dans l'infrastructure uniquement** (`etag`, `syncToken`, `pageToken`, `extendedProperties`).
- Noms imposés par un framework : conservés (`useEffect`, `render`).
- Messages destinés à l'utilisateur : issus du catalogue (§8.5), jamais écrits en dur.

### 5.2 Glossaire code (CdC v0.7 §6, DAT §6.1)
| Terme métier | Identifiant de code | Remarque |
|---|---|---|
| Objectif, sous-objectif | `Objectif` (`parentId?: IdObjectif`) | RG-022 ; un seul niveau |
| Tâche, sous-tâche, tâche parente | `Tache` (`parentId?: IdTache`) | RG-023 ; un seul niveau ; estimation de la parente dérivée |
| État d'une tâche | `EtatTache` = `'A_FAIRE' \| 'TERMINEE' \| 'ABANDONNEE'` | RG-026, RG-027 ; registre unique avec `dateFin`, `dateAbandon`, `abandonParCascade` (DAT §4.2) |
| Délai (échéance) | `delai: DateCalendaire` | RG-002, RG-003, RG-045 |
| En retard | `estEnRetard(element, jour)` | RG-045 ; fonction dérivée, jamais stockée |
| Objectif atteint | `estAtteint(objectif, …)` | RG-025 ; dérivé |
| Estimation initiale | `estimationInitiale: Duree` | RG-028, RG-029 ; multiple de 30 min, minimum 30 min |
| Reste à faire | `resteAFaire` (dérivé), `resteAFaireCorrige?: Duree` | RG-009 |
| Temps passé | `SaisieTemps` (`tacheId`, `jour: DateCalendaire`, `duree: Duree`) | RG-008 |
| Lien tâche-objectif | `LienTacheObjectif` | RG-001 ; relation n-n |
| Suppression | `PierreTombale` | RG-046 ; jamais d'effacement physique en v1 |
| Journée | `jour: DateCalendaire` | RG-008, RG-053 ; calculée dans `FUSEAU_REFERENCE` |
| Fuseau de référence | `FUSEAU_REFERENCE` | RG-053, DEC-012 |
| Historique | `EvenementJournal`, type `TypeEvenementJournal` | RG-050, DS-19 ; journal **métier**, à ne pas confondre avec `JournalTechnique` |
| Appareil | `Appareil`, `appareilId: IdAppareil`, `NomAppareil` = `'smartphone' \| 'pc'` (tests) | RG-017 |
| Compte Google | `IdCompte` (claim `sub`), `EspaceLocal` (espace de stockage par compte) | RG-018, DEC-016 |
| Déconnexion | `SeDeconnecter` (cas d'usage) | RG-043 |
| Suppression des données de l'appareil | `SupprimerDonneesAppareil` (cas d'usage) | RG-055, DEC-015 |
| Horodatage de fusion | `Hlc` | ADR-011 |
| Valeur écartée | `ValeurEcartee` | RG-036 ; à l'écran : « modification non retenue » |
| Modifications non retenues | `ModificationNonRetenue`, `marquerCommeLue` | RG-056 |
| Incohérence après fusion | `Incoherence` | RG-049 ; dérivée |
| Fusion | `fusionner(etatA, etatB)` | RG-036, RG-047 à RG-049 |
| Format des données | `schemaVersion`, constante `SCHEMA_VERSION` | RG-058 |
| Consultation seule | `ModeSaisie` = `'NORMAL' \| 'CONSULTATION_SEULE'` | RG-058 |
| Génération des données | `generation` | RG-044 b |
| Modification en attente | `ModificationEnAttente`, marqueur `deposeJusquA: Hlc` | DS-11 |
| Dernier contact avec le Drive | `dernierContactDrive: Instant` | RG-057 ; local, non synchronisé |
| Bandeau de rappel hors ligne | `doitAfficherRappelHorsLigne(…)` | RG-057 ; règle de calcul selon la réponse à Q-ERG-16 |
| Planification, créneau, horaire suggéré | `Planification`, `CreneauAgenda`, `HoraireSuggere` | RG-006, RG-034 ; lots ultérieurs |
| Capacité | `CapaciteHebdo`, `ExceptionCapacite` | RG-011 ; lots ultérieurs |
| Rappels, bilan, fun facts | `Parametres`, `BilanSoir`, `RotationFunFacts`, `FunFact` | RG-012 à RG-014, RG-038 à RG-042 ; lots ultérieurs |

Ce glossaire est complété à chaque ST-US. Un nouveau terme métier y est ajouté avant d'être codé. Le glossaire d'**étapes Gherkin** relève de Pepper (§11.7).

### 5.3 Conventions de forme TypeScript
| Élément | Règle | Exemples |
|---|---|---|
| Fichier | `kebab-case`, un concept principal par fichier ; `.tsx` seulement pour un fichier qui contient du JSX | `calculer-reste-a-faire.ts`, `liste-taches.tsx` |
| Test unitaire, step, contrat | Suffixes `.test.ts`, `.steps.ts`, `.contrat.ts` | `tache.test.ts`, `taches.steps.ts`, `transport-synchro.contrat.ts` |
| Type, entité, objet-valeur | `PascalCase`, au singulier, déclaré par `type` | `Tache`, `Duree` |
| Port | `PascalCase`, nom du rôle, déclaré par `interface` | `DepotLocal`, `Horloge` |
| Adaptateur | Classe `PascalCase` : nom du port + technologie | `DepotLocalDexie`, `TransportSynchroDrive`, `FournisseurAuthGisWeb`, `HorlogeSysteme` |
| Doublure | Nature + port ou service simulé (ADR-009) | `FauxDrive`, `FauxAgenda`, `HorlogeSimulee`, `ReseauSimule` |
| Cas d'usage | Classe ou fonction `PascalCase`, verbe à l'infinitif | `CreerTache`, `DeclarerTacheTerminee`, `SeDeconnecter` |
| Fonction | `camelCase`, verbe à l'infinitif ; prédicat en `est`, `a`, `peut`, `doit` | `calculerResteAFaire`, `estEnRetard` |
| Constante | `MAJUSCULES_SNAKE`, avec la référence de la RG ou du DAT en commentaire | `FUSEAU_REFERENCE`, `TEMPORISATION_DEPOT` |
| Valeur littérale d'une union | `MAJUSCULES_SNAKE`, comme au DAT §6.1 | `'A_FAIRE'`, `'CONSULTATION_SEULE'` |
| Erreur | Union discriminée par `type`, valeur `PascalCase` décrivant la situation | `{ type: 'EstimationNonMultipleDe30Minutes' }` |
| Booléen | Forme affirmative | `estAbandonnee` |
| Unités | Portées par le type (`Duree`, `Instant`) ou, à défaut, par le nom | `delaiEnMs`, jamais `delai: number` |
| Crochet React | Imposé par React | `useModeleVueListeTaches` |

Abréviations interdites, sauf `RG`, `US`, `ISO`, `UTC`, `HLC`, `ID`/`Id`, `CRDT`, `PWA`, `URL`, `HTTP`.

## 6. Règles de codage

### 6.1 Règles générales
| Id | Règle | Force |
|---|---|---|
| RCD-01 | Une fonction fait une seule chose : 30 lignes utiles au plus (`max-lines-per-function`), complexité cyclomatique de 10 au plus (`complexity`), imbrication de 3 au plus (`max-depth`). | Doit |
| RCD-02 | Quatre paramètres au plus (`max-params`) ; au-delà, un objet de paramètres nommé. Pas de paramètre booléen qui change le comportement : deux fonctions explicites. | Doit |
| RCD-03 | Aucun nombre ou texte « magique ». Les valeurs métier et techniques (30 min, 24 h, 5 s, 2 min…) sont des constantes nommées qui référencent leur RG ou leur section du DAT. | Doit |
| RCD-04 | Pas de duplication de logique métier. Une RG est implémentée à un seul endroit. | Doit |
| RCD-05 | Pas de code mort, pas de code commenté, pas de `console.*` (seul `JournalTechniqueLocal` écrit). | Doit |
| RCD-06 | Pas de `TODO` ni de `FIXME` sans référence à la dette : `TODO(DT-xxx)`. | Doit |
| RCD-07 | Immuabilité : propriétés `readonly`, tableaux `ReadonlyArray<T>` ; une modification produit une nouvelle valeur. Les adaptateurs peuvent avoir un état interne privé. | Doit |
| RCD-08 | Absence de valeur explicite : propriété optionnelle (`?:`, avec `exactOptionalPropertyTypes`) ou `T \| undefined` ; `null` est réservé aux frontières (JSON, API) et converti par l'adaptateur. | Doit |
| RCD-09 | Pas de primitif nu pour un concept métier : types marqués (`Duree`, `DateCalendaire`, `IdTache`…), §6.2. | Doit |
| RCD-10 | Les invariants sont vérifiés à la construction : un objet du domaine invalide ne peut pas exister. | Doit |
| RCD-11 | Aucun état global mutable, aucun singleton porteur d'état hors de la composition. Injection manuelle par constructeur ou par paramètre (DS-13). | Doit |
| RCD-12 | Les commentaires expliquent le **pourquoi**. Chaque implémentation de RG porte la référence (`// RG-009`) au plus près du code. | Doit |
| RCD-13 | Exports **nommés** uniquement (pas d'`export default`, sauf fichier de configuration d'un outil qui l'exige). Seul `index.ts` expose un contexte. | Doit |
| RCD-14 | Aucune valeur de configuration ni secret en dur (§9.1). | Doit |
| RCD-15 | Zéro avertissement du compilateur et du linter. Une suppression locale (`eslint-disable-next-line`) cite la règle et sa justification, et est validée en revue ; `@ts-ignore` est interdit, `@ts-expect-error` n'est admis que dans les tests, avec justification. | Doit |
| RCD-16 | Toute dépendance tierce est justifiée (§3.2). | Doit |

### 6.2 Idiomes TypeScript (DS-01, DS-12, DS-13)
- **`tsconfig`** : `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `isolatedModules` ; cible ES2022 ; modules ESM.
- **Données** : `type`, unions discriminées, `readonly`. Pas d'`enum` (unions de littéraux). Pas de classe pour une donnée.
- **Classes** : admises pour les adaptateurs, les doublures et les cas d'usage (dépendances par constructeur). Pas d'héritage entre classes métier ; composition.
- **Types marqués** :
  ```ts
  type Marque<T, M extends string> = T & { readonly __marque: M };
  export type Duree = Marque<number, 'Duree'>;           // minutes entières
  export const creerDuree = (minutes: number): Resultat<Duree, DureeInvalide> => …;
  ```
  La conversion `as Duree` n'apparaît que dans le constructeur du type.
- **Exhaustivité** : tout `switch` sur une union est exhaustif (`@typescript-eslint/switch-exhaustiveness-check`) et se termine par `assertNever(x)` (`commun/domaine/assert-never.ts`).
- **`unknown` aux frontières** : toute donnée externe (fichier Drive, réponse Google, stockage local relu) entre en `unknown` et n'en sort que par une validation Zod (infrastructure).
- **Interdits** : `any` (explicite ou implicite), assertion non nulle `!`, `as` hors constructeurs de types marqués et tests, `Function`, `Object`, `{}` comme type, `namespace`, paramètres par défaut qui masquent une dépendance (horloge, fuseau).
- **Asynchronisme** : `async`/`await` ; les opérations faillibles renvoient `Promise<Resultat<T, E>>`. Annulation des appels réseau par `AbortSignal`. Aucune promesse flottante (`no-floating-promises`, `no-misused-promises`).
- **React** : composants fonctionnels ; règles des crochets ; aucun `dangerouslySetInnerHTML` ; styles par les jetons du guide d'ergonomie (§3, variables CSS), aucune couleur ni espacement en dur.
- **Zustand** : un magasin par contexte au plus, dans `presentation/etat/`, qui ne contient que des modèles de vue et l'état local d'écran ; aucune règle métier.

## 7. Temps, durées, hasard et identifiants

Références : DEC-012, ADR-011, DAT §6.4, RG-008, RG-053, RG-054.

### 7.1 Types temporels (`commun/domaine/temps/`)
| Type | Signification | Représentation en mémoire | Représentation persistée | Exemples |
|---|---|---|---|---|
| `Instant` | Point absolu dans le temps | `Marque<number, 'Instant'>`, millisecondes UTC depuis l'époque | ISO 8601 UTC avec `Z`, à la milliseconde (`2026-10-21T08:00:00.000Z`) | Date de création, d'une fin de tâche, composant physique de l'`Hlc` |
| `DateCalendaire` | Jour civil, sans heure ni fuseau | `Marque<string, 'DateCalendaire'>`, `AAAA-MM-JJ` validé | `AAAA-MM-JJ` | Délai, jour d'une saisie, jour d'un événement du journal |
| `HeureLocale` | Heure murale de Paris, sans date | `Marque<string, 'HeureLocale'>`, `HH:MM` | `HH:MM` | Heures des rappels (lots ultérieurs) |
| `SemaineIso` | Semaine ISO 8601, du lundi au dimanche | `{ annee, numero }` | `AAAA-Www` | Vélocité, historiques (lots ultérieurs) |
| `Fuseau` | Identifiant IANA | `Marque<string, 'Fuseau'>` | Jamais persisté (ADR-011 §3) | `FUSEAU_REFERENCE`, fuseau de l'appareil (affichage seul) |
| `Duree` | Durée en **minutes entières** | `Marque<number, 'Duree'>` | Entier de minutes | Estimation, reste à faire, temps passé |

Règles impératives :
- **`FUSEAU_REFERENCE`** = `'Europe/Paris'`, constante unique définie dans `src/commun/domaine/temps/fuseau-reference.ts` (ADR-011 §2). Ce n'est ni un paramètre utilisateur ni une donnée synchronisée.
- Le **jour d'une action** est calculé par `jourDeReference(instant: Instant): DateCalendaire`, dans `FUSEAU_REFERENCE`, **puis persisté** avec l'instant. Il n'est jamais recalculé à partir de l'instant lors d'une lecture.
- Les **dates civiles choisies par l'utilisateur** (délai, jour de saisie, date d'exception) restent des `DateCalendaire` et ne sont **jamais** converties en `Instant` (P-T1).
- Le **fuseau système de l'appareil n'intervient dans aucun calcul métier**. Il n'est lu que pour la mention « heure de Paris » (RG-054), via `Horloge.fuseauAppareil()`, dans un modèle de vue.
- Aucune durée en nombre à virgule. La contrainte « multiple de 30 min, minimum 30 min » (RG-028) est un invariant des types concernés (`creerEstimation`), pas de `Duree` elle-même.
- Une journée de Paris ne dure pas toujours 24 h (23 h ou 25 h aux changements d'heure) : « le lendemain » se calcule sur la `DateCalendaire`, jamais en ajoutant 24 h à un instant.
- **Conversion d'une heure murale de Paris en instant** (`instantDeReference(jour, heure)`), règle par défaut dite « compatible » (celle de Temporal et de RFC 5545) : une heure **ambiguë** (de 2 h à 2 h 59 le dernier dimanche d'octobre) prend la **première** occurrence (heure d'été) ; une heure **inexistante** (de 2 h à 2 h 59 le dernier dimanche de mars) est **décalée de la durée du saut** (2 h 30 devient 3 h 30 heure d'été). Une ST-US peut imposer une autre règle si une RG l'exige (PT-16 (3)).
- Le formatage pour l'affichage (« 1 h 30 », « 31 oct. ») est fait par `commun/presentation/format/`, selon le guide d'ergonomie §8.

### 7.2 Usage de date-fns et @date-fns/tz
- `date-fns` et `@date-fns/tz` ne sont importés **que** dans `src/commun/domaine/temps/` (calculs) et `src/commun/presentation/format/` (formatage, locale `fr`). Le reste du code utilise les fonctions de ces modules. Règle vérifiée par `no-restricted-imports` et dependency-cruiser.
- Tout appel date-fns qui dépend du calendrier (début de journée, jour de la semaine, semaine ISO, ajout de jours, formatage) **doit** recevoir le contexte du fuseau : `{ in: tz(FUSEAU_REFERENCE) }`, ou opérer sur une `TZDate` de ce fuseau. Un appel sans contexte de fuseau est une remarque **Majeure**.
- **Interdits partout dans `src/`**, vérifiés par ESLint (`no-restricted-syntax`, `no-restricted-globals`, `no-restricted-properties`) :
  - `Date.now()`, `new Date()` sans argument, `performance.now()` hors adaptateurs ;
  - les méthodes en heure locale de `Date` : `getFullYear`, `getMonth`, `getDate`, `getDay`, `getHours`, `getMinutes`, `getSeconds`, `getMilliseconds`, `getTimezoneOffset` et leurs `set…` ; `toLocaleString`, `toLocaleDateString`, `toLocaleTimeString`, `toString`, `toDateString` ; `new Date(annee, mois, …)` ; `Date.parse` ;
  - `Intl.DateTimeFormat().resolvedOptions()` hors `HorlogeSysteme`.
- `new Date(instant)` est admis dans `commun/domaine/temps/` et dans les adaptateurs, pour passer un instant à date-fns ou à une API.

### 7.3 Port `Horloge` et horloge simulée
```ts
export interface Horloge {
  maintenant(): Instant;                 // heure de l'appareil, non corrigée (la correction HLC relève de la synchronisation)
  readonly fuseauReference: Fuseau;      // toujours FUSEAU_REFERENCE (DAT §6.4)
  fuseauAppareil(): Fuseau;              // usage exclusif : mention « heure de Paris » (RG-054)
}
```
- Adaptateur : `HorlogeSysteme`, seul fichier autorisé à lire l'heure et le fuseau système.
- Doublure : `HorlogeSimulee` (`tests/doublures/`), construite sur le `TempsSimule` du banc (§11.11) : `positionner(instant)`, `avancer(duree)`, `dereglerDe(ecartEnMs)` (avance ou retard propre à l'appareil), `reglerFuseauAppareil(fuseau)`.
- `fuseauAppareil()` est un ajout au port, nécessaire pour tester RG-054 : il est soumis à Starck (§17.2).

### 7.4 Hasard
- Tout tirage passe par `SourceAleatoire` (`entierEntre(min, max)`, `octets(n)`). Adaptateur : `SourceAleatoireCrypto` (`crypto.getRandomValues`). Doublure : `SourceAleatoireDeterministe` (graine ou séquence imposée).
- `Math.random` et `crypto.randomUUID` sont interdits dans `src/` (DS-16).
- La permutation des fun facts (ADR-008) est implémentée dans le domaine avec un générateur pseudo-aléatoire initialisé par la graine : elle est donc déterministe.

### 7.5 Identifiants (DS-08)
- Les identifiants d'entités sont des **UUID v7** (RFC 9562), produits par le port `GenerateurIdentifiants` ; adaptateur `GenerateurUuidV7`, fondé sur la fonction `v7` du paquet `uuid` (bibliothèque de référence, sans dépendance, licence MIT ; elle évite une implémentation maison de la RFC).
- Chaque identifiant a son type marqué (`IdObjectif`, `IdTache`, `IdAppareil`…) ; un `IdTache` ne peut pas être passé là où un `IdObjectif` est attendu.
- Le tri par identifiant n'est **jamais** une règle métier : l'ordre de création est un champ explicite. L'horodatage intégré à l'UUID v7 n'est pas lu par le code.
- Exceptions à clé naturelle ou déterministe (DS-08) : `SaisieTemps` (tacheId, jour), `LienTacheObjectif` (tacheId, objectifId), `ExceptionCapacite` et `BilanSoir` (date), événements Google, `AlerteCreneau`, signalements de réparation (RG-048).
- Doublure : `GenerateurIdentifiantsSequentiel`, qui produit des UUID v7 **valides et prévisibles** (`00000000-0000-7000-8000-000000000001`, `…002`…), un compteur par monde de test.

## 8. Gestion des erreurs et catalogue de messages

### 8.1 Mécanisme (DS-12)
```ts
export type Succes<T> = { readonly ok: true; readonly valeur: T };
export type Echec<E> = { readonly ok: false; readonly erreur: E };
export type Resultat<T, E> = Succes<T> | Echec<E>;
```
- Défini dans `src/commun/domaine/resultat.ts`, avec `succes(valeur)` et `echec(erreur)`. Aucune bibliothèque.
- Les erreurs métier et les erreurs techniques attendues sont des **valeurs** de type union discriminée par `type`. Les exceptions (`throw`) sont réservées aux erreurs de programmation (invariant violé, état impossible).
- Un adaptateur **capture** les exceptions de ses bibliothèques (fetch, Dexie, SQLite, GIS) et les traduit en `Echec<ErreurPort>`. Aucune exception de bibliothèque ne sort d'un adaptateur.

### 8.2 Catégories
| Catégorie | Exemples | Traitement |
|---|---|---|
| **Erreur métier** | Estimation non multiple de 30 min (RG-028) ; délai de tâche absent (RG-003) ; troisième niveau de hiérarchie (RG-022, RG-023) | `Echec` renvoyé par le domaine ; aucune écriture ; message du catalogue ; journalisée au plus en `info`. |
| **Alerte métier** | Situation signalée sans blocage | L'opération réussit ; le résultat porte une liste d'alertes typées. |
| **Erreur technique attendue** | Réseau coupé, accès Google perdu, Drive plein, fichier illisible, format plus récent | Traduite par l'adaptateur en erreur du port (§8.3) ; le cas d'usage décide (nouvelle tentative, attente du réseau, consultation seule, demande de reconnexion). |
| **Erreur de programmation** | Invariant violé, branche impossible | `throw` ; capturée seulement aux frontières (gestionnaire global de l'interface, déclencheur de synchronisation) ; journalisée en `erreur`, sans donnée personnelle. |

### 8.3 Erreurs des ports
Liste de référence ; la liste exacte et le comportement de chaque erreur sont fixés dans la ST-US concernée (ST-US-022, ST-US-017).

| Erreur | Port | Situation | Comportement attendu |
|---|---|---|---|
| `ReseauIndisponible` | Tous les ports distants | Pas de réseau, délai dépassé | Pas d'erreur pour l'utilisateur : état hors ligne, modifications conservées (RG-021, ENF-06). |
| `SessionARenouveler` | `FournisseurAuth` | Jeton d'accès expiré sur PC, renouvellement soumis à un geste (DAT §4.1.2, F14) | Indicateur « Reprendre la synchronisation », sans bandeau (guide §6.4). |
| `AccesGoogleRevoque` | `FournisseurAuth`, ports distants | `401` après un renouvellement, `invalid_grant`, révocation | État « accès Google perdu », utilisation comme hors ligne (RG-035, PT-12). |
| `ConnexionAnnulee` | `FournisseurAuth` | Fenêtre de consentement fermée, refus | Rien n'est créé (US-022). |
| `PorteeInsuffisante` | `FournisseurAuth` | Portée refusée | Fonction concernée dégradée, les autres intactes (DS-05). |
| `DriveIndisponible` | `TransportSynchro` | Drive désactivé pour le compte | Message dédié (guide §6.3). |
| `EspaceDrivePlein` | `TransportSynchro` | Quota de stockage atteint | Modifications conservées, état « Action requise ». |
| `DonneesAbsentes`, `FichierIllisible` | `TransportSynchro` | Dossier ou fichier supprimé ; empreinte SHA-256 incorrecte ; échec de validation Zod | Traitement RG-044 ; le fichier n'est jamais fusionné. |
| `FormatPlusRecent` | `TransportSynchro` | `schemaVersion` supérieur à `SCHEMA_VERSION` | Consultation seule (RG-058, §10.3). |
| `QuotaDepasse`, `ErreurServeurDistant` | Ports distants | `429`, `403 rateLimitExceeded`, `5xx` | Nouvelle tentative avec attente exponentielle et gigue (DAT §4.4.5) ; **jamais** interprétée comme une absence de données (RG-044 b). |
| `JetonSynchroInvalide`, `RessourceIntrouvable` | `PasserelleAgenda` | `410`, `404` | Lots avec agenda (DAT §4.4). |

Il n'y a **pas** d'erreur `ConflitDeVersion` sur le Drive : chaque fichier n'a qu'un écrivain (DS-11).

### 8.4 Nouvelles tentatives et interdits
- Nouvelle tentative seulement sur une opération idempotente (dépôt du fichier complet de l'appareil, identifiants d'événements déterministes).
- Les attentes passent par le `Planificateur` : **aucune attente réelle dans un test**. Paramètres (1 s, facteur 2, plafond 5 min, DAT §4.4.5) : constantes nommées dans `src/infrastructure-google/reprise.ts`.
- Interdits : capture silencieuse ; capture globale ailleurs qu'aux frontières ; erreur utilisée pour un flux nominal (« hors ligne » n'est pas une exception) ; message technique, trace de pile ou code HTTP affiché à l'utilisateur.

### 8.5 Catalogue des codes d'état et des messages
> **Renvoi** : le catalogue des codes d'état et des messages est en cours d'ajout au guide d'ergonomie par Steeve (ANT-7). Il n'est **pas encore paru** dans la v0.2.2 (les textes figurent au §6.3 à §6.5 du guide, sans code). Les règles ci-dessous s'appliquent au catalogue dès sa parution ; **le format des codes retenu par Steeve prévaut** sur la proposition ci-dessous.

- **Source de vérité** : le catalogue du guide d'ergonomie (Steeve) donne pour chaque élément un **code stable** et le texte exact en français. Les fichiers `.feature` citent ce code ou ce texte.
- **Proposition de format** transmise à Steeve : `<NATURE>-<CTX>-nnn`, avec `NATURE` parmi `ETA` (état observable : indicateur, bandeau, mention, « non synchronisé »), `ERR` (erreur), `ALR` (alerte), `INF` (information, message éphémère), et `CTX` parmi `CPT` (compte), `SYN` (synchronisation), `OBJ` (objectifs), `TAC` (tâches), `COM` (commun).
- **Dans le code** : `src/commun/presentation/messages/catalogue.fr.ts` exporte un objet `CATALOGUE` typé `as const satisfies Record<CodeMessage, string>` ; `CodeMessage` est l'union des codes. Les paramètres (`{n}`, `{titre}`) sont interpolés par `traduire(code, parametres)`, pluriels par `Intl.PluralRules('fr')`.
- Les modèles de vue produisent des **codes** ; seuls les composants appellent `traduire`. Le domaine et l'application ne connaissent aucun code de message : la correspondance erreur → code est faite dans le modèle de vue.
- Les tests vérifient le **code**. Ils vérifient le texte seulement lorsque le `.feature` cite le texte mot pour mot (alors via `traduire`).
- Contrôle de CI `scripts/verifier-catalogue.ts` : chaque code du catalogue du guide existe dans `catalogue.fr.ts` avec le même texte, et réciproquement (§14.1).

## 9. Sécurité, jetons OAuth, données personnelles et journalisation

Référentiels : OWASP ASVS (PWA) et OWASP MASVS (Android) ; recommandations Google sur OAuth 2.0 pour les applications natives et web ; « Google API Services User Data Policy » (*Limited Use*) ; RGPD.

### 9.1 Secrets et configuration
- Aucun secret dans le dépôt. L'application n'a **aucun secret client** : tous ses clients OAuth sont publics (DS-04).
- Les identifiants de client OAuth (publics) sont injectés à la construction : `VITE_GOOGLE_CLIENT_ID_WEB` pour le web, configuration par variante de build pour Android. Un fichier `.env.exemple` documente les clés, sans valeur réelle ; les fichiers `.env*` réels ne sont pas versionnés.
- Toute variable préfixée `VITE_` est **publique** (incluse dans le paquet livré) : aucune valeur sensible ne doit en porter le préfixe.
- Secrets de CI (clé de signature Android, DAT §7.1) : uniquement dans les secrets GitHub Actions, avec une copie hors ligne chez le commanditaire.
- gitleaks s'exécute sur chaque commit poussé et dans les hooks locaux ; un secret détecté bloque la fusion et doit être **révoqué**, pas seulement retiré de l'historique.

### 9.2 Jetons OAuth (DS-04, DS-06, ADR-004)
| Règle | Force |
|---|---|
| Le jeton d'accès est conservé **en mémoire uniquement**, dans `CoffreJetonsMemoire`. Il n'est jamais écrit dans IndexedDB, SQLite, `localStorage`, `sessionStorage`, `@capacitor/preferences`, un cookie, le Drive, une URL, un journal, un message d'erreur ni un fichier de test. | Doit |
| Notre code ne manipule **aucun jeton de rafraîchissement** : le renouvellement est délégué à Google Identity Services (web), à Google Play services (Android) ou au SDK GoogleSignIn (iOS). | Doit |
| `localStorage` et `sessionStorage` sont interdits dans `src/` (`no-restricted-globals`). | Doit |
| Les portées accordées sont vérifiées après chaque autorisation (`PorteeInsuffisante` sinon). Portées du lot 1 : `openid`, `email`, `drive.file` (DS-05). Toute nouvelle portée passe par Starck et figure dans la ST-US. | Doit |
| Le compte est identifié par la claim `sub`, jamais par l'adresse e-mail. | Doit |
| Le script Google Identity Services est chargé **à la demande et de façon non bloquante** (DAT §4.1.6, R12). | Doit |
| Déconnexion (RG-043) : le jeton en mémoire et l'identifiant de compte actif sont effacés ; les données locales sont **conservées**. | Doit |

### 9.3 Données personnelles et stockage local (DS-07)
Données concernées : objectifs, tâches, temps passés, adresse e-mail et identifiant de compte ; à partir des lots ultérieurs, contenu de l'agenda et réponses de bilan (données les plus sensibles).

- **Espace local par compte** : une base IndexedDB ou un fichier SQLite par compte, nommé d'après l'**empreinte SHA-256 du `sub`** (en hexadécimal). Ni le `sub` en clair ni l'adresse e-mail n'apparaissent dans un nom de base, de fichier ou de clé. Un autre compte n'ouvre jamais l'espace du précédent (DEC-016).
- **Pas de chiffrement au repos en v1** (DS-07) : bac à sable Android, profil de navigateur. Les données restent sur l'appareil après une déconnexion (RG-043). Cette situation est inscrite au registre de dette (**DT-001**) ; la parade fonctionnelle est l'action « Supprimer les données de cet appareil » (DEC-015, RG-055).
- **Suppression des données de l'appareil** : suppression de l'espace complet du compte (base IndexedDB ou fichier SQLite), précédée du dépôt des modifications en attente (RG-055). Un test d'intégration vérifie qu'il ne reste **aucune** donnée de l'espace après l'opération.
- **Drive** : protégé par le compte Google, sans chiffrement supplémentaire (DEC-010). Les titres, descriptions et participants des événements de l'utilisateur ne sont jamais écrits dans le Drive ni dans les journaux (DAT §4.4.4).
- **Aucune transmission à un tiers** : ni analytique, ni télémétrie, ni outil de suivi d'erreurs (DAT §7.3).
- **Validation de toutes les entrées** : saisies de l'utilisateur ; fichiers Drive (validation Zod et empreinte, §10.3) ; réponses des API Google.
- **Web** (DAT §7.1) : CSP stricte sans `unsafe-inline` ni `unsafe-eval`, origines limitées à `accounts.google.com` et `*.googleapis.com` ; aucune ressource chargée depuis un CDN ; aucun `dangerouslySetInnerHTML` (`react/no-danger`) ; aucun `eval`, `new Function`, `innerHTML` ; Trusted Types si disponible.
- `navigator.storage.persist()` est demandé au premier lancement sur PC ; l'état obtenu est exposé dans l'écran « État de la synchronisation » (DAT §4.1.6).

### 9.4 Journal technique (DAT §7.3)
- Toute journalisation passe par le port `JournalTechnique`. Niveaux : `erreur`, `avertissement`, `info`, `debug` (désactivé en production).
- Destination : **locale uniquement**, tampon circulaire de 7 jours ; export du diagnostic sur demande de l'utilisateur.
- Format structuré : nom d'événement et champs.
- **Autorisé** : identifiants techniques opaques (UUID, `appareilId`), codes d'erreur, noms de cas d'usage, durées, compteurs, codes de statut HTTP, versions de l'application et du schéma, plateforme.
- **Interdit** : jetons, en-têtes `Authorization`, adresse e-mail, `sub` en clair, nom, titres et descriptions d'objectifs ou de tâches, contenu des fichiers Drive, contenu des événements d'agenda, corps des requêtes et réponses Google.
- `JournalTechniqueLocal` applique un **masquage défensif** (motifs de jetons `ya29.`, `Bearer`, adresses e-mail). Un test unitaire vérifie ce masquage.

### 9.5 Chaîne d'approvisionnement
- osv-scanner (vulnérabilités) et license-checker (licences autorisées : MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, CC0-1.0 ; toute autre licence est soumise à Anthony) en CI. Une vulnérabilité haute ou critique bloque la fusion, sauf dérogation inscrite en dette avec un plan.
- Les actions GitHub sont épinglées par **empreinte de commit** (SHA), pas par étiquette.

## 10. Stockage local et synchronisation

Références : DAT §4.2, §4.3, §6 ; ADR-003, ADR-010, ADR-011 ; DS-07, DS-10, DS-11.

### 10.1 Écritures locales
- Toute écriture métier passe par un **cas d'usage**, qui écrit **en une seule transaction** `DepotLocal` : les champs modifiés avec leur `Hlc`, les entrées du journal métier (RG-050, DS-19) et, le cas échéant, les pierres tombales. Aucune écriture partielle n'est possible.
- Aucun module hors du contexte `synchronisation` ne manipule la représentation CRDT (champ, `Hlc`, appareil) : les autres contextes manipulent des entités du domaine, que `DepotLocal` traduit.
- L'`Hlc` est produit **uniquement** par le service `HorlogeHybride` du contexte `synchronisation`, à partir de `Horloge.maintenant()` corrigé de l'écart mesuré avec l'en-tête `Date` de Google (ADR-011). Départage des égalités : `appareilId`, ordre lexicographique (DS-11).
- L'état d'une tâche et ses dates forment **un seul registre** (DAT §4.2). Les suppressions sont des **pierres tombales**, jamais des effacements physiques en v1.
- Une modification n'est jamais retirée de l'appareil avant son dépôt confirmé dans le Drive (ENF-T-07). Le marqueur `deposeJusquA` n'est avancé **qu'après** la confirmation du Drive.
- Les deux adaptateurs (`DepotLocalDexie`, `DepotLocalSqlite`) passent la **même suite de contrat** (§11.10). `DepotLocalSqlite` s'appuie sur une interface interne d'exécution SQL, implémentée par le module Capacitor en production et par `node:sqlite` en test.

### 10.2 Cycle de synchronisation
- Constantes nommées, regroupées dans `src/synchronisation/domaine/parametres-synchronisation.ts`, chacune avec sa référence : `TEMPORISATION_DEPOT` = 5 s, `PERIODE_SYNCHRONISATION_PREMIER_PLAN` = 2 min (DAT §4.3) ; `SEUIL_RAPPEL_HORS_LIGNE` = 24 h, `PERIODE_EVALUATION_RAPPEL_HORS_LIGNE` = 1 min (RG-057, DAT §4.1.5 bis) ; `SEUIL_HORLOGE_DEREGLEE` (valeur selon le CA numéroté demandé à Pepper, ANT-4).
- Tous les déclenchements différés ou périodiques passent par le `Planificateur` : `setTimeout`, `setInterval` et `requestIdleCallback` sont interdits hors `PlanificateurNavigateur`.
- La fusion est une fonction **pure** du domaine `synchronisation` : commutative, associative, idempotente (propriétés vérifiées par fast-check, §11.4). La passe de réparation (RG-047 à RG-049) est pure et déterministe.
- `dernierContactDrive` et les jetons de pagination (`pageToken`) sont des données **locales non synchronisées** (DAT §6.1).
- Sur PC, un seul onglet synchronise (verrou `navigator.locks`, derrière un port interne au contexte, §2.3).

### 10.3 Format des données dans le Drive et versions (RG-044, RG-058)
- **Schémas Zod versionnés** : `src/synchronisation/infrastructure/drive/schemas/v<n>.ts`. La constante `SCHEMA_VERSION` est définie dans un seul fichier.
- Chaque fichier lu est validé (Zod) et son **empreinte SHA-256** vérifiée (`crypto.subtle.digest`) avant toute fusion. L'empreinte est calculée sur une **sérialisation canonique** (clés triées, sans le champ d'empreinte), produite par une fonction unique utilisée à l'écriture et à la lecture.
- Un fichier invalide ou d'empreinte incorrecte n'est **jamais** fusionné et n'écrase jamais l'état local (RG-044).
- **Compatibilité (RG-058)** : le `schemaVersion` est le **seul** critère de blocage. En conséquence :
  - une évolution **compatible** (champ optionnel, nouveau type d'élément ignorable) **n'incrémente pas** `SCHEMA_VERSION`. Les schémas Zod de lecture **tolèrent** les champs inconnus : `.strict()` est interdit sur un schéma de fichier Drive ;
  - une évolution **incompatible** incrémente `SCHEMA_VERSION`. Elle exige : l'accord de Starck, l'annonce au commanditaire via Jarvis (elle bloque la saisie des appareils non mis à jour), une migration pure `migrerV<n>VersV<n+1>`, des fichiers d'exemple de chaque version antérieure dans `tests/fixtures/drive/v<n>/` et les tests de lecture correspondants ;
  - **consultation seule** (`FormatPlusRecent`) : l'appareil n'écrit **rien** dans le Drive, ne fusionne pas les fichiers plus récents et **n'efface rien** en local ; ses modifications en attente restent en base ; le contrôle de `generation` (RG-044 b) n'est effectué qu'**après** l'établissement de la compatibilité. Cette garde est implémentée **en un seul point** du cycle de synchronisation ;
  - tests obligatoires dès qu'une US touche au format : (a) lecture de chaque version antérieure ; (b) **coexistence** : un fichier de même `schemaVersion` contenant des champs inconnus est lu sans blocage et sans perte des données propres de l'appareil ; (c) consultation seule : aucune écriture Drive, aucun effacement local, modifications en attente conservées puis déposées après mise à jour.
- La conservation ou non des champs inconnus lors de la réécriture du fichier de l'appareil est soumise à Starck (§17.2).

## 11. Stratégie de tests

### 11.1 Démarche TDD dans le workflow
| Phase | Étape | Acteur | Production |
|---|---|---|---|
| Spécification par l'exemple | E5 | Pepper | Fichiers `.feature`, tags `@US-xxx`, `@RG-xxx`, `@LOT-xxx` et tags techniques (§11.8) |
| Conception testable | E9 | Anthony | ST-US : interfaces, tests unitaires fournis, step definitions à implémenter |
| **Rouge** | E10 | Anthony | Tests unitaires qui compilent (`tsc`), s'exécutent et **échouent pour la bonne raison** (comportement absent). Squelettes d'interfaces si nécessaire. |
| **Vert** | E12 | Benjamin | Implémentation minimale, step definitions comprises |
| **Refactorisation** | E12 | Benjamin | Amélioration sous tests verts, sans changement de comportement |
| Contrôle | E13 | Anthony | Revue selon `checklist-revue-code.md` |

Les tests d'Anthony **font foi**. Benjamin ne les modifie, ne les désactive ni ne les affaiblit sans accord écrit d'Anthony, tracé dans la revue. S'il estime un test faux, il le signale via Jarvis ; Anthony corrige ou confirme.

### 11.2 Pyramide de tests
| Niveau | Cible | Outil | Doublures | Temps cible | Auteur |
|---|---|---|---|---|---|
| Unitaires du domaine | Fonctions et objets du domaine | Vitest, fast-check | Aucune | < 10 ms par test | Anthony (fournis), Benjamin (complémentaires) |
| Unitaires de l'application | Cas d'usage, requêtes | Vitest | Doublures des ports, `DepotLocalDexie` sur `fake-indexeddb` | < 50 ms par test | Anthony, Benjamin |
| Unitaires des modèles de vue | Modèles de vue, formatage, catalogue | Vitest | Aucune (pur) | < 10 ms par test | Anthony, Benjamin |
| Composants | Composants React | Vitest, `@testing-library/react` | Modèles de vue fournis | < 100 ms par test | Benjamin |
| Contrat des ports | Même suite pour la doublure et l'adaptateur réel | Vitest, MSW | Réponses Google enregistrées | — | Anthony (suite), Benjamin (adaptateurs) |
| Intégration | Adaptateurs Dexie, SQLite, sérialisation, migrations | Vitest, `fake-indexeddb`, `node:sqlite` | Stockage réel temporaire | < 1 s par test | Benjamin, revus par Anthony |
| Acceptation | Scénarios `.feature`, sur la **couche application** (ADR-009) | cucumber-js | Banc de synchronisation (§11.11) | < 60 s pour la suite d'un lot | Pepper (`.feature`), Benjamin (steps) |
| Acceptation via l'IHM | Scénarios `@ihm` | cucumber-js et Playwright (Chromium) | `composition/test-ihm.ts` | — | Benjamin, sur spécification d'Anthony |
| Bout en bout | Démarrage de la PWA, hors ligne, accessibilité | Playwright, axe | Doublures Google | — | Benjamin |
| Recette manuelle | Scénarios `@recette`, appareil réel, compte de recette | — | Aucune | — | Pepper, Steeve, Starck (E14) |

### 11.3 Responsabilités
| Acteur | Responsabilité |
|---|---|
| Anthony | Stratégie de tests ; tests unitaires qui font foi (E10) ; suites de contrat ; spécification des steps, du monde et des doublures dans la ST-US ; revue des tests de Benjamin |
| Benjamin | Step definitions, doublures, adaptateurs ; tests complémentaires ; maintien du vert |
| Pepper | Fichiers `.feature` et tags ; glossaire d'étapes. Toute modification d'un `.feature` passe par elle. |
| Starck | Fidélité des doublures Google au comportement réel (E14) |

### 11.4 Règles d'écriture des tests
- **Nommage** (Vitest `it`) : en français, `<élément testé> — <résultat attendu> quand <condition>`.
- **Identifiant** : chaque test fourni par Anthony porte `UT-US-xxx-nn` en tête de son nom et la ou les RG couvertes, repris dans la ST-US. Exemple : `it('UT-US-002-04 calculerResteAFaire — renvoie 1 h 30 quand l\'estimation est de 2 h et le temps passé de 30 min (RG-009)', …)`.
- **Structure** Préparer / Agir / Vérifier, séparées visuellement. Un comportement par test.
- **Indépendance** : aucun ordre d'exécution (Vitest `sequence.shuffle` activé en CI), aucun état partagé, aucun fichier ni réseau réel en test unitaire.
- **Déterminisme** : aucun accès à l'horloge, au fuseau ou à l'aléatoire système, au réseau ; aucune attente réelle. Les tests passent dans tous les fuseaux de la CI (§14.1). `vi.useFakeTimers()` n'est pas utilisé pour remplacer le `Planificateur` : on injecte `PlanificateurSimule`.
- **Assertions précises** : valeurs exactes, types d'erreur exacts (`expect(r).toEqual(echec({ type: 'EstimationNonMultipleDe30Minutes' }))`).
- **Préférer les faux aux simulacres** ; `vi.mock` de module est interdit dans `tests/unitaires/` (on injecte des doublures). Ne jamais simuler une API qu'on ne possède pas (Google, Dexie) : on simule le **port**.
- **Tests par propriétés (fast-check)** pour les invariants : arithmétique des durées, convergence et idempotence de la fusion, réparation, rotation des fun facts. Graine fixe en CI (`FC_SEED`, valeur par défaut versionnée), 100 exécutions par propriété ; une exécution hebdomadaire utilise des graines aléatoires et 10 000 exécutions, et journalise la graine de tout échec, qui devient un cas de test fixe.

### 11.5 Tests affaiblis : interdits
Constituent un affaiblissement, refusé en revue avec une gravité **Bloquante** :
- supprimer un test, ou en retirer ou relâcher une assertion ;
- `it.skip`, `it.todo`, `it.only`, `describe.skip`, `describe.only`, `@wip`, `return 'pending'` dans une version fusionnée (règles `@vitest/eslint-plugin` `no-disabled-tests` et `no-focused-tests` en erreur) ;
- élargir une tolérance, remplacer une valeur exacte par une plage sans justification ;
- régénérer un instantané sans revue explicite de la différence ;
- remplacer par une doublure le code même qui est testé ;
- capturer l'erreur attendue de façon trop large ;
- modifier un `.feature` sans passer par Pepper ;
- retirer un fichier ou un dossier des seuils ou du périmètre de couverture.

### 11.6 Fichiers `.feature`
- Emplacement et nommage fixés par le workflow : `tests/features/US-xxx-<titre>.feature`, `# language: fr`, tags `@US-xxx`, `@RG-xxx`, `@LOT-xxx` sur chaque scénario.
- Attentes de testabilité à l'égard des `.feature` (transmises à Pepper via Jarvis) :
  - chaque scénario dépendant du temps fixe la date, l'heure et le fuseau (« Étant donné que nous sommes le 2026-10-21 à 10:00 heure de Europe/Paris ») ;
  - les durées métier ont une forme unique (`1 h`, `1 h 30`, `30 min`, `0 h`) ; les écoulements de temps peuvent s'écrire `10 minutes`, `1 minute`, `2 heures` ; dates au format `AAAA-MM-JJ` ; heures au format `HH:MM` ;
  - les délais exprimés en durée (« au plus tard 1 minute après ») sont vérifiés par l'avance de l'horloge simulée du banc, jamais par une attente réelle ;
  - les états de Google sont décrits en termes métier, jamais en termes d'API ;
  - un état visible de l'interface est désigné par son libellé exact ou son code du catalogue (§8.5).

### 11.7 Step definitions : organisation et types de paramètres
**Emplacement** : `tests/steps/<contexte>/<theme>.steps.ts`, un fichier **par thème métier** et non par US.

| Fichier | Contenu |
|---|---|
| `commun/temps.steps.ts` | « nous sommes le … », « N minutes plus tard », « N minutes s'écoulent… », horloge en avance ou en retard |
| `commun/appareils.steps.ts` | Appareils du banc, installation, ouverture et fermeture de l'application, fuseau d'un appareil |
| `commun/reseau.steps.ts` | Réseau coupé ou rétabli |
| `compte/connexion.steps.ts` | Connexion, déconnexion, accès perdu, session expirée, suppression des données de l'appareil |
| `objectifs-taches/objectifs.steps.ts` | Objectifs et sous-objectifs |
| `objectifs-taches/taches.steps.ts` | Tâches, sous-tâches, états, abandon |
| `synchronisation/echanges.steps.ts` | Échanges avec le Drive, modifications en attente, consultation seule |
| `synchronisation/drive.steps.ts` | Fichiers du Drive modifiés, supprimés ou illisibles ; Drive plein |
| `synchronisation/modifications-non-retenues.steps.ts` | Valeurs écartées, réparations, incohérences |
| `synchronisation/etat-affiche.steps.ts` | Indicateur, bandeaux, mentions, vérifiés par les modèles de vue |

**Support** (`tests/support/`) :
- `monde.ts` : classe `MondeDoneJuan` (étend `World` de cucumber-js) ; contient le `BancSynchro` (§11.11), les derniers résultats par appareil et les références nommées (titre → identifiant) ;
- `hooks.ts` : un monde neuf par scénario (`Before`) ; en fin de scénario (`After`), échec si le journal technique d'un appareil contient une entrée de niveau `erreur` non attendue par le scénario ;
- `types-parametres.ts` : types de paramètres communs ;
- `etape-sur-appareil.ts` : fonction `etapeSurAppareil(motif, implementation)` (voir ci-dessous) ;
- `fabriques/` : fabriques de données (§11.9).

**Types de paramètres** (`defineParameterType`) :
| Type | Expression régulière | Conversion | Exemples |
|---|---|---|---|
| `{appareil}` | `smartphone\|PC` | `NomAppareil` (`'smartphone'`, `'pc'`) | « sur le {appareil}, … » |
| `{duree}` | `\d+ h(?: \d{2})?\|\d+ minutes?\|\d+ min\|\d+ heures?` | `Duree` (minutes entières) | `1 h 30`, `30 min`, `0 h`, `10 minutes`, `1 minute`, `2 heures` |
| `{date}` | `\d{4}-\d{2}-\d{2}` | `DateCalendaire` (validée) | `2026-12-15` |
| `{heure}` | `\d{2}:\d{2}` | `HeureLocale` | `10:00` |
| `{fuseau}` | `UTC\|[A-Z][A-Za-z_]+(?:\/[A-Za-z_]+)+` | `Fuseau` (validé par `Intl`) | `Europe/Paris` ; entre guillemets dans la phrase si le `.feature` les écrit : `le fuseau "{fuseau}"` |

Les intitulés d'objectifs et de tâches utilisent le type natif `{string}`. Un nouveau type de paramètre est ajouté par une ST-US, dans ce fichier, jamais localement.

**Règles** :
- Une phrase Gherkin correspond à une seule définition ; une définition ambiguë ou manquante fait échouer la suite (mode strict).
- **Préfixes d'appareil et de temps** : une action ou une vérification portée par un appareil est enregistrée par `etapeSurAppareil(motif, fn)`, qui définit en une fois les variantes « `sur le {appareil}, <motif>` », « `{duree} plus tard, sur le {appareil}, <motif>` » (avance d'abord le temps simulé) et « `<motif>` » sans préfixe. La variante sans préfixe n'est valide que si le banc ne comporte **qu'un** appareil ; sinon elle échoue avec l'erreur « appareil ambigu ». L'implémentation de l'étape est ainsi écrite une seule fois.
- Les steps sont **minces** : ils traduisent la phrase en appel de cas d'usage, de requête ou de pilotage de doublure, sans logique métier ni calcul du résultat attendu.
- Les steps « Étant donné » préparent l'état **par les cas d'usage** ou par les fabriques, jamais en écrivant directement dans le stockage interne. Exception : les situations que l'application ne peut pas produire (fichier Drive modifié à la main, format plus récent) passent par l'API de pilotage des doublures.
- Les steps « Alors » vérifient par les **requêtes** de l'application, les **modèles de vue** (état affiché, codes du catalogue) ou l'**API d'observation** des doublures (fichiers du `FauxDrive`).
- Aucune définition inutilisée dans une version fusionnée : contrôle `cucumber-js --dry-run --format usage` en CI (§14.1).
- Chaque ST-US liste les phrases à implémenter, le fichier cible, et indique si le step est nouveau ou réutilisé.

> **Renvoi** : le **glossaire d'étapes** figé (appareils, synchronisation, temps, assertions, négations) est attendu de Pepper (ANT-9, ANT-10, PEP-7). Le découpage en fichiers ci-dessus lui sera aligné à sa parution, sans changer les règles.

### 11.8 Tags et profils d'exécution
| Tag | Posé par | Sens | Exécution |
|---|---|---|---|
| `@US-xxx`, `@RG-xxx`, `@LOT-xxx` | Pepper | Traçabilité, filtrage | — |
| `@ihm` | Pepper, sur demande d'Anthony | Le scénario n'est vérifiable qu'à travers l'interface réelle (service worker, démarrage de la PWA hors ligne, onglets) | Profil `ihm` uniquement : cucumber-js avec les steps de `tests/steps-ihm/`, Playwright (Chromium) sur la PWA construite avec `composition/test-ihm.ts` |
| `@lent` | Pepper, sur demande d'Anthony | Scénario de plus de 2 s (longues séquences de temps simulé) | Exclu du profil local `rapide` ; exécuté en CI |
| `@google-reel` | Pepper, sur demande d'Anthony | Vérification contre l'API Google réelle et un compte de test | **Jamais en CI** ; exécution manuelle (profil `google-reel`), en recette technique |
| `@recette` | Pepper, sur demande d'Anthony | Vérification humaine non automatisable (par exemple l'avertissement Google à la première connexion, ANT-1) | Aucune exécution automatisée ; vérifié en E14 et tracé dans le procès-verbal de recette |
| `@wip` | — | — | **Interdit** dans une version fusionnée |

Profils cucumber-js (`cucumber.mjs`), tous en `strict`, `# language: fr`, steps chargés par `tsx` :
| Profil | Filtre de tags | Steps | Où |
|---|---|---|---|
| `default` | `not @ihm and not @google-reel and not @recette` | `tests/steps/` | CI (chaque fuseau) |
| `rapide` | `default` et `not @lent` | `tests/steps/` | Poste de développement |
| `ihm` | `@ihm and not @google-reel and not @recette` | `tests/steps-ihm/` | CI (job `ihm`) |
| `google-reel` | `@google-reel` | `tests/steps/` avec adaptateurs réels | Manuel |

Par construction, tout scénario non tagué `@recette` ou `@google-reel` est exécuté par `default` ou par `ihm`. Le script `scripts/verifier-tags.ts` vérifie en CI que : chaque scénario porte `@US-`, `@RG-` (au moins un) et `@LOT-` ; chaque `@RG-xxx` existe dans le cahier des charges ; aucun `@wip` ; aucun tag technique hors liste.

### 11.9 Données de test et cas temporels
- Données construites par des **fabriques** à valeurs par défaut valides (par exemple : une tâche à faire, estimée à 1 h, de délai J+7 du temps simulé), surchargées seulement sur ce que le test vérifie.
- Aucune donnée personnelle réelle, aucun compte Google réel dans les tests automatisés. Intitulés fictifs et neutres.
- Fichiers Drive d'exemple versionnés dans `tests/fixtures/drive/v<n>/` ; réponses Google enregistrées, anonymisées, dans `tests/fixtures/reponses-google/`.

**Cas temporels** à couvrir dès qu'une RG dépend du temps ; la ST-US indique lesquels s'appliquent.
| Cas | Valeurs de test |
|---|---|
| Minuit à Paris | 23:59:59.999 et 00:00:00.000 heure de Paris ; en été, `2026-10-21T21:59:59.999Z` → jour 2026-10-21 et `2026-10-21T22:00:00.000Z` → jour 2026-10-22 |
| **PT-16 — passage à l'heure d'hiver**, dimanche 2026-10-25 | 3 h CEST devient 2 h CET ; la plage de 2 h à 2 h 59 existe deux fois ; journée de 25 h. 8 h de Paris = `2026-10-24T06:00Z` la veille et `2026-10-25T07:00Z` le jour même ; 21 h de Paris = `2026-10-24T19:00Z` et `2026-10-25T20:00Z`. Action à 0 h 30 de Paris (`2026-10-24T22:30Z`) → jour 2026-10-25 ; à 23 h 30 (`2026-10-25T22:30Z`) → jour 2026-10-25. 2 h 30 → `2026-10-25T00:30Z` (première occurrence, §7.1). |
| **PT-16 — passage à l'heure d'été**, dimanche 2027-03-28 | 2 h CET devient 3 h CEST ; la plage de 2 h à 2 h 59 n'existe pas ; journée de 23 h. 8 h de Paris = `2027-03-27T07:00Z` la veille et `2027-03-28T06:00Z` le jour même ; 21 h = `2027-03-27T20:00Z` et `2027-03-28T19:00Z`. Action à 0 h 30 (`2027-03-27T23:30Z`) → jour 2027-03-28 ; à 23 h 30 (`2027-03-28T21:30Z`) → jour 2027-03-28. 2 h 30 → 3 h 30 CEST (`2027-03-28T01:30Z`). |
| PT-16 — semaines et HLC | Semaines ISO contenant ces dimanches : 2026-W43 (19 au 25 octobre 2026) et 2027-W12 (22 au 28 mars 2027) ; l'`Hlc` (UTC) est insensible au changement d'heure |
| Semaine ISO | Lundi 00:00 et dimanche 23:59 de Paris ; année à 53 semaines : 2026-W53, du lundi 2026-12-28 au dimanche 2027-01-03 |
| Fin d'année, année bissextile | 2026-12-31 → 2027-01-01 ; 2028-02-29 |
| Appareil hors du fuseau de Paris | Appareil réglé sur `America/New_York` : même jour calculé que sur un appareil à Paris ; mention « heure de Paris » présente (RG-054) ; absente pour un appareil réglé sur `Europe/Paris` |
| Horloges décalées | Appareil en avance de 5 min sur l'autre (RG-036, PT-03) ; horloge déréglée au-delà du seuil (ANT-4) |
| Application non ouverte plusieurs jours | Rattrapage idempotent (lots ultérieurs, PT-07) |

### 11.10 Doublures (ADR-009)
Les API Google réelles ne sont **jamais** appelées par les tests automatisés de la CI. Les doublures sont dans `tests/doublures/`.

| Doublure | Port | Comportements simulés (sur commande du test) |
|---|---|---|
| `FauxDrive` | `TransportSynchro` | Stockage **partagé** entre les appareils du banc ; `transportPour(appareil)` renvoie la vue d'un appareil, soumise à son `ReseauSimule` et à son `FauxFournisseurAuth`. Dépôt et lecture ; liste des changements ; manifeste, `generation`, `schemaVersion` ; fichier modifié, supprimé ou illisible « à la main » ; empreinte incorrecte ; dossier supprimé ; Drive plein ; Drive indisponible ; erreurs `401`, `403`, `404`, `429`, `5xx` ; en-tête `Date` de chaque réponse égal au temps simulé de référence (ANT-4) |
| `FauxAgenda` | `PasserelleAgenda` | Lots avec agenda : erreurs `401`, `409`, `410`, `429`, `5xx` (ADR-009) ; événements de l'utilisateur ; déplacement « par l'utilisateur » sans toucher `posApp` (PT-05) |
| `FauxFournisseurAuth` | `FournisseurAuth` | Connexion réussie, annulée ou interrompue ; portée refusée ; session expirée (PC) ; révocation ; changement de compte ; Drive désactivé pour le compte |
| `HorlogeSimulee` | `Horloge` | §7.3 |
| `ReseauSimule` | `EtatReseau` | Connecté, coupé, retour du réseau (émet l'événement) |
| `PlanificateurSimule` | `Planificateur` | Exécute dans l'ordre les déclenchements échus quand le temps simulé avance ; aucune attente réelle |
| `SourceAleatoireDeterministe`, `GenerateurIdentifiantsSequentiel`, `JournalTechniqueMemoire`, `NotifieurMemoire`, `CoffreJetonsMemoire` | Ports transverses | Déterministes ; API d'observation |

- `DepotLocal` n'a **pas** de doublure en mémoire : les tests utilisent l'adaptateur réel `DepotLocalDexie` sur `fake-indexeddb` (une fabrique `IDBFactory` neuve par appareil simulé), pour exercer le vrai code transactionnel.
- Chaque doublure est soumise à la **suite de contrat** de son port (`tests/contrats/<port>.contrat.ts`), exécutée aussi contre l'adaptateur réel : avec MSW en CI, et contre un compte Google de test en exécution manuelle (`@google-reel`). Starck valide la fidélité en E14.
- Les doublures exposent une **API de pilotage** (`couperReseau()`, `modifierFichierALaMain(appareil)`, `revoquerAcces()`…) et une **API d'observation** (`fichiers()`, `nombreAppels(operation)`), en français.

### 11.11 Banc de synchronisation
Le **banc** (`tests/support/banc/`) est le cœur des scénarios Cucumber et des tests de propriétés de la synchronisation.

- `TempsSimule` : l'heure « vraie » du banc, unique ; elle date les réponses du `FauxDrive` (en-tête `Date`).
- `BancSynchro` : un `FauxDrive` et un `FauxAgenda` partagés ; un `PlanificateurSimule` global ; une liste d'`AppareilSimule`.
- `AppareilSimule` : `nom` (`smartphone` ou `pc`), `appareilId` **fixe** (`smartphone` = `00000000-0000-7000-8000-000000000001`, `pc` = `00000000-0000-7000-8000-000000000002`, sous réserve de la réponse de Starck à ANT-11 ; l'ordre lexicographique est connu pour le départage des égalités), `HorlogeSimulee` (temps simulé + décalage propre), `ReseauSimule`, `FauxFournisseurAuth`, base `fake-indexeddb` propre, composition complète de l'application (cas d'usage, requêtes, modèles de vue, cycle de synchronisation).
- API du banc : `ajouterAppareil(nom)`, `avancerTemps(duree)` (exécute les déclenchements échus de tous les appareils), `ouvrirApplication(appareil)`, `fermerApplication(appareil)`, `arreterBrutalement(appareil)` (perte de la mémoire, conservation de la base), `redemarrer(appareil)`, `synchroniserJusquAuRepos()` (enchaîne les cycles jusqu'à ce qu'aucun appareil n'ait de travail en attente, avec un nombre maximal d'itérations au-delà duquel le test échoue).
- **Propriétés** vérifiées (fast-check, séquences aléatoires de modifications, coupures et synchronisations sur deux appareils, à graine fixe) : **convergence** (après synchronisation jusqu'au repos, états identiques) ; **aucune perte silencieuse** (toute valeur non retenue figure dans les modifications non retenues, ENF-06) ; **idempotence** (synchroniser deux fois ne change rien) ; **reprise** (un arrêt brutal à n'importe quelle étape, puis une reprise, aboutit au même état).
- **Injection de pannes** : le `FauxDrive` peut échouer à une étape choisie du cycle (avant ou après le dépôt, avant l'avancée de `deposeJusquA`) pour vérifier PT-13.

### 11.12 Tests des modèles de vue et de l'interface
- Chaque modèle de vue a des tests unitaires exhaustifs de ses états (par exemple, l'indicateur de synchronisation : chacun des états du guide §6.5 et leur priorité).
- Les composants sont testés avec `@testing-library/react` sur des modèles de vue fournis : rendu du libellé du catalogue, rôle ARIA, action déclenchée. Pas de test de style.
- Playwright couvre les parcours `@ihm` et quelques parcours hors Cucumber (démarrage, hors ligne, accessibilité axe sans violation de niveau `serious` ou `critical`).

## 12. Couverture minimale

Mesure : Vitest, `@vitest/coverage-v8`, seuils par motif de chemin (`coverage.thresholds`). Les scénarios Cucumber ne sont pas comptés dans la couverture de code (ils ont leur propre couverture fonctionnelle, ci-dessous).

| Périmètre (motif) | Lignes | Branches | Remarque |
|---|---|---|---|
| Domaine : `src/*/domaine/**` | 95 % | 90 % | Toute RG a au moins un test unitaire qui la cite |
| **Synchronisation** : `src/synchronisation/{domaine,application}/**` | **95 %** | **90 %** | Zone de risque majeure (R14) ; complétée par les propriétés du banc |
| Application : `src/*/application/**` | 90 % | 85 % | — |
| Modèles de vue, formatage, catalogue : `src/*/presentation/modeles-de-vue/**`, `src/commun/presentation/{format,messages}/**` | 90 % | 85 % | Purs, donc entièrement testables |
| Composants et écrans : `src/*/presentation/{composants,ecrans}/**` | 70 % | 60 % | Complétée par Playwright |
| Infrastructure : `src/*/infrastructure/**`, `src/infrastructure-google/**` | 70 % | 60 % | Complétée par les tests de contrat |
| Global | 85 % | 75 % | — |

Règles :
- **Non-régression** : la couverture d'un fichier modifié ne baisse pas (comparaison avec la branche cible, en CI).
- Exclusions déclarées dans la configuration uniquement : `src/composition/**`, `src/main.tsx`, `**/*.d.ts`. Aucune annotation locale d'exclusion (`/* v8 ignore */`) sans justification en revue.
- **Couverture fonctionnelle** : chaque critère d'acceptation a au moins un scénario ; chaque RG du lot a au moins un scénario tagué `@RG-xxx` et au moins un test unitaire qui la cite.
- **Mutation** (Stryker) sur `src/*/domaine/**` : indicateur hebdomadaire, cible 70 % ; le caractère bloquant sera décidé en version 1.0.
- La couverture est un indicateur, pas un objectif : un test sans assertion utile est refusé en revue même s'il augmente la couverture.

## 13. Gestion de configuration et branches Git

### 13.1 Dépôt et branches
Dépôt : **GitHub, `mathieublandin-create/taskapp`** (PO-7 tranché).

| Branche | Rôle | Créée depuis | Fusionnée vers | Quand |
|---|---|---|---|---|
| `main` | Version de référence, toujours verte et livrable | — | — | Protégée : pas de poussée directe de code ; fusion par *pull request* uniquement |
| `lot/LOT-xxx-<slug>` | Intégration du lot en développement | `main` | `main` | Créée en E10, fusionnée en E17 |
| `us/US-xxx-<slug>` | Une branche par US (ou par incrément d'US, voir ci-dessous) | `lot/…` | `lot/…` | Créée en E10 (tests rouges), développée en E12, fusionnée après **Approuvé** en E13 |
| `ano/ANO-xxx-<slug>` | Correction d'une anomalie de recette | `lot/…` | `lot/…` | E15, puis revue E13 |

- Une US livrée en **incréments internes** (Q-LOT-1, option b recommandée pour US-017) a une branche par incrément : `us/US-017-<n>-<slug>`, chacune soumise à sa propre revue E13.
- Une branche d'US est rebasée sur la branche de lot avant la revue ; la fusion se fait par *pull request* en **commit de fusion** (pas d'écrasement ni de rebase à la fusion), pour garder la trace de l'US.
- Les commits de tests rouges (E10) sont admis sur la branche d'US uniquement ; la branche de lot et `main` restent vertes.
- **Protection des branches** `main` et `lot/*` (à configurer par le propriétaire du dépôt, action transmise à Jarvis) : *pull request* obligatoire, contrôles requis du §14.1 verts, branche à jour, historique sans réécriture forcée.
- Les documents des agents (`docs/`, `tests/features/`) suivent le circuit défini par Jarvis ; ils ne sont pas soumis à la revue de code.

### 13.2 Convention de commits
```
<type>(<portée>): <résumé à l'impératif, 72 caractères au plus>

<corps facultatif : le pourquoi, les choix>

Réf: US-xxx[, RG-xxx][, RC-US-xxx-n][, ANO-xxx][, DT-xxx]
```
- `type` : `feat`, `fix`, `test`, `refactor`, `perf`, `build`, `ci`, `docs`, `chore`.
- `portée` : l'US (`US-002`) ou, à défaut, le contexte (`synchronisation`).
- Commits **atomiques** : un commit compile et ne mélange pas refactorisation et changement de comportement.
- Les commits de documentation des agents gardent la convention en usage dans le dépôt (`Ex <objet> : <résumé>`).
- Les lignes d'attribution demandées par l'environnement sont ajoutées en fin de message.

### 13.3 Versions et livrables
- Versionnement sémantique de l'application ; une étiquette `vX.Y.Z` est posée sur `main` à la clôture de chaque lot (E17). La version de l'application est distincte de `SCHEMA_VERSION` (DAT §7.4).
- Versionnés : `pnpm-lock.yaml`, configurations des outils, `android/` (hors artefacts). Non versionnés : `dist/`, `coverage/`, rapports, `.env*` réels, données locales, clés de signature.

## 14. Outillage et intégration continue

### 14.1 Contrôles (GitHub Actions)
| Contrôle | Outil et commande (scripts `package.json`) | Bloquant |
|---|---|---|
| Installation | `pnpm install --frozen-lockfile` | Oui |
| Formatage | `pnpm format:verifier` (`prettier --check .`) | Oui |
| Lint | `pnpm lint` (`eslint . --max-warnings 0`) | Oui |
| Types | `pnpm types` (`tsc --noEmit`) | Oui |
| Architecture | `pnpm architecture` (`depcruise src --config .dependency-cruiser.cjs`) | Oui |
| Catalogue et tags | `pnpm verifier:catalogue` (§8.5), `pnpm verifier:tags` (§11.8) | Oui (catalogue : dès sa parution) |
| Tests unitaires, contrat, intégration | `pnpm test` (`vitest run`), **dans chaque fuseau** `TZ=UTC`, `TZ=Pacific/Auckland`, `TZ=America/New_York` | Oui |
| Couverture | `pnpm test:couverture`, une fois (job `TZ=UTC`), seuils du §12 | Oui |
| Cucumber | `pnpm cucumber` (profil `default`), dans chacun des trois fuseaux ; `pnpm cucumber:steps-inutilises` | Oui |
| Cucumber IHM et bout en bout | `pnpm build` puis `pnpm cucumber:ihm` et `pnpm e2e` (Playwright, Chromium) | Oui |
| SAST | Semgrep (règles `p/typescript`, `p/react`, `p/owasp-top-ten`, `p/secrets`) | Oui (gravité haute et critique) |
| Secrets | gitleaks, sur les commits poussés | Oui |
| Dépendances | osv-scanner ; license-checker (§9.5) | Oui (haute et critique) |
| Build | PWA (`vite build`) ; APK de debug Android (`cap sync android`, Gradle, JDK 21) | Oui |
| Mutation, propriétés étendues | Stryker ; fast-check à graines aléatoires | Non (hebdomadaire, indicateur) |

Le fuseau `Europe/Paris` n'est volontairement pas un fuseau de CI : il masquerait un usage involontaire du fuseau système. Les postes de développement, généralement à Paris, l'exercent déjà.

### 14.2 Configuration des outils
- **ESLint** (`eslint.config.js`, configuration *flat*) : `typescript-eslint` `strict-type-checked` et `stylistic-type-checked` ; `react-hooks` ; `jsx-a11y` (recommandé) ; `@vitest/eslint-plugin` sur `tests/` ; règles du §6 (`max-lines-per-function` 30 lignes utiles, `complexity` 10, `max-depth` 3, `max-params` 4, `switch-exhaustiveness-check`, `no-non-null-assertion`, `consistent-type-definitions` en `type` sauf ports, `no-restricted-syntax` contre `enum` et `export default`) ; interdits du §7.2, §7.4, §9.2 et §10.2. Les **exceptions** pour les adaptateurs autorisés (`HorlogeSysteme`, `PlanificateurNavigateur`, `SourceAleatoireCrypto`, `GenerateurUuidV7`, `JournalTechniqueLocal`, `EtatReseauNavigateur`) sont déclarées par blocs `files` dans la configuration, jamais par commentaire local.
- **Importations restreintes** (`no-restricted-imports`, doublé par dependency-cruiser) : `date-fns`, `@date-fns/tz` (§7.2) ; `dexie` (adaptateur Dexie) ; `zod` (`synchronisation/infrastructure`, `compte/infrastructure`) ; `react`, `@ionic/*`, `zustand` (présentation hors modèles de vue) ; `@capacitor/*` (infrastructure et `composition/capacitor.ts`) ; `msw`, `fake-indexeddb`, `fast-check`, `@cucumber/*`, `@playwright/*` (tests uniquement).
- **dependency-cruiser** (`.dependency-cruiser.cjs`) : règles de couches du §2.2 ; imports entre contextes par `index.ts` seulement ; aucune dépendance de `src/` vers `tests/` ; aucun cycle ; aucun module orphelin dans `src/`.
- **Prettier** : configuration par défaut, `printWidth` 100, guillemets simples, virgules finales ; aucun débat de forme en revue.
- **Hooks locaux** (Husky, lint-staged) : formatage, lint des fichiers indexés et gitleaks avant commit. Recommandés, non substituables à la CI.

### 14.3 Workflows
- `.github/workflows/ci.yml` : sur poussée vers `us/**`, `ano/**`, `lot/**`, `main` et sur *pull request* ; jobs `qualite` (formatage, lint, types, architecture, catalogue, tags), `tests` (matrice des trois fuseaux, unitaires et Cucumber ; couverture dans le job `UTC`), `ihm` (build, Cucumber `@ihm`, Playwright), `securite` (Semgrep, gitleaks, osv-scanner, licences), `build` (PWA, APK). Durée cible inférieure à 10 minutes hors job `ihm`. `permissions: contents: read` par défaut.
- `.github/workflows/hebdomadaire.yml` : Stryker, fast-check étendu, osv-scanner complet.
- `.github/workflows/publication.yml` : sur étiquette `v*` ; déploiement de la PWA et publication de l'AAB signé, selon les arbitrages A2 et A3 (hors périmètre de la CI de LOT-001 tant qu'ils ne sont pas tranchés).
- `.github/dependabot.yml` (npm, actions GitHub) et `.github/pull_request_template.md` (reprend la DoD du §15).
- Pendant E10, la CI d'une branche `us/` est rouge par construction (tests rouges) : seuls les contrôles des *pull requests* vers `lot/*` et `main` sont requis.

## 15. Definition of Done technique

Une US (ou un incrément d'US) est soumise à la revue (E13) seulement si **tous** les points suivants sont vérifiés par Benjamin, puis contrôlés par Anthony.

**Tests**
- [ ] Tous les tests unitaires fournis par Anthony sont passants, **sans modification** (ou avec un accord écrit d'Anthony tracé dans la revue).
- [ ] Tous les scénarios de l'US sont passants en mode strict, dans le profil `default` et, s'il y a lieu, `ihm` ; aucun step indéfini, ambigu ou inutilisé.
- [ ] Aucune régression : la suite complète est verte sur la branche rebasée sur la branche de lot, **dans les trois fuseaux de la CI**.
- [ ] Les seuils de couverture (§12) sont respectés, sans baisse sur les fichiers modifiés.
- [ ] Les tests ajoutés par Benjamin respectent §11.4 et ne dupliquent pas ceux d'Anthony.

**Qualité**
- [ ] Formatage, lint, types, architecture, catalogue, tags et analyses de sécurité au vert, sans nouvelle suppression d'avertissement non justifiée.
- [ ] Conformité à la ST-US : fichiers, signatures, modèle de données, erreurs, patterns imposés. Tout écart a été validé par Anthony avant la revue.
- [ ] Règles de nommage et de codage (§5, §6) respectées ; chaque RG implémentée est référencée dans le code.
- [ ] Aucune logique de décision dans un composant React : elle est dans un modèle de vue testé.
- [ ] Aucun texte affiché hors du catalogue de messages.
- [ ] Aucun `TODO` sans `DT-xxx` ; toute dette introduite est déclarée à Anthony.

**Sécurité et données**
- [ ] Aucun secret, jeton ou donnée personnelle dans le code, les tests, les journaux ou l'historique Git.
- [ ] Portées OAuth inchangées, ou évolution prévue par la ST-US et validée par Starck.
- [ ] Entrées externes validées ; erreurs Google traduites par les adaptateurs.

**Données et compatibilité**
- [ ] Toute écriture métier passe par un cas d'usage, en une transaction, avec son entrée de journal métier (RG-050).
- [ ] Toute évolution du format Drive respecte §10.3 : compatible sans incrément de `SCHEMA_VERSION`, ou incompatible avec accord de Starck, annonce au commanditaire, migration et tests de lecture, de coexistence et de consultation seule.

**Livraison**
- [ ] Commits conformes au §13.2 ; branche à jour avec la branche de lot.
- [ ] *Pull request* conforme au modèle : résumé, écarts à la ST-US, dette déclarée, sortie des commandes de tests, de couverture et d'analyse.
- [ ] Documentation technique à jour si nécessaire (ST-US « tel que réalisé », glossaire code §5.2).

## 16. Points de testabilité

État des points de testabilité de la v0.1 après les réponses du DAT v0.5 (§11) et DEC-012. Le détail de la v0.1 reste consultable dans l'historique Git.

| PT | Sujet | Approche retenue | État |
|---|---|---|---|
| PT-01 | Fun facts équitables (RG-040 à RG-042) | Permutation déterministe par cycle (ADR-008) ; propriétés : chaque fun fact une fois par cycle, écart d'au plus 1, pas de doublon à la jonction, rejouabilité | Approche validée (DAT) ; lot DEM-002 |
| PT-02 | Rappels de 8 h et 21 h | Séries Google Calendar ; contenu = fonction pure (état, jour, instant) ; aucune écriture après l'heure | Approche validée ; lot « Rappels » ; gabarit exact des événements à obtenir de Pepper |
| PT-03 | Conflits « la plus récente l'emporte » | HLC corrigée par l'en-tête `Date`, départage par `appareilId` ; banc à horloges décalées ; propriétés | Validée ; reste : seuil de l'horloge déréglée en CA numéroté (Pepper, ANT-4), en-tête `Date` simulé et `appareilId` fixes (Starck, ANT-4, ANT-11) |
| PT-04 | « Visible dans l'heure » | Mécanismes vérifiables par le temps simulé : ouverture, dépôt à 5 s, toutes les 2 min, retour du réseau | Validée par le DAT ; reformulation des délais d'US-017 en mécanismes demandée à Pepper (ANT-3) |
| PT-05 | Créneau déplacé dans l'agenda | `posApp` dans l'événement ; `FauxAgenda` | Validée ; lots avec agenda |
| PT-06 | Journée et fuseaux | **Résolu par DEC-012** : jour de Paris calculé à partir de l'instant puis persisté ; tests dans trois fuseaux de CI ; RG-054 testée par `Horloge.fuseauAppareil()` | Clos (ajout au port soumis à Starck, §17.2) |
| PT-07 | Report automatique | Fonction pure (état, jour de Paris) ; rattrapage idempotent | Validée ; lot « Planification » |
| PT-08 | Vélocité et historiques | Journal métier dès le lot 1 (DS-19, RG-050) | Validée ; journal à alimenter dès LOT-001 |
| PT-09 | Durées au pas de 30 min | `Duree` en minutes entières ; invariant d'estimation ; propriétés ; estimation calculée nulle face au minimum de 30 min (BEN-10, PEP-9) | Question à Pepper et Starck en cours (objet-valeur `Duree`, PEP-9) |
| PT-10 | Ordre de priorité | Ordre total exigé | Lot « Priorisation » |
| PT-11 | Horaire suggéré | Fonction pure, exemples tabulaires | Lot « Planification » |
| PT-12 | Perte d'accès Google | `FauxFournisseurAuth` ; utilisation comme hors ligne ; aucune perte | Validée (DAT PT-12) ; ST-US-022 et ST-US-017 |
| PT-13 | Hors ligne et aucune perte | Transaction locale ; `deposeJusquA` avancé après confirmation ; injection de pannes dans le banc (§11.11) | Validée (DAT PT-13) |
| PT-14 | Questions de bilan | — | Lot DEM-002 |
| PT-15 | Alertes de délais dans les rappels | Gabarit exact et exemples chiffrés | Lot « Rappels » |
| **PT-16** | Changements d'heure à Paris | Valeurs du §11.9 ; règle de conversion par défaut du §7.1 | Nouveau (DAT §11) ; applicable dès LOT-001 au calcul du jour et du retard (RG-045) |

## 17. Décisions de Starck et points ouverts

### 17.1 Décisions DS-01 à DS-20 (DAT §11) : intégration
| DS | Objet | Intégré au |
|---|---|---|
| DS-01 | TypeScript 5.x, options strictes, Node 24 LTS, idiomes | §3, §6.2 |
| DS-02 | Base de code unique, PWA et Capacitor, composition par plateforme | §2.2, §4.2 |
| DS-03 | Aucun serveur | §9 |
| DS-04, DS-05 | Clients publics, portées du lot 1, autorisation incrémentale | §9.1, §9.2 |
| DS-06 | `CoffreJetons` en mémoire, aucun jeton de rafraîchissement | §2.3, §9.2 |
| DS-07 | `DepotLocal` Dexie et SQLite, transaction par cas d'usage, espace par compte, pas de chiffrement au repos | §9.3, §10.1 ; dette DT-001 |
| DS-08 | UUID v7 | §7.5 |
| DS-09 | Délégation à Calendar et rattrapage | §2.4 |
| DS-10, DS-11 | Format Drive, CRDT par champ, HLC, pas de file d'opérations | §10 |
| DS-12 | Type `Resultat` | §8.1 |
| DS-13 | Injection manuelle, Zustand | §6.1, §6.2 |
| DS-14 | Vitest, fast-check, cucumber-js, MSW, Playwright, Stryker | §3, §11 |
| DS-15 | Un paquet, `src/<contexte>/<couche>/`, tests séparés | §4 |
| DS-16 | Outillage qualité | §14 |
| DS-17 | GitHub Actions (PO-7 tranché : dépôt GitHub) | §13, §14 |
| DS-18 | Calendar | §2.3 ; lots avec agenda |
| DS-19 | Journal métier dès le lot 1 | §10.1 |
| DS-20 | Fun facts | §7.4 ; lot DEM-002 |

Les seuils de couverture proposés au DAT §3.3 et à l'ADR-009 (90 % pour `domaine` et `synchro`, 80 % au global) sont remplacés par ceux du §12, plus exigeants, conformément à la délégation de l'ADR-009 (« seuils fixés par Anthony »).

### 17.2 Points ouverts
| Id | Point | Destinataire | Bloquant pour |
|---|---|---|---|
| ANT-8 | Couche de modèles de vue au DAT (§2.2, §4.3) | Starck | Version 1.0 de ce document ; non bloquant pour E9 (la définition du §2.2 s'applique) |
| ANT-7 | Catalogue des codes d'état et des messages (§8.5) | Steeve | E9 d'US-017, US-018, US-022, US-031 |
| ANT-9, ANT-10, PEP-7 | Glossaire d'étapes Gherkin (§11.7) | Pepper | E9 (liste des steps des ST-US) |
| ANT-4, ANT-11 | En-tête `Date` simulé et `appareilId` fixes du banc (§11.11) | Starck | E9 d'US-017 |
| ANT-12 | Statut du DAT et des ADR avant E9 | Starck, Jarvis | E9 |
| ANT-17 (nouveau) | Ajout de `fuseauAppareil()` au port `Horloge` pour RG-054 (§7.3) | Starck | E9 d'US-017 (scénarios CA-11 « heure de Paris ») |
| ANT-18 (nouveau) | Ports transverses complémentaires (`GenerateurIdentifiants`, `SourceAleatoire`, `JournalTechnique`, `EtatReseau`), placement de `DepotLocal` et `TransportSynchro` dans le contexte `synchronisation`, rôle du port `Planificateur` (§2.3) : pour information et confirmation | Starck | Non bloquant |
| ANT-19 (nouveau) | RG-058 : un appareil conserve-t-il, en réécrivant son fichier, les champs inconnus de même `schemaVersion` reçus d'une version plus récente, ou les ignore-t-il ? (§10.3) | Starck | E9 d'US-017 |
| ANT-20 (nouveau) | Exécution des scénarios `@ihm` par cucumber-js avec Playwright (profil `ihm`, §11.8) : conformité à l'ADR-009, qui réserve Playwright aux parcours bout en bout et exécute Cucumber sur la couche application | Starck | E9 d'US-031 |
| — | Protection des branches `main` et `lot/*` sur GitHub (§13.1) | Jarvis (propriétaire du dépôt) | E12 |
| R1, R2, R11 | Test technique préalable | Jarvis, commanditaire | E9 d'US-022 et d'US-017 |

## 18. Documents associés
- `checklist-revue-code.md` : grille de revue de code (E13).
- `modele-ST-US.md` : gabarit des spécifications techniques par US (E9).
- `dette-technique.md` : registre de la dette technique.
- `docs/03-architecture/DAT.md` (v0.5) et `docs/03-architecture/adr/` (ADR-001 à ADR-011).
- `docs/02-ux/guide-ergonomie.md` (v0.2.2) : tokens, états, messages ; catalogue des codes à paraître.
