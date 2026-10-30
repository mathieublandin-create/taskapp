import { IonContent, IonFab, IonFabButton, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect } from 'react';
import type { IdTache } from '../../../../commun/domaine/identifiants';
import { EtatVide } from '../../../../commun/presentation/ui/etat-vide';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import type {
  FiltreEtat,
  FiltreObjectif,
  ModeleVueListeTaches,
} from '../../modeles-de-vue/liste-taches';
import { FiltreEtatUi, FiltreObjectifUi } from '../composants/filtre-etat';
import { LigneTacheUi } from '../composants/ligne-tache';
import type { ObjectifProposable } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';

// Écran ECR-002 (L1, L3 à L5) : liste « Tâches », filtre d'état (« À faire » à chaque ouverture), filtre d'objectif,
// tri annoncé (MEN-TRI-DELAI), états vides. Les sous-tâches n'y sont jamais des lignes (guide §5.7).
export type ProprietesListeTaches = {
  readonly modele: ModeleVueListeTaches;
  readonly objectifs: ReadonlyArray<ObjectifProposable>;
  readonly surCreer: () => void;
  readonly surOuvrir: (id: IdTache) => void;
  readonly surFiltrerEtat: (etat: FiltreEtat) => void;
  readonly surFiltrerObjectif: (filtre: FiltreObjectif) => void;
};

const estSaisieDeTexte = (cible: EventTarget | null): boolean =>
  cible instanceof HTMLElement &&
  (cible.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName));

const estRaccourciCreation = (evenement: globalThis.KeyboardEvent): boolean =>
  !(evenement.ctrlKey || evenement.metaKey || evenement.altKey || evenement.shiftKey) &&
  evenement.key.toLowerCase() === 'n' &&
  !estSaisieDeTexte(evenement.target);

/** La touche N ouvre la saisie rapide (guide §5.3), sauf pendant une saisie de texte. */
const useRaccourciCreation = (surCreer: () => void): void => {
  useEffect(() => {
    const surTouche = (evenement: globalThis.KeyboardEvent): void => {
      if (!estRaccourciCreation(evenement)) return;
      evenement.preventDefault();
      surCreer();
    };
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('keydown', surTouche);
    };
  }, [surCreer]);
};

const Filtres = ({
  modele,
  objectifs,
  surFiltrerEtat,
  surFiltrerObjectif,
}: Pick<
  ProprietesListeTaches,
  'modele' | 'objectifs' | 'surFiltrerEtat' | 'surFiltrerObjectif'
>) => (
  <>
    <FiltreEtatUi etat={modele.filtreEtat} surChoisir={surFiltrerEtat} />
    <FiltreObjectifUi
      filtre={modele.filtreObjectif}
      objectifs={objectifs}
      surChoisir={surFiltrerObjectif}
    />
    <p className="liste-taches-tri" data-code={modele.sousTitre.code}>
      {modele.sousTitre.libelle}
    </p>
  </>
);

const Lignes = ({
  lignes,
  surOuvrir,
}: {
  readonly lignes: ModeleVueListeTaches['lignes'];
  readonly surOuvrir: (id: IdTache) => void;
}) => (
  <ul className="liste-taches">
    {lignes.map((ligne) => (
      <LigneTacheUi
        key={ligne.id}
        ligne={ligne}
        surOuvrir={(l) => {
          surOuvrir(l.id);
        }}
      />
    ))}
  </ul>
);

export const ListeTaches = ({ modele, surCreer, surOuvrir, ...filtres }: ProprietesListeTaches) => {
  useRaccourciCreation(surCreer);
  const { etatVide, mentionHeureParis } = modele;
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{LIBELLES_TACHES.titreListe}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Filtres modele={modele} {...filtres} />
        {mentionHeureParis === undefined ? null : <NoteHeureParis mention={mentionHeureParis} />}
        {etatVide === undefined ? null : <EtatVide code={etatVide.code} surAction={surCreer} />}
        <Lignes lignes={modele.lignes} surOuvrir={surOuvrir} />
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton aria-label={LIBELLES_TACHES.ajouterTache} onClick={surCreer}>
            +
          </IonFabButton>
        </IonFab>
      </IonContent>
    </>
  );
};
