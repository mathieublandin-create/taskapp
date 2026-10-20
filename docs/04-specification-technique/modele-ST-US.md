# Modèle de spécification technique d'US (ST-US)

> **Version 0.1 — 2026-10-20 — Anthony.** Gabarit des documents `docs/04-specification-technique/ST-US-xxx.md`, rédigés à l'étape **E9** du workflow (conception détaillée).
>
> **Objectif.** Une ST-US donne à Benjamin **tous** les entrants nécessaires pour réaliser l'US **sans interprétation**. Si une section ne peut pas être remplie sans hypothèse, la conception n'est pas terminée : la question part vers Pepper (`Q-US-xxx-n`, E8) ou vers Starck (architecture), via Jarvis.
>
> **Mode d'emploi.**
> - Copier ce fichier sous le nom `ST-US-xxx.md`, puis remplacer chaque `<…>`.
> - Aucune section n'est supprimée. Une section sans objet porte la mention « Sans objet » et une justification d'une ligne.
> - Les signatures sont écrites dans le langage retenu par le DAT. **En attente du DAT (choix de stack)** : jusqu'à sa parution, elles sont écrites en notation neutre : `nomFonction(param: Type, …) → TypeRetour | ErreurA | ErreurB`.
> - Les termes respectent le glossaire code (`conventions.md` §4.2). Tout nouveau terme y est ajouté.
> - La checklist de complétude (§17) est cochée avant la revue de lancement (E11).

---

# ST-US-xxx — <Titre de l'US>

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-xxx](../01-specification-fonctionnelle/user-stories/US-xxx-<titre>.md), version <x.y> |
| Lot | [LOT-xxx](../lots/LOT-xxx.md) — rang de réalisation : <n> / <total> |
| Fichier `.feature` | [`tests/features/US-xxx-<titre>.feature`](../../tests/features/US-xxx-<titre>.feature), version du <date> |
| RG couvertes | RG-xxx, RG-yyy |
| ENF concernées | ENF-xx |
| DAT / ADR de référence | DAT v<x.y> ; ADR-xxx, ADR-yyy |
| Maquettes | ECR-xxx, ECR-yyy (guide d'ergonomie v<x.y>) |
| Questions `Q-US-xxx-n` traitées | Q-US-xxx-1 (réponse du <date>), … |
| Version de la ST | <x.y> |
| Statut | Brouillon / Prête pour E10 / Présentée en E11 / Réalisée |
| Auteur | Anthony |
| Branche Git | `us/US-xxx-<slug>` créée depuis `lot/LOT-xxx-<slug>` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | <AAAA-MM-JJ> | Anthony | Création |

## 1. Résumé technique

- **Ce que l'US change**, en 3 à 5 lignes, du point de vue technique.
- **Hors périmètre** : ce que Benjamin ne doit **pas** faire dans cette US (et l'US qui le traitera).
- **Prérequis** : US du lot déjà réalisées dont celle-ci dépend ; éléments techniques qui doivent exister.

## 2. Traçabilité

### 2.1 Critères d'acceptation → scénarios → tests
| Critère d'acceptation | Scénario(s) `.feature` | RG | Tests unitaires (§13) | Composants (§3) |
|---|---|---|---|---|
| CA-1 : <énoncé court> | « <titre du scénario> » | RG-xxx | UT-US-xxx-01, UT-US-xxx-02 | `<Composant>` |

### 2.2 Règles de gestion → implémentation
| RG | Énoncé résumé | Élément de domaine qui l'implémente | Tests |
|---|---|---|---|
| RG-xxx | <…> | `<contexte>/domaine/<Element>.<fonction>` | UT-US-xxx-nn |

## 3. Composants et fichiers

> Chemins conformes à l'arborescence du DAT (`conventions.md` §3). Un fichier = un concept principal.

| # | Fichier | Couche | Action | Responsabilité | Dépend de |
|---|---|---|---|---|---|
| 1 | `<chemin>` | Domaine | Créer | <…> | — |
| 2 | `<chemin>` | Application | Créer | Cas d'usage `<Nom>` | 1, port `<Port>` |
| 3 | `<chemin>` | Infrastructure | Modifier | <…> : <nature précise de la modification> | <…> |
| 4 | `<chemin>` | Présentation | Créer | Écran ECR-xxx | 2 |
| 5 | `<chemin>` | Composition | Modifier | Enregistrement de `<Nom>` | 2, 3 |

**Fichiers qui ne doivent pas être modifiés** dans cette US : <liste, si utile>.

## 4. Interfaces et signatures

### 4.1 Domaine
```text
<TypeOuEntite>
  champs : <nom>: <Type> — <contrainte / invariant>
  construire(<params>) → <TypeOuEntite> | <ErreurMetier>
  <fonction>(<params>) → <Retour>
```
Invariants vérifiés à la construction : <liste>.

### 4.2 Application — cas d'usage
| Cas d'usage | Entrée (commande ou requête) | Sortie | Erreurs possibles | Ports utilisés | Effets de bord |
|---|---|---|---|---|---|
| `<NomCasUsage>` | `<Commande> { champ: Type, … }` | `<Resultat> { …, alertes: Alerte[] }` | `<ErreurA>`, `<ErreurB>` | `Horloge`, `<Depot>` | <persistance, mise en file de synchronisation, événement d'agenda…> |

Séquence nominale, pas à pas :
1. <…>
2. <…>

### 4.3 Ports (nouveaux ou modifiés)
```text
<NomPort>
  <operation>(<params>) → <Retour> | <ErreurPort>
```
Contrat : préconditions, postconditions, idempotence, comportement en erreur. La suite de contrat associée figure au §13.

### 4.4 Adaptateurs
| Adaptateur | Port | Technologie / API | Points d'attention |
|---|---|---|---|
| `<Nom>` | `<Port>` | <…> | <pagination, quotas, mapping, idempotence> |

### 4.5 Présentation
| Écran / composant | Maquette | Données affichées | Actions → cas d'usage | États à gérer |
|---|---|---|---|---|
| <…> | ECR-xxx | <…> | <bouton> → `<CasUsage>` | vide, chargement, erreur, hors ligne, accès Google perdu |

Libellés et messages : codes du catalogue (`ERR-…`, `ALR-…`) et textes exacts issus de l'US ou de la maquette.
Accessibilité : <exigences du guide d'ergonomie applicables>.

## 5. Modèle de données et migrations

### 5.1 Modèle
| Entité / document | Champ | Type | Obligatoire | Contrainte | Valeur par défaut | Remarque |
|---|---|---|---|---|---|---|
| <…> | <…> | `Duree` (minutes entières) | Oui | multiple de 30 (RG-028) | — | <…> |

Représentations concernées : stockage local ; données dans l'espace de l'utilisateur (format DS-10) ; événements Google Calendar (champs utilisés, marquage applicatif).

### 5.2 Migrations
| Version de schéma | De → vers | Opération | Données existantes | Réversibilité | Test |
|---|---|---|---|---|---|
| <n> | <n-1> → <n> | <…> | <transformation exacte> | <oui / non, justification> | UT-US-xxx-nn |

Compatibilité entre appareils : comportement d'une version précédente de l'application, installée sur l'autre appareil, face aux nouvelles données (selon DS-10).

## 6. Règles et algorithmes

Pour chaque règle non triviale : pseudo-code **déterministe** ou table de décision, avec les cas limites.

```text
<nomFonction>(<params>):
  1. …
  2. …
```

| Condition 1 | Condition 2 | Résultat |
|---|---|---|
| <…> | <…> | <…> |

Temps et fuseaux : <fuseau de référence, conversion `Instant` ↔ `DateCalendaire`, semaine ISO, cas de changement d'heure>.
Hasard : <utilisation de `SourceAleatoire`, propriété garantie>.

## 7. Intégration Google

> « Sans objet » si l'US ne touche pas Google.

| Opération | Port | Portée OAuth requise | Données envoyées / lues | Idempotence | Erreurs traitées |
|---|---|---|---|---|---|
| <…> | `AgendaGoogle` | <portée, déjà accordée ou nouvelle> | <champs exacts> | <identifiant déterministe, écriture conditionnelle> | <…> |

- Nouvelle portée OAuth : non / oui (validée par Starck le <date>, ADR-xxx).
- Marquage des événements de l'application : <selon DS-18>.
- Format exact du titre et de la description des événements créés : <gabarit, avec un exemple rendu>.

## 8. Gestion des erreurs

| # | Situation | Détection (où) | Erreur / alerte | Comportement attendu | Message (code) | Journalisation (niveau, champs autorisés) | Test |
|---|---|---|---|---|---|---|---|
| 1 | <saisie invalide> | Domaine | `<ErreurMetier>` | Refus, aucune écriture | `ERR-<CTX>-nnn` | info : `cas_usage`, `code` | UT-US-xxx-nn |
| 2 | Réseau indisponible | Adaptateur `<…>` | `ReseauIndisponible` | Écriture locale, mise en file | — (indicateur hors ligne) | info | UT-US-xxx-nn |
| 3 | Accès Google révoqué | Adaptateur | `AccesGoogleRevoque` | <selon RG-035 / Q-DEM001-22> | `ERR-COMPTE-nnn` | avertissement | UT-US-xxx-nn |

Paramètres de nouvelle tentative : <nombre maximal, délai initial, plafond>.

## 9. Patterns imposés

| Pattern | Où | Pourquoi |
|---|---|---|
| <ex. Stratégie> | `<Element>` | <ex. critères de priorité extensibles, RG-005> |
| <ex. Objet-valeur> | `<Element>` | <invariant RG-028> |

Patterns **interdits** dans cette US, le cas échéant : <…>.

## 10. Sécurité et données personnelles

- Données personnelles manipulées : <liste> ; données sensibles (bilan du soir…) : <oui / non>.
- Jetons : <aucun accès direct / via `FournisseurIdentite` uniquement>.
- Journalisation : champs autorisés pour cette US ; champs interdits à surveiller particulièrement.
- Validation des entrées : <champs, bornes, longueurs maximales>.
- Points OWASP spécifiques : <…>.

## 11. Exigences non fonctionnelles

| ENF | Exigence pour cette US | Vérification |
|---|---|---|
| ENF-04 | <comportement hors ligne attendu> | <test ou scénario> |
| ENF-06 | <aucune perte de donnée : cas couverts> | <test> |
| Performance | <seuil éventuel, issu du DAT> | <…> |

## 12. Step definitions Cucumber à implémenter

> Règles : `conventions.md` §9.7. Steps minces, un fichier par domaine dans `tests/steps/`, mode strict.

| # | Phrase Gherkin exacte (avec paramètres) | Mot-clé | Fichier | Nouveau / réutilisé | Implémentation attendue |
|---|---|---|---|---|---|
| 1 | `nous sommes le {date} à {heure} heure de {fuseau}` | Étant donné | `tests/steps/commun` | Réutilisé | Positionne l'`HorlogeControlable` du monde |
| 2 | `<phrase>` | Quand | `tests/steps/<domaine>` | Nouveau | Appelle `<CasUsage>` avec <…> ; mémorise le résultat dans le monde |
| 3 | `<phrase>` | Alors | `tests/steps/<domaine>` | Nouveau | Vérifie <…> via <requête ou observation de doublure> |

Types de paramètres nouveaux : <nom, expression, conversion>.
Doublures et monde : <éléments à ajouter au monde partagé, API de pilotage ou d'observation à ajouter aux doublures>.
Scénarios exécutés via l'IHM (`@ihm`) : <liste ou « aucun »>.

## 13. Tests unitaires fournis (E10)

> Écrits par Anthony, en phase rouge à la remise. Ils **font foi** : ni modification, ni désactivation, ni affaiblissement sans accord écrit d'Anthony.

| Id | Fichier | Élément testé | Cas testé (nom du test) | RG / CA | Raison de l'échec attendue en phase rouge |
|---|---|---|---|---|---|
| UT-US-xxx-01 | `tests/unitaires/<…>` | `<fonction>` | « <élément> — <résultat> quand <condition> » | RG-xxx / CA-1 | Fonction absente |

Suites de contrat concernées : <port → fichier de suite>.
Cas temporels couverts (`conventions.md` §9.10) : <minuit, changement d'heure, semaine ISO, fuseaux…>.
Commande d'exécution : <commande exacte, selon DS-14>.

## 14. Tests attendus de Benjamin

Tests que Benjamin **doit** ajouter (en plus de ceux du §13), avec le niveau attendu :
| Niveau | Objet | Critère de suffisance |
|---|---|---|
| Intégration | Adaptateur `<…>` | <cas nominal, erreurs §8 n° x à y> |
| Contrat | Doublure `<…>` | Suite de contrat verte |

## 15. Plan de réalisation

Étapes recommandées, dans l'ordre, chacune terminée par des tests verts :
1. <domaine : objets-valeurs et règles>
2. <application : cas d'usage>
3. <infrastructure : adaptateurs et doublures>
4. <step definitions>
5. <présentation>
6. <composition et vérification de la DoD technique>

## 16. Dette, hypothèses et points ouverts

- **Points ouverts** : <aucun>. *Une ST-US présentée en E11 ne doit comporter aucun point ouvert.*
- **Hypothèses** : <aucune>. *Toute hypothèse est validée par l'agent propriétaire (Pepper, Steeve ou Starck) avant E11, avec la référence de la validation.*
- **Dette acceptée d'emblée** : <`DT-xxx`, ou « aucune »>.

## 17. Checklist de complétude (avant E11)

- [ ] Chaque critère d'acceptation est relié à au moins un scénario et à au moins un test (§2.1).
- [ ] Chaque RG de l'US est reliée à un élément de domaine et à au moins un test (§2.2).
- [ ] Tous les fichiers à créer ou à modifier sont listés, avec leur couche (§3).
- [ ] Toutes les signatures publiques nouvelles ou modifiées sont données, erreurs comprises (§4).
- [ ] Le modèle de données, les migrations et la compatibilité entre appareils sont décrits, ou déclarés sans objet (§5).
- [ ] Chaque algorithme non trivial est décrit de façon déterministe, avec ses cas limites, dont les cas temporels (§6).
- [ ] Les interactions Google sont décrites : portées, idempotence, format exact des événements (§7).
- [ ] Chaque erreur et chaque alerte a un comportement, un code de message et un test (§8).
- [ ] Les patterns imposés sont listés (§9) ; les exigences de sécurité sont explicites (§10).
- [ ] Chaque phrase Gherkin du `.feature` a une ligne au §12 ; aucun step n'est laissé implicite.
- [ ] Les tests unitaires du §13 existent, s'exécutent et échouent pour la raison attendue.
- [ ] Aucun point ouvert ni hypothèse non validée (§16).
- [ ] La ST-US est conforme au DAT, aux ADR, aux maquettes et à `conventions.md`.
