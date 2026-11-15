/**
 * ST-US-018 v0.4 §4.3, §6.1 n° 5 (rang 12, tranche D2), tests complémentaires de Benjamin : `signalerNouvelleVersion`
 * du contrôleur et invite `ALR-016` (guide v0.2.24 §6.6.15). UT-COMP-US-018-30 à 34.
 */
import { describe, expect, it } from 'vitest';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import type { IssueMiseAJour } from '@src/synchronisation/application/ports/mise-a-jour-application';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { instant } from '../../support/valeurs';
import { HORLOGE_ABSENTE } from '../../support/synchronisation/horloge-absente';

const MAINTENANT = instant('2026-11-09T08:00:00.000Z');
const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

const preparer = (etatSynchro: EtatSynchronisationLu | undefined, issue: IssueMiseAJour) => {
  const mises = { appels: 0 };
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(etatSynchro),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    ...HORLOGE_ABSENTE,
    mettreAJour: () => {
      mises.appels += 1;
      return Promise.resolve(issue);
    },
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    lireChoixRestauration: () => Promise.resolve(undefined),
    lireRestaurationFaiteIci: () => Promise.resolve(undefined),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(MAINTENANT));
  return { controleur: new ControleurInterface(application, horloge), mises };
};

const signaler = async (controleur: ControleurInterface): Promise<void> => {
  controleur.signalerNouvelleVersion();
  await controleur.rafraichissementsTermines();
};

describe('ControleurInterface — nouvelle version (ST-US-018 §6.1 n° 5)', () => {
  it('UT-COMP-US-018-30 version signalée — la feuille porte l’invite ALR-016 ; sans signalement, aucune invite', async () => {
    const { controleur } = preparer(ETAT, 'AUCUNE_VERSION');
    await controleur.rafraichir();
    expect(controleur.vue().feuille).not.toHaveProperty('alerteVersion');

    await signaler(controleur);

    expect(controleur.vue().feuille?.alerteVersion?.code).toBe('ALR-016');
  });

  it('UT-COMP-US-018-31 aucun autre signal — ni toast, ni bandeau, ni point sur l’indicateur, ni rechargement sans geste', async () => {
    const sans = preparer(ETAT, 'RECHARGEMENT_LANCE');
    await sans.controleur.rafraichir();
    const avec = preparer(ETAT, 'RECHARGEMENT_LANCE');
    await signaler(avec.controleur);

    const { toast, bandeau, indicateur, nonRetenues, miseAJour, consultationSeule } =
      avec.controleur.vue();
    expect(toast).toBeUndefined();
    expect(bandeau).toBeUndefined();
    expect(indicateur).toEqual(sans.controleur.vue().indicateur);
    expect(nonRetenues).toBeUndefined();
    expect(miseAJour).toBeUndefined();
    expect(consultationSeule).toBe(false);
    expect(avec.mises.appels).toBe(0);
  });

  it('UT-COMP-US-018-32 « Mettre à jour » — une seule demande au port, issue portée par la vue pour la ligne de retour ; l’invite reste jusqu’au rechargement', async () => {
    const { controleur, mises } = preparer(ETAT, 'RECHARGEMENT_LANCE');
    await signaler(controleur);

    await controleur.mettreAJour();

    expect(mises.appels).toBe(1);
    expect(controleur.vue().miseAJour).toBe('RECHARGEMENT_LANCE');
    expect(controleur.vue().feuille?.alerteVersion?.code).toBe('ALR-016');
    expect(controleur.vue().toast).toBeUndefined();
  });

  it('UT-COMP-US-018-33 consultation seule — la version signalée ne double pas la carte ERR-013 ; l’invite revient quand la consultation seule cesse', async () => {
    const lu = {
      current: { ...ETAT, actionRequise: 'FORMAT_PLUS_RECENT' } as EtatSynchronisationLu,
    };
    const application = {
      session: new SessionCourante(),
      consulterEtat: () => Promise.resolve(lu.current),
      lireElementsEnAttente: () => Promise.resolve([]),
      lireDernierContact: () => Promise.resolve(undefined),
      ...HORLOGE_ABSENTE,
      lireModificationsNonRetenues: () => Promise.resolve(undefined),
      lireChoixRestauration: () => Promise.resolve(undefined),
      lireRestaurationFaiteIci: () => Promise.resolve(undefined),
      observerSynchronisation: () => () => undefined,
      masquage: new MasquageRappel(),
    } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
    const controleur = new ControleurInterface(
      application,
      new HorlogeSimulee(new TempsSimule(MAINTENANT)),
    );

    await signaler(controleur);
    expect(controleur.vue().feuille).not.toHaveProperty('alerteVersion');
    expect(controleur.vue().feuille?.cartes.map((c) => c.message)).toEqual(['ERR-013']);

    lu.current = ETAT;
    await controleur.rafraichir();
    expect(controleur.vue().feuille?.alerteVersion?.code).toBe('ALR-016');
  });

  it('UT-COMP-US-018-34 version en attente — conservée aux recalculs suivants, jamais mémorisée : un nouveau contrôleur (rechargement) n’a pas d’invite', async () => {
    const { controleur } = preparer(ETAT, 'AUCUNE_VERSION');
    await signaler(controleur);

    await controleur.rafraichir();
    expect(controleur.vue().feuille?.alerteVersion?.code).toBe('ALR-016');

    const recharge = preparer(ETAT, 'AUCUNE_VERSION').controleur;
    await recharge.rafraichir();
    expect(recharge.vue().feuille).not.toHaveProperty('alerteVersion');
  });

  it('UT-COMP-US-018-34 sans espace ouvert — le signalement ne crée aucune feuille', async () => {
    const { controleur } = preparer(undefined, 'AUCUNE_VERSION');

    await signaler(controleur);

    expect(controleur.vue().feuille).toBeUndefined();
  });
});
