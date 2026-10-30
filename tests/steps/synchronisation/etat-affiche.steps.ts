/**
 * État de synchronisation affiché (glossaire d'étapes §6 ; ST-US-022 §12.1 n° 39, 40) : indicateur et bandeau,
 * vérifiés par les modèles de vue `construireIndicateur` et `construireBandeau`, construits comme l'interface à
 * partir de `consulterEtatSynchronisation` et de l'horloge de l'appareil.
 */
import assert from 'node:assert/strict';
import {
  construireBandeau,
  type ModeleVueBandeau,
} from '@src/synchronisation/presentation/modeles-de-vue/bandeau';
import {
  construireIndicateur,
  type ModeleVueIndicateur,
} from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import { formaterAnciennete } from '@src/commun/presentation/format/heure';
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { racineDe } from '../../support/compte/etapes-compte';
import { convertirAppareil } from '../../support/conversions';
import { listeObjectifsDe } from '../../support/objectifs';
import { etapeAssertion } from '../../support/prefixes';

/** Libellés des actions (guide §6.6.2, §6.6.3) ↦ codes des modèles de vue. */
const ACTIONS: Readonly<Record<string, string>> = {
  'Reprendre la synchronisation': 'REPRENDRE_LA_SYNCHRONISATION',
  'Se reconnecter': 'SE_RECONNECTER',
  'Mettre à jour': 'METTRE_A_JOUR',
};

const codeAction = (libelle: unknown): string => {
  const code = ACTIONS[String(libelle)];
  if (code === undefined) throw new Error(`Action inconnue : « ${String(libelle)} »`);
  return code;
};

// ANO-001 (ST-US-017 §12.4) : sous `@ANO-001`, l'indicateur est celui de la vue affichée par le contrôleur,
// jamais rafraîchie par le step ; ailleurs, celui que donne l'état courant.
const indicateurDe = async (
  appareil: AppareilSimule,
  lectureAffichee = false,
): Promise<ModeleVueIndicateur | undefined> => {
  if (lectureAffichee) return (await appareil.vueAffichee()).indicateur;
  const etat = await (await appareil.assurerOuverte()).consulterEtat();
  return etat === undefined ? undefined : construireIndicateur(etat);
};

const bandeauDe = async (appareil: AppareilSimule): Promise<ModeleVueBandeau | undefined> => {
  const etat = await (await appareil.assurerOuverte()).consulterEtat();
  return etat === undefined ? undefined : construireBandeau(etat, appareil.horloge.maintenant());
};

// ---------------------------------------------------------------- Indicateur (n° 39)

etapeAssertion(
  /^l'indicateur de synchronisation est "([^"]*)", avec l'action "([^"]*)"$/,
  async ({ monde, appareil }, code, action) => {
    const indicateur = await indicateurDe(appareil, monde.lectureAffichee);
    assert.deepEqual([indicateur?.code, indicateur?.action], [code, codeAction(action)]);
  },
);

etapeAssertion(
  /^l'indicateur de synchronisation est (?:toujours )?"([^"]*)"$/,
  async ({ monde, appareil }, code) => {
    assert.equal((await indicateurDe(appareil, monde.lectureAffichee))?.code, code);
  },
);

etapeAssertion(
  /^l'indicateur de synchronisation n'est (?:plus|pas) "([^"]*)"$/,
  async ({ monde, appareil }, code) => {
    assert.notEqual((await indicateurDe(appareil, monde.lectureAffichee))?.code, code);
  },
);

// ANO-001 (ST-US-017 §12.4 n° 5 et 6) : feuille « Compte et synchronisation » lue dans la vue affichée, quel que soit le tag.
etapeAssertion(
  /^l'indicateur de synchronisation indique un dernier échange à l'instant$/,
  async ({ appareil }) => {
    const t = appareil.horloge.maintenant();
    const libelle = (await appareil.vueAffichee()).feuille?.dernierEchange?.libelle;
    assert.ok(
      libelle?.includes(formaterAnciennete(t, t)),
      `Dernier échange affiché : ${String(libelle)}`,
    );
  },
);

etapeAssertion(
  /^la feuille "Compte et synchronisation" indique (\d+) modifications? en attente$/,
  async ({ appareil }, n) => {
    const attente = (await appareil.vueAffichee()).feuille?.attente;
    const attendu = Number(n);
    if (attendu === 0) assert.equal(attente?.code, 'SYN-FEUILLE-RIEN-EN-ATTENTE');
    else {
      assert.equal(attente?.code, 'SYN-FEUILLE-EN-ATTENTE');
      assert.equal(attente.n, attendu);
    }
  },
);

// ---------------------------------------------------------------- Bandeau (n° 40)

etapeAssertion(
  /^le bandeau "([^"]*)" est affiché, avec l'action "([^"]*)"$/,
  async ({ appareil }, code, action) => {
    const bandeau = await bandeauDe(appareil);
    assert.deepEqual([bandeau?.code, bandeau?.action], [code, codeAction(action)]);
  },
);

etapeAssertion(/^le bandeau "([^"]*)" n'est pas affiché$/, async ({ appareil }, code) => {
  assert.notEqual((await bandeauDe(appareil))?.code, code);
});

etapeAssertion(/^aucun bandeau n'est affiché$/, async ({ appareil }) => {
  assert.equal(await bandeauDe(appareil), undefined);
});

// Le modèle de vue n'en construit jamais plus d'un (DEC-025) : il en faut un.
etapeAssertion(/^un seul bandeau est affiché$/, async ({ appareil }) => {
  assert.notEqual(await bandeauDe(appareil), undefined, 'Aucun bandeau affiché');
});

// ---------------------------------------------------------------- Mention « heure de Paris » (ST-US-017 §12 n° 23)

// RL-LOT-001-P3 : la liste des objectifs porte la puce ; la liste « Tâches » et la ligne « Fuseau » ne sont pas vérifiées ici.
etapeAssertion(
  /^la mention "([^"]*)" (apparaît|n'apparaît pas)$/,
  async ({ appareil }, code, presence) => {
    assert.equal(code, 'MEN-HEURE-PARIS', `Mention non prise en charge : ${String(code)}`);
    const liste = await listeObjectifsDe(appareil);
    assert.equal(liste.mentionHeureParis?.code === 'MEN-HEURE-PARIS', presence === 'apparaît');
  },
);

// ---------------------------------------------------------------- Ouverture et feuille (ST-US-017 §12.1 n° 10, 21)

// Glossaire v1.10 §12 : l'instantané d'ouverture est produit avant toute réponse du Drive à l'appareil ; l'étape
// échoue tant que la racine est ATTENTE_GOOGLE (écran SYN-REDIRECTION).
etapeAssertion(
  /^les données présentes sur le (smartphone|PC) s'affichent aussitôt$/,
  async ({ monde }, nomAppareil) => {
    const appareil = monde.banc.appareil(convertirAppareil(String(nomAppareil)));
    const instantane = appareil.instantaneOuverture;
    assert.ok(instantane, `Aucune ouverture du ${appareil.nom}`);
    assert.equal(instantane.racine.ecran, 'APPLICATION', `Racine : ${instantane.racine.ecran}`);
    assert.ok(instantane.intitules !== undefined, `Aucune donnée affichée sur le ${appareil.nom}`);
    assert.equal((await racineDe(appareil)).ecran, 'APPLICATION');
  },
);

// n° 21 : message de la feuille porté par l'indicateur (ERR-011 au rang 3).
etapeAssertion(
  /^le message d'erreur "([^"]*)" (est|n'est pas) affiché$/,
  async ({ appareil }, code, forme) => {
    const message = (await indicateurDe(appareil))?.messageFeuille;
    if (forme === 'est') assert.equal(message, code);
    else assert.notEqual(message, code);
  },
);
