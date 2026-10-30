import { IonChip } from '@ionic/react';
import type { LigneObjectif } from '../../modeles-de-vue/ligne-objectif';
import { ProgressionObjectif } from './progression-objectif';

// ObjectiveRow (ECR-008 A) : anneau, intitulé, état en toutes lettres, compteur, délai ou « Sans délai », « En
// retard » (jamais la couleur seule). Tout le nom accessible de l'objectif est porté par le bouton de la ligne ;
// un sous-objectif est en retrait sous son parent (RG-022).
export type ProprietesLigneObjectif = {
  readonly ligne: LigneObjectif;
  readonly surOuvrir: (ligne: LigneObjectif) => void;
};

const MetaLigne = ({ ligne }: { readonly ligne: LigneObjectif }) => (
  <span className="ligne-objectif-meta">
    <IonChip data-code={ligne.etat.code}>{ligne.etat.libelle}</IonChip>
    <span data-code={ligne.compteur.code}>{ligne.compteur.libelle}</span>
    <span>{ligne.delai.libelle}</span>
    {ligne.enRetard === undefined ? null : (
      <strong data-code={ligne.enRetard.code}>{ligne.enRetard.libelle}</strong>
    )}
  </span>
);

/** Point « modification en attente d'envoi » (guide §6.6.4) : sans texte visible, décrit au bouton de la ligne. */
const PointAttente = ({
  attente,
  id,
}: {
  readonly attente: NonNullable<LigneObjectif['attente']>;
  readonly id: string;
}) => (
  <>
    <span className="point-attente" data-code={attente.code} aria-hidden="true" />
    <span id={id} hidden>
      {attente.nomAccessible}
    </span>
  </>
);

export const LigneObjectifUi = ({ ligne, surOuvrir }: ProprietesLigneObjectif) => {
  const idAttente = `attente-${ligne.id}`;
  return (
    <li className="ligne-objectif" data-niveau={ligne.niveau}>
      <button
        type="button"
        aria-label={ligne.nomAccessible}
        {...(ligne.attente === undefined ? {} : { 'aria-describedby': idAttente })}
        data-etat={ligne.etat.code}
        onClick={() => {
          surOuvrir(ligne);
        }}
      >
        <ProgressionObjectif
          progression={ligne.progression}
          atteint={ligne.etat.code === 'ETA-OBJ-ATTEINT'}
          petit={ligne.niveau === 'SOUS_OBJECTIF'}
        />
        <span className="ligne-objectif-texte" aria-hidden="true">
          <span className="ligne-objectif-intitule">{ligne.intitule}</span>
          <MetaLigne ligne={ligne} />
          {ligne.alerteDelai === undefined ? null : (
            <span data-code={ligne.alerteDelai.code}>{ligne.alerteDelai.libelle}</span>
          )}
        </span>
        {ligne.attente === undefined ? null : (
          <PointAttente attente={ligne.attente} id={idAttente} />
        )}
      </button>
    </li>
  );
};
