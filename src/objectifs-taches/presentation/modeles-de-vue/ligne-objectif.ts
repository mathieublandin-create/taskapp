import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { formaterDate } from '../../../commun/presentation/format/date';
import { libelle } from '../../../commun/presentation/messages/libelle';
import { mentionAttenteSi } from '../../../synchronisation';
import type { ResumeObjectif } from '../../application/requetes/resumes';
import type { EtatObjectif } from '../../domaine/etat-objectif';

// ST-US-001 §4.5, §6.5 ; ALR-007 : ST-US-023 §4.5.
export type ModeleVueDelai =
  | { readonly type: 'DATE'; readonly date: DateCalendaire; readonly libelle: string }
  | { readonly type: 'SANS_DELAI'; readonly code: 'MEN-SANS-DELAI'; readonly libelle: string };

export type LigneObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly niveau: 'PRINCIPAL' | 'SOUS_OBJECTIF';
  readonly parentId?: IdObjectif;
  readonly etat: {
    readonly code: 'ETA-OBJ-EN-COURS' | 'ETA-OBJ-ATTEINT' | 'ETA-OBJ-A-DECLINER';
    readonly libelle: string;
  };
  readonly compteur: {
    readonly code: 'ETA-OBJ-COMPTEUR';
    readonly terminees: number;
    readonly nonAbandonnees: number;
    readonly libelle: string;
  };
  /** Pourcentage (0 à 100) de l'anneau de progression (GoalProgress) : tâches terminées sur non abandonnées. */
  readonly progression: number;
  readonly delai: ModeleVueDelai;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  /** ST-US-017 §4.5 : modification de l'objectif non encore enregistrée dans le Drive. */
  readonly attente?: {
    readonly code: 'MEN-ATTENTE';
    readonly libelle: string;
    readonly nomAccessible: string;
  };
  readonly alerteDelai?: {
    readonly code: 'ALR-007';
    readonly parent: string;
    readonly libelle: string;
  };
  readonly nomAccessible: string;
};

const CODES_ETAT: Readonly<Record<EtatObjectif, LigneObjectif['etat']['code']>> = {
  EN_COURS: 'ETA-OBJ-EN-COURS',
  ATTEINT: 'ETA-OBJ-ATTEINT',
  A_DECLINER: 'ETA-OBJ-A-DECLINER',
};

export const modeleDelai = (
  delai: DateCalendaire | undefined,
  aujourdhui: DateCalendaire,
): ModeleVueDelai =>
  delai === undefined
    ? { type: 'SANS_DELAI', code: 'MEN-SANS-DELAI', libelle: libelle('MEN-SANS-DELAI') }
    : { type: 'DATE', date: delai, libelle: formaterDate(delai, aujourdhui) };

const modeleEnRetard = (resume: ResumeObjectif, delai: ModeleVueDelai) =>
  resume.enRetard
    ? {
        enRetard: {
          code: 'MEN-EN-RETARD' as const,
          libelle: libelle('MEN-EN-RETARD', { date: delai.libelle, variante: 'liste' }),
        },
      }
    : {};

const modeleAlerte = (resume: ResumeObjectif, delai: ModeleVueDelai) =>
  resume.alerteDelai === undefined
    ? {}
    : {
        alerteDelai: {
          code: 'ALR-007' as const,
          parent: resume.alerteDelai.parentIntitule,
          libelle: libelle('ALR-007', {
            date: delai.libelle,
            parent: resume.alerteDelai.parentIntitule,
          }),
        },
      };

const modeleAttente = (resume: ResumeObjectif) => {
  const mention = mentionAttenteSi(resume.enAttente);
  return mention === undefined
    ? {}
    : {
        attente: {
          ...mention,
          libelle: libelle(mention.code),
          nomAccessible: libelle(mention.code, {}, 'nomAccessible'),
        },
      };
};

const POURCENTAGE_MAX = 100;

/** Un objectif atteint est à 100 % ; sans tâche, 0 % (anneau vide). */
const progressionDe = (resume: ResumeObjectif): number => {
  if (resume.etat === 'ATTEINT') return POURCENTAGE_MAX;
  const { tachesTerminees, tachesNonAbandonnees } = resume;
  return tachesNonAbandonnees === 0
    ? 0
    : Math.round((POURCENTAGE_MAX * tachesTerminees) / tachesNonAbandonnees);
};

const modeleCompteur = (resume: ResumeObjectif): LigneObjectif['compteur'] => {
  const { tachesTerminees: terminees, tachesNonAbandonnees: nonAbandonnees } = resume;
  return {
    code: 'ETA-OBJ-COMPTEUR',
    terminees,
    nonAbandonnees,
    libelle: libelle('ETA-OBJ-COMPTEUR', { terminees, nonAbandonnees }),
  };
};

/** Guide §6.6.4 : « {intitulé}, {état}, {t} tâches sur {n} terminées, délai {date} ». */
const nomAccessible = (
  resume: ResumeObjectif,
  etat: LigneObjectif['etat'],
  delai: ModeleVueDelai,
): string =>
  libelle(
    'ETA-OBJ-COMPTEUR',
    {
      element: resume.intitule,
      etat: etat.libelle,
      terminees: resume.tachesTerminees,
      nonAbandonnees: resume.tachesNonAbandonnees,
      date: delai.libelle,
      ...(delai.type === 'DATE' ? {} : { variante: 'sans-delai' }),
    },
    'nomAccessible',
  );

/** `aujourdhui` : jour de Paris, pour le format des dates (guide §6.6.1). */
export const construireLigneObjectif = (
  resume: ResumeObjectif,
  aujourdhui: DateCalendaire,
): LigneObjectif => {
  const code = CODES_ETAT[resume.etat];
  const etat = { code, libelle: libelle(code) };
  const delai = modeleDelai(resume.delai, aujourdhui);
  return {
    id: resume.id,
    intitule: resume.intitule,
    niveau: resume.parentId === undefined ? 'PRINCIPAL' : 'SOUS_OBJECTIF',
    ...(resume.parentId === undefined ? {} : { parentId: resume.parentId }),
    etat,
    compteur: modeleCompteur(resume),
    progression: progressionDe(resume),
    delai,
    ...modeleEnRetard(resume, delai),
    ...modeleAlerte(resume, delai),
    ...modeleAttente(resume),
    nomAccessible: nomAccessible(resume, etat, delai),
  };
};
