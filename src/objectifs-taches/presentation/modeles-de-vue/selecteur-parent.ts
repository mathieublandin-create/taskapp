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

const RAISON_LUI_MEME: MessageRefus = { code: 'ERR-031', variables: {} };

/** Un objectif qui a des sous-objectifs ne peut aller sous aucun objectif : seule l'option AUCUN reste (guide §4.28). */
const optionObjectif = (
  candidat: ResumeObjectif,
  objectifId: IdObjectif,
  bloquant: MessageRefus | undefined,
): OptionParent => {
  const raison = candidat.id === objectifId ? RAISON_LUI_MEME : bloquant;
  return {
    cible: { type: 'OBJECTIF', id: candidat.id },
    intitule: candidat.intitule,
    disponible: raison === undefined,
    ...(raison === undefined ? {} : { raison }),
  };
};

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

export const construireSelecteurParent = ({
  objectif,
  candidats,
  nombreSousObjectifs,
}: SelecteurParent): ModeleVueSelecteurParent => {
  const bloquant = messageBloquant(objectif, nombreSousObjectifs);
  return {
    titre: titreDuSelecteur(objectif.intitule),
    ...(bloquant === undefined ? {} : { messageBloquant: bloquant }),
    options: [
      { cible: { type: 'AUCUN' }, intitule: INTITULE_AUCUN_PARENT, disponible: true },
      ...[...candidats]
        .sort(comparerOrdreReference)
        .map((candidat) => optionObjectif(candidat, objectif.id, bloquant)),
    ],
  };
};
