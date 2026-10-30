import type { ReactNode } from 'react';
import { LIBELLES_TACHES } from '../libelles-ui';

// FieldRow et LockedField (guide §4.5, ECR-007) : un champ du détail avec sa valeur et, s'il est modifiable, un bouton
// qui ouvre son éditeur ; un champ verrouillé dit pourquoi (MEN-ESTIMATION-CALCULEE, MEN-OBJECTIFS-HERITES).
export type ProprietesChampDetail = {
  readonly nom: string;
  readonly valeur: string;
  /** Éditeur affiché à la place du bouton « Modifier » pendant l'édition. */
  readonly editeur?: ReactNode;
  readonly enEdition?: boolean;
  readonly surEditer?: (() => void) | undefined;
};

export const ChampDetail = ({
  nom,
  valeur,
  editeur,
  enEdition = false,
  surEditer,
}: ProprietesChampDetail) => (
  <div className="champ-detail" role="group" aria-label={nom}>
    <span className="champ-detail-nom">{nom}</span>
    <span className="champ-detail-valeur">{valeur}</span>
    {surEditer === undefined || enEdition ? null : (
      <button type="button" aria-label={`${LIBELLES_TACHES.modifier} ${nom}`} onClick={surEditer}>
        {LIBELLES_TACHES.modifier}
      </button>
    )}
    {enEdition ? editeur : null}
  </div>
);

export type ProprietesChampVerrouille = {
  readonly nom: string;
  readonly valeur: string;
  readonly verrou: { readonly code: string; readonly libelle: string };
};

export const ChampVerrouille = ({ nom, valeur, verrou }: ProprietesChampVerrouille) => (
  <div className="champ-detail champ-verrouille" role="group" aria-label={nom}>
    <span className="champ-detail-nom">{nom}</span>
    <span className="champ-detail-valeur">{valeur}</span>
    <span data-code={verrou.code}>{verrou.libelle}</span>
  </div>
);
