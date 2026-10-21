# US-018 — Utiliser l'application sans réseau sur mon smartphone
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : Validée

**En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon smartphone sans réseau, mes modifications étant prises en compte au retour du réseau, **afin de** ne pas dépendre de la couverture réseau.

> Les marqueurs (P) (propositions de Pepper) ont été retirés : tous les critères sont validés par le commanditaire (DEC-018, 2026-10-21).

## Analyse d'écart (cahier des charges et existant)
- **Confirmé** : Q-DEM001-4.1 c) (consultation et saisie sans réseau) ; smartphone prioritaire (complément du commanditaire).
- **Modifié en v0.4** : l'US était proposée pour le lot suivant LOT-001. Le commanditaire l'a intégrée à LOT-001 (DEC-002), conformément à la recommandation de l'architecte (S3) : la mécanique de conservation des saisies sur l'appareil est de toute façon nécessaire au lot 1 (règle de conflit entre appareils connectés, perte de l'accès Google traitée comme une coupure de réseau, Q-DEM001-22.2 c).
- **Précisé** par Q-DEM001-23 : conflits résolus information par information, valeurs écartées signalées.
- **Smartphone Android uniquement** (DEC-001). Le PC relève de US-031, également intégrée à LOT-001 (Q-DEM001-39 b, DEC-013) : mêmes règles, transposées au PC.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-057 : bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente.
- RG-021 : consultation et saisie sans réseau, sur le smartphone et sur le PC ; prise en compte au retour du réseau ; smartphone prioritaire.
- RG-035 : la perte de l'accès Google se comporte comme une coupure de réseau.
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-047 à RG-049 : réparations après fusion.
- RG-019 : la première connexion nécessite le compte Google, donc le réseau.
- ENF-04, ENF-06 (validée).

## Critères d'acceptation
1. **CA-1** — Sur le smartphone, l'utilisateur s'étant déjà connecté au moins une fois, l'application s'ouvre sans réseau et affiche les données présentes sur l'appareil.
2. **CA-2** — Sans réseau, l'utilisateur peut effectuer toutes les opérations du lot 1 : créer, modifier et supprimer des objectifs, sous-objectifs, tâches et sous-tâches ; terminer, rouvrir, abandonner et reprendre des tâches. Les règles de gestion s'appliquent comme avec le réseau (alertes, état des objectifs, « en retard »).
3. **CA-3** — Sans réseau, l'application indique qu'elle est hors ligne et que des modifications ne sont pas encore synchronisées.
4. **CA-4** — Au retour du réseau, sans action de l'utilisateur, ses modifications sont enregistrées dans son Drive, et celles faites entre-temps sur l'autre appareil sont intégrées. L'indication « non synchronisé » disparaît une fois l'enregistrement fait.
5. **CA-5** — Aucune modification faite sans réseau n'est perdue, même si l'application est fermée, ou le smartphone éteint, avant le retour du réseau (ENF-06). Elle est enregistrée dans le Drive au premier retour du réseau, application ouverte.
6. **CA-6** — Il n'y a pas de durée maximale d'utilisation sans réseau : les modifications restent conservées sur l'appareil jusqu'au retour du réseau, et l'utilisation n'est jamais bloquée.
7. **CA-7** — Au retour du réseau, si la même information a été modifiée sur l'autre appareil, la règle de conflit et l'information sur les valeurs écartées s'appliquent (RG-036 ; US-017, CA-6 et CA-8), ainsi que les règles de réparation (RG-047 à RG-049 ; US-017, CA-10).
8. **CA-8** — Quand l'accès au compte Google est perdu (retiré ou expiré), le smartphone se comporte comme sans réseau (CA-2 à CA-5), et l'application propose de se reconnecter (RG-035 ; US-022, CA-7).
9. **CA-9** — *(RG-057, V-12)* Quand le smartphone est hors ligne depuis plus de 24 h avec des modifications en attente (non encore enregistrées dans le Drive), l'application affiche un bandeau de rappel **non bloquant** : ces modifications ne sont encore que sur le smartphone. Le bandeau n'empêche aucune opération et peut être ignoré. Il n'apparaît pas avant 24 h, ni si aucune modification n'est en attente. Il disparaît dès que les modifications sont enregistrées dans le Drive.

## Cas limites et cas d'erreur
- Première connexion sans réseau : impossible ; l'application l'indique (US-022).
- Réseau perdu pendant une saisie : la saisie est conservée ; aucune donnée n'est enregistrée à moitié.
- Réseau intermittent : aucune modification n'est enregistrée deux fois, et aucune n'est perdue.
- Objet supprimé sur le PC pendant qu'il est modifié sur le smartphone sans réseau : RG-047.
- Drive plein au retour du réseau : US-017, cas limites.
- Mise à jour avec l'autre appareil quand l'application est fermée : hors périmètre ; elle a lieu à la prochaine ouverture.

## Hors périmètre
- Utilisation sans réseau sur le PC (US-031, dans le même lot).
- Synchronisation en arrière-plan, application fermée (lot ultérieur).
- Application pour iPhone (exclue en v1, DEC-001).

## Impacts architecture

*Rédigé par Starck (E3, 2026-10-21). Référentiel : DAT v0.4, ADR-001, ADR-003, ADR-010.*

- **Composants touchés** :
  - application Capacitor Android : les ressources de l'application sont embarquées, donc l'ouverture sans réseau est native ;
  - `@capacitor/network`, pour détecter la connectivité et lancer la synchronisation au retour du réseau ;
  - adaptateur `DepotLocal` SQLite ;
  - contexte `synchronisation` : marqueur « déposé jusqu'à HLC x », d'où sont tirés l'indicateur « non synchronisé » (CA-3) et la reprise (CA-4) ;
  - `compte` : ouverture de la session sans jeton, à partir de l'identité mise en cache ; l'état « hors ligne » est distinct de l'état « accès perdu » (CA-8).
- **Données** :
  - aucune donnée nouvelle ;
  - le volume local hors ligne n'a pas de limite pratique (CA-6) : quelques Mo au maximum.
- **Garanties (CA-5, PT-13)** :
  - chaque cas d'usage écrit en **une transaction** SQLite ;
  - le dépôt dans Drive est idempotent : le fichier entier est réécrit ;
  - le marqueur n'avance qu'après la confirmation de Drive ;
  - un arrêt brutal à n'importe quelle étape ne fait que rejouer le dépôt (cas limite « réseau intermittent » : pas de double enregistrement).
- **Accès Google** : aucun pendant la période hors ligne. Au retour du réseau, renouvellement silencieux du jeton (R2).
- **Sécurité** : comme US-022 ; données dans le bac à sable de l'application Android.
- **Exigences non fonctionnelles** :
  - ouverture à froid hors ligne en moins de 2 s (ENF-T-01) ;
  - action locale en moins de 100 ms (ENF-T-02) ;
  - synchronisation lancée au retour du réseau en moins de 10 s.
- **Risques** :
  - R13 : maturité et performances du module SQLite pour Capacitor. Parade : adaptateur derrière un port, et repli possible sur l'IndexedDB de la WebView, acceptable sur Android ;
  - R2 : renouvellement silencieux du jeton.
- **PC** : le hors ligne du PC relève de US-031, entrée dans le lot par DEC-013. Le noyau est le même ; les spécificités du PC sont décrites dans les impacts architecture de US-031.
- **RG-057 (rappel après 24 h hors ligne, établie, V-12)** :
  - calcul **purement local**, sans réseau ni donnée synchronisée : la condition est « modifications en attente (marqueur « déposé jusqu'à HLC x » en retard) ET dernier contact réussi avec Drive vieux de plus de 24 h » ;
  - la référence est un instant local `dernierContactDrive`, persisté dans le dépôt local à chaque lecture ou dépôt réussi. Il est évalué à l'ouverture, au retour au premier plan et par une temporisation d'une minute pendant que l'application est ouverte ; il est comparé à l'horloge de l'appareil (écart d'horloge sans conséquence grave : bandeau non bloquant) ;
  - le bandeau disparaît dès que le marqueur rejoint la dernière modification, c'est-à-dire après un dépôt confirmé par Drive ;
  - aucune limite de durée imposée à l'usage hors ligne (RG-021), aucune notification système (pas de serveur ni de tâche de fond : DEC-007) ;
  - impact : un champ local de plus, un sélecteur dans `synchronisation`, aucune migration du format Drive.
- **ADR applicables** : ADR-001, ADR-002, ADR-003, ADR-004, ADR-010.

## Impacts ergonomie

*Rédigé par Steeve (E4, 2026-10-21). Référentiel : [guide d'ergonomie v0.2](../../02-ux/guide-ergonomie.md), [parcours v0.2](../../02-ux/parcours-utilisateurs.md), maquettes ci-dessous. Synthèse du lot : `docs/lots/LOT-001.md`.*

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
- **Rappel après 24 h (CA-9, RG-057, V-12)** : bandeau d'attention (`Banner`, guide §4.9), non bloquant, fermable, sans action ; « Hors ligne depuis plus de 24 h · n modifications ne sont encore que sur ce smartphone. » Absent si aucune modification n'est en attente ; disparaît à l'enregistrement dans le Drive. Maquette : [ECR-011](../../02-ux/maquettes/ECR-011-synchronisation-et-compte.html) J.
  - **Proposition 1 (point de départ des 24 h)** : *plus ancienne modification en attente*. Recommandée : le risque porte sur l'âge des données non enregistrées, et le bandeau ne sonne pas pour une modification de la veille au soir. Variante : début du hors ligne, plus simple à expliquer mais qui alerte aussitôt après une première modification faite tard dans une longue coupure.
  - **Proposition 2 (accès Google perdu depuis plus de 24 h, bandeau « Se reconnecter » déjà affiché)** : *un seul bandeau*, celui de « Se reconnecter » (non fermable), complété de la phrase « n modifications ne sont encore que sur ce smartphone » ; pas de second bandeau empilé (ECR-011 L). Le rappel RG-057 est ainsi tenu sans doubler l'alerte.
  - Ces deux points relèvent de RG-057 (règle métier non tranchée sur ces détails) : **questions pour le commanditaire**, via Pepper.
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
*Rédigé par Pepper (E5, 2026-10-21).* Fichier : [`tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature`](../../../tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature) — **17 scénarios, dont 0 tagué `@propose`** (les règles et critères proposés ont été validés le 2026-10-21, DEC-018 ; le tag est retiré). Chaque scénario porte les tags `@US-018`, `@RG-xxx` et `@LOT-001`.

| Critère ou cas | Scénario(s) |
|---|---|
| CA-1 | S01 |
| CA-2 | S02, S03, S04 |
| CA-3 | S05 |
| CA-4 | S06 |
| CA-5 | S09 |
| CA-6 | S10 |
| CA-7 | S07, S08 |
| CA-8 | S11 |
| CA-9 (RG-057) | S15, S16, S17 |
| Cas limite : première connexion sans réseau | S12 |
| Cas limite : réseau perdu pendant une saisie | S13 |
| Cas limite : réseau intermittent | S14 |
| Cas limite : suppression sur le PC pendant une modification hors ligne | S08 |
| Cas limite : Drive plein au retour du réseau | US-017 S29 |
| Cas limite : mise à jour application fermée | US-017 S04 |
| Heure de Paris hors ligne | S04 |

## Questions ouvertes
Aucune. Q-DEM001-39 a été répondue le 2026-10-21 (b, DEC-013) : le PC fait l'objet de US-031, dans le même lot. Tous les critères sont validés par le commanditaire (DEC-018).

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 et v0.2 : US au backlog, proposée pour le lot suivant LOT-001. |
| 2026-10-20 | Intégration à LOT-001 par décision du commanditaire (DEC-002). Fichier détaillé créé (Pepper, fin de E1, v0.4). |
| 2026-10-21 | v0.5 (Pepper) : Q-DEM001-39 b) (DEC-013) ; le PC est traité par US-031, dans le même lot. |
| 2026-10-21 | V-12 retenue (DEC-018) : nouveau CA-9 (bandeau de rappel non bloquant après 24 h hors ligne avec modifications en attente, RG-057) et CA-6 précisé ; scénarios S15 à S17. |
| 2026-10-21 | Validée par le commanditaire le 2026-10-21 (DEC-018) : US, critères (P) retenus et règles proposées associées (marqueurs (P) retirés). |
