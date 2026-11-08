/**
 * Composition de l'incrément 4 sur le banc (ST-US-017 v0.11 §6.8 n° 3, 5, 10, 16 ; rang 11, tranche D3), tests
 * complémentaires de Benjamin : un suivi d'horloge par espace (abonné aux échanges, arrêté à la fermeture), correction
 * lue et contrôlée par l'application, « Mettre à jour » sans espace, relais des échanges.
 * UT-COMP-US-017-4-72 à 4-77.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EchangeGoogle } from '@src/commun/application/ports/observateur-echanges-google';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { RelaisEchangesGoogle } from '@src/composition/application';
import { BancSynchro } from '@tests/support/banc/banc-synchro';
import type { AppareilSimule } from '@tests/support/banc/appareil-simule';
import { objectifsDe } from '@tests/support/objectifs';

const VINGT_CINQ_HEURES = 25 * 3_600_000;
const DEUX_HEURES = 2 * 3_600_000;
const UNE_SECONDE = 1_000;

let banc: BancSynchro | undefined;

afterEach(() => {
  banc?.arreter();
  banc = undefined;
});

/** Suivi d'horloge de l'espace ouvert (attend la fin des mesures reçues). */
const traitementsTermines = async (appareil: AppareilSimule): Promise<void> => {
  const espace = appareil.application.espace();
  expect(espace).toBeDefined();
  await espace?.suivi.traitementsTermines();
};

/** Smartphone connecté au compte A (cycle d'ouverture terminé, mesures de l'horloge traitées). */
const connecter = async (decalage: number): Promise<AppareilSimule> => {
  banc = new BancSynchro();
  const smartphone = banc.appareil('smartphone');
  smartphone.horloge.dereglerDe(EcartTemps.depuisMillisecondes(decalage));
  const application = await smartphone.assurerOuverte();
  const identite = banc.google.identite('A');
  smartphone.fournisseur.sessionGoogle(identite);
  smartphone.fournisseur.accorder(identite);
  const connexion = await banc.executerEnLaissantPasserLeTemps(application.seConnecter.executer());
  expect(connexion.ok).toBe(true);
  await smartphone.attendreCycle();
  await smartphone.cycle.synchroniserMaintenant();
  await traitementsTermines(smartphone);
  return smartphone;
};

describe('Composition — horloge et mise à jour (rang 11, D3)', () => {
  it('UT-COMP-US-017-4-72 lireCorrectionHorloge — la mesure d’un échange avec Google, relayée au suivi de l’espace, donne la correction (Date − heure de l’appareil), à une seconde près', async () => {
    const smartphone = await connecter(-VINGT_CINQ_HEURES);

    const correction = await smartphone.application.lireCorrectionHorloge();

    expect(Math.abs((correction ?? 0) - VINGT_CINQ_HEURES)).toBeLessThanOrEqual(UNE_SECONDE);
  });

  it('UT-COMP-US-017-4-73 lireCorrectionHorloge — undefined sans espace ouvert', async () => {
    banc = new BancSynchro();
    const application = await banc.appareil('smartphone').assurerOuverte();

    expect(await application.lireCorrectionHorloge()).toBeUndefined();
  });

  it('UT-COMP-US-017-4-74 consulterEtat — plusAncienneEnAttente est ramenée à l’heure de l’appareil (n° 5) : elle suit Horloge.maintenant(), pas l’heure corrigée', async () => {
    const smartphone = await connecter(-VINGT_CINQ_HEURES);
    const creation = await (
      await objectifsDe(smartphone)
    ).creerObjectif.executer({ intitule: 'Publier le guide' });
    expect(creation.ok).toBe(true);

    const etat = await smartphone.application.consulterEtat();

    const plusAncienne = Number(etat?.plusAncienneEnAttente);
    expect(Math.abs(plusAncienne - Number(smartphone.horloge.maintenant()))).toBeLessThanOrEqual(
      UNE_SECONDE,
    );
  });

  it('UT-COMP-US-017-4-75 controlerHorloge — contrôle le saut de l’horloge de l’espace (recul corrigé exactement) ; sans effet sans espace', async () => {
    banc = new BancSynchro();
    await banc.appareil('pc').assurerOuverte();
    await expect(banc.appareil('pc').application.controlerHorloge()).resolves.toBeUndefined();
    banc.arreter();
    const smartphone = await connecter(0);
    const avant = (await smartphone.application.lireCorrectionHorloge()) ?? 0;

    smartphone.horloge.changerHeureMurale(EcartTemps.depuisMillisecondes(-DEUX_HEURES));
    await smartphone.application.controlerHorloge();
    await traitementsTermines(smartphone);

    const apres = (await smartphone.application.lireCorrectionHorloge()) ?? 0;
    expect(apres - avant).toBe(DEUX_HEURES);
  });

  it('UT-COMP-US-017-4-76 fermeture de l’espace — le suivi d’horloge est désabonné des échanges avec Google', async () => {
    banc = new BancSynchro();
    const smartphone = banc.appareil('smartphone');
    const desabonnements = vi.fn();
    const observer = smartphone.echangesGoogle.observer.bind(smartphone.echangesGoogle);
    vi.spyOn(smartphone.echangesGoogle, 'observer').mockImplementation((observateur) => {
      const annuler = observer(observateur);
      return () => {
        desabonnements();
        annuler();
      };
    });
    const application = await smartphone.assurerOuverte();
    const identite = banc.google.identite('A');
    smartphone.fournisseur.sessionGoogle(identite);
    smartphone.fournisseur.accorder(identite);
    await banc.executerEnLaissantPasserLeTemps(application.seConnecter.executer());
    await smartphone.attendreCycle();
    expect(desabonnements).not.toHaveBeenCalled();

    smartphone.fermerApplication();

    expect(desabonnements).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-017-4-77 mettreAJour — appelle le port de l’application sans espace requis ; RelaisEchangesGoogle diffuse à tous les observateurs jusqu’à leur annulation', async () => {
    banc = new BancSynchro();
    const smartphone = banc.appareil('smartphone');
    const application = await smartphone.assurerOuverte();

    const issue = await application.mettreAJour();

    expect([issue, smartphone.miseAJour.appels]).toEqual(['RECHARGEMENT_LANCE', 1]);
    const relais = new RelaisEchangesGoogle();
    const recus: Array<EchangeGoogle> = [];
    const echange = { date: undefined } as EchangeGoogle;
    const annuler = relais.observer({ surReponse: (e) => recus.push(e) });
    relais.surReponse(echange);
    annuler();
    relais.surReponse(echange);
    expect(recus).toEqual([echange]);
  });
});
