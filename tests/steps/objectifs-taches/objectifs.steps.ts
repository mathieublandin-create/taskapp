/**
 * Étapes des objectifs (glossaire d'étapes v1.4 §7 ; ST-US-001 §12 n° 1 à 12, 14 à 25). Les étapes agissent au niveau
 * des cas d'usage et des modèles de vue, sans interface (conventions.md §9.6). Les étapes des tâches, des
 * sous-objectifs et des deux appareils (n° 32 à 35) sont livrées aux rangs de leurs capacités. Étapes d'US-023
 * (ST-US-023 §12 n° 1 à 13) : section « Sous-objectifs » en fin de fichier.
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import type { Resultat } from '@src/commun/domaine/resultat';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import { ACTIONS_OBJECTIF } from '@src/objectifs-taches/domaine/actions';
import * as interfaceObjectifs from '@src/objectifs-taches';
import { construireConfirmation } from '@src/objectifs-taches';
import { FRAGMENT_DATE } from '../../support/conversions';
import { lObjectifAUnNombreDeTaches } from '../../support/construction-taches';
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
import type { AppareilSimule } from '../../support/banc/appareil-simule';
import { etablirDansLeDrive } from '../../support/synchronisation/echanges';
import { valeurDe } from '../../support/environnement';
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

/**
 * Précondition (H-5 : un état, pas une chronologie) : l'objectif est créé, puis établi comme le serait un état
 * stable, c'est-à-dire enregistré dans le Drive si l'appareil le peut et, avec deux appareils, connu des deux
 * (ST-US-017, rang 3). Hors ligne ou sans accès, il reste en attente.
 */
const creerOuEchouer = async (contexte: ContexteEtape, saisie: SaisieObjectif): Promise<void> => {
  const resultat = await creer(contexte, saisie);
  assert.ok(
    resultat.ok,
    `Création de « ${saisie.intitule} » refusée : ${JSON.stringify(resultat)}`,
  );
  await etablirDansLeDrive(contexte);
};

/** Sans préfixe, avec deux appareils : l'objectif de contexte est créé sur le smartphone puis échangé. */
const SMARTPHONE_PAR_DEFAUT = { appareilImplicite: () => 'smartphone' as const };

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

etapeContexte(
  new RegExp(`^un objectif ${TEXTE} de délai ${DATE}$`),
  (contexte, intitule, delai) =>
    creerOuEchouer(contexte, { intitule: String(intitule), delai: String(delai) }),
  SMARTPHONE_PAR_DEFAUT,
);

etapeContexte(
  new RegExp(`^un objectif ${TEXTE} sans délai$`),
  (contexte, intitule) => creerOuEchouer(contexte, { intitule: String(intitule) }),
  SMARTPHONE_PAR_DEFAUT,
);

etapeContexte(
  new RegExp(`^un objectif ${TEXTE} de délai ${DATE} avec la description ${TEXTE}$`),
  (contexte, intitule, delai, description) =>
    creerOuEchouer(contexte, {
      intitule: String(intitule),
      delai: String(delai),
      description: String(description),
    }),
  SMARTPHONE_PAR_DEFAUT,
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

const mentionsDe = (ligne: Awaited<ReturnType<typeof ligneObjectifDe>>): ReadonlyArray<string> => [
  ...(ligne.delai.type === 'SANS_DELAI' ? [ligne.delai.code] : []),
  ...(ligne.enRetard === undefined ? [] : [ligne.enRetard.code]),
  ...(ligne.attente === undefined ? [] : [ligne.attente.code]),
];

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} porte la mention ${TEXTE}$`),
  async ({ monde, appareil }, intitule, mention) => {
    const codes = mentionsDe(await ligneObjectifDe(monde, appareil, String(intitule)));
    assert.ok(codes.includes(String(mention)), `Mentions de la ligne : ${codes.join(', ')}`);
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} ne porte plus la mention ${TEXTE}$`),
  async ({ monde, appareil }, intitule, mention) => {
    const codes = mentionsDe(await ligneObjectifDe(monde, appareil, String(intitule)));
    assert.ok(!codes.includes(String(mention)), `Mentions de la ligne : ${codes.join(', ')}`);
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

// ---------------------------------------------------------------- Sous-objectifs (US-023, n° 1 à 13)

type SaisieSousObjectif = SaisieObjectif & { readonly parent: string };

const creerSousObjectif = async (
  { monde, appareil }: ContexteEtape,
  saisie: SaisieSousObjectif,
): Promise<Resultat<unknown, unknown>> => {
  const parentId = await resoudreObjectif(monde, appareil, saisie.parent);
  const resultat = await (
    await objectifsDe(appareil)
  ).creerSousObjectif.executer({
    parentId,
    intitule: saisie.intitule,
    ...(saisie.delai === undefined ? {} : { delai: date(saisie.delai) }),
  });
  if (resultat.ok) memoriserObjectif(monde, saisie.intitule.trim(), resultat.valeur);
  return resultat;
};

/** Sans suffixe ou « , sans délai » : sans délai (glossaire §1). */
const SUFFIXE_DELAI = `(?:, (?:sans délai|de délai ${DATE}))?`;

etapeContexte(
  new RegExp(`^un sous-objectif ${TEXTE} de l'objectif ${TEXTE}${SUFFIXE_DELAI}$`),
  async (contexte, intitule, parent, delai) => {
    const saisie = {
      intitule: String(intitule),
      parent: String(parent),
      ...(typeof delai === 'string' ? { delai } : {}),
    };
    const resultat = await creerSousObjectif(contexte, saisie);
    assert.ok(
      resultat.ok,
      `Création de « ${saisie.intitule} » refusée : ${JSON.stringify(resultat)}`,
    );
    await etablirDansLeDrive(contexte);
  },
  SMARTPHONE_PAR_DEFAUT,
);

etapeAction(
  new RegExp(
    `^l'utilisateur crée un sous-objectif ${TEXTE} de l'objectif ${TEXTE}${SUFFIXE_DELAI}$`,
  ),
  (contexte, intitule, parent, delai) =>
    creerSousObjectif(contexte, {
      intitule: String(intitule),
      parent: String(parent),
      ...(typeof delai === 'string' ? { delai } : {}),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur place l'objectif ${TEXTE} sous l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule, parent) =>
    (await objectifsDe(appareil)).placerObjectif.executer({
      objectifId: await resoudreObjectif(monde, appareil, String(intitule)),
      parentId: await resoudreObjectif(monde, appareil, String(parent)),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur fait de l'objectif ${TEXTE} un objectif principal$`),
  async ({ monde, appareil }, intitule) =>
    (await objectifsDe(appareil)).rendreObjectifPrincipal.executer({
      objectifId: await resoudreObjectif(monde, appareil, String(intitule)),
    }),
);

/** Parent effectif de l'objectif dans la vue de l'appareil. */
const parentEffectifDe = async (
  { monde, appareil }: ContexteEtape,
  intitule: string,
): Promise<IdObjectif | undefined> => {
  const id = await resoudreObjectif(monde, appareil, intitule);
  return (await resumesDe(appareil)).find((o) => o.id === id)?.parentId;
};

etapeAssertion(new RegExp(`^${TEXTE} est un objectif principal$`), async (contexte, intitule) => {
  assert.equal(await parentEffectifDe(contexte, String(intitule)), undefined);
});

etapeAssertion(
  new RegExp(`^${TEXTE} est un sous-objectif de l'objectif ${TEXTE}$`),
  async (contexte, intitule, parent) => {
    assert.equal(
      await parentEffectifDe(contexte, String(intitule)),
      await resoudreObjectif(contexte.monde, contexte.appareil, String(parent)),
    );
  },
);

const ligneDeLaListe = (
  { monde, appareil }: ContexteEtape,
  intitule: string,
): LigneListee | undefined => {
  const liste = monde.derniereListeObjectifs.get(appareil.nom);
  assert.ok(liste, "Aucune liste consultée : « l'utilisateur consulte la liste des objectifs »");
  return [...liste.lignes, ...(liste.sectionAtteints?.lignes ?? [])].find(
    (ligne) => ligne.intitule === intitule,
  );
};

etapeAssertion(
  new RegExp(`^la liste présente ${TEXTE} comme objectif principal$`),
  (contexte, intitule) => {
    const ligne = ligneDeLaListe(contexte, String(intitule));
    assert.ok(ligne, `« ${String(intitule)} » absent de la liste`);
    assert.deepEqual([ligne.niveau, ligne.parentId], ['PRINCIPAL', undefined]);
  },
);

etapeAssertion(
  new RegExp(`^la liste présente ${TEXTE} comme sous-objectif de ${TEXTE}$`),
  async (contexte, intitule, parent) => {
    const ligne = ligneDeLaListe(contexte, String(intitule));
    assert.ok(ligne, `« ${String(intitule)} » absent de la liste`);
    assert.deepEqual(
      [ligne.niveau, ligne.parentId],
      ['SOUS_OBJECTIF', await resoudreObjectif(contexte.monde, contexte.appareil, String(parent))],
    );
  },
);

const ACTIONS_NOMMEES: Readonly<Record<string, (typeof ACTIONS_OBJECTIF)[number]>> = {
  'créer un sous-objectif': 'CREER_SOUS_OBJECTIF',
};

etapeAssertion(
  new RegExp(`^l'action ${TEXTE} n'est pas proposée pour l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, action, intitule) => {
    const attendue = ACTIONS_NOMMEES[String(action)];
    assert.ok(attendue, `Action inconnue : ${String(action)}`);
    const detail = await detailObjectifDe(monde, appareil, String(intitule));
    assert.ok(!detail.actions.includes(attendue), `${attendue} est proposée`);
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} porte une alerte de délai qui nomme l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule, parent) => {
    const alerte = (await ligneObjectifDe(monde, appareil, String(intitule))).alerteDelai;
    assert.equal(alerte?.code, 'ALR-007', 'ALR-007 attendue');
    assert.equal(alerte.parent, parent);
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} ne porte aucune alerte de délai$`),
  async ({ monde, appareil }, intitule) => {
    assert.equal((await ligneObjectifDe(monde, appareil, String(intitule))).alerteDelai, undefined);
  },
);

const detailConsulte = ({ monde, appareil }: ContexteEtape) => {
  const detail = monde.dernierDetailObjectif.get(appareil.nom);
  assert.ok(detail, "Aucun détail consulté : « l'utilisateur consulte le détail de l'objectif »");
  return detail;
};

etapeAssertion(
  /^le détail présente les sous-objectifs :$/,
  (contexte, tableau) => {
    const { lignes } = detailConsulte(contexte).sousObjectifs;
    (tableau as DataTable).hashes().forEach((attendu) => {
      const ligne = lignes.find((l) => l.intitule === attendu['intitulé']);
      assert.ok(ligne, `Sous-objectif « ${String(attendu['intitulé'])} » absent du détail`);
      Object.entries(attendu).forEach(([colonne, valeur]) => {
        const extrait = COLONNES_LISTE[colonne];
        assert.ok(extrait, `Colonne inconnue : ${colonne}`);
        assert.equal(extrait(ligne), valeur, `${ligne.intitule}, colonne ${colonne}`);
      });
    });
  },
  { tableau: true },
);

etapeAssertion(
  new RegExp(`^le détail présente le sous-objectif ${TEXTE}$`),
  (contexte, intitule) => {
    assert.ok(
      detailConsulte(contexte).sousObjectifs.lignes.some((l) => l.intitule === intitule),
      `Sous-objectif « ${String(intitule)} » absent du détail`,
    );
  },
);

etapeAssertion(
  new RegExp(`^aucun changement de parent n'est enregistré pour l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, intitule) => {
    const objectifs = await objectifsDe(appareil);
    const id = await resoudreObjectif(monde, appareil, String(intitule));
    const journal = valeurDe(
      await objectifs.consulterHistorique.executer({ type: 'OBJECTIF', id }),
    );
    assert.deepEqual(
      journal.filter((evenement) => evenement.type === 'CHANGEMENT_PARENT'),
      [],
    );
  },
);

etapeAssertion(/^aucun sous-objectif n'a de sous-objectif$/, async ({ appareil }) => {
  const resumes = await resumesDe(appareil);
  const sousObjectifs = new Set(resumes.filter((o) => o.parentId !== undefined).map((o) => o.id));
  assert.deepEqual(
    resumes.filter((o) => o.parentId !== undefined && sousObjectifs.has(o.parentId)),
    [],
  );
});

const hierarchieDe = async (appareil: AppareilSimule): Promise<ReadonlyArray<string>> => {
  const resumes = await resumesDe(appareil);
  return resumes
    .map((o) => `${o.intitule} < ${resumes.find((p) => p.id === o.parentId)?.intitule ?? '-'}`)
    .sort();
};

etapeAssertion(
  /^les deux appareils présentent la même hiérarchie d'objectifs$/,
  async ({ monde }) => {
    const [premier, ...autres] = monde.banc.appareils();
    assert.ok(premier, 'Aucun appareil');
    const reference = await hierarchieDe(premier);
    for (const appareil of autres) assert.deepEqual(await hierarchieDe(appareil), reference);
  },
);

etapeAssertion(/^l'objectif "([^"]*)" n'existe pas$/, async ({ appareil }, intitule) => {
  assert.ok(
    !(await resumesDe(appareil)).some((o) => o.intitule === intitule),
    `Un objectif « ${String(intitule)} » existe`,
  );
});

// ---------------------------------------------------------------- Sous-objectif de contexte (ST-US-003 §12 n° 9)

/** Glossaire §1 (Q-US-003-2) : contenu du « Sous-objectif de <objectif> » selon l'état attendu ; `absent` : aucun. */
const TACHES_DU_SOUS_OBJECTIF: Readonly<
  Record<
    string,
    { readonly aFaire: number; readonly terminees: number; readonly abandonnees: number }
  >
> = {
  atteint: { aFaire: 0, terminees: 1, abandonnees: 0 },
  'en cours': { aFaire: 1, terminees: 0, abandonnees: 0 },
  'à décliner en tâches': { aFaire: 0, terminees: 0, abandonnees: 0 },
};

etapeContexte(
  new RegExp(
    `^l'objectif ${TEXTE} a un sous-objectif (absent|atteint|en cours|à décliner en tâches)$`,
  ),
  async (contexte, objectif, etat) => {
    const taches = TACHES_DU_SOUS_OBJECTIF[String(etat)];
    if (taches === undefined) return;
    const intitule = `Sous-objectif de ${String(objectif)}`;
    const resultat = await creerSousObjectif(contexte, { intitule, parent: String(objectif) });
    assert.ok(resultat.ok, `Création de « ${intitule} » refusée : ${JSON.stringify(resultat)}`);
    await lObjectifAUnNombreDeTaches(contexte, intitule, taches);
  },
  SMARTPHONE_PAR_DEFAUT,
);
