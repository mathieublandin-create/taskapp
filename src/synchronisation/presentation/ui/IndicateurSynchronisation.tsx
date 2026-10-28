import {
  libelleIndicateur,
  type ModeleVueIndicateur,
} from '../modeles-de-vue/indicateur-synchronisation';

// SyncStatus (guide §6.6.2, conventions.md §8.5) : role="status", data-etat, data-a-lire ; SYN-SESSION porte le bouton
// « Reprendre la synchronisation ». Libellés : catalogue §6.6, par le modèle de vue.
export type ProprietesIndicateur = {
  readonly vue: ModeleVueIndicateur;
  readonly surReprendre: () => void;
};

export const IndicateurSynchronisation = ({ vue, surReprendre }: ProprietesIndicateur) => (
  <div
    role="status"
    data-etat={vue.code}
    {...(vue.aLire === undefined ? {} : { 'data-a-lire': vue.aLire })}
  >
    {vue.action === undefined ? (
      libelleIndicateur(vue)
    ) : (
      <button type="button" data-action={vue.action} onClick={surReprendre}>
        {libelleIndicateur(vue)}
      </button>
    )}
  </div>
);
