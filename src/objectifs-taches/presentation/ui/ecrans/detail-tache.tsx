import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonNote,
  IonToolbar,
} from '@ionic/react';
import { useRef, useState, type RefObject } from 'react';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import { useConsultationSeule } from '../../../../commun/presentation/ui/consultation-seule';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import type { ActionTache } from '../../../domaine/types-actions';
import type {
  ActionPrincipaleCarte,
  ModeleVueDetailTache,
} from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { ActionFin } from '../composants/action-fin';
import { CarteIncoherence } from '../composants/carte-incoherence';
import { ChampDetail, ChampVerrouille } from '../composants/champ-detail';
import {
  ConfirmationCommande,
  useCommandeConfirmee,
  type Focalisable,
} from '../composants/commande-confirmee';
import { MessagesRefus } from '../composants/messages-refus';
import { PucesObjectif } from '../composants/puces-objectif';
import { SectionSousTaches } from '../composants/section-sous-taches';
import { SelecteurDuree } from '../composants/selecteur-duree';
import { messagesDeIssue } from '../etat/issues';
import type { IssueSaisie, IssueTache, ObjectifProposable } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';

// Écran ECR-007 (B, C, E) : intitulé, état, alertes de délai, champs modifiables (délai, estimation, objectifs) ou
// verrouillés (estimation calculée d'une tâche parente, objectifs hérités d'une sous-tâche), menu « … ».
export type ProprietesDetailTache = {
  readonly modele: ModeleVueDetailTache;
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  readonly surRetour: () => void;
  /** Les commandes rendent leur issue : l'éditeur reste ouvert et affiche le refus, sauf si elle est faite. */
  readonly surRenommer: (intitule: string) => Promise<IssueTache>;
  readonly surModifierDelai: (delai: DateCalendaire) => Promise<IssueTache>;
  readonly surModifierEstimation: (minutes: number) => Promise<IssueTache>;
  readonly surBasculerObjectif: (id: IdObjectif) => void;
  readonly surSupprimer: () => void;
  /** ECR-007 A : ouvre le détail d'une sous-tâche ; saisie d'une nouvelle sous-tâche (proposée par `actions`). */
  readonly surOuvrirSousTache: (id: IdTache) => void;
  readonly surAjouterSousTache: () => void;
  /** ECR-007 C, D, D2 : « Abandonner la tâche… » du menu « … » ; la confirmation est toujours demandée. */
  readonly surAbandonner: () => Promise<IssueSaisie>;
  /** ECR-007 A, F, G : fin, réouverture et reprise ; sans elles, ni bouton ni case « Terminer » active. */
  readonly surTerminer?: () => Promise<IssueTache>;
  readonly surTerminerSousTache?: (id: IdTache) => void;
  readonly surRouvrir?: () => Promise<IssueSaisie>;
  readonly surReprendre?: () => Promise<IssueSaisie>;
  /** ST-US-024 v0.7 §6.8 (DT-030) : case « Rouvrir » d'une sous-tâche terminée ; confirmée si la tâche parente est terminée. */
  readonly surRouvrirSousTache?: (id: IdTache) => Promise<IssueSaisie>;
  /** Carte d'incohérence (ECR-007 H) : « Abandonner la sous-tâche » ; la confirmation habituelle de l'abandon s'applique. */
  readonly surAbandonnerSousTache?: (id: IdTache) => Promise<IssueSaisie>;
};

type Edition = 'DELAI' | 'ESTIMATION' | 'OBJECTIFS' | 'INTITULE' | undefined;

type ActionMenu = Extract<ActionTache, 'RENOMMER' | 'ABANDONNER' | 'SUPPRIMER'>;

const MENU_ORDRE: ReadonlyArray<ActionMenu> = ['RENOMMER', 'ABANDONNER', 'SUPPRIMER'];

const Menu = ({
  actions,
  ouvert,
  surAction,
  surFermer,
}: {
  readonly actions: ReadonlyArray<ActionTache>;
  readonly ouvert: boolean;
  readonly surAction: (action: ActionMenu) => void;
  readonly surFermer: () => void;
}) => (
  <IonActionSheet
    isOpen={ouvert}
    header={LIBELLES_TACHES.menuActions}
    onDidDismiss={surFermer}
    buttons={[
      ...MENU_ORDRE.filter((action) => actions.includes(action)).map((action) => ({
        text: LIBELLES_TACHES.menu[action],
        ...(action === 'SUPPRIMER' ? { role: 'destructive' } : {}),
        handler: () => {
          surAction(action);
        },
      })),
      { text: LIBELLE_ANNULER, role: 'cancel' },
    ]}
  />
);

const BoutonEnregistrer = ({ surClic }: { readonly surClic: () => void }) => {
  const { garder, attributsAction } = useConsultationSeule();
  return (
    <button type="button" {...attributsAction} onClick={garder(surClic)}>
      {LIBELLES_TACHES.enregistrer}
    </button>
  );
};

/** Champ de saisie d'un éditeur : en lecture seule en consultation seule, la tentative de saisie affiche le toast. */
const ChampSaisie = ({
  nom,
  valeur,
  type,
  surChanger,
}: {
  readonly nom: string;
  readonly valeur: string;
  readonly type?: 'date';
  readonly surChanger: (valeur: string) => void;
}) => {
  const { attributsChamp } = useConsultationSeule();
  return (
    <input
      {...(type === undefined ? {} : { type })}
      aria-label={nom}
      {...attributsChamp}
      value={valeur}
      onChange={(e) => {
        surChanger(e.target.value);
      }}
    />
  );
};

const EditeurDelai = ({
  valeur,
  messages,
  surValider,
}: {
  readonly valeur: string;
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly surValider: (delai: DateCalendaire) => void;
}) => {
  const [texte, setTexte] = useState(valeur);
  const delai = DateCalendaire.depuisTexte(texte);
  return (
    <>
      <ChampSaisie
        type="date"
        nom={LIBELLES_TACHES.champDelai}
        valeur={texte}
        surChanger={setTexte}
      />
      <BoutonEnregistrer
        surClic={() => {
          if (delai.ok) surValider(delai.valeur);
        }}
      />
      <MessagesRefus messages={messages} />
    </>
  );
};

const EditeurIntitule = ({
  valeur,
  messages,
  surValider,
}: {
  readonly valeur: string;
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly surValider: (intitule: string) => void;
}) => {
  const [texte, setTexte] = useState(valeur);
  return (
    <>
      <ChampSaisie nom={LIBELLES_TACHES.renommage} valeur={texte} surChanger={setTexte} />
      <BoutonEnregistrer
        surClic={() => {
          surValider(texte);
        }}
      />
      <MessagesRefus messages={messages} />
    </>
  );
};

const EditeurEstimation = ({
  depart,
  messages,
  surValider,
}: {
  readonly depart: number;
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly surValider: (minutes: number) => void;
}) => {
  const [minutes, setMinutes] = useState<number | undefined>(depart);
  return (
    <>
      <SelecteurDuree
        nom={LIBELLES_TACHES.champEstimation}
        valeur={minutes}
        surChanger={setMinutes}
      />
      <BoutonEnregistrer
        surClic={() => {
          if (minutes !== undefined) surValider(minutes);
        }}
      />
      <MessagesRefus messages={messages} />
    </>
  );
};

const Barre = ({
  surRetour,
  surMenu,
  refMenu,
}: {
  readonly surRetour: () => void;
  readonly surMenu: () => void;
  readonly refMenu: RefObject<HTMLIonButtonElement | null>;
}) => {
  const { garder, attributsAction } = useConsultationSeule();
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={surRetour}>{LIBELLES_TACHES.retourListe}</IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton
            ref={refMenu}
            aria-label={LIBELLES_TACHES.menuActions}
            {...attributsAction}
            onClick={garder(surMenu)}
          >
            …
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

/** Éditeur ouvert et refus de sa dernière commande. */
type EtatEditeur = {
  readonly edition: Edition;
  readonly messages: ReadonlyArray<MessageRefus>;
  readonly editer: (edition: Edition) => void;
  /** Applique l'issue d'une commande : l'éditeur se ferme si elle est faite, sinon il reste ouvert sur le refus. */
  readonly appliquer: (issue: Promise<IssueTache>) => void;
};

const useEditeur = (): EtatEditeur => {
  const [edition, setEdition] = useState<Edition>(undefined);
  const [messages, setMessages] = useState<ReadonlyArray<MessageRefus>>([]);
  const editer = (cible: Edition): void => {
    setMessages([]);
    setEdition(cible);
  };
  const appliquer = (commande: Promise<IssueTache>): void => {
    void commande.then((issue) => {
      if (issue.type === 'FAITE') editer(undefined);
      else if (issue.type === 'REFUSEE') setMessages(issue.messages);
    });
  };
  return { edition, messages, editer, appliquer };
};

type ProprietesChamp = {
  readonly modele: ModeleVueDetailTache;
  readonly proprietes: ProprietesDetailTache;
  readonly editeur: EtatEditeur;
};

/** Le bouton « Modifier » n'existe que si le modèle de vue offre l'action (jamais désactivé : le champ est verrouillé). */
const editerSi = (
  modele: ModeleVueDetailTache,
  action: ActionTache,
  editer: (edition: Edition) => void,
  cible: Edition,
): (() => void) | undefined =>
  modele.actions.includes(action)
    ? () => {
        editer(cible);
      }
    : undefined;

const ChampDelai = ({ modele, proprietes, editeur }: ProprietesChamp) => (
  <ChampDetail
    nom={LIBELLES_TACHES.champDelai}
    valeur={modele.delai.libelle}
    enEdition={editeur.edition === 'DELAI'}
    surEditer={editerSi(modele, 'MODIFIER_DELAI', editeur.editer, 'DELAI')}
    editeur={
      <EditeurDelai
        valeur={modele.delai.date}
        messages={editeur.messages}
        surValider={(delai) => {
          editeur.appliquer(proprietes.surModifierDelai(delai));
        }}
      />
    }
  />
);

const ChampEstimation = ({ modele, proprietes, editeur }: ProprietesChamp) =>
  modele.estimation.verrou === undefined ? (
    <ChampDetail
      nom={LIBELLES_TACHES.champEstimation}
      valeur={modele.estimation.libelle}
      enEdition={editeur.edition === 'ESTIMATION'}
      surEditer={editerSi(modele, 'MODIFIER_ESTIMATION', editeur.editer, 'ESTIMATION')}
      editeur={
        <EditeurEstimation
          depart={modele.estimation.minutes}
          messages={editeur.messages}
          surValider={(minutes) => {
            editeur.appliquer(proprietes.surModifierEstimation(minutes));
          }}
        />
      }
    />
  ) : (
    <ChampVerrouille
      nom={LIBELLES_TACHES.champEstimation}
      valeur={modele.estimation.libelle}
      verrou={modele.estimation.verrou}
    />
  );

const ChampObjectifs = ({ modele, proprietes, editeur }: ProprietesChamp) => {
  const valeur = modele.objectifs.intitules.join(', ') || LIBELLES_TACHES.aucunObjectif;
  if (modele.objectifs.verrou !== undefined) {
    return (
      <ChampVerrouille
        nom={LIBELLES_TACHES.champObjectifs}
        valeur={valeur}
        verrou={modele.objectifs.verrou}
      />
    );
  }
  return (
    <ChampDetail
      nom={LIBELLES_TACHES.champObjectifs}
      valeur={valeur}
      enEdition={editeur.edition === 'OBJECTIFS'}
      surEditer={editerSi(modele, 'RATTACHER', editeur.editer, 'OBJECTIFS')}
      editeur={
        <PucesObjectif
          nom={LIBELLES_TACHES.champObjectifs}
          objectifs={proprietes.objectifs}
          selection={modele.objectifs.ids}
          surBasculer={proprietes.surBasculerObjectif}
        />
      }
    />
  );
};

/** « Terminée le … » ou « Abandonnée le … » avec sa mention de l'heure de Paris ; sinon l'état seul. */
const EtatEtDate = ({ modele }: { readonly modele: ModeleVueDetailTache }) => {
  const datee = modele.dateFin ?? modele.dateAbandon;
  return (
    <>
      <IonChip data-code={modele.etat.code}>
        {datee?.libelle ?? libelle(modele.etat.code, { date: '' }).trim()}
      </IonChip>
      {datee?.mentionHeureParis === undefined ? null : (
        <NoteHeureParis mention={datee.mentionHeureParis} />
      )}
    </>
  );
};

const EnTete = ({ modele }: { readonly modele: ModeleVueDetailTache }) => (
  <>
    <h1>{modele.intitule}</h1>
    <EtatEtDate modele={modele} />
    {modele.enRetard === undefined ? null : (
      <strong data-code={modele.enRetard.code}>{modele.enRetard.libelle}</strong>
    )}
    {modele.libelleTacheParente === undefined ? null : (
      <p className="tache-parente">{modele.libelleTacheParente}</p>
    )}
    {modele.delai.alertes.map((alerte) => (
      <IonNote key={alerte.code} color="warning" role="status" data-code={alerte.code}>
        {alerte.libelle}
      </IonNote>
    ))}
  </>
);

/** La commande de l'écran derrière l'action principale de la carte d'incohérence (absente : l'écran ne la sait pas faire). */
const commandePrincipale = (
  proprietes: ProprietesDetailTache,
  action: ActionPrincipaleCarte,
): (() => Promise<IssueSaisie>) | undefined => {
  const commandes: Readonly<Record<ActionPrincipaleCarte, ProprietesDetailTache['surRouvrir']>> = {
    ROUVRIR: proprietes.surRouvrir,
    REPRENDRE: proprietes.surReprendre,
  };
  return commandes[action];
};

const carteRendue = (modele: ModeleVueDetailTache, proprietes: ProprietesDetailTache): boolean =>
  modele.incoherence !== undefined &&
  commandePrincipale(proprietes, modele.incoherence.actionPrincipale.action) !== undefined;

/** Carte d'incohérence en tête (ECR-007 H) ; elle remplace l'action de fin du bas du détail (une seule action principale). */
const CarteEnTete = ({ modele, proprietes }: Omit<ProprietesChamp, 'editeur'>) => {
  const { incoherence } = modele;
  const surActionPrincipale =
    incoherence === undefined
      ? undefined
      : commandePrincipale(proprietes, incoherence.actionPrincipale.action);
  return incoherence === undefined || surActionPrincipale === undefined ? null : (
    <CarteIncoherence
      incoherence={incoherence}
      surActionPrincipale={surActionPrincipale}
      surTerminerSousTache={proprietes.surTerminerSousTache}
      surAbandonnerSousTache={proprietes.surAbandonnerSousTache}
    />
  );
};

/**
 * Réouverture d'une sous-tâche depuis sa case (ST-US-024 v0.7 §6.8) : confirmation distincte de celle de l'action de
 * fin ; le focus revient à la case activée, mémorisée depuis l'événement (la case garde son élément d'un état à l'autre).
 */
const useReouvertureSousTache = (
  surRouvrirSousTache: ProprietesDetailTache['surRouvrirSousTache'],
) => {
  const caseActivee = useRef<Focalisable | null>(null);
  const [refus, setRefus] = useState<ReadonlyArray<MessageRefus>>([]);
  const commande = useCommandeConfirmee(caseActivee, (issue) => {
    setRefus(messagesDeIssue(issue));
  });
  const rouvrir =
    surRouvrirSousTache === undefined
      ? undefined
      : (id: IdTache): void => {
          setRefus([]);
          void commande.lancer(() => surRouvrirSousTache(id));
        };
  const memoriserCase = (caseDeLaLigne: Focalisable): void => {
    caseActivee.current = caseDeLaLigne;
  };
  return { commande, refus, rouvrir, memoriserCase };
};

const AjouterSousTache = ({ surClic }: { readonly surClic: () => void }) => {
  const { garder, attributsAction } = useConsultationSeule();
  return (
    <button type="button" {...attributsAction} onClick={garder(surClic)}>
      {LIBELLES_TACHES.ajouterSousTache}
    </button>
  );
};

const SousTaches = ({ modele, proprietes }: Omit<ProprietesChamp, 'editeur'>) => {
  const reouverture = useReouvertureSousTache(proprietes.surRouvrirSousTache);
  return (
    <>
      {modele.sousTaches === undefined ? null : (
        <SectionSousTaches
          section={modele.sousTaches}
          surOuvrir={proprietes.surOuvrirSousTache}
          surTerminer={proprietes.surTerminerSousTache}
          surRouvrir={reouverture.rouvrir}
          surCaseRouvrirActivee={reouverture.memoriserCase}
        />
      )}
      <MessagesRefus messages={reouverture.refus} />
      <ConfirmationCommande commande={reouverture.commande} />
      {modele.actions.includes('CREER_SOUS_TACHE') ? (
        <AjouterSousTache surClic={proprietes.surAjouterSousTache} />
      ) : null}
      {carteRendue(modele, proprietes) ? null : (
        <ActionFin
          modele={modele}
          surTerminer={proprietes.surTerminer}
          surRouvrir={proprietes.surRouvrir}
          surReprendre={proprietes.surReprendre}
        />
      )}
    </>
  );
};

const CorpsDetail = ({ modele, proprietes, editeur }: ProprietesChamp) => (
  <IonContent>
    <EnTete modele={modele} />
    <CarteEnTete modele={modele} proprietes={proprietes} />
    {editeur.edition === 'INTITULE' ? (
      <EditeurIntitule
        valeur={modele.intitule}
        messages={editeur.messages}
        surValider={(intitule) => {
          editeur.appliquer(proprietes.surRenommer(intitule));
        }}
      />
    ) : null}
    <ChampDelai modele={modele} proprietes={proprietes} editeur={editeur} />
    <ChampEstimation modele={modele} proprietes={proprietes} editeur={editeur} />
    <ChampObjectifs modele={modele} proprietes={proprietes} editeur={editeur} />
    <SousTaches modele={modele} proprietes={proprietes} />
  </IonContent>
);

/** Abandon depuis le menu « … » : boîte de confirmation, focus rendu au menu, refus affichés (ECR-007 C, D, D2). */
const useAbandon = (surAbandonner: ProprietesDetailTache['surAbandonner']) => {
  const refMenu = useRef<HTMLIonButtonElement>(null);
  const [refus, setRefus] = useState<ReadonlyArray<MessageRefus>>([]);
  const commande = useCommandeConfirmee(refMenu, (issue) => {
    setRefus(messagesDeIssue(issue));
  });
  return {
    refMenu,
    refus,
    commande,
    demander: () => {
      setRefus([]);
      void commande.lancer(surAbandonner);
    },
  };
};

/**
 * Ouverture du menu « … » ; l'action choisie s'exécute à la fermeture de la feuille : Ionic rend alors le focus au
 * bouton « … », et une boîte ouverte plus tôt perdrait celui de « Annuler » (guide §6.6.7).
 */
const useMenuDetail = (
  proprietes: ProprietesDetailTache,
  editeur: EtatEditeur,
  abandon: ReturnType<typeof useAbandon>,
) => {
  const [ouvert, setOuvert] = useState(false);
  const choix = useRef<ActionMenu | undefined>(undefined);
  const gestes: Readonly<Record<ActionMenu, () => void>> = {
    SUPPRIMER: proprietes.surSupprimer,
    ABANDONNER: abandon.demander,
    RENOMMER: () => {
      editeur.editer('INTITULE');
    },
  };
  return {
    ouvert,
    ouvrir: () => {
      setOuvert(true);
    },
    fermer: () => {
      setOuvert(false);
      const action = choix.current;
      choix.current = undefined;
      if (action !== undefined) gestes[action]();
    },
    choisir: (action: ActionMenu) => {
      choix.current = action;
    },
  };
};

export const DetailTache = (proprietes: ProprietesDetailTache) => {
  const editeur = useEditeur();
  const abandon = useAbandon(proprietes.surAbandonner);
  const menu = useMenuDetail(proprietes, editeur, abandon);
  return (
    <>
      <Barre surRetour={proprietes.surRetour} surMenu={menu.ouvrir} refMenu={abandon.refMenu} />
      <CorpsDetail modele={proprietes.modele} proprietes={proprietes} editeur={editeur} />
      <MessagesRefus messages={abandon.refus} />
      <ConfirmationCommande commande={abandon.commande} />
      <Menu
        actions={proprietes.modele.actions}
        ouvert={menu.ouvert}
        surFermer={menu.fermer}
        surAction={menu.choisir}
      />
    </>
  );
};
