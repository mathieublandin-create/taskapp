# ST-US-031 — Utiliser l'application sans réseau sur mon PC

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-031](../01-specification-fonctionnelle/user-stories/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.md), statut « Prête » (DEC-018 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **13** / 13 |
| Fichier `.feature` | [`tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature`](../../tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature), 30 scénarios (9 `@ihm` : S01a, S01b, S08, S14, S15, S16, S16b, S16c, S17 ; S16b et S16c ajoutés par Pepper le 2026-10-27, Q-ST031-PEP-1) |
| RG couvertes | RG-017, RG-019, RG-021, RG-035, RG-036, RG-043, RG-047 à RG-049, RG-055, RG-056, RG-057 |
| ENF | ENF-04, ENF-06, ENF-07 ; ENF-T-01 |
| DAT / ADR | DAT **v0.11.13** §4.1.4, §4.1.6 (plusieurs onglets, connexions IndexedDB des autres onglets), §4.1.6 bis, §4.1.7, §4.3 ; ADR-013 ; conventions §2.3 (port interne), §10.2 (un seul onglet synchronise) |
| Résultats du test technique | M-RED favorable (redirection à l'ouverture), étape 16 refaite (GIS avec `login_hint` pour le geste) ; hors ligne (étape 10) favorable |
| Prérequis | Rangs 0 à 12 fusionnés, DT-027 fusionnée (PR #39, `01da5ff`) ; en particulier ST-US-022 (rang 1 : `AvisOnglets`, `versionchange`, `ERR-017`), ST-US-017 (rang 3 : `CycleSynchronisation`), ST-US-018 v0.4.2 (rang 12 : service worker, persistance, profil `ihm`, banc `test-ihm` et ponts) |
| Dette intégrée | **DT-025** (champ `EtatMoteur.aLire` mort), rattachée au rang 13 (registre v0.38), tranche B1 (§6.6) |
| Questions | Q-ST031-STA-1, Q-ST031-STA-2 et Q-ST031-PEP-1 **répondues** (2026-10-27) et intégrées ; v0.4 : aucune question bloquante (§16) |
| Version | **0.4.1** |
| Statut | Conception arrêtée ; E10 livrée ; E12 livrée (B1, B2, D1, D2) ; **E13 : changements requis** (`docs/ceremonies/revue-code-LOT-001-rang13.md`, correctif d'ANO-006 au §6.7) |
| Auteur | Anthony |
| Branche | `us/US-031-rang13` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après M-RED et l'étape 16). |
| 0.2 | 2026-10-27 | Anthony | Réponses de Starck (DAT v0.11.3 : Q-ST031-STA-1 a), noms des verrous, verrou « cycle » jusqu'à la mise à jour de `deposeJusquA` ; Q-ST031-STA-2 a)), de Pepper (Q-ST031-PEP-1 a) : S16b et S16c, rang 13) et de Steeve (sans message, guide v0.2.13). Avis de fin de session **ferme** (§6.4, UT-US-031-11). |
| 0.3 | 2026-10-28 | Anthony | E11. **RL-LOT-001-A1** : ordre « effacer la session → prévenir → supprimer », `versionchange` sans réouverture, `ERR-017` ; port `AvisOnglets`, adaptateur et leurs tests avancés au rang 1 (ST-US-022 v0.3) ; UT-US-031-11 remplacé par UT-US-022-56 (§6.4, §13). **RL-LOT-001-A6** : `navigator.locks` absent journalisé en `erreur`, hypothèse inscrite (§8, §16). Estimation ramenée à 3,5 j. |
| **0.4** | 2026-11-10 | Anthony | **E10 du rang 13**, revue de la conception sur le code des rangs 0 à 12. (1) **Composition** précisée (§3, §6.5) : `assemblerApplication` reçoit `verrou`, chaque espace a sa `CoordinationOnglets`, `Application.arreterCoordination` et `lireCoordination`, fonction `quitterApresFinDeSession` (avis et `versionchange`), lecture de `navigator.locks` dans l'adaptateur seul (`verrouOngletsDuNavigateur`). (2) **Exclusion** (§6.2) : contrôles du réseau et de l'accès **avant** la demande du verrou (pas d'attente inutile) **et refaits après** son obtention ; attente sans notification ni changement d'état du moteur. (3) Contrat `VerrouOnglets` : `quandObtenue` jamais pendant l'appel ; `IdOnglet` retiré du port (doublure seulement) ; `observer` sans argument. (4) **DT-025** intégrée (§6.6). (5) Steps : 13 phrases nouvelles, repères réels (ni `data-ecran` ni `data-element`), ANO-004 (§12). (6) Tests : UT-US-031-01 à 12, CT-VER-01 à 07, UT-DT-025-01 livrés en rouge (§13). (7) Réalisation en 4 tranches (§15, OPT-15). |
| 0.4.1 | 2026-11-11 | Anthony | **E13 du rang 13** (`docs/ceremonies/revue-code-LOT-001-rang13.md`). Alignement sur le code livré et sur les réponses : DAT v0.11.13 (Q-ST031-STA-3), guide v0.2.25 (Q-ST031-STE-1 : `role="status"`, §6.3) ; `modeleAutreOnglet` dans le modèle de vue (§3 n° 8) ; `tests/e2e/onglets.e2e.ts` (et non `.spec.ts`), dépendant du build `dist-test-ihm` (§3 n° 17, §14) ; interface réelle des étapes (§12.2 n° 4, 7 à 9 : section « Compte » rendue dans l'espace, bouton « Créer un objectif », Entrée provisoire d'ANO-007). **Correctif d'ANO-006** imposé (§6.7) et tests UT-COMP-US-031-23 à 25 (§14) ; accord CR-60 sur UT-US-031-10 (Q-BRU-1, §13). |

## 1. Résumé technique

- **Constat.** Avec la PWA unique (ADR-013), le PC et le smartphone partagent le même code. Le hors ligne du PC est livré par les rangs 0 à 3 et 12 : base locale en durabilité stricte, ouverture sans réseau, redirection silencieuse à l'ouverture, `SYN-SESSION` et geste « Reprendre la synchronisation », cycle de synchronisation, `MEN-ATTENTE`, bandeaux, service worker. Par la règle de rattachement (conventions §11.13), 20 des 30 scénarios sont exécutés aux rangs 5 à 9, 7 au rang 12 et 3 au rang 13 (§12.2).
- **Ce que livre le rang 13** : la **coordination entre onglets** d'un même profil de navigateur (DAT §4.1.6, conventions §10.2) :
  1. un **onglet meneur** par espace de compte, élu par le verrou « meneur » tenu pendant toute sa vie ; seul le meneur installe les déclencheurs du cycle (5 s, 2 min, retour au premier plan, retour du réseau) et lance le cycle d'ouverture ; s'il est fermé, ou s'il perd l'accès Google, un autre onglet prend le relais **sans message** (guide §6.4, deux onglets) ;
  2. une **exclusion par cycle** : toute exécution du cycle (déclenchée par le meneur, ou par un geste dans n'importe quel onglet) s'exécute sous le verrou « cycle » ; deux onglets n'écrivent donc jamais le fichier de l'appareil en même temps ;
  3. la mention **`SYN-FEUILLE-AUTRE-ONGLET`** dans la feuille ECR-011 de l'onglet qui ne synchronise pas ;
  4. l'**arrêt de la coordination** à la fin de session décidée dans un autre onglet (avis `SESSION_FERMEE`, livré au rang 1) ou à la fermeture imposée (`versionchange`), avant le rechargement ;
  5. les **scénarios S16, S16b et S16c** (`@ihm`, deux onglets), sur le pont du `FauxDrive` livré au rang 12 ;
  6. le remboursement de **DT-025** (§6.6).
- **Hors périmètre** : synchronisation en arrière-plan (DEC-034, Q-PWA-3) ; navigation privée (non scénarisée, guide utilisateur) ; tout élément du repli ADR-012 ; ANO-004 et ANO-005 (non corrigées ici, §12.3).

## 2. Traçabilité
| CA | Scénarios | Rang d'exécution | Composants |
|---|---|---|---|
| CA-1 ouverture sans réseau | S01a, S01b (`@ihm`) | 12 | Service worker (ST-US-018), `OuvrirApplication` (rang 1) |
| CA-2 opérations | S02, S03 | 8 | Cas d'usage métier (rangs 2 à 8) |
| CA-3 indication hors ligne | S04 | 5 | Indicateur (rang 1), `MEN-ATTENTE` (rang 3) |
| CA-4 retour du réseau | S05 | 5 | `CycleSynchronisation` (rang 3) |
| CA-5 session expirée (F14) | S06, S07 | 7, 5 | `SYN-SESSION`, `ReprendreSession` (rang 1), GIS avec `login_hint` |
| CA-6 aucune perte | S08 (`@ihm`) | 12 | Durabilité stricte (rang 0), service worker |
| CA-7 pas de durée maximale | S09 | 5 | — |
| CA-8 conflits | S10, S11, S12 | 9 | Incrément 2 d'US-017 |
| CA-9 accès perdu | S13 | 5 | `BAN-ACCES-GOOGLE` (rang 1) |
| CA-10 RG-057 | S19, S19b, S20, S20b, S21, S22, S22b, S22c ; S21b | 5 ; 12 | `construireBandeau` (rang 1) ; `MasquerRappel24h` (rang 12) |
| Cas limites | S14, S15, S17 (`@ihm`, 12) ; **S16, S16b, S16c (`@ihm`, 13)** ; S18 (5) | — | `CoordinationOnglets`, `ExclusionCycle`, `VerrouOnglets` ; `AvisOnglets` (rang 1) |

## 3. Composants et fichiers

### 3.1 Livrés en E10 (squelettes, à remplacer en E12)
| # | Fichier | Couche | État en E10 | Responsabilité | Tranche |
|---|---|---|---|---|---|
| 1 | `src/synchronisation/application/ports/verrou-onglets.ts` | Application (port interne) | **Complet** (types) | Port `VerrouOnglets` (§4.1) | — |
| 2 | `src/synchronisation/application/noms-verrous.ts` | Application | Squelette | `nomVerrouMeneur`, `nomVerrouCycle` | B1 |
| 3 | `src/synchronisation/application/exclusion-cycle.ts` | Application | Squelette (type complet) | `ExclusionCycle`, `SANS_EXCLUSION`, `exclusionParVerrou` | B1 |
| 4 | `src/synchronisation/infrastructure/verrou-onglets-web.ts` | Infrastructure | Squelette | `VerrouOngletsWeb`, `verrouOngletsDuNavigateur` ; **seul** lecteur de `navigator.locks` (règle ESLint déjà posée) | B1 |
| 5 | `src/synchronisation/application/coordination-onglets.ts` | Application | Squelette (types complets) | `CoordinationOnglets`, `RoleOnglet`, `EtatCoordination` | B2 |
| 6 | `src/composition/fin-session-onglets.ts` | Composition | Squelette | `quitterApresFinDeSession`, `ecouterFinDeSession` | B2 |
| 7 | `src/synchronisation/application/cycle-synchronisation.ts` | Application | **Type seulement** : `DependancesCycle.exclusion?` ajouté, non utilisé | Exclusion (§6.2), DT-025 (§6.6) | B1 |
| 8 | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts` | Modèle de vue | **Types seulement** en E10 : entrée `coordination?`, sortie `autreOnglet?` ; **en D1** (v0.4.1) : fonction locale `modeleAutreOnglet(coordination)` ajoutée à `construireFeuilleSynchronisation` (règle du §6.3) | §6.3 | D1 |

Rangs (`tests/support/rangs/rangs-fichiers.json`) : n° 1 à 6 à `debut = fin = 13` ; n° 7 et 8 inchangés (aucun squelette).

### 3.2 À modifier en E12 (aucune modification en E10)
| # | Fichier | Modification | Tranche |
|---|---|---|---|
| 9 | `src/synchronisation/application/ports/suivi-cycle.ts` | DT-025 : retirer `aLire` d'`EtatMoteur` et de `SUIVI_CYCLE_AU_REPOS` | B1 |
| 10 | `src/synchronisation/application/requetes/consulter-etat-synchronisation.ts` | DT-025 : retirer le commentaire « `EtatMoteur.aLire` n'est plus lu » (l. 13-14, 59) ; rien d'autre | B1 |
| 11 | `src/composition/application.ts` | §6.5 n° 1 à 7 | B2 |
| 12 | `src/composition/web.ts` | §6.5 n° 8, 9 | B2 |
| 13 | `tests/support/banc/appareil-simule.ts` | `verrou: new VerrouOngletsEnMemoire().onglet()` à **chaque** `assembler()` (une instance = une page neuve ; une instance abandonnée ne doit pas garder la main) | B2 |
| 14 | `src/composition/controleur-interface.ts` | `#feuille` : `coordination: await this.application.lireCoordination()` si défini (§6.3) | D1 |
| 15 | `src/synchronisation/presentation/ui/FeuilleSynchronisation.tsx` | `<p data-etat="SYN-FEUILLE-AUTRE-ONGLET">` juste après `<BoutonSynchroniser>` (et donc après son explication), avant `<CartesDeLaFeuille>` | D1 |
| 16 | `tests/steps-ihm/support/monde-ihm.ts`, `tests/steps-ihm/onglets.steps.ts` (nouveau), `compte.steps.ts`, `saisie.steps.ts`, `drive.steps.ts`, `support/ecrans-ihm.ts` | §12 | D2 |
| 17 | `tests/e2e/onglets.e2e.ts` (nouveau ; motif `**/*.e2e.ts` de `playwright.config.ts`) | §14 | D2 |
| 18 | `tests/support/rangs/rang-courant.json` | `rangCourant = 13`, **en dernier** (PR du rang) | D2 |

### 3.3 Fournis par Anthony (tests, doublures, outils)
| Fichier | Contenu |
|---|---|
| `tests/doublures/verrou-onglets-memoire.ts` | `VerrouOngletsEnMemoire` **complète** : `onglet()`, `fermerOnglet(id)`, `detenteur(nom)`, `enAttente(nom)` ; FIFO par nom ; accord en microtâche ; type `IdOnglet` |
| `tests/doublures/lock-manager-simule.ts` | `RegistreVerrousSimule` **complet** : `client(id): LockManager` (`request` exclusif avec `signal`, `query`), `fermerClient(id)`, compteur `demandes` ; `shared`, `ifAvailable`, `steal` refusés |
| `tests/support/synchronisation/onglets.ts` | `barriere()`, `vider()` |
| `tests/support/synchronisation/appareil-cycle.ts` | Option `exclusion` de `creerAppareilCycle` |
| Tests du §13 | 10 fichiers |

Le contexte `synchronisation` reste seul à connaître les verrous ; `compte` ne connaît que `AvisOnglets`.

## 4. Interfaces et signatures

### 4.1 Application
```ts
// src/synchronisation/application/ports/verrou-onglets.ts — port interne (conventions §2.3), DAT §4.1.6
export interface VerrouOnglets {
  /** Exécute `tache` quand aucun onglet ne tient `nom` (exclusif, FIFO). Verrou rendu au règlement de la promesse ;
   *  valeur ou erreur renvoyée telle quelle (même objet). */
  executerExclusivement<T>(nom: string, tache: () => Promise<T>): Promise<T>;
  /** Main durable. `quandObtenue` : une fois, à l'obtention, JAMAIS pendant cet appel. Renvoie `rendre` : rend la main
   *  si elle est tenue, abandonne la demande sinon (`quandObtenue` jamais appelée) ; idempotente. */
  demanderLaMain(nom: string, quandObtenue: () => void): () => void;
  /** Vrai si un onglet, celui-ci compris, tient `nom`. */
  estTenu(nom: string): Promise<boolean>;
}

// src/synchronisation/application/noms-verrous.ts
export const nomVerrouMeneur = (nomEspace: string): string; // `${nomEspace}:synchronisation-meneur`
export const nomVerrouCycle  = (nomEspace: string): string; // `${nomEspace}:synchronisation-cycle`

// src/synchronisation/application/exclusion-cycle.ts
export type ExclusionCycle = { executer<T>(tache: () => Promise<T>): Promise<T> };
export const SANS_EXCLUSION: ExclusionCycle;  // { executer: (tache) => tache() } : appel immédiat, même promesse
export const exclusionParVerrou = (verrou: VerrouOnglets, nom: string): ExclusionCycle;
//   → { executer: (tache) => verrou.executerExclusivement(nom, tache) }

// src/synchronisation/application/coordination-onglets.ts
export type RoleOnglet = 'MENEUR' | 'SUIVEUR';
export type EtatCoordination = { readonly role: RoleOnglet; readonly autreMeneur: boolean };
export type DependancesCoordination = {
  readonly verrou: VerrouOnglets;
  readonly cycle: Pick<CycleSynchronisation, 'demarrer' | 'arreter' | 'synchroniserMaintenant'>;
  readonly acces: AccesGoogle;
  readonly nomEspace: string;
  readonly journal: JournalTechnique;
};
export class CoordinationOnglets {
  constructor(dependances: DependancesCoordination);
  demarrer(): void;                          // idempotent ; sans effet après arreter()
  arreter(): void;                           // idempotent et définitif
  etat(): Promise<EtatCoordination>;
  observer(rappel: () => void): Annulation;  // appelé à chaque changement de rôle de cet onglet
}

// src/synchronisation/application/cycle-synchronisation.ts — ajout à DependancesCycle (déjà fait en E10)
readonly exclusion?: ExclusionCycle; // absente ≡ SANS_EXCLUSION
```

### 4.2 Infrastructure
```ts
// src/synchronisation/infrastructure/verrou-onglets-web.ts
export type DependancesVerrouOngletsWeb = { readonly gestionnaire: LockManager | undefined; readonly journal: JournalTechnique };
export class VerrouOngletsWeb implements VerrouOnglets { constructor(d: DependancesVerrouOngletsWeb); /* … */ }
/** Composition web.ts : `'locks' in navigator ? navigator.locks : undefined` (seule lecture de navigator.locks). */
export const verrouOngletsDuNavigateur = (journal: JournalTechnique): VerrouOngletsWeb;
```
Algorithme imposé de `VerrouOngletsWeb` avec gestionnaire :
- `executerExclusivement(nom, tache)` → `gestionnaire.request(nom, { mode: 'exclusive' }, () => tache())`.
- `demanderLaMain(nom, quandObtenue)` : un `AbortController` ; drapeau `rendu = false` ; `request(nom, { mode: 'exclusive', signal }, () => { if (rendu) return Promise.resolve(); tenue = true; quandObtenue(); return promesseRendue; })` ; le rejet de cette demande est **absorbé** (`.catch(() => undefined)` : `AbortError` d'une demande abandonnée). `rendre` : sans effet si `rendu` ; sinon `rendu = true`, puis résout `promesseRendue` si `tenue`, sinon `abort()`. **La garde `if (rendu)` du rappel est obligatoire** : Web Locks accorde un verrou libre aussitôt et n'appelle le rappel qu'ensuite ; un `abort()` entre les deux est sans effet (le prototype de l'E10 l'a montré, CT-VER-05 sur `VerrouOngletsWeb`).
- `estTenu(nom)` → `(await gestionnaire.query()).held ?? []` contient une entrée de `name === nom`.

Sans gestionnaire (API absente, RL-LOT-001-A6) : `executerExclusivement` renvoie `tache()` ; `demanderLaMain` appelle `quandObtenue` dans une microtâche si `rendre` n'a pas été appelé entre-temps ; `estTenu` renvoie `false` ; **au premier appel de l'une des trois méthodes**, une seule entrée `{ niveau: 'erreur', evenement: 'VerrouOngletsIndisponible' }` (sans champ) par instance.

### 4.3 Composition
```ts
// src/composition/fin-session-onglets.ts
export type DependancesFinDeSession = { readonly arreterCoordination: () => void; readonly recharger: () => void };
export const quitterApresFinDeSession = (d: DependancesFinDeSession): (() => void);
//   1er appel : try { arreterCoordination() } finally { recharger() } ; appels suivants : sans effet
export const ecouterFinDeSession = (avis: AvisOnglets, quitter: () => void): Annulation; // avis.ecouter(() => quitter())

// src/composition/application.ts
type AdaptateursApplication = { …; readonly verrou: VerrouOnglets };            // requis
type EspaceOuvert = { …; readonly coordination: CoordinationOnglets };
type FabriqueCycle = {
  creer?: (depot: DepotLocalDexie, nomEspace: string) =>
    { readonly cycle: CycleSynchronisation; readonly coordination: CoordinationOnglets };
};
type Application = {
  …;
  /** Arrête la coordination de l'espace ouvert (main rendue, cycle arrêté) ; sans effet sans espace. */
  readonly arreterCoordination: () => void;
  /** `coordination.etat()` de l'espace ouvert ; undefined sans espace. */
  readonly lireCoordination: () => Promise<EtatCoordination | undefined>;
};
```

## 5. Modèle de données
Aucun. Les noms de verrous et le canal d'avis ne sont pas des données. L'`appareilId` est unique par profil de navigateur **et par compte** : il est rangé dans l'espace du compte, que les onglets partagent (DAT §4.1.4, ST-US-022 §5.2) ; l'HLC est lu et avancé dans la transaction IndexedDB, donc partagé entre onglets (socle, UT-SOC-39).

## 6. Règles et algorithmes

### 6.1 Rôle de meneur (`CoordinationOnglets`)
| Événement | Effet |
|---|---|
| `demarrer()` (premier appel, avant tout `arreter()`) | Abonnement `acces.observer` ; si `acces.etat() = VALIDE` : candidature |
| Candidature | Sans effet si une demande est en cours ou si la main est tenue ; sinon `rendre ← verrou.demanderLaMain(nomVerrouMeneur(nomEspace), obtenue)` |
| `obtenue` | `role ← MENEUR` ; `cycle.demarrer()` ; `cycle.synchroniserMaintenant()` (cycle d'ouverture du nouveau meneur), dont le rejet est journalisé `{ niveau: 'erreur', evenement: 'SynchronisationInterrompue', champs: { erreur: nom de l'Error, sinon 'inconnue' } }` ; journal `{ niveau: 'info', evenement: 'OngletMeneur' }` (sans champ) ; notification. Ordre des appels : `demarrer` puis `synchroniserMaintenant` |
| Accès qui passe à `A_RENOUVELER`, `PERDU` ou `SANS_SESSION` | Si meneur : `cycle.arreter()`, `rendre()`, `role ← SUIVEUR`, notification. Si candidat en attente : `rendre()` (demande abandonnée, jamais meneur ensuite), sans notification. Un onglet sans accès ne garde ni la main ni sa candidature (Q-ST031-STA-2) |
| Accès qui (re)devient `VALIDE` | Candidature (derrière le meneur actuel s'il existe) |
| `arreter()` (premier appel) | Désabonnement ; `cycle.arreter()` **une fois, quel que soit le rôle** ; `rendre()` ; `role ← SUIVEUR` ; notification si le rôle a changé. Appels suivants, et tout `demarrer()` ultérieur : sans effet |
| Fermeture de l'onglet meneur | Le navigateur rend le verrou ; le premier candidat en attente devient meneur, sans message (seule l'entrée `info`) |

`etat()` = `{ role, autreMeneur: role = SUIVEUR et await verrou.estTenu(nomVerrouMeneur(nomEspace)) }`. Les notifications n'ont lieu qu'aux changements de rôle de **cet** onglet (un suiveur n'est pas notifié quand l'autre meneur disparaît sans qu'il prenne la main ; la feuille relit `etat()` à chaque calcul de la vue, au moins chaque minute par la réévaluation de RG-057).

Un onglet suiveur n'installe aucun déclencheur. Ses modifications sont déposées par le meneur : l'observateur du dépôt du meneur reçoit les transactions des autres onglets (`DepotLocal.observer` : « y compris d'une autre instance », `storagemutated` de Dexie), ce qui arme la temporisation de 5 s (ST-US-017 §6.4).

### 6.2 Exclusion par cycle (`CycleSynchronisation`, DAT §4.1.6)
Avec `exclusion` absente, le comportement est **identique au rang 12** : tous les tests existants restent verts sans modification (hors DT-025, §6.6). Avec une exclusion, `#lancer` (commun à `synchroniserMaintenant`, `deposerMaintenant`, `repartirDeZero`) suit cet ordre :
1. une exécution est en cours **ou en attente du verrou** dans cet onglet (`#enCours` défini) : `aRefaire ← vrai`, renvoie `DEJA_EN_COURS` **sans demander le verrou** ;
2. contrôle du réseau et de l'accès (`#garde`) : en échec, renvoie `NON_LANCE_HORS_LIGNE` / `NON_LANCE_SANS_ACCES` **sans demander le verrou** (un onglet hors ligne n'attend pas inutilement) ;
3. `#enCours ← exclusion.executer(corps)` **avant** que le verrou soit obtenu (`cycleEnCours()` défini pendant l'attente) ; pendant l'attente : **aucune notification**, `etatMoteur().cycle` inchangé ;
4. `corps`, une fois le verrou obtenu : **contrôle refait** (`#garde`) ; en échec, renvoie l'issue correspondante sans notification ni appel au Drive ; sinon notification de début puis exécution complète comme au rang 12 (relance `aRefaire` comprise, **dans la même tenue du verrou**), de la lecture du Drive **jusqu'à la mise à jour de `deposeJusquA`** (`appliquerSynchronisation`, reprise du `pageToken` comprise) et notification de fin, `#enCours` remis à `undefined` dans le `finally` ;
5. le verrou est rendu au règlement de la promesse (succès, échec ou exception propagée).

Les attentes de reprise (`delaiAvantTentative`) se font **hors** du verrou : la tentative suivante passe par `#declencher` et le redemande. `deposerMaintenant` et `repartirDeZero` attendent la fin d'une exécution de cet onglet (`while (#enCours)`), puis passent par `#lancer`, donc par l'exclusion. Le cycle relit la méta (`fichierPropre`, `deposeJusquA`, `pageToken`) à chaque exécution (ST-US-017 §6.3) ; aucune donnée de cycle n'est gardée en mémoire d'une exécution à l'autre, hors l'état du moteur et le compteur de tentatives de l'onglet.

Un geste (« Synchroniser maintenant », « Reprendre la synchronisation », reconnexion) dans un onglet suiveur appelle `synchroniserMaintenant()` de son propre cycle, avec son propre jeton : il attend la fin de l'exécution du meneur, puis s'exécute. `DepotAvantSortieSynchro` (déconnexion, suppression des données) passe par `deposerMaintenant()`, donc par l'exclusion.

Contraintes de code : `#lancer` reste sous 30 lignes et de complexité ≤ 10 (ESLint) : extraire `#lancerSousExclusion`. `SANS_EXCLUSION` est la valeur par défaut lue dans le constructeur (`this.dependances.exclusion ?? SANS_EXCLUSION`) ; si le chemin unique (`SANS_EXCLUSION.executer(corps)`) fait rougir un test existant (le corps est alors appelé avant l'affectation de `#enCours`), garder deux chemins, comme le prototype de l'E10 : la notification de début doit voir `cycleEnCours()` défini (UT-US-017-90).

### 6.3 Feuille (`construireFeuilleSynchronisation`)
- Entrée `coordination?: EtatCoordination` ; sortie `autreOnglet: { code: 'SYN-FEUILLE-AUTRE-ONGLET', libelle: libelle('SYN-FEUILLE-AUTRE-ONGLET') }` **si et seulement si** `coordination.role = SUIVEUR` et `coordination.autreMeneur` ; propriété absente sinon (`MENEUR`, `SUIVEUR` sans meneur, coordination absente). Aucun autre champ de la feuille ne dépend de la coordination.
- Composant : `<p data-etat="SYN-FEUILLE-AUTRE-ONGLET" role="status">{libelle}</p>` (guide v0.2.25 §6.6.9, Q-ST031-STE-1), extrait dans le composant local `LigneAutreOnglet` (`max-lines-per-function`), texte simple (ni rôle d'alerte, ni contrôle, ni toast, ni icône), placé **après le bouton « Synchroniser maintenant » et son explication, avant les cartes** (maquette ECR-011, PC, « un autre onglet synchronise »).
- Contrôleur : `#feuille` passe `coordination` lue par `application.lireCoordination()` (propriété omise si `undefined`). L'indicateur et les bandeaux ne changent pas : aucun message n'interrompt l'onglet suiveur (guide §6.4, DAT-UX-16).

### 6.4 Fin de session dans un autre onglet (Q-ST031-PEP-1 a), US-022 CA-1 ; guide v0.2.13 §6.6.11 ; DAT §4.1.6, RL-LOT-001-A1)
Mécanique livrée au **rang 1** (ST-US-022 v0.3 §5.2, §6.5, §6.6, §6.11) :
- **ordre imposé** : déconnexion `fournisseur.oublier → memoireSession.effacer → avis.diffuser('SESSION_FERMEE') → espaces.fermer` ; suppression `memoireSession.effacer → avis.diffuser('SESSION_FERMEE') → espaces.supprimer → fournisseur.oublier → session.fermer` ;
- **chaque autre onglet**, à la réception de l'avis ou à l'événement `versionchange` (filet de sécurité), ferme sa connexion **sans réouverture automatique**, puis recharge : la nouvelle ouverture suit `deciderOuverture`, donc l'écran de connexion, **sans message** ;
- **suppression bloquée** au-delà de 5 s : `ERR-017` ;
- une saisie non validée dans l'onglet rechargé n'est pas conservée.

**Ce rang** remplace, dans les deux cas, le simple rechargement par `quitter = quitterApresFinDeSession({ arreterCoordination: application.arreterCoordination, recharger: navigateur.recharger })` : l'arrêt de la coordination (main rendue, cycle arrêté) **précède** le rechargement, une seule fois même si l'avis et `versionchange` arrivent tous deux ; le rechargement a lieu même si l'arrêt lève une exception.

### 6.5 Composition (tranche B2)
1. `AdaptateursApplication.verrou: VerrouOnglets` (requis).
2. `fabriquerCycles` (renommée `fabriquerSynchronisations`) : `creer(depot, nomEspace)` construit le cycle avec `exclusion: exclusionParVerrou(a.verrou, nomVerrouCycle(nomEspace))` et sa coordination (n° 3), et abonne les deux, avec le dépôt, au relais.
3. La coordination est créée dans `creer`, où l'accès Google du noyau est connu : `new CoordinationOnglets({ verrou: a.verrou, cycle, acces, nomEspace, journal: a.journal })`, abonnée au relais de `observerSynchronisation` (`coordination.observer(notifier)`) comme le cycle et le dépôt (ANO-001). `ouvrirEspace` transmet `nomBase` à `creer` ; `assemblerEspace` reçoit `{ cycle, coordination }` (pas de paramètre de plus : `max-params` ≤ 4) et range `coordination` dans `EspaceOuvert`.
4. `demarrerEspace` : `suivi.demarrer(); coordination.demarrer();` — **plus** de `cycle.demarrer()` ni de `cycle.synchroniserMaintenant()` directs (le cycle d'ouverture vient de `obtenue`).
5. `fermerEspace` : `coordination.arreter()` remplace `cycle.arreter()` (ordre : suivi, désabonnement du suivi, coordination, dépôt).
6. `Application.arreterCoordination = () => stockage.espace()?.coordination.arreter()` ; `Application.lireCoordination = async () => stockage.espace()?.coordination.etat()`.
7. `ouvrirEspace` passe à `DepotLocalDexie.ouvrirEspace` `surFermetureImposee: a.surFermetureImposee` **inchangé** (le lien avec la coordination est fait dans `web.ts`, n° 9).
8. `web.ts`, `assembler` : `verrou: verrouOngletsDuNavigateur(socle.journal)`.
9. `web.ts`, `demarrerWeb` : une référence tardive (`{ application?: Application }`, comme `reference.base`) ; `quitter = quitterApresFinDeSession({ arreterCoordination: () => reference.application?.arreterCoordination(), recharger: navigateur.recharger })` ; `adaptateursNavigateur` reçoit `surFermetureImposee: quitter` ; `avis.ecouter(navigateur.recharger)` est remplacé par `ecouterFinDeSession(avis, quitter)`.
10. Banc (`AppareilSimule.assembler`) : `verrou: new VerrouOngletsEnMemoire().onglet()` à chaque instance. **Critère de non-régression : `pnpm cucumber` 406/406 inchangé.** Le cycle d'ouverture démarre désormais une microtâche plus tard (accord du verrou) : si une étape du banc lit `cycleEnCours()` juste après l'ouverture, elle attend `attendreCycle()` (pas de contournement, pas de verrou « immédiat » dans la doublure).

### 6.6 DT-025 (tranche B1)
- Retirer `aLire` d'`EtatMoteur` (`suivi-cycle.ts`), de `SUIVI_CYCLE_AU_REPOS` et de `CycleSynchronisation.etatMoteur()`. Critère du registre : plus aucune occurrence d'`aLire` dans `suivi-cycle.ts` ni `cycle-synchronisation.ts`.
- **Accord donné ici, avant le commit (CR-60)**, pour l'adaptation **mécanique** des attendus suivants, qui comparent l'état du moteur : retirer la seule clé `aLire: 0` (ou `aLire: 7`), sans toucher à aucune autre clé ni au matcher :
  - `tests/unitaires/synchronisation/application/cycle-synchronisation.test.ts:108`, `:246` ;
  - `cycle-synchronisation-complements.test.ts:138`, `:193`, `:251` ;
  - `cycle-synchronisation-erreurs.test.ts:183`, `:197`, `:208` ;
  - `cycle-synchronisation-observation.test.ts:73`, `:74`, `:101`, `:116`, `:155`, `:156` ;
  - `cycle-signalements-complements.test.ts:209` (UT-COMP-US-017-2-34 : l'objet `etatMoteur` simulé perd `aLire: 7` ; l'assertion `aLire: 0` de la requête reste, elle porte sur l'attente).
  Le prototype de l'E10 a vérifié la liste : ce sont les **9 tests** qui rougissent au retrait du champ (UT-US-017-28, 32, 90, 92 ×2, UT-COMP-US-017-14, 16, 35, 36). `consulter-etat-synchronisation.test.ts:37` porte sur `EtatSynchronisationAffichable` : **ne pas toucher**.
- UT-DT-025-01 (égalité stricte) vérifie le retrait.

### 6.7 Correctif d'ANO-006 (E13 du rang 13, Benjamin, sonnet)
**Constat (reproduit en test de composant, 3/3 ; absent au rang 12).** `SeDeconnecter.executer` ferme l'espace **avant** la session (`espaces.fermer()` puis `session.fermer()`, ordre imposé par ST-US-022). `fermerEspace` arrête la coordination ; l'onglet meneur redevient suiveur et la notifie (§6.1, « notification si le rôle a changé ») ; le relais d'`observerSynchronisation` lance `ControleurInterface.rafraichir()`. Ce calcul lit `session.etat()` **au début** (encore `OUVERTE`), attend `consulterEtat()` puis la feuille (`lireCoordination()` compris) et se termine **après** les calculs lancés ensuite (`session.fermer()`, fin d'`actionCompte`), qui lisent `SANS_SESSION` et n'ont rien à attendre : il publie en dernier une vue `racine = APPLICATION`, feuille `SYN-OK` comprise. Le contrôleur reste ainsi alors que la session est `SANS_SESSION` : les données restent affichées après la déconnexion. La cause de fond, présente depuis le rang 1, est que `#calculerVue` publie sans contrôle d'ordre ; le rang 13 la déclenche.

**Correctif imposé** (`src/composition/controleur-interface.ts`, aucune autre modification de `src/`) :
1. un compteur privé `#dernierCalcul = 0` ; `#calculerVue` prend `const numero = ++this.#dernierCalcul` **avant** toute lecture ;
2. après la dernière attente, si `numero !== this.#dernierCalcul`, le calcul **ne publie pas** (`#vue` inchangée, observateurs non avertis) : un calcul lancé plus tard publiera ;
3. `rafraichir()` et `rafraichissementsTermines()` sont inchangés (le calcul abandonné reste attendu par le banc).
Interdits : modifier l'ordre de `SeDeconnecter` (ST-US-022), supprimer la notification d'`arreter()` (§6.1), relire la session après les attentes sans le compteur (correctif partiel : la feuille resterait celle de l'espace fermé).

**Étapes.** Les deux `When` de fin de session du premier onglet (§12.2 n° 7 et 9) attendent en plus, sur la page 1, l'écran de connexion (`expect.poll` sur `ecranAffiche(page)`, `DELAI_ATTENTE_MS`, valeur `CONNEXION`) : S16b doit rougir sans le correctif.

## 7. Intégration Google
Sans nouvelle requête. Chaque onglet a son propre jeton en mémoire (DAT §4.1.6) ; aucun jeton ne transite entre onglets (ni par `BroadcastChannel`, ni par IndexedDB, ni par les verrous).

## 8. Gestion des erreurs
| Situation | Comportement | Code / journal |
|---|---|---|
| `navigator.locks` absent | Exécution sans verrou, onglet meneur d'office | `erreur` `VerrouOngletsIndisponible`, une fois par instance (RL-LOT-001-A6) |
| Tâche exécutée sous verrou en échec | Verrou rendu ; l'erreur est traitée par le cycle comme aujourd'hui (ST-US-017 §8) | Selon le cycle |
| Demande de main abandonnée (`AbortError`) | Absorbée par l'adaptateur ; aucun rejet non traité | — |
| Cycle d'ouverture du nouveau meneur rejeté | Journalisé ; le rôle reste `MENEUR` | `erreur` `SynchronisationInterrompue` |
| Réseau coupé ou accès perdu pendant l'attente du verrou | Issue `NON_LANCE_*`, ni appel au Drive ni notification | — |
| Onglet meneur fermé pendant un dépôt | Dépôt interrompu ; `deposeJusquA` n'a pas avancé (ENF-T-07) ; le nouveau meneur redépose, sans doublon (dépôt idempotent, ST-US-017 §6.2) | — |
| Arrêt de la coordination en échec à la fin de session | Rechargement quand même, exception propagée (journalisée par le gestionnaire global) | — |
| Session fermée ou espace supprimé depuis un autre onglet | Rechargement, écran de connexion, sans message (§6.4) | — (S16b, S16c) |

## 9. Patterns imposés
Port interne au contexte (`VerrouOnglets`) avec doublure en mémoire et suite de contrat commune ; décorateur d'exclusion injecté (`ExclusionCycle`), sans dépendance de `CycleSynchronisation` à Web Locks ; aucun `navigator.locks` ni `BroadcastChannel` hors de leurs adaptateurs (règle ESLint) ; référence tardive dans la composition pour l'arrêt avant rechargement ; aucun minuteur nouveau (tout passe par `Planificateur`).

## 10. Sécurité
Aucun jeton partagé entre onglets ; noms de verrous et canal dérivés de `nomEspace` (empreinte du `sub`, jamais le `sub` ni l'adresse : conventions §9.3). Les avis ne transportent aucune donnée personnelle (valeur littérale `SESSION_FERMEE`). Les entrées de journal du rang n'ont aucun champ personnel (`OngletMeneur`, `VerrouOngletsIndisponible` sans champ ; `SynchronisationInterrompue` : nom de l'erreur seulement).

## 11. Exigences non fonctionnelles
| ENF | Vérification |
|---|---|
| ENF-06 : aucune perte, deux onglets | S16 (`@ihm`) ; UT-US-031-08 (propriété) |
| ENF-T-01 : ouverture hors ligne < 2 s | Déjà couverte (ST-US-018 §11) |

## 12. Step definitions

### 12.1 Exécution à blanc (E10, 2026-11-10)
- `RANG_COURANT=13 pnpm cucumber` (profil `default`) : **406 / 406** verts, inchangé (le rang 13 n'ajoute que des scénarios `@ihm`).
- `RANG_COURANT=13 cucumber-js --profile ihm --dry-run` : **13 scénarios** sélectionnés, **10** déjà définis (S01a, S01b, S08 et ses 3 exemples, S14, S15, S17 d'US-031 ; S18, S19 d'US-018), **3 non définis** (S16, S16b, S16c), **18 étapes** non définies, soit **13 phrases** distinctes ci-dessous.

### 12.2 Phrases à écrire (tranche D2, Benjamin)
| # | Phrase | Fichier | Implémentation imposée |
|---|---|---|---|
| 1 | `que l'application est ouverte dans deux onglets du {appareil}` | `tests/steps-ihm/onglets.steps.ts` | `exigerAppareil` ; `pageCourante()` (démarrage initial) puis seconde page du **même contexte persistant** (`MondeIhm.ouvrirSecondOnglet()`, à créer : `contexte.newPage()`, `page.goto(ORIGINE_IHM)`, mêmes écouteurs `pageerror`) ; `expect.poll` (10 s) : indicateur des deux pages à `SYN-OK` |
| 2 | `qu'aucune modification n'est en attente sur le {appareil}` | idem | `exigerAppareil` ; `expect.poll` (10 s) : indicateur de **chaque** page ouverte à `SYN-OK` |
| 3 | `dans le premier onglet, l'utilisateur renomme la tâche {string} en {string}` | idem | Fonction `renommerTache(page, ancien, nouveau)` extraite de `saisie.steps.ts` (la phrase « sur le {appareil}, … » existante l'appelle aussi : aucune duplication) sur la page 1 |
| 4 | `dans le second onglet, l'utilisateur crée un objectif {string} sans délai` | idem | Fonction `creerObjectifSansDelai(page, intitule)` dans `saisie.steps.ts` : espace « Objectifs » de la barre d'onglets (`choisirEspace`), bouton « Créer un objectif » (`LIBELLES_OBJECTIFS.creerObjectif`, libellé réel de l'interface ; v0.4.1), champ intitulé, « Créer l'objectif » (libellés de `LIBELLES_*`, jamais recopiés) ; attend le titre de niveau 1 du détail créé ; revient à la liste |
| 5 | `les deux onglets affichent la tâche {string} et l'objectif {string}` | idem | Pour chaque page : `expect.poll` (5 s) sur `ligneTache(page, tache)` (1 ligne) et sur la ligne d'objectif (repère à ajouter dans `ecrans-ihm.ts`, `li.ligne-objectif` + intitulé exact, comme `ligneTache`) après navigation vers l'onglet « Objectifs » puis retour |
| 6 | `le Drive du compte {string} contient l'objectif {string} exactement une fois` | `tests/steps-ihm/drive.steps.ts` | Comme la tâche : `objectifsDuDrive` de `drive-banc.ts`, `expect.poll` puis `attendreRepos()`, égalité à 1 |
| 7 | `dans le premier onglet, l'utilisateur se déconnecte` | `tests/steps-ihm/compte.steps.ts` | Page 1 : section « Compte », **rendue dans l'espace de l'application** (aucune feuille à ouvrir ; v0.4.1), bouton « Se déconnecter » par rôle (`libelleActionCompte('SE_DECONNECTER')`) ; si `CNF-DECONNEXION` s'affiche (rien en attente : ne doit pas), le scénario échoue ; puis page 1 à l'écran de connexion (§6.7) |
| 8 | `dans le premier onglet, l'utilisateur demande la suppression des données de cet appareil` | idem | Page 1 : section « Compte » de l'espace, bouton « Supprimer les données de cet appareil » (`libelleActionCompte('SUPPRIMER_DONNEES')`) ; attend le dialogue `alertdialog` |
| 9 | `dans le premier onglet, l'utilisateur confirme` | idem | Page 1 : bouton d'action du dialogue `alertdialog` (pas « Annuler »), **activé par la touche Entrée tant qu'ANO-007 est ouverte** (le fond intercepte le clic), commentaire de renvoi à ANO-007, **remis au clic** par la correction d'ANO-007 ; puis page 1 à l'écran de connexion (§6.7) |
| 10 | `dans le second onglet, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée` | idem | Page 2 : **attendre le rechargement** (compteur d'événements `load` de la page 2 relevé avant le geste, `expect.poll` jusqu'à +1, 5 s), puis `waitForLoadState('networkidle')`, puis `ecranAffiche(page) = 'CONNEXION'` et `boutonConnexion` seul bouton de la page. **ANO-004** : l'écran de connexion apparaît aussi brièvement pendant toute ouverture ; ne jamais conclure sur un relevé pris avant la fin du chargement |
| 11 | `dans le second onglet, aucune donnée n'est affichée` | idem | Page 2 : `main.espace-application` absent, 0 `li.ligne-tache`, 0 ligne d'objectif, et aucun texte « Chapitre 1 » ni « Publier le guide » (`getByText`, compte 0) |
| 12 | `les données du compte {string} sont toujours présentes sur le {appareil}` | idem | `page.evaluate(() => indexedDB.databases())` contient `nomEspace('recette', identite(compte).compte)` (calcul par `nomEspaceDuCompte` de `tests/support/compte/etapes-compte.ts`, l'environnement de la composition `test-ihm` étant `recette`) |
| 13 | `les données du compte {string} ne sont plus présentes sur le {appareil}` | idem | Même lecture, absence ; `expect.poll` (5 s) : la suppression se termine quand la page 2 a fermé sa connexion |

Repères : `[data-ecran]` et `[data-element]` **n'existent pas** dans `src/` (revue du rang 12) ; utiliser `support/ecrans-ihm.ts`. `MondeIhm` tient désormais une liste de pages (`pages[0]` = premier onglet, `pageCourante()` = `pages[0]`), sans changer le comportement des étapes du rang 12 (S01a à S21b restent vertes). Aucun contournement du banc : gestes par rôles accessibles, Drive lu dans le processus cucumber.

### 12.3 Rangs d'exécution (règle de rattachement, conventions §11.13)
- Rang 5 : S04, S05, S07, S09, S13, S18, S19, S19b, S20, S20b, S21, S22, S22b, S22c.
- Rang 7 : S06. Rang 8 : S02, S03. Rang 9 : S10, S11, S12.
- Rang 12 : S01a, S01b, S08, S14, S15, S17 (`@ihm`) ; S21b.
- Rang 13 : S16, S16b, S16c (`@ihm`).
Total : 30.

## 13. Tests unitaires (E10 livrée le 2026-11-10, branche `us/US-031-rang13`)
**Accord CR-60 (E13, Q-BRU-1)** : dans UT-US-031-10 (« request — mode exclusif… »), retirer l'espion `vi.spyOn(gestionnaire, 'request')` et ses trois assertions (l. 63, 74-76), qui attachent des gestionnaires à la promesse rendue et rendent vide l'assertion « aucun rejet non traité » ; les remplacer par `expect(registre.demandes).toBe(2)` (l'autre onglet, puis cette demande) ; le nom et le mode restent vérifiés par l'instantané `pending` (l. 77-79). Aucune autre modification.

Tous les titres commencent par leur identifiant ; règles de rang : `(?:UT-US-031|CT-VER)-\d+` → 13 (existante), `UT-DT-025-\d+` → 13 (ajoutée). Au rang 12, aucun ne s'exécute ; `RANG_COURANT=13 pnpm test` : **32 rouges**, 10 verts (CT-VER-01 à 07 sur la doublure, qui la valident ; 3 cas « aucune ligne » d'UT-US-031-07, gardes de non-régression), toutes les autres suites vertes. Un prototype jetable (non commité) a rendu les 42 verts : les tests sont satisfiables ensemble.

| Id | Fichier | Élément | Cas | Rouge en E10 par | Tranche |
|---|---|---|---|---|---|
| CT-VER-01 à 07 | `tests/contrats/verrou-onglets.contrat.ts` | Doublure ; `VerrouOngletsWeb` sur `RegistreVerrousSimule` | 01 exclusion ; 02 FIFO ; 03 rejet ; 04 main durable (jamais pendant l'appel, `rendre` idempotent) ; 05 demande abandonnée (y compris sur un nom libre) ; 06 fermeture d'un onglet ; 07 `estTenu` | NI (`VerrouOngletsWeb`) | B1 |
| UT-US-031-12 | `tests/unitaires/synchronisation/application/noms-verrous.test.ts` | Noms | Suffixes exacts | NI | B1 |
| UT-US-031-05 | `…/application/exclusion-cycle.test.ts` | `SANS_EXCLUSION`, `exclusionParVerrou` | Appel immédiat, même promesse ; deux onglets disjoints, FIFO, rejet propagé, verrou rendu | NI | B1 |
| UT-US-031-06 | `…/application/cycle-exclusion.test.ts` | `CycleSynchronisation` | Contrôles refaits après l'obtention (réseau, accès) ; `DEJA_EN_COURS` et contrôle à l'appel sans verrou ; verrou tenu de la première à la dernière notification et pendant chaque `appliquerSynchronisation` | Assertions (exclusion ignorée) | B1 |
| UT-US-031-10 | `…/infrastructure/verrou-onglets-web.test.ts` | `VerrouOngletsWeb` | API absente (une entrée `erreur`) ; `request` exclusif ; `AbortError` absorbé, aucun rejet non traité | NI | B1 |
| UT-US-031-08 | `tests/integration/synchronisation/deux-onglets.test.ts` | Deux cycles, deux onglets | Propriété (20 exécutions) : aucun chevauchement, un seul fichier d'appareil, chaque objectif une fois, rien en attente | Chevauchement détecté | B1 |
| UT-DT-025-01 | `…/application/etat-moteur-dt025.test.ts` | `EtatMoteur` | Égalité stricte sans `aLire` | `aLire: 0` résiduel | B1 |
| UT-US-031-01 à 04 | `…/application/coordination-onglets.test.ts` | `CoordinationOnglets` | §6.1 : meneur, cycle d'ouverture et journal ; suiveur, relais à la fermeture ; perte et retour de l'accès (3 états), candidat sans accès ; idempotence, arrêt définitif | NI | B2 |
| UT-US-031-09 | `tests/integration/synchronisation/deux-onglets.test.ts` | Coordination + cycles réels | Écriture du suiveur → temporisation de 5 s du meneur, dépôt par lui seul, pas avant 5 s | NI | B2 |
| UT-US-031-11 | `tests/unitaires/composition/fin-session-onglets.test.ts` | `quitterApresFinDeSession`, `ecouterFinDeSession` | Ordre arrêt puis rechargement, une fois ; annulation ; rechargement malgré une exception | NI | B2 |
| UT-US-031-07 | `tests/unitaires/synchronisation/presentation/feuille-autre-onglet.test.ts` | `construireFeuilleSynchronisation` | Ligne exacte (espace insécable avant « : », apostrophes typographiques), reste de la feuille inchangé ; absente pour `MENEUR`, `SUIVEUR` sans meneur, coordination absente | Assertion (ligne absente) | D1 |

## 14. Tests attendus des développeurs
| Niveau | Objet | Critère | Tranche |
|---|---|---|---|
| Composant (`UT-COMP-US-031-nn`) | `assemblerApplication` à deux instances sur la même `IDBFactory` et le même `VerrouOngletsEnMemoire` : seule la première exécute le cycle d'ouverture ; `fermerOnglet` de la première → la seconde devient meneur et synchronise ; `arreterCoordination` rend la main ; `lireCoordination` | Règle `UT-COMP-US-031-\d+` → 13 ajoutée par Anthony à l'E13 | B2 |
| Composant | `demarrerWeb` : avis `SESSION_FERMEE` → `recharger` appelé une fois (le test `web-declencheurs.test.ts` peut servir de modèle) | idem | B2 |
| Composant | `FeuilleSynchronisation` : ligne rendue après le bouton et avant les cartes, `data-etat` | idem | D1 |
| Bout en bout | S16, S16b, S16c | Profil `ihm` | D2 |
| Bout en bout | `tests/e2e/onglets.e2e.ts` : `VerrouOngletsWeb` sur Chromium réel (build `test-ihm`, **produit par `pnpm build:test-ihm`** : le job `ihm` exécute `pnpm cucumber:ihm`, qui le construit, avant `pnpm e2e` ; seul, le fichier échoue avec le message « Build absent » de `serveur-ihm.ts`) ; deux pages : la feuille de la seconde montre `SYN-FEUILLE-AUTRE-ONGLET` ; fermeture de la première → la mention disparaît de la seconde (`expect.poll`, 10 s) | `pnpm e2e` (job `ihm` de la CI, sans modification de `ci.yml`) | D2 |
| Composant (E13, v0.4.1) | **UT-COMP-US-031-23** (`tests/unitaires/synchronisation/application/cycle-exclusion-complements.test.ts`) : pendant l'attente du verrou « cycle », une création d'objectif puis `synchroniserMaintenant()` → `DEJA_EN_COURS` ; verrou rendu : première issue `TERMINE`, l'objectif est dans le Drive exactement une fois, décompte en attente 0, **2** notifications (une seule exécution du corps). **UT-COMP-US-031-24** (`tests/unitaires/composition/application-coordination-comp.test.ts`) : application assemblée (préparation du fichier) et `ControleurInterface` ; onglet seul meneur, `actionCompte('SE_DECONNECTER')`, puis `vider()` et `rafraichissementsTermines()` : `vue().racine.ecran = 'CONNEXION'`, ni `compte` ni `feuille`. **UT-COMP-US-031-25** (`tests/unitaires/composition/controleur-calculs-ordre-comp.test.ts`, nouveau) : doublure d'`ApplicationInterface` dont `consulterEtat` est réglé à la main ; calcul A lancé session ouverte, calcul B lancé après la fermeture ; B réglé puis A : vue de B (`CONNEXION`), un seul avertissement des observateurs | Règle `UT-COMP-US-031-\d+` → 13 (existante) | Correction E13 |
| Mutation | Rapportée en revue par chaque tranche (leçon du rang 12) : au moins retrait de l'exclusion, garde non refaite, `if (rendu)` retiré, `arreter` avant `recharger` inversé, ligne de feuille toujours présente | Toutes détectées | Toutes |

## 15. Plan de réalisation (OPT-15 : une tranche à la fois, chacune < 2 j)
| Tranche | Agent (modèle) | Contenu | Fichiers | Tests à rendre verts | Effort |
|---|---|---|---|---|---|
| **B1** cœur | Bruce (**opus**) | Noms, exclusion, intégration au cycle (§6.2), `VerrouOngletsWeb` (§4.2), DT-025 (§6.6) | §3 n° 2, 3, 4, 7, 9, 10 ; tests de DT-025 listés | CT-VER-01 à 07, UT-US-031-05, 06, 08, 10, 12, UT-DT-025-01 ; toute la suite au rang 12 | 1 j |
| **B2** coordination et composition | Bruce (**opus**) | `CoordinationOnglets` (§6.1), fin de session (§6.4), composition (§6.5), banc | §3 n° 5, 6, 11, 12, 13 | UT-US-031-01 à 04, 09, 11 ; UT-COMP-US-031 ; `pnpm cucumber` 406/406 | 1 j |
| **D1** feuille | Benjamin (sonnet) | Modèle de vue, composant, contrôleur (§6.3) | §3 n° 8, 14, 15 | UT-US-031-07 ; UT-COMP | 0,5 j |
| **D2** chaîne `@ihm` et livraison | Benjamin (sonnet) | Monde à deux pages, 13 phrases (§12.2), `onglets.e2e.ts`, `rangCourant = 13` **en dernier** | §3 n° 16, 17, 18 | S16, S16b, S16c ; `pnpm cucumber:ihm` 13/13 ; `pnpm e2e` | 1 j |

Ordre : **B1 → B2 → D1 → D2** (D1 peut précéder B2 : il ne dépend que des types). Pas de tranche Friday : la CI exécute déjà `pnpm e2e` et `pnpm cucumber:ihm` (job `ihm`). Estimation inchangée : **3,5 j** (DT-025 : 0,25 j inclus dans B1).

## 16. Points ouverts
- **Aucune question bloquante.** Q-ST031-STA-1, Q-ST031-STA-2, Q-ST031-PEP-1 répondues (v0.2).
- **Q-ST031-STA-3 (Starck, non bloquante, avant l'E13 du rang 13)** — Contrôles du cycle **avant** la demande du verrou **et** après (§6.2 n° 2 et 4) : le DAT §4.1.6 dit « le verrou cycle entoure chaque cycle, de la lecture du Drive à la mise à jour de `deposeJusquA` » ; le contrôle préalable ne lit rien du Drive. Validez-vous ? a) oui, inscrit au DAT ★ ; b) non : un seul contrôle, sous le verrou (un onglet hors ligne attend alors le verrou pour rien).
  - **Réponses de Starck (2026-11-11)** : option a retenue, inscrite au DAT v0.11.13 §4.1.6. Le contrôle préalable ne lit que l'état en mémoire (réseau, accès) ; le contrôle refait sous le verrou fait seul foi. Code livré en B1 conforme (`#lancer`, `#lancerSousExclusion`, `#sousExclusion`) : aucune lecture du Drive hors verrou, relance `aRefaire` dans la même tenue, pas de demande imbriquée du verrou, `SANS_EXCLUSION` inchangé. Aucun changement de code ni de test.
- **Q-ST031-STE-1 (Steeve, non bloquante, avant D1)** — Emplacement de `SYN-FEUILLE-AUTRE-ONGLET` : la maquette ECR-011 (PC) la place sous « Synchroniser maintenant » ; le guide §6.6.2 ne le dit pas. Je retiens : après le bouton et son explication, avant les cartes d'erreur, sur toutes les largeurs (smartphone compris, deux onglets étant possibles dans Chrome Android). Validez-vous ? a) oui ★ ; b) PC seulement.
  - **Réponses de Steeve (2026-11-10)** : option a retenue. Emplacement : après le bouton et son explication, avant les cartes, toutes largeurs. Texte inchangé (catalogue et guide §6.6.9 déjà d'accord ; l'espace avant « : » est rendue insécable par `libelle`). `<p data-etat="SYN-FEUILLE-AUTRE-ONGLET" role="status">`, sans toast ni icône ; apparition et disparition sans message ni animation (DAT-UX-16). Guide v0.2.25. Aucun ajout de catalogue en D1.
- **Hypothèse H-031-1 (RL-LOT-001-A6)** : l'API Web Locks est disponible sur tous les navigateurs cibles (Chrome et Edge pour ordinateur, Chrome Android ; Safari 15.4 et plus pour EPI-001). Sans elle, le cas est journalisé en `erreur`.
- **ANO-004 et ANO-005** : non corrigées au rang 13 ; les étapes de §12.2 n° 10 en tiennent compte (ANO-004). La correction relève d'une branche `ano/` après qualification par Pepper et Steeve.
- Dette : DT-025 réalisée en B1, « Remboursée » à la fusion de la PR #40 ; dette candidate R13-a (registre v0.44, numéro à la fusion, OPT-20).
- **ANO-006** (E13, Majeure proposée, régression du rang 13) : correctif au §6.7, bloquant pour la fusion du rang. **ANO-007** (E13, antérieure au rang : fond de `BoiteConfirmation` au-dessus des boutons) : hors périmètre du rang, branche `ano/` ; l'étape n° 9 la contourne par la touche Entrée.

## 17. Checklist
- [x] Fichiers, signatures, règles, steps, rangs.
- [x] Tests du §13 livrés en rouge (E10, 2026-11-10) ; prototype jetable vert.
- [x] Q-ST031-STA-1, Q-ST031-STA-2 et Q-ST031-PEP-1 répondues et intégrées (v0.2).
- [ ] Q-ST031-STA-3, Q-ST031-STE-1 (non bloquantes).
