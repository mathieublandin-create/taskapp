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
import { assertNever } from '../../../../commun/domaine/assert-never';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import type { ActionTache } from '../../../domaine/types-actions';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { ActionFin } from '../composants/action-fin';
import { ChampDetail, ChampVerrouille } from '../composants/champ-detail';
import { ConfirmationCommande, useCommandeConfirmee } from '../composants/commande-confirmee';
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

const BoutonEnregistrer = ({ surClic }: { readonly surClic: () => void }) => (
  <button type="button" onClick={surClic}>
    {LIBELLES_TACHES.enregistrer}
  </button>
);

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
      <input
        type="date"
        aria-label={LIBELLES_TACHES.champDelai}
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
        }}
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
      <input
        aria-label={LIBELLES_TACHES.renommage}
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
        }}
      />
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
}) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton onClick={surRetour}>{LIBELLES_TACHES.retourListe}</IonButton>
      </IonButtons>
      <IonButtons slot="end">
        <IonButton ref={refMenu} aria-label={LIBELLES_TACHES.menuActions} onClick={surMenu}>
          …
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

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

const SousTaches = ({ modele, proprietes }: Omit<ProprietesChamp, 'editeur'>) => (
  <>
    {modele.sousTaches === undefined ? null : (
      <SectionSousTaches
        section={modele.sousTaches}
        surOuvrir={proprietes.surOuvrirSousTache}
        surTerminer={proprietes.surTerminerSousTache}
      />
    )}
    {modele.actions.includes('CREER_SOUS_TACHE') ? (
      <button type="button" onClick={proprietes.surAjouterSousTache}>
        {LIBELLES_TACHES.ajouterSousTache}
      </button>
    ) : null}
    <ActionFin
      modele={modele}
      surTerminer={proprietes.surTerminer}
      surRouvrir={proprietes.surRouvrir}
      surReprendre={proprietes.surReprendre}
    />
  </>
);

const CorpsDetail = ({ modele, proprietes, editeur }: ProprietesChamp) => (
  <IonContent>
    <EnTete modele={modele} />
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

type GestesMenu = {
  readonly supprimer: () => void;
  readonly abandonner: () => void;
  readonly renommer: () => void;
};

const executerActionMenu = (action: ActionMenu, gestes: GestesMenu): void => {
  switch (action) {
    case 'SUPPRIMER':
      gestes.supprimer();
      break;
    case 'ABANDONNER':
      gestes.abandonner();
      break;
    case 'RENOMMER':
      gestes.renommer();
      break;
    default:
      assertNever(action);
  }
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
  const gestes: GestesMenu = {
    supprimer: proprietes.surSupprimer,
    abandonner: abandon.demander,
    renommer: () => {
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
      if (action !== undefined) executerActionMenu(action, gestes);
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
