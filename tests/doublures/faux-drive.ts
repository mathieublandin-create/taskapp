import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';
import type { TempsSimule } from '../support/banc/temps-simule';

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
  constructor(private readonly temps: TempsSimule) {}

  transportPour(
    _appareil: IdAppareil,
    _conditions: { readonly reseau: EtatReseau; readonly accesAccorde: () => boolean },
  ): TransportSynchro {
    return nonImplemente('FauxDrive.transportPour');
  }

  plein(): void {
    nonImplemente('FauxDrive.plein');
  }

  liberer(): void {
    nonImplemente('FauxDrive.liberer');
  }

  indisponible(_fois: number | 'toujours'): void {
    nonImplemente('FauxDrive.indisponible');
  }

  retablir(): void {
    nonImplemente('FauxDrive.retablir');
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

  desactiverPourLeCompte(): void {
    nonImplemente('FauxDrive.desactiverPourLeCompte');
  }

  fichiers(): ReadonlyArray<FichierFaux> {
    return nonImplemente('FauxDrive.fichiers');
  }

  nombreReponses(_appareil: IdAppareil): number {
    return nonImplemente('FauxDrive.nombreReponses');
  }

  ecrituresPar(_appareil: IdAppareil): number {
    return nonImplemente('FauxDrive.ecrituresPar');
  }
}
