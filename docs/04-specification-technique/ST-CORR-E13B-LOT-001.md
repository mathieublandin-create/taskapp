# ST-CORR-E13B-LOT-001 — Corrections d'interface demandées à l'E13b de LOT-001

## 0. En-tête

| Champ | Valeur |
|---|---|
| Objet | Corrections exigées avant la recette (E14) par les volets de Steeve et de Pepper de l'E13b de LOT-001 (`docs/ceremonies/e13b-LOT-001.md` §5.2, §5.3) : FD-LOT-001-2 (DT-034 points 1 et 3, DT-014, E13b-a, Q-ST017-STE-1 b), FD-LOT-001-4 (ANO-005), FD-LOT-001-5 (ANO-004), FD-LOT-001-7 (étapes `@ihm` du premier onglet) |
| Lot | [LOT-001](../lots/LOT-001.md) — **rang 14** « Corrections de l'E13b » (retour en E12 décidé par l'E13b : « Non mature ») |
| Branche d'intégration | `fix/e13b-lot001` (depuis `origin/docs/e13b-starck`, puis fusion de `origin/lot/LOT-001`, PR #45) ; une branche courte par tranche, fusionnée dans `fix/e13b-lot001` après sa revue E13 courte ; une seule PR finale vers `lot/LOT-001` |
| Référentiel | Guide d'ergonomie **v0.2.27** (§6.6.17 ajouté à v0.3 ; v0.2.26 : §2.2, §4.1, §4.8, §4.26, §6.2, §6.6.8, §6.6.12, §6.6.15, §6.6.16) ; glossaire d'étapes **v1.14** (§12) ; `anomalies.md` (ANO-004 Mineure, ANO-005 Majeure) ; registre de la dette **v0.48** (DT-014, DT-034, E13b-a) ; ST-US-017, ST-US-018, ST-US-022, ST-US-024, ST-US-031 ; `conventions.md` v0.4.10 ; `checklist-revue-code.md` |
| Rédacteur | Anthony (E10 des corrections) |
| Réalisation | Benjamin (sonnet), **sept tranches d'au plus 1 j, une à la fois** (OPT-15), §15 |
| Effort | **3,6 j** de développement (hors revues) ; v0.3 : T5a passe de 0,5 à 0,6 j (§15) ; **reste 1,8 j** (T5a 0,6, T5b 0,85, T6 0,35) |
| Statut | v0.4 : T5b arbitrée (tests E2E corrigés, §13.2 bis) ; v0.3 : T1 à T4 réalisées et approuvées ; conception de T5a complétée (§5.1 bis, §5.1 ter), tests rouges de T5a et T5b livrés (§13) ; aucune question bloquante |

Le nom du document suit le précédent des corrections hors US (ANO-007, DT-030, DT-031 ont été spécifiés dans la ST de leur US) ; ici, les corrections touchent cinq US et l'outillage : un document unique est plus lisible. Les ST d'US ne sont pas modifiées ; celles qui sont concernées sont citées au §1.1.

### Historique

| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-11-13 | Anthony | E10 des corrections de l'E13b : conception, 7 tranches, rang 14, 29 tests unitaires (26 rouges, 3 garde-fous verts), 24 tests de navigateur (23 rouges, 1 garde-fou vert), règles de rang, questions non bloquantes Q-CORR-STE-1 à 6. |
| 0.3 | 2026-11-15 | Anthony | Arbitrages de T4 (§6.5 : E2E-ANO-005-FAB-03 borné à la zone visible de la liste, FAB-05 à 650, 600 et 599 px, UT-COMP-US-002-190 validé) ; conception complétée de la feuille modale d'après le guide v0.2.27 §6.6.17 (§5.1 bis : focus sur le titre, focus rendu au bouton, Échap qui ferme la confirmation seule ; §5.1 ter : ligne d'état sans hauteur maximale, passée de T5b à T5a) ; §5.2 : focus de fin de « À lire » (hook à cible calculée) ; §5.4 : intégration de T5a et T5b sans CI rouge, tranches gardées séparées ; tests UT-ANO-005-FEUILLE-08 à 12, E2E-ANO-005-FEUILLE-07 et 08, règle de rang `UT-COMP-CORR` ; UT-ANO-005-FEUILLE-03 corrigé (rôle `dialog` dans le shadow DOM, défaut de l'E10) ; §15 efforts. |
| 0.2 | 2026-11-13 | Anthony | E13 des tranches T1 à T3 (`revue-code-LOT-001-corr-e13b-t1t3.md`) : §2 et §4.5, deux rustines de mise en page déclarées transitoires (retrait à T5b) ; §5.2 bis, retrait des rustines et test E2E-ANO-005-FEUILLE-06 ; §4.2, action de bandeau toujours principale (accord) ; §3.1, place des codes `TXT-…-SOUS-TACHE` ; §9.1 et §12.1, S16b et S16c verts dès T1, revenus au rang 13 ; §13.1, tests UT-DT-014-07 à 10 (variantes non couvertes par UT-DT-014-01 à 06). |
| 0.4 | 2026-11-15 | Anthony | Arbitrage de T5b : six tests E2E corrigés sans être affaiblis (§13.2 bis) ; E2E-ANO-005-FEUILLE-09 (ANO-007 au toucher dans la feuille) ; « Voir » depuis « À lire » ferme la feuille avant de naviguer (§5.2, décision de Benjamin intégrée) ; étapes `@ihm` : écart accepté (§12.2). |

## 1. Résumé technique

Six corrections d'interface, sans changement de domaine, de port, de format de données ni de scénario (hors deux étapes `@ihm` déjà écrites par Pepper) :

1. **Focus visible et zone sûre** (DT-034 points 1 et 3) : anneau `:focus-visible` global, jeton `--dj-focus`, `viewport-fit=cover`, marge de zone sûre de la barre d'onglets, réserve de 88 px sous le « + » (`--dj-marge-fab`, `scroll-padding-bottom`).
2. **Boutons natifs** (DT-014) : classe `bouton-natif` et attribut `data-variante` sur tout `<button>` natif du compte et de la synchronisation.
3. **Textes** (E13b-a, Q-ST017-STE-1 b) : codes `TXT-TERMINER-SOUS-TACHE` et `TXT-ABANDONNER-SOUS-TACHE` ; variantes `une` et `aucune` d'`ERR-016`.
4. **ANO-005** : « + » rond de 56 px sans étiquette ; colonne de 720 px dès 600 px ; feuille « Compte et synchronisation » en `IonModal`, fermée au lancement, qui contient « À lire » et la section « Compte ».
5. **ANO-004** : vue initiale `OUVERTURE` (cadre neutre) jusqu'à ce que l'absence de session soit établie.
6. **FD-LOT-001-7** : deux étapes `@ihm` du premier onglet (S16b, S16c), et adaptation des étapes `@ihm` à la feuille modale.

Hors périmètre : S23 et S24 proposés par Pepper (nom accessible « Nouvel objectif ») ; DT-033 (rail, barre latérale) et DT-034 point 2 (icônes), reportés à LOT-002 par Steeve ; numérotation des dettes et décisions nouvelles (attribuée à la fusion, OPT-20).

### 1.1 Traçabilité

| Demande (source) | Exigence | Section | Tranche | Tests |
|---|---|---|---|---|
| DT-034 point 1 (guide §6.6.16 n° 1, WCAG 2.4.7) | Anneau 2 px plein `--dj-focus`, décalage 2 px (−2 px pleine largeur), pas d'anneau au clic | §2 | T2 | UT-DT-034-02 ; E2E-DT-034-01 à 06 |
| DT-034 point 3 (§2.2, §6.6.16 n° 1, WCAG 2.4.11) | `viewport-fit=cover`, zone sûre, réserve de 88 px, `scroll-padding-bottom` | §2 | T2 | UT-DT-034-01, 02 ; E2E-DT-034-07, 08 |
| DT-014 (§4.1, §6.6.16 n° 2) | `bouton-natif` + `data-variante` | §4 | T3 | UT-DT-014-01 à 06 ; E2E-DT-014-01 à 03 |
| E13b-a, Q-ST024-STE-1 (§6.6.12, §6.6.16 n° 3) | Codes `TXT-…-SOUS-TACHE`, plus de `TODO(` | §3.1 | T1 | UT-E13B-TXT-01 à 04 ; UT-COMP-US-024-13, 15 inchangés |
| Q-ST017-STE-1 b (§6.6.8, §6.6.16 n° 3) | `ERR-016` variantes `une`, `aucune` | §3.2 | T1 | UT-E13B-TXT-05, 06 |
| FD-LOT-001-7 (Pepper §5.2 b) | Étapes du premier onglet de S16b, S16c | §12.1 | T1 | S16b, S16c (`@ihm`) |
| ANO-005 n° 1 (§2.2, §6.6.16 n° 5) | « + » rond 56 px sans étiquette, `title` ; colonne de 720 px | §6 | T4 | UT-ANO-005-FAB-01 ; E2E-ANO-005-FAB-01 à 06 |
| ANO-005 n° 2 (§4.26, §6.6.15, §6.6.16 n° 5) | Feuille modale, ordre, confirmations cliquables | §5 | T5a, T5b | UT-ANO-005-FEUILLE-01 à 07 ; E2E-ANO-005-FEUILLE-01 à 06 ; S16b, S16c, US-022 et US-018 `@ihm` |
| Guide v0.2.27 §6.6.17 (réponses de Steeve) | Focus sur le titre, focus rendu au bouton (Safari), Échap qui ferme la confirmation seule ; ligne d'état ≥ 48 px sans hauteur maximale ; bouton distinct à droite de l'indicateur | §5.1 bis, §5.1 ter, §5.2 | T5a (composant, CSS), T5b (branchement) | UT-ANO-005-FEUILLE-08 à 12 ; E2E-ANO-005-FEUILLE-07, 08 ; UT-COMP-CORR-01 (Benjamin, T5b) |
| ANO-004 (§6.2, §6.6.16 n° 4) | Vue `OUVERTURE` | §7 | T6 | UT-ANO-004-01 à 07 ; E2E-ANO-004-01, 02 |

US concernées (aucun critère, aucune règle ni aucun scénario modifié, contrôle de Pepper §5.2 a) : US-001 et US-002 (« + »), US-017, US-018, US-022, US-031 (feuille, ouverture), US-024 (carte d'incohérence).

## 2. Focus et zone sûre (tranche T2, DT-034 points 1 et 3)

- `index.html` : `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` (ordre exact, UT-DT-034-01).
- `styles.css`, `:root` : `--dj-focus: #2e5bdb; --dj-marge-fab: 88px;` (le jeton sombre `#8aa6ff` viendra avec le thème sombre, ECR-009).
- Règles :

```css
:where(a, button, input, select, textarea, summary, [tabindex], ion-button, ion-fab-button, ion-checkbox, ion-item):focus-visible {
  outline: 2px solid var(--dj-focus);
  outline-offset: 2px;
}
ion-fab-button::part(native):focus-visible, ion-button::part(native):focus-visible {
  outline: 2px solid var(--dj-focus);
  outline-offset: 2px;
}
.barre-onglets button:focus-visible,
.ligne-tache button:focus-visible,
.ligne-objectif button:focus-visible,
.ligne-tache > input[type='checkbox']:focus-visible {
  outline-offset: -2px;
}
.barre-onglets { padding-bottom: env(safe-area-inset-bottom); }
ion-content.contenu-avec-fab { --padding-bottom: var(--dj-marge-fab); }
ion-content.contenu-avec-fab::part(scroll) { scroll-padding-bottom: var(--dj-marge-fab); }
```

- `padding-bottom` de `.barre-onglets` est écrit dans la règle `.barre-onglets` existante (sélecteur seul : E2E-DT-034-07 lit la règle par son sélecteur).
- Aucune déclaration `outline: none` ni `outline: 0` dans `styles.css` (UT-DT-034-02). Si une règle d'Ionic retire le contour d'un composant, la règle `::part(native)` ci-dessus le rétablit ; l'anneau peut être porté par l'hôte ou par le bouton natif du shadow DOM (`contourDuFocus` lit la chaîne du focus).
- Le contrôle 1.4.11 (contraste ≥ 3:1 du jeton) est porté par le guide (5,9:1) ; il n'est pas re-mesuré par les tests.
- **Rustine transitoire (v0.2, hors ST v0.1)** : Benjamin a ajouté `overflow: hidden` à `ion-content.contenu-avec-fab`, pour que la réserve de 88 px ne fasse pas déborder le contenu sur la barre d'onglets quand `ion-content` est écrasé à 0 px par le compte et la feuille de synchronisation encore dans la page (mesure de l'E13 : sans la règle, `main.espace-application` déborde de 87 px à 390 × 600 ; avec une hauteur d'hôte normale, la règle est sans effet, le défilement de la liste étant porté par le `.inner-scroll` du shadow DOM, vérifié à 390 × 844, 390 × 500 et 320 × 360). **Acceptée jusqu'à T5b, retirée par T5b** (§5.2 bis, E2E-ANO-005-FEUILLE-06). Le texte de la règle n'est pas dans le §2 : elle n'est pas un patron à reproduire.

## 3. Textes (tranche T1)

### 3.1 E13b-a : actions de la carte d'incohérence

Trois fichiers dans **le même commit** (`verifier:catalogue` exige l'accord des trois) :

| Fichier | Changement exact |
|---|---|
| `src/commun/presentation/messages/codes.ts` | Ajouter `'TXT-ABANDONNER-SOUS-TACHE'` et `'TXT-TERMINER-SOUS-TACHE'` dans la famille `TXT-`, avant `'TXT-VAL-AUCUNE'` (v0.2 : placés après `TXT-INF-PARENT`, comme livré ; l'ordre de la liste n'est ni alphabétique strict ni contrôlé par `verifier:catalogue`, ma formulation v0.1 était contradictoire : conforme) |
| `src/commun/presentation/messages/catalogue.fr.ts` | `'TXT-ABANDONNER-SOUS-TACHE': { libelle: 'Abandonner la sous-tâche', nomAccessible: 'Abandonner la sous-tâche : « {element} »' }` et `'TXT-TERMINER-SOUS-TACHE': { libelle: 'Terminer la sous-tâche', nomAccessible: 'Terminer la sous-tâche : « {element} »' }` (espaces ordinaires dans le gabarit : `libelle()` pose les insécables) |
| `docs/02-ux/guide-ergonomie.md` §6.6.12, tableau « Actions de la carte d'incohérence » | Colonne « Code » en premier (`` | `TXT-TERMINER-SOUS-TACHE` | … | `` et `` | `TXT-ABANDONNER-SOUS-TACHE` | … | ``), mêmes cellules, colonne « Libellé » supprimée (§6.6.16 n° 3 : modification autorisée par Steeve, version du guide inchangée) |

Puis :
- `src/objectifs-taches/presentation/ui/libelles-ui.ts` : supprimer `terminerSousTache`, `abandonnerSousTache` et la ligne `// TODO(Q-ST024-STE-1) …`.
- `src/objectifs-taches/presentation/ui/composants/carte-incoherence.tsx` : `libelle('TXT-TERMINER-SOUS-TACHE')`, `libelle('TXT-ABANDONNER-SOUS-TACHE')` pour le texte visible ; `libelle('TXT-…', { element }, 'nomAccessible')` pour le nom accessible (même forme que `ETA-TACHE-CASE`). Les codes sont écrits en littéral (UT-E13B-TXT-04).
- Les tests UT-COMP-US-024-13 et 15 restent valables sans modification (textes identiques).

### 3.2 Q-ST017-STE-1 b : variantes d'`ERR-016`

- `catalogue.fr.ts`, entrée `ERR-016` : ajouter `variantes: { une: { texte: 'Votre modification est conservée sur cet appareil. L’application réessaie toute seule ; vous pouvez aussi réessayer maintenant.' }, aucune: { texte: 'L’application réessaie toute seule ; vous pouvez aussi réessayer maintenant.' } }` ; titre, texte de base (n ≥ 2) et action inchangés.
- Guide §6.6.8, ligne `ERR-016` : ajouter dans la colonne « Texte exact » « variante `une` (n = 1) : … ; variante `aucune` (n = 0) : … » (mêmes textes).
- `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts`, `modeleCartes` : la carte `ERR-016` reçoit `variante: 'aucune'` si `nombreLignes = 0`, `'une'` si `nombreLignes = 1`, aucune variante sinon. Signature imposée de l'aide `carte` : `variante?: 'carte' | 'une' | 'aucune'` (le titre et l'action ne lisent jamais la variante : `libelle(message, variables, 'action')` reste sans variante).
- Les lignes « modifications en attente » restent à l'intitulé seul (Q-ST017-STE-1 a) : aucun changement de code.

## 4. Boutons natifs (tranche T3, DT-014)

### 4.1 Règle

Tout `<button>` natif des dossiers `src/compte/presentation/ui/` et `src/synchronisation/presentation/ui/` porte **en littéral** `className="bouton-natif"` (UT-DT-014-06 compte les balises) et, sauf pour la variante par défaut (secondaire), `data-variante="principal" | "tertiaire" | "danger"`. Les boutons des lignes (`.ligne-*`), de la barre d'onglets, des puces et filtres (§4.3, §4.4) et de la boîte de confirmation ne changent pas. Les `IonButton` ne changent pas. Les attributs existants (`data-action`, `data-etat`, `data-rouge`, `aria-*`, `ref`) sont conservés.

### 4.2 Attribution (guide §4.1 : un seul principal par écran)

| Composant | Bouton | `data-variante` |
|---|---|---|
| `EcranConnexion.tsx` | « Continuer avec Google » / « Réessayer » | `principal` |
| `SuppressionBloquee.tsx` (`ERR-017`) | « Réessayer » | `principal` |
| | « Aller à la connexion » | — (secondaire) |
| `SectionCompte.tsx` | « Se déconnecter » (`SE_DECONNECTER`) | — |
| | « Supprimer les données de cet appareil » (`SUPPRIMER_DONNEES`) | `danger` |
| `IndicateurSynchronisation.tsx` | « Reprendre la synchronisation » (`SYN-SESSION`) | — |
| `Bandeau.tsx` | « Se reconnecter », « Mettre à jour » (consultation seule), « Reprendre la synchronisation » (`BAN-RAPPEL-24H`, variante `session`) | `principal` (v0.2 : l'action unique d'un bandeau est toujours principale, sans condition ; accord de l'E13, UT-DT-014-10) |
| | « Masquer le rappel » | `tertiaire` |
| `FeuilleSynchronisation.tsx` | « Synchroniser maintenant » | — |
| | Action de carte `METTRE_A_JOUR` (`ALR-016`, `ERR-013`) | `principal` |
| | Autres actions de carte (`ERR-011` « Ouvrir Google Drive », `ERR-016` « Réessayer maintenant ») | — |
| `ModificationsNonRetenues.tsx` | « Voir … », « Compris », bascule `SEC-MODIFS-EFFACEES` | `tertiaire` |
| `ChoixRestauration.tsx` | `RESTAURER` | `principal` (remplace `className="primaire"`) |
| | `REPARTIR_DE_ZERO` | `danger` (`data-rouge` conservé) |
| | `DECIDER_PLUS_TARD`, « Fermer » de la feuille de choix | `tertiaire` |
| | `ANNULER_DEMANDE` | — |
| `FeuilleCompteEtSynchronisation.tsx` (§5) | « Fermer », bouton d'ouverture | `tertiaire` |

Implémentation de `BoutonCarte` (`FeuilleSynchronisation.tsx`) : nouvelle propriété `variante?: 'principal'`, passée par `CarteErreur` et `CarteNouvelleVersion` quand `action.type === 'METTRE_A_JOUR'`.

### 4.3 CSS (`src/commun/presentation/ui/styles.css`)

Ajouter au bloc `:root` : `--dj-on-accent: #fff; --dj-bord-fort: #8a8a94; --dj-texte: #1c1c21;` (jetons du guide §3.1). Règles (valeurs du guide §4.1) :

```css
.bouton-natif {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--dj-bord-fort);
  border-radius: 10px;
  background: transparent;
  color: var(--dj-texte);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
}
.bouton-natif[data-variante='principal'] { border-color: var(--dj-accent); background: var(--dj-accent); color: var(--dj-on-accent); }
.bouton-natif[data-variante='tertiaire'] { padding: 0 8px; border: 0; color: var(--dj-accent); }
.bouton-natif[data-variante='danger'] { border-color: var(--dj-danger); color: var(--dj-danger); }
@media (hover: hover) {
  .bouton-natif:not([aria-disabled='true']):hover { background-color: color-mix(in srgb, currentcolor 8%, transparent); }
  .bouton-natif[data-variante='principal']:not([aria-disabled='true']):hover { background-color: color-mix(in srgb, var(--dj-accent) 92%, var(--dj-texte)); }
}
.bouton-natif:not([aria-disabled='true']):active { background-color: color-mix(in srgb, currentcolor 16%, transparent); }
.bouton-natif[aria-disabled='true'] { opacity: 0.4; cursor: not-allowed; }
```

`color-mix` est admis (Chromium ≥ 111, cible ADR-013). Le principal garde son fond accent au survol, assombri (le guide ne fixe pas cette nuance : choix de conception, signalé à Steeve par le contrôle de l'E14). `:disabled` (bouton de connexion en cours) reçoit la même apparence que `aria-disabled` : ajouter `.bouton-natif:disabled` au dernier sélecteur.

### 4.3 bis Rustine transitoire de mise en page (v0.2, hors ST v0.1)

Avec des boutons de 44 px, le compte et la feuille de synchronisation, encore rendus dans `main.espace-application`, laissaient 88 px (réserve comprise) à la liste dans l'application réelle (mesure de l'E13 à 390 × 844 : hôte de `ion-content` de 88 px de haut ; 160 px avant T3 d'après Benjamin ; scénario S16 en échec). Benjamin a ajouté `overflow-y: auto` à `.espace-application`, `flex: 1 0 auto` et `min-height: 70dvh` à `.espaces` : la page défile et la liste garde au moins 70 % de la hauteur. **Acceptée jusqu'à T5b** (la page est alors à 1 235 px de haut pour 844 : c'est l'état d'ANO-005 lui-même, qui disparaît avec la feuille modale), **retirée par T5b** (§5.2 bis). Aucune règle de CSS nouvelle ne doit s'appuyer sur ces valeurs.

### 4.4 Périmètre laissé hors correction

Les `<button>` natifs d'`objectifs-taches` hors lignes et puces (`champ-detail.tsx`, `action-fin.tsx`, `carte-incoherence.tsx`, `messages-refus.tsx`, `selecteur-parent.tsx`, `section-sous-taches.tsx`, `detail-tache.tsx`, `liste-objectifs.tsx`) ne sont pas dans la liste de Steeve (§5.3 « Travail pour Benjamin » n° 2 : « compte et synchronisation ») alors que le guide §4.1 dit « tout `<button>` natif ». Choix par défaut : hors correction (dette candidate **CORR-a**, §16.1), question **Q-CORR-STE-3**. Si Steeve les exige : +0,5 j, même règle, dans T3.

## 5. Feuille « Compte et synchronisation » modale (tranches T5a et T5b, ANO-005 n° 2)

### 5.1 Composant `FeuilleCompteEtSynchronisation` (T5a)

Fichier : `src/synchronisation/presentation/ui/FeuilleCompteEtSynchronisation.tsx` (squelette livré, signatures imposées). Libellés : `src/synchronisation/presentation/ui/libelles-feuille.ts` (livré, complet : `titre`, `ouvrir`, `fermer`).

```ts
export const ID_FEUILLE_SYNCHRONISATION = 'feuille-synchronisation';
export const MEDIA_PANNEAU_LATERAL = '(min-width: 1024px)';
export type ProprietesFeuilleCompteEtSynchronisation = {
  readonly ouverte: boolean;
  readonly surFermee: () => void;
  readonly aLire?: ReactNode;
  readonly synchronisation?: ProprietesFeuilleSynchronisation;
  readonly compte?: ReactNode;
  readonly dialogues?: ReactNode;
  readonly refBoutonOuverture?: RefObject<HTMLButtonElement | null>; // v0.3, §5.1 bis
  readonly refTitre?: RefObject<HTMLHeadingElement | null>;          // v0.3, §5.1 bis
};
export const FeuilleCompteEtSynchronisation: (p: ProprietesFeuilleCompteEtSynchronisation) => ReactElement;
export type ProprietesBoutonFeuille = { readonly ouverte: boolean; readonly surOuvrir: () => void; readonly refElement?: Ref<HTMLButtonElement> };
export const BoutonFeuille: (p: ProprietesBoutonFeuille) => ReactElement;
```

Rendu imposé de `FeuilleCompteEtSynchronisation` :

```tsx
<IonModal
  id={ID_FEUILLE_SYNCHRONISATION}
  className="feuille-synchronisation"
  aria-label={LIBELLES_FEUILLE.titre}
  isOpen={ouverte}
  initialBreakpoint={panneau ? 1 : 0.92}
  breakpoints={panneau ? [0, 1] : [0, 0.92]}
  expandToScroll={false}
  handle={!panneau}
  onDidPresent={focaliserLeTitre}
  onDidDismiss={surFinDeFermeture}
>
  <div className="feuille-contenu">
    <header className="feuille-entete">
      <h2 tabIndex={-1} ref={refH2}>{LIBELLES_FEUILLE.titre}</h2>
      <button type="button" className="bouton-natif" data-variante="tertiaire" onClick={surFermee}>{LIBELLES_FEUILLE.fermer}</button>
    </header>
    <IonContent className="feuille-corps">
      {aLire}
      {synchronisation === undefined ? null : <FeuilleSynchronisation {...synchronisation} />}
      {compte}
    </IonContent>
    {dialogues}
  </div>
</IonModal>
```

- `panneau` = `window.matchMedia?.(MEDIA_PANNEAU_LATERAL).matches === true`, lu **à chaque ouverture** (hook `usePanneauLateral(ouverte)` local au fichier ; `matchMedia` absent, comme dans jsdom : `false`). Pas d'écoute du redimensionnement (feuille ouverte puis fenêtre redimensionnée : la géométrie suit à la prochaine ouverture ; limite acceptée).
- « Fermer » appelle `surFermee` directement (la feuille se démonte par `isOpen=false`) ; Échap, geste retour, glissement et fond passent par `onDidDismiss`. `surFermee` doit être idempotent (le parent remet `ouverte` à `false`). v0.3 : `onDidDismiss` passe par `surFinDeFermeture` (§5.1 bis), qui appelle aussi `surFermee`.
- `dialogues` est rendu **dans** la modale, après le corps : une boîte `.scrim` hors de la modale verrait son focus repris par le piège de focus d'Ionic (`trapKeyboardFocus`, `ion-modal` est le dernier overlay présenté) ; c'est la variante « focus » du piège d'ANO-007. Dans la modale, `.scrim` (`position: fixed`) est positionné par rapport au conteneur transformé de la feuille : la boîte est centrée dans la feuille (comme la confirmation de la saisie rapide).
- Ordre du corps (guide §6.6.15) : `aLire`, puis la section « Synchronisation » (qui commence déjà par `ALR-016` et finit par `ALR-015` puis « Stockage »), puis `compte`. `FeuilleSynchronisation` n'est pas modifiée (hors §4).

`BoutonFeuille` :

```tsx
<button ref={refElement} type="button" className="bouton-natif" data-variante="tertiaire" data-action="OUVRIR_FEUILLE"
  aria-haspopup="dialog" aria-expanded={ouverte} aria-controls={ID_FEUILLE_SYNCHRONISATION} onClick={surOuvrir}>
  {LIBELLES_FEUILLE.ouvrir}
</button>
```

Choix par défaut (Q-CORR-STE-1, option a) : un bouton distinct, à droite de l'indicateur sur la ligne d'état, plutôt que l'indicateur lui-même. Raison : l'indicateur `SYN-SESSION` porte déjà le bouton « Reprendre la synchronisation » (un bouton ne peut contenir un bouton) et les étapes `@ihm` lisent `indicateur(page).getByRole('button')` comme ce seul bouton ; un second bouton dans le `role="status"` les rendrait ambiguës. L'indicateur reste inchangé.

CSS (`styles.css`) :

```css
ion-modal.feuille-synchronisation .feuille-contenu { display: flex; flex-direction: column; height: 100%; }
ion-modal.feuille-synchronisation .feuille-entete { display: flex; align-items: center; justify-content: space-between; min-height: 52px; padding: 0 8px 0 16px; flex: none; }
ion-modal.feuille-synchronisation .feuille-corps { flex: 1; }
@media (width >= 600px) and (width < 1024px) { ion-modal.feuille-synchronisation { --width: 640px; } }
@media (width >= 1024px) { ion-modal.feuille-synchronisation { --width: 400px; --height: 100%; --border-radius: 0; justify-content: flex-end; } }
```

### 5.1 bis Focus et Échap dans l'`IonModal` (T5a, v0.3, guide v0.2.27 §6.6.17)

Trois comportements, dans `FeuilleCompteEtSynchronisation.tsx` et `boite-confirmation.tsx`. Mesures faites sur Ionic 9.0.9 (code de `overlays`) et vérifiées par une réalisation locale annulée (§13.1, ajouts de la v0.3).

| # | Comportement | Réalisation imposée | Raison technique |
|---|---|---|---|
| 1 | **Ouverture : focus sur le titre `h2`** | `const titreInterne = useRef<HTMLHeadingElement>(null); const refH2 = refTitre ?? titreInterne;` ; `<h2 tabIndex={-1} ref={refH2}>` ; `focaliserLeTitre = () => { refH2.current?.focus(); }` passé à `onDidPresent` | Ionic émet `didPresent` puis, si le focus n'est pas dans l'overlay, focalise l'enveloppe du shadow DOM (`keyboardClose`) : un focus posé dans `onDidPresent` (synchrone) est dans la feuille et n'est donc plus déplacé. Pas de `autoFocus`, pas de `useEffect` (la feuille n'est pas encore présentée). |
| 2 | **Fermeture : focus rendu au bouton d'ouverture s'il ne l'a pas** | `surFinDeFermeture = () => { surFermee(); queueMicrotask(rendreLeFocus); }` avec `rendreLeFocus = () => { const bouton = refBoutonOuverture?.current; if (bouton != null && document.activeElement !== bouton) bouton.focus(); }` | Ionic rend le focus à l'élément actif **au moment de la présentation**, et seulement si le focus est sur `body` à la fin. Sous Safari, un clic ne donne pas le focus au bouton : l'élément mémorisé est `body`, rien n'est rendu. **Le report par `queueMicrotask` est obligatoire** : pendant `didDismiss`, l'overlay n'a pas encore la classe `overlay-hidden` ; il est donc encore « au sommet » et le piège de focus d'Ionic ramène dans la feuille tout focus posé dehors (constaté : focus sur `body` à la fin, UT-ANO-005-FEUILLE-09 et 10 rouges si l'appel est synchrone). Pas de `setTimeout` (ordre non garanti face au rendu). |
| 3 | **Échap avec une confirmation ouverte dans la feuille : la confirmation seule se ferme** | `boite-confirmation.tsx`, `useToucheEchap` : écoute en **phase de capture** sur `document` (`addEventListener('keydown', surTouche, true)`, même retrait), et pour `Escape` seulement : `evenement.stopPropagation()` puis `surAnnuler()` ; les autres touches ne sont pas touchées | Ionic écoute `keydown` sur `document` en phase de bouillonnement et ferme l'overlay du sommet (`backdropDismiss`) ; la boîte écoutait au même endroit, après lui : les deux se fermaient. La capture sur `document` passe avant, et `stopPropagation` empêche l'écoute d'Ionic (même nœud, phase suivante). Effet global voulu : une boîte de confirmation est toujours au-dessus de tout overlay ; la confirmation de la saisie rapide (dans `ion-modal.saisie-rapide`) en bénéficie aussi. Ni `canDismiss`, ni `backdropDismiss={false}` (le fond doit continuer de fermer la feuille). |

Hors de ces trois points, rien n'est ajouté : pas de piège de focus maison (celui d'Ionic suffit, guide §6.6.17 « Ordre de focus »), pas d'écoute de `keydown` dans la feuille. Le rôle `dialog`, `aria-modal="true"` et le nom (`aria-label`, hérité de l'hôte) sont portés par Ionic sur l'enveloppe `.modal-wrapper` du shadow DOM : c'est là qu'UT-ANO-005-FEUILLE-03 les lit (v0.3).

### 5.1 ter Ligne d'état (T5a pour la CSS, T5b pour le rendu ; guide v0.2.27 §6.6.17 n° 1 et 4)

- CSS (`styles.css`, règle unique, sélecteur seul, ajoutée par T5a) : `.ligne-etat { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 8px; min-height: 48px; padding: 0 8px 0 16px; }`. **Aucune** déclaration `max-height`, `height`, `block-size`, `overflow`, `white-space`, `text-overflow` ni `line-clamp` dans une règle qui vise `.ligne-etat` ou ses descendants (UT-ANO-005-FEUILLE-12) : avec le texte agrandi, le libellé « Compte et synchronisation » passe sur deux lignes, jamais tronqué.
- Bouton : `BoutonFeuille` (§5.1), **distinct** de l'indicateur, rendu après lui dans la `div.ligne-etat` (donc à sa droite) ; nom accessible exact « Compte et synchronisation » (son texte visible, WCAG 2.5.3) ; jamais à l'intérieur du `role="status"` (E2E-ANO-005-FEUILLE-07).
- La règle est sans effet avant T5b (aucun élément `.ligne-etat` dans la page) : elle n'introduit aucune régression à T5a.

### 5.2 Branchement dans `src/main.tsx` (T5b)

- État d'interface `feuilleOuverte: boolean` (`useState(false)`) **dans `Application`** (il commande aussi l'emplacement des dialogues). Remis à `false` quand `vue.racine.ecran !== 'APPLICATION'` (fin de session : la feuille ne survit pas à la déconnexion).
- `EspaceApplication` : structure imposée de `main.espace-application` :
  1. `<div className="ligne-etat">` : `IndicateurSynchronisation` puis `BoutonFeuille` (présent dès que `vue.indicateur` l'est) ;
  2. `Bandeau`, puis `Toast` (inchangés, hors défilement) ;
  3. `EcransObjectifs`.
  La section « Compte » et `ALire` ne sont **plus** rendus dans `main` ; `FeuilleSynchronisation` non plus.
- `FeuilleCompteEtSynchronisation` est rendue par `EspaceApplication` (hors de `main` : fragment après `</main>`), avec `aLire={<ALire …/>}`, `synchronisation` (props actuelles de `FeuilleSynchronisation`, choix de restauration compris), `compte={<SectionCompte …/>}`, `dialogues={feuilleOuverte ? <Dialogues …/> : undefined}`.
- `Application` rend `<Dialogues …/>` à la racine **seulement si la feuille est fermée** (un seul exemplaire monté).
- `FeuilleChoixRestauration` (ECR-011 E) reste hors de la feuille, inchangée (guide §6.6.15 : « elle a sa propre feuille »).
- Focus de fin de « À lire » (DT-028, `useFocusFinALire`) : cible = `BoutonFeuille` quand la feuille est fermée, et le titre `h2` de la feuille (`tabIndex={-1}`) quand elle est ouverte (Q-CORR-STE-6, confirmé par Steeve). L'indicateur cesse d'être la cible (`tabIndex={-1}` conservé, sans effet). **v0.3, réalisation imposée** :
  - `focus-fin-a-lire.ts` : signature étendue, compatible : `useFocusFinALire<T extends HTMLElement>(sectionPresente: boolean, cible?: () => HTMLElement | null): RefObject<T | null>` ; si `cible` est fournie, l'effet focalise `cible()` au lieu de la référence rendue (même condition : section disparue et focus sur `body`). UT-COMP-US-017-3-15 et 16 inchangés.
  - `EspaceApplication` : `const refBouton = useRef<HTMLButtonElement>(null); const refTitre = useRef<HTMLHeadingElement>(null);` ; `useFocusFinALire(vue.nonRetenues !== undefined, () => (feuilleOuverte ? refTitre.current : refBouton.current))` ; `BoutonFeuille refElement={refBouton}` ; `FeuilleCompteEtSynchronisation refBoutonOuverture={refBouton} refTitre={refTitre}`.
  - Test à écrire par Benjamin dans T5b : **UT-COMP-CORR-01** (jsdom, `tests/unitaires/synchronisation/presentation/ui/focus-fin-a-lire-feuille.test.tsx`, rang 14 par la règle `UT-COMP-CORR-\d+` déjà posée) : feuille ouverte, `aLire` avec un bouton « Compris » qui retire la section, hook appelé avec la cible calculée : après le clic, `document.activeElement` est le `h2` de la feuille ; feuille fermée : le bouton d'ouverture. Il doit rougir si `refTitre` est ignorée par la feuille ou si `cible` est ignorée par le hook.
- **« Voir » depuis « À lire » (v0.4, décision de Benjamin intégrée)** : `surVoir` ferme la feuille (`surFermerFeuille()`) puis navigue (`voir(element)`). Raison : la feuille est modale et couvre la liste, l'élément visé resterait masqué et inatteignable derrière le fond. Ce comportement n'est pas écrit au guide (§6.6.15) : question de confirmation à Steeve (Q-CORR-STE-7, non bloquante). `main.tsx` est exclu de la couverture : pas de test unitaire ; couverture par revue de code uniquement (dette de test ouverte, reliquat noté pour Benjamin : un scénario `@ihm` « Voir » serait à ajouter à LOT-002 si une entrée « À lire » est simulable).
- Ligne d'état : CSS posée par T5a (§5.1 ter), **sans hauteur maximale** (Q-CORR-STE-4 corrigée par Steeve). Le bandeau garde sa hauteur naturelle sous la ligne.

### 5.2 bis Retrait des rustines de T2 et T3 (T5b, v0.2)

À T5b, quand `main.espace-application` ne contient plus que la ligne d'état, le bandeau et les espaces, **retirer** de `styles.css` :

| Règle | Retrait |
|---|---|
| `ion-content.contenu-avec-fab { overflow: hidden; }` (et son commentaire) | supprimer la déclaration, garder `--padding-bottom` |
| `.espace-application { overflow-y: auto; }` | supprimer la déclaration |
| `.espaces { flex: 1 0 auto; min-height: 70dvh; }` et son commentaire | revenir à `flex: 1; min-height: 0;` |

Test : **E2E-ANO-005-FEUILLE-06** (`tests/e2e/feuille-synchronisation.e2e.ts`, rang 14, à 390 × 844 et à 360 × 480, rouge depuis l'E13 de T1 à T3 : la page défile de 391 et 524 px). Il vérifie, sur l'application réelle : défilement de la page nul (`scrollHeight - clientHeight ≤ 0`), les valeurs calculées des trois règles (`overflow-y: visible`, `min-height: 0px`, `flex: 1 1 0%`, `overflow: visible` de la liste), la liste à plus de la moitié de la hauteur de l'écran, et, avec 8 tâches, la dernière ligne entièrement visible, centre dégagé, au-dessus du « + » après défilement de la liste. Si une autre règle de mise en page est nécessaire à T5b, elle est justifiée par écrit dans la revue de T5b, pas ajoutée en silence.

### 5.2 ter Intégration continue de T5a et de T5b (v0.3)

**Décision : T5a et T5b restent deux tranches séparées** ; les fusionner n'est pas nécessaire pour garder `fix/e13b-lot001` verte.

- **T5a laisse la branche intégrable** : le composant, le bouton, la CSS de la feuille et de `.ligne-etat` ne sont branchés nulle part (`main.tsx` inchangé) ; seul effet visible dans l'application : la boîte de confirmation consomme Échap (§5.1 bis n° 3), sans changement pour les confirmations hors overlay (mesuré : `pnpm test` au rang 13 vert, `boites-confirmation.e2e.ts` 9 sur 9, avec cette modification). `cucumber:ihm` ne voit aucune différence : S16b, S16c et les 13 scénarios restent verts. Contrôle de T5a : `RANG_COURANT=14 pnpm test -t "UT-ANO-005-FEUILLE"` (12 sur 12), plus les familles des tranches précédentes (§9.1).
- **T5b se livre en un seul commit atomique** (ou une suite de commits dont **chacun** garde `cucumber:ihm` vert) : le déplacement de « Compte » et d'« À lire » dans la feuille (`main.tsx`) rend rouges les étapes qui lisent « Compte » dans la page ; l'adaptation des étapes (§12.2, ouverture de la feuille dans `boutonDeLaSectionCompte`) et le branchement vont donc **ensemble**. Ordre conseillé dans la branche courte, sans pousser d'état intermédiaire : (1) étapes `@ihm` écrites pour fonctionner **dans les deux états** (si le bouton « Compte et synchronisation » existe et que la feuille est fermée, l'ouvrir ; chercher dans le `dialog` s'il est présent, sinon dans `espaceApplication`) : la branche reste verte ; (2) branchement de `main.tsx` ; (3) retrait des trois rustines (§5.2 bis) ; (4) suppression de la branche « sans feuille » des étapes (étape définitive du §12.2). La revue E13 de T5b vérifie que le dernier état ne garde aucune double voie.
- **Pourquoi pas une fusion** : T5a est testable seule (12 tests jsdom et CSS), son E13 courte isole les points délicats (focus, Échap, report par micro-tâche) avant le branchement ; T5a + T5b ferait 1,45 j, au-delà de la limite d'1 j par tranche (OPT-15).

### 5.3 Ce qui ne change pas

Modèles de vue de la feuille et du compte, contrôleur (`VueInterface`), `FeuilleSynchronisation` (hors §4), `SectionCompte` (hors §4) : ligne « Fuseau » maintenue dans « Compte » (guide §4.26 ; Q-CORR-STE-2, le §6.6.15 la cite dans « Synchronisation »).

## 6. « + » et colonne (tranche T4, ANO-005 n° 1)

### 6.1 `BoutonFlottant` (`src/commun/presentation/ui/bouton-flottant.tsx`)

```tsx
<IonFab slot="fixed" vertical="bottom" horizontal="end">
  <IonFabButton aria-label={libelle} title={libelle} onClick={surClic}>+</IonFabButton>
</IonFab>
```

Plus d'étiquette ni de `div.bouton-flottant` ; règles `.bouton-flottant` et `.bouton-flottant-etiquette` retirées de `styles.css`. Signature inchangée. Les libellés restent `LIBELLES_TACHES.ajouterTache` et `LIBELLES_OBJECTIFS.creerObjectif` (Q-CORR-STE-5 : « Créer un objectif » ou « Nouvel objectif »).

### 6.2 CSS

```css
.espaces-contenu ion-fab { right: 16px; bottom: 16px; }
.espaces-contenu ion-fab-button { --border-radius: 50%; width: 56px; height: 56px; }
@media (width >= 600px) { .espaces { width: 100%; max-width: 720px; margin-inline: auto; } }
```

Le « + » est positionné dans l'`ion-content` de la liste ; la colonne le contraint, il s'aligne donc sur le bord droit de la colonne (guide §2.2 : `max(16px, calc((100vw - 720px) / 2 + 16px))` du bord de la fenêtre, même résultat). La barre d'onglets étant dans `.espaces`, elle prend la largeur de la colonne (§6.6.16 n° 5).

### 6.3 Réserve de 88 px (avec T2)

`ListeTaches` et `ListeObjectifs` : `<IonContent className="contenu-avec-fab">`. Voir §2 pour les règles (`--padding-bottom`, `::part(scroll)`).

### 6.4 Tests de navigateur antérieurs

Le test « les « + » des deux onglets se distinguent par leur libellé visible » (`mise-en-page-smartphone.e2e.ts`, ANO-002) est **retiré** par cette E10 et remplacé par E2E-ANO-005-FAB-06 (nom accessible et `title`) : la décision de Steeve supprime l'étiquette visible (traçabilité : commentaire en place, §13.2).

### 6.5 Arbitrages de T4 (v0.3)

| # | Point soulevé par Benjamin | Décision | Preuve |
|---|---|---|---|
| a | E2E-ANO-005-FAB-03 rouge : la seule ligne contrôlée « recouverte » a son centre à y = 48, sous la barre d'en-tête, hors de la liste ; le test prenait toute la fenêtre (`0 < y < innerHeight`) comme zone visible | **Test corrigé (défaut de mon E10), sans affaiblissement.** La zone contrôlée est la boîte de l'`ion-content.contenu-avec-fab` (la liste, qui contient le « + »). Renforcé : au moins 5 lignes contrôlées et la dernière obligatoirement dans la zone (le test ne peut plus passer à vide) ; défilement par `scrollToBottom` de cette même liste. | Vert sur T4. Mutations locales annulées, **toutes rouges** : « + » déplacé sur la liste (`right: 120px; bottom: 300px`) ; « + » de 300 px de large sans réserve (`--dj-marge-fab: 0px`, cas de l'ancienne étiquette). |
| b | Seuil de 600 px non protégé (768 et 599 seulement) | **Cas ajoutés à E2E-ANO-005-FAB-05** : à 650 et à 600 px, colonne de la largeur de la fenêtre **et** `max-width` calculé `720px` (la règle s'applique) ; à 599 px, `max-width: none`. | Mutations rouges : seuil à 640 px, `width > 600px`, seuil à 599 px. |
| c | UT-COMP-US-002-190 modifié : `.bouton-flottant-etiquette` → `aria-label` d'`ion-fab-button` | **Validé.** L'étiquette n'existe plus par décision de Steeve (§6.1) ; le test lit maintenant le nom accessible, même valeur exacte (`toBe('Ajouter une tâche')`), même force ; la seconde moitié (touche N) est inchangée. `title` est contrôlé en navigateur par E2E-ANO-005-FAB-06. Pas un affaiblissement. | Diff de `c23822b`. |

## 7. ANO-004 : vue initiale `OUVERTURE` (tranche T6)

### 7.1 Modèle de vue (`src/compte/presentation/modeles-de-vue/racine.ts`)

```ts
export type EtatOuverture = 'EN_COURS' | 'ETABLIE';
export type ModeleVueRacine =
  | { readonly ecran: 'OUVERTURE' }
  | { readonly ecran: 'CONNEXION' }
  | { readonly ecran: 'ATTENTE_GOOGLE'; …inchangé }
  | { readonly ecran: 'APPLICATION' };
export const construireRacine = (etat: EtatSession, ouverture: EtatOuverture = 'ETABLIE'): ModeleVueRacine;
```

`SANS_SESSION` et `EN_COURS` → `OUVERTURE` ; sinon inchangé. La valeur par défaut garde le banc (`racineDe`, `etapes-compte.ts`) inchangé. Le guide écrit `ESPACE` : le code garde `APPLICATION` (nom existant, même sens).

### 7.2 Contrôleur (`src/composition/controleur-interface.ts`)

- Champ privé `#ouvertureEtablie = false` (dans `Etat` : `ouvertureEtablie: boolean`).
- Vue initiale du constructeur : `racine: { ecran: 'OUVERTURE' }`.
- `#calculerVue` : si `session.type !== 'SANS_SESSION'`, poser `ouvertureEtablie = true` (une session vue établit l'ouverture : sa fermeture mène à `CONNEXION`) ; puis `racine: construireRacine(session, ouvertureEtablie ? 'ETABLIE' : 'EN_COURS')`.
- `apresOuverture` : `ouvertureEtablie = true` **avant** tout autre traitement (toute issue).
- `continuerAvecGoogle` : `ouvertureEtablie = true` en première instruction (le geste prouve que l'écran de connexion a été vu).

### 7.3 Composition (`src/composition/web.ts`)

`void ouverture.then((issue) => apresOuvertureWeb(…), () => controleur.apresOuverture({ type: 'ECRAN_CONNEXION' }))` : un rejet de l'ouverture (jamais attendu) ne laisse pas le cadre neutre affiché indéfiniment. Le message de « plus de 10 s » du guide §6.2 n'est pas réalisé (la lecture est locale ; l'issue arrive toujours) : noté en §16.1.

### 7.4 Rendu (`src/compte/presentation/ui/Racine.tsx`)

`case 'OUVERTURE': return <main className="cadre-ouverture" aria-busy="true" />;` CSS : `.cadre-ouverture { min-height: 100dvh; background: var(--ion-background-color, #fff); }`. Aucun texte, aucune icône, aucune animation, aucun `data-*` (UT-ANO-004-02 ; US-031 S14 et S19 lisent `[data-etat], main.espace-application, [data-action]` comme « écran de Done Juan »).

## 8. Gestion des erreurs

Aucune erreur métier nouvelle. `matchMedia` absent : feuille basse (§5.1). Rejet de l'ouverture : §7.3. La feuille ne se rouvre pas d'elle-même après une erreur ; les erreurs qui demandent une action restent signalées par l'indicateur (`SYN-ACTION`) et le bandeau, comme avant.

## 9. Patterns imposés et outillage de test

### 9.1 Rang 14 et sélection des tests (choix du rang)

**Choix : un seul rang, 14 « Corrections de l'E13b », réalisé en tranches.** C'est le précédent des rangs 11 à 13 (tranches d'un même rang, `rangCourant` porté par la dernière). Pourquoi pas le rang 13 : ses tests sont sélectionnés par `lot/LOT-001` (rang courant 13) ; les tests rouges y casseraient `pnpm test`. Pourquoi pas un rang par tranche (14 à 20) : un rang code une étape de l'ordre de réalisation du lot (`LOT-001.md`), pas une tranche ; sept rangs de plus rendraient la liste des scénarios par rang illisible et ne protégeraient que des tranches d'une demi-journée.

Conséquences (mises en place par cette E10) :
- `rangs-tests.json` : règle `(?:UT|E2E)-(?:E13B-TXT|DT-014|DT-034|ANO-004|ANO-005-(?:FAB|FEUILLE))-\d+` → 14, en deuxième position (après `UT-OUT`).
- **Tests de navigateur** : `playwright.config.ts` applique `grepInvert: motifTestsNonLivres(regles, rangCourant)` (`tests/support/rangs/selection-rangs.ts`, UT-OUT-13) ; un test `E2E-…` ne s'exécute qu'à partir de son rang ; les tests sans identifiant s'exécutent toujours. UT-OUT-14 : tout identifiant `E2E-…` a un rang. `RANG_COURANT=14 pnpm e2e -g "E2E-DT-034"` pour une tranche.
- **Scénarios** : `rangs-scenarios.json` : US-031 S16b et S16c passaient de 13 à 14 en v0.1 (étapes du premier onglet absentes) ; **v0.2 : revenus au rang 13** (E13 de T1 à T3 : T1 les a rendus verts, 13 scénarios `@ihm` sur 13 au rang 14, et le prérequis « feuille modale » n'en est pas un tant que la section « Compte » est dans la page ; ils tournent ainsi dans la CI à chaque tranche et gardent ANO-006 ; T5b les rejoue sur la feuille) ; les scénarios `@recette` (US-018 S09b, US-022 S13b) passent de 14 à **15** (« Recette (E14) », qui suit désormais les corrections ; `conventions.md` §11.13 v0.4.10).
- Pendant T1 à T5b, `rangCourant` reste 13 : `pnpm test`, `pnpm cucumber`, `pnpm cucumber:ihm` et `pnpm e2e` restent verts sur `fix/e13b-lot001` ; chaque tranche se contrôle par `RANG_COURANT=14 pnpm test -t "<famille>"`, `RANG_COURANT=14 pnpm e2e -g "<famille>"`. **T6 porte `rangCourant = 14`** (et le retire de `RANG_COURANT` : plus aucune variable).
- Un test d'une tranche déjà revue ne doit jamais redevenir rouge : la revue E13 de chaque tranche relance les familles des tranches précédentes avec `RANG_COURANT=14`.

### 9.2 Serveur `test-ihm` partagé

`playwright.config.ts` déclare un troisième `webServer` (port 4175, `dist-test-ihm`, construit seulement s'il manque) ; `onglets.e2e.ts` ne démarre plus son propre serveur. Raison : trois fichiers l'utilisent désormais (`onglets`, `feuille-synchronisation`, `ouverture`) ; lancés en parallèle (`fullyParallel`), ils se seraient disputé le port (`strictPort`). En local, refaire `pnpm build:test-ihm` après un changement de `src/` avant `pnpm e2e` (en CI, `pnpm cucumber:ihm` le refait juste avant). Outils communs : `tests/support/e2e/outils-navigateur.ts` (`contourDuFocus`, `tabulerJusqua`, `centreDegage`, `boite`, `ouvrirHarnais`, `exposerLesPonts`, `ouvrirApplicationConnectee`). Harnais : `ecran-connecte.tsx` reçoit `window.__creerTaches(n)` ; nouveau `boutons-natifs.html/.tsx` (les cinq formes de bouton, vraies feuilles de style).

### 9.3 Règles de code

- Aucun texte écrit dans un composant : catalogue (`libelle`) ou fichier de libellés (`libelles-feuille.ts`, `libelles-ui.ts`).
- `className="bouton-natif"` en littéral sur chaque `<button>` natif du compte et de la synchronisation (§4.1).
- Aucune règle `z-index` nouvelle : les dialogues ouverts depuis la feuille sont dans la modale (§5.1).
- Tests modifiés par Benjamin : aucun test fourni ne change, sauf les **transtypages** de `racine-ouverture.test.ts(x)` (`as (…) => ModeleVueRacine`, `as unknown as ModeleVueRacine`), qu'il **peut** retirer en T6 quand les types existent (simplification, pas affaiblissement).

## 10. Sécurité et données personnelles

Aucun changement de flux, de stockage ni de jeton. La feuille modale affiche l'adresse du compte comme avant (section « Compte ») ; elle n'est plus visible tant que la feuille est fermée (amélioration). Aucune donnée personnelle dans les tests (compte « A » du banc).

## 11. Exigences non fonctionnelles

Aucun effet sur ENF-T-01 (ouverture < 2 s) : le cadre neutre est la première vue, sans calcul. Le panneau et la feuille n'ajoutent aucune lecture. Accessibilité : WCAG 2.4.3 (focus rendu au bouton à la fermeture, par Ionic), 2.4.7, 2.4.11, 2.5.8 (44 px), 4.1.2 (`aria-expanded`, `aria-controls`, `aria-haspopup`).

## 12. Step definitions Cucumber à implémenter

Profil `ihm` seulement ; le profil `default` n'a aucune étape manquante (`pnpm cucumber --dry-run` : 406 scénarios, aucune étape indéfinie, aux rangs 13 et 14).

### 12.1 Étapes manquantes (`RANG_COURANT=14 pnpm cucumber:ihm --dry-run`, T1)

| Phrase (glossaire v1.14 §12) | Scénarios | Définition imposée (`tests/steps-ihm/compte.steps.ts`) |
|---|---|---|
| `dans le premier onglet, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée` | S16b, S16c | **Une seule définition** pour les deux onglets : `Then(/^dans le (premier|second) onglet, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée$/, …)`. `premier` : `this.pageCourante()`, `attendreEcranDeConnexion(page)` (sondage, pas de rechargement attendu, ANO-006), puis `page.getByRole('button')` compte 1 et `boutonConnexion(page)` visible. `second` : comportement actuel (rechargement attendu, `networkidle`, mêmes assertions). La définition littérale actuelle du second onglet est supprimée |
| `dans le premier onglet, aucune donnée n'est affichée` | S16b, S16c | Idem : `Then(/^dans le (premier|second) onglet, aucune donnée n'est affichée$/, …)` ; page = `pageCourante()` (premier) ou `ongletSecond()` (second) ; assertions actuelles (espace absent, aucune ligne, aucun intitulé du Contexte) |

`pnpm cucumber:steps-inutilises` doit rester vert (aucune définition orpheline).

v0.2 : livré par T1 comme imposé ; S16b et S16c sont **verts dès T1** (la ST v0.1 les attendait rouges jusqu'à T5b, à tort : la section « Compte » est encore dans la page), d'où leur retour au rang 13 (§9.1).

### 12.2 Étapes à adapter à la feuille modale (T5b)

**Écarts de Benjamin, acceptés en v0.4** : (a) les étapes `@ihm` sont écrites directement dans leur état final, parce qu'elles s'exécutent sur l'application réelle et que `RANG_COURANT=14 pnpm cucumber:ihm` (13 sur 13) en est la preuve ; (b) `actionDuCompte` ouvre la feuille sans la refermer, car les deux gestes concernés (S16b, S16c) terminent la session et la feuille ne lui survit pas (§5.2).

| Fichier | Changement |
|---|---|
| `tests/steps-ihm/compte.steps.ts`, `boutonDeLaSectionCompte` | Ouvrir la feuille si elle est fermée (`page.getByRole('button', { name: LIBELLES_FEUILLE.ouvrir })`, puis attendre `page.getByRole('dialog', { name: LIBELLES_FEUILLE.titre })` visible), puis chercher le bouton **dans la feuille** (`dialog`), plus dans `espaceApplication(page)` |
| `tests/steps-ihm/compte.steps.ts`, `boutonConfirmer` | Inchangé (`getByRole('alertdialog')` trouve la boîte dans la modale) |
| `tests/steps-ihm/saisie.steps.ts`, `feuilleDeSaisie` | `page.locator('ion-modal[is-open]:not(.feuille-synchronisation)')` |
| `tests/steps-ihm/saisie.steps.ts`, `ouvrirDetail` (T4) | Toucher le **centre** de la ligne : `.click()` sans `position` ; retirer le commentaire d'ANO-005 (guide §6.6.16 n° 5, critère a) |
| `tests/steps-ihm/support/ecrans-ihm.ts` | Commentaire de `espaceApplication` : la section « Compte » n'y est plus ; ajouter `feuilleCompte(page)` et `boutonFeuille(page)` (repères utilisés ci-dessus) |

Scénarios `@ihm` à rejouer à T5b (`RANG_COURANT=14 pnpm cucumber:ihm`) : les 13 (US-018 S18, S19 ; US-031 S01a, S01b, S08, S14, S15, S16, S16b, S16c, S17 ; US-022 et US-017 selon `rangs-scenarios.json`).

## 13. Tests fournis (E10)

### 13.1 Tests unitaires (Vitest) — 29 tests, 26 rouges

| Fichier | Identifiants | Tranche | Projet | État à l'E10 |
|---|---|---|---|---|
| `tests/unitaires/commun/presentation/textes-e13b.test.ts` | UT-E13B-TXT-01 à 06 | T1 | node | 6 rouges |
| `tests/unitaires/commun/presentation/accessibilite-e13b.test.ts` | UT-DT-034-01, 02 | T2 | node | 2 rouges |
| `tests/unitaires/commun/presentation/ui/boutons-natifs.test.tsx` | UT-DT-014-01 à 06 | T3 | jsdom | 6 rouges |
| `tests/unitaires/commun/presentation/ui/bouton-flottant-e13b.test.tsx` | UT-ANO-005-FAB-01 | T4 | jsdom | 1 rouge |
| `tests/unitaires/synchronisation/presentation/ui/feuille-compte-synchronisation.test.tsx` | UT-ANO-005-FEUILLE-01 à 07 (`IonModal` par le harnais `surPresentationModale`) | T5a | jsdom | 7 rouges (`ErreurNonImplementee`) |
| `tests/unitaires/compte/presentation/racine-ouverture.test.ts` | UT-ANO-004-01 | T6 | node | 1 rouge |
| `tests/unitaires/compte/presentation/ui/racine-ouverture.test.tsx` | UT-ANO-004-02 | T6 | jsdom | 1 rouge |
| `tests/unitaires/composition/controleur-ouverture.test.ts` | UT-ANO-004-03 à 07 | T6 | node | 03, 04 rouges ; **05, 06, 07 verts** (garde-fous : l'écran de connexion reste publié après `apresOuverture`, après une session, après un geste) |
| `tests/unitaires/outillage/selection-rangs.test.ts` | UT-OUT-13, 14 | E10 (outillage) | node | verts (rang −1, toujours exécutés) |

**Ajouts de l'E13 de T1 à T3 (v0.2)** : `tests/unitaires/commun/presentation/ui/boutons-natifs-complements.test.tsx`, **UT-DT-014-07 à 10** (jsdom, rang 14 par la règle existante `UT-DT-014`), garde-fous verts dès leur écriture : variantes de `ChoixRestauration` (`RESTAURER` principal, `REPARTIR_DE_ZERO` danger, `DECIDER_PLUS_TARD` et « Fermer » tertiaires, `ANNULER_DEMANDE` secondaire), de `ModificationsNonRetenues` (quatre boutons tertiaires), et de l'action `REPRENDRE_LA_SYNCHRONISATION` du bandeau (principal). Raison : UT-DT-014-01 à 06 laissaient ces attributions sans test (mutation `danger` → `principal` et `tertiaire` → `danger` survivante, constatée par l'E13 ; les tests rougissent avec la mutation).

**Ajouts de la v0.3 (conception complétée de T5a)** :

| Fichier | Identifiants | Tranche | Projet | Contrôle | Mutation qui le rougit (vérifiée sur une réalisation locale annulée) |
|---|---|---|---|---|---|
| `feuille-compte-synchronisation.test.tsx` | UT-ANO-005-FEUILLE-08 | T5a | jsdom (`IonModal` réelle) | Focus de départ sur `body` ; à `ionModalDidPresent`, `document.activeElement` est le `h2` (`tabIndex` −1) | `onDidPresent` retiré |
| idem | UT-ANO-005-FEUILLE-09 | T5a | jsdom | Ouverture sans focus sur le bouton (Safari) ; fermeture par `ouverte=false` ; à `ionModalDidDismiss`, focus sur le bouton d'ouverture | appel retiré ; appel **synchrone** dans `onDidDismiss` (piège d'Ionic) |
| idem | UT-ANO-005-FEUILLE-10 | T5a | jsdom | Échap sans confirmation : `surFermee` une fois, focus sur le bouton (garde-fou : prouve que l'écoute d'Échap d'Ionic est active dans jsdom, sans quoi 11 serait vide) | idem 09 |
| idem | UT-ANO-005-FEUILLE-11 | T5a | jsdom | Échap avec une `BoiteConfirmation` réelle dans la feuille : `surAnnuler` une fois, aucun `ionModalWillDismiss`, `surFermee` jamais appelée | `useToucheEchap` d'origine ; capture sans `stopPropagation` ; `stopPropagation` sans capture |
| `tests/unitaires/synchronisation/presentation/ligne-etat-e13b.test.ts` | UT-ANO-005-FEUILLE-12 | T5a | node | Règle `.ligne-etat` exacte (7 déclarations) ; aucune règle visant `.ligne-etat` ou ses descendants avec `max-height`, `height`, `overflow`, `white-space`, `text-overflow`, `line-clamp` | `height: 48px` ; `max-height` dans la règle ; `.ligne-etat .bouton-natif { max-height }` ; `white-space: nowrap` sous `@media` |
| `tests/e2e/feuille-synchronisation.e2e.ts` | E2E-ANO-005-FEUILLE-07 | T5b | navigateur | Bouton distinct dans `.ligne-etat`, hors du `role="status"`, à droite de l'indicateur, même ligne ; ligne ≥ 48 px, `max-height: none` ; bouton ≥ 44 px ; ouverture au clavier : titre focalisé ; ouverture par clic sans focus (Safari) puis Échap : focus sur le bouton | rouge aujourd'hui (bouton absent de la page) |
| idem | E2E-ANO-005-FEUILLE-08 | T5b | navigateur | Échap avec la confirmation de suppression ouverte depuis la feuille : la confirmation se ferme, la feuille reste visible ; second Échap : la feuille se ferme | rouge aujourd'hui (bouton absent) |

**UT-ANO-005-FEUILLE-03 corrigé (v0.3, défaut de mon E10)** : il cherchait `getByRole('dialog')` sur l'hôte `ion-modal` ; Ionic 9 porte `role="dialog"`, `aria-modal="true"` et l'`aria-label` hérité sur l'enveloppe `.modal-wrapper` du shadow DOM, que jsdom ne traverse pas : le test n'aurait jamais pu passer avec le rendu imposé. Il lit désormais ces trois attributs sur l'enveloppe (rougit si l'`aria-label` est retiré de l'`IonModal`). Les E2E (Playwright traverse le shadow DOM) sont inchangés.

Réalisation locale de contrôle (annulée, non livrée) : avec le rendu du §5.1 et les trois points du §5.1 bis, UT-ANO-005-FEUILLE-01 à 12 sont **verts** ; `pnpm test` au rang 13 reste vert avec la modification de `boite-confirmation.tsx`.

Mesures (`fix/e13b-lot001`, après la fusion de `lot/LOT-001`) : `pnpm test` (rang 13) : **1 621 verts, 29 ignorés** (les tests du rang 14), 0 rouge ; `RANG_COURANT=14` sur les familles du rang : **26 rouges, 3 verts**, chacun rouge pour la raison attendue (assertion ou `ErreurNonImplementee`, aucune erreur de compilation ni de harnais).

### 13.2 Tests de navigateur (Playwright) — 24 tests, 23 rouges au rang 14

| Fichier | Identifiants | Tranche | Cible |
|---|---|---|---|
| `tests/e2e/focus-et-marges.e2e.ts` | E2E-DT-034-01 à 08 | T2 | Harnais 390 × 844 (onglet, « + », case et ligne, `IonButton`, clic, zone sûre, réserve de 88 px) ; build de production (bouton natif, `viewport-fit`) |
| `tests/e2e/boutons-natifs.e2e.ts` | E2E-DT-014-01 à 03 | T3 | Harnais `boutons-natifs.html` (4 variantes, `aria-disabled`) ; build de production (« Continuer avec Google ») |
| `tests/e2e/bouton-flottant.e2e.ts` | E2E-ANO-005-FAB-01 à 06 | T4 | Harnais : 56 × 56, sans étiquette ; 16 px ; centre des lignes dégagé et toucher au centre de la dernière ; colonne de 720 px à 1280 et 768 px, pleine largeur à 599 px ; nom accessible et `title` |
| `tests/e2e/feuille-synchronisation.e2e.ts` | E2E-ANO-005-FEUILLE-01 à 05 | T5b | Build `test-ihm` connecté : fermée au lancement, 0,92 de 844 px, liste immobile ; ordre et défilement interne ; Échap, focus rendu, défilement de la liste inchangé ; confirmations depuis la feuille (focus sur « Annuler », centre dégagé, clic) à 390 × 844 et à 1280 × 800 ; panneau de 400 px à droite |
| `tests/e2e/ouverture.e2e.ts` | E2E-ANO-004-01, 02 | T6 | Observateur de mutations : réouverture d'une session (`test-ihm`) : cadre puis espace, jamais l'invitation ; sans session (production) : cadre vide sans `data-*`, puis connexion |

**v0.3** : E2E-ANO-005-FEUILLE-07 et 08 (T5b, §13.1) ; E2E-ANO-005-FAB-03 et 05 corrigés et renforcés (§6.5).

**E2E-ANO-005-FEUILLE-06** (v0.2, T5b ; deux exécutions : 390 × 844 et 360 × 480) : retrait des rustines de mise en page, §5.2 bis ; rouge depuis l'E13 de T1 à T3 (défilement de la page de 391 et 524 px).

E2E-DT-034-05 (aucun anneau au clic) est **vert** dès l'E10 : garde-fou contre une règle `:focus` au lieu de `:focus-visible`. Retiré : le test sans identifiant « les « + » des deux onglets se distinguent par leur libellé visible » (§6.4).

Mesures (Chromium local, `PLAYWRIGHT_CHROMIUM_EXECUTABLE`) : `pnpm e2e` au rang 13 : **19 verts** sur 19 (20 avant le retrait), dont `onglets.e2e.ts` sur le serveur `test-ihm` partagé ; `RANG_COURANT=14` : 43 tests, les 24 nouveaux donnent **23 rouges et 1 vert**, chaque rouge pour la raison attendue (contour par défaut du navigateur, style par défaut des boutons, étiquette présente, colonne pleine largeur, bouton d'ouverture de la feuille absent, écran de connexion vu à l'ouverture), aucun pour une erreur de harnais. Remarque : le build `test-ihm` exige `VITE_BASE_PATH`, `VITE_APP_ORIGIN` et `VITE_GOOGLE_WEB_CLIENT_ID` ; le `webServer` les pose (valeurs fictives du job `ihm`).

### 13.2 bis Arbitrage de T5b (v0.4, tests E2E corrigés par Anthony)

Constat vérifié par relance : six tests ne pouvaient pas passer tels qu'écrits (défauts de mon E10, pas de la réalisation). Corrections, sans affaiblissement :

1. **Repères** : le rôle `dialog` est sur l'enveloppe du shadow DOM d'Ionic, le contenu est projeté. `presentee(page)` (`getByRole('dialog', …)`) attend la présentation et la fermeture ; `feuille(page)` = `ion-modal.feuille-synchronisation[is-open]` sert aux recherches de contenu (FEUILLE-02, 04, 05, 07, 08).
2. **Animation** : `ouvrirFeuille` attend la stabilisation (trois lectures identiques de la boîte à 100 ms d'intervalle, 5 s au plus, sans `waitForTimeout` fixe) avant toute mesure (FEUILLE-01, 05).
3. **FEUILLE-01, 0,92** : Ionic applique le point d'arrêt à la hauteur de son enveloppe `.modal-wrapper` (834 px à 844 de fenêtre, marge haute d'Ionic) : la partie visible fait 0,92 × 834 = 767,3 px (y = 76,7), pas 0,92 × 844. L'attendu 67,5 était faux. Nouvelle assertion : (844 − y) / hauteur de l'enveloppe = 0,92 ± 0,005, enveloppe > 0,95 × 844, contenu aligné sur la partie visible (poignée comprise, ±1 px). Mutation vérifiée : 0,5 donne 0,42 d'écart, le test rougit ; 1,0 rougit aussi.
4. **Onglets** : `onglets.e2e.ts` ouvre la feuille de chaque onglet avant de lire `SYN-FEUILLE-AUTRE-ONGLET` (le « 0 » du premier onglet n'est plus vacuant).
5. **E2E-ANO-005-FEUILLE-09 (nouveau)** : ANO-007 au toucher (`tap()`, `hasTouch`, 390 × 844) sur les boutons de la confirmation ouverte dans la feuille ; `click()` de FEUILLE-04 est un clic souris même avec `hasTouch`.

Mutations locales annulées : FEUILLE-01 (0,92 → 0,5), FEUILLE-04 et 05 (confirmation recouverte), FEUILLE-07 (`.ligne-etat` en `row-reverse`), FEUILLE-09 (confirmation recouverte) rougissent. `RANG_COURANT=14 pnpm e2e` : 46 verts, seuls E2E-ANO-004-01 et 02 (T6) rouges.

### 13.3 Assertions précises (résistance aux mutations)

Chaque test vérifie une valeur exacte et la mutation qui le ferait passer à tort est exclue : contour comparé en entier (`style`, `largeur`, `couleur`, `decalage`) ; `-2px` contre `2px` distingués ; couleurs calculées des jetons ; `undefined` exigé pour la variante secondaire (un `data-variante="secondaire"` ou une variante oubliée échouent) ; ordre de la feuille vérifié élément par élément ; `initialBreakpoint` et `breakpoints` exacts ; `toEqual(['CADRE','ESPACE'])` (et non « contient ») ; texte exact des variantes d'`ERR-016` avec insécables ; décompte des balises `<button>` contre les classes.

## 14. Tests attendus de Benjamin

Tests complémentaires `UT-COMP-CORR-nn` si la couverture d'un fichier modifié baisse (règle de non-régression, §12 des conventions) : en particulier `main.tsx` est exclu de la couverture, mais `bouton-flottant.tsx`, `Racine.tsx`, `racine.ts`, `FeuilleCompteEtSynchronisation.tsx` ne doivent pas baisser. Règle de rang `UT-COMP-CORR-\d+` → 14 **posée en v0.3** (`rangs-tests.json`, troisième règle). **UT-COMP-CORR-01 est obligatoire à T5b** (§5.2, focus de fin de « À lire »).

## 15. Plan de réalisation : tranches (OPT-15)

Toutes par Benjamin (sonnet), **une à la fois**, chacune sur une branche courte depuis `fix/e13b-lot001`, revue E13 courte (Anthony), puis fusion dans `fix/e13b-lot001`.

| Ordre | Tranche | Contenu | Dépend de | Tests à rendre verts (`RANG_COURANT=14`) | Effort |
|---|---|---|---|---|---|
| 1 | **T1 — Textes et étapes du premier onglet** | §3.1, §3.2 ; §12.1 | — | UT-E13B-TXT-01 à 06 ; S16b, S16c en `@ihm` | 0,4 j |
| 2 | **T2 — Focus et zone sûre** | §2 bis ; classe `contenu-avec-fab` (§6.3) | — | UT-DT-034-01, 02 ; E2E-DT-034-01 à 07 ; 08 (la réserve suffit : le centre de la dernière ligne est dégagé même avec l'étiquette actuelle) | 0,5 j |
| 3 | **T3 — Boutons natifs** | §4 | T2 (l'anneau des boutons natifs est contrôlé par E2E-DT-034-06) | UT-DT-014-01 à 06 ; E2E-DT-014-01 à 03 | 0,5 j |
| 4 | **T4 — « + » rond et colonne** | §6 ; `ouvrirDetail` au centre (§12.2) | T2 | UT-ANO-005-FAB-01 ; E2E-ANO-005-FAB-01 à 06 | 0,5 j |
| 5 | **T5a — Composant de la feuille** | §5.1, §5.1 bis (focus, Échap, `boite-confirmation.tsx`), §5.1 ter (CSS de `.ligne-etat`) | T3 | UT-ANO-005-FEUILLE-01 à 12 | 0,6 j (v0.3 : +0,1 j) |
| 6 | **T5b — Branchement de la feuille** | §5.2 ; §5.2 ter (intégration) ; §12.2 (étapes `@ihm`) | T5a, T1 | E2E-ANO-005-FEUILLE-01 à 05, **07, 08** ; UT-COMP-CORR-01 ; **E2E-ANO-005-FEUILLE-06 et retrait des trois rustines de T2 et T3 (§5.2 bis)** ; les 13 scénarios `@ihm` | 0,75 j (+ 0,1 j pour le retrait, dans la tranche) |
| 7 | **T6 — Ouverture et livraison du rang** | §7 ; `rangCourant = 14` (dernier commit) | T5b | UT-ANO-004-01 à 07 ; E2E-ANO-004-01, 02 ; **toutes** les familles du rang 14 et toute la CI au rang 14 | 0,35 j |

**Total : 3,6 j** (v0.3 ; **reste 1,8 j** après T4 : T5a 0,6, T5b 0,85, T6 0,35) (Steeve estimait ≈ 2,25 j hors tests et étapes ; l'écart vient des étapes `@ihm`, du branchement de `main.tsx` et des tests de navigateur). Chaque tranche reste sous 1 j. T1 et T2 sont indépendantes (l'ordre peut être inversé) ; T6 ne dépend fonctionnellement de rien mais porte la livraison du rang, donc passe en dernier.

PR finale `fix/e13b-lot001` → `lot/LOT-001` après T6 : CI verte (7 contrôles), `pnpm cucumber:ihm` 13 sur 13, `pnpm e2e` 47 sur 47 (43 + les deux exécutions de E2E-ANO-005-FEUILLE-06, v0.2, + E2E-ANO-005-FEUILLE-07 et 08, v0.3) ; puis nouvelle E13b limitée (FD-LOT-001-2, 4, 5, 7).

## 16. Dette, hypothèses et points ouverts

### 16.1 Dette

| Dette | Effet de ces corrections |
|---|---|
| DT-014 | **Planifiée** (T3) ; « Remboursée » à la fusion de la PR finale, sur le périmètre §4 |
| DT-034 | Points 1 et 3 **planifiés** (T2) ; point 2 (icônes) reporté à LOT-002 (décision de Steeve) |
| E13b-a (candidate) | **Planifiée** (T1) ; close à la fusion (plus de `TODO(` dans `src/`) ; numéro attribué à la fusion de l'E13b (OPT-20) |
| **CORR-a** (candidate, P3 ; v0.3 : condition remplie, Q-CORR-STE-3 = défaut confirmé par Steeve, guide §6.6.17 n° 3) | Boutons natifs d'`objectifs-taches` sans le style commun (§4.4). Plan : même règle que §4, ≈ 0,5 j, LOT-002 ou E17 |
| **CORR-b** (candidate, P3) | Message de « plus de 10 s » du cadre neutre (guide §6.2) non réalisé (§7.3) ; sans effet observable (lecture locale). Plan : si une lecture distante est un jour ajoutée à l'ouverture |
| DT-035 (harnais qui recopie `main.tsx`) | Inchangée ; les tests de la feuille utilisent l'application réelle (`test-ihm`), pas le harnais |

Numéros des dettes candidates : à la fusion (OPT-20).

### 16.2 Questions (aucune bloquante ; le choix par défaut est réalisé si la réponse n'est pas arrivée au début de la tranche concernée)

| N° | Destinataire | Question (fermée) | Défaut | Tranche |
|---|---|---|---|---|
| Q-CORR-STE-1 | Steeve | Ouverture de la feuille : (a) bouton tertiaire « Compte et synchronisation » à droite de l'indicateur (indicateur inchangé) ; (b) l'indicateur devient le bouton (sauf `SYN-SESSION`, où un second bouton serait nécessaire) ? | (a) | T5a |
| Q-CORR-STE-2 | Steeve | Ligne « Fuseau » : (a) reste dans « Compte » (§4.26) ; (b) passe en pied de « Synchronisation » (§6.6.15) ? | (a) | T5b |
| Q-CORR-STE-3 | Steeve | DT-014 : (a) compte et synchronisation seulement (liste du §5.3), le reste en dette CORR-a ; (b) tous les boutons natifs hors lignes et puces (guide §4.1), +0,5 j ? | (a) | T3 |
| Q-CORR-STE-4 | Steeve | Ligne d'état de 48 px : (a) indicateur et bouton de feuille, le bandeau dessous à sa hauteur naturelle ; (b) autre forme (laquelle) ? | (a) | T5b |
| Q-CORR-STE-5 | Steeve | Nom du « + » des objectifs : (a) « Créer un objectif » (inchangé, comme l'état vide) ; (b) « Nouvel objectif » (exemple du §2.2 ; S23 de Pepper) ? | (a) | T4 |
| Q-CORR-STE-6 | Steeve | Focus après « Compris » sur la dernière entrée de « À lire », feuille ouverte : (a) titre de la feuille ; (b) « Fermer » ; (c) bouton « Synchroniser maintenant » ? | (a) | T5b |
| Q-CORR-STE-7 | Steeve | « Voir » depuis « À lire » : fermer la feuille avant de naviguer vers l'élément (v0.4, réalisé par Benjamin), ou autre comportement ? | Fermer | T5b (réalisé) |

Pas de question à Starck : ni port, ni flux, ni ADR touché ; le `webServer` partagé et la sélection par rang des tests de navigateur relèvent de l'outillage de test (`conventions.md` §11.14). Pour information de Pepper : S16b et S16c passent au rang 14, les `@recette` au rang 15 (§9.1) ; les scénarios de non-régression d'ANO-004 et d'ANO-005 qu'elle propose (glossaire v1.15) peuvent s'ajouter à l'E17 sans changer cette conception (les repères `boutonFeuille`, `feuilleCompte` et `centreDegage` existent).

### 16.3 Effet sur le calendrier de la recette

Sept tranches d'une demi-journée environ, une à la fois, chacune suivie d'une E13 courte : **4 à 5 jours ouvrés** avant la PR finale, puis la nouvelle E13b limitée. L'E14 ne peut pas commencer avant (FD-LOT-001-2 et 4 bloquants). La publication de la recette (FD-LOT-001-1) avance en parallèle et n'est pas retardée. Le jeu de données de Pepper est calé sur novembre 2026 : si l'E16 glisse après le 2026-11-30, les dates sont à recaler (§5.2 e de l'E13b).

### 16.2 bis Réponses de Steeve (guide v0.2.27, §6.6.17 ; Anthony intègre)

Q-CORR-STE-1 à 3, 5 et 6 : **défauts confirmés**. Q-CORR-STE-4 : **corrigée** : `.ligne-etat` en `min-height: 48px` **sans `max-height`** (texte agrandi, WCAG 1.4.4 et 1.4.12), libellé du bouton sur deux lignes si besoin, jamais tronqué. Ajout non couvert par un test rouge : à l'ouverture de la feuille, focus sur le titre `h2` (`onDidPresent`), et au retour le bouton d'ouverture reprend le focus s'il l'a perdu ; Échap ferme la confirmation seule si elle est ouverte. Aucun test rouge existant à modifier (aucun ne contrôle la hauteur maximale ni le focus d'ouverture). Voir `docs/02-ux/guide-ergonomie.md` §6.6.17.

**Intégré en v0.3** : §5.1 bis (trois comportements, réalisation imposée), §5.1 ter (ligne d'état), §5.2 (focus de fin de « À lire »), tests UT-ANO-005-FEUILLE-08 à 12 et E2E-ANO-005-FEUILLE-07 et 08 (§13.1). Le contrôle « `role="dialog"` et `aria-modal` posés par Ionic, à vérifier » du §6.6.17 est fait : ils sont sur l'enveloppe du shadow DOM (UT-ANO-005-FEUILLE-03 v0.3).

## 17. Checklist de complétude

- [x] Fichiers à créer et à modifier, signatures, CSS exacte (§3 à §7).
- [x] Aucun modèle de données ni migration.
- [x] Erreurs (§8), patterns (§9), sécurité (§10).
- [x] Étapes Cucumber manquantes et à adapter (§12).
- [x] Tests rouges livrés, rangés, mesurés (§13) ; `pnpm test`, `pnpm verifier`, `cucumber` et `cucumber:ihm` (`--dry-run`) verts au rang 13.
- [x] Tranches, ordre, dépendances, effort (§15).
- [x] Questions fermées avec défaut (§16.2).
