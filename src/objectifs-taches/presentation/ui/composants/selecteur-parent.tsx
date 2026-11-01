import { useId, useState } from 'react';
import { IonBackdrop } from '@ionic/react';
import { aUnePartie, libelle } from '../../../../commun/presentation/messages/libelle';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import type { ModeleVueSelecteurParent, OptionParent } from '../../modeles-de-vue/selecteur-parent';

// ParentPicker (ECR-008 C, D ; guide §4.28) : choix unique au clavier (boutons radio). Une option indisponible est
// lue avec sa raison ; le refus ERR-030 s'explique dans une boîte avec « Compris », avant tout choix.
export type CibleParent = OptionParent['cible'];

export type ProprietesSelecteurParent = {
  readonly modele: ModeleVueSelecteurParent;
  /** Refus rendu par le cas d'usage après le choix (ERR-030, ERR-031). */
  readonly refus?: MessageRefus | undefined;
  /** « Compris » sur un refus du cas d'usage : le magasin l'efface. */
  readonly surRefusCompris: () => void;
  readonly surChoisir: (cible: CibleParent) => void;
  readonly surFermer: () => void;
};

const cleDe = (cible: CibleParent): string => (cible.type === 'AUCUN' ? 'AUCUN' : cible.id);

type ProprietesOption = {
  readonly option: OptionParent;
  readonly choisie: boolean;
  readonly surChoisir: () => void;
};

/** Indications du candidat sur une ligne, dans l'ordre délai puis effectif (guide §6.6.4). */
const IndicationsOption = ({
  indications,
  id,
}: {
  readonly indications: OptionParent['indications'];
  readonly id: string;
}) =>
  indications.length === 0 ? null : (
    <span id={id}>
      {indications.map((indication, rang) => (
        <span key={indication.code} data-code={indication.code}>
          {rang === 0 ? '' : ' · '}
          {indication.libelle}
        </span>
      ))}
    </span>
  );

const OptionRadio = ({ option, choisie, surChoisir }: ProprietesOption) => {
  const identifiant = useId();
  const idRaison = `${identifiant}-raison`;
  const idIndications = `${identifiant}-indications`;
  const { raison, indications } = option;
  const description = raison === undefined ? idIndications : idRaison;
  const decrite = raison !== undefined || indications.length > 0;
  return (
    <li>
      <label>
        <input
          type="radio"
          name="parent"
          checked={choisie}
          disabled={!option.disponible}
          {...(decrite ? { 'aria-describedby': description } : {})}
          onChange={surChoisir}
        />
        {option.intitule}
      </label>
      <IndicationsOption indications={indications} id={idIndications} />
      {raison === undefined ? null : (
        <span id={idRaison} data-code={raison.code}>
          {libelle(raison.code, raison.variables)}
        </span>
      )}
    </li>
  );
};

/** Variables du refus, avec la variante du gabarit (ERR-030). */
const variablesDe = (message: MessageRefus) => ({
  ...message.variables,
  ...(message.variante === undefined ? {} : { variante: message.variante }),
});

const ActionCompris = ({ surCompris }: { readonly surCompris: () => void }) => (
  <div className="actions">
    <button type="button" className="primaire" onClick={surCompris}>
      {libelle('ERR-030', {}, 'action')}
    </button>
  </div>
);

/** Boîte d'explication d'un refus (variante en `data-variante`) ; « Compris » la referme. */
const BoiteRefus = ({
  message,
  surCompris,
}: {
  readonly message: MessageRefus;
  readonly surCompris: () => void;
}) => {
  const identifiant = useId();
  const variables = variablesDe(message);
  const aTexte = aUnePartie(message.code, 'texte');
  return (
    <div
      className="boite-confirmation"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${identifiant}-titre`}
      {...(aTexte ? { 'aria-describedby': `${identifiant}-texte` } : {})}
      data-code={message.code}
      {...(message.variante === undefined ? {} : { 'data-variante': message.variante })}
    >
      <h2 id={`${identifiant}-titre`}>{libelle(message.code, variables)}</h2>
      {aTexte ? (
        <p id={`${identifiant}-texte`}>{libelle(message.code, variables, 'texte')}</p>
      ) : null}
      <ActionCompris surCompris={surCompris} />
    </div>
  );
};

type ProprietesOptions = {
  readonly options: ModeleVueSelecteurParent['options'];
  readonly choix: CibleParent | undefined;
  readonly surChoix: (cible: CibleParent) => void;
};

const Options = ({ options, choix, surChoix }: ProprietesOptions) => (
  <fieldset>
    <legend>{libelle('SEL-PARENT-MENU')}</legend>
    <ul>
      {options.map((option) => (
        <OptionRadio
          key={cleDe(option.cible)}
          option={option}
          choisie={choix !== undefined && cleDe(choix) === cleDe(option.cible)}
          surChoisir={() => {
            surChoix(option.cible);
          }}
        />
      ))}
    </ul>
  </fieldset>
);

const ActionsFormulaire = ({
  choix,
  surChoisir,
  surFermer,
}: Pick<ProprietesSelecteurParent, 'surChoisir' | 'surFermer'> & {
  readonly choix: CibleParent | undefined;
}) => (
  <div className="actions">
    <button type="button" onClick={surFermer}>
      {LIBELLE_ANNULER}
    </button>
    <button
      type="button"
      className="primaire"
      disabled={choix === undefined}
      onClick={() => {
        if (choix !== undefined) surChoisir(choix);
      }}
    >
      {libelle('SEL-PARENT-VALIDER')}
    </button>
  </div>
);

const Formulaire = ({
  modele,
  surChoisir,
  surFermer,
}: Pick<ProprietesSelecteurParent, 'modele' | 'surChoisir' | 'surFermer'>) => {
  const [choix, setChoix] = useState<CibleParent | undefined>(undefined);
  return (
    <form
      className="boite-confirmation selecteur-parent"
      role="dialog"
      aria-modal="true"
      aria-label={modele.titre}
      onSubmit={(evenement) => {
        evenement.preventDefault();
      }}
    >
      <h2>{modele.titre}</h2>
      <Options options={modele.options} choix={choix} surChoix={setChoix} />
      <ActionsFormulaire choix={choix} surChoisir={surChoisir} surFermer={surFermer} />
    </form>
  );
};

export const SelecteurParent = ({
  refus,
  surRefusCompris,
  ...formulaire
}: ProprietesSelecteurParent) => {
  const [bloquantCompris, setBloquantCompris] = useState(false);
  // Le refus du cas d'usage prime sur le message affiché avant tout choix.
  const message = refus ?? (bloquantCompris ? undefined : formulaire.modele.messageBloquant);
  const surCompris = (): void => {
    if (refus === undefined) setBloquantCompris(true);
    else surRefusCompris();
  };
  return (
    <>
      <div className="scrim">
        <IonBackdrop tappable={false} />
        <Formulaire {...formulaire} />
      </div>
      {message === undefined ? null : (
        <div className="scrim">
          <IonBackdrop tappable={false} />
          <BoiteRefus message={message} surCompris={surCompris} />
        </div>
      )}
    </>
  );
};
