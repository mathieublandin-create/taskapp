/**
 * Étapes du compte (glossaire d'étapes §1, §2, §6 ; ST-US-022 §12.1 n° 1, 7 à 14, 19 à 22, 28).
 */
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { succes } from '@src/commun/domaine/resultat';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { ENV_BANC, type AppareilSimule } from '../../support/banc/appareil-simule';
import {
  dernierEchecConnexion,
  ecranConnexionDe,
  racineDe,
  seConnecter,
  type Refus,
} from '../../support/compte/etapes-compte';
import { convertirAppareil } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAction, etapeAssertion } from '../../support/prefixes';

const APPAREIL = '(smartphone|PC)';

/** Libellés des autorisations annoncées (CA-8) : `openid` et `email` ↦ identification du compte. */
const AUTORISATION: Readonly<Record<string, string>> = {
  openid: 'identification du compte',
  email: 'identification du compte',
  'https://www.googleapis.com/auth/drive.file': "accès aux fichiers de l'application dans le Drive",
};

Given(
  new RegExp(`^(?:que )?l'utilisateur est connecté avec le compte "([A-Z])" sur le ${APPAREIL}$`),
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    appareil.fournisseur.sessionGoogle(this.banc.google.identite(nomCompte));
    const resultat = await seConnecter(this, appareil, nomCompte);
    assert.ok(
      resultat.ok,
      `Connexion du compte ${nomCompte} impossible : ${JSON.stringify(resultat)}`,
    );
  },
);

When(
  new RegExp(`^l'utilisateur se connecte avec le compte "([A-Z])" sur le ${APPAREIL}$`),
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const resultat = await seConnecter(this, appareil, nomCompte);
    this.resultats.set(appareil.nom, resultat);
    assert.ok(
      resultat.ok,
      `Connexion du compte ${nomCompte} refusée : ${JSON.stringify(resultat)}`,
    );
  },
);

When(
  new RegExp(
    `^l'utilisateur tente de se connecter avec le compte "([A-Z])" sur le ${APPAREIL}(?: et (annule la connexion|refuse les autorisations demandées))?$`,
  ),
  async function (
    this: MondeDoneJuan,
    nomCompte: string,
    nomAppareil: string,
    refus: Refus | undefined,
  ) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    this.resultats.set(appareil.nom, await seConnecter(this, appareil, nomCompte, refus));
  },
);

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

etapeAssertion(/^aucune autre fonction n'est accessible$/, async ({ appareil }) => {
  assert.deepEqual(await racineDe(appareil), { ecran: 'CONNEXION' });
  assert.equal(appareil.application.espace(), undefined);
});

// Groupe capturant après le préfixe : définie directement (etapeAssertion ne transmet pas de paramètre).
Then(
  new RegExp(
    `^sur le ${APPAREIL}, le message d'erreur "(ERR-\\d{3})" explique qu'une connexion à un compte Google est nécessaire pour utiliser l'application$`,
  ),
  function (this: MondeDoneJuan, nomAppareil: string, code: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const message = ecranConnexionDe(this, appareil).message;
    assert.equal(message?.code, code);
    assert.match(message.texte, /Une connexion à un compte Google est nécessaire/);
  },
);

Then(
  new RegExp(`^aucune donnée n'est créée sur le ${APPAREIL}$`),
  async function (this: MondeDoneJuan, nomAppareil: string) {
    const application = await this.banc.appareil(convertirAppareil(nomAppareil)).assurerOuverte();
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
  new RegExp(`^les données du compte "([A-Z])" sont toujours présentes sur le ${APPAREIL}$`),
  async function (this: MondeDoneJuan, nomCompte: string, nomAppareil: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const nomBase = await nomEspace(ENV_BANC, this.banc.google.identite(nomCompte).compte);
    const bases = (await appareil.fabrique.databases()).map((b) => b.name);
    assert.ok(bases.includes(nomBase), `Espace du compte ${nomCompte} absent du ${appareil.nom}`);
    const espace = await DepotLocalDexie.ouvrirEspace({
      nomBase,
      fabrique: appareil.fabrique,
      generateur: { genererUuidV7: () => assert.fail('espace recréé') },
    });
    assert.ok(espace.ok && (await espace.valeur.lire()).ok);
    espace.valeur.fermer();
  },
);
