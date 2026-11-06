# Registre des anomalies

Gravités : Bloquante · Majeure · Mineure · Cosmétique (définitions dans `docs/workflow.md`).
Les anomalies bloquantes et majeures sont corrigées dans le cadre de l'US. Les anomalies mineures et cosmétiques sont planifiées par le commanditaire.

| Anomalie | US | Détectée par | Type de test | Gravité | Description | Statut | Itérations |
|---|---|---|---|---|---|---|---|
| ANO-001 | US-017 (incrément 1) ; touche aussi US-018 et US-031 | Anthony, revue E13 de la PR #9 (O-1, `docs/ceremonies/revue-code-LOT-001-rang3-reliquat.md` §8.4), qualifiée par Pepper le 2026-10-30 | Revue de code (non couverte par un scénario) | Majeure | L'indicateur de synchronisation et la feuille « Compte et synchronisation » (ECR-011) ne reflètent pas l'issue d'un cycle mené sans geste de l'utilisateur (déclencheurs de RG-017 / US-017 : 5 s après une modification, toutes les 2 min, retour au premier plan) : ils ne sont mis à jour qu'au geste suivant ou à un changement de session ou de réseau. Exigences non tenues : US-017 CA-3 (accès Google expiré pendant l'utilisation : l'indicateur propose « Reprendre la synchronisation », sans geste préalable), CA-7 (modifications signalées comme non synchronisées puis enregistrées sans action de l'utilisateur : le décompte « Modifications en attente » doit retomber), impacts ergonomie d'US-017 (l'indicateur affiche l'heure du dernier échange ; « Action requise » interrompt). Défaut présent depuis le rang 1. Lacune de test associée : aucun scénario n'asserte l'indicateur après un cycle sans geste ; Scénarios de non-régression US-017 S06c à S06f ajoutés par Pepper le 2026-10-30 (rang 3), en rouge tant que le correctif n'est pas livré. | Corrigée, en revue | 0 |
| ANO-002 | US-001 (CA-1 : création d'un objectif) ; touche aussi US-002 (saisie rapide) et le guide d'ergonomie §2.2 (navigation smartphone) | Commanditaire, première recette de LOT-001 (rangs 0 à 9), issue GitHub #30 « l'affichage ne fonctionne pas bien sur smartphone », qualifiée par Pepper le 2026-11-06 | Recette du commanditaire | Majeure (à réévaluer en Bloquante si le commanditaire confirme qu'il n'a aucun autre moyen de créer un objectif sur smartphone, notamment depuis l'application installée) | Texte du commanditaire : « Si je ne mets pas en mode bureau dans le navigateur, je ne vois pas les options créer l'objectif ». Sur smartphone, en affichage normal (étroit), l'action de création d'un objectif n'est pas visible ; elle n'apparaît qu'en demandant le mode bureau du navigateur (affichage large). Exigences non tenues : US-001 CA-1 (l'utilisateur crée un objectif) sur l'appareil visé en priorité ; guide d'ergonomie §2.2 (smartphone < 600 px : barre d'onglets en bas, bouton flottant « + » sur la vue Objectifs ; ECR-008 A, B et état vide « Créer un objectif ») ; parcours P-02 étape 1. Gravité : la fonction principale du lot (créer un objectif) n'est pas utilisable sans contournement simple, le mode bureau n'étant ni prévu ni évident ; elle serait Bloquante si ce contournement n'existe pas partout. Cause non recherchée (enquête de Benjamin en cours). Lacune de test : aucun scénario n'asserte l'interface à largeur smartphone (voir « Scénario de non-régression » ci-dessous) ; la lacune de vérification est la même que pour l'ANO-001, les scénarios s'exécutant au niveau des cas d'usage. | Ouverte | 0 |
| ANO-003 | US-001 (CA-1, CA-4 : création d'un objectif, détail de l'objectif) ; touche aussi US-002 (création d'une tâche) | Commanditaire, première recette de LOT-001 (rangs 0 à 9), issue GitHub #31 « quand je clique sur créer un objectif, il me crée une tâche... », qualifiée par Pepper le 2026-11-06 | Recette du commanditaire | Bloquante | Titre du commanditaire : « quand je clique sur créer un objectif, il me crée une tâche... » (corps de l'issue vide : appareil, écran de départ et élément créé non précisés, voir questions Q-ANO-003-1 à 8). L'action « Créer un objectif » produit une tâche au lieu d'un objectif. Exigences non tenues : US-001 CA-1 (un objectif est créé avec intitulé, description, délai facultatif) ; ECR-008 B (après « Créer l'objectif », le détail de l'objectif créé s'ouvre, état « à décliner en tâches ») ; P-02 étapes 1 à 3 ; RG-001/RG-002 (nature de l'élément créé). Gravité : fonction principale détournée, et des tâches parasites sont ajoutées aux données de l'utilisateur (donc synchronisées dans son Drive) ; l'objectif n'existe pas, donc rien ne peut lui être rattaché. Cause non recherchée. Lacune de test : les scénarios US-001 S01 à S03 passent au niveau des cas d'usage et ne détectent pas un branchement erroné de l'interface (voir ci-dessous). | Ouverte | 0 |

**Scénarios de non-régression à prévoir (Pepper, 2026-11-06) pour ANO-002 et ANO-003.** La spécification décrit déjà le comportement attendu dans les deux cas (US-001 CA-1, guide §2.2 et ECR-008, parcours P-02) : aucune règle, aucune US ni aucun écran à modifier. Aucun scénario n'est encore ajouté au `.feature` : les formes d'étape existantes agissent au niveau des cas d'usage (« l'utilisateur crée un objectif … »), qui passeraient déjà au vert malgré le défaut, et un test réel de l'interface exige des étapes nouvelles (largeur d'écran, action proposée à l'écran, élément créé par un geste), donc une version 1.13 du glossaire d'étapes, soumise à Anthony et Starck. Scénarios proposés, tag `@ihm`, à ajouter à `US-001-creer-et-gerer-un-objectif.feature` après cette mise à jour du glossaire :

```gherkin
  @US-001 @RG-002 @LOT-001 @ihm @ANO-002
  Scénario: S23 — Sur un smartphone en affichage normal, l'action de création d'un objectif est visible sans mode bureau
    Étant donné que l'application est ouverte sur le smartphone, avec une largeur d'écran de 390 px
    Quand l'utilisateur consulte la liste des objectifs
    Alors l'action "Nouvel objectif" est proposée à l'écran

  @US-001 @RG-002 @LOT-001 @ihm @ANO-003
  Scénario: S24 — L'action de création d'un objectif crée un objectif et jamais une tâche
    Étant donné que l'application est ouverte sur le smartphone, avec une largeur d'écran de 390 px
    Quand l'utilisateur crée un objectif "Publier le guide" de délai 2026-12-15 par l'action de création de la liste des objectifs
    Alors il existe 1 objectif d'intitulé "Publier le guide"
    Et aucune tâche n'existe
    Et le détail de l'objectif "Publier le guide" est affiché
```

Étapes nouvelles requises (donc non ajoutées) : « avec une largeur d'écran de n px », « l'action "X" est proposée à l'écran », « … par l'action de création de la liste des objectifs », « le détail de l'objectif "X" est affiché ». Même scénario à décliner à 1280 px (PC) et sur l'état vide (« Créer un objectif », EVD-OBJECTIFS) une fois la reproduction établie. Libellé à trancher : le bouton s'appelle « Nouvel objectif » (FAB, ECR-008 A) et « Créer un objectif » (état vide) ; à vérifier lors de la reproduction que le commanditaire parle bien du même bouton.

**Questions au commanditaire pour reproduire (ANO-002 et ANO-003).**
1. Q-ANO-002-1 — Quel appareil (marque, modèle) et quelle version du système (Android, iOS) utilisez-vous ?
2. Q-ANO-002-2 — Quel navigateur (Chrome, Safari, Firefox, autre), et l'application est-elle ouverte dans le navigateur ou installée sur l'écran d'accueil ?
3. Q-ANO-002-3 — Le téléphone est-il tenu à la verticale ou à l'horizontale ? Connaissez-vous la taille de l'écran, ou pouvez-vous en joindre une capture ?
4. Q-ANO-002-4 — Quel onglet est affiché en bas (Tâches, Objectifs, autre) quand vous ne voyez pas l'option, et que voyez-vous exactement (barre d'onglets, bouton rond « + », texte) ? Une capture d'écran en affichage normal puis en mode bureau aiderait.
5. Q-ANO-002-5 — Dans le mode bureau, quel bouton ou menu utilisez-vous pour créer l'objectif, et comment s'appelle-t-il ?
6. Q-ANO-003-1 — Sur quel appareil et quel affichage (smartphone normal, mode bureau, PC) avez-vous cliqué ?
7. Q-ANO-003-2 — Quel onglet ou écran était affiché au moment du clic (Objectifs, Tâches, détail d'un objectif) ?
8. Q-ANO-003-3 — Quel bouton exactement avez-vous touché : le bouton rond « + », « Nouvel objectif », « Créer un objectif » (écran vide) ou « Créer l'objectif » (en bas de la feuille de saisie) ?
9. Q-ANO-003-4 — Quelle feuille de saisie s'est ouverte : « Nouvel objectif » ou « Nouvelle tâche » ? Demandait-elle un délai et une estimation de durée ?
10. Q-ANO-003-5 — Qu'avez-vous saisi (intitulé, délai) et qu'avez-vous vu juste après : quel écran s'est ouvert ?
11. Q-ANO-003-6 — La tâche créée est-elle visible dans la liste « Tâches » ? Avec quel intitulé, quel délai et quelle estimation ? Est-elle rattachée à un objectif ?
12. Q-ANO-003-7 — L'objectif attendu est-il absent de la liste « Objectifs », ou est-il présent en plus de la tâche ?
13. Q-ANO-003-8 — Cela se produit-il à chaque fois, ou seulement dans certaines conditions (premier lancement, application sans réseau, après une première création) ? Le même défaut est-il constaté sur PC ?
