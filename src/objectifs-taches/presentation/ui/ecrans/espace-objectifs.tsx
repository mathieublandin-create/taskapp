import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
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
} from '../etat/magasin-objectifs-taches';
import { DetailObjectif } from './detail-objectif';
import { ListeObjectifs } from './liste-objectifs';

// Espace des objectifs : navigation liste ↔ détail, feuilles de saisie, menu « … », confirmation de suppression et
// toast d'erreur d'enregistrement (ERR-014), au-dessus du magasin Zustand (ST-US-001 §4.5).
export type ProprietesEspaceObjectifs = { readonly magasin: MagasinObjectifs };

const FEUILLE_PAR_ACTION: Readonly<
  Record<Exclude<ActionMenuObjectif, 'SUPPRIMER' | 'RETIRER_DELAI'>, ModeFeuille>
> = { RENOMMER: 'RENOMMAGE', MODIFIER_DESCRIPTION: 'DESCRIPTION', MODIFIER_DELAI: 'DELAI' };

const delaiDepuisTexte = (texte: string): DateCalendaire | undefined => {
  const date = DateCalendaire.depuisTexte(texte);
  return date.ok ? date.valeur : undefined;
};

const creer = (actions: ActionsMagasinObjectifs, valeurs: ValeursFeuille): Promise<IssueSaisie> => {
  const delai = delaiDepuisTexte(valeurs.delai);
  return actions.creer({
    intitule: valeurs.intitule,
    ...(valeurs.description === '' ? {} : { description: valeurs.description }),
    ...(delai === undefined ? {} : { delai }),
  });
};

/** Enregistre la saisie de la feuille sur l'objectif ouvert (ou crée l'objectif). */
const enregistrer = (
  actions: ActionsMagasinObjectifs,
  ecran: EcranObjectifs,
  mode: ModeFeuille,
  valeurs: ValeursFeuille,
): Promise<IssueSaisie> => {
  if (mode === 'CREATION') return creer(actions, valeurs);
  if (ecran.type !== 'DETAIL') {
    throw new ErreurProgrammation(`Saisie « ${mode} » sans objectif ouvert`);
  }
  if (mode === 'RENOMMAGE') return actions.renommer(ecran.id, valeurs.intitule);
  if (mode === 'DESCRIPTION') return actions.modifierDescription(ecran.id, valeurs.description);
  return actions.modifierDelai(ecran.id, delaiDepuisTexte(valeurs.delai));
};

const valeursInitiales = (
  detail: ModeleVueDetailObjectif | undefined,
  mode: ModeFeuille,
): Partial<ValeursFeuille> => {
  if (detail === undefined || mode === 'CREATION') return {};
  if (mode === 'RENOMMAGE') return { intitule: detail.intitule };
  if (mode === 'DESCRIPTION') return { description: detail.description ?? '' };
  return { delai: detail.delai.type === 'DATE' ? detail.delai.date : '' };
};

type Geste = {
  readonly feuille: { readonly mode: ModeFeuille; readonly ouverte: boolean };
  readonly menuOuvert: boolean;
  readonly ouvrirFeuille: (mode: ModeFeuille) => void;
  readonly fermerFeuille: () => void;
  readonly ouvrirMenu: () => void;
  readonly fermerMenu: () => void;
};

const useGeste = (): Geste => {
  const [feuille, setFeuille] = useState<Geste['feuille']>({ mode: 'CREATION', ouverte: false });
  const [menuOuvert, setMenuOuvert] = useState(false);
  return {
    feuille,
    menuOuvert,
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
};

const Page = ({ ecran, liste, detail, actions, geste }: ProprietesPage) => {
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
      />
    );
  }
  return null;
};

/** Gestes du menu « … » et validation des feuilles, sur l'objectif ouvert. */
const useGestesSaisie = ({ ecran, actions, geste }: Omit<ProprietesPage, 'liste' | 'detail'>) => ({
  surActionMenu: (action: ActionMenuObjectif): void => {
    if (ecran.type !== 'DETAIL') return;
    if (action === 'SUPPRIMER') void actions.demanderSuppression(ecran.id);
    else if (action === 'RETIRER_DELAI') void actions.modifierDelai(ecran.id, undefined);
    else geste.ouvrirFeuille(FEUILLE_PAR_ACTION[action]);
  },
  valider: (mode: ModeFeuille, valeurs: ValeursFeuille): Promise<IssueSaisie> =>
    enregistrer(actions, ecran, mode, valeurs),
});

const Saisies = ({ ecran, detail, actions, geste }: Omit<ProprietesPage, 'liste'>) => {
  const { feuille } = geste;
  const { surActionMenu, valider } = useGestesSaisie({ ecran, actions, geste });
  return (
    <>
      {detail === undefined ? null : (
        <MenuObjectif
          ouvert={geste.menuOuvert}
          actions={detail.actions}
          surAction={surActionMenu}
          surFermer={geste.fermerMenu}
        />
      )}
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

export const EspaceObjectifs = ({ magasin }: ProprietesEspaceObjectifs) => {
  const { actions } = magasin.getState();
  const etat = useStore(magasin);
  const geste = useGeste();
  useEffect(() => {
    void actions.afficherListe();
  }, [actions]);
  const { ecran, liste, detail, confirmation } = etat;
  return (
    <>
      <Page {...{ ecran, liste, detail, actions, geste }} />
      <Saisies {...{ ecran, detail, actions, geste }} />
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
