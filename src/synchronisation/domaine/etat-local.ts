import type { IdAppareil } from '../../commun/domaine/identifiants';
import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import type { RegistreQuelconque } from './ecriture';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { IndexEnAttente } from './index-en-attente';
import { cleDeChamp, cleEnTexte, type CleTexte, type RefElementMetier } from './information';

export type EtatLocal = {
  readonly appareilId: IdAppareil;
  readonly version: number; // incrémentée à chaque transaction validée
  readonly dernierHlc?: Hlc; // dernier HLC émis ou reçu ; ne recule jamais
  readonly correctionHorloge: EcartTemps; // écart mesuré avec Google ; 0 au rang 0
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
  readonly enAttente: IndexEnAttente;
};

export const ETAT_LOCAL_VIDE = (appareilId: IdAppareil): EtatLocal => ({
  appareilId,
  version: 0,
  correctionHorloge: EcartTemps.depuisMillisecondes(0),
  registres: new Map(),
  journal: new Map(),
  enAttente: new Map(),
});

/** Registre d'un champ d'objectif ou de tâche, ou undefined s'il n'a jamais été écrit. */
export const registreDe = (
  etat: EtatLocal,
  element: RefElementMetier,
  champ: string,
): RegistreQuelconque | undefined => etat.registres.get(cleEnTexte(cleDeChamp(element, champ)));
