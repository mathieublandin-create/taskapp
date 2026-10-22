import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { Resultat } from '../../commun/domaine/resultat';
import type { EtatLocal } from '../domaine/etat-local';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '../application/ports/depot-local';

/**
 * Options (ST-socle-ecriture.md §4.4). `fabrique` : IDBFactory à utiliser (une par appareil simulé
 * en test, `fake-indexeddb`) ; absente : `globalThis.indexedDB`. À la première ouverture, écrit
 * `meta.appareilId` ; ensuite, vérifie qu'il est identique (sinon ErreurProgrammation).
 */
export type OptionsDepotLocalDexie = {
  readonly nomBase: string;
  readonly fabrique?: IDBFactory;
  readonly appareilId: IdAppareil;
};

export class DepotLocalDexie implements DepotLocal {
  constructor(private readonly options: OptionsDepotLocalDexie) {}

  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.lire');
  }

  appliquer<T, E extends { readonly type: string }>(
    _calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.appliquer');
  }

  observer(_rappel: () => void): () => void {
    return nonImplemente('DepotLocalDexie.observer');
  }
}
