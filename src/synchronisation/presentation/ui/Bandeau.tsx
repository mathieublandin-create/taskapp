import type { NomAppareilAffiche } from '../../../commun/presentation/format/appareil';
import { libellesBandeau, type ModeleVueBandeau } from '../modeles-de-vue/bandeau';

// Banner (guide §6.6.3) : au plus un bandeau, jamais bloquant ; data-etat, data-variante. Textes : catalogue §6.6, par
// le modèle de vue.
export type ProprietesBandeau = {
  readonly vue: ModeleVueBandeau;
  /** `{appareil}` des textes : « smartphone » ou « PC ». */
  readonly appareil: NomAppareilAffiche;
  readonly surAction: (action: NonNullable<ModeleVueBandeau['action']>) => void;
  readonly surMasquer: () => void;
};

const BoutonFermeture = ({
  libelle,
  surMasquer,
}: {
  readonly libelle: string | undefined;
  readonly surMasquer: () => void;
}) =>
  libelle === undefined ? null : (
    <button type="button" onClick={surMasquer}>
      {libelle}
    </button>
  );

export const Bandeau = ({ vue, appareil, surAction, surMasquer }: ProprietesBandeau) => {
  const { action } = vue;
  const libelles = libellesBandeau(vue, appareil);
  return (
    <aside
      aria-label={libelles.titre}
      data-etat={vue.code}
      data-message={vue.message}
      {...(vue.variante === undefined ? {} : { 'data-variante': vue.variante })}
    >
      <p>{libelles.titre}</p>
      <p>{libelles.texte}</p>
      {action === undefined ? null : (
        <button
          type="button"
          data-action={action}
          onClick={() => {
            surAction(action);
          }}
        >
          {libelles.action}
        </button>
      )}
      <BoutonFermeture libelle={libelles.fermeture} surMasquer={surMasquer} />
    </aside>
  );
};
