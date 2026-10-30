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
import { useState } from 'react';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import { LIBELLE_ANNULER } from '../../../../commun/presentation/ui/boite-confirmation';
import type { ActionTache } from '../../../domaine/types-actions';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import { ChampDetail, ChampVerrouille } from '../composants/champ-detail';
import { PucesObjectif } from '../composants/puces-objectif';
import { SelecteurDuree } from '../composants/selecteur-duree';
import type { ObjectifProposable } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';

// Écran ECR-007 (B, C, E) : intitulé, état, alertes de délai, champs modifiables (délai, estimation, objectifs) ou
// verrouillés (estimation calculée d'une tâche parente, objectifs hérités d'une sous-tâche), menu « … ».
export type ProprietesDetailTache = {
  readonly modele: ModeleVueDetailTache;
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  /** Objectifs actuels de la tâche (identifiants), pour les puces de rattachement. */
  readonly rattaches: ReadonlyArray<IdObjectif>;
  readonly surRetour: () => void;
  readonly surRenommer: (intitule: string) => void;
  readonly surModifierDelai: (delai: DateCalendaire) => void;
  readonly surModifierEstimation: (minutes: number) => void;
  readonly surBasculerObjectif: (id: IdObjectif) => void;
  readonly surSupprimer: () => void;
};

type Edition = 'DELAI' | 'ESTIMATION' | 'OBJECTIFS' | 'INTITULE' | undefined;

const MENU_ORDRE: ReadonlyArray<Extract<ActionTache, 'RENOMMER' | 'SUPPRIMER'>> = [
  'RENOMMER',
  'SUPPRIMER',
];

const Menu = ({
  actions,
  ouvert,
  surAction,
  surFermer,
}: {
  readonly actions: ReadonlyArray<ActionTache>;
  readonly ouvert: boolean;
  readonly surAction: (action: 'RENOMMER' | 'SUPPRIMER') => void;
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

const EditeurDelai = ({
  valeur,
  surValider,
}: {
  readonly valeur: string;
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
      <button
        type="button"
        onClick={() => {
          if (delai.ok) surValider(delai.valeur);
        }}
      >
        {LIBELLES_TACHES.enregistrer}
      </button>
    </>
  );
};

const EditeurIntitule = ({
  valeur,
  surValider,
}: {
  readonly valeur: string;
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
      <button
        type="button"
        onClick={() => {
          surValider(texte);
        }}
      >
        {LIBELLES_TACHES.enregistrer}
      </button>
    </>
  );
};

const EditeurEstimation = ({
  depart,
  surValider,
}: {
  readonly depart: number;
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
      <button
        type="button"
        onClick={() => {
          if (minutes !== undefined) surValider(minutes);
        }}
      >
        {LIBELLES_TACHES.enregistrer}
      </button>
    </>
  );
};

const Barre = ({
  surRetour,
  surMenu,
}: {
  readonly surRetour: () => void;
  readonly surMenu: () => void;
}) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton onClick={surRetour}>{LIBELLES_TACHES.retourListe}</IonButton>
      </IonButtons>
      <IonButtons slot="end">
        <IonButton aria-label={LIBELLES_TACHES.menuActions} onClick={surMenu}>
          …
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

type ProprietesChamp = {
  readonly modele: ModeleVueDetailTache;
  readonly edition: Edition;
  readonly proprietes: ProprietesDetailTache;
  readonly editer: (edition: Edition) => void;
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

const ChampDelai = ({ modele, edition, proprietes, editer }: ProprietesChamp) => (
  <ChampDetail
    nom={LIBELLES_TACHES.champDelai}
    valeur={modele.delai.libelle}
    enEdition={edition === 'DELAI'}
    surEditer={editerSi(modele, 'MODIFIER_DELAI', editer, 'DELAI')}
    editeur={
      <EditeurDelai
        valeur={modele.delai.date}
        surValider={(delai) => {
          proprietes.surModifierDelai(delai);
          editer(undefined);
        }}
      />
    }
  />
);

const ChampEstimation = ({ modele, edition, proprietes, editer }: ProprietesChamp) =>
  modele.estimation.verrou === undefined ? (
    <ChampDetail
      nom={LIBELLES_TACHES.champEstimation}
      valeur={modele.estimation.libelle}
      enEdition={edition === 'ESTIMATION'}
      surEditer={editerSi(modele, 'MODIFIER_ESTIMATION', editer, 'ESTIMATION')}
      editeur={
        <EditeurEstimation
          depart={modele.estimation.minutes}
          surValider={(minutes) => {
            proprietes.surModifierEstimation(minutes);
            editer(undefined);
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

const ChampObjectifs = ({ modele, edition, proprietes, editer }: ProprietesChamp) => {
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
      enEdition={edition === 'OBJECTIFS'}
      surEditer={editerSi(modele, 'RATTACHER', editer, 'OBJECTIFS')}
      editeur={
        <PucesObjectif
          nom={LIBELLES_TACHES.champObjectifs}
          objectifs={proprietes.objectifs}
          selection={proprietes.rattaches}
          surBasculer={proprietes.surBasculerObjectif}
        />
      }
    />
  );
};

const EnTete = ({ modele }: { readonly modele: ModeleVueDetailTache }) => (
  <>
    <h1>{modele.intitule}</h1>
    <IonChip data-code={modele.etat.code}>{libelle(modele.etat.code, { date: '' }).trim()}</IonChip>
    {modele.enRetard === undefined ? null : (
      <strong data-code={modele.enRetard.code}>{modele.enRetard.libelle}</strong>
    )}
    {modele.delai.alertes.map((alerte) => (
      <IonNote key={alerte.code} color="warning" role="status" data-code={alerte.code}>
        {alerte.libelle}
      </IonNote>
    ))}
  </>
);

const CorpsDetail = ({
  proprietes,
  edition,
  editer,
}: {
  readonly proprietes: ProprietesDetailTache;
  readonly edition: Edition;
  readonly editer: (edition: Edition) => void;
}) => {
  const { modele } = proprietes;
  const champ = { modele, edition, proprietes, editer };
  return (
    <IonContent>
      <EnTete modele={modele} />
      {edition === 'INTITULE' ? (
        <EditeurIntitule
          valeur={modele.intitule}
          surValider={(intitule) => {
            proprietes.surRenommer(intitule);
            editer(undefined);
          }}
        />
      ) : null}
      <ChampDelai {...champ} />
      <ChampEstimation {...champ} />
      <ChampObjectifs {...champ} />
    </IonContent>
  );
};

export const DetailTache = (proprietes: ProprietesDetailTache) => {
  const [edition, setEdition] = useState<Edition>(undefined);
  const [menuOuvert, setMenuOuvert] = useState(false);
  return (
    <>
      <Barre
        surRetour={proprietes.surRetour}
        surMenu={() => {
          setMenuOuvert(true);
        }}
      />
      <CorpsDetail proprietes={proprietes} edition={edition} editer={setEdition} />
      <Menu
        actions={proprietes.modele.actions}
        ouvert={menuOuvert}
        surFermer={() => {
          setMenuOuvert(false);
        }}
        surAction={(action) => {
          if (action === 'SUPPRIMER') proprietes.surSupprimer();
          else setEdition('INTITULE');
        }}
      />
    </>
  );
};
