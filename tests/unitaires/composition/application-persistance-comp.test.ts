/**
 * ST-US-018 v0.4 §4.2, §6.3 n° 2 et 3 (rang 12, tranche B1), tests complémentaires de Bruce, sur le banc :
 * `Application.etatPersistance` repose sur une seule `DemanderPersistance` par application et sur le drapeau de la
 * base technique, qui survit à la fermeture de l'application. UT-COMP-US-018-8 et 9.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { BancSynchro } from '@tests/support/banc/banc-synchro';

let banc: BancSynchro | undefined;

afterEach(() => {
  banc?.arreter();
  banc = undefined;
});

describe('Composition — persistance du stockage (rang 12, B1)', () => {
  it('UT-COMP-US-018-8 premier lancement, sans espace ouvert — appels concurrents : une seule demande au navigateur, même état rendu', async () => {
    banc = new BancSynchro();
    const smartphone = banc.appareil('smartphone');
    smartphone.persistance.changerEtat('NON_PERSISTANT');
    const application = await smartphone.assurerOuverte();
    expect(application.espace()).toBeUndefined();

    const etats = await Promise.all([application.etatPersistance(), application.etatPersistance()]);

    expect(etats).toEqual(['PERSISTANT', 'PERSISTANT']);
    expect(smartphone.persistance.appelsDemander).toBe(1);
    expect(smartphone.persistance.appelsEtat).toBe(0);
  });

  it('UT-COMP-US-018-9 application rouverte — la demande n’est pas refaite ; l’état est relu et suit le navigateur', async () => {
    banc = new BancSynchro();
    const smartphone = banc.appareil('smartphone');
    smartphone.persistance.changerEtat('NON_PERSISTANT');
    await smartphone.assurerOuverte();
    await smartphone.application.etatPersistance();
    smartphone.fermerApplication();
    smartphone.persistance.changerEtat('NON_PERSISTANT');

    await smartphone.ouvrirApplication();
    const rouverte = await smartphone.application.etatPersistance();
    smartphone.persistance.changerEtat('PERSISTANT');
    const ensuite = await smartphone.application.etatPersistance();

    expect([rouverte, ensuite]).toEqual(['NON_PERSISTANT', 'PERSISTANT']);
    expect(smartphone.persistance.appelsDemander).toBe(1);
    expect(smartphone.persistance.appelsEtat).toBe(2);
  });
});
