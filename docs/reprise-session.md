# Reprise de session (état au 2026-11-07)

Fichier à lire en premier par Jarvis dans une session neuve. Détail de l'historique : `docs/suivi-projet.md` ; avancement : `docs/etat-des-lieux.html` ; consommation : `docs/analyse-tokens.md` et `docs/bilan-tokens-lot1.md`.

## État du lot 1 (LOT-001)
- Branche du lot : `lot/LOT-001` (dernière fusion : PR #33, rang 10, commit `dd7c036`). Rangs 0 à 10 fusionnés (US-017 incr. 3 comprise) : **75 j sur 91, soit 82 %**. ANO-002 et ANO-003 corrigées (PR #32), en attente de la recette du commanditaire.
- **Limite d'usage** : remise à zéro hebdomadaire passée (2026-11-06). Règle « un agent à la fois » (option B, OPT-22) : lire `npx --yes ccusage@latest blocks --active --json` avant chaque lancement, s'arrêter à une frontière propre vers 80 % de la fenêtre de 5 h (≈ 25 $ sur ≈ 32 $). Opus réservé aux revues critiques, à l'arbitrage de spécification et au cœur de fusion ; sonnet pour le mécanique.
- **Suite** : rang 11 (US-017 incr. 4 : mesure et compatibilité d'horloge, 6 j), rang 12 (US-018 hors ligne smartphone, 6,5 j), rang 13 (US-031, 3,5 j), E13b, E14 (recette), E15 à E17, puis bilan de tokens. Chaque rang : E10 par Anthony (opus), tranches (Bruce opus pour le cœur de synchronisation, Benjamin sonnet pour l'interface), E13, CI.
- **Avant l'E12 du rang 11** : ST-US-024 v0.6 (case « Rouvrir » d'une sous-tâche, DT-030 résiduelle, `CNF-ROUVRIR-SOUS-TACHE`) et règle de reprise de DT-036 (doublon Drive laissé si `supprimerFichier` échoue, P2) à spécifier par Anthony.
- Questions ouvertes : Q-ANT-E13-R9-1, Q-ANT-E13-R9-2 / DT-027 (Starck, avant l'E13b), Q-ANT-E13-R10-1 (Starck, DAT §4.2.2 e : entrées `DONNEES_EFFACEES` « à lire » alors que H-6 et le code ne les comptent pas), Q-ST024-STE-1 (Steeve). RC-US-017-18 (suggestion) : factoriser `surPresentationModale` et `apresEvenement`.

## Jalon testable après le rang 10 (décidé le 2026-11-02)
- Le commanditaire a créé la page GitHub de recette et l'authentification Google (test technique) et vérifie les informations à me communiquer : adresse publique, option du DAT §7.4 bis, client OAuth Web (origines et redirection), écran de consentement en mode test avec son compte. Ne jamais demander ni stocker de secret.
- **Informations reçues le 2026-11-02** : URI de redirection autorisée du client OAuth Web (nommé « Done Juan POC Web » dans la console Google) = `https://mathieublandin-create.github.io/taskapp/`, c'est-à-dire l'URI du PoC et de la production du DAT (§4.1.7, l.305), PAS une adresse de recette isolée. **Décision du commanditaire (2026-11-02) : option 2**, adresse de recette conforme au DAT §7.4 bis (option c `https://mathieublandin-create.github.io/taskapp-recette/` ou d `https://donejuan-recette.github.io/`, à choisir), avec son URI ajoutée au client OAuth. **Identifiant client OAuth Web (non secret, à utiliser comme `VITE_GOOGLE_WEB_CLIENT_ID`)** : `275071465945-44uks3etb61qm9lqs9bc6upvlet616v7.apps.googleusercontent.com`. À faire par le commanditaire : créer le dépôt ou l'organisation de recette, ajouter l'URI de recette et l'origine aux « URI de redirection autorisés » et « origines JavaScript autorisées » du client, confirmer l'écran de consentement en mode test.
- À préparer (le rang 10 est fusionné) : workflow de construction et de déploiement de la recette (`VITE_ENV=recette`, `VITE_BASE_PATH`, `VITE_APP_ORIGIN`, identifiant client) avec une notice de pose pour l'organisation du commanditaire (hors du périmètre des agents) ; guide de test court de Pepper ; grille de retours que Jarvis transformera en anomalies (ANO-xxx).
- Ce que le jalon ne couvre pas : hors ligne smartphone et PC (rangs 12 et 13), compatibilité de version et horloge (rang 11).

## PR et branches ouvertes
- Aucune PR du lot en cours. Les branches `us/US-017-rang10*` sont fusionnées.

## Règles de conduite (DEC-040, OPT-1 à OPT-22)
- Un agent neuf par sujet ; modèle imposé à chaque délégation ; au plus 2 agents opus en parallèle ; lectures ciblées ; E13 sur le diff ; E13 « bis » sur sonnet si les remarques sont mécaniques (OPT-18).
- Un rang se découpe par couche (OPT-15), PR en brouillon jusqu'à l'E13 approuvée et la CI verte (OPT-16). Chaque développeur a son worktree et sa branche et pousse sa seule branche (push simple, jamais `--force`, jamais `lot/*` ni `main`, OPT-17) ; Jarvis ouvre les PR. Le dossier principal reste sur `lot/LOT-001`, propre.
- **Fusion (autorisation du commanditaire, 2026-11-07)** : Jarvis peut fusionner lui-même les PR vers `lot/LOT-001` avec l'outil GitHub `merge_pull_request` (fusion classique, jamais de squash ni de force), uniquement après l'E13 approuvée et la CI verte sur les 6 jobs du dernier commit (lue par Jarvis), et il le dit au commanditaire. Les PR vers `main` (dont `lot/LOT-001` → `main`) restent fusionnées par le commanditaire. Un agent autre que Jarvis ne fusionne jamais. Au moindre conflit ou doute, s'arrêter et demander.
- Pas d'abonnement aux PR : lire la CI avec `GH_TOKEN= gh api`. Messages de 3 à 5 lignes.
- État des lieux : modifier `docs/etat-des-lieux-avancement.json` (champ `etape`, rang fusionné = 100 %), puis `python3 docs/outils/maj-etat-des-lieux.py`. Vérifier que TOUS les rangs fusionnés y sont marqués (le rang 7 avait été oublié le 2026-11-01).
- Aucun secret, aucune adresse e-mail dans le dépôt public.

## Commandes utiles
- `export PATH=$HOME/.local/node24/bin:$PATH`, `pnpm install --frozen-lockfile`, `pnpm verifier`, `pnpm test`, `TZ=UTC pnpm test:couverture`, `pnpm cucumber`, `pnpm build`.
- `RANG_COURANT=10 pnpm test` (rang en développement) ; `pnpm verifier:couverture-fichiers <rapport base> <racine base> origin/lot/LOT-001` (la couverture de la base se génère dans un worktree séparé sur `origin/lot/LOT-001`).
- `pnpm e2e` ; en local : `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome pnpm e2e`.
- PR : outils GitHub MCP (`create_pull_request`, `update_pull_request` avec `draft`).
