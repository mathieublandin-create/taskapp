# Guide d'ergonomie

> **Version 0.1, 2026-10-20 (Steeve).** Socle UX initial, hors cycle de lot, demandé par le commanditaire.
>
> **Entrées** : DEM-001, DEM-002, cahier des charges v0.3, backlog initial v0.3 (US-001 à US-036), questions ouvertes (réponses du commanditaire, questions résiduelles Q-DEM001-21 à 40 et Q-DEM002-1 à 7), compléments du commanditaire transmis par Jarvis le 2026-10-20, DAT v0.1 (brouillon de Starck, décisions au statut « Proposé »).
>
> **Statut** : document de travail. Les choix qui dépendent d'une question ouverte sont signalés par la mention **(sous réserve de Q-…)**. Les choix qui dépendent de la plateforme sont regroupés au §11, « En attente du DAT » : le DAT v0.1 propose une PWA pour le PC et une application Capacitor pour le smartphone, mais ces décisions ne sont pas encore acceptées.

## Sommaire
1. [Principes de design](#1-principes-de-design)
2. [Architecture de l'information et navigation](#2-architecture-de-linformation-et-navigation)
3. [Charte graphique (tokens)](#3-charte-graphique-tokens)
4. [Bibliothèque de composants](#4-bibliothèque-de-composants)
5. [Règles d'interaction](#5-règles-dinteraction)
6. [États : vide, chargement, erreur, hors ligne, synchronisation](#6-états--vide-chargement-erreur-hors-ligne-synchronisation)
7. [Alertes et propositions](#7-alertes-et-propositions)
8. [Rédaction de l'interface](#8-rédaction-de-linterface)
9. [Accessibilité (WCAG 2.2 AA)](#9-accessibilité-wcag-22-aa)
10. [Responsive](#10-responsive)
11. [En attente du DAT](#11-en-attente-du-dat)
12. [Questions ergonomiques](#12-questions-ergonomiques)
13. [Inventaire des écrans](#13-inventaire-des-écrans)
14. [Historique](#14-historique)

---

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

---

## 2. Architecture de l'information et navigation

### 2.1 Vues principales

| Vue | Question à laquelle elle répond | Action principale |
|---|---|---|
| **Aujourd'hui** (ECR-001) | « Qu'est-ce que je fais aujourd'hui ? » | Ajouter une tâche (saisie rapide) |
| **Semaine** (ECR-005) | « Qu'est-ce que je fais ces prochains jours, et est-ce que ça tient ? » | Valider le planning proposé |
| **Tâches** (ECR-002) | « Qu'est-ce qui est le plus important dans tout mon travail ? » | Ajouter une tâche |
| **Objectifs** (ECR-008, liste ; ECR-003, détail) | « Où en suis-je de mes objectifs ? » | Ajouter un objectif (liste) ; ajouter une tâche (détail) |

Le **bilan du soir** (ECR-004) n'est pas une vue permanente : c'est un parcours ponctuel, ouvert depuis la carte « Bilan du soir » d'Aujourd'hui ou depuis le lien du rappel de 21 h.

Les **réglages** (capacité, plages, heures des rappels, compte Google, thème) sont accessibles depuis l'avatar, en haut de l'écran. Ils sont peu fréquents et n'ont donc pas leur place dans la barre de navigation.

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
| Durée, temps passé | horloge | Métadonnée |
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

Métadonnées, dans cet ordre, **3 au maximum** affichées selon la vue :
1. horaire suggéré (Aujourd'hui, Semaine) ou rang de priorité (Tâches) ;
2. délai (drapeau), en rouge avec texte « En retard » si dépassé ;
3. reste à faire (sablier) ;
4. objectif(s) : 1 puce, puis « +n » ;
5. sous-tâches : « 2/5 ».

| État | Rendu |
|---|---|
| À faire | Case vide `color.border.strong` |
| Terminée | Case pleine `color.success` avec coche, intitulé `color.text.tertiary` barré ; la ligne reste 3 s puis rejoint la section « Terminées » repliée (annulation possible pendant ce temps) |
| Abandonnée | Icône cercle barré, intitulé `color.text.tertiary` ; visible seulement dans le filtre « Abandonnées » |
| En retard | Délai en `color.danger` + icône + texte « En retard » |
| Alerte (délai non tenable, estimation dépassée) | Icône triangle `color.warning` à droite, avec nom accessible explicite |
| Proposée (planning non validé) | Bordure gauche pointillée `color.accent` et marqueur étincelle « Proposé » |
| Reportée automatiquement | Métadonnée « Reportée d'hier » avec icône flèche circulaire, pendant la journée du report |
| Modifiée hors ligne, non synchronisée | Petit point `color.text.tertiary` à droite (nom accessible : « Modification en attente d'envoi ») |
| Sélectionnée (PC) | Fond `color.accent.subtle` |
| Focus clavier | Anneau de focus sur toute la ligne |

### 4.3 Saisie rapide (`QuickAdd`)
- **Smartphone** : feuille basse ouverte par le FAB ; le clavier s'ouvre immédiatement sur le champ intitulé.
- **PC** : champ en haut de la liste ou fenêtre flottante centrée, ouverte par la touche `N` (voir §5.3).
- Contenu : champ intitulé, puis une rangée de **puces de choix rapide** :
  - Délai (obligatoire, RG-003) : « Aujourd'hui », « Demain », « Vendredi », « Dans 1 semaine », « Date… » ;
  - Estimation (RG-028, obligatoire **sous réserve de Q-DEM001-28.1**) : « 30 min », « 1 h », « 2 h », « Autre… » ;
  - Objectif (facultatif, RG-001) : objectif de la vue courante pré-rempli si l'on est dans un objectif ;
  - Jour planifié (facultatif) : pré-rempli à « Aujourd'hui » si la saisie part de la vue Aujourd'hui.
- Action principale : « Ajouter » (Entrée). La feuille reste ouverte et vide après l'ajout, pour enchaîner plusieurs tâches ; un glissement vers le bas ou Échap la ferme.
- États : *vide* (bouton désactivé, avec l'indication « Intitulé, délai et estimation requis ») ; *incomplet* (puces manquantes soulignées) ; *prêt* ; *ajouté* (confirmation brève dans la feuille : « Ajoutée à Tâches »).
- Pré-sélection d'un délai par défaut : **voir Q-ERG-03**.

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
- Un appui ouvre la **feuille de synchronisation** (ECR-011) : dernier échange avec l'espace de stockage, dernier échange avec Google Calendar, modifications en attente (nombre et liste), modifications écartées par la règle de conflit (RG-036, sous réserve de Q-DEM001-23.2), bouton « Synchroniser maintenant ».
- États : voir §6.5.

### 4.9 Bandeau (`Banner`)
Message persistant sous l'en-tête, pleine largeur, fermable sauf mention contraire. Réservé à **deux** cas : accès Google perdu (non fermable tant que non résolu, RG-035) et hors ligne prolongé avec modifications en attente depuis plus de 24 h (rappel non bloquant). Tout le reste passe par l'indicateur ou une carte.

### 4.10 Message éphémère (`Toast`)
Bas de l'écran, au-dessus de la barre d'onglets, 4 s (6 s s'il contient une action), une seule ligne + action facultative « Annuler ». Annoncé aux lecteurs d'écran (`role="status"`). Mis en pause au survol ou au focus. Exemple : « Tâche terminée · Annuler ».

### 4.11 Feuille (`BottomSheet`) et panneau de détail (`DetailPanel`)
- Smartphone : feuille basse à deux hauteurs (moitié, plein écran), poignée visible, fermeture par glissement, par le bouton « Fermer » ou par le geste retour.
- PC : le même contenu s'affiche dans le panneau de détail à droite (largeur 400 à 480 px) ou dans une boîte de dialogue centrée pour les actions courtes.
- Focus piégé dans la feuille modale ; retour du focus à l'élément d'origine à la fermeture.

### 4.12 Boîte de confirmation (`ConfirmDialog`)
Utilisée **uniquement** pour les actions destructrices et irréversibles (suppression, déconnexion avec modifications en attente). Titre = conséquence (« Supprimer la tâche et ses 3 sous-tâches ? »), action destructrice libellée explicitement (« Supprimer »), « Annuler » focalisé par défaut.

### 4.13 En-tête de vue (`ViewHeader`)
Titre de vue (`font.title.l`), sous-titre facultatif (date, progression), à droite : indicateur de synchronisation et avatar (réglages). Sur smartphone, le titre se réduit dans la barre au défilement.

### 4.14 Barre d'onglets (`TabBar`), rail (`NavRail`), barre latérale (`Sidebar`)
- Barre d'onglets : 4 entrées, icône 24 px + libellé 12 px toujours visible ; onglet actif en `color.accent` et indiqué aussi par la graisse et `aria-current="page"`.
- Barre latérale PC : mêmes 4 entrées, puis section « Objectifs » (5 premiers, « Tous les objectifs »), puis pied (synchronisation, réglages).

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

---

## 5. Règles d'interaction

### 5.1 Saisie rapide d'une tâche
| Appareil | Déclencheur | Nombre de gestes jusqu'à l'enregistrement |
|---|---|---|
| Smartphone | FAB « + » | 1 (ouvrir) + frappe + 2 puces (délai, estimation) + Entrée |
| PC | Touche `N` depuis n'importe quelle vue | 1 + frappe + `Tab` vers les puces + Entrée |

- Le contexte pré-remplit ce qu'il peut : vue Aujourd'hui → planifiée aujourd'hui ; détail d'un objectif → rattachée à cet objectif ; jour de la vue Semaine → planifiée ce jour-là.
- Le texte saisi n'est jamais perdu : si la feuille est fermée avec un intitulé non vide, il est conservé comme brouillon et réaffiché à la réouverture.
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

Les combinaisons avec `Ctrl`/`Cmd` ne sont pas utilisées en v0.1 : elles entrent en conflit avec le navigateur si l'application est une PWA (§11).

### 5.4 Planification
- **Planifier une tâche** : balayage gauche (smartphone) ou `P` (PC) → feuille « Planifier le… » avec des puces : « Aujourd'hui », « Demain », les 5 jours suivants (avec leur charge, ex. « Jeu. 3 h / 4 h »), « Autre date… », « Retirer du planning ». 2 gestes au total.
- Sur la vue Semaine (PC), glisser-déposer d'une colonne de jour à l'autre, avec l'alternative clavier `Alt` + `←` / `→`.
- Après chaque planification, la jauge du jour se met à jour immédiatement ; en cas de dépassement, la jauge passe en état « dépassement » sans fenêtre (RG-011).
- L'horaire suggéré (RG-034) s'affiche dès que l'application l'a calculé ; avant cela, la ligne indique « Horaire à venir ». La modification de l'horaire dans l'application est **sous réserve de Q-DEM001-32.3**.

### 5.5 Annulation plutôt que confirmation
Les actions réversibles (terminer, planifier, réordonner, accepter une proposition, abandonner) s'exécutent immédiatement, avec un toast « Annuler ». La confirmation est réservée aux suppressions (§4.12). Justification : moins de gestes pour 99 % des cas, et le filet de sécurité reste disponible.

### 5.6 Enregistrement
Pas de bouton « Enregistrer » dans les détails : chaque modification est enregistrée dès qu'elle est faite (localement d'abord, puis synchronisée). Exception : le **bilan du soir**, qui se termine par une validation explicite, parce qu'il regroupe plusieurs saisies et des propositions à accepter.

---

## 6. États : vide, chargement, erreur, hors ligne, synchronisation

### 6.1 États vides
| Écran | Message | Action |
|---|---|---|
| Aujourd'hui, rien de planifié | « Rien de prévu aujourd'hui. » / « Planifiez une tâche ou ajoutez-en une nouvelle. » | « Planifier depuis mes tâches » (secondaire) ; FAB conservé |
| Aujourd'hui, tout est terminé | « Tout est fait pour aujourd'hui. » + temps passé du jour | Lien « Faire mon bilan » |
| Tâches, aucune tâche | « Aucune tâche pour l'instant. » / « Commencez par ce qui vous vient à l'esprit, vous trierez ensuite. » | « Ajouter une tâche » |
| Objectifs, aucun objectif | « Un objectif donne une direction à vos tâches. » | « Créer un objectif » |
| Objectif sans tâche | « À décliner en tâches. » (sous réserve de Q-DEM001-26.3) | « Ajouter une tâche » |
| Semaine, aucune capacité définie | « Indiquez combien de temps vous consacrez à vos tâches chaque jour, pour que l'application puisse vous proposer un planning. » | « Définir ma capacité » |
| Semaine, rien à planifier | « Toutes vos tâches sont planifiées. » | — |
| Bilan du soir, aucune tâche du jour | « Aucune tâche prévue ni travaillée aujourd'hui. » | Questions de bilan toujours proposées (US-033) |

### 6.2 Chargement
- **Premier lancement** sur un appareil : écran de chargement avec message (« Récupération de vos données depuis votre espace… ») et progression si elle est mesurable.
- **Lancements suivants** : l'application affiche **immédiatement** les données présentes sur l'appareil (pas de squelette), puis l'indicateur passe en « Synchronisation… ». Justification : usage smartphone en mobilité ; attendre le réseau pour voir sa journée serait inacceptable (RG-021).
- Squelettes (`Skeleton`) seulement pour les contenus jamais chargés sur l'appareil (ex. indicateurs, plus tard).
- Au-delà de 10 s sans réponse, un texte apparaît : « C'est plus long que d'habitude. Vos données locales restent utilisables. »

### 6.3 Erreurs
| Type | Présentation | Exemple de message |
|---|---|---|
| Champ invalide | Sous le champ, texte `color.danger` + icône, focus déplacé sur le premier champ en erreur | « Indiquez un délai. » |
| Action impossible localement | Toast avec action | « Impossible d'enregistrer. Réessayer » |
| Échec de synchronisation temporaire | Indicateur en état « Nouvelle tentative… », aucune interruption | — |
| Échec persistant (> 3 tentatives) | Indicateur en état « Action requise » + détail dans la feuille de synchronisation | « Votre espace de stockage est plein. Libérez de la place pour reprendre l'enregistrement. » |
| Accès Google perdu ou expiré (RG-035) | Bandeau non fermable | « Reconnectez votre compte Google pour reprendre la synchronisation et les rappels. Vos données sont conservées. » + bouton « Se reconnecter » |
| Créneau Google non créé | Sur la ligne de tâche, icône créneau en état barré ; détail dans la feuille de synchronisation | « Le créneau n'a pas pu être créé dans votre agenda. Nouvelle tentative automatique. » |

| Session Google expirée sur PC (renouvellement du jeton nécessitant un geste, DAT R3 / F14) | Indicateur « Reprendre la synchronisation » (un clic), **pas** de bandeau : ce n'est pas une perte d'accès | « Cliquez pour reprendre la synchronisation avec Google. » |
| Rappels modifiés ou supprimés directement dans Google Agenda (DAT R7) | Carte « À traiter » de niveau attention, avec proposition de recréer les rappels | « Vos rappels de 8 h et 21 h ont été modifiés dans votre agenda. Les rétablir ? » |
| Horloge de l'appareil déréglée (DAT R4) | Carte d'information | « L'heure de cet appareil semble incorrecte. Corrigez-la pour éviter des conflits entre vos appareils. » |
| Version de l'application trop ancienne pour lire les données (DAT R5) | Bandeau non fermable, données en lecture seule | « Une version plus récente de l'application a enregistré vos données. Mettez à jour l'application pour continuer à les modifier. » |

Règle : un message d'erreur dit **ce qui s'est passé**, **ce qui est préservé** (« vos données sont conservées ») et **quoi faire**. Jamais de code technique à l'écran.

Le comportement de l'application pendant la perte d'accès Google (consultation seule ou saisie autorisée) est **sous réserve de Q-DEM001-22.2**.

### 6.4 Hors ligne
- L'application reste entièrement utilisable en consultation et en saisie (RG-021). Aucun bouton n'est désactivé pour cause de réseau, sauf « Synchroniser maintenant » et la reconnexion Google.
- Au passage hors ligne : indicateur « Hors ligne » (icône + libellé) et un toast unique : « Hors ligne. Vos modifications sont enregistrées sur l'appareil et seront envoyées au retour du réseau. »
- Les éléments modifiés hors ligne portent le point « en attente » (§4.2).
- Les actions qui dépendent de Google (création de créneau, prise en compte des événements) sont mises en file ; la jauge de capacité indique « Agenda non actualisé depuis 14 h 10 » si les événements n'ont pas pu être relus.
- Au retour du réseau : indicateur « Synchronisation… » puis « À jour », sans toast si tout s'est bien passé. Si une modification a été écartée par la règle de conflit (RG-036) : carte « À traiter » de niveau information, avec la valeur écartée (sous réserve de Q-DEM001-23.2).
- Sur PC : comportement identique **sous réserve de Q-DEM001-39** ; si le PC n'est pas utilisable hors ligne, écran « Connexion nécessaire » avec les données en lecture seule si elles sont disponibles.

### 6.5 États de l'indicateur de synchronisation
| État | Icône | Libellé (PC ; smartphone si affiché) | Intrusif ? |
|---|---|---|---|
| À jour | nuage coché, `color.text.tertiary` | « À jour · il y a 2 min » | Non (icône discrète) |
| Synchronisation en cours | nuage avec flèches, `color.text.tertiary` | « Synchronisation… » | Non |
| Modifications en attente (en ligne) | nuage + petit nombre | « 3 modifications à envoyer » | Non |
| Hors ligne | nuage barré, `color.text.secondary` | « Hors ligne · 3 en attente » | Libellé visible, pas de bandeau |
| Nouvelle tentative | nuage avec flèches, `color.warning` | « Nouvelle tentative… » | Non |
| Session à renouveler (PC) | nuage avec flèches, `color.accent` | « Reprendre la synchronisation » (bouton) | Non : un clic, pas de bandeau |
| Action requise | nuage avec point d'exclamation, `color.danger` | « Action requise » | Oui : bandeau si Google, sinon indicateur + carte |

L'indicateur couvre deux échanges distincts — l'espace de stockage (données) et Google Calendar (créneaux, événements, rappels) — mais n'affiche qu'**un** état, le plus grave des deux. La feuille de synchronisation détaille chacun.

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
- **Refuser** (tertiaire) : ferme la carte, toast « Proposition refusée · Annuler ». La réapparition éventuelle de la même alerte est **sous réserve de Q-ERG-07**.
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

### 7.5 Créneau déplacé : deux temps (RG-037)
1. **Au moment où l'application détecte le déplacement** : une carte d'attention « Créneau déplacé » apparaît dans « À traiter » (notification dans l'application), sans demander de décision immédiate : « Une replanification vous sera proposée dans votre bilan du soir. » Lien tertiaire « Voir dans l'agenda ».
2. **Le soir** : la proposition de replanification est présentée dans l'étape « Propositions » du bilan du soir, avec Accepter / Modifier / Refuser.

La possibilité de traiter la replanification immédiatement, sans attendre le soir, est **sous réserve de Q-ERG-05**. Le moment exact de la proposition dépend de Q-DEM001-33.1.

---

## 8. Rédaction de l'interface

- **Vouvoiement**, phrases courtes, verbes d'action sur les boutons (« Ajouter », « Planifier », « Valider mon bilan »).
- Durées : « 30 min », « 1 h », « 1 h 30 » (espace insécable entre le nombre et l'unité). Jamais « 1,5 h ».
- Dates : relatives quand c'est plus clair (« Aujourd'hui », « Demain », « Jeudi »), sinon « 31 oct. » ; l'année seulement si elle diffère de l'année en cours.
- Jamais de jargon technique (« sync », « token », « OAuth », « 409 »). On dit « enregistré dans votre espace », « votre agenda Google ».
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

Autres règles :
- Zones sûres (encoche, barre de geste) respectées : la barre d'onglets et le bouton de validation fixé en bas tiennent compte de la marge système.
- Pas d'interaction réservée au survol : sur PC, ce qui apparaît au survol (poignée, menu « … ») est aussi accessible au focus clavier et reste disponible sur écran tactile.
- Le clavier virtuel ne masque jamais le champ actif ni le bouton « Ajouter » de la saisie rapide.

---

## 11. En attente du DAT

Points qui dépendent du choix de plateforme ou de l'architecture. Le **DAT v0.1** (brouillon de Starck, 2026-10-20) **propose** :
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
| DAT-UX-04 | Hors ligne sur PC (Q-DEM001-39) | Comportement de l'écran sans réseau sur PC. | Même comportement que le smartphone (§6.4). | L'architecture *local-first* rend le hors ligne natif sur les deux appareils (DAT F13) ; la PWA doit avoir été ouverte une fois en ligne. |
| DAT-UX-05 | Sélecteurs de date et d'heure | Natifs (aspect propre à chaque système) ou composants maison (aspect homogène, plus de travail d'accessibilité). | Puces de dates rapides maison + sélecteur « Autre date… » natif. | Composant de date Ionic, habillé avec nos tokens ; accessibilité à vérifier en E14. |
| DAT-UX-06 | Lien depuis les rappels Google vers l'application | Le rappel du soir doit ouvrir directement le bilan (Q-DEM001-40, Q-DEM002-1, DAT F8). | Lien unique qui ouvre ECR-004. | Lien web de la PWA ; sur smartphone, ouverture de l'application si elle est installée (lien d'application), sinon de la PWA. À préciser par Starck. |
| DAT-UX-07 | Retour haptique | Vibration au seuil des balayages et à la fin d'une tâche : variable selon la plateforme. | Facultatif, jamais seul porteur d'information. | Disponible via Capacitor sur smartphone ; absent sur PC. |
| DAT-UX-08 | Accès rapide hors de l'application (widget, raccourci « Nouvelle tâche », partage) | Accélère la saisie rapide sur smartphone, mais dépend fortement de la plateforme. | Non conçu en v0.1. | Envisageable avec Capacitor dans un lot ultérieur. |
| DAT-UX-09 | Bibliothèque de composants et icônes | Ionic propose deux apparences (iOS et Material) qui changent selon l'appareil, alors que P9 demande le même modèle mental partout. | Tokens en CSS custom properties, style d'icônes Lucide. | **Une seule apparence** imposée sur tous les appareils, habillée par nos tokens (variables CSS Ionic). Les composants Ionic dont l'accessibilité est insuffisante seront signalés en E14. |
| DAT-UX-10 | Rythme de synchronisation (Q-DEM001-21) | Signification de « À jour · il y a x min » ; délai de détection d'un créneau déplacé. | L'indicateur affiche l'heure du dernier échange réussi. | Synchronisation immédiate à l'ouverture, 5 s après une modification, puis toutes les 2 min au premier plan (DAT §4.3). Un créneau déplacé est détecté à l'ouverture ou à la synchronisation suivante, jamais en temps réel (DAT F2). |
| DAT-UX-11 | Parcours de connexion Google | Fenêtre surgissante, redirection ou écran natif ; écrans de consentement (agenda, stockage) ; écran d'avertissement « application non vérifiée » (arbitrage A5). | Écran de connexion ECR-010 avec un seul bouton « Continuer avec Google » et l'explication des accès demandés (ENF-05). | Accès demandés au fil des fonctions (autorisation incrémentale) : chaque demande sera précédée d'un écran d'explication. Si l'option A5 a) est retenue, ECR-010 devra préparer l'utilisateur à l'écran d'avertissement de Google. |
| DAT-UX-12 | Effacement des données locales à la déconnexion (Q-DEM001-22.3) | Contenu de la confirmation de déconnexion. | Confirmation qui indique le nombre de modifications non envoyées. | Confirmé (DAT §4.1.5). |
| DAT-UX-13 | Session Google expirée sur PC (DAT R3, F14) | Sur la PWA, le jeton expire au bout d'une heure ; la reprise de la synchronisation peut demander un clic. | — | État « Session à renouveler » de l'indicateur (§6.5), un clic, sans bandeau. À valider avec le commanditaire si la fréquence s'avère gênante. |
| DAT-UX-14 | Report automatique (RG-032, DAT F5) | Sans appareil actif à minuit, le report est appliqué à la première ouverture du jour. | Mention « Reportée d'hier » sur la tâche (ECR-001). | Inchangé ; la mention couvre ce cas sans message supplémentaire. |
| DAT-UX-15 | Vérification des notifications Google (DAT R10) | Les rappels ne servent à rien si les notifications de Google Agenda sont désactivées sur le smartphone. | — | Étape guidée à la connexion de l'agenda (lot « Rappels ») : « Vérifiez que les notifications de Google Agenda sont activées », avec un rappel de test. |

## 12. Questions ergonomiques

Questions à transmettre au commanditaire par Jarvis. Elles portent sur des choix d'écran qui ne peuvent pas être tranchés sans supposition. Les questions résiduelles de Pepper qui conditionnent aussi les écrans sont rappelées au §12.2 et ne sont pas reposées.

### 12.1 Nouvelles questions

| Id | Écran | Question | Proposition de Steeve |
|---|---|---|---|
| ~~Q-ERG-01~~ | ECR-004 | *Retirée* : couverte par Q-DEM002-1, 2 et 3 de Pepper (lieu de réponse, caractère facultatif, conservation). Voir §12.2. | — |
| Q-ERG-02 | ECR-001 Aujourd'hui | Le fun fact du matin (DEM-002, US-035) est destiné au rappel de 8 h. Doit-il **aussi** apparaître dans l'application, sur Aujourd'hui, le matin ? Peut-on le masquer ? | Oui, une ligne discrète en bas d'Aujourd'hui jusqu'à midi, masquable d'un geste. |
| Q-ERG-03 | Saisie rapide | Le délai est obligatoire (RG-003). Pour gagner un geste, l'application peut-elle **pré-sélectionner un délai par défaut** (par exemple « dans 1 semaine »), que vous changez si besoin ? Ou préférez-vous le choisir explicitement à chaque fois, pour éviter des délais « par défaut » qui fausseraient les alertes ? Même question pour l'estimation (par exemple 1 h). | Aucun défaut pour le délai (il pilote les alertes) ; aucun défaut pour l'estimation (elle pilote la vélocité). Les puces rapides gardent la saisie à 2 gestes. |
| Q-ERG-04 | ECR-004 Bilan du soir | Le bilan est-il accessible **avant** l'heure du rappel du soir (par exemple si vous terminez à 18 h) ? Et peut-on le faire **le lendemain** pour la veille ? | Oui aux deux : la carte « Bilan du soir » apparaît dès 17 h ; le bilan de la veille reste proposé le lendemain matin s'il n'a pas été fait. |
| Q-ERG-05 | ECR-001 / ECR-004 | Quand un créneau est déplacé dans Google, la replanification est proposée le soir (RG-037). Souhaitez-vous pouvoir la **traiter tout de suite**, depuis la notification, sans attendre le soir ? | Oui : bouton tertiaire « Traiter maintenant » sur la carte ; sinon, elle attend le bilan. |
| Q-ERG-06 | ECR-001 Aujourd'hui | Dans Aujourd'hui, les tâches sont-elles affichées dans l'ordre **des horaires suggérés** (comme l'agenda) ou dans l'ordre **de priorité** ? | Ordre des horaires suggérés, avec l'horaire visible, pour que l'écran corresponde à l'agenda Google. |
| Q-ERG-07 | Alertes | Si vous **refusez** une proposition de nouveau délai, l'alerte « délai non tenable » doit-elle réapparaître : dès le lendemain, seulement si la situation s'aggrave, ou plus jamais pour ce délai ? | Elle reste visible sur la tâche (icône), mais la carte de proposition ne réapparaît que si l'écart s'aggrave d'au moins une journée. |
| Q-ERG-08 | ECR-005 Semaine | Peut-on planifier une tâche sur un jour **postérieur à son délai** ? Si oui, faut-il une alerte ? | Oui, avec une alerte « Après le délai » sur la tâche, sans blocage (même logique que RG-011 et RG-024). |
| Q-ERG-09 | ECR-004 / Réglages | Quand l'application propose une **ré-estimation de votre capacité** (US-026) : dans le bilan du soir, dans un bilan hebdomadaire, ou seulement dans les réglages ? À quelle fréquence au maximum ? | Dans le bilan du soir du dernier jour travaillé de la semaine, au plus une fois par semaine. |
| Q-ERG-11 | ECR-004 / P-06 | Après un créneau déplacé dans Google, si vous **refusez** la replanification proposée le soir, la tâche reste au jour prévu dans l'application. Que doit devenir le créneau dans votre agenda : être **remis** au jour prévu, ou être **laissé** où vous l'avez mis (l'agenda et l'application divergent alors) ? | Remettre le créneau au jour prévu, en le disant dans le toast : « Créneau remis à mardi dans votre agenda · Annuler ». Le DAT prévoit que l'application n'écrase jamais un déplacement sans décision (§4.4.3) : refuser est cette décision. |
| Q-ERG-10 | ECR-005 Semaine | Le planning proposé (US-027) doit-il être **validé en bloc** (« Valider le planning »), ou chaque tâche proposée est-elle considérée comme acceptée tant que vous ne la déplacez pas ? | Validation en bloc, après ajustements, conformément à l'exclusion « ajustement sans validation » (CdC §4.3). |

### 12.2 Questions résiduelles de Pepper qui conditionnent les écrans

| Question | Écrans concernés | Effet sur la conception |
|---|---|---|
| Q-DEM001-22.2 | Tous | Pendant la perte d'accès Google : saisie possible ou lecture seule (bandeau, boutons désactivés ou non). |
| Q-DEM001-23.2 | Feuille de synchronisation, « À traiter » | Affichage des modifications écartées. |
| Q-DEM001-24 / 25 | ECR-002, ECR-003 | Profondeur de l'arborescence affichée ; la maquette suppose un seul niveau (recommandation de Pepper). |
| Q-DEM001-26.3 | ECR-003, ECR-008 | État « À décliner en tâches ». |
| Q-DEM001-28.1 | Saisie rapide | Estimation obligatoire ou non à la saisie. |
| Q-DEM001-29.4 | Détail tâche / objectif | Confirmation définitive ou corbeille. |
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
| ECR-001 | Aujourd'hui | [`maquettes/ECR-001-aujourdhui.html`](maquettes/ECR-001-aujourdhui.html) | US-006, US-020, US-028, US-003, US-002, US-007, US-011, US-032, US-019, US-017, US-018, US-035 |
| ECR-002 | Tâches (liste priorisée) | [`maquettes/ECR-002-taches-priorisees.html`](maquettes/ECR-002-taches-priorisees.html) | US-004, US-030, US-002, US-003, US-024, US-025, US-009, US-007 |
| ECR-003 | Détail d'un objectif | [`maquettes/ECR-003-detail-objectif.html`](maquettes/ECR-003-detail-objectif.html) | US-001, US-023, US-002, US-024, US-003, US-025, US-030 |
| ECR-004 | Bilan du soir | [`maquettes/ECR-004-bilan-du-soir.html`](maquettes/ECR-004-bilan-du-soir.html) | US-008, US-009, US-003, US-016, US-032, US-011, US-033 |
| ECR-005 | Semaine (planification) | [`maquettes/ECR-005-planification-semaine.html`](maquettes/ECR-005-planification-semaine.html) | US-006, US-027, US-005, US-019, US-020, US-028, US-011 |
| ECR-006 | Saisie rapide (feuille) | Décrite au §4.3 ; état visible dans ECR-001 | US-002 |
| ECR-007 | Détail d'une tâche | À maquetter (LOT-001) | US-002, US-024, US-003, US-025, US-008, US-009 |
| ECR-008 | Objectifs (liste) | À maquetter (LOT-001) | US-001, US-023, US-030 |
| ECR-009 | Réglages (capacité, plages, rappels, compte, thème, raccourcis) | À maquetter | US-005, US-029, US-014, US-022 |
| ECR-010 | Connexion | À maquetter (LOT-001) | US-022, US-014 |
| ECR-011 | Feuille de synchronisation | À maquetter (LOT-001) | US-017, US-018 |
| ECR-012 | Indicateurs (backlog, vélocité) | Lot « Vélocité et pilotage » | US-012, US-013, US-010 |
| ECR-013 | Journal des bilans | Lot « Rappels », selon Q-DEM002-3 | US-034 |

---

## 14. Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-20 | Steeve | Création : principes, tokens, composants, interactions, états, alertes, accessibilité, responsive, points en attente du DAT (confrontés au DAT v0.1 brouillon), questions ergonomiques, inventaire des écrans. |
