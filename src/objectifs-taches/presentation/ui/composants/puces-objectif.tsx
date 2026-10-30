import type { IdObjectif } from '../../../../commun/domaine/identifiants';

// Puces de choix d'objectifs (guide §4.3) : bascules `aria-pressed`, sélection multiple. Les rattachements issus du
// contexte (objectif du détail d'où l'on vient) sont pré-sélectionnés par l'écran, jamais par la puce.
export type ProprietesPucesObjectif = {
  readonly nom: string;
  readonly objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string }>;
  readonly selection: ReadonlyArray<IdObjectif>;
  readonly surBasculer: (id: IdObjectif) => void;
};

export const PucesObjectif = ({
  nom,
  objectifs,
  selection,
  surBasculer,
}: ProprietesPucesObjectif) => (
  <div role="group" aria-label={nom} className="puces-objectif">
    {objectifs.map((objectif) => (
      <button
        key={objectif.id}
        type="button"
        aria-pressed={selection.includes(objectif.id)}
        onClick={() => {
          surBasculer(objectif.id);
        }}
      >
        {objectif.intitule}
      </button>
    ))}
  </div>
);
