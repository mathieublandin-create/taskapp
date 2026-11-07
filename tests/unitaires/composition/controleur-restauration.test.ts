/**
 * Choix d'`ERR-012` vu par le contrôleur (ST-US-017 v0.10 §6.7 n° 9, 11, 16, 17 ; guide §6.6.4, §6.6.6) : vue du choix,
 * « Décider plus tard », gestes vers l'application, toast `TST-RESTAUREE`. Tests complémentaires de la tranche D3a.
 */
import { describe, expect, it, vi } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { h } from '../../support/synchronisation/ecritures-concurrentes';
import { instant, PC } from '../../support/valeurs';

const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  actionRequise: 'DONNEES_ABSENTES',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const SANS_ERREUR: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const COPIE = { objectifs: 2, taches: 5, derniereMiseAJour: instant('2026-10-30T08:00:00.000Z') };

const preparer = () => {
  const etat: { lu: EtatSynchronisationLu; restauree: Hlc | undefined } = {
    lu: ETAT,
    restauree: undefined,
  };
  const application = {
    session: new SessionCourante(),
    consulterEtat: () => Promise.resolve(etat.lu),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    lireChoixRestauration: () => Promise.resolve({ restaurationDemandee: false, copie: COPIE }),
    lireRestaurationFaiteIci: () => Promise.resolve(etat.restauree),
    demanderRestauration: vi.fn(() => Promise.resolve(succes('LANCEE' as const))),
    annulerRestauration: vi.fn(() => Promise.resolve(succes(undefined))),
    evaluerRepartirDeZero: vi.fn(() => Promise.resolve(succes({ n: 1 }))),
    repartirDeZero: vi.fn(() => Promise.resolve(succes(undefined))),
    observerSynchronisation: () => () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const controleur = new ControleurInterface(
    application,
    new HorlogeSimulee(new TempsSimule(instant('2026-11-01T08:00:00.000Z'))),
  );
  return { controleur, etat, application };
};

describe('ControleurInterface — choix de restauration (ERR-012)', () => {
  it('UT-COMP-US-017-3-09 vue — le choix suit DONNEES_ABSENTES ; « Décider plus tard » ne le reporte que le temps de l’ouverture', async () => {
    const { controleur, etat } = preparer();
    await controleur.rafraichir();
    expect(controleur.vue().choixRestauration?.vue.propose).toBe(true);

    await controleur.deciderPlusTard();
    expect(controleur.vue().choixRestauration?.vue.propose).toBe(false);

    etat.lu = { ...ETAT, actionRequise: 'DRIVE_PLEIN' };
    await controleur.rafraichir();
    expect(controleur.vue().choixRestauration).toBeUndefined();

    etat.lu = ETAT;
    await controleur.rafraichir();
    expect(controleur.vue().choixRestauration?.vue.propose).toBe(true);
  });

  it('UT-COMP-US-017-3-10 gestes — « Restaurer », « Annuler la demande » et « Repartir de zéro » vont à l’application ; la confirmation annonce les modifications perdues', async () => {
    const { controleur, application } = preparer();
    await controleur.rafraichir();

    await controleur.demanderRestauration();
    await controleur.annulerRestauration();
    const confirmation = await controleur.evaluerRepartirDeZero();
    await controleur.repartirDeZero();

    expect(application.demanderRestauration).toHaveBeenCalledOnce();
    expect(application.annulerRestauration).toHaveBeenCalledOnce();
    expect(confirmation?.code).toBe('CNF-REPARTIR-ZERO');
    expect(confirmation?.texte).toContain('1 modification faite ici');
    expect(application.repartirDeZero).toHaveBeenCalledOnce();
  });

  it('UT-COMP-US-017-3-11 repartir de zéro refusé — aucune confirmation (la vue est rafraîchie)', async () => {
    const { controleur, application } = preparer();
    vi.mocked(application.evaluerRepartirDeZero).mockResolvedValueOnce(
      echec({ type: 'ReseauIndisponible' }),
    );
    await controleur.rafraichir();

    expect(await controleur.evaluerRepartirDeZero()).toBeUndefined();
  });

  it('UT-COMP-US-017-3-12 écriture locale impossible — toast ERR-014, « Réessayer » rejoue « Restaurer »', async () => {
    const { controleur, application } = preparer();
    vi.mocked(application.demanderRestauration).mockResolvedValueOnce(
      echec({ type: 'EcritureLocaleImpossible' }),
    );
    await controleur.rafraichir();

    await controleur.demanderRestauration();
    expect(controleur.vue().toast).toBe('TST-ERREUR-ENREGISTREMENT');

    await controleur.reessayer();
    expect(application.demanderRestauration).toHaveBeenCalledTimes(2);
  });
});

describe('ControleurInterface — toast TST-RESTAUREE (n° 9)', () => {
  const sortirDeLErreur = async (
    controleur: ControleurInterface,
    etat: ReturnType<typeof preparer>['etat'],
    restauree: Hlc | undefined,
  ): Promise<void> => {
    etat.lu = SANS_ERREUR;
    etat.restauree = restauree;
    await controleur.rafraichir();
  };

  it('UT-COMP-US-017-3-13 — toast quand ERR-012 disparaît et que la restauration connue vient de cet appareil', async () => {
    const { controleur, etat } = preparer();
    await controleur.rafraichir();

    await sortirDeLErreur(controleur, etat, h(7, PC));

    expect(controleur.vue().toast).toBe('TST-RESTAUREE');
  });

  it('UT-COMP-US-017-3-14 — pas de toast si l’autre appareil a restauré ou si repartir de zéro l’emporte (restauration connue inchangée ou d’ailleurs)', async () => {
    const { controleur, etat } = preparer();
    etat.restauree = h(7, PC);
    await controleur.rafraichir();

    await sortirDeLErreur(controleur, etat, h(7, PC));
    expect(controleur.vue().toast).toBeUndefined();

    etat.lu = ETAT;
    etat.restauree = undefined;
    await controleur.rafraichir();
    await sortirDeLErreur(controleur, etat, undefined);
    expect(controleur.vue().toast).toBeUndefined();
  });
});
