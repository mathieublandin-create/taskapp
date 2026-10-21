# Suivi projet

## Demandes
| Demande | Date | Résumé | US associée(s) |
|---|---|---|---|
| [DEM-001](demandes/DEM-001.md) | 2026-10-20 | Besoin initial : objectifs déclinés en tâches, planification, suivi du temps et de la vélocité, rappels quotidiens via Google Calendar, usage smartphone et PC | Backlog v0.3 (US-001 à US-032) ; 8 US proposées dans LOT-001 ; questions résiduelles Q-DEM001-21 à 40 |
| [DEM-002](demandes/DEM-002.md) | 2026-10-20 | Rappel du soir : 2 questions de bilan (ce qui s'est bien passé, ce que j'aurais fait autrement) ; rappel du matin : fun fact scientifique tiré équitablement parmi 100 | US-033 à US-036 (lot « Rappels ») ; questions Q-DEM002-1 à 7 |

## Lots
| Lot | Objectif | Typologie (majeure / mineure) | US | Statut | Étape |
|---|---|---|---|---|---|
| [LOT-001](lots/LOT-001.md) | Socle et objectifs/tâches, smartphone + PC, compte Google, stockage personnel | Majeure | US-022, 017, 018, 031, 001, 023, 002, 024, 003, 025 | Validé (2026-10-20) | E3 terminée (Starck, DAT v0.4) ; E4 terminée (Steeve) ; E5 terminée (211 scénarios, dont 88 proposés ; CdC v0.6) ; E6 validée (DEC-018) ; décisions intégrées (CdC v0.7, 219 scénarios, UX v0.2.1) ; E7 refinement : tour 1 terminé (4 US Non Ready), corrections en cours, questions Q-ERG-16 à 18 et Q-LOT-1 au commanditaire ; Q-ERG-12 à 14 tranchées, nom de l'application : « Done Juan » (DEC-017) ; test technique R1/R2 en attente d'actions du commanditaire (bloquant avant E9) |

## État des user stories
| US | Titre | Lot | Statut | Étape (E0–E17) | Agent en cours | Remarques |
|---|---|---|---|---|---|---|
| US-022 | Se connecter avec mon compte Google | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-017 | Retrouver mes données sur smartphone et PC | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-001 | Créer et gérer un objectif | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-023 | Organiser un objectif en sous-objectifs | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-002 | Créer et gérer mes tâches | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-024 | Décomposer une tâche en sous-tâches | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-003 | Terminer ou rouvrir une tâche, atteinte d'un objectif | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-018 | Utiliser l'application sans connexion (smartphone) | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |
| US-031 | Utiliser l'application sans connexion sur PC | LOT-001 | Validée | E7 | tous | Ajoutée par DEC-013 ; validée le 2026-10-21 (DEC-018) |
| US-025 | Abandonner une tâche | LOT-001 | Validée | E7 | tous | Validée le 2026-10-21 (DEC-018) |

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
| Refinement LOT-001 (RF-LOT-001-*) | US-022, 017, 018, 031 Non Ready ; 6 US Ready après nettoyage | Tous | Tour 1/2 | Corrections en cours | `ceremonies/refinement-LOT-001.md` ; questions Q-ERG-16, 17, 18 et Q-LOT-1 au commanditaire |

## Décisions (arbitrages du commanditaire — définitives)
| Décision | Date | Sujet | Décision |
|---|---|---|---|
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
| DEC-005 | 2026-10-20 | A2 Distribution Android | Google Play, piste de test interne |
| DEC-006 | 2026-10-20 | A3 Hébergement PC | Hébergement statique gratuit, sans domaine en v1 |
| DEC-007 | 2026-10-20 | A4 Serveur | Aucun serveur applicatif |
| DEC-008 | 2026-10-20 | A5 Vérification Google | Publication en production sans vérification (écran « application non vérifiée » accepté) |
| DEC-009 | 2026-10-20 | A6 Emplacement Drive | Dossier visible |
| DEC-010 | 2026-10-20 | A7 Chiffrement Drive | Pas de chiffrement supplémentaire en v1 |

## Points bloquants
- Nom « Done Juan » (DEC-017) à répercuter : maquettes et guides (Steeve), cahier des charges et US (Pepper), DAT (Starck), README. Dossier Drive « Done Juan » (DEC-018, V-13).
- Pour Starck (refinement) : état lu / non lu de la liste « Modifications non retenues » (synchronisé ou local).
- Test technique R1/R2 (`03-architecture/test-technique-R1-R2.md`) : nécessite des actions du commanditaire (projet Google Cloud, compte de test, téléphone Android, compte d'hébergement, 2 séances d'environ 1 h 30). Bloquant avant E9 de LOT-001.
- Proposition de Starck à valider en E6 : étendre RG-044 aux fichiers Drive modifiés à la main (traités comme illisibles).
- Socle UX v0.1 rendu (Steeve) : questions ergonomiques Q-ERG-02 à 11 (`02-ux/guide-ergonomie.md` §12.1), non bloquantes pour LOT-001 ; demandes à Starck DAT-UX-09 et 13. E4 de LOT-001 et maquettes ECR-007, 008, 010, 011 à réaliser après validation E2.
- Points F1 à F14 de Starck : intégrés par Pepper (CdC v0.4). DAT à aligner sur RG-043 (données conservées à la déconnexion).
- Socle technique : DAT v0.1 rendu, DS-01 à DS-20 tranchées au §11 (statut « Proposé », à valider). Anthony attendait de Starck les décisions DS-01 à DS-20 (`04-specification-technique/conventions.md` §15). Celles qui bloquent la conception de LOT-001 : DS-01, 02, 03, 05, 07, 10, 11, 14, 15, 16 et 19.
- Points de testabilité PT-01 à PT-15 (`conventions.md` §14) : questions complémentaires pour Pepper et Starck, à traiter au refinement du lot concerné.
- LOT-001 : questions P1 Q-DEM001-39, 41, 42 transmises au commanditaire ; règles proposées RG-044 b), 047 à 050, 054 et critères (P) à valider en E6, avec la reformulation et les exclusions.
