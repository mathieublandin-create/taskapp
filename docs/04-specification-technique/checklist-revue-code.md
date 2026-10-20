# Grille de revue de code (E13)

> **Version 0.1 — 2026-10-20 — Anthony.** Grille appliquée à chaque US à l'étape E13 du workflow, et à chaque correction d'anomalie (`ANO-xxx`) avant sa nouvelle recette. Elle découle de `conventions.md` v0.1 ; les points qui dépendent de la stack seront précisés après la parution du DAT (choix de stack).

## Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Anthony | Création |

## 1. Déroulement

### 1.1 Entrées exigées de Benjamin
Une revue n'est ouverte que si la demande contient :
1. l'US, la branche `us/US-xxx-<slug>` et le commit soumis ;
2. le résumé des changements, fichier par fichier ou composant par composant ;
3. les écarts éventuels à la ST-US et l'accord d'Anthony obtenu pour chacun ;
4. la dette déclarée (proposition d'entrée `DT-xxx`) ;
5. la sortie des commandes : tests unitaires, Cucumber, couverture, lint, types, règles d'architecture, analyses de sécurité ;
6. la liste des tests ajoutés par Benjamin.

Une demande incomplète est renvoyée sans revue. Ce renvoi ne compte pas comme une itération au sens de la règle anti-boucle.

### 1.2 Contrôle préalable (bloquant)
- [ ] La DoD technique (`conventions.md` §13) est cochée par Benjamin.
- [ ] La CI de la branche est verte.
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

### C. Lisibilité et maintenabilité
| Id | Point de contrôle |
|---|---|
| CR-20 | Nommage conforme au glossaire code et aux règles de forme (`conventions.md` §4) ; tout nouveau terme métier est ajouté au glossaire. |
| CR-21 | Fonctions courtes, complexité et nombre de paramètres dans les seuils (RCD-01, RCD-02). |
| CR-22 | Aucune duplication de logique (RCD-04) ; aucune abstraction prématurée. |
| CR-23 | Aucun nombre ou texte magique (RCD-03) ; constantes nommées et référencées. |
| CR-24 | Aucun code mort, code commenté, journalisation de débogage, `TODO` sans `DT-xxx` (RCD-05, RCD-06). |
| CR-25 | Commentaires utiles (le pourquoi) ; références aux RG présentes (RCD-12). |
| CR-26 | Typage strict sans échappatoire ; absence de valeur explicite ; objets-valeurs plutôt que primitifs (RCD-08, RCD-09). |
| CR-27 | Invariants vérifiés à la construction ; immuabilité respectée (RCD-07, RCD-10). |
| CR-28 | Dépendances tierces ajoutées justifiées : besoin, maintenance, licence, sécurité (RCD-16). |

### D. Temps, durées et hasard
| Id | Point de contrôle |
|---|---|
| CR-30 | Aucune lecture directe de l'horloge, du fuseau ou de l'aléatoire système hors des adaptateurs. |
| CR-31 | Durées en minutes entières (`Duree`), jamais en nombre à virgule ; pas de 30 min respecté là où la RG l'exige. |
| CR-32 | Aucune conversion `Instant` ↔ `DateCalendaire` sans fuseau explicite ; la date calendaire d'une saisie est persistée telle quelle. |
| CR-33 | Semaine ISO (lundi–dimanche) utilisée pour la vélocité et les historiques. |

### E. Gestion des erreurs
| Id | Point de contrôle |
|---|---|
| CR-40 | Erreurs métier typées et présentes dans les signatures ; alertes métier distinguées des erreurs. |
| CR-41 | Erreurs techniques traduites par les adaptateurs ; comportement de chaque cas conforme à la ST-US (nouvelle tentative, file d'attente, hors ligne, reconnexion). |
| CR-42 | Aucune capture silencieuse ni capture globale hors frontière ; aucun contrôle de flux nominal par erreur. |
| CR-43 | Nouvelles tentatives limitées aux opérations idempotentes, avec attente exponentielle et paramètres nommés ; aucune attente réelle dans les tests. |
| CR-44 | Messages utilisateur issus du catalogue, avec code stable ; aucun détail technique affiché. |
| CR-45 | Aucune perte de donnée possible en cas d'erreur réseau, de révocation, d'interruption ou de conflit (ENF-06) ; toute valeur écartée est signalée. |

### F. Sécurité et données personnelles
| Id | Point de contrôle |
|---|---|
| CR-50 | Aucun secret, identifiant confidentiel, jeton ni compte réel dans le code, les tests, la configuration versionnée ou l'historique ; la détection de secrets est verte. |
| CR-51 | Jetons OAuth uniquement dans le `CoffreJetons` ; jamais en base locale en clair, dans l'espace de l'utilisateur, une URL, un journal, un message d'erreur. |
| CR-52 | Flux OAuth conforme au DAT : PKCE, `state`, URI de redirection ; portées inchangées ou évolution validée par Starck. |
| CR-53 | Déconnexion et révocation : jetons effacés, révocation côté Google si prévue, données locales traitées selon la spécification. |
| CR-54 | Journalisation conforme à `conventions.md` §8.4 : aucune donnée personnelle ni jeton ; masquage défensif en place. |
| CR-55 | Validation des entrées : saisies, contenu lu dans l'espace de l'utilisateur, réponses des API ; échappement de l'affichage ; aucune évaluation dynamique de code ; liens profonds validés. |
| CR-56 | Minimisation : seules les données nécessaires sont lues dans l'agenda et écrites dans les événements ; aucune transmission à un tiers. |
| CR-57 | Analyses SAST et SCA vertes ; aucune vulnérabilité haute ou critique introduite. |
| CR-58 | Points OWASP pertinents pour la plateforme (ASVS pour le web, MASVS pour le mobile) : stockage local, communications chiffrées, permissions minimales de l'application. |

### G. Tests
| Id | Point de contrôle |
|---|---|
| CR-60 | Les tests fournis par Anthony sont **intacts** (comparaison avec le commit E10) ; toute modification est couverte par un accord écrit tracé. |
| CR-61 | Aucun test affaibli (`conventions.md` §9.5). |
| CR-62 | Tous les tests sont passants, sans régression ; Cucumber en mode strict ; exécution multi-fuseaux verte. |
| CR-63 | Seuils de couverture atteints, sans baisse sur les fichiers modifiés ; exclusions justifiées. |
| CR-64 | Step definitions minces, sans logique métier, placées dans le fichier de domaine prévu par la ST-US, sans doublon. |
| CR-65 | Tests ajoutés par Benjamin conformes aux règles d'écriture (nommage, Préparer / Agir / Vérifier, déterminisme, assertions précises) et utiles (pas de test sans assertion pertinente). |
| CR-66 | Doublures Google conformes à leur suite de contrat ; les cas d'erreur prévus par la ST-US sont simulés et testés. |
| CR-67 | Cas temporels applicables testés (minuit, changement d'heure, semaine ISO, fuseaux) selon la ST-US. |

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
