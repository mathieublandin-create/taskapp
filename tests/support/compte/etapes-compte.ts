/**
 * Outils des étapes du compte (ST-US-022 §12.1, §12.3) : connexion pilotée par le Google simulé, dernier échec de
 * connexion, racine et écran de connexion construits comme l'interface.
 */
import type { Resultat } from '@src/commun/domaine/resultat';
import type { MotifEchecConnexion } from '@src/compte/domaine/motif-connexion';
import {
  construireEcranConnexion,
  type ModeleVueConnexion,
} from '@src/compte/presentation/modeles-de-vue/ecran-connexion';
import {
  construireRacine,
  type ModeleVueRacine,
} from '@src/compte/presentation/modeles-de-vue/racine';
import type { AppareilSimule } from '../banc/appareil-simule';
import type { MondeDoneJuan } from '../monde';

export type Refus = 'annule la connexion' | 'refuse les autorisations demandées';

/** Configure Google pour le compte puis lance SeConnecter, en laissant passer le temps des reprises (§6.8). */
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
  return monde.banc.executerEnLaissantPasserLeTemps(application.seConnecter.executer());
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
