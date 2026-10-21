# US-018 — Utiliser l'application sans réseau sur mon smartphone
Demande d'origine : DEM-001 · Lot : LOT-001
Statut : En analyse

**En tant qu'**utilisateur, **je veux** consulter et saisir mes données sur mon smartphone sans réseau, mes modifications étant prises en compte au retour du réseau, **afin de** ne pas dépendre de la couverture réseau.

> Convention : les critères marqués **(P)** sont des propositions de Pepper qui ne découlent pas directement d'une réponse du commanditaire. Ils sont soumis à sa validation en E6.

## Analyse d'écart (cahier des charges et existant)
- **Confirmé** : Q-DEM001-4.1 c) (consultation et saisie sans réseau) ; smartphone prioritaire (complément du commanditaire).
- **Modifié en v0.4** : l'US était proposée pour le lot suivant LOT-001. Le commanditaire l'a intégrée à LOT-001 (DEC-002), conformément à la recommandation de l'architecte (S3) : la mécanique de conservation des saisies sur l'appareil est de toute façon nécessaire au lot 1 (règle de conflit entre appareils connectés, perte de l'accès Google traitée comme une coupure de réseau, Q-DEM001-22.2 c).
- **Précisé** par Q-DEM001-23 : conflits résolus information par information, valeurs écartées signalées.
- **Smartphone Android uniquement** (DEC-001). Le PC relève de US-031, selon Q-DEM001-39, désormais P1.
- **Existant.** Aucune fonctionnalité livrée.

## Règles de gestion applicables (RG-xxx)
- RG-021 : consultation et saisie sans réseau ; prise en compte au retour du réseau ; smartphone prioritaire.
- RG-035 : la perte de l'accès Google se comporte comme une coupure de réseau.
- RG-036 : la modification la plus récente l'emporte, information par information ; valeurs écartées signalées.
- RG-047 à RG-049 (proposées) : réparations après fusion.
- RG-019 : la première connexion nécessite le compte Google, donc le réseau.
- ENF-04, ENF-06 (validée).

## Critères d'acceptation
1. **CA-1** — Sur le smartphone, l'utilisateur s'étant déjà connecté au moins une fois, l'application s'ouvre sans réseau et affiche les données présentes sur l'appareil.
2. **CA-2** — Sans réseau, l'utilisateur peut effectuer toutes les opérations du lot 1 : créer, modifier et supprimer des objectifs, sous-objectifs, tâches et sous-tâches ; terminer, rouvrir, abandonner et reprendre des tâches. Les règles de gestion s'appliquent comme avec le réseau (alertes, état des objectifs, « en retard »).
3. **CA-3** — Sans réseau, l'application indique qu'elle est hors ligne et que des modifications ne sont pas encore synchronisées **(P : forme et contenu fixés en E4)**.
4. **CA-4** — Au retour du réseau, sans action de l'utilisateur, ses modifications sont enregistrées dans son Drive, et celles faites entre-temps sur l'autre appareil sont intégrées. L'indication « non synchronisé » disparaît une fois l'enregistrement fait.
5. **CA-5** — Aucune modification faite sans réseau n'est perdue, même si l'application est fermée, ou le smartphone éteint, avant le retour du réseau (ENF-06). Elle est enregistrée dans le Drive au premier retour du réseau, application ouverte.
6. **CA-6** — Il n'y a pas de durée maximale d'utilisation sans réseau : les modifications restent conservées sur l'appareil jusqu'au retour du réseau **(P)**.
7. **CA-7** — Au retour du réseau, si la même information a été modifiée sur l'autre appareil, la règle de conflit et l'information sur les valeurs écartées s'appliquent (RG-036 ; US-017, CA-6 et CA-8), ainsi que les règles de réparation proposées (RG-047 à RG-049 ; US-017, CA-10).
8. **CA-8** — Quand l'accès au compte Google est perdu (retiré ou expiré), le smartphone se comporte comme sans réseau (CA-2 à CA-5), et l'application propose de se reconnecter (RG-035 ; US-022, CA-7).

## Cas limites et cas d'erreur
- Première connexion sans réseau : impossible ; l'application l'indique (US-022).
- Réseau perdu pendant une saisie : la saisie est conservée ; aucune donnée n'est enregistrée à moitié **(P)**.
- Réseau intermittent : aucune modification n'est enregistrée deux fois, et aucune n'est perdue.
- Objet supprimé sur le PC pendant qu'il est modifié sur le smartphone sans réseau : RG-047 (proposée).
- Drive plein au retour du réseau : US-017, cas limites.
- Mise à jour avec l'autre appareil quand l'application est fermée : hors périmètre ; elle a lieu à la prochaine ouverture.

## Hors périmètre
- Utilisation sans réseau sur le PC (US-031, selon Q-DEM001-39).
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
- **Q-DEM001-39 (PC)** : si l'option b est retenue, le même périmètre s'applique au PC, avec trois ajouts :
  - service worker qui met en cache l'application ;
  - chargement de Google Identity Services **à la demande et non bloquant**, car le script Google ne se charge pas hors ligne ;
  - `navigator.storage.persist()`.
- **ADR applicables** : ADR-001, ADR-002, ADR-003, ADR-004, ADR-010.

## Impacts ergonomie

## Tests métiers
À rédiger en E5 : `tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature`.

## Questions ouvertes
- **Q-DEM001-39 (P1)** : hors ligne sur le PC. Si l'option b) est retenue (même lot), US-031 rejoint LOT-001 ou le périmètre de cette US est étendu au PC.

## Historique (validations du commanditaire, précisions)
| Date | Événement |
|---|---|
| 2026-10-20 | v0.1 et v0.2 : US au backlog, proposée pour le lot suivant LOT-001. |
| 2026-10-20 | Intégration à LOT-001 par décision du commanditaire (DEC-002). Fichier détaillé créé (Pepper, fin de E1, v0.4). |
