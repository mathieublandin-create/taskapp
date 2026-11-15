/**
 * Monde du profil `ihm` (ST-US-018 v0.4 §12.3) : le monde du banc (temps, `FauxDrive`, `FauxGoogle`, appareils
 * simulés : l'appareil qui n'est pas dans le navigateur) et, pour l'appareil piloté par le navigateur, un dossier de
 * profil temporaire, un contexte persistant Playwright (IndexedDB et service worker survivent à la fermeture d'un
 * onglet, du navigateur ou à une « extinction »), la page courante et les deux ponts (`donejuanFauxDrive`,
 * `donejuanFauxGoogle`).
 *
 * L'appareil du navigateur est ouvert à la demande : les étapes du Contexte créent d'abord les données sur l'autre
 * appareil (« un objectif … », « les tâches suivantes »), puis `assurerDemarrageInitial` ouvre la page en ligne, connecte
 * Google et attend `SYN-OK` (premier besoin de la page).
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setWorldConstructor } from '@cucumber/cucumber';
import { chromium, expect, type BrowserContext, type Page } from '@playwright/test';
import type { Instant } from '@src/commun/domaine/temps/instant';
import { IDENTIFIANTS_APPAREILS, type NomAppareil } from '../../support/banc/appareil-simule';
import { MondeDoneJuan } from '../../support/monde';
import {
  boutonConnexion,
  ecranAffiche,
  etatIndicateur,
  intitulesAffiches,
  synchronisationStable,
  type EcranAffiche,
} from './ecrans-ihm';
import { PontFauxDrive } from './pont-faux-drive';
import { PontFauxGoogle } from './pont-faux-google';
import { ORIGINE_IHM } from './serveur-ihm';

const VIEWPORTS: Readonly<Record<NomAppareil, { width: number; height: number }>> = {
  smartphone: { width: 390, height: 844 },
  pc: { width: 1280, height: 800 },
};

/** URL de la page d'erreur du navigateur (hors ligne, jamais chargée). */
export const PAGE_ERREUR_NAVIGATEUR = /^chrome-error:\/\//;

export const DELAI_ATTENTE_MS = 5_000;
export const DELAI_SYNCHRONISATION_MS = 10_000;

/** Ce que la page affichait à la fin de l'ouverture, avant toute réponse du Drive (« s'affichent aussitôt »). */
export type InstantaneIhm = {
  readonly ecran: EcranAffiche | undefined;
  readonly intitulesTaches: ReadonlyArray<string>;
};

/** Navigation en échec (hors ligne, jamais chargée) : le navigateur affiche sa page d'erreur, aucun écran de Done Juan. */
const PAGE_NON_CHARGEE: InstantaneIhm = { ecran: undefined, intitulesTaches: [] };

export type DemarrageInitial = 'EN_ATTENTE' | 'FAIT' | 'SANS_OBJET';

export class MondeIhm extends MondeDoneJuan {
  /** Appareil piloté par le navigateur : le smartphone pour US-018, le PC pour US-031 (posé par `hooks-ihm.ts`). */
  appareilIhm: NomAppareil = 'smartphone';
  demarrageInitial: DemarrageInitial = 'EN_ATTENTE';
  instantaneOuverture: InstantaneIhm | undefined;
  /** Exceptions non interceptées de la page : le scénario échoue s'il y en a (`hooks-ihm.ts`). */
  readonly erreursPage: Array<string> = [];
  readonly pontGoogle = new PontFauxGoogle(this.banc.google, this.banc.temps);
  readonly pontDrive = new PontFauxDrive({
    google: this.banc.google,
    appareil: () => IDENTIFIANTS_APPAREILS[this.appareilIhm],
    compte: () => this.pontGoogle.compteConnecte(),
  });
  #dossierProfil: string | undefined;
  #contexte: BrowserContext | undefined;
  /** Onglets ouverts du contexte : `pages[0]` est le premier onglet, le seul des scénarios à un onglet (US-018). */
  #pages: Array<Page> = [];
  /** Nombre d'événements `load` de chaque onglet depuis sa création, et valeur relevée par `marquerChargements`. */
  readonly #chargements = new Map<Page, number>();
  readonly #marques = new Map<Page, number>();
  #horsLigne = false;
  #instantFixe: Instant | undefined;

  /**
   * Page courante (le premier onglet), après le démarrage initial du navigateur s'il n'a pas eu lieu (premier besoin de
   * la page) ; erreur si aucune page n'est ouverte (onglet fermé, navigateur neuf jamais ouvert).
   */
  async pageCourante(): Promise<Page> {
    await this.assurerDemarrageInitial();
    return this.#pageOuverte();
  }

  #pageOuverte(): Page {
    const [premiere] = this.#pages;
    if (premiere === undefined) throw new Error('Aucune page ouverte dans le navigateur');
    return premiere;
  }

  /** Les onglets ouverts, dans l'ordre d'ouverture (US-031, S16 à S16c). */
  onglets(): ReadonlyArray<Page> {
    return this.#pages.filter((page) => !page.isClosed());
  }

  /** Le second onglet, ouvert par `ouvrirSecondOnglet` ; erreur s'il n'existe pas. */
  ongletSecond(): Page {
    const [, second] = this.onglets();
    if (second === undefined) throw new Error("Le second onglet n'est pas ouvert");
    return second;
  }

  /** Relève le nombre de chargements de chaque onglet : à prendre **avant** le geste qui doit en provoquer un. */
  marquerChargements(): void {
    this.#marques.clear();
    for (const page of this.onglets()) this.#marques.set(page, this.#chargements.get(page) ?? 0);
  }

  /** Chargements (ouverture, rechargement) de l'onglet depuis `marquerChargements` ; 0 si aucune marque. */
  chargementsDepuisLaMarque(page: Page): number {
    return (this.#chargements.get(page) ?? 0) - (this.#marques.get(page) ?? 0);
  }

  aUnePage(): boolean {
    return this.onglets().length > 0;
  }

  /**
   * Ouvre l'application dans un second onglet du même contexte persistant : il partage la base locale (IndexedDB) et
   * le service worker du premier, et n'a ni session ni jeton en mémoire (DAT §4.1.6). Le premier onglet est conservé.
   */
  async ouvrirSecondOnglet(): Promise<Page> {
    const second = await this.#creerPage(await this.contexte());
    await second.goto(`${ORIGINE_IHM}/`);
    return second;
  }

  /** « Nous sommes le … » : la page voit cette date (immobile) dès sa première navigation. */
  async fixerHeure(instant: Instant): Promise<void> {
    this.#instantFixe = instant;
    await this.#contexte?.clock.setFixedTime(new Date(instant));
  }

  /** Coupe ou rétablit le réseau du navigateur ; l'état survit à la fermeture du navigateur. */
  async definirHorsLigne(horsLigne: boolean): Promise<void> {
    this.#horsLigne = horsLigne;
    await this.#contexte?.setOffline(horsLigne);
  }

  estHorsLigne(): boolean {
    return this.#horsLigne;
  }

  /**
   * Navigue vers l'application. Les réponses du Drive sont retenues le temps de lire ce que la page affiche
   * (`instantaneOuverture`), puis libérées. Hors ligne et jamais chargée, la navigation échoue : la page affiche
   * alors la page d'erreur du navigateur (aucune exception).
   */
  async ouvrirApplication(url = `${ORIGINE_IHM}/`): Promise<void> {
    const page = await this.#nouvelleUniquePage();
    this.pontDrive.retenir();
    try {
      const chargee = await page.goto(url).then(
        () => true,
        () => false,
      );
      if (chargee) await this.#verifierOuvertureHorsLigne(page);
      this.instantaneOuverture = chargee ? await this.#instantane(page) : PAGE_NON_CHARGEE;
    } finally {
      this.pontDrive.liberer();
    }
  }

  /**
   * Premier besoin de la page (ST-US-018 v0.4 §12.2 n° 2) : le navigateur ouvre l'application en ligne, Google accorde
   * l'accès au compte, l'utilisateur se connecte et l'indicateur passe à `SYN-OK` ; le service worker est alors
   * installé et actif, prêt pour une ouverture sans réseau. Sans effet si le navigateur est neuf (« jamais ouverte »).
   */
  async assurerDemarrageInitial(): Promise<void> {
    if (this.demarrageInitial !== 'EN_ATTENTE') return;
    this.demarrageInitial = 'FAIT';
    await this.ouvrirApplication();
    const page = this.#pageOuverte();
    await boutonConnexion(page).click();
    await this.attendreIndicateur('SYN-OK');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
  }

  /** Étape qui pilote le navigateur : l'appareil visé est celui du navigateur, l'autre est simulé par le banc. */
  exigerAppareil(nom: NomAppareil): void {
    if (nom !== this.appareilIhm) {
      throw new Error(
        `Le ${nom} est simulé par le banc : cette étape pilote le navigateur du ${this.appareilIhm}`,
      );
    }
  }

  /**
   * Attend la fin de ce que les pages entreprenaient : appels du pont répondus, indicateur de chaque onglet ni hors
   * ligne, ni en cours, ni en attente de départ (10 s au plus). Sans page, il n'y a rien à attendre.
   */
  async attendreRepos(): Promise<void> {
    await expect
      .poll(async () => this.pontDrive.appelsEnCours() === 0 && (await this.#ongletsStables()), {
        timeout: DELAI_SYNCHRONISATION_MS,
      })
      .toBe(true);
  }

  async #ongletsStables(): Promise<boolean> {
    const etats = await Promise.all(this.onglets().map((page) => etatIndicateur(page)));
    return etats.every(synchronisationStable);
  }

  /** Attend que l'indicateur de synchronisation affiche ce code (10 s au plus). */
  async attendreIndicateur(code: string): Promise<void> {
    await expect
      .poll(() => etatIndicateur(this.#pageOuverte()), { timeout: DELAI_SYNCHRONISATION_MS })
      .toBe(code);
  }

  /** Ferme les pages (onglets) ; le contexte, donc les données du navigateur, reste. */
  async fermerPage(): Promise<void> {
    await Promise.all(this.#pages.map((page) => page.close()));
    this.#pages = [];
  }

  /** Ferme le navigateur : le contexte est recréé sur le même dossier de profil à la prochaine ouverture. */
  async fermerNavigateur(): Promise<void> {
    await this.#contexte?.close();
    this.#contexte = undefined;
    this.#pages = [];
  }

  /** Navigateur neuf : aucun profil, aucune donnée, aucun service worker (« jamais ouverte »). */
  async reinitialiserNavigateur(): Promise<void> {
    await this.fermerNavigateur();
    await this.#supprimerProfil();
  }

  /**
   * « Effacer les données du navigateur » : IndexedDB, caches, service workers et cookies de l'origine de l'application
   * sont supprimés, page fermée (aucune connexion ouverte ne retient la suppression).
   */
  async effacerDonneesNavigateur(): Promise<void> {
    const contexte = await this.contexte();
    await this.fermerPage();
    const page = await contexte.newPage();
    const session = await contexte.newCDPSession(page);
    await session.send('Storage.clearDataForOrigin', { origin: ORIGINE_IHM, storageTypes: 'all' });
    await contexte.clearCookies();
    await page.close();
  }

  /** Fin de scénario. */
  async arreter(): Promise<void> {
    this.pontDrive.liberer();
    await this.fermerNavigateur();
    await this.#supprimerProfil();
  }

  /** Contexte persistant du profil courant, créé au premier besoin (ponts exposés avant toute page). */
  async contexte(): Promise<BrowserContext> {
    if (this.#contexte !== undefined) return this.#contexte;
    this.#dossierProfil ??= await mkdtemp(join(tmpdir(), 'donejuan-ihm-'));
    const executable = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'];
    const contexte = await chromium.launchPersistentContext(this.#dossierProfil, {
      viewport: VIEWPORTS[this.appareilIhm],
      serviceWorkers: 'allow',
      ...(executable === undefined ? {} : { executablePath: executable }),
    });
    await contexte.exposeBinding('donejuanFauxDrive', (_source, methode: string, json: string) =>
      this.pontDrive.repondre(methode, json),
    );
    await contexte.exposeBinding('donejuanFauxGoogle', (_source, methode: string, json: string) =>
      this.pontGoogle.repondre(methode, json),
    );
    await contexte.setOffline(this.#horsLigne);
    if (this.#instantFixe !== undefined) {
      await contexte.clock.setFixedTime(new Date(this.#instantFixe));
    }
    this.#contexte = contexte;
    return contexte;
  }

  /** « Ouvrir l'application » : l'onglet remplace ceux déjà ouverts (comme au rang 12, un seul onglet). */
  async #nouvelleUniquePage(): Promise<Page> {
    const contexte = await this.contexte();
    await this.fermerPage();
    return this.#creerPage(contexte);
  }

  async #creerPage(contexte: BrowserContext): Promise<Page> {
    const page = await contexte.newPage();
    page.setDefaultTimeout(DELAI_ATTENTE_MS);
    page.on('pageerror', (erreur) => {
      this.erreursPage.push(erreur.message);
    });
    page.on('load', () => {
      this.#chargements.set(page, (this.#chargements.get(page) ?? 0) + 1);
    });
    this.#pages.push(page);
    return page;
  }

  /**
   * Une application qui s'ouvre sans réseau a été servie par le service worker (rien d'autre ne peut la servir) et sa
   * page voit bien le réseau coupé : sans cela, « sans réseau » ne serait qu'une intention du scénario.
   */
  async #verifierOuvertureHorsLigne(page: Page): Promise<void> {
    if (!this.#horsLigne) return;
    const etat = await page.evaluate(() => ({
      enLigne: navigator.onLine,
      controleeParLeServiceWorker: navigator.serviceWorker.controller !== null,
    }));
    expect(
      etat,
      'La page ouverte sans réseau doit voir le réseau coupé et être servie par le service worker',
    ).toEqual({
      enLigne: false,
      controleeParLeServiceWorker: true,
    });
  }

  /**
   * Relève ce que la page affiche une fois le chargement terminé : l'ouverture de l'application (lecture de la base
   * locale) est alors finie, un écran de connexion est définitif et la liste des tâches, si l'espace est ouvert, est
   * attendue. Aucune réponse du Drive n'est attendue (la porte est fermée).
   */
  async #instantane(page: Page): Promise<InstantaneIhm> {
    await page.waitForLoadState('networkidle');
    if ((await ecranAffiche(page)) === 'APPLICATION') {
      await expect
        .poll(async () => (await intitulesAffiches(page)).length, { timeout: DELAI_ATTENTE_MS })
        .toBeGreaterThan(0)
        .catch(() => undefined);
    }
    return { ecran: await ecranAffiche(page), intitulesTaches: await intitulesAffiches(page) };
  }

  async #supprimerProfil(): Promise<void> {
    if (this.#dossierProfil === undefined) return;
    await rm(this.#dossierProfil, { recursive: true, force: true });
    this.#dossierProfil = undefined;
  }
}

setWorldConstructor(MondeIhm);
