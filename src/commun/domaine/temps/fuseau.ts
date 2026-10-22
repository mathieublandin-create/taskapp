import type { Marque } from '../marque';

// conventions.md §7.1 : identifiant IANA, jamais persisté.
export type Fuseau = Marque<string, 'Fuseau'>;
