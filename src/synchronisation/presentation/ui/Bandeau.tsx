import type { ModeleVueBandeau } from '../modeles-de-vue/bandeau';

// Banner (guide §6.6.3) : au plus un bandeau, jamais bloquant ; data-etat, data-variante. Textes : catalogue §6.6.
const TITRES: Readonly<Record<ModeleVueBandeau['code'], string>> = {
  'BAN-ACCES-GOOGLE': 'Accès Google perdu',
  'BAN-CONSULTATION-SEULE': 'Consultation seule',
  'BAN-RAPPEL-24H': 'Modifications en attente depuis plus de 24 h',
};

const ACTIONS: Readonly<Record<NonNullable<ModeleVueBandeau['action']>, string>> = {
  SE_RECONNECTER: 'Se reconnecter',
  METTRE_A_JOUR: 'Mettre à jour',
  REPRENDRE_LA_SYNCHRONISATION: 'Reprendre la synchronisation',
};

export type ProprietesBandeau = {
  readonly vue: ModeleVueBandeau;
  readonly surAction: (action: NonNullable<ModeleVueBandeau['action']>) => void;
  readonly surMasquer: () => void;
};

export const Bandeau = ({ vue, surAction, surMasquer }: ProprietesBandeau) => {
  const { action } = vue;
  return (
    <aside
      aria-label={TITRES[vue.code]}
      data-etat={vue.code}
      data-message={vue.message}
      {...(vue.variante === undefined ? {} : { 'data-variante': vue.variante })}
    >
      <p>{TITRES[vue.code]}</p>
      {vue.n === undefined ? null : <p data-n={vue.n}>{`${String(vue.n)} en attente`}</p>}
      {action === undefined ? null : (
        <button
          type="button"
          data-action={action}
          onClick={() => {
            surAction(action);
          }}
        >
          {ACTIONS[action]}
        </button>
      )}
      {vue.fermable ? (
        <button type="button" onClick={surMasquer}>
          Masquer le rappel
        </button>
      ) : null}
    </aside>
  );
};
