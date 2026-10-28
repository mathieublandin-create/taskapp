import type { CodeCatalogue } from '../messages/codes';
import { aUnePartie, libelle } from '../messages/libelle';

// EmptyState (guide §4.19, §6.5.5) : une phrase qui dit pourquoi c'est vide, une phrase qui dit quoi faire, un bouton
// vers l'action. Les textes sont ceux du catalogue (codes EVD-…).
export type ProprietesEtatVide = {
  readonly code: CodeCatalogue;
  readonly surAction: () => void;
};

export const EtatVide = ({ code, surAction }: ProprietesEtatVide) => (
  <section className="etat-vide" data-etat={code} aria-label={libelle(code)}>
    <p>{libelle(code)}</p>
    {aUnePartie(code, 'texte') ? <p>{libelle(code, {}, 'texte')}</p> : null}
    {aUnePartie(code, 'action') ? (
      <button type="button" className="primaire" onClick={surAction}>
        {libelle(code, {}, 'action')}
      </button>
    ) : null}
  </section>
);
