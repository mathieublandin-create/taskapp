# ST-US-018 — Utiliser l'application sans réseau sur mon smartphone

## 0. En-tête

| Élément | Valeur |
|---|---|
| US | [US-018](../01-specification-fonctionnelle/user-stories/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.md), statut « Prête » (DEC-018 ; révision DEC-034 validée par DEC-036) |
| Lot | [LOT-001](../lots/LOT-001.md) — rang de réalisation : **12** / 13 |
| Fichier `.feature` | [`tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature`](../../tests/features/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.feature), 30 scénarios (S09b `@recette` ; S18, S19 `@ihm`) |
| RG couvertes | RG-017, RG-019, RG-021, RG-035, RG-036, RG-047 à RG-049, RG-057 |
| ENF | ENF-04, ENF-06, ENF-07 ; ENF-T-01, ENF-T-02, ENF-T-07 |
| DAT / ADR | DAT v0.11.2 §4.1.5 bis, §4.1.6, §4.1.7, §3.3 ; ADR-013 (PWA installée, durabilité stricte, persistance) |
| Résultats du test technique | M-PERSIST favorable (`persist()` accordé sans question à la PWA installée) ; M-DUR favorable (marqueur strict relu après arrêt forcé et redémarrage) ; hors ligne (étape 10) favorable |
| Prérequis | Socle (rang 0 : écriture, durabilité stricte UT-SOC-44 à 46) ; ST-US-022 (rang 1 : ouverture hors ligne, bandeaux) ; ST-US-017 incrément 1 (rang 3 : cycle, `MEN-ATTENTE`, décompte) |
| Questions | Q-ST018-STE-1 et Q-ST018-STA-1 **répondues** (2026-10-27) et intégrées ; aucune ouverte |
| Version | 0.3 |
| Statut | Conception arrêtée ; E10 avant l'E12 du rang 12 (§13) |
| Auteur | Anthony |
| Branche | `us/US-018-hors-ligne-smartphone` |

### Historique
| Version | Date | Auteur | Modification |
|---|---|---|---|
| 0.1 | 2026-10-27 | Anthony | Création (E9, après M-RED, M-PERSIST, M-DUR). Le repli ADR-012 (SQLite, `@capacitor/network`, horloge native, APK) n'est pas réalisé. |
| 0.2 | 2026-10-27 | Anthony | Réponses de Steeve (Q-ST018-STE-1 : `SYN-FEUILLE-STOCKAGE`, `ALR-015`) et de Starck (Q-ST018-STA-1 a) : rattachement strict ; vérifications sur appareil réel en E14). Table `installation` de la base technique (ST-US-022 v0.2 §5.1). UT-US-018-04 précisé. |
| 0.3 | 2026-10-28 | Anthony | E11, RL-LOT-001-S7 : accessibilité de la ligne « Stockage » et de la carte `ALR-015` (§6, UT-US-018-04) ; RL-A2 et S5 de Steeve sans effet ici. |

## 1. Résumé technique

- **Constat.** Avec la PWA unique, l'essentiel du hors ligne du smartphone est déjà livré par les rangs précédents : base locale en durabilité stricte (rang 0), ouverture sans réseau et sans jeton (rang 1), modifications en attente, `MEN-ATTENTE`, décompte, reprise au retour du réseau (rang 3), sélection des bandeaux dont RG-057 (rang 1). La plupart des scénarios d'US-018 sont donc **exécutés avant le rang 12** (§12.2), selon la règle de rattachement.
- **Ce que livre le rang 12** :
  1. le **service worker** (vite-plugin-pwa, Workbox) : précache de toute l'application, `navigateFallback` (sert aussi le retour de redirection OAuth, hors ligne compris), exclusion des pages publiques, invite « nouvelle version » sans rechargement forcé ;
  2. la **persistance du stockage** : `navigator.storage.persist()` au premier lancement, état exposé dans la feuille, avertissement s'il est refusé (R15) ;
  3. l'**évaluation continue de RG-057** : à l'ouverture, au retour au premier plan et chaque minute ; **masquage** du bandeau `BAN-RAPPEL-24H` jusqu'à la prochaine ouverture (DEC-025, DEC-026) ;
  4. la **chaîne `@ihm`** : `composition/test-ihm.ts`, profil cucumber `ihm`, Playwright (Chromium, profil mobile 390 × 844), `tests/steps-ihm/` ;
  5. le **déploiement** : `.github/workflows/deploiement.yml`, environnements `recette` et `production` (conventions §14.3).
- **Hors périmètre** : verrou entre onglets (ST-US-031) ; tout élément du repli ADR-012.

## 2. Traçabilité
| CA | Scénarios | Rang d'exécution | Composants |
|---|---|---|---|
| CA-1 ouverture sans réseau | S01 | 5 | `OuvrirApplication` (rang 1) ; S19 (`@ihm`, 12) pour l'application jamais chargée |
| CA-2 opérations | S02, S03, S04 | 8, 8, 7 | Cas d'usage métier |
| CA-3 indication hors ligne et décompte | S05, S05b, S05c | 5 | Indicateur, `MEN-ATTENTE`, index (socle) |
| CA-4 retour du réseau | S06, S06b, S06c | 5, 7, 5 | Cycle (rang 3), `ReprendreSession` (rang 1) |
| CA-5 aucune perte | S09, S09b | 5 ; recette | Durabilité stricte (rang 0) ; S09b à la main (E14) |
| CA-6 pas de durée maximale | S10 | 5 | — |
| CA-7 conflits | S07, S08 | 9 | Incrément 2 |
| CA-8 accès perdu | S11 | 5 | Bandeau (rang 1), cycle |
| CA-9 RG-057 | S15, S15b, S15c, S16, S16b, S17, S17c, S17d ; S17b | 5 ; 12 | `construireBandeau` (rang 1) ; `MasquerRappel24h` (rang 12) |
| Cas limites | S12 (5), S13 (6), S14 (5), S18 et S19 (`@ihm`, 12) | — | — |

## 3. Composants et fichiers
| # | Fichier | Couche | Action | Responsabilité |
|---|---|---|---|---|
| 1 | `vite.config.ts` | Composition | Modifier | vite-plugin-pwa : `registerType: 'prompt'`, `workbox.globPatterns` (tout `dist/`), `navigateFallback: <base>index.html`, `navigateFallbackDenylist` : pages publiques (`accueil.html`, `confidentialite.html`, PoC §16) ; manifeste : `name` « Done Juan » (« Done Juan (recette) » si `VITE_ENV = recette`), `start_url` et `scope` = `VITE_BASE_PATH`, `display: standalone` |
| 2 | `src/commun/application/ports/persistance-stockage.ts` | Application | Créer | Port `PersistanceStockage` |
| 3 | `src/commun/infrastructure/persistance-navigateur.ts` | Infrastructure | Créer | `navigator.storage.persisted()` et `persist()` |
| 4 | `src/synchronisation/application/cas-usage/demander-persistance.ts` | Application | Créer | `DemanderPersistance` (premier lancement : drapeau `persistanceDemandee` de la base technique) |
| 5 | `src/synchronisation/application/cas-usage/masquer-rappel.ts` | Application | Créer | `MasquerRappel24h` → `MasquageRappel.masquer()` (rang 1) |
| 6 | `src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation.ts` | Modèle de vue | Modifier | Ligne `SYN-FEUILLE-STOCKAGE`, toujours présente, `data-etat` `PROTEGE` ou `NON-PROTEGE` ; carte `ALR-015` (Attention) quand non protégé (guide v0.2.12 §6.6.2, §6.6.9) |
| 7 | `src/presentation/ui/mise-a-jour/…`, `src/main.tsx` | UI, composition | Créer | Enregistrement du service worker **après** `consommerRetourRedirection` (RED-02) ; invite « nouvelle version » |
| 8 | `src/composition/web.ts` | Composition | Modifier | Évaluation RG-057 : `planificateur.periodiquement(PERIODE_EVALUATION_RAPPEL_HORS_LIGNE)` et `visibilitychange` → nouveau calcul des modèles de vue de l'indicateur et du bandeau ; `DemanderPersistance` au premier lancement |
| 9 | `src/composition/test-ihm.ts`, `tests/steps-ihm/**`, `cucumber.mjs` (profil `ihm`), `playwright.config.ts` | Test | Créer | Chaîne `@ihm` (conventions §11.8) |
| 10 | `.github/workflows/deploiement.yml`, `.github/actions/deployer-hebergement/action.yml` | Outillage | Créer | Conventions §14.3 |
| 11 | `tests/e2e/demarrage.spec.ts` | Test | Créer | Au premier rendu, `location.hash` est vide (RED-02) ; démarrage hors ligne ; axe |
| 12 | `src/composition/test-ihm/transport-par-pont.ts`, `tests/steps-ihm/support/pont-faux-drive.ts` | Composition de test, test | Créer | `FauxDrive` unique tenu par le processus cucumber, partagé par les pages du contexte persistant Playwright (spécifié dans ST-US-031 §6.5 ; nécessaire dès le rang 12 pour US-031 S08 et S15) |

## 4. Interfaces et signatures
```ts
// src/commun/application/ports/persistance-stockage.ts — ADR-013, R15, conventions §9.3
export type EtatPersistance = 'PERSISTANT' | 'NON_PERSISTANT' | 'INDISPONIBLE';
export interface PersistanceStockage {
  etat(): Promise<EtatPersistance>;      // persisted()
  demander(): Promise<EtatPersistance>;  // persist() ; INDISPONIBLE si l'API manque
}
// src/synchronisation/application/cas-usage/demander-persistance.ts
export class DemanderPersistance {
  constructor(d: { readonly persistance: PersistanceStockage; readonly memoire: { dejaDemandee(): Promise<boolean>; noterDemandee(): Promise<void> } });
  /** Au premier lancement seulement : demande, puis note la demande ; ensuite : lit l'état. */
  executer(): Promise<EtatPersistance>;
}
// src/synchronisation/application/cas-usage/masquer-rappel.ts — DEC-025, DEC-026
export class MasquerRappel24h { constructor(masquage: MasquageRappel); executer(): void }
```
`MasquageRappel` (rang 1) est une instance de la composition : une nouvelle instance de l'application (lancement ou rechargement) la remet à faux ; un retour au premier plan ne la touche pas.

## 5. Modèle de données
Base technique (ST-US-022 v0.2 §5.1) : clé `persistanceDemandee` (booléen) dans la table `installation`. Aucun impact sur le format Drive ni sur l'espace du compte.

## 6. Règles et algorithmes
- **Service worker** : stratégie précache seule pour l'application ; aucune mise en cache d'une requête Google ; les navigations servent `index.html` du précache (le fragment n'atteint jamais le réseau ni le cache, RED-05). Une nouvelle version attend l'accord (« Mettre à jour ») ; elle n'interrompt jamais une saisie.
- **RG-057** : la décision reste `construireBandeau` (ST-US-022 §6.9), seule fonction ; le rang 12 n'ajoute que les déclencheurs de recalcul et le masquage.
- **Persistance** : `PERSISTANT` → `SYN-FEUILLE-STOCKAGE` `PROTEGE` ; `NON_PERSISTANT` ou `INDISPONIBLE` → `SYN-FEUILLE-STOCKAGE` `NON-PROTEGE` et carte `ALR-015`, **dans la feuille seulement** : aucun bandeau, aucun point sur l'indicateur, jamais de blocage ; la carte n'est pas fermable et disparaît quand le stockage devient protégé. **Accessibilité (RL-LOT-001-S7)** : la ligne « Stockage » est du texte simple (aucun contrôle), avec `data-etat` `PROTEGE` ou `NON-PROTEGE` ; la carte `ALR-015` est en `role="status"` (non urgent, jamais bloquant ; pas `alert`), non fermable.

## 7. Intégration Google
Sans objet (aucune nouvelle requête).

## 8. Gestion des erreurs
| Situation | Comportement | Code |
|---|---|---|
| `persist()` refusé ou API absente | Ligne « non protégé » et carte dans la feuille | `SYN-FEUILLE-STOCKAGE`, `ALR-015` |
| Première ouverture sans réseau, application jamais chargée | Page d'erreur du navigateur (aucun écran de l'application) | — (S19) |
| Données du navigateur effacées | Modifications non déposées perdues ; rechargement depuis le Drive à la connexion | — (S18) |

## 9. Patterns imposés
Service worker généré (Workbox), pas de code de service worker écrit à la main ; port `PersistanceStockage` (aucun appel direct à `navigator.storage` hors de l'adaptateur).

## 10. Sécurité
RED-02 : le service worker est enregistré après la consommation du retour de redirection ; RED-05 : jamais de jeton ni de fragment en cache. CSP inchangée.

## 11. Exigences non fonctionnelles
| ENF | Vérification |
|---|---|
| ENF-T-01 : ouverture hors ligne < 2 s | `tests/e2e/demarrage.spec.ts` (indicatif en CI) ; recette E14 sur le téléphone |
| ENF-06 : aucune perte | S09 (cas d'usage) ; S09b (recette, arrêt forcé et redémarrage réels, protocole M-DUR) |

## 12. Step definitions

### 12.1 Phrases
| # | Phrase | Fichier | Rang | Implémentation |
|---|---|---|---|---|
| 1 | `le bandeau "BAN-RAPPEL-24H" est affiché avec {int} modification(s) en attente` ; `… est non bloquant` ; `… n'est pas affiché` ; `que sur le {appareil}, le bandeau "BAN-RAPPEL-24H" est affiché avec {int} modification(s) en attente` | `synchronisation/etat-affiche.steps.ts` | 5 (capacité du rang 1) | `construireBandeau(consulterEtatSynchronisation(), horloge.maintenant())` ; « non bloquant » : `bloquant` faux et aucune action de saisie désactivée |
| 2 | `le bandeau "BAN-ACCES-GOOGLE" variante 24H mentionne {int} modification(s) en attente` ; `… variante 24H n'est pas affiché` ; `un seul bandeau est affiché` ; `aucun bandeau n'est affiché` | idem | 5 | idem |
| 3 | `sur le {appareil}, l'utilisateur ferme le bandeau "BAN-RAPPEL-24H"` | idem | 12 | `MasquerRappel24h` |
| 4 | `nous sommes le {date} à {heure} heure de {fuseau}` (en `Quand`) | `commun/temps.steps.ts` | 0 | Positionne le temps ; exécute les échéances du `PlanificateurSimule` |
| 5 | `le smartphone est éteint puis rallumé` ; `l'application est arrêtée brutalement sur le smartphone` ; `l'utilisateur ferme l'application sur le smartphone` | `commun/appareils.steps.ts` | 1 | Abandon de l'instance ; « éteint puis rallumé » : en plus, `HorlogeSimulee.redemarrer()` |
| 6 | `le réseau est coupé sur le smartphone pendant la saisie` ; `l'utilisateur termine la saisie` | `commun/reseau.steps.ts`, `objectifs-taches/taches.steps.ts` | 6 | Coupure du `ReseauSimule` entre `saisit…` et `termine la saisie` (formulaire de sous-tâche, ST-US-024) |
| 7 | `sur le PC, après échange, il existe {int} objectif(s) d'intitulé {string}` | `synchronisation/echanges.steps.ts` | 5 | `synchroniserJusquAuRepos` puis requête des objectifs du PC |
| 8 | `que la session Google du smartphone est active` ; `la session Google du smartphone expire` | `compte/connexion.steps.ts` | 1 | ST-US-022 §12.1 n° 34 |
| 9 | `que l'application n'a jamais été ouverte dans le navigateur du smartphone` ; `l'utilisateur ouvre l'application sur le smartphone depuis son adresse web` ; `l'utilisateur efface les données de son navigateur sur le smartphone` ; `aucun écran de Done Juan n'est affiché` ; `le navigateur du smartphone affiche son propre message de page inaccessible` | `tests/steps-ihm/navigateur.steps.ts` | 12 | Playwright : contexte neuf ; `context.setOffline(true)` ; `context.clearCookies()` et effacement du stockage de l'origine (`indexedDB.databases()` puis `deleteDatabase`, `caches.keys()`, désinscription du service worker) ; absence de tout élément `[data-etat]` ; page `chrome-error://` |

Autres étapes : réutilisées (ST-US-001 à ST-US-025, ST-US-022, ST-US-017).

### 12.2 Rangs d'exécution (règle de rattachement, conventions §11.13)
- Rang 5 : S01, S05, S05b, S05c, S06, S06c, S09, S10, S11, S12, S14, S15, S15b, S15c, S16, S16b, S17, S17c, S17d.
- Rang 6 : S13. Rang 7 : S04, S06b. Rang 8 : S02, S03. Rang 9 : S07, S08.
- Rang 12 : S17b, S18 (`@ihm`), S19 (`@ihm`).
- Recette (E14) : S09b.
Total : 30.

## 13. Tests unitaires (E10, à livrer avant l'E12 du rang 12)
| Id | Élément | Cas |
|---|---|---|
| UT-US-018-01 | `DemanderPersistance` | premier lancement : `persist()` appelé une fois, demande notée ; lancements suivants : `persisted()` seulement |
| UT-US-018-02 | idem | API absente → `INDISPONIBLE`, sans erreur |
| UT-US-018-03 | `MasquerRappel24h` et `consulterEtatSynchronisation` | masqué jusqu'à une nouvelle instance ; non remis à zéro par un retour au premier plan |
| UT-US-018-04 | `construireFeuilleSynchronisation` | `SYN-FEUILLE-STOCKAGE` toujours présente (`PROTEGE` / `NON-PROTEGE`) ; `ALR-015` seulement si non protégé, avec `role: 'status'` et `fermable: false` ; ligne sans action, `data-etat` observable (RL-S7) ; indicateur et bandeau inchangés |
| UT-US-018-05 | Configuration du service worker (`vite.config.ts`, fonction pure `optionsPwa(env)`) | `navigateFallback` sous `VITE_BASE_PATH`, exclusion des pages publiques, nom de recette distinct |
RG-057 est déjà couverte par UT-US-022-46 et 47.

## 14. Tests attendus de Benjamin
Playwright : démarrage hors ligne, `location.hash` vide au premier rendu, axe sans violation `serious` ou `critical` ; intégration de `PersistanceNavigateur` (navigateur réel, Playwright).

## 15. Plan de réalisation
1. Port et cas d'usage de persistance (UT 01, 02). 2. Masquage (UT 03). 3. Service worker et manifeste (UT 05), enregistrement après RED-02. 4. Feuille (UT 04). 5. Chaîne `@ihm`, steps S18, S19. 6. `deploiement.yml`.

## 16. Points ouverts
- **Q-ST018-STE-1 (Steeve)** : code et texte de l'état du stockage dans la feuille et de l'avertissement quand la persistance est refusée (R15, conventions §9.3, DAT §4.1.6). Le catalogue n'en a pas. Proposition : ligne `SYN-FEUILLE-STOCKAGE` « Stockage de cet appareil : protégé » / « non protégé » et carte `ALR-015` « Vos données ne sont pas protégées contre un nettoyage du navigateur. Installez l'application et gardez-la sur l'écran d'accueil. ».
- **Réponse de Steeve à Q-ST018-STE-1 (E9, 2026-10-27, guide v0.2.12 §6.6.2, §6.6.9)** : proposition retenue. Ligne `SYN-FEUILLE-STOCKAGE`, toujours présente, discrète : « Stockage de cet appareil : protégé » / « non protégé » (persistance refusée ou API indisponible = non protégé). Carte `ALR-015` (Attention) : « Vos données ne sont pas protégées contre un nettoyage du navigateur. Installez l'application et gardez-la sur l'écran d'accueil. », dans la feuille seulement, sans bandeau, sans point sur l'indicateur, jamais de blocage.
- **Q-ST018-STA-1 (Starck)** : la règle de rattachement place 25 des 30 scénarios d'US-018 aux rangs 5 à 9, puisque les capacités du hors ligne sont livrées par les rangs 0 à 3 (PWA unique). Le confirmez-vous, plutôt qu'une exécution groupée au rang 12 ? a) oui, rattachement strict ★ ; b) non, tout au rang 12.
  - **Réponse de Starck (2026-10-27) : a) validé.** Les vérifications sur appareil réel restent en recette E14.
- Hypothèses : aucune. Dette : aucune.

## 17. Checklist
- [x] Fichiers, signatures, règles, steps, rangs.
- [ ] Tests du §13 (E10 avant l'E12 du rang 12).
- [x] Q-ST018-STE-1 et Q-ST018-STA-1 répondues et intégrées (v0.2).
