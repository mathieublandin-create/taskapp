import { IonNote } from '@ionic/react';
import { useId, useRef, useState, type RefObject } from 'react';
import { BoiteConfirmation } from '../../../../commun/presentation/ui/boite-confirmation';
import type { ModeleVueConfirmation } from '../../modeles-de-vue/confirmation';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import type { IssueSaisie, IssueTache } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';
import { MessagesRefus } from './messages-refus';

// Action de fin du détail d'une tâche (ECR-007 A, G) : « Terminer la tâche » (aria-disabled tant qu'il reste des
// sous-tâches à faire, ALR-013 au-dessus, refus ERR-035 annoncé en `alert`) ou « Rouvrir la tâche » (avec la
// confirmation CNF-ROUVRIR-SOUS-TACHE si la tâche parente est terminée). Un seul bouton : le focus le suit d'un état à l'autre.
export type ProprietesActionFin = {
  readonly modele: Pick<ModeleVueDetailTache, 'actions' | 'infoFinImpossible'>;
  readonly surTerminer?: (() => Promise<IssueTache>) | undefined;
  readonly surRouvrir?: (() => Promise<IssueSaisie>) | undefined;
};

type ConfirmationEnAttente = {
  readonly modele: ModeleVueConfirmation;
  readonly confirmer: () => Promise<IssueTache>;
};

const messagesDe = (issue: IssueTache): ReadonlyArray<MessageRefus> =>
  issue.type === 'REFUSEE' ? issue.messages : [];

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

const useActionFin = ({ modele, surTerminer, surRouvrir }: ProprietesActionFin) => {
  const bouton = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useMessagesDeRefus(modele.infoFinImpossible?.n);
  const [confirmation, setConfirmation] = useState<ConfirmationEnAttente | undefined>(undefined);
  const terminer = async (): Promise<void> => {
    setMessages(messagesDe((await surTerminer?.()) ?? { type: 'FAITE' }));
  };
  const rouvrir = async (): Promise<void> => {
    const issue = (await surRouvrir?.()) ?? { type: 'FAITE' };
    if (issue.type === 'CONFIRMATION_REQUISE') {
      setConfirmation({ modele: issue.confirmation, confirmer: issue.confirmer });
    } else {
      setMessages(messagesDe(issue));
    }
  };
  const fermer = (): void => {
    setConfirmation(undefined);
    bouton.current?.focus();
  };
  const confirmer = async (): Promise<void> => {
    const issue = await confirmation?.confirmer();
    setMessages(issue === undefined ? [] : messagesDe(issue));
    fermer();
  };
  return { bouton, messages, confirmation, terminer, rouvrir, fermer, confirmer };
};

const Confirmation = ({
  confirmation,
  surConfirmer,
  surAnnuler,
}: {
  readonly confirmation: ModeleVueConfirmation;
  readonly surConfirmer: () => void;
  readonly surAnnuler: () => void;
}) => (
  <BoiteConfirmation
    code={confirmation.code}
    titre={confirmation.titre}
    {...(confirmation.texte === undefined ? {} : { texte: confirmation.texte })}
    actionLibelle={confirmation.actionLibelle}
    rouge={false}
    surConfirmer={surConfirmer}
    surAnnuler={surAnnuler}
  />
);

const Bouton = ({
  reference,
  terminer,
  idNote,
  surClic,
}: {
  readonly reference: RefObject<HTMLButtonElement | null>;
  readonly terminer: boolean;
  readonly idNote: string | undefined;
  readonly surClic: () => void;
}) => (
  <button
    ref={reference}
    type="button"
    {...(terminer && idNote !== undefined
      ? { 'aria-disabled': true, 'aria-describedby': idNote }
      : {})}
    onClick={surClic}
  >
    {terminer ? LIBELLES_TACHES.terminerTache : LIBELLES_TACHES.rouvrirTache}
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

const ConfirmationEnCours = ({ action }: { readonly action: ReturnType<typeof useActionFin> }) =>
  action.confirmation === undefined ? null : (
    <Confirmation
      confirmation={action.confirmation.modele}
      surConfirmer={() => {
        void action.confirmer();
      }}
      surAnnuler={action.fermer}
    />
  );

type GenreBouton = 'TERMINER' | 'ROUVRIR' | undefined;

const genreBouton = ({ modele, surTerminer, surRouvrir }: ProprietesActionFin): GenreBouton => {
  if (modele.actions.includes('TERMINER') && surTerminer !== undefined) return 'TERMINER';
  return modele.actions.includes('ROUVRIR') && surRouvrir !== undefined ? 'ROUVRIR' : undefined;
};

export const ActionFin = (proprietes: ProprietesActionFin) => {
  const idNote = useId();
  const action = useActionFin(proprietes);
  const genre = genreBouton(proprietes);
  const { infoFinImpossible } = proprietes.modele;
  return (
    <>
      {infoFinImpossible === undefined ? null : <NoteFin info={infoFinImpossible} id={idNote} />}
      {genre === undefined ? null : (
        <Bouton
          reference={action.bouton}
          terminer={genre === 'TERMINER'}
          idNote={infoFinImpossible === undefined ? undefined : idNote}
          surClic={() => {
            void (genre === 'TERMINER' ? action.terminer() : action.rouvrir());
          }}
        />
      )}
      <MessagesRefus messages={action.messages} />
      <ConfirmationEnCours action={action} />
    </>
  );
};
