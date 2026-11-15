import type { RetourGoogle } from '../compte/application/ports/fournisseur-auth';
import { FournisseurAuthTestIhm } from './test-ihm/fournisseur-auth-test-ihm';
import { lirePonts } from './test-ihm/ponts';
import { TransportParPont } from './test-ihm/transport-par-pont';
import { demarrerWeb as demarrerAvec, type DemarrageWeb, type Navigateur } from './web';

// ST-US-018 v0.4 §3 n° 21, §6.4 n° 5, §6.5 (rang 12, tranche B2). Composition de la chaîne `@ihm` : construite par
// `vite build --mode test-ihm` seulement, qui substitue ce module à `web.ts` dans `main.tsx` (alias de
// `vite.config.ts`). Jamais importée par un autre module de `src/` (dependency-cruiser) ni présente dans le build de
// production. Aucun secret, aucun jeton réel : Google et le Drive sont simulés par le processus cucumber, derrière les
// bindings de la page.

/** Environnement imposé : la composition de test n'écrit jamais dans les espaces de production. */
const ENV_TEST_IHM = 'recette';

/**
 * Même signature que `demarrerWeb` de `web.ts` ; seules changent les fabriques du fournisseur (Google simulé, sans
 * redirection) et du transport (pont du `FauxDrive`). Binding absent → `ErreurProgrammation` avant toute ouverture.
 */
export const demarrerWeb = (retour: RetourGoogle, navigateur: Navigateur): DemarrageWeb => {
  const ponts = lirePonts(window);
  return demarrerAvec(
    retour,
    { ...navigateur, variables: { ...navigateur.variables, VITE_ENV: ENV_TEST_IHM } },
    {
      fournisseur:
        (_configuration, { reseau, horloge }) =>
        ({ coffre }) =>
          new FournisseurAuthTestIhm({ pont: ponts.google, reseau, coffre, horloge }),
      transport:
        ({ reseau }) =>
        () =>
          new TransportParPont({ pont: ponts.drive, reseau }),
    },
  );
};
