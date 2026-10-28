/**
 * Appareil du banc (conventions.md §11.11 ; ST-socle-ecriture.md §12 ; ST-US-022 §12.3). Horloge propre sur le temps
 * du banc, base `fake-indexeddb` propre (une IDBFactory par appareil), réseau et journal technique simulés,
 * `FauxFournisseurAuth` (Google vu de cet appareil) et une instance de l'application assemblée comme la PWA
 * (`assemblerApplication`), recréée à chaque ouverture : achever une redirection, c'est abandonner l'instance et
 * en créer une nouvelle avec le retour de Google, comme un rechargement de page.
 */
import { IDBFactory } from 'fake-indexeddb';
import type { Planificateur } from '@src/commun/application/ports/planificateur';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { IssueOuverture } from '@src/compte/application/cas-usage/ouvrir-application';
import type { RetourGoogle } from '@src/compte/application/ports/fournisseur-auth';
import { BaseTechnique, MemoireRedirectionDexie } from '@src/compte/infrastructure/base-technique';
import { assemblerApplication, type Application } from '@src/composition/application';
import type { ServiceEtatLocal } from '@src/synchronisation/application/service-etat-local';
import type { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { FauxFournisseurAuth } from '../../doublures/faux-fournisseur-auth';
import type { FauxGoogle } from '../../doublures/faux-google';
import { GenerateurIdentifiantsSequentiel } from '../../doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { JournalTechniqueMemoire } from '../../doublures/journal-technique-memoire';
import { ReseauSimule } from '../../doublures/reseau-simule';
import { SourceAleatoireDeterministe } from '../../doublures/source-aleatoire-deterministe';
import { AvisOngletsEnMemoire } from '../compte/doublures-compte';
import type { TempsSimule } from './temps-simule';

export type NomAppareil = 'smartphone' | 'pc';

/** Environnement des bases du banc : `donejuan-recette-…`. */
export const ENV_BANC = 'recette';

/**
 * Identifiants de référence des appareils (conventions.md §11.11). Depuis le rang 1, l'`appareilId` de l'espace
 * naît avec lui (ST-US-022 §12.3) : il vient du générateur au préfixe de l'appareil (`…-8001-…`, `…-8002-…`), ce qui
 * garde l'ordre smartphone < PC. Ces identifiants servent de vue de l'appareil auprès du Drive avant l'espace.
 */
export const IDENTIFIANTS_APPAREILS: Readonly<Record<NomAppareil, IdAppareil>> = {
  smartphone: '00000000-0000-7000-8000-000000000001' as IdAppareil,
  pc: '00000000-0000-7000-8000-000000000002' as IdAppareil,
};

const PREFIXES_GENERATEUR: Readonly<Record<NomAppareil, string>> = { smartphone: '01', pc: '02' };

export type DependancesAppareil = {
  readonly planificateur: Planificateur;
  readonly google: FauxGoogle;
};

export class AppareilSimule {
  readonly horloge: HorlogeSimulee;
  readonly reseau = new ReseauSimule();
  readonly journalTechnique = new JournalTechniqueMemoire();
  readonly generateur: GenerateurIdentifiantsSequentiel;
  readonly fabrique = new IDBFactory();
  readonly fournisseur: FauxFournisseurAuth;
  readonly avis = new AvisOngletsEnMemoire();
  /** Vrai : le retour de la prochaine redirection d'ouverture est différé (« la session Google a expiré »). */
  retourDiffere = false;
  /** Fermetures imposées par une autre connexion (versionchange), observées par les scénarios. */
  fermeturesImposees = 0;
  private instance: Application | undefined;

  constructor(
    readonly nom: NomAppareil,
    temps: TempsSimule,
    private readonly dependances: DependancesAppareil,
  ) {
    this.horloge = new HorlogeSimulee(temps);
    this.generateur = new GenerateurIdentifiantsSequentiel(PREFIXES_GENERATEUR[nom]);
    this.fournisseur = new FauxFournisseurAuth({
      memoireRedirection: new MemoireRedirectionDexie(
        new BaseTechnique({ env: ENV_BANC, fabrique: this.fabrique }),
      ),
      horloge: this.horloge,
    });
  }

  /** L'application ouverte sur cet appareil ; erreur si elle est fermée. */
  get application(): Application {
    if (this.instance === undefined) {
      throw new Error(`L'application n'est pas ouverte sur le ${this.nom}`);
    }
    return this.instance;
  }

  estOuverte(): boolean {
    return this.instance !== undefined;
  }

  /**
   * Nouvelle instance (`OuvrirApplication`), puis, si une redirection d'ouverture part, son retour immédiat
   * (jeton ou erreur), sauf retour différé : l'instance reste alors en attente de Google.
   */
  async ouvrirApplication(): Promise<IssueOuverture> {
    const issue = await this.demarrer({ type: 'AUCUN' });
    if (issue.type !== 'REDIRECTION_LANCEE' || this.retourDiffere) return issue;
    return this.demarrer(this.fournisseur.acheverRedirection());
  }

  /** Livre le retour différé de la redirection en attente (glossaire : « l'accès à Google est renouvelé »). */
  livrerRetourDiffere(): Promise<IssueOuverture> {
    this.retourDiffere = false;
    return this.demarrer(this.fournisseur.acheverRedirection());
  }

  /** Ouvre l'application si elle ne l'est pas encore. */
  async assurerOuverte(): Promise<Application> {
    if (this.instance === undefined) await this.ouvrirApplication();
    return this.application;
  }

  /** Fermeture de l'application : la mémoire est perdue, les bases restent. */
  fermerApplication(): void {
    this.instance?.arreter();
    this.instance = undefined;
  }

  /** Espace du compte ouvert (dépôt) ; erreur sans session. */
  get depot(): DepotLocalDexie {
    return this.espaceOuvert().depot;
  }

  get service(): ServiceEtatLocal {
    return this.espaceOuvert().service;
  }

  /** `appareilId` de l'espace ouvert (né avec l'espace). */
  get appareilId(): IdAppareil {
    return this.depot.appareil();
  }

  /** Perte de la mémoire, conservation des bases. */
  arreterBrutalement(): void {
    this.fermerApplication();
  }

  /** Arrêt brutal, puis nouvelle origine de l'horloge monotone. */
  redemarrer(): void {
    this.arreterBrutalement();
    this.horloge.redemarrer();
  }

  private espaceOuvert(): NonNullable<ReturnType<Application['espace']>> {
    const espace = this.application.espace();
    if (espace === undefined) throw new Error(`Aucun espace de compte ouvert sur le ${this.nom}`);
    return espace;
  }

  private demarrer(retour: RetourGoogle): Promise<IssueOuverture> {
    this.fermerApplication();
    this.instance = this.assembler();
    return this.instance.ouvrirApplication.executer(retour);
  }

  private assembler(): Application {
    const { google, planificateur } = this.dependances;
    return assemblerApplication({
      env: ENV_BANC,
      fabrique: this.fabrique,
      horloge: this.horloge,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([0]),
      reseau: this.reseau,
      journal: this.journalTechnique,
      generateur: this.generateur,
      avis: this.avis,
      gardeSaisie: { saisieEnCours: () => false },
      fournisseur: () => this.fournisseur,
      transport: () => ({
        preparerDossier: () => {
          const identite = this.fournisseur.identiteDuJetonEnMemoire();
          const nom = identite === undefined ? undefined : google.nomDe(identite);
          if (nom === undefined)
            return Promise.resolve({ ok: false, erreur: { type: 'NonAutorise' } });
          return google
            .drive(nom)
            .transportPour(IDENTIFIANTS_APPAREILS[this.nom], {
              reseau: this.reseau,
              accesAccorde: () => google.accesAccorde(nom),
            })
            .preparerDossier();
        },
      }),
      surFermetureImposee: () => {
        this.fermeturesImposees += 1;
      },
    });
  }
}
