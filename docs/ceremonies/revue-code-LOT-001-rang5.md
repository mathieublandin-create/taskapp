# Revue de code E13 — LOT-001, rang 5 (US-002 : gérer mes tâches)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-10-31 |
| Branche | `us/US-002-rang5` @ `5ae6d80` (PR #13, base `lot/LOT-001`, branche rebasée) |
| Auteur | Benjamin |
| Périmètre | Différentiel `origin/lot/LOT-001...HEAD` : 78 fichiers, + 5 420, − 217 (14 commits, de `1ca1fd1` à `5ae6d80`) |
| Référentiel | ST-US-002 (§3, §4, §6, §8, §12 à §15), `checklist-revue-code.md` v0.3, `conventions.md` (§8.5, §11, §12), guide d'ergonomie §5.7, §5.8, §6.6, maquettes ECR-002, ECR-003 D, ECR-006, ECR-007 |
| Passage | 1 |

Hors périmètre de la revue : `docs/02-ux/` et `docs/suivi-projet.md` (commits de Steeve et de Jarvis, DEC-042) ; les deux `.feature` d'US-018 et d'US-031 (commit `5ae6d80`, corrections de Pepper validées par DEC-043, 7 lignes ajoutées, aucune supprimée).

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| CI de la PR #13 sur `5ae6d80` | Tous les jobs verts : qualité, sécurité, build, e2e (CSP), tests dans les fuseaux UTC, America/New_York et Pacific/Auckland. |
| Tests fournis en E10 (CR-60) | Aucun fichier de `tests/unitaires/` existant n'est modifié (`git diff --name-status` : seulement des ajouts `A`). Intacts. |
| Features (CR-68) | Seules modifications : US-018 et US-031 (DEC-043). Aucun `@wip`. |
| État de la PR | **La PR #13 a été fusionnée dans `lot/LOT-001` (`993ca6b`, 2026-10-31 08:42) avant le verdict E13.** La revue est conduite sur la base `632c1b5` (premier parent de la fusion), différentiel identique (78 fichiers). Écart au workflow signalé à Jarvis (§6). |

## 2. Domaine et application (conformes)

- Décisions (`creer-tache.ts`, `modifier-tache.ts`, `rattacher-tache.ts`, `supprimer-tache.ts`) : conformes au §6.2 et au §8. `deciderModificationEstimation` refuse `EstimationCalculee` avant tout contrôle de la valeur (UT-US-002-08) ; une valeur inchangée n'écrit rien ; `deciderLien` factorise rattachement et détachement sans dupliquer de règle ; la suppression n'écrit pas sur les sous-tâches (RG-046).
- `validerSaisieTache` cumule les défauts dans l'ordre intitulé, délai, estimation (§6.1). `alertesDelaiTache` : comparaison stricte, objectifs hérités pour une sous-tâche (RG-023, RG-024). `estTacheEnRetard`, `estimationEnVigueur`, `actionsTache` (§6.5) : conformes.
- Cas d'usage : orchestration seule (`service.modifier(avecVue(decision))`), aucune règle (CR-12) ; écriture en une transaction par le service existant (CR-17). Requêtes : `lireVueCourante` (horloge par port, CR-30).
- **Synchronisation et modèle d'écriture** : le différentiel de `src/` ne touche ni `src/synchronisation/` ni le modèle d'écriture (`Modification`, `EvenementACreer`) ; il les consomme seulement. Le seul import nouveau du contexte `synchronisation` est `mentionAttenteSi` (exposé par son `index.ts`, CR-14). Les fichiers de synchronisation modifiés sont uniquement des fichiers de **test** (`tests/steps/synchronisation/*`, `tests/support/synchronisation/*`, `tests/support/banc/banc-synchro.ts`) : voir §4.
- Composition : la ST (§3 n° 20) nommait `src/composition/web.ts` ; l'enregistrement est fait dans `src/composition/objectifs-taches.ts` (`assemblerTaches`), le point d'assemblage réel du contexte depuis le rang 2. Écart de nommage de la ST, accepté sans remarque.

## 3. Modèles de vue

- `construireListeTaches` : filtres, tris et états vides conformes au §6.4 (ordre des conditions de `etatVide` respecté) ; sous-titre `MEN-TRI-DELAI` avec variante « plus récentes » hors « à faire ».
- `construireDetailObjectif` : trois sections présentes même vides, `n` ne compte que les tâches directes, sous-tâches seulement sous une tâche à faire, dans l'ordre de référence (§6.6, Q-US-002-4 a).
- `construireDetailTache`, `construireFormulaireTache` : conformes au §4.5 (verrous `MEN-ESTIMATION-CALCULEE`, `MEN-OBJECTIFS-HERITES` ; rien de présélectionné, CA-2).
- **`LigneTache.attente` (`MEN-ATTENTE`)** : absent du §4.5 de la ST-US-002, mais exigé par la ST-US-017 (§3.1 n° 17 : `mentionAttente` « lu par les modèles de vue des lignes, ST-US-001 et ST-US-002 » ; guide §6.6.4, l. 342). Il reprend exactement la forme de `LigneObjectif.attente` (n° 17 d, `nomAccessible` par `libelle('MEN-ATTENTE', {}, 'nomAccessible')`). **Accepté** : ce n'est pas une fonctionnalité en plus (CR-05) mais l'application d'une ST transverse que la ST-US-002 aurait dû rappeler. La ST-US-002 sera complétée (v suivante, §4.5).

- **Nom accessible d'une ligne de tâche** (`ligne-tache.ts:97`) : le gabarit « {intitulé}, {état}, délai {date}[, en retard] » n'a ni code au guide §6.6 ni signature dans la ST (le §4.5 ne donne que `nomAccessible: string`), d'où le mot « délai » codé en dur. De plus, le texte visible de la ligne est `aria-hidden` (`ligne-tache.tsx`) : l'estimation, les objectifs, le compteur de sous-tâches et surtout les alertes `ALR-005` / `ALR-006` ne sont pas annoncés dans la liste (ils le sont dans le détail, `role="status"`). **Décision** : non rattaché à DT-015, dont le périmètre et le plan sont propres à US-023 ; inscrit en **DT-017** (P1), qui couvre tout le nom accessible de la ligne de tâche ; question **Q-ANT-E13-R5-1** à Steeve (gabarit et code, par exemple une variante `nomAccessible` comme `ETA-OBJ-COMPTEUR`). Voir RC-US-002-10.

## 4. Banc de test modifié (point 2) : décisions

Aucun test unitaire fourni en E10 n'est modifié (CR-60). Décision, modification par modification :

| # | Modification | Référence | Décision |
|---|---|---|---|
| B1 | `prefixes.ts` : `ecartDuPrefixe` (le groupe `{ecart}` du préfixe arrive déjà converti par cucumber-js) et option `tableau` (DataTable en dernier argument) | `conventions.md` §11.6 | **Acceptée**. Le transtypage `valeur as EcartTemps` porte sur une valeur produite par le type de paramètre `{ecart}` lui-même : toléré dans le support de test. |
| B2 | `temps.steps.ts` : « nous sommes le … » exécute les échéances échues du planificateur et attend les cycles | ST-US-018 §12.1 n° 4 | **Acceptée** : c'est la définition de la ST. En précondition (temps posé avant toute échéance), l'appel est neutre. |
| B3 | `temps.steps.ts` : « l'horloge du {appareil} est en avance de {ecart} » (US-017 S12) | Absente des ST (le commentaire cite à tort ST-US-017 §12.1 n° 8) | **Acceptée**. Elle s'appuie sur `HorlogeSimulee.dereglerDe`, déjà au banc. Anthony complète ST-US-017 §12.1 (action A-2). |
| B4 | `banc-synchro.ts` : `remplacerAppareil` ; « l'application n'a jamais été utilisée sur le {appareil} » remplace l'appareil au lieu d'affirmer qu'il est neuf | ST-US-022 §12.1 n° 3 (« appareil neuf, nouvelle `IDBFactory`, rien en mémoire technique ») | **Acceptée**. L'ancienne assertion contredisait la ST dès que le Contexte ouvrait l'appareil ; ce n'est pas un affaiblissement (étape de contexte, pas un contrôle). |
| B5 | `appareils.steps.ts` : « arrêtée brutalement » et « éteint puis rallumé » | ST-US-018 §12.1 n° 5 | **Acceptée**. |
| B6 | `reseau.steps.ts` : « le réseau revient …, sans aucune action de l'utilisateur » (même corps), « le réseau du {appareil} est intermittent » (ouverture seule, l'intermittence est portée par `drive.steps.ts`) | ST-US-017 §12.1 n° 7 | **Acceptée**. |
| B7 | `connexion.steps.ts` (« tous deux à jour ») et `support/synchronisation/echanges.ts` : le temps simulé consommé par l'échange est rendu | H-5 (un état, pas une chronologie) | **Acceptée**. Le HLC tolère un recul de l'horloge (propriété éprouvée au rang 3) ; aucune échéance réelle n'est perdue, le planificateur restant sur ses dates. |
| B8 | `drive.steps.ts` : « contient la tâche … (exactement une fois) », « l'envoi au Drive est interrompu {int} fois avant d'aboutir » (boucle bornée à 60 minutes simulées, assertion finale) | ST-US-017 §12.1 n° 7 ; ST-US-031 | **Acceptée**. Aucune attente réelle (CR-43). |
| B9 | `echanges.steps.ts` : opérations au passé sur une tâche, « 3 modifications ont été enregistrées … » (opérations fixées), « les 3 modifications sont intégrées », « après échange, il existe n objectif(s) … » | ST-US-017 §12.1 n° 16, 17 ; ST-US-018 §12.1 n° 7 | **Acceptée**. |
| B10 | `etat-affiche.steps.ts` : décompte de l'indicateur, bandeau 24 h, mention `MEN-ATTENTE` des tâches, état vide de la première connexion (US-022 S04) | ST-US-017 §12.1 n° 18, 19 ; ST-US-018 §12.1 n° 1, 2 ; ST-US-022 §12.1 | **Acceptée**. |
| B11 | `etat-affiche.steps.ts:265` : « l'objectif {string} n'existe pas » (US-017 S08) | Absente des ST | **Acceptée** ; Anthony complète ST-US-017 §12.1 (action A-2). Emplacement : RC-US-002-11 (suggestion). |
| B12 | `historique.steps.ts`, `refus.steps.ts`, `monde.ts`, `ui-objectifs.ts` (services typés par `ObjectifsTaches`) | ST-US-002 §12 n° 5, 18, 19, 22 à 29 | **Acceptée**. |

## 5. Points 3 et 5 : scénarios et rangs

- **Scénarios d'US-018 et d'US-031 au rang 5** : la liste nominative du §12.1 de la ST-US-002 ne porte que les scénarios d'US-002 ; les scénarios transverses du rang sont fixés par `docs/lots/LOT-001.md` (tableau des rangs d'exécution, ligne du rang 5). Les entrées de rang 5 de `tests/support/rangs-scenarios.json` (non modifié par la PR) correspondent **exactement** à cette ligne : US-001 S07, S10, S16, S18, S22 ; US-023 S07 ; US-017 S05, S06, S12 ; US-022 S04 ; US-018 S01, S05, S05b, S05c, S06, S06c, S09, S10, S11, S12, S14, S15, S15b, S15c, S16, S16b, S17, S17c, S17d ; US-031 S04, S05, S07, S09, S13, S18, S19, S19b, S20, S20b, S21, S22, S22b, S22c. **Rattachement confirmé.**
- `rang-courant.json` = 5 : conforme (la PR livre le rang 5).
- `rangs-fichiers.json` : les 11 fichiers UI créés sont déclarés `{ debut: 5, fin: 5 }` (créés complets, sans squelette) : conforme à `conventions.md` §11.14 (`fin` = dernier rang qui remplace un squelette ; les extensions des rangs 6 à 8 ne sont pas des squelettes).
- `rangs-tests.json` : règle `UT-COMP-US-002-\d+` → 5, placée avant `UT-US-002-\d+` ; elle n'est masquée par aucune règle antérieure (`UT-COMP-\d+` exige un chiffre). 40 identifiants `UT-COMP-US-002-n` distincts. Conforme.

## 6. Couverture, sécurité, processus

- **Couverture (point 6)** : l'étape « Non-régression de la couverture par fichier » du job `tests (UTC)` compare à `lot/LOT-001` et est verte sur `5ae6d80` (le journal n'est pas lisible depuis la session : statut seul). Benjamin déclare lignes 98,03 %, branches 92,71 %. Les fichiers UI créés ont leurs tests de composants (§14 : `TaskRow`, `QuickAdd`, `DurationStepper`, `FieldRow` / `LockedField`, magasin, écrans), le test de performance indicatif (`tests/performance/liste-taches.perf.ts`, 5 000 tâches) et les tests de `construction-taches.ts` sont fournis.
- Sécurité (CR-50 à CR-58) : aucun secret, aucun stockage navigateur, aucun `dangerouslySetInnerHTML`, aucun appel réseau nouveau. Données personnelles : les intitulés ne sont pas journalisés.
- **Processus** : la PR #13 a été fusionnée (`993ca6b`, 2026-10-31 08:42, compte du dépôt) **avant** le verdict E13, contrairement à `checklist-revue-code.md` §1.4 (fusion après « Approuvé »). Les corrections ci-dessous passeront donc par une branche corrective `us/US-002-rang5-corrections` vers `lot/LOT-001`, revue en 2e passage avant l'E14 du rang 5. Signalé à Jarvis.

## 7. Remarques

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut | Itération |
|---|---|---|---|---|---|---|---|
| RC-US-002-1 | **Majeure** | CR-07, ST-US-002 §4.5 (saisie rapide : « focus sur la première erreur »), guide §4.3 | `src/objectifs-taches/presentation/ui/composants/saisie-rapide.tsx:95`, `:204` | Quand le premier défaut porte sur l'estimation (`ERR-022`, `ERR-023`), le focus est demandé au `<div>` qui enveloppe le sélecteur ; ce `div` n'a pas de `tabIndex` : le focus ne bouge pas. Le champ en erreur n'est pas non plus signalé : `invalide` n'est pas transmis à `SelecteurDuree` (`aria-invalid` jamais posé), et aucun message n'est relié au champ. | Placer la référence sur l'élément `role="spinbutton"` (`forwardRef` sur `SelecteurDuree` / `ChampDuree`) ; transmettre `invalide` quand un message porte sur l'estimation ; relier chaque message à son champ (`aria-describedby`). Ajouter un test de composant : intitulé et délai valides, estimation absente → `document.activeElement` est le `spinbutton`, `aria-invalid="true"`. | Ouverte | 1 |
| RC-US-002-2 | **Majeure** | CR-42, CR-44, ST-US-002 §8 n° 1 | `src/objectifs-taches/presentation/ui/ecrans/espace-taches.tsx:76-78` ; `detail-tache.tsx:307` | Les issues de `renommer`, `modifierDelai` et `modifierEstimation` sont jetées (`void`) et l'éditeur se ferme aussitôt : un renommage en intitulé vide (refus `SaisieInvalide`, `ERR-020`) est ignoré sans message ; l'utilisateur croit avoir enregistré. | Rendre l'issue (`IssueTache`) au détail : l'éditeur reste ouvert sur `REFUSEE` et affiche les messages du modèle de vue sous le champ (comme la saisie rapide), et ne se ferme que sur `FAITE`. Test de composant : renommage en « ␣␣ » → `ERR-020` affiché, éditeur ouvert. | Ouverte | 1 |
| RC-US-002-3 | **Majeure** | CR-16, CR-26 (identifiants typés) | `src/objectifs-taches/presentation/ui/ecrans/espace-taches.tsx:24-26` ; `modeles-de-vue/detail-tache.ts:55` | `rattachesDe` retrouve les objectifs rattachés **par leur intitulé** : avec deux objectifs de même intitulé, la puce de l'un passe pour rattachée et le geste détache ou rattache le mauvais objectif. C'est une logique de décision dans un composant. La ST (§4.5) ne donnait que `intitules` : imprécision de conception. | Évolution de la ST validée ici : `ModeleVueDetailTache.objectifs` porte aussi `ids: ReadonlyArray<IdObjectif>` (même ordre que `intitules`, depuis `ResumeTache.objectifs`). Supprimer `rattachesDe` et lire `modele.objectifs.ids`. Test du modèle de vue et test de composant avec deux objectifs homonymes. | Ouverte | 1 |
| RC-US-002-4 | Mineure | CR-22, RCD-04 | `src/objectifs-taches/presentation/ui/etat/magasin-taches.ts:111-127` ; `magasin-objectifs-taches.ts:129-145` | `TYPES_ERREUR_DEPOT`, `estRefusMetier` et `issueDe` sont recopiés d'un magasin à l'autre. | Les extraire dans un module commun de `presentation/ui/etat/` (par exemple `issues.ts`), utilisé par les deux magasins ; le déclarer dans `rangs-fichiers.json`. | Ouverte | 1 |
| RC-US-002-5 | Mineure | CR-22 | `src/objectifs-taches/presentation/modeles-de-vue/ligne-tache.ts:84` ; `ordre-reference.ts:38` | `dateDeFin` refait `terminaison` (date de fin ou d'abandon selon l'état). | Exporter `terminaison` (ou une fonction de lecture commune) et l'utiliser dans `ligne-tache.ts`. | Ouverte | 1 |
| RC-US-002-6 | Mineure | CR-23, RCD-03, DT-006 (aucun texte dans les composants) | `src/main.tsx:76` | `aria-label="Espaces"` est codé dans le composant. | Le placer dans `libelles-ui.ts` (ou le catalogue s'il reçoit un code). La conformité de la navigation au guide §2.2 et §4.14 (barre d'onglets en bas avec icônes sur smartphone, barre latérale sur PC) n'était pas spécifiée par la ST : elle est inscrite en dette **DT-018**, sans remarque. | Ouverte | 1 |
| RC-US-002-7 | Mineure | CR-26, RCD-08 | `src/objectifs-taches/presentation/ui/composants/selecteur-duree.tsx:59` | `formaterDuree(valeur as Duree)` : transtypage hors constructeur de type marqué. | Typer la propriété `valeur` en `Duree \| undefined` (les appelants ont déjà des `Duree` ou passent par `Duree.saisie`), ou construire la `Duree` par son constructeur. | Ouverte | 1 |
| RC-US-002-8 | Mineure | CR-16 | `src/objectifs-taches/presentation/ui/composants/saisie-rapide.tsx:39-44` | La table code de message → champ (`CHAMP_DE_MESSAGE`), qui décide aussi du focus, est dans le composant. | La porter dans le modèle de vue (champ `champ` de chaque message de saisie, ou fonction pure `champDuMessage` de `messages-de-refus.ts`, testée) ; à faire avec RC-US-002-1. | Ouverte | 1 |
| RC-US-002-9 | Suggestion | CR-16 | `src/objectifs-taches/presentation/ui/ecrans/detail-tache.tsx:277` | Le libellé de l'état est composé dans le composant (`libelle(code, { date: '' }).trim()`) ; pour une tâche terminée il donnerait « Terminée le ». Inatteignable au rang 5. | À traiter par ST-US-003 / ST-US-025, qui ajoutent `dateFin` / `dateAbandon` : un `etat.libelle` produit par le modèle de vue. | Notée pour le rang 7 | 1 |
| RC-US-002-10 | Mineure | CR-23, CR-07 | `src/objectifs-taches/presentation/modeles-de-vue/ligne-tache.ts:97` ; `ui/composants/ligne-tache.tsx` (texte `aria-hidden`) | Nom accessible codé en dur et incomplet (§3). | **Acceptée en dette DT-017** (Q-ANT-E13-R5-1 à Steeve). | Acceptée en dette (DT-017) | 1 |
| RC-US-002-11 | Suggestion | CR-64 | `tests/steps/synchronisation/etat-affiche.steps.ts:265` | « l'objectif {string} n'existe pas » est une assertion sur les objectifs, rangée dans le thème synchronisation. | La déplacer dans `tests/steps/objectifs-taches/objectifs.steps.ts`. | Ouverte | 1 |

## 8. Dette

| Id | Description | Décision |
|---|---|---|
| DT-017 | Nom accessible de la ligne de tâche sans gabarit au guide ni au catalogue (« délai » codé en dur) ; alertes, estimation, objectifs et compteur non annoncés dans les listes | Inscrite, P1 (RC-US-002-10) |
| DT-018 | Navigation entre les espaces « Tâches » et « Objectifs » provisoire (`main.tsx`) : ni barre d'onglets en bas avec icônes (smartphone), ni barre latérale (PC), guide §2.2, §4.14 ; non spécifiée par ST-US-002 | Inscrite, P2 |

Actions d'Anthony : **A-1** ST-US-002 v suivante : `LigneTache.attente` (§4.5, renvoi à ST-US-017 n° 17), `ModeleVueDetailTache.objectifs.ids` (RC-US-002-3), composition dans `objectifs-taches.ts` (§3 n° 20), `espace-taches.tsx`, `magasin-taches.ts` et `libelles-ui.ts` au §3. **A-2** ST-US-017 §12.1 : étapes B3 et B11.

## 9. Verdict : **Changements requis**

Aucune remarque bloquante ; domaine, application et modèles de vue conformes, tests E10 intacts, banc de test accepté (B1 à B12), rattachement des scénarios d'US-018 et d'US-031 confirmé. Trois majeures (RC-US-002-1 focus et état d'erreur de l'estimation, RC-US-002-2 refus du détail ignorés, RC-US-002-3 rattachement par intitulé) et cinq mineures (RC-US-002-4 à 8) à corriger sur une branche corrective, la PR ayant été fusionnée avant le verdict.
