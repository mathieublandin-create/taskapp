/**
 * ST-US-018 v0.4 §4.3, §6.1 (rang 12, tranche D2) : enregistrement du service worker (après RED-02, par `main.tsx`) et
 * détection d'une version en attente, sans rechargement forcé.
 */
import { describe, expect, it } from 'vitest';
import {
  enregistrerServiceWorker,
  type ConteneurEnregistrement,
  type EnregistrementObserve,
  type TravailleurInstallation,
} from '@src/synchronisation/infrastructure/enregistrement-service-worker';
import { JournalTechniqueMemoire } from '../../../doublures/journal-technique-memoire';

class TravailleurSimule implements TravailleurInstallation {
  state = 'installing';
  readonly #rappels: Array<() => void> = [];

  addEventListener(_type: 'statechange', rappel: () => void): void {
    this.#rappels.push(rappel);
  }

  passerA(etat: string): void {
    this.state = etat;
    this.#rappels.forEach((rappel) => {
      rappel();
    });
  }
}

class EnregistrementSimule implements EnregistrementObserve {
  waiting: object | null = null;
  installing: TravailleurInstallation | null = null;
  readonly #rappels: Array<() => void> = [];

  addEventListener(_type: 'updatefound', rappel: () => void): void {
    this.#rappels.push(rappel);
  }

  trouverMiseAJour(travailleur: TravailleurSimule): void {
    this.installing = travailleur;
    this.#rappels.forEach((rappel) => {
      rappel();
    });
  }
}

const conteneur = (
  controller: object | null,
  enregistrement: EnregistrementSimule | Error,
): ConteneurEnregistrement & {
  readonly appels: Array<{ readonly url: string; readonly scope: string }>;
} => {
  const appels: Array<{ readonly url: string; readonly scope: string }> = [];
  return {
    appels,
    controller,
    register: (url, options) => {
      appels.push({ url, scope: options.scope });
      return enregistrement instanceof Error
        ? Promise.reject(enregistrement)
        : Promise.resolve(enregistrement);
    },
  };
};

const PAGE_CONTROLEE = {};

const enregistrer = async (c: ConteneurEnregistrement | undefined) => {
  const journal = new JournalTechniqueMemoire();
  let nouvelles = 0;
  await enregistrerServiceWorker({
    conteneur: c,
    base: '/taskapp/',
    journal,
    surNouvelleVersion: () => {
      nouvelles += 1;
    },
  });
  return { journal, nouvelles: () => nouvelles };
};

describe('enregistrerServiceWorker (ST-US-018 §6.1)', () => {
  it('UT-US-018-12 enregistrement — une fois, `${base}sw.js` avec la portée base ; aucune nouvelle version annoncée sans attente', async () => {
    const c = conteneur(PAGE_CONTROLEE, new EnregistrementSimule());

    const { nouvelles, journal } = await enregistrer(c);

    expect(c.appels).toEqual([{ url: '/taskapp/sw.js', scope: '/taskapp/' }]);
    expect(nouvelles()).toBe(0);
    expect(journal.entrees()).toEqual([]);
  });

  it('UT-US-018-12 navigateur sans service worker — rien n’est fait, aucune erreur', async () => {
    const { nouvelles, journal } = await enregistrer(undefined);

    expect(nouvelles()).toBe(0);
    expect(journal.entrees()).toEqual([]);
  });

  it('UT-US-018-12 version déjà en attente à l’enregistrement — annoncée une fois', async () => {
    const enregistrement = new EnregistrementSimule();
    enregistrement.waiting = {};

    const { nouvelles } = await enregistrer(conteneur(PAGE_CONTROLEE, enregistrement));

    expect(nouvelles()).toBe(1);
  });

  it('UT-US-018-12 mise à jour trouvée pendant l’utilisation — annoncée quand le nouveau service worker est « installed », pas avant', async () => {
    const enregistrement = new EnregistrementSimule();
    const { nouvelles } = await enregistrer(conteneur(PAGE_CONTROLEE, enregistrement));
    const travailleur = new TravailleurSimule();

    enregistrement.trouverMiseAJour(travailleur);
    expect(nouvelles()).toBe(0);
    travailleur.passerA('installed');

    expect(nouvelles()).toBe(1);
  });

  it('UT-US-018-12 premier chargement (page non contrôlée) — l’installation initiale n’est jamais annoncée comme nouvelle version', async () => {
    const enregistrement = new EnregistrementSimule();
    const { nouvelles } = await enregistrer(conteneur(null, enregistrement));
    const travailleur = new TravailleurSimule();

    enregistrement.trouverMiseAJour(travailleur);
    travailleur.passerA('installed');
    travailleur.passerA('activated');

    expect(nouvelles()).toBe(0);
  });

  it('UT-US-018-12 échec de register — consigné en avertissement (nom de l’erreur seul), sans rejet', async () => {
    const { nouvelles, journal } = await enregistrer(
      conteneur(PAGE_CONTROLEE, new DOMException('refus', 'SecurityError')),
    );

    expect(nouvelles()).toBe(0);
    expect(journal.entrees()).toEqual([
      {
        niveau: 'avertissement',
        evenement: 'EnregistrementServiceWorkerEnEchec',
        champs: { erreur: 'SecurityError' },
      },
    ]);
  });
});
