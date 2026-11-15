import { useId, useRef, useState, type RefObject } from 'react';
import type { IdTache } from '../../../../commun/domaine/identifiants';
import { libelle } from '../../../../commun/presentation/messages/libelle';
import { useConsultationSeule } from '../../../../commun/presentation/ui/consultation-seule';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { messagesDeIssue } from '../etat/issues';
import type { IssueSaisie } from '../etat/magasin-taches';
import { ConfirmationCommande, useCommandeConfirmee } from './commande-confirmee';
import { MessagesRefus } from './messages-refus';

// Carte d'incohérence d'ECR-007 H (`InconsistencyCard`, RG-049 ; guide §4.23, §6.6.9 ; ST-US-024 §6.6, DT-026) : en tête
// du détail, de niveau « attention » (sans `role="alert"` : information présente à l'ouverture). Action principale
// (« Rouvrir » / « Reprendre la tâche »), puis, pour l'unique sous-tâche à faire, deux actions tertiaires. Aucune
// action sans geste ; la carte disparaît au recalcul du modèle, elle ne garde aucun état sur sa cause.
type Incoherence = NonNullable<ModeleVueDetailTache['incoherence']>;

export type ProprietesCarteIncoherence = {
  readonly incoherence: Incoherence;
  /** `surRouvrir` ou `surReprendre` de l'écran, selon `incoherence.actionPrincipale.action`. */
  readonly surActionPrincipale: () => Promise<IssueSaisie>;
  /** Absente : le bouton « Terminer la sous-tâche » n'est pas rendu. */
  readonly surTerminerSousTache?: ((id: IdTache) => void) | undefined;
  /** Absente : le bouton « Abandonner la sous-tâche » n'est pas rendu. */
  readonly surAbandonnerSousTache?: ((id: IdTache) => Promise<IssueSaisie>) | undefined;
};

/** Issue d'une commande de la carte : refus affichés sous les boutons, confirmation habituelle sinon. */
const useCommandeCarte = (retourFocus: RefObject<HTMLButtonElement | null>) => {
  const [refus, setRefus] = useState<ReadonlyArray<MessageRefus>>([]);
  const commande = useCommandeConfirmee(retourFocus, (issue) => {
    setRefus(messagesDeIssue(issue));
  });
  const lancer = (cible: () => Promise<IssueSaisie>): void => {
    setRefus([]);
    void commande.lancer(cible);
  };
  return { refus, commande, lancer };
};

const BoutonTertiaire = ({
  action,
  code,
  intitule,
  surClic,
}: {
  readonly action: 'TERMINER_SOUS_TACHE' | 'ABANDONNER_SOUS_TACHE';
  readonly code: 'TXT-TERMINER-SOUS-TACHE' | 'TXT-ABANDONNER-SOUS-TACHE';
  readonly intitule: string;
  readonly surClic: () => void;
}) => {
  const { garder, attributsAction } = useConsultationSeule();
  return (
    <button
      type="button"
      data-action={action}
      aria-label={libelle(code, { element: intitule }, 'nomAccessible')}
      {...attributsAction}
      onClick={garder(surClic)}
    >
      {libelle(code)}
    </button>
  );
};

const BoutonsTertiaires = ({
  sousTache,
  surTerminer,
  surAbandonner,
}: {
  readonly sousTache: NonNullable<Incoherence['sousTache']>;
  readonly surTerminer: ProprietesCarteIncoherence['surTerminerSousTache'];
  readonly surAbandonner: (() => void) | undefined;
}) => (
  <>
    {surTerminer === undefined ? null : (
      <BoutonTertiaire
        action="TERMINER_SOUS_TACHE"
        code="TXT-TERMINER-SOUS-TACHE"
        intitule={sousTache.intitule}
        surClic={() => {
          surTerminer(sousTache.id);
        }}
      />
    )}
    {surAbandonner === undefined ? null : (
      <BoutonTertiaire
        action="ABANDONNER_SOUS_TACHE"
        code="TXT-ABANDONNER-SOUS-TACHE"
        intitule={sousTache.intitule}
        surClic={surAbandonner}
      />
    )}
  </>
);

const BoutonPrincipal = ({
  reference,
  action,
  surClic,
}: {
  readonly reference: RefObject<HTMLButtonElement | null>;
  readonly action: Incoherence['actionPrincipale'];
  readonly surClic: () => void;
}) => {
  const { garder, attributsAction } = useConsultationSeule();
  return (
    <button
      ref={reference}
      type="button"
      data-action={action.action}
      {...attributsAction}
      onClick={garder(surClic)}
    >
      {action.libelle}
    </button>
  );
};

const EnTeteCarte = ({
  incoherence,
  idTitre,
}: {
  readonly incoherence: Incoherence;
  readonly idTitre: string;
}) => (
  <>
    <h2 id={idTitre}>{incoherence.libelle}</h2>
    <p>{incoherence.texte}</p>
  </>
);

/** Gestes de la carte : refus et confirmation partagés par l'action principale et l'abandon de la sous-tâche. */
const useGestesCarte = ({
  incoherence,
  surActionPrincipale,
  surAbandonnerSousTache,
}: ProprietesCarteIncoherence) => {
  const principal = useRef<HTMLButtonElement>(null);
  const { refus, commande, lancer } = useCommandeCarte(principal);
  const { sousTache } = incoherence;
  const abandonner =
    sousTache === undefined || surAbandonnerSousTache === undefined
      ? undefined
      : () => {
          lancer(() => surAbandonnerSousTache(sousTache.id));
        };
  return {
    principal,
    refus,
    commande,
    abandonner,
    lancerPrincipal: () => {
      lancer(surActionPrincipale);
    },
  };
};

export const CarteIncoherence = (proprietes: ProprietesCarteIncoherence) => {
  const idTitre = useId();
  const gestes = useGestesCarte(proprietes);
  const { incoherence, surTerminerSousTache } = proprietes;
  const { sousTache } = incoherence;
  return (
    <section
      data-message={incoherence.code}
      {...(incoherence.variante === undefined ? {} : { 'data-variante': incoherence.variante })}
      data-niveau="attention"
      aria-labelledby={idTitre}
    >
      <EnTeteCarte incoherence={incoherence} idTitre={idTitre} />
      <BoutonPrincipal
        reference={gestes.principal}
        action={incoherence.actionPrincipale}
        surClic={gestes.lancerPrincipal}
      />
      {sousTache === undefined ? null : (
        <BoutonsTertiaires
          sousTache={sousTache}
          surTerminer={surTerminerSousTache}
          surAbandonner={gestes.abandonner}
        />
      )}
      <MessagesRefus messages={gestes.refus} />
      <ConfirmationCommande commande={gestes.commande} />
    </section>
  );
};
