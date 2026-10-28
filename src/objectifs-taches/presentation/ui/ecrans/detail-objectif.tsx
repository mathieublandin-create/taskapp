import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonNote,
  IonToolbar,
} from '@ionic/react';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import { EtatVide } from '../../../../commun/presentation/ui/etat-vide';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import type { ModeleVueDetailObjectif } from '../../modeles-de-vue/detail-objectif';
import { LigneObjectifUi } from '../composants/ligne-objectif';
import { ProgressionObjectif } from '../composants/progression-objectif';
import { LIBELLES_OBJECTIFS } from '../libelles-ui';

// Écran ECR-003 (cadres C, D) : en-tête (état, niveau, progression, délai), description, sous-objectifs. Les sections
// de tâches arrivent avec US-002 (rang 5) ; sans tâche, l'état vide « À décliner en tâches » (CA-8).
export type ProprietesDetailObjectif = {
  readonly modele: ModeleVueDetailObjectif;
  readonly surRetour: () => void;
  readonly surOuvrirMenu: () => void;
  readonly surOuvrirSousObjectif: (id: IdObjectif) => void;
};

const ESPACE_INSECABLE = ' ';

const libelleNiveau = (niveau: ModeleVueDetailObjectif['niveau']): string =>
  niveau.type === 'PRINCIPAL'
    ? LIBELLES_OBJECTIFS.objectifPrincipal
    : LIBELLES_OBJECTIFS.sousObjectifDe.replace('{parent}', niveau.parent.intitule);

type ProprietesBarre = Pick<ProprietesDetailObjectif, 'surRetour' | 'surOuvrirMenu'>;

const BarreDetail = ({ surRetour, surOuvrirMenu }: ProprietesBarre) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton onClick={surRetour}>{LIBELLES_OBJECTIFS.retourListe}</IonButton>
      </IonButtons>
      <IonButtons slot="end">
        <IonButton aria-label={LIBELLES_OBJECTIFS.ouvrirMenu} onClick={surOuvrirMenu}>
          …
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

const MetaDetail = ({ modele }: { readonly modele: ModeleVueDetailObjectif }) => (
  <p className="detail-objectif-meta">
    <span data-code={modele.compteur.code}>{modele.compteur.libelle}</span>
    <span>{`${LIBELLES_OBJECTIFS.champDelai}${ESPACE_INSECABLE}: ${modele.delai.libelle}`}</span>
    {modele.enRetard === undefined ? null : (
      <strong data-code={modele.enRetard.code}>{modele.enRetard.libelle}</strong>
    )}
  </p>
);

const SousObjectifs = ({
  section,
  surOuvrir,
}: {
  readonly section: ModeleVueDetailObjectif['sousObjectifs'];
  readonly surOuvrir: (id: IdObjectif) => void;
}) => (
  <section data-code={section.code}>
    <h2>{section.libelle}</h2>
    <ul className="liste-objectifs">
      {section.lignes.map((ligne) => (
        <LigneObjectifUi
          key={ligne.id}
          ligne={ligne}
          surOuvrir={(l) => {
            surOuvrir(l.id);
          }}
        />
      ))}
    </ul>
  </section>
);

const EnTeteDetail = ({ modele }: { readonly modele: ModeleVueDetailObjectif }) => (
  <>
    <h1>{modele.intitule}</h1>
    {modele.mentionHeureParis === undefined ? null : (
      <NoteHeureParis mention={modele.mentionHeureParis} />
    )}
    <div className="detail-objectif-puces">
      <IonChip data-code={modele.etat.code}>{modele.etat.libelle}</IonChip>
      <IonChip>{libelleNiveau(modele.niveau)}</IonChip>
    </div>
    <ProgressionObjectif
      progression={modele.progression}
      atteint={modele.etat.code === 'ETA-OBJ-ATTEINT'}
      nomAccessible={modele.nomAccessible}
    />
    <MetaDetail modele={modele} />
  </>
);

export const DetailObjectif = ({
  modele,
  surOuvrirSousObjectif,
  ...barre
}: ProprietesDetailObjectif) => (
  <>
    <BarreDetail {...barre} />
    <IonContent>
      <EnTeteDetail modele={modele} />
      {modele.alerteDelai === undefined ? null : (
        <IonNote color="warning" role="status" data-code={modele.alerteDelai.code}>
          {modele.alerteDelai.libelle}
        </IonNote>
      )}
      {modele.description === undefined ? null : <p>{modele.description}</p>}
      {modele.sousObjectifs.lignes.length === 0 ? null : (
        <SousObjectifs section={modele.sousObjectifs} surOuvrir={surOuvrirSousObjectif} />
      )}
      {modele.etatVide === undefined ? null : <EtatVide code={modele.etatVide.code} />}
    </IonContent>
  </>
);
