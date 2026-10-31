// ADR-014 (M2) : premier import, pour que Zod soit en mode interprété avant la construction de tout schéma.
import './compte/infrastructure/zod-sans-compilation';
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ErreurProgrammation } from './commun/domaine/erreur-programmation';
import {
  consommerRetourRedirection,
  NAVIGATION_RETOUR_NAVIGATEUR,
} from './compte/infrastructure/auth/retour-redirection';
import { DialogueConfirmation } from './compte/presentation/ui/DialogueConfirmation';
import { EcranConnexion } from './compte/presentation/ui/EcranConnexion';
import { Racine } from './compte/presentation/ui/Racine';
import { SectionCompte } from './compte/presentation/ui/SectionCompte';
import { SuppressionBloquee } from './compte/presentation/ui/SuppressionBloquee';
import type { ControleurInterface } from './composition/controleur-interface';
import { demarrerWeb } from './composition/web';
import { appareilDepuisAgent } from './commun/presentation/format/appareil';
import { Toast } from './commun/presentation/ui/toast';
import { FeuilleSynchronisation } from './synchronisation/presentation/ui/FeuilleSynchronisation';
import { Bandeau } from './synchronisation/presentation/ui/Bandeau';
import { IndicateurSynchronisation } from './synchronisation/presentation/ui/IndicateurSynchronisation';
import './commun/presentation/ui/styles.css';
import type { ObjectifsTaches } from './composition/objectifs-taches';
import { EspaceObjectifs } from './objectifs-taches/presentation/ui/ecrans/espace-objectifs';
import { EspaceTaches } from './objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from './objectifs-taches/presentation/ui/etat/magasin-taches';
import {
  LIBELLES_OBJECTIFS,
  LIBELLES_TACHES,
} from './objectifs-taches/presentation/ui/libelles-ui';
import { creerMagasinObjectifsTaches } from './objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';

// RED-02 : première instruction, synchrone, avant tout rendu, toute requête et le chargement de GIS : le fragment
// de l'URL de retour de Google est copié, effacé, puis analysé. Les modules importés n'ont aucun effet de bord.
// RED-05 : le retour (qui porte le jeton) n'est lié à aucun nom de module ; il n'existe que le temps de l'appel.
const controleur = demarrerWeb(consommerRetourRedirection(NAVIGATION_RETOUR_NAVIGATEUR), {
  variables: import.meta.env,
  agent: navigator.userAgent,
  pointsTactiles: navigator.maxTouchPoints,
  recharger: () => {
    location.reload();
  },
  arreterNavigation: () => {
    window.stop();
  },
  ouvrirOnglet: (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  },
});

setupIonicReact();

/** Appareil affiché dans les textes (« ce smartphone », « ce PC »), calculé une fois (RC-R2-7). */
const APPAREIL = appareilDepuisAgent(navigator.userAgent, navigator.maxTouchPoints);

type Onglet = 'TACHES' | 'OBJECTIFS';

const ONGLETS: ReadonlyArray<readonly [Onglet, string]> = [
  ['TACHES', LIBELLES_TACHES.titreListe],
  ['OBJECTIFS', LIBELLES_OBJECTIFS.titreListe],
];

/** Navigation entre les deux espaces ; la liste « Tâches » est l'accueil (ECR-002). */
const NavigationEspaces = ({
  onglet,
  surChoisir,
}: {
  readonly onglet: Onglet;
  readonly surChoisir: (onglet: Onglet) => void;
}) => (
  <nav aria-label={LIBELLES_TACHES.navigationEspaces}>
    {ONGLETS.map(([valeur, texte]) => (
      <button
        key={valeur}
        type="button"
        aria-current={valeur === onglet ? 'page' : undefined}
        onClick={() => {
          surChoisir(valeur);
        }}
      >
        {texte}
      </button>
    ))}
  </nav>
);

/** Écrans des tâches (US-002, rang 5) et des objectifs (US-001, rang 2), sur les magasins de l'espace ouvert. */
const EcransObjectifs = ({ objectifs }: { readonly objectifs: ObjectifsTaches }) => {
  const magasinObjectifs = useMemo(() => creerMagasinObjectifsTaches(objectifs), [objectifs]);
  const magasinTaches = useMemo(() => creerMagasinTaches(objectifs), [objectifs]);
  const [onglet, setOnglet] = useState<Onglet>('TACHES');
  useEffect(() => magasinObjectifs.getState().actions.observerDepot(), [magasinObjectifs]);
  useEffect(() => magasinTaches.getState().actions.observerDepot(), [magasinTaches]);
  return (
    <>
      <NavigationEspaces onglet={onglet} surChoisir={setOnglet} />
      {onglet === 'TACHES' ? (
        <EspaceTaches magasin={magasinTaches} />
      ) : (
        <EspaceObjectifs
          magasin={magasinObjectifs}
          taches={{
            magasin: magasinTaches,
            surOuvrirTache: (id) => {
              setOnglet('TACHES');
              void magasinTaches.getState().actions.ouvrirDetail(id);
            },
          }}
        />
      )}
    </>
  );
};

/** Indicateur, bandeau et feuille de synchronisation (ECR-011), présents avec l'état de synchronisation. */
const EtatSynchronisation = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      {vue.indicateur === undefined ? null : (
        <IndicateurSynchronisation
          vue={vue.indicateur}
          surReprendre={() => void controleur.reprendre()}
        />
      )}
      {vue.bandeau === undefined ? null : (
        <Bandeau
          vue={vue.bandeau}
          appareil={APPAREIL}
          surAction={() => void controleur.reprendre()}
          surMasquer={() => void controleur.masquerRappel()}
        />
      )}
      {vue.feuille === undefined ? null : (
        <FeuilleSynchronisation
          vue={vue.feuille}
          surSynchroniser={() => void controleur.synchroniser()}
          surActionCarte={(a) => void controleur.actionCarte(a)}
        />
      )}
    </>
  );
};

/** Espace de l'application : indicateur, bandeau, section « Compte », puis les objectifs. */
const EspaceApplication = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  const objectifs = controleur.objectifs();
  return (
    <main aria-label="Done Juan">
      <EtatSynchronisation controleur={controleur} />
      {vue.toast === undefined ? null : (
        <Toast code={vue.toast} surAction={() => void controleur.reessayer()} />
      )}
      {vue.compte === undefined ? null : (
        <SectionCompte vue={vue.compte} surAction={(a) => void controleur.actionCompte(a)} />
      )}
      {objectifs === undefined ? null : <EcransObjectifs objectifs={objectifs} />}
    </main>
  );
};

/** Confirmations du compte et ERR-017, par-dessus l'écran courant. */
const Dialogues = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      {vue.confirmation === undefined ? null : (
        <DialogueConfirmation
          vue={vue.confirmation}
          surConfirmer={() => void controleur.confirmer()}
          surAnnuler={() => void controleur.annuler()}
        />
      )}
      {vue.suppressionBloquee === undefined ? null : (
        <SuppressionBloquee
          enCours={vue.suppressionBloquee.enCours}
          surReessayer={() => void controleur.reessayerSuppression()}
          surAllerALaConnexion={() => void controleur.allerALaConnexion()}
        />
      )}
    </>
  );
};

const Application = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <>
      <Racine
        vue={vue.racine}
        connexion={
          <EcranConnexion
            vue={vue.connexion}
            surAction={() => void controleur.continuerAvecGoogle()}
          />
        }
        application={<EspaceApplication controleur={controleur} />}
      />
      <Dialogues controleur={controleur} />
    </>
  );
};

const racine = document.getElementById('racine');
if (racine === null) throw new ErreurProgrammation('Élément « racine » absent de index.html');
createRoot(racine).render(
  <StrictMode>
    <IonApp>
      <Application controleur={controleur} />
    </IonApp>
  </StrictMode>,
);
