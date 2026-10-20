# ADR-010 — Architecture hexagonale et stockage local (IndexedDB et SQLite)

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | ENF-04, ENF-06, ADR-001, ADR-003, ADR-009, DAT §2.4 |

## Contexte
Le même noyau tourne sur deux types de cibles :
- le web (PWA) : stockage IndexedDB, authentification par Google Identity Services ;
- le natif (Capacitor) : stockage SQLite, authentification native, notifications locales.

Les règles métier sont nombreuses et doivent être testées sans entrées-sorties. Sur iOS, le stockage web d'une WebView peut être purgé par le système.

## Options étudiées
1. Code organisé par écrans, avec appels directs aux API : rapide au départ, mais intestable et non portable entre les cibles.
2. **Architecture hexagonale** : domaine pur, cas d'usage, ports et adaptateurs.
3. Stockage local unique en IndexedDB partout : simple, mais risque de purge sur iOS.
4. **Stockage local derrière un port `DepotLocal`**, avec deux adaptateurs : Dexie (IndexedDB) sur le web, SQLite sur le natif.

## Décision
Options 2 et 4.
- Les couches et leurs dépendances autorisées sont définies au DAT §2.4.
- Ports : `DepotLocal`, `TransportSynchro`, `PasserelleAgenda`, `FournisseurAuth`, `Horloge`, `Notifieur`, `Planificateur`.
- Toute écriture locale est **transactionnelle**. Une modification n'est jamais retirée de l'appareil avant son dépôt confirmé dans Drive (ENF-T-07).
- L'interface ne lit que la base locale. Elle ne fait jamais d'appel réseau bloquant.

## Conséquences
- \+ Le domaine et la synchronisation sont testables unitairement et en Gherkin avec des adaptateurs en mémoire (ADR-009).
- \+ Les cibles sont interchangeables (Tauri par exemple) sans toucher au métier.
- \+ Le hors ligne découle naturellement de cette structure.
- − Deux adaptateurs de stockage à maintenir, et une couche d'abstraction supplémentaire.
