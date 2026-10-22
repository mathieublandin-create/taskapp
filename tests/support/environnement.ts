/**
 * Environnement des tests d'application (ST-socle-ecriture.md §13, ST-US-001 §13) :
 * ServiceEtatLocalTransactionnel sur DepotLocalDexie et fake-indexeddb, HorlogeSimulee,
 * GenerateurIdentifiantsSequentiel. Une IDBFactory neuve par environnement.
 */
import { IDBFactory } from 'fake-indexeddb';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { succes } from '@src/commun/domaine/resultat';
import type { Resultat } from '@src/commun/domaine/resultat';
import type {
  ContexteDecision,
  ServiceEtatLocal,
} from '@src/synchronisation/application/service-etat-local';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import type { ErreurDepotLocal } from '@src/synchronisation/application/ports/depot-local';
import type { EtatMetier } from '@src/synchronisation/domaine/etat-metier';
import type { Modification } from '@src/synchronisation/domaine/modification';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { GenerateurIdentifiantsSequentiel } from '../doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '../doublures/horloge-simulee';
import { TempsSimule } from './banc/temps-simule';
import { instant, SMARTPHONE } from './valeurs';

export const NOM_BASE_TEST = 'done-juan-test';

export type Environnement = {
  readonly fabrique: IDBFactory;
  readonly temps: TempsSimule;
  readonly horloge: HorlogeSimulee;
  readonly generateur: GenerateurIdentifiantsSequentiel;
  readonly depot: DepotLocalDexie;
  readonly service: ServiceEtatLocal;
};

export const creerEnvironnement = (
  departIso: string,
  options: { readonly appareilId?: IdAppareil } = {},
): Environnement => {
  const fabrique = new IDBFactory();
  const temps = new TempsSimule(instant(departIso));
  const horloge = new HorlogeSimulee(temps);
  const generateur = new GenerateurIdentifiantsSequentiel();
  const depot = new DepotLocalDexie({
    nomBase: NOM_BASE_TEST,
    fabrique,
    appareilId: options.appareilId ?? SMARTPHONE,
  });
  const service = new ServiceEtatLocalTransactionnel({ depot, horloge, generateur });
  return { fabrique, temps, horloge, generateur, depot, service };
};

/** Prépare un état par des Modification directes du socle (préconditions des tests d'application). */
export const appliquerModifications = (
  service: ServiceEtatLocal,
  modifications: (etat: EtatMetier, contexte: ContexteDecision) => ReadonlyArray<Modification>,
): Promise<Resultat<undefined, ErreurDepotLocal>> =>
  service.modifier<undefined, ErreurDepotLocal>((etat, contexte) =>
    succes({ modifications: modifications(etat, contexte), valeur: undefined }),
  );

/** Valeur d'un Succes ; fait échouer le test sur un Echec. */
export const valeurDe = <T, E>(r: Resultat<T, E>): T => {
  if (!r.ok) {
    throw new Error(`Échec inattendu : ${JSON.stringify(r.erreur)}`);
  }
  return r.valeur;
};
