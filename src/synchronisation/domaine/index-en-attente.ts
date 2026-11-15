import type { Instant } from '../../commun/domaine/temps/instant';
import type { Hlc } from './hlc';
import {
  cleDeChamp,
  cleEnTexte,
  elementDeCle,
  type CleInformation,
  type CleTexte,
  type RefElementMetier,
} from './information';

// DAT §4.1.5 bis v0.10.1, H-4 (ST-socle-ecriture.md §6.5).
export type EntreeEnAttente = {
  readonly premiereEcriture: Instant; // instant corrigé de la première écriture locale non déposée
  readonly derniereHlc: Hlc; // HLC de la dernière écriture de cette information
};

export type IndexEnAttente = ReadonlyMap<
  CleTexte,
  { readonly cle: CleInformation; readonly entree: EntreeEnAttente }
>;

export const enregistrerEnAttente = (
  index: IndexEnAttente,
  cle: CleInformation,
  hlc: Hlc,
  instantCorrige: Instant,
): IndexEnAttente => {
  const texte = cleEnTexte(cle);
  const premiereEcriture = index.get(texte)?.entree.premiereEcriture ?? instantCorrige;
  return new Map(index).set(texte, { cle, entree: { premiereEcriture, derniereHlc: hlc } });
};

const memeElement = (a: RefElementMetier, b: RefElementMetier): boolean =>
  a.type === b.type && a.id === b.id;

/** Entrée (type, id, 'creation') présente. */
export const aCreationNonDeposee = (index: IndexEnAttente, element: RefElementMetier): boolean =>
  index.has(cleEnTexte(cleDeChamp(element, 'creation')));

/** Champs de l'élément et, pour une tâche, ses liens. */
export const retirerEntreesDeElement = (
  index: IndexEnAttente,
  element: RefElementMetier,
): IndexEnAttente =>
  new Map([...index].filter(([, { cle }]) => !memeElement(elementDeCle(cle), element)));

/** Paramètres de purgerPourSuppression (objet nommé : RCD-02). */
export type PurgeSuppression = {
  readonly element: RefElementMetier;
  readonly descendantsSupprimes: ReadonlyArray<RefElementMetier>;
  readonly hlc: Hlc;
  readonly instantCorrige: Instant;
};

export const purgerPourSuppression = (
  index: IndexEnAttente,
  { element, descendantsSupprimes, hlc, instantCorrige }: PurgeSuppression,
): IndexEnAttente => {
  const sansDescendants = descendantsSupprimes
    .filter((descendant) => aCreationNonDeposee(index, descendant))
    .reduce(retirerEntreesDeElement, index);
  if (aCreationNonDeposee(sansDescendants, element)) {
    return retirerEntreesDeElement(sansDescendants, element);
  }
  return enregistrerEnAttente(
    sansDescendants,
    cleDeChamp(element, 'suppression'),
    hlc,
    instantCorrige,
  );
};

/** Identifiants d'objectifs et de tâches qui ont au moins une entrée. */
export const elementsEnAttente = (index: IndexEnAttente): ReadonlySet<string> =>
  new Set([...index.values()].map(({ cle }) => elementDeCle(cle).id));

/** Nombre d'éléments distincts (objectif, tâche, sous-tâche) qui ont une entrée. */
export const decompterModificationsEnAttente = (index: IndexEnAttente): number =>
  elementsEnAttente(index).size;

export const plusAncienneModificationEnAttente = (index: IndexEnAttente): Instant | undefined =>
  [...index.values()].reduce<Instant | undefined>(
    (plusAncienne, { entree }) =>
      plusAncienne === undefined || entree.premiereEcriture < plusAncienne
        ? entree.premiereEcriture
        : plusAncienne,
    undefined,
  );
