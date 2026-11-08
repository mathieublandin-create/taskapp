import { useId } from 'react';
import type { IdTache } from '../../../../commun/domaine/identifiants';
import { useConsultationSeule } from '../../../../commun/presentation/ui/consultation-seule';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';

// Section « Sous-tâches » du détail d'une tâche (ECR-007 A, guide v0.2.9 §5.8 e) : une seule liste, tous états, dans
// l'ordre du modèle de vue ; une sous-tâche terminée ou abandonnée garde sa place. La case « Terminer » n'est active que
// si l'écran sait terminer une tâche (`surTerminer`) ; sans cela elle est affichée désactivée, jamais cliquable sans effet.
type SectionSousTaches = NonNullable<ModeleVueDetailTache['sousTaches']>;
type LigneSousTache = SectionSousTaches['lignes'][number];

export type ProprietesSectionSousTaches = {
  readonly section: SectionSousTaches;
  readonly surOuvrir: (id: IdTache) => void;
  readonly surTerminer?: ((id: IdTache) => void) | undefined;
  /** ST-US-024 v0.7 §4.5 (DT-030, rang 11) : case pleine « Rouvrir » d'une sous-tâche terminée ; absente : case désactivée. */
  readonly surRouvrir?: ((id: IdTache) => void) | undefined;
};

const MetaLigne = ({ ligne }: { readonly ligne: LigneSousTache }) => (
  <span className="ligne-tache-meta" aria-hidden="true">
    <span>{ligne.delai.libelle}</span>
    <span>{ligne.estimation.libelle}</span>
    {ligne.enRetard === undefined ? null : (
      <strong data-code={ligne.enRetard.code}>{ligne.enRetard.libelle}</strong>
    )}
    {ligne.alertes.map((alerte) => (
      <span key={alerte.code} data-code={alerte.code}>
        {alerte.libelle}
      </span>
    ))}
  </span>
);

const CaseTerminer = ({
  ligne,
  surTerminer,
  surRouvrir,
}: {
  readonly ligne: LigneSousTache;
  readonly surTerminer: ProprietesSectionSousTaches['surTerminer'];
  readonly surRouvrir: ProprietesSectionSousTaches['surRouvrir'];
}) => {
  const { garder, attributsAction } = useConsultationSeule();
  const { action, nomAccessible } = ligne.caseTerminer;
  if (action === undefined) return null;
  const rouvrir = action === 'ROUVRIR';
  const commande = rouvrir ? surRouvrir : surTerminer;
  return (
    <input
      type="checkbox"
      aria-label={nomAccessible}
      checked={rouvrir}
      disabled={commande === undefined}
      {...attributsAction}
      onChange={garder(() => {
        commande?.(ligne.id);
      })}
    />
  );
};

/** Étiquette d'une sous-tâche d'une tâche parente abandonnée (ECR-007 F) : lue avec la ligne, jamais la couleur seule. */
const Etiquette = ({
  etiquette,
  id,
}: {
  readonly etiquette: NonNullable<LigneSousTache['etiquette']>;
  readonly id: string;
}) => (
  <span id={id} className="ligne-tache-etiquette" data-code={etiquette.code}>
    {etiquette.libelle}
  </span>
);

const LigneSousTacheUi = ({
  ligne,
  surOuvrir,
  surTerminer,
  surRouvrir,
}: { readonly ligne: LigneSousTache } & Omit<ProprietesSectionSousTaches, 'section'>) => {
  const idEtiquette = `etiquette-${ligne.id}`;
  return (
    <li className="ligne-tache" data-niveau="SOUS_TACHE">
      <CaseTerminer ligne={ligne} surTerminer={surTerminer} surRouvrir={surRouvrir} />
      <button
        type="button"
        aria-label={ligne.nomAccessible}
        {...(ligne.etiquette === undefined ? {} : { 'aria-describedby': idEtiquette })}
        data-etat={ligne.etat.code}
        onClick={() => {
          surOuvrir(ligne.id);
        }}
      >
        <span className="ligne-tache-intitule" aria-hidden="true">
          {ligne.intitule}
        </span>
        <MetaLigne ligne={ligne} />
      </button>
      {ligne.etiquette === undefined ? null : (
        <Etiquette etiquette={ligne.etiquette} id={idEtiquette} />
      )}
    </li>
  );
};

export const SectionSousTaches = ({
  section,
  surOuvrir,
  surTerminer,
  surRouvrir,
}: ProprietesSectionSousTaches) => {
  const idTitre = useId();
  return (
    <section data-code={section.code} aria-labelledby={idTitre}>
      <h2 id={idTitre}>
        {section.libelle} <span data-compteur>{section.compteur.libelle}</span>
      </h2>
      <ul className="liste-taches">
        {section.lignes.map((ligne) => (
          <LigneSousTacheUi
            key={ligne.id}
            ligne={ligne}
            surOuvrir={surOuvrir}
            surTerminer={surTerminer}
            surRouvrir={surRouvrir}
          />
        ))}
      </ul>
    </section>
  );
};
