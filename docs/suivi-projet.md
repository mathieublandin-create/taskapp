# Suivi projet

## Demandes
| Demande | Date | Résumé | US associée(s) |
|---|---|---|---|
| [DEM-001](demandes/DEM-001.md) | 2026-10-20 | Besoin initial : objectifs déclinés en tâches, planification, suivi du temps et de la vélocité, rappels quotidiens via Google Calendar, usage smartphone et PC | Backlog v0.3 (US-001 à US-032) ; 8 US proposées dans LOT-001 ; questions résiduelles Q-DEM001-21 à 40 |
| [DEM-002](demandes/DEM-002.md) | 2026-10-20 | Rappel du soir : 2 questions de bilan (ce qui s'est bien passé, ce que j'aurais fait autrement) ; rappel du matin : fun fact scientifique tiré équitablement parmi 100 | US-033 à US-036 (lot « Rappels ») ; questions Q-DEM002-1 à 7 |

## Lots
| Lot | Objectif | Typologie (majeure / mineure) | US | Statut | Étape |
|---|---|---|---|---|---|
| [LOT-001](lots/LOT-001.md) | Socle et objectifs/tâches, smartphone + PC, compte Google, stockage personnel | Majeure (proposée) | US-022, 017, 001, 023, 002, 024, 003, 025 | Proposé | E2 — avis Starck rendu (`03-architecture/avis-dependances-lot1.md`) ; attente validation commanditaire (D1–D3, A1–A7, P1) |

## État des user stories
| US | Titre | Lot | Statut | Étape (E0–E17) | Agent en cours | Remarques |
|---|---|---|---|---|---|---|
| US-022 | Se connecter avec mon compte Google | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-017 | Retrouver mes données sur smartphone et PC | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-001 | Créer et gérer un objectif | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-023 | Organiser un objectif en sous-objectifs | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-002 | Créer et gérer mes tâches | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-024 | Décomposer une tâche en sous-tâches | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-003 | Terminer ou rouvrir une tâche, atteinte d'un objectif | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |
| US-025 | Abandonner une tâche | LOT-001 | En analyse | E2 | — | Questions P1 ouvertes |

## Validations du commanditaire
| Date | Étape (E2 / E6 / E16) | Objet | Verdict | Remarques |
|---|---|---|---|---|
| 2026-10-20 | E1 | Réponses Q-DEM001-1 à 20 | Reçues | Consignées dans questions-ouvertes.md |
| 2026-10-20 | E1 | Réponses P1 Q-DEM001-21 à 29 | Reçues | Recommandations retenues sauf 22.3 (données conservées sur l'appareil) |

## Journal des échanges (règle anti-boucle : 2 itérations maximum)
| Sujet | US | Entre | Itération | État | Remarques |
|---|---|---|---|---|---|

## Décisions (arbitrages du commanditaire — définitives)
| Décision | Date | Sujet | Décision |
|---|---|---|---|

## Points bloquants
- Socle UX v0.1 rendu (Steeve) : questions ergonomiques Q-ERG-02 à 11 (`02-ux/guide-ergonomie.md` §12.1), non bloquantes pour LOT-001 ; demandes à Starck DAT-UX-09 et 13. E4 de LOT-001 et maquettes ECR-007, 008, 010, 011 à réaliser après validation E2.
- Points F1 à F14 de Starck (DAT §8) à transmettre à Pepper avec les réponses P1 (impacts : RG-008, CA-7 de US-017, règles de réparation après fusion).
- Socle technique : DAT v0.1 rendu, DS-01 à DS-20 tranchées au §11 (statut « Proposé », à valider). Anthony attendait de Starck les décisions DS-01 à DS-20 (`04-specification-technique/conventions.md` §15). Celles qui bloquent la conception de LOT-001 : DS-01, 02, 03, 05, 07, 10, 11, 14, 15, 16 et 19.
- Points de testabilité PT-01 à PT-15 (`conventions.md` §14) : questions complémentaires pour Pepper et Starck, à traiter au refinement du lot concerné.
- DEM-001 : réponses du commanditaire reçues le 2026-10-20 (reformulation et exclusions non explicitement validées) ; 20 questions ouvertes transmises le 2026-10-20 (`01-specification-fonctionnelle/questions-ouvertes.md`). Validation attendue aussi pour la reformulation du besoin (§2 du cahier des charges) et les exclusions (§4.2).
