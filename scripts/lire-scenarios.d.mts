export const DOSSIER_FEATURES: string;

export type Scenario = {
  readonly chemin: string;
  readonly ligne: number;
  readonly nom: string;
  readonly tags: ReadonlyArray<string>;
  /** `US-001 S06`, ou undefined si le titre n'a pas la forme « Snn — … ». */
  readonly identifiant: string | undefined;
};

export function lireScenarios(racine?: string): Array<Scenario>;
