/**
 * Appareil du banc (conventions.md §11.11, ST-socle-ecriture.md §12). Au rang 0 : horloge propre sur le temps du
 * banc, base `fake-indexeddb` propre, service d'état local, réseau et journal technique simulés. Le compte, le
 * `FauxFournisseurAuth`, le cycle de synchronisation et les cas d'usage s'ajoutent aux rangs suivants.
 */
import { IDBFactory } from 'fake-indexeddb';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { ServiceEtatLocal } from '@src/synchronisation/application/service-etat-local';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { GenerateurIdentifiantsSequentiel } from '../../doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { JournalTechniqueMemoire } from '../../doublures/journal-technique-memoire';
import { ReseauSimule } from '../../doublures/reseau-simule';
import type { TempsSimule } from './temps-simule';

export type NomAppareil = 'smartphone' | 'pc';

/** Identifiants fixes, jamais aléatoires : l'ordre lexicographique fixe le départage des HLC égaux. */
export const IDENTIFIANTS_APPAREILS: Readonly<Record<NomAppareil, IdAppareil>> = {
  smartphone: '00000000-0000-7000-8000-000000000001' as IdAppareil,
  pc: '00000000-0000-7000-8000-000000000002' as IdAppareil,
};

const PREFIXES_GENERATEUR: Readonly<Record<NomAppareil, string>> = { smartphone: '01', pc: '02' };

export class AppareilSimule {
  readonly appareilId: IdAppareil;
  readonly horloge: HorlogeSimulee;
  readonly reseau = new ReseauSimule();
  readonly journalTechnique = new JournalTechniqueMemoire();
  readonly generateur: GenerateurIdentifiantsSequentiel;
  /** Complété à chaque rang : cas d'usage, requêtes et modèles de vue des contextes métier. */
  readonly application: Readonly<Record<string, unknown>> = {};
  private readonly fabrique = new IDBFactory();
  private depotCourant: DepotLocalDexie;
  private serviceCourant: ServiceEtatLocal;

  constructor(
    readonly nom: NomAppareil,
    temps: TempsSimule,
  ) {
    this.appareilId = IDENTIFIANTS_APPAREILS[nom];
    this.horloge = new HorlogeSimulee(temps);
    this.generateur = new GenerateurIdentifiantsSequentiel(PREFIXES_GENERATEUR[nom]);
    this.depotCourant = this.nouveauDepot();
    this.serviceCourant = this.nouveauService(this.depotCourant);
  }

  get depot(): DepotLocalDexie {
    return this.depotCourant;
  }

  get service(): ServiceEtatLocal {
    return this.serviceCourant;
  }

  /** Perte de la mémoire, conservation de la base : nouvelles instances du dépôt et du service. */
  arreterBrutalement(): void {
    this.depotCourant = this.nouveauDepot();
    this.serviceCourant = this.nouveauService(this.depotCourant);
  }

  /** Nouvelle instance sur la même base, avec une nouvelle origine de l'horloge monotone. */
  redemarrer(): void {
    this.arreterBrutalement();
    this.horloge.redemarrer();
  }

  private nouveauDepot(): DepotLocalDexie {
    return new DepotLocalDexie({
      nomBase: `donejuan-test-${this.nom}`,
      fabrique: this.fabrique,
      appareilId: this.appareilId,
    });
  }

  private nouveauService(depot: DepotLocalDexie): ServiceEtatLocal {
    return new ServiceEtatLocalTransactionnel({
      depot,
      horloge: this.horloge,
      generateur: this.generateur,
    });
  }
}
