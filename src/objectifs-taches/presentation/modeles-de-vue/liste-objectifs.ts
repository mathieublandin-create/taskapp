import type { Horloge } from '../../../commun/application/ports/horloge';
import { jourDeReference } from '../../../commun/domaine/temps/jour-de-reference';
import {
  mentionHeureParis,
  type MentionHeureParis,
} from '../../../commun/presentation/modeles-de-vue/mention-heure-paris';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { ResumeObjectif } from '../../application/requetes/resumes';
import { construireLigneObjectif, type LigneObjectif } from './ligne-objectif';
import { comparerOrdreReference } from './ordre-reference';

// ST-US-001 §4.5, §6.6 (guide v0.2.9 §5.8) ; ST-US-023 §6.6.
export type ModeleVueListeObjectifs = {
  /** Principaux NON atteints, chacun suivi de ses sous-objectifs (atteints compris). */
  readonly lignes: ReadonlyArray<LigneObjectif>;
  /** Absente si aucun objectif principal atteint. */
  readonly sectionAtteints?: {
    readonly code: 'SEC-OBJ-ATTEINTS';
    readonly n: number;
    readonly libelle: string;
    readonly replieeParDefaut: true;
    readonly lignes: ReadonlyArray<LigneObjectif>;
  };
  readonly mentionHeureParis?: MentionHeureParis;
  /** EVD-OBJECTIFS : aucun objectif ; EVD-OBJECTIFS-TOUS-ATTEINTS : `lignes` vide et section des atteints présente (guide v0.2.14, RL-LOT-001-S1). */
  readonly etatVide?: { readonly code: 'EVD-OBJECTIFS' | 'EVD-OBJECTIFS-TOUS-ATTEINTS' };
};

/** Un principal suivi de ses sous-objectifs, triés de même, atteints compris (aucun déplacement, §5.8 c). */
const avecSousObjectifs = (
  principaux: ReadonlyArray<ResumeObjectif>,
  tous: ReadonlyArray<ResumeObjectif>,
): ReadonlyArray<ResumeObjectif> =>
  principaux.flatMap((principal) => [
    principal,
    ...tous.filter((o) => o.parentId === principal.id).sort(comparerOrdreReference),
  ]);

const etatVide = (
  aucunObjectif: boolean,
  tousAtteints: boolean,
): Pick<ModeleVueListeObjectifs, 'etatVide'> => {
  if (aucunObjectif) return { etatVide: { code: 'EVD-OBJECTIFS' } };
  return tousAtteints ? { etatVide: { code: 'EVD-OBJECTIFS-TOUS-ATTEINTS' } } : {};
};

const sectionAtteints = (
  atteints: ReadonlyArray<ResumeObjectif>,
  lignes: ReadonlyArray<LigneObjectif>,
): Pick<ModeleVueListeObjectifs, 'sectionAtteints'> =>
  atteints.length === 0
    ? {}
    : {
        sectionAtteints: {
          code: 'SEC-OBJ-ATTEINTS',
          n: atteints.length,
          libelle: libelle('SEC-OBJ-ATTEINTS', { n: atteints.length }),
          replieeParDefaut: true,
          lignes,
        },
      };

export const construireListeObjectifs = (
  donnees: { readonly objectifs: ReadonlyArray<ResumeObjectif> },
  dependances: { readonly horloge: Horloge },
): ModeleVueListeObjectifs => {
  const { objectifs } = donnees;
  const aujourdhui = jourDeReference(dependances.horloge.maintenant());
  const lignesDe = (principaux: ReadonlyArray<ResumeObjectif>): ReadonlyArray<LigneObjectif> =>
    avecSousObjectifs(principaux, objectifs).map((o) => construireLigneObjectif(o, aujourdhui));
  const principaux = objectifs.filter((o) => o.parentId === undefined).sort(comparerOrdreReference);
  const atteints = principaux.filter((o) => o.etat === 'ATTEINT');
  const lignes = lignesDe(principaux.filter((o) => o.etat !== 'ATTEINT'));
  return {
    lignes,
    ...sectionAtteints(atteints, lignesDe(atteints)),
    ...mentionHeureParis(dependances.horloge),
    ...etatVide(objectifs.length === 0, lignes.length === 0 && atteints.length > 0),
  };
};
