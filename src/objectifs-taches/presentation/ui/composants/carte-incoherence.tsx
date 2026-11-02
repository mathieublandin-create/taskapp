import { useId, useRef, useState, type RefObject } from 'react';
import type { IdTache } from '../../../../commun/domaine/identifiants';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { MessageRefus } from '../../modeles-de-vue/messages-de-refus';
import { messagesDeIssue } from '../etat/issues';
import type { IssueSaisie } from '../etat/magasin-taches';
import { LIBELLES_TACHES } from '../libelles-ui';
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

/** Nom accessible d'un bouton tertiaire : son libellé suivi de la sous-tâche visée (guide §4.24, 2.4.6). */
const nomAccessible = (libelleBouton: string, intitule: string): string =>
  `${libelleBouton} : « ${intitule} »`;

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
      <button
        type="button"
        data-action="TERMINER_SOUS_TACHE"
        aria-label={nomAccessible(LIBELLES_TACHES.terminerSousTache, sousTache.intitule)}
        onClick={() => {
          surTerminer(sousTache.id);
        }}
      >
        {LIBELLES_TACHES.terminerSousTache}
      </button>
    )}
    {surAbandonner === undefined ? null : (
      <button
        type="button"
        data-action="ABANDONNER_SOUS_TACHE"
        aria-label={nomAccessible(LIBELLES_TACHES.abandonnerSousTache, sousTache.intitule)}
        onClick={surAbandonner}
      >
        {LIBELLES_TACHES.abandonnerSousTache}
      </button>
    )}
  </>
);

export const CarteIncoherence = ({
  incoherence,
  surActionPrincipale,
  surTerminerSousTache,
  surAbandonnerSousTache,
}: ProprietesCarteIncoherence) => {
  const idTitre = useId();
  const principal = useRef<HTMLButtonElement>(null);
  const { refus, commande, lancer } = useCommandeCarte(principal);
  const { sousTache, actionPrincipale } = incoherence;
  return (
    <section
      data-message={incoherence.code}
      {...(incoherence.variante === undefined ? {} : { 'data-variante': incoherence.variante })}
      data-niveau="attention"
      aria-labelledby={idTitre}
    >
      <h2 id={idTitre}>{incoherence.libelle}</h2>
      <p>{incoherence.texte}</p>
      <button
        ref={principal}
        type="button"
        data-action={actionPrincipale.action}
        onClick={() => {
          lancer(surActionPrincipale);
        }}
      >
        {actionPrincipale.libelle}
      </button>
      {sousTache === undefined ? null : (
        <BoutonsTertiaires
          sousTache={sousTache}
          surTerminer={surTerminerSousTache}
          surAbandonner={
            surAbandonnerSousTache === undefined
              ? undefined
              : () => {
                  lancer(() => surAbandonnerSousTache(sousTache.id));
                }
          }
        />
      )}
      <MessagesRefus messages={refus} />
      <ConfirmationCommande commande={commande} />
    </section>
  );
};
