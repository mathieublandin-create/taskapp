/**
 * ANO-001 (ST-US-017 v0.4.3 §6.9) : `Application.observerSynchronisation` relaie les notifications du cycle de
 * l'espace ouvert et de son dépôt local, y compris d'un espace ouvert après l'abonnement (le contrôleur s'abonne avant
 * toute session).
 * UT-US-017-95, sur le banc (assemblerApplication, FauxGoogle, PlanificateurSimule).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { BancSynchro } from '@tests/support/banc/banc-synchro';
import { appliquerModifications } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { ecart, idObjectif } from '@tests/support/valeurs';

let banc: BancSynchro | undefined;

afterEach(() => {
  banc?.arreter();
  banc = undefined;
});

describe('Application.observerSynchronisation (ANO-001)', () => {
  it('UT-US-017-95 abonnement avant la connexion — notifié par le cycle d’ouverture, par une écriture locale, puis par le cycle sans geste qui suit ; plus après annulation', async () => {
    banc = new BancSynchro();
    const smartphone = banc.appareil('smartphone');
    const application = await smartphone.assurerOuverte();
    const cycles: Array<string | undefined> = [];
    const annuler = application.observerSynchronisation(() => {
      cycles.push(application.espace()?.cycle.etatMoteur().cycle);
    });

    const identite = banc.google.identite('A');
    smartphone.fournisseur.sessionGoogle(identite);
    smartphone.fournisseur.accorder(identite);
    const connexion = await banc.executerEnLaissantPasserLeTemps(
      application.seConnecter.executer(),
    );
    expect(connexion.ok).toBe(true);
    await smartphone.attendreCycle();
    expect(cycles.length).toBeGreaterThanOrEqual(2);
    expect(cycles.at(-1)).toBe('REPOS');

    const avantEcriture = cycles.length;
    await appliquerModifications(smartphone.service, (_etat, contexte) => [
      creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
    ]);
    // Écriture locale : notifiée sans cycle (l'indicateur passe à « en attente » sans attendre les 5 s).
    expect(cycles.slice(avantEcriture)).toEqual(['REPOS']);
    expect((await application.consulterEtat())?.enAttente).toBe(1);

    const avantCycle = cycles.length;
    await banc.avancerTemps(ecart(5_000));
    expect(cycles.slice(avantCycle)).toContain('EN_COURS');
    expect(cycles.at(-1)).toBe('REPOS');
    expect((await application.consulterEtat())?.enAttente).toBe(0);

    annuler();
    const apresAnnulation = cycles.length;
    await smartphone.echangerAvecLeDrive();
    expect(cycles).toHaveLength(apresAnnulation);
  });
});
