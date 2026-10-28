import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import { assertNever } from '../../commun/domaine/assert-never';
import type { IdOperation } from '../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import { contexteDeNouvelleEcriture, type ContexteCausal } from './contexte-causal';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import { registreDe, type EtatLocal } from './etat-local';
import type { ContenuEvenement, EvenementACreer, EvenementJournal } from './evenement-journal';
import { hlcSuivant, type Hlc } from './hlc';
import { idEvenement } from './identifiant-evenement';
import { enregistrerEnAttente, purgerPourSuppression } from './index-en-attente';
import {
  cleDeChamp,
  cleEnTexte,
  idLien,
  type CleInformation,
  type CleTexte,
  type PlacementObjectif,
  type RefElementMetier,
} from './information';
import type { EcritureChampObjectif, Modification } from './modification';
import { contexteDePierreTombale, descendantsSupprimesParDerivation } from './pierre-tombale';

// ST-socle-ecriture.md §6.3.
export type PlanEcriture = {
  readonly etatApres: EtatLocal; // version non incrémentée (le dépôt l'incrémente)
  readonly registresEcrits: ReadonlyArray<RegistreQuelconque>;
  readonly evenementsAjoutes: ReadonlyArray<EvenementJournal>;
  readonly enAttenteEcrites: ReadonlyArray<CleTexte>; // clés ajoutées ou modifiées
  readonly enAttenteRetirees: ReadonlyArray<CleTexte>;
};

export type ContextePlanification = {
  readonly operation: IdOperation;
  readonly instant: Instant;
  readonly jour: DateCalendaire;
  readonly physiqueCorrigee: Instant;
};

export const PLAN_VIDE = (etat: EtatLocal): PlanEcriture => ({
  etatApres: etat,
  registresEcrits: [],
  evenementsAjoutes: [],
  enAttenteEcrites: [],
  enAttenteRetirees: [],
});

/** Travail en cours : état courant, registres écrits (dernière valeur de chacun) et événements ajoutés. */
type Travail = {
  readonly etat: EtatLocal;
  readonly ecrits: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly evenements: ReadonlyArray<EvenementJournal>;
};

/** Une modification en cours de traduction : son HLC et le contexte de planification. */
type Pas = {
  readonly hlc: Hlc;
  readonly contexte: ContextePlanification;
  /** Contexte causal imposé à l'écriture (pierre tombale, §6.4) au lieu de celui de la valeur précédente. */
  readonly contexteImpose?: ContexteCausal;
};

const incoherence = (message: string): never => {
  throw new ErreurProgrammation(`Modification incohérente : ${message}`);
};

const cleLien = (tacheId: Parameters<typeof idLien>[0], objectifId: Parameters<typeof idLien>[1]) =>
  ({
    type: 'LIEN_TACHE_OBJECTIF',
    id: idLien(tacheId, objectifId),
    champ: 'actif',
  }) as CleInformation;

const existe = (etat: EtatLocal, element: RefElementMetier): boolean =>
  registreDe(etat, element, 'creation') !== undefined;

const estSupprime = (etat: EtatLocal, element: RefElementMetier): boolean =>
  registreDe(etat, element, 'suppression') !== undefined;

const exigerModifiable = (etat: EtatLocal, element: RefElementMetier): void => {
  if (!existe(etat, element) || estSupprime(etat, element)) {
    incoherence(`${element.type} ${element.id} absent ou supprimé`);
  }
};

const exigerAbsent = (etat: EtatLocal, element: RefElementMetier): void => {
  if (existe(etat, element)) incoherence(`${element.type} ${element.id} existe déjà`);
};

/** Écrit un registre ; le contexte vient de la valeur précédente, sauf s'il est imposé (pierre tombale). */
const ecrire = (travail: Travail, pas: Pas, cle: CleInformation, valeur: unknown): Travail => {
  const { etat } = travail;
  const precedente = etat.registres.get(cleEnTexte(cle))?.ecriture;
  const contexte = pas.contexteImpose ?? contexteDeNouvelleEcriture(precedente, etat.appareilId);
  // Seul point où le typage fin des registres est relâché : la valeur est typée par la clé à l'appel.
  const registre = { cle, ecriture: { valeur, hlc: pas.hlc, contexte } } as RegistreQuelconque;
  const texte = cleEnTexte(cle);
  const enAttente =
    cle.champ === 'suppression'
      ? etat.enAttente
      : enregistrerEnAttente(etat.enAttente, cle, pas.hlc, pas.contexte.physiqueCorrigee);
  return {
    ...travail,
    etat: { ...etat, registres: new Map(etat.registres).set(texte, registre), enAttente },
    ecrits: new Map(travail.ecrits).set(texte, registre),
  };
};

const ecrireChamps = (
  travail: Travail,
  pas: Pas,
  element: RefElementMetier,
  champs: ReadonlyArray<readonly [string, unknown]>,
): Travail =>
  champs.reduce(
    (courant, [champ, valeur]) => ecrire(courant, pas, cleDeChamp(element, champ), valeur),
    travail,
  );

const creerObjectif = (
  travail: Travail,
  pas: Pas,
  m: Extract<Modification, { type: 'CREER_OBJECTIF' }>,
): Travail => {
  const element: RefElementMetier = { type: 'OBJECTIF', id: m.id };
  exigerAbsent(travail.etat, element);
  const { intitule, description, delai, parentId } = m.valeurs;
  const parent: PlacementObjectif = {
    ...(parentId === undefined ? {} : { parentId }),
    origine: 'CREATION',
    hlcOrigine: pas.hlc,
  };
  return ecrireChamps(travail, pas, element, [
    ['creation', { creeLe: m.creeLe }],
    ['intitule', intitule],
    ...(description === undefined ? [] : [['description', description] as const]),
    ...(delai === undefined ? [] : [['delai', delai] as const]),
    ['parent', parent],
  ]);
};

const creerTache = (
  travail: Travail,
  pas: Pas,
  m: Extract<Modification, { type: 'CREER_TACHE' }>,
): Travail => {
  const element: RefElementMetier = { type: 'TACHE', id: m.id };
  exigerAbsent(travail.etat, element);
  const { intitule, delai, estimationInitiale, tacheParenteId, objectifIds } = m.valeurs;
  if (new Set(objectifIds).size !== objectifIds.length) incoherence('lien en double');
  const sansLiens = ecrireChamps(travail, pas, element, [
    ['creation', { creeLe: m.creeLe, ...(tacheParenteId === undefined ? {} : { tacheParenteId }) }],
    ['intitule', intitule],
    ['delai', delai],
    ['estimationInitiale', estimationInitiale],
    ['cycleDeVie', { etat: 'A_FAIRE' }],
  ]);
  return objectifIds.reduce(
    (courant, objectifId) => ecrire(courant, pas, cleLien(m.id, objectifId), true),
    sansLiens,
  );
};

/** Valeur à écrire : un déplacement porte son origine et le HLC de l'écriture (RG-048). */
const valeurDeChampObjectif = (ecriture: EcritureChampObjectif, hlcOrigine: Hlc): unknown =>
  ecriture.champ === 'parent'
    ? {
        ...(ecriture.parentId === undefined ? {} : { parentId: ecriture.parentId }),
        origine: 'DEPLACEMENT',
        hlcOrigine,
      }
    : ecriture.valeur;

const ecrireChampObjectif = (
  travail: Travail,
  pas: Pas,
  id: Extract<RefElementMetier, { type: 'OBJECTIF' }>['id'],
  ecriture: EcritureChampObjectif,
): Travail => {
  const element: RefElementMetier = { type: 'OBJECTIF', id };
  exigerModifiable(travail.etat, element);
  const valeur = valeurDeChampObjectif(ecriture, pas.hlc);
  return ecrire(travail, pas, cleDeChamp(element, ecriture.champ), valeur);
};

const supprimer = (travail: Travail, pas: Pas, element: RefElementMetier): Travail => {
  exigerModifiable(travail.etat, element);
  const { etat } = travail;
  const contexte = contexteDePierreTombale(etat, element, etat.appareilId);
  const descendantsSupprimes = descendantsSupprimesParDerivation(etat, element);
  const ecrit = ecrire(
    travail,
    { ...pas, contexteImpose: contexte },
    cleDeChamp(element, 'suppression'),
    true,
  );
  const enAttente = purgerPourSuppression(etat.enAttente, {
    element,
    descendantsSupprimes,
    hlc: pas.hlc,
    instantCorrige: pas.contexte.physiqueCorrigee,
  });
  return { ...ecrit, etat: { ...ecrit.etat, enAttente } };
};

const appliquerModification = (travail: Travail, pas: Pas, m: Modification): Travail => {
  switch (m.type) {
    case 'CREER_OBJECTIF':
      return creerObjectif(travail, pas, m);
    case 'CREER_TACHE':
      return creerTache(travail, pas, m);
    case 'ECRIRE_OBJECTIF':
      return ecrireChampObjectif(travail, pas, m.id, m.ecriture);
    case 'ECRIRE_TACHE':
      exigerModifiable(travail.etat, { type: 'TACHE', id: m.id });
      return ecrire(
        travail,
        pas,
        cleDeChamp({ type: 'TACHE', id: m.id }, m.ecriture.champ),
        m.ecriture.valeur,
      );
    case 'ECRIRE_LIEN':
      exigerModifiable(travail.etat, { type: 'TACHE', id: m.tacheId });
      exigerModifiable(travail.etat, { type: 'OBJECTIF', id: m.objectifId });
      return ecrire(travail, pas, cleLien(m.tacheId, m.objectifId), m.actif);
    case 'SUPPRIMER':
      return supprimer(travail, pas, m.element);
    default:
      return assertNever(m);
  }
};

/** Avant et après du changement de parent, calculés depuis le registre `parent` (§6.3). */
const contenuChangementParent = (
  avant: EtatLocal,
  apres: EtatLocal,
  element: Extract<RefElementMetier, { type: 'OBJECTIF' }>,
): ContenuEvenement => {
  const lire = (etat: EtatLocal): PlacementObjectif => {
    const registre = registreDe(etat, element, 'parent');
    if (registre === undefined || !estRegistre(registre, 'OBJECTIF', 'parent')) {
      return incoherence(`placement de l'objectif ${element.id} absent`);
    }
    return registre.ecriture.valeur;
  };
  return { type: 'CHANGEMENT_PARENT', element, avant: lire(avant), apres: lire(apres) };
};

const contenuEvenement = (
  avant: Travail,
  apres: Travail,
  demande: EvenementACreer,
): ContenuEvenement => {
  if (demande.type === 'CHANGEMENT_PARENT') {
    return contenuChangementParent(avant.etat, apres.etat, demande.element);
  }
  const { rang: _rang, cause: _cause, ...contenu } = demande;
  return contenu;
};

const ajouterEvenement = (avant: Travail, apres: Travail, m: Modification, pas: Pas): Travail => {
  const { operation, instant, jour } = pas.contexte;
  const demande = m.evenement;
  if (demande === undefined) return apres;
  const id = idEvenement(operation, demande.rang);
  if (apres.etat.journal.has(id)) incoherence(`événement ${id} en double`);
  const evenement: EvenementJournal = {
    ...contenuEvenement(avant, apres, demande),
    id,
    hlc: pas.hlc,
    instant,
    jour,
    ...(demande.cause === undefined ? {} : { cause: idEvenement(operation, demande.cause) }),
  };
  return {
    ...apres,
    etat: { ...apres.etat, journal: new Map(apres.etat.journal).set(id, evenement) },
    evenements: [...apres.evenements, evenement],
  };
};

const traduire =
  (contexte: ContextePlanification) =>
  (travail: Travail, m: Modification): Travail => {
    const { etat } = travail;
    const hlc = hlcSuivant(etat.dernierHlc, contexte.physiqueCorrigee, etat.appareilId);
    const pas: Pas = { hlc, contexte };
    const avecHlc: Travail = { ...travail, etat: { ...etat, dernierHlc: hlc } };
    return ajouterEvenement(avecHlc, appliquerModification(avecHlc, pas, m), m, pas);
  };

/** Lève ErreurProgrammation sur une modification incohérente (§8 n° 2). */
export const planifierEcritures = (
  etat: EtatLocal,
  modifications: ReadonlyArray<Modification>,
  contexte: ContextePlanification,
): PlanEcriture => {
  if (modifications.length === 0) return PLAN_VIDE(etat);
  const final = modifications.reduce(traduire(contexte), {
    etat,
    ecrits: new Map(),
    evenements: [],
  });
  const apres = final.etat.enAttente;
  return {
    etatApres: final.etat,
    registresEcrits: [...final.ecrits.values()],
    evenementsAjoutes: final.evenements,
    enAttenteEcrites: [...apres.keys()].filter((cle) => etat.enAttente.get(cle) !== apres.get(cle)),
    enAttenteRetirees: [...etat.enAttente.keys()].filter((cle) => !apres.has(cle)),
  };
};
