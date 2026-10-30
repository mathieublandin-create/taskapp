# Suivi projet

## Demandes
| Demande | Date | Résumé | US associée(s) |
|---|---|---|---|
| [DEM-001](demandes/DEM-001.md) | 2026-10-20 | Besoin initial : objectifs déclinés en tâches, planification, suivi du temps et de la vélocité, rappels quotidiens via Google Calendar, usage smartphone et PC | Backlog v0.3 (US-001 à US-032) ; 8 US proposées dans LOT-001 ; questions résiduelles Q-DEM001-21 à 40 |
| [DEM-002](demandes/DEM-002.md) | 2026-10-20 | Rappel du soir : 2 questions de bilan (ce qui s'est bien passé, ce que j'aurais fait autrement) ; rappel du matin : fun fact scientifique tiré équitablement parmi 100 | US-033 à US-036 (lot « Rappels ») ; questions Q-DEM002-1 à 7 |

## Lots
| Lot | Objectif | Typologie (majeure / mineure) | US | Statut | Étape |
|---|---|---|---|---|---|
| [LOT-001](lots/LOT-001.md) | Socle et objectifs/tâches, smartphone + PC, compte Google, stockage personnel | Majeure | US-022, 017, 018, 031, 001, 023, 002, 024, 003, 025 | **En réalisation** (E11 close le 2026-10-28) | **E12 rang 0 (socle d'écriture)**, branche `us/SOCLE-ecriture` ; compte rendu E11 : `ceremonies/lancement-LOT-001.md` |

## État des user stories
| US | Titre | Lot | Statut | Étape (E0–E17) | Agent en cours | Remarques |
|---|---|---|---|---|---|---|
| US-022 | Se connecter avec mon compte Google | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) ; CA-5 et CA-7 précisés ; S23b ; révision DEC-034 validée le 2026-10-22 (DEC-036), retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST) ; E9 conditionnée à R11 et M-RED (ADR-013) |
| US-017 | Retrouver mes données sur smartphone et PC | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) ; CA-1, CA-3 et CA-12 reformulés ; S06b ; révision DEC-034 validée le 2026-10-22 (DEC-036), retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST) ; E9 conditionnée à R11 et M-RED (ADR-013) |
| US-001 | Créer et gérer un objectif | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |
| US-023 | Organiser un objectif en sous-objectifs | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |
| US-002 | Créer et gérer mes tâches | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |
| US-024 | Décomposer une tâche en sous-tâches | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |
| US-003 | Terminer ou rouvrir une tâche, atteinte d'un objectif | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |
| US-018 | Utiliser l'application sans connexion (smartphone) | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) ; CA-4 et CA-8 reformulés, Q-DEC034-1 répondue (S06c) ; révision DEC-034 validée le 2026-10-22 (DEC-036), retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST) |
| US-031 | Utiliser l'application sans connexion sur PC | LOT-001 | Prête | E9 | anthony | Ajoutée par DEC-013 ; validée le 2026-10-21 (DEC-018) |
| US-025 | Abandonner une tâche | LOT-001 | Prête | E9 | anthony | Validée le 2026-10-21 (DEC-018) |

## Validations du commanditaire
| Date | Étape (E2 / E6 / E16) | Objet | Verdict | Remarques |
|---|---|---|---|---|
| 2026-10-21 | E6 | LOT-001 : 10 US et décisions V-01 à V-23 (`ceremonies/validation-E6-LOT-001.md`) | **Validé** | Verbatim « oui pour tous » : 10 US validées, toutes les recommandations ★ retenues (dont V-06 option 2, V-12 oui, V-13 « Done Juan »), reformulation validée avec la correction « smartphone et PC » proposée par Jarvis, 3 exclusions validées. Confirmé par « reco pour tous ». |
| 2026-10-21 | E4 | Réponses Q-ERG-12 à 15 | Reçues | Verbatim : « Q-ERG-12 : oui, Q-ERG-13 : toujours, Q-ERG-14 : oui, Q-ERG-15 : propose-moi 3 noms drôles avec des jeux de mots ». LOT-001 s'ouvre sur « Tâches » (2 onglets) ; abandon toujours confirmé ; modifications non retenues listées jusqu'à « Compris » ; nom de l'application : propositions soumises. |
| 2026-10-21 | E1 | Réponses P1 Q-DEM001-39, 41, 42 | Reçues | Verbatim : « Q39-b; Q41-oui; Q42-1-non, proposer seulement l'option déconnexion et une autre option supprimer les données;Q42-2:a) » → DEC-013 à DEC-016 |
| 2026-10-20 | E1 | ENF-05 et ENF-06 | Validées | Verbatim « ok pour enf-05 et enf-06 ». Restent à valider : reformulation du besoin et exclusions proposées — à représenter en E6 avec les US de LOT-001 (demande du commanditaire). |
| 2026-10-20 | Hors étape (socle UX) | Q-ERG-11 précisée | Reçue | « a) » : en cas de refus de la replanification, le créneau est supprimé de Google Calendar et la tâche est déplanifiée. Transmis à Pepper. |
| 2026-10-20 | Hors étape (socle UX) | Réponses Q-ERG-02 à 11 (guide d'ergonomie §12.1) | Reçues | Verbatim : « Q-ERG-02 : oui, Q-ERG-03 : non, Q-ERG-04 : oui, Q-ERG-05 : oui, Q-ERG-06 : par priorité, Q-ERG-07 à 11 : réafficher tous les jours l'alerte non traitée, la planification après délais est possible mais génère une alerte, la ré-estimation de la capacité est à faire chaque semaine, le dimanche, validation du planning tâhe par tâche, il est libéré ». Transmis à Pepper (règles métier) ; à transmettre à Steeve en E4. |
| 2026-10-20 | E1 | Réponses Q-DEM001-1 à 20 | Reçues | Consignées dans questions-ouvertes.md |
| 2026-10-20 | E2 | LOT-001 : composition complète + US-018, typologie majeure ; arbitrages A1–A7 | Validé | Verbatim « D1, A1: Android, reco » ; en attente : fuseau de référence (ADR-011/RG-008), reformulation, exclusions, ENF-05/06 |
| 2026-10-20 | E1 | Réponses P1 Q-DEM001-21 à 29 | Reçues | Recommandations retenues sauf 22.3 (données conservées sur l'appareil) |

## Journal des échanges (règle anti-boucle : 2 itérations maximum)
| Sujet | US | Entre | Itération | État | Remarques |
|---|---|---|---|---|---|
| Test technique v3 (volet web) | US-022, 017, 018, 031 | Commanditaire → Starck | 1/2 | **R11, M-RED, M-PERSIST et M-DUR favorables (2026-10-27)** ; condition de DEC-034 remplie ; étape 16 (login_hint) à refaire | `03-architecture/resultats-test-technique.md` ; E9 d'US-022, 017, 018 et 031 lancée |
| E9 LOT-001 (US métier) : Q-US-001-6 (ordre des listes), Q-US-025-3 (reprise d'une sous-tâche abandonnée sous une tâche terminée), ANT-25 (identifiant du journal) | US-001, 023, 002, 024, 025 ; socle | Anthony → Steeve, Pepper, Starck | 1/2 | En cours (2026-10-22) | Conventions v0.3, `ST-socle-ecriture.md` et ST des six US métier livrées ; seuls 5 tests unitaires attendent les réponses ; ST-US-022, 017, 018, 031 attendent le test technique R1/R2/R11 |
| E8 explicitation LOT-001 : 40 Q-US (11 bloquantes) | Les 10 US Non explicites | Anthony → Pepper, Starck, Steeve | 1/2 | **Clos (2026-10-21) : 10 US Explicites**, 40/40 levées, sans arbitrage | `ceremonies/explicitation-LOT-001.md` ; Q-US-017-3 (règle nouvelle) et peut-être Q-US-017-4, 017-6, 001-1, 025-2 à soumettre au commanditaire |
| Refinement LOT-001 (RF-LOT-001-*) | US-022, 017, 018, 031 Non Ready ; 6 US Ready après nettoyage | Tous | Tour 2/2 | **Clos : lot Ready** (2026-10-21), sans arbitrage | `ceremonies/refinement-LOT-001.md` ; questions Q-ERG-16, 17, 18 et Q-LOT-1 au commanditaire |

## Décisions (arbitrages du commanditaire — définitives)
| Décision | Date | Sujet | Décision |
|---|---|---|---|
| DEC-031 | 2026-10-22 | Démarrage d'E9 | Verbatim « Les deux en parallèle » : préparation du test technique R1/R2/R11 et, en parallèle, E9 des US métier (US-001, 023, 002, 024, 003, 025), les parties dépendant du format Drive étant marquées « sous réserve R1 » |
| DEC-032 | 2026-10-22 | Q-US-025-3, H-1, H-2 | Verbatim « Reco » : Q-US-025-3 a) (reprise avec confirmation, la tâche parente terminée est rouverte, complète RG-027) ; H-1 A (version PC hébergée sur GitHub Pages, le commanditaire rend lui-même le dépôt public) ; H-2 oui (deux clés de signature de test enregistrées dans les secrets GitHub, puis premier passage du workflow `poc`). Création des clés, pose des secrets et lancement du workflow : par le commanditaire, ces actions n'étant pas permises depuis la session |
| DEC-033 | 2026-10-22 | Workflow : backlog d'idées | Verbatim « Je valide e1. » : ajout de l'étape E-1 (backlog d'idées `docs/backlog-idees.md`, statuts Reçue → Qualifiée → Mûre → ★ Priorisée → Transformée en DEM, 6 critères de maturité, priorisation à chaque E17 ou sur demande). EPI-001 et EPI-002 y sont inscrites |
| DEC-034 | 2026-10-22 | PWA unique (ETU-002) | Verbatim « Pour la question PWA, prendre les recos de Stark ». Q-PWA-1 : la PWA remplace l'APK Android sur tous les appareils, **sous condition** : sur Chrome Android, la PWA installée obtient un jeton à l'ouverture sans saisie, en un aller-retour de redirection au plus, et le stockage persistant est accordé ; sinon, on garde l'APK pour Android. Q-PWA-2 : un bref passage par Google, ou un appui, après plus d'une heure est accepté aussi sur le téléphone. Q-PWA-3 : renonciation aux notifications de secours (Q-38 b) et à la synchronisation en arrière-plan. Q-PWA-4 : test technique réduit au volet web. Q-PWA-5 : création des clés de signature (DEC-032, H-2) différée, la procédure des clés est suspendue. Conséquences : ADR remplaçant ADR-012, révision de RG-017, ENF-01, ENF-04, ENF-07, US-018 CA-4, Q-38 b et DEC-021 (soumise à la validation du commanditaire) |
| DEC-035 | 2026-10-22 | EPI-001, M1-8 à M1-14 | M1-8 : vue synthétique, en lecture seule, des tâches des autres contributeurs de l'objectif ; M1-9 à M1-14 : recommandations de Starck (M1-14 « ok, à faire »). EPI-001 est Mûre |
| DEC-036 | 2026-10-22 | Validation des règles révisées par DEC-034 | Verbatim « Tout reco » : V-DEC034-1 à 7 acceptées (`ceremonies/validation-DEC-034.md`) : RG-017, ENF-01, ENF-04, ENF-07, RG-014, US-017 CA-1, CA-3 et CA-12, US-018 CA-4 et CA-8, US-022 CA-5 et CA-7, Q-DEM001-38 close par a), exclusions et conditions du hors ligne sur le téléphone. DEC-021 est remplacée. Ces textes sont retirés si la condition de DEC-034 (mesure M-RED et M-PERSIST) échoue |
| DEC-037 | 2026-10-27 | Q-ANT26 : hébergement de la recette | Verbatim « Q-ANT26 : oui, reco » : la recette est publiée sur une origine distincte, celle d'une organisation GitHub gratuite créée par le commanditaire (par exemple `donejuan-recette`), conformément au DAT §7.4 bis. Le sous-chemin `/taskapp/recette/` est exclu. Organisation `donejuan-recette` créée par le commanditaire le 2026-10-27 ; dépôt et mise en ligne à préparer avant la première recette (E14 et E16 de LOT-001) |
| DEC-038 | 2026-10-27 | Q-RL-P1 (E11, remarque P1 de Pepper) | Verbatim « Réponse a) » : l'écran « Connexion à Google… » (SYN-REDIRECTION) s'affiche environ une seconde à chaque ouverture de l'application avec réseau, en échange de ne conserver aucun jeton d'accès Google sur l'appareil (ADR-013 inchangé). Précision validée dans la même réponse : RG-017, glossaire « Accès Google à renouveler » et US-017 CA-3 indiquent que le passage par Google a lieu à chaque ouverture avec réseau, que les données s'affichent juste après sans saisie, et qu'hors ligne elles s'affichent aussitôt |
| DEC-039 | 2026-10-28 | Q-RL-P6 (E11, remarque P6 de Pepper) | Verbatim « Q-RL-P6 : a) » : l'exception à « jamais plus d'un geste » (RG-017) est acceptée dans un seul cas : la fenêtre Google tombe en panne pendant une saisie. L'application affiche alors `TST-SAISIE-A-TERMINER`, et un second geste est nécessaire une fois la saisie terminée. Rien n'est perdu. L'exception vaut sur le PC et sur le smartphone (US-022, US-031, US-018) |
| DEC-040 | 2026-10-28 | Tokens et organisation du développement (`docs/analyse-tokens.md`) | Verbatim « Reco pour tous » : Q-TOK-1, optimisations OPT-1 à OPT-8 adoptées (session à lancer par `claude --agent jarvis`) ; Q-TOK-2, création de **Bruce** (développeur cœur de données et synchronisation, opus ; LOT-001 rangs 0, 1, 3, 9 à 11) et de **Friday** (outillage et CI, haiku), Benjamin (sonnet) recentré sur le fonctionnel et l'interface (rangs 2, 4 à 8, 12, 13) ; noms proposés par Jarvis ; Q-TOK-3, Benjamin termine le rang 0 en cours, Bruce prend la main au rang 1. **Complément du 2026-10-30**, verbatim « Oui, inscris les points 3 et 4 dans DEC-040 » : OPT-9 (E13 sur petit diff de dette ou d'outillage confiée à un agent sonnet ; opus réservé aux revues des rangs et au travail de Bruce) et OPT-10 (briefs des agents opus limités aux sections utiles, jamais de fichier entier hors E9 et E11) |
| DEC-041 | 2026-10-29 | CSP et styles d'Ionic (Q-ANT-E13-R2-1, DT-008, ADR-014) | Verbatim « Oui, reco Starck » : `style-src 'self' 'unsafe-inline'`, `script-src` inchangé ; nonce et hachages écartés. Mise en œuvre (M1 CSP, M2 `z.config({ jitless: true })`, M3 test de fumée Playwright des violations CSP) avant l'E14 du rang 2 ; styles du script GIS à vérifier en E14 (PO-13) |
| DEC-030 | 2026-10-21 | E8 LOT-001 : 4 questions au commanditaire | Verbatim « Reco ». A8/Q-US-017-4 : limite de CA-13 acceptée (heure changée hors ligne, application fermée ou appareil redémarré : la valeur non retenue est signalée jusqu'au retour du réseau) ; Q-US-017-3 a) : « Repartir de zéro » l'emporte toujours sur « Restaurer » (complète RG-044) ; Q-US-001-1 a) : rattachement et placement non retenus après suppression concurrente d'un objectif signalés dans « Modifications non retenues » (complète RG-047) ; Q-US-025-2 a) : une sous-tâche terminée sous une tâche parente abandonnée ne se rouvre pas directement, il faut reprendre la tâche parente d'abord. Ces points valent validation E6 des compléments correspondants. |
| DEC-026 | 2026-10-21 | RG-057 « prochaine ouverture » (Q-ERG-18) | Lancement de l'application ou rechargement de la PWA ; pas un simple retour au premier plan (verbatim « Reco ») |
| DEC-027 | 2026-10-21 | QC-8 Clé de signature Android | Conservée dans les secrets chiffrés GitHub, avec une sauvegarde hors ligne chez le commanditaire (verbatim « Reco ») |
| DEC-028 | 2026-10-21 | QC-9 Vérification des développeurs Android (2027) | Compte gratuit « distribution limitée » lié au compte Google du commanditaire (verbatim « Reco ») |
| DEC-029 | 2026-10-21 | Protection de la branche principale | Accord de principe : protection de `main` (contrôles de CI obligatoires) à activer dès que la CI existe (socle E9/E12) ; aucune action avant (verbatim « Reco ») |
| DEC-025 | 2026-10-21 | Refinement LOT-001 : Q-ERG-16 à 18, Q-LOT-1, Q-REF-1, Q-REF-2 | Verbatim « Reco ». Q-ERG-16 b) : les 24 h du bandeau RG-057 courent depuis la plus ancienne modification en attente ; Q-ERG-17 a) : un seul bandeau « Se reconnecter », complété de « n modifications ne sont encore que sur cet appareil » ; Q-ERG-18 : le bandeau fermé réapparaît à la prochaine ouverture tant que des modifications sont en attente ; Q-LOT-1 b) : US-017 conservée, livrée en 4 incréments avec une revue de code chacun ; Q-REF-1 a) : RG-048 annule les déplacements un par un, du plus ancien au plus récent, jusqu'à une hiérarchie valide, chaque annulation étant signalée ; Q-REF-2 : en consultation seule, aucune écriture dans le Drive, et les modifications en attente sont déposées après la mise à jour. |
| DEC-019 | 2026-10-21 | QC-1 Motivation de l'étude sans cloud | c) coût et indépendance vis-à-vis des services en ligne (« Qc-2 : C) » lu comme QC-1, la réponse QC-2 étant donnée ensuite) — Verbatim : « Qc-2 : C), qc-2 : oui, qc-3 : installation moi même, qc-5 : calendrier, qc-7 : oui. On étudiera dans un second temps une installation sur un radpbrry pi( que j'ai déjà) » |
| DEC-020 | 2026-10-21 | QC-2 Données dans Google Drive | Oui : option A maintenue (données dans le Google Drive du commanditaire) |
| DEC-021 | 2026-10-21 | QC-3 Distribution Android (remplace DEC-005) | Installation directe de l'APK par le commanditaire, sans Google Play |
| DEC-022 | 2026-10-21 | QC-5 Rappels | Via Google Calendar (confirmé) |
| DEC-023 | 2026-10-21 | QC-7 Code public | Le code peut être public (hébergement gratuit GitHub Pages possible) ; passage du dépôt en public à faire par le commanditaire |
| DEC-024 | 2026-10-21 | Auto-hébergement | Étude d'une installation sur le Raspberry Pi du commanditaire reportée à un second temps (ETU-001) |
| DEC-018 | 2026-10-21 | Validation E6 de LOT-001 | Les 10 US sont validées ; les règles proposées RG-044 b, RG-047 à 050, RG-054, les garde-fous de RG-055 et RG-056 a à c sont établies ; l'extension de RG-044 aux fichiers Drive modifiés à la main est retenue ; blocage seulement si le format des données diffère ; bandeau au-delà de 24 h hors ligne ; dossier Drive « Done Juan » ; les critères (P) sont retenus ; la reformulation est validée (hors ligne smartphone et PC) ; les exclusions sont validées. |
| DEC-017 | 2026-10-21 | Q-ERG-15 Nom de l'application | « Done Juan » (verbatim : « option 2 ») |
| DEC-013 | 2026-10-21 | Q-DEM001-39 Hors ligne sur PC | b) Le PC est utilisable hors ligne dès LOT-001 : US-031 intégrée au lot |
| DEC-014 | 2026-10-21 | Q-DEM001-41 Délai d'une heure | Oui : le délai porte uniquement sur les données entre appareils ; la détection d'un créneau déplacé n'y est pas soumise |
| DEC-015 | 2026-10-21 | Q-DEM001-42.1 Effacement des données | Non à l'action combinée : deux actions distinctes, « Se déconnecter » (données conservées) et « Supprimer les données de cet appareil » |
| DEC-016 | 2026-10-21 | Q-DEM001-42.2 Autre compte sur l'appareil | a) Les données du premier compte sont conservées à part, invisibles pour l'autre compte |
| DEC-012 | 2026-10-20 | Fuseau de référence (remplace DEC-011) | Fuseau fixe Europe/Paris (France métropolitaine) pour la journée, les rappels et les créneaux, quel que soit l'appareil ; instants toujours enregistrés en UTC. Verbatim : « je change d'avis, reste sur un agenda qui est aligné sur le fuseau horaire Français métropolitain ». Rend sans objet A-F1, A-F2, A-F4 ; restent P-T1, A-F3, A-F5. |
| DEC-011 | 2026-10-20 | Fuseau de référence de la journée (ADR-011 / RG-008) | **Remplacée par DEC-012.** Fuseau de l'appareil (RG-008 maintenue, proposition ADR-011 rejetée) ; horodatages enregistrés en UTC. Verbatim : « le fuseau horaire est celui de l'appareil, on enregistre en base les éléments en utc » |
| DEC-001 | 2026-10-20 | A1 Système du smartphone | Android (pas d'iPhone en v1) |
| DEC-002 | 2026-10-20 | D1 Hors ligne | US-018 (hors ligne smartphone) intégrée au LOT-001 |
| DEC-003 | 2026-10-20 | D2 Composition LOT-001 | Composition complète (8 US + US-018) |
| DEC-004 | 2026-10-20 | D3 Typologie LOT-001 | Itération majeure (recette commanditaire E16) |
| DEC-005 | 2026-10-20 | A2 Distribution Android | **Remplacée par DEC-021.** Google Play, piste de test interne |
| DEC-006 | 2026-10-20 | A3 Hébergement PC | Hébergement statique gratuit, sans domaine en v1 |
| DEC-007 | 2026-10-20 | A4 Serveur | Aucun serveur applicatif |
| DEC-008 | 2026-10-20 | A5 Vérification Google | Publication en production sans vérification (écran « application non vérifiée » accepté) |
| DEC-009 | 2026-10-20 | A6 Emplacement Drive | Dossier visible |
| DEC-010 | 2026-10-20 | A7 Chiffrement Drive | Pas de chiffrement supplémentaire en v1 |

## Points bloquants
- Steeve (avant E12) : aligner ECR-011, et ECR-008 si nécessaire, sur les variantes `rattachement` et `placement` d'`ALR-010` (guide v0.2.8).
- Starck : aligner DAT §4.1.5 bis (élément créé puis supprimé hors ligne : non compté comme modification en attente, guide §6.6.1 et US-018 S05c) ; ajouter 3 points au protocole du test technique (Q-US-031-1).
- Distribution par APK (DEC-021, ADR-012) : ajouter un `.gitignore` avant de créer la clé de signature (Anthony, socle E9) ; questions QC-8 (clé dans les secrets GitHub) et QC-9 (compte gratuit « distribution limitée » ou ADB) posées au commanditaire.
- ETU-001 (plus tard) : étude d'auto-hébergement sur le Raspberry Pi du commanditaire (option C de `03-architecture/etude-sans-cloud-ou-gratuit.md`).
- DEC-023 : le dépôt GitHub est actuellement privé ; le passage en public est une action du commanditaire (paramètres du dépôt).
- Nom « Done Juan » (DEC-017) à répercuter : maquettes et guides (Steeve), cahier des charges et US (Pepper), DAT (Starck), README. Dossier Drive « Done Juan » (DEC-018, V-13).
- Pour Starck (refinement) : état lu / non lu de la liste « Modifications non retenues » (synchronisé ou local).
- Test technique R1/R2 (`03-architecture/test-technique-R1-R2.md`) : nécessite des actions du commanditaire (projet Google Cloud, compte de test, téléphone Android, compte d'hébergement, 2 séances d'environ 1 h 30). Bloquant avant E9 de LOT-001.
- Proposition de Starck à valider en E6 : étendre RG-044 aux fichiers Drive modifiés à la main (traités comme illisibles).
- Socle UX v0.1 rendu (Steeve) : questions ergonomiques Q-ERG-02 à 11 (`02-ux/guide-ergonomie.md` §12.1), non bloquantes pour LOT-001 ; demandes à Starck DAT-UX-09 et 13. E4 de LOT-001 et maquettes ECR-007, 008, 010, 011 à réaliser après validation E2.
- Points F1 à F14 de Starck : intégrés par Pepper (CdC v0.4). DAT à aligner sur RG-043 (données conservées à la déconnexion).
- Socle technique : DAT v0.1 rendu, DS-01 à DS-20 tranchées au §11 (statut « Proposé », à valider). Anthony attendait de Starck les décisions DS-01 à DS-20 (`04-specification-technique/conventions.md` §15). Celles qui bloquent la conception de LOT-001 : DS-01, 02, 03, 05, 07, 10, 11, 14, 15, 16 et 19.
- Points de testabilité PT-01 à PT-15 (`conventions.md` §14) : questions complémentaires pour Pepper et Starck, à traiter au refinement du lot concerné.
- LOT-001 : questions P1 Q-DEM001-39, 41, 42 transmises au commanditaire ; règles proposées RG-044 b), 047 à 050, 054 et critères (P) à valider en E6, avec la reformulation et les exclusions.
