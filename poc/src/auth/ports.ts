/** Ports d'authentification (ADR-004), sous forme réduite pour le PoC. */

export const SCOPES_POC = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.file',
] as const;

/** Résultat d'une demande de jeton. Il ne porte jamais la valeur du jeton. */
export type EtatJeton =
  | {
      etat: 'jeton_obtenu';
      /** Échéance en millisecondes depuis l'époque, ou null si inconnue. */
      echeance: number | null;
      scopesAccordes: string[];
      hasGrantedAllScopes: boolean;
    }
  | { etat: 'interaction_requise'; codeErreur: string }
  | { etat: 'acces_revoque'; codeErreur: string }
  | { etat: 'hors_ligne'; codeErreur: string };

export interface Identite {
  email: string;
  nom: string;
}

export interface FournisseurJeton {
  /** Connexion avec consentement (interface Google possible). */
  connecter(scopes: readonly string[]): Promise<EtatJeton>;
  /** Demande de jeton sans interface imposée. */
  jetonSilencieux(scopes: readonly string[]): Promise<EtatJeton>;
  /** Valeur du jeton, réservée aux appels Drive. Ne jamais journaliser. */
  valeurJeton(): Promise<string | null>;
  identiteEnCache(): Identite | null;
  deconnecter(): Promise<void>;
  /** Web uniquement : adopte un jeton obtenu par redirection, pour les appels Drive. */
  adopterJeton?(jeton: string): void;
}

export function libelleEtat(etat: EtatJeton): string {
  switch (etat.etat) {
    case 'jeton_obtenu':
      return 'JetonObtenu';
    case 'interaction_requise':
      return 'InteractionRequise';
    case 'acces_revoque':
      return 'AccesGoogleRevoque';
    case 'hors_ligne':
      return 'HorsLigne';
  }
}

const CLE_IDENTITE = 'poc.identite';

export function lireIdentiteEnCache(
  stockage: Pick<Storage, 'getItem'> = localStorage,
): Identite | null {
  const brut = stockage.getItem(CLE_IDENTITE);
  if (brut === null) return null;
  try {
    return JSON.parse(brut) as Identite;
  } catch {
    return null;
  }
}

export function ecrireIdentiteEnCache(
  identite: Identite,
  stockage: Pick<Storage, 'setItem'> = localStorage,
): void {
  stockage.setItem(CLE_IDENTITE, JSON.stringify(identite));
}
