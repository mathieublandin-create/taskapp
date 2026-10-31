import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { BoiteConfirmation } from '../../../../commun/presentation/ui/boite-confirmation';
import { Toast } from '../../../../commun/presentation/ui/toast';
import type { ModeleVueConfirmation } from '../../modeles-de-vue/confirmation';
import type { ModeleVueDetailTache } from '../../modeles-de-vue/detail-tache';
import type { ModeleVueListeTaches } from '../../modeles-de-vue/liste-taches';
import { construireFormulaireTache } from '../../modeles-de-vue/formulaire-tache';
import { SaisieRapide } from '../composants/saisie-rapide';
import type {
  ActionsMagasinTaches,
  EtatMagasinTaches,
  MagasinTaches,
} from '../etat/magasin-taches';
import { DetailTache } from './detail-tache';
import { ListeTaches } from './liste-taches';

// Espace des tâches : liste « Tâches » (accueil) ↔ détail, saisie rapide, confirmation de suppression et toast
// d'erreur d'enregistrement (ERR-014), au-dessus du magasin Zustand (ST-US-002 §4.5).
export type ProprietesEspaceTaches = { readonly magasin: MagasinTaches };

const basculerRattachement = (
  actions: ActionsMagasinTaches,
  id: IdTache,
  rattaches: ReadonlyArray<IdObjectif>,
  objectifId: IdObjectif,
): void => {
  void (rattaches.includes(objectifId)
    ? actions.detacher(id, objectifId)
    : actions.rattacher(id, objectifId));
};

const PageListe = ({
  etat,
  liste,
  surCreer,
}: {
  readonly etat: EtatMagasinTaches;
  readonly liste: ModeleVueListeTaches;
  readonly surCreer: () => void;
}) => (
  <ListeTaches
    modele={liste}
    objectifs={etat.objectifs}
    surCreer={surCreer}
    surOuvrir={(id) => void etat.actions.ouvrirDetail(id)}
    surFiltrerEtat={(filtre) => void etat.actions.filtrerEtat(filtre)}
    surFiltrerObjectif={(filtre) => void etat.actions.filtrerObjectif(filtre)}
  />
);

const PageDetail = ({
  etat,
  id,
  detail,
}: {
  readonly etat: EtatMagasinTaches;
  readonly id: IdTache;
  readonly detail: ModeleVueDetailTache;
}) => {
  const { actions } = etat;
  return (
    <DetailTache
      modele={detail}
      objectifs={etat.objectifs}
      surRetour={() => void actions.afficherListe()}
      surRenommer={(intitule) => actions.renommer(id, intitule)}
      surModifierDelai={(delai) => actions.modifierDelai(id, delai)}
      surModifierEstimation={(minutes) => actions.modifierEstimation(id, minutes)}
      surBasculerObjectif={(objectifId) => {
        basculerRattachement(actions, id, detail.objectifs.ids, objectifId);
      }}
      surSupprimer={() => void actions.demanderSuppression(id)}
    />
  );
};

const Page = ({
  etat,
  surCreer,
}: {
  readonly etat: EtatMagasinTaches;
  readonly surCreer: () => void;
}) => {
  const { ecran, liste, detail } = etat;
  if (ecran.type === 'LISTE' && liste !== undefined) {
    return <PageListe etat={etat} liste={liste} surCreer={surCreer} />;
  }
  if (ecran.type === 'DETAIL' && detail !== undefined) {
    return <PageDetail etat={etat} id={ecran.id} detail={detail} />;
  }
  return null;
};

const ConfirmationSuppression = ({
  confirmation,
  actions,
}: {
  readonly confirmation: ModeleVueConfirmation;
  readonly actions: ActionsMagasinTaches;
}) => (
  <BoiteConfirmation
    code={confirmation.code}
    titre={confirmation.titre}
    {...(confirmation.texte === undefined ? {} : { texte: confirmation.texte })}
    actionLibelle={confirmation.actionLibelle}
    rouge
    surConfirmer={() => void actions.confirmerSuppression()}
    surAnnuler={actions.annulerSuppression}
  />
);

const SaisieDeLEspace = ({
  etat,
  ouverte,
  surFermee,
}: {
  readonly etat: EtatMagasinTaches;
  readonly ouverte: boolean;
  readonly surFermee: () => void;
}) => (
  <SaisieRapide
    ouverte={ouverte}
    formulaire={construireFormulaireTache({})}
    objectifs={etat.objectifs}
    surValider={etat.actions.creer}
    surFermee={surFermee}
  />
);

export const EspaceTaches = ({ magasin }: ProprietesEspaceTaches) => {
  const etat = useStore(magasin);
  const { actions, confirmation } = etat;
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  useEffect(() => {
    // Une tâche ouverte depuis le détail d'un objectif est déjà chargée : seule la liste se charge à l'ouverture.
    if (magasin.getState().ecran.type === 'LISTE') void actions.afficherListe();
  }, [actions, magasin]);
  return (
    <>
      <Page
        etat={etat}
        surCreer={() => {
          setSaisieOuverte(true);
        }}
      />
      <SaisieDeLEspace
        etat={etat}
        ouverte={saisieOuverte}
        surFermee={() => {
          setSaisieOuverte(false);
        }}
      />
      {confirmation === undefined ? null : (
        <ConfirmationSuppression confirmation={confirmation} actions={actions} />
      )}
      {etat.erreurEnregistrement ? <Toast code="TST-ERREUR-ENREGISTREMENT" /> : null}
    </>
  );
};
