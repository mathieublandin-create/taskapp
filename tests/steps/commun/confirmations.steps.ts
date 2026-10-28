/**
 * Confirmations (glossaire d'étapes §2 et §5 ; conventions.md §8.6 ; ST-socle-ecriture.md §12 n° 5 et 6).
 * Hypothèse H-5 : sans préfixe, l'action s'applique à l'appareil qui a exactement une confirmation en attente ;
 * elle échoue s'il n'y en a aucune ou plusieurs.
 */
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { estConfirmationRequise } from '../../support/commandes-en-attente';
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
