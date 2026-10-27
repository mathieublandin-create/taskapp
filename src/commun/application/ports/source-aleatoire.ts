// conventions.md §7.4 (DS-20).
export interface SourceAleatoire {
  octets(n: number): Uint8Array;
  entierEntre(min: number, max: number): number;
}
