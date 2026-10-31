import { IonButton, IonInput, IonModal, IonNote } from '@ionic/react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import {
  BoiteConfirmation,
  LIBELLE_ANNULER,
} from '../../../../commun/presentation/ui/boite-confirmation';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import {
  registreSaisie,
  type RegistreSaisie,
} from '../../../../commun/presentation/saisie/registre-saisie';
import type { ModeleVueConfirmation } from '../../modeles-de-vue/confirmation';
import type { ModeleVueFormulaireSousTache } from '../../modeles-de-vue/formulaire-sous-tache';
import type { ModeleVueFormulaireTache } from '../../modeles-de-vue/formulaire-tache';
import {
  champDuMessage,
  type ChampSaisie,
  type MessageRefus,
} from '../../modeles-de-vue/messages-de-refus';
import type {
  IssueSaisie,
  IssueTache,
  ObjectifProposable,
  SaisieTacheUi,
} from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';
import { MessagesRefus } from './messages-refus';
import { PucesObjectif } from './puces-objectif';
import { SelecteurDuree } from './selecteur-duree';

// QuickAdd (guide §4.3, ECR-002 L2, ECR-006) : intitulé, puis délai et estimation obligatoires sans valeur
// présélectionnée, objectifs facultatifs. « Ajouter » reste actif : les défauts sont cumulés sous leurs champs (texte et
// icône, jamais la couleur seule), le focus va au premier, la saisie est conservée. Après un ajout la feuille reste
// ouverte, vide, avec « Ajoutée à Tâches » ; seuls les rattachements issus du contexte sont pré-remplis.
// Variante sous-tâche (ECR-007 I) : la tâche parente est nommée, ALR-012 informe de la somme, aucun objectif à choisir
// (ils sont hérités) ; une confirmation demandée par la commande s'affiche sans perdre la saisie.
export type FormulaireSaisie = ModeleVueFormulaireTache | ModeleVueFormulaireSousTache;

export type ProprietesSaisieRapide = {
  readonly ouverte: boolean;
  readonly formulaire: FormulaireSaisie;
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  readonly surValider: (saisie: SaisieTacheUi) => Promise<IssueSaisie>;
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
const depart = (formulaire: FormulaireSaisie): Valeurs => ({
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

const estModifie = (valeurs: Valeurs, formulaire: FormulaireSaisie): boolean =>
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
  else if (champ === 'estimation') foyers.estimation.current?.focus();
};

const basculer = (
  selection: ReadonlyArray<IdObjectif>,
  id: IdObjectif,
): ReadonlyArray<IdObjectif> =>
  selection.includes(id) ? selection.filter((i) => i !== id) : [...selection, id];

/** Confirmation demandée par la commande (CNF-AJOUT-SOUS-TACHE-TERMINEE) : `confirmer` exécute la commande évaluée. */
type ConfirmationEnAttente = {
  readonly modele: ModeleVueConfirmation;
  readonly confirmer: () => Promise<IssueTache>;
};

type EtatSaisie = {
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly ajoutee: boolean;
  readonly enCours: boolean;
  readonly confirmation?: ConfirmationEnAttente;
};

type ContexteAjout = {
  readonly foyers: Foyers;
  readonly ecrireEtat: (etat: EtatSaisie) => void;
  readonly reinitialiser: () => void;
};

/** Suites d'une validation : confirmation à afficher, refus cumulés sous leurs champs, ou remise à zéro après l'ajout. */
const appliquerIssue = async (c: ContexteAjout, issue: IssueSaisie): Promise<void> => {
  if (issue.type === 'CONFIRMATION_REQUISE') {
    const { confirmation: modele, confirmer } = issue;
    c.ecrireEtat({
      messages: [],
      ajoutee: false,
      enCours: false,
      confirmation: { modele, confirmer },
    });
    return;
  }
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

/** Valide la saisie : l'issue de la commande est appliquée par `appliquerIssue`. */
const ajouterTache = async (
  c: ContexteAjout,
  valeurs: Valeurs,
  surValider: ProprietesSaisieRapide['surValider'],
): Promise<void> => {
  c.ecrireEtat({ messages: [], ajoutee: false, enCours: true });
  await appliquerIssue(c, await surValider(versSaisie(valeurs)));
};

/** « Rouvrir et ajouter » : la commande évaluée est exécutée, son issue est appliquée comme celle d'un ajout. */
const confirmerAjout = async (
  c: ContexteAjout,
  confirmation: ConfirmationEnAttente,
): Promise<void> => {
  c.ecrireEtat({ messages: [], ajoutee: false, enCours: true });
  await appliquerIssue(c, await confirmation.confirmer());
};

const useRefsChamps = () => ({
  refIntitule: useRef<HTMLIonInputElement>(null),
  refDelai: useRef<HTMLIonInputElement>(null),
  refEstimation: useRef<HTMLDivElement>(null),
});

const sansConfirmation = ({ messages, ajoutee, enCours }: EtatSaisie): EtatSaisie => ({
  messages,
  ajoutee,
  enCours,
});

/** Gestes du formulaire : « Ajouter », confirmation de la commande évaluée, renoncement à cette confirmation. */
const commandesDe = (
  contexteDe: () => ContexteAjout,
  valeurs: Valeurs,
  etat: EtatSaisie,
  surValider: ProprietesSaisieRapide['surValider'],
) => ({
  ajouter: async (): Promise<void> => {
    if (!etat.enCours) await ajouterTache(contexteDe(), valeurs, surValider);
  },
  confirmer: async (): Promise<void> => {
    if (etat.confirmation !== undefined) await confirmerAjout(contexteDe(), etat.confirmation);
  },
  annulerConfirmation: (): void => {
    contexteDe().ecrireEtat(sansConfirmation(etat));
  },
});

const useSaisie = (
  formulaire: FormulaireSaisie,
  surValider: ProprietesSaisieRapide['surValider'],
) => {
  const [valeurs, setValeurs] = useState<Valeurs>(() => depart(formulaire));
  const [etat, setEtat] = useState<EtatSaisie>({ messages: [], ajoutee: false, enCours: false });
  const refs = useRefsChamps();
  const contexteDe = (): ContexteAjout => ({
    foyers: { intitule: refs.refIntitule, delai: refs.refDelai, estimation: refs.refEstimation },
    ecrireEtat: setEtat,
    reinitialiser: () => {
      setValeurs(depart(formulaire));
    },
  });
  const modifier = (changement: Partial<Valeurs>): void => {
    setEtat((courant) => ({ ...courant, ajoutee: false }));
    setValeurs((courantes) => ({ ...courantes, ...changement }));
  };
  const commandes = commandesDe(contexteDe, valeurs, etat, surValider);
  return { valeurs, ...etat, ...refs, modifier, ...commandes };
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

const estSousTache = (formulaire: FormulaireSaisie): formulaire is ModeleVueFormulaireSousTache =>
  'tacheParente' in formulaire;

const titreDe = (formulaire: FormulaireSaisie): string =>
  estSousTache(formulaire) ? LIBELLES_TACHES.saisieSousTacheTitre : LIBELLES_TACHES.saisieTitre;

/** Titre, puis pour une sous-tâche la tâche parente et ALR-012 (première sous-tâche). */
const EnTeteSaisie = ({ formulaire }: { readonly formulaire: FormulaireSaisie }) => (
  <>
    <h2>{titreDe(formulaire)}</h2>
    {estSousTache(formulaire) ? (
      <>
        <p>
          {LIBELLES_TACHES.deTacheParente.replace('{parent}', formulaire.tacheParente.intitule)}
        </p>
        {formulaire.information === undefined ? null : (
          <IonNote role="status" data-code={formulaire.information.code}>
            {formulaire.information.libelle}
          </IonNote>
        )}
      </>
    ) : null}
  </>
);

const Champs = ({
  saisie,
  formulaire,
  objectifs,
}: {
  readonly saisie: Saisie;
  readonly formulaire: FormulaireSaisie;
  readonly objectifs: ProprietesSaisieRapide['objectifs'];
}) => (
  <>
    <ChampIntitule {...saisie} />
    <ChampDelaiObligatoire {...saisie} />
    <ChampEstimationObligatoire {...saisie} />
    {estSousTache(formulaire) ? null : (
      <PucesObjectif
        nom={LIBELLES_TACHES.champObjectifs}
        objectifs={objectifs}
        selection={saisie.valeurs.objectifIds}
        surBasculer={(id) => {
          saisie.modifier({ objectifIds: basculer(saisie.valeurs.objectifIds, id) });
        }}
      />
    )}
  </>
);

/** Refus qui ne désignent aucun champ (ERR-032) : affichés sous les champs, jamais perdus. */
const MessagesHorsChamp = ({ messages }: { readonly messages: ReadonlyArray<MessageRefus> }) => (
  <MessagesRefus
    messages={messages.filter((message) => champDuMessage(message.code) === undefined)}
  />
);

const ConfirmationAjout = ({
  saisie,
  surAnnuler,
}: {
  readonly saisie: Saisie;
  readonly surAnnuler: () => void;
}) => {
  const modele = saisie.confirmation?.modele;
  return modele === undefined ? null : (
    <BoiteConfirmation
      code={modele.code}
      titre={modele.titre}
      {...(modele.texte === undefined ? {} : { texte: modele.texte })}
      actionLibelle={modele.actionLibelle}
      rouge={false}
      surConfirmer={() => void saisie.confirmer()}
      surAnnuler={surAnnuler}
    />
  );
};

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
  refAjouter,
}: {
  readonly saisie: Saisie;
  readonly surFermer: () => void;
  readonly refAjouter: RefObject<HTMLIonButtonElement | null>;
}) => (
  <>
    {saisie.ajoutee ? (
      <IonNote role="status" data-etat="TST-AJOUTEE">
        {libelle('TST-AJOUTEE')}
      </IonNote>
    ) : null}
    <IonButton
      ref={refAjouter}
      expand="block"
      disabled={saisie.enCours}
      onClick={() => void saisie.ajouter()}
    >
      {LIBELLES_TACHES.ajouter}
    </IonButton>
    <IonButton expand="block" fill="clear" onClick={surFermer}>
      {LIBELLE_ANNULER}
    </IonButton>
  </>
);

/**
 * Tant qu'une confirmation est affichée, la feuille ne se ferme pas (Échap, fond) ; annuler la confirmation laisse la
 * feuille ouverte avec la saisie et rend le focus à « Ajouter » (guide §6.6.7).
 */
const useConfirmationDeLaFeuille = (
  saisie: Saisie,
  surConfirmationAffichee: (affichee: boolean) => void,
) => {
  const refAjouter = useRef<HTMLIonButtonElement>(null);
  const affichee = saisie.confirmation !== undefined;
  useEffect(() => {
    surConfirmationAffichee(affichee);
  }, [surConfirmationAffichee, affichee]);
  const annulerConfirmation = (): void => {
    saisie.annulerConfirmation();
    refAjouter.current?.focus();
  };
  return { refAjouter, annulerConfirmation };
};

const FormulaireSaisieRapide = ({
  saisie,
  formulaire,
  objectifs,
  surFermer,
  refAjouter,
}: {
  readonly saisie: Saisie;
  readonly formulaire: FormulaireSaisie;
  readonly objectifs: ProprietesSaisieRapide['objectifs'];
  readonly surFermer: () => void;
  readonly refAjouter: RefObject<HTMLIonButtonElement | null>;
}) => (
  <form
    className="saisie-rapide-contenu"
    aria-label={titreDe(formulaire)}
    onSubmit={(e) => {
      e.preventDefault();
    }}
  >
    <EnTeteSaisie formulaire={formulaire} />
    <Champs saisie={saisie} formulaire={formulaire} objectifs={objectifs} />
    <MessagesHorsChamp messages={saisie.messages} />
    <Boutons saisie={saisie} surFermer={surFermer} refAjouter={refAjouter} />
  </form>
);

const CorpsSaisie = ({
  formulaire,
  objectifs,
  surValider,
  surFermer,
  registre = registreSaisie,
  surConfirmationAffichee,
}: Omit<ProprietesSaisieRapide, 'ouverte' | 'surFermee'> & {
  readonly surFermer: () => void;
  readonly surConfirmationAffichee: (affichee: boolean) => void;
}) => {
  const saisie = useSaisie(formulaire, surValider);
  const { refAjouter, annulerConfirmation } = useConfirmationDeLaFeuille(
    saisie,
    surConfirmationAffichee,
  );
  useDeclarationSaisie(registre, estModifie(saisie.valeurs, formulaire));
  return (
    <>
      <FormulaireSaisieRapide
        saisie={saisie}
        formulaire={formulaire}
        objectifs={objectifs}
        surFermer={surFermer}
        refAjouter={refAjouter}
      />
      <ConfirmationAjout saisie={saisie} surAnnuler={annulerConfirmation} />
    </>
  );
};

export const SaisieRapide = ({ ouverte, surFermee, ...corps }: ProprietesSaisieRapide) => {
  const [confirmationAffichee, setConfirmationAffichee] = useState(false);
  return (
    <IonModal
      isOpen={ouverte}
      className="saisie-rapide"
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      backdropDismiss={!confirmationAffichee}
      onDidDismiss={surFermee}
    >
      <CorpsSaisie
        {...corps}
        surFermer={surFermee}
        surConfirmationAffichee={setConfirmationAffichee}
      />
    </IonModal>
  );
};
