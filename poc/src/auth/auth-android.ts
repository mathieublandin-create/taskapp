import {
  ecrireIdentiteEnCache,
  lireIdentiteEnCache,
  type EtatJeton,
  type FournisseurJeton,
  type Identite,
} from './ports';
import type { ErreurNative, GoogleAuthNativePlugin, ResultatAutorisation } from './plugin-natif';

/** Traduit une erreur normalisée du plugin vers un état du port (ADR-004). */
export function traduireErreurNative(erreur: unknown): EtatJeton {
  const e = (erreur ?? {}) as ErreurNative;
  const codeErreur = `${e.code ?? 'AUTRE'}${e.data?.codeNatif ? `/${e.data.codeNatif}` : ''}`;
  switch (e.code) {
    case 'INTERACTION_REQUISE':
      return { etat: 'interaction_requise', codeErreur };
    case 'ACCES_REVOQUE':
      return { etat: 'acces_revoque', codeErreur };
    case 'HORS_LIGNE':
      return { etat: 'hors_ligne', codeErreur };
    default:
      // `AUTRE` : cause non établie, état par défaut ; le code natif brut reste dans `codeErreur`.
      return { etat: 'interaction_requise', codeErreur };
  }
}

export class FournisseurJetonAndroid implements FournisseurJeton {
  private autorise = false;
  private identite: Identite | null = lireIdentiteEnCache();

  constructor(private readonly plugin: GoogleAuthNativePlugin) {}

  async connecter(scopes: readonly string[]): Promise<EtatJeton> {
    try {
      const connexion = await this.plugin.signIn();
      this.identite = { email: connexion.email, nom: connexion.nom };
      ecrireIdentiteEnCache(this.identite);
      return await this.convertir(
        await this.plugin.authorizeInteractive({ scopes: [...scopes] }),
        scopes,
      );
    } catch (erreur) {
      return traduireErreurNative(erreur);
    }
  }

  async jetonSilencieux(scopes: readonly string[]): Promise<EtatJeton> {
    try {
      return await this.convertir(
        await this.plugin.authorizeSilently({ scopes: [...scopes] }),
        scopes,
      );
    } catch (erreur) {
      return traduireErreurNative(erreur);
    }
  }

  async valeurJeton(): Promise<string | null> {
    if (!this.autorise) return null;
    return (await this.plugin.getAccessToken()).accessToken;
  }

  identiteEnCache(): Identite | null {
    return this.identite;
  }

  async deconnecter(): Promise<void> {
    this.autorise = false;
    await this.plugin.signOut();
  }

  private async convertir(
    resultat: ResultatAutorisation,
    scopes: readonly string[],
  ): Promise<EtatJeton> {
    if (resultat.statut === 'INTERACTION_REQUISE') {
      return { etat: 'interaction_requise', codeErreur: 'INTERACTION_REQUISE' };
    }
    this.autorise = true;
    return {
      etat: 'jeton_obtenu',
      echeance: resultat.echeance ?? null,
      scopesAccordes: resultat.scopesAccordes,
      hasGrantedAllScopes: scopes.every((s) => resultat.scopesAccordes.includes(s)),
    };
  }
}
