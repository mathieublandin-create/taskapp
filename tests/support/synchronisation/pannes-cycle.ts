/**
 * Cycle d'un appareil dont un appel du transport ou du dépôt local échoue (une fois), sur FauxDrive et DepotLocalDexie
 * réels : balayage des pannes d'un cycle (compléments de couverture de Bruce, rang 10).
 */
import { echec, type Resultat } from '@src/commun/domaine/resultat';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type {
  DepotLocal,
  ErreurDepotLocal,
} from '@src/synchronisation/application/ports/depot-local';
import type {
  ErreurTransport,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { SourceAleatoireDeterministe } from '../../doublures/source-aleatoire-deterministe';
import { JournalEnMemoire } from '../compte/doublures-compte';
import { AccesCommandable, ReseauCommandable, type AppareilCycle } from './appareil-cycle';
import type { preparerRestauration } from './restauration';

export type Environnement = ReturnType<typeof preparerRestauration>;
export type MethodeTransport = keyof TransportSynchro;
export type MethodeDepot = 'lire' | 'lireMeta' | 'appliquerSynchronisation';

/** Appel en panne : le `occurrence`-ième (à partir de 1) appel de la méthode, dans le cycle observé. */
export type Panne =
  | {
      readonly cible: 'transport';
      readonly methode: MethodeTransport;
      readonly occurrence: number;
      readonly erreur: ErreurTransport;
    }
  | { readonly cible: 'depot'; readonly methode: MethodeDepot; readonly occurrence: number };

export const METHODES_TRANSPORT: ReadonlyArray<MethodeTransport> = [
  'preparerDossier',
  'listerDossiers',
  'inventorierDossier',
  'listerFichiersAppareils',
  'changements',
  'lireFichierAppareil',
  'deposerFichierAppareil',
  'lireManifeste',
  'lireContenuManifeste',
  'ecrireManifeste',
  'supprimerFichier',
];
export const METHODES_DEPOT: ReadonlyArray<MethodeDepot> = [
  'lire',
  'lireMeta',
  'appliquerSynchronisation',
];

const ECRITURE_IMPOSSIBLE = echec<ErreurDepotLocal>({ type: 'EcritureLocaleImpossible' });

/** Nombre d'appels, par méthode, depuis la création du cycle. */
export type Appels = Record<string, number>;

/** Cycle de `appareil` (même dépôt local, même Drive) qui compte ses appels et échoue à `panne`. */
export const cycleEnPanne = (
  env: Environnement,
  appareil: AppareilCycle,
  panne?: Panne,
  /** Rappel exécuté avant l'appel du transport rang `rang` de `methode` (écriture concurrente d'un autre appareil). */
  avant?: (methode: MethodeTransport, rang: number) => Promise<void>,
) => {
  const appels: Appels = {};
  const compter = (cle: string): number => {
    appels[cle] = (appels[cle] ?? 0) + 1;
    return appels[cle];
  };
  const reseau = new ReseauCommandable();
  const reel = env.drive.transportPour(appareil.appareilId, { reseau, accesAccorde: () => true });
  const estPanne = (cible: Panne['cible'], methode: string, rang: number): boolean =>
    panne?.cible === cible && panne.methode === methode && panne.occurrence === rang;
  /** Compte l'appel ; vrai si c'est celui qui doit échouer. */
  const enPanne = (cible: Panne['cible'], methode: string): boolean =>
    estPanne(cible, methode, compter(methode));
  const erreurTransport = (): ErreurTransport =>
    panne?.cible === 'transport' ? panne.erreur : { type: 'ServeurIndisponible' };
  const envelopper =
    <A extends ReadonlyArray<unknown>, T>(
      methode: MethodeTransport,
      appel: (...args: A) => Promise<Resultat<T, ErreurTransport>>,
    ) =>
    async (...args: A): Promise<Resultat<T, ErreurTransport>> => {
      const rang = compter(methode);
      await avant?.(methode, rang);
      return estPanne('transport', methode, rang) ? echec(erreurTransport()) : appel(...args);
    };
  const transport: TransportSynchro = {
    preparerDossier: envelopper('preparerDossier', () => reel.preparerDossier()),
    listerDossiers: envelopper('listerDossiers', () => reel.listerDossiers()),
    inventorierDossier: envelopper('inventorierDossier', (d) => reel.inventorierDossier(d)),
    listerFichiersAppareils: envelopper('listerFichiersAppareils', (d) =>
      reel.listerFichiersAppareils(d),
    ),
    changements: envelopper('changements', (d, j) => reel.changements(d, j)),
    lireFichierAppareil: envelopper('lireFichierAppareil', (id) => reel.lireFichierAppareil(id)),
    deposerFichierAppareil: envelopper('deposerFichierAppareil', (p) =>
      reel.deposerFichierAppareil(p),
    ),
    lireManifeste: envelopper('lireManifeste', (d) => reel.lireManifeste(d)),
    lireContenuManifeste: envelopper('lireContenuManifeste', (id) => reel.lireContenuManifeste(id)),
    ecrireManifeste: envelopper('ecrireManifeste', (p) => reel.ecrireManifeste(p)),
    supprimerFichier: envelopper('supprimerFichier', (id) => reel.supprimerFichier(id)),
  };
  const vrai = appareil.depot;
  const depot: DepotLocal = {
    lire: () => (enPanne('depot', 'lire') ? Promise.resolve(ECRITURE_IMPOSSIBLE) : vrai.lire()),
    lireMeta: () =>
      enPanne('depot', 'lireMeta') ? Promise.resolve(ECRITURE_IMPOSSIBLE) : vrai.lireMeta(),
    lireSignalements: () => vrai.lireSignalements(),
    appliquer: (calcul) => vrai.appliquer(calcul),
    observer: (rappel) => vrai.observer(rappel),
    appliquerSynchronisation: (calcul) =>
      enPanne('depot', 'appliquerSynchronisation')
        ? Promise.resolve(ECRITURE_IMPOSSIBLE)
        : vrai.appliquerSynchronisation(calcul),
  };
  const journal = new JournalEnMemoire();
  const acces = new AccesCommandable();
  const cycle = new CycleSynchronisation({
    depot,
    transport,
    acces,
    reseau,
    planificateur: env.planificateur,
    aleatoire: new SourceAleatoireDeterministe([500]),
    horloge: new HorlogeSimulee(env.temps),
    journal,
    versionApplication: '0.1.0',
  });
  return { cycle, appels, journal, acces };
};
