import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../../commun/application/ports/generateur-identifiants';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { Resultat } from '../../commun/domaine/resultat';
import type { EtatLocal } from '../domaine/etat-local';
import type { MetaSynchronisation, PlanSynchronisation } from '../domaine/meta-synchronisation';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '../application/ports/depot-local';

/**
 * Options (ST-socle-ecriture.md §4.4). `fabrique` : IDBFactory à utiliser (une par appareil simulé
 * en test, `fake-indexeddb`) ; absente : `globalThis.indexedDB`. À la première ouverture, écrit
 * `meta.appareilId` ; ensuite, vérifie qu'il est identique (sinon ErreurProgrammation).
 * Base Dexie ouverte avec `chromeTransactionDurability: 'strict'` ; une écriture n'est confirmée
 * qu'à l'événement `complete` de sa transaction (ST-socle-ecriture.md §4.4, §6.8 ; UT-SOC-44 à 46).
 */
export type OptionsDepotLocalDexie = {
  readonly nomBase: string;
  readonly fabrique?: IDBFactory;
  readonly appareilId: IdAppareil;
};

/** ST-US-022 §5.2 (DAT v0.11.3 §4.1.4, Q-ST022-STA-3) : ouverture d'un espace de compte par la composition. */
export type OptionsOuvertureEspace = {
  readonly nomBase: string;
  readonly fabrique?: IDBFactory;
  readonly generateur: GenerateurIdentifiants;
};

export class DepotLocalDexie implements DepotLocal {
  constructor(private readonly options: OptionsDepotLocalDexie) {}

  /**
   * L'`appareilId` naît avec l'espace : base neuve → nouvel identifiant (UUID v7 du générateur), écrit dans
   * `meta.appareilId` par une transaction stricte confirmée à `complete` ; base existante → identifiant relu,
   * générateur non appelé. Base supprimée puis rouverte → nouvel identifiant. Ligne illisible → Echec.
   */
  static ouvrirEspace(
    _options: OptionsOuvertureEspace,
  ): Promise<Resultat<DepotLocalDexie, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.ouvrirEspace');
  }

  /** Identifiant de l'appareil pour cet espace (celui du constructeur ou de `ouvrirEspace`). */
  appareil(): IdAppareil {
    return nonImplemente('DepotLocalDexie.appareil');
  }

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

  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.lireMeta');
  }

  appliquerSynchronisation(
    _calcul: (etat: EtatLocal, meta: MetaSynchronisation) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.appliquerSynchronisation');
  }
}
