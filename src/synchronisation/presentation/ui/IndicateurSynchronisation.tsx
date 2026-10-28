import type {
  CodeIndicateur,
  ModeleVueIndicateur,
} from '../modeles-de-vue/indicateur-synchronisation';

// SyncStatus (guide §6.6.2, conventions.md §8.5) : role="status", data-etat, data-a-lire ; SYN-SESSION porte le bouton
// « Reprendre la synchronisation ». Libellés : catalogue §6.6 (repris par `libelle()` au rang 2).
const pluriel = (n: number, mot: string): string => `${String(n)} ${mot}${n > 1 ? 's' : ''}`;

const libelleDe = (vue: ModeleVueIndicateur): string => {
  const n = vue.n ?? 0;
  const libelles: Readonly<Record<CodeIndicateur, string>> = {
    'SYN-OK': 'À jour',
    'SYN-INFO': `À jour · ${pluriel(vue.aLire ?? 0, 'information')}`,
    'SYN-EN-COURS': 'Synchronisation…',
    'SYN-ATTENTE': `${pluriel(n, 'modification')} à envoyer`,
    'SYN-HORS-LIGNE': n === 0 ? 'Hors ligne' : `Hors ligne · ${String(n)} en attente`,
    'SYN-RETENTATIVE': 'Nouvelle tentative…',
    'SYN-SESSION': 'Reprendre la synchronisation',
    'SYN-ACTION': 'Action requise',
  };
  return libelles[vue.code];
};

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
      libelleDe(vue)
    ) : (
      <button type="button" data-action={vue.action} onClick={surReprendre}>
        {libelleDe(vue)}
      </button>
    )}
  </div>
);
