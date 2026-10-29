/**
 * Étapes des objectifs (glossaire d'étapes v1.4 §7 ; ST-US-001 §12 n° 1 à 12, 14 à 25). Les étapes agissent au niveau
 * des cas d'usage et des modèles de vue, sans interface (conventions.md §9.6). Les étapes des tâches, des
 * sous-objectifs et des deux appareils (n° 32 à 35) sont livrées aux rangs de leurs capacités.
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import type { Resultat } from '@src/commun/domaine/resultat';
import { ACTIONS_OBJECTIF } from '@src/objectifs-taches/domaine/actions';
import * as interfaceObjectifs from '@src/objectifs-taches';
import { construireConfirmation } from '@src/objectifs-taches';
import { FRAGMENT_DATE } from '../../support/conversions';
import {
  detailObjectifDe,
  ligneObjectifDe,
  listeObjectifsDe,
  memoriserObjectif,
  objectifsDe,
  resoudreObjectif,
  resumesDe,
} from '../../support/objectifs';
import {
  etapeAction,
  etapeAssertion,
  etapeContexte,
  type ContexteEtape,
} from '../../support/prefixes';
import { date } from '../../support/valeurs';

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;

// ---------------------------------------------------------------- Création (n° 1 à 6)

type SaisieObjectif = {
  readonly intitule: string;
  readonly delai?: string;
  readonly description?: string;
};

const creer = async (
  { monde, appareil }: ContexteEtape,
  saisie: SaisieObjectif,
): Promise<Resultat<unknown, unknown>> => {
  const resultat = await (
    await objectifsDe(appareil)
  ).creerObjectif.executer({
    intitule: saisie.intitule,
    ...(saisie.delai === undefined ? {} : { delai: date(saisie.delai) }),
    ...(saisie.description === undefined ? {} : { description: saisie.description }),
  });
  if (resultat.ok) memoriserObjectif(monde, saisie.intitule.trim(), resultat.valeur);
  return resultat;
};

const creerOuEchouer = async (contexte: ContexteEtape, saisie: SaisieObjectif): Promise<void> => {
  const resultat = await creer(contexte, saisie);
  assert.ok(
    resultat.ok,
    `Création de « ${saisie.intitule} » refusée : ${JSON.stringify(resultat)}`,
  );
};

etapeAction(
  new RegExp(`^l'utilisateur crée un objectif ${TEXTE} de délai ${DATE}$`),
  (contexte, intitule, delai) =>
    creer(contexte, { intitule: String(intitule), delai: String(delai) }),
);

etapeAction(
  new RegExp(
    `^l'utilisateur crée un objectif ${TEXTE} de délai ${DATE} avec la description ${TEXTE}$`,
  ),
  (contexte, intitule, delai, description) =>
    creer(contexte, {
      intitule: String(intitule),
      delai: String(delai),
      description: String(description),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur crée un objectif ${TEXTE} de délai ${DATE} sans description$`),
  (contexte, intitule, delai) =>
    creer(contexte, { intitule: String(intitule), delai: String(delai) }),
);

etapeAction(
  new RegExp(`^l'utilisateur crée un objectif ${TEXTE} sans délai$`),
  (contexte, intitule) => creer(contexte, { intitule: String(intitule) }),
);

const INTITULES_INVALIDES: Readonly<Record<string, string>> = {
  vide: '',
  "composé uniquement d'espaces": '   ',
};

etapeAction(
  /^l'utilisateur crée un objectif sans délai dont l'intitulé est (vide|composé uniquement d'espaces)$/,
  (contexte, description) =>
    creer(contexte, { intitule: INTITULES_INVALIDES[String(description)] ?? '' }),
);

etapeContexte(new RegExp(`^un objectif ${TEXTE} de délai ${DATE}$`), (contexte, intitule, delai) =>
  creerOuEchouer(contexte, { intitule: String(intitule), delai: String(delai) }),
);

etapeContexte(new RegExp(`^un objectif ${TEXTE} sans délai$`), (contexte, intitule) =>
  creerOuEchouer(contexte, { intitule: String(intitule) }),
);

etapeContexte(
  new RegExp(`^un objectif ${TEXTE} de délai ${DATE} avec la description ${TEXTE}$`),
  (contexte, intitule, delai, description) =>
    creerOuEchouer(contexte, {
      intitule: String(intitule),
      delai: String(delai),
      description: String(description),
    }),
);

// ---------------------------------------------------------------- Modification (n° 7 à 10)

etapeAction(
  new RegExp(`^l'utilisateur renomme l'objectif ${TEXTE} en ${TEXTE}$`),
  async ({ monde, appareil }, intitule, nouveau) => {
    const objectifId = await resoudreObjectif(monde, appareil, String(intitule));
    const resultat = await (
      await objectifsDe(appareil)
    ).renommerObjectif.executer({ objectifId, intitule: String(nouveau) });
    if (resultat.ok) memoriserObjectif(monde, String(nouveau).trim(), objectifId);
    return resultat;
  },
);

etapeAction(
  new RegExp(`^l'utilisateur modifie la description de l'objectif ${TEXTE} en ${TEXTE}$`),
  async ({ monde, appareil }, intitule, description) =>
    (await objectifsDe(appareil)).modifierDescriptionObjectif.executer({
      objectifId: await resoudreObjectif(monde, appareil, String(intitule)),
      description: String(description),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur modifie le délai de l'objectif ${TEXTE} en ${DATE}$`),
  async ({ monde, appareil }, intitule, delai) =>
    (await objectifsDe(appareil)).modifierDelaiObjectif.executer({
      objectifId: await resoudreObjectif(monde, appareil, String(intitule)),
      delai: date(String(delai)),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur retire le délai de l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule) =>
    (await objectifsDe(appareil)).retirerDelaiObjectif.executer({
      objectifId: await resoudreObjectif(monde, appareil, String(intitule)),
    }),
);

// ---------------------------------------------------------------- Suppression (n° 11, 12)

/** `evaluer` doit demander CNF-SUPPR-OBJECTIF (CA-9) ; la commande en attente l'exécute si l'utilisateur confirme. */
const demanderSuppression = async ({ monde, appareil }: ContexteEtape, intitule: string) => {
  const objectifs = await objectifsDe(appareil);
  const objectifId = await resoudreObjectif(monde, appareil, intitule);
  const evaluation = await objectifs.supprimerObjectif.evaluer({ objectifId });
  assert.ok(evaluation.ok, `Évaluation refusée : ${JSON.stringify(evaluation)}`);
  assert.equal(evaluation.valeur.type, 'CONFIRMATION_REQUISE', 'CNF-SUPPR-OBJECTIF attendue');
  const modele = construireConfirmation(evaluation.valeur.confirmation);
  monde.commandesEnAttente.set(appareil.nom, {
    description: `Supprimer l'objectif « ${intitule} »`,
    confirmation: {
      code: modele.code,
      taches: Number(modele.variables['taches']),
      sousObjectifs: Number(modele.variables['sousObjectifs']),
    },
    executer: () => objectifs.supprimerObjectif.executer({ objectifId }),
  });
  return evaluation;
};

etapeAction(
  new RegExp(`^l'utilisateur supprime l'objectif ${TEXTE} et (confirme|renonce)$`),
  async (contexte, intitule, choix) => {
    const evaluation = await demanderSuppression(contexte, String(intitule));
    const commande = contexte.monde.commandesEnAttente.get(contexte.appareil.nom);
    contexte.monde.commandesEnAttente.delete(contexte.appareil.nom);
    return choix === 'confirme' ? commande?.executer() : evaluation;
  },
);

etapeAction(
  new RegExp(`^l'utilisateur demande la suppression de l'objectif ${TEXTE}$`),
  (contexte, intitule) => demanderSuppression(contexte, String(intitule)),
);

// ---------------------------------------------------------------- Existence et valeurs (n° 14 à 17)

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} existe$`),
  async ({ monde, appareil }, intitule) => {
    await detailObjectifDe(monde, appareil, String(intitule));
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} existe avec le délai ${DATE}$`),
  async ({ monde, appareil }, intitule, delai) => {
    const detail = await detailObjectifDe(monde, appareil, String(intitule));
    assert.deepEqual(
      [detail.delai.type, detail.delai.type === 'DATE' ? detail.delai.date : undefined],
      ['DATE', delai],
    );
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} existe sans délai$`),
  async ({ monde, appareil }, intitule) => {
    assert.equal(
      (await detailObjectifDe(monde, appareil, String(intitule))).delai.type,
      'SANS_DELAI',
    );
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} existe sans description$`),
  async ({ monde, appareil }, intitule) => {
    assert.equal(
      (await detailObjectifDe(monde, appareil, String(intitule))).description,
      undefined,
    );
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} a la description ${TEXTE}$`),
  async ({ monde, appareil }, intitule, description) => {
    assert.equal(
      (await detailObjectifDe(monde, appareil, String(intitule))).description,
      description,
    );
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} n'existe plus$`),
  async ({ monde, appareil }, intitule) => {
    const id = await resoudreObjectif(monde, appareil, String(intitule));
    assert.ok(
      !(await resumesDe(appareil)).some((o) => o.id === id),
      `L'objectif « ${String(intitule)} » existe encore`,
    );
  },
);

etapeAssertion(/^aucun objectif n'existe$/, async ({ appareil }) => {
  assert.deepEqual(await resumesDe(appareil), []);
});

etapeAssertion(
  new RegExp(`^il existe (\\d+) objectifs?(?:\\(s\\))? d'intitulé ${TEXTE}$`),
  async ({ appareil }, nombre, intitule) => {
    const trouves = (await resumesDe(appareil)).filter((o) => o.intitule === intitule);
    assert.equal(trouves.length, Number(nombre));
  },
);

// ---------------------------------------------------------------- État, retard et mentions (n° 18 à 20)

const CODES_ETAT: Readonly<Record<string, string>> = {
  'en cours': 'ETA-OBJ-EN-COURS',
  atteint: 'ETA-OBJ-ATTEINT',
  'à décliner en tâches': 'ETA-OBJ-A-DECLINER',
};

etapeAssertion(
  new RegExp(`^l'état de l'objectif ${TEXTE} est ${TEXTE}$`),
  async ({ monde, appareil }, intitule, etat) => {
    const ligne = await ligneObjectifDe(monde, appareil, String(intitule));
    assert.equal(ligne.etat.code, CODES_ETAT[String(etat)], `État attendu : ${String(etat)}`);
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} (est|n'est pas) en retard$`),
  async ({ monde, appareil }, intitule, forme) => {
    const ligne = await ligneObjectifDe(monde, appareil, String(intitule));
    assert.equal(ligne.enRetard !== undefined, forme === 'est');
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} porte la mention ${TEXTE}$`),
  async ({ monde, appareil }, intitule, mention) => {
    const ligne = await ligneObjectifDe(monde, appareil, String(intitule));
    const codes = [
      ...(ligne.delai.type === 'SANS_DELAI' ? [ligne.delai.code] : []),
      ...(ligne.enRetard === undefined ? [] : [ligne.enRetard.code]),
    ];
    assert.ok(codes.includes(mention as never), `Mentions de la ligne : ${codes.join(', ')}`);
  },
);

// ---------------------------------------------------------------- Liste et détail (n° 21 à 25)

etapeAction(/^l'utilisateur consulte la liste des objectifs$/, async ({ monde, appareil }) => {
  monde.derniereListeObjectifs.set(appareil.nom, await listeObjectifsDe(appareil));
});

const COLONNES_LISTE: Readonly<Record<string, (ligne: LigneListee) => string>> = {
  intitulé: (l) => l.intitule,
  délai: (l) => (l.delai.type === 'DATE' ? l.delai.date : 'sans délai'),
  état: (l) => l.etat.libelle.toLowerCase(),
  'en retard': (l) => (l.enRetard === undefined ? 'non' : 'oui'),
  'tâches terminées': (l) => String(l.compteur.terminees),
  'tâches non abandonnées': (l) => String(l.compteur.nonAbandonnees),
};

type LigneListee = Awaited<ReturnType<typeof ligneObjectifDe>>;

etapeAssertion(
  /^la liste des objectifs présente :$/,
  ({ monde, appareil }, tableau) => {
    const liste = monde.derniereListeObjectifs.get(appareil.nom);
    assert.ok(liste, "Aucune liste consultée : « l'utilisateur consulte la liste des objectifs »");
    const lignes = [...liste.lignes, ...(liste.sectionAtteints?.lignes ?? [])];
    (tableau as DataTable).hashes().forEach((attendu) => {
      const ligne = lignes.find((l) => l.intitule === attendu['intitulé']);
      assert.ok(ligne, `Ligne « ${String(attendu['intitulé'])} » absente de la liste`);
      Object.entries(attendu).forEach(([colonne, valeur]) => {
        const extrait = COLONNES_LISTE[colonne];
        assert.ok(extrait, `Colonne inconnue : ${colonne}`);
        assert.equal(extrait(ligne), valeur, `${ligne.intitule}, colonne ${colonne}`);
      });
    });
  },
  { tableau: true },
);

etapeAction(
  new RegExp(`^l'utilisateur consulte le détail de l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule) => {
    monde.dernierDetailObjectif.set(
      appareil.nom,
      await detailObjectifDe(monde, appareil, String(intitule)),
    );
  },
);

etapeAssertion(
  new RegExp(
    `^le détail présente l'intitulé ${TEXTE}, la description ${TEXTE} et le délai ${DATE}$`,
  ),
  ({ monde, appareil }, intitule, description, delai) => {
    const detail = monde.dernierDetailObjectif.get(appareil.nom);
    assert.ok(detail, "Aucun détail consulté : « l'utilisateur consulte le détail de l'objectif »");
    assert.deepEqual(
      [detail.intitule, detail.description, detail.delai.type === 'DATE' ? detail.delai.date : ''],
      [intitule, description, delai],
    );
  },
);

etapeAssertion(
  new RegExp(`^aucune action ne permet à l'utilisateur de saisir l'état de l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule) => {
    const detail = await detailObjectifDe(monde, appareil, String(intitule));
    assert.ok(detail.actions.every((action) => ACTIONS_OBJECTIF.includes(action)));
    assert.deepEqual(
      Object.keys(interfaceObjectifs).filter((nom) => nom.includes('Etat')),
      [],
      "Une commande d'état est exportée par l'interface publique",
    );
  },
);
