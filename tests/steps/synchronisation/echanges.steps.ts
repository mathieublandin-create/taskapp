/** Étapes des modifications en attente et des échanges (glossaire d'étapes §1, §3 ; ST-US-022 §12.1 n° 30 ; ST-US-017 §12.1). */
import assert from 'node:assert/strict';
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { FRAGMENT_DATE } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';
import { creerTache } from '../../support/construction-taches';
import { valeurDe } from '../../support/environnement';
import { creerObjectifsEnAttente, objectifsDe, resoudreObjectif } from '../../support/objectifs';
import { etapeAction, etapeAssertion, etapeContexte } from '../../support/prefixes';
import { detailTacheDe } from '../../support/taches';
import {
  creerObjectifAuPasse,
  creerObjectifEnregistre,
  enregistrerDansLeDrive,
  modifierDelaiTacheAuPasse,
  renommerTacheAuPasse,
  verifierNonEnregistre,
  verifierTacheNonEnregistree,
} from '../../support/synchronisation/echanges';

Given(
  "(qu')aucune modification n'est en attente sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const application = await this.banc.appareil(nomAppareil).assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, 0);
  },
);

// n objectifs sont créés, sans dépôt dans le Drive : aucun temps ne passe, la temporisation de 5 s n'échoit pas.
// Pluriel « modification(s) » : expression régulière (conventions.md §11.6).
etapeContexte(
  /^(\d+) modifications?(?:\(s\))? (?:ne sont|n'est) pas encore enregistrées?(?:\(s\))? dans le Drive$/,
  async ({ appareil }, n) => {
    await creerObjectifsEnAttente(appareil, Number(n));
    const application = await appareil.assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, Number(n));
  },
);

// ---------------------------------------------------------------- Échanges avec le Drive (ST-US-017 §12.1 n° 2 à 4, 15, 16)

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;

When('les deux appareils échangent leurs modifications', async function (this: MondeDoneJuan) {
  await this.banc.synchroniserJusquAuRepos();
});

// H-5 : un seul cycle complet, joué avant une coupure déclarée du même appareil.
When(
  'le {appareil} échange ses modifications avec le Drive',
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    await appareil.assurerOuverte();
    await appareil.echangerAvecLeDrive();
  },
);

When(
  'le {appareil} enregistre ses modifications dans le Drive',
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    await enregistrerDansLeDrive(this.banc.appareil(nomAppareil));
  },
);

etapeAction(/^l'utilisateur enregistre ses modifications dans le Drive$/, async ({ appareil }) => {
  await enregistrerDansLeDrive(appareil);
});

etapeContexte(
  new RegExp(
    `^l'utilisateur a créé un objectif ${TEXTE} de délai ${DATE}, enregistré dans le Drive$`,
  ),
  async ({ monde, appareil }, intitule, delai) => {
    await creerObjectifEnregistre(monde, appareil, String(intitule), String(delai));
  },
);

etapeContexte(
  new RegExp(
    `^l'utilisateur a créé un objectif ${TEXTE} sans délai(, pas encore enregistré dans le Drive)?$`,
  ),
  async ({ monde, appareil }, intitule, nonEnregistre) => {
    await creerObjectifAuPasse(monde, appareil, String(intitule));
    if (nonEnregistre !== undefined) await verifierNonEnregistre(monde, appareil, String(intitule));
  },
);

// ---------------------------------------------------------------- Opérations au passé sur une tâche (ST-US-017 §12.1 n° 16)

etapeContexte(
  new RegExp(
    `^l'utilisateur a renommé la tâche ${TEXTE} en ${TEXTE}(, pas encore enregistré dans le Drive)?$`,
  ),
  async ({ monde, appareil }, intitule, nouveau, nonEnregistre) => {
    await renommerTacheAuPasse(monde, appareil, String(intitule), String(nouveau));
    if (nonEnregistre !== undefined) {
      await verifierTacheNonEnregistree(monde, appareil, String(nouveau));
    }
  },
);

etapeContexte(
  new RegExp(
    `^l'utilisateur a modifié le délai de la tâche ${TEXTE} en ${DATE}(, pas encore enregistré dans le Drive)?$`,
  ),
  async ({ monde, appareil }, intitule, delai, nonEnregistre) => {
    await modifierDelaiTacheAuPasse(monde, appareil, String(intitule), String(delai));
    if (nonEnregistre !== undefined) {
      await verifierTacheNonEnregistree(monde, appareil, String(intitule));
    }
  },
);

// ---------------------------------------------------------------- Modifications d'une autre ouverture (n° 17)

const MODIFICATIONS_FIXEES = 3;

/**
 * Opérations fixées (ST-US-017 §12.1 n° 17) : création de l'objectif « Écrire l'introduction », création de la
 * tâche « Relire », renommée « Relire le chapitre » et de délai 2026-12-01 ; puis dépôt dans le Drive.
 */
etapeContexte(
  /^(\d+) modifications? ont été enregistrées dans le Drive depuis la dernière ouverture du (?:smartphone|PC)$/,
  async ({ monde, appareil }, n) => {
    assert.equal(Number(n), MODIFICATIONS_FIXEES, 'Seules 3 modifications sont prévues');
    await creerObjectifAuPasse(monde, appareil, "Écrire l'introduction");
    const relire = await creerTache(
      { monde, appareil },
      { intitule: 'Relire', delai: '2026-11-30', estimationMinutes: 60, objectifs: [] },
    );
    assert.ok(relire.ok, `Création de « Relire » refusée : ${JSON.stringify(relire)}`);
    await renommerTacheAuPasse(monde, appareil, 'Relire', 'Relire le chapitre');
    await modifierDelaiTacheAuPasse(monde, appareil, 'Relire le chapitre', '2026-12-01');
    assert.equal(await appareil.cycle.deposerMaintenant(), 'TERMINE', 'Dépôt dans le Drive refusé');
  },
);

etapeAssertion(/^les (\d+) modifications sont intégrées$/, async ({ monde, appareil }, n) => {
  assert.equal(Number(n), MODIFICATIONS_FIXEES, 'Seules 3 modifications sont prévues');
  await resoudreObjectif(monde, appareil, "Écrire l'introduction");
  const detail = await detailTacheDe(monde, appareil, 'Relire le chapitre');
  assert.equal(detail.delai.date, '2026-12-01');
});

// ---------------------------------------------------------------- Objectifs après échange (ST-US-018 §12.1 n° 7)

etapeAssertion(
  new RegExp(`^après échange, il existe (\\d+) objectifs?(?:\\(s\\))? d'intitulé ${TEXTE}$`),
  async ({ monde, appareil }, nombre, intitule) => {
    await monde.banc.synchroniserJusquAuRepos();
    const objectifs = valeurDe(await (await objectifsDe(appareil)).consulterObjectifs.executer());
    assert.equal(objectifs.objectifs.filter((o) => o.intitule === intitule).length, Number(nombre));
  },
);
