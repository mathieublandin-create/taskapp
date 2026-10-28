import type { EntreeJournalTechnique } from '../commun/application/ports/journal-technique';
import { EtatReseauNavigateur } from '../commun/infrastructure/etat-reseau-navigateur';
import { GenerateurUuidV7 } from '../commun/infrastructure/generateur-uuid-v7';
import { HorlogeSysteme } from '../commun/infrastructure/horloge-systeme';
import { JournalTechniqueLocal } from '../commun/infrastructure/journal-technique-local';
import { PlanificateurNavigateur } from '../commun/infrastructure/planificateur-navigateur';
import { SourceAleatoireCrypto } from '../commun/infrastructure/source-aleatoire-crypto';
import { registreSaisie } from '../commun/presentation/saisie/registre-saisie';
import type { RetourGoogle } from '../compte/application/ports/fournisseur-auth';
import { DELAI_MAX_ATTENTE_REDIRECTION } from '../compte/domaine/ouverture';
import {
  FournisseurAuthWeb,
  NAVIGATION_NAVIGATEUR,
  type DependancesFournisseurAuthWeb,
} from '../compte/infrastructure/auth/fournisseur-auth-web';
import { lireIdentiteUserinfo } from '../compte/infrastructure/auth/lecture-identite';
import { PasserelleGisNavigateur } from '../compte/infrastructure/auth/passerelle-gis-navigateur';
import { AvisOngletsBroadcast } from '../compte/infrastructure/avis-onglets-broadcast';
import type { BaseTechnique } from '../compte/infrastructure/base-technique';
import { lireConfiguration, type Configuration } from '../compte/infrastructure/configuration';
import { ClientGoogle } from '../infrastructure-google';
import { TransportSynchroDrive } from '../synchronisation/infrastructure/drive/transport-synchro-drive';
import { assemblerApplication, type AdaptateursApplication, type Application } from './application';
import { ControleurInterface } from './controleur-interface';

// Composition de la PWA (ADR-013 ; ST-US-022 §3.2 n° 51, §6.2). Appelée par main.tsx, après la consommation du
// retour de redirection (RED-02). Rien ne s'exécute à l'évaluation de ce module.

export type Navigateur = {
  readonly variables: Readonly<Record<string, unknown>>;
  readonly agent: string;
  readonly pointsTactiles: number;
  /** Rechargement de la page (fin de session dans un autre onglet, fermeture imposée). */
  readonly recharger: () => void;
  /** Interrompt une navigation en cours (`window.stop()`), à l'échéance de l'écran d'attente. */
  readonly arreterNavigation: () => void;
};

/** Journal technique local : tampon de 7 jours dans la base technique ; `debug` désactivé en production. */
const puitsJournal =
  (configuration: Configuration, horloge: HorlogeSysteme, base: () => BaseTechnique | undefined) =>
  (entree: EntreeJournalTechnique): void => {
    if (configuration.env === 'production' && entree.niveau === 'debug') return;
    void base()?.journaliser(entree, horloge.maintenant());
  };

type SocleWeb = Pick<DependancesFournisseurAuthWeb, 'horloge' | 'journal' | 'reseau' | 'aleatoire'>;

/** FournisseurAuthWeb (ADR-013) : GIS chargé à la demande, userinfo, navigation pleine page. */
const fournisseurWeb =
  (configuration: Configuration, socle: SocleWeb): AdaptateursApplication['fournisseur'] =>
  ({ memoireRedirection, coffre, session }) =>
    new FournisseurAuthWeb({
      ...socle,
      configuration,
      passerelle: new PasserelleGisNavigateur(),
      lireIdentite: lireIdentiteUserinfo(fetch.bind(globalThis)),
      navigation: NAVIGATION_NAVIGATEUR,
      memoireRedirection,
      coffre,
      compteDeLaSession: () => {
        const etat = session.etat();
        return etat.type === 'SANS_SESSION' ? undefined : etat.identite.compte;
      },
    });

/**
 * Un seul canal d'avis par onglet : un BroadcastChannel ne reçoit pas ses propres messages, mais une autre
 * instance ouverte dans la même page les reçoit (l'onglet qui se déconnecte se rechargerait lui-même).
 */
const assembler = (
  configuration: Configuration,
  navigateur: Navigateur,
  avis: AvisOngletsBroadcast,
): Application => {
  const horloge = new HorlogeSysteme();
  const reference: { base?: BaseTechnique } = {};
  const socle = {
    horloge,
    journal: new JournalTechniqueLocal(puitsJournal(configuration, horloge, () => reference.base)),
    reseau: new EtatReseauNavigateur(),
    aleatoire: new SourceAleatoireCrypto(),
  };
  const application = assemblerApplication({
    ...socle,
    env: configuration.env,
    planificateur: new PlanificateurNavigateur(),
    generateur: new GenerateurUuidV7(),
    avis,
    gardeSaisie: registreSaisie,
    fournisseur: fournisseurWeb(configuration, socle),
    transport: (coffre) =>
      new TransportSynchroDrive(
        new ClientGoogle({ lireJeton: () => coffre.lire()?.jeton, fetch: fetch.bind(globalThis) }),
      ),
    surFermetureImposee: navigateur.recharger,
  });
  reference.base = application.base;
  return application;
};

/** Ouvre l'application (DAT §4.1.7) ; l'écran d'attente de Google dure au plus 10 s (RL-LOT-001-S6, DEC-038). */
export const demarrerWeb = (retour: RetourGoogle, navigateur: Navigateur): ControleurInterface => {
  const configuration = lireConfiguration(navigateur.variables, {
    agent: navigateur.agent,
    pointsTactiles: navigateur.pointsTactiles,
  });
  const avis = new AvisOngletsBroadcast(configuration.env);
  const application = assembler(configuration, navigateur, avis);
  const controleur = new ControleurInterface(application, new HorlogeSysteme());
  avis.ecouter(navigateur.recharger);
  new EtatReseauNavigateur().surChangement(() => void controleur.rafraichir());
  void application.ouvrirApplication.executer(retour).then(async (issue) => {
    if (issue.type === 'REDIRECTION_LANCEE') {
      new PlanificateurNavigateur().apres(DELAI_MAX_ATTENTE_REDIRECTION, () => {
        navigateur.arreterNavigation();
        void application.ouvrirApplication.abandonnerAttenteGoogle();
      });
    }
    await controleur.apresOuverture(issue, () =>
      application.ouvrirApplication.executer({ type: 'AUCUN' }),
    );
  });
  return controleur;
};
