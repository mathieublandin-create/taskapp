import { nonImplemente } from '@non-implemente';
import Dexie from 'dexie';
import type { GenerateurIdentifiants } from '../../commun/application/ports/generateur-identifiants';
import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import { IdAppareil } from '../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '../application/ports/depot-local';
import { ETAT_LOCAL_VIDE, type EtatLocal } from '../domaine/etat-local';
import { cleEnTexte } from '../domaine/information';
import type { MetaSynchronisation, PlanSynchronisation } from '../domaine/meta-synchronisation';
import type { PlanEcriture } from '../domaine/planifier-ecritures';
import {
  decoderEnAttente,
  decoderEvenement,
  decoderMeta,
  decoderRegistre,
  encoderEnAttente,
  encoderEvenement,
  encoderMeta,
  encoderRegistre,
} from './stockage-local/schemas';

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
  /**
   * DAT v0.11.4 §4.1.6 (RL-LOT-001-A1) : appelé une fois quand une autre connexion demande la suppression
   * ou la montée de version de la base (`versionchange`). La connexion est alors fermée **sans réouverture
   * automatique** (`close({ disableAutoOpen: true })`) ; toute méthode rend ensuite EspaceLocalNonOuvert.
   * La composition y arrête la coordination et le cycle, puis recharge la page.
   */
  readonly surFermetureImposee?: () => void;
};

/** ST-US-022 §5.2 (DAT v0.11.3 §4.1.4, Q-ST022-STA-3) : ouverture d'un espace de compte par la composition. */
export type OptionsOuvertureEspace = {
  readonly nomBase: string;
  readonly fabrique?: IDBFactory;
  readonly generateur: GenerateurIdentifiants;
  readonly surFermetureImposee?: () => void;
};

const TABLES = ['registres', 'journal', 'enAttente', 'meta'];

type Ouverture = Resultat<undefined, { readonly type: 'DonneesLocalesIllisibles' }>;

const ESPACE_ILLISIBLE = echec({ type: 'DonneesLocalesIllisibles' } as const);
const ESPACE_NON_OUVERT = echec({ type: 'EspaceLocalNonOuvert' } as const);

/** Base Dexie d'un espace, en durabilité stricte (conventions.md §10.1, ADR-013). */
const creerBase = (nomBase: string, fabrique: IDBFactory | undefined): Dexie => {
  const base = new Dexie(nomBase, {
    chromeTransactionDurability: 'strict',
    ...(fabrique === undefined ? {} : { indexedDB: fabrique }),
  });
  base.version(1).stores({
    registres: 'cle, [type+id]',
    journal: 'id, [elementType+elementId], hlcTri',
    enAttente: 'cle',
    meta: 'nom',
  });
  return base;
};

/**
 * Lit `meta.appareilId`, ou le crée avec une `meta` vide si l'espace est neuf, dans une transaction stricte
 * résolue à `complete` ; le générateur n'est appelé que pour un espace neuf. Illisible → undefined.
 */
const etablirAppareil = async (
  base: Dexie,
  generateur: GenerateurIdentifiants,
): Promise<IdAppareil | undefined> =>
  base.transaction('rw', ['meta'], async () => {
    const meta = base.table('meta');
    const lignes = await meta.toArray();
    if (lignes.length > 0) return decoderMeta(lignes)?.appareilId;
    const appareilId = IdAppareil.depuisUuid(generateur.genererUuidV7());
    await meta.bulkPut([...encoderMeta(ETAT_LOCAL_VIDE(appareilId))]);
    return appareilId;
  });
const ECRITURE_IMPOSSIBLE = echec({ type: 'EcritureLocaleImpossible' } as const);

const planEstVide = (plan: PlanEcriture): boolean =>
  plan.registresEcrits.length === 0 &&
  plan.evenementsAjoutes.length === 0 &&
  plan.enAttenteEcrites.length === 0 &&
  plan.enAttenteRetirees.length === 0;

/** Décode toutes les lignes ; undefined si l'une d'elles est invalide. */
const decoderTout = <T>(
  lignes: ReadonlyArray<unknown>,
  decoder: (ligne: unknown) => T | undefined,
): ReadonlyArray<T> | undefined => {
  const decodees = lignes.flatMap((ligne) => {
    const decodee = decoder(ligne);
    return decodee === undefined ? [] : [decodee];
  });
  return decodees.length === lignes.length ? decodees : undefined;
};

/** Exception levée par le calcul de l'appelant : elle est propagée telle quelle, jamais traduite. */
type Surveillance = { exception: Error | undefined };

type IssueExecution<T, E> = Resultat<
  { readonly valeur: T; readonly etatApres?: EtatLocal },
  E | ErreurDepotLocal
>;

export class DepotLocalDexie implements DepotLocal {
  private readonly base: Dexie;
  private readonly observateurs = new Set<() => void>();
  private cache: EtatLocal | undefined;
  private ouverture: Promise<Ouverture> | undefined;
  private versionNotifiee = 0;
  private desabonnementStockage: (() => void) | undefined;
  private ferme = false;

  constructor(private readonly options: OptionsDepotLocalDexie) {
    // Durabilité stricte (conventions.md §10.1, ADR-013) : toute transaction d'écriture l'exige.
    this.base = creerBase(options.nomBase, options.fabrique);
    // RL-LOT-001-A1 : une autre connexion supprime ou monte la base ; fermeture sans réouverture automatique.
    // Rendre false empêche la fermeture par défaut de Dexie, qui autoriserait une réouverture.
    this.base.on('versionchange', () => {
      const dejaFerme = this.ferme;
      this.fermer();
      if (!dejaFerme) options.surFermetureImposee?.();
      return false;
    });
  }

  /**
   * L'`appareilId` naît avec l'espace : base neuve → nouvel identifiant (UUID v7 du générateur), écrit dans
   * `meta.appareilId` par une transaction stricte confirmée à `complete` ; base existante → identifiant relu,
   * générateur non appelé. Base supprimée puis rouverte → nouvel identifiant. Ligne illisible → Echec.
   */
  static async ouvrirEspace(
    options: OptionsOuvertureEspace,
  ): Promise<Resultat<DepotLocalDexie, ErreurDepotLocal>> {
    const provisoire = creerBase(options.nomBase, options.fabrique);
    let appareilId: IdAppareil | undefined;
    try {
      appareilId = await etablirAppareil(provisoire, options.generateur);
    } catch {
      return ECRITURE_IMPOSSIBLE;
    } finally {
      provisoire.close({ disableAutoOpen: true });
    }
    if (appareilId === undefined) return ESPACE_ILLISIBLE;
    const depot = new DepotLocalDexie({
      nomBase: options.nomBase,
      appareilId,
      ...(options.fabrique === undefined ? {} : { fabrique: options.fabrique }),
      ...(options.surFermetureImposee === undefined
        ? {}
        : { surFermetureImposee: options.surFermetureImposee }),
    });
    // La connexion reste ouverte : l'instance reçoit `versionchange` (RL-LOT-001-A1).
    const ouverture = await depot.lire();
    return ouverture.ok ? succes(depot) : ouverture;
  }

  /** Ferme la connexion sans réouverture automatique ; ensuite, toute méthode rend EspaceLocalNonOuvert. Idempotent. */
  fermer(): void {
    this.ferme = true;
    this.base.close({ disableAutoOpen: true });
  }

  /** Identifiant de l'appareil pour cet espace (celui du constructeur ou de `ouvrirEspace`). */
  appareil(): IdAppareil {
    return this.options.appareilId;
  }

  async lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    if (this.ferme) return ESPACE_NON_OUVERT;
    try {
      const ouverture = await this.ouvrir();
      if (!ouverture.ok) return ouverture;
      return await this.base.transaction('r', TABLES, () => this.etatAJour());
    } catch (erreur) {
      return this.traduire(erreur);
    }
  }

  async appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    if (this.ferme) return ESPACE_NON_OUVERT;
    const surveillance: Surveillance = { exception: undefined };
    try {
      const ouverture = await this.ouvrir();
      if (!ouverture.ok) return ouverture;
      const issue = await this.base.transaction('rw', TABLES, () =>
        this.executer(calcul, surveillance),
      );
      if (!issue.ok) return issue;
      // La promesse de la transaction n'est résolue qu'à `complete` (UT-SOC-45) : le cache et les rappels
      // ne sont mis à jour qu'à partir d'ici.
      if (issue.valeur.etatApres !== undefined) this.confirmer(issue.valeur.etatApres);
      return succes(issue.valeur.valeur);
    } catch (erreur) {
      if (surveillance.exception !== undefined) throw surveillance.exception;
      return this.traduire(erreur);
    }
  }

  observer(rappel: () => void): () => void {
    this.observateurs.add(rappel);
    this.desabonnementStockage ??= this.ecouterAutresInstances();
    return () => {
      this.observateurs.delete(rappel);
      if (this.observateurs.size === 0) {
        this.desabonnementStockage?.();
        this.desabonnementStockage = undefined;
      }
    };
  }

  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>> {
    if (this.ferme) return Promise.resolve(ESPACE_NON_OUVERT);
    return nonImplemente('DepotLocalDexie.lireMeta');
  }

  appliquerSynchronisation(
    _calcul: (etat: EtatLocal, meta: MetaSynchronisation) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalDexie.appliquerSynchronisation');
  }

  /**
   * Première ouverture : écrit `meta.appareilId` ; ensuite, vérifie qu'il est identique (sinon ErreurProgrammation).
   * Une `meta` illisible donne DonneesLocalesIllisibles, sans mémoriser l'échec : l'ouverture peut être retentée.
   */
  private ouvrir(): Promise<Ouverture> {
    this.ouverture ??= this.initialiser().then(
      (ouverture) => {
        if (!ouverture.ok) this.ouverture = undefined;
        return ouverture;
      },
      (erreur: unknown) => {
        this.ouverture = undefined;
        throw erreur;
      },
    );
    return this.ouverture;
  }

  private async initialiser(): Promise<Ouverture> {
    const meta = this.base.table('meta');
    const lignes = await meta.toArray();
    if (lignes.length === 0) {
      await meta.bulkPut([...encoderMeta(ETAT_LOCAL_VIDE(this.options.appareilId))]);
      return succes(undefined);
    }
    const lues = decoderMeta(lignes);
    if (lues === undefined) return ESPACE_ILLISIBLE;
    if (lues.appareilId !== this.options.appareilId) {
      throw new ErreurProgrammation("L'espace local appartient à un autre appareil");
    }
    return succes(undefined);
  }

  /** État à jour : le cache si `meta.version` n'a pas changé, sinon rechargement complet (autre onglet). */
  private async etatAJour(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    const meta = decoderMeta(await this.base.table('meta').toArray());
    if (meta === undefined) return ESPACE_ILLISIBLE;
    if (this.cache?.version === meta.version) return succes(this.cache);
    const registres = decoderTout(await this.base.table('registres').toArray(), decoderRegistre);
    const evenements = decoderTout(await this.base.table('journal').toArray(), decoderEvenement);
    const enAttente = decoderTout(await this.base.table('enAttente').toArray(), decoderEnAttente);
    if (registres === undefined || evenements === undefined || enAttente === undefined) {
      return ESPACE_ILLISIBLE;
    }
    this.cache = {
      appareilId: meta.appareilId,
      version: meta.version,
      ...(meta.dernierHlc === undefined ? {} : { dernierHlc: meta.dernierHlc }),
      correctionHorloge: meta.correctionHorloge,
      registres: new Map(registres.map((r) => [cleEnTexte(r.cle), r])),
      journal: new Map(evenements.map((e) => [e.id, e])),
      enAttente: new Map(enAttente.map((e) => [cleEnTexte(e.cle), e])),
    };
    return succes(this.cache);
  }

  /** Dans la transaction : lit l'état, appelle le calcul (synchrone, pur) et écrit son plan. */
  private async executer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
    surveillance: Surveillance,
  ): Promise<IssueExecution<T, E>> {
    const etat = await this.etatAJour();
    if (!etat.ok) return etat;
    const issue = this.calculer(calcul, etat.valeur, surveillance);
    if (!issue.ok) return issue;
    const { plan, valeur } = issue.valeur;
    if (planEstVide(plan)) return succes({ valeur });
    const etatApres = { ...plan.etatApres, version: etat.valeur.version + 1 };
    await this.ecrire(plan, etatApres);
    return succes({ valeur, etatApres });
  }

  private calculer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
    etat: EtatLocal,
    surveillance: Surveillance,
  ): Resultat<IssueTransaction<T>, E> {
    try {
      return calcul(etat);
    } catch (exception) {
      if (exception instanceof Error) surveillance.exception = exception;
      throw exception;
    }
  }

  private async ecrire(plan: PlanEcriture, etatApres: EtatLocal): Promise<void> {
    const entreesEcrites = plan.enAttenteEcrites.flatMap((cle) => {
      const entree = etatApres.enAttente.get(cle);
      return entree === undefined ? [] : [encoderEnAttente(entree)];
    });
    await this.base.table('registres').bulkPut(plan.registresEcrits.map(encoderRegistre));
    await this.base.table('journal').bulkAdd(plan.evenementsAjoutes.map(encoderEvenement));
    await this.base.table('enAttente').bulkPut(entreesEcrites);
    await this.base.table('enAttente').bulkDelete([...plan.enAttenteRetirees]);
    await this.base.table('meta').bulkPut([...encoderMeta(etatApres)]);
  }

  private confirmer(etatApres: EtatLocal): void {
    this.cache = etatApres;
    this.versionNotifiee = etatApres.version;
    this.notifier();
  }

  private notifier(): void {
    this.observateurs.forEach((rappel) => {
      rappel();
    });
  }

  /** Écritures d'une autre instance (autre onglet) : événement de mutation du stockage de Dexie. */
  private ecouterAutresInstances(): () => void {
    const prefixe = `idb://${this.options.nomBase}/`;
    const surMutation = (parties: object): void => {
      if (Object.keys(parties).some((cle) => cle.startsWith(prefixe))) void this.verifierVersion();
    };
    Dexie.on('storagemutated', surMutation);
    return () => {
      Dexie.on('storagemutated').unsubscribe(surMutation);
    };
  }

  private async verifierVersion(): Promise<void> {
    try {
      const meta = decoderMeta(await this.base.table('meta').toArray());
      if (meta === undefined || meta.version <= this.versionNotifiee) return;
      this.versionNotifiee = meta.version;
      this.notifier();
    } catch {
      // Base fermée ou indisponible : l'écriture d'une autre instance sera vue à la prochaine lecture.
    }
  }

  private traduire(erreur: unknown): Resultat<never, ErreurDepotLocal> {
    if (erreur instanceof ErreurProgrammation) throw erreur;
    return this.ferme ? ESPACE_NON_OUVERT : ECRITURE_IMPOSSIBLE;
  }
}
