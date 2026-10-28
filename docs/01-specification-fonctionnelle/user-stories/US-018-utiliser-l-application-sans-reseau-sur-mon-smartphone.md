# US-018 — Utiliser l'application sans réseau sur mon smartphone
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Prête — révision DEC-034 validée le 2026-10-22 (DEC-036, V-DEC034-1, 3, 5, 6, 7) ; textes DEC-034 retirés si la condition de DEC-034 échoue (M-RED, M-PERSIST)

**En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon smartphone sans réseau, mes modifications étant prises en compte au retour du réseau, **afin de** ne pas dépendre de la couverture réseau.

## Analyse d'écart (cahier des charges et existant)
- **Confirmé** : Q-DEM001-4.1 c) (consultation et saisie sans réseau) ; smartphone prioritaire (complément du commanditaire).
- **Modifié en v0.4** : l'US était proposée pour le lot suivant LOT-001. Le commanditaire l'a intégrée à LOT-001 (DEC-002), conformément à la recommandation de l'architecte (S3) : la mécanique de conservation des saisies sur l'appareil est de toute façon nécessaire au lot 1 (règle de conflit entre appareils connectés, perte de l'accès Google traitée comme une coupure de réseau, Q-DEM001-22.2 c).
- **Précisé** par Q-DEM001-23 : conflits résolus information par information, valeurs écartées signalées.
- **Smartphone Android uniquement** (DEC-001). Le PC relève de US-031, également intégrée à LOT-001 (Q-DEM001-39 b, DEC-013) : mêmes règles, transposées au PC.
- **Modifié par DEC-034 (2026-10-22), validé par DEC-036** : sur le smartphone, l'application n'est plus une application Android installée par fichier APK, mais la même application web que sur le PC, installée sur l'écran d'accueil depuis Chrome (sous la condition de DEC-034). Conséquences :
  - **contradiction avec CA-4 validé** : « sans action de l'utilisateur » n'est plus tenu quand l'accès Google doit être renouvelé (au-delà d'une heure) ; l'enregistrement attend alors un bref passage par Google ou un geste (RG-017 proposée, Q-PWA-2) : CA-4 reformulé ;
  - **CA-8** : un accès **expiré** devient, comme sur le PC, un accès à renouveler (sans bandeau) ; seul l'accès **retiré** affiche « Se reconnecter » ;
  - **nouveaux cas limites**, transposés de US-031 : première ouverture sans réseau dans le navigateur, données du navigateur effacées ; hors ligne garanti depuis l'application installée (V-DEC034-7) ;
  - la synchronisation en arrière-plan n'est plus « reportée » mais exclue (Q-PWA-3).
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-057 : bandeau de rappel non bloquant quand la plus ancienne modification en attente date de plus de 24 h.
- RG-021 : consultation et saisie sans réseau, sur le smartphone et sur le PC ; prise en compte au retour du réseau ; smartphone prioritaire.
- RG-035 : la perte de l'accès Google se comporte comme une coupure de réseau.
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-047 à RG-049 : réparations après fusion.
- RG-019 : la première connexion nécessite le compte Google, donc le réseau.
- RG-017 *(DEC-034, validée DEC-036)* : exception de l'accès Google à renouveler, étendue au smartphone.
- ENF-04 *(reformulée, DEC-034, validée DEC-036)*, ENF-06 (validée), ENF-07 *(reformulée, DEC-034, validée DEC-036)*.

## Critères d'acceptation
1. **CA-1** — Sur le smartphone, l'utilisateur s'étant déjà connecté au moins une fois, l'application s'ouvre sans réseau et affiche les données présentes sur l'appareil.
2. **CA-2** — Sans réseau, l'utilisateur peut effectuer toutes les opérations du lot 1 : créer, modifier et supprimer des objectifs, sous-objectifs, tâches et sous-tâches ; terminer, rouvrir, abandonner et reprendre des tâches. Les règles de gestion s'appliquent comme avec le réseau (alertes, état des objectifs, « en retard »).
3. **CA-3** — Sans réseau, l'application indique qu'elle est hors ligne et que des modifications ne sont pas encore synchronisées.
   - *Précision E8 (Q-US-018-1, option a, sans changement de règle)* : le nombre de modifications en attente est le **nombre d'éléments distincts** (objectifs, tâches, sous-tâches) qui portent l'indication « non synchronisé ». Plusieurs modifications d'un même élément comptent pour une ; la suppression d'un élément déjà enregistré dans le Drive compte pour une ; un élément créé puis supprimé sans réseau ne compte pas (S05, S05b, S05c). Ce nombre est le même partout où il est affiché (indicateur, bandeaux, confirmations de déconnexion et de suppression des données).
4. **CA-4** — *(DEC-034, validé le 2026-10-22, V-DEC034-5, DEC-036 ; retiré si la condition de DEC-034 échoue (M-RED, M-PERSIST))* Au retour du réseau, **si l'accès Google est valide**, ses modifications sont enregistrées dans son Drive sans action de l'utilisateur, et celles faites entre-temps sur l'autre appareil sont intégrées. **Si l'accès Google doit être renouvelé**, l'utilisateur continue de consulter et de saisir ; l'application indique que la synchronisation est à reprendre (« Reprendre la synchronisation », sans bandeau) et l'enregistrement a lieu après **au plus un geste** de l'utilisateur, ou après le bref passage par Google de la prochaine ouverture, sans aucune saisie tant qu'il reste identifié auprès de Google (RG-017). Aucune modification n'est perdue. L'indication « non synchronisé » disparaît une fois l'enregistrement fait.
   - **Réponse de Starck à Q-DEC034-1 (2026-10-22), critère de la mesure M-RED** : à l'ouverture, l'accès se renouvelle **sans aucun geste**, par une redirection silencieuse vers Google de 1 à 2 s, **une seule tentative** ; si elle échoue, l'indicateur passe à « Reprendre la synchronisation » (`SYN-SESSION`). Le geste « Reprendre la synchronisation » n'est demandé que si l'accès expire en cours d'utilisation ou si la redirection échoue ; une saisie n'est demandée que si l'utilisateur n'est plus identifié auprès de Google sur l'appareil (session Google elle-même expirée). Le CA-4 est ainsi précisé, sans changement de sens : au retour du réseau, si l'accès Google doit être renouvelé, l'application étant déjà ouverte, il faut le geste ; à la prochaine ouverture, le renouvellement est automatique (S06b, S06c).
   - *Texte antérieur (DEC-018), rétabli si la condition de DEC-034 échoue* : « Au retour du réseau, sans action de l'utilisateur, ses modifications sont enregistrées dans son Drive, et celles faites entre-temps sur l'autre appareil sont intégrées. L'indication « non synchronisé » disparaît une fois l'enregistrement fait. »
5. **CA-5** — Aucune modification faite sans réseau n'est perdue, même si l'application est fermée, ou le smartphone éteint, avant le retour du réseau (ENF-06). Elle est enregistrée dans le Drive au premier retour du réseau, application ouverte.
6. **CA-6** — Il n'y a pas de durée maximale d'utilisation sans réseau : les modifications restent conservées sur l'appareil jusqu'au retour du réseau, et l'utilisation n'est jamais bloquée.
7. **CA-7** — Au retour du réseau, si la même information a été modifiée sur l'autre appareil, la règle de conflit et l'information sur les valeurs écartées s'appliquent (RG-036 ; US-017, CA-6 et CA-8), ainsi que les règles de réparation (RG-047 à RG-049 ; US-017, CA-10).
8. **CA-8** — Quand l'accès au compte Google est perdu (retiré ou expiré), le smartphone se comporte comme sans réseau (CA-2 à CA-5), et l'application propose de se reconnecter (RG-035 ; US-022, CA-7).
   - *Précision DEC-034 (validée le 2026-10-22, V-DEC034-5, DEC-036)* : comme sur le PC (US-031 CA-9), un accès **expiré** est un accès à renouveler (CA-4) : l'application propose « Reprendre la synchronisation », **sans bandeau**. Un accès **retiré** est signalé par le bandeau « Se reconnecter » dès que l'application en a la preuve (S11). Tant qu'elle ne sait pas, elle traite la situation comme un accès à renouveler.
9. **CA-9** — *(RG-057, V-12 ; DEC-025)* Quand le smartphone a des modifications en attente (non encore enregistrées dans le Drive) dont la plus ancienne date de plus de 24 h, l'application affiche un bandeau de rappel **non bloquant** (`BAN-RAPPEL-24H`, titre « Modifications en attente depuis plus de 24 h ») : ces modifications ne sont encore que sur le smartphone. (a) **Point de départ** : les 24 h courent depuis la **plus ancienne modification en attente** ; le bandeau s'affiche quand elle a **plus de 24 h** (à 24 h exactement, ou moins, il n'apparaît pas). Un appareil hors ligne depuis plus de 24 h dont la seule modification en attente date de 1 minute n'affiche pas le bandeau. (b) **Fermeture** : le bandeau peut être fermé ; il **réapparaît à la prochaine ouverture de l'application** (lancement de l'application ou rechargement de la PWA, pas un simple retour au premier plan , confirmé par le commanditaire, DEC-026) tant que des modifications sont en attente. (c) **Accès Google perdu** (CA-8, RG-035) : si des modifications sont en attente depuis plus de 24 h, **un seul** bandeau est affiché, « Se reconnecter » (`BAN-ACCES-GOOGLE`), complété de la mention « n modifications ne sont encore que sur cet appareil » ; il n'y a pas de second bandeau. Depuis moins de 24 h, il est affiché sans cette mention. (d) Le bandeau n'empêche aucune opération et peut être ignoré. Il n'apparaît pas si aucune modification n'est en attente. Il disparaît dès que les modifications sont enregistrées dans le Drive.
   - *Précision E8 (Q-US-018-1)* : les 24 h partent de la **première** modification non encore enregistrée dans le Drive, tous éléments confondus ; modifier de nouveau un élément déjà en attente ne les remet pas à zéro (S15c).

## Cas limites et cas d'erreur
- Première connexion sans réseau : impossible ; l'application l'indique (US-022).
- Réseau perdu pendant une saisie : la saisie est conservée ; aucune donnée n'est enregistrée à moitié.
- Réseau intermittent : aucune modification n'est enregistrée deux fois, et aucune n'est perdue.
- Objet supprimé sur le PC pendant qu'il est modifié sur le smartphone sans réseau : RG-047.
- Drive plein au retour du réseau : US-017, cas limites.
- Mise à jour avec l'autre appareil quand l'application est fermée : hors périmètre ; elle a lieu à la prochaine ouverture.
- Appareil hors ligne depuis plus de 24 h, mais seule modification en attente faite il y a 1 minute : pas de bandeau de rappel ; il apparaît quand cette modification a elle-même plus de 24 h (CA-9 a ; S16b).
- Bandeau de rappel fermé : il réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente (CA-9 b ; S17b).
- Accès Google perdu depuis plus de 24 h avec des modifications en attente : un seul bandeau « Se reconnecter », complété du nombre de modifications ; pas de second bandeau (CA-9 c ; S17c, S17d).
- *DEC-034, validés le 2026-10-22 (V-DEC034-5 et V-DEC034-7, DEC-036 ; retirés si la condition de DEC-034 échoue (M-RED, M-PERSIST))* :
  - redirection silencieuse vers Google en échec à l'ouverture (une seule tentative, réponse de Starck à Q-DEC034-1) : les données de l'appareil restent affichées et utilisables ; l'indicateur propose « Reprendre la synchronisation » ; l'enregistrement a lieu après ce geste (S06c) ;
  - accès Google à renouveler au retour du réseau : le travail continue ; l'enregistrement a lieu après au plus un geste (CA-4 ; S06b). Au-delà de 24 h avec des modifications en attente, le rappel `BAN-RAPPEL-24H` s'affiche, avec l'action « Reprendre la synchronisation », comme sur le PC (US-031 CA-10, S22c) ;
  - *geste pendant une saisie, fenêtre de Google en panne (DEC-039, 2026-10-28 ; CA-4)* : si l'utilisateur fait le geste « Reprendre la synchronisation » sur le smartphone pendant qu'une saisie est en cours et que la fenêtre de Google ne peut pas s'ouvrir (panne technique, qui obligerait à quitter la page), l'application ne quitte pas la page et affiche « Terminez votre saisie, puis reprenez la synchronisation. » (`TST-SAISIE-A-TERMINER`, guide v0.2.14 §6.6.6). Rien n'est perdu ni lancé ; l'indicateur reste « Reprendre la synchronisation ». Une fois la saisie terminée, un **second geste** est nécessaire : c'est la seule exception à « au plus un geste » de CA-4 et de RG-017, acceptée par le commanditaire pour cette seule panne (DEC-039). Non scénarisé (le banc ne simule pas la panne de la fenêtre de Google) ; couvert par les tests unitaires de la conception (UT-US-022-54) ;
  - première ouverture de l'application sur le smartphone, dans le navigateur, sans réseau : impossible ; le navigateur affiche sa propre page d'erreur (S19). Pour l'utiliser sans réseau, il faut l'avoir ouverte une première fois avec le réseau ;
  - données du navigateur effacées (ou application désinstallée) alors que des modifications ne sont pas encore enregistrées dans le Drive : ces modifications sont perdues ; l'application ne peut pas l'empêcher ; les données sont rechargées depuis le Drive à la connexion suivante (S18) ;
  - l'utilisation sans réseau est garantie depuis l'**application installée** sur l'écran d'accueil ; dans un simple onglet de Chrome, elle ne l'est pas (V-DEC034-7, DEC-036).

## Hors périmètre
- Utilisation sans réseau sur le PC (US-031, dans le même lot).
- Synchronisation en arrière-plan, application fermée : **exclue** (DEC-034, Q-PWA-3 ; formulation validée, V-DEC034-6, DEC-036 ; retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST)). *Avant DEC-034 : « lot ultérieur ».*
- Usage sur iPhone : hors périmètre de la v1 (DEC-001) ; techniquement possible depuis DEC-034, mais ni testé ni garanti (formulation validée, V-DEC034-1, DEC-036).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-001, ADR-003, ADR-010. **Révisé le 2026-10-22 (DEC-034)** : DAT v0.11 (§4.1.6, §4.1.7), ADR-013.*

> **Révision DEC-034 (Starck, 2026-10-22).** Le smartphone utilise la **PWA installée sur Chrome Android**, comme le PC (US-031). Les mentions « repli » ne valent que si la condition de DEC-034 échoue (on garde alors l'APK, ADR-012). **Q-DEC034-1 (réponse de Starck, 2026-10-22)** : à l'ouverture, le renouvellement se fait **sans geste** : l'application part d'elle-même chez Google (redirection `prompt=none`, 1 à 2 s derrière un écran d'attente) et revient avec l'accès, sans saisie ni appui, si la session Google du téléphone est active (DAT v0.11 §4.1.7, ADR-013). Un geste (« Reprendre la synchronisation ») n'est nécessaire que si l'accès expire **pendant** l'usage, ou si ce retour automatique échoue (une seule tentative par ouverture, puis `SYN-SESSION`). Une saisie n'est demandée que si la session Google elle-même a expiré. Cette réponse est **sous réserve de la mesure M-RED** du test technique v3, dont c'est le critère.

- **Composants touchés** :
  - **PWA installée sur Chrome Android** : le service worker précache toute l'application, l'ouverture sans réseau ne dépend ni de GitHub Pages ni du script Google (comme US-031, R12) ; *repli* : application Capacitor ;
  - événements `online` / `offline` du navigateur et échec des requêtes, pour détecter la connectivité et lancer la synchronisation au retour du réseau ; *repli* : `@capacitor/network` ;
  - adaptateur `DepotLocal` **IndexedDB (Dexie)**, le même que sur le PC ; `navigator.storage.persist()` au premier lancement, état affiché, avertissement s'il est refusé ; *repli* : SQLite ;
  - contexte `synchronisation` : marqueur « déposé jusqu'à HLC x », d'où sont tirés l'indicateur « non synchronisé » (CA-3) et la reprise (CA-4) ;
  - `compte` : ouverture de la session sans jeton, à partir de l'identité mise en cache ; l'état « hors ligne » est distinct de l'état « accès perdu » (CA-8).
- **Données** :
  - aucune donnée nouvelle ;
  - le volume local hors ligne n'a pas de limite pratique (CA-6) : quelques Mo au maximum.
- **Garanties (CA-5, PT-13)** :
  - chaque cas d'usage écrit en **une transaction** IndexedDB ouverte en **durabilité stricte** (`durability: 'strict'`), confirmée à son événement `complete` : une écriture confirmée survit à un arrêt forcé et à l'extinction (CA-5 ; mesure M-DUR du test technique v3) ; *repli* : une transaction SQLite ;
  - le dépôt dans Drive est idempotent : le fichier entier est réécrit ;
  - le marqueur n'avance qu'après la confirmation de Drive ;
  - un arrêt brutal à n'importe quelle étape ne fait que rejouer le dépôt (cas limite « réseau intermittent » : pas de double enregistrement).
- **Accès Google** : aucun pendant la période hors ligne. Au retour du réseau, application ouverte : dépôt immédiat si le jeton en mémoire est encore valide ; sinon, l'accès est à renouveler et le dépôt attend le geste « Reprendre la synchronisation » ou la prochaine ouverture, où il est renouvelé sans geste (Q-DEC034-1). C'est la précision de CA-4 voulue par DEC-034 (Q-PWA-2). *Repli* : renouvellement silencieux du jeton (R2).
- **Sécurité** : comme US-022 ; données dans l'IndexedDB du profil Chrome, propre à l'origine de l'application ; la désinstallation de la PWA ou l'effacement des données du site peuvent les supprimer (seules les modifications non déposées sont alors perdues, R15) ; *repli* : bac à sable de l'application Android.
- **Exigences non fonctionnelles** :
  - ouverture à froid hors ligne en moins de 2 s (ENF-T-01) ;
  - action locale en moins de 100 ms (ENF-T-02) ;
  - synchronisation lancée au retour du réseau en moins de 10 s.
- **Risques** :
  - R15 étendu au téléphone : éviction si la persistance est refusée ; parade : hors ligne garanti pour la PWA installée seulement, avertissement, mesure M-PERSIST (condition de DEC-034) ;
  - R19 : politiques de Chrome (persistance, installation) ;
  - *repli seulement* : R13 (SQLite) et R2 (renouvellement silencieux).
- **PC** : le hors ligne du PC relève de US-031, entrée dans le lot par DEC-013. Le noyau est le même ; les spécificités du PC sont décrites dans les impacts architecture de US-031.
- **RG-057 (rappel après 24 h hors ligne, établie, V-12)** :
  - calcul **purement local**, sans réseau ni donnée synchronisée : le bandeau est affiché si la **plus ancienne modification en attente** (marqueur « déposé jusqu'à HLC x » en retard) date de plus de 24 h (DEC-025) ; ce sont les 24 h de la donnée présente seulement sur l'appareil qui comptent ;
  - l'instant de cette modification est déduit du journal local des modifications non déposées ; il est remis à zéro par un dépôt confirmé. Il n'est pas synchronisé et ne change pas le format Drive. Il est évalué à l'ouverture, au retour au premier plan et chaque minute tant que l'application est ouverte ; il est comparé à l'horloge de l'appareil (écart d'horloge sans conséquence grave : bandeau non bloquant) ;
  - le bandeau disparaît dès que le marqueur rejoint la dernière modification, c'est-à-dire après un dépôt confirmé par Drive ;
  - aucune limite de durée imposée à l'usage hors ligne (RG-021), aucune notification système (pas de serveur ni de tâche de fond : DEC-007 ; arrière-plan abandonné, DEC-034 Q-PWA-3) ;
  - impact : un champ local de plus, un sélecteur dans `synchronisation`, aucune migration du format Drive.
- **ADR applicables** : ADR-001, ADR-002, ADR-003, ADR-004, ADR-010, ADR-013.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2.5](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

- **Écrans modifiés** : tous les écrans du smartphone (en-tête avec l'indicateur) ; exemples hors ligne dans [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) B, [ECR-008](../../02-ux/maquettes/ECR-008-liste-objectifs.html) E, [ECR-002](../../02-ux/maquettes/ECR-002-taches-priorisees.html) L3, [ECR-001](../../02-ux/maquettes/ECR-001-aujourdhui.html) B.
- **Écran créé (partagé)** : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) B (modifications en attente).
- **Parcours impactés** : P-09 (travailler hors ligne, retrouver ses données), P-01 étape 7 (cible), P-07 (première connexion sans réseau).
- **Nouveaux composants** : `SyncStatus` état « Hors ligne », point « en attente d'envoi » sur `TaskRow`, liste des modifications en attente de `SyncSheet` (guide §4.2, §4.8, §6.4).
- **Forme de l'indication hors ligne (CA-3, « forme fixée en E4 »)** :
  1. libellé « Hors ligne · n en attente » à la place de l'icône, dans l'en-tête ;
  2. point gris « en attente d'envoi » sur chaque ligne modifiée ;
  3. liste lisible des modifications dans la feuille de synchronisation ;
  4. un toast unique au passage hors ligne ;
  5. aucun bandeau avant 24 h (rappel RG-057 ensuite, voir ci-dessous), aucun bouton désactivé (sauf « Synchroniser maintenant », avec son explication).
- **Au retour du réseau (CA-4, CA-7)** : « Synchronisation… » puis « À jour », **sans toast** si tout s'est bien passé ; si des valeurs ont été écartées, point accent sur l'indicateur et toast « Voir » (voir US-017).
- **Rappel après 24 h (CA-9, RG-057, V-12)** : bandeau d'attention (`Banner`, guide §4.9, `BAN-RAPPEL-24H`), non bloquant, fermable, sans action ; « Modifications en attente depuis plus de 24 h · n modifications ne sont encore que sur ce smartphone. » Absent si aucune modification n'est en attente ; disparaît à l'enregistrement dans le Drive. Fermé (« Masquer le rappel »), il réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente. Maquette : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) J.
  - **Point de départ des 24 h (décision DEC-025, Q-ERG-16 b)** : la plus ancienne modification en attente. Le bandeau ne sonne donc pas pour une modification faite la veille au soir.
  - **Accès Google perdu et modification en attente depuis plus de 24 h (décision DEC-025, Q-ERG-17 a)** : un seul bandeau, celui de « Se reconnecter » (non fermable), complété de la phrase « n modifications ne sont encore que sur ce smartphone » ; pas de second bandeau empilé (ECR-011 L). Le rappel RG-057 est ainsi tenu sans doubler l'alerte.
- **États** :
  - *vide* : l'état vide d'un objectif ou des tâches fonctionne hors ligne ;
  - *chargement* : aucun écran d'attente à l'ouverture sans réseau (CA-1), données de l'appareil aussitôt ;
  - *erreur* : première connexion sans réseau (voir US-022) ;
  - *hors ligne* : décrit ci-dessus, sans durée maximale (CA-6) ;
  - *synchronisation* : « Hors ligne » → « Synchronisation… » → « À jour » ;
  - *conflit* : voir US-017.
- **Accessibilité et responsive** : passage hors ligne et retour annoncés `role="status"`, sans interrompre ; le point « en attente » a un nom accessible ; le libellé hors ligne est visible, pas seulement une icône.
- **Questions et réserves** : aucune nouvelle. Perte de l'accès Google (CA-8) : bandeau « Se reconnecter » (voir US-022 et ECR-011 D), travail inchangé.

## Tests métiers
*Rédigé par Pepper (E5, 2026-10-21 ; mis à jour en E8).* Fichier : [`tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature`](../../../tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature) — **30 scénarios**, dont 1 en recette manuelle (`@recette`, S09b) et 2 par l'interface (`@ihm`, S18, S19). *DEC-034 : les scénarios nouveaux ou adaptés (S06, S06b, S06c, S09b, S11, S18, S19) portent le tag `@DEC-034` ; validés le 2026-10-22 (DEC-036), retirés si la condition de DEC-034 échoue (M-RED, M-PERSIST).* Chaque scénario porte les tags `@US-018`, `@RG-xxx` et `@LOT-001`. Vocabulaire des étapes : [`GLOSSAIRE-ETAPES.md`](../../../tests/features/GLOSSAIRE-ETAPES.md).

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01 |
| CA-2 | S02, S03, S04 |
| CA-3 | S05, S05b (plusieurs modifications d'un élément), S05c (élément créé puis supprimé ; suppression d'un élément enregistré) |
| CA-4 | S06 (accès Google valide), S06b (accès à renouveler au retour du réseau, application ouverte : un geste ; `@DEC-034`), S06c (redirection en échec à l'ouverture : un geste ; `@DEC-034`) |
| CA-5 | S09 (cas d'usage), S09b (`@recette` : arrêt forcé de l'application installée et redémarrage réel du téléphone) |
| CA-6 | S10 |
| CA-7 | S07, S08 |
| CA-8 | S11 (accès retiré) ; accès expiré : S06b (précision DEC-034, DEC-036) |
| CA-9 (RG-057) | S15, S15b (plus ancienne modification en attente), S15c (nouvelle modification d'un élément déjà en attente), S16 (24 h exactement, avant 24 h, aucune modification), S16b (hors ligne depuis 25 h, modification faite il y a 1 min), S17 (disparition à l'enregistrement), S17b (fermé puis rouvert), S17c, S17d (accès Google perdu : un seul bandeau, avec ou sans mention) |
| Cas limite : première connexion sans réseau | S12 |
| Cas limite : réseau perdu pendant une saisie | S13 (saisie en étapes successives, comme US-031 S17) |
| Cas limite : réseau intermittent | S14 |
| Cas limite : suppression sur le PC pendant une modification hors ligne | S08 |
| Cas limite : Drive plein au retour du réseau | US-017 S29 |
| Cas limite : mise à jour application fermée | US-017 S04 |
| Heure de Paris hors ligne | S04 |
| Cas limite (DEC-034, DEC-036) : données du navigateur effacées | S18 (`@ihm`) |
| Cas limite (DEC-034, DEC-036) : première ouverture dans le navigateur sans réseau | S19 (`@ihm`) |

## Questions ouvertes
Aucune. V-DEC034-1, 3, 5, 6, 7 validées le 2026-10-22 (DEC-036, « Tout reco »).
- **Q-DEC034-1** (Starck) : **répondue le 2026-10-22** (critère de la mesure M-RED) : à l'ouverture, l'accès se renouvelle **sans aucun geste**, par une redirection silencieuse vers Google de 1 à 2 s, **une seule tentative** ; si elle échoue, l'indicateur passe à « Reprendre la synchronisation » (`SYN-SESSION`). Le geste « Reprendre la synchronisation » n'est demandé que si l'accès expire en cours d'utilisation ou si la redirection échoue ; une saisie n'est demandée que si l'utilisateur n'est plus identifié auprès de Google sur l'appareil (session Google elle-même expirée). Report : CA-4 (précision), cas limites, S06c ; glossaire d'étapes v1.8 (`l'accès à Google est renouvelé sans saisie`) ; glossaire du cahier des charges (« Accès Google à renouveler »).

*Antérieurement* : Q-DEM001-39 a été répondue le 2026-10-21 (b, DEC-013) : le PC fait l'objet de US-031, dans le même lot. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 et v0.2 : US au backlog, proposée pour le lot suivant LOT-001. |
| 2026-10-20 | Intégration à LOT-001 par décision du commanditaire (DEC-002). Fichier détaillé créé (Pepper, fin de E1, v0.4). |
| 2026-10-21 | v0.5 (Pepper) : Q-DEM001-39 b) (DEC-013) ; le PC est traité par US-031, dans le même lot. |
| 2026-10-21 | V-12 retenue (DEC-018) : nouveau CA-9 (bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente, RG-057) et CA-6 précisé ; scénarios S15 à S17. |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
| 2026-10-21 | E7, tour 1 du refinement (Pepper) : ANT-2 et ANT-15 (S12 : motif de connexion `ERR-003`), ANT-16 (convention de date des tâches de contexte « terminées » ou « abandonnées » : glossaire d'étapes), assertions de bandeaux, mentions et indicateur exprimées par les codes du catalogue (`SYN-`, `MEN-`, `BAN-`), PEP-8. RG-057 et les scénarios S15 à S17 sont inchangés dans l'attente des réponses Q-ERG-16 à 18. |
| 2026-10-21 | E7, tour 2 du refinement (Pepper) : décisions du commanditaire DEC-025 (verbatim « Reco ») intégrées à RG-057 et au CA-9 : Q-ERG-16 b (24 h depuis la plus ancienne modification en attente), Q-ERG-17 a (accès perdu : un seul bandeau « Se reconnecter » complété du nombre de modifications), Q-ERG-18 (bandeau fermé : réapparition à la prochaine ouverture). Scénarios S15 à S17 réécrits avec le code `BAN-RAPPEL-24H`, nouveaux S15b, S16b, S17b, S17c, S17d. Les propositions 1 et 2 de la section « Impacts ergonomie » sont ainsi tranchées (section non modifiée). |
| 2026-10-21 | E8 (Pepper), réponses aux demandes de précision d'Anthony : Q-US-018-1 (décompte par élément et départ des 24 h, CA-3 et CA-9 précisés ; S05b, S05c, S15c ajoutés), Q-US-018-2 (S13 aligné sur US-031 S17 ; formes au glossaire v1.2), Q-US-018-3 (S09 au niveau des cas d'usage ; variante S09b en recette manuelle), Q-US-022-1 (sens de « l'accès a été retiré » : déjà constaté), Q-US-017-7 (préfixes d'appareil, S07 et S08). Précisions sans changement de règle. |
| 2026-10-22 | Révision DEC-034 (Pepper), proposée (V-DEC034) : CA-4 reformulé (accès Google à renouveler : au plus un geste) ; précision de CA-8 (accès expiré sans bandeau, comme sur le PC) ; cas limites ajoutés (première ouverture dans le navigateur sans réseau, données du navigateur effacées, hors ligne garanti depuis l'application installée) ; synchronisation en arrière-plan exclue ; iPhone reformulé. Scénarios : S06 précisé (accès valide), S09b adapté (application installée), S11 limité à l'accès retiré ; nouveaux S06b, S18, S19 (29 scénarios). Statut : En analyse. |
| 2026-10-22 | Révision DEC-034 **validée par le commanditaire** (DEC-036, verbatim « Tout reco », V-DEC034-1, 3, 5, 6, 7) : CA-4, précision de CA-8 et cas limites en vigueur ; texte antérieur de CA-4 conservé pour rétablissement si la condition de DEC-034 échoue (M-RED, M-PERSIST). Réponse de Starck à Q-DEC034-1 reportée (renouvellement sans geste à l'ouverture, une seule tentative, sinon `SYN-SESSION`) : précision de CA-4, nouveau cas limite et scénario S06c (30 scénarios). Statut : **Prête**. |
| 2026-10-28 | DEC-039 (Q-RL-P6, a) : cas limite ajouté pour CA-4, « geste pendant une saisie, fenêtre de Google en panne » (`TST-SAISIE-A-TERMINER`, second geste après la saisie), seule exception au geste unique. Critères et scénarios inchangés. |
