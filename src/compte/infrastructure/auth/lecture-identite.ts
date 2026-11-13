import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurAuth } from '../../application/ports/fournisseur-auth';
import { AdresseGoogle, IdCompte, type Identite } from '../../domaine/identite';

// ST-US-022 §6.4, §7 : identité du jeton lue par userinfo (`sub`, `email`) ; NonAutorise → SessionARenouveler.
export const URL_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

export type LectureIdentite = (jeton: string) => Promise<Resultat<Identite, ErreurAuth>>;

const texte = (corps: unknown, nom: string): string =>
  typeof corps === 'object' &&
  corps !== null &&
  typeof (corps as Record<string, unknown>)[nom] === 'string'
    ? ((corps as Record<string, unknown>)[nom] as string)
    : '';

/** Valide la réponse de userinfo ; une réponse inexploitable rend l'accès à renouveler. */
export const identiteDepuisUserinfo = (corps: unknown): Resultat<Identite, ErreurAuth> => {
  const compte = IdCompte.depuisSub(texte(corps, 'sub'));
  const adresse = AdresseGoogle.depuisTexte(texte(corps, 'email'));
  if (!compte.ok || !adresse.ok) {
    return echec({ type: 'SessionARenouveler', code: 'userinfo_invalide' });
  }
  return succes({ compte: compte.valeur, adresse: adresse.valeur });
};

const lireJson = async (reponse: Response): Promise<unknown> => {
  try {
    return await reponse.json();
  } catch {
    return undefined;
  }
};

/** Le jeton est porté par l'en-tête `Authorization`, jamais par l'URL (conventions.md §9.2). */
export const lireIdentiteUserinfo =
  (requeter: typeof fetch): LectureIdentite =>
  async (jeton) => {
    let reponse: Response;
    try {
      reponse = await requeter(URL_USERINFO, { headers: { Authorization: `Bearer ${jeton}` } });
    } catch {
      return echec({ type: 'ReseauIndisponible' });
    }
    if (!reponse.ok) {
      return echec({ type: 'SessionARenouveler', code: `userinfo_${String(reponse.status)}` });
    }
    return identiteDepuisUserinfo(await lireJson(reponse));
  };
