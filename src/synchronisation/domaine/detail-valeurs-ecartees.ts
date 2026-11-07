import { assertNever } from '../../commun/domaine/assert-never';
import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import type { Duree } from '../../commun/domaine/duree';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import { registreDe, type EtatLocal } from './etat-local';
import { elementDeCle, partiesDuLien, type CycleDeVie, type RefElementMetier } from './information';
import type { Signalements } from './signalements';
import {
  hlcDuGagnant,
  type IdValeurEcartee,
  type MotifValeurEcartee,
  type ValeurEcartee,
} from './valeurs-ecartees';

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

const intituleCourant = (etat: EtatLocal, element: RefElementMetier): string => {
  const registre = registreDe(etat, element, 'intitule');
  return typeof registre?.ecriture.valeur === 'string' ? registre.ecriture.valeur : '';
};

const informationDe = (registre: RegistreQuelconque): InformationSignalee => {
  const champ = registre.cle.champ;
  switch (champ) {
    case 'intitule':
      return 'INTITULE';
    case 'description':
      return 'DESCRIPTION';
    case 'delai':
      return 'DELAI';
    case 'estimationInitiale':
      return 'ESTIMATION';
    case 'actif':
      return 'OBJECTIFS';
    case 'parent':
      return 'PARENT';
    case 'cycleDeVie':
      return 'ETAT';
    case 'creation':
      return 'CREATION';
    case 'suppression':
      throw new ErreurProgrammation('Une pierre tombale n’est jamais une valeur non retenue');
    default:
      return assertNever(champ);
  }
};

type Lecteur = (etat: EtatLocal, registre: RegistreQuelconque) => ValeurSignalee | undefined;

const lireTexte: Lecteur = (_etat, registre) => {
  if (estRegistre(registre, 'OBJECTIF', 'intitule') || estRegistre(registre, 'TACHE', 'intitule')) {
    return { type: 'TEXTE', texte: registre.ecriture.valeur };
  }
  if (!estRegistre(registre, 'OBJECTIF', 'description')) return undefined;
  const texte = registre.ecriture.valeur;
  return texte === undefined ? { type: 'AUCUNE' } : { type: 'TEXTE', texte };
};

const lireDelai: Lecteur = (_etat, registre) => {
  if (!estRegistre(registre, 'OBJECTIF', 'delai') && !estRegistre(registre, 'TACHE', 'delai')) {
    return undefined;
  }
  const date = registre.ecriture.valeur;
  return date === undefined ? { type: 'AUCUNE' } : { type: 'DATE', date };
};

/** RG-056 : la valeur d'état porte sa date (fin ou abandon) ; « à faire » n'en a pas. */
const valeurEtat = (cycle: CycleDeVie): ValeurSignalee => {
  switch (cycle.etat) {
    case 'A_FAIRE':
      return { type: 'ETAT', etat: 'A_FAIRE' };
    case 'TERMINEE':
      return { type: 'ETAT', etat: 'TERMINEE', date: cycle.dateFin };
    case 'ABANDONNEE':
      return { type: 'ETAT', etat: 'ABANDONNEE', date: cycle.dateAbandon };
    default:
      return assertNever(cycle);
  }
};

const lireMesure: Lecteur = (_etat, registre) => {
  if (estRegistre(registre, 'TACHE', 'estimationInitiale')) {
    return { type: 'DUREE', duree: registre.ecriture.valeur };
  }
  return estRegistre(registre, 'TACHE', 'cycleDeVie')
    ? valeurEtat(registre.ecriture.valeur)
    : undefined;
};

const lirePlacement: Lecteur = (etat, registre) => {
  if (!estRegistre(registre, 'OBJECTIF', 'parent')) return undefined;
  const { parentId } = registre.ecriture.valeur;
  return parentId === undefined
    ? { type: 'PRINCIPAL' }
    : { type: 'SOUS', intitule: intituleCourant(etat, { type: 'OBJECTIF', id: parentId }) };
};

const lireLien: Lecteur = (etat, registre) => {
  if (!estRegistre(registre, 'LIEN_TACHE_OBJECTIF', 'actif')) return undefined;
  const objectif = { type: 'OBJECTIF', id: partiesDuLien(registre.cle.id).objectifId } as const;
  return {
    type: registre.ecriture.valeur ? 'RATTACHEE' : 'DETACHEE',
    intitule: intituleCourant(etat, objectif),
  };
};

const lireCreation: Lecteur = (etat, registre) => {
  if (estRegistre(registre, 'OBJECTIF', 'creation')) return { type: 'CREEE' };
  if (!estRegistre(registre, 'TACHE', 'creation')) return undefined;
  const { tacheParenteId } = registre.ecriture.valeur;
  return tacheParenteId === undefined
    ? { type: 'CREEE' }
    : {
        type: 'SOUS_TACHE_DE',
        intitule: intituleCourant(etat, { type: 'TACHE', id: tacheParenteId }),
      };
};

const LECTEURS: ReadonlyArray<Lecteur> = [
  lireTexte,
  lireDelai,
  lireMesure,
  lirePlacement,
  lireLien,
  lireCreation,
];

const valeurDe = (etat: EtatLocal, registre: RegistreQuelconque): ValeurSignalee => {
  for (const lecteur of LECTEURS) {
    const valeur = lecteur(etat, registre);
    if (valeur !== undefined) return valeur;
  }
  throw new ErreurProgrammation('Une pierre tombale n’est jamais une valeur non retenue');
};

const tacheParenteDe = (registre: RegistreQuelconque | undefined) =>
  registre !== undefined && estRegistre(registre, 'TACHE', 'creation')
    ? registre.ecriture.valeur.tacheParenteId
    : undefined;

const estSupprime = (etat: EtatLocal, element: RefElementMetier): boolean =>
  registreDe(etat, element, 'suppression') !== undefined;

/** Créé, non supprimé, et pour une sous-tâche tâche parente non supprimée. */
const elementExiste = (etat: EtatLocal, element: RefElementMetier): boolean => {
  const creation = registreDe(etat, element, 'creation');
  if (creation === undefined || estSupprime(etat, element)) return false;
  const parente = tacheParenteDe(creation);
  return parente === undefined || !estSupprime(etat, { type: 'TACHE', id: parente });
};

const valeurConserveeSuppression = (
  etat: EtatLocal,
  ecartee: RegistreQuelconque,
  supprime: RefElementMetier,
): ValeurSignalee =>
  supprime.type === 'TACHE' && tacheParenteDe(ecartee) === supprime.id
    ? { type: 'SUPPRIMEE_AVEC', intitule: intituleCourant(etat, supprime) }
    : { type: supprime.type === 'TACHE' ? 'TACHE_SUPPRIMEE' : 'OBJECTIF_SUPPRIME' };

type Conservee = { readonly valeurConservee: ValeurSignalee; readonly supprime?: RefElementMetier };

const conserveeDe = (etat: EtatLocal, v: ValeurEcartee): Conservee => {
  switch (v.motif) {
    case 'CONFLIT':
      return { valeurConservee: valeurDe(etat, v.gagnante) };
    case 'SUPPRESSION': {
      const supprime = elementDeCle(v.gagnante.cle);
      return { valeurConservee: valeurConserveeSuppression(etat, v.ecartee, supprime), supprime };
    }
    case 'PLACEMENT_ANNULE':
      return { valeurConservee: { type: 'PLACEMENT_ANNULE' } };
    case 'DONNEES_EFFACEES':
      return { valeurConservee: { type: 'DONNEES_EFFACEES' } };
    default:
      return assertNever(v);
  }
};

const intituleDeLElement = (etat: EtatLocal, v: ValeurEcartee, element: RefElementMetier) =>
  (v.motif === 'SUPPRESSION' || v.motif === 'DONNEES_EFFACEES') && v.intituleElement !== undefined
    ? v.intituleElement
    : intituleCourant(etat, element);

const detaillerUne = (
  etat: EtatLocal,
  signalements: Signalements,
  v: ValeurEcartee,
): ValeurEcarteeDetaillee => {
  const element = elementDeCle(v.ecartee.cle);
  return {
    id: v.id,
    motif: v.motif,
    element,
    intitule: intituleDeLElement(etat, v, element),
    information: informationDe(v.ecartee),
    valeurNonRetenue: valeurDe(etat, v.ecartee),
    ...conserveeDe(etat, v),
    instant: hlcDuGagnant(v).physique,
    lue: signalements.lectures.has(v.id),
    elementExiste: elementExiste(etat, element),
  };
};

/**
 * `ALR-008` n'est affichée que sur l'appareil qui découvre le choix fait ailleurs, `ALR-014` que sur celui dont la
 * modification est perdue : une entrée `DONNEES_EFFACEES` n'est détaillée que par l'auteur de l'écriture écartée
 * (ST-US-017 v0.10 §6.7 n° 10 d, guide §6.6.9).
 */
const estDetaillee = (etat: EtatLocal, v: ValeurEcartee): boolean =>
  v.motif !== 'DONNEES_EFFACEES' || v.ecartee.ecriture.hlc.appareil === etat.appareilId;

/** Une entrée par valeur écartée de `signalements`, lues comprises ; ordre non garanti (§6.6 n° 12). */
export const detaillerValeursEcartees = (
  etat: EtatLocal,
  signalements: Signalements,
): ReadonlyArray<ValeurEcarteeDetaillee> =>
  [...signalements.valeursEcartees.values()]
    .filter((v) => estDetaillee(etat, v))
    .map((v) => detaillerUne(etat, signalements, v));
