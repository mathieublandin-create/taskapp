import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { ErreurProgrammation } from '../../../../commun/domaine/erreur-programmation';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { BoiteConfirmation } from '../../../../commun/presentation/ui/boite-confirmation';
import { Toast } from '../../../../commun/presentation/ui/toast';
import type { ModeleVueDetailObjectif } from '../../modeles-de-vue/detail-objectif';
import {
  FeuilleObjectif,
  type ModeFeuille,
  type ValeursFeuille,
} from '../composants/feuille-objectif';
import { MenuObjectif, type ActionMenuObjectif } from '../composants/menu-objectif';
import type {
  ActionsMagasinObjectifs,
  EcranObjectifs,
  IssueSaisie,
  MagasinObjectifs,
  SaisieObjectif,
  SelecteurParentOuvert,
} from '../etat/magasin-objectifs-taches';
import { SaisieRapide } from '../composants/saisie-rapide';
import { SelecteurParent } from '../composants/selecteur-parent';
import type { MagasinTaches } from '../etat/magasin-taches';
import { construireFormulaireTache } from '../../modeles-de-vue/formulaire-tache';
import { DetailObjectif, type ProprietesDetailObjectif } from './detail-objectif';
import { ListeObjectifs } from './liste-objectifs';

// Espace des objectifs : navigation liste ↔ détail, feuilles de saisie, menu « … », confirmation de suppression et
// toast d'erreur d'enregistrement (ERR-014), au-dessus du magasin Zustand (ST-US-001 §4.5).
export type ProprietesEspaceObjectifs = {
  readonly magasin: MagasinObjectifs;
  /** Tâches (US-002) : ouverture d'une tâche et saisie rapide depuis le détail d'un objectif (objectif pré-rempli). */
  readonly taches?: LiaisonTaches;
};

export type LiaisonTaches = {
  readonly magasin: MagasinTaches;
  readonly surOuvrirTache: (id: IdTache) => void;
};

const FEUILLE_PAR_ACTION: Readonly<
  Record<Exclude<ActionMenuObjectif, 'SUPPRIMER' | 'RETIRER_DELAI' | 'PLACER'>, ModeFeuille>
> = { RENOMMER: 'RENOMMAGE', MODIFIER_DESCRIPTION: 'DESCRIPTION', MODIFIER_DELAI: 'DELAI' };

const delaiDepuisTexte = (texte: string): DateCalendaire | undefined => {
  const date = DateCalendaire.depuisTexte(texte);
  return date.ok ? date.valeur : undefined;
};

const saisieDepuis = (valeurs: ValeursFeuille): SaisieObjectif => {
  const delai = delaiDepuisTexte(valeurs.delai);
  return {
    intitule: valeurs.intitule,
    ...(valeurs.description === '' ? {} : { description: valeurs.description }),
    ...(delai === undefined ? {} : { delai }),
  };
};

/** Enregistre la saisie de la feuille sur l'objectif ouvert (ou crée l'objectif). */
const enregistrer = (
  actions: ActionsMagasinObjectifs,
  ecran: EcranObjectifs,
  mode: ModeFeuille,
  valeurs: ValeursFeuille,
): Promise<IssueSaisie> => {
  if (mode === 'CREATION') return actions.creer(saisieDepuis(valeurs));
  if (ecran.type !== 'DETAIL') {
    throw new ErreurProgrammation(`Saisie « ${mode} » sans objectif ouvert`);
  }
  if (mode === 'CREATION_SOUS_OBJECTIF') {
    return actions.creerSousObjectif(ecran.id, saisieDepuis(valeurs));
  }
  if (mode === 'RENOMMAGE') return actions.renommer(ecran.id, valeurs.intitule);
  if (mode === 'DESCRIPTION') return actions.modifierDescription(ecran.id, valeurs.description);
  return actions.modifierDelai(ecran.id, delaiDepuisTexte(valeurs.delai));
};

const valeursInitiales = (
  detail: ModeleVueDetailObjectif | undefined,
  mode: ModeFeuille,
): Partial<ValeursFeuille> => {
  if (detail === undefined || mode === 'CREATION' || mode === 'CREATION_SOUS_OBJECTIF') return {};
  if (mode === 'RENOMMAGE') return { intitule: detail.intitule };
  if (mode === 'DESCRIPTION') return { description: detail.description ?? '' };
  return { delai: detail.delai.type === 'DATE' ? detail.delai.date : '' };
};

type Geste = {
  readonly feuille: { readonly mode: ModeFeuille; readonly ouverte: boolean };
  readonly menuOuvert: boolean;
  readonly saisieTacheOuverte: boolean;
  readonly basculerSaisieTache: (ouverte: boolean) => void;
  readonly ouvrirFeuille: (mode: ModeFeuille) => void;
  readonly fermerFeuille: () => void;
  readonly ouvrirMenu: () => void;
  readonly fermerMenu: () => void;
};

const useGeste = (): Geste => {
  const [feuille, setFeuille] = useState<Geste['feuille']>({ mode: 'CREATION', ouverte: false });
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [saisieTacheOuverte, setSaisieTacheOuverte] = useState(false);
  return {
    feuille,
    menuOuvert,
    saisieTacheOuverte,
    basculerSaisieTache: setSaisieTacheOuverte,
    ouvrirFeuille: (mode) => {
      setFeuille({ mode, ouverte: true });
    },
    fermerFeuille: () => {
      setFeuille((courante) => ({ ...courante, ouverte: false }));
    },
    ouvrirMenu: () => {
      setMenuOuvert(true);
    },
    fermerMenu: () => {
      setMenuOuvert(false);
    },
  };
};

type ProprietesPage = {
  readonly ecran: EcranObjectifs;
  readonly liste: ReturnType<MagasinObjectifs['getState']>['liste'];
  readonly detail: ModeleVueDetailObjectif | undefined;
  readonly actions: ActionsMagasinObjectifs;
  readonly geste: Geste;
  readonly taches: LiaisonTaches | undefined;
};

/** Props de tâches du détail : absentes sans liaison (écrans et tests d'objectifs seuls). */
const liaisonTaches = (
  taches: LiaisonTaches | undefined,
  geste: Geste,
): Pick<ProprietesDetailObjectif, 'surOuvrirTache' | 'surAjouterTache'> =>
  taches === undefined
    ? {}
    : {
        surOuvrirTache: taches.surOuvrirTache,
        surAjouterTache: () => {
          geste.basculerSaisieTache(true);
        },
      };

/** Liaison du détail : tâches, et « Changer le délai » de la carte d'ALR-007, qui ouvre la feuille du délai. */
const liaisonDetail = (taches: LiaisonTaches | undefined, geste: Geste) => ({
  ...liaisonTaches(taches, geste),
  surChangerDelai: () => {
    geste.ouvrirFeuille('DELAI');
  },
});

const Page = ({ ecran, liste, detail, actions, geste, taches }: ProprietesPage) => {
  if (ecran.type === 'LISTE' && liste !== undefined) {
    return (
      <ListeObjectifs
        modele={liste}
        surCreer={() => {
          geste.ouvrirFeuille('CREATION');
        }}
        surOuvrir={(id) => void actions.ouvrirDetail(id)}
      />
    );
  }
  if (ecran.type === 'DETAIL' && detail !== undefined) {
    return (
      <DetailObjectif
        modele={detail}
        surRetour={() => void actions.afficherListe()}
        surOuvrirMenu={geste.ouvrirMenu}
        surOuvrirSousObjectif={(id) => void actions.ouvrirDetail(id)}
        surAjouterSousObjectif={() => {
          geste.ouvrirFeuille('CREATION_SOUS_OBJECTIF');
        }}
        {...liaisonDetail(taches, geste)}
      />
    );
  }
  return null;
};

/** Gestes du menu « … » et validation des feuilles, sur l'objectif ouvert. */
const useGestesSaisie = ({
  ecran,
  actions,
  geste,
}: Pick<ProprietesPage, 'ecran' | 'actions' | 'geste'>) => ({
  surActionMenu: (action: ActionMenuObjectif): void => {
    if (ecran.type !== 'DETAIL') return;
    if (action === 'SUPPRIMER') void actions.demanderSuppression(ecran.id);
    else if (action === 'RETIRER_DELAI') void actions.modifierDelai(ecran.id, undefined);
    else if (action === 'PLACER') void actions.ouvrirSelecteurParent(ecran.id);
    else geste.ouvrirFeuille(FEUILLE_PAR_ACTION[action]);
  },
  valider: (mode: ModeFeuille, valeurs: ValeursFeuille): Promise<IssueSaisie> =>
    enregistrer(actions, ecran, mode, valeurs),
});

const SelecteurParentAffiche = ({
  actions,
  ouvert,
}: {
  readonly actions: ActionsMagasinObjectifs;
  readonly ouvert: SelecteurParentOuvert | undefined;
}) =>
  ouvert === undefined ? null : (
    <SelecteurParent
      modele={ouvert.modele}
      refus={ouvert.refus}
      surRefusCompris={actions.effacerRefusPlacement}
      surChoisir={(cible) => void actions.placer(ouvert.objectifId, cible)}
      surFermer={actions.fermerSelecteurParent}
    />
  );

const MenuDuDetail = ({
  detail,
  geste,
  surAction,
}: {
  readonly detail: ModeleVueDetailObjectif | undefined;
  readonly geste: Geste;
  readonly surAction: (action: ActionMenuObjectif) => void;
}) =>
  detail === undefined ? null : (
    <MenuObjectif
      ouvert={geste.menuOuvert}
      actions={detail.actions}
      surAction={surAction}
      surFermer={geste.fermerMenu}
    />
  );

const Saisies = ({
  ecran,
  detail,
  actions,
  geste,
  selecteurParent,
}: Omit<ProprietesPage, 'liste' | 'taches'> & {
  readonly selecteurParent: SelecteurParentOuvert | undefined;
}) => {
  const { feuille } = geste;
  const { surActionMenu, valider } = useGestesSaisie({ ecran, actions, geste });
  return (
    <>
      <MenuDuDetail detail={detail} geste={geste} surAction={surActionMenu} />
      <SelecteurParentAffiche actions={actions} ouvert={selecteurParent} />
      <FeuilleObjectif
        ouverte={feuille.ouverte}
        mode={feuille.mode}
        initiales={valeursInitiales(detail, feuille.mode)}
        identifiantSaisie={`feuille-objectif-${feuille.mode}`}
        surValider={(valeurs) => valider(feuille.mode, valeurs)}
        surFermee={geste.fermerFeuille}
      />
    </>
  );
};

/** Saisie rapide d'une tâche depuis le détail d'un objectif : l'objectif est pré-rempli (guide §4.3). */
const SaisieTacheDeLObjectif = ({
  magasin,
  objectifId,
  geste,
}: {
  readonly magasin: MagasinTaches;
  readonly objectifId: IdObjectif;
  readonly geste: Geste;
}) => {
  const { actions, objectifs } = useStore(magasin);
  useEffect(() => {
    if (geste.saisieTacheOuverte) void actions.chargerObjectifs();
  }, [actions, geste.saisieTacheOuverte]);
  return (
    <SaisieRapide
      ouverte={geste.saisieTacheOuverte}
      formulaire={construireFormulaireTache({ objectifPreRempli: objectifId })}
      objectifs={objectifs}
      surValider={actions.creer}
      surFermee={() => {
        geste.basculerSaisieTache(false);
      }}
    />
  );
};

export const EspaceObjectifs = ({ magasin, taches }: ProprietesEspaceObjectifs) => {
  const { actions } = magasin.getState();
  const etat = useStore(magasin);
  const geste = useGeste();
  useEffect(() => {
    void actions.afficherListe();
  }, [actions]);
  const { ecran, liste, detail, confirmation, selecteurParent } = etat;
  return (
    <>
      <Page {...{ ecran, liste, detail, actions, geste, taches }} />
      <Saisies {...{ ecran, detail, actions, geste, selecteurParent }} />
      {taches === undefined || ecran.type !== 'DETAIL' ? null : (
        <SaisieTacheDeLObjectif magasin={taches.magasin} objectifId={ecran.id} geste={geste} />
      )}
      {confirmation === undefined ? null : (
        <BoiteConfirmation
          code={confirmation.code}
          titre={confirmation.titre}
          {...(confirmation.texte === undefined ? {} : { texte: confirmation.texte })}
          actionLibelle={confirmation.actionLibelle}
          rouge
          surConfirmer={() => void actions.confirmerSuppression()}
          surAnnuler={actions.annulerSuppression}
        />
      )}
      {etat.erreurEnregistrement ? <Toast code="TST-ERREUR-ENREGISTREMENT" /> : null}
    </>
  );
};
