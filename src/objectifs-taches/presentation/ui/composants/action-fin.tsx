import { IonNote } from '@ionic/react';
import { useId, useRef, useState, type RefObject } from 'react';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { messagesDeIssue } from '../etat/issues';
import type { IssueSaisie } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';
import { ConfirmationCommande, useCommandeConfirmee } from './commande-confirmee';
import { MessagesRefus } from './messages-refus';

// Action de cycle de vie du détail d'une tâche (ECR-007 A, F, G) : « Terminer la tâche » (aria-disabled tant qu'il reste
// des sous-tâches à faire, ALR-013 au-dessus, refus ERR-035 annoncé en `alert`), « Rouvrir la tâche » (avec la
// confirmation CNF-ROUVRIR-SOUS-TACHE si la tâche parente est terminée) ou « Reprendre la tâche » (tâche abandonnée, avec
// CNF-REPRENDRE-SOUS-TACHE sous une tâche parente terminée). Un seul bouton : le focus le suit d'un état à l'autre.
export type ProprietesActionFin = {
  readonly modele: Pick<ModeleVueDetailTache, 'actions' | 'infoFinImpossible'>;
  readonly surTerminer?: (() => Promise<IssueSaisie>) | undefined;
  readonly surRouvrir?: (() => Promise<IssueSaisie>) | undefined;
  readonly surReprendre?: (() => Promise<IssueSaisie>) | undefined;
};

type GenreBouton = 'TERMINER' | 'ROUVRIR' | 'REPRENDRE';

type BoutonFin = {
  readonly genre: GenreBouton;
  readonly commande: () => Promise<IssueSaisie>;
};

const LIBELLES_BOUTON: Readonly<Record<GenreBouton, string>> = {
  TERMINER: LIBELLES_TACHES.terminerTache,
  ROUVRIR: LIBELLES_TACHES.rouvrirTache,
  REPRENDRE: LIBELLES_TACHES.reprendreTache,
};

/** Le bouton que l'état de la tâche offre (les trois actions s'excluent) et que l'écran sait commander. */
const boutonFin = ({
  modele,
  surTerminer,
  surRouvrir,
  surReprendre,
}: ProprietesActionFin): BoutonFin | undefined => {
  if (modele.actions.includes('TERMINER') && surTerminer !== undefined) {
    return { genre: 'TERMINER', commande: surTerminer };
  }
  if (modele.actions.includes('ROUVRIR') && surRouvrir !== undefined) {
    return { genre: 'ROUVRIR', commande: surRouvrir };
  }
  return modele.actions.includes('REPRENDRE') && surReprendre !== undefined
    ? { genre: 'REPRENDRE', commande: surReprendre }
    : undefined;
};

/** Un refus ERR-035 ne survit pas à un changement du nombre de sous-tâches restantes (état ajusté pendant le rendu). */
const useMessagesDeRefus = (restantes: number | undefined) => {
  const [messages, setMessages] = useState<ReadonlyArray<MessageRefus>>([]);
  const [restantesVues, setRestantesVues] = useState(restantes);
  if (restantesVues !== restantes) {
    setRestantesVues(restantes);
    setMessages([]);
  }
  return [messages, setMessages] as const;
};

const useActionFin = ({ modele }: ProprietesActionFin) => {
  const bouton = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useMessagesDeRefus(modele.infoFinImpossible?.n);
  const commande = useCommandeConfirmee(bouton, (issue) => {
    setMessages(messagesDeIssue(issue));
  });
  return { bouton, messages, commande };
};

const Bouton = ({
  reference,
  genre,
  idNote,
  surClic,
}: {
  readonly reference: RefObject<HTMLButtonElement | null>;
  readonly genre: GenreBouton;
  readonly idNote: string | undefined;
  readonly surClic: () => void;
}) => (
  <button
    ref={reference}
    type="button"
    {...(genre === 'TERMINER' && idNote !== undefined
      ? { 'aria-disabled': true, 'aria-describedby': idNote }
      : {})}
    onClick={surClic}
  >
    {LIBELLES_BOUTON[genre]}
  </button>
);

const NoteFin = ({
  info,
  id,
}: {
  readonly info: NonNullable<ProprietesActionFin['modele']['infoFinImpossible']>;
  readonly id: string;
}) => (
  <IonNote id={id} role="status" data-code={info.code}>
    {info.libelle}
  </IonNote>
);

export const ActionFin = (proprietes: ProprietesActionFin) => {
  const idNote = useId();
  const action = useActionFin(proprietes);
  const choisi = boutonFin(proprietes);
  const { infoFinImpossible } = proprietes.modele;
  return (
    <>
      {infoFinImpossible === undefined ? null : <NoteFin info={infoFinImpossible} id={idNote} />}
      {choisi === undefined ? null : (
        <Bouton
          reference={action.bouton}
          genre={choisi.genre}
          idNote={infoFinImpossible === undefined ? undefined : idNote}
          surClic={() => {
            void action.commande.lancer(choisi.commande);
          }}
        />
      )}
      <MessagesRefus messages={action.messages} />
      <ConfirmationCommande commande={action.commande} />
    </>
  );
};
