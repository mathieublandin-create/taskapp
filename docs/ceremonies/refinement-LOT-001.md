# Refinement LOT-001 (E7)

> Animé par Jarvis le 2026-10-21. Participants : Pepper, Steeve, Starck, Anthony, Benjamin (avis recueillis en parallèle, modèle sonnet).
> Référentiel : Definition of Ready de `docs/workflow.md`, cahier des charges v0.7, US validées par DEC-018.

## Tour 1 — Avis

| US | Pepper | Steeve | Starck | Anthony | Benjamin | Consolidé |
|---|---|---|---|---|---|---|
| US-022 Connexion | Non Ready | Ready | Ready | Non Ready | Ready (réserve) | **Non Ready** |
| US-017 Synchronisation | Non Ready | Ready | Ready | Non Ready | Non Ready | **Non Ready** |
| US-018 Hors ligne smartphone | Non Ready | Ready | Ready | Ready (réserve) | Non Ready | **Non Ready** |
| US-031 Hors ligne PC | Non Ready | Ready | Ready | Non Ready | Non Ready | **Non Ready** |
| US-001 Objectif | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready | Ready après nettoyage |
| US-023 Sous-objectifs | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready (réserve) | Ready après nettoyage |
| US-002 Tâches | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready | Ready après nettoyage |
| US-024 Sous-tâches | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready (réserve) | Ready après nettoyage |
| US-003 Terminer / rouvrir | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready | Ready après nettoyage |
| US-025 Abandonner | Ready (réserve) | Ready | Ready | Ready (provisoire) | Ready | Ready après nettoyage |

Pendant le tour, Starck (DAT v0.5) et Steeve (guide v0.2.2, ECR-011 cadres J, K, L) ont mis à jour leurs livrables : nom « Done Juan », mentions « proposée » retirées, RG-057 et RG-058 intégrées.

## Questions pour le commanditaire

| Id | Question | Positions | Recommandation de Jarvis |
|---|---|---|---|
| Q-ERG-16 | RG-057 : à partir de quand compte-t-on les 24 h du bandeau ? | a) depuis le dernier échange réussi avec le Drive (Starck, Pepper) ; b) depuis la plus ancienne modification en attente (Steeve) ; c) depuis la coupure du réseau | **b)** : le bandeau sert à prévenir que des données ne sont que sur l'appareil, et c'est leur âge qui compte. |
| Q-ERG-17 | Accès Google perdu depuis plus de 24 h, alors que le bandeau « Se reconnecter » est déjà affiché | a) un seul bandeau, « Se reconnecter », complété de « n modifications ne sont encore que sur cet appareil » (Steeve) ; b) deux bandeaux | **a)** |
| Q-ERG-18 | Un bandeau des 24 h fermé réapparaît-il ? | a) oui, à la prochaine ouverture de l'application, tant que des modifications sont en attente (Steeve) ; b) non | **a)** |
| Q-LOT-1 | Taille d'US-017 (12 CA, 33 scénarios) | a) découper US-017 en 4 US : synchronisation de base, conflits et modifications non retenues, restauration, versions et fuseau (Benjamin). Le contenu est inchangé, mais le découpage doit être revalidé ; b) garder l'US et la livrer en 4 incréments internes, avec une revue de code par incrément (Anthony) | **b)** : même découpage pour le développement et la revue, sans nouvelle validation de votre part. |

## Remarques par propriétaire (tour 1)

**Pepper** (US, `.feature`, CdC)
- Testabilité :
  - ANT-1 : scinder S13 d'US-022, avec l'avertissement Google en recette manuelle ;
  - ANT-3 : reformuler les délais d'US-017 en mécanismes ;
  - ANT-5 et ANT-6 : tag `@ihm` pour US-031 S01, S08, S14 à S17 ; scinder S01 ; résultat observable de S14 ; reformuler S17 ;
  - ANT-4 et BEN-12 : seuil exact de l'horloge déréglée, en CA numéroté.
- Vocabulaire :
  - ANT-9, ANT-10, PEP-7 : glossaire d'étapes figé (appareil, synchronisation, temps, assertions, négations) ; limiter les étapes paramétrées en texte libre ;
  - ANT-2, ANT-15 : motifs de connexion avec codes stables.
- Règles :
  - BEN-9 : RG-048 avec 3 déplacements ou plus ;
  - BEN-10, PEP-9 : estimation calculée nulle face au minimum de 30 min ;
  - STE-3 : « jusqu'à Compris » en CA ;
  - STA-5 : scénario RG-058 (aucune écriture, dépôt après mise à jour) ;
  - ANT-16 : dates des tâches de contexte ;
  - ANT-11 : égalité stricte des horodatages (facultatif) ;
  - BEN-6 : CA-2 d'US-022, premier objectif ou première tâche.
- RG-057 et scénarios S15 à S17 et S19 à S20, après réponse à Q-ERG-16 à 18.
- PEP-8 : nettoyage de ses propres mentions.

**Steeve** (maquettes, guide)
- ANT-7 : libellés exacts et **codes d'état** observables : indicateur, bandeaux, « non synchronisé », mentions ; catalogue de messages ERR-/ALR-.
- BEN-6 : état vide après la première connexion (objectif ou tâche), écran d'atterrissage.
- PEP-10 : compteur d'objectif (3/3 « en cours ») dans ECR-003 et ECR-008.
- BEN-8 : écrans portant la mention « heure de Paris » au lot 1.
- Confirmation d'abandon d'une tâche sans sous-tâche dans ECR-007.
- PEP-6 : mentions résiduelles éventuelles.

**Starck** (DAT)
- ANT-8 : couche de « modèles de vue », c'est-à-dire des requêtes de présentation testables sans React.
- ANT-12 : statut des ADR et du DAT avant E9.
- BEN-5c : l'action « Retirer l'accès » du §4.1.5 n'est dans aucune US. La retirer du lot 1 ou la signaler.
- PEP-9 : objet-valeur `Duree` et estimation calculée à 0.
- ANT-4, ANT-11 : en-tête `Date` simulé et `appareilId` fixe dans le banc de test.
- PEP-11 : alignement sur RG-043, à revérifier.

**Anthony** (conventions)
- Section 3 de son avis : aligner `conventions.md` sur le DAT (stack, arborescence, ports, outillage, fuseau Europe/Paris, tags `@ihm`, `@recette`, types de paramètres) avant E9.
- ANT-14 : ordre de réalisation et incréments, en E9.
- BEN-2 : ordre US-022 → socle US-017 → US métier → fin d'US-017 → US-018 et US-031, à trancher en E9.

**Jarvis**
- STA-4, BEN-7, ANT-13 : organiser avec le commanditaire le test technique R1, R2, R11. Bloquant pour E9 d'US-022 et d'US-017.

## Règle anti-boucle
Tour 1 terminé. Un tour 2 sera mené après les corrections et les réponses du commanditaire. Si une US reste Non Ready après le tour 2, Jarvis demandera un arbitrage.

## Suivi des corrections du tour 1 (2026-10-21)
- **Starck** : DAT v0.6 ; RG-057 présentée comme hypothèse en attente de Q-ERG-16 et 17. Fait.
- **Steeve** : catalogue §6.6 (codes SYN-, BAN-, MEN-, ETA-, ERR-, ALR-), guide v0.2.3, maquettes ECR-003, 007, 008, 010. Fait.
- **Pepper** : 231 scénarios, `GLOSSAIRE-ETAPES.md`, tags `@ihm` (7) et `@recette` (1), CdC v0.8 ; ANT-16 (convention de date des tâches de contexte) ; codes alignés sur le catalogue de Steeve. Fait.
- **Anthony** : conventions v0.2. En cours.
- **Pour le tour 2 (Steeve)** : codes manquants dans le catalogue pour les motifs de refus « estimation invalide », « tâche abandonnée », « objectifs hérités de la tâche parente », « n sous-tâches restantes », « estimation calculée » ; forme de `MEN-HEURE-PARIS` sur une date de fin (US-003 S21).
- **Nouvelles questions pour le commanditaire** : Q-REF-1 (RG-048 avec une chaîne de déplacements) et Q-REF-2 (aucune écriture dans le Drive en consultation seule).
- **Anthony** : conventions v0.2 (stack, arborescence, ports, temps Europe/Paris, catalogue, sécurité, CI GitHub Actions), checklist v0.2, modèle de ST v0.2, DT-001 (données locales non chiffrées). Fait.
- **Ouverts avant le tour 2** :
  - Starck : ANT-17 `fuseauAppareil()` au port `Horloge`, ANT-19 conservation des champs inconnus (RG-058), ANT-20 exécution de `@ihm`, ANT-18 (pour information) ;
  - Steeve puis Pepper : ANT-21, codes de motif de refus ;
  - Jarvis : protection des branches GitHub (à proposer au commanditaire) et test technique R1, R2, R11.
- **Tour 2, fait** :
  - Starck : DAT v0.7 et ADR-009 (ANT-17 à 20) ;
  - Steeve : catalogue v0.2.4 (codes ERR-023 et ERR-030 à 035, forme de MEN-HEURE-PARIS) ;
  - Pepper : 20 motifs de refus remplacés par leurs codes, glossaire v1.1, 231 scénarios, 0 erreur de syntaxe.
- **Reste à faire, mineur (Steeve)** :
  - table §6.6.10 : US-001 S04 au lieu de S03 ;
  - ajouter US-024 S16b ;
  - documenter le format `"ERR-030 variante …"` utilisé dans les scénarios.
- **Reste à faire, en attente du commanditaire** : RG-057 (Q-ERG-16 à 18), Q-LOT-1, Q-REF-1, Q-REF-2.

## Tour 2 — Avis et clôture (2026-10-21)

| US | Pepper | Anthony | Benjamin | Consolidé |
|---|---|---|---|---|
| US-022 | Ready | Ready (condition E9 : test R2/R11) | Ready | **Ready** |
| US-017 | Ready | Ready (condition E9 : test R1) | Ready | **Ready** |
| US-018 | Ready après PEP-12 | Ready | Ready | **Ready** (PEP-12 corrigée) |
| US-031 | Ready après PEP-12 | Ready | Ready | **Ready** (PEP-12 corrigée) |
| US-001, 023, 002, 024, 003, 025 | Ready | Ready | Ready | **Ready** |

Starck et Steeve étaient déjà Ready au tour 1 et ont traité toutes leurs remarques.

- **Décisions du commanditaire intégrées** : DEC-021 (APK direct), DEC-025 (RG-057, RG-048, RG-058, US-017 en 4 incréments), DEC-026 (prochaine ouverture). Documents : CdC v0.9.1, 243 scénarios, DAT v0.8, ADR-012, guide v0.2.6, conventions v0.2.
- **Corrections de fin de tour** : PEP-12 (RG-057 dans les impacts architecture d'US-018 et US-031, et dans LOT-001), PEP-13 (RG-057 dans le CdC), PEP-14 (guide et parcours sans Google Play), PEP-15 (conventions : deux bandeaux distincts, Q-ERG-16 à 18 closes). Toutes traitées.
- **Suivis non bloquants, reportés en E8 et E9** :
  - ANT-22 : conventions v0.3, alignées sur DAT v0.8 et ADR-012 ;
  - ANT-23 : résultat observable d'US-031 S14 ;
  - ANT-24 : en-têtes des `.feature` (CdC v0.9) ;
  - BEN-13 : APK et clé de signature ;
  - BEN-14 : rattachement des scénarios d'US-017 à ses 4 incréments ;
  - ANT-14 et BEN-2 : ordre de réalisation ;
  - `.gitignore` à créer avant la clé de signature.
- **Préalable à E9 pour US-022 et US-017** : le test technique R1, R2 et R11 (actions du commanditaire).
- **Leçon retenue** : dans les prochaines cérémonies, Jarvis conservera le texte intégral des remarques, et pas seulement leur identifiant.

**Verdict : LOT-001 est Ready. Le refinement est clos ; le lot passe en E8 (contrôle d'explicitation par Anthony).**
