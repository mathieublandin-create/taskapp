import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { ResumeObjectif } from '../../application/requetes/resumes';
import type { SelecteurParent } from '../../application/requetes/consulter-selecteur-parent';
import type { MessageRefus } from './messages-de-refus';
import { comparerOrdreReference } from './ordre-reference';

// ST-US-023 §4.5, §6.5 (ECR-008 C, D ; guide §4.28).
export type OptionParent = {
  readonly cible:
    { readonly type: 'AUCUN' } | { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
  readonly intitule: string;
  readonly disponible: boolean;
  readonly raison?: MessageRefus;
};

export type ModeleVueSelecteurParent = {
  readonly titre: string;
  readonly messageBloquant?: MessageRefus; // ERR-030 variante objectif-a-des-sous-objectifs
  readonly options: ReadonlyArray<OptionParent>; // AUCUN, puis les objectifs principaux
};

// Textes de la maquette ECR-008 C sans code au catalogue (point signalé à Anthony et Steeve).
const INTITULE_AUCUN_PARENT = 'Aucun, objectif principal';
const titreDuSelecteur = (element: string): string => `Placer «\u00a0${element}\u00a0» sous…`;

const optionObjectif = (candidat: ResumeObjectif, objectifId: IdObjectif): OptionParent => ({
  cible: { type: 'OBJECTIF', id: candidat.id },
  intitule: candidat.intitule,
  disponible: candidat.id !== objectifId,
  ...(candidat.id === objectifId ? { raison: { code: 'ERR-031', variables: {} } } : {}),
});

const messageBloquant = (
  objectif: ResumeObjectif,
  nombreSousObjectifs: number,
): Pick<ModeleVueSelecteurParent, 'messageBloquant'> =>
  nombreSousObjectifs === 0
    ? {}
    : {
        messageBloquant: {
          code: 'ERR-030',
          variante: 'objectif-a-des-sous-objectifs',
          variables: { element: objectif.intitule, n: nombreSousObjectifs },
        },
      };

export const construireSelecteurParent = ({
  objectif,
  candidats,
  nombreSousObjectifs,
}: SelecteurParent): ModeleVueSelecteurParent => ({
  titre: titreDuSelecteur(objectif.intitule),
  ...messageBloquant(objectif, nombreSousObjectifs),
  options: [
    { cible: { type: 'AUCUN' }, intitule: INTITULE_AUCUN_PARENT, disponible: true },
    ...[...candidats]
      .sort(comparerOrdreReference)
      .map((candidat) => optionObjectif(candidat, objectif.id)),
  ],
});
