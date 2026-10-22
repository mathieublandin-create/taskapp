/** Empreinte SHA-256 (hexadécimal) d'un contenu binaire, via SubtleCrypto. */
export async function empreinteSha256(contenu: Uint8Array): Promise<string> {
  const copie = new Uint8Array(contenu); // garantit un ArrayBuffer simple
  const condensat = await crypto.subtle.digest('SHA-256', copie);
  return Array.from(new Uint8Array(condensat), (o) => o.toString(16).padStart(2, '0')).join('');
}
