import { IonButton, IonInput, IonModal, IonNote, IonTextarea } from '@ionic/react';
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import {
  registreSaisie,
  type RegistreSaisie,
} from '../../../../commun/presentation/saisie/registre-saisie';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import type { IssueSaisie } from '../etat/magasin-objectifs-taches';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import { LIBELLES_OBJECTIFS } from '../libelles-ui';

// Feuille de saisie d'un objectif (ECR-008 B : création ; menu « … » d'ECR-003 : renommer, description, délai).
// Panneau de 400 px sur PC, feuille basse sur smartphone (CSS). Entrée valide, Échap ferme. Un refus s'affiche sous le
// champ (ERR-020), le focus y retourne et la saisie est conservée. L'état « formulaire modifié » est déclaré au
// registre de saisie (GardeSaisie, DAT §4.1.7), retiré à la fermeture.
export type ModeFeuille = keyof typeof LIBELLES_OBJECTIFS.feuille;

export type ValeursFeuille = {
  readonly intitule: string;
  readonly description: string;
  /** Date au format AAAA-MM-JJ, ou vide : « Sans délai » est le choix par défaut (RG-002). */
  readonly delai: string;
};

const VIDE: ValeursFeuille = { intitule: '', description: '', delai: '' };

export type ProprietesFeuilleObjectif = {
  readonly mode: ModeFeuille;
  readonly initiales?: Partial<ValeursFeuille>;
  /** Identifiant du formulaire au registre de saisie : un seul état par formulaire. */
  readonly identifiantSaisie: string;
  readonly surValider: (valeurs: ValeursFeuille) => Promise<IssueSaisie>;
  readonly surAnnuler: () => void;
  readonly registre?: Pick<RegistreSaisie, 'declarer'>;
};

const CHAMPS_PAR_MODE: Readonly<Record<ModeFeuille, ReadonlyArray<keyof ValeursFeuille>>> = {
  CREATION: ['intitule', 'description', 'delai'],
  RENOMMAGE: ['intitule'],
  DESCRIPTION: ['description'],
  DELAI: ['delai'],
};

const texteMessage = (message: MessageRefus): string =>
  libelle(
    message.code,
    message.variante === undefined
      ? message.variables
      : { ...message.variables, variante: message.variante },
  );

const sontEgales = (a: ValeursFeuille, b: ValeursFeuille): boolean =>
  a.intitule === b.intitule && a.description === b.description && a.delai === b.delai;

/** Déclare l'état du formulaire au registre tant qu'il est ouvert, et le retire à la fermeture. */
const useDeclarationSaisie = (
  registre: Pick<RegistreSaisie, 'declarer'>,
  identifiant: string,
  modifie: boolean,
): void => {
  useEffect(() => {
    registre.declarer(identifiant, modifie);
  }, [registre, identifiant, modifie]);
  useEffect(
    () => () => {
      registre.declarer(identifiant, false);
    },
    [registre, identifiant],
  );
};

type ProprietesChamps = {
  readonly champs: ReadonlyArray<keyof ValeursFeuille>;
  readonly valeurs: ValeursFeuille;
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly champIntitule: RefObject<HTMLIonInputElement | null>;
  readonly modifier: (champ: keyof ValeursFeuille, valeur: string) => void;
  readonly surEntree: (evenement: KeyboardEvent) => void;
};

const ChampIntitule = ({
  valeurs,
  messages,
  champIntitule,
  modifier,
  surEntree,
}: ProprietesChamps) => (
  <>
    <IonInput
      ref={champIntitule}
      label={LIBELLES_OBJECTIFS.champIntitule}
      labelPlacement="stacked"
      placeholder={LIBELLES_OBJECTIFS.exempleIntitule}
      value={valeurs.intitule}
      onIonInput={(e) => {
        modifier('intitule', e.detail.value ?? '');
      }}
      onKeyDown={surEntree}
      {...(messages.length === 0 ? {} : { 'aria-invalid': true })}
    />
    {messages.map((message) => (
      <IonNote key={message.code} color="danger" role="alert" data-message={message.code}>
        {texteMessage(message)}
      </IonNote>
    ))}
  </>
);

const ChampsFeuille = (proprietes: ProprietesChamps) => {
  const { champs, valeurs, modifier, surEntree } = proprietes;
  return (
    <>
      {champs.includes('intitule') ? <ChampIntitule {...proprietes} /> : null}
      {champs.includes('description') ? (
        <IonTextarea
          label={`${LIBELLES_OBJECTIFS.champDescription} ${LIBELLES_OBJECTIFS.facultative}`}
          labelPlacement="stacked"
          value={valeurs.description}
          onIonInput={(e) => {
            modifier('description', e.detail.value ?? '');
          }}
        />
      ) : null}
      {champs.includes('delai') ? (
        <IonInput
          type="date"
          label={`${LIBELLES_OBJECTIFS.champDelai} ${LIBELLES_OBJECTIFS.facultatif}`}
          labelPlacement="stacked"
          value={valeurs.delai}
          onIonInput={(e) => {
            modifier('delai', e.detail.value ?? '');
          }}
          onKeyDown={surEntree}
        />
      ) : null}
    </>
  );
};

/** Valeurs saisies, refus affichés et validation (une seule à la fois) de la feuille. */
const useSaisieFeuille = (
  depart: ValeursFeuille,
  surValider: ProprietesFeuilleObjectif['surValider'],
) => {
  const [valeurs, setValeurs] = useState<ValeursFeuille>(depart);
  const [messages, setMessages] = useState<ReadonlyArray<MessageRefus>>([]);
  const [enCours, setEnCours] = useState(false);
  const champIntitule = useRef<HTMLIonInputElement>(null);
  const modifier = (champ: keyof ValeursFeuille, valeur: string): void => {
    setValeurs((courantes) => ({ ...courantes, [champ]: valeur }));
  };
  const valider = async (): Promise<void> => {
    if (enCours) return;
    setEnCours(true);
    const issue = await surValider(valeurs);
    setEnCours(false);
    if (issue.type !== 'REFUSEE') return;
    setMessages(issue.messages);
    await champIntitule.current?.setFocus();
  };
  return { valeurs, messages, enCours, champIntitule, modifier, valider };
};

type ProprietesContenu = Pick<ProprietesFeuilleObjectif, 'mode' | 'surAnnuler'> & {
  readonly saisie: ReturnType<typeof useSaisieFeuille>;
};

const ContenuFeuille = ({ mode, surAnnuler, saisie }: ProprietesContenu) => {
  const textes = LIBELLES_OBJECTIFS.feuille[mode];
  return (
    <form
      className="feuille-objectif-contenu"
      aria-label={textes.titre}
      onSubmit={(evenement) => {
        evenement.preventDefault();
      }}
    >
      <h2>{textes.titre}</h2>
      <ChampsFeuille
        champs={CHAMPS_PAR_MODE[mode]}
        {...saisie}
        surEntree={(e) => {
          if (e.key === 'Enter') void saisie.valider();
        }}
      />
      <IonButton expand="block" disabled={saisie.enCours} onClick={() => void saisie.valider()}>
        {textes.validation}
      </IonButton>
      <IonButton expand="block" fill="clear" onClick={surAnnuler}>
        {LIBELLE_ANNULER}
      </IonButton>
    </form>
  );
};

export const FeuilleObjectif = ({
  mode,
  initiales = {},
  identifiantSaisie,
  surValider,
  surAnnuler,
  registre = registreSaisie,
}: ProprietesFeuilleObjectif) => {
  const depart = { ...VIDE, ...initiales };
  const saisie = useSaisieFeuille(depart, surValider);
  useDeclarationSaisie(registre, identifiantSaisie, !sontEgales(saisie.valeurs, depart));
  return (
    <IonModal
      isOpen
      className="feuille-objectif"
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      onDidDismiss={surAnnuler}
    >
      <ContenuFeuille mode={mode} surAnnuler={surAnnuler} saisie={saisie} />
    </IonModal>
  );
};
