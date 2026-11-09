/**
 * Crochets du profil `ihm` (ST-US-018 v0.4 §12.3) : `BeforeAll` démarre le serveur statique du build `test-ihm` ;
 * `Before` désigne l'appareil piloté par le navigateur (le monde crée le banc et, à la demande, le contexte persistant
 * Playwright) ; `After` ferme le contexte, supprime le profil et arrête le banc. Une exception non interceptée de la
 * page fait échouer le scénario.
 */
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import type { MondeIhm } from './monde-ihm';
import { demarrerServeurIhm, type ServeurIhm } from './serveur-ihm';

/** Les deux appareils d'un scénario : l'un est dans le navigateur, l'autre est simulé par le banc. */
const APPAREIL_IHM_PAR_US: Readonly<Record<string, NomAppareil>> = {
  '@US-018': 'smartphone',
  '@US-031': 'pc',
};

/** Démarrage du navigateur, ouverture en ligne, synchronisations : plus long que le délai des étapes du banc. */
const DELAI_ETAPE_MS = 60_000;
setDefaultTimeout(DELAI_ETAPE_MS);

let serveur: ServeurIhm | undefined;

BeforeAll(async () => {
  serveur = await demarrerServeurIhm();
});

AfterAll(async () => {
  await serveur?.arreter();
});

Before(function (this: MondeIhm, { pickle }) {
  const appareil = pickle.tags
    .map((tag) => APPAREIL_IHM_PAR_US[tag.name])
    .find((nom) => nom !== undefined);
  if (appareil === undefined) {
    throw new Error(`Scénario @ihm sans tag d'US connue : ${pickle.name}`);
  }
  this.appareilIhm = appareil;
});

After(async function (this: MondeIhm) {
  await this.arreter();
  this.banc.arreter();
  if (this.erreursPage.length > 0) {
    throw new Error(`Exceptions non interceptées de la page : ${this.erreursPage.join(' ; ')}`);
  }
});
