// DAT §4.2 : fichiers d'appareil compressés en gzip (CompressionStream).

const transformer = async (
  octets: Uint8Array,
  flux: CompressionStream | DecompressionStream,
): Promise<Uint8Array> => {
  const source = new Blob([new Uint8Array(octets)]).stream();
  const reponse = new Response(source.pipeThrough<Uint8Array<ArrayBuffer>>(flux));
  return new Uint8Array(await reponse.arrayBuffer());
};

export const compresser = (octets: Uint8Array): Promise<Uint8Array> =>
  transformer(octets, new CompressionStream('gzip'));

/** Rejette (exception attrapée par format-v1) si les octets ne sont pas du gzip. */
export const decompresser = (octets: Uint8Array): Promise<Uint8Array> =>
  transformer(octets, new DecompressionStream('gzip'));
