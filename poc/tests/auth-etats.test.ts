import { describe, expect, it, vi } from 'vitest';
import { FournisseurJetonAndroid, traduireErreurNative } from '../src/auth/auth-android';
import type { GoogleAuthNativePlugin } from '../src/auth/plugin-natif';
import { libelleEtat, SCOPES_POC } from '../src/auth/ports';

function pluginSimule(surcharge: Partial<GoogleAuthNativePlugin> = {}): GoogleAuthNativePlugin {
  return {
    signIn: vi.fn(async () => ({ email: 'a@b.test', nom: 'A' })),
    authorizeSilently: vi.fn(async () => ({
      statut: 'OK' as const,
      echeance: 1_800_000_000_000,
      scopesAccordes: [...SCOPES_POC],
    })),
    authorizeInteractive: vi.fn(async () => ({
      statut: 'OK' as const,
      scopesAccordes: [...SCOPES_POC],
    })),
    getAccessToken: vi.fn(async () => ({ accessToken: 'valeur' })),
    signatureInfo: vi.fn(),
    signOut: vi.fn(async () => undefined),
    clearAuthorizationState: vi.fn(async () => undefined),
    ...surcharge,
  };
}

describe('états du port FournisseurJeton (ADR-004), côté Android', () => {
  it('jeton obtenu : échéance et scopes, sans valeur de jeton dans l’état', async () => {
    const auth = new FournisseurJetonAndroid(pluginSimule());
    const etat = await auth.jetonSilencieux(SCOPES_POC);
    expect(etat).toEqual({
      etat: 'jeton_obtenu',
      echeance: 1_800_000_000_000,
      scopesAccordes: [...SCOPES_POC],
      hasGrantedAllScopes: true,
    });
    expect(JSON.stringify(etat)).not.toContain('valeur');
    expect(await auth.valeurJeton()).toBe('valeur');
  });

  it('interaction requise quand le plugin la signale, sans interface', async () => {
    const plugin = pluginSimule({
      authorizeSilently: vi.fn(async () => ({
        statut: 'INTERACTION_REQUISE' as const,
        scopesAccordes: [],
      })),
    });
    const etat = await new FournisseurJetonAndroid(plugin).jetonSilencieux(SCOPES_POC);
    expect(libelleEtat(etat)).toBe('InteractionRequise');
    expect(plugin.authorizeInteractive).not.toHaveBeenCalled();
  });

  it('accès révoqué, hors ligne et code natif brut conservé', () => {
    expect(libelleEtat(traduireErreurNative({ code: 'ACCES_REVOQUE' }))).toBe('AccesGoogleRevoque');
    expect(libelleEtat(traduireErreurNative({ code: 'HORS_LIGNE' }))).toBe('HorsLigne');
    expect(traduireErreurNative({ code: 'AUTRE', data: { codeNatif: '12500' } })).toMatchObject({
      codeErreur: 'AUTRE/12500',
    });
  });

  it('signale hasGrantedAllScopes faux en cas de consentement partiel', async () => {
    const plugin = pluginSimule({
      authorizeSilently: vi.fn(async () => ({ statut: 'OK' as const, scopesAccordes: ['openid'] })),
    });
    const etat = await new FournisseurJetonAndroid(plugin).jetonSilencieux(SCOPES_POC);
    expect(etat).toMatchObject({ hasGrantedAllScopes: false });
  });

  it('ne fournit plus de jeton après déconnexion', async () => {
    const auth = new FournisseurJetonAndroid(pluginSimule());
    await auth.jetonSilencieux(SCOPES_POC);
    await auth.deconnecter();
    expect(await auth.valeurJeton()).toBeNull();
  });
});
