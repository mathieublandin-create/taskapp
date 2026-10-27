# Conventions techniques

> **Version 0.4.1 — 2026-10-22 — Anthony (responsable technique).** La v0.4.1 clôt ANT-26 et ANT-27 d'après le DAT v0.11.1 §7.4 bis (§9.1, §9.3, §14.3, §17.2). **Version 0.4 :** Alignement sur **ADR-013** (PWA unique sur tous les appareils, statut « Proposé », sous condition de DEC-034) et sur le **DAT v0.11**. La cible est une seule PWA (`composition/web.ts`, IndexedDB par Dexie en durabilité stricte, connexion par redirection `prompt=none` à l'ouverture). Capacitor, SQLite, le module natif, l'APK, sa signature, `publication.yml` et les secrets de signature sont regroupés au **§19 « Repli (ADR-012), si la condition de DEC-034 échoue »**, sans être supprimés. La v0.3 (E9 de LOT-001, ANT-22) reste la base de toutes les autres règles.
>
> **Condition de DEC-034** : mesures M-RED et M-PERSIST du test technique v3 sur Chrome Android (DAT PO-11). Tant qu'elle n'est pas mesurée, la cible s'applique et le §19 reste en sommeil. Si elle échoue, le §19 redevient applicable pour Android, la cible restant valable pour le PC.
>
> **Statut : brouillon applicable.** Les règles de ce document s'appliquent dès maintenant à LOT-001. La version 1.0 sera publiée à la revue de lancement de LOT-001 (E11), une fois connu le résultat du test technique v3 (R11, M-RED, M-PERSIST ; §17.2). Les règles qui dépendent de ce résultat portent la mention **« Sous réserve R11 »** ou **« Sous réserve M-RED »**, avec l'hypothèse retenue, tirée du DAT. La mention « Sous réserve R1 » ne vaut plus qu'en repli (§19) : avec un client OAuth Web unique, R1 est sans objet (DAT v0.11 §10.1).
>
> **Entrées** : `docs/workflow.md` ; cahier des charges v0.11 (RG-001 à RG-058) ; DAT v0.11 et ADR-001 à ADR-013 ; `poc-specification.md` v2 §15 (écarts EC-3 et EC-4) ; guide d'ergonomie v0.2.8, dont le catalogue des libellés et des codes d'état (§6.6) ; glossaire d'étapes v1.4 (`tests/features/GLOSSAIRE-ETAPES.md`) ; décisions DEC-010, DEC-012, DEC-015 à DEC-035 (`docs/suivi-projet.md`) ; contrôle d'explicitation de LOT-001 et ses hypothèses de conception H-1 à H-7 (`docs/ceremonies/explicitation-LOT-001.md`) ; fichiers `.feature` de LOT-001 (**270 scénarios**).
>
> **Documents de conception de LOT-001** : `ST-socle-ecriture.md` (modèle d'écriture synchronisable, commun à US-001 et à l'incrément 1 d'US-017) et les `ST-US-xxx.md`. L'ordre de réalisation est dans `docs/lots/LOT-001.md`, section « Ordre de réalisation ».
>
> Toute contradiction entre ce document et un livrable d'un autre agent est remontée à Jarvis. Elle n'est jamais tranchée unilatéralement. Une règle du DAT ou d'un ADR prévaut sur ce document.

## Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Création : principes, organisation conceptuelle, règles de codage, erreurs, sécurité, stratégie de tests, Git, outillage par catégorie, DoD technique, points de testabilité, décisions attendues de Starck. |
| 0.2 | 2026-10-21 | Anthony | E7 de LOT-001, section 3 de l'avis de refinement (points 1 à 18), sur la base du DAT v0.6, du guide d'ergonomie v0.2.3 et du glossaire d'étapes v1.0. Marqueurs « En attente du DAT » retirés. Stack, versions figées et idiomes TypeScript (§3, §5.3, §6.2). Arborescence physique `src/<contexte>/<couche>/` (§4). Ports et doublures du DAT et de l'ADR-009 (§2.3, §11.10). Outillage complet et CI GitHub Actions (§13, §14 ; PO-7 : dépôt `mathieublandin-create/taskapp`). Seuils de couverture, dont 95 % pour la synchronisation (§12). Dates et temps selon DEC-012 et ADR-011 : `FUSEAU_REFERENCE`, date-fns et @date-fns/tz, fuseaux de CI, PT-16 (§7, §11.9). UUID v7 (§7.5). Sécurité DS-06 et DS-07 (§9). Nouvelle section stockage et synchronisation, dont RG-058 (§10). Banc de synchronisation (§11.11). Types de paramètres, organisation des steps, tags `@ihm`, `@lent`, `@google-reel`, `@recette` (§11.6 à §11.8). Couche de modèles de vue (§2.2, §4.3, §11.12). Catalogue de messages (§8.5). Glossaire code aligné sur le CdC v0.8 et le DAT §6.1 (§5.2) ; `Duree.saisie` et `Duree.calculee`, `EcartTemps` (§7.1). Points de testabilité mis à jour (§16). Dette DT-001 (données locales non chiffrées). |
| 0.3 | 2026-10-22 | Anthony | E9 de LOT-001, ANT-22. Entrées : DAT v0.10.1, ADR-012, CdC v0.11, glossaire v1.4, guide v0.2.8, 270 scénarios. Port `Horloge` : horloge monotone (DS-11 v0.9, §7.3). Écriture synchronisable : `ServiceEtatLocal`, contexte causal, index des écritures en attente, décompte par élément, journal métier typé (§10.1, §5.2 ; détail dans `ST-socle-ecriture.md`). Commandes avec confirmation (§8.6). Catalogue v0.2.8 : `data-a-lire`, `data-variante`, motifs `ERR-001` à `ERR-006` (§8.5). Distribution Android par APK : nom de paquet, `.gitignore` posé avant toute clé, secrets de signature (DEC-027), `versionCode`, flux de publication, vérification des développeurs (DEC-028) (§3.1, §9.1, §13.3, §14). Protection de `main` dès la CI (DEC-029, §13.1). Glossaire d'étapes v1.4 : conventions d'écriture, hypothèses H-5 et H-7, heure ambiguë (§11.6, §11.7). Rattachement des scénarios aux rangs de réalisation et sélection des scénarios exécutables (§11.13). Points ouverts ANT-17 à ANT-21 clos (§17.2). |
| 0.4 | 2026-10-22 | Anthony | DEC-034, ADR-013 (Proposé), DAT v0.11. Pile allégée : PWA seule, une composition `web.ts`, IndexedDB en durabilité stricte (§3.1, §4.2, §10.1). Connexion par redirection `prompt=none` à l'ouverture : exception unique à la règle « aucun jeton dans une URL », encadrée (effacement du fragment avant tout rendu, EC-3 ; `state` à usage unique valable 10 min, EC-4 ; jeton en mémoire seulement) (§9.2). Erreurs de retour de redirection (§8.3), doublure `FauxFournisseurAuth` étendue (§11.10). Persistance du stockage sur tous les appareils (§9.3). Horloge monotone par `performance.now()` partout (§7.3). Hébergement : GitHub Pages retenu (DEC-023, DEC-032 H-1, ADR-013) ; flux `deploiement.yml` (§14.3). DEC-027 et DEC-028 passées en repli, DEC-029 inchangée (§17.4). Nouveau §19 « Repli (ADR-012) » : Capacitor, SQLite, module natif, APK, signature, `publication.yml`, secrets, nom de paquet, `versionCode`, vérification des développeurs. Points ouverts ANT-26 (recette sur GitHub Pages) et ANT-27 (nom de la variable du client OAuth) (§17.2). |
| 0.4.1 | 2026-10-22 | Anthony | DAT v0.11.1 §7.4 bis : ANT-26 et ANT-27 clos. `VITE_ENV` (`dev`, `recette`, `production`) préfixe tous les noms de stockage ; portée du service worker, manifeste (`start_url`, `scope`) et URI de redirection dérivés de `VITE_BASE_PATH` et `VITE_APP_ORIGIN` ; PWA de recette nommée « Done Juan (recette) » ; origine de recette en attente de Q-ANT26 (§9.1, §9.2.1, §9.3, §14.3, §17.2). |

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
19. Repli (ADR-012), si la condition de DEC-034 échoue

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
Le code est organisé en **architecture hexagonale (ports et adaptateurs)**. Les couches du DAT se projettent dans chaque contexte métier (§4.1) ainsi : `domaine`, `application`, `infrastructure`, `presentation/modeles-de-vue`, `presentation/ui`. La couche `synchro` du DAT correspond au contexte `synchronisation`.

| Couche (dossier) | Contenu | Peut dépendre de | Ne doit jamais dépendre de |
|---|---|---|---|
| `domaine` | Entités, objets-valeurs, règles de gestion (RG), services de domaine purs, erreurs métier | Le domaine de son contexte, `commun/domaine`, le domaine public d'un autre contexte (§4.2) ; `date-fns` et `@date-fns/tz` dans `commun/domaine/temps` seulement (§7.2) | Application, infrastructure, présentation, React, Ionic, Zustand, Dexie, Capacitor, Zod, `fetch`, horloge système, aléatoire système, stockage, variables d'environnement |
| `application` | Cas d'usage (un par intention de l'utilisateur ou par traitement de rattrapage), **requêtes de lecture**, ports (interfaces), orchestration, transactions | `domaine`, `commun/application` | Infrastructure, présentation, framework d'IHM, Zod, API Google |
| `infrastructure` | Adaptateurs des ports : Dexie, Drive REST, Calendar REST, Google Identity Services et redirection OAuth (§9.2), horloge et aléatoire système, journal technique ; *repli* (§19) : SQLite, authentification native, notifications locales | `application` (ports), `domaine` (mapping), bibliothèques tierces | Présentation |
| `presentation/modeles-de-vue` | **Modèles de vue** (DAT v0.6 §2.4) : requêtes de présentation pures qui transforment le résultat des requêtes de l'application en structures prêtes à afficher (listes triées et regroupées, libellés et **codes** du catalogue §8.5, compteurs, états vides, activation des actions) ; testables en Vitest et en Cucumber sans React | `application` (requêtes, types de résultat), `domaine` (types), `commun/presentation` (formatage, catalogue) ; ports `Horloge` et `DepotLocal` **en lecture seule, par injection** (DAT §2.4) | React, Ionic, Zustand, DOM, toute écriture, `TransportSynchro`, `PasserelleAgenda`, `FournisseurAuth`, `Notifieur`, `Planificateur` |
| `presentation/ui` | Écrans et composants React et Ionic « bêtes », magasins Zustand, crochets (*hooks*) : ils lient un modèle de vue à l'écran et déclenchent des cas d'usage | `presentation/modeles-de-vue`, `application` (cas d'usage, via la composition) | Infrastructure ; toute règle métier ou mise en forme calculée |
| `composition` | Point d'assemblage : instancie les adaptateurs et les injecte dans les cas d'usage. **Une seule composition de production, `web.ts`**, pour tous les appareils (ADR-013, DS-02 v0.11) ; `test-ihm.ts` pour les scénarios `@ihm` ; *repli* : `capacitor.ts` (§19) | Tout | — |

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
| `DepotLocal` | `synchronisation/application/ports` | Lecture et écriture **transactionnelles** de l'état local : écritures par information (valeur, HLC, contexte causal), pierres tombales, journal métier, index des écritures en attente, métadonnées locales ; espace cloisonné par compte ; abonnement aux changements. Contrat : `ST-socle-ecriture.md` §4.3 | Adaptateur réel `DepotLocalDexie` sur `fake-indexeddb` (pas de doublure en mémoire, §11.10) | DS-07, DS-11, ADR-010 |
| `TransportSynchro` | `synchronisation/application/ports` | Échanges avec le Drive : manifeste, liste des changements, lecture des fichiers des autres appareils, dépôt du fichier de l'appareil | `FauxDrive` | DS-10, DS-11, ADR-003 |
| `PasserelleAgenda` | Contexte agenda, fixé dans la ST du premier lot qui utilise l'agenda | Événements de l'application (séries de rappels, créneaux), lecture incrémentale, intervalles occupés | `FauxAgenda` | DS-18, ADR-006 |
| `FournisseurAuth` | `compte/application/ports` | Connexion et déconnexion Google, identité (`sub`), jeton d'accès valide, portées accordées, détection de la révocation et de la session expirée. Adaptateur web unique (ADR-013), deux stratégies : redirection `prompt=none` à l'ouverture, Google Identity Services ou redirection interactive sur geste (§9.2) | `FauxFournisseurAuth` | DS-04, DS-05, ADR-004, ADR-013, DAT §4.1.7 |
| `CoffreJetons` | `compte/application/ports` | Conservation **en mémoire** du jeton d'accès ; aucun jeton de rafraîchissement (DS-06) | `CoffreJetonsMemoire` (l'adaptateur réel est déjà en mémoire) | DS-06 |
| `Horloge` | `commun/application/ports` | Instant courant de l'appareil ; horloge monotone (DS-11 v0.9, DAT §6.4) ; fuseau de référence ; fuseau de l'appareil pour la seule mention RG-054 (§7.3) | `HorlogeSimulee` | ADR-011 |
| `Notifieur` | `commun/application/ports` | Notifications locales programmées. **Sans adaptateur réel en cible** : les notifications de secours sont abandonnées (Q-PWA-3, DAT v0.11 §5) ; le port n'est créé que par la ST d'un lot qui en a l'usage, ou en repli (§19) | `NotifieurMemoire` | DAT §5 |
| `Planificateur` | `commun/application/ports` | Déclenchements différés et périodiques : temporisation de dépôt de 5 s, synchronisation toutes les 2 min, évaluation du bandeau RG-057 chaque minute, attentes entre tentatives | `PlanificateurSimule` | DAT §4.3, §4.1.5 bis |
| `GenerateurIdentifiants` | `commun/application/ports` | Identifiants UUID v7 (§7.5) | `GenerateurIdentifiantsSequentiel` | DS-08 |
| `SourceAleatoire` | `commun/application/ports` | Tirages aléatoires (graine des fun facts) | `SourceAleatoireDeterministe` | DS-20, ADR-008 |
| `JournalTechnique` | `commun/application/ports` | Journal technique local (§9.4), distinct du **journal métier** `EvenementJournal` | `JournalTechniqueMemoire` | DAT §7.3 |
| `EtatReseau` | `commun/application/ports` | État connecté ou coupé, et événement de retour du réseau | `ReseauSimule` | DAT §4.3 |

- Les ports `CoffreJetons` (défini par Anthony, reconnu par le DAT §2.4), `GenerateurIdentifiants`, `SourceAleatoire`, `JournalTechnique` et `EtatReseau` complètent la liste du DAT. Ils sont transverses et sans effet sur l'architecture ; leur liste et leur placement sont confirmés par Starck (DAT v0.7, ANT-18).
- Les autres contextes n'utilisent **jamais** `DepotLocal` directement (DAT §2.4, ANT-18) : ils lisent et écrivent par le **service applicatif `ServiceEtatLocal`** du contexte `synchronisation`, exposé par son `index.ts` (§10.1, `ST-socle-ecriture.md` §4.2).
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

### 3.1 Pile (DAT v0.11 §3.2, DS-01, DS-14, DS-16, ADR-013)
Cible : **une seule PWA** pour le PC, Chrome Android (application installée) et, pour EPI-001, Safari sur iPhone. Les outils de la coque Android (Capacitor, SQLite, JDK, Gradle, Build-Tools) sont au §19.1.

| Domaine | Outil | Règle de version |
|---|---|---|
| Exécution de l'outillage | **Node.js 24 LTS** | `.nvmrc` = `24` ; `package.json` : `"engines": { "node": ">=24 <25" }` ; `engine-strict=true` dans `.npmrc` |
| Gestionnaire de paquets | **pnpm** | Dernière version stable au démarrage d'E12 de LOT-001, figée dans le champ `packageManager` de `package.json` (`pnpm@x.y.z`) ; `pnpm install --frozen-lockfile` en CI |
| Langage | **TypeScript 5.x** | Dernière version 5.x stable au démarrage d'E12, figée **exactement** ; un passage en 6.x ou plus passe par Starck |
| Interface | React, Ionic React | Version exacte |
| Construction et PWA | Vite, vite-plugin-pwa (Workbox) : précache, `navigateFallback` (sert aussi le retour de redirection OAuth hors ligne, DAT §4.1.7), invite « nouvelle version » | Version exacte |
| Base locale (tous appareils) | Dexie, transactions d'écriture en durabilité stricte (§10.1) | Version exacte ; la version retenue doit exposer l'option `chromeTransactionDurability` |
| Connexion Google | Google Identity Services, chargé à la demande depuis `accounts.google.com` (aucun paquet npm) ; redirection OAuth `prompt=none` sans bibliothèque (§9.2) | Sans objet |
| État de l'interface | Zustand | Version exacte |
| Dates et fuseaux | **date-fns 4.x** et **@date-fns/tz** | Version exacte ; la version 4 est requise pour l'option `in` (§7.2) |
| Validation des fichiers Drive | Zod | Version exacte |
| Identifiants | `uuid` (fonction `v7`) | Version exacte ; dépendance ajoutée par les présentes conventions pour DS-08, justification au §7.5 |
| Tests | Vitest et `@vitest/coverage-v8`, `@testing-library/react`, `fake-indexeddb`, fast-check, `@cucumber/cucumber`, `tsx`, MSW, Playwright, `@axe-core/playwright`, Stryker | Version exacte |
| Qualité | ESLint (configuration *flat*), typescript-eslint, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `@vitest/eslint-plugin`, Prettier, dependency-cruiser, Semgrep, gitleaks, osv-scanner, license-checker, Husky, lint-staged | Version exacte (outils npm) ; version épinglée dans le workflow (outils hors npm) |

### 3.2 Règles de version
- **Versions exactes** : `save-exact=true` dans `.npmrc` ; aucune plage `^` ou `~` dans `package.json`. Le fichier `pnpm-lock.yaml` est versionné.
- Mises à jour par **Dependabot** (paquets npm et actions GitHub), regroupées chaque semaine. Une mise à jour majeure est une demande de revue à part, examinée par Anthony ; une mise à jour majeure de Node, TypeScript, React, Dexie, vite-plugin-pwa ou d'une bibliothèque de stockage passe aussi par Starck.
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
  .gitignore                  premier fichier versionné du socle, avant toute clé de signature (§9.1)
  .github/                    workflows GitHub Actions, dependabot.yml, modèle de pull request
  index.html                  balise meta Referrer-Policy no-referrer et CSP (§9.2, §9.3)
  public/                     ressources statiques (manifeste de la PWA, icônes ; fun-facts.fr.json, lot DEM-002)
  scripts/                    scripts d'outillage (contrôle du catalogue, des tags, des rangs ; sélection des scénarios exécutables, §11.13)
  cucumber.mjs                profils cucumber-js (§11.8, §11.13)
  src/
    commun/
      domaine/                type Resultat, objets-valeurs, temps/ (seul usage de date-fns, §7.2)
      application/ports/      Horloge, Planificateur, GenerateurIdentifiants, SourceAleatoire, JournalTechnique, EtatReseau (Notifieur : §2.3)
      infrastructure/         HorlogeSysteme, PlanificateurNavigateur, GenerateurUuidV7, SourceAleatoireCrypto, JournalTechniqueLocal, EtatReseauNavigateur
      presentation/           format/ (durées, dates, ancienneté), messages/ (catalogue, §8.5), ui/ (composants partagés)
    <contexte>/
      domaine/                entités, objets-valeurs, règles, erreurs métier
      application/            cas-usage/, requetes/, ports/
      infrastructure/         adaptateurs des ports du contexte
      presentation/
        modeles-de-vue/       requêtes de présentation pures, sans React (§2.2, §4.3)
        ui/
          ecrans/             écrans ECR-xxx
          composants/         composants React et Ionic
          etat/               magasins Zustand
      index.ts                interface publique du contexte (seul point d'import depuis un autre contexte)
    infrastructure-google/    client HTTP Google partagé : fetch, traduction des erreurs, attente exponentielle, lecture de l'en-tête Date
    composition/              web.ts (seule composition de production), test-ihm.ts (assemblage avec doublures pour @ihm)
    main.tsx                  point d'entrée ; sa première instruction consomme le retour de redirection OAuth (§9.2)
  tests/
    features/                 fichiers .feature (Pepper)
    steps/                    step definitions au niveau application (§11.7)
    steps-ihm/                step definitions des scénarios @ihm (Playwright)
    support/                  monde, hooks, types de paramètres, banc/ (§11.11), fabriques/, rendu-historique.ts, rangs-scenarios.json (§11.13)
    doublures/                doublures des ports (§11.10)
    contrats/                 suites de contrat des ports
    unitaires/                tests unitaires, en miroir de src/ (non colocalisés, DS-15)
    integration/              adaptateurs réels : Dexie sur fake-indexeddb, REST Google avec MSW
    e2e/                      parcours Playwright hors Cucumber (accessibilité axe, démarrage PWA)
    fixtures/                 données de test versionnées : drive/v<n>/, reponses-google/ (anonymisées)
```

Règles :
- Un contexte n'importe un autre contexte **que par son `index.ts`**. Aucun autre fichier « baril » (`index.ts` de réexport) n'est admis.
- `commun` ne contient que des éléments utilisés par au moins deux contextes. Il ne doit pas devenir un fourre-tout.
- Les tests unitaires reproduisent le chemin de `src/` : `src/objectifs-taches/domaine/tache.ts` → `tests/unitaires/objectifs-taches/domaine/tache.test.ts`.
- Aucun dossier `android/` ni `ios/` en cible (DS-15 v0.11). En repli, `android/` est créé selon le §19.2.

### 4.3 Requêtes et modèles de vue
- Une **requête** (`application/requetes/`) lit l'état local et renvoie des données métier typées, sans formatage. Exemple : `listerTachesAFaire(depot, jour)`.
- Un **modèle de vue** (`presentation/modeles-de-vue/`) est une fonction `construire<Nom>(donnees, dependances) → ModeleVue<Nom>`, où `donnees` sont des résultats de requêtes et `dependances` contient au plus `horloge: Horloge` (aujourd'hui, journée de Paris, bandeau RG-057) et des requêtes en lecture (DAT §2.4). Il ne modifie rien. Sa sortie contient des valeurs prêtes à afficher, avec pour chaque état, mention ou message son **code** et son **libellé** issus du catalogue (§8.5) ; jamais de JSX.
- Les composants de `presentation/ui` ne calculent rien : ils affichent les libellés du modèle de vue et exposent son code dans `data-etat` ou `data-message` (§8.5).
- Les scénarios Cucumber non tagués `@ihm` vérifient l'état observable de l'interface (indicateur de synchronisation, bandeaux, mentions, « non synchronisé ») **par les modèles de vue**, en comparant les codes du catalogue.

## 5. Règles de nommage

### 5.1 Langue
- **Langage du domaine en français**, aligné sur le glossaire du cahier des charges (§6) et sur les fichiers `.feature`. Un terme métier a un seul nom, du `.feature` jusqu'au code.
- Identifiants **sans accents ni caractères spéciaux** (`Tache`, `resteAFaire`, `delai`).
- Termes d'une API tierce : conservés tels quels, **dans l'infrastructure uniquement** (`etag`, `syncToken`, `pageToken`, `extendedProperties`).
- Noms imposés par un framework : conservés (`useEffect`, `render`).
- Messages destinés à l'utilisateur : issus du catalogue (§8.5), jamais écrits en dur.

### 5.2 Glossaire code (CdC v0.11 §6, DAT v0.10.1 §6.1)
| Terme métier | Identifiant de code | Remarque |
|---|---|---|
| Objectif, sous-objectif | `Objectif` (`parentId?: IdObjectif`) | RG-022 ; un seul niveau ; `parentId` est le parent **effectif** (un parent supprimé est ignoré, RG-046) |
| Tâche, sous-tâche, tâche parente | `Tache` (`tacheParenteId?: IdTache`) | RG-023 ; un seul niveau ; estimation de la parente dérivée ; la tâche parente est fixée à la création |
| Intitulé | `Intitule` (type marqué), `construireIntitule` | Espaces de début et de fin retirés, vide refusé (`ERR-020`), aucune longueur maximale (Q-US-001-3) |
| État d'une tâche | `EtatTache` = `'A_FAIRE' \| 'TERMINEE' \| 'ABANDONNEE'` ; registre `CycleDeVie` | RG-026, RG-027 ; registre unique : état, `dateFin` et `instantFin`, `dateAbandon` et `instantAbandon`, `evenementAbandon`, `abandonParCascade` (DAT §4.2) |
| État d'un objectif | `EtatObjectif` = `'EN_COURS' \| 'ATTEINT' \| 'A_DECLINER'` | RG-025 ; dérivé, jamais stocké |
| Actions proposées | `ActionTache`, `ActionObjectif` | Liste fermée du glossaire d'étapes v1.4 §7 : terminer, rouvrir, abandonner, reprendre, créer une sous-tâche, créer un sous-objectif |
| Confirmation demandée | `ConfirmationRequise` (union discriminée) | Codes `CNF-…` du catalogue ; commandes avec confirmation (§8.6) |
| Information (au sens de RG-036) | `CleInformation` = (type d'élément, identifiant, champ) | DAT §4.2 ; granularité de la fusion |
| Écriture d'une information | `Ecriture<V>` = valeur, `Hlc`, `ContexteCausal` | DAT §4.2.1, §6.1 ; manipulée **uniquement** dans le contexte `synchronisation` |
| Contexte causal | `ContexteCausal` | DAT §4.2.1 : par appareil, HLC de la plus récente écriture connue de l'auteur |
| Modification demandée par un cas d'usage | `Modification` | Langage d'écriture du contexte métier vers `ServiceEtatLocal` (`ST-socle-ecriture.md` §4.1) |
| État lu par les contextes métier | `EtatMetier` | Projection de l'état local, sans HLC ni contexte (`ST-socle-ecriture.md` §4.1) |
| Index des écritures en attente | `IndexEnAttente`, `EntreeEnAttente` | DAT §4.1.5 bis ; local, non synchronisé ; le marqueur `creationNonDeposee` du DAT est porté par l'entrée de champ `creation` |
| Délai (échéance) | `delai: DateCalendaire` | RG-002, RG-003, RG-045 |
| En retard | `estEnRetard(element, jour)` | RG-045 ; fonction dérivée, jamais stockée |
| Objectif atteint | `estAtteint(objectif, …)` | RG-025 ; dérivé |
| Estimation initiale | `estimationInitiale: Duree` | RG-028, RG-029 ; construite par `Duree.saisie` (minimum 30 min) |
| Estimation calculée | `estimationCalculee: Duree` | RG-023, RG-028 ; construite par `Duree.calculee`, peut valoir 0 h, jamais stockée (DAT v0.6 §6.2) |
| Horloge déréglée | `estHorlogeDereglee(ecart)` | RG-036, US-017 CA-13 ; écart strictement supérieur à 24 h |
| Code de motif | `MotifRefus` (union de codes) | Codes `ERR-001` à `ERR-006` (connexion) et `ERR-020` à `ERR-035` (saisie) du catalogue (glossaire d'étapes v1.4 §9) ; les anciens codes `CNX-…` sont abandonnés |
| Refus métier | `RefusMetier` (union discriminée) | Erreurs typées du domaine `objectifs-taches` ; le code `ERR-…` est attribué par le modèle de vue `messagesDeRefus` |
| Reste à faire | `resteAFaire` (dérivé), `resteAFaireCorrige?: Duree` | RG-009 |
| Temps passé | `SaisieTemps` (`tacheId`, `jour: DateCalendaire`, `duree: Duree`) | RG-008 |
| Lien tâche-objectif | `LienTacheObjectif` | RG-001 ; relation n-n |
| Suppression | `PierreTombale` | RG-046 ; jamais d'effacement physique en v1 |
| Journée | `jour: DateCalendaire` | RG-008, RG-053 ; calculée dans `FUSEAU_REFERENCE` |
| Fuseau de référence | `FUSEAU_REFERENCE` | RG-053, DEC-012 |
| Historique | `EvenementJournal`, type `TypeEvenementJournal` = `'CREATION' \| 'MODIFICATION_DELAI' \| 'MODIFICATION_ESTIMATION' \| 'RATTACHEMENT' \| 'DETACHEMENT' \| 'CHANGEMENT_PARENT' \| 'FIN' \| 'REOUVERTURE' \| 'ABANDON' \| 'REPRISE' \| 'SUPPRESSION'` | RG-050, DS-19, DAT §6.1 v0.9 ; valeurs `avant` et `apres` structurées, jamais rendues ; journal **métier**, à ne pas confondre avec `JournalTechnique` |
| Appareil | `Appareil`, `appareilId: IdAppareil`, `NomAppareil` = `'smartphone' \| 'pc'` (tests) | RG-017 |
| Compte Google | `IdCompte` (claim `sub`), `EspaceLocal` (espace de stockage par compte) | RG-018, DEC-016 |
| Déconnexion | `SeDeconnecter` (cas d'usage) | RG-043 |
| Suppression des données de l'appareil | `SupprimerDonneesAppareil` (cas d'usage) | RG-055, DEC-015 |
| Horodatage de fusion | `Hlc` | ADR-011 |
| Valeur écartée | `ValeurEcartee` | RG-036, DAT §4.2.1 : écartée si et seulement si l'écriture gagnante a été faite sans connaissance d'elle ; à l'écran : « modification non retenue » |
| Modifications non retenues | `ModificationNonRetenue`, `marquerCommeLue` | RG-056 ; le point « à lire » (`data-a-lire`) est indépendant de l'état de l'indicateur ; `ALR-008` et `ALR-014` n'y sont pas comptées (H-6) |
| Incohérence après fusion | `Incoherence` | RG-049 ; dérivée |
| Fusion | `fusionner(etatA, etatB)` | RG-036, RG-047 à RG-049 |
| Format des données | `schemaVersion`, constante `SCHEMA_VERSION` | RG-058 |
| Consultation seule | `ModeSaisie` = `'NORMAL' \| 'CONSULTATION_SEULE'` | RG-058 |
| Génération des données | `generation` | RG-044 b |
| Modification en attente | `ModificationEnAttente`, marqueur `deposeJusquA: Hlc`, `decompterModificationsEnAttente(index)` | DS-11, DAT §4.1.5 bis v0.10.1 ; décompte = nombre d'**éléments distincts** (objectif, tâche, sous-tâche) qui ont une entrée dans l'index ; un élément créé puis supprimé avant le dépôt de sa création ne compte pas, ni ses descendants supprimés par dérivation (Q-US-018-1, H-4) |
| Plus ancienne modification en attente | `plusAncienneModificationEnAttente?: Instant` | RG-057, DEC-025 ; minimum de `premiereEcriture` sur tout l'index ; donnée locale non synchronisée ; les 24 h courent depuis cet instant |
| Bandeau de rappel 24 h | `doitAfficherBandeauRappel24h(…)` | RG-057, DEC-025, DEC-026 ; affiché quand la plus ancienne modification en attente date de plus de 24 h, en ligne ou hors ligne ; fermable ; réapparaît à la prochaine ouverture (lancement de l'application ou rechargement de la PWA, non un simple retour au premier plan) ; calculé dans un modèle de vue ; code `BAN-RAPPEL-24H` (« Modifications en attente depuis plus de 24 h ») |
| Bandeau d'accès Google perdu | `doitAfficherBandeauAccesGoogle(…)` | RG-057, DEC-025, DEC-026 ; affiché quand l'accès Google est perdu, à la place de `BAN-RAPPEL-24H` ; variante 24 h avec la mention « n modifications ne sont encore que sur cet appareil » si la plus ancienne modification en attente date de plus de 24 h ; non fermable ; calculé dans un modèle de vue ; code `BAN-ACCES-GOOGLE` |
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
  export type Duree = Marque<number, 'Duree'>;            // minutes entières, multiple de 30
  export const Duree = {                                   // objet compagnon (pas de namespace)
    saisie: (minutes: number): Resultat<Duree, DureeSaisieInvalide> => …,
    calculee: (minutes: number): Resultat<Duree, DureeCalculeeInvalide> => …,
  } as const;
  ```
  La conversion `as Duree` n'apparaît que dans les constructeurs du type.
- **Exhaustivité** : tout `switch` sur une union est exhaustif (`@typescript-eslint/switch-exhaustiveness-check`) et se termine par `assertNever(x)` (`commun/domaine/assert-never.ts`).
- **`unknown` aux frontières** : toute donnée externe (fichier Drive, réponse Google, stockage local relu) entre en `unknown` et n'en sort que par une validation Zod (infrastructure).
- **Interdits** : `any` (explicite ou implicite), assertion non nulle `!`, `as` hors constructeurs de types marqués et tests, `Function`, `Object`, `{}` comme type, `namespace`, paramètres par défaut qui masquent une dépendance (horloge, fuseau).
- **Asynchronisme** : `async`/`await` ; les opérations faillibles renvoient `Promise<Resultat<T, E>>`. Annulation des appels réseau par `AbortSignal`. Aucune promesse flottante (`no-floating-promises`, `no-misused-promises`).
- **React** : composants fonctionnels ; règles des crochets ; aucun `dangerouslySetInnerHTML` ; styles par les jetons du guide d'ergonomie (§3, variables CSS), aucune couleur ni espacement en dur.
- **Zustand** : un magasin par contexte au plus, dans `presentation/ui/etat/`, qui ne contient que des modèles de vue et l'état local d'écran ; aucune règle métier.

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
| `Duree` | Durée **métier** en minutes entières, **multiple de 30** (DAT v0.6 §2.4, RG-028) | `Marque<number, 'Duree'>` | Entier de minutes | Estimation, reste à faire, capacité |
| `EcartTemps` | Durée **technique** signée, en millisecondes | `Marque<number, 'EcartTemps'>` | Entier de millisecondes | Temporisation de 5 s, période de 2 min, seuil de 24 h, dérive d'horloge (ADR-011) |

Règles impératives :
- **`FUSEAU_REFERENCE`** = `'Europe/Paris'`, constante unique définie dans `src/commun/domaine/temps/fuseau-reference.ts` (ADR-011 §2). Ce n'est ni un paramètre utilisateur ni une donnée synchronisée.
- Le **jour d'une action** est calculé par `jourDeReference(instant: Instant): DateCalendaire`, dans `FUSEAU_REFERENCE`, **puis persisté** avec l'instant. Il n'est jamais recalculé à partir de l'instant lors d'une lecture.
- Les **dates civiles choisies par l'utilisateur** (délai, jour de saisie, date d'exception) restent des `DateCalendaire` et ne sont **jamais** converties en `Instant` (P-T1).
- Le **fuseau système de l'appareil n'intervient dans aucun calcul métier**. Il n'est lu que pour la mention « heure de Paris » (RG-054), via `Horloge.fuseauAppareil()`, dans un modèle de vue.
- Aucune durée en nombre à virgule. `Duree` a deux constructeurs (DAT v0.6, PEP-9), exposés par un objet compagnon de même nom que le type : `Duree.saisie(minutes)` pour toute valeur entrée par l'utilisateur, qui refuse 0, une valeur négative ou non multiple de 30 et applique le minimum de 30 min (`Echec` typé) ; `Duree.calculee(minutes)` pour les totaux dérivés, qui **accepte 0** (estimation d'une parente dont toutes les sous-tâches sont abandonnées, reste à faire épuisé). La précision du temps passé reste fixée par Q-DEM001-31 (lots ultérieurs).
- Un délai ou un écart **technique** (temporisation, période, seuil, dérive d'horloge) est un `EcartTemps`, jamais une `Duree`.
- Une journée de Paris ne dure pas toujours 24 h (23 h ou 25 h aux changements d'heure) : « le lendemain » se calcule sur la `DateCalendaire`, jamais en ajoutant 24 h à un instant.
- **Conversion d'une heure murale de Paris en instant** (`instantDeReference(jour, heure)`), règle par défaut dite « compatible » (celle de Temporal et de RFC 5545) : une heure **ambiguë** (de 2 h à 2 h 59 le dernier dimanche d'octobre) prend la **première** occurrence (heure d'été) ; une heure **inexistante** (de 2 h à 2 h 59 le dernier dimanche de mars) est **décalée de la durée du saut** (2 h 30 devient 3 h 30 heure d'été). Une ST-US peut imposer une autre règle si une RG l'exige (PT-16 (3)).
- **Banc de test** (glossaire d'étapes v1.4 §4, Q-US-001-4) : l'étape « nous sommes le … à HH:MM heure de <fuseau> » applique la même règle pour une heure **ambiguë** (première occurrence), mais **échoue** pour une heure **inexistante** : un scénario ne doit pas l'écrire. La conversion du banc est faite dans `tests/support/temps.ts`, pour tout fuseau admis par le glossaire.
- **« Maintenant » métier et HLC** : l'instant et le jour d'une action métier (date de fin, d'abandon, création, journée d'une entrée d'historique) sont calculés à partir de `Horloge.maintenant()`, heure de l'appareil **non corrigée**. Seuls l'HLC et l'instant `premiereEcriture` de l'index des écritures en attente utilisent l'heure physique **corrigée** de l'écart mesuré avec Google (DAT §4.1.5 bis, §6.4 ; `ST-socle-ecriture.md` §6.1).
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
  monotone(): EcartTemps;                // horloge monotone : temps écoulé depuis une origine arbitraire, insensible aux changements d'heure (DS-11 v0.9, DAT §6.4)
  readonly fuseauReference: Fuseau;      // toujours FUSEAU_REFERENCE (DAT §6.4)
  fuseauAppareil(): Fuseau;              // usage exclusif : mention « heure de Paris » (RG-054)
}
```
- Adaptateur : `HorlogeSysteme`, seul fichier autorisé à lire l'heure, l'horloge monotone (`performance.now()`) et le fuseau système. **Même adaptateur sur tous les appareils** (ADR-013, DAT v0.11 §6.4) : ancrage monotone par `performance.now()` et détection des sauts d'horloge ; la limite résiduelle acceptée par DEC-030 (heure changée application fermée) vaut aussi pour le téléphone. *Repli* : extension native `SystemClock.elapsedRealtime` (§19.4).
- Doublure : `HorlogeSimulee` (`tests/doublures/`), construite sur le `TempsSimule` du banc (§11.11), seule source de temps des tests (DAT v0.6 §3.3) : `positionner(instant)`, `avancer(ecart: EcartTemps)` (fait avancer l'horloge murale et l'horloge monotone), `dereglerDe(ecart: EcartTemps)` (avance ou retard propre à l'appareil, sans effet sur la monotone), `changerHeureMurale(ecart)` (saut de l'horloge murale seule, DAT §6.4 point 3), `redemarrer()` (nouvelle origine de la monotone), `reglerFuseauAppareil(fuseau)`.
- `fuseauAppareil()` est accepté par Starck (DAT v0.7, ANT-17) ; `monotone()` est demandé par le DAT (DS-11 v0.9). Seuls l'incrément 4 d'US-017 et US-018 l'utilisent au lot 1.

### 7.4 Hasard
- Tout tirage passe par `SourceAleatoire` (`entierEntre(min, max)`, `octets(n)`). Adaptateur : `SourceAleatoireCrypto` (`crypto.getRandomValues`). Doublure : `SourceAleatoireDeterministe` (graine ou séquence imposée).
- `Math.random` et `crypto.randomUUID` sont interdits dans `src/` (DS-16).
- La permutation des fun facts (ADR-008) est implémentée dans le domaine avec un générateur pseudo-aléatoire initialisé par la graine : elle est donc déterministe.

### 7.5 Identifiants (DS-08)
- Les identifiants d'entités sont des **UUID v7** (RFC 9562), produits par le port `GenerateurIdentifiants` ; adaptateur `GenerateurUuidV7`, fondé sur la fonction `v7` du paquet `uuid` (bibliothèque de référence, sans dépendance, licence MIT ; elle évite une implémentation maison de la RFC).
- Chaque identifiant a son type marqué (`IdObjectif`, `IdTache`, `IdAppareil`…) ; un `IdTache` ne peut pas être passé là où un `IdObjectif` est attendu.
- Le tri par identifiant n'est **jamais** une règle métier : l'ordre de création est un champ explicite. L'horodatage intégré à l'UUID v7 n'est pas lu par le code.
- Exceptions à clé naturelle ou déterministe (DS-08) : `SaisieTemps` (tacheId, jour), `LienTacheObjectif` (tacheId, objectifId), `ExceptionCapacite` et `BilanSoir` (date), événements Google, `AlerteCreneau`, signalements de réparation (RG-048), `EvenementJournal` (`<UUID v7 de l'opération>:<rang>`, identifiant opaque ; DAT v0.10.2 §6.1).
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
- Un adaptateur **capture** les exceptions de ses bibliothèques (fetch, Dexie, GIS ; *repli* : SQLite) et les traduit en `Echec<ErreurPort>`. Aucune exception de bibliothèque ne sort d'un adaptateur.

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
| `SessionARenouveler` | `FournisseurAuth` | Sur **tous les appareils** (DAT v0.11 §4.1.6 bis) : jeton d'accès expiré en cours de session, renouvellement soumis à un geste (DAT §4.1.2, F14) ; retour de redirection `prompt=none` en erreur d'interaction (`interaction_required`, `login_required`, `consent_required`, `account_selection_required`) | Indicateur « Reprendre la synchronisation » (`SYN-SESSION`), sans bandeau (guide §6.4). Aucune nouvelle redirection automatique dans la même ouverture. |
| `ConfigurationOAuthInvalide` | `FournisseurAuth` | Retour de redirection `redirect_uri_mismatch`, `invalid_request`, `invalid_client`, `origin_mismatch` (DAT v0.11 §4.1.6 bis) | Affiché comme `SessionARenouveler` (`SYN-SESSION`) ; journalisé en `erreur` avec le seul code Google ; constitue une anomalie. |
| `RetourRedirectionRejete` | `FournisseurAuth` | Retour de Google dont le `state` est absent, inconnu, déjà consommé ou expiré (§9.2) | Le jeton éventuel est **ignoré** et jamais placé dans `CoffreJetons` ; journalisé en `avertissement` sans le fragment ; l'application s'ouvre comme sans jeton (`SYN-SESSION`). |
| `AccesGoogleRevoque` | `FournisseurAuth`, ports distants | `401` après un renouvellement, `invalid_grant`, révocation ; `access_denied` **après un geste** ; portées du lot 1 accordées partiellement au retour (ADR-013 ; une portée propre à une fonction d'un lot ultérieur relève de `PorteeInsuffisante`) | État « accès Google perdu », utilisation comme hors ligne (RG-035, PT-12). |
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
Source de vérité : **guide d'ergonomie v0.2.9, §6.6** (Steeve, ANT-7), qui fait foi pour les libellés exacts. Les motifs de connexion sont les codes `ERR-001` à `ERR-006` du catalogue (glossaire d'étapes v1.4 §9) ; les codes `CNX-…` des versions précédentes ne sont plus utilisés.

- **Familles de codes** (guide §6.6.1) : `SYN-` état de l'indicateur, `BAN-` bandeau, `MEN-` mention, `ETA-` état d'un objet, `EVD-` état vide, `TST-` message éphémère, `CNF-` boîte de confirmation, `ERR-` erreur, `ALR-` alerte ou information, `SEC-` titre de section d'une liste (guide v0.2.9 §6.6.4, §5.8). Un code n'est jamais renuméroté ni réutilisé.
- **Attributs d'observabilité** (proposition de Steeve, **confirmée** par Anthony, noms définitifs) : tout élément qui porte un état expose son code dans `data-etat="CODE"` ; un message d'erreur ou d'alerte ajoute `data-message="ERR-xxx"` ou `data-message="ALR-xxx"` ; une variante de code (`ERR-030`, `BAN-ACCES-GOOGLE`, `BAN-RAPPEL-24H`, `ALR-010`) ajoute `data-variante="<variante>"` ; l'indicateur de synchronisation porte en outre `data-a-lire="{n}"`, absent si n = 0 (guide §6.6.2). Ces attributs sont posés par les composants à partir du modèle de vue ; ils servent aux tests Playwright et ne sont jamais affichés.
- **Ordre de gravité de l'indicateur** (guide §6.6.2) : `SYN-ACTION` > `SYN-SESSION` > `SYN-RETENTATIVE` > `SYN-HORS-LIGNE` > `SYN-EN-COURS` > `SYN-ATTENTE` > `SYN-INFO` > `SYN-OK`, confirmé ; `SYN-INFO` est dérivé de `SYN-OK` et de `data-a-lire`.
- **Dans le code** : `src/commun/presentation/messages/catalogue.fr.ts` exporte un objet `CATALOGUE` typé `as const satisfies Record<CodeCatalogue, GabaritLibelle>` ; `CodeCatalogue` est l'union des codes. Les variables du guide (`{n}`, `{appareil}`, `{élément}`, `{date}`, `{heure}`, ancienneté) sont interpolées par `libelle(code, variables)`, avec les règles de pluriel (0 et 1 au singulier, `Intl.PluralRules('fr')`) et de typographie (espaces insécables, guillemets « ») du guide §6.6.1. Les formats de date, d'heure et d'ancienneté sont dans `commun/presentation/format/`.
- **Responsabilités** : le domaine et l'application renvoient des erreurs typées, sans code de catalogue ; la correspondance erreur ou état → code est faite **dans le modèle de vue**, qui fournit code et libellé ; les composants affichent le libellé et posent l'attribut. Un code de motif de connexion (`ERR-001` à `ERR-006`) est porté par l'erreur de connexion du contexte `compte` (`MotifRefus`), car il fait partie du contrat métier d'US-022.
- **Priorités d'affichage** : l'ordre de gravité de l'indicateur (`SYN-ACTION` > … > `SYN-OK`) et l'ordre des bandeaux (`BAN-ACCES-GOOGLE` > `BAN-CONSULTATION-SEULE` > `BAN-RAPPEL-24H`) du guide §6.6.2 et §6.6.3 sont implémentés par **une seule** fonction de sélection par élément, dans le modèle de vue, testée cas par cas.
- **Entrées sous réserve** : les entrées marquées « sous réserve Q-ERG-xx » au guide ne sont implémentées qu'après la réponse du commanditaire ; leurs tests sont écrits en E10 sur la réponse retenue.
- **Tests** : ils vérifient le **code** ; ils vérifient le libellé seulement lorsque le `.feature` cite le texte, et alors via `libelle()`.
- **Contrôle de CI** `scripts/verifier-catalogue.ts` : chaque code des tableaux du guide §6.6 existe dans `catalogue.fr.ts` avec le même gabarit de texte, et réciproquement ; chaque code cité dans un `.feature` existe au catalogue (§14.1).
- **Refus** : un modèle de vue `messagesDeRefus(refus)` (contexte `objectifs-taches`) transforme un `RefusMetier` en une liste ordonnée de `{ code, variante?, variables }`. Les codes de saisie cumulables (`ERR-020` à `ERR-023`) suivent l'ordre intitulé, délai, estimation (guide §6.6.8). Un refus sans code (élément introuvable, action non disponible) produit une liste vide : l'interface ne propose jamais l'action correspondante.

### 8.6 Commandes avec confirmation (`CNF-…`)
Une action destructrice ou qui touche plusieurs éléments est confirmée avant d'être faite (guide §4.12, §6.6.7). Le cas d'usage expose **deux opérations**, sans paramètre booléen (RCD-02) :
- `evaluer(commande): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>>`, où `Evaluation = { type: 'SANS_CONFIRMATION' } | { type: 'CONFIRMATION_REQUISE'; confirmation: ConfirmationRequise }`. Elle n'écrit rien. Elle renvoie aussi les refus (`Echec`), dans le même ordre que `executer`.
- `executer(commande): Promise<Resultat<…, RefusMetier | ErreurDepotLocal>>` : fait l'action, conséquences comprises, en une transaction. Elle ne redemande pas la confirmation : c'est l'interface qui appelle `evaluer`, affiche la boîte `CNF-…`, puis appelle `executer` si l'utilisateur confirme.
- Dans les *step definitions*, « … et confirme » enchaîne `evaluer` puis `executer` ; « demande … » ou une action qui exige une confirmation appelle `evaluer` et mémorise la commande en attente dans le monde, pour l'appareil concerné ; « l'utilisateur confirme » appelle `executer` sur la commande en attente ; « … et renonce » ou « l'utilisateur renonce » l'oublie, sans écriture (`ST-socle-ecriture.md` §12).

## 9. Sécurité, jetons OAuth, données personnelles et journalisation

Référentiels : OWASP ASVS (PWA, tous appareils) ; OWASP MASVS en repli seulement (§19) ; recommandations Google sur OAuth 2.0 pour les applications web côté client (flux implicite, DAT v0.11 §4.1.7) ; « Google API Services User Data Policy » (*Limited Use*) ; RGPD.

### 9.1 Secrets et configuration
- Aucun secret dans le dépôt. L'application n'a **aucun secret client** : tous ses clients OAuth sont publics (DS-04).
- L'identifiant du client OAuth Web (public) et l'adresse de la PWA sont injectés à la construction par les variables du dépôt (DAT v0.11 §7.5) : `VITE_GOOGLE_WEB_CLIENT_ID`, `VITE_BASE_PATH` (`/taskapp/` en production), `VITE_APP_ORIGIN` (`https://mathieublandin-create.github.io`). L'URI de redirection est `VITE_APP_ORIGIN` suivi de `VITE_BASE_PATH`, barre oblique finale comprise, construite en **un seul point** (`compte/infrastructure/auth/`) et déclarée à l'identique dans le client OAuth Web. Le nom `VITE_GOOGLE_WEB_CLIENT_ID` est celui de DS-04 depuis le DAT v0.11.1 (ANT-27, clos).
- **Indépendance vis-à-vis de l'adresse** (DAT v0.11.1 §7.4 bis) : le code ne suppose ni l'origine ni le chemin. La **portée du service worker**, le **`start_url` et la `scope` du manifeste** et l'**URI de redirection** sont **dérivés** de `VITE_BASE_PATH` et `VITE_APP_ORIGIN`, en un seul point de configuration de la construction (`vite.config.ts`) et, pour l'URI de redirection, dans `compte/infrastructure/auth/` ; aucune adresse ni aucun chemin écrit en dur dans `src/`.
- **Nom de l'environnement** : `VITE_ENV` = `dev`, `recette` ou `production`, injecté à la construction, validé au démarrage (valeur hors liste : erreur de programmation). Il **préfixe tous les noms de stockage** de l'application : bases IndexedDB (§9.3), clé de `sessionStorage` (RED-04), caches applicatifs éventuels ; les caches Workbox sont déjà distincts par portée. Le nom et l'icône de la PWA de recette sont distincts (« Done Juan (recette) »). Un fichier `.env.example` documente les clés, sans valeur réelle ; les fichiers `.env*` réels ne sont pas versionnés.
- Toute variable préfixée `VITE_` est **publique** (incluse dans le paquet livré) : aucune valeur sensible ne doit en porter le préfixe.
- **`.gitignore` avant toute clé** (ADR-012, point bloquant du suivi, BEN-13) : **fait** le 2026-10-22 (commit `60b5826`, « Ajout du .gitignore … avant tout code du PoC »), avant toute clé, y compris celle de la preuve de concept (P9). Le socle (rang 0) le **complète**, sans rien retirer, pour qu'il contienne au moins les motifs suivants (les lignes déjà présentes sont conservées) :
  ```
  # Clés et secrets de signature (ADR-012, DEC-027)
  *.jks
  *.keystore
  *.p12
  *.pem
  keystore.properties
  secrets/
  android/keystore/
  # Configuration locale
  local.properties
  .env
  .env.*
  !.env.example
  # Artefacts
  node_modules/
  dist/
  build/
  coverage/
  reports/
  *.apk
  *.aab
  android/.gradle/
  android/app/build/
  android/app/release/
  ```
  Un test de CI (`pnpm verifier:depot`, `scripts/verifier-depot.ts`) échoue si un fichier versionné correspond à l'un de ces motifs, ou si l'une de ces lignes manque au `.gitignore`. Le fichier d'exemple des variables s'appelle `.env.example` (nom déjà retenu par le PoC et le `.gitignore`), sans valeur. Les motifs propres à Android sont **conservés** en cible : ils ne coûtent rien et protègent le dépôt public si le repli est activé (§19).
- **Aucune clé de signature en cible** : la PWA n'en a pas besoin (ADR-013). La clé de signature Android, ses secrets, le nom de paquet et la vérification des développeurs relèvent du **repli** (§19.3, DEC-027, DEC-028). La création de clés est différée (DEC-034, Q-PWA-5) : aucune clé n'est créée tant que la PWA unique n'est pas infirmée, et jamais par un agent sans l'accord explicite du commanditaire, relayé par Jarvis.
- gitleaks s'exécute sur chaque commit poussé et dans les hooks locaux ; un secret détecté bloque la fusion et doit être **révoqué**, pas seulement retiré de l'historique.

### 9.2 Jetons OAuth (DS-04, DS-06, ADR-004, ADR-013)
| Règle | Force |
|---|---|
| Le jeton d'accès est conservé **en mémoire uniquement**, dans `CoffreJetonsMemoire`. Il n'est jamais écrit dans IndexedDB, `localStorage`, `sessionStorage`, le cache du service worker, un cookie, le Drive, une URL, un journal, un message d'erreur ni un fichier de test. **Seule exception** : sa présence, imposée par Google, dans le fragment de l'URL de retour de redirection, encadrée au §9.2.1. | Doit |
| Notre code n'écrit **jamais** un jeton dans une URL : les appels aux API Google portent le jeton dans l'en-tête `Authorization: Bearer`, jamais dans un paramètre `access_token`. | Doit |
| Notre code ne manipule **aucun jeton de rafraîchissement** : sans serveur, une page web n'en reçoit pas ; le jeton est obtenu à l'ouverture par redirection `prompt=none` et, en cours de session, par un geste (§9.2.1). *Repli* : Google Play services sur Android (§19). | Doit |
| `localStorage` et `sessionStorage` sont interdits dans `src/` (`no-restricted-globals`), sauf l'exception du §9.2.1 (mémorisation du `state`, sans jeton), déclarée par un bloc `files` d'ESLint limité à un fichier. | Doit |
| Les portées accordées sont vérifiées après chaque autorisation (`PorteeInsuffisante` sinon). Portées du lot 1 : `openid`, `email`, `drive.file` (DS-05). Toute nouvelle portée passe par Starck et figure dans la ST-US. | Doit |
| Le compte est identifié par la claim `sub`, jamais par l'adresse e-mail. | Doit |
| Le script Google Identity Services est chargé **à la demande et de façon non bloquante** (DAT §4.1.6, R12). | Doit |
| Déconnexion (RG-043) : le jeton en mémoire et l'identifiant de compte actif sont effacés ; les données locales sont **conservées**. | Doit |

#### 9.2.1 Retour de redirection OAuth : exception unique à la règle « aucun jeton dans une URL » (ADR-013, DAT v0.11 §4.1.7)
Avec la PWA unique, le jeton est obtenu par une redirection pleine page vers Google (`response_type=token` ; `prompt=none` à l'ouverture, sans `prompt=none` pour une redirection interactive sur geste). Google renvoie le jeton dans le **fragment** de l'URL de retour (`#access_token=…&expires_in=…&scope=…&state=…`). Le fragment n'est jamais transmis au réseau, mais il reste visible de la page, de l'historique et des extensions tant qu'il n'est pas effacé. L'exception est **limitée** à ce fragment et soumise à toutes les règles suivantes.

| Id | Règle | Force |
|---|---|---|
| RED-01 | **Périmètre.** L'exception ne couvre que le fragment de l'URL de retour, à l'URI de redirection exacte (§9.1), après une redirection émise par notre adaptateur. Tout autre jeton dans une URL reste interdit. | Doit |
| RED-02 | **Effacement immédiat, avant tout rendu** (EC-3 de `poc-specification.md` §15). Le fragment est consommé par `consommerRetourRedirection` (`src/compte/infrastructure/auth/retour-redirection.ts`), appelée par la **première instruction** de `main.tsx`, avant la création de la racine React et tout rendu, avant l'enregistrement du service worker, avant le chargement de Google Identity Services et avant toute requête réseau. Elle copie le fragment dans une variable locale, l'**efface aussitôt** par `history.replaceState(history.state, '', pathname + search)`, puis l'analyse. L'effacement est **inconditionnel** : fragment mal formé, erreur Google, `state` rejeté ou absence de jeton. Aucun module de `src/` autre que `main.tsx` n'a d'effet de bord à l'évaluation (pas de rendu, de requête ni d'abonnement au niveau du module), afin qu'aucun code ne s'exécute avant cette consommation. | Doit |
| RED-03 | **`state` à usage unique, avec une durée de validité** (EC-4). Avant chaque redirection : `state` de 128 bits tiré par `SourceAleatoire.octets(16)` (§7.4), encodé en base64url, mémorisé avec son instant d'expiration, calculé par `Horloge.maintenant()` + `VALIDITE_STATE_REDIRECTION` (`EcartTemps` de **10 min**, constante de `compte/infrastructure/auth/`, référence ADR-013). Au retour, l'enregistrement est **lu puis supprimé** avant toute comparaison (usage unique, y compris en cas d'échec). Le retour est **rejeté** (`RetourRedirectionRejete`, §8.3) si le `state` est absent, différent de celui mémorisé, déjà consommé ou expiré ; le jeton éventuel est alors ignoré. La comparaison porte sur la chaîne entière. | Doit |
| RED-04 | **Mémorisation du `state`.** Elle ne contient **que** le `state` et son instant d'expiration : ni jeton, ni adresse e-mail, ni `sub`. Support : `sessionStorage` (clé `donejuan-<VITE_ENV>-oauth-redirection`), seule dérogation à `no-restricted-globals`, limitée au fichier `src/compte/infrastructure/auth/memoire-redirection-session.ts`, qui implémente un port interne au contexte `compte` (§2.3) doublé en test par une mémoire simple. **Sous réserve M-RED** : si la mesure montre que le retour n'a pas lieu dans le même contexte de navigation que le départ, ST-US-022 remplace ce support par une base IndexedDB technique hors espace de compte, derrière le même port. | Doit |
| RED-05 | **Jeton gardé en mémoire seulement.** Le jeton extrait devient un `JetonAcces` (type marqué), remis au seul `FournisseurAuth`, qui le place dans `CoffreJetonsMemoire` après contrôle du `state` et des portées accordées (`scope`). Le fragment brut et le jeton ne sont conservés dans aucune variable de module, aucun magasin Zustand, aucun état React, aucun journal ni message d'erreur. Le service worker ne met jamais en cache une URL qui porte un fragment ou un jeton. | Doit |
| RED-06 | **Journalisation.** Seuls sont journalisés : le code d'erreur Google (`error`), la catégorie du retour, le motif de rejet du `state`, la durée de l'aller-retour. Jamais le fragment, le jeton, le `state`, `login_hint` ni l'adresse e-mail. Le masquage défensif du §9.4 couvre en plus le motif `access_token=`. | Doit |
| RED-07 | **Fuite par le référent et les ressources tierces.** `index.html` porte `<meta name="referrer" content="no-referrer">` (GitHub Pages ne permet pas d'en-tête) ; aucune ressource tierce n'est chargée avant l'effacement, ni ailleurs hors `accounts.google.com` (CSP du §9.3). | Doit |
| RED-08 | **Une seule tentative automatique par ouverture** (ADR-013) : un retour en erreur ne relance aucune redirection dans la même ouverture ; aucune redirection automatique en cours de session (elle rechargerait la page). | Doit |

Tests imposés (fournis en E10 avec ST-US-022) : effacement du fragment **avant** l'analyse et dans chacun des cas de RED-02 (ordre des appels vérifié sur une doublure de `history`) ; rejet d'un `state` absent, inconnu, rejoué et expiré à 10 min + 1 ms, acceptation à 10 min exactement ; suppression de l'enregistrement du `state` dans tous les cas ; absence du jeton dans le journal technique, dans `sessionStorage` et dans l'URL après consommation ; parcours Playwright : au premier rendu, `location.hash` est vide.

### 9.3 Données personnelles et stockage local (DS-07)
Données concernées : objectifs, tâches, temps passés, adresse e-mail et identifiant de compte ; à partir des lots ultérieurs, contenu de l'agenda et réponses de bilan (données les plus sensibles).

- **Espace local par compte** : une base IndexedDB par compte (*repli* : un fichier SQLite), nommée `donejuan-<VITE_ENV>-<empreinte SHA-256 du sub en hexadécimal>` (DAT v0.11.1 §7.4 bis, §9.1). Ni le `sub` en clair ni l'adresse e-mail n'apparaissent dans un nom de base, de fichier ou de clé. Un autre compte n'ouvre jamais l'espace du précédent (DEC-016).
- **Pas de chiffrement au repos en v1** (DS-07) : IndexedDB du profil du navigateur, propre à l'origine, sur le PC et sur le téléphone (DAT v0.11 §7.1) ; *repli* : bac à sable Android. Les données restent sur l'appareil après une déconnexion (RG-043). Cette situation est inscrite au registre de dette (**DT-001**) ; la parade fonctionnelle est l'action « Supprimer les données de cet appareil » (DEC-015, RG-055).
- **Suppression des données de l'appareil** : suppression de l'espace complet du compte (base IndexedDB ; *repli* : fichier SQLite), précédée du dépôt des modifications en attente (RG-055). Un test d'intégration vérifie qu'il ne reste **aucune** donnée de l'espace après l'opération.
- **Drive** : protégé par le compte Google, sans chiffrement supplémentaire (DEC-010). Les titres, descriptions et participants des événements de l'utilisateur ne sont jamais écrits dans le Drive ni dans les journaux (DAT §4.4.4).
- **Aucune transmission à un tiers** : ni analytique, ni télémétrie, ni outil de suivi d'erreurs (DAT §7.3).
- **Validation de toutes les entrées** : saisies de l'utilisateur ; fichiers Drive (validation Zod et empreinte, §10.3) ; réponses des API Google.
- **Web** (DAT §7.1) : CSP stricte sans `unsafe-inline` ni `unsafe-eval`, origines limitées à `accounts.google.com` et `*.googleapis.com` (y compris la navigation de redirection vers `accounts.google.com`, DAT §4.1.7) ; `Referrer-Policy: no-referrer` (RED-07) ; aucune ressource chargée depuis un CDN ; aucun `dangerouslySetInnerHTML` (`react/no-danger`) ; aucun `eval`, `new Function`, `innerHTML` ; Trusted Types si disponible.
- `navigator.storage.persist()` est demandé au premier lancement **sur tous les appareils** (ADR-013) ; l'état obtenu est exposé dans l'écran « État de la synchronisation » et un avertissement est affiché s'il est refusé (R15, DAT §4.1.6). Le hors ligne du téléphone n'est garanti que pour la PWA **installée**.

### 9.4 Journal technique (DAT §7.3)
- Toute journalisation passe par le port `JournalTechnique`. Niveaux : `erreur`, `avertissement`, `info`, `debug` (désactivé en production).
- Destination : **locale uniquement**, tampon circulaire de 7 jours ; export du diagnostic sur demande de l'utilisateur.
- Format structuré : nom d'événement et champs.
- **Autorisé** : identifiants techniques opaques (UUID, `appareilId`), codes d'erreur, noms de cas d'usage, durées, compteurs, codes de statut HTTP, versions de l'application et du schéma, plateforme.
- **Interdit** : jetons, en-têtes `Authorization`, fragment et `state` d'un retour de redirection (RED-06), adresse e-mail, `sub` en clair, nom, titres et descriptions d'objectifs ou de tâches, contenu des fichiers Drive, contenu des événements d'agenda, corps des requêtes et réponses Google.
- `JournalTechniqueLocal` applique un **masquage défensif** (motifs de jetons `ya29.`, `Bearer`, `access_token=`, adresses e-mail). Un test unitaire vérifie ce masquage.

### 9.5 Chaîne d'approvisionnement
- osv-scanner (vulnérabilités) et license-checker (licences autorisées : MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, CC0-1.0 ; toute autre licence est soumise à Anthony) en CI. Une vulnérabilité haute ou critique bloque la fusion, sauf dérogation inscrite en dette avec un plan.
- Les actions GitHub sont épinglées par **empreinte de commit** (SHA), pas par étiquette.

## 10. Stockage local et synchronisation

Références : DAT §4.2, §4.3, §6 ; ADR-003, ADR-010, ADR-011 ; DS-07, DS-10, DS-11.

### 10.1 Écritures locales
- Toute écriture métier passe par un **cas d'usage**, qui appelle **une fois** `ServiceEtatLocal.modifier(decision)`. Le service lit l'état, appelle la décision métier (fonction pure), puis écrit **en une seule transaction** `DepotLocal` : les écritures d'information avec leur `Hlc` et leur contexte causal, les pierres tombales, les entrées du journal métier (RG-050, DS-19) et les mises à jour de l'index des écritures en attente (DAT §4.1.5 bis). Aucune écriture partielle n'est possible. Modèle complet : `ST-socle-ecriture.md`.
- Aucun module hors du contexte `synchronisation` ne manipule la représentation CRDT (`Ecriture`, `Hlc`, `ContexteCausal`, appareil) : les autres contextes lisent un `EtatMetier` et produisent des `Modification`, que le contexte `synchronisation` traduit.
- L'`Hlc` est produit **uniquement** par la fonction `hlcSuivant` du domaine `synchronisation`, appelée par `ServiceEtatLocal`, à partir de `Horloge.maintenant()` corrigé de l'écart mesuré avec l'en-tête `Date` de Google (ADR-011). Départage des égalités : `appareilId`, ordre lexicographique (DS-11). Une `Modification` reçoit un `Hlc` ; toutes les écritures d'information qu'elle produit partagent cet `Hlc`, et son entrée de journal aussi.
- Chaque écriture porte un **contexte causal** (DAT §4.2.1) ; une pierre tombale porte le contexte au niveau de l'élément, étendu aux écritures qui pointent vers lui (DAT v0.10.1 §4.2.1). Le contexte n'est jamais lu par un autre contexte que `synchronisation`.
- L'état d'une tâche et ses dates forment **un seul registre** (DAT §4.2). Les suppressions sont des **pierres tombales**, jamais des effacements physiques en v1.
- Une modification n'est jamais retirée de l'appareil avant son dépôt confirmé dans le Drive (ENF-T-07). Le marqueur `deposeJusquA` n'est avancé **qu'après** la confirmation du Drive.
- **Un seul adaptateur en cible : `DepotLocalDexie`**, sur tous les appareils (ADR-013, DS-07 v0.11). Il passe la suite de contrat du §11.10. `DepotLocalSqlite` n'est pas réalisé (repli, §19.4).
- **Durabilité stricte** (ADR-013, US-018 CA-5) : toute transaction d'écriture est ouverte avec la durabilité stricte (option `chromeTransactionDurability: 'strict'` de la base Dexie, ou `durability: 'strict'` sur une transaction IndexedDB native). Une écriture n'est **confirmée** au cas d'usage qu'à l'événement `complete` de la transaction ; `error` et `abort` produisent un `Echec<ErreurDepotLocal>`. Une promesse résolue au `success` d'une requête isolée ne vaut pas confirmation (EC-1 de `poc-specification.md` §15). Un test d'intégration vérifie l'option passée à l'ouverture de chaque transaction d'écriture.

### 10.2 Cycle de synchronisation
- Constantes nommées, regroupées dans `src/synchronisation/domaine/parametres-synchronisation.ts`, chacune avec sa référence : `TEMPORISATION_DEPOT` = 5 s, `PERIODE_SYNCHRONISATION_PREMIER_PLAN` = 2 min (DAT §4.3) ; `SEUIL_RAPPEL_HORS_LIGNE` = 24 h, `PERIODE_EVALUATION_RAPPEL_HORS_LIGNE` = 1 min (RG-057, DAT §4.1.5 bis) ; `SEUIL_HORLOGE_DEREGLEE` = 24 h, avertissement si l'écart est **strictement supérieur** (US-017 CA-13). Toutes sont des `EcartTemps`.
- **Bandeau RG-057** (DEC-025, DEC-026) : les 24 h courent depuis la plus ancienne modification en attente, donnée locale non synchronisée. Un seul bandeau est affiché à la fois : si l'accès Google est perdu, `BAN-ACCES-GOOGLE` (non fermable, avec une mention, et la variante 24 h) remplace `BAN-RAPPEL-24H` (fermable, affiché au-delà de 24 h, en ligne ou hors ligne). Un bandeau fermé réapparaît à la prochaine ouverture, c'est-à-dire au lancement de l'application ou au rechargement de la PWA, et non à un simple retour au premier plan. Le calcul est isolé dans une seule fonction pure, testée unitairement.
- Tous les déclenchements différés ou périodiques passent par le `Planificateur` : `setTimeout`, `setInterval` et `requestIdleCallback` sont interdits hors `PlanificateurNavigateur`.
- La fusion est une fonction **pure** du domaine `synchronisation` : commutative, associative, idempotente (propriétés vérifiées par fast-check, §11.4). La passe de réparation (RG-047 à RG-049) est pure et déterministe.
- `dernierContactDrive` et les jetons de pagination (`pageToken`) sont des données **locales non synchronisées** (DAT §6.1).
- Sur chaque appareil, un seul onglet ou une seule fenêtre de la PWA synchronise (verrou `navigator.locks`, derrière un port interne au contexte, §2.3) ; la règle, écrite pour le PC, vaut aussi pour le téléphone (ADR-013).

### 10.3 Format des données dans le Drive et versions (RG-044, RG-058)
- L'emplacement (dossier visible `Done Juan/`, portée `drive.file`, arbitrage A6), le nom et la compression des fichiers suivent le DAT §4.2. Avec un client OAuth Web unique, R1 est sans objet (DAT v0.11 §10.1) ; la réserve R1 ne revit qu'en repli (§19) : si le test R1 échouait alors, le repli `drive.appdata` changerait l'emplacement, pas le contenu logique (`ST-socle-ecriture.md` §5.3).
- **Schémas Zod versionnés** : `src/synchronisation/infrastructure/drive/schemas/v<n>.ts`. La constante `SCHEMA_VERSION` est définie dans un seul fichier. Le **schéma 1** n'est publié qu'avec l'incrément 1 d'US-017 ; son contenu logique est figé dès le rang 0 (`ST-socle-ecriture.md` §5.3, condition 1 de Starck).
- Chaque fichier lu est validé (Zod) et son **empreinte SHA-256** vérifiée (`crypto.subtle.digest`) avant toute fusion. L'empreinte est calculée sur une **sérialisation canonique** (clés triées, sans le champ d'empreinte), produite par une fonction unique utilisée à l'écriture et à la lecture.
- Un fichier invalide ou d'empreinte incorrecte n'est **jamais** fusionné et n'écrase jamais l'état local (RG-044).
- **Compatibilité (RG-058)** : le `schemaVersion` est le **seul** critère de blocage. En conséquence :
  - une évolution **compatible** (champ optionnel, nouveau type d'élément ignorable) **n'incrémente pas** `SCHEMA_VERSION`. Les schémas Zod de lecture **tolèrent** les champs inconnus : `.strict()` est interdit sur un schéma de fichier Drive ;
  - une évolution **incompatible** incrémente `SCHEMA_VERSION`. Elle exige : l'accord de Starck, l'annonce au commanditaire via Jarvis (elle bloque la saisie des appareils non mis à jour), une migration pure `migrerV<n>VersV<n+1>`, des fichiers d'exemple de chaque version antérieure dans `tests/fixtures/drive/v<n>/` et les tests de lecture correspondants ;
  - **consultation seule** (`FormatPlusRecent`) : l'appareil n'écrit **rien** dans le Drive, ne fusionne pas les fichiers plus récents et **n'efface rien** en local ; ses modifications en attente restent en base ; le contrôle de `generation` (RG-044 b) n'est effectué qu'**après** l'établissement de la compatibilité. Cette garde est implémentée **en un seul point** du cycle de synchronisation ;
  - tests obligatoires dès qu'une US touche au format : (a) lecture de chaque version antérieure ; (b) **coexistence** : un fichier de même `schemaVersion` contenant des champs inconnus est lu sans blocage et sans perte des données propres de l'appareil ; (c) consultation seule : aucune écriture Drive, aucun effacement local, modifications en attente conservées puis déposées après mise à jour.
- Champs inconnus de même `schemaVersion` : **conservés** à la réécriture du fichier de l'appareil, avec leur HLC, et fusionnés par champ (DAT v0.7, ANT-19). Un type d'événement de journal inconnu est conservé tel quel.

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
| Intégration | Adaptateur Dexie (dont la durabilité stricte, §10.1), sérialisation, migrations | Vitest, `fake-indexeddb` | Stockage réel temporaire | < 1 s par test | Benjamin, revus par Anthony |
| Acceptation | Scénarios `.feature`, sur la **couche application** (ADR-009) | cucumber-js | Banc de synchronisation (§11.11) | < 60 s pour la suite d'un lot | Pepper (`.feature`), Benjamin (steps) |
| Acceptation via l'IHM | Scénarios `@ihm` | cucumber-js et Playwright (Chromium) | `composition/test-ihm.ts` | — | Benjamin, sur spécification d'Anthony |
| Bout en bout | Démarrage de la PWA, hors ligne, accessibilité | Playwright, axe | Doublures Google | — | Benjamin |
| Recette manuelle | Scénarios `@recette`, appareil réel (PC et téléphone, PWA installée), compte de recette | — | Aucune | — | Pepper, Steeve, Starck (E14) |

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

### 11.6 Fichiers `.feature` et glossaire d'étapes
- Emplacement et nommage fixés par le workflow : `tests/features/US-xxx-<titre>.feature`, `# language: fr`, tags `@US-xxx`, `@RG-xxx`, `@LOT-xxx` sur chaque scénario.
- Le **glossaire d'étapes** de Pepper (`tests/features/GLOSSAIRE-ETAPES.md`, v1.4) **fige** le vocabulaire : une phrase qui n'y figure pas n'a pas de définition. Anthony en tire la liste des définitions d'étapes de chaque ST-US (E9) ; Benjamin n'en crée pas d'autres. Un besoin nouveau passe par Pepper, via Jarvis.
- **Conventions du glossaire v1.4 appliquées par les *step definitions*** :
  - « que » facultatif en tête d'une précondition : une seule définition (`etapeContexte`, §11.7) ;
  - pluriel `modification(s)`, `tâche(s)`, `sous-tâche(s)`, `information(s)`, `détachée(s)`… : une seule définition, qui accepte le singulier, le pluriel **et** la forme littérale entre parenthèses (« 1 tâche », « 2 tâches », « 2 tâche(s) ») ; dans une expression Cucumber, `(s)` désigne un texte facultatif et ne reconnaît pas les parenthèses littérales : ces définitions s'écrivent donc en **expression régulière**, avec le motif `s?(?:\(s\))?` après chaque mot variable (exemple : `/^l'objectif "([^"]*)" a (\d+) tâches?(?:\(s\))? à faire, …$/`) ;
  - préfixe d'appareil : sans préfixe dans un scénario à deux appareils, une **assertion** vaut « sur chacun des deux appareils » (Q-US-017-7) ; une **action** sans préfixe y est une erreur du scénario, sauf l'exception H-5 ci-dessous ;
  - assertion tabulaire : l'ordre n'est vérifié qu'avec « dans cet ordre », seules les colonnes présentes sont vérifiées ; l'historique (« contient, pour … : ») vérifie la liste complète, dans l'ordre chronologique ;
  - opération au passé (« que sur le <appareil>, l'utilisateur a créé … ») : rejoue l'opération du §5 sur cet appareil, à l'instant courant ;
  - **H-5** (contrôle d'explicitation, É-5) : les préconditions `Étant donné` décrivent un **état**, pas une chronologie. Une précondition qui exige un échange avec le Drive est jouée avant une précondition de coupure du réseau du même appareil. Une action de confirmation sans préfixe (« l'utilisateur confirme », « l'utilisateur renonce ») s'applique à l'appareil qui a **une** confirmation en attente ; elle échoue s'il n'y en a aucune ou plusieurs ;
  - **H-7** : les tableaux de contexte « les tâches suivantes : » appliquent la construction du glossaire §1 (création « à faire » dans l'ordre du tableau ; estimation technique de 30 min pour une tâche parente sans estimation ; états appliqués aux sous-tâches puis aux tâches parentes ; seule une sous-tâche « à faire » sous une tâche parente terminée ou abandonnée fait échouer l'étape).
- Attentes de testabilité à l'égard des `.feature`, satisfaites par le glossaire v1.4 et maintenues pour les lots suivants :
  - chaque scénario dépendant du temps ancre la date, l'heure et le fuseau ; le temps ne passe que par les étapes du glossaire §4 ;
  - les délais exprimés en durée (« au plus tard 1 minute après ») sont vérifiés par l'avance de l'horloge simulée, jamais par une attente réelle ;
  - les états de Google sont décrits en termes métier ;
  - un état visible de l'interface est désigné par son **code** du catalogue (§8.5) ou par son libellé exact ;
  - un refus est désigné par un **code de motif** stable (ANT-21, §17.2).

### 11.7 Step definitions : organisation et types de paramètres
**Emplacement** : `tests/steps/<contexte>/<theme>.steps.ts`, un fichier **par thème métier** et non par US. Le découpage suit les sections du glossaire d'étapes.

| Fichier | Contenu (sections du glossaire) |
|---|---|
| `commun/temps.steps.ts` | §4 : « nous sommes le … », « l'horloge avance de … », horloge en avance ou en retard |
| `commun/appareils.steps.ts` | §1 et §2 : appareils du banc, installation, ouverture et fermeture, extinction, arrêt brutal, fuseau d'un appareil, onglets |
| `commun/reseau.steps.ts` | §1 et §3 : réseau coupé, intermittent, rétabli |
| `compte/connexion.steps.ts` | §1, §2, §6 : connexion, refus (codes `ERR-001` à `ERR-006`), déconnexion, accès retiré ou expiré, session du navigateur, suppression des données de l'appareil, données locales présentes |
| `objectifs-taches/objectifs.steps.ts` | §1, §5, §6, §7 : objectifs et sous-objectifs |
| `objectifs-taches/taches.steps.ts` | §1, §5, §6, §7 : tâches, sous-tâches, états, estimations, alertes de délai |
| `objectifs-taches/refus.steps.ts` | §6 : « l'enregistrement est refusé avec le motif … », « l'action est refusée … », « la modification est refusée … », « l'opération est acceptée », confirmations annoncées (`CNF-…` des objectifs et des tâches) |
| `objectifs-taches/liste-taches.steps.ts` | §5, §6 : consultation et filtres de la liste « Tâches », contenu et ordre de la liste, tâches sans objectif |
| `objectifs-taches/historique.steps.ts` | §11 : historique (RG-050), rendu par `tests/support/rendu-historique.ts` |
| `commun/confirmations.steps.ts` | §2, §5 : « l'utilisateur confirme », « l'utilisateur renonce » (commandes en attente, §8.6) |
| `synchronisation/echanges.steps.ts` | §3 : échanges avec le Drive, envois interrompus, modifications en attente |
| `synchronisation/drive.steps.ts` | §1, §3, §6 : contenu du Drive, altérations, Drive plein ou indisponible, restauration, versions et consultation seule |
| `synchronisation/modifications-non-retenues.steps.ts` | §3, §6 : liste des modifications non retenues, « Compris » |
| `synchronisation/etat-affiche.steps.ts` | §6 : indicateur, bandeaux, mentions « non synchronisé », vérifiés par les modèles de vue |

**Support** (`tests/support/`) :
- `monde.ts` : classe `MondeDoneJuan` (étend `World` de cucumber-js) ; contient le `BancSynchro` (§11.11), le dernier résultat par appareil, les commandes en attente de confirmation par appareil (§8.6) et les références nommées (intitulé → identifiant, nom de compte → compte simulé). **Résolution d'un intitulé** (`references.ts`) : parmi les éléments non supprimés du type demandé, l'unique élément qui porte cet intitulé ; s'il n'y en a aucun, l'élément mémorisé sous cet intitulé à sa création ou à son dernier renommage (pour « n'existe plus ») ; s'il y en a plusieurs, l'étape échoue (« intitulé ambigu ») ;
- `hooks.ts` : un monde neuf par scénario (`Before`) ; en fin de scénario (`After`), échec si le journal technique d'un appareil contient une entrée de niveau `erreur` non attendue par le scénario ;
- `types-parametres.ts` : types de paramètres communs ;
- `prefixes.ts` : fonctions d'enregistrement des étapes à préfixe (ci-dessous) ;
- `fabriques/` : fabriques de données (§11.9).

**Types de paramètres** (`defineParameterType`). Principe : un type de paramètre **convertit un format**, il n'applique **jamais** une règle métier ; une valeur invalide au sens métier (« 45 min » pour une estimation) doit atteindre le cas d'usage, qui la refuse.
| Type | Expression régulière | Conversion | Exemples (glossaire) |
|---|---|---|---|
| `{appareil}` | `smartphone\|PC` | `NomAppareil` (`'smartphone'`, `'pc'`) | « sur le {appareil}, … » |
| `{duree}` | `\d+ h(?: \d{2})?\|\d+ min` | `number` (minutes, non validé) | `30 min`, `1 h`, `2 h 30`, `0 h` |
| `{ecart}` | `\d+ h(?: \d+ min)?\|\d+ minutes?\|\d+ min` | `EcartTemps` | `24 h`, `24 h 1 min`, `23 h 59 min`, `5 min`, `1 minute`, `10 minutes`, `60 minutes` |
| `{date}` | `\d{4}-\d{2}-\d{2}` | `string` au format `AAAA-MM-JJ` (non validé) | `2026-12-15` |
| `{heure}` | `\d{2}:\d{2}` | `HeureLocale` | `10:00` |
| `{fuseau}` | `UTC\|[A-Z][A-Za-z_]+(?:\/[A-Za-z_]+)+` | `Fuseau` (validé par `Intl`) | Sans guillemets : « heure de {fuseau} » ; avec guillemets : « réglé sur le fuseau "{fuseau}" » ; valeurs admises par le glossaire : Europe/Paris, America/New_York, UTC, Pacific/Auckland |

Les intitulés, noms de compte, libellés et codes entre guillemets utilisent le type natif `{string}` ; les entiers `n`, le type `{int}`. Un nouveau type de paramètre est ajouté par une ST-US, dans `types-parametres.ts`, jamais localement.

**Préfixes** (glossaire d'étapes, conventions et §4). Une étape portée par un appareil est enregistrée **une seule fois** par une fonction de `prefixes.ts`, qui définit ses variantes :
| Fonction | Variantes enregistrées | Comportement |
|---|---|---|
| `etapeContexte(motif, fn)` | `<motif>` ; `que <motif>` ; `sur le {appareil}, <motif>` ; `que sur le {appareil}, <motif>` | Précondition. Sans préfixe : valide seulement si le banc ne comporte qu'un appareil, ou si l'étape porte sur des données (dans un scénario « tous deux à jour », elle est jouée sur le smartphone puis échangée, comme le prévoit ST-US-017). |
| `etapeAction(motif, fn)` | `<motif>` ; `sur le {appareil}, <motif>` ; `{ecart} plus tard, sur le {appareil}, <motif>` ; `{ecart} plus tard, <motif>` ; `au même instant exact, sur le {appareil}, <motif>` ; `au même instant exact, <motif>` | Sans préfixe : valide seulement si le banc ne comporte qu'**un** appareil, sinon échec « appareil ambigu » (exception H-5, §11.6). « … plus tard » avance d'abord le temps simulé. « Au même instant exact » rejoue l'étape à l'instant simulé de l'étape précédente. |
| `etapeAssertion(motif, fn)` | `<motif>` ; `sur le {appareil}, <motif>` ; `sur les deux appareils, <motif>` ; `sur chacun des deux appareils, <motif>` | Les deux dernières variantes exécutent l'assertion sur chaque appareil du banc ; sans préfixe dans un banc à deux appareils, l'assertion vaut « sur chacun des deux appareils » (Q-US-017-7). |
| `etapeOnglet(motif, fn)` | `dans le premier onglet, <motif>` ; `dans le second onglet, <motif>` | Profil `ihm` uniquement (`tests/steps-ihm/`). |

L'accord « signalé(e) » du glossaire s'écrit avec le texte optionnel des expressions Cucumber : `signalé(e) comme non synchronisé(e)`.

**Règles** :
- Une phrase Gherkin correspond à une seule définition ; une définition ambiguë ou manquante fait échouer la suite (mode strict).
- Les steps sont **minces** : ils traduisent la phrase en appel de cas d'usage, de requête ou de pilotage de doublure, sans logique métier ni calcul du résultat attendu.
- Les steps « Étant donné » préparent l'état **par les cas d'usage** ou par les fabriques, jamais en écrivant directement dans le stockage interne. Exception : les situations que l'application ne peut pas produire (fichier Drive modifié à la main, format plus récent, Drive plein) passent par l'API de pilotage des doublures.
- Les steps « Alors » vérifient par les **requêtes** de l'application, les **modèles de vue** (codes du catalogue) ou l'**API d'observation** des doublures (fichiers du `FauxDrive`).
- Aucune définition inutilisée dans une version fusionnée : contrôle `cucumber-js --dry-run --format usage` en CI (§14.1).
- Chaque ST-US liste les phrases à implémenter, le fichier cible, et indique si le step est nouveau ou réutilisé.

### 11.8 Tags et profils d'exécution
| Tag | Posé par | Sens (glossaire d'étapes §10) | Exécution |
|---|---|---|---|
| `@US-xxx`, `@RG-xxx`, `@LOT-xxx` | Pepper | Traçabilité, filtrage ; obligatoires sur chaque scénario | — |
| `@ihm` | Pepper | Le scénario ne peut se vérifier que par l'interface réelle : navigateur, installation, onglets, saisie en cours (11 scénarios au lot 1 : US-031, 9 ; US-018, 2 — décompte du 2026-10-27) | Profil `ihm` : cucumber-js avec les steps de `tests/steps-ihm/`, Playwright (Chromium) sur la PWA construite avec `composition/test-ihm.ts` ; assertions sur `data-etat`, `data-message` et rôles accessibles |
| `@recette` | Pepper | Non automatisable : dépend d'un service extérieur que le banc ne simule pas, ou d'un comportement réel de l'appareil (2 scénarios au lot 1 : US-022 S13b, US-018 S09b) | Aucune exécution automatisée ; déroulé à la main en E14, tracé dans le procès-verbal de recette |
| `@lent` | Pepper, sur demande d'Anthony | Scénario de plus de 2 s | Exclu du profil local `rapide` ; exécuté en CI |
| `@google-reel` | Pepper, sur demande d'Anthony | Vérification contre l'API Google réelle et un compte de test | **Jamais en CI** ; exécution manuelle (profil `google-reel`), en recette technique |
| `@wip` | — | — | **Interdit** dans une version fusionnée |

Le catalogue de Steeve étant paru, les bandeaux et les états de l'application se vérifient par les modèles de vue, sans `@ihm` (glossaire d'étapes §6, dernier point).

Profils cucumber-js (`cucumber.mjs`), tous en `strict`, `# language: fr`, steps chargés par `tsx` :
| Profil | Filtre de tags | Steps | Où |
|---|---|---|---|
| `default` | `not @ihm and not @google-reel and not @recette`, restreint aux scénarios exécutables au rang courant (§11.13) | `tests/steps/` | CI (chaque fuseau) |
| `rapide` | `default` et `not @lent` | `tests/steps/` | Poste de développement |
| `ihm` | `@ihm and not @google-reel and not @recette` | `tests/steps-ihm/` | CI (job `ihm`) |
| `google-reel` | `@google-reel` | `tests/steps/` avec adaptateurs réels | Manuel |

Par construction, tout scénario non tagué `@recette` ou `@google-reel` est exécuté par `default` ou par `ihm`. Le script `scripts/verifier-tags.ts` vérifie en CI que : chaque scénario porte `@US-`, au moins un `@RG-` et `@LOT-` ; chaque `@RG-xxx` existe dans le cahier des charges ; aucun `@wip` ; aucun tag technique hors de cette liste.

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
| `FauxDrive` | `TransportSynchro` | Stockage **partagé** entre les appareils du banc ; `transportPour(appareil)` renvoie la vue d'un appareil, soumise à son `ReseauSimule` et à son `FauxFournisseurAuth`. Dépôt et lecture ; liste des changements ; manifeste, `generation`, `schemaVersion` ; fichier modifié, supprimé ou illisible « à la main » ; empreinte incorrecte ; dossier supprimé ; Drive plein ; Drive indisponible ; envoi interrompu n fois ; erreurs `401`, `403`, `404`, `429`, `5xx` ; en-tête `Date` piloté (§11.11) |
| `FauxAgenda` | `PasserelleAgenda` | Lots avec agenda : erreurs `401`, `409`, `410`, `429`, `5xx` (ADR-009) ; événements de l'utilisateur ; déplacement « par l'utilisateur » sans toucher `posApp` (PT-05) |
| `FauxFournisseurAuth` | `FournisseurAuth` | Connexion réussie, annulée ou interrompue ; portée refusée ; session expirée (tous appareils) ; révocation ; changement de compte ; Drive désactivé pour le compte ; **à l'ouverture** (ADR-013) : jeton obtenu sans saisie par redirection, retour en erreur d'interaction (`SessionARenouveler`), erreur de configuration (`ConfigurationOAuthInvalide`), `state` rejeté (`RetourRedirectionRejete`) ; compteur des redirections automatiques par ouverture (API d'observation, RED-08) |
| `HorlogeSimulee` | `Horloge` | §7.3 |
| `ReseauSimule` | `EtatReseau` | Connecté, coupé, retour du réseau (émet l'événement) |
| `PlanificateurSimule` | `Planificateur` | Exécute dans l'ordre les déclenchements échus quand le temps simulé avance ; aucune attente réelle |
| `SourceAleatoireDeterministe`, `GenerateurIdentifiantsSequentiel`, `JournalTechniqueMemoire`, `NotifieurMemoire`, `CoffreJetonsMemoire` | Ports transverses | Déterministes ; API d'observation |

- `DepotLocal` n'a **pas** de doublure en mémoire : les tests utilisent l'adaptateur réel `DepotLocalDexie` sur `fake-indexeddb` (une fabrique `IDBFactory` neuve par appareil simulé), pour exercer le vrai code transactionnel.
- Chaque doublure est soumise à la **suite de contrat** de son port (`tests/contrats/<port>.contrat.ts`), exécutée aussi contre l'adaptateur réel : avec MSW en CI, et contre un compte Google de test en exécution manuelle (`@google-reel`). Starck valide la fidélité en E14.
- Les doublures exposent une **API de pilotage** (`couperReseau()`, `modifierFichierALaMain(appareil)`, `revoquerAcces()`…) et une **API d'observation** (`fichiers()`, `nombreAppels(operation)`), en français.

### 11.11 Banc de synchronisation
Le **banc** (`tests/support/banc/`) est le cœur des scénarios Cucumber et des tests de propriétés de la synchronisation.

- `TempsSimule` : l'heure « vraie » du banc, unique ; par défaut, elle date les réponses du `FauxDrive` (en-tête `Date`). Le scénario peut piloter cet en-tête : valeur imposée, écart de plusieurs minutes ou absence (DAT v0.6 §3.3).
- `BancSynchro` : un `FauxDrive` et un `FauxAgenda` partagés ; un `PlanificateurSimule` global ; une liste d'`AppareilSimule`.
- `AppareilSimule` : `nom` (`smartphone` ou `pc`), `appareilId` **fixe**, jamais aléatoire (DAT v0.6 §3.3) : `smartphone` = `00000000-0000-7000-8000-000000000001`, `pc` = `00000000-0000-7000-8000-000000000002` ; l'ordre lexicographique, donc le départage des égalités d'`Hlc`, est connu du scénario, `HorlogeSimulee` (temps simulé + décalage propre), `ReseauSimule`, `FauxFournisseurAuth`, base `fake-indexeddb` propre, composition complète de l'application (cas d'usage, requêtes, modèles de vue, cycle de synchronisation).
- API du banc : `ajouterAppareil(nom)`, `avancerTemps(ecart: EcartTemps)` (exécute les déclenchements échus de tous les appareils), `ouvrirApplication(appareil)`, `fermerApplication(appareil)`, `arreterBrutalement(appareil)` (perte de la mémoire, conservation de la base), `redemarrer(appareil)`, `synchroniserJusquAuRepos()` (enchaîne les cycles jusqu'à ce qu'aucun appareil n'ait de travail en attente, avec un nombre maximal d'itérations au-delà duquel le test échoue).
- **Égalité d'horodatage** : l'étape « au même instant exact, … » (glossaire d'étapes §4) joue deux modifications au même instant simulé sur deux appareils sans dérive ; les `Hlc` sont alors strictement égaux et le départage par `appareilId` est vérifiable (US-017 S12b).
- **Propriétés** vérifiées (fast-check, séquences aléatoires de modifications, coupures et synchronisations sur deux appareils, à graine fixe) : **convergence** (après synchronisation jusqu'au repos, états identiques) ; **aucune perte silencieuse** (toute valeur non retenue figure dans les modifications non retenues, ENF-06) ; **idempotence** (synchroniser deux fois ne change rien) ; **reprise** (un arrêt brutal à n'importe quelle étape, puis une reprise, aboutit au même état).
- **Injection de pannes** : le `FauxDrive` peut échouer à une étape choisie du cycle (avant ou après le dépôt, avant l'avancée de `deposeJusquA`) pour vérifier PT-13.

### 11.12 Tests des modèles de vue et de l'interface
- Chaque modèle de vue a des tests unitaires exhaustifs de ses états (par exemple, l'indicateur de synchronisation : chacun des états du guide §6.5 et leur priorité).
- Les composants sont testés avec `@testing-library/react` sur des modèles de vue fournis : rendu du libellé du catalogue, rôle ARIA, action déclenchée. Pas de test de style.
- Playwright couvre les parcours `@ihm` et quelques parcours hors Cucumber (démarrage, hors ligne, accessibilité axe sans violation de niveau `serious` ou `critical`).

### 11.13 Rattachement des scénarios aux rangs de réalisation (LOT-001)
Règle arrêtée au contrôle d'explicitation (`explicitation-LOT-001.md` §4.1) ; elle s'impose à E10, E12 et E13 :
1. Un scénario reste tracé sur son US : ses tags ne changent pas.
2. Il est **exécuté et revu au rang de son dernier prérequis** : la dernière US, ou le dernier incrément d'US-017, dont il utilise une capacité. Les exemples d'un plan du scénario sont exécutés ensemble, au rang de l'exemple le plus exigeant.
3. La revue E13 d'un rang couvre le code du rang et **tous** les scénarios qui deviennent exécutables à ce rang, y compris ceux, différés, d'US des rangs précédents. Une revue ne peut pas être approuvée si un scénario devenu exécutable est rouge.
4. Une US n'est déclarée « En recette » que lorsque **tous** ses scénarios sont verts.
5. La liste nominative des scénarios par rang est dans `docs/lots/LOT-001.md`, section « Ordre de réalisation ».

**Mise en œuvre** :
- `tests/support/rangs-scenarios.json` : `{ "rangCourant": n, "scenarios": { "US-001 S06": 8, … } }`, une clé par scénario des dix fichiers (identifiant `US-xxx Snn` tiré du titre « Snn — … »). `rangCourant` est augmenté d'une unité dans la *pull request* qui livre le rang, et par elle seule.
- `scripts/selection-scenarios.mjs` analyse les `.feature` avec `@cucumber/gherkin` et renvoie la liste `chemin:ligne` des scénarios dont le rang est inférieur ou égal à `rangCourant` ; `cucumber.mjs` l'utilise pour les profils `default`, `rapide` et `ihm`.
- Une *step definition* est livrée au rang de la **capacité** qu'elle appelle (cas d'usage, requête, modèle de vue), même si les scénarios qui l'utilisent ne sont exécutés que plus tard. Le contrôle des étapes inutilisées (`pnpm cucumber:steps-inutilises`) porte donc sur **tous** les scénarios du lot, hors sélection : `cucumber-js --dry-run --format usage-json`, sans `--strict`, et `scripts/verifier-etapes-inutilisees.mjs` échoue si une définition n'est utilisée par aucune étape d'aucun `.feature` (les étapes encore indéfinies des scénarios non sélectionnés n'y sont pas des erreurs).
- `scripts/verifier-rangs.ts` (`pnpm verifier:rangs`, bloquant en CI) échoue si un scénario d'un `.feature` n'a pas de rang, si une clé ne correspond à aucun scénario, ou si `rangCourant` est inférieur au rang déjà atteint sur la branche de lot.
- À la fin du lot (rang 13), tous les scénarios non tagués `@recette` sont sélectionnés ; la sélection n'a alors plus d'effet.

## 12. Couverture minimale

Mesure : Vitest, `@vitest/coverage-v8`, seuils par motif de chemin (`coverage.thresholds`). Les scénarios Cucumber ne sont pas comptés dans la couverture de code (ils ont leur propre couverture fonctionnelle, ci-dessous).

| Périmètre (motif) | Lignes | Branches | Remarque |
|---|---|---|---|
| Domaine : `src/*/domaine/**` | 95 % | 90 % | Toute RG a au moins un test unitaire qui la cite |
| **Synchronisation** : `src/synchronisation/{domaine,application}/**` | **95 %** | **90 %** | Zone de risque majeure (R14) ; complétée par les propriétés du banc |
| Application : `src/*/application/**` | 90 % | 85 % | — |
| Modèles de vue, formatage, catalogue : `src/*/presentation/modeles-de-vue/**`, `src/commun/presentation/{format,messages}/**` | 90 % | 85 % | Purs, donc entièrement testables |
| Composants et écrans : `src/*/presentation/ui/**` | 70 % | 60 % | Complétée par Playwright |
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
- **Protection des branches** `main` et `lot/*` (DEC-029, accord de principe du commanditaire) : *pull request* obligatoire, contrôles requis du §14.1 verts, branche à jour, historique sans réécriture forcée. Elle est **activée dès que la CI existe**, c'est-à-dire à la fusion du rang 0 (socle) ; aucune action avant. Le réglage est fait par le propriétaire du dépôt (le commanditaire), sur demande de Jarvis ; Benjamin fournit la liste exacte des contrôles requis (noms des jobs du §14.3).
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
- **PWA** : la version de l'application est injectée à la construction (`package.json`) et affichée dans « État de la synchronisation » ; la mise à jour se fait par le service worker sur tous les appareils (DAT v0.11 §7.4). Une version défectueuse se corrige par une nouvelle version, jamais par un retour arrière. *Repli* : `versionCode` Android (§19.5).
- Versionnés : `pnpm-lock.yaml`, configurations des outils. Non versionnés : `dist/`, `coverage/`, rapports, `.env*` réels, données locales ; en repli, clés de signature, APK et AAB (§19.2).

## 14. Outillage et intégration continue

### 14.1 Contrôles (GitHub Actions)
| Contrôle | Outil et commande (scripts `package.json`) | Bloquant |
|---|---|---|
| Installation | `pnpm install --frozen-lockfile` | Oui |
| Formatage | `pnpm format:verifier` (`prettier --check .`) | Oui |
| Lint | `pnpm lint` (`eslint . --max-warnings 0`) | Oui |
| Types | `pnpm types` (`tsc --noEmit`) | Oui |
| Architecture | `pnpm architecture` (`depcruise src --config .dependency-cruiser.cjs`) | Oui |
| Catalogue, tags, rangs, dépôt | `pnpm verifier:catalogue` (§8.5), `pnpm verifier:tags` (§11.8), `pnpm verifier:rangs` (§11.13), `pnpm verifier:depot` (`.gitignore` et fichiers interdits, §9.1) | Oui |
| Tests unitaires, contrat, intégration | `pnpm test` (`vitest run`), **dans chaque fuseau** `TZ=UTC`, `TZ=Pacific/Auckland`, `TZ=America/New_York` | Oui |
| Couverture | `pnpm test:couverture`, une fois (job `TZ=UTC`), seuils du §12 | Oui |
| Cucumber | `pnpm cucumber` (profil `default`), dans chacun des trois fuseaux ; `pnpm cucumber:steps-inutilises` | Oui |
| Cucumber IHM et bout en bout | `pnpm build` puis `pnpm cucumber:ihm` et `pnpm e2e` (Playwright, Chromium) | Oui |
| SAST | Semgrep (règles `p/typescript`, `p/react`, `p/owasp-top-ten`, `p/secrets`) | Oui (gravité haute et critique) |
| Secrets | gitleaks, sur les commits poussés | Oui |
| Dépendances | osv-scanner ; license-checker (§9.5) | Oui (haute et critique) |
| Build | PWA (`vite build`) avec `VITE_BASE_PATH` de production ; *repli* : APK de debug Android (§19.6) | Oui |
| Mutation, propriétés étendues | Stryker ; fast-check à graines aléatoires | Non (hebdomadaire, indicateur) |

Le fuseau `Europe/Paris` n'est volontairement pas un fuseau de CI : il masquerait un usage involontaire du fuseau système. Les postes de développement, généralement à Paris, l'exercent déjà.

### 14.2 Configuration des outils
- **ESLint** (`eslint.config.js`, configuration *flat*) : `typescript-eslint` `strict-type-checked` et `stylistic-type-checked` ; `react-hooks` ; `jsx-a11y` (recommandé) ; `@vitest/eslint-plugin` sur `tests/` ; règles du §6 (`max-lines-per-function` 30 lignes utiles, `complexity` 10, `max-depth` 3, `max-params` 4, `switch-exhaustiveness-check`, `no-non-null-assertion`, `consistent-type-definitions` en `type` sauf ports, `no-restricted-syntax` contre `enum` et `export default`) ; interdits du §7.2, §7.4, §9.2 et §10.2. Les **exceptions** pour les adaptateurs autorisés (`HorlogeSysteme`, `PlanificateurNavigateur`, `SourceAleatoireCrypto`, `GenerateurUuidV7`, `JournalTechniqueLocal`, `EtatReseauNavigateur` ; `memoire-redirection-session.ts` pour `sessionStorage`, et `retour-redirection.ts` pour `location.hash` et `history.replaceState`, §9.2.1) sont déclarées par blocs `files` dans la configuration, jamais par commentaire local. Hors de ces deux fichiers, `location.hash`, `history.replaceState` et `history.pushState` sont interdits (`no-restricted-properties`), sauf dans le routeur s'il en existe un, déclaré par sa ST-US.
- **Importations restreintes** (`no-restricted-imports`, doublé par dependency-cruiser) : `date-fns`, `@date-fns/tz` (§7.2) ; `dexie` (adaptateur Dexie) ; `zod` (`synchronisation/infrastructure`, `compte/infrastructure`) ; `react`, `@ionic/*`, `zustand` (présentation hors modèles de vue) ; `@capacitor/*` **interdit dans `src/`** en cible (*repli* : §19.6) ; `msw`, `fake-indexeddb`, `fast-check`, `@cucumber/*`, `@playwright/*` (tests uniquement).
- **dependency-cruiser** (`.dependency-cruiser.cjs`) : règles de couches du §2.2 ; imports entre contextes par `index.ts` seulement ; aucune dépendance de `src/` vers `tests/` ; aucun cycle ; aucun module orphelin dans `src/`.
- **Prettier** : configuration par défaut, `printWidth` 100, guillemets simples, virgules finales ; aucun débat de forme en revue.
- **Hooks locaux** (Husky, lint-staged) : formatage, lint des fichiers indexés et gitleaks avant commit. Recommandés, non substituables à la CI.

### 14.3 Workflows
- `.github/workflows/ci.yml` : sur poussée vers `us/**`, `ano/**`, `lot/**`, `main` et sur *pull request* ; jobs `qualite` (formatage, lint, types, architecture, catalogue, tags), `tests` (matrice des trois fuseaux, unitaires et Cucumber ; couverture dans le job `UTC`), `ihm` (build, Cucumber `@ihm`, Playwright), `securite` (Semgrep, gitleaks, osv-scanner, licences), `build` (PWA ; *repli* : APK, §19.6). Durée cible inférieure à 10 minutes hors job `ihm`. `permissions: contents: read` par défaut.
- `.github/workflows/hebdomadaire.yml` : Stryker, fast-check étendu, osv-scanner complet.
- `.github/workflows/deploiement.yml` (ADR-013, DAT v0.11 §7.4, §7.5) : déclenché par une étiquette `v*` **posée sur un commit de `main`** (le flux vérifie l'appartenance du commit à `main` et s'arrête sinon) ; aussi déclenchable à la main pour la **recette** (`workflow_dispatch`, environnement `recette`). Étapes : (1) tests et contrôles du §14.1 ; (2) construction de la PWA avec les variables du dépôt (§9.1) ; (3) déploiement sur GitHub Pages (`actions/upload-pages-artifact`, `actions/deploy-pages`, environnement `github-pages`). Permissions : `contents: read` par défaut ; `pages: write` et `id-token: write` sur le seul job de déploiement. **Aucun secret** : l'identifiant du client OAuth est une variable publique du dépôt. L'environnement `production` est protégé (approbation du commanditaire).
- **Hébergement : GitHub Pages, retenu** (DEC-023, DEC-032 H-1, ADR-013) : `https://mathieublandin-create.github.io/taskapp/`, dépôt public, Pages en source « GitHub Actions ». Cloudflare Pages n'est plus qu'un recours si le dépôt redevenait privé ; changer d'hébergeur change l'origine, donc la base locale (DAT §7.5). L'étape de déploiement reste isolée dans une action composite `.github/actions/deployer-hebergement/`, pour que ce recours n'impacte qu'un fichier. R11 ne porte plus sur le choix de l'hébergeur mais sur l'écran de consentement avec cette origine (**sous réserve R11**, ST-US-022).
- **Adresse de recette** (DAT v0.11.1 §7.4 bis, ANT-26 clos) : **origine distincte** de la production. Recommandation : organisation GitHub gratuite (`https://<organisation-recette>.github.io`) ; en attente : dépôt frère `taskapp-recette` (portée disjointe, stockage isolé par le seul préfixe `VITE_ENV`). Un sous-chemin de `/taskapp/` est **interdit**. Le choix de l'origine attend la réponse du commanditaire à **Q-ANT26** ; il ne change que les variables de construction de la recette et la déclaration de l'origine et de l'URI de redirection dans le client OAuth Web de `objectifs-taches-dev`, pas le code.
- **Ordre de mise en place** : rang 0 : `ci.yml` et protection de `main` (DEC-029) ; rang 13 (US-031, service worker) : `deploiement.yml` et environnements `recette` et `production`. En repli, `publication.yml`, le job Android et les secrets de signature s'ajoutent au rang 12 (US-018, §19.6). Le contenu des rangs 1, 12 et 13 de `docs/lots/LOT-001.md` est revu à l'E9 d'US-022, une fois M-RED connue (l'adaptateur `FournisseurAuth` web, prévu au rang 13, est nécessaire dès le rang 1).
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
- [ ] Toute écriture métier passe par un cas d'usage, par un seul appel à `ServiceEtatLocal.modifier`, donc en une transaction, avec son entrée de journal métier (RG-050) et la mise à jour de l'index des écritures en attente.
- [ ] Tous les scénarios exécutables au rang livré (§11.13) sont verts, y compris les scénarios différés des rangs précédents devenus exécutables ; `rangCourant` est augmenté dans la *pull request*.
- [ ] Toute évolution du format Drive respecte §10.3 : compatible sans incrément de `SCHEMA_VERSION`, ou incompatible avec accord de Starck, annonce au commanditaire, migration et tests de lecture, de coexistence et de consultation seule.

**Livraison**
- [ ] Commits conformes au §13.2 ; branche à jour avec la branche de lot.
- [ ] *Pull request* conforme au modèle : résumé, écarts à la ST-US, dette déclarée, sortie des commandes de tests, de couverture et d'analyse.
- [ ] Documentation technique à jour si nécessaire (ST-US « tel que réalisé », glossaire code §5.2).

## 16. Points de testabilité

État des points de testabilité de la v0.1 après les réponses du DAT v0.6 (§3.3, §11) et DEC-012. Le détail de la v0.1 reste consultable dans l'historique Git.

| PT | Sujet | Approche retenue | État |
|---|---|---|---|
| PT-01 | Fun facts équitables (RG-040 à RG-042) | Permutation déterministe par cycle (ADR-008) ; propriétés : chaque fun fact une fois par cycle, écart d'au plus 1, pas de doublon à la jonction, rejouabilité | Approche validée (DAT) ; lot DEM-002 |
| PT-02 | Rappels de 8 h et 21 h | Séries Google Calendar ; contenu = fonction pure (état, jour, instant) ; aucune écriture après l'heure | Approche validée ; lot « Rappels » ; gabarit exact des événements à obtenir de Pepper |
| PT-03 | Conflits « la plus récente l'emporte » | HLC corrigée par l'en-tête `Date`, départage par `appareilId` ; banc à horloges décalées, en-tête `Date` piloté, `appareilId` fixes, égalité exacte d'horodatage (§11.11) ; propriétés | Clos : seuil de 24 h en CA-13 d'US-017 (Pepper), banc précisé au DAT v0.6 §3.3 (Starck) |
| PT-04 | « Visible dans l'heure » | Mécanismes vérifiables par le temps simulé : ouverture, dépôt à 5 s, toutes les 2 min, retour du réseau ; étapes « l'horloge avance de … » du glossaire | Validée par le DAT ; contrôle de la reformulation d'US-017 (ANT-3) au tour 2 du refinement |
| PT-05 | Créneau déplacé dans l'agenda | `posApp` dans l'événement ; `FauxAgenda` | Validée ; lots avec agenda |
| PT-06 | Journée et fuseaux | **Résolu par DEC-012** : jour de Paris calculé à partir de l'instant puis persisté ; tests dans trois fuseaux de CI ; RG-054 testée par `Horloge.fuseauAppareil()` | Clos (ajout au port soumis à Starck, §17.2) |
| PT-07 | Report automatique | Fonction pure (état, jour de Paris) ; rattrapage idempotent | Validée ; lot « Planification » |
| PT-08 | Vélocité et historiques | Journal métier dès le lot 1 (DS-19, RG-050) | Validée ; journal à alimenter dès LOT-001 |
| PT-09 | Durées au pas de 30 min | `Duree.saisie` et `Duree.calculee` (DAT v0.6, §7.1) ; propriétés ; estimation calculée de 0 h valide (US-024 S16, S16b) | Clos pour le lot 1 ; précision du temps passé : lots ultérieurs (Q-DEM001-31) |
| PT-10 | Ordre de priorité | Ordre total exigé | Lot « Priorisation » |
| PT-11 | Horaire suggéré | Fonction pure, exemples tabulaires | Lot « Planification » |
| PT-12 | Perte d'accès Google | `FauxFournisseurAuth` ; utilisation comme hors ligne ; aucune perte | Validée (DAT PT-12) ; ST-US-022 et ST-US-017 |
| PT-13 | Hors ligne et aucune perte | Transaction locale ; `deposeJusquA` avancé après confirmation ; injection de pannes dans le banc (§11.11) | Validée (DAT PT-13) |
| PT-14 | Questions de bilan | — | Lot DEM-002 |
| PT-15 | Alertes de délais dans les rappels | Gabarit exact et exemples chiffrés | Lot « Rappels » |
| **PT-16** | Changements d'heure à Paris | Valeurs du §11.9 ; règle de conversion par défaut du §7.1 ; au banc, heure ambiguë = première occurrence, heure inexistante interdite (glossaire v1.4 §4) | Applicable dès LOT-001 au calcul du jour, de la date de fin, de la date d'abandon et du retard (RG-045, RG-053) ; cas (3) sans objet au lot 1 (aucun créneau) |

## 17. Décisions de Starck et points ouverts

### 17.1 Décisions DS-01 à DS-20 (DAT §11) : intégration
| DS | Objet | Intégré au |
|---|---|---|
| DS-01 | TypeScript 5.x, options strictes, Node 24 LTS, idiomes | §3, §6.2 |
| DS-02 | v0.11 : une seule PWA, une composition `web.ts` (ADR-013) ; *repli* : PWA et Capacitor | §2.2, §4.2, §19 |
| DS-03 | Aucun serveur | §9 |
| DS-04, DS-05 | Clients publics, portées du lot 1, autorisation incrémentale ; v0.11 : client Web unique, redirection `prompt=none` à l'ouverture | §9.1, §9.2, §9.2.1 |
| DS-06 | `CoffreJetons` en mémoire, aucun jeton de rafraîchissement | §2.3, §9.2 |
| DS-07 | `DepotLocal` Dexie en durabilité stricte sur tous les appareils (v0.11) ; *repli* : SQLite ; transaction par cas d'usage, espace par compte, pas de chiffrement au repos | §9.3, §10.1, §19.4 ; dette DT-001 |
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

### 17.2 Points ouverts et clos
| Id | Point | Destinataire | État |
|---|---|---|---|
| ANT-17 | `fuseauAppareil()` au port `Horloge` (RG-054, §7.3) | Starck | **Clos** : accepté (DAT v0.7) |
| ANT-18 | Ports transverses complémentaires, placement de `DepotLocal` et `TransportSynchro`, rôle du `Planificateur` (§2.3) | Starck | **Clos** : confirmé (DAT v0.7) |
| ANT-19 | Conservation des champs inconnus de même `schemaVersion` (§10.3) | Starck | **Clos** : conservés (DAT v0.7) |
| ANT-20 | Scénarios `@ihm` exécutés par cucumber-js et Playwright (§11.8) | Starck | **Clos** : confirmé (DAT v0.7 §3.3, ADR-009 précisé) |
| ANT-21 | Motifs de refus rattachés à des codes du catalogue (§8.5, §11.6) | Pepper et Steeve | **Clos** : guide v0.2.4 §6.6.10, glossaire v1.4 §9 |
| ANT-22 | Alignement des conventions (DAT v0.10.1, ADR-012, CdC v0.11, glossaire v1.4, guide v0.2.8) | Anthony | **Clos** par la présente v0.3 |
| ANT-25 | Format de l'identifiant d'une entrée du journal métier : `<UUID v7 de l'opération>:<rang>`, rang décimal sans zéros de tête, identifiant opaque (`ST-socle-ecriture.md` §6.7) | Starck | **Validé, DAT v0.10.2** (§6.1, DS-08) |
| — | Protection des branches `main` et `lot/*` sur GitHub (§13.1, DEC-029) | Commanditaire, sur demande de Jarvis | À la fusion du rang 0 |
| R11, M-RED, M-PERSIST | Test technique v3, volet web (DAT PO-11) ; R1 et R2 ne valent qu'en repli | Jarvis, commanditaire | R11 et M-RED bloquent l'E9 d'US-022 et d'US-017 ; M-RED et M-PERSIST décident entre la cible et le repli (§19), donc l'E9 d'US-018 et d'US-031 ; les éléments qui en dépendent sont marqués « Sous réserve R11 » ou « Sous réserve M-RED » |
| ANT-26 | **Adresse de recette sur GitHub Pages** (DAT v0.11 §7.4, §7.5). Un dépôt n'a qu'un site Pages, déployé d'un seul tenant. Un sous-chemin (`/taskapp/recette/`) partage l'**origine** de la production (même IndexedDB, distinguée seulement par le compte de recette) et se trouve dans la **portée du service worker** de production (`/taskapp/`), dont le `navigateFallback` servirait la page de production. Options : (a) sous-chemin, avec un service worker de production dont la portée et le `navigateFallback` excluent `/recette/`, et un déploiement qui assemble les deux versions ; (b) un second dépôt public dédié à la recette (autre chemin, même origine `github.io`) ; (c) recette sur Cloudflare Pages (autre origine). | Starck | **Clos** (DAT v0.11.1 §7.4 bis) : origine de recette distincte, préfixe `VITE_ENV`, adresses dérivées de `VITE_BASE_PATH` et `VITE_APP_ORIGIN` (§9.1, §14.3) ; choix de l'origine en attente de Q-ANT26 (commanditaire) |
| ANT-27 | Nom de la variable du client OAuth Web : `VITE_GOOGLE_CLIENT_ID_WEB` (DAT DS-04) ou `VITE_GOOGLE_WEB_CLIENT_ID` (DAT §7.5, PoC, variables du dépôt). Les conventions retiennent le second (§9.1). | Starck | **Clos** : DS-04 aligné (DAT v0.11.1) |

### 17.3 Hypothèses de conception du contrôle d'explicitation (H-1 à H-7)
Elles sont appliquées dans les ST de LOT-001 ; leur propriétaire peut les modifier jusqu'à E11 sans nouvel échange (`explicitation-LOT-001.md`, contrôle final §3).

**Revue v0.4 (DEC-034)** : aucune de ces hypothèses ne dépend de la plateforme ; elles portent sur le modèle d'écriture, la fusion et les étapes Gherkin, communs à la cible et au repli. Elles sont **maintenues sans changement**. Elles ne doivent pas être confondues avec les hypothèses H-1 et H-2 de **DEC-032**, propres à la préparation du test technique, traitées au §17.4.
| Id | Hypothèse | Où elle s'applique |
|---|---|---|
| H-1 | L'information « rattachement » est `LienTacheObjectif(tacheId, E).actif` ; le contexte de la pierre tombale de E couvre les liens dont `objectifId = E` (DAT v0.10.1 §4.2.1, aligné) | `ST-socle-ecriture.md` §6.4 ; incrément 2 d'US-017 |
| H-2 | Rattachement ou placement non retenu : code `ALR-010`, variantes `rattachement` et `placement` (guide v0.2.8) ; l'élément exposé est l'enfant | Incrément 2 d'US-017 |
| H-3 | L'estimation recopiée à la suppression de la dernière sous-tâche produit une entrée `MODIFICATION_ESTIMATION`, même si avant = après | ST-US-024 |
| H-4 | À la suppression, les entrées en attente des descendants créés et non déposés, supprimés par dérivation, sont purgées (DAT v0.10.1 §4.1.5 bis, aligné) | `ST-socle-ecriture.md` §6.5 |
| H-5 | Préconditions = état ; confirmation sans préfixe : l'appareil qui a une confirmation en attente | §11.6 ; `ST-socle-ecriture.md` §12 |
| H-6 | `ALR-014` exclu de `data-a-lire`, retiré par le « Compris » de `ALR-008` | Incréments 2 et 3 d'US-017 |
| H-7 | Construction des tableaux « les tâches suivantes : » (glossaire §1) | §11.6 ; ST-US-002 §12 |

### 17.4 Décisions du commanditaire liées à la plateforme et à la distribution
| Décision | Objet | Effet sur les conventions depuis DEC-034 |
|---|---|---|
| DEC-023 | Code public, GitHub Pages possible | **Applicable** : hébergement de la PWA (§14.3) |
| DEC-027 | Clé de signature Android dans les secrets GitHub, sauvegarde hors ligne | **Repli seulement** (§19.3) ; aucune clé en cible |
| DEC-028 | Vérification des développeurs Android : compte « distribution limitée » | **Repli seulement** (§19.3) ; sans objet pour la PWA |
| DEC-029 | Protection de `main` dès la CI | **Inchangée** : activée à la fusion du rang 0 (§13.1). La liste des contrôles requis ne comporte aucun job Android en cible |
| DEC-032 H-1 | Version PC hébergée sur GitHub Pages, dépôt rendu public par le commanditaire | **Applicable et étendue** à tous les appareils : GitHub Pages reste retenu (ADR-013, §14.3) |
| DEC-032 H-2 | Deux clés de signature de test et premier passage du workflow `poc` | **Suspendue** (DEC-034, Q-PWA-5) : le workflow `poc` s'exécute sans clé et sans les jobs `apk` (entrée `android` à `false`, §19.6) |
| DEC-034 | PWA unique sous condition | Objet de la v0.4 ; §19 pour le repli |

## 18. Documents associés
- `checklist-revue-code.md` : grille de revue de code (E13).
- `modele-ST-US.md` : gabarit des spécifications techniques par US (E9).
- `dette-technique.md` : registre de la dette technique.
- `ST-socle-ecriture.md` : modèle d'écriture synchronisable (rang 0 de LOT-001) ; `ST-US-xxx.md` : spécifications par US.
- `docs/03-architecture/DAT.md` (v0.11) et `docs/03-architecture/adr/` (ADR-001 à ADR-013 ; ADR-012 remplacé sous condition par ADR-013).
- `docs/03-architecture/poc-specification.md` (v2, §15 : écarts EC-1 à EC-7, dont EC-3 et EC-4 reportés au §9.2.1).
- `docs/02-ux/guide-ergonomie.md` (v0.2.8) : tokens, états, messages, catalogue des libellés et des codes d'état (§6.6).
- `tests/features/GLOSSAIRE-ETAPES.md` (v1.4, Pepper) : vocabulaire figé des étapes Gherkin.

## 19. Repli (ADR-012), si la condition de DEC-034 échoue

**Statut : en sommeil.** Cette section ne s'applique que si la mesure M-RED ou M-PERSIST échoue sur Chrome Android (ADR-013, « Condition et repli »). Elle redevient alors applicable **pour Android seulement**, avec ADR-012, les volets « repli » du DAT v0.11 et l'annexe A du test technique v3 ; tout le reste de ce document continue de s'appliquer, au PC comme au téléphone. Elle reprend sans changement de fond les règles de la v0.3. Rien n'en est réalisé avant la décision ; la réactivation est annoncée par Jarvis et donne lieu à une v0.5 de ce document.

### 19.1 Pile complémentaire
| Domaine | Outil | Règle de version |
|---|---|---|
| Coque mobile | Capacitor ; `@capacitor-community/sqlite` ; `@capacitor/network` ; `@capacitor/local-notifications` (notifications de secours, lots ultérieurs) | Version exacte ; une mise à jour majeure de Capacitor passe par Starck |
| Construction Android | JDK 21 (Temurin), Gradle par l'enveloppe `android/gradlew` versionnée, Android SDK Build-Tools (dont `apksigner` et `zipalign`) | JDK : version majeure figée dans la CI (`actions/setup-java`) ; Gradle : fixé par `gradle-wrapper.properties` ; `compileSdk`, `targetSdk` et version des Build-Tools figés dans `android/variables.gradle` au démarrage d'E12 (ST-US-018) |

### 19.2 Organisation du code
- `android/` : projet Android généré par Capacitor puis versionné, hors artefacts, propriétés locales et clés (motifs du §9.1) ; pas d'iPhone en v1 (DEC-001).
- `src/composition/capacitor.ts` : composition Android, à côté de `web.ts` (DS-02, texte antérieur).
- `tests/integration/` : `DepotLocalSqlite` sur `node:sqlite`.
- Versionnés en plus : `android/` (hors artefacts, propriétés locales et clés). Non versionnés en plus : clés de signature, APK et AAB.

### 19.3 Signature, nom de paquet et vérification des développeurs
- **Clé de signature Android** (ADR-012, DEC-027, verbatim « Reco ») : une clé de publication par application (`fr.donejuan.app`, `fr.donejuan.app.recette`), RSA 4096 bits, PKCS12, 30 ans. Elle est conservée **dans les secrets chiffrés de GitHub Actions** (`ANDROID_KEYSTORE_<ENV>_B64`, `ANDROID_KEYSTORE_<ENV>_PASSWORD`, `ANDROID_KEY_<ENV>_ALIAS`, `ANDROID_KEY_<ENV>_PASSWORD`, avec `<ENV>` = `RELEASE` pour la production ou `RECETTE` ; même forme que les secrets `POC_*` du PoC), avec une **sauvegarde hors ligne chez le commanditaire** (support amovible et gestionnaire de mots de passe). Ces secrets ne sont exposés qu'au flux `publication.yml` (environnements GitHub `production` et `recette`, §19.6). La clé de débogage reste réservée au développement. Aucune clé n'est créée par un agent sans l'accord explicite du commanditaire, relayé par Jarvis ; la création est différée tant que la PWA unique n'est pas infirmée (Q-PWA-5).
- **Nom de paquet Android** : `fr.donejuan.app` (production), `fr.donejuan.app.recette` (recette, coexiste avec la production) ; la preuve de concept utilise `fr.donejuan.poc` (`poc/capacitor.config.ts`). Le nom de paquet ne change plus après la première installation (ADR-012 : même paquet, même clé pour toute mise à jour).
- **Vérification des développeurs Android** (DEC-028, verbatim « Reco ») : compte gratuit « distribution limitée » lié au compte Google du commanditaire, à créer par lui avant l'échéance française de 2027 ; le nom de paquet et l'empreinte de la clé y sont enregistrés. Aucun impact sur le code.
- **Client OAuth Android** : configuration par variante de build ; client restreint au nom de paquet et à l'empreinte SHA-1 (DAT §4.1.2, *repli*). Le test R1 (visibilité croisée des fichiers `drive.file` entre clients Android et Web) redevient un prérequis de l'E9 d'US-017 ; la réserve R1 du §10.3 revit.
- Référentiel de sécurité complémentaire : OWASP MASVS ; permissions Android minimales (CR-58 de `checklist-revue-code.md`).

### 19.4 Adaptateurs Android
- **`DepotLocalSqlite`** : passe la **même suite de contrat** que `DepotLocalDexie` (§11.10) ; il s'appuie sur une interface interne d'exécution SQL, implémentée par le module Capacitor en production et par `node:sqlite` en test. Un fichier SQLite par compte, nommé d'après l'empreinte SHA-256 du `sub` (§9.3).
- **Horloge** : sur Android, l'horloge monotone ancrée sur `SystemClock.elapsedRealtime` et l'identifiant de démarrage sont fournis par l'extension native prévue au DAT §6.4 ; `HorlogeSysteme` les utilise sur cette plateforme.
- **Authentification** : Credential Manager et AuthorizationClient (Google Play services), renouvellement silencieux du jeton ; aucun jeton de rafraîchissement manipulé par notre code ; jeton en mémoire uniquement, jamais dans `@capacitor/preferences`.
- **Réseau** : `@capacitor/network` derrière `EtatReseau`.
- **Notifications de secours** (Q-38 b) : `@capacitor/local-notifications` derrière `Notifieur`, si le commanditaire les réactive.
- Importations : `@capacitor/*` est admis dans `src/*/infrastructure/` et `src/composition/capacitor.ts` seulement (`no-restricted-imports`, dependency-cruiser).

### 19.5 Versions Android
`versionName` = `X.Y.Z` ; `versionCode` = `X × 10 000 + Y × 100 + Z` (donc `Y` et `Z` < 100), calculé par `scripts/version-android.mjs` à partir de `package.json` et injecté dans `android/app/build.gradle` à la construction. Le `versionCode` doit être **strictement supérieur** à celui de la dernière version publiée (`derniere-version.json`) ; une version défectueuse se corrige par une nouvelle version, jamais par un retour arrière.

### 19.6 Intégration continue et publication
- **Contrôle `build`** (§14.1) : en plus de la PWA, APK de debug Android (`cap sync android`, `./gradlew assembleDebug`, JDK 21), à partir du rang 12 (US-018) ; avant, PWA seule.
- **`.github/workflows/publication.yml`** (ADR-012, DAT §7.4, §7.5) : remplace `deploiement.yml` (§14.3), dont il reprend les étapes PWA. Déclenché par une étiquette `v*` **posée sur un commit de `main`** (le flux vérifie l'appartenance du commit à `main` et s'arrête sinon) ; aussi déclenchable à la main pour la **recette** (`workflow_dispatch`, environnement `recette`). Étapes : (1) tests et contrôles du §14.1 ; (2) construction de la PWA et déploiement sur l'hébergement statique ; (3) construction de l'APK de publication (`./gradlew assembleRelease`) ; (4) décodage de la clé depuis les secrets de l'environnement (fichier temporaire hors du dépôt, supprimé en fin de job), signature ; (5) **`apksigner verify --print-certs`** et comparaison de l'empreinte SHA-256 du certificat avec la variable du dépôt `ANDROID_CERT_SHA256_<ENV>` (échec si elle diffère) ; (6) contrôle que le `versionCode` est strictement supérieur à celui de `derniere-version.json` déjà publié ; (7) publication dans `android/` de l'hébergement : `done-juan-<version>.apk` (recette : `done-juan-recette-<version>.apk`), son empreinte SHA-256, `derniere-version.json` (`versionName`, `versionCode`, `schemaVersion`, URL, empreinte, date) et la page `android/index.html` (lien, empreinte, procédure d'installation). Permissions : `contents: read`, plus celles du déploiement de l'hébergeur. Les secrets de signature ne sont accessibles qu'aux environnements GitHub `production` et `recette`, protégés (approbation du commanditaire pour `production`).
- **Ordre de mise en place** : rang 12 (US-018, BEN-13) : job `build` Android, `publication.yml`, environnements et secrets. La clé de production n'est créée qu'au rang 12, par le commanditaire ou avec son accord (DEC-027).
- **Workflow `poc`** (`.github/workflows/poc.yml`, préparation du test technique) : les jobs `apk` ne s'exécutent que si l'entrée booléenne `android` vaut `true` (par défaut `false`, DEC-034 Q-PWA-4) ; déclenchement par `workflow_dispatch` uniquement.
