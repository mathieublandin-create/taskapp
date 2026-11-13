import { IonNote } from '@ionic/react';
import { Fragment } from 'react';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import type { CodeCatalogue } from '../../../../commun/presentation/messages/codes';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';

// Messages d'un refus affichés sous leur champ : texte et rôle `alert`, jamais la couleur seule (guide §4.3). Un
// message dont le code a une action au catalogue (ERR-032 : « Reprendre la tâche ») la propose si l'écran sait la faire.
export const CODES_AVEC_ACTION = ['ERR-032'] as const;
export type CodeAvecAction = (typeof CODES_AVEC_ACTION)[number];
export type ActionsDeMessages = Readonly<Partial<Record<CodeAvecAction, () => void>>>;

const estCodeAvecAction = (code: CodeCatalogue): code is CodeAvecAction =>
  (CODES_AVEC_ACTION as ReadonlyArray<CodeCatalogue>).includes(code);

const ActionDuMessage = ({
  message,
  surAction,
}: {
  readonly message: MessageRefus;
  readonly surAction: (() => void) | undefined;
}) =>
  surAction === undefined ? null : (
    <button type="button" data-action={message.code} onClick={surAction}>
      {libelle(message.code, message.variables, 'action')}
    </button>
  );

export const MessagesRefus = ({
  messages,
  actions = {},
}: {
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly actions?: ActionsDeMessages;
}) =>
  messages.map((message) => (
    <Fragment key={message.code}>
      <IonNote color="danger" role="alert" data-message={message.code}>
        {libelle(message.code, message.variables)}
      </IonNote>
      <ActionDuMessage
        message={message}
        surAction={estCodeAvecAction(message.code) ? actions[message.code] : undefined}
      />
    </Fragment>
  ));
