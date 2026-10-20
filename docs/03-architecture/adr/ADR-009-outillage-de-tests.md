# ADR-009 — Outillage de tests : Vitest, cucumber-js en français, Playwright, simulateurs Google

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | Workflow E5, E10, E12, E14 ; DAT §3.2 et §3.3 |

## Contexte
Le workflow impose deux familles de tests automatisés :
- des tests unitaires écrits en TDD par Anthony, qui font foi ;
- des tests métiers en Gherkin français (`# language: fr`), exécutés avec Cucumber et tagués `@US`, `@RG` et `@LOT`.

La synchronisation entre appareils, le hors ligne et l'intégration Google sont les zones de risque majeures. Elles doivent être testables sans réseau et de façon déterministe, en intégration continue.

## Options étudiées
- **Unitaires** : Vitest (natif Vite, rapide, TypeScript) ou Jest (configuration plus lourde avec Vite et ESM).
- **Métiers** : cucumber-js (Gherkin français natif, *step definitions* en TypeScript), ou playwright-bdd ou Cypress-cucumber (liés à l'interface, plus lents et plus fragiles).
- **Niveau d'exécution des scénarios** : l'interface (boîte noire, coûteux, instable) ou la **couche application**, avec des adaptateurs simulés (rapide et déterministe).
- **Bout en bout** : Playwright ou Cypress.

## Décision
- **Vitest** pour les tests unitaires, avec `@testing-library/react` et `fake-indexeddb`.
- **cucumber-js** pour les fichiers `.feature` de `tests/features/`. Les scénarios s'exécutent sur la **couche application**, avec des simulateurs en mémoire :
  - `FauxDrive` (partagé entre plusieurs appareils simulés) ;
  - `FauxAgenda` (avec injection d'erreurs 401, 409, 410, 429 et 5xx) ;
  - `HorlogeSimulee` (avec décalage par appareil) ;
  - `ReseauSimule` (connecté ou coupé).
- **MSW** pour les tests de contrat des adaptateurs REST de Google.
- **Playwright**, avec axe, pour quelques parcours de bout en bout sur la PWA, dont le mode hors ligne.
- **Intégration continue** : tous ces tests sont bloquants, ainsi que le lint et le typage.

L'emplacement des *step definitions*, le nommage et les seuils de couverture sont fixés par Anthony dans `conventions.md`. La proposition de départ est de 90 % pour `domaine` et `synchro`, et de 80 % pour l'ensemble.

## Conséquences
- \+ Les scénarios multi-appareils et de conflit s'expriment en Gherkin, par exemple : « Étant donné le smartphone hors ligne… Quand le PC modifie… Alors… ».
- \+ La suite est rapide, sans réseau ni compte Google.
- − Il faut maintenir des simulateurs fidèles à Google. Les tests de contrat MSW et la recette sur appareil réel avec le compte de recette compensent ce risque.
- − Les écrans sont couverts par les tests de composants et par Playwright, et non par Cucumber.
