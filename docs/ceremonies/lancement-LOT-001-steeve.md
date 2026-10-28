# Revue de lancement de LOT-001 : avis de Steeve (E11, ergonomie)

Date : 2026-10-27. Référence : conception complète au commit 9597df8, guide d'ergonomie v0.2.13 (porté à v0.2.14 par cette revue), maquettes ECR-xxx.

**Avis : favorable au lancement, sans remarque bloquante.** Sept remarques non bloquantes (S1 à S7), à traiter par Anthony avant l'E12 du rang concerné. Les corrections qui relevaient de mes livrables (guide, maquette) sont déjà faites.

## 1. Périmètre relu

- Sections de présentation et de modèles de vue des ST-US-001, 023, 002, 024, 003, 025, 022, 017, 018 et 031.
- Tests `tests/unitaires/**/presentation` : liste et détail des objectifs, sélecteur de parent, listes et détails des tâches, formulaires, confirmations, messages de refus, indicateur, bandeaux, écran de connexion, section compte.
- Contrôle automatique : tous les codes de catalogue cités dans les ST et les tests existent dans le guide (aucun code orphelin). Les codes créés en E9 (`SEC-*`, `SYN-REDIRECTION`, `SYN-FEUILLE-STOCKAGE`, `ALR-015`, `CNF-REPRENDRE-SOUS-TACHE`) sont repris par les ST concernées.

## 2. Points vérifiés, conformes

- Ordre des listes (guide §5.8) : `comparerOrdreReference` partagé (délai, sans délai à la fin, création, intitulé, id) ; section « Atteints » repliée avec `n` ; sous-objectifs sous leur parent sans déplacement ; trois sections de tâches avec tris du §5.7 ; une seule liste de sous-tâches, tous états ; aucune sous-tâche sous une tâche terminée ou abandonnée (Q-US-002-4). Les tests UT-US-001-35, 023-21, 002-33, 002-35 et 024-23 vérifient ces règles.
- Indicateur et bandeaux : `SYN-SESSION` jamais hors ligne (Q-ST022-STE-3 b), variante `session` du rappel en ligne seulement, un seul bandeau à la fois, seuil de 24 h strict.
- Écran d'attente `SYN-REDIRECTION` (ECR-010, cadre « Attente ») : code, texte et `role="status"` conformes.
- Retour de session dans un autre onglet : aucun message, conforme à la décision du guide v0.2.13.
- Accessibilité : noms accessibles de lignes (objectifs, tâches), `alertdialog` avec « Annuler » focalisé, erreurs de connexion en `role="alert"`, indicateur en `role="status"`, refus annoncé sur « Terminer » avec sous-tâches restantes.
- États : vide (`EVD-*`), hors ligne (rien de désactivé, `SYN-HORS-LIGNE`, bouton « Synchroniser maintenant » `aria-disabled`), erreur (`ERR-*` avec focus et saisie conservée), données locales affichées aussitôt (pas d'écran de chargement des listes).

## 3. Remarques

| N° | Référence | Constat | Correction attendue | Bloquante |
|---|---|---|---|---|
| RL-LOT-001-S1 | ST-US-001 §4.5 et §6.6 (`ModeleVueListeObjectifs.etatVide`) ; UT-US-001-30 | `EVD-OBJECTIFS` n'est produit que sans aucun objectif. Si tous les objectifs principaux sont atteints, `lignes` est vide et seule la section repliée « Atteints (n) » reste : écran presque vide, sans action. | Ajouter `EVD-OBJECTIFS-TOUS-ATTEINTS` (« Tous vos objectifs sont atteints. », action « Créer un objectif ») au type `etatVide`, produit quand `lignes` est vide et `sectionAtteints` présente ; un test dans UT-US-001-30. **Code créé dans le guide v0.2.14 (§6.6.5).** | Non bloquante (avant l'E12 du rang 2) |
| RL-LOT-001-S2 | ST-US-002 §6.6 « chaque section est présente même vide (n = 0) » ; UT-US-002-33 | Le modèle de vue garde les trois sections à n = 0, ce qui est acceptable, mais la ST ne dit pas ce que l'écran affiche. Rendre « Terminées (0) » et « Abandonnées (0) » contredirait ECR-003 B (objectif sans tâche, un seul état vide) et le principe « supprimer avant d'ajouter ». | Ajouter dans le §6.6 et la colonne « États » du §4.5 la règle de rendu du guide §5.8 (g) : sections à n = 0 non affichées, sauf « Tâches à faire · 0 » si l'objectif a au moins une tâche ; sans tâche, seul `EVD-OBJECTIF-SANS-TACHE`. Aucun changement de modèle de vue. **Règle ajoutée au guide v0.2.14.** | Non bloquante (avant l'E12 du rang 5) |
| RL-LOT-001-S3 | ST-US-017 §4.5 (`construireFeuilleSynchronisation`, `SYN-FEUILLE-EN-ATTENTE`) et §6.6 (informations à lire) | L'ordre des deux listes de la feuille n'est fixé nulle part : « une ligne par élément » et les `DiscardedItem`. C'est le même défaut que Q-US-001-6. | Appliquer le guide §5.8 (f), **ajouté en v0.2.14** : modifications en attente et informations à lire, la plus récente d'abord ; à égalité, intitulé ; `ALR-014` groupé sous `ALR-008` dans le même ordre. Ajouter un test à UT-US-017 (incrément 1 pour les modifications en attente, incrément 2 pour les informations). | Non bloquante (avant l'E12 du rang 3 pour la liste des modifications) |
| RL-LOT-001-S4 | ST-US-024 §4.5 (`sousTaches.lignes`) | Les lignes de sous-tâches n'ont pas de `nomAccessible`, alors que `LigneTache` en a un et que la case « Terminer » doit être nommée (WCAG 4.1.2). | Ajouter `nomAccessible` (« Terminer « {intitulé} » » pour la case ; nom de ligne avec état et délai) et l'assertion dans UT-US-024-16 ou 23. | Non bloquante (avant l'E12 du rang 6) |
| RL-LOT-001-S5 | ST-US-022 §2.1 (CA-1) et §4.5 (`construireRacine`) ; UT-US-022-08 et 40 | `construireRacine` (`CONNEXION`, `ATTENTE_GOOGLE`, `APPLICATION`) est cité en traçabilité mais aucun test de présentation ne le couvre (`tests/unitaires/compte/presentation` ne contient que `ecran-connexion` et `section-compte`). `data-etat="SYN-REDIRECTION"` n'est donc pas vérifié. | Ajouter un test (nouveau UT-US-022 ou extension de UT-US-022-40) : `ATTENTE_GOOGLE` → écran d'attente avec `SYN-REDIRECTION` ; sans session → `CONNEXION` ; session ouverte → `APPLICATION`. | Non bloquante (avant l'E12 du rang 1) |
| RL-LOT-001-S6 | ST-US-022 §6.10 (`SAISIE_A_TERMINER`), §8 ligne 7 b, UT-US-022-54 ; guide v0.2.14 §6.6.6 (Q-ST022-STE-4) | Le résultat `SAISIE_A_TERMINER` n'a pas de rendu spécifié. De plus, aucune sortie n'est prévue si la redirection silencieuse ne revient jamais (réseau qui pend après le départ) : l'écran d'attente pourrait durer sans fin. | (1) Faire produire par `SAISIE_A_TERMINER` le toast `TST-SAISIE-A-TERMINER` (réponse à Q-ST022-STE-4, ajoutée au §16) et l'asserter dans UT-US-022-54. (2) Avec Starck, fixer un délai maximal de l'écran d'attente (proposition : 10 s, puis retour à l'application sans jeton, donc `SYN-SESSION` avec `ERR-015` ; jamais de boucle). Si l'avis de Starck diffère, me le signaler. | Non bloquante (avant l'E12 du rang 1) |
| RL-LOT-001-S7 | ST-US-018 §6 (persistance), UT-US-018-04 | Les attributs d'accessibilité de la ligne « Stockage » et de la carte `ALR-015` ne sont pas précisés. | Préciser : la ligne est du texte simple (pas de contrôle) ; la carte est en `role="status"` (pas `alert` : non urgent, jamais bloquant), non fermable, avec `data-etat` `PROTEGE` / `NON-PROTEGE` observable ; l'ajouter à UT-US-018-04. | Non bloquante (avant l'E12 du rang 12) |

## 4. Réponse à Q-ST022-STE-4 (ST-US-022)

Quand une saisie en cours empêche le repli par redirection (`RedirectionNonPermise` → `SAISIE_A_TERMINER`) : **option a), le toast d'Anthony.**
- Code `TST-SAISIE-A-TERMINER`, texte « Terminez votre saisie, puis reprenez la synchronisation. », 4 s, `role="status"`, sans action.
- L'indicateur reste `SYN-SESSION` ; rien n'est perdu ni lancé.
- Besoin : l'utilisateur a demandé une chose que l'application refuse pour le protéger ; il faut qu'il comprenne quoi faire en une ligne. L'option b) (« Abandonner la saisie et reprendre ») est écartée : on n'offre pas de détruire une saisie pour une opération technique.
- Consigné au guide v0.2.14 (§6.6.6 et §6.6.11) et au §16 de ST-US-022.

## 5. Corrections déjà faites dans mes livrables

- `docs/02-ux/guide-ergonomie.md` v0.2.14 : `TST-SAISIE-A-TERMINER`, `EVD-OBJECTIFS-TOUS-ATTEINTS`, §5.8 (f) et (g), ligne du §6.6.11.
- `docs/02-ux/maquettes/ECR-003-detail-objectif.html` : dans le cadre « Cible, tous lots » (objectif vide, sous-objectif de « Remise en forme »), le bouton « Ajouter un sous-objectif » contredisait RG-022 (un seul niveau) et la légende ; il est remplacé par la mention déjà présente dans la maquette LOT-001. Le périmètre de LOT-001 n'était pas touché.
- `docs/04-specification-technique/ST-US-022.md` : seule la ligne de réponse à Q-ST022-STE-4 a été ajoutée au §16.

## 6. Réponse d'Anthony (2026-10-28)

| # | Réponse | Où |
|---|---|---|
| S1 | Corrigée : `etatVide` accepte `EVD-OBJECTIFS-TOUS-ATTEINTS`, produit quand `lignes` est vide et que la section des atteints est présente. Test ajouté à UT-US-001-30. | ST-US-001 §4.5, §6.6, §13 |
| S2 | Corrigée : la règle de rendu du §5.8 (g) est ajoutée au §6.6 et à la colonne « États » du §4.5. Le modèle de vue est inchangé. | ST-US-002 §4.5, §6.6 |
| S3 | Corrigée : `comparerLignesFeuille` (la plus récente d'abord, à égalité l'intitulé, puis l'identifiant) sert aux modifications en attente (incrément 1) et aux informations à lire (incrément 2). Test UT-US-017-33. | ST-US-017 §4.5, §13.1 |
| S4 | Corrigée : `nomAccessible` est ajouté à la ligne de sous-tâche, et `caseTerminer.nomAccessible` (« Terminer « {intitulé} » ») à sa case. Test ajouté à UT-US-024-16. | ST-US-024 §4.5, §13 |
| S5 | Corrigée : `racine.ts` est créé (`ATTENTE_GOOGLE` → `SYN-REDIRECTION`, avec son nom accessible). Test UT-US-022-59. | ST-US-022 §4.5, §13 |
| S6 | Corrigée. (1) `construireRetourReprise` produit `TST-SAISIE-A-TERMINER`, testé dans UT-US-022-54. (2) Avec l'accord de Starck (guide v0.2.15), l'écran d'attente dure au plus 10 s. Ensuite, `abandonnerAttenteGoogle` ouvre l'application sans jeton (`SYN-SESSION` avec `ERR-015`), sans nouvelle redirection. Test UT-US-022-58. DEC-038 confirme l'écran à chaque ouverture avec réseau. | ST-US-022 §6.2, §6.10, §8 n° 7 e, §13 |
| S7 | Corrigée : la ligne « Stockage » est du texte simple avec `data-etat`, et la carte `ALR-015` est en `role="status"`, non fermable. Ajouté à UT-US-018-04, qui sera écrit en E10 au rang 12. | ST-US-018 §6, §13 |

**Point soumis à Steeve, issu de RL-LOT-001-A1 et non bloquant pour l'E11, à trancher avant l'E12 du rang 1.** Pour `ERR-017`, le guide v0.2.15 indique « la session reste ouverte, aucune donnée touchée » et « Vos données n'ont pas été supprimées ». Or une demande de suppression IndexedDB en attente ne peut pas être annulée : elle aboutira dès que l'autre fenêtre se fermera. La conception retient donc le comportement suivant :
- « Réessayer » attend de nouveau, au plus 5 s ;
- « Fermer » ramène cet onglet à l'écran de connexion, car la session mémorisée est déjà effacée.

Je propose ce texte : « La suppression se terminera dès que les autres fenêtres de Done Juan seront fermées. Fermez-les, puis réessayez. »
