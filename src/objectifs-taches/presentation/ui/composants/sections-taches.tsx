import { useState } from 'react';
import type { IdTache } from '../../../../commun/domaine/identifiants';
import type {
  CodeSectionTaches,
  ModeleVueDetailObjectif,
  SectionTaches,
} from '../../modeles-de-vue/detail-objectif';
import { LigneTacheUi } from './ligne-tache';

// Sections de tâches du détail d'un objectif (guide v0.2.14 §5.8 g) : « Tâches à faire · n » dépliée, « Terminées (n) »
// et « Abandonnées (n) » repliées ; une section à n = 0 n'est pas affichée, sauf « Tâches à faire · 0 » quand l'objectif
// a au moins une tâche. Sans aucune tâche, seul l'état vide est affiché (par l'écran). Une sous-tâche suit sa tâche parente.
export type ProprietesSectionsTaches = {
  readonly taches: ModeleVueDetailObjectif['taches'];
  readonly surOuvrir: (id: IdTache) => void;
};

const LignesSection = ({
  lignes,
  surOuvrir,
}: {
  readonly lignes: SectionTaches<CodeSectionTaches>['lignes'];
  readonly surOuvrir: (id: IdTache) => void;
}) => (
  <ul className="liste-taches">
    {lignes.map((ligne) => (
      <LigneTacheUi
        key={ligne.id}
        ligne={ligne}
        niveau={ligne.niveau}
        surOuvrir={(l) => {
          surOuvrir(l.id);
        }}
      />
    ))}
  </ul>
);

const SectionUi = ({
  section,
  surOuvrir,
}: {
  readonly section: SectionTaches<CodeSectionTaches>;
  readonly surOuvrir: (id: IdTache) => void;
}) => {
  const [deplie, setDeplie] = useState(!section.replieeParDefaut);
  return (
    <section data-code={section.code}>
      <button
        type="button"
        aria-expanded={deplie}
        onClick={() => {
          setDeplie(!deplie);
        }}
      >
        {section.libelle}
      </button>
      {deplie ? <LignesSection lignes={section.lignes} surOuvrir={surOuvrir} /> : null}
    </section>
  );
};

export const SectionsTaches = ({ taches, surOuvrir }: ProprietesSectionsTaches) => {
  const total = taches.aFaire.n + taches.terminees.n + taches.abandonnees.n;
  if (total === 0) return null;
  return (
    <>
      <SectionUi section={taches.aFaire} surOuvrir={surOuvrir} />
      {taches.terminees.n > 0 ? (
        <SectionUi section={taches.terminees} surOuvrir={surOuvrir} />
      ) : null}
      {taches.abandonnees.n > 0 ? (
        <SectionUi section={taches.abandonnees} surOuvrir={surOuvrir} />
      ) : null}
    </>
  );
};
