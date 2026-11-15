import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { DemandeGis, PasserelleGis, ReponseGis } from './passerelle-gis';
import type { ErreurGis } from './strategie-geste';

// ST-US-022 §4.4 ; DAT §4.1.6 (R12) : Google Identity Services, chargé à la demande, jamais avant le premier geste.
export const URL_SCRIPT_GIS = 'https://accounts.google.com/gsi/client';

type ReponseJetonGis = {
  readonly access_token?: string;
  readonly expires_in?: number | string;
  readonly scope?: string;
  readonly error?: string;
};
type ClientJetonGis = { readonly requestAccessToken: (o: { readonly prompt: string }) => void };
export type GoogleGis = {
  readonly accounts: {
    readonly oauth2: {
      readonly initTokenClient: (configuration: {
        readonly client_id: string;
        readonly scope: string;
        readonly login_hint?: string;
        readonly callback: (reponse: ReponseJetonGis) => void;
        readonly error_callback: (erreur: { readonly type?: string }) => void;
      }) => ClientJetonGis;
    };
  };
};

/** La fenêtre du navigateur, vue avec le script GIS éventuellement chargé (`window.google`). */
const fenetre = (): Window & { readonly google?: GoogleGis } => window;

/** Chargement du script ; undefined s'il est indisponible (hors ligne, bloqué). */
export type ChargeurGis = () => Promise<GoogleGis | undefined>;

export const chargerGisNavigateur: ChargeurGis = () => {
  const dejaCharge = fenetre().google;
  if (dejaCharge !== undefined) return Promise.resolve(dejaCharge);
  if (!navigator.onLine) return Promise.resolve(undefined);
  return new Promise((resoudre) => {
    const script = document.createElement('script');
    script.src = URL_SCRIPT_GIS;
    script.async = true;
    script.onload = () => {
      resoudre(fenetre().google);
    };
    script.onerror = () => {
      script.remove();
      resoudre(undefined);
    };
    document.head.append(script);
  });
};

export const erreurClientGis = (type: string | undefined): ErreurGis => {
  if (type === 'popup_failed_to_open') return { type: 'POPUP_FAILED_TO_OPEN' };
  if (type === 'popup_closed') return { type: 'POPUP_CLOSED' };
  return { type: 'INCONNUE', code: type ?? 'inconnue' };
};

export const lireReponseGis = (reponse: ReponseJetonGis): Resultat<ReponseGis, ErreurGis> => {
  if (reponse.error === 'access_denied') return echec({ type: 'ACCESS_DENIED' });
  if (reponse.error !== undefined || reponse.access_token === undefined) {
    return echec({ type: 'INCONNUE', code: reponse.error ?? 'reponse_sans_jeton' });
  }
  const duree = Number(reponse.expires_in);
  return succes({
    jeton: reponse.access_token,
    ...(Number.isSafeInteger(duree) && duree > 0 ? { expireEnSecondes: duree } : {}),
    portees: (reponse.scope ?? '').split(' ').filter((p) => p !== ''),
  });
};

export class PasserelleGisNavigateur implements PasserelleGis {
  constructor(private readonly charger: ChargeurGis = chargerGisNavigateur) {}

  readonly demanderJeton = async (
    demande: DemandeGis,
  ): Promise<Resultat<ReponseGis, ErreurGis>> => {
    const google = await this.charger();
    if (google === undefined) return echec({ type: 'SCRIPT_INDISPONIBLE' });
    return new Promise((resoudre) => {
      try {
        google.accounts.oauth2
          .initTokenClient({
            client_id: demande.clientId,
            scope: demande.portees.join(' '),
            ...(demande.indice === undefined ? {} : { login_hint: demande.indice }),
            callback: (reponse) => {
              resoudre(lireReponseGis(reponse));
            },
            error_callback: (erreur) => {
              resoudre(echec(erreurClientGis(erreur.type)));
            },
          })
          .requestAccessToken({ prompt: '' });
      } catch {
        resoudre(echec({ type: 'INCONNUE', code: 'exception' }));
      }
    });
  };
}
