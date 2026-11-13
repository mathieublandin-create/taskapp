import type { CSSProperties } from 'react';

// GoalProgress (ECR-008, ECR-003) : anneau de progression. Vert seulement quand l'objectif est atteint ; en couleur
// d'accent sinon, même à 3 / 3 (RG-025). Le pourcentage vient du modèle de vue. Avec `nomAccessible`, l'anneau est
// une barre de progression nommée ; sans, il est décoratif (le nom de la ligne qui le contient dit déjà tout).
export type ProprietesProgressionObjectif = {
  readonly progression: number;
  readonly atteint: boolean;
  readonly nomAccessible?: string;
  readonly petit?: boolean;
};

export const ProgressionObjectif = ({
  progression,
  atteint,
  nomAccessible,
  petit = false,
}: ProprietesProgressionObjectif) => (
  <span
    className={petit ? 'progression-objectif progression-objectif-petit' : 'progression-objectif'}
    data-atteint={atteint}
    style={{ '--progression': `${String(progression)}%` } as CSSProperties}
    {...(nomAccessible === undefined
      ? { 'aria-hidden': true }
      : {
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': progression,
          'aria-label': nomAccessible,
        })}
  />
);
