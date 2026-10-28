import type { IdCompte } from '../../domaine/identite';

// conventions.md §9.3 : `donejuan-<env>-<SHA-256 hexadécimal du sub>` ; ni sub ni adresse dans un nom.
export type NomEnvironnement = 'dev' | 'recette' | 'production';

/** Préfixe commun des espaces de compte d'un environnement. */
export const prefixeEspaces = (env: NomEnvironnement): string => `donejuan-${env}-`;

/** Vrai pour un nom d'espace de compte de l'environnement (préfixe puis 64 caractères hexadécimaux). */
export const estNomEspace = (env: NomEnvironnement, nom: string): boolean =>
  nom.startsWith(prefixeEspaces(env)) &&
  /^[0-9a-f]{64}$/.test(nom.slice(prefixeEspaces(env).length));

export const nomEspace = async (env: NomEnvironnement, compte: IdCompte): Promise<string> => {
  const empreinte = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(compte));
  const hexadecimal = Array.from(new Uint8Array(empreinte), (o) =>
    o.toString(16).padStart(2, '0'),
  ).join('');
  return `${prefixeEspaces(env)}${hexadecimal}`;
};
