# ST-US-031 — Utiliser l'application sans réseau sur mon PC

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-031](../01-specification-fonctionnelle/user-stories/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.md), statut « Prête » (DEC-018 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **13** / 13 |
| Fichier `.feature` | [`tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature`](../../tests/features/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.feature), 28 scénarios (7 `@ihm` : S01a, S01b, S08, S14, S15, S16, S17) |
| RG couvertes | RG-017, RG-019, RG-021, RG-035, RG-036, RG-047 à RG-049, RG-056, RG-057 |
| ENF | ENF-04, ENF-06, ENF-07 ; ENF-T-01 |
| DAT / ADR | DAT v0.11.2 §4.1.6 (plusieurs onglets), §4.1.6 bis, §4.1.7, §4.3 ; ADR-013 ; conventions §2.3 (port interne), §10.2 (un seul onglet synchronise) |
| Résultats du test technique | M-RED favorable (redirection à l'ouverture), étape 16 refaite (GIS avec `login_hint` pour le geste) ; hors ligne (étape 10) favorable |
| Prérequis | Rangs 0 à 12, en particulier ST-US-022 (rang 1), ST-US-017 incrément 1 (rang 3 : `CycleSynchronisation`), ST-US-018 (rang 12 : service worker, chaîne `@ihm`, masquage du rappel) |
| Questions ouvertes | Q-ST031-STA-1, Q-ST031-STA-2 (Starck), Q-ST031-PEP-1 (Pepper) : §16 |
| Version | 0.1 |
| Statut | Conception arrêtée sous réserve du §16 ; E10 avant l'E12 du rang 13 (§13) |
| Auteur | Anthony |
| Branche | `us/US-031-hors-ligne-pc` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après M-RED et l'étape 16). |

## 1. Résumé technique

- **Constat.** Avec la PWA unique (ADR-013), le PC et le smartphone partagent le même code. Le hors ligne du PC est livré par les rangs 0 à 3 et 12 : base locale en durabilité stricte, ouverture sans réseau, redirection silencieuse à l'ouverture, `SYN-SESSION` et geste « Reprendre la synchronisation », cycle de synchronisation, `MEN-ATTENTE`, bandeaux, service worker. Par la règle de rattachement (conventions §11.13), 21 des 28 scénarios sont exécutés **avant le rang 13** (§12.2).
- **Ce que livre le rang 13** : la **coordination entre onglets** d'un même profil de navigateur (DAT §4.1.6, conventions §10.2) :
  1. un **onglet meneur** par espace de compte, élu par un verrou Web Locks tenu pendant toute sa vie ; seul le meneur installe les déclencheurs du cycle (5 s, 2 min, retour au premier plan, retour du réseau) ; s'il est fermé, un autre onglet prend le relais **sans message** (guide §6.4, deux onglets) ;
  2. une **exclusion par cycle** : tout cycle (déclenché par le meneur, ou par un geste dans n'importe quel onglet) s'exécute sous un second verrou ; deux onglets n'écrivent donc jamais le fichier de l'appareil en même temps ;
  3. la mention **`SYN-FEUILLE-AUTRE-ONGLET`** dans la feuille de l'onglet qui ne synchronise pas ;
  4. l'**avis de fin de session** entre onglets (déconnexion, suppression des données), sous réserve de Q-ST031-PEP-1 ;
  5. le **scénario S16** (`@ihm`, deux onglets), sur le pont du `FauxDrive` livré au rang 12 (§3 n° 9, §6.5).
- **Hors périmètre** : synchronisation en arrière-plan (DEC-034, Q-PWA-3) ; navigation privée (non scénarisée, guide utilisateur) ; tout élément du repli ADR-012.

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
| Cas limites | S14, S15, S17 (`@ihm`, 12) ; S16 (`@ihm`, **13**) ; S18 (5) | — | `CoordinationOnglets`, `ExclusionCycle` (rang 13) |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `src/synchronisation/application/ports/verrou-onglets.ts` | Application | Créer | Port interne `VerrouOnglets` (conventions §2.3 ; signalé à Starck, Q-ST031-STA-1) |
| 2 | `src/synchronisation/infrastructure/verrou-onglets-web.ts` | Infrastructure | Créer | `VerrouOngletsWeb` : `navigator.locks` ; seul fichier autorisé à lire `navigator.locks` (règle ESLint `no-restricted-properties`, bloc `files`) |
| 3 | `src/synchronisation/application/exclusion-cycle.ts` | Application | Créer | Type `ExclusionCycle`, constante `SANS_EXCLUSION`, fabrique `exclusionParVerrou(verrou, nom)` |
| 4 | `src/synchronisation/application/coordination-onglets.ts` | Application | Créer | `CoordinationOnglets` : candidature au rôle de meneur, démarrage et arrêt du cycle, rôle observable |
| 5 | `src/synchronisation/application/noms-verrous.ts` | Application | Créer | `nomVerrouMeneur(nomEspace)`, `nomVerrouCycle(nomEspace)` |
| 6 | `src/synchronisation/application/cycle-synchronisation.ts` | Application | Modifier | Dépendance facultative `exclusion?: ExclusionCycle` (défaut `SANS_EXCLUSION`) ; corps de `synchroniserMaintenant` et de `deposerMaintenant` exécuté sous l'exclusion (§6.2) |
| 7 | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts` | Modèle de vue | Modifier | Entrée `role: RoleOnglet` ; ligne `SYN-FEUILLE-AUTRE-ONGLET` quand `role = 'SUIVEUR'` et `autreMeneur = true` |
| 8 | `src/compte/application/ports/avis-onglets.ts`, `src/compte/infrastructure/avis-onglets-broadcast.ts` | Application, infrastructure | Créer | Port `AvisOnglets` et adaptateur `BroadcastChannel` (canal `donejuan-<env>-session`) ; **conditionnel** à Q-ST031-PEP-1 a) |
| 9 | `src/composition/test-ihm/transport-par-pont.ts`, `tests/steps-ihm/support/pont-faux-drive.ts` | Composition de test, test | Créer **au rang 12** (ST-US-018 §3 n° 12) | `TransportSynchro` de la composition `test-ihm` qui appelle un `FauxDrive` **unique** tenu par le processus cucumber, via `context.exposeBinding('donejuanFauxDrive', …)` de Playwright (partagé par tous les onglets et survivant à leur fermeture) ; contenus échangés en base64 de `encoderFichierAppareil` / `encoderManifeste` ; `ReseauIndisponible` si `navigator.onLine` est faux (§6.5) |
| 10 | `src/composition/web.ts`, `src/composition/test-ihm.ts` | Composition | Modifier | `VerrouOngletsWeb`, `exclusionParVerrou`, `CoordinationOnglets.demarrer()` à la place de `cycle.demarrer()` à l'ouverture d'une session ; `coordination.arreter()` à la fermeture de session ; `AvisOnglets` (si Q-ST031-PEP-1 a) |
| 11 | `tests/steps-ihm/onglets.steps.ts` | Test | Créer | Steps de S16 (§12.1) |
| 12 | `tests/doublures/verrou-onglets-memoire.ts` | Test | Créer | `VerrouOngletsEnMemoire` : une instance partagée par plusieurs « onglets » simulés ; file d'attente FIFO par nom ; `fermerOnglet(id)` rend tous les verrous de cet onglet |
| 13 | `tests/contrats/verrou-onglets.contrat.ts` | Test | Créer | Suite de contrat (CT-VER-01 à 05) exécutée sur `VerrouOngletsEnMemoire` et sur `VerrouOngletsWeb` avec un `LockManager` simulé (§13) |

Le contexte `synchronisation` reste seul à connaître les verrous ; `compte` ne connaît que `AvisOnglets`.

## 4. Interfaces et signatures
```ts
// src/synchronisation/application/ports/verrou-onglets.ts — port interne (conventions §2.3), DAT §4.1.6
export type IdOnglet = string & { readonly __marque: 'IdOnglet' }; // doublure seulement
export interface VerrouOnglets {
  /**
   * Exécute `tache` quand aucun autre onglet ne tient le verrou `nom` (mode exclusif ; attente FIFO sinon).
   * Le verrou est rendu à la fin de la tâche, qu'elle réussisse ou échoue ; l'erreur éventuelle est propagée telle quelle.
   */
  executerExclusivement<T>(nom: string, tache: () => Promise<T>): Promise<T>;
  /**
   * Demande la main durable sur `nom`. `quandObtenue` est appelée une seule fois, à l'obtention.
   * Renvoie `rendre` : rend la main si elle est tenue, abandonne la demande sinon ; idempotente.
   */
  demanderLaMain(nom: string, quandObtenue: () => void): () => void;
  /** Vrai si un onglet (celui-ci compris) tient la main sur `nom`. */
  estTenu(nom: string): Promise<boolean>;
}

// src/synchronisation/application/exclusion-cycle.ts
export type ExclusionCycle = { executer<T>(tache: () => Promise<T>): Promise<T> };
export const SANS_EXCLUSION: ExclusionCycle;                       // exécute directement (rangs 3 à 12)
export const exclusionParVerrou = (verrou: VerrouOnglets, nom: string): ExclusionCycle;

// src/synchronisation/application/noms-verrous.ts — nomEspace : ST-US-022 §6 (donejuan-<env>-<sha256 du sub>)
export const nomVerrouMeneur = (nomEspace: string): string;        // `${nomEspace}:synchronisation-meneur`
export const nomVerrouCycle = (nomEspace: string): string;         // `${nomEspace}:synchronisation-cycle`

// src/synchronisation/application/coordination-onglets.ts
export type RoleOnglet = 'MENEUR' | 'SUIVEUR';
export type EtatCoordination = { readonly role: RoleOnglet; readonly autreMeneur: boolean };
export class CoordinationOnglets {
  constructor(d: {
    readonly verrou: VerrouOnglets;
    readonly cycle: Pick<CycleSynchronisation, 'demarrer' | 'arreter' | 'synchroniserMaintenant'>;
    readonly acces: AccesGoogle;
    readonly nomEspace: string;
    readonly journal: JournalTechnique;
  });
  /** Abonnement à l'accès ; candidature si l'accès est VALIDE. Idempotent. */
  demarrer(): void;
  /** Rend la main, arrête le cycle, se désabonne. Idempotent. */
  arreter(): void;
  etat(): Promise<EtatCoordination>;
  observer(rappel: (e: EtatCoordination) => void): Annulation;
}

// src/synchronisation/application/cycle-synchronisation.ts — ajout au type DependancesCycle
readonly exclusion?: ExclusionCycle; // défaut : SANS_EXCLUSION

// src/compte/application/ports/avis-onglets.ts — conditionnel (Q-ST031-PEP-1 a)
export type AvisOnglet = 'SESSION_FERMEE';
export interface AvisOnglets {
  diffuser(avis: AvisOnglet): void;                        // jamais reçu par l'onglet émetteur
  ecouter(rappel: (avis: AvisOnglet) => void): Annulation;
}
```
`VerrouOngletsWeb` : constructeur `new VerrouOngletsWeb(gestionnaire: LockManager | undefined)` (la composition passe `navigator.locks`). `executerExclusivement` → `request(nom, { mode: 'exclusive' }, tache)`. `demanderLaMain` → `request(nom, { mode: 'exclusive', signal }, () => { quandObtenue(); return promesseRendue })` ; `rendre` résout `promesseRendue` si la main est tenue, sinon `abort()` (le rejet `AbortError` de la demande abandonnée est absorbé). `estTenu` → `query()` et recherche de `nom` dans `held`. Sans `LockManager` (API absente) : `executerExclusivement` exécute directement, `demanderLaMain` appelle `quandObtenue` aussitôt, `estTenu` renvoie `false`, et une entrée `avertissement` « verrou entre onglets indisponible » est journalisée une fois.

## 5. Modèle de données
Aucun. Les noms de verrous et le canal d'avis ne sont pas des données. L'`appareilId` est unique par profil de navigateur (base technique, ST-US-022 §5.1) ; l'HLC est lu et avancé dans la transaction IndexedDB, donc partagé entre onglets (socle, UT-SOC-39).

## 6. Règles et algorithmes

### 6.1 Rôle de meneur (`CoordinationOnglets`)
| Événement | Effet |
|---|---|
| `demarrer()`, accès `VALIDE` | Candidature : `rendre ← verrou.demanderLaMain(nomVerrouMeneur, obtenue)` |
| `obtenue` | `role ← MENEUR` ; `cycle.demarrer()` ; `cycle.synchroniserMaintenant()` (déclencheur « ouverture » du nouveau meneur) ; journal `info` « onglet meneur » ; notification |
| Accès qui passe de `VALIDE` à `A_RENOUVELER`, `PERDU` ou `SANS_SESSION` | `cycle.arreter()` (si meneur) ; `rendre()` ; `role ← SUIVEUR` ; notification. Un onglet sans accès ne garde pas la main, afin qu'un onglet qui a un jeton puisse synchroniser (Q-ST031-STA-2) |
| Accès qui redevient `VALIDE` | Nouvelle candidature (placée derrière le meneur actuel s'il existe) |
| `arreter()` | Comme une perte d'accès, puis désabonnement |
| Fermeture de l'onglet meneur | Le navigateur rend le verrou ; le premier candidat en attente devient meneur, sans message |

`etat().autreMeneur` = `role = SUIVEUR` et `verrou.estTenu(nomVerrouMeneur)`.

Un onglet suiveur n'installe aucun déclencheur. Ses modifications sont déposées par le meneur : l'observateur du dépôt du meneur reçoit les transactions des autres onglets (socle, `DepotLocal.observer` : « y compris d'une autre instance »), ce qui arme la temporisation de 5 s (ST-US-017 §6.4).

### 6.2 Exclusion par cycle
- `synchroniserMaintenant()` et `deposerMaintenant()` : le contrôle « cycle déjà en cours dans cet onglet » (`DEJA_EN_COURS`) reste hors de l'exclusion ; **tout le reste du corps** (contrôles du réseau et de l'accès compris, ST-US-017 §6.3) s'exécute dans `exclusion.executer(…)`. Les contrôles sont donc faits après l'obtention du verrou, sur un état à jour.
- Un geste (« Synchroniser maintenant », « Reprendre la synchronisation », reconnexion) dans un onglet suiveur appelle directement `synchroniserMaintenant()` de son propre cycle, avec son propre jeton : il attend la fin du cycle du meneur, puis s'exécute.
- `DepotAvantSortieSynchro` (déconnexion, suppression des données) passe par `deposerMaintenant()`, donc par l'exclusion.
- Le cycle relit la méta (`fichierPropre`, `deposeJusquA`, `pageToken`) dans la base à chaque cycle (ST-US-017 §6.3) ; aucune donnée de cycle n'est gardée en mémoire d'un cycle à l'autre, hors l'état du moteur et le compteur de tentatives de l'onglet.

### 6.3 Feuille
`construireFeuilleSynchronisation` reçoit `EtatCoordination` ; la ligne `SYN-FEUILLE-AUTRE-ONGLET` (guide §6.6.2) est présente si et seulement si `role = SUIVEUR` et `autreMeneur`. L'indicateur et les bandeaux ne changent pas : aucun message n'interrompt l'onglet suiveur.

### 6.4 Fin de session dans un autre onglet (conditionnel, Q-ST031-PEP-1)
Option a) recommandée : `SeDeconnecter` et `SupprimerDonneesAppareil` (ST-US-022 §6.5, §6.6), après leur dernière écriture, appellent `avisOnglets.diffuser('SESSION_FERMEE')`. Chaque autre onglet, à la réception, appelle `coordination.arreter()` puis `location.reload()` (composition) : la nouvelle ouverture suit `deciderOuverture` (ST-US-022 §6.1), donc l'écran de connexion. Sans cet avis, un onglet resté ouvert sur un espace supprimé échouerait à sa prochaine écriture (`versionchange` de Dexie), ce qui n'est pas acceptable.

### 6.5 Pont du `FauxDrive` (composition `test-ihm`)
- Le processus cucumber tient un `FauxDrive` par scénario ; `pont-faux-drive.ts` l'expose par `context.exposeBinding('donejuanFauxDrive', (_source, methode: string, argumentsJson: string) => …)` sur le **contexte persistant** Playwright (`chromium.launchPersistentContext(dossierProfil)`), seul moyen de conserver IndexedDB et le service worker à travers la fermeture d'un onglet, du navigateur ou une « extinction » (S08).
- `TransportParPont` implémente `TransportSynchro` : chaque méthode sérialise ses arguments en JSON (contenus encodés par `encoderFichierAppareil` / `encoderManifeste`, puis base64), appelle `window.donejuanFauxDrive`, et décode la réponse par `decoderFichierAppareil` / `decoderManifeste`. Si `navigator.onLine` est faux, il renvoie `Echec({ type: 'ReseauIndisponible' })` sans appeler le pont (`context.setOffline` ne coupe pas un binding).
- Les assertions « le Drive du compte "A" contient … » lisent ce `FauxDrive` dans le processus cucumber, par les mêmes fonctions qu'au profil `default` (`synchronisation/echanges.steps.ts`).

## 7. Intégration Google
Sans nouvelle requête. Chaque onglet a son propre jeton en mémoire (DAT §4.1.6) ; aucun jeton ne transite entre onglets (ni par `BroadcastChannel`, ni par IndexedDB).

## 8. Gestion des erreurs
| Situation | Comportement | Code |
|---|---|---|
| `navigator.locks` absent | Exécution sans verrou, onglet meneur d'office, journal `avertissement` une fois | — |
| Tâche exécutée sous verrou en échec | Verrou rendu ; l'erreur est traitée par le cycle comme aujourd'hui (ST-US-017 §8) | Selon le cycle |
| Demande de main abandonnée (`AbortError`) | Absorbée par l'adaptateur | — |
| Onglet meneur fermé pendant un dépôt | Le dépôt est interrompu ; `deposeJusquA` n'a pas avancé (ENF-T-07) ; le nouveau meneur redépose, sans doublon (dépôt idempotent, ST-US-017 §6.2) | — |
| Espace supprimé depuis un autre onglet | Option a) de Q-ST031-PEP-1 : rechargement de l'onglet | — |

## 9. Patterns imposés
Port interne au contexte (`VerrouOnglets`) avec doublure en mémoire et suite de contrat ; décorateur d'exclusion injecté (`ExclusionCycle`), sans dépendance de `CycleSynchronisation` à Web Locks ; aucun `navigator.locks` ni `BroadcastChannel` hors de leurs adaptateurs (règle ESLint).

## 10. Sécurité
Aucun jeton partagé entre onglets ; noms de verrous et canal dérivés de `nomEspace` (empreinte du `sub`, jamais le `sub` ni l'adresse : conventions §9.3). Les avis ne transportent aucune donnée personnelle (valeur littérale `SESSION_FERMEE`).

## 11. Exigences non fonctionnelles
| ENF | Vérification |
|---|---|
| ENF-06 : aucune perte, deux onglets | S16 (`@ihm`) ; UT-US-031-08 |
| ENF-T-01 : ouverture hors ligne < 2 s | Déjà couverte (ST-US-018 §11) |

## 12. Step definitions

### 12.1 Phrases
| # | Phrase | Fichier | Rang | Implémentation |
|---|---|---|---|---|
| 1 | `que l'application est fermée sur le PC` ; `l'utilisateur ouvre l'application sur le PC depuis son adresse web` ; `l'utilisateur ferme l'onglet de l'application` | `commun/appareils.steps.ts` (profil `default`) | 12 | Abandon de l'instance de l'application du PC, puis nouvelle instance sur la même base (S21b) ; la nouvelle instance remet à zéro `MasquageRappel` |
| 2 | Mêmes phrases, et `l'utilisateur ouvre l'application sur le PC depuis l'application installée`, `l'utilisateur ferme le navigateur`, `le PC est éteint puis rallumé` | `tests/steps-ihm/navigateur.steps.ts` | 12 | Contexte persistant ; « adresse web » : `page.goto(VITE_BASE_PATH)` ; « application installée » : lecture du manifeste (`link[rel=manifest]`), `page.goto(start_url)` dans une fenêtre `--app` ; vérification que le service worker contrôle la page ; « ferme le navigateur » et « éteint puis rallumé » : `context.close()` puis nouveau contexte persistant sur le même dossier de profil (et `HorlogeSimulee.redemarrer()` pour l'extinction). L'installation réelle reste vérifiée en recette (étape 10 favorable) |
| 3 | `que le PC est sans réseau` ; `le réseau revient sur le PC` ; `le réseau est coupé sur le PC pendant la saisie` | `tests/steps-ihm/reseau.steps.ts` | 12 | `context.setOffline(true / false)` |
| 4 | `que l'application n'a jamais été ouverte dans le navigateur du PC` ; `aucun écran de Done Juan n'est affiché` ; `le navigateur du PC affiche son propre message de page inaccessible` ; `l'utilisateur efface les données de son navigateur sur le PC` | `tests/steps-ihm/navigateur.steps.ts` | 12 | Comme ST-US-018 §12.1 n° 9, avec le paramètre `{appareil}` |
| 5 | `sur le PC, l'utilisateur commence la saisie d'une sous-tâche de la tâche {string}` ; `… saisit l'intitulé {string}, le délai {date} et l'estimation {duree}` ; `l'utilisateur termine la saisie` | `tests/steps-ihm/saisie.steps.ts` | 12 | Formulaire ECR-007 par rôles accessibles ; « termine » : bouton « Ajouter » |
| 6 | `que l'application est ouverte dans deux onglets du PC` | `tests/steps-ihm/onglets.steps.ts` | 13 | Deux pages du même contexte persistant ; attente de `data-etat` de l'indicateur dans les deux |
| 7 | `dans le premier onglet, <motif>` ; `dans le second onglet, <motif>` | idem (`etapeOnglet`, conventions §11.7) | 13 | Sélectionne la page, puis délègue à la phrase IHM `<motif>` |
| 8 | `les deux onglets affichent la tâche {string} et l'objectif {string}` | idem | 13 | Dans chaque page, `expect.poll` (5 s au plus) sur les lignes des listes Tâches et Objectifs |
| 9 | `le Drive du compte {string} contient la tâche {string} exactement une fois` ; `… l'objectif {string} exactement une fois` | `synchronisation/echanges.steps.ts` (réutilisée par le profil `ihm` via le pont) | 3 | Décompte sur l'état fusionné de tous les fichiers du `FauxDrive` |

Autres étapes : réutilisées (ST-US-001 à ST-US-025, ST-US-022, ST-US-017, ST-US-018), avec le paramètre `{appareil}` = « PC ».

### 12.2 Rangs d'exécution (règle de rattachement, conventions §11.13)
- Rang 5 : S04, S05, S07, S09, S13, S18, S19, S19b, S20, S20b, S21, S22, S22b, S22c.
- Rang 7 : S06. Rang 8 : S02, S03. Rang 9 : S10, S11, S12.
- Rang 12 : S01a, S01b, S08, S14, S15, S17 (`@ihm`) ; S21b (fermeture du bandeau, `MasquerRappel24h`).
- Rang 13 : S16 (`@ihm`).
Total : 28.

## 13. Tests unitaires (E10, à livrer avant l'E12 du rang 13)
| Id | Fichier | Élément | Cas | Réf. |
|---|---|---|---|---|
| UT-US-031-01 | `synchronisation/application/coordination-onglets.test.ts` | `CoordinationOnglets` | premier onglet avec accès `VALIDE` → `MENEUR`, `demarrer` une fois puis `synchroniserMaintenant` une fois | §6.1 |
| UT-US-031-02 | idem | idem | second onglet → `SUIVEUR`, `autreMeneur` vrai, cycle non démarré ; fermeture du premier → le second devient `MENEUR`, aucun message (journal `info` seulement) | guide, deux onglets |
| UT-US-031-03 | idem | idem | meneur dont l'accès passe à `A_RENOUVELER` → cycle arrêté, main rendue, le suiveur `VALIDE` devient meneur ; retour à `VALIDE` → nouvelle candidature | §6.1, Q-ST031-STA-2 |
| UT-US-031-04 | idem | idem | `arreter()` idempotent ; demande en attente abandonnée sans devenir meneur ensuite | §6.1 |
| UT-US-031-05 | `synchronisation/application/exclusion-cycle.test.ts` | `exclusionParVerrou` | deux tâches de deux onglets sur le même nom : exécutions disjointes, ordre FIFO ; verrou rendu après un rejet, erreur propagée | §6.2 |
| UT-US-031-06 | `synchronisation/application/cycle-synchronisation.test.ts` (bloc « sous exclusion ») | `CycleSynchronisation` | contrôles du réseau et de l'accès faits **après** l'obtention du verrou ; `DEJA_EN_COURS` sans demander le verrou | §6.2 |
| UT-US-031-07 | `synchronisation/presentation/feuille-synchronisation.test.ts` | `construireFeuilleSynchronisation` | `SYN-FEUILLE-AUTRE-ONGLET` présent pour `SUIVEUR` avec `autreMeneur`, absent sinon ; indicateur inchangé | §6.3 |
| UT-US-031-08 | `synchronisation/integration/deux-onglets.test.ts` (`DepotLocalDexie` × 2 sur une même `IDBFactory`, `FauxDrive`, `VerrouOngletsEnMemoire`) | Deux cycles, deux onglets | modifications dans les deux onglets, dépôts concurrents → un seul fichier d'appareil, chaque élément exactement une fois, aucune entrée en attente perdue (propriété fast-check sur l'entrelacement) | ENF-06, S16 |
| UT-US-031-09 | idem | Meneur et observation | une modification dans l'onglet suiveur arme la temporisation de 5 s du meneur | §6.1 |
| UT-US-031-10 | `synchronisation/infrastructure/verrou-onglets-web.test.ts` | `VerrouOngletsWeb` | `LockManager` absent → exécution directe, meneur d'office, un seul avertissement ; `AbortError` absorbé | §4 |
| CT-VER-01 à 05 | `tests/contrats/verrou-onglets.contrat.ts` | `VerrouOngletsEnMemoire`, `VerrouOngletsWeb` (sur un `LockManager` simulé conforme à la spécification Web Locks) | 01 exclusion ; 02 FIFO ; 03 verrou rendu sur rejet ; 04 `demanderLaMain` puis `rendre` → le suivant obtient ; 05 `rendre` avant obtention → `quandObtenue` jamais appelée | §4 |
| UT-US-031-11 | `compte/application/se-deconnecter.test.ts`, `supprimer-donnees-appareil.test.ts` | Avis de fin de session | `diffuser('SESSION_FERMEE')` après la dernière écriture ; jamais en cas d'échec — **conditionnel** à Q-ST031-PEP-1 a) | §6.4 |

## 14. Tests attendus de Benjamin
| Niveau | Objet | Critère |
|---|---|---|
| Bout en bout | S16 réel : deux pages, coupure, retour du réseau | Profil `ihm` |
| Bout en bout | `VerrouOngletsWeb` sur Chromium réel : fermeture de la page meneur → l'autre devient meneur | `tests/e2e/onglets.spec.ts` |
| Intégration | `AvisOngletsBroadcast` (si Q-ST031-PEP-1 a) : non reçu par l'émetteur, reçu par une autre instance | jsdom ou Playwright |

## 15. Plan de réalisation
1. Port, doublure, contrat (CT-VER) ; `VerrouOngletsWeb` (UT 10). 2. `exclusionParVerrou` et intégration au cycle (UT 05, 06). 3. `CoordinationOnglets` (UT 01 à 04, 09). 4. Feuille (UT 07). 5. Intégration deux onglets (UT 08). 6. Composition, pont, steps S16. 7. Avis de fin de session selon Q-ST031-PEP-1 (UT 11).

Estimation : 3,5 j (dont 0,5 j pour S16 et 0,5 j pour l'avis de fin de session ; le pont du `FauxDrive` est compté au rang 12).

## 16. Points ouverts
- **Q-ST031-STA-1 (Starck) — Port interne `VerrouOnglets`** (signalement imposé par conventions §2.3) : port `VerrouOnglets` du contexte `synchronisation`, deux verrous par espace (`…:synchronisation-meneur` tenu par l'onglet meneur, `…:synchronisation-cycle` autour de chaque cycle). Validez-vous ? a) oui ★ ; b) un seul verrou par cycle, sans meneur (tous les onglets synchronisent à tour de rôle ; `SYN-FEUILLE-AUTRE-ONGLET` devient sans objet, ce qui contredit le guide §6.4).
- **Q-ST031-STA-2 (Starck) — Meneur sans jeton.** Chaque onglet a son propre jeton (DAT §4.1.6). Si le meneur gardait la main avec un jeton expiré, aucun dépôt ne se ferait alors qu'un autre onglet a un jeton valide. Je retiens : seul un onglet dont l'accès est `VALIDE` est candidat ; il rend la main dès qu'il le perd. Validez-vous ? a) oui ★ ; b) le meneur garde la main et l'onglet suiveur ne synchronise que sur un geste.
- **Q-ST031-PEP-1 (Pepper) — Déconnexion ou suppression des données avec deux onglets ouverts.** L'US ne dit pas ce que devient l'autre onglet. Proposition : a) il se recharge et affiche l'écran de connexion (ECR-010), sans message ★ ; b) il reste ouvert sur les données jusqu'à sa fermeture (impossible après « Supprimer les données de cet appareil » : la base n'existe plus) ; c) autre. Si a), un scénario de cas limite est à ajouter, ou le cas est vérifié en recette ; Steeve est consulté si un message est souhaité.
  - **Réponse de Pepper (2026-10-27) : a), précision sans changement de règle.** La session est celle de l'appareil : après « Se déconnecter » ou « Supprimer les données de cet appareil » dans un onglet, l'appareil n'a plus de session ouverte, et US-022 CA-1 impose alors de n'afficher que l'invitation à se connecter, sans aucune donnée (RG-019, RG-043 ; RG-055 et CA-10 : « la session prend fin et l'application revient à l'écran de connexion »). L'option b) contredirait CA-1. Pas de question au commanditaire. Report : US-031 (cas limites, S16b et S16c, `@ihm`), US-022 (cas limite), glossaire d'étapes v1.9. Les modifications en attente sont traitées par l'action elle-même, quel que soit l'onglet où elles ont été faites ; une saisie non validée dans l'autre onglet n'est pas conservée (ce n'est pas une modification enregistrée). « Sans message » : choix d'ergonomie à confirmer par Steeve, non bloquant ; les scénarios ne vérifient aucun message.
- Hypothèses : aucune. Dette : aucune.

## 17. Checklist
- [x] Fichiers, signatures, règles, steps, rangs.
- [ ] Tests du §13 (E10 avant l'E12 du rang 13).
- [ ] Q-ST031-STA-1, Q-ST031-STA-2 et Q-ST031-PEP-1 répondues.
