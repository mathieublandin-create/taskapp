import type { Horloge } from '../../../commun/application/ports/horloge';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { ResumeTache } from '../../application/requetes/resumes';
import type { DetailTache } from '../../application/requetes/consulter-detail-tache';
import type { ActionTache } from '../../domaine/actions';
import type { Incoherence } from '../../domaine/incoherence';
import { formaterDate } from '../../../commun/presentation/format/date';
import { mentionHeureParis } from '../../../commun/presentation/modeles-de-vue/mention-heure-paris';
import { jourDeReference } from '../../../commun/domaine/temps/jour-de-reference';
import { libelle, type VariablesLibelle } from '../../../commun/presentation/messages/libelle';
import { construireLigneTache, nomAccessibleCaseTerminer, type LigneTache } from './ligne-tache';
import { comparerOrdreReference } from './ordre-reference';
import { phraseSousTacheDe } from './phrases-tache-parente';

// ST-US-002 §4.5 ; ST-US-024 §4.5 ; ST-US-003 §4.5 ; ST-US-025 §4.5.
type MentionHeureParis = { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };

export type LigneSousTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: LigneTache['delai'];
  readonly estimation: { readonly minutes: number; readonly libelle: string };
  readonly etat: LigneTache['etat'];
  readonly enRetard?: LigneTache['enRetard'];
  readonly alertes: LigneTache['alertes'];
  /**
   * WCAG 4.1.2 (RL-LOT-001-S4, ST-US-024 §4.5) : « {intitulé}, {état en toutes lettres}, délai {date} »,
   * suivi de « , en retard » si `enRetard` ; même forme que `LigneTache.nomAccessible`.
   */
  readonly nomAccessible: string;
  /** Case « Terminer » de la ligne : nom accessible « Terminer « {intitulé} » ». */
  readonly caseTerminer: { readonly nomAccessible: string };
  /** Sous-tâches d'une tâche parente abandonnée (ST-US-025 §6.4). */
  readonly etiquette?: {
    readonly code:
      | 'ETA-SOUS-TACHE-ABANDONNEE-AVEC'
      | 'ETA-SOUS-TACHE-ABANDONNEE-AVANT'
      | 'ETA-SOUS-TACHE-TERMINEE-AVANT';
    readonly libelle: string;
  };
};

export type ModeleVueDetailTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly etat: LigneTache['etat'];
  /** Jamais de MEN-HEURE-PARIS sur un délai. */
  readonly delai: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly alertes: LigneTache['alertes'];
  };
  readonly estimation: {
    readonly minutes: number;
    readonly libelle: string;
    readonly verrou?: { readonly code: 'MEN-ESTIMATION-CALCULEE'; readonly libelle: string };
  };
  readonly estimationInitiale: { readonly minutes: number };
  readonly objectifs: {
    readonly intitules: ReadonlyArray<string>;
    /** Identifiants des mêmes objectifs, dans le même ordre que `intitules` (rattachement sans ambiguïté d'homonymes). */
    readonly ids: ReadonlyArray<IdObjectif>;
    readonly verrou?: { readonly code: 'MEN-OBJECTIFS-HERITES'; readonly libelle: string };
  };
  readonly tacheParente?: { readonly id: IdTache; readonly intitule: string };
  /** « Sous-tâche de « {tâche parente} » », composé ici (DT-021 point 2). */
  readonly libelleTacheParente?: string;
  readonly enRetard?: LigneTache['enRetard'];
  readonly actions: ReadonlyArray<ActionTache>;
  /** Section SEC-SOUS-TACHES : une seule liste, tous états, ordre de référence (guide §5.8 e). */
  readonly sousTaches?: {
    readonly code: 'SEC-SOUS-TACHES';
    readonly libelle: string;
    readonly lignes: ReadonlyArray<LigneSousTache>;
    readonly compteur: {
      readonly terminees: number;
      readonly nonAbandonnees: number;
      readonly libelle: string;
    };
  };
  /** n = sous-tâches à faire ; absent si n = 0. */
  readonly infoFinImpossible?: {
    readonly code: 'ALR-013';
    readonly n: number;
    readonly libelle: string;
  };
  readonly incoherence?: {
    readonly code: 'ALR-003' | 'ALR-004';
    /** `ALR-003` seulement : `sans-objectif` (aucun objectif) ou `objectifs` (deux ou plus) ; absente pour un objectif. */
    readonly variante?: 'sans-objectif' | 'objectifs';
    readonly n: number;
    readonly libelle: string;
    readonly texte: string;
  }; // rang 9
  readonly dateFin?: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly mentionHeureParis?: MentionHeureParis;
  };
  readonly dateAbandon?: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly mentionHeureParis?: MentionHeureParis;
  };
};

const verrouEstimation = (
  tache: ResumeTache,
): Pick<ModeleVueDetailTache['estimation'], 'verrou'> =>
  tache.estimationCalculee
    ? {
        verrou: {
          code: 'MEN-ESTIMATION-CALCULEE',
          libelle: libelle('MEN-ESTIMATION-CALCULEE'),
        },
      }
    : {};

const verrouObjectifs = (tache: ResumeTache): Pick<ModeleVueDetailTache['objectifs'], 'verrou'> =>
  tache.objectifsHerites
    ? {
        verrou: {
          code: 'MEN-OBJECTIFS-HERITES',
          libelle: libelle('MEN-OBJECTIFS-HERITES'),
        },
      }
    : {};

type EtiquetteSousTache = NonNullable<LigneSousTache['etiquette']>;

const etiquetteDe = (
  code: EtiquetteSousTache['code'],
): { readonly etiquette: EtiquetteSousTache } => ({ etiquette: { code, libelle: libelle(code) } });

/** Étiquette des états autres qu'« abandonnée » : la table est exhaustive à la compilation. */
const ETIQUETTE_HORS_ABANDON: Readonly<
  Record<
    Exclude<ResumeTache['cycleDeVie']['etat'], 'ABANDONNEE'>,
    EtiquetteSousTache['code'] | undefined
  >
> = { TERMINEE: 'ETA-SOUS-TACHE-TERMINEE-AVANT', A_FAIRE: undefined };

/** Étiquette d'une sous-tâche d'une tâche parente abandonnée (ST-US-025 §6.4) ; aucune si elle est à faire. */
const etiquetteSousTache = (
  sousTache: ResumeTache,
  parente: ResumeTache,
): Pick<LigneSousTache, 'etiquette'> => {
  if (parente.cycleDeVie.etat !== 'ABANDONNEE') return {};
  const { cycleDeVie } = sousTache;
  if (cycleDeVie.etat === 'ABANDONNEE') {
    return etiquetteDe(
      cycleDeVie.abandonParCascade === parente.cycleDeVie.evenementAbandon
        ? 'ETA-SOUS-TACHE-ABANDONNEE-AVEC'
        : 'ETA-SOUS-TACHE-ABANDONNEE-AVANT',
    );
  }
  const code = ETIQUETTE_HORS_ABANDON[cycleDeVie.etat];
  return code === undefined ? {} : etiquetteDe(code);
};

const construireLigneSousTache = (
  resume: ResumeTache,
  parente: ResumeTache,
  aujourdhui: DateCalendaire,
): LigneSousTache => {
  const ligne = construireLigneTache(resume, aujourdhui);
  return {
    id: ligne.id,
    intitule: ligne.intitule,
    delai: ligne.delai,
    estimation: { minutes: ligne.estimation.minutes, libelle: ligne.estimation.libelle },
    etat: ligne.etat,
    ...(ligne.enRetard === undefined ? {} : { enRetard: ligne.enRetard }),
    alertes: ligne.alertes,
    nomAccessible: ligne.nomAccessible,
    caseTerminer: { nomAccessible: nomAccessibleCaseTerminer(ligne.intitule) },
    ...etiquetteSousTache(resume, parente),
  };
};

const sectionSousTaches = (
  donnees: DetailTache,
  aujourdhui: DateCalendaire,
): Pick<ModeleVueDetailTache, 'sousTaches'> => {
  const compteur = donnees.tache.sousTaches;
  if (compteur === undefined) return {};
  const { terminees, nonAbandonnees } = compteur;
  return {
    sousTaches: {
      code: 'SEC-SOUS-TACHES',
      libelle: libelle('SEC-SOUS-TACHES'),
      lignes: [...donnees.sousTaches]
        .sort(comparerOrdreReference)
        .map((resume) => construireLigneSousTache(resume, donnees.tache, aujourdhui)),
      compteur: {
        terminees,
        nonAbandonnees,
        libelle: `${String(terminees)} / ${String(nonAbandonnees)}`,
      },
    },
  };
};

/** « Terminée le {date} » (ETA-TACHE-TERMINEE) ; MEN-HEURE-PARIS si l'appareil n'est pas à Paris (RG-054). */
const dateFinDe = (
  tache: ResumeTache,
  aujourdhui: DateCalendaire,
  horloge: Horloge,
): Pick<ModeleVueDetailTache, 'dateFin'> => {
  const { cycleDeVie } = tache;
  if (cycleDeVie.etat !== 'TERMINEE') return {};
  return {
    dateFin: {
      date: cycleDeVie.dateFin,
      libelle: libelle('ETA-TACHE-TERMINEE', {
        date: formaterDate(cycleDeVie.dateFin, aujourdhui),
      }),
      ...mentionHeureParis(horloge),
    },
  };
};

/** « Abandonnée le {date} » (ETA-TACHE-ABANDONNEE) ; MEN-HEURE-PARIS si l'appareil n'est pas à Paris (RG-054). */
const dateAbandonDe = (
  tache: ResumeTache,
  aujourdhui: DateCalendaire,
  horloge: Horloge,
): Pick<ModeleVueDetailTache, 'dateAbandon'> => {
  const { cycleDeVie } = tache;
  if (cycleDeVie.etat !== 'ABANDONNEE') return {};
  return {
    dateAbandon: {
      date: cycleDeVie.dateAbandon,
      libelle: libelle('ETA-TACHE-ABANDONNEE', {
        date: formaterDate(cycleDeVie.dateAbandon, aujourdhui),
      }),
      ...mentionHeureParis(horloge),
    },
  };
};

/** La tâche parente d'une sous-tâche et la phrase qui la nomme (DT-021 point 2). */
const tacheParenteDe = (
  tache: ResumeTache,
): Pick<ModeleVueDetailTache, 'tacheParente' | 'libelleTacheParente'> =>
  tache.tacheParente === undefined
    ? {}
    : {
        tacheParente: tache.tacheParente,
        libelleTacheParente: phraseSousTacheDe(tache.tacheParente.intitule),
      };

const objectifsDe = (tache: ResumeTache, ligne: LigneTache): ModeleVueDetailTache['objectifs'] => ({
  intitules: ligne.objectifs,
  ids: tache.objectifs.map((objectif) => objectif.id),
  ...verrouObjectifs(tache),
});

const infoFinImpossible = (n: number): Pick<ModeleVueDetailTache, 'infoFinImpossible'> =>
  n === 0 ? {} : { infoFinImpossible: { code: 'ALR-013', n, libelle: libelle('ALR-013', { n }) } };

const CODE_INCOHERENCE: Readonly<Record<Incoherence['etatParent'], 'ALR-003' | 'ALR-004'>> = {
  TERMINEE: 'ALR-003',
  ABANDONNEE: 'ALR-004',
};

const ESPACE_INSECABLE = '\u00a0';

const LISTE_FRANCAISE = new Intl.ListFormat('fr', { style: 'long', type: 'conjunction' });

/** `{objectifs}` d'`ALR-003` : « A et B », « A, B et C », chaque intitulé entre « » (guide §6.6.9). */
const objectifsNommes = (intitules: ReadonlyArray<string>): string =>
  LISTE_FRANCAISE.format(intitules.map((i) => `«${ESPACE_INSECABLE}${i}${ESPACE_INSECABLE}»`));

type VarianteTerminee = 'sans-objectif' | 'objectifs';
type PrecisionIncoherence = {
  readonly variante?: VarianteTerminee;
  readonly variables: VariablesLibelle;
};

/** Variante et variables d'`ALR-003` selon le nombre d'objectifs de la tâche (0, 1, 2 et plus). */
const precisionTerminee = (intitules: ReadonlyArray<string>): PrecisionIncoherence => {
  const [seul, ...autres] = intitules;
  if (seul === undefined) return { variante: 'sans-objectif', variables: {} };
  if (autres.length === 0) return { variables: { element: seul } };
  return { variante: 'objectifs', variables: { objectifs: objectifsNommes(intitules) } };
};

/** Carte d'incohérence (RG-049) : n sous-tâches à faire sous une tâche terminée ou abandonnée. */
const incoherenceDeCarte = (
  tache: ResumeTache,
  intitulesObjectifs: ReadonlyArray<string>,
): Pick<ModeleVueDetailTache, 'incoherence'> => {
  if (tache.incoherence === undefined) return {};
  const { etatParent, sousTachesAFaire } = tache.incoherence;
  const n = sousTachesAFaire.length;
  // ALR-004 ne nomme aucun objectif, quel que soit leur nombre (RG-025).
  const precision =
    etatParent === 'TERMINEE' ? precisionTerminee(intitulesObjectifs) : { variables: {} };
  const variante = precision.variante === undefined ? {} : { variante: precision.variante };
  const gabarit = { n, ...precision.variables, ...variante };
  const code = CODE_INCOHERENCE[etatParent];
  return {
    incoherence: {
      code,
      ...variante,
      n,
      libelle: libelle(code, gabarit),
      texte: libelle(code, gabarit, 'texte'),
    },
  };
};

/**
 * Rang 5 (ST-US-002) : champs d'édition, verrous et actions. Sous-tâches, ALR-013 : ST-US-024 ; dateFin,
 * dateAbandon : ST-US-003 et 025 ; incohérence : RG-049 (rang 9).
 */
export const construireDetailTache = (
  donnees: DetailTache,
  dependances: { readonly horloge: Horloge },
): ModeleVueDetailTache => {
  const { tache } = donnees;
  const aujourdhui = jourDeReference(dependances.horloge.maintenant());
  const ligne = construireLigneTache(tache, aujourdhui);
  return {
    id: tache.id,
    intitule: tache.intitule,
    etat: ligne.etat,
    delai: { ...ligne.delai, alertes: ligne.alertes },
    estimation: {
      minutes: ligne.estimation.minutes,
      libelle: ligne.estimation.libelle,
      ...verrouEstimation(tache),
    },
    estimationInitiale: { minutes: tache.estimationInitiale },
    objectifs: objectifsDe(tache, ligne),
    ...tacheParenteDe(tache),
    ...(ligne.enRetard === undefined ? {} : { enRetard: ligne.enRetard }),
    actions: donnees.actions,
    ...sectionSousTaches(donnees, aujourdhui),
    ...infoFinImpossible(donnees.sousTachesAFaire),
    ...incoherenceDeCarte(tache, ligne.objectifs),
    ...dateFinDe(tache, aujourdhui, dependances.horloge),
    ...dateAbandonDe(tache, aujourdhui, dependances.horloge),
  };
};
