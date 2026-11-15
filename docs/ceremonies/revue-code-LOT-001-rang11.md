# Revue de code E13 — LOT-001, rang 11 (US-017, incrément 4 : horloge, consultation seule, éléments inconnus, DT-036 ; DT-030 reliquat)

| Élément | Valeur |
|---|---|
| Relecteur | Anthony |
| Date | 2026-11-08 |
| Branche | `us/US-017-rang11` @ `cae720d` (PR #35 en brouillon, base `lot/LOT-001`) |
| Auteurs | Bruce (opus) : H1 (domaine horloge, inconnus, réception), H2 (Dexie v4, format), H3 (`SuiviHorloge`, `ClientGoogle`), H4 (cycle, sortie, DT-036), compléments UT-COMP-US-017-4-21 à 4-50. Benjamin (sonnet) : D1 (modèles de vue, décorateur, `MiseAJourServiceWorker`), D2 (interface, consultation seule, `ERR-013`), D3 (composition, banc, étapes, `rangCourant` 11), D4 (DT-030 reliquat), compléments UT-COMP-US-017-4-01 à 4-16, 4-51 à 4-77. Starck (DAT v0.11.11), Steeve (guide v0.2.23). |
| Périmètre | Différentiel `origin/lot/LOT-001...origin/us/US-017-rang11` : 131 fichiers, + 8 009, − 488 (src/ et tests des tranches H1 à H4, D1 à D4) |
| Référentiel | ST-US-017 v0.11.2 (§3.6, §4.8, §6.8 n° 1 à 22, §12.7, §13.6, §14, §15.3), ST-US-024 v0.7 §6.8, DAT v0.11.11 (§4.2, §4.2.2, §6.4), guide d'ergonomie v0.2.23 §6.6.14, `checklist-revue-code.md` v0.3, revue du rang 10 |
| Passage | 2 (E13 bis, OPT-18) : voir le § 9 |

## 1. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `pnpm verifier` (format, lint, types, architecture, catalogue, tags, rangs, hygiène) | **0 erreur.** |
| `pnpm test` (local, Node 24, `rangCourant` = 11) | **1 371 / 1 371** (258 fichiers). |
| `pnpm cucumber` (local, profil `default`) | **404 / 404 scénarios** (387 au rang 10, + 17 exécutions du §12.7, S01 compris). |
| CI de `cae720d` (`push` et `pull_request`) | **Verte sur les 7 contrôles** (`qualite`, `securite`, `build`, `e2e`, `tests` dans les trois fuseaux, non-régression de couverture par fichier comprise). Les rouges de `d9fa04c` et `5d07104` venaient de la couverture par fichier mesurée au rang 10 avant que D3 porte `rangCourant` à 11 : sans objet à la tête. |
| Mutations locales (non commitées, annulées) | (1) Transaction finale de la reprise réécrite sur la liste **initiale** (`liste.filter` au lieu de `listeCorbeille(m).filter`, `cycle-synchronisation.ts:1285`) : **560 / 560 verts**, la règle n° 22 c n'est couverte par aucun test (RC-US-017-19). (2) Garde C1 retirée (`:1320`) : UT-US-017-127 rouge, la garde est couverte. (3) Tri des événements inconnus retiré de la doublure mémoire : **653 / 653 verts**, le tri des entrées de `lireInconnus` n'est pas couvert (RC-US-017-20). |
| Rangs | `rangCourant` = 11. Les 10 fichiers créés dans `src/` figurent dans `rangs-fichiers.json` (`debut = fin = 11`), y compris les deux hors liste (`consultation-seule.tsx`, `retour-mise-a-jour.ts`) ; `fin` portée à 11 pour `depot-local-dexie.ts` et `stockage-local/schemas.ts`. `rangs-tests.json` : `CT-DEPOT-1[6-9]` → 11 avant `CT-DEPOT-1[4-9]` → 10 ; `UT-COMP-US-017-4-\d+` → 11 avant `UT-COMP-US-017-3-\d+` → 10 ; `UT-COMP-US-024-2\d`, `UT-US-024-(2[5-9]|3\d)`, `UT-US-017-1[2-3]\d` → 11. L'ordre « la première règle l'emporte » est respecté. Les deux entrées hors liste sont ajoutées en fin de fichier, hors ordre alphabétique (RC-US-017-28). |
| Numérotation `-4-` | UT-COMP-US-017-4-01 à 4-16 (Benjamin, D1), 4-21 à 4-50 (Bruce), 4-51 à 4-77 (Benjamin, D2, D3) : **aucun doublon** (les identifiants comptés deux fois sont cités dans l'en-tête de leur fichier). 4-17 à 4-20 non attribués : sans effet. |
| Migration | Base Dexie **version 4**, ajout pur de `registresInconnus` (clé `cle`) et `evenementsInconnus` (clé `id`), sans `upgrade`. Une base v3 s'ouvre en v4 sans perte (UT-COMP-US-017-4-21). Les deux clés de méta d'appareil (`mesuresHorloge`, `aMettreALaCorbeille`) sont exclues de `NOMS_META_REINITIALISES` (CT-DEPOT-17, sur les deux adaptateurs). **Conforme.** |
| Sécurité | Aucun secret, jeton, `localStorage`, `console`, `dangerouslySetInnerHTML` ni évaluation dynamique ajouté. `ClientGoogle` ne transmet à l'observateur que des instants et l'en-tête `Date` (aucun jeton, aucune URL). Journaux nouveaux (`CorrectionHorlogeNonEcrite`, `SautHorloge`, `ReculHorlogeOuverture`, `ValeurRecueDuFutur`, `CorbeilleNonMemorisee`) : un type d'erreur ou un écart en millisecondes, aucune donnée personnelle. Les inconnus (`valeur`, `brut`) sont des données de l'utilisateur gardées telles quelles, jamais journalisées ni évaluées. `MiseAJourServiceWorker` ne télécharge rien et n'ouvre aucune boutique (DEC-034). **Conforme.** |

## 2. Convergence (point 1)

### 2.1 Horloge et correction (H1, H3)

| Mécanisme | Constat |
|---|---|
| Mesure (`mesurerEcart`, `lireDateHttp`) | Aller-retour sur la monotone, retenu si `0 ≤ a < 3 s` ; milieu `envoiMurale + ⌊a / 2⌋` ; IMF-fixdate seule, jour de la semaine et date civile vérifiés par aller-retour, seconde intercalaire refusée. Fonctions pures. **Conforme** (UT-US-017-75, 79). |
| Lissage (`retenirMesure`, `medianeCorrection`) | 5 dernières, médiane, pair : moyenne arrondie vers −∞. **Conforme** (UT-US-017-76). |
| Écriture (`SuiviHorloge`) | Une transaction `appliquerSynchronisation` par mesure : méta `mesuresHorloge` toujours écrite, état seulement si la correction change (CT-DEPOT-16). File de promesses : un traitement à la fois, dans l'ordre d'arrivée (UT-COMP-US-017-4-33). Une exception ou un échec du dépôt est journalisé, jamais propagé (4-31, 4-32, 4-37). Avant `demarrer` et après `arreter`, rien. **Conforme.** |
| Sauts | Repère en mémoire, contrôle chaque minute et au retour au premier plan, **avant** `definirPremierPlan(true)` (`web.ts`, `auChangementDeVisibilite` ; banc identique). Seul un recul est corrigé, exactement (correction et mesures + R). Avance : journal seul. Bornes ±2 s comprises dans « aucun ». **Conforme** (UT-US-017-77, 81). |
| Recul à l'ouverture | `ReculHorlogeOuverture` si `physique(dernierHlc) − (maintenant + correction) > 2 s` ; la correction est comptée (4-35). **Conforme.** |
| Effet sur la convergence | La correction est **locale** (jamais synchronisée) ; elle ne change que l'heure physique proposée à `hlcSuivant`, qui garde `max(physique corrigée, dernier HLC + 1)` : l'HLC ne recule jamais, même après un recul corrigé. La fusion reste celle du rang 9 (aucun fichier du noyau touché, sauf `fusion.ts` pour n° 15). `attenteDe` ramène `plusAncienneEnAttente` à l'heure de l'appareil (n° 5). **Aucun effet sur la convergence.** |

### 2.2 Éléments inconnus (H1, H2, H4)

| Mécanisme | Constat |
|---|---|
| Décodage (`format-v1.ts`) | Type absent de `TYPES_ELEMENT`, ou champ sans schéma pour un type connu → `RegistreInconnu` (`hlc`, `contexte` traduits, contexte vide omis). Entrée de journal d'un type inconnu → `EvenementInconnu` si `id` non vide et `hlc` valide, ignorée sinon. Un registre inconnu dans une valeur écartée fait ignorer l'entrée (H-12). `inconnus` présent si et seulement si non vide, trié par `fusionnerInconnus(INCONNUS_VIDES, …)`. **Conforme** (UT-US-017-86 ; UT-US-017-14 modifié en E10). |
| Encodage | Inconnus écrits **à la suite** des éléments connus, dans l'ordre de `contenu.inconnus` (l'encodeur ne trie pas) ; table d'appareils étendue à leurs HLC et contextes. Fichier figé du schéma 1 relu et réécrit à l'identique (UT-US-017-88). **Conforme**, avec une dépendance implicite à l'ordre de `lireInconnus` (ci-dessous). |
| Fusion (`fusionnerInconnus`) | Registres : plus grand HLC par clé, à égalité celui de `a` (une égalité de HLC, appareil compris, désigne la même écriture) ; entrées : union par `id`. Commutative, associative, idempotente au sens des clés et des HLC (UT-US-017-85 ; 4-46 dans les deux ordres de lecture). **Converge.** |
| Cycle (`#integrer`) | `ajouts = inconnusAEcrire(locaux, reçus)` dans le pré-contrôle et dans la transaction, `fusionNonDeposee: true` si non vides ; les inconnus locaux suivent les intégrations successives du cycle (`lu.inconnus` mis à jour par fichier). Dépôt : `contenuAEnvoyer(…, { inconnus })` avec tous les inconnus locaux. HLC reçu = maximum des registres, du journal **et** des inconnus (n° 15). **Conforme** (UT-US-017-87, deux cas). |
| **Tri implicite de `lireInconnus`** | Dexie rend les lignes dans l'ordre de leur clé primaire (`cle` = `cleInconnue`, `id`), qui est l'ordre des unités de code de `comparerTextes` : **le tri est correct mais implicite**, et la doublure mémoire trie explicitement. **Couverture** : CT-DEPOT-18 écrit `importance` puis `couleur` et attend `[couleur, importance]` : le tri des **registres** est vérifié sur les deux adaptateurs. Il n'y a **qu'une** entrée inconnue dans CT-DEPOT-18 et les entrées d'UT-COMP-US-017-4-22 sont écrites déjà triées : le tri des **entrées** n'est vérifié par aucun test (mutation (3) du §1). Effet d'un défaut : ordre non canonique des entrées dans le fichier déposé, sans effet sur la fusion (le décodeur retrie). → RC-US-017-20 (mineure). |
| Limite de conception (hors réalisation) | Rien ne **requalifie** un inconnu quand une version qui connaît son type ou son champ est installée : la ligne reste dans `registresInconnus` et `contenuAEnvoyer` la réécrit à côté du registre connu de même clé. Sans effet au lot 1 (aucune version ne connaît encore de champ en plus) ; à régler avant la première évolution compatible du schéma 1. C'est une lacune de ma ST, pas de la réalisation : **DT-037** (P2) et Q-ANT-E13-R11-3 (§5). |

### 2.3 Consultation seule (H4)

`FORMAT_PLUS_RECENT` reste décidé en un seul point (`controlerDrive`, rang 10). Sous cette décision : aucun dépôt, manifeste, corbeille ni reprise ; aucune fusion ni écriture de méta ou d'état ; rien d'effacé (UT-US-017-84, deux premiers cas, et UT-US-017-123 : `ecrituresPar` inchangé, liste de corbeille gardée). `DepotAvantSortieSynchro` rend `NON_TENTE` **avant** le contrôle du réseau et de l'accès, sans appeler le cycle (UT-US-017-84, UT-COMP-US-017-4-38). Le décorateur relit l'état à chaque `modifier` (4-10) ; « Compris » et le suivi d'horloge écrivent localement, comme prévu (n° 7, n° 9). **Conforme.**

### 2.4 Reprise de corbeille (DT-036, H4)

| Point | Constat |
|---|---|
| Inscription (n° 18 à 20) | Par une transaction de méta, sans doublon de `type` et `id`, journal `MiseALaCorbeilleDifferee` (champ `erreur`) ou `DossierQuitteConserve` ; un échec d'inscription est journalisé (`CorbeilleNonMemorisee`), l'issue reste `TERMINE` (4-39). Déménagement : `{FICHIER, DOSSIER_QUITTE}` sans examen du dossier si l'ancien propre résiste, `{DOSSIER_QUITTE}` seul sinon (UT-US-017-120, 4-42, 4-43). Doublon de manifeste : l'écriture réussit et rend `doublonNonSupprime` + `erreurDoublon` (n° 22 a ; UT-US-017-122, 4-48). **Conforme.** |
| Reprise (n° 21) | Seulement depuis `#nettoyer`, appelé à la fin de `SYNCHRONISER` et de `RESTAURER` (relance comprise) ; ni sous `ALTERATION`, ni sous `FORMAT_PLUS_RECENT`, ni par le dépôt seul (4-44). Liste lue dans `vue.lu.meta` (n° 22 c : aucune lecture de plus). Ordre respecté ; `DOSSIER_QUITTE` examiné seulement si aucun `FICHIER` précédent n'est resté (UT-US-017-121) ; `RessourceIntrouvable` à la reprise → retiré (4-40, 4-47) ; dossier qui contient un autre appareil → retiré sans suppression (C5). **Conforme.** |
| **Garde C1** | `id === vue.inventaire.manifestes[0]?.id` : le premier manifeste de l'inventaire, en ordre canonique, est celui que le cycle retient. Couverte par UT-US-017-127 (mutation (2) : rouge). **Conforme.** |
| **Transaction finale (n° 22 c)** | `listeCorbeille(m).filter(…)` relit la méta **dans** la transaction et ne retire que les clés traitées : les entrées inscrites pendant le cycle sont conservées. **La réalisation est correcte, mais aucun test ne le vérifie** : il n'existe pas de test nommé pour ce cas, et la mutation (1) du §1 reste verte. Le défaut qu'elle simule effacerait en silence l'inscription d'un ancien fichier propre (copie de données personnelles qui survivrait à un « Repartir de zéro »), c'est-à-dire le défaut même que DT-036 rembourse. → **RC-US-017-19 (majeure)** : UT-COMP exigé. |
| Interdit sous `ALTERATION` | Le titre d'UT-US-017-123 (mon test, E10) annonce « sous ERR-012 », mais son corps ne passe que par `FORMAT_PLUS_RECENT`. La garantie tient par construction (`#nettoyer` n'est pas appelé sous `ALTERATION`), sans test. → RC-US-017-23 (mineure ; l'écart vient de moi). |
| « Repartir de zéro » | `aMettreALaCorbeille` survit à `reinitialiser` (CT-DEPOT-17, deux adaptateurs) ; la relance du n° 11 relit la méta et reprend la liste. Un doublon d'une génération abandonnée est donc mis à la corbeille (Q-ST017-STA-8 c, DAT v0.11.11). **Conforme.** |
| Limite acceptée | `rejoindreCanonique` (`ecriture-manifeste.ts:175-180`) : si la mise à la corbeille du doublon **et** la relecture du canonique échouent, l'erreur de relecture est rendue et le doublon n'est pas inscrit (UT-COMP-US-017-4-49). Un manifeste ne contient aucune donnée personnelle et les manifestes se joignent par maximum : pas de perte, pas d'effet sur la fusion. Consignée dans DT-036 ; suggestion RC-US-017-22. |

**Conclusion : le rang 11 ne dégrade pas la convergence du noyau, et ses mécanismes (correction locale, inconnus, consultation seule, reprise) convergent.** Seul bloquant de ce point : RC-US-017-19, un test manquant sur une règle correctement réalisée.

## 3. Décisions sur les points soumis

| # | Point | Décision |
|---|---|---|
| 1 | Convergence | Voir le §2. Conforme, sauf le test manquant de RC-US-017-19 (majeure). Tri des entrées inconnues non couvert (RC-US-017-20). |
| 2 | UT-US-017-89 contre la décision de Steeve (variante `carte` d'`ERR-013`) | **Steeve l'emporte ; je modifie mon test.** Le guide v0.2.23 §6.6.14 d (arrivé après l'E10) donne à la carte de la feuille la variante `carte`, et au bandeau le texte court. UT-US-017-89 attend aujourd'hui, dans le modèle de vue, le titre et le texte **courts**, et le composant les remplace par `libellesCarte()` (`feuille-synchronisation.ts:82`, appelée par `FeuilleSynchronisation.tsx:102`). Le modèle porte donc un texte qui n'est jamais affiché, et le choix du texte dépend d'une fonction appelée par le composant (CR-16, CR-44). → RC-US-017-24 : `modeleCartes` construit directement la carte `ERR-013` avec la variante `carte`, `libellesCarte` est supprimée, et UT-US-017-89 (2e cas) est modifié **avec mon accord écrit, ici** : égalité stricte gardée, attendu = `libelle('ERR-013', { variante: 'carte' })` et sa partie `texte`, action inchangée. Le précédent est UT-US-017-72 au rang 10. |
| 3 a | S12d : smartphone rouvert hors ligne sans accès Google, contournement `seReconnecterAuRetourDuReseau()` | **Faire changer le scénario par Pepper.** Le comportement de l'application est le bon : une PWA rouverte hors ligne n'a plus de jeton, et sans geste elle ne reprend pas l'accès (US-017 S06f). Le banc rejoue un geste que le `.feature` ne décrit pas, ce qui masquerait une régression du parcours de reconnexion après redémarrage. La phrase existe déjà (S06f) : Pepper ajoute « Et sur le smartphone, l'utilisateur fait le geste de reconnexion » après « Et le réseau revient sur le smartphone » (Q-ANT-E13-R11-1). **Le contournement est accepté provisoirement**, signalé dans le code, et suivi en **DT-038** (P3, retrait avant l'E13b). Il ne bloque pas cette PR. Je ne touche à aucun `.feature`. |
| 3 b | userinfo non mesuré (`lireIdentiteUserinfo` en `fetch` brut) | **Écart accepté, ST corrigée (v0.11.3, n° 16).** Ma ST supposait que userinfo passait par `ClientGoogle` ; ce n'est pas le cas depuis le rang 1. Une réponse par connexion n'apporte rien au lissage : les échanges Drive de chaque cycle suffisent, et DAT §6.4 (« à chaque échange avec Google ») reste tenu en substance. Faire passer userinfo par `ClientGoogle` serait un remaniement du compte sans gain. |
| 3 c | `VueInterface.miseAJour` typé `IssueMiseAJour` (la ST disait `'AUCUNE_VERSION' \| 'ECHEC'`) | **Écart accepté, ST corrigée (v0.11.3, §4.8).** Le guide v0.2.23 §6.6.14 a, arrivé après l'E10, ajoute la variante `rechargement` et l'action désactivée pendant le rechargement : `RECHARGEMENT_LANCE` doit donc atteindre la vue. Le type est plus juste que ma ST. |
| 3 d | `Application.mettreAJour` appelé avec un espace | **Accepté.** La ST disait « sans espace : appel direct au port » : la réalisation appelle le port dans tous les cas, ce qui couvre ce cas et n'a besoin d'aucun état de l'espace. Précisé en v0.11.3. |
| 3 e | `etatMetierDuDrive` et `changerVersion` non exportée | **Écart non accepté.** Le §12.7 demandait que `etatMetierDuDrive` lise un fichier `SCHEMA_VERSION + 1` comme un lecteur à jour. Aujourd'hui il l'ignore (`decoderFichierAppareil` échoue, `continue`, `drive-banc.ts:30`), si bien que les étapes « le Drive du compte … contient / ne contient pas » ne voient pas le fichier du PC dans S30, S30b et US-022 S24, S25. Elles passent, parce que l'objectif vérifié est dans le fichier du smartphone, mais l'assertion négative de S30b (l. 718) serait vraie même si l'objectif était dans le fichier ignoré. Correction de quelques lignes → RC-US-017-27. |
| 3 f | PEP-5 (S31) | **Toujours sans réponse de Pepper ; relance (Q-ANT-E13-R11-2).** La réalisation suit le sens ★ proposé. Limite du banc : le PC du banc est de la même version que le smartphone ; dès qu'il dépose de nouveau, son fichier perd les éléments inconnus ajoutés par V10, et S31 peut passer sans que le smartphone les ait lus. Le mécanisme est couvert par UT-US-017-87 et 4-46 ; S31 vérifie la coexistence (saisie non bloquée, convergence des données connues), ce qui est son objet. Non bloquant. |
| 4 a | D2 : fichiers hors liste (`consultation-seule.tsx`, `retour-mise-a-jour.ts`, `etat-vide.tsx`, magasins, `selecteur-duree.tsx`) | **Acceptés a posteriori (CR-01 régularisé, ST v0.11.3).** La réponse de Steeve à Q-ST017-STE-5 c (champs et menus visibles et inertes, toast à la tentative) est arrivée après ma liste et touche tous les contrôles d'action et de saisie. Les magasins figuraient déjà au §3.6 (I4-16). Un contexte unique (`useConsultationSeule`) est la bonne structure : une seule règle, aucune duplication. Les deux nouveaux fichiers sont inscrits au rang 11. |
| 4 b | `aria-disabled` en chaîne `'true'` | **Accepté.** Sur un élément personnalisé (composants Ionic), React écrirait le booléen `true` en attribut vide, que les lecteurs d'écran n'interprètent pas comme « vrai ». Le commentaire de `consultation-seule.tsx` le justifie. Sur les boutons natifs (`Bandeau.tsx`, `FeuilleSynchronisation.tsx`), le booléen suffit : les deux formes coexistent à bon droit. |
| 5 | DT-030 : la case « Rouvrir » est-elle complète ? | **Oui sur le fond, une réserve sur le focus.** Modèle (`action` `TERMINER` / `ROUVRIR` / absente), case pleine active seulement si l'écran sait rouvrir, second `useCommandeConfirmee` distinct de celui d'`ActionFin`, `CNF-ROUVRIR-SOUS-TACHE` si la parente est terminée, « Annuler » sans effet, `MessagesRefus` sous la section, consultation seule respectée : conforme à ST-US-024 v0.7 §6.8 (UT-US-024-25 à 27 verts). **Réserve** : la case activée est mémorisée par `document.activeElement as HTMLElement \| null` (`detail-tache.tsx:445`). Safari, sur macOS et iOS, ne donne pas le focus à une case cochée à la souris ou au doigt : le focus reviendrait alors sur `body` après « Annuler » (WCAG 2.4.3). La ST demandait une référence prise « au clic » ; il y a aussi un `as` hors constructeur (CR-26). → RC-US-017-26 (mineure). |
| 6 | Dette | DT-036 réalisée : « Remboursée » à la fusion, sous réserve de RC-US-017-19. DT-030 : « Remboursée » à la fusion, sous réserve de RC-US-017-26. Registre **v0.37** : DT-037 et DT-038 inscrites. DT-029 reste « En cours » : cette PR ne touche ni UT-COMP-US-002-81 ni UT-COMP-US-001-60, et le critère des 50 exécutions n'est toujours pas mesuré (CI verte sur les 7 contrôles à la tête). DT-027 reste « Planifiée » (option a de Starck), **hors rang 11, à livrer avant l'E13b**. DT-025 n'est pas traitée : ma ST v0.11 ne l'a pas mise dans la tranche H4 (oubli de ma part) ; échéance reportée à l'E13b. |
| 7 | Conformité aux US et RG, qualité, tests | **Conforme, sauf RC-US-017-19 à 28.** Détail au §3.2 et au §4. |

### 3.1 Tests fournis en E10 modifiés par un développeur

| Test | Modification | Décision |
|---|---|---|
| UT-US-017-38 (`feuille-synchronisation.test.ts`, rang 3) | `FORMAT_PLUS_RECENT` retiré de la liste des états « sans carte » (`d48ac50`). | **Acceptée** : la carte `ERR-013` est désormais attendue dans cet état, et elle est vérifiée par UT-US-017-89. Ma ST v0.11 aurait dû le prévoir au §13.6. |
| UT-US-024-27 (`rouvrir-sous-tache-ui.test.tsx`) | `?` → ` ?` dans le titre attendu. | **Acceptée** : c'est la règle typographique de `libelle()` appliquée au texte du catalogue. L'assertion est plus exacte. |
| Test de `construireDetailTache` (`detail-tache.test.ts`, deux cas) | Champ `action` ajouté à l'attendu (`TERMINER`, `ROUVRIR`). | **Acceptée** : conséquence du nouveau champ (ST-US-024 v0.7 §6.8 n° 1), égalité stricte gardée. |
| Abandon d'ECR-007 (`abandonner-reprendre-ui.test.tsx:225`) | « aucune case » devient « aucune case autre que « Rouvrir » », plus une assertion sur les sous-tâches A et C. | **Acceptée** : la sous-tâche terminée porte maintenant légitimement la case « Rouvrir » ; l'intention (aucune case « Terminer » sur une sous-tâche abandonnée) est gardée, et l'assertion ajoutée la rend plus précise. |
| UT-US-017-53 (`depot-local-dexie-version3.test.ts`) | `verno` 3 → 4 et tables d’inconnus attendues (`7c277a2`, Q-BRU-R11-1). | **Acceptée** : conséquence directe de la base v4 (ST v0.11 §5.1), égalité exacte gardée. |
| Doublures d'`ApplicationInterface` (six fichiers de `tests/unitaires/composition/`) | Ajout de `lireCorrectionHorloge` et `mettreAJour`. | **Acceptée** : adaptation mécanique au port élargi, aucune assertion touchée. |
| UT-US-017-87 (jeu d'essai), UT-US-017-127 | Réécrits par moi (ST v0.11.1, v0.11.2). | Hors revue. |

### 3.2 Conformité et qualité (point 7)

- **US-017 CA-13 et RG-057 bis** : `ALR-001` strictement au-delà de 24 h, dans les deux sens, seulement sur l'appareil qui mesure ; carte sans action ni fermeture, `role="status"`, placée entre `ERR-011` / `ERR-016` et `ERR-013` (`ordreDesCartes`, CR-16 respecté). `ValeurRecueDuFutur` est journalisé avant le pré-contrôle, une fois par fichier, et `hlcMax` couvre les écritures, les lectures et les inconnus (n° 22 e ; 4-45).
- **RG-058** : bandeau `BAN-CONSULTATION-SEULE` et carte `ERR-013` avec l'action « Mettre à jour » ; « + » et saisie rapide retirés ; cases, champs et menus inertes, avec le toast à la tentative et non au focus. Issue `CONSULTATION_SEULE` distincte d'un refus métier et d'`ENREGISTREMENT_IMPOSSIBLE` (UT-US-017-125). « Mettre à jour » : `SKIP_WAITING` après l'abonnement unique à `controllerchange` (4-13), `ECHEC` sans exception (4-12), jamais de boutique (S30, V4).
- **RG-054** : ligne « Fuseau » après « Données », absente à Paris ou sans fuseau ; « New York », « Auckland », « UTC » (UT-US-017-124).
- **Qualité** : fonctions courtes, `switch` exhaustifs (`actionCarte` avec `assertNever`, `#reprendreElement` sans `default`), `Resultat` partout, aucune exception métier, constantes nommées (`MESSAGE_ACTIVATION`, seuils de `parametres-synchronisation.ts`). Seuls `as` relevés : `detail-tache.tsx:445` (RC-US-017-26) et les `as const` de littéraux.
- **Duplication** : trois calculs voisins du plus grand HLC d'un fichier reçu (`fusion.ts:63` sans les lectures, `controle-drive.ts:38` sans les inconnus, `cycle-synchronisation.ts:237` qui assemble les deux). Ils ne couvrent pas les mêmes éléments, chacun selon sa règle, mais le prochain ajout au fichier devra toucher les trois → suggestion RC-US-017-21.
- **Robustesse de la mesure** : le §14 demandait à Bruce un complément « un observateur qui lève ne casse pas la requête (garde `try` journalisée) ». Ni la garde ni le test n'existent. `SuiviHorloge.surReponse` ne lève pas en pratique : sa partie synchrone est pure et `HorlogeSysteme.monotone()` rend des entiers. Mais le port promet « ne lève jamais » sans que rien ne le garantisse, et un observateur fautif ferait sortir une exception de l'infrastructure Google au milieu d'un cycle. La garde est mieux placée dans `RelaisEchangesGoogle`, point unique de tous les clients, avec le journal de la composition, que dans `ClientGoogle`, qui n'a pas de journal → RC-US-017-25 (Benjamin, composition) ; ST v0.11.3 §14 alignée.
- **Assertions** : aucune assertion faible significative. Les `toBeTruthy()` relevés portent sur des `getBy…` (présence) ou sur un masque de `compareDocumentPosition`, ce qui est admis.

## 4. Remarques

Gravité et statut selon la grille habituelle. Itération 1 pour toutes. RC-US-017-18 (suggestion du rang 10) reste ouverte, sans effet.

### 4.1 Cycle et persistance (Bruce)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-19 | **Majeure** | CR-04, CR-45 ; ST-US-017 v0.11.2 §6.8 n° 22 c ; DT-036 | `src/synchronisation/application/cycle-synchronisation.ts:1277-1289` ; `tests/unitaires/synchronisation/application/corbeille-differee-complements.test.ts` | La transaction finale de la reprise conserve bien les entrées inscrites pendant le cycle (`listeCorbeille(m)` relue dans la transaction), mais aucun test ne le vérifie : réécrite sur la liste initiale, la reprise reste verte sur les 560 tests de la synchronisation. Une régression effacerait en silence l'inscription d'un ancien fichier propre, c'est-à-dire le défaut que DT-036 rembourse. | Ajouter **UT-COMP-US-017-4-78** : liste initiale `[FICHIER X]` (échec antérieur) ; au cycle suivant, un dossier en double fait déménager et la mise à la corbeille de l'ancien propre échoue (`echouerProchainesSuppressions` réglé pour laisser réussir X). Vérifier qu'après le cycle X est à la corbeille et retiré, et que `aMettreALaCorbeille` vaut exactement `[{FICHIER, ancien propre}, {DOSSIER_QUITTE, ancien dossier}]`, dans cet ordre. Variante dans le même test ou en 4-79 : un doublon de manifeste inscrit pendant le cycle (n° 19). Critère : le test rougit avec la mutation `liste.filter(…)` (essai local non commité, à mentionner dans le commit). | Ouverte |
| RC-US-017-20 | Mineure | CR-65 ; ST §4.8 (`lireInconnus` « triés ») ; §6.8 n° 12 | `tests/contrats/depot-local.contrat.ts:582` (CT-DEPOT-18) | Le tri des **entrées** inconnues relues n'est vérifié par aucun test (une seule entrée dans CT-DEPOT-18 ; mutation de la doublure verte). L'encodeur écrit les inconnus dans l'ordre reçu : l'ordre canonique du fichier repose sur ce tri implicite d'IndexedDB. | Ajouter **CT-DEPOT-19** au contrat (deux adaptateurs) : écrire en deux transactions des entrées `evt-b` puis `evt-a`, et des registres de clés décroissantes, relire par une autre instance et attendre l'ordre `cleInconnue` / `id` en unités de code (une clé avec une majuscule et une minuscule, par exemple `B` et `a`). La règle `CT-DEPOT-1[6-9]` → 11 existe déjà. | Ouverte |
| RC-US-017-21 | Suggestion | CR-22 | `src/synchronisation/domaine/fusion.ts:63` ; `domaine/controle-drive.ts:38` ; `application/cycle-synchronisation.ts:237` | Trois calculs du plus grand HLC d'un fichier reçu, sur des périmètres différents. | Facultatif : une fonction de domaine paramétrée par périmètre (`hlcMaxRecu(contenu, { lectures, inconnus })`), dans `controle-drive.ts` ou `depot.ts`. | Ouverte (suggestion) |
| RC-US-017-22 | Suggestion | CR-45 ; DT-036 | `src/synchronisation/application/ecriture-manifeste.ts:175-180` | Mise à la corbeille du doublon en échec, puis relecture du canonique en échec : l'erreur de relecture est rendue et le doublon n'est inscrit nulle part (UT-COMP-US-017-4-49). Limite acceptée (manifeste sans donnée personnelle), consignée dans DT-036. | Facultatif : rendre le doublon avec l'erreur (`{ erreur, doublonNonSupprime }`) pour que le cycle l'inscrive même dans ce cas. | Ouverte (suggestion) |
| RC-US-017-23 | Mineure | CR-04 ; ST §6.8 n° 21 (« jamais sous `ALTERATION` ») | `tests/unitaires/synchronisation/application/corbeille-differee.test.ts:171` (UT-US-017-123) | Le titre de mon test annonce « sous ERR-012 », mais le corps ne passe que par `FORMAT_PLUS_RECENT`. L'interdiction de la reprise sous altération n'est pas testée. L'écart vient de moi (E10). | Ajouter **UT-COMP-US-017-4-80** : liste non vide, puis un manifeste rendu illisible (`ERR-012`) ; le cycle rend `DONNEES_ALTEREES`, `ecrituresPar` inchangé, aucun `supprimerFichier`, liste inchangée. Le test fourni reste tel quel ; j'en corrigerai le titre à mon prochain passage dans le fichier. | Ouverte |

### 4.2 Interface, composition et banc (Benjamin)

| Id | Gravité | Critère | Localisation | Constat | Action attendue | Statut |
|---|---|---|---|---|---|---|
| RC-US-017-24 | Mineure | CR-16, CR-44 ; guide v0.2.23 §6.6.14 d ; décision 2 | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts:82-89`, `:176` ; `src/synchronisation/presentation/ui/FeuilleSynchronisation.tsx:102` ; `tests/unitaires/synchronisation/presentation/feuille-horloge-version.test.ts` (UT-US-017-89, 2e cas) | Le modèle de vue porte pour `ERR-013` le texte court, que le composant remplace par la variante `carte` en appelant `libellesCarte()`. | `modeleCartes` construit la carte `ERR-013` avec `libelle('ERR-013', { variante: 'carte' })` (titre et texte) ; supprimer `libellesCarte` et `LibellesCarteFeuille` ; le composant lit `carte.titre` et `carte.texte`. Modifier UT-US-017-89 (2e cas) **avec mon accord** : `toEqual` strict, attendu titre et texte de la variante `carte`, action `{ type: 'METTRE_A_JOUR', libelle: libelle('ERR-013', {}, 'action') }` inchangée. UT-COMP-US-017-4-51 reste vert sans modification. | Ouverte |
| RC-US-017-25 | Mineure | CR-42, CR-54 ; ST §14 (compléments) ; port `ObservateurEchangesGoogle` (« ne lève jamais ») | `src/composition/application.ts:140-144` (`RelaisEchangesGoogle.surReponse`) ; `src/composition/web.ts` ; `tests/support/banc/appareil-simule.ts` | Aucune garde n'empêche un observateur fautif de faire sortir une exception de `ClientGoogle.executer` (`client-google.ts:146`) au milieu d'un cycle. | `RelaisEchangesGoogle` reçoit un `JournalTechnique` (constructeur) ; `surReponse` appelle chaque observateur dans un `try`, et en cas d'exception consigne en « erreur » `ObservateurEchangesEnEchec` `{ erreur: nom de l'Error ou 'inconnue' }`, puis passe à l'observateur suivant. Test **UT-COMP-US-017-4-81** : un observateur qui lève, un second qui compte ; la requête de `ClientGoogle` rend sa réponse, le second est appelé, une entrée de journal. `ClientGoogle` n'est pas modifié. | Ouverte |
| RC-US-017-26 | Mineure | CR-26 ; ST-US-024 v0.7 §6.8 n° 3 ; WCAG 2.4.3 | `src/objectifs-taches/presentation/ui/ecrans/detail-tache.tsx:445` ; `ui/composants/section-sous-taches.tsx` (`CaseTerminer`) | La case activée est lue dans `document.activeElement` avec un `as`. Sur Safari (macOS, iOS), une case cochée au pointeur ne reçoit pas le focus : après « Annuler », le focus irait sur `body`. | Mémoriser la case depuis l'événement : `CaseTerminer` passe `evenement.currentTarget` (`HTMLInputElement`) à `surRouvrir(id, caseActivee)`, ou garde une ref par case. Supprimer le `as`. Compléter UT-US-024-27 (cas « Annuler ») par une variante où la case n'a pas le focus au moment du changement (`fireEvent.click` sans `focus` préalable) et vérifier que le focus revient sur elle. ST-US-024 §6.8 n° 3 : la signature `surRouvrir(id, caseActivee)` est acceptée. | Ouverte |
| RC-US-017-27 | Mineure | CR-64 ; ST §12.7 (banc, `drive-banc.ts`) | `tests/support/synchronisation/drive-banc.ts:24-36` ; `tests/doublures/faux-drive.ts:800` (`changerVersion`, non exportée) | `etatMetierDuDrive` ignore un fichier `SCHEMA_VERSION + 1`, alors que le §12.7 demande de le lire comme un lecteur à jour. Les étapes R15 (« le Drive du compte … contient / ne contient pas … ») ne voient donc pas le fichier du PC dans S30, S30b, US-022 S24 et S25. | Exporter `changerVersion` de `faux-drive.ts` (ou une fonction `ramenerAuFormatCourant(octets)`) ; dans `etatMetierDuDrive`, si le décodage rend `FormatPlusRecent`, décoder les octets ramenés à `SCHEMA_VERSION`. Critère : `pnpm cucumber` vert ; un essai local (non commité) où le smartphone dépose l'objectif de S30b dans un fichier au format plus récent fait échouer l'assertion « ne contient pas ». | Ouverte |
| RC-US-017-28 | Suggestion | Lisibilité | `tests/support/rangs/rangs-fichiers.json:1072-1079` | Deux entrées ajoutées en fin de fichier, hors ordre alphabétique. | Facultatif : les replacer à leur rang alphabétique. | Ouverte (suggestion) |

Le cœur de synchronisation (`cycle-synchronisation.ts`, `ecriture-manifeste.ts`, `suivi-horloge.ts`, `inconnus.ts`, `correction-horloge.ts`, `format-v1.ts`, `depot-local-dexie.ts`) n'appelle **aucune reprise de code** : RC-US-017-19, 20 et 23 sont des tests à ajouter.

## 5. Questions ouvertes (via Jarvis)

- **Q-ANT-E13-R11-1** (Pepper ; non bloquante) : US-017 S12d. Le smartphone, éteint puis rallumé hors ligne, n'a plus d'accès Google, et ne synchronise pas au retour du réseau sans geste (S06f). Proposez-vous : a) d'ajouter « Et sur le smartphone, l'utilisateur fait le geste de reconnexion » après « Et le réseau revient sur le smartphone » ★ ; b) de garder le scénario tel quel, avec un geste implicite du banc écrit au glossaire d'étapes ? Avec a, Benjamin retire le contournement (DT-038).
- **Q-ANT-E13-R11-2** (Pepper ; relance de Q-ST017-PEP-5, non bloquante) : confirmez-vous le sens au banc de « le PC utilise une version de l'application plus récente » (éléments inconnus au même `schemaVersion`) ★ ? S31 vérifie la coexistence ; la conservation des inconnus est vérifiée par les tests unitaires (UT-US-017-87), pas par S31.
- **Q-ANT-E13-R11-3** (Starck ; non bloquante, avant la première évolution compatible du schéma 1) : requalification des éléments inconnus quand une version qui les connaît est installée (DT-037). Je propose une règle au DAT §4.2 « Champs inconnus » : à l'ouverture de l'espace, ou à la lecture, un inconnu dont le type et le champ sont connus est décodé et intégré comme un registre reçu, puis retiré de sa table, dans la même transaction ; un fichier qui contient deux registres de même clé est lu en retenant le plus grand HLC ★. Validez-vous, ou préférez-vous une autre règle ?
- **Q-ANT-E13-R9-1, Q-ANT-E13-R9-2, Q-ANT-E13-R10-1** : répondues par le DAT v0.11.11. Closes.

## 6. Dette (registre v0.37)

- **DT-036** : réalisée ; « Remboursée » à la fusion de la PR #35, sous réserve de RC-US-017-19 ; limite de RC-US-017-22 consignée.
- **DT-030** : reliquat réalisé ; « Remboursée » à la fusion, sous réserve de RC-US-017-26 ; contrôle de Steeve en E14.
- **DT-037** (nouvelle, P2) : inconnus non requalifiés après une mise à jour de l'application (§2.2, Q-ANT-E13-R11-3).
- **DT-038** (nouvelle, P3) : geste de reconnexion implicite du banc dans S12d (décision 3 a).
- **DT-025** : non traitée (oubli de ma ST v0.11) ; Bruce, sur sonnet, avant l'E13b.
- **DT-027** : « Planifiée » (option a de Starck), hors rang 11 ; ST et test d'Anthony, réalisation de Bruce, **avant l'E13b**.
- **DT-029** : « En cours », inchangée (UT-COMP-US-002-81 et UT-COMP-US-001-60 non touchés ; critère des 50 exécutions non mesuré).

## 7. Apports d'Anthony dans ce commit

- ST-US-017 v0.11.3 : historique, §4.8 (`VueInterface.miseAJour`, `mettreAJour`), §6.8 n° 16 (userinfo non mesuré).
- Registre de la dette v0.37.
- Ce rapport.

Aucun code de `src/` ni aucun test n'est modifié.

## 8. Verdict

**Changements requis.**

| Remarque | Gravité | Responsable | Bloque l'approbation |
|---|---|---|---|
| RC-US-017-19 | Majeure | Bruce (opus : test du cœur de synchronisation, avec essai de mutation) | **Oui** |
| RC-US-017-20 | Mineure | Bruce (sonnet possible, contrat mécanique) | Non, à faire dans le même passage |
| RC-US-017-23 | Mineure | Bruce (même passage que RC-US-017-19) | Non, à faire dans le même passage |
| RC-US-017-24 | Mineure | Benjamin (sonnet) | Non, à faire dans le même passage |
| RC-US-017-25 | Mineure | Benjamin (sonnet) | Non, à faire dans le même passage |
| RC-US-017-26 | Mineure | Benjamin (sonnet) | Non, à faire dans le même passage |
| RC-US-017-27 | Mineure | Benjamin (sonnet) | Non, à faire dans le même passage |
| RC-US-017-21, 22, 28 | Suggestion | Bruce, Benjamin | Non |

La nouvelle revue (OPT-18, sonnet possible) portera seulement sur ces remarques et sur le différentiel, avec une CI verte sur les 7 contrôles.

## 9. Passage 2 (E13 bis) : différentiel `d565341..1c728d0`

Branche `us/US-017-rang11` @ `1c728d0` (corrections de Bruce RC-19, 20, 23 ; de Benjamin RC-24 à 28). Seules les remarques ouvertes et le différentiel sont revus.

| Contrôle | Résultat |
|---|---|
| Tests ciblés (4 fichiers modifiés) | 24 / 24 verts. |
| Essai local annulé, RC-26 | Ancien code rétabli (`document.activeElement as HTMLElement` pris dans `rouvrir`, `memoriserCase` sans effet) : **UT-COMP-US-017-4-82 rouge**, les 4 autres cas du fichier verts. Annulé. |
| Essai local annulé, RC-19 | `listeCorbeille(m).filter` remplacé par `liste.filter` (`cycle-synchronisation.ts:1285`) : **UT-COMP-US-017-4-78 rouge**, seul des 9 du fichier. Annulé. Les deux autres mutations (RC-20, RC-23) sont rapportées dans les commits `ac60278` et `fb9fc0e` (un seul test rouge à chaque fois). |
| `pnpm verifier` | Voir le § 9.3. |

### 9.1 Décisions

| Remarque | Décision |
|---|---|
| RC-US-017-19 | **Levée.** UT-COMP-US-017-4-78 (cas plus fort que celui demandé : `[FICHIER X, DOSSIER_QUITTE A]` en liste initiale, second déménagement dans le même cycle, attendu exact et ordonné des deux nouvelles entrées) prouve la règle n° 22 c : rouge sous la mutation `liste.filter`. Le doublon de manifeste (n° 19) reste couvert par UT-US-017-122 et 4-48. |
| RC-US-017-20 | **Levée.** CT-DEPOT-19 (deux adaptateurs, deux transactions, `B` avant `a`, registres et entrées) ; mutations rapportées par Bruce : tri de la doublure mémoire retiré, puis `reverse()` sur la lecture Dexie : rouge seul à chaque fois. |
| RC-US-017-23 | **Levée.** UT-COMP-US-017-4-80 (sous `ERR-012` : `DONNEES_ALTEREES`, aucun `supprimerFichier`, écritures et liste inchangées) ; mutation (reprise appelée sous `ALTERATION`) : rouge seul. **Je renomme UT-US-017-123** (titre et `describe` : « en consultation seule (FORMAT_PLUS_RECENT, ERR-013) », renvoi à 4-80 pour l'altération) ; aucune assertion modifiée. |
| RC-US-017-24 | **Levée ; la modification d'UT-US-017-89 (2e cas) est confirmée.** `toEqual` strict conservé, titre et texte de la variante `carte`, action inchangée : exactement ce que j'avais accordé par écrit (décision 2). `libellesCarte` et `LibellesCarteFeuille` supprimées, le composant lit `carte.titre`, `carte.texte`, `carte.action.libelle`. Variante portée par un paramètre `variante?: 'carte'` de `carte(…)`, libellé de l'action sans variante : conforme. |
| RC-US-017-25 | **Levée.** Garde `try/catch` dans `RelaisEchangesGoogle.#avertir`, journal injecté (`web.ts`), erreur consignée en `ObservateurEchangesEnEchec` avec le seul nom de l'erreur (aucune donnée), observateur suivant appelé ; UT-COMP-US-017-4-81. `ClientGoogle` intact. |
| RC-US-017-26 | **Écart accepté, signature de la revue abandonnée.** `surRouvrir(id, caseActivee)` aurait cassé UT-US-024-26 et UT-COMP-US-024-08 (`toHaveBeenCalledWith(id)`), que je ne veux pas affaiblir. La propriété distincte `surCaseRouvrirActivee(case)`, appelée dans `onChange` sur `evenement.currentTarget` avant `surRouvrir(id)`, atteint le même but (plus de `document.activeElement`, plus de `as`), sans toucher aux tests. L'appel n'a lieu que si la case est pleine (`rouvrir`), ce qui est exact. **ST-US-024 passe en v0.8** (§4.5, §6.8 n° 2 et 3). UT-COMP-US-017-4-82 : rouge sur l'ancien code (essai ci-dessus). La découpe de `LigneSousTacheUi` (`BoutonOuvrirSousTache`, `...actions`) est mécanique et lisible. |
| RC-US-017-27 | **Levée.** `changerVersion` exportée ; `decoderEnLecteurAJour` ne ré-encode que sur `FormatPlusRecent` ; `etatMetierDuDrive` voit désormais le fichier du PC (S30, S30b, US-022 S24 et S25). L'essai de rejet de l'assertion négative n'est pas rejoué par moi : le critère est tenu par construction (le décodage rend le contenu du fichier). Non bloquant. |
| RC-US-017-28 | **Levée** (`rangs-fichiers.json` replacé à l'ordre alphabétique). |

### 9.2 Remarques ouvertes

Aucune remarque bloquante. RC-US-017-21 et 22 (suggestions) restent ouvertes, sans effet. Questions Q-ANT-E13-R11-1 à 3 : inchangées (Pepper, Starck), non bloquantes ; DT-038 à retirer avant l'E13b.

### 9.3 Dette (registre inchangé, v0.37)

DT-036 : RC-19 levée, « Remboursée » à la fusion de la PR #35. DT-030 : RC-26 levée, « Remboursée » à la fusion (contrôle de Steeve en E14). Aucun changement d'état avant la fusion : le registre reste en **v0.37**. DT-025, DT-027, DT-029, DT-037, DT-038 : inchangées.

### 9.4 Verdict du passage 2

**Approuvé.** Aucun code de `src/` modifié par ce passage (apports : ST-US-024 v0.8, renommage du titre d'UT-US-017-123, ce § 9).
