/**
 * « Mettre à jour » (RG-058 ; DAT §4.2, Q-US-017-10 a, ADR-013 ; ST-US-017 v0.11 §6.8 n° 10) : vérification d'une
 * nouvelle version par le service worker, activation de la version en attente, rechargement. UT-US-017-126 (rang 11,
 * tranche D1).
 */
import { describe, expect, it, vi } from 'vitest';
import {
  MiseAJourServiceWorker,
  type ConteneurServiceWorker,
  type EnregistrementServiceWorker,
} from '@src/synchronisation/infrastructure/mise-a-jour-service-worker';

const conteneur = (enregistrement: EnregistrementServiceWorker | undefined) => {
  const rappels: Array<() => void> = [];
  const c: ConteneurServiceWorker & { declencher: () => void } = {
    getRegistration: () => Promise.resolve(enregistrement),
    addEventListener: (_type, rappel) => {
      rappels.push(rappel);
    },
    declencher: () => {
      rappels.forEach((r) => {
        r();
      });
    },
  };
  return c;
};

describe('MiseAJourServiceWorker (ST-US-017 v0.11 §6.8 n° 10)', () => {
  it('UT-US-017-126 version en attente : update, SKIP_WAITING envoyé à la version en attente, rechargement au changement de contrôleur, RECHARGEMENT_LANCE', async () => {
    const postMessage = vi.fn();
    const update = vi.fn(() => Promise.resolve(undefined));
    const c = conteneur({ update, waiting: { postMessage } });
    const recharger = vi.fn();

    expect(await new MiseAJourServiceWorker({ conteneur: c, recharger }).mettreAJour()).toBe(
      'RECHARGEMENT_LANCE',
    );
    expect(update).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(recharger).not.toHaveBeenCalled();
    c.declencher();
    expect(recharger).toHaveBeenCalledTimes(1);
  });

  it('UT-US-017-126 aucune version en attente, aucun enregistrement ou aucun service worker : AUCUNE_VERSION sans rechargement ; update en échec : ECHEC ; jamais d’exception', async () => {
    const recharger = vi.fn();
    const sansAttente = conteneur({ update: () => Promise.resolve(undefined), waiting: null });
    expect(
      await new MiseAJourServiceWorker({ conteneur: sansAttente, recharger }).mettreAJour(),
    ).toBe('AUCUNE_VERSION');
    expect(
      await new MiseAJourServiceWorker({
        conteneur: conteneur(undefined),
        recharger,
      }).mettreAJour(),
    ).toBe('AUCUNE_VERSION');
    expect(
      await new MiseAJourServiceWorker({ conteneur: undefined, recharger }).mettreAJour(),
    ).toBe('AUCUNE_VERSION');
    const enPanne = conteneur({
      update: () => Promise.reject(new TypeError('Failed to update a ServiceWorker')),
      waiting: { postMessage: vi.fn() },
    });
    expect(await new MiseAJourServiceWorker({ conteneur: enPanne, recharger }).mettreAJour()).toBe(
      'ECHEC',
    );
    expect(recharger).not.toHaveBeenCalled();
  });
});
