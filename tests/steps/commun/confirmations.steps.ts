/**
 * Confirmations (glossaire d'étapes §2 et §5 ; conventions.md §8.6 ; ST-socle-ecriture.md §12 n° 5 et 6 ;
 * ST-US-022 §12.1 n° 23, 25, 26).
 * Hypothèse H-5 : sans préfixe, l'action s'applique à l'appareil qui a exactement une confirmation en attente ;
 * elle échoue s'il n'y en a aucune ou plusieurs.
 */
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { construireConfirmationCompte } from '@src/compte/presentation/modeles-de-vue/confirmations-compte';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { estConfirmationRequise, type CommandeEnAttente } from '../../support/commandes-en-attente';
import type { MondeDoneJuan } from '../../support/monde';
import { etapeAction, type ContexteEtape } from '../../support/prefixes';

const appareilAvecUneConfirmation = (monde: MondeDoneJuan): NomAppareil | undefined => {
  const noms = [...monde.commandesEnAttente.keys()];
  return noms.length === 1 ? noms[0] : undefined;
};

const commandeEnAttente = ({ monde, appareil }: ContexteEtape) => {
  const commande = monde.commandesEnAttente.get(appareil.nom);
  if (commande === undefined) {
    throw new Error(`Aucune confirmation en attente sur le ${appareil.nom}`);
  }
  monde.commandesEnAttente.delete(appareil.nom);
  return commande;
};

etapeAction(
  /^l'utilisateur confirme$/,
  async (contexte) => {
    const resultat = await commandeEnAttente(contexte).executer();
    if (resultat.ok && estConfirmationRequise(resultat.valeur)) {
      contexte.monde.commandesEnAttente.set(contexte.appareil.nom, resultat.valeur.suite);
    }
    return resultat;
  },
  { appareilImplicite: appareilAvecUneConfirmation },
);

etapeAction(
  /^l'utilisateur renonce$/,
  (contexte) => {
    commandeEnAttente(contexte);
  },
  { appareilImplicite: appareilAvecUneConfirmation },
);

/** Confirmation affichée par l'appareil qui en a exactement une en attente (H-5), sans la consommer. */
const confirmationAffichee = (monde: MondeDoneJuan): CommandeEnAttente['confirmation'] => {
  const nom = appareilAvecUneConfirmation(monde);
  if (nom === undefined) {
    throw new Error('Aucune confirmation en attente, ou une sur chaque appareil');
  }
  return monde.commandesEnAttente.get(nom)?.confirmation;
};

// ST-US-022 §12.1 n° 23 et 25. Pluriels « (s) » : expressions régulières (conventions.md §11.6).
Then(
  /^une confirmation est demandée, qui annonce (\d+) modifications?(?:\(s\))? enregistrées?(?:\(s\))? dans le Drive à la prochaine connexion sur cet appareil$/,
  function (this: MondeDoneJuan, n: string) {
    assert.deepEqual(confirmationAffichee(this), { code: 'CNF-DECONNEXION', n: Number(n) });
  },
);

Then(
  'une confirmation est demandée, qui précise que les données restent dans le Drive',
  function (this: MondeDoneJuan) {
    const confirmation = confirmationAffichee(this);
    assert.deepEqual(confirmation, { code: 'CNF-SUPPR-DONNEES' });
    assert.match(
      construireConfirmationCompte({ code: 'CNF-SUPPR-DONNEES' }).texte ?? '',
      /Les données restent dans votre Google Drive/,
    );
  },
);

Then(
  /^une confirmation explicite est demandée, qui annonce que (\d+) modifications?(?:\(s\))? seraient perdues$/,
  function (this: MondeDoneJuan, n: string) {
    assert.deepEqual(confirmationAffichee(this), {
      code: 'CNF-SUPPR-DONNEES-PERTE',
      n: Number(n),
    });
  },
);
