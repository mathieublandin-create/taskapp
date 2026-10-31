import type { IdTache } from '../../../commun/domaine/identifiants';
import { formaterDuree } from '../../../commun/presentation/format/duree';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { DetailTache } from '../../application/requetes/consulter-detail-tache';
import { construireFormulaireTache, type ModeleVueFormulaireTache } from './formulaire-tache';
import { phraseDeTacheParente } from './phrases-tache-parente';

// ST-US-024 §4.5 (ECR-007 I).
export type ModeleVueFormulaireSousTache = ModeleVueFormulaireTache & {
  readonly variante: 'SOUS_TACHE';
  readonly tacheParente: { readonly id: IdTache; readonly intitule: string };
  /** « de « {tâche parente} » », composé ici pour que le composant n'assemble aucun texte. */
  readonly libelleTacheParente: string;
  /** Première sous-tâche (ALR-012) ; durée = estimation en vigueur de la tâche. */
  readonly information?: {
    readonly code: 'ALR-012';
    readonly duree: { readonly minutes: number; readonly libelle: string };
    readonly libelle: string;
  };
};

export const construireFormulaireSousTache = (
  donnees: DetailTache,
): ModeleVueFormulaireSousTache => {
  const { tache } = donnees;
  const duree = { minutes: tache.estimation, libelle: formaterDuree(tache.estimation) };
  return {
    ...construireFormulaireTache({}),
    variante: 'SOUS_TACHE',
    tacheParente: { id: tache.id, intitule: tache.intitule },
    libelleTacheParente: phraseDeTacheParente(tache.intitule),
    ...(tache.sousTaches === undefined
      ? {
          information: {
            code: 'ALR-012',
            duree,
            libelle: libelle('ALR-012', { duree: duree.libelle }),
          },
        }
      : {}),
  };
};
