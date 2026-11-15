/**
 * Compléments de D1 (ST-US-017 v0.11 §6.8 n° 9, n° 10 ; RG-058) : lectures déléguées du décorateur, issue de commande,
 * robustesse de « Mettre à jour ». UT-COMP-US-017-4-09 à 4-13 (rang 11, tranche D1, Benjamin).
 */
import { describe, expect, it, vi } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { issueDe } from '@src/objectifs-taches/presentation/ui/etat/issues';
import { ServiceEtatLocalConsultationSeule } from '@src/synchronisation/application/service-etat-local-consultation-seule';
import type { ServiceEtatLocal } from '@src/synchronisation/application/service-etat-local';
import { MiseAJourServiceWorker } from '@src/synchronisation/infrastructure/mise-a-jour-service-worker';

const serviceFactice = () => {
  const mocks = {
    lire: vi.fn(() => Promise.resolve(succes('etat'))),
    lireJournal: vi.fn(() => Promise.resolve(succes([]))),
    lireDecompteEnAttente: vi.fn(() => Promise.resolve(succes({ nombre: 3 }))),
    modifier: vi.fn(() => Promise.resolve(succes('ok'))),
  };
  return { mocks, service: mocks as unknown as ServiceEtatLocal };
};

describe('Décorateur de consultation seule : compléments', () => {
  it('UT-COMP-US-017-4-09 en consultation seule, les trois lectures sont déléguées sans condition et `modifier` n’atteint pas le service', async () => {
    const { service, mocks } = serviceFactice();
    const decore = new ServiceEtatLocalConsultationSeule({
      service,
      estConsultationSeule: () => true,
    });

    await decore.lire();
    await decore.lireDecompteEnAttente();
    await decore.lireJournal({ type: 'OBJECTIF', id: 'o' } as never);
    await decore.modifier(() => succes({ modifications: [], valeur: 1 }));

    expect(mocks.lire).toHaveBeenCalledTimes(1);
    expect(mocks.lireDecompteEnAttente).toHaveBeenCalledTimes(1);
    expect(mocks.lireJournal).toHaveBeenCalledTimes(1);
    expect(mocks.modifier).not.toHaveBeenCalled();
  });

  it('UT-COMP-US-017-4-10 l’état de consultation seule est relu à chaque appel de `modifier`', async () => {
    const { service } = serviceFactice();
    const estConsultationSeule = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    const decore = new ServiceEtatLocalConsultationSeule({ service, estConsultationSeule });
    const decision = () => succes({ modifications: [], valeur: 1 });

    expect(await decore.modifier(decision)).toEqual(succes('ok'));
    expect(await decore.modifier(decision)).toEqual(echec({ type: 'ConsultationSeule' }));
    expect(estConsultationSeule).toHaveBeenCalledTimes(2);
  });

  it('UT-COMP-US-017-4-11 issueDe : un succès reste FAITE, ConsultationSeule n’est pas un refus métier', () => {
    expect(issueDe(succes('x'))).toEqual({ type: 'FAITE' });
    expect(issueDe(echec({ type: 'ConsultationSeule' } as const))).toEqual({
      type: 'CONSULTATION_SEULE',
    });
  });
});

describe('MiseAJourServiceWorker : compléments', () => {
  it('UT-COMP-US-017-4-12 un échec de `getRegistration` rend ECHEC sans exception ni rechargement', async () => {
    const recharger = vi.fn();
    const conteneur = {
      getRegistration: () => Promise.reject(new Error('indisponible')),
      addEventListener: vi.fn(),
    };

    expect(await new MiseAJourServiceWorker({ conteneur, recharger }).mettreAJour()).toBe('ECHEC');
    expect(conteneur.addEventListener).not.toHaveBeenCalled();
    expect(recharger).not.toHaveBeenCalled();
  });

  it('UT-COMP-US-017-4-13 l’abonnement au changement de contrôleur est unique (`once`) et précède l’envoi de SKIP_WAITING', async () => {
    const ordre: Array<string> = [];
    const conteneur = {
      getRegistration: () =>
        Promise.resolve({
          update: () => Promise.resolve(undefined),
          waiting: {
            postMessage: () => {
              ordre.push('message');
            },
          },
        }),
      addEventListener: vi.fn((_type: string, _rappel: () => void, options?: { once: boolean }) => {
        ordre.push(`abonnement:${String(options?.once)}`);
      }),
    };

    await new MiseAJourServiceWorker({ conteneur, recharger: vi.fn() }).mettreAJour();

    expect(ordre).toEqual(['abonnement:true', 'message']);
  });
});
