import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import type { IdObjectif } from '../../../../commun/domaine/identifiants';
import { useConsultationSeule } from '../../../../commun/presentation/ui/consultation-seule';
import { BoutonFlottant } from '../../../../commun/presentation/ui/bouton-flottant';
import { EtatVide } from '../../../../commun/presentation/ui/etat-vide';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import type { LigneObjectif } from '../../modeles-de-vue/ligne-objectif';
import type { ModeleVueListeObjectifs } from '../../modeles-de-vue/liste-objectifs';
import { LigneObjectifUi } from '../composants/ligne-objectif';
import { LIBELLES_OBJECTIFS } from '../libelles-ui';

// Écran ECR-008 (cadres A, E) : objectifs principaux non atteints et leurs sous-objectifs, puis la section repliée
// des atteints (guide §5.8). Action principale : créer un objectif (« + », Maj + N sur PC).
export type ProprietesListeObjectifs = {
  readonly modele: ModeleVueListeObjectifs;
  readonly surCreer: () => void;
  readonly surOuvrir: (id: IdObjectif) => void;
};

const estSaisieDeTexte = (cible: EventTarget | null): boolean =>
  cible instanceof HTMLElement &&
  (cible.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName));

const estRaccourciCreation = (evenement: globalThis.KeyboardEvent): boolean =>
  evenement.shiftKey &&
  !(evenement.ctrlKey || evenement.metaKey || evenement.altKey) &&
  evenement.key.toLowerCase() === 'n' &&
  !estSaisieDeTexte(evenement.target);

/** Maj + N crée un objectif, sauf pendant une saisie de texte. */
const useRaccourciCreation = (surCreer: (() => void) | undefined): void => {
  useEffect(() => {
    if (surCreer === undefined) return undefined;
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

const Lignes = ({
  lignes,
  surOuvrir,
}: {
  readonly lignes: ReadonlyArray<LigneObjectif>;
  readonly surOuvrir: (id: IdObjectif) => void;
}) => (
  <ul className="liste-objectifs">
    {lignes.map((ligne) => (
      <LigneObjectifUi
        key={ligne.id}
        ligne={ligne}
        surOuvrir={(l) => {
          surOuvrir(l.id);
        }}
      />
    ))}
  </ul>
);

/** Disclosure repliée par défaut : la liste reste centrée sur ce qui reste à faire. */
const SectionAtteints = ({
  section,
  surOuvrir,
}: {
  readonly section: NonNullable<ModeleVueListeObjectifs['sectionAtteints']>;
  readonly surOuvrir: (id: IdObjectif) => void;
}) => {
  const [deplie, setDeplie] = useState(!section.replieeParDefaut);
  return (
    <section className="objectifs-atteints" data-code={section.code}>
      <button
        type="button"
        aria-expanded={deplie}
        onClick={() => {
          setDeplie(!deplie);
        }}
      >
        {section.libelle}
      </button>
      {deplie ? <Lignes lignes={section.lignes} surOuvrir={surOuvrir} /> : null}
    </section>
  );
};

const EnTeteListe = () => (
  <IonHeader>
    <IonToolbar>
      <IonTitle>{LIBELLES_OBJECTIFS.titreListe}</IonTitle>
    </IonToolbar>
  </IonHeader>
);

export const ListeObjectifs = ({ modele, surCreer, surOuvrir }: ProprietesListeObjectifs) => {
  // En consultation seule (RG-058), ni « + », ni état vide actionnable, ni raccourci : la création disparaît.
  const { actif } = useConsultationSeule();
  const creation = actif ? undefined : surCreer;
  useRaccourciCreation(creation);
  const { etatVide, sectionAtteints, mentionHeureParis } = modele;
  return (
    <>
      <EnTeteListe />
      <IonContent>
        {mentionHeureParis === undefined ? null : <NoteHeureParis mention={mentionHeureParis} />}
        {etatVide === undefined ? null : (
          <EtatVide
            code={etatVide.code}
            {...(creation === undefined ? {} : { surAction: creation })}
          />
        )}
        {modele.lignes.length === 0 ? null : (
          <Lignes lignes={modele.lignes} surOuvrir={surOuvrir} />
        )}
        {sectionAtteints === undefined ? null : (
          <SectionAtteints section={sectionAtteints} surOuvrir={surOuvrir} />
        )}
        {creation === undefined ? null : (
          <BoutonFlottant libelle={LIBELLES_OBJECTIFS.creerObjectif} surClic={creation} />
        )}
      </IonContent>
    </>
  );
};
