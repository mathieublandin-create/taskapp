import { IonNote } from '@ionic/react';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';

// Messages d'un refus affichés sous leur champ : texte et rôle `alert`, jamais la couleur seule (guide §4.3).
export const MessagesRefus = ({ messages }: { readonly messages: ReadonlyArray<MessageRefus> }) =>
  messages.map((message) => (
    <IonNote key={message.code} color="danger" role="alert" data-message={message.code}>
      {libelle(message.code, message.variables)}
    </IonNote>
  ));
