/**
 * Contrôleur de l'incrément 4 (ST-US-017 v0.11 §6.8 n° 4, 9, 10, 11 ; rang 11, tranche D3), tests complémentaires de
 * Benjamin : consultation seule, alerte d'horloge, ligne « Fuseau », « Mettre à jour » (bandeau et carte).
 * UT-COMP-US-017-4-67 à 4-71.
 */
import { describe, expect, it } from 'vitest';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { echec } from '@src/commun/domaine/resultat';
import { SessionCourante } from '@src/compte/application/session-courante';
import { ControleurInterface } from '@src/composition/controleur-interface';
import type { IssueMiseAJour } from '@src/synchronisation/application/ports/mise-a-jour-application';
import type { EtatSynchronisationLu } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { SEUIL_HORLOGE_DEREGLEE } from '@src/synchronisation/domaine/parametres-synchronisation';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { TempsSimule } from '../../support/banc/temps-simule';
import { IDENTITE_A } from '../../support/compte/doublures-compte';
import { convertirFuseau } from '../../support/conversions';
import { instant } from '../../support/valeurs';

const MAINTENANT = instant('2026-10-21T08:00:00.000Z');
const ETAT: EtatSynchronisationLu = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const ETAT_CONSULTATION_SEULE: EtatSynchronisationLu = {
  ...ETAT,
  actionRequise: 'FORMAT_PLUS_RECENT',
};

type Reglages = {
  etat?: EtatSynchronisationLu | undefined;
  correction?: EcartTemps | undefined;
  issue?: IssueMiseAJour;
  session?: 'OUVERTE' | 'SANS_SESSION';
};

const preparer = (reglages: Reglages = {}) => {
  const appels: Array<string> = [];
  const donnees = { ...reglages };
  const session = new SessionCourante();
  if (reglages.session === 'OUVERTE') {
    session.ouvrir(IDENTITE_A, 'VALIDE');
  }
  const application = {
    session,
    consulterEtat: () => Promise.resolve(donnees.etat),
    lireElementsEnAttente: () => Promise.resolve([]),
    lireDernierContact: () => Promise.resolve(undefined),
    lireCorrectionHorloge: () => Promise.resolve(donnees.correction),
    lireModificationsNonRetenues: () => Promise.resolve(undefined),
    lireChoixRestauration: () => Promise.resolve(undefined),
    lireRestaurationFaiteIci: () => Promise.resolve(undefined),
    synchroniserMaintenant: () => {
      appels.push('synchroniserMaintenant');
      return Promise.resolve();
    },
    reprendreSession: {
      executer: () => {
        appels.push('reprendre');
        return Promise.resolve(echec({ type: 'ReseauIndisponible' }));
      },
    },
    mettreAJour: () => {
      appels.push('mettreAJour');
      return Promise.resolve(donnees.issue ?? 'AUCUNE_VERSION');
    },
    observerSynchronisation: () => () => undefined,
    ouvrirGoogleDrive: () => undefined,
    masquage: new MasquageRappel(),
  } as unknown as ConstructorParameters<typeof ControleurInterface>[0];
  const horloge = new HorlogeSimulee(new TempsSimule(MAINTENANT));
  return { controleur: new ControleurInterface(application, horloge), appels, donnees, horloge };
};

describe('ControleurInterface — incrément 4 (rang 11, D3)', () => {
  it('UT-COMP-US-017-4-67 vue.consultationSeule — vraie si et seulement si le cycle constate FORMAT_PLUS_RECENT ; fausse sans espace ouvert', async () => {
    const { controleur, donnees } = preparer({ etat: ETAT_CONSULTATION_SEULE });

    await controleur.rafraichir();
    const enConsultationSeule = controleur.vue().consultationSeule;
    donnees.etat = ETAT;
    await controleur.rafraichir();
    const apresMiseAJour = controleur.vue().consultationSeule;
    donnees.etat = undefined;
    await controleur.rafraichir();

    expect([enConsultationSeule, apresMiseAJour, controleur.vue().consultationSeule]).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('UT-COMP-US-017-4-68 vue.feuille.alerteHorloge — ALR-001 si |correction| dépasse SEUIL_HORLOGE_DEREGLEE (strict), recalculée au rafraîchissement', async () => {
    const { controleur, donnees } = preparer({ etat: ETAT, correction: SEUIL_HORLOGE_DEREGLEE });
    const codes: Array<string | undefined> = [];

    await controleur.rafraichir();
    codes.push(controleur.vue().feuille?.alerteHorloge?.code);
    donnees.correction = EcartTemps.depuisMillisecondes(SEUIL_HORLOGE_DEREGLEE + 1);
    await controleur.rafraichir();
    codes.push(controleur.vue().feuille?.alerteHorloge?.code);
    donnees.correction = EcartTemps.depuisMillisecondes(-(SEUIL_HORLOGE_DEREGLEE + 1));
    await controleur.rafraichir();
    codes.push(controleur.vue().feuille?.alerteHorloge?.code);
    donnees.correction = undefined;
    await controleur.rafraichir();
    codes.push(controleur.vue().feuille?.alerteHorloge?.code);

    expect(codes).toEqual([undefined, 'ALR-001', 'ALR-001', undefined]);
  });

  it('UT-COMP-US-017-4-69 vue.compte.fuseau — ligne « Fuseau » seulement si le fuseau de l’appareil diffère de Europe/Paris', async () => {
    const { controleur, horloge } = preparer({ etat: ETAT, session: 'OUVERTE' });

    await controleur.rafraichir();
    const parDefaut = controleur.vue().compte?.fuseau;
    horloge.reglerFuseauAppareil(convertirFuseau('America/New_York'));
    await controleur.rafraichir();

    expect(parDefaut).toBeUndefined();
    expect(controleur.vue().compte?.fuseau).toMatchObject({ code: 'SYN-FEUILLE-FUSEAU' });
    expect(controleur.vue().compte?.fuseau?.texte).toContain('New York');
  });

  it('UT-COMP-US-017-4-70 actionCarte(METTRE_A_JOUR) et actionBandeau(METTRE_A_JOUR) — appellent mettreAJour, jamais synchroniserMaintenant ; l’issue est dans vue.miseAJour', async () => {
    const { controleur, appels } = preparer({ etat: ETAT_CONSULTATION_SEULE, issue: 'ECHEC' });

    await controleur.actionCarte('METTRE_A_JOUR');
    const apresCarte = controleur.vue().miseAJour;
    await controleur.actionBandeau('METTRE_A_JOUR');

    expect(appels).toEqual(['mettreAJour', 'mettreAJour']);
    expect([apresCarte, controleur.vue().miseAJour]).toEqual(['ECHEC', 'ECHEC']);
  });

  it('UT-COMP-US-017-4-71 vue.miseAJour — effacée au rafraîchissement suivant ; les autres actions du bandeau passent par reprendre, sans appeler mettreAJour', async () => {
    const { controleur, appels } = preparer({ etat: ETAT_CONSULTATION_SEULE });

    await controleur.mettreAJour();
    const apres = controleur.vue().miseAJour;
    await controleur.rafraichir();
    await controleur.actionBandeau('REPRENDRE_LA_SYNCHRONISATION');

    expect(apres).toBe('AUCUNE_VERSION');
    expect(controleur.vue().miseAJour).toBeUndefined();
    expect(appels).toEqual(['mettreAJour', 'reprendre']);
  });
});
