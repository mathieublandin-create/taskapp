import type { IdObjectif } from '../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import type { RefusMetier } from './refus';
import { objectifActif, sousObjectifsDe, type Objectif, type VueMetier } from './vue-metier';

// RG-022, Q-US-023-1 (ST-US-023 §6.1).
export const estObjectifPrincipal = (o: Objectif): boolean => o.parentId === undefined;

export type IssuePlacement = 'SANS_EFFET' | 'A_ECRIRE';

/** Table de décision unique des refus de placement ; l'ordre des contrôles est celui de Q-US-023-1. */
export const verifierPlacement = (
  vue: VueMetier,
  objectifId: IdObjectif,
  cibleId: IdObjectif | undefined,
): Resultat<IssuePlacement, RefusMetier> => {
  const objectif = objectifActif(vue, objectifId);
  if (!objectif.ok) return objectif;
  if (cibleId === undefined) return succes(issue(objectif.valeur, undefined));
  const cible = objectifActif(vue, cibleId);
  if (!cible.ok) return cible;
  if (cibleId === objectifId) return echec({ type: 'PlacementSousLuiMeme' });
  const nombreSousObjectifs = sousObjectifsDe(vue, objectifId).length;
  if (nombreSousObjectifs > 0) {
    return echec({
      type: 'DeuxiemeNiveau',
      variante: 'objectif-a-des-sous-objectifs',
      objectif: objectif.valeur.intitule,
      nombreSousObjectifs,
    });
  }
  if (!estObjectifPrincipal(cible.valeur)) {
    return echec({
      type: 'DeuxiemeNiveau',
      variante: 'cible-est-sous-objectif',
      cible: cible.valeur.intitule,
    });
  }
  return succes(issue(objectif.valeur, cibleId));
};

const issue = (objectif: Objectif, cibleId: IdObjectif | undefined): IssuePlacement =>
  objectif.parentId === cibleId ? 'SANS_EFFET' : 'A_ECRIRE';
