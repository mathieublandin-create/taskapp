/**
 * Outils des étapes du compte (ST-US-022 §12.1, §12.3) : connexion pilotée par le Google simulé, dernier échec de
 * connexion, racine et écran de connexion construits comme l'interface, commandes de sortie (déconnexion,
 * suppression des données de l'appareil) et lecture des espaces d'un appareil.
 */
import assert from 'node:assert/strict';
import { succes, type Resultat } from '@src/commun/domaine/resultat';
import type { MotifEchecConnexion } from '@src/compte/domaine/motif-connexion';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import {
  construireEcranConnexion,
  type ModeleVueConnexion,
} from '@src/compte/presentation/modeles-de-vue/ecran-connexion';
import {
  construireRacine,
  type ModeleVueRacine,
} from '@src/compte/presentation/modeles-de-vue/racine';
import type { Application } from '@src/composition/application';
import { decompterModificationsEnAttente } from '@src/synchronisation/domaine/index-en-attente';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { ENV_BANC, type AppareilSimule } from '../banc/appareil-simule';
import type { CommandeEnAttente, ConfirmationRequise } from '../commandes-en-attente';
import type { MondeDoneJuan } from '../monde';

export type Refus = 'annule la connexion' | 'refuse les autorisations demandées';

/** Configure Google pour le compte puis lance SeConnecter, en laissant passer le temps des reprises (§6.8) ; attend le cycle qui suit. */
export const seConnecter = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  nomCompte: string,
  refus?: Refus,
): Promise<Resultat<unknown, unknown>> => {
  const identite = monde.banc.google.identite(nomCompte);
  const application = await appareil.assurerOuverte();
  if (refus === 'refuse les autorisations demandées') {
    appareil.fournisseur.accorder(identite, ['openid', 'email']);
  } else {
    appareil.fournisseur.accorder(identite);
  }
  if (refus === 'annule la connexion') appareil.fournisseur.fermerLaProchaineFenetre();
  const resultat = await monde.banc.executerEnLaissantPasserLeTemps(
    application.seConnecter.executer(),
  );
  // ST-US-017 §12.3 : le cycle lancé par la connexion est attendu.
  await appareil.attendreCycle();
  return resultat;
};

/** Session Google active et connexion réussie du compte sur l'appareil (§12.1 n° 1, 2). */
export const connecter = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  nomCompte: string,
): Promise<void> => {
  appareil.fournisseur.sessionGoogle(monde.banc.google.identite(nomCompte));
  const resultat = await seConnecter(monde, appareil, nomCompte);
  assert.ok(
    resultat.ok,
    `Connexion du compte ${nomCompte} impossible : ${JSON.stringify(resultat)}`,
  );
};

/** Motif du dernier échec de connexion de l'appareil (dernier résultat), s'il y en a un. */
export const dernierEchecConnexion = (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
): MotifEchecConnexion | undefined => {
  const resultat = monde.resultats.get(appareil.nom);
  if (resultat === undefined || resultat.ok) return undefined;
  const erreur = resultat.erreur as { readonly type?: unknown; readonly motif?: unknown };
  return erreur.type === 'ConnexionImpossible' ? (erreur.motif as MotifEchecConnexion) : undefined;
};

export const racineDe = async (appareil: AppareilSimule): Promise<ModeleVueRacine> =>
  construireRacine((await appareil.assurerOuverte()).session.etat());

export const ecranConnexionDe = (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
): ModeleVueConnexion => {
  const motif = dernierEchecConnexion(monde, appareil);
  return construireEcranConnexion(
    motif === undefined ? { enCours: false } : { dernierEchec: motif, enCours: false },
  );
};

/** Suite « Supprimer quand même » (CNF-SUPPR-DONNEES-PERTE) d'une confirmation de suppression (§12.3). */
const suiteSuppression = async (
  application: Application,
  etape: () => ReturnType<Application['supprimerDonnees']['confirmer']>,
): Promise<Resultat<unknown, unknown>> => {
  // Sans avance du temps : la suppression n'attend pas de délai ; ERR-017 (5 s) est couvert par UT-US-022-57, 61.
  const resultat = await etape();
  if (!resultat.ok || resultat.valeur.type !== 'CONFIRMATION_REQUISE') return resultat;
  const suite: ConfirmationRequise = {
    type: 'CONFIRMATION_REQUISE',
    suite: {
      description: 'Supprimer quand même',
      confirmation: resultat.valeur.confirmation,
      executer: () =>
        suiteSuppression(application, () => application.supprimerDonnees.confirmerPerte()),
    },
  };
  return succes(suite);
};

/** Commande en attente « Supprimer les données » (CNF-SUPPR-DONNEES), confirmée par « l'utilisateur confirme ». */
export const commandeSuppression = (application: Application): CommandeEnAttente => ({
  description: 'Supprimer les données de cet appareil',
  confirmation: { code: 'CNF-SUPPR-DONNEES' },
  executer: () => suiteSuppression(application, () => application.supprimerDonnees.confirmer()),
});

/** Nom de la base de l'espace du compte sur le banc. */
export const nomEspaceDuCompte = async (monde: MondeDoneJuan, nomCompte: string): Promise<string> =>
  nomEspace(ENV_BANC, monde.banc.google.identite(nomCompte).compte);

export const espaceExiste = async (appareil: AppareilSimule, nomBase: string): Promise<boolean> =>
  (await appareil.fabrique.databases()).some((b) => b.name === nomBase);

/**
 * Lit l'espace du compte dans l'IDBFactory de l'appareil, sans le créer ni le modifier, et rend le nombre de
 * modifications en attente (décompte du socle) ; échec si l'espace est absent ou illisible (§12.1 n° 28).
 */
export const modificationsEnAttenteDansEspace = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  nomCompte: string,
): Promise<number> => {
  const nomBase = await nomEspaceDuCompte(monde, nomCompte);
  assert.ok(
    await espaceExiste(appareil, nomBase),
    `Espace du compte ${nomCompte} absent du ${appareil.nom}`,
  );
  const espace = await DepotLocalDexie.ouvrirEspace({
    nomBase,
    fabrique: appareil.fabrique,
    generateur: { genererUuidV7: () => assert.fail('espace recréé') },
  });
  assert.ok(espace.ok, `Espace du compte ${nomCompte} illisible`);
  try {
    const etat = await espace.valeur.lire();
    assert.ok(etat.ok, `Espace du compte ${nomCompte} illisible`);
    return decompterModificationsEnAttente(etat.valeur.enAttente);
  } finally {
    espace.valeur.fermer();
  }
};
