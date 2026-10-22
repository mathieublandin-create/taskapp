import type { EcritureDatee } from './contexte-causal';
import type { ChampDe, IdDe, TypeElement, ValeursParChamp } from './information';

export type Ecriture<V> = EcritureDatee & { readonly valeur: V };

export type Registre<T extends TypeElement, C extends ChampDe<T>> = {
  readonly cle: { readonly type: T; readonly id: IdDe<T>; readonly champ: C };
  readonly ecriture: Ecriture<ValeursParChamp[T][C]>;
};

export type RegistreQuelconque = {
  [T in TypeElement]: { [C in ChampDe<T>]: Registre<T, C> }[ChampDe<T>];
}[TypeElement];
