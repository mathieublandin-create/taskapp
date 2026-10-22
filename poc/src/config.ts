export interface ConfigPoc {
  clientIdWeb: string;
  basePath: string;
  origine: string;
  proprieteApp: string;
  nomDossier: string;
}

export class ErreurConfiguration extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurConfiguration';
  }
}

export type Environnement = Record<string, string | boolean | undefined>;

const PROPRIETE_APP_PAR_DEFAUT = 'objectifs-taches-poc';
const NOM_DOSSIER_PAR_DEFAUT = 'Done Juan (POC)';

function lireTexte(env: Environnement, nom: string, defaut = ''): string {
  const valeur = env[nom];
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur.trim() : defaut;
}

/** Lit et valide les variables d'environnement. Échoue si l'ID client Web est vide. */
export function lireConfig(env: Environnement): ConfigPoc {
  const clientIdWeb = lireTexte(env, 'VITE_GOOGLE_WEB_CLIENT_ID');
  if (clientIdWeb === '') {
    throw new ErreurConfiguration(
      'VITE_GOOGLE_WEB_CLIENT_ID est vide : renseigner la variable (voir poc/.env.example) puis reconstruire.',
    );
  }
  return {
    clientIdWeb,
    basePath: lireTexte(env, 'VITE_BASE_PATH', '/'),
    origine: lireTexte(env, 'VITE_APP_ORIGIN', '(non renseignée)'),
    proprieteApp: lireTexte(env, 'VITE_POC_APP_PROPERTY', PROPRIETE_APP_PAR_DEFAUT),
    nomDossier: lireTexte(env, 'VITE_POC_FOLDER_NAME', NOM_DOSSIER_PAR_DEFAUT),
  };
}
