// ST-US-017 v0.5 §4.6, §6.6 n° 1 (incrément 2) : condensat synchrone du domaine (crypto.subtle est asynchrone, donc
// exclu d'un calcul de transaction). FIPS 180-4, sans dépendance ; vérifié contre crypto.subtle par UT-US-017-40.

const OCTETS_PAR_MOT = 4;
const OCTETS_PAR_BLOC = 64;
const MOTS_PAR_BLOC = OCTETS_PAR_BLOC / OCTETS_PAR_MOT;
const OCTETS_LONGUEUR = 8;
const MOTS_PLANIFIES = 64;
const MOTS_ETAT = 8;
const BIT_DE_FIN = 0x80;
const BITS_PAR_OCTET = 8;
const BITS_PAR_MOT = 32;
const DEUX_PUISSANCE_32 = 0x1_0000_0000;

// Mots de 32 bits rangés dans des DataView : lecture toujours définie, écriture réduite modulo 2³² (setUint32).
const mot = (vue: DataView, i: number): number => vue.getUint32(i * OCTETS_PAR_MOT);
const ecrireMot = (vue: DataView, i: number, valeur: number): void => {
  vue.setUint32(i * OCTETS_PAR_MOT, valeur);
};
const vueDeMots = (mots: ReadonlyArray<number>): DataView => {
  const vue = new DataView(new ArrayBuffer(mots.length * OCTETS_PAR_MOT));
  mots.forEach((valeur, i) => {
    ecrireMot(vue, i, valeur);
  });
  return vue;
};

/** FIPS 180-4 §4.2.2 : 32 premiers bits des parties fractionnaires des racines cubiques des 64 premiers nombres premiers. */
const K = vueDeMots([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** FIPS 180-4 §5.3.3 : valeur initiale H(0). */
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
] as const;

/** ROTR^n (FIPS 180-4 §3.2). */
const rotd = (x: number, n: number): number => (x >>> n) | (x << (BITS_PAR_MOT - n));

/** FIPS 180-4 §5.1.1 : message complété (bit 1, zéros, longueur en bits sur 64 bits gros-boutiste). */
const completer = (octets: Uint8Array): DataView => {
  const longueur =
    Math.ceil((octets.length + 1 + OCTETS_LONGUEUR) / OCTETS_PAR_BLOC) * OCTETS_PAR_BLOC;
  const complete = new Uint8Array(longueur);
  complete.set(octets);
  complete[octets.length] = BIT_DE_FIN;
  const vue = new DataView(complete.buffer);
  const bits = octets.length * BITS_PAR_OCTET;
  vue.setUint32(longueur - OCTETS_LONGUEUR, Math.floor(bits / DEUX_PUISSANCE_32));
  vue.setUint32(longueur - OCTETS_PAR_MOT, bits >>> 0);
  return vue;
};

/** FIPS 180-4 §6.2.2, étape 1 : planification des 64 mots du bloc qui commence au mot `debut`. */
const planifier = (message: DataView, debut: number): DataView => {
  const w = new DataView(new ArrayBuffer(MOTS_PLANIFIES * OCTETS_PAR_MOT));
  for (let t = 0; t < MOTS_PAR_BLOC; t += 1) ecrireMot(w, t, mot(message, debut + t));
  for (let t = MOTS_PAR_BLOC; t < MOTS_PLANIFIES; t += 1) {
    const w15 = mot(w, t - 15);
    const w2 = mot(w, t - 2);
    const s0 = rotd(w15, 7) ^ rotd(w15, 18) ^ (w15 >>> 3);
    const s1 = rotd(w2, 17) ^ rotd(w2, 19) ^ (w2 >>> 10);
    ecrireMot(w, t, mot(w, t - 16) + s0 + mot(w, t - 7) + s1);
  }
  return w;
};

/** FIPS 180-4 §6.2.2, étapes 2 à 4 : la valeur intermédiaire `h` reçoit la compression du bloc planifié `w`. */
const comprimer = (h: DataView, w: DataView): void => {
  let [a, b, c, d] = [mot(h, 0), mot(h, 1), mot(h, 2), mot(h, 3)];
  let [e, f, g, hh] = [mot(h, 4), mot(h, 5), mot(h, 6), mot(h, 7)];
  for (let t = 0; t < MOTS_PLANIFIES; t += 1) {
    const s1 = rotd(e, 6) ^ rotd(e, 11) ^ rotd(e, 25);
    const ch = (e & f) ^ (~e & g);
    const t1 = (hh + s1 + ch + mot(K, t) + mot(w, t)) >>> 0;
    const s0 = rotd(a, 2) ^ rotd(a, 13) ^ rotd(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    [hh, g, f, e, d, c, b, a] = [g, f, e, (d + t1) >>> 0, c, b, a, (t1 + s0 + maj) >>> 0];
  }
  [a, b, c, d, e, f, g, hh].forEach((x, i) => {
    ecrireMot(h, i, mot(h, i) + x);
  });
};

/** SHA-256 des octets (32 octets). */
export const condensatSha256 = (octets: Uint8Array): Uint8Array => {
  const message = completer(octets);
  const h = vueDeMots(H0);
  for (let bloc = 0; bloc < message.byteLength / OCTETS_PAR_BLOC; bloc += 1) {
    comprimer(h, planifier(message, bloc * MOTS_PAR_BLOC));
  }
  return new Uint8Array(h.buffer, 0, MOTS_ETAT * OCTETS_PAR_MOT);
};

const ALPHABET_BASE32HEX = '0123456789abcdefghijklmnopqrstuv';
const BITS_PAR_CARACTERE = 5;
const MASQUE_CARACTERE = 0b1_1111;
const MASQUE_TAMPON = 0xffff;

/** Base32hex (RFC 4648 §7), alphabet `0123456789abcdefghijklmnopqrstuv` en minuscules, sans remplissage `=`. */
export const encoderBase32Hex = (octets: Uint8Array): string => {
  let texte = '';
  let tampon = 0;
  let bits = 0;
  for (const octet of octets) {
    tampon = ((tampon << BITS_PAR_OCTET) | octet) & MASQUE_TAMPON;
    bits += BITS_PAR_OCTET;
    while (bits >= BITS_PAR_CARACTERE) {
      bits -= BITS_PAR_CARACTERE;
      texte += ALPHABET_BASE32HEX.charAt((tampon >>> bits) & MASQUE_CARACTERE);
    }
  }
  if (bits === 0) return texte;
  return (
    texte + ALPHABET_BASE32HEX.charAt((tampon << (BITS_PAR_CARACTERE - bits)) & MASQUE_CARACTERE)
  );
};

/**
 * Forme d'un condensat SHA-256 encodé par `encoderBase32Hex` : 256 bits, soit 52 caractères `[0-9a-v]`. Celle d'un
 * identifiant de valeur écartée et, par construction, d'une entrée de réparation (ST-US-017 §6.6 n° 1, n° 9 d ; CR-22).
 */
export const FORME_CONDENSAT_BASE32HEX = /^[0-9a-v]{52}$/;
