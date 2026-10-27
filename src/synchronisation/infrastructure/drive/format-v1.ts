import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurTransport } from '../../application/ports/transport-synchro';
import type { ContenuFichierAppareil, ContenuManifeste } from '../../domaine/contenu-fichier';

// ST-US-017 §5.2 : schéma 1 (schémas Zod lâches dans ./schemas/v1.ts, `.strict()` interdit).
export type ErreurLecture = Extract<
  ErreurTransport,
  { readonly type: 'FichierIllisible' | 'FormatPlusRecent' }
>;

/** Sérialisation canonique avec empreinte, puis gzip. */
export const encoderFichierAppareil = (_contenu: ContenuFichierAppareil): Promise<Uint8Array> =>
  nonImplemente('encoderFichierAppareil');

/** gunzip, JSON, schemaVersion (> SCHEMA_VERSION : FormatPlusRecent), Zod, empreinte. */
export const decoderFichierAppareil = (
  _octets: Uint8Array,
): Promise<Resultat<ContenuFichierAppareil, ErreurLecture>> =>
  nonImplemente('decoderFichierAppareil');

/** JSON canonique avec empreinte (non compressé). */
export const encoderManifeste = (_contenu: ContenuManifeste): Promise<Uint8Array> =>
  nonImplemente('encoderManifeste');

export const decoderManifeste = (
  _octets: Uint8Array,
): Promise<Resultat<ContenuManifeste, ErreurLecture>> => nonImplemente('decoderManifeste');
