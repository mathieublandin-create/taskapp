import { useEffect, useRef, type RefObject } from 'react';

// ConfirmDialog (guide §4.12, §6.6.7 ; conventions.md §8.6) : role="alertdialog", « Annuler » focalisé par défaut,
// Échap = Annuler, action destructrice en rouge. Le contenu vient d'un modèle de vue.
export type ProprietesBoiteConfirmation = {
  readonly code: string;
  readonly titre: string;
  readonly texte?: string;
  readonly actionLibelle: string;
  /** Action destructrice : bouton rouge. */
  readonly rouge: boolean;
  readonly surConfirmer: () => void;
  readonly surAnnuler: () => void;
};

const LIBELLE_ANNULER = 'Annuler';

/** Échap = Annuler (guide §6.6.7), écouté sur le document tant que la boîte est affichée. */
const useToucheEchap = (surAnnuler: () => void): void => {
  useEffect(() => {
    const surTouche = (evenement: globalThis.KeyboardEvent): void => {
      if (evenement.key === 'Escape') surAnnuler();
    };
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('keydown', surTouche);
    };
  }, [surAnnuler]);
};

type ProprietesActions = Pick<
  ProprietesBoiteConfirmation,
  'actionLibelle' | 'rouge' | 'surConfirmer' | 'surAnnuler'
> & { readonly annuler: RefObject<HTMLButtonElement | null> };

const ActionsConfirmation = ({
  annuler,
  actionLibelle,
  rouge,
  surConfirmer,
  surAnnuler,
}: ProprietesActions) => (
  <div className="actions">
    <button ref={annuler} type="button" onClick={surAnnuler}>
      {LIBELLE_ANNULER}
    </button>
    <button type="button" className="primaire" data-rouge={rouge} onClick={surConfirmer}>
      {actionLibelle}
    </button>
  </div>
);

export const BoiteConfirmation = ({
  code,
  titre,
  texte,
  ...actions
}: ProprietesBoiteConfirmation) => {
  const annuler = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    annuler.current?.focus();
  }, [code]);
  useToucheEchap(actions.surAnnuler);
  return (
    <div className="scrim">
      <div
        className="boite-confirmation"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogue-titre"
        {...(texte === undefined ? {} : { 'aria-describedby': 'dialogue-texte' })}
        data-code={code}
      >
        <h2 id="dialogue-titre">{titre}</h2>
        {texte === undefined ? null : <p id="dialogue-texte">{texte}</p>}
        <ActionsConfirmation annuler={annuler} {...actions} />
      </div>
    </div>
  );
};
