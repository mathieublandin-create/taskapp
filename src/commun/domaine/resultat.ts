// conventions.md §8.1 (DS-12). Type fondateur, livré complet dès E10 : les tests l'utilisent pour leurs attentes.
export type Succes<T> = { readonly ok: true; readonly valeur: T };
export type Echec<E> = { readonly ok: false; readonly erreur: E };
export type Resultat<T, E> = Succes<T> | Echec<E>;

export const succes = <T>(valeur: T): Succes<T> => ({ ok: true, valeur });
export const echec = <E>(erreur: E): Echec<E> => ({ ok: false, erreur });
