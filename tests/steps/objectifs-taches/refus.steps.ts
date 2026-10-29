/**
 * Refus et confirmations des objectifs (glossaire d'étapes v1.4 §9 ; conventions.md §8.5, §8.6 ; ST-US-001 §12
 * n° 13 et 26).
 */
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { messagesDeRefus, type MessageRefus, type RefusMetier } from '@src/objectifs-taches';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAssertion } from '../../support/prefixes';

/** Motif écrit dans les scénarios : « ERR-021, ERR-022 » ou « ERR-030 variante <v> » (guide §6.6.10). */
const motifDe = (messages: ReadonlyArray<MessageRefus>): string =>
  messages
    .map((m) => (m.variante === undefined ? m.code : `${m.code} variante ${m.variante}`))
    .join(', ');

etapeAssertion(
  /^l'enregistrement est refusé avec le motif "([^"]*)"$/,
  ({ monde, appareil }, motif) => {
    const resultat = monde.resultats.get(appareil.nom);
    assert.ok(
      resultat && !resultat.ok,
      `Aucun refus sur le ${appareil.nom} : ${JSON.stringify(resultat)}`,
    );
    assert.equal(motifDe(messagesDeRefus(resultat.erreur as RefusMetier)), motif);
  },
);

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
