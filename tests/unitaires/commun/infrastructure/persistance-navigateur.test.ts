/** ST-US-018 v0.4 §4.1, §6.3 (rang 12, tranche B1) : adaptateur de `navigator.storage`. */
import { describe, expect, it } from 'vitest';
import {
  PersistanceNavigateur,
  type GestionnaireStockage,
} from '@src/commun/infrastructure/persistance-navigateur';

const gestionnaire = (
  persisted: () => Promise<boolean>,
  persist: () => Promise<boolean>,
): GestionnaireStockage & { readonly appels: Array<string> } => {
  const appels: Array<string> = [];
  return {
    appels,
    persisted: () => {
      appels.push('persisted');
      return persisted();
    },
    persist: () => {
      appels.push('persist');
      return persist();
    },
  };
};

describe('PersistanceNavigateur (ST-US-018 §6.3)', () => {
  it('UT-US-018-07 etat() — persisted() vrai → PERSISTANT, faux → NON_PERSISTANT ; persist() n’est pas appelé', async () => {
    const vrai = gestionnaire(
      () => Promise.resolve(true),
      () => Promise.resolve(false),
    );
    const faux = gestionnaire(
      () => Promise.resolve(false),
      () => Promise.resolve(true),
    );

    expect(await new PersistanceNavigateur(vrai).etat()).toBe('PERSISTANT');
    expect(await new PersistanceNavigateur(faux).etat()).toBe('NON_PERSISTANT');
    expect([...vrai.appels, ...faux.appels]).toEqual(['persisted', 'persisted']);
  });

  it('UT-US-018-07 demander() — persist() vrai → PERSISTANT, faux → NON_PERSISTANT ; persisted() n’est pas appelé', async () => {
    const accorde = gestionnaire(
      () => Promise.resolve(false),
      () => Promise.resolve(true),
    );
    const refuse = gestionnaire(
      () => Promise.resolve(true),
      () => Promise.resolve(false),
    );

    expect(await new PersistanceNavigateur(accorde).demander()).toBe('PERSISTANT');
    expect(await new PersistanceNavigateur(refuse).demander()).toBe('NON_PERSISTANT');
    expect([...accorde.appels, ...refuse.appels]).toEqual(['persist', 'persist']);
  });

  it('UT-US-018-07 API absente — INDISPONIBLE pour etat() et demander(), sans erreur', async () => {
    const adaptateur = new PersistanceNavigateur(undefined);

    await expect(adaptateur.etat()).resolves.toBe('INDISPONIBLE');
    await expect(adaptateur.demander()).resolves.toBe('INDISPONIBLE');
  });

  it('UT-US-018-07 rejet ou exception synchrone de l’API — INDISPONIBLE, jamais de rejet', async () => {
    const rejette = gestionnaire(
      () => Promise.reject(new Error('SecurityError')),
      () => Promise.reject(new Error('SecurityError')),
    );
    const leve: GestionnaireStockage = {
      persisted: () => {
        throw new TypeError('Illegal invocation');
      },
      persist: () => {
        throw new TypeError('Illegal invocation');
      },
    };

    await expect(new PersistanceNavigateur(rejette).etat()).resolves.toBe('INDISPONIBLE');
    await expect(new PersistanceNavigateur(rejette).demander()).resolves.toBe('INDISPONIBLE');
    await expect(new PersistanceNavigateur(leve).etat()).resolves.toBe('INDISPONIBLE');
    await expect(new PersistanceNavigateur(leve).demander()).resolves.toBe('INDISPONIBLE');
  });
});
