import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { formaterDate } from '../../../commun/presentation/format/date';
import { formaterDuree } from '../../../commun/presentation/format/duree';
import { libelle } from '../../../commun/presentation/messages/libelle';
import { mentionAttenteSi } from '../../../synchronisation';
import type { ResumeTache } from '../../application/requetes/resumes';
import type { AlerteDelaiTache } from '../../domaine/alertes-delai';
import { terminaison } from './ordre-reference';

// ST-US-002 §4.5 ; ALR-006 : ST-US-024 ; MEN-INCOHERENCE : ST-US-024 (rang 9).
export type AlerteLigneTache =
  | {
      readonly code: 'ALR-005';
      readonly objectifs: ReadonlyArray<string>;
      readonly libelle: string;
    }
  | { readonly code: 'ALR-006'; readonly tache: string; readonly libelle: string };

export type LigneTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly etat: {
    readonly code: 'ETA-TACHE-A-FAIRE' | 'ETA-TACHE-TERMINEE' | 'ETA-TACHE-ABANDONNEE';
  };
  readonly delai: { readonly date: DateCalendaire; readonly libelle: string };
  readonly estimation: {
    readonly minutes: number;
    readonly libelle: string;
    readonly calculee: boolean;
  };
  readonly objectifs: ReadonlyArray<string>;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  readonly alertes: ReadonlyArray<AlerteLigneTache>;
  /** « 1/3 » : présent si la tâche a des sous-tâches. */
  readonly compteurSousTaches?: {
    readonly terminees: number;
    readonly nonAbandonnees: number;
    readonly libelle: string;
  };
  readonly incoherence?: { readonly code: 'MEN-INCOHERENCE' };
  /** ST-US-017 §4.5 : modification de la tâche non encore enregistrée dans le Drive. */
  readonly attente?: {
    readonly code: 'MEN-ATTENTE';
    readonly libelle: string;
    readonly nomAccessible: string;
  };
  readonly nomAccessible: string;
};

const CODES_ETAT = {
  A_FAIRE: 'ETA-TACHE-A-FAIRE',
  TERMINEE: 'ETA-TACHE-TERMINEE',
  ABANDONNEE: 'ETA-TACHE-ABANDONNEE',
} as const satisfies Record<ResumeTache['cycleDeVie']['etat'], LigneTache['etat']['code']>;

const modeleAlerte = (alerte: AlerteDelaiTache, delai: string): AlerteLigneTache =>
  alerte.type === 'OBJECTIFS'
    ? {
        code: 'ALR-005',
        objectifs: alerte.objectifs.map((objectif) => objectif.intitule),
        libelle: libelle('ALR-005', { date: delai }),
      }
    : {
        code: 'ALR-006',
        tache: alerte.tache.intitule,
        libelle: libelle('ALR-006', { date: delai }),
      };

const modeleCompteur = (resume: ResumeTache): Pick<LigneTache, 'compteurSousTaches'> => {
  if (resume.sousTaches === undefined) return {};
  const { terminees, nonAbandonnees } = resume.sousTaches;
  return {
    compteurSousTaches: {
      terminees,
      nonAbandonnees,
      libelle: `${String(terminees)}/${String(nonAbandonnees)}`,
    },
  };
};

const enMinuscules = (texte: string): string => texte.charAt(0).toLowerCase() + texte.slice(1);

/** WCAG 4.1.2 : « {intitulé}, {état en toutes lettres}, délai {date} », suivi de « , en retard ». */
const nomAccessible = (resume: ResumeTache, aujourdhui: DateCalendaire): string => {
  const fin = terminaison(resume)?.date;
  const etat = libelle(CODES_ETAT[resume.cycleDeVie.etat], {
    date: fin === undefined ? '' : formaterDate(fin, aujourdhui),
  });
  const retard = resume.enRetard ? `, ${enMinuscules(libelle('MEN-EN-RETARD'))}` : '';
  const delai = formaterDate(resume.delai, aujourdhui);
  return `${resume.intitule}, ${enMinuscules(etat)}, délai ${delai}${retard}`;
};

const modeleEnRetard = (resume: ResumeTache, delai: string): Pick<LigneTache, 'enRetard'> =>
  resume.enRetard
    ? {
        enRetard: {
          code: 'MEN-EN-RETARD',
          libelle: libelle('MEN-EN-RETARD', { date: delai, variante: 'liste' }),
        },
      }
    : {};

const modeleIncoherence = (resume: ResumeTache): Pick<LigneTache, 'incoherence'> =>
  resume.incoherence === undefined ? {} : { incoherence: { code: 'MEN-INCOHERENCE' } };

const modeleAttente = (resume: ResumeTache): Pick<LigneTache, 'attente'> => {
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

/** `aujourdhui` : jour de Paris, pour le format des dates (guide §6.6.1). */
export const construireLigneTache = (
  resume: ResumeTache,
  aujourdhui: DateCalendaire,
): LigneTache => {
  const delai = formaterDate(resume.delai, aujourdhui);
  return {
    id: resume.id,
    intitule: resume.intitule,
    etat: { code: CODES_ETAT[resume.cycleDeVie.etat] },
    delai: { date: resume.delai, libelle: delai },
    estimation: {
      minutes: resume.estimation,
      libelle: formaterDuree(resume.estimation),
      calculee: resume.estimationCalculee,
    },
    objectifs: resume.objectifs.map((objectif) => objectif.intitule),
    ...modeleEnRetard(resume, delai),
    alertes: resume.alertes.map((alerte) => modeleAlerte(alerte, delai)),
    ...modeleCompteur(resume),
    ...modeleIncoherence(resume),
    ...modeleAttente(resume),
    nomAccessible: nomAccessible(resume, aujourdhui),
  };
};
