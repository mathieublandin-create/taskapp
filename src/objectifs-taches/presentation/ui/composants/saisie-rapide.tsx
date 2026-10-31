import { IonButton, IonInput, IonModal, IonNote } from '@ionic/react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import {
  registreSaisie,
  type RegistreSaisie,
} from '../../../../commun/presentation/saisie/registre-saisie';
import type { ModeleVueFormulaireTache } from '../../modeles-de-vue/formulaire-tache';
import {
  champDuMessage,
  type ChampSaisie,
  type MessageRefus,
} from '../../modeles-de-vue/messages-de-refus';
import type { IssueTache, ObjectifProposable, SaisieTacheUi } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';
import { MessagesRefus } from './messages-refus';
import { PucesObjectif } from './puces-objectif';
import { SelecteurDuree } from './selecteur-duree';

// QuickAdd (guide §4.3, ECR-002 L2, ECR-006) : intitulé, puis délai et estimation obligatoires sans valeur
// présélectionnée, objectifs facultatifs. « Ajouter » reste actif : les défauts sont cumulés sous leurs champs (texte et
// icône, jamais la couleur seule), le focus va au premier, la saisie est conservée. Après un ajout la feuille reste
// ouverte, vide, avec « Ajoutée à Tâches » ; seuls les rattachements issus du contexte sont pré-remplis.
export type ProprietesSaisieRapide = {
  readonly ouverte: boolean;
  readonly formulaire: ModeleVueFormulaireTache;
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  readonly surValider: (saisie: SaisieTacheUi) => Promise<IssueTache>;
  readonly surFermee: () => void;
  readonly registre?: Pick<RegistreSaisie, 'declarer'>;
};

type Valeurs = {
  readonly intitule: string;
  readonly delai: string;
  readonly estimation: number | undefined;
  readonly objectifIds: ReadonlyArray<IdObjectif>;
};

const IDENTIFIANT_SAISIE = 'saisie-rapide-tache';
const depart = (formulaire: ModeleVueFormulaireTache): Valeurs => ({
  intitule: '',
  delai: '',
  estimation: undefined,
  objectifIds: formulaire.objectifsPreRemplis,
});

const versSaisie = (valeurs: Valeurs): SaisieTacheUi => {
  const delai = DateCalendaire.depuisTexte(valeurs.delai);
  return {
    intitule: valeurs.intitule,
    ...(delai.ok ? { delai: delai.valeur } : {}),
    ...(valeurs.estimation === undefined ? {} : { estimationMinutes: valeurs.estimation }),
    objectifIds: valeurs.objectifIds,
  };
};

const estModifie = (valeurs: Valeurs, formulaire: ModeleVueFormulaireTache): boolean =>
  valeurs.intitule !== '' ||
  valeurs.delai !== '' ||
  valeurs.estimation !== undefined ||
  valeurs.objectifIds.join() !== formulaire.objectifsPreRemplis.join();

const messagesDuChamp = (
  messages: ReadonlyArray<MessageRefus>,
  champ: ChampSaisie,
): ReadonlyArray<MessageRefus> =>
  messages.filter((message) => champDuMessage(message.code) === champ);

/** Ionic pose `aria-invalid` sur l'élément natif d'un champ marqué invalide et touché. */
const marqueErreur = (erreurs: ReadonlyArray<MessageRefus>): { readonly className?: string } =>
  erreurs.length > 0 ? { className: 'ion-invalid ion-touched' } : {};

type Foyers = {
  readonly intitule: RefObject<HTMLIonInputElement | null>;
  readonly delai: RefObject<HTMLIonInputElement | null>;
  readonly estimation: RefObject<HTMLDivElement | null>;
};

/** Focus sur le champ du premier message (ordre intitulé, délai, estimation). */
const focaliserPremier = async (messages: ReadonlyArray<MessageRefus>, foyers: Foyers) => {
  const champ = messages.map((m) => champDuMessage(m.code)).find((c) => c !== undefined);
  if (champ === 'intitule') await foyers.intitule.current?.setFocus();
  else if (champ === 'delai') await foyers.delai.current?.setFocus();
  else foyers.estimation.current?.focus();
};

const basculer = (
  selection: ReadonlyArray<IdObjectif>,
  id: IdObjectif,
): ReadonlyArray<IdObjectif> =>
  selection.includes(id) ? selection.filter((i) => i !== id) : [...selection, id];

type EtatSaisie = {
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly ajoutee: boolean;
  readonly enCours: boolean;
};

type ContexteAjout = {
  readonly valeurs: Valeurs;
  readonly formulaire: ModeleVueFormulaireTache;
  readonly surValider: ProprietesSaisieRapide['surValider'];
  readonly foyers: Foyers;
  readonly ecrireEtat: (etat: EtatSaisie) => void;
  readonly reinitialiser: () => void;
};

/** Valide la saisie : refus cumulés sous leurs champs (focus sur le premier), ou remise à zéro après l'ajout. */
const ajouterTache = async (c: ContexteAjout): Promise<void> => {
  c.ecrireEtat({ messages: [], ajoutee: false, enCours: true });
  const issue = await c.surValider(versSaisie(c.valeurs));
  if (issue.type === 'REFUSEE') {
    c.ecrireEtat({ messages: issue.messages, ajoutee: false, enCours: false });
    await focaliserPremier(issue.messages, c.foyers);
    return;
  }
  const faite = issue.type === 'FAITE';
  c.ecrireEtat({ messages: [], ajoutee: faite, enCours: false });
  if (faite) {
    c.reinitialiser();
    await c.foyers.intitule.current?.setFocus();
  }
};

const useSaisie = (
  formulaire: ModeleVueFormulaireTache,
  surValider: ProprietesSaisieRapide['surValider'],
) => {
  const [valeurs, setValeurs] = useState<Valeurs>(() => depart(formulaire));
  const [etat, setEtat] = useState<EtatSaisie>({ messages: [], ajoutee: false, enCours: false });
  const refIntitule = useRef<HTMLIonInputElement>(null);
  const refDelai = useRef<HTMLIonInputElement>(null);
  const refEstimation = useRef<HTMLDivElement>(null);
  const modifier = (changement: Partial<Valeurs>): void => {
    setEtat((courant) => ({ ...courant, ajoutee: false }));
    setValeurs((courantes) => ({ ...courantes, ...changement }));
  };
  const ajouter = async (): Promise<void> => {
    if (etat.enCours) return;
    await ajouterTache({
      valeurs,
      formulaire,
      surValider,
      foyers: { intitule: refIntitule, delai: refDelai, estimation: refEstimation },
      ecrireEtat: setEtat,
      reinitialiser: () => {
        setValeurs(depart(formulaire));
      },
    });
  };
  return { valeurs, ...etat, refIntitule, refDelai, refEstimation, modifier, ajouter };
};

type Saisie = ReturnType<typeof useSaisie>;

const ChampIntitule = ({ valeurs, messages, refIntitule, modifier, ajouter }: Saisie) => {
  const erreurs = messagesDuChamp(messages, 'intitule');
  return (
    <>
      <IonInput
        ref={refIntitule}
        label={LIBELLES_TACHES.champIntitule}
        labelPlacement="stacked"
        placeholder={LIBELLES_TACHES.exempleIntitule}
        value={valeurs.intitule}
        onIonInput={(e) => {
          modifier({ intitule: e.detail.value ?? '' });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void ajouter();
        }}
        {...marqueErreur(erreurs)}
      />
      <MessagesRefus messages={erreurs} />
    </>
  );
};

const ChampDelaiObligatoire = ({ valeurs, messages, refDelai, modifier }: Saisie) => {
  const erreurs = messagesDuChamp(messages, 'delai');
  return (
    <>
      <IonInput
        ref={refDelai}
        type="date"
        label={`${LIBELLES_TACHES.champDelai} ${libelle('MEN-OBLIGATOIRE')}`}
        labelPlacement="stacked"
        value={valeurs.delai}
        onIonInput={(e) => {
          modifier({ delai: e.detail.value ?? '' });
        }}
        {...marqueErreur(erreurs)}
      />
      <MessagesRefus messages={erreurs} />
    </>
  );
};

const ChampEstimationObligatoire = ({ valeurs, messages, refEstimation, modifier }: Saisie) => {
  const erreurs = messagesDuChamp(messages, 'estimation');
  return (
    <>
      <SelecteurDuree
        ref={refEstimation}
        nom={`${LIBELLES_TACHES.champEstimation} ${libelle('MEN-OBLIGATOIRE')}`}
        valeur={valeurs.estimation}
        invalide={erreurs.length > 0}
        surChanger={(minutes) => {
          modifier({ estimation: minutes });
        }}
      />
      <MessagesRefus messages={erreurs} />
    </>
  );
};

const Champs = ({
  saisie,
  objectifs,
}: {
  readonly saisie: Saisie;
  readonly objectifs: ProprietesSaisieRapide['objectifs'];
}) => (
  <>
    <ChampIntitule {...saisie} />
    <ChampDelaiObligatoire {...saisie} />
    <ChampEstimationObligatoire {...saisie} />
    <PucesObjectif
      nom={LIBELLES_TACHES.champObjectifs}
      objectifs={objectifs}
      selection={saisie.valeurs.objectifIds}
      surBasculer={(id) => {
        saisie.modifier({ objectifIds: basculer(saisie.valeurs.objectifIds, id) });
      }}
    />
  </>
);

/** Déclare l'état du formulaire au registre de saisie tant qu'il est ouvert (GardeSaisie, DAT §4.1.7). */
const useDeclarationSaisie = (
  registre: Pick<RegistreSaisie, 'declarer'>,
  modifie: boolean,
): void => {
  useEffect(() => {
    registre.declarer(IDENTIFIANT_SAISIE, modifie);
  }, [registre, modifie]);
  useEffect(
    () => () => {
      registre.declarer(IDENTIFIANT_SAISIE, false);
    },
    [registre],
  );
};

const Boutons = ({
  saisie,
  surFermer,
}: {
  readonly saisie: Saisie;
  readonly surFermer: () => void;
}) => (
  <>
    {saisie.ajoutee ? (
      <IonNote role="status" data-etat="TST-AJOUTEE">
        {libelle('TST-AJOUTEE')}
      </IonNote>
    ) : null}
    <IonButton expand="block" disabled={saisie.enCours} onClick={() => void saisie.ajouter()}>
      {LIBELLES_TACHES.ajouter}
    </IonButton>
    <IonButton expand="block" fill="clear" onClick={surFermer}>
      {LIBELLE_ANNULER}
    </IonButton>
  </>
);

const CorpsSaisie = ({
  formulaire,
  objectifs,
  surValider,
  surFermer,
  registre = registreSaisie,
}: Omit<ProprietesSaisieRapide, 'ouverte' | 'surFermee'> & { readonly surFermer: () => void }) => {
  const saisie = useSaisie(formulaire, surValider);
  useDeclarationSaisie(registre, estModifie(saisie.valeurs, formulaire));
  return (
    <form
      className="saisie-rapide-contenu"
      aria-label={LIBELLES_TACHES.saisieTitre}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <h2>{LIBELLES_TACHES.saisieTitre}</h2>
      <Champs saisie={saisie} objectifs={objectifs} />
      <Boutons saisie={saisie} surFermer={surFermer} />
    </form>
  );
};

export const SaisieRapide = ({ ouverte, surFermee, ...corps }: ProprietesSaisieRapide) => (
  <IonModal
    isOpen={ouverte}
    className="saisie-rapide"
    initialBreakpoint={1}
    breakpoints={[0, 1]}
    onDidDismiss={surFermee}
  >
    <CorpsSaisie {...corps} surFermer={surFermee} />
  </IonModal>
);
