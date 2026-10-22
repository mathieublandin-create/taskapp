const OCTETS_ALEATOIRES = 10_000;

function enBase64(octets: Uint8Array): string {
  let texte = '';
  for (const o of octets) texte += String.fromCharCode(o);
  return btoa(texte);
}

async function compresser(texte: string): Promise<Uint8Array> {
  const flux = (new Response(texte).body as ReadableStream<Uint8Array>).pipeThrough(
    new CompressionStream('gzip') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>,
  );
  return new Uint8Array(await new Response(flux).arrayBuffer());
}

/**
 * Génère le fichier d'état factice (environ 10 Ko une fois compressé).
 * Le contenu aléatoire change à chaque appel : l'empreinte change donc à chaque modification.
 */
export async function genererEtatPoc(appareil: string): Promise<Uint8Array> {
  const alea = crypto.getRandomValues(new Uint8Array(OCTETS_ALEATOIRES));
  const etat = { appareil, genereLe: new Date().toISOString(), donneesFactices: enBase64(alea) };
  return compresser(JSON.stringify(etat));
}
