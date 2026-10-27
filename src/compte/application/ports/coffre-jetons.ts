import type { Marque } from '../../../commun/domaine/marque';
import type { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';

// DS-06, RED-05 : le jeton d'accès n'existe qu'en mémoire.
export type JetonAcces = Marque<string, 'JetonAcces'>;
/** Échéance sur l'horloge monotone (Horloge.monotone). */
export type JetonEnCoffre = { readonly jeton: JetonAcces; readonly echeance: EcartTemps };

export interface CoffreJetons {
  placer(jeton: JetonEnCoffre): void;
  lire(): JetonEnCoffre | undefined;
  vider(): void;
}
