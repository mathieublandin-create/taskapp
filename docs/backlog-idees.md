# Backlog d'idées (tenu par Jarvis)

> Les idées et épiques du commanditaire qui ne sont pas encore étudiées sont recueillies ici, en amont d'E0.
> Une idée n'entre dans le workflow (E0, `DEM-xxx`) que lorsque le commanditaire l'a **priorisée**.
> Fonctionnement : étape **E-1** de `docs/workflow.md`, validée par le commanditaire le 2026-10-22 (DEC-033).

## Tableau

| Id | Titre | Reçue le | Statut | Maturité | Taille pressentie | Priorité |
|---|---|---|---|---|---|---|
| EPI-001 | Partage d'un objectif avec un autre utilisateur, rôles « administrateur des tâches » et « contributeur » | 2026-10-22 | Qualifiée | 3/6 critères | Très grande (XL) | — |
| EPI-002 | Assistant IA vocal pour définir et raffiner un objectif et créer les tâches | 2026-10-22 | Qualifiée | 3/6 critères | Grande (L) | — |

Statuts : Reçue → Qualifiée → Mûre → Priorisée → Transformée en `DEM-xxx` (ou Écartée, ou En sommeil).

---

## EPI-001 — Partage d'un objectif avec un autre utilisateur

**Verbatim (2026-10-22)**
> je souhaite ajouter la possibilité d'avoir un autre utilisateur à qui repartir les tâches qui seraient partagées au sein d'un même objectif. Il faudrait qu'il ait une vue sur les objectifs sans pouvoir les modifier, il devrait pouvoir modifier ses tâches et imputer du temps sur ses tâches avec des résumé matinaux et soir, il faudrait qu'on introduise un rôle d'administrateur des tâches et que j'ai les 2 rôles à l'initiative.

**Reformulation de Jarvis**
- Un objectif peut être partagé avec un autre utilisateur, le contributeur.
- L'administrateur des tâches répartit les tâches de cet objectif entre lui-même et le contributeur.
- Le contributeur peut :
  - voir l'objectif, sans pouvoir le modifier ;
  - modifier les tâches qui lui sont attribuées ;
  - imputer du temps sur ces tâches ;
  - recevoir les résumés du matin et du soir pour ses tâches.
- Au départ, le commanditaire détient les deux rôles, administrateur et utilisateur.

**Valeur attendue** : déléguer une partie d'un objectif et en suivre l'avancement, sans perdre la maîtrise de l'objectif.

**Tensions avec l'existant, à arbitrer en E1** :
- **RG-018** : « un seul utilisateur par compte ; données ni partagées ni visibles par d'autres ». L'épique la remet en cause directement.
- **ENF-05** (confidentialité) et **DEC-007** (aucun serveur). Sans serveur, le partage ne peut passer que par le partage de fichiers Google Drive entre deux comptes. C'est un changement d'architecture majeur pour Starck : droits, fusion à deux auteurs, révocation du partage, contributeur sans compte Google.
- Elle dépend de fonctions qui ne sont pas encore livrées :
  - le suivi du temps (lot 3 indicatif) ;
  - les rappels et résumés du matin et du soir (lot 4).
- Elle touche l'agenda : les créneaux du contributeur sont-ils posés dans **son** agenda ?

**Questions de maturité, pour le commanditaire** :
- **M1-1** : Le contributeur a-t-il son propre compte Google et sa propre installation de Done Juan ?
- **M1-2** : Le contributeur peut-il créer des tâches dans l'objectif partagé, ou seulement modifier celles qu'on lui attribue ?
- **M1-3** : Un objectif peut-il être partagé avec plusieurs contributeurs, ou un seul ?
- **M1-4** : Le rôle d'administrateur peut-il être confié à quelqu'un d'autre que vous ? Pourquoi distinguer ce rôle, alors que vous seriez le seul à le détenir au départ ?
- **M1-5** : Les résumés du matin et du soir du contributeur portent-ils seulement sur les tâches partagées ?

**Critères de maturité remplis** : besoin, valeur, rôles esquissés. **Il manque** : le périmètre exclu, les réponses M1-1 à M1-5 et l'avis de faisabilité de Starck.

---

## EPI-002 — Assistant IA vocal pour définir un objectif et ses tâches

**Verbatim (2026-10-22)**
> je souhaite pouvoir interroger une ia externe avec la voix dans un module pour définir un objectif et qu'il soit raffiné par ia et qu'elle aide à lister les tâches à créer, je veux aussi lui permettre de crée des objectifs et des taches

**Reformulation de Jarvis**
- Un module « assistant » permet de dialoguer à la voix avec une IA externe.
- L'IA aide à formuler un objectif, à le raffiner et à proposer la liste des tâches nécessaires.
- L'IA peut aussi créer elle-même les objectifs et les tâches dans Done Juan.

**Valeur attendue** : passer d'une intention floue à un objectif et des tâches exploitables, rapidement et sans saisie au clavier.

**Tensions avec l'existant, à arbitrer en E1** :
- **ENF-05** (confidentialité) : les intitulés d'objectifs et de tâches seraient envoyés à un service tiers.
- **DEC-007** (aucun serveur) : l'appel à l'IA se ferait depuis l'appareil, avec une clé d'API à stocker sur l'appareil ou une connexion par le compte de l'utilisateur.
- **Coût** : la contrainte « gratuit ou sans cloud » ne permet pas d'utiliser une IA externe payante à l'usage.
- **Création par l'IA** : faut-il une validation humaine avant la création ? Si oui, elle s'aligne sur le principe « jamais appliqué sans validation » de RG-037.
- **Reconnaissance vocale** : celle du système (Android, navigateur) ou celle du service d'IA ? Le choix a des conséquences sur la confidentialité.

**Questions de maturité, pour le commanditaire** :
- **M2-1** : Quelle IA externe ? Un fournisseur imposé ? Un abonnement existant ? Un budget mensuel acceptable ?
- **M2-2** : L'IA crée-t-elle directement les objectifs et les tâches, ou les propose-t-elle pour que vous validiez ?
- **M2-3** : Faut-il une réponse vocale de l'IA, ou du texte à l'écran suffit-il ?
- **M2-4** : Sur quels appareils : smartphone seulement, ou aussi PC ?
- **M2-5** : Acceptez-vous que le contenu de vos objectifs et de vos tâches soit transmis à ce service ?

**Critères de maturité remplis** : besoin, valeur, périmètre esquissé. **Il manque** : les réponses M2-1 à M2-5, l'avis de faisabilité et de coût de Starck, et le périmètre exclu.
