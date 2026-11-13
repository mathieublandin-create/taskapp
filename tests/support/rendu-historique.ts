/**
 * Rendu des entrées du journal pour les étapes d'historique (glossaire d'étapes v1.4 §11 ; ST-US-001 §6.7).
 * Réservé aux tests : l'historique n'est affiché nulle part dans l'application (US-001 CA-11).
 */
import type { Duree } from '@src/commun/domaine/duree';
import type {
  EtatJournal,
  EvenementJournal,
  TypeEvenementJournal,
} from '@src/synchronisation/domaine/evenement-journal';

export type EntreeRendue = {
  readonly evenement: string;
  readonly journee: string;
  readonly avant: string;
  readonly apres: string;
};

const NOMS_EVENEMENTS: Readonly<Record<TypeEvenementJournal, string>> = {
  CREATION: 'création',
  MODIFICATION_DELAI: 'modification délai',
  MODIFICATION_ESTIMATION: 'modification estimation',
  RATTACHEMENT: 'rattachement',
  DETACHEMENT: 'détachement',
  CHANGEMENT_PARENT: 'changement parent',
  FIN: 'fin',
  REOUVERTURE: 'réouverture',
  ABANDON: 'abandon',
  REPRISE: 'reprise',
  SUPPRESSION: 'suppression',
};

const MINUTES_PAR_HEURE = 60;

/** Durée au format du glossaire : `0 h`, `30 min`, `1 h`, `2 h 30`. */
const rendreDuree = (duree: Duree): string => {
  const heures = Math.floor(duree / MINUTES_PAR_HEURE);
  const minutes = duree % MINUTES_PAR_HEURE;
  if (heures === 0) return minutes === 0 ? '0 h' : `${String(minutes)} min`;
  return minutes === 0 ? `${String(heures)} h` : `${String(heures)} h ${String(minutes)}`;
};

/** « o1 », « o1 et o2 », « o1, o2 et o3 ». */
const enumerer = (noms: ReadonlyArray<string>): string => {
  const dernier = noms.at(-1);
  if (dernier === undefined || noms.length === 1) return dernier ?? '';
  return `${noms.slice(0, -1).join(', ')} et ${dernier}`;
};

const rendreEtat = (etat: EtatJournal): string => {
  if (etat.etat === 'TERMINEE') return `terminée, date de fin ${etat.dateFin ?? ''}`;
  if (etat.etat === 'ABANDONNEE') return `abandonnée, date d'abandon ${etat.dateAbandon ?? ''}`;
  return 'à faire';
};

type Intitules = ReadonlyMap<string, string>;

const intituleDe = (intitules: Intitules, id: string): string => intitules.get(id) ?? id;

const rendreCreation = (
  e: Extract<EvenementJournal, { type: 'CREATION' }>,
  i: Intitules,
): string => {
  const { apres } = e;
  const parties = [
    'tacheParenteId' in apres ? `tâche parente ${intituleDe(i, apres.tacheParenteId)}` : undefined,
    'parentId' in apres ? `parent ${intituleDe(i, apres.parentId)}` : undefined,
    apres.delai === undefined ? undefined : `délai ${apres.delai}`,
    'estimation' in apres ? `estimation ${rendreDuree(apres.estimation)}` : undefined,
    'objectifIds' in apres && apres.objectifIds.length > 0
      ? `objectifs ${enumerer(apres.objectifIds.map((id) => intituleDe(i, id)))}`
      : undefined,
  ];
  return parties.filter((partie) => partie !== undefined).join(', ');
};

const valeurs = (e: EvenementJournal, i: Intitules): { avant: string; apres: string } => {
  switch (e.type) {
    case 'CREATION':
      return { avant: '', apres: rendreCreation(e, i) };
    case 'MODIFICATION_DELAI':
      return { avant: e.avant.delai ?? '', apres: e.apres.delai ?? '' };
    case 'MODIFICATION_ESTIMATION':
      return { avant: rendreDuree(e.avant.estimation), apres: rendreDuree(e.apres.estimation) };
    case 'RATTACHEMENT':
      return { avant: '', apres: intituleDe(i, e.apres.objectifId) };
    case 'DETACHEMENT':
      return { avant: intituleDe(i, e.avant.objectifId), apres: '' };
    case 'CHANGEMENT_PARENT': {
      const intitule = (id: string | undefined): string =>
        id === undefined ? 'aucun (objectif principal)' : intituleDe(i, id);
      return { avant: intitule(e.avant.parentId), apres: intitule(e.apres.parentId) };
    }
    case 'FIN':
    case 'REOUVERTURE':
    case 'ABANDON':
    case 'REPRISE':
      return { avant: rendreEtat(e.avant), apres: rendreEtat(e.apres) };
    case 'SUPPRESSION':
      return { avant: '', apres: '' };
  }
};

/** `intitules` : `VueMetier.intitulesConnus` (éléments supprimés compris). */
export const rendreEntree = (evenement: EvenementJournal, intitules: Intitules): EntreeRendue => ({
  evenement: NOMS_EVENEMENTS[evenement.type],
  journee: evenement.jour,
  ...valeurs(evenement, intitules),
});
