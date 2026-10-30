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
  /** La feuille est présentée tant que `ouverte` est vraie ; elle reste montée pour que Ionic la ferme proprement. */
  readonly ouverte: boolean;
  readonly mode: ModeFeuille;
  readonly initiales?: Partial<ValeursFeuille>;
  /** Identifiant du formulaire au registre de saisie : un seul état par formulaire. */
  readonly identifiantSaisie: string;
  readonly surValider: (valeurs: ValeursFeuille) => Promise<IssueSaisie>;
  /** Appelée quand la feuille est refermée : saisie validée, « Annuler », Échap ou fond. */
  readonly surFermee: () => void;
  readonly registre?: Pick<RegistreSaisie, 'declarer'>;
};

const CHAMPS_PAR_MODE: Readonly<Record<ModeFeuille, ReadonlyArray<keyof ValeursFeuille>>> = {
  CREATION: ['intitule', 'description', 'delai'],
  RENOMMAGE: ['intitule'],
  DESCRIPTION: ['description'],
  DELAI: ['delai'],
  CREATION_SOUS_OBJECTIF: ['intitule', 'description', 'delai'],
};

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
      {...(messages.length === 0 ? {} : { 'aria-invalid': 'true' })}
    />
    {messages.map((message) => (
      <IonNote key={message.code} color="danger" role="alert" data-message={message.code}>
        {libelle(message.code, message.variables)}
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

type ProprietesCorps = Omit<ProprietesFeuilleObjectif, 'ouverte' | 'surFermee'> & {
  /** Demande la fermeture de la feuille (saisie validée ou « Annuler »). */
  readonly surFermer: () => void;
};

type ProprietesFormulaire = Pick<ProprietesCorps, 'mode' | 'surFermer'> & {
  readonly saisie: ReturnType<typeof useSaisieFeuille>;
};

const FormulaireFeuille = ({ mode, surFermer, saisie }: ProprietesFormulaire) => {
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
      <IonButton expand="block" fill="clear" onClick={surFermer}>
        {LIBELLE_ANNULER}
      </IonButton>
    </form>
  );
};

/** Corps de la feuille : monté à la présentation, démonté à la fermeture (la saisie repart donc de zéro). */
const CorpsFeuille = ({
  mode,
  initiales = {},
  identifiantSaisie,
  surValider,
  surFermer,
  registre = registreSaisie,
}: ProprietesCorps) => {
  const depart = { ...VIDE, ...initiales };
  const saisie = useSaisieFeuille(depart, surValider);
  useDeclarationSaisie(registre, identifiantSaisie, !sontEgales(saisie.valeurs, depart));
  return <FormulaireFeuille mode={mode} surFermer={surFermer} saisie={saisie} />;
};

export const FeuilleObjectif = ({
  ouverte,
  surFermee,
  surValider,
  ...corps
}: ProprietesFeuilleObjectif) => (
  <IonModal
    isOpen={ouverte}
    className="feuille-objectif"
    initialBreakpoint={1}
    breakpoints={[0, 1]}
    onDidDismiss={surFermee}
  >
    <CorpsFeuille
      {...corps}
      surValider={async (valeurs) => {
        const issue = await surValider(valeurs);
        if (issue.type === 'FAITE') surFermee();
        return issue;
      }}
      surFermer={surFermee}
    />
  </IonModal>
);
