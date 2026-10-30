/**
 * Étapes des tâches (glossaire d'étapes v1.4 §1 et §7 ; ST-US-002 §12 n° 1 à 17, 20, 21). Les étapes agissent au
 * niveau des cas d'usage et des modèles de vue, sans interface (conventions.md §9.6). Les pluriels « (s) » sont des
 * expressions régulières qui acceptent le singulier, le pluriel et la forme littérale (conventions.md §11.6).
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import { construireConfirmation, construireFormulaireTache } from '@src/objectifs-taches';
import {
  convertirDuree,
  FRAGMENT_DATE,
  FRAGMENT_DUREE,
  FRAGMENT_INTITULES,
} from '../../support/conversions';
import {
  creerTache,
  lesTachesSuivantes,
  lireLignesContexte,
  lObjectifAUnNombreDeTaches,
  separerIntitules,
} from '../../support/construction-taches';
import { detailObjectifDe, objectifsDe, resoudreObjectif } from '../../support/objectifs';
import {
  etapeAction,
  etapeAssertion,
  etapeContexte,
  type ContexteEtape,
} from '../../support/prefixes';
import {
  detailTacheDe,
  existeUneTacheIntitulee,
  listeIntitules,
  minutes,
  memoriserTache,
  nombreDeTaches,
  NOMS_ETAT,
  resoudreTache,
  resumeTacheDe,
  tacheExiste,
} from '../../support/taches';
import { date } from '../../support/valeurs';
import { valeurDe } from '../../support/environnement';

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;
const DUREE = `(${FRAGMENT_DUREE})`;
const INTITULES = `(${FRAGMENT_INTITULES})`;
/** Sans préfixe, avec deux appareils : le contexte est établi sur le smartphone puis échangé. */
const SMARTPHONE_PAR_DEFAUT = { appareilImplicite: () => 'smartphone' as const };

const TACHES = 'tâches?(?:\\(s\\))?';

const cellule = (ligne: Record<string, string>, colonne: string): string => ligne[colonne] ?? '';

// ---------------------------------------------------------------- Contexte (n° 1, 2)

etapeContexte(
  /^les tâches suivantes :$/,
  async (contexte, tableau) => {
    await lesTachesSuivantes(contexte, lireLignesContexte(tableau as DataTable));
  },
  { ...SMARTPHONE_PAR_DEFAUT, tableau: true },
);

etapeContexte(
  new RegExp(
    `^l'objectif ${TEXTE} a (\\d+) ${TACHES} à faire, (\\d+) ${TACHES} terminées?(?:\\(s\\))? et (\\d+) ${TACHES} abandonnées?(?:\\(s\\))?$`,
  ),
  (contexte, objectif, aFaire, terminees, abandonnees) =>
    lObjectifAUnNombreDeTaches(contexte, String(objectif), {
      aFaire: Number(aFaire),
      terminees: Number(terminees),
      abandonnees: Number(abandonnees),
    }),
  SMARTPHONE_PAR_DEFAUT,
);

// ---------------------------------------------------------------- Création (n° 3 à 6)

etapeAction(
  /^l'utilisateur crée une tâche :$/,
  async (contexte, tableau) => {
    let dernier;
    for (const ligne of (tableau as DataTable).hashes()) {
      const delai = cellule(ligne, 'délai');
      const estimation = cellule(ligne, 'estimation');
      dernier = await creerTache(contexte, {
        intitule: cellule(ligne, 'intitulé'),
        ...(delai === '' ? {} : { delai }),
        ...(estimation === '' ? {} : { estimationMinutes: convertirDuree(estimation) }),
        objectifs: separerIntitules(cellule(ligne, 'objectifs')),
      });
    }
    return dernier;
  },
  { tableau: true },
);

const INTITULES_INVALIDES: Readonly<Record<string, string>> = {
  vide: '',
  "composé uniquement d'espaces": '   ',
};

etapeAction(
  new RegExp(
    `^l'utilisateur crée une tâche de délai ${DATE}, estimée à ${DUREE}, dont l'intitulé est (vide|composé uniquement d'espaces)$`,
  ),
  (contexte, delai, estimation, description) =>
    creerTache(contexte, {
      intitule: INTITULES_INVALIDES[String(description)] ?? '',
      delai: String(delai),
      estimationMinutes: minutes(estimation),
      objectifs: [],
    }),
);

etapeAction(/^l'utilisateur commence la saisie d'une nouvelle tâche$/, ({ monde, appareil }) => {
  monde.dernierFormulaireTache.set(appareil.nom, construireFormulaireTache({}));
});

const dernierFormulaire = ({ monde, appareil }: ContexteEtape) => {
  const formulaire = monde.dernierFormulaireTache.get(appareil.nom);
  assert.ok(
    formulaire,
    "Aucune saisie commencée : « l'utilisateur commence la saisie d'une nouvelle tâche »",
  );
  return formulaire;
};

etapeAssertion(/^aucun délai n'est présélectionné$/, (contexte) => {
  assert.equal(dernierFormulaire(contexte).delaiPreselectionne, undefined);
});

etapeAssertion(/^aucune estimation n'est présélectionnée$/, (contexte) => {
  assert.equal(dernierFormulaire(contexte).estimationPreselectionnee, undefined);
});

// ---------------------------------------------------------------- Existence et valeurs (n° 7 à 13)

const COLONNES_TACHE: Readonly<
  Record<string, (detail: Awaited<ReturnType<typeof detailTacheDe>>) => string>
> = {
  état: (d) => NOMS_ETAT[d.etat.code] ?? d.etat.code,
  délai: (d) => d.delai.date,
  estimation: (d) => d.estimation.libelle,
  objectifs: (d) => d.objectifs.intitules.join(', '),
  'tâche parente': (d) => d.tacheParente?.intitule ?? '',
};

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} existe avec :$`),
  async ({ monde, appareil }, intitule, tableau) => {
    const detail = await detailTacheDe(monde, appareil, String(intitule));
    for (const attendu of (tableau as DataTable).hashes()) {
      for (const [colonne, valeur] of Object.entries(attendu)) {
        const extrait = COLONNES_TACHE[colonne];
        assert.ok(extrait, `Colonne inconnue : ${colonne}`);
        assert.equal(extrait(detail), valeur, `${String(intitule)}, colonne ${colonne}`);
      }
    }
  },
  { tableau: true },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} existe avec le délai ${DATE}$`),
  async ({ monde, appareil }, intitule, delai) => {
    assert.equal((await detailTacheDe(monde, appareil, String(intitule))).delai.date, delai);
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} existe avec l'estimation ${DUREE}$`),
  async ({ monde, appareil }, intitule, estimation) => {
    const detail = await detailTacheDe(monde, appareil, String(intitule));
    assert.equal(detail.estimation.minutes, minutes(estimation));
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} existe sans objectif$`),
  async ({ monde, appareil }, intitule) => {
    const detail = await detailTacheDe(monde, appareil, String(intitule));
    assert.deepEqual(detail.objectifs.intitules, []);
  },
);

const verifierObjectifs = async (
  { monde, appareil }: ContexteEtape,
  intitule: string,
  attendus: ReadonlyArray<string>,
): Promise<void> => {
  const resume = await resumeTacheDe(monde, appareil, intitule);
  assert.deepEqual(
    resume.objectifs.map((objectif) => objectif.intitule).sort(),
    [...attendus].sort(),
  );
};

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} est rattachée au seul objectif ${TEXTE}$`),
  (contexte, intitule, objectif) =>
    verifierObjectifs(contexte, String(intitule), [String(objectif)]),
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} est rattachée aux objectifs ${INTITULES}$`),
  (contexte, intitule, objectifs) =>
    verifierObjectifs(contexte, String(intitule), listeIntitules(objectifs)),
);

etapeAssertion(
  new RegExp(`^l'estimation de la tâche ${TEXTE} est ${DUREE}$`),
  async ({ monde, appareil }, intitule, estimation) => {
    const detail = await detailTacheDe(monde, appareil, String(intitule));
    assert.equal(detail.estimation.minutes, minutes(estimation));
  },
);

etapeAssertion(
  new RegExp(`^l'estimation initiale de la tâche ${TEXTE} est ${DUREE}$`),
  async ({ monde, appareil }, intitule, estimation) => {
    const detail = await detailTacheDe(monde, appareil, String(intitule));
    assert.equal(detail.estimationInitiale.minutes, minutes(estimation));
  },
);

const intitulesDesAlertes = async (
  { monde, appareil }: ContexteEtape,
  intitule: string,
): Promise<ReadonlyArray<string>> =>
  (await resumeTacheDe(monde, appareil, intitule)).alertes.flatMap((alerte) =>
    alerte.type === 'OBJECTIFS' ? alerte.objectifs.map((objectif) => objectif.intitule) : [],
  );

/** ALR-005 : l'ensemble des objectifs nommés est exactement celui attendu (Q-US-002-2). */
etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} porte une alerte de délai qui nomme l'objectif ${TEXTE}$`),
  async (contexte, intitule, objectif) => {
    assert.deepEqual(await intitulesDesAlertes(contexte, String(intitule)), [String(objectif)]);
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} porte une alerte de délai qui nomme les objectifs ${INTITULES}$`),
  async (contexte, intitule, objectifs) => {
    assert.deepEqual(
      [...(await intitulesDesAlertes(contexte, String(intitule)))].sort(),
      [...listeIntitules(objectifs)].sort(),
    );
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} ne porte aucune alerte de délai$`),
  async ({ monde, appareil }, intitule) => {
    assert.deepEqual((await resumeTacheDe(monde, appareil, String(intitule))).alertes, []);
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} (est|n'est pas) en retard$`),
  async ({ monde, appareil }, intitule, forme) => {
    const resume = await resumeTacheDe(monde, appareil, String(intitule));
    assert.equal(resume.enRetard, forme === 'est');
  },
);

etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} n'existe plus$`),
  async ({ monde, appareil }, intitule) => {
    const id = await resoudreTache(monde, appareil, String(intitule));
    assert.ok(!(await tacheExiste(appareil, id)), `La tâche « ${String(intitule)} » existe encore`);
  },
);

etapeAssertion(new RegExp(`^la tâche ${TEXTE} n'existe pas$`), async ({ appareil }, intitule) => {
  assert.ok(
    !(await existeUneTacheIntitulee(appareil, String(intitule))),
    `Une tâche « ${String(intitule)} » existe`,
  );
});

etapeAssertion(
  new RegExp(`^les tâches ${INTITULES} n'existent plus$`),
  async ({ monde, appareil }, intitules) => {
    for (const intitule of listeIntitules(intitules)) {
      const id = await resoudreTache(monde, appareil, intitule);
      assert.ok(!(await tacheExiste(appareil, id)), `La tâche « ${intitule} » existe encore`);
    }
  },
);

etapeAssertion(/^aucune tâche n'existe$/, async ({ appareil }) => {
  assert.equal(await nombreDeTaches(appareil), 0);
});

// ---------------------------------------------------------------- Modification (n° 14 à 16)

etapeAction(
  new RegExp(`^l'utilisateur renomme la tâche ${TEXTE} en ${TEXTE}$`),
  async ({ monde, appareil }, intitule, nouveau) => {
    const tacheId = await resoudreTache(monde, appareil, String(intitule));
    const resultat = await (
      await objectifsDe(appareil)
    ).renommerTache.executer({ tacheId, intitule: String(nouveau) });
    if (resultat.ok) memoriserTache(monde, String(nouveau).trim(), tacheId);
    return resultat;
  },
);

etapeAction(
  new RegExp(`^l'utilisateur modifie le délai de la tâche ${TEXTE} en ${DATE}$`),
  async ({ monde, appareil }, intitule, delai) =>
    (await objectifsDe(appareil)).modifierDelaiTache.executer({
      tacheId: await resoudreTache(monde, appareil, String(intitule)),
      delai: date(String(delai)),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur modifie l'estimation de la tâche ${TEXTE} en ${DUREE}$`),
  async ({ monde, appareil }, intitule, estimation) =>
    (await objectifsDe(appareil)).modifierEstimationTache.executer({
      tacheId: await resoudreTache(monde, appareil, String(intitule)),
      estimationMinutes: minutes(estimation),
    }),
);

etapeAction(
  new RegExp(`^l'utilisateur (rattache|détache) la tâche ${TEXTE} (?:à|de) l'objectif ${TEXTE}$`),
  async ({ monde, appareil }, verbe, intitule, objectif) => {
    const objectifs = await objectifsDe(appareil);
    const entree = {
      tacheId: await resoudreTache(monde, appareil, String(intitule)),
      objectifId: await resoudreObjectif(monde, appareil, String(objectif)),
    };
    return verbe === 'rattache'
      ? objectifs.rattacherTache.executer(entree)
      : objectifs.detacherTache.executer(entree);
  },
);

// ---------------------------------------------------------------- Suppression (n° 17)

/** `evaluer` doit demander CNF-SUPPR-TACHE (CA-12) ; la commande en attente l'exécute si l'utilisateur confirme. */
const demanderSuppression = async ({ monde, appareil }: ContexteEtape, intitule: string) => {
  const objectifs = await objectifsDe(appareil);
  const tacheId = await resoudreTache(monde, appareil, intitule);
  const evaluation = await objectifs.supprimerTache.evaluer({ tacheId });
  assert.ok(evaluation.ok, `Évaluation refusée : ${JSON.stringify(evaluation)}`);
  assert.equal(evaluation.valeur.type, 'CONFIRMATION_REQUISE', 'CNF-SUPPR-TACHE attendue');
  const modele = construireConfirmation(evaluation.valeur.confirmation);
  monde.commandesEnAttente.set(appareil.nom, {
    description: `Supprimer la tâche « ${intitule} »`,
    confirmation: { code: modele.code, n: Number(modele.variables['n']) },
    executer: () => objectifs.supprimerTache.executer({ tacheId }),
  });
  return evaluation;
};

etapeAction(
  new RegExp(`^l'utilisateur supprime la tâche ${TEXTE} et (confirme|renonce)$`),
  async (contexte, intitule, choix) => {
    const evaluation = await demanderSuppression(contexte, String(intitule));
    const commande = contexte.monde.commandesEnAttente.get(contexte.appareil.nom);
    contexte.monde.commandesEnAttente.delete(contexte.appareil.nom);
    return choix === 'confirme' ? commande?.executer() : evaluation;
  },
);

etapeAction(
  new RegExp(`^l'utilisateur demande la suppression de la tâche ${TEXTE}$`),
  (contexte, intitule) => demanderSuppression(contexte, String(intitule)),
);

// ---------------------------------------------------------------- Détail d'un objectif (n° 20, 21)

const lignesTachesDuDetail = (
  detail: Awaited<ReturnType<typeof detailObjectifDe>>,
): ReadonlyArray<string> =>
  [detail.taches.aFaire, detail.taches.terminees, detail.taches.abandonnees]
    .flatMap((section) => section.lignes)
    .filter((ligne) => ligne.niveau === 'TACHE')
    .map((ligne) => ligne.intitule);

etapeAssertion(
  new RegExp(`^le détail de l'objectif ${TEXTE} présente la tâche ${TEXTE}$`),
  async ({ monde, appareil }, objectif, intitule) => {
    const detail = await detailObjectifDe(monde, appareil, String(objectif));
    assert.ok(
      lignesTachesDuDetail(detail).includes(String(intitule)),
      `La tâche « ${String(intitule)} » est absente du détail de « ${String(objectif)} »`,
    );
  },
);

etapeAssertion(
  new RegExp(`^le détail présente les tâches ${INTITULES}$`),
  ({ monde, appareil }, intitules) => {
    const detail = monde.dernierDetailObjectif.get(appareil.nom);
    assert.ok(detail, "Aucun détail consulté : « l'utilisateur consulte le détail de l'objectif »");
    assert.deepEqual(
      [...lignesTachesDuDetail(detail)].sort(),
      [...listeIntitules(intitules)].sort(),
    );
  },
);

etapeAssertion(
  new RegExp(`^l'objectif ${TEXTE} a toujours (\\d+) ${TACHES} rattachées?(?:\\(s\\))?$`),
  async ({ monde, appareil }, objectif, nombre) => {
    const id = await resoudreObjectif(monde, appareil, String(objectif));
    const detail = valeurDe(
      await (await objectifsDe(appareil)).consulterDetailObjectif.executer(id),
    );
    assert.equal(detail.taches.length, Number(nombre));
  },
);
