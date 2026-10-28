import { StrictMode, useSyncExternalStore } from 'react';
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
import { Bandeau } from './synchronisation/presentation/ui/Bandeau';
import { IndicateurSynchronisation } from './synchronisation/presentation/ui/IndicateurSynchronisation';

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
});

/** En-tête de l'application (rang 1 : indicateur, bandeau, section « Compte ») ; les écrans métier arrivent au rang 2. */
const EspaceApplication = ({ controleur }: { readonly controleur: ControleurInterface }) => {
  const vue = useSyncExternalStore(controleur.observer, controleur.vue);
  return (
    <main aria-label="Done Juan">
      {vue.indicateur === undefined ? null : (
        <IndicateurSynchronisation
          vue={vue.indicateur}
          surReprendre={() => void controleur.reprendre()}
        />
      )}
      {vue.bandeau === undefined ? null : (
        <Bandeau
          vue={vue.bandeau}
          surAction={() => void controleur.reprendre()}
          surMasquer={() => void controleur.masquerRappel()}
        />
      )}
      {vue.toast === undefined ? null : (
        <p role="status" data-code={vue.toast}>
          Terminez votre saisie, puis reprenez la synchronisation.
        </p>
      )}
      {vue.compte === undefined ? null : (
        <SectionCompte vue={vue.compte} surAction={(a) => void controleur.actionCompte(a)} />
      )}
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
    <Application controleur={controleur} />
  </StrictMode>,
);
