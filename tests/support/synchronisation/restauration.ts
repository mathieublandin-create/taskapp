/**
 * Banc de l'incrément 3 (ST-US-017 v0.10 §13.5) : deux appareils (FauxDrive, DepotLocalDexie), cas d'usage RG-044 de
 * chacun, lectures du Drive et de l'état local. Utilisé par UT-US-017-65 à 71 et 74.
 */
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import {
  AnnulerRestauration,
  DemanderRestauration,
  RepartirDeZero,
} from '@src/synchronisation/application/cas-usage/choisir-restauration';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
} from '@src/synchronisation/domaine/contenu-fichier';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import {
  decoderFichierAppareil,
  decoderManifeste,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import { FauxDrive, type FichierFaux } from '../../doublures/faux-drive';
import { PlanificateurSimule } from '../../doublures/planificateur-simule';
import { TempsSimule } from '../banc/temps-simule';
import { appliquerModifications, valeurDe } from '../environnement';
import { creationObjectif } from '../modifications';
import { date, ecart, idObjectif, instant, MINUTE, PC, SMARTPHONE } from '../valeurs';
import { creerAppareilCycle, type AppareilCycle } from './appareil-cycle';

export const DEPART = '2026-10-21T08:00:00.000Z';
export const PUBLIER = idObjectif(1);

export type AppareilRestauration = AppareilCycle & {
  readonly restaurer: DemanderRestauration;
  readonly annulerRestauration: AnnulerRestauration;
  readonly repartir: RepartirDeZero;
};

const equiper = (a: AppareilCycle): AppareilRestauration => {
  const dependances = { depot: a.depot, cycle: a.cycle, reseau: a.reseau };
  return {
    ...a,
    restaurer: new DemanderRestauration(dependances),
    annulerRestauration: new AnnulerRestauration({ depot: a.depot }),
    repartir: new RepartirDeZero(dependances),
  };
};

export const preparerRestauration = () => {
  const temps = new TempsSimule(instant(DEPART));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const creer = (appareilId: IdAppareil, prefixe: string) =>
    equiper(creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur }));
  const smartphone = creer(SMARTPHONE, '01');
  const pc = creer(PC, '02');
  /** Trois tours smartphone puis PC (au repos à la fin). */
  const echanger = async () => {
    for (let tour = 0; tour < 3; tour += 1) {
      await smartphone.cycle.synchroniserMaintenant();
      await pc.cycle.synchroniserMaintenant();
    }
  };
  const plusTard = () => {
    temps.avancer(ecart(10 * MINUTE));
  };
  return { temps, planificateur, drive, smartphone, pc, creer, echanger, plusTard };
};

/** « Étant donné un objectif "Publier le guide" de délai 2026-12-15 », créé sur `a`, puis échange. */
export const avecObjectifPublie = async (
  env: ReturnType<typeof preparerRestauration>,
  a: AppareilCycle = env.smartphone,
): Promise<void> => {
  valeurDe(
    await appliquerModifications(a.service, (_etat, contexte) => [
      creationObjectif(
        { id: PUBLIER, intitule: 'Publier le guide', delai: date('2026-12-15') },
        contexte.instant,
      ),
    ]),
  );
  await env.echanger();
};

export const renommerObjectif = (a: AppareilCycle, id: IdObjectif, intitule: string) =>
  appliquerModifications(a.service, () => [
    { type: 'ECRIRE_OBJECTIF', id, ecriture: { champ: 'intitule', valeur: intitule } },
  ]);

/** Objectifs non supprimés de l'appareil : intitulé → délai. */
export const objectifsDe = async (
  a: AppareilCycle,
): Promise<ReadonlyMap<string, string | undefined>> => {
  const metier = projeterEtatMetier(valeurDe(await a.depot.lire()));
  return new Map(
    [...metier.objectifs.values()].filter((o) => !o.supprime).map((o) => [o.intitule, o.delai]),
  );
};

export const metaDe = async (a: AppareilCycle) => valeurDe(await a.depot.lireMeta());
export const signalementsDe = async (a: AppareilCycle) =>
  valeurDe(await a.depot.lireSignalements());

/** Manifestes non supprimés du Drive (tous dossiers), décodés, en ordre de création. */
export const manifestesDuDrive = async (
  drive: FauxDrive,
): Promise<
  ReadonlyArray<{ readonly fichier: FichierFaux; readonly contenu: ContenuManifeste }>
> => {
  const fichiers = drive
    .fichiers()
    .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'manifeste');
  return Promise.all(
    fichiers.map(async (fichier) => ({
      fichier,
      contenu: valeurDe(await decoderManifeste(fichier.octets)),
    })),
  );
};

/** Fichier d'appareil non supprimé de `appareil`, décodé (échec du test s'il est absent ou illisible). */
export const fichierDuDrive = async (
  drive: FauxDrive,
  appareil: IdAppareil,
): Promise<{ readonly fichier: FichierFaux; readonly contenu: ContenuFichierAppareil }> => {
  const fichier = drive.fichierDe(appareil);
  if (fichier === undefined) throw new Error(`Aucun fichier de ${appareil} dans le Drive`);
  return { fichier, contenu: valeurDe(await decoderFichierAppareil(fichier.octets)) };
};
