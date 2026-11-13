/**
 * Étapes du compte des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 7 ; ST-US-031 §12.2 n° 7 à 13). Google est simulé par
 * le processus cucumber (`PontFauxGoogle`) : l'utilisateur clique sur « Continuer avec Google » ; le geste de
 * reconnexion est le bouton de l'indicateur `SYN-SESSION`. Fin de session dans un onglet (S16b, S16c) : les gestes sont
 * ceux de la section « Compte » du premier onglet ; le second revient seul à l'écran de connexion, après rechargement.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';
import { LIBELLE_ANNULER } from '@src/commun/presentation/ui/boite-confirmation';
import { libelleActionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { nomEspaceDuCompte } from '../support/compte/etapes-compte';
import type { NomAppareil } from '../support/banc/appareil-simule';
import {
  boutonConnexion,
  dialogueConfirmation,
  ecranAffiche,
  espaceApplication,
  indicateur,
  lignesObjectifs,
  lignesTaches,
} from './support/ecrans-ihm';
import { DELAI_ATTENTE_MS, type MondeIhm } from './support/monde-ihm';

When(
  "l'utilisateur se connecte avec le compte {string} sur le {appareil}",
  async function (this: MondeIhm, compte: string, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    this.pontGoogle.ouvrirSession(compte);
    let page = await this.pageCourante();
    if ((await ecranAffiche(page)) !== 'CONNEXION') {
      await this.ouvrirApplication();
      page = await this.pageCourante();
    }
    await boutonConnexion(page).click();
    await expect(espaceApplication(page)).toBeVisible();
  },
);

When(
  "sur le {appareil}, l'utilisateur fait le geste de reconnexion",
  async function (this: MondeIhm, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await indicateur(page).getByRole('button').click();
  },
);

/** Données du Contexte d'US-031 que le second onglet ne doit plus afficher une fois la session fermée. */
const INTITULES_DU_CONTEXTE = ['Chapitre 1', 'Publier le guide'] as const;

/**
 * Prépare le geste de fin de session : le second onglet affiche des données (sans cela, « aucune donnée n'est
 * affichée » serait vrai d'avance) et le nombre de ses chargements est relevé avant que le geste le fasse recharger.
 */
const preparerFinDeSession = async (monde: MondeIhm): Promise<void> => {
  await expect(lignesTaches(monde.ongletSecond()).first()).toBeVisible();
  monde.marquerChargements();
};

const boutonDeLaSectionCompte = (page: Page, libelle: string) =>
  espaceApplication(page).getByRole('button', { name: libelle, exact: true });

/** Bouton d'action de la boîte de confirmation : celui qui n'est pas « Annuler ». */
const boutonConfirmer = (page: Page) =>
  dialogueConfirmation(page).getByRole('button').filter({ hasNotText: LIBELLE_ANNULER });

/** Le second onglet s'est rechargé (un chargement de plus depuis le geste) : la session a pris fin et il le sait. */
const attendreRechargementDuSecond = async (monde: MondeIhm): Promise<Page> => {
  const second = monde.ongletSecond();
  await expect
    .poll(() => monde.chargementsDepuisLaMarque(second), {
      timeout: DELAI_ATTENTE_MS,
      message: 'Le second onglet ne s’est pas rechargé après la fin de session',
    })
    .toBe(1);
  return second;
};

/** ANO-006 : le premier onglet, celui du geste, quitte lui aussi les données et revient à l'écran de connexion. */
const attendreEcranDeConnexion = async (page: Page): Promise<void> => {
  await expect
    .poll(() => ecranAffiche(page), {
      timeout: DELAI_ATTENTE_MS,
      message: 'Le premier onglet n’est pas revenu à l’écran de connexion',
    })
    .toBe('CONNEXION');
};

When("dans le premier onglet, l'utilisateur se déconnecte", async function (this: MondeIhm) {
  const page = await this.pageCourante();
  await preparerFinDeSession(this);
  await boutonDeLaSectionCompte(page, libelleActionCompte('SE_DECONNECTER')).click();
  // Rien n'est en attente : la déconnexion est menée à son terme sans confirmation CNF-DECONNEXION (si elle s'affichait,
  // la session ne prendrait pas fin et le second onglet ne se rechargerait pas).
  await attendreRechargementDuSecond(this);
  await expect(dialogueConfirmation(page)).toHaveCount(0);
  await attendreEcranDeConnexion(page);
});

When(
  "dans le premier onglet, l'utilisateur demande la suppression des données de cet appareil",
  async function (this: MondeIhm) {
    const page = await this.pageCourante();
    await preparerFinDeSession(this);
    await boutonDeLaSectionCompte(page, libelleActionCompte('SUPPRIMER_DONNEES')).click();
    await expect(dialogueConfirmation(page)).toBeVisible();
  },
);

When("dans le premier onglet, l'utilisateur confirme", async function (this: MondeIhm) {
  const page = await this.pageCourante();
  await boutonConfirmer(page).click();
  await attendreEcranDeConnexion(page);
});

type Onglet = 'premier' | 'second';

/**
 * ANO-004 : l'écran de connexion s'affiche aussi brièvement pendant toute ouverture ; la conclusion n'est tirée qu'après
 * le rechargement du second onglet (un chargement de plus depuis le geste) et la fin de ses échanges. Le premier onglet,
 * lui, ne se recharge pas : il revient seul à l'écran de connexion (ANO-006), attendu par sondage.
 */
const ecranDeConnexionDe = async (monde: MondeIhm, onglet: Onglet): Promise<Page> => {
  if (onglet === 'premier') {
    const page = await monde.pageCourante();
    await attendreEcranDeConnexion(page);
    return page;
  }
  const page = await attendreRechargementDuSecond(monde);
  await page.waitForLoadState('networkidle');
  return page;
};

Then(
  /^dans le (premier|second) onglet, seule l'invitation à se connecter à Done Juan avec un compte Google est proposée$/,
  async function (this: MondeIhm, onglet: Onglet) {
    const page = await ecranDeConnexionDe(this, onglet);
    expect(await ecranAffiche(page)).toBe('CONNEXION');
    await expect(page.getByRole('button')).toHaveCount(1);
    await expect(boutonConnexion(page)).toBeVisible();
  },
);

Then(
  /^dans le (premier|second) onglet, aucune donnée n'est affichée$/,
  async function (this: MondeIhm, onglet: Onglet) {
    const page = onglet === 'premier' ? await this.pageCourante() : this.ongletSecond();
    await expect(espaceApplication(page)).toHaveCount(0);
    await expect(lignesTaches(page)).toHaveCount(0);
    await expect(lignesObjectifs(page)).toHaveCount(0);
    for (const intitule of INTITULES_DU_CONTEXTE) {
      await expect(page.getByText(intitule)).toHaveCount(0);
    }
  },
);

const basesDuNavigateur = async (page: Page): Promise<ReadonlyArray<string | undefined>> =>
  (await page.evaluate(() => indexedDB.databases())).map((base) => base.name);

Then(
  'les données du compte {string} sont toujours présentes sur le {appareil}',
  async function (this: MondeIhm, compte: string, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    const nomBase = await nomEspaceDuCompte(this, compte);
    expect(await basesDuNavigateur(await this.pageCourante())).toContain(nomBase);
  },
);

Then(
  'les données du compte {string} ne sont plus présentes sur le {appareil}',
  async function (this: MondeIhm, compte: string, appareil: NomAppareil) {
    this.exigerAppareil(appareil);
    const nomBase = await nomEspaceDuCompte(this, compte);
    const page = await this.pageCourante();
    // La suppression se termine quand le second onglet a fermé sa connexion (`versionchange`).
    await expect
      .poll(() => basesDuNavigateur(page), { timeout: DELAI_ATTENTE_MS })
      .not.toContain(nomBase);
  },
);
