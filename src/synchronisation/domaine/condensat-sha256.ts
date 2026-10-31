import { nonImplemente } from '@non-implemente';

// ST-US-017 v0.5 §4.6 (incrément 2) : condensat synchrone du domaine (crypto.subtle est asynchrone, donc exclu d'un
// calcul de transaction). FIPS 180-4, sans dépendance ; vérifié contre crypto.subtle par UT-US-017-40.

/** SHA-256 des octets (32 octets). */
export const condensatSha256 = (octets: Uint8Array): Uint8Array =>
  nonImplemente(`condensatSha256 (${String(octets.length)} octets)`);

/** Base32hex (RFC 4648 §7), alphabet `0123456789abcdefghijklmnopqrstuv` en minuscules, sans remplissage `=`. */
export const encoderBase32Hex = (octets: Uint8Array): string =>
  nonImplemente(`encoderBase32Hex (${String(octets.length)} octets)`);
