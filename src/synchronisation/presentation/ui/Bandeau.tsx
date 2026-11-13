import type { NomAppareilAffiche } from '../../../commun/presentation/format/appareil';
import type { IssueMiseAJour } from '../../application/ports/mise-a-jour-application';
import { libellesBandeau, type ModeleVueBandeau } from '../modeles-de-vue/bandeau';
import { construireRetourMiseAJour } from '../modeles-de-vue/retour-mise-a-jour';

// Banner (guide §6.6.3) : au plus un bandeau, jamais bloquant ; data-etat, data-variante. Textes : catalogue §6.6, par
// le modèle de vue.
export type ProprietesBandeau = {
  readonly vue: ModeleVueBandeau;
  /** `{appareil}` des textes : « smartphone » ou « PC ». */
  readonly appareil: NomAppareilAffiche;
  readonly surAction: (action: NonNullable<ModeleVueBandeau['action']>) => void;
  readonly surMasquer: () => void;
  /** Issue de la dernière action « Mettre à jour » (`VueInterface.miseAJour`) : texte sous celui du bandeau. */
  readonly miseAJour?: IssueMiseAJour | undefined;
};

const BoutonFermeture = ({
  libelle,
  surMasquer,
}: {
  readonly libelle: string | undefined;
  readonly surMasquer: () => void;
}) =>
  libelle === undefined ? null : (
    <button type="button" className="bouton-natif" data-variante="tertiaire" onClick={surMasquer}>
      {libelle}
    </button>
  );

const BoutonAction = ({
  action,
  libelle,
  desactive,
  surAction,
}: {
  readonly action: NonNullable<ModeleVueBandeau['action']>;
  readonly libelle: string | undefined;
  /** `aria-disabled` : le bouton reste focalisable, son activation est sans effet (retour `rechargement`). */
  readonly desactive: boolean;
  readonly surAction: ProprietesBandeau['surAction'];
}) => (
  <button
    type="button"
    className="bouton-natif"
    data-action={action}
    {...(action === 'REPRENDRE_LA_SYNCHRONISATION' ? {} : { 'data-variante': 'principal' })}
    {...(desactive ? { 'aria-disabled': true } : {})}
    onClick={() => {
      if (!desactive) surAction(action);
    }}
  >
    {libelle}
  </button>
);

export const Bandeau = ({ vue, appareil, surAction, surMasquer, miseAJour }: ProprietesBandeau) => {
  const { action } = vue;
  const libelles = libellesBandeau(vue, appareil);
  const retour = action === 'METTRE_A_JOUR' ? construireRetourMiseAJour(miseAJour) : undefined;
  return (
    <aside
      aria-label={libelles.titre}
      data-etat={vue.code}
      data-message={vue.message}
      {...(vue.variante === undefined ? {} : { 'data-variante': vue.variante })}
    >
      <p>{libelles.titre}</p>
      <p>{libelles.texte}</p>
      {action === 'METTRE_A_JOUR' ? <p role="status">{retour?.texte}</p> : null}
      {action === undefined ? null : (
        <BoutonAction
          action={action}
          libelle={libelles.action}
          desactive={retour?.actionDesactivee === true}
          surAction={surAction}
        />
      )}
      <BoutonFermeture libelle={libelles.fermeture} surMasquer={surMasquer} />
    </aside>
  );
};
