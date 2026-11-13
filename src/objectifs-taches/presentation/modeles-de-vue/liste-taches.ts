import type { Horloge } from '../../../commun/application/ports/horloge';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { jourDeReference } from '../../../commun/domaine/temps/jour-de-reference';
import { mentionHeureParis } from '../../../commun/presentation/modeles-de-vue/mention-heure-paris';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { ResumeTache } from '../../application/requetes/resumes';
import { construireLigneTache, type LigneTache } from './ligne-tache';
import { comparerOrdreReference, comparerParFinDecroissante } from './ordre-reference';

// ST-US-002 §4.5, §6.4 (guide §5.7).
export type FiltreEtat = 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE';
export type FiltreObjectif =
  | { readonly type: 'TOUS' }
  | { readonly type: 'OBJECTIF'; readonly id: IdObjectif }
  | { readonly type: 'SANS_OBJECTIF' };

/** À chaque ouverture, non mémorisé (guide §5.7). */
export const FILTRE_ETAT_PAR_DEFAUT: FiltreEtat = 'A_FAIRE';

export type ModeleVueListeTaches = {
  readonly filtreEtat: FiltreEtat;
  readonly filtreObjectif: FiltreObjectif;
  readonly sousTitre: { readonly code: 'MEN-TRI-DELAI'; readonly libelle: string };
  readonly lignes: ReadonlyArray<LigneTache>;
  readonly etatVide?: {
    readonly code:
      | 'EVD-BIENVENUE'
      | 'EVD-TACHES'
      | 'EVD-FILTRE-SANS-OBJECTIF'
      | 'EVD-FILTRE-A-FAIRE'
      | 'EVD-FILTRE-TERMINEES'
      | 'EVD-FILTRE-ABANDONNEES';
  };
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
};

type Donnees = {
  readonly taches: ReadonlyArray<ResumeTache>;
  readonly existeAuMoinsUnObjectif: boolean;
};
type Filtres = { readonly etat: FiltreEtat; readonly objectif: FiltreObjectif };
type EtatVide = NonNullable<ModeleVueListeTaches['etatVide']>;

const ETAT_DE_CYCLE: Readonly<Record<FiltreEtat, ResumeTache['cycleDeVie']['etat']>> = {
  A_FAIRE: 'A_FAIRE',
  TERMINEE: 'TERMINEE',
  ABANDONNEE: 'ABANDONNEE',
};

const ETAT_VIDE_DU_FILTRE: Readonly<Record<FiltreEtat, EtatVide['code']>> = {
  A_FAIRE: 'EVD-FILTRE-A-FAIRE',
  TERMINEE: 'EVD-FILTRE-TERMINEES',
  ABANDONNEE: 'EVD-FILTRE-ABANDONNEES',
};

const correspondALObjectif = (tache: ResumeTache, filtre: FiltreObjectif): boolean => {
  switch (filtre.type) {
    case 'TOUS':
      return true;
    case 'OBJECTIF':
      return tache.objectifs.some((objectif) => objectif.id === filtre.id);
    case 'SANS_OBJECTIF':
      return tache.objectifs.length === 0;
  }
};

/** Guide §5.7 : « à faire » par délai, les deux autres états par date de fin ou d'abandon la plus récente. */
const comparateur = (etat: FiltreEtat): ((a: ResumeTache, b: ResumeTache) => number) =>
  etat === 'A_FAIRE' ? comparerOrdreReference : comparerParFinDecroissante;

/** Première condition vraie de ST-US-002 §6.4. */
const etatVide = (
  donnees: Donnees,
  filtres: Filtres,
  nombreDeLignes: number,
): EtatVide | undefined => {
  if (donnees.taches.length === 0) {
    return { code: donnees.existeAuMoinsUnObjectif ? 'EVD-TACHES' : 'EVD-BIENVENUE' };
  }
  if (nombreDeLignes > 0) return undefined;
  return {
    code:
      filtres.objectif.type === 'SANS_OBJECTIF'
        ? 'EVD-FILTRE-SANS-OBJECTIF'
        : ETAT_VIDE_DU_FILTRE[filtres.etat],
  };
};

export const construireListeTaches = (
  donnees: Donnees,
  filtres: Filtres,
  dependances: { readonly horloge: Horloge },
): ModeleVueListeTaches => {
  const aujourdhui = jourDeReference(dependances.horloge.maintenant());
  const lignes = donnees.taches
    .filter((tache) => tache.tacheParente === undefined)
    .filter((tache) => tache.cycleDeVie.etat === ETAT_DE_CYCLE[filtres.etat])
    .filter((tache) => correspondALObjectif(tache, filtres.objectif))
    .sort(comparateur(filtres.etat))
    .map((tache) => construireLigneTache(tache, aujourdhui));
  const vide = etatVide(donnees, filtres, lignes.length);
  return {
    filtreEtat: filtres.etat,
    filtreObjectif: filtres.objectif,
    sousTitre: {
      code: 'MEN-TRI-DELAI',
      libelle: libelle(
        'MEN-TRI-DELAI',
        filtres.etat === 'A_FAIRE' ? {} : { variante: 'plus-recentes' },
      ),
    },
    lignes,
    ...(vide === undefined ? {} : { etatVide: vide }),
    ...mentionHeureParis(dependances.horloge),
  };
};
