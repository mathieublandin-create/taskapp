import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import type { Plateforme } from './auth/strategie-geste';
import { uriRedirection } from './auth/url-autorisation';
import type { NomEnvironnement } from './espaces/nom-espace';

// ST-US-022 §3.2 n° 31 ; conventions.md §9.1 : variables publiques de construction (VITE_*), aucun secret.
export type Configuration = {
  readonly env: NomEnvironnement;
  readonly clientId: string;
  readonly cheminDeBase: string;
  readonly origine: string;
  readonly redirectUri: string;
  readonly plateforme: Plateforme;
};

const ENVIRONNEMENTS: ReadonlySet<string> = new Set(['dev', 'recette', 'production']);

const exiger = (variables: Readonly<Record<string, unknown>>, nom: string): string => {
  const valeur = variables[nom];
  if (typeof valeur !== 'string' || valeur === '') {
    throw new ErreurProgrammation(`Variable de construction absente : ${nom}`);
  }
  return valeur;
};

/** `web-ios` : Safari sur iPhone ou iPad (y compris un iPad qui se présente comme un Mac tactile). */
export const plateformeDepuisAgent = (agent: string, pointsTactiles = 0): Plateforme =>
  /iPhone|iPad|iPod/.test(agent) || (agent.includes('Macintosh') && pointsTactiles > 1)
    ? 'web-ios'
    : 'web';

/** Configuration absente ou invalide : ErreurProgrammation (défaut de construction, jamais de l'utilisateur). */
export const lireConfiguration = (
  variables: Readonly<Record<string, unknown>>,
  navigateur: { readonly agent: string; readonly pointsTactiles?: number },
): Configuration => {
  const env = exiger(variables, 'VITE_ENV');
  if (!ENVIRONNEMENTS.has(env)) throw new ErreurProgrammation(`VITE_ENV invalide : ${env}`);
  const cheminDeBase = exiger(variables, 'VITE_BASE_PATH');
  const origine = exiger(variables, 'VITE_APP_ORIGIN');
  return {
    env: env as NomEnvironnement,
    clientId: exiger(variables, 'VITE_GOOGLE_WEB_CLIENT_ID'),
    cheminDeBase,
    origine,
    redirectUri: uriRedirection({ origine, cheminDeBase }),
    plateforme: plateformeDepuisAgent(navigateur.agent, navigateur.pointsTactiles),
  };
};
