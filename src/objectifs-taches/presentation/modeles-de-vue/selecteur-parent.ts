import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { formaterDate } from '../../../commun/presentation/format/date';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { ResumeObjectif } from '../../application/requetes/resumes';
import type { CandidatParent, SelecteurParent } from '../../application/requetes/consulter-selecteur-parent';
import type { MessageRefus } from './messages-de-refus';
import { comparerOrdreReference } from './ordre-reference';

// ST-US-023 §4.5, §6.5 (ECR-008 C, D ; guide §4.28).
export type IndicationCandidat = {
  readonly code: 'SEL-PARENT-DELAI' | 'SEL-PARENT-EFFECTIF';
  readonly libelle: string;
};

export type OptionParent = {
  readonly cible:
    { readonly type: 'AUCUN' } | { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
  readonly intitule: string;
  readonly disponible: boolean;
  readonly raison?: MessageRefus;
  /** Délai du candidat, puis effectif qu'il aurait ; vide pour AUCUN et pour un candidat indisponible. */
  readonly indications: ReadonlyArray<IndicationCandidat>;
};

export type ModeleVueSelecteurParent = {
  readonly titre: string;
  readonly messageBloquant?: MessageRefus; // ERR-030 variante objectif-a-des-sous-objectifs
  readonly options: ReadonlyArray<OptionParent>; // AUCUN, puis les objectifs principaux
};

const RAISON_LUI_MEME: MessageRefus = { code: 'ERR-031', variables: {} };

/** Délai du candidat, puis effectif qu'il aurait (SEL-PARENT-EFFECTIF : n = autres + 1). */
const indicationsDe = (
  candidat: CandidatParent,
  jour: DateCalendaire,
): ReadonlyArray<IndicationCandidat> => {
  const autres = candidat.autresSousObjectifs;
  return [
    ...(candidat.delai === undefined
      ? []
      : [
          {
            code: 'SEL-PARENT-DELAI' as const,
            libelle: libelle('SEL-PARENT-DELAI', { date: formaterDate(candidat.delai, jour) }),
          },
        ]),
    ...(autres === 0
      ? []
      : [
          {
            code: 'SEL-PARENT-EFFECTIF' as const,
            libelle: libelle('SEL-PARENT-EFFECTIF', { n: autres + 1 }),
          },
        ]),
  ];
};

const optionObjectif = (
  candidat: CandidatParent,
  donnees: SelecteurParent,
  bloquant: MessageRefus | undefined,
): OptionParent => {
  const raison = candidat.id === donnees.objectif.id ? RAISON_LUI_MEME : bloquant;
  return {
    cible: { type: 'OBJECTIF', id: candidat.id },
    intitule: candidat.intitule,
    disponible: raison === undefined,
    ...(raison === undefined ? {} : { raison }),
    indications: raison === undefined ? indicationsDe(candidat, donnees.jour) : [],
  };
};

/** Un objectif qui a des sous-objectifs ne peut aller sous aucun objectif : seule l'option AUCUN reste (guide §4.28). */
const messageBloquant = (
  objectif: ResumeObjectif,
  nombreSousObjectifs: number,
): MessageRefus | undefined =>
  nombreSousObjectifs === 0
    ? undefined
    : {
        code: 'ERR-030',
        variante: 'objectif-a-des-sous-objectifs',
        variables: { element: objectif.intitule, n: nombreSousObjectifs },
      };

export const construireSelecteurParent = (donnees: SelecteurParent): ModeleVueSelecteurParent => {
  const { objectif, candidats, nombreSousObjectifs } = donnees;
  const bloquant = messageBloquant(objectif, nombreSousObjectifs);
  return {
    titre: libelle('SEL-PARENT-TITRE', { element: objectif.intitule }),
    ...(bloquant === undefined ? {} : { messageBloquant: bloquant }),
    options: [
      {
        cible: { type: 'AUCUN' },
        intitule: libelle('SEL-PARENT-AUCUN'),
        disponible: true,
        indications: [],
      },
      ...[...candidats]
        .sort(comparerOrdreReference)
        .map((candidat) => optionObjectif(candidat, donnees, bloquant)),
    ],
  };
};
