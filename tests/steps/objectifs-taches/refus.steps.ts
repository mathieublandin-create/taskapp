/**
 * Refus et confirmations des objectifs (glossaire d'étapes v1.4 §9 ; conventions.md §8.5, §8.6 ; ST-US-001 §12
 * n° 13 et 26).
 */
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { messagesDeRefus, type MessageRefus, type RefusMetier } from '@src/objectifs-taches';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAssertion, type ContexteEtape } from '../../support/prefixes';

/** Motif écrit dans les scénarios : « ERR-021, ERR-022 » ou « ERR-030 variante <v> » (guide §6.6.10). */
const motifDe = (messages: ReadonlyArray<MessageRefus>): string =>
  messages
    .map((m) => (m.variante === undefined ? m.code : `${m.code} variante ${m.variante}`))
    .join(', ');

const verifierRefus = ({ monde, appareil }: ContexteEtape, motif: unknown): void => {
  const resultat = monde.resultats.get(appareil.nom);
  assert.ok(
    resultat && !resultat.ok,
    `Aucun refus sur le ${appareil.nom} : ${JSON.stringify(resultat)}`,
  );
  assert.equal(motifDe(messagesDeRefus(resultat.erreur as RefusMetier)), motif);
};

etapeAssertion(/^l'enregistrement est refusé avec le motif "([^"]*)"$/, verifierRefus);

// ST-US-002 §12 n° 19 : comme l'enregistrement, pour la modification d'une tâche.
etapeAssertion(/^la modification est refusée avec le motif "([^"]*)"$/, verifierRefus);

// ST-US-023 §12 n° 14 : même logique, pour une action autre qu'un enregistrement.
etapeAssertion(/^l'action est refusée avec le motif "([^"]*)"$/, verifierRefus);

// ST-US-024 §12 n° 13 (livrée au rang 3 pour US-022 S11) : dernier résultat de l'appareil = Succes.
etapeAssertion(/^l'opération est acceptée$/, ({ monde, appareil }) => {
  const resultat = monde.resultats.get(appareil.nom);
  assert.ok(resultat?.ok, `Opération refusée sur le ${appareil.nom} : ${JSON.stringify(resultat)}`);
});

/** L'appareil qui a exactement une confirmation en attente (H-5, sans la consommer). */
const confirmationAffichee = (monde: MondeDoneJuan) => {
  const noms = [...monde.commandesEnAttente.keys()];
  const nom = noms.length === 1 ? noms[0] : undefined;
  assert.ok(nom, 'Aucune confirmation en attente, ou une sur chaque appareil');
  return monde.commandesEnAttente.get(nom)?.confirmation;
};

// Pluriels « (s) » : expression régulière (conventions.md §11.6).
Then(
  /^une confirmation est demandée, qui annonce (\d+) tâches?(?:\(s\))? détachées?(?:\(s\))? et (\d+) sous-objectifs?(?:\(s\))? devenus?(?:\(s\))? objectifs? principal$/,
  function (this: MondeDoneJuan, taches: string, sousObjectifs: string) {
    assert.deepEqual(confirmationAffichee(this), {
      code: 'CNF-SUPPR-OBJECTIF',
      taches: Number(taches),
      sousObjectifs: Number(sousObjectifs),
    });
  },
);

// ST-US-002 §12 n° 18 : CNF-SUPPR-TACHE et le nombre de sous-tâches annoncé (variable `n`).
Then(
  /^une confirmation est demandée, qui annonce (\d+) sous-tâches?(?:\(s\))? supprimées?(?:\(s\))? avec la tâche$/,
  function (this: MondeDoneJuan, n: string) {
    assert.deepEqual(confirmationAffichee(this), { code: 'CNF-SUPPR-TACHE', n: Number(n) });
  },
);

// ST-US-024 §12 n° 12 : CNF-AJOUT-SOUS-TACHE-TERMINEE (rang 6) ; CNF-ROUVRIR-SOUS-TACHE s'y ajoute au rang 7.
Then(
  /^une confirmation est demandée, qui annonce la réouverture de la tâche "([^"]*)"$/,
  function (this: MondeDoneJuan, tache: string) {
    assert.deepEqual(confirmationAffichee(this), {
      code: 'CNF-AJOUT-SOUS-TACHE-TERMINEE',
      element: tache,
    });
  },
);
