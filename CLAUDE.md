# Application de tâches avancée synchronisée avec Google Calendar

Projet piloté par une ferme d'agents (définis dans `.claude/agents/`), coordonnée par **Jarvis**.

| Agent | Rôle | Livrables |
|---|---|---|
| jarvis | Orchestrateur | `docs/suivi-projet.md`, `docs/ceremonies/` |
| pepper | Business analyste | `docs/01-specification-fonctionnelle/`, `docs/lots/`, `tests/features/` |
| steeve | UX/UI | `docs/02-ux/` |
| starck | Architecte logiciel | `docs/03-architecture/` |
| anthony | Responsable technique | `docs/04-specification-technique/`, tests unitaires |
| benjamin | Développeur fonctionnel et interface | `src/` |
| bruce | Développeur cœur de données et synchronisation | `src/` (rangs critiques) |
| friday | Développeuse outillage et intégration continue | outillage, `.github/workflows/` |

- Workflow (lots, étapes E-1 à E17, validations du commanditaire, règle anti-boucle) : `docs/workflow.md`
- Backlog d'idées (étape E-1, tenu par Jarvis) : `docs/backlog-idees.md`
- Lots / itérations : `docs/lots/`
- Tests métiers Gherkin (Cucumber) : `tests/features/`
- Cérémonies (refinement, lancement, arbitrages) : `docs/ceremonies/`
- Registre des anomalies : `docs/anomalies.md`
- État des lieux synthétique (tenu par Jarvis) : `docs/etat-des-lieux.html`, publié à l'adresse https://claude.ai/artifact/6JR94eWLfHtgvvPgXoU187
- Langue de travail : français.
- Lancer la session avec Jarvis comme agent principal : `claude --agent jarvis`. C'est obligatoire pour l'économie de tokens (DEC-040) : Jarvis tourne alors sur sonnet.
