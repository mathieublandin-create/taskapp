// conventions.md §6.2 : types marqués.
export type Marque<T, M extends string> = T & { readonly __marque: M };
