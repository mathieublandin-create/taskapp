import { nonImplemente } from '@non-implemente';

// DAT §4.2 : fichiers d'appareil compressés en gzip (CompressionStream).
export const compresser = (_octets: Uint8Array): Promise<Uint8Array> => nonImplemente('compresser');

/** Rejette (exception attrapée par format-v1) si les octets ne sont pas du gzip. */
export const decompresser = (_octets: Uint8Array): Promise<Uint8Array> =>
  nonImplemente('decompresser');
