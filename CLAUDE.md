# Application de tâches avancée synchronisée avec Google Calendar

Projet piloté par une ferme d'agents (définis dans `.claude/agents/`), coordonnée par **Jarvis**.

| Agent | Rôle | Livrables |
|---|---|---|
| jarvis | Orchestrateur | `docs/suivi-projet.md` |
| pepper | Business analyste | `docs/01-specification-fonctionnelle/` |
| steeve | UX/UI | `docs/02-ux/` |
| architecte | Architecte logiciel | `docs/03-architecture/` |
| responsable-technique | Tech lead | `docs/04-specification-technique/` |
| developpeur | Développeur | `src/` |

- Workflow (étapes E0 à E14, règle anti-boucle) : `docs/workflow.md`
- Tests métiers Gherkin (Cucumber) : `tests/features/`
- Cérémonies (refinement, lancement, arbitrages) : `docs/ceremonies/`
- Registre des anomalies : `docs/anomalies.md`
- Langue de travail : français.
- Lancer la session avec Jarvis comme agent principal : `claude --agent jarvis`
