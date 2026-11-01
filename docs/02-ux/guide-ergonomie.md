# Guide d'ergonomie

> **Version 0.2.20, 2026-11-01 (Steeve).** LOT-001, rang 9 (US-017, incrément 2), réponses à Q-ST017-STE-2, Q-ST017-STE-3 et Q-ST017-D2-1 d'Anthony (ST-US-017 §16) : textes de la section « À lire » d'ECR-011 et de la carte d'incohérence d'ECR-007. Nouvelle famille `TXT-` (fragments de texte partagés : noms d'information, valeurs signalées, actions « Voir … », §6.6.12) ; `SEC-MODIFS-EFFACEES` (Disclosure de la carte `ALR-008`) ; variante `sous-tache` d'`ALR-010` ; variantes `sans-objectif` et `objectifs` d'`ALR-003`. Simplification des lignes `ALR-009`, `ALR-010`, `ALR-011` et `ALR-014` : l'appareil et l'heure de chaque valeur sont retirés (les données ne nomment pas l'appareil d'une écriture ; CA-8 et RG-056 demandent l'élément, l'information, la valeur non retenue et la valeur conservée, qui restent). `ALR-011` : deux variables distinctes. Une valeur d'état porte sa date (« terminée le 22 oct. »). ECR-011 (C, G) et ECR-007 (H) alignés. Aucune règle de gestion ni aucun texte validé par le commanditaire n'est modifié.
>
> **Version 0.2.19, 2026-10-30 (Steeve).** Décision du commanditaire (Q-US-023-n, option b) : le champ « Placer sous un objectif » de la feuille de création d'un objectif est reporté à un lot ultérieur et retiré d'ECR-008 B et G (v0.1.2). Le placement passe uniquement par « Ajouter » dans le détail du parent (ECR-003 D) et « Placer sous un autre objectif » du menu « … » (ECR-003 C). Aucune règle de gestion modifiée.
>
> **Version 0.2.18, 2026-10-30 (Steeve).** E13 du rang 4 de LOT-001, réponse à Q-ANT-E13-R4-1 (DT-015) : codes du sélecteur de parent (famille `SEL-`, §6.6.4) ; entrée du menu « … » « Placer sous un autre objectif » (et non « Déplacer… ») ; carte d'alerte du détail d'un sous-objectif rattachée à `ALR-007` (variante détail, action « Changer le délai », §6.6.9). ECR-003 C et E, ECR-008 C alignés. Aucune règle de gestion ni périmètre modifié.
>
> **Version 0.2.17, 2026-10-28 (Steeve).** `ERR-017` corrigé : IndexedDB ne permet pas d'annuler une suppression en attente ; le message annonce qu'elle se terminera à la fermeture des autres fenêtres, et l'action « Fermer » devient « Aller à la connexion ». Réponses d'Anthony à S1-S7 vérifiées.
>
> **Version 0.2.16, 2026-10-28 (Steeve).** RL-LOT-001-P4 (Pepper) : texte d'`ERR-004` rendu neutre quant au compte (hors réseau, l'application ne sait pas quel compte tente de se connecter ; l'espace présent peut être celui d'un autre compte). Code et déclencheur inchangés.
>
> **Version 0.2.15, 2026-10-27 (Steeve).** E11 de LOT-001, réserve RL-LOT-001-A1 de Starck : code `ERR-017` créé (suppression des données de cet appareil bloquée par une autre fenêtre ou un autre onglet de Done Juan, §6.6.8) ; écran d'attente `SYN-REDIRECTION` limité à 10 s (§6.6.2, remarque S6). Aucune règle de gestion modifiée.
>
> **Version 0.2.14, 2026-10-27 (Steeve).** E11 de LOT-001 (`ceremonies/lancement-LOT-001-steeve.md`) : réponse à Q-ST022-STE-4 (`TST-SAISIE-A-TERMINER`, §6.6.6) ; §5.8 complété : ordre des deux listes de la feuille (modifications en attente, informations à lire) et rendu des sections vides du détail d'un objectif. Code `EVD-OBJECTIFS-TOUS-ATTEINTS` créé (§6.6.5). Aucune règle de gestion modifiée.
>
> **Version 0.2.13, 2026-10-27 (Steeve).** Q-ST031-PEP-1 : fin de session dans un autre onglet du PC, confirmation de « sans message » (§6.6.11). Aucun code créé.
>
> **Version 0.2.12, 2026-10-27 (Steeve).** E9 d'US-022, 017, 018 et 031, réponses à Q-ST022-STE-1 à 3 et Q-ST018-STE-1 : écran d'attente `SYN-REDIRECTION` ; `SYN-SESSION` et `ERR-015` valables sur smartphone (PWA unique, DEC-034, DEC-036) ; hors ligne, `SYN-HORS-LIGNE` l'emporte sur `SYN-SESSION` ; ligne `SYN-FEUILLE-STOCKAGE` et carte `ALR-015`. ECR-010 complété (cadre « Attente »). Aucune règle de gestion modifiée.
>
> **Version 0.2.11, 2026-10-22 (Steeve).** DEC-032, réponse à Q-US-025-3 : reprise d'une sous-tâche abandonnée sous une tâche parente terminée ; confirmation `CNF-REPRENDRE-SOUS-TACHE` créée (§6.6.7, ECR-007 D3). Choix d'un code distinct de `CNF-ROUVRIR-SOUS-TACHE` : l'action demandée est une reprise (titre et bouton différents), la réouverture de la tâche parente n'en est que la conséquence annoncée.
>
> **Version 0.2.10, 2026-10-22 (Steeve).** E9 de LOT-001, réponse à Q-US-002-4 (Anthony) : sous-tâches sous une tâche parente terminée ou abandonnée (§5.8 (d)). ECR-003 inchangé, déjà conforme.
>
> **Version 0.2.9, 2026-10-22 (Steeve).** E9 de LOT-001, réponse à Q-US-001-6 (Anthony) : ordre d'affichage des listes d'objectifs, de sous-objectifs, de tâches du détail d'un objectif et de sous-tâches (§5.8) ; section « Atteints » conservée ; codes `SEC-` créés (§6.6.4 bis). ECR-008 réordonné. Aucune règle de gestion ni périmètre modifié.
>
> **Version 0.2.8, 2026-10-21 (Steeve).** Correction de fin d'E8 de LOT-001 (É-3, `explicitation-LOT-001.md`) : libellés d'`ALR-010` complétés pour le rattachement et le placement non retenus, en cas de suppression concurrente d'un objectif (DEC-030, §6.6.9).
>
> **Version 0.2.7, 2026-10-21 (Steeve).** E8 de LOT-001, réponses aux demandes de précision d'Anthony (`explicitation-LOT-001.md`) : liste « Tâches » (filtre, tri, sous-tâches : §5.7, Q-US-002-1) ; point « à lire » indépendant de l'état de l'indicateur, sans modifier RG-056 (§4.8, §6.5, §6.6.2, Q-US-017-6) ; décompte d'une « modification en attente » (§6.6.1, Q-US-018-1) ; avis sur Q-US-003-1, 017-8, 017-10, 017-11, 017-12, 022-2, 022-4, 023-1, 031-2 (§6.6.11). Codes créés : `ERR-016`, `ALR-014`, `EVD-FILTRE-A-FAIRE`, `SYN-FEUILLE-A-LIRE`. **Version 0.2.6, 2026-10-21 (Steeve).** Remarque RF-LOT-001-PEP-14 : en-tête mis à jour (US de LOT-001 validées le 2026-10-21, DEC-018) ; §11 : distribution Android par installation directe de l'APK par le commanditaire (DEC-021, ADR-012), en remplacement de Google Play (DEC-005). **Version 0.2.5, 2026-10-21 (Steeve).** Décision DEC-025 du commanditaire sur Q-ERG-16, 17 et 18 (RG-057) : les 24 h du rappel courent depuis la plus ancienne modification en attente ; en cas d'accès Google perdu, un seul bandeau « Se reconnecter », complété du nombre de modifications seulement sur l'appareil ; le rappel fermé réapparaît à la prochaine ouverture tant que des modifications sont en attente. Mise à jour de §4.9, §6.6.3, §6.6.9, §6.6.10, §12.1 et des cadres J et L d'ECR-011 ; « sous réserve » retiré des entrées du catalogue concernées. **Version 0.2.4, 2026-10-21 (Steeve).** Tour 2 du refinement (ANT-21) : motifs de refus des scénarios rattachés à des codes (`ERR-023`, `ERR-032` à `ERR-035` créés, variantes d'`ERR-030`), table de correspondance (§6.6.10), forme de `MEN-HEURE-PARIS` avec une date de fin. **Version 0.2.3 :** E7 de LOT-001, tour 1 : catalogue des libellés et des codes d'état observables (§6.6, ANT-7), écran d'atterrissage (BEN-6), mention « Heure de Paris » par écran (BEN-8), compteur 3/3 « En cours » (PEP-10), confirmation d'abandon sans sous-tâche (ECR-007 D2), question Q-ERG-18. Version précédente : 0.2.1. Mise à jour de l'étape E4 de LOT-001 (itération majeure, 10 US). La v0.1 (2026-10-20) était le socle UX initial, hors cycle de lot.
>
> **Entrées de la v0.2** : LOT-001 et ses 10 US (US-022, 017, 018, 031, 001, 023, 002, 024, 003, 025), cahier des charges v0.5 (RG-043 à RG-055), DAT v0.4 et synthèse d'architecture du lot, décisions DEC-001 à DEC-016 (`suivi-projet.md`), réponses du commanditaire aux questions Q-ERG-02 à Q-ERG-11.
>
> **Ce qui change par rapport à la v0.1** : réponses Q-ERG-02 à 11 intégrées (§12.1) ; navigation du lot 1 (§2.1, Q-ERG-12) ; feuille de synchronisation et de compte, connexion, valeurs écartées, incohérences, données absentes du Drive, « Supprimer les données de cet appareil » (§4, §6, §7) ; mention « Heure de Paris » (§4.21) ; huit nouveaux composants (§4.21 à §4.28) ; nouvelles maquettes ECR-007, 008, 010, 011 et mise à jour des ECR-001, 002, 003 (§13). Les changements sont repérables par la mention **(v0.2)**.
>
> **Statut** : document de travail. Les US de LOT-001 ont été validées par le commanditaire le 2026-10-21 (DEC-018, E6). Les choix qui dépendent d'une question ouverte sont signalés par la mention **(sous réserve de Q-…)**. Les choix de plateforme sont regroupés au §11 : le DAT v0.4 retient une PWA sur PC et une application Capacitor sur Android (DEC-001, DEC-006).

## Sommaire

- [1. Principes de design](#1-principes-de-design) (l. 113)
- [2. Architecture de l'information et navigation](#2-architecture-de-linformation-et-navigation) (l. 133)
  - [2.1 Vues principales](#21-vues-principales) (l. 135)
  - [2.2 Navigation](#22-navigation) (l. 152)
  - [2.3 Badges de navigation](#23-badges-de-navigation) (l. 162)
- [3. Charte graphique (tokens)](#3-charte-graphique-tokens) (l. 169)
  - [3.1 Couleurs](#31-couleurs) (l. 173)
  - [3.2 Typographie](#32-typographie) (l. 203)
  - [3.3 Espacements](#33-espacements) (l. 221)
  - [3.4 Rayons](#34-rayons) (l. 235)
  - [3.5 Ombres et élévation](#35-ombres-et-élévation) (l. 244)
  - [3.6 Mouvement](#36-mouvement) (l. 255)
  - [3.7 Iconographie](#37-iconographie) (l. 264)
- [4. Bibliothèque de composants](#4-bibliothèque-de-composants) (l. 301)
  - [4.1 Boutons](#41-boutons) (l. 305)
  - [4.2 Ligne de tâche (TaskRow)](#42-ligne-de-tâche-taskrow) (l. 317)
  - [4.3 Saisie rapide (QuickAdd)](#43-saisie-rapide-quickadd) (l. 345)
  - [4.4 Sélecteur de durée (DurationStepper)](#44-sélecteur-de-durée-durationstepper) (l. 359)
  - [4.5 Jauge de capacité (CapacityGauge)](#45-jauge-de-capacité-capacitygauge) (l. 368)
  - [4.6 Puce (Chip)](#46-puce-chip) (l. 379)
  - [4.7 Carte « À traiter » (ActionCard)](#47-carte--à-traiter--actioncard) (l. 383)
  - [4.8 Indicateur de synchronisation (SyncStatus)](#48-indicateur-de-synchronisation-syncstatus) (l. 386)
  - [4.9 Bandeau (Banner)](#49-bandeau-banner) (l. 392)
  - [4.10 Message éphémère (Toast)](#410-message-éphémère-toast) (l. 395)
  - [4.11 Feuille (BottomSheet) et panneau de détail (DetailPanel)](#411-feuille-bottomsheet-et-panneau-de-détail-detailpanel) (l. 398)
  - [4.12 Boîte de confirmation (ConfirmDialog)](#412-boîte-de-confirmation-confirmdialog) (l. 403)
  - [4.13 En-tête de vue (ViewHeader)](#413-en-tête-de-vue-viewheader) (l. 419)
  - [4.14 Barre d'onglets (TabBar), rail (NavRail), barre latérale (Sidebar)](#414-barre-donglets-tabbar-rail-navrail-barre-latérale-sidebar) (l. 422)
  - [4.15 Progression d'objectif (GoalProgress)](#415-progression-dobjectif-goalprogress) (l. 426)
  - [4.16 Comparatif avant / après (ChangePreview)](#416-comparatif-avant--après-changepreview) (l. 429)
  - [4.17 Champ texte libre (TextArea)](#417-champ-texte-libre-textarea) (l. 432)
  - [4.18 Section repliable (Disclosure)](#418-section-repliable-disclosure) (l. 435)
  - [4.19 État vide (EmptyState)](#419-état-vide-emptystate) (l. 438)
  - [4.20 Squelette de chargement (Skeleton)](#420-squelette-de-chargement-skeleton) (l. 441)
  - [4.21 Mention « Heure de Paris » (ParisTimeNote) — nouveau (v0.2, RG-054, A-F6)](#421-mention--heure-de-paris--paristimenote--nouveau-v02-rg-054-a-f6) (l. 444)
  - [4.22 Champ de détail (FieldRow) et champ verrouillé (LockedField) — nouveau (v0.2)](#422-champ-de-détail-fieldrow-et-champ-verrouillé-lockedfield--nouveau-v02) (l. 464)
  - [4.23 Carte d'incohérence (InconsistencyCard) — nouveau (v0.2, RG-049)](#423-carte-dincohérence-inconsistencycard--nouveau-v02-rg-049) (l. 468)
  - [4.24 Élément « non retenu » (DiscardedItem) — nouveau (v0.2, RG-036, RG-047, RG-048, Q-DEM001-23.2)](#424-élément--non-retenu--discardeditem--nouveau-v02-rg-036-rg-047-rg-048-q-dem001-232) (l. 471)
  - [4.25 Choix d'options (OptionCard) et étapes de préparation (StepProgress) — nouveaux (v0.2)](#425-choix-doptions-optioncard-et-étapes-de-préparation-stepprogress--nouveaux-v02) (l. 474)
  - [4.26 Feuille « Compte et synchronisation » (SyncSheet) — nouveau (v0.2, ECR-011)](#426-feuille--compte-et-synchronisation--syncsheet--nouveau-v02-ecr-011) (l. 478)
  - [4.27 Action destructrice isolée (DangerLink) — nouveau (v0.2)](#427-action-destructrice-isolée-dangerlink--nouveau-v02) (l. 481)
  - [4.28 Ligne d'objectif (ObjectiveRow) et sélecteur de parent (ParentPicker) — nouveaux (v0.2)](#428-ligne-dobjectif-objectiverow-et-sélecteur-de-parent-parentpicker--nouveaux-v02) (l. 484)
- [5. Règles d'interaction](#5-règles-dinteraction) (l. 490)
  - [5.1 Saisie rapide d'une tâche](#51-saisie-rapide-dune-tâche) (l. 492)
  - [5.2 Gestes mobiles](#52-gestes-mobiles) (l. 503)
  - [5.3 Raccourcis clavier (PC)](#53-raccourcis-clavier-pc) (l. 520)
  - [5.4 Planification](#54-planification) (l. 545)
  - [5.5 Annulation plutôt que confirmation](#55-annulation-plutôt-que-confirmation) (l. 551)
  - [5.6 Enregistrement](#56-enregistrement) (l. 556)
  - [5.7 Liste « Tâches » : filtres, tri, sous-tâches (v0.2.7, Q-US-002-1, US-002 CA-11)](#57-liste--tâches---filtres-tri-sous-tâches-v027-q-us-002-1-us-002-ca-11) (l. 559)
  - [5.8 Ordre des listes d'objectifs, de sous-objectifs, de tâches du détail et de sous-tâches (v0.2.9, Q-US-001-6)](#58-ordre-des-listes-dobjectifs-de-sous-objectifs-de-tâches-du-détail-et-de-sous-tâches-v029-q-us-001-6) (l. 577)
- [6. États : vide, chargement, erreur, hors ligne, synchronisation](#6-états--vide-chargement-erreur-hors-ligne-synchronisation) (l. 594)
  - [6.1 États vides](#61-états-vides) (l. 596)
  - [6.2 Chargement](#62-chargement) (l. 612)
  - [6.3 Erreurs](#63-erreurs) (l. 620)
  - [6.4 Hors ligne](#64-hors-ligne) (l. 655)
  - [6.5 États de l'indicateur de synchronisation](#65-états-de-lindicateur-de-synchronisation) (l. 666)
  - [6.6 Catalogue des libellés et des codes d'état observables (E7, ANT-7)](#66-catalogue-des-libellés-et-des-codes-détat-observables-e7-ant-7) (l. 684)
- [7. Alertes et propositions](#7-alertes-et-propositions) (l. 974)
  - [7.1 Niveaux](#71-niveaux) (l. 976)
  - [7.2 Où apparaissent-elles](#72-où-apparaissent-elles) (l. 983)
  - [7.3 Anatomie d'une proposition](#73-anatomie-dune-proposition) (l. 989)
  - [7.4 Propositions types](#74-propositions-types) (l. 1001)
  - [7.5 Créneau déplacé : traitement immédiat ou le soir (RG-037, v0.2)](#75-créneau-déplacé--traitement-immédiat-ou-le-soir-rg-037-v02) (l. 1012)
  - [7.6 Ordre de « Aujourd'hui » (v0.2, RG-051, Q-ERG-06)](#76-ordre-de--aujourdhui--v02-rg-051-q-erg-06) (l. 1019)
  - [7.7 Fun fact du matin (v0.2, RG-040, Q-ERG-02)](#77-fun-fact-du-matin-v02-rg-040-q-erg-02) (l. 1022)
  - [7.8 Bilan du soir accessible plus tôt (v0.2, RG-039, Q-ERG-04)](#78-bilan-du-soir-accessible-plus-tôt-v02-rg-039-q-erg-04) (l. 1025)
- [8. Rédaction de l'interface](#8-rédaction-de-linterface) (l. 1030)
- [9. Accessibilité (WCAG 2.2 AA)](#9-accessibilité-wcag-22-aa) (l. 1042)
- [10. Responsive](#10-responsive) (l. 1088)
- [11. En attente du DAT](#11-en-attente-du-dat) (l. 1120)
- [12. Questions ergonomiques](#12-questions-ergonomiques) (l. 1153)
  - [12.1 Questions ergonomiques](#121-questions-ergonomiques) (l. 1157)
  - [12.1 bis Décisions de conception prises par Steeve en v0.2 (pour information, sans question)](#121-bis-décisions-de-conception-prises-par-steeve-en-v02-pour-information-sans-question) (l. 1189)
  - [12.2 Questions résiduelles de Pepper qui conditionnent les écrans](#122-questions-résiduelles-de-pepper-qui-conditionnent-les-écrans) (l. 1197)
  - [12.3 Points de vigilance](#123-points-de-vigilance) (l. 1220)
- [13. Inventaire des écrans](#13-inventaire-des-écrans) (l. 1224)
  - [13.1 Écrans de LOT-001 et lecture par US (v0.2)](#131-écrans-de-lot-001-et-lecture-par-us-v02) (l. 1244)
- [14. Historique](#14-historique) (l. 1258)

## 1. Principes de design

Références : Things (calme, rythme « Aujourd'hui »), Todoist (saisie rapide), Linear (densité maîtrisée, raccourcis clavier, panneau de détail sur PC), Apple Rappels (simplicité de la liste, case à cocher immédiate).

| # | Principe | Ce que cela implique | Besoin utilisateur qui le justifie |
|---|---|---|---|
| P1 | **Une action principale par écran** | Un seul bouton plein (couleur d'accent) par écran. Les autres actions sont secondaires (contour), tertiaires (texte) ou dans un menu. | L'utilisateur consulte surtout sur smartphone, souvent entre deux activités : il doit savoir en une seconde quoi faire. |
| P2 | **Supprimer avant d'ajouter** | Toute information affichée doit servir une décision. Les détails (historique du temps passé, objectifs secondaires) sont dans le détail, pas dans la liste. | Le persona veut un pilotage chiffré, mais un écran de smartphone ne peut pas tout montrer. |
| P3 | **Aujourd'hui d'abord** | L'application s'ouvre sur « Aujourd'hui ». Les autres vues servent à préparer ou analyser cette journée. | Rythme quotidien demandé : rappel à 8 h, bilan à 21 h (DEM-001, RG-012, RG-013). |
| P4 | **Les actions fréquentes en 1 ou 2 gestes** | Terminer : 1 geste. Saisir une tâche : 1 geste pour ouvrir, puis Entrée. Planifier sur un jour : 2 gestes. Saisir un temps passé : 1 à 2 gestes par tâche. | Saisie quotidienne du temps (RG-008) et planification à la journée (RG-006) : la moindre friction répétée chaque jour finit par décourager l'usage. |
| P5 | **L'application propose, l'utilisateur décide** | Tout ce qui est calculé ou proposé (priorité, planning, horaire, nouveau délai, capacité) porte le marqueur « Proposé » et reste modifiable. Rien n'est appliqué sans validation, sauf le report automatique (RG-032), qui est signalé. | Exclusion « ajustement automatique sans validation » (CdC §4.3), RG-005, RG-011, RG-031, RG-037. |
| P6 | **Expliquer chaque proposition** | Une proposition affiche toujours son « pourquoi » en une phrase (« Vélocité moyenne : 9 h/sem, il reste 14 h avant le 31/10 »). | L'utilisateur doit pouvoir accepter ou refuser en connaissance de cause (RG-007). |
| P7 | **Alerter sans bloquer** | Les dépassements (capacité, délai, estimation) sont signalés dans le flux, jamais par une fenêtre bloquante. | RG-011 (« alerte sans blocage »), RG-024, RG-009. |
| P8 | **Synchronisation visible, jamais bruyante** | Un indicateur discret et permanent indique l'état (à jour, en cours, hors ligne, action requise). Seul l'état « action requise » interrompt l'utilisateur. | Données dans l'espace personnel et créneaux Google (RG-017, RG-020, RG-034) ; usage hors ligne (RG-021) ; aucune perte silencieuse (ENF-06). |
| P9 | **Le même modèle mental sur smartphone et sur PC** | Mêmes vues, mêmes noms, mêmes icônes. Le PC ajoute de la place (panneau de détail) et des raccourcis, pas de nouvelles notions. | Passage fréquent d'un appareil à l'autre (RG-017). |
| P10 | **Le calme par défaut** | Couleur réservée au sens : accent pour l'action, orange pour l'attention, rouge pour le retard ou l'erreur. Pas de décoration. | Outil quotidien : la couleur doit rester un signal. |
| P11 **(v0.2)** | **Aucune perte silencieuse** | Quand l'application écarte, annule ou ne peut pas enregistrer quelque chose, elle le dit : élément, information, valeur concernée. Elle dit aussi ce qui est préservé. Une action irréversible dit sa conséquence chiffrée avant le bouton. | ENF-06 (validée) ; RG-036, RG-047 à RG-049, RG-044, RG-055 ; la confiance dans un outil dont les données sont réparties sur deux appareils et un Drive. |

---

## 2. Architecture de l'information et navigation

### 2.1 Vues principales

| Vue | Question à laquelle elle répond | Action principale |
|---|---|---|
| **Aujourd'hui** (ECR-001) | « Qu'est-ce que je fais aujourd'hui ? » | Ajouter une tâche (saisie rapide) |
| **Semaine** (ECR-005) | « Qu'est-ce que je fais ces prochains jours, et est-ce que ça tient ? » | Valider le planning proposé |
| **Tâches** (ECR-002) | « Qu'est-ce qui est le plus important dans tout mon travail ? » | Ajouter une tâche |
| **Objectifs** (ECR-008, liste ; ECR-003, détail) | « Où en suis-je de mes objectifs ? » | Ajouter un objectif (liste) ; ajouter une tâche (détail) |

**Navigation par lot (v0.2, Q-ERG-12).** Les vues n'apparaissent que lorsqu'elles ont un contenu (P2 : pas d'onglet vide). Au **lot 1**, seules deux vues existent : **Tâches** (ECR-002, accueil, triée par délai) et **Objectifs** (ECR-008, ECR-003). Aujourd'hui (ECR-001) et Semaine (ECR-005) viennent avec les lots « Planification » et « Rappels » ; la barre passe alors à 4 entrées, dans l'ordre Aujourd'hui, Semaine, Tâches, Objectifs : Tâches et Objectifs ne changent pas de place relative. Les raccourcis `3` et `4` gardent leur sens d'un lot à l'autre.

Le **bilan du soir** (ECR-004) n'est pas une vue permanente : c'est un parcours ponctuel, ouvert depuis la carte « Bilan du soir » d'Aujourd'hui ou depuis le lien du rappel de 21 h.

Les **réglages** (capacité, plages, heures des rappels, thème) sont accessibles depuis l'avatar, en haut de l'écran. Ils sont peu fréquents et n'ont donc pas leur place dans la barre de navigation. **(v0.2)** Au lot 1, l'avatar et l'indicateur de synchronisation ouvrent la même **feuille « Compte et synchronisation »** (ECR-011) : état de la synchronisation, modifications non retenues, compte, « Se déconnecter », « Supprimer les données de cet appareil ». Les réglages (ECR-009) s'y ajouteront avec leurs lots.

Les **indicateurs** (évolution du backlog et de la vélocité, US-012, US-013) arriveront dans un lot ultérieur. Ils seront accessibles depuis le détail d'un objectif (vue par objectif) et depuis une entrée « Indicateurs » des réglages ou de la barre latérale sur PC. Leur emplacement définitif sera décidé à la conception du lot « Vélocité et pilotage » ; la barre de navigation mobile reste limitée à 4 entrées.

### 2.2 Navigation

| Contexte | Navigation |
|---|---|
| Smartphone (< 600 px) | **Barre d'onglets en bas**, 4 entrées : Aujourd'hui, Semaine, Tâches, Objectifs. Bouton flottant « + » (saisie rapide) au-dessus de la barre, à droite, sur les vues où l'action principale est l'ajout. Zone du pouce : les actions fréquentes sont en bas. |
| Tablette ou petite fenêtre (600 à 1023 px) | **Rail vertical** à gauche (icônes et libellés courts), contenu sur une colonne. |
| PC (≥ 1024 px) | **Barre latérale** à gauche (vues, liste courte des objectifs, état de synchronisation en pied). Contenu au centre. **Panneau de détail** à droite, qui s'ouvre sur sélection d'une tâche ou d'un objectif, sans quitter la liste. |

Pourquoi 4 onglets et pas 5 : chaque onglet supplémentaire réduit la cible tactile et dilue la hiérarchie. Le bilan du soir est quotidien, mais il est porté par une carte contextuelle au bon moment, ce qui évite un onglet vide 23 heures sur 24.

### 2.3 Badges de navigation
- Un **point** (sans nombre) sur l'onglet Aujourd'hui signale qu'au moins une carte « À traiter » est en attente (alerte de délai, proposition de replanification, créneau déplacé).
- Aucun badge numérique : il crée une pression inutile pour un outil personnel.
- **(v0.2)** Un **point accent** (sans nombre) sur l'indicateur de synchronisation signale que des « modifications non retenues » attendent d'être lues (ECR-011). Il ne s'allume jamais pour un état normal.

---

## 3. Charte graphique (tokens)

Les tokens sont nommés de façon sémantique (`color.text.secondary`, pas `gris-600`), pour que le mode sombre et d'éventuelles évolutions ne touchent que les valeurs. Le format d'export (CSS custom properties, JSON, thème de framework) dépend du DAT (§11).

### 3.1 Couleurs

Le **mode clair** et le **mode sombre** suivent par défaut le réglage du système ; l'utilisateur peut forcer l'un ou l'autre dans les réglages. Les ratios de contraste ont été calculés selon la formule WCAG 2.x.

| Token | Clair | Sombre | Usage | Contraste sur `bg` (clair / sombre) |
|---|---|---|---|---|
| `color.bg` | `#FFFFFF` | `#121215` | Fond de l'application | — |
| `color.surface` | `#F6F6F8` | `#1C1C21` | Cartes, barre latérale, champs | — |
| `color.surface.raised` | `#FFFFFF` | `#24242A` | Feuilles, menus, panneau de détail | — |
| `color.border` | `#DCDCE2` | `#33333B` | Séparateurs décoratifs | décoratif |
| `color.border.strong` | `#8A8A94` | `#6E6E78` | Contour des champs, cases à cocher | 3,42 / 3,71 (≥ 3:1) |
| `color.text.primary` | `#1C1C21` | `#F2F2F5` | Texte principal | 16,97 / 16,74 |
| `color.text.secondary` | `#55555E` | `#B5B5BE` | Métadonnées (délai, objectif, durée) | 7,38 / 9,19 |
| `color.text.tertiary` | `#6B6B74` | `#9A9AA4` | Indices, textes d'aide, placeholder | 5,28 / 6,71 |
| `color.accent` | `#2E5BDB` | `#8AA6FF` | Action principale, sélection, lien, focus | 5,78 / 8,00 |
| `color.on-accent` | `#FFFFFF` | `#121215` | Texte sur fond d'accent | 5,78 / 8,00 |
| `color.accent.subtle` | `#EEF2FD` | `#1B2240` | Fond de l'élément sélectionné, carte « Proposé » | accent dessus : 5,16 / 6,65 |
| `color.success` | `#1E7A4C` | `#4CC38A` | Terminé, « à jour » | 5,33 / 8,44 |
| `color.success.subtle` | `#E9F6EF` | `#14291F` | Fond de confirmation | success dessus : 4,79 / 6,94 |
| `color.warning` | `#9A5300` | `#F2A54A` | Attention : dépassement de capacité, délai non tenable, créneau déplacé | 5,82 / 9,13 |
| `color.warning.subtle` | `#FFF4E5` | `#2E2414` | Fond des cartes d'attention | warning dessus : 5,35 / 7,44 |
| `color.danger` | `#C42B2B` | `#FF7A7A` | Retard, erreur, suppression | 5,63 / 7,41 |
| `color.danger.subtle` | `#FDECEC` | `#2E1A1A` | Fond des cartes d'erreur | danger dessus : 4,93 / 6,50 |
| `color.focus` | `#2E5BDB` | `#8AA6FF` | Anneau de focus (2 px + 2 px d'écart) | ≥ 3:1 |
| `color.scrim` | `rgba(0,0,0,.40)` | `rgba(0,0,0,.60)` | Voile derrière une feuille ou une boîte de dialogue | — |

**Couleurs d'objectif.** Aucune couleur par objectif en v0.1 : une tâche peut appartenir à plusieurs objectifs (RG-001), ce qui rendrait le code couleur ambigu, et la couleur est réservée au sens (P10). Les objectifs sont identifiés par leur nom dans une puce neutre.

**La couleur n'est jamais le seul porteur d'information** : chaque état coloré est doublé d'une icône et d'un texte (WCAG 1.4.1).

### 3.2 Typographie

Police **système** (`system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) : aucun téléchargement, rendu natif sur chaque plateforme, compatible hors ligne. Chiffres **tabulaires** (`font-variant-numeric: tabular-nums`) pour toutes les durées et les dates, afin que les colonnes de temps s'alignent.

| Token | Taille / interligne | Graisse | Usage |
|---|---|---|---|
| `font.title.l` | 28 / 34 px | 700 | Titre de vue (« Aujourd'hui ») sur smartphone |
| `font.title.m` | 22 / 28 px | 600 | Titre de vue sur PC, titre d'un objectif |
| `font.title.s` | 17 / 24 px | 600 | Titre de section, titre de carte |
| `font.body` | 16 / 24 px | 400 | Intitulé de tâche, texte courant |
| `font.body.strong` | 16 / 24 px | 600 | Valeur mise en avant (durée saisie) |
| `font.meta` | 14 / 20 px | 400 | Métadonnées (délai, objectif, reste à faire) |
| `font.caption` | 12 / 16 px | 500 | Libellés de puces, onglets, légendes |

- Taille minimale : 12 px, réservée aux libellés courts ; jamais pour un texte à lire.
- Toutes les tailles sont exprimées en unités relatives (`rem`) et suivent le réglage de taille de texte du système, jusqu'à 200 % sans perte de contenu (WCAG 1.4.4).
- Longueur de ligne maximale : 72 caractères (panneaux de texte, bilan du soir).

### 3.3 Espacements

Grille de **4 px**.

| Token | Valeur | Usage type |
|---|---|---|
| `space.1` | 4 px | Écart icône / texte serré |
| `space.2` | 8 px | Écart entre métadonnées, entre puces |
| `space.3` | 12 px | Marge interne verticale d'une ligne de tâche |
| `space.4` | 16 px | Marge latérale de l'écran sur smartphone, marge interne des cartes |
| `space.5` | 24 px | Écart entre sections |
| `space.6` | 32 px | Marge latérale sur PC, écart entre blocs majeurs |
| `space.7` | 48 px | Respiration en haut d'une vue, état vide |

### 3.4 Rayons

| Token | Valeur | Usage |
|---|---|---|
| `radius.s` | 6 px | Puces, badges, champs compacts |
| `radius.m` | 10 px | Boutons, champs, cartes |
| `radius.l` | 16 px | Feuilles (bottom sheets), boîtes de dialogue, panneau |
| `radius.full` | 999 px | Bouton flottant, case à cocher ronde, avatar, jauge |

### 3.5 Ombres et élévation

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `shadow.0` | aucune | aucune | Lignes de liste, cartes posées sur `surface` |
| `shadow.1` | `0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)` | aucune ; fond `surface.raised` | Cartes « À traiter » |
| `shadow.2` | `0 4px 12px rgba(0,0,0,.10)` | `0 4px 12px rgba(0,0,0,.50)` + bordure `color.border` | Bouton flottant, menus |
| `shadow.3` | `0 12px 32px rgba(0,0,0,.18)` | `0 12px 32px rgba(0,0,0,.60)` + bordure `color.border` | Feuilles, boîtes de dialogue |

En mode sombre, l'élévation se lit d'abord par l'éclaircissement de la surface, car l'ombre est peu visible sur fond sombre.

### 3.6 Mouvement
| Token | Valeur | Usage |
|---|---|---|
| `motion.fast` | 120 ms, `ease-out` | Changement d'état (case cochée, survol) |
| `motion.base` | 200 ms, `ease-out` | Ouverture de feuille, de panneau |
| `motion.slow` | 300 ms, `ease-in-out` | Réorganisation d'une liste |

Si l'utilisateur a demandé la réduction des animations (`prefers-reduced-motion`), les transitions sont remplacées par un fondu de 0 à 80 ms, sans déplacement.

### 3.7 Iconographie

- **Style** : icônes au trait, épaisseur 1,5 px (2 px en 16 px), coins arrondis, grille de 24 px ; tailles 16, 20 (listes) et 24 px (navigation). Style de référence : jeu ouvert de type Lucide (licence ISC), à confirmer avec le DAT (§11).
- Une icône seule (sans texte) a toujours un nom accessible et, sur PC, une info-bulle.
- **Lexique** : une icône = un sens, partout.

| Sens | Icône | Remarque |
|---|---|---|
| Aujourd'hui | soleil | Onglet |
| Semaine | calendrier | Onglet ; aussi « planifier » |
| Tâches | liste à puces cochées | Onglet |
| Objectif | cible | Onglet, puce d'objectif |
| Terminer | cercle vide → cercle coché | Case ronde (Things, Rappels) |
| Abandonner | cercle barré | Jamais en action rapide : menu uniquement |
| Délai | drapeau | Métadonnée |
| Durée, estimation, temps passé | horloge | Métadonnée. **(v0.2)** Au lot 1, l'estimation d'une tâche s'affiche avec l'horloge ; le sablier est réservé au reste à faire (lot « Suivi du temps »). |
| Reste à faire | sablier | Métadonnée |
| Créneau Google | calendrier avec point | Indique que le créneau existe dans l'agenda |
| Proposé par l'application | étincelle | Marqueur des propositions (P5) |
| Reporté automatiquement | flèche circulaire vers la droite | RG-032 |
| Attention | triangle | Toujours avec texte |
| Retard, erreur | cercle avec point d'exclamation | Toujours avec texte |
| Synchronisation à jour | nuage coché | Indicateur |
| Synchronisation en cours | nuage avec flèches | Indicateur (animation lente, désactivable) |
| Hors ligne | nuage barré | Indicateur |
| Action requise | nuage avec point d'exclamation | Indicateur |
| Réordonner | poignée (6 points) | Visible au survol sur PC, en mode réorganisation sur smartphone |
| Sous-tâche, sous-objectif **(v0.2)** | flèche coudée vers le bas | Compteur « 1/3 » sur la ligne du parent |
| Information, modification non retenue **(v0.2)** | cercle avec « i » | Niveau « information » ; toujours avec texte |
| Verrou, valeur calculée ou héritée **(v0.2)** | cadenas | Estimation calculée, objectifs hérités ; jamais seul |
| Dossier Drive **(v0.2)** | dossier | Dossier « Done Juan » |
| Se déconnecter **(v0.2)** | flèche vers une porte | Action secondaire de ECR-011 |
| Supprimer | corbeille | Danger ; menu et feuille de compte |
| Heure de Paris **(v0.2)** | horloge | Dans la puce `ParisTimeNote` (§4.21) |

---

## 4. Bibliothèque de composants

Chaque composant liste ses **états**. États communs à tous les composants interactifs : *repos*, *survol* (PC), *pressé*, *focus clavier* (anneau `color.focus`), *désactivé* (opacité 40 %, non focalisable, avec explication à proximité si l'utilisateur peut y remédier).

### 4.1 Boutons
| Variante | Apparence | Usage |
|---|---|---|
| **Principal** | Fond `color.accent`, texte `color.on-accent`, hauteur 48 px (smartphone) / 40 px (PC) | **Un seul par écran** (P1) |
| Secondaire | Contour `color.border.strong`, texte `color.text.primary` | Alternative à l'action principale (« Modifier ») |
| Tertiaire | Texte `color.accent`, sans fond | Action de moindre importance (« Refuser », « Plus tard ») |
| Danger | Texte `color.danger` ; fond `color.danger` uniquement dans la boîte de confirmation | Supprimer |
| Bouton flottant (FAB) | Rond 56 px, fond accent, icône « + », `shadow.2` | Saisie rapide sur smartphone |
| Bouton icône | Zone tactile 44 × 44 px minimum | Actions de barre, menus |

États spécifiques : *en cours* (indicateur rotatif à la place de l'icône, libellé conservé, bouton non cliquable deux fois).

### 4.2 Ligne de tâche (`TaskRow`)
Composant central, utilisé dans Aujourd'hui, Tâches, Objectif, Semaine.

Structure (de gauche à droite) : case ronde « Terminer » · intitulé (2 lignes max, puis ellipse) · ligne de métadonnées · élément de droite contextuel.

Métadonnées, dans cet ordre, **3 au maximum** affichées selon la vue (au lot 1 : délai, estimation, objectif, sous-tâches) :
1. horaire suggéré (Aujourd'hui, Semaine) ou rang de priorité (Tâches) ;
2. délai (drapeau), en rouge avec texte « En retard » si dépassé ;
3. reste à faire (sablier) ;
4. objectif(s) : 1 puce, puis « +n » ;
5. sous-tâches : « 2/5 ».

| État | Rendu |
|---|---|
| À faire | Case vide `color.border.strong` |
| Terminée | Case pleine `color.success` avec coche, intitulé `color.text.tertiary` barré ; dans le filtre « À faire », la ligne reste 3 s avec le toast « Annuler » puis quitte la liste et se retrouve dans le filtre « Terminées » (§5.7 ; il n'y a pas de section « Terminées » repliée) |
| Abandonnée | Icône cercle barré, intitulé `color.text.tertiary` ; visible seulement dans le filtre « Abandonnées » |
| En retard | Délai en `color.danger` + icône + texte « En retard » |
| Alerte (délai non tenable, estimation dépassée) | Icône triangle `color.warning` à droite, avec nom accessible explicite |
| Proposée (planning non validé) | Bordure gauche pointillée `color.accent` et marqueur étincelle « Proposé » |
| Reportée automatiquement | Métadonnée « Reportée d'hier » avec icône flèche circulaire, pendant la journée du report |
| Modifiée hors ligne, non synchronisée | Petit point `color.text.tertiary` à droite (nom accessible : « Modification en attente d'envoi ») |
| Incohérence après fusion **(v0.2, RG-049)** | Étiquette d'attention « Incohérence » (icône triangle + mot) dans les métadonnées, jusqu'à résolution ; détail dans ECR-007 (§4.23) |
| Sous-tâche **(v0.2)** | En retrait de 28 px sous sa tâche parente dans l'objectif ; dans la liste « Tâches », **quel que soit le filtre** (« Sans objectif » compris), la tâche parente porte le compteur « 1/3 » et les sous-tâches ne sont jamais listées une à une (§5.7) |
| Délai postérieur à celui de l'objectif ou de la tâche parente **(v0.2, RG-024)** | Délai en `color.warning` + triangle + texte « après le délai de l'objectif » (ou « de la tâche ») ; jamais bloquant |
| Sélectionnée (PC) | Fond `color.accent.subtle` |
| Focus clavier | Anneau de focus sur toute la ligne |

### 4.3 Saisie rapide (`QuickAdd`)
- **Smartphone** : feuille basse ouverte par le FAB ; le clavier s'ouvre immédiatement sur le champ intitulé.
- **PC** : champ en haut de la liste ou fenêtre flottante centrée, ouverte par la touche `N` (voir §5.3).
- Contenu : champ intitulé, puis une rangée de **puces de choix rapide** :
  - Délai (**obligatoire**, RG-003) : « Aujourd'hui », « Demain », « Vendredi », « Dans 1 semaine », « Date… » ;
  - Estimation (**obligatoire**, RG-028, RG-029) : « 30 min », « 1 h », « 2 h », « Autre… » (pas de 30 min, minimum 30 min) ;
  - Objectif (facultatif, RG-001) : objectif de la vue courante pré-rempli si l'on est dans un objectif ;
  - Jour planifié (facultatif) : pré-rempli à « Aujourd'hui » si la saisie part de la vue Aujourd'hui.
- Action principale : « Ajouter » (Entrée). La feuille reste ouverte et vide après l'ajout, pour enchaîner plusieurs tâches ; un glissement vers le bas ou Échap la ferme.
- **(v0.2) Aucune valeur présélectionnée** ni pour le délai ni pour l'estimation (Q-ERG-03 « non », RG-003, RG-029, US-002 CA-2). Les libellés portent « (obligatoire) ». Seuls les rattachements issus du contexte sont pré-remplis.
- États : *initial* (rien de sélectionné, bouton « Ajouter » **actif**) ; *incomplet* (après « Ajouter » : message nommant l'information manquante sous les puces concernées, texte `color.danger` + icône, focus sur la première, saisie conservée, US-002 CA-3) ; *prêt* ; *ajouté* (confirmation brève dans la feuille : « Ajoutée à Tâches »). Le bouton n'est pas désactivé : un bouton grisé sans explication est inaccessible (WCAG 3.3.1), et le message d'erreur dit précisément quoi faire.
- **(v0.2) Variante sous-tâche** : même feuille, titre « Nouvelle sous-tâche » avec le nom de la tâche parente en sous-titre, objectifs hérités affichés en lecture seule (verrou). Pour la première sous-tâche d'une tâche, un message d'information précède l'enregistrement : « L'estimation de la tâche (3 h) sera remplacée par la somme de ses sous-tâches » (US-024 CA-5).
- **(v0.2) Variante objectif** : intitulé (obligatoire), description (facultative), délai (facultatif, « Sans délai » est un choix explicite), objectif parent (facultatif). L'importance n'est pas demandée au lot 1 (US-030).

### 4.4 Sélecteur de durée (`DurationStepper`)
Utilisé pour l'estimation, le temps passé, le reste à faire et la capacité. Pas fixe de **30 min** (RG-028 ; temps passé : sous réserve de Q-DEM001-31.3).
- Boutons « − » et « + » de 44 × 44 px, valeur centrale en `font.body.strong`, format « 1 h 30 ».
- Pression longue sur « + » : incrément accéléré (1 h).
- Puces de valeurs fréquentes sous le stepper quand la place le permet : « 0 », « 30 min », « 1 h », « 2 h ».
- Clavier : flèches haut / bas (± 30 min), Page haut / bas (± 2 h), saisie directe « 1h30 » ou « 1,5 » acceptée sur PC.
- Rôle accessible : `spinbutton`, valeur annoncée en toutes lettres (« 1 heure 30 minutes »).
- États : *non saisi* (tiret « — » ; distinct de « 0 ») ; *saisi* ; *modifié* (point accent jusqu'à validation) ; *hors bornes* (minimum 0, ou 30 min pour une estimation).

### 4.5 Jauge de capacité (`CapacityGauge`)
Montre la charge planifiée d'une journée face au temps disponible (RG-011, RG-033).
- Barre horizontale (hauteur 6 px, rayon plein) + texte « 3 h 30 / 4 h ».
- Sous le texte, si des événements réduisent le temps disponible : « 2 h d'agenda déduites » (US-019 ; mode de calcul **sous réserve de Q-DEM001-34**).
- États :
  - *sous la capacité* : barre `color.accent` ;
  - *pleine* (100 %) : barre `color.success`, texte « Journée pleine » ;
  - *dépassement* : la partie en excès est hachurée en `color.warning`, texte « +1 h au-delà de votre capacité » et icône triangle. Aucune action bloquée (RG-011) ;
  - *capacité nulle* (jour non travaillé) : texte « Jour sans capacité », barre absente ;
  - *exception* : libellé « Exception » à côté de la valeur (capacité datée, US-005).

### 4.6 Puce (`Chip`)
Puce d'objectif, puce de filtre, puce de choix rapide. Hauteur 32 px (zone tactile étendue à 44 px), rayon `radius.s`.
États : *neutre*, *sélectionnée* (fond `accent.subtle`, coche), *désactivée*.

### 4.7 Carte « À traiter » (`ActionCard`)
Conteneur des alertes et propositions (§7). Fond `surface.raised` + `shadow.1`, bordure gauche de 3 px colorée selon le niveau. Contient : icône + titre court · phrase d'explication (« pourquoi ») · éventuellement un comparatif avant/après · une rangée d'actions (1 principale, 1 ou 2 tertiaires).

### 4.8 Indicateur de synchronisation (`SyncStatus`)
- Smartphone : icône 20 px en haut à droite de l'en-tête, à côté de l'avatar. Libellé texte affiché seulement pour les états « Hors ligne » et « Action requise ».
- PC : pied de la barre latérale, icône + libellé toujours visible (« À jour · il y a 2 min »).
- Un appui ouvre la **feuille « Compte et synchronisation »** (ECR-011, §4.26) : dernier échange avec l'espace de stockage (et, plus tard, avec Google Calendar), modifications en attente (nombre et liste), modifications non retenues par la règle de conflit (RG-036, RG-047, RG-048), bouton « Synchroniser maintenant », compte et actions de compte.
- **(v0.2)** Huit états (§6.5). Le plus grave est seul affiché. **(v0.2.7, Q-US-017-6)** Le point accent « à lire » n'est **pas un état** mais un signal indépendant : il se superpose à l'icône dans **chacun** des huit états (RG-056 a : « discret et permanent » tant qu'une information n'est pas lue). Chaque état a un nom accessible, y compris sur smartphone où seules les icônes « Hors ligne », « Action requise » et « Session à renouveler » portent un libellé visible.

### 4.9 Bandeau (`Banner`)
Message persistant sous l'en-tête, pleine largeur, fermable sauf mention contraire. Réservé à **trois** cas : accès Google perdu (non fermable tant que non résolu, RG-035 ; une seule action « Se reconnecter ») et hors ligne prolongé avec modifications en attente depuis plus de 24 h (rappel non bloquant ; US-018 CA-6 ne fixe aucune durée maximale d'utilisation hors ligne, et le rappel n'empêche rien). **(E7)** Le troisième cas est la **consultation seule** (RG-058 : données écrites dans un format plus récent ; non fermable, action « Mettre à jour »). **Un seul bandeau à la fois** : si plusieurs cas se cumulent, le plus grave l'emporte (accès Google perdu, puis consultation seule, puis rappel de 24 h) et il reprend l'information des autres en une phrase (DEC-025, Q-ERG-17 a). En cas d'accès Google perdu et de modification en attente depuis plus de 24 h, le bandeau reste unique : « Se reconnecter », complété de la phrase « {n} modification(s) ne sont encore que sur ce {appareil} » (variante `24H`, §6.6.3). Le rappel de 24 h (RG-057, ECR-011 J) court depuis la plus ancienne modification en attente (DEC-025, Q-ERG-16 b) ; il est en ton « attention », sans action, fermable, absent sans modification en attente, et disparaît à l'enregistrement dans le Drive. Fermé par « Masquer le rappel », il réapparaît à la prochaine ouverture de l'application tant que des modifications sont en attente (DEC-025, Q-ERG-18 a). Tout le reste passe par l'indicateur ou une carte. **(v0.2)** Les données absentes du Drive (RG-044) utilisent l'état « Action requise » et la feuille de choix (§4.25), pas un troisième bandeau ; la **session Google expirée sur PC** n'est pas un bandeau non plus (état « Reprendre la synchronisation »).

### 4.10 Message éphémère (`Toast`)
Bas de l'écran, au-dessus de la barre d'onglets, 4 s (6 s s'il contient une action), une seule ligne + action facultative « Annuler ». Annoncé aux lecteurs d'écran (`role="status"`). Mis en pause au survol ou au focus. Exemple : « Tâche terminée · Annuler ».

### 4.11 Feuille (`BottomSheet`) et panneau de détail (`DetailPanel`)
- Smartphone : feuille basse à deux hauteurs (moitié, plein écran), poignée visible, fermeture par glissement, par le bouton « Fermer » ou par le geste retour.
- PC : le même contenu s'affiche dans le panneau de détail à droite (largeur 400 à 480 px) ou dans une boîte de dialogue centrée pour les actions courtes.
- Focus piégé dans la feuille modale ; retour du focus à l'élément d'origine à la fermeture.

### 4.12 Boîte de confirmation (`ConfirmDialog`)
Utilisée **uniquement** pour les actions destructrices ou irréversibles, ou dont la conséquence touche plusieurs éléments. Titre = conséquence (« Supprimer la tâche et ses 3 sous-tâches ? »), action libellée explicitement (« Supprimer »), « Annuler » focalisé par défaut, texte qui dit **ce qui est perdu et ce qui est préservé** (P11). Rôle `alertdialog`, focus piégé, Échap = Annuler.

**(v0.2) Cas du lot 1** :
| Action | Titre | Bouton d'action | Rouge ? |
|---|---|---|---|
| Supprimer une tâche (RG-046) | « Supprimer la tâche et ses 3 sous-tâches ? » | Supprimer | Oui (définitif, sans corbeille) |
| Supprimer un objectif (RG-046) | « Supprimer « X » ? » avec nombre de tâches détachées et de sous-objectifs promus | Supprimer | Oui |
| Abandonner une tâche (US-025 CA-1, CA-6) | « Abandonner « X » ? » avec nombre de sous-tâches abandonnées avec elle | Abandonner | Non (réversible) ; voir Q-ERG-13 |
| Rouvrir une sous-tâche d'une tâche terminée (US-003 CA-9) | « Rouvrir aussi « X » ? » | Rouvrir les deux | Non |
| Ajouter une sous-tâche à une tâche terminée (US-024) | « Rouvrir « X » pour y ajouter une sous-tâche ? » | Rouvrir et ajouter | Non |
| Se déconnecter avec modifications en attente (US-022 CA-6) | « Se déconnecter ? » avec le nombre de modifications et la promesse de leur enregistrement | Se déconnecter | Non ; **absente** s'il n'y a rien en attente |
| Supprimer les données de cet appareil (RG-055) | « Supprimer les données de cet appareil ? » : données du Drive préservées | Supprimer les données | Oui |
| Idem, dépôt impossible (RG-055) | « 3 modifications seraient perdues » | Supprimer quand même | Oui |
| Repartir de zéro (RG-044 b) | « Effacer toutes vos données sur vos deux appareils ? » avec le nombre de modifications non enregistrées perdues | Tout effacer | Oui |

### 4.13 En-tête de vue (`ViewHeader`)
Titre de vue (`font.title.l`), sous-titre facultatif (date, progression), à droite : indicateur de synchronisation et avatar (réglages). Sur smartphone, le titre se réduit dans la barre au défilement.

### 4.14 Barre d'onglets (`TabBar`), rail (`NavRail`), barre latérale (`Sidebar`)
- Barre d'onglets : 4 entrées (2 au lot 1, §2.1), icône 24 px + libellé 12 px toujours visible ; onglet actif en `color.accent` et indiqué aussi par la graisse et `aria-current="page"`.
- Barre latérale PC : mêmes entrées que la barre d'onglets (2 au lot 1), puis section « Objectifs » (5 premiers, « Tous les objectifs »), puis pied (synchronisation, réglages).

### 4.15 Progression d'objectif (`GoalProgress`)
Anneau 32 px (liste) ou barre (détail) + texte « 7 / 12 tâches · 18 h restantes ». État « Atteint » : coche `color.success` + texte « Atteint ». État « À décliner en tâches » (objectif vide, **sous réserve de Q-DEM001-26.3**) : texte `color.text.tertiary` et lien « Ajouter une tâche ».

### 4.16 Comparatif avant / après (`ChangePreview`)
Dans une proposition : valeur actuelle barrée en `color.text.tertiary` → valeur proposée en `font.body.strong`, avec l'icône étincelle. Exemple : « Délai : ~~31 oct.~~ → **7 nov.** ». Lecteur d'écran : « Délai actuel 31 octobre, délai proposé 7 novembre ».

### 4.17 Champ texte libre (`TextArea`)
Utilisé pour les deux questions du bilan du soir (US-033, DEM-002). Libellé toujours visible au-dessus (pas de placeholder tenant lieu de libellé), hauteur auto (3 lignes, extensible), compteur de caractères seulement si une limite est fixée.

### 4.18 Section repliable (`Disclosure`)
« Terminées (3) », « Sous-tâches (2/5) ». Chevron + libellé + nombre ; `aria-expanded`.

### 4.19 État vide (`EmptyState`)
Illustration absente (sobriété) ; une phrase qui dit pourquoi c'est vide, une phrase qui dit quoi faire, un bouton vers l'action. Voir §6.1.

### 4.20 Squelette de chargement (`Skeleton`)
Blocs gris `color.surface` à la forme des lignes attendues, sans animation de balayage si la réduction des animations est demandée.

### 4.21 Mention « Heure de Paris » (`ParisTimeNote`) — nouveau (v0.2, RG-054, A-F6)
Réponse à A-F6 : **forme de la mention « heure de Paris »**.
- **Quand** : seulement si le fuseau de l'appareil diffère de celui de Paris. Absente sinon (aucun bruit pour l'utilisateur à Paris).
- **Écrans du lot 1 qui la portent (BEN-8)** :

| Écran | Emplacement | Maquette |
|---|---|---|
| Tâches (liste) | Sous-titre de la vue, à côté de « Triées par délai » | ECR-002 L3 (appareil à New York) |
| Objectifs (liste) | Sous-titre de la vue, à côté de « n objectifs en cours » | ECR-008 A |
| Détail d'un objectif | Ligne de progression (retard, atteinte) | ECR-003 D |
| Détail d'une tâche | À côté de « Terminée le … » et « Abandonnée le … » | ECR-007 G (appareil à New York) |
| Feuille « Compte et synchronisation » | Ligne « Fuseau » | ECR-011 B, I |

  Aucun autre écran du lot 1 ne la porte (connexion, saisie rapide, bandeaux, confirmations). Texte et nom accessible : `MEN-HEURE-PARIS` (§6.6.4).
- **Où** : (1) puce sous le titre des vues qui affichent une journée ou un retard (Tâches, Objectifs ; Aujourd'hui et Semaine plus tard) ; (2) à côté des dates déterminées par la journée de Paris : date de fin, date d'abandon (ECR-007) ; (3) ligne « Fuseau » de la feuille de compte (ECR-011). **Jamais** sur un délai, qui est une date sans heure (RG-053).
- **Forme** : puce `font.caption`, fond `color.surface`, bordure `color.border`, `radius.s`, icône horloge 14 px + texte « Heure de Paris ». Hauteur 22 px, zone tactile étendue à 44 px.
- **Interaction** : un appui (ou le survol / focus sur PC) ouvre une info-bulle fermable : « Les jours, les retards et les horaires suivent l'heure de Paris, où que vous soyez. » Avec l'exemple utile quand il existe : « Il est 4 h à Paris, alors que votre appareil indique 22 h la veille. »
- **Accessibilité** : bouton avec nom accessible « Heure de Paris : afficher l'explication » ; texte jamais seul porteur d'information.
- **Justification** : DEC-012 fixe l'heure de Paris pour tous les appareils ; en voyage, « en retard » ou « terminée le 11 novembre » (alors qu'il était encore le 10 au soir sur l'appareil) peut surprendre. La mention le dit au moment où l'écart peut exister, sans l'imposer à l'utilisateur sédentaire.

### 4.22 Champ de détail (`FieldRow`) et champ verrouillé (`LockedField`) — nouveau (v0.2)
- `FieldRow` : libellé gris (92 px) · valeur · chevron ; hauteur minimale 48 px ; un appui ouvre le sélecteur. Utilisé dans ECR-007 (délai, estimation, objectifs). Pas de bouton « Enregistrer » (§5.6).
- `LockedField` : même structure, **cadenas** + origine en texte (« Somme des sous-tâches », « Hérités de la tâche »). Non modifiable, non focalisable en saisie, mais lisible par les lecteurs d'écran avec l'explication. Utilisé pour l'estimation calculée d'une tâche parente (RG-023) et les objectifs d'une sous-tâche (US-024 CA-7).

### 4.23 Carte d'incohérence (`InconsistencyCard`) — nouveau (v0.2, RG-049)
Variante de `ActionCard` de niveau **attention**, placée en tête du détail de la tâche concernée. Titre court (« Incohérence avec une sous-tâche »), une phrase qui dit ce qui s'est passé, **ce qui n'a pas été modifié** (« Rien n'a été modifié ») et la conséquence (« l'objectif n'est pas atteint »), puis les issues possibles : une action principale (« Rouvrir la tâche ») et deux tertiaires (« Terminer la sous-tâche », « Abandonner la sous-tâche »). Marqueur « Incohérence » dans les listes tant qu'elle persiste. Disparaît seule dès que la cause disparaît.

### 4.24 Élément « non retenu » (`DiscardedItem`) — nouveau (v0.2, RG-036, RG-047, RG-048, Q-DEM001-23.2)
Ligne de la section « Modifications non retenues » de ECR-011 : icône information · titre (élément et information concernés) · phrase (**valeur non retenue**, **valeur conservée** ; v0.2.20 : ni appareil ni heure, les données ne nomment pas l'appareil d'une écriture) · actions « Voir la tâche » ou « Voir l'objectif » (`TXT-VOIR-TACHE`, `TXT-VOIR-OBJECTIF`, si l'élément existe) puis « Compris ». Noms accessibles : « Compris : » ou « Voir la tâche : » suivi du titre, première lettre en minuscule (« Voir la tâche : intitulé de « Rédiger le plan » »), pour distinguer les boutons d'une liste (2.4.6, 2.5.3). Trois formes : valeur écartée, suppression qui l'emporte, déplacement annulé. Signalements : point accent sur l'indicateur, toast à l'ouverture (« 3 modifications n'ont pas été retenues · Voir »), ligne discrète sur l'élément concerné (« 1 modification non retenue · Voir »). Une valeur remplacée en connaissance de cause n'est jamais signalée.

### 4.25 Choix d'options (`OptionCard`) et étapes de préparation (`StepProgress`) — nouveaux (v0.2)
- `OptionCard` : carte à titre, phrase de conséquence et bouton pleine largeur ; une seule porte le bouton principal. Utilisée pour « Restaurer mes données » (principal) et « Repartir de zéro » (secondaire, texte rouge, mène à une confirmation) (RG-044).
- `StepProgress` : liste verticale d'étapes (terminée / en cours / à venir) avec icône, et barre de progression si elle est mesurable ; annoncée `role="status"`. Utilisée au premier chargement (ECR-010) : « Compte identifié », « Dossier trouvé / créé », « Récupération de vos données… ».

### 4.26 Feuille « Compte et synchronisation » (`SyncSheet`) — nouveau (v0.2, ECR-011)
Feuille (smartphone), boîte de dialogue ou panneau (PC). Sections, dans l'ordre : **Synchronisation** (état en une phrase, dernier échange, modifications en attente, « Synchroniser maintenant ») · **Modifications non retenues** (si présentes) · **Erreurs qui demandent une action** (si présentes) · **Compte** (adresse, dossier du Drive, fuseau si différent) · **Se déconnecter** (secondaire) · séparateur · **Supprimer les données de cet appareil** (`DangerLink`, texte rouge, avec sa phrase d'explication). Pas d'action principale dans l'état normal (feuille d'information) ; une action principale apparaît quand une décision est attendue.

### 4.27 Action destructrice isolée (`DangerLink`) — nouveau (v0.2)
Action de texte rouge, sans fond, avec icône corbeille, séparée des autres par un trait et suivie d'une phrase qui dit ce qui est retiré et ce qui reste. Jamais un bouton plein en dehors d'une `ConfirmDialog`. Utilisée pour « Supprimer les données de cet appareil » et « Supprimer la tâche / l'objectif » dans les menus.

### 4.28 Ligne d'objectif (`ObjectiveRow`) et sélecteur de parent (`ParentPicker`) — nouveaux (v0.2)
- `ObjectiveRow` : `GoalProgress` (anneau) · intitulé · métadonnées (état en toutes lettres, tâches terminées sur tâches non abandonnées, délai ou « Sans délai », « En retard ») · chevron. Un sous-objectif est en retrait de 28 px avec un anneau de 24 px. Nom accessible : « Publier le guide pratique, en cours, 7 tâches sur 12 terminées, délai 15 décembre ».
- `ParentPicker` : liste à choix unique (boutons radio) des objectifs principaux possibles, plus « Aucun, objectif principal » ; textes et indications des candidats codés `SEL-PARENT-*` (§6.6.4, v0.2.18), ouvert par l'entrée « Placer sous un autre objectif » du menu « … » ; l'objectif déplacé lui-même est présent mais indisponible, avec la raison. Un objectif qui a des sous-objectifs ne peut pas être déplacé : un message l'explique avant tout choix. **(v0.2.7, Q-US-023-1)** Si plusieurs refus se cumulent pour une même cible, **une seule raison est écrite**, la première de cet ordre : `ERR-031` (sous lui-même), puis `ERR-030` variante `objectif-a-des-sous-objectifs`, puis `ERR-030` variante `cible-est-sous-objectif`. Cas « Publier le guide » (qui a des sous-objectifs) placé sous « Version imprimable » (son propre sous-objectif) : `ERR-030` `objectif-a-des-sous-objectifs`. Le placement d'un objectif sous son propre sous-objectif donne `ERR-030` `objectif-a-des-sous-objectifs`, pas `ERR-031`. Justification : la première raison est celle que l'utilisateur peut corriger.

---

## 5. Règles d'interaction

### 5.1 Saisie rapide d'une tâche
| Appareil | Déclencheur | Nombre de gestes jusqu'à l'enregistrement |
|---|---|---|
| Smartphone | FAB « + » | 1 (ouvrir) + frappe + 2 puces (délai, estimation) + Entrée |
| PC | Touche `N` depuis n'importe quelle vue | 1 + frappe + `Tab` vers les puces + Entrée |

- Le contexte pré-remplit ce qu'il peut : vue Aujourd'hui → planifiée aujourd'hui ; détail d'un objectif → rattachée à cet objectif ; jour de la vue Semaine → planifiée ce jour-là.
- Le texte saisi n'est jamais perdu : si la feuille est fermée avec un intitulé non vide, il est conservé comme brouillon et réaffiché à la réouverture.
- **(v0.2)** Le délai et l'estimation sont toujours choisis explicitement (Q-ERG-03). Le geste reste court : 2 appuis de puces (§4.3).
- **Analyse du texte (« demain », « 2h »)** : non retenue en v0.1. Elle accélère la saisie sur PC, mais elle est source d'erreurs sur smartphone (dictée, correcteur). À réévaluer après les premiers retours d'usage.

### 5.2 Gestes mobiles
Chaque geste a **toujours une alternative** par simple appui (menu « … » de la ligne ou détail), conformément à WCAG 2.5.1 et 2.5.7.

| Geste | Sur | Effet | Alternative |
|---|---|---|---|
| Appui sur la case ronde | Ligne de tâche | Terminer / rouvrir (RG-026), avec toast « Annuler » | — (c'est déjà un appui) |
| Appui sur la ligne | Ligne de tâche | Ouvrir le détail (feuille) | — |
| Balayage vers la droite | Ligne de tâche | Terminer | Case ronde |
| Balayage vers la gauche | Ligne de tâche | Ouvrir « Planifier le… » (choix du jour) | Menu « … » → Planifier |
| Appui long | Ligne de tâche (Tâches, Semaine) | Passer en mode réorganisation (poignées visibles) | Menu « … » → Monter / Descendre / Déplacer vers… |
| Glisser-déposer | En mode réorganisation | Changer le rang ou le jour | Idem |
| Tirer vers le bas | Haut d'une liste | Synchroniser maintenant | Feuille de synchronisation → « Synchroniser maintenant » |
| Glissement vers le bas | Feuille | Fermer | Bouton « Fermer » |

- Les balayages ne déclenchent jamais d'action **destructrice** (supprimer, abandonner) : celles-ci passent par le menu et, pour la suppression, par une confirmation.
- Seuil de déclenchement d'un balayage : 40 % de la largeur de la ligne, avec un retour visuel progressif (icône et couleur révélées) et une vibration légère au seuil si la plateforme le permet (§11).

### 5.3 Raccourcis clavier (PC)
Principes : les raccourcis à **une seule touche** ne sont actifs que lorsque le focus n'est pas dans un champ de saisie ; ils peuvent être désactivés dans les réglages (WCAG 2.1.4). La touche `?` affiche l'aide des raccourcis.

| Raccourci | Action |
|---|---|
| `N` | Nouvelle tâche (saisie rapide) |
| `Maj` + `N` | Nouvel objectif |
| `/` | Rechercher |
| `1` `2` `3` `4` | Aller à Aujourd'hui, Semaine, Tâches, Objectifs |
| `J` / `K` ou `↓` / `↑` | Tâche suivante / précédente |
| `Entrée` | Ouvrir le détail de la tâche sélectionnée |
| `Échap` | Fermer le détail, la feuille ou la saisie |
| `X` ou `Espace` | Terminer / rouvrir la tâche sélectionnée |
| `P` | Planifier la tâche sélectionnée (choix du jour) |
| `T` | Planifier aujourd'hui |
| `Alt` + `↑` / `↓` | Monter / descendre la tâche dans la priorité |
| `Alt` + `←` / `→` | Déplacer la tâche au jour précédent / suivant (vue Semaine) |
| `E` | Saisir le temps passé sur la tâche sélectionnée |
| `B` | Ouvrir le bilan du soir |
| `?` | Aide des raccourcis |

**(v0.2)** Au lot 1, seuls `N`, `Maj`+`N`, `/`, `3`, `4`, `J`/`K`, `Entrée`, `Échap`, `X`/`Espace` et `?` sont actifs ; `P`, `T`, `E`, `B` et `Alt` + `←`/`→` arrivent avec la planification, le suivi du temps et le bilan.

Les combinaisons avec `Ctrl`/`Cmd` ne sont pas utilisées en v0.1 : elles entrent en conflit avec le navigateur si l'application est une PWA (§11).

### 5.4 Planification
- **Planifier une tâche** : balayage gauche (smartphone) ou `P` (PC) → feuille « Planifier le… » avec des puces : « Aujourd'hui », « Demain », les 5 jours suivants (avec leur charge, ex. « Jeu. 3 h / 4 h »), « Autre date… », « Retirer du planning ». 2 gestes au total.
- Sur la vue Semaine (PC), glisser-déposer d'une colonne de jour à l'autre, avec l'alternative clavier `Alt` + `←` / `→`.
- Après chaque planification, la jauge du jour se met à jour immédiatement ; en cas de dépassement, la jauge passe en état « dépassement » sans fenêtre (RG-011).
- L'horaire suggéré (RG-034) s'affiche dès que l'application l'a calculé ; avant cela, la ligne indique « Horaire à venir ». La modification de l'horaire dans l'application est **sous réserve de Q-DEM001-32.3**.

### 5.5 Annulation plutôt que confirmation
Les actions réversibles (terminer, rouvrir, planifier, réordonner, accepter une proposition) s'exécutent immédiatement, avec un toast « Annuler ». La confirmation est réservée aux suppressions, aux actions qui touchent plusieurs éléments et aux actions de données (§4.12). Justification : moins de gestes pour 99 % des cas, et le filet de sécurité reste disponible.

**(v0.2)** *Abandonner* : US-025 CA-1 prévoit une confirmation (validée), parce que l'abandon d'une tâche parente abandonne ses sous-tâches. Le guide v0.1 le classait en action immédiate. Steeve applique l'US ; le commanditaire a tranché « confirmation toujours » (Q-ERG-13).

### 5.6 Enregistrement
Pas de bouton « Enregistrer » dans les détails : chaque modification est enregistrée dès qu'elle est faite (localement d'abord, puis synchronisée). Exception : le **bilan du soir**, qui se termine par une validation explicite, parce qu'il regroupe plusieurs saisies et des propositions à accepter.

### 5.7 Liste « Tâches » : filtres, tri, sous-tâches (v0.2.7, Q-US-002-1, US-002 CA-11)
Besoin : à l'ouverture, voir ce qu'il reste à faire, sans bruit ; retrouver une tâche finie ou abandonnée en un geste. Un état = une vue (P1, P2) : pas de vue mélangée.

| Sujet | Règle |
|---|---|
| **Filtre d'état** (contrôle segmenté, une valeur à la fois) | Trois valeurs : « À faire » · « Terminées » · « Abandonnées ». **Il n'existe pas de valeur « Tous »** : mélanger des tâches faites et à faire dans un tri par délai n'aide aucune décision. Les valeurs fermées pour les scénarios sont les états (`à faire`, `terminée`, `abandonnée`) ; le libellé à l'écran est le pluriel. |
| **Filtre par défaut** | « À faire », **à chaque ouverture** de l'application ou de la vue (non mémorisé : l'écran d'accueil est prévisible). |
| **Filtre d'objectif** | Puces sous le contrôle segmenté : « Tous » (= tous les objectifs, **sans rapport avec l'état**) · un objectif · « Sans objectif ». Se combine (ET) avec le filtre d'état. Pour éviter la confusion, le scénario ne parle jamais de « tous » pour l'état. |
| **Tri « À faire »** | 1. délai croissant (les « En retard » remontent d'elles-mêmes) ; 2. à délai égal, **date de création croissante** (la plus ancienne d'abord, l'ordre de saisie est conservé) ; 3. à création égale, intitulé en ordre alphabétique français (sans tenir compte de la casse ni des accents), pour un ordre toujours reproductible. |
| **Tri « Terminées »** | Date de fin décroissante (la plus récente d'abord, jour de Paris, RG-053). À date de fin égale : la plus récente d'abord à l'instant de fin, puis les règles 2 et 3 ci-dessus. Le délai n'intervient pas. |
| **Tri « Abandonnées »** | Date d'abandon décroissante, mêmes départages. |
| **Sous-tâches** | Jamais listées comme lignes, dans aucun filtre, « Sans objectif » compris. La tâche parente porte le compteur « 1/3 » (sous-tâches terminées sur sous-tâches non abandonnées). Une sous-tâche se trouve dans le détail de sa tâche parente. |
| **Contenu d'une ligne** | Celui du §4.2, sans « Terminée le » dans la liste (la date figure au détail et sert de tri). |
| **En-tête** | Sous-titre `MEN-TRI-DELAI` « Triées par délai » (À faire), « Plus récentes d'abord » (Terminées, Abandonnées). |
| **Vide** | Un filtre sans tâche affiche son état vide (`EVD-FILTRE-A-FAIRE`, `EVD-FILTRE-TERMINEES`, `EVD-FILTRE-ABANDONNEES`, §6.6.5), pas la liste d'un autre filtre. |

Conséquence pour US-002 S20 (à aligner par Pepper) : avec le filtre par défaut, la liste ne contient que les tâches à faire, triées par délai (« Payer la facture » puis « Chapitre 2 ») ; « Chapitre 1 », terminée, n'y est pas. Pour la voir, l'utilisateur choisit « Terminées ». Si le scénario doit montrer la terminée, l'étape de filtre « terminée » est ajoutée. US-003 S16 et US-025 S04 suivent la même règle.

### 5.8 Ordre des listes d'objectifs, de sous-objectifs, de tâches du détail et de sous-tâches (v0.2.9, Q-US-001-6)
Besoin : ce qui presse est en haut, sans que l'utilisateur ait à trier ; un ordre toujours identique d'une ouverture à l'autre, d'un appareil à l'autre. Aucune règle de gestion touchée (affichage seulement).

**Ordre de référence « par délai »** (utilisé par (a), (c) et (e)) : 1. délai croissant, les « En retard » remontent d'elles-mêmes, **sans délai à la fin** ; 2. à délai égal, date de création croissante ; 3. à création égale, intitulé en ordre alphabétique français, sans tenir compte de la casse ni des accents.

| Réf. | Liste | Réponse |
|---|---|---|
| (a) | Liste des objectifs (ECR-008) | Objectifs principaux actifs selon l'ordre de référence. Les objectifs non atteints seuls : un objectif atteint n'est pas dans cette liste (voir (b)). |
| (b) | Objectifs atteints | **Section repliée « Atteints ({n}) » à la fin de la liste** (`SEC-OBJ-ATTEINTS`), `n` = objectifs principaux atteints, même ordre de référence à l'intérieur. Choix différent de la proposition d'Anthony : le regroupement existe déjà dans ECR-008 et a été validé avec US-001 en E6 ; sans lui, un objectif atteint à délai proche resterait en tête et masquerait ce qui reste à faire (P2). Un sous-objectif atteint dont le parent est en cours reste sous son parent ; un principal atteint emmène ses sous-objectifs dans la section. |
| (c) | Sous-objectifs | Sous leur parent, en retrait, dans la liste et dans le détail de l'objectif (ECR-003) : ordre de référence, atteints compris (pas de déplacement quand l'état change : une ligne qui bouge est déroutante). |
| (d) | Tâches du détail d'un objectif (ECR-003) | Trois sections : « Tâches à faire · {n} », « Terminées ({n}) », « Abandonnées ({n}) » (`SEC-TACHES-*`), les deux dernières repliées. Tris du §5.7 : à faire par ordre de référence ; terminées par date de fin décroissante ; abandonnées par date d'abandon décroissante. Une sous-tâche affichée suit immédiatement sa tâche parente, ordre (e). **Sous-tâches (Q-US-002-4, v0.2.10)** : elles ne sont listées que sous une tâche « à faire ». Dans « Terminées » et « Abandonnées », aucune ligne de sous-tâche : seul le compteur « {t} / {n} » figure sur la ligne de la tâche parente, et ses sous-tâches se lisent dans son détail (ECR-007). Besoin : ces sections sont des archives consultées pour retrouver une tâche, pas pour agir sur ses sous-tâches ; les développer multiplierait les lignes sans aider une décision (P1, P2), et reste cohérent avec le §5.7 (sous-tâches jamais listées comme lignes dans « Tâches »). |
| (f) | Feuille « Compte et synchronisation » (v0.2.14) | **« {n} modification(s) en attente »** : la plus récente d'abord (l'utilisateur vérifie ce qu'il vient de faire), à égalité par intitulé. **« {n} information(s) à lire »** : la plus récente d'abord ; les `DiscardedItem` de `ALR-014` restent groupés sous la carte `ALR-008`, dans le même ordre. |
| (g) | Rendu des sections du détail d'un objectif (v0.2.14) | Le modèle de vue garde les trois sections même à n = 0, mais l'écran **n'affiche pas** « Terminées (0) » ni « Abandonnées (0) » ; « Tâches à faire · 0 » n'est affiché que si l'objectif a au moins une tâche (toutes terminées ou abandonnées) ; sans aucune tâche, seul `EVD-OBJECTIF-SANS-TACHE` s'affiche (ECR-003 B). Besoin : ne montrer que ce qui contient quelque chose (P2). |
| (e) | Sous-tâches du détail d'une tâche (ECR-007) | Une seule liste, tous états confondus (`SEC-SOUS-TACHES`), ordre de référence. Une sous-tâche terminée reste à sa place : la progression « 1 / 3 » se lit sur la liste entière. |

---

## 6. États : vide, chargement, erreur, hors ligne, synchronisation

### 6.1 États vides
| Écran | Message | Action |
|---|---|---|
| Aujourd'hui, rien de planifié | « Rien de prévu aujourd'hui. » / « Planifiez une tâche ou ajoutez-en une nouvelle. » | « Planifier depuis mes tâches » (secondaire) ; FAB conservé |
| Aujourd'hui, tout est terminé | « Tout est fait pour aujourd'hui. » + temps passé du jour | Lien « Faire mon bilan » |
| Tâches, aucune tâche | « Aucune tâche pour l'instant. » / « Commencez par ce qui vous vient à l'esprit, vous trierez ensuite. » | « Ajouter une tâche » |
| Objectifs, aucun objectif | « Un objectif donne une direction à vos tâches. » | « Créer un objectif » |
| Objectif sans tâche | « À décliner en tâches. » (US-001 CA-8, RG-025) | « Ajouter une tâche » |
| **(v0.2, E7)** Premier lancement, compte neuf (US-022 CA-2) : affiché tant qu'il n'existe ni objectif ni tâche (`EVD-BIENVENUE`, §6.6.5, avec l'écran d'atterrissage après chaque choix) | « Bienvenue. Un objectif donne une direction à vos tâches. Commencez par le vôtre, ou ajoutez directement une tâche. » | « Créer mon premier objectif » (principal) ; « Ajouter une tâche sans objectif » (tertiaire) |
| **(v0.2)** Tâches, filtre « Sans objectif » vide | « Toutes vos tâches ont un objectif. » | — |
| **(v0.2)** Tâches, filtre « Abandonnées » ou « Terminées » vide | « Aucune tâche abandonnée. » / « Aucune tâche terminée. » | — |
| **(v0.2)** Modifications non retenues, rien à lire | Section absente | — |
| Semaine, aucune capacité définie | « Indiquez combien de temps vous consacrez à vos tâches chaque jour, pour que l'application puisse vous proposer un planning. » | « Définir ma capacité » |
| Semaine, rien à planifier | « Toutes vos tâches sont planifiées. » | — |
| Bilan du soir, aucune tâche du jour | « Aucune tâche prévue ni travaillée aujourd'hui. » | Questions de bilan toujours proposées (US-033) |

### 6.2 Chargement
- **Premier lancement** sur un appareil : écran de chargement avec message (« Récupération de vos données depuis votre espace… ») et progression si elle est mesurable.
- **Lancements suivants** : l'application affiche **immédiatement** les données présentes sur l'appareil (pas de squelette), puis l'indicateur passe en « Synchronisation… ». Justification : usage smartphone en mobilité ; attendre le réseau pour voir sa journée serait inacceptable (RG-021).
- Squelettes (`Skeleton`) seulement pour les contenus jamais chargés sur l'appareil (ex. indicateurs, plus tard).
- Au-delà de 10 s sans réponse, un texte apparaît : « C'est plus long que d'habitude. Vos données locales restent utilisables. »
- **(v0.2)** Premier chargement après connexion (ECR-010) : `StepProgress` à trois étapes, annulation possible. Sur un compte neuf : « Création de votre dossier dans Google Drive ». Exigence de l'architecte : moins de 10 s sur 4G jusqu'à l'état vide.
- **(v0.2)** Réouverture d'une session existante : aucun écran d'attente, même sans réseau (CA-5 de US-022, ENF-T-01 : ouverture en moins de 2 s).

### 6.3 Erreurs
| Type | Présentation | Exemple de message |
|---|---|---|
| Champ invalide | Sous le champ, texte `color.danger` + icône, focus déplacé sur le premier champ en erreur | « Indiquez un délai. » |
| Action impossible localement | Toast avec action | « Impossible d'enregistrer. Réessayer » |
| Échec de synchronisation temporaire | Indicateur en état « Nouvelle tentative… », aucune interruption | — |
| Échec persistant (> 3 tentatives) | Indicateur en état « Action requise » + détail dans la feuille de synchronisation | « Votre espace de stockage est plein. Libérez de la place pour reprendre l'enregistrement. » |
| Accès Google perdu ou expiré (RG-035) | Bandeau non fermable | « Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées et vous pouvez continuer à travailler. » + bouton « Se reconnecter » (`ERR-010`) |
| Créneau Google non créé | Sur la ligne de tâche, icône créneau en état barré ; détail dans la feuille de synchronisation | « Le créneau n'a pas pu être créé dans votre agenda. Nouvelle tentative automatique. » |

| Session Google expirée sur PC (renouvellement du jeton nécessitant un geste, DAT R3 / F14) | Indicateur « Reprendre la synchronisation » (un clic), **pas** de bandeau : ce n'est pas une perte d'accès | « Cliquez pour reprendre la synchronisation avec Google. » |
| Rappels modifiés ou supprimés directement dans Google Agenda (DAT R7) | Carte « À traiter » de niveau attention, avec proposition de recréer les rappels | « Vos rappels de 8 h et 21 h ont été modifiés dans votre agenda. Les rétablir ? » |
| Horloge de l'appareil déréglée (DAT R4) | Carte d'information | « L'heure de cet appareil semble incorrecte. Corrigez-la pour éviter des conflits entre vos appareils. » |
| Version de l'application trop ancienne pour lire les données (DAT R5, RG-058) | Bandeau non fermable « Consultation seule », données en lecture seule, bouton « + » masqué, cases inertes (toast au toucher), ECR-011 K | « Une version plus récente de l'application a enregistré vos données. Mettez à jour l'application pour continuer à les modifier. » |

Règle : un message d'erreur dit **ce qui s'est passé**, **ce qui est préservé** (« vos données sont conservées ») et **quoi faire**. Jamais de code technique à l'écran.

**(E7) Textes exacts et codes** : les tableaux ci-dessous donnent le type, la présentation et un exemple ; les **libellés exacts et les codes `ERR-xxx` / `ALR-xxx` figurent au catalogue du §6.6, qui fait foi**. Le texte du bandeau « Accès Google perdu » est celui du §6.6.3 (le lot 1 n'ayant pas de rappels, la mention « et les rappels » est retirée).

**(v0.2)** Messages ajoutés par LOT-001 (ECR-010, ECR-011) :
| Type | Présentation | Message |
|---|---|---|
| Connexion annulée ou autorisation refusée (US-022 CA-4) | Message d'information sur l'écran de connexion (`role="alert"`) | « Connexion annulée. Une connexion à un compte Google est nécessaire pour utiliser l'application. Rien n'a été créé. » |
| Première connexion sans réseau (`ERR-003`) ou reconnexion sans réseau après une déconnexion (`ERR-004`, texte distinct : les données de l'appareil sont conservées) | Message d'attention, bouton « Réessayer » | « Pas de connexion à Internet. Une connexion est nécessaire pour vous connecter la première fois. Rien n'a été créé. » (`ERR-003`) |
| Connexion interrompue | Même mise en page | « La connexion a été interrompue. Aucune donnée n'a été créée à moitié. Réessayez. » |
| Drive indisponible ou désactivé (RG-019, RG-020) | Message d'erreur, une seule action | « Google Drive n'est pas disponible pour ce compte (par exemple, un compte d'organisation sans accès au Drive). L'application en a besoin pour enregistrer vos données. Essayez avec un autre compte Google. » |
| Drive plein (US-017) | Carte d'erreur dans ECR-011 ; indicateur « Action requise » | « Votre Google Drive est plein. Vos modifications sont conservées sur cet appareil. Libérez de la place : l'enregistrement reprendra tout seul. » |
| Horloge déréglée de plus de 24 h (US-017) | Carte d'attention dans ECR-011 | « L'heure de cet appareil semble incorrecte. Corrigez-la pour éviter des conflits entre vos appareils. » |
| Données absentes ou illisibles dans le Drive (RG-044) | Indicateur « Action requise » + feuille de choix (§4.25) ; l'application reste utilisable | « Vos données ne sont plus dans votre Google Drive. Cet appareil en garde une copie. Rien n'est effacé tant que vous n'avez pas choisi. » |
| Choix « repartir de zéro » fait sur l'autre appareil | Carte d'information dans ECR-011 | « Vous avez choisi de repartir de zéro sur votre PC. 2 modifications faites ici avant ce choix n'ont pas été conservées. » |
| Modification supprimée ou écartée (RG-036, RG-047, RG-048) | `DiscardedItem` (§4.24) | Voir ECR-011 C |
| Incohérence d'état (RG-049) | `InconsistencyCard` (§4.23) | « Cette tâche est terminée, mais 1 sous-tâche est à faire. Rien n'a été modifié. » |

**(v0.2) Perte d'accès Google (Q-DEM001-22.2 c, RG-035, levée de la réserve)** : l'application reste entièrement utilisable comme hors ligne (consultation et saisie). Aucun bouton n'est désactivé ; le bandeau non fermable porte la seule action « Se reconnecter ».

### 6.4 Hors ligne
- L'application reste entièrement utilisable en consultation et en saisie (RG-021). Aucun bouton n'est désactivé pour cause de réseau, sauf « Synchroniser maintenant » et la reconnexion Google.
- Au passage hors ligne : indicateur « Hors ligne » (icône + libellé) et un toast unique : « Hors ligne. Vos modifications sont enregistrées sur l'appareil et seront envoyées au retour du réseau. »
- Les éléments modifiés hors ligne portent le point « en attente » (§4.2).
- Les actions qui dépendent de Google (création de créneau, prise en compte des événements) sont mises en file ; la jauge de capacité indique « Agenda non actualisé depuis 14 h 10 » si les événements n'ont pas pu être relus.
- Au retour du réseau : indicateur « Synchronisation… » puis « À jour », sans toast si tout s'est bien passé. **(v0.2, Q-DEM001-23.2 « oui »)** Si une modification a été écartée par la règle de conflit (RG-036), supprimée par une suppression concurrente (RG-047) ou annulée (RG-048) : point accent sur l'indicateur, toast « 2 modifications n'ont pas été retenues · Voir » et liste dans ECR-011 (§4.24). Ce n'est pas une carte « À traiter » : il n'y a pas de décision à prendre, et aucun écran « Aujourd'hui » n'existe au lot 1.
- **(v0.2) Sur PC : comportement identique** (DEC-013, US-031). L'application doit avoir été ouverte une fois avec le réseau, dans ce navigateur : sans cela, le navigateur ne peut rien afficher et aucun écran n'est concevable (consigne dans le guide utilisateur). Hors ligne prolongé : **aucune durée maximale** (US-018 CA-6, US-031 CA-7).
- **(v0.2) Forme de l'indication hors ligne** (CA-3 de US-018 et de US-031, « forme fixée en E4 ») : (1) libellé « Hors ligne · n en attente » à la place de l'icône, dans l'en-tête sur smartphone et dans le pied de la barre latérale sur PC ; (2) point « en attente d'envoi » sur chaque ligne modifiée ; (3) liste lisible des modifications dans ECR-011 ; (4) un toast unique au passage hors ligne ; (5) aucun bandeau avant 24 h (au-delà, le rappel RG-057, §4.9). Le libellé disparaît au retour du réseau, **sans toast** si tout s'est bien passé.
- **(v0.2) Session Google expirée sur PC** (F14, US-031 CA-5) : l'application reste utilisable ; l'indicateur propose « Reprendre la synchronisation » en un clic, sans bandeau (jeton d'une heure, état routinier).
- **(v0.2) Deux onglets** (US-031) : les deux affichent les mêmes données ; un seul synchronise (verrou). L'onglet qui ne synchronise pas le dit dans ECR-011 uniquement ; aucun message ne l'interrompt. Si l'onglet qui synchronise est fermé, l'autre prend le relais sans message.

### 6.5 États de l'indicateur de synchronisation
| État | Icône | Libellé (PC ; smartphone si affiché) | Intrusif ? |
|---|---|---|---|
| À jour | nuage coché, `color.text.tertiary` | « À jour · il y a 2 min » | Non (icône discrète) |
| Synchronisation en cours | nuage avec flèches, `color.text.tertiary` | « Synchronisation… » | Non |
| Modifications en attente (en ligne) | nuage + petit nombre | « 3 modifications à envoyer » | Non |
| Hors ligne | nuage barré, `color.text.secondary` | « Hors ligne · 3 en attente » | Libellé visible, pas de bandeau avant 24 h (RG-057) |
| Nouvelle tentative | nuage avec flèches, `color.warning` | « Nouvelle tentative… » | Non |
| Session à renouveler (PC) | nuage avec flèches, `color.accent` | « Reprendre la synchronisation » (bouton) | Non : un clic, pas de bandeau |
| Action requise | nuage avec point d'exclamation, `color.danger` | « Action requise » | Oui : bandeau si Google, sinon indicateur + carte |
| **(v0.2.7)** Point « à lire » (**signal ajouté à n'importe quel état ci-dessus**, pas un état) | point accent en haut à droite de l'icône, liseré de la couleur du fond | État inchangé ; « À jour · 2 informations » seulement sur « À jour » (PC) ; dans les autres états, le nombre n'est que dans le nom accessible et la feuille | Non : point seul, ni bandeau ni nombre sur smartphone |

**(v0.2)** « Action requise » couvre : accès Google perdu (bandeau), Drive plein, données absentes du Drive, version de l'application trop ancienne. « Session à renouveler » est propre au PC et n'est jamais un bandeau. Les fréquences de synchronisation ne sont pas visibles : l'heure du « dernier échange » suffit (DAT : à l'ouverture, 5 s après une modification, puis toutes les 2 min au premier plan ; exigence de l'utilisateur : 1 h, DEC-014).

**Point « à lire » dans tous les états (v0.2.7, Q-US-017-6, RG-056 a inchangée).** Le point signale « il reste des informations non lues » quel que soit l'état : hors ligne, en attente, nouvelle tentative, session à renouveler, action requise. Il ne remplace ni ne modifie l'état et ne dépend pas de lui. Sur un libellé déjà long (« Hors ligne · 3 en attente »), le libellé ne change pas : le point et le nom accessible (« Hors ligne, 3 modifications en attente, 2 informations à lire ») suffisent. Il disparaît quand la dernière information est lue (« Compris », sur l'un ou l'autre appareil après échange). Le point ne se distingue pas par la couleur seule : sa présence ou son absence est la seule information, et la feuille s'ouvre sur la section « À lire » en tête. Visuel : ECR-011 cadre M. Comptage : les informations `ALR-009` à `ALR-011` ; `ALR-008` et `ALR-014` n'y sont pas comptées (§6.6.9).

L'indicateur couvre deux échanges distincts — l'espace de stockage (données) et Google Calendar (créneaux, événements, rappels) — mais n'affiche qu'**un** état, le plus grave des deux. La feuille de synchronisation détaille chacun.

### 6.6 Catalogue des libellés et des codes d'état observables (E7, ANT-7)

> Destiné à Anthony (tests automatisés) et à Benjamin. **Ce catalogue fait foi** pour les libellés exacts : si un texte du §4, §6.1 à §6.5 ou d'une maquette en diffère, c'est le catalogue qui l'emporte (les maquettes et les paragraphes concernés ont été alignés en v0.2.3). Les entrées marquées **[sous réserve Q-ERG-xx]** dépendent d'une réponse du commanditaire et ne sont pas tranchées ici.

#### 6.6.1 Conventions

| Sujet | Règle |
|---|---|
| **Famille de codes** | `SYN-` état de l'indicateur · `BAN-` bandeau · `MEN-` mention · `ETA-` état d'un objet · `EVD-` état vide · `TST-` message éphémère · `CNF-` boîte de confirmation · `ERR-` erreur (l'application n'a pas pu faire ce qui était demandé, ou ne peut plus enregistrer) · `ALR-` alerte ou information (rien n'a échoué : écart, risque, explication, valeur non retenue) · `SEC-` titre de section · `SEL-` texte d'un sélecteur et de l'action qui l'ouvre (v0.2.18) · `TXT-` fragment de texte partagé, inséré dans le libellé d'un autre code (nom d'information, valeur signalée) ou libellé d'action commun à plusieurs codes (v0.2.20, §6.6.12). |
| **Stabilité** | Un code n'est jamais renuméroté ni réutilisé. Un code retiré reste dans ce catalogue, barré. Un libellé peut évoluer (rédaction), pas le code. |
| **Observabilité (proposition de Steeve, nom de l'attribut à confirmer par Anthony en E9)** | Chaque élément qui porte un état ou un message expose son code dans l'attribut `data-etat="CODE"` (un message d'erreur ou d'alerte ajoute `data-message="ERR-xxx"` ou `data-message="ALR-xxx"`), en plus du **texte visible exact** et du **rôle accessible** indiqués ci-dessous. Un test peut donc vérifier le code, le texte, ou les deux ; le code ne dépend jamais de la langue ni de la couleur. |
| **Variables** | `{n}` entier ; `{appareil}` = « smartphone » ou « PC » (jamais « téléphone ») : l'appareil courant, déduit du navigateur ; l'autre appareil s'en déduit (`{autre appareil}`, Q-ST022-STE-2). **(v0.2.20, Q-ST017-STE-2 b)** Les données ne nomment jamais l'appareil qui a fait une écriture : aucun libellé ne nomme l'appareil d'une valeur ; seuls l'appareil courant ou l'autre appareil sont nommés (cas d'`ALR-008`) ; `{élément}` intitulé exact entre « » ; `{date}` au format « 19 oct. » (année seulement si elle diffère de l'année en cours) ; `{heure}` « 10 h 32 ». |
| **Pluriel** | 0 ou 1 → singulier (« 1 modification », « 0 modification »), 2 et plus → pluriel. Les verbes et participes s'accordent (« 1 modification n'a pas été retenue » / « 3 modifications n'ont pas été retenues »). |
| **Décompte d'une « modification en attente » (v0.2.7, Q-US-018-1)** | `{n}` = **nombre d'éléments distincts** (objectif, tâche, sous-tâche) qui portent `MEN-ATTENTE`, c'est-à-dire nombre de lignes de la liste `SYN-FEUILLE-EN-ATTENTE`. Plusieurs opérations sur un même élément comptent pour **une** : hors ligne, créer l'objectif X, le renommer, puis changer deux fois le délai de la tâche T donne **n = 2**. La ligne de l'élément résume sa nature (création l'emporte : « Nouvel objectif » ; sinon les champs modifiés, séparés par « · »). Une suppression d'un élément déjà enregistré compte pour 1 (ligne « Supprimée ») ; un élément créé puis supprimé hors ligne ne compte pas (il n'y a rien à envoyer). Même `{n}` pour `SYN-ATTENTE`, `SYN-HORS-LIGNE`, `BAN-RAPPEL-24H`, la variante `24H`, `CNF-DECONNEXION`, `CNF-SUPPR-DONNEES-PERTE`, `CNF-REPARTIR-ZERO`, `ERR-015`. Justification : c'est ce que l'utilisateur voit (un point par ligne, une ligne par élément) ; aucun journal local d'opérations n'est nécessaire. **Instant de départ des 24 h (RG-057)** : première écriture locale non déposée, tous éléments confondus (confirmé). |
| **Ancienneté « dernier échange »** | moins d'une minute : « à l'instant » · 1 à 59 min : « il y a {n} min » · 1 à 23 h : « il y a {n} h » · au-delà : « hier à {heure} » puis « le {date} à {heure} ». |
| **Typographie** | Espace insécable entre nombre et unité, avant « : », « ? », « ! » et « · » entouré d'espaces. Guillemets « » avec espaces insécables. Points de suspension : le caractère « … ». |
| **Langue** | Français, vouvoiement (§8). Aucun code technique n'est jamais affiché à l'écran : les codes ci-dessous ne vivent que dans l'attribut `data-etat` / `data-message` et dans les tests. |

#### 6.6.2 États de l'indicateur de synchronisation (`SyncStatus`, §4.8, §6.5)

Un seul état est exposé à la fois (`data-etat` de l'indicateur). **(v0.2.12, Q-ST022-STE-3)** `SYN-SESSION` n'est exposé que si le réseau est disponible : appareil hors ligne, l'état est `SYN-HORS-LIGNE` (« Reprendre la synchronisation » ne peut pas aboutir, l'afficher ferait échouer le geste ; besoin : ne proposer que ce qui fonctionne). La session à renouveler est mémorisée et `SYN-SESSION` s'affiche au retour du réseau. L'ordre ci-dessous est inchangé pour le reste. **Ordre de gravité, du plus grave au moins grave** (proposition de conception) : `SYN-ACTION` > `SYN-SESSION` > `SYN-RETENTATIVE` > `SYN-HORS-LIGNE` > `SYN-EN-COURS` > `SYN-ATTENTE` > `SYN-INFO` > `SYN-OK`. **(v0.2.7, Q-US-017-6)** L'indicateur expose **deux attributs indépendants** : `data-etat` (un des états ci-dessous, le plus grave) et `data-a-lire="{n}"` (nombre d'informations non lues ; attribut absent si n = 0). Le point « à lire » s'affiche dès que `data-a-lire` est présent, **dans tous les états** ; RG-056 a est donc tenue sans être modifiée. `SYN-INFO` est conservé comme **code dérivé** : `data-etat` vaut `SYN-INFO` si et seulement si l'état serait `SYN-OK` et que `data-a-lire` ≥ 1. Dans les autres états, `data-etat` garde l'état réel (`SYN-HORS-LIGNE`, `SYN-ATTENTE`…) et seul `data-a-lire` signale les informations. Étape à ajouter au glossaire par Pepper : « l'indicateur de synchronisation signale n information(s) à lire » (vérifie `data-a-lire`), valable dans tous les états ; « n'est pas "SYN-INFO"» reste vrai hors `SYN-OK`.

| Code | Quand | Libellé visible PC (pied de barre latérale, titre de la feuille) | Smartphone | Nom accessible (`role="status"`, annoncé au changement) | Icône (§3.7) |
|---|---|---|---|---|---|
| `SYN-OK` | Dernier échange réussi, rien en attente, rien à lire | « À jour · {ancienneté} » | Icône seule | « Synchronisé, à jour » | nuage coché |
| `SYN-INFO` | **Dérivé** : état `SYN-OK` avec au moins 1 modification non retenue non lue (`ALR-009` à `ALR-011`, `data-a-lire` ≥ 1). Dans un autre état, voir `data-a-lire` ci-dessus | « À jour · {n} information(s) » | Icône + point accent, sans nombre | « À jour, {n} information(s) à lire » | nuage coché + point accent |
| `SYN-EN-COURS` | Échange en cours | « Synchronisation… » | Icône animée | « Synchronisation en cours » | nuage avec flèches |
| `SYN-ATTENTE` | En ligne, modifications pas encore envoyées | « {n} modification(s) à envoyer » | Icône + petit nombre | « {n} modification(s) à envoyer » | nuage + nombre |
| `SYN-HORS-LIGNE` | Appareil sans réseau (ou accès Google perdu, traité comme une coupure : `SYN-ACTION` l'emporte alors) | « Hors ligne · {n} en attente » ; **« Hors ligne »** si n = 0 | Libellé visible, identique | « Hors ligne, {n} modification(s) en attente » | nuage barré |
| `SYN-RETENTATIVE` | Échec temporaire, nouvelle tentative automatique (3 tentatives au plus avant `SYN-ACTION`) | « Nouvelle tentative… » | Icône `color.warning` | « Nouvelle tentative de synchronisation » | nuage avec flèches, orange |
| `SYN-SESSION` | **PC et smartphone** (v0.2.12, Q-ST022-STE-2, PWA unique DEC-034) : jeton Google expiré (ou retour de redirection silencieuse refusé), **réseau disponible**, un geste suffit. **Hors ligne, cet état n'est jamais exposé : `SYN-HORS-LIGNE` s'affiche** (v0.2.12, Q-ST022-STE-3), `SYN-SESSION` apparaît au retour du réseau | « Reprendre la synchronisation » (bouton) | Libellé visible « Reprendre la synchronisation » (bouton dans l'en-tête, comme « Action requise ») | « Reprendre la synchronisation » | nuage avec flèches, accent |
| `SYN-REDIRECTION` | **Écran d'attente** (v0.2.12, Q-ST022-STE-1), plein écran, pas un état de l'indicateur : à l'ouverture, pendant la redirection silencieuse vers Google (0,4 à 1,8 s mesurées) ; **au plus 10 s** (v0.2.15) : au-delà, retour à l'application sans jeton, `SYN-SESSION` avec `ERR-015`, jamais de boucle | « Connexion à Google… » | idem | « Connexion à Google en cours » (`role="status"`) | logo de l'application |
| `SYN-ACTION` | Accès Google perdu (`ERR-010`), Drive plein (`ERR-011`), données absentes ou illisibles (`ERR-012`), version trop ancienne (`ERR-013`) | « Action requise » | Libellé visible « Action requise » | « Action requise » | nuage avec point d'exclamation, rouge |

Libellés de la feuille « Compte et synchronisation » (`SyncSheet`, §4.26), observables sous `data-etat="SYN-FEUILLE-…"` :

| Code | Texte exact |
|---|---|
| `SYN-FEUILLE-DERNIER-ECHANGE` | « Dernier échange avec votre Google Drive : {ancienneté} ({heure}). » |
| `SYN-FEUILLE-RIEN-EN-ATTENTE` | « Aucune modification en attente. » |
| `SYN-FEUILLE-EN-ATTENTE` | « {n} modification(s) en attente » (titre de la liste ; **une ligne par élément** : intitulé de l'élément + nature : « Terminée », « Nouvelle tâche », « Délai changé : 20 déc. → 15 déc. »… ; `{n}` = nombre de lignes, voir la convention « Décompte » du §6.6.1) |
| `SYN-FEUILLE-A-LIRE` | « {n} information(s) à lire » (v0.2.7) : titre de la section placée **en tête** de la feuille dès que `data-a-lire` ≥ 1, dans tous les états ; les `DiscardedItem` (§4.24) y figurent avec « Compris » |
| `SYN-FEUILLE-HORS-LIGNE` | « Vos modifications sont enregistrées sur cet appareil. Elles seront envoyées au retour du réseau, sans rien faire. » |
| `SYN-FEUILLE-BOUTON` | Bouton « Synchroniser maintenant » ; hors ligne : `aria-disabled="true"` (reste focalisable), explication « Disponible au retour du réseau. » liée par `aria-describedby` |
| `SYN-FEUILLE-AUTRE-ONGLET` | « Cet onglet n'effectue pas la synchronisation : un autre onglet de l'application s'en charge. Les deux onglets affichent les mêmes données. » (PC, jamais d'interruption) |
| `SYN-FEUILLE-STOCKAGE` | Ligne « Stockage » (v0.2.12, Q-ST018-STE-1), en pied de feuille, discrète (`color.text.tertiary`), toujours présente : « Stockage de cet appareil : protégé » ou « Stockage de cet appareil : non protégé » (`data-etat="PROTEGE"` / `"NON-PROTEGE"` ; persistance refusée ou API indisponible = non protégé). Sur Android, la PWA installée est protégée sans question : la ligne reste calme |
| `SYN-FEUILLE-DOSSIER` | « Dossier « Done Juan » dans votre Google Drive » |
| `SYN-FEUILLE-FUSEAU` | Ligne « Fuseau » : « Heure de Paris » puis « Votre appareil est réglé sur {fuseau}. » — seulement si le fuseau de l'appareil diffère de Paris (`MEN-HEURE-PARIS`) |

#### 6.6.3 Bandeaux (`Banner`, §4.9)

Au plus **un** bandeau à la fois (`data-etat` du bandeau ; absent du DOM sinon). Ordre : `BAN-ACCES-GOOGLE` > `BAN-CONSULTATION-SEULE` > `BAN-RAPPEL-24H`. Rôle : `role="region"` avec nom accessible = titre ; `role="alert"` à l'apparition de `BAN-ACCES-GOOGLE` seulement.

| Code | Titre | Texte | Action | Fermable | Message | Indicateur associé |
|---|---|---|---|---|---|---|
| `BAN-ACCES-GOOGLE` | « Accès Google perdu » | « Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées et vous pouvez continuer à travailler. » | « Se reconnecter » (seule action) | Non, tant que non résolu (RG-035) | `ERR-010` | `SYN-ACTION` |
| `BAN-ACCES-GOOGLE` avec `data-variante="24H"` (accès Google perdu et plus ancienne modification en attente de plus de 24 h ; DEC-025, Q-ERG-16 b et 17 a) | idem | « Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées. » + ligne « {n} modification(s) ne sont encore que sur ce {appareil}. » (accord : « 1 modification n'est encore que sur ce {appareil} ») | idem | Non | `ERR-010` | `SYN-ACTION` |
| `BAN-CONSULTATION-SEULE` | « Consultation seule » | « Une version plus récente de l'application a enregistré vos données. Mettez à jour l'application pour les modifier. » + si n > 0 : « Vos {n} modifications en attente sont conservées. » | « Mettre à jour » | Non (RG-058) | `ERR-013` | `SYN-ACTION` |
| `BAN-RAPPEL-24H` (plus ancienne modification en attente de plus de 24 h ; DEC-025, Q-ERG-16 b et 18 a) | « Modifications en attente depuis plus de 24 h » | « {n} modification(s) ne sont encore que sur ce {appareil}. Elles seront enregistrées dans votre Google Drive dès que la synchronisation reprendra. » | Aucune | Oui (bouton « Masquer le rappel ») : masqué jusqu'à la prochaine ouverture de l'application, tant que des modifications sont en attente | `ALR-002` | `SYN-HORS-LIGNE` (ou l'état courant si l'appareil est en ligne) |
| `BAN-RAPPEL-24H` avec `data-variante="session"` (PC ou smartphone en `SYN-SESSION` et plus ancienne modification en attente de plus de 24 h ; v0.2.7, Q-US-031-2 a) | idem | « {n} modification(s) ne sont encore que sur ce {appareil}. Reprenez la synchronisation pour les enregistrer dans votre Google Drive. » | « Reprendre la synchronisation » (seule action, la même que celle de l'indicateur) | Oui (« Masquer le rappel », mêmes règles) | `ALR-002` | `SYN-SESSION` |

Absences vérifiables : aucun bandeau pour `SYN-SESSION` **tant que la plus ancienne modification en attente a moins de 24 h** (au-delà : variante `session` ci-dessus, car une session expirée depuis plus d'un jour n'est plus un état routinier et les modifications ne sont que sur le PC), `SYN-RETENTATIVE`, `SYN-ATTENTE`, ni pour le hors ligne de moins de 24 h. `BAN-RAPPEL-24H` est absent s'il n'y a aucune modification en attente, s'il est remplacé par la variante `24H` de `BAN-ACCES-GOOGLE` ou par `BAN-CONSULTATION-SEULE` (un seul bandeau à la fois), et disparaît à l'enregistrement dans le Drive. En consultation seule : bouton « + » absent, cases inertes (toast `TST-CONSULTATION-SEULE`).

#### 6.6.4 Mentions

Les mentions sont des textes ou marqueurs brefs portés par un élément.

| Code | Texte visible exact | Où / quand | Nom accessible |
|---|---|---|---|
| `MEN-ATTENTE` | Point `color.text.tertiary` à droite de la ligne (aucun texte visible). **C'est l'indication « non synchronisé » des US-017, US-018 et US-031** : le mot « synchronisé » n'est jamais écrit à l'écran (§8) | Tout élément modifié ou créé dont l'envoi au Drive n'est pas terminé ; disparaît quand l'envoi est fait, sans toast | « Modification en attente d'envoi » |
| `MEN-HEURE-PARIS` | « Heure de Paris » (puce, icône horloge) | Seulement si le fuseau de l'appareil diffère de Paris ; écrans du lot 1 au §4.21 ; jamais sur un délai | « Heure de Paris : afficher l'explication » |
| `MEN-HEURE-PARIS-EXPLICATION` | « Les jours, les retards et les horaires suivent l'heure de Paris, où que vous soyez. » (+ exemple : « Il est {heure} à Paris, alors que votre appareil indique {heure} la veille. ») | Info-bulle de la puce, fermable (Échap) | — |
| `MEN-SANS-DELAI` | « Sans délai » | Objectif sans délai (RG-002), choix explicite à la création ; jamais sur une tâche (délai obligatoire) | — |
| `MEN-EN-RETARD` | « En retard » ; en liste : « En retard · {date} » | Tâche non terminée ni abandonnée dont le délai est antérieur à la journée de Paris ; objectif non atteint dans le même cas. Jamais sur une tâche terminée ou abandonnée | « En retard, délai {date} » |
| `MEN-INCOHERENCE` | « Incohérence » (icône triangle + mot) | Marqueur dans les listes tant que `ALR-003` ou `ALR-004` persiste | « Incohérence » |
| `MEN-NON-RETENUE` | « {n} modification(s) non retenue(s) · Voir » | Ligne discrète sur l'élément concerné (détail de tâche, d'objectif) | — |
| `MEN-ESTIMATION-CALCULEE` | « Somme des sous-tâches » (cadenas) | Estimation d'une tâche parente, non modifiable | « Estimation calculée : somme des sous-tâches » |
| `MEN-OBJECTIFS-HERITES` | « Hérités de la tâche » (cadenas) | Objectifs d'une sous-tâche, lecture seule | idem |
| `MEN-TRI-DELAI` | « Triées par délai » (filtre « À faire ») ; « Plus récentes d'abord » (filtres « Terminées » et « Abandonnées ») | Sous-titre de la liste Tâches (lot 1, §5.7) | — |
| `MEN-OBLIGATOIRE` | « (obligatoire) » | Libellés « Délai » et « Estimation » de la saisie rapide ; « (facultatif) » / « (facultative) » pour les autres | — |

États d'un objet (`ETA-`), texte exact visible :

| Code | Objet | Texte | Condition |
|---|---|---|---|
| `ETA-OBJ-EN-COURS` | Objectif | « En cours » | Au moins une tâche non abandonnée à faire, ou un sous-objectif non atteint, **quel que soit le compteur** (PEP-10 : « 3 / 3 tâches » peut accompagner « En cours » si un sous-objectif ne l'est pas atteint, ECR-008 A, « Préparer le lancement », ligne complétée de « 1 sous-objectif en cours ») |
| `ETA-OBJ-ATTEINT` | Objectif | « Atteint » (coche verte) | RG-025 |
| `ETA-OBJ-A-DECLINER` | Objectif | « À décliner en tâches » | Ni tâche non abandonnée ni sous-objectif |
| `ETA-OBJ-COMPTEUR` | Objectif | « {t} / {n} tâches » (terminées sur non abandonnées) | Toujours, en toutes lettres ; nom accessible de la ligne : « {intitulé}, {état}, {t} tâches sur {n} terminées, délai {date} » |
| `ETA-TACHE-A-FAIRE` | Tâche | Case vide | — |
| `ETA-TACHE-TERMINEE` | Tâche | Case cochée ; détail : « Terminée le {date} » | — |
| `ETA-TACHE-ABANDONNEE` | Tâche | « Abandonnée le {date} » | Visible dans le filtre « Abandonnées » |
| `ETA-SOUS-TACHE-ABANDONNEE-AVEC` | Sous-tâche | « Abandonnée avec la tâche » | Reprise avec la tâche parente |
| `ETA-SOUS-TACHE-ABANDONNEE-AVANT` | Sous-tâche | « Abandonnée avant la tâche » | Non reprise avec la tâche parente |
| `ETA-SOUS-TACHE-TERMINEE-AVANT` | Sous-tâche | « Terminée avant l'abandon » | Reste terminée |

Titres de section (`SEC-`, v0.2.9, Q-US-001-6), texte exact visible :

| Code | Texte | Où |
|---|---|---|
| `SEC-OBJ-ATTEINTS` | « Atteints ({n}) » (Disclosure, repliée par défaut) | Fin de la liste des objectifs (ECR-008), absente si n = 0 |
| `SEC-SOUS-OBJECTIFS` | « Sous-objectifs » (+ nombre) | Détail d'un objectif (ECR-003) |
| `SEC-TACHES-A-FAIRE` | « Tâches à faire · {n} » | Détail d'un objectif (ECR-003) |
| `SEC-TACHES-TERMINEES` | « Terminées ({n}) » (Disclosure, repliée) | Détail d'un objectif (ECR-003) |
| `SEC-TACHES-ABANDONNEES` | « Abandonnées ({n}) » (Disclosure, repliée) | Détail d'un objectif (ECR-003) |
| `SEC-SOUS-TACHES` | « Sous-tâches » + compteur « {t} / {n} » | Détail d'une tâche (ECR-007) |
| `SEC-MODIFS-EFFACEES` | « Voir les {n} modifications » ; n = 1 : « Voir la modification » (Disclosure, repliée par défaut ; libellé inchangé une fois dépliée, l'état est porté par `aria-expanded`) | Carte `ALR-008` de la feuille ECR-011 (v0.2.20, Q-ST017-STE-2), entre le texte de la carte et son unique « Compris » ; `{n}` = nombre de lignes `ALR-014` = `{n}` d'`ALR-008` |

Sélecteur de parent (`SEL-`, v0.2.18, Q-ANT-E13-R4-1, DT-015 ; `ParentPicker` §4, ECR-008 C, US-023 CA-5), texte exact visible :

| Code | Texte | Où / quand | Nom accessible |
|---|---|---|---|
| `SEL-PARENT-MENU` | « Placer sous un autre objectif » | Entrée du menu « … » du détail d'un objectif (ECR-003 C), entre « Retirer le délai » et « Supprimer l'objectif… ». Présente pour un objectif principal comme pour un sous-objectif | idem (`role="menuitem"`) |
| `SEL-PARENT-TITRE` | « Placer « {élément} » sous… » | Titre de la feuille (smartphone) ou de la boîte (PC) | idem (titre du dialogue, `aria-labelledby`) |
| `SEL-PARENT-AUCUN` | « Aucun, objectif principal » | Première option, toujours présente ; cochée si l'élément est déjà objectif principal | idem |
| `SEL-PARENT-DELAI` | « Son délai : {date} » | Indication sous l'intitulé d'un candidat qui a un délai ; absente si le candidat est sans délai | Ajoutée au nom de l'option par `aria-describedby` |
| `SEL-PARENT-EFFECTIF` | « Aura {n} sous-objectif(s) » | Indication sous l'intitulé d'un candidat qui a déjà au moins un sous-objectif autre que l'élément ; `{n}` = ses sous-objectifs (atteints compris) autres que l'élément, plus 1. Absente sinon | idem |
| `SEL-PARENT-VALIDER` | « Placer » | Bouton principal ; indisponible tant que l'option cochée est la position actuelle | idem |

Règles : les deux indications d'un même candidat tiennent sur une ligne, dans l'ordre délai puis effectif, séparées par « · » (« Son délai : 15 déc. · Aura 3 sous-objectifs ») ; aucune indication sur « Aucun, objectif principal ». Le candidat indisponible (l'élément lui-même) porte `ERR-031` à la place des indications. Justification : l'utilisateur choisit un parent en regardant ce qui change pour lui, à savoir l'échéance qu'il rejoint (risque d'`ALR-007`) et la taille du groupe ; aucune autre donnée n'est montrée. Le verbe « Placer » est le même dans l'entrée de menu, le titre et le bouton : un geste, un mot. « Déplacer » est écarté, parce qu'un objectif principal n'est encore sous rien et que « Déplacer » désigne déjà le changement d'ordre des tâches (ECR-002).

#### 6.6.5 États vides et écrans d'atterrissage

| Code | Écran | Texte exact | Action |
|---|---|---|---|
| `EVD-BIENVENUE` | Tâches, **tant qu'il n'existe ni objectif ni tâche** (compte neuf, ECR-010 C ; BEN-6, US-022 CA-2) | Titre « Bienvenue » ; « Un objectif donne une direction à vos tâches. Commencez par le vôtre, ou ajoutez directement une tâche. » | « Créer mon premier objectif » (principal) ; « Ajouter une tâche sans objectif » (tertiaire) |
| `EVD-TACHES` | Tâches, **aucune tâche du tout** (dans aucun état) mais au moins un objectif | « Aucune tâche pour l'instant. » / « Commencez par ce qui vous vient à l'esprit, vous trierez ensuite. » | « Ajouter une tâche » |
| `EVD-OBJECTIFS` | Objectifs, aucun objectif mais au moins une tâche | « Un objectif donne une direction à vos tâches. » | « Créer un objectif » |
| `EVD-OBJECTIFS-TOUS-ATTEINTS` | Objectifs, tous les objectifs principaux sont atteints (v0.2.14, E11) : affiché au-dessus de la section repliée « Atteints (n) » | « Tous vos objectifs sont atteints. » | « Créer un objectif » |
| `EVD-OBJECTIF-SANS-TACHE` | Détail d'un objectif sans tâche | « À décliner en tâches. » | « Ajouter une tâche » |
| `EVD-FILTRE-SANS-OBJECTIF` | Tâches, filtre « Sans objectif » | « Toutes vos tâches ont un objectif. » | — |
| `EVD-FILTRE-A-FAIRE` | Tâches, filtre « À faire » vide alors qu'il existe au moins une tâche (v0.2.7) | « Aucune tâche à faire. » | — |
| `EVD-FILTRE-ABANDONNEES` | Tâches, filtre « Abandonnées » | « Aucune tâche abandonnée. » | — |
| `EVD-FILTRE-TERMINEES` | Tâches, filtre « Terminées » | « Aucune tâche terminée. » | — |

**Écran d'atterrissage après la première connexion (BEN-6).** L'utilisateur arrive sur **Tâches** (accueil du lot 1) dans l'état `EVD-BIENVENUE`. Puis :
- « Créer mon premier objectif » → feuille de création (ECR-008 B) → après « Créer l'objectif », **détail de l'objectif** créé dans l'état `EVD-OBJECTIF-SANS-TACHE` (ECR-003 B) ;
- « Ajouter une tâche sans objectif » → saisie rapide (ECR-006) → après « Ajouter », la feuille reste ouverte pour enchaîner (toast `TST-AJOUTEE`) ; à la fermeture, **Tâches** affiche la liste avec la tâche (ECR-002 L1). Le bandeau d'accueil a disparu dès la première création, d'un objectif ou d'une tâche.

#### 6.6.6 Messages éphémères (`Toast`, §4.10)

`role="status"`, 4 s (6 s avec action).

| Code | Texte exact | Action |
|---|---|---|
| `TST-AJOUTEE` | « Ajoutée à Tâches » (dans la feuille de saisie) | — |
| `TST-TERMINEE` | « Tâche terminée » | « Annuler » : **réouverture** de la tâche (v0.2.7, Q-US-003-1 a) ; la fin est écrite sans attendre la fin du toast, l'historique garde « fin » puis « réouverture » |
| `TST-HORS-LIGNE` | « Hors ligne. Vos modifications sont enregistrées sur l'appareil et seront envoyées au retour du réseau. » | — (unique au passage hors ligne) |
| `TST-NON-RETENUES` | « {n} modification(s) n'ont pas été retenues · Voir » | « Voir » |
| `TST-CONSULTATION-SEULE` | « Consultation seule · mettez à jour pour modifier » | — |
| `TST-SAISIE-A-TERMINER` | « Terminez votre saisie, puis reprenez la synchronisation. » (v0.2.14, Q-ST022-STE-4 a) | — ; l'indicateur reste `SYN-SESSION`, rien n'est perdu ni lancé |
| `TST-ERREUR-ENREGISTREMENT` | « Impossible d'enregistrer. Réessayer » (message `ERR-014`) | « Réessayer » |

#### 6.6.7 Boîtes de confirmation (`ConfirmDialog`, §4.12)

`role="alertdialog"`, « Annuler » focalisé par défaut, Échap = Annuler. Observable : `data-etat` de la boîte.

| Code | Titre exact | Bouton d'action | Rouge |
|---|---|---|---|
| `CNF-SUPPR-TACHE` | « Supprimer la tâche et ses {n} sous-tâches ? » (sans sous-tâche : « Supprimer la tâche ? ») | « Supprimer » | Oui |
| `CNF-SUPPR-OBJECTIF` | « Supprimer « {élément} » ? » (+ nombre de tâches détachées et de sous-objectifs promus) | « Supprimer » | Oui |
| `CNF-ABANDON-TACHE` | « Abandonner « {élément} » ? » — **toujours demandée** (US-025 CA-1, Q-ERG-13) ; sans sous-tâche : une seule phrase (« La tâche quitte vos tâches à faire. Vous la retrouverez dans « Abandonnées » et pourrez la reprendre. ») ; ECR-007 D2 | « Abandonner » | Non |
| `CNF-ABANDON-TACHE-CASCADE` | Même titre ; ajoute « Ses {n} sous-tâches à faire seront abandonnées aussi. La sous-tâche déjà terminée reste terminée. » ; ECR-007 D | « Abandonner » | Non |
| `CNF-ROUVRIR-SOUS-TACHE` | « Rouvrir aussi « {élément} » ? » | « Rouvrir les deux » | Non |
| `CNF-REPRENDRE-SOUS-TACHE` (v0.2.11, Q-US-025-3, DEC-032) | « Reprendre « {sous-tâche} » ? » ; texte : « « {tâche parente} » est terminée : elle sera rouverte aussi. » ; ECR-007 D3 | « Reprendre les deux » (annulation : « Annuler », rien ne change) | Non |
| `CNF-AJOUT-SOUS-TACHE-TERMINEE` | « Rouvrir « {élément} » pour y ajouter une sous-tâche ? » | « Rouvrir et ajouter » | Non |
| `CNF-DECONNEXION` | « Se déconnecter ? » (+ « {n} modifications ne sont pas encore enregistrées dans votre Google Drive. Elles restent sur cet appareil et seront enregistrées à votre prochaine connexion avec ce compte. Vos données ne sont pas effacées. ») — **absente s'il n'y a rien en attente**. Avec réseau (v0.2.7, Q-US-022-4) : le bouton « Se déconnecter » passe en cours (« Enregistrement de vos modifications… ») le temps du dernier dépôt ; la boîte n'apparaît que si des modifications restent en attente après ce dépôt, avec leur nombre à jour ; sans réseau, directement | « Se déconnecter » | Non |
| `CNF-SUPPR-DONNEES` | « Supprimer les données de cet appareil ? » (les données restent dans le Drive et sur l'autre appareil ; rechargées à la prochaine connexion, réseau nécessaire) | « Supprimer les données » | Oui |
| `CNF-SUPPR-DONNEES-PERTE` | « {n} modification(s) seraient perdues » (dépôt impossible, RG-055) | « Supprimer quand même » | Oui |
| `CNF-REPARTIR-ZERO` | « Effacer toutes vos données sur vos deux appareils ? » (+ « {n} modifications faites ici et pas encore enregistrées seront perdues. ») | « Tout effacer » | Oui |

#### 6.6.8 Erreurs (`ERR-`)

Chaque erreur a un **titre** et un **texte** (« ce qui s'est passé, ce qui est préservé, quoi faire », §6.3). Rôle `role="alert"` pour les erreurs de connexion et les champs ; `role="status"` pour les erreurs de fond de feuille.

**Motifs d'échec de connexion (US-022).** Pour chaque motif, la connexion échoue, l'utilisateur peut réessayer, aucune donnée n'est créée sur l'appareil ni dans le Drive (S06, S18, S20, S21, S22) et le focus reste sur le bouton. Correspondance avec les motifs écrits dans les scénarios de Pepper :

| Code | Motif du scénario (`.feature`) | Titre exact | Texte exact | Action | Scénarios |
|---|---|---|---|---|---|
| `ERR-001` | « annule la connexion » | « Connexion annulée » | « Une connexion à un compte Google est nécessaire pour utiliser l'application. Rien n'a été créé. » | « Continuer avec Google » | S06 |
| `ERR-002` | « refuse les autorisations demandées » | « Connexion annulée » (**même texte que `ERR-001`**, imposé par US-022 CA-4 ; seul le code diffère) | idem | « Continuer avec Google » | S06 |
| `ERR-003` | « réseau nécessaire pour la première connexion » (première connexion, ou rechargement après suppression des données de l'appareil) | « Pas de connexion à Internet » | « Une connexion est nécessaire pour vous connecter la première fois. Réessayez dès que vous avez du réseau. Rien n'a été créé. » | « Réessayer » | S18, S20 |
| `ERR-004` | « réseau nécessaire pour se connecter » (reconnexion après une déconnexion) | « Pas de connexion à Internet » | « Une connexion est nécessaire pour vous connecter. Les données déjà enregistrées sur cet appareil sont conservées. Réessayez dès que vous avez du réseau. » (v0.2.16 : vrai que l'espace présent soit celui de ce compte ou d'un autre, car hors réseau le compte qui se connecte n'est pas connu) | « Réessayer » | S22 |
| `ERR-005` | « connexion interrompue » ; **aussi** Drive momentanément indisponible à la (re)connexion (5xx ou 429 persistants après les nouvelles tentatives ; v0.2.7, Q-US-022-2 a) | « Connexion interrompue » | « La connexion a été interrompue. Aucune donnée n'a été créée à moitié. Réessayez. » | « Réessayer » | S20 |
| `ERR-006` | « Drive indisponible pour ce compte » (réservé au Drive désactivé ou refusé, 403 permanent) | « Google Drive n'est pas disponible pour ce compte » | « C'est le cas, par exemple, d'un compte d'organisation sans accès au Drive. L'application en a besoin pour enregistrer vos données. Essayez avec un autre compte Google. » | « Choisir un autre compte » (aucune autre fonction accessible) | S21 |

Remarque pour Pepper et Anthony : `ERR-003` et `ERR-004` sont deux textes distincts (la reconnexion rassure sur les données de l'appareil, la première connexion non), ce qui correspond à vos deux motifs. ECR-010 E affiche `ERR-003` ; la variante `ERR-004` suit la même mise en page (légende de la maquette alignée).

**Synchronisation et données.**

| Code | Quand | Titre exact | Texte exact | Action | Présentation |
|---|---|---|---|---|---|
| `ERR-010` | Accès Google perdu ou retiré (RG-035, US-022 S12) | « Accès Google perdu » | voir `BAN-ACCES-GOOGLE` | « Se reconnecter » | Bandeau + `SYN-ACTION` |
| `ERR-011` | Drive plein (US-017) | « Votre Google Drive est plein » | « Vos modifications ne peuvent plus y être enregistrées. Elles sont conservées sur cet appareil. Libérez de la place dans Google Drive : l'enregistrement reprendra tout seul. » | « Ouvrir Google Drive » | Carte d'erreur dans la feuille (en-tête : « Une action de votre part est nécessaire. Vos données sont conservées sur cet appareil. ») + `SYN-ACTION` |
| `ERR-012` | Dossier ou fichiers absents ou illisibles (RG-044) | « Vos données ne sont plus dans votre Google Drive » | « Le dossier « Done Juan » a été supprimé ou ne peut plus être lu. Cet appareil en garde une copie : {n} objectifs, {n} tâches, dernière mise à jour {ancienneté}. Rien n'est effacé ni modifié tant que vous n'avez pas choisi. » | « Restaurer mes données » (principal ; sans réseau : demande mémorisée, v0.2.7) ; « Repartir de zéro… » (sans réseau : indisponible) ; « Décider plus tard » | Feuille de choix (§4.25) + `SYN-ACTION` |
| `ERR-013` | Données écrites par une version plus récente (RG-058) | « Consultation seule » | voir `BAN-CONSULTATION-SEULE` | « Mettre à jour » | Bandeau + carte « Mettez l'application à jour » dans la feuille + `SYN-ACTION` |
| `ERR-014` | Écriture locale impossible | — | « Impossible d'enregistrer. Réessayer » | « Réessayer » | Toast `TST-ERREUR-ENREGISTREMENT` |
| `ERR-017` | Suppression des données de cet appareil non terminée au bout de 5 s : une autre fenêtre ou un autre onglet de Done Juan garde les données ouvertes (PC, v0.2.17, RL-LOT-001-A1) | « La suppression n'est pas terminée » | « Done Juan est encore ouvert dans une autre fenêtre ou un autre onglet de ce PC. La suppression se terminera dès que vous les aurez fermés. Fermez-les, puis appuyez sur « Réessayer ». Vos données restent dans votre Google Drive. » | « Réessayer » (attend de nouveau, 5 s au plus ; ne redemande pas la confirmation) et « Aller à la connexion » | Remplace la boîte `CNF-SUPPR-DONNEES` dans la section Compte, `role="alert"`, focus sur « Réessayer ». **La suppression est engagée et ne peut pas être annulée** : la session est déjà fermée, « Aller à la connexion » ramène cet onglet à l'écran de connexion (le libellé dit où l'on va, « Fermer » laisserait croire que rien ne change). Jamais « vos données n'ont pas été supprimées ». Le bouton affiche « Suppression en cours… » pendant l'attente |
| `ERR-016` | Échec persistant de synchronisation : réseau ou 5xx après les 3 tentatives de `SYN-RETENTATIVE` (v0.2.7, Q-US-017-12 a) | « La synchronisation n'a pas abouti » | « Vos {n} modifications sont conservées sur cet appareil. L'application réessaie toute seule ; vous pouvez aussi réessayer maintenant. » | « Réessayer maintenant » | Carte dans la feuille + `SYN-ACTION`. Les tentatives **continuent** après `SYN-ACTION` (attente croissante jusqu'à 5 min, Q-US-017-12 b) ; au premier succès, l'état repasse tout seul à `SYN-OK`, sans toast |
| `ERR-015` | Session Google expirée (PC et smartphone, v0.2.12, Q-ST022-STE-2) ; jamais affichée hors ligne | « La session Google de cet appareil a expiré » | « Vous pouvez continuer à travailler : vos {n} modifications sont conservées sur ce {appareil}. Pour les envoyer et recevoir celles de votre {autre appareil}, reprenez la synchronisation. » (`{autre appareil}` = « PC » sur smartphone, « smartphone » sur PC) | « Reprendre la synchronisation » | Feuille + `SYN-SESSION`, **aucun bandeau** |

**Saisie et organisation.**

| Code | Quand | Texte exact | Présentation |
|---|---|---|---|
| `ERR-020` | Intitulé vide à « Ajouter » / « Créer l'objectif » (US-001 CA-5, US-002) | « Indiquez un intitulé. » | Sous le champ, `color.danger` + icône, focus sur le champ, saisie conservée |
| `ERR-021` | Délai non choisi à la saisie d'une tâche (RG-003, US-002 CA-3) | « Indiquez un délai. » | Sous les puces de délai, focus sur la première erreur |
| `ERR-022` | Estimation non choisie (RG-029, US-002 CA-3) | « Indiquez une estimation. » | Sous les puces d'estimation |
| `ERR-023` | Estimation de 0 ou qui n'est pas un multiple de 30 min, saisie directement (stepper hors bornes, saisie « 45 min » sur PC) (RG-028, RG-029, US-002 S05b, US-024 S03). Une estimation **calculée** de 0 h reste valide (US-024) | « Indiquez une estimation de 30 min au minimum, par pas de 30 min. » | Sous le champ d'estimation, valeur saisie conservée, focus sur le champ |
| `ERR-030` | Deuxième niveau de sous-objectif (US-023 CA-6, S11) | Titre « Déplacement impossible » ; **variante `objectif-a-des-sous-objectifs`** : « « {élément} » a déjà {n} sous-objectif(s). Un seul niveau de sous-objectifs est autorisé. Déplacez ou supprimez d'abord son sous-objectif, ou placez celui-ci ailleurs. » ; **variante `cible-est-sous-objectif`** : « « {élément} » est déjà un sous-objectif. Un seul niveau de sous-objectifs est autorisé. Placez l'objectif sous un objectif principal. » | Boîte avec « Compris » (le même code pour les deux variantes ; `data-variante` les distingue) |
| `ERR-031` | Objectif placé sous lui-même (US-023 CA-5) | « Un objectif ne peut pas être placé sous lui-même » | Ligne indisponible dans `ParentPicker`, raison écrite |
| `ERR-032` | Ajout d'une sous-tâche à une tâche **abandonnée** (US-024 CA, S18) | « Cette tâche est abandonnée. Reprenez-la pour y ajouter une sous-tâche. » | Action « Ajouter une sous-tâche » proposée mais refusée avec ce texte (`role="alert"`) ; action « Reprendre la tâche » proposée dans le message. Aucune sous-tâche créée |
| `ERR-033` | Modification de l'estimation d'une tâche qui a des sous-tâches (RG-023, US-002 CA, US-002 S13) | « L'estimation de cette tâche est la somme de ses sous-tâches. Modifiez celle d'une sous-tâche. » | `LockedField` (`MEN-ESTIMATION-CALCULEE`) : le champ n'est pas modifiable ; le texte est lié par `aria-describedby` et annoncé si l'utilisateur tente d'agir (saisie clavier directe) |
| `ERR-034` | Modification des objectifs d'une sous-tâche (US-024 CA-7) | « Les objectifs d'une sous-tâche sont ceux de sa tâche parente. Modifiez-les sur la tâche parente. » | `LockedField` (`MEN-OBJECTIFS-HERITES`), même mécanisme |
| `ERR-035` | « Terminer la tâche » alors qu'il reste des sous-tâches à faire (US-003 CA-8, US-024 CA-8, US-024 S15) | « Il reste {n} sous-tâche(s) à terminer ou abandonner. » (**même texte que `ALR-013`**, qui en est l'affichage permanent au-dessus du bouton ; `ERR-035` est le refus de l'action) | Bouton `aria-disabled="true"` ; au toucher ou à Entrée, le texte est annoncé (`role="alert"`) ; aucun changement d'état |

Les erreurs de champ (`ERR-020` à `ERR-023`) sont **cumulables** : toutes les informations manquantes sont nommées en même temps, dans l'ordre intitulé, délai, estimation.

#### 6.6.9 Alertes et informations (`ALR-`)

| Code | Niveau | Quand | Titre / texte exact | Présentation et issues |
|---|---|---|---|---|
| `ALR-001` | Attention | Horloge de l'appareil déréglée au-delà du seuil que Pepper fixe en CA numéroté d'US-017 (ANT-4, BEN-12) | « L'heure de cet appareil semble incorrecte » / « Elle diffère de plus de 24 h de l'heure réelle. Corrigez-la dans les réglages de l'appareil pour éviter des conflits entre vos appareils. » | Carte dans la feuille ; aucun blocage |
| `ALR-002` | Attention | Rappel après 24 h de modifications en attente (DEC-025) | voir `BAN-RAPPEL-24H` ; cumul avec l'accès Google perdu : variante `24H` de `BAN-ACCES-GOOGLE` | Bandeau fermable |
| `ALR-003` | Attention | Tâche terminée avec sous-tâche à faire après fusion (RG-049, US-003 CA-12, US-024 CA-10) | **Un objectif** (cas nominal) : « Incohérence avec une sous-tâche » / « Cette tâche est terminée, mais {n} sous-tâche(s) {est/sont} à faire. Rien n'a été modifié. Tant que c'est le cas, l'objectif « {élément} » n'est pas atteint. » **(v0.2.20, Q-ST017-D2-1)** Variante `sans-objectif` (la tâche n'est rattachée à aucun objectif) : même titre / « Cette tâche est terminée, mais {n} sous-tâche(s) {est/sont} à faire. Rien n'a été modifié. » Variante `objectifs` (deux objectifs ou plus) : même titre / « … Rien n'a été modifié. Tant que c'est le cas, les objectifs {objectifs} ne sont pas atteints. » ; `{objectifs}` = intitulés entre « » (espaces insécables), séparés par « , » et par « et » avant le dernier (« « Publier le guide » et « Lancer le site » »), dans l'ordre de la ligne « Objectifs » du détail (§5.8) | `InconsistencyCard` ; « Rouvrir la tâche » (principal), « Terminer la sous-tâche », « Abandonner la sous-tâche » ; + `MEN-INCOHERENCE`. Variante choisie par le nombre d'objectifs rattachés à la tâche (0, 1, 2 et plus), `data-variante` absent pour un objectif. Justification : CA-12 dit « les objectifs de la tâche ne sont pas atteints » ; sans objectif, la phrase n'a pas d'objet et serait fausse |
| `ALR-004` | Attention | Tâche abandonnée avec sous-tâche à faire après fusion (RG-049, US-025 CA-10) | « Incohérence avec une sous-tâche » / « Cette tâche est abandonnée, mais {n} sous-tâche(s) {est/sont} à faire. Rien n'a été modifié. » (v0.2.20 : aucun objectif nommé, quel que soit leur nombre ; une tâche abandonnée ne compte pas dans l'atteinte, RG-025) | Même gabarit ; « Reprendre la tâche » (principal), « Terminer la sous-tâche », « Abandonner la sous-tâche » ; **texte nouveau, sans cadre dédié (même gabarit que ECR-007 H)** |
| `ALR-005` | Attention | Délai d'une tâche postérieur à celui de son objectif (RG-024, US-002 CA-7) | En liste : « {date} · après le délai de l'objectif » ; en détail : « Après le délai de l'objectif ({date}) » | Triangle + texte, jamais bloquant ; aucune alerte si l'un des deux délais manque |
| `ALR-006` | Attention | Délai d'une sous-tâche postérieur à celui de la tâche parente (RG-024) | « {date} · après le délai de la tâche » | idem |
| `ALR-007` | Attention | Délai d'un sous-objectif postérieur à celui de l'objectif parent (US-023 CA-4, **LOT-001**). Aucune alerte si l'un des deux délais manque ; recalculée dès que l'un des deux change | **En liste** (ECR-008 A, ligne du sous-objectif ; détail du parent, ligne du sous-objectif) : « {date} · après « {parent} » ». **Variante détail** (v0.2.18, ECR-003 E, détail du sous-objectif lui-même) : titre « Délai postérieur à celui du parent » / « Le délai de ce sous-objectif ({date}) est après celui de « {parent} » ({date}). Rien n'est bloqué. » | En liste : triangle + texte, jamais bloquant. Variante détail : carte niveau Attention sous l'en-tête, `role="status"`, non fermable (disparaît avec l'écart) ; une seule action, secondaire : « Changer le délai » (même libellé et même feuille que l'entrée du menu « … », `MODIFIER_DELAI`). Même code dans les deux formes ; `data-variante="detail"` distingue la carte |
| `ALR-008` | Information | Cet appareil découvre le choix « repartir de zéro » fait ailleurs (RG-044 b) | « Vos données ont été effacées » / « Vous avez choisi de repartir de zéro sur votre {appareil}. {n} modification(s) faites ici avant ce choix n'ont pas été conservées. » **(v0.2.20, Q-ST017-STE-2 b)** `{appareil}` = l'autre appareil (le choix est toujours fait ailleurs) : `autreAppareil` de l'appareil courant, comme `{autre appareil}` d'`ERR-015` | Carte dans la feuille, en tête de la section « À lire ». Contenu, dans l'ordre : titre, texte, `Disclosure` `SEC-MODIFS-EFFACEES` repliée qui contient la liste (`<ul>`) des lignes `ALR-014`, puis **un seul** « Compris » (nom accessible « Compris : vos données ont été effacées ») qui retire la carte et toutes ses lignes |
| `ALR-015` | Attention | Persistance du stockage refusée ou indisponible (R15, Q-ST018-STE-1, v0.2.12) | Titre : « Vos données ne sont pas protégées » / « Vos données ne sont pas protégées contre un nettoyage du navigateur. Installez l'application et gardez-la sur l'écran d'accueil. » | Carte dans la feuille seulement, **aucun bandeau, aucun point sur l'indicateur, jamais de blocage** ; non fermable tant que l'état dure ; disparaît quand le stockage est protégé |
| `ALR-014` | Information | Modification perdue par « repartir de zéro », une ligne par modification (v0.2.7, Q-US-017-8 a, S21) | **(v0.2.20, Q-ST017-STE-2)** Titre : « {Information} de « {élément} » » / « Votre valeur « {valeur} » n'a pas été conservée. » `{Information}` : titre du `TXT-INF-` ; `{valeur}` : §6.6.12. Ni appareil (toujours cet appareil, déjà dit par la carte : « faites ici ») ni heure ; « les données ont été effacées » n'est pas répété sous la carte qui le dit (valeur conservée, pour les tests seulement : `TXT-VAL-DONNEES-EFFACEES`) | `DiscardedItem` sans action, groupés **sous la carte `ALR-008`** (repliés par `SEC-MODIFS-EFFACEES`) ; pas d'action « Voir » (l'élément n'existe plus) ; un seul « Compris », celui de la carte, les retire toutes. **Non comptées** dans `data-a-lire` (RG-056 ne vise que RG-036, 047, 048) |
| `ALR-009` | Information | Valeur écartée par la règle de conflit (RG-036) | **(v0.2.20, Q-ST017-STE-2 et 3)** Titre : « {Information} de « {élément} » » / « Votre valeur « {valeur} » n'a pas été retenue. Valeur conservée : « {valeurConservee} ». » `{Information}` : titre du `TXT-INF-` ; `{valeur}`, `{valeurConservee}` : §6.6.12 (une valeur d'état porte sa date : « Votre valeur « terminée le 22 oct. » n'a pas été retenue. Valeur conservée : « terminée le 24 oct. ». ») | `DiscardedItem` ; « Voir la tâche » (`TXT-VOIR-TACHE`, tâche ou sous-tâche, et lien vers un objectif : l'élément est la tâche) ou « Voir l'objectif » (`TXT-VOIR-OBJECTIF`), si l'élément existe, puis « Compris » (partie `action`) ; `SYN-INFO` jusqu'à « Compris » (Q-ERG-14) |
| `ALR-010` | Information | Suppression qui l'emporte (RG-047). **(v0.2.8, DEC-030, Q-US-001-1 a)** Deux variantes pour le rattachement et le placement non retenus, choisies par la colonne `information` : `objectifs` → `rattachement` ; `parent` → `placement`. **(v0.2.20, Q-ST017-STE-2 d)** Variante `sous-tache` : création d'une sous-tâche sous une tâche supprimée (information `création`, valeur conservée « supprimée avec la tâche … », US-024 S22) ; choisie avant `tache` | **Générique** (valeur modifiée sur un élément supprimé ; élément = l'élément supprimé) : « Objectif « {élément} » supprimé » / « Votre modification de {information} n'a pas été conservée. » ; variante `tache` : « Tâche « {élément} » supprimée » / même texte. `{information}` : forme « dans une phrase » du `TXT-INF-` (« son délai », « sa description »). **Variante `rattachement`** (tâche rattachée à un objectif supprimé ; élément = la tâche ; valeur non retenue = « {objectif} » ; valeur conservée = « objectif supprimé ») : titre « Rattachement non retenu, objectif supprimé » (libellé de CA-10, initiale en majuscule à l'affichage), sous-titre « Tâche « {élément} » » / « Votre rattachement à « {objectif} » n'a pas été conservé : l'objectif a été supprimé. » **Variante `placement`** (sous-objectif créé ou placé sous un objectif supprimé ; élément = le sous-objectif ; valeur non retenue = « sous « {objectif} » » ; valeur conservée = « objectif supprimé ») : titre « Placement non retenu, objectif supprimé » (libellé de CA-10, idem), sous-titre « Objectif « {élément} » » / « Votre placement sous « {objectif} » n'a pas été conservé. « {élément} » est devenu objectif principal. » **Variante `sous-tache`** (élément = la sous-tâche) : « Sous-tâche « {élément} » supprimée » / « Sa tâche « {tache} » a été supprimée. Votre sous-tâche n'a pas été conservée. » (`{tache}` = intitulé porté par la valeur conservée) | `DiscardedItem` ; « Compris » (partie `action`, toutes variantes) ; variante `rattachement` : « Voir la tâche » (`TXT-VOIR-TACHE`) ; variante `placement` : « Voir l'objectif » (`TXT-VOIR-OBJECTIF`) (l'élément existe dans les deux cas, §4.24) ; générique, `tache` et `sous-tache` : pas de « Voir » (l'élément n'existe plus). (v0.2.20) La phrase « La tâche n'est rattachée à aucun objectif » est retirée : elle est fausse quand la tâche a d'autres objectifs |
| `ALR-011` | Information | Déplacement annulé (RG-048) | **(v0.2.20, Q-ST017-STE-2 e)** « Placement de « {élément} » annulé » / « Votre placement sous « {parent} » a été annulé : un déplacement plus récent place « {parent} » sous « {élément} ». Les deux ne peuvent pas coexister. » Deux variables distinctes : `{élément}` = l'objectif dont le placement est annulé (titre et texte) ; `{parent}` = l'objectif sous lequel il avait été placé (intitulé courant porté par la valeur non retenue « sous … »). « Sous » vaut directement ou indirectement : la phrase reste vraie pour une boucle de plus de deux objectifs | `DiscardedItem` ; « Voir l'objectif » (`TXT-VOIR-OBJECTIF`) puis « Compris » (partie `action`, v0.2.20 : « Voir l'objectif » n'est plus la partie `action`) |
| `ALR-012` | Information | Première sous-tâche ajoutée à une tâche qui a une estimation (US-024 CA-5) | « L'estimation de la tâche ({durée}) sera remplacée par la somme de ses sous-tâches. » | Message avant l'enregistrement, dans la saisie rapide |
| `ALR-013` | Information | « Terminer la tâche » indisponible tant qu'il reste des sous-tâches à faire (US-003 CA-8, US-024 CA-8) | « Il reste {n} sous-tâche(s) à terminer ou abandonner. » | Au-dessus du bouton, `role="status"`, lié par `aria-describedby` ; bouton `aria-disabled="true"` |

#### 6.6.10 Table de correspondance « motif des scénarios → code » (ANT-21)

Liste exhaustive des motifs en texte libre relevés dans `tests/features/*.feature` (formulations « est refusé(e) avec le motif », « échoue avec le motif »). Pepper remplace chaque motif par le code ; un test vérifie `data-message` (et, si utile, le texte exact du catalogue).

| Motif utilisé dans les scénarios | Code | Observé | Scénarios |
|---|---|---|---|
| « intitulé manquant » | `ERR-020` | Texte « Indiquez un intitulé. » | US-001 S04, US-002 S04 |
| « délai manquant » | `ERR-021` | « Indiquez un délai. » | US-002 S03, US-024 S03 |
| « estimation manquante » | `ERR-022` | « Indiquez une estimation. » | US-002 S03, US-024 S03 |
| « délai manquant, estimation manquante » | `ERR-021` **et** `ERR-022` (cumulés, dans cet ordre) | Les deux textes affichés ensemble | US-002 S03 |
| « estimation invalide » (0 h, ou non multiple de 30 min) | `ERR-023` (**nouveau**) | « Indiquez une estimation de 30 min au minimum, par pas de 30 min. » | US-002 S05b, US-024 S03 |
| « estimation calculée à partir des sous-tâches » | `ERR-033` (**nouveau**) | texte d'`ERR-033` | US-002 S13, US-024 S06, S16b |
| « objectifs hérités de la tâche parente » | `ERR-034` (**nouveau**) | texte d'`ERR-034` | US-024 S14 |
| « 2 sous-tâches restantes » (n variable) | `ERR-035` (**nouveau**) ; texte identique à `ALR-013` | « Il reste 2 sous-tâches à terminer ou abandonner. » | US-003 S12, US-024 S15 |
| « tâche abandonnée » | `ERR-032` (**nouveau**) | texte d'`ERR-032` | US-024 S18 |
| « un seul niveau de sous-objectifs » | `ERR-030` (variante `cible-est-sous-objectif` pour S11 ; `objectif-a-des-sous-objectifs` pour S10, objectif déplacé qui a déjà des sous-objectifs) | texte d'`ERR-030` | US-023 S10 et S11 |
| « objectif placé sous lui-même » | `ERR-031` | « Un objectif ne peut pas être placé sous lui-même » | US-023 S11 |
| « réseau nécessaire pour la première connexion » / « connexion interrompue » / « Drive indisponible pour ce compte » / « réseau nécessaire pour se connecter » | `ERR-003` / `ERR-005` / `ERR-006` / `ERR-004` | voir §6.6.8 | US-022 S18, S20 à S22, US-018 |
| « annule la connexion » / « refuse les autorisations demandées » | `ERR-001` / `ERR-002` | voir §6.6.8 | US-022 S06 |

Les scénarios qui citent déjà `ERR-011`, `ERR-012`, `ERR-003` à `ERR-006` et `ALR-001` (US-017, US-018, US-022) sont conformes au catalogue. Un refus nouveau qui n'est pas dans cette table reçoit un code du catalogue **avant** d'être écrit dans un scénario.

**Format des motifs variantés (v0.2.5).** Quand un code a des variantes (`ERR-030`), le motif s'écrit en une seule chaîne, `"ERR-030 variante <variante>"`, où `<variante>` reprend exactement la valeur de `data-variante` : par exemple `"ERR-030 variante cible-est-sous-objectif"` (US-023 S11) ou `"ERR-030 variante objectif-a-des-sous-objectifs"` (US-023 S10). Le test vérifie alors `data-message="ERR-030"` et `data-variante`. Ce format est celui du glossaire d'étapes (`tests/features/GLOSSAIRE-ETAPES.md`, §9).

**Forme de `MEN-HEURE-PARIS` accompagnant une date de fin (US-003 S21).**
- *Élément* : la puce est un élément distinct (`data-etat="MEN-HEURE-PARIS"`), placé **immédiatement après** la date de fin sur la même ligne, dans le détail de la tâche (« Terminée le 11 nov. » puis la puce « Heure de Paris »). Idem pour « Abandonnée le {date} ». La date porte `aria-describedby` vers la puce.
- *Présence* : l'élément existe dans le DOM si et seulement si le fuseau de l'appareil diffère d'`Europe/Paris` ; avec `Europe/Paris`, il est absent (pas masqué). Le fuseau « America/New_York » du scénario donne donc « est accompagnée ».
- *Date affichée* : toujours le jour de Paris (RG-053), jamais le jour de l'appareil.
- *Jamais sur un délai* : aucun élément `MEN-HEURE-PARIS` dans la ligne « Délai », ni dans les puces de délai de la liste (S21, 2e assertion).
- *Dans les listes* : la liste affiche « Terminée » sans date ; la puce n'y accompagne donc pas la date de fin ; elle reste dans le sous-titre de la vue (§4.21).

**Réserves de ce catalogue.**
- **Décisions DEC-025 (2026-10-21)** : Q-ERG-16 b (point de départ des 24 h : plus ancienne modification en attente), Q-ERG-17 a (un seul bandeau « Se reconnecter » en cas d'accès perdu, variante `24H`), Q-ERG-18 a (réapparition du rappel fermé à la prochaine ouverture, tant que des modifications sont en attente). Le déclencheur de `BAN-RAPPEL-24H` et de la variante `24H` est donc fixé ; aucune entrée du catalogue ne reste « sous réserve ».
- Le seuil exact de l'horloge déréglée (`ALR-001`) est une règle métier que Pepper fixe en CA numéroté (ANT-4, BEN-12) : le libellé « plus de 24 h » est repris tel quel de la maquette et sera aligné.
- Les noms d'attribut (`data-etat`, `data-message`) et l'ordre de gravité des états de l'indicateur sont des propositions de conception, à confirmer par Anthony en E9 et par le commanditaire si l'ordre de gravité l'intéresse.

#### 6.6.11 Réponses de Steeve aux demandes de précision d'Anthony (E8, v0.2.7)

| Q-US | Réponse | Où |
|---|---|---|
| Q-ST017-STE-2 (E10 du rang 9, v0.2.20) | a) noms d'information `TXT-INF-` (titre et forme « dans une phrase » ; `objectifs` → « Rattachement », `parent` → « Placement ») ; b) **ni appareil ni heure sur les lignes** (données sans nom d'appareil ; CA-8 et RG-056 satisfaits sans eux) ; `{appareil}` d'`ALR-008` = l'autre appareil ; c) `TXT-VOIR-TACHE`, `TXT-VOIR-OBJECTIF`, partie `action` = « Compris » pour `ALR-009` à `ALR-011` ; d) variante `sous-tache` d'`ALR-010` (option 1) ; e) `ALR-011` : `{élément}` et `{parent}` (option ★, texte recentré sur la valeur de l'utilisateur) ; f) valeurs `TXT-VAL-` ; carte `ALR-008` : `SEC-MODIFS-EFFACEES` ; `ALR-014` : valeur sans heure | §4.24, §6.6.4, §6.6.9, §6.6.12, ECR-011 C et G |
| Q-ST017-STE-3 (v0.2.20) | Option 1 ★ : « terminée le 22 oct. », « abandonnée le 22 oct. », « à faire » (`TXT-VAL-ETAT`), date courte de §6.6.1 | §6.6.12 |
| Q-ST017-D2-1 (v0.2.20) | `ALR-003` : variantes `sans-objectif` (dernière phrase retirée) et `objectifs` (« les objectifs « A » et « B » ne sont pas atteints », CA-12) ; `ALR-004` inchangé (aucun objectif nommé) | §6.6.9, ECR-007 H |
| Q-US-002-1 | Filtre par défaut « À faire » ; valeurs `à faire`, `terminée`, `abandonnée`, pas de « tous » ; tri par délai, puis création, puis intitulé ; terminées par date de fin décroissante ; sous-tâches jamais listées | §5.7, ECR-002 L1, L4, L5 |
| Q-US-017-6 | Option a), sans modifier RG-056 : le point « à lire » est un signal indépendant (`data-a-lire`), présent dans tous les états ; `SYN-INFO` devient un code dérivé de `SYN-OK` | §4.8, §6.5, §6.6.2, ECR-011 M |
| Q-US-018-1 | Option a) : nombre d'éléments distincts portant `MEN-ATTENTE` (exemple : n = 2). Aucun journal d'opérations. Départ des 24 h : première écriture locale non déposée, tous éléments | §6.6.1, ECR-011 M |
| RL-LOT-001-A1 (E11, v0.2.15, corrigé v0.2.17) | `ERR-017` avec « Réessayer » et « Aller à la connexion » (suppression engagée, non annulable) ; écran d'attente limité à 10 s (S6) | §6.6.8, §6.6.2 |
| Q-ST022-STE-4 (E11, v0.2.14) | a) toast `TST-SAISIE-A-TERMINER` : le geste est refusé sans rien perdre, le message dit quoi faire ; pas de confirmation « abandonner la saisie » (b) : on ne propose pas de détruire une saisie pour une tâche technique | §6.6.6 |
| Q-ST031-PEP-1 (E9, v0.2.13) | Confirmé : les autres onglets se rechargent sur l'écran de connexion (ECR-010) **sans message, ni toast ni bandeau**. Besoin : l'utilisateur vient de demander lui-même la fin de session, l'écran de connexion est le résultat attendu ; un message ajouterait du bruit à un geste volontaire. Pas de code de catalogue | §6.6.11, ECR-010 |
| Q-ST022-STE-1 (E9, v0.2.12) | Code `SYN-REDIRECTION`, « Connexion à Google… », logo, sans action | §6.6.2, ECR-010 (cadre Attente) |
| Q-ST022-STE-2 | Oui : `SYN-SESSION`, `ERR-015` et variante `session` valables sur smartphone ; `{appareil}` / `{autre appareil}` ; titre d'`ERR-015` « de cet appareil » | §6.6.2, §6.6.3, §6.6.8 |
| Q-ST022-STE-3 | b) : `SYN-HORS-LIGNE` tant que le réseau est coupé, `SYN-SESSION` au retour | §6.6.2 |
| Q-ST018-STE-1 | `SYN-FEUILLE-STOCKAGE` (ligne toujours présente) et `ALR-015` (carte, jamais bloquante) | §6.6.2, §6.6.9 |
| Q-US-002-4 (E9, v0.2.10) | Option a) : aucune ligne de sous-tâche sous une tâche terminée ou abandonnée, compteur « t / n » seul ; sous-tâches visibles sous les tâches à faire uniquement | §5.8 (d), ECR-003 |
| Q-US-001-6 (E9, v0.2.9) | (a) oui ; (b) non à la ★ : section repliée « Atteints (n) » conservée ; (c) oui ; (d) oui ; (e) oui | §5.8, §6.6.4 (`SEC-`), ECR-008 |
| Q-US-003-1 | Option a) : « Annuler » = réouverture (fin puis réouverture dans l'historique) ; l'écriture locale immédiate sert ENF-T-07 et la saisie hors ligne. Pepper peut ignorer la paire fin/réouverture rapprochée dans la vélocité | §6.6.6 |
| Q-US-017-8 | Oui, code créé : `ALR-014`, sous la carte `ALR-008`, non compté dans le point « à lire » | §6.6.9 |
| Q-US-017-10 | (a) Sur PC, « Mettre à jour » active la version en attente puis recharge ; la phrase « L'application va se recharger. Vos modifications sont conservées. » précède le rechargement. (b) **Non** : la version de schéma n'est affichée ni dans le bandeau ni dans la carte (l'utilisateur agit de la même façon quelle que soit la version) ; le DAT est à aligner sur `BAN-CONSULTATION-SEULE` | §6.6.3 |
| Q-US-017-11 | (a) Feuille seulement : après « Décider plus tard », le choix n'est pas reproposé ; `SYN-ACTION` reste visible. (b) « Restaurer » sans réseau : **mémorisé** et exécuté au retour du réseau, avec la mention « Restauration demandée. Elle sera faite au retour du réseau. » et un lien « Annuler la demande ». « Repartir de zéro » **n'est pas mémorisé** : action destructrice, `aria-disabled` hors ligne avec « Disponible au retour du réseau. » | §6.6.8 (`ERR-012`) |
| Q-US-017-12 | (a) Code créé : `ERR-016`. (b) Oui, les tentatives continuent après `SYN-ACTION` | §6.6.8 |
| Q-US-022-2 | a) `ERR-005` ; `ERR-006` reste réservé au Drive désactivé ou refusé | §6.6.8 |
| Q-US-022-4 | Oui : dépôt tenté d'abord (bouton en cours) ; `CNF-DECONNEXION` seulement s'il reste des modifications, avec leur nombre à jour | §6.6.7 |
| Q-US-023-1 | Ordre proposé validé | §4.28 |
| Q-US-031-2 | a) Oui : `BAN-RAPPEL-24H` variante `session` avec l'action « Reprendre la synchronisation » ; le catalogue est corrigé | §6.6.3 |

**Question pour le commanditaire : aucune.** Aucune réponse ci-dessus ne modifie une règle validée : RG-056 est tenue telle quelle, le décompte est une précision d'affichage, la variante `session` applique RG-057 (« quel que soit l'état ») sans l'étendre.


#### 6.6.12 Fragments de texte partagés (`TXT-`, v0.2.20, Q-ST017-STE-2 et 3)

Ces textes ne s'affichent jamais seuls : ils remplissent une variable d'un autre code (`{Information}`, `{information}`, `{valeur}`, `{valeurConservee}`) ou nomment une action commune à plusieurs codes. Ils ont un code pour que le texte vienne du catalogue et non du code applicatif. Justification commune : l'utilisateur doit reconnaître sa saisie en un coup d'œil (CA-8, RG-056) ; on emploie donc les mots de l'écran de détail, jamais ceux du modèle de données.

**Noms d'information** (colonne `information` du glossaire d'étapes §8). Partie `libelle` : titre d'`ALR-009` et d'`ALR-014` (« {Information} de « {élément} » ») ; partie `texte` : `{information}` d'`ALR-010` générique.

| Code | Information | Titre (`libelle`) | Dans une phrase (`texte`) |
|---|---|---|---|
| `TXT-INF-INTITULE` | intitulé | « Intitulé » | « son intitulé » |
| `TXT-INF-DESCRIPTION` | description | « Description » | « sa description » |
| `TXT-INF-DELAI` | délai | « Délai » | « son délai » |
| `TXT-INF-ESTIMATION` | estimation | « Estimation » | « son estimation » |
| `TXT-INF-OBJECTIFS` | objectifs | « Rattachement » (une ligne porte sur un seul lien entre la tâche et un objectif : « Objectifs » laisserait croire que toute la liste a changé ; même mot que la variante `rattachement` d'`ALR-010`) | « son rattachement » |
| `TXT-INF-PARENT` | parent | « Placement » (mot de la variante `placement` d'`ALR-010` et d'`ALR-011`) | « son placement » |
| `TXT-INF-ETAT` | état | « État » | « son état » |
| `TXT-INF-CREATION` | création | « Création » | « sa création » |

**Valeurs signalées** (`{valeur}`, `{valeurConservee}` ; colonnes « valeur non retenue » et « valeur conservée » du glossaire d'étapes §8). Le gabarit qui les reçoit les encadre déjà de « » : un intitulé cité **dans** une valeur prend donc les guillemets de second niveau “ ” (typographie française des citations imbriquées), jamais « » imbriqués. Valeurs sans code : texte saisi tel quel (description : retours à la ligne remplacés par une espace, coupée à 80 caractères suivis de « … », le reste se lit avec « Voir la tâche ») ; date au format de §6.6.1 (« 22 oct. », année seulement si elle diffère de l'année en cours) ; durée au format de §8 (« 1 h 30 »).

| Code | Valeur | Texte exact | Où |
|---|---|---|---|
| `TXT-VAL-AUCUNE` | Description ou délai vides | « aucune description » ; variante `delai` : « sans délai » (mot de `MEN-SANS-DELAI`) | `ALR-009`, `ALR-014` |
| `TXT-VAL-ETAT` | État d'une tâche ou d'une sous-tâche (**Q-ST017-STE-3**, RG-056, ST-US-017 règle n° 12) | Variante `A_FAIRE` : « à faire » ; `TERMINEE` : « terminée le {date} » ; `ABANDONNEE` : « abandonnée le {date} ». `{date}` = date de fin ou d'abandon, format de §6.6.1. Justification : deux fins à des dates différentes sont signalées (US-017 CA-8) et doivent se distinguer (« terminée le 22 oct. » contre « terminée le 24 oct. »), jamais « terminée / terminée » | `ALR-009`, `ALR-014` |
| `TXT-VAL-SOUS` | Placement sous un objectif | « sous “{objectif}” » | `ALR-009`, `ALR-014` |
| `TXT-VAL-PRINCIPAL` | Objectif sans parent | « objectif principal » | `ALR-009`, `ALR-014` |
| `TXT-VAL-RATTACHEE` | Lien actif | « rattachée à “{objectif}” » | `ALR-009`, `ALR-014` |
| `TXT-VAL-DETACHEE` | Lien inactif | « détachée de “{objectif}” » | `ALR-009`, `ALR-014` |
| `TXT-VAL-SOUS-TACHE-DE` | Création d'une sous-tâche | « sous-tâche de “{tache}” » | Valeur non retenue de la variante `sous-tache` d'`ALR-010` (non affichée dans son texte ; exposée pour les tests) |
| `TXT-VAL-CREEE` | Création d'une tâche ou d'un objectif | « création » | Idem (exposée pour les tests) |
| `TXT-VAL-TACHE-SUPPRIMEE` | Valeur conservée d'`ALR-010` (tâche) | « tâche supprimée » | Exposée pour les tests (le titre le dit déjà) |
| `TXT-VAL-OBJECTIF-SUPPRIME` | Valeur conservée d'`ALR-010` (objectif, `rattachement`, `placement`) | « objectif supprimé » | Idem |
| `TXT-VAL-SUPPRIMEE-AVEC` | Valeur conservée de la variante `sous-tache` | « supprimée avec la tâche “{tache}” » | Idem |
| `TXT-VAL-PLACEMENT-ANNULE` | Valeur conservée d'`ALR-011` | « placement annulé » | Idem |
| `TXT-VAL-DONNEES-EFFACEES` | Valeur conservée d'`ALR-014` | « données effacées (repartir de zéro) » | Idem |

**Actions communes** des lignes de la section « À lire » (`ALR-009`, `ALR-010` variantes `rattachement` et `placement`, `ALR-011`), affichées avant « Compris » quand l'élément existe :

| Code | Texte exact | Quand | Nom accessible |
|---|---|---|---|
| `TXT-VOIR-TACHE` | « Voir la tâche » | L'élément à ouvrir est une tâche ou une sous-tâche | « Voir la tâche : » + titre de la ligne, première lettre en minuscule |
| `TXT-VOIR-OBJECTIF` | « Voir l'objectif » | L'élément à ouvrir est un objectif | « Voir l'objectif : » + titre, idem |

**Constantes provisoires à remplacer (Benjamin, tranche D3 ; même commit que l'ajout des 24 codes `TXT-` et `SEC-MODIFS-EFFACEES` à `codes.ts` et `catalogue.fr.ts`, sans quoi `verifier:catalogue` échoue)** :
- `src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues.ts` : `NOMS_INFORMATION` (`TODO(Q-ST017-STE-2 a)`) → `TXT-INF-*` (partie `libelle` pour `ALR-009` et `ALR-014`, partie `texte` pour `{information}` d'`ALR-010`) ; `texteDonneesEffacees`, `appareil: 'appareil'` (`TODO(Q-ST017-STE-2 b)`) → `autreAppareil(appareil courant)` ; `libelleVoir`, chaînes « Voir la tâche » / « Voir l'objectif » (`TODO(Q-ST017-STE-2 c)`) → `TXT-VOIR-TACHE` / `TXT-VOIR-OBJECTIF` pour toutes les lignes, y compris `ALR-010` `rattachement` et `placement` et `ALR-011` (leur partie `action` devient « Compris ») ; `varianteDe` et le type `variante` : ajouter `sous-tache` (information `CREATION` et valeur conservée `SUPPRIMEE_AVEC`), testée avant `tache` ; formatage de `valeurNonRetenue` et `valeurConservee` → `TXT-VAL-*` (Q-ST017-STE-2 f, Q-ST017-STE-3).
- `src/commun/presentation/messages/catalogue.fr.ts` : textes d'`ALR-003` (variantes `sans-objectif`, `objectifs`), `ALR-009` (sans `{appareil}` ni `{heure}`), `ALR-010` (générique, `tache`, `rattachement`, `placement`, `sous-tache` ; parties `action` = « Compris »), `ALR-011` (`{element}`, `{parent}` ; `action` = « Compris »), `ALR-014`, selon §6.6.9.
- `src/objectifs-taches/presentation/modeles-de-vue/detail-tache.ts` : `incoherenceDeCarte`, `element = intitulesObjectifs.join(', ')` (`TODO(Q-ST017-D2-1)`) → `ALR-003` sans variante (1 objectif, `{element}`), `sans-objectif` (0), `objectifs` (2 et plus, `{objectifs}`) ; `ALR-004` sans variable d'objectif.

---

## 7. Alertes et propositions

### 7.1 Niveaux
| Niveau | Couleur | Icône | Exemples | Où |
|---|---|---|---|---|
| **Information** | accent | étincelle ou i | Planning proposé, ré-estimation de capacité proposée (US-026), modification écartée par conflit | Carte « À traiter » |
| **Attention** | warning | triangle | Dépassement de capacité (RG-011), délai de tâche postérieur à celui de l'objectif (RG-024), estimation dépassée (RG-009), créneau déplacé dans Google (RG-037) | En ligne sur l'élément concerné ; carte si une décision est attendue |
| **Critique** | danger | cercle ! | Délai non tenable (RG-007), tâche en retard, accès Google perdu | Carte « À traiter » en tête ; bandeau pour l'accès Google |

### 7.2 Où apparaissent-elles
1. **Sur l'élément** (ligne de tâche, jauge, en-tête d'objectif) : toujours, de façon compacte (icône + mot).
2. **Section « À traiter »** en haut d'Aujourd'hui : uniquement ce qui demande une **décision**. 2 cartes visibles au maximum, puis « Voir les 3 autres ». La section disparaît quand elle est vide.
3. **Bilan du soir** : les propositions de replanification (RG-037) y sont regroupées dans une étape dédiée.
4. **Rappels Google** (8 h et 21 h) : les alertes de délai non tenable y figurent en texte (RG-007). Le contenu des rappels relève de Pepper ; la forme du texte suivra les règles du §8.

### 7.3 Anatomie d'une proposition
```
[icône niveau]  Titre : ce qui se passe, en 6 mots maximum
Pourquoi : une phrase chiffrée.
[ChangePreview]  valeur actuelle → valeur proposée
[ Accepter ]   Modifier   Refuser
```
- **Accepter** (principal) : applique la proposition, toast « Annuler ».
- **Modifier** (tertiaire) : ouvre le sélecteur pré-rempli avec la valeur proposée (date, jour, durée) ; l'utilisateur ajuste puis valide.
- **Refuser** (tertiaire) : ferme la carte, toast « Proposition refusée · Annuler ». **(v0.2, Q-ERG-07, RG-052)** Refuser ne traite pas l'alerte : tant que sa cause persiste, la carte est **réaffichée chaque jour**. L'icône d'attention reste sur l'élément. Exception : refuser la replanification d'un créneau déplacé la traite (§7.5).
- Jamais de proposition appliquée automatiquement (CdC §4.3).

### 7.4 Propositions types
| Proposition | Titre | Pourquoi (exemple) | Comparatif | US / RG |
|---|---|---|---|---|
| Nouveau délai | « Délai difficile à tenir » | « À votre rythme moyen (9 h/sem.), il faut encore 2 semaines. » | Délai 31 oct. → 7 nov. | US-007, US-011, RG-007 |
| Nouveau planning | « Planning à revoir pour tenir le délai » | « 6 h à placer avant le 31 oct., 3 h libres. » | Liste des tâches déplacées, jour avant → jour après | US-011, RG-007 |
| Replanification après créneau déplacé | « Créneau déplacé dans votre agenda » | « Vous avez déplacé "Rédiger l'introduction" de mardi à jeudi dans Google Agenda. » | Jour mar. 21 → jeu. 23 | US-032, RG-037 |
| Ré-estimation de capacité | « Ajuster votre capacité du lundi ? » | « Vous avez travaillé en moyenne 3 h les 4 derniers lundis. » | 4 h → 3 h | US-026, RG-011 |
| Ré-estimation d'une tâche | « Estimation dépassée » | « 4 h passées pour 3 h estimées. » | Reste à faire : 0 → saisir | US-009, RG-009 |
| Rappels modifiés dans Google | « Rappels modifiés dans votre agenda » | « Le rappel de 21 h a été supprimé dans Google Agenda. » | Rétablir les rappels à 8 h et 21 h | US-014, US-029 (DAT R7) |
| Planning de la semaine | « Planning proposé » | « 11 tâches placées selon vos priorités et votre capacité. » | Vue Semaine, éléments marqués « Proposé » | US-027, RG-031 |

### 7.5 Créneau déplacé : traitement immédiat ou le soir (RG-037, v0.2)
1. **Au moment où l'application détecte le déplacement** (à l'ouverture ou pendant l'utilisation ; jamais en temps réel, DEC-007, DEC-014) : une carte d'attention « Créneau déplacé dans votre agenda » apparaît dans « À traiter ». Action principale **« Traiter maintenant »** (Q-ERG-05 « oui »), qui ouvre la proposition en feuille ; lien tertiaire « Voir dans l'agenda ».
2. **Sinon le soir** : la proposition est présentée dans l'étape « Propositions » du bilan du soir, avec Accepter / Modifier / Refuser, puis réaffichée chaque jour tant qu'elle n'est pas traitée (RG-052).
3. **Accepter** replanifie ; **Modifier** ouvre le choix du jour ; **Refuser** (Q-ERG-11 a) **supprime le créneau de l'agenda Google et déplanifie la tâche**. La conséquence est écrite sous les boutons de la proposition (« Refuser supprime le créneau de votre agenda et retire la tâche du planning ») et reprise dans le toast : « Créneau supprimé de votre agenda · Tâche non planifiée · Annuler ». Refuser traite l'alerte.

Le moment exact de la proposition du soir dépend encore de Q-DEM001-33.1 (lot « Agenda »).

### 7.6 Ordre de « Aujourd'hui » (v0.2, RG-051, Q-ERG-06)
Les tâches du jour sont présentées **par priorité** (RG-005), pas par horaire. L'horaire suggéré reste affiché en tête de métadonnées ; il n'est donc pas croissant dans la liste. Une tâche en retard passe en tête.

### 7.7 Fun fact du matin (v0.2, RG-040, Q-ERG-02)
Une ligne discrète en fin d'« Aujourd'hui », jusqu'à midi, avec une croix « Masquer » (toast « Annuler »). Le masquage vaut pour la journée (proposition à valider avec US-035). Il reste affiché un jour sans tâche planifiée.

### 7.8 Bilan du soir accessible plus tôt (v0.2, RG-039, Q-ERG-04)
La carte « Bilan du soir » apparaît **avant l'heure du rappel du soir** (dès 17 h : valeur de conception de Steeve, RG-039 ne fixe pas d'heure) et le lendemain pour la veille non faite.

---

## 8. Rédaction de l'interface

- **Vouvoiement**, phrases courtes, verbes d'action sur les boutons (« Ajouter », « Planifier », « Valider mon bilan »).
- Durées : « 30 min », « 1 h », « 1 h 30 » (espace insécable entre le nombre et l'unité). Jamais « 1,5 h ».
- Dates : relatives quand c'est plus clair (« Aujourd'hui », « Demain », « Jeudi »), sinon « 31 oct. » ; l'année seulement si elle diffère de l'année en cours.
- Jamais de jargon technique (« sync », « token », « OAuth », « 409 »). On dit « enregistré dans votre espace », « votre agenda Google ».
- **(v0.2)** Vocabulaire des données : « votre Google Drive » (jamais « le cloud »), « cet appareil », « votre autre appareil », « votre smartphone », « votre PC ». « Se déconnecter » ne dit jamais « effacer ». « Supprimer les données de cet appareil » dit toujours que le Drive est préservé. « Modification non retenue » (jamais « conflit » ni « écrasée »). « Repartir de zéro » est réservé à RG-044.
- **(v0.2)** Un message de perte potentielle donne **le nombre** (« 3 modifications ») et nomme l'élément (« Rédiger le plan »).
- Les termes du glossaire du cahier des charges sont utilisés tels quels à l'écran : objectif, sous-objectif, tâche, sous-tâche, délai, estimation, reste à faire, temps passé, capacité, vélocité (« rythme » en texte d'aide), backlog (affiché « Travail restant » ou « À planifier » selon Q-DEM001-36 : le terme anglais n'apparaît pas à l'écran).

---

## 9. Accessibilité (WCAG 2.2 AA)

Engagement : **WCAG 2.2 niveau AA** sur smartphone et sur PC, en mode clair et en mode sombre.

| Critère | Règle appliquée |
|---|---|
| 1.1.1 Contenu non textuel | Toute icône informative a un nom accessible ; icônes décoratives masquées. |
| 1.3.1 Information et relations | Listes de tâches en listes sémantiques ; titres hiérarchisés (un `h1` par vue) ; formulaires avec libellés associés. |
| 1.3.4 Orientation | Portrait et paysage pris en charge sur smartphone. |
| 1.4.1 Utilisation de la couleur | Chaque état coloré est doublé d'une icône et d'un texte (retard, dépassement, proposé). |
| 1.4.3 / 1.4.11 Contrastes | Texte ≥ 4,5:1, composants d'interface et anneau de focus ≥ 3:1 : vérifié pour les tokens (§3.1). |
| 1.4.4 / 1.4.10 Agrandissement, reflow | Texte à 200 % sans perte ; affichage sur une colonne à 320 px de large sans défilement horizontal. |
| 1.4.12 Espacement du texte | Aucun conteneur à hauteur fixe pour du texte. |
| 1.4.13 Contenu au survol | Info-bulles fermables (Échap), persistantes au survol. |
| 2.1.1 / 2.1.2 Clavier | Tout est utilisable au clavier, y compris la réorganisation et la planification (alternatives au glisser-déposer). Pas de piège, sauf focus volontairement contenu dans une feuille modale (Échap pour sortir). |
| 2.1.4 Raccourcis à une touche | Désactivables dans les réglages, inactifs dans les champs. |
| 2.2.1 Délais | Toasts avec action : 6 s minimum, mis en pause au survol et au focus ; l'action reste disponible ailleurs (menu, détail). |
| 2.3.3 / réduction des animations | `prefers-reduced-motion` respecté (§3.6). |
| 2.4.3 Ordre du focus | Ordre visuel = ordre du DOM ; retour du focus à l'origine après une feuille. |
| 2.4.7 / 2.4.11 Focus visible et non masqué | Anneau de 2 px `color.focus` avec 2 px d'écart ; l'élément focalisé n'est jamais caché par la barre d'onglets ou le FAB (marge de défilement). |
| 2.5.1 Gestes | Tout balayage a une alternative par simple appui. |
| 2.5.3 Libellé dans le nom | Le nom accessible commence par le libellé visible. |
| 2.5.7 Mouvements de glissement | Réorganisation et planification possibles sans glisser (menus Monter / Descendre / Déplacer vers…). |
| 2.5.8 Taille des cibles | Minimum WCAG 24 × 24 px ; **cible de conception : 44 × 44 px** sur smartphone. |
| 3.2.6 Aide cohérente | Accès à l'aide au même endroit sur tous les écrans (menu de l'avatar). |
| 3.3.1 / 3.3.3 Erreurs | Message textuel sous le champ, avec suggestion de correction. |
| 3.3.7 Saisie redondante | Les informations déjà saisies sont pré-remplies (contexte de la saisie rapide, valeur proposée dans « Modifier »). |
| 3.3.8 Authentification accessible | Connexion déléguée à Google, sans test cognitif propre à l'application. |
| 4.1.3 Messages d'état | Toasts, changements de l'indicateur de synchronisation et jauges annoncés via `role="status"` (sans interrompre), alertes critiques via `role="alert"`. |

**(v0.2) Points propres au lot 1** :
- *Connexion* (3.3.8) : aucun test cognitif ; le bouton Google est focalisable en premier ; le message d'erreur est annoncé (`role="alert"`) et le focus reste sur le bouton.
- *Hors ligne et synchronisation* (4.1.3) : chaque changement d'état est annoncé `role="status"` ; « Synchroniser maintenant » désactivé hors ligne reste focalisable (`aria-disabled`) et son explication est liée par `aria-describedby`.
- *Boutons désactivés* : « Terminer la tâche » d'une tâche parente reste focalisable ; la phrase qui l'explique est annoncée avant le bouton.
- *Dialogues de confirmation* : `alertdialog`, « Annuler » focalisé, Échap annule, le focus revient à l'élément d'origine.
- *Listes de modifications non retenues* : liste sémantique, un élément par ligne, « Compris » avec nom accessible complet (« Compris : intitulé de Rédiger le plan »).
- *Heure de Paris* : bouton avec info-bulle accessible au focus et fermable (1.4.13).
- *Anneaux de progression* : texte équivalent « en cours, 58 % ». *Étapes de préparation* : liste ordonnée, état de chaque étape en texte.
- *Cible de conception* : 44 × 44 px pour tous les nouveaux boutons (« Compris », « Masquer », puce Heure de Paris étendue).

Composants : la case ronde est un `checkbox` (« Terminer "Rédiger l'introduction" ») ; le stepper un `spinbutton` ; la jauge un `meter` avec texte équivalent ; les onglets de vue une navigation (`nav`) avec `aria-current`.

Tests en recette (E14) : navigation clavier complète, VoiceOver (iOS / macOS), TalkBack (Android), NVDA (Windows), zoom 200 %, largeur 320 px, mode sombre, réduction des animations.

---

## 10. Responsive

**Mobile-first** : chaque écran est conçu d'abord pour une largeur de 360 à 430 px, puis adapté.

| Classe | Largeur | Navigation | Mise en page |
|---|---|---|---|
| Compacte | < 600 px | Barre d'onglets en bas + FAB | 1 colonne ; détails en feuille basse |
| Moyenne | 600 à 1023 px | Rail vertical à gauche | 1 colonne centrée (max. 640 px) ; détails en feuille latérale |
| Étendue | ≥ 1024 px | Barre latérale (240 px) | Liste (max. 720 px) + panneau de détail (400 à 480 px) ; Semaine en 7 colonnes |
| Large | ≥ 1440 px | Barre latérale | Comme « étendue », marges élargies ; aucune colonne supplémentaire |

Adaptations par écran :
| Écran | Compacte | Étendue |
|---|---|---|
| Aujourd'hui | Liste + cartes « À traiter » au-dessus | Liste à gauche, « À traiter » en colonne droite si aucun détail n'est ouvert |
| Tâches | Liste ; filtres en puces défilantes | Liste + panneau de détail |
| Objectif | Pile : en-tête, sous-objectifs, tâches | En-tête + liste ; détail de tâche en panneau |
| Bilan du soir | Une seule colonne défilante, bouton de validation fixé en bas | Boîte centrée (max. 720 px) |
| Semaine | Liste verticale des 7 jours, chaque jour repliable, « À planifier » en tête | 7 colonnes + colonne « À planifier » à gauche, glisser-déposer |
| **(v0.2)** Tâches (lot 1) | Liste triée par délai ; filtres en puces défilantes ; détail en feuille plein écran | Liste + panneau de détail (440 px) |
| **(v0.2)** Objectifs | Liste avec sous-objectifs en retrait ; création en feuille | Liste + panneau de création ou de détail |
| **(v0.2)** Détail d'une tâche | Écran plein, barre d'action fixée en bas | Panneau de droite ; l'action principale suit le contenu |
| **(v0.2)** Connexion | 1 colonne, bouton pleine largeur | Bloc centré de 460 px |
| **(v0.2)** Compte et synchronisation | Feuille haute (presque plein écran) | Boîte de dialogue de 480 px (actions courtes) ou panneau de 400 px |

Autres règles :
- Zones sûres (encoche, barre de geste) respectées : la barre d'onglets et le bouton de validation fixé en bas tiennent compte de la marge système.
- Pas d'interaction réservée au survol : sur PC, ce qui apparaît au survol (poignée, menu « … ») est aussi accessible au focus clavier et reste disponible sur écran tactile.
- Le clavier virtuel ne masque jamais le champ actif ni le bouton « Ajouter » de la saisie rapide.

---

## 11. En attente du DAT

> **(v0.2)** Mise à jour au regard du DAT v0.4 et des décisions DEC-001 à DEC-016 : Android seul (DEC-001), installation directe de l'APK par le commanditaire, sans Google Play (DEC-021, ADR-012 ; remplace DEC-005), PWA hébergée sans domaine (DEC-006), aucun serveur (DEC-007), pas d'avertissement Google au lot 1 (ENF-08), hors ligne sur PC (DEC-013). Les lignes ci-dessous portent une colonne de statut en fin de ligne quand elles ont évolué. Le DAT reste « Proposé » : à confirmer à son acceptation.

Points qui dépendent du choix de plateforme ou de l'architecture. Le **DAT v0.1** (brouillon de Starck, 2026-10-20) **proposait** :
- une base de code TypeScript et React unique, avec des composants **Ionic React** ;
- une **PWA** sur le PC et une application **Capacitor** sur le smartphone (ADR-001) ;
- une architecture *local-first* sans serveur (ADR-002) ;
- des notifications locales sur smartphone uniquement.

Ces décisions sont au statut « Proposé », et le système du smartphone (Android ou iPhone, arbitrage A1) n'est pas tranché. Les maquettes restent donc compatibles avec toutes les options ; la colonne « Si le DAT est accepté » indique ce qui changera.

| # | Sujet | Impact ergonomique | Hypothèse retenue en attendant | Si le DAT v0.1 est accepté |
|---|---|---|---|---|
| DAT-UX-01 | Notifications de l'application (créneau déplacé, rappels de secours Q-DEM001-38) | Une PWA n'émet pas de notification programmée sans serveur ; une application native le peut. | Notification visible **dans** l'application (carte « À traiter ») sur les deux appareils ; notification système en complément si la plateforme la permet. | Notification système sur smartphone seulement (DAT F2, F6), et sur Android si l'arrière-plan est actif. Sur PC : carte « À traiter » uniquement. |
| DAT-UX-02 | Gestes système | Le balayage depuis le bord est réservé au retour sur iOS et Android : conflit possible avec le balayage de ligne. | Les balayages de ligne démarrent à 24 px du bord. | Inchangé ; à vérifier sur appareil réel (WebView Capacitor). |
| DAT-UX-03 | Raccourcis clavier sur PC | Dans un navigateur, `Ctrl`/`Cmd` + lettre est souvent capturé (ex. `Ctrl+N`). | Raccourcis à une touche et `Alt` seulement (§5.3). | Confirmé (PWA). Une application de bureau (option F du DAT) permettrait plus tard des raccourcis globaux. |
| DAT-UX-04 | Hors ligne sur PC (Q-DEM001-39) | Comportement de l'écran sans réseau sur PC. | Même comportement que le smartphone (§6.4). | L'architecture *local-first* rend le hors ligne natif sur les deux appareils (DAT F13) ; la PWA doit avoir été ouverte une fois en ligne. **(v0.2) Résolu par DEC-013 (US-031).** |
| DAT-UX-05 | Sélecteurs de date et d'heure | Natifs (aspect propre à chaque système) ou composants maison (aspect homogène, plus de travail d'accessibilité). | Puces de dates rapides maison + sélecteur « Autre date… » natif. | Composant de date Ionic, habillé avec nos tokens ; accessibilité à vérifier en E14. |
| DAT-UX-06 | Lien depuis les rappels Google vers l'application | Le rappel du soir doit ouvrir directement le bilan (Q-DEM001-40, Q-DEM002-1, DAT F8). | Lien unique qui ouvre ECR-004. | Lien web de la PWA ; sur smartphone, ouverture de l'application si elle est installée (lien d'application), sinon de la PWA. À préciser par Starck. |
| DAT-UX-07 | Retour haptique | Vibration au seuil des balayages et à la fin d'une tâche : variable selon la plateforme. | Facultatif, jamais seul porteur d'information. | Disponible via Capacitor sur smartphone ; absent sur PC. |
| DAT-UX-08 | Accès rapide hors de l'application (widget, raccourci « Nouvelle tâche », partage) | Accélère la saisie rapide sur smartphone, mais dépend fortement de la plateforme. | Non conçu en v0.1. | Envisageable avec Capacitor dans un lot ultérieur. |
| DAT-UX-09 | Bibliothèque de composants et icônes | Ionic propose deux apparences (iOS et Material) qui changent selon l'appareil, alors que P9 demande le même modèle mental partout. | Tokens en CSS custom properties, style d'icônes Lucide. | **Une seule apparence** imposée sur tous les appareils, habillée par nos tokens (variables CSS Ionic). Les composants Ionic dont l'accessibilité est insuffisante seront signalés en E14. |
| DAT-UX-10 | Rythme de synchronisation (Q-DEM001-21) | Signification de « À jour · il y a x min » ; délai de détection d'un créneau déplacé. | L'indicateur affiche l'heure du dernier échange réussi. | Synchronisation immédiate à l'ouverture, 5 s après une modification, puis toutes les 2 min au premier plan (DAT §4.3). Un créneau déplacé est détecté à l'ouverture ou à la synchronisation suivante, jamais en temps réel (DAT F2). |
| DAT-UX-11 **(v0.2 : résolu pour le lot 1 par ENF-08 et ECR-010)** | Parcours de connexion Google | Fenêtre surgissante, redirection ou écran natif ; écrans de consentement (agenda, stockage) ; écran d'avertissement « application non vérifiée » (arbitrage A5). | Écran de connexion ECR-010 avec un seul bouton « Continuer avec Google » et l'explication des accès demandés (ENF-05). | Accès demandés au fil des fonctions (autorisation incrémentale) : chaque demande sera précédée d'un écran d'explication. Si l'option A5 a) est retenue, ECR-010 devra préparer l'utilisateur à l'écran d'avertissement de Google. |
| DAT-UX-12 | Effacement des données locales à la déconnexion (Q-DEM001-22.3) | Contenu de la confirmation de déconnexion. | Confirmation qui indique le nombre de modifications non envoyées. | Confirmé (DAT §4.1.5). **(v0.2) Remplacé : la déconnexion ne supprime plus rien (RG-043, DEC-015) ; l'effacement est l'action distincte « Supprimer les données de cet appareil » (RG-055, ECR-011). Le DAT doit s'aligner (note de Pepper).** |
| DAT-UX-13 | Session Google expirée sur PC (DAT R3, F14) | Sur la PWA, le jeton expire au bout d'une heure ; la reprise de la synchronisation peut demander un clic. | — | État « Session à renouveler » de l'indicateur (§6.5), un clic, sans bandeau. À valider avec le commanditaire si la fréquence s'avère gênante. **(v0.2) Maquetté : ECR-011 H et I ; US-031 CA-5.** |
| DAT-UX-14 | Report automatique (RG-032, DAT F5) | Sans appareil actif à minuit, le report est appliqué à la première ouverture du jour. | Mention « Reportée d'hier » sur la tâche (ECR-001). | Inchangé ; la mention couvre ce cas sans message supplémentaire. |
| DAT-UX-16 **(v0.2)** | Verrou entre onglets (US-031, DAT §4.1) | Un seul onglet synchronise ; les autres doivent rester utilisables et cohérents. | — | Mention dans ECR-011 seulement, aucune interruption ; reprise sans message si l'onglet qui synchronise se ferme. À vérifier en E14 avec deux onglets hors ligne. |
| DAT-UX-17 **(v0.2)** | Nom du dossier Drive et de l'application (CA-3 de US-022) | Le dossier est visible par l'utilisateur ; l'application porte le même nom sur l'écran de consentement Google. | — | Dossier **« Done Juan »** (nom du DAT confirmé par Steeve) ; nom d'application identique (Q-ERG-15 tranchée, DEC-017). |
| DAT-UX-18 **(v0.2)** | Mention « Heure de Paris » (A-F6) | Affichage seulement ; l'appareil connaît son fuseau. | — | Forme définie au §4.21 ; aucune dépendance d'architecture. |
| DAT-UX-15 | Vérification des notifications Google (DAT R10) | Les rappels ne servent à rien si les notifications de Google Agenda sont désactivées sur le smartphone. | — | Étape guidée à la connexion de l'agenda (lot « Rappels ») : « Vérifiez que les notifications de Google Agenda sont activées », avec un rappel de test. |

## 12. Questions ergonomiques

Questions à transmettre au commanditaire par Jarvis. Elles portent sur des choix d'écran qui ne peuvent pas être tranchés sans supposition. Les questions résiduelles de Pepper qui conditionnent aussi les écrans sont rappelées au §12.2 et ne sont pas reposées.

### 12.1 Questions ergonomiques

Questions à transmettre au commanditaire par Jarvis. Elles portent sur des choix d'écran qui ne peuvent pas être tranchés sans supposition.

**Statut des questions de la v0.1** : Q-ERG-02 à Q-ERG-11 ont reçu une réponse du commanditaire (2026-10-20, consignées dans `suivi-projet.md`). Elles sont **« Répondue »**, et leurs effets sont intégrés dans ce guide et dans les maquettes ECR-001, 002 et 003.

| Id | Écran | Question | Statut | Réponse du commanditaire | Effet dans ce guide et les maquettes |
|---|---|---|---|---|---|
| ~~Q-ERG-01~~ | ECR-004 | *Retirée* : couverte par Q-DEM002-1, 2 et 3 de Pepper. Voir §12.2. | Retirée | — | — |
| Q-ERG-02 | ECR-001 | Fun fact aussi dans l'application, masquable ? | **Répondue** | Oui (RG-040) | §7.7 ; ECR-001 : croix « Masquer », cadre D |
| Q-ERG-03 | Saisie rapide | Délai et estimation présélectionnés par défaut ? | **Répondue** | Non (RG-003, RG-029) | §4.3, §5.1 ; ECR-002 L2, ECR-007 I |
| Q-ERG-04 | ECR-004 | Bilan accessible avant 21 h et le lendemain ? | **Répondue** | Oui (RG-039) | §7.8 ; ECR-001 (carte Bilan du soir) |
| Q-ERG-05 | ECR-001 / 004 | Traiter la replanification d'un créneau déplacé tout de suite ? | **Répondue** | Oui (RG-037) | §7.5 ; ECR-001 : « Traiter maintenant » principal, cadre E |
| Q-ERG-06 | ECR-001 | Aujourd'hui : par horaire ou par priorité ? | **Répondue** | Par priorité (RG-051) | §7.6 ; **ECR-001 corrigée** |
| Q-ERG-07 | Alertes | Refus d'une proposition de délai : l'alerte réapparaît-elle ? | **Répondue** | Réaffichée chaque jour tant que non traitée, même après refus (RG-052) | §7.3 ; ECR-001, ECR-003 |
| Q-ERG-08 | ECR-005 | Planifier après le délai ? | **Répondue** | Oui, avec une alerte (RG-006) | À appliquer à ECR-005 (lot « Planification », hors LOT-001) |
| Q-ERG-09 | ECR-004 / Réglages | Ré-estimation de la capacité : où et quand ? | **Répondue** | Chaque semaine, le dimanche | À appliquer à ECR-004 et ECR-009 (lot « Capacité », hors LOT-001) |
| Q-ERG-10 | ECR-005 | Planning validé en bloc ou tâche par tâche ? | **Répondue** | Tâche par tâche | À appliquer à ECR-005 : **la v0.1 (validation en bloc) est à corriger** (hors LOT-001) |
| Q-ERG-11 | ECR-004 / P-06 | Refus de la replanification : que devient le créneau ? | **Répondue** (a) | Le créneau est supprimé de l'agenda et la tâche déplanifiée (RG-037) | §7.5 ; ECR-001 cadre E ; parcours P-06 |

**Nouvelles questions (v0.2)**

| Id | Écran | Question | Proposition de Steeve, puis réponse |
|---|---|---|---|
| Q-ERG-12 | Navigation, ECR-002 | Au lot 1, il n'existe ni planification, ni créneau, ni rappel : « Aujourd'hui » et « Semaine » seraient vides. L'application peut-elle s'ouvrir sur **Tâches** (triée par délai), avec seulement deux entrées **Tâches** et **Objectifs**, les autres vues arrivant avec leurs lots ? (Le principe P3 « Aujourd'hui d'abord » s'applique dès que cette vue a du contenu.) | Oui : deux onglets au lot 1 ; 4 onglets ensuite. Évite deux onglets vides (P2). |
| Q-ERG-13 | ECR-007 | Abandon d'une tâche : confirmation toujours, ou seulement avec des sous-tâches ? | **Répondue** (2026-10-21) : confirmation toujours (US-025 CA-1) ; ECR-007 l'applique. |
| Q-ERG-14 | ECR-011 | Les « modifications non retenues » (valeurs écartées, suppressions, déplacements annulés) restent listées combien de temps ? | Jusqu'à ce que l'utilisateur les ferme (« Compris »), sans limite de durée ; le point accent de l'indicateur ne s'éteint qu'à ce moment. |
| Q-ERG-15 | ECR-010 | Quel **nom** donner à l'application ? Il apparaît à l'écran de connexion, sur l'écran de consentement de Google (test technique R1/R2, étape P3), dans le Drive (nom du dossier) et dans les magasins d'applications. | Tranché le 2026-10-21 (DEC-017) : « Done Juan », identique au dossier du Drive. |
| Q-ERG-16 | ECR-011 J | **RG-057 : à partir de quand compte-t-on les 24 h du bandeau ?** a) depuis le dernier échange réussi avec le Drive ; b) depuis la plus ancienne modification en attente ; c) depuis la coupure du réseau. | **Répondue** (DEC-025, 2026-10-21) : **b)**. Les 24 h courent depuis la plus ancienne modification en attente (§4.9, §6.6.3). Position de Steeve et recommandation de Jarvis : b). |
| Q-ERG-17 | ECR-011 L | **Accès Google perdu depuis plus de 24 h, bandeau « Se reconnecter » déjà affiché.** a) un seul bandeau, complété de « n modifications ne sont encore que sur cet appareil » ; b) deux bandeaux. | **Répondue** (DEC-025, 2026-10-21) : **a)**. Un seul bandeau, variante `24H` de `BAN-ACCES-GOOGLE` (§6.6.3). Position de Steeve et recommandation de Jarvis : a). |
| Q-ERG-18 | ECR-011 J | **Un bandeau des 24 h fermé réapparaît-il ?** a) oui, à la prochaine ouverture de l'application, tant que des modifications sont en attente ; b) non. | **Répondue** (DEC-025, 2026-10-21) : **a)**. Le rappel fermé réapparaît à la prochaine ouverture tant que des modifications sont en attente (§4.9, §6.6.3). Position de Steeve et recommandation de Jarvis : a). |

### 12.1 bis Décisions de conception prises par Steeve en v0.2 (pour information, sans question)
- **Dossier Drive** : « Done Juan » (CA-3 de US-022 : « son nom est fixé en E4 »).
- **Mention « Heure de Paris »** : forme au §4.21 (A-F6).
- **Un seul endroit** pour la synchronisation et le compte (ECR-011), ouvert par l'avatar ou l'indicateur.
- **Estimation d'une tâche** : icône horloge au lot 1 (le sablier est réservé au reste à faire).
- **Heure d'apparition de la carte « Bilan du soir »** : dès 17 h (valeur de conception ; RG-039 n'en fixe pas).
- **Regroupement « Atteints »** replié dans la liste des objectifs (P2), confirmé en E9 (§5.8, Q-US-001-6).

### 12.2 Questions résiduelles de Pepper qui conditionnent les écrans

| Question | Écrans concernés | Effet sur la conception |
|---|---|---|
| ~~Q-DEM001-22.2~~ | Tous | **Levée (v0.2)** : option c), perte d'accès traitée comme une coupure de réseau (RG-035) ; saisie possible, aucun bouton désactivé. |
| ~~Q-DEM001-23.2~~ | Feuille de synchronisation | **Levée (v0.2)** : l'utilisateur est informé de la valeur écartée (RG-036) ; ECR-011 C. |
| ~~Q-DEM001-24 / 25~~ | ECR-002, ECR-003 | **Levée (v0.2)** : un seul niveau de sous-objectifs et de sous-tâches (RG-022, RG-023). |
| ~~Q-DEM001-26.3~~ | ECR-003, ECR-008 | **Levée (v0.2)** : état « À décliner en tâches » (US-001 CA-8, RG-025). |
| ~~Q-DEM001-28.1~~ | Saisie rapide | **Levée (v0.2)** : estimation obligatoire (RG-029). |
| ~~Q-DEM001-29.4~~ | Détail tâche / objectif | **Levée (v0.2)** : suppression définitive, sans corbeille (RG-046). |
| ~~Q-DEM001-39~~ | Tous | **Levée (v0.2)** : hors ligne sur PC dans LOT-001 (DEC-013, US-031). |
| Q-DEM001-31.3 / 31.4 | ECR-004 | Pas du stepper de temps passé ; **total du jour** (la maquette le suppose) ou **ajout**. |
| Q-DEM001-32.3 | ECR-001, ECR-005 | Horaire suggéré modifiable dans l'application ou non. |
| Q-DEM001-33.1 / 33.2 | ECR-004 | Moment et jour proposés pour la replanification. |
| Q-DEM001-34 | Jauge de capacité | Texte « x h d'agenda déduites ». |
| Q-DEM001-35.3 / 35.5 | ECR-002, ECR-003 | Échelle d'importance (la maquette suppose haute / moyenne / basse) ; bouton « Recalculer l'ordre ». |
| Q-DEM001-36 | ECR-005, indicateurs | Horizon du planning proposé (la maquette suppose 7 jours) ; libellé « Travail restant » ou « À planifier ». |
| Q-DEM001-40 | Rappel du soir | Lien vers le bilan dans le rappel. |
| Q-DEM002-1 | ECR-004 | Lieu de réponse aux deux questions (la maquette suppose la réponse a) : dans l'application, via le lien du rappel). |
| Q-DEM002-2 | ECR-004 | Réponses facultatives (la maquette le suppose) ; possibilité de répondre plus tard. |
| Q-DEM002-3 | ECR-004, futur journal des bilans (US-034) | Conservation, consultation et modification des réponses. |
| Q-DEM002-7 | Rappel du matin, ECR-001 | Fun fact présent même sans tâche planifiée. |

### 12.3 Points de vigilance
- **Pour Pepper** : US-033 (questions du soir) et US-035 (fun fact) ont été ajoutées au backlog v0.3 pendant la rédaction de ce guide ; les maquettes ECR-001 et ECR-004 y font référence. La question Q-ERG-11 complète Q-DEM001-33 et pourrait y être rattachée.
- **Pour Starck** : DAT-UX-09 (une seule apparence Ionic sur tous les appareils) et DAT-UX-13 (état « Session à renouveler » sur PC) sont des demandes ergonomiques à prendre en compte dans le DAT.

## 13. Inventaire des écrans

| Id | Écran | Maquette | US principales |
|---|---|---|---|
| ECR-001 | Aujourd'hui (cible ; non livré au lot 1) — **v0.2** | [`maquettes/ECR-001-aujourdhui.html`](maquettes/ECR-001-aujourdhui.html) | US-006, US-020, US-028, US-003, US-002, US-007, US-011, US-032, US-019, US-017, US-018, US-035 |
| ECR-002 | Tâches : **version LOT-001 (tri par délai)** et cible « Priorisation » — **v0.2** | [`maquettes/ECR-002-taches-priorisees.html`](maquettes/ECR-002-taches-priorisees.html) | **LOT-001 : US-002, US-003, US-024, US-025, US-017, US-018** ; cible : US-004, US-030, US-009, US-007 |
| ECR-003 | Détail d'un objectif : **version LOT-001** et cible — **v0.2** | [`maquettes/ECR-003-detail-objectif.html`](maquettes/ECR-003-detail-objectif.html) | US-001, US-023, US-002, US-024, US-003, US-025 ; cible : US-030, US-007, US-011 |
| ECR-004 | Bilan du soir | [`maquettes/ECR-004-bilan-du-soir.html`](maquettes/ECR-004-bilan-du-soir.html) | US-008, US-009, US-003, US-016, US-032, US-011, US-033 |
| ECR-005 | Semaine (planification) | [`maquettes/ECR-005-planification-semaine.html`](maquettes/ECR-005-planification-semaine.html) | US-006, US-027, US-005, US-019, US-020, US-028, US-011 |
| ECR-006 | Saisie rapide (feuille) | Décrite au §4.3 ; états : ECR-002 L2 (initial, sans valeur par défaut), ECR-007 I (sous-tâche, incomplet), ECR-001 C (cible) | US-002, US-024 |
| ECR-007 | Détail d'une tâche et de ses sous-tâches — **v0.1 du 2026-10-21** | [`maquettes/ECR-007-detail-tache.html`](maquettes/ECR-007-detail-tache.html) | US-002, US-024, US-003, US-025, US-017 ; plus tard US-008, US-009 |
| ECR-008 | Objectifs (liste, création, déplacement) — **v0.1 du 2026-10-21** | [`maquettes/ECR-008-liste-objectifs.html`](maquettes/ECR-008-liste-objectifs.html) | US-001, US-023 ; plus tard US-030 |
| ECR-009 | Réglages (capacité, plages, rappels, thème, raccourcis) | À maquetter (lots ultérieurs) ; le compte est dans ECR-011 | US-005, US-029, US-014 |
| ECR-010 | Connexion Google et premier lancement — **v0.1 du 2026-10-21** | [`maquettes/ECR-010-connexion.html`](maquettes/ECR-010-connexion.html) | US-022 ; US-017 (premier chargement) |
| ECR-011 | Feuille de synchronisation et de compte — **v0.1 du 2026-10-21** | [`maquettes/ECR-011-synchronisation-et-compte.html`](maquettes/ECR-011-synchronisation-et-compte.html) | US-017, US-018, US-031, US-022 |
| ECR-012 | Indicateurs (backlog, vélocité) | Lot « Vélocité et pilotage » | US-012, US-013, US-010 |
| ECR-013 | Journal des bilans | Lot « Rappels », selon Q-DEM002-3 | US-034 |

---

### 13.1 Écrans de LOT-001 et lecture par US (v0.2)
| US | Écrans |
|---|---|
| US-022 | ECR-010 (A à G, PC), ECR-011 (compte, F1 à F3) |
| US-017 | ECR-011 (tous les états), ECR-010 (premier chargement), indicateur dans tous les écrans |
| US-018 | ECR-011 B, ECR-008 E, ECR-002 L3, ECR-001 B |
| US-031 | ECR-011 H et I (PC), pied de la barre latérale |
| US-001 | ECR-008 (A, B, F), ECR-003 (D, menu C) |
| US-023 | ECR-008 (A, C, D), ECR-003 E, ECR-011 C (déplacement annulé) |
| US-002 | ECR-002 (L1, L2, L3), ECR-007 (B, I), ECR-006 |
| US-024 | ECR-007 (A, I, J, H), ECR-003 D |
| US-003 | ECR-007 (A, G, H), ECR-002 L4 |
| US-025 | ECR-007 (C, D, F), ECR-002 (filtre Abandonnées) |

## 14. Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Steeve | Création : principes, tokens, composants, interactions, états, alertes, accessibilité, responsive, points en attente du DAT (confrontés au DAT v0.1 brouillon), questions ergonomiques, inventaire des écrans. |
| 0.2 | 2026-10-21 | Steeve | E4 de LOT-001. Réponses Q-ERG-02 à 11 intégrées (§12.1). Navigation du lot 1 (§2.1). Principe P11. Composants §4.21 à §4.28. Cas de ConfirmDialog (§4.12). États et messages ajoutés (§6). Créneau déplacé, ordre d'Aujourd'hui, fun fact, bilan (§7.5 à §7.8). Accessibilité et responsive du lot (§9, §10). Statuts DAT-UX mis à jour (§11). Réserves Q-DEM001 levées (§12.2). Nouvelles questions Q-ERG-12 à 15. Maquettes ECR-007, 008, 010, 011 créées ; ECR-001, 002, 003 mises à jour. |
| 0.2.2 | 2026-10-21 | Steeve | E7 de LOT-001 : bandeau RG-057 (§4.9, ECR-011 J et L) et consultation seule RG-058 (ECR-011 K) ; questions Q-ERG-16 et 17 ; réserves caduques retirées (Q-ERG-13 répondue). |
| 0.2.1 | 2026-10-21 | Steeve | Nom « Done Juan » (DEC-017) : application et dossier Drive (V-13), validation E6 de LOT-001 (DEC-018). |
| 0.2.3 | 2026-10-21 | Steeve | E7 de LOT-001, corrections du tour 1. **Catalogue des libellés et codes d'état observables (§6.6, ANT-7)** : indicateur `SYN-`, bandeaux `BAN-`, mentions `MEN-`, états `ETA-`, vides `EVD-`, toasts `TST-`, confirmations `CNF-`, erreurs `ERR-001` à `ERR-035` (dont les 6 motifs de connexion d'US-022), alertes `ALR-001` à `ALR-013`. Écran d'atterrissage après la première connexion (BEN-6). Écrans portant « Heure de Paris » (§4.21, BEN-8). Compteur 3/3 « En cours » (PEP-10). Textes de §6.3 alignés sur le catalogue. Q-ERG-16 à 18 reformulées, non tranchées. |
| 0.2.4 | 2026-10-21 | Steeve | Tour 2 du refinement de LOT-001 (ANT-21) : catalogue complété (`ERR-023`, `ERR-032` à `ERR-035`, variantes `ERR-030`), table « motif des scénarios → code » (§6.6.10), forme de `MEN-HEURE-PARIS` avec une date de fin (US-003 S21). |
| 0.2.6 | 2026-10-21 | Steeve | Remarque RF-LOT-001-PEP-14 : en-tête mis à jour (US validées, DEC-018) ; §11 : distribution Android par installation directe de l'APK (DEC-021, ADR-012) à la place de Google Play (DEC-005). |
| 0.2.7 | 2026-10-21 | Steeve | E8 de LOT-001, réponses aux Q-US d'Anthony (§6.6.11) : liste « Tâches » (§5.7, Q-US-002-1) ; point « à lire » indépendant de l'état (Q-US-017-6, RG-056 inchangée) ; décompte des modifications en attente (Q-US-018-1) ; codes `ERR-016`, `ALR-014`, `EVD-FILTRE-A-FAIRE`, `SYN-FEUILLE-A-LIRE`, variante `session` de `BAN-RAPPEL-24H` ; ECR-002 (L1, L4, L5) et ECR-011 (M). |
| 0.2.5 | 2026-10-21 | Steeve | Décision DEC-025 : Q-ERG-16 b, Q-ERG-17 a et Q-ERG-18 a intégrées et passées à « Répondue » (§12.1). §4.9 et §6.6.3 : les 24 h courent depuis la plus ancienne modification en attente, un seul bandeau en cas d'accès perdu (variante `24H`), réapparition du rappel fermé ; « sous réserve » retiré de `BAN-RAPPEL-24H`, de la variante `24H` et d'`ALR-002`. Titre et texte du rappel alignés sur la règle (« Modifications en attente depuis plus de 24 h »). §6.6.10 : « intitulé manquant » corrigé (US-001 S04), US-024 S16b ajouté pour `ERR-033`, format `"ERR-030 variante <variante>"` documenté. Cadres J et L d'ECR-011 et sections « Impacts ergonomie » d'US-018 et US-031 mises à jour. |
| 0.2.8 | 2026-10-21 | Steeve | Correction de fin d'E8 de LOT-001 (É-3, explicitation-LOT-001.md, contrôle final). `ALR-010` (§6.6.9) : libellés complétés pour les deux cas de DEC-030 (Q-US-001-1 a) : variante `rattachement` (« Rattachement non retenu, objectif supprimé », élément = la tâche) et variante `placement` (« Placement non retenu, objectif supprimé », élément = le sous-objectif), choisies par la colonne `information` (`objectifs` ou `parent`). Libellés repris de US-001 CA-10 et US-023 CA-10 ; scénarios S20 (US-001) et S19 (US-023) inchangés. |
| 0.2.11 | 2026-10-22 | Steeve | DEC-032 (Q-US-025-3 a) : `CNF-REPRENDRE-SOUS-TACHE` (§6.6.7), cadre D3 d'ECR-007. |
| 0.2.18 | 2026-10-30 | Steeve | Q-ANT-E13-R4-1 (DT-015) : famille `SEL-` et codes `SEL-PARENT-*` (§6.6.4) ; entrée de menu « Placer sous un autre objectif » ; `ALR-007` variante détail avec « Changer le délai » (§6.6.9). ECR-003 v0.2.1, ECR-008 v0.1.1. |
| 0.2.19 | 2026-10-30 | Steeve | Q-US-023-n (option b), décision du commanditaire du 2026-10-30 : champ « Placer sous un objectif » de la feuille de création reporté à un lot ultérieur, retiré d'ECR-008 B et G (v0.1.2). Points d'entrée du placement : ECR-003 D (« Ajouter ») et ECR-003 C (menu). |
