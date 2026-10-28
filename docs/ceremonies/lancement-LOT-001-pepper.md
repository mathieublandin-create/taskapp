# Revue de lancement de LOT-001 (E11) — avis de Pepper

| Élément | Valeur |
|---|---|
| Lot | LOT-001 « Socle et objectifs/tâches », 10 US, 282 scénarios |
| Relu | Conception au commit `9597df8` : `ST-socle-ecriture.md` ; ST-US-001, 023, 002, 024, 003, 025 (v0.2), ST-US-022, 017, 018, 031 (v0.2) ; LOT-001, section « Ordre de réalisation et incréments » ; tests de `tests/unitaires` et `tests/integration`, par sondage ciblé (94 fichiers) |
| Référentiel | Cahier des charges v0.14 · 10 US (statut « Prête ») · 282 scénarios · glossaire d'étapes v1.9 · guide d'ergonomie v0.2.13 (catalogue §6.6) |
| Angle | Métier : couverture des critères d'acceptation, respect des règles de gestion, justesse des codes et des messages, cohérence des rangs avec les scénarios |
| Auteur, date | Pepper, 2026-10-27 |
| Avis | **Réserves : 2 remarques bloquantes (P1, P2), 4 non bloquantes (P3 à P6).** P2 porte sur mes propres scénarios ; P1 demande une réponse du commanditaire. |

---

## 1. Ce qui a été vérifié, et le résultat

| Contrôle | Méthode | Résultat |
|---|---|---|
| Rattachement des scénarios aux rangs | Comparaison outillée des 282 scénarios des `.feature` avec la table « Scénarios exécutés à chaque rang » de LOT-001 | **Conforme** : chaque scénario a un rang et un seul ; aucun scénario inexistant cité ; décompte par US exact (001 : 23, 023 : 22, 002 : 28, 024 : 25, 003 : 22, 025 : 23, 022 : 33, 017 : 46, 018 : 30, 031 : 30). Les §12.2 de ST-US-018 et ST-US-031 concordent avec LOT-001 (sommes contrôlées). Seule réserve : S27 d'US-017 (P3). |
| Couverture des critères d'acceptation | Chaque CA des 10 US recherché dans la table de traçabilité de sa ST | **Conforme** : tous les CA sont rattachés à des scénarios, des tests et des composants. US-003 CA-5 n'est cité que dans la plage « CA-4 à CA-7 », mais il est bien couvert (S08 au rang 7 ; UT-US-001-09). |
| Codes du catalogue | Tous les codes `ERR-`, `ALR-`, `BAN-`, `MEN-`, `SYN-`, `CNF-`, `EVD-` cités dans les ST, les scénarios et les tests unitaires, recherchés dans le guide v0.2.13 | **Conforme** : aucun code inconnu du catalogue. Le sens des codes de refus échantillonnés (`ERR-001` à `ERR-006`, `ERR-020` à `ERR-023`, `ERR-030` à `ERR-035`) correspond aux règles et aux critères. Seule réserve : le choix entre `ERR-003` et `ERR-004` dans un cas non scénarisé (P4). |
| Règles DEC-034 et DEC-036 (application web unique) | ST-US-022 §6, ST-US-018, ST-US-031, ADR-013, DAT §4.1.7, tests `ouverture`, `bandeau` | Conformes à RG-017, ENF-04, US-018 CA-4 et CA-8, US-022 CA-5 et CA-7 pour la **mécanique** (au plus un geste, aucune saisie, accès expiré sans bandeau, accès retiré avec « Se reconnecter »). **Écart sur la fréquence et l'ordre d'affichage** du passage par Google à l'ouverture (P1, P2). |
| RG-057 (rappel après 24 h) | ST-US-022 §6.9 ; UT-US-022-46 et 47 | **Conforme** : seuil strict (24 h exactement : rien ; 24 h + 1 min : bandeau) ; un seul bandeau quand l'accès est perdu ; variante `session` seulement en ligne ; consultation seule prioritaire. |
| Fin de session dans un autre onglet (Q-ST031-PEP-1) | ST-US-031 §6.4, §12.1, UT-US-031-11 | **Conforme** à la réponse donnée (retour à la connexion, sans message, avis après la dernière écriture). |
| RG-044, RG-056, RG-058 (incréments 2 à 4) | ST-US-017 §6.6 à §6.8 | **Conformes** aux règles validées (ordre des contrôles, « repartir de zéro » prioritaire, `ALR-014` hors du point « à lire » selon Q-US-017-8 a, aucune écriture en consultation seule). Les phrases d'étapes de ces incréments sont explicitement différées avant leur E12 (ST-US-017 §17) : non relevé. |

---

## 2. Remarques

### RL-LOT-001-P1 — Passage par Google à **chaque** ouverture, et non « après plus d'une heure » · **Bloquante**

- **Référence** : ST-US-022 §6.1 (`deciderOuverture` : `REDIRECTION_SILENCIEUSE` dès qu'une session est mémorisée et que le réseau est là) et §6.2 ; UT-US-022-10 ; DAT v0.11.3 §4.1.7 (« une redirection d'environ 1 à 2 s à chaque ouverture à froid sans jeton en mémoire, même moins d'une heure après la précédente ») ; ADR-013 (« accepté, Q-PWA-2 »). À rapprocher de : cahier des charges v0.14, RG-017 et glossaire « Accès Google à renouveler » ; US-017 CA-3 ; `validation-DEC-034.md` V-DEC034-3 ; ETU-002 §11, Q-PWA-2.
- **Constat** :
  - le jeton n'étant gardé qu'en mémoire, chaque lancement de l'application ou rechargement (DEC-026) avec le réseau passe par l'écran d'attente `SYN-REDIRECTION` (0,4 à 1,8 s mesurées) avant d'afficher les données, même cinq minutes après la fermeture précédente ;
  - les textes validés par le commanditaire limitent ce passage au cas où l'application **n'a pas servi depuis plus d'une heure** : Q-PWA-2 (« quand l'application n'a pas servi depuis plus d'une heure »), glossaire validé (« accès valable une heure a expiré »), RG-017 (« quand l'accès Google doit être renouvelé (il dure une heure) ») ;
  - US-017 CA-3 dit en outre que, dans ce cas, l'application « affiche **aussitôt** les données présentes sur l'appareil ». La conception affiche d'abord l'écran d'attente.
  - Le commanditaire a vu ce comportement pendant le test technique (case « Redirection automatique à l'ouverture », à chaque ouverture), mais les règles qu'il a validées ne le décrivent pas. C'est une règle validée qui n'est pas tenue telle qu'elle est écrite.
- **Correction attendue** : trancher par une question fermée au commanditaire (à poser par Jarvis), avant l'E12 du rang 1 :
  - **Q-RL-P1** — « À chaque ouverture de Done Juan avec du réseau (après l'avoir fermée ou rechargée, pas en revenant d'une autre application), un écran « Connexion à Google… » s'affiche environ une seconde avant vos données, même si vous l'avez utilisée quelques minutes plus tôt. Est-ce accepté ?
    - a) oui : c'est le prix de ne conserver aucun jeton d'accès Google sur l'appareil ★ ;
    - b) non : cet écran ne doit apparaître qu'après plus d'une heure sans usage. Il faudrait alors conserver le jeton, chiffré, sur l'appareil (ADR-013, option 4, écartée pour la sécurité ; à réétudier par Starck). »
  - Si a) : Pepper précise RG-017, le glossaire « Accès Google à renouveler » et US-017 CA-3. Le passage par Google a lieu à chaque ouverture avec réseau. Les données s'affichent aussitôt après ce passage, sans écran de connexion ni saisie. Hors ligne, elles s'affichent aussitôt. Cette précision est présentée au commanditaire avec la question, pour validation dans la même réponse.
  - Si b) : Starck révise ADR-013 et le DAT, et Anthony ST-US-022 (rang 1).

### RL-LOT-001-P2 — US-017 S06b et US-022 S23b vérifient les données avant le passage par Google · **Bloquante** (avant l'E13 du rang 3 ; correction à la charge de Pepper)

- **Référence** : `tests/features/US-017-…feature` S06b ; `tests/features/US-022-…feature` S23b ; ST-US-022 §6.2, §12.1 n° 34 et 36, §12.3 (retour « différé ») ; ST-US-017 §12.1 n° 10 (« instantané d'ouverture »).
- **Constat** : avec la précondition `que la session Google du smartphone a expiré`, le banc diffère le retour de la redirection d'ouverture jusqu'à l'étape `l'accès à Google est renouvelé sans saisie`. D'ici là, la racine est `ATTENTE_GOOGLE` (`SYN-REDIRECTION`), et non l'application. Or mes deux scénarios vérifient, **avant** cette étape, que « les données présentes sur le smartphone s'affichent aussitôt » (S06b) et que « l'objectif "Publier le guide" existe » (S23b). Tels qu'ils sont écrits, ces scénarios contredisent la conception : selon la définition des étapes, soit ils échouent, soit ils passent sur une lecture des données que l'écran n'affiche pas (faux positif).
- **Correction attendue** :
  - Pepper réordonne S06b et S23b, après la réponse à P1 : ouverture, puis `aucune connexion n'est demandée` (vérifiable pendant l'attente), puis `l'accès à Google est renouvelé sans saisie`, puis les assertions sur les données affichées et sur l'intégration en une minute au plus. Mise à jour de l'historique des US ; aucune étape nouvelle.
  - Anthony confirme le sens de l'étape n° 10 de ST-US-017 quand la racine est `ATTENTE_GOOGLE` : elle doit échouer, pour éviter un faux positif.

### RL-LOT-001-P3 — US-017 S27 (« heure de Paris ») : sens de l'étape non fixé et rang trop tardif · Non bloquante (avant l'E10 de l'incrément 4)

- **Référence** : ST-US-017 §2.1 (CA-11 → « Feuille »), §2.2 (RG-054 → « Ligne Fuseau de la feuille », incrément 4), §12.2 (S27 au rang 11) ; `GLOSSAIRE-ETAPES.md` §6 (`sur le <appareil>, la mention "MEN-HEURE-PARIS" <apparaît | n'apparaît pas>`) ; guide §6.6.10 (« Où » : puce sous le titre des vues Tâches et Objectifs, dates de fin et d'abandon, ligne « Fuseau » de la feuille) ; ST-US-001 UT-US-001-29.
- **Constat** :
  - aucune ST ne définit la phrase de S27. Le glossaire en donne la forme, pas le sens observable : quel écran porte la mention ?
  - ST-US-017 rattache RG-054 à la seule ligne « Fuseau » de la feuille (rang 11). Or RG-054 et US-017 CA-11 portent sur « les horaires et la journée « aujourd'hui » qu'elle affiche ». La puce des listes, qui en est l'expression principale, est déjà livrée au rang 2 (ST-US-001, UT-US-001-29).
  - Par la règle de rattachement (rang du dernier prérequis), S27 devrait donc être exécuté au rang 2, et non au rang 11.
- **Correction attendue** :
  - Pepper fixe le sens dans le glossaire d'étapes : la puce `MEN-HEURE-PARIS` sous le titre des listes Tâches et Objectifs, présente ou absente ;
  - Anthony ajoute la définition de l'étape et revoit le rang de S27 (2, si la liste des objectifs suffit), dans ST-US-017 et dans LOT-001.

### RL-LOT-001-P4 — `ERR-003` ou `ERR-004` quand l'appareil garde les données d'un **autre** compte · Non bloquante

- **Référence** : ST-US-022 §6.7, étape 1 (`motifEchecConnexion('HORS_LIGNE', { espaceLocalExistant: existeUnEspace() })`) ; UT-US-022-04 ; guide §6.6.8 (`ERR-004` : « Vos données sont conservées sur cet appareil ») ; US-022 CA-9 et CA-10.
- **Constat** : le motif dépend de l'existence d'un espace, quel que soit son compte. Cas non scénarisé : le compte A a supprimé les données de l'appareil alors que celles du compte B y restent, ou un nouveau compte se connecte sur un appareil où un autre compte s'est déconnecté. Sans réseau, l'application affiche alors `ERR-004` (« Vos données sont conservées sur cet appareil »), alors que `ERR-003` (« connexion après suppression des données de l'appareil ») était attendu pour le compte A. Sans réseau, l'application ne peut pas savoir quel compte va se connecter : la règle exacte est donc à préciser, pas à corriger dans le code.
- **Correction attendue** : Pepper ajoute ce cas limite à US-022, avec cette précision : « sans réseau, le message de reconnexion (`ERR-004`) est affiché dès qu'un espace de compte existe sur l'appareil ; si aucun n'existe, c'est celui de première connexion (`ERR-003`) ». Steeve vérifie si le texte d'`ERR-004` doit devenir neutre (« Les données présentes sur cet appareil sont conservées »). Aucune modification de ST si le texte est retenu tel quel.

### RL-LOT-001-P5 — ENF-04 : la phrase sur l'application installée vise le téléphone, mais n'est pas restreinte · Non bloquante (correction à la charge de Pepper)

- **Référence** : cahier des charges v0.14, ENF-04, dernière phrase (« L'utilisation sans réseau est garantie depuis l'application installée sur l'appareil ; dans un simple onglet du navigateur, elle n'est pas garantie ») ; `validation-DEC-034.md` V-DEC034-7 (« Conditions du travail sans réseau **sur le téléphone** ») ; US-031 CA-1 et S01a (sur le PC, ouverture sans réseau **depuis l'adresse web** ou depuis l'application installée) ; ST-US-031 §2.
- **Constat** : la phrase d'ENF-04, telle que je l'ai rédigée, vaut pour tout appareil. Elle affaiblit donc US-031 CA-1 sur le PC, que la conception tient (S01a au rang 12). Le commanditaire l'a validée sous un titre limité au téléphone.
- **Correction attendue** : Pepper restreint la phrase au smartphone, conformément au titre de V-DEC034-7 : « Sur le smartphone, l'utilisation sans réseau est garantie depuis l'application installée… ». C'est une correction de forme, sans nouvelle validation, signalée à Jarvis. Aucune ST n'est touchée.

### RL-LOT-001-P6 — Geste sans effet quand une saisie est en cours et que la fenêtre de Google échoue · Non bloquante (à trancher avec Q-ST022-STE-4, avant l'E12 du rang 1)

- **Référence** : ST-US-022 §6.10, étape 5 (`RedirectionNonPermise` → `SAISIE_A_TERMINER`, « rien ne change ») et §8 n° 7 b ; RG-017 (« jamais plus d'un geste ») ; US-018 CA-4 ; US-031 CA-5.
- **Constat** : si la fenêtre de Google échoue pour une cause technique pendant qu'une saisie est en cours, le geste « Reprendre la synchronisation » reste sans effet. L'utilisateur doit terminer sa saisie, puis refaire le geste : cela fait deux gestes, alors que RG-017 en garantit un au plus. C'est un cas de panne technique, raisonnable à accepter, mais il n'est écrit nulle part. Sans message (question Q-ST022-STE-4 encore ouverte), le premier geste paraît ignoré.
- **Correction attendue** :
  - Steeve répond à Q-ST022-STE-4 avec un message (par exemple « Terminez votre saisie, puis reprenez la synchronisation ») ;
  - Pepper ajoute à US-022 et US-031 un cas limite, présenté à Jarvis comme précision : « si la fenêtre de Google ne s'ouvre pas pendant une saisie, un second geste est nécessaire une fois la saisie terminée ; rien n'est perdu ».
  - Pas de modification de la conception.

---

## 3. Synthèse

| Remarque | Objet | Bloquante | À la charge de | Échéance |
|---|---|---|---|---|
| RL-LOT-001-P1 | Passage par Google à chaque ouverture vs « après plus d'une heure » (RG-017, US-017 CA-3) | **Oui** | Jarvis (question au commanditaire), puis Pepper ou Starck et Anthony | Avant l'E12 du rang 1 |
| RL-LOT-001-P2 | US-017 S06b, US-022 S23b : ordre des assertions | **Oui** | Pepper ; Anthony (sens de l'étape n° 10) | Avant l'E13 du rang 3 |
| RL-LOT-001-P3 | US-017 S27 : sens de l'étape, rang | Non | Pepper (glossaire), Anthony (ST-US-017, LOT-001) | Avant l'E10 de l'incrément 4 |
| RL-LOT-001-P4 | `ERR-003` ou `ERR-004` avec l'espace d'un autre compte | Non | Pepper, Steeve | Avant l'E12 du rang 1 |
| RL-LOT-001-P5 | ENF-04 limitée au smartphone | Non | Pepper | Immédiat |
| RL-LOT-001-P6 | Second geste en cas d'échec de la fenêtre Google pendant une saisie | Non | Steeve (Q-ST022-STE-4), Pepper | Avant l'E12 du rang 1 |

**Avis de Pepper** : la conception et les tests unitaires sont conformes aux US, aux règles et aux scénarios sur tous les points contrôlés : couverture des critères, codes du catalogue, rattachement des 282 scénarios aux rangs, règles RG-044, RG-056, RG-057 et RG-058, fin de session entre onglets. Je ne m'oppose pas au lancement du lot, sous deux conditions. L'E12 du rang 1 (US-022) attend la réponse du commanditaire à P1 : le socle (rang 0) peut démarrer sans elle. L'E13 du rang 3 attend la correction de P2.

---

## 4. Suites données par Pepper (2026-10-27)

| Remarque | Suite | Fichiers |
|---|---|---|
| P1 | **DEC-038** (réponse « a) » du commanditaire, qui valide la précision proposée). RG-017 et le glossaire « Accès Google à renouveler » précisés : passage par Google à chaque ouverture avec le réseau, sans geste ni saisie, données juste après ; sans réseau, données aussitôt. US-017 CA-3 aligné. | Cahier des charges v0.14.1 ; US-017 |
| P2 | US-017 S06b et US-022 S23b réordonnés : assertions sur les données après `l'accès à Google est renouvelé sans saisie`. Glossaire d'étapes v1.10 : « aussitôt » compté depuis la fin du passage par Google ; l'écran d'attente n'est pas une demande de connexion. **Reste pour Anthony** : définition de l'étape n° 10 de ST-US-017 (échec pendant l'attente). | `.feature` d'US-017 et d'US-022 ; glossaire v1.10 |
| P3 | Sens de l'étape de S27 fixé : puce `MEN-HEURE-PARIS` sous le titre de la liste des objectifs. **Reste pour Anthony** : définition de l'étape et rang de S27. | Glossaire v1.10 |
| P4 | Cas limite ajouté à US-022 (`ERR-004` dès qu'un espace de compte existe). **Reste pour Steeve** : texte d'`ERR-004` dans ce cas. | US-022 |
| P5 | ENF-04 : phrase sur l'application installée limitée au smartphone (correction de forme). | Cahier des charges v0.14.1 |
| P6 | Cas limite ajouté à US-022 et US-031 (`TST-SAISIE-A-TERMINER`, guide v0.2.14 ; second geste après la saisie). Exception à « jamais plus d'un geste » limitée à cette panne technique, **signalée à Jarvis**. | US-022, US-031 |

## 5. Réponse d'Anthony (2026-10-28)

| # | Réponse | Où |
|---|---|---|
| P1 | DEC-038 (réponse a) : la conception est confirmée telle quelle, avec un renvoi ajouté dans ST-US-022 (§0, §16). Remarque traitée par Pepper. | ST-US-022 |
| P2 | Confirmé : l'étape n° 10 (`les données présentes sur le {appareil} s'affichent aussitôt`) **échoue tant que la racine est `ATTENTE_GOOGLE`** ; « aussitôt » se compte depuis la fin du passage par Google (glossaire v1.10 §12). En contrepartie, l'étape n° 38 de ST-US-022 (`aucune connexion n'est demandée`) passe pendant l'écran d'attente. | ST-US-017 §12.1 n° 10 ; ST-US-022 §12.1 n° 38 |
| P3 | Fait : l'étape n° 23 est définie (puce `mentionHeureParis` de la liste des objectifs, selon le fuseau de l'appareil). S27 passe au **rang 2**, dans ST-US-017 §12.2 et dans LOT-001 ; le contrôle par script confirme 282 scénarios, tous rattachés. | ST-US-017 §2.1, §12 ; LOT-001 |
| P4 | Rien à modifier dans la conception : `motifEchecConnexion('HORS_LIGNE', { espaceLocalExistant: existeUnEspace() })` rend `ERR-004` dès qu'un espace de compte existe, quel qu'en soit le compte (UT-US-022-04). | — |
| P5 | Sans effet sur les ST. | — |
| P6 | Conception déjà conforme : `SAISIE_A_TERMINER` → toast `TST-SAISIE-A-TERMINER` (UT-US-022-54), état inchangé, puis un second geste après la saisie (ST-US-022 §6.10). | ST-US-022 |

Rien ne reste ouvert de mon côté pour P1 à P6.
