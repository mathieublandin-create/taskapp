import { echec, succes, type Resultat } from '../commun/domaine/resultat';

// DAT §4.4.5 ; ST-US-022 §6.8. Erreurs traduites ; aucune exception de fetch ne sort de l'infrastructure.
export type ErreurGoogle =
  | { readonly type: 'ReseauIndisponible' }
  | { readonly type: 'NonAutorise' }
  | { readonly type: 'EspaceDrivePlein' }
  | { readonly type: 'QuotaDepasse' }
  | { readonly type: 'DriveIndisponible'; readonly raison: string }
  | { readonly type: 'RessourceIntrouvable' }
  | { readonly type: 'ErreurServeurDistant'; readonly statut: number };

const RAISONS_DRIVE_PLEIN: ReadonlySet<string> = new Set(['storageQuotaExceeded', 'quotaExceeded']);
const RAISONS_QUOTA: ReadonlySet<string> = new Set(['rateLimitExceeded', 'userRateLimitExceeded']);

const champTexte = (objet: unknown, nom: string): unknown =>
  typeof objet === 'object' && objet !== null ? (objet as Record<string, unknown>)[nom] : undefined;

/** `error.errors[0].reason`, à défaut `error.status` (corps d'erreur JSON de Google). */
const raisonDe = (corps: unknown): string | undefined => {
  const erreur = champTexte(corps, 'error');
  const erreurs = champTexte(erreur, 'errors');
  const raison = Array.isArray(erreurs) ? champTexte(erreurs[0], 'reason') : undefined;
  if (typeof raison === 'string') return raison;
  const statut = champTexte(erreur, 'status');
  return typeof statut === 'string' ? statut : undefined;
};

const traduire403 = (corps: unknown): ErreurGoogle => {
  const raison = raisonDe(corps);
  if (raison !== undefined && RAISONS_DRIVE_PLEIN.has(raison)) return { type: 'EspaceDrivePlein' };
  if (raison !== undefined && RAISONS_QUOTA.has(raison)) return { type: 'QuotaDepasse' };
  return { type: 'DriveIndisponible', raison: raison ?? 'inconnue' };
};

/** Traduit une réponse HTTP non réussie ; `corps` est le JSON d'erreur de Google, s'il existe. */
export const traduireReponse = (statut: number, corps: unknown): ErreurGoogle => {
  if (statut === 401) return { type: 'NonAutorise' };
  if (statut === 403) return traduire403(corps);
  if (statut === 404) return { type: 'RessourceIntrouvable' };
  if (statut === 429) return { type: 'QuotaDepasse' };
  return { type: 'ErreurServeurDistant', statut };
};

/** Délai au-delà duquel une requête est abandonnée (équivaut à un réseau indisponible). */
export const DELAI_REQUETE_GOOGLE_MS = 30_000;

export type RequeteGoogle = {
  readonly methode: 'GET' | 'POST' | 'PATCH';
  readonly url: string;
  readonly corps?: string;
  /** Corps binaire (fichier d'appareil, envoi multipart) ; ignoré si `corps` est fourni (ST-US-017 §7). */
  readonly octets?: Uint8Array;
  readonly typeContenu?: string;
  /** `OCTETS` : le corps d'une réponse réussie est rendu en Uint8Array (`alt=media`) ; JSON par défaut. */
  readonly reponse?: 'JSON' | 'OCTETS';
};

export type ReponseGoogle = {
  readonly statut: number;
  readonly corps: unknown;
  /** En-tête `Date` de la réponse (horloge du serveur, ST-US-017 incrément 4). */
  readonly date: string | undefined;
};

export type DependancesClientGoogle = {
  /** Jeton courant (coffre) ; jamais journalisé. */
  readonly lireJeton: () => string | undefined;
  readonly fetch: typeof fetch;
};

const lireCorps = async (
  reponse: Response,
  lecture: RequeteGoogle['reponse'],
): Promise<unknown> => {
  try {
    if (lecture === 'OCTETS' && reponse.ok) return new Uint8Array(await reponse.arrayBuffer());
    return await reponse.json();
  } catch {
    return undefined;
  }
};

const corpsDe = (requete: RequeteGoogle): { readonly body?: BodyInit } => {
  if (requete.corps !== undefined) return { body: requete.corps };
  if (requete.octets !== undefined) return { body: new Uint8Array(requete.octets) };
  return {};
};

/** ClientGoogle (ST-US-022 §3.2 n° 37) : `Authorization: Bearer`, jamais le jeton dans l'URL (§9.2). */
export class ClientGoogle {
  constructor(private readonly dependances: DependancesClientGoogle) {}

  async executer(requete: RequeteGoogle): Promise<Resultat<ReponseGoogle, ErreurGoogle>> {
    const jeton = this.dependances.lireJeton();
    if (jeton === undefined) return echec({ type: 'NonAutorise' });
    let reponse: Response;
    try {
      reponse = await this.dependances.fetch(requete.url, {
        method: requete.methode,
        headers: {
          Authorization: `Bearer ${jeton}`,
          ...(requete.typeContenu === undefined ? {} : { 'Content-Type': requete.typeContenu }),
        },
        ...corpsDe(requete),
        signal: AbortSignal.timeout(DELAI_REQUETE_GOOGLE_MS),
      });
    } catch {
      return echec({ type: 'ReseauIndisponible' });
    }
    const corps = await lireCorps(reponse, requete.reponse);
    if (!reponse.ok) return echec(traduireReponse(reponse.status, corps));
    return succes({
      statut: reponse.status,
      corps,
      date: reponse.headers.get('Date') ?? undefined,
    });
  }
}
