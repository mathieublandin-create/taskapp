export type DefinitionUsage = {
  readonly pattern: string;
  readonly uri: string;
  readonly matches: ReadonlyArray<unknown>;
};

export function definitionsInutilisees(
  usage: ReadonlyArray<DefinitionUsage>,
): Array<{ pattern: string; uri: string }>;
