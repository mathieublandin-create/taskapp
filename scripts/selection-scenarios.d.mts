export function lireRangCourant(): number;
export function lireRangsScenarios(): Record<string, number>;
export function selectionnerScenarios(
  rangCourant: number,
  rangs?: Readonly<Record<string, number>>,
): Array<string>;
