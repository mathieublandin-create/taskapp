# Grille de revue de code (E13)

> **Version 0.3 — 2026-10-22 — Anthony.** Grille appliquée à chaque US (ou incrément d'US) à l'étape E13 du workflow, et à chaque correction d'anomalie (`ANO-xxx`) avant sa nouvelle recette. Elle découle de `conventions.md` (v0.2 ; points CR-51, CR-52 et CR-58 alignés sur la v0.4, DAT v0.11, ADR-013).

## Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Création |
| 0.2 | 2026-10-21 | Anthony | Alignement sur `conventions.md` v0.2 : renvois de sections, *pull request* GitHub, fuseau de référence, modèles de vue, catalogue, OAuth sans jeton de rafraîchissement, RG-058, steps et tags. Nouveaux points CR-16, CR-17, CR-34, CR-46, CR-68. |
| 0.3 | 2026-10-22 | Anthony | Alignement de CR-51, CR-52 et CR-58 sur `conventions.md` v0.4 (DEC-034, ADR-013) : PWA unique, retour de redirection OAuth (§9.2.1, RED-01 à RED-08), points Android renvoyés au repli (§19). |

## 1. Déroulement

### 1.1 Entrées exigées de Benjamin
Une revue n'est ouverte que si la demande contient :
1. l'US, la branche `us/US-xxx-<slug>` (ou `us/US-xxx-<n>-<slug>` pour un incrément) et la *pull request* GitHub vers la branche de lot ;
2. le résumé des changements, fichier par fichier ou composant par composant ;
3. les écarts éventuels à la ST-US et l'accord d'Anthony obtenu pour chacun ;
4. la dette déclarée (proposition d'entrée `DT-xxx`) ;
5. le lien vers l'exécution GitHub Actions de la *pull request* (unitaires et Cucumber dans les trois fuseaux, couverture, lint, types, architecture, catalogue, tags, IHM, sécurité, build) ;
6. la liste des tests ajoutés par Benjamin.

Une demande incomplète est renvoyée sans revue. Ce renvoi ne compte pas comme une itération au sens de la règle anti-boucle.

### 1.2 Contrôle préalable (bloquant)
- [ ] La DoD technique (`conventions.md` §15) est cochée par Benjamin dans la *pull request*.
- [ ] Les contrôles GitHub Actions requis de la *pull request* sont verts (`conventions.md` §14.1).
- [ ] La branche est rebasée sur la branche de lot.

Si l'un de ces points échoue, le verdict est **Changements requis**, sans examen détaillé.

### 1.3 Remarques
- Identifiant : `RC-US-xxx-n`, numérotation continue sur toute la vie de l'US (une nouvelle revue ne recommence pas à 1).
- Chaque remarque est **localisée** (`chemin/fichier:ligne` ou `chemin/fichier:ligne-début-ligne-fin`), cite le critère de la grille (`CR-xx`) et, si possible, la règle (`RCD-xx`, section de `conventions.md`, section de la ST-US, ADR).
- Chaque remarque est **actionnable** : elle énonce ce qui est attendu, pas seulement ce qui ne va pas.
- Gravité :

| Gravité | Définition | Effet sur le verdict |
|---|---|---|
| **Bloquante** | Faille de sécurité, fuite de jeton ou de donnée personnelle, risque de perte ou de corruption de données, test affaibli ou supprimé, non-conformité au DAT | Changements requis |
| **Majeure** | Violation d'une règle impérative (« doit »), écart non validé à la ST-US, critère d'acceptation non couvert, duplication de logique métier, erreur mal traitée | Changements requis |
| **Mineure** | Lisibilité, nommage, structure locale ; violation d'une recommandation (« devrait ») sans justification | Changements requis, sauf si Anthony accepte de la convertir en dette `DT-xxx` |
| **Suggestion** | Amélioration facultative | Sans effet ; Benjamin peut la refuser sans justification |

### 1.4 Verdict
- **Approuvé** : aucune remarque Bloquante, Majeure ou Mineure ouverte. L'US passe au statut **En recette** et la branche est fusionnée dans la branche de lot.
- **Changements requis** : retour en E12 avec la liste des remarques ouvertes.

### 1.5 Nouvelle revue
- Elle porte **uniquement** sur les remarques ouvertes et sur le différentiel introduit depuis la revue précédente.
- Aucune nouvelle exigence n'est introduite sur du code déjà approuvé, sauf défaut **Bloquant**.
- Statut de chaque remarque : `Ouverte`, `Corrigée`, `Contestée` (justification de Benjamin), `Acceptée en dette` (`DT-xxx`), `Close`.
- **Règle anti-boucle** : une même remarque ne fait pas plus de 2 allers-retours. Au troisième, Anthony signale le sujet à Jarvis, qui demande un arbitrage. Une remarque déjà arbitrée ne peut plus être soulevée.

### 1.6 Compte rendu
Chaque revue produit un compte rendu `docs/04-specification-technique/revues/REVUE-US-xxx.md`, une section par passage, selon le modèle du §3.

## 2. Grille

### A. Conformité à la spécification
| Id | Point de contrôle |
|---|---|
| CR-01 | Les composants, fichiers, interfaces et signatures sont ceux de la ST-US ; les écarts ont été validés au préalable par Anthony. |
| CR-02 | Le modèle de données et les migrations sont conformes à la ST-US ; les migrations sont versionnées, ordonnées et testées sur des données de la version précédente. |
| CR-03 | Les patterns imposés par la ST-US sont appliqués. |
| CR-04 | Chaque critère d'acceptation de l'US est couvert par un scénario Cucumber passant ; chaque RG de l'US est implémentée et référencée dans le code. |
| CR-05 | Aucun comportement non spécifié n'est ajouté (pas de fonctionnalité « en plus »). |
| CR-06 | Conformité au DAT et aux ADR : technologies, flux, portées OAuth, format des données dans l'espace de l'utilisateur. Tout écart est remonté à Starck. |
| CR-07 | Conformité aux maquettes et au guide d'ergonomie pour les éléments d'IHM : écrans, libellés du catalogue, états vide, chargement, erreur et hors ligne. Le contrôle fin reste du ressort de Steeve en E14. |

### B. Architecture et conception
| Id | Point de contrôle |
|---|---|
| CR-10 | Respect des couches : le domaine est pur (aucune E/S, horloge, aléatoire, SDK, framework) ; l'application ne dépend pas de l'infrastructure ; la présentation n'appelle pas l'infrastructure. Les tests d'architecture passent. |
| CR-11 | Les interactions Google passent par les ports ; aucun type du SDK ni code HTTP ne sort d'un adaptateur. |
| CR-12 | Les cas d'usage orchestrent sans contenir de règle métier. |
| CR-13 | SOLID : une responsabilité par élément, ports étroits, dépendances injectées, aucun état global mutable. |
| CR-14 | Les frontières entre contextes métier sont respectées (pas d'accès aux éléments internes d'un autre contexte). |
| CR-15 | Les traitements planifiés séparent décision pure, cas d'usage et déclenchement ; ils sont idempotents. |
| CR-16 | Aucune logique de décision dans un composant React ou un magasin Zustand : elle est dans un modèle de vue pur, testé (`conventions.md` §2.2, §4.3). |
| CR-17 | Toute écriture métier passe par un cas d'usage, en une transaction `DepotLocal`, avec son entrée de journal métier (RG-050) ; seul le contexte `synchronisation` manipule la représentation CRDT et produit les `Hlc` (`conventions.md` §10.1). |

### C. Lisibilité et maintenabilité
| Id | Point de contrôle |
|---|---|
| CR-20 | Nommage conforme au glossaire code et aux règles de forme (`conventions.md` §5) ; tout nouveau terme métier est ajouté au glossaire. |
| CR-21 | Fonctions courtes, complexité et nombre de paramètres dans les seuils (RCD-01, RCD-02). |
| CR-22 | Aucune duplication de logique (RCD-04) ; aucune abstraction prématurée. |
| CR-23 | Aucun nombre ou texte magique (RCD-03) ; constantes nommées et référencées. |
| CR-24 | Aucun code mort, code commenté, journalisation de débogage, `TODO` sans `DT-xxx` (RCD-05, RCD-06). |
| CR-25 | Commentaires utiles (le pourquoi) ; références aux RG présentes (RCD-12). |
| CR-26 | Typage strict sans échappatoire (`any`, `!`, `as` hors constructeurs de types marqués, `@ts-ignore`) ; unions exhaustives avec `assertNever` ; absence de valeur explicite ; types marqués plutôt que primitifs (RCD-08, RCD-09, `conventions.md` §6.2). |
| CR-27 | Invariants vérifiés à la construction ; immuabilité respectée (RCD-07, RCD-10). |
| CR-28 | Dépendances tierces ajoutées justifiées : besoin, maintenance, licence, sécurité (RCD-16). |

### D. Temps, durées et hasard
| Id | Point de contrôle |
|---|---|
| CR-30 | Aucune lecture directe de l'horloge, du fuseau, de l'aléatoire système ni de minuterie (`setTimeout`, `setInterval`) hors des adaptateurs autorisés (`conventions.md` §7.2, §7.4, §10.2). |
| CR-31 | Durées en minutes entières (`Duree`), jamais en nombre à virgule ; pas de 30 min respecté là où la RG l'exige. |
| CR-32 | Tout calcul calendaire se fait dans `FUSEAU_REFERENCE` (Europe/Paris), par les fonctions de `commun/domaine/temps` ; date-fns n'est appelé qu'avec le contexte `tz(FUSEAU_REFERENCE)` ; le jour d'une action est calculé à partir de l'instant puis persisté ; les dates civiles saisies ne sont jamais converties en instant ; le fuseau de l'appareil ne sert qu'à la mention RG-054 (`conventions.md` §7.1 à §7.3). |
| CR-33 | Semaine ISO (lundi–dimanche) utilisée pour la vélocité et les historiques. |
| CR-34 | Identifiants UUID v7 produits par `GenerateurIdentifiants`, typés par entité ; aucune règle métier fondée sur l'ordre des identifiants (`conventions.md` §7.5). |

### E. Gestion des erreurs
| Id | Point de contrôle |
|---|---|
| CR-40 | Erreurs métier typées et présentes dans les signatures ; alertes métier distinguées des erreurs. |
| CR-41 | Erreurs techniques traduites par les adaptateurs ; comportement de chaque cas conforme à la ST-US (nouvelle tentative, file d'attente, hors ligne, reconnexion). |
| CR-42 | Aucune capture silencieuse ni capture globale hors frontière ; aucun contrôle de flux nominal par erreur. |
| CR-43 | Nouvelles tentatives limitées aux opérations idempotentes, avec attente exponentielle et paramètres nommés ; aucune attente réelle dans les tests. |
| CR-44 | Messages et états affichés issus du catalogue (`catalogue.fr.ts`), avec code stable ; codes produits par les modèles de vue ; aucun détail technique affiché (`conventions.md` §8.5). |
| CR-45 | Aucune perte de donnée possible en cas d'erreur réseau, de révocation, d'interruption ou de conflit (ENF-06) ; toute valeur écartée est signalée ; `deposeJusquA` n'avance qu'après confirmation du Drive ; une erreur transitoire n'est jamais prise pour une absence de données. |
| CR-46 | Format Drive (RG-044, RG-058) : validation Zod sans `.strict()` et empreinte vérifiées avant toute fusion ; `SCHEMA_VERSION` inchangé pour une évolution compatible ; en consultation seule, aucune écriture Drive ni effacement local ; tests de lecture, de coexistence et de consultation seule présents si le format évolue (`conventions.md` §10.3). |

### F. Sécurité et données personnelles
| Id | Point de contrôle |
|---|---|
| CR-50 | Aucun secret, identifiant confidentiel, jeton ni compte réel dans le code, les tests, la configuration versionnée ou l'historique ; la détection de secrets est verte. |
| CR-51 | Jeton d'accès en mémoire uniquement (`CoffreJetonsMemoire`) ; aucun jeton de rafraîchissement manipulé ; aucun jeton écrit dans une URL (en-tête `Authorization` seulement) ; aucun usage de `localStorage` ou `sessionStorage` pour une donnée d'authentification, sauf la mémorisation du seul `state` dans le fichier autorisé (RED-04) ; *repli* : ni `@capacitor/preferences` (`conventions.md` §9.2, §9.2.1, §19.4, DS-06). |
| CR-52 | Flux OAuth conforme au DAT (DS-04, ADR-004, ADR-013, DAT §4.1.7) : client Web public sans secret ; URI de redirection construite en un seul point ; retour de redirection conforme à RED-01 à RED-08 (`conventions.md` §9.2.1) : fragment effacé par la première instruction de `main.tsx`, avant tout rendu et toute requête, dans tous les cas ; `state` de 128 bits, à usage unique, valable 10 min, rejet s'il est absent, inconnu, rejoué ou expiré ; jeton ni journalisé ni persisté ; `no-referrer` ; une seule redirection automatique par ouverture ; Google Identity Services chargé à la demande et sans blocage ; portées accordées vérifiées ; compte identifié par `sub` ; portées inchangées ou évolution validée par Starck. |
| CR-53 | Déconnexion (RG-043) : jeton et compte actif effacés, données locales conservées ; suppression des données de l'appareil (RG-055) : dépôt préalable, puis suppression complète de l'espace du compte ; espace local nommé par empreinte du `sub` (`conventions.md` §9.3). |
| CR-54 | Journalisation conforme à `conventions.md` §9.4 : port `JournalTechnique` uniquement, aucune donnée personnelle ni jeton ; masquage défensif en place. |
| CR-55 | Validation des entrées : saisies, contenu lu dans l'espace de l'utilisateur, réponses des API ; échappement de l'affichage ; aucune évaluation dynamique de code ; liens profonds validés. |
| CR-56 | Minimisation : seules les données nécessaires sont lues dans l'agenda et écrites dans les événements ; aucune transmission à un tiers. |
| CR-57 | Analyses SAST et SCA vertes ; aucune vulnérabilité haute ou critique introduite. |
| CR-58 | Points OWASP ASVS de la PWA, sur tous les appareils : CSP du DAT §7.1 (navigation de redirection vers `accounts.google.com` comprise), `Referrer-Policy: no-referrer`, aucune ressource de CDN, aucun `dangerouslySetInnerHTML` ni évaluation dynamique, transactions d'écriture IndexedDB en durabilité stricte (`conventions.md` §10.1). *Repli* (`conventions.md` §19) : MASVS et permissions Android minimales. |

### G. Tests
| Id | Point de contrôle |
|---|---|
| CR-60 | Les tests fournis par Anthony sont **intacts** (comparaison avec le commit E10) ; toute modification est couverte par un accord écrit tracé. |
| CR-61 | Aucun test affaibli (`conventions.md` §11.5). |
| CR-62 | Tous les tests sont passants, sans régression ; Cucumber en mode strict (profils `default` et `ihm`) ; exécution verte dans les trois fuseaux de la CI. |
| CR-63 | Seuils de couverture atteints, sans baisse sur les fichiers modifiés ; exclusions justifiées. |
| CR-64 | Step definitions minces, sans logique métier, placées dans le fichier de thème prévu par la ST-US (`tests/steps/<contexte>/<theme>.steps.ts`), enregistrées par les fonctions de préfixe de `tests/support/prefixes.ts` quand elles portent un appareil, conformes au glossaire d'étapes de Pepper, utilisant les types de paramètres communs, sans doublon ni définition inutilisée (`conventions.md` §11.7). |
| CR-65 | Tests ajoutés par Benjamin conformes aux règles d'écriture (nommage, Préparer / Agir / Vérifier, déterminisme, assertions précises) et utiles (pas de test sans assertion pertinente). |
| CR-66 | Doublures Google conformes à leur suite de contrat ; les cas d'erreur prévus par la ST-US sont simulés et testés. |
| CR-67 | Cas temporels applicables testés selon la ST-US : minuit de Paris, changements d'heure PT-16, semaine ISO, appareil hors du fuseau de Paris (`conventions.md` §11.9). |
| CR-68 | Tags respectés : `@ihm`, `@lent`, `@google-reel`, `@recette` conformes au `.feature` ; aucun `@wip` ; aucun appel à une API Google réelle en CI (`conventions.md` §11.8). |

### H. Dette et livraison
| Id | Point de contrôle |
|---|---|
| CR-70 | Toute dette introduite est déclarée, qualifiée et inscrite au registre (`dette-technique.md`) avec un plan de remboursement. |
| CR-71 | Aucune dette non déclarée détectée en revue (sinon : remarque, puis inscription au registre). |
| CR-72 | Commits conformes à la convention ; commits atomiques ; aucun fichier généré, local ou secret versionné. |
| CR-73 | Documentation technique et glossaire code à jour. |

## 3. Modèle de compte rendu

```markdown
# Revue de code — US-xxx <titre>

## Passage n — AAAA-MM-JJ
- Branche / commit : `us/US-xxx-<slug>` @ <hash>
- ST-US de référence : ST-US-xxx v<x.y>
- Entrées complètes (§1.1) : oui / non
- Contrôle préalable (§1.2) : conforme / non conforme (détail)

### Remarques
| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US-xxx-1 | Majeure | CR-30 | `chemin/fichier:42` | Lecture directe de l'horloge système dans le domaine | Recevoir l'instant en paramètre depuis le cas d'usage, qui l'obtient du port `Horloge` | Ouverte | 1 |

### Dette
| Id proposé | Description | Décision |
|---|---|---|

### Verdict : Approuvé / Changements requis
Synthèse en 3 lignes au plus.
```
