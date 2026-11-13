import { IonBackdrop } from '@ionic/react';
import { useEffect, useId, useRef, type RefObject } from 'react';
import type { CodeCatalogue } from '../messages/codes';

// ConfirmDialog (guide §4.12, §6.6.7 ; conventions.md §8.6) : role="alertdialog", « Annuler » focalisé par défaut,
// Échap = Annuler, action destructrice en rouge. Le contenu vient d'un modèle de vue.
export type ProprietesBoiteConfirmation = {
  readonly code: CodeCatalogue;
  readonly titre: string;
  readonly texte?: string;
  readonly actionLibelle: string;
  /** Action destructrice : bouton rouge. */
  readonly rouge: boolean;
  readonly surConfirmer: () => void;
  readonly surAnnuler: () => void;
};

/** Libellé générique du guide (§4.12, §6.6.7), sans code de catalogue (RC-R2-8 a). */
export const LIBELLE_ANNULER = 'Annuler';

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

/** « Annuler » reçoit le focus à l'ouverture et à chaque nouvelle confirmation (guide §6.6.7). */
const useFocusAnnuler = (code: CodeCatalogue): RefObject<HTMLButtonElement | null> => {
  const annuler = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    annuler.current?.focus();
  }, [code]);
  return annuler;
};

export const BoiteConfirmation = ({
  code,
  titre,
  texte,
  ...actions
}: ProprietesBoiteConfirmation) => {
  const annuler = useFocusAnnuler(code);
  useToucheEchap(actions.surAnnuler);
  const identifiant = useId();
  const idTitre = `${identifiant}-titre`;
  const idTexte = `${identifiant}-texte`;
  return (
    <div className="scrim">
      <IonBackdrop tappable={false} />
      <div
        className="boite-confirmation"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        {...(texte === undefined ? {} : { 'aria-describedby': idTexte })}
        data-code={code}
      >
        <h2 id={idTitre}>{titre}</h2>
        {texte === undefined ? null : <p id={idTexte}>{texte}</p>}
        <ActionsConfirmation annuler={annuler} {...actions} />
      </div>
    </div>
  );
};
