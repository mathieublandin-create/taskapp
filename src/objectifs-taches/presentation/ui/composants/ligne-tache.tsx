import type { IdTache } from '../../../../commun/domaine/identifiants';
import type { LigneTache } from '../../modeles-de-vue/ligne-tache';

// TaskRow (guide §4.2) : intitulé, métadonnées (délai, estimation, objectifs, sous-tâches) et mentions « en retard » et
// « après le délai de l'objectif » en toutes lettres (jamais la couleur seule). Le nom accessible complet de la tâche
// est porté par le bouton de la ligne ; une sous-tâche est en retrait sous sa tâche parente.
export type ProprietesLigneTache = {
  readonly ligne: LigneTache;
  readonly niveau?: 'TACHE' | 'SOUS_TACHE';
  readonly surOuvrir: (ligne: LigneTache) => void;
  /** Sans cette propriété, la case « Terminer » n'est pas affichée (écran qui ne sait pas terminer). */
  readonly surTerminer?: ((id: IdTache) => void) | undefined;
  /** Tâche tout juste terminée, dont la ligne reste affichée quelques secondes : case cochée et inactive. */
  readonly retenue?: boolean;
};

const MAX_PUCES_OBJECTIF = 1;

/** Objectifs : 1 puce, puis « +n » (guide §4.2). */
const PucesObjectifsLigne = ({ objectifs }: { readonly objectifs: ReadonlyArray<string> }) => {
  const [premier] = objectifs;
  const autres = objectifs.length - MAX_PUCES_OBJECTIF;
  return premier === undefined ? null : (
    <span className="ligne-tache-objectifs">
      {premier}
      {autres > 0 ? ` +${String(autres)}` : ''}
    </span>
  );
};

const MetaLigne = ({ ligne }: { readonly ligne: LigneTache }) => (
  <span className="ligne-tache-meta">
    <span>{ligne.delai.libelle}</span>
    <span data-calculee={ligne.estimation.calculee}>{ligne.estimation.libelle}</span>
    <PucesObjectifsLigne objectifs={ligne.objectifs} />
    {ligne.compteurSousTaches === undefined ? null : (
      <span>{ligne.compteurSousTaches.libelle}</span>
    )}
    {ligne.enRetard === undefined ? null : (
      <strong data-code={ligne.enRetard.code}>{ligne.enRetard.libelle}</strong>
    )}
  </span>
);

const Alertes = ({ alertes }: { readonly alertes: LigneTache['alertes'] }) =>
  alertes.map((alerte) => (
    <span key={alerte.code} data-code={alerte.code}>
      {alerte.libelle}
    </span>
  ));

/** Point « modification en attente d'envoi » (guide §6.6.4) : sans texte visible, décrit au bouton de la ligne. */
const PointAttente = ({
  attente,
  id,
}: {
  readonly attente: NonNullable<LigneTache['attente']>;
  readonly id: string;
}) => (
  <>
    <span className="point-attente" data-code={attente.code} aria-hidden="true" />
    <span id={id} hidden>
      {attente.nomAccessible}
    </span>
  </>
);

const CaseTerminerLigne = ({
  ligne,
  retenue,
  surTerminer,
}: {
  readonly ligne: LigneTache;
  readonly retenue: boolean;
  readonly surTerminer: ProprietesLigneTache['surTerminer'];
}) =>
  ligne.caseTerminer === undefined || surTerminer === undefined ? null : (
    <input
      type="checkbox"
      aria-label={ligne.caseTerminer.nomAccessible}
      checked={retenue}
      disabled={retenue}
      onChange={() => {
        surTerminer(ligne.id);
      }}
    />
  );

/** Tâche abandonnée (guide §4.2) : cercle barré décoratif, l'état est dit par le nom accessible de la ligne. */
const IconeAbandonnee = () => (
  <svg
    className="icone-abandonnee"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CODE_ETAT_ABANDONNEE: LigneTache['etat']['code'] = 'ETA-TACHE-ABANDONNEE';

const BoutonLigne = ({ ligne, surOuvrir }: Pick<ProprietesLigneTache, 'ligne' | 'surOuvrir'>) => {
  const idAttente = `attente-${ligne.id}`;
  return (
    <button
      type="button"
      aria-label={ligne.nomAccessible}
      {...(ligne.attente === undefined ? {} : { 'aria-describedby': idAttente })}
      data-etat={ligne.etat.code}
      onClick={() => {
        surOuvrir(ligne);
      }}
    >
      <span className="ligne-tache-texte" aria-hidden="true">
        {ligne.etat.code === CODE_ETAT_ABANDONNEE ? <IconeAbandonnee /> : null}
        <span className="ligne-tache-intitule">{ligne.intitule}</span>
        <MetaLigne ligne={ligne} />
        <Alertes alertes={ligne.alertes} />
      </span>
      {ligne.attente === undefined ? null : <PointAttente attente={ligne.attente} id={idAttente} />}
    </button>
  );
};

export const LigneTacheUi = ({
  ligne,
  niveau = 'TACHE',
  surOuvrir,
  surTerminer,
  retenue = false,
}: ProprietesLigneTache) => (
  <li className="ligne-tache" data-niveau={niveau}>
    <CaseTerminerLigne ligne={ligne} retenue={retenue} surTerminer={surTerminer} />
    <BoutonLigne ligne={ligne} surOuvrir={surOuvrir} />
  </li>
);
