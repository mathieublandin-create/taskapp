# Reprise de session (état au 2026-10-30)

Fichier à lire en premier par Jarvis dans une session neuve. Le détail de l'historique est dans `docs/suivi-projet.md`, l'avancement dans `docs/etat-des-lieux.html`.

## État du lot 1 (LOT-001)
- Branche du lot : `lot/LOT-001` (dernière fusion : PR #8, DT-012, commit `90cd7d5`). Avancement : 42 % (38,5 j sur 91).
- Rangs 0 à 3 fusionnés. DT-005, DT-007, DT-008 (CSP, DEC-041) et DT-012 (job `e2e` en CI) remboursées.

## Travail en cours : reliquat du rang 3
- Branche `us/US-017-reliquat-rang3`, poussée, commit `bcd6245` : **E10 terminée** par Anthony (tests UT-US-017-34 à 39, UT-US-001-36 et 37 ; 22 tests rouges attendus, squelettes dans `src/`). `pnpm verifier` passe.
- **Reste, par Benjamin (sonnet), E12 sur cette branche** : DT-006 (composants du rang 1 en Ionic), DT-009 (magasin abonné à `DepotLocal.observer`), DT-011 (feuille ECR-011 `construireFeuilleSynchronisation` et `MEN-ATTENTE`), RC-R3-4, RC-DT8-1 (`toEqual(COMPOSANTS_IONIC)` dans `tests/e2e/csp.e2e.ts:67`).
- Piège : Anthony a inscrit les 3 squelettes dans `tests/support/rangs/rangs-fichiers.json` au **rang 4** ; Benjamin doit les ramener au rang 3 (sinon UT-OUT-06 et « aucun orphelin » deviennent rouges).
- Ensuite : pousser, ouvrir la PR vers `lot/LOT-001`, E13 par Anthony (sur le diff), annoncer « vous pouvez fusionner la PR #N » après CI verte. Puis rang 4 (US-023, Benjamin).

## À faire par le commanditaire
- Ajouter le contrôle requis `e2e (CSP, navigateur réel)` à la protection de `lot/*` et `main` (DEC-029, RC-DT12-4).

## Questions ouvertes
- Q-ST017-STE-1 (Steeve, non bloquante) : codes de catalogue pour la nature des modifications en attente ; texte d'`ERR-016` pour n = 0 ou 1. Et `BTN-ANNULER` (RC-R2-8 a).
- Retirer `.claude/settings.local.json` du dépôt ? Guide de recette `donejuan-recette` avant l'E14. Vérification de la CSP sur Android et PC, flux GIS compris (PO-13, E14).
- Avant la PR `lot/LOT-001` → `main` : le contrôle de couverture par fichier ne doit pas bloquer.

## Règles de conduite (DEC-040, OPT-1 à OPT-14)
- Un agent neuf par sujet ; modèle imposé à chaque délégation ; au plus 2 agents opus en parallèle ; lectures ciblées ; E13 sur le diff.
- Pas d'abonnement aux PR (lire la CI avec `GH_TOKEN= gh api`). Push et ouverture de PR confiés à Friday (haiku). Messages de 3 à 5 lignes.
- État des lieux : modifier `docs/etat-des-lieux-avancement.json` puis `python3 docs/outils/maj-etat-des-lieux.py`, republier avec l'outil Artifact (`edits` ou fichier), url https://claude.ai/artifact/6JR94eWLfHtgvvPgXoU187.
- Les agents ne poussent pas ; l'utilisateur fusionne lui-même les PR. Aucun secret, aucune adresse e-mail dans le dépôt public.

## Commandes utiles
- `export PATH=$HOME/.local/node24/bin:$PATH`, `pnpm install --frozen-lockfile`, `pnpm verifier`, `pnpm test`, `TZ=UTC pnpm test:couverture`, `pnpm cucumber`, `pnpm build`.
- `pnpm e2e` ; en local : `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome pnpm e2e`.
- PR : `GH_TOKEN= gh api repos/mathieublandin-create/taskapp/pulls -X POST --input fichier.json`.
