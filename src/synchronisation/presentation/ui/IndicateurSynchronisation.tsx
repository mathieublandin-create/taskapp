import type { Ref } from 'react';
import {
  libelleIndicateur,
  type ModeleVueIndicateur,
} from '../modeles-de-vue/indicateur-synchronisation';

// SyncStatus (guide §6.6.2, conventions.md §8.5) : role="status", data-etat, data-a-lire ; SYN-SESSION porte le bouton
// « Reprendre la synchronisation ». Libellés : catalogue §6.6, par le modèle de vue. Focalisable par programme
// (`tabIndex=-1`) : cible du focus quand la dernière entrée de « À lire » disparaît (DT-028).
export type ProprietesIndicateur = {
  readonly vue: ModeleVueIndicateur;
  readonly surReprendre: () => void;
  readonly refElement?: Ref<HTMLDivElement>;
};

export const IndicateurSynchronisation = ({
  vue,
  surReprendre,
  refElement,
}: ProprietesIndicateur) => (
  <div
    ref={refElement}
    tabIndex={-1}
    role="status"
    data-etat={vue.code}
    {...(vue.aLire === undefined ? {} : { 'data-a-lire': vue.aLire })}
  >
    {vue.action === undefined ? (
      libelleIndicateur(vue)
    ) : (
      <button
        type="button"
        className="bouton-natif"
        data-action={vue.action}
        onClick={surReprendre}
      >
        {libelleIndicateur(vue)}
      </button>
    )}
  </div>
);
