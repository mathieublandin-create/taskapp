import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  ErreurTransport,
  IdFichierDrive,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import type { TempsSimule } from '../support/banc/temps-simule';

type Conditions = { readonly reseau: EtatReseau; readonly accesAccorde: () => boolean };

const TYPE_DOSSIER = 'application/vnd.google-apps.folder';

/** Fichier du Drive simulé (API d'observation). */
export type FichierFaux = {
  readonly id: string;
  readonly nom: string;
  readonly mimeType: string;
  readonly appProperties: Readonly<Record<string, string>>;
  readonly parent?: string;
  readonly octets: Uint8Array;
  readonly creeA: number;
  readonly modifieA: number;
  readonly supprime: boolean;
};

/**
 * Doublure du port TransportSynchro, Drive d'un compte (ST-US-022 §12.3, ST-US-017 §12.3).
 * Squelette E10 : réalisée par Benjamin (rang 1 : dossier ; rang 3 : complet). Contrat : tests/contrats/transport-synchro.contrat.ts.
 * - `transportPour(appareil, conditions)` : vue d'un appareil ; réseau coupé → ReseauIndisponible ;
 *   `accesAccorde()` faux → NonAutorise ; chaque appel réussi ou en erreur métier compte une réponse ;
 * - les fichiers d'appareil et le manifeste sont produits et relus par encoder/decoder du format v1 réel ;
 * - pilotage : `plein()` / `liberer()` (dépôt → EspaceDrivePlein) ; `indisponible(n | 'toujours')` (les n appels
 *   suivants → ServeurIndisponible ; `retablir()` arrête) ; `interrompreDepots(n)` (les n dépôts suivants →
 *   ReseauIndisponible, sans rien écrire) ; `perdreReponseDuProchainDepot()` (le dépôt suivant est écrit,
 *   mais l'appel renvoie ReseauIndisponible) ; `avantReponseDuProchainDepot(rappel)` (le dépôt suivant est écrit,
 *   puis le rappel est attendu avant la réponse) ; `desactiverPourLeCompte()` (tout appel → DriveIndisponible) ;
 * - observation : `fichiers()`, `nombreReponses(appareil)`, `ecrituresPar(appareil)` (créations et remplacements).
 */
export class FauxDrive {
  readonly #fichiers: Array<FichierFaux> = [];
  readonly #reponses = new Map<IdAppareil, number>();
  #indisponibles: number | 'toujours' = 0;
  #desactive = false;
  #numero = 0;

  constructor(private readonly temps: TempsSimule) {}

  /** Rang 1 : `preparerDossier` seulement ; les autres opérations arrivent au rang 3 (ST-US-017). */
  transportPour(appareil: IdAppareil, conditions: Conditions): TransportSynchro {
    const rang3 = (operation: string) => (): never => nonImplemente(`FauxDrive.${operation}`);
    return {
      preparerDossier: () => Promise.resolve(this.#preparerDossier(appareil, conditions)),
      listerFichiersAppareils: rang3('listerFichiersAppareils'),
      changements: rang3('changements'),
      lireFichierAppareil: rang3('lireFichierAppareil'),
      deposerFichierAppareil: rang3('deposerFichierAppareil'),
      lireManifeste: rang3('lireManifeste'),
      ecrireManifeste: rang3('ecrireManifeste'),
    };
  }

  /** Recherche le dossier de l'application (le plus ancien non supprimé), le crée à la racine s'il manque. */
  #preparerDossier(
    appareil: IdAppareil,
    conditions: Conditions,
  ): Resultat<IdFichierDrive, ErreurTransport> {
    const refus = this.#refus(conditions);
    if (refus?.type === 'ReseauIndisponible') return echec(refus);
    this.#reponses.set(appareil, this.nombreReponses(appareil) + 1);
    if (refus !== undefined) return echec(refus);
    const existant = this.#fichiers.find(
      (f) =>
        !f.supprime && f.mimeType === TYPE_DOSSIER && f.appProperties['donejuan'] === 'dossier',
    );
    return succes((existant ?? this.#creerDossier()).id as IdFichierDrive);
  }

  #refus(conditions: Conditions): ErreurTransport | undefined {
    if (!conditions.reseau.estConnecte()) return { type: 'ReseauIndisponible' };
    if (!conditions.accesAccorde()) return { type: 'NonAutorise' };
    if (this.#desactive) return { type: 'DriveIndisponible' };
    if (this.#indisponibles === 'toujours') return { type: 'ServeurIndisponible' };
    if (this.#indisponibles > 0) {
      this.#indisponibles -= 1;
      return { type: 'ServeurIndisponible' };
    }
    return undefined;
  }

  #creerDossier(): FichierFaux {
    this.#numero += 1;
    const maintenant = this.temps.maintenant();
    const dossier: FichierFaux = {
      id: `fichier-${String(this.#numero)}`,
      nom: 'Done Juan',
      mimeType: TYPE_DOSSIER,
      appProperties: { donejuan: 'dossier' },
      octets: new Uint8Array(),
      creeA: maintenant,
      modifieA: maintenant,
      supprime: false,
    };
    this.#fichiers.push(dossier);
    return dossier;
  }

  plein(): void {
    nonImplemente('FauxDrive.plein');
  }

  liberer(): void {
    nonImplemente('FauxDrive.liberer');
  }

  indisponible(fois: number | 'toujours'): void {
    this.#indisponibles = fois;
  }

  retablir(): void {
    this.#indisponibles = 0;
  }

  interrompreDepots(_n: number): void {
    nonImplemente('FauxDrive.interrompreDepots');
  }

  perdreReponseDuProchainDepot(): void {
    nonImplemente('FauxDrive.perdreReponseDuProchainDepot');
  }

  avantReponseDuProchainDepot(_rappel: () => Promise<void>): void {
    nonImplemente('FauxDrive.avantReponseDuProchainDepot');
  }

  /** Change une valeur du JSON du fichier, en gardant un gzip valide et l'ancienne empreinte (V-02, incrément 3). */
  modifierFichierALaMain(_id: string): void {
    nonImplemente('FauxDrive.modifierFichierALaMain');
  }

  /**
   * RL-LOT-001-A3 : `rappel` est exécuté une fois, au prochain `listerFichiersAppareils`, après la prise du jeton
   * de départ et avant l'inventaire (simule une écriture d'un autre appareil pendant l'inventaire).
   */
  pendantLeProchainInventaire(_rappel: () => Promise<void>): void {
    nonImplemente('FauxDrive.pendantLeProchainInventaire');
  }

  /** RL-LOT-001-A3 : tous les jetons de changements émis jusqu'ici deviennent invalides (JetonChangementsInvalide). */
  invaliderJetons(): void {
    nonImplemente('FauxDrive.invaliderJetons');
  }

  desactiverPourLeCompte(): void {
    this.#desactive = true;
  }

  fichiers(): ReadonlyArray<FichierFaux> {
    return [...this.#fichiers];
  }

  nombreReponses(appareil: IdAppareil): number {
    return this.#reponses.get(appareil) ?? 0;
  }

  ecrituresPar(_appareil: IdAppareil): number {
    return nonImplemente('FauxDrive.ecrituresPar');
  }
}
