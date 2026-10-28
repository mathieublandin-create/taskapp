import { useEffect, useRef } from 'react';
import type { ModeleVueConfirmationCompte } from '../modeles-de-vue/confirmations-compte';

// conventions.md §8.6 ; guide §6.6.7 : role="alertdialog", « Annuler » focalisé, action destructrice en rouge.
export type ProprietesDialogue = {
  readonly vue: ModeleVueConfirmationCompte;
  readonly surConfirmer: () => void;
  readonly surAnnuler: () => void;
};

export const DialogueConfirmation = ({ vue, surConfirmer, surAnnuler }: ProprietesDialogue) => {
  const annuler = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    annuler.current?.focus();
  }, [vue.code]);
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialogue-titre"
      {...(vue.texte === undefined ? {} : { 'aria-describedby': 'dialogue-texte' })}
      data-code={vue.code}
    >
      <h2 id="dialogue-titre">{vue.titre}</h2>
      {vue.texte === undefined ? null : <p id="dialogue-texte">{vue.texte}</p>}
      <button ref={annuler} type="button" onClick={surAnnuler}>
        Annuler
      </button>
      <button type="button" data-rouge={vue.rouge} onClick={surConfirmer}>
        {vue.boutonAction}
      </button>
    </div>
  );
};
