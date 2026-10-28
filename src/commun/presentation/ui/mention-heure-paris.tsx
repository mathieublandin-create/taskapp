import { IonButton } from '@ionic/react';
import { useEffect, useState } from 'react';
import type { MentionHeureParis as ModeleMention } from '../modeles-de-vue/mention-heure-paris';
import { libelle } from '../messages/libelle';

// ParisTimeNote (guide §4.21, RG-054) : puce « Heure de Paris » dont l'appui ouvre une info-bulle fermable (Échap).
// Le composant n'est monté que si le modèle de vue porte la mention (fuseau de l'appareil différent de Paris).
export type ProprietesNoteHeureParis = { readonly mention: ModeleMention };

export const NoteHeureParis = ({ mention }: ProprietesNoteHeureParis) => {
  const [explication, setExplication] = useState(false);
  useEffect(() => {
    if (!explication) return;
    const surTouche = (evenement: globalThis.KeyboardEvent): void => {
      if (evenement.key === 'Escape') setExplication(false);
    };
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('keydown', surTouche);
    };
  }, [explication]);
  return (
    <span className="mention-heure-paris" data-etat={mention.code}>
      <IonButton
        size="small"
        fill="outline"
        aria-expanded={explication}
        aria-label={libelle(mention.code, {}, 'nomAccessible')}
        onClick={() => {
          setExplication(!explication);
        }}
      >
        {mention.libelle}
      </IonButton>
      {explication ? <span role="tooltip">{libelle('MEN-HEURE-PARIS-EXPLICATION')}</span> : null}
    </span>
  );
};
