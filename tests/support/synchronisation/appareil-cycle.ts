/**
 * Appareil minimal pour les tests du cycle (ST-US-017 §13.1) : DepotLocalDexie sur fake-indexeddb,
 * ServiceEtatLocalTransactionnel, CycleSynchronisation sur un FauxDrive partagé, réseau et accès commandables.
 */
import { IDBFactory } from 'fake-indexeddb';
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { Annulation } from '@src/commun/application/ports/planificateur';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type {
  AccesGoogle,
  EtatAccesGoogle,
} from '@src/synchronisation/application/ports/acces-google';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import type { FauxDrive } from '../../doublures/faux-drive';
import { GenerateurIdentifiantsSequentiel } from '../../doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import type { PlanificateurSimule } from '../../doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '../../doublures/source-aleatoire-deterministe';
import type { TempsSimule } from '../banc/temps-simule';
import { JournalEnMemoire } from '../compte/doublures-compte';

export class ReseauCommandable implements EtatReseau {
  private readonly abonnes = new Set<(connecte: boolean) => void>();
  constructor(private connecte = true) {}
  estConnecte(): boolean {
    return this.connecte;
  }
  surChangement(rappel: (connecte: boolean) => void): Annulation {
    this.abonnes.add(rappel);
    return () => this.abonnes.delete(rappel);
  }
  changer(connecte: boolean): void {
    this.connecte = connecte;
    this.abonnes.forEach((rappel) => {
      rappel(connecte);
    });
  }
}

export class AccesCommandable implements AccesGoogle {
  readonly refusSignales: Array<EtatAccesGoogle> = [];
  private readonly abonnes = new Set<(etat: EtatAccesGoogle) => void>();
  constructor(
    private courant: EtatAccesGoogle = 'VALIDE',
    private readonly apresRefus: EtatAccesGoogle = 'A_RENOUVELER',
  ) {}
  etat(): EtatAccesGoogle {
    return this.courant;
  }
  signalerRefus(): Promise<EtatAccesGoogle> {
    this.refusSignales.push(this.courant);
    this.changer(this.apresRefus);
    return Promise.resolve(this.courant);
  }
  observer(rappel: (etat: EtatAccesGoogle) => void): Annulation {
    this.abonnes.add(rappel);
    return () => this.abonnes.delete(rappel);
  }
  changer(etat: EtatAccesGoogle): void {
    this.courant = etat;
    this.abonnes.forEach((rappel) => {
      rappel(etat);
    });
  }
}

export type AppareilCycle = {
  readonly appareilId: IdAppareil;
  readonly fabrique: IDBFactory;
  readonly depot: DepotLocalDexie;
  readonly service: ServiceEtatLocalTransactionnel;
  readonly cycle: CycleSynchronisation;
  readonly reseau: ReseauCommandable;
  readonly acces: AccesCommandable;
  readonly journal: JournalEnMemoire;
  /** Autorisation vue par Google (faux : le Drive répond 401, accès retiré non encore constaté). */
  readonly autorisationGoogle: { accordee: boolean };
};

export const creerAppareilCycle = (p: {
  readonly appareilId: IdAppareil;
  readonly prefixe: string;
  readonly drive: FauxDrive;
  readonly temps: TempsSimule;
  readonly planificateur: PlanificateurSimule;
  readonly fabrique?: IDBFactory;
}): AppareilCycle => {
  const fabrique = p.fabrique ?? new IDBFactory();
  const horloge = new HorlogeSimulee(p.temps);
  const depot = new DepotLocalDexie({
    nomBase: 'donejuan-test-espace',
    fabrique,
    appareilId: p.appareilId,
  });
  const service = new ServiceEtatLocalTransactionnel({
    depot,
    horloge,
    generateur: new GenerateurIdentifiantsSequentiel(p.prefixe),
  });
  const reseau = new ReseauCommandable();
  const acces = new AccesCommandable();
  const journal = new JournalEnMemoire();
  const autorisationGoogle = { accordee: true };
  const transport = p.drive.transportPour(p.appareilId, {
    reseau,
    accesAccorde: () => autorisationGoogle.accordee,
  });
  const cycle = new CycleSynchronisation({
    depot,
    transport,
    acces,
    reseau,
    planificateur: p.planificateur,
    aleatoire: new SourceAleatoireDeterministe([500]),
    horloge,
    journal,
    versionApplication: '0.1.0',
  });
  return {
    appareilId: p.appareilId,
    fabrique,
    depot,
    service,
    cycle,
    reseau,
    acces,
    journal,
    autorisationGoogle,
  };
};
