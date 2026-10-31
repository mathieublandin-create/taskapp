/**
 * Étapes de la liste « Tâches » (glossaire d'étapes v1.4 §7 ; ST-US-002 §12 n° 22 à 27). La liste est construite
 * comme l'interface, par `construireListeTaches` sur le résultat de `ConsulterTaches`.
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import { FILTRE_ETAT_PAR_DEFAUT, type ActionTache, type LigneTache } from '@src/objectifs-taches';
import { FRAGMENT_INTITULES } from '../../support/conversions';
import { etapeAction, etapeAssertion } from '../../support/prefixes';
import {
  derniereListe,
  detailTacheDe,
  FILTRES_ETAT,
  listeIntitules,
  listeTachesDe,
  NOMS_ETAT,
  resoudreTache,
} from '../../support/taches';

const TEXTE = '"([^"]*)"';
const INTITULES = `(${FRAGMENT_INTITULES})`;

etapeAction(/^l'utilisateur consulte la liste des tâches$/, async ({ monde, appareil }) => {
  monde.filtreEtatTaches.set(appareil.nom, FILTRE_ETAT_PAR_DEFAUT);
  monde.derniereListeTaches.set(
    appareil.nom,
    await listeTachesDe(appareil, { etat: FILTRE_ETAT_PAR_DEFAUT, objectif: { type: 'TOUS' } }),
  );
});

/** Toute valeur autre que « à faire », « terminée » ou « abandonnée » fait échouer l'étape. */
etapeAction(
  new RegExp(`^l'utilisateur filtre les tâches sur l'état ${TEXTE}$`),
  async ({ monde, appareil }, etat) => {
    const filtre = FILTRES_ETAT[String(etat)];
    assert.ok(filtre, `Filtre d'état inconnu : « ${String(etat)} »`);
    monde.filtreEtatTaches.set(appareil.nom, filtre);
    monde.derniereListeTaches.set(
      appareil.nom,
      await listeTachesDe(appareil, { etat: filtre, objectif: { type: 'TOUS' } }),
    );
  },
);

etapeAssertion(
  new RegExp(`^le filtre d'état de la liste des tâches est ${TEXTE}$`),
  ({ monde, appareil }, etat) => {
    assert.equal(derniereListe(monde, appareil).filtreEtat, FILTRES_ETAT[String(etat)]);
  },
);

const COLONNES_LISTE: Readonly<Record<string, (ligne: LigneTache) => string>> = {
  intitulé: (l) => l.intitule,
  délai: (l) => l.delai.date,
  estimation: (l) => l.estimation.libelle,
  état: (l) => NOMS_ETAT[l.etat.code] ?? l.etat.code,
  objectifs: (l) => l.objectifs.join(', '),
  'en retard': (l) => (l.enRetard === undefined ? 'non' : 'oui'),
};

/** Ordre exact des lignes ; seules les colonnes présentes dans le tableau sont comparées. */
etapeAssertion(
  /^la liste des tâches présente, dans cet ordre :$/,
  ({ monde, appareil }, tableau) => {
    const attendues = (tableau as DataTable).hashes();
    const { lignes } = derniereListe(monde, appareil);
    assert.deepEqual(
      lignes.map((l) => l.intitule),
      attendues.map((a) => a['intitulé']),
    );
    attendues.forEach((attendu, rang) => {
      const ligne = lignes[rang];
      assert.ok(ligne);
      for (const [colonne, valeur] of Object.entries(attendu)) {
        const extrait = COLONNES_LISTE[colonne];
        assert.ok(extrait, `Colonne inconnue : ${colonne}`);
        assert.equal(extrait(ligne), valeur, `${ligne.intitule}, colonne ${colonne}`);
      }
    });
  },
  { tableau: true },
);

etapeAssertion(
  new RegExp(`^la liste des tâches contient exactement ${INTITULES}$`),
  ({ monde, appareil }, intitules) => {
    assert.deepEqual(
      derniereListe(monde, appareil)
        .lignes.map((l) => l.intitule)
        .sort(),
      [...listeIntitules(intitules)].sort(),
    );
  },
);

etapeAssertion(/^la liste des tâches est vide$/, ({ monde, appareil }) => {
  assert.deepEqual(derniereListe(monde, appareil).lignes, []);
});

/** Union des lignes des trois filtres d'état avec le filtre d'objectif « Sans objectif ». */
etapeAssertion(
  new RegExp(`^la tâche ${TEXTE} (figure|ne figure pas) parmi les tâches sans objectif$`),
  async ({ monde, appareil }, intitule, forme) => {
    const id = await resoudreTache(monde, appareil, String(intitule));
    const ids = new Set<string>();
    for (const etat of Object.values(FILTRES_ETAT)) {
      const liste = await listeTachesDe(appareil, { etat, objectif: { type: 'SANS_OBJECTIF' } });
      liste.lignes.forEach((ligne) => ids.add(ligne.id));
    }
    assert.equal(ids.has(id), forme === 'figure');
  },
);

// ST-US-024 §12 n° 9 : `LigneTache.compteurSousTaches` du dernier modèle de liste.
etapeAssertion(
  new RegExp(
    `^dans la liste des tâches, la tâche ${TEXTE} indique (\\d+) sous-tâches?(?:\\(s\\))? terminées?(?:\\(s\\))? sur (\\d+) sous-tâches?(?:\\(s\\))? non abandonnées?(?:\\(s\\))?$`,
  ),
  ({ monde, appareil }, intitule, terminees, nonAbandonnees) => {
    const ligne = derniereListe(monde, appareil).lignes.find((l) => l.intitule === intitule);
    assert.ok(ligne, `La tâche « ${String(intitule)} » est absente de la liste`);
    assert.deepEqual(
      ligne.compteurSousTaches && {
        terminees: ligne.compteurSousTaches.terminees,
        nonAbandonnees: ligne.compteurSousTaches.nonAbandonnees,
      },
      { terminees: Number(terminees), nonAbandonnees: Number(nonAbandonnees) },
    );
  },
);

// ST-US-024 §12 n° 11 : liste fermée des actions nommées ; « terminer », « rouvrir » (rang 7), « abandonner »,
// « reprendre » (rang 8) s'y ajoutent avec leurs rangs.
const ACTIONS_TACHE: Readonly<Record<string, ActionTache>> = {
  'créer une sous-tâche': 'CREER_SOUS_TACHE',
};

const verifierAction =
  (proposee: boolean) =>
  async (
    { monde, appareil }: Parameters<Parameters<typeof etapeAssertion>[1]>[0],
    action: unknown,
    intitule: unknown,
  ) => {
    const attendue = ACTIONS_TACHE[String(action)];
    assert.ok(attendue, `Action inconnue : ${String(action)}`);
    const { actions } = await detailTacheDe(monde, appareil, String(intitule));
    assert.equal(
      actions.includes(attendue),
      proposee,
      `${attendue} : proposée = ${String(!proposee)}`,
    );
  };

etapeAssertion(
  new RegExp(`^l'action ${TEXTE} n'est pas proposée pour la tâche ${TEXTE}$`),
  verifierAction(false),
);

etapeAssertion(
  new RegExp(`^l'action ${TEXTE} est proposée pour la tâche ${TEXTE}$`),
  verifierAction(true),
);
