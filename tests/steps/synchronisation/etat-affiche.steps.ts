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
import { listeObjectifsDe, ligneObjectifDe, resumesDe } from '../../support/objectifs';
import { etapeAssertion, etapeContexte } from '../../support/prefixes';
import {
  listeTachesDe,
  ligneTacheDe,
  nombreDeTaches,
  unElementEstEnAttente,
} from '../../support/taches';

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

// ---------------------------------------------------------------- Décompte de l'indicateur (ST-US-017 §12.1 n° 19)

// Pluriel « modification(s) » : expression régulière (conventions.md §11.6).
etapeAssertion(
  /^l'indicateur de synchronisation est "([^"]*)" avec (\d+) modifications?(?:\(s\))? en attente$/,
  async ({ appareil }, code, n) => {
    const indicateur = await indicateurDe(appareil);
    assert.deepEqual([indicateur?.code, indicateur?.n ?? 0], [code, Number(n)]);
  },
);

// ---------------------------------------------------------------- Bandeau « rappel 24 h » (ST-US-018 §12.1 n° 1, 2)

// « Étant donné que sur le smartphone, le bandeau … » et « Alors sur le smartphone, le bandeau … » : même étape.
etapeContexte(
  /^le bandeau "([^"]*)" est affiché avec (\d+) modifications?(?:\(s\))? en attente$/,
  async ({ appareil }, code, n) => {
    const bandeau = await bandeauDe(appareil);
    assert.deepEqual([bandeau?.code, bandeau?.n], [code, Number(n)]);
  },
);

etapeAssertion(/^le bandeau "([^"]*)" est non bloquant$/, async ({ appareil }, code) => {
  const bandeau = await bandeauDe(appareil);
  assert.ok(bandeau, `Aucun bandeau affiché : « ${String(code)} » attendu`);
  assert.deepEqual([bandeau.code, bandeau.bloquant], [code, false]);
});

etapeAssertion(
  /^le bandeau "([^"]*)" variante 24H mentionne (\d+) modifications?(?:\(s\))? en attente$/,
  async ({ appareil }, code, n) => {
    const bandeau = await bandeauDe(appareil);
    assert.deepEqual([bandeau?.code, bandeau?.variante, bandeau?.n], [code, '24H', Number(n)]);
  },
);

etapeAssertion(
  /^le bandeau "([^"]*)" variante 24H n'est pas affiché$/,
  async ({ appareil }, code) => {
    const bandeau = await bandeauDe(appareil);
    const present = bandeau !== undefined && bandeau.code === code && bandeau.variante === '24H';
    assert.ok(!present, `Le bandeau « ${String(code)} » porte la variante 24H`);
  },
);

// ---------------------------------------------------------------- Mention « en attente » (ST-US-017 §12.1 n° 18)

const MENTION_ATTENTE = 'MEN-ATTENTE';

/** Mention `MEN-ATTENTE` de la ligne de l'objectif ou de la tâche (seule mention prise en charge ici). */
const porteLaMention = async (
  { monde, appareil }: Parameters<Parameters<typeof etapeAssertion>[1]>[0],
  nature: string,
  intitule: string,
  mention: string,
): Promise<boolean> => {
  assert.equal(mention, MENTION_ATTENTE, `Mention non prise en charge : ${mention}`);
  const ligne =
    nature === 'objectif'
      ? await ligneObjectifDe(monde, appareil, intitule)
      : await ligneTacheDe(monde, appareil, intitule);
  return ligne.attente?.code === MENTION_ATTENTE;
};

// « l'objectif … porte la mention » est défini avec les objectifs (objectifs.steps.ts, mentions de la ligne).
etapeAssertion(
  /^l'objectif "([^"]*)" (?:ne porte pas|ne porte plus) la mention "([^"]*)"$/,
  async (contexte, intitule, mention) => {
    assert.equal(
      await porteLaMention(contexte, 'objectif', String(intitule), String(mention)),
      false,
      `${String(intitule)} : mention ${String(mention)}`,
    );
  },
);

etapeAssertion(
  /^la tâche "([^"]*)" (porte|ne porte pas|ne porte plus) la mention "([^"]*)"$/,
  async (contexte, intitule, forme, mention) => {
    const porte = await porteLaMention(contexte, 'tâche', String(intitule), String(mention));
    assert.equal(porte, forme === 'porte', `${String(intitule)} : mention ${String(mention)}`);
  },
);

etapeAssertion(/^aucun élément ne porte la mention "([^"]*)"$/, async ({ appareil }, mention) => {
  assert.equal(mention, MENTION_ATTENTE, `Mention non prise en charge : ${String(mention)}`);
  assert.equal(await unElementEstEnAttente(appareil), false);
});

// ---------------------------------------------------------------- État vide de la première connexion (ST-US-022 §12.1)

etapeAssertion(/^aucun objectif et aucune tâche n'existent$/, async ({ appareil }) => {
  assert.deepEqual(await resumesDe(appareil), []);
  assert.equal(await nombreDeTaches(appareil), 0);
});

/** EVD-BIENVENUE propose de créer un premier objectif ou d'ajouter une première tâche (guide §6.6.5). */
etapeAssertion(
  /^l'application propose de créer un premier objectif et d'ajouter une première tâche$/,
  async ({ appareil }) => {
    const liste = await listeTachesDe(appareil, { etat: 'A_FAIRE', objectif: { type: 'TOUS' } });
    assert.equal(liste.etatVide?.code, 'EVD-BIENVENUE');
    assert.equal((await listeObjectifsDe(appareil)).etatVide?.code, 'EVD-OBJECTIFS');
  },
);
