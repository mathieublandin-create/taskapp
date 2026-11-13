import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import type { FiltreEtat, FiltreObjectif } from '../../modeles-de-vue/liste-taches';
import { LIBELLES_TACHES } from '../libelles-ui';

// Filtres de la liste « Tâches » (guide §5.7) : trois valeurs d'état, sans « tous » ; filtre d'objectif en puces
// (« Tous », « Sans objectif », un objectif). Aucun des deux n'est mémorisé.
const ETATS: ReadonlyArray<FiltreEtat> = ['A_FAIRE', 'TERMINEE', 'ABANDONNEE'];

export const FiltreEtatUi = ({
  etat,
  surChoisir,
}: {
  readonly etat: FiltreEtat;
  readonly surChoisir: (etat: FiltreEtat) => void;
}) => (
  <div role="group" aria-label={LIBELLES_TACHES.filtreEtat} className="filtre-etat">
    {ETATS.map((valeur) => (
      <button
        key={valeur}
        type="button"
        aria-pressed={valeur === etat}
        onClick={() => {
          surChoisir(valeur);
        }}
      >
        {LIBELLES_TACHES.etats[valeur]}
      </button>
    ))}
  </div>
);

const memeFiltre = (a: FiltreObjectif, b: FiltreObjectif): boolean =>
  a.type === b.type && (a.type !== 'OBJECTIF' || (b.type === 'OBJECTIF' && a.id === b.id));

type Choix = readonly [string, FiltreObjectif];

const choixObjectif = (
  objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string }>,
): ReadonlyArray<Choix> => [
  [LIBELLES_TACHES.tousObjectifs, { type: 'TOUS' }],
  [LIBELLES_TACHES.sansObjectif, { type: 'SANS_OBJECTIF' }],
  ...objectifs.map((o): Choix => [o.intitule, { type: 'OBJECTIF', id: o.id }]),
];

export const FiltreObjectifUi = ({
  filtre,
  objectifs,
  surChoisir,
}: {
  readonly filtre: FiltreObjectif;
  readonly objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string }>;
  readonly surChoisir: (filtre: FiltreObjectif) => void;
}) => (
  <div role="group" aria-label={LIBELLES_TACHES.filtreObjectif} className="filtre-objectif">
    {choixObjectif(objectifs).map(([texte, valeur]) => (
      <button
        key={texte}
        type="button"
        aria-pressed={memeFiltre(valeur, filtre)}
        onClick={() => {
          surChoisir(valeur);
        }}
      >
        {texte}
      </button>
    ))}
  </div>
);
