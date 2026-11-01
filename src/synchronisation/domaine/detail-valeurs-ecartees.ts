import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../commun/domaine/duree';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatLocal } from './etat-local';
import type { CycleDeVie, RefElementMetier } from './information';
import type { Signalements } from './signalements';
import type { IdValeurEcartee, MotifValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.5 §4.6, §6.6 n° 12 ; glossaire §8 (colonnes « élément », « information », « valeur non retenue »,
// « valeur conservée ») ; H-2. Règle de lecture hors de la présentation (même découpage qu'`elementsEnAttenteDetailles`).

/** Colonne « information » du glossaire §8 : intitulé, description, délai, estimation, objectifs, parent, état, création. */
export type InformationSignalee =
  | 'INTITULE'
  | 'DESCRIPTION'
  | 'DELAI'
  | 'ESTIMATION'
  | 'OBJECTIFS'
  | 'PARENT'
  | 'ETAT'
  | 'CREATION';

/** Colonnes « valeur non retenue » et « valeur conservée » du glossaire §8, structurées (formatage : présentation). */
export type ValeurSignalee =
  | { readonly type: 'TEXTE'; readonly texte: string }
  | { readonly type: 'AUCUNE' }
  | { readonly type: 'DATE'; readonly date: DateCalendaire }
  | { readonly type: 'DUREE'; readonly duree: Duree }
  /** v0.6 (RG-056) : `date` = `dateFin` (terminée), `dateAbandon` (abandonnée) ; absente pour « à faire ». */
  | { readonly type: 'ETAT'; readonly etat: CycleDeVie['etat']; readonly date?: DateCalendaire }
  | { readonly type: 'SOUS'; readonly intitule: string }
  | { readonly type: 'PRINCIPAL' }
  | { readonly type: 'RATTACHEE'; readonly intitule: string }
  | { readonly type: 'DETACHEE'; readonly intitule: string }
  | { readonly type: 'SOUS_TACHE_DE'; readonly intitule: string }
  | { readonly type: 'CREEE' }
  | { readonly type: 'TACHE_SUPPRIMEE' }
  | { readonly type: 'OBJECTIF_SUPPRIME' }
  | { readonly type: 'SUPPRIMEE_AVEC'; readonly intitule: string }
  | { readonly type: 'PLACEMENT_ANNULE' }
  | { readonly type: 'DONNEES_EFFACEES' };

export type ValeurEcarteeDetaillee = {
  readonly id: IdValeurEcartee;
  readonly motif: MotifValeurEcartee;
  /** Élément de l'écriture écartée (lien → sa tâche, H-2). */
  readonly element: RefElementMetier;
  /** Colonne « élément » : `intituleElement`, sinon registre `intitule` de l'élément, même supprimé, sinon ''. */
  readonly intitule: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
  readonly valeurConservee: ValeurSignalee;
  /** Physique de `hlcDuGagnant` (ordre de la feuille, `ordre-feuille.ts`). */
  readonly instant: Instant;
  readonly lue: boolean;
  /** Créé, non supprimé, et tâche parente non supprimée (action « Voir »). */
  readonly elementExiste: boolean;
  /** `SUPPRESSION` : élément de la pierre tombale. */
  readonly supprime?: RefElementMetier;
};

/** Une entrée par valeur écartée de `signalements`, lues comprises ; ordre non garanti (§6.6 n° 12). */
export const detaillerValeursEcartees = (
  etat: EtatLocal,
  signalements: Signalements,
): ReadonlyArray<ValeurEcarteeDetaillee> =>
  nonImplemente(
    `detaillerValeursEcartees (${String(etat.registres.size)}, ${String(signalements.valeursEcartees.size)})`,
  );
