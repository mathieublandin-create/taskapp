/**
 * Modifications non retenues (glossaire d'étapes §1, §5, §6, §8 ; ST-US-017 v0.5 §12.5 n° N1 à N6) : la liste est celle
 * que l'interface affiche, lue dans la vue du contrôleur de l'appareil une fois les cycles terminés.
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import type { InformationSignalee } from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { convertirEcart } from '../../support/conversions';
import { creerTache } from '../../support/construction-taches';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAction, etapeAssertion, etapeContexte } from '../../support/prefixes';
import {
  modifierDelaiTacheAuPasse,
  renommerTacheAuPasse,
} from '../../support/synchronisation/echanges';
import { existeUneTacheIntitulee } from '../../support/taches';
import {
  convertirLigne,
  correspond,
  type LigneAttendue,
} from '../../support/synchronisation/valeurs-non-retenues';

const TEXTE = '"([^"]*)"';
const SUJET = "(l'intitulé|le délai)";
const ECART_ENTRE_APPAREILS = convertirEcart('10 minutes');
const DELAI_DE_DEPART = '2026-11-30';
const DELAI_DU_PC = '2026-12-01';
const DELAI_DU_SMARTPHONE = '2026-12-05';
const ESTIMATION_DE_DEPART = 60;

const informationDe = (sujet: string): InformationSignalee =>
  sujet === 'le délai' ? 'DELAI' : 'INTITULE';

/** Lignes `ALR-009` à `ALR-011` non lues de la section « À lire », sous la forme du tableau du glossaire. */
const lignesDe = async (appareil: AppareilSimule): Promise<ReadonlyArray<LigneAttendue>> =>
  ((await appareil.vueAffichee()).nonRetenues?.lignes ?? []).map((ligne) => ({
    element: ligne.element,
    information: ligne.information,
    valeurNonRetenue: ligne.valeurNonRetenue,
    valeurConservee: ligne.valeurConservee,
  }));

/** Lignes `ALR-014`, groupées sous `ALR-008` : leur valeur conservée est toujours « données effacées ». */
const lignesEffaceesDe = async (appareil: AppareilSimule): Promise<ReadonlyArray<LigneAttendue>> =>
  ((await appareil.vueAffichee()).nonRetenues?.donneesEffacees?.lignes ?? []).map((ligne) => ({
    element: ligne.element,
    information: ligne.information,
    valeurNonRetenue: ligne.valeurNonRetenue,
    valeurConservee: { type: 'DONNEES_EFFACEES' },
  }));

// ---------------------------------------------------------------- Assertions (N1 à N3, N5)

etapeAssertion(
  /^la liste des modifications non retenues contient :$/,
  async ({ appareil }, tableau) => {
    const presentes = [...(await lignesDe(appareil)), ...(await lignesEffaceesDe(appareil))];
    for (const cellules of (tableau as DataTable).hashes()) {
      const attendue = convertirLigne(cellules);
      assert.ok(
        presentes.some((ligne) => correspond(attendue, ligne)),
        `Ligne absente sur le ${appareil.nom} : ${JSON.stringify(attendue)} ; présentes : ${JSON.stringify(presentes)}`,
      );
    }
  },
  { tableau: true },
);

etapeAssertion(
  /^la liste des modifications non retenues contient exactement (\d+) informations?$/,
  async ({ appareil }, n) => {
    assert.equal((await lignesDe(appareil)).length, Number(n), `Liste du ${appareil.nom}`);
  },
);

etapeAssertion(/^la liste des modifications non retenues est vide$/, async ({ appareil }) => {
  assert.deepEqual(await lignesDe(appareil), [], `Liste du ${appareil.nom}`);
});

etapeAssertion(
  new RegExp(
    `^la liste des modifications non retenues contient toujours la valeur écartée pour ${SUJET} de la tâche ${TEXTE}$`,
  ),
  async ({ appareil }, sujet, intitule) => {
    const information = informationDe(String(sujet));
    const lignes = await lignesDe(appareil);
    assert.ok(
      lignes.some((l) => l.element === intitule && l.information === information),
      `Aucune valeur écartée pour ${String(sujet)} de « ${String(intitule)} » sur le ${appareil.nom}`,
    );
  },
);

// ---------------------------------------------------------------- Construction au banc (N4)

const reglerEcartDeTemps = async (monde: MondeDoneJuan): Promise<void> => {
  await monde.banc.avancerTemps(ECART_ENTRE_APPAREILS);
};

/** Le PC renomme « Plan » (valeur écartée), 10 min plus tard le smartphone le renomme : sa valeur l'emporte. */
const conflitSurIntitule = async (monde: MondeDoneJuan, intitule: string): Promise<void> => {
  const pc = monde.banc.appareil('pc');
  const smartphone = monde.banc.appareil('smartphone');
  const creation = await creerTache(
    { monde, appareil: pc },
    {
      intitule: 'Plan',
      delai: DELAI_DE_DEPART,
      estimationMinutes: ESTIMATION_DE_DEPART,
      objectifs: [],
    },
  );
  assert.ok(creation.ok, `Création de « Plan » refusée : ${JSON.stringify(creation)}`);
  await monde.banc.synchroniserJusquAuRepos();
  smartphone.reseau.couper();
  await renommerTacheAuPasse(monde, pc, 'Plan', 'A');
  await reglerEcartDeTemps(monde);
  await renommerTacheAuPasse(monde, smartphone, 'Plan', intitule);
};

/** Même construction pour le délai : la tâche est créée si elle n'existe pas encore. */
const conflitSurDelai = async (monde: MondeDoneJuan, intitule: string): Promise<void> => {
  const pc = monde.banc.appareil('pc');
  const smartphone = monde.banc.appareil('smartphone');
  if (!(await existeUneTacheIntitulee(pc, intitule))) {
    const creation = await creerTache(
      { monde, appareil: pc },
      {
        intitule,
        delai: DELAI_DE_DEPART,
        estimationMinutes: ESTIMATION_DE_DEPART,
        objectifs: [],
      },
    );
    assert.ok(creation.ok, `Création de « ${intitule} » refusée : ${JSON.stringify(creation)}`);
  }
  await monde.banc.synchroniserJusquAuRepos();
  smartphone.reseau.couper();
  await modifierDelaiTacheAuPasse(monde, pc, intitule, DELAI_DU_PC);
  await reglerEcartDeTemps(monde);
  await modifierDelaiTacheAuPasse(monde, smartphone, intitule, DELAI_DU_SMARTPHONE);
};

etapeContexte(
  new RegExp(
    `^la liste des modifications non retenues contient une valeur écartée pour ${SUJET} de la tâche ${TEXTE}$`,
  ),
  async ({ monde, appareil }, sujet, intitule) => {
    if (sujet === "l'intitulé") await conflitSurIntitule(monde, String(intitule));
    else await conflitSurDelai(monde, String(intitule));
    monde.banc.appareil('smartphone').reseau.retablir();
    await monde.banc.attendreCycles();
    await monde.banc.synchroniserJusquAuRepos();
    const information = informationDe(String(sujet));
    assert.ok(
      (await lignesDe(appareil)).some(
        (l) => l.element === intitule && l.information === information,
      ),
      `Aucune valeur écartée pour ${String(sujet)} de « ${String(intitule)} » sur le ${appareil.nom}`,
    );
  },
);

// ---------------------------------------------------------------- « Compris » (N6)

etapeAction(
  new RegExp(`^l'utilisateur marque comme lue la modification non retenue de la tâche ${TEXTE}$`),
  async ({ appareil }, intitule) => {
    const correspondantes = ((await appareil.vueAffichee()).nonRetenues?.lignes ?? []).filter(
      (ligne) => ligne.element === intitule,
    );
    assert.equal(
      correspondantes.length,
      1,
      `${String(correspondantes.length)} modifications non retenues pour « ${String(intitule)} » sur le ${appareil.nom}`,
    );
    await appareil.controleur.marquerCommeLue(correspondantes.map((ligne) => ligne.id));
    await appareil.vueAffichee();
  },
);
