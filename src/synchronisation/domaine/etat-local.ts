import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import type { RegistreQuelconque } from './ecriture';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { IndexEnAttente } from './index-en-attente';
import type { CleTexte } from './information';

export type EtatLocal = {
  readonly appareilId: IdAppareil;
  readonly version: number; // incrémentée à chaque transaction validée
  readonly dernierHlc?: Hlc; // dernier HLC émis ou reçu ; ne recule jamais
  readonly correctionHorloge: EcartTemps; // écart mesuré avec Google ; 0 au rang 0
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
  readonly enAttente: IndexEnAttente;
};

export const ETAT_LOCAL_VIDE = (_appareilId: IdAppareil): EtatLocal =>
  nonImplemente('ETAT_LOCAL_VIDE');
