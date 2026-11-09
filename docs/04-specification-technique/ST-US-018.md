# ST-US-018 — Utiliser l'application sans réseau sur mon smartphone

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-018](../01-specification-fonctionnelle/user-stories/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.md), statut « Prête » (DEC-018 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **12** / 13 |
| Fichier `.feature` | [`tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature`](../../tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature), 30 scénarios (S09b `@recette` ; S18, S19 `@ihm`) |
| Scénarios exécutés au rang 12 | US-018 S17b, S18 (`@ihm`), S19 (`@ihm`) ; US-031 S01a, S01b, S08 (3 exemples), S14, S15, S17 (`@ihm`), S21b (LOT-001, liste nominative) |
| RG couvertes | RG-017, RG-019, RG-021, RG-035, RG-036, RG-047 à RG-049, RG-057 |
| ENF | ENF-04, ENF-06, ENF-07 ; ENF-T-01, ENF-T-02, ENF-T-07 |
| DAT / ADR | DAT v0.11.11 §4.1.5 bis, §4.1.6, §4.1.7 (RED-02, RED-05), §4.2 (« Mettre à jour »), §7.4, §7.4 bis, R15 ; ADR-013 (PWA installée, durabilité stricte, persistance) |
| Résultats du test technique | M-PERSIST favorable (`persist()` accordé sans question à la PWA installée) ; M-DUR favorable ; hors ligne (étape 10) favorable |
| Prérequis | Rangs 0 à 11 fusionnés (PR #35, `bb612a7`) : durabilité stricte, ouverture hors ligne, `MasquageRappel` (rang 1), cycle (rang 3), « Mettre à jour » et `MiseAJourServiceWorker` (rang 11, `SKIP_WAITING` attendu du service worker de ce rang) |
| Questions | Q-ST018-PEP-1 (**bloquante pour la fin de D1**), Q-ST018-STE-2 (**bloquante pour l'invite de D2 seulement**), Q-ST018-STE-3, Q-ST018-STA-2 (**bloquante pour le déploiement de production de F1**), Q-ST018-STA-3 (§16) |
| Version | 0.4.1 |
| Statut | E10 du rang 12 faite : 90 tests rouges, 7 gardes vertes (§13) ; tranches B1, D1, D2, B2, D3, F1 (§15) |
| Auteur | Anthony |
| Branche | `us/US-018-rang12` (E10) ; une branche par tranche et par développeur (OPT-17) |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après M-RED, M-PERSIST, M-DUR). Le repli ADR-012 (SQLite, `@capacitor/network`, horloge native, APK) n'est pas réalisé. |
| 0.2 | 2026-10-27 | Anthony | Réponses de Steeve (Q-ST018-STE-1 : `SYN-FEUILLE-STOCKAGE`, `ALR-015`) et de Starck (Q-ST018-STA-1 a) : rattachement strict ; vérifications sur appareil réel en E14). Table `installation` de la base technique (ST-US-022 v0.2 §5.1). UT-US-018-04 précisé. |
| 0.3 | 2026-10-28 | Anthony | E11, RL-LOT-001-S7 : accessibilité de la ligne « Stockage » et de la carte `ALR-015` (§6, UT-US-018-04) ; RL-A2 et S5 de Steeve sans effet ici. |
| 0.4 | 2026-11-08 | Anthony | **E10 du rang 12**, conception confrontée au code fusionné des rangs 0 à 11 : (1) `MasquerRappel24h` **retiré** : le masquage existe depuis le rang 1 (`MasquageRappel`, `ControleurInterface.masquerRappel`), UT-US-018-03 devient une garde sur le banc ; (2) persistance : port `MemoireDemandePersistance`, `Application.etatPersistance`, exécution concurrente partagée (§4, §6.3) ; (3) déclencheurs de RG-057 : `armerReevaluationRappel` (§6.2) ; (4) service worker : `pwa.config.ts` (fonction pure), `enregistrerServiceWorker` après RED-02, détection d'une version en attente (§6.1) ; (5) **composition `test-ihm` spécifiée** : codec du pont, `TransportParPont`, `FournisseurAuthTestIhm` (Google simulé par binding, sans redirection), mode de construction `test-ihm` (§6.4, §6.5) ; (6) S17b et S21b : geste de reconnexion manquant, constaté à l'essai (Q-ST018-PEP-1, DT-038 entre au rang 12) ; (7) tranches OPT-15 (§15) ; tests UT-US-018-01 à 15 et CT-TRANS sur `TransportParPont` (§13). |
| 0.4.1 | 2026-11-09 | Anthony | Arbitrage rang 12 B1 : §9, `src/main.tsx` dispensé de la règle `navigator.storage` (aligné sur ESLint) ; UT-US-018-01 et 08 renforcés (ordre persist/note ; base ouverte avant fermeture). |

## 1. Résumé technique

- **Constat.** Avec la PWA unique, l'essentiel du hors ligne du smartphone est livré par les rangs 0 à 3 (base locale stricte, ouverture sans réseau, attente, `MEN-ATTENTE`, reprise). 25 des 30 scénarios d'US-018 sont déjà verts (rattachement strict, Q-ST018-STA-1 a).
- **Ce que livre le rang 12** :
  1. le **service worker** généré (vite-plugin-pwa, Workbox, mode `prompt`) : précache de toute l'application, `navigateFallback` (sert le retour de redirection OAuth, hors ligne compris), exclusion des pages publiques, enregistrement après RED-02, détection d'une version en attente et invite (§6.1) ; il traite le message `SKIP_WAITING` attendu par « Mettre à jour » (rang 11) ;
  2. la **persistance du stockage** : `navigator.storage.persist()` au premier lancement, état exposé dans la feuille (`SYN-FEUILLE-STOCKAGE`), carte `ALR-015` s'il n'est pas protégé (§6.3) ;
  3. les **déclencheurs de RG-057** : recalcul de la vue chaque minute et au retour au premier plan (§6.2) ; le masquage existe depuis le rang 1 ;
  4. la **chaîne `@ihm`** : composition `test-ihm` (pont du `FauxDrive`, Google simulé), construction en mode `test-ihm`, profil cucumber `ihm`, `tests/steps-ihm/` (§6.4, §6.5, §12) ;
  5. l'**outillage** : job CI `ihm` (remplace le job `e2e`), `deploiement.yml` (recette et production, conventions §14.3).
- **Hors périmètre** : verrou entre onglets et S16, S16b, S16c (rang 13) ; tout élément du repli ADR-012 ; DT-025 (rang 13, qui modifie le cycle), DT-027 et DT-037 (§16.3).

## 2. Traçabilité
| CA | Scénarios | Rang d'exécution | Composants |
|---|---|---|---|
| CA-1 ouverture sans réseau | S01 ; S19 (`@ihm`) | 5 ; 12 | `OuvrirApplication` (rang 1) ; service worker (§6.1) |
| CA-2 opérations | S02, S03, S04 | 8, 8, 7 | Cas d'usage métier |
| CA-3 indication hors ligne et décompte | S05, S05b, S05c | 5 | Indicateur, `MEN-ATTENTE` |
| CA-4 retour du réseau | S06, S06b, S06c | 5, 7, 5 | Cycle (rang 3), `ReprendreSession` (rang 1) |
| CA-5 aucune perte | S09, S09b ; S18 (`@ihm`) | 5 ; recette ; 12 | Durabilité stricte ; S09b à la main (E14) |
| CA-6 pas de durée maximale | S10 | 5 | — |
| CA-7 conflits | S07, S08 | 9 | Incrément 2 |
| CA-8 accès perdu | S11 | 5 | Bandeau (rang 1), cycle |
| CA-9 RG-057 | S15 à S17d ; S17b | 5 ; 12 | `construireBandeau` (rang 1) ; `MasquageRappel` (rang 1), étape « ferme le bandeau » et `armerReevaluationRappel` (rang 12) |
| Cas limites | S12 (5), S13 (6), S14 (5), S18 et S19 (`@ihm`, 12) | — | — |
| R15 (DAT) | — (aucun scénario ; UT-US-018-01, 02, 04, 06 à 08, 10, 11) | 12 | `DemanderPersistance`, feuille |

## 3. Composants et fichiers
Chaque nouveau fichier de `src/` est déclaré dans `tests/support/rangs/rangs-fichiers.json` (`{ "debut": 12, "fin": 12 }`) par la tranche qui le crée ; ceux de l'E10 y sont déjà.

| # | Fichier | Couche | Action | Tranche | Responsabilité |
|---|---|---|---|---|---|
| 1 | `src/commun/application/ports/persistance-stockage.ts` | Port | **Fait (E10)** | — | `EtatPersistance`, `PersistanceStockage`, `MemoireDemandePersistance` |
| 2 | `src/commun/infrastructure/persistance-navigateur.ts` | Infrastructure | Squelette → réaliser | B1 | `PersistanceNavigateur` : seul accès à `navigator.storage` (règle ESLint à ajouter, §9) |
| 3 | `src/compte/infrastructure/base-technique.ts` | Infrastructure | Squelette → réaliser | B1 | `MemoireDemandePersistanceDexie` (table `installation`, §5) ; `lire`/`ecrire` étendus à la table `installation` |
| 4 | `src/synchronisation/application/cas-usage/demander-persistance.ts` | Application | Squelette → réaliser | B1 | `DemanderPersistance` (§6.3) |
| 5 | `src/composition/application.ts` | Composition | Squelette → réaliser | B1 | Adaptateur `persistance` (fait) ; `etatPersistance` : une instance de `DemanderPersistance` par application (§4.2) |
| 6 | `src/composition/reevaluation-rappel.ts` | Composition | Squelette → réaliser | B1 | `armerReevaluationRappel` (§6.2) |
| 7 | `src/composition/web.ts`, `src/main.tsx` | Composition | Modifier | B1 | Fait (E10) : `Navigateur.gestionnaireStockage`, `persistance: new PersistanceNavigateur(…)`. À faire : §6.2 (réévaluation, `visibilitychange`) et appel de `etatPersistance()` au démarrage (§6.3) |
| 8 | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts` | Modèle de vue | Types faits (E10) → réaliser | D1 | `persistance` en entrée ; `stockage`, `alerteStockage` en sortie (§6.3) |
| 9 | `src/synchronisation/presentation/ui/FeuilleSynchronisation.tsx` | UI | Modifier | D1 | Carte `ALR-015` puis ligne « Stockage » en pied de section (§6.3) |
| 10 | `src/composition/controleur-interface.ts` | Composition | Modifier | D1 | `ApplicationInterface` (fait) ; `#feuille` lit `application.etatPersistance()` |
| 11 | `tests/steps/synchronisation/etat-affiche.steps.ts`, `tests/steps/commun/appareils.steps.ts`, `tests/support/banc/appareil-simule.ts` | Test | Modifier | D1 | Étapes du §12.1 n° 3 et 10 ; DT-038 (§16.3) |
| 12 | `pwa.config.ts` (racine) | Outillage | Squelette → réaliser | D2 | `optionsPwa(environnement)` (§6.1) |
| 13 | `vite.config.ts` | Outillage | Modifier | D2 | `VitePWA(optionsPwa({ env: env['VITE_ENV'], base }))` ; mode `test-ihm` (§6.4 n° 6) livré par B2 |
| 14 | `src/synchronisation/infrastructure/enregistrement-service-worker.ts` | Infrastructure | Squelette → réaliser | D2 | `enregistrerServiceWorker` (§6.1) |
| 15 | `src/main.tsx` | Composition | Modifier | D2 | Appel d'`enregistrerServiceWorker` **après** `demarrerWeb(consommerRetourRedirection(…))` ; `surNouvelleVersion` → `controleur.signalerNouvelleVersion()` |
| 16 | `src/composition/controleur-interface.ts`, modèle de vue et composant de l'invite | Composition, UI | Modifier, créer | D2 | Invite « nouvelle version » selon la réponse à Q-ST018-STE-2 |
| 17 | `tests/e2e/demarrage.e2e.ts` | Test | Créer | D2 | §14 |
| 18 | `src/composition/test-ihm/codec-pont.ts` | Composition de test | Squelette → réaliser | B2 | `encoderPont`, `decoderPont` (§6.4) |
| 19 | `src/composition/test-ihm/transport-par-pont.ts` | Composition de test | Squelette → réaliser | B2 | `TransportParPont` (§6.4) |
| 20 | `src/composition/test-ihm/fournisseur-auth-test-ihm.ts` | Composition de test | Squelette → réaliser | B2 | `FournisseurAuthTestIhm` (§6.5) |
| 21 | `src/composition/test-ihm.ts` | Composition de test | Créer | B2 | `demarrerWeb` de même signature que `web.ts`, avec `TransportParPont` et `FournisseurAuthTestIhm` (§6.4 n° 5) |
| 22 | `vite.config.ts`, `.dependency-cruiser.cjs`, `eslint.config.js` | Outillage | Modifier | B2 | Mode `test-ihm` (alias de `src/composition/web.ts` vers `src/composition/test-ihm.ts`) ; `test-ihm.ts` point d'entrée (non orphelin), interdit à tout autre module de `src/` ; `window.donejuanFaux*` permis dans `src/composition/test-ihm/**` seulement |
| 23 | `tests/support/ihm/repondre-pont-drive.ts` | Test | **Fait (E10)** | — | Côté cucumber du pont du Drive (utilisé par CT-TRANS et par `pont-faux-drive.ts`) |
| 24 | `tests/steps-ihm/support/monde-ihm.ts`, `hooks-ihm.ts`, `pont-faux-drive.ts`, `pont-faux-google.ts`, `serveur-ihm.ts` | Test | Créer | D3 | Monde, contexte persistant Playwright, bindings, serveur statique du build `test-ihm` (§12.3) |
| 25 | `tests/steps-ihm/navigateur.steps.ts`, `reseau.steps.ts`, `saisie.steps.ts`, `contexte.steps.ts`, `compte.steps.ts`, `affichage.steps.ts`, `drive.steps.ts` | Test | Créer | D3 | Étapes du §12.2 |
| 26 | `cucumber.mjs`, `package.json` | Outillage | Modifier | D3 | Profil `ihm` : supports propres (`tests/steps-ihm/support/**`) ; script `build:test-ihm` (`vite build --mode test-ihm --outDir dist-test-ihm`) ; `cucumber:ihm` le précède du build |
| 27 | `.github/workflows/ci.yml` | Outillage | Modifier | F1 | Job `ihm` (build `test-ihm`, `pnpm cucumber:ihm`, `pnpm e2e`) ; job `e2e` retiré ; Jarvis met à jour les contrôles requis |
| 28 | `.github/workflows/deploiement.yml`, `.github/actions/deployer-hebergement/action.yml` | Outillage | Créer | F1 | Conventions §14.3 |
| 29 | `public/accueil.html`, `public/confidentialite.html` | Contenu statique | Créer (selon Q-ST018-STA-2) | F1 | Pages publiques du client OAuth, hors repli du service worker |

## 4. Interfaces et signatures

### 4.1 Persistance (fichiers 1 à 4)
```ts
// src/commun/application/ports/persistance-stockage.ts (fait)
export type EtatPersistance = 'PERSISTANT' | 'NON_PERSISTANT' | 'INDISPONIBLE';
export interface PersistanceStockage { etat(): Promise<EtatPersistance>; demander(): Promise<EtatPersistance> } // ne rejettent jamais
export interface MemoireDemandePersistance { dejaDemandee(): Promise<boolean>; noterDemandee(): Promise<void> }  // ne rejettent jamais
// src/commun/infrastructure/persistance-navigateur.ts
export type GestionnaireStockage = { persisted(): Promise<boolean>; persist(): Promise<boolean> };
export class PersistanceNavigateur implements PersistanceStockage { constructor(gestionnaire: GestionnaireStockage | undefined) }
// src/compte/infrastructure/base-technique.ts
export class MemoireDemandePersistanceDexie implements MemoireDemandePersistance { constructor(base: BaseTechnique) }
// src/synchronisation/application/cas-usage/demander-persistance.ts
export class DemanderPersistance {
  constructor(d: { readonly persistance: PersistanceStockage; readonly memoire: MemoireDemandePersistance });
  executer(): Promise<EtatPersistance>;
}
```

### 4.2 Application et contrôleur (fichiers 5, 10)
- `AdaptateursApplication.persistance: PersistanceStockage` (fait : `PersistanceNavigateur` dans `web.ts`, `PersistanceSimulee` au banc, accordée par défaut).
- `Application.etatPersistance: () => Promise<EtatPersistance>` : `DemanderPersistance` **créée une fois** dans `assemblerApplication`, sur `a.persistance` et `new MemoireDemandePersistanceDexie(base)` ; `etatPersistance = () => demande.executer()`. Sans espace requis.
- `ApplicationInterface` inclut `'etatPersistance'` (fait). `#feuille` ajoute `persistance: await this.application.etatPersistance()` à l'entrée de `construireFeuilleSynchronisation`. La persistance n'est lue que si un espace est ouvert (comme la feuille).

### 4.3 Service worker (fichiers 12, 14, 15)
```ts
// pwa.config.ts
export type EnvironnementPwa = { readonly env: string | undefined; readonly base: string };
export const optionsPwa: (e: EnvironnementPwa) => Partial<VitePWAOptions>;
// src/synchronisation/infrastructure/enregistrement-service-worker.ts
export const enregistrerServiceWorker: (d: {
  conteneur: ConteneurEnregistrement | undefined; base: string; journal: JournalTechnique; surNouvelleVersion: () => void;
}) => Promise<void>;
```
`main.tsx` passe `conteneur: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined`, `base: import.meta.env.BASE_URL`, le journal de l'application (exposé par le contrôleur ou par `demarrerWeb` : `demarrerWeb` rend `{ controleur, journal }` si nécessaire ; Benjamin choisit la forme la plus simple, sans accès global).

### 4.4 Composition `test-ihm` (fichiers 18 à 21)
```ts
// codec-pont.ts
export const encoderPont: (valeur: unknown) => string;   // JSON strict, ErreurProgrammation sinon
export const decoderPont: (texte: string) => unknown;     // ErreurProgrammation si ce n'est pas du JSON
// transport-par-pont.ts
export type PontDrive = (methode: keyof TransportSynchro, argumentsJson: string) => Promise<string>;
export class TransportParPont implements TransportSynchro { constructor(d: { pont: PontDrive; reseau: EtatReseau }) }
// fournisseur-auth-test-ihm.ts
export const VALIDITE_JETON_TEST_IHM_MS = 3_600_000;
export type PontGoogle = (methode: 'demanderJeton' | 'oublier', argumentsJson: string) => Promise<string>;
export class FournisseurAuthTestIhm implements FournisseurAuth {
  constructor(d: { pont: PontGoogle; reseau: EtatReseau; coffre: CoffreJetons; horloge: Pick<Horloge, 'monotone'> });
}
// test-ihm.ts
export const demarrerWeb: (retour: RetourGoogle, navigateur: Navigateur) => ControleurInterface; // même signature que web.ts
```

## 5. Modèle de données
Base technique (ST-US-022 v0.2 §5.1), table `installation` (déjà déclarée, version 1 inchangée) : ligne `{ cle: 'persistanceDemandee', demandee: true }`, validée par Zod (`demandee: z.literal(true)`) ; ligne invalide → « absente » et `signalerLigneInvalide('installation')`. Écriture en durabilité stricte, confirmée à `complete`. Aucune migration ; aucun impact sur le format Drive ni sur l'espace du compte. La base technique n'est pas effacée par « Supprimer les données de cet appareil » : la demande n'est donc faite qu'une fois par installation, ce qui est voulu (Chrome mémorise sa réponse par origine).

## 6. Règles et algorithmes

### 6.1 Service worker et mise à jour (tranche D2)
1. `optionsPwa({ env, base })` rend exactement : `registerType: 'prompt'` ; `injectRegister: false` ; `workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'], navigateFallback: \`${base}index.html\`, navigateFallbackDenylist: [motif de ${base}accueil.html, motif de ${base}confidentialite.html] }` (motifs ancrés, `.` échappé ; ni `skipWaiting`, ni `clientsClaim`, ni `runtimeCaching`) ; `manifest: { name: env === 'recette' ? 'Done Juan (recette)' : 'Done Juan', short_name: 'Done Juan', lang: 'fr', start_url: base, scope: base, display: 'standalone' }`. Le service worker généré en mode `prompt` traite `{ type: 'SKIP_WAITING' }` (attendu par `MiseAJourServiceWorker`, rang 11).
2. Aucune requête Google n'est mise en cache ; les navigations servent `index.html` du précache : le fragment du retour de redirection n'atteint ni le réseau ni le cache (RED-05).
3. `enregistrerServiceWorker` : `conteneur` absent → rien. Sinon `register(\`${base}sw.js\`, { scope: base })`, une fois. Si `enregistrement.waiting` n'est pas nul → `surNouvelleVersion()` une fois. Sur `updatefound`, le travailleur `installing` est suivi : à l'état `installed`, si `conteneur.controller` n'est pas nul (page déjà contrôlée), `surNouvelleVersion()` ; au tout premier chargement (`controller` nul), jamais. Échec de `register` : journal `avertissement`, événement `EnregistrementServiceWorkerEnEchec`, champ `erreur` = `name` de l'erreur (ou `inconnue`) ; jamais de rejet.
4. **Ordre RED-02** : `main.tsx` appelle `enregistrerServiceWorker` après `demarrerWeb(consommerRetourRedirection(…))`, jamais avant (vérifié par `tests/e2e/demarrage.e2e.ts` : `location.hash` vide au premier rendu ; et à la revue).
5. **Invite « nouvelle version »** : `surNouvelleVersion` marque une version en attente dans le contrôleur ; l'action de l'invite appelle `controleur.mettreAJour()` (rang 11 : `MiseAJourServiceWorker`, issues `ERR-013` `rechargement`, `aucune-version`, `echec`). Une nouvelle version n'interrompt jamais une saisie et ne recharge jamais sans geste. Code, texte et emplacement : **Q-ST018-STE-2** ; sans réponse au démarrage de D2, D2 livre 1 à 4 et l'invite fait l'objet d'un complément de D2.

### 6.2 RG-057 : déclencheurs du recalcul (tranche B1)
- La décision reste `construireBandeau` (ST-US-022 §6.9) ; le masquage reste `MasquageRappel` (rang 1) : instance par application, remise à faux par une nouvelle instance (ouverture, rechargement), **jamais** par un retour au premier plan (garde UT-US-018-03).
- `armerReevaluationRappel(planificateur, rafraichir)` : `planificateur.periodiquement(PERIODE_EVALUATION_RAPPEL_HORS_LIGNE, rafraichir)` (60 s, `parametres-synchronisation.ts`), sans appel à l'armement ; rend l'annulation.
- `web.ts` : après la création du contrôleur, `armerReevaluationRappel(new PlanificateurNavigateur(), () => void controleur.rafraichir())` ; dans `auChangementDeVisibilite`, page visible → `void controleur.rafraichir()` après `definirPremierPlan(true)`. L'annulation n'est pas nécessaire (la page vit autant que l'application).
- Banc : inchangé (les étapes « nous sommes le … » recalculent la vue, ST-US-022 §12).

### 6.3 Persistance et feuille (tranches B1, D1)
1. `PersistanceNavigateur` : gestionnaire absent → `INDISPONIBLE` ; `persisted()` / `persist()` : `true` → `PERSISTANT`, `false` → `NON_PERSISTANT` ; rejet ou exception synchrone → `INDISPONIBLE`. `etat()` n'appelle que `persisted()`, `demander()` que `persist()`.
2. `DemanderPersistance.executer()` : si une exécution est en cours, rend sa promesse (appels concurrents : une seule demande) ; sinon : `dejaDemandee()` faux → `demander()`, puis `noterDemandee()` (même si refusée : la demande n'est jamais refaite), rend l'état obtenu ; vrai → `etat()`. La promesse partagée est oubliée une fois réglée (l'appel suivant relit l'état : la carte disparaît quand le navigateur accorde la persistance).
3. `web.ts` appelle `void application.etatPersistance()` une fois au démarrage, après `ouvrirApplication` (premier lancement : la demande est faite même avant la connexion).
4. Feuille : `persistance` absente → ni `stockage` ni `alerteStockage` ; `PERSISTANT` → `stockage = { code: 'SYN-FEUILLE-STOCKAGE', etat: 'PROTEGE', libelle: libelle('SYN-FEUILLE-STOCKAGE') }` ; `NON_PERSISTANT` ou `INDISPONIBLE` → `etat: 'NON-PROTEGE'`, `libelle('SYN-FEUILLE-STOCKAGE', { variante: 'non-protege' })` et `alerteStockage = { code: 'ALR-015', titre: libelle('ALR-015'), texte: libelle('ALR-015', {}, 'texte'), role: 'status', fermable: false }`. Rien d'autre ne change : cartes d'erreur, bouton, indicateur, bandeau, consultation seule (UT-US-018-04, 11).
5. UI : en pied de la section « Synchronisation », après le bouton « Synchroniser maintenant » et son explication : la carte `ALR-015` (`IonCard`, `data-message="ALR-015"`, `data-niveau="attention"`, `role="status"`, titre et texte, **aucun bouton**), puis la ligne `<p data-etat="PROTEGE|NON-PROTEGE">` (texte simple, dernier élément `data-etat` / `data-message` de la section). Emplacement soumis à Steeve (Q-ST018-STE-3, non bloquante) ; s'il en décide autrement, j'adapte UT-US-018-10 avant la fin de D1.

### 6.4 Composition `test-ihm` et pont du `FauxDrive` (tranche B2)
1. `encoderPont` : JSON strict. Admis : `null`, booléen, nombre fini, chaîne, tableau, objet dont le prototype est `Object.prototype` ou `null`. Une propriété d'objet de valeur `undefined` est omise. Toute autre valeur, à n'importe quelle profondeur, lève `ErreurProgrammation` (message : chemin et type). `decoderPont` : `JSON.parse`, `ErreurProgrammation` si l'analyse échoue.
2. `TransportParPont` : pour chaque méthode du port (11), `reseau.estConnecte()` faux → `Echec({ type: 'ReseauIndisponible' })` sans appel au pont ; sinon `decoderPont(await pont(nom, encoderPont([...arguments])))` (les arguments dans l'ordre de la signature, objets compris). Aucune autre logique : les erreurs du Drive viennent du `FauxDrive`.
3. Côté cucumber, `repondrePontDrive(transport, methode, argumentsJson)` (fait) décode, appelle la méthode du transport du `FauxDrive` vu par l'appareil (`drive.transportPour(appareilId, conditions)`), encode la réponse.
4. Le contrat CT-TRANS-01 à 15 s'exécute aussi sur `TransportParPont` relié au `FauxDrive` par `repondrePontDrive` (preuve que le pont est transparent).
5. `test-ihm.ts` exporte `demarrerWeb(retour, navigateur)` : copie de la composition de `web.ts` (même `Navigateur`, même contrôleur, mêmes écouteurs) où seuls changent : `transport: () => new TransportParPont({ pont: window.donejuanFauxDrive, reseau })`, `fournisseur: ({ coffre }) => new FournisseurAuthTestIhm({ pont: window.donejuanFauxGoogle, reseau, coffre, horloge })`, `env` forcé à `recette`. Binding absent → `ErreurProgrammation` au démarrage. Pour éviter la duplication, B2 extrait de `web.ts` une fonction `demarrerAvec(adaptateursVariables)` partagée ; `web.ts` et `test-ihm.ts` ne diffèrent alors que par ces deux fabriques.
6. Construction : `vite build --mode test-ihm` ; dans ce mode seulement, `resolve.alias` remplace `src/composition/web.ts` par `src/composition/test-ihm.ts` (le build de production ne contient jamais la composition de test : vérifié en CI par l'absence de la chaîne `donejuanFauxDrive` dans `dist/`, contrôle ajouté par F1).

### 6.5 Google simulé (`FournisseurAuthTestIhm`, tranche B2)
- `demanderJeton(demande)` : réseau coupé → `Echec(ReseauIndisponible)` sans appel ; sinon `pont('demanderJeton', encoderPont([{ mode, portees, indice? }]))` ; succès → jeton `jeton-test-ihm:<compte>` placé dans le coffre, échéance `horloge.monotone() + VALIDITE_JETON_TEST_IHM_MS`, rend `ACCES_OBTENU` avec l'accès reçu ; échec → même échec, coffre inchangé. Jamais `REDIRECTION_LANCEE` : à l'ouverture en ligne, `OuvrirApplication` ouvre alors la session à `VALIDE` (branche existante de `#redirectionSilencieuse`).
- `recevoirRetour` → `Echec(RetourRedirectionRejete, SANS_DEPART)` sans appel ; `oublier()` → `coffre.vider()`, puis `pont('oublier', '[]')` sans attente.
- Côté cucumber (`pont-faux-google.ts`, D3) : une `FauxFournisseurAuth` par appareil IHM pilote la réponse (session Google, accès accordé ou retiré) ; `demanderJeton` y rend `succes(AccesObtenu)` ou l'erreur que rendrait `FauxFournisseurAuth` pour ce mode.
- Le parcours réel par redirection reste couvert par les tests de `FournisseurAuthWeb` (rang 1), `tests/e2e/demarrage.e2e.ts` et la recette (Q-ST018-STA-3).

## 7. Intégration Google
Sans objet (aucune nouvelle requête).

## 8. Gestion des erreurs
| Situation | Comportement | Code |
|---|---|---|
| `persist()` refusé, API absente ou en échec | Ligne « non protégé » et carte `ALR-015` dans la feuille ; aucun bandeau, aucun blocage | `SYN-FEUILLE-STOCKAGE`, `ALR-015` |
| Base technique fermée ou indisponible | `dejaDemandee()` faux, `noterDemandee()` sans effet : la demande est refaite au lancement suivant (sans conséquence) | — |
| `register` du service worker en échec | Journal `avertissement` `EnregistrementServiceWorkerEnEchec` ; l'application fonctionne en ligne, sans hors ligne d'ouverture | — |
| Valeur non sérialisable dans le pont (`test-ihm`) | `ErreurProgrammation` (défaut du test, jamais en production) | — |
| Première ouverture sans réseau, application jamais chargée | Page d'erreur du navigateur | — (S19, US-031 S14) |
| Données du navigateur effacées | Modifications non déposées perdues ; rechargement depuis le Drive à la connexion | — (S18, US-031 S15) |

## 9. Patterns imposés
- Service worker généré (Workbox), aucun code de service worker écrit à la main.
- Port `PersistanceStockage` ; **aucun accès à `navigator.storage` hors de `persistance-navigateur.ts` et de `src/main.tsx`** (qui se borne à transmettre `navigator.storage` à la composition, §3 n° 7, §4.2) : règle `no-restricted-properties` (objet `navigator`, propriété `storage`) avec exception par bloc `files` (conventions §14.2), ajoutée par B1.
- Composition de test isolée par alias de construction ; `src/composition/test-ihm/**` n'est importé que par `src/composition/test-ihm.ts` (dependency-cruiser) ; aucune logique métier dans le pont.

## 10. Sécurité
RED-02 : service worker enregistré après la consommation du retour de redirection ; RED-05 : jamais de jeton ni de fragment en cache (précache seul). CSP inchangée. La composition `test-ihm` (Google simulé) n'est jamais construite en production (§6.4 n° 6, contrôle CI). Aucune donnée personnelle dans le journal (`erreur` = nom de l'erreur seulement).

## 11. Exigences non fonctionnelles et doublures
| ENF | Vérification |
|---|---|
| ENF-T-01 : ouverture hors ligne < 2 s | `tests/e2e/demarrage.e2e.ts` (indicatif en CI) ; recette E14 sur le téléphone |
| ENF-06 : aucune perte | S09 ; S18 et US-031 S08 (`@ihm`) ; S09b (recette, M-DUR) |

### 11.3 Doublures (faites en E10)
`tests/doublures/persistance-simulee.ts` (`PersistanceSimulee(etatCourant, reponseALaDemande)`, compteurs, `changerEtat`) ; branchée au banc (`AppareilSimule.persistance`, accordée par défaut) ; `HORLOGE_ABSENTE` fournit `etatPersistance` (`PERSISTANT`) aux montages du contrôleur.

## 12. Step definitions

### 12.1 Profil `default` (banc)
| # | Phrase | Fichier | Tranche | Implémentation |
|---|---|---|---|---|
| 3 | `sur le {appareil}, l'utilisateur ferme le bandeau {string}` | `synchronisation/etat-affiche.steps.ts` | D1 | Le code doit être `BAN-RAPPEL-24H` (sinon erreur « bandeau non fermable ») ; le bandeau doit être affiché (`vueAffichee()`), puis `controleur.masquerRappel()` |
| 10 | `l'utilisateur ferme l'onglet de l'application` | `commun/appareils.steps.ts` | D1 | `fermerApplication()` du **PC** (phrase sans appareil : US-031, PC seul) |
| 10 b | `l'utilisateur ouvre l'application sur le {appareil} depuis son adresse web` | idem | D1 | `ouvrirApplication()` (au banc, même ouverture que « ouvre l'application ») |
| DT-038 | `(que )le {appareil} a été éteint puis rallumé` | `commun/appareils.steps.ts`, `support/banc/appareil-simule.ts`, `banc-synchro.ts` | D1 | Après la modification de S12d par Pepper : retirer `seReconnecterAuRetourDuReseau`, `reconnexionEnCours`, `reconnexionAuRetourDuReseau`, `reconnecter` et leur usage dans `attendreCycles` |

À l'essai (E10, étapes provisoires non commitées) : S17b et S21b échouent sur leur dernière assertion (« le bandeau n'est pas affiché » après « le réseau revient ») : rouverte hors ligne, l'application n'a pas de jeton et passe en `SYN-SESSION` ; le rappel reste affiché en variante `session`. Avec « l'utilisateur fait le geste de reconnexion » après le retour du réseau, S17b passe. → **Q-ST018-PEP-1**.

### 12.2 Profil `ihm` (Playwright) — tranche D3
Relevé du passage à blanc (`RANG_COURANT=12 pnpm cucumber:ihm --dry-run`) : 10 exécutions (S18, S19 ; US-031 S01a, S01b, S08 ×3, S14, S15, S17), 131 étapes, toutes indéfinies. Phrases à définir dans `tests/steps-ihm/` :

| # | Phrases | Fichier | Implémentation |
|---|---|---|---|
| 1 | `nous sommes le {date} à {heure} heure de {fuseau}` | `contexte.steps.ts` | Temps du banc (`TempsSimule`) et horloge de la page : `page.clock.setFixedTime` (Playwright) avant toute navigation ; mêmes conversions que `commun/temps.steps.ts` |
| 2 | `que l'utilisateur utilise le compte {string} sur le {appareil} et sur le {appareil}, tous deux à jour` ; `un objectif {string} de délai {date}` ; `les tâches suivantes :` | `contexte.steps.ts` | L'**autre** appareil (non IHM) est un `AppareilSimule` du banc : il se connecte au compte, crée les données par les fonctions de support du profil `default` (aucune duplication : importer les fonctions de `tests/support/`, pas les fichiers d'étapes) et les dépose dans le `FauxDrive` ; l'appareil IHM (smartphone pour US-018, PC pour US-031) ouvre la page en ligne, Google simulé accordé au compte, et attend `SYN-OK` sur l'indicateur (`expect.poll`, 10 s au plus) |
| 3 | `que l'application est fermée sur le {appareil}` ; `l'utilisateur ferme l'onglet de l'application` ; `l'utilisateur ferme le navigateur` ; `le {appareil} est éteint puis rallumé` | `navigateur.steps.ts` | Fermer la page ; « navigateur » et « éteint » : `context.close()` puis nouveau contexte persistant sur le même dossier de profil (et `HorlogeSimulee.redemarrer()` du banc pour l'extinction) |
| 4 | `l'utilisateur ouvre l'application sur le {appareil} depuis son adresse web` ; `… depuis l'application installée` | `navigateur.steps.ts` | ST-US-031 §12.1 n° 2 ; attendre que la racine `[data-ecran]` soit rendue |
| 5 | `que l'application n'a jamais été ouverte dans le navigateur du {appareil}` ; `l'utilisateur efface les données de son navigateur sur le {appareil}` ; `sur le {appareil}, aucun écran de Done Juan n'est affiché` ; `le navigateur du {appareil} affiche son propre message de page inaccessible` | `navigateur.steps.ts` | ST-US-018 v0.3 §12.1 n° 9 (contexte neuf ; effacement : `indexedDB.databases()` puis `deleteDatabase`, `caches.keys()` puis `delete`, désinscription des service workers, `context.clearCookies()`, puis rechargement) ; absence de `[data-ecran]` ; URL `chrome-error://` |
| 6 | `que le {appareil} est sans réseau` ; `le réseau revient sur le {appareil}` ; `le réseau est coupé sur le {appareil} pendant la saisie` | `reseau.steps.ts` | `context.setOffline(true / false)` ; « revient » : attendre la fin du cycle (indicateur différent de `SYN-SYNCHRO`, `expect.poll`) |
| 7 | `l'utilisateur se connecte avec le compte {string} sur le {appareil}` ; `sur le {appareil}, l'utilisateur fait le geste de reconnexion` | `compte.steps.ts` | Google simulé accordé au compte, puis bouton « Continuer avec Google » (rôle) ; geste : bouton « Reprendre la synchronisation » de l'indicateur |
| 8 | `sur le {appareil}, l'utilisateur renomme la tâche {string} en {string}` ; `… commence la saisie d'une sous-tâche de la tâche {string}` ; `… saisit l'intitulé {string}, le délai {date} et l'estimation {duree}` ; `l'utilisateur termine la saisie` | `saisie.steps.ts` | Par rôles accessibles (ECR-002, ECR-007), comme les tests de composants (`renseigner`) |
| 9 | `sur le {appareil}, la tâche {string} existe avec le délai {date}` ; `… n'existe pas` ; `… porte la mention {string}` ; `sur le {appareil}, les données présentes sur le {appareil} s'affichent aussitôt` ; `sur le {appareil}, l'indicateur de synchronisation est {string}, avec l'action {string}` | `affichage.steps.ts` | `expect.poll` (5 s au plus) sur `data-etat`, `data-message` et rôles ; « aussitôt » : la liste est rendue avant toute réponse du pont (le pont du Drive est retenu jusqu'à l'assertion, comme la porte du banc) |
| 10 | `le Drive du compte {string} contient la tâche {string}` ; `… exactement une fois` | `drive.steps.ts` | Mêmes fonctions de lecture du `FauxDrive` qu'au profil `default` (`tests/support/synchronisation/drive-banc.ts`), après attente de la fin des appels du pont en cours |

### 12.3 Support du profil `ihm` (D3)
`monde-ihm.ts` : un `BancSynchro` (temps, `FauxDrive`, `FauxGoogle`, appareils simulés), le dossier de profil (temporaire, supprimé en `After`), le contexte persistant et la page courante. `hooks-ihm.ts` : `BeforeAll` démarre `vite preview` sur `dist-test-ihm` (port fixe, `strictPort`) ; `Before` crée le banc et le contexte persistant (`chromium.launchPersistentContext`, viewport 390 × 844 pour le smartphone, 1280 × 800 pour le PC, `serviceWorkers: 'allow'`), expose `donejuanFauxDrive` (via `repondrePontDrive`) et `donejuanFauxGoogle` ; `After` ferme le contexte et arrête le banc. Délais : `expect.poll` 5 s (10 s pour la synchronisation), aucun `waitForTimeout`.

### 12.4 Rangs d'exécution (inchangés)
- Rang 5 : S01, S05, S05b, S05c, S06, S06c, S09, S10, S11, S12, S14, S15, S15b, S15c, S16, S16b, S17, S17c, S17d. Rang 6 : S13. Rang 7 : S04, S06b. Rang 8 : S02, S03. Rang 9 : S07, S08.
- Rang 12 : S17b, S18 (`@ihm`), S19 (`@ihm`) ; avec US-031 S01a, S01b, S08, S14, S15, S17 (`@ihm`), S21b.
- Recette (E14) : S09b. Total : 30.

## 13. Tests unitaires (E10, faits, rouges)
Règles de rang : `UT-US-018-\d+` → 12 (existante) ; `TransportParPont.*CT-TRANS-\d+` → 12 (ajoutée en tête). Au rang 11 : 1 377 tests verts, aucun des nouveaux exécuté. Au rang 12 (`RANG_COURANT=12 pnpm test`) : **90 rouges**, 7 gardes vertes (marquées G), aucune autre régression.

| Id | Fichier (`tests/…`) | Élément | Cas | Tranche |
|---|---|---|---|---|
| UT-US-018-01 | `unitaires/synchronisation/application/demander-persistance.test.ts` | `DemanderPersistance` | premier lancement : `persist()` une fois, drapeau noté après, état rendu ; refusé : noté, jamais redemandé ; ensuite : `persisted()` seul, état qui suit le navigateur (3 tests) | B1 |
| UT-US-018-02 | idem | idem | API absente → `INDISPONIBLE`, sans erreur | B1 |
| UT-US-018-03 (G) | `unitaires/composition/masquage-rappel-instance.test.ts` | Banc, `MasquageRappel` | masqué ; non remis par un retour au premier plan ; remis par une nouvelle ouverture | D1 (garde) |
| UT-US-018-04 | `unitaires/synchronisation/presentation/feuille-stockage.test.ts` | `construireFeuilleSynchronisation` | `PROTEGE` sans carte ; `NON-PROTEGE` + `ALR-015` (`status`, non fermable, sans action) pour `NON_PERSISTANT` et `INDISPONIBLE` ; non lue : rien (G) ; reste de la feuille identique (G) | D1 |
| UT-US-018-05 | `unitaires/composition/options-pwa.test.ts` | `optionsPwa` | `prompt`, pas d'injection ni de `skipWaiting` ; précache seul ; `navigateFallback` sous la base ; exclusion des seules pages publiques ; manifeste et nom de recette (5 tests) | D2 |
| UT-US-018-06 | `demander-persistance.test.ts` | `DemanderPersistance` | appels concurrents : une demande, un drapeau ; promesse oubliée une fois réglée | B1 |
| UT-US-018-07 | `unitaires/commun/infrastructure/persistance-navigateur.test.ts` | `PersistanceNavigateur` | `persisted`/`persist` vrai, faux ; API absente ; rejet et exception → `INDISPONIBLE` (4 tests) | B1 |
| UT-US-018-08 | `integration/compte/memoire-demande-persistance.test.ts` | `MemoireDemandePersistanceDexie` | relu par une autre instance, ligne exacte ; base fermée ; ligne invalide signalée (3 tests) | B1 |
| UT-US-018-09 | `unitaires/composition/reevaluation-rappel.test.ts` | `armerReevaluationRappel` | 0 à 59,999 s, 1 à 60 s, 2 à 120 s ; annulation (2 tests) | B1 |
| UT-US-018-10 | `unitaires/synchronisation/presentation/ui/feuille-stockage.test.tsx` | `FeuilleSynchronisation` | ligne en texte simple ; carte `status`, niveau Attention, sans bouton ; ordre en pied de section ; non lue : rien (G) | D1 |
| UT-US-018-11 | `unitaires/composition/controleur-stockage.test.ts` | `ControleurInterface` | non protégé puis protégé au calcul suivant ; indicateur et bandeau identiques (G) ; sans espace : persistance non lue (G) | D1 |
| UT-US-018-12 | `unitaires/synchronisation/infrastructure/enregistrement-service-worker.test.ts` | `enregistrerServiceWorker` | URL et portée ; sans service worker ; version déjà en attente ; mise à jour trouvée → `installed` ; premier chargement jamais annoncé ; échec journalisé (6 tests) | D2 |
| UT-US-018-13 | `unitaires/composition/test-ihm/codec-pont.test.ts` | `encoderPont`, `decoderPont` | aller-retour exact (contenu, inconnus, résultats) ; `undefined` omis ; 11 valeurs refusées ; JSON invalide (14 tests) | B2 |
| UT-US-018-14 | `unitaires/composition/test-ihm/transport-par-pont.test.ts` | `TransportParPont` | 11 méthodes hors ligne sans pont ; 11 méthodes en ligne, un appel nommé ; ordre des arguments (G : décompte des méthodes) | B2 |
| UT-US-018-15 | `unitaires/composition/test-ihm/fournisseur-auth-test-ihm.test.ts` | `FournisseurAuthTestIhm` | accès et coffre ; hors ligne ; refus ; `recevoirRetour` ; `oublier` (5 tests) | B2 |
| CT-TRANS-01 à 15 | `contrats/transport-synchro.contrat.ts` (« TransportParPont sur FauxDrive ») | Pont complet | Suite de contrat existante sur le pont (15 tests) | B2 |

Leçons du rang 11 appliquées : tests écrits avant le code ; assertions exactes (valeurs, appels comptés, ordre), aucune assertion « définie » seule ; chaque règle a un test qui rougit sous sa mutation évidente (par exemple : appel de `persist()` à chaque lancement → UT-01 rouge ; promesse partagée retirée → UT-06 rouge ; `controller` ignoré → UT-12 « premier chargement » rouge ; omission du contrôle de réseau → UT-14 rouge). L'E13 refera ces essais de mutation. Tests d'interface : aucune saisie Ionic ici ; si D2 ajoute un composant d'invite, ses tests passent par `surPresentationModale` / `renseigner` et `waitFor` (conventions §11.12).

**Tests complémentaires** (`UT-COMP-US-018-nn`, règle ajoutée par Anthony en E13) : attendus pour `test-ihm.ts` (binding absent), pour `main.tsx` si l'ordre RED-02 devient testable hors Playwright, et pour l'invite (après Q-ST018-STE-2).

## 14. Tests attendus des développeurs
- D2 : `tests/e2e/demarrage.e2e.ts` (Playwright, build de production) : `location.hash` vide au premier rendu (RED-02) ; après une première visite en ligne, rechargement hors ligne : l'écran de connexion ou l'espace s'affiche (service worker) ; `navigator.serviceWorker.controller` non nul après rechargement ; axe sans violation `serious` ou `critical`. Intégration de `PersistanceNavigateur` dans Chromium réel (`persisted()` répond).
- F1 : contrôle « aucune composition de test dans `dist/` » (§6.4 n° 6).

## 15. Plan de réalisation (OPT-15 : une tranche à la fois, chacune < 3 j)
| Ordre | Tranche | Développeur, modèle | Contenu | Tests à faire passer | Effort |
|---|---|---|---|---|---|
| 1 | **B1** Persistance et RG-057 | Bruce, opus | §3 n° 2 à 7 ; §6.2 ; §6.3 n° 1 à 3 ; règle ESLint `navigator.storage` | UT-US-018-01, 02, 06, 07, 08, 09 | 1 j |
| 2 | **D1** Feuille, étapes du banc, DT-038 | Benjamin, sonnet | §3 n° 8 à 11 ; §6.3 n° 4, 5 ; §12.1 ; après Q-ST018-PEP-1 : S17b, S21b, S12d verts | UT-US-018-03, 04, 10, 11 ; S17b, S21b | 1 j |
| 3 | **D2** Service worker et invite | Benjamin, sonnet | §3 n° 12 à 17 ; §6.1 | UT-US-018-05, 12 ; e2e démarrage | 1 j |
| 4 | **B2** Composition `test-ihm` et pont | Bruce, opus | §3 n° 18 à 22 ; §6.4, §6.5 | UT-US-018-13, 14, 15 ; CT-TRANS sur `TransportParPont` | 1,5 j |
| 5 | **D3** Chaîne `@ihm` et livraison du rang | Benjamin, sonnet | §3 n° 24 à 26 ; §12.2, §12.3 ; `rangCourant = 12` en dernier | 10 exécutions `@ihm` ; toute la suite au rang 12 | 1,5 j |
| 6 | **F1** CI et déploiement | Friday, sonnet | §3 n° 27 à 29 ; conventions §14.1, §14.3 | Job `ihm` vert ; `deploiement.yml` à blanc (`workflow_dispatch` recette) | 0,5 j |

Total : **6,5 j** (inchangé). Dépendances : D1 après B1 ; D3 après D2 et B2 ; F1 après D3. B2 peut précéder D1 ou D2 si Q-ST018-PEP-1 ou Q-ST018-STE-2 tardent. La PR qui livre le rang porte `rangCourant = 12` (D3).

## 16. Points ouverts

### 16.1 Questions
| Id | À | Bloquante | Question (fermée) |
|---|---|---|---|
| **Q-ST018-PEP-1** | Pepper | **Oui, pour la fin de D1** (S17b, S21b) | Rouverte hors ligne, l'application n'a plus de jeton : au retour du réseau, elle passe en `SYN-SESSION` et ne dépose rien sans geste (US-017 S06f, US-031 S08) ; S17b et S21b attendent pourtant la disparition du rappel au seul retour du réseau (constaté à l'essai : rouge sans geste, vert avec). a) ★ Ajouter « Et sur le {smartphone \| PC}, l'utilisateur fait le geste de reconnexion » après « Quand le réseau revient sur le … » dans S17b et S21b, **et** dans US-017 S12d après « Et le réseau revient sur le smartphone » (DT-038) ; b) dans S17b et S21b, vérifier d'abord le rappel en variante `session`, puis le geste, puis l'absence. |
| **Q-ST018-STE-2** | Steeve | **Oui, pour l'invite de D2 seulement** | Invite « nouvelle version » (DAT §7.4 : « invite "nouvelle version", sans rechargement forcé ») : aucun code au catalogue. a) ★ Toast non bloquant `TST-NOUVELLE-VERSION` « Une nouvelle version de Done Juan est disponible. », action « Mettre à jour » (même action et mêmes retours `ERR-013` que la carte), affiché une fois par version détectée ; b) carte « Attention » dans la feuille ECR-011 seulement, même action ; c) aucune invite : la nouvelle version s'applique à la prochaine ouverture après fermeture de toutes les fenêtres (exige l'accord de Starck, DAT §7.4). |
| Q-ST018-STE-3 | Steeve | Non | Emplacement de la carte `ALR-015` dans ECR-011 : a) ★ en pied de la section « Synchronisation », juste avant la ligne « Stockage » (§6.3 n° 5) ; b) dans la section « Erreurs qui demandent une action », après `ALR-001`. |
| **Q-ST018-STA-2** | Starck | **Oui, pour le déploiement de production de F1** | `deploiement.yml` publie `dist/` sur GitHub Pages et remplace le site actuel, dont les pages publiques du PoC (`accueil.html`, `confidentialite.html`) exigées par l'écran de consentement (DAT §4.1.7, prérequis de publication). a) ★ Les copier dans `public/` de l'application (textes inchangés), hors repli du service worker (UT-US-018-05) ; b) les servir ailleurs (préciser l'adresse et la mise à jour du client OAuth). |
| Q-ST018-STA-3 | Starck | Non | La chaîne `@ihm` simule Google sans redirection (`FournisseurAuthTestIhm`, §6.5) ; la redirection réelle reste couverte par les tests de `FournisseurAuthWeb`, l'e2e de démarrage et la recette. a) ★ Accepté ; b) exiger une redirection simulée (fragment `#access_token=…` servi par la page de test), + 0,5 j sur B2. |

### 16.2 Hypothèses
- H-18-1 : vite-plugin-pwa 2.0.0, en mode `prompt` avec `generateSW`, ajoute au service worker l'écoute de `{ type: 'SKIP_WAITING' }` (comportement documenté du mode `prompt`). D2 le vérifie dans `dist/sw.js` ; sinon, `workbox.additionalManifestEntries` n'y suffisant pas, D2 me le signale (passage à `injectManifest` = question à Starck).
- H-18-2 : `context.setOffline(true)` ne coupe pas les bindings Playwright (ST-US-031 §6.5) : d'où le contrôle de `navigator.onLine` dans `TransportParPont` et `FournisseurAuthTestIhm`.

### 16.3 Dettes avant l'E13b (registre v0.38)
- **DT-038 entre au rang 12** (tranche D1) : le rang 12 touche le banc des ouvertures et la même lacune apparaît dans S17b et S21b ; condition : réponse a) à Q-ST018-PEP-1.
- DT-025 : **hors rang 12** (aucun fichier du cycle touché) ; à inscrire dans la tranche du rang 13 qui intègre `exclusionParVerrou` au cycle (Bruce).
- DT-027 : **hors rang 12** ; tranche autonome de Bruce (opus, 0,5 j : règle de fusion du domaine), entre les rangs 12 et 13, une fois le rang 12 fusionné.
- DT-037 : **hors rang 12** ; attend Q-ANT-E13-R11-3 (Starck).
- Aucune dette nouvelle. Numérotation à la fusion (OPT-20) : aucun numéro DT ni DEC n'est pris par cette E10 ; les réponses aux questions qui deviendraient des décisions du commanditaire sont numérotées par Jarvis à la fusion.

## 17. Checklist
- [x] Fichiers, signatures, règles, steps, rangs (v0.4).
- [x] Tests du §13 écrits, rouges au rang 12, sans effet au rang 11.
- [x] Passage à blanc `RANG_COURANT=12` : `default` (S17b, S21b indéfinis, 4 étapes) et `ihm` (10 exécutions indéfinies).
- [ ] Q-ST018-PEP-1, Q-ST018-STE-2, Q-ST018-STA-2 répondues avant les tranches concernées.
