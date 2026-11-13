/**
 * ST-US-031 v0.4 §6.5 n° 1 à 7, §14 (rang 13, tranche B2), tests complémentaires de Bruce : composition de la
 * coordination entre onglets. Deux instances de `assemblerApplication` sur la même `IDBFactory` (même profil, même
 * espace) et le même `VerrouOngletsEnMemoire` ; chacune a sa vue du `FauxDrive` (identifiant de vue distinct, pour
 * compter les appels de chaque onglet). La composition (`src/composition/**`) est exclue de la couverture : ces tests
 * en sont la preuve. UT-COMP-US-031-9 à 14.
 */
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import { ControleurInterface } from '@src/composition/controleur-interface';
import {
  assemblerApplication,
  RelaisEchangesGoogle,
  type Application,
} from '@src/composition/application';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { FauxFournisseurAuth } from '@tests/doublures/faux-fournisseur-auth';
import { GenerateurIdentifiantsSequentiel } from '@tests/doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { JournalTechniqueMemoire } from '@tests/doublures/journal-technique-memoire';
import { MiseAJourSimulee } from '@tests/doublures/mise-a-jour-simulee';
import { PersistanceSimulee } from '@tests/doublures/persistance-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { ReseauSimule } from '@tests/doublures/reseau-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { VerrouOngletsEnMemoire, type OngletSimule } from '@tests/doublures/verrou-onglets-memoire';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { AvisOngletsEnMemoire, IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { vider } from '@tests/support/synchronisation/onglets';
import { instant } from '@tests/support/valeurs';

const VUES = [
  '00000000-0000-7000-8000-0000000000a1' as IdAppareil,
  '00000000-0000-7000-8000-0000000000a2' as IdAppareil,
] as const;

type Onglet = {
  readonly application: Application;
  readonly verrou: OngletSimule;
  readonly journal: JournalTechniqueMemoire;
  readonly vue: IdAppareil;
  /** Notifications reçues par `observerSynchronisation` (relais de l'onglet). */
  readonly notifications: { nombre: number };
};

const ouverts: Array<Application> = [];

afterEach(() => {
  ouverts.splice(0).forEach((application) => {
    application.arreter();
  });
});

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const fabrique = new IDBFactory();
  const verrous = new VerrouOngletsEnMemoire();
  const reseau = new ReseauSimule();
  const horloge = new HorlogeSimulee(temps);
  let numero = 0;
  /** Nouvel onglet du même profil : instance neuve, vue neuve des verrous. */
  const onglet = (): Onglet => {
    const vue = VUES[numero % VUES.length] ?? VUES[0];
    numero += 1;
    const journal = new JournalTechniqueMemoire();
    const verrou = verrous.onglet();
    const application = assemblerApplication({
      env: 'recette',
      fabrique,
      horloge,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([0]),
      reseau,
      journal,
      generateur: new GenerateurIdentifiantsSequentiel(`0${String(numero)}`),
      avis: new AvisOngletsEnMemoire(),
      gardeSaisie: { saisieEnCours: () => false },
      fournisseur: ({ memoireRedirection }) =>
        new FauxFournisseurAuth({ memoireRedirection, horloge }),
      transport: () => drive.transportPour(vue, { reseau, accesAccorde: () => true }),
      echangesGoogle: new RelaisEchangesGoogle(journal),
      miseAJour: new MiseAJourSimulee(),
      versionApplication: '0.1.0',
      surFermetureImposee: () => undefined,
      ouvrirOnglet: () => undefined,
      persistance: new PersistanceSimulee(),
      verrou,
    });
    ouverts.push(application);
    const notifications = { nombre: 0 };
    application.observerSynchronisation(() => {
      notifications.nombre += 1;
    });
    return { application, verrou, journal, vue, notifications };
  };
  /** Session du compte A ouverte avec cet accès, puis espace du compte ouvert (comme après `SeConnecter`). */
  const connecter = async (
    o: Onglet,
    acces: 'VALIDE' | 'A_RENOUVELER' = 'VALIDE',
  ): Promise<void> => {
    o.application.session.ouvrir(IDENTITE_A, acces);
    const ouverture = await o.application.espaces.ouvrir(IDENTITE_A.compte);
    expect(ouverture.ok).toBe(true);
    await repos(o);
  };
  /** Accord des verrous et cycles de l'onglet terminés (IndexedDB simulée : tâches réelles). */
  const repos = async (o: Onglet): Promise<void> => {
    await vider();
    for (let enCours = o.application.espace()?.cycle.cycleEnCours(); enCours !== undefined;) {
      await enCours.catch(() => undefined);
      await vider();
      enCours = o.application.espace()?.cycle.cycleEnCours();
    }
  };
  const nomDuVerrou = async (suffixe: string): Promise<string> =>
    `${await nomEspace('recette', IDENTITE_A.compte)}:synchronisation-${suffixe}`;
  const entreesMeneur = (o: Onglet) =>
    o.journal.entrees().filter((e) => e.evenement === 'OngletMeneur');
  return { drive, verrous, horloge, onglet, connecter, repos, nomDuVerrou, entreesMeneur };
};

describe('Composition — coordination entre onglets (ST-US-031 §6.5)', () => {
  it('UT-COMP-US-031-9 deux onglets — seul le premier exécute le cycle d’ouverture, sous le verrou « cycle » de l’espace ; le second est suiveur, sans appel au Drive', async () => {
    const env = preparer();
    const premier = env.onglet();
    const second = env.onglet();
    const detenteursPendantLeCycle = new Set<string | undefined>();
    const cycle = await env.nomDuVerrou('cycle');
    premier.application.observerSynchronisation(() => {
      if (premier.application.espace()?.cycle.cycleEnCours() !== undefined) {
        detenteursPendantLeCycle.add(env.verrous.detenteur(cycle));
      }
    });

    await env.connecter(premier);
    await env.connecter(second);

    expect(env.drive.nombreReponses(premier.vue)).toBeGreaterThan(0);
    expect(env.drive.nombreReponses(second.vue)).toBe(0);
    expect([...detenteursPendantLeCycle]).toEqual([premier.verrou.id]);
    expect(env.verrous.detenteur(await env.nomDuVerrou('meneur'))).toBe(premier.verrou.id);
    expect(await premier.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });
    expect(await second.application.lireCoordination()).toEqual({
      role: 'SUIVEUR',
      autreMeneur: true,
    });
    expect(env.entreesMeneur(premier)).toHaveLength(1);
    expect(env.entreesMeneur(second)).toHaveLength(0);
  });

  it('UT-COMP-US-031-10 fermeture du premier onglet — le second devient meneur et synchronise, sans message (une entrée info)', async () => {
    const env = preparer();
    const premier = env.onglet();
    const second = env.onglet();
    await env.connecter(premier);
    await env.connecter(second);

    env.verrous.fermerOnglet(premier.verrou.id);
    await env.repos(second);

    expect(await second.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });
    expect(env.drive.nombreReponses(second.vue)).toBeGreaterThan(0);
    expect(env.entreesMeneur(second)).toEqual([{ niveau: 'info', evenement: 'OngletMeneur' }]);
    expect(
      second.journal.entrees().filter((e) => e.niveau !== 'info' && e.niveau !== 'debug'),
    ).toEqual([]);
  });

  it('UT-COMP-US-031-11 arreterCoordination — main rendue au second (qui synchronise), une notification du relais, cycle du premier arrêté', async () => {
    const env = preparer();
    const premier = env.onglet();
    const second = env.onglet();
    await env.connecter(premier);
    await env.connecter(second);
    const reponsesDuPremier = env.drive.nombreReponses(premier.vue);
    const notificationsAvant = premier.notifications.nombre;

    premier.application.arreterCoordination();
    await env.repos(second);

    expect(premier.notifications.nombre - notificationsAvant).toBe(1);
    expect(await premier.application.lireCoordination()).toEqual({
      role: 'SUIVEUR',
      autreMeneur: true,
    });
    expect(await second.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });
    expect(env.drive.nombreReponses(second.vue)).toBeGreaterThan(0);
    // Cycle du premier arrêté : un geste local n'arme plus sa temporisation, il ne rappelle plus le Drive.
    expect(premier.application.espace()?.cycle.cycleEnCours()).toBeUndefined();
    expect(env.drive.nombreReponses(premier.vue)).toBe(reponsesDuPremier);
  });

  it('UT-COMP-US-031-12 sans espace ouvert — lireCoordination undefined, arreterCoordination sans effet ni erreur', async () => {
    const env = preparer();
    const seul = env.onglet();

    expect(await seul.application.lireCoordination()).toBeUndefined();
    expect(() => {
      seul.application.arreterCoordination();
    }).not.toThrow();

    // L'arrêt sans espace ne compromet pas l'ouverture suivante.
    await env.connecter(seul);
    expect(await seul.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });
  });

  it('UT-COMP-US-031-13 fermeture de l’espace (déconnexion) — coordination arrêtée : main rendue au second onglet, lireCoordination undefined', async () => {
    const env = preparer();
    const premier = env.onglet();
    const second = env.onglet();
    await env.connecter(premier);
    await env.connecter(second);

    await premier.application.espaces.fermer();
    await env.repos(second);

    expect(await premier.application.lireCoordination()).toBeUndefined();
    expect(env.verrous.detenteur(await env.nomDuVerrou('meneur'))).toBe(second.verrou.id);
    expect(await second.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });
  });

  it('UT-COMP-US-031-14 accès à renouveler à l’ouverture — aucune candidature ni appel au Drive ; accès rendu VALIDE : meneur et cycle d’ouverture', async () => {
    const env = preparer();
    const seul = env.onglet();
    const meneur = await env.nomDuVerrou('meneur');

    await env.connecter(seul, 'A_RENOUVELER');
    expect(env.verrous.detenteur(meneur)).toBeUndefined();
    expect(env.verrous.enAttente(meneur)).toBe(0);
    expect(env.drive.nombreReponses(seul.vue)).toBe(0);
    expect(await seul.application.lireCoordination()).toEqual({
      role: 'SUIVEUR',
      autreMeneur: false,
    });

    seul.application.session.changerAcces('VALIDE');
    await env.repos(seul);

    expect(env.verrous.detenteur(meneur)).toBe(seul.verrou.id);
    expect(env.drive.nombreReponses(seul.vue)).toBeGreaterThan(0);
  });

  it('UT-COMP-US-031-24 déconnexion de l’onglet meneur — la vue du contrôleur est l’écran de connexion, sans compte ni feuille (ANO-006)', async () => {
    const env = preparer();
    const seul = env.onglet();
    await env.connecter(seul);
    const controleur = new ControleurInterface(seul.application, env.horloge);
    await controleur.rafraichir();
    expect(controleur.vue().racine).toEqual({ ecran: 'APPLICATION' });
    expect(await seul.application.lireCoordination()).toEqual({
      role: 'MENEUR',
      autreMeneur: false,
    });

    await controleur.actionCompte('SE_DECONNECTER');
    await controleur.rafraichissementsTermines();
    await vider();
    await controleur.rafraichissementsTermines();

    expect(seul.application.session.etat().type).toBe('SANS_SESSION');
    expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    expect(controleur.vue()).not.toHaveProperty('compte');
    expect(controleur.vue()).not.toHaveProperty('feuille');
  });
});
