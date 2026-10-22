import {
  ecrireIdentiteEnCache,
  lireIdentiteEnCache,
  type EtatJeton,
  type FournisseurJeton,
  type Identite,
} from './ports';

const URL_GIS = 'https://accounts.google.com/gsi/client';
const URL_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo';

/** Charge le script GIS à la demande (jamais au démarrage : R12). */
export function chargerScriptGis(): Promise<void> {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_GIS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script_gis_indisponible'));
    document.head.appendChild(script);
  });
}

type Prompt = '' | 'consent' | 'none';

/**
 * Seul `invalid_grant` établit une révocation. `access_denied` (refus dans la fenêtre) et les codes
 * inconnus sont ramenés à `interaction_requise` par défaut : la cause n'est pas établie, le code brut
 * (conservé dans `codeErreur`) fait foi pour interpréter le journal.
 */
function traduireErreur(codeErreur: string): EtatJeton {
  if (codeErreur === 'invalid_grant') {
    return { etat: 'acces_revoque', codeErreur };
  }
  return { etat: 'interaction_requise', codeErreur };
}

export class FournisseurJetonWeb implements FournisseurJeton {
  private jeton: string | null = null;
  private identite: Identite | null = lireIdentiteEnCache();

  constructor(
    private readonly clientId: string,
    private readonly appelerFetch: typeof fetch = (...args) => fetch(...args),
    private readonly chargerGis: () => Promise<void> = chargerScriptGis,
  ) {}

  connecter(scopes: readonly string[]): Promise<EtatJeton> {
    return this.demander(scopes, 'consent');
  }

  jetonSilencieux(scopes: readonly string[]): Promise<EtatJeton> {
    return this.demander(scopes, '');
  }

  async valeurJeton(): Promise<string | null> {
    return this.jeton;
  }

  identiteEnCache(): Identite | null {
    return this.identite;
  }

  adopterJeton(jeton: string): void {
    this.jeton = jeton;
  }

  async deconnecter(): Promise<void> {
    this.jeton = null;
  }

  private async demander(scopes: readonly string[], prompt: Prompt): Promise<EtatJeton> {
    try {
      await this.chargerGis();
    } catch {
      return { etat: 'hors_ligne', codeErreur: 'script_gis_indisponible' };
    }
    const reponse = await this.appelerGis(scopes, prompt);
    if ('etat' in reponse) return reponse;
    this.jeton = reponse.access_token;
    const accordes = reponse.scope.split(' ').filter((s) => s !== '');
    await this.memoriserIdentite();
    return {
      etat: 'jeton_obtenu',
      echeance: Date.now() + Number(reponse.expires_in) * 1000,
      scopesAccordes: accordes,
      hasGrantedAllScopes: google.accounts.oauth2.hasGrantedAllScopes(
        reponse,
        scopes[0] ?? '',
        ...scopes.slice(1),
      ),
    };
  }

  private appelerGis(
    scopes: readonly string[],
    prompt: Prompt,
  ): Promise<google.accounts.oauth2.TokenResponse | EtatJeton> {
    return new Promise((resolve) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: scopes.join(' '),
        callback: (reponse) => {
          if (reponse.error) resolve(traduireErreur(reponse.error));
          else resolve(reponse);
        },
        error_callback: (erreur) => resolve(traduireErreur(erreur.type)),
      });
      client.requestAccessToken({ prompt });
    });
  }

  private async memoriserIdentite(): Promise<void> {
    if (this.jeton === null) return;
    try {
      const reponse = await this.appelerFetch(URL_USERINFO, {
        headers: { Authorization: `Bearer ${this.jeton}` },
      });
      if (!reponse.ok) return;
      const donnees = (await reponse.json()) as { email?: string; name?: string };
      this.identite = { email: donnees.email ?? '', nom: donnees.name ?? '' };
      ecrireIdentiteEnCache(this.identite);
    } catch {
      // Identité non critique pour la mesure : on garde celle du cache.
    }
  }
}
