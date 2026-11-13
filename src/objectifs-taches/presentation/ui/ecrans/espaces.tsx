import { useCallback, useEffect, useMemo, useState } from 'react';
import { FournisseurConsultationSeule } from '../../../../commun/presentation/ui/consultation-seule';
import type { RefElementMetier } from '../../../../synchronisation';
import { EspaceObjectifs } from './espace-objectifs';
import { EspaceTaches } from './espace-taches';
import { creerMagasinObjectifsTaches } from '../etat/magasin-objectifs-taches';
import { creerMagasinTaches } from '../etat/magasin-taches';
import { LIBELLES_OBJECTIFS, LIBELLES_TACHES } from '../libelles-ui';

// Espaces « Tâches » et « Objectifs » et barre d'onglets en bas (guide §2.2 et §4.14). Extrait de main.tsx pour être
// monté tel quel par le harnais des tests de navigateur (tests/support/harnais/).
/** Services des deux espaces (satisfait par `ObjectifsTaches` de la composition). */
type ObjectifsTaches = Parameters<typeof creerMagasinObjectifsTaches>[0] &
  Parameters<typeof creerMagasinTaches>[0];

export type Onglet = 'TACHES' | 'OBJECTIFS';

/** Icônes de 24 px de la barre d'onglets (§4.14), dessinées en ligne : aucune dépendance d'icônes. */
const TRACES_ICONES: Readonly<Record<Onglet, string>> = {
  TACHES: 'M4 12l5 5L20 6',
  OBJECTIFS: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 100 8 4 4 0 000-8z',
};

const ONGLETS: ReadonlyArray<readonly [Onglet, string]> = [
  ['TACHES', LIBELLES_TACHES.titreListe],
  ['OBJECTIFS', LIBELLES_OBJECTIFS.titreListe],
];

const Icone = ({ onglet }: { readonly onglet: Onglet }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={TRACES_ICONES[onglet]} fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/** Barre d'onglets : l'onglet actif est en accent, en gras et porte `aria-current="page"` (guide §4.14). */
const BarreOnglets = ({
  onglet,
  surChoisir,
}: {
  readonly onglet: Onglet;
  readonly surChoisir: (onglet: Onglet) => void;
}) => (
  <nav className="barre-onglets" aria-label={LIBELLES_TACHES.navigationEspaces}>
    {ONGLETS.map(([valeur, texte]) => (
      <button
        key={valeur}
        type="button"
        aria-current={valeur === onglet ? 'page' : undefined}
        onClick={() => {
          surChoisir(valeur);
        }}
      >
        <Icone onglet={valeur} />
        <span>{texte}</span>
      </button>
    ))}
  </nav>
);

/** Magasins des tâches et des objectifs de l'espace ouvert, abonnés à son dépôt. */
const useMagasins = (objectifs: ObjectifsTaches) => {
  const magasinObjectifs = useMemo(() => creerMagasinObjectifsTaches(objectifs), [objectifs]);
  const magasinTaches = useMemo(() => creerMagasinTaches(objectifs), [objectifs]);
  useEffect(() => magasinObjectifs.getState().actions.observerDepot(), [magasinObjectifs]);
  useEffect(() => magasinTaches.getState().actions.observerDepot(), [magasinTaches]);
  return { magasinObjectifs, magasinTaches };
};

type Magasins = ReturnType<typeof useMagasins>;

/** Ouvre le détail demandé par « Voir … » de la section « À lire », puis acquitte la demande. */
const useOuvertureDemandee = (
  { magasinObjectifs, magasinTaches }: Magasins,
  demande: RefElementMetier | undefined,
  surOuvert: () => void,
): void => {
  useEffect(() => {
    if (demande === undefined) return;
    if (demande.type === 'TACHE') void magasinTaches.getState().actions.ouvrirDetail(demande.id);
    else void magasinObjectifs.getState().actions.ouvrirDetail(demande.id);
    surOuvert();
  }, [demande, magasinObjectifs, magasinTaches, surOuvert]);
};

export type NavigationUi = {
  readonly onglet: Onglet;
  readonly surOnglet: (onglet: Onglet) => void;
  /** Élément demandé par « Voir … » ; `surOuvert` acquitte la demande. */
  readonly demande: RefElementMetier | undefined;
  readonly surOuvert: () => void;
};

/** Espace de l'onglet actif ; revenir à une tâche depuis un objectif bascule sur l'onglet Tâches. */
const EspaceActif = ({
  magasins,
  onglet,
  surOnglet,
}: {
  readonly magasins: Magasins;
  readonly onglet: Onglet;
  readonly surOnglet: (onglet: Onglet) => void;
}) =>
  onglet === 'TACHES' ? (
    <EspaceTaches magasin={magasins.magasinTaches} />
  ) : (
    <EspaceObjectifs
      magasin={magasins.magasinObjectifs}
      taches={{
        magasin: magasins.magasinTaches,
        surOuvrirTache: (id) => {
          surOnglet('TACHES');
          void magasins.magasinTaches.getState().actions.ouvrirDetail(id);
        },
      }}
    />
  );

/**
 * Écrans des tâches (US-002, rang 5) et des objectifs (US-001, rang 2), sur les magasins de l'espace ouvert.
 * `consultationSeule` (RG-058, `VueInterface.consultationSeule`) : champs et menus visibles et inertes, toast à la tentative.
 */
export const EcransObjectifs = ({
  objectifs,
  navigation,
  consultationSeule = false,
}: {
  readonly objectifs: ObjectifsTaches;
  readonly navigation: NavigationUi;
  readonly consultationSeule?: boolean;
}) => {
  const magasins = useMagasins(objectifs);
  const { onglet, surOnglet, demande, surOuvert } = navigation;
  useOuvertureDemandee(magasins, demande, surOuvert);
  return (
    <FournisseurConsultationSeule actif={consultationSeule}>
      <div className="espaces">
        <div className="espaces-contenu">
          <EspaceActif magasins={magasins} onglet={onglet} surOnglet={surOnglet} />
        </div>
        <BarreOnglets onglet={onglet} surChoisir={surOnglet} />
      </div>
    </FournisseurConsultationSeule>
  );
};

/** Navigation entre espaces, pilotée aussi par « Voir … » de la section « À lire ». */
export const useNavigation = (): NavigationUi & {
  readonly voir: (element: RefElementMetier) => void;
} => {
  const [onglet, surOnglet] = useState<Onglet>('TACHES');
  const [demande, setDemande] = useState<RefElementMetier | undefined>(undefined);
  const surOuvert = useCallback(() => {
    setDemande(undefined);
  }, []);
  const voir = useCallback((element: RefElementMetier) => {
    surOnglet(element.type === 'TACHE' ? 'TACHES' : 'OBJECTIFS');
    setDemande(element);
  }, []);
  return { onglet, surOnglet, demande, surOuvert, voir };
};
