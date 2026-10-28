# Revue de lancement LOT-001 (E11) : compte rendu

> Animée par Jarvis du 2026-10-27 au 2026-10-28. Participants : Anthony (présentation et traitement), Pepper, Steeve et Starck (relectures), Benjamin (reformulation).
> Lancée à la demande du commanditaire (« lance la revue de lancement dès qu'Anthony a fini »).

## 1. Objet
Relecture de la conception détaillée du lot avant le développement :
- `ST-socle-ecriture` et les ST des 10 US ;
- l'ordre de réalisation de `LOT-001.md` (rangs 0 à 13) ;
- les tests unitaires de l'E10.

## 2. Livrables de la revue (texte intégral des remarques et des réponses)
| Relecteur | Livrable | Remarques | Bloquantes | Avis final |
|---|---|---|---|---|
| Pepper | `lancement-LOT-001-pepper.md` | P1 à P6 | P1, P2 | Levées : P1 par DEC-038, P2 corrigée |
| Steeve | `lancement-LOT-001-steeve.md` | S1 à S7 | aucune | Favorable |
| Starck | `lancement-LOT-001-starck.md` | A1 à A9 | A1 | **Favorable sans réserve** (A1 levée le 2026-10-28) |
| Benjamin | `lancement-LOT-001-benjamin.md` | Q-BEN-LOT001-1 à 10 | Q-1 au démarrage, Q-2 à Q-4 à la clôture du rang 0 | **Prêt pour l'E12 du rang 0** |

Toutes les remarques sont corrigées ou justifiées par Anthony. Leurs réponses figurent dans chaque livrable.

## 3. Décisions et précisions issues de la revue
- **DEC-038** (commanditaire, Q-RL-P1 a)) : l'écran « Connexion à Google… » s'affiche à chaque ouverture avec réseau, et aucun jeton n'est conservé. RG-017 et US-017 CA-3 sont précisés (CdC v0.14.1).
- **Q-ST022-STA-4** : un accès déjà perdu reste perdu. **Q-ST017-STA-3** : l'archivage des appareils inactifs sort du lot 1 et devient DT-002. **Q-ST022-STE-4** : `TST-SAISIE-A-TERMINER`.
- `ERR-017` (suppression bloquée par une autre fenêtre), avec « Réessayer » et « Aller à la connexion » ; écran d'attente `SYN-REDIRECTION` limité à 10 s ; `ERR-004` neutre. Ces points sont dans le guide v0.2.17.
- DAT v0.11.5 ; conventions v0.4.3 ; ST v0.3.
- **Sélection des tests par rang** (conventions §11.14) : `main` reste verte, avec 6 tests d'outillage verts et les autres non exécutés tant que leur rang n'est pas livré.
- **Branches** : `lot/LOT-001` et `us/SOCLE-ecriture`, créées et poussées le 2026-10-28. Benjamin commite en local ; Jarvis pousse et ouvre les pull requests (API REST).

## 4. Points ouverts
| Point | Pour | Échéance |
|---|---|---|
| **Q-RL-P6** : accepter un second geste si la fenêtre Google tombe en panne pendant une saisie (exception à RG-017) | Commanditaire | Avant l'E12 du rang 1 |
| A5 : outillage (Node 24, Cucumber, MSW, Playwright, dependency-cruiser, React, Ionic, vite-plugin-pwa) et CI de l'application | Benjamin | Condition de l'E13 du rang 0 ; protection de `main` ensuite (DEC-029) |
| Tests de l'E10 des incréments 2 à 4 d'US-017, d'US-018 et d'US-031 | Anthony | Avant l'E12 de chaque rang |
| Q-BEN-LOT001-10 : identifiant du client OAuth de développement et origine de développement | Jarvis → Benjamin, hors dépôt | Avant toute vérification manuelle au rang 1 |

## 5. Verdict
**Le lot est lancé.** Aucune remarque bloquante ne reste ouverte pour le rang 0. LOT-001 passe au statut **En réalisation (E12)**, et le développement commence par le rang 0 (socle d'écriture), sur la branche `us/SOCLE-ecriture`. Effort estimé : environ 91 jours.

Règle anti-boucle : aucun sujet n'a dépassé 2 itérations.
