/**
 * Étapes du compte (glossaire d'étapes §1, §2, §6 ; ST-US-022 §12.1 n° 1, 2, 7 à 14, 19 à 22, 24, 27, 28, 31 à 38).
 */
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { succes } from '@src/commun/domaine/resultat';
import { REPRISE_ACCUEIL } from '@src/compte/application/ports/memoire-redirection';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import {
  construireSectionCompte,
  type ActionCompte,
} from '@src/compte/presentation/modeles-de-vue/section-compte';
import type { AppareilSimule, NomAppareil } from '../../support/banc/appareil-simule';
import {
  commandeSuppression,
  connecter,
  dernierEchecConnexion,
  ecranConnexionDe,
  espaceExiste,
  modificationsEnAttenteDansEspace,
  nomEspaceDuCompte,
  racineDe,
  seConnecter,
  type Refus,
} from '../../support/compte/etapes-compte';
import { convertirAppareil, FRAGMENT_APPAREIL } from '../../support/conversions';
import { creerObjectifsEnAttente } from '../../support/objectifs';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAction, etapeAssertion, etapeContexte } from '../../support/prefixes';

/** Libellés des autorisations annoncées (CA-8) : `openid` et `email` ↦ identification du compte. */
const AUTORISATION: Readonly<Record<string, string>> = {
  openid: 'identification du compte',
  email: 'identification du compte',
  'https://www.googleapis.com/auth/drive.file': "accès aux fichiers de l'application dans le Drive",
};

/** Libellés des actions de la section « Compte » (ECR-011). */
const LIBELLE_ACTION_COMPTE: Readonly<Record<ActionCompte, string>> = {
  SE_DECONNECTER: 'Se déconnecter',
  SUPPRIMER_DONNEES: 'Supprimer les données de cet appareil',
};

// ---------------------------------------------------------------- Connexion (n° 1, 2, 7 à 14, 19)

Given(
  "(que )l'utilisateur est connecté avec le compte {string} sur le {appareil}",
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
    await connecter(this, this.banc.appareil(nomAppareil), nomCompte);
  },
);

// Rang 1 : connexion des deux appareils ; l'échange jusqu'au repos s'ajoute au rang 3 (ST-US-017).
Given(
  "(que )l'utilisateur utilise le compte {string} sur le smartphone et sur le PC, tous deux à jour",
  async function (this: MondeDoneJuan, nomCompte: string) {
    await connecter(this, this.banc.appareil('smartphone'), nomCompte);
    await connecter(this, this.banc.appareil('pc'), nomCompte);
  },
);

When(
  "l'utilisateur se connecte avec le compte {string} sur le {appareil}",
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    const resultat = await seConnecter(this, appareil, nomCompte);
    this.resultats.set(appareil.nom, resultat);
    assert.ok(
      resultat.ok,
      `Connexion du compte ${nomCompte} refusée : ${JSON.stringify(resultat)}`,
    );
  },
);

const tenterDeSeConnecter = (suffixe: string, refus: Refus | undefined): void => {
  When(
    `l'utilisateur tente de se connecter avec le compte {string} sur le {appareil}${suffixe}`,
    async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
      const appareil = this.banc.appareil(nomAppareil);
      this.resultats.set(appareil.nom, await seConnecter(this, appareil, nomCompte, refus));
    },
  );
};
tenterDeSeConnecter('', undefined);
tenterDeSeConnecter(' et annule la connexion', 'annule la connexion');
tenterDeSeConnecter(' et refuse les autorisations demandées', 'refuse les autorisations demandées');

Then('la connexion échoue avec le motif {string}', function (this: MondeDoneJuan, motif: string) {
  const echecs = this.banc.appareils().map((a) => dernierEchecConnexion(this, a));
  assert.ok(
    echecs.includes(motif as never),
    `Aucune connexion en échec ${motif} : ${String(echecs)}`,
  );
});

etapeAssertion(/^l'utilisateur peut réessayer$/, ({ monde, appareil }) => {
  assert.equal(ecranConnexionDe(monde, appareil).actionActive, true);
});

etapeAssertion(
  /^seule l'invitation à se connecter à Done Juan avec un compte Google est proposée$/,
  async ({ monde, appareil }) => {
    assert.deepEqual(await racineDe(appareil), { ecran: 'CONNEXION' });
    assert.ok(
      ['CONTINUER_AVEC_GOOGLE', 'REESSAYER'].includes(ecranConnexionDe(monde, appareil).action),
    );
  },
);

// n° 11 : racine CONNEXION, aucun modèle de vue de données n'est construit par l'application de l'appareil.
etapeAssertion(
  /^(?:aucune autre fonction n'est accessible|aucune donnée n'est affichée)$/,
  async ({ appareil }) => {
    assert.deepEqual(await racineDe(appareil), { ecran: 'CONNEXION' });
    assert.equal(appareil.application.espace(), undefined);
  },
);

Then(
  "sur le {appareil}, le message d'erreur {string} explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil, code: string) {
    const message = ecranConnexionDe(this, this.banc.appareil(nomAppareil)).message;
    assert.equal(message?.code, code);
    assert.match(message.texte, /Une connexion à un compte Google est nécessaire/);
  },
);

Then(
  "aucune donnée n'est créée sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const application = await this.banc.appareil(nomAppareil).assurerOuverte();
    assert.equal(await application.espaces.existeUnEspace(), false);
    assert.equal(await application.memoireSession.lire(), undefined);
  },
);

Then(
  "les autorisations demandées au compte Google sont exactement : identification du compte, accès aux fichiers de l'application dans le Drive",
  function (this: MondeDoneJuan) {
    const demandees = this.banc
      .appareils()
      .flatMap((a) => a.fournisseur.demandes.filter((d) => d.mode === 'CONNEXION'));
    assert.ok(demandees.length > 0, 'Aucune demande de connexion observée');
    demandees.forEach((d) => {
      assert.deepEqual(d.portees, PORTEES_LOT_1);
      assert.deepEqual(
        [...new Set(d.portees.map((p) => AUTORISATION[p]))],
        ['identification du compte', "accès aux fichiers de l'application dans le Drive"],
      );
    });
  },
);

Then("aucun accès à l'agenda n'est demandé", function (this: MondeDoneJuan) {
  const portees = this.banc
    .appareils()
    .flatMap((a) => a.fournisseur.demandes.flatMap((d) => d.portees));
  assert.equal(portees.filter((p) => p.includes('calendar')).length, 0);
});

// ---------------------------------------------------------------- Déconnexion (n° 20 à 22, 27)

const deconnecter = async (appareil: AppareilSimule) => {
  const application = await appareil.assurerOuverte();
  const evaluation = await application.seDeconnecter.evaluer();
  if (evaluation.ok && evaluation.valeur.type === 'SANS_CONFIRMATION') {
    await application.seDeconnecter.executer();
  }
  return evaluation;
};

etapeAction(/^l'utilisateur se déconnecte$/, async ({ appareil }) => {
  const evaluation = await deconnecter(appareil);
  if (evaluation.ok && evaluation.valeur.type === 'CONFIRMATION_REQUISE') {
    await appareil.application.seDeconnecter.executer();
  }
  return evaluation;
});

etapeAction(/^l'utilisateur demande à se déconnecter$/, async ({ monde, appareil }) => {
  const evaluation = await deconnecter(appareil);
  if (evaluation.ok && evaluation.valeur.type === 'CONFIRMATION_REQUISE') {
    monde.commandesEnAttente.set(appareil.nom, {
      description: 'Se déconnecter',
      confirmation: evaluation.valeur.confirmation,
      executer: () => appareil.application.seDeconnecter.executer(),
    });
  }
  return evaluation;
});

etapeAssertion(/^l'utilisateur est déconnecté sans confirmation$/, async ({ monde, appareil }) => {
  assert.deepEqual(monde.resultats.get(appareil.nom), succes({ type: 'SANS_CONFIRMATION' }));
  assert.deepEqual(await racineDe(appareil), { ecran: 'CONNEXION' });
});

Then(
  'les actions de compte proposées sur le {appareil} sont exactement {string} et {string}',
  async function (
    this: MondeDoneJuan,
    nomAppareil: NomAppareil,
    premiere: string,
    seconde: string,
  ) {
    const etat = (await this.banc.appareil(nomAppareil).assurerOuverte()).session.etat();
    if (etat.type !== 'OUVERTE') assert.fail('Aucune session ouverte : pas de section « Compte »');
    const actions = construireSectionCompte({ adresse: etat.identite.adresse }).actions;
    assert.deepEqual(
      actions.map((a) => LIBELLE_ACTION_COMPTE[a]),
      [premiere, seconde],
    );
  },
);

// ---------------------------------------------------------------- Suppression des données de l'appareil (n° 24, 28, 31)

etapeAction(
  /^l'utilisateur demande la suppression des données de cet appareil$/,
  async ({ monde, appareil }) => {
    const application = await appareil.assurerOuverte();
    const evaluation = await application.supprimerDonnees.evaluer();
    if (evaluation.ok && evaluation.valeur.type === 'CONFIRMATION_REQUISE') {
      monde.commandesEnAttente.set(appareil.nom, commandeSuppression(application));
    }
    return evaluation;
  },
);

etapeContexte(/^l'utilisateur a supprimé les données de cet appareil$/, async ({ appareil }) => {
  const application = await appareil.assurerOuverte();
  const evaluation = await application.supprimerDonnees.evaluer();
  assert.ok(evaluation.ok, `Suppression impossible : ${JSON.stringify(evaluation)}`);
  const resultat = await application.supprimerDonnees.confirmer();
  assert.deepEqual(resultat, succes({ type: 'SUPPRIMEES' }));
});

Then(
  'les données du compte {string} sont toujours présentes sur le {appareil}',
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
    await modificationsEnAttenteDansEspace(this, this.banc.appareil(nomAppareil), nomCompte);
  },
);

// Pluriel « modification(s) » : expression régulière (conventions.md §11.6).
Then(
  new RegExp(
    `^les données du compte "([^"]*)" sont toujours présentes sur le (${FRAGMENT_APPAREIL}), y compris (\\d+) modifications?(?:\\(s\\))? en attente$`,
  ),
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: string, n: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    assert.equal(await modificationsEnAttenteDansEspace(this, appareil, nomCompte), Number(n));
  },
);

Then(
  'les données du compte {string} ne sont plus présentes sur le {appareil}',
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
    const nomBase = await nomEspaceDuCompte(this, nomCompte);
    assert.equal(
      await espaceExiste(this.banc.appareil(nomAppareil), nomBase),
      false,
      `Espace du compte ${nomCompte} encore présent`,
    );
  },
);

// ---------------------------------------------------------------- Accès retiré ou expiré (n° 32 à 38)

Given(
  "(que )l'accès au compte Google {string} a été retiré sur le {appareil}",
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    this.banc.google.retirerAcces(nomCompte);
    appareil.fournisseur.retirerAcces();
    await appareil.assurerOuverte();
    appareil.placerJetonNonEchu();
    assert.equal(await appareil.application.signalerRefus.executer(), 'PERDU');
  },
);

When(
  "l'accès au compte Google {string} est retiré depuis le compte Google",
  function (this: MondeDoneJuan, nomCompte: string) {
    const compte = this.banc.google.identite(nomCompte).compte;
    this.banc.google.retirerAcces(nomCompte);
    this.banc
      .appareils()
      .filter((a) => a.fournisseur.compteAccorde() === compte)
      .forEach((a) => {
        a.fournisseur.retirerAcces();
      });
  },
);

const expirerSession = function (this: MondeDoneJuan, nomAppareil: NomAppareil): void {
  this.banc.appareil(nomAppareil).expirerSessionGoogle();
};
Given('(que )la session Google du (navigateur du ){appareil} a expiré', expirerSession);
When('la session Google du (navigateur du ){appareil} expire', expirerSession);
Given(
  '(que )la session Google du (navigateur du ){appareil} est active',
  function (this: MondeDoneJuan, _appareil: NomAppareil) {
    // Rien : la session Google est active par défaut (ST-US-022 §12.1 n° 34).
  },
);

Given(
  "(que )la redirection silencieuse vers Google échoue à l'ouverture sur le {appareil}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    appareil.fournisseur.expirerSession();
    appareil.retourDiffere = false;
  },
);

/** Depuis l'ouverture : ni écran de connexion, ni connexion, ni geste, ni saisie (n° 36, 38). */
const verifierAucuneConnexionDemandee = async (appareil: AppareilSimule): Promise<void> => {
  assert.notDeepEqual(await racineDe(appareil), { ecran: 'CONNEXION' }, 'Écran de connexion');
  assert.equal(appareil.depuisOuverture.ecranConnexion, false, 'Écran de connexion affiché');
  assert.deepEqual(appareil.demandesInteractivesDepuisOuverture(), []);
};

etapeAction(/^l'accès à Google est renouvelé sans saisie$/, async ({ appareil }) => {
  assert.ok(appareil.retourDiffere, `Aucune redirection en attente sur le ${appareil.nom}`);
  await verifierAucuneConnexionDemandee(appareil);
  const issue = await appareil.livrerRetourDiffere();
  assert.deepEqual(
    issue.type === 'SESSION_OUVERTE' ? issue.acces : issue.type,
    'VALIDE',
    'Accès non renouvelé',
  );
});

etapeAction(/^l'utilisateur fait le geste de reconnexion$/, async ({ monde, appareil }) => {
  const application = await appareil.assurerOuverte();
  return monde.banc.executerEnLaissantPasserLeTemps(
    application.reprendreSession.executer(REPRISE_ACCUEIL),
  );
});

// Q-BRU-2 (ST v0.3.1 §12.3) : l'utilisateur consent de nouveau (réaccord par Google simulé), puis le geste.
etapeAction(
  /^l'utilisateur se reconnecte avec le compte "([^"]*)"$/,
  async ({ monde, appareil }, nomCompte) => {
    const nom = String(nomCompte);
    monde.banc.google.accorderAcces(nom);
    appareil.fournisseur.accorder(monde.banc.google.identite(nom));
    const application = await appareil.assurerOuverte();
    return monde.banc.executerEnLaissantPasserLeTemps(
      application.reprendreSession.executer(REPRISE_ACCUEIL),
    );
  },
);

// La racine ATTENTE_GOOGLE (SYN-REDIRECTION) n'est pas une demande de connexion (n° 38, DEC-038).
etapeAssertion(
  /^aucune connexion n'est demandée(?: avant d'afficher les données)?$/,
  async ({ appareil }) => {
    await verifierAucuneConnexionDemandee(appareil);
  },
);

// ---------------------------------------------------------------- Données conservées avec des modifications en attente (n° 29, rang 2)

// Connexion du compte, hors ligne, n objectifs créés, puis déconnexion confirmée ; le réseau est rétabli ensuite.
Given(
  new RegExp(
    `^(?:que )?les données du compte "([^"]*)" sont conservées sur le (${FRAGMENT_APPAREIL}), avec (\\d+) modifications?(?:\\(s\\))? en attente$`,
  ),
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: string, n: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    await connecter(this, appareil, nomCompte);
    appareil.reseau.couper();
    await creerObjectifsEnAttente(appareil, Number(n));
    const evaluation = await deconnecter(appareil);
    if (evaluation.ok && evaluation.valeur.type === 'CONFIRMATION_REQUISE') {
      await appareil.application.seDeconnecter.executer();
    }
    appareil.reseau.retablir();
  },
);
